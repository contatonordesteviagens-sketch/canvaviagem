
# Plano: Correções Mobile e Melhorias de UX

## Resumo das Correções

O plano aborda 7 problemas identificados:

1. **Página Pós-Pagamento** - Diminuir título, ícone e adicionar instrução sobre spam
2. **Nome não integrado** - O nome inserido no pós-pagamento não está aparecendo no Header
3. **Ícones menores no scroll** - Ícones do BottomNav ficando menores ao scrollar
4. **Botão Início** - Está redirecionando para "Artes" (feed) ao invés de "Vídeos"
5. **Remover filtros atuais** - Substituir por multi-select
6. **Botão flutuante para minimizar** - Após "Ver mais", adicionar botão para recolher

---

## Mudança 1: Página Pós-Pagamento - Diminuir tamanhos e adicionar aviso de spam

**Arquivo:** `src/pages/PosPagamento.tsx`

### Alterações:

**Ícone (linhas 202-207):** Reduzir de 24x24 para 16x16 no mobile
```tsx
<div className="relative mx-auto w-16 h-16 md:w-24 md:h-24">
  <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping" />
  <div className="relative w-16 h-16 md:w-24 md:h-24 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center">
    <CheckCircle className="h-8 w-8 md:h-12 md:w-12 text-white" />
  </div>
</div>
```

**Título (linhas 210-219):** Reduzir tamanhos no mobile
```tsx
<div className="space-y-2">
  <h1 className="text-xl md:text-3xl font-bold text-primary flex items-center justify-center gap-1 md:gap-2">
    <Sparkles className="h-4 w-4 md:h-6 md:w-6" />
    Pagamento Confirmado!
    <Sparkles className="h-4 w-4 md:h-6 md:w-6" />
  </h1>
  <p className="text-base md:text-xl text-foreground">
    Preencha seus dados para receber seu acesso
  </p>
</div>
```

**Após mensagem de sucesso (linhas 343-351):** Adicionar aviso de spam
```tsx
<p className="text-green-600 dark:text-green-400 text-sm mt-1">
  Verifique sua caixa de entrada. <strong>Não esqueça de verificar a pasta de spam ou lixo eletrônico!</strong> O link expira em 1 hora.
</p>
```

---

## Mudança 2: Nome não sendo integrado no Header

**Problema Identificado:** A edge function `verify-magic-link` está salvando o nome corretamente no profile, mas há um delay no trigger. A função também precisa garantir que o profile exista antes de atualizar.

**Arquivo:** `supabase/functions/verify-magic-link/index.ts`

O código atual (linhas 84-93) aguarda 500ms após criar o usuário, mas isso pode não ser suficiente. Vamos aumentar para 1000ms e adicionar retry:

```typescript
// Salvar nome e telefone no perfil
const profileUpdates: Record<string, string> = {};
if (userName) profileUpdates.name = userName;
if (userPhone) profileUpdates.phone = userPhone;

if (Object.keys(profileUpdates).length > 0) {
  // Aguardar trigger criar perfil
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Tentar atualizar com retry
  let attempts = 0;
  let updated = false;
  while (!updated && attempts < 3) {
    const { error } = await supabaseAdmin
      .from("profiles")
      .update(profileUpdates)
      .eq("user_id", userId);
    
    if (!error) {
      updated = true;
      console.log("[VERIFY-MAGIC-LINK] Profile updated with name:", userName);
    } else {
      attempts++;
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }
}
```

---

## Mudança 3: Ícones do BottomNav ficando menores no scroll

**Arquivo:** `src/components/canva/BottomNav.tsx`

**Problema:** O componente precisa ter altura fixa e usar `shrink-0` para evitar compressão.

```tsx
<nav className="fixed bottom-0 left-0 right-0 z-[60] bg-white dark:bg-background border-t border-border/40 md:hidden">
  <div className="flex items-center justify-around h-16 pb-safe shrink-0">
    {navItems.map((item) => {
      // ...
      return (
        <button
          key={item.category}
          onClick={() => handleTabClick(item.category)}
          className={cn(
            "flex flex-col items-center justify-center gap-1 flex-1 h-full min-w-[64px] shrink-0 transition-all duration-200 relative active:scale-95",
            isActive ? "text-primary" : "text-muted-foreground"
          )}
          // ...
        >
          {/* Active indicator bar */}
          {isActive && (
            <div className="absolute top-0 w-12 h-0.5 bg-primary rounded-b-full shrink-0" />
          )}
          
          <Icon className={cn(
            "w-6 h-6 shrink-0 transition-transform",
            isActive && "scale-110"
          )} />
          <span className={cn(
            "text-[10px] font-medium transition-all shrink-0",
            isActive && "font-bold text-primary"
          )}>
            {item.label}
          </span>
        </button>
      );
    })}
  </div>
</nav>
```

---

## Mudança 4: Botão "Início" redireciona para Vídeos

**Arquivo:** `src/components/canva/BottomNav.tsx`

**Alterar linha 28:** Mudar de "feed" para "videos"
```tsx
const handleTabClick = (category: CategoryType | "home") => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
  
  // Home resets to videos view (not feed)
  if (category === "home") {
    onCategoryChange("videos");
  } else {
    onCategoryChange(category);
  }
};
```

**Alterar linha 39-41:** Ajustar verificação de ativo
```tsx
const isActive = item.category === "home" 
  ? activeCategory === "videos"  // Mudou de "feed" para "videos"
  : activeCategory === item.category;
```

---

## Mudança 5: Substituir Filtros por Multi-Select

**Arquivo:** `src/pages/Index.tsx`

**Remover filtros atuais e criar sistema de multi-seleção:**

1. Criar novo componente `ContentFilterDropdown`:

**Novo arquivo:** `src/components/canva/ContentFilterDropdown.tsx`

```tsx
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Filter, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export type ContentFilterType = 'nacionais' | 'internacionais' | 'artes' | 'stories';

interface ContentFilterDropdownProps {
  selectedFilters: ContentFilterType[];
  onFiltersChange: (filters: ContentFilterType[]) => void;
}

const filterOptions: { id: ContentFilterType; label: string; icon: string }[] = [
  { id: 'nacionais', label: 'Destinos Nacionais', icon: '🇧🇷' },
  { id: 'internacionais', label: 'Destinos Internacionais', icon: '🌎' },
  { id: 'artes', label: 'Artes para Feed', icon: '🖼️' },
  { id: 'stories', label: 'Stories', icon: '📱' },
];

export function ContentFilterDropdown({ 
  selectedFilters, 
  onFiltersChange 
}: ContentFilterDropdownProps) {
  const [open, setOpen] = useState(false);

  const toggleFilter = (filter: ContentFilterType) => {
    if (selectedFilters.includes(filter)) {
      onFiltersChange(selectedFilters.filter(f => f !== filter));
    } else {
      onFiltersChange([...selectedFilters, filter]);
    }
  };

  const clearAll = () => {
    onFiltersChange([]);
  };

  const hasFilters = selectedFilters.length > 0;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant="outline" 
          className={cn(
            "gap-2 rounded-full",
            hasFilters && "bg-primary text-primary-foreground hover:bg-primary/90"
          )}
        >
          <Filter className="h-4 w-4" />
          Filtrar
          {hasFilters && (
            <span className="bg-white/20 px-1.5 py-0.5 rounded-full text-xs">
              {selectedFilters.length}
            </span>
          )}
          <ChevronDown className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-4" align="start">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="font-semibold text-sm">Filtrar por:</p>
            {hasFilters && (
              <button 
                onClick={clearAll}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                Limpar
              </button>
            )}
          </div>
          
          <div className="space-y-2">
            {filterOptions.map((option) => (
              <label
                key={option.id}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted cursor-pointer"
              >
                <Checkbox
                  checked={selectedFilters.includes(option.id)}
                  onCheckedChange={() => toggleFilter(option.id)}
                />
                <span className="text-lg">{option.icon}</span>
                <span className="text-sm">{option.label}</span>
              </label>
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
```

2. Atualizar `Index.tsx`:

**Remover:** (linhas 46, 61, 66-71)
- `type VideoFilter`
- `const [videoFilter, setVideoFilter]`
- `const videoFilters`

**Adicionar:**
```tsx
import { ContentFilterDropdown, ContentFilterType } from "@/components/canva/ContentFilterDropdown";

// Estado novo
const [contentFilters, setContentFilters] = useState<ContentFilterType[]>([]);
```

**Substituir FilterChips (linha 325-329):**
```tsx
<div className="flex justify-center mb-6">
  <ContentFilterDropdown
    selectedFilters={contentFilters}
    onFiltersChange={setContentFilters}
  />
</div>
```

**Atualizar função de filtro** para usar o novo sistema multi-select.

---

## Mudança 6: Botão Flutuante para Minimizar Vídeos

**Arquivo:** `src/pages/Index.tsx`

**Adicionar botão flutuante quando `showAllVideos` for true (após linha 379):**

```tsx
{/* Floating collapse button when expanded */}
{showAllVideos && (
  <Button
    onClick={() => setShowAllVideos(false)}
    className="fixed bottom-24 md:bottom-8 right-4 z-50 rounded-full shadow-xl gap-2 animate-fade-in"
    size="lg"
  >
    <ChevronUp className="h-5 w-5" />
    Minimizar
  </Button>
)}
```

---

## Resumo Visual das Mudanças

```text
┌─────────────────────────────────────────────────────────────┐
│                    MUDANÇAS MOBILE                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ 1. PÓS-PAGAMENTO:                                           │
│    ┌──────────────────────┐                                 │
│    │   ✓ (menor)          │                                 │
│    │ Pagamento Confirmado │ ← Texto menor                   │
│    │   (texto menor)      │                                 │
│    │ [Verifique o spam!]  │ ← Nova instrução                │
│    └──────────────────────┘                                 │
│                                                             │
│ 2. HEADER:                                                  │
│    "Olá, [Nome do usuário]!" ← Nome agora aparece           │
│                                                             │
│ 3. BOTTOM NAV:                                              │
│    ┌─────────────────────────────────────────┐              │
│    │  🏠    🤖    🖼️    🎓    ❤️            │              │
│    │ Início  IA  Artes Aula Favoritos       │ ← Tamanho fixo│
│    └─────────────────────────────────────────┘              │
│                                                             │
│ 4. INÍCIO → VÍDEOS (não mais Artes)                         │
│                                                             │
│ 5. FILTROS:                                                 │
│    ANTES: [Todos] [Nacionais] [Internacionais] [Favoritos]  │
│    DEPOIS: [🔽 Filtrar (2)] → Dropdown multi-select         │
│              ☑️ Nacionais                                   │
│              ☑️ Internacionais                              │
│              ☐ Artes                                        │
│              ☐ Stories                                      │
│                                                             │
│ 6. BOTÃO FLUTUANTE:                                         │
│    Ao expandir "Ver mais":                                  │
│                     ┌──────────────┐                        │
│                     │ ⬆ Minimizar │ ← Botão flutuante      │
│                     └──────────────┘                        │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Arquivos Afetados

| Arquivo | Tipo de Mudança |
|---------|-----------------|
| `src/pages/PosPagamento.tsx` | Edição |
| `src/components/canva/BottomNav.tsx` | Edição |
| `src/pages/Index.tsx` | Edição |
| `src/components/canva/ContentFilterDropdown.tsx` | **Novo arquivo** |
| `supabase/functions/verify-magic-link/index.ts` | Edição |

---

## Detalhes Técnicos

### Sobre o nome não aparecer no Header:
- A edge function `verify-magic-link` já salva o nome no profile
- O Header já possui subscription Realtime para updates no profile
- O problema pode ser timing - aumentando o delay e adicionando retry resolve

### Sobre os ícones do BottomNav:
- Adicionando `shrink-0` em todos os elementos evita compressão durante scroll
- Mantendo altura fixa `h-16` no container garante consistência

### Sobre o filtro multi-select:
- Usa Popover do shadcn para dropdown
- Checkboxes permitem seleção múltipla
- Badge mostra quantos filtros estão ativos
- Botão "Limpar" para resetar todos os filtros
