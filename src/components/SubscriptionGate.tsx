import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Lock, CreditCard, Loader2 } from "lucide-react";

interface SubscriptionGateProps {
  children: React.ReactNode;
}

export const SubscriptionGate = ({ children }: SubscriptionGateProps) => {
  const navigate = useNavigate();
  const { user, loading, subscription } = useAuth();

  // Show loading state
  if (loading || subscription.loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // If not logged in, show login prompt
  if (!user) {
    return (
      <Card className="max-w-md mx-auto my-8">
        <CardContent className="pt-6 text-center space-y-4">
          <div className="h-16 w-16 mx-auto rounded-full bg-muted flex items-center justify-center">
            <Lock className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-semibold">Acesso Restrito</h3>
          <p className="text-muted-foreground">
            Faça login para acessar as ferramentas.
          </p>
          <Button onClick={() => navigate("/auth")} className="w-full">
            Fazer Login
          </Button>
        </CardContent>
      </Card>
    );
  }

  // If logged in but no subscription, show subscription prompt
  if (!subscription.subscribed) {
    return (
      <Card className="max-w-md mx-auto my-8">
        <CardContent className="pt-6 text-center space-y-4">
          <div className="h-16 w-16 mx-auto rounded-full bg-muted flex items-center justify-center">
            <Lock className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-semibold">Conteúdo Premium</h3>
          <p className="text-muted-foreground">
            Para acessar as ferramentas, ative sua assinatura.
          </p>
          <Button onClick={() => navigate("/planos")} className="w-full">
            <CreditCard className="mr-2 h-4 w-4" />
            Ver Planos
          </Button>
        </CardContent>
      </Card>
    );
  }

  // User is subscribed, show content
  return <>{children}</>;
};
