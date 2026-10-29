-- =============================================
-- PIX (Woovi) — aviso de renovação, todo dia às 12:00 UTC (09:00 BRT)
-- Mesmo padrão do drip/win-back (20260307000001_setup_pg_cron.sql):
-- a chave service role vem do vault, então não há segredo novo para colar.
-- Só agenda; não altera nenhuma tabela.
-- =============================================
create extension if not exists pg_cron;
create extension if not exists pg_net;

select cron.unschedule('woovi-renewal-reminder') where exists (
  select 1 from cron.job where jobname = 'woovi-renewal-reminder'
);

select cron.schedule(
  'woovi-renewal-reminder',
  '0 12 * * *',
  $$
  select net.http_post(
    url := 'https://zdjtcwtakgizbsbbwtgc.supabase.co/functions/v1/woovi-renewal-reminder',
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
