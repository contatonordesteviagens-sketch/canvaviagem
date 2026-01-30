-- Fix: Strengthen analytics_events insert policy to require validated session_id
-- This prevents unlimited data injection from anonymous attackers

-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Allow insert for all" ON public.analytics_events;

-- Create a validated insert policy similar to traffic_sources
CREATE POLICY "Validated insert on analytics_events"
ON public.analytics_events
FOR INSERT
WITH CHECK (
  session_id IS NOT NULL 
  AND LENGTH(session_id) >= 10
  AND LENGTH(session_id) <= 100
);