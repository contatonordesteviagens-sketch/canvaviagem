import { useState, memo } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { 
  Home, Bot, Wand2, Calendar, Image, GraduationCap, Heart, 
  FileText, CreditCard, User, LogOut, Video, Megaphone,
  Download, ChevronDown, ChevronRight, BookmarkCheck, LayoutGrid,
  TrendingUp, Crown, MessageCircle
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

  // Controle de seções recolhíveis (acordeão) para manter o menu limpo e organizado
  const [openSections, setOpenSections] = useState({
    principal: true,
    conteudos: true,
    gestao: true
  });

  const toggleSection = (sectionKey: 'principal' | 'conteudos' | 'gestao') => {
    setOpenSections(prev => ({ ...prev, [sectionKey]: !prev[sectionKey] }));
  };

  const isESRoute = location.pathname.startsWith('/es');
  const homeRoute = isESRoute ? "/es" : "/";

  const handleNavClick = (category?: CategoryType, path?: string, requiresElite?: boolean) => {
    window.scrollTo({ top: 0, behavior: 'smooth' });

    if (requiresElite) {
      const isElite = hasEliteAccess(subscription);
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

  if (isCollapsed) {
    return (
      <>
        <button
          onClick={() => setIsCollapsed(false)}
          title="Abrir Menu Lateral"
          className="hidden md:flex fixed left-4 top-20 md:top-6 z-[80] bg-blue-600 hover:bg-blue-700 text-white shadow-xl rounded-xl px-3.5 py-2 items-center gap-2 font-black text-xs transition-all hover:scale-105 cursor-pointer border border-white/20 select-none"
        >
          <LayoutGrid className="w-4 h-4" />
          <span>Abrir Menu</span>
        </button>
        {language === "es" ? (
          <FabricaUpgradeModalES open={fabricaUpgradeOpen} onOpenChange={setFabricaUpgradeOpen} />
        ) : (
          <FabricaUpgradeModal open={fabricaUpgradeOpen} onOpenChange={setFabricaUpgradeOpen} />
        )}
      </>
    );
  }

  return (
    <>
      <aside className="hidden md:flex flex-col w-64 fixed left-0 top-0 bottom-0 bg-[#F9FAFB] dark:bg-[#18191B] backdrop-blur-3xl border-r border-slate-200 dark:border-white/[0.05] text-slate-800 dark:text-white z-50 select-none">
        {/* Logo Topo e Botão Minimizar */}
        <div className="p-4 border-b border-slate-200 dark:border-white/10 flex items-center justify-between gap-3 shrink-0">
          <Link to={homeRoute} className="flex items-center gap-3 group min-w-0">
            <img
              src={logoImage}
              alt="Canva Viagem"
              className="h-10 w-10 rounded-xl shadow-lg group-hover:scale-105 transition-transform object-cover shrink-0"
            />
            <div className="flex flex-col min-w-0">
              <span className="text-[17px] font-black text-slate-900 dark:text-white tracking-tight whitespace-nowrap leading-tight">
                Canva Viagem
              </span>
              <span className="text-[10px] text-blue-600 dark:text-amber-400 font-extrabold tracking-widest uppercase -mt-0.5">
                Portal Principal
              </span>
            </div>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsCollapsed(true)}
            title="Minimizar Menu Lateral"
            className="h-8 w-8 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 shrink-0 text-slate-500 dark:text-slate-400 ml-auto"
          >
            <ChevronDown className="h-4 w-4 rotate-90" />
          </Button>
        </div>

        {/* Itens de Navegação com Scrollbar invisível */}
        <div className="flex-1 overflow-y-auto px-3.5 py-4 space-y-5 [C::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          
          {/* SEÇÃO 1: PRINCIPAL */}
          <div className="space-y-1">
            <button
              onClick={() => toggleSection('principal')}
              className="w-full flex items-center justify-between text-[10px] font-black text-slate-500 dark:text-white/50 tracking-wider uppercase px-2.5 py-1.5 hover:text-slate-900 dark:hover:text-white/80 transition-colors"
            >
              <span>PRINCIPAL & IA</span>
              {openSections.principal ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
            </button>

            {openSections.principal && (
              <div className="space-y-1 pt-0.5">
                <button
                  onClick={() => handleNavClick('all')}
                  className={getButtonClass(activeCategory === 'all' || (!activeCategory && location.pathname === homeRoute))}
                >
                  <div className="flex items-center gap-3">
                    <LayoutGrid className={getIconClass(activeCategory === 'all' || (!activeCategory && location.pathname === homeRoute))} />
                    <span>Início (Tudo)</span>
                  </div>
                </button>

                <button
                  onClick={() => handleNavClick(undefined, isESRoute ? "/es/fabrica" : "/fabrica", true)}
                  className={cn(
                    "w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-[13px] font-medium transition-colors group",
                    location.pathname.includes('/fabrica')
                      ? "bg-slate-200/50 text-slate-900 font-semibold dark:bg-white/10 dark:text-white"
                      : "text-slate-500 hover:text-slate-900 hover:bg-slate-200/30 dark:text-slate-400 dark:hover:text-white dark:hover:bg-white/5"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <Wand2 className={cn(
                      "w-[18px] h-[18px] shrink-0 transition-colors",
                      location.pathname.includes('/fabrica') ? "text-violet-500" : "text-violet-500/70 group-hover:text-violet-500"
                    )} />
                    <span className="leading-snug">Fábrica de Destinos</span>
                  </div>
                  <span className="text-[9px] px-1.5 py-0.5 rounded flex items-center gap-1 bg-violet-100 text-violet-700 dark:bg-violet-500/20 dark:text-violet-300 font-extrabold uppercase shrink-0">
                    <Crown className="w-2.5 h-2.5" /> PRO
                  </span>
                </button>

                {/* Ferramentas de IA */}
                <button
                  onClick={() => handleNavClick('tools')}
                  className={cn(
                    "w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-[13px] font-medium transition-colors group",
                    activeCategory === 'tools' && location.pathname === homeRoute
                      ? "bg-slate-200/50 text-slate-900 font-semibold dark:bg-white/10 dark:text-white"
                      : "text-slate-500 hover:text-slate-900 hover:bg-slate-200/30 dark:text-slate-400 dark:hover:text-white dark:hover:bg-white/5"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <Bot className={cn(
                      "w-[18px] h-[18px] shrink-0 transition-colors",
                      activeCategory === 'tools' ? "text-slate-900 dark:text-white" : "text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300"
                    )} />
                    <span>Ferramentas de IA</span>
                  </div>
                </button>

                {/* Datas & Calendário */}
                <button
                  onClick={() => handleNavClick(undefined, isESRoute ? "/es/calendar" : "/calendar")}
                  className={cn(
                    "w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-[13px] font-medium transition-colors group",
                    location.pathname.includes('/calendar')
                      ? "bg-slate-200/50 text-slate-900 font-semibold dark:bg-white/10 dark:text-white"
                      : "text-slate-500 hover:text-slate-900 hover:bg-slate-200/30 dark:text-slate-400 dark:hover:text-white dark:hover:bg-white/5"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <Calendar className={cn(
                      "w-[18px] h-[18px] shrink-0 transition-colors",
                      location.pathname.includes('/calendar') ? "text-slate-900 dark:text-white" : "text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300"
                    )} />
                    <span>Datas & Calendário</span>
                  </div>
                </button>
              </div>
            )}
          </div>

          {/* SEÇÃO 2: CONTEÚDOS & MATERIAIS (Acordeão Minimizável) */}
          <div className="space-y-1">
            <button
              onClick={() => toggleSection('conteudos')}
              className="w-full flex items-center justify-between text-[10px] font-black text-slate-500 dark:text-white/50 tracking-wider uppercase px-2.5 py-1.5 hover:text-slate-900 dark:hover:text-white/80 transition-colors"
            >
              <span>CONTEÚDOS & MATERIAIS</span>
              {openSections.conteudos ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
            </button>

            {openSections.conteudos && (
              <div className="space-y-1 pt-0.5">
                {/* Vídeos Reels */}
                <button
                  onClick={() => handleNavClick('videos')}
                  className={cn(
                    "w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-[13px] font-medium transition-colors group",
                    activeCategory === 'videos' && location.pathname === homeRoute
                      ? "bg-slate-200/50 text-slate-900 font-semibold dark:bg-white/10 dark:text-white"
                      : "text-slate-500 hover:text-slate-900 hover:bg-slate-200/30 dark:text-slate-400 dark:hover:text-white dark:hover:bg-white/5"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <Video className={cn(
                      "w-[18px] h-[18px] shrink-0 transition-colors",
                      activeCategory === 'videos' ? "text-slate-900 dark:text-white" : "text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300"
                    )} />
                    <span>Vídeos Reels</span>
                  </div>
                </button>

                {/* Feed & Stories */}
                <button
                  onClick={() => handleNavClick('feed')}
                  className={cn(
                    "w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-[13px] font-medium transition-colors group",
                    activeCategory === 'feed' && location.pathname === homeRoute
                      ? "bg-slate-200/50 text-slate-900 font-semibold dark:bg-white/10 dark:text-white"
                      : "text-slate-500 hover:text-slate-900 hover:bg-slate-200/30 dark:text-slate-400 dark:hover:text-white dark:hover:bg-white/5"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <Image className={cn(
                      "w-[18px] h-[18px] shrink-0 transition-colors",
                      activeCategory === 'feed' ? "text-slate-900 dark:text-white" : "text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300"
                    )} />
                    <span>Feed & Stories</span>
                  </div>
                </button>

                {/* Ofertas e Legendas */}
                <button
                  onClick={() => handleNavClick('offers')}
                  className={cn(
                    "w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-[13px] font-medium transition-colors group",
                    activeCategory === 'offers' && location.pathname === homeRoute
                      ? "bg-slate-200/50 text-slate-900 font-semibold dark:bg-white/10 dark:text-white"
                      : "text-slate-500 hover:text-slate-900 hover:bg-slate-200/30 dark:text-slate-400 dark:hover:text-white dark:hover:bg-white/5"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <Megaphone className={cn(
                      "w-[18px] h-[18px] shrink-0 transition-colors",
                      activeCategory === 'offers' ? "text-slate-900 dark:text-white" : "text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300"
                    )} />
                    <span>Ofertas & Legendas</span>
                  </div>
                </button>

                {/* Aulas & Tutoriais */}
                <button
                  onClick={() => handleNavClick('videoaula')}
                  className={cn(
                    "w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-[13px] font-medium transition-colors group",
                    activeCategory === 'videoaula' && location.pathname === homeRoute
                      ? "bg-slate-200/50 text-slate-900 font-semibold dark:bg-white/10 dark:text-white"
                      : "text-slate-500 hover:text-slate-900 hover:bg-slate-200/30 dark:text-slate-400 dark:hover:text-white dark:hover:bg-white/5"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <GraduationCap className={cn(
                      "w-[18px] h-[18px] shrink-0 transition-colors",
                      activeCategory === 'videoaula' ? "text-slate-900 dark:text-white" : "text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300"
                    )} />
                    <span>Aulas & Tutoriais</span>
                  </div>
                </button>

                {/* Downloads & Materiais */}
                <button
                  onClick={() => handleNavClick('downloads')}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-[13.5px] font-semibold transition-all group ${
                    activeCategory === 'downloads' && location.pathname === homeRoute
                      ? "bg-blue-50 text-blue-600 border border-blue-200 shadow-sm dark:bg-gradient-to-r dark:from-blue-600/25 dark:to-indigo-600/25 dark:text-white dark:border-blue-500/40 dark:shadow-[0_0_20px_rgba(59,130,246,0.15)]"
                      : "text-slate-700 hover:text-slate-900 hover:bg-slate-100 dark:text-white/70 dark:hover:text-white dark:hover:bg-white/[0.06]"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Download className={`w-4 h-4 shrink-0 transition-colors ${
                      activeCategory === 'downloads' ? "text-blue-600 dark:text-blue-400" : "text-slate-400 group-hover:text-blue-600 dark:text-white/45 dark:group-hover:text-amber-400"
                    }`} />
                    <span>{isESRoute ? "Paquetes de Videos & Drive" : "Pacotes de Vídeos & Drive"}</span>
                  </div>
                </button>

                {/* Central de Downloads Diretos */}
                <button
                  onClick={() => handleNavClick(undefined, isESRoute ? "/es/downloads" : "/downloads")}
                  className={cn(
                    "w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-[13px] font-medium transition-colors group",
                    location.pathname.includes('/downloads')
                      ? "bg-slate-200/50 text-slate-900 font-semibold dark:bg-white/10 dark:text-white"
                      : "text-slate-500 hover:text-slate-900 hover:bg-slate-200/30 dark:text-slate-400 dark:hover:text-white dark:hover:bg-white/5"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <Download className={cn(
                      "w-[18px] h-[18px] shrink-0 transition-colors",
                      location.pathname.includes('/downloads') ? "text-slate-900 dark:text-white" : "text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300"
                    )} />
                    <span>{isESRoute ? "Central de Descargas Diretas" : "Central de Downloads Diretos"}</span>
                  </div>
                </button>

                {/* Contratos Prontos */}
                <button
                  onClick={() => handleNavClick('contracts')}
                  className={cn(
                    "w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-[13px] font-medium transition-colors group",
                    activeCategory === 'contracts' && location.pathname === homeRoute
                      ? "bg-slate-200/50 text-slate-900 font-semibold dark:bg-white/10 dark:text-white"
                      : "text-slate-500 hover:text-slate-900 hover:bg-slate-200/30 dark:text-slate-400 dark:hover:text-white dark:hover:bg-white/5"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <FileText className={cn(
                      "w-[18px] h-[18px] shrink-0 transition-colors",
                      activeCategory === 'contracts' ? "text-slate-900 dark:text-white" : "text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300"
                    )} />
                    <span>Contratos Prontos</span>
                  </div>
                </button>

                {/* Favoritos */}
                <button
                  onClick={() => handleNavClick('favorites')}
                  className={cn(
                    "w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-[13px] font-medium transition-colors group",
                    activeCategory === 'favorites' && location.pathname === homeRoute
                      ? "bg-slate-200/50 text-slate-900 font-semibold dark:bg-white/10 dark:text-white"
                      : "text-slate-500 hover:text-slate-900 hover:bg-slate-200/30 dark:text-slate-400 dark:hover:text-white dark:hover:bg-white/5"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <Heart className={cn(
                      "w-[18px] h-[18px] shrink-0 transition-colors",
                      activeCategory === 'favorites' ? "text-rose-500 dark:text-rose-400" : "text-slate-400 group-hover:text-rose-500 dark:group-hover:text-rose-400"
                    )} />
                    <span>Meus Favoritos</span>
                  </div>
                </button>
              </div>
            )}
          </div>

          {/* SEÇÃO 3: GESTÃO & ESTRATÉGIA (Acordeão Minimizável) */}
          <div className="space-y-1">
            <button
              onClick={() => toggleSection('gestao')}
              className="w-full flex items-center justify-between text-[10px] font-black text-slate-500 dark:text-white/50 tracking-wider uppercase px-2.5 py-1.5 hover:text-slate-900 dark:hover:text-white/80 transition-colors"
            >
              <span>GESTÃO & ESTRATÉGIA</span>
              {openSections.gestao ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
            </button>

            {openSections.gestao && (
              <div className="space-y-1 pt-0.5">
                {/* Blog de Estratégias */}
                <button
                  onClick={() => handleNavClick(undefined, "/blog")}
                  className={cn(
                    "w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-[13px] font-medium transition-colors group",
                    location.pathname.includes('/blog')
                      ? "bg-slate-200/50 text-slate-900 font-semibold dark:bg-white/10 dark:text-white"
                      : "text-slate-500 hover:text-slate-900 hover:bg-slate-200/30 dark:text-slate-400 dark:hover:text-white dark:hover:bg-white/5"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <BookmarkCheck className={cn(
                      "w-[18px] h-[18px] shrink-0 transition-colors",
                      location.pathname.includes('/blog') ? "text-slate-900 dark:text-white" : "text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300"
                    )} />
                    <span>Blog de Estratégias</span>
                  </div>
                </button>

                {/* Planos & Upgrade - Direciona para /inicio */}
                <button
                  onClick={() => handleNavClick(undefined, isESRoute ? "/es/inicio" : "/inicio")}
                  className={cn(
                    "w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-[13px] font-medium transition-colors group",
                    location.pathname === (isESRoute ? "/es/inicio" : "/inicio")
                      ? "bg-slate-200/50 text-slate-900 font-semibold dark:bg-white/10 dark:text-white"
                      : "text-slate-500 hover:text-slate-900 hover:bg-slate-200/30 dark:text-slate-400 dark:hover:text-white dark:hover:bg-white/5"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <CreditCard className={cn(
                      "w-[18px] h-[18px] shrink-0 transition-colors",
                      location.pathname === (isESRoute ? "/es/inicio" : "/inicio") ? "text-amber-500" : "text-amber-500/70 group-hover:text-amber-500"
                    )} />
                    <span className="leading-snug">Planos & Upgrade</span>
                  </div>
                  <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400 font-extrabold shrink-0 shadow-sm uppercase">
                    Elite
                  </span>
                </button>

                {/* Próximo Nível - Apenas em PT */}
                {language === 'pt' && (
                  <button
                    onClick={() => handleNavClick(undefined, "/proximo-nivel")}
                    className={cn(
                      "w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-[13px] font-medium transition-colors group",
                      location.pathname.includes('/proximo-nivel')
                        ? "bg-slate-200/50 text-slate-900 font-semibold dark:bg-white/10 dark:text-white"
                        : "text-slate-500 hover:text-slate-900 hover:bg-slate-200/30 dark:text-slate-400 dark:hover:text-white dark:hover:bg-white/5"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <Star className={cn(
                        "w-[18px] h-[18px] shrink-0 transition-colors",
                        location.pathname.includes('/proximo-nivel') ? "text-amber-500" : "text-amber-500/70 group-hover:text-amber-500"
                      )} />
                      <span>Turbo</span>
                    </div>
                  </button>
                )}

                {/* Categoria somente da Fábrica / CRM Leads */}
                <button
                  onClick={() => handleNavClick(undefined, "/fabrica", true)}
                  className={cn(
                    "w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-[13px] font-medium transition-colors group",
                    location.pathname.includes('/fabrica')
                      ? "bg-slate-200/50 text-slate-900 font-semibold dark:bg-white/10 dark:text-white"
                      : "text-slate-500 hover:text-slate-900 hover:bg-slate-200/30 dark:text-slate-400 dark:hover:text-white dark:hover:bg-white/5"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <Wand2 className={cn(
                      "w-[18px] h-[18px] shrink-0 transition-colors",
                      location.pathname.includes('/fabrica') ? "text-violet-500" : "text-violet-500/70 group-hover:text-violet-500"
                    )} />
                    <span>Fábrica & CRM Leads</span>
                  </div>
                  {newLeadsCount > 0 ? (
                    <span className="bg-red-500 text-white font-extrabold text-[9px] px-2 py-0.5 rounded-full animate-pulse shadow-md">
                      {newLeadsCount}
                    </span>
                  ) : (
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-violet-100 text-violet-700 dark:bg-violet-500/20 dark:text-violet-300 font-extrabold uppercase shrink-0">
                      CRM
                    </span>
                  )}
                </button>

                {/* Progresso & Aulas */}
                {user && (
                  <button
                    onClick={() => handleNavClick(undefined, isESRoute ? "/es/progresso" : "/progresso")}
                    className={cn(
                      "w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-[13px] font-medium transition-colors group",
                      location.pathname.includes('/progresso')
                        ? "bg-slate-200/50 text-slate-900 font-semibold dark:bg-white/10 dark:text-white"
                        : "text-slate-500 hover:text-slate-900 hover:bg-slate-200/30 dark:text-slate-400 dark:hover:text-white dark:hover:bg-white/5"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <TrendingUp className={cn(
                        "w-[18px] h-[18px] shrink-0 transition-colors",
                        location.pathname.includes('/progresso') ? "text-slate-900 dark:text-white" : "text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300"
                      )} />
                      <span>Meu Progresso</span>
                    </div>
                  </button>
                )}

                {/* Suporte WhatsApp */}
                <button
                  onClick={() => window.open("https://api.whatsapp.com/send/?phone=5585998458995&text=Ol%C3%A1%2C+quero+suporte+do+Canva+Viagem", "_blank")}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-[13px] font-medium transition-colors group text-slate-500 hover:text-slate-900 hover:bg-slate-200/30 dark:text-slate-400 dark:hover:text-white dark:hover:bg-white/5"
                >
                  <div className="flex items-center gap-3">
                    <MessageCircle className="w-[18px] h-[18px] shrink-0 text-emerald-500 dark:text-emerald-400 group-hover:text-emerald-600" />
                    <span>Suporte WhatsApp</span>
                  </div>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 font-extrabold uppercase shrink-0">
                    Online
                  </span>
                </button>

                {/* Minha Conta */}
                <button
                  onClick={() => handleNavClick(undefined, !user ? "/auth" : "/minha-conta")}
                  className={cn(
                    "w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-[13px] font-medium transition-colors group",
                    location.pathname.includes('/minha-conta') || location.pathname.includes('/auth')
                      ? "bg-slate-200/50 text-slate-900 font-semibold dark:bg-white/10 dark:text-white"
                      : "text-slate-500 hover:text-slate-900 hover:bg-slate-200/30 dark:text-slate-400 dark:hover:text-white dark:hover:bg-white/5"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <User className={cn(
                      "w-[18px] h-[18px] shrink-0 transition-colors",
                      location.pathname.includes('/minha-conta') || location.pathname.includes('/auth') ? "text-slate-900 dark:text-white" : "text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300"
                    )} />
                    <span>Minha Conta</span>
                  </div>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Rodapé do Menu Lateral */}
        <div className="p-4 border-t border-slate-200 dark:border-white/[0.05] bg-[#F9FAFB] dark:bg-[#18191B] space-y-3 shrink-0">
          {user && (
            <div className="px-1">
              <ProgressBar compact />
            </div>
          )}

          <div className="flex items-center justify-between px-1">
            <ThemeToggle />
            <LanguageSwitcher variant="desktop" />
          </div>

          {user ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={signOut}
              className="w-full justify-start text-slate-600 hover:text-red-600 hover:bg-red-50 dark:text-white/70 dark:hover:text-red-400 dark:hover:bg-red-500/10 rounded-xl text-xs py-2"
            >
              <LogOut className="h-3.5 w-3.5 mr-2 shrink-0" />
              {t('header.logout') || "Sair da Conta"}
            </Button>
          ) : (
            <Button
              variant="default"
              size="sm"
              onClick={() => navigate('/auth')}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-xl shadow-lg text-xs py-2"
            >
              <User className="h-3.5 w-3.5 mr-2 shrink-0" />
              {t('header.login') || "Fazer Login"}
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsCollapsed(true)}
            className="w-full mt-2 border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/10 text-slate-600 dark:text-slate-300 font-bold rounded-xl text-xs py-2 flex items-center justify-center gap-2"
          >
            <ChevronDown className="h-4 w-4 rotate-90" />
            Minimizar Menu
          </Button>
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
