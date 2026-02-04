import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Globe } from "lucide-react";

interface ContentFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  typeFilter: string;
  onTypeChange: (value: string) => void;
  categoryFilter: string;
  onCategoryChange: (value: string) => void;
  languageFilter?: string;
  onLanguageChange?: (value: string) => void;
  showTypeFilter?: boolean;
  showLanguageFilter?: boolean;
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
  languageFilter = "all",
  onLanguageChange,
  showTypeFilter = true,
  showLanguageFilter = false,
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

      {showLanguageFilter && onLanguageChange && (
        <Select value={languageFilter} onValueChange={onLanguageChange}>
          <SelectTrigger className="w-[160px]">
            <Globe className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Idioma" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos idiomas</SelectItem>
            <SelectItem value="pt">🇧🇷 Português</SelectItem>
            <SelectItem value="es">🇪🇸 Espanhol/Int.</SelectItem>
          </SelectContent>
        </Select>
      )}
    </div>
  );
};