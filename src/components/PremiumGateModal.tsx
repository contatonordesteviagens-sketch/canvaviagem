import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Crown, Sparkles, Check, X, Shield, Download, Bot, Star } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useNavigate } from "react-router-dom";

// Standardize fonts and spacing for a premium feel
export const PremiumGateModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const navigate = useNavigate();
  const { language } = useLanguage();

  const handleSubscribe = () => {
    navigate("/planos");
    onClose();
  };

  const isPT = language === 'pt';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[700px] p-0 overflow-hidden border-none bg-white rounded-[32px] shadow-2xl">
        <div className="flex flex-col md:flex-row min-h-[450px]">
          {/* Left Side: Content */}
          <div className="flex-1 p-8 md:p-10 flex flex-col justify-between">
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

              {/* Price / Tabs Placeholder */}
              <div className="space-y-4 pt-4">
                <div className="flex bg-[#F5F5F5] rounded-lg p-1 w-fit">
                  <div className="px-6 py-1.5 text-sm font-semibold text-[#4A4A4A]">Mensal</div>
                  <div className="px-6 py-1.5 text-sm font-bold text-white bg-[#1A1A1A] rounded-md shadow-md">
                    Anual
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-black text-[#1A1A1A]">R$ 29,00</span>
                    <span className="text-[#6B7280] font-medium text-lg">/mês</span>
                    <div className="ml-2 bg-[#1A1A1A] text-white text-[10px] font-bold px-2 py-0.5 rounded leading-none">
                      39% DESC.
                    </div>
                  </div>
                  <p className="text-sm text-[#6B7280] font-medium">Pagamento recorrente mensal</p>
                </div>
              </div>
            </div>

            <div className="space-y-4 pt-8">
              <Button
                onClick={handleSubscribe}
                className="w-full bg-[#FFB800] hover:bg-[#E6A600] text-[#1A1A1A] font-black py-7 text-xl rounded-xl shadow-[0_4px_0_rgb(204,147,0)] hover:shadow-none translate-y-[-4px] hover:translate-y-0 transition-all"
              >
                {isPT ? "Seja Premium" : "Hazte Premium"}
              </Button>

              <button
                onClick={handleSubscribe}
                className="w-full text-center text-sm font-bold text-[#1A1A1A] hover:underline"
              >
                {isPT ? "Ver planos com geração ilimitada" : "Ver planes con generación ilimitada"}
              </button>
            </div>
          </div>

          {/* Right Side: Decorative Image/Pattern */}
          <div className="hidden md:flex flex-1 bg-gradient-to-br from-[#8B5CF6] to-[#D946EF] relative items-center justify-center p-12 overflow-hidden">
            {/* Mock design representation */}
            <div className="relative z-10 w-full aspect-square bg-white rounded-2xl shadow-2xl p-4 rotate-3 transform">
              <div className="w-full h-2/3 bg-slate-100 rounded-lg mb-3 overflow-hidden flex items-center justify-center">
                <div className="text-6xl">📸</div>
              </div>
              <div className="space-y-2">
                <div className="h-4 w-3/4 bg-slate-200 rounded"></div>
                <div className="h-3 w-1/2 bg-slate-100 rounded"></div>
              </div>
            </div>

            {/* Decorative circles */}
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-white/20 rounded-full blur-3xl"></div>
          </div>
        </div>

        {/* Close Button Override */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full hover:bg-black/5 transition-colors z-50 text-slate-400 hover:text-slate-600"
        >
          <X className="w-6 h-6" />
        </button>
      </DialogContent>
    </Dialog>
  );
};
