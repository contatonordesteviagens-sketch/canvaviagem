---
name: Canvaviagem Dados Stripe
description: Skill que chama diretamente a Supabase Edge Function stripe-dashboard para buscar dados reais de assinantes, MRR, receita e churn do Canva Viagem — e formata o resultado em relatório claro com números do período.
---

# Canvaviagem Dados Stripe

Esta skill busca dados reais da conta Stripe do Canva Viagem chamando a Edge Function já construída no projeto. Não é estimativa. São os números reais do momento.

## O Que Esta Skill Entrega

Ao ser acionada, esta skill retorna:
- Assinantes ativos agora
- MRR (Receita Recorrente Mensal)
- Faturamento do mês atual vs mês anterior
- Crescimento percentual
- Taxa de churn
- Cancelamentos no mês
- Em trial agora
- Receita total acumulada
- Ticket médio
- LTV estimado
- Histórico de receita dos últimos 6 meses
- Crescimento de assinaturas por mês

## Como Buscar os Dados

### Endpoint

A Edge Function está disponível em:
```
POST https://zdjtcwtakgizbsbbwtgc.supabase.co/functions/v1/stripe-dashboard
```

### Headers necessários

```
Authorization: Bearer {TOKEN_ADMIN}
Content-Type: application/json
```

O TOKEN_ADMIN é o token de sessão de um usuário com role admin no Supabase. Para obter via CLI do Supabase ou via login no app.

### Chamada via WebFetch

Quando chamado como agente, usar WebFetch com:
- URL: `https://zdjtcwtakgizbsbbwtgc.supabase.co/functions/v1/stripe-dashboard`
- Method: POST
- Header Authorization com token de admin

### Resposta Esperada (JSON)

```json
{
  "mrr": 870.00,
  "activeSubscribers": 30,
  "totalCustomers": 45,
  "churnRate": 8.5,
  "currentMonthRevenue": 1200.00,
  "lastMonthRevenue": 980.00,
  "growth": 22.4,
  "totalRevenue": 8400.00,
  "averageTicket": 29.00,
  "estimatedLTV": 341.17,
  "monthlyChurns": 2,
  "trialingCount": 3,
  "revenueChartData": [
    { "month": "Set/25", "revenue": 620 },
    { "month": "Out/25", "revenue": 740 },
    { "month": "Nov/25", "revenue": 890 },
    { "month": "Dez/25", "revenue": 980 },
    { "month": "Jan/26", "revenue": 980 },
    { "month": "Fev/26", "revenue": 1200 }
  ],
  "subscriptionChartData": [
    { "month": "Set/25", "subscriptions": 8 },
    { "month": "Out/25", "subscriptions": 12 }
  ]
}
```

## Alternativa — Chamada Direta ao Stripe

Se o token admin não estiver disponível, é possível chamar o Stripe diretamente usando a chave secreta configurada nos secrets do Supabase.

Endpoints Stripe relevantes:
- `GET https://api.stripe.com/v1/subscriptions?status=active&limit=100`
- `GET https://api.stripe.com/v1/customers?limit=100`
- `GET https://api.stripe.com/v1/invoices?status=paid&limit=100`

Header: `Authorization: Bearer {STRIPE_SECRET_KEY}`

A STRIPE_SECRET_KEY está nos Supabase Secrets do projeto `zdjtcwtakgizbsbbwtgc`. Para acessar, usar o painel Supabase → Settings → Edge Functions → Secrets.

## Como Formatar a Resposta

Após receber os dados, formatar sempre assim:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   CANVA VIAGEM — PAINEL STRIPE
   Atualizado em: [data/hora atual]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

ASSINANTES
  Ativos agora:      [activeSubscribers]
  Total clientes:    [totalCustomers]
  Em trial:          [trialingCount]

RECEITA
  MRR atual:         R$ [mrr]
  Faturamento mês:   R$ [currentMonthRevenue]
  Mês anterior:      R$ [lastMonthRevenue]
  Crescimento:       [growth]%
  Receita total:     R$ [totalRevenue]

POR ASSINANTE
  Ticket médio:      R$ [averageTicket]
  LTV estimado:      R$ [estimatedLTV]

SAÚDE
  Churn rate:        [churnRate]%
  Cancelamentos/mês: [monthlyChurns]

RECEITA ÚLTIMOS 6 MESES
  [gráfico ASCII com revenueChartData]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

## Gráfico ASCII de Barras

Para renderizar o `revenueChartData` como gráfico de texto:

```
Receita Mensal (R$)
Set/25  ████████░░░░░░░░  R$620
Out/25  █████████░░░░░░░  R$740
Nov/25  ███████████░░░░░  R$890
Dez/25  ████████████░░░░  R$980
Jan/26  ████████████░░░░  R$980
Fev/26  ███████████████░  R$1200
```

Escalar cada barra proporcionalmente ao valor máximo, usando 15 blocos como 100%.

## Quando Chamar Esta Skill

- Quando o Lucas pedir "quantos assinantes tenho"
- Quando pedir o faturamento do mês
- Na abertura do Relatório Mensal do Departamento de Produto
- Quando quiser comparar crescimento mês a mês
- Antes de tomar decisão sobre lançar produto novo (para entender contexto atual de receita)

## Dados do Projeto

- Supabase URL: `https://zdjtcwtakgizbsbbwtgc.supabase.co`
- Supabase Project ID: `zdjtcwtakgizbsbbwtgc`
- Edge Function: `stripe-dashboard`
- Planos Stripe: mensal (R$29/mês) e anual (R$97/ano → ~R$8,08/mês normalizado)
