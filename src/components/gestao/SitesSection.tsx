import { useState } from "react";
import { useAdminUserIntelligence } from "@/hooks/useAdminUserIntelligence";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, ExternalLink, Globe, PauseCircle, PlayCircle } from "lucide-react";
import { DeleteConfirmDialog } from "./DeleteConfirmDialog";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export const SitesSection = () => {
  const { data: users, isLoading } = useAdminUserIntelligence();
  const queryClient = useQueryClient();
  const sites = (users || []).flatMap((user) => user.sites.map((site) => ({ ...site, user })));
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [siteToDelete, setSiteToDelete] = useState<{ id: string } | null>(null);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const handleDelete = (id: string) => {
    setSiteToDelete({ id });
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!siteToDelete) return;
    const { error } = await (supabase.rpc as any)("admin_set_public_site_status", {
      p_site_id: siteToDelete.id, p_active: false, p_reason: "manual_admin",
    });
    if (error) return toast.error("Erro ao suspender site.");
    toast.success("Site suspenso. Os dados foram preservados.");
    setDeleteDialogOpen(false); setSiteToDelete(null);
    await queryClient.invalidateQueries({ queryKey: ["admin-user-intelligence"] });
  };

  const reactivate = async (id: string) => {
    const { error } = await (supabase.rpc as any)("admin_set_public_site_status", { p_site_id: id, p_active: true, p_reason: null });
    if (error) return toast.error("Erro ao reativar site.");
    toast.success("Site reativado.");
    await queryClient.invalidateQueries({ queryKey: ["admin-user-intelligence"] });
  };

  const planLabel = (plan: string) => plan === "elite" ? "Elite" : plan === "start" ? "Start" : plan === "trial_expired" ? "Teste vencido" : "Gratuito/Inativo";
  const cycleLabel = (cycle: string | null) => ({ month: "Mensal", monthly: "Mensal", semester: "Semestral", semiannual: "Semestral", year: "Anual", yearly: "Anual", annual: "Anual" }[cycle || ""] || cycle || "—");

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Sites Gerados Pelos Usuários
          </CardTitle>
        </CardHeader>
        <CardContent>
          {sites && sites.length > 0 ? (
            <div className="rounded-md border">
              <table className="w-full text-sm text-left">
                <thead className="bg-muted text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3 font-medium">ID do Site (Usuário)</th>
                    <th className="px-4 py-3 font-medium">Usuário / contato</th>
                    <th className="px-4 py-3 font-medium">Plano / cobrança</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium">Criado Em</th>
                    <th className="px-4 py-3 font-medium">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {sites.map((site) => (
                    <tr key={site.id} className="hover:bg-muted/50">
                      <td className="px-4 py-3 font-medium">{site.id}</td>
                      <td className="px-4 py-3"><div className="font-medium">{site.user.name || "Sem nome"}</div><div className="text-xs text-muted-foreground">{site.user.email || "Sem email"}</div></td>
                      <td className="px-4 py-3"><div className="font-semibold">{planLabel(site.user.plan)}</div><div className="text-xs text-muted-foreground">{cycleLabel(site.user.billing_cycle)}</div></td>
                      <td className="px-4 py-3"><div className={site.active ? "text-green-600 font-semibold" : "text-red-600 font-semibold"}>{site.active ? "Site ativo" : "Site suspenso"}</div><div className="text-xs text-muted-foreground">{site.user.subscription_status}</div></td>
                      <td className="px-4 py-3">
                        {format(new Date(site.created_at), "dd 'de' MMMM 'de' yyyy, HH:mm", { locale: ptBR })}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <a
                            href={`${window.location.origin}/view/${site.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-500 hover:text-blue-700 flex items-center gap-1 text-xs"
                          >
                            <ExternalLink className="h-4 w-4" />
                            Visualizar
                          </a>
                          {site.active ? <Button variant="ghost" size="sm" className="text-red-600" onClick={() => handleDelete(site.id)}><PauseCircle className="h-4 w-4 mr-1" />Suspender</Button> : <Button variant="ghost" size="sm" className="text-green-600" onClick={() => void reactivate(site.id)}><PlayCircle className="h-4 w-4 mr-1" />Reativar</Button>}
                        </div>
                      </td>
                    </tr>
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
        title={`o site ${siteToDelete?.id} (será suspenso, não apagado)`}
        onConfirm={confirmDelete}
        isDeleting={false}
      />
    </div>
  );
};
