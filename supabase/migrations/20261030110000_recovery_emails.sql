-- Recuperação automática de quem gerou Pix / abriu cartão e não pagou.
-- 3 e-mails (1 h, 3º dia, 7º dia), no máximo 1 de cada tipo por e-mail; quem pede para sair nunca mais recebe.
-- Só cria tabelas novas e um agendamento. Não altera nem apaga dados existentes.

CREATE TABLE IF NOT EXISTS public.recovery_email_log (
  email text NOT NULL,
  kind text NOT NULL,              -- pronta | desconto | contato
  sent_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (email, kind)
);
ALTER TABLE public.recovery_email_log ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.recovery_email_log FROM anon, authenticated;
GRANT ALL ON public.recovery_email_log TO service_role;

CREATE TABLE IF NOT EXISTS public.email_unsubscribes (
  email text PRIMARY KEY,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.email_unsubscribes ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.email_unsubscribes FROM anon, authenticated;
GRANT ALL ON public.email_unsubscribes TO service_role;

-- Gestão (só admin): quais e-mails de recuperação cada pessoa já recebeu.
CREATE OR REPLACE FUNCTION public.admin_recovery_emails()
RETURNS TABLE (email text, kind text, sent_at timestamptz, unsubscribed boolean)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT l.email, l.kind, l.sent_at, EXISTS (SELECT 1 FROM public.email_unsubscribes u WHERE u.email = l.email)
  FROM public.recovery_email_log l
  WHERE public.is_admin()
  ORDER BY l.sent_at DESC;
$$;
REVOKE ALL ON FUNCTION public.admin_recovery_emails() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_recovery_emails() TO authenticated;

-- De hora em hora: e-mails de recuperação (mesmo padrão do drip: chave do vault).
create extension if not exists pg_cron;
create extension if not exists pg_net;

select cron.unschedule('recovery-emails') where exists (
  select 1 from cron.job where jobname = 'recovery-emails'
);

select cron.schedule(
  'recovery-emails',
  '15 * * * *',
  $$
  select net.http_post(
    url := 'https://zdjtcwtakgizbsbbwtgc.supabase.co/functions/v1/recovery-emails',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || (
        select decrypted_secret
        from vault.decrypted_secrets
        where name = 'SUPABASE_SERVICE_ROLE_KEY'
        limit 1
      )
    ),
    body := '{}'::jsonb
  ) as request_id;
  $$
);
