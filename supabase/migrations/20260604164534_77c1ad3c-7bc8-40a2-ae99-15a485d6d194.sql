DROP POLICY IF EXISTS "Authenticated or validated anonymous insert on traffic_sources" ON public.traffic_sources;

CREATE POLICY "Authenticated or validated anonymous insert on traffic_sources"
ON public.traffic_sources
FOR INSERT
WITH CHECK (
  session_id IS NOT NULL
  AND length(session_id) >= 10
  AND length(session_id) <= 100
  AND (
    (auth.uid() IS NULL AND user_id IS NULL)
    OR (auth.uid() IS NOT NULL AND (user_id IS NULL OR user_id = auth.uid()))
  )
);