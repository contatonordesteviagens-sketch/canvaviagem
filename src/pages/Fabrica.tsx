import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { FabricaProvider, useFabricaContext } from "@/hooks/useFabricaContext";
import { Phase1Diagnostico } from "@/pages/fabrica/Phase1Diagnostico";
import { Phase2Ativos } from "@/pages/fabrica/Phase2Ativos";
import { Phase3ArtFactory } from "@/pages/fabrica/Phase3ArtFactory";
import { Phase4LandingBuilder } from "@/pages/fabrica/Phase4LandingBuilder";
import { ArrowLeft, Factory } from "lucide-react";
import { useNavigate } from "react-router-dom";
import SeoMetadata from "@/components/SeoMetadata";
import { ComingSoonGate, isFabricaUnlocked } from "@/components/fabrica/ComingSoonGate";

const PHASES = [
  { num: 1, label: "Diagnóstico" },
  { num: 2, label: "Ativos" },
  { num: 3, label: "IA Art Factory" },
  { num: 4, label: "Seu Site" },
];

const FabricaInner = () => {
  const { state, setPhase } = useFabricaContext();
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const [primary] = useState(state.primaryColor);

  useEffect(() => {
    document.documentElement.style.setProperty("--fabrica-primary", state.primaryColor);
  }, [state.primaryColor]);

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
                state.currentPhase === p.num ? "text-black" : "text-white/60 border-white/10 bg-white/[0.04] hover:border-white/30"
              }`}
              style={state.currentPhase === p.num ? { background: state.primaryColor, borderColor: state.primaryColor } : undefined}
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
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${state.primaryColor}, #D97706)`, boxShadow: `0 0 20px ${state.primaryColor}33` }}>
              <Factory className="w-5 h-5 text-black" />
            </div>
            <div>
              <div className="text-sm font-extrabold leading-tight">Fábrica de Anúncios</div>
              <div className="text-[10px] text-white/50 uppercase tracking-widest">TravelBoost · Canva Viagem</div>
            </div>
          </div>
        </div>

        {/* Hero */}
        <div className="text-center py-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-white/10 bg-white/[0.04] mb-4">
            <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: state.primaryColor }} />
            <span className="text-[10px] font-bold uppercase tracking-widest text-white/70">Esteira</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black mb-3 tracking-tight leading-[1.1]">
            Sua agência <span style={{ background: `linear-gradient(135deg, ${state.primaryColor}, #FCD34D)`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>profissional</span><br className="hidden sm:block" /> em minutos
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
                state.currentPhase === p.num ? "text-black" : state.currentPhase > p.num ? "text-white/80" : "text-white/40"
              }`}
              style={state.currentPhase === p.num ? { background: state.primaryColor } : undefined}
            >
              <span className="hidden sm:inline">F{p.num} · </span>{p.label}
            </button>
          ))}
        </div>

        {/* Phase content */}
        {state.currentPhase === 1 && <Phase1Diagnostico onComplete={() => setPhase(2)} />}
        {state.currentPhase === 2 && <Phase2Ativos onNext={() => setPhase(3)} />}
        {state.currentPhase === 3 && <Phase3ArtFactory onNext={() => setPhase(4)} />}
        {state.currentPhase === 4 && <Phase4LandingBuilder />}
      </div>
    </div>
  );
};

const Fabrica = () => {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const [unlocked, setUnlocked] = useState(() => isFabricaUnlocked() || isAdmin);
  const [gateOpen, setGateOpen] = useState(!unlocked);

  useEffect(() => {
    if (isAdmin) setUnlocked(true);
  }, [isAdmin]);

  if (!unlocked) {
    return (
      <>
        <SeoMetadata title="Em breve | Canva Viagem" description="Funcionalidade em breve." />
        <ComingSoonGate
          open={gateOpen}
          onOpenChange={(open) => {
            setGateOpen(open);
            if (!open && !isFabricaUnlocked()) navigate("/");
          }}
          onUnlock={() => setUnlocked(true)}
        />
      </>
    );
  }

  return (
    <>
      <SeoMetadata title="Fábrica de Anúncios | Canva Viagem" description="Sistema completo de marketing e geração de anúncios com IA para agências de viagens." />
      <FabricaProvider>
        <FabricaInner />
      </FabricaProvider>
    </>
  );
};

export default Fabrica;
