import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, Mail, ArrowLeft, CheckCircle, MessageCircle } from "lucide-react";
import { trackCompleteRegistration, trackViewContent } from "@/lib/meta-pixel";
import { useLanguage, type Language } from "@/hooks/useLanguage";
import { LanguageSelector } from "@/components/LanguageSelector";

const translations = {
  pt: {
    title: "Canva Viagens",
    subtitle: "Acesse com seu email (sem senha!)",
    checkEmail: "Verifique seu email para acessar",
    email: "Email",
    emailPlaceholder: "seu@email.com",
    emailHint: "Use o mesmo email que você usou na compra",
    sendLink: "Enviar Link de Acesso",
    sending: "Enviando...",
    linkSent: "Link de acesso enviado! Verifique seu email.",
    linkSentTo: "Link enviado para",
    checkInbox: "Verifique sua caixa de entrada e também a pasta de spam.",
    linkExpires: "O link expira em",
    hour: "1 hora",
    resendLink: "Reenviar Link",
    resending: "Reenviando...",
    useOtherEmail: "Usar outro email",
    noAccount: "ainda não tem conta?",
    needSubscription: "Para acessar, você precisa ter uma assinatura ativa.",
    viewPlans: "Ver Planos e Assinar",
    needHelp: "Precisa de ajuda?",
    noSubscription: "Nenhuma assinatura ativa encontrada. Por favor, assine um plano primeiro.",
    invalidEmail: "Por favor, insira um email válido.",
    emptyEmail: "Por favor, insira seu email.",
    rateLimitError: "Muitas tentativas. Aguarde alguns minutos antes de tentar novamente.",
    emailNotFound: "Email não encontrado. Verifique se você já fez uma compra.",
    genericError: "Erro ao enviar link. Tente novamente.",
    resendSuccess: "Link reenviado com sucesso!",
    resendError: "Erro ao reenviar link.",
  },
  en: {
    title: "Canva Viagens",
    subtitle: "Access with your email (no password!)",
    checkEmail: "Check your email to access",
    email: "Email",
    emailPlaceholder: "your@email.com",
    emailHint: "Use the same email you used for purchase",
    sendLink: "Send Access Link",
    sending: "Sending...",
    linkSent: "Access link sent! Check your email.",
    linkSentTo: "Link sent to",
    checkInbox: "Check your inbox and also the spam folder.",
    linkExpires: "The link expires in",
    hour: "1 hour",
    resendLink: "Resend Link",
    resending: "Resending...",
    useOtherEmail: "Use another email",
    noAccount: "don't have an account yet?",
    needSubscription: "To access, you need an active subscription.",
    viewPlans: "View Plans and Subscribe",
    needHelp: "Need help?",
    noSubscription: "No active subscription found. Please subscribe to a plan first.",
    invalidEmail: "Please enter a valid email.",
    emptyEmail: "Please enter your email.",
    rateLimitError: "Too many attempts. Please wait a few minutes before trying again.",
    emailNotFound: "Email not found. Check if you have made a purchase.",
    genericError: "Error sending link. Please try again.",
    resendSuccess: "Link resent successfully!",
    resendError: "Error resending link.",
  },
  es: {
    title: "Canva Viagens",
    subtitle: "Accede con tu email (¡sin contraseña!)",
    checkEmail: "Revisa tu email para acceder",
    email: "Email",
    emailPlaceholder: "tu@email.com",
    emailHint: "Usa el mismo email que usaste en la compra",
    sendLink: "Enviar Link de Acceso",
    sending: "Enviando...",
    linkSent: "¡Link de acceso enviado! Revisa tu email.",
    linkSentTo: "Link enviado a",
    checkInbox: "Revisa tu bandeja de entrada y también la carpeta de spam.",
    linkExpires: "El link expira en",
    hour: "1 hora",
    resendLink: "Reenviar Link",
    resending: "Reenviando...",
    useOtherEmail: "Usar otro email",
    noAccount: "¿aún no tienes cuenta?",
    needSubscription: "Para acceder, necesitas una suscripción activa.",
    viewPlans: "Ver Planes y Suscribirse",
    needHelp: "¿Necesitas ayuda?",
    noSubscription: "No se encontró suscripción activa. Por favor, suscríbete a un plan primero.",
    invalidEmail: "Por favor, ingresa un email válido.",
    emptyEmail: "Por favor, ingresa tu email.",
    rateLimitError: "Demasiados intentos. Por favor espera unos minutos antes de intentar de nuevo.",
    emailNotFound: "Email no encontrado. Verifica si ya hiciste una compra.",
    genericError: "Error al enviar el link. Por favor intenta de nuevo.",
    resendSuccess: "¡Link reenviado con éxito!",
    resendError: "Error al reenviar el link.",
  },
};

const Auth = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, loading, subscription } = useAuth();
  const { language } = useLanguage();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [magicLinkSent, setMagicLinkSent] = useState(false);

  const t = translations[language] || translations.pt;
  
  // Validate redirect parameter to prevent open redirect attacks
  const isValidRedirect = (path: string | null): boolean => {
    if (!path) return false;
    if (!path.startsWith('/')) return false;
    if (path.startsWith('//')) return false;
    if (path.match(/^\/?(data|javascript):/i)) return false;
    if (path.includes('%')) return false;
    return true;
  };
  
  const rawRedirect = searchParams.get("redirect");
  const redirectTo = isValidRedirect(rawRedirect) ? rawRedirect : null;

  useEffect(() => {
    trackViewContent('Página de Login');
  }, []);

  useEffect(() => {
    if (!loading && !subscription.loading && user) {
      trackCompleteRegistration();
      
      if (redirectTo) {
        navigate(redirectTo);
      } else if (subscription.subscribed) {
        navigate("/");
      } else {
        navigate("/planos");
      }
    }
  }, [user, loading, subscription, navigate, redirectTo]);

  const checkSubscription = async (emailToCheck: string): Promise<boolean> => {
    // Verificar se existe assinatura ativa para este email
    const { data: profile } = await supabase
      .from('profiles')
      .select('stripe_customer_id')
      .eq('email', emailToCheck.toLowerCase())
      .maybeSingle();

    if (!profile?.stripe_customer_id) {
      return false;
    }

    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('status')
      .eq('stripe_customer_id', profile.stripe_customer_id)
      .in('status', ['active', 'trialing'])
      .maybeSingle();

    return !!subscription;
  };

  const handleSendMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast.error(t.emptyEmail);
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error(t.invalidEmail);
      return;
    }

    setIsLoading(true);

    try {
      // Verificar assinatura antes de enviar Magic Link
      const hasSubscription = await checkSubscription(email);
      
      if (!hasSubscription) {
        toast.error(t.noSubscription);
        navigate('/planos');
        setIsLoading(false);
        return;
      }

      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: redirectTo 
            ? `${window.location.origin}${redirectTo}` 
            : `${window.location.origin}/`,
        },
      });

      if (error) {
        if (error.message.includes("rate limit")) {
          toast.error(t.rateLimitError);
        } else if (error.message.includes("Email not confirmed")) {
          toast.error(t.emailNotFound);
        } else {
          toast.error(t.genericError);
        }
        console.error("Magic link error:", error);
        return;
      }

      setMagicLinkSent(true);
      toast.success(t.linkSent);
    } catch (error) {
      console.error("Error sending magic link:", error);
      toast.error(t.genericError);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendLink = async () => {
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: redirectTo 
            ? `${window.location.origin}${redirectTo}` 
            : `${window.location.origin}/`,
        },
      });

      if (error) {
        toast.error(t.resendError);
        return;
      }

      toast.success(t.resendSuccess);
    } catch (error) {
      toast.error(t.genericError);
    } finally {
      setIsLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-accent/10 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-2">
          <div className="flex justify-end mb-2">
            <LanguageSelector variant="compact" />
          </div>
          <div className="h-16 w-16 mx-auto rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg mb-4">
            <span className="text-3xl">🎬</span>
          </div>
          <CardTitle className="text-2xl font-bold">{t.title}</CardTitle>
          <CardDescription>
            {magicLinkSent ? t.checkEmail : t.subtitle}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {!magicLinkSent ? (
            <form onSubmit={handleSendMagicLink} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">{t.email}</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder={t.emailPlaceholder}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                />
                <p className="text-xs text-muted-foreground">
                  {t.emailHint}
                </p>
              </div>
              
              <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t.sending}
                  </>
                ) : (
                  <>
                    <Mail className="mr-2 h-4 w-4" />
                    {t.sendLink}
                  </>
                )}
              </Button>
            </form>
          ) : (
            <div className="space-y-6">
              <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg p-4 text-center">
                <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-3" />
                <p className="text-green-800 dark:text-green-200 font-medium">
                  {t.linkSentTo}
                </p>
                <p className="text-green-600 dark:text-green-400 font-bold">
                  {email}
                </p>
              </div>

              <div className="text-center space-y-2">
                <p className="text-sm text-muted-foreground">
                  {t.checkInbox}
                </p>
                <p className="text-sm text-muted-foreground">
                  {t.linkExpires} <strong>{t.hour}</strong>.
                </p>
              </div>

              <div className="flex flex-col gap-3">
                <Button 
                  variant="outline" 
                  onClick={handleResendLink}
                  disabled={isLoading}
                  className="w-full"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {t.resending}
                    </>
                  ) : (
                    t.resendLink
                  )}
                </Button>
                
                <Button 
                  variant="ghost" 
                  onClick={() => setMagicLinkSent(false)}
                  className="w-full"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  {t.useOtherEmail}
                </Button>
              </div>
            </div>
          )}

          {/* Separator */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-muted"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">{t.noAccount}</span>
            </div>
          </div>

          {/* Subscribe CTA */}
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-3">
              {t.needSubscription}
            </p>
            <Button variant="outline" onClick={() => navigate("/planos")} className="w-full">
              {t.viewPlans}
            </Button>
          </div>

          {/* Support */}
          <div className="bg-muted/50 rounded-lg p-4 text-center text-sm text-muted-foreground">
            <p className="font-medium mb-2">{t.needHelp}</p>
            <a 
              href="https://wa.me/5585986411294" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-primary hover:underline"
            >
              <MessageCircle className="h-4 w-4" />
              WhatsApp: (85) 9 8641-1294
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
