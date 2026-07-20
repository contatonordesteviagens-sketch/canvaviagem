import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { FabricaProvider, useFabricaContext } from "@/hooks/useFabricaContext";
import { Phase1Diagnostico } from "@/pages/fabrica/Phase1Diagnostico";
import { Phase2Ativos } from "@/pages/fabrica/Phase2Ativos";
import { Phase3ArtFactory } from "@/pages/fabrica/Phase3ArtFactory";
import { Phase4LandingBuilder } from "@/pages/fabrica/Phase4LandingBuilder";
import { Phase5Dashboard } from "@/pages/fabrica/Phase5Dashboard";
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
  Users
} from "lucide-react";
import { useLocation, useNavigate, Navigate } from "react-router-dom";
import SeoMetadata from "@/components/SeoMetadata";
import { CloudSaveIndicator } from "@/components/fabrica/CloudSaveIndicator";
import { hasEliteAccess } from "@/lib/planAccess";
import { isLocalPreviewEnabled } from "@/lib/localPreview";
import { toast } from "sonner";

const FabricaInner = () => {
  const { state, setPhase, switchProject, isHydrated } = useFabricaContext();
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"dashboard" | "phase" | "library">("dashboard");
  const [librarySubTab, setLibrarySubTab] = useState<"ofertas" | "galeria">("ofertas");
  const prefillSwitchInProgressRef = useRef(false);

  useEffect(() => {
    const snapshot = (location.state as { prefillSnapshot?: any } | null)?.prefillSnapshot;
    if (!snapshot || !isHydrated || prefillSwitchInProgressRef.current) return;

    prefillSwitchInProgressRef.current = true;
    void switchProject({ ...(snapshot as any), diagnosticoCompleto: false })
      .catch((error) => {
        console.warn("[Fábrica] Não foi possível abrir o projeto solicitado:", error);
        toast.error("Não foi possível salvar o projeto atual. A troca foi cancelada para proteger suas alterações.");
      })
      .finally(() => {
        navigate(location.pathname, { replace: true, state: null });
        prefillSwitchInProgressRef.current = false;
      });
  }, [isHydrated, location.state, location.pathname, navigate, switchProject]);

  useEffect(() => {
    const path = location.pathname.toLowerCase();
    if (path.includes("/anuncio") || path.includes("/anuncios")) {
      setActiveTab("phase");
      setPhase(1);
    } else if (path.includes("/site") || path.includes("/sites")) {
      setActiveTab("phase");
      setPhase(2);
    } else if (path.includes("/crm")) {
      setActiveTab("phase");
      setPhase(3);
    } else if (path.includes("/checkup")) {
      setActiveTab("phase");
      setPhase(5);
    } else if (path.includes("/plano") || path.includes("/planos") || path.includes("/projeto") || path.includes("/projetos")) {
      setActiveTab("phase");
      setPhase(4);
    } else if (path.includes("/ofertas") || path.includes("/oferta")) {
      setActiveTab("library");
      setLibrarySubTab("ofertas");
    } else if (path.includes("/galeria") || path.includes("/biblioteca") || path.includes("/artes") || path.includes("/arte")) {
      setActiveTab("library");
      setLibrarySubTab("galeria");
    }
  }, [location.pathname, setPhase]);

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
    if (state.currentPhase === 1) return "Anúncio (F1)";
    if (state.currentPhase === 2) return "Site (F2)";
    if (state.currentPhase === 3) return "CRM (F3)";
    if (state.currentPhase === 5) return "Checkup (F4)";
    if (state.currentPhase === 4) return "Plano (F5)";
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
              onClick={() => {
                setActiveTab("dashboard");
                navigate(location.pathname.startsWith("/es") ? "/es/fabrica" : "/fabrica");
              }}
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

          {/* GERAÇÃO */}
          <div>
            <div className="text-[9px] font-extrabold text-white/30 tracking-widest uppercase px-3 mb-2">
              GERAÇÃO
            </div>
            <button
              onClick={() => {
                setPhase(1);
                setActiveTab("phase");
                navigate(location.pathname.startsWith("/es") ? "/es/fabrica/anuncio" : "/fabrica/anuncio");
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
              {/* F2: Site */}
              <button
                onClick={() => {
                  setPhase(2);
                  setActiveTab("phase");
                  navigate(location.pathname.startsWith("/es") ? "/es/fabrica/site" : "/fabrica/site");
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

              {/* F3: CRM */}
              <button
                onClick={() => {
                  setPhase(3);
                  setActiveTab("phase");
                  navigate(location.pathname.startsWith("/es") ? "/es/fabrica/crm" : "/fabrica/crm");
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
                <span className="text-[10px] text-white/30 font-bold">F3</span>
              </button>

              {/* F4: Checkup */}
              <button
                onClick={() => {
                  setPhase(5);
                  setActiveTab("phase");
                  navigate(location.pathname.startsWith("/es") ? "/es/fabrica/checkup" : "/fabrica/checkup");
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
                <span className={`text-[10px] font-bold ${activeTab === "phase" && state.currentPhase === 5 ? "text-amber-400" : "text-white/30"}`}>F4</span>
              </button>

              {/* F5: Plano */}
              <button
                onClick={() => {
                  setPhase(4);
                  setActiveTab("phase");
                  navigate(location.pathname.startsWith("/es") ? "/es/fabrica/plano" : "/fabrica/plano");
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
                <span className="text-[10px] text-white/30 font-bold">F5</span>
              </button>
            </div>
          </div>

          {/* CONTEÚDO */}
          <div>
            <div className="text-[9px] font-extrabold text-white/30 tracking-widest uppercase px-3 mb-2">
              CONTEÚDO
            </div>
            <div className="space-y-1">
              <button
                onClick={() => {
                  setActiveTab("library");
                  setLibrarySubTab("ofertas");
                  navigate(location.pathname.startsWith("/es") ? "/es/fabrica/ofertas" : "/fabrica/ofertas");
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
                  navigate(location.pathname.startsWith("/es") ? "/es/fabrica/artes" : "/fabrica/artes");
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

        {/* ── MOBILE HEADER (SELETOR COMPATÍVEL) ── */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-[#0F0F11] border-b border-white/5 flex items-center justify-between px-4 z-50 animate-slideDown">
        <div className="flex items-center gap-2 min-w-0 pr-2">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-gradient-to-br from-amber-500 to-yellow-300 shrink-0">
            <Sparkles className="w-3.5 h-3.5 text-black" />
          </div>
          <span className="text-xs font-black uppercase tracking-wider text-white shrink-0">Fábrica</span>
          <span className="text-white/30 shrink-0">/</span>
          <span className="text-xs font-bold text-amber-400 truncate">{getPhaseName()}</span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <div className="hidden sm:block">
            <CloudSaveIndicator />
          </div>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg bg-white/[0.04] border border-white/15 active:scale-95 transition-transform"
            aria-label="Abrir Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5 text-amber-400" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Backdrop */}
      {mobileMenuOpen && (
        <div 
          onClick={() => setMobileMenuOpen(false)}
          className="md:hidden fixed inset-0 bg-black/80 backdrop-blur-sm z-[55] animate-fadeIn"
        />
      )}

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed top-16 left-0 right-0 bg-[#0F0F11] border-b border-white/15 z-[60] p-4 space-y-2 flex flex-col max-h-[85vh] overflow-y-auto shadow-2xl animate-slideDown">
          <button
            onClick={() => {
              setActiveTab("dashboard");
              setMobileMenuOpen(false);
              navigate(location.pathname.startsWith("/es") ? "/es/fabrica" : "/fabrica");
            }}
            className={`w-full py-3 px-4 rounded-xl text-left text-sm font-semibold flex items-center gap-2 ${
              activeTab === "dashboard" ? "bg-white/[0.06] text-amber-400" : "text-white/70"
            }`}
          >
            <span>📊</span> Painel Inicial
          </button>
          
          <div className="text-[9px] font-extrabold text-white/30 tracking-widest uppercase px-4 pt-2">Geração</div>
          <button
            onClick={() => {
              setPhase(1);
              setActiveTab("phase");
              setMobileMenuOpen(false);
              navigate(location.pathname.startsWith("/es") ? "/es/fabrica/anuncio" : "/fabrica/anuncio");
            }}
            className={`w-full py-3 px-4 rounded-xl text-left text-sm font-semibold flex items-center gap-2 ${
              activeTab === "phase" && state.currentPhase === 1 ? "bg-white/[0.06] text-amber-400" : "text-white/70"
            }`}
          >
            <span>🖼️</span> Anúncio (F1)
          </button>

          <div className="text-[9px] font-extrabold text-white/30 tracking-widest uppercase px-4 pt-2">Ferramentas</div>
          <button
            onClick={() => {
              setPhase(2);
              setActiveTab("phase");
              setMobileMenuOpen(false);
              navigate(location.pathname.startsWith("/es") ? "/es/fabrica/site" : "/fabrica/site");
            }}
            className={`w-full py-3 px-4 rounded-xl text-left text-sm font-semibold flex items-center gap-2 ${
              activeTab === "phase" && state.currentPhase === 2 ? "bg-white/[0.06] text-amber-400" : "text-white/70"
            }`}
          >
            <span>📄</span> Site (F2)
          </button>
          <button
            onClick={() => {
              setPhase(3);
              setActiveTab("phase");
              setMobileMenuOpen(false);
              navigate(location.pathname.startsWith("/es") ? "/es/fabrica/crm" : "/fabrica/crm");
            }}
            className={`w-full py-3 px-4 rounded-xl text-left text-sm font-semibold flex items-center gap-2 ${
              activeTab === "phase" && state.currentPhase === 3 ? "bg-white/[0.06] text-amber-400" : "text-white/70"
            }`}
          >
            <span>👥</span> CRM (F3)
          </button>
          <button
            onClick={() => {
              setPhase(5);
              setActiveTab("phase");
              setMobileMenuOpen(false);
              navigate(location.pathname.startsWith("/es") ? "/es/fabrica/checkup" : "/fabrica/checkup");
            }}
            className={`w-full py-3 px-4 rounded-xl text-left text-sm font-semibold flex items-center gap-2 ${
              activeTab === "phase" && state.currentPhase === 5 ? "bg-white/[0.06] text-amber-400" : "text-white/70"
            }`}
          >
            <span>⚡</span> Checkup (F4)
          </button>
          <button
            onClick={() => {
              setPhase(4);
              setActiveTab("phase");
              setMobileMenuOpen(false);
              navigate(location.pathname.startsWith("/es") ? "/es/fabrica/plano" : "/fabrica/plano");
            }}
            className={`w-full py-3 px-4 rounded-xl text-left text-sm font-semibold flex items-center gap-2 ${
              activeTab === "phase" && state.currentPhase === 4 ? "bg-white/[0.06] text-amber-400" : "text-white/70"
            }`}
          >
            <span>⚙️</span> Plano (F5)
          </button>

          <div className="text-[9px] font-extrabold text-white/30 tracking-widest uppercase px-4 pt-2">Conteúdo</div>
          <button
            onClick={() => {
              setActiveTab("library");
              setLibrarySubTab("ofertas");
              setMobileMenuOpen(false);
              navigate(location.pathname.startsWith("/es") ? "/es/fabrica/ofertas" : "/fabrica/ofertas");
            }}
            className={`w-full py-3 px-4 rounded-xl text-left text-sm font-semibold flex items-center gap-2 ${
              activeTab === "library" && librarySubTab === "ofertas" ? "bg-white/[0.06] text-amber-400" : "text-white/70"
            }`}
          >
            <span>📂</span> Minhas Ofertas
          </button>
          <button
            onClick={() => {
              setActiveTab("library");
              setLibrarySubTab("galeria");
              setMobileMenuOpen(false);
              navigate(location.pathname.startsWith("/es") ? "/es/fabrica/artes" : "/fabrica/artes");
            }}
            className={`w-full py-3 px-4 rounded-xl text-left text-sm font-semibold flex items-center gap-2 ${
              activeTab === "library" && librarySubTab === "galeria" ? "bg-white/[0.06] text-amber-400" : "text-white/70"
            }`}
          >
            <span>📚</span> Minha Biblioteca
          </button>

          <div className="border-t border-white/5 pt-3">
            <button
              onClick={() => navigate("/")}
              className="w-full py-3 px-4 rounded-xl text-left text-sm font-semibold text-white/50 flex items-center gap-2"
            >
              <span>←</span> Voltar ao Início
            </button>
          </div>
        </div>
      )}

      {/* ——— CONTEÚDO PRINCIPAL (ÁREA DE TRABALHO) ——— */}
      <main className="flex-1 min-w-0 min-h-screen pt-20 md:pt-8 px-4 md:px-8 pb-24 overflow-y-auto bg-[#0A0A0B]">
        {/* Top Bar with Voice AI and Phase Shortcuts */}
        <div className="mb-4 sm:mb-6 p-2.5 sm:p-3 rounded-2xl bg-black border border-white/10 flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 relative z-30">
            <div className="w-full sm:w-auto flex justify-center sm:justify-start shrink-0 min-w-0">
              <VoiceOnboarding />
            </div>

            <div className="h-4 w-px bg-white/10 mx-1 hidden sm:block"></div>

            <div className="flex items-center gap-1.5 sm:gap-2 w-full sm:flex-1 overflow-x-auto no-scrollbar pb-1 sm:pb-0">
              <button
                onClick={() => {
                  setActiveTab("dashboard");
                }}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-bold border transition-colors whitespace-nowrap shrink-0 ${
                  activeTab === "dashboard" ? "border-amber-400 bg-amber-400/10 text-amber-400" : "border-white/10 text-white/60 hover:text-white hover:bg-white/5"
                }`}
              >
                Painel
              </button>

              {[
                { name: 'Anúncio', phase: 1 },
                { name: 'Site', phase: 2 },
                { name: 'CRM', phase: 3 },
                { name: 'Checkup', phase: 5 },
                { name: 'Plano', phase: 4 },
              ].map(({ name, phase }) => {
                return (
                <button
                  key={phase}
                  onClick={() => {
                    setPhase(phase);
                    setActiveTab("phase");
                  }}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-bold border transition-colors whitespace-nowrap shrink-0 ${
                    activeTab === "phase" && state.currentPhase === phase ? "border-amber-400 bg-amber-400/10 text-amber-400" : "border-white/10 text-white/60 hover:text-white hover:bg-white/5"
                  }`}
                >
                  {name}
                </button>
                );
              })}
            </div>
          </div>

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
              {state.currentPhase === 2 && <Phase4LandingBuilder onNext={() => setPhase(3)} onBack={() => setPhase(1)} />}
              {state.currentPhase === 3 && <Phase5Dashboard onNext={() => setPhase(5)} onBack={() => setPhase(2)} />}
              {state.currentPhase === 5 && <Phase1Diagnostico onComplete={() => setPhase(4)} onBack={() => setPhase(3)} />}
              {state.currentPhase === 4 && <Phase2Ativos onNext={() => {}} onBack={() => setPhase(5)} />}
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
  const localPreview = isLocalPreviewEnabled();

  // Navigate is now handled gracefully during render with <Navigate />

  const isElite = hasEliteAccess(subscription);
  const hasAccess = isAdmin || isElite || user?.email === "lucashenriquephd@gmail.com" || localPreview;
  const canUseFabrica = hasAccess;

  useEffect(() => {
    if (hasAccess && !accessGranted) {
      setAccessGranted(true);
    }
  }, [hasAccess, accessGranted]);

  // Spinner SÓ no primeiro carregamento real (sem user e sem acesso já concedido).
  // Reverificações silenciosas em background NÃO devem mais derrubar pra esta tela.
  if (!localPreview && !accessGranted && (authLoading || subscription.loading)) {
    return (
      <div className="min-h-screen bg-[#0A0A0B] flex flex-col items-center justify-center text-white">
        <Loader2 className="w-8 h-8 animate-spin text-amber-500 mb-2" />
        <span className="text-sm text-white/60">Verificando permissões de acesso...</span>
      </div>
    );
  }

  if (!user && !localPreview) {
    return <Navigate to="/auth?redirect=/fabrica" replace />;
  }

  if (!canUseFabrica && !subscription.loading) {
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
