import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Sparkles, Heart, Mail, Phone, MessageCircle, ArrowRight } from "lucide-react";
import { trackPurchase, trackSubscribe } from "@/lib/meta-pixel";

const Obrigado = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email');
  const source = searchParams.get('source');
  const [tracked, setTracked] = useState(false);

  useEffect(() => {
    if (!tracked && source === 'checkout') {
      console.log('[Meta Debug] Tracking conversion on /obrigado');
      trackPurchase(29.00, 'BRL');
      trackSubscribe(29.00, 'BRL', 29.00 * 12);
      setTracked(true);
    }
  }, [tracked, source]);

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
              Seu acesso foi liberado com sucesso!
            </p>
          </div>

          {/* Email and WhatsApp Sent Notice */}
          <div className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-xl p-5 space-y-3">
            <div className="flex items-center gap-3">
              <Mail className="h-6 w-6 text-green-600 dark:text-green-400 flex-shrink-0" />
              <div className="text-left">
                <p className="font-semibold text-green-800 dark:text-green-200">Email Enviado!</p>
                <p className="text-sm text-green-700 dark:text-green-300">
                  Enviamos seu link de acesso para {email ? <strong>{email}</strong> : "seu email"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="h-6 w-6 text-green-600 dark:text-green-400 flex-shrink-0" />
              <div className="text-left">
                <p className="font-semibold text-green-800 dark:text-green-200">WhatsApp Enviado!</p>
                <p className="text-sm text-green-700 dark:text-green-300">
                  Nossa IA enviou uma mensagem no seu WhatsApp
                </p>
              </div>
            </div>
          </div>

          {/* Clear Instructions - NO EMAIL BUTTON */}
          <div className="bg-primary/10 rounded-xl p-6 space-y-3">
            <div className="flex items-center justify-center gap-2 text-primary font-semibold">
              <Heart className="h-5 w-5" />
              <span>Próximo Passo</span>
            </div>
            <p className="text-muted-foreground">
              Acesse seu email (Gmail, Outlook, Yahoo ou qualquer outro) e clique no link que enviamos.
            </p>
            <p className="text-sm text-muted-foreground">
              <strong>Dica:</strong> Verifique também a pasta de spam.
            </p>
          </div>

          {/* Features unlocked */}
          <div className="text-left space-y-2 bg-muted/50 rounded-lg p-4">
            <p className="font-semibold text-sm text-foreground mb-3">✅ Recursos liberados:</p>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li>• Vídeos Reels editáveis</li>
              <li>• Artes para Feed e Stories</li>
              <li>• Legendas prontas</li>
              <li>• Ferramentas de IA</li>
              <li>• Downloads ilimitados</li>
            </ul>
          </div>

          {/* Already logged in - PRIMARY CTA */}
          <Button variant="default" onClick={() => navigate("/")} className="w-full" size="lg">
            <ArrowRight className="mr-2 h-4 w-4" />
            Já estou logado - Acessar Plataforma
          </Button>

          {/* Support */}
          <div className="bg-muted/50 rounded-lg p-4 text-sm text-muted-foreground">
            <p className="font-medium mb-2">Não recebeu o email?</p>
            <a 
              href="https://wa.me/5585986411294?text=Ol%C3%A1%20adquiri%20o%20Canva%20Viagem.%20" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-primary hover:underline"
            >
              <MessageCircle className="h-4 w-4" />
              Fale conosco no WhatsApp
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Obrigado;
