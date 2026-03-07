-- =============================================
-- Configurar pg_cron + pg_net para agendar Edge Functions
-- IMPORTANTE: pg_cron e pg_net devem estar habilitados no projeto Supabase
-- Dashboard → Database → Extensions → ativar "pg_cron" e "pg_net"
-- =============================================

-- Habilitar extensões necessárias
create extension if not exists pg_cron;
create extension if not exists pg_net;

-- =============================================
-- DRIP CAMPAIGN — roda todo dia às 12:00 UTC (09:00 BRT)
-- =============================================
-- Remover agendamento anterior se existir
select cron.unschedule('run-drip-campaign') where exists (
  select 1 from cron.job where jobname = 'run-drip-campaign'
);

select cron.schedule(
  'run-drip-campaign',
  '0 12 * * *',
  $$
  select net.http_post(
    url := 'https://mgdsjxasolxoclchyqdx.supabase.co/functions/v1/send-drip-campaign',
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

-- =============================================
-- WIN-BACK — roda todo dia às 13:00 UTC (10:00 BRT)
-- =============================================
select cron.unschedule('run-winback') where exists (
  select 1 from cron.job where jobname = 'run-winback'
);

select cron.schedule(
  'run-winback',
  '0 13 * * *',
  $$
  select net.http_post(
    url := 'https://mgdsjxasolxoclchyqdx.supabase.co/functions/v1/send-winback',
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

-- =============================================
-- RE-ENGAGEMENT — roda todo dia às 14:00 UTC (11:00 BRT)
-- =============================================
select cron.unschedule('run-reengagement') where exists (
  select 1 from cron.job where jobname = 'run-reengagement'
);

select cron.schedule(
  'run-reengagement',
  '0 14 * * *',
  $$
  select net.http_post(
    url := 'https://mgdsjxasolxoclchyqdx.supabase.co/functions/v1/send-reengagement',
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

-- =============================================
-- NOTA: Antes de aplicar esta migration, adicione o secret no Vault:
-- Dashboard → Settings → Vault → New Secret
-- name: SUPABASE_SERVICE_ROLE_KEY
-- value: sua service role key (começa com eyJ...)
-- =============================================
