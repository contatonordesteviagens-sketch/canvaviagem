import { useState, useEffect } from "react";
import { useFabricaContext } from "@/hooks/useFabricaContext";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
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
  
  const [stats, setStats] = useState({ visits: 0, clicks: 0, leads: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRealMetrics = async () => {
      const agencyId = state.agencyName || "Agência";
      
      try {
        // 1. Contagem REAL de visualizações
        const { count: vCount } = await supabase
          .from("analytics_events")
          .select("*", { count: "exact", head: true })
          .eq("event_type", "page_view")
          .contains("event_data", { agency_id: agencyId });

        // 2. Contagem REAL de Cliques WhatsApp
        const { count: cCount } = await supabase
          .from("analytics_events")
          .select("*", { count: "exact", head: true })
          .eq("event_type", "click_whatsapp")
          .contains("event_data", { agency_id: agencyId });

        // 3. Contagem REAL de Leads Capturados
        const { count: lCount } = await supabase
          .from("analytics_events")
          .select("*", { count: "exact", head: true })
          .eq("event_type", "lead_captured")
          .contains("event_data", { agency_id: agencyId });

        setStats({
          visits: vCount || 0,
          clicks: cCount || 0,
          leads: lCount || 0
        });
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

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Boas Vindas Super Premium */}
      <div className="relative p-6 rounded-3xl overflow-hidden border border-white/10 group bg-black/20">
        <div 
          className="absolute top-0 right-0 w-64 h-64 blur-[100px] rounded-full opacity-20 -mr-10 -mt-10 transition-all group-hover:opacity-30"
          style={{ background: primaryColor }}
        />
        <div className="relative z-10">
          <div className="text-xs font-bold text-white/40 uppercase tracking-widest mb-1">{formatString(currentDay)}</div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight mb-2">
            Olá, {state.agencyName || "Agência"}! 👋
          </h2>
          <p className="text-sm text-white/60 max-w-md leading-relaxed">
            Seu ecossistema digital está ativo. Acompanhe o desempenho do seu mini-site e veja as novidades preparadas para você hoje.
          </p>
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
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 px-2 py-1 rounded-full bg-emerald-400/10">
                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                NO AR
              </span>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-white/5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center text-white/40 font-bold text-xs">URL</div>
                  <div>
                    <div className="text-[10px] font-bold text-white/40 uppercase">Seu Subdomínio Ativo</div>
                    <div className="text-xs font-semibold text-white/90">agencia-{state.instagram || "viagem"}.canva.cc</div>
                  </div>
                </div>
                <button className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white/60 hover:text-white">
                  <ExternalLink className="w-4 h-4" />
                </button>
              </div>

              <button 
                className="w-full py-3.5 px-4 rounded-xl font-bold flex items-center justify-center gap-2 text-xs transition-all hover:brightness-110 text-black"
                style={{ background: `linear-gradient(135deg, ${primaryColor}, #FCD34D)` }}
              >
                <Sparkles className="w-3.5 h-3.5" />
                Turbinar Campanhas Agora
              </button>
            </div>
          </div>

          {/* PONTO 8: Link Checklist x Fase 3 / Fase 2 */}
          <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-6 overflow-hidden relative">
             <div className="flex items-center gap-3 mb-4">
               <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
                 <Calendar className="w-5 h-5" />
               </div>
               <div>
                 <h3 className="font-black text-white text-sm">Plano Semanal</h3>
                 <p className="text-[10px] text-white/50">O que postar hoje?</p>
               </div>
             </div>
             <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5">
               <p className="text-xs font-medium text-white/80 leading-relaxed mb-3">
                 📅 <strong>Agenda Sugerida:</strong> Mantenha seus stories ativos e use a IA para criar variações. Aproveite as novidades da semana!
               </p>
               <button 
                 onClick={() => setPhase(1)}
                 className="text-[10px] font-extrabold uppercase tracking-wider text-amber-400 flex items-center gap-1.5 hover:gap-2.5 transition-all cursor-pointer"
               >
                 Ir para Fábrica de Anúncios <ArrowRight className="w-3 h-3" />
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

    </div>
  );
};
