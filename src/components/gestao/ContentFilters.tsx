import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search } from "lucide-react";

interface ContentFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  typeFilter: string;
  onTypeChange: (value: string) => void;
  categoryFilter: string;
  onCategoryChange: (value: string) => void;
  showTypeFilter?: boolean;
  showFavoritesFilter?: boolean;
  favoritesOnly?: boolean;
  onFavoritesChange?: (value: boolean) => void;
}

const contentTypes = [
  { value: "video", label: "Vídeo Reel" },
  { value: "seasonal", label: "Sazonal" },
  { value: "feed", label: "Arte Feed" },
  { value: "story", label: "Story" },
  { value: "weekly-story", label: "Story Semanal" },
  { value: "resource", label: "Recurso" },
  { value: "download", label: "Download" },
];

const categories = [
  { value: "nacional", label: "Nacional" },
  { value: "internacional", label: "Internacional" },
  { value: "influencer-eva", label: "Influencer Eva" },
  { value: "influencer-mel", label: "Influencer Mel" },
  { value: "influencer-bia", label: "Influencer Bia" },
];

export const ContentFilters = ({
  searchQuery,
  onSearchChange,
  typeFilter,
  onTypeChange,
  categoryFilter,
  onCategoryChange,
  showTypeFilter = true,
  showFavoritesFilter = false,
  favoritesOnly = false,
  onFavoritesChange,
}: ContentFiltersProps) => {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="relative flex-1 min-w-[200px] max-w-[300px]">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Pesquisar por título..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9"
        />
      </div>

      {showTypeFilter && (
        <Select value={typeFilter} onValueChange={onTypeChange}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os tipos</SelectItem>
            {contentTypes.map((t) => (
              <SelectItem key={t.value} value={t.value}>
                {t.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      <Select value={categoryFilter} onValueChange={onCategoryChange}>
        <SelectTrigger className="w-[160px]">
          <SelectValue placeholder="Categoria" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todas categorias</SelectItem>
          {categories.map((c) => (
            <SelectItem key={c.value} value={c.value}>
              {c.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {showFavoritesFilter && onFavoritesChange && (
        <button
          type="button"
          onClick={() => onFavoritesChange(!favoritesOnly)}
          className={`flex items-center gap-2 px-3 py-2 rounded-md border transition-colors text-sm font-medium ${
            favoritesOnly 
              ? "bg-primary text-primary-foreground border-primary" 
              : "bg-background border-border hover:bg-muted"
          }`}
        >
          ❤️ Favoritos
        </button>
      )}
    </div>
  );
};
