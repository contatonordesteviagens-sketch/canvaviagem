import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { assertOfficialSupabaseProject } from "../_shared/officialProjectGuard.ts";
import { isEliteProduct } from "../_shared/planAccess.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const json = (body: Record<string, unknown>, status = 200) => new Response(
  JSON.stringify(body),
  { status, headers: { ...corsHeaders, "Content-Type": "application/json" } },
);

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  try {
    assertOfficialSupabaseProject("verify-checkout-conversion");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) return json({ error: "Unauthorized" }, 401);

    const authClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } }, auth: { persistSession: false } },
    );
    const { data: userData, error: userError } = await authClient.auth.getUser();
    const userId = userData?.user?.id;
    if (userError || !userId) return json({ error: "Unauthorized" }, 401);

    const body = await req.json().catch(() => ({}));
    const sessionId = typeof body?.session_id === "string" ? body.session_id.trim() : "";
    if (!/^cs_(test_|live_)?[A-Za-z0-9_]+$/.test(sessionId) || sessionId.length > 180) {
      return json({ verified: false, error: "Invalid checkout session" }, 400);
    }

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) return json({ error: "Service unavailable" }, 503);

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["line_items.data.price.product"],
    });
    const sessionUserId = session.client_reference_id || session.metadata?.user_id || "";
    const product = session.line_items?.data[0]?.price?.product;
    const productId = typeof product === "string" ? product : product?.id ?? null;
    const verified = sessionUserId === userId
      && session.status === "complete"
      && session.payment_status === "paid"
      && isEliteProduct(productId)
      && typeof session.amount_total === "number"
      && session.amount_total > 0;

    if (!verified) return json({ verified: false }, 403);

    return json({
      verified: true,
      value: session.amount_total! / 100,
      currency: (session.currency || "brl").toUpperCase(),
      billing_cycle: session.metadata?.billing_cycle || null,
      offer_variant: session.metadata?.landing_variant || "general",
      event_id: `purchase_${session.id}`,
    });
  } catch (error) {
    console.error("[VERIFY-CHECKOUT-CONVERSION]", error instanceof Error ? error.message : String(error));
    return json({ error: "Service temporarily unavailable" }, 500);
  }
});
