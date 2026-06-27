import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { sendWelcomeEmail, sendAutoMagicLinkEmail } from "../_shared/welcomeEmail.ts";
import { assertOfficialSupabaseProject } from "../_shared/officialProjectGuard.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-hotmart-hottok, h-hotmart-h-token",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const logStep = (step: string, details?: any) => {
  const d = details ? ` - ${JSON.stringify(details)}` : "";
  console.log(`[HOTMART-WEBHOOK] ${step}${d}`);
};

const redactEmail = (e?: string | null) =>
  !e ? "(no-email)" : `${e.slice(0, 2)}***@${e.split("@")[1] ?? "?"}`;

// Canonical Hotmart Elite product ID (same set used by fabricaAccess.ts).
// When Hotmart product matches the Elite list, we persist this ID in
// `subscriptions.product_id` without colliding with Stripe Start products.
const CANONICAL_ELITE_PRODUCT_ID = "hotmart_elite";

// Read secret-driven lists of Hotmart product IDs (comma-separated).
const parseList = (raw?: string | null) =>
  new Set((raw ?? "").split(",").map((s) => s.trim()).filter(Boolean));

const HOTMART_ELITE_PRODUCT_IDS = parseList(Deno.env.get("HOTMART_ELITE_PRODUCT_IDS") || "");
["7876791", "C106141067C"].forEach((productId) => HOTMART_ELITE_PRODUCT_IDS.add(productId));

function resolveTier(hotmartProductId: string | null): { plan: "Elite" | "Unknown"; canonical_product_id: string | null } {
  if (!hotmartProductId) return { plan: "Unknown", canonical_product_id: null };
  if (HOTMART_ELITE_PRODUCT_IDS.has(hotmartProductId.trim())) {
    return { plan: "Elite", canonical_product_id: CANONICAL_ELITE_PRODUCT_ID };
  }
  // Se não estiver na lista HOTMART_ELITE_PRODUCT_IDS, é um produto de fora (ex: pacote 150 vídeos). Bloqueia.
  return { plan: "Unknown", canonical_product_id: null };
}

function parsePurchaseDate(raw: unknown): string {
  if (typeof raw === "number") return new Date(raw).toISOString();
  if (typeof raw === "string" && raw.trim()) {
    const parsed = new Date(raw);
    if (!Number.isNaN(parsed.getTime())) return parsed.toISOString();
  }
  return new Date().toISOString();
}

function resolvePurchaseStatus(event: string, rawStatus: unknown): string {
  const status = typeof rawStatus === "string" ? rawStatus.toUpperCase() : "";
  if (event === "SUBSCRIPTION_CANCELLATION") return "CANCELED";
  if (event === "PURCHASE_REFUNDED") return "REFUNDED";
  if (event === "PURCHASE_APPROVED" || event === "PURCHASE_COMPLETE") return "APPROVED";
  return status || event || "UNKNOWN";
}

async function upsertHotmartSale(
  supabase: any,
  params: {
    transaction: string;
    email: string;
    productId: string | null;
    productName?: string | null;
    purchaseDate: string;
    priceValue?: number | null;
    priceCurrency?: string | null;
    status: string;
    buyerName?: string | null;
    buyerPhone?: string | null;
  },
) {
  const { error } = await supabase.from("hotmart_sales").upsert({
    h_transaction: params.transaction,
    h_email: params.email.toLowerCase().trim(),
    h_product_id: params.productId || "unknown",
    h_product_name: params.productName || null,
    h_purchase_date: params.purchaseDate,
    h_price_value: params.priceValue ?? null,
    h_price_currency: params.priceCurrency || null,
    h_status: params.status,
    h_buyer_name: params.buyerName || null,
    h_buyer_phone: params.buyerPhone || null,
    updated_at: new Date().toISOString(),
  }, { onConflict: "h_transaction" });

  if (error) logStep("ERROR: hotmart_sales upsert", { error: error.message });
}

async function findExistingUserIdByEmail(supabase: any, email: string, fallbackAuthLoop = false): Promise<string | null> {
  const { data: profile } = await supabase.from("profiles").select("user_id").eq("email", email).maybeSingle();
  if (profile?.user_id) return profile.user_id;

  if (fallbackAuthLoop) {
    for (let page = 1; page <= 20; page++) {
      const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: 1000 });
      if (error) return null;
      const m = data?.users?.find((u: any) => u.email?.toLowerCase().trim() === email);
      if (m) return m.id;
      if (!data?.users || data.users.length < 1000) break;
    }
  }
  return null;
}

async function triggerZaiaWebhook(envVar: string, data: { email: string; name?: string; phone?: string; magic_link?: string }) {
  try {
    const url = Deno.env.get(envVar);
    if (!url) return;
    await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
  } catch (e) {
    logStep("Zaia trigger failed", { envVar, error: (e as Error).message });
  }
}

// E-mails (magic link + welcome) usam o utilitário compartilhado
// em ../_shared/welcomeEmail.ts (mesmo módulo usado pelo Stripe).

async function ensureUserAndOnboarding(
  supabase: any,
  resend: Resend | null,
  email: string,
  name: string | undefined,
  phone: string | null,
  hotmartTransaction: string,
  hotmartProductId: string | null,
) {
  const normalizedEmail = email.toLowerCase().trim();
  const { plan, canonical_product_id } = resolveTier(hotmartProductId);
  logStep("Onboarding Check", { email: redactEmail(normalizedEmail), plan, hotmartProductId });

  if (plan === "Unknown" || !canonical_product_id) {
    logStep("REJEITADO: Este produto da Hotmart não pertence ao Canva Viagem (não libera acesso).", { hotmartProductId });
    return;
  }

  // 1. Find or create user
  let userId = await findExistingUserIdByEmail(supabase, normalizedEmail);
  if (!userId) {
    const { data: newUser, error: createErr } = await supabase.auth.admin.createUser({
      email: normalizedEmail,
      email_confirm: true,
    });
    if (createErr) {
      if (createErr.message?.includes("registered") || createErr.message?.includes("exists")) {
        userId = await findExistingUserIdByEmail(supabase, normalizedEmail, true);
      }
      if (!userId) {
        logStep("ERROR: Failed to create user", { error: createErr.message });
        return;
      }
    } else {
      userId = newUser.user.id;
    }
  }

  // 2. Upsert profile
  const profilePayload: any = {
    user_id: userId,
    email: normalizedEmail,
    name: name || normalizedEmail.split("@")[0],
    updated_at: new Date().toISOString(),
  };
  if (phone) profilePayload.phone = phone;
  const { error: pErr } = await supabase.from("profiles").upsert(profilePayload, { onConflict: "user_id" });
  if (pErr) logStep("ERROR: profile upsert", { error: pErr.message });

  // 3. Upsert subscription (source of truth for tier — same table used by Stripe)
  const { error: sErr } = await supabase.from("subscriptions").upsert({
    user_id: userId,
    stripe_customer_id: null,
    stripe_subscription_id: `hotmart:${hotmartTransaction}`,
    status: "active",
    product_id: canonical_product_id,
    updated_at: new Date().toISOString(),
  }, { onConflict: "user_id" });
  if (sErr) logStep("ERROR: subscription upsert", { error: sErr.message });

  // 4. Magic link
  const siteUrl = Deno.env.get("SITE_URL") || "https://canvaviagem.com";
  const token = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
  let magicLink: string | undefined;
  const { error: tErr } = await supabase.from("magic_link_tokens").insert({
    email: normalizedEmail,
    token,
    expires_at: expiresAt.toISOString(),
    name,
    phone,
  });
  if (tErr) logStep("ERROR: magic link token", { error: tErr.message });
  else magicLink = `${siteUrl}/auth/verify?token=${token}`;

  // 5. Resend — usa o MESMO utilitário compartilhado do Stripe.
  // O productId canonico (`hotmart_elite`) garante que o email de boas-vindas
  // escolha o template/CTA correto sem colidir com produtos Start da Stripe.
  if (resend && magicLink) {
    await sendAutoMagicLinkEmail(supabase, resend, normalizedEmail, magicLink, token, name || "Visitante");
    await sendWelcomeEmail(supabase, resend, normalizedEmail, canonical_product_id, "hotmart");
  }

  // 6. Zaia
  await triggerZaiaWebhook("ZAIA_WEBHOOK_WELCOME", {
    email: normalizedEmail,
    name,
    phone: phone || undefined,
    magic_link: magicLink,
  });
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    assertOfficialSupabaseProject("hotmart-webhook");
    const rawBody = await req.text();

    // Validate hottok — Hotmart sends it in header `x-hotmart-hottok` or legacy `h-hotmart-h-token`,
    // also accept query param ?hottok= for setups that prefer URL signing.
    const expectedHottok = Deno.env.get("HOTMART_HOTTOK") || Deno.env.get("HOTMART_WEBHOOK_TOKEN");
    if (expectedHottok) {
      const url = new URL(req.url);
      const provided =
        req.headers.get("x-hotmart-hottok") ||
        req.headers.get("h-hotmart-h-token") ||
        url.searchParams.get("hottok");
      if (provided !== expectedHottok) {
        logStep("Unauthorized: invalid hottok");
        return new Response(JSON.stringify({ error: "Unauthorized" }), {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    } else {
      logStep("WARN: HOTMART_HOTTOK not configured — accepting unverified webhook");
    }

    const payload = JSON.parse(rawBody);
    
    // Suporte Universal: Hotmart V2 e V1 (Postback legado)
    let event: string = payload.event || payload.eventType || "";
    
    // Fallback para V1 onde o 'event' não existe, mas existe 'status' na raiz
    if (!event && payload.status) {
      const s = String(payload.status).toLowerCase();
      if (s === "approved" || s === "completed") event = "PURCHASE_APPROVED";
      else if (s === "canceled") event = "SUBSCRIPTION_CANCELLATION";
      else if (s === "refunded") event = "PURCHASE_REFUNDED";
    }

    logStep("Event received", { event });

    // Hotmart approved purchase events
    const APPROVED_EVENTS = new Set([
      "PURCHASE_APPROVED",
      "PURCHASE_COMPLETE",
      "PURCHASE_REFUNDED",
      "SUBSCRIPTION_CANCELLATION", // handled separately below
    ]);

    if (!APPROVED_EVENTS.has(event)) {
      logStep("Event ignored", { event });
      return new Response(JSON.stringify({ ok: true, ignored: event }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Extração unificada V1/V2
    const data = payload.data ?? {};
    const buyer = data.buyer ?? {};
    const purchase = data.purchase ?? {};
    const product = data.product ?? {};
    const subscription = data.subscription ?? {};

    const rawEmail = buyer.email || payload.email;
    const email: string | undefined = rawEmail?.toLowerCase?.().trim?.();
    const name: string | undefined = buyer.name || buyer.first_name || payload.name || payload.first_name;
    const phone: string | null = buyer.checkout_phone || buyer.phone || payload.phone_number || null;
    const transaction: string = purchase.transaction || subscription.code || payload.transaction || crypto.randomUUID();
    const hotmartProductId: string | null = product.id != null ? String(product.id) : (product.ucode ?? payload.prod ?? null);
    
    const rawDate = purchase.approved_date || purchase.order_date || purchase.date || data.creation_date || payload.purchase_date;
    const purchaseDate = parsePurchaseDate(rawDate);
    const purchaseStatus = resolvePurchaseStatus(event, purchase.status || payload.status);
    
    const priceValue = Number(purchase.price?.value ?? purchase.full_price?.value ?? data.commissions?.[0]?.value ?? payload.price ?? 0);
    const priceCurrency = purchase.price?.currency_code || purchase.full_price?.currency_code || purchase.currency_code || payload.currency || null;

    if (!email) {
      logStep("ERROR: missing buyer email");
      return new Response(JSON.stringify({ error: "Missing buyer email" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    const supabase = createClient(supabaseUrl, supabaseServiceKey, { auth: { autoRefreshToken: false, persistSession: false } });
    const resendKey = Deno.env.get("RESEND_API_KEY");
    const resend = resendKey ? new Resend(resendKey) : null;

    await upsertHotmartSale(supabase, {
      transaction,
      email,
      productId: hotmartProductId,
      productName: product.name || product.ucode || null,
      purchaseDate,
      priceValue: Number.isFinite(priceValue) ? priceValue : null,
      priceCurrency,
      status: purchaseStatus,
      buyerName: name || null,
      buyerPhone: phone,
    });

    // Handle cancellation
    if (event === "SUBSCRIPTION_CANCELLATION" || event === "PURCHASE_REFUNDED") {
      const normalizedEmail = email.toLowerCase().trim();
      const { plan } = resolveTier(hotmartProductId);
      if (plan === "Unknown") {
        logStep("Cancellation ignored: Hotmart product is not authorized for Canva Viagem", { hotmartProductId });
        return new Response(JSON.stringify({ ok: true, ignored: "unauthorized_product" }), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const userId = await findExistingUserIdByEmail(supabase, normalizedEmail);
      if (userId) {
        await supabase.from("subscriptions").update({
          status: "canceled",
          updated_at: new Date().toISOString(),
        })
          .eq("user_id", userId)
          .eq("stripe_subscription_id", `hotmart:${transaction}`);
        logStep("Hotmart subscription deactivated", {
          event,
          email: redactEmail(normalizedEmail),
          transaction,
        });
        await triggerZaiaWebhook("ZAIA_WEBHOOK_CANCELLATION", { email: normalizedEmail, name });
      }
      return new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // PURCHASE_APPROVED / PURCHASE_COMPLETE
    await ensureUserAndOnboarding(supabase, resend, email, name, phone, transaction, hotmartProductId);

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    logStep("FATAL", { error: (err as Error).message });
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
