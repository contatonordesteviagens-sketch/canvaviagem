import { useRef, useState, useEffect, useCallback } from "react";
import { Video, Image, LayoutGrid, FileText, Download, Bot, GraduationCap, Heart, ChevronLeft, ChevronRight } from "lucide-react";
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
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [hasAnimated, setHasAnimated] = useState(false);

  const displayCategories = showFavorites 
    ? categories 
    : categories.filter(c => c.id !== 'favorites');

  // Check scroll position and update arrow visibility
  const checkScrollPosition = useCallback(() => {
    const container = scrollRef.current;
    if (!container) return;
    
    const { scrollLeft, scrollWidth, clientWidth } = container;
    setCanScrollLeft(scrollLeft > 5);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 5);
  }, []);

  // Initial check and scroll listeners
  useEffect(() => {
    checkScrollPosition();
    const container = scrollRef.current;
    if (container) {
      container.addEventListener('scroll', checkScrollPosition);
      window.addEventListener('resize', checkScrollPosition);
    }
    return () => {
      if (container) {
        container.removeEventListener('scroll', checkScrollPosition);
      }
      window.removeEventListener('resize', checkScrollPosition);
    };
  }, [checkScrollPosition]);

  // Hint animation on first load
  useEffect(() => {
    const container = scrollRef.current;
    if (!container || hasAnimated) return;

    // Check if there's content to scroll
    const hasScrollableContent = container.scrollWidth > container.clientWidth;
    if (!hasScrollableContent) return;

    // Small delay before animation
    const timer = setTimeout(() => {
      container.classList.add('animate-hint-scroll');
      setHasAnimated(true);
      
      // Remove animation class after it completes
      setTimeout(() => {
        container.classList.remove('animate-hint-scroll');
      }, 600);
    }, 500);

    return () => clearTimeout(timer);
  }, [hasAnimated]);

  // Scroll by amount
  const scroll = (direction: 'left' | 'right') => {
    const container = scrollRef.current;
    if (!container) return;
    
    const scrollAmount = 200;
    container.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth'
    });
  };

  return (
    <div className="mb-8 relative">
      {/* Left arrow */}
      <button
        onClick={() => scroll('left')}
        className={cn(
          "absolute left-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-white/90 shadow-md flex items-center justify-center transition-opacity duration-200",
          canScrollLeft ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        aria-label="Scroll para esquerda"
      >
        <ChevronLeft className="w-5 h-5 text-muted-foreground" />
      </button>

      {/* Categories container */}
      <div 
        ref={scrollRef}
        className="overflow-x-auto scrollbar-hide -mx-4 px-4"
      >
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

      {/* Right arrow */}
      <button
        onClick={() => scroll('right')}
        className={cn(
          "absolute right-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-white/90 shadow-md flex items-center justify-center transition-opacity duration-200",
          canScrollRight ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        aria-label="Scroll para direita"
      >
        <ChevronRight className="w-5 h-5 text-muted-foreground" />
      </button>
    </div>
  );
};
