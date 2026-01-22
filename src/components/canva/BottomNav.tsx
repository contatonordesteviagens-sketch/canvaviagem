import { Link, useLocation } from "react-router-dom";
import { Home, FolderOpen, LayoutGrid, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { to: "/", label: "Início", icon: Home },
  { to: "/projetos", label: "Projetos", icon: FolderOpen },
  { to: "/modelos", label: "Modelos", icon: LayoutGrid },
  { to: "/criar", label: "Criar", icon: Plus },
];

export const BottomNav = () => {
  const location = useLocation();
  
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-border/40 md:hidden safe-area-pb">
      <div className="flex items-center justify-around h-16">
        {navItems.map((item) => {
          const isActive = location.pathname === item.to || 
            (item.to === "/" && location.pathname === "/");
          const Icon = item.icon;
          
          return (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                "flex flex-col items-center justify-center gap-1 flex-1 h-full min-w-[64px] transition-colors",
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
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
