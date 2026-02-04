import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Filter, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export type ContentFilterType = 'nacionais' | 'internacionais' | 'artes' | 'stories';

interface ContentFilterDropdownProps {
  selectedFilters: ContentFilterType[];
  onFiltersChange: (filters: ContentFilterType[]) => void;
}

const filterOptions: { id: ContentFilterType; label: string; icon: string }[] = [
  { id: 'nacionais', label: 'Destinos Nacionais', icon: '🇧🇷' },
  { id: 'internacionais', label: 'Destinos Internacionais', icon: '🌎' },
  { id: 'artes', label: 'Artes para Feed', icon: '🖼️' },
  { id: 'stories', label: 'Stories', icon: '📱' },
];

export function ContentFilterDropdown({ 
  selectedFilters, 
  onFiltersChange 
}: ContentFilterDropdownProps) {
  const [open, setOpen] = useState(false);

  const toggleFilter = (filter: ContentFilterType) => {
    if (selectedFilters.includes(filter)) {
      onFiltersChange(selectedFilters.filter(f => f !== filter));
    } else {
      onFiltersChange([...selectedFilters, filter]);
    }
  };

  const clearAll = () => {
    onFiltersChange([]);
  };

  const hasFilters = selectedFilters.length > 0;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant="outline" 
          className={cn(
            "gap-2 rounded-full",
            hasFilters && "bg-primary text-primary-foreground hover:bg-primary/90"
          )}
        >
          <Filter className="h-4 w-4" />
          Filtrar
          {hasFilters && (
            <span className="bg-white/20 px-1.5 py-0.5 rounded-full text-xs">
              {selectedFilters.length}
            </span>
          )}
          <ChevronDown className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-4" align="start">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="font-semibold text-sm">Filtrar por:</p>
            {hasFilters && (
              <button 
                onClick={clearAll}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                Limpar
              </button>
            )}
          </div>
          
          <div className="space-y-2">
            {filterOptions.map((option) => (
              <label
                key={option.id}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted cursor-pointer"
              >
                <Checkbox
                  checked={selectedFilters.includes(option.id)}
                  onCheckedChange={() => toggleFilter(option.id)}
                />
                <span className="text-lg">{option.icon}</span>
                <span className="text-sm">{option.label}</span>
              </label>
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
