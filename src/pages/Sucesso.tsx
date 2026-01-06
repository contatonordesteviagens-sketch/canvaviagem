import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle, Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

const Sucesso = () => {
  const navigate = useNavigate();
  const { refreshSubscription, subscription } = useAuth();
  const [countdown, setCountdown] = useState(5);

  // Tenta atualizar a assinatura algumas vezes logo após o checkout
  useEffect(() => {
    let tries = 0;
    const maxTries = 15; // ~30s

    const poll = setInterval(() => {
      tries += 1;
      refreshSubscription();
      if (tries >= maxTries) clearInterval(poll);
    }, 2000);

    return () => clearInterval(poll);
  }, [refreshSubscription]);

  // Assim que a assinatura virar ativa, manda pro conteúdo desbloqueado
  useEffect(() => {
    if (subscription.subscribed) {
      navigate("/");
    }
  }, [subscription.subscribed, navigate]);

  // Redirecionamento automático (fallback)
  useEffect(() => {
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
  }, [navigate]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardContent className="pt-8 pb-8 text-center space-y-6">
          <div className="relative">
            <div className="w-20 h-20 mx-auto bg-primary rounded-full flex items-center justify-center shadow-lg">
              <CheckCircle className="w-12 h-12 text-primary-foreground" />
            </div>
            <Sparkles className="absolute top-0 right-1/4 w-6 h-6 text-muted-foreground animate-bounce" />
            <Sparkles className="absolute bottom-0 left-1/4 w-4 h-4 text-muted-foreground animate-bounce delay-100" />
          </div>

          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-foreground">🎉 Parabéns!</h1>
            <p className="text-xl text-primary font-semibold">Sua assinatura foi ativada!</p>
          </div>

          <div className="bg-muted rounded-lg p-4 space-y-2">
            <p className="text-muted-foreground">
              Bem-vindo à família <span className="font-bold text-primary">Canva Viagens</span>!
            </p>
            <p className="text-sm text-muted-foreground">
              Agora você tem acesso completo a todos os templates, vídeos, legendas e ferramentas exclusivas.
            </p>
          </div>

          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Redirecionando em <span className="font-bold text-primary">{countdown}</span> segundos...
            </p>

            <Button onClick={() => navigate("/")} className="w-full">
              Acessar Conteúdo Agora
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Sucesso;
