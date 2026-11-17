import { Image, Home, Users, Video, Wand2 } from "lucide-react";
import { CategoryType } from "./CategoryNav";
import { useLanguage } from "@/contexts/LanguageContext";
import { Dock } from "@/components/ui/Dock";
import { useNavigate } from "react-router-dom";
import { useFabricaMetrics } from "@/hooks/useFabricaMetrics";

interface BottomNavProps {
  activeCategory: CategoryType;
  onCategoryChange: (category: CategoryType) => void;
}

/**
 * Barra do celular, por prioridade de uso: entrar, criar, pegar conteúdo pronto, ver clientes.
 * Calendário e Favoritos continuam no menu lateral.
 */
export const BottomNav = ({ onCategoryChange }: BottomNavProps) => {
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const { newLeadsCount } = useFabricaMetrics();
  const isEs = language === "es";

  const goHomeCategory = (category: CategoryType) => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    onCategoryChange(category);
    navigate(isEs ? "/es" : "/");
  };

  const navItems = [
    {
      icon: Home,
      label: t("nav.home"),
      onClick: () => goHomeCategory("all"),
    },
    {
      icon: Wand2,
      label: "Fábrica",
      onClick: () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
        navigate(isEs ? "/es/fabrica" : "/fabrica");
      },
    },
    {
      icon: Video,
      label: isEs ? "Videos" : "Vídeos",
      onClick: () => goHomeCategory("videos"),
    },
    {
      icon: Image,
      label: t("nav.arts"),
      onClick: () => goHomeCategory("feed"),
    },
    {
      icon: Users,
      label: "Clientes",
      onClick: () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
        navigate(isEs ? "/es/fabrica/crm" : "/fabrica/crm");
      },
      showBadge: newLeadsCount > 0,
    },
  ];

  return (
    <div data-barra-antiga className="fixed bottom-4 left-0 right-0 z-[60] flex justify-center pointer-events-none md:hidden">
      <div className="pointer-events-auto w-full max-w-lg px-4">
        <Dock items={navItems} className="h-auto" />
      </div>
    </div>
  );
};
