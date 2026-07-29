import { useState, useEffect, memo } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Menu, X, LogOut, User, Home, Calendar, CreditCard,
  Video, Image, FileText, Download, Bot,
  GraduationCap, Heart, Sun, Moon, Star, TrendingUp, MoreHorizontal, Wand2, PanelLeft
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
import { SidebarNav } from "./SidebarNav";

import { cn } from "@/lib/utils";
import { FabricaUpgradeModal } from "@/components/fabrica/FabricaUpgradeModal";
import { hasEliteAccess } from "@/lib/planAccess";
import { useSidebar } from "@/contexts/SidebarContext";

type CategoryType = 'videos' | 'feed' | 'stories' | 'captions' | 'downloads' | 'tools' | 'videoaula' | 'favorites';

// Flag to show/hide "Próximo Nível" based on language

interface HeaderProps {
  onCategoryChange?: (category: CategoryType) => void;
}

const headerResourceItems = [
  { to: "/minha-conta", label: "Minha Conta", icon: User },
] as const;

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
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:hidden">
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
          <Link to={isESRoute ? "/es" : "/"} className={cn("flex items-center gap-3 hover:opacity-80 transition-opacity shrink-0 min-w-0", !isCollapsed ? "md:hidden" : "md:flex")}>
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

          {/* Desktop Navigation - Simplificado e Despoluído (Menu Principal transferido para o Menu Lateral) */}
          <nav className="hidden md:flex items-center gap-2">


            {/* Theme Toggle & Language - Hidden on desktop when sidebar is open */}
            <div className={cn("items-center gap-2", !isCollapsed ? "hidden" : "hidden md:flex")}>
              <ThemeToggle />
              <LanguageSwitcher variant="desktop" />
            </div>

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

                <div className="border-t my-1" />
                {headerResourceItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <DropdownMenuItem key={item.to} onClick={() => navigate(item.to)} className="cursor-pointer">
                      <Icon className="w-4 h-4 mr-2 text-muted-foreground" />
                      {item.label}
                    </DropdownMenuItem>
                  );
                })}
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
                {isOpen ? <X className="h-5 w-5 text-amber-500" /> : <Menu className="h-5 w-5" />}
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[285px] sm:w-[320px] p-0 bg-background text-foreground border-l border-border shadow-2xl flex flex-col">
              {/* Cabeçalho Fixo */}
              <div className="flex items-center gap-2 px-4 py-3 border-b border-border shrink-0 pr-12">
                <img src={logoImage} alt="Canva Viagem" className="h-8 w-8 rounded-lg object-cover" />
                <div>
                  <p className="text-sm font-black text-foreground leading-tight">Canva Viagem</p>
                  <p className="text-[10px] text-amber-500 font-bold uppercase tracking-wider -mt-0.5">Menu</p>
                </div>
              </div>

              <div className="flex-1 overflow-hidden relative">
                <SidebarNav 
                  isMobile 
                  onCategoryChange={onCategoryChange} 
                  onMobileNavClick={() => setIsOpen(false)} 
                />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </header>

      <FabricaUpgradeModal open={fabricaUpgradeOpen} onOpenChange={setFabricaUpgradeOpen} />
    </>
  );
};
export const Header = memo(HeaderComponent);
