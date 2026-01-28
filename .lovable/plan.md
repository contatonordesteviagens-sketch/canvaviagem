

# Plano de Implementacao: Canva Viagem - Melhorias Pendentes

## Analise do Estado Atual

Apos revisar o codigo, identifiquei que **grande parte das funcionalidades ja foram implementadas**:

| Tarefa | Status | Observacoes |
|--------|--------|-------------|
| TAREFA 1: Widget Zaia vs NavBar Mobile | ✅ Parcial | CSS implementado em index.html, mas persiste o problema |
| TAREFA 2A: Filtro Favoritos | ✅ Completo | Implementado em Index.tsx e BottomNav |
| TAREFA 2B: Ordenacao "Mais Recente" | ✅ Completo | Ordenacao por created_at DESC ja funciona |
| TAREFA 3: Badge "Novo" (3 mais recentes) | ✅ Completo | Hook useNewestItemIds implementado |
| TAREFA 4: Importacao + Calendario | ✅ Completo | Sistema de agendamento automatico funcionando |
| TAREFA 5: Midia Externa + Auto-Destaque | ❌ Pendente | Nao implementado |

---

## Implementacoes Pendentes

### 1. Resolver Definitivamente Widget Zaia (TAREFA 1)

O CSS atual no index.html tenta ajustar o widget, mas o script do Zaia pode estar sobrescrevendo. Solucao mais robusta:

**Arquivo: `index.html`**
- Adicionar observador de mutacoes (MutationObserver) para garantir que o widget seja ajustado mesmo apos carregamento dinamico
- Aumentar especificidade dos seletores CSS

```html
<script>
  // Observar DOM e ajustar widget Zaia quando aparecer
  const adjustZaiaWidget = () => {
    const widgets = document.querySelectorAll('[id*="zaia"], [class*="chat"], .zaia-widget, #chatbot-fab');
    widgets.forEach(el => {
      if (window.innerWidth <= 768) {
        el.style.setProperty('bottom', '100px', 'important');
        el.style.setProperty('z-index', '45', 'important');
      }
    });
  };
  
  // MutationObserver para detectar quando widget e inserido
  const observer = new MutationObserver(adjustZaiaWidget);
  observer.observe(document.body, { childList: true, subtree: true });
  window.addEventListener('resize', adjustZaiaWidget);
</script>
```

**Arquivo: `src/components/canva/BottomNav.tsx`**
- Confirmar z-index z-[60] (ja implementado)
- Adicionar classe safe-area-inset para iOS

---

### 2. Sistema de Midia Externa (GIF/Video) - TAREFA 5A

**2.1 Migrar schema do banco (nova coluna)**

```sql
ALTER TABLE content_items 
ADD COLUMN media_url TEXT DEFAULT NULL,
ADD COLUMN media_type TEXT DEFAULT NULL CHECK (media_type IN ('gif', 'video', NULL)),
ADD COLUMN is_highlighted BOOLEAN DEFAULT false;
```

**2.2 Arquivo: `src/components/gestao/ImportSection.tsx`**

Adicionar na aba de importacao:

```typescript
// Novos estados
const [mediaUrl, setMediaUrl] = useState("");
const [mediaType, setMediaType] = useState<"gif" | "video" | null>(null);
const [autoHighlight, setAutoHighlight] = useState(false);
const [autoFavorite, setAutoFavorite] = useState(false);

// Nova UI - Tabs para GIF/Video
<Tabs defaultValue="gif">
  <TabsList>
    <TabsTrigger value="gif">GIF Animado</TabsTrigger>
    <TabsTrigger value="video">Video Curto</TabsTrigger>
  </TabsList>
  <TabsContent value="gif">
    <Input 
      placeholder="Link do GIF (Giphy, Tenor...)"
      value={mediaUrl}
      onChange={(e) => { setMediaUrl(e.target.value); setMediaType("gif"); }}
    />
  </TabsContent>
  <TabsContent value="video">
    <Input 
      placeholder="Link do video (max 30s)"
      value={mediaUrl}
      onChange={(e) => { setMediaUrl(e.target.value); setMediaType("video"); }}
    />
  </TabsContent>
</Tabs>

// Checkboxes de automacao
<div className="space-y-2 border p-4 rounded-lg bg-muted/50">
  <Label>Acoes Automaticas</Label>
  <Checkbox id="auto-favorite" checked={autoFavorite} onChange={setAutoFavorite}>
    ⭐ Adicionar aos Favoritos
  </Checkbox>
  <Checkbox id="auto-calendar" checked={autoSchedule} onChange={setAutoSchedule}>
    📅 Agendar no Calendario
  </Checkbox>
  <Checkbox id="auto-highlight" checked={autoHighlight} onChange={setAutoHighlight}>
    ✨ Marcar como Destaque
  </Checkbox>
</div>
```

**2.3 Atualizar logica de insercao**

```typescript
// Ao criar item, incluir novos campos
await supabase.from("content_items").insert({
  title: quickTitle.trim(),
  url: quickUrl.trim(),
  description: quickCaption.trim() || null,
  media_url: mediaUrl || null,
  media_type: mediaType,
  is_highlighted: autoHighlight,
  // ...outros campos
});

// Se auto-favorite, adicionar aos favoritos
if (autoFavorite && createdItem) {
  await supabase.from("user_favorites").insert({
    user_id: user.id,
    content_type: "content_item",
    content_id: createdItem.id,
  });
}
```

---

### 3. Secao Destaques na Tela Principal - TAREFA 5D

**Arquivo: `src/pages/Index.tsx`**

Adicionar secao especial antes do conteudo normal:

```typescript
// Buscar itens destacados
const { data: highlightedItems } = useQuery({
  queryKey: ["highlighted-items"],
  queryFn: async () => {
    const { data } = await supabase
      .from("content_items")
      .select("*")
      .eq("is_highlighted", true)
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .limit(3);
    return data;
  },
});

// Renderizar antes do conteudo principal
{highlightedItems && highlightedItems.length > 0 && (
  <section className="mb-8 animate-fade-in">
    <SectionHeader 
      title="✨ Destaques da Semana" 
      subtitle="Conteudos em destaque selecionados para voce"
    />
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {highlightedItems.map(item => (
        <Card key={item.id} className="overflow-hidden border-primary/50 shadow-lg">
          {/* Midia animada (GIF ou Video) */}
          {item.media_url && (
            <div className="aspect-video">
              {item.media_type === 'gif' ? (
                <img src={item.media_url} alt={item.title} className="w-full h-full object-cover" loading="lazy" />
              ) : (
                <video src={item.media_url} autoPlay loop muted playsInline className="w-full h-full object-cover" />
              )}
            </div>
          )}
          <CardContent className="p-4">
            <Badge className="mb-2 bg-gradient-to-r from-primary to-accent">Destaque</Badge>
            <h3 className="font-bold text-lg">{item.title}</h3>
            {item.description && (
              <p className="text-sm text-muted-foreground line-clamp-2">{item.description}</p>
            )}
            <Button className="w-full mt-3" onClick={() => window.open(item.url, '_blank')}>
              <ExternalLink className="w-4 h-4 mr-2" />
              Editar no Canva
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  </section>
)}
```

---

### 4. Limite de Favoritos com FIFO - TAREFA 5C

**Arquivo: `src/hooks/useFavorites.ts`**

Atualizar mutacao para implementar limite deslizante:

```typescript
const MAX_FAVORITES = 10;

const toggleFavorite = useMutation({
  mutationFn: async ({ contentType, contentId }) => {
    if (!user) throw new Error("User not authenticated");

    const existing = favorites.data?.find(
      (f) => f.content_type === contentType && f.content_id === contentId
    );

    if (existing) {
      // Remover favorito
      await supabase.from("user_favorites").delete().eq("id", existing.id);
      return { action: "removed" };
    } else {
      // Verificar limite antes de adicionar
      const { data: currentFavorites } = await supabase
        .from("user_favorites")
        .select("id, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: true });

      // Se atingiu limite, remover o mais antigo (FIFO)
      if (currentFavorites && currentFavorites.length >= MAX_FAVORITES) {
        const oldest = currentFavorites[0];
        await supabase.from("user_favorites").delete().eq("id", oldest.id);
      }

      // Adicionar novo favorito
      await supabase.from("user_favorites").insert({
        user_id: user.id,
        content_type: contentType,
        content_id: contentId,
      });
      
      return { action: "added" };
    }
  },
  // ...
});

// Exportar contador
return {
  favorites: favorites.data || [],
  favoritesCount: favorites.data?.length || 0,
  MAX_FAVORITES,
  // ...
};
```

**UI de feedback (Index.tsx ou Header):**

```typescript
// Mostrar contador
<Badge variant="outline" className="gap-1">
  ⭐ {favoritesCount}/{MAX_FAVORITES}
</Badge>
```

---

### 5. Atualizar Hook useContent (novos campos)

**Arquivo: `src/hooks/useContent.ts`**

Incluir novos campos na interface:

```typescript
export interface ContentItem {
  // campos existentes...
  media_url: string | null;
  media_type: 'gif' | 'video' | null;
  is_highlighted: boolean;
}
```

---

## Resumo de Arquivos a Modificar

| Arquivo | Alteracoes |
|---------|------------|
| `index.html` | Adicionar MutationObserver para widget Zaia |
| `src/components/gestao/ImportSection.tsx` | Adicionar campos midia + checkboxes automacao |
| `src/pages/Index.tsx` | Adicionar secao Destaques |
| `src/hooks/useFavorites.ts` | Implementar limite FIFO de 10 favoritos |
| `src/hooks/useContent.ts` | Atualizar interface com novos campos |

---

## Migracoes de Banco de Dados

```sql
-- Adicionar campos para midia externa e destaque
ALTER TABLE content_items 
ADD COLUMN IF NOT EXISTS media_url TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS media_type TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS is_highlighted BOOLEAN DEFAULT false;

-- Constraint para validar tipo de midia
ALTER TABLE content_items 
ADD CONSTRAINT valid_media_type 
CHECK (media_type IS NULL OR media_type IN ('gif', 'video'));
```

---

## Fluxo de Importacao Atualizado

```text
GESTAO > IMPORTAR > Item Unico
        |
        v
  Titulo: [________________]
  Link Canva: [______________]
  Legenda: [________________]
        |
        v
  Midia de Destaque (Opcional)
  [GIF] [Video]
  Link: [____________________]
        |
        v
  Acoes Automaticas:
  [x] Adicionar aos Favoritos
  [x] Agendar no Calendario
  [x] Marcar como Destaque
        |
        v
  [IMPORTAR]
        |
        v
  Item criado + agendado + favoritado + destacado
```

---

## Criterios de Aceitacao

- [ ] Widget Zaia nao sobrepoe navegacao mobile em nenhum cenario
- [ ] Campo de midia externa (GIF/Video) funciona na importacao
- [ ] Checkbox "Auto-Destaque" cria secao especial na home
- [ ] Limite de 10 favoritos com FIFO (mais antigo removido)
- [ ] Contador de favoritos visivel (X/10)
- [ ] Secao "Destaques da Semana" renderiza GIF/video animado
- [ ] Performance: GIFs carregam com lazy loading
- [ ] Fallback: se midia falhar, mostrar placeholder

---

## Secao Tecnica

### Tipos Atualizados

```typescript
// ContentItem atualizado
interface ContentItem {
  id: string;
  title: string;
  url: string;
  type: string;
  category: string | null;
  description: string | null;
  icon: string;
  image_url: string | null;
  is_new: boolean;
  is_active: boolean;
  is_featured: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
  language: string;
  // NOVOS
  media_url: string | null;
  media_type: 'gif' | 'video' | null;
  is_highlighted: boolean;
}
```

### Performance de Midia

Para GIFs e videos externos, aplicar:
- `loading="lazy"` em imgs
- `playsInline muted autoPlay loop` em videos
- Fallback `onerror` para placeholder

