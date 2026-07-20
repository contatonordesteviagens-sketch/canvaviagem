import { useState, useEffect, memo } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Menu, X, LogOut, User, Home, Calendar, CreditCard,
  Video, Image, LayoutGrid, FileText, Download, Bot,
  GraduationCap, Heart, ChevronDown, Sun, Moon, Star, TrendingUp, MessageSquare, MoreHorizontal, Wand2, PanelLeft
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
import { cn } from "@/lib/utils";
import { FabricaUpgradeModal } from "@/components/fabrica/FabricaUpgradeModal";
import { hasEliteAccess } from "@/lib/planAccess";
import { useSidebar } from "@/contexts/SidebarContext";

type CategoryType = 'videos' | 'feed' | 'stories' | 'captions' | 'downloads' | 'tools' | 'videoaula' | 'favorites';

// Flag to show/hide "Próximo Nível" based on language

interface HeaderProps {
  onCategoryChange?: (category: CategoryType) => void;
}

const HeaderComponent = ({ onCategoryChange }: HeaderProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [userName, setUserName] = useState<string | null>(null);
  const [fabricaUpgradeOpen, setFabricaUpgradeOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut, subscription, isAdmin } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { t, language } = useLanguage();
  const { isCollapsed, toggleSidebar } = useSidebar();

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
    { to: "/blog", label: "Blog", icon: FileText, state: { fromInternal: true } },
    { to: isESRoute ? "/es/inicio" : "/inicio", label: t('header.plans'), icon: CreditCard },
    { id: "aulas", label: "Aulas", icon: GraduationCap, action: () => handleCategoryClick('videoaula') }
  ];

  // Additional nav items for logged-in users
  const userNavItems = user ? [
    { to: "/downloads", label: "Downloads", icon: Download },
    { to: "/fabrica", label: "Fábrica", icon: Wand2, isNew: true },
    { to: isESRoute ? "/es/progresso" : "/progresso", label: "Progresso", icon: TrendingUp },
    { to: isESRoute ? "/es/sugestoes" : "/sugestoes", label: "Sugestões", icon: MessageSquare },
    { to: "/minha-conta", label: "Minha Conta", icon: User },
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

  // Intercept navigation to gated routes (Fábrica / Painel de Marketing)
  const handleNavClick = (to: string) => {
    const isElite = hasEliteAccess(subscription);

    if ((to === "/fabrica" || to === "/painel-marketing") && !isAdmin && !isElite) {
      setFabricaUpgradeOpen(true);
      setIsOpen(false);
      return;
    }

    navigate(to);
    setIsOpen(false);
  };

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between max-w-7xl">
          <div className="flex items-center gap-2">
            {/* Sidebar Toggle - Desktop only */}
            <button
              onClick={toggleSidebar}
              className="hidden md:flex items-center justify-center h-8 w-8 rounded-md hover:bg-accent transition-colors text-muted-foreground hover:text-foreground"
              title={isCollapsed ? 'Abrir menu' : 'Fechar menu'}
            >
              <PanelLeft className="h-5 w-5" />
            </button>
          <Link to={isESRoute ? "/es" : "/"} className="flex items-center gap-3 hover:opacity-80 transition-opacity shrink-0 min-w-0">
            <img
              src={logoImage}
              alt="TravelMarketing"
              className="h-10 w-10 rounded-xl shadow-lg md:shadow-lg hover:shadow-xl transition-shadow object-cover shrink-0"
            />
            <div className="hidden sm:flex flex-col min-w-0">
              <span className="text-lg lg:text-xl font-bold text-slate-800 dark:text-white tracking-tight whitespace-nowrap leading-tight">
                Canva Viagem
              </span>
              <p className="hidden xl:block text-[10px] text-muted-foreground font-medium -mt-0.5 uppercase tracking-wider whitespace-nowrap">Estratégias para Agentes</p>
            </div>
          </Link>
          </div>

          {/* Mobile Progress Bar - Compact next to logo */}
          {user && (
            <div className="md:hidden">
              <ProgressBar compact />
            </div>
          )}

          {/* Desktop Navigation - Simplificado e Despoluído (Menu Principal transferido para o Menu Lateral) */}
          <nav className="hidden md:flex items-center gap-2">
            {/* Progress Bar - Desktop */}
            {user && <div className="mr-2"><ProgressBar /></div>}

            {/* Theme Toggle - Desktop */}
            <ThemeToggle />

            {/* Language Switcher - Desktop */}
            <LanguageSwitcher variant="desktop" />

            {/* Dropdown Mais - APENAS para recursos extras de usuário (Despoluído) */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="px-3 py-2 rounded-full ml-1 relative">
                  <MoreHorizontal className="w-4 h-4 mr-1.5" />
                  <span className="text-sm font-medium">Recursos</span>
                  {/* Notificação de algo novo se houver */}
                  <span className="absolute top-1 right-1 flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-60 p-1">
                {userNavItems.map((item) => (
                  <DropdownMenuItem
                    key={item.to}
                    onClick={() => handleNavClick(item.to)}
                    className="cursor-pointer flex items-center justify-between py-2"
                  >
                    <div className="flex items-center">
                      <item.icon className="w-4 h-4 mr-2 text-muted-foreground" />
                      <span className="font-medium">{item.label}</span>
                    </div>
                    {item.isNew && (
                      <span className="bg-destructive text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wide">
                        NOVO
                      </span>
                    )}
                  </DropdownMenuItem>
                ))}
                <div className="border-t my-1" />
                <DropdownMenuItem onClick={() => navigate("/minha-conta")} className="cursor-pointer">
                   <User className="w-4 h-4 mr-2 text-muted-foreground" />
                   Minha Conta
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {user ? (
              <div className="flex items-center gap-2 ml-2 min-w-0">
                <span className="hidden lg:inline text-sm font-medium text-foreground truncate max-w-[160px]">
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
                {isOpen ? <X className="h-5 w-5 text-amber-400" /> : <Menu className="h-5 w-5" />}
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[285px] sm:w-[320px] p-0 bg-[#0F0F11] border-l border-white/15 text-white shadow-2xl">
              <ScrollArea className="h-full px-5 py-6">
                <nav className="flex flex-col gap-1.5 mt-6 pb-24">
                  {/* Language Switcher - Mobile */}
                  <div className="px-2">
                    <LanguageSwitcher variant="mobile" />
                  </div>

                  <div className="h-px bg-white/10 my-3.5 mx-2" />

                  {/* Theme Toggle - Mobile */}
                  <div className="px-2">
                    <ThemeToggleMobile />
                  </div>

                  <div className="h-px bg-white/10 my-3.5 mx-2" />

                  {/* Navegação Principal */}
                  <p className="text-[10px] font-extrabold text-white/40 uppercase tracking-widest px-3 mb-2">
                    Navegação
                  </p>
                  {mainNavItems.map((item) => {
                    if ('action' in item) {
                      return (
                        <button
                          key={item.id}
                          onClick={() => {
                            item.action!();
                            setIsOpen(false);
                          }}
                          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-white/70 transition-all hover:bg-white/[0.06] hover:text-white w-full text-left"
                        >
                          <item.icon className="h-4 w-4 text-white/40" />
                          {item.label}
                        </button>
                      );
                    }
                    return (
                      <NavLink
                        key={item.to}
                        to={item.to!}
                        state={'state' in item ? item.state : undefined}
                        onClick={() => setIsOpen(false)}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all text-white/70 hover:bg-white/[0.06] hover:text-white"
                        activeClassName="bg-white/[0.08] text-amber-400 border border-white/10 shadow-sm"
                      >
                        <item.icon className="h-4 w-4 text-amber-400" />
                        {item.label}
                      </NavLink>
                    );
                  })}

                  {/* Próximo Nível - Mobile - Only for Portuguese */}
                  {showProximoNivel && (
                    <NavLink
                      to={proximoNivelItem.to}
                      onClick={() => setIsOpen(false)}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all text-white/70 hover:bg-white/[0.06] hover:text-white"
                      activeClassName="bg-white/[0.08] text-amber-400 border border-white/10 shadow-sm"
                    >
                      <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
                      {proximoNivelItem.label}
                    </NavLink>
                  )}

                  {/* Recursos Adicionais de Usuário (Fábrica, etc) no Mobile */}
                  {user && userNavItems.map((item) => (
                    <button
                      key={item.to}
                      onClick={() => {
                        handleNavClick(item.to);
                        setIsOpen(false);
                      }}
                      className="flex items-center justify-between w-full px-3 py-2.5 rounded-xl text-sm font-semibold text-white/70 transition-all hover:bg-white/[0.06] hover:text-white"
                    >
                      <div className="flex items-center gap-3">
                        <item.icon className="h-4 w-4 text-white/40" />
                        <span>{item.label}</span>
                      </div>
                      {item.isNew && (
                        <span className="bg-gradient-to-r from-amber-500 to-yellow-400 text-black text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider shadow">
                          NOVO
                        </span>
                      )}
                    </button>
                  ))}

                  <div className="h-px bg-white/10 my-3.5 mx-2" />

                  {/* Conteúdos */}
                  <p className="text-[10px] font-extrabold text-white/40 uppercase tracking-widest px-3 mb-2">
                    Conteúdos
                  </p>
                  {contentCategories.map((item) => (
                    <button
                      key={item.category}
                      onClick={() => handleCategoryClick(item.category)}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-white/70 transition-all hover:bg-white/[0.06] hover:text-white text-left w-full"
                    >
                      <item.icon className="h-4 w-4 text-white/40" />
                      {item.label}
                    </button>
                  ))}

                  <div className="h-px bg-white/10 my-3.5 mx-2" />

                  {user ? (
                    <>
                      <div className="px-3 py-2 text-xs font-bold text-amber-400/90 tracking-wide">
                        Olá, {userName || user.email?.split("@")[0]}! 👋
                      </div>
                      <Link to="/minha-conta" onClick={() => setIsOpen(false)}>
                        <button className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-white/70 transition-all hover:bg-white/[0.06] hover:text-white text-left w-full">
                          <User className="h-4 w-4 text-white/40" />
                          Minha Conta
                        </button>
                      </Link>
                      <button
                        onClick={() => {
                          signOut();
                          setIsOpen(false);
                        }}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-red-400 hover:bg-red-500/10 transition-all text-left w-full mt-1"
                      >
                        <LogOut className="h-4 w-4 text-red-400" />
                        {t('header.logout')}
                      </button>
                    </>
                  ) : (
                    <Link to="/auth" onClick={() => setIsOpen(false)}>
                      <button className="flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-sm transition-all shadow-lg mt-2">
                        <User className="h-4 w-4" />
                        {t('header.login')}
                      </button>
                    </Link>
                  )}
                </nav>
              </ScrollArea>
            </SheetContent>
          </Sheet>
        </div>
      </header>

      <FabricaUpgradeModal open={fabricaUpgradeOpen} onOpenChange={setFabricaUpgradeOpen} />
    </>
  );
};
export const Header = memo(HeaderComponent);
