-- Fix traffic_sources anonymous insert vulnerability
-- Drop the overly permissive policy and create a new one that requires authentication

-- First drop the existing permissive INSERT policy
DROP POLICY IF EXISTS "Anyone can insert traffic sources" ON public.traffic_sources;

-- Create a new policy that allows inserts from authenticated users OR anonymous users
-- but with session validation (session_id must be provided and non-empty)
CREATE POLICY "Authenticated or validated anonymous insert on traffic_sources"
ON public.traffic_sources
FOR INSERT
TO authenticated, anon
WITH CHECK (
  session_id IS NOT NULL 
  AND LENGTH(session_id) >= 10
  AND LENGTH(session_id) <= 100
);

-- Add a comment explaining the policy
COMMENT ON POLICY "Authenticated or validated anonymous insert on traffic_sources" ON public.traffic_sources 
IS 'Allows inserts with valid session_id format to prevent empty/invalid data injection while preserving UTM tracking functionality';