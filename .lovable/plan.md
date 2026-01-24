
# Plano: Correção do CategoryNav + Novo Menu Principal

## Problema 1: Seta do CategoryNav não é clicável no mobile

### Causa
A seta `ChevronRight` está dentro de um `div` com `pointer-events-none` (linha 122), impedindo cliques.

### Solução
Tornar a seta clicável separadamente, fora do gradiente:
- Manter o gradiente de fade visual (sem interação)
- Adicionar um botão de seta clicável em cima do gradiente (com `pointer-events-auto`)
- Ao clicar na seta, fazer scroll para a direita

### Mudanças em `src/components/canva/CategoryNav.tsx`
```text
Linhas 119-128:
- Separar o gradiente (visual) do botão da seta (interativo)
- Adicionar um <button> com onClick={() => scroll('right')}
- Manter animação de pulse na seta
- Exibir em mobile E desktop (remover hidden md:flex)
```

---

## Problema 2: Menu Principal Incompleto

### Situação Atual
O Header tem apenas 3 links: Início, Calendário, Planos

### Solução
Adicionar TODAS as opções do app no menu:

| Opção | Ícone | Destino |
|-------|-------|---------|
| Início | Home | `/` |
| Vídeos | Video | Categoria `videos` |
| Artes | Image | Categoria `feed` |
| Stories | LayoutGrid | Categoria `stories` |
| Legendas | FileText | Categoria `captions` |
| Downloads | Download | Categoria `downloads` |
| IA Tools | Bot | Categoria `tools` |
| Videoaula | GraduationCap | Categoria `videoaula` |
| Favoritos | Heart | Categoria `favorites` |
| Calendário | Calendar | `/calendar` |
| Planos | CreditCard | `/planos` |

### Layout Desktop
Menu horizontal com os principais links + dropdown "Mais" para categorias de conteúdo

### Layout Mobile
Ícone de hambúrguer (Menu) que abre Sheet com todas as opções listadas verticalmente

---

## Arquivos a Modificar

### 1. `src/components/canva/CategoryNav.tsx`

**Linha 119-128 - Tornar seta clicável:**
```tsx
{/* Right fade gradient - visual only */}
<div 
  className={cn(
    "absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-background via-background/80 to-transparent z-10 pointer-events-none transition-opacity duration-200",
    canScrollRight ? "opacity-100" : "opacity-0"
  )}
/>

{/* Clickable scroll button - appears on top of gradient */}
<button
  onClick={() => scroll('right')}
  className={cn(
    "absolute right-0 top-1/2 -translate-y-1/2 z-20 w-10 h-10 flex items-center justify-center transition-opacity duration-200",
    canScrollRight ? "opacity-100" : "opacity-0 pointer-events-none"
  )}
  aria-label="Scroll para direita"
>
  <ChevronRight className="w-5 h-5 text-muted-foreground animate-pulse" />
</button>
```

### 2. `src/components/Header.tsx`

**Adicionar navegação completa:**

**Desktop:**
- Links principais: Início, Calendário, Planos
- Dropdown "Conteúdos" com subcategorias (Vídeos, Artes, Stories, etc.)
- Usar DropdownMenu do shadcn/ui

**Mobile:**
- Manter ícone hambúrguer
- Listar TODAS as opções no Sheet
- Dividir em seções: "Navegação" e "Conteúdos"

**Nova estrutura de navItems:**
```tsx
const mainNavItems = [
  { to: "/", label: "Início", icon: Home },
  { to: "/calendar", label: "Calendário", icon: Calendar },
  { to: "/planos", label: "Planos", icon: CreditCard },
];

const contentCategories = [
  { category: "videos", label: "Vídeos", icon: Video },
  { category: "feed", label: "Artes", icon: Image },
  { category: "stories", label: "Stories", icon: LayoutGrid },
  { category: "captions", label: "Legendas", icon: FileText },
  { category: "downloads", label: "Downloads", icon: Download },
  { category: "tools", label: "IA Tools", icon: Bot },
  { category: "videoaula", label: "Videoaula", icon: GraduationCap },
  { category: "favorites", label: "Favoritos", icon: Heart },
];
```

**Comportamento:**
- Ao clicar em uma categoria de conteúdo, navegar para `/` e definir `activeCategory`
- Usar React Context ou URL params para passar a categoria selecionada

---

## Fluxo Visual

```text
┌─────────────────────────────────────────────────────────────┐
│ DESKTOP HEADER                                              │
│ [🎬 Canva Viagens]   Início  Calendário  Planos  ▾Conteúdos │
│                                                      │      │
│                                          ┌───────────┴───┐  │
│                                          │ Vídeos        │  │
│                                          │ Artes         │  │
│                                          │ Stories       │  │
│                                          │ Legendas      │  │
│                                          │ Downloads     │  │
│                                          │ IA Tools      │  │
│                                          │ Videoaula     │  │
│                                          │ Favoritos     │  │
│                                          └───────────────┘  │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ MOBILE HEADER                                               │
│ [🎬]                                                   [☰]  │
└─────────────────────────────────────────────────────────────┘
             Clique no ☰ abre Sheet com todas opções
```

---

## Resultado Esperado

1. **Seta no CategoryNav**: Clicável em mobile e desktop - faz scroll suave para a direita
2. **Menu Desktop**: Links principais + dropdown "Conteúdos" com subcategorias
3. **Menu Mobile**: Hambúrguer com lista completa de todas as opções do app
4. **UX consistente**: Qualquer menu leva o usuário ao conteúdo desejado
