import { Bot, Image, GraduationCap, Heart, Home, Calendar, Wand2 } from "lucide-react";
import { CategoryType } from "./CategoryNav";
import { useLanguage } from "@/contexts/LanguageContext";
import { Dock } from "@/components/ui/Dock";
import { useNavigate } from "react-router-dom";

interface BottomNavProps {
  activeCategory: CategoryType;
  onCategoryChange: (category: CategoryType) => void;
}

export const BottomNav = ({ activeCategory, onCategoryChange }: BottomNavProps) => {
  const { t, language } = useLanguage();
  const navigate = useNavigate();

  const handleTabClick = (category: CategoryType | "home" | "calendar" | "fabrica" | "tutorial") => {
    window.scrollTo({ top: 0, behavior: 'smooth' });

    if (category === "home") {
      onCategoryChange("videos");
      navigate("/");
    } else if (category === "calendar") {
      navigate("/calendar");
    } else if (category === "tutorial") {
      navigate("/tutorial");
    } else if (category === "fabrica") {
      navigate(language === "es" ? "/es/fabrica" : "/fabrica");
    } else {
      onCategoryChange(category as CategoryType);
      navigate("/"); // Ensure we are on home to see content
    }
  };

  const navItems = [
    {
      icon: Home,
      label: t('nav.home'),
      onClick: () => handleTabClick("home")
    },
    {
      icon: Wand2,
      label: "Fábrica",
      onClick: () => handleTabClick("fabrica"),
      showBadge: true
    },
    {
      icon: Calendar,
      label: "Datas",
      onClick: () => handleTabClick("calendar")
    },
    {
      icon: Image,
      label: t('nav.arts'),
      onClick: () => handleTabClick("feed")
    },
    {
      icon: Heart,
      label: t('nav.favorites'),
      onClick: () => handleTabClick("favorites")
    },
  ];

  return (
    <>
      <div className="fixed bottom-4 left-0 right-0 z-[60] flex justify-center pointer-events-none md:hidden">
        <div className="pointer-events-auto w-full max-w-lg px-4">
          <Dock items={navItems} className="h-auto" />
        </div>
      </div>
    </>
  );
};
