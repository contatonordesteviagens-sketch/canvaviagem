import { ContentItem } from "@/hooks/useContent";

/**
 * Obtém as datas únicas de criação mais recentes dos itens
 * @param items Lista de itens com created_at
 * @param count Número de datas únicas a retornar (padrão: 3)
 */
export const getRecentUpdateDates = (items: { created_at: string }[], count = 3): Date[] => {
  // Extrair datas únicas de criação (apenas a parte da data, sem hora)
  const uniqueDates = [...new Set(
    items.map(item => new Date(item.created_at).toDateString())
  )].sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
  
  // Retornar as N datas mais recentes
  return uniqueDates.slice(0, count).map(d => new Date(d));
};

/**
 * Verifica se um item foi criado em uma das datas de atualização recentes
 * @param item Item com created_at
 * @param recentDates Lista de datas recentes
 */
export const isItemFromRecentUpdate = (item: { created_at: string }, recentDates: Date[]): boolean => {
  const itemDate = new Date(item.created_at).toDateString();
  return recentDates.some(d => d.toDateString() === itemDate);
};

/**
 * Aplica lógica de "is_new" dinâmica baseada nas últimas 3 atualizações
 * Os itens são marcados como novos se foram criados nas últimas 3 datas de criação únicas
 */
export const applyDynamicIsNew = <T extends { created_at: string; is_new?: boolean }>(
  items: T[]
): (T & { isRecentlyAdded: boolean })[] => {
  if (!items || items.length === 0) return [];
  
  const recentDates = getRecentUpdateDates(items, 3);
  
  return items.map(item => ({
    ...item,
    isRecentlyAdded: isItemFromRecentUpdate(item, recentDates),
  }));
};

/**
 * Ordena itens por data de criação (mais recentes primeiro)
 * Featured items sempre ficam no topo
 */
export const sortByRecent = <T extends { created_at: string; is_featured?: boolean }>(
  items: T[],
  featuredFirst = true
): T[] => {
  return [...items].sort((a, b) => {
    // Featured sempre primeiro (se habilitado)
    if (featuredFirst) {
      if (a.is_featured && !b.is_featured) return -1;
      if (!a.is_featured && b.is_featured) return 1;
    }
    // Depois por data de criação (mais recente primeiro)
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });
};
