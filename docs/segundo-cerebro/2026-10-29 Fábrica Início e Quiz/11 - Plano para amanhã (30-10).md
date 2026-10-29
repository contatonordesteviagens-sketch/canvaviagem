---
tags: [canva-viagem, planejamento, pendencias, contexto-agentes]
criado: 2026-10-29
para: 2026-10-30
---
# Plano para amanhã (30/10)
← [[00 - Índice (comece aqui)]] · estado detalhado em [[10 - Estado da produção e checklist pós-publicação (29-10, noite)]]

## Por que ficou pendente (sem rodeio)
O Lucas pediu para resolver e publicar tudo. O **site** foi publicado e funciona. O **servidor** (functions, migrações, Google) **não foi resolvido**: o Lovable não publica functions nem migrações que vêm do GitHub, só pelo chat dele, e o agente não consegue mexer no Lovable (sem a extensão Claude in Chrome nesta sessão; o login do Lovable não passa do Chrome do Lucas para o navegador de teste).
**Primeira coisa amanhã:** abrir a conversa do Claude com a extensão **Claude in Chrome ligada**, para o agente enviar a mensagem no Lovable e conferir sozinho. Ou o Lucas envia a mensagem do passo 1.

## O que já está feito e no ar (conferido 29/10 noite)
- Commits na `main`: `570e2dbe` (usabilidade), `db61c577` (Pix Woovi, código), `82ba6fb8` (nova `/inicio`, `/checkout`, quiz, e-mails, `/inicio2`), `e4f817d2` (login volta ao checkout com plano e método).
- Testado no navegador: `/inicio` nova, `/inicio2` antiga, login sem botão do Google quebrado, `/checkout` sem login → login guardando `?plano=annual&metodo=pix`.
- Cartão (Stripe) funciona. `create-checkout` e `send-magic-link` respondem.

## O que precisa fazer amanhã, em ordem
### 1. Backend no Lovable Cloud (bloqueia o Pix e os e-mails) — 10 min
Colar no chat do Lovable:
```
Sem editar nenhum arquivo de código, faça só isto:
1. Publique (deploy) estas edge functions que já estão na main: woovi-create-charge, woovi-charge-status, woovi-webhook, woovi-renewal-reminder, create-checkout e send-magic-link. Elas usam o secret WOOVI_APP_ID, que já está salvo.
2. Aplique estas duas migrações que já estão em supabase/migrations: 20261029150000_email_captures.sql e 20261029120000_suspend_unpaid_sites.sql. Se a extensão pg_cron não estiver ligada, ligue antes.
3. Ative o login com Google em Users → Auth settings.
NÃO mexa em outras funções, NÃO crie migração nova, NÃO apague dados.
No fim, faça um POST para woovi-webhook com o corpo {"data_criacao":"2026-10-29T08:00:00.000Z","event":"OPENPIX:CHARGE_COMPLETED"} e me diga o status HTTP (deve ser 200).
```
- ⚠ A migração de sites **tira do ar na hora** o site de quem não está com pagamento em dia. Se quiser ver a lista antes, rodar a consulta de prévia da nota [[07 - Sites de quem não paga e visitas na Gestão]] e só depois aplicar.
- Conferir depois (comandos na nota 10): as 4 funções `woovi-*` deixam de dar 404; `admin_email_captures` deixa de dar PGRST202; `/auth/v1/settings` mostra `google: true`.

### 2. Pix funcionando de ponta a ponta — 20 min
- Registrar o webhook na Woovi (URL `…/functions/v1/woovi-webhook`) e o secret `WOOVI_WEBHOOK_SECRET` no Lovable.
- Testar no navegador: `/checkout?metodo=pix` → CPF → "Gerar Pix" → QR aparece.
- **Pix real de R$ 97 pela conta do Lucas** → acesso libera sozinho → assinatura aparece na Gestão.

### 3. Conferências no navegador (agent-browser, admin) — 15 min
- Login com Google aparece e entra.
- Gestão → Usuários: card "E-mails capturados" com números e "Exportar CSV".
- Um site de cliente sem pagamento sai do ar; o dono logado vê o aviso vermelho.

### 4. Fora do código (Lucas)
- Publicar o Worker da Cloudflare (`cloudflare/agency-router`, `wrangler deploy`) para o site suspenso redirecionar ao Canva Viagem.
- Republicar os outros 12 sites de clientes (contador de visitas).
- Stripe: URL de retorno dos Payment Links → `https://canvaviagem.com/fabrica`.
- SQL da constraint `fabrica_diagnosticos`, zerar preset V2, WhatsApp da Iland Noronha, capa do "Maragogi - AL" (lista na nota [[04 - Regras, pendências e como publicar]]).

### 5. NOVO pedido do Lucas: e-mail na `/inicio` vai direto para o quiz (sem "Link Enviado!")
**Problema:** quem vem da `/inicio` digita o e-mail e cai na tela "Link Enviado! Clique no botão lá para entrar". Ela para a venda: a pessoa precisa abrir o e-mail antes de ver o quiz.
**O que o Lucas quer:** digitou o e-mail → vai **direto para o quiz** (`/onboarding`). A `/inicio` existe para vender.
**Decisão do Lucas (29-10):** e-mail novo **entra logado sozinho**; e-mail que já tem conta continua precisando do link.
**Feito no código (29-10, sem commit):**
- [x] Nova função `quick-start-session` (`supabase/functions/quick-start-session/index.ts` + `[functions.quick-start-session] verify_jwt = false` no `config.toml`). E-mail novo: cria a conta e devolve a sessão. E-mail existente: devolve `{ existing: true }` e não abre sessão. Só funciona se houver link enviado nos últimos 5 min (herda o limite de 3 pedidos/15 min do `send-magic-link`).
- [x] `/inicio` (InicioCreme) manda para `/login?redirect=/onboarding&entrada=rapida`. Nesse modo o login diz "Vamos montar sua agência", botão "Continuar", e o e-mail novo vai direto para o quiz, sem a tela "Link Enviado!".
- [x] E-mail salvo na hora: o `send-magic-link` continua sendo chamado antes e grava em `email_captures` (origem `login`, metadado `redirect=/onboarding`). O link de acesso continua indo para o e-mail.
- [x] E-mail que já tem conta: aparece "Link Enviado!" com o aviso "Você já tem uma conta com este e-mail. Por segurança, abra o link para continuar."
- [x] Checkout: cartão (Stripe) já usa o e-mail da sessão; no Pix entrou o campo "E-mail de acesso" (só leitura) no `PixPanel`. Funções woovi-* não mudaram.
- [x] Login normal (sem `entrada=rapida`) continua igual. Se a função nova ainda não estiver publicada, o modo rápido cai na tela "Link Enviado!" (não quebra).
- [x] `npx tsc --noEmit` 0 erros + `npx vite build` ok.
- [ ] **Publicar `quick-start-session` pelo Lovable** (mensagem separada, depois da do Pix).
- [ ] Testar no celular: `/inicio` → e-mail novo → quiz → checkout; e com um e-mail que já tem conta.
**Cuidado de segurança:** ninguém entra numa conta que já existe sem o link. Risco que sobra: alguém digita o e-mail de outra pessoa que ainda **não** tem conta e cria a conta no nome dela (conta vazia, sem pagamento).

### 6. Ainda não feito no código (quando o resto estiver ok)
- Usar a logo enviada na `/inicio` (guardada no navegador) dentro da Fábrica depois do login.
- Revisar os outros "dados incorretos" da Gestão (além das visitas).
- Depois que a renovação automática do Pix for testada: trocar `PIX_RENOVA_SOZINHO` em `src/components/checkout/PixPanel.tsx`.

## Decisões do Lucas
- Manter "Ilimitado travado para quem assina agora"?
- Voltar a citar quantidades (250 Reels / 400 artes)?
- Depoimentos reais para colocar na `/inicio`.

## Como desfazer
- Só a correção do login: `git push origin 82ba6fb8:main --force`
- A rodada nova inteira: `git push origin 570e2dbe:main --force`
- Tudo, antes do dia 29: `git push origin a22142a6:main --force`
- Sempre seguido de **Publish → Update** no Lovable.
