import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, Mail, ArrowLeft, CheckCircle, MessageCircle, User, Phone } from "lucide-react";
import { trackCompleteRegistration, trackViewContent } from "@/lib/meta-pixel";
import { getMarketingAttribution, useAssociateUtmToUser } from "@/hooks/useTrackUtm";
import { trackEvent, ANALYTICS_EVENTS } from "@/hooks/useAnalyticsEvents";
import { formatPhoneBR, cleanPhone, isValidBRPhone } from "@/lib/phone-utils";

const Auth = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, loading, subscription } = useAuth();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  
  // Validate redirect parameter to prevent open redirect attacks
  const isValidRedirect = (path: string | null): boolean => {
    if (!path) return false;
    // Only allow relative paths starting with /
    if (!path.startsWith('/')) return false;
    // Block protocol-relative URLs (//)
    if (path.startsWith('//')) return false;
    // Block data: and javascript: URLs
    if (path.match(/^\/?(data|javascript):/i)) return false;
    // Block URLs with encoded characters that could bypass checks
    if (path.includes('%')) return false;
    return true;
  };
  
  // Get redirect param for post-auth navigation (validated)
  const rawRedirect = searchParams.get("redirect");
  const redirectTo = isValidRedirect(rawRedirect) ? rawRedirect : null;

  // Track page view
  useEffect(() => {
    trackViewContent('Página de Login');
  }, []);

  // Associate UTM data to user profile after login
  useAssociateUtmToUser();

  // Redirect based on subscription status after login
  useEffect(() => {
    if (!loading && !subscription.loading && user) {
      // Track registration and login events
      trackCompleteRegistration();
      trackEvent(ANALYTICS_EVENTS.LOGIN_COMPLETE, { 
        userId: user.id, 
        email: user.email 
      });

      // Associate UTM data to profile
      const attribution = getMarketingAttribution();
      if (attribution && (attribution.utm_source || attribution.utm_medium || attribution.utm_campaign)) {
        supabase
          .from("profiles")
          .update({
            utm_source: attribution.utm_source,
            utm_medium: attribution.utm_medium,
            utm_campaign: attribution.utm_campaign,
            referrer_url: attribution.referrer,
          })
          .eq("user_id", user.id)
          .is("utm_source", null) // Only update if not already set
          .then(() => {
            console.log("UTM data associated to profile");
          });
      }
      
      // If there's a redirect param, use it
      if (redirectTo) {
        navigate(redirectTo);
      } else if (subscription.subscribed) {
        navigate("/");
      } else {
        navigate("/planos");
      }
    }
  }, [user, loading, subscription, navigate, redirectTo]);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneBR(e.target.value);
    setPhone(formatted);
  };

  const handleSendMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast.error("Por favor, insira seu email.");
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Por favor, insira um email válido.");
      return;
    }

    // Validate phone if provided
    if (phone && !isValidBRPhone(phone)) {
      toast.error("Telefone inválido. Use DDD + número.");
      return;
    }

    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("send-magic-link", {
        body: { 
          email: email.toLowerCase().trim(),
          name: name.trim() || null,
          phone: phone ? cleanPhone(phone) : null
        },
      });

      if (error || !data?.success) {
        const errorMsg = data?.error || error?.message || "Erro ao enviar link";
        if (errorMsg.includes("rate limit") || errorMsg.includes("muitas tentativas")) {
          toast.error("Muitas tentativas. Aguarde alguns minutos antes de tentar novamente.");
        } else if (errorMsg.includes("não encontrado") || errorMsg.includes("Email not confirmed")) {
          toast.error("Email não encontrado. Verifique se você já fez uma compra.");
        } else {
          toast.error(errorMsg);
        }
        console.error("Magic link error:", error || data?.error);
        return;
      }

      setMagicLinkSent(true);
      toast.success("Link de acesso enviado! Verifique seu email.");
    } catch (error) {
      console.error("Error sending magic link:", error);
      toast.error("Erro ao processar. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendLink = async () => {
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("send-magic-link", {
        body: { 
          email: email.toLowerCase().trim(),
          name: name.trim() || null,
          phone: phone ? cleanPhone(phone) : null
        },
      });

      if (error || !data?.success) {
        toast.error(data?.error || "Erro ao reenviar link.");
        return;
      }

      toast.success("Link reenviado com sucesso!");
    } catch (error) {
      toast.error("Erro ao processar.");
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
          <div className="h-16 w-16 mx-auto rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg mb-4">
            <span className="text-3xl">🎬</span>
          </div>
          <CardTitle className="text-2xl font-bold">Canva Viagens</CardTitle>
          <CardDescription>
            {magicLinkSent 
              ? "Verifique seu email para acessar" 
              : "Acesse com seu email (sem senha!)"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {!magicLinkSent ? (
            <form onSubmit={handleSendMagicLink} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={isLoading}
                    className="pl-10"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Use o mesmo email que você usou na compra
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">Nome (opcional)</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="name"
                    type="text"
                    placeholder="Seu nome"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={isLoading}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">WhatsApp (opcional)</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="(85) 98641-1294"
                    value={phone}
                    onChange={handlePhoneChange}
                    disabled={isLoading}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Mail className="mr-2 h-4 w-4" />
                    Enviar Link de Acesso
                  </>
                )}
              </Button>
            </form>
          ) : (
            <div className="space-y-6">
              <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg p-4 text-center">
                <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-3" />
                <p className="text-green-800 dark:text-green-200 font-medium">
                  Link enviado para
                </p>
                <p className="text-green-600 dark:text-green-400 font-bold">
                  {email}
                </p>
              </div>

              <div className="text-center space-y-2">
                <p className="text-sm text-muted-foreground">
                  Verifique sua caixa de entrada e também a <strong>pasta de spam</strong>.
                </p>
                <p className="text-sm text-muted-foreground">
                  O link expira em <strong>1 hora</strong>.
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
                      Reenviando...
                    </>
                  ) : (
                    "Reenviar Link"
                  )}
                </Button>
                
                <Button 
                  variant="ghost" 
                  onClick={() => setMagicLinkSent(false)}
                  className="w-full"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Usar outro email
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
              <span className="bg-card px-2 text-muted-foreground">ainda não tem conta?</span>
            </div>
          </div>

          {/* Subscribe CTA */}
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-3">
              Para acessar, você precisa ter uma assinatura ativa.
            </p>
            <Button variant="outline" onClick={() => navigate("/planos")} className="w-full">
              Ver Planos e Assinar
            </Button>
          </div>

          {/* Support */}
          <div className="bg-muted/50 rounded-lg p-4 text-center text-sm text-muted-foreground">
            <p className="font-medium mb-2">Precisa de ajuda?</p>
            <a 
              href="https://wa.me/5585986411294?text=Ol%C3%A1%20adquiri%20o%20Canva%20Viagem.%20" 
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
