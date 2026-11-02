import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { useAdminUserIntelligence } from "@/hooks/useAdminUserIntelligence";

type Evento = {
  session_id: string;
  user_id: string | null;
  created_at: string;
  event_data: { step?: string; manual?: boolean; origem?: string; tela?: string; valor?: string };
};

const PAGE = 1000;
// O rastreamento completo começou aqui: antes disso, as etapas novas não existiam e pareceriam abandono.
const FUNIL_DESDE = "2026-11-02T18:45:00Z";

const ETAPAS: { nome: string; step: string; tela?: string }[] = [
  { nome: "Visitou a página", step: "visita" },
  { nome: "Escolheu o destino", step: "destino" },
  { nome: "Viu as artes", step: "artes" },
  { nome: "Clicou para usar", step: "botao" },
  { nome: "Viu a tela de e-mail", step: "tela_email" },
  { nome: "Enviou o e-mail", step: "email" },
  { nome: "Abriu o quiz", step: "quiz_tela", tela: "intro" },
  { nome: "O que mudariam mais vendas", step: "quiz_tela", tela: "objetivo" },
  { nome: "Como cria os posts", step: "quiz_tela", tela: "ferramenta" },
  { nome: "Maior desafio", step: "quiz_tela", tela: "desafio" },
  { nome: "Em que momento está", step: "quiz_tela", tela: "momento" },
  { nome: "Orçamentos por semana", step: "quiz_tela", tela: "orcamentos" },
  { nome: "Destinos que vende", step: "quiz_tela", tela: "destinos" },
  { nome: "Viu o diagnóstico", step: "quiz_tela", tela: "result" },
  { nome: "Viu os planos", step: "quiz_tela", tela: "offer" },
  { nome: "Clicou em pagar", step: "pagar" },
];

const pct = (parte: number, total: number) => (total ? `${Math.round((parte / total) * 100)}%` : "–");

/** Por onde cada visitante passou, da página até o pagamento, para ver onde as pessoas desistem. */
export function FunilQuizCard() {
  const [soAnuncios, setSoAnuncios] = useState(false);
  const { data: eventos, isLoading } = useQuery({
    queryKey: ["funil-quiz"],
    queryFn: async () => {
      const todos: Evento[] = [];
      for (let from = 0; ; from += PAGE) {
        const { data, error } = await supabase
          .from("analytics_events")
          .select("session_id,user_id,created_at,event_data")
          .eq("event_type", "inicio_teste")
          .gte("created_at", FUNIL_DESDE)
          .order("created_at")
          .range(from, from + PAGE - 1);
        if (error) throw error;
        todos.push(...((data ?? []) as unknown as Evento[]));
        if ((data?.length ?? 0) < PAGE) return todos;
      }
    },
  });
  const { data: usuarios } = useAdminUserIntelligence();

  const { linhas, maiorPerda, assinaram, respostas } = useMemo(() => {
    const validos = (eventos ?? []).filter((e) => !e.event_data?.manual);
    const anuncio = new Set(validos.filter((e) => e.event_data?.step === "visita" && e.event_data?.origem === "meta").map((e) => e.session_id));
    const lista = soAnuncios ? validos.filter((e) => anuncio.has(e.session_id)) : validos;
    const linhas = ETAPAS.map((etapa, i) => ({
      ...etapa,
      key: `${etapa.step}-${etapa.tela ?? i}`,
      total: new Set(lista.filter((e) => e.event_data?.step === etapa.step && (!etapa.tela || e.event_data?.tela === etapa.tela)).map((e) => e.session_id)).size,
    }));
    let maiorPerda = -1;
    let perda = 0;
    linhas.forEach((linha, i) => {
      const lost = i ? linhas[i - 1].total - linha.total : 0;
      if (lost > perda) { perda = lost; maiorPerda = i; }
    });
    const assinantes = new Map((usuarios ?? [])
      .filter((u) => u.subscription_status === "active" && u.current_period_end && Date.parse(u.current_period_end) > Date.now())
      .map((u) => [u.user_id, Date.parse(u.created_at)]));
    const assinaram = new Set(lista.filter((e) => {
      const criada = e.user_id ? assinantes.get(e.user_id) : undefined;
      return criada !== undefined && criada >= Date.parse(FUNIL_DESDE);
    }).map((e) => e.user_id)).size;
    const porTela = new Map<string, Map<string, Set<string>>>();
    lista.filter((e) => e.event_data?.step === "resposta" && e.event_data.tela && e.event_data.valor).forEach((e) => {
      const tela = porTela.get(e.event_data.tela!) ?? new Map<string, Set<string>>();
      const sessoes = tela.get(e.event_data.valor!) ?? new Set<string>();
      sessoes.add(e.session_id);
      tela.set(e.event_data.valor!, sessoes);
      porTela.set(e.event_data.tela!, tela);
    });
    const respostas = ETAPAS.filter((e) => e.tela && porTela.has(e.tela)).map((e) => ({
      nome: e.nome,
      valores: [...porTela.get(e.tela!)!.entries()].map(([valor, s]) => ({ valor, total: s.size })).sort((a, b) => b.total - a.total),
    }));
    return { linhas, maiorPerda, assinaram, respostas };
  }, [eventos, usuarios, soAnuncios]);

  const visitas = linhas[0]?.total ?? 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Onde as pessoas desistem</CardTitle>
        <p className="text-sm text-muted-foreground">Cada visitante conta uma vez por etapa, desde 02/11. Testes do Lucas ficam fora. A linha em vermelho é onde mais gente saiu.</p>
        <div className="flex gap-2 pt-1">
          <Button size="sm" variant={soAnuncios ? "outline" : "default"} onClick={() => setSoAnuncios(false)}>Todos</Button>
          <Button size="sm" variant={soAnuncios ? "default" : "outline"} onClick={() => setSoAnuncios(true)}>Só anúncios do Meta</Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {isLoading ? (
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Etapa</TableHead>
                <TableHead className="text-right">Pessoas</TableHead>
                <TableHead className="text-right">Das visitas</TableHead>
                <TableHead className="text-right">Saíram aqui</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {linhas.map((linha, i) => {
                const lost = i ? linhas[i - 1].total - linha.total : 0;
                return (
                  <TableRow key={linha.key} className={i === maiorPerda ? "bg-red-50 font-semibold text-red-800 dark:bg-red-950/40 dark:text-red-200" : ""}>
                    <TableCell>{linha.nome}</TableCell>
                    <TableCell className="text-right">{linha.total}</TableCell>
                    <TableCell className="text-right">{pct(linha.total, visitas)}</TableCell>
                    <TableCell className="text-right">{lost > 0 ? lost : "–"}</TableCell>
                  </TableRow>
                );
              })}
              <TableRow className="font-semibold">
                <TableCell>Assinaram (conta nova)</TableCell>
                <TableCell className="text-right">{assinaram}</TableCell>
                <TableCell className="text-right">{pct(assinaram, visitas)}</TableCell>
                <TableCell className="text-right">–</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        )}
        {respostas.length > 0 && (
          <div className="space-y-3">
            <p className="font-semibold">O que as pessoas responderam</p>
            <div className="grid gap-3 sm:grid-cols-2">
              {respostas.map((r) => (
                <div key={r.nome} className="rounded-lg border p-3">
                  <p className="text-sm font-semibold">{r.nome}</p>
                  <ul className="mt-1 space-y-0.5 text-sm text-muted-foreground">
                    {r.valores.map((v) => <li key={v.valor} className="flex justify-between gap-3"><span>{v.valor}</span><span>{v.total}</span></li>)}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
