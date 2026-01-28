
# Plano: Sistema de Legendas para Videos na Gestao

## Resumo do Pedido

O usuario quer:

1. **Ao editar videos**: Poder adicionar/editar uma legenda (caption/description)
2. **Visibilidade**: Ver quais videos tem legenda e quais nao tem no painel de gestao
3. **Importacao**: Campos separados para Titulo, Link e Legenda na importacao rapida

---

## Analise Tecnica

### Campo no Banco de Dados

A tabela `content_items` ja possui o campo `description` (TEXT, nullable) que sera usado para armazenar a legenda dos videos. Nao e necessaria migracao de banco de dados.

```text
Estrutura atual content_items:
- id, title, url, type, category...
- description (TEXT, nullable) <- Usaremos este campo para legendas
```

---

## Implementacao

### 1. Atualizar Modal de Edicao (EditModal)

| Arquivo | Alteracao |
|---------|-----------|
| `src/components/gestao/EditModal.tsx` | Adicionar campo `Textarea` para legenda/description |

**Mudancas:**
- Adicionar prop `description` ao tipo do item
- Adicionar estado `description` e `Textarea` no formulario
- Incluir `description` no `onSave`

```typescript
// Props atualizadas
interface EditModalProps {
  item: {
    id: string;
    title: string;
    url: string;
    description?: string | null;  // NOVO
    is_active?: boolean;
  } | null;
  onSave: (id: string, data: { 
    title: string; 
    url: string; 
    description: string;  // NOVO
    is_active: boolean 
  }) => void;
}

// Novo campo no formulario
<div className="space-y-2">
  <Label htmlFor="description">Legenda do Video</Label>
  <Textarea
    id="description"
    value={description}
    onChange={(e) => setDescription(e.target.value)}
    placeholder="Digite a legenda que sera usada no calendario..."
    rows={4}
  />
</div>
```

### 2. Atualizar Hook de Update

| Arquivo | Alteracao |
|---------|-----------|
| `src/hooks/useContent.ts` | Incluir `description` no `useUpdateContentItem` |

```typescript
// useUpdateContentItem atualizado
mutationFn: async (data: { 
  id: string; 
  title?: string; 
  url?: string;
  description?: string | null;  // NOVO
  is_active?: boolean 
}) => {
```

### 3. Indicador Visual de Legenda nos Cards

| Arquivo | Alteracao |
|---------|-----------|
| `src/components/gestao/EditableCard.tsx` | Adicionar badge/indicador de legenda |
| `src/components/gestao/ContentSection.tsx` | Passar prop `hasCaption` para o card |

**UI no EditableCard:**
```typescript
// Nova prop
hasCaption?: boolean;

// Badge visual (junto aos outros badges)
{!hasCaption && (
  <Badge variant="outline" className="text-xs border-amber-500 text-amber-500">
    Sem legenda
  </Badge>
)}
{hasCaption && (
  <Badge variant="outline" className="text-xs border-green-500 text-green-500">
    📝 Com legenda
  </Badge>
)}
```

### 4. Atualizar ContentSection

| Arquivo | Alteracao |
|---------|-----------|
| `src/components/gestao/ContentSection.tsx` | Passar `description` e `hasCaption` para cards e modal |

```typescript
// No renderVideoGrid
<EditableCard
  id={item.id}
  title={item.title}
  url={item.url}
  description={item.description}  // NOVO
  hasCaption={!!item.description?.trim()}  // NOVO
  ...
/>

// Ao chamar onEditItem
onEdit={(editItem) => onEditItem({
  ...editItem,
  description: item.description  // Incluir description
})}
```

### 5. Atualizar Pagina Gestao

| Arquivo | Alteracao |
|---------|-----------|
| `src/pages/Gestao.tsx` | Atualizar tipos e handler de save |

```typescript
// Tipo atualizado
type EditableItem = {
  id: string;
  title: string;
  url: string;
  description?: string | null;  // NOVO
  is_active?: boolean;
};

// handleSaveItem atualizado
const handleSaveItem = (id: string, data: { 
  title: string; 
  url: string; 
  description: string;  // NOVO
  is_active: boolean 
}) => {
  updateContent.mutate({ id, ...data }, ...);
};
```

### 6. Importacao com Campo de Legenda Separado

| Arquivo | Alteracao |
|---------|-----------|
| `src/components/gestao/ImportSection.tsx` | Separar campos titulo, link e legenda |

**Mudancas na Importacao Rapida:**

```typescript
// Estados separados
const [quickTitle, setQuickTitle] = useState("");
const [quickUrl, setQuickUrl] = useState("");
const [quickCaption, setQuickCaption] = useState("");  // Ja existe

// UI com 3 campos separados
<div className="space-y-4">
  <div className="space-y-2">
    <Label>Titulo do Video *</Label>
    <Input
      placeholder="Ex: Istambul - Turquia"
      value={quickTitle}
      onChange={(e) => setQuickTitle(e.target.value)}
    />
  </div>
  
  <div className="space-y-2">
    <Label>Link do Canva *</Label>
    <Input
      placeholder="https://canva.com/design/..."
      value={quickUrl}
      onChange={(e) => setQuickUrl(e.target.value)}
    />
  </div>
  
  <div className="space-y-2">
    <Label>Legenda (Opcional)</Label>
    <Textarea
      placeholder="Digite a legenda do video..."
      value={quickCaption}
      onChange={(e) => setQuickCaption(e.target.value)}
      rows={3}
    />
  </div>
</div>
```

**Logica de insercao atualizada:**

```typescript
// Ao criar item, incluir description
await supabase.from("content_items").insert({
  title: quickTitle,
  url: quickUrl,
  description: quickCaption || null,  // NOVO - salva legenda
  type: selectedType,
  ...
});
```

---

## Fluxo Atualizado

```text
PAINEL GESTAO > CONTEUDO
        |
        v
  [Lista de Videos]
        |
  +-----+-----+
  |           |
Badge       Badge
"Sem        "Com
legenda"    legenda"
  |           |
  v           v
[Editar] -> Modal com campo Legenda
        |
        v
  [Salvar] -> description atualizado no banco


PAINEL GESTAO > IMPORTAR
        |
        v
  Campo: Titulo
  Campo: Link Canva
  Campo: Legenda (opcional)
        |
        v
  [Importar] -> Salva com description preenchido
```

---

## Resumo de Arquivos a Modificar

| Arquivo | Alteracoes |
|---------|------------|
| `src/components/gestao/EditModal.tsx` | Adicionar Textarea para legenda |
| `src/components/gestao/EditableCard.tsx` | Adicionar badge "Com/Sem legenda" |
| `src/components/gestao/ContentSection.tsx` | Passar description e hasCaption |
| `src/pages/Gestao.tsx` | Atualizar tipos e handlers |
| `src/hooks/useContent.ts` | Incluir description no update |
| `src/components/gestao/ImportSection.tsx` | Separar campos titulo, link, legenda |

---

## Secao Tecnica

### Tipo ContentItem Atualizado

O tipo `ContentItem` em `useContent.ts` ja inclui `description`:

```typescript
export interface ContentItem {
  // ... outros campos
  description: string | null;  // <- Ja existe!
}
```

### Nao Precisa Migracao

O campo `description` ja existe na tabela `content_items`:

```sql
-- Estrutura atual (confirmado via query)
description | text | Nullable: YES
```

---

## Criterios de Aceitacao

- [ ] Modal de edicao tem campo "Legenda" com Textarea
- [ ] Videos mostram badge "Sem legenda" (amarelo) ou "Com legenda" (verde)
- [ ] Ao salvar edicao, description e atualizado no banco
- [ ] Importacao tem 3 campos separados: Titulo, Link e Legenda
- [ ] Legenda importada e salva no campo description
- [ ] Legenda aparece ao agendar no calendario
