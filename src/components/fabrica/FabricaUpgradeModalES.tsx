import { useNavigate } from "react-router-dom";
import { Sparkles, Bot, Image as ImageIcon, Video, Layout, ShieldCheck, ArrowRight, Crown } from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ELITE_OFFER } from "@/lib/eliteOffer";

interface FabricaUpgradeModalESProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const FabricaUpgradeModalES = ({ open, onOpenChange }: FabricaUpgradeModalESProps) => {
  const navigate = useNavigate();

  const handlePlansClick = () => {
    onOpenChange(false);
    navigate("/inicio");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] w-[calc(100vw-24px)] max-w-[740px] overflow-y-auto border border-slate-200 bg-[#F8FAFC] p-0 text-slate-900 shadow-2xl sm:rounded-3xl [&>button]:right-4 [&>button]:top-4 [&>button]:z-20 [&>button]:rounded-full [&>button]:border [&>button]:border-slate-200 [&>button]:bg-white [&>button]:p-2 [&>button]:text-slate-400 [&>button]:opacity-100 hover:[&>button]:bg-slate-100 hover:[&>button]:text-slate-700">
        <div className="p-5 sm:p-7 md:p-8">
          {/* Top Header / Title */}
          <div className="text-center sm:text-left">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-purple-200 bg-purple-100 px-3.5 py-1 shadow-sm">
              <Crown className="h-3.5 w-3.5 text-purple-700" />
              <span className="text-[10px] font-black uppercase tracking-widest text-purple-900">Recurso VIP Para Suscriptores</span>
            </div>

            <DialogTitle className="mt-3 text-2xl sm:text-3xl font-black leading-tight tracking-tight text-slate-900">
              ¡La Fábrica de Anuncios se ha Liberado! <span className="text-purple-600">🚀⚡</span>
            </DialogTitle>
            <DialogDescription className="mt-2 text-xs sm:text-sm leading-relaxed text-slate-600 font-medium">
              Se acabó perder tiempo en Canva o pagando caros creadores. El <strong className="text-slate-900 font-bold">ecosistema #1 de turismo</strong> hace todo el trabajo duro por tu agencia.
            </DialogDescription>
          </div>

          {/* Resumen de Entregables (Lo que recibes en el Plan Completo) */}
          <div className="mt-6">
            <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-slate-700 mb-3">
              <Sparkles className="h-4 w-4 text-purple-600 fill-purple-600" />
              <span>Lo que recibes en el Plan Completo:</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200/80 shadow-sm">
              <div className="flex items-start gap-3 p-2 rounded-xl bg-slate-50 border border-slate-100">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-purple-100 text-purple-700 mt-0.5">
                  <Bot className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-slate-900">Fábrica de Anuncios IA</h4>
                  <p className="text-[11px] text-slate-500 leading-tight mt-0.5">Generador instantáneo de cards de oferta, fotos y precio con tu logo en 5s.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-2 rounded-xl bg-slate-50 border border-slate-100">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-cyan-100 text-cyan-700 mt-0.5">
                  <ImageIcon className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-slate-900">+3.000 Diseños Editables</h4>
                  <p className="text-[11px] text-slate-500 leading-tight mt-0.5">El mayor catálogo VIP para Feed, Stories, Reels y WhatsApp.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-2 rounded-xl bg-slate-50 border border-slate-100">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-700 mt-0.5">
                  <Layout className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-slate-900">Constructor de Sitios</h4>
                  <p className="text-[11px] text-slate-500 leading-tight mt-0.5">Páginas de paquetes turísticos listas, editables y de alta conversión.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-2 rounded-xl bg-slate-50 border border-slate-100">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700 mt-0.5">
                  <Video className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-slate-900">Canva Viajes Completo</h4>
                  <p className="text-[11px] text-slate-500 leading-tight mt-0.5">Videos Reels, Voces IA, guiones automáticos y CRM de leads incluido.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Valores del Plan Completo */}
          <div className="mt-6">
            <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-slate-700 mb-3">
              <span>💳 Elige tu plan de acceso:</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* Plan Anual */}
              <div 
                onClick={handlePlansClick}
                className="relative rounded-2xl bg-white border-2 border-[#7C3AED] p-4.5 shadow-md hover:shadow-lg transition-all cursor-pointer flex flex-col justify-between"
              >
                <div className="absolute -top-3 left-4 bg-gradient-to-r from-amber-500 to-red-500 text-white text-[10px] font-black px-3 py-0.5 rounded-full uppercase tracking-wider shadow-sm">
                  Mejor Valor • Más Popular
                </div>
                
                <div className="pt-2">
                  <span className="text-xs font-black text-slate-400 uppercase tracking-wide">Elite Anual</span>
                  <div className="flex items-baseline gap-1 mt-1 text-[#7C3AED]">
                    <span className="text-sm font-bold">12x</span>
                    <span className="text-3xl font-black tracking-tight">{ELITE_OFFER.annualMonthlyEquivalent}</span>
                  </div>
                  <span className="text-[11px] font-bold text-slate-600 block mt-0.5">o {ELITE_OFFER.annualPrice} al contado por 1 año</span>
                </div>

                <div className="mt-3.5 rounded-xl bg-[#F0FDF4] border border-[#86EFAC] p-2 text-[11px] font-bold text-[#15803D] text-center">
                  Ahorro de {ELITE_OFFER.annualSavings} + 3 días gratis
                </div>
              </div>

              {/* Plan Mensual */}
              <div 
                onClick={handlePlansClick}
                className="rounded-2xl bg-white border border-slate-200 p-4.5 shadow-sm hover:border-slate-300 transition-all cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <span className="text-xs font-black text-slate-400 uppercase tracking-wide">Elite Mensual</span>
                  <div className="flex items-baseline gap-1 mt-1 text-slate-900">
                    <span className="text-3xl font-black tracking-tight">{ELITE_OFFER.monthlyPrice}</span>
                    <span className="text-xs font-bold text-slate-500">/mes</span>
                  </div>
                  <span className="text-[11px] font-semibold text-slate-500 block mt-0.5">Acceso continuo al sistema</span>
                </div>

                <div className="mt-3.5 rounded-xl bg-slate-100 border border-slate-200 p-2 text-[11px] font-semibold text-slate-600 text-center">
                  Recurrente, sin permanencia. Cancela cuando quieras.
                </div>
              </div>
            </div>
          </div>

          {/* Botones de Acción + Garantía */}
          <div className="mt-7 space-y-3">
            <Button
              onClick={handlePlansClick}
              className="w-full h-14 rounded-xl bg-gradient-to-r from-purple-600 via-purple-700 to-indigo-700 hover:from-purple-700 hover:to-indigo-800 text-white font-black text-sm uppercase tracking-wider shadow-lg shadow-purple-600/25 flex items-center justify-center gap-2 border-0 transition-all active:scale-[0.99]"
            >
              <span>🔥 ACTIVAR MI ACCESO AHORA →</span>
            </Button>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-1 border-t border-slate-200/80 text-[11px] font-semibold text-slate-500">
              <div className="flex items-center gap-1.5 text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200/60">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                <span>Garantía incondicional de 7 días</span>
              </div>

              <button
                type="button"
                onClick={() => onOpenChange(false)}
                className="text-slate-400 hover:text-slate-700 font-bold transition-colors underline underline-offset-2 cursor-pointer bg-transparent border-0"
              >
                Continuar sin suscribirme
              </button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};