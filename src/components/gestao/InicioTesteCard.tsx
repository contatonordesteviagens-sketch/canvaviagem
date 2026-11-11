import { Skeleton } from "@/components/ui/skeleton";
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { useAdminUserIntelligence } from "@/hooks/useAdminUserIntelligence";
import { ARTE_SHARE, type InicioStep, type InicioVariant } from "@/lib/inicio-teste";

type Evento = {
  session_id: string;
  user_id: string | null;
  created_at: string;
  event_data: { variant?: InicioVariant; step?: InicioStep; manual?: boolean };
};

const PAGE = 1000;
const ETAPAS: { step: InicioStep; nome: string; soArte?: boolean }[] = [
  { step: "visita", nome: "Visitas" },
  { step: "destino", nome: "Escolheram o destino", soArte: true },
  { step: "logo", nome: "Enviaram a logo", soArte: true },
  { step: "artes", nome: "Viram as artes", soArte: true },
  { step: "quiz", nome: "Abriram o quiz" },
  { step: "conta", nome: "Criaram conta" },
];

const pct = (parte: number, total: number) => (total ? `${Math.round((parte / total) * 100)}%` : "–");

/** Comparação da /inicio com a arte e da página atual, por visitante. Quem escolheu o grupo pelo link fica fora. */
export function InicioTesteCard() {
  const { data: eventos, isLoading } = useQuery({
    queryKey: ["inicio-teste"],
    queryFn: async () => {
      const todos: Evento[] = [];
      for (let from = 0; ; from += PAGE) {
        const { data, error } = await supabase
          .from("analytics_events")
          .select("session_id,user_id,created_at,event_data")
          .eq("event_type", "inicio_teste")
          .order("created_at")
          .range(from, from + PAGE - 1);
        if (error) throw error;
        todos.push(...((data ?? []) as unknown as Evento[]));
        if ((data?.length ?? 0) < PAGE) return todos;
      }
    },
  });
  const { data: usuarios } = useAdminUserIntelligence();

  const linhas = useMemo(() => {
    const validos = (eventos ?? []).filter((e) => !e.event_data?.manual);
    const sessoes = (variant: InicioVariant, step: InicioStep) =>
      new Set(validos.filter((e) => e.event_data?.variant === variant && e.event_data?.step === step).map((e) => e.session_id)).size;
    const assinantes = new Map((usuarios ?? [])
      .filter((u) => u.subscription_status === "active" && u.current_period_end && Date.parse(u.current_period_end) > Date.now())
      .map((u) => [u.user_id, Date.parse(u.created_at)]));
    // Só conta assinatura de conta criada durante o teste: cliente antigo que passou pela página não muda o resultado.
    const assinaram = (variant: InicioVariant) =>
      new Set(validos.filter((e) => {
        const criada = e.user_id ? assinantes.get(e.user_id) : undefined;
        return e.event_data?.variant === variant && e.event_data?.step === "conta" && criada !== undefined && criada >= Date.parse(e.created_at) - 3_600_000;
      }).map((e) => e.user_id)).size;
    return {
      etapas: ETAPAS.map((e) => ({ ...e, arte: sessoes("arte", e.step), atual: sessoes("atual", e.step) })),
      arte: { visitas: sessoes("arte", "visita"), assinaram: assinaram("arte") },
      atual: { visitas: sessoes("atual", "visita"), assinaram: assinaram("atual") },
    };
  }, [eventos, usuarios]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Teste da /inicio: arte na primeira página x página atual</CardTitle>
        <p className="text-sm text-muted-foreground">
          {ARTE_SHARE > 0
            ? `${Math.round(ARTE_SHARE * 100)}% dos visitantes novos veem a arte. Pouca gente em cada grupo ainda não permite concluir nada.`
            : "Sorteio desligado: todos os visitantes veem a página atual. A página com a arte só abre pelo link com ?arte=1."}
        </p>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2" aria-busy="true">{[0, 1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-9 w-full" />)}</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Etapa</TableHead>
                <TableHead className="text-right">Com a arte</TableHead>
                <TableHead className="text-right">Página atual</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {linhas.etapas.map((e) => (
                <TableRow key={e.step}>
                  <TableCell>{e.nome}</TableCell>
                  <TableCell className="text-right">{e.arte} <span className="text-muted-foreground">({pct(e.arte, linhas.arte.visitas)})</span></TableCell>
                  <TableCell className="text-right">{e.soArte ? "–" : <>{e.atual} <span className="text-muted-foreground">({pct(e.atual, linhas.atual.visitas)})</span></>}</TableCell>
                </TableRow>
              ))}
              <TableRow className="font-semibold">
                <TableCell>Assinaram</TableCell>
                <TableCell className="text-right">{linhas.arte.assinaram} <span className="font-normal text-muted-foreground">({pct(linhas.arte.assinaram, linhas.arte.visitas)})</span></TableCell>
                <TableCell className="text-right">{linhas.atual.assinaram} <span className="font-normal text-muted-foreground">({pct(linhas.atual.assinaram, linhas.atual.visitas)})</span></TableCell>
              </TableRow>
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
