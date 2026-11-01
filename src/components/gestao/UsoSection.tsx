import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, Loader2, Search } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { useAdminUserIntelligence, type AdminUserIntelligence } from "@/hooks/useAdminUserIntelligence";

type UsageRow = {
  user_id: string;
  events: Record<string, number>;
  screens: Record<string, number>;
  sessions: number;
  active_seconds: number;
  first_fabrica_at: string | null;
  first_art_at: string | null;
  last_event_at: string | null;
  site_visits: number;
  site_clicks: number;
  site_avg_seconds: number | null;
};

type Cliente = AdminUserIntelligence & {
  uso: UsageRow | null;
  artes: number;
  artesBaixadas: number;
  carrosseis: number;
  carrosseisBaixados: number;
  sitesPublicados: number;
  audios: number;
  visitas: number;
  cliques: number;
  ativo: boolean;
  minutosAtePrimeiraArte: number | null;
};

type Periodo = "tudo" | "30" | "7";
type Grupo = "ativos" | "todos";

const CONTA_INTERNA = /(teste|test[._-]|@test|exemplo|example|lucashenrique|contatonordeste|canvaviagem|rochadigital)/i;

const TELAS: Record<string, string> = {
  "/fabrica": "Início da Fábrica",
  "/fabrica/anuncio": "Anúncios",
  "/fabrica/carrossel": "Carrossel",
  "/fabrica/site": "Site",
  "/fabrica/crm": "Clientes (CRM)",
};
const EVENTOS: Record<string, string> = {
  fabrica_opened: "Abriu a Fábrica",
  ad_preview_generated: "Gerou arte",
  ad_export_completed: "Baixou arte",
  carousel_preview_generated: "Gerou carrossel",
  carousel_export_completed: "Baixou carrossel",
  site_preview_generated: "Abriu a prévia do site",
  site_published: "Publicou o site",
  audio_used: "Usou o áudio",
  onboarding_step: "Etapa do quiz",
  plan_selected: "Escolheu plano",
  login_complete: "Entrou na conta",
  checkout_started: "Abriu o pagamento",
  paywall_viewed: "Viu aviso de assinatura",
  subscription_required: "Barrado por falta de assinatura",
};

const opened = (c: Cliente, ...paths: string[]) => paths.some((p) => (c.uso?.screens?.[p] ?? 0) > 0);
const fmtData = (d: string | null | undefined) => (d ? format(new Date(d), "dd/MM/yy HH:mm", { locale: ptBR }) : "-");
const fmtDuracao = (s: number | null | undefined) => {
  if (!s) return "-";
  if (s < 60) return `${s} s`;
  const min = Math.round(s / 60);
  return min < 60 ? `${min} min` : `${Math.floor(min / 60)} h ${min % 60} min`;
};
const n = (v: number) => v.toLocaleString("pt-BR");

/** Painel de uso: dados reais de analytics_events. Só o tempo é aproximado. */
export function UsoSection() {
  const [periodo, setPeriodo] = useState<Periodo>("tudo");
  const [grupo, setGrupo] = useState<Grupo>("ativos");
  const [busca, setBusca] = useState("");
  const [aberto, setAberto] = useState<Cliente | null>(null);

  const { data: base, isLoading: loadingBase, error: errorBase } = useAdminUserIntelligence();
  const { data: uso, isLoading: loadingUso, error: errorUso } = useQuery({
    queryKey: ["admin-usage-by-user", periodo],
    queryFn: async () => {
      const { data, error } = await (supabase.rpc as any)("admin_usage_by_user", { p_days: periodo === "tudo" ? null : Number(periodo) });
      if (error) throw error;
      return (data ?? []) as UsageRow[];
    },
  });

  const clientes = useMemo<Cliente[]>(() => {
    const porId = new Map((uso ?? []).map((u) => [u.user_id, u]));
    return (base ?? [])
      .filter((b) => !CONTA_INTERNA.test(b.email ?? ""))
      .map((b) => {
        const u = porId.get(b.user_id) ?? null;
        const ev = u?.events ?? {};
        const tudo = periodo === "tudo";
        const primeira = u?.first_fabrica_at && u.first_art_at && u.first_art_at >= u.first_fabrica_at
          ? Math.round((Date.parse(u.first_art_at) - Date.parse(u.first_fabrica_at)) / 60000)
          : null;
        return {
          ...b,
          uso: u,
          artes: ev.ad_preview_generated ?? 0,
          artesBaixadas: tudo ? Math.max(b.ad_downloads, ev.ad_export_completed ?? 0) : ev.ad_export_completed ?? 0,
          carrosseis: ev.carousel_preview_generated ?? 0,
          carrosseisBaixados: tudo ? Math.max(b.carousel_downloads, ev.carousel_export_completed ?? 0) : ev.carousel_export_completed ?? 0,
          sitesPublicados: tudo ? b.active_site_count : ev.site_published ?? 0,
          audios: ev.audio_used ?? 0,
          visitas: u?.site_visits ?? 0,
          cliques: u?.site_clicks ?? 0,
          ativo: b.subscription_status === "active" && Boolean(b.current_period_end) && Date.parse(b.current_period_end!) > Date.now(),
          minutosAtePrimeiraArte: primeira,
        };
      });
  }, [base, uso, periodo]);

  const noGrupo = useMemo(() => (grupo === "ativos" ? clientes.filter((c) => c.ativo) : clientes), [clientes, grupo]);

  const totais = useMemo(() => {
    const soma = (f: (c: Cliente) => number) => clientes.reduce((acc, c) => acc + f(c), 0);
    const comTempo = clientes.filter((c) => (c.uso?.active_seconds ?? 0) > 0);
    const sessoes = comTempo.reduce((acc, c) => acc + (c.uso?.sessions ?? 0), 0);
    const tempo = comTempo.reduce((acc, c) => acc + (c.uso?.active_seconds ?? 0), 0);
    const comSite = clientes.filter((c) => c.uso?.site_avg_seconds);
    return [
      { nome: "Artes geradas", valor: n(soma((c) => c.artes)) },
      { nome: "Artes baixadas", valor: n(soma((c) => c.artesBaixadas)) },
      { nome: "Carrosséis gerados", valor: n(soma((c) => c.carrosseis)) },
      { nome: "Carrosséis baixados", valor: n(soma((c) => c.carrosseisBaixados)) },
      { nome: periodo === "tudo" ? "Sites no ar" : "Sites publicados", valor: n(soma((c) => c.sitesPublicados)) },
      { nome: "Visitas nos sites", valor: n(soma((c) => c.visitas)) },
      { nome: "Cliques nos sites", valor: n(soma((c) => c.cliques)) },
      { nome: "Pedidos pelos sites, desde o início", valor: n(soma((c) => c.leads)) },
      { nome: "Áudios usados", valor: n(soma((c) => c.audios)) },
      { nome: "Tempo médio na Fábrica, por sessão", valor: sessoes ? fmtDuracao(Math.round(tempo / sessoes)) : "-" },
      { nome: "Tempo médio de visita nos sites", valor: comSite.length ? fmtDuracao(Math.round(comSite.reduce((a, c) => a + (c.uso?.site_avg_seconds ?? 0), 0) / comSite.length)) : "-" },
      { nome: "Assinantes em dia", valor: n(clientes.filter((c) => c.ativo).length) },
    ];
  }, [clientes, periodo]);

  const etapas = useMemo(() => {
    const conta = (f: (c: Cliente) => boolean) => noGrupo.filter(f).length;
    const lista = [
      { nome: "Contas no grupo", valor: noGrupo.length },
      { nome: "Abriram a Fábrica", valor: conta((c) => (c.uso?.events?.fabrica_opened ?? 0) > 0) },
      { nome: "Abriram Anúncios", valor: conta((c) => opened(c, "/fabrica/anuncio")) },
      { nome: "Geraram arte", valor: conta((c) => c.artes > 0) },
      { nome: "Baixaram arte", valor: conta((c) => c.artesBaixadas > 0) },
      { nome: "Abriram Carrossel", valor: conta((c) => opened(c, "/fabrica/carrossel")) },
      { nome: "Baixaram carrossel", valor: conta((c) => c.carrosseisBaixados > 0) },
      { nome: "Abriram Site", valor: conta((c) => opened(c, "/fabrica/site")) },
      { nome: periodo === "tudo" ? "Têm site no ar" : "Publicaram site", valor: conta((c) => c.sitesPublicados > 0) },
      { nome: "Site recebeu visita", valor: conta((c) => c.visitas > 0) },
      { nome: "Site recebeu clique", valor: conta((c) => c.cliques > 0) },
    ];
    let pior = -1;
    let maiorQueda = 0;
    lista.forEach((e, i) => {
      if (!i) return;
      const anterior = lista[i - 1].valor;
      const queda = anterior >= 3 ? 1 - e.valor / anterior : 0;
      if (queda > maiorQueda) { maiorQueda = queda; pior = i; }
    });
    return { lista, pior, maiorQueda };
  }, [noGrupo, periodo]);

  const linhas = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    return noGrupo
      .filter((c) => !termo || `${c.email ?? ""} ${c.name ?? ""}`.toLowerCase().includes(termo))
      .sort((a, b) => (b.uso?.last_event_at ?? "").localeCompare(a.uso?.last_event_at ?? ""));
  }, [noGrupo, busca]);

  if (loadingBase || loadingUso) {
    return <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }
  if (errorBase || errorUso) {
    return <p className="py-10 text-center text-sm text-red-600">Não foi possível carregar os dados de uso agora.</p>;
  }

  const topo = etapas.lista[0].valor || 1;
  const gargalo = etapas.pior > 0 ? etapas.lista[etapas.pior] : null;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold">Uso da plataforma</h2>
          <p className="text-sm text-muted-foreground">Dados reais de cada conta. Contas de teste e internas ficam de fora.</p>
        </div>
        <div className="flex gap-1">
          {([["tudo", "Tudo"], ["30", "30 dias"], ["7", "7 dias"]] as [Periodo, string][]).map(([valor, nome]) => (
            <Button key={valor} size="sm" variant={periodo === valor ? "default" : "outline"} onClick={() => setPeriodo(valor)}>{nome}</Button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {totais.map((t) => (
          <div key={t.nome} className="rounded-lg border p-3">
            <p className="text-2xl font-bold">{t.valor}</p>
            <p className="text-sm text-muted-foreground">{t.nome}</p>
          </div>
        ))}
      </div>

      <Card>
        <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-2 space-y-0">
          <CardTitle className="text-lg">Onde as pessoas travam</CardTitle>
          <div className="flex gap-1">
            <Button size="sm" variant={grupo === "ativos" ? "default" : "outline"} onClick={() => setGrupo("ativos")}>Assinantes em dia</Button>
            <Button size="sm" variant={grupo === "todos" ? "default" : "outline"} onClick={() => setGrupo("todos")}>Todas as contas</Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          {gargalo && (
            <p className="flex items-start gap-2 rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900 dark:bg-amber-950/40 dark:text-amber-100">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              Maior queda: de "{etapas.lista[etapas.pior - 1].nome}" para "{gargalo.nome}", perde {Math.round(etapas.maiorQueda * 100)}%.
            </p>
          )}
          {etapas.lista.map((e, i) => (
            <div key={e.nome} className="grid grid-cols-[minmax(0,10rem)_1fr_3rem] items-center gap-2 text-sm">
              <span className={i === etapas.pior ? "font-semibold text-amber-700 dark:text-amber-300" : ""}>{e.nome}</span>
              <div className="h-3 overflow-hidden rounded-full bg-muted">
                <div className={`h-full rounded-full ${i === etapas.pior ? "bg-amber-500" : "bg-primary"}`} style={{ width: `${(e.valor / topo) * 100}%` }} />
              </div>
              <span className="text-right font-semibold">{n(e.valor)}</span>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-2 space-y-0">
          <CardTitle className="text-lg">Cada cliente ({n(linhas.length)})</CardTitle>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Buscar nome ou e-mail" className="pl-8" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cliente</TableHead>
                  <TableHead className="text-right">Artes</TableHead>
                  <TableHead className="text-right">Baixou</TableHead>
                  <TableHead className="text-right">Carrosséis</TableHead>
                  <TableHead className="text-right">Sites</TableHead>
                  <TableHead className="text-right">Visitas</TableHead>
                  <TableHead className="text-right">Cliques</TableHead>
                  <TableHead className="text-right">Tempo</TableHead>
                  <TableHead>Última ação</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {linhas.slice(0, 200).map((c) => (
                  <TableRow key={c.user_id} className="cursor-pointer" onClick={() => setAberto(c)}>
                    <TableCell className="max-w-[16rem]">
                      <p className="truncate font-medium">{c.name || c.email}</p>
                      <p className="truncate text-xs text-muted-foreground">{c.email}</p>
                    </TableCell>
                    <TableCell className="text-right">{n(c.artes)}</TableCell>
                    <TableCell className="text-right">{n(c.artesBaixadas + c.carrosseisBaixados)}</TableCell>
                    <TableCell className="text-right">{n(c.carrosseis)}</TableCell>
                    <TableCell className="text-right">{n(c.active_site_count)}</TableCell>
                    <TableCell className="text-right">{n(c.visitas)}</TableCell>
                    <TableCell className="text-right">{n(c.cliques)}</TableCell>
                    <TableCell className="text-right whitespace-nowrap">{fmtDuracao(c.uso?.active_seconds)}</TableCell>
                    <TableCell className="whitespace-nowrap text-sm">{fmtData(c.uso?.last_event_at)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          {linhas.length > 200 && <p className="mt-2 text-sm text-muted-foreground">Mostrando 200. Use a busca para achar os outros.</p>}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-lg">Como ler estes dados</CardTitle></CardHeader>
        <CardContent>
          <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
            <li>Assinantes em dia: assinatura ativa com validade no futuro. Contas antigas ativas sem data de validade aparecem só em Todas as contas.</li>
            <li>Abertura da Fábrica: contada desde 30/07/2026. Artes geradas: desde 20/08/2026.</li>
            <li>Carrosséis gerados e sites abertos ou publicados por assinantes: contados a partir de 01/11/2026. Antes, só contávamos os downloads e os sites no ar.</li>
            <li>Áudio: contado a partir de 01/11/2026.</li>
            <li>Tempo: aproximado. Soma o intervalo entre as ações na Fábrica, e pausa acima de 15 minutos não conta. Tempo gasto sem nenhuma ação não aparece.</li>
            <li>Cliques nos sites: botão de WhatsApp e botões dos pacotes.</li>
            <li>Visitas e cliques nos sites: não foram registrados de 23/07 a 31/10/2026, por um erro corrigido em 01/11. Zero nesse período não quer dizer que ninguém visitou.</li>
          </ul>
        </CardContent>
      </Card>

      <Dialog open={Boolean(aberto)} onOpenChange={(v) => !v && setAberto(null)}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
          {aberto && (
            <>
              <DialogHeader>
                <DialogTitle className="truncate">{aberto.name || aberto.email}</DialogTitle>
                <p className="truncate text-sm text-muted-foreground">{aberto.email}</p>
              </DialogHeader>
              <div className="flex flex-wrap gap-2">
                <Badge variant={aberto.ativo ? "default" : "outline"}>{aberto.ativo ? aberto.plan_name : "Sem assinatura ativa"}</Badge>
                {aberto.plan_value && aberto.ativo && <Badge variant="secondary">{aberto.plan_value}</Badge>}
                {aberto.utm_source && <Badge variant="outline">Origem: {aberto.utm_source}</Badge>}
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                {[
                  ["Conta criada", fmtData(aberto.created_at)],
                  ["Última ação", fmtData(aberto.uso?.last_event_at)],
                  ["Primeira vez na Fábrica", fmtData(aberto.uso?.first_fabrica_at)],
                  ["Primeira arte", fmtData(aberto.uso?.first_art_at)],
                  ["Até a primeira arte", aberto.minutosAtePrimeiraArte === null ? "-" : aberto.minutosAtePrimeiraArte === 0 ? "menos de 1 min" : fmtDuracao(aberto.minutosAtePrimeiraArte * 60)],
                  ["Sessões", n(aberto.uso?.sessions ?? 0)],
                  ["Tempo total aproximado", fmtDuracao(aberto.uso?.active_seconds)],
                  ["Artes geradas / baixadas", `${n(aberto.artes)} / ${n(aberto.artesBaixadas)}`],
                  ["Carrosséis gerados / baixados", `${n(aberto.carrosseis)} / ${n(aberto.carrosseisBaixados)}`],
                  ["Sites no ar", n(aberto.active_site_count)],
                  ["Visitas / cliques no site", `${n(aberto.visitas)} / ${n(aberto.cliques)}`],
                  ["Visita média no site", fmtDuracao(aberto.uso?.site_avg_seconds)],
                  ["Pedidos pelo site", n(aberto.leads)],
                  ["Áudios usados", n(aberto.audios)],
                ].map(([rotulo, valor]) => (
                  <div key={rotulo} className="rounded-lg border p-2">
                    <p className="text-xs text-muted-foreground">{rotulo}</p>
                    <p className="font-semibold">{valor}</p>
                  </div>
                ))}
              </div>
              <Lista titulo="Telas abertas" dados={aberto.uso?.screens} nomes={TELAS} />
              <Lista titulo="O que fez" dados={aberto.uso?.events} nomes={EVENTOS} />
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Lista({ titulo, dados, nomes }: { titulo: string; dados?: Record<string, number>; nomes: Record<string, string> }) {
  const itens = Object.entries(dados ?? {}).sort((a, b) => b[1] - a[1]);
  if (!itens.length) return null;
  return (
    <div>
      <p className="mb-1 font-semibold">{titulo}</p>
      <div className="space-y-1">
        {itens.map(([chave, valor]) => (
          <div key={chave} className="flex justify-between gap-2 border-b py-1 text-sm">
            <span className="truncate">{nomes[chave] ?? chave}</span>
            <span className="font-semibold">{n(valor)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
