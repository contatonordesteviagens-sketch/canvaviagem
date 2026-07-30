DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;

CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

REVOKE ALL ON public.profiles FROM anon;

CREATE OR REPLACE FUNCTION public.reject_secrets_in_public_site_html()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
BEGIN
  IF NEW.html IS NOT NULL AND (
    NEW.html ~* 'SUPABASE_SERVICE_ROLE|service_role_key'
    OR NEW.html ~ 'sk_(live|test)_[A-Za-z0-9]{10,}'
    OR NEW.html ~ 'rk_(live|test)_[A-Za-z0-9]{10,}'
    OR NEW.html ~ 're_[A-Za-z0-9]{24,}'
  ) THEN
    RAISE EXCEPTION 'Conteudo bloqueado: o HTML publicado nao pode conter chaves ou segredos.';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_reject_secrets_in_public_site_html ON public.public_sites;
CREATE TRIGGER trg_reject_secrets_in_public_site_html
  BEFORE INSERT OR UPDATE OF html ON public.public_sites
  FOR EACH ROW EXECUTE FUNCTION public.reject_secrets_in_public_site_html();