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
    <div className="flex overflow-x-auto pb-4 -mx-4 px-4 md:mx-0 md:px-0 md:overflow-visible md:pb-0 md:flex-wrap gap-2 md:justify-center mb-6 no-scrollbar snap-x">
      {filters.map((filter) => {
        const isActive = activeFilter === filter.id;

        return (
          <button
            key={filter.id}
            onClick={() => onFilterChange(filter.id)}
            className={cn(
              "whitespace-nowrap snap-center shrink-0 px-3 py-2 md:px-4 md:py-2.5 rounded-full text-xs md:text-sm font-medium transition-all duration-200",
              isActive
                ? "bg-foreground text-background shadow-md scale-105"
                : "bg-secondary/50 border border-border/50 text-secondary-foreground hover:bg-secondary/80"
            )}
          >
            {filter.label}
          </button>
        );
      })}
    </div>
  );
}
