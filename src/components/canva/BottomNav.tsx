import { Bot, Image, GraduationCap, Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import { CategoryType } from "./CategoryNav";

interface BottomNavProps {
  activeCategory: CategoryType;
  onCategoryChange: (category: CategoryType) => void;
}

const navItems: { category: CategoryType; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { category: "tools", label: "IA", icon: Bot },
  { category: "feed", label: "Artes", icon: Image },
  { category: "videoaula", label: "Aula", icon: GraduationCap },
  { category: "favorites", label: "Favoritos", icon: Heart },
];

export const BottomNav = ({ activeCategory, onCategoryChange }: BottomNavProps) => {
  const handleTabClick = (category: CategoryType) => {
    onCategoryChange(category);
    // Scroll to top when changing tabs
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-border/40 md:hidden">
      {/* Safe area padding for iOS devices */}
      <div className="flex items-center justify-around h-16 pb-safe">
        {navItems.map((item) => {
          const isActive = activeCategory === item.category;
          const Icon = item.icon;
          
          return (
            <button
              key={item.category}
              onClick={() => handleTabClick(item.category)}
              className={cn(
                "flex flex-col items-center justify-center gap-1 flex-1 h-full min-w-[64px] transition-all duration-200 relative active:scale-95",
                isActive ? "text-primary" : "text-muted-foreground"
              )}
              aria-label={item.label}
            >
              {/* Active indicator bar */}
              {isActive && (
                <div className="absolute top-0 w-12 h-0.5 bg-primary rounded-b-full" />
              )}
              
              <Icon className={cn(
                "w-6 h-6 transition-transform",
                isActive && "scale-110"
              )} />
              <span className={cn(
                "text-[10px] font-medium transition-all",
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
