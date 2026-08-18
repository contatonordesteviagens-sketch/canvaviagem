# Restaurar acesso dos assinantes

## O que eu verifiquei no banco (dados reais de hoje)

| Situação | Qtde | Efeito hoje |
|---|---|---|
| Assinaturas `active` com período vencido (`current_period_end` no passado) | **22** | **Bloqueadas** — o sistema trata como "grátis" |
| Elite `prod_UTFsXcKq8m0mol` vencidas | 9 | Bloqueadas |
| Elite `prod_UTSmPe3GPt8iHt` vencidas | 5 | Bloqueadas |
| Start `prod_TkvaozfpkAcbpM` vencidas | 8 | Bloqueadas |
| Tabela `stripe_webhook_events` | **0 registros** desde 12/08 | Nenhum evento do Stripe chegou/foi processado |

Datas de vencimento das 22 contas vão de 25/06 a 13/08 — ou seja, elas pararam de ser renovadas no banco, mesmo com a cobrança seguindo no Stripe.

## Causa provável (a confirmar no primeiro passo)

O webhook do Stripe não está registrando nenhum evento (`invoice.payment_succeeded`, `customer.subscription.updated`). Sem esses eventos, o `current_period_end` congela na data da última renovação registrada e, no dia seguinte, tanto o front (`EntitlementsContext`) quanto o backend (`fabrica-entitlements`, `fabricaAccess`) classificam o assinante como `free` e bloqueiam tudo.

Ainda **não está confirmado** se as 22 contas continuam ativas no Stripe. Isso é o primeiro passo do trabalho — nenhuma liberação será dada a quem realmente cancelou.

## Planos e o que cada um deve liberar (regra atual, mantida)

- **Elite** (`prod_UTFsXcKq8m0mol`, `prod_UTSmPe3GPt8iHt`, `prod_UTFlCWzNqvqSNx`, `hotmart_elite`, `elite_ticto`, `monthly_access_pix`, `annual_access_pix`): acesso total — Fábrica, anúncios, carrosséis, sites, CRM, vendedor, biblioteca premium, todas as ferramentas.
- **Start** (`prod_TkvaozfpkAcbpM`, `start_ticto`, `monthly_access_ticto`): biblioteca premium + ferramentas básicas (Narração/Anúncio). Sem Fábrica.
- **Admin**: acesso total.
- **Cancelado / período vencido de verdade**: bloqueado (sem mudança).

## Passos

1. **Reconciliação com o Stripe (leitura)**: para cada uma das 22 contas vencidas, consultar o Stripe pelo `stripe_subscription_id`/`stripe_customer_id` e classificar em: ativa no Stripe (renovar dados) x realmente cancelada/inadimplente (manter bloqueio). Também revisar as `hotmart_elite`/Ticto sem `current_period_end`, que hoje já passam.
2. **Correção dos dados**: atualizar `status`, `current_period_end`, `billing_provider` e `billing_cycle` apenas das assinaturas confirmadas como ativas no Stripe. Nada é cancelado e nenhum teste grátis é reativado.
3. **Conserto do webhook**: diagnosticar por que `stripe_webhook_events` está vazio (assinatura/segredo, endpoint, eventos assinados) e garantir que `invoice.payment_succeeded` e `customer.subscription.updated` gravem a nova data de período. Sem isso, o problema volta no próximo ciclo.
4. **Rede de segurança na renovação**: fazer o `check-subscription` reconciliar com o Stripe também quando a assinatura local estiver `active` porém vencida (hoje ele confia no local e, em alguns caminhos, retorna antes de checar). Assim, um único login já restaura o acesso do assinante mesmo que um evento se perca.
5. **Reativar sites suspensos**: rodar `sync_user_public_site_access` para os usuários recuperados, para reativar sites que foram desativados por `subscription_inactive` durante o bloqueio.
6. **Verificação**: reconsultar o banco (zero assinantes ativos no Stripe classificados como vencidos), e conferir uma conta Elite e uma Start recuperadas de ponta a ponta (entitlements + rota protegida).

## Notas técnicas

- Regras de bloqueio ficam em `src/contexts/EntitlementsContext.tsx`, `supabase/functions/fabrica-entitlements/index.ts`, `supabase/functions/_shared/fabricaAccess.ts` e `public.fabrica_full_access_internal` — todas exigem `status = 'active'` **e** período vigente. Não pretendo afrouxar essa regra; o problema é a data errada, não o critério.
- Ajustes de código previstos: apenas `check-subscription` (passo 4) e o que o diagnóstico do webhook exigir (passo 3).
- O cache `cv-sub-cache-v3` do `AuthContext` é invalidado no login, então não precisa de nova chave.
