import { useGamification } from '@/hooks/useGamification';
import { Link } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProgressBarProps {
    compact?: boolean;
}

export const ProgressBar = ({ compact = false }: ProgressBarProps) => {
    const { level, levelName, progressPercent, progress, pointsToNext } = useGamification();

    if (!progress) return null;

    // Compact version for mobile greeting
    if (compact) {
        return (
            <Link
                to="/progresso"
                className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-background/50 backdrop-blur-md border border-input/20 shadow-sm active:scale-95 transition-all text-xs"
            >
                <div className="flex items-center justify-center w-5 h-5 rounded-full bg-primary/10 text-primary">
                    <span className="text-[10px] font-bold">{level}</span>
                </div>
                <div className="flex flex-col items-start leading-none">
                    <span className="font-bold text-[10px] text-muted-foreground uppercase tracking-wider">Nível</span>
                    <span className="font-bold text-primary">{progress.total_points} pts</span>
                </div>
            </Link>
        );
    }

    return (
        <Link
            to="/progresso"
            className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-accent/10 transition-colors group"
        >
            {/* Level Badge */}
            <div className="flex items-center gap-1.5">
                <Sparkles className="h-4 w-4 text-primary animate-pulse" />
                <span className="text-xs font-bold text-foreground hidden sm:inline">
                    {levelName}
                </span>
            </div>

            {/* Progress Bar */}
            <div className="hidden md:flex flex-col gap-0.5 min-w-[100px]">
                <div className="relative h-2 bg-secondary rounded-full overflow-hidden">
                    <div
                        className={cn(
                            'h-full rounded-full transition-all duration-500 ease-out',
                            'bg-gradient-to-r from-primary via-accent to-primary bg-[length:200%_100%]',
                            'animate-shimmer'
                        )}
                        style={{ width: `${progressPercent}%` }}
                    />
                </div>
                <div className="text-[10px] text-muted-foreground text-center">
                    {level === 3 ? 'Max!' : `${pointsToNext} pts p/ próx nível`}
                </div>
            </div>

            {/* Points mobile */}
            <div className="md:hidden text-xs font-semibold text-primary">
                {progress.total_points} pts
            </div>
        </Link>
    );
};
