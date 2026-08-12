import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Users, CheckCircle, XCircle, Clock, AlertTriangle, Download, Copy } from "lucide-react";
import { useAdminUserIntelligence, AdminUserIntelligence } from "@/hooks/useAdminUserIntelligence";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { UserDetailsModal } from "./UserDetailsModal";

type StatusFilter = "all" | "active" | "canceled" | "past_due" | "trialing" | "inactive";

const STATUS_LABELS: Record<string, string> = {
  active: "Ativo",
  canceled: "Cancelado",
  past_due: "Inadimplente",
  trialing: "Trial",
  inactive: "Inativo",
  none: "Inativo",
};

export const UsersSection = () => {
  const { data: users, isLoading } = useAdminUserIntelligence();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [planFilter, setPlanFilter] = useState<string>("all");
  const [selectedUser, setSelectedUser] = useState<AdminUserIntelligence | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { toast } = useToast();

  const filteredUsers = useMemo(() => {
    if (!users) return [];
    return users.filter((user) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        (user.email || "").toLowerCase().includes(q) ||
        (user.name || "").toLowerCase().includes(q);

      const status = user.subscription_status;
      const matchesStatus =
        statusFilter === "all" ||
        status === statusFilter ||
        (statusFilter === "inactive" && (status === "none" || status === "inactive"));

      const matchesPlan =
        planFilter === "all" ||
        user.plan === planFilter;

      return matchesSearch && matchesStatus && matchesPlan;
    });
  }, [users, searchQuery, statusFilter, planFilter]);

  const getStatusBadge = (status: string) => {
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

  const handleExportCSV = () => {
    if (!filteredUsers.length) {
      toast({ title: "Nada para exportar", description: "Nenhum usuário encontrado.", variant: "destructive" });
      return;
    }

    const headers = ["Email", "Nome", "Status", "Plano", "Ciclo", "Valor", "Sites", "Leads", "Origem", "Válido até"];
    const rows = filteredUsers.map((u) => [
      u.email || "",
      u.name || "",
      STATUS_LABELS[u.subscription_status] || u.subscription_status,
      u.plan_name,
      u.billing_cycle || "-",
      u.plan_value,
      u.site_count,
      u.leads,
      u.origem,
      formatDate(u.current_period_end),
    ]);

    const BOM = "\uFEFF";
    const csvContent =
      BOM +
      [headers.join(";"), ...rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(";"))].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `usuarios_${format(new Date(), "yyyy-MM-dd")}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    toast({ title: "CSV exportado!", description: `${filteredUsers.length} usuário(s) exportado(s).` });
  };

  // Contadores rápidos
  const counts = useMemo(() => {
    if (!users) return { total: 0, active: 0, canceled: 0, pastDue: 0 };
    return {
      total: users.length,
      active: users.filter((u) => u.subscription_status === "active").length,
      canceled: users.filter((u) => u.subscription_status === "canceled").length,
      pastDue: users.filter((u) => u.subscription_status === "past_due").length,
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

      {/* Tabela */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Usuários ({filteredUsers.length})
            </CardTitle>
            <Button variant="outline" size="sm" onClick={handleExportCSV}>
              <Download className="h-4 w-4 mr-2" />
              Exportar CSV
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filtros */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por email ou nome..."
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
            <Select value={planFilter} onValueChange={(v) => setPlanFilter(v)}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filtrar por plano" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os planos</SelectItem>
                <SelectItem value="elite">Plano Elite</SelectItem>
                <SelectItem value="start">Plano Start</SelectItem>
                <SelectItem value="inactive">Gratuito/Inativo</SelectItem>
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
                    <TableHead>Plano</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Sites</TableHead>
                    <TableHead>Leads</TableHead>
                    <TableHead>Válido até</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow
                      key={user.user_id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => {
                        setSelectedUser(user);
                        setIsModalOpen(true);
                      }}
                    >
                      <TableCell
                        className="font-medium group relative"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigator.clipboard.writeText(user.email || "");
                          toast({ title: "Email copiado!", description: user.email || "" });
                        }}
                      >
                        <div className="flex flex-col" title="Clique para copiar">
                          <span className="flex items-center gap-1">
                            {user.email}
                            <Copy className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity text-primary" />
                          </span>
                          {user.name && (
                            <span className="text-xs text-muted-foreground">{user.name}</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(user.subscription_status)}</TableCell>
                      <TableCell>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-muted text-foreground">
                          {user.plan_name}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm font-semibold text-emerald-600">{user.plan_value}</span>
                      </TableCell>
                      <TableCell>
                        {user.site_count > 0 ? (
                          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                            {user.site_count} Gerado{user.site_count > 1 ? "s" : ""}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground text-xs">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {user.leads > 0 ? (
                          <span className="text-sm font-medium text-purple-600">{user.leads}</span>
                        ) : (
                          <span className="text-muted-foreground text-xs">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {formatDate(user.current_period_end)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <UserDetailsModal
        user={selectedUser}
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
      />
    </div>
  );
};
