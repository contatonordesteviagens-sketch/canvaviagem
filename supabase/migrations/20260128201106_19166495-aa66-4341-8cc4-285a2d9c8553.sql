-- 1. Criar view mascarada para abandoned_checkouts
CREATE VIEW public.abandoned_checkouts_masked
WITH (security_invoker=on) AS
SELECT 
  id,
  session_id,
  CONCAT(LEFT(email, 2), '***@', SPLIT_PART(email, '@', 2)) as email_masked,
  created_at,
  recovered_at,
  recovered,
  amount
FROM public.abandoned_checkouts;

-- 2. Criar view mascarada para profiles (admin view)
CREATE VIEW public.profiles_admin_view
WITH (security_invoker=on) AS
SELECT 
  id,
  user_id,
  COALESCE(CONCAT(LEFT(email, 2), '***@', SPLIT_PART(email, '@', 2)), NULL) as email_masked,
  name,
  CASE 
    WHEN phone IS NOT NULL AND LENGTH(phone) > 8 THEN 
      CONCAT(LEFT(phone, 4), '****', RIGHT(phone, 4))
    ELSE phone 
  END as phone_masked,
  created_at,
  first_visit_at,
  utm_source,
  utm_medium,
  utm_campaign,
  CASE 
    WHEN stripe_customer_id IS NOT NULL THEN 
      CONCAT('cus_***', RIGHT(stripe_customer_id, 4))
    ELSE NULL 
  END as stripe_id_masked,
  language,
  referrer_url
FROM public.profiles;

-- 3. Criar RLS policies para as views
CREATE POLICY "Admins can read masked checkouts"
ON public.abandoned_checkouts FOR SELECT
TO authenticated
USING (is_admin());

CREATE POLICY "Admins can read masked profiles"
ON public.profiles FOR SELECT
TO authenticated
USING (is_admin() OR auth.uid() = user_id);

-- 4. Criar funcao para acesso completo auditado a PII
CREATE OR REPLACE FUNCTION public.get_customer_email_audited(
  p_record_id uuid,
  p_table_name text,
  p_reason text
)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_email text;
  v_user_id uuid;
  v_admin_email text;
BEGIN
  -- Verificar se e admin
  IF NOT is_admin() THEN
    RAISE EXCEPTION 'Unauthorized: Admin access required';
  END IF;
  
  -- Validar reason
  IF p_reason IS NULL OR LENGTH(TRIM(p_reason)) < 5 THEN
    RAISE EXCEPTION 'Invalid reason: must provide a valid reason (min 5 chars)';
  END IF;
  
  v_user_id := auth.uid();
  
  -- Buscar email do admin
  SELECT email INTO v_admin_email FROM auth.users WHERE id = v_user_id;
  
  -- Buscar email conforme tabela
  IF p_table_name = 'abandoned_checkouts' THEN
    SELECT email INTO v_email 
    FROM abandoned_checkouts 
    WHERE id = p_record_id;
  ELSIF p_table_name = 'profiles' THEN
    SELECT email INTO v_email 
    FROM profiles 
    WHERE id = p_record_id;
  ELSIF p_table_name = 'user_email_automations' THEN
    SELECT email INTO v_email 
    FROM user_email_automations 
    WHERE id = p_record_id;
  ELSE
    RAISE EXCEPTION 'Invalid table name';
  END IF;
  
  IF v_email IS NULL THEN
    RAISE EXCEPTION 'Record not found';
  END IF;
  
  -- Registrar acesso no audit_log
  INSERT INTO audit_log (
    table_name, 
    record_id, 
    action, 
    user_id,
    user_email,
    new_data
  ) VALUES (
    p_table_name,
    p_record_id,
    'PII_ACCESS',
    v_user_id,
    v_admin_email,
    jsonb_build_object(
      'reason', p_reason, 
      'accessed_at', now(),
      'email_accessed', CONCAT(LEFT(v_email, 2), '***@', SPLIT_PART(v_email, '@', 2))
    )
  );
  
  RETURN v_email;
END;
$$;

-- 5. Criar funcao de alerta para acessos suspeitos
CREATE OR REPLACE FUNCTION public.check_pii_access_pattern()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_access_count integer;
BEGIN
  -- Contar acessos PII nos ultimos 5 minutos pelo mesmo usuario
  SELECT COUNT(*) INTO v_access_count
  FROM audit_log
  WHERE action = 'PII_ACCESS'
    AND user_id = NEW.user_id
    AND created_at > now() - interval '5 minutes';
  
  -- Se mais de 10 acessos em 5 min, registrar alerta de seguranca
  IF v_access_count > 10 THEN
    INSERT INTO audit_log (
      table_name, 
      record_id, 
      action, 
      user_id,
      user_email,
      new_data
    ) VALUES (
      'security_alert', 
      gen_random_uuid(), 
      'EXCESSIVE_PII_ACCESS',
      NEW.user_id,
      NEW.user_email,
      jsonb_build_object(
        'alert', 'Excessive PII access detected - possible data harvesting',
        'access_count', v_access_count,
        'period', '5 minutes',
        'detected_at', now()
      )
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- 6. Criar trigger para monitorar acessos PII
DROP TRIGGER IF EXISTS audit_pii_access_pattern ON audit_log;
CREATE TRIGGER audit_pii_access_pattern
AFTER INSERT ON audit_log
FOR EACH ROW
WHEN (NEW.action = 'PII_ACCESS')
EXECUTE FUNCTION check_pii_access_pattern();