
# Plano: Corrigir Destaques Misturados PT/ES

## Diagnóstico

| Hook | Filtro por Idioma | Status |
|------|-------------------|--------|
| `useFeaturedItems` | ✅ Filtra no banco com `.or()` e `.eq()` | **CORRETO** |
| `useHighlightedItems` | ❌ Apenas reordena client-side | **QUEBRADO** |

### O Problema

`useHighlightedItems` usa apenas `sortByLanguagePriority()` que **reordena** os itens mas **não remove** os de outros idiomas. Por isso, highlighted items de PT e ES aparecem misturados.

---

## Solução

### Arquivo: `src/hooks/useContent.ts`

**Localizar** (linhas 143-162):
```typescript
export const useHighlightedItems = () => {
  const { language } = useLanguage();
  
  return useQuery({
    queryKey: ["highlighted-items", language],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("content_items")
        .select("*")
        .eq("is_active", true)
        .eq("is_highlighted", true)
        .order("created_at", { ascending: false })
        .limit(3);
      
      if (error) throw error;
      return sortByLanguagePriority(data as ContentItem[], language);
    },
    staleTime: 0,
  });
};
```

**Substituir por:**
```typescript
export const useHighlightedItems = () => {
  const { language } = useLanguage();
  
  return useQuery({
    queryKey: ["highlighted-items", language],
    queryFn: async () => {
      let query = supabase
        .from("content_items")
        .select("*")
        .eq("is_active", true)
        .eq("is_highlighted", true);
      
      // ⭐ FILTRAR POR IDIOMA NO BANCO ⭐
      if (language === 'pt') {
        query = query.or('language.eq.pt,language.is.null');
      } else {
        query = query.eq('language', language);
      }
      
      const { data, error } = await query
        .order("display_order", { ascending: true })
        .limit(3);
      
      if (error) throw error;
      return data as ContentItem[];
    },
    staleTime: 0,
  });
};
```

---

## Mudanças Aplicadas

| Antes | Depois |
|-------|--------|
| Busca **todos** highlighted e ordena client-side | Filtra por idioma **no banco** antes de retornar |
| PT vê PT + ES misturados | PT vê **apenas** PT (e NULL) |
| ES vê PT + ES misturados | ES vê **apenas** ES |

---

## Resumo

| Arquivo | Mudança |
|---------|---------|
| `src/hooks/useContent.ts` | Adicionar filtro por idioma em `useHighlightedItems` (mesmo padrão de `useFeaturedItems`) |

---

## Verificação

1. **Adicionar highlight PT:** Vídeo "Rio de Janeiro" (language='pt')
2. **Adicionar highlight ES:** Vídeo "Buenos Aires" (language='es')
3. **Usuário em PT:** Vê APENAS "Rio de Janeiro"
4. **Usuário em ES:** Vê APENAS "Buenos Aires"
5. **Trocar idioma:** Highlights mudam automaticamente
