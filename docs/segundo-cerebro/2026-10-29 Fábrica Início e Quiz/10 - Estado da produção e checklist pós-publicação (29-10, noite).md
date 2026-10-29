---
tags: [canva-viagem, producao, deploy, checklist, contexto-agentes]
criado: 2026-10-29
atualizado: 2026-10-29
status: publicado em produção (82ba6fb8); backend do Lovable Cloud ainda pendente
---
# Estado da produção e checklist pós-publicação (29/10, noite)
← [[00 - Índice (comece aqui)]]

> Nota feita para **qualquer agente** (ou o Lucas) retomar o contexto sem ler o chat: o que está no ar, o que falta ativar, como testar e como desfazer.

## 1. O que está no ar em `canvaviagem.com` (conferido às 29/10, após o Publish do Lucas)
Commit em produção: **`82ba6fb8`** na `main` (inclui `db61c577` do agente da Woovi). Bundle ao vivo já tem os chunks `Inicio2`, `Checkout`, `PixCheckout`, `InicioCreme`, `Onboarding`.

| Página | Estado conferido no navegador (celular 390px) |
|---|---|
| `/inicio` | Nova página: H1 "Mande um áudio. Receba sua agência inteira pronta.", botão do microfone, faixa infinita de carrosséis com selo "Ilimitado · sem créditos". Sem rolagem lateral. |
| `/inicio2` | Página antiga inteira ("Crie campanhas completas para sua agência em um só lugar."). |
| `/login` | Só "Enviar Link de Acesso" e "Conhecer Planos e Assinar". **Botão do Google escondido** porque o provedor está desligado no Lovable Cloud (ver §2). |
| `/checkout` | Protegida: sem login vai para `/login?redirect=/checkout`. |
| `/onboarding` (quiz) | 18 telas → `/checkout?plano=…`. |

## 2. O que ainda NÃO está ativo no Lovable Cloud (conferido por chamadas diretas à API)
Só o código foi publicado. O backend precisa destas ações manuais no Lovable (Cloud):

| Item | Como conferi | Resultado 29/10 | O que fazer |
|---|---|---|---|
| Migração `20261029150000_email_captures.sql` | `POST /rest/v1/rpc/admin_email_captures` e `capture_email` | **PGRST202 (função não existe)** | Aplicar a migração. Até lá o card "E-mails capturados no login" na Gestão → Usuários mostra "migração pendente" e o `send-magic-link` apenas ignora a captura (não quebra o login). |
| Migração `20261029120000_suspend_unpaid_sites.sql` | `POST /rest/v1/rpc/sync_all_public_sites_access` | **PGRST202** | Rodar antes a consulta de prévia da nota [[07 - Sites de quem não paga e visitas na Gestão]] (quem vai ficar suspenso) e depois aplicar. Precisa de `pg_cron` ligado para a sincronização de hora em hora. |
| Functions `woovi-create-charge`, `woovi-charge-status`, `woovi-webhook` | `OPTIONS /functions/v1/<nome>` | **404 (não publicadas)** | Publicar as functions e colocar os segredos `WOOVI_APP_ID` e `WOOVI_WEBHOOK_SECRET`. Até lá o Pix no `/checkout` mostra o aviso âmbar "não respondeu agora, pague no cartão". |
| Functions `create-checkout`, `send-magic-link`, `fabrica-transcribe-audio` | `OPTIONS` | **200 (existem)** | Confirmar que a versão nova foi publicada (`create-checkout` precisa aceitar `ui_mode: "embedded"`; se não aceitar, o cartão cai no link da Stripe, o que também funciona). |
| Login com Google | `GET /auth/v1/settings` → `external` | **só `email: true`** | Ligar **Google** em Cloud → Users → Auth settings. O botão aparece sozinho na tela de login quando o provedor estiver ligado (sem novo deploy). |
| Worker da Cloudflare (`cloudflare/agency-router`) | — | não publicado | `wrangler deploy` para o redirecionamento de site suspenso → `canvaviagem.com/inicio?utm_source=site_suspenso`. |

Comandos de conferência (bash), com a chave anon de `src/lib/supabase-public.ts`:
```bash
U=https://zdjtcwtakgizbsbbwtgc.supabase.co; KEY=<anon>
curl -s "$U/auth/v1/settings" -H "apikey: $KEY"                       # providers
curl -s -X POST "$U/rest/v1/rpc/admin_email_captures" -H "apikey: $KEY" -H "Authorization: Bearer $KEY" -H "Content-Type: application/json" -d '{}'
for f in woovi-create-charge woovi-charge-status woovi-webhook; do curl -s -o /dev/null -w "$f %{http_code}\n" -X OPTIONS "$U/functions/v1/$f" -H "apikey: $KEY" -H "Origin: https://canvaviagem.com" -H "Access-Control-Request-Method: POST"; done
```

## 3. Correção pequena feita depois do publish (ainda SEM commit)
- `src/components/ProtectedRoute.tsx`: o redirecionamento para o login agora guarda também a query (`/checkout?plano=annual&metodo=pix`), antes perdia o plano e o método. `npx tsc --noEmit` = 0 erros. Entra no próximo commit autorizado.

## 4. Como desfazer (rollback)
| Quero voltar… | Comando (depois: Publish → Update no Lovable) |
|---|---|
| Só esta segunda rodada (nova `/inicio`, checkout, Pix, e-mails) | `git push origin 570e2dbe:main --force` |
| Tudo, à versão publicada antes do dia 29/10 | `git push origin a22142a6:main --force` (tag/branch `backup/producao-2026-10-29`) |
| Reaplicar o novo depois | `git push origin 82ba6fb8:main --force` |
- As migrações **não** são desfeitas pelo git. `email_captures` e as funções podem ficar (não afetam nada antigo). Para desligar a suspensão de sites: `SELECT cron.unschedule('sync-public-sites-access');` e `UPDATE public.public_sites SET is_active = true WHERE …` para o cliente que precisar.
- Código novo também está na branch `feat/inicio-quiz-onboarding`.

## 5. Decisões que continuam com o Lucas
- Manter a promessa "Ilimitado travado para quem assina agora" na `/inicio`.
- Voltar a citar quantidades (250 Reels / 400 artes)? Hoje não citamos (regra do Squad).
- Depoimentos reais para colocar de volta (os antigos não eram confirmados).
- Pendências antigas da nota [[04 - Regras, pendências e como publicar]] (constraint `fabrica_diagnosticos`, preset V2, WhatsApp Iland Noronha, capa Maragogi, URL de retorno dos Payment Links da Stripe → `/fabrica`, republicar os outros 12 sites para o contador de visitas sair com a chave).

## 6. Para o agente da Woovi (resumo da nota [[08 - Página de pagamento (cartão + Pix) e mensagem para o agente da Woovi]])
- Publicar as 3 functions + segredos; `woovi-create-charge` deve aceitar `{ plan, taxId }` e devolver `{ correlationID, brCode, qrCodeImage, paymentLinkUrl, expiresDate }`.
- Depois de testar renovação automática, trocar `PIX_RENOVA_SOZINHO` em `src/components/checkout/PixPanel.tsx`.
- `PayWithPixButton` pode apontar para `/checkout?metodo=pix` em vez do modal.

## 7. Contexto para outros agentes em 5 linhas
1. Projeto `c:\Users\win 10\Desktop\CANVA E FABRICA - JUNHO 26`; produção = `origin/main` via Lovable (Publish → Update); nunca Vercel.
2. Banco/Auth/Functions = Lovable Cloud (Supabase gerenciado, projeto `zdjtcwtakgizbsbbwtgc`); migrações e functions **não** sobem sozinhas pelo git.
3. Regras intocáveis em [[04 - Regras, pendências e como publicar]] (leads do CRM, RLS, variantes V0–V5, tsc + build antes de commit, commit por pathspec).
4. Teste no navegador com `agent-browser` (admin em `/admin-login`).
5. Esta nota é o estado mais recente; a nota [[09 - Copy da página inicio (áudio → tudo pronto, ilimitado)]] explica a copy; [[06 - Contexto para nova conversa (acesso, assinatura e bloqueio)]] explica a liberação de acesso.
