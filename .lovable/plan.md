
# Plano: Corrigir Sistema de URLs de Idioma

## Resumo dos Problemas

| Problema | Componente | Causa |
|----------|------------|-------|
| Switcher não muda URL | `LanguageSwitcher.tsx` | Apenas muda estado, não navega para `/es` |
| `/es` não funciona | `LanguageRedirect.tsx` | Redireciona antes do contexto atualizar |
| Destaques ES não aparecem | Hooks + race condition | Idioma não está definido quando query executa |

---

## Correção 1: LanguageSwitcher com Navegação

**Arquivo: `src/components/LanguageSwitcher.tsx`**

Modificar para usar `navigate()` em vez de apenas `setLanguage()`:

```typescript
import { useNavigate, useLocation } from 'react-router-dom';

export const LanguageSwitcher = ({ variant = "desktop" }: LanguageSwitcherProps) => {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();

  const switchToLanguage = (targetLang: 'pt' | 'es') => {
    const currentPath = location.pathname;
    const searchParams = location.search;
    
    // Gerar URL com prefixo de idioma
    const targetPath = currentPath === '/' 
      ? `/${targetLang}${searchParams}`
      : `/${targetLang}${currentPath}${searchParams}`;
    
    navigate(targetPath);
  };

  // Desktop dropdown
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

---

## Correção 2: LanguageRedirect com Sincronização

**Arquivo: `src/components/LanguageRedirect.tsx`**

Separar em dois `useEffect` para garantir que o contexto atualize antes do redirect:

```typescript
import { useEffect, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useLanguage, type Language } from '@/contexts/LanguageContext';

const LanguageRedirect = () => {
  const { lang, '*': restPath } = useParams();
  const { language, setLanguage } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const [hasSetLanguage, setHasSetLanguage] = useState(false);

  // Passo 1: Definir o idioma
  useEffect(() => {
    if ((lang === 'es' || lang === 'pt') && !hasSetLanguage) {
      console.log(`🌍 Setting language to: ${lang}`);
      setLanguage(lang as Language);
      setHasSetLanguage(true);
    }
  }, [lang, setLanguage, hasSetLanguage]);

  // Passo 2: Redirecionar DEPOIS que o contexto foi atualizado
  useEffect(() => {
    if (hasSetLanguage && language === lang) {
      const searchParams = location.search; // Preservar UTMs
      const targetPath = restPath 
        ? `/${restPath}${searchParams}` 
        : `/${searchParams}`;
      
      console.log(`🔀 Redirecting to: ${targetPath} (language: ${language})`);
      navigate(targetPath, { replace: true });
    }
  }, [hasSetLanguage, language, lang, restPath, navigate, location.search]);

  return null;
};

export default LanguageRedirect;
```

---

## Fluxo Corrigido

### Cenário 1: Acesso Direto via `/es`

```text
Usuário acessa: canvaviagem.com/es
    ↓
Rota /es → LanguageRedirect renderiza
    ↓
useEffect 1: setLanguage('es'), setHasSetLanguage(true)
    ↓
React re-renderiza, LanguageContext atualiza: language = 'es'
    ↓
useEffect 2: hasSetLanguage=true && language='es' === lang
    ↓
navigate('/', { replace: true })
    ↓
Index.tsx renderiza com useLanguage() retornando 'es'
    ↓
useFeaturedItems() busca: WHERE language = 'es'
    ↓
Destaques ES aparecem ✅
```

### Cenário 2: Clique no LanguageSwitcher

```text
Usuário está em: canvaviagem.com/ (PT)
    ↓
Clica em "🇪🇸 ES" no header
    ↓
switchToLanguage('es') executa
    ↓
navigate('/es') é chamado
    ↓
LanguageRedirect processa (mesmo fluxo do cenário 1)
    ↓
URL final: canvaviagem.com/ com idioma ES ✅
```

---

## Resumo das Mudanças

| Arquivo | Ação | Mudança |
|---------|------|---------|
| `src/components/LanguageSwitcher.tsx` | **MODIFICAR** | Adicionar `navigate()` para `/es` ou `/pt` |
| `src/components/LanguageRedirect.tsx` | **MODIFICAR** | Separar em 2 `useEffect` para evitar race condition |

---

## Testes Após Implementação

### Teste 1: URL `/es` funciona
- Acessar `canvaviagem.com/es`
- Verificar que a página abre em Espanhol
- Verificar console: `🌍 Setting language to: es`

### Teste 2: LanguageSwitcher navega
- Estar em `/`
- Clicar em "🇪🇸 ES"
- URL deve mudar para `/es` (temporariamente)
- Depois redireciona para `/` com idioma ES

### Teste 3: Destaques ES aparecem
- Configurar destaque em Gestão > Destaques ES
- Acessar `/es`
- Verificar que o destaque ES aparece
- Verificar que destaques PT NÃO aparecem

### Teste 4: UTMs preservados
- Acessar `canvaviagem.com/es?utm_source=facebook`
- Após redirect: `canvaviagem.com/?utm_source=facebook`
- Idioma deve ser ES
