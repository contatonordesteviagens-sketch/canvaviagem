
# Plano: Atualizar Preço para R$ 29,00

## Resumo da Mudança

Atualizar o preço da assinatura mensal de **R$ 37,90** para **R$ 29,00**, incluindo:
- Novo Price ID: `price_1SvPypLXUoWoiE4T9zd9mbfR`
- Novo link de pagamento PT: `https://buy.stripe.com/8x26oIgGuej656zaAY8so05`

---

## Arquivos a Serem Modificados

### 1. Edge Function - Create Checkout
**Arquivo:** `supabase/functions/create-checkout/index.ts`

| Linha | De | Para |
|-------|-----|------|
| 22-23 | `// Price ID for the monthly subscription - R$ 37,90/month`<br>`const PRICE_ID = "price_1SnPjZLXUoWoiE4TWVWEP6TZ";` | `// Price ID for the monthly subscription - R$ 29,00/month`<br>`const PRICE_ID = "price_1SvPypLXUoWoiE4T9zd9mbfR";` |

---

### 2. Traduções (PT)
**Arquivo:** `src/lib/translations.ts`

| Linha | De | Para |
|-------|-----|------|
| 100 | `'plans.price': 'R$ 37,90',` | `'plans.price': 'R$ 29,00',` |
| 104 | `'plans.ctaFinal': 'Começar Agora por R$ 37,90/mês',` | `'plans.ctaFinal': 'Começar Agora por R$ 29,00/mês',` |
| 109 | `'plans.badge': 'OFERTA EXCLUSIVA - Apenas R$37,90/mês',` | `'plans.badge': 'OFERTA EXCLUSIVA - Apenas R$29,00/mês',` |
| 163 | `'premium.cta': 'Assinar Premium - R$ 37,90/mês',` | `'premium.cta': 'Assinar Premium - R$ 29,00/mês',` |

---

### 3. Página de Planos (PT)
**Arquivo:** `src/pages/Planos.tsx`

| Linha | De | Para |
|-------|-----|------|
| 42 | `pt: "https://buy.stripe.com/5kQdRa1LA4Iw42v8sQ8so00",` | `pt: "https://buy.stripe.com/8x26oIgGuej656zaAY8so05",` |
| 111 | `const price = 37.90;` | `const price = 29.00;` |

---

### 4. Premium Gate (Overlay)
**Arquivo:** `src/components/PremiumGate.tsx`

| Linha | De | Para |
|-------|-----|------|
| 7 | `pt: "https://buy.stripe.com/5kQdRa1LA4Iw42v8sQ8so00",` | `pt: "https://buy.stripe.com/8x26oIgGuej656zaAY8so05",` |

---

### 5. Premium Gate Modal
**Arquivo:** `src/components/PremiumGateModal.tsx`

| Linha | De | Para |
|-------|-----|------|
| 8 | `pt: "https://buy.stripe.com/5kQdRa1LA4Iw42v8sQ8so00",` | `pt: "https://buy.stripe.com/8x26oIgGuej656zaAY8so05",` |
| 24 | `price: "R$ 37,90",` | `price: "R$ 29,00",` |

---

### 6. Página Obrigado (Tracking)
**Arquivo:** `src/pages/Obrigado.tsx`

| Linha | De | Para |
|-------|-----|------|
| 18 | `trackPurchase(37.90, 'BRL');` | `trackPurchase(29.00, 'BRL');` |
| 19 | `trackSubscribe(37.90, 'BRL', 37.90 * 12);` | `trackSubscribe(29.00, 'BRL', 29.00 * 12);` |

---

### 7. Página Pós-Pagamento (Tracking)
**Arquivo:** `src/pages/PosPagamento.tsx`

| Linha | De | Para |
|-------|-----|------|
| 42 | `trackPurchase(37.90, 'BRL');` | `trackPurchase(29.00, 'BRL');` |
| 43 | `trackSubscribe(37.90, 'BRL', 37.90 * 12);` | `trackSubscribe(29.00, 'BRL', 29.00 * 12);` |
| 44 | `console.log('[Meta Debug] Purchase & Subscribe events dispatched (R$ 37,90)');` | `console.log('[Meta Debug] Purchase & Subscribe events dispatched (R$ 29,00)');` |

---

### 8. Stripe Webhook - Recovery Email (Opcional)
**Arquivo:** `supabase/functions/stripe-webhook/index.ts`

| Linha | De | Para |
|-------|-----|------|
| 797 | `const checkoutUrl = "https://buy.stripe.com/cNi28s2PEa2Q6aD9wU8so03";` | `const checkoutUrl = "https://buy.stripe.com/8x26oIgGuej656zaAY8so05";` |

---

## Resumo Visual das Mudanças

```text
┌─────────────────────────────────────────────────────────────┐
│                    ANTES → DEPOIS                            │
├─────────────────────────────────────────────────────────────┤
│ Preço:          R$ 37,90  →  R$ 29,00                       │
│ Price ID:       price_1SnP... → price_1SvPyp...             │
│ Link Stripe PT: buy.stripe.com/5kQ... → buy.stripe.com/8x2..│
├─────────────────────────────────────────────────────────────┤
│ Arquivos afetados: 8 arquivos                               │
│ Modificações totais: ~15 linhas                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Versão ES (Espanhol)

O preço em dólar ($9,09 USD) e o link ES **não serão alterados** pois esta mudança é específica para o mercado brasileiro (PT).

---

## Após Implementação

Testar o fluxo completo:
1. Acessar `/planos` e verificar se exibe R$ 29,00
2. Clicar no botão de checkout e verificar se abre o link correto
3. Verificar se o rastreamento do Meta Pixel reporta 29.00 BRL
