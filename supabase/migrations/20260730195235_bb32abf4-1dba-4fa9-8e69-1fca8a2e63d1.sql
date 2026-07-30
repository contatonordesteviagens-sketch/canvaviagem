CREATE TABLE public.fabrica_art_tweak_presets (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  category text NOT NULL,
  variant integer NOT NULL,
  format text NOT NULL,
  tweaks jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_by uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE (category, variant, format)
);

GRANT SELECT ON public.fabrica_art_tweak_presets TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.fabrica_art_tweak_presets TO authenticated;
GRANT ALL ON public.fabrica_art_tweak_presets TO service_role;

ALTER TABLE public.fabrica_art_tweak_presets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "art_tweak_presets_public_read"
  ON public.fabrica_art_tweak_presets FOR SELECT
  USING (true);

CREATE POLICY "art_tweak_presets_admin_insert"
  ON public.fabrica_art_tweak_presets FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "art_tweak_presets_admin_update"
  ON public.fabrica_art_tweak_presets FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "art_tweak_presets_admin_delete"
  ON public.fabrica_art_tweak_presets FOR DELETE
  TO authenticated
  USING (public.is_admin());

CREATE TRIGGER update_fabrica_art_tweak_presets_updated_at
  BEFORE UPDATE ON public.fabrica_art_tweak_presets
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();