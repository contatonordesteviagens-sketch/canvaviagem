---
name: Canvaviagem Email Ativacao
description: Skill de ativação e diagnóstico do ecossistema de email automatizado. Guia o checklist completo de ativação, verifica se tudo está rodando corretamente e resolve problemas comuns com as Edge Functions e pg_cron.
---

# Canvaviagem Email Ativacao

## Checklist Completo de Ativação

Execute este checklist UMA VEZ para ligar todo o sistema de email automatizado.

### PASSO 1 — Extensões do Banco (Supabase Dashboard)
**Database → Extensions → buscar e ativar:**
- `pg_cron` — agenda as funções automáticas
- `pg_net` — permite chamadas HTTP do banco para as Edge Functions

### PASSO 2 — Service Role Key no Vault
**Settings → Vault → New Secret**
```
name:  SUPABASE_SERVICE_ROLE_KEY
value: [sua service role key — começa com eyJ...]
```
Encontrar a service role key em: Settings → API → Service role key

### PASSO 3 — Secrets das Edge Functions
**Edge Functions → Manage Secrets — confirmar que existem:**
- `RESEND_API_KEY` — chave da API do Resend
- `SUPABASE_SERVICE_ROLE_KEY` — mesma do passo 2
- `STRIPE_SECRET_KEY` — já deve existir

### PASSO 4 — Aplicar Migrations (SQL Editor → New query)
Rodar cada bloco abaixo em ordem separada:

**4a.** Arquivo: `supabase/migrations/20260307000001_setup_pg_cron.sql`
→ Agenda os 3 cron jobs (drip 09h, winback 10h, reengajamento 11h BRT)

**4b.** Arquivo: `supabase/migrations/20260307000002_winback_and_reengagement.sql`
→ Cria tabela `winback_emails` + trigger de cancelamento + coluna reengajamento

**4c.** Arquivo: `supabase/migrations/20260307000003_drip_email_4_5.sql`
→ Adiciona colunas `email_4_sent_at` e `email_5_sent_at` ao drip

**4d.** Arquivo: `supabase/migrations/20260307000004_backfill_winback.sql`
→ Insere os ex-assinantes já cancelados na fila de win-back

### PASSO 5 — Deploy das Edge Functions
Fazer push/commit no GitHub → Lovable faz deploy automático.
Verificar em Edge Functions que aparecem:
- `send-winback`
- `send-reengagement`
- `send-drip-campaign` (já existia)

### PASSO 6 — Verificar Crons Ativos
**Database → Cron Jobs** — deve aparecer:

| Job | Horário |
|---|---|
| run-drip-campaign | 0 12 * * * (09h BRT) |
| run-winback | 0 13 * * * (10h BRT) |
| run-reengagement | 0 14 * * * (11h BRT) |

Para testar imediatamente: clicar em **"Run now"** em cada job.

### PASSO 7 — Verificar Webhook do Resend
**Dashboard Resend → Webhooks**
Confirmar que existe um webhook apontando para:
```
https://mgdsjxasolxoclchyqdx.supabase.co/functions/v1/resend-webhook
```
Events habilitados: email.sent, email.delivered, email.opened, email.clicked, email.bounced, email.complained

---

## Diagnóstico — Sistema Já Ativo

Use quando suspeitar que algo não está funcionando.

### Verificar se crons estão rodando
```sql
SELECT jobname, schedule, last_run_success, last_run_starttime, next_run
FROM cron.job
WHERE jobname IN ('run-drip-campaign', 'run-winback', 'run-reengagement')
ORDER BY jobname;
```
Se `last_run_success = false`: checar logs em Edge Functions → Logs da função específica.

### Verificar usuários sem email D0 (boas-vindas pendente)
```sql
SELECT id, email, name, created_at
FROM user_email_automations
WHERE email_1_sent_at IS NULL
  AND unsubscribed = false
ORDER BY created_at DESC;
```
Se aparecer usuários antigos sem email 1: o cron não estava rodando. Rodar `send-drip-campaign` manualmente agora.

### Verificar ex-assinantes na fila de win-back
```sql
SELECT
  we.email,
  we.canceled_at,
  we.winback_1_sent_at,
  we.winback_2_sent_at,
  we.winback_3_sent_at,
  we.reactivated_at
FROM winback_emails we
ORDER BY we.canceled_at DESC;
```

### Verificar taxa de entrega dos emails
```sql
SELECT
  email_type,
  COUNT(*) FILTER (WHERE type = 'sent') AS enviados,
  COUNT(*) FILTER (WHERE type = 'delivered') AS entregues,
  COUNT(*) FILTER (WHERE type = 'bounced') AS bounce,
  COUNT(*) FILTER (WHERE type = 'opened') AS abertos,
  COUNT(*) FILTER (WHERE type = 'clicked') AS clicados
FROM email_events
WHERE created_at > now() - interval '30 days'
GROUP BY email_type
ORDER BY email_type;
```

---

## Problemas Comuns e Soluções

| Problema | Causa | Solução |
|---|---|---|
| Cron não aparece em Database → Cron Jobs | pg_cron não foi habilitado | Habilitar extensão + rodar migration 01 novamente |
| Edge Function retorna 500 | Secret não configurado | Verificar RESEND_API_KEY e SUPABASE_SERVICE_ROLE_KEY |
| `email_events` vazia | Webhook Resend não configurado | Configurar webhook no dashboard Resend |
| Drip não dispara para novo assinante | Trigger `on_auth_user_created_email_automation` falhou | Verificar se trigger existe: `SELECT * FROM information_schema.triggers WHERE trigger_name = 'on_auth_user_created_email_automation'` |
| Win-back não dispara para cancelamentos | Migration 02 não foi aplicada | Rodar `20260307000002_winback_and_reengagement.sql` |
| email_4 e email_5 não existem na tabela | Migration 03 não foi aplicada | Rodar `20260307000003_drip_email_4_5.sql` |

---

## O Que Acontece Automaticamente (Depois de Ativar)

```
NOVO ASSINANTE:
Stripe checkout confirmado
  → stripe-webhook cria usuário em auth.users
  → trigger → user_email_automations criado
  → D0 (amanhã 09h): boas-vindas + tutorial
  → D+3: você está postando? + upsell anual
  → D+5: oferta anual 48h (R$197)
  → D+14: Agente Lucrativo intro (R$97)
  → D+30: Agente Lucrativo última chance

ASSINANTE CANCELA:
  → stripe-webhook atualiza subscriptions.status = 'canceled'
  → trigger → winback_emails criado
  → D+7: sentimos sua falta
  → D+21: novos conteúdos + volta R$29
  → D+45: anual R$147 exclusivo — última mensagem
  → se reativar: reactivated_at preenchido, sequência para

ASSINANTE INATIVO (14+ dias sem login):
  → send-reengagement (11h BRT) detecta
  → 1 email do Lucas: "tudo bem por aí?"
  → não repete antes de 30 dias
```
