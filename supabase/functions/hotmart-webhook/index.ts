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

        // Process only approved purchases
        const event = payload.event
        if (event === 'PURCHASE_APPROVED') {
            const data = payload.data
            const buyer = data.buyer
            const purchase = data.purchase
            const product = data.product

            const { error } = await supabaseAdmin
                .from('hotmart_sales')
                .upsert({
                    h_transaction: purchase.transaction,
                    h_email: buyer.email,
                    h_product_id: product.id.toString(),
                    h_product_name: product.name,
                    h_purchase_date: purchase.order_date,
                    h_price_value: purchase.price.value,
                    h_price_currency: purchase.price.currency_code,
                    h_status: 'APPROVED',
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
