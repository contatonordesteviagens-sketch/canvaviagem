import { useCallback, useEffect, useMemo, useState } from "react";
import { AlertTriangle, Download, ExternalLink, Loader2, RefreshCw, Search, ShieldAlert } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type SiteInfo = {
  id: string;
  active: boolean;
  project_id: string | null;
  created_at: string;
  updated_at: string;
  suspended_at: string | null;
  suspension_reason: string | null;
};

type UserIntelligence = {
  user_id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  created_at: string;
  utm_source: string | null;
  plan: "elite" | "start" | "inactive" | "trial_expired";
  subscription_status: string;
  billing_cycle: string | null;
  current_period_end: string | null;
  trial_ends_at: string | null;
  site_count: number;
  active_site_count: number;
  sites: SiteInfo[];
  project_count: number;
  ad_generations: number;
  carousel_generations: number;
  ad_downloads: number;
  carousel_downloads: number;
  site_visits: number;
  site_clicks: number;
  leads: number;
  conversion_rate: number;
  last_activity: string | null;
  alert: string | null;
};

const planLabels: Record<UserIntelligence["plan"], string> = {
  elite: "Elite",
  start: "Start",
  inactive: "Inativo / grátis",
  trial_expired: "Teste vencido",
};

const alertLabels: Record<string, string> = {
  SITE_ATIVO_SEM_ELITE: "Site ativo sem Elite",
  TRAFEGO_EM_SITE_SEM_ELITE: "Tráfego em site sem Elite",
  LEADS_EM_CONTA_SEM_ELITE: "Leads em conta sem Elite",
  PAGAMENTO_PENDENTE: "Pagamento pendente",
};

const csvValue = (value: unknown) => `"${String(value ?? "").replace(/"/g, '""')}"`;

export default function UserIntelligencePage() {
  const [rows, setRows] = useState<UserIntelligence[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [plan, setPlan] = useState("all");
  const [signal, setSignal] = useState("all");
  const [expanded, setExpanded] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await (supabase.rpc as any)("admin_user_intelligence");
    if (error) {
      console.error(error);
      toast.error("Não foi possível carregar a inteligência de usuários.");
    } else {
      setRows(Array.isArray(data) ? data : []);
    }
    setLoading(false);
  }, []);

  useEffect(() => { void load(); }, [load]);

  const filtered = useMemo(() => rows.filter((row) => {
    const needle = query.trim().toLowerCase();
    if (needle && ![row.name, row.email, row.phone].some((value) => value?.toLowerCase().includes(needle))) return false;
    if (plan !== "all" && row.plan !== plan) return false;
    if (signal === "site" && row.site_count === 0) return false;
    if (signal === "leads" && row.leads === 0) return false;
    if (signal === "alert" && !row.alert) return false;
    if (signal === "active_site" && row.active_site_count === 0) return false;
    return true;
  }), [plan, query, rows, signal]);

  const totals = useMemo(() => ({
    users: rows.length,
    elite: rows.filter((row) => row.plan === "elite").length,
    sites: rows.reduce((sum, row) => sum + row.active_site_count, 0),
    leads: rows.reduce((sum, row) => sum + row.leads, 0),
    alerts: rows.filter((row) => row.alert).length,
  }), [rows]);

  const exportCsv = () => {
    const headers = ["Nome", "Email", "Telefone", "Plano", "Status", "Sites", "Visitas", "Leads", "Conversão", "Anúncios baixados", "Carrosséis baixados", "Alerta"];
    const lines = filtered.map((row) => [
      row.name, row.email, row.phone, planLabels[row.plan], row.subscription_status,
      row.site_count, row.site_visits, row.leads, `${row.conversion_rate}%`, row.ad_downloads,
      row.carousel_downloads, row.alert ? alertLabels[row.alert] || row.alert : "",
    ].map(csvValue).join(","));
    const blob = new Blob([`\uFEFF${headers.map(csvValue).join(",")}\n${lines.join("\n")}`], { type: "text/csv;charset=utf-8" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `canva-viagem-usuarios-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  const setSiteStatus = async (site: SiteInfo, active: boolean) => {
    const { error } = await (supabase.rpc as any)("admin_set_public_site_status", {
      p_site_id: site.id,
      p_active: active,
      p_reason: active ? null : "manual_admin",
    });
    if (error) return toast.error("Não foi possível alterar o site.");
    toast.success(active ? "Site reativado." : "Site suspenso sem apagar os dados.");
    await load();
  };

  return (
    <div className="min-h-full bg-[#090b10] p-6 text-slate-100 lg:p-10">
      <div className="mx-auto max-w-[1500px] space-y-6">
        <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.22em] text-violet-400">Controle de receita e uso</p>
            <h1 className="mt-2 text-3xl font-black">Inteligência de usuários</h1>
            <p className="mt-2 max-w-3xl text-sm text-slate-400">Dados reais de assinatura, sites, uso, visitas e leads. Métricas futuras passam a ser registradas no momento da geração e do download.</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => void load()} className="flex items-center gap-2 rounded-xl border border-white/10 px-4 py-2 text-sm font-bold hover:bg-white/5"><RefreshCw className="h-4 w-4" />Atualizar</button>
            <button onClick={exportCsv} className="flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2 text-sm font-black hover:bg-violet-500"><Download className="h-4 w-4" />Baixar lista</button>
          </div>
        </header>

        <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
          {[["Usuários", totals.users], ["Elite", totals.elite], ["Sites ativos", totals.sites], ["Leads", totals.leads], ["Alertas", totals.alerts]].map(([label, value]) => (
            <div key={label} className="rounded-2xl border border-white/8 bg-white/[0.035] p-4"><p className="text-xs font-bold uppercase tracking-wider text-slate-500">{label}</p><p className="mt-2 text-3xl font-black">{value}</p></div>
          ))}
        </section>

        {totals.alerts > 0 && <div className="flex items-start gap-3 rounded-2xl border border-amber-400/30 bg-amber-400/10 p-4 text-amber-100"><ShieldAlert className="mt-0.5 h-5 w-5 shrink-0" /><div><p className="font-black">{totals.alerts} conta(s) exigem atenção</p><p className="text-sm text-amber-100/70">Filtre por “Somente alertas” para localizar pagamento pendente, site ou tráfego incompatível com o plano.</p></div></div>}

        <section className="grid gap-3 rounded-2xl border border-white/8 bg-white/[0.025] p-4 md:grid-cols-[minmax(240px,1fr)_180px_220px]">
          <label className="relative"><Search className="absolute left-3 top-3 h-4 w-4 text-slate-500" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar nome, email ou telefone" className="h-10 w-full rounded-xl border border-white/10 bg-black/30 pl-10 pr-3 text-sm outline-none focus:border-violet-500" /></label>
          <select value={plan} onChange={(event) => setPlan(event.target.value)} className="h-10 rounded-xl border border-white/10 bg-[#11141b] px-3 text-sm"><option value="all">Todos os planos</option><option value="elite">Elite</option><option value="start">Start</option><option value="inactive">Inativos / grátis</option><option value="trial_expired">Teste vencido</option></select>
          <select value={signal} onChange={(event) => setSignal(event.target.value)} className="h-10 rounded-xl border border-white/10 bg-[#11141b] px-3 text-sm"><option value="all">Todos os usuários</option><option value="site">Tem site</option><option value="active_site">Tem site ativo</option><option value="leads">Gerou leads</option><option value="alert">Somente alertas</option></select>
        </section>

        <section className="overflow-hidden rounded-2xl border border-white/8 bg-white/[0.025]">
          {loading ? <div className="grid min-h-56 place-items-center"><Loader2 className="h-7 w-7 animate-spin text-violet-400" /></div> : filtered.length === 0 ? <div className="p-12 text-center text-slate-500">Nenhum usuário encontrado.</div> : (
            <div className="overflow-x-auto"><table className="w-full min-w-[1180px] text-left text-sm"><thead className="bg-white/[0.04] text-[11px] uppercase tracking-wider text-slate-500"><tr>{["Usuário", "Plano", "Sites", "Criação / downloads", "Visitas", "Leads", "Conversão", "Situação"].map((head) => <th key={head} className="px-4 py-3">{head}</th>)}</tr></thead><tbody className="divide-y divide-white/[0.06]">{filtered.map((row) => (
              <tr key={row.user_id} onClick={() => setExpanded(expanded === row.user_id ? null : row.user_id)} className="cursor-pointer align-top hover:bg-white/[0.025]">
                <td className="px-4 py-4"><p className="font-bold">{row.name || "Sem nome"}</p><p className="text-xs text-slate-400">{row.email || "Sem email"}</p><p className="text-xs text-slate-600">{row.phone || ""}</p>{expanded === row.user_id && <div className="mt-4 min-w-[980px] space-y-3" onClick={(event) => event.stopPropagation()}><p className="text-xs font-black uppercase tracking-wider text-slate-500">Sites do usuário</p>{row.sites.length === 0 ? <p className="text-slate-500">Nenhum site publicado.</p> : row.sites.map((site) => <div key={site.id} className="flex items-center justify-between rounded-xl border border-white/8 bg-black/20 p-3"><div><p className="font-bold">{site.id}.canvaviagem.com</p><p className="text-xs text-slate-500">{site.active ? "Ativo" : `Suspenso: ${site.suspension_reason || "sem motivo"}`}</p></div><div className="flex gap-2"><a href={`https://${site.id}.canvaviagem.com`} target="_blank" rel="noreferrer" className="rounded-lg border border-white/10 p-2"><ExternalLink className="h-4 w-4" /></a><button onClick={() => void setSiteStatus(site, !site.active)} className={`rounded-lg px-3 py-2 text-xs font-black ${site.active ? "bg-red-500/15 text-red-300" : "bg-emerald-500/15 text-emerald-300"}`}>{site.active ? "Suspender" : "Reativar"}</button></div></div>)}</div>}</td>
                <td className="px-4 py-4"><span className={`rounded-full px-2.5 py-1 text-xs font-black ${row.plan === "elite" ? "bg-violet-500/20 text-violet-300" : row.plan === "start" ? "bg-blue-500/20 text-blue-300" : "bg-slate-500/15 text-slate-400"}`}>{planLabels[row.plan]}</span><p className="mt-2 text-xs text-slate-500">{row.subscription_status}</p></td>
                <td className="px-4 py-4"><p className="font-black">{row.active_site_count} ativo(s)</p><p className="text-xs text-slate-500">{row.site_count} total</p></td>
                <td className="px-4 py-4"><p>{row.ad_generations} anúncios gerados · {row.ad_downloads} baixados</p><p className="text-xs text-slate-500">{row.carousel_generations} carrosséis gerados · {row.carousel_downloads} baixados</p></td>
                <td className="px-4 py-4 font-black">{row.site_visits.toLocaleString("pt-BR")}<p className="text-xs font-normal text-slate-500">{row.site_clicks} cliques</p></td>
                <td className="px-4 py-4 font-black">{row.leads}</td><td className="px-4 py-4 font-black">{row.conversion_rate}%</td>
                <td className="px-4 py-4">{row.alert ? <span className="inline-flex items-center gap-1 rounded-lg bg-amber-400/12 px-2 py-1 text-xs font-bold text-amber-300"><AlertTriangle className="h-3.5 w-3.5" />{alertLabels[row.alert] || row.alert}</span> : <span className="text-xs text-emerald-400">Sem alerta</span>}</td>
              </tr>
            ))}</tbody></table></div>
          )}
        </section>
      </div>
    </div>
  );
}
