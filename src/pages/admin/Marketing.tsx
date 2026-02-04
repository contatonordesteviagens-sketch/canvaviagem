import { useMarketingStats } from "@/hooks/useMarketingStats";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FunnelChart } from "@/components/admin/FunnelChart";
import { ROITable } from "@/components/admin/ROITable";
import { Loader2, Users, UserCheck, CreditCard, DollarSign, TrendingUp, Mail, MousePointer, Star } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Marketing() {
  const { data, isLoading, error } = useMarketingStats();

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-destructive/10 text-destructive p-4 rounded-lg">
          Erro ao carregar dados de marketing: {error.message}
        </div>
      </div>
    );
  }

  const stats = data || {
    totalVisitors: 0,
    totalLeads: 0,
    totalSubscribers: 0,
    totalRevenue: 0,
    overallConversion: 0,
    emailMetrics: { totalSent: 0, totalOpened: 0, totalClicked: 0, openRate: 0, clickRate: 0, topEmail: null },
    funnel: [],
    sources: [],
    topSource: null,
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Marketing Analytics</h1>
        <p className="text-muted-foreground">
          Visão completa do funil de conversão e atribuição de receita
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Visitantes</p>
                <p className="text-2xl font-bold">{stats.totalVisitors.toLocaleString('pt-BR')}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                <UserCheck className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Leads</p>
                <p className="text-2xl font-bold">{stats.totalLeads.toLocaleString('pt-BR')}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                <CreditCard className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Clientes</p>
                <p className="text-2xl font-bold">{stats.totalSubscribers.toLocaleString('pt-BR')}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
                <DollarSign className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Receita</p>
                <p className="text-2xl font-bold text-green-600">
                  R$ {stats.totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
                <TrendingUp className="h-5 w-5 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Conversão</p>
                <p className="text-2xl font-bold">{stats.overallConversion.toFixed(2)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="funnel" className="space-y-4">
        <TabsList>
          <TabsTrigger value="funnel">📊 Funil</TabsTrigger>
          <TabsTrigger value="sources">💰 Fontes (ROI)</TabsTrigger>
          <TabsTrigger value="email">📧 Email</TabsTrigger>
        </TabsList>

        {/* Funnel Tab */}
        <TabsContent value="funnel" className="space-y-4">
          <FunnelChart data={stats.funnel} />
        </TabsContent>

        {/* Sources Tab */}
        <TabsContent value="sources" className="space-y-4">
          <ROITable data={stats.sources} />
        </TabsContent>

        {/* Email Tab */}
        <TabsContent value="email" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Taxa de Abertura
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-primary">
                  {stats.emailMetrics.openRate.toFixed(1)}%
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {stats.emailMetrics.totalOpened} de {stats.emailMetrics.totalSent} emails
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <MousePointer className="h-4 w-4" />
                  Taxa de Cliques
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-primary">
                  {stats.emailMetrics.clickRate.toFixed(1)}%
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {stats.emailMetrics.totalClicked} cliques em links
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Star className="h-4 w-4" />
                  Email Top Performer
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-primary">
                  {stats.emailMetrics.topEmail || "-"}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Maior taxa de cliques
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Email Performance Details */}
          <Card>
            <CardHeader>
              <CardTitle>Métricas Detalhadas de Email</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-8">
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <p className="text-4xl font-bold text-blue-600">{stats.emailMetrics.totalSent}</p>
                  <p className="text-sm text-muted-foreground mt-1">Emails Enviados</p>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <p className="text-4xl font-bold text-green-600">{stats.emailMetrics.totalOpened}</p>
                  <p className="text-sm text-muted-foreground mt-1">Emails Abertos</p>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <p className="text-4xl font-bold text-purple-600">{stats.emailMetrics.totalClicked}</p>
                  <p className="text-sm text-muted-foreground mt-1">Cliques em Links</p>
                </div>
              </div>

              <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  <strong>💡 Dica:</strong> Para capturar dados de abertura e cliques, configure o webhook do Resend 
                  com a URL do seu projeto e selecione os eventos: <code>email.opened</code> e <code>email.clicked</code>.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Top Source Highlight */}
      {stats.topSource && (
        <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">🏆 Canal com Maior Receita</p>
                <p className="text-2xl font-bold mt-1">{stats.topSource.source}</p>
                <p className="text-sm text-muted-foreground">
                  {Number(stats.topSource.subscribers)} clientes • {Number(stats.topSource.conversion_rate).toFixed(2)}% conversão
                </p>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-green-600">
                  R$ {Number(stats.topSource.revenue).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
                <p className="text-xs text-muted-foreground">receita gerada</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
