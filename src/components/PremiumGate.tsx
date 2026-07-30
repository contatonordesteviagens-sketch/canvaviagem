import { useAuth } from "@/contexts/AuthContext";
import { useEntitlements } from "@/contexts/EntitlementsContext";
import { Lock, Loader2 } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { buildUpgradePath } from "@/lib/eliteOffer";

interface PremiumGateProps {
  children: React.ReactNode;
  onPremiumClick?: () => void;
}

export const PremiumGate = ({
  children,
  onPremiumClick
}: PremiumGateProps) => {
  const {
    user,
    loading,
  } = useAuth();
  const { can, loading: entitlementsLoading } = useEntitlements();
  const location = useLocation();
  const navigate = useNavigate();

  // Show loading state
  if (loading || entitlementsLoading) {
    return <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>;
  }

  // Check if children is a single element and has an isPremium prop
  const isChildrenPremium = (children as any)?.props?.isPremium !== false;

  // If not logged in OR no subscription AND it's a premium item, show blurred preview
  if ((!user || !can("premium_content.open")) && isChildrenPremium) {
    const handleAction = () => {
      if (onPremiumClick) {
        onPremiumClick();
      } else {
        navigate(buildUpgradePath("premium_content", location.pathname));
      }
    };

    return <div className="relative group/gate">
        {/* Blurred/mosaic preview - content is visible but interaction blocked */}
        <div className="blur-[3px] pointer-events-none select-none opacity-80 transition-all duration-500 group-hover/gate:blur-[5px]" style={{
        // Subtle mosaic effect via CSS
        filter: 'blur(3px) contrast(1.05)'
      }}>
          {children}
        </div>
        
        {/* Clickable overlay - opens Conversion Popup or Stripe */}
        <div className="absolute inset-0 cursor-pointer group" onClick={handleAction} role="button" tabIndex={0} onKeyDown={e => {
        if (e.key === 'Enter' || e.key === ' ') {
          handleAction();
        }
      }}>
          {/* Subtle gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/20 to-background/50" />
          
          {/* Floating CTA that appears on hover/focus */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 group-focus:opacity-100 transition-all duration-300">
            <div className="bg-white/95 backdrop-blur-md border-4 border-yellow-500 rounded-[30px] p-6 text-center shadow-2xl transform scale-95 group-hover:scale-100 transition-all duration-300 mx-6 max-w-[280px]">
              <div className="h-12 w-12 mx-auto rounded-full bg-yellow-500/10 flex items-center justify-center mb-4 border border-yellow-500/20">
                <Lock className="h-6 w-6 text-yellow-500" />
              </div>
              <h3 className="text-sm font-black italic uppercase tracking-tighter mb-1 text-black">CONTEÚDO PREMIUM</h3>
              <p className="text-[10px] font-bold text-zinc-500 mb-4 leading-tight">
                Assine agora para desbloquear este e centenas de outros materiais exclusivos.
              </p>
              <div className="inline-flex items-center gap-2 bg-black text-white px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg">
                DESBLOQUEAR ACESSO
              </div>
            </div>
          </div>
          
          {/* Persistent bottom hint */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-yellow-500 text-black border-none rounded-full px-4 py-1.5 shadow-lg flex items-center gap-2 text-[10px] font-black uppercase tracking-wider opacity-90 group-hover:opacity-100">
            <Lock className="h-3 w-3" />
            <span>EXCLUSIVO ELITE</span>
          </div>
        </div>
      </div>;
  }

  // User is subscribed, show content
  return <>{children}</>;
};
