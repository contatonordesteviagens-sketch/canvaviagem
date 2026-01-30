

# Plano: URLs Permanentes por Idioma (Sem Redirect)

## Situação Atual

| Componente | Comportamento Atual | Problema |
|------------|---------------------|----------|
| `LanguageRedirect.tsx` | `/es/planos` → redireciona para `/planos` | Remove o prefixo `/es` da URL |
| `LanguageSwitcher.tsx` | Apenas chama `setLanguage()` | Não navega para URLs diferentes |
| Rotas ES | Não existem (`IndexES.tsx`, etc.) | Todas as rotas vão para mesma página |
| URLs finais | Sempre sem prefixo (`/planos`) | Não funciona para anúncios segmentados |

## Solução

Manter URLs permanentes com prefixo de idioma, renderizando as mesmas páginas mas passando o idioma via contexto de rota.

### Abordagem Escolhida

Em vez de duplicar páginas (o que aumenta manutenção), vamos:
1. Criar um **wrapper** que detecta o idioma da URL e define no contexto
2. Renderizar as mesmas páginas existentes (Index, Planos, Calendar)
3. Os hooks já usam `useLanguage()` e filtram conteúdo corretamente

---

## Implementação

### Fase 1: Modificar LanguageRedirect para Não Redirecionar

**Arquivo: `src/components/LanguageRedirect.tsx`**

Transformar em um **wrapper transparente** que:
- Define o idioma baseado na URL (`/es/*` → ES, `/pt/*` → PT)
- Renderiza a página apropriada SEM redirecionar
- Mantém a URL original

```typescript
import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useLanguage, type Language } from '@/contexts/LanguageContext';

// Importar páginas
import Index from '@/pages/Index';
import Planos from '@/pages/Planos';
import Calendar from '@/pages/Calendar';
import Auth from '@/pages/Auth';
import PosPagamento from '@/pages/PosPagamento';
import Obrigado from '@/pages/Obrigado';
import Sucesso from '@/pages/Sucesso';

const LanguageWrapper = () => {
  const { lang, '*': restPath } = useParams();
  const { setLanguage } = useLanguage();

  // Definir idioma baseado na URL
  useEffect(() => {
    if (lang === 'es' || lang === 'pt') {
      setLanguage(lang as Language);
    }
  }, [lang, setLanguage]);

  // Renderizar página baseada no path
  const path = restPath || '';
  
  switch (path) {
    case 'planos':
      return <Planos />;
    case 'calendar':
      return <Calendar />;
    case 'auth':
      return <Auth />;
    case 'pos-pagamento':
      return <PosPagamento />;
    case 'obrigado':
      return <Obrigado />;
    case 'sucesso':
      return <Sucesso />;
    default:
      return <Index />;
  }
};

export default LanguageWrapper;
```

### Fase 2: Atualizar Rotas no App.tsx

**Arquivo: `src/App.tsx`**

Manter as rotas `/es/*` e `/pt/*` mas usando o wrapper:

```typescript
// Renomear import
import LanguageWrapper from "./components/LanguageRedirect";

// Rotas com wrapper
<Route path="/es/*" element={<LanguageWrapper />} />
<Route path="/pt/*" element={<LanguageWrapper />} />
<Route path="/es" element={<LanguageWrapper />} />
<Route path="/pt" element={<LanguageWrapper />} />
```

### Fase 3: Atualizar LanguageSwitcher para Navegar

**Arquivo: `src/components/LanguageSwitcher.tsx`**

Modificar para navegar entre URLs ao invés de apenas mudar estado:

```typescript
import { useNavigate, useLocation } from 'react-router-dom';

export const LanguageSwitcher = ({ variant = "desktop" }) => {
  const { language, t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();

  // Detectar se já está em rota ES
  const isESRoute = location.pathname.startsWith('/es');
  const isPTRoute = location.pathname.startsWith('/pt');
  
  const switchToLanguage = (targetLang: 'pt' | 'es') => {
    const currentPath = location.pathname;
    const searchParams = location.search;
    
    // Remover prefixo atual se existir
    let basePath = currentPath
      .replace(/^\/es/, '')
      .replace(/^\/pt/, '') || '/';
    
    // Construir nova URL
    let newPath: string;
    if (targetLang === 'es') {
      // ES sempre usa prefixo /es
      newPath = basePath === '/' ? '/es' : `/es${basePath}`;
    } else {
      // PT pode usar sem prefixo (padrão) ou /pt
      newPath = basePath;
    }
    
    navigate(newPath + searchParams);
  };

  // Versão Mobile
  if (variant === "mobile") {
    return (
      <div className="flex items-center gap-2 px-3 py-2">
        <Globe className="h-5 w-5 text-muted-foreground" />
        <span className="text-sm font-medium">{t('header.changeLanguage')}</span>
        <div className="flex gap-2 ml-auto">
          <Button
            variant={language === 'pt' ? 'default' : 'outline'}
            size="sm"
            onClick={() => switchToLanguage('pt')}
            className="h-8 px-3"
          >
            🇧🇷 PT
          </Button>
          <Button
            variant={language === 'es' ? 'default' : 'outline'}
            size="sm"
            onClick={() => switchToLanguage('es')}
            className="h-8 px-3"
          >
            🇪🇸 ES
          </Button>
        </div>
      </div>
    );
  }

  // Versão Desktop
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2">
          {language === 'pt' ? '🇧🇷' : '🇪🇸'}
          <span className="hidden sm:inline">{language.toUpperCase()}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem 
          onClick={() => switchToLanguage('pt')}
          className={language === 'pt' ? 'bg-accent' : ''}
        >
          🇧🇷 Português
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => switchToLanguage('es')}
          className={language === 'es' ? 'bg-accent' : ''}
        >
          🇪🇸 Español
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
```

### Fase 4: Atualizar Links no Header

**Arquivo: `src/components/Header.tsx`**

Os links internos precisam manter o prefixo de idioma:

```typescript
// Hook para gerar links com prefixo de idioma
const getLocalizedPath = (path: string) => {
  const isESRoute = location.pathname.startsWith('/es');
  if (isESRoute && !path.startsWith('/es')) {
    return `/es${path === '/' ? '' : path}`;
  }
  return path;
};

// Usar nos links
const mainNavItems = [
  { to: getLocalizedPath("/"), label: t('header.home'), icon: Home },
  { to: getLocalizedPath("/calendar"), label: t('header.calendar'), icon: Calendar },
  { to: getLocalizedPath("/planos"), label: t('header.plans'), icon: CreditCard },
];
```

---

## Fluxo Corrigido

```text
Anúncio Brasil: canvaviagem.com/planos
    ↓
Rota /planos renderiza <Planos />
    ↓
useLanguage() retorna 'pt' (localStorage)
    ↓
URL permanece: canvaviagem.com/planos ✅
    ↓
Preço: R$ 37,90

Anúncio México: canvaviagem.com/es/planos
    ↓
Rota /es/* captura, LanguageWrapper renderiza
    ↓
useEffect define language = 'es'
    ↓
Renderiza <Planos /> diretamente (SEM redirect)
    ↓
URL permanece: canvaviagem.com/es/planos ✅
    ↓
Preço: $9,09 USD
```

---

## Resumo das Mudanças

| Arquivo | Ação | Mudança |
|---------|------|---------|
| `src/components/LanguageRedirect.tsx` | **REESCREVER** | Wrapper que define idioma e renderiza página (sem redirect) |
| `src/components/LanguageSwitcher.tsx` | **MODIFICAR** | Usar `navigate()` para trocar entre `/` e `/es` |
| `src/components/Header.tsx` | **MODIFICAR** | Links internos mantêm prefixo `/es` quando necessário |
| `src/App.tsx` | **MANTER** | Rotas já estão corretas |

---

## URLs para Anúncios (Após Implementação)

| Público | URL | Preço |
|---------|-----|-------|
| Brasil/Portugal | `canvaviagem.com/` | R$ 37,90 |
| Brasil/Portugal | `canvaviagem.com/planos` | R$ 37,90 |
| LATAM/Espanha | `canvaviagem.com/es` | $9,09 USD |
| LATAM/Espanha | `canvaviagem.com/es/planos` | $9,09 USD |

---

## Testes a Realizar

1. **URLs Permanecem Diferentes**
   - Acessar `/es` → URL permanece `/es`
   - Acessar `/es/planos` → URL permanece `/es/planos`

2. **LanguageSwitcher Navega Corretamente**
   - Em `/` → Clicar ES → Navega para `/es`
   - Em `/planos` → Clicar ES → Navega para `/es/planos`
   - Em `/es/calendar` → Clicar PT → Navega para `/calendar`

3. **Conteúdo Correto por Idioma**
   - `/` mostra conteúdo PT
   - `/es` mostra conteúdo ES

4. **UTMs Preservados**
   - Acessar `/es?utm_source=facebook`
   - Trocar para PT → `/`?utm_source=facebook`

