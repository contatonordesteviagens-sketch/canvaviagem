-- Revenue guard, hosted-site suspension and admin intelligence.

ALTER TABLE public.public_sites
  ADD COLUMN IF NOT EXISTS is_active boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS suspended_at timestamptz,
  ADD COLUMN IF NOT EXISTS suspension_reason text;

CREATE INDEX IF NOT EXISTS idx_public_sites_owner_active
  ON public.public_sites(owner_id, is_active);

REVOKE SELECT ON public.public_sites FROM anon;
GRANT SELECT (id, html, locale, created_at, updated_at, is_active) ON public.public_sites TO anon;

CREATE OR REPLACE FUNCTION public.activate_site_on_eligible_publish()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF public.has_fabrica_full_access(NEW.owner_id) THEN
    NEW.is_active := true;
    NEW.suspended_at := NULL;
    NEW.suspension_reason := NULL;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS activate_site_on_eligible_publish ON public.public_sites;
CREATE TRIGGER activate_site_on_eligible_publish
BEFORE INSERT OR UPDATE OF html, project_id, owner_id ON public.public_sites
FOR EACH ROW EXECUTE FUNCTION public.activate_site_on_eligible_publish();

-- A hosted site is a paid Elite deliverable. Preserve its data on downgrade,
-- but stop serving it until access is restored.
UPDATE public.public_sites site
SET
  is_active = public.has_fabrica_full_access(site.owner_id),
  suspended_at = CASE
    WHEN public.has_fabrica_full_access(site.owner_id) THEN NULL
    ELSE COALESCE(site.suspended_at, now())
  END,
  suspension_reason = CASE
    WHEN public.has_fabrica_full_access(site.owner_id) THEN NULL
    ELSE COALESCE(site.suspension_reason, 'subscription_inactive')
  END;

DROP POLICY IF EXISTS "Anyone can view published sites" ON public.public_sites;
DROP POLICY IF EXISTS "Anyone can view published sites by id" ON public.public_sites;
DROP POLICY IF EXISTS "Public can view sites" ON public.public_sites;
CREATE POLICY "Active sites are public; owners and admins can inspect all"
  ON public.public_sites
  FOR SELECT
  USING (
    is_active
    OR auth.uid() = owner_id
    OR public.is_admin()
  );

CREATE OR REPLACE FUNCTION public.sync_user_public_site_access(p_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  allowed boolean;
BEGIN
  IF p_user_id IS NULL THEN RETURN; END IF;
  allowed := public.has_fabrica_full_access(p_user_id);
  UPDATE public.public_sites
  SET
    is_active = allowed,
    suspended_at = CASE WHEN allowed THEN NULL ELSE COALESCE(suspended_at, now()) END,
    suspension_reason = CASE WHEN allowed THEN NULL ELSE COALESCE(suspension_reason, 'subscription_inactive') END
  WHERE owner_id = p_user_id;
END;
$$;

REVOKE ALL ON FUNCTION public.sync_user_public_site_access(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.sync_user_public_site_access(uuid) TO service_role;

CREATE OR REPLACE FUNCTION public.sync_sites_after_subscription_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM public.sync_user_public_site_access(COALESCE(NEW.user_id, OLD.user_id));
  RETURN COALESCE(NEW, OLD);
END;
$$;

DROP TRIGGER IF EXISTS sync_sites_after_subscription_change ON public.subscriptions;
CREATE TRIGGER sync_sites_after_subscription_change
AFTER INSERT OR UPDATE OR DELETE ON public.subscriptions
FOR EACH ROW EXECUTE FUNCTION public.sync_sites_after_subscription_change();

CREATE OR REPLACE FUNCTION public.admin_set_public_site_status(
  p_site_id text,
  p_active boolean,
  p_reason text DEFAULT NULL
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_admin() THEN RAISE EXCEPTION 'Admin access required'; END IF;
  UPDATE public.public_sites
  SET
    is_active = p_active,
    suspended_at = CASE WHEN p_active THEN NULL ELSE now() END,
    suspension_reason = CASE WHEN p_active THEN NULL ELSE COALESCE(NULLIF(trim(p_reason), ''), 'manual_admin') END
  WHERE id = p_site_id;
  RETURN FOUND;
END;
$$;

REVOKE ALL ON FUNCTION public.admin_set_public_site_status(text, boolean, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_set_public_site_status(text, boolean, text) TO authenticated;

CREATE OR REPLACE FUNCTION public.admin_user_intelligence()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
IF NOT public.is_admin() THEN RAISE EXCEPTION 'Admin access required'; END IF;
RETURN (
WITH site_metrics AS (
  SELECT
    owner_id AS user_id,
    count(*)::int AS site_count,
    count(*) FILTER (WHERE is_active)::int AS active_site_count,
    jsonb_agg(jsonb_build_object(
      'id', id,
      'active', is_active,
      'project_id', project_id,
      'created_at', created_at,
      'updated_at', updated_at,
      'suspended_at', suspended_at,
      'suspension_reason', suspension_reason
    ) ORDER BY updated_at DESC) AS sites
  FROM public.public_sites
  GROUP BY owner_id
),
usage_metrics AS (
  SELECT
    user_id,
    count(*) FILTER (WHERE capability = 'ad_export' AND status = 'committed')::int AS ad_downloads,
    count(*) FILTER (WHERE capability = 'carousel_export' AND status = 'committed')::int AS carousel_downloads
  FROM public.fabrica_usage_ledger
  GROUP BY user_id
),
event_metrics AS (
  SELECT
    user_id,
    count(*) FILTER (WHERE event_type = 'ad_preview_generated')::int AS ad_generations,
    count(*) FILTER (WHERE event_type = 'carousel_preview_generated')::int AS carousel_generations,
    count(*) FILTER (WHERE event_type = 'page_view' AND event_data @> '{"ingestion":"validated_v1"}'::jsonb)::int AS site_visits,
    count(*) FILTER (WHERE event_type IN ('click_whatsapp', 'package_cta') AND event_data @> '{"ingestion":"validated_v1"}'::jsonb)::int AS site_clicks,
    max(created_at) FILTER (WHERE event_data @> '{"ingestion":"validated_v1"}'::jsonb) AS last_site_activity,
    max(created_at) AS last_activity
  FROM public.analytics_events
  WHERE user_id IS NOT NULL
  GROUP BY user_id
),
lead_metrics AS (
  SELECT owner_id AS user_id, count(*)::int AS leads, max(created_at) AS last_lead_at
  FROM public.crm_form_submissions
  GROUP BY owner_id
),
project_metrics AS (
  SELECT user_id, count(*)::int AS project_count, max(updated_at) AS last_project_at
  FROM public.fabrica_diagnosticos
  GROUP BY user_id
)
SELECT COALESCE(jsonb_agg(row_data ORDER BY (row_data->>'created_at') DESC), '[]'::jsonb)
FROM LATERAL (
  SELECT jsonb_build_object(
    'user_id', p.user_id,
    'name', p.name,
    'email', p.email,
    'phone', p.phone,
    'created_at', p.created_at,
    'utm_source', p.utm_source,
    'plan', CASE
      WHEN s.product_id IN ('prod_UTFsXcKq8m0mol','prod_UTSmPe3GPt8iHt','prod_UTFlCWzNqvqSNx','hotmart_elite','elite_ticto','monthly_access_pix','annual_access_pix')
        AND s.status IN ('active','trialing')
        AND (s.status <> 'trialing' OR COALESCE(s.trial_ends_at, s.current_period_end) > now()) THEN 'elite'
      WHEN s.product_id IN ('prod_TkvaozfpkAcbpM','start_ticto','monthly_access_ticto')
        AND s.status = 'active' THEN 'start'
      WHEN s.status = 'trialing' THEN 'trial_expired'
      ELSE 'inactive'
    END,
    'subscription_status', COALESCE(s.status, 'none'),
    'billing_cycle', s.billing_cycle,
    'current_period_end', s.current_period_end,
    'trial_ends_at', s.trial_ends_at,
    'site_count', COALESCE(sm.site_count, 0),
    'active_site_count', COALESCE(sm.active_site_count, 0),
    'sites', COALESCE(sm.sites, '[]'::jsonb),
    'project_count', COALESCE(pm.project_count, 0),
    'ad_generations', COALESCE(em.ad_generations, 0),
    'carousel_generations', COALESCE(em.carousel_generations, 0),
    'ad_downloads', COALESCE(um.ad_downloads, 0),
    'carousel_downloads', COALESCE(um.carousel_downloads, 0),
    'site_visits', COALESCE(em.site_visits, 0),
    'site_clicks', COALESCE(em.site_clicks, 0),
    'leads', COALESCE(lm.leads, 0),
    'conversion_rate', CASE WHEN COALESCE(em.site_visits, 0) > 0
      THEN round(COALESCE(lm.leads, 0)::numeric * 100 / em.site_visits, 2)
      ELSE 0 END,
    'last_activity', GREATEST(em.last_activity, pm.last_project_at, lm.last_lead_at),
    'alert', CASE
      WHEN COALESCE(sm.active_site_count, 0) > 0 AND NOT public.has_fabrica_full_access(p.user_id)
        THEN 'SITE_ATIVO_SEM_ELITE'
      WHEN NOT public.has_fabrica_full_access(p.user_id)
        AND COALESCE(em.site_visits, 0) > 0 THEN 'TRAFEGO_EM_SITE_SEM_ELITE'
      WHEN NOT public.has_fabrica_full_access(p.user_id)
        AND COALESCE(lm.leads, 0) > 0 THEN 'LEADS_EM_CONTA_SEM_ELITE'
      WHEN s.status IN ('past_due','unpaid') THEN 'PAGAMENTO_PENDENTE'
      ELSE NULL
    END
  ) AS row_data
  FROM public.profiles p
  LEFT JOIN public.subscriptions s ON s.user_id = p.user_id
  LEFT JOIN site_metrics sm ON sm.user_id = p.user_id
  LEFT JOIN usage_metrics um ON um.user_id = p.user_id
  LEFT JOIN event_metrics em ON em.user_id = p.user_id
  LEFT JOIN lead_metrics lm ON lm.user_id = p.user_id
  LEFT JOIN project_metrics pm ON pm.user_id = p.user_id
) users
);
END;
$$;

REVOKE ALL ON FUNCTION public.admin_user_intelligence() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_user_intelligence() TO authenticated;

CREATE TABLE IF NOT EXISTS public.stripe_webhook_events (
  event_id text PRIMARY KEY,
  event_type text NOT NULL,
  status text NOT NULL CHECK (status IN ('processing','completed','failed')),
  attempts int NOT NULL DEFAULT 1,
  last_error text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz
);

ALTER TABLE public.stripe_webhook_events ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.stripe_webhook_events FROM anon, authenticated;
GRANT ALL ON public.stripe_webhook_events TO service_role;

CREATE OR REPLACE FUNCTION public.claim_stripe_webhook_event(p_event_id text, p_event_type text)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  WITH claimed AS (
    INSERT INTO public.stripe_webhook_events(event_id, event_type, status)
    VALUES (p_event_id, p_event_type, 'processing')
    ON CONFLICT (event_id) DO UPDATE
    SET status = 'processing', attempts = stripe_webhook_events.attempts + 1,
        last_error = NULL, updated_at = now()
    WHERE stripe_webhook_events.status = 'failed'
       OR (stripe_webhook_events.status = 'processing' AND stripe_webhook_events.updated_at < now() - interval '5 minutes')
    RETURNING 1
  )
  SELECT EXISTS(SELECT 1 FROM claimed);
$$;

REVOKE ALL ON FUNCTION public.claim_stripe_webhook_event(text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.claim_stripe_webhook_event(text, text) TO service_role;
