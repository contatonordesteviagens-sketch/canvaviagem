REVOKE SELECT ON public.public_sites FROM anon;
GRANT SELECT (id, html, locale, created_at, updated_at) ON public.public_sites TO anon;

DROP POLICY IF EXISTS "Anyone can view published sites" ON public.public_sites;
CREATE POLICY "Anyone can view published sites"
ON public.public_sites
FOR SELECT
TO anon, authenticated
USING (true);