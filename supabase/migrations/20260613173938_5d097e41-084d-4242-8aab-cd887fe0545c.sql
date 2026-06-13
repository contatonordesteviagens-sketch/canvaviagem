INSERT INTO public.subscriptions (user_id, stripe_subscription_id, status, product_id, updated_at)
VALUES ('e0ae4c0f-d1cf-4151-b3e3-d1a90209e082', 'hotmart:HP2746515332', 'active', 'hotmart_start', now())
ON CONFLICT (user_id) DO UPDATE SET status='active', product_id=EXCLUDED.product_id, stripe_subscription_id=EXCLUDED.stripe_subscription_id, updated_at=now();