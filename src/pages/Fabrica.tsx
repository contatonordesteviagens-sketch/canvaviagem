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
import { FabricaLockedFeature } from "@/components/fabrica/FabricaLockedFeature";
import { FabricaStepGuide, type FabricaGuideKey } from "@/components/fabrica/FabricaStepGuide";
import { JornadaGuia } from "@/components/jornada/JornadaGuia";
import { MinhaBiblioteca } from "@/components/jornada/MinhaBiblioteca";
import { VideoLabTela } from "@/pages/dev/VideoLab";
import { Clapperboard, FolderHeart, Moon, Sun } from "lucide-react";
import "@/styles/fabrica-tema-claro.css";
import { useEntitlements } from "@/contexts/EntitlementsContext";
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
  Layout
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import SeoMetadata from "@/components/SeoMetadata";
import { CloudSaveIndicator } from "@/components/fabrica/CloudSaveIndicator";
import { isLocalPreviewEnabled } from "@/lib/localPreview";
import { toast } from "sonner";

/** Derives the active phase number (1-5) directly from the URL pathname.
 *  Returns 0 when the path is the dashboard root (no phase segment). */
const getPhaseFromPath = (pathname: string): number => {
  const p = pathname.toLowerCase();
  if (p.includes("/video")) return 6;
  if (p.includes("/biblioteca") || p.includes("/conteudos")) return 7;
  if (p.includes("/anuncio") || p.includes("/anuncios")) return 1;
  if (p.includes("/carrossel") || p.includes("/carrusel")) return 2;
  if (p.includes("/site") || p.includes("/sites")) return 3;
  if (p.includes("/crm")) return 4;
  if (p.includes("/checkup") || p.includes("/plano") || p.includes("/planos") || p.includes("/projeto") || p.includes("/projetos")) return 5;
  return 0;
};

const FabricaInner = () => {
  const { state, setPhase, switchProject, isHydrated } = useFabricaContext();
  const { user } = useAuth();
  const { can, track } = useEntitlements();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  // Tema claro ou escuro da Fábrica (botão sol/lua). Fica salvo no aparelho.
  const [temaClaro, setTemaClaro] = useState(() => {
    try { return localStorage.getItem("cv-fabrica-tema") === "claro"; } catch { return false; }
  });
  useEffect(() => {
    document.documentElement.classList.toggle("fabrica-claro", temaClaro);
    try { localStorage.setItem("cv-fabrica-tema", temaClaro ? "claro" : "escuro"); } catch { /* sem storage */ }
    return () => document.documentElement.classList.remove("fabrica-claro");
  }, [temaClaro]);
  useEffect(() => {
    if (!mobileMenuOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setMobileMenuOpen(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mobileMenuOpen]);
  // A pílula ativa precisa estar visível: no celular "Meus Pacotes" ficava fora da tela.
  const activePillRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    activePillRef.current?.scrollIntoView({ inline: "center", block: "nearest", behavior: "smooth" });
  }, [location.pathname]);
  const prefillSwitchInProgressRef = useRef(false);

  // ── ÚNICA FONTE DE VERDADE: a URL decide a fase e aba ativas ──
  const phaseFromPath = getPhaseFromPath(location.pathname);
  const activeTab: "dashboard" | "phase" = phaseFromPath > 0 ? "phase" : "dashboard";
  const activePhase = phaseFromPath; // 0 = dashboard, 1-5 = fase específica

  const isES = location.pathname.startsWith("/es");

  useEffect(() => {
    const snapshot = (location.state as { prefillSnapshot?: any } | null)?.prefillSnapshot;
    if (!snapshot || !isHydrated || prefillSwitchInProgressRef.current) return;

    prefillSwitchInProgressRef.current = true;
    void switchProject(
      { ...(snapshot as any), diagnosticoCompleto: false },
      { expectedUserId: user?.id },
    )
      .catch((error) => {
        console.warn("[Fábrica] Não foi possível abrir o projeto solicitado:", error);
        toast.error("Não foi possível salvar o projeto atual. A troca foi cancelada para proteger suas alterações.");
      })
      .finally(() => {
        navigate(location.pathname, { replace: true, state: null });
        prefillSwitchInProgressRef.current = false;
      });
  }, [isHydrated, location.state, location.pathname, navigate, switchProject, user?.id]);

  // Scroll to top on navigation
  useEffect(() => { window.scrollTo(0, 0); }, [location.pathname]);

  useEffect(() => {
    track("fabrica_opened", { phase: activePhase || "dashboard" });
  }, [activePhase, track]);

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
    if (activeTab === "dashboard") return "Painel Inicial";
    if (activePhase === 1) return "Anúncio";
    if (activePhase === 2) return "Carrossel";
    if (activePhase === 3) return "Site";
    if (activePhase === 4) return "CRM";
    if (activePhase === 5) return "Meus Pacotes";
    if (activePhase === 6) return "Gerador de vídeo";
    if (activePhase === 7) return "Meus conteúdos";
    return "";
  };

  return (
    <div
      className="fabrica-app min-h-screen flex bg-[#0A0A0B] text-white"
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
        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {/* Dashboard Geral */}
          <div>
            <button
              onClick={() => navigate(isES ? "/es/fabrica" : "/fabrica")}
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
              onClick={() => navigate(isES ? "/es/fabrica/video" : "/fabrica/video")}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                activePhase === 6
                  ? "bg-white/[0.06] text-white border border-white/10 shadow-sm"
                  : "text-white/60 hover:text-white hover:bg-white/[0.04]"
              }`}
            >
              <div className="flex items-center gap-3">
                <Clapperboard className={`w-4 h-4 ${activePhase === 6 ? "text-amber-400" : "text-white/40"}`} />
                <span>Gerador de vídeo</span>
              </div>
              <span className="rounded-full bg-amber-400 px-1.5 py-0.5 text-[9px] font-black text-black">NOVO</span>
            </button>
            <button
              onClick={() => navigate(isES ? "/es/fabrica/anuncio" : "/fabrica/anuncio")}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                activePhase === 1
                  ? "bg-white/[0.06] text-white border border-white/10 shadow-sm"
                  : "text-white/60 hover:text-white hover:bg-white/[0.04]"
              }`}
            >
              <div className="flex items-center gap-3">
                <ImageIcon className={`w-4 h-4 ${activePhase === 1 ? "text-amber-400" : "text-white/40"}`} />
                <span>Anúncio</span>
              </div>
            </button>
          </div>

          {/* FERRAMENTAS */}
          <div>
            <div className="text-[9px] font-extrabold text-white/30 tracking-widest uppercase px-3 mb-2">
              FERRAMENTAS
            </div>
            <div className="space-y-1">
              {/* F2: Carrossel */}
              <button
                onClick={() => { setMobileMenuOpen(false); navigate(isES ? "/es/fabrica/carrossel" : "/fabrica/carrossel"); }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  activePhase === 2
                    ? "bg-white/[0.06] text-white border border-white/10 shadow-sm"
                    : "text-white/60 hover:text-white hover:bg-white/[0.04]"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Layout className={`w-4 h-4 ${activePhase === 2 ? "text-amber-400" : "text-white/40"}`} />
                  <span>Carrossel</span>
                </div>
              </button>

              {/* F3: Site */}
              <button
                onClick={() => { setMobileMenuOpen(false); navigate(isES ? "/es/fabrica/site" : "/fabrica/site"); }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  activePhase === 3
                    ? "bg-white/[0.06] text-white border border-white/10 shadow-sm"
                    : "text-white/60 hover:text-white hover:bg-white/[0.04]"
                }`}
              >
                <div className="flex items-center gap-3">
                  <FileText className={`w-4 h-4 ${activePhase === 3 ? "text-amber-400" : "text-white/40"}`} />
                  <span>Site</span>
                </div>
              </button>

              {/* F4: CRM */}
              <button
                onClick={() => { setMobileMenuOpen(false); navigate(isES ? "/es/fabrica/crm" : "/fabrica/crm"); }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  activePhase === 4
                    ? "bg-white/[0.06] text-white border border-white/10 shadow-sm"
                    : "text-white/60 hover:text-white hover:bg-white/[0.04]"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Users className={`w-4 h-4 ${activePhase === 4 ? "text-amber-400" : "text-white/40"}`} />
                  <span>CRM</span>
                </div>
              </button>

              {/* F5: Planos */}
              <button
                onClick={() => { setMobileMenuOpen(false); navigate(isES ? "/es/fabrica/planos" : "/fabrica/planos"); }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  activePhase === 5
                    ? "bg-white/[0.06] text-white border border-white/10 shadow-sm"
                    : "text-white/60 hover:text-white hover:bg-white/[0.04]"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Sliders className={`w-4 h-4 ${activePhase === 5 ? "text-amber-400" : "text-white/40"}`} />
                  <span>Meus Pacotes</span>
                </div>
              </button>
              <button
                onClick={() => { setMobileMenuOpen(false); navigate(isES ? "/es/fabrica/biblioteca" : "/fabrica/biblioteca"); }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  activePhase === 7
                    ? "bg-white/[0.06] text-white border border-white/10 shadow-sm"
                    : "text-white/60 hover:text-white hover:bg-white/[0.04]"
                }`}
              >
                <div className="flex items-center gap-3">
                  <FolderHeart className={`w-4 h-4 ${activePhase === 7 ? "text-amber-400" : "text-white/40"}`} />
                  <span>Meus conteúdos</span>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="p-4 border-t border-white/5 space-y-3">
          <button
            onClick={() => setTemaClaro((v) => !v)}
            className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold text-white/70 hover:text-white hover:bg-white/[0.04] transition-all"
            aria-label={temaClaro ? "Mudar para tema escuro" : "Mudar para tema claro"}
          >
            <span className="flex items-center gap-3">
              {temaClaro ? <Moon className="w-4 h-4 text-white/40" /> : <Sun className="w-4 h-4 text-amber-400" />}
              <span>{temaClaro ? "Tema escuro" : "Tema claro"}</span>
            </span>
            <span className={`relative h-5 w-9 rounded-full transition-colors ${temaClaro ? "bg-amber-400" : "bg-white/15"}`}>
              <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-all ${temaClaro ? "left-[18px]" : "left-0.5"}`} />
            </span>
          </button>
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
          </div>
          <button
            onClick={() => setTemaClaro((v) => !v)}
            className="grid h-10 w-10 place-items-center rounded-lg bg-white/[0.04] border border-white/15 active:scale-95 transition-transform"
            aria-label={temaClaro ? "Mudar para tema escuro" : "Mudar para tema claro"}
            title={temaClaro ? "Tema escuro" : "Tema claro"}
          >
            {temaClaro ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5 text-amber-400" />}
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="grid h-10 w-10 place-items-center rounded-lg bg-white/[0.04] border border-white/15 active:scale-95 transition-transform"
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
          className="md:hidden fixed inset-0 bg-black/80 backdrop-blur-sm z-40 animate-fadeIn"
        />
      )}

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed top-16 left-0 right-0 bg-[#0F0F11] border-b border-white/15 z-[60] p-4 space-y-2 flex flex-col max-h-[85vh] overflow-y-auto shadow-2xl animate-slideDown">
          <button
            onClick={() => { setMobileMenuOpen(false); navigate(isES ? "/es/fabrica" : "/fabrica"); }}
            className={`w-full py-3 px-4 rounded-xl text-left text-sm font-semibold flex items-center gap-2 ${
              activeTab === "dashboard" ? "bg-white/[0.06] text-amber-400" : "text-white/70"
            }`}
          >
            <span>📊</span> Painel Inicial
          </button>
          
          <div className="text-[9px] font-extrabold text-white/30 tracking-widest uppercase px-4 pt-2">Geração</div>
          <button onClick={() => { setMobileMenuOpen(false); navigate(isES ? "/es/fabrica/video" : "/fabrica/video"); }} className="p-4 bg-white/[0.02] rounded-xl flex items-center gap-3 text-white/70 hover:text-white hover:bg-white/[0.05]">
            <Clapperboard className="w-4 h-4 text-amber-400" /><span>Gerador de vídeo</span><span className="ml-auto rounded-full bg-amber-400 px-1.5 py-0.5 text-[9px] font-black text-black">NOVO</span>
          </button>
          <button onClick={() => { setMobileMenuOpen(false); navigate(isES ? "/es/fabrica/anuncio" : "/fabrica/anuncio"); }} className="p-4 bg-white/[0.02] rounded-xl flex items-center gap-3 text-white/70 hover:text-white hover:bg-white/[0.05]">
            <span>✨</span> Anúncio
          </button>
          
          <div className="text-[10px] font-bold text-white/30 tracking-widest uppercase mt-4 mb-2">FERRAMENTAS</div>
          
          <button onClick={() => { setMobileMenuOpen(false); navigate(isES ? "/es/fabrica/carrossel" : "/fabrica/carrossel"); }} className="p-4 bg-white/[0.02] rounded-xl flex items-center gap-3 text-white/70 hover:text-white hover:bg-white/[0.05]">
            <span>🖼️</span> Carrossel
          </button>
          <button onClick={() => { setMobileMenuOpen(false); navigate(isES ? "/es/fabrica/site" : "/fabrica/site"); }} className="p-4 bg-white/[0.02] rounded-xl flex items-center gap-3 text-white/70 hover:text-white hover:bg-white/[0.05]">
            <span>📄</span> Site
          </button>
          <button onClick={() => { setMobileMenuOpen(false); navigate(isES ? "/es/fabrica/crm" : "/fabrica/crm"); }} className="p-4 bg-white/[0.02] rounded-xl flex items-center gap-3 text-white/70 hover:text-white hover:bg-white/[0.05]">
            <span>👥</span> CRM
          </button>
          <button onClick={() => { setMobileMenuOpen(false); navigate(isES ? "/es/fabrica/biblioteca" : "/fabrica/biblioteca"); }} className="p-4 bg-white/[0.02] rounded-xl flex items-center gap-3 text-white/70 hover:text-white hover:bg-white/[0.05]">
            <FolderHeart className="w-4 h-4 text-white/40" /><span>Meus conteúdos</span>
          </button>
          <button onClick={() => { setMobileMenuOpen(false); navigate(isES ? "/es/fabrica/planos" : "/fabrica/planos"); }} className="p-4 bg-white/[0.02] rounded-xl flex items-center gap-3 text-white/70 hover:text-white hover:bg-white/[0.05]">
            <span>🧳</span> Meus Pacotes
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
      <main className="flex-1 min-w-0 pt-20 md:pt-8 px-4 md:px-8 pb-32 md:pb-12 bg-[#0A0A0B]">
        {/* Top Bar with Voice AI and Phase Shortcuts */}
        <div className="mb-4 sm:mb-6 p-2.5 sm:p-3 rounded-2xl bg-black border border-white/10 flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 relative z-30">
            <div className="w-full sm:w-auto flex justify-center sm:justify-start shrink-0 min-w-0">
              <VoiceOnboarding onSaved={isES ? undefined : () => navigate("/fabrica/anuncio?gerar=1")} />
            </div>

            {/* No computador o menu lateral já mostra tudo: os atalhos ficam só no celular, em duas fileiras (nada escondido). */}
            <div className="grid w-full grid-cols-4 gap-1.5 md:hidden">
              <button
                onClick={() => navigate(isES ? "/es/fabrica" : "/fabrica")}
                ref={activeTab === "dashboard" ? activePillRef : undefined}
                className={`min-h-10 px-1 rounded-lg text-[12px] font-bold border transition-colors whitespace-nowrap ${
                  activeTab === "dashboard" ? "border-amber-400 bg-amber-400/10 text-amber-400" : "border-white/10 text-white/60 hover:text-white hover:bg-white/5"
                }`}
              >
                Painel
              </button>

              {([
                { name: 'Vídeo', path: '/video', phase: 6 },
                { name: 'Anúncio', path: '/anuncio', phase: 1 },
                { name: 'Carrossel', path: '/carrossel', phase: 2 },
                { name: 'Site', path: '/site', phase: 3 },
                { name: 'CRM', path: '/crm', phase: 4 },
                { name: 'Pacotes', path: '/planos', phase: 5 },
                { name: 'Conteúdos', path: '/biblioteca', phase: 7 },
              ] as const).map(({ name, path, phase }) => (
                <button
                  key={phase}
                  onClick={() => navigate(isES ? `/es/fabrica${path}` : `/fabrica${path}`)}
                  ref={activeTab === "phase" && activePhase === phase ? activePillRef : undefined}
                  className={`min-h-10 px-1 rounded-lg text-[12px] font-bold border transition-colors whitespace-nowrap ${
                    activePhase === phase ? "border-amber-400 bg-amber-400/10 text-amber-400" : "border-white/10 text-white/60 hover:text-white hover:bg-white/5"
                  }`}
                >
                  {name}
                </button>
              ))}
            </div>
          </div>

        {/* Dynamic Component Render */}
        <div className="transition-all duration-300">
          {(() => {
            const guideByPhase: Record<number, FabricaGuideKey> = { 1: "anuncio", 2: "carrossel", 3: "site", 4: "crm", 5: "pacotes", 6: "video", 7: "biblioteca" };
            const guideKey = activeTab === "phase" ? guideByPhase[activePhase] : undefined; // no Painel, a jornada faz esse papel
            return guideKey ? (
              <>
                <JornadaGuia variante="faixa" />
                <FabricaStepGuide key={guideKey} section={guideKey} />
              </>
            ) : null;
          })()}
          {activeTab === "dashboard" && (
            <FabricaDashboard
              onNavigate={(_tab, phase) => {
                if (!phase) { navigate(isES ? "/es/fabrica" : "/fabrica"); return; }
                const paths = ["", "/anuncio", "/carrossel", "/site", "/crm", "/planos"] as const;
                navigate(isES ? `/es/fabrica${paths[phase]}` : `/fabrica${paths[phase]}`);
              }}
            />
          )}
          {activeTab === "phase" && (
            <>
              {activePhase === 6 && <VideoLabTela embutido />}
              {activePhase === 7 && <MinhaBiblioteca />}
              {activePhase === 1 && <Phase3ArtFactory key="phase1-ad" onNext={() => navigate(isES ? "/es/fabrica/carrossel" : "/fabrica/carrossel")} onBack={() => navigate(isES ? "/es/fabrica" : "/fabrica")} lockMode={true} initialMode="ad" onSkipToSite={() => navigate(isES ? "/es/fabrica/site" : "/fabrica/site")} />}
              {activePhase === 2 && <Phase3ArtFactory key="phase2-carousel" onNext={() => navigate(isES ? "/es/fabrica/site" : "/fabrica/site")} onBack={() => navigate(isES ? "/es/fabrica/anuncio" : "/fabrica/anuncio")} lockMode={true} initialMode="carousel" />}
              {activePhase === 3 && <Phase4LandingBuilder onNext={() => navigate(isES ? "/es/fabrica/crm" : "/fabrica/crm")} onBack={() => navigate(isES ? "/es/fabrica/carrossel" : "/fabrica/carrossel")} />}
              {activePhase === 4 && (
                can("crm.real_data")
                  ? <Phase5Dashboard onNext={() => navigate(isES ? "/es/fabrica/planos" : "/fabrica/planos")} onBack={() => navigate(isES ? "/es/fabrica/site" : "/fabrica/site")} />
                  : <FabricaLockedFeature
                      feature="crm"
                      title="Transforme os acessos do site em vendas"
                      description="Conheça o CRM antes de assinar. Os dados reais, leads e métricas de cada projeto continuam preservados e separados; a operação é liberada no Plano Elite."
                      previewItems={[
                        "Leads separados por projeto e por conta",
                        "Visitas, cliques no WhatsApp e conversão",
                        "Funil comercial e histórico de atendimento",
                      ]}
                    />
              )}
              {activePhase === 5 && (
                <div className="space-y-8 pb-12">
                  <Phase2Ativos onNext={() => {}} onBack={() => navigate(isES ? "/es/fabrica/crm" : "/fabrica/crm")} />
                  <Phase1Diagnostico onComplete={() => {}} onBack={() => {}} />
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
};

import { FabricaUpgradeBlock } from "@/components/fabrica/FabricaUpgradeBlock";

const FabricaContent = () => {
  const { loading: authLoading } = useAuth();
  const { can } = useEntitlements();
  const localPreview = isLocalPreviewEnabled();

  // Spinner SÓ no primeiro carregamento real (sem user e sem acesso já concedido).
  // Reverificações silenciosas em background NÃO devem mais derrubar pra esta tela.
  if (!localPreview && authLoading) {
    return (
      <div className="min-h-screen bg-[#0A0A0B] flex flex-col items-center justify-center text-white">
        <Loader2 className="w-8 h-8 animate-spin text-amber-500 mb-2" />
        <span className="text-sm text-white/60">Verificando permissões de acesso...</span>
      </div>
    );
  }

  if (!localPreview && !can("fabrica.open")) {
    return (
      <>
        <SeoMetadata title="Upgrade Necessário | Canva Viagem" description="Faça upgrade para acessar a Fábrica de Anúncios." />
        <div className="flex w-full h-full min-h-screen">
          <FabricaUpgradeBlock />
        </div>
      </>
    );
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
