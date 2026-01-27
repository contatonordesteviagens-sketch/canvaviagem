
# Plano: Filtros de Data no Dashboard + Corrigir Emails dos Usuarios

## Resumo das Alteracoes

Vou implementar 3 melhorias principais:
1. Adicionar filtros de periodo (Ontem, 3D, 7D, 1 Mes, Mes Passado, Maximo + Calendario customizado)
2. Integrar a secao de "Fontes" junto com a "Visao Geral" do dashboard
3. Corrigir a exibicao dos emails dos usuarios (buscar de `user_email_automations` em vez de `profiles`)

---

## 1. Problema Identificado: Emails nao Aparecem

### Causa Raiz
O hook `useActiveUsers` busca emails da tabela `profiles`, que esta **vazia**.
Os emails estao salvos na tabela `user_email_automations`.

### Solucao
Atualizar o hook para buscar emails de `user_email_automations`:

**Arquivo: `src/hooks/useActiveUsers.ts`**

```typescript
// ANTES: Busca de profiles (vazio)
const { data: profiles } = await supabase
  .from("profiles")
  .select("user_id, email");

// DEPOIS: Busca de user_email_automations (com dados)
const { data: emailData } = await supabase
  .from("user_email_automations")
  .select("user_id, email, name");

// Combinar com subscriptions
const users = subscriptions.map((sub) => {
  const userData = emailData.find((e) => e.user_id === sub.user_id);
  return {
    user_id: sub.user_id,
    email: userData?.email || "Email nao disponivel",
    name: userData?.name || null,
    // ...resto dos campos
  };
});
```

---

## 2. Filtros de Data no Dashboard

### Componente de Filtro de Periodo

Criar um componente reutilizavel de filtro de datas com botoes rapidos e calendario:

**Arquivo: `src/components/gestao/DateRangeFilter.tsx` (NOVO)**

```text
┌─────────────────────────────────────────────────────────────────────┐
│  [ Ontem ] [ 3D ] [ 7D ] [ 1 Mes ] [ Mes Passado ] [ Max ] [ 📅 ]   │
└─────────────────────────────────────────────────────────────────────┘
                                                          │
                                                          ▼
                                              ┌───────────────────┐
                                              │  Calendario       │
                                              │  (Data inicial -  │
                                              │   Data final)     │
                                              └───────────────────┘
```

### Botoes de Periodo
| Botao | Descricao |
|-------|-----------|
| Ontem | Dados de ontem apenas |
| 3D | Ultimos 3 dias |
| 7D | Ultimos 7 dias |
| 1 Mes | Ultimos 30 dias |
| Mes Passado | Mes anterior completo |
| Max | Todos os dados disponiveis |
| Calendario | Selecao customizada de periodo |

### Integracao com Dashboard

O filtro de data sera adicionado no topo do `DashboardSection` e afetara:
- Metricas de visitantes, leads, assinantes
- Graficos de receita e assinaturas
- Dados de fontes de trafego
- Emails enviados/abertos

**Arquivo: `src/components/gestao/DashboardSection.tsx` (ATUALIZAR)**

```typescript
const [dateRange, setDateRange] = useState<DateRange>({
  from: subDays(new Date(), 7), // Padrao: ultimos 7 dias
  to: new Date(),
});

// Passar o filtro para os componentes filhos
<OverviewTab dateRange={dateRange} />
<MarketingFunnelSection dateRange={dateRange} />
<AttributionSection dateRange={dateRange} />
```

---

## 3. Integrar Fontes com Visao Geral

### Mudanca na Estrutura de Abas

Atualmente existem 4 abas separadas:
- Visao Geral
- Funil
- E-mail
- **Fontes** (sera integrada)

### Nova Estrutura

Mover os principais dados de "Fontes" para dentro da "Visao Geral":

**Arquivo: `src/components/gestao/DashboardSection.tsx`**

Adicionar na aba "Visao Geral" (OverviewTab):
1. Tabela resumida das top 5 fontes de trafego
2. Mini grafico de visitantes por fonte

```text
┌─────────────────────────────────────────────────────────────────────┐
│  VISAO GERAL                                                        │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  [Filtro de Periodo: Ontem | 3D | 7D | 1 Mes | Mes Passado | Max]  │
│                                                                     │
│  [KPIs Stripe]  [KPIs Engagement]  [KPIs Email]                    │
│                                                                     │
│  ┌─────────────────┐  ┌─────────────────────────────────────────┐  │
│  │ Top 5 Fontes    │  │ Grafico de Receita                      │  │
│  │ Instagram: 45%  │  │ [Barras mensais]                        │  │
│  │ Google: 30%     │  │                                          │  │
│  │ Direto: 25%     │  │                                          │  │
│  └─────────────────┘  └─────────────────────────────────────────┘  │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 4. Hooks Atualizados para Suportar Filtro de Data

### Arquivo: `src/hooks/useMarketingFunnel.ts` (ATUALIZAR)

```typescript
export const useMarketingFunnel = (dateRange?: { from: Date; to: Date }) => {
  return useQuery({
    queryKey: ["marketing-funnel", dateRange?.from, dateRange?.to],
    queryFn: async () => {
      let trafficQuery = supabase.from("traffic_sources").select("*");
      
      // Aplicar filtro de data se existir
      if (dateRange?.from) {
        trafficQuery = trafficQuery.gte("created_at", dateRange.from.toISOString());
      }
      if (dateRange?.to) {
        trafficQuery = trafficQuery.lte("created_at", dateRange.to.toISOString());
      }
      
      // ... resto da logica
    },
  });
};
```

### Arquivo: `src/hooks/useAdminDashboard.ts` (ATUALIZAR)

Adicionar suporte a filtro de periodo nas queries de cliques e page views.

---

## 5. Arquivos a Modificar/Criar

| Arquivo | Acao |
|---------|------|
| `src/components/gestao/DateRangeFilter.tsx` | CRIAR - Componente de filtro de periodo |
| `src/hooks/useActiveUsers.ts` | ATUALIZAR - Buscar email de user_email_automations |
| `src/components/gestao/DashboardSection.tsx` | ATUALIZAR - Adicionar filtro + integrar fontes |
| `src/hooks/useMarketingFunnel.ts` | ATUALIZAR - Suportar filtro de data |
| `src/hooks/useAdminDashboard.ts` | ATUALIZAR - Suportar filtro de data |
| `src/components/gestao/UsersSection.tsx` | ATUALIZAR - Melhorar exibicao de email |

---

## 6. Detalhes Tecnicos

### Componente DateRangeFilter

```typescript
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { subDays, startOfMonth, endOfMonth, subMonths } from "date-fns";

interface DateRangeFilterProps {
  value: { from: Date; to: Date };
  onChange: (range: { from: Date; to: Date }) => void;
}

const presets = [
  { label: "Ontem", getValue: () => ({ from: subDays(new Date(), 1), to: subDays(new Date(), 1) }) },
  { label: "3D", getValue: () => ({ from: subDays(new Date(), 3), to: new Date() }) },
  { label: "7D", getValue: () => ({ from: subDays(new Date(), 7), to: new Date() }) },
  { label: "1 Mes", getValue: () => ({ from: subDays(new Date(), 30), to: new Date() }) },
  { label: "Mes Passado", getValue: () => ({ 
    from: startOfMonth(subMonths(new Date(), 1)), 
    to: endOfMonth(subMonths(new Date(), 1)) 
  }) },
  { label: "Max", getValue: () => ({ from: new Date(2020, 0, 1), to: new Date() }) },
];
```

### Integracao com Calendar do Shadcn

Usar o componente Calendar existente com `mode="range"` para selecao de periodo customizado:

```typescript
<Calendar
  mode="range"
  selected={{ from: value.from, to: value.to }}
  onSelect={(range) => {
    if (range?.from && range?.to) {
      onChange({ from: range.from, to: range.to });
    }
  }}
  className="pointer-events-auto"
/>
```

---

## 7. Interface Atualizada dos Usuarios

### Antes (Problema)
```text
Email: "Email nao disponivel"
```

### Depois (Corrigido)
```text
Email: "usuario@exemplo.com"
Nome: "Nome do Usuario" (novo campo)
```

A tabela de usuarios mostrara:
- Email real do usuario
- Nome (extraido do email antes do @)
- Status da assinatura
- Datas de inscricao e validade

---

## 8. Resultado Esperado

| Problema | Solucao |
|----------|---------|
| Emails nao aparecem | Buscar de user_email_automations |
| Sem filtros de data | Componente DateRangeFilter com presets |
| Fontes separadas do dashboard | Integrar resumo de fontes na Visao Geral |
| Graficos sem periodo | Queries filtradas por data |

### Novo Fluxo de Uso

1. Admin acessa `/gestao`
2. Clica na aba "Dashboard"
3. Seleciona periodo: "Ontem", "7D", "1 Mes", etc.
4. Todos os graficos e metricas atualizam automaticamente
5. Ve as principais fontes de trafego junto com os KPIs
6. Na aba "Usuarios" ve os emails reais de cada assinante
