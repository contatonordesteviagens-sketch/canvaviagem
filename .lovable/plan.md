

# Plano: Instalar Pixel 1560736461820497 com API de Conversão

## Resumo

Vou instalar o novo pixel Meta `1560736461820497` e configurar o token da API de Conversão que você forneceu.

---

## Mudança 1: Adicionar Pixel no index.html

**Arquivo:** `index.html`

**Adicionar na linha 24** (antes do `fbq('track', 'PageView')`):
```javascript
fbq('init', '1560736461820497');
```

**Adicionar após linha 58** (após o último noscript):
```html
<noscript><img height="1" width="1" style="display:none"
src="https://www.facebook.com/tr?id=1560736461820497&ev=PageView&noscript=1"
/></noscript>
```

---

## Mudança 2: Atualizar Edge Function meta-conversions-api

**Arquivo:** `supabase/functions/meta-conversions-api/index.ts`

Adicionar o novo pixel ID na lista de PIXEL_IDS:

```typescript
const PIXEL_IDS = [
  '1599242897762192',
  '1152272353771099',
  '4254631328136179',
  '1560736461820497'  // NOVO PIXEL
];
```

---

## Nota sobre API de Conversão

O projeto já possui um secret `META_CONVERSIONS_API_TOKEN` configurado. Se este novo token for para um pixel diferente e você quiser usá-lo especificamente para o pixel `1560736461820497`, posso:

1. **Usar o token existente** - Se todos os pixels estiverem na mesma conta Business Manager
2. **Adicionar novo secret** - Criar `META_CONVERSIONS_API_TOKEN_NEW` para o novo pixel

Por enquanto, vou adicionar o pixel à lista existente, que usará o token já configurado.

---

## Resultado Final

Após a implementação:

- **5 pixels PT** serão inicializados no `index.html`:
  - `1599242897762192`
  - `1152272353771099`
  - `4254631328136179`
  - `1560736461820497` (NOVO)
  
- Todos receberão eventos `PageView`, `Purchase` e `Subscribe` automaticamente

---

## Arquivos Afetados

| Arquivo | Tipo de Mudança |
|---------|-----------------|
| `index.html` | Adicionar init + noscript |
| `supabase/functions/meta-conversions-api/index.ts` | Adicionar pixel à lista |

