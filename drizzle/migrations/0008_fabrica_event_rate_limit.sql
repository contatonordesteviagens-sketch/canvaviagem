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