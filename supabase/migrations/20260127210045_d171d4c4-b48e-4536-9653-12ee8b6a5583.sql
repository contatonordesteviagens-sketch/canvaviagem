-- Create table to track abandoned checkouts for recovery analytics
CREATE TABLE public.abandoned_checkouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  session_id TEXT NOT NULL UNIQUE,
  amount INTEGER,
  recovered BOOLEAN DEFAULT false,
  recovered_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.abandoned_checkouts ENABLE ROW LEVEL SECURITY;

-- Only admins can read abandoned checkouts
CREATE POLICY "Admins can read abandoned checkouts"
  ON public.abandoned_checkouts FOR SELECT
  USING (is_admin());

-- Block direct inserts (only via edge function with service role)
CREATE POLICY "Block direct inserts on abandoned_checkouts"
  ON public.abandoned_checkouts FOR INSERT
  WITH CHECK (false);

-- Block direct updates
CREATE POLICY "Block direct updates on abandoned_checkouts"
  ON public.abandoned_checkouts FOR UPDATE
  USING (false);

-- Block direct deletes
CREATE POLICY "Block direct deletes on abandoned_checkouts"
  ON public.abandoned_checkouts FOR DELETE
  USING (false);

-- Create index for efficient queries
CREATE INDEX idx_abandoned_checkouts_email ON public.abandoned_checkouts(email);
CREATE INDEX idx_abandoned_checkouts_created_at ON public.abandoned_checkouts(created_at DESC);