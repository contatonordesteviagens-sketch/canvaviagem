-- Fix overly permissive INSERT policies that use WITH CHECK (true)

-- 1. email_events: Only service role should insert (edge functions)
-- Since service role bypasses RLS anyway, we can make this restrictive
DROP POLICY IF EXISTS "Allow service role insert" ON public.email_events;

-- Block direct inserts from regular users (edge functions use service role which bypasses RLS)
CREATE POLICY "Block direct user inserts on email_events"
ON public.email_events
FOR INSERT
WITH CHECK (false);

-- 2. page_views: Users can only insert their own views
DROP POLICY IF EXISTS "Usuarios podem inserir views" ON public.page_views;

CREATE POLICY "Users can insert own page views"
ON public.page_views
FOR INSERT
WITH CHECK (
  auth.uid() = user_id 
  OR user_id IS NULL
);