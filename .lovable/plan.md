
# Plano: URLs de Idioma para Todas as Páginas

## URLs para Anúncios

| Página | Português | Espanhol |
|--------|-----------|----------|
| **Home** | `canvaviagem.com/pt` | `canvaviagem.com/es` |
| **Planos** | `canvaviagem.com/pt/planos` | `canvaviagem.com/es/planos` |
| **Calendário** | `canvaviagem.com/pt/calendar` | `canvaviagem.com/es/calendar` |
| **Pós-Pagamento** | `canvaviagem.com/pt/pos-pagamento` | `canvaviagem.com/es/pos-pagamento` |
| **Obrigado** | `canvaviagem.com/pt/obrigado` | `canvaviagem.com/es/obrigado` |

---

## Implementação

### 1. Criar Componente de Redirecionamento

**Arquivo: `src/components/LanguageRedirect.tsx`** (NOVO)

```typescript
import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useLanguage, type Language } from '@/contexts/LanguageContext';

const LanguageRedirect = () => {
  const { lang, '*': restPath } = useParams();
  const { setLanguage } = useLanguage();
  const navigate = useNavigate();

  useEffect(() => {
    if (lang === 'es' || lang === 'pt') {
      // Define o idioma
      setLanguage(lang as Language);
      
      // Redireciona para a página destino (ou home se não houver)
      const targetPath = restPath ? `/${restPath}` : '/';
      navigate(targetPath, { replace: true });
    }
  }, [lang, restPath, setLanguage, navigate]);

  return null;
};

export default LanguageRedirect;
```

### 2. Adicionar Rotas no App.tsx

**Arquivo: `src/App.tsx`**

```typescript
import LanguageRedirect from "./components/LanguageRedirect";

// Adicionar ANTES da rota catch-all "*"
<Route path="/es/*" element={<LanguageRedirect />} />
<Route path="/pt/*" element={<LanguageRedirect />} />
<Route path="/es" element={<LanguageRedirect />} />
<Route path="/pt" element={<LanguageRedirect />} />
```

---

## Exemplos de URLs para Anúncios

### Facebook/Instagram Ads

| Campanha | URL de Destino |
|----------|----------------|
| Brasil - Home | `https://canvaviagem.com/pt` |
| Brasil - Planos | `https://canvaviagem.com/pt/planos` |
| Latam - Home | `https://canvaviagem.com/es` |
| Latam - Planos | `https://canvaviagem.com/es/planos` |

### Com UTMs

```
https://canvaviagem.com/es/planos?utm_source=facebook&utm_campaign=latam
```

---

## Fluxo

```text
Usuário clica: canvaviagem.com/es/planos
    ↓
Rota /es/* captura
    ↓
LanguageRedirect extrai: lang="es", restPath="planos"
    ↓
Define idioma = Espanhol
    ↓
Salva no localStorage
    ↓
Redireciona → canvaviagem.com/planos
    ↓
Usuário vê página de Planos em Espanhol ✅
```

---

## Resumo das Mudanças

| Arquivo | Ação | Mudança |
|---------|------|---------|
| `src/components/LanguageRedirect.tsx` | CRIAR | Componente que lê idioma e página da URL, define idioma e redireciona |
| `src/App.tsx` | MODIFICAR | Adicionar rotas `/es/*`, `/pt/*`, `/es`, `/pt` |

---

## Todas as URLs Disponíveis

| Rota Original | URL PT | URL ES |
|---------------|--------|--------|
| `/` | `/pt` | `/es` |
| `/planos` | `/pt/planos` | `/es/planos` |
| `/calendar` | `/pt/calendar` | `/es/calendar` |
| `/pos-pagamento` | `/pt/pos-pagamento` | `/es/pos-pagamento` |
| `/obrigado` | `/pt/obrigado` | `/es/obrigado` |
| `/sucesso` | `/pt/sucesso` | `/es/sucesso` |

