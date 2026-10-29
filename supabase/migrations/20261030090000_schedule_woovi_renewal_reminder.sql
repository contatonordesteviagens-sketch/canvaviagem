-- =============================================
-- PIX (Woovi) — aviso de renovação
-- O agendamento foi movido para 20261030120000_scheduled_jobs.sql:
-- o Lovable bloqueia migração que lê o vault, e a versão nova chama a função com a chave pública
-- (a função se protege rodando no máximo 1 vez a cada 20 h).
-- Esta migração ficou sem efeito de propósito.
-- =============================================
select 1;
