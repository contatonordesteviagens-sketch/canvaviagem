/**
 * Centralized logic for premium content verification
 */

export const PREMIUM_TYPES = ['video', 'seasonal', 'reel', 'story', 'weekly-story', 'feed', 'resource', 'download'];
export const FREE_TYPES = ['caption'];

/**
 * Checks if a specific content item should be considered premium
 */
export const checkIfItemIsPremium = (type: string, title?: string, index?: number): boolean => {
    // Captions: only the first 3 (index 0, 1, 2) are free
    if (type === 'caption') {
        if (typeof index === 'number') return index >= 3;
        return false;
    }

    // Primary content types: determine if premium based on type and index
    if (PREMIUM_TYPES.includes(type)) {
        // Feed: first 2 items are free
        if (type === 'feed' && typeof index === 'number') return index >= 2;
        return true;
    }

    // AI Tools / Marketing Tools logic
    if (type === 'tool' || type === 'marketing_tool') {
        const itemTitle = title?.toLowerCase() || '';

        // Explicitly premium tools based on keywords requested by user
        const premiumKeywords = ['vendedor', 'viaje', 'fechamento', 'vença'];
        return premiumKeywords.some(keyword => itemTitle.includes(keyword));
    }

    // Fallback: Default to premium for security
    return true;
};
