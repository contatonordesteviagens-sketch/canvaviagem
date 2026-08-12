import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { AdminUserIntelligence } from "@/hooks/useAdminUserIntelligence";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Phone, ExternalLink, Image as ImageIcon, Activity, Clock,
  AlertTriangle, Copy, Globe, Eye, MousePointerClick, Users as UsersIcon,
  Calendar, CreditCard, TrendingUp,
} from "lucide-react";
import { format, differenceInDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";

interface UserDetailsModalProps {
  user: AdminUserIntelligence | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const fmt = (d: string | null) =>
  d ? format(new Date(d), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR }) : "-";

const fmtDate = (d: string | null) =>
  d ? format(new Date(d), "dd/MM/yyyy", { locale: ptBR }) : "-";

const statusColors: Record<string, string> = {
  active: "bg-green-500/10 text-green-600",
  canceled: "bg-red-500/10 text-red-600",
  past_due: "bg-orange-500/10 text-orange-600",
  trialing: "bg-blue-500/10 text-blue-600",
};

const statusLabels: Record<string, string> = {
  active: "Ativo",
  canceled: "Cancelado",
  past_due: "Inadimplente",
  trialing: "Trial",
  none: "Inativo",
};

export const UserDetailsModal = ({ user, open, onOpenChange }: UserDetailsModalProps) => {
  const { toast } = useToast();

  if (!user) return null;

  const statusColor = statusColors[user.subscription_status] || "bg-muted text-muted-foreground";
  const statusLabel = statusLabels[user.subscription_status] || user.subscription_status;

  // Alert de cancelamento
  let canceledDays = -1;
  if (user.subscription_status === "canceled" && user.last_activity) {
    canceledDays = differenceInDays(new Date(), new Date(user.last_activity));
    if (canceledDays < 0) canceledDays = 0;
  }

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: `${label} copiado!`, description: text });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center gap-2 flex-wrap">
            Perfil do Usuário
            <Badge className={statusColor}>{statusLabel}</Badge>
            {user.alert && (
              <Badge variant="destructive" className="text-xs">
                <AlertTriangle className="h-3 w-3 mr-1" />
                {user.alert.replace(/_/g, " ")}
              </Badge>
            )}
          </DialogTitle>
          <DialogDescription className="flex items-center gap-2">
            <span
              className="cursor-pointer hover:underline flex items-center gap-1"
              onClick={() => copyToClipboard(user.email || "", "Email")}
            >
              {user.email}
              <Copy className="h-3 w-3 opacity-60" />
            </span>
            {user.name && <span className="text-foreground font-medium">• {user.name}</span>}
          </DialogDescription>
        </DialogHeader>

        {/* Alert cancelado */}
        {canceledDays >= 7 && (
          <div className={`p-4 rounded-lg flex items-start gap-3 mt-4 ${canceledDays >= 30 ? "bg-red-500/10 text-red-700 border border-red-500/20" : "bg-yellow-500/10 text-yellow-700 border border-yellow-500/20"}`}>
            <AlertTriangle className="h-5 w-5 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-semibold">
                {canceledDays >= 30 ? "Cliente inativo há muito tempo" : "Oportunidade de reativação"} ({canceledDays} dias)
              </h4>
              <p className="text-sm mt-1">
                {canceledDays >= 30
                  ? "Considere entrar em contato para entender o motivo do cancelamento."
                  : "Cancelou recentemente — boa hora para tentar recuperar."}
              </p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
          {/* ── Coluna esquerda: Assinatura ── */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">
              Assinatura
            </h3>
            <div className="bg-muted/30 rounded-lg p-4 space-y-3 text-sm">
              <Row icon={<CreditCard className="h-4 w-4" />} label="Plano" value={user.plan_name} bold />
              <Row icon={<TrendingUp className="h-4 w-4" />} label="Valor" value={user.plan_value} bold green />
              <Row
                icon={<Calendar className="h-4 w-4" />}
                label="Ciclo"
                value={user.billing_cycle
                  ? { month: "Mensal", monthly: "Mensal", semester: "Semestral", semiannual: "Semestral", year: "Anual", yearly: "Anual", annual: "Anual" }[user.billing_cycle] || user.billing_cycle
                  : "-"}
              />
              <Row label="Válido até" value={fmtDate(user.current_period_end)} />
              {user.trial_ends_at && (
                <Row label="Trial até" value={fmtDate(user.trial_ends_at)} />
              )}
              <Row label="Membro desde" value={fmtDate(user.created_at)} />
              <Row label="Origem" value={user.origem} />
              {user.utm_source && (
                <Row label="UTM Source" value={user.utm_source} />
              )}
            </div>

            {/* Contato */}
            <h3 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">
              Contato
            </h3>
            <div className="bg-muted/30 rounded-lg p-4 space-y-3">
              {user.phone ? (
                <>
                  <div
                    className="flex items-center gap-2 text-sm cursor-pointer hover:underline"
                    onClick={() => copyToClipboard(user.phone!, "WhatsApp")}
                  >
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{user.phone}</span>
                    <Copy className="h-3 w-3 opacity-60" />
                  </div>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      const clean = user.phone!.replace(/\D/g, "");
                      window.open(`https://wa.me/${clean}`, "_blank");
                    }}
                  >
                    <Phone className="h-4 w-4 mr-2" />
                    Chamar no WhatsApp
                  </Button>
                </>
              ) : (
                <p className="text-sm text-muted-foreground">Telefone não cadastrado</p>
              )}
            </div>
          </div>

          {/* ── Coluna direita: Métricas ── */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">
              Atividade na Plataforma
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <MetricCard icon={<ImageIcon className="h-5 w-5 text-primary" />} value={user.ad_generations + user.carousel_generations} label="Artes Geradas" />
              <MetricCard icon={<Activity className="h-5 w-5 text-primary" />} value={user.ad_downloads + user.carousel_downloads} label="Downloads" />
              <MetricCard icon={<Eye className="h-5 w-5 text-blue-500" />} value={user.site_visits} label="Visitas ao Site" />
              <MetricCard icon={<MousePointerClick className="h-5 w-5 text-purple-500" />} value={user.site_clicks} label="Cliques CTA" />
              <MetricCard icon={<UsersIcon className="h-5 w-5 text-emerald-500" />} value={user.leads} label="Leads Captados" />
            </div>

            {user.last_activity && (
              <div className="bg-muted/30 rounded-lg p-4 flex items-center gap-3 text-sm">
                <Clock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <span>Última atividade: <strong>{fmt(user.last_activity)}</strong></span>
              </div>
            )}
          </div>
        </div>

        {/* ── Sites gerados ── */}
        <div className="mt-6">
          <h3 className="text-base font-semibold flex items-center gap-2 mb-4">
            <Globe className="h-5 w-5" />
            Sites Gerados ({user.sites.length})
          </h3>

          {user.sites.length === 0 ? (
            <div className="text-center p-8 border border-dashed rounded-lg text-muted-foreground">
              Este usuário ainda não publicou nenhum site.
            </div>
          ) : (
            <div className="space-y-3">
              {user.sites.map((site) => (
                <div
                  key={site.id}
                  className="border rounded-lg p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div>
                    <div className="font-medium text-sm text-primary break-all">
                      canvaviagem.com/site/{site.id}
                    </div>
                    <div className="flex items-center gap-3 mt-1">
                      <span className={`text-xs font-semibold ${site.active ? "text-green-600" : "text-red-500"}`}>
                        {site.active ? "● Ativo" : "● Suspenso"}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        Publicado: {fmtDate(site.created_at)}
                      </span>
                      {site.suspended_at && (
                        <span className="text-xs text-orange-600">
                          Suspenso: {fmtDate(site.suspended_at)}
                        </span>
                      )}
                    </div>
                    {site.suspension_reason && (
                      <div className="text-xs text-muted-foreground mt-1">
                        Motivo: {site.suspension_reason}
                      </div>
                    )}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(`https://canvaviagem.com/site/${site.id}`, "_blank")}
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Acessar
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

// ── Helpers ──────────────────────────────────────────────────────────────────

const Row = ({
  icon, label, value, bold, green,
}: {
  icon?: React.ReactNode;
  label: string;
  value: string;
  bold?: boolean;
  green?: boolean;
}) => (
  <div className="flex justify-between items-center gap-2">
    <span className="text-muted-foreground flex items-center gap-1">
      {icon}
      {label}:
    </span>
    <span className={`${bold ? "font-semibold" : ""} ${green ? "text-emerald-600" : ""} text-right`}>
      {value}
    </span>
  </div>
);

const MetricCard = ({
  icon, value, label,
}: {
  icon: React.ReactNode;
  value: number;
  label: string;
}) => (
  <div className="bg-muted/30 rounded-lg p-4 flex flex-col items-center justify-center text-center gap-1">
    {icon}
    <span className="text-2xl font-bold">{value.toLocaleString("pt-BR")}</span>
    <span className="text-xs text-muted-foreground">{label}</span>
  </div>
);
