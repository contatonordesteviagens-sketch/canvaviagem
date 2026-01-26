import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Plane, Sparkles } from "lucide-react";

const Sucesso = () => {
  const navigate = useNavigate();
  const { refreshSubscription } = useAuth();
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    // Refresh subscription status
    refreshSubscription();

    // Countdown and redirect
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          navigate("/");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [navigate, refreshSubscription]);

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
              Bem-vindo(a) a bordo!
              <Sparkles className="h-6 w-6" />
            </h1>
            <p className="text-xl text-foreground">
              Sua assinatura foi ativada com sucesso!
            </p>
          </div>

          {/* Info */}
          <div className="bg-primary/10 rounded-xl p-6 space-y-3">
            <div className="flex items-center justify-center gap-2 text-primary font-semibold">
              <Plane className="h-5 w-5" />
              <span>Plano Ativo: Assinatura Mensal</span>
            </div>
            <p className="text-muted-foreground">
              Agora você tem acesso completo a todos os recursos do Canva Viagens!
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

          {/* Redirect countdown */}
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Redirecionando para a plataforma em{" "}
              <span className="font-bold text-primary">{countdown}</span> segundos...
            </p>
            <Button onClick={() => navigate("/")} className="w-full" size="lg">
              <Plane className="mr-2 h-4 w-4" />
              Acessar Plataforma Agora
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Sucesso;
