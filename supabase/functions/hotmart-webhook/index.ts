import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const HOTMART_TOKEN = Deno.env.get('HOTMART_WEBHOOK_TOKEN')
const supabaseAdmin = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
)

serve(async (req) => {
    try {
        const payload = await req.json()
        const hToken = req.headers.get('h-hotmart-h-token')

        // Basic security check if token is configured
        if (HOTMART_TOKEN && hToken !== HOTMART_TOKEN) {
            return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
        }

        // Handle Approved and Canceled events
        const event = payload.event;
        const validEvents = ['PURCHASE_APPROVED', 'PURCHASE_CANCELED', 'PURCHASE_REFUNDED', 'PURCHASE_CHARGEBACK', 'SUBSCRIPTION_CANCELLATION'];
        
        if (validEvents.includes(event)) {
            const data = payload.data;
            const buyer = data.buyer;
            const product = data.product;
            // Handle both purchase and subscription payloads
            const purchase = data.purchase || {};
            const subscription = data.subscription || {};
            
            // Determine the correct status
            const status = event === 'PURCHASE_APPROVED' ? 'APPROVED' : 'CANCELED';
            const transactionId = purchase.transaction || subscription.subscriber_code || `${buyer.email}_${product.id}`;

            const { error } = await supabaseAdmin
                .from('hotmart_sales')
                .upsert({
                    h_transaction: transactionId,
                    h_email: buyer.email,
                    h_product_id: product.id.toString(),
                    h_product_name: product.name,
                    h_purchase_date: purchase.order_date || new Date().toISOString(),
                    h_price_value: purchase.price?.value || 0,
                    h_price_currency: purchase.price?.currency_code || 'BRL',
                    h_status: status,
                    h_buyer_name: buyer.name,
                    h_is_order_bump: purchase.is_order_bump || false
                }, { onConflict: 'h_transaction' })

            if (error) throw error
        }

        return new Response(JSON.stringify({ success: true }), { status: 200 })
    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), { status: 400 })
    }
})
