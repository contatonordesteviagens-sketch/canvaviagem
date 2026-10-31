-- Gestão > Plano: o que o admin marcou no checklist. Só admin lê e grava.
CREATE TABLE IF NOT EXISTS public.gestao_checklist (
  id text PRIMARY KEY,
  done boolean NOT NULL DEFAULT false,
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.gestao_checklist ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admin gerencia checklist" ON public.gestao_checklist;
CREATE POLICY "Admin gerencia checklist" ON public.gestao_checklist
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

REVOKE ALL ON public.gestao_checklist FROM anon;
GRANT SELECT, INSERT, UPDATE ON public.gestao_checklist TO authenticated;
GRANT ALL ON public.gestao_checklist TO service_role;