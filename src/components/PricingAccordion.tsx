import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2 } from "lucide-react";

const CANVA_VIAGEM_FEATURES = [
  "250 vídeos Reels de destinos",
  "400 Artes e stories",
  "Gerador de anúncio",
  "Construtor de Sites",
  "Acesso ao CRM de leads",
  "Ferramentas Agentes de IA",
  "Legendas e textos de oferta",
  "Gerador de roteiros",
  "Suporte via WhatsApp"
];

export function PricingAccordion() {
  const [selectedPlan, setSelectedPlan] = useState("anual");

  return (
    <div className="w-full max-w-[500px] mx-auto flex flex-col gap-5 mt-8">
      {/* PLANO ANUAL */}
      <div
        onClick={() => setSelectedPlan("anual")}
        className="relative cursor-pointer"
      >
        <div
          className={`relative rounded-2xl bg-white border transition-all duration-300 ${
            selectedPlan === "anual" 
              ? "z-10 border-[#7C3AED] border-[3px] shadow-[0_10px_30px_-10px_rgba(124,58,237,0.3)]" 
              : "border-slate-200 hover:border-purple-300"
          }`}
        >
          {/* Badge */}
          <div style={{
            position: 'absolute', top: '-14px', left: '50%', transform: 'translateX(-50%)',
            background: 'linear-gradient(90deg, #F59E0B, #EF4444)',
            color: 'white', fontSize: '11px', fontWeight: '800',
            padding: '4px 16px', borderRadius: '20px', whiteSpace: 'nowrap',
            boxShadow: '0 4px 12px rgba(239,68,68,0.35)'
          }}>
            MAIS POPULAR — MELHOR VALOR
          </div>

          <div className="p-5 pt-6">
            <div className="flex flex-col items-center text-center w-full">
              <h3 className="text-2xl font-black text-slate-900 leading-tight">
                Plano Anual
              </h3>
              <p className="text-sm text-slate-500 font-medium mt-1">
                Acesso completo por 12 meses com o maior desconto.
              </p>
              
              {/* PREÇO VERDE UNIFICADO (Conforme pedido) */}
              <div className="mt-4" style={{
                background: 'linear-gradient(135deg, #F0FDF4, #DCFCE7)',
                border: '1px solid #86EFAC', borderRadius: '12px',
                padding: '16px', textAlign: 'center', width: '100%'
              }}>
                <div className="text-[13px] sm:text-[17px] font-[800] text-[#15803D] flex items-center justify-center gap-1 whitespace-nowrap">
                  12x de R$ 49,85 <span className="font-[700] opacity-80">ou R$ 482 à vista</span>
                </div>
              </div>
              
              <div style={{ width: '100%', textAlign: 'center', fontSize: '13px', color: '#B45309', fontWeight: '700', opacity: 0.85, marginTop: '8px', background: '#FEF3C7', borderRadius: '8px', padding: '6px', border: '1px solid #FDE68A' }}>
                💰 Economize R$ 682 no anual
              </div>
            </div>

            <AnimatePresence initial={false}>
              {selectedPlan === "anual" && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden w-full px-5"
                >
                  <div className="pb-6 pt-6 flex flex-col gap-6">
                    <div className="h-px w-full bg-slate-100 mb-2"></div>
                    <div className="flex flex-col gap-3.5 text-left">
                      {CANVA_VIAGEM_FEATURES.map((feature, idx) => (
                        <motion.div
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.05, duration: 0.3 }}
                          key={idx}
                          className="flex items-center gap-3 text-sm font-bold text-slate-700"
                        >
                          <CheckCircle2 size={18} className="text-green-500 shrink-0" />
                          {feature}
                        </motion.div>
                      ))}
                    </div>

                    <a
                      href="https://pay.hotmart.com/C106141067C?off=ts1hgsho&checkoutMode=10"
                      className="w-full text-center py-3.5 rounded-xl font-bold text-white shadow-lg transition-transform active:scale-95 flex items-center justify-center"
                      style={{ background: '#7C3AED' }}
                    >
                      Assinar Anual — Garantir Desconto
                    </a>
                    <div className="text-center text-xs font-semibold text-slate-400">
                      Acesso imediato • Garantia de 7 dias • Pagamento seguro
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* PLANO MENSAL */}
      <div
        onClick={() => setSelectedPlan("mensal")}
        className="relative cursor-pointer"
      >
        <div
          className={`relative rounded-2xl bg-white border transition-all duration-300 ${
            selectedPlan === "mensal" 
              ? "z-10 border-blue-500 border-[3px] shadow-lg" 
              : "border-slate-200 hover:border-blue-300"
          }`}
        >
          <div className="p-5">
            <div className="flex flex-col items-center text-center w-full">
              <h3 className="text-2xl font-black text-slate-900 leading-tight">
                Plano Mensal
              </h3>
              <p className="text-sm text-slate-500 font-medium mt-1">
                Sem compromisso.
              </p>
              
              {/* Preço Mensal Centralizado */}
              <div className="mt-3">
                <div className="text-3xl font-black text-slate-900 leading-none flex items-baseline justify-center gap-1">
                  R$ 97<span className="text-sm text-slate-500 font-bold">/mês</span>
                </div>
              </div>
            </div>

            <AnimatePresence initial={false}>
              {selectedPlan === "mensal" && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden w-full px-5"
                >
                  <div className="pb-6 pt-6 flex flex-col gap-6">
                    <div className="h-px w-full bg-slate-100 mb-2"></div>
                    <div className="flex flex-col gap-3.5 text-left">
                      {CANVA_VIAGEM_FEATURES.map((feature, idx) => (
                        <motion.div
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.05, duration: 0.3 }}
                          key={idx}
                          className="flex items-center gap-3 text-sm font-bold text-slate-700"
                        >
                          <CheckCircle2 size={18} className="text-blue-500 shrink-0" />
                          {feature}
                        </motion.div>
                      ))}
                    </div>

                    <a
                      href="https://pay.hotmart.com/C106141067C?off=8qkh1yh6&checkoutMode=10"
                      className="w-full text-center py-3.5 rounded-xl font-bold border-2 transition-transform active:scale-95 flex items-center justify-center"
                      style={{ borderColor: '#3B82F6', color: '#3B82F6' }}
                    >
                      Assinar Mensal
                    </a>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
