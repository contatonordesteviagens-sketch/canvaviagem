import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Lock, CreditCard, Loader2 } from "lucide-react";

interface SubscriptionGateProps {
  children: React.ReactNode;
  /**
   * block: mostra apenas o card de bloqueio
   * preview: mostra o conteúdo em “prévia” (opacidade/blur) com CTA por cima
   */
  mode?: "block" | "preview";
}

export const SubscriptionGate = ({ children, mode = "block" }: SubscriptionGateProps) => {
  const navigate = useNavigate();
  const { user, loading, subscription } = useAuth();

  const isLoading = loading || subscription.loading;
  const isAllowed = !!user && !!subscription.subscribed;
  const shouldPreview = mode === "preview";

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isAllowed) return <>{children}</>;

  // ----- Preview (conteúdo visível “por trás”, mas bloqueado) -----
  if (shouldPreview) {
    const ctaText = user ? "Finalizar assinatura" : "Entrar e assinar";
    const ctaAction = () => (user ? navigate("/planos") : navigate("/auth"));

    return (
      <div
        className="relative"
        onClickCapture={(e) => {
          const target = e.target as HTMLElement | null;
          const clickedCta = target?.closest('[data-subscription-cta="true"]');
          if (clickedCta) return;
          e.preventDefault();
          e.stopPropagation();
          ctaAction();
        }}
      >
        <div className="opacity-35 blur-[1px] select-none">
          {children}
        </div>

        <div className="absolute inset-0 flex items-center justify-center p-4">
          <Card data-subscription-cta="true" className="max-w-md w-full mx-auto">
            <CardContent className="pt-6 text-center space-y-4">
              <div className="h-16 w-16 mx-auto rounded-full bg-muted flex items-center justify-center">
                <Lock className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold">Conteúdo Premium</h3>
              <p className="text-muted-foreground">
                Veja uma prévia — para acessar tudo, ative sua assinatura.
              </p>
              <Button onClick={ctaAction} className="w-full">
                <CreditCard className="mr-2 h-4 w-4" />
                {ctaText}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // ----- Block (comportamento antigo) -----
  if (!user) {
    return (
      <Card className="max-w-md mx-auto my-8">
        <CardContent className="pt-6 text-center space-y-4">
          <div className="h-16 w-16 mx-auto rounded-full bg-muted flex items-center justify-center">
            <Lock className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-semibold">Acesso Restrito</h3>
          <p className="text-muted-foreground">Faça login para acessar as ferramentas.</p>
          <Button onClick={() => navigate("/auth")} className="w-full">
            Fazer Login
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-md mx-auto my-8">
      <CardContent className="pt-6 text-center space-y-4">
        <div className="h-16 w-16 mx-auto rounded-full bg-muted flex items-center justify-center">
          <Lock className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-xl font-semibold">Conteúdo Premium</h3>
        <p className="text-muted-foreground">Para acessar as ferramentas, ative sua assinatura.</p>
        <Button onClick={() => navigate("/planos")} className="w-full">
          <CreditCard className="mr-2 h-4 w-4" />
          Ver Planos
        </Button>
      </CardContent>
    </Card>
  );
};
