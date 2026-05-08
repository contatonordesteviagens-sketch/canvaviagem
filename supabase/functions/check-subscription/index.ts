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

// Generic error messages for clients (security best practice)
const GENERIC_ERRORS = {
  unauthorized: "Unauthorized",
  serviceError: "Service temporarily unavailable",
  configError: "Service configuration error",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
  const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
  const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

  // Client used ONLY to validate the JWT (always uses anon key + Authorization header)
  const authHeader = req.headers.get("Authorization");
  const authClient = createClient(supabaseUrl, supabaseAnonKey, {
    global: authHeader ? { headers: { Authorization: authHeader } } : undefined,
    auth: { persistSession: false },
  });

  // Client used for DB writes (prefer service role; if missing, we skip DB updates)
  const dbClient = supabaseServiceRoleKey
    ? createClient(supabaseUrl, supabaseServiceRoleKey, { auth: { persistSession: false } })
    : null;

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

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: GENERIC_ERRORS.unauthorized }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 401,
      });
    }
    logStep("Authorization header found");

    const token = authHeader.replace("Bearer ", "").trim();
    if (!token || token === "null" || token === "undefined") {
      return new Response(JSON.stringify({ error: GENERIC_ERRORS.unauthorized }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 401,
      });
    }
    logStep("Authenticating user with token");

    // Use getUser() without passing token - it uses the Authorization header from the client
    const { data: userData, error: userError } = await authClient.auth.getUser();
    if (userError || !userData?.user) {
      logStep("Auth error", { error: userError?.message });
      return new Response(JSON.stringify({ error: GENERIC_ERRORS.unauthorized }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 401,
      });
    }

    const userId = userData.user.id;
    const email = userData.user.email;
    if (!userId || !email) {
      logStep("ERROR: User authenticated but missing required data");
      return new Response(JSON.stringify({ error: GENERIC_ERRORS.unauthorized }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 401,
      });
    }
    logStep("User authenticated", { userId, email });

    // --- CHECK LOCAL DATABASE FIRST (Updated by Webhooks) ---
    if (dbClient) {
      const { data: localSub, error: localSubError } = await dbClient
        .from("subscriptions")
        .select("*")
        .eq("user_id", userId)
        .single();
      
      if (!localSubError && localSub && localSub.status === "active") {
        const endDate = localSub.current_period_end;
        if (!endDate || new Date(endDate) > new Date()) {
          logStep("Active subscription found in local database", { productId: localSub.product_id });
          return new Response(JSON.stringify({ 
            subscribed: true, 
            product_id: localSub.product_id, 
            subscription_end: endDate 
          }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200,
          });
        }
      }
    }

    // --- STRIPE CHECK ---
    if (stripeKey) {
      const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
      const customers = await stripe.customers.list({ email: email.toLowerCase(), limit: 1 });

      if (customers.data.length > 0) {
        const customerId = customers.data[0].id;
        logStep("Found Stripe customer", { customerId });

        // Check for active/trialing subscriptions
        const subscriptions = await stripe.subscriptions.list({
          customer: customerId,
          status: "active",
          limit: 1,
        });

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

        if (hasActiveSub && subscription) {
          const subscriptionId = subscription.id;
          const subscriptionEnd = subscription.current_period_end ? new Date(subscription.current_period_end * 1000).toISOString() : null;
          const productId = (subscription.items.data[0]?.price?.product as string | null) ?? null;

          if (dbClient) {
            await dbClient.from("subscriptions").upsert({
              user_id: userId,
              status: "active",
              stripe_customer_id: customerId,
              stripe_subscription_id: subscriptionId,
              product_id: productId,
              current_period_end: subscriptionEnd,
            }, { onConflict: "user_id" });
          }

          return new Response(JSON.stringify({ subscribed: true, product_id: productId, subscription_end: subscriptionEnd }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200,
          });
        }
      }
    }



    logStep("No active subscription found anywhere");
    return new Response(JSON.stringify({ subscribed: false, product_id: null, subscription_end: null }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in check-subscription", { message: errorMessage });
    return new Response(JSON.stringify({ error: GENERIC_ERRORS.serviceError }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
