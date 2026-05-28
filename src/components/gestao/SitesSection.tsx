import { useState } from "react";
import { useGeneratedSites, useDeleteGeneratedSite } from "@/hooks/useGeneratedSites";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/Button";
import { Loader2, Trash2, ExternalLink, Globe } from "lucide-react";
import { DeleteConfirmDialog } from "./DeleteConfirmDialog";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export const SitesSection = () => {
  const { data: sites, isLoading } = useGeneratedSites();
  const deleteSite = useDeleteGeneratedSite();
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

  const confirmDelete = () => {
    if (!siteToDelete) return;
    deleteSite.mutate(siteToDelete.id, {
      onSuccess: () => {
        toast.success("Site removido com sucesso!");
        setDeleteDialogOpen(false);
        setSiteToDelete(null);
      },
      onError: (error) => {
        toast.error("Erro ao remover site.");
        console.error(error);
      }
    });
  };

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
                    <th className="px-4 py-3 font-medium">Criado Em</th>
                    <th className="px-4 py-3 font-medium">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {sites.map((site) => (
                    <tr key={site.id} className="hover:bg-muted/50">
                      <td className="px-4 py-3 font-medium">{site.id}</td>
                      <td className="px-4 py-3">
                        {format(new Date(site.created_at), "dd 'de' MMMM 'de' yyyy, HH:mm", { locale: ptBR })}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <a
                            href={`/site/${site.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-500 hover:text-blue-700 flex items-center gap-1 text-xs"
                          >
                            <ExternalLink className="h-4 w-4" />
                            Visualizar
                          </a>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-500 hover:text-red-700 hover:bg-red-100 h-8 px-2"
                            onClick={() => handleDelete(site.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
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
        title={`o site ${siteToDelete?.id}`}
        onConfirm={confirmDelete}
        isDeleting={deleteSite.isPending}
      />
    </div>
  );
};
