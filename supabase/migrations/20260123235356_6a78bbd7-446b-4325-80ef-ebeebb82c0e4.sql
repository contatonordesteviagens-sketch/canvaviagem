-- Fix 1: audit_log - Change INSERT policy from WITH CHECK (true) to WITH CHECK (false)
-- Audit inserts should only happen via SECURITY DEFINER trigger, not direct user access
DROP POLICY IF EXISTS "System can insert audit log" ON public.audit_log;

CREATE POLICY "Block direct audit log inserts"
ON public.audit_log FOR INSERT
WITH CHECK (false);

-- Fix 2: page_views - Fix the INSERT policy to prevent authenticated users from creating fake anonymous views
DROP POLICY IF EXISTS "Authenticated users can insert own views" ON public.page_views;

-- Create two separate policies for authenticated vs anonymous users
CREATE POLICY "Authenticated users can insert own views"
ON public.page_views FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = user_id);

-- Note: Anonymous views are no longer allowed via RLS. If anonymous tracking is needed,
-- it should be done via an edge function with rate limiting.