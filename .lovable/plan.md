
# Plano: Instalar Pixel Meta ES + Conversions API

## Resumo

Adicionar um **novo Pixel Meta (ID: 1560736461820497)** que será disparado **APENAS** nas páginas em Espanhol e na página pós-pagamento:
- `/es` (IndexES)
- `/es/planos` (PlanosES)
- `/es/calendar` (CalendarES)
- `/pos-pagamento` (PosPagamento)

Também configurar a **Conversions API** com o token fornecido para rastreamento server-side do novo pixel.

---

## Arquivos a Serem Modificados

### 1. Novo Componente: SpanishPixel.tsx
**Caminho:** `src/components/SpanishPixel.tsx`

Criar um componente React que carrega o Pixel ES dinamicamente apenas quando montado. Isso garante que o pixel só seja carregado nas páginas específicas.

```tsx
// Inicializa o pixel ES (1560736461820497) apenas uma vez
// Dispara PageView ao montar
```

---

### 2. IndexES.tsx
**Arquivo:** `src/pages/IndexES.tsx`

Adicionar import e uso do componente `SpanishPixel`:

| Ação | Descrição |
|------|-----------|
| Import | `import { SpanishPixel } from "@/components/SpanishPixel";` |
| Uso | Adicionar `<SpanishPixel />` no início do JSX do componente |

---

### 3. PlanosES.tsx
**Arquivo:** `src/pages/PlanosES.tsx`

| Ação | Descrição |
|------|-----------|
| Import | `import { SpanishPixel } from "@/components/SpanishPixel";` |
| Uso | Adicionar `<SpanishPixel />` no início do JSX do componente |

---

### 4. CalendarES.tsx
**Arquivo:** `src/pages/CalendarES.tsx`

| Ação | Descrição |
|------|-----------|
| Import | `import { SpanishPixel } from "@/components/SpanishPixel";` |
| Uso | Adicionar `<SpanishPixel />` no início do JSX do componente |

---

### 5. PosPagamento.tsx
**Arquivo:** `src/pages/PosPagamento.tsx`

| Ação | Descrição |
|------|-----------|
| Import | `import { SpanishPixel } from "@/components/SpanishPixel";` |
| Uso | Adicionar `<SpanishPixel />` no início do JSX |
| Tracking ES | Adicionar eventos Purchase/Subscribe para o pixel ES quando `source=checkout` |

**Lógica de tracking atualizada:**
- O tracking **PT (R$ 29,00 BRL)** continua como está
- Adicionar tracking **ES ($9,09 USD)** usando função específica para o pixel ES

---

### 6. Novo Helper: meta-pixel-es.ts
**Caminho:** `src/lib/meta-pixel-es.ts`

Criar funções de tracking específicas para o pixel ES:

```typescript
// trackESPurchase(value, currency) - dispara Purchase no pixel ES
// trackESSubscribe(value, currency, predictedLtv) - dispara Subscribe no pixel ES
// Usa fbq('trackSingle', 'PIXEL_ID', ...) para enviar apenas para o pixel ES
```

---

### 7. Nova Edge Function: meta-conversions-api-es
**Caminho:** `supabase/functions/meta-conversions-api-es/index.ts`

Criar uma nova edge function para Conversions API do pixel ES:

| Configuração | Valor |
|--------------|-------|
| Pixel ID | `1560736461820497` |
| Token Secret | `META_CONVERSIONS_API_TOKEN_ES` |

---

### 8. Configurar Secret
**Ação:** Adicionar novo secret `META_CONVERSIONS_API_TOKEN_ES`

```
EAAK6P3nPiCUBQpcGlmuKZBZCblJyfFtYwWj0TVy9CYgiIvmMZCVCwTWyCqrcbxYuGoI3O8mFLATKs5FsBI3ZAUo6AyQWKSMZCyWgHcHJEp6bLcp7OfCprlQQWiZBAmXuxZAaNDueTOIudTPBJuNdSgHGx44O3ClUd4WPEO557qUnlfHetJvZB485ZBYi6qWAj1ZCzNdAZDZD
```

---

## Resumo das Modificações

```text
┌─────────────────────────────────────────────────────────────┐
│                    ARQUIVOS AFETADOS                        │
├─────────────────────────────────────────────────────────────┤
│ NOVOS ARQUIVOS:                                             │
│   • src/components/SpanishPixel.tsx                         │
│   • src/lib/meta-pixel-es.ts                                │
│   • supabase/functions/meta-conversions-api-es/index.ts     │
├─────────────────────────────────────────────────────────────┤
│ ARQUIVOS MODIFICADOS:                                       │
│   • src/pages/IndexES.tsx (adicionar SpanishPixel)          │
│   • src/pages/PlanosES.tsx (adicionar SpanishPixel)         │
│   • src/pages/CalendarES.tsx (adicionar SpanishPixel)       │
│   • src/pages/PosPagamento.tsx (adicionar SpanishPixel +    │
│     tracking ES para conversões)                            │
├─────────────────────────────────────────────────────────────┤
│ SECRETS:                                                    │
│   • META_CONVERSIONS_API_TOKEN_ES (novo)                    │
└─────────────────────────────────────────────────────────────┘
```

---

## Comportamento Esperado

### Páginas ES (`/es`, `/es/planos`, `/es/calendar`):
1. Pixel PT (global do index.html) dispara PageView
2. Pixel ES (1560736461820497) dispara PageView via `SpanishPixel`

### Página Pós-Pagamento (`/pos-pagamento`):
1. Pixel PT dispara PageView
2. Pixel ES dispara PageView via `SpanishPixel`
3. Quando `source=checkout`:
   - PT: Purchase/Subscribe (R$ 29,00 BRL) - **já implementado**
   - ES: Purchase/Subscribe ($9,09 USD) - **novo**

---

## Detalhes Técnicos

### SpanishPixel.tsx
```tsx
import { useEffect } from "react";

const ES_PIXEL_ID = "1560736461820497";

export const SpanishPixel = () => {
  useEffect(() => {
    // Inicializa o pixel ES se não foi inicializado
    if (typeof window !== 'undefined' && window.fbq) {
      // Usa trackSingle para enviar apenas para este pixel
      window.fbq('init', ES_PIXEL_ID);
      window.fbq('trackSingle', ES_PIXEL_ID, 'PageView');
    }
  }, []);

  return (
    <noscript>
      <img 
        height="1" 
        width="1" 
        style={{ display: 'none' }}
        src={`https://www.facebook.com/tr?id=${ES_PIXEL_ID}&ev=PageView&noscript=1`}
        alt=""
      />
    </noscript>
  );
};
```

### meta-pixel-es.ts
```typescript
const ES_PIXEL_ID = "1560736461820497";

export const trackESPurchase = (value: number, currency: string = 'USD') => {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('trackSingle', ES_PIXEL_ID, 'Purchase', {
      value,
      currency,
    });
  }
};

export const trackESSubscribe = (value: number, currency: string = 'USD', predictedLtv?: number) => {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('trackSingle', ES_PIXEL_ID, 'Subscribe', {
      value,
      currency,
      predicted_ltv: predictedLtv || value * 12,
    });
  }
};
```

### PosPagamento.tsx - Lógica de Tracking Atualizada
```typescript
// Track conversion when coming from checkout
useEffect(() => {
  if (!tracked && sourceFromUrl === 'checkout') {
    // PT tracking (R$ 29,00)
    trackPurchase(29.00, 'BRL');
    trackSubscribe(29.00, 'BRL', 29.00 * 12);
    
    // ES tracking ($9,09 USD) - novo pixel
    trackESPurchase(9.09, 'USD');
    trackESSubscribe(9.09, 'USD', 9.09 * 12);
    
    setTracked(true);
  }
}, [tracked, sourceFromUrl]);
```

---

## Próximos Passos Após Implementação

1. Testar acesso às páginas ES e verificar se o pixel dispara no Facebook Events Manager
2. Fazer uma compra teste e verificar se Purchase/Subscribe aparecem para o pixel ES
3. Verificar se a Conversions API está enviando eventos corretamente
