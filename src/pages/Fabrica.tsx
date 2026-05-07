import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { FabricaProvider, useFabricaContext } from "@/hooks/useFabricaContext";
import { Phase1Diagnostico } from "@/pages/fabrica/Phase1Diagnostico";
import { Phase2Ativos } from "@/pages/fabrica/Phase2Ativos";
import { Phase3ArtFactory } from "@/pages/fabrica/Phase3ArtFactory";
import { Phase4LandingBuilder } from "@/pages/fabrica/Phase4LandingBuilder";
import { ArrowLeft, Crown, Sparkles, Loader2 } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import SeoMetadata from "@/components/SeoMetadata";
import { ComingSoonGate } from "@/components/fabrica/ComingSoonGate";

const PHASES = [
  { num: 1, label: "ADS Destino" },
  { num: 2, label: "Seu Site" },
  { num: 3, label: "Diagnóstico" },
  { num: 4, label: "Plano" },
];

const FabricaInner = () => {
  const { state, setPhase } = useFabricaContext();
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const [primary] = useState(state.primaryColor);

  useEffect(() => {
    const color = state.primaryColor || "#F59E0B";
    document.documentElement.style.setProperty("--fabrica-primary", color);
  }, [state.primaryColor]);

  // Decide texto preto/branco com base na luminância da primaryColor
  // Evita "texto preto sobre fundo escuro" quando alguém escolhe uma cor escura.
  const getContrastText = (hex: string): string => {
    const c = hex.replace("#", "");
    if (c.length !== 6) return "#000";
    const r = parseInt(c.slice(0, 2), 16);
    const g = parseInt(c.slice(2, 4), 16);
    const b = parseInt(c.slice(4, 6), 16);
    const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return lum > 0.6 ? "#000" : "#fff";
  };
  const onPrimaryText = getContrastText(state.primaryColor);

  return (
    <div
      className="min-h-screen"
      style={{
        background: "#0A0A0B",
        color: "#fff",
        fontFamily: "Inter, sans-serif",
        backgroundImage:
          "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(245,158,11,0.08), transparent 60%), radial-gradient(ellipse 60% 50% at 100% 100%, rgba(139,92,246,0.05), transparent 60%)",
      }}
    >
      {/* Admin nav (skip phases) */}
      {isAdmin && (
        <div className="sticky top-0 z-50 bg-black border-b-2 flex items-center gap-2 px-4 py-2 overflow-x-auto" style={{ borderColor: state.primaryColor }}>
          <span className="text-[10px] font-extrabold uppercase tracking-widest whitespace-nowrap" style={{ color: state.primaryColor }}>ADMIN</span>
          {PHASES.map((p) => (
            <button
              key={p.num}
              onClick={() => setPhase(p.num)}
              className={`px-2.5 py-1 rounded text-[11px] font-semibold whitespace-nowrap border transition-colors ${
                state.currentPhase === p.num ? "" : "text-white/60 border-white/10 bg-white/[0.04] hover:border-white/30"
              }`}
              style={state.currentPhase === p.num ? { background: state.primaryColor, borderColor: state.primaryColor, color: onPrimaryText } : undefined}
            >
              F{p.num}
            </button>
          ))}
        </div>
      )}

      <div className="max-w-3xl mx-auto px-4 pt-6 pb-32">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button onClick={() => navigate("/")} className="flex items-center gap-2 text-white/60 hover:text-white text-sm transition-colors">
            <ArrowLeft className="w-4 h-4" /> Voltar
          </button>
          <div className="flex items-center gap-2">
            <div className="text-sm font-extrabold leading-tight">Fábrica de Destinos</div>
          </div>
        </div>

        {/* Hero */}
        <div className="text-center py-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-white/10 bg-white/[0.04] mb-4">
            <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: state.primaryColor }} />
            <span className="text-[10px] font-bold uppercase tracking-widest text-white/70">Fábrica de Destinos</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black mb-3 tracking-tight leading-[1.1]">
            Sua agência{" "}
            <span
              className="bg-clip-text text-transparent"
              style={{
                backgroundImage: `linear-gradient(135deg, ${state.primaryColor}, #FCD34D)`,
              }}
            >
              profissional
            </span>
            <br className="hidden sm:block" /> em minutos!
          </h1>
          <p className="text-sm text-white/60 max-w-lg mx-auto">
            Diagnóstico, anúncios prontos com IA e site no ar — tudo em 4 passos guiados, sem precisar de designer ou agência.
          </p>
        </div>

        {/* Stepper */}
        <div className="flex gap-1 mb-8 bg-white/[0.04] p-1.5 rounded-full border border-white/[0.06]">
          {PHASES.map((p) => (
            <button
              key={p.num}
              onClick={() => setPhase(p.num)}
              className={`flex-1 py-2 px-2 rounded-full text-[10px] sm:text-[11px] font-bold uppercase tracking-wider transition-colors ${
                state.currentPhase === p.num ? "" : state.currentPhase > p.num ? "text-white/80" : "text-white/40"
              }`}
              style={state.currentPhase === p.num ? { background: state.primaryColor, color: onPrimaryText } : undefined}
            >
              <span className="hidden sm:inline">F{p.num} · </span>{p.label}
            </button>
          ))}
        </div>

        {/* Phase content */}
        {state.currentPhase === 1 && <Phase3ArtFactory onNext={() => setPhase(2)} onBack={() => {}} />}
        {state.currentPhase === 2 && <Phase4LandingBuilder onNext={() => setPhase(3)} onBack={() => setPhase(1)} />}
        {state.currentPhase === 3 && <Phase1Diagnostico onComplete={() => setPhase(4)} onBack={() => setPhase(2)} />}
        {state.currentPhase === 4 && <Phase2Ativos onNext={() => setPhase(1)} onBack={() => setPhase(3)} />}
      </div>
    </div>
  );
};

const Fabrica = () => {
  const navigate = useNavigate();
  const { subscription, isAdmin, loading: authLoading } = useAuth();

  const isStart = subscription.subscribed && 
    (subscription.productId?.includes("smart") || subscription.productId?.includes("start") || subscription.productId?.includes("basic")) &&
    !(subscription.productId === "prod_UTFlCWzNqvqSNx" || subscription.productId === "prod_UTFsXcKq8m0mol" || subscription.productId === "prod_UTSmPe3GPt8iHt");
  const isElite = subscription.subscribed && (!isStart || subscription.productId === "prod_UTFlCWzNqvqSNx" || subscription.productId === "prod_UTFsXcKq8m0mol" || subscription.productId === "prod_UTSmPe3GPt8iHt");
  const hasAccess = isAdmin || isElite;

  if (authLoading || subscription.loading) {
    return (
      <div className="min-h-screen bg-[#0A0A0B] flex flex-col items-center justify-center text-white">
        <Loader2 className="w-8 h-8 animate-spin text-amber-500 mb-2" />
        <span className="text-sm text-white/60">Verificando suas credenciais...</span>
      </div>
    );
  }

  if (!hasAccess) {
    return (
      <div 
        className="min-h-screen bg-[#0A0A0B] flex flex-col items-center justify-center p-4 relative overflow-hidden"
        style={{
          backgroundImage: "radial-gradient(circle at 50% 30%, rgba(245,158,11,0.15) 0%, transparent 60%)"
        }}
      >
        <div className="max-w-md w-full bg-[#121214] border border-white/10 rounded-2xl p-6 shadow-2xl relative z-10 text-center">
          {/* Header Badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-amber-500/20 bg-amber-500/10 mb-6">
            <Crown className="w-4 h-4 text-amber-500 animate-bounce" />
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-amber-500">Upgrade Necessário</span>
          </div>

          <h2 className="text-2xl font-black text-white mb-2 tracking-tight">
            Desbloqueie a Fábrica de Destinos 👑
          </h2>
          <p className="text-xs text-white/60 mb-6 leading-relaxed">
            Esta ferramenta é exclusiva para membros do <strong className="text-amber-500">Plano Elite</strong>. Faça o upgrade agora para ter acesso ilimitado à Fábrica de Anúncios e Criador de Sites de Viagem!
          </p>

          {/* Cards de Opções */}
          <div className="grid gap-4 mb-6">
            {/* Opção Mensal */}
            <div className="border border-white/10 bg-white/[0.02] hover:bg-white/[0.04] p-4 rounded-xl text-left transition-all">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <span className="text-xs font-bold text-white/80">Plano Elite Mensal</span>
                  <p className="text-[10px] text-white/40">Acesso recorrente, cancele quando quiser</p>
                </div>
                <div className="text-right">
                  <span className="text-lg font-black text-white">R$ 49</span>
                  <span className="text-[10px] text-white/50">/mês</span>
                </div>
              </div>
              <button 
                onClick={() => window.open("https://buy.stripe.com/fZucN6bma6QEeH96kI8so0c", "_blank")}
                className="w-full bg-white/10 hover:bg-white/20 text-white font-bold py-2 px-3 rounded-lg text-xs mt-2 transition-colors"
              >
                Assinar Mensal por R$ 49 →
              </button>
            </div>

            {/* Opção Anual (Recomendada) */}
            <div className="border border-amber-500/40 bg-amber-500/[0.03] hover:bg-amber-500/[0.06] p-4 rounded-xl text-left relative overflow-hidden transition-all shadow-[0_0_15px_rgba(245,158,11,0.05)]">
              <div className="absolute top-0 right-0 bg-gradient-to-r from-amber-500 to-orange-600 text-[9px] font-black uppercase text-white px-2 py-0.5 rounded-bl-lg tracking-wider">
                MAIOR ECONOMIA
              </div>
              <div className="flex justify-between items-start mb-2">
                <div>
                  <div className="flex items-center gap-1">
                    <span className="text-xs font-black text-amber-400">Plano Elite Anual</span>
                    <Sparkles className="w-3 h-3 text-amber-400 animate-pulse" />
                  </div>
                  <p className="text-[10px] text-amber-200/60 font-semibold">Equivale a apenas R$ 28,91/mês</p>
                </div>
                <div className="text-right">
                  <span className="text-lg font-black text-white">R$ 347</span>
                  <span className="text-[10px] text-white/50">/ano</span>
                </div>
              </div>
              
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-2 mb-3 text-[10px] text-amber-200 leading-normal">
                💡 <strong>Análise de Economia:</strong> Comprar mensalmente por 1 ano custa R$ 588. No plano anual, você paga apenas R$ 347 — uma economia garantida de <strong>R$ 241,00/ano</strong>!
              </div>

              <button 
                onClick={() => window.open("https://buy.stripe.com/fZu14ogGugreeH9bF28so0d", "_blank")}
                className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-extrabold py-2.5 px-3 rounded-lg text-xs transition-all shadow-md uppercase tracking-wider"
              >
                Garantir Anual com Desconto →
              </button>
            </div>
          </div>

          {/* Botão de Voltar */}
          <button 
            onClick={() => navigate("/")}
            className="text-xs text-white/40 hover:text-white flex items-center justify-center gap-1.5 mx-auto transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Voltar para o Painel
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <SeoMetadata title="Fábrica de Destinos | Canva Viagem" description="Sistema completo de marketing e geração de anúncios com IA para agências de viagens." />
      <FabricaProvider>
        <FabricaInner />
      </FabricaProvider>
    </>
  );
};

export default Fabrica;
