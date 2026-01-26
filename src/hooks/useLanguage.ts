import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const VALID_LANGUAGES = ['pt', 'en', 'es'] as const;
export type Language = typeof VALID_LANGUAGES[number];

export interface LanguageConfig {
  code: Language;
  label: string;
  flag: string;
}

export const LANGUAGES: LanguageConfig[] = [
  { code: 'pt', label: 'Português', flag: '🇧🇷' },
  { code: 'en', label: 'English', flag: '🇺🇸' },
  { code: 'es', label: 'Español', flag: '🇪🇸' },
];

export function useLanguage() {
  const { user } = useAuth();
  const [language, setLanguageState] = useState<Language>('pt');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function detectLanguage() {
      try {
        // 1. URL param (?lang=en)
        const urlParams = new URLSearchParams(window.location.search);
        const urlLang = urlParams.get('lang') as Language;
        
        if (urlLang && VALID_LANGUAGES.includes(urlLang)) {
          setLanguageState(urlLang);
          localStorage.setItem('preferredLanguage', urlLang);
          setLoading(false);
          return;
        }

        // 2. localStorage
        const savedLang = localStorage.getItem('preferredLanguage') as Language;
        if (savedLang && VALID_LANGUAGES.includes(savedLang)) {
          setLanguageState(savedLang);
          setLoading(false);
          return;
        }

        // 3. Profile do usuário (se autenticado)
        if (user?.email) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('language')
            .eq('email', user.email)
            .maybeSingle();

          if (profile?.language && VALID_LANGUAGES.includes(profile.language as Language)) {
            setLanguageState(profile.language as Language);
            localStorage.setItem('preferredLanguage', profile.language);
            setLoading(false);
            return;
          }
        }

        // 4. Browser locale fallback
        const browserLang = navigator.language.substring(0, 2) as Language;
        if (VALID_LANGUAGES.includes(browserLang)) {
          setLanguageState(browserLang);
          localStorage.setItem('preferredLanguage', browserLang);
        }
        
        setLoading(false);
      } catch (error) {
        console.error('[useLanguage] Error detecting language:', error);
        setLoading(false);
      }
    }

    detectLanguage();
  }, [user]);

  const setLanguage = useCallback(async (newLang: Language) => {
    setLanguageState(newLang);
    localStorage.setItem('preferredLanguage', newLang);

    // Atualizar no banco se usuário autenticado
    if (user?.email) {
      try {
        await supabase
          .from('profiles')
          .update({ 
            language: newLang, 
            updated_at: new Date().toISOString() 
          })
          .eq('email', user.email);
      } catch (error) {
        console.error('[useLanguage] Error updating language in profile:', error);
      }
    }
  }, [user]);

  return { language, setLanguage, loading };
}

// Translation helper types
export type TranslationKey = string;
export type Translations = Record<Language, Record<TranslationKey, string>>;

// Common UI translations
export const uiTranslations: Translations = {
  pt: {
    // Auth
    'auth.title': 'Canva Viagens',
    'auth.subtitle': 'Acesse com seu email (sem senha!)',
    'auth.email': 'Email',
    'auth.email_placeholder': 'seu@email.com',
    'auth.email_hint': 'Use o mesmo email que você usou na compra',
    'auth.send_link': 'Enviar Link de Acesso',
    'auth.sending': 'Enviando...',
    'auth.link_sent': 'Link de acesso enviado! Verifique seu email.',
    'auth.check_email': 'Verifique seu email para acessar',
    'auth.link_sent_to': 'Link enviado para',
    'auth.check_inbox': 'Verifique sua caixa de entrada e também a pasta de spam.',
    'auth.link_expires': 'O link expira em',
    'auth.resend_link': 'Reenviar Link',
    'auth.resending': 'Reenviando...',
    'auth.use_other_email': 'Usar outro email',
    'auth.no_account': 'ainda não tem conta?',
    'auth.need_subscription': 'Para acessar, você precisa ter uma assinatura ativa.',
    'auth.view_plans': 'Ver Planos e Assinar',
    'auth.need_help': 'Precisa de ajuda?',
    'auth.no_subscription': 'Nenhuma assinatura ativa encontrada. Por favor, assine um plano primeiro.',
    
    // Success page
    'success.welcome': 'Bem-vindo(a) a bordo!',
    'success.activated': 'Sua assinatura foi ativada com sucesso!',
    'success.plan': 'Plano Ativo: Assinatura Mensal',
    'success.full_access': 'Agora você tem acesso completo a todos os recursos do Canva Viagens!',
    'success.unlocked': 'Recursos liberados:',
    'success.redirect': 'Redirecionando para a plataforma em',
    'success.seconds': 'segundos...',
    'success.access_now': 'Acessar Plataforma Agora',
    
    // Common
    'common.loading': 'Carregando...',
    'common.error': 'Erro',
    'common.success': 'Sucesso',
    'common.hour': 'hora',
  },
  en: {
    // Auth
    'auth.title': 'Canva Viagens',
    'auth.subtitle': 'Access with your email (no password!)',
    'auth.email': 'Email',
    'auth.email_placeholder': 'your@email.com',
    'auth.email_hint': 'Use the same email you used for purchase',
    'auth.send_link': 'Send Access Link',
    'auth.sending': 'Sending...',
    'auth.link_sent': 'Access link sent! Check your email.',
    'auth.check_email': 'Check your email to access',
    'auth.link_sent_to': 'Link sent to',
    'auth.check_inbox': 'Check your inbox and also the spam folder.',
    'auth.link_expires': 'The link expires in',
    'auth.resend_link': 'Resend Link',
    'auth.resending': 'Resending...',
    'auth.use_other_email': 'Use another email',
    'auth.no_account': "don't have an account yet?",
    'auth.need_subscription': 'To access, you need an active subscription.',
    'auth.view_plans': 'View Plans and Subscribe',
    'auth.need_help': 'Need help?',
    'auth.no_subscription': 'No active subscription found. Please subscribe to a plan first.',
    
    // Success page
    'success.welcome': 'Welcome aboard!',
    'success.activated': 'Your subscription has been activated successfully!',
    'success.plan': 'Active Plan: Monthly Subscription',
    'success.full_access': 'You now have full access to all Canva Viagens features!',
    'success.unlocked': 'Unlocked features:',
    'success.redirect': 'Redirecting to the platform in',
    'success.seconds': 'seconds...',
    'success.access_now': 'Access Platform Now',
    
    // Common
    'common.loading': 'Loading...',
    'common.error': 'Error',
    'common.success': 'Success',
    'common.hour': 'hour',
  },
  es: {
    // Auth
    'auth.title': 'Canva Viagens',
    'auth.subtitle': 'Accede con tu email (¡sin contraseña!)',
    'auth.email': 'Email',
    'auth.email_placeholder': 'tu@email.com',
    'auth.email_hint': 'Usa el mismo email que usaste en la compra',
    'auth.send_link': 'Enviar Link de Acceso',
    'auth.sending': 'Enviando...',
    'auth.link_sent': '¡Link de acceso enviado! Revisa tu email.',
    'auth.check_email': 'Revisa tu email para acceder',
    'auth.link_sent_to': 'Link enviado a',
    'auth.check_inbox': 'Revisa tu bandeja de entrada y también la carpeta de spam.',
    'auth.link_expires': 'El link expira en',
    'auth.resend_link': 'Reenviar Link',
    'auth.resending': 'Reenviando...',
    'auth.use_other_email': 'Usar otro email',
    'auth.no_account': '¿aún no tienes cuenta?',
    'auth.need_subscription': 'Para acceder, necesitas una suscripción activa.',
    'auth.view_plans': 'Ver Planes y Suscribirse',
    'auth.need_help': '¿Necesitas ayuda?',
    'auth.no_subscription': 'No se encontró suscripción activa. Por favor, suscríbete a un plan primero.',
    
    // Success page
    'success.welcome': '¡Bienvenido/a a bordo!',
    'success.activated': '¡Tu suscripción ha sido activada con éxito!',
    'success.plan': 'Plan Activo: Suscripción Mensual',
    'success.full_access': '¡Ahora tienes acceso completo a todos los recursos de Canva Viagens!',
    'success.unlocked': 'Recursos liberados:',
    'success.redirect': 'Redirigiendo a la plataforma en',
    'success.seconds': 'segundos...',
    'success.access_now': 'Acceder a la Plataforma Ahora',
    
    // Common
    'common.loading': 'Cargando...',
    'common.error': 'Error',
    'common.success': 'Éxito',
    'common.hour': 'hora',
  },
};

// Translation hook
export function useTranslation() {
  const { language } = useLanguage();
  
  const t = useCallback((key: TranslationKey): string => {
    return uiTranslations[language]?.[key] || uiTranslations.pt[key] || key;
  }, [language]);
  
  return { t, language };
}
