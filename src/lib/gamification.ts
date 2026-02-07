// Gamification logic and utilities
export const POINTS_CONFIG = {
    VIDEO_OPENED: 10,
    ART_CLICKED: 5,
    CALENDAR_USED: 15,
    TOOL_USED: 20,
} as const;

export const LEVELS = {
    1: { name: '🎯 Jr', minPoints: 0, maxPoints: 100 },
    2: { name: '🚀 Master', minPoints: 101, maxPoints: 300 },
    3: { name: '⭐ Max', minPoints: 301, maxPoints: Infinity },
} as const;

export type ActivityType = 'video' | 'art' | 'calendar' | 'tool';

export interface UserProgress {
    id: string;
    user_id: string;
    level: number;
    total_points: number;
    videos_opened: number;
    arts_clicked: number;
    calendar_used: number;
    tools_used: number;
    created_at: string;
    updated_at: string;
}

export interface UserActivity {
    id: string;
    user_id: string;
    activity_type: ActivityType;
    points_earned: number;
    metadata?: Record<string, any>;
    created_at: string;
}

/**
 * Calculate user level based on total points
 */
export function calculateLevel(totalPoints: number): number {
    if (totalPoints <= 100) return 1;
    if (totalPoints <= 300) return 2;
    return 3;
}

/**
 * Get level info by level number
 */
export function getLevelInfo(level: number) {
    return LEVELS[level as keyof typeof LEVELS] || LEVELS[1];
}

/**
 * Calculate progress percentage within current level
 */
export function calculateLevelProgress(totalPoints: number): number {
    const level = calculateLevel(totalPoints);
    const levelInfo = getLevelInfo(level);

    if (level === 3) {
        // Max level - always show 100%
        return 100;
    }

    const pointsInLevel = totalPoints - levelInfo.minPoints;
    const levelRange = levelInfo.maxPoints - levelInfo.minPoints;

    return Math.min(100, Math.round((pointsInLevel / levelRange) * 100));
}

/**
 * Get points to next level
 */
export function getPointsToNextLevel(totalPoints: number): number {
    const level = calculateLevel(totalPoints);

    if (level === 3) {
        return 0; // Already at max level
    }

    const nextLevelInfo = getLevelInfo(level + 1);
    return nextLevelInfo.minPoints - totalPoints;
}

/**
 * Get activity points based on type
 */
export function getActivityPoints(activityType: ActivityType): number {
    switch (activityType) {
        case 'video':
            return POINTS_CONFIG.VIDEO_OPENED;
        case 'art':
            return POINTS_CONFIG.ART_CLICKED;
        case 'calendar':
            return POINTS_CONFIG.CALENDAR_USED;
        case 'tool':
            return POINTS_CONFIG.TOOL_USED;
        default:
            return 0;
    }
}
