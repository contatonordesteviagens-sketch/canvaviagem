import { useState } from "react";
import { useAdminUserIntelligence } from "@/hooks/useAdminUserIntelligence";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Loader2, ExternalLink, Globe, PauseCircle, PlayCircle,
  ChevronDown, ChevronRight, Eye, MousePointerClick, Users, UserCheck,
} from "lucide-react";
import { DeleteConfirmDialog } from "./DeleteConfirmDialog";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

// ─── Tipos ───────────────────────────────────────────────────────────────────

type SiteMetrics = {
  visits: number;
  clicks: number;
  total_leads: number;
  contacted_leads: number;
};

// ─── Hook: busca métricas de um site específico ───────────────────────────────

const useSiteMetrics = (siteId: string | null, ownerId: string | null) =>
  useQuery<SiteMetrics>({
    queryKey: ["site-metrics", siteId],
    enabled: !!siteId && !!ownerId,
    staleTime: 60_000,
    queryFn: async () => {
      if (!siteId || !ownerId) return { visits: 0, clicks: 0, total_leads: 0, contacted_leads: 0 };

      const [eventsRes, leadsRes, contactedRes] = await Promise.all([
        // Visitas e cliques do site via analytics_events
        supabase
          .from("analytics_events")
          .select("event_type")
          .eq("user_id", ownerId)
          .contains("event_data", { site_id: siteId }),

        // Total de leads capturados pelo site
        supabase
          .from("crm_form_submissions")
          .select("id", { count: "exact", head: true })
          .eq("form_id", siteId),

        // Leads que já foram contatados (status != 'novo')
        supabase
          .from("crm_form_submissions")
          .select("id", { count: "exact", head: true })
          .eq("form_id", siteId)
          .neq("status", "novo"),
      ]);

      const events = eventsRes.data || [];
      const visits = events.filter((e) => e.event_type === "page_view").length;
      const clicks = events.filter((e) =>
        e.event_type === "click_whatsapp" || e.event_type === "package_cta"
      ).length;

      return {
        visits,
        clicks,
        total_leads: leadsRes.count ?? 0,
        contacted_leads: contactedRes.count ?? 0,
      };
    },
  });

// ─── Componente: linha expandível de site ─────────────────────────────────────

type SiteRowProps = {
  site: ReturnType<typeof useFlatSites>[number];
  onSuspend: (id: string) => void;
  onReactivate: (id: string) => void;
  planLabel: (p: string) => string;
  cycleLabel: (c: string | null) => string;
};

const SiteRow = ({ site, onSuspend, onReactivate, planLabel, cycleLabel }: SiteRowProps) => {
  const [expanded, setExpanded] = useState(false);
  const { data: metrics, isLoading: loadingMetrics } = useSiteMetrics(
    expanded ? site.id : null,
    expanded ? site.user.user_id : null,
  );

  return (
    <>
      <tr
        className="hover:bg-muted/50 cursor-pointer"
        onClick={() => setExpanded((v) => !v)}
      >
        <td className="px-4 py-3">
          <div className="flex items-center gap-1">
            {expanded ? (
              <ChevronDown className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            ) : (
              <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            )}
            <span className="font-medium text-xs truncate max-w-[140px]" title={site.id}>
              {site.id}
            </span>
          </div>
        </td>
        <td className="px-4 py-3">
          <div className="font-medium">{site.user.name || "Sem nome"}</div>
          <div className="text-xs text-muted-foreground">{site.user.email || "Sem email"}</div>
        </td>
        <td className="px-4 py-3">
          <div className="font-semibold">{planLabel(site.user.plan)}</div>
          <div className="text-xs text-muted-foreground">{cycleLabel(site.user.billing_cycle)}</div>
        </td>
        <td className="px-4 py-3">
          <span className={`font-semibold ${site.active ? "text-green-600" : "text-red-600"}`}>
            {site.active ? "Ativo" : "Suspenso"}
          </span>
          <div className="text-xs text-muted-foreground">{site.user.subscription_status}</div>
        </td>
        <td className="px-4 py-3 text-sm text-muted-foreground">
          {format(new Date(site.created_at), "dd/MM/yyyy", { locale: ptBR })}
        </td>
        <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center gap-2">
            <a
              href={`${window.location.origin}/view/${site.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:text-blue-700 flex items-center gap-1 text-xs"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              Ver
            </a>
            {site.active ? (
              <Button
                variant="ghost"
                size="sm"
                className="text-red-600 h-7 px-2 text-xs"
                onClick={() => onSuspend(site.id)}
              >
                <PauseCircle className="h-3.5 w-3.5 mr-1" />
                Suspender
              </Button>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                className="text-green-600 h-7 px-2 text-xs"
                onClick={() => void onReactivate(site.id)}
              >
                <PlayCircle className="h-3.5 w-3.5 mr-1" />
                Reativar
              </Button>
            )}
          </div>
        </td>
      </tr>

      {/* ─── Painel expandido com métricas ─── */}
      {expanded && (
        <tr className="bg-muted/20 border-t border-dashed">
          <td colSpan={6} className="px-6 py-4">
            {loadingMetrics ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Carregando métricas...
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <MetricCard
                  icon={<Eye className="h-4 w-4 text-blue-500" />}
                  label="Visitas"
                  value={metrics?.visits ?? 0}
                  color="blue"
                />
                <MetricCard
                  icon={<MousePointerClick className="h-4 w-4 text-purple-500" />}
                  label="Cliques (WhatsApp/CTA)"
                  value={metrics?.clicks ?? 0}
                  color="purple"
                />
                <MetricCard
                  icon={<Users className="h-4 w-4 text-emerald-500" />}
                  label="Leads captados"
                  value={metrics?.total_leads ?? 0}
                  color="emerald"
                />
                <MetricCard
                  icon={<UserCheck className="h-4 w-4 text-orange-500" />}
                  label="Leads em contato"
                  value={metrics?.contacted_leads ?? 0}
                  color="orange"
                />
              </div>
            )}
            {metrics && metrics.total_leads > 0 && (
              <div className="mt-3 flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  Taxa de conversão: {
                    metrics.visits > 0
                      ? `${((metrics.total_leads / metrics.visits) * 100).toFixed(1)}%`
                      : "—"
                  }
                </Badge>
                {metrics.contacted_leads > 0 && (
                  <Badge variant="outline" className="text-xs text-green-700 border-green-300">
                    {metrics.contacted_leads} de {metrics.total_leads} contatados
                  </Badge>
                )}
              </div>
            )}
          </td>
        </tr>
      )}
    </>
  );
};

// ─── Mini card de métrica ─────────────────────────────────────────────────────

const MetricCard = ({
  icon, label, value, color,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  color: string;
}) => (
  <div className={`bg-background rounded-lg border p-3 flex items-center gap-3`}>
    <div className={`p-1.5 rounded-md bg-${color}-50`}>{icon}</div>
    <div>
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="text-xl font-bold">{value.toLocaleString("pt-BR")}</div>
    </div>
  </div>
);

// ─── Helper: achata sites de todos os usuários ────────────────────────────────

const useFlatSites = () => {
  const { data: users, isLoading } = useAdminUserIntelligence();
  const sites = (users || []).flatMap((user) =>
    user.sites.map((site) => ({ ...site, user }))
  );
  return { sites, isLoading };
};

// ─── Componente principal ─────────────────────────────────────────────────────

export const SitesSection = () => {
  const { sites, isLoading } = useFlatSites();
  const queryClient = useQueryClient();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [siteToSuspend, setSiteToSuspend] = useState<{ id: string } | null>(null);

  const planLabel = (plan: string) =>
    ({ elite: "Elite", start: "Start", trial_expired: "Teste vencido" }[plan] ?? "Gratuito/Inativo");

  const cycleLabel = (cycle: string | null) =>
    ({
      month: "Mensal", monthly: "Mensal",
      semester: "Semestral", semiannual: "Semestral",
      year: "Anual", yearly: "Anual", annual: "Anual",
    }[cycle || ""] ?? cycle ?? "—");

  const handleSuspend = (id: string) => {
    setSiteToSuspend({ id });
    setDeleteDialogOpen(true);
  };

  const confirmSuspend = async () => {
    if (!siteToSuspend) return;
    const { error } = await (supabase.rpc as any)("admin_set_public_site_status", {
      p_site_id: siteToSuspend.id,
      p_active: false,
      p_reason: "manual_admin",
    });
    if (error) return toast.error("Erro ao suspender site.");
    toast.success("Site suspenso. Os dados foram preservados.");
    setDeleteDialogOpen(false);
    setSiteToSuspend(null);
    await queryClient.invalidateQueries({ queryKey: ["admin-user-intelligence"] });
  };

  const handleReactivate = async (id: string) => {
    const { error } = await (supabase.rpc as any)("admin_set_public_site_status", {
      p_site_id: id,
      p_active: true,
      p_reason: null,
    });
    if (error) return toast.error("Erro ao reativar site.");
    toast.success("Site reativado.");
    await queryClient.invalidateQueries({ queryKey: ["admin-user-intelligence"] });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Sites Gerados Pelos Usuários
            <Badge variant="secondary" className="ml-2">{sites.length}</Badge>
          </CardTitle>
          <p className="text-xs text-muted-foreground">
            Clique em uma linha para ver as métricas detalhadas do site (visitas, cliques, leads captados e leads em contato).
          </p>
        </CardHeader>
        <CardContent>
          {sites.length > 0 ? (
            <div className="rounded-md border overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-muted text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3 font-medium">ID do Site</th>
                    <th className="px-4 py-3 font-medium">Usuário</th>
                    <th className="px-4 py-3 font-medium">Plano / Ciclo</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium">Criado em</th>
                    <th className="px-4 py-3 font-medium">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {sites.map((site) => (
                    <SiteRow
                      key={site.id}
                      site={site}
                      onSuspend={handleSuspend}
                      onReactivate={handleReactivate}
                      planLabel={planLabel}
                      cycleLabel={cycleLabel}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-10 text-muted-foreground">
              Nenhum site gerado encontrado.
            </div>
          )}
        </CardContent>
      </Card>

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title={`o site ${siteToSuspend?.id} (será suspenso, não apagado)`}
        onConfirm={confirmSuspend}
        isDeleting={false}
      />
    </div>
  );
};
