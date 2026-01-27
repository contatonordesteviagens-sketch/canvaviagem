
# Plano: Dashboard de Funil de Marketing Completo

## Resumo

Vou criar um dashboard de marketing completo que mostra todo o funil desde a fonte de tráfego até a conversão, com métricas claras de cada etapa e taxas de conversão para identificar gargalos.

---

## 1. Rastreamento de Fontes de Tráfego (UTM Tracking)

### Nova tabela: `traffic_sources`
```sql
CREATE TABLE traffic_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  session_id TEXT NOT NULL,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  utm_content TEXT,
  utm_term TEXT,
  referrer TEXT,
  landing_page TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### Hook de Rastreamento
- Capturar UTM parameters da URL quando visitante chega
- Salvar no localStorage e depois associar ao user_id quando converter

### Associação com Assinatura
- Adicionar coluna `traffic_source_id` na tabela `subscriptions` para saber de onde veio cada assinante

---

## 2. Melhorar Dados de Email (Resend Webhooks)

### Configuração Necessária (você precisa fazer no Resend):
1. Acessar https://resend.com/webhooks
2. Adicionar webhook para a URL: `https://zdjtcwtakgizbsbbwtgc.supabase.co/functions/v1/resend-webhook`
3. Selecionar eventos: `email.sent`, `email.delivered`, `email.opened`, `email.clicked`, `email.bounced`

### Atualização do Dashboard
- Mostrar taxa de abertura real (opened/sent)
- Mostrar taxa de cliques real (clicked/opened)
- Mostrar bounces e problemas de entrega

---

## 3. Nova Seção: Funil de Conversão Visual

### Arquivo: `src/components/gestao/MarketingFunnelSection.tsx` (NOVO)

Componente que mostra o funil completo em formato visual:

```text
┌─────────────────────────────────────────────────────┐
│  VISUALIZAÇÕES DE PÁGINA                            │
│  1.500 visitantes                                    │
└───────────────────────────┬─────────────────────────┘
                            │ 2.4% conversão
┌───────────────────────────▼─────────────────────────┐
│  CADASTROS (LEADS)                                  │
│  36 usuários                                        │
└───────────────────────────┬─────────────────────────┘
                            │ 100% (email 1)
┌───────────────────────────▼─────────────────────────┐
│  EMAIL 1 ENVIADO                                    │
│  36 emails                                          │
└───────────────────────────┬─────────────────────────┘
                            │ 55% (email 2)
┌───────────────────────────▼─────────────────────────┐
│  EMAIL 2 ENVIADO                                    │
│  20 emails                                          │
└───────────────────────────┬─────────────────────────┘
                            │ 55% conversão final
┌───────────────────────────▼─────────────────────────┐
│  ASSINANTES                                         │
│  20 pagantes                                        │
└─────────────────────────────────────────────────────┘
```

### Métricas em cada etapa:
- Número absoluto
- Porcentagem de conversão da etapa anterior
- Variação vs. período anterior (seta verde/vermelha)

---

## 4. Nova Seção: Performance de E-mail Marketing

### Arquivo: `src/components/gestao/EmailPerformanceSection.tsx` (NOVO)

Cards detalhados:
- **Emails Enviados**: Total por tipo (Email 1, 2, 3)
- **Taxa de Entrega**: delivered/sent
- **Taxa de Abertura**: opened/delivered
- **Taxa de Cliques**: clicked/opened
- **Taxa de Bounce**: bounced/sent
- **Descadastros**: unsubscribed count

### Gráficos:
- Linha: Evolução de envios por dia (últimos 7 dias)
- Barras: Performance por tipo de email
- Pizza: Distribuição do funil de emails

---

## 5. Nova Seção: Atribuição e Fontes

### Arquivo: `src/components/gestao/AttributionSection.tsx` (NOVO)

Tabela mostrando:
| Fonte | Visitantes | Cadastros | Assinantes | Taxa Conv. | Receita |
|-------|------------|-----------|------------|------------|---------|
| Google Ads | 500 | 15 | 8 | 1.6% | R$ 79,20 |
| Orgânico | 800 | 12 | 5 | 0.6% | R$ 49,50 |
| Instagram | 200 | 9 | 7 | 3.5% | R$ 69,30 |

### Filtros:
- Por período (hoje, 7 dias, 30 dias, custom)
- Por fonte (utm_source)
- Por campanha (utm_campaign)

---

## 6. Reorganização do Dashboard

### Arquivo: `src/components/gestao/DashboardSection.tsx` (ATUALIZAR)

Nova estrutura com abas:
1. **Visão Geral** - KPIs principais (já existe)
2. **Funil** - Visualização do funil completo (NOVO)
3. **E-mail** - Performance de email marketing (NOVO)
4. **Fontes** - Atribuição por fonte de tráfego (NOVO)

---

## 7. Hook para Métricas de Funil

### Arquivo: `src/hooks/useMarketingFunnel.ts` (NOVO)

```typescript
interface FunnelMetrics {
  visitors: number;
  leads: number;
  email1Sent: number;
  email1Opened: number;
  email2Sent: number;
  email2Opened: number;
  email3Sent: number;
  email3Opened: number;
  subscribers: number;
  conversionRates: {
    visitorToLead: number;
    leadToEmail1Open: number;
    email1ToEmail2: number;
    email2ToSubscriber: number;
    overallConversion: number;
  };
}
```

---

## 8. Captura de UTM no Frontend

### Arquivo: `src/hooks/useTrackUtm.ts` (NOVO)

```typescript
// Captura UTMs da URL e salva
const useTrackUtm = () => {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const utmData = {
      utm_source: params.get('utm_source'),
      utm_medium: params.get('utm_medium'),
      utm_campaign: params.get('utm_campaign'),
      referrer: document.referrer,
      landing_page: window.location.pathname,
    };
    if (utmData.utm_source) {
      localStorage.setItem('utm_data', JSON.stringify(utmData));
    }
  }, []);
};
```

---

## Arquivos a Criar/Modificar

| Arquivo | Ação |
|---------|------|
| `src/components/gestao/MarketingFunnelSection.tsx` | CRIAR - Funil visual |
| `src/components/gestao/EmailPerformanceSection.tsx` | CRIAR - Métricas de email |
| `src/components/gestao/AttributionSection.tsx` | CRIAR - Fontes de tráfego |
| `src/hooks/useMarketingFunnel.ts` | CRIAR - Hook para dados do funil |
| `src/hooks/useTrackUtm.ts` | CRIAR - Captura de UTMs |
| `src/components/gestao/DashboardSection.tsx` | ATUALIZAR - Adicionar abas |
| `src/hooks/useEmailDashboard.ts` | ATUALIZAR - Mais métricas de email |
| Migration SQL | CRIAR - Tabela traffic_sources |

---

## Resultado Esperado

### Antes:
- Métricas isoladas sem conexão
- Sem visualização de funil
- Sem rastreamento de fontes
- Difícil identificar gargalos

### Depois:
- Funil visual completo (Visitantes → Leads → Emails → Assinantes)
- Taxa de conversão em cada etapa
- Identificação clara de gargalos (etapa com menor %)
- Atribuição por fonte de tráfego
- Performance detalhada de email marketing
- Tudo em português

---

## Ação Necessária da Sua Parte

Para ter dados completos de email (aberturas, cliques), você precisa:

1. Acessar https://resend.com/webhooks
2. Clicar "Add Webhook"
3. Colar a URL: `https://zdjtcwtakgizbsbbwtgc.supabase.co/functions/v1/resend-webhook`
4. Selecionar todos os eventos: sent, delivered, opened, clicked, bounced
5. Salvar

Sem isso, só teremos dados de "enviados", não de "abertos" e "clicados".

---

## Diagrama do Funil Proposto

```text
TRÁFEGO
   │
   ├── Google Ads (utm_source=google)
   ├── Instagram (utm_source=instagram)
   ├── Orgânico (sem UTM)
   │
   ▼
LANDING PAGE
   │
   ├── /planos (principais conversões)
   ├── / (home)
   │
   ▼
CADASTRO (Lead)
   │
   ▼
EMAIL 1: Boas-vindas
   │
   ├── Abriu? (taxa de abertura)
   │
   ▼
EMAIL 2: Curso (3 dias)
   │
   ├── Abriu? (taxa de abertura)
   │
   ▼
EMAIL 3: Oferta (5 dias)
   │
   ├── Clicou? (taxa de clique)
   │
   ▼
CHECKOUT STRIPE
   │
   ▼
ASSINANTE ATIVO
```

Este é o funil completo que vou implementar no dashboard.
