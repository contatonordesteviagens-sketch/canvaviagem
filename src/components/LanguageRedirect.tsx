import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useLanguage, type Language } from '@/contexts/LanguageContext';

const LanguageRedirect = () => {
  const { lang, '*': restPath } = useParams();
  const { setLanguage } = useLanguage();
  const navigate = useNavigate();

  useEffect(() => {
    if (lang === 'es' || lang === 'pt') {
      // Define o idioma
      setLanguage(lang as Language);
      
      // Redireciona para a página destino (ou home se não houver)
      const targetPath = restPath ? `/${restPath}` : '/';
      navigate(targetPath, { replace: true });
    }
  }, [lang, restPath, setLanguage, navigate]);

  return null;
};

export default LanguageRedirect;
