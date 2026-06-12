import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Crown, Sparkles, Check, ArrowRight, Shield, Globe, Compass, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect, memo } from "react";

const PremiumGateModalComponent = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const navigate = useNavigate();
  const [timeLeft, setTimeLeft] = useState(5);

  useEffect(() => {
    if (!isOpen) {
      setTimeLeft(5);
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          navigate("/inicio");
          onClose();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, navigate, onClose]);

  const handleRedirect = () => {
    navigate("/inicio");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[500px] p-0 overflow-hidden border border-cyan-500/20 bg-[#03070F] rounded-3xl shadow-2xl shadow-cyan-500/5 relative">
        {/* Soft Cyan Background Glow */}
        <div 
          className="absolute inset-0 opacity-20 pointer-events-none"
          style={{
            backgroundImage: "radial-gradient(circle at 50% 30%, rgba(0,229,255,0.15) 0%, transparent 60%)"
          }}
        />

        <div className="p-6 md:p-8 flex flex-col items-center justify-between z-10 relative text-center">
          {/* Header Icon */}
          <div className="w-16 h-16 rounded-full bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mb-6 relative">
            <Crown className="w-8 h-8 text-cyan-400 animate-bounce" />
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-orange-500 rounded-full flex items-center justify-center">
              <Sparkles className="w-2.5 h-2.5 text-white animate-pulse" />
            </div>
          </div>

          {/* Headline & Description */}
          <div className="space-y-3 mb-6">
            <h3 className="text-xl md:text-2xl font-black text-white tracking-tight leading-tight">
              Desbloqueando Recursos Premium...
            </h3>
            <p className="text-xs text-white/60 max-w-sm mx-auto leading-relaxed">
              Prepare-se para o próximo nível. Estamos estabelecendo uma conexão segura com nossa biblioteca de alta conversão.
            </p>
          </div>

          {/* Countdown Visual Indicator */}
          <div className="w-full max-w-[280px] bg-white/5 border border-white/10 rounded-2xl p-4 mb-6 flex flex-col items-center gap-2">
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-black text-cyan-400">{timeLeft}</span>
              <span className="text-[10px] text-white/40 uppercase font-bold tracking-widest">segundos</span>
            </div>
            
            {/* Progress Bar */}
            <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 transition-all duration-1000 ease-linear rounded-full"
                style={{ width: `${(timeLeft / 5) * 100}%` }}
              />
            </div>
            <p className="text-[10px] text-white/40 font-semibold tracking-wide">Direcionando você para o início</p>
          </div>

          {/* Hype Benefits List */}
          <div className="w-full grid grid-cols-2 gap-3 mb-8 text-left max-w-sm mx-auto">
            {[
              { icon: Compass, label: "Vídeos 4K Sem Limite" },
              { icon: Star, label: "Fábrica de Anúncios I.A" },
              { icon: Globe, label: "Criador de Sites Automático" },
              { icon: Shield, label: "Garantia Dupla Sem Risco" }
            ].map((b, i) => (
              <div key={i} className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/[0.02] border border-white/5 text-[11px] text-white/80 font-bold">
                <b.icon className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
                <span>{b.label}</span>
              </div>
            ))}
          </div>

          {/* Interactive Controls */}
          <div className="w-full space-y-3">
            <Button
              onClick={handleRedirect}
              className="w-full bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-500 hover:to-blue-600 text-black font-black py-6 rounded-xl text-sm transition-all shadow-lg shadow-cyan-500/20 uppercase tracking-wider border-0"
            >
              Acessar Agora <ArrowRight className="w-4 h-4 ml-1.5 inline" />
            </Button>

            <button
              onClick={onClose}
              className="w-full text-center text-xs text-white/40 hover:text-white font-bold transition-colors py-1.5 bg-transparent border-0 cursor-pointer"
            >
              Permanecer na Página Atual
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export const PremiumGateModal = memo(PremiumGateModalComponent);
