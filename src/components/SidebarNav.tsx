import { useState, useEffect, memo } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { 
  Home, Bot, Wand2, Calendar, Image, GraduationCap, Heart, 
  FileText, CreditCard, User, LogOut, Sparkles, ExternalLink,
  ChevronRight, BookmarkCheck, Crown, ShieldCheck
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

  const navSections = [
    {
      title: "PRINCIPAL",
      items: [
        {
          id: "home",
          label: t('nav.home') || "Início",
          icon: Home,
          active: activeCategory === 'videos' && location.pathname === homeRoute,
          onClick: () => handleNavClick('videos')
        },
        {
          id: "ai",
          label: t('nav.ai') || "Ferramentas IA",
          icon: Bot,
          active: activeCategory === 'tools' && location.pathname === homeRoute,
          onClick: () => handleNavClick('tools')
        },
        {
          id: "fabrica",
          label: "Fábrica de Destinos",
          icon: Wand2,
          active: location.pathname.includes('/fabrica'),
          badge: "IA Pro",
          badgeColor: "bg-gradient-to-r from-blue-600 to-indigo-600 text-white",
          onClick: () => handleNavClick(undefined, isESRoute ? "/es/fabrica" : "/fabrica", true)
        },
        {
          id: "calendar",
          label: "Datas & Calendário",
          icon: Calendar,
          active: location.pathname.includes('/calendar'),
          onClick: () => handleNavClick(undefined, isESRoute ? "/es/calendar" : "/calendar")
        },
        {
          id: "arts",
          label: t('nav.arts') || "Feed & Artes",
          icon: Image,
          active: activeCategory === 'feed' && location.pathname === homeRoute,
          onClick: () => handleNavClick('feed')
        },
        {
          id: "class",
          label: t('nav.class') || "Videoaulas",
          icon: GraduationCap,
          active: activeCategory === 'videoaula' && location.pathname === homeRoute,
          onClick: () => handleNavClick('videoaula')
        },
        {
          id: "favorites",
          label: t('nav.favorites') || "Meus Favoritos",
          icon: Heart,
          active: activeCategory === 'favorites' && location.pathname === homeRoute,
          onClick: () => handleNavClick('favorites')
        }
      ]
    },
    {
      title: "ESTRATÉGIAS & CONTA",
      items: [
        {
          id: "blog",
          label: "Blog de Estratégias",
          icon: FileText,
          active: location.pathname.includes('/blog'),
          onClick: () => handleNavClick(undefined, "/blog")
        },
        {
          id: "planos",
          label: "Planos & Upgrade",
          icon: CreditCard,
          active: location.pathname.includes('/planos'),
          badge: "Elite",
          badgeColor: "bg-amber-500 text-black font-extrabold",
          onClick: () => handleNavClick(undefined, isESRoute ? "/es/planos" : "/planos")
        },
        {
          id: "recursos",
          label: "Recursos do Agente",
          icon: BookmarkCheck,
          active: location.pathname.includes('/downloads'),
          onClick: () => handleNavClick(undefined, "/downloads")
        },
        {
          id: "conta",
          label: "Minha Conta",
          icon: User,
          active: location.pathname.includes('/minha-conta'),
          onClick: () => handleNavClick(undefined, !user ? "/auth" : "/minha-conta")
        }
      ]
    }
  ];

  return (
    <>
      <aside className="hidden md:flex flex-col w-64 fixed left-0 top-0 bottom-0 bg-[#0F0F11] border-r border-white/10 text-white z-50 select-none overflow-hidden">
        {/* Logo Topo */}
        <div className="p-5 border-b border-white/10 flex items-center gap-3.5">
          <Link to={homeRoute} className="flex items-center gap-3.5 group">
            <img
              src={logoImage}
              alt="Canva Viagem"
              className="h-10 w-10 rounded-xl shadow-lg group-hover:scale-105 transition-transform object-cover shrink-0"
            />
            <div className="flex flex-col min-w-0">
              <span className="text-lg font-bold text-white tracking-tight whitespace-nowrap leading-tight">
                Canva Viagem
              </span>
              <span className="text-[10px] text-amber-400 font-extrabold tracking-widest uppercase -mt-0.5">
                Portal Principal
              </span>
            </div>
          </Link>
        </div>

        {/* Itens de Navegação */}
        <div className="flex-1 overflow-y-auto px-4 py-5 space-y-6 scrollbar-thin scrollbar-thumb-white/10">
          {navSections.map((section) => (
            <div key={section.title} className="space-y-1.5">
              <div className="text-[10px] font-black text-white/40 tracking-widest uppercase px-3 mb-2">
                {section.title}
              </div>
              <div className="space-y-1">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={item.onClick}
                      className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all group ${
                        item.active
                          ? "bg-gradient-to-r from-blue-600/20 to-indigo-600/20 text-white border border-blue-500/30 shadow-[0_0_20px_rgba(59,130,246,0.15)]"
                          : "text-white/65 hover:text-white hover:bg-white/[0.06]"
                      }`}
                    >
                      <div className="flex items-center gap-3 truncate">
                        <Icon className={`w-4 h-4 shrink-0 transition-colors ${
                          item.active ? "text-blue-400" : "text-white/40 group-hover:text-amber-400"
                        }`} />
                        <span className="truncate">{item.label}</span>
                      </div>
                      {item.badge && (
                        <span className={`text-[10px] px-2 py-0.5 rounded-full ${item.badgeColor}`}>
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Rodapé do Menu Lateral */}
        <div className="p-4 border-t border-white/10 bg-black/40 space-y-3">
          {user && (
            <div className="px-2">
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
              className="w-full justify-start text-white/70 hover:text-red-400 hover:bg-red-500/10 rounded-xl"
            >
              <LogOut className="h-4 w-4 mr-2" />
              {t('header.logout') || "Sair da Conta"}
            </Button>
          ) : (
            <Button
              variant="default"
              size="sm"
              onClick={() => navigate('/auth')}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-xl shadow-lg"
            >
              <User className="h-4 w-4 mr-2" />
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
