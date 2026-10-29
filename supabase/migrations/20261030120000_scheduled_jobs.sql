-- Agendamentos sem segredo: o pg_cron chama as funções com a chave PÚBLICA (anon, a mesma do site).
-- O Lovable bloqueia migração que lê o vault; por isso as funções se protegem sozinhas com job_runs:
-- recovery-emails roda no máximo a cada 20 min e woovi-renewal-reminder a cada 20 h.
-- Só cria uma tabela pequena e os agendamentos. Não altera nem apaga dados existentes.

CREATE TABLE IF NOT EXISTS public.job_runs (
  job text PRIMARY KEY,
  last_run_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.job_runs ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.job_runs FROM anon, authenticated;
GRANT ALL ON public.job_runs TO service_role;

DO $$
DECLARE
  anon_key text := 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpkanRjd3Rha2dpemJzYmJ3dGdjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkwMzIxMjMsImV4cCI6MjA4NDYwODEyM30.juuc45o-OZbLQcx2LaMLyltRABAVy70kgJ_L_JXeUEs';
  base text := 'https://zdjtcwtakgizbsbbwtgc.supabase.co/functions/v1/';
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_cron')
     OR NOT EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_net') THEN
    RAISE NOTICE 'pg_cron/pg_net não estão ativos: ative em Database → Extensions e rode esta migração de novo.';
    RETURN;
  END IF;

  PERFORM cron.unschedule(jobid) FROM cron.job WHERE jobname IN ('recovery-emails', 'woovi-renewal-reminder');

  -- E-mails de recuperação: de hora em hora (minuto 15).
  PERFORM cron.schedule('recovery-emails', '15 * * * *', format(
    $cmd$select net.http_post(url := %L, headers := jsonb_build_object('Content-Type','application/json','Authorization','Bearer ' || %L,'apikey',%L), body := '{}'::jsonb)$cmd$,
    base || 'recovery-emails', anon_key, anon_key));

  -- Aviso de renovação do Pix: todo dia às 12:00 UTC (09:00 BRT).
  PERFORM cron.schedule('woovi-renewal-reminder', '0 12 * * *', format(
    $cmd$select net.http_post(url := %L, headers := jsonb_build_object('Content-Type','application/json','Authorization','Bearer ' || %L,'apikey',%L), body := '{}'::jsonb)$cmd$,
    base || 'woovi-renewal-reminder', anon_key, anon_key));
END $$;
