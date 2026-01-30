import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useLanguage, type Language } from '@/contexts/LanguageContext';

// Import pages
import Index from '@/pages/Index';
import Planos from '@/pages/Planos';
import Calendar from '@/pages/Calendar';
import Auth from '@/pages/Auth';
import AuthVerify from '@/pages/AuthVerify';
import PosPagamento from '@/pages/PosPagamento';
import Obrigado from '@/pages/Obrigado';
import Sucesso from '@/pages/Sucesso';
import Termos from '@/pages/Termos';
import Privacidade from '@/pages/Privacidade';
import ProximoNivel from '@/pages/ProximoNivel';

/**
 * LanguageWrapper - Sets language from URL and renders the appropriate page
 * WITHOUT redirecting. This keeps the /es or /pt prefix in the URL.
 */
const LanguageWrapper = () => {
  const { lang, '*': restPath } = useParams();
  const { setLanguage } = useLanguage();

  // Set language based on URL prefix
  useEffect(() => {
    if (lang === 'es' || lang === 'pt') {
      setLanguage(lang as Language);
    }
  }, [lang, setLanguage]);

  // Render appropriate page based on path (without redirect)
  const path = restPath || '';
  
  switch (path) {
    case 'planos':
      return <Planos />;
    case 'calendar':
      return <Calendar />;
    case 'auth':
      return <Auth />;
    case 'auth/verify':
      return <AuthVerify />;
    case 'pos-pagamento':
      return <PosPagamento />;
    case 'obrigado':
      return <Obrigado />;
    case 'sucesso':
      return <Sucesso />;
    case 'termos':
      return <Termos />;
    case 'privacidade':
      return <Privacidade />;
    case 'proximo-nivel':
      return <ProximoNivel />;
    default:
      return <Index />;
  }
};

export default LanguageWrapper;
