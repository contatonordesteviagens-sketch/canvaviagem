import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { assertOfficialSupabaseProject } from "../_shared/officialProjectGuard.ts";
import { CANONICAL_HOTMART_ELITE_PRODUCT_ID, normalizeHotmartProductId } from "../_shared/planAccess.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

type RepairPayload = {
  email?: string;
  name?: string;
  phone?: string;
  transaction?: string;
  productId?: string;
  productName?: string;
  periodDays?: number;
};

const cleanEmail = (email?: string) => (email || "").toLowerCase().trim();
const cleanPhone = (phone?: string) => (phone || "").replace(/\D/g, "") || null;

async function findExistingUserIdByEmail(supabase: any, email: string): Promise<string | null> {
  for (let page = 1; page <= 20; page++) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: 1000 });
    if (error) throw error;
    const match = data?.users?.find((user: any) => user.email?.toLowerCase().trim() === email);
    if (match?.id) return match.id;
    if (!data?.users || data.users.length < 1000) break;
  }
  return null;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    assertOfficialSupabaseProject("admin-hotmart-repair");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } },
    );

    const token = authHeader.replace("Bearer ", "").trim();
    const { data: authData, error: authError } = await supabaseAdmin.auth.getUser(token);
    if (authError || !authData?.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: roleData } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", authData.user.id)
      .eq("role", "admin")
      .maybeSingle();

    if (!roleData) {
      return new Response(JSON.stringify({ error: "Admin only" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const payload = (await req.json()) as RepairPayload;
    const email = cleanEmail(payload.email);
    if (!email || !email.includes("@")) {
      return new Response(JSON.stringify({ error: "Email invalido" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const hotmartProductId = (payload.productId || "C106141067C").trim();
    const productId = normalizeHotmartProductId(hotmartProductId);
    if (!productId) {
      return new Response(JSON.stringify({ error: "Produto Hotmart nao autorizado" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let userId = await findExistingUserIdByEmail(supabaseAdmin, email);
    let createdUser = false;

    if (!userId) {
      const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email,
        email_confirm: true,
        user_metadata: {
          name: payload.name || email.split("@")[0],
          phone: cleanPhone(payload.phone),
          source: "admin_hotmart_repair",
        },
      });
      if (createError) throw createError;
      userId = newUser.user.id;
      createdUser = true;
    }

    const name = payload.name?.trim() || email.split("@")[0];
    const phone = cleanPhone(payload.phone);
    const transaction = (payload.transaction || `manual:${email}:${Date.now()}`).trim();
    const periodDays = Math.max(1, Math.min(Number(payload.periodDays || 365), 3660));
    const currentPeriodEnd = new Date(Date.now() + periodDays * 24 * 60 * 60 * 1000).toISOString();
    const now = new Date().toISOString();

    const { error: profileError } = await supabaseAdmin.from("profiles").upsert({
      user_id: userId,
      email,
      name,
      phone,
      updated_at: now,
    }, { onConflict: "user_id" });
    if (profileError) throw profileError;

    const { error: saleError } = await supabaseAdmin.from("hotmart_sales").upsert({
      h_transaction: transaction,
      h_email: email,
      h_product_id: hotmartProductId,
      h_product_name: payload.productName || "Canva Viagem",
      h_purchase_date: now,
      h_price_value: null,
      h_price_currency: "BRL",
      h_status: "APPROVED",
      h_buyer_name: name,
      h_buyer_phone: phone,
      updated_at: now,
    }, { onConflict: "h_transaction" });
    if (saleError) throw saleError;

    const { error: subError } = await supabaseAdmin.from("subscriptions").upsert({
      user_id: userId,
      stripe_customer_id: null,
      stripe_subscription_id: `hotmart:${transaction}`,
      status: "active",
      product_id: CANONICAL_HOTMART_ELITE_PRODUCT_ID,
      current_period_end: currentPeriodEnd,
      updated_at: now,
    }, { onConflict: "user_id" });
    if (subError) throw subError;

    const magicToken = crypto.randomUUID();
    const magicExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    const { error: magicError } = await supabaseAdmin.from("magic_link_tokens").insert({
      email,
      token: magicToken,
      expires_at: magicExpiresAt,
      name,
      phone,
    });
    if (magicError) throw magicError;

    const siteUrl = Deno.env.get("SITE_URL") || "https://canvaviagem.com";
    const magicLink = `${siteUrl}/auth/verify?token=${magicToken}`;

    return new Response(JSON.stringify({
      ok: true,
      email,
      user_id: userId,
      created_user: createdUser,
      product_id: CANONICAL_HOTMART_ELITE_PRODUCT_ID,
      current_period_end: currentPeriodEnd,
      magic_link: magicLink,
    }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("[ADMIN-HOTMART-REPAIR]", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Erro interno" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
