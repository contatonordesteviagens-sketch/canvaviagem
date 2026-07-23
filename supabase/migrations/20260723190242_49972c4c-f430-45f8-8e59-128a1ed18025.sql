GRANT SELECT, INSERT, UPDATE, DELETE ON public.crm_forms TO authenticated;
GRANT ALL ON public.crm_forms TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.crm_form_submissions TO authenticated;
GRANT ALL ON public.crm_form_submissions TO service_role;