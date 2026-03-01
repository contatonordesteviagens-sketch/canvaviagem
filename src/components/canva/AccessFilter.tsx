import { memo } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Crown, Sparkles } from "lucide-react";

export type AccessFilterType = 'premium' | 'gratis';

interface AccessFilterProps {
    selectedFilters: string[];
    onFiltersChange: (filters: AccessFilterType[]) => void;
}

const AccessFilterComponent = ({
    selectedFilters,
    onFiltersChange
}: AccessFilterProps) => {

    const toggleFilter = (filter: AccessFilterType | null) => {
        if (!filter) {
            onFiltersChange([]);
        } else if (selectedFilters.includes(filter)) {
            onFiltersChange([]);
        } else {
            onFiltersChange([filter]);
        }
    };

    const isAllSelected = selectedFilters.length === 0;

    return (
        <div className="flex bg-secondary/80 backdrop-blur-md p-1 rounded-full w-fit border border-white/10 shadow-sm">
            <Button
                variant="ghost"
                size="sm"
                onClick={() => toggleFilter(null)}
                className={cn(
                    "rounded-full px-3 sm:px-5 h-8 sm:h-9 transition-all text-[10px] sm:text-xs font-bold uppercase tracking-wider",
                    isAllSelected
                        ? "bg-white shadow-md text-primary"
                        : "text-muted-foreground/70 hover:bg-white/50"
                )}
            >
                Tudo
            </Button>
            <Button
                variant="ghost"
                size="sm"
                onClick={() => toggleFilter('premium')}
                className={cn(
                    "rounded-full gap-1.5 sm:gap-2 px-3 sm:px-5 h-8 sm:h-9 transition-all text-[10px] sm:text-xs font-bold uppercase tracking-wider",
                    selectedFilters.includes('premium')
                        ? "bg-white shadow-md text-primary"
                        : "text-muted-foreground/70 hover:bg-white/50"
                )}
            >
                <Crown className={cn("w-3 h-3 sm:w-3.5 sm:h-3.5", selectedFilters.includes('premium') ? "text-primary fill-primary/20" : "text-muted-foreground/50")} />
                PRO
            </Button>
            <Button
                variant="ghost"
                size="sm"
                onClick={() => toggleFilter('gratis')}
                className={cn(
                    "rounded-full gap-1.5 sm:gap-2 px-3 sm:px-5 h-8 sm:h-9 transition-all text-[10px] sm:text-xs font-bold uppercase tracking-wider",
                    selectedFilters.includes('gratis')
                        ? "bg-white shadow-xl shadow-orange-500/10 text-orange-600 border border-orange-100"
                        : "text-muted-foreground/70 hover:bg-white/50"
                )}
            >
                <Sparkles className={cn("w-3 h-3 sm:w-3.5 sm:h-3.5", selectedFilters.includes('gratis') ? "text-orange-500" : "text-muted-foreground/50")} />
                Grátis
            </Button>
        </div>
    );
};

export const AccessFilter = memo(AccessFilterComponent);
