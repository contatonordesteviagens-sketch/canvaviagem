

# Plano: Mostrar APENAS Conteúdo ES na Página Espanhola

## Problema

Na página `/es`, o conteúdo em português (como "Mel África", "Japão Mel", "Bia Pacotes", "Eva Destinos", etc.) está aparecendo misturado e até antes do conteúdo em espanhol.

A função `sortByLanguagePriority` ordena itens ES primeiro, mas depois inclui conteúdo PT como fallback secundário.

## Solução

Modificar o hook `useContentItems` para **filtrar estritamente por idioma ES no banco de dados** quando `forcedLanguage = 'es'`, em vez de apenas ordenar os resultados.

---

## Mudança 1: Atualizar useContentItems para Filtrar por Idioma

**Arquivo:** `src/hooks/useContent.ts`

**Lógica atual (linhas 64-88):**
```typescript
let query = supabase
  .from("content_items")
  .select("*")
  .eq("is_active", true)
  .order("is_featured", { ascending: false })
  .order("created_at", { ascending: false });

// ... filtra por tipo ...

const { data, error } = await query;
// Apply language priority ordering (inclui PT como fallback!)
return sortByLanguagePriority(data as ContentItem[], language);
```

**Nova lógica:**
```typescript
let query = supabase
  .from("content_items")
  .select("*")
  .eq("is_active", true)
  .order("is_featured", { ascending: false })
  .order("created_at", { ascending: false });

// ... filtra por tipo ...

// FILTRAR POR IDIOMA NO BANCO DE DADOS
if (language === 'pt') {
  query = query.or('language.eq.pt,language.is.null');
} else {
  query = query.eq('language', language); // ES = apenas itens ES
}

const { data, error } = await query;
// Ordenar por display_order/created_at (sem fallback de idioma)
return (data as ContentItem[]).sort((a, b) => {
  const aOrder = a.display_order ?? 9999;
  const bOrder = b.display_order ?? 9999;
  if (aOrder !== bOrder) return aOrder - bOrder;
  return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
});
```

---

## Mudança 2: Aplicar o Mesmo Filtro aos Outros Hooks

Aplicar a mesma lógica de filtragem estrita para:

1. **useCaptions** - Filtrar legendas por idioma
2. **useMarketingTools** - Filtrar ferramentas por idioma

---

## Resultado Esperado

**Antes:**
```
Página ES:
├── Mel África (PT) ❌
├── Japão Mel (PT) ❌
├── Bia Pacotes (PT) ❌
├── Cancun - es (ES) 
├── Portugal - es (ES)
└── ... outros PT misturados ❌
```

**Depois:**
```
Página ES:
├── Cancun - es (ES) ✅
├── Dublin - es (ES) ✅
├── Portugal - es (ES) ✅
├── Cozumel - es (ES) ✅
├── Stories ES ✅
└── ... apenas conteúdo ES ✅
```

---

## Arquivos Afetados

| Arquivo | Tipo de Mudança |
|---------|-----------------|
| `src/hooks/useContent.ts` | Adicionar filtro de idioma no banco para useContentItems, useCaptions, useMarketingTools |

---

## Detalhes Técnicos

A mudança afeta apenas a página ES (`/es`). A página PT (`/` e `/pt`) continuará funcionando normalmente, pois o filtro `or('language.eq.pt,language.is.null')` mantém o comportamento de incluir conteúdo português e conteúdo legado sem idioma definido.

Isso resolve definitivamente a exibição de conteúdo misturado na versão espanhola.

