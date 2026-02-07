import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const PRICE_ID = "price_1SvPypLXUoWoiE4T9zd9mbfR";

serve(async (req) => {
    if (req.method === "OPTIONS") {
        return new Response(null, { headers: corsHeaders });
    }

    try {
        const supabaseClient = createClient(
            Deno.env.get("SUPABASE_URL") ?? "",
            Deno.env.get("SUPABASE_ANON_KEY") ?? ""
        );

        const authHeader = req.headers.get("Authorization");
        if (!authHeader) {
            throw new Error("No authorization header");
        }

        const { data: { user } } = await supabaseClient.auth.getUser(authHeader.replace("Bearer ", ""));
        if (!user || !user.email) {
            throw new Error("Unauthorized");
        }

        const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
            apiVersion: "2025-08-27.basil",
        });

        // 1. Get or Create Customer
        const customers = await stripe.customers.list({ email: user.email, limit: 1 });
        let customerId = customers.data[0]?.id;

        if (!customerId) {
            const userName = user.user_metadata?.name || user.user_metadata?.full_name || 'Usuário';
            const newCustomer = await stripe.customers.create({
                email: user.email,
                name: userName,
                metadata: {
                    user_id: user.id
                }
            });
            customerId = newCustomer.id;
        }

        // 2. Create Subscription
        const subscription = await stripe.subscriptions.create({
            customer: customerId,
            items: [{ price: PRICE_ID }],
            payment_behavior: 'default_incomplete',
            payment_settings: { save_default_payment_method: 'on_subscription' },
            expand: ['latest_invoice.payment_intent', 'pending_setup_intent'], // Fixed expansion
            trial_period_days: 3,
            metadata: {
                user_id: user.id,
            },
        });

        // 3. Extract Client Secret
        const invoice = subscription.latest_invoice as any;
        // Check both PI (payment) and SI (trial setup)
        let clientSecret = invoice?.payment_intent?.client_secret;

        if (!clientSecret) {
            clientSecret = (subscription.pending_setup_intent as any)?.client_secret;
        }

        if (!clientSecret) {
            throw new Error("Could not generate client secret for checkout");
        }

        return new Response(
            JSON.stringify({
                subscriptionId: subscription.id,
                clientSecret: clientSecret
            }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    } catch (error) {
        console.error("Error creating subscription:", error);
        return new Response(JSON.stringify({ error: error.message }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }
});
