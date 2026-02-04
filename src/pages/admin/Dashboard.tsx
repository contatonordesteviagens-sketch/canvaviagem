import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useEmailDashboard } from "@/hooks/useEmailDashboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { Mail, Eye, Clock, Users, ArrowLeft, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

// NOTE: Admin verification is handled by database roles via useAuth().isAdmin
// The isAdmin flag comes from the user_roles table, not hardcoded emails
const Dashboard = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading, isAdmin } = useAuth();
  const { metrics, eventsQuery, isLoading, error } = useEmailDashboard();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    } else if (!authLoading && user && !isAdmin) {
      navigate("/");
    }
  }, [user, authLoading, isAdmin, navigate]);

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <Skeleton className="h-10 w-64" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(i => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Skeleton className="h-80" />
            <Skeleton className="h-80" />
          </div>
        </div>
      </div>
    );
  }

  if (!authLoading && !isAdmin) {
    return null;
  }

  const chartConfig = {
    email1: { label: "Email 1 (Boas-vindas)", color: "hsl(var(--primary))" },
    email2: { label: "Email 2 (Curso)", color: "hsl(265, 78%, 60%)" },
    email3: { label: "Email 3 (Oferta)", color: "hsl(var(--accent))" },
  };

  const funnelConfig = {
    value: { label: "Usuários" },
  };

  const getBadgeVariant = (type: string) => {
    switch (type) {
      case "sent": return "secondary";
      case "delivered": return "outline";
      case "opened": return "default";
      case "clicked": return "default";
      case "bounced": return "destructive";
      default: return "secondary";
    }
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case "sent": return "📤";
      case "delivered": return "✅";
      case "opened": return "👁️";
      case "clicked": return "🖱️";
      case "bounced": return "❌";
      default: return "📧";
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary/10 via-purple-500/10 to-accent/10 border-b">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-foreground">📊 Dashboard de Email Marketing</h1>
                <p className="text-muted-foreground text-sm">Acompanhe a performance da sua Drip Campaign</p>
              </div>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => {
                eventsQuery.refetch();
              }}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Atualizar
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm font-medium">Total Enviados</p>
                  <p className="text-3xl font-bold text-foreground">{metrics.totalSent}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    E1: {metrics.totalEmail1} | E2: {metrics.totalEmail2} | E3: {metrics.totalEmail3}
                  </p>
                </div>
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Mail className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500/5 to-green-500/10 border-green-500/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm font-medium">Taxa de Abertura</p>
                  <p className="text-3xl font-bold text-foreground">{metrics.openRate}%</p>
                  <p className="text-xs text-muted-foreground mt-1">Baseado em eventos do Resend</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-green-500/10 flex items-center justify-center">
                  <Eye className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-amber-500/5 to-amber-500/10 border-amber-500/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm font-medium">Próximos Envios</p>
                  <p className="text-3xl font-bold text-foreground">{metrics.upcomingSends}</p>
                  <p className="text-xs text-muted-foreground mt-1">Aguardando na fila</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-amber-500/10 flex items-center justify-center">
                  <Clock className="h-6 w-6 text-amber-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-accent/5 to-accent/10 border-accent/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm font-medium">Total de Usuários</p>
                  <p className="text-3xl font-bold text-foreground">{metrics.totalUsers}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {metrics.unsubscribed} descadastrados
                  </p>
                </div>
                <div className="h-12 w-12 rounded-full bg-accent/10 flex items-center justify-center">
                  <Users className="h-6 w-6 text-accent" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Bar Chart - Envios por Dia */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">📈 Envios por Dia (Últimos 7 dias)</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[300px] w-full">
                <BarChart data={metrics.dailyData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                  <XAxis dataKey="date" tickLine={false} axisLine={false} fontSize={12} />
                  <YAxis tickLine={false} axisLine={false} fontSize={12} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="email1" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="Email 1" />
                  <Bar dataKey="email2" fill="hsl(265, 78%, 60%)" radius={[4, 4, 0, 0]} name="Email 2" />
                  <Bar dataKey="email3" fill="hsl(var(--accent))" radius={[4, 4, 0, 0]} name="Email 3" />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* Pie Chart - Funil */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">🎯 Distribuição do Funil</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={funnelConfig} className="h-[300px] w-full">
                <PieChart>
                  <Pie
                    data={metrics.funnelData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label={({ name, value }) => `${name}: ${value}`}
                    labelLine={false}
                  >
                    {metrics.funnelData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <ChartLegend content={<ChartLegendContent />} />
                </PieChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>

        {/* Events Table */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">📋 Últimos Eventos</CardTitle>
          </CardHeader>
          <CardContent>
            {eventsQuery.data && eventsQuery.data.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>Tipo de Email</TableHead>
                    <TableHead>Evento</TableHead>
                    <TableHead>Data/Hora</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {eventsQuery.data.map((event) => (
                    <TableRow key={event.id}>
                      <TableCell className="font-medium">
                        {event.recipient_email || "—"}
                      </TableCell>
                      <TableCell>
                        {event.email_type ? (
                          <Badge variant="outline">
                            {event.email_type === "email_1" ? "Boas-vindas" : 
                             event.email_type === "email_2" ? "Curso" : 
                             event.email_type === "email_3" ? "Oferta Final" : event.email_type}
                          </Badge>
                        ) : "—"}
                      </TableCell>
                      <TableCell>
                        <Badge variant={getBadgeVariant(event.type)}>
                          {getEventIcon(event.type)} {event.type}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatDate(event.created_at)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <Mail className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Nenhum evento registrado ainda.</p>
                <p className="text-sm mt-2">
                  Configure o webhook do Resend para receber eventos em tempo real.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Setup Instructions */}
        <Card className="border-dashed">
          <CardHeader>
            <CardTitle className="text-lg">⚙️ Configuração do Webhook Resend</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Para receber eventos de email (aberturas, cliques, etc.), configure um webhook no painel do Resend:
            </p>
            <ol className="list-decimal list-inside text-sm space-y-2 text-muted-foreground">
              <li>Acesse <a href="https://resend.com/webhooks" target="_blank" rel="noopener noreferrer" className="text-primary underline">resend.com/webhooks</a></li>
              <li>Clique em "Add Webhook"</li>
              <li>Cole esta URL: <code className="bg-muted px-2 py-1 rounded text-xs">https://zdjtcwtakgizbsbbwtgc.supabase.co/functions/v1/resend-webhook</code></li>
              <li>Selecione os eventos: <strong>email.sent</strong>, <strong>email.delivered</strong>, <strong>email.opened</strong>, <strong>email.clicked</strong></li>
              <li>Salve e pronto!</li>
            </ol>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
