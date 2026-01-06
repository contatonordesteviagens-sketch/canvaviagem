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

    const tryCustomer = async (candidateCustomerId: string) => {
      // Check active first
      const active = await stripe.subscriptions.list({
        customer: candidateCustomerId,
        status: "active",
        limit: 1,
      });
      if (active.data.length > 0) {
        return { status: "active" as const, subscription: active.data[0] };
      }

      const trialing = await stripe.subscriptions.list({
        customer: candidateCustomerId,
        status: "trialing",
        limit: 1,
      });
      if (trialing.data.length > 0) {
        return { status: "trialing" as const, subscription: trialing.data[0] };
      }

      return null;
    };

    let customerId = profile?.stripe_customer_id ?? null;
    let subscriptionHit: { status: "active" | "trialing"; subscription: any } | null = null;

    // 1) Try stored customer id
    if (customerId) {
      logStep("Using stored Stripe customer id", { customerId });
      subscriptionHit = await tryCustomer(customerId);
    }

    // 2) Fallback: scan ALL customers by email (Stripe can have multiple customers with same email)
    if (!subscriptionHit) {
      const customers = await stripe.customers.list({ email: user.email, limit: 10 });
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

      logStep("Scanning customers by email", { count: customers.data.length });

      for (const c of customers.data) {
        const hit = await tryCustomer(c.id);
        if (hit) {
          customerId = c.id;
          subscriptionHit = hit;
          logStep("Found subscription via email scan", { customerId, status: hit.status });
          break;
        }
      }

      // If still nothing, just keep first customer as reference (for portal etc.)
      if (!customerId) customerId = customers.data[0].id;
    }

    // If we found a better customer id, persist it for future checks
    if (customerId && customerId !== (profile?.stripe_customer_id ?? null)) {
      await supabaseClient.from("profiles").upsert(
        {
          user_id: user.id,
          email: user.email,
          stripe_customer_id: customerId,
        },
        { onConflict: "user_id" }
      );
    }

    const hasActiveSub = !!subscriptionHit;
    const subscription = subscriptionHit?.subscription;

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
