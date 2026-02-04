import { cn } from "@/lib/utils";

interface FilterChipsProps<T extends string> {
  filters: { id: T; label: string }[];
  activeFilter: T;
  onFilterChange: (filter: T) => void;
}

export function FilterChips<T extends string>({ 
  filters, 
  activeFilter, 
  onFilterChange 
}: FilterChipsProps<T>) {
  return (
    <div className="flex flex-wrap gap-2 justify-center mb-6">
      {filters.map((filter) => {
        const isActive = activeFilter === filter.id;
        
        return (
          <button
            key={filter.id}
            onClick={() => onFilterChange(filter.id)}
            className={cn(
              "px-4 py-2.5 rounded-full text-sm font-medium transition-all duration-200 min-h-[44px]",
              isActive 
                ? "bg-foreground text-background shadow-md" 
                : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
            )}
          >
            {filter.label}
          </button>
        );
      })}
    </div>
  );
}
