import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { assertOfficialSupabaseProject } from "../_shared/officialProjectGuard.ts";
import { isEliteProduct } from "../_shared/planAccess.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CREATE-CHECKOUT] ${step}${detailsStr}`);
};

// Generic error messages for clients (security best practice)
const GENERIC_ERRORS = {
  unauthorized: "Unauthorized",
  serviceError: "Service temporarily unavailable",
  configError: "Service configuration error",
};

type BillingCycle = "monthly" | "semiannual" | "annual";

const validUpgradeFeatures = new Set([
  "ad_export",
  "carousel_export",
  "site_publish",
  "crm",
  "voice",
  "vendedor",
  "premium_content",
  "fabrica",
]);
const validLandingPaths = new Set([
  "/inicio",
  "/anuncios-para-agencia-de-viagens",
  "/site-para-agencia-de-viagens",
  "/equipe-de-marketing-para-agencia-de-viagens",
]);

const sanitizeInternalPath = (value: unknown) => {
  if (
    typeof value !== "string"
    || !value.startsWith("/")
    || value.startsWith("//")
    || value.includes("\\")
    || /[\u0000-\u001F\u007F]/.test(value)
  ) return "";
  try {
    const pathBase = "https://canvaviagem.invalid";
    const parsed = new URL(value.slice(0, 480), pathBase);
    if (parsed.origin !== pathBase) return "";
    return `${parsed.pathname}${parsed.search}${parsed.hash}`;
  } catch {
    return "";
  }
};

const getPriceId = (billingCycle: BillingCycle) => {
  const envName = {
    monthly: "STRIPE_ELITE_MONTHLY_PRICE_ID",
    semiannual: "STRIPE_ELITE_SEMIANNUAL_PRICE_ID",
    annual: "STRIPE_ELITE_ANNUAL_PRICE_ID",
  }[billingCycle];

  return Deno.env.get(envName) ?? "";
};

const getAppOrigin = () => {
  const configuredOrigin = Deno.env.get("APP_URL")
    ?? Deno.env.get("SITE_URL")
    ?? "https://canvaviagem.com";

  try {
    return new URL(configuredOrigin).origin;
  } catch {
    return "https://canvaviagem.com";
  }
};

const isCurrentSubscription = (subscription?: {
  status?: string | null;
  current_period_end?: string | null;
  trial_ends_at?: string | null;
} | null) => {
  if (!subscription || !["active", "trialing"].includes(subscription.status ?? "")) return false;
  const entitlementEnd = subscription.status === "trialing"
    ? subscription.trial_ends_at ?? subscription.current_period_end
    : subscription.current_period_end;

  if (subscription.status === "trialing" && !entitlementEnd) return false;
  return !entitlementEnd || new Date(entitlementEnd) > new Date();
};

const stripeProductId = (subscription: Stripe.Subscription) => {
  const product = subscription.items.data[0]?.price?.product;
  if (typeof product === "string") return product;
  return product?.id ?? null;
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

  try {
    assertOfficialSupabaseProject("create-checkout");
    logStep("Function started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) {
      logStep("ERROR: STRIPE_SECRET_KEY not configured");
      return new Response(JSON.stringify({ error: GENERIC_ERRORS.configError }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      });
    }
    logStep("Stripe key verified");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      logStep("ERROR: No authorization header provided");
      return new Response(JSON.stringify({ error: GENERIC_ERRORS.unauthorized }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 401,
      });
    }

    const token = authHeader.replace("Bearer ", "");
    const { data } = await supabaseClient.auth.getUser(token);
    const user = data.user;
    if (!user?.email) {
      logStep("ERROR: User not authenticated or email not available");
      return new Response(JSON.stringify({ error: GENERIC_ERRORS.unauthorized }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 401,
      });
    }
    logStep("User authenticated", { userId: user.id });

    let requestedCycle: BillingCycle = "monthly";
    let returnTo = "";
    let upgradeFeature = "";
    let landingPath = "/inicio";
    let landingVariant = "general";
    let trialEligible = true;
    try {
      const body = await req.json();
      if (body?.billing_cycle === "semiannual" || body?.billing_cycle === "annual") {
        requestedCycle = body.billing_cycle;
      }
      returnTo = sanitizeInternalPath(body?.return_to);
      if (typeof body?.upgrade === "string" && validUpgradeFeatures.has(body.upgrade)) {
        upgradeFeature = body.upgrade;
      }
      const requestedLandingPath = sanitizeInternalPath(body?.landing_path);
      if (validLandingPaths.has(requestedLandingPath)) landingPath = requestedLandingPath;
      if (typeof body?.landing_variant === "string" && ["ads", "site", "team"].includes(body.landing_variant)) {
        landingVariant = body.landing_variant;
      }
    } catch {
      // Empty request bodies use the canonical monthly offer.
    }

    const priceId = getPriceId(requestedCycle);
    if (!priceId) {
      logStep("ERROR: Elite price is not configured", { billingCycle: requestedCycle });
      return new Response(JSON.stringify({ error: GENERIC_ERRORS.configError }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      });
    }

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    if (serviceRoleKey) {
      const dbClient = createClient(
        Deno.env.get("SUPABASE_URL") ?? "",
        serviceRoleKey,
        { auth: { persistSession: false } },
      );
      const [{ data: localSubscription }, { data: adminRole }] = await Promise.all([
        dbClient
          .from("subscriptions")
          .select("product_id,status,current_period_end,trial_started_at,trial_ends_at")
          .eq("user_id", user.id)
          .maybeSingle(),
        dbClient
          .from("user_roles")
          .select("role")
          .eq("user_id", user.id)
          .eq("role", "admin")
          .maybeSingle(),
      ]);

      if (localSubscription?.trial_started_at || localSubscription?.trial_ends_at) {
        trialEligible = false;
      }

      if (
        adminRole
        || (
          isEliteProduct(localSubscription?.product_id)
          && isCurrentSubscription(localSubscription)
        )
      ) {
        logStep("Checkout skipped: account already has Elite access", { userId: user.id });
        return new Response(JSON.stringify({ already_subscribed: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });
      }
    }

    const customers = await stripe.customers.list({ email: user.email, limit: 10 });
    let customerId = customers.data[0]?.id;
    for (const customer of customers.data) {
      const subscriptions = await stripe.subscriptions.list({
        customer: customer.id,
        status: "all",
        limit: 20,
      });
      const historicalEliteTrial = subscriptions.data.some((subscription) =>
        isEliteProduct(stripeProductId(subscription))
        && Boolean(subscription.trial_start || subscription.trial_end)
      );
      if (historicalEliteTrial) trialEligible = false;
      const existingElite = subscriptions.data.some((subscription) =>
        ["active", "trialing"].includes(subscription.status)
        && isEliteProduct(stripeProductId(subscription))
      );

      if (existingElite) {
        logStep("Checkout skipped: active Elite subscription found in Stripe", { userId: user.id });
        return new Response(JSON.stringify({ already_subscribed: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });
      }
    }

    if (customerId) {
      logStep("Existing Stripe customer found");
    } else {
      logStep("No existing Stripe customer found");
    }

    const origin = getAppOrigin();
    const successParams = new URLSearchParams({
      source: "checkout",
      billingCycle: requestedCycle,
      trial: trialEligible ? "started" : "not_eligible",
    });
    const cancelParams = new URLSearchParams({ checkout: "canceled" });
    if (returnTo) {
      successParams.set("returnTo", returnTo);
      cancelParams.set("returnTo", returnTo);
    }
    if (upgradeFeature) {
      successParams.set("upgrade", upgradeFeature);
      cancelParams.set("upgrade", upgradeFeature);
    }
    if (landingVariant !== "general") {
      successParams.set("offer", landingVariant);
      cancelParams.set("offer", landingVariant);
    }

    const subscriptionData = {
      ...(trialEligible ? { trial_period_days: 3 } : {}),
      metadata: {
        user_id: user.id,
        billing_cycle: requestedCycle,
        upgrade: upgradeFeature,
        return_to: returnTo,
        landing_path: landingPath,
        landing_variant: landingVariant,
      },
    };

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      client_reference_id: user.id,
      payment_method_collection: "always",
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: "subscription",
      subscription_data: subscriptionData,
      success_url: `${origin}/obrigado?${successParams.toString()}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}${landingPath}?${cancelParams.toString()}`,
      metadata: {
        user_id: user.id,
        billing_cycle: requestedCycle,
        upgrade: upgradeFeature,
        return_to: returnTo,
        landing_path: landingPath,
        landing_variant: landingVariant,
      },
      // Enable abandoned cart recovery
      after_expiration: {
        recovery: {
          enabled: true,
          allow_promotion_codes: true,
        },
      },
      consent_collection: {
        promotions: 'auto',
      },
      expires_at: Math.floor(Date.now() / 1000) + (30 * 60), // 30 minutes
    }, {
      // Repeated clicks within the same ten-minute window reuse the same Stripe
      // operation instead of creating parallel trial sessions.
      idempotencyKey: `elite-checkout:${user.id}:${requestedCycle}:${Math.floor(Date.now() / 600000)}`,
    });

    logStep("Checkout session created", { sessionId: session.id });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in create-checkout", { message: errorMessage });
    return new Response(JSON.stringify({ error: GENERIC_ERRORS.serviceError }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
