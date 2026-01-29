-- Fix: Restrict calendar_entries SELECT to authenticated users only
-- The calendar feature is behind a PremiumGate, so only authenticated users should access it

-- Drop the overly permissive public SELECT policy
DROP POLICY IF EXISTS "Public can read calendar entries" ON public.calendar_entries;

-- Create new policy: Only authenticated users can read calendar entries
CREATE POLICY "Authenticated users can read calendar entries" 
ON public.calendar_entries 
FOR SELECT 
TO authenticated
USING (true);

-- Add explicit block for anonymous access
CREATE POLICY "Block anonymous select on calendar_entries" 
ON public.calendar_entries 
FOR SELECT 
TO anon
USING (false);