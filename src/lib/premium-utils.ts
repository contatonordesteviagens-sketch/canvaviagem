/**
 * Centralized logic for premium content verification
 */

export const PREMIUM_TYPES = ['video', 'seasonal', 'reel', 'story', 'weekly-story', 'feed', 'resource', 'download'];
export const FREE_TYPES = ['caption'];

/**
 * Checks if a specific content item should be considered premium
 */
export const checkIfItemIsPremium = (type: string, title?: string, index?: number): boolean => {
    const itemTitle = title?.toLowerCase() || '';

    // Captions: only the first 2 (index 0, 1) are free
    if (type === 'caption') {
        if (typeof index === 'number') return index >= 2;
        return false;
    }

    // Feed: first 2 items are free
    if (type === 'feed') {
        if (typeof index === 'number') return index >= 2;
        // If no index provided, check title for "Grátis"
        return !itemTitle.includes('grátis');
    }

    // AI Tools / Marketing Tools logic
    if (type === 'tool' || type === 'marketing_tool') {
        // All AI tools are now premium (exclusive for Elite/Start subscribers)
        return true;
    }

    // Primary content types: All others are premium
    if (PREMIUM_TYPES.includes(type)) {
        return true;
    }

    // Fallback: Default to premium for security
    return true;
};
