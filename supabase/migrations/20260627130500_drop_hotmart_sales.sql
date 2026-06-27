-- Drop the hotmart_sales table since the platform is now fully migrated to Stripe
-- and Hotmart integration is completely removed.

DROP TABLE IF EXISTS public.hotmart_sales CASCADE;
