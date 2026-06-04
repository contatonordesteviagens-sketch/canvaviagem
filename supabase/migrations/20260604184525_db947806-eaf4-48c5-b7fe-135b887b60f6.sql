
CREATE POLICY "Users can read own analytics events"
ON public.analytics_events
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can read own page views"
ON public.page_views
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can read own content clicks"
ON public.content_clicks
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own clicks" ON public.content_clicks;
CREATE POLICY "Validated insert on content_clicks"
ON public.content_clicks
FOR INSERT
TO public
WITH CHECK (
  (auth.uid() IS NULL AND user_id IS NULL)
  OR (auth.uid() = user_id)
);
