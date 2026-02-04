import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { translations, interpolate, type Language } from '@/lib/translations';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, vars?: Record<string, string | number>) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const STORAGE_KEY = 'canva-viagem-language';

const getStoredLanguage = (): Language => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'es') return 'es';
    return 'pt';
  } catch {
    // localStorage unavailable (e.g., Safari private mode)
    return 'pt';
  }
};

const saveLanguage = (lang: Language): void => {
  try {
    localStorage.setItem(STORAGE_KEY, lang);
  } catch {
    // localStorage unavailable - language will still work in memory
    console.warn('localStorage unavailable, language preference will not persist');
  }
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(getStoredLanguage);

  // Update language and persist to localStorage
  const setLanguage = useCallback((newLang: Language) => {
    setLanguageState(newLang);
    saveLanguage(newLang);
  }, []);

  // Translation function with fallback chain: current language → PT → key itself
  const t = useCallback((key: string, vars?: Record<string, string | number>): string => {
    let translation = translations[language]?.[key];
    
    // Fallback to Portuguese if not found in current language
    if (!translation && language !== 'pt') {
      translation = translations.pt?.[key];
    }
    
    // If still not found, return the key itself (helps with debugging)
    if (!translation) {
      console.warn(`Missing translation for key: ${key}`);
      return key;
    }

    // Interpolate variables if provided
    if (vars) {
      return interpolate(translation, vars);
    }

    return translation;
  }, [language]);

  // Sync with localStorage on mount (handles cases where storage changed in another tab)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        const newLang = e.newValue === 'es' ? 'es' : 'pt';
        setLanguageState(newLang);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export type { Language };
