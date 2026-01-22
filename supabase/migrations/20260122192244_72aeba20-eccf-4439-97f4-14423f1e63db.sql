-- Fix email_events RLS: Only admins should be able to read all email events
-- This prevents customer email harvesting by regular authenticated users

-- Drop the overly permissive SELECT policy
DROP POLICY IF EXISTS "Allow authenticated read" ON public.email_events;

-- Create new policy: Only admins can read all email events
CREATE POLICY "Only admins can read email events"
ON public.email_events
FOR SELECT
USING (public.is_admin());