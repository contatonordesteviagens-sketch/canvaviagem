-- Revenue guard, hosted-site suspension and admin intelligence.

ALTER TABLE public.public_sites
  ADD COLUMN IF NOT EXISTS is_active boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS suspended_at timestamptz,
  ADD COLUMN IF NOT EXISTS suspension_reason text;

CREATE INDEX IF NOT EXISTS idx_public_sites_owner_active
  ON public.public_sites(owner_id, is_active);

REVOKE SELECT ON public.public_sites FROM anon;
GRANT SELECT (id, html, locale, created_at, updated_at, is_active) ON public.public_sites TO anon;

CREATE OR REPLACE FUNCTION public.fabrica_full_access_internal(p_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = p_user_id AND role = 'admin'
  ) OR EXISTS (
    SELECT 1 FROM public.subscriptions
    WHERE user_id = p_user_id
      AND status IN ('active', 'trialing')
      AND product_id IN (
        'prod_UTFsXcKq8m0mol','prod_UTSmPe3GPt8iHt','prod_UTFlCWzNqvqSNx',
        'hotmart_elite','elite_ticto','monthly_access_pix','annual_access_pix'
      )
      AND ((status = 'active' AND (current_period_end IS NULL OR current_period_end > now()))
        OR (status = 'trialing' AND COALESCE(trial_ends_at, current_period_end) > now()))
  );
$$;
REVOKE ALL ON FUNCTION public.fabrica_full_access_internal(uuid) FROM PUBLIC;

CREATE OR REPLACE FUNCTION public.activate_site_on_eligible_publish()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF public.fabrica_full_access_internal(NEW.owner_id) THEN
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
  is_active = public.fabrica_full_access_internal(site.owner_id),
  suspended_at = CASE
    WHEN public.fabrica_full_access_internal(site.owner_id) THEN NULL
    ELSE COALESCE(site.suspended_at, now())
  END,
  suspension_reason = CASE
    WHEN public.fabrica_full_access_internal(site.owner_id) THEN NULL
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
  allowed := public.fabrica_full_access_internal(p_user_id);
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

CREATE TABLE IF NOT EXISTS public.fabrica_abuse_signals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  signal_type text NOT NULL,
  signal_hash text NOT NULL,
  related_accounts int NOT NULL DEFAULT 0,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  last_seen_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, signal_type, signal_hash)
);
ALTER TABLE public.fabrica_abuse_signals ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.fabrica_abuse_signals FROM anon, authenticated;
GRANT ALL ON public.fabrica_abuse_signals TO service_role;

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
    COALESCE(sum(CASE WHEN event_type = 'ad_export_completed' THEN
      CASE WHEN COALESCE(event_data->>'amount', '') ~ '^\d{1,4}$'
        THEN least((event_data->>'amount')::int, 1000) ELSE 1 END
      ELSE 0 END), 0)::int AS paid_ad_downloads,
    count(*) FILTER (WHERE event_type = 'carousel_export_completed')::int AS paid_carousel_downloads,
    count(*) FILTER (WHERE event_type = 'page_view' AND event_data @> '{"ingestion":"validated_v1"}'::jsonb)::int AS site_visits,
    count(*) FILTER (WHERE event_type IN ('click_whatsapp', 'package_cta') AND event_data @> '{"ingestion":"validated_v1"}'::jsonb)::int AS site_clicks,
    max(created_at) FILTER (WHERE event_data @> '{"ingestion":"validated_v1"}'::jsonb) AS last_site_activity,
    max(created_at) AS last_activity
  FROM public.analytics_events
  WHERE user_id IS NOT NULL
  GROUP BY user_id
),
abuse_metrics AS (
  SELECT user_id, max(related_accounts)::int AS related_accounts
  FROM public.fabrica_abuse_signals
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
        AND ((s.status = 'active' AND (s.current_period_end IS NULL OR s.current_period_end > now()))
          OR (s.status = 'trialing' AND COALESCE(s.trial_ends_at, s.current_period_end) > now())) THEN 'elite'
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
    'ad_downloads', greatest(COALESCE(um.ad_downloads, 0), COALESCE(em.paid_ad_downloads, 0)),
    'carousel_downloads', greatest(COALESCE(um.carousel_downloads, 0), COALESCE(em.paid_carousel_downloads, 0)),
    'site_visits', COALESCE(em.site_visits, 0),
    'site_clicks', COALESCE(em.site_clicks, 0),
    'leads', COALESCE(lm.leads, 0),
    'conversion_rate', CASE WHEN COALESCE(em.site_visits, 0) > 0
      THEN round(COALESCE(lm.leads, 0)::numeric * 100 / em.site_visits, 2)
      ELSE 0 END,
    'last_activity', GREATEST(em.last_activity, pm.last_project_at, lm.last_lead_at),
    'abuse_related_accounts', COALESCE(am.related_accounts, 0),
    'alert', CASE
      WHEN s.status IN ('past_due','unpaid') THEN 'PAGAMENTO_PENDENTE'
      WHEN COALESCE(am.related_accounts, 0) >= 1 THEN 'MULTIPLAS_CONTAS_SINAL'
      WHEN COALESCE(sm.active_site_count, 0) > 0 AND NOT public.fabrica_full_access_internal(p.user_id)
        THEN 'SITE_ATIVO_SEM_ELITE'
      WHEN NOT public.fabrica_full_access_internal(p.user_id)
        AND em.last_site_activity > COALESCE(s.updated_at, now() - interval '7 days') THEN 'TRAFEGO_EM_SITE_SEM_ELITE'
      WHEN NOT public.fabrica_full_access_internal(p.user_id)
        AND lm.last_lead_at > COALESCE(s.updated_at, now() - interval '7 days') THEN 'LEADS_EM_CONTA_SEM_ELITE'
      ELSE NULL
    END
  ) AS row_data
  FROM public.profiles p
  LEFT JOIN public.subscriptions s ON s.user_id = p.user_id
  LEFT JOIN site_metrics sm ON sm.user_id = p.user_id
  LEFT JOIN usage_metrics um ON um.user_id = p.user_id
  LEFT JOIN event_metrics em ON em.user_id = p.user_id
  LEFT JOIN abuse_metrics am ON am.user_id = p.user_id
  LEFT JOIN lead_metrics lm ON lm.user_id = p.user_id
  LEFT JOIN project_metrics pm ON pm.user_id = p.user_id
) users
);
END;
$$;

REVOKE ALL ON FUNCTION public.admin_user_intelligence() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_user_intelligence() TO authenticated;

-- Bind free quotas to both the account and a network/device signal generated
-- by the Edge Function. The browser fingerprint remains an additional signal.
ALTER TABLE public.fabrica_usage_ledger
  ADD COLUMN IF NOT EXISTS server_fingerprint text;
CREATE INDEX IF NOT EXISTS idx_fabrica_usage_server_fingerprint
  ON public.fabrica_usage_ledger(server_fingerprint, capability, status);

CREATE TABLE IF NOT EXISTS public.fabrica_rate_limits (
  requester_hash text NOT NULL,
  action text NOT NULL,
  window_start timestamptz NOT NULL,
  request_count int NOT NULL DEFAULT 0,
  PRIMARY KEY (requester_hash, action, window_start)
);
ALTER TABLE public.fabrica_rate_limits ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.fabrica_rate_limits FROM anon, authenticated;
GRANT ALL ON public.fabrica_rate_limits TO service_role;

CREATE OR REPLACE FUNCTION public.consume_fabrica_rate_limit(
  p_requester_hash text,
  p_action text,
  p_limit int,
  p_window_seconds int DEFAULT 60
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  bucket timestamptz;
  next_count int;
BEGIN
  IF length(p_requester_hash) < 16 OR p_limit < 1 OR p_window_seconds < 10 OR p_window_seconds > 3600 THEN
    RETURN false;
  END IF;
  bucket := to_timestamp(floor(extract(epoch FROM now()) / p_window_seconds) * p_window_seconds);
  INSERT INTO public.fabrica_rate_limits(requester_hash, action, window_start, request_count)
  VALUES (p_requester_hash, left(p_action, 80), bucket, 1)
  ON CONFLICT (requester_hash, action, window_start) DO UPDATE
    SET request_count = public.fabrica_rate_limits.request_count + 1
  RETURNING request_count INTO next_count;
  DELETE FROM public.fabrica_rate_limits WHERE window_start < now() - interval '2 hours';
  RETURN next_count <= p_limit;
END;
$$;

REVOKE ALL ON FUNCTION public.consume_fabrica_rate_limit(text,text,int,int) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.consume_fabrica_rate_limit(text,text,int,int) TO service_role;

CREATE TABLE IF NOT EXISTS public.fabrica_trial_claims (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email_hash text NOT NULL UNIQUE,
  payment_fingerprint text UNIQUE,
  stripe_customer_id text NOT NULL,
  stripe_subscription_id text NOT NULL UNIQUE,
  claimed_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.fabrica_trial_claims ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.fabrica_trial_claims FROM anon, authenticated;
GRANT ALL ON public.fabrica_trial_claims TO service_role;

CREATE OR REPLACE FUNCTION public.claim_fabrica_trial(
  p_user_id uuid,
  p_email_hash text,
  p_payment_fingerprint text,
  p_stripe_customer_id text,
  p_stripe_subscription_id text
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.fabrica_trial_claims(
    user_id, email_hash, payment_fingerprint, stripe_customer_id, stripe_subscription_id
  ) VALUES (
    p_user_id, p_email_hash, NULLIF(p_payment_fingerprint, ''), p_stripe_customer_id, p_stripe_subscription_id
  );
  RETURN true;
EXCEPTION WHEN unique_violation THEN
  RETURN false;
END;
$$;
REVOKE ALL ON FUNCTION public.claim_fabrica_trial(uuid,text,text,text,text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.claim_fabrica_trial(uuid,text,text,text,text) TO service_role;

CREATE OR REPLACE FUNCTION public.reserve_fabrica_usage(
  p_user_id uuid,
  p_capability text,
  p_idempotency_key text,
  p_project_id text,
  p_metadata jsonb,
  p_limit integer,
  p_fingerprint text DEFAULT NULL,
  p_server_fingerprint text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  existing_row public.fabrica_usage_ledger%ROWTYPE;
  active_count integer;
  reserved_id uuid;
BEGIN
  IF p_capability NOT IN ('ad_export', 'carousel_export') THEN RAISE EXCEPTION 'invalid_capability'; END IF;
  IF p_limit < 0 OR length(p_idempotency_key) < 8 OR length(p_idempotency_key) > 180 THEN RAISE EXCEPTION 'invalid_usage_request'; END IF;

  PERFORM pg_advisory_xact_lock(hashtext(p_user_id::text || ':' || p_capability));
  IF NULLIF(p_server_fingerprint, '') IS NOT NULL THEN
    INSERT INTO public.fabrica_abuse_signals(user_id, signal_type, signal_hash, related_accounts, metadata)
    SELECT p_user_id, 'network_device', p_server_fingerprint,
      count(DISTINCT user_id)::int,
      jsonb_build_object('capability', p_capability)
    FROM public.fabrica_usage_ledger
    WHERE server_fingerprint = p_server_fingerprint AND user_id <> p_user_id
    ON CONFLICT (user_id, signal_type, signal_hash) DO UPDATE SET
      related_accounts = EXCLUDED.related_accounts,
      metadata = EXCLUDED.metadata,
      last_seen_at = now();
  END IF;
  SELECT * INTO existing_row FROM public.fabrica_usage_ledger
  WHERE user_id = p_user_id AND capability = p_capability AND idempotency_key = p_idempotency_key;

  IF FOUND AND existing_row.status = 'committed' THEN
    RETURN jsonb_build_object('allowed', true, 'duplicate', true, 'reservation_id', existing_row.id, 'remaining', 0);
  END IF;
  IF FOUND AND existing_row.status = 'reserved' AND existing_row.expires_at > now() THEN
    RETURN jsonb_build_object('allowed', true, 'duplicate', true, 'reservation_id', existing_row.id, 'remaining', 0);
  END IF;

  UPDATE public.fabrica_usage_ledger SET status = 'released', updated_at = now()
  WHERE capability = p_capability AND status = 'reserved' AND expires_at <= now()
    AND (user_id = p_user_id
      OR (NULLIF(p_fingerprint, '') IS NOT NULL AND fingerprint = p_fingerprint)
      OR (NULLIF(p_server_fingerprint, '') IS NOT NULL AND server_fingerprint = p_server_fingerprint));

  SELECT count(*)::integer INTO active_count FROM public.fabrica_usage_ledger
  WHERE capability = p_capability
    AND (status = 'committed' OR (status = 'reserved' AND expires_at > now()))
    AND (user_id = p_user_id
      OR (NULLIF(p_fingerprint, '') IS NOT NULL AND fingerprint = p_fingerprint)
      OR (NULLIF(p_server_fingerprint, '') IS NOT NULL AND server_fingerprint = p_server_fingerprint));
  IF active_count >= p_limit THEN RETURN jsonb_build_object('allowed', false, 'remaining', 0); END IF;

  INSERT INTO public.fabrica_usage_ledger(
    user_id, capability, idempotency_key, project_id, metadata, status, expires_at, fingerprint, server_fingerprint
  ) VALUES (
    p_user_id, p_capability, p_idempotency_key, NULLIF(p_project_id, ''), COALESCE(p_metadata, '{}'::jsonb),
    'reserved', now() + interval '15 minutes', NULLIF(p_fingerprint, ''), NULLIF(p_server_fingerprint, '')
  )
  ON CONFLICT (user_id, capability, idempotency_key) DO UPDATE SET
    project_id = EXCLUDED.project_id, metadata = EXCLUDED.metadata, status = 'reserved',
    expires_at = EXCLUDED.expires_at, updated_at = now(), fingerprint = EXCLUDED.fingerprint,
    server_fingerprint = EXCLUDED.server_fingerprint
  RETURNING id INTO reserved_id;
  RETURN jsonb_build_object('allowed', true, 'duplicate', false, 'reservation_id', reserved_id, 'remaining', greatest(p_limit - active_count - 1, 0));
END;
$$;

DROP FUNCTION IF EXISTS public.reserve_fabrica_usage(uuid,text,text,text,jsonb,integer,text);
REVOKE ALL ON FUNCTION public.reserve_fabrica_usage(uuid,text,text,text,jsonb,integer,text,text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.reserve_fabrica_usage(uuid,text,text,text,jsonb,integer,text,text) TO service_role;

-- Keep this public bucket image-only. Website HTML is published through the
-- Elite-only public_sites pipeline, never through a raw storage write.
UPDATE storage.buckets
SET allowed_mime_types = ARRAY['image/png', 'image/jpeg', 'image/webp']::text[]
WHERE id = 'thumbnails';

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
