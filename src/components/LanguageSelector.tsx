import { useLanguage, LANGUAGES, type Language } from '@/hooks/useLanguage';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Globe } from 'lucide-react';

interface LanguageSelectorProps {
  variant?: 'default' | 'compact' | 'mobile';
  className?: string;
}

export function LanguageSelector({ variant = 'default', className = '' }: LanguageSelectorProps) {
  const { language, setLanguage, loading } = useLanguage();

  if (loading) {
    return null;
  }

  const currentLang = LANGUAGES.find(l => l.code === language) || LANGUAGES[0];

  if (variant === 'compact') {
    return (
      <Select value={language} onValueChange={(val) => setLanguage(val as Language)}>
        <SelectTrigger className={`w-[70px] h-9 px-2 ${className}`}>
          <span className="text-lg">{currentLang.flag}</span>
        </SelectTrigger>
        <SelectContent>
          {LANGUAGES.map(lang => (
            <SelectItem key={lang.code} value={lang.code}>
              <span className="flex items-center gap-2">
                <span className="text-lg">{lang.flag}</span>
                <span>{lang.label}</span>
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  }

  if (variant === 'mobile') {
    return (
      <div className={`flex flex-col gap-2 ${className}`}>
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3">
          Idioma / Language
        </p>
        <div className="flex gap-2 px-3">
          {LANGUAGES.map(lang => (
            <button
              key={lang.code}
              onClick={() => setLanguage(lang.code)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                language === lang.code
                  ? 'bg-primary text-primary-foreground'
                  : 'hover:bg-accent/10'
              }`}
            >
              <span className="text-lg">{lang.flag}</span>
              <span className="hidden sm:inline">{lang.label}</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <Select value={language} onValueChange={(val) => setLanguage(val as Language)}>
      <SelectTrigger className={`w-[140px] ${className}`}>
        <Globe className="h-4 w-4 mr-2" />
        <SelectValue>
          <span className="flex items-center gap-2">
            <span>{currentLang.flag}</span>
            <span>{currentLang.label}</span>
          </span>
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {LANGUAGES.map(lang => (
          <SelectItem key={lang.code} value={lang.code}>
            <span className="flex items-center gap-2">
              <span className="text-lg">{lang.flag}</span>
              <span>{lang.label}</span>
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
