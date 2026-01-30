
# Plano de Implementação: Sistema de Destaques Separados por Idioma

## Resumo

Implementar um sistema de gestão de destaques com abas separadas por idioma (PT/ES) no painel administrativo, permitindo gerenciar até 10 destaques independentes para cada idioma. Na página inicial, os usuários verão apenas os destaques do idioma selecionado.

---

## Estado Atual

| Componente | Situação Atual |
|------------|---------------|
| `ContentSection.tsx` | Destaques sem separação por idioma (apenas 1 lista de 10 itens) |
| `useFeaturedItems` | Busca todos os destaques e aplica ordenação por idioma (não filtra) |
| `SelectFeaturedModal` | Não considera idioma ao mostrar itens disponíveis |
| `FeaturedCard` | Não mostra badge de idioma |

---

## Arquitetura da Solução

```text
┌────────────────────────────────────────────────────────────────────┐
│                       PAINEL DE GESTÃO                             │
│                                                                    │
│  ┌───────────────────────────────────────────────────────────────┐ │
│  │  ⭐ DESTAQUES PRINCIPAIS                                      │ │
│  │                                                               │ │
│  │  ┌─────────────────────┬─────────────────────┐                │ │
│  │  │ 🇧🇷 Destaques PT     │ 🇪🇸 Destaques ES     │  ← Abas       │ │
│  │  │    (5/10)           │    (3/10)           │                │ │
│  │  └─────────────────────┴─────────────────────┘                │ │
│  │                                                               │ │
│  │  [Aba PT ativa]                                              │ │
│  │  ┌────┐  ┌────┐  ┌────┐  ┌────┐  ┌────┐  ┌──────────┐        │ │
│  │  │ #1 │  │ #2 │  │ #3 │  │ #4 │  │ #5 │  │ + Add PT │        │ │
│  │  └────┘  └────┘  └────┘  └────┘  └────┘  └──────────┘        │ │
│  └───────────────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────────────┘
```

---

## Fase 1: Atualizar `ContentSection.tsx` - Separar Destaques por Idioma

### 1.1 Adicionar estado para controle da aba de destaque

**Arquivo:** `src/components/gestao/ContentSection.tsx`

**Mudanças:**

1. **Adicionar estado para aba de idioma ativa nos destaques:**
```typescript
const [featuredLanguageTab, setFeaturedLanguageTab] = useState<"pt" | "es">("pt");
```

2. **Criar variáveis para separar destaques por idioma:**
```typescript
// Destaques separados por idioma
const featuredPT = useMemo(() => 
  contentItems.filter(item => 
    item.is_featured && 
    ['video', 'seasonal'].includes(item.type) &&
    (item.language === 'pt' || !item.language)
  ),
  [contentItems]
);

const featuredES = useMemo(() => 
  contentItems.filter(item => 
    item.is_featured && 
    ['video', 'seasonal'].includes(item.type) &&
    item.language === 'es'
  ),
  [contentItems]
);
```

3. **Atualizar `availableForFeatured` para filtrar por idioma:**
```typescript
// Itens disponíveis para o idioma da aba ativa
const availableForFeaturedByLanguage = useMemo(() => {
  const lang = featuredLanguageTab;
  return videoItems.filter(item => 
    !item.is_featured && 
    (lang === 'pt' 
      ? (item.language === 'pt' || !item.language) 
      : item.language === 'es'
    )
  );
}, [videoItems, featuredLanguageTab]);
```

### 1.2 Atualizar a aba "Destaque" com sub-abas de idioma

**Substituir o conteúdo de `TabsContent value="destaque"`:**

```tsx
<TabsContent value="destaque" className="mt-6">
  <Card className="mb-6 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 border-amber-200 dark:border-amber-800">
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <Sparkles className="h-5 w-5 text-amber-500" />
        Mídias em Destaque por Idioma
      </CardTitle>
      <p className="text-sm text-muted-foreground">
        Gerencie até 10 destaques para cada idioma. Os usuários verão apenas os destaques do idioma selecionado.
      </p>
    </CardHeader>
  </Card>
  
  {/* Sub-abas por idioma */}
  <Tabs value={featuredLanguageTab} onValueChange={(v) => setFeaturedLanguageTab(v as "pt" | "es")}>
    <TabsList className="mb-4">
      <TabsTrigger value="pt" className="flex items-center gap-2">
        🇧🇷 Destaques PT ({featuredPT.length}/10)
      </TabsTrigger>
      <TabsTrigger value="es" className="flex items-center gap-2">
        🇪🇸 Destaques ES ({featuredES.length}/10)
      </TabsTrigger>
    </TabsList>
    
    {/* Conteúdo PT */}
    <TabsContent value="pt">
      <FeaturedLanguageGrid
        items={featuredPT}
        language="pt"
        maxItems={10}
        onOpenSelectModal={() => setSelectFeaturedModalOpen(true)}
        onUploadImage={handleUploadFeaturedImage}
        onUpdateImageUrl={handleUpdateImageUrl}
        onRemoveFromFeatured={handleRemoveFromFeatured}
        onEdit={onEditItem}
      />
    </TabsContent>
    
    {/* Conteúdo ES */}
    <TabsContent value="es">
      <FeaturedLanguageGrid
        items={featuredES}
        language="es"
        maxItems={10}
        onOpenSelectModal={() => setSelectFeaturedModalOpen(true)}
        onUploadImage={handleUploadFeaturedImage}
        onUpdateImageUrl={handleUpdateImageUrl}
        onRemoveFromFeatured={handleRemoveFromFeatured}
        onEdit={onEditItem}
      />
    </TabsContent>
  </Tabs>
</TabsContent>
```

### 1.3 Criar componente `FeaturedLanguageGrid`

**Adicionar no mesmo arquivo ou criar componente separado:**

```tsx
interface FeaturedLanguageGridProps {
  items: ContentItem[];
  language: "pt" | "es";
  maxItems: number;
  onOpenSelectModal: () => void;
  onUploadImage: (id: string, file: File) => void;
  onUpdateImageUrl: (id: string, url: string) => void;
  onRemoveFromFeatured: (id: string) => void;
  onEdit: (item: EditableItem) => void;
}

const FeaturedLanguageGrid = ({
  items,
  language,
  maxItems,
  onOpenSelectModal,
  onUploadImage,
  onUpdateImageUrl,
  onRemoveFromFeatured,
  onEdit,
}: FeaturedLanguageGridProps) => {
  const canAddMore = items.length < maxItems;
  
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      {items.map(item => (
        <FeaturedCard
          key={item.id}
          item={item}
          onUploadImage={onUploadImage}
          onUpdateImageUrl={onUpdateImageUrl}
          onRemoveFromFeatured={onRemoveFromFeatured}
          onEdit={onEdit}
        />
      ))}
      
      {/* Botão adicionar (se < 10) */}
      {canAddMore && (
        <Button
          variant="outline"
          className="aspect-[9/16] h-auto border-dashed flex flex-col items-center justify-center gap-2"
          onClick={onOpenSelectModal}
        >
          <Plus className="h-8 w-8" />
          <span className="text-sm">Adicionar</span>
          <span className="text-xs text-muted-foreground">
            ({items.length}/{maxItems})
          </span>
        </Button>
      )}
      
      {/* Mensagem se vazio */}
      {items.length === 0 && (
        <div className="col-span-full text-center py-8 text-muted-foreground">
          <Sparkles className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p>Nenhum destaque em {language === 'pt' ? 'Português' : 'Espanhol'}</p>
          <p className="text-sm">Clique em "Adicionar" para selecionar um vídeo.</p>
        </div>
      )}
    </div>
  );
};
```

### 1.4 Atualizar validação de limite no `handleToggleFeatured`

**Modificar a função para considerar o idioma do item:**

```typescript
const handleToggleFeatured = async (id: string) => {
  const item = contentItems.find(i => i.id === id);
  if (!item) return;
  
  // Verificar limite por idioma
  const itemLanguage = item.language || 'pt';
  const featuredForLanguage = itemLanguage === 'es' ? featuredES : featuredPT;
  
  if (!item.is_featured && featuredForLanguage.length >= 10) {
    toast({
      title: "Limite atingido",
      description: `Você já possui 10 destaques em ${itemLanguage === 'es' ? 'Espanhol' : 'Português'}. Remova um para adicionar outro.`,
      variant: "destructive",
    });
    return;
  }
  
  // ... resto da lógica
};
```

### 1.5 Atualizar o `SelectFeaturedModal` para usar idioma

**Modificar a chamada do modal para passar o idioma correto:**

```tsx
<SelectFeaturedModal
  isOpen={selectFeaturedModalOpen}
  onClose={() => setSelectFeaturedModalOpen(false)}
  availableVideos={availableForFeaturedByLanguage}
  onSelect={handleSelectFeatured}
  language={featuredLanguageTab}
/>
```

---

## Fase 2: Atualizar `SelectFeaturedModal.tsx`

### 2.1 Adicionar prop de idioma e ajustar UI

**Arquivo:** `src/components/gestao/SelectFeaturedModal.tsx`

```tsx
interface SelectFeaturedModalProps {
  isOpen: boolean;
  onClose: () => void;
  availableVideos: ContentItem[];
  onSelect: (id: string) => void;
  language: "pt" | "es";  // Nova prop
}

export const SelectFeaturedModal = ({
  isOpen,
  onClose,
  availableVideos,
  onSelect,
  language,
}: SelectFeaturedModalProps) => {
  // ...
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            Adicionar Destaque {language === 'pt' ? '🇧🇷 Português' : '🇪🇸 Espanhol'}
          </DialogTitle>
          <DialogDescription>
            Selecione um vídeo em {language === 'pt' ? 'Português' : 'Espanhol'} para destacar.
          </DialogDescription>
        </DialogHeader>
        
        {/* ... resto igual, usando availableVideos já filtrado */}
      </DialogContent>
    </Dialog>
  );
};
```

---

## Fase 3: Atualizar `useFeaturedItems` para Filtrar por Idioma

**Arquivo:** `src/hooks/useContent.ts`

### 3.1 Modificar a query para filtrar por idioma no banco

```typescript
export const useFeaturedItems = () => {
  const { language } = useLanguage();
  
  return useQuery({
    queryKey: ["featured-items", language],
    queryFn: async () => {
      let query = supabase
        .from("content_items")
        .select("*")
        .eq("is_active", true)
        .eq("is_featured", true)
        .in("type", ["video", "seasonal"])
        .order("display_order", { ascending: true })
        .limit(10);
      
      // Filtrar por idioma no banco
      if (language === 'pt') {
        query = query.or('language.eq.pt,language.is.null');
      } else {
        query = query.eq('language', language);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data as ContentItem[];
    },
    staleTime: 1000 * 60 * 5,
  });
};
```

---

## Fase 4: Atualizar `FeaturedCard.tsx` com Badge de Idioma (Opcional)

**Arquivo:** `src/components/gestao/FeaturedCard.tsx`

### 4.1 Adicionar badge visual de idioma

```tsx
// No componente FeaturedCard, adicionar badge de idioma
<Card className="relative overflow-hidden group">
  {/* Badge de idioma */}
  <div className="absolute top-2 left-2 z-10">
    <Badge variant="secondary" className="text-xs">
      {item.language === 'es' ? '🇪🇸' : '🇧🇷'}
    </Badge>
  </div>
  
  {/* ... resto igual */}
</Card>
```

---

## Fase 5: Atualizar contador na TabsList principal

**Arquivo:** `src/components/gestao/ContentSection.tsx`

Atualizar o texto do trigger para mostrar contagem total:

```tsx
<TabsTrigger value="destaque" className="flex items-center gap-2">
  <Sparkles className="h-4 w-4" />
  Destaques (PT: {featuredPT.length} | ES: {featuredES.length})
</TabsTrigger>
```

---

## Resumo das Mudanças

| Arquivo | Mudanças |
|---------|----------|
| `src/components/gestao/ContentSection.tsx` | Adicionar sub-abas PT/ES, separar destaques por idioma, componente FeaturedLanguageGrid |
| `src/components/gestao/SelectFeaturedModal.tsx` | Adicionar prop `language`, atualizar título |
| `src/components/gestao/FeaturedCard.tsx` | Adicionar badge de idioma |
| `src/hooks/useContent.ts` | Filtrar `useFeaturedItems` por idioma no banco |

---

## Verificação Final

### No Painel de Gestão:
- [ ] Aparece aba "Destaques" com sub-abas "🇧🇷 Destaques PT" e "🇪🇸 Destaques ES"
- [ ] Cada aba mostra contador (X/10)
- [ ] Clicar em "Adicionar" na aba PT mostra apenas vídeos em PT
- [ ] Clicar em "Adicionar" na aba ES mostra apenas vídeos em ES
- [ ] Limite de 10 é respeitado por idioma independentemente
- [ ] Remover destaque funciona corretamente
- [ ] Upload de imagem funciona corretamente

### Na Página Inicial (Index.tsx):
- [ ] Usuário em PT vê apenas destaques PT
- [ ] Usuário em ES vê apenas destaques ES
- [ ] Trocar idioma atualiza destaques automaticamente
- [ ] Máximo 10 destaques visíveis por idioma

---

## Dependências

| Fase | Depende de |
|------|------------|
| 1 (ContentSection) | Nenhuma |
| 2 (SelectFeaturedModal) | Fase 1 |
| 3 (useFeaturedItems) | Nenhuma (pode ser feito em paralelo) |
| 4 (FeaturedCard badge) | Nenhuma (opcional) |
| 5 (Contador) | Fase 1 |
