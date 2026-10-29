import { useCallback, useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, LifeBuoy, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { SUPABASE_PUBLIC_KEY, SUPABASE_PUBLIC_URL } from "@/lib/supabase-public";
import { useToast } from "@/hooks/use-toast";

type Lead = {
  email: string;
  user_id: string | null;
  stage: "email" | "quiz_iniciado" | "quiz_concluido" | "checkout_aberto" | "pix_gerado" | "cartao_aberto" | "pagou";
  quiz_steps: number;
  plan_selected: string | null;
  pix_status: string | null;
  pix_plan: string | null;
  pix_value_cents: number | null;
  pix_created_at: string | null;
  card_status: string | null;
  card_plan: string | null;
  card_created_at: string | null;
  card_recovery_url: string | null;
  subscribed: boolean;
  first_seen_at: string | null;
  last_activity_at: string | null;
};
type SentEmail = { email: string; kind: string; sent_at: string; unsubscribed: boolean };

const TABS: { id: string; label: string; stages: Lead["stage"][] }[] = [
  { id: "pix", label: "Gerou Pix e não pagou", stages: ["pix_gerado"] },
  { id: "cartao", label: "Abriu o cartão e não pagou", stages: ["cartao_aberto"] },
  { id: "quiz", label: "Terminou o quiz e não pagou", stages: ["quiz_concluido", "checkout_aberto"] },
  { id: "email", label: "Só deixou o e-mail", stages: ["email", "quiz_iniciado"] },
  { id: "pagou", label: "Pagou", stages: ["pagou"] },
];

const KIND_LABEL: Record<string, string> = { pronta: "1 · conta pronta", desconto: "2 · desconto 20%", contato: "3 · tentando falar" };
const PLAN: Record<string, string> = { monthly: "Mensal", semiannual: "Semestral", annual: "Anual" };
const fmt = (iso: string | null) => (iso ? new Date(iso).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" }) : "—");

async function rpc<T>(name: string): Promise<T> {
  const { data: { session } } = await supabase.auth.getSession();
  const res = await fetch(`${SUPABASE_PUBLIC_URL}/rest/v1/rpc/${name}`, {
    method: "POST",
    headers: {
      apikey: SUPABASE_PUBLIC_KEY,
      Authorization: `Bearer ${session?.access_token || SUPABASE_PUBLIC_KEY}`,
      "Content-Type": "application/json",
    },
    body: "{}",
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json() as Promise<T>;
}

/**
 * Recuperação de vendas: quem parou em cada etapa (Pix, cartão, quiz, só e-mail),
 * quais e-mails de recuperação já recebeu, exportação CSV e sincronização com a Woovi.
 * Lê admin_funnel_leads() e admin_recovery_emails() (só admin enxerga).
 */
export function RecoveryCard() {
  const [leads, setLeads] = useState<Lead[] | null>(null);
  const [sent, setSent] = useState<SentEmail[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState("pix");
  const [syncing, setSyncing] = useState(false);
  const { toast } = useToast();

  const load = useCallback(async () => {
    try {
      const [l, s] = await Promise.all([
        rpc<Lead[]>("admin_funnel_leads"),
        rpc<SentEmail[]>("admin_recovery_emails").catch(() => [] as SentEmail[]),
      ]);
      setLeads(Array.isArray(l) ? l : []);
      setSent(Array.isArray(s) ? s : []);
      setError(null);
    } catch (err) {
      console.error("[Recovery]", err);
      setError("O funil ainda não está disponível no servidor (migrações 20261030100000 e 20261030110000 pendentes).");
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const sentByEmail = useMemo(() => {
    const map = new Map<string, SentEmail[]>();
    for (const s of sent) map.set(s.email, [...(map.get(s.email) ?? []), s]);
    return map;
  }, [sent]);

  const counts = useMemo(() => Object.fromEntries(TABS.map((t) => [t.id, leads?.filter((l) => t.stages.includes(l.stage)).length ?? 0])), [leads]);
  const current = TABS.find((t) => t.id === tab)!;
  const rows = useMemo(() => leads?.filter((l) => current.stages.includes(l.stage)) ?? [], [leads, current]);

  const sync = async () => {
    setSyncing(true);
    try {
      const { data, error: fnError } = await supabase.functions.invoke("woovi-sync-charges", { body: { days: 60 } });
      if (fnError || data?.error) throw new Error(data?.error || fnError?.message);
      toast({ title: "Woovi sincronizada", description: `${data.saved} cobranças do Canva Viagem atualizadas.` });
      await load();
    } catch (err) {
      toast({ title: "Não deu para sincronizar", description: (err as Error).message, variant: "destructive" });
    } finally {
      setSyncing(false);
    }
  };

  const exportCsv = () => {
    if (!rows.length) return;
    const header = "email,etapa,plano,pix_status,pix_criado,cartao_status,cartao_criado,link_recuperacao_cartao,emails_recebidos,descadastrou,ultima_atividade";
    const lines = rows.map((r) => {
      const got = sentByEmail.get(r.email) ?? [];
      return [
        r.email, r.stage, PLAN[r.pix_plan ?? r.card_plan ?? r.plan_selected ?? ""] ?? "",
        r.pix_status ?? "", r.pix_created_at ?? "", r.card_status ?? "", r.card_created_at ?? "", r.card_recovery_url ?? "",
        got.map((g) => g.kind).join("|"), got.some((g) => g.unsubscribed) ? "sim" : "nao", r.last_activity_at ?? "",
      ].map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",");
    });
    const blob = new Blob(["﻿" + [header, ...lines].join("\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `recuperacao_${current.id}_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: `${rows.length} contatos exportados`, description: "Importe na lista da Brevo para campanhas." });
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <LifeBuoy className="h-4 w-4" /> Recuperação de vendas (quem não terminou a compra)
          </CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={sync} disabled={syncing}>
              <RefreshCw className={`mr-2 h-4 w-4 ${syncing ? "animate-spin" : ""}`} /> Sincronizar Woovi
            </Button>
            <Button variant="outline" size="sm" onClick={exportCsv} disabled={!rows.length}>
              <Download className="mr-2 h-4 w-4" /> Exportar CSV
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {error ? (
          <p className="text-sm text-muted-foreground">{error}</p>
        ) : leads === null ? (
          <p className="text-sm text-muted-foreground">Carregando…</p>
        ) : (
          <>
            <div className="flex flex-wrap gap-2">
              {TABS.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTab(t.id)}
                  className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${tab === t.id ? "border-primary bg-primary text-primary-foreground" : "hover:bg-muted"}`}
                >
                  {t.label} <span className="ml-1 opacity-70">{counts[t.id]}</span>
                </button>
              ))}
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              E-mails automáticos: 1 hora depois (conta pronta), 3º dia (20% no WhatsApp) e 7º dia (tentando falar). Só para quem gerou Pix ou abriu o cartão e não pagou.
            </p>
            <div className="mt-3 max-h-[420px] overflow-auto rounded-lg border">
              <table className="w-full text-left text-xs">
                <thead className="sticky top-0 bg-muted">
                  <tr>
                    <th className="px-3 py-2 font-semibold">E-mail</th>
                    <th className="px-3 py-2 font-semibold">Plano</th>
                    <th className="px-3 py-2 font-semibold">Pix</th>
                    <th className="px-3 py-2 font-semibold">Cartão</th>
                    <th className="px-3 py-2 font-semibold">E-mails recebidos</th>
                    <th className="px-3 py-2 font-semibold">Última atividade</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.length === 0 ? (
                    <tr><td colSpan={6} className="px-3 py-6 text-center text-muted-foreground">Ninguém nesta etapa.</td></tr>
                  ) : rows.map((r) => {
                    const got = sentByEmail.get(r.email) ?? [];
                    return (
                      <tr key={r.email} className="border-t">
                        <td className="px-3 py-2 font-medium">{r.email}</td>
                        <td className="px-3 py-2">{PLAN[r.pix_plan ?? r.card_plan ?? r.plan_selected ?? ""] ?? "—"}</td>
                        <td className="px-3 py-2">{r.pix_status ? `${r.pix_status === "COMPLETED" ? "pago" : r.pix_status === "EXPIRED" ? "expirou" : "aguardando"} · ${fmt(r.pix_created_at)}` : "—"}</td>
                        <td className="px-3 py-2">
                          {r.card_status ? `${r.card_status === "completed" ? "pago" : r.card_status === "expired" ? "abandonou" : "aberto"} · ${fmt(r.card_created_at)}` : "—"}
                          {r.card_recovery_url && <a href={r.card_recovery_url} target="_blank" rel="noopener noreferrer" className="ml-1 text-primary underline">link</a>}
                        </td>
                        <td className="px-3 py-2">
                          {got.length ? got.map((g) => KIND_LABEL[g.kind] ?? g.kind).join(", ") : "—"}
                          {got.some((g) => g.unsubscribed) && <span className="ml-1 text-orange-600">(saiu da lista)</span>}
                        </td>
                        <td className="px-3 py-2 text-muted-foreground">{fmt(r.last_activity_at)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
