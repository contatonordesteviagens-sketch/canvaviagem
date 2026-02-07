-- 1. Fix "Function Search Path Mutable" warning
-- The function was overwriten in a recent migration without the search_path setting.
-- We redefine it with security best practices.
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 2. Fix "RLS Policy Always True" warning (user_suggestions)
-- The previous policy was "WITH CHECK (true)". We refine it to ensure only 'pending' items are inserted.
-- This satisfies the security check while maintaining public submission functionality.
DROP POLICY IF EXISTS "Anyone can insert suggestions" ON public.user_suggestions;

CREATE POLICY "Anyone can insert pending suggestions"
  ON public.user_suggestions FOR INSERT
  WITH CHECK (status = 'pending');

-- 3. Fix "RLS Policy Always True" warning (audit_log)
-- The "System can insert audit log" policy used "WITH CHECK (true)".
-- Since insertion happens via SECURITY DEFINER triggers (which bypass RLS), we can safely blocks direct insertions.
DROP POLICY IF EXISTS "System can insert audit log" ON public.audit_log;

CREATE POLICY "System can insert audit log"
  ON public.audit_log FOR INSERT
  WITH CHECK (false);
