import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Crown, Sparkles, Check, X, Shield, Download, Bot, Star } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useNavigate } from "react-router-dom";
import { useState, memo } from "react";


type BillingCycle = 'monthly' | 'annual';

const PremiumGateModalComponent = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const [billingCycle, setBillingCycle] = useState<BillingCycle>('annual');

  const isPT = language === 'pt';

  const prices = {
    monthly: {
      value: "R$ 29,00",
      period: "/mês",
      originalValue: "R$ 44,62",
      description: "Pagamento recorrente mensal",
      discount: "-35% OFF",
      stripeLink: "https://buy.stripe.com/8x26oIgGuej656zaAY8so05"
    },
    annual: {
      value: "R$ 16,41",
      period: "/mês",
      description: "Plano Anual R$ 197,00",
      discount: "42% DESC.",
      stripeLink: "https://buy.stripe.com/dRm8wQ75U1wk7eH9wU8so09"
    }
  };

  const currentPrice = prices[billingCycle];

  const handleSubscribe = () => {
    window.open(currentPrice.stripeLink, '_blank');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[750px] p-0 overflow-hidden border-none bg-white rounded-[32px] shadow-2xl">
        <div className="flex flex-col md:flex-row min-h-[480px]">
          {/* Left Side: Content */}
          <div className="flex-1 p-8 md:p-10 flex flex-col justify-between z-10 bg-white">
            <div className="space-y-6">
              <div className="space-y-2">
                <h2 className="text-3xl md:text-3xl font-black text-[#1A1A1A] leading-tight">
                  {isPT ? "Desbloquear funcionalidades e conteúdo Premium" : "Desbloquea funcionalidades y contenido Premium"}
                </h2>
              </div>

              {/* Benefits List */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-6">
                {[
                  { icon: Bot, text: isPT ? "Ferramentas de IA" : "Herramientas de IA" },
                  { icon: Crown, text: isPT ? "Conteúdo Premium" : "Contenido Premium" },
                  { icon: Download, text: isPT ? "Downloads ilimitados" : "Descargas ilimitadas" },
                  { icon: Shield, text: isPT ? "Garantia de 7 dias" : "Garantía de 7 días" },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-2 text-[#4A4A4A] font-medium text-sm">
                    <item.icon className="w-4 h-4 text-[#8B5CF6]" />
                    <span>{item.text}</span>
                  </div>
                ))}
              </div>

              {/* Price Selectors */}
              <div className="space-y-4 pt-4">
                <div className="flex bg-[#F5F5F5] rounded-full p-1 w-fit border border-black/5">
                  <button
                    onClick={() => setBillingCycle('monthly')}
                    className={`px-6 py-2 text-sm font-bold rounded-full transition-all ${billingCycle === 'monthly' ? "bg-white text-[#1A1A1A] shadow-sm" : "text-[#6B7280] hover:text-[#4A4A4A]"
                      }`}
                  >
                    Mensal
                  </button>
                  <button
                    onClick={() => setBillingCycle('annual')}
                    className={`px-6 py-2 text-sm font-bold rounded-full transition-all ${billingCycle === 'annual' ? "bg-[#1A1A1A] text-white shadow-mdScale select-none" : "text-[#6B7280] hover:text-[#4A4A4A]"
                      }`}
                  >
                    Anual
                  </button>
                </div>

                <div className="space-y-1">
                  {'originalValue' in currentPrice && (currentPrice as any).originalValue && (
                    <p className="text-sm text-[#9CA3AF] line-through">
                      De {(currentPrice as any).originalValue}/mês
                    </p>
                  )}
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-black text-[#1A1A1A]">{currentPrice.value}</span>
                    <span className="text-[#6B7280] font-medium text-lg">{currentPrice.period}</span>
                    {currentPrice.discount && (
                      <div className="ml-2 bg-[#FFB800] text-[#1A1A1A] text-[10px] font-black px-2 py-1 rounded leading-none uppercase tracking-wider">
                        {currentPrice.discount}
                      </div>
                    )}
                  </div>
                  <p className="text-sm text-[#6B7280] font-medium">{currentPrice.description}</p>
                </div>
              </div>
            </div>

            <div className="space-y-4 pt-8">
              <Button
                onClick={handleSubscribe}
                className="btn-shine w-full bg-[#FFB800] hover:bg-[#E6A600] text-[#1A1A1A] font-black py-7 text-xl rounded-xl shadow-[0_4px_0_rgb(204,147,0)] hover:shadow-none translate-y-[-4px] hover:translate-y-0 transition-all active:translate-y-0 active:shadow-none"
              >
                {isPT ? "Seja Premium" : "Hazte Premium"}
              </Button>

              <button
                onClick={() => { navigate("/planos"); onClose(); }}
                className="w-full text-center text-sm font-bold text-[#1A1A1A] hover:underline"
              >
                {isPT ? "Ver planos com geração ilimitada" : "Ver planes con generación ilimitada"}
              </button>
            </div>
          </div>

          {/* Right Side: Professional Banner */}
          <div className="hidden md:flex flex-1 relative overflow-hidden group bg-gradient-to-br from-[#8B5CF6] via-[#6D28D9] to-[#4C1D95] items-center justify-center">
            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_30%_40%,rgba(255,255,255,0.3),transparent_60%)]" />
            <div className="relative z-10 text-center p-8 space-y-4">
              <Crown className="w-16 h-16 text-amber-400 mx-auto drop-shadow-lg" />
              <p className="text-white/90 font-bold text-2xl leading-tight">Premium</p>
              <p className="text-white/60 text-sm">Conteúdo exclusivo para você</p>
            </div>
          </div>
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-white/20 backdrop-blur-md hover:bg-white/40 border border-white/20 transition-all z-50 text-white md:text-slate-400 md:hover:text-slate-600 md:bg-transparent md:border-none"
        >
          <X className="w-6 h-6" />
        </button>
      </DialogContent>
    </Dialog>
  );
};

export const PremiumGateModal = memo(PremiumGateModalComponent);
