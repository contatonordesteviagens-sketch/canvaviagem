

## Build Errors & Feature Fixes

### 1. Fix Build Errors

**Error 1: `verify-magic-link` — `filter` not in `PageParams`**
- In `supabase/functions/verify-magic-link/index.ts` line 73, remove the invalid `filter` param from `listUsers`. Instead, call `listUsers()` and then find the user by email in the result, or use a different approach: iterate with `page`/`perPage` and filter manually.
- Simplest fix: `listUsers({ page: 1, perPage: 1000 })` then `.find(u => u.email === email)`.

**Error 2: `Index.tsx:780` — `(ContentItem | Template)[]` not assignable to `ContentItem[]`**
- `allFeedTemplates` mixes `Template[]` (local) with `ContentItem[]` (DB). The `filterTemplates` function expects `ContentItem[]`.
- Fix: Cast `allFeedTemplates` or adapt the `filterTemplates` call for the feed section to handle the mixed type. Best approach: map `localFeedTemplates` to a `ContentItem`-compatible shape or change `filterTemplates` to accept a broader type.

**Error 3: `Index.tsx:788` — `isNew` should be `is_new`**
- Change `template.isNew` to `template.is_new` on line 788 (or use a fallback: `(template as any).isNew || template.is_new`).

**Error 4: `IndexES.tsx:286` — `contentLibraryES.offers` doesn't exist**
- `contentLibraryES` is an array, not an object with `.offers`. Fix: `contentLibraryES.filter(item => item.category === 'offer').slice(0, 2)`.

### 2. Add Back Button (`<`) on Mobile CategoryNav
- In `CategoryNav.tsx`, add a left-arrow back button visible only on mobile (`md:hidden`) that appears when the user has scrolled right in the category icons, allowing them to scroll back to the beginning.

### 3. Update Free Filter to Show 2 Free Arts
- Currently when `gratis` filter is active in "Tudo", only tools and captions are shown (lines 377-428).
- Add the first 2 feed arts (which are free per `checkIfItemIsPremium` — `feed` type with index < 2) to the free filter view, displayed as a "Arte para Agência de Viagens" section with a 2-column grid.

### 4. Planos Page Background — Keep White
- The user mentioned the Planos page background changed color. Ensure it uses `bg-white` / `bg-background` explicitly. (Will verify the actual current state during implementation.)

