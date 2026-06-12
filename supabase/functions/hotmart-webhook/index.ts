import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { sendWelcomeEmail, sendAutoMagicLinkEmail } from "../_shared/welcomeEmail.ts";

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

// Canonical Elite product ID (same set used by fabricaAccess.ts).
// When Hotmart product matches the Elite list, we persist this ID in
// `subscriptions.product_id` so the existing gate recognizes Elite automatically.
const CANONICAL_ELITE_PRODUCT_ID = "prod_TkvaozfpkAcbpM";
const CANONICAL_START_PRODUCT_ID = "hotmart_start";

// Read secret-driven lists of Hotmart product IDs (comma-separated).
const parseList = (raw?: string | null) =>
  new Set((raw ?? "").split(",").map((s) => s.trim()).filter(Boolean));

const HOTMART_ELITE_PRODUCT_IDS = parseList(Deno.env.get("HOTMART_ELITE_PRODUCT_IDS"));
const HOTMART_START_PRODUCT_IDS = parseList(Deno.env.get("HOTMART_START_PRODUCT_IDS"));

function resolveTier(hotmartProductId: string | null): { plan: "Elite" | "Start" | "Unknown"; canonical_product_id: string | null } {
  if (!hotmartProductId) return { plan: "Unknown", canonical_product_id: null };
  if (HOTMART_ELITE_PRODUCT_IDS.has(hotmartProductId)) {
    return { plan: "Elite", canonical_product_id: CANONICAL_ELITE_PRODUCT_ID };
  }
  if (HOTMART_START_PRODUCT_IDS.has(hotmartProductId)) {
    return { plan: "Start", canonical_product_id: CANONICAL_START_PRODUCT_ID };
  }
  // Default: trate como Start (não-elite) para liberar acesso básico sem rebaixar pagantes.
  return { plan: "Start", canonical_product_id: CANONICAL_START_PRODUCT_ID };
}

async function findExistingUserIdByEmail(supabase: any, email: string): Promise<string | null> {
  const { data: profile } = await supabase.from("profiles").select("user_id").eq("email", email).maybeSingle();
  if (profile?.user_id) return profile.user_id;

  for (let page = 1; page <= 20; page++) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: 1000 });
    if (error) return null;
    const m = data?.users?.find((u: any) => u.email?.toLowerCase().trim() === email);
    if (m) return m.id;
    if (!data?.users || data.users.length < 1000) break;
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

async function sendMagicLinkEmail(resend: Resend, email: string, magicLink: string, name: string, plan: string) {
  try {
    await resend.emails.send({
      from: "Canva Viagem <contato@canvaviagem.com>",
      to: [email],
      subject: `🎉 Seu acesso ${plan} - Canva Viagem`,
      html: `
        <div style="font-family:sans-serif;max-width:600px;margin:auto;padding:24px;background:#f9fafb;border-radius:16px">
          <h2>Olá, ${name}!</h2>
          <p>Sua compra na Hotmart foi aprovada. Bem-vindo ao plano <strong>${plan}</strong>!</p>
          <p>Acesse sua conta com 1 clique:</p>
          <a href="${magicLink}" style="display:inline-block;background:#000;color:#fff;padding:16px 28px;border-radius:10px;text-decoration:none;font-weight:bold;margin:20px 0">ACESSAR MINHA CONTA →</a>
          <p style="color:#9ca3af;font-size:11px">Link válido por 24h. Em caso de dúvidas: lucas@rochadigitalmidia.com.br</p>
        </div>
      `,
    });
  } catch (e) {
    logStep("Resend email failed", { error: (e as Error).message });
  }
}

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
  logStep("Onboarding", { email: redactEmail(normalizedEmail), plan, hotmartProductId });

  // 1. Find or create user
  let userId = await findExistingUserIdByEmail(supabase, normalizedEmail);
  if (!userId) {
    const { data: newUser, error: createErr } = await supabase.auth.admin.createUser({
      email: normalizedEmail,
      email_confirm: true,
    });
    if (createErr) {
      if (createErr.message?.includes("registered") || createErr.message?.includes("exists")) {
        userId = await findExistingUserIdByEmail(supabase, normalizedEmail);
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

  // 5. Resend
  if (resend && magicLink) {
    await sendMagicLinkEmail(resend, normalizedEmail, magicLink, name || "Visitante", plan);
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
    const event: string = payload.event || payload.eventType || "";
    logStep("Event received", { event });

    // Hotmart approved purchase events
    const APPROVED_EVENTS = new Set([
      "PURCHASE_APPROVED",
      "PURCHASE_COMPLETE",
      "SUBSCRIPTION_CANCELLATION", // handled separately below
    ]);

    if (!APPROVED_EVENTS.has(event)) {
      logStep("Event ignored", { event });
      return new Response(JSON.stringify({ ok: true, ignored: event }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = payload.data ?? {};
    const buyer = data.buyer ?? {};
    const purchase = data.purchase ?? {};
    const product = data.product ?? {};
    const subscription = data.subscription ?? {};

    const email: string | undefined = buyer.email;
    const name: string | undefined = buyer.name || buyer.first_name;
    const phone: string | null = buyer.checkout_phone || buyer.phone || null;
    const transaction: string = purchase.transaction || subscription.code || crypto.randomUUID();
    const hotmartProductId: string | null = product.id != null ? String(product.id) : (product.ucode ?? null);

    if (!email) {
      logStep("ERROR: missing buyer email");
      return new Response(JSON.stringify({ error: "Missing buyer email" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { autoRefreshToken: false, persistSession: false } },
    );
    const resendKey = Deno.env.get("RESEND_API_KEY");
    const resend = resendKey ? new Resend(resendKey) : null;

    // Handle cancellation
    if (event === "SUBSCRIPTION_CANCELLATION") {
      const normalizedEmail = email.toLowerCase().trim();
      const userId = await findExistingUserIdByEmail(supabase, normalizedEmail);
      if (userId) {
        await supabase.from("subscriptions").update({
          status: "canceled",
          updated_at: new Date().toISOString(),
        }).eq("user_id", userId);
        logStep("Subscription canceled", { email: redactEmail(normalizedEmail) });
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
