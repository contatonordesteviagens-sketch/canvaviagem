
-- 1) Tighten webinar_leads INSERT: validate fields + block writing to global_live_settings row
DROP POLICY IF EXISTS "Anyone can insert webinar leads" ON public.webinar_leads;

CREATE POLICY "Validated insert on webinar_leads"
ON public.webinar_leads
FOR INSERT
TO anon, authenticated
WITH CHECK (
  whatsapp IS NOT NULL
  AND length(trim(whatsapp)) BETWEEN 5 AND 50
  AND whatsapp <> 'global_live_settings'
  AND name IS NOT NULL
  AND length(trim(name)) BETWEEN 1 AND 100
  AND (source IS NULL OR length(source) <= 20000)
);

-- 2) Remove profiles from Realtime publication if present (prevents broadcasting PII)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'profiles'
  ) THEN
    EXECUTE 'ALTER PUBLICATION supabase_realtime DROP TABLE public.profiles';
  END IF;
END $$;

-- 3) Lock down SECURITY DEFINER trigger / internal functions — not meant to be callable directly
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user_email_automation() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.audit_trigger_func() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.check_pii_access_pattern() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM PUBLIC, anon, authenticated;

-- 4) Admin-only PII function: block anon entirely; authenticated keeps access (internal is_admin guard)
REVOKE EXECUTE ON FUNCTION public.get_customer_email_audited(uuid, text, text) FROM PUBLIC, anon;
