import { FREE_CAPTION_IDS, FREE_FEED_TEMPLATE_IDS } from "@/data/free-content";

export const PREMIUM_TYPES = ['video', 'seasonal', 'reel', 'story', 'weekly-story', 'feed', 'resource', 'download'];
export const FREE_TYPES = ['caption'];

/**
 * Checks if a specific content item should be considered premium
 */
export const checkIfItemIsPremium = (
    type: string,
    title?: string,
    _index?: number,
    itemId?: string,
): boolean => {
    const itemTitle = (title || '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase();

    if (type === 'caption') {
        return !itemId || !FREE_CAPTION_IDS.has(itemId);
    }

    if (type === 'feed') {
        const explicitFreeItem = Boolean(itemId && FREE_FEED_TEMPLATE_IDS.has(itemId));
        return !explicitFreeItem && !itemTitle.includes('(gratis)');
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
