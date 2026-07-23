
-- 1. Base tables
CREATE TABLE IF NOT EXISTS public.crm_forms (
  id text PRIMARY KEY,
  owner_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id uuid REFERENCES public.fabrica_diagnosticos(id) ON DELETE CASCADE,
  name text NOT NULL DEFAULT 'Formulario principal',
  description text,
  fields jsonb NOT NULL DEFAULT '[]'::jsonb,
  settings jsonb NOT NULL DEFAULT '{}'::jsonb,
  embed_key text NOT NULL UNIQUE,
  status text NOT NULL DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.crm_form_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  form_id text NOT NULL REFERENCES public.crm_forms(id) ON DELETE CASCADE,
  owner_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  normalized_name text,
  normalized_email text,
  normalized_phone text,
  normalized_interest text,
  source_url text,
  source_domain text,
  user_agent text,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  status text NOT NULL DEFAULT 'novo',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_crm_forms_owner_id ON public.crm_forms(owner_id);
CREATE INDEX IF NOT EXISTS idx_crm_forms_embed_key ON public.crm_forms(embed_key);
CREATE UNIQUE INDEX IF NOT EXISTS crm_forms_project_unique
  ON public.crm_forms (project_id) WHERE project_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_crm_form_submissions_owner_id ON public.crm_form_submissions(owner_id);
CREATE INDEX IF NOT EXISTS idx_crm_form_submissions_form_id ON public.crm_form_submissions(form_id);
CREATE INDEX IF NOT EXISTS idx_crm_form_submissions_created_at ON public.crm_form_submissions(created_at DESC);

-- 2. Grants (Data API)
GRANT SELECT, INSERT, UPDATE, DELETE ON public.crm_forms TO authenticated;
GRANT ALL ON public.crm_forms TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.crm_form_submissions TO authenticated;
GRANT ALL ON public.crm_form_submissions TO service_role;

-- 3. RLS
ALTER TABLE public.crm_forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_form_submissions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users manage own crm forms" ON public.crm_forms;
CREATE POLICY "Users manage own crm forms"
ON public.crm_forms FOR ALL TO authenticated
USING (auth.uid() = owner_id OR public.is_admin())
WITH CHECK (auth.uid() = owner_id OR public.is_admin());

DROP POLICY IF EXISTS "Users read own crm submissions" ON public.crm_form_submissions;
CREATE POLICY "Users read own crm submissions"
ON public.crm_form_submissions FOR SELECT TO authenticated
USING (auth.uid() = owner_id OR public.is_admin());

DROP POLICY IF EXISTS "Users update own crm submissions" ON public.crm_form_submissions;
CREATE POLICY "Users update own crm submissions"
ON public.crm_form_submissions FOR UPDATE TO authenticated
USING (auth.uid() = owner_id OR public.is_admin())
WITH CHECK (auth.uid() = owner_id OR public.is_admin());

DROP POLICY IF EXISTS "Users delete own crm submissions" ON public.crm_form_submissions;
CREATE POLICY "Users delete own crm submissions"
ON public.crm_form_submissions FOR DELETE TO authenticated
USING (auth.uid() = owner_id OR public.is_admin());

DROP TRIGGER IF EXISTS update_crm_forms_updated_at ON public.crm_forms;
CREATE TRIGGER update_crm_forms_updated_at
  BEFORE UPDATE ON public.crm_forms
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 4. Publish RPC
CREATE OR REPLACE FUNCTION public.publish_fabrica_crm_form(
  p_project_id uuid, p_name text, p_description text, p_fields jsonb, p_settings jsonb
) RETURNS public.crm_forms
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp AS $$
DECLARE
  current_user_id uuid := auth.uid();
  canonical_form_id text := p_project_id::text;
  published_form public.crm_forms%ROWTYPE;
BEGIN
  IF current_user_id IS NULL THEN RAISE EXCEPTION 'authentication_required'; END IF;
  IF p_project_id IS NULL OR NOT EXISTS (
    SELECT 1 FROM public.fabrica_diagnosticos WHERE id = p_project_id AND user_id = current_user_id
  ) THEN RAISE EXCEPTION 'project_not_owned'; END IF;
  IF jsonb_typeof(COALESCE(p_fields, '[]'::jsonb)) <> 'array' THEN RAISE EXCEPTION 'invalid_form_fields'; END IF;
  IF jsonb_typeof(COALESCE(p_settings, '{}'::jsonb)) <> 'object' THEN RAISE EXCEPTION 'invalid_form_settings'; END IF;

  DELETE FROM public.crm_forms WHERE embed_key = canonical_form_id AND id <> canonical_form_id;

  INSERT INTO public.crm_forms (id, owner_id, project_id, name, description, fields, settings, embed_key, status)
  VALUES (
    canonical_form_id, current_user_id, p_project_id,
    left(COALESCE(NULLIF(trim(p_name), ''), 'Formulario principal'), 180),
    NULLIF(left(COALESCE(p_description, ''), 1000), ''),
    COALESCE(p_fields, '[]'::jsonb), COALESCE(p_settings, '{}'::jsonb),
    canonical_form_id, 'active'
  )
  ON CONFLICT (id) DO UPDATE SET
    owner_id = EXCLUDED.owner_id, project_id = EXCLUDED.project_id,
    name = EXCLUDED.name, description = EXCLUDED.description,
    fields = EXCLUDED.fields, settings = EXCLUDED.settings,
    embed_key = EXCLUDED.embed_key, status = 'active', updated_at = now()
  RETURNING * INTO published_form;
  RETURN published_form;
END; $$;

REVOKE ALL ON FUNCTION public.publish_fabrica_crm_form(uuid, text, text, jsonb, jsonb) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.publish_fabrica_crm_form(uuid, text, text, jsonb, jsonb) TO authenticated;

-- 5. BACKFILL: recover every legacy lead captured in analytics_events into the CRM
-- Creates a per-owner "legacy" form so the FK is satisfied and leads remain visible.
INSERT INTO public.crm_forms (id, owner_id, name, description, fields, settings, embed_key, status)
SELECT DISTINCT
  'legacy-' || (event_data->>'agency_id'),
  (event_data->>'agency_id')::uuid,
  'Leads históricos (recuperados)',
  'Leads capturados antes da migração do CRM. Preservados automaticamente.',
  '[]'::jsonb, '{"legacy": true}'::jsonb,
  'legacy-' || (event_data->>'agency_id'),
  'active'
FROM public.analytics_events
WHERE event_type = 'lead_captured'
  AND event_data ? 'agency_id'
  AND (event_data->>'agency_id') ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
  AND EXISTS (SELECT 1 FROM auth.users u WHERE u.id::text = event_data->>'agency_id')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.crm_form_submissions (
  id, form_id, owner_id, payload,
  normalized_name, normalized_email, normalized_phone, normalized_interest,
  status, created_at
)
SELECT
  ae.id,
  'legacy-' || (ae.event_data->>'agency_id'),
  (ae.event_data->>'agency_id')::uuid,
  ae.event_data,
  NULLIF(ae.event_data->>'name', ''),
  NULLIF(ae.event_data->>'email', ''),
  NULLIF(ae.event_data->>'phone', ''),
  COALESCE(NULLIF(ae.event_data->>'interest', ''), 'Navegação Geral'),
  COALESCE(NULLIF(ae.event_data->>'status', ''), 'novo'),
  ae.created_at
FROM public.analytics_events ae
WHERE ae.event_type = 'lead_captured'
  AND ae.event_data ? 'agency_id'
  AND (ae.event_data->>'agency_id') ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
  AND EXISTS (SELECT 1 FROM auth.users u WHERE u.id::text = ae.event_data->>'agency_id')
ON CONFLICT (id) DO NOTHING;

NOTIFY pgrst, 'reload schema';
