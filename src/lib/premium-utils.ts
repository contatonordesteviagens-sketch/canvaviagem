/**
 * Centralized logic for premium content verification
 */

export const PREMIUM_TYPES = ['video', 'seasonal', 'reel', 'story', 'weekly-story', 'feed', 'resource', 'download'];
export const FREE_TYPES = ['caption'];

/**
 * Checks if a specific content item should be considered premium
 */
export const checkIfItemIsPremium = (type: string, title?: string): boolean => {
    // Captions are always free
    if (type === 'caption') return false;

    // Primary content types are always premium
    if (PREMIUM_TYPES.includes(type)) return true;

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
