import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Menu, X, LogOut, User, Home, Calendar, CreditCard,
  Video, Image, LayoutGrid, FileText, Download, Bot,
  GraduationCap, Heart, ChevronDown, Sun, Moon, Star, TrendingUp, MessageSquare, MoreHorizontal
} from "lucide-react";
import logoImage from "@/assets/logo.png";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
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
import { useLanguage } from "@/contexts/LanguageContext";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { supabase } from "@/integrations/supabase/client";
import { ProgressBar } from "@/components/ProgressBar";

type CategoryType = 'videos' | 'feed' | 'stories' | 'captions' | 'downloads' | 'tools' | 'videoaula' | 'favorites';

// Flag to show/hide "Próximo Nível" based on language

interface HeaderProps {
  onCategoryChange?: (category: CategoryType) => void;
}

export const Header = ({ onCategoryChange }: HeaderProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [userName, setUserName] = useState<string | null>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { t, language } = useLanguage();

  // Detect if we're on ES routes to generate correct navigation links
  const isESRoute = location.pathname.startsWith('/es');

  // Show "Próximo Nível" only for Portuguese
  const showProximoNivel = language === 'pt';

  // Fetch user name from profile with realtime updates
  useEffect(() => {
    if (!user) {
      setUserName(null);
      return;
    }

    const fetchUserName = async () => {
      const { data } = await supabase
        .from("profiles")
        .select("name")
        .eq("user_id", user.id)
        .maybeSingle();

      setUserName(data?.name || null);
    };

    fetchUserName();

    // Subscribe to realtime updates on the user's profile
    const channel = supabase
      .channel(`profile-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          console.log('[Header] Profile updated:', payload);
          setUserName((payload.new as { name?: string })?.name || null);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  // Mobile theme toggle button component
  const ThemeToggleMobile = () => (
    <button
      onClick={toggleTheme}
      className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors hover:bg-accent/10 text-left w-full"
      aria-label={theme === 'dark' ? t('header.lightMode') : t('header.darkMode')}
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
    { to: isESRoute ? "/es" : "/", label: t('header.home'), icon: Home },
    { to: isESRoute ? "/es/calendar" : "/calendar", label: t('header.calendar'), icon: Calendar },
    { to: isESRoute ? "/es/planos" : "/planos", label: t('header.plans'), icon: CreditCard },
  ];

  // Additional nav items for logged-in users
  const userNavItems = user ? [
    { to: isESRoute ? "/es/progresso" : "/progresso", label: "Progresso", icon: TrendingUp },
    { to: isESRoute ? "/es/sugestoes" : "/sugestoes", label: "Sugestões", icon: MessageSquare },
  ] : [];

  const proximoNivelItem = {
    to: "/proximo-nivel",
    label: "Turbo",
    icon: Star,
  };

  const contentCategories: { category: CategoryType; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { category: "videos", label: t('category.videos'), icon: Video },
    { category: "feed", label: t('category.feed'), icon: Image },
    { category: "stories", label: t('category.stories'), icon: LayoutGrid },
    { category: "captions", label: t('category.captions'), icon: FileText },
    { category: "downloads", label: t('category.downloads'), icon: Download },
    { category: "tools", label: t('category.tools'), icon: Bot },
    { category: "videoaula", label: t('category.videoaula'), icon: GraduationCap },
    { category: "favorites", label: t('category.favorites'), icon: Heart },
  ];

  const handleCategoryClick = (category: CategoryType) => {
    const homeRoute = isESRoute ? "/es" : "/";
    const isOnHome = location.pathname === "/" || location.pathname === "/es";
    if (!isOnHome) {
      navigate(homeRoute, { state: { category } });
    }
    onCategoryChange?.(category);
    setIsOpen(false);
  };

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between max-w-7xl">
          <Link to={isESRoute ? "/es" : "/"} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <img
              src={logoImage}
              alt="TravelMarketing"
              className="h-10 w-10 rounded-xl shadow-lg md:shadow-lg hover:shadow-xl transition-shadow object-cover"
            />
            <span className="text-2xl">🍌</span>
            <div className="hidden sm:block">
              <span className="font-black text-xl bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">TravelMarketing</span>
              <p className="text-[10px] text-muted-foreground font-medium -mt-1">by Canva Viagem</p>
            </div>
          </Link>

          {/* Mobile Progress Bar - Compact next to logo */}
          {user && (
            <div className="md:hidden">
              <ProgressBar compact />
            </div>
          )}

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-2">
            {/* Progress Bar - Desktop */}
            {user && <ProgressBar />}

            {/* Theme Toggle - Desktop */}
            <ThemeToggle />

            {/* Language Switcher - Desktop */}
            <LanguageSwitcher variant="desktop" />

            {/* Dropdown Mais - All Content */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="px-3 py-2">
                  <MoreHorizontal className="w-4 h-4 mr-1.5" />
                  <span className="text-sm font-medium">Mais</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                {/* Navigation Pages */}
                <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">PÁGINAS</div>
                {mainNavItems.map((item) => (
                  <DropdownMenuItem
                    key={item.to}
                    onClick={() => window.location.href = item.to}
                    className="cursor-pointer"
                  >
                    <item.icon className="w-4 h-4 mr-2" />
                    {item.label}
                  </DropdownMenuItem>
                ))}

                {/* User Items if logged in */}
                {user && userNavItems.map((item) => (
                  <DropdownMenuItem
                    key={item.to}
                    onClick={() => window.location.href = item.to}
                    className="cursor-pointer"
                  >
                    <item.icon className="w-4 h-4 mr-2" />
                    {item.label}
                  </DropdownMenuItem>
                ))}

                {/* Separator before content categories */}
                <div className="border-t my-1.5" />
                <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">CONTEÚDOS</div>

                {/* Content Categories */}
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

            {user ? (
              <div className="flex items-center gap-2 ml-2">
                <span className="text-sm font-medium text-foreground">
                  Olá, {userName || user.email?.split("@")[0]}! 👋
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={signOut}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  {t('header.logout')}
                </Button>
              </div>
            ) : (
              <Link to="/auth">
                <Button variant="outline" size="sm" className="ml-2">
                  <User className="h-4 w-4 mr-2" />
                  {t('header.login')}
                </Button>
              </Link>
            )}
          </nav>

          {/* Mobile Navigation */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button
                variant="ghost"
                size="icon"
                className="shadow-sm border border-input/20 bg-background/50 backdrop-blur-sm active:scale-95 transition-all"
              >
                {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[280px] sm:w-[320px] p-0">
              <ScrollArea className="h-full px-6 py-6">
                <nav className="flex flex-col gap-1 mt-8">
                  {/* Language Switcher - Mobile */}
                  <LanguageSwitcher variant="mobile" />

                  <DropdownMenuSeparator className="my-3" />

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

                  {/* Próximo Nível - Mobile - Only for Portuguese */}
                  {showProximoNivel && (
                    <NavLink
                      to={proximoNivelItem.to}
                      onClick={() => setIsOpen(false)}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors hover:bg-accent/10"
                      activeClassName="bg-primary text-primary-foreground"
                    >
                      <Star className="h-5 w-5 text-orange-500 fill-orange-500" />
                      {proximoNivelItem.label}
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
                    <>
                      <div className="px-3 py-2 text-sm font-medium text-foreground">
                        Olá, {userName || user.email?.split("@")[0]}! 👋
                      </div>
                      <Button
                        variant="ghost"
                        onClick={() => {
                          signOut();
                          setIsOpen(false);
                        }}
                        className="justify-start gap-3 px-3"
                      >
                        <LogOut className="h-5 w-5" />
                        {t('header.logout')}
                      </Button>
                    </>
                  ) : (
                    <Link to="/auth" onClick={() => setIsOpen(false)}>
                      <Button variant="outline" className="w-full justify-start gap-3 px-3">
                        <User className="h-5 w-5" />
                        {t('header.login')}
                      </Button>
                    </Link>
                  )}
                </nav>
              </ScrollArea>
            </SheetContent>
          </Sheet>
        </div>
      </header>

      {/* Mobile Greeting Bar with Gamification - Only on Mobile */}
      {user && (
        <div className="md:hidden bg-gradient-to-r from-primary/5 to-accent/5 border-b border-border/30">
          <div className="container mx-auto px-4 py-2 flex flex-col items-center justify-center gap-1">
            <span className="text-xs font-medium text-foreground">
              Olá, {userName?.split(' ')[0] || user.email?.split('@')[0]}!
            </span>
            <ProgressBar compact />
          </div>
        </div>
      )}
    </>
  );
};
