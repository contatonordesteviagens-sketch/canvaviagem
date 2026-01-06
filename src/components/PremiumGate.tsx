import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Lock, Loader2 } from "lucide-react";

interface PremiumGateProps {
  children: React.ReactNode;
}

export const PremiumGate = ({ children }: PremiumGateProps) => {
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

  // If not logged in, show login prompt with preview
  if (!user) {
    return (
      <div className="relative">
        {/* Blurred preview */}
        <div className="blur-sm pointer-events-none select-none opacity-60">
          {children}
        </div>
        
        {/* Overlay */}
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-card border rounded-xl p-6 md:p-8 max-w-md mx-4 text-center shadow-xl">
            <div className="h-16 w-16 mx-auto rounded-full bg-muted flex items-center justify-center mb-4">
              <Lock className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Conteúdo Exclusivo</h3>
            <p className="text-muted-foreground mb-6">
              Faça login para acessar as ferramentas premium.
            </p>
            <Button onClick={() => navigate("/auth")} className="w-full" size="lg">
              Fazer Login
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // If logged in but no subscription, show subscription prompt with preview
  if (!subscription.subscribed) {
    return (
      <div className="relative">
        {/* Blurred preview */}
        <div className="blur-sm pointer-events-none select-none opacity-60">
          {children}
        </div>
        
        {/* Overlay */}
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-card border rounded-xl p-6 md:p-8 max-w-md mx-4 text-center shadow-xl">
            <div className="h-16 w-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Lock className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Conteúdo Exclusivo para Assinantes</h3>
            <p className="text-muted-foreground mb-6">
              Assine agora para desbloquear todos os recursos e ferramentas.
            </p>
            <Button 
              onClick={() => navigate("/planos")} 
              className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90" 
              size="lg"
            >
              🔓 DESBLOQUEAR ACESSO
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // User is subscribed, show content
  return <>{children}</>;
};
