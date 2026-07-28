import { useState, memo } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { 
  Home, Bot, Wand2, Calendar, Image, GraduationCap, Heart, 
  FileText, CreditCard, User, LogOut, Video, Megaphone,
  Download, ChevronDown, ChevronRight, BookmarkCheck, LayoutGrid,
  TrendingUp, Crown, MessageCircle, Star, MousePointerClick, Globe, Layers, Users
} from "lucide-react";
import logoImage from "@/assets/logo.png";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { ProgressBar } from "@/components/ProgressBar";
import { hasEliteAccess } from "@/lib/planAccess";
import { FabricaUpgradeModal } from "@/components/fabrica/FabricaUpgradeModal";
import { FabricaUpgradeModalES } from "@/components/fabrica/FabricaUpgradeModalES";
import { useLanguage } from "@/contexts/LanguageContext";
import { CategoryType } from "@/components/canva/CategoryNav";
import { useFabricaMetrics } from "@/hooks/useFabricaMetrics";
import { useSidebar } from "@/contexts/SidebarContext";

const cn = (...classes: Array<string | false | null | undefined>) => classes.filter(Boolean).join(" ");

interface SidebarNavProps {
  activeCategory?: CategoryType;
  onCategoryChange?: (category: CategoryType) => void;
}

const SidebarNavComponent = ({ activeCategory, onCategoryChange }: SidebarNavProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut, subscription, isAdmin } = useAuth();
  const { t, language } = useLanguage();
  const [fabricaUpgradeOpen, setFabricaUpgradeOpen] = useState(false);
  const { newLeadsCount } = useFabricaMetrics();
  const { isCollapsed, setIsCollapsed } = useSidebar();

  const isElite = hasEliteAccess(subscription);
  const isESRoute = location.pathname.startsWith('/es');
  const homeRoute = isESRoute ? "/es" : "/";

  const handleNavClick = (category?: CategoryType, path?: string, requiresElite?: boolean) => {
    window.scrollTo({ top: 0, behavior: 'smooth' });

    if (requiresElite) {
      if (!isElite && !isAdmin) {
        setFabricaUpgradeOpen(true);
        return;
      }
    }

    if (category) {
      if (onCategoryChange) {
        onCategoryChange(category);
      }
      if (location.pathname !== homeRoute || !onCategoryChange) {
        navigate(homeRoute, { state: { category } });
      }
    } else if (path) {
      navigate(path);
    }
  };

  const NavButton = ({ 
    onClick, 
    isActive, 
    icon: Icon, 
    label, 
    activeColorClass = "text-slate-900 dark:text-white", 
    inactiveColorClass = "text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300",
    badge
  }: { 
    onClick: () => void, 
    isActive: boolean, 
    icon: any, 
    label: string, 
    activeColorClass?: string, 
    inactiveColorClass?: string,
    badge?: React.ReactNode
  }) => (
    <button
      onClick={onClick}
      title={isCollapsed ? label : undefined}
      className={cn(
        "w-full flex items-center px-3 py-2.5 rounded-lg text-[13px] font-medium transition-colors group relative",
        isCollapsed ? "justify-center" : "justify-between",
        isActive
          ? "bg-slate-200/50 text-slate-900 font-semibold dark:bg-white/10 dark:text-white"
          : "text-slate-500 hover:text-slate-900 hover:bg-slate-200/30 dark:text-slate-400 dark:hover:text-white dark:hover:bg-white/5"
      )}
    >
      <div className={cn("flex items-center", !isCollapsed && "gap-3")}>
        <Icon className={cn(
          "w-[18px] h-[18px] shrink-0 transition-colors",
          isActive ? activeColorClass : inactiveColorClass
        )} />
        {!isCollapsed && <span>{label}</span>}
      </div>
      {badge}
    </button>
  );

  return (
    <>
      <aside className={cn(
        "hidden md:flex flex-col fixed left-0 top-0 bottom-0 bg-[#F9FAFB] dark:bg-[#18191B] backdrop-blur-3xl border-r border-slate-200 dark:border-white/[0.05] text-slate-800 dark:text-white z-50 select-none transition-all duration-300",
        isCollapsed ? "w-[72px]" : "w-64"
      )}>
        {/* Logo Topo e Botão Minimizar */}
        <div className={cn("p-4 border-b border-slate-200 dark:border-white/10 flex items-center shrink-0", isCollapsed ? "justify-center" : "justify-between gap-3")}>
          <Link to={homeRoute} className="flex items-center gap-3 group min-w-0" title={isCollapsed ? "Canva Viagem" : undefined}>
            <img
              src={logoImage}
              alt="Canva Viagem"
              className={cn("rounded-xl shadow-lg group-hover:scale-105 transition-transform object-cover shrink-0", isCollapsed ? "h-8 w-8" : "h-10 w-10")}
            />
            {!isCollapsed && (
              <div className="flex flex-col min-w-0">
                <span className="text-[17px] font-black text-slate-900 dark:text-white tracking-tight whitespace-nowrap leading-tight">
                  Canva Viagem
                </span>
                <span className="text-[10px] text-blue-600 dark:text-amber-400 font-extrabold tracking-widest uppercase -mt-0.5">
                  Portal Principal
                </span>
              </div>
            )}
          </Link>
          {!isCollapsed && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsCollapsed(true)}
              title="Minimizar Menu Lateral"
              className="h-8 w-8 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 shrink-0 text-slate-500 dark:text-slate-400 ml-auto"
            >
              <ChevronDown className="h-4 w-4 rotate-90" />
            </Button>
          )}
        </div>

        {/* Itens de Navegação com Scrollbar invisível */}
        <div className="flex-1 overflow-y-auto px-3.5 py-4 space-y-1 [C::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          
          <NavButton 
            onClick={() => handleNavClick('all')}
            isActive={activeCategory === 'all' || (!activeCategory && location.pathname === homeRoute)}
            icon={LayoutGrid}
            label="Início"
          />

          <NavButton 
            onClick={() => handleNavClick(undefined, isESRoute ? "/es/fabrica" : "/fabrica", true)}
            isActive={location.pathname === '/fabrica' || location.pathname === '/es/fabrica'}
            icon={Wand2}
            label="Fábrica"
            activeColorClass="text-violet-500"
            inactiveColorClass="text-slate-400 group-hover:text-violet-500"
          />

          <NavButton 
            onClick={() => handleNavClick(undefined, "/fabrica/anuncio", true)}
            isActive={location.pathname.includes('/fabrica/anuncio')}
            icon={MousePointerClick}
            label="Criador de Anúncios"
            activeColorClass="text-[#00D4FF]"
            inactiveColorClass="text-slate-400 group-hover:text-[#00D4FF]"
          />

          <NavButton 
            onClick={() => handleNavClick(undefined, "/fabrica/carrossel", true)}
            isActive={location.pathname.includes('/fabrica/carrossel')}
            icon={Layers}
            label="Gerador de Carrosséis"
            activeColorClass="text-[#F72585]"
            inactiveColorClass="text-slate-400 group-hover:text-[#F72585]"
          />

          <NavButton 
            onClick={() => handleNavClick(undefined, "/fabrica/site", true)}
            isActive={location.pathname.includes('/fabrica/site')}
            icon={Globe}
            label="Construtor de Sites"
            activeColorClass="text-[#FF9900]"
            inactiveColorClass="text-slate-400 group-hover:text-[#FF9900]"
          />

          <NavButton 
            onClick={() => handleNavClick(undefined, "/fabrica/crm", true)}
            isActive={location.pathname.includes('/fabrica/crm')}
            icon={Users}
            label="CRM e Leads"
            activeColorClass="text-emerald-500"
            inactiveColorClass="text-slate-400 group-hover:text-emerald-500"
            badge={
              newLeadsCount > 0 ? (
                isCollapsed ? (
                  <span className="absolute top-1 right-1 bg-red-500 text-white font-bold text-[9px] w-4 h-4 flex items-center justify-center rounded-full animate-pulse shadow-md">
                    {newLeadsCount > 9 ? '9+' : newLeadsCount}
                  </span>
                ) : (
                  <span className="bg-red-500 text-white font-extrabold text-[9px] px-2 py-0.5 rounded-full animate-pulse shadow-md">
                    {newLeadsCount}
                  </span>
                )
              ) : null
            }
          />

          <NavButton 
            onClick={() => handleNavClick('videos')}
            isActive={activeCategory === 'videos' && location.pathname === homeRoute}
            icon={Video}
            label="Vídeos Reels"
          />

          <NavButton 
            onClick={() => handleNavClick('feed')}
            isActive={activeCategory === 'feed' && location.pathname === homeRoute}
            icon={Image}
            label="Feed & Stories"
          />

          <NavButton 
            onClick={() => handleNavClick('offers')}
            isActive={activeCategory === 'offers' && location.pathname === homeRoute}
            icon={Megaphone}
            label="Ofertas & Legendas"
          />

          <NavButton 
            onClick={() => handleNavClick('videoaula')}
            isActive={activeCategory === 'videoaula' && location.pathname === homeRoute}
            icon={GraduationCap}
            label="Videoaulas"
          />

          <NavButton 
            onClick={() => handleNavClick('downloads')}
            isActive={activeCategory === 'downloads' && location.pathname === homeRoute}
            icon={Download}
            label="Pacotes de Vídeos & Drive"
          />

          <NavButton 
            onClick={() => handleNavClick(undefined, isESRoute ? "/es/downloads" : "/downloads")}
            isActive={location.pathname.includes('/downloads') && !location.pathname.includes('/es/downloads')}
            icon={Download}
            label="Central de Downloads"
          />

          <NavButton 
            onClick={() => handleNavClick('tools')}
            isActive={activeCategory === 'tools' && location.pathname === homeRoute}
            icon={Bot}
            label="Ferramentas de IA"
          />
          
          <NavButton 
            onClick={() => handleNavClick(undefined, "/vendedor-ia")}
            isActive={location.pathname.includes('/vendedor-ia')}
            icon={MessageCircle}
            label="Vendedor IA"
            activeColorClass="text-blue-500 dark:text-blue-400"
            inactiveColorClass="text-slate-400 group-hover:text-blue-500 dark:group-hover:text-blue-400"
          />

          {language === 'pt' && (
            <NavButton 
              onClick={() => handleNavClick(undefined, "/proximo-nivel")}
              isActive={location.pathname.includes('/proximo-nivel')}
              icon={Star}
              label="Curso Tráfego Pago"
              activeColorClass="text-[#FFD700]"
              inactiveColorClass="text-[#FFC107] group-hover:text-[#FFD700]"
            />
          )}

          <NavButton 
            onClick={() => handleNavClick(undefined, isESRoute ? "/es/calendar" : "/calendar")}
            isActive={location.pathname.includes('/calendar')}
            icon={Calendar}
            label="Calendário"
          />

          <NavButton 
            onClick={() => handleNavClick('favorites')}
            isActive={activeCategory === 'favorites' && location.pathname === homeRoute}
            icon={Heart}
            label="Favoritos"
          />

          {user && (
            <NavButton 
              onClick={() => handleNavClick(undefined, isESRoute ? "/es/progresso" : "/progresso")}
              isActive={location.pathname.includes('/progresso')}
              icon={TrendingUp}
              label="Meu Progresso"
            />
          )}

          <NavButton 
            onClick={() => handleNavClick(undefined, isESRoute ? "/es/inicio" : "/inicio")}
            isActive={location.pathname === (isESRoute ? "/es/inicio" : "/inicio")}
            icon={CreditCard}
            label="Planos e Upgrade"
          />

          <NavButton 
            onClick={() => handleNavClick(undefined, "/blog")}
            isActive={location.pathname.includes('/blog')}
            icon={BookmarkCheck}
            label="Posts do Blog"
          />

          <NavButton 
            onClick={() => window.open("https://api.whatsapp.com/send/?phone=5585998458995&text=Ol%C3%A1%2C+quero+suporte+do+Canva+Viagem", "_blank")}
            isActive={false}
            icon={MessageCircle}
            label="Suporte WhatsApp"
            inactiveColorClass="text-slate-400 group-hover:text-emerald-500"
          />

          <NavButton 
            onClick={() => handleNavClick(undefined, !user ? "/auth" : "/minha-conta")}
            isActive={location.pathname.includes('/minha-conta') || location.pathname.includes('/auth')}
            icon={User}
            label="Minha Conta"
          />

        </div>

        {/* Rodapé do Menu Lateral */}
        <div className="p-3 border-t border-slate-200 dark:border-white/[0.05] bg-[#F9FAFB] dark:bg-[#18191B] flex flex-col gap-2 shrink-0">
          {!isCollapsed ? (
            <>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ThemeToggle />
                  <LanguageSwitcher variant="desktop" />
                </div>
                
                {user ? (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={signOut}
                    className="h-8 w-8 text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg"
                    title={t('header.logout') || "Sair"}
                  >
                    <LogOut className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => navigate('/auth')}
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-lg h-8 px-3 text-xs"
                  >
                    Login
                  </Button>
                )}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsCollapsed(true)}
                className="w-full h-8 border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/10 text-slate-500 dark:text-slate-400 font-medium rounded-lg text-xs flex items-center justify-center gap-1.5"
              >
                <ChevronDown className="h-3.5 w-3.5 rotate-90" />
                Minimizar Menu
              </Button>
            </>
          ) : (
            <>
              {user ? (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={signOut}
                  className="w-full h-10 text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg"
                  title={t('header.logout') || "Sair"}
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              ) : (
                <Button
                  variant="default"
                  size="icon"
                  onClick={() => navigate('/auth')}
                  title="Login"
                  className="w-full h-10 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-lg"
                >
                  <User className="h-4 w-4" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsCollapsed(false)}
                title="Abrir Menu Lateral"
                className="w-full h-10 hover:bg-slate-100 dark:hover:bg-white/10 text-slate-500 dark:text-slate-400 rounded-lg"
              >
                <ChevronDown className="h-4 w-4 -rotate-90" />
              </Button>
            </>
          )}
        </div>
      </aside>

      {language === "es" ? (
        <FabricaUpgradeModalES open={fabricaUpgradeOpen} onOpenChange={setFabricaUpgradeOpen} />
      ) : (
        <FabricaUpgradeModal open={fabricaUpgradeOpen} onOpenChange={setFabricaUpgradeOpen} />
      )}
    </>
  );
};

export const SidebarNav = memo(SidebarNavComponent);
