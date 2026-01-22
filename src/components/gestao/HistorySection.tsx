import { useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { History, RotateCcw, Filter, Check, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import {
  useAuditLogs,
  useRollbackAction,
  getTableDisplayName,
  getActionDisplayName,
  getItemTitle,
  AuditLogEntry,
} from "@/hooks/useAuditLog";
import { RollbackModal } from "./RollbackModal";

export const HistorySection = () => {
  const [actionFilter, setActionFilter] = useState<string>("all");
  const [tableFilter, setTableFilter] = useState<string>("all");
  const [selectedEntry, setSelectedEntry] = useState<AuditLogEntry | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const { toast } = useToast();
  const rollbackMutation = useRollbackAction();

  const { data: logs, isLoading } = useAuditLogs({
    action: actionFilter !== "all" ? actionFilter : undefined,
    table_name: tableFilter !== "all" ? tableFilter : undefined,
    limit: 100,
  });

  const handleRollbackClick = (entry: AuditLogEntry) => {
    setSelectedEntry(entry);
    setIsModalOpen(true);
  };

  const handleConfirmRollback = async () => {
    if (!selectedEntry) return;

    try {
      await rollbackMutation.mutateAsync(selectedEntry);
      toast({
        title: "Alteração desfeita!",
        description: `${getActionDisplayName(selectedEntry.action)} foi revertido com sucesso.`,
      });
      setIsModalOpen(false);
      setSelectedEntry(null);
    } catch (error) {
      toast({
        title: "Erro ao desfazer",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive",
      });
    }
  };

  const getActionBadge = (action: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive"> = {
      INSERT: "default",
      UPDATE: "secondary",
      DELETE: "destructive",
    };
    const icons: Record<string, string> = {
      INSERT: "➕",
      UPDATE: "✏️",
      DELETE: "🗑️",
    };
    return (
      <Badge variant={variants[action] || "default"} className="gap-1">
        {icons[action]} {getActionDisplayName(action)}
      </Badge>
    );
  };

  const getRollbackButtonText = (action: string) => {
    return action === "DELETE" ? "Restaurar" : "Desfazer";
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <History className="h-5 w-5" />
              Histórico de Alterações
            </CardTitle>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={actionFilter} onValueChange={setActionFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Ação" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="INSERT">Criações</SelectItem>
                  <SelectItem value="UPDATE">Edições</SelectItem>
                  <SelectItem value="DELETE">Remoções</SelectItem>
                </SelectContent>
              </Select>
              <Select value={tableFilter} onValueChange={setTableFilter}>
                <SelectTrigger className="w-36">
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="content_items">Conteúdo</SelectItem>
                  <SelectItem value="captions">Legendas</SelectItem>
                  <SelectItem value="marketing_tools">Ferramentas</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : !logs?.length ? (
            <div className="text-center py-8 text-muted-foreground">
              <History className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>Nenhuma alteração registrada ainda.</p>
              <p className="text-sm">O histórico aparecerá aqui após criar, editar ou remover itens.</p>
            </div>
          ) : (
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-40">Data/Hora</TableHead>
                    <TableHead className="w-28">Ação</TableHead>
                    <TableHead className="w-28">Tipo</TableHead>
                    <TableHead>Item</TableHead>
                    <TableHead className="w-28">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.map((entry) => (
                    <TableRow 
                      key={entry.id}
                      className={entry.is_rolled_back ? "opacity-50" : ""}
                    >
                      <TableCell className="text-sm text-muted-foreground">
                        {format(new Date(entry.created_at), "dd/MM HH:mm", { locale: ptBR })}
                      </TableCell>
                      <TableCell>{getActionBadge(entry.action)}</TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {getTableDisplayName(entry.table_name)}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium truncate max-w-xs">
                        {getItemTitle(entry)}
                      </TableCell>
                      <TableCell>
                        {entry.is_rolled_back ? (
                          <Badge variant="outline" className="gap-1">
                            <Check className="h-3 w-3" /> Desfeito
                          </Badge>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRollbackClick(entry)}
                            disabled={rollbackMutation.isPending}
                            className="gap-1"
                          >
                            <RotateCcw className="h-3 w-3" />
                            {getRollbackButtonText(entry.action)}
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <RollbackModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        entry={selectedEntry}
        onConfirm={handleConfirmRollback}
        isLoading={rollbackMutation.isPending}
      />
    </div>
  );
};
