import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Lock, Loader2 } from "lucide-react";
interface PremiumGateProps {
  children: React.ReactNode;
}
export const PremiumGate = ({
  children
}: PremiumGateProps) => {
  const navigate = useNavigate();
  const {
    user,
    loading,
    subscription
  } = useAuth();

  // Show loading state
  if (loading || subscription.loading) {
    return <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>;
  }

  // If not logged in OR no subscription, show blurred preview that redirects to /planos on click
  if (!user || !subscription.subscribed) {
    return <div className="relative">
        {/* Blurred/mosaic preview - content is visible but interaction blocked */}
        <div className="blur-[2px] pointer-events-none select-none opacity-80" style={{
        // Subtle mosaic effect via CSS
        filter: 'blur(2px) contrast(1.05)'
      }}>
          {children}
        </div>
        
        {/* Clickable overlay - redirects to plans page */}
        <div className="absolute inset-0 cursor-pointer group" onClick={() => navigate("/planos")} role="button" tabIndex={0} onKeyDown={e => {
        if (e.key === 'Enter' || e.key === ' ') {
          navigate("/planos");
        }
      }}>
          {/* Subtle gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/10 to-background/30" />
          
          {/* Floating CTA that appears on hover/focus */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 group-focus:opacity-100 transition-opacity duration-300">
            <div className="bg-card/95 backdrop-blur-md border-2 border-primary/20 rounded-2xl p-6 md:p-8 max-w-md text-center shadow-2xl transform group-hover:scale-105 transition-transform duration-300 mx-[26px] pl-[3px]">
              <div className="h-14 w-14 mx-auto rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Lock className="h-7 w-7 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2">Acesse o Conteúdo Completo Exclusivo para Assinantes</h3>
              <p className="text-muted-foreground mb-4 text-sm">
                Clique para desbloquear.
              </p>
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-primary to-accent text-primary-foreground px-6 py-3 rounded-full font-semibold shadow-lg">
                🔓 DESBLOQUEAR ACESSO
              </div>
            </div>
          </div>
          
          {/* Persistent bottom hint */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-card/90 backdrop-blur-sm border border-border/50 rounded-full px-4 py-2 shadow-lg flex items-center gap-2 text-sm">
            <Lock className="h-4 w-4 text-primary" />
            <span className="text-muted-foreground">Clique para desbloquear</span>
          </div>
        </div>
      </div>;
  }

  // User is subscribed, show content
  return <>{children}</>;
};