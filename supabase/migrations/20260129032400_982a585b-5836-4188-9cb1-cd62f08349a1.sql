-- Fix: Restrict calendar_entries SELECT to authenticated users only
-- The calendar feature is behind a PremiumGate, so only authenticated users should access it

CREATE TABLE IF NOT EXISTS public.calendar_entries (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  day_of_year integer NOT NULL,
  year integer NOT NULL,
  notes text,
  content_item_id uuid REFERENCES public.content_items(id) ON DELETE SET NULL,
  caption_id uuid REFERENCES public.captions(id) ON DELETE SET NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.calendar_entries ENABLE ROW LEVEL SECURITY;


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