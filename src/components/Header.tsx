import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { 
  Menu, X, LogOut, User, Home, Calendar, CreditCard, 
  Video, Image, LayoutGrid, FileText, Download, Bot, 
  GraduationCap, Heart, ChevronDown, Sun, Moon, Star, Settings
} from "lucide-react";
import logoImage from "@/assets/logo.png";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { NavLink } from "@/components/NavLink";
import { useAuth } from "@/contexts/AuthContext";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useTheme } from "@/contexts/ThemeContext";
import { useIsAdmin } from "@/hooks/useContent";

type CategoryType = 'videos' | 'feed' | 'stories' | 'captions' | 'downloads' | 'tools' | 'videoaula' | 'favorites';

interface HeaderProps {
  onCategoryChange?: (category: CategoryType) => void;
}

export const Header = ({ onCategoryChange }: HeaderProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { data: isAdmin } = useIsAdmin();

  // Mobile theme toggle button component
  const ThemeToggleMobile = () => (
    <button
      onClick={toggleTheme}
      className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors hover:bg-accent/10 text-left w-full"
      aria-label={theme === 'dark' ? 'Mudar para modo claro' : 'Mudar para modo escuro'}
    >
      {theme === 'dark' ? (
        <Sun className="h-5 w-5" />
      ) : (
        <Moon className="h-5 w-5" />
      )}
      {theme === 'dark' ? 'Modo Claro' : 'Modo Escuro'}
    </button>
  );

  const mainNavItems = [
    { to: "/", label: "Início", icon: Home },
    { to: "/calendar", label: "Calendário", icon: Calendar },
    { to: "/planos", label: "Planos", icon: CreditCard },
  ];

  const proximoNivelItem = {
    to: "/proximo-nivel",
    label: "Próximo Nível",
    icon: Star,
  };

  const contentCategories: { category: CategoryType; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { category: "videos", label: "Vídeos", icon: Video },
    { category: "feed", label: "Artes", icon: Image },
    { category: "stories", label: "Stories", icon: LayoutGrid },
    { category: "captions", label: "Legendas", icon: FileText },
    { category: "downloads", label: "Downloads", icon: Download },
    { category: "tools", label: "IA Tools", icon: Bot },
    { category: "videoaula", label: "Videoaula", icon: GraduationCap },
    { category: "favorites", label: "Favoritos", icon: Heart },
  ];

  const handleCategoryClick = (category: CategoryType) => {
    if (location.pathname !== "/") {
      navigate("/", { state: { category } });
    }
    onCategoryChange?.(category);
    setIsOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between max-w-7xl">
        <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <img 
            src={logoImage} 
            alt="Canva Viagem" 
            className="h-10 w-10 rounded-xl shadow-lg object-cover"
          />
          <span className="font-bold text-xl hidden sm:inline">Canva Viagens</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          {mainNavItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className="px-4 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-accent/10"
              activeClassName="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <item.icon className="w-4 h-4 mr-2 inline" />
              {item.label}
            </NavLink>
          ))}

          {/* Dropdown Conteúdos */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="px-4 py-2 text-sm font-medium">
                Conteúdos
                <ChevronDown className="w-4 h-4 ml-1" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {contentCategories.map((item) => (
                <DropdownMenuItem
                  key={item.category}
                  onClick={() => handleCategoryClick(item.category)}
                  className="cursor-pointer"
                >
                  <item.icon className="w-4 h-4 mr-2" />
                  {item.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Próximo Nível - Highlighted Link */}
          <NavLink
            to={proximoNivelItem.to}
            className="px-4 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-accent/10 flex items-center gap-1.5"
            activeClassName="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Star className="w-4 h-4 text-orange-500 fill-orange-500 animate-pulse" />
            <span>{proximoNivelItem.label}</span>
          </NavLink>

          {/* Admin Link - Only visible for admins */}
          {isAdmin && (
            <NavLink
              to="/gestao"
              className="px-4 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-accent/10 flex items-center gap-1.5"
              activeClassName="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <Settings className="w-4 h-4" />
              <span>Gestão</span>
            </NavLink>
          )}

          {/* Theme Toggle - Desktop */}
          <ThemeToggle />
          
          {user ? (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={signOut}
              className="ml-2"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sair
            </Button>
          ) : (
            <Link to="/auth">
              <Button variant="outline" size="sm" className="ml-2">
                <User className="h-4 w-4 mr-2" />
                Entrar
              </Button>
            </Link>
          )}
        </nav>

        {/* Mobile Navigation */}
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon">
              {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[280px] sm:w-[320px]">
            <nav className="flex flex-col gap-1 mt-8">
              {/* Theme Toggle - Mobile */}
              <ThemeToggleMobile />
              
              <DropdownMenuSeparator className="my-3" />

              {/* Navegação Principal */}
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 mb-2">
                Navegação
              </p>
              {mainNavItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors hover:bg-accent/10"
                  activeClassName="bg-primary text-primary-foreground"
                >
                  <item.icon className="h-5 w-5" />
                  {item.label}
                </NavLink>
              ))}

              {/* Próximo Nível - Mobile */}
              <NavLink
                to={proximoNivelItem.to}
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors hover:bg-accent/10"
                activeClassName="bg-primary text-primary-foreground"
              >
                <Star className="h-5 w-5 text-orange-500 fill-orange-500" />
                {proximoNivelItem.label}
              </NavLink>

              {/* Admin Link - Mobile - Only visible for admins */}
              {isAdmin && (
                <NavLink
                  to="/gestao"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors hover:bg-accent/10"
                  activeClassName="bg-primary text-primary-foreground"
                >
                  <Settings className="h-5 w-5" />
                  Gestão
                </NavLink>
              )}

              <DropdownMenuSeparator className="my-3" />

              {/* Conteúdos */}
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 mb-2">
                Conteúdos
              </p>
              {contentCategories.map((item) => (
                <button
                  key={item.category}
                  onClick={() => handleCategoryClick(item.category)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors hover:bg-accent/10 text-left w-full"
                >
                  <item.icon className="h-5 w-5" />
                  {item.label}
                </button>
              ))}

              <DropdownMenuSeparator className="my-3" />
              
              {user ? (
                <Button 
                  variant="ghost" 
                  onClick={() => {
                    signOut();
                    setIsOpen(false);
                  }}
                  className="justify-start gap-3 px-3"
                >
                  <LogOut className="h-5 w-5" />
                  Sair
                </Button>
              ) : (
                <Link to="/auth" onClick={() => setIsOpen(false)}>
                  <Button variant="outline" className="w-full justify-start gap-3 px-3">
                    <User className="h-5 w-5" />
                    Entrar
                  </Button>
                </Link>
              )}
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
};
