
CREATE TABLE IF NOT EXISTS public.public_sites (
  id text PRIMARY KEY,
  html text NOT NULL,
  owner_id uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Ensure owner_id exists in case the table was created previously without it
ALTER TABLE public.public_sites ADD COLUMN IF NOT EXISTS owner_id uuid;

GRANT SELECT ON public.public_sites TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.public_sites TO authenticated;
GRANT ALL ON public.public_sites TO service_role;

ALTER TABLE public.public_sites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view published sites"
  ON public.public_sites FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can publish sites"
  ON public.public_sites FOR INSERT TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update sites"
  ON public.public_sites FOR UPDATE TO authenticated
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete sites"
  ON public.public_sites FOR DELETE TO authenticated
  USING (auth.uid() IS NOT NULL);

CREATE TRIGGER update_public_sites_updated_at
  BEFORE UPDATE ON public.public_sites
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
