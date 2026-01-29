
# Implementation Plan: Spanish Language Support with Priority Ordering

## Overview

This plan implements a comprehensive internationalization (i18n) system for Canva Viagem, adding Spanish (`es`) language support alongside Portuguese (`pt`). The key strategy is **priority ordering, not filtering** - all content remains visible regardless of language selection, but content matching the selected language appears first.

---

## Core Strategy Summary

| User Action | UI Effect | Content Effect |
|------------|-----------|----------------|
| Select 🇧🇷 PT | All labels in Portuguese | PT content first, then ES, then EN, then null |
| Select 🇪🇸 ES | All labels in Spanish | ES content first, then PT, then EN, then null |

**Result**: ALL 275+ items always visible, just reordered by language priority.

---

## Current State Analysis

### Database Schema Status

| Table | `language` Column | Action Needed |
|-------|-------------------|---------------|
| `content_items` | ✅ Exists | None |
| `captions` | ❌ Missing | Add column |
| `marketing_tools` | ❌ Missing | Add column |

### Files to Create (4 new files)

| File | Purpose |
|------|---------|
| `src/contexts/LanguageContext.tsx` | Language state + localStorage + translation helper |
| `src/lib/translations.ts` | Complete PT/ES translation dictionary |
| Migration SQL | Add `language` column to missing tables |

### Files to Modify (9 files)

| File | Changes |
|------|---------|
| `src/App.tsx` | Wrap with LanguageProvider |
| `src/hooks/useContent.ts` | Add language-aware ordering |
| `src/components/Header.tsx` | Add language switcher + translate labels |
| `src/pages/Index.tsx` | Translate section headers, buttons, filters |
| `src/pages/Planos.tsx` | Translate pricing, benefits, FAQs |
| `src/pages/Auth.tsx` | Translate form labels, messages |
| `src/components/canva/HeroBanner.tsx` | Accept translated props |
| `src/components/canva/CategoryNav.tsx` | Accept translated labels |
| `src/components/canva/BottomNav.tsx` | Translate nav labels |

---

## Phase 1: Database Migration

Add `language` column to `captions` and `marketing_tools` tables:

```text
┌─────────────────────────────────────────────────────────────────┐
│  ALTER TABLE captions                                           │
│    ADD COLUMN language TEXT DEFAULT 'pt';                       │
│                                                                 │
│  ALTER TABLE marketing_tools                                    │
│    ADD COLUMN language TEXT DEFAULT 'pt';                       │
│                                                                 │
│  -- Update existing rows to 'pt'                               │
│  UPDATE captions SET language = 'pt' WHERE language IS NULL;    │
│  UPDATE marketing_tools SET language = 'pt'                     │
│    WHERE language IS NULL;                                      │
│                                                                 │
│  -- Index for performance                                       │
│  CREATE INDEX idx_captions_language ON captions(language);      │
│  CREATE INDEX idx_marketing_tools_language                      │
│    ON marketing_tools(language);                                │
└─────────────────────────────────────────────────────────────────┘
```

---

## Phase 2: Language Infrastructure

### New File: `src/contexts/LanguageContext.tsx`

**Features:**
- Type-safe `Language` type: `'pt' | 'es'`
- localStorage persistence (default: `'pt'`)
- `setLanguage(lang)` updates state + saves to localStorage
- `t(key)` translation helper with fallback chain: ES → PT → key

**Implementation Logic:**
```text
┌─────────────────────────────────────────────────────────────────┐
│  On Mount:                                                      │
│    const stored = localStorage.getItem('language');             │
│    return stored === 'es' ? 'es' : 'pt'; // Validated fallback  │
│                                                                 │
│  On Language Change:                                            │
│    setLanguage(newLang);                                        │
│    localStorage.setItem('language', newLang);                   │
│                                                                 │
│  Translation Fallback:                                          │
│    t('key') → ES[key] || PT[key] || key                        │
└─────────────────────────────────────────────────────────────────┘
```

### New File: `src/lib/translations.ts`

Complete dictionary with 100+ keys organized by section:

| Section | Example Keys | Count |
|---------|-------------|-------|
| Header | `header.home`, `header.login`, `header.logout` | ~12 |
| Hero | `hero.title`, `hero.subtitle`, `hero.searchPlaceholder` | ~5 |
| Categories | `category.videos`, `category.feed`, `category.stories` | ~8 |
| Sections | `section.videos.title`, `section.captions.subtitle` | ~20 |
| Filters | `filter.all`, `filter.national`, `filter.international` | ~5 |
| Buttons | `button.showMore`, `button.copy`, `button.copied` | ~10 |
| Auth | `auth.title`, `auth.sendLink`, `auth.checkEmail` | ~15 |
| Plans | `plans.title`, `plans.price`, `plans.benefits.*` | ~25 |
| Empty States | `favorites.empty.title`, `content.loading` | ~10 |

---

## Phase 3: Data Fetching with Priority Ordering

### Modify: `src/hooks/useContent.ts`

**Pattern for ALL hooks** (client-side ordering):

```text
┌─────────────────────────────────────────────────────────────────┐
│  const { language } = useLanguage();                            │
│                                                                 │
│  queryKey: ["content-items", type, featuredOnly, language]      │
│                                                                 │
│  // After fetching, sort by language priority:                  │
│  const ordered = data.sort((a, b) => {                         │
│    const aMatch = a.language === language;                     │
│    const bMatch = b.language === language;                     │
│    if (aMatch && !bMatch) return -1;                           │
│    if (!aMatch && bMatch) return 1;                            │
│    // Tie-breaker: created_at DESC                             │
│    return new Date(b.created_at) - new Date(a.created_at);     │
│  });                                                            │
└─────────────────────────────────────────────────────────────────┘
```

**Hooks to update:**
- `useContentItems`
- `useFeaturedItems`
- `useHighlightedItems`
- `useVideoTemplates`
- `useNewestItemIds`
- `useCaptions`
- `useMarketingTools`

**TypeScript interface updates:**
- Add `language?: string | null` to `Caption` interface
- Add `language?: string | null` to `MarketingTool` interface

---

## Phase 4: App Structure

### Modify: `src/App.tsx`

**No route duplication needed** - language is state-based, not URL-based.

```text
┌─────────────────────────────────────────────────────────────────┐
│  <QueryClientProvider client={queryClient}>                     │
│    <ThemeProvider>                                              │
│      <TooltipProvider>                                          │
│        <AuthProvider>                                           │
│          <LanguageProvider> ← ADD THIS                          │
│            <Toaster />                                          │
│            <BrowserRouter>                                      │
│              <Routes>                                           │
│                {/* Routes stay EXACTLY the same */}             │
│              </Routes>                                          │
│            </BrowserRouter>                                     │
│          </LanguageProvider>                                    │
│        </AuthProvider>                                          │
│      </TooltipProvider>                                         │
│    </ThemeProvider>                                             │
│  </QueryClientProvider>                                         │
└─────────────────────────────────────────────────────────────────┘
```

---

## Phase 5: UI Component Updates

### Modify: `src/components/Header.tsx`

**Changes:**
1. Import `useLanguage` hook
2. Add language switcher button (flag toggle)
3. Translate all navigation labels
4. Translate login/logout text
5. Translate content category dropdown

**Language Switcher Design:**
```text
┌─────────────────────────────────────────────────────────────────┐
│  Desktop (in nav bar):                                          │
│  ┌──────────────┐                                               │
│  │  🇧🇷 PT ▾    │  ← Dropdown or toggle button                  │
│  └──────────────┘                                               │
│                                                                 │
│  Mobile (in Sheet):                                             │
│  ┌────────────────────────────────────┐                         │
│  │  🌐 Idioma                          │                         │
│  │  🇧🇷 Português  |  🇪🇸 Español       │                         │
│  └────────────────────────────────────┘                         │
└─────────────────────────────────────────────────────────────────┘
```

### Modify: `src/pages/Index.tsx`

**Sections to translate:**
- Video section header: "Vídeos Reels Editáveis" → "Videos Reels Editables"
- Feed section: "Arte para Agência de Viagens" → "Arte para Agencia de Viajes"
- Stories section: "Stories Semanais" → "Stories Semanales"
- Captions section: "Legendas Prontas" → "Subtítulos Listos"
- Downloads section: "Downloads de Vídeos" → "Descargas de Videos"
- Tools section: "Ferramentas de Marketing" → "Herramientas de Marketing"
- Favorites empty state
- Filter chips: "Todos", "Nacionais", "Internacionais"
- Buttons: "Ver mais", "Mostrar menos"

### Modify: `src/pages/Planos.tsx`

**Sections to translate:**
- Page title and hero text
- Benefits list (10 items)
- FAQ questions and answers
- CTA buttons
- Subscription status messages
- Price display (keep R$ currency)

### Modify: `src/pages/Auth.tsx`

**Elements to translate:**
- Page title and subtitle
- Email field label and placeholder
- Send magic link button
- Success message with email confirmation
- Resend link button
- Support text

### Modify: Components accepting translated props

| Component | Changes |
|-----------|---------|
| `HeroBanner.tsx` | Accept `title`, `placeholder` props or use `useLanguage` |
| `CategoryNav.tsx` | Accept translated labels via prop or translate internally |
| `BottomNav.tsx` | Translate nav labels using `useLanguage` |
| `SectionHeader.tsx` | Already accepts props, no change needed |

---

## Phase 6: Edge Cases & Error Handling

### 1. localStorage Unavailable (Safari Private Mode)
```text
try {
  localStorage.setItem('language', newLang);
} catch {
  // Fallback: language state still works, just won't persist
  console.warn('localStorage unavailable');
}
```

### 2. Missing Translation Key
```text
t('missing.key')
  → Check ES translations
  → Fallback to PT translations  
  → Return key itself (helps debugging)
```

### 3. Database Column Missing (Before Migration)
```text
// In hooks, wrap ordering logic in try-catch
// If language column doesn't exist, return data with default ordering
```

### 4. All Content is One Language
- No visual change - all items shown in default order
- Priority ordering has no effect (all same priority)

---

## Implementation Order

| Step | Task | Dependencies |
|------|------|--------------|
| 1 | Database migration | None |
| 2 | Create `translations.ts` | None |
| 3 | Create `LanguageContext.tsx` | translations.ts |
| 4 | Modify `App.tsx` | LanguageContext |
| 5 | Update TypeScript interfaces in `useContent.ts` | Migration |
| 6 | Add language ordering to hooks | LanguageContext |
| 7 | Modify `Header.tsx` | LanguageContext |
| 8 | Modify `Index.tsx` | LanguageContext |
| 9 | Modify `Planos.tsx` | LanguageContext |
| 10 | Modify `Auth.tsx` | LanguageContext |
| 11 | Update remaining components | LanguageContext |
| 12 | Test all scenarios | All above |

---

## Verification Checklist

### Phase 1: Language Toggle
- [ ] Click 🇧🇷→🇪🇸: All UI text changes to Spanish
- [ ] Click 🇪🇸→🇧🇷: All UI text changes to Portuguese
- [ ] Refresh page: Language preference persists
- [ ] Check localStorage has correct value

### Phase 2: Content Ordering
- [ ] Select PT: Portuguese content appears first
- [ ] Select ES: Spanish content (15 items) appears first
- [ ] Verify ALL 275 items still visible (not filtered)
- [ ] Verify ordering respects featured flags within language groups

### Phase 3: UI Translation
- [ ] Header navigation translated
- [ ] Section headers translated
- [ ] Buttons translated
- [ ] Filter chips translated
- [ ] Empty states translated
- [ ] Auth page translated
- [ ] Planos page translated (including FAQs)

### Phase 4: Edge Cases
- [ ] Missing translation shows PT fallback
- [ ] localStorage unavailable: Still works (no persistence)
- [ ] Mobile: Language switcher accessible in hamburger menu
- [ ] Mobile: BottomNav labels translated

### Phase 5: Performance
- [ ] Language switch is instant (<100ms)
- [ ] Content reorders smoothly (no flicker)
- [ ] React Query cache properly separated by language key
- [ ] No infinite re-render loops

---

## Estimated Effort

| Task | Complexity | Approx. Lines |
|------|------------|---------------|
| Database migration | Low | ~15 SQL |
| translations.ts | Medium | ~350 |
| LanguageContext.tsx | Medium | ~80 |
| App.tsx | Low | ~5 |
| useContent.ts updates | Medium | ~100 |
| Header.tsx | Medium | ~80 |
| Index.tsx translations | High | ~150 |
| Planos.tsx translations | High | ~120 |
| Auth.tsx translations | Medium | ~60 |
| Other components | Low | ~50 |
| **Total** | | **~1,000 lines** |

---

## Notes for Future Enhancement

1. **SEO**: Since we're NOT using `/es` routes, basic SEO is simpler. Future enhancement could add `<html lang="...">` and `hreflang` meta tags.

2. **Additional Languages**: The architecture supports adding more languages (EN, FR) by extending the `Language` type and `translations` object.

3. **RTL Support**: Not needed for PT/ES, but the pattern is extensible for Arabic/Hebrew in the future.

4. **Admin Pages**: Remain in Portuguese only (internal use). Can be translated later if needed.
