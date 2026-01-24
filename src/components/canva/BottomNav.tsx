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
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-border/40 md:hidden safe-area-pb">
      <div className="flex items-center justify-around h-16">
        {navItems.map((item) => {
          const isActive = activeCategory === item.category;
          const Icon = item.icon;
          
          return (
            <button
              key={item.category}
              onClick={() => onCategoryChange(item.category)}
              className={cn(
                "flex flex-col items-center justify-center gap-1 flex-1 h-full min-w-[64px] transition-colors relative",
                isActive ? "text-primary" : "text-muted-foreground"
              )}
            >
              {/* Active indicator */}
              {isActive && (
                <div className="absolute top-0 w-12 h-0.5 bg-primary rounded-b-md" />
              )}
              
              <Icon className="w-6 h-6" />
              <span className={cn(
                "text-[10px] font-medium",
                isActive && "font-bold"
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
