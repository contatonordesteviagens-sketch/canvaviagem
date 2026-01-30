import { useEffect, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useLanguage, type Language } from '@/contexts/LanguageContext';

const LanguageRedirect = () => {
  const { lang, '*': restPath } = useParams();
  const { language, setLanguage } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const [hasSetLanguage, setHasSetLanguage] = useState(false);

  // Passo 1: Definir o idioma
  useEffect(() => {
    if ((lang === 'es' || lang === 'pt') && !hasSetLanguage) {
      console.log(`🌍 Setting language to: ${lang}`);
      setLanguage(lang as Language);
      setHasSetLanguage(true);
    }
  }, [lang, setLanguage, hasSetLanguage]);

  // Passo 2: Redirecionar DEPOIS que o contexto foi atualizado
  useEffect(() => {
    if (hasSetLanguage && language === lang) {
      const searchParams = location.search; // Preservar UTMs
      const targetPath = restPath 
        ? `/${restPath}${searchParams}` 
        : `/${searchParams}` || '/';
      
      console.log(`🔀 Redirecting to: ${targetPath} (language: ${language})`);
      navigate(targetPath, { replace: true });
    }
  }, [hasSetLanguage, language, lang, restPath, navigate, location.search]);

  return null;
};

export default LanguageRedirect;
