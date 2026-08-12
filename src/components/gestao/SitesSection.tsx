import { useState } from "react";
import { useAdminUserIntelligence, AdminUserIntelligence } from "@/hooks/useAdminUserIntelligence";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Loader2, ExternalLink, Globe, PauseCircle, PlayCircle,
  ChevronDown, ChevronRight, Eye, MousePointerClick, Users, UserCheck,
  User, CreditCard, Phone,
} from "lucide-react";
import { DeleteConfirmDialog } from "./DeleteConfirmDialog";
import { UserDetailsModal } from "./UserDetailsModal";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

// ─── Tipos ────────────────────────────────────────────────────────────────────

type SiteMetrics = {
  visits: number;
  clicks: number;
  total_leads: number;
  contacted_leads: number;
};

// ─── Hook: métricas por site ─────────────────────────────────────────────────

const useSiteMetrics = (siteId: string | null, ownerId: string | null) =>
  useQuery<SiteMetrics>({
    queryKey: ["site-metrics", siteId],
    enabled: !!siteId && !!ownerId,
    staleTime: 60_000,
    queryFn: async () => {
      if (!siteId || !ownerId) return { visits: 0, clicks: 0, total_leads: 0, contacted_leads: 0 };

      const [eventsRes, leadsRes, contactedRes] = await Promise.all([
        supabase
          .from("analytics_events")
          .select("event_type")
          .eq("user_id", ownerId)
          .contains("event_data", { site_id: siteId }),

        supabase
          .from("crm_form_submissions")
          .select("id", { count: "exact", head: true })
          .eq("form_id", siteId),

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

// ─── Linha expandível ────────────────────────────────────────────────────────

type FlatSite = {
  id: string;
  active: boolean;
  project_id: string | null;
  created_at: string;
  updated_at: string;
  suspended_at: string | null;
  suspension_reason: string | null;
  user: AdminUserIntelligence;
};

type SiteRowProps = {
  site: FlatSite;
  onSuspend: (id: string) => void;
  onReactivate: (id: string) => void;
  onOpenUser: (user: AdminUserIntelligence) => void;
};

const SiteRow = ({ site, onSuspend, onReactivate, onOpenUser }: SiteRowProps) => {
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
            {expanded
              ? <ChevronDown className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              : <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />}
            <span className="font-medium text-xs truncate max-w-[140px]" title={site.id}>
              {site.id}
            </span>
          </div>
        </td>

        {/* Usuário (coluna sincronizada) */}
        <td className="px-4 py-3">
          <button
            className="text-left hover:underline"
            onClick={(e) => { e.stopPropagation(); onOpenUser(site.user); }}
          >
            <div className="font-medium text-sm">{site.user.name || "Sem nome"}</div>
            <div className="text-xs text-muted-foreground">{site.user.email || "Sem email"}</div>
          </button>
        </td>

        {/* Plano */}
        <td className="px-4 py-3">
          <div className="font-semibold text-sm">{site.user.plan_name}</div>
          <div className="text-xs text-emerald-600 font-medium">{site.user.plan_value}</div>
          <div className="text-xs text-muted-foreground capitalize">{site.user.billing_cycle || "-"}</div>
        </td>

        {/* Status do site */}
        <td className="px-4 py-3">
          <span className={`font-semibold text-sm ${site.active ? "text-green-600" : "text-red-600"}`}>
            {site.active ? "● Ativo" : "● Suspenso"}
          </span>
          <div className="text-xs text-muted-foreground">{site.user.subscription_status}</div>
        </td>

        <td className="px-4 py-3 text-sm text-muted-foreground">
          {format(new Date(site.created_at), "dd/MM/yyyy", { locale: ptBR })}
        </td>

        <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center gap-2 flex-wrap">
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
                onClick={() => onReactivate(site.id)}
              >
                <PlayCircle className="h-3.5 w-3.5 mr-1" />
                Reativar
              </Button>
            )}
          </div>
        </td>
      </tr>

      {/* Painel expandido */}
      {expanded && (
        <tr className="bg-muted/20 border-t border-dashed">
          <td colSpan={6} className="px-6 py-4 space-y-4">
            {/* Informações do Usuário */}
            <div className="bg-background rounded-lg border p-4">
              <div className="flex items-center gap-2 mb-3 font-semibold text-sm">
                <User className="h-4 w-4" />
                Informações do Proprietário
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                <div>
                  <div className="text-xs text-muted-foreground">Nome</div>
                  <div className="font-medium">{site.user.name || "-"}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Email</div>
                  <div className="font-medium truncate">{site.user.email || "-"}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Plano</div>
                  <div className="font-semibold text-primary">{site.user.plan_name}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Valor pago</div>
                  <div className="font-bold text-emerald-600">{site.user.plan_value}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Ciclo</div>
                  <div>{site.user.billing_cycle || "-"}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Válido até</div>
                  <div>{site.user.current_period_end
                    ? format(new Date(site.user.current_period_end), "dd/MM/yyyy")
                    : "-"}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Status Stripe</div>
                  <div>{site.user.subscription_status}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Outros sites</div>
                  <div>{site.user.site_count} total / {site.user.active_site_count} ativos</div>
                </div>
              </div>
              <div className="mt-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onOpenUser(site.user)}
                >
                  <User className="h-3.5 w-3.5 mr-1" />
                  Ver perfil completo
                </Button>
              </div>
            </div>

            {/* Métricas do Site */}
            <div>
              <div className="font-semibold text-sm mb-3 flex items-center gap-2">
                <Globe className="h-4 w-4" />
                Métricas deste Site
              </div>
              {loadingMetrics ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Carregando métricas...
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <MetricCard icon={<Eye className="h-4 w-4 text-blue-500" />} label="Visitas" value={metrics?.visits ?? 0} />
                  <MetricCard icon={<MousePointerClick className="h-4 w-4 text-purple-500" />} label="Cliques CTA" value={metrics?.clicks ?? 0} />
                  <MetricCard icon={<Users className="h-4 w-4 text-emerald-500" />} label="Leads captados" value={metrics?.total_leads ?? 0} />
                  <MetricCard icon={<UserCheck className="h-4 w-4 text-orange-500" />} label="Leads contatados" value={metrics?.contacted_leads ?? 0} />
                </div>
              )}
              {metrics && metrics.visits > 0 && (
                <div className="mt-3 flex items-center gap-2 flex-wrap">
                  <Badge variant="outline" className="text-xs">
                    Conversão: {((metrics.total_leads / metrics.visits) * 100).toFixed(1)}%
                  </Badge>
                  {metrics.contacted_leads > 0 && metrics.total_leads > 0 && (
                    <Badge variant="outline" className="text-xs text-green-700 border-green-300">
                      {metrics.contacted_leads}/{metrics.total_leads} contatados
                    </Badge>
                  )}
                </div>
              )}
            </div>
          </td>
        </tr>
      )}
    </>
  );
};

// ─── Mini card de métrica ─────────────────────────────────────────────────────

const MetricCard = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) => (
  <div className="bg-background rounded-lg border p-3 flex items-center gap-3">
    <div className="p-1.5 rounded-md bg-muted">{icon}</div>
    <div>
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="text-xl font-bold">{value.toLocaleString("pt-BR")}</div>
    </div>
  </div>
);

// ─── useFlatSites ─────────────────────────────────────────────────────────────

const useFlatSites = () => {
  const { data: users, isLoading } = useAdminUserIntelligence();
  const sites: FlatSite[] = (users || []).flatMap((user) =>
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
  const [selectedUser, setSelectedUser] = useState<AdminUserIntelligence | null>(null);
  const [userModalOpen, setUserModalOpen] = useState(false);

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

  const handleOpenUser = (user: AdminUserIntelligence) => {
    setSelectedUser(user);
    setUserModalOpen(true);
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
            Clique em uma linha para ver métricas detalhadas. Clique no nome do usuário para abrir o perfil completo.
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
                    <th className="px-4 py-3 font-medium">Plano / Valor</th>
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
                      onOpenUser={handleOpenUser}
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

      {/* Modal de perfil do usuário a partir da aba Sites */}
      <UserDetailsModal
        user={selectedUser}
        open={userModalOpen}
        onOpenChange={setUserModalOpen}
      />
    </div>
  );
};
