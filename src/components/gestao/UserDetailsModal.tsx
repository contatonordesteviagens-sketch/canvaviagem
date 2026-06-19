import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ActiveUser } from "@/hooks/useActiveUsers";
import { useUserDetails, useDeleteUserSite } from "@/hooks/useUserDetails";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Phone, Download, Trash2, ExternalLink, Image as ImageIcon, Activity, Clock, AlertTriangle } from "lucide-react";
import { format, differenceInDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";

interface UserDetailsModalProps {
  user: ActiveUser | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const UserDetailsModal = ({ user, open, onOpenChange }: UserDetailsModalProps) => {
  const { data: details, isLoading } = useUserDetails(user?.user_id || null);
  const deleteSite = useDeleteUserSite();
  const { toast } = useToast();

  if (!user) return null;

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "-";
    return format(new Date(dateString), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
  };

  const handleWhatsApp = (phone: string) => {
    // Basic sanitization
    const cleanPhone = phone.replace(/\D/g, "");
    if (cleanPhone.length >= 10) {
      window.open(`https://wa.me/${cleanPhone}`, "_blank");
    } else {
      toast({
        title: "Número inválido",
        description: "O número de telefone não parece válido para o WhatsApp.",
        variant: "destructive"
      });
    }
  };

  const handleDownloadHtml = (html: string, siteId: string) => {
    const blob = new Blob([html], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `site_${siteId}.html`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleDeleteSite = (siteId: string) => {
    if (confirm("Tem certeza que deseja apagar o site deste usuário? Esta ação não pode ser desfeita.")) {
      deleteSite.mutate(siteId, {
        onSuccess: () => {
          toast({ title: "Site removido com sucesso!" });
        },
        onError: () => {
          toast({ title: "Erro ao remover site", variant: "destructive" });
        }
      });
    }
  };

  // Canceled Alert Logic
  let canceledDays = -1;
  if (user.status === "canceled") {
    const endDate = user.current_period_end ? new Date(user.current_period_end) : new Date();
    canceledDays = differenceInDays(new Date(), endDate);
    if (canceledDays < 0) canceledDays = 0; // If end date is in future but canceled
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center gap-2">
            Perfil do Usuário
            <Badge variant={user.status === "active" ? "default" : "secondary"} className={user.status === "active" ? "bg-green-500/10 text-green-600 hover:bg-green-500/20" : ""}>
              {user.status === "active" ? "Ativo" : user.status === "canceled" ? "Cancelado" : user.status}
            </Badge>
          </DialogTitle>
          <DialogDescription>
            {user.email} {user.name ? `• ${user.name}` : ""}
          </DialogDescription>
        </DialogHeader>

        {canceledDays >= 0 && (
          <div className={`p-4 rounded-lg flex items-start gap-3 mt-4 ${
            canceledDays >= 30 ? "bg-red-500/10 text-red-700 dark:text-red-400 border border-red-500/20" : 
            canceledDays >= 7 ? "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border border-yellow-500/20" :
            "bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-500/20"
          }`}>
            <AlertTriangle className="h-5 w-5 mt-0.5" />
            <div>
              <h4 className="font-semibold">Usuário Cancelado ({canceledDays} dias)</h4>
              <p className="text-sm mt-1">
                {canceledDays >= 30 
                  ? "Este usuário já cancelou há muito tempo. Se ele possuir sites ativos, considere removê-los para liberar espaço no servidor e evitar uso fraudulento."
                  : canceledDays >= 7
                  ? "Este usuário cancelou recentemente. Tente entrar em contato pelo WhatsApp para entender o motivo e tentar recuperá-lo."
                  : "Assinatura cancelada muito recentemente."}
              </p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          {/* Coluna Esquerda: Info Básica */}
          <div className="space-y-6">
            <div>
              <h3 className="font-medium text-muted-foreground mb-3">Detalhes da Assinatura</h3>
              <div className="bg-muted/30 rounded-lg p-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Plano:</span>
                  <span className="font-medium">{user.plan_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Valor:</span>
                  <span className="font-medium">{user.plan_value}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Início:</span>
                  <span>{formatDate(user.created_at)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Válido até:</span>
                  <span>{formatDate(user.current_period_end)}</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-medium text-muted-foreground mb-3">Contato</h3>
              {isLoading ? (
                <Skeleton className="h-16 w-full" />
              ) : (
                <div className="bg-muted/30 rounded-lg p-4 flex flex-col gap-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{details?.phone || "Não cadastrado"}</span>
                  </div>
                  {details?.phone && (
                    <Button variant="outline" className="w-full" onClick={() => handleWhatsApp(details.phone!)}>
                      <Phone className="h-4 w-4 mr-2" />
                      Chamar no WhatsApp
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Coluna Direita: Métricas */}
          <div className="space-y-6">
            <div>
              <h3 className="font-medium text-muted-foreground mb-3">Métricas de Uso</h3>
              {isLoading ? (
                <div className="grid grid-cols-2 gap-3">
                  <Skeleton className="h-24 w-full" />
                  <Skeleton className="h-24 w-full" />
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-muted/30 rounded-lg p-4 flex flex-col items-center justify-center text-center">
                    <ImageIcon className="h-6 w-6 text-primary mb-2" />
                    <span className="text-2xl font-bold">{details?.images_generated || 0}</span>
                    <span className="text-xs text-muted-foreground">Artes Geradas</span>
                  </div>
                  <div className="bg-muted/30 rounded-lg p-4 flex flex-col items-center justify-center text-center">
                    <Activity className="h-6 w-6 text-primary mb-2" />
                    <span className="text-2xl font-bold">{details?.total_activities || 0}</span>
                    <span className="text-xs text-muted-foreground">Ações Totais</span>
                  </div>
                </div>
              )}
            </div>

            <div>
              <h3 className="font-medium text-muted-foreground mb-3">Última Atividade</h3>
              {isLoading ? (
                <Skeleton className="h-12 w-full" />
              ) : (
                <div className="bg-muted/30 rounded-lg p-4 flex items-center gap-3">
                  <Clock className="h-5 w-5 text-muted-foreground" />
                  <span className="text-sm">
                    {details?.last_active ? formatDate(details.last_active) : "Sem atividades registradas"}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Seção Inferior: Sites Gerados */}
        <div className="mt-8">
          <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
            <ExternalLink className="h-5 w-5" />
            Sites Gerados ({details?.sites?.length || 0})
          </h3>

          {isLoading ? (
            <Skeleton className="h-32 w-full" />
          ) : details?.sites?.length === 0 ? (
            <div className="text-center p-8 border border-dashed rounded-lg text-muted-foreground">
              Este usuário ainda não publicou nenhum site.
            </div>
          ) : (
            <div className="space-y-4">
              {details?.sites?.map(site => (
                <div key={site.id} className="border rounded-lg p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="font-medium text-sm text-primary break-all">
                      canvaviagem.com/site/{site.id}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Publicado em: {formatDate(site.created_at)}
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => window.open(`https://canvaviagem.com/site/${site.id}`, "_blank")}>
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Acessar
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleDownloadHtml(site.html, site.id)}>
                      <Download className="h-4 w-4 mr-2" />
                      Baixar HTML
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => handleDeleteSite(site.id)}>
                      <Trash2 className="h-4 w-4 mr-2" />
                      Remover
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
