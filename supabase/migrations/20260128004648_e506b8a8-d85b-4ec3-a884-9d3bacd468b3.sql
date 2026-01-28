-- =====================================================
-- CORREÇÃO DE VULNERABILIDADES DE SEGURANÇA DO BANCO
-- =====================================================

-- 1. CORRIGIR abandoned_checkouts - restringir a authenticated apenas
DROP POLICY IF EXISTS "Admins can read abandoned checkouts" ON public.abandoned_checkouts;

CREATE POLICY "Admins can read abandoned checkouts" 
ON public.abandoned_checkouts 
FOR SELECT 
TO authenticated
USING (is_admin());

-- 2. CORRIGIR subscriptions - restringir a authenticated apenas
DROP POLICY IF EXISTS "Users can view their own subscription" ON public.subscriptions;
DROP POLICY IF EXISTS "Admins can view all subscriptions" ON public.subscriptions;

CREATE POLICY "Users can view their own subscription" 
ON public.subscriptions 
FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all subscriptions" 
ON public.subscriptions 
FOR SELECT 
TO authenticated
USING (is_admin());

-- 3. CORRIGIR traffic_sources - bloquear acesso anônimo explicitamente
CREATE POLICY "Block anonymous select on traffic_sources"
ON public.traffic_sources
FOR SELECT
TO anon
USING (false);

-- 4. CORRIGIR marketing_stats view - recriar com security_invoker=on
DROP VIEW IF EXISTS public.marketing_stats;

CREATE VIEW public.marketing_stats 
WITH (security_invoker=on) AS
SELECT 
  COALESCE(ts.utm_source, 'Direto') AS source,
  COALESCE(ts.utm_medium, '-') AS medium,
  COALESCE(ts.utm_campaign, '-') AS campaign,
  count(DISTINCT ts.session_id) AS visitors,
  count(DISTINCT CASE WHEN ts.user_id IS NOT NULL THEN ts.user_id END) AS leads,
  count(DISTINCT CASE WHEN s.status = 'active' THEN s.user_id END) AS subscribers,
  COALESCE(sum(CASE WHEN s.status = 'active' THEN 9.90 ELSE 0 END), 0) AS revenue,
  CASE 
    WHEN count(DISTINCT ts.session_id) > 0 
    THEN round((count(DISTINCT CASE WHEN s.status = 'active' THEN s.user_id END)::numeric 
                / count(DISTINCT ts.session_id)::numeric) * 100, 2)
    ELSE 0 
  END AS conversion_rate
FROM traffic_sources ts
LEFT JOIN subscriptions s ON ts.user_id = s.user_id AND s.status = 'active'
GROUP BY ts.utm_source, ts.utm_medium, ts.utm_campaign
ORDER BY count(DISTINCT ts.session_id) DESC;