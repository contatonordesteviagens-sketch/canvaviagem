import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { useFabricaContext } from "@/hooks/useFabricaContext";
import { useAuth } from "@/contexts/AuthContext";
import { buildLandingHTML } from "@/lib/fabrica-html-export";
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
  ArrowLeft,
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
import { ptBR } from "date-fns/locale";

const EMPTY_METRICS: FabricaMetricSummary = { visits: 0, clicks: 0, leads: 0, avgTime: 0 };

export const Phase5Dashboard = ({ onNext, onBack }: { onNext?: () => void; onBack?: () => void } = {}) => {
  const { state, setPhase, update } = useFabricaContext();
  const { user, session } = useAuth();
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
          toast.success(next === 'mobile' ? "Modo Mobile (iPhone) Ativado! 📱" : "Modo Computador Ativado! 💻");
          return next;
        });
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const [isPublishing, setIsPublishing] = useState(false);
  const [isPublishError, setIsPublishError] = useState(false); // Fix #8: estado visual de falha
  
  // Fix #7: Sanitiza mensagens técnicas antes de exibir ao usuário
  const sanitizePublishError = (err: any): string => {
    const raw = err?.message || err?.details || "Erro desconhecido";
    if (raw.includes("another_owner") || raw.includes("site_slug_unavailable")) {
      return "Esse endereço já pertence a outra conta. Escolha outro subdomínio.";
    }
    if (raw.includes("another_project") || raw.includes("site_slug_belongs_to_another_project")) {
      return "Esse endereço já está ligado a outro projeto seu. Escolha outro subdomínio.";
    }
    if (raw.toLowerCase().includes("row-level") || raw.toLowerCase().includes("rls") || raw.toLowerCase().includes("policy")) {
      return "Sessão expirada. Faça logout e login novamente para publicar.";
    }
    if (raw.toLowerCase().includes("network") || raw.toLowerCase().includes("fetch")) {
      return "Sem conexão com a internet. Verifique sua rede e tente de novo.";
    }
    if (raw.toLowerCase().includes("timeout")) {
      return "A operação demorou demais. Tente publicar novamente.";
    }
    return "Não foi possível publicar seu site agora. Tente novamente em instantes.";
  };
  
  const handleDashboardPublish = async () => {
    if (!user?.id) {
      toast.error("Faça login para publicar.");
      return;
    }
    const slug = resolveFabricaSiteSlug(state.siteContent?.canvaViagemUrl, state.agencyName || "");
    const slugError = validateCanvaSiteSlug(slug);
    if (slugError) {
      const messages = {
        too_short: "Informe um nome de agência com pelo menos 3 caracteres para criar o endereço do site.",
        too_long: "O endereço do site deve ter no máximo 63 caracteres.",
        invalid: "Use somente letras, números e hífens no endereço do site.",
        reserved: "Esse endereço é reservado. Escolha outro nome para a agência.",
      } as const;
      toast.error(messages[slugError]);
      return;
    }
    
    setIsPublishing(true);
    setIsPublishError(false); // Fix #8: reseta estado de falha
    const loadingToast = toast.loading("Publicando e ativando seu site...");
    
    try {
      const result = await publishFabricaSite({
        state,
        userId: user.id,
        slug,
        locale: "pt-BR",
      });
      update({
        projectId: result.projectId,
        crmForm: result.state.crmForm,
        logoBase64: result.state.logoBase64,
        selectedPackages: result.state.selectedPackages,
        siteContent: result.state.siteContent,
      });

      
      toast.dismiss(loadingToast);
      toast.success("🚀 SITE PUBLICADO E ATIVO COM SUCESSO!");
      setIsPublishError(false);
      
      if (typeof window !== "undefined" && (window as any).confetti) {
         (window as any).confetti();
      }
      
    } catch (err: any) {
      // Fix #2 + #7: Mensagem humanizada + instrumento de recuperação
      console.error("Publish error:", err);
      const friendlyMsg = sanitizePublishError(err);
      toast.dismiss(loadingToast);
      toast.error(friendlyMsg, {
        description: "Clique em \"Tentar novamente\" abaixo ou atualize a página.",
        duration: 8000,
      });
      setIsPublishError(true); // Fix #8: ativa estado visual de falha
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
  // As duas listas são apenas projeções da leitura do Supabase. Elas são limpas
  // ao trocar de projeto para uma resposta antiga nunca aparecer no projeto novo.
  const [leadsList, setLeadsList] = useState<any[]>([]);
  const [accountHistoryLeads, setAccountHistoryLeads] = useState<any[]>([]);
  const [leadView, setLeadView] = useState<"project" | "account-history">("project");
  const [loading, setLoading] = useState(true);
  const [metricsAvailable, setMetricsAvailable] = useState(false);
  // fetchError = true indica falha de rede/RLS, NÃO ausência de leads.
  // Quando fetchError=true, a UI exibe aviso de erro — nunca "sem leads".
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
    const roteiros = activeLeadList.map(l => l.destino_interesse || "Navegação Geral");
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

  // Fechar modal com Escape
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
      toast.success("Fase atualizada e salva!");
    } catch (error) {
      if (activeCrmScopeRef.current !== operationScope) return;
      const restoredLead = { ...lead, status: previousStatus };
      setLeadsList(prev => prev.map(item => item.id === leadId ? restoredLead : item));
      setAccountHistoryLeads(prev => prev.map(item => item.id === leadId ? restoredLead : item));
      setSelectedLead(prev => prev?.id === leadId ? restoredLead : prev);
      console.warn("Não foi possível salvar a fase do lead:", error);
      toast.error("Não foi possível salvar a nova fase. O valor anterior foi restaurado.");
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
        console.warn("Falha ao carregar métricas reais:", e);
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
    setLoading(true);
    setMetricsAvailable(false);
    setFetchError(false);
    setLeadView("project");
    void fetchRealMetrics();
    return () => {
      cancelled = true;
    };
  }, [
    user?.id,
    session?.access_token,
    state.projectId,
    state.crmForm?.id,
    state.siteContent?.canvaViagemUrl,
    state.agencyName,
    reloadKey,
  ]);

  const currentDay = format(new Date(), "EEEE, d 'de' MMMM", { locale: ptBR });
  const formatString = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

  // Lançamentos da semana (Ponto 10) - Destaques que mudam dinamicamente
  const NOVIDADES = [
    {
      tag: "LANÇAMENTO",
      title: "Novos Templates de Gramado/RS",
      desc: "12 novas artes focadas na temporada de inverno 2024 acabam de entrar na Fábrica.",
      date: "Hoje",
      color: "amber"
    },
    {
      tag: "ATUALIZAÇÃO",
      title: "Mecanismo Lote A/B Premium",
      desc: "Agora você pode gerar 3 versões das suas artes de uma vez gastando apenas 1 crédito.",
      date: "Ontem",
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
    else if (points >= 50) badge = { n: "Em Decolagem", e: "🚀", c: "text-blue-400" };
    
    return { points, badge, count };
  };
  const progress = getAppProgress();

  const filteredLeads = activeLeadList.filter((l) => {
    if (filterRoteiro !== "Todos") {
      const destino = l.destino_interesse || "Navegação Geral";
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
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700">

      {/* Banner de erro de publicação */}
      {isPublishError && (
        <div className="flex items-center gap-3 p-4 rounded-xl border border-red-500/30 bg-red-500/10">
          <div className="flex-1 min-w-0">
            <div className="text-sm font-bold text-red-300">Falha ao publicar o site</div>
            <p className="text-xs text-red-300/60">Seus dados não foram apagados.</p>
          </div>
          <button
            onClick={handleDashboardPublish}
            disabled={isPublishing}
            className="flex-shrink-0 px-3 py-1.5 bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white text-xs font-bold rounded-lg transition-colors"
          >
            {isPublishing ? "Tentando..." : "Tentar novamente"}
          </button>
        </div>
      )}

      {/* MÉTRICAS — MINIMALISTAS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="border border-white/8 rounded-2xl p-4 bg-transparent">
          <div className="text-2xl font-black text-white mb-1">
            {loading
              ? <Loader2 className="w-5 h-5 animate-spin text-white/30" />
              : metricsAvailable ? stats.visits : "—"}
          </div>
          <div className="text-[11px] text-white/35 font-medium">Visitas</div>
          {metricsAvailable && stats.avgTime > 0 && <div className="text-[10px] text-white/25 mt-1">{stats.avgTime}s médio</div>}
        </div>
        <div className="border border-white/8 rounded-2xl p-4 bg-transparent">
          <div className="text-2xl font-black text-white mb-1">
            {loading
              ? <Loader2 className="w-5 h-5 animate-spin text-white/30" />
              : metricsAvailable ? stats.clicks : "—"}
          </div>
          <div className="text-[11px] text-white/35 font-medium">Cliques WhatsApp</div>
        </div>
        <div className="border border-white/8 rounded-2xl p-4 bg-transparent">
          <div className="text-2xl font-black text-white mb-1">
            {loading ? <Loader2 className="w-5 h-5 animate-spin text-white/30" /> : stats.leads}
          </div>
          <div className="text-[11px] text-white/35 font-medium">Leads do projeto</div>
        </div>
        <div className="border border-white/8 rounded-2xl p-4 bg-transparent">
          <div className="text-2xl font-black text-white mb-1">
            {loading
              ? <Loader2 className="w-5 h-5 animate-spin text-white/30" />
              : conversionRate === null ? "—" : `${conversionRate}%`}
          </div>
          <div className="text-[11px] text-white/35 font-medium">Taxa de conversão</div>
          {!loading && conversionRate === null && (
            <div className="text-[10px] text-amber-300/60 mt-1">
              {metricsAvailable ? "Histórico de visitas incompleto" : "Métricas indisponíveis"}
            </div>
          )}
        </div>
      </div>

      {!loading && !metricsAvailable && !fetchError && (
        <div className="flex items-center justify-between gap-4 border-y border-amber-300/20 bg-amber-300/[0.04] px-4 py-3">
          <p className="text-[11px] leading-5 text-amber-100/70">
            Visitas e cliques estão temporariamente indisponíveis. Os leads continuam carregados e não foram alterados.
          </p>
          <button
            type="button"
            onClick={() => setReloadKey((key) => key + 1)}
            className="shrink-0 text-[10px] font-bold text-amber-200 underline hover:text-white"
          >
            Recarregar métricas
          </button>
        </div>
      )}

      {hasAccountHistory && (
        <div className="flex flex-col gap-4 border-y border-amber-300/15 bg-amber-300/[0.035] px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-start gap-3">
            <History className="mt-0.5 h-4 w-4 shrink-0 text-amber-300/80" aria-hidden="true" />
            <div>
              <div className="text-xs font-bold text-amber-100">Histórico recuperado da conta</div>
              <p className="mt-1 max-w-2xl text-[11px] leading-5 text-white/45">
                Estes dados foram preservados, mas os sites antigos não registravam o projeto de origem.
                Por isso, eles ficam separados e não alteram os números do projeto aberto.
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
              <div className="text-[9px] uppercase text-white/30">Cliques</div>
            </div>
            <div>
              <div className="text-sm font-black text-white/80">{accountHistoryStats.leads}</div>
              <div className="text-[9px] uppercase text-white/30">Leads</div>
            </div>
          </div>
        </div>
      )}

      {/* CARTEIRA DE CLIENTES */}
      <div className="border border-white/8 rounded-2xl overflow-hidden mt-2">
        {/* Header simples */}
        <div className="px-5 py-4 border-b border-white/8 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white">
                {leadView === "project" ? "Leads do projeto" : "Histórico da conta"}
              </h3>
              {activeLeadList.length > 0 && (
                <span className="text-[10px] text-white/40 font-medium">
                  {filteredLeads.length} lead{filteredLeads.length !== 1 ? "s" : ""}
                  {hasActiveFilters ? ` filtrado${filteredLeads.length !== 1 ? "s" : ""}` : ""}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1" role="tablist" aria-label="Origem dos leads">
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
                Projeto atual ({leadsList.length})
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
                  Histórico sem projeto ({accountHistoryLeads.length})
                </button>
              )}
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={filterData}
              onChange={(e) => setFilterData(e.target.value)}
              className="bg-white/5 border border-white/10 text-[11px] text-white/60 rounded-lg px-2.5 py-1.5 outline-none"
            >
              <option value="Todas">Qualquer Data</option>
              <option value="Hoje">Hoje</option>
              <option value="7 dias">7 dias</option>
              <option value="30 dias">30 dias</option>
            </select>
            <select
              value={filterFase}
              onChange={(e) => setFilterFase(e.target.value)}
              className="bg-white/5 border border-white/10 text-[11px] text-white/60 rounded-lg px-2.5 py-1.5 outline-none"
            >
              <option value="Todas">Todas as fases</option>
              <option value="novo">Novo</option>
              <option value="contato">Em Contato</option>
              <option value="proposta">Proposta</option>
              <option value="venda">Venda</option>
              <option value="perda">Perda</option>
            </select>
            <select
              value={filterRoteiro}
              onChange={(e) => setFilterRoteiro(e.target.value)}
              className="bg-white/5 border border-white/10 text-[11px] text-white/60 rounded-lg px-2.5 py-1.5 outline-none max-w-[140px] truncate"
            >
              {getRoteirosUnicos().map(r => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
            {hasActiveFilters && (
              <button onClick={clearFilters} className="text-[10px] text-white/40 hover:text-white transition-colors underline">
                Limpar
              </button>
            )}
          </div>
        </div>

        {/* ⛔ AVISO DE ERRO DE FETCH — aparece apenas quando há falha de conexão/RLS */}
        {fetchError && (
          <div className="mx-5 mt-4 flex items-start gap-3 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3">
            <div className="mt-0.5 text-red-400 text-sm">⚠️</div>
            <div>
              <div className="text-xs font-bold text-red-300">Não foi possível carregar os leads agora</div>
              <p className="text-[11px] text-red-200/60 mt-0.5">Verifique sua conexão e recarregue a página. Seus dados estão salvos e protegidos no servidor.</p>
              <button
                onClick={() => { setFetchError(false); setLoading(true); setReloadKey((key) => key + 1); }}
                className="mt-2 text-[10px] font-bold text-red-300 hover:text-white underline transition-colors"
              >
                Tentar novamente
              </button>
            </div>
          </div>
        )}

        {filteredLeads.length === 0 && !loading && !fetchError ? (
          <div className="py-12 text-center">
            <p className="text-sm text-white/30">
              {activeLeadList.length === 0
                ? leadView === "project"
                  ? "Nenhum lead atribuído a este projeto ainda."
                  : "Nenhum lead histórico sem projeto."
                : "Nenhum lead corresponde aos filtros."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="px-5 py-3 text-[10px] text-white/30 font-semibold uppercase tracking-wider">Data</th>
                  <th className="px-5 py-3 text-[10px] text-white/30 font-semibold uppercase tracking-wider">Nome</th>
                  <th className="px-5 py-3 text-[10px] text-white/30 font-semibold uppercase tracking-wider">Destino</th>
                  <th className="px-5 py-3 text-[10px] text-white/30 font-semibold uppercase tracking-wider">Fase</th>
                  <th className="px-5 py-3 text-right text-[10px] text-white/30 font-semibold uppercase tracking-wider">Ação</th>
                </tr>
              </thead>
              <tbody>
                {filteredLeads.map((l: any) => {
                  const rawDate = new Date(l.created_at);
                  const cleanPhone = String(l.whatsapp || "").replace(/\D/g, "");
                  const currentStatus = l.status || 'novo';
                  return (
                    <tr key={l.id} className="border-b border-white/[0.04] hover:bg-white/[0.015] transition-colors">
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <div className="text-xs text-white/50">{rawDate.toLocaleDateString('pt-BR')}</div>
                        <div className="text-[10px] text-white/25">{rawDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</div>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="text-sm font-medium text-white/80">{l.nome_completo || "Sem nome"}</div>
                        <div className="text-[10px] text-white/30 truncate max-w-[160px]">{l.email || l.whatsapp || "—"}</div>
                        {l.legacy_unassigned && (
                          <div className="mt-1 text-[9px] font-semibold text-amber-300/70">
                            Histórico da conta · projeto não identificado
                          </div>
                        )}
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="text-xs text-white/50">{l.destino_interesse || "Geral"}</span>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="relative inline-block">
                          <select
                            value={currentStatus}
                            onChange={(e) => handleStatusChange(l.id, e.target.value)}
                            className={`appearance-none cursor-pointer pl-3 pr-7 py-1 rounded-full text-[10px] font-semibold border outline-none transition-colors ${getFaseColor(currentStatus)}`}
                          >
                            <option value="novo">Novo</option>
                            <option value="contato">Em Contato</option>
                            <option value="proposta">Proposta</option>
                            <option value="venda">Venda</option>
                            <option value="perda">Perda</option>
                          </select>
                          <ChevronDown className="absolute right-1.5 top-1.5 w-3 h-3 pointer-events-none opacity-40" />
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setSelectedLead(l)}
                            className="p-1.5 rounded-lg text-white/30 hover:text-white hover:bg-white/5 transition-colors"
                            title="Ver detalhes"
                          >
                            <Maximize2 className="w-3.5 h-3.5" />
                          </button>
                          {cleanPhone ? (
                            <a
                              href={`https://wa.me/${cleanPhone.startsWith('55') ? '' : '55'}${cleanPhone}?text=${encodeURIComponent(`Olá ${l.nome_completo || 'viajante'}! Vi seu interesse no destino ${l.destino_interesse || 'Geral'}. Como podemos ajudar com sua viagem?`)}`}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#25D366]/15 hover:bg-[#25D366]/25 text-[#25D366] text-[10px] font-bold rounded-lg border border-[#25D366]/20 transition-colors"
                            >
                              WhatsApp
                            </a>
                          ) : (
                            <span className="text-[10px] text-white/20">—</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal: Maximizar Detalhes do Lead */}
      {selectedLead && (
         <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-[#121214] border border-white/10 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
               <div className="p-5 border-b border-white/10 flex items-center justify-between bg-gradient-to-br from-violet-500/10 to-transparent">
                  <h3 className="font-black text-white flex items-center gap-2">
                     <Users className="w-5 h-5 text-violet-400" />
                     Ficha do Cliente
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
                        <h4 className="text-lg font-bold text-white">{selectedLead.nome_completo || "Não informado"}</h4>
                        <div className="flex items-center gap-3 text-xs mt-1 flex-wrap">
                           <span className="text-white/40">{new Date(selectedLead.created_at).toLocaleString('pt-BR')}</span>
                        </div>
                     </div>
                  </div>

                  {selectedLead.legacy_unverified && (
                    <div className="rounded-2xl border border-amber-400/20 bg-amber-400/[0.08] p-4 text-xs leading-5 text-amber-100/80">
                      Registro histórico não verificado. Ele não entra no total oficial do CRM e pode não estar atribuído a este projeto.
                    </div>
                  )}
                  {selectedLead.legacy_unassigned && !selectedLead.legacy_unverified && (
                    <div className="rounded-2xl border border-amber-400/20 bg-amber-400/[0.08] p-4 text-xs leading-5 text-amber-100/80">
                      Lead histórico recuperado da conta. O site antigo não registrava a qual projeto ele pertencia.
                    </div>
                  )}

                  {/* Fase diretamente no modal */}
                  <div className="bg-white/5 border border-white/5 p-4 rounded-2xl">
                     <div className="text-[10px] text-white/40 font-bold uppercase mb-2">Fase do Lead</div>
                     <div className="flex flex-wrap gap-2">
                       {['novo','contato','proposta','venda','perda'].map(fase => {
                         const labels: Record<string, string> = { novo: '🟡 Novo', contato: '🔵 Em Contato', proposta: '🟣 Proposta', venda: '🟢 Venda', perda: '⚪ Perda' };
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
                        <div className="text-[10px] text-white/40 font-bold uppercase mb-1">Contato</div>
                        <div className="text-sm font-medium text-white">{selectedLead.whatsapp || "N/A"}</div>
                        <div className="text-xs text-white/60 mt-0.5 truncate" title={selectedLead.email}>{selectedLead.email || "N/A"}</div>
                     </div>
                     <div className="bg-white/5 border border-white/5 p-4 rounded-2xl">
                        <div className="text-[10px] text-white/40 font-bold uppercase mb-1">Destino</div>
                        <div className="text-sm font-medium text-white">{selectedLead.destino_interesse || "Geral"}</div>
                        <div className="text-xs text-white/60 mt-0.5">{selectedLead.numero_viajantes} Viajante(s)</div>
                     </div>
                  </div>

                  {(selectedLead.data_ida || selectedLead.data_volta) && (
                     <div className="bg-white/5 border border-white/5 p-4 rounded-2xl flex gap-6">
                        {selectedLead.data_ida && (
                           <div>
                              <div className="text-[10px] text-white/40 font-bold uppercase mb-1">Data Ida</div>
                              <div className="text-sm font-medium text-white">{new Date(selectedLead.data_ida).toLocaleDateString('pt-BR', {timeZone: 'UTC'})}</div>
                           </div>
                        )}
                        {selectedLead.data_volta && (
                           <div>
                              <div className="text-[10px] text-white/40 font-bold uppercase mb-1">Data Volta</div>
                              <div className="text-sm font-medium text-white">{new Date(selectedLead.data_volta).toLocaleDateString('pt-BR', {timeZone: 'UTC'})}</div>
                           </div>
                        )}
                     </div>
                  )}

                  <div className="bg-white/5 border border-white/5 p-4 rounded-2xl">
                     <div className="text-[10px] text-white/40 font-bold uppercase mb-2">Observações do Cliente</div>
                     <p className="text-sm text-white/80 leading-relaxed whitespace-pre-wrap">
                        {selectedLead.observacoes || <span className="italic text-white/30">Nenhuma observação informada no formulário.</span>}
                     </p>
                  </div>
               </div>

               <div className="p-5 border-t border-white/10 bg-black/20 flex justify-end">
                  {selectedLead.whatsapp ? (
                     <a 
                        href={`https://wa.me/${String(selectedLead.whatsapp).replace(/\D/g, "").startsWith('55') ? '' : '55'}${String(selectedLead.whatsapp).replace(/\D/g, "")}?text=${encodeURIComponent(`Olá ${selectedLead.nome_completo || 'viajante'}! Vi seu interesse no destino ${selectedLead.destino_interesse || 'Geral'}. Como podemos ajudar com sua viagem?`)}`} 
                        target="_blank" 
                        rel="noreferrer"
                        className="px-6 py-2.5 bg-[#25D366] hover:bg-[#22c35e] text-white text-sm font-black rounded-xl transition-all flex items-center gap-2 shadow-lg"
                     >
                        <MessageSquare className="w-4 h-4" /> Iniciar Conversa
                     </a>
                  ) : (
                     <button onClick={() => setSelectedLead(null)} className="px-6 py-2.5 bg-white text-black font-bold rounded-xl hover:bg-zinc-200 transition-all">
                        Fechar Detalhes
                     </button>
                  )}
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
                  <ExternalLink className="w-5 h-5 text-amber-400" /> Entendendo o Subdomínio
                </h3>
                <p className="text-xs text-white/50 mt-1">Como este recurso de escala funciona.</p>
             </div>
             <div className="p-6 space-y-5">
                <div className="space-y-3 text-sm text-white/70 leading-relaxed">
                   <p>
                     <strong className="text-white">1. É Automático?</strong><br/>
                     Sim. O Cloudflare atende os subdomínios do Canva Viagem por uma regra DNS/rota "Wildcard" (*). A aplicação identifica a agência pelo endereço e carrega o site publicado, sem criar um domínio ou uma conta de hospedagem para cada agência.
                   </p>
                   <p>
                     <strong className="text-white">2. Tem custo ou limite de Tokens?</strong><br/>
                     <span className="text-emerald-400 font-bold">NÃO USA TOKENS DE IA POR VISITA.</span> O site publicado utiliza a infraestrutura compartilhada do Canva Viagem e segue os limites contratados no Cloudflare e no Supabase. Criar caminhos ou pacotes não cria novos domínios.
                   </p>
                   <p>
                     <strong className="text-white">3. Onde ficam os dados?</strong><br/>
                     Tudo no seu Supabase! Quando o site carrega, ele "pede" ao seu banco os textos e fotos da agência X e monta a tela instantaneamente. Sem gerar 1.000 contas separadas. Tudo centralizado na SUA conta mestra.
                   </p>
                </div>
                <button 
                  onClick={() => setShowUrlHelp(false)}
                  className="w-full py-3 bg-white text-black font-bold rounded-xl hover:bg-zinc-200 transition-colors"
                >
                  Entendi, fechar
                </button>
             </div>
          </div>
        </div>
      )}

      {/* 🆕 MODAL DE PRÉVIA AO VIVO (SIMULADOR) */}
      {showLivePreview && (
        <div className="fixed inset-0 z-[9999] bg-black/90 backdrop-blur-md flex flex-col animate-in fade-in duration-300">
           {/* Header da Prévia */}
           <div className="bg-[#121214] border-b border-white/10 p-4 flex items-center justify-between shadow-xl">
             <div className="flex items-center gap-3">
               <div className="bg-emerald-500/20 text-emerald-400 p-2 rounded-lg">
                 <Eye className="w-5 h-5" />
               </div>
               <div className="hidden sm:block">
                 <h3 className="text-white font-black text-sm uppercase tracking-wider">Simulador de Site Ativo</h3>
                 <p className="text-[10px] text-white/50">Visualizando sua agência localmente antes da publicação oficial.</p>
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
                 Computador
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
                 <Loader2 className="w-6 h-6 animate-spin" /> Renderizando visualização...
               </div>
             )}
           </div>
        </div>
      )}

      {/* Barra de Navegação Inferior */}
      {(onBack || onNext) && (
        <div className="flex flex-col gap-3 rounded-3xl border border-white/10 bg-black/30 p-3 sm:flex-row mt-8">
          {onBack && (
            <button onClick={onBack} className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-bold text-white/70 hover:bg-white/[0.08] transition-colors">
              <ArrowLeft className="h-4 w-4" />
              Voltar: Site (F2)
            </button>
          )}
          {onNext && (
            <button onClick={onNext} className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-amber-400 px-4 py-3 text-sm font-black text-zinc-950 hover:bg-amber-300 transition-colors shadow-[0_0_20px_rgba(245,158,11,0.3)]">
              Avançar: Checkup (F4)
              <ArrowRight className="h-4 w-4" />
            </button>
          )}
        </div>
      )}

    </div>
  );
};

