
# Plano: Proteger Área de Gestão e Corrigir Dashboard

## Resumo das Correções

Vou fazer 3 correções principais:
1. **Remover links visíveis** da área de gestão do site - mantendo acesso 100% secreto via URL direta
2. **Corrigir Edge Function** do Stripe Dashboard que está falhando
3. **Melhorar Dashboard** com mais métricas e tudo em português

---

## 1. Remover Links Visíveis da Área de Gestão

### O que será removido:

**Arquivo: `src/components/Header.tsx`**
- Remover o link "Gestão" do menu desktop (linhas 143-153)
- Remover o link "Gestão" do menu mobile (linhas 220-231)
- Remover import do `useIsAdmin` que não será mais necessário aqui

**Arquivo: `src/pages/Auth.tsx`**
- Remover o link "Acesso administrativo" que adicionamos (linhas 275-283)

### Como você vai acessar a gestão:
- Acessar diretamente a URL: `/admin-login`
- Fazer login com seu email e senha única: `rickbread`
- Após login, acessar `/gestao`

A proteção continua funcionando:
- Backend valida role `admin` na tabela `user_roles`
- Só você (lucashenriquephd@gmail.com) tem essa permissão
- Nenhum usuário comum consegue ver ou acessar essa área

---

## 2. Corrigir Edge Function Stripe Dashboard

### Problema atual:
O erro `Deno.core.runMicrotasks() is not supported` ocorre porque a biblioteca Stripe está usando uma versão incompatível com o ambiente Deno do Lovable Cloud.

### Solução:

**Arquivo: `supabase/functions/stripe-dashboard/index.ts`**

```text
ANTES (linha 3):
import Stripe from "https://esm.sh/stripe@14.21.0?target=deno";

DEPOIS:
import Stripe from "https://esm.sh/stripe@14.21.0";
```

Remover o `?target=deno` resolve o problema de compatibilidade.

---

## 3. Melhorar Dashboard com Mais Métricas

### Novos KPIs que serão adicionados:

| Métrica | Descrição |
|---------|-----------|
| Total de Clientes | Clientes únicos no Stripe |
| Ticket Médio | Valor médio por assinatura |
| Taxa de Conversão | % de visitantes que assinaram |
| LTV Estimado | Lifetime Value baseado no churn |
| Receita Total | Faturamento acumulado |
| Cancelamentos | Assinaturas canceladas no mês |

### Labels em Português (já existentes, vou manter):
- MRR → Receita Recorrente Mensal
- Assinantes Ativos
- Churn Rate → Taxa de Cancelamento
- Fat. Mensal → Faturamento Mensal
- Crescimento

### Melhorias no Dashboard UI:

**Arquivo: `src/components/gestao/DashboardSection.tsx`**

1. Adicionar novos cards de KPI:
   - Total de Clientes
   - Cancelamentos do Mês
   - LTV Estimado
   - Receita Total (acumulada)

2. Traduzir labels restantes para português:
   - "Page Views" → "Visualizações de Página"
   - "Churn Rate" → "Taxa de Cancelamento"

3. Adicionar seção de conversões:
   - Mostrar eventos do Meta Pixel (se disponíveis)
   - Funil: Visitantes → Leads → Assinantes

### Dados adicionais da Edge Function:

**Arquivo: `supabase/functions/stripe-dashboard/index.ts`**

Adicionar no retorno:
```typescript
{
  // Existentes...
  mrr,
  activeSubscribers,
  churnRate,
  
  // NOVOS
  totalRevenue: // soma de todas as invoices pagas
  averageTicket: // mrr / assinantes ativos
  estimatedLTV: // mrr * (1 / churnRate em decimal)
  monthlyChurns: // cancelamentos no mês atual
  trialingCount: // assinaturas em trial
}
```

---

## Arquivos a Modificar

| Arquivo | Ação |
|---------|------|
| `src/components/Header.tsx` | Remover links de Gestão (desktop e mobile) |
| `src/pages/Auth.tsx` | Remover link "Acesso administrativo" |
| `supabase/functions/stripe-dashboard/index.ts` | Corrigir import Stripe + adicionar métricas |
| `src/components/gestao/DashboardSection.tsx` | Adicionar novos KPIs + traduzir labels |
| `src/hooks/useStripeDashboard.ts` | Atualizar interface com novos campos |

---

## Resultado Esperado

1. **Segurança**: Nenhum link visível para a área de gestão - acesso apenas via URL direta `/admin-login`
2. **Dashboard Funcional**: Edge function corrigida, dados do Stripe carregando corretamente
3. **Mais Métricas**: 
   - Total de clientes
   - LTV estimado
   - Taxa de cancelamento detalhada
   - Receita total acumulada
4. **100% Português**: Todos os labels traduzidos
