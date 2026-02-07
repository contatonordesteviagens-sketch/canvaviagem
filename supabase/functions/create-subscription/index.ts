import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Use the Product ID provided by the user for Live Mode
const PRODUCT_ID = "prod_TkvaozfpkAcbpM";

serve(async (req) => {
    if (req.method === "OPTIONS") {
        return new Response(null, { headers: corsHeaders });
    }

    try {
        const supabaseClient = createClient(
            Deno.env.get("SUPABASE_URL") ?? "",
            Deno.env.get("SUPABASE_ANON_KEY") ?? ""
        );

        let email = "";
        let userId = "";

        // Check for Authorization header first
        const authHeader = req.headers.get("Authorization");
        if (authHeader) {
            const { data: { user } } = await supabaseClient.auth.getUser(authHeader.replace("Bearer ", ""));
            if (user && user.email) {
                email = user.email;
                userId = user.id;
            }
        }

        // If no auth, check body for email (Guest Checkout)
        const reqBody = await req.json().catch(() => ({}));
        if (!email && reqBody.email) {
            email = reqBody.email;
        }

        if (!email) {
            throw new Error("Email is required for checkout");
        }

        const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
        if (!stripeKey) {
            throw new Error("Backend Configuration Error: STRIPE_SECRET_KEY missing");
        }

        const stripe = new Stripe(stripeKey, {
            apiVersion: "2025-08-27.basil",
        });

        // 0. Resolve Price ID from Product ID
        const prices = await stripe.prices.list({
            product: PRODUCT_ID,
            active: true,
            limit: 1,
            type: 'recurring'
        });

        const priceId = prices.data[0]?.id;
        if (!priceId) {
            console.error("No active recurring price found for product:", PRODUCT_ID);
            throw new Error("Plan configuration error: No active price found.");
        }

        // 1. Get or Create Customer
        const customers = await stripe.customers.list({ email: email, limit: 1 });
        let customerId = customers.data[0]?.id;

        if (!customerId) {
            const customerData: any = {
                email: email,
                name: email.split('@')[0],
            };
            if (userId) customerData.metadata = { user_id: userId };

            const newCustomer = await stripe.customers.create(customerData);
            customerId = newCustomer.id;
        }

        // 2. Create Subscription
        const subscriptionParams: any = {
            customer: customerId,
            items: [{ price: priceId }], // Use resolved priceId
            payment_behavior: 'default_incomplete',
            payment_settings: { save_default_payment_method: 'on_subscription' },
            expand: ['latest_invoice.payment_intent', 'pending_setup_intent'],
            trial_period_days: 3,
            metadata: {},
        };

        if (userId) {
            subscriptionParams.metadata.user_id = userId;
        }

        const subscription = await stripe.subscriptions.create(subscriptionParams);

        // 3. Extract Client Secret
        const invoice = subscription.latest_invoice as any;
        let clientSecret = invoice?.payment_intent?.client_secret;

        if (!clientSecret) {
            clientSecret = (subscription.pending_setup_intent as any)?.client_secret;
        }

        if (!clientSecret) {
            throw new Error("Could not generate client secret");
        }

        return new Response(
            JSON.stringify({
                subscriptionId: subscription.id,
                clientSecret: clientSecret
            }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    } catch (error: any) {
        console.error("Error creating subscription:", error);
        return new Response(JSON.stringify({ error: error.message }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }
});
