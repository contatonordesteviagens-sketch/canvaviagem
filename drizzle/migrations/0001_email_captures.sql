-- Todo e-mail que alguém digita para entrar (mesmo sem clicar no link) fica guardado
-- para e-mail marketing. Leitura só para admin (Gestão); escrita só pelo servidor.

CREATE TABLE IF NOT EXISTS public.email_captures (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  source text NOT NULL DEFAULT 'login',
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  hits integer NOT NULL DEFAULT 1,
  first_seen_at timestamptz NOT NULL DEFAULT now(),
  last_seen_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.email_captures ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.email_captures FROM anon, authenticated;
GRANT ALL ON public.email_captures TO service_role;

CREATE OR REPLACE FUNCTION public.capture_email(p_email text, p_source text DEFAULT 'login', p_metadata jsonb DEFAULT '{}'::jsonb)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  normalized text := lower(trim(p_email));
BEGIN
  IF normalized IS NULL OR normalized !~ '^[^\s@]+@[^\s@]+\.[^\s@]+$' THEN RETURN; END IF;
  INSERT INTO public.email_captures (email, source, metadata)
  VALUES (normalized, left(coalesce(p_source, 'login'), 40), coalesce(p_metadata, '{}'::jsonb))
  ON CONFLICT (email) DO UPDATE
    SET hits = public.email_captures.hits + 1,
        last_seen_at = now(),
        metadata = public.email_captures.metadata || EXCLUDED.metadata;
END;
$$;
REVOKE ALL ON FUNCTION public.capture_email(text, text, jsonb) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.capture_email(text, text, jsonb) TO service_role;

-- Gestão: lista para exportar, com a marca de quem já virou conta.
CREATE OR REPLACE FUNCTION public.admin_email_captures()
RETURNS TABLE (email text, source text, hits integer, first_seen_at timestamptz, last_seen_at timestamptz, has_account boolean)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT c.email, c.source, c.hits, c.first_seen_at, c.last_seen_at,
         EXISTS (SELECT 1 FROM public.profiles p WHERE lower(p.email) = c.email) AS has_account
  FROM public.email_captures c
  WHERE public.is_admin()
  ORDER BY c.last_seen_at DESC;
$$;
REVOKE ALL ON FUNCTION public.admin_email_captures() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_email_captures() TO authenticated;

-- Quem já pediu link de acesso antes entra na base.
INSERT INTO public.email_captures (email, source, metadata, hits, first_seen_at, last_seen_at)
SELECT lower(trim(t.email)), 'login', '{"backfill":"magic_link_tokens"}'::jsonb, count(*)::int, min(t.created_at), max(t.created_at)
FROM public.magic_link_tokens t
WHERE t.email IS NOT NULL
GROUP BY lower(trim(t.email))
ON CONFLICT (email) DO NOTHING;
