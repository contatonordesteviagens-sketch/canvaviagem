import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CheckCircle, Mail, Loader2, ArrowRight, MessageCircle, Sparkles, RefreshCw, Clock, CreditCard, FileText } from "lucide-react";
import { trackPurchase, trackSubscribe } from "@/lib/meta-pixel";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const PosPagamento = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [magicLinkSent, setMagicLinkSent] = useState(false);

  useEffect(() => {
    // Dispara evento de compra ao carregar a página
    trackPurchase(9.90, 'BRL');
    trackSubscribe(9.90, 'BRL', 9.90 * 12);
    
    console.log('Meta Pixel: Purchase event fired (R$ 9,90)');
  }, []);

  const handleSendMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast.error("Por favor, insira seu email.");
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
        },
      });

      if (error) {
        if (error.message.includes("rate limit")) {
          toast.error("Muitas tentativas. Aguarde alguns minutos.");
        } else {
          toast.error("Erro ao enviar link. Tente novamente.");
        }
        console.error("Magic link error:", error);
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
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
        },
      });

      if (error) {
        toast.error("Erro ao reenviar link.");
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
              Sua assinatura foi ativada com sucesso!
            </p>
          </div>

          {/* Info Box */}
          <div className="bg-primary/10 rounded-xl p-6 space-y-3">
            <div className="flex items-center justify-center gap-2 text-primary font-semibold">
              <Mail className="h-5 w-5" />
              <span>Verifique seu email</span>
            </div>
            <p className="text-muted-foreground text-sm">
              Enviamos um email de boas-vindas com as instruções de acesso para o email usado na compra.
            </p>
          </div>

          {/* Payment Method Notice */}
          <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl p-5 space-y-4">
            <h3 className="font-semibold text-amber-800 dark:text-amber-200 flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Prazo de liberação do acesso
            </h3>
            
            <div className="space-y-3 text-sm">
              {/* Credit Card */}
              <div className="flex items-start gap-3 p-3 bg-green-50 dark:bg-green-950/30 rounded-lg border border-green-200 dark:border-green-800">
                <CreditCard className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                <div className="text-left">
                  <p className="font-medium text-green-800 dark:text-green-200">Cartão de Crédito</p>
                  <p className="text-green-700 dark:text-green-300">Acesso liberado <strong>imediatamente</strong> após a confirmação.</p>
                </div>
              </div>
              
              {/* Boleto */}
              <div className="flex items-start gap-3 p-3 bg-orange-50 dark:bg-orange-950/30 rounded-lg border border-orange-200 dark:border-orange-800">
                <FileText className="h-5 w-5 text-orange-600 dark:text-orange-400 mt-0.5 flex-shrink-0" />
                <div className="text-left">
                  <p className="font-medium text-orange-800 dark:text-orange-200">Boleto Bancário</p>
                  <p className="text-orange-700 dark:text-orange-300">
                    Acesso liberado em <strong>até 3 dias úteis</strong> após o pagamento ser compensado pelo banco.
                  </p>
                </div>
              </div>
            </div>
            
            <p className="text-xs text-amber-700 dark:text-amber-400 text-center">
              Você receberá um email assim que seu acesso for liberado.
            </p>
          </div>

          {/* Magic Link Form */}
          {!magicLinkSent ? (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Digite o email usado na compra para receber o link de acesso:
              </p>
              <form onSubmit={handleSendMagicLink} className="space-y-3">
                <Input
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                  className="text-center"
                />
                <Button 
                  type="submit" 
                  className="w-full" 
                  size="lg"
                  disabled={isLoading}
                >
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

export default PosPagamento;
