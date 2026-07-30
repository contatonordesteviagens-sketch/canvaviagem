ALTER TABLE public.subscriptions
  ADD COLUMN IF NOT EXISTS trial_started_at timestamptz,
  ADD COLUMN IF NOT EXISTS trial_ends_at timestamptz,
  ADD COLUMN IF NOT EXISTS billing_provider text,
  ADD COLUMN IF NOT EXISTS billing_cycle text;

CREATE TABLE IF NOT EXISTS public.fabrica_usage_ledger (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  capability text NOT NULL CHECK (capability IN ('ad_export', 'carousel_export')),
  idempotency_key text NOT NULL,
  project_id text,
  status text NOT NULL DEFAULT 'reserved' CHECK (status IN ('reserved', 'committed', 'released')),
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  expires_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, capability, idempotency_key)
);

CREATE INDEX IF NOT EXISTS idx_fabrica_usage_owner_capability
  ON public.fabrica_usage_ledger (user_id, capability, status, created_at DESC);

GRANT SELECT ON public.fabrica_usage_ledger TO authenticated;
GRANT ALL ON public.fabrica_usage_ledger TO service_role;

ALTER TABLE public.fabrica_usage_ledger ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own fabrica usage" ON public.fabrica_usage_ledger;
CREATE POLICY "Users can read own fabrica usage"
  ON public.fabrica_usage_ledger
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.reserve_fabrica_usage(
  p_user_id uuid,
  p_capability text,
  p_idempotency_key text,
  p_project_id text,
  p_metadata jsonb,
  p_limit integer
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
  IF p_capability NOT IN ('ad_export', 'carousel_export') THEN
    RAISE EXCEPTION 'invalid_capability';
  END IF;

  IF p_limit < 0 OR length(p_idempotency_key) < 8 OR length(p_idempotency_key) > 180 THEN
    RAISE EXCEPTION 'invalid_usage_request';
  END IF;

  PERFORM pg_advisory_xact_lock(hashtext(p_user_id::text || ':' || p_capability));

  SELECT * INTO existing_row
    FROM public.fabrica_usage_ledger
   WHERE user_id = p_user_id
     AND capability = p_capability
     AND idempotency_key = p_idempotency_key;

  IF FOUND AND existing_row.status = 'committed' THEN
    RETURN jsonb_build_object(
      'allowed', true,
      'duplicate', true,
      'reservation_id', existing_row.id,
      'remaining', GREATEST(p_limit - (
        SELECT count(*)::integer FROM public.fabrica_usage_ledger
         WHERE user_id = p_user_id AND capability = p_capability AND status = 'committed'
      ), 0)
    );
  END IF;

  IF FOUND AND existing_row.status = 'reserved' AND existing_row.expires_at > now() THEN
    RETURN jsonb_build_object(
      'allowed', true,
      'duplicate', true,
      'reservation_id', existing_row.id,
      'remaining', GREATEST(p_limit - (
        SELECT count(*)::integer FROM public.fabrica_usage_ledger
         WHERE user_id = p_user_id AND capability = p_capability
           AND (status = 'committed' OR (status = 'reserved' AND expires_at > now()))
      ), 0)
    );
  END IF;

  UPDATE public.fabrica_usage_ledger
     SET status = 'released', updated_at = now()
   WHERE user_id = p_user_id AND capability = p_capability
     AND status = 'reserved' AND expires_at <= now();

  SELECT count(*)::integer INTO active_count
    FROM public.fabrica_usage_ledger
   WHERE user_id = p_user_id AND capability = p_capability
     AND (status = 'committed' OR (status = 'reserved' AND expires_at > now()));

  IF active_count >= p_limit THEN
    RETURN jsonb_build_object('allowed', false, 'remaining', 0);
  END IF;

  INSERT INTO public.fabrica_usage_ledger (
    user_id, capability, idempotency_key, project_id, metadata, status, expires_at
  )
  VALUES (
    p_user_id, p_capability, p_idempotency_key, NULLIF(p_project_id, ''),
    COALESCE(p_metadata, '{}'::jsonb), 'reserved', now() + interval '15 minutes'
  )
  ON CONFLICT (user_id, capability, idempotency_key)
  DO UPDATE SET
    project_id = EXCLUDED.project_id,
    metadata = EXCLUDED.metadata,
    status = 'reserved',
    expires_at = EXCLUDED.expires_at,
    updated_at = now()
  RETURNING id INTO reserved_id;

  RETURN jsonb_build_object(
    'allowed', true,
    'duplicate', false,
    'reservation_id', reserved_id,
    'remaining', GREATEST(p_limit - active_count - 1, 0)
  );
END;
$$;

REVOKE ALL ON FUNCTION public.reserve_fabrica_usage(uuid, text, text, text, jsonb, integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.reserve_fabrica_usage(uuid, text, text, text, jsonb, integer) TO service_role;