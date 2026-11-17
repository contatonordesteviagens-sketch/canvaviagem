CREATE OR REPLACE FUNCTION public.has_active_subscription()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT auth.uid() IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.subscriptions s
    WHERE s.user_id = auth.uid()
      AND (
        (s.status = 'active' AND (s.current_period_end IS NULL OR s.current_period_end > now()))
        OR (s.status = 'trialing' AND COALESCE(s.trial_ends_at, s.current_period_end) > now())
      )
  );
$$;

REVOKE ALL ON FUNCTION public.has_active_subscription() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_active_subscription() TO authenticated, service_role;

DROP POLICY IF EXISTS "Authenticated users can read calendar entries" ON public.calendar_entries;
CREATE POLICY "Subscribers and admins can read calendar entries"
ON public.calendar_entries
FOR SELECT
TO authenticated
USING (public.is_admin() OR public.has_active_subscription());

DROP POLICY IF EXISTS "Users upload own site assets" ON storage.objects;
CREATE POLICY "Users upload own site assets"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'thumbnails'
  AND (storage.foldername(name))[1] = 'sites'
  AND (storage.foldername(name))[2] = (SELECT auth.uid()::text)
  AND (storage.foldername(name))[3] = 'assets'
);

DROP POLICY IF EXISTS "Users update own site assets" ON storage.objects;
CREATE POLICY "Users update own site assets"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'thumbnails'
  AND (storage.foldername(name))[1] = 'sites'
  AND (storage.foldername(name))[2] = (SELECT auth.uid()::text)
  AND (storage.foldername(name))[3] = 'assets'
)
WITH CHECK (
  bucket_id = 'thumbnails'
  AND (storage.foldername(name))[1] = 'sites'
  AND (storage.foldername(name))[2] = (SELECT auth.uid()::text)
  AND (storage.foldername(name))[3] = 'assets'
);