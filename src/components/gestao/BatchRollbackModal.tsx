import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  AuditLogEntry,
  getTableDisplayName,
  getItemTitle,
} from "@/hooks/useAuditLog";

interface BatchRollbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  entries: AuditLogEntry[];
  onConfirm: () => void;
  isLoading: boolean;
}

export const BatchRollbackModal = ({
  isOpen,
  onClose,
  entries,
  onConfirm,
  isLoading,
}: BatchRollbackModalProps) => {
  const inserts = entries.filter((e) => e.action === "INSERT");
  const updates = entries.filter((e) => e.action === "UPDATE");
  const deletes = entries.filter((e) => e.action === "DELETE");

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            Desfazer {entries.length} alterações
          </DialogTitle>
          <DialogDescription asChild>
            <div className="space-y-4 pt-4">
              {inserts.length > 0 && (
                <div className="p-3 bg-destructive/10 rounded-lg border border-destructive/20">
                  <p className="font-medium text-destructive mb-2">
                    {inserts.length} item(ns) serão REMOVIDOS:
                  </p>
                  <ScrollArea className="max-h-32">
                    <ul className="text-sm space-y-1">
                      {inserts.map((e) => (
                        <li key={e.id} className="flex items-center gap-2">
                          <span className="text-muted-foreground">•</span>
                          <span>{getItemTitle(e)}</span>
                          <span className="text-xs text-muted-foreground">
                            ({getTableDisplayName(e.table_name)})
                          </span>
                        </li>
                      ))}
                    </ul>
                  </ScrollArea>
                </div>
              )}

              {updates.length > 0 && (
                <div className="p-3 bg-amber-500/10 rounded-lg border border-amber-500/20">
                  <p className="font-medium text-amber-600 mb-2">
                    {updates.length} item(ns) serão RESTAURADOS:
                  </p>
                  <ScrollArea className="max-h-32">
                    <ul className="text-sm space-y-1">
                      {updates.map((e) => (
                        <li key={e.id} className="flex items-center gap-2">
                          <span className="text-muted-foreground">•</span>
                          <span>{getItemTitle(e)}</span>
                          <span className="text-xs text-muted-foreground">
                            ({getTableDisplayName(e.table_name)})
                          </span>
                        </li>
                      ))}
                    </ul>
                  </ScrollArea>
                </div>
              )}

              {deletes.length > 0 && (
                <div className="p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                  <p className="font-medium text-green-600 mb-2">
                    {deletes.length} item(ns) serão RECRIADOS:
                  </p>
                  <ScrollArea className="max-h-32">
                    <ul className="text-sm space-y-1">
                      {deletes.map((e) => (
                        <li key={e.id} className="flex items-center gap-2">
                          <span className="text-muted-foreground">•</span>
                          <span>{getItemTitle(e)}</span>
                          <span className="text-xs text-muted-foreground">
                            ({getTableDisplayName(e.table_name)})
                          </span>
                        </li>
                      ))}
                    </ul>
                  </ScrollArea>
                </div>
              )}

              <div className="rounded-lg bg-amber-500/10 border border-amber-500/20 p-3">
                <p className="text-sm text-amber-700">
                  ⚠️ Esta ação não pode ser desfeita. Tem certeza que deseja continuar?
                </p>
              </div>
            </div>
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancelar
          </Button>
          <Button variant="destructive" onClick={onConfirm} disabled={isLoading}>
            {isLoading ? "Processando..." : `Desfazer ${entries.length} alterações`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
