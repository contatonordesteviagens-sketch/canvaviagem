import { Bot, Image, GraduationCap, Heart, Home, Calendar, Wand2 } from "lucide-react";
import { CategoryType } from "./CategoryNav";
import { useLanguage } from "@/contexts/LanguageContext";
import { Dock } from "@/components/ui/Dock";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";
import { FabricaUpgradeModal } from "@/components/fabrica/FabricaUpgradeModal";

interface BottomNavProps {
  activeCategory: CategoryType;
  onCategoryChange: (category: CategoryType) => void;
}

export const BottomNav = ({ activeCategory, onCategoryChange }: BottomNavProps) => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { user, subscription, isAdmin } = useAuth();
  const [fabricaUpgradeOpen, setFabricaUpgradeOpen] = useState(false);

  const handleTabClick = (category: CategoryType | "home" | "calendar" | "fabrica") => {
    window.scrollTo({ top: 0, behavior: 'smooth' });

    if (category === "home") {
      onCategoryChange("videos");
      navigate("/");
    } else if (category === "calendar") {
      navigate("/calendar");
    } else if (category === "fabrica") {
      if (!user) {
        navigate("/auth");
        return;
      }
      const eliteProductIds = ["prod_UTFlCWzNqvqSNx", "prod_UTFsXcKq8m0mol", "prod_UTSmPe3GPt8iHt"];
      const isElite = subscription.subscribed && eliteProductIds.includes(subscription.productId || "");

      if (!isAdmin && !isElite) {
        setFabricaUpgradeOpen(true);
        return;
      }
      navigate("/fabrica");
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
      icon: Bot,
      label: t('nav.ai'),
      onClick: () => handleTabClick("tools")
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
      icon: GraduationCap,
      label: t('nav.class'),
      onClick: () => handleTabClick("videoaula")
    },
    {
      icon: Heart,
      label: t('nav.favorites'),
      onClick: () => handleTabClick("favorites")
    },
  ];

  return (
    <>
      <div className="fixed bottom-4 left-0 right-0 z-[60] flex justify-center pointer-events-none">
        <div className="pointer-events-auto w-full max-w-lg px-4">
          <Dock items={navItems} className="h-auto" />
        </div>
      </div>
      <FabricaUpgradeModal open={fabricaUpgradeOpen} onOpenChange={setFabricaUpgradeOpen} />
    </>
  );
};
