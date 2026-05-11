import { useState, useEffect } from "react";
import { useFabricaContext } from "@/hooks/useFabricaContext";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { buildLandingHTML } from "@/lib/fabrica-html-export";
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
  MessageSquare
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export const Phase5Dashboard = () => {
  const { state, setPhase } = useFabricaContext();
  const { user } = useAuth();
  const [showUrlHelp, setShowUrlHelp] = useState(false);
  const [showLivePreview, setShowLivePreview] = useState(false);
  const [previewBlobUrl, setPreviewBlobUrl] = useState<string | null>(null);

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
  
  const [stats, setStats] = useState({ visits: 0, clicks: 0, leads: 0 });
  const [leadsList, setLeadsList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRealMetrics = async () => {
      // USA O ID DO USUÁRIO (ÚNICO) PARA EVITAR COLISÃO DE DADOS ENTRE AGÊNCIAS DIFERENTES
      const agencyTrackingId = user?.id || state.agencyName || "Agência";
      
      try {
        // 1. Contagem REAL de visualizações
        const { count: vCount } = await supabase
          .from("analytics_events")
          .select("*", { count: "exact", head: true })
          .eq("event_type", "page_view")
          .contains("event_data", { agency_id: agencyTrackingId });

        // 2. Contagem REAL de Cliques WhatsApp
        const { count: cCount } = await supabase
          .from("analytics_events")
          .select("*", { count: "exact", head: true })
          .eq("event_type", "click_whatsapp")
          .contains("event_data", { agency_id: agencyTrackingId });

        // 3. Contagem REAL de Leads Capturados
        const { count: lCount } = await supabase
          .from("analytics_events")
          .select("*", { count: "exact", head: true })
          .eq("event_type", "lead_captured")
          .contains("event_data", { agency_id: agencyTrackingId });

        // 4. NOVA COLEÇÃO: BUSCA OS DADOS REAIS DOS ÚLTIMOS 15 LEADS (CRM!)
        const { data: lData } = await supabase
          .from("analytics_events")
          .select("id, created_at, event_data")
          .eq("event_type", "lead_captured")
          .contains("event_data", { agency_id: agencyTrackingId })
          .order("created_at", { ascending: false })
          .limit(15);

        setStats({
          visits: vCount || 0,
          clicks: cCount || 0,
          leads: lCount || 0
        });
        setLeadsList(lData || []);
      } catch (e) {
        console.warn("Falha ao carregar métricas reais:", e);
      } finally {
        setLoading(false);
      }
    };

    fetchRealMetrics();
  }, [state.agencyName]);

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

  const primaryColor = state.primaryColor || "#F59E0B";

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

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Boas Vindas Super Premium */}
      <div className="relative p-6 rounded-3xl overflow-hidden border border-white/10 group bg-black/20">
        <div 
          className="absolute top-0 right-0 w-64 h-64 blur-[100px] rounded-full opacity-20 -mr-10 -mt-10 transition-all group-hover:opacity-30"
          style={{ background: primaryColor }}
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
              Olá, {state.agencyName || "Agência"}! 👋
            </h2>
            <p className="text-sm text-white/60 max-w-md leading-relaxed">
              Diagnóstico: <span className="font-bold text-emerald-400">Nível {state.level || 1}</span> • {state.selectedPackages.length} Pacotes Ativos no Site.
            </p>
          </div>
          <button 
            onClick={() => setPhase(3)}
            className="text-[10px] font-bold bg-white/5 hover:bg-white/10 border border-white/10 px-3 py-2 rounded-full text-white/60 transition-all hover:text-white"
          >
            ✏️ Editar Dados
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
               <span className="text-[10px] font-bold text-white/40">{progress.points}% Concluído</span>
             </div>
             <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
               <div className="h-full bg-gradient-to-r from-blue-500 to-violet-500 rounded-full transition-all duration-1000" style={{ width: `${progress.points}%` }} />
             </div>
           </div>
        </div>
        <div className="text-right hidden sm:block pl-4 border-l border-white/10">
           <div className="text-[10px] font-bold text-white/40 uppercase">Passos Ativos</div>
           <div className="text-sm font-black text-white">{progress.count}/4</div>
        </div>
      </div>

      {/* MÓDULO F5: OS DADOS VITAIS (MUITO VISUAL!) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Card Visitas */}
        <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-5 hover:bg-white/[0.04] transition-all group">
          <div className="flex items-start justify-between mb-4">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400">
              <Users className="w-5 h-5" />
            </div>
            <div className="text-[10px] font-bold px-2 py-0.5 bg-emerald-500/20 text-emerald-300 rounded-full border border-emerald-500/20 flex items-center gap-0.5">
              AO VIVO
            </div>
          </div>
          <div className="text-3xl font-black text-white mb-0.5">
            {loading ? <Loader2 className="w-6 h-6 animate-spin text-white/40" /> : stats.visits}
          </div>
          <div className="text-xs font-bold text-white/40 uppercase tracking-wider">Visitas Únicas</div>
          <div className="mt-3 w-full bg-white/5 h-1 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-500 rounded-full w-[65%] animate-in slide-in-from-left duration-1000" />
          </div>
        </div>

        {/* Card Cliques */}
        <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-5 hover:bg-white/[0.04] transition-all group">
          <div className="flex items-start justify-between mb-4">
            <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400">
              <MousePointerClick className="w-5 h-5" />
            </div>
            <div className="text-[10px] font-bold px-2 py-0.5 bg-blue-500/20 text-blue-300 rounded-full border border-blue-500/20 flex items-center gap-0.5">
              CONVERSÃO
            </div>
          </div>
          <div className="text-3xl font-black text-white mb-0.5">
            {loading ? <Loader2 className="w-6 h-6 animate-spin text-white/40" /> : stats.clicks}
          </div>
          <div className="text-xs font-bold text-white/40 uppercase tracking-wider">Cliques WhatsApp</div>
          <div className="mt-3 w-full bg-white/5 h-1 rounded-full overflow-hidden">
            <div className="h-full bg-blue-500 rounded-full w-[40%] animate-in slide-in-from-left duration-1000 delay-100" />
          </div>
        </div>

        {/* Card Leads */}
        <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-5 hover:bg-white/[0.04] transition-all group">
          <div className="flex items-start justify-between mb-4">
            <div className="p-2.5 rounded-xl bg-violet-500/10 text-violet-400">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div className="text-[10px] font-bold px-2 py-0.5 bg-violet-500/20 text-violet-300 rounded-full border border-violet-500/20">
              {stats.leads > 0 ? "RECEBIDOS" : "AGUARDANDO"}
            </div>
          </div>
          <div className="text-3xl font-black text-white mb-0.5">
            {loading ? <Loader2 className="w-6 h-6 animate-spin text-white/40" /> : stats.leads}
          </div>
          <div className="text-xs font-bold text-white/40 uppercase tracking-wider">Formulários Preenchidos</div>
          <div className="mt-3 w-full bg-white/5 h-1 rounded-full overflow-hidden">
            <div className="h-full bg-violet-500 rounded-full w-[25%] animate-in slide-in-from-left duration-1000 delay-200" />
          </div>
        </div>
      </div>

      {/* Conteúdo Principal do Painel (Dividido em 2 colunas) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* COLUNA 1: Acesso Rápido e Status */}
        <div className="space-y-6">
          <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-sm font-extrabold text-white uppercase tracking-widest flex items-center gap-2">
                <Activity className="w-4 h-4 text-amber-400" /> Status Online
              </h3>
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-400 px-2 py-1 rounded-full bg-amber-400/10">
                <span className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-pulse" />
                AGUARDANDO DNS
              </span>
            </div>

            <div className="space-y-4">
              <button 
                onClick={() => setShowUrlHelp(true)}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-white/5 text-left hover:bg-white/[0.06] transition-all group/url"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center text-white/40 font-bold text-xs group-hover/url:text-amber-400 transition-colors">URL</div>
                  <div>
                    <div className="text-[10px] font-bold text-white/40 uppercase">Endereço Reservado</div>
                    <div className="text-xs font-semibold text-white/90">agencia-{state.instagram?.toLowerCase() || "nome"}.site.com.br</div>
                    <div className="text-[9px] text-amber-300/70 mt-0.5 font-medium italic flex items-center gap-1">
                      Requer ativação. Clique para saber mais.
                    </div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-white/30 group-hover/url:text-white group-hover/url:translate-x-0.5 transition-all" />
              </button>

              <button 
                onClick={() => setShowLivePreview(true)}
                className="w-full py-3 px-4 rounded-xl bg-white/10 border border-white/10 hover:bg-white/20 text-white font-bold flex items-center justify-center gap-2 text-sm transition-all"
              >
                <Eye className="w-4 h-4" /> Visualizar Site Agora
              </button>

              <button 
                className="w-full py-3.5 px-4 rounded-xl font-bold flex items-center justify-center gap-2 text-xs transition-all hover:brightness-110 text-black"
                style={{ background: `linear-gradient(135deg, ${primaryColor}, #FCD34D)` }}
              >
                <Sparkles className="w-3.5 h-3.5" />
                Turbinar Campanhas Agora
              </button>
            </div>
          </div>

          {/* ?? PONTO 6: INTELIG�NCIA ARTIFICIAL (M�TRICAS COM INSIGHT) */}
          <div className="bg-white/[0.03] border border-indigo-500/20 rounded-2xl p-5 relative overflow-hidden group">
             <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/10 blur-[50px] rounded-full" />
             <div className="flex items-center gap-2 mb-3">
               <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center text-indigo-400">
                  <Sparkles className="w-4 h-4 animate-pulse" />
               </div>
               <h3 className="text-xs font-black text-white uppercase tracking-wider">Insight da IA Inteligente</h3>
             </div>
             <div className="text-[11px] leading-relaxed text-white/80">
                {stats.clicks > 0 ? (
                   <p>Detectamos tr�fego no seu site. Para aumentar a convers�o de <strong>{((stats.leads / (stats.visits || 1)) * 100).toFixed(1)}%</strong>, sugerimos publicar o link da p�gina de <span className="text-indigo-300 font-bold">{state.destinos?.[0] || "Destinos"}</span> diretamente nos seus stories agora.</p>
                ) : (
                   <p>Seu site est� pronto, mas aguarda visitas. ?? <strong>Dica da IA:</strong> Gere um an�ncio de <span className="text-indigo-300 font-bold">{state.destinos?.[0] || "pacote promocional"}</span> na F�brica e impulsione por 3 dias para colher seus primeiros leads.</p>
                )}
             </div>
          </div>

          {/* ?? PONTO 7: EFEITO CHICLETE (ROTEIRO DIN�MICO DI�RIO) */}
          <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-5 overflow-hidden relative group">
             <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 group-hover:bg-amber-500/20 transition-colors">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-black text-white text-sm">?? Roteiro de Stories de Hoje</h3>
                    <p className="text-[10px] text-white/40 uppercase font-bold tracking-wider">{formatString(currentDay)}</p>
                  </div>
                </div>
                <span className="text-[9px] font-black bg-white/5 text-white/60 px-2 py-0.5 rounded border border-white/10">DICA DI�RIA</span>
             </div>
             
             <div className="p-4 rounded-xl bg-gradient-to-br from-black/40 to-black/10 border border-white/5 relative">
               {(() => {
                  const dayNum = new Date().getDay(); 
                  let script = { t: "Curiosidade de Destino", d: "Poste 1 foto de um destino ex�tico e fa�a uma enquete: 'Quem voc� levaria?'" };
                  
                  if (dayNum === 1) script = { t: "Dica de Planejamento", d: "Comece a semana dando uma dica de economia na mala de viagem. Isso gera autoridade!" };
                  else if (dayNum === 3) script = { t: "Quebra de Obje��o", d: "Explique por que comprar com agente de viagem � mais seguro do que no buscador online." };
                  else if (dayNum === 5) script = { t: "Chamada de Oferta", d: "Sexta � dia de sonhar! Publique seu pacote principal com link direto para o Whats." };
                  else if (dayNum === 0 || dayNum === 6) script = { t: "Bastidores / Relax", d: "Mostre um pouco do seu dia ou de um cliente que viajou. Gera conex�o!" };
                  
                  return (
                     <>
                        <div className="text-[10px] font-black text-amber-400 uppercase mb-1 flex items-center gap-1">
                           <Target className="w-3 h-3" /> {script.t}
                        </div>
                        <p className="text-xs font-medium text-white/80 leading-relaxed italic">
                           "{script.d}"
                        </p>
                     </>
                  );
               })()}
             </div>
             
             <div className="mt-3 flex justify-end">
               <button 
                 onClick={() => setPhase(1)}
                 className="text-[9px] font-extrabold uppercase tracking-widest text-white/40 hover:text-amber-400 flex items-center gap-1.5 transition-all cursor-pointer"
               >
                 Gerar Arte para o Tema <ArrowRight className="w-2.5 h-2.5" />
               </button>
             </div>
          </div>
        </div>

        {/* COLUNA 2: NOVIDADES DA SEMANA (PONTO 10) */}
        <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-6 flex flex-col">
          <div className="flex items-center gap-2 mb-6">
            <Newspaper className="w-5 h-5 text-indigo-400" />
            <h3 className="font-extrabold text-white uppercase tracking-widest text-sm">Novidades da Semana</h3>
          </div>

          <div className="space-y-4 flex-1">
            {NOVIDADES.map((n, idx) => (
              <div key={idx} className="relative pl-4 border-l-2 border-white/10 group hover:border-white/30 transition-colors py-1">
                <div className="absolute top-2 -left-1 w-2 h-2 rounded-full bg-white/20 group-hover:scale-125 transition-transform" style={{ backgroundColor: n.color === 'amber' ? '#F59E0B' : '#6366F1' }} />
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-[9px] font-black px-1.5 py-0.5 rounded uppercase ${
                    n.color === 'amber' ? 'bg-amber-500/20 text-amber-300' : 'bg-indigo-500/20 text-indigo-300'
                  }`}>
                    {n.tag}
                  </span>
                  <span className="text-[10px] text-white/30">{n.date}</span>
                </div>
                <h4 className="text-xs font-bold text-white mb-1">{n.title}</h4>
                <p className="text-[10px] text-white/50 leading-relaxed">{n.desc}</p>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-[10px] font-bold text-white/60">Sistema Atualizado</span>
            </div>
            <span className="text-[9px] text-white/30 font-mono">v2.5.1-prod</span>
          </div>
        </div>

      </div>

      {/* 🆕 NOVO MÓDULO: CENTRO DE LEADS / CRM INTEGRADO (ULTRA VALOR AGREGADO) */}
      <div className="bg-white/[0.03] border border-white/10 rounded-3xl overflow-hidden shadow-xl animate-in fade-in slide-in-from-bottom-6 duration-700 mt-6">
         <div className="p-6 border-b border-white/10 flex items-center justify-between bg-gradient-to-br from-violet-500/5 to-transparent">
            <div className="flex items-center gap-3">
               <div className="p-2.5 rounded-xl bg-violet-500/20 text-violet-400 shadow-inner">
                  <Users className="w-5 h-5" />
               </div>
               <div>
                  <h3 className="font-black text-white text-base tracking-tight">Carteira de Clientes (Leads)</h3>
                  <p className="text-[11px] text-white/50">Pessoas interessadas que preencheram o formulário no seu site.</p>
               </div>
            </div>
            <div className="hidden sm:block text-[10px] font-extrabold text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded-full animate-pulse">
               DADOS AO VIVO
            </div>
         </div>

         <div className="overflow-x-auto">
            {leadsList.length === 0 ? (
               <div className="p-12 text-center flex flex-col items-center justify-center space-y-3 text-white/30">
                  <MousePointerClick className="w-8 h-8 opacity-40" />
                  <div className="text-sm font-medium">Nenhum lead recebido ainda.</div>
                  <p className="text-[10px] max-w-xs leading-relaxed">Assim que alguém clicar em comprar no seu site, os dados aparecerão aqui automaticamente em tempo real.</p>
               </div>
            ) : (
               <table className="w-full text-left text-sm border-collapse">
                  <thead>
                     <tr className="bg-white/[0.02] border-b border-white/5">
                        <th className="px-6 py-4 text-[10px] font-bold text-white/40 uppercase tracking-wider">Data/Hora</th>
                        <th className="px-6 py-4 text-[10px] font-bold text-white/40 uppercase tracking-wider">Nome do Cliente</th>
                        <th className="px-6 py-4 text-[10px] font-bold text-white/40 uppercase tracking-wider">Interesse</th>
                        <th className="px-6 py-4 text-right text-[10px] font-bold text-white/40 uppercase tracking-wider">Ação</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                     {leadsList.map((l: any) => {
                        const data = l.event_data || {};
                        const rawDate = new Date(l.created_at);
                        const cleanPhone = (data.phone || "").replace(/\D/g, "");
                        
                        return (
                           <tr key={l.id} className="hover:bg-white/[0.02] transition-colors group">
                              <td className="px-6 py-4 whitespace-nowrap text-xs text-white/50">
                                 {rawDate.toLocaleDateString('pt-BR')} <span className="opacity-50 text-[10px] ml-1">{rawDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                              </td>
                              <td className="px-6 py-4">
                                 <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-xs font-black text-white shadow-lg group-hover:scale-110 transition-transform">
                                       {(data.name || "L")[0].toUpperCase()}
                                    </div>
                                    <div>
                                       <div className="font-bold text-white group-hover:text-violet-300 transition-colors">{data.name || "Não informado"}</div>
                                       <div className="text-[10px] text-white/40">{data.phone || "Sem telefone"}</div>
                                    </div>
                                 </div>
                              </td>
                              <td className="px-6 py-4">
                                 <span className="inline-flex px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[10px] font-medium text-white/70 max-w-[180px] truncate">
                                    {data.interest || "Navegação Geral"}
                                 </span>
                              </td>
                              <td className="px-6 py-4 text-right">
                                 {cleanPhone ? (
                                    <a 
                                       href={`https://wa.me/${cleanPhone.startsWith('55') ? '' : '55'}${cleanPhone}`} 
                                       target="_blank" 
                                       rel="noreferrer"
                                       className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#25D366] hover:bg-[#22c35e] text-white text-[11px] font-black rounded-lg transition-all active:scale-95 shadow-lg shadow-green-900/20"
                                    >
                                       <MessageSquare className="w-3.5 h-3.5" /> Chamar Whats
                                    </a>
                                 ) : (
                                    <span className="text-[10px] text-white/30">Sem contato</span>
                                 )}
                              </td>
                           </tr>
                        );
                     })}
                  </tbody>
               </table>
            )}
         </div>
      </div>

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
                     Sim! O sistema apenas *reserva* o nome. Para ele funcionar na internet, você (o dono da plataforma) precisa apontar o seu domínio principal para o servidor (Vercel/Netlify) usando uma regra de DNS chamada "Wildcard" (*).
                   </p>
                   <p>
                     <strong className="text-white">2. Tem custo ou limite de Tokens?</strong><br/>
                     <span className="text-emerald-400 font-bold">ZERO CUSTO.</span> Não usa tokens de IA! O site gerado é estático (HTML/CSS), o que significa que 1.000 ou 10.000 pessoas acessando não custam absolutamente nada nos servidores gratuitos.
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
               <div>
                 <h3 className="text-white font-black text-sm uppercase tracking-wider">Simulador de Site Ativo</h3>
                 <p className="text-[10px] text-white/50">Visualizando sua agência localmente antes da publicação oficial.</p>
               </div>
             </div>
             <button 
               onClick={() => setShowLivePreview(false)}
               className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-white/70 transition-all"
             >
               <CloseIcon className="w-6 h-6" />
             </button>
           </div>
           
           {/* Container do IFrame (Simulando o site rodando) */}
           <div className="flex-1 bg-zinc-900 relative">
             {previewBlobUrl ? (
               <iframe 
                 src={previewBlobUrl} 
                 className="w-full h-full border-none"
                 title="Preview Realtime do Site"
               />
             ) : (
               <div className="absolute inset-0 flex items-center justify-center text-white/30 gap-2">
                 <Loader2 className="w-6 h-6 animate-spin" /> Renderizando visualização...
               </div>
             )}
           </div>
        </div>
      )}

    </div>
  );
};
