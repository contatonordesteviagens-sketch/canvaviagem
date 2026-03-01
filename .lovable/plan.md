

## Plan: Massive Content Library Expansion + Mobile-Optimized Tabs

### Summary
Populate the content library with all uploaded material (50 offers, 50 rankings, scripts/conditions, CTAs/frases), reorganize the tabs for mobile readability, and make all text cards editable with save-to-favorites functionality. Only 3 offers are free; everything else is premium.

### 1. Expand `src/data/content-library.ts` with full content

Replace the current 7-item library with the complete dataset:

- **Ofertas (50 items)**: 25 nacionais + 25 internacionais from the uploaded docs. Each offer has a short version (for card preview) and full version (for edit modal). Only the first 3 (Rio, Gramado, Maceio) are `isPremium: false`.
- **Rankings (50 items)**: 25 nacionais + 25 internacionais from PARTE1. Each item shows position, destination, profile, and highlight. All premium.
- **Scripts (15+ items)**: Payment conditions, footer templates, package descriptions (Basic, All Inclusive, Complete, Cruise, Wellness), documentation guides from PARTE4. All premium.
- **Frases/CTAs (50+ items)**: Categorized by theme (Nordeste, Internacional, Familia, Casal, Urgencia, Ecoturismo, Corporativo, Intercambio, Legendas, Hashtags) from PARTE5. All premium.

Add new interface fields:
```ts
export interface ContentLibraryItem {
    id: string;
    category: 'offer' | 'ranking' | 'script' | 'cta';
    title: string;
    text: string;       // short version / preview
    fullText?: string;  // full version for edit modal
    isPremium: boolean;
    tags: string[];
    icon?: string;      // emoji icon per category
}
```

### 2. Update `OfferCard.tsx` to be expandable + editable

- Add collapsed preview (3-line clamp by default, like CaptionCard)
- Click to expand shows full text (blocked for premium users without subscription)
- Add "Editar" button that opens a Dialog modal with:
  - Full text in a Textarea (editable)
  - Copy button
  - Save button (saves to favorites)
- Premium items: clicking expand triggers `onPremiumRequired` instead

New props: `fullText?: string`, `onSaveEdit?: (newText: string) => void`

### 3. Reorganize the Offers section tabs for mobile

In `Index.tsx`, update the `case 'offers'` section:
- Rename tabs: "Ofertas" | "Destinos" (rankings) | "Scripts" | "Frases"
- Use scrollable horizontal `TabsList` on mobile instead of 4-column grid
- Add item counts as badges on each tab
- Add sub-filters within Ofertas: "Nacionais" / "Internacionais" chip filters

### 4. Update CategoryNav label

Change the offers category label from "Ofertas" to "Central de Conteúdo" or keep "Ofertas" but ensure the "Novo" badge stays.

### Technical Notes
- The content-library.ts file will be large (~2000+ lines) but it's static data, no DB migration needed
- All content uses the existing `OfferCard` component with the new expandable/editable behavior
- The edit/save flow reuses the existing `useFavorites` hook
- Premium gating logic: first 3 offers free, everything else premium (consistent with user request)

