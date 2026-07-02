import { memo, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, CheckCircle2, Crown, ShieldCheck, Sparkles, Bot, Image as ImageIcon, Layout, Video } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { ELITE_OFFER } from "@/lib/eliteOffer";
import { hasStartAccess } from "@/lib/planAccess";

const PremiumGateModalComponent = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const navigate = useNavigate();
  const { subscription } = useAuth();
  const isStartSubscriber = hasStartAccess(subscription);

  const copy = useMemo(() => {
    if (isStartSubscriber) {
      return {
        eyebrow: "Upgrade Start para Elite",
        title: "Libere a Fábrica e transforme pacote em campanha",
        description:
          "Seu plano Start continua ativo para o Canva Viagem. O Elite libera a Fábrica completa: anúncios IA, páginas, CRM, roteiros e materiais de venda.",
        primary: "VER PLANOS ELITE",
        secondary: "Continuar no Start",
      };
    }

    return {
      eyebrow: "Acesso Elite",
      title: "Esse recurso é exclusivo do Plano Elite",
      description:
        "Para usar este recurso, escolha o Elite mensal ou anual. Ele libera o Canva Viagem completo, Fábrica de Anúncios, criador de sites, CRM e IAs.",
      primary: "CONHECER O PLANO ELITE",
      secondary: "Agora não",
    };
  }, [isStartSubscriber]);

  const handleRedirect = () => {
    onClose();
    navigate("/inicio");
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[92vh] w-[calc(100vw-24px)] max-w-[740px] overflow-y-auto border border-slate-200 bg-[#F8FAFC] p-0 text-slate-900 shadow-2xl sm:rounded-3xl [&>button]:right-4 [&>button]:top-4 [&>button]:z-20 [&>button]:rounded-full [&>button]:border [&>button]:border-slate-200 [&>button]:bg-white [&>button]:p-2 [&>button]:text-slate-400 [&>button]:opacity-100 hover:[&>button]:bg-slate-100 hover:[&>button]:text-slate-700">
        <div className="p-5 sm:p-7 md:p-8">
          {/* Top Header / Title */}
          <div className="text-center sm:text-left">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-purple-200 bg-purple-100 px-3.5 py-1 shadow-sm">
              <Crown className="h-3.5 w-3.5 text-purple-700" />
              <span className="text-[10px] font-black uppercase tracking-widest text-purple-900">{copy.eyebrow}</span>
            </div>

            <DialogTitle className="mt-3 text-2xl sm:text-3xl font-black leading-tight tracking-tight text-slate-900">
              {copy.title}
            </DialogTitle>
            <DialogDescription className="mt-2 text-xs sm:text-sm leading-relaxed text-slate-600 font-medium">
              {copy.description}
            </DialogDescription>
          </div>

          {/* Prévia dos Entregáveis (O que você recebe no Plano Completo) */}
          <div className="mt-6">
            <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-slate-700 mb-3">
              <Sparkles className="h-4 w-4 text-purple-600 fill-purple-600" />
              <span>O que você recebe no Plano Completo:</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200/80 shadow-sm">
              <div className="flex items-start gap-3 p-2 rounded-xl bg-slate-50 border border-slate-100">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-purple-100 text-purple-700 mt-0.5">
                  <Bot className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-slate-900">Fábrica de Anúncios IA</h4>
                  <p className="text-[11px] text-slate-500 leading-tight mt-0.5">Gerador instantâneo de cards de oferta, fotos e preço com sua logo em 5s.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-2 rounded-xl bg-slate-50 border border-slate-100">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-cyan-100 text-cyan-700 mt-0.5">
                  <ImageIcon className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-slate-900">+3.000 Artes Editáveis</h4>
                  <p className="text-[11px] text-slate-500 leading-tight mt-0.5">Maior acervo VIP do turismo para Feed, Stories, Reels e WhatsApp.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-2 rounded-xl bg-slate-50 border border-slate-100">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-700 mt-0.5">
                  <Layout className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-slate-900">Construtor de Sites</h4>
                  <p className="text-[11px] text-slate-500 leading-tight mt-0.5">Páginas de pacote de viagem prontas, editáveis e de alta conversão.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-2 rounded-xl bg-slate-50 border border-slate-100">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700 mt-0.5">
                  <Video className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-slate-900">Canva Viagem Completo</h4>
                  <p className="text-[11px] text-slate-500 leading-tight mt-0.5">Vídeos Reels, Vozes IA, roteiros automáticos e CRM de leads incluso.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Valores do Plano Completo */}
          <div className="mt-6">
            <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-slate-700 mb-3">
              <span>💳 Escolha seu plano de acesso:</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* Plano Anual */}
              <div 
                onClick={handleRedirect}
                className="relative rounded-2xl bg-white border-2 border-[#7C3AED] p-4.5 shadow-md hover:shadow-lg transition-all cursor-pointer flex flex-col justify-between"
              >
                <div className="absolute -top-3 left-4 bg-gradient-to-r from-amber-500 to-red-500 text-white text-[10px] font-black px-3 py-0.5 rounded-full uppercase tracking-wider shadow-sm">
                  Melhor Valor • Mais Popular
                </div>
                
                <div className="pt-2">
                  <span className="text-xs font-black text-slate-400 uppercase tracking-wide">Elite Anual</span>
                  <div className="flex items-baseline gap-1 mt-1 text-[#7C3AED]">
                    <span className="text-sm font-bold">12x</span>
                    <span className="text-3xl font-black tracking-tight">{ELITE_OFFER.annualMonthlyEquivalent}</span>
                  </div>
                  <span className="text-[11px] font-bold text-slate-600 block mt-0.5">ou {ELITE_OFFER.annualPrice} à vista por 1 ano</span>
                </div>

                <div className="mt-3.5 rounded-xl bg-[#F0FDF4] border border-[#86EFAC] p-2 text-[11px] font-bold text-[#15803D] text-center">
                  Economia de {ELITE_OFFER.annualSavings} + 3 dias grátis
                </div>
              </div>

              {/* Plano Mensal */}
              <div 
                onClick={handleRedirect}
                className="rounded-2xl bg-white border border-slate-200 p-4.5 shadow-sm hover:border-slate-300 transition-all cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <span className="text-xs font-black text-slate-400 uppercase tracking-wide">Elite Mensal</span>
                  <div className="flex items-baseline gap-1 mt-1 text-slate-900">
                    <span className="text-3xl font-black tracking-tight">{ELITE_OFFER.monthlyPrice}</span>
                    <span className="text-xs font-bold text-slate-500">/mês</span>
                  </div>
                  <span className="text-[11px] font-semibold text-slate-500 block mt-0.5">Acesso contínuo ao sistema</span>
                </div>

                <div className="mt-3.5 rounded-xl bg-slate-100 border border-slate-200 p-2 text-[11px] font-semibold text-slate-600 text-center">
                  Recorrente, sem fidelidade. Cancele quando quiser.
                </div>
              </div>
            </div>
          </div>

          {/* Botões de Ação + Garantia */}
          <div className="mt-7 space-y-3">
            <Button
              onClick={handleRedirect}
              className="w-full h-14 rounded-xl bg-gradient-to-r from-purple-600 via-purple-700 to-indigo-700 hover:from-purple-700 hover:to-indigo-800 text-white font-black text-sm uppercase tracking-wider shadow-lg shadow-purple-600/25 flex items-center justify-center gap-2 border-0 transition-all active:scale-[0.99]"
            >
              <span>🚀 {copy.primary} →</span>
            </Button>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-1 border-t border-slate-200/80 text-[11px] font-semibold text-slate-500">
              <div className="flex items-center gap-1.5 text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200/60">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                <span>Garantia incondicional de 7 dias</span>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="text-slate-400 hover:text-slate-700 font-bold transition-colors underline underline-offset-2 cursor-pointer bg-transparent border-0"
              >
                {copy.secondary}
              </button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export const PremiumGateModal = memo(PremiumGateModalComponent);
