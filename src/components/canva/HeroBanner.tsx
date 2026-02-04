import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useLanguage } from "@/contexts/LanguageContext";

interface HeroBannerProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
}

export const HeroBanner = ({ searchValue, onSearchChange }: HeroBannerProps) => {
  const { t } = useLanguage();

  return (
    <div className="relative overflow-hidden rounded-3xl mb-6">
      {/* Gradient Background */}
      <div className="bg-hero-gradient py-10 px-6 md:py-16 md:px-10">
        {/* Decorative circles */}
        <div className="absolute top-4 right-8 w-24 h-24 rounded-full bg-white/10 blur-sm" />
        <div className="absolute bottom-6 left-6 w-16 h-16 rounded-full bg-white/10 blur-sm" />
        <div className="absolute top-1/2 right-1/4 w-12 h-12 rounded-full bg-white/5" />
        
        {/* Decorative travel icons */}
        <div className="absolute top-3 left-1/4 text-4xl opacity-80">✈️</div>
        <div className="absolute bottom-4 right-1/3 text-3xl opacity-80">🌴</div>
        <div className="absolute top-1/3 right-8 text-2xl opacity-70">🗺️</div>
        <div className="absolute bottom-8 left-8 text-2xl opacity-70">🧳</div>
        
        {/* Content */}
        <div className="relative z-10 text-center space-y-6">
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-extrabold text-white leading-tight tracking-tight">
            {t('hero.title')}
          </h1>
          
          {/* Glassmorphism Search Bar */}
          <div className="max-w-lg mx-auto relative">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="search"
                placeholder={t('hero.searchPlaceholder')}
                value={searchValue}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full pl-12 pr-4 h-14 rounded-full bg-white shadow-lg border-0 text-foreground placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-white/50"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
