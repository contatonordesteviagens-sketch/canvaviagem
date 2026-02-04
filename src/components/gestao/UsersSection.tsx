import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Users, CheckCircle, XCircle, Clock, AlertTriangle, Download } from "lucide-react";
import { useActiveUsers, ActiveUser } from "@/hooks/useActiveUsers";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

type StatusFilter = "all" | "active" | "canceled" | "past_due" | "trialing" | "inactive";

export const UsersSection = () => {
  const { data: users, isLoading } = useActiveUsers();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const { toast } = useToast();

  const filteredUsers = useMemo(() => {
    if (!users) return [];

    return users.filter((user) => {
      // Filtro por busca
      const matchesSearch = user.email.toLowerCase().includes(searchQuery.toLowerCase());

      // Filtro por status
      const matchesStatus = statusFilter === "all" || user.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [users, searchQuery, statusFilter]);

  const getStatusBadge = (status: ActiveUser["status"]) => {
    switch (status) {
      case "active":
        return (
          <Badge className="bg-green-500/10 text-green-600 border-green-500/20">
            <CheckCircle className="w-3 h-3 mr-1" />
            Ativo
          </Badge>
        );
      case "canceled":
        return (
          <Badge variant="destructive" className="bg-destructive/10">
            <XCircle className="w-3 h-3 mr-1" />
            Cancelado
          </Badge>
        );
      case "past_due":
        return (
          <Badge className="bg-orange-500/10 text-orange-600 border-orange-500/20">
            <AlertTriangle className="w-3 h-3 mr-1" />
            Inadimplente
          </Badge>
        );
      case "trialing":
        return (
          <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/20">
            <Clock className="w-3 h-3 mr-1" />
            Trial
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary">
            <Clock className="w-3 h-3 mr-1" />
            Inativo
          </Badge>
        );
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "-";
    return format(new Date(dateString), "dd/MM/yyyy", { locale: ptBR });
  };

  const getStatusText = (status: ActiveUser["status"]) => {
    const statusMap: Record<string, string> = {
      active: "Ativo",
      canceled: "Cancelado",
      past_due: "Inadimplente",
      trialing: "Trial",
      inactive: "Inativo",
    };
    return statusMap[status] || status;
  };

  const handleExportUsersCSV = () => {
    const usersToExport = filteredUsers;

    if (!usersToExport?.length) {
      toast({
        title: "Nada para exportar",
        description: "Não há usuários para exportar.",
        variant: "destructive",
      });
      return;
    }

    const headers = ["Email", "Status", "Inscrito em", "Válido até", "Stripe Customer ID"];

    const rows = usersToExport.map((user) => [
      user.email,
      getStatusText(user.status),
      formatDate(user.created_at),
      formatDate(user.current_period_end),
      user.stripe_customer_id || "-",
    ]);

    // BOM for Excel UTF-8 compatibility
    const BOM = "\uFEFF";
    const csvContent =
      BOM +
      [
        headers.join(";"),
        ...rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(";")),
      ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `usuarios_${format(new Date(), "yyyy-MM-dd")}.csv`;
    link.click();
    URL.revokeObjectURL(url);

    toast({
      title: "CSV exportado!",
      description: `${usersToExport.length} usuário(s) exportado(s).`,
    });
  };

  // Contadores
  const counts = useMemo(() => {
    if (!users) return { total: 0, active: 0, canceled: 0, pastDue: 0 };
    return {
      total: users.length,
      active: users.filter((u) => u.status === "active").length,
      canceled: users.filter((u) => u.status === "canceled").length,
      pastDue: users.filter((u) => u.status === "past_due").length,
    };
  }, [users]);

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{counts.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-green-600">Ativos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{counts.active}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-destructive">Cancelados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{counts.canceled}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-orange-600">Inadimplentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{counts.pastDue}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Usuários ({filteredUsers.length})
            </CardTitle>
            <Button variant="outline" size="sm" onClick={handleExportUsersCSV}>
              <Download className="h-4 w-4 mr-2" />
              Exportar CSV
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as StatusFilter)}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filtrar por status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os status</SelectItem>
                <SelectItem value="active">Ativos</SelectItem>
                <SelectItem value="canceled">Cancelados</SelectItem>
                <SelectItem value="past_due">Inadimplentes</SelectItem>
                <SelectItem value="trialing">Trial</SelectItem>
                <SelectItem value="inactive">Inativos</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {isLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum usuário encontrado</p>
            </div>
          ) : (
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Inscrito em</TableHead>
                    <TableHead>Válido até</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.user_id}>
                      <TableCell className="font-medium">{user.email}</TableCell>
                      <TableCell>{getStatusBadge(user.status)}</TableCell>
                      <TableCell>{formatDate(user.created_at)}</TableCell>
                      <TableCell>{formatDate(user.current_period_end)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
