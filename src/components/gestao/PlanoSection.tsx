import { useCallback, useEffect, useMemo, useState } from "react";
import { AlertTriangle, CheckCircle2, CircleDashed, ExternalLink, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FunilQuizCard } from "@/components/gestao/FunilQuizCard";
import { InicioTesteCard } from "@/components/gestao/InicioTesteCard";
import { supabase } from "@/integrations/supabase/client";
import { SUPABASE_PUBLIC_KEY, SUPABASE_PUBLIC_URL } from "@/lib/supabase-public";
import {
  AUTOMACOES, CHECKLIST, ENVIOS, FASES, FEITO, LINKS, META, NAO_TESTADO, NOVE_QUADROS, PLANO_ATUALIZADO_EM, PROXIMOS_PASSOS, STATUS_GERAL,
} from "@/lib/gestao-plano";

type SentEmail = { email: string; kind: string; sent_at: string; unsubscribed: boolean };
type Lead = { stage: string; subscribed: boolean };
type Assinatura = { status: string; created_at: string; current_period_end: string | null };

async function rest<T>(path: string, init?: RequestInit): Promise<T> {
  const { data: { session } } = await supabase.auth.getSession();
  const res = await fetch(`${SUPABASE_PUBLIC_URL}/rest/v1/${path}`, {
    ...init,
    headers: {
      apikey: SUPABASE_PUBLIC_KEY,
      Authorization: `Bearer ${session?.access_token || SUPABASE_PUBLIC_KEY}`,
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const text = await res.text();
  return (text ? JSON.parse(text) : null) as T;
}

const STATUS_ICON = {
  ok: <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />,
  atencao: <AlertTriangle className="h-5 w-5 shrink-0 text-amber-500" />,
  problema: <XCircle className="h-5 w-5 shrink-0 text-red-600" />,
};
const QUADRO_COR = {
  pronto: "border-emerald-300 bg-emerald-50 text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-100",
  parcial: "border-amber-300 bg-amber-50 text-amber-900 dark:bg-amber-950/40 dark:text-amber-100",
  falta: "border-red-300 bg-red-50 text-red-900 dark:bg-red-950/40 dark:text-red-100",
};
const QUADRO_NOME = { pronto: "Pronto", parcial: "Em parte", falta: "Falta" };

/** Painel do projeto: onde estamos, próximos passos, e-mails, estratégia e checklist. */
export function PlanoSection() {
  const [sent, setSent] = useState<SentEmail[] | null>(null);
  const [leads, setLeads] = useState<Lead[] | null>(null);
  const [assinaturas, setAssinaturas] = useState<Assinatura[] | null>(null);
  const [marked, setMarked] = useState<Record<string, boolean>>({});
  const [saveError, setSaveError] = useState(false);

  const load = useCallback(async () => {
    const [s, l, c, a] = await Promise.all([
      rest<SentEmail[]>("rpc/admin_recovery_emails", { method: "POST", body: "{}" }).catch(() => null),
      rest<Lead[]>("rpc/admin_funnel_leads", { method: "POST", body: "{}" }).catch(() => null),
      rest<{ id: string; done: boolean }[]>("gestao_checklist?select=id,done").catch(() => null),
      rest<Assinatura[]>("subscriptions?select=status,created_at,current_period_end&limit=5000").catch(() => null),
    ]);
    setSent(s);
    setLeads(l);
    setAssinaturas(a);
    if (c) setMarked(Object.fromEntries(c.map((row) => [row.id, row.done])));
  }, []);

  useEffect(() => { void load(); }, [load]);

  const toggle = async (id: string, done: boolean) => {
    setMarked((m) => ({ ...m, [id]: done }));
    try {
      await rest("gestao_checklist?on_conflict=id", {
        method: "POST",
        headers: { Prefer: "resolution=merge-duplicates,return=minimal" },
        body: JSON.stringify({ id, done, updated_at: new Date().toISOString() }),
      });
      setSaveError(false);
    } catch (err) {
      console.error("[Plano]", err);
      setSaveError(true);
    }
  };

  const isDone = useCallback(
    (item: { id: string; feito?: boolean }) => marked[item.id] ?? Boolean(item.feito),
    [marked],
  );

  const sentByKind = useMemo(() => {
    const map = new Map<string, number>();
    for (const row of sent ?? []) map.set(row.kind, (map.get(row.kind) ?? 0) + 1);
    return map;
  }, [sent]);

  const counts = useMemo(() => {
    const list = leads ?? [];
    const by = (stages: string[]) => list.filter((l) => stages.includes(l.stage)).length;
    return [
      { nome: "Só deixou o e-mail", valor: by(["email", "quiz_iniciado"]) },
      { nome: "Terminou o quiz", valor: by(["quiz_concluido", "checkout_aberto"]) },
      { nome: "Abriu o pagamento", valor: by(["pix_gerado", "cartao_aberto"]) },
      { nome: "Pagou", valor: by(["pagou"]) },
      { nome: "E-mails enviados", valor: sent?.length ?? 0 },
      { nome: "Pediram para sair", valor: new Set((sent ?? []).filter((s) => s.unsubscribed).map((s) => s.email)).size },
    ];
  }, [leads, sent]);

  const meta = useMemo(() => {
    if (!assinaturas) return null;
    const emDia = assinaturas.filter((a) => a.status === "active" && a.current_period_end && Date.parse(a.current_period_end) > Date.now());
    return { emDia: emDia.length, novas: emDia.filter((a) => Date.parse(a.created_at) >= Date.parse(META.inicio)).length };
  }, [assinaturas]);

  const total = CHECKLIST.flatMap((g) => g.itens);
  const totalDone = total.filter(isDone).length;
  const today = new Date().toISOString().slice(0, 10);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Plano do projeto</h2>
        <p className="text-sm text-muted-foreground">
          Atualizado em {PLANO_ATUALIZADO_EM}. Checklist: {totalDone} de {total.length} feitos.
        </p>
      </div>

      <Card className="border-primary">
        <CardHeader><CardTitle className="text-lg">{META.titulo}</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <span className="text-3xl font-bold">{meta?.novas ?? "–"} de {META.alvo}</span>
              <span className="text-sm text-muted-foreground">Em dia agora: {meta?.emDia ?? "–"} (eram {META.emDiaNoInicio})</span>
            </div>
            <div className="mt-2 h-3 overflow-hidden rounded-full bg-muted">
              <div className="h-full rounded-full bg-primary" style={{ width: `${Math.min(100, ((meta?.novas ?? 0) / META.alvo) * 100)}%` }} />
            </div>
            <p className="mt-2 text-sm text-muted-foreground">{META.regra}</p>
            <p className="mt-1 text-sm text-muted-foreground">{META.ritmo}</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {META.caminhos.map((c) => (
              <div key={c.nome} className="rounded-lg border p-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-semibold leading-tight">{c.nome}</p>
                  <Badge variant="outline" className="shrink-0">{c.alvo}</Badge>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{c.como}</p>
              </div>
            ))}
          </div>
          <p className="text-sm text-muted-foreground">{META.aviso}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-lg">Onde estamos</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {STATUS_GERAL.map((s) => (
            <div key={s.area} className="flex items-start gap-3">
              {STATUS_ICON[s.estado]}
              <div>
                <p className="font-medium leading-tight">{s.area}</p>
                <p className="text-sm text-muted-foreground">{s.detalhe}</p>
              </div>
            </div>
          ))}
          <div className="flex flex-wrap gap-2 pt-2">
            {LINKS.map((l) => (
              <a key={l.url} href={l.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 rounded-full border px-3 py-1 text-sm hover:bg-muted">
                {l.nome} <ExternalLink className="h-3.5 w-3.5" />
              </a>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-lg">Próximos passos, em ordem</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          {PROXIMOS_PASSOS.map((p, i) => (
            <div key={p.oque} className="flex gap-3">
              <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-primary text-sm font-bold text-primary-foreground">{i + 1}</span>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-semibold">{p.quando}</span>
                  <Badge variant={p.quem === "Lucas" ? "default" : "secondary"}>{p.quem}</Badge>
                </div>
                <p className="mt-1 leading-snug">{p.oque}</p>
                <p className="text-sm text-muted-foreground">{p.porque}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-lg">Números de agora</CardTitle></CardHeader>
        <CardContent>
          {leads === null && sent === null ? (
            <p className="text-sm text-muted-foreground">Não foi possível carregar os números agora.</p>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {counts.map((c) => (
                <div key={c.nome} className="rounded-lg border p-3">
                  <p className="text-2xl font-bold">{c.valor}</p>
                  <p className="text-sm text-muted-foreground">{c.nome}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <FunilQuizCard />

      <InicioTesteCard />

      <Card>
        <CardHeader><CardTitle className="text-lg">O que está sendo enviado</CardTitle></CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-2">
            {AUTOMACOES.map((a) => (
              <div key={a.nome}>
                <p className="font-medium leading-tight">{a.nome}</p>
                <p className="text-sm text-muted-foreground">{a.como}</p>
              </div>
            ))}
          </div>
          <div className="space-y-2">
            <p className="font-semibold">Calendário da Black Vitalícia, às 9h15</p>
            {ENVIOS.map((e) => {
              const qtd = sentByKind.get(e.kind) ?? 0;
              return (
                <div key={e.kind} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border p-3">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold">{e.data} · {e.publico}</p>
                    <p className="text-sm text-muted-foreground">{e.assunto}</p>
                  </div>
                  <Badge variant={qtd ? "default" : "outline"}>
                    {qtd ? `${qtd} enviados` : e.iso > today ? "Agendado" : "Sem envios"}
                  </Badge>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-lg">Estratégia de relançamento</CardTitle></CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2">
          {FASES.map((f) => (
            <div key={f.titulo} className="rounded-lg border p-4">
              <p className="font-semibold leading-tight">{f.titulo}</p>
              <p className="text-sm text-muted-foreground">{f.periodo}</p>
              <p className="mt-2 text-sm font-medium">{f.objetivo}</p>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
                {f.acoes.map((a) => <li key={a}>{a}</li>)}
              </ul>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-lg">Plano em 1 página</CardTitle></CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-3">
          {NOVE_QUADROS.map((q) => (
            <div key={q.titulo} className={`rounded-lg border p-3 ${QUADRO_COR[q.estado]}`}>
              <p className="text-xs font-semibold uppercase tracking-wide opacity-70">{q.fase} · {QUADRO_NOME[q.estado]}</p>
              <p className="font-semibold leading-tight">{q.titulo}</p>
              <p className="mt-1 text-sm">{q.texto}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-lg">Checklist</CardTitle></CardHeader>
        <CardContent className="space-y-5">
          {saveError && <p className="text-sm text-red-600">Não consegui salvar a última marcação. Tente de novo.</p>}
          {CHECKLIST.map((grupo) => (
            <div key={grupo.titulo}>
              <p className="mb-2 font-semibold">{grupo.titulo}</p>
              <div className="space-y-2">
                {grupo.itens.map((item) => (
                  <label key={item.id} className="flex cursor-pointer items-start gap-3 rounded-lg border p-3">
                    <input
                      type="checkbox"
                      className="mt-0.5 h-5 w-5 shrink-0 accent-primary"
                      checked={isDone(item)}
                      onChange={(e) => void toggle(item.id, e.target.checked)}
                    />
                    <span className="min-w-0 flex-1">
                      <span className={`block leading-snug ${isDone(item) ? "text-muted-foreground line-through" : ""}`}>{item.texto}</span>
                      {item.nota && <span className="block text-sm text-muted-foreground">{item.nota}</span>}
                    </span>
                    <Badge variant={item.quem === "Lucas" ? "default" : "secondary"} className="shrink-0">{item.quem}</Badge>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-lg">O que já foi feito</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {FEITO.map((f) => (
              <div key={f.data}>
                <p className="font-semibold">{f.data}</p>
                <ul className="mt-1 space-y-1.5">
                  {f.itens.map((i) => (
                    <li key={i} className="flex gap-2 text-sm"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" /> {i}</li>
                  ))}
                </ul>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-lg">O que ainda não foi testado</CardTitle></CardHeader>
          <CardContent>
            <ul className="space-y-1.5">
              {NAO_TESTADO.map((i) => (
                <li key={i} className="flex gap-2 text-sm"><CircleDashed className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" /> {i}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
