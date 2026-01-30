
# Plano: Filtro de Idioma + Seletor no EditModal + Drag-and-Drop Melhorado

## Resumo

Implementar três melhorias na gestão de vídeos:
1. **Adicionar filtro de idioma** na aba de Vídeos (Internacionais/Todos/Favoritos equivale a ES/Todos)
2. **Adicionar seletor de idioma no EditModal** para alterar o idioma de um vídeo
3. **Manter o drag-and-drop funcional** que já existe (quando ordenação é "manual")

---

## Estado Atual

| Componente | Situação |
|------------|----------|
| `ContentSection.tsx` | Tem `languageFilter` mas **não está sendo usado** na aba de Vídeos |
| `ContentFilters.tsx` | **Não tem filtro de idioma** |
| `EditModal.tsx` | **Não tem seletor de idioma** |
| Banco de dados | Já tem coluna `language` funcionando (pt/es) |
| Drag-and-drop | Já funciona quando `sortOrder === "custom"` |

---

## Fase 1: Adicionar Filtro de Idioma no ContentFilters

**Arquivo:** `src/components/gestao/ContentFilters.tsx`

### Mudanças:

1. Adicionar nova prop `languageFilter` e `onLanguageChange`
2. Adicionar Select para idioma com opções:
   - Todos
   - Português (PT)
   - Espanhol/Internacionais (ES)

```tsx
interface ContentFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  typeFilter: string;
  onTypeChange: (value: string) => void;
  categoryFilter: string;
  onCategoryChange: (value: string) => void;
  languageFilter?: string;           // Nova prop
  onLanguageChange?: (value: string) => void;  // Nova prop
  showTypeFilter?: boolean;
  showLanguageFilter?: boolean;      // Nova prop
}

// Adicionar no JSX:
{showLanguageFilter && (
  <Select value={languageFilter} onValueChange={onLanguageChange}>
    <SelectTrigger className="w-[160px]">
      <Globe className="w-4 h-4 mr-2" />
      <SelectValue placeholder="Idioma" />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="all">Todos idiomas</SelectItem>
      <SelectItem value="pt">Português</SelectItem>
      <SelectItem value="es">Espanhol/Int.</SelectItem>
    </SelectContent>
  </Select>
)}
```

---

## Fase 2: Aplicar Filtro na Aba de Vídeos

**Arquivo:** `src/components/gestao/ContentSection.tsx`

### Mudanças:

1. Modificar `videoItems` para filtrar por idioma:

```tsx
const videoItems = useMemo(() => {
  let filtered = contentItems.filter(item => ['video', 'seasonal'].includes(item.type));
  
  // Aplicar filtro de idioma
  if (languageFilter !== 'all') {
    filtered = filtered.filter(item => {
      const itemLang = item.language || 'pt';
      return itemLang === languageFilter;
    });
  }
  
  return sortItems(filterItems(filtered));
}, [contentItems, sortOrder, searchQuery, categoryFilter, languageFilter]);
```

2. Passar as props para ContentFilters na aba de vídeos:

```tsx
<ContentFilters
  searchQuery={searchQuery}
  onSearchChange={setSearchQuery}
  typeFilter={typeFilter}
  onTypeChange={setTypeFilter}
  categoryFilter={categoryFilter}
  onCategoryChange={setCategoryFilter}
  languageFilter={languageFilter}
  onLanguageChange={setLanguageFilter}
  showTypeFilter={false}
  showLanguageFilter={true}
/>
```

---

## Fase 3: Adicionar Seletor de Idioma no EditModal

**Arquivo:** `src/components/gestao/EditModal.tsx`

### Mudanças:

1. Adicionar prop `language` no item e no callback `onSave`
2. Adicionar estado e Select para idioma:

```tsx
interface EditModalProps {
  item: {
    id: string;
    title: string;
    url: string;
    description?: string | null;
    is_active?: boolean;
    language?: string | null;  // Nova prop
  } | null;
  onSave: (id: string, data: { 
    title: string; 
    url: string; 
    description: string; 
    is_active: boolean;
    language: string;  // Nova prop
  }) => void;
}

// Adicionar estado:
const [language, setLanguage] = useState("pt");

// No useEffect:
setLanguage(item.language || "pt");

// Adicionar no JSX (após o campo "Ativo"):
<div className="space-y-2">
  <Label htmlFor="language">Idioma</Label>
  <Select value={language} onValueChange={setLanguage}>
    <SelectTrigger>
      <SelectValue />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="pt">Português</SelectItem>
      <SelectItem value="es">Espanhol</SelectItem>
    </SelectContent>
  </Select>
</div>

// No handleSave:
onSave(item.id, { title, url, description, is_active: isActive, language });
```

---

## Fase 4: Atualizar Hook useUpdateContentItem

**Arquivo:** `src/hooks/useContent.ts`

### Mudanças:

Adicionar `language` nos campos aceitos pela mutation:

```tsx
export const useUpdateContentItem = () => {
  return useMutation({
    mutationFn: async (data: { 
      id: string; 
      title?: string; 
      url?: string;
      description?: string | null;
      is_active?: boolean;
      language?: string;  // Adicionar
    }) => {
      // ... resto igual
    },
  });
};
```

---

## Fase 5: Atualizar Gestao.tsx para Passar Language

**Arquivo:** `src/pages/Gestao.tsx`

### Mudanças:

1. Atualizar tipo `EditableItem` para incluir `language`:

```tsx
type EditableItem = {
  id: string;
  title: string;
  url: string;
  description?: string | null;
  is_active?: boolean;
  language?: string | null;  // Adicionar
};
```

2. Atualizar `handleSaveItem` para incluir `language`:

```tsx
const handleSaveItem = (id: string, data: { 
  title: string; 
  url: string; 
  description: string; 
  is_active: boolean;
  language: string;  // Adicionar
}) => {
  updateContent.mutate(
    { id, ...data },
    { /* callbacks */ }
  );
};
```

---

## Resumo das Mudanças

| Arquivo | Mudanças |
|---------|----------|
| `src/components/gestao/ContentFilters.tsx` | Adicionar filtro de idioma (PT/ES/Todos) |
| `src/components/gestao/ContentSection.tsx` | Aplicar filtro de idioma nos vídeos, passar props |
| `src/components/gestao/EditModal.tsx` | Adicionar seletor de idioma |
| `src/hooks/useContent.ts` | Adicionar `language` no `useUpdateContentItem` |
| `src/pages/Gestao.tsx` | Atualizar tipos e handlers para incluir language |

---

## Comportamento Final

### Na Aba de Vídeos:

```text
┌──────────────────────────────────────────────────────────┐
│  [+ Adicionar ▼]  [Ordenar: Mais recentes ▼]             │
│                                                          │
│  [🔍 Pesquisar...]  [Categoria ▼]  [🌐 Idioma ▼]        │
│                                     ├─ Todos idiomas     │
│                                     ├─ 🇧🇷 Português    │
│                                     └─ 🇪🇸 Espanhol/Int. │
│                                                          │
│  ┌────────┐  ┌────────┐  ┌────────┐  ┌────────┐         │
│  │ Vídeo  │  │ Vídeo  │  │ Vídeo  │  │ Vídeo  │         │
│  │   PT   │  │   ES   │  │   PT   │  │   ES   │         │
│  │[Editar]│  │[Editar]│  │[Editar]│  │[Editar]│         │
│  └────────┘  └────────┘  └────────┘  └────────┘         │
└──────────────────────────────────────────────────────────┘
```

### No Modal de Edição:

```text
┌──────────────────────────────────────┐
│  Editar Item                         │
├──────────────────────────────────────┤
│  Título: [________________]          │
│  URL:    [________________]          │
│  Legenda: [_______________]          │
│                                      │
│  Ativo:  [x]                         │
│                                      │
│  Idioma: [🇧🇷 Português ▼]           │
│          ├─ 🇧🇷 Português            │
│          └─ 🇪🇸 Espanhol             │
│                                      │
│  [Cancelar]          [Salvar]        │
└──────────────────────────────────────┘
```

---

## Drag-and-Drop

O drag-and-drop **já está implementado** e funciona quando:
1. O usuário seleciona "Ordem manual (drag)" no filtro de ordenação
2. Aparece o ícone de arrastar (⋮⋮) no canto dos cards
3. Ao arrastar, a ordem é salva no campo `display_order`

**Não precisa de mudanças** nesta funcionalidade - apenas garantir que continua funcionando após as modificações.

---

## Verificação Final

- [ ] Filtro de idioma aparece na aba de Vídeos
- [ ] Selecionar "Espanhol" mostra apenas vídeos em ES
- [ ] Selecionar "Português" mostra apenas vídeos em PT
- [ ] Ao editar um vídeo, aparece seletor de idioma
- [ ] Alterar idioma e salvar persiste a mudança
- [ ] Drag-and-drop continua funcionando em "Ordem manual"
