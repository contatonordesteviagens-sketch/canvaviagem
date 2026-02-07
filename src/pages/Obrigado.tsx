import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CheckCircle, Mail, Loader2, ArrowRight, MessageCircle, Sparkles, RefreshCw } from "lucide-react";
import { trackPurchase, trackSubscribe } from "@/lib/meta-pixel";
import { trackESPurchase, trackESSubscribe } from "@/lib/meta-pixel-es";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { SpanishPixel } from "@/components/SpanishPixel";
import logo from "@/assets/logo.png";

const Obrigado = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const emailFromUrl = searchParams.get('email');
  const sourceFromUrl = searchParams.get('source');
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const [tracked, setTracked] = useState(false);

  useEffect(() => {
    if (emailFromUrl) {
      setEmail(decodeURIComponent(emailFromUrl));
    }
  }, [emailFromUrl]);

  useEffect(() => {
    if (!tracked && sourceFromUrl === 'checkout') {
      trackPurchase(29.00, 'BRL');
      trackSubscribe(29.00, 'BRL', 29.00 * 12);
      trackESPurchase(9.09, 'USD');
      trackESSubscribe(9.09, 'USD', 9.09 * 12);
      setTracked(true);
    }
  }, [tracked, sourceFromUrl]);

  const handleSendMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      toast.error("Por favor, insira seu email.");
      return;
    }

    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("send-magic-link", {
        body: { email: email.toLowerCase().trim() },
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

  const handleResendLink = async () => {
    setMagicLinkSent(false);
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("send-magic-link", {
        body: { email: email.toLowerCase().trim() },
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

  const supportWhatsAppUrl = "https://wa.me/5585986411294?text=Fiz%20a%20compra%20do%20Canva%20Viagem%20e%20gostaria%20de%20suporte";
  const generalWhatsAppUrl = "https://wa.me/5585986411294?text=Gostaria%20de%20falar%20sobre%20o%20Canva%20Viagem";

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/10 flex items-center justify-center p-4">
      <SpanishPixel />
      <Card className="w-full max-w-lg text-center border-primary/20 shadow-2xl">
        <CardContent className="pt-12 pb-8 px-6 md:px-8 space-y-6">
          {/* Logo */}
          <div className="flex justify-center mb-2">
            <img src={logo} alt="Canva Viagem" className="h-16 md:h-20 w-auto" />
          </div>

          {/* Success Icon */}
          <div className="relative mx-auto w-16 h-16 md:w-20 md:h-20">
            <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping" />
            <div className="relative w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center">
              <CheckCircle className="h-8 w-8 md:h-10 md:w-10 text-white" />
            </div>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent flex items-center justify-center gap-2">
              <Sparkles className="h-5 w-5 md:h-6 md:w-6 text-primary" />
              Canva Viagem Liberado!
              <Sparkles className="h-5 w-5 md:h-6 md:w-6 text-accent" />
            </h1>
            <p className="text-base md:text-lg text-foreground font-semibold">
              Seu acesso liberado
            </p>
          </div>

          {/* Magic Link Form */}
          {!magicLinkSent ? (
            <div className="space-y-5 bg-gradient-to-br from-primary/5 to-accent/5 rounded-xl p-5 md:p-6 border-2 border-primary/20">
              <div className="space-y-2">
                <p className="font-bold text-base md:text-lg text-foreground">
                  📧 Preencha seu e-mail para receber seu acesso
                </p>
                <p className="text-xs md:text-sm text-muted-foreground">
                  Use <strong>exatamente o mesmo e-mail</strong> que você usou para fazer o pagamento
                </p>
              </div>

              <Input
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
                className="text-center text-base md:text-lg h-12 md:h-14 border-2 border-primary/30 focus:border-primary font-medium"
              />

              <Button
                onClick={handleSendMagicLink}
                className="w-full h-12 md:h-14 text-base md:text-lg font-bold bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 shadow-lg"
                size="lg"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Mail className="mr-2 h-5 w-5" />
                    Enviar Link de Acesso
                  </>
                )}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-green-50 dark:bg-green-950/20 border-2 border-green-300 dark:border-green-700 rounded-lg p-4 md:p-5">
                <p className="text-green-800 dark:text-green-200 font-bold text-base md:text-lg flex items-center justify-center gap-2 mb-2">
                  <Mail className="h-5 w-5" />
                  Link enviado para {email}
                </p>
                <p className="text-green-700 dark:text-green-300 text-sm md:text-base">
                  Verifique sua caixa de entrada. <strong>Não esqueça de verificar a pasta de spam ou lixo eletrônico!</strong> O link expira em 1 hora.
                </p>
              </div>

              <Button
                variant="outline"
                onClick={handleResendLink}
                disabled={isLoading}
                className="w-full h-12 font-semibold border-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Reenviando...
                  </>
                ) : (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Reenviar Link por Email
                  </>
                )}
              </Button>
            </div>
          )}

          {/* Separator */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t-2 border-muted"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase font-semibold">
              <span className="bg-card px-3 text-muted-foreground">ou</span>
            </div>
          </div>

          {/* Already have account */}
          <Button
            variant="outline"
            onClick={() => navigate("/auth")}
            className="w-full h-12 font-bold text-base border-2 hover:bg-primary/10"
          >
            <ArrowRight className="mr-2 h-5 w-5" />
            Já tem uma conta? Fazer Login
          </Button>

          {/* Support */}
          <div className="bg-gradient-to-br from-muted/80 to-muted/50 rounded-xl p-4 md:p-5 border-2 border-muted space-y-3">
            <p className="font-bold text-sm md:text-base">Precisa de ajuda?</p>

            {/* Support Button - Purchase Help */}
            <a
              href={supportWhatsAppUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block"
            >
              <Button
                variant="default"
                className="w-full bg-green-600 hover:bg-green-700 text-white font-bold h-11"
              >
                <MessageCircle className="mr-2 h-5 w-5" />
                Suporte - Fiz a Compra
              </Button>
            </a>

            {/* General WhatsApp */}
            <a
              href={generalWhatsAppUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-primary hover:underline font-semibold w-full justify-center"
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

export default Obrigado;
