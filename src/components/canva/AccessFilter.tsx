import { memo } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Crown, Sparkles } from "lucide-react";

export type AccessFilterType = 'premium' | 'gratis';

interface AccessFilterProps {
    selectedFilters: string[];
    onFiltersChange: (filters: any[]) => void;
}

const AccessFilterComponent = ({
    selectedFilters,
    onFiltersChange
}: AccessFilterProps) => {

    const toggleFilter = (filter: AccessFilterType) => {
        if (selectedFilters.includes(filter)) {
            // Se tiver os dois e remover um, mantém o outro
            if (selectedFilters.length > 1) {
                onFiltersChange(selectedFilters.filter(f => f !== filter));
            }
            // Não permite desmarcar os dois ao mesmo tempo para não ficar vazio
        } else {
            onFiltersChange([...selectedFilters, filter]);
        }
    };

    return (
        <div className="flex bg-secondary/50 p-1 rounded-full w-fit">
            <Button
                variant="ghost"
                size="sm"
                onClick={() => toggleFilter('premium')}
                className={cn(
                    "rounded-full gap-2 px-4 h-9 transition-all",
                    selectedFilters.includes('premium')
                        ? "bg-white shadow-sm text-primary font-bold"
                        : "text-muted-foreground hover:bg-white/50"
                )}
            >
                <Crown className={cn("w-4 h-4", selectedFilters.includes('premium') ? "text-primary" : "text-muted-foreground")} />
                PRO
            </Button>
            <Button
                variant="ghost"
                size="sm"
                onClick={() => toggleFilter('gratis')}
                className={cn(
                    "rounded-full gap-2 px-4 h-9 transition-all",
                    selectedFilters.includes('gratis')
                        ? "bg-white shadow-sm text-accent font-bold"
                        : "text-muted-foreground hover:bg-white/50"
                )}
            >
                <Sparkles className={cn("w-4 h-4", selectedFilters.includes('gratis') ? "text-accent" : "text-muted-foreground")} />
                Grátis
            </Button>
        </div>
    );
};

export const AccessFilter = memo(AccessFilterComponent);
