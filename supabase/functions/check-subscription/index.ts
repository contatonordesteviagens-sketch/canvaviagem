import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CHECK-SUBSCRIPTION] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    logStep("Function started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");
    logStep("Stripe key verified");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");
    logStep("Authorization header found");

    const token = authHeader.replace("Bearer ", "");
    logStep("Authenticating user with token");
    
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");
    logStep("User authenticated", { userId: user.id, email: user.email });

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

    // Prefer stored customer id (avoids email mismatch)
    const { data: profile } = await supabaseClient
      .from("profiles")
      .select("stripe_customer_id")
      .eq("user_id", user.id)
      .maybeSingle();

    let customerId = profile?.stripe_customer_id ?? null;

    if (!customerId) {
      const customers = await stripe.customers.list({ email: user.email, limit: 1 });
      if (customers.data.length === 0) {
        logStep("No customer found, user is not subscribed");

        await supabaseClient.from("subscriptions").upsert(
          {
            user_id: user.id,
            status: "inactive",
            stripe_customer_id: null,
            stripe_subscription_id: null,
            product_id: null,
            current_period_end: null,
          },
          { onConflict: "user_id" }
        );

        return new Response(JSON.stringify({ subscribed: false }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });
      }

      customerId = customers.data[0].id;
      logStep("Found Stripe customer by email", { customerId });
    } else {
      logStep("Using stored Stripe customer id", { customerId });
    }

    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: "active",
      limit: 1,
    });

    // Also check trialing status
    let hasActiveSub = subscriptions.data.length > 0;
    let subscription = subscriptions.data[0];

    if (!hasActiveSub) {
      const trialingSubscriptions = await stripe.subscriptions.list({
        customer: customerId,
        status: "trialing",
        limit: 1,
      });
      hasActiveSub = trialingSubscriptions.data.length > 0;
      subscription = trialingSubscriptions.data[0];
    }

    let productId = null;
    let subscriptionEnd = null;
    let subscriptionId = null;

    if (hasActiveSub && subscription) {
      subscriptionEnd = new Date(subscription.current_period_end * 1000).toISOString();
      subscriptionId = subscription.id;
      logStep("Active subscription found", { subscriptionId, endDate: subscriptionEnd });
      productId = subscription.items.data[0].price.product;
      logStep("Determined subscription product", { productId });
      
      // Update subscription status in database
      await supabaseClient
        .from('subscriptions')
        .upsert({
          user_id: user.id,
          status: 'active',
          stripe_customer_id: customerId,
          stripe_subscription_id: subscriptionId,
          product_id: productId,
          current_period_end: subscriptionEnd
        }, { onConflict: 'user_id' });
    } else {
      logStep("No active subscription found");
      
      // Update subscription status in database
      await supabaseClient
        .from('subscriptions')
        .upsert({
          user_id: user.id,
          status: 'inactive',
          stripe_customer_id: customerId,
          stripe_subscription_id: null,
          product_id: null,
          current_period_end: null
        }, { onConflict: 'user_id' });
    }

    return new Response(JSON.stringify({
      subscribed: hasActiveSub,
      product_id: productId,
      subscription_end: subscriptionEnd
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in check-subscription", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
