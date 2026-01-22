import { Video, Image, LayoutGrid, FileText, Download, Bot, GraduationCap, Heart } from "lucide-react";
import { cn } from "@/lib/utils";

export type CategoryType = 'videos' | 'feed' | 'stories' | 'captions' | 'downloads' | 'tools' | 'videoaula' | 'favorites';

interface CategoryNavProps {
  activeCategory: CategoryType;
  onCategoryChange: (category: CategoryType) => void;
  showFavorites?: boolean;
}

const categories: { id: CategoryType; label: string; icon: React.ReactNode }[] = [
  { id: 'videos', label: 'Vídeos Reels', icon: <Video className="w-6 h-6" /> },
  { id: 'feed', label: 'Arte Agência', icon: <Image className="w-6 h-6" /> },
  { id: 'stories', label: 'Stories', icon: <LayoutGrid className="w-6 h-6" /> },
  { id: 'captions', label: 'Legendas', icon: <FileText className="w-6 h-6" /> },
  { id: 'downloads', label: 'Downloads', icon: <Download className="w-6 h-6" /> },
  { id: 'tools', label: 'IA Tools', icon: <Bot className="w-6 h-6" /> },
  { id: 'videoaula', label: 'Videoaula', icon: <GraduationCap className="w-6 h-6" /> },
  { id: 'favorites', label: 'Favoritos', icon: <Heart className="w-6 h-6" /> },
];

export const CategoryNav = ({ activeCategory, onCategoryChange, showFavorites = true }: CategoryNavProps) => {
  const displayCategories = showFavorites 
    ? categories 
    : categories.filter(c => c.id !== 'favorites');

  return (
    <div className="mb-8">
      <div className="overflow-x-auto scrollbar-hide -mx-4 px-4">
        <div className="flex gap-4 pb-2 snap-x-mandatory min-w-max">
          {displayCategories.map((category) => {
            const isActive = activeCategory === category.id;
            
            return (
              <button
                key={category.id}
                onClick={() => onCategoryChange(category.id)}
                className="flex flex-col items-center gap-2 snap-center min-w-[72px] group"
              >
                {/* Circle Icon Container */}
                <div
                  className={cn(
                    "w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300",
                    isActive 
                      ? "bg-primary/10 ring-[3px] ring-primary text-primary" 
                      : "bg-secondary text-muted-foreground hover:bg-secondary/80 group-hover:scale-105"
                  )}
                >
                  {category.icon}
                </div>
                
                {/* Label */}
                <span
                  className={cn(
                    "text-xs font-medium text-center transition-colors whitespace-nowrap",
                    isActive ? "text-primary" : "text-muted-foreground"
                  )}
                >
                  {category.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
