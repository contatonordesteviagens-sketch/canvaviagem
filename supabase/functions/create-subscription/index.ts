import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Use the Product ID provided by the user
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

        // Determine Origin for Return URL
        const origin = req.headers.get("origin") || "https://canvaviagem.lovable.app";

        // 1. Create Embedded Checkout Session
        // We don't need customer ID here, functionality (email collection) is handled by Stripe UI.
        // If we have user ID, we can pass it in metadata.

        // Check for Auth (optional, for metadata)
        let userId = "";
        const authHeader = req.headers.get("Authorization");
        if (authHeader) {
            const { data: { user } } = await supabaseClient.auth.getUser(authHeader.replace("Bearer ", ""));
            if (user) userId = user.id;
        }

        const session = await stripe.checkout.sessions.create({
            ui_mode: 'embedded',
            mode: 'subscription',
            line_items: [
                {
                    price: priceId,
                    quantity: 1,
                },
            ],
            subscription_data: {
                trial_period_days: 3,
            },
            return_url: `${origin}/sucesso?session_id={CHECKOUT_SESSION_ID}`,
            metadata: userId ? { user_id: userId } : {},
            allows_promotion_codes: true,
        });

        return new Response(
            JSON.stringify({
                clientSecret: session.client_secret
            }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );

    } catch (error: any) {
        console.error("Error creating session:", error);
        return new Response(JSON.stringify({ error: error.message }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }
});
