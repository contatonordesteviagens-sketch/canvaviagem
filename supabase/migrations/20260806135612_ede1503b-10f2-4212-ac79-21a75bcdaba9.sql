DROP POLICY IF EXISTS "Users can update their own traffic sources" ON public.traffic_sources;
CREATE POLICY "Users can update their own traffic sources"
ON public.traffic_sources
FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());