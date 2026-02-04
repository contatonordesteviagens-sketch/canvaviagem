import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Globe } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface LanguageSwitcherProps {
  variant?: "desktop" | "mobile";
}

export const LanguageSwitcher = ({ variant = "desktop" }: LanguageSwitcherProps) => {
  const { language, t } = useLanguage();

  // Navigate using window.location.href for full page reload (most reliable)
  const switchToLanguage = (targetLang: 'pt' | 'es') => {
    const currentPath = window.location.pathname;
    const searchParams = window.location.search;
    
    if (targetLang === 'es') {
      // Navigate to ES version
      if (currentPath.includes('/planos') || currentPath.includes('/es/planos')) {
        window.location.href = '/es/planos' + searchParams;
      } else if (currentPath.includes('/calendar') || currentPath.includes('/es/calendar')) {
        window.location.href = '/es/calendar' + searchParams;
      } else {
        window.location.href = '/es' + searchParams;
      }
    } else {
      // Navigate to PT version - use explicit /pt paths to force language
      if (currentPath.includes('/planos') || currentPath.includes('/es/planos')) {
        window.location.href = '/planos' + searchParams;
      } else if (currentPath.includes('/calendar') || currentPath.includes('/es/calendar')) {
        window.location.href = '/calendar' + searchParams;
      } else {
        window.location.href = '/' + searchParams;
      }
    }
  };

  if (variant === "mobile") {
    return (
      <div className="flex items-center gap-2 px-3 py-2">
        <Globe className="h-5 w-5 text-muted-foreground" />
        <span className="text-sm font-medium">{t('header.changeLanguage')}</span>
        <div className="flex gap-2 ml-auto">
          <Button
            variant={language === 'pt' ? 'default' : 'outline'}
            size="sm"
            onClick={() => switchToLanguage('pt')}
            className="h-8 px-3"
          >
            🇧🇷 PT
          </Button>
          <Button
            variant={language === 'es' ? 'default' : 'outline'}
            size="sm"
            onClick={() => switchToLanguage('es')}
            className="h-8 px-3"
          >
            🇪🇸 ES
          </Button>
        </div>
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2">
          {language === 'pt' ? '🇧🇷' : '🇪🇸'}
          <span className="hidden sm:inline">{language.toUpperCase()}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem 
          onClick={() => switchToLanguage('pt')}
          className={language === 'pt' ? 'bg-accent' : ''}
        >
          🇧🇷 Português
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => switchToLanguage('es')}
          className={language === 'es' ? 'bg-accent' : ''}
        >
          🇪🇸 Español
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
