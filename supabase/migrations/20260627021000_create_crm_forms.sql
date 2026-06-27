CREATE TABLE IF NOT EXISTS public.crm_forms (
  id text PRIMARY KEY,
  owner_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
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
CREATE INDEX IF NOT EXISTS idx_crm_form_submissions_owner_id ON public.crm_form_submissions(owner_id);
CREATE INDEX IF NOT EXISTS idx_crm_form_submissions_form_id ON public.crm_form_submissions(form_id);
CREATE INDEX IF NOT EXISTS idx_crm_form_submissions_created_at ON public.crm_form_submissions(created_at DESC);

ALTER TABLE public.crm_forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_form_submissions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users manage own crm forms" ON public.crm_forms;
CREATE POLICY "Users manage own crm forms"
ON public.crm_forms
FOR ALL
TO authenticated
USING (auth.uid() = owner_id OR public.is_admin())
WITH CHECK (auth.uid() = owner_id OR public.is_admin());

DROP POLICY IF EXISTS "Users read own crm submissions" ON public.crm_form_submissions;
CREATE POLICY "Users read own crm submissions"
ON public.crm_form_submissions
FOR SELECT
TO authenticated
USING (auth.uid() = owner_id OR public.is_admin());

DROP POLICY IF EXISTS "Users update own crm submissions" ON public.crm_form_submissions;
CREATE POLICY "Users update own crm submissions"
ON public.crm_form_submissions
FOR UPDATE
TO authenticated
USING (auth.uid() = owner_id OR public.is_admin())
WITH CHECK (auth.uid() = owner_id OR public.is_admin());

DROP POLICY IF EXISTS "Users delete own crm submissions" ON public.crm_form_submissions;
CREATE POLICY "Users delete own crm submissions"
ON public.crm_form_submissions
FOR DELETE
TO authenticated
USING (auth.uid() = owner_id OR public.is_admin());

DROP TRIGGER IF EXISTS update_crm_forms_updated_at ON public.crm_forms;
CREATE TRIGGER update_crm_forms_updated_at
  BEFORE UPDATE ON public.crm_forms
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
