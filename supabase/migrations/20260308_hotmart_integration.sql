-- Create hotmart_sales table
CREATE TABLE IF NOT EXISTS public.hotmart_sales (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    h_transaction TEXT UNIQUE NOT NULL,
    h_email TEXT NOT NULL,
    h_product_id TEXT NOT NULL,
    h_product_name TEXT,
    h_purchase_date TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    h_price_value DECIMAL(10,2),
    h_price_currency TEXT,
    h_status TEXT, -- APPROVED, REJECTED, REFUNDED, etc.
    h_buyer_name TEXT,
    h_buyer_phone TEXT,
    h_is_order_bump BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Enable RLS
ALTER TABLE public.hotmart_sales ENABLE ROW LEVEL SECURITY;

-- Allow service role to manage sales
CREATE POLICY "Service Role full access" ON public.hotmart_sales
    FOR ALL
    USING (auth.jwt() ->> 'role' = 'service_role')
    WITH CHECK (auth.jwt() ->> 'role' = 'service_role');

-- Allow authenticated admins to view sales
CREATE POLICY "Admins can view sales" ON public.hotmart_sales
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_hotmart_sales_email ON public.hotmart_sales(h_email);
CREATE INDEX IF NOT EXISTS idx_hotmart_sales_status ON public.hotmart_sales(h_status);
