# Status Lovable Cloud + Hotmart - 2026-06-20

## Resumo honesto

O deploy em producao **ainda nao foi confirmado**. A correcao foi feita localmente e o build passou, mas a publicacao precisa acontecer pelo **Lovable Cloud**, onde estao as tabelas reais do app.

Nao usar o Supabase CLI local enquanto ele estiver preso/cacheado em `mgdsjxasolxoclchyqdx`.

## Banco correto de trabalho

Pelo print do Lovable Cloud, o banco ativo tem dados reais como:

- `perfis`
- `assinaturas`
- `tokens_de_link_magicos`
- `fabrica_diagnosticos`
- `sites_publicos`
- `fontes_de_trafego`
- `atividades_do_usuario`

Esse e o caminho mais seguro. Nao migrar nem apontar usuarios para `mgdsjxasolxoclchyqdx`.

## Regra de planos aplicada no codigo local

### Start

- `prod_TkvaozfpkAcbpM`

### Elite Stripe

- `prod_UTFsXcKq8m0mol`
- `prod_UTSmPe3GPt8iHt`
- `prod_UTFlCWzNqvqSNx`

### Elite Hotmart

- Produto Hotmart autorizado: `7876791`
- Product ID interno: `hotmart_elite`

## Arquivos alterados

- `src/lib/planAccess.ts`
- `supabase/functions/_shared/planAccess.ts`
- `supabase/functions/hotmart-webhook/index.ts`
- `src/components/fabrica/BusinessExtractor.tsx`
- `scripts/validate-official-supabase.mjs`
- `package.json`
- `docs_sistema/DADOS_VINCULACAO_HOTMART_API.md`
- `OBSIDIAN_NOTA_DIFERENCAS_DE_PLANOS.md`

## Validacoes locais feitas

- `npm run build`: passou.
- `node scripts/validate-official-supabase.mjs --skip-cli-link`: passou.
- Busca por `mgdsjxasolxoclchyqdx` em codigo ativo: so sobrou no arquivo de guard como referencia bloqueada intencional.

## O que falta publicar/configurar no Lovable Cloud

1. Confirmar se as funcoes existem em **Nuvem > Funcoes de borda**:
   - `hotmart-webhook`
   - `stripe-webhook`
   - `check-subscription`
   - `send-magic-link`
   - `generate-magic-link-url`
   - `fabrica-extract-business-info`
2. Atualizar/publicar as funcoes alteradas.
3. Confirmar segredos com nomes exatos:
   - `HOTMART_HOTTOK`
   - `HOTMART_ELITE_PRODUCT_IDS`
   - `STRIPE_SECRET_KEY`
   - `STRIPE_WEBHOOK_SECRET`
   - `RESEND_API_KEY`
4. Ajustar webhook da Hotmart para a URL real da function `hotmart-webhook`.
5. Testar um comprador Hotmart com e-mail real.

## Garantia possivel

Nao e honesto garantir producao antes do deploy e teste real.

O que da para garantir no codigo local: se a function `hotmart-webhook` corrigida for publicada no Lovable Cloud e receber evento aprovado do produto `7876791`, ela deve salvar o usuario como assinatura ativa Elite (`hotmart_elite`) e liberar Canva Viagem + Fabrica pelo mesmo e-mail da compra.

## Teste minimo obrigatorio

1. Simular/receber `PURCHASE_APPROVED` da Hotmart com produto `7876791`.
2. Ver em `assinaturas` se o usuario ficou com:
   - `status = active`
   - `product_id = hotmart_elite`
3. Ver se o e-mail foi salvo em `perfis`/perfil equivalente.
4. Ver se o magic link foi criado/enviado.
5. Entrar com o e-mail do comprador.
6. Confirmar acesso ao Canva Viagem.
7. Confirmar acesso a Fabrica.
