import type { Language } from "@/contexts/LanguageContext";

/**
 * Sort items by language priority. Items matching the selected language appear first.
 * Fallback order: selected language → 'pt' → 'en' → null/undefined
 */
export function sortByLanguagePriority<T extends { 
  language?: string | null; 
  created_at?: string;
  display_order?: number | null;
}>(
  items: T[],
  language: Language
): T[] {
  return [...items].sort((a, b) => {
    const aLang = a.language || 'pt';
    const bLang = b.language || 'pt';
    
    // Priority 1: Exact match with selected language
    const aMatch = aLang === language;
    const bMatch = bLang === language;
    if (aMatch && !bMatch) return -1;
    if (!aMatch && bMatch) return 1;
    
    // Priority 2: Portuguese as secondary preference (if not already selected)
    if (language !== 'pt') {
      const aPt = aLang === 'pt';
      const bPt = bLang === 'pt';
      if (aPt && !bPt) return -1;
      if (!aPt && bPt) return 1;
    }
    
    // Priority 3: display_order (admin-defined order)
    const aOrder = a.display_order ?? 9999;
    const bOrder = b.display_order ?? 9999;
    if (aOrder !== bOrder) return aOrder - bOrder;
    
    // Priority 4: Sort by created_at (most recent first) as fallback
    if (a.created_at && b.created_at) {
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    }
    
    return 0;
  });
}

/**
 * Get the language priority score for sorting
 * Lower score = higher priority
 */
export function getLanguagePriorityScore(itemLang: string | null | undefined, selectedLang: Language): number {
  const lang = itemLang || 'pt';
  if (lang === selectedLang) return 0;
  if (lang === 'pt') return 1;
  if (lang === 'en') return 2;
  return 3;
}
