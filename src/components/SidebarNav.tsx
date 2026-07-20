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

    if (category && onCategoryChange) {
      onCategoryChange(category);
      if (location.pathname !== homeRoute) {
        navigate(homeRoute, { state: { category } });
      }
    } else if (path) {
      navigate(path);
    }
  };

  return (
    <>
      <aside className="hidden md:flex flex-col w-64 fixed left-0 top-0 bottom-0 bg-white dark:bg-[#08090C] backdrop-blur-3xl border-r border-slate-200 dark:border-white/[0.08] text-slate-800 dark:text-white z-50 select-none shadow-2xl">
        {/* Logo Topo */}
        <div className="p-4 border-b border-slate-200 dark:border-white/10 flex items-center gap-3 shrink-0">
          <Link to={homeRoute} className="flex items-center gap-3 group">
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
                {/* Tudo / Início */}
                <button
                  onClick={() => handleNavClick('all')}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-[13.5px] font-semibold transition-all group ${
                    (activeCategory === 'all' || (!activeCategory && location.pathname === homeRoute))
                      ? "bg-blue-50 text-blue-600 border border-blue-200 shadow-sm dark:bg-gradient-to-r dark:from-blue-600/25 dark:to-indigo-600/25 dark:text-white dark:border-blue-500/40 dark:shadow-[0_0_20px_rgba(59,130,246,0.15)]"
                      : "text-slate-700 hover:text-slate-900 hover:bg-slate-100 dark:text-white/70 dark:hover:text-white dark:hover:bg-white/[0.06]"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <LayoutGrid className={`w-4 h-4 shrink-0 transition-colors ${
                      (activeCategory === 'all' || (!activeCategory && location.pathname === homeRoute)) ? "text-blue-600 dark:text-blue-400" : "text-slate-400 group-hover:text-blue-600 dark:text-white/45 dark:group-hover:text-amber-400"
                    }`} />
                    <span>Início (Tudo)</span>
                  </div>
                </button>

                {/* Fábrica de Destinos */}
                <button
                  onClick={() => handleNavClick(undefined, isESRoute ? "/es/fabrica" : "/fabrica", true)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-[13.5px] font-semibold transition-all group ${
                    location.pathname.includes('/fabrica')
                      ? "bg-blue-50 text-blue-600 border border-blue-200 shadow-sm dark:bg-gradient-to-r dark:from-blue-600/25 dark:to-indigo-600/25 dark:text-white dark:border-blue-500/40 dark:shadow-[0_0_20px_rgba(59,130,246,0.15)]"
                      : "text-slate-700 hover:text-slate-900 hover:bg-slate-100 dark:text-white/70 dark:hover:text-white dark:hover:bg-white/[0.06]"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Wand2 className={`w-4 h-4 shrink-0 transition-colors ${
                      location.pathname.includes('/fabrica') ? "text-blue-600 dark:text-blue-400" : "text-amber-500 dark:text-amber-400"
                    }`} />
                    <span className="leading-snug">Fábrica de Destinos</span>
                  </div>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-extrabold shrink-0 shadow-sm">
                    IA Pro
                  </span>
                </button>

                {/* Ferramentas de IA */}
                <button
                  onClick={() => handleNavClick('tools')}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-[13.5px] font-semibold transition-all group ${
                    activeCategory === 'tools' && location.pathname === homeRoute
                      ? "bg-blue-50 text-blue-600 border border-blue-200 shadow-sm dark:bg-gradient-to-r dark:from-blue-600/25 dark:to-indigo-600/25 dark:text-white dark:border-blue-500/40 dark:shadow-[0_0_20px_rgba(59,130,246,0.15)]"
                      : "text-slate-700 hover:text-slate-900 hover:bg-slate-100 dark:text-white/70 dark:hover:text-white dark:hover:bg-white/[0.06]"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Bot className={`w-4 h-4 shrink-0 transition-colors ${
                      activeCategory === 'tools' ? "text-blue-600 dark:text-blue-400" : "text-slate-400 group-hover:text-blue-600 dark:text-white/45 dark:group-hover:text-amber-400"
                    }`} />
                    <span>Ferramentas de IA</span>
                  </div>
                </button>

                {/* Recursos IA & Downloads Diretos */}
                <button
                  onClick={() => handleNavClick(undefined, isESRoute ? "/es/downloads" : "/downloads")}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-[13.5px] font-semibold transition-all group ${
                    location.pathname.includes('/downloads')
                      ? "bg-blue-50 text-blue-600 border border-blue-200 shadow-sm dark:bg-gradient-to-r dark:from-blue-600/25 dark:to-indigo-600/25 dark:text-white dark:border-blue-500/40 dark:shadow-[0_0_20px_rgba(59,130,246,0.15)]"
                      : "text-slate-700 hover:text-slate-900 hover:bg-slate-100 dark:text-white/70 dark:hover:text-white dark:hover:bg-white/[0.06]"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Download className={`w-4 h-4 shrink-0 transition-colors ${
                      location.pathname.includes('/downloads') ? "text-blue-600 dark:text-blue-400" : "text-emerald-500 dark:text-emerald-400 group-hover:text-blue-600"
                    }`} />
                    <span className="leading-snug">Recursos IA (Vídeos Prontos)</span>
                  </div>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-extrabold shrink-0">
                    Direto
                  </span>
                </button>

                {/* Datas & Calendário */}
                <button
                  onClick={() => handleNavClick(undefined, isESRoute ? "/es/calendar" : "/calendar")}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-[13.5px] font-semibold transition-all group ${
                    location.pathname.includes('/calendar')
                      ? "bg-blue-50 text-blue-600 border border-blue-200 shadow-sm dark:bg-gradient-to-r dark:from-blue-600/25 dark:to-indigo-600/25 dark:text-white dark:border-blue-500/40 dark:shadow-[0_0_20px_rgba(59,130,246,0.15)]"
                      : "text-slate-700 hover:text-slate-900 hover:bg-slate-100 dark:text-white/70 dark:hover:text-white dark:hover:bg-white/[0.06]"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Calendar className={`w-4 h-4 shrink-0 transition-colors ${
                      location.pathname.includes('/calendar') ? "text-blue-600 dark:text-blue-400" : "text-slate-400 group-hover:text-blue-600 dark:text-white/45 dark:group-hover:text-amber-400"
                    }`} />
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
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-[13.5px] font-semibold transition-all group ${
                    activeCategory === 'videos' && location.pathname === homeRoute
                      ? "bg-blue-50 text-blue-600 border border-blue-200 shadow-sm dark:bg-gradient-to-r dark:from-blue-600/25 dark:to-indigo-600/25 dark:text-white dark:border-blue-500/40 dark:shadow-[0_0_20px_rgba(59,130,246,0.15)]"
                      : "text-slate-700 hover:text-slate-900 hover:bg-slate-100 dark:text-white/70 dark:hover:text-white dark:hover:bg-white/[0.06]"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Video className={`w-4 h-4 shrink-0 transition-colors ${
                      activeCategory === 'videos' ? "text-blue-600 dark:text-blue-400" : "text-slate-400 group-hover:text-blue-600 dark:text-white/45 dark:group-hover:text-amber-400"
                    }`} />
                    <span>Vídeos Reels</span>
                  </div>
                </button>

                {/* Feed & Stories */}
                <button
                  onClick={() => handleNavClick('feed')}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-[13.5px] font-semibold transition-all group ${
                    activeCategory === 'feed' && location.pathname === homeRoute
                      ? "bg-blue-50 text-blue-600 border border-blue-200 shadow-sm dark:bg-gradient-to-r dark:from-blue-600/25 dark:to-indigo-600/25 dark:text-white dark:border-blue-500/40 dark:shadow-[0_0_20px_rgba(59,130,246,0.15)]"
                      : "text-slate-700 hover:text-slate-900 hover:bg-slate-100 dark:text-white/70 dark:hover:text-white dark:hover:bg-white/[0.06]"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Image className={`w-4 h-4 shrink-0 transition-colors ${
                      activeCategory === 'feed' ? "text-blue-600 dark:text-blue-400" : "text-slate-400 group-hover:text-blue-600 dark:text-white/45 dark:group-hover:text-amber-400"
                    }`} />
                    <span>Feed & Stories</span>
                  </div>
                </button>

                {/* Ofertas e Legendas */}
                <button
                  onClick={() => handleNavClick('offers')}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-[13.5px] font-semibold transition-all group ${
                    activeCategory === 'offers' && location.pathname === homeRoute
                      ? "bg-blue-50 text-blue-600 border border-blue-200 shadow-sm dark:bg-gradient-to-r dark:from-blue-600/25 dark:to-indigo-600/25 dark:text-white dark:border-blue-500/40 dark:shadow-[0_0_20px_rgba(59,130,246,0.15)]"
                      : "text-slate-700 hover:text-slate-900 hover:bg-slate-100 dark:text-white/70 dark:hover:text-white dark:hover:bg-white/[0.06]"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Megaphone className={`w-4 h-4 shrink-0 transition-colors ${
                      activeCategory === 'offers' ? "text-blue-600 dark:text-blue-400" : "text-slate-400 group-hover:text-blue-600 dark:text-white/45 dark:group-hover:text-amber-400"
                    }`} />
                    <span>Ofertas & Legendas</span>
                  </div>
                </button>

                {/* Aulas & Tutoriais */}
                <button
                  onClick={() => handleNavClick('videoaula')}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-[13.5px] font-semibold transition-all group ${
                    activeCategory === 'videoaula' && location.pathname === homeRoute
                      ? "bg-blue-50 text-blue-600 border border-blue-200 shadow-sm dark:bg-gradient-to-r dark:from-blue-600/25 dark:to-indigo-600/25 dark:text-white dark:border-blue-500/40 dark:shadow-[0_0_20px_rgba(59,130,246,0.15)]"
                      : "text-slate-700 hover:text-slate-900 hover:bg-slate-100 dark:text-white/70 dark:hover:text-white dark:hover:bg-white/[0.06]"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <GraduationCap className={`w-4 h-4 shrink-0 transition-colors ${
                      activeCategory === 'videoaula' ? "text-blue-600 dark:text-blue-400" : "text-slate-400 group-hover:text-blue-600 dark:text-white/45 dark:group-hover:text-amber-400"
                    }`} />
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
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-[13.5px] font-semibold transition-all group ${
                    location.pathname.includes('/downloads')
                      ? "bg-blue-50 text-blue-600 border border-blue-200 shadow-sm dark:bg-gradient-to-r dark:from-blue-600/25 dark:to-indigo-600/25 dark:text-white dark:border-blue-500/40 dark:shadow-[0_0_20px_rgba(59,130,246,0.15)]"
                      : "text-slate-700 hover:text-slate-900 hover:bg-slate-100 dark:text-white/70 dark:hover:text-white dark:hover:bg-white/[0.06]"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Download className={`w-4 h-4 shrink-0 transition-colors ${
                      location.pathname.includes('/downloads') ? "text-blue-600 dark:text-blue-400" : "text-emerald-500 dark:text-emerald-400 group-hover:text-blue-600"
                    }`} />
                    <span>{isESRoute ? "Central de Descargas Diretas" : "Central de Downloads Diretos"}</span>
                  </div>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-extrabold shrink-0">
                    40+
                  </span>
                </button>

                {/* Contratos Prontos */}
                <button
                  onClick={() => handleNavClick('contracts')}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-[13.5px] font-semibold transition-all group ${
                    activeCategory === 'contracts' && location.pathname === homeRoute
                      ? "bg-blue-50 text-blue-600 border border-blue-200 shadow-sm dark:bg-gradient-to-r dark:from-blue-600/25 dark:to-indigo-600/25 dark:text-white dark:border-blue-500/40 dark:shadow-[0_0_20px_rgba(59,130,246,0.15)]"
                      : "text-slate-700 hover:text-slate-900 hover:bg-slate-100 dark:text-white/70 dark:hover:text-white dark:hover:bg-white/[0.06]"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <FileText className={`w-4 h-4 shrink-0 transition-colors ${
                      activeCategory === 'contracts' ? "text-blue-600 dark:text-blue-400" : "text-slate-400 group-hover:text-blue-600 dark:text-white/45 dark:group-hover:text-amber-400"
                    }`} />
                    <span>Contratos Prontos</span>
                  </div>
                </button>

                {/* Favoritos */}
                <button
                  onClick={() => handleNavClick('favorites')}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-[13.5px] font-semibold transition-all group ${
                    activeCategory === 'favorites' && location.pathname === homeRoute
                      ? "bg-blue-50 text-blue-600 border border-blue-200 shadow-sm dark:bg-gradient-to-r dark:from-blue-600/25 dark:to-indigo-600/25 dark:text-white dark:border-blue-500/40 dark:shadow-[0_0_20px_rgba(59,130,246,0.15)]"
                      : "text-slate-700 hover:text-slate-900 hover:bg-slate-100 dark:text-white/70 dark:hover:text-white dark:hover:bg-white/[0.06]"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Heart className={`w-4 h-4 shrink-0 transition-colors ${
                      activeCategory === 'favorites' ? "text-blue-600 dark:text-blue-400" : "text-slate-400 group-hover:text-blue-600 dark:text-white/45 dark:group-hover:text-amber-400"
                    }`} />
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
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-[13.5px] font-semibold transition-all group ${
                    location.pathname.includes('/blog')
                      ? "bg-blue-50 text-blue-600 border border-blue-200 shadow-sm dark:bg-gradient-to-r dark:from-blue-600/25 dark:to-indigo-600/25 dark:text-white dark:border-blue-500/40 dark:shadow-[0_0_20px_rgba(59,130,246,0.15)]"
                      : "text-slate-700 hover:text-slate-900 hover:bg-slate-100 dark:text-white/70 dark:hover:text-white dark:hover:bg-white/[0.06]"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <BookmarkCheck className={`w-4 h-4 shrink-0 transition-colors ${
                      location.pathname.includes('/blog') ? "text-blue-600 dark:text-blue-400" : "text-slate-400 group-hover:text-blue-600 dark:text-white/45 dark:group-hover:text-amber-400"
                    }`} />
                    <span>Blog de Estratégias</span>
                  </div>
                </button>

                {/* Planos & Upgrade - Direciona para /inicio */}
                <button
                  onClick={() => handleNavClick(undefined, isESRoute ? "/es/inicio" : "/inicio")}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-[13.5px] font-semibold transition-all group ${
                    location.pathname === (isESRoute ? "/es/inicio" : "/inicio")
                      ? "bg-blue-50 text-blue-600 border border-blue-200 shadow-sm dark:bg-gradient-to-r dark:from-blue-600/25 dark:to-indigo-600/25 dark:text-white dark:border-blue-500/40 dark:shadow-[0_0_20px_rgba(59,130,246,0.15)]"
                      : "text-slate-700 hover:text-slate-900 hover:bg-slate-100 dark:text-white/70 dark:hover:text-white dark:hover:bg-white/[0.06]"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <CreditCard className={`w-4 h-4 shrink-0 transition-colors text-amber-500 dark:text-amber-400`} />
                    <span className="leading-snug">Planos & Upgrade</span>
                  </div>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-amber-500 text-black font-extrabold shrink-0 shadow-sm">
                    Elite
                  </span>
                </button>

                {/* Categoria somente da Fábrica / CRM Leads */}
                <button
                  onClick={() => handleNavClick(undefined, "/fabrica", true)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-[13.5px] font-semibold transition-all group ${
                    location.pathname.includes('/fabrica')
                      ? "bg-blue-50 text-blue-600 border border-blue-200 shadow-sm dark:bg-gradient-to-r dark:from-blue-600/25 dark:to-indigo-600/25 dark:text-white dark:border-blue-500/40 dark:shadow-[0_0_20px_rgba(59,130,246,0.15)]"
                      : "text-slate-700 hover:text-slate-900 hover:bg-slate-100 dark:text-white/70 dark:hover:text-white dark:hover:bg-white/[0.06]"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Wand2 className={`w-4 h-4 shrink-0 transition-colors ${
                      location.pathname.includes('/fabrica') ? "text-blue-600 dark:text-blue-400" : "text-purple-500 dark:text-purple-400 group-hover:text-blue-600"
                    }`} />
                    <span>Fábrica & CRM Leads</span>
                  </div>
                  {newLeadsCount > 0 ? (
                    <span className="bg-red-500 text-white font-extrabold text-[10px] px-2 py-0.5 rounded-full animate-pulse shadow-md">
                      {newLeadsCount}
                    </span>
                  ) : (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-purple-500/20 text-purple-500 dark:text-purple-400 font-extrabold shrink-0">
                      CRM
                    </span>
                  )}
                </button>

                {/* Progresso & Aulas */}
                {user && (
                  <button
                    onClick={() => handleNavClick(undefined, isESRoute ? "/es/progresso" : "/progresso")}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-[13.5px] font-semibold transition-all group ${
                      location.pathname.includes('/progresso')
                        ? "bg-blue-50 text-blue-600 border border-blue-200 shadow-sm dark:bg-gradient-to-r dark:from-blue-600/25 dark:to-indigo-600/25 dark:text-white dark:border-blue-500/40 dark:shadow-[0_0_20px_rgba(59,130,246,0.15)]"
                        : "text-slate-700 hover:text-slate-900 hover:bg-slate-100 dark:text-white/70 dark:hover:text-white dark:hover:bg-white/[0.06]"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <TrendingUp className={`w-4 h-4 shrink-0 transition-colors ${
                        location.pathname.includes('/progresso') ? "text-blue-600 dark:text-blue-400" : "text-slate-400 group-hover:text-blue-600 dark:text-white/45 dark:group-hover:text-amber-400"
                      }`} />
                      <span>Meu Progresso</span>
                    </div>
                  </button>
                )}

                {/* Suporte WhatsApp */}
                <button
                  onClick={() => window.open("https://api.whatsapp.com/send/?phone=5585998458995&text=Ol%C3%A1%2C+quero+suporte+do+Canva+Viagem", "_blank")}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-[13.5px] font-semibold transition-all group text-slate-700 hover:text-slate-900 hover:bg-slate-100 dark:text-white/70 dark:hover:text-white dark:hover:bg-white/[0.06]"
                >
                  <div className="flex items-center gap-3">
                    <MessageCircle className="w-4 h-4 shrink-0 text-green-500 dark:text-green-400" />
                    <span>Suporte WhatsApp</span>
                  </div>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-green-500/20 text-green-600 dark:text-green-400 font-extrabold shrink-0">
                    Online
                  </span>
                </button>

                {/* Minha Conta */}
                <button
                  onClick={() => handleNavClick(undefined, !user ? "/auth" : "/minha-conta")}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-[13.5px] font-semibold transition-all group ${
                    location.pathname.includes('/minha-conta') || location.pathname.includes('/auth')
                      ? "bg-blue-50 text-blue-600 border border-blue-200 shadow-sm dark:bg-gradient-to-r dark:from-blue-600/25 dark:to-indigo-600/25 dark:text-white dark:border-blue-500/40 dark:shadow-[0_0_20px_rgba(59,130,246,0.15)]"
                      : "text-slate-700 hover:text-slate-900 hover:bg-slate-100 dark:text-white/70 dark:hover:text-white dark:hover:bg-white/[0.06]"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <User className={`w-4 h-4 shrink-0 transition-colors ${
                      location.pathname.includes('/minha-conta') ? "text-blue-600 dark:text-blue-400" : "text-slate-400 group-hover:text-blue-600 dark:text-white/45 dark:group-hover:text-amber-400"
                    }`} />
                    <span>Minha Conta</span>
                  </div>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Rodapé do Menu Lateral */}
        <div className="p-3.5 border-t border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-black/40 space-y-2.5 shrink-0">
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
