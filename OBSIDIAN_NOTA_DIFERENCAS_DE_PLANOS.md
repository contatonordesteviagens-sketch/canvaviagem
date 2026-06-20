# Canva Viagem - Planos, Hotmart, Stripe e Lovable Cloud

Atualizado em: 2026-06-20 15:21:50 -03:00

## Estado real

- Deploy em producao: **NAO confirmado / NAO feito por mim**.
- Codigo local: corrigido e `npm run build` passou.
- Caminho correto de producao: **Lovable Cloud**, nao Supabase CLI local linkado no projeto `mgdsjxasolxoclchyqdx`.
- Risco bloqueado no codigo: hardcode ativo para `mgdsjxasolxoclchyqdx` foi removido do componente da Fabrica e a validacao local agora bloqueia esse projeto em codigo ativo.

## Regra oficial de planos

### Stripe

- `prod_TkvaozfpkAcbpM` = **Start**.
- `prod_UTFsXcKq8m0mol` = **Elite mensal**.
- `prod_UTSmPe3GPt8iHt` = **Elite anual R$347**.
- `prod_UTFlCWzNqvqSNx` = **Elite antigo/anual R$497**.

### Hotmart

- Hotmart, neste fluxo do Canva Viagem, deve liberar apenas **Elite**.
- Produto Hotmart autorizado conhecido: `7876791`.
- Comprador Hotmart autorizado deve ser salvo internamente como `hotmart_elite`.
- Nao usar `prod_TkvaozfpkAcbpM` como canônico Hotmart, porque esse ID e Start da Stripe.

## Regra de acesso

- Canva Viagem / painel principal: qualquer assinante ativo Start ou Elite.
- Fabrica / ferramentas Elite / painel marketing Elite: somente Stripe Elite, Hotmart Elite ou admin real.
- Nao liberar Fabrica por `localStorage`, bypass, projeto errado ou heuristica de valor.

## Arquivos locais corrigidos

- `src/lib/planAccess.ts`
- `supabase/functions/_shared/planAccess.ts`
- `supabase/functions/hotmart-webhook/index.ts`
- `src/components/fabrica/BusinessExtractor.tsx`
- `scripts/validate-official-supabase.mjs`
- `docs_sistema/DADOS_VINCULACAO_HOTMART_API.md`

## O que ainda falta no Lovable Cloud

1. Abrir **Funcoes de borda** e confirmar/publicar:
   - `hotmart-webhook`
   - `stripe-webhook`
   - `check-subscription`
   - `send-magic-link`
   - `generate-magic-link-url`
   - `fabrica-extract-business-info`
2. Em **Segredos**, garantir nomes exatos:
   - `HOTMART_HOTTOK`
   - `HOTMART_ELITE_PRODUCT_IDS`
   - `STRIPE_SECRET_KEY`
   - `STRIPE_WEBHOOK_SECRET`
   - `RESEND_API_KEY`
3. Configurar Hotmart para apontar para a URL real da function `hotmart-webhook` no Lovable Cloud.
4. Testar compra Hotmart real ou webhook simulado com produto `7876791`.

## Criterio de sucesso Hotmart

Um comprador Hotmart deve:

1. Ter e-mail recebido no webhook.
2. Ser encontrado ou criado no Auth.
3. Ter perfil criado/atualizado.
4. Ter assinatura ativa com `product_id = hotmart_elite`.
5. Receber magic link por e-mail.
6. Conseguir login com o e-mail de compra.
7. Acessar Canva Viagem e Fabrica.

## Observacao critica

Nao afirmar que esta funcionando em producao ate publicar no Lovable Cloud e testar com usuario real. A correcao local esta pronta; producao depende do deploy/atualizacao das funcoes no Lovable Cloud.
