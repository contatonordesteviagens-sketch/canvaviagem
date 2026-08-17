import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { assertOfficialSupabaseProject } from "../_shared/officialProjectGuard.ts";
import { isEliteProduct, isStartProduct } from "../_shared/planAccess.ts";

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
    assertOfficialSupabaseProject("check-subscription");
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
    let localSubscriptionRecord: any = null;
    let localActiveSub: any = null;
    if (dbClient) {
      const { data: localSub, error: localSubError } = await dbClient
        .from("subscriptions")
        .select("*")
        .eq("user_id", userId)
        .single();
      
      if (!localSubError && localSub) {
        localSubscriptionRecord = localSub;
      }

      if (
        !localSubError &&
        localSub &&
        localSub.status === "active" &&
        localSub.product_id
      ) {
        const endDate = localSub.current_period_end;
        const isCurrent = !endDate || new Date(endDate) > new Date();
        if (isCurrent) {
          localActiveSub = localSub;
          if (isEliteProduct(localSub.product_id) && localSub.billing_provider !== 'stripe') {
            logStep("Elite/Ticto subscription found in local database", { productId: localSub.product_id });
            return new Response(JSON.stringify({ 
              subscribed: true, 
              product_id: localSub.product_id, 
              subscription_end: endDate,
              status: localSub.status,
              trial_end: localSub.trial_ends_at ?? null,
              billing_cycle: localSub.billing_cycle ?? null,
              billing_provider: localSub.billing_provider ?? null,
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
      const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });
      const customers = await stripe.customers.list({ email: email.toLowerCase(), limit: 10 });
      const customerIds = Array.from(new Set([
        localSubscriptionRecord?.stripe_customer_id,
        ...customers.data.map((customer) => customer.id),
      ].filter((customerId): customerId is string => Boolean(customerId))));

      if (customerIds.length > 0) {
        logStep("Found Stripe customer references", {
          count: customerIds.length,
          linkedCustomer: Boolean(localSubscriptionRecord?.stripe_customer_id),
        });

        let selected: { customerId: string; subscription: Stripe.Subscription; productId: string | null } | null = null;

        for (const customerId of customerIds) {
          const activeSubscriptions = await stripe.subscriptions.list({ customer: customerId, status: "active", limit: 10 });
          const allSubscriptions = activeSubscriptions.data;

          for (const candidate of allSubscriptions) {
            const productId = (candidate.items.data[0]?.price?.product as string | null) ?? null;
            if (!selected || isEliteProduct(productId)) {
              selected = { customerId, subscription: candidate, productId };
            }
            if (isEliteProduct(productId)) break;
          }
          if (isEliteProduct(selected?.productId)) break;
        }

        if (selected) {
          const customerId = selected.customerId;
          const subscriptionId = selected.subscription.id;
          const subscriptionEnd = selected.subscription.current_period_end ? new Date(selected.subscription.current_period_end * 1000).toISOString() : null;
          const productId = selected.productId;
          const subscriptionStatus = selected.subscription.status;
          const trialStart = selected.subscription.trial_start
            ? new Date(selected.subscription.trial_start * 1000).toISOString()
            : null;
          const trialEnd = selected.subscription.trial_end
            ? new Date(selected.subscription.trial_end * 1000).toISOString()
            : null;
          const recurring = selected.subscription.items.data[0]?.price?.recurring;
          const billingCycle = recurring?.interval === "year"
            ? "annual"
            : recurring?.interval === "month" && recurring.interval_count === 6
              ? "semiannual"
              : recurring?.interval === "month"
                ? "monthly"
                : null;

          if (dbClient) {
            await dbClient.from("subscriptions").upsert({
              user_id: userId,
              status: subscriptionStatus,
              stripe_customer_id: customerId,
              stripe_subscription_id: subscriptionId,
              product_id: productId,
              current_period_end: subscriptionEnd,
              trial_started_at: trialStart,
              trial_ends_at: trialEnd,
              billing_provider: "stripe",
              billing_cycle: billingCycle,
            }, { onConflict: "user_id" });
          }

          return new Response(JSON.stringify({
            subscribed: true,
            product_id: productId,
            subscription_end: subscriptionEnd,
            status: subscriptionStatus,
            trial_end: trialEnd,
            billing_cycle: billingCycle,
            billing_provider: "stripe",
          }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200,
          });
        }

        // --- FALLBACK: Verificação de Pagamentos Únicos (One-time) Recentes ---
        logStep("Checking fallback checkout sessions for one-time payments");
        for (const customerId of customerIds) {
          const checkoutSessions = await stripe.checkout.sessions.list({
            customer: customerId,
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
            
            let isRefunded = false;
            try {
              if (typeof validSession.payment_intent === 'string') {
                const pi = await stripe.paymentIntents.retrieve(validSession.payment_intent);
                if (pi.amount_refunded && pi.amount_refunded > 0) {
                  isRefunded = true;
                }
              }
            } catch (piErr: any) {
              logStep("Warning: failed to fetch payment intent", { error: piErr.message });
            }

            if (isRefunded) {
              logStep("Payment intent has refunds. Skipping this session.");
              continue;
            }

            let productId: string | null = null;
            try {
              const lineItems = await stripe.checkout.sessions.listLineItems(validSession.id, { limit: 1 });
              productId = (lineItems.data[0]?.price?.product as string) || null;
              logStep("Resolved product ID from session items", { productId });
            } catch (lineErr: any) {
              logStep("Warning: failed to fetch session items", { error: lineErr.message });
            }

            if (!isEliteProduct(productId) && !isStartProduct(productId)) {
              logStep("Payment intent is for a non-subscription product. Skipping this session.", { productId });
              continue;
            }

            // Define fim de período arbitrário de 30 dias após a compra
            const expiryDate = new Date((validSession.created + (30 * 24 * 60 * 60)) * 1000).toISOString();

            if (dbClient) {
              await dbClient.from("subscriptions").upsert({
                user_id: userId,
                status: "active",
                stripe_customer_id: customerId,
                stripe_subscription_id: null,
                product_id: productId,
                current_period_end: expiryDate,
                billing_provider: "stripe",
                billing_cycle: "one_time",
              }, { onConflict: "user_id" });
            }

            return new Response(JSON.stringify({
              subscribed: true,
              product_id: productId,
              subscription_end: expiryDate,
              status: "active",
              trial_end: null,
              billing_cycle: "one_time",
              billing_provider: "stripe",
            }), {
              headers: { ...corsHeaders, "Content-Type": "application/json" },
              status: 200,
            });
          }
        }
      }
    }



    if (localActiveSub) {
      if (localActiveSub.billing_provider === 'stripe') {
         logStep('Stripe check did not find active subscription. Invalidating local Stripe sub.');
         if (dbClient) {
           await dbClient.from('subscriptions').update({ status: 'canceled' }).eq('user_id', userId).eq('billing_provider', 'stripe');
         }
         return new Response(JSON.stringify({
           subscribed: false,
           product_id: null,
           subscription_end: null,
           status: 'canceled',
           trial_end: null,
           billing_cycle: null,
           billing_provider: null,
         }), {
           headers: { ...corsHeaders, 'Content-Type': 'application/json' },
           status: 200,
         });
      }

      logStep("Stripe did not show upgrade; returning local active subscription", { productId: localActiveSub.product_id });
      return new Response(JSON.stringify({
        subscribed: true,
        product_id: localActiveSub.product_id,
        subscription_end: localActiveSub.current_period_end,
        status: localActiveSub.status,
        trial_end: localActiveSub.trial_ends_at ?? null,
        billing_cycle: localActiveSub.billing_cycle ?? null,
        billing_provider: localActiveSub.billing_provider ?? null,
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }



    logStep("No active subscription found anywhere");
    return new Response(JSON.stringify({
      subscribed: false,
      product_id: null,
      subscription_end: null,
      status: null,
      trial_end: null,
      billing_cycle: null,
      billing_provider: null,
    }), {
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
