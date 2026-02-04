import { Bot, Image, GraduationCap, Heart, Home } from "lucide-react";
import { cn } from "@/lib/utils";
import { CategoryType } from "./CategoryNav";
import { useLanguage } from "@/contexts/LanguageContext";

interface BottomNavProps {
  activeCategory: CategoryType;
  onCategoryChange: (category: CategoryType) => void;
}

export const BottomNav = ({ activeCategory, onCategoryChange }: BottomNavProps) => {
  const { t } = useLanguage();

  const navItems: { category: CategoryType | "home"; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { category: "home", label: t('nav.home'), icon: Home },
    { category: "tools", label: t('nav.ai'), icon: Bot },
    { category: "feed", label: t('nav.arts'), icon: Image },
    { category: "videoaula", label: t('nav.class'), icon: GraduationCap },
    { category: "favorites", label: t('nav.favorites'), icon: Heart },
  ];

  const handleTabClick = (category: CategoryType | "home") => {
    // Scroll to top when changing tabs
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    // Home resets to videos view (not feed)
    if (category === "home") {
      onCategoryChange("videos");
    } else {
      onCategoryChange(category);
    }
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-[60] bg-white dark:bg-background border-t border-border/40 md:hidden">
      {/* Safe area padding for iOS devices */}
      <div className="flex items-center justify-around h-16 pb-safe shrink-0">
        {navItems.map((item) => {
          const isActive = item.category === "home" 
            ? activeCategory === "videos" 
            : activeCategory === item.category;
          const Icon = item.icon;
          
          return (
            <button
              key={item.category}
              onClick={() => handleTabClick(item.category)}
              className={cn(
                "flex flex-col items-center justify-center gap-1 flex-1 h-full min-w-[64px] shrink-0 transition-all duration-200 relative active:scale-95",
                isActive ? "text-primary" : "text-muted-foreground"
              )}
              aria-label={item.label}
            >
              {/* Active indicator bar */}
              {isActive && (
                <div className="absolute top-0 w-12 h-0.5 bg-primary rounded-b-full shrink-0" />
              )}
              
              <Icon className={cn(
                "w-6 h-6 shrink-0 transition-transform",
                isActive && "scale-110"
              )} />
              <span className={cn(
                "text-[10px] font-medium transition-all shrink-0",
                isActive && "font-bold text-primary"
              )}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
