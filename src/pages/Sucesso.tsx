import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle, Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

const Sucesso = () => {
  const navigate = useNavigate();
  const { refreshSubscription } = useAuth();
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    // Refresh subscription status
    refreshSubscription();

    // Countdown timer
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
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4">
      <Card className="max-w-md w-full border-2 border-primary/20 shadow-2xl">
        <CardContent className="pt-8 pb-8 text-center space-y-6">
          <div className="relative">
            <div className="w-20 h-20 mx-auto bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center shadow-lg animate-pulse">
              <CheckCircle className="w-12 h-12 text-white" />
            </div>
            <Sparkles className="absolute top-0 right-1/4 w-6 h-6 text-yellow-400 animate-bounce" />
            <Sparkles className="absolute bottom-0 left-1/4 w-4 h-4 text-yellow-400 animate-bounce delay-100" />
          </div>

          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-foreground">
              🎉 Parabéns!
            </h1>
            <p className="text-xl text-primary font-semibold">
              Sua assinatura foi ativada!
            </p>
          </div>

          <div className="bg-primary/10 rounded-lg p-4 space-y-2">
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
            
            <Button 
              onClick={() => navigate("/")}
              className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity"
            >
              Acessar Conteúdo Agora 🚀
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Sucesso;
