import { ELITE_OFFER } from "@/lib/eliteOffer";
import { Crown, ArrowRight, Zap, Bot, Layout, Video } from "lucide-react";

export function FabricaUpgradeBlock() {
  return (
    <div className="min-h-screen bg-[#0A0A0B] text-white flex flex-col items-center justify-center p-6 sm:p-10 relative overflow-hidden w-full">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-amber-500/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-5xl mx-auto flex flex-col items-center mt-[-40px]">
        
        {/* Badge */}
        <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-4 py-1.5 mb-6 shadow-lg shadow-amber-500/5">
          <Crown className="h-4 w-4 text-amber-400" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-amber-400">Exclusivo do Plano Elite</span>
        </div>

        {/* Title & Sub */}
        <h1 className="text-3xl sm:text-5xl font-black text-center tracking-tight mb-4 text-transparent bg-clip-text bg-gradient-to-r from-white via-amber-200 to-amber-500">
          Liberte a Fábrica de Anúncios
        </h1>
        <p className="text-white/60 text-center max-w-2xl text-sm sm:text-base leading-relaxed mb-10">
          A inteligência artificial capaz de criar campanhas, artes, anúncios e sites inteiros em menos de 5 segundos. Faça upgrade para o Plano Elite e automatize sua agência hoje.
        </p>

        {/* Features Preview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full mb-12">
          <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4 flex flex-col items-center text-center">
            <Bot className="h-6 w-6 text-amber-400 mb-3 opacity-80" />
            <h3 className="text-xs font-bold text-white/90">Criador IA 5s</h3>
            <p className="text-[10px] text-white/40 mt-1">Anúncios de ofertas em segundos.</p>
          </div>
          <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4 flex flex-col items-center text-center">
            <Layout className="h-6 w-6 text-amber-400 mb-3 opacity-80" />
            <h3 className="text-xs font-bold text-white/90">Carrosséis</h3>
            <p className="text-[10px] text-white/40 mt-1">Sequências magnéticas no Insta.</p>
          </div>
          <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4 flex flex-col items-center text-center">
            <Zap className="h-6 w-6 text-amber-400 mb-3 opacity-80" />
            <h3 className="text-xs font-bold text-white/90">Construtor de Sites</h3>
            <p className="text-[10px] text-white/40 mt-1">Landings de pacotes em 1 clique.</p>
          </div>
          <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4 flex flex-col items-center text-center">
            <Video className="h-6 w-6 text-amber-400 mb-3 opacity-80" />
            <h3 className="text-xs font-bold text-white/90">CRM Avançado</h3>
            <p className="text-[10px] text-white/40 mt-1">Leads reais e painel comercial.</p>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl mx-auto">
          {/* Mensal */}
          <div className="flex flex-col bg-[#111113] border border-white/10 rounded-3xl p-6 relative group hover:border-white/20 transition-all">
            <div className="mb-4">
              <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Elite Mensal</span>
              <div className="flex items-baseline gap-1 mt-2">
                <span className="text-3xl font-black text-white">{ELITE_OFFER.monthlyPrice}</span>
                <span className="text-xs font-bold text-white/40">/mês</span>
              </div>
            </div>
            <div className="text-[11px] text-white/50 leading-relaxed mb-6 flex-1">
              Sem fidelidade. Cancele quando quiser.
            </div>
            <a 
              href={ELITE_OFFER.monthlyCheckoutUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-white border border-white/10 h-12 rounded-xl text-[11px] font-bold uppercase tracking-wider transition-colors"
            >
              Assinar Mensal
            </a>
          </div>

          {/* Anual (Recomendado) */}
          <div className="flex flex-col bg-gradient-to-b from-[#1E1B15] to-[#111113] border border-amber-500/40 rounded-3xl p-6 relative transform md:-translate-y-4 shadow-xl shadow-amber-500/5">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-500 text-amber-950 px-4 py-1 rounded-full text-[9px] font-black uppercase tracking-widest shadow-md">
              Mais Vantajoso
            </div>
            <div className="mb-4 text-center mt-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-amber-400">Elite Anual</span>
              <div className="flex items-baseline justify-center gap-1 mt-2">
                <span className="text-sm font-bold text-amber-500">12x</span>
                <span className="text-4xl font-black text-white">{ELITE_OFFER.annualMonthlyEquivalent}</span>
              </div>
              <span className="text-[11px] font-bold text-white/40 mt-1 block">ou {ELITE_OFFER.annualPrice} à vista / 1 ano</span>
            </div>
            
            <div className="bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] font-bold text-center py-2 rounded-lg mb-6">
              Economia de {ELITE_OFFER.annualSavings}
            </div>

            <a 
              href={ELITE_OFFER.annualCheckoutUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-auto w-full flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-400 text-amber-950 h-12 rounded-xl text-[11px] font-black uppercase tracking-wider transition-colors"
            >
              Assinar Anual Agora
              <ArrowRight className="h-4 w-4" />
            </a>
          </div>

          {/* Semestral */}
          <div className="flex flex-col bg-[#111113] border border-white/10 rounded-3xl p-6 relative group hover:border-white/20 transition-all">
            <div className="mb-4">
              <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Elite Semestral</span>
              <div className="flex items-baseline gap-1 mt-2">
                <span className="text-3xl font-black text-white">{ELITE_OFFER.semiannualPrice}</span>
              </div>
              <span className="text-[11px] font-bold text-white/40 mt-1 block">acesso por 6 meses</span>
            </div>
            <div className="text-[11px] text-white/50 leading-relaxed mb-6 flex-1">
              Um meio-termo perfeito para estruturar suas vendas.
            </div>
            <a 
              href={ELITE_OFFER.semiannualCheckoutUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-white border border-white/10 h-12 rounded-xl text-[11px] font-bold uppercase tracking-wider transition-colors"
            >
              Assinar Semestral
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
