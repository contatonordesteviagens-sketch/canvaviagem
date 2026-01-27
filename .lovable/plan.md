
# Plano: Sistema Completo de Marketing Analytics & Atribuicao (UTM)

## Resumo Executivo

Voce ja tem uma base solida de tracking implementada. Vou expandir significativamente o sistema para criar uma "Visao de Deus" do seu funil de marketing, com atribuicao de receita por canal e metricas de ROI.

---

## 1. Banco de Dados - Alteracoes

### 1.1 Adicionar colunas UTM na tabela `profiles`

```sql
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS utm_source text,
ADD COLUMN IF NOT EXISTS utm_medium text,
ADD COLUMN IF NOT EXISTS utm_campaign text,
ADD COLUMN IF NOT EXISTS referrer_url text,
ADD COLUMN IF NOT EXISTS first_visit_at timestamptz DEFAULT now();

CREATE INDEX IF NOT EXISTS idx_profiles_utm_source ON public.profiles(utm_source);
```

Motivo: Guardar a origem de cada usuario de forma permanente para calculo de ROI.

### 1.2 Criar tabela `analytics_events`

```sql
CREATE TABLE IF NOT EXISTS public.analytics_events (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id),
  session_id text,
  event_type text NOT NULL,
  event_data jsonb DEFAULT '{}',
  url_path text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_events_type ON public.analytics_events(event_type);
CREATE INDEX IF NOT EXISTS idx_events_created_at ON public.analytics_events(created_at);

-- RLS Policies
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow insert for all" ON public.analytics_events
FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can read all events" ON public.analytics_events
FOR SELECT USING (public.is_admin());
```

Eventos que serao rastreados:
- `page_view` - Visualizacao de pagina
- `cta_click` - Clique em botao de acao
- `checkout_start` - Inicio do checkout
- `signup_complete` - Cadastro finalizado

### 1.3 Criar View SQL `marketing_stats`

```sql
CREATE OR REPLACE VIEW public.marketing_stats AS
SELECT 
  COALESCE(ts.utm_source, 'Direto') as source,
  COALESCE(ts.utm_medium, '-') as medium,
  COALESCE(ts.utm_campaign, '-') as campaign,
  COUNT(DISTINCT ts.session_id) as visitors,
  COUNT(DISTINCT CASE WHEN ts.user_id IS NOT NULL THEN ts.user_id END) as leads,
  COUNT(DISTINCT s.user_id) as subscribers,
  COALESCE(SUM(CASE WHEN s.status = 'active' THEN 9.90 ELSE 0 END), 0) as revenue,
  CASE 
    WHEN COUNT(DISTINCT ts.session_id) > 0 
    THEN ROUND((COUNT(DISTINCT s.user_id)::numeric / COUNT(DISTINCT ts.session_id)::numeric) * 100, 2)
    ELSE 0 
  END as conversion_rate
FROM traffic_sources ts
LEFT JOIN subscriptions s ON ts.user_id = s.user_id AND s.status = 'active'
GROUP BY ts.utm_source, ts.utm_medium, ts.utm_campaign
ORDER BY visitors DESC;
```

Esta view agrega todos os dados pesados no backend, evitando calculos no navegador.

---

## 2. Frontend - Hook de Tracking Aprimorado

### 2.1 Atualizar `src/hooks/useTrackUtm.ts`

Melhorias:
- Persistencia em `localStorage` com validade de 30 dias
- Funcao para associar UTM ao perfil no momento do cadastro
- Tracking de eventos granulares

```typescript
// Estrutura do dado salvo
interface MarketingAttribution {
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  referrer: string;
  landing_page: string;
  timestamp: number; // Para controle de validade
  session_id: string;
}

// Validade: 30 dias
const ATTRIBUTION_TTL = 30 * 24 * 60 * 60 * 1000;
```

### 2.2 Criar `src/hooks/useAnalyticsEvents.ts`

Hook para rastrear eventos do funil:

```typescript
export const useTrackEvent = () => {
  const trackEvent = async (eventType: string, eventData?: object) => {
    const sessionId = sessionStorage.getItem("utm_session_id");
    const { data: { user } } = await supabase.auth.getUser();
    
    await supabase.from("analytics_events").insert({
      user_id: user?.id || null,
      session_id: sessionId,
      event_type: eventType,
      event_data: eventData,
      url_path: window.location.pathname,
    });
  };
  
  return { trackEvent };
};
```

---

## 3. Atribuicao no Cadastro

### 3.1 Modificar `src/pages/Auth.tsx`

Quando o usuario faz cadastro/login:
1. Buscar dados UTM do `localStorage`
2. Atualizar o perfil do usuario com a origem

```typescript
// Apos login bem-sucedido
const utmData = getMarketingAttribution();
if (utmData) {
  await supabase.from("profiles").update({
    utm_source: utmData.utm_source,
    utm_medium: utmData.utm_medium,
    utm_campaign: utmData.utm_campaign,
    referrer_url: utmData.referrer,
  }).eq("user_id", user.id);
}
```

---

## 4. Nova Pagina de Marketing Analytics

### 4.1 Criar `src/pages/admin/Marketing.tsx`

Dashboard dedicado com layout profissional:

```text
┌────────────────────────────────────────────────────────┐
│  MARKETING ANALYTICS                                    │
├────────────────────────────────────────────────────────┤
│                                                        │
│  [KPIs Principais]                                     │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐        │
│  │Visit.│ │Leads │ │Clien.│ │Receita│ │Conv. │        │
│  │1.500 │ │ 120  │ │  45  │ │R$446 │ │ 3.0% │        │
│  └──────┘ └──────┘ └──────┘ └──────┘ └──────┘        │
│                                                        │
│  [Funil Visual - Grafico de Funil]                    │
│  ▼ 1.500 Visitantes                                   │
│  ▼   120 Leads (8% conversao)                         │
│  ▼    80 Engajados (66% abriram email)               │
│  ▼    45 Assinantes (56% conversao)                  │
│                                                        │
│  [Tabela de ROI por Canal]                            │
│  ┌─────────────────────────────────────────────────┐  │
│  │ Origem    │ Visit │ Leads │ $ │ Conv │ ROI    │  │
│  │ Instagram │ 800   │ 50    │ 247 │ 5.0% │ 🟢   │  │
│  │ Google    │ 400   │ 40    │ 148 │ 3.7% │ 🟡   │  │
│  │ Direto    │ 300   │ 30    │ 51  │ 1.7% │ 🔴   │  │
│  └─────────────────────────────────────────────────┘  │
│                                                        │
│  [Metricas de Email]                                  │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐              │
│  │ Abertura │ │ Cliques  │ │ Top Email│              │
│  │  45.2%   │ │  12.8%   │ │ Oferta   │              │
│  └──────────┘ └──────────┘ └──────────┘              │
│                                                        │
└────────────────────────────────────────────────────────┘
```

### 4.2 Componentes da Pagina

| Componente | Descricao |
|------------|-----------|
| `FunnelChart.tsx` | Grafico de funil usando Recharts (FunnelChart) |
| `ROITable.tsx` | Tabela de atribuicao com calculo de receita por fonte |
| `ConversionKPIs.tsx` | Cards com numeros grandes e coloridos |
| `EmailInsights.tsx` | Metricas de email com destaque para melhor performer |

---

## 5. Hook para Dados de Marketing

### 5.1 Criar `src/hooks/useMarketingStats.ts`

Hook que consome a view SQL:

```typescript
export const useMarketingStats = () => {
  return useQuery({
    queryKey: ["marketing-stats"],
    queryFn: async () => {
      // Buscar dados da view
      const { data: stats } = await supabase
        .from("marketing_stats")
        .select("*");
      
      // Buscar emails para calcular taxas
      const { data: emailEvents } = await supabase
        .from("email_events")
        .select("*");
      
      // Calcular metricas
      return {
        sources: stats,
        totalVisitors: stats.reduce((a, s) => a + s.visitors, 0),
        totalLeads: stats.reduce((a, s) => a + s.leads, 0),
        totalSubscribers: stats.reduce((a, s) => a + s.subscribers, 0),
        totalRevenue: stats.reduce((a, s) => a + s.revenue, 0),
        overallConversion: calculateConversion(stats),
        emailMetrics: calculateEmailMetrics(emailEvents),
        topSource: findTopSource(stats),
        topEmail: findTopEmail(emailEvents),
      };
    },
    staleTime: 1000 * 60 * 2,
  });
};
```

---

## 6. Adicionar Rota no Admin

### 6.1 Atualizar `src/App.tsx`

```typescript
import Marketing from "./pages/admin/Marketing";

// Dentro das rotas admin
<Route path="marketing" element={<Marketing />} />
```

### 6.2 Atualizar `src/components/admin/AdminLayout.tsx`

Adicionar item no menu lateral:

```typescript
const navItems = [
  { path: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { path: "/admin/marketing", label: "Marketing", icon: TrendingUp }, // NOVO
  { path: "/admin/content", label: "Conteudos", icon: FileText },
  // ...
];
```

---

## 7. Resumo dos Arquivos

| Arquivo | Acao |
|---------|------|
| Migration SQL | CRIAR - Colunas profiles + tabela analytics_events + view |
| `src/hooks/useTrackUtm.ts` | ATUALIZAR - Persistencia 30 dias + associacao perfil |
| `src/hooks/useAnalyticsEvents.ts` | CRIAR - Tracking de eventos granulares |
| `src/hooks/useMarketingStats.ts` | CRIAR - Consumir view marketing_stats |
| `src/pages/admin/Marketing.tsx` | CRIAR - Pagina completa de analytics |
| `src/components/admin/FunnelChart.tsx` | CRIAR - Grafico de funil visual |
| `src/components/admin/ROITable.tsx` | CRIAR - Tabela de ROI por canal |
| `src/pages/Auth.tsx` | ATUALIZAR - Associar UTM ao perfil no cadastro |
| `src/App.tsx` | ATUALIZAR - Adicionar rota /admin/marketing |
| `src/components/admin/AdminLayout.tsx` | ATUALIZAR - Menu lateral com Marketing |

---

## 8. Diagrama do Fluxo de Dados

```text
VISITANTE CHEGA
    │
    ├── URL: ?utm_source=instagram&utm_campaign=janeiro
    │
    ▼
[useTrackUtm Hook]
    │
    ├── Salva no localStorage (30 dias)
    ├── Insere em traffic_sources
    │
    ▼
NAVEGACAO NO SITE
    │
    ├── [useAnalyticsEvents] → analytics_events
    │   - page_view
    │   - cta_click
    │
    ▼
CADASTRO/LOGIN
    │
    ├── [Auth.tsx] Atualiza profiles com UTM
    │
    ▼
COMPRA (Stripe Webhook)
    │
    ├── Cria subscription
    ├── traffic_source_id associado
    │
    ▼
VIEW SQL AGREGA TUDO
    │
    ├── marketing_stats (visitantes, leads, receita por fonte)
    │
    ▼
DASHBOARD /admin/marketing
    │
    ├── Funil visual
    ├── Tabela ROI por canal
    ├── Metricas de email
```

---

## 9. Resultado Esperado

| Antes | Depois |
|-------|--------|
| Dados soltos sem conexao | Funil completo conectado |
| Sem saber origem das vendas | Receita por canal (ROI) |
| Calculo no navegador | View SQL no backend |
| Dashboard basico | Dashboard profissional de marketing |
| UTM sem persistencia | 30 dias de atribuicao |
| Sem eventos granulares | Tracking de CTAs e checkout |

---

## 10. Secao Tecnica

### Arquitetura de Dados

```text
┌─────────────────┐     ┌──────────────────┐
│ traffic_sources │──┬──│ profiles         │
│ (utm, session)  │  │  │ (utm persistente)│
└─────────────────┘  │  └──────────────────┘
                     │
                     ▼
              ┌──────────────┐
              │ marketing_   │
              │ stats (VIEW) │
              └──────────────┘
                     │
                     ▼
              ┌──────────────┐
              │ subscriptions│
              │ (receita)    │
              └──────────────┘
```

### Performance

- View SQL faz agregacao no Postgres (muito mais rapido)
- Frontend apenas consome dados prontos
- Indices em `utm_source`, `created_at`, `event_type`
- Cache de 2 minutos nas queries TanStack

### Seguranca

- RLS em `analytics_events`: qualquer um insere, so admin le
- View `marketing_stats` acessivel apenas para admins
- Dados sensiveis (emails) nao expostos nos relatorios
