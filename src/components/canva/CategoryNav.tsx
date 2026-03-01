import { useRef, useState, useEffect, useCallback, memo } from "react";
import { Video, Image, LayoutGrid, FileText, Download, Bot, GraduationCap, Heart, ChevronLeft, ChevronRight, Megaphone } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";

export type CategoryType = 'all' | 'videos' | 'feed' | 'stories' | 'offers' | 'captions' | 'downloads' | 'tools' | 'videoaula' | 'contracts' | 'favorites';

interface CategoryNavProps {
  activeCategory: CategoryType;
  onCategoryChange: (category: CategoryType) => void;
  showFavorites?: boolean;
}

const CategoryNavComponent = ({ activeCategory, onCategoryChange, showFavorites = true }: CategoryNavProps) => {
  const { t } = useLanguage();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [hasAnimated, setHasAnimated] = useState(false);

  const categories: { id: CategoryType; label: string; icon: React.ReactNode; isNew?: boolean }[] = [
    { id: 'all', label: 'Tudo', icon: <LayoutGrid className="w-6 h-6" /> },
    // Recursos PRO
    { id: 'videos', label: t('category.videos'), icon: <Video className="w-6 h-6" /> },
    { id: 'feed', label: t('category.feed'), icon: <Image className="w-6 h-6" /> },
    { id: 'stories', label: t('category.stories'), icon: <LayoutGrid className="w-6 h-6" /> },
    { id: 'offers', label: "Ofertas", icon: <Megaphone className="w-6 h-6" />, isNew: true },
    { id: 'downloads', label: t('category.downloads'), icon: <Download className="w-6 h-6" /> },

    // Ferramentas Gratuitas
    { id: 'captions', label: t('category.captions'), icon: <FileText className="w-6 h-6" /> },
    { id: 'tools', label: t('category.tools'), icon: <Bot className="w-6 h-6" /> },
    { id: 'videoaula', label: t('category.videoaula'), icon: <GraduationCap className="w-6 h-6" /> },
    { id: 'contracts', label: "Contratos", icon: <FileText className="w-6 h-6" /> }, // New

    { id: 'favorites', label: t('category.favorites'), icon: <Heart className="w-6 h-6" /> },
  ];

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

  // Hint animation on first load - more visible nudge
  useEffect(() => {
    const container = scrollRef.current;
    if (!container || hasAnimated) return;

    // Check if there's content to scroll
    const hasScrollableContent = container.scrollWidth > container.clientWidth;
    if (!hasScrollableContent) return;

    // Delay before animation starts
    const timer = setTimeout(() => {
      // Animate scroll to the right then back
      container.scrollTo({ left: 60, behavior: 'smooth' });

      setTimeout(() => {
        container.scrollTo({ left: 0, behavior: 'smooth' });
        setHasAnimated(true);
      }, 400);
    }, 800);

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
      {/* Left arrow - mobile + desktop */}
      <button
        onClick={() => scroll('left')}
        className={cn(
          "absolute left-0 top-1/2 -translate-y-1/2 z-20 w-10 h-10 md:w-8 md:h-8 rounded-full bg-white/90 shadow-md flex items-center justify-center transition-all duration-200",
          canScrollLeft ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        aria-label="Scroll para esquerda"
      >
        <ChevronLeft className="w-5 h-5 text-muted-foreground" />
      </button>

      {/* Categories container with fade edges */}
      <div className="relative">
        {/* Left fade gradient */}
        <div
          className={cn(
            "absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none transition-opacity duration-200",
            canScrollLeft ? "opacity-100" : "opacity-0"
          )}
        />

        {/* Right fade gradient - visual only */}
        <div
          className={cn(
            "absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-background via-background/80 to-transparent z-10 pointer-events-none transition-opacity duration-200",
            canScrollRight ? "opacity-100" : "opacity-0"
          )}
        />

        {/* Clickable scroll button - mobile & desktop */}
        <button
          onClick={() => scroll('right')}
          className={cn(
            "absolute right-0 top-1/2 -translate-y-1/2 z-20 w-10 h-10 flex items-center justify-center rounded-full bg-white/90 shadow-md transition-all duration-200",
            canScrollRight ? "opacity-100" : "opacity-0 pointer-events-none"
          )}
          aria-label="Scroll para direita"
        >
          <ChevronRight className="w-5 h-5 text-muted-foreground animate-pulse" />
        </button>

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
                  className="flex flex-col items-center gap-2 snap-center min-w-[72px] group relative"
                >
                  {/* "Novo" badge */}
                  {category.isNew && (
                    <span className="absolute -top-1 -right-1 z-10 bg-destructive text-destructive-foreground text-[8px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wide shadow-sm animate-pulse">
                      Novo
                    </span>
                  )}

                  {/* Circle Icon Container */}
                  <div
                    className={cn(
                      "w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center transition-all duration-300 shadow-sm",
                      isActive
                        ? "bg-primary/10 ring-[2px] sm:ring-[3px] ring-primary text-primary shadow-md"
                        : "bg-secondary text-muted-foreground hover:bg-secondary/80 group-hover:scale-105 hover:-translate-y-1 transition-transform"
                    )}
                  >
                    {category.icon && <div className="scale-75 sm:scale-100">{category.icon}</div>}
                  </div>

                  {/* Label */}
                  <span
                    className={cn(
                      "text-[10px] sm:text-xs font-medium text-center transition-colors whitespace-nowrap",
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

      {/* Right arrow - desktop only */}
      <button
        onClick={() => scroll('right')}
        className={cn(
          "absolute right-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-white/90 shadow-md items-center justify-center transition-opacity duration-200 hidden md:flex",
          canScrollRight ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        aria-label="Scroll para direita"
      >
        <ChevronRight className="w-5 h-5 text-muted-foreground" />
      </button>
    </div>
  );
};
export const CategoryNav = memo(CategoryNavComponent);
