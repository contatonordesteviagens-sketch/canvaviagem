---
name: Canvaviagem Dados Analytics
description: Skill que consulta o Supabase REST API diretamente para buscar dados reais de acessos dos últimos 7 dias, visitas à página de preços, cliques no botão de checkout e fontes de tráfego — e formata tudo em relatório de funil.
---

# Canvaviagem Dados Analytics

Esta skill consulta as tabelas do Supabase diretamente via REST API para trazer dados reais de comportamento dos visitantes no site do Canva Viagem — sem precisar abrir o dashboard do app.

## O Que Esta Skill Entrega

- Acessos totais nos últimos 7 dias (por dia)
- Visitas à página de preços (`/planos` e `/planos-es`)
- Cliques no botão de comprar/checkout
- Fontes de tráfego (de onde vieram os visitantes)
- Leads capturados (usuários que entraram no funil de email)
- Taxa de conversão visitante → assinante

## Credenciais de Acesso

```
Supabase URL:     https://zdjtcwtakgizbsbbwtgc.supabase.co
Supabase Anon Key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpkanRjd3Rha2dpemJzYmJ3dGdjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkwMzIxMjMsImV4cCI6MjA4NDYwODEyM30.juuc45o-OZbLQcx2LaMLyltRABAVy70kgJ_L_JXeUEs
```

## Queries via REST API

### 1. Acessos dos Últimos 7 Dias (Page Views)

```
GET https://zdjtcwtakgizbsbbwtgc.supabase.co/rest/v1/page_views
  ?select=page_path,viewed_at
  &viewed_at=gte.{7_DAYS_AGO_ISO}
  &order=viewed_at.desc

Headers:
  apikey: {ANON_KEY}
  Authorization: Bearer {ANON_KEY}
```

Substituir `{7_DAYS_AGO_ISO}` por data ISO de 7 dias atrás, ex: `2026-02-28T00:00:00.000Z`

### 2. Visitas à Página de Preços

```
GET https://zdjtcwtakgizbsbbwtgc.supabase.co/rest/v1/page_views
  ?select=page_path,viewed_at
  &page_path=in.(/planos,/planos-es,/pricing)
  &viewed_at=gte.{7_DAYS_AGO_ISO}

Headers:
  apikey: {ANON_KEY}
  Authorization: Bearer {ANON_KEY}
```

### 3. Cliques no Checkout (Content Clicks)

```
GET https://zdjtcwtakgizbsbbwtgc.supabase.co/rest/v1/content_clicks
  ?select=content_type,content_id,created_at
  &created_at=gte.{7_DAYS_AGO_ISO}
  &order=created_at.desc

Headers:
  apikey: {ANON_KEY}
  Authorization: Bearer {ANON_KEY}
```

### 4. Fontes de Tráfego

```
GET https://zdjtcwtakgizbsbbwtgc.supabase.co/rest/v1/traffic_sources
  ?select=utm_source,utm_medium,utm_campaign,referrer,created_at
  &created_at=gte.{7_DAYS_AGO_ISO}
  &order=created_at.desc

Headers:
  apikey: {ANON_KEY}
  Authorization: Bearer {ANON_KEY}
```

### 5. Leads dos Últimos 7 Dias (Email Automations)

```
GET https://zdjtcwtakgizbsbbwtgc.supabase.co/rest/v1/user_email_automations
  ?select=created_at,email_1_sent_at,email_2_sent_at,email_3_sent_at
  &created_at=gte.{7_DAYS_AGO_ISO}

Headers:
  apikey: {ANON_KEY}
  Authorization: Bearer {ANON_KEY}
```

### 6. Novas Assinaturas nos Últimos 7 Dias

```
GET https://zdjtcwtakgizbsbbwtgc.supabase.co/rest/v1/subscriptions
  ?select=status,created_at,stripe_price_id
  &created_at=gte.{7_DAYS_AGO_ISO}

Headers:
  apikey: {ANON_KEY}
  Authorization: Bearer {ANON_KEY}
```

## Como Calcular os Dados

Após receber as respostas JSON:

**Acessos por dia (últimos 7 dias):**
Agrupar `page_views` por data (`viewed_at.split('T')[0]`), contar registros por dia.

**Visitas à página de preços:**
Filtrar `page_views` onde `page_path` contém `/planos`. Contar total e agrupar por dia.

**Cliques no checkout:**
Contar registros de `content_clicks`. Agrupar por `content_type` para ver quais tipos de conteúdo são mais clicados.

**Fontes de tráfego:**
Agrupar `traffic_sources` por `utm_source` (ou `referrer` quando utm_source for null). Ordenar por quantidade descrescente.

**Taxa de conversão funil:**
```
visitantes → leads → assinantes
```
Calcular percentual em cada etapa.

## Formato de Resposta

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  CANVA VIAGEM — ANALYTICS 7 DIAS
  Período: [DATA INICIAL] → [DATA FINAL]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

ACESSOS POR DIA
  Seg 02/03  ██████████  142 visitas
  Ter 03/03  ████████░░  118 visitas
  Qua 04/03  █████████░  130 visitas
  Qui 05/03  ████████░░  112 visitas
  Sex 06/03  ███████░░░   98 visitas
  Sab 07/03  █████░░░░░   72 visitas
  Dom 08/03  ████░░░░░░   58 visitas
  ─────────────────────────────────────
  TOTAL 7 DIAS:           730 visitas

PÁGINA DE PREÇOS (/planos)
  Visitas totais:    [N] visitas
  Média diária:      [N/7] visitas/dia
  % do total:        [N/total*100]%

FUNIL DE CONVERSÃO
  Visitantes totais:     [visitors]   100%
    ↓
  Foram à /planos:       [preco_views]  [%]
    ↓
  Cliques no checkout:   [cliques]      [%]
    ↓
  Novos assinantes:      [novos_subs]   [%]

FONTES DE TRÁFEGO (top 5)
  1. [fonte]    [N] visitantes  ([%])
  2. [fonte]    [N] visitantes  ([%])
  3. [fonte]    [N] visitantes  ([%])
  4. [fonte]    [N] visitantes  ([%])
  5. [fonte]    [N] visitantes  ([%])

LEADS CAPTURADOS (7 dias)
  Novos leads:       [leads]
  Email 1 enviado:   [email1] ([%] dos leads)
  Email 2 enviado:   [email2] ([%] do email 1)
  Email 3 enviado:   [email3] ([%] do email 2)

NOVOS ASSINANTES (7 dias)
  Total:             [N]
  Por dia (média):   [N/7]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

## Cálculo da Data de 7 Dias Atrás

Para usar nas queries, calcular a data ISO de 7 dias atrás:
```javascript
const sevenDaysAgo = new Date();
sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
const iso = sevenDaysAgo.toISOString(); // "2026-02-28T00:00:00.000Z"
```

## Limitações do Anon Key

Com a chave anon (pública), algumas tabelas podem ter Row Level Security (RLS) ativo e retornar vazio ou erro 403. Nesse caso:

1. Tentar com o Service Role Key (buscar nos Supabase Secrets do projeto)
2. Ou chamar as Edge Functions já construídas que têm bypass de RLS

Edge Functions alternativas disponíveis no projeto:
- `check-subscription` — verifica assinatura de um usuário
- `stripe-dashboard` — dados completos de Stripe (requer auth admin)

## Quando Chamar Esta Skill

- Quando o Lucas perguntar "quantas pessoas acessaram o site essa semana"
- Quando quiser saber se a página de preços está recebendo tráfego
- Para entender em qual etapa do funil os visitantes estão saindo
- Para identificar de onde vem o tráfego orgânico
- Como parte do Relatório Mensal de Produto
