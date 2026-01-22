-- Update is_admin() to explicitly check for authenticated users
-- This ensures anonymous users always get false, not just implicitly via has_role

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT 
    CASE 
      WHEN auth.uid() IS NULL THEN false
      ELSE public.has_role(auth.uid(), 'admin')
    END
$$;