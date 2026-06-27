import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { FabricaProvider, useFabricaContext } from "@/hooks/useFabricaContext";
import { Phase1Diagnostico } from "@/pages/fabrica/Phase1Diagnostico";
import { Phase2Ativos } from "@/pages/fabrica/Phase2Ativos";
import { Phase3ArtFactory } from "@/pages/fabrica/Phase3ArtFactory";
import { Phase4LandingBuilder } from "@/pages/fabrica/Phase4LandingBuilder";
import { Phase5Dashboard } from "@/pages/fabrica/Phase5Dashboard";
import { Phase6Forms } from "@/pages/fabrica/Phase6Forms";
import { FabricaDashboard } from "@/pages/fabrica/FabricaDashboard";
import { FabricaLibrary } from "@/pages/fabrica/FabricaLibrary";
import { VoiceOnboarding } from "@/components/fabrica/VoiceOnboarding";
import { 
  ArrowLeft, 
  Sparkles,
  Loader2, 
  LayoutDashboard, 
  Image as ImageIcon, 
  Zap, 
  FileText, 
  FolderOpen, 
  Sliders, 
  Library,
  Menu,
  X,
  ChevronDown,
  Users,
  ClipboardList
} from "lucide-react";
import { useLocation, useNavigate, Navigate } from "react-router-dom";
import SeoMetadata from "@/components/SeoMetadata";
import { CloudSaveIndicator } from "@/components/fabrica/CloudSaveIndicator";
import { hasEliteAccess } from "@/lib/planAccess";

const FabricaInner = () => {
  const { state, setPhase, update } = useFabricaContext();
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"dashboard" | "phase" | "library">("dashboard");
  const [librarySubTab, setLibrarySubTab] = useState<"ofertas" | "galeria">("ofertas");

  useEffect(() => {
    const snapshot = (location.state as { prefillSnapshot?: any } | null)?.prefillSnapshot;
    if (!snapshot) return;
    update({ ...(snapshot as any), diagnosticoCompleto: false });
    navigate(location.pathname, { replace: true, state: null });
  }, [location.state, location.pathname, navigate, update]);

  useEffect(() => {
    const color = state.primaryColor || "#F59E0B";
    document.documentElement.style.setProperty("--fabrica-primary", color);

    const handleNavToDashboard = () => setActiveTab("dashboard");
    window.addEventListener("nav-to-dashboard", handleNavToDashboard);
    return () => window.removeEventListener("nav-to-dashboard", handleNavToDashboard);
  }, [state.primaryColor]);

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

  const getPhaseName = () => {
    if (activeTab === "dashboard") return "Painel Inicial";
    if (activeTab === "library") {
      return librarySubTab === "ofertas" ? "Minhas Ofertas" : "Minha Biblioteca";
    }
    if (state.currentPhase === 1) return "Anúncio";
    if (state.currentPhase === 2) return "Site";
    if (state.currentPhase === 6) return "Formulários";
    if (state.currentPhase === 3) return "CRM";
    if (state.currentPhase === 4) return "Plano";
    if (state.currentPhase === 5) return "Checkup";
    return "";
  };

  return (
    <div
      className="min-h-screen flex bg-[#0A0A0B] text-white"
      style={{
        fontFamily: "Inter, sans-serif",
      }}
    >
      {/* â”€â”€ SIDEBAR LATERAL ESQUERDA (DESKTOP) â”€â”€ */}
      <aside className="w-64 border-r border-white/5 bg-[#0F0F11] flex-shrink-0 flex flex-col hidden md:flex sticky top-0 h-screen z-40 select-none">
        {/* Brand Header */}
        <div className="p-6 border-b border-white/5 flex items-center gap-3">
          <div>
            <div className="text-xs font-black text-white leading-none tracking-tight">Fábrica de Destinos</div>
            <div className="text-[9px] font-bold text-white/40 uppercase tracking-widest mt-0.5">Painel de Criação</div>
          </div>
        </div>

        {/* Menu Items */}
        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
          {/* Dashboard Geral */}
          <div>
            <button
              onClick={() => setActiveTab("dashboard")}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                activeTab === "dashboard"
                  ? "bg-white/[0.06] text-white border border-white/10 shadow-sm"
                  : "text-white/60 hover:text-white hover:bg-white/[0.04]"
              }`}
            >
              <LayoutDashboard className={`w-4 h-4 ${activeTab === "dashboard" ? "text-amber-400" : "text-white/40"}`} />
              <span>Painel Fábrica</span>
            </button>
          </div>

          {/* GERAÃ‡ÃƒO */}
          <div>
            <div className="text-[9px] font-extrabold text-white/30 tracking-widest uppercase px-3 mb-2">
              GERAÃ‡ÃƒO
            </div>
            <button
              onClick={() => {
                setPhase(1);
                setActiveTab("phase");
              }}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                activeTab === "phase" && state.currentPhase === 1
                  ? "bg-white/[0.06] text-white border border-white/10 shadow-sm"
                  : "text-white/60 hover:text-white hover:bg-white/[0.04]"
              }`}
            >
              <div className="flex items-center gap-3">
                <ImageIcon className={`w-4 h-4 ${activeTab === "phase" && state.currentPhase === 1 ? "text-amber-400" : "text-white/40"}`} />
                <span>Anúncio</span>
              </div>
              <span className="text-[10px] text-white/30 font-bold">F1</span>
            </button>
          </div>

          {/* FERRAMENTAS */}
          <div>
            <div className="text-[9px] font-extrabold text-white/30 tracking-widest uppercase px-3 mb-2">
              FERRAMENTAS
            </div>
            <div className="space-y-1">
              {/* F2: Site (Moved up) */}
              <button
                onClick={() => {
                  setPhase(2);
                  setActiveTab("phase");
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  activeTab === "phase" && state.currentPhase === 2
                    ? "bg-white/[0.06] text-white border border-white/10"
                    : "text-white/60 hover:text-white hover:bg-white/[0.04]"
                }`}
              >
                <div className="flex items-center gap-3">
                  <FileText className={`w-4 h-4 ${activeTab === "phase" && state.currentPhase === 2 ? "text-amber-400" : "text-white/40"}`} />
                  <span>Site</span>
                </div>
                <span className="text-[10px] text-white/30 font-bold">F2</span>
              </button>

              <button
                onClick={() => {
                  setPhase(6);
                  setActiveTab("phase");
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  activeTab === "phase" && state.currentPhase === 6
                    ? "bg-white/[0.06] text-white border border-white/10"
                    : "text-white/60 hover:text-white hover:bg-white/[0.04]"
                }`}
              >
                <div className="flex items-center gap-3">
                  <ClipboardList className={`w-4 h-4 ${activeTab === "phase" && state.currentPhase === 6 ? "text-amber-400" : "text-white/40"}`} />
                  <span>Formulários</span>
                </div>
                <span className="text-[10px] text-white/30 font-bold">F3</span>
              </button>

              {/* F3: CRM */}
              <button
                onClick={() => {
                  setPhase(3);
                  setActiveTab("phase");
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  activeTab === "phase" && state.currentPhase === 3
                    ? "bg-white/[0.06] text-white border border-white/10"
                    : "text-white/60 hover:text-white hover:bg-white/[0.04]"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Users className={`w-4 h-4 ${activeTab === "phase" && state.currentPhase === 3 ? "text-amber-400" : "text-white/40"}`} />
                  <span>CRM</span>
                </div>
                <span className="text-[10px] text-white/30 font-bold">F5</span>
              </button>

              {/* F4: Plano */}
              <button
                onClick={() => {
                  setPhase(4);
                  setActiveTab("phase");
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  activeTab === "phase" && state.currentPhase === 4
                    ? "bg-white/[0.06] text-white border border-white/10"
                    : "text-white/60 hover:text-white hover:bg-white/[0.04]"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Sliders className={`w-4 h-4 ${activeTab === "phase" && state.currentPhase === 4 ? "text-amber-400" : "text-white/40"}`} />
                  <span>Plano</span>
                </div>
                <span className="text-[10px] text-white/30 font-bold">F4</span>
              </button>

              {/* F5: Checkup */}
              <button
                onClick={() => {
                  setPhase(5);
                  setActiveTab("phase");
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  activeTab === "phase" && state.currentPhase === 5
                    ? "bg-[#D97706]/15 text-[#F59E0B] border border-[#D97706]/35 shadow-[0_0_15px_rgba(245,158,11,0.08)]"
                    : "text-white/60 hover:text-white hover:bg-white/[0.04]"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Zap className={`w-4 h-4 ${activeTab === "phase" && state.currentPhase === 5 ? "text-amber-400" : "text-white/40"}`} />
                  <span>Checkup</span>
                </div>
                <span className={`text-[10px] font-bold ${activeTab === "phase" && state.currentPhase === 5 ? "text-amber-400" : "text-white/30"}`}>F6</span>
              </button>
            </div>
          </div>

          {/* CONTEÃšDO */}
          <div>
            <div className="text-[9px] font-extrabold text-white/30 tracking-widest uppercase px-3 mb-2">
              CONTEÃšDO
            </div>
            <div className="space-y-1">
              <button
                onClick={() => {
                  setActiveTab("library");
                  setLibrarySubTab("ofertas");
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all text-left ${
                  activeTab === "library" && librarySubTab === "ofertas"
                    ? "bg-white/[0.06] text-white border border-white/10 shadow-sm"
                    : "text-white/60 hover:text-white hover:bg-white/[0.04]"
                }`}
              >
                <FolderOpen className={`w-4 h-4 ${activeTab === "library" && librarySubTab === "ofertas" ? "text-amber-400" : "text-white/40"}`} />
                <span>Minhas Ofertas</span>
              </button>
              <button
                onClick={() => {
                  setActiveTab("library");
                  setLibrarySubTab("galeria");
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all text-left ${
                  activeTab === "library" && librarySubTab === "galeria"
                    ? "bg-white/[0.06] text-white border border-white/10 shadow-sm"
                    : "text-white/60 hover:text-white hover:bg-white/[0.04]"
                }`}
              >
                <Library className={`w-4 h-4 ${activeTab === "library" && librarySubTab === "galeria" ? "text-amber-400" : "text-white/40"}`} />
                <span>Minha Biblioteca</span>
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="p-4 border-t border-white/5 space-y-3">
          {/* âœ… FIX #5: Indicador de sync visível em todas as fases */}
          <CloudSaveIndicator />
          <div className="pt-2">
            <button
              onClick={() => navigate("/")}
              className="w-full py-2.5 rounded-xl bg-blue-600/20 border border-blue-500/30 hover:bg-blue-600/30 text-blue-400 text-xs font-semibold flex items-center justify-center gap-2 transition-all"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Voltar ao Canva Viagem
            </button>
          </div>
        </div>
      </aside>

      {/* â”€â”€ MOBILE HEADER (SELETOR COMPATÍVEL) â”€â”€ */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-[#0F0F11] border-b border-white/5 flex items-center justify-between px-4 z-50 animate-slideDown">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-gradient-to-br from-amber-500 to-yellow-300">
            <Sparkles className="w-3.5 h-3.5 text-black" />
          </div>
          <span className="text-xs font-black uppercase tracking-wider text-white">Fábrica</span>
          <span className="text-white/30">/</span>
          <span className="text-xs font-bold text-amber-400">{getPhaseName()}</span>
        </div>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 rounded-lg bg-white/[0.04] border border-white/15"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
        {/* âœ… FIX #5 Mobile: indicador de sync no header mobile */}
        <div className="hidden sm:block">
          <CloudSaveIndicator />
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed top-16 left-0 right-0 bg-[#0F0F11] border-b border-white/10 z-40 p-4 space-y-3 flex flex-col max-h-[80vh] overflow-y-auto">
          <button
            onClick={() => {
              setActiveTab("dashboard");
              setMobileMenuOpen(false);
            }}
            className={`w-full py-3 px-4 rounded-xl text-left text-sm font-semibold ${
              activeTab === "dashboard" ? "bg-white/[0.06] text-amber-400" : "text-white/70"
            }`}
          >
            ðŸ“Š Painel Inicial
          </button>
          
          <div className="text-[9px] font-extrabold text-white/30 tracking-widest uppercase px-4 pt-2">Geração</div>
          <button
            onClick={() => {
              setPhase(1);
              setActiveTab("phase");
              setMobileMenuOpen(false);
            }}
            className={`w-full py-3 px-4 rounded-xl text-left text-sm font-semibold ${
              activeTab === "phase" && state.currentPhase === 1 ? "bg-white/[0.06] text-amber-400" : "text-white/70"
            }`}
          >
            ðŸ–¼ï¸ Anúncio (F1)
          </button>

          <div className="text-[9px] font-extrabold text-white/30 tracking-widest uppercase px-4 pt-2">Ferramentas</div>
          <button
            onClick={() => {
              setPhase(2);
              setActiveTab("phase");
              setMobileMenuOpen(false);
            }}
            className={`w-full py-3 px-4 rounded-xl text-left text-sm font-semibold ${
              activeTab === "phase" && state.currentPhase === 2 ? "bg-white/[0.06] text-amber-400" : "text-white/70"
            }`}
          >
            ðŸ“„ Site (F2)
          </button>
          <button
            onClick={() => {
              setPhase(6);
              setActiveTab("phase");
              setMobileMenuOpen(false);
            }}
            className={`w-full py-3 px-4 rounded-xl text-left text-sm font-semibold ${
              activeTab === "phase" && state.currentPhase === 6 ? "bg-white/[0.06] text-amber-400" : "text-white/70"
            }`}
          >
            Formulários (F3)
          </button>
          <button
            onClick={() => {
              setPhase(3);
              setActiveTab("phase");
              setMobileMenuOpen(false);
            }}
            className={`w-full py-3 px-4 rounded-xl text-left text-sm font-semibold ${
              activeTab === "phase" && state.currentPhase === 3 ? "bg-white/[0.06] text-amber-400" : "text-white/70"
            }`}
          >
            ðŸ‘¥ CRM (F4)
          </button>
          <button
            onClick={() => {
              setPhase(4);
              setActiveTab("phase");
              setMobileMenuOpen(false);
            }}
            className={`w-full py-3 px-4 rounded-xl text-left text-sm font-semibold ${
              activeTab === "phase" && state.currentPhase === 4 ? "bg-white/[0.06] text-amber-400" : "text-white/70"
            }`}
          >
            âš™ï¸ Plano (F5)
          </button>
          <button
            onClick={() => {
              setPhase(5);
              setActiveTab("phase");
              setMobileMenuOpen(false);
            }}
            className={`w-full py-3 px-4 rounded-xl text-left text-sm font-semibold ${
              activeTab === "phase" && state.currentPhase === 5 ? "bg-white/[0.06] text-amber-400" : "text-white/70"
            }`}
          >
            âš¡ Checkup (F6)
          </button>

          <div className="text-[9px] font-extrabold text-white/30 tracking-widest uppercase px-4 pt-2">Conteúdo</div>
          <button
            onClick={() => {
              setActiveTab("library");
              setLibrarySubTab("ofertas");
              setMobileMenuOpen(false);
            }}
            className={`w-full py-3 px-4 rounded-xl text-left text-sm font-semibold ${
              activeTab === "library" && librarySubTab === "ofertas" ? "bg-white/[0.06] text-amber-400" : "text-white/70"
            }`}
          >
            ðŸ“‚ Minhas Ofertas
          </button>
          <button
            onClick={() => {
              setActiveTab("library");
              setLibrarySubTab("galeria");
              setMobileMenuOpen(false);
            }}
            className={`w-full py-3 px-4 rounded-xl text-left text-sm font-semibold ${
              activeTab === "library" && librarySubTab === "galeria" ? "bg-white/[0.06] text-amber-400" : "text-white/70"
            }`}
          >
            ðŸ“š Minha Biblioteca
          </button>

          <div className="border-t border-white/5 pt-3">
            <button
              onClick={() => navigate("/")}
              className="w-full py-3 px-4 rounded-xl text-left text-sm font-semibold text-white/50"
            >
              â† Voltar ao Início
            </button>
          </div>
        </div>
      )}

      {/* â”€â”€ CONTEÃšDO PRINCIPAL (ÁREA DE TRABALHO) â”€â”€ */}
      <main className="flex-1 min-w-0 min-h-screen pt-20 md:pt-8 px-4 md:px-8 pb-24 overflow-y-auto bg-[#0A0A0B]">
        {/* Top Bar with Voice AI and Phase Shortcuts */}
        {isAdmin && (
          <div className="mb-6 p-3 rounded-2xl bg-black border border-white/10 flex items-center flex-wrap gap-2 relative z-40">
            <VoiceOnboarding />

            <div className="h-4 w-px bg-white/10 mx-1 hidden xl:block"></div>

            <div className="flex items-center gap-2 flex-1 overflow-x-auto no-scrollbar">
              <button
                onClick={() => {
                  setActiveTab("dashboard");
                }}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-bold border transition-colors whitespace-nowrap ${
                  activeTab === "dashboard" ? "border-amber-400 bg-amber-400/10 text-amber-400" : "border-white/10 text-white/60 hover:text-white hover:bg-white/5"
                }`}
              >
                Painel
              </button>

              {[
                { name: 'Anúncio', phase: 1 },
                { name: 'Site', phase: 2 },
                { name: 'Formulário', phase: 6 },
                { name: 'CRM', phase: 3 },
                { name: 'Plano', phase: 4 },
                { name: 'Checkup', phase: 5 },
              ].map(({ name, phase }) => {
                return (
                <button
                  key={phase}
                  onClick={() => {
                    setPhase(phase);
                    setActiveTab("phase");
                  }}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-bold border transition-colors whitespace-nowrap ${
                    activeTab === "phase" && state.currentPhase === phase ? "border-amber-400 bg-amber-400/10 text-amber-400" : "border-white/10 text-white/60 hover:text-white hover:bg-white/5"
                  }`}
                >
                  {name}
                </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Dynamic Component Render */}
        <div className="transition-all duration-300">
          {activeTab === "dashboard" && (
            <FabricaDashboard 
              onNavigate={(tab, phase) => {
                setActiveTab(tab);
                if (phase) setPhase(phase);
              }} 
            />
          )}
          {activeTab === "library" && (
            <FabricaLibrary subTab={librarySubTab} setSubTab={setLibrarySubTab} />
          )}
          {activeTab === "phase" && (
            <>
              {state.currentPhase === 1 && <Phase3ArtFactory onNext={() => setPhase(2)} onBack={() => {}} />}
              {state.currentPhase === 2 && <Phase4LandingBuilder onNext={() => setPhase(6)} onBack={() => setPhase(1)} />}
              {state.currentPhase === 6 && <Phase6Forms onNext={() => setPhase(3)} onBack={() => setPhase(2)} />}
              {state.currentPhase === 3 && <Phase5Dashboard />}
              {state.currentPhase === 4 && <Phase2Ativos onNext={() => setPhase(5)} onBack={() => setPhase(3)} />}
              {state.currentPhase === 5 && <Phase1Diagnostico onComplete={() => setPhase(4)} onBack={() => setPhase(4)} />}
            </>
          )}
        </div>
      </main>
    </div>
  );
};

const FabricaContent = () => {
  const navigate = useNavigate();
  const { subscription, isAdmin, user, loading: authLoading } = useAuth();
  const [accessGranted, setAccessGranted] = useState(false);

  // Navigate is now handled gracefully during render with <Navigate />

  const isElite = hasEliteAccess(subscription);
  const hasAccess = isAdmin || isElite;
  const canUseFabrica = hasAccess;

  useEffect(() => {
    if (hasAccess && !accessGranted) {
      setAccessGranted(true);
    }
  }, [hasAccess, accessGranted]);

  // Spinner SÃ“ no primeiro carregamento real (sem user e sem acesso já concedido).
  // Reverificações silenciosas em background NÃƒO devem mais derrubar pra esta tela.
  if (!accessGranted && authLoading && !user) {
    return (
      <div className="min-h-screen bg-[#0A0A0B] flex flex-col items-center justify-center text-white">
        <Loader2 className="w-8 h-8 animate-spin text-amber-500 mb-2" />
        <span className="text-sm text-white/60">Verificando suas credenciais...</span>
      </div>
    );
  }

  if (!user) {
    if (!authLoading) {
      // Use standard react-router Navigate component instead of useEffect for reliable redirects
      return <Navigate to="/auth?redirect=/fabrica" replace />;
    }
    
    return (
      <div className="min-h-screen bg-[#03070F] flex flex-col items-center justify-center text-white">
        <Loader2 className="w-8 h-8 animate-spin text-cyan-400 mb-2" />
        <span className="text-sm text-white/60">Verificando sessão...</span>
      </div>
    );
  }

  if (!canUseFabrica) {
    return <Navigate to="/inicio?upgrade=fabrica" replace />;
  }

  return (
    <>
      <SeoMetadata title="Fábrica de Viagens | Canva Viagem" description="Sistema completo de marketing e geração de anúncios com IA para agências de viagens." />
      <FabricaInner />
    </>
  );
};

const Fabrica = () => {
  return (
    <FabricaProvider>
      <FabricaContent />
    </FabricaProvider>
  );
};

export default Fabrica;
