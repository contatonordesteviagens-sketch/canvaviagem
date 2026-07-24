import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { useFabricaContext } from "@/hooks/useFabricaContext";
import { useAuth } from "@/contexts/AuthContext";
import { buildLandingHTML } from "@/lib/fabrica-html-export-es";
import { publishFabricaSite } from "@/lib/fabrica-site-publisher";
import { getCanvaSiteUrl, validateCanvaSiteSlug } from "@/lib/canva-site-domain";
import { resolveFabricaSiteSlug } from "@/lib/fabrica-site-publication";
import {
  getFabricaConversionRate,
  loadFabricaCrmMetrics,
  persistFabricaLeadStatus,
  type FabricaCrmLead,
  type FabricaMetricSummary,
} from "@/lib/fabrica-crm-metrics";
import { Loader2, Eye, X as CloseIcon } from "lucide-react";
import { 
  TrendingUp, 
  Users, 
  Target, 
  Activity, 
  Calendar, 
  Sparkles, 
  ArrowRight, 
  ExternalLink, 
  CheckCircle2, 
  Newspaper,
  BarChart3,
  MousePointerClick,
  MessageSquare,
  Clock,
  History,
  Filter,
  Maximize2,
  ChevronDown
} from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

const EMPTY_METRICS: FabricaMetricSummary = { visits: 0, clicks: 0, leads: 0, avgTime: 0 };

export const Phase5DashboardES = () => {
  const { state, setPhase, update } = useFabricaContext();
  const { user } = useAuth();
  const [showUrlHelp, setShowUrlHelp] = useState(false);
  const [showLivePreview, setShowLivePreview] = useState(false);
  const [previewBlobUrl, setPreviewBlobUrl] = useState<string | null>(null);
  const [previewMode, setPreviewMode] = useState<"desktop" | "mobile">("desktop");

  // Shortcut Shift+Ctrl+P to toggle Mobile Mode in Live Preview
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && (e.key === 'P' || e.key === 'p')) {
        e.preventDefault();
        setPreviewMode(prev => {
          const next = prev === 'desktop' ? 'mobile' : 'desktop';
          toast.success(next === 'mobile' ? "¡Modo Celular (iPhone) Activado! 📱" : "¡Modo Computadora Activado! 💻");
          return next;
        });
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const [isPublishing, setIsPublishing] = useState(false);
  
  const handleDashboardPublish = async () => {
    if (!user?.id) {
      toast.error("Inicie sesión para publicar.");
      return;
    }
    const slug = resolveFabricaSiteSlug(state.siteContent?.canvaViagemUrl, state.agencyName || "");
    const slugError = validateCanvaSiteSlug(slug);
    if (slugError) {
      const messages = {
        too_short: "Indica un nombre de agencia con al menos 3 caracteres para crear la dirección.",
        too_long: "La dirección del sitio debe tener como máximo 63 caracteres.",
        invalid: "Usa solamente letras, números y guiones en la dirección.",
        reserved: "Esta dirección está reservada. Elige otro nombre para la agencia.",
      } as const;
      toast.error(messages[slugError]);
      return;
    }
    
    setIsPublishing(true);
    const loadingToast = toast.loading("Publicando y activando su sitio...");
    
    try {
      const result = await publishFabricaSite({
        state,
        userId: user.id,
        slug,
        locale: "es",
      });
      update({
        projectId: result.projectId,
        crmForm: result.state.crmForm,
        logoBase64: result.state.logoBase64,
        selectedPackages: result.state.selectedPackages,
        siteContent: result.state.siteContent,
      });

      
      toast.dismiss(loadingToast);
      toast.success("🚀 ¡SITIO PUBLICADO Y ACTIVO CON ÉXITO!");
      
      if (typeof window !== "undefined" && (window as any).confetti) {
         (window as any).confetti();
      }
      
    } catch (err: any) {
      console.error("Publish error:", err);
      toast.dismiss(loadingToast);
      const raw = String(err?.message || "");
      if (raw.includes("another_owner") || raw.includes("site_slug_unavailable")) {
        toast.error("Esta dirección ya pertenece a otra cuenta. Elige otro subdominio.");
      } else if (raw.includes("another_project") || raw.includes("site_slug_belongs_to_another_project")) {
        toast.error("Esta dirección ya está vinculada a otro proyecto tuyo. Elige otro subdominio.");
      } else if (/network|fetch/i.test(raw)) {
        toast.error("Sin conexión con internet. Revisa tu red e inténtalo de nuevo.");
      } else if (raw.includes("site_publish_schema_sync_pending")) {
        toast.error("La publicación se está actualizando. Espera unos segundos e inténtalo de nuevo; tu sitio anterior sigue activo.");
      } else {
        toast.error("No fue posible publicar el sitio ahora. Inténtalo de nuevo en unos instantes.");
      }
    } finally {
      setIsPublishing(false);
    }
  };

  const [siteExists, setSiteExists] = useState<boolean | null>(null);
  
  useEffect(() => {
    const checkStatus = async () => {
      if (!user?.id) return;
      try {
        const slug = resolveFabricaSiteSlug(state.siteContent?.canvaViagemUrl, state.agencyName || "");
        if (!slug) return;
        const siteUrl = getCanvaSiteUrl(slug);
        const res = await fetch(siteUrl, { method: 'HEAD', cache: 'no-cache' });
        setSiteExists(res.ok);
      } catch {
        setSiteExists(false);
      }
    };
    checkStatus();
  }, [user?.id, isPublishing, state.agencyName, state.siteContent?.canvaViagemUrl]);



  // Gera a prévia ao vivo instantaneamente sem depender de DNS ou servidores
  useEffect(() => {
    if (showLivePreview) {
      const html = buildLandingHTML(state, user?.id);
      const blob = new Blob([html], { type: "text/html" });
      const url = URL.createObjectURL(blob);
      setPreviewBlobUrl(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setPreviewBlobUrl(null);
    }
  }, [showLivePreview, state, user]);
  
  const [stats, setStats] = useState<FabricaMetricSummary>(EMPTY_METRICS);
  const [accountHistoryStats, setAccountHistoryStats] = useState<FabricaMetricSummary>(EMPTY_METRICS);
  const [leadsList, setLeadsList] = useState<any[]>([]);
  const [accountHistoryLeads, setAccountHistoryLeads] = useState<any[]>([]);
  const [leadView, setLeadView] = useState<"project" | "account-history">("project");
  const [loading, setLoading] = useState(true);
  const [metricsAvailable, setMetricsAvailable] = useState(false);
  const [fetchError, setFetchError] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const loadedMetricsScopeRef = useRef<string | null>(null);
  const statusSaveInFlightRef = useRef(new Set<string>());
  const activeCrmScopeRef = useRef("");
  activeCrmScopeRef.current = `${user?.id || ""}:${state.projectId || ""}`;

  // Filtros
  const [filterRoteiro, setFilterRoteiro] = useState("Todos");
  const [filterData, setFilterData] = useState("Todas");
  const [filterFase, setFilterFase] = useState("Todas");

  // Modal
  const [selectedLead, setSelectedLead] = useState<any | null>(null);

  const activeLeadList = leadView === "project" ? leadsList : accountHistoryLeads;

  const getRoteirosUnicos = () => {
    const roteiros = activeLeadList.map(l => l.destino_interesse || "Navegación General");
    return ["Todos", ...Array.from(new Set(roteiros))];
  };

  const hasActiveFilters = filterRoteiro !== "Todos" || filterData !== "Todas" || filterFase !== "Todas";

  const clearFilters = () => {
    setFilterRoteiro("Todos");
    setFilterData("Todas");
    setFilterFase("Todas");
  };

  const changeLeadView = (view: "project" | "account-history") => {
    setLeadView(view);
    clearFilters();
  };

  // Cerrar modal con Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelectedLead(null);
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleStatusChange = async (leadId: string, newStatus: string) => {
    if (!user?.id || statusSaveInFlightRef.current.has(leadId)) return;
    const lead = activeLeadList.find((item) => item.id === leadId) as FabricaCrmLead | undefined;
    if (!lead) return;

    const previousStatus = lead.status;
    const optimisticLead = { ...lead, status: newStatus };
    const operationScope = activeCrmScopeRef.current;
    statusSaveInFlightRef.current.add(leadId);
    setLeadsList(prev => prev.map(item => item.id === leadId ? optimisticLead : item));
    setAccountHistoryLeads(prev => prev.map(item => item.id === leadId ? optimisticLead : item));
    setSelectedLead(prev => prev?.id === leadId ? optimisticLead : prev);

    try {
      await persistFabricaLeadStatus({ lead, ownerId: user.id, status: newStatus });
      if (activeCrmScopeRef.current !== operationScope) return;
      if (lead.storage_source === "analytics") {
        setLeadsList(prev => prev.map(item => item.id === leadId ? { ...item, storage_source: "crm" } : item));
        setAccountHistoryLeads(prev => prev.map(item => item.id === leadId ? { ...item, storage_source: "crm" } : item));
      }
      toast.success("¡Fase actualizada y guardada!");
    } catch (error) {
      if (activeCrmScopeRef.current !== operationScope) return;
      const restoredLead = { ...lead, status: previousStatus };
      setLeadsList(prev => prev.map(item => item.id === leadId ? restoredLead : item));
      setAccountHistoryLeads(prev => prev.map(item => item.id === leadId ? restoredLead : item));
      setSelectedLead(prev => prev?.id === leadId ? restoredLead : prev);
      console.warn("No se pudo guardar la fase del lead:", error);
      toast.error("No se pudo guardar la nueva fase. Se restauró el valor anterior.");
    } finally {
      statusSaveInFlightRef.current.delete(leadId);
    }
  };

  useEffect(() => {
    let cancelled = false;
    const fetchRealMetrics = async () => {
      if (!user?.id) return;
      try {
        const result = await loadFabricaCrmMetrics({
          ownerId: user.id,
          projectId: state.projectId,
          crmFormId: state.crmForm?.id,
          siteSlug: resolveFabricaSiteSlug(
            state.siteContent?.canvaViagemUrl,
            state.agencyName || "",
          ),
          locale: "es",
        });

        if (cancelled) return;
        setStats(result.project);
        setAccountHistoryStats(result.accountHistory);
        setLeadsList(result.projectLeads);
        setAccountHistoryLeads(result.accountHistoryLeads);
        setMetricsAvailable(!result.metricsFailed);
        setFetchError(false);
      } catch (e) {
        if (cancelled) return;
        console.warn("Fallo al cargar métricas reales:", e);
        setMetricsAvailable(false);
        setFetchError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    if (!user?.id) return;
    const scopeKey = `${user.id}:${state.projectId || ""}`;
    if (loadedMetricsScopeRef.current !== scopeKey) {
      loadedMetricsScopeRef.current = scopeKey;
      setStats(EMPTY_METRICS);
      setAccountHistoryStats(EMPTY_METRICS);
      setLeadsList([]);
      setAccountHistoryLeads([]);
      setSelectedLead(null);
      setFilterRoteiro("Todos");
      setFilterData("Todas");
      setFilterFase("Todas");
    }
    setLeadView("project");
    setLoading(true);
    setMetricsAvailable(false);
    setFetchError(false);
    void fetchRealMetrics();
    return () => {
      cancelled = true;
    };
  }, [
    state.projectId,
    state.crmForm?.id,
    state.siteContent?.canvaViagemUrl,
    state.agencyName,
    user?.id,
    reloadKey,
  ]);

  const currentDay = format(new Date(), "EEEE, d 'de' MMMM", { locale: es });
  const formatString = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

  // Lançamentos da semana (Ponto 10) - Destaques que mudam dinamicamente
  const NOVIDADES = [
    {
      tag: "LANZAMIENTO",
      title: "Nuevos Templates de Cancún",
      desc: "12 nuevas artes enfocadas en la temporada de invierno 2024 acaban de entrar en la Fábrica.",
      date: "Hoy",
      color: "amber"
    },
    {
      tag: "ACTUALIZACIÓN",
      title: "Mecanismo Lote A/B Premium",
      desc: "Ahora puedes generar 3 versiones de tus diseños a la vez gastando solo 1 crédito.",
      date: "Ayer",
      color: "indigo"
    }
  ];

  const UI_ACCENT = "#F5F906";

  // CÁLCULO DE GAMIFICAÇÃO GLOBAL DA CONTA
  const getAppProgress = () => {
    let points = 0;
    let count = 0;
    if (state.logoBase64) { points += 25; count++; }
    if (state.agencyName) { points += 25; count++; }
    if (state.diagnosticoCompleto) { points += 25; count++; }
    if (state.selectedPackages.length > 0) { points += 25; count++; }
    
    let badge = { n: "Novato", e: "🐣", c: "text-gray-400" };
    if (points === 100) badge = { n: "Agência Pró", e: "🏆", c: "text-amber-400" };
    else if (points >= 50) badge = { n: "En Despegue", e: "🚀", c: "text-blue-400" };
    
    return { points, badge, count };
  };
  const progress = getAppProgress();

  const filteredLeads = activeLeadList.filter((l) => {
    if (filterRoteiro !== "Todos") {
      const destino = l.destino_interesse || "Navegación General";
      if (destino !== filterRoteiro) return false;
    }
    if (filterFase !== "Todas" && (l.status || 'novo') !== filterFase) return false;
    if (filterData !== "Todas") {
      const leadDate = new Date(l.created_at);
      const now = new Date();
      const diffTime = Math.abs(now.getTime() - leadDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      if (filterData === "Hoje" && diffDays > 1) return false;
      if (filterData === "7 dias" && diffDays > 7) return false;
      if (filterData === "30 dias" && diffDays > 30) return false;
    }
    return true;
  });
  const conversionRate = metricsAvailable ? getFabricaConversionRate(stats) : null;
  const hasAccountHistory = accountHistoryStats.visits > 0
    || accountHistoryStats.clicks > 0
    || accountHistoryLeads.length > 0;

  const getFaseColor = (status: string) => {
    switch (status) {
      case 'contato': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'proposta': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'venda': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'perda': return 'bg-zinc-500/20 text-zinc-400 border-zinc-500/30';
      default: return 'bg-amber-500/20 text-amber-400 border-amber-500/30'; // novo
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Boas Vindas Super Premium */}
      <div className="relative p-6 rounded-3xl overflow-hidden border border-white/10 group bg-black/20">
        <div 
          className="absolute top-0 right-0 w-64 h-64 blur-[100px] rounded-full opacity-20 -mr-10 -mt-10 transition-all group-hover:opacity-30"
          style={{ background: UI_ACCENT }}
        />
        <div className="relative z-10 flex flex-col sm:flex-row gap-5 items-center">
          {state.logoBase64 && (
            <div className="w-16 h-16 rounded-2xl bg-white/10 p-2 border border-white/20 flex items-center justify-center flex-shrink-0 shadow-2xl">
              <img src={state.logoBase64} className="w-full h-full object-contain" alt="Logo" />
            </div>
          )}
          <div className="text-center sm:text-left flex-1">
            <div className="text-xs font-bold text-white/40 uppercase tracking-widest mb-1">{formatString(currentDay)}</div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight mb-2">
              ¡Hola, {state.agencyName || "Agência"}! 👋
            </h2>
            <p className="text-sm text-white/60 max-w-md leading-relaxed">
              Diagnóstico: <span className="font-bold text-emerald-400">Nível {state.level || 1}</span> • {state.selectedPackages.length} Paquetes Activos en el Sitio.
            </p>
          </div>
          <button 
            onClick={() => setPhase(3)}
            className="text-[10px] font-bold bg-white/5 hover:bg-white/10 border border-white/10 px-3 py-2 rounded-full text-white/60 transition-all hover:text-white"
          >
            ✏️ Editar Datos
          </button>
        </div>
      </div>

      {/* BARRA DE GAMIFICAÇÃO GLOBAL */}
      <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-4 flex items-center justify-between gap-4 group hover:border-white/20 transition-all shadow-lg">
        <div className="flex items-center gap-3 flex-1">
           <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-xl group-hover:scale-110 transition-transform">
             {progress.badge.e}
           </div>
           <div className="flex-1">
             <div className="flex items-center justify-between mb-1.5">
               <span className={`text-xs font-extrabold uppercase tracking-wider ${progress.badge.c}`}>{progress.badge.n}</span>
               <span className="text-[10px] font-bold text-white/40">{progress.points}% Completado</span>
             </div>
             <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
               <div className="h-full bg-gradient-to-r from-blue-500 to-violet-500 rounded-full transition-all duration-1000" style={{ width: `${progress.points}%` }} />
             </div>
           </div>
        </div>
        <div className="text-right hidden sm:block pl-4 border-l border-white/10">
           <div className="text-[10px] font-bold text-white/40 uppercase">Pasos Activos</div>
           <div className="text-sm font-black text-white">{progress.count}/4</div>
        </div>
      </div>

      {/* MÓDULO F5: OS DADOS VITAIS (MUITO VISUAL!) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card Visitas */}
        <div className="bg-white/[0.02] border border-white/[0.05] shadow-2xl backdrop-blur-3xl rounded-2xl p-6 hover:bg-white/[0.05] hover:border-white/10 transition-all duration-300 group">
          <div className="flex items-start justify-between mb-4">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400">
              <Users className="w-5 h-5" />
            </div>
            <div className="text-[10px] font-bold px-2 py-0.5 bg-emerald-500/20 text-emerald-300 rounded-full border border-emerald-500/20 flex items-center gap-0.5">
              EN VIVO
            </div>
          </div>
          <div className="text-3xl font-black text-white mb-0.5">
            {loading
              ? <Loader2 className="w-6 h-6 animate-spin text-white/40" />
              : metricsAvailable ? stats.visits : "—"}
          </div>
          <div className="text-xs font-bold text-white/40 uppercase tracking-wider">Visitas Únicas</div>
          <div className="mt-3 flex items-center gap-2 text-[10px] font-medium text-white/50 bg-white/5 px-2 py-1.5 rounded-lg w-max">
            <Clock className="w-3.5 h-3.5 text-white/40" /> Tiempo Promedio: <strong className="text-white">{metricsAvailable && stats.avgTime > 0 ? `${stats.avgTime}s` : '--'}</strong>
          </div>
        </div>

        {/* Card Cliques */}
        <div className="bg-white/[0.02] border border-white/[0.05] shadow-2xl backdrop-blur-3xl rounded-2xl p-6 hover:bg-white/[0.05] hover:border-white/10 transition-all duration-300 group">
          <div className="flex items-start justify-between mb-4">
            <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400">
              <MousePointerClick className="w-5 h-5" />
            </div>
            <div className="text-[10px] font-bold px-2 py-0.5 bg-blue-500/20 text-blue-300 rounded-full border border-blue-500/20 flex items-center gap-0.5">
              INTERACCIÓN
            </div>
          </div>
          <div className="text-3xl font-black text-white mb-0.5">
            {loading
              ? <Loader2 className="w-6 h-6 animate-spin text-white/40" />
              : metricsAvailable ? stats.clicks : "—"}
          </div>
          <div className="text-xs font-bold text-white/40 uppercase tracking-wider">Clics WhatsApp</div>
          <div className="mt-3 w-full bg-white/5 h-1 rounded-full overflow-hidden">
            <div className="h-full bg-blue-500 rounded-full w-[40%] animate-in slide-in-from-left duration-1000 delay-100" />
          </div>
        </div>

        {/* Card Leads */}
        <div className="bg-white/[0.02] border border-white/[0.05] shadow-2xl backdrop-blur-3xl rounded-2xl p-6 hover:bg-white/[0.05] hover:border-white/10 transition-all duration-300 group">
          <div className="flex items-start justify-between mb-4">
            <div className="p-2.5 rounded-xl bg-violet-500/10 text-violet-400">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div className="text-[10px] font-bold px-2 py-0.5 bg-violet-500/20 text-violet-300 rounded-full border border-violet-500/20">
              {stats.leads > 0 ? "RECIBIDOS" : "ESPERANDO"}
            </div>
          </div>
          <div className="text-3xl font-black text-white mb-0.5">
            {loading ? <Loader2 className="w-6 h-6 animate-spin text-white/40" /> : stats.leads}
          </div>
          <div className="text-xs font-bold text-white/40 uppercase tracking-wider">Formularios (Leads)</div>
          <div className="mt-3 w-full bg-white/5 h-1 rounded-full overflow-hidden">
            <div className="h-full bg-violet-500 rounded-full w-[25%] animate-in slide-in-from-left duration-1000 delay-200" />
          </div>
        </div>

        {/* Card Conversão */}
        <div className="bg-white/[0.02] border border-white/[0.05] shadow-2xl backdrop-blur-3xl rounded-2xl p-6 hover:bg-white/[0.05] hover:border-white/10 transition-all duration-300 group">
          <div className="flex items-start justify-between mb-4">
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400">
              <Target className="w-5 h-5" />
            </div>
            <div className="text-[10px] font-bold px-2 py-0.5 bg-amber-500/20 text-amber-300 rounded-full border border-amber-500/20 flex items-center gap-0.5">
              RESULTADO
            </div>
          </div>
          <div className="text-3xl font-black text-white mb-0.5">
            {loading
              ? <Loader2 className="w-6 h-6 animate-spin text-white/40" />
              : conversionRate === null ? "—" : `${conversionRate}%`}
          </div>
          <div className="text-xs font-bold text-white/40 uppercase tracking-wider">Tasa de Conversión</div>
          {!loading && conversionRate === null && (
            <div className="mt-2 text-[10px] text-amber-300/60">
              {metricsAvailable ? "Historial de visitas incompleto" : "Métricas no disponibles"}
            </div>
          )}
          <div className="mt-3 w-full bg-white/5 h-1 rounded-full overflow-hidden">
            <div className="h-full bg-amber-500 rounded-full w-[50%] animate-in slide-in-from-left duration-1000 delay-300" />
          </div>
        </div>
      </div>

      {!loading && !metricsAvailable && !fetchError && (
        <div className="flex items-center justify-between gap-4 border-y border-amber-300/20 bg-amber-300/[0.04] px-4 py-3">
          <p className="text-[11px] leading-5 text-amber-100/70">
            Las visitas y los clics no están disponibles temporalmente. Los leads siguen cargados y no fueron modificados.
          </p>
          <button
            type="button"
            onClick={() => setReloadKey((key) => key + 1)}
            className="shrink-0 text-[10px] font-bold text-amber-200 underline hover:text-white"
          >
            Recargar métricas
          </button>
        </div>
      )}

      {hasAccountHistory && (
        <div className="flex flex-col gap-4 border-y border-amber-300/15 bg-amber-300/[0.035] px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-start gap-3">
            <History className="mt-0.5 h-4 w-4 shrink-0 text-amber-300/80" aria-hidden="true" />
            <div>
              <div className="text-xs font-bold text-amber-100">Historial recuperado de la cuenta</div>
              <p className="mt-1 max-w-2xl text-[11px] leading-5 text-white/45">
                Los sitios antiguos no registraban el proyecto de origen. Estos datos siguen guardados,
                pero no alteran las métricas del proyecto abierto.
              </p>
            </div>
          </div>
          <div className="grid shrink-0 grid-cols-3 gap-x-6 text-center sm:text-left">
            <div>
              <div className="text-sm font-black text-white/80">{metricsAvailable ? accountHistoryStats.visits : "—"}</div>
              <div className="text-[9px] uppercase text-white/30">Visitas</div>
            </div>
            <div>
              <div className="text-sm font-black text-white/80">{metricsAvailable ? accountHistoryStats.clicks : "—"}</div>
              <div className="text-[9px] uppercase text-white/30">Clics</div>
            </div>
            <div>
              <div className="text-sm font-black text-white/80">{accountHistoryStats.leads}</div>
              <div className="text-[9px] uppercase text-white/30">Leads</div>
            </div>
          </div>
        </div>
      )}

       {/* 🆕 CENTRO DE LEADS / CRM */}
      <div className="bg-white/[0.03] border border-white/10 rounded-3xl overflow-hidden shadow-xl animate-in fade-in slide-in-from-bottom-6 duration-700 mt-6">
         <div className="p-6 border-b border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-br from-violet-500/5 to-transparent">
            <div className="flex items-center gap-3">
               <div className="p-2.5 rounded-xl bg-violet-500/20 text-violet-400 shadow-inner">
                  <Users className="w-5 h-5" />
               </div>
               <div>
                  <h3 className="font-black text-white text-base tracking-tight flex items-center gap-2">
                     {leadView === "project" ? "Leads del proyecto" : "Historial de la cuenta"}
                     {filteredLeads.length > 0 && (
                       <span className="text-[10px] font-extrabold bg-violet-500/20 text-violet-300 border border-violet-500/30 px-2 py-0.5 rounded-full">
                         {filteredLeads.length} {filteredLeads.length === 1 ? 'lead' : 'leads'}
                         {hasActiveFilters && ` filtrado${filteredLeads.length !== 1 ? 's' : ''}`}
                       </span>
                     )}
                  </h3>
                  <div className="mt-1.5 flex items-center gap-1" role="tablist" aria-label="Origen de los leads">
                    <button
                      type="button"
                      role="tab"
                      aria-selected={leadView === "project"}
                      onClick={() => changeLeadView("project")}
                      className={`border-b-2 px-1.5 py-1 text-[10px] font-bold transition-colors ${
                        leadView === "project"
                          ? "border-[#F5F906] text-white"
                          : "border-transparent text-white/35 hover:text-white/60"
                      }`}
                    >
                      Proyecto actual ({leadsList.length})
                    </button>
                    {accountHistoryLeads.length > 0 && (
                      <button
                        type="button"
                        role="tab"
                        aria-selected={leadView === "account-history"}
                        onClick={() => changeLeadView("account-history")}
                        className={`border-b-2 px-1.5 py-1 text-[10px] font-bold transition-colors ${
                          leadView === "account-history"
                            ? "border-amber-300 text-white"
                            : "border-transparent text-white/35 hover:text-white/60"
                        }`}
                      >
                        Historial sin proyecto ({accountHistoryLeads.length})
                      </button>
                    )}
                  </div>
               </div>
            </div>
            
            {/* Toolbar de Filtros */}
            <div className="flex flex-wrap items-center gap-2">
               <div className="flex items-center gap-2 bg-black/40 border border-white/10 px-3 py-1.5 rounded-xl">
                 <Filter className="w-3.5 h-3.5 text-white/40" />
                 
                 <select 
                   value={filterData}
                   onChange={(e) => setFilterData(e.target.value)}
                   className="bg-transparent text-xs text-white/70 outline-none cursor-pointer border-r border-white/10 pr-2"
                 >
                   <option value="Todas" className="bg-zinc-900 text-white">Cualquier Fecha</option>
                   <option value="Hoje" className="bg-zinc-900 text-white">Hoy</option>
                   <option value="7 dias" className="bg-zinc-900 text-white">Últimos 7 días</option>
                   <option value="30 dias" className="bg-zinc-900 text-white">Últimos 30 días</option>
                 </select>

                 <select 
                   value={filterFase}
                   onChange={(e) => setFilterFase(e.target.value)}
                   className="bg-transparent text-xs text-white/70 outline-none cursor-pointer border-r border-white/10 pr-2 ml-2"
                 >
                   <option value="Todas" className="bg-zinc-900 text-white">Todas las Fases</option>
                   <option value="novo" className="bg-zinc-900 text-white">Nuevo</option>
                   <option value="contato" className="bg-zinc-900 text-white">En Contacto</option>
                   <option value="proposta" className="bg-zinc-900 text-white">Propuesta</option>
                   <option value="venda" className="bg-zinc-900 text-white">Venta</option>
                   <option value="perda" className="bg-zinc-900 text-white">Pérdida</option>
                 </select>

                 <select 
                   value={filterRoteiro}
                   onChange={(e) => setFilterRoteiro(e.target.value)}
                   className="bg-transparent text-xs text-white/70 outline-none cursor-pointer ml-2 max-w-[100px] sm:max-w-[150px]"
                 >
                   {getRoteirosUnicos().map(r => (
                     <option key={r} value={r} className="bg-zinc-900 text-white">{r}</option>
                   ))}
                 </select>
               </div>

               {hasActiveFilters && (
                 <button
                   onClick={clearFilters}
                   className="text-[10px] font-bold text-white/50 hover:text-white bg-white/5 hover:bg-white/10 px-2.5 py-1.5 rounded-lg transition-colors flex items-center gap-1"
                 >
                   <CloseIcon className="w-3 h-3" /> Limpiar
                 </button>
               )}
            </div>
         </div>

         {fetchError && (
           <div className="mx-5 mt-4 flex items-start justify-between gap-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3">
             <div>
               <div className="text-xs font-bold text-red-300">No fue posible cargar los leads ahora</div>
               <p className="mt-0.5 text-[11px] text-red-200/60">
                 Tus datos siguen guardados en el servidor. Revisa la conexión e inténtalo de nuevo.
               </p>
             </div>
             <button
               type="button"
               onClick={() => setReloadKey((key) => key + 1)}
               className="shrink-0 text-[10px] font-bold text-red-300 underline hover:text-white"
             >
               Reintentar
             </button>
           </div>
         )}

         <div className="overflow-x-auto">
            {filteredLeads.length === 0 && !loading && !fetchError ? (
                 <div className="py-16 px-6 text-center flex flex-col items-center justify-center space-y-4">
                    <div className="p-4 rounded-full bg-amber-500/10 text-amber-400/80 mb-2 border border-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.1)]">
                       <MousePointerClick className="w-8 h-8" />
                    </div>
                    <h4 className="text-sm font-bold text-white">Ningún lead encontrado</h4>
                    <p className="text-[11px] text-white/50 max-w-md text-center">
                       {activeLeadList.length === 0
                         ? leadView === "project"
                           ? "Este proyecto todavía no tiene leads atribuidos."
                           : "No hay leads históricos sin proyecto."
                         : "Ningún lead coincide con los filtros seleccionados."}
                    </p>
                 </div>
            ) : filteredLeads.length > 0 ? (
               <table className="w-full text-left text-sm border-collapse">
                  <thead>
                     <tr className="bg-white/[0.02] border-b border-white/5">
                        <th className="px-6 py-5 text-[10px] font-bold text-white/40 uppercase tracking-widest">Fecha/Hora</th>
                        <th className="px-6 py-5 text-[10px] font-bold text-white/40 uppercase tracking-widest">Nombre del Cliente</th>
                        <th className="px-6 py-5 text-[10px] font-bold text-white/40 uppercase tracking-widest">Destino</th>
                        <th className="px-6 py-5 text-[10px] font-bold text-white/40 uppercase tracking-widest">Fase del Lead</th>
                        <th className="px-6 py-5 text-right text-[10px] font-bold text-white/40 uppercase tracking-widest">Acciones</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.02]">
                     {filteredLeads.map((l: any) => {
                        const rawDate = new Date(l.created_at);
                        const cleanPhone = String(l.whatsapp || "").replace(/\D/g, "");
                        const currentStatus = l.status || 'novo';
                        
                        return (
                           <tr key={l.id} className="hover:bg-white/[0.03] transition-colors group">
                              <td className="px-6 py-5 whitespace-nowrap text-xs text-white/50 tracking-wide">
                                 <div>{rawDate.toLocaleDateString('es-ES')} <span className="opacity-50 text-[10px] ml-1">{rawDate.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}</span></div>
                                 {(Date.now() - rawDate.getTime()) < 86400000 && (
                                   <span className="inline-block mt-1 text-[9px] font-black bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full animate-pulse tracking-widest">NUEVO</span>
                                 )}
                              </td>
                              <td className="px-6 py-5">
                                 <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-violet-500/20 to-indigo-600/20 border border-violet-500/30 flex items-center justify-center text-xs font-black text-violet-300 shadow-lg group-hover:scale-110 transition-transform">
                                       {String(l.nome_completo || "L").charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                       <div className="font-bold text-white/90 group-hover:text-violet-300 transition-colors tracking-wide">{l.nome_completo || "No informado"}</div>
                                       <div className="text-[10px] text-white/40 tracking-wide mt-0.5">{l.email || "Sin e-mail"}</div>
                                       {l.legacy_unverified && <div className="mt-1 text-[9px] font-bold uppercase tracking-wide text-amber-300">Histórico no verificado</div>}
                                    </div>
                                 </div>
                              </td>
                              <td className="px-6 py-5">
                                 <span className="inline-flex px-3 py-1 rounded-lg bg-white/[0.03] border border-white/[0.05] text-[10px] font-medium text-white/60 max-w-[180px] truncate shadow-sm tracking-wide">
                                    {l.destino_interesse || "Navegación General"}
                                 </span>
                              </td>
                              <td className="px-6 py-5">
                                 <div className="relative inline-block">
                                    <select
                                       value={currentStatus}
                                       onChange={(e) => handleStatusChange(l.id, e.target.value)}
                                       className={`appearance-none cursor-pointer pl-3 pr-8 py-1 rounded-full text-[10px] font-bold border transition-colors outline-none ${getFaseColor(currentStatus)}`}
                                    >
                                       <option value="novo" className="bg-zinc-900 text-amber-400">🟡 Nuevo</option>
                                       <option value="contato" className="bg-zinc-900 text-blue-400">🔵 En Contacto</option>
                                       <option value="proposta" className="bg-zinc-900 text-purple-400">🟣 Propuesta</option>
                                       <option value="venda" className="bg-zinc-900 text-green-400">🟢 Venta</option>
                                       <option value="perda" className="bg-zinc-900 text-zinc-400">⚪ Pérdida</option>
                                    </select>
                                    <ChevronDown className="absolute right-2.5 top-1.5 w-3 h-3 pointer-events-none opacity-50" />
                                 </div>
                              </td>
                              <td className="px-6 py-4 text-right">
                                 <div className="flex items-center justify-end gap-2">
                                    <button 
                                       onClick={() => setSelectedLead(l)}
                                       className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-colors"
                                       title="Ver Detalles"
                                    >
                                       <Maximize2 className="w-4 h-4" />
                                    </button>
                                    
                                    {cleanPhone ? (() => {
                                        const agencyDDI = (state.whatsappDialCode || "55").replace(/\D/g, "");
                                        const waLink = cleanPhone.startsWith(agencyDDI) ? cleanPhone : `${agencyDDI}${cleanPhone}`;
                                        return (
                                           <a 
                                              href={`https://wa.me/${waLink}?text=${encodeURIComponent(`¡Hola ${l.nome_completo || 'cliente'}! Recibimos tu interés en el destino ${l.destino_interesse || 'General'}. ¿Cómo podemos ayudarte?`)}`} 
                                              target="_blank" 
                                              rel="noreferrer"
                                              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#25D366] hover:bg-[#22c35e] text-white text-[11px] font-black rounded-lg transition-all active:scale-95 shadow-lg shadow-green-900/20"
                                           >
                                              <MessageSquare className="w-3.5 h-3.5" /> Whats
                                           </a>
                                        );
                                     })() : (
                                        <span className="text-[10px] text-white/30 px-2">S/ Whats</span>
                                     )}
                                     
                                     {l.email && (
                                        <a 
                                           href={`mailto:${l.email}?subject=${encodeURIComponent(`Cotización de Viaje - ${state.agencyName || 'Agencia'}`)}&body=${encodeURIComponent(`¡Hola ${l.nome_completo || 'cliente'}!\n\nRecibimos tu interés en el destino ${l.destino_interesse || 'General'}.\n\n¿Cómo podemos ayudarte con la planificación de tu viaje?\n\nSaludos,\n${state.agencyName || 'Agencia'}`)}`} 
                                           className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white text-[11px] font-black rounded-lg transition-all active:scale-95 shadow-lg shadow-blue-900/20"
                                        >
                                           ✉️ Email
                                        </a>
                                     )}
                                 </div>
                              </td>
                           </tr>
                        );
                     })}
                  </tbody>
               </table>
            ) : null}
         </div>
      </div>

      {/* Modal: Maximizar Detalhes do Lead */}
      {selectedLead && (
         <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-[#121214] border border-white/10 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
               <div className="p-5 border-b border-white/10 flex items-center justify-between bg-gradient-to-br from-violet-500/10 to-transparent">
                  <h3 className="font-black text-white flex items-center gap-2">
                     <Users className="w-5 h-5 text-violet-400" />
                     Ficha del Cliente
                  </h3>
                  <button onClick={() => setSelectedLead(null)} className="p-1.5 hover:bg-white/10 rounded-full text-white/50 transition-colors">
                     <CloseIcon className="w-5 h-5" />
                  </button>
               </div>
               
               <div className="p-6 overflow-y-auto space-y-6">
                  <div className="flex items-center gap-4">
                     <div className="w-14 h-14 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-xl font-black text-white shadow-lg">
                        {String(selectedLead.nome_completo || "L").charAt(0).toUpperCase()}
                     </div>
                     <div className="flex-1">
                        <h4 className="text-lg font-bold text-white">{selectedLead.nome_completo || "No informado"}</h4>
                        <div className="flex items-center gap-3 text-xs mt-1 flex-wrap">
                           <span className="text-white/40">{new Date(selectedLead.created_at).toLocaleString('es-ES')}</span>
                        </div>
                     </div>
                  </div>

                  {selectedLead.legacy_unverified && (
                    <div className="rounded-2xl border border-amber-400/20 bg-amber-400/[0.08] p-4 text-xs leading-5 text-amber-100/80">
                      Registro histórico no verificado. No cuenta en el total oficial del CRM y puede no estar atribuido a este proyecto.
                    </div>
                  )}

                  {/* Fase directamente en el modal */}
                  <div className="bg-white/5 border border-white/5 p-4 rounded-2xl">
                     <div className="text-[10px] text-white/40 font-bold uppercase mb-2">Fase del Lead</div>
                     <div className="flex flex-wrap gap-2">
                       {['novo','contato','proposta','venda','perda'].map(fase => {
                         const labels: Record<string, string> = { novo: '🟡 Nuevo', contato: '🔵 En Contacto', proposta: '🟣 Propuesta', venda: '🟢 Venta', perda: '⚪ Pérdida' };
                         const isActive = (selectedLead.status || 'novo') === fase;
                         return (
                           <button
                             key={fase}
                             onClick={() => {
                               handleStatusChange(selectedLead.id, fase);
                               setSelectedLead((prev: any) => ({ ...prev, status: fase }));
                             }}
                             className={`px-3 py-1.5 rounded-full text-[11px] font-bold border transition-all ${
                               isActive ? getFaseColor(fase) + ' scale-105 shadow-lg' : 'bg-white/5 border-white/10 text-white/40 hover:text-white/70'
                             }`}
                           >
                             {labels[fase]}
                           </button>
                         );
                       })}
                     </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                     <div className="bg-white/5 border border-white/5 p-4 rounded-2xl">
                        <div className="text-[10px] text-white/40 font-bold uppercase mb-1">Contacto</div>
                        <div className="text-sm font-medium text-white">{selectedLead.whatsapp || "N/A"}</div>
                        <div className="text-xs text-white/60 mt-0.5 truncate" title={selectedLead.email}>{selectedLead.email || "N/A"}</div>
                     </div>
                     <div className="bg-white/5 border border-white/5 p-4 rounded-2xl">
                        <div className="text-[10px] text-white/40 font-bold uppercase mb-1">Destino</div>
                        <div className="text-sm font-medium text-white">{selectedLead.destino_interesse || "General"}</div>
                        <div className="text-xs text-white/60 mt-0.5">{selectedLead.numero_viajantes} Viajero(s)</div>
                     </div>
                  </div>

                  {(selectedLead.data_ida || selectedLead.data_volta) && (
                     <div className="bg-white/5 border border-white/5 p-4 rounded-2xl flex gap-6">
                        {selectedLead.data_ida && (
                           <div>
                              <div className="text-[10px] text-white/40 font-bold uppercase mb-1">Fecha Ida</div>
                              <div className="text-sm font-medium text-white">{new Date(selectedLead.data_ida).toLocaleDateString('es-ES', {timeZone: 'UTC'})}</div>
                           </div>
                        )}
                        {selectedLead.data_volta && (
                           <div>
                              <div className="text-[10px] text-white/40 font-bold uppercase mb-1">Fecha Regreso</div>
                              <div className="text-sm font-medium text-white">{new Date(selectedLead.data_volta).toLocaleDateString('es-ES', {timeZone: 'UTC'})}</div>
                           </div>
                        )}
                     </div>
                  )}

                  <div className="bg-white/5 border border-white/5 p-4 rounded-2xl">
                     <div className="text-[10px] text-white/40 font-bold uppercase mb-2">Observaciones del Cliente</div>
                     <p className="text-sm text-white/80 leading-relaxed whitespace-pre-wrap">
                        {selectedLead.observacoes || <span className="italic text-white/30">Ninguna observación informada en el formulario.</span>}
                     </p>
                  </div>
               </div>

               <div className="p-5 border-t border-white/10 bg-black/20 flex flex-wrap justify-end gap-3">
                  <button onClick={() => setSelectedLead(null)} className="px-6 py-2.5 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl transition-all">
                     Cerrar
                  </button>
                  
                  {selectedLead.email && (
                     <a 
                        href={`mailto:${selectedLead.email}?subject=${encodeURIComponent(`Cotización de Viaje - ${state.agencyName || 'Agencia'}`)}&body=${encodeURIComponent(`¡Hola ${selectedLead.nome_completo || 'cliente'}!\n\nRecibimos tu interés en el destino ${selectedLead.destino_interesse || 'General'}.\n\n¿Cómo podemos ayudarte con la planificación de tu viaje?\n\nSaludos,\n${state.agencyName || 'Agencia'}`)}`} 
                        className="px-6 py-2.5 bg-blue-500 hover:bg-blue-600 text-white text-sm font-black rounded-xl transition-all flex items-center gap-2 shadow-lg"
                     >
                        ✉️ Enviar Email
                     </a>
                  )}

                  {selectedLead.whatsapp && (() => {
                     const cleanPhoneLead = String(selectedLead.whatsapp).replace(/\D/g, "");
                     const agencyDDI = (state.whatsappDialCode || "55").replace(/\D/g, "");
                     const waLinkLead = cleanPhoneLead.startsWith(agencyDDI) ? cleanPhoneLead : `${agencyDDI}${cleanPhoneLead}`;
                     return (
                        <a 
                           href={`https://wa.me/${waLinkLead}?text=${encodeURIComponent(`¡Hola ${selectedLead.nome_completo || 'cliente'}! Recibimos tu interés en el destino ${selectedLead.destino_interesse || 'General'}. ¿Cómo podemos ayudarte?`)}`} 
                           target="_blank" 
                           rel="noreferrer"
                           className="px-6 py-2.5 bg-[#25D366] hover:bg-[#22c35e] text-white text-sm font-black rounded-xl transition-all flex items-center gap-2 shadow-lg"
                        >
                           <MessageSquare className="w-4 h-4" /> Iniciar WhatsApp
                        </a>
                     );
                  })()}
               </div>
            </div>
         </div>
      )}

      {/* EXPLANATORY MODAL: COMO FUNCIONA O SUBDOMÍNIO */}
      {showUrlHelp && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#121214] border border-white/10 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
             <div className="p-6 border-b border-white/10 bg-gradient-to-br from-amber-500/10 to-transparent">
                <h3 className="text-lg font-black text-white flex items-center gap-2">
                  <ExternalLink className="w-5 h-5 text-amber-400" /> Entendiendo el Subdominio
                </h3>
                <p className="text-xs text-white/50 mt-1">Cómo funciona este recurso de escala.</p>
             </div>
             <div className="p-6 space-y-5">
                <div className="space-y-3 text-sm text-white/70 leading-relaxed">
                   <p>
                     <strong className="text-white">1. ¿Es Automático?</strong><br/>
                     Sí. Cloudflare atiende los subdominios de Canva Viagem mediante una regla DNS/ruta "Wildcard" (*). La aplicación identifica la agencia por la dirección y carga el sitio publicado, sin crear un dominio ni una cuenta de alojamiento para cada agencia.
                   </p>
                   <p>
                     <strong className="text-white">2. ¿Tiene costo o límite de Tokens?</strong><br/>
                     <span className="text-emerald-400 font-bold">NO USA TOKENS DE IA POR VISITA.</span> El sitio publicado utiliza la infraestructura compartida de Canva Viagem y respeta los límites contratados en Cloudflare y Supabase. Crear rutas o paquetes no crea nuevos dominios.
                   </p>
                   <p>
                     <strong className="text-white">3. ¿Dónde están los datos?</strong><br/>
                     ¡Todo en tu Supabase! Cuando el sitio carga, le "pide" a tu base de datos los textos y fotos de la agencia X y monta la pantalla instantáneamente. Sin generar 1.000 cuentas separadas. Todo centralizado en TU cuenta maestra.
                   </p>
                </div>
                <button 
                  onClick={() => setShowUrlHelp(false)}
                  className="w-full py-3 bg-white text-black font-bold rounded-xl hover:bg-zinc-200 transition-colors"
                >
                  Entendido, cerrar
                </button>
             </div>
          </div>
        </div>
      )}

      {/* 🆕 MODAL DE PRÉVIA EN VIVO (SIMULADOR) */}
      {showLivePreview && (
        <div className="fixed inset-0 z-[9999] bg-black/90 backdrop-blur-md flex flex-col animate-in fade-in duration-300">
           {/* Header da Prévia */}
           <div className="bg-[#121214] border-b border-white/10 p-4 flex items-center justify-between shadow-xl">
             <div className="flex items-center gap-3">
               <div className="bg-emerald-500/20 text-emerald-400 p-2 rounded-lg">
                 <Eye className="w-5 h-5" />
               </div>
               <div className="hidden sm:block">
                 <h3 className="text-white font-black text-sm uppercase tracking-wider">Simulador de Sitio Activo</h3>
                 <p className="text-[10px] text-white/50">Visualizando tu agencia localmente antes de la publicación oficial.</p>
               </div>
             </div>

             {/* Seletor Dispositivo */}
             <div className="flex rounded-lg bg-white/[0.04] p-0.5 border border-white/15">
               <button
                 onClick={() => setPreviewMode("desktop")}
                 className={`px-3 py-1 rounded-md text-[10px] font-bold uppercase transition-all ${
                   previewMode === "desktop" ? "bg-white text-zinc-900 shadow" : "text-white/60 hover:text-white"
                 }`}
               >
                 Computadora
               </button>
               <button
                 onClick={() => setPreviewMode("mobile")}
                 className={`px-3 py-1 rounded-md text-[10px] font-bold uppercase transition-all ${
                   previewMode === "mobile" ? "bg-white text-zinc-900 shadow" : "text-white/60 hover:text-white"
                 }`}
               >
                 Celular
               </button>
             </div>
             
             <button 
               onClick={() => setShowLivePreview(false)}
               className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-white/70 transition-all"
             >
               <CloseIcon className="w-6 h-6" />
             </button>
           </div>
           
           {/* Container do IFrame (Simulando o site rodando) */}
           <div className="flex-1 bg-zinc-900 relative p-4 flex items-center justify-center overflow-auto">
             {previewBlobUrl ? (
               <iframe 
                 src={previewBlobUrl} 
                 className={`bg-white transition-all duration-300 shadow-2xl ${
                   previewMode === "mobile"
                     ? "w-[375px] h-[720px] mx-auto border-[10px] border-zinc-800 rounded-[36px]"
                     : "w-full h-full border-none rounded-2xl"
                 }`}
                 title="Preview Realtime do Site"
                 onLoad={(e) => {
                   const iframeWin = e.currentTarget.contentWindow;
                   if (iframeWin) {
                     iframeWin.addEventListener("keydown", (ev: KeyboardEvent) => {
                       if (ev.ctrlKey && ev.shiftKey && (ev.key === 'P' || ev.key === 'p')) {
                         ev.preventDefault();
                         window.dispatchEvent(new KeyboardEvent("keydown", {
                           key: ev.key,
                           code: ev.code,
                           ctrlKey: ev.ctrlKey,
                           shiftKey: ev.shiftKey,
                           altKey: ev.altKey,
                           metaKey: ev.metaKey,
                           bubbles: true
                         }));
                       }
                     });
                   }
                 }}
               />
             ) : (
               <div className="absolute inset-0 flex items-center justify-center text-white/30 gap-2">
                 <Loader2 className="w-6 h-6 animate-spin" /> Renderizando visualización...
               </div>
             )}
           </div>
        </div>
      )}

    </div>
  );
};
