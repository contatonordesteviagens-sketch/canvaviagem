
# Plano de Implementacao: Sistema de Gestao de Conteudo Canva Viagem

## Resumo Executivo

Este plano aborda 4 tarefas principais para melhorar a experiencia do usuario e as capacidades administrativas da plataforma:

1. **Correcao do Widget de Chat** - Resolver sobreposicao com navegacao mobile
2. **Sistema de Filtros e Ordenacao** - Adicionar filtro "Favoritos" e ordenacao por data
3. **Logica de Badge "Novo"** - Implementar janela deslizante para os 3 itens mais recentes
4. **Sistema de Importacao com Calendario** - Adicionar campo de legenda e agendamento inteligente

---

## TAREFA 1: Correcao do Widget Zaia (Chat)

### Situacao Atual

O arquivo `index.html` ja possui um estilo CSS para ajustar o widget Zaia no mobile:

```css
@media (max-width: 768px) {
  #zaia-widget-container,
  [id*="zaia"],
  iframe[src*="zaia"] {
    bottom: 80px !important;
    right: 12px !important;
    transform: scale(0.85) !important;
    transform-origin: bottom right !important;
  }
}
```

### Problema Persistente

A configuracao atual nao esta funcionando adequadamente. O widget ainda sobrepoe o botao "Favoritos" porque:
1. O seletor CSS pode nao estar capturando todos os elementos do widget
2. O valor de `bottom: 80px` pode nao ser suficiente considerando a altura da barra (64px + safe-area)

### Solucao Proposta

| Arquivo | Alteracao |
|---------|-----------|
| `index.html` | Aumentar `bottom` para 100px e adicionar seletores mais especificos |
| `src/components/canva/BottomNav.tsx` | Aumentar z-index para z-[60] para garantir precedencia |

### Codigo Atualizado

```css
/* index.html - CSS mais robusto */
@media (max-width: 768px) {
  /* Seletores mais especificos para o widget Zaia */
  #zaia-widget-container,
  #chatbot-fab,
  #chatbot-container,
  [id*="zaia"],
  [class*="zaia"],
  div[style*="zaia"],
  iframe[src*="zaia"] {
    bottom: 100px !important;
    right: 16px !important;
    max-width: 56px !important;
    max-height: 56px !important;
    transform: scale(0.8) !important;
    transform-origin: bottom right !important;
    z-index: 45 !important;
  }
  
  /* Container do chat aberto */
  #chatbot-container,
  [id*="chatbot-container"] {
    bottom: 100px !important;
    max-height: calc(100vh - 180px) !important;
  }
}
```

---

## TAREFA 2: Sistema de Filtros e Ordenacao

### Parte A: Filtro "Favoritos" nos Chips de Filtro de Videos

**Situacao Atual**: A aba "Favoritos" existe no `BottomNav` e no `CategoryNav`, mas nao ha um chip de filtro dentro da secao de videos.

**Solucao**: Adicionar "Favoritos" como opcao de filtro na linha de `FilterChips` da secao de videos.

| Arquivo | Alteracao |
|---------|-----------|
| `src/pages/Index.tsx` | Adicionar filtro 'favoritos' ao tipo VideoFilter e ao array videoFilters |
| `src/pages/Index.tsx` | Atualizar funcao filterTemplates para filtrar por favoritos |

### Codigo

```typescript
// Tipo atualizado
type VideoFilter = 'todos' | 'nacionais' | 'internacionais' | 'favoritos' | 'eva' | 'mel' | 'bia';

// Array de filtros atualizado
const videoFilters = [
  { id: 'todos' as const, label: 'Todos' },
  { id: 'nacionais' as const, label: 'Nacionais' },
  { id: 'internacionais' as const, label: 'Internacionais' },
  { id: 'favoritos' as const, label: '⭐ Favoritos' },
];

// Logica de filtro atualizada
const filterTemplates = (items: ContentItem[] | undefined) => {
  if (!items) return [];
  let filtered = items.filter(item =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (videoFilter === 'favoritos') {
    filtered = filtered.filter(item => isFavorite("content_item", item.id));
  } else if (videoFilter === 'nacionais') {
    // ... logica existente
  }
  
  return filtered;
};
```

### Parte B: Ordenacao Padrao "Mais Recente Primeiro"

**Situacao Atual**: A ordenacao usa `display_order` e `is_featured`. O campo `created_at` ja existe nas tabelas.

**Solucao**: Alterar a query do hook para ordenar por `created_at DESC` por padrao.

| Arquivo | Alteracao |
|---------|-----------|
| `src/hooks/useContent.ts` | Alterar ordenacao para `created_at DESC` em useContentItems e outros hooks |
| `src/pages/Index.tsx` | Ajustar logica de sort para priorizar featured mas manter ordem por data |

### Codigo

```typescript
// useContentItems - ordenacao atualizada
const { data, error } = await query
  .order("is_featured", { ascending: false })
  .order("created_at", { ascending: false });

// Index.tsx - sort ajustado
const sortedVideos = [...filteredVideos].sort((a, b) => {
  // Featured primeiro
  if (a.is_featured && !b.is_featured) return -1;
  if (!a.is_featured && b.is_featured) return 1;
  // Depois por data (mais recente primeiro)
  return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
});
```

---

## TAREFA 3: Logica de Badge "Novo" (Sliding Window)

### Situacao Atual

O campo `is_new` e um booleano estatico que precisa ser atualizado manualmente pelo admin.

### Solucao

Implementar calculo dinamico baseado nos 3 itens mais recentes globalmente.

| Arquivo | Alteracao |
|---------|-----------|
| `src/hooks/useContent.ts` | Criar hook `useNewestItemIds` que busca os 3 IDs mais recentes |
| `src/pages/Index.tsx` | Usar o hook para determinar dinamicamente se um item e "novo" |
| `src/components/canva/PremiumCard.tsx` | Nenhuma alteracao (ja suporta prop `isNew`) |

### Codigo

```typescript
// Novo hook em useContent.ts
export const useNewestItemIds = () => {
  return useQuery({
    queryKey: ["newest-item-ids"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("content_items")
        .select("id")
        .eq("is_active", true)
        .order("created_at", { ascending: false })
        .limit(3);
      
      if (error) throw error;
      return data?.map(item => item.id) || [];
    },
    staleTime: 1000 * 60 * 2, // 2 minutos
  });
};

// Uso em Index.tsx
const { data: newestIds = [] } = useNewestItemIds();

// No PremiumCard
<PremiumCard
  isNew={newestIds.includes(template.id)}
  // ...outras props
/>
```

### Comportamento

```text
Estado Inicial (2 videos):
  Video A (criado ontem) -> Badge "Novo"
  Video B (criado hoje)  -> Badge "Novo"

Adiciono Video C:
  Video A -> Badge "Novo"
  Video B -> Badge "Novo"  
  Video C -> Badge "Novo"

Adiciono Video D:
  Video A -> SEM badge (saiu da janela)
  Video B -> Badge "Novo"
  Video C -> Badge "Novo"
  Video D -> Badge "Novo"
```

---

## TAREFA 4: Sistema de Importacao com Calendario Inteligente

### Parte A: Campo de Legenda no Importador

| Arquivo | Alteracao |
|---------|-----------|
| `src/components/gestao/ImportSection.tsx` | Adicionar campo "Legenda" no formulario de importacao rapida |
| `src/hooks/useImportContent.ts` | Incluir campo `caption` no tipo ParsedItem |

### Codigo

```typescript
// ParsedItem atualizado
export interface ParsedItem {
  title: string;
  url: string;
  icon?: string;
  destination?: string;
  text?: string;
  hashtags?: string;
  category?: string;
  language?: string;
  caption?: string; // NOVO CAMPO
}

// ImportSection.tsx - novo campo
<div className="space-y-2">
  <Label>Legenda (Opcional)</Label>
  <Textarea
    placeholder="Digite a legenda para este conteudo..."
    value={caption}
    onChange={(e) => setCaption(e.target.value)}
    rows={3}
  />
</div>
```

### Parte B: Agendamento Automatico no Calendario

| Arquivo | Alteracao |
|---------|-----------|
| `src/hooks/useCalendarSchedule.ts` | Criar novo hook para agendamento inteligente |
| `src/components/gestao/ImportSection.tsx` | Chamar hook apos importacao bem-sucedida |
| `src/pages/Calendar.tsx` | Atualizar para consumir dados do banco |

### Logica de Agendamento

```typescript
// Novo hook: useCalendarSchedule.ts
export const useScheduleContent = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({
      contentItemId,
      caption,
    }: {
      contentItemId: string;
      caption?: string;
    }) => {
      // Buscar proximos 7 dias
      const today = new Date();
      const nextDays = Array.from({ length: 7 }, (_, i) => {
        const date = new Date(today);
        date.setDate(date.getDate() + i + 1);
        return {
          year: date.getFullYear(),
          day_of_year: getDayOfYear(date),
        };
      });
      
      // Verificar dias livres
      for (const day of nextDays) {
        const { data: existing } = await supabase
          .from("calendar_entries")
          .select("id")
          .eq("year", day.year)
          .eq("day_of_year", day.day_of_year)
          .maybeSingle();
        
        if (!existing) {
          // Dia livre - agendar aqui
          await supabase.from("calendar_entries").insert({
            year: day.year,
            day_of_year: day.day_of_year,
            content_item_id: contentItemId,
            notes: caption || null,
          });
          return { scheduled: true, day };
        }
      }
      
      return { scheduled: false };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["calendar-entries"] });
    },
  });
};
```

### Atualizacao do Calendario

| Arquivo | Alteracao |
|---------|-----------|
| `src/pages/Calendar.tsx` | Migrar de dados estaticos para consumir `calendar_entries` do banco |
| `src/hooks/useCalendarEntries.ts` | Criar hook para buscar entradas do calendario |

```typescript
// Hook para calendario
export const useCalendarEntries = (year: number, month: number) => {
  return useQuery({
    queryKey: ["calendar-entries", year, month],
    queryFn: async () => {
      const startDay = getDayOfYear(new Date(year, month, 1));
      const endDay = getDayOfYear(new Date(year, month + 1, 0));
      
      const { data, error } = await supabase
        .from("calendar_entries")
        .select(`
          *,
          content_item:content_items(*),
          caption:captions(*)
        `)
        .eq("year", year)
        .gte("day_of_year", startDay)
        .lte("day_of_year", endDay);
      
      if (error) throw error;
      return data;
    },
  });
};
```

---

## Resumo de Arquivos a Modificar

| Arquivo | Tarefas |
|---------|---------|
| `index.html` | T1 |
| `src/components/canva/BottomNav.tsx` | T1 |
| `src/pages/Index.tsx` | T2, T3 |
| `src/hooks/useContent.ts` | T2, T3 |
| `src/components/gestao/ImportSection.tsx` | T4 |
| `src/hooks/useImportContent.ts` | T4 |
| `src/pages/Calendar.tsx` | T4 |
| Novo: `src/hooks/useCalendarSchedule.ts` | T4 |
| Novo: `src/hooks/useCalendarEntries.ts` | T4 |

---

## Secao Tecnica

### Diagrama de Fluxo do Sistema de Badge "Novo"

```text
Usuario Acessa Plataforma
        |
        v
  [useNewestItemIds]
        |
        v
  Query: SELECT id FROM content_items
         ORDER BY created_at DESC
         LIMIT 3
        |
        v
  Retorna: ['id-novo-1', 'id-novo-2', 'id-novo-3']
        |
        v
  Para cada template:
    isNew = newestIds.includes(template.id)
        |
        v
  PremiumCard renderiza badge condicionalmente
```

### Fluxo de Agendamento Automatico

```text
Admin Importa Video
        |
        v
  [handleQuickImport] com caption
        |
        v
  createContentItem.mutateAsync()
        |
        v (onSuccess)
  [scheduleContent.mutate]
        |
        v
  Loop: Proximos 7 dias
        |
    +---+---+
    |       |
   Livre   Ocupado
    |       |
    v       v
  INSERT   Continua loop
  calendar_entries
        |
        v
  toast.success("Agendado para dia X")
```

### Prioridade de Ordenacao

```text
Nivel 1: is_featured = true (sempre no topo)
Nivel 2: created_at DESC (mais recente primeiro)
Nivel 3: display_order ASC (ordem manual do admin)
```

---

## Criterios de Aceitacao

### Tarefa 1 - Widget Chat
- [ ] Widget Zaia nao sobrepoe nenhum botao da navegacao inferior
- [ ] Widget permanece acessivel e visivel em mobile
- [ ] Navegacao 100% clicavel em todos os dispositivos

### Tarefa 2 - Filtros e Ordenacao
- [ ] Chip "Favoritos" aparece na linha de filtros de videos
- [ ] Filtrar por favoritos mostra apenas itens favoritados
- [ ] Novos videos aparecem no topo da lista
- [ ] Ordenacao consistente entre cliente e admin

### Tarefa 3 - Badge "Novo"
- [ ] Maximo de 3 badges visiveis simultaneamente
- [ ] Badge atualiza automaticamente ao adicionar novo conteudo
- [ ] Logica funciona independente dos filtros ativos

### Tarefa 4 - Importacao e Calendario
- [ ] Campo de legenda salva corretamente
- [ ] Conteudo importado aparece no calendario automaticamente
- [ ] Sistema evita sobrescrever conteudo unico
- [ ] Cliente visualiza sugestoes no calendario
