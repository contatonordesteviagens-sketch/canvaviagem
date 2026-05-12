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

const ELITE_PRODUCT_IDS = new Set(["prod_UTFlCWzNqvqSNx", "prod_UTFsXcKq8m0mol", "prod_UTSmPe3GPt8iHt"]);

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
    // Elite can be trusted locally. Start/basic must still be verified against Stripe
    // so upgrades Start → Elite are never blocked by stale local data.
    let localActiveSub: any = null;
    if (dbClient) {
      const { data: localSub, error: localSubError } = await dbClient
        .from("subscriptions")
        .select("*")
        .eq("user_id", userId)
        .single();
      
      if (!localSubError && localSub && localSub.status === "active" && localSub.product_id) {
        const endDate = localSub.current_period_end;
        if (!endDate || new Date(endDate) > new Date()) {
          localActiveSub = localSub;
          if (ELITE_PRODUCT_IDS.has(localSub.product_id)) {
            logStep("Elite subscription found in local database", { productId: localSub.product_id });
            return new Response(JSON.stringify({ 
              subscribed: true, 
              product_id: localSub.product_id, 
              subscription_end: endDate 
            }), {
              headers: { ...corsHeaders, "Content-Type": "application/json" },
              status: 200,
            });
          }
          logStep("Local subscription is non-Elite; verifying Stripe for possible upgrade", { productId: localSub.product_id });
        }
      }
    }

    // --- STRIPE CHECK ---
    if (stripeKey) {
      const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
      const customers = await stripe.customers.list({ email: email.toLowerCase(), limit: 10 });

      if (customers.data.length > 0) {
        logStep("Found Stripe customers", { count: customers.data.length });

        let selected: { customerId: string; subscription: Stripe.Subscription; productId: string | null } | null = null;

        for (const customer of customers.data) {
          const activeSubscriptions = await stripe.subscriptions.list({ customer: customer.id, status: "active", limit: 10 });
          const trialingSubscriptions = await stripe.subscriptions.list({ customer: customer.id, status: "trialing", limit: 10 });
          const allSubscriptions = [...activeSubscriptions.data, ...trialingSubscriptions.data];

          for (const candidate of allSubscriptions) {
            const productId = (candidate.items.data[0]?.price?.product as string | null) ?? null;
            if (!selected || (productId && ELITE_PRODUCT_IDS.has(productId))) {
              selected = { customerId: customer.id, subscription: candidate, productId };
            }
            if (productId && ELITE_PRODUCT_IDS.has(productId)) break;
          }
          if (selected?.productId && ELITE_PRODUCT_IDS.has(selected.productId)) break;
        }

        if (selected) {
          const customerId = selected.customerId;
          const subscriptionId = selected.subscription.id;
          const subscriptionEnd = selected.subscription.current_period_end ? new Date(selected.subscription.current_period_end * 1000).toISOString() : null;
          const productId = selected.productId;

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

        // --- FALLBACK: Verificação de Pagamentos Únicos (One-time) Recentes ---
        logStep("Checking fallback checkout sessions for one-time payments");
        for (const customer of customers.data) {
          const checkoutSessions = await stripe.checkout.sessions.list({
            customer: customer.id,
            status: 'complete',
            limit: 5,
          });

          const thirtyDaysAgo = Math.floor(Date.now() / 1000) - (30 * 24 * 60 * 60);
          const validSession = checkoutSessions.data.find((s: any) =>
            s.payment_status === 'paid' &&
            s.mode === 'payment' &&
            s.created > thirtyDaysAgo
          );

          if (validSession) {
            logStep("Found valid recent one-time session", { sessionId: validSession.id });
            
            let productId: string | null = null;
            try {
              const lineItems = await stripe.checkout.sessions.listLineItems(validSession.id, { limit: 1 });
              productId = (lineItems.data[0]?.price?.product as string) || null;
              logStep("Resolved product ID from session items", { productId });
            } catch (lineErr: any) {
              logStep("Warning: failed to fetch session items", { error: lineErr.message });
            }

            // Define fim de período arbitrário de 30 dias após a compra
            const expiryDate = new Date((validSession.created + (30 * 24 * 60 * 60)) * 1000).toISOString();

            if (dbClient) {
              await dbClient.from("subscriptions").upsert({
                user_id: userId,
                status: "active",
                stripe_customer_id: customer.id,
                stripe_subscription_id: null,
                product_id: productId,
                current_period_end: expiryDate,
              }, { onConflict: "user_id" });
            }

            return new Response(JSON.stringify({ subscribed: true, product_id: productId, subscription_end: expiryDate }), {
              headers: { ...corsHeaders, "Content-Type": "application/json" },
              status: 200,
            });
          }
        }
      }
    }

    if (localActiveSub) {
      logStep("Stripe did not show upgrade; returning local active subscription", { productId: localActiveSub.product_id });
      return new Response(JSON.stringify({ subscribed: true, product_id: localActiveSub.product_id, subscription_end: localActiveSub.current_period_end }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
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
