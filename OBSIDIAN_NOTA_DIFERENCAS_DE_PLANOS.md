# Diferenças de Planos: Hotmart vs Stripe

## Regra de Ouro (MUITO IMPORTANTE)
**A Hotmart NÃO TEM Plano Start.** 
A Hotmart possui APENAS o Plano **Elite** (dividido em assinatura Mensal e Anual). 

**O Plano Start existe APENAS na Stripe.**

---

### Comportamento no Sistema (Webhooks)

#### 1. Webhook da Hotmart (`supabase/functions/hotmart-webhook/index.ts`)
* A função `resolveTier` deve procurar APENAS por produtos do plano Elite (`HOTMART_ELITE_PRODUCT_IDS`).
* Qualquer outro produto não mapeado como Elite que chegue via Hotmart **DEVE SER REJEITADO** ("Unknown"). Se o usuário comprou algo diferente de Elite na Hotmart, o webhook ignora e não cria a conta, o que está correto de acordo com a regra de negócios.

#### 2. Webhook da Stripe (`supabase/functions/stripe-webhook/index.ts`)
* A Stripe processa normalmente todos os planos (Start, Elite Mensal, Elite Anual, etc.).
* O webhook envia o `product_id` real da Stripe direto para a tabela `subscriptions` do banco de dados.

#### 3. Frontend / Acessos (Blindagem da Fábrica)
* A Fábrica do Canva Viagem é **estritamente** restrita a usuários Elite.
* Para garantir a segurança e impedir que usuários do plano Start (Stripe) burlem o acesso, implementamos um bloqueio absoluto baseado em **IDs literais**. O usuário SÓ tem acesso à Fábrica se o seu `product_id` for exatamente um dos seguintes:
  - `prod_TkvaozfpkAcbpM` (Webhook da Hotmart)
  - `prod_UTFlCWzNqvqSNx` (Stripe Elite 1)
  - `prod_UTFsXcKq8m0mol` (Stripe Elite 2)
  - `prod_UTSmPe3GPt8iHt` (Stripe Elite 3)
* Qualquer ID fora desta lista (o que inclui os IDs aleatórios da Stripe para o plano Start) terá o acesso barrado na mesma hora, sendo redirecionado para a página `/inicio2` (Tela "Desbloqueie a Fábrica").
