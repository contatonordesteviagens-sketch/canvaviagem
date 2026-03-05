

## Plan: Add Pixel 916689227676142 + Conversions API Token

### 1. Store the API token as a secret
Use `add_secret` to store `META_CONVERSIONS_API_TOKEN_NEW` with the provided token value. This will be used by the edge function for server-side event tracking.

### 2. Update `index.html`
Add `fbq('init', '916689227676142')` to the existing pixel initialization block (around line 45) and add the corresponding `<noscript>` fallback in the body.

### 3. Update `supabase/functions/meta-conversions-api/index.ts`
Add `'916689227676142'` to the `PIXEL_IDS` array. This pixel will use its own token (`META_CONVERSIONS_API_TOKEN_NEW`) — or, since the provided token may work for all pixels under the same Business Manager, we can send to this pixel using the new token separately.

**Simplest approach**: Add the new pixel ID to the existing `PIXEL_IDS` array. If the new token is for a different Business Manager account, we'll need to send it separately with its own token. I'll check the current function logic and handle both cases — firing the existing 4 pixels with `META_CONVERSIONS_API_TOKEN` and the new pixel with `META_CONVERSIONS_API_TOKEN_NEW`.

### Files changed
- `index.html` — add init + noscript
- `supabase/functions/meta-conversions-api/index.ts` — add new pixel with its own token

