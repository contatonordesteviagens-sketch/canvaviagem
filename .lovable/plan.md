
# Plano: Sistema de Filtros, Ordenação e Calendário Dinâmico

## Resumo Executivo

Este plano implementa um conjunto de melhorias para a gestão de conteúdo, incluindo:
1. Filtros de ordenação e favoritos padronizados
2. Ordenação por "mais recentes" como padrão
3. Sistema de etiqueta "Novo" automático (últimas 3 atualizações)
4. Importação de legendas para o calendário
5. Calendário dinâmico com conteúdo do banco de dados

---

## 1. Ordenação por Mais Recentes (Padrão)

### Comportamento Atual
- O `sortOrder` está configurado como `"custom"` por padrão
- Itens são ordenados por `display_order` (ordem manual)

### Alterações Propostas

| Arquivo | Alteração |
|---------|-----------|
| `src/components/gestao/ContentSection.tsx` | Mudar `sortOrder` padrão de `"custom"` para `"recent"` |
| `src/pages/Index.tsx` | Ordenar vídeos por `created_at` descendente por padrão |
| `src/hooks/useContent.ts` | Atualizar queries para ordenar por `created_at DESC` como padrão |

---

## 2. Filtro de Favoritos na Gestão

### Comportamento Atual
- Não existe filtro de favoritos na área de gestão
- Favoritos só aparecem na aba dedicada do cliente

### Alterações Propostas

| Arquivo | Alteração |
|---------|-----------|
| `src/components/gestao/ContentFilters.tsx` | Adicionar toggle "Apenas Favoritos" |
| `src/components/gestao/ContentSection.tsx` | Integrar hook `useFavorites` e filtrar itens |

---

## 3. Sistema de Etiqueta "Novo" Automático

### Lógica Proposta
- Itens criados nas **últimas 3 atualizações** (não dias) recebem etiqueta "Novo"
- Ao adicionar um novo item, os mais antigos perdem a etiqueta automaticamente
- Usar campo `created_at` para identificar as 3 atualizações mais recentes

### Implementação

```text
+------------------+     +------------------+     +------------------+
|  Item adicionado |     |  Sistema calcula |     |  3 mais recentes |
|  hoje            | --> |  datas únicas de | --> |  recebem is_new  |
|                  |     |  created_at      |     |  = true          |
+------------------+     +------------------+     +------------------+
```

| Arquivo | Alteração |
|---------|-----------|
| `src/hooks/useContent.ts` | Criar função `calculateNewItems()` que identifica as 3 datas de criação mais recentes |
| `src/pages/Index.tsx` | Aplicar lógica de `is_new` baseada nas últimas 3 "atualizações" (datas únicas) |
| `src/components/canva/PremiumCard.tsx` | Exibir badge "Novo" quando item está nas últimas 3 atualizações |

---

## 4. Importação de Legendas para Calendário

### Comportamento Atual
- A aba "Importar" suporta apenas: vídeo, feed, story, caption, tool, resource
- O calendário usa dados estáticos de `src/data/templates.ts` e `src/data/captions.ts`

### Alterações Propostas

| Arquivo | Alteração |
|---------|-----------|
| `src/components/gestao/ImportSection.tsx` | Adicionar tipo "calendar" para legendas do calendário |
| Nova tabela `calendar_entries` | Armazenar legendas vinculadas a dias específicos |

### Nova Tabela de Banco de Dados

```sql
CREATE TABLE calendar_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_item_id UUID REFERENCES content_items(id) ON DELETE SET NULL,
  caption_id UUID REFERENCES captions(id) ON DELETE SET NULL,
  day_of_year INTEGER NOT NULL,
  year INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(day_of_year, year)
);
```

---

## 5. Calendário Dinâmico

### Comportamento Atual
- Usa dados estáticos de `templates` e `captions` importados de arquivos `.ts`
- Distribui conteúdo por índice: `dayOfYear % templates.length`

### Alterações Propostas

| Arquivo | Alteração |
|---------|-----------|
| `src/pages/Calendar.tsx` | Consumir dados do Supabase em vez de arquivos estáticos |
| `src/hooks/useCalendarContent.ts` | Novo hook para buscar entradas do calendário |

### Lógica de Auto-Distribuição
Quando um vídeo novo é adicionado:
1. Verificar os próximos 7 dias do calendário
2. Se não houver conteúdo atribuído, adicionar o novo vídeo
3. Remover duplicatas automaticamente

---

## 6. Arquivos a Serem Modificados

| Arquivo | Tipo de Alteração |
|---------|-------------------|
| `src/components/gestao/ContentSection.tsx` | Modificar (sortOrder padrão, filtro favoritos) |
| `src/components/gestao/ContentFilters.tsx` | Modificar (adicionar toggle favoritos) |
| `src/components/gestao/ImportSection.tsx` | Modificar (adicionar tipo legenda calendário) |
| `src/pages/Index.tsx` | Modificar (ordenação por recentes, lógica is_new) |
| `src/pages/Calendar.tsx` | Modificar (consumir dados dinâmicos) |
| `src/hooks/useContent.ts` | Modificar (ordenação padrão, cálculo is_new) |
| `src/hooks/useCalendarContent.ts` | **Novo** (hook para calendário) |
| Migração SQL | **Novo** (tabela calendar_entries) |

---

## Seção Técnica

### Lógica de "Últimas 3 Atualizações"

```typescript
// Em useContent.ts
export const getRecentUpdateDates = (items: ContentItem[]): Date[] => {
  // Extrair datas únicas de criação (apenas a parte da data, sem hora)
  const uniqueDates = [...new Set(
    items.map(item => new Date(item.created_at).toDateString())
  )].sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
  
  // Retornar as 3 datas mais recentes
  return uniqueDates.slice(0, 3).map(d => new Date(d));
};

export const isItemNew = (item: ContentItem, recentDates: Date[]): boolean => {
  const itemDate = new Date(item.created_at).toDateString();
  return recentDates.some(d => d.toDateString() === itemDate);
};
```

### Migração do Calendário

```sql
-- Criar tabela para entradas do calendário
CREATE TABLE calendar_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_item_id UUID REFERENCES content_items(id) ON DELETE SET NULL,
  caption_id UUID REFERENCES captions(id) ON DELETE SET NULL,
  day_of_year INTEGER NOT NULL CHECK (day_of_year >= 1 AND day_of_year <= 366),
  year INTEGER NOT NULL CHECK (year >= 2024),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(day_of_year, year)
);

-- RLS Policies
ALTER TABLE calendar_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read calendar entries" 
  ON calendar_entries FOR SELECT 
  USING (true);

CREATE POLICY "Admins can manage calendar entries"
  ON calendar_entries FOR ALL
  USING (is_admin());
```

### Auto-Distribuição no Calendário

Quando um novo vídeo é importado:
1. Identificar a data atual
2. Verificar os próximos 7 dias no calendário
3. Para cada dia sem conteúdo, atribuir o novo vídeo
4. Vincular uma legenda correspondente (por categoria ou aleatória)

### Ordenação na UI do Cliente

```typescript
// Em Index.tsx - Vídeos ordenados por data de criação (mais recentes primeiro)
const sortedVideos = useMemo(() => {
  return [...filteredVideos].sort((a, b) => {
    // Featured sempre primeiro
    if (a.is_featured && !b.is_featured) return -1;
    if (!a.is_featured && b.is_featured) return 1;
    // Depois por data de criação (mais recente primeiro)
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });
}, [filteredVideos]);
```

---

## Fluxo de Uso

1. **Administrador importa vídeo novo** via Gestão > Importar
2. **Sistema marca como "Novo"** automaticamente (baseado nas últimas 3 atualizações)
3. **Vídeo aparece no topo** da lista do cliente (mais recentes primeiro)
4. **Calendário é atualizado** com o novo conteúdo nos próximos 7 dias
5. **Após 4ª atualização**, o item mais antigo perde a etiqueta "Novo"

---

## Dependências

- Nenhuma nova dependência de pacote necessária
- Requer migração de banco de dados para `calendar_entries`
