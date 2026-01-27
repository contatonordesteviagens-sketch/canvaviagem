import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CheckCircle, Mail, Loader2, ArrowRight, MessageCircle, Sparkles, RefreshCw, CreditCard, Phone } from "lucide-react";
import { trackPurchase, trackSubscribe } from "@/lib/meta-pixel";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { formatPhoneBR, cleanPhone, isValidBRPhone } from "@/lib/phone-utils";

const PosPagamento = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const emailFromUrl = searchParams.get('email');
  const nameFromUrl = searchParams.get('name');
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingWhatsApp, setIsLoadingWhatsApp] = useState(false);
  const [magicLinkSent, setMagicLinkSent] = useState(false);

  // Auto-fill name and email from URL parameters
  useEffect(() => {
    if (emailFromUrl) {
      setEmail(decodeURIComponent(emailFromUrl));
    }
    if (nameFromUrl) {
      setName(decodeURIComponent(nameFromUrl));
    }
  }, [emailFromUrl, nameFromUrl]);

  useEffect(() => {
    // Debug: verificar se o Pixel está carregado
    console.log('[Meta Debug] window.fbq exists:', typeof window.fbq !== 'undefined');
    
    trackPurchase(9.90, 'BRL');
    trackSubscribe(9.90, 'BRL', 9.90 * 12);
    
    console.log('[Meta Debug] Purchase & Subscribe events dispatched (R$ 9,90)');
  }, []);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneBR(e.target.value);
    setPhone(formatted);
  };

  const handleSendMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast.error("Por favor, insira seu nome.");
      return;
    }
    
    if (!email) {
      toast.error("Por favor, insira seu email.");
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
          name: name.trim(),
          phone: phone ? cleanPhone(phone) : null
        },
      });

      if (error || !data?.success) {
        const errorMsg = data?.error || error?.message || "Erro ao enviar link";
        if (errorMsg.includes("rate limit") || errorMsg.includes("muitas tentativas")) {
          toast.error("Muitas tentativas. Aguarde alguns minutos.");
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

  const handleWhatsAppAccess = async () => {
    if (!name.trim()) {
      toast.error("Por favor, insira seu nome.");
      return;
    }
    
    if (!email) {
      toast.error("Por favor, insira seu email.");
      return;
    }

    if (!phone) {
      toast.error("Por favor, insira seu WhatsApp.");
      return;
    }
    
    if (!isValidBRPhone(phone)) {
      toast.error("Telefone inválido. Use DDD + número (10-11 dígitos).");
      return;
    }

    setIsLoadingWhatsApp(true);

    try {
      const { data, error } = await supabase.functions.invoke("trigger-zaia-welcome", {
        body: { 
          email: email.toLowerCase().trim(), 
          name: name.trim(),
          phone: cleanPhone(phone)
        },
      });

      if (error || !data?.success) {
        toast.error(data?.error || "Erro ao acionar WhatsApp.");
        console.error("WhatsApp error:", error || data?.error);
        return;
      }

      // Open WhatsApp
      window.open(data.whatsappUrl, "_blank");
      toast.success("WhatsApp aberto! Aguarde a mensagem.");
    } catch (error) {
      console.error("Error triggering WhatsApp:", error);
      toast.error("Erro ao processar. Tente novamente.");
    } finally {
      setIsLoadingWhatsApp(false);
    }
  };

  const handleResendLink = async () => {
    setMagicLinkSent(false);
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("send-magic-link", {
        body: { 
          email: email.toLowerCase().trim(), 
          name: name.trim(),
          phone: phone ? cleanPhone(phone) : null
        },
      });

      if (error || !data?.success) {
        toast.error(data?.error || "Erro ao reenviar link.");
        return;
      }

      setMagicLinkSent(true);
      toast.success("Link reenviado com sucesso!");
    } catch (error) {
      toast.error("Erro ao processar.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/10 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg text-center border-primary/20 shadow-2xl">
        <CardContent className="pt-12 pb-8 px-8 space-y-6">
          {/* Success Icon */}
          <div className="relative mx-auto w-24 h-24">
            <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping" />
            <div className="relative w-24 h-24 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center">
              <CheckCircle className="h-12 w-12 text-white" />
            </div>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-primary flex items-center justify-center gap-2">
              <Sparkles className="h-6 w-6" />
              Pagamento Confirmado!
              <Sparkles className="h-6 w-6" />
            </h1>
            <p className="text-xl text-foreground">
              Preencha seus dados para receber seu acesso
            </p>
          </div>

          {/* Access Notice */}
          <div className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-xl p-5">
            <div className="flex items-center gap-3">
              <CreditCard className="h-6 w-6 text-green-600 dark:text-green-400 flex-shrink-0" />
              <div className="text-left">
                <p className="font-semibold text-green-800 dark:text-green-200">Libere Seu Acesso</p>
                <p className="text-sm text-green-700 dark:text-green-300">
                  Escolha receber por e-mail ou WhatsApp.
                </p>
              </div>
            </div>
          </div>

          {/* Magic Link Form */}
          {!magicLinkSent ? (
            <div className="space-y-4 bg-primary/5 rounded-xl p-6 border border-primary/20">
              <div className="space-y-2">
                <p className="font-semibold text-foreground">
                  📧 Receba seu link de acesso
                </p>
                <p className="text-sm text-muted-foreground">
                  Use <strong>exatamente o mesmo e-mail</strong> que você usou para fazer o pagamento:
                </p>
              </div>
              
              <div className="space-y-3">
                <Input
                  type="text"
                  placeholder="Seu nome"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  disabled={isLoading || isLoadingWhatsApp}
                  className="text-center text-lg h-12 border-primary/30 focus:border-primary"
                />
                <Input
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading || isLoadingWhatsApp}
                  className="text-center text-lg h-12 border-primary/30 focus:border-primary"
                />
                <Input
                  type="tel"
                  placeholder="(85) 98641-1294 (opcional)"
                  value={phone}
                  onChange={handlePhoneChange}
                  disabled={isLoading || isLoadingWhatsApp}
                  className="text-center text-lg h-12 border-primary/30 focus:border-primary"
                />
              </div>

              {/* Email Button */}
              <Button
                onClick={handleSendMagicLink} 
                className="w-full h-12 text-base" 
                size="lg"
                disabled={isLoading || isLoadingWhatsApp}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Mail className="mr-2 h-5 w-5" />
                    Enviar Link por E-mail
                  </>
                )}
              </Button>

              {/* Separator */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-muted"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-primary/5 px-2 text-muted-foreground">ou</span>
                </div>
              </div>

              {/* WhatsApp Button */}
              <Button
                onClick={handleWhatsAppAccess}
                variant="outline"
                className="w-full h-12 text-base border-green-500 text-green-700 hover:bg-green-50 dark:text-green-400 dark:hover:bg-green-950/30"
                size="lg"
                disabled={isLoading || isLoadingWhatsApp}
              >
                {isLoadingWhatsApp ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Abrindo WhatsApp...
                  </>
                ) : (
                  <>
                    <Phone className="mr-2 h-5 w-5" />
                    Receber no WhatsApp
                  </>
                )}
              </Button>
              <p className="text-xs text-muted-foreground">
                Fale com nossa IA e receba o link de acesso no WhatsApp
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                <p className="text-green-800 dark:text-green-200 font-medium">
                  ✉️ Link enviado para {email}
                </p>
                <p className="text-green-600 dark:text-green-400 text-sm mt-1">
                  Verifique sua caixa de entrada e spam. O link expira em 1 hora.
                </p>
              </div>
              
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
                  <>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Reenviar Link
                  </>
                )}
              </Button>
            </div>
          )}

          {/* Separator */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-muted"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">ou</span>
            </div>
          </div>

          {/* Already have account */}
          <Button 
            variant="ghost" 
            onClick={() => navigate("/auth")}
            className="w-full"
          >
            <ArrowRight className="mr-2 h-4 w-4" />
            Já tenho conta - Fazer Login
          </Button>

          {/* Support */}
          <div className="bg-muted/50 rounded-lg p-4 text-sm text-muted-foreground">
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

export default PosPagamento;
