-- Add fingerprint column to track device usage across different users
ALTER TABLE public.fabrica_usage_ledger
  ADD COLUMN IF NOT EXISTS fingerprint text;

CREATE INDEX IF NOT EXISTS idx_fabrica_usage_fingerprint
  ON public.fabrica_usage_ledger (fingerprint, capability, status);

-- Drop the old function since we are changing the signature
DROP FUNCTION IF EXISTS public.reserve_fabrica_usage(uuid, text, text, text, jsonb, integer);

-- Recreate with p_fingerprint
CREATE OR REPLACE FUNCTION public.reserve_fabrica_usage(
  p_user_id uuid,
  p_capability text,
  p_idempotency_key text,
  p_project_id text,
  p_metadata jsonb,
  p_limit integer,
  p_fingerprint text DEFAULT NULL
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
   WHERE (user_id = p_user_id OR (fingerprint = p_fingerprint AND p_fingerprint IS NOT NULL AND p_fingerprint != ''))
     AND capability = p_capability
     AND status = 'reserved' AND expires_at <= now();

  -- CRITICAL ANTI-ABUSE LOGIC: Count usages by BOTH user_id OR fingerprint
  SELECT count(*)::integer INTO active_count
    FROM public.fabrica_usage_ledger
   WHERE (user_id = p_user_id OR (fingerprint = p_fingerprint AND p_fingerprint IS NOT NULL AND p_fingerprint != ''))
     AND capability = p_capability
     AND (status = 'committed' OR (status = 'reserved' AND expires_at > now()));

  IF active_count >= p_limit THEN
    RETURN jsonb_build_object('allowed', false, 'remaining', 0);
  END IF;

  INSERT INTO public.fabrica_usage_ledger (
    user_id, capability, idempotency_key, project_id, metadata, status, expires_at, fingerprint
  )
  VALUES (
    p_user_id, p_capability, p_idempotency_key, NULLIF(p_project_id, ''),
    COALESCE(p_metadata, '{}'::jsonb), 'reserved', now() + interval '15 minutes', p_fingerprint
  )
  ON CONFLICT (user_id, capability, idempotency_key)
  DO UPDATE SET
    project_id = EXCLUDED.project_id,
    metadata = EXCLUDED.metadata,
    status = 'reserved',
    expires_at = EXCLUDED.expires_at,
    updated_at = now(),
    fingerprint = EXCLUDED.fingerprint
  RETURNING id INTO reserved_id;

  RETURN jsonb_build_object(
    'allowed', true,
    'duplicate', false,
    'reservation_id', reserved_id,
    'remaining', GREATEST(p_limit - active_count - 1, 0)
  );
END;
$$;

REVOKE ALL ON FUNCTION public.reserve_fabrica_usage(uuid, text, text, text, jsonb, integer, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.reserve_fabrica_usage(uuid, text, text, text, jsonb, integer, text) TO service_role;
