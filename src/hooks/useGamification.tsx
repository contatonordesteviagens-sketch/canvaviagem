import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import {
    UserProgress,
    UserActivity,
    ActivityType,
    calculateLevel,
    getLevelInfo,
    calculateLevelProgress,
    getPointsToNextLevel,
    getActivityPoints,
} from '@/lib/gamification';
import { toast } from 'sonner';

export interface GamificationState {
    progress: UserProgress | null;
    loading: boolean;
    error: Error | null;
}

export interface GamificationActions {
    trackActivity: (activityType: ActivityType, metadata?: Record<string, any>) => Promise<void>;
    refreshProgress: () => Promise<void>;
    level: number;
    levelName: string;
    progressPercent: number;
    pointsToNext: number;
}

/**
 * Hook for managing user gamification progress
 */
export function useGamification(): GamificationState & GamificationActions {
    const { user } = useAuth();
    const [progress, setProgress] = useState<UserProgress | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    // Fetch user progress
    const fetchProgress = useCallback(async () => {
        if (!user) {
            setProgress(null);
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError(null);

            const { data, error: fetchError } = await (supabase
                .from('user_progress') as any)
                .select('*')
                .eq('user_id', user.id)
                .maybeSingle();

            if (fetchError) throw fetchError;

            if (!data) {
                // Create initial progress if doesn't exist
                const { data: newProgress, error: insertError } = await (supabase
                    .from('user_progress') as any)
                    .insert({
                        user_id: user.id,
                        level: 1,
                        total_points: 0,
                        videos_opened: 0,
                        arts_clicked: 0,
                        calendar_used: 0,
                        tools_used: 0,
                    })
                    .select()
                    .single();

                if (insertError) throw insertError;
                setProgress(newProgress as UserProgress);
            } else {
                setProgress(data as UserProgress);
            }
        } catch (err) {
            console.error('Error fetching gamification progress:', err);
            setError(err as Error);
        } finally {
            setLoading(false);
        }
    }, [user]);

    // Track activity and update progress
    const trackActivity = useCallback(
        async (activityType: ActivityType, metadata?: Record<string, any>) => {
            if (!user || !progress) return;

            const pointsEarned = getActivityPoints(activityType);

            try {
                // Insert activity log
                const { error: activityError } = await (supabase
                    .from('user_activities') as any)
                    .insert({
                        user_id: user.id,
                        activity_type: activityType,
                        points_earned: pointsEarned,
                        metadata,
                    });

                if (activityError) throw activityError;

                // Update progress
                const newTotalPoints = progress.total_points + pointsEarned;
                const newLevel = calculateLevel(newTotalPoints);

                const updates: Partial<UserProgress> = {
                    total_points: newTotalPoints,
                    level: newLevel,
                };

                // Increment specific counter
                switch (activityType) {
                    case 'video':
                        updates.videos_opened = progress.videos_opened + 1;
                        break;
                    case 'art':
                        updates.arts_clicked = progress.arts_clicked + 1;
                        break;
                    case 'calendar':
                        updates.calendar_used = progress.calendar_used + 1;
                        break;
                    case 'tool':
                        updates.tools_used = progress.tools_used + 1;
                        break;
                }

                const { data: updatedProgress, error: updateError } = await (supabase
                    .from('user_progress') as any)
                    .update(updates)
                    .eq('user_id', user.id)
                    .select()
                    .single();

                if (updateError) throw updateError;

                setProgress(updatedProgress as UserProgress);

                // Show level up toast
                if (newLevel > progress.level) {
                    const levelInfo = getLevelInfo(newLevel);
                    toast.success(`🎉 Parabéns! Você subiu para ${levelInfo.name}!`, {
                        duration: 5000,
                    });
                } else {
                    // Show points earned
                    toast.success(`+${pointsEarned} pontos! 🌟`, {
                        duration: 2000,
                    });
                }
            } catch (err) {
                console.error('Error tracking activity:', err);
                toast.error('Erro ao registrar atividade');
            }
        },
        [user, progress]
    );

    // Refresh progress manually
    const refreshProgress = useCallback(async () => {
        await fetchProgress();
    }, [fetchProgress]);

    // Auto-fetch on mount and user change
    useEffect(() => {
        fetchProgress();
    }, [fetchProgress]);

    // Realtime subscription
    useEffect(() => {
        if (!user) return;

        const channel = supabase
            .channel(`user_progress:${user.id}`)
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'user_progress',
                    filter: `user_id=eq.${user.id}`,
                },
                (payload) => {
                    console.log('[useGamification] Progress updated:', payload);
                    setProgress(payload.new as UserProgress);
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [user]);

    // Computed values
    const level = progress?.level || 1;
    const levelName = getLevelInfo(level).name;
    const progressPercent = calculateLevelProgress(progress?.total_points || 0);
    const pointsToNext = getPointsToNextLevel(progress?.total_points || 0);

    return {
        progress,
        loading,
        error,
        trackActivity,
        refreshProgress,
        level,
        levelName,
        progressPercent,
        pointsToNext,
    };
}
