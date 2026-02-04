import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

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

// Price ID for the monthly subscription - R$ 29,00/month
const PRICE_ID = "price_1SvPypLXUoWoiE4T9zd9mbfR";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? ""
  );

  try {
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
    logStep("User authenticated", { userId: user.id, email: user.email });

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

    // Check if customer already exists
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
      logStep("Existing customer found", { customerId });
    } else {
      logStep("No existing customer, will create new one");
    }

    const origin = req.headers.get("origin") || "https://lovable.dev";

    // Get user name from metadata with fallbacks
    const userName = user.user_metadata?.name ||
      user.user_metadata?.full_name ||
      user.email?.split('@')[0] ||
      'usuário';

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      line_items: [
        {
          price: PRICE_ID,
          quantity: 1,
        },
      ],
      mode: "subscription",
      // Redirect to /obrigado with email for tracking
      success_url: `${origin}/obrigado?email=${encodeURIComponent(user.email || '')}&source=checkout`,
      cancel_url: `${origin}/planos?canceled=true`,
      metadata: {
        user_id: user.id,
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
    });

    logStep("Checkout session created", { sessionId: session.id, url: session.url });

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
