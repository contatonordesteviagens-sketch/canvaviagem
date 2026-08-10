import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { FabricaProvider, useFabricaContext } from "@/hooks/useFabricaContext";
import { Phase1DiagnosticoES } from "@/pages/fabrica/Phase1DiagnosticoES";
import { Phase2AtivosES } from "@/pages/fabrica/Phase2AtivosES";
import { Phase3ArtFactoryES } from "@/pages/fabrica/Phase3ArtFactoryES";
import { Phase4LandingBuilderES } from "@/pages/fabrica/Phase4LandingBuilderES";
import { Phase5DashboardES } from "@/pages/fabrica/Phase5DashboardES";
import { FabricaDashboardES } from "@/pages/fabrica/FabricaDashboardES";
import { FabricaLibraryES } from "@/pages/fabrica/FabricaLibraryES";
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
  Users,
  Menu,
  X
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import SeoMetadata from "@/components/SeoMetadata";
import { CloudSaveIndicatorES } from "@/components/fabrica/CloudSaveIndicatorES";
import { useEntitlements } from "@/contexts/EntitlementsContext";
import { FabricaLockedFeature } from "@/components/fabrica/FabricaLockedFeature";

const FabricaInnerES = () => {
  const { state, setPhase } = useFabricaContext();
  const { isAdmin } = useAuth();
  const { can } = useEntitlements();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"dashboard" | "phase">("dashboard");
  
  useEffect(() => {
    window.scrollTo(0, 0);
    const path = location.pathname.toLowerCase();
    if (path.includes("/anuncio") || path.includes("/anuncios")) {
      setActiveTab("phase");
      if (state.currentPhase !== 1) setPhase(1);
    } else if (path.includes("/carrossel") || path.includes("/carrusel")) {
      setActiveTab("phase");
      if (state.currentPhase !== 2) setPhase(2);
    } else if (path.includes("/site") || path.includes("/sites") || path.includes("/sitio")) {
      setActiveTab("phase");
      if (state.currentPhase !== 3) setPhase(3);
    } else if (path.includes("/crm")) {
      setActiveTab("phase");
      if (state.currentPhase !== 4) setPhase(4);
    } else if (path.includes("/checkup") || path.includes("/plano") || path.includes("/plan") || path.includes("/planos") || path.includes("/projeto") || path.includes("/projetos")) {
      setActiveTab("phase");
      if (state.currentPhase !== 5) setPhase(5);
    } else if (path === "/fabrica" || path === "/es/fabrica") {
      setActiveTab("dashboard");
    }
  }, [location.pathname, state.currentPhase, setPhase]);

  useEffect(() => {
    const color = state.primaryColor || "#F59E0B";
    document.documentElement.style.setProperty("--fabrica-primary", color);
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
    if (activeTab === "dashboard") return "Panel Inicial";
    
    if (state.currentPhase === 1) return "Anuncio";
    if (state.currentPhase === 2) return "Carrusel";
    if (state.currentPhase === 3) return "Sitio";
    if (state.currentPhase === 4) return "CRM";
    if (state.currentPhase === 5) return "Planos";
    
    return "";
  };

  return (
    <div
      className="min-h-screen flex bg-[#0A0A0B] text-white"
      style={{
        fontFamily: "Inter, sans-serif",
      }}
    >
      {/* ── SIDEBAR LATERAL ESQUERDA (DESKTOP) ── */}
      <aside className="w-64 border-r border-white/5 bg-[#0F0F11] flex-shrink-0 flex flex-col hidden md:flex sticky top-0 h-screen z-40 select-none">
        {/* Brand Header */}
        <div className="p-6 border-b border-white/5 flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-gradient-to-br from-amber-500 to-yellow-300 shadow-[0_0_15px_rgba(245,158,11,0.3)]">
            <Sparkles className="w-4 h-4 text-black font-black" />
          </div>
          <div>
            <div className="text-xs font-black text-white leading-none tracking-tight font-sans">Fábrica de Viagens</div>
            <div className="text-[9px] font-bold text-white/40 uppercase tracking-widest mt-0.5 font-sans">Panel de Creación</div>
          </div>
        </div>

        {/* Menu Items */}
        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
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
              <span>Panel Inicial</span>
            </button>
          </div>

          {/* GENERACIÓN */}
          <div>
            <div className="text-[9px] font-extrabold text-white/30 tracking-widest uppercase px-3 mb-2 font-sans">
              GENERACIÓN
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
                <span>Anuncio</span>
              </div>
            </button>
          </div>

          {/* HERRAMIENTAS */}
          <div>
            <div className="text-[9px] font-extrabold text-white/30 tracking-widest uppercase px-3 mb-2 font-sans">
              HERRAMIENTAS
            </div>
            <div className="space-y-1">
              {/* F2: Carrusel */}
              <button
                onClick={() => {
                  setPhase(2);
                  setActiveTab("phase");
                  navigate(location.pathname.startsWith("/es") ? "/es/fabrica/carrusel" : "/fabrica/carrusel");
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  activeTab === "phase" && state.currentPhase === 2
                    ? "bg-white/[0.06] text-white border border-white/10"
                    : "text-white/60 hover:text-white hover:bg-white/[0.04]"
                }`}
              >
                <div className="flex items-center gap-3">
                  <ImageIcon className={`w-4 h-4 ${activeTab === "phase" && state.currentPhase === 2 ? "text-amber-400" : "text-white/40"}`} />
                  <span>Carrusel</span>
                </div>
              </button>

              {/* F3: Sitio */}
              <button
                onClick={() => {
                  setPhase(3);
                  setActiveTab("phase");
                  navigate(location.pathname.startsWith("/es") ? "/es/fabrica/sitio" : "/fabrica/sitio");
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  activeTab === "phase" && state.currentPhase === 3
                    ? "bg-white/[0.06] text-white border border-white/10"
                    : "text-white/60 hover:text-white hover:bg-white/[0.04]"
                }`}
              >
                <div className="flex items-center gap-3">
                  <FileText className={`w-4 h-4 ${activeTab === "phase" && state.currentPhase === 3 ? "text-amber-400" : "text-white/40"}`} />
                  <span>Sitio</span>
                </div>
              </button>

              {/* F4: CRM */}
              <button
                onClick={() => {
                  setPhase(4);
                  setActiveTab("phase");
                  navigate(location.pathname.startsWith("/es") ? "/es/fabrica/crm" : "/fabrica/crm");
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  activeTab === "phase" && state.currentPhase === 4
                    ? "bg-white/[0.06] text-white border border-white/10"
                    : "text-white/60 hover:text-white hover:bg-white/[0.04]"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Users className={`w-4 h-4 ${activeTab === "phase" && state.currentPhase === 4 ? "text-amber-400" : "text-white/40"}`} />
                  <span>CRM</span>
                </div>
              </button>

              {/* F5: Planos */}
              <button
                onClick={() => {
                  setPhase(5);
                  setActiveTab("phase");
                  navigate(location.pathname.startsWith("/es") ? "/es/fabrica/planos" : "/fabrica/planos");
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  activeTab === "phase" && state.currentPhase === 5
                    ? "bg-white/[0.06] text-white border border-white/10"
                    : "text-white/60 hover:text-white hover:bg-white/[0.04]"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Sliders className={`w-4 h-4 ${activeTab === "phase" && state.currentPhase === 5 ? "text-amber-400" : "text-white/40"}`} />
                  <span>Planos</span>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* User Footer / Info */}
        <div className="p-4 border-t border-white/5 bg-[#0A0A0B]/40 font-sans space-y-3">
          {/* ✅ FIX #5: Indicador de sync visível em todas as fases */}
          
          <button
            onClick={() => navigate("/es")}
            className="w-full py-2.5 rounded-xl bg-white/[0.04] border border-white/10 hover:bg-white/[0.08] text-white/80 text-xs font-semibold flex items-center justify-center gap-2 transition-all"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Volver al Panel
          </button>
        </div>
      </aside>

      {/* ── MOBILE HEADER (SELETOR COMPATÍVEL) ── */}
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
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed top-16 left-0 right-0 bg-[#0F0F11] border-b border-white/10 z-40 p-4 space-y-3 flex flex-col max-h-[80vh] overflow-y-auto font-sans">
          <button
            onClick={() => {
              setActiveTab("dashboard");
              setMobileMenuOpen(false);
            }}
            className={`w-full py-3 px-4 rounded-xl text-left text-sm font-semibold ${
              activeTab === "dashboard" ? "bg-white/[0.06] text-amber-400" : "text-white/70"
            }`}
          >
            📊 Panel Inicial
          </button>
          
          <div className="text-[9px] font-extrabold text-white/30 tracking-widest uppercase px-4 pt-2">Generación</div>
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
            🖼️ Anuncio
          </button>

          <div className="text-[9px] font-extrabold text-white/30 tracking-widest uppercase px-4 pt-2">Herramientas</div>
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
            🖼️ Carrusel
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
            📄 Sitio
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
            👥 CRM
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
            ⚙️ Planos
          </button>


          <div className="border-t border-white/5 pt-3">
            <button
              onClick={() => navigate("/es")}
              className="w-full py-3 px-4 rounded-xl text-left text-sm font-semibold text-white/50"
            >
              ← Volver al Panel
            </button>
          </div>
        </div>
      )}

      {/* ── CONTEÚDO PRINCIPAL (ÁREA DE TRABALHO) ── */}
      <main className="flex-1 min-w-0 pt-20 md:pt-8 px-4 md:px-8 pb-24 bg-[#0A0A0B]">
        {/* Admin Quick Phase Selector */}
        {isAdmin && (
          <div className="mb-6 p-3 rounded-2xl bg-black border border-white/10 flex items-center gap-2 overflow-x-auto font-sans">
            <span className="text-[9px] font-black text-amber-400 uppercase tracking-widest mr-2 select-none">Atajos Admin:</span>
            {['Anuncio', 'Carrusel', 'Sitio', 'CRM', 'Planos'].map((name, idx) => {
              const num = idx + 1;
              return (
              <button
                key={num}
                onClick={() => {
                  setPhase(num);
                  setActiveTab("phase");
                }}
                className={`px-3 py-1 rounded-lg text-[10px] font-bold border transition-colors ${
                  activeTab === "phase" && state.currentPhase === num ? "border-amber-400 bg-amber-400/10 text-amber-400" : "border-white/10 text-white/60"
                }`}
              >{name} (F{num})</button>
              );
            })}
          </div>
        )}

        {/* Dynamic Component Render */}
        <div className="transition-all duration-300">
          {activeTab === "dashboard" && (
            <FabricaDashboardES 
              onNavigate={(tab, phase) => {
                if (tab === "library") return;
                setActiveTab(tab);
                if (phase) setPhase(phase);
              }} 
            />
          )}
          {activeTab === "phase" && (
            <>
              {state.currentPhase === 1 && <Phase3ArtFactoryES key="phase1-ad-es" onNext={() => navigate("/es/fabrica/carrossel")} onBack={() => {}} lockMode={true} initialMode="ad" onSkipToSite={() => navigate("/es/fabrica/site")} />}
              {state.currentPhase === 2 && <Phase3ArtFactoryES key="phase2-carousel-es" onNext={() => navigate("/es/fabrica/site")} onBack={() => navigate("/es/fabrica/anuncio")} lockMode={true} initialMode="carousel" />}
              {state.currentPhase === 3 && <Phase4LandingBuilderES onNext={() => navigate("/es/fabrica/crm")} onBack={() => navigate("/es/fabrica/carrossel")} />}
              {state.currentPhase === 4 && (
                can("crm.real_data") ? (
                  <Phase5DashboardES onNext={() => navigate("/es/fabrica/planos")} onBack={() => navigate("/es/fabrica/site")} />
                ) : (
                  <FabricaLockedFeature
                    feature="crm"
                    title="Convierte visitas en una cartera organizada"
                    description="Puedes conocer el flujo completo. Los leads reales, las métricas y el seguimiento se liberan con Elite."
                    previewItems={[
                      "Visitas, clics y conversión por proyecto",
                      "Leads separados para cada agencia y sitio",
                      "Historial preservado incluso al cambiar de plan",
                    ]}
                  />
                )
              )}
              {state.currentPhase === 5 && (
                <div className="space-y-8 pb-12">
                  <Phase2AtivosES onNext={() => {}} onBack={() => navigate("/es/fabrica/crm")} />
                  <Phase1DiagnosticoES onComplete={() => {}} onBack={() => {}} />
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
};

const FabricaContentES = () => {
  const { loading: authLoading } = useAuth();

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#0A0A0B] flex flex-col items-center justify-center text-white font-sans">
        <Loader2 className="w-8 h-8 animate-spin text-amber-500 mb-2" />
        <span className="text-sm text-white/60">Verificando tus credenciales...</span>
      </div>
    );
  }

  return (
    <>
      <SeoMetadata title="Fábrica de Viajes | Canva Viajes" description="Sistema completo de marketing y generación de anuncios con IA para agencias de viajes." />
      <FabricaInnerES />
    </>
  );
};

const FabricaES = () => {
  return (
    <FabricaProvider key="es">
      <FabricaContentES />
    </FabricaProvider>
  );
};

export default FabricaES;
