-- This migration is intentionally non-destructive: it removes the old
-- one-project-per-user rule, enriches ownerless telemetry, and adds the
-- project-scoped helpers/indexes without deleting customer records.
ALTER TABLE public.fabrica_diagnosticos
DROP CONSTRAINT IF EXISTS fabrica_diagnosticos_user_id_key;

DROP INDEX IF EXISTS public.fabrica_diagnosticos_user_id_key;

-- Legacy public sites stored the owner in event_data but occasionally left
-- user_id empty. Backfill only rows whose agency_id is a real auth user.
UPDATE public.analytics_events AS event
SET user_id = (event.event_data->>'agency_id')::uuid
WHERE event.user_id IS NULL
  AND event.event_data ? 'agency_id'
  AND (event.event_data->>'agency_id') ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
  AND EXISTS (
    SELECT 1
    FROM auth.users AS account
    WHERE account.id::text = event.event_data->>'agency_id'
  );

-- Freeze every event that already exists as recovered history. Future official
-- events receive validated_v1 only through the server-side tracking function.
UPDATE public.analytics_events
SET event_data = event_data || '{"ingestion":"legacy_recovered_v1"}'::jsonb
WHERE event_data ? 'agency_id'
  AND COALESCE(event_data->>'ingestion', '') = ''
  AND user_id::text = event_data->>'agency_id';

DROP POLICY IF EXISTS "Validated insert on analytics_events"
ON public.analytics_events;

CREATE POLICY "Validated insert on analytics_events"
ON public.analytics_events
FOR INSERT
WITH CHECK (
  session_id IS NOT NULL
  AND LENGTH(session_id) BETWEEN 10 AND 100
  AND created_at >= now() - interval '10 minutes'
  AND created_at <= now() + interval '2 minutes'
  AND COALESCE(event_data->>'ingestion', '') NOT IN (
    'legacy_recovered_v1',
    'validated_v1'
  )
);

CREATE INDEX IF NOT EXISTS idx_fabrica_diagnosticos_user_updated
ON public.fabrica_diagnosticos (user_id, updated_at DESC);

CREATE INDEX IF NOT EXISTS idx_analytics_events_owner_type_created
ON public.analytics_events (user_id, event_type, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_analytics_events_event_data
ON public.analytics_events USING gin (event_data);

CREATE INDEX IF NOT EXISTS idx_analytics_events_ingestion
ON public.analytics_events ((event_data->>'ingestion'));

CREATE TABLE IF NOT EXISTS public.fabrica_event_rate_limits (
  project_id uuid NOT NULL,
  fingerprint text NOT NULL,
  window_start timestamptz NOT NULL,
  request_count integer NOT NULL DEFAULT 1 CHECK (request_count > 0),
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (project_id, fingerprint, window_start)
);

ALTER TABLE public.fabrica_event_rate_limits ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.fabrica_event_rate_limits FROM PUBLIC, anon, authenticated;
GRANT ALL ON public.fabrica_event_rate_limits TO service_role;

CREATE OR REPLACE FUNCTION public.check_fabrica_event_rate_limit(
  p_project_id uuid,
  p_fingerprint text,
  p_limit integer DEFAULT 120,
  p_window_seconds integer DEFAULT 600
) RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  bucket timestamptz;
  next_count integer;
BEGIN
  IF p_project_id IS NULL
    OR length(COALESCE(p_fingerprint, '')) < 32
    OR p_limit < 1
    OR p_window_seconds < 60
  THEN
    RETURN false;
  END IF;

  bucket := to_timestamp(
    floor(extract(epoch FROM now()) / p_window_seconds) * p_window_seconds
  );

  DELETE FROM public.fabrica_event_rate_limits
  WHERE project_id = p_project_id
    AND fingerprint = p_fingerprint
    AND window_start < now() - interval '2 days';

  INSERT INTO public.fabrica_event_rate_limits (
    project_id, fingerprint, window_start, request_count, updated_at
  ) VALUES (
    p_project_id, p_fingerprint, bucket, 1, now()
  )
  ON CONFLICT (project_id, fingerprint, window_start)
  DO UPDATE SET
    request_count = public.fabrica_event_rate_limits.request_count + 1,
    updated_at = now()
  RETURNING request_count INTO next_count;

  RETURN next_count <= p_limit;
END;
$$;

REVOKE ALL ON FUNCTION public.check_fabrica_event_rate_limit(uuid, text, integer, integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.check_fabrica_event_rate_limit(uuid, text, integer, integer) TO service_role;

-- Deleting a project must never cascade into customer leads. Forms are detached
-- and archived so their submissions remain available in account history.
CREATE OR REPLACE FUNCTION public.delete_fabrica_project(
  p_project_id uuid,
  p_legacy_slugs text[] DEFAULT '{}'::text[]
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  current_user_id uuid := auth.uid();
  deleted_sites integer := 0;
  archived_forms integer := 0;
  deleted_projects integer := 0;
BEGIN
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'authentication_required';
  END IF;
  IF p_project_id IS NULL OR NOT EXISTS (
    SELECT 1
    FROM public.fabrica_diagnosticos
    WHERE id = p_project_id
      AND user_id = current_user_id
  ) THEN
    RAISE EXCEPTION 'project_not_owned';
  END IF;

  DELETE FROM public.public_sites
  WHERE owner_id = current_user_id
    AND (
      project_id = p_project_id
      OR (
        project_id IS NULL
        AND id = ANY (COALESCE(p_legacy_slugs, '{}'::text[]))
      )
    );
  GET DIAGNOSTICS deleted_sites = ROW_COUNT;

  UPDATE public.crm_forms
  SET project_id = NULL,
      status = 'archived',
      updated_at = now()
  WHERE owner_id = current_user_id
    AND (
      project_id = p_project_id
      OR id = p_project_id::text
      OR embed_key = p_project_id::text
    );
  GET DIAGNOSTICS archived_forms = ROW_COUNT;

  DELETE FROM public.fabrica_diagnosticos
  WHERE id = p_project_id
    AND user_id = current_user_id;
  GET DIAGNOSTICS deleted_projects = ROW_COUNT;

  IF deleted_projects <> 1 THEN
    RAISE EXCEPTION 'project_delete_failed';
  END IF;

  RETURN jsonb_build_object(
    'project_id', p_project_id,
    'deleted_sites', deleted_sites,
    'deleted_forms', 0,
    'archived_forms', archived_forms
  );
END;
$$;

REVOKE ALL ON FUNCTION public.delete_fabrica_project(uuid, text[]) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.delete_fabrica_project(uuid, text[]) TO authenticated;

-- Converts an old analytics-only lead into a canonical CRM row before changing
-- its status. Ownership is derived from auth.uid(), never from client input.
CREATE OR REPLACE FUNCTION public.promote_fabrica_legacy_lead(
  p_event_id uuid,
  p_status text
) RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  current_user_id uuid := auth.uid();
  event_payload jsonb;
  resolved_form_id text;
  resolved_form_owner uuid;
BEGIN
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'authentication_required';
  END IF;
  IF p_status NOT IN ('novo', 'contato', 'proposta', 'venda', 'perda') THEN
    RAISE EXCEPTION 'invalid_status';
  END IF;

  SELECT event_data
  INTO event_payload
  FROM public.analytics_events
  WHERE id = p_event_id
    AND event_type = 'lead_captured'
    AND user_id = current_user_id
    AND event_data->>'agency_id' = current_user_id::text
    AND event_data->>'ingestion' IN ('legacy_recovered_v1', 'validated_v1');

  IF event_payload IS NULL THEN
    RAISE EXCEPTION 'legacy_lead_not_found';
  END IF;

  SELECT id
  INTO resolved_form_id
  FROM public.crm_forms
  WHERE id = NULLIF(event_payload->>'form_id', '')
    AND owner_id = current_user_id;

  IF resolved_form_id IS NULL THEN
    resolved_form_id := 'legacy-' || current_user_id::text;
    INSERT INTO public.crm_forms (
      id, owner_id, name, description, fields, settings, embed_key, status
    ) VALUES (
      resolved_form_id,
      current_user_id,
      'Leads históricos (recuperados)',
      'Leads preservados automaticamente a partir do histórico da conta.',
      '[]'::jsonb,
      '{"legacy": true}'::jsonb,
      resolved_form_id,
      'active'
    )
    ON CONFLICT (id) DO NOTHING;
  END IF;

  SELECT owner_id
  INTO resolved_form_owner
  FROM public.crm_forms
  WHERE id = resolved_form_id;

  IF resolved_form_owner IS DISTINCT FROM current_user_id THEN
    RAISE EXCEPTION 'legacy_form_owner_mismatch';
  END IF;

  INSERT INTO public.crm_form_submissions (
    id, form_id, owner_id, payload,
    normalized_name, normalized_email, normalized_phone, normalized_interest,
    status, created_at
  )
  SELECT
    ae.id,
    resolved_form_id,
    current_user_id,
    ae.event_data,
    NULLIF(ae.event_data->>'name', ''),
    NULLIF(ae.event_data->>'email', ''),
    COALESCE(NULLIF(ae.event_data->>'phone', ''), NULLIF(ae.event_data->>'whatsapp', '')),
    COALESCE(NULLIF(ae.event_data->>'interest', ''), NULLIF(ae.event_data->>'destino', '')),
    p_status,
    ae.created_at
  FROM public.analytics_events ae
  WHERE ae.id = p_event_id
  ON CONFLICT (id) DO UPDATE
    SET status = EXCLUDED.status
    WHERE public.crm_form_submissions.owner_id = current_user_id;

  RETURN p_event_id;
END;
$$;

REVOKE ALL ON FUNCTION public.promote_fabrica_legacy_lead(uuid, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.promote_fabrica_legacy_lead(uuid, text) TO authenticated;

NOTIFY pgrst, 'reload schema';
