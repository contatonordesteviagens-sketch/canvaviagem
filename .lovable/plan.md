
# Plano: Corrigir Navegação do Header nas Páginas ES

## Problema Identificado

O `Header.tsx` usa links fixos que **sempre apontam para as rotas PT**, independente de qual versão da página o usuário está:

```typescript
// Linha 104-108 do Header.tsx
const mainNavItems = [
  { to: "/", label: t('header.home'), icon: Home },        // ❌ Sempre PT
  { to: "/calendar", label: t('header.calendar'), icon: Calendar },  // ❌ Sempre PT
  { to: "/planos", label: t('header.plans'), icon: CreditCard },    // ❌ Sempre PT
];
```

**Resultado**: Na página `/es/planos`, clicar em "Inicio" leva para `/` (PT) em vez de `/es` (ES).

---

## Solução

Modificar o `Header.tsx` para:
1. Detectar se está nas rotas ES (`location.pathname.startsWith('/es')`)
2. Gerar links dinâmicos baseados no idioma da rota atual
3. Fazer o logo também navegar para a home correta do idioma

---

## Mudanças Necessárias

### Arquivo: `src/components/Header.tsx`

**1. Detectar se está na versão ES:**
```typescript
const isESRoute = location.pathname.startsWith('/es');
```

**2. Gerar links dinâmicos baseados na rota:**
```typescript
const mainNavItems = [
  { to: isESRoute ? "/es" : "/", label: t('header.home'), icon: Home },
  { to: isESRoute ? "/es/calendar" : "/calendar", label: t('header.calendar'), icon: Calendar },
  { to: isESRoute ? "/es/planos" : "/planos", label: t('header.plans'), icon: CreditCard },
];
```

**3. Atualizar o link do logo:**
```typescript
<Link to={isESRoute ? "/es" : "/"} className="flex items-center gap-2 ...">
```

**4. Atualizar handleCategoryClick para navegar para a home correta:**
```typescript
const handleCategoryClick = (category: CategoryType) => {
  const homeRoute = isESRoute ? "/es" : "/";
  if (!location.pathname.endsWith('/es') && location.pathname !== "/") {
    navigate(homeRoute, { state: { category } });
  }
  onCategoryChange?.(category);
  setIsOpen(false);
};
```

---

## Resumo das Mudanças

| Arquivo | Mudança |
|---------|---------|
| `src/components/Header.tsx` | Detectar rota ES e gerar links dinâmicos (`/es`, `/es/calendar`, `/es/planos`) |

---

## Fluxo Corrigido

```text
Usuário em /es/planos:
  ↓
Clica em "Inicio" no Header
  ↓
isESRoute = true (pois pathname começa com /es)
  ↓
Link aponta para "/es" (não mais "/")
  ↓
Usuário vai para home em Espanhol ✅
```

---

## Testes Esperados

| Teste | Esperado |
|-------|----------|
| Em `/es` clicar em "Planes" | Navega para `/es/planos` |
| Em `/es` clicar em "Calendario" | Navega para `/es/calendar` |
| Em `/es/planos` clicar em "Inicio" | Navega para `/es` |
| Em `/` clicar em "Planos" | Navega para `/planos` (comportamento PT mantido) |
| Em `/es` clicar no logo | Navega para `/es` |
| Em `/` clicar no logo | Navega para `/` |
