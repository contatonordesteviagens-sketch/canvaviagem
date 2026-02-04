import { AlertTriangle } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  AuditLogEntry,
  getTableDisplayName,
  getActionDisplayName,
  getItemTitle,
} from "@/hooks/useAuditLog";

interface RollbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  entry: AuditLogEntry | null;
  onConfirm: () => void;
  isLoading: boolean;
}

export const RollbackModal = ({
  isOpen,
  onClose,
  entry,
  onConfirm,
  isLoading,
}: RollbackModalProps) => {
  if (!entry) return null;

  const getActionDescription = () => {
    switch (entry.action) {
      case "INSERT":
        return {
          warning: "Ao desfazer, este item será REMOVIDO permanentemente.",
          action: "Remover item criado",
        };
      case "UPDATE":
        return {
          warning: "Ao desfazer, os valores anteriores serão restaurados.",
          action: "Restaurar versão anterior",
        };
      case "DELETE":
        return {
          warning: "Ao restaurar, o item será recriado com os dados originais.",
          action: "Recriar item removido",
        };
      default:
        return { warning: "", action: "Desfazer" };
    }
  };

  const { warning, action } = getActionDescription();

  const renderDataComparison = () => {
    if (entry.action !== "UPDATE") return null;

    const oldData = entry.old_data || {};
    const newData = entry.new_data || {};
    
    // Fields to compare
    const fieldsToShow = ["title", "text", "url", "icon", "description", "is_active"];
    const changedFields = fieldsToShow.filter(
      (field) => oldData[field] !== newData[field] && (oldData[field] || newData[field])
    );

    if (changedFields.length === 0) return null;

    const fieldLabels: Record<string, string> = {
      title: "Título",
      text: "Texto",
      url: "URL",
      icon: "Ícone",
      description: "Descrição",
      is_active: "Ativo",
    };

    return (
      <div className="mt-4">
        <p className="text-sm font-medium mb-2">Campos alterados:</p>
        <ScrollArea className="max-h-48">
          <div className="space-y-2 text-sm">
            {changedFields.map((field) => (
              <div key={field} className="rounded border p-2 bg-muted/50">
                <p className="font-medium text-muted-foreground mb-1">
                  {fieldLabels[field] || field}
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Badge variant="outline" className="mb-1 text-xs">Antes</Badge>
                    <p className="text-xs break-all">
                      {String(oldData[field] ?? "(vazio)")}
                    </p>
                  </div>
                  <div>
                    <Badge variant="secondary" className="mb-1 text-xs">Depois</Badge>
                    <p className="text-xs break-all">
                      {String(newData[field] ?? "(vazio)")}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            Confirmar Rollback
          </DialogTitle>
          <DialogDescription asChild>
            <div className="space-y-3 pt-2">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="secondary">
                  {getActionDisplayName(entry.action)}
                </Badge>
                <Badge variant="outline">
                  {getTableDisplayName(entry.table_name)}
                </Badge>
                <span className="text-muted-foreground">•</span>
                <span className="text-sm">
                  {format(new Date(entry.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                </span>
              </div>

              <p className="font-medium">{getItemTitle(entry)}</p>

              <div className="rounded bg-muted border border-border p-3">
                <p className="text-sm text-muted-foreground">
                  ⚠️ {warning}
                </p>
              </div>

              {renderDataComparison()}
            </div>
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancelar
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? "Processando..." : action}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
