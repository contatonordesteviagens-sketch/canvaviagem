
# Auditoria de Planos, Stripe e Acesso à Fábrica

Investiguei TODOS os Payment Links ativos na sua Stripe, cruzei com o banco e com o código de gating. Abaixo está tudo organizado.

## 1. Mapa real dos Payment Links (verificado direto na Stripe)

| Link Stripe | Plano (real) | Produto (ID) | Preço | Recorrência |
|---|---|---|---|---|
| `buy.stripe.com/8x26oIgGuej656zaAY8so05` | **Start Mensal** | `prod_TkvaozfpkAcbpM` | R$ 29,00 | mensal |
| `buy.stripe.com/dRm8wQ75U1wk7eH9wU8so09` | **Start Anual** | `prod_TkvaozfpkAcbpM` | R$ 197,00 | anual |
| `buy.stripe.com/28E7sMai6b6Ucz1eRe8so0a` | Start Anual (variação) | `prod_TkvaozfpkAcbpM` | R$ 197,00 | anual |
| `buy.stripe.com/cNi28s2PEa2Q6aD9wU8so03` | Start Mensal (variação 9,90) | `prod_TkvaozfpkAcbpM` | R$ 9,90 | mensal |
| `buy.stripe.com/9B69AUgGuej69mP24s8so02` | Start Mensal (variação 19,90) | `prod_TkvaozfpkAcbpM` | R$ 19,90 | mensal |
| `buy.stripe.com/4gM5kE75Udf26aD5gE8so07` | Start Mensal (variação 29) | `prod_TkvaozfpkAcbpM` | R$ 29,00 | mensal |
| `buy.stripe.com/5kQdRa1LA4Iw42v8sQ8so00` | Start Mensal (variação 37,90) | `prod_TkvaozfpkAcbpM` | R$ 37,90 | mensal |
| `buy.stripe.com/bJe14o89Y6QE42veRe8so01` | Start (one-time R$2) | `prod_TkvaozfpkAcbpM` | R$ 2,00 | one-time |
| `buy.stripe.com/fZucN6bma6QEeH96kI8so0c` | **Elite Mensal** | `prod_UTFsXcKq8m0mol` | R$ 97,00 | mensal |
| `buy.stripe.com/fZu14ogGugreeH9bF28so0d` | **Elite Anual** (R$347) | `prod_UTSmPe3GPt8iHt` | R$ 347,00 | anual |
| `buy.stripe.com/6oU7sM2PEcaY42vcJ68so0b` | Elite Anual (R$497, NÃO usado no app) | `prod_UTFlCWzNqvqSNx` | R$ 497,00 | anual |
| `buy.stripe.com/14AfZigGu5MAfLd4cA8so08` | Outro (R$19) | `prod_U13kzXKP4ceeWe` | R$ 19,00 | mensal |
| `buy.stripe.com/aFafZi2PE5MAgPh24s8so06` | Outro (R$10 one-time) | `prod_Tu5LTvo9GdWoXm` | R$ 10,00 | one-time |
| `buy.stripe.com/bJedRa3TIej6cz15gE8so04` | ES — produto separado | `prod_TsnHjECj482iVM` | US$ 9,90 | one-time |

## 2. Onde cada link aparece no código

| Arquivo | Link usado | Comentário |
|---|---|---|
| `src/pages/Planos.tsx` (PT) | Start Mensal + Start Anual OK | **🔴 Elite Mensal/Anual estão como `#elite-checkout-mensal` e `#elite-checkout-anual` (placeholders mortos)** — quem clica em Elite não vai pra Stripe nenhuma |
| `src/pages/PlanosES.tsx` (ES) | `prod_TsnHjECj482iVM` | Anual = Mensal (placeholder duplicado) |
| `src/pages/SalesPage.tsx` | Start mensal/anual + Elite mensal/anual | Único lugar onde Elite tem link real |
| `src/pages/Fabrica.tsx` (paywall) | Elite Mensal R$97 + Elite Anual R$347 | Correto |
| `supabase/functions/send-drip-campaign` | Start Anual R$197 | OK |
| `supabase/functions/send-winback` | Start Mensal R$29 | OK |
| `supabase/functions/stripe-webhook` (e-mail onboarding) | **🔴 Sempre envia Start R$29** mesmo para quem comprou Elite |
| `supabase/functions/create-checkout` | `price_1SvPypLXUoWoiE4T9zd9mbfR` (Start R$29) | Hardcoded Start |
| `supabase/functions/create-subscription` | `prod_TkvaozfpkAcbpM` (Start) | Hardcoded Start |

## 3. Gating da Fábrica (verificado linha a linha)

- `src/pages/Fabrica.tsx` linha 174: `ELITE_PRODUCT_IDS = ["prod_UTFlCWzNqvqSNx", "prod_UTFsXcKq8m0mol", "prod_UTSmPe3GPt8iHt"]` — cobre os 3 IDs Elite que existem na Stripe ✓
- `isElite = subscription.subscribed && ELITE_PRODUCT_IDS.includes(productId)`
- `hasAccess = isAdmin || isElite || localStorage.cv_bypass`
- `src/components/canva/BottomNav.tsx` usa a mesma lista ✓

**Conclusão lógica:** o gating está correto. Quem tem Start (`prod_TkvaozfpkAcbpM`) NÃO entra na Fábrica. Quem tem qualquer um dos 3 Elite ENTRA.

## 4. Estado real do banco (assinaturas ativas)

| product_id | Status | Quantidade |
|---|---|---|
| `prod_TkvaozfpkAcbpM` (Start) | active | **46** |
| `prod_UTFsXcKq8m0mol` (Elite Mensal) | active | 1 |
| `prod_UTSmPe3GPt8iHt` (Elite Anual R$347) | active | 1 |
| `null` | inactive | 31 |

## 5. Os 4 problemas reais que explicam os bugs

### 🔴 Problema A — Botão Elite no /planos não leva pra Stripe
`Planos.tsx` tem `elite_monthly: "#elite-checkout-mensal"` e `elite_annual: "#elite-checkout-anual"`. Cliente clica em Elite e abre uma âncora morta. Os únicos compradores de Elite no banco vieram pela **SalesPage**, não pelo /planos.

### 🔴 Problema B — Trigger `on_auth_user_created` está faltando
Existe `on_auth_user_created_email_automation`, mas **NÃO** existe trigger que chame `public.handle_new_user()`. Por isso a tabela `profiles` está vazia/sem email para usuários novos. Isso quebra qualquer join que busca email pelo `user_id`.

### 🔴 Problema C — E-mail de onboarding sempre vende Start
`stripe-webhook` linha 450: `checkoutUrl = "https://buy.stripe.com/8x26oIgGuej656zaAY8so05"` (Start R$29) é enviado para TODOS, inclusive quem acabou de comprar Elite. Confunde o cliente.

### 🟡 Problema D — `create-checkout` e `create-subscription` só vendem Start
Se algum botão antigo ainda chama essas funções, sempre cai em Start. Hoje os links principais são Payment Links Stripe diretos, então o impacto é menor — mas é uma armadilha.

## 6. O que vou fazer (correções propostas)

### A. Corrigir links Elite no /planos
- Trocar `STRIPE.elite_monthly` por `https://buy.stripe.com/fZucN6bma6QEeH96kI8so0c`
- Trocar `STRIPE.elite_annual` por `https://buy.stripe.com/fZu14ogGugreeH9bF28so0d`

### B. Recriar o trigger `handle_new_user`
- Criar `CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();`
- Backfill: popular `profiles.email` para todos os usuários existentes a partir de `auth.users.email`.

### C. E-mail de onboarding consciente do plano
- No `stripe-webhook`, escolher o link e o nome do plano com base no `productId` real:
  - `prod_TkvaozfpkAcbpM` → "Start" (sem CTA de upgrade no e-mail boas-vindas, mas com CTA leve para Elite)
  - `prod_UTF*` / `prod_UTSm*` → "Elite" (com CTA pra Fábrica)

### D. Reauditoria dos 46 Start
- Cruzar cada `stripe_subscription_id` Start no banco com a Stripe API para confirmar se o produto realmente é `prod_TkvaozfpkAcbpM` ou se algum Elite ficou rebaixado por algum bug antigo. Se aparecer algum Elite gravado errado, atualizar product_id no banco.

### E. (Opcional) Marcar `create-checkout` / `create-subscription`
- Adicionar log de aviso se forem chamadas, ou desativar se confirmarmos que ninguém mais usa.

## 7. Validação final (depois das correções)

1. Comprar pelo /planos botão Elite Anual → confirmar que abre `fZu14ogGugreeH9bF28so0d` na Stripe.
2. Webhook recebe → grava `product_id = prod_UTSmPe3GPt8iHt` no banco.
3. `profiles` recebe email automaticamente via trigger.
4. Magic link chega no e-mail (já corrigido em sessão anterior).
5. Login → `check-subscription` retorna `product_id: prod_UTSmPe3GPt8iHt`.
6. `/fabrica` → `isElite = true` → entra na ferramenta.
7. Comprar Start → mesmo fluxo, mas `/fabrica` mostra paywall correto.

Quer que eu execute essas 5 correções (A–E) agora?
