import { useNavigate, useLocation } from "react-router-dom";
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
  const navigate = useNavigate();
  const location = useLocation();

  /**
   * Navigate to the equivalent URL in the target language
   * - ES: adds /es prefix
   * - PT: removes /es prefix (PT is the default)
   * - Preserves query params (UTMs, etc.)
   */
  const switchToLanguage = (targetLang: 'pt' | 'es') => {
    const currentPath = location.pathname;
    const searchParams = location.search;

    // Remove any existing language prefix
    let basePath = currentPath
      .replace(/^\/es/, '')
      .replace(/^\/pt/, '') || '/';

    // Build new URL
    let newPath: string;
    if (targetLang === 'es') {
      // ES always uses /es prefix
      newPath = basePath === '/' ? '/es' : `/es${basePath}`;
    } else {
      // PT uses no prefix (default)
      newPath = basePath;
    }

    navigate(newPath + searchParams);
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
