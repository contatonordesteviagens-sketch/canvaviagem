
# Plano FINAL: URLs Independentes por Idioma

## Problema Atual
- `/es` e `/pt` usam `LanguageRedirect` que tem problemas de sincronização
- LanguageSwitcher apenas muda estado, **não muda a URL**
- Destaques ES não aparecem corretamente por causa de race conditions

## Solução: Páginas Duplicadas + URLs Diretas

Esta abordagem é **100% garantida** porque cada página força seu próprio idioma sem depender de redirects.

---

## Arquivos a Criar/Modificar

| Arquivo | Ação | Descrição |
|---------|------|-----------|
| `src/pages/IndexES.tsx` | **CRIAR** | Cópia de Index.tsx forçando `language='es'` |
| `src/pages/PlanosES.tsx` | **CRIAR** | Cópia de Planos.tsx com preço USD |
| `src/pages/CalendarES.tsx` | **CRIAR** | Cópia de Calendar.tsx em espanhol |
| `src/hooks/useContent.ts` | **MODIFICAR** | Hooks aceitam `forcedLanguage` opcional |
| `src/components/LanguageSwitcher.tsx` | **MODIFICAR** | Usar `window.location.href` para navegação |
| `src/App.tsx` | **MODIFICAR** | Adicionar rotas diretas `/es`, `/es/planos`, `/es/calendar` |

---

## Parte 1: Modificar Hooks para Aceitar Idioma Forçado

Os hooks `useFeaturedItems`, `useHighlightedItems`, `useContentItems`, `useCaptions` e `useMarketingTools` serão modificados para aceitar um parâmetro `forcedLanguage` opcional.

Exemplo de mudança:
```typescript
export const useFeaturedItems = (forcedLanguage?: string) => {
  const { language: contextLanguage } = useLanguage();
  const language = forcedLanguage || contextLanguage; // Usa forçado se existir
  
  return useQuery({
    queryKey: ["featured-items", language],
    // ... resto da query usa `language`
  });
};
```

---

## Parte 2: Criar IndexES.tsx (Home Espanhol)

Uma cópia de `Index.tsx` que:
1. Força todos os hooks a usar `'es'`
2. Define `document.documentElement.lang = 'es'` no mount
3. Remove filtro "Nacionais" (apenas mostra 'Español', 'Todos', 'Favoritos')

Chamadas dos hooks:
```typescript
const { data: featuredVideos } = useFeaturedItems('es');
const { data: highlightedItems } = useHighlightedItems('es');
const { data: videoTemplates } = useContentItems(['video', 'seasonal'], undefined, 'es');
const { data: captionsData } = useCaptions(undefined, 'es');
// ... etc
```

---

## Parte 3: Criar PlanosES.tsx (Planos Espanhol)

Uma cópia de `Planos.tsx` que:
1. Força `language = 'es'` diretamente
2. Usa o link de checkout USD: `https://buy.stripe.com/bJedRa3TIej6cz15gE8so04`
3. Mostra preço: `$9,09/mes`

---

## Parte 4: Criar CalendarES.tsx (Calendário Espanhol)

Uma cópia de `Calendar.tsx` que:
1. Usa nomes de meses/dias em espanhol
2. Força idioma ES nos textos

---

## Parte 5: Modificar LanguageSwitcher

Usar navegação direta via `window.location.href` (mais confiável que React Router):

```typescript
const switchToLanguage = (targetLang: 'pt' | 'es') => {
  const currentPath = window.location.pathname;
  
  if (targetLang === 'es') {
    // Navegar para versão ES
    if (currentPath.includes('planos')) {
      window.location.href = '/es/planos';
    } else if (currentPath.includes('calendar')) {
      window.location.href = '/es/calendar';
    } else {
      window.location.href = '/es';
    }
  } else {
    // Navegar para versão PT
    if (currentPath.includes('planos')) {
      window.location.href = '/planos';
    } else if (currentPath.includes('calendar')) {
      window.location.href = '/calendar';
    } else {
      window.location.href = '/';
    }
  }
};
```

---

## Parte 6: Atualizar Rotas no App.tsx

Adicionar rotas diretas para as páginas ES:

```typescript
import IndexES from "./pages/IndexES";
import PlanosES from "./pages/PlanosES";
import CalendarES from "./pages/CalendarES";

// Dentro de <Routes>:
{/* ROTAS PORTUGUÊS */}
<Route path="/" element={<Index />} />
<Route path="/planos" element={<Planos />} />
<Route path="/calendar" element={<Calendar />} />

{/* ROTAS ESPANHOL - DIRETAS, SEM REDIRECT */}
<Route path="/es" element={<IndexES />} />
<Route path="/es/planos" element={<PlanosES />} />
<Route path="/es/calendar" element={<CalendarES />} />

{/* Remover rotas LanguageRedirect antigas */}
```

---

## Resultado Final

| URL | Página | Idioma | Conteúdo |
|-----|--------|--------|----------|
| `canvaviagem.com/` | Index.tsx | PT | Destaques PT |
| `canvaviagem.com/planos` | Planos.tsx | PT | R$ 37,90 |
| `canvaviagem.com/calendar` | Calendar.tsx | PT | Calendário PT |
| `canvaviagem.com/es` | IndexES.tsx | ES | Destaques ES |
| `canvaviagem.com/es/planos` | PlanosES.tsx | ES | $9,09 USD |
| `canvaviagem.com/es/calendar` | CalendarES.tsx | ES | Calendário ES |

---

## Por que Esta Abordagem Funciona 100%

1. **Sem race conditions**: Cada página sabe seu idioma na hora do render
2. **Sem dependência de contexto**: Os hooks recebem idioma diretamente
3. **Navegação simples**: `window.location.href` garante page reload completo
4. **Fácil debug**: Cada página é independente
5. **SEO-friendly**: URLs únicas para cada idioma

---

## Testes Esperados

| Teste | Esperado |
|-------|----------|
| Acessar `/es` | Home em espanhol, destaques ES |
| Acessar `/es/planos` | Preço $9,09 USD |
| Clicar "ES" em `/` | Navega para `/es` |
| Clicar "PT" em `/es` | Navega para `/` |
| Gestão > Destaques ES | Aparece em `/es` |
| Gestão > Destaques PT | Aparece em `/` |
