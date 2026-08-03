CREATE OR REPLACE FUNCTION public.owns_fabrica_project(_project_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT _project_id IS NULL OR EXISTS (
    SELECT 1 FROM public.fabrica_diagnosticos d
    WHERE d.id = _project_id AND d.user_id = auth.uid()
  )
$$;

DROP POLICY IF EXISTS "Users manage own crm forms" ON public.crm_forms;

CREATE POLICY "Users manage own crm forms"
ON public.crm_forms
FOR ALL
TO authenticated
USING ((auth.uid() = owner_id) OR is_admin())
WITH CHECK (
  (
    auth.uid() = owner_id
    AND public.owns_fabrica_project(project_id)
  )
  OR is_admin()
);