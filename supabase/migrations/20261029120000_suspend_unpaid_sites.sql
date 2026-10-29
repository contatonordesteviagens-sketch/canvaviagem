-- Sites de quem não está com o Elite em dia saem do ar.
--
-- A suspensão de 12/08 (revenue_guard) só reavaliava o site quando a linha de
-- subscriptions mudava. Plano que vence pela data (Pix, Hotmart, webhook perdido)
-- não muda a linha, então o site continuava no ar. E publicar sem plano mantinha
-- o padrão is_active = true. Nada é apagado: o HTML fica guardado e volta ao ar
-- sozinho quando o pagamento é regularizado.

-- 1. Publicar/atualizar o site sempre reflete o plano atual (liga OU desliga).
CREATE OR REPLACE FUNCTION public.activate_site_on_eligible_publish()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.owner_id IS NULL THEN
    RETURN NEW;
  END IF;
  IF public.fabrica_full_access_internal(NEW.owner_id) THEN
    NEW.is_active := true;
    NEW.suspended_at := NULL;
    NEW.suspension_reason := NULL;
  ELSE
    NEW.is_active := false;
    NEW.suspended_at := COALESCE(NEW.suspended_at, now());
    NEW.suspension_reason := COALESCE(NEW.suspension_reason, 'subscription_inactive');
  END IF;
  RETURN NEW;
END;
$$;

-- 2. Varredura de todos os donos de site (pega quem venceu pela data).
CREATE OR REPLACE FUNCTION public.sync_all_public_sites_access()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  owner uuid;
  total integer := 0;
BEGIN
  FOR owner IN SELECT DISTINCT owner_id FROM public.public_sites WHERE owner_id IS NOT NULL LOOP
    PERFORM public.sync_user_public_site_access(owner);
    total := total + 1;
  END LOOP;
  RETURN total;
END;
$$;

REVOKE ALL ON FUNCTION public.sync_all_public_sites_access() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.sync_all_public_sites_access() TO service_role;

-- 3. Roda de hora em hora, se o pg_cron estiver ligado (Database → Extensions → pg_cron).
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_cron') THEN
    PERFORM cron.unschedule(jobid) FROM cron.job WHERE jobname = 'sync-public-sites-access';
    PERFORM cron.schedule('sync-public-sites-access', '7 * * * *', 'SELECT public.sync_all_public_sites_access()');
  ELSE
    RAISE NOTICE 'pg_cron não está ativo: ative em Database → Extensions e rode esta migração de novo para agendar a varredura.';
  END IF;
END;
$$;

-- 4. Aplica agora.
SELECT public.sync_all_public_sites_access();
