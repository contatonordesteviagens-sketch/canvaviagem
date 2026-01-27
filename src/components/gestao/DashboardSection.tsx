import { useState } from "react";
import { useEmailDashboard } from "@/hooks/useEmailDashboard";
import { useAdminDashboard, usePageViews } from "@/hooks/useAdminDashboard";
import { useStripeDashboard } from "@/hooks/useStripeDashboard";
import { useMarketingFunnel } from "@/hooks/useMarketingFunnel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Users, MousePointer, TrendingUp, Activity, DollarSign, Percent, CreditCard, BarChart3, Wallet, Target, UserX, Clock, Mail, Globe } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";
import { MarketingFunnelSection } from "./MarketingFunnelSection";
import { EmailPerformanceSection } from "./EmailPerformanceSection";
import { AttributionSection } from "./AttributionSection";
import { DateRangeFilter } from "./DateRangeFilter";
import { subDays, endOfDay, startOfDay } from "date-fns";
import type { DateRange } from "react-day-picker";
import { cn } from "@/lib/utils";

const COLORS = ['hsl(var(--primary))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];

// Componente da aba Visão Geral
interface OverviewTabProps {
  dateRange?: DateRange;
}

const OverviewTab = ({ dateRange }: OverviewTabProps) => {
  const { data: stats, isLoading } = useAdminDashboard();
  const { data: pageViews } = usePageViews();
  const { metrics: emailStats, isLoading: emailLoading } = useEmailDashboard();
  const { data: stripeData, isLoading: stripeLoading } = useStripeDashboard();
  const { data: funnel } = useMarketingFunnel(dateRange ? { from: dateRange.from, to: dateRange.to } : undefined);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const typeLabels: Record<string, string> = {
    video: 'Vídeos',
    feed: 'Artes',
    story: 'Stories',
    caption: 'Legendas',
    tool: 'Ferramentas',
    resource: 'Recursos',
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  return (
    <div className="space-y-6">
      {/* Stripe KPI Cards - Principais */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/20 rounded-full">
                <DollarSign className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {stripeLoading ? "..." : formatCurrency(stripeData?.mrr || 0)}
                </p>
                <p className="text-sm text-muted-foreground">MRR</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-500/10 rounded-full">
                <Users className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {stripeLoading ? "..." : stripeData?.activeSubscribers || stats?.activeSubscribers || 0}
                </p>
                <p className="text-sm text-muted-foreground">Assinantes Ativos</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-red-500/10 rounded-full">
                <Percent className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {stripeLoading ? "..." : `${stripeData?.churnRate || 0}%`}
                </p>
                <p className="text-sm text-muted-foreground">Taxa de Cancelamento</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-500/10 rounded-full">
                <CreditCard className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {stripeLoading ? "..." : formatCurrency(stripeData?.currentMonthRevenue || 0)}
                </p>
                <p className="text-sm text-muted-foreground">Faturamento Mensal</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Novas Métricas Stripe */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-emerald-500/10 rounded-full">
                <Wallet className="h-6 w-6 text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {stripeLoading ? "..." : formatCurrency(stripeData?.totalRevenue || 0)}
                </p>
                <p className="text-sm text-muted-foreground">Receita Total</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-violet-500/10 rounded-full">
                <Target className="h-6 w-6 text-violet-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {stripeLoading ? "..." : formatCurrency(stripeData?.averageTicket || 0)}
                </p>
                <p className="text-sm text-muted-foreground">Ticket Médio</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-amber-500/10 rounded-full">
                <TrendingUp className="h-6 w-6 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {stripeLoading ? "..." : formatCurrency(stripeData?.estimatedLTV || 0)}
                </p>
                <p className="text-sm text-muted-foreground">LTV Estimado</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-rose-500/10 rounded-full">
                <UserX className="h-6 w-6 text-rose-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {stripeLoading ? "..." : stripeData?.monthlyChurns || 0}
                </p>
                <p className="text-sm text-muted-foreground">Cancelamentos (Mês)</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-cyan-500/10 rounded-full">
                <Clock className="h-6 w-6 text-cyan-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {stripeLoading ? "..." : stripeData?.trialingCount || 0}
                </p>
                <p className="text-sm text-muted-foreground">Em Trial</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Engagement KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-accent/20 rounded-full">
                <MousePointer className="h-6 w-6 text-accent-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats?.totalClicks || 0}</p>
                <p className="text-sm text-muted-foreground">Cliques Totais</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-secondary rounded-full">
                <BarChart3 className="h-6 w-6 text-secondary-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold">{pageViews?.reduce((acc, p) => acc + p.count, 0) || 0}</p>
                <p className="text-sm text-muted-foreground">Visualizações de Página</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-muted rounded-full">
                <Activity className="h-6 w-6 text-muted-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold">{emailStats?.totalSent || 0}</p>
                <p className="text-sm text-muted-foreground">Emails Enviados</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-500/10 rounded-full">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {stripeLoading ? "..." : `${stripeData?.growth && stripeData.growth > 0 ? '+' : ''}${stripeData?.growth || 0}%`}
                </p>
                <p className="text-sm text-muted-foreground">Crescimento</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Chart */}
      {stripeData?.revenueChartData && stripeData.revenueChartData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Receita Mensal</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stripeData.revenueChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis tickFormatter={(value) => `R$${value}`} />
                <Tooltip 
                  formatter={(value) => [formatCurrency(value as number), "Receita"]}
                />
                <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Charts Row */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Clicks by Type */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Cliques por Tipo</CardTitle>
          </CardHeader>
          <CardContent>
            {stats?.clicksByType && stats.clicksByType.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={stats.clicksByType.map(item => ({
                      name: typeLabels[item.type] || item.type,
                      value: item.count,
                    }))}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {stats.clicksByType.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[250px] flex items-center justify-center text-muted-foreground">
                Nenhum dado de cliques ainda
              </div>
            )}
          </CardContent>
        </Card>

        {/* Subscriber Growth */}
        {stripeData?.subscriptionChartData && stripeData.subscriptionChartData.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Novas Assinaturas</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={stripeData.subscriptionChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="subscriptions" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={2}
                    dot={{ fill: "hsl(var(--primary))" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Top Content & Page Views */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Top Content */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Top 5 Conteúdos</CardTitle>
          </CardHeader>
          <CardContent>
            {stats?.topContent && stats.topContent.length > 0 ? (
              <div className="space-y-4">
                {stats.topContent.map((item, index) => (
                  <div key={item.content_id} className="flex items-center gap-3">
                    <span className="text-2xl font-bold text-muted-foreground w-8">
                      {index + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">
                        {typeLabels[item.content_type] || item.content_type}
                      </p>
                      <p className="text-sm text-muted-foreground truncate">
                        ID: {item.content_id.slice(0, 8)}...
                      </p>
                    </div>
                    <span className="font-bold text-primary">{item.clicks} cliques</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-[250px] flex items-center justify-center text-muted-foreground">
                Nenhum dado de cliques ainda
              </div>
            )}
          </CardContent>
        </Card>

        {/* Page Views */}
        {pageViews && pageViews.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Páginas Mais Acessadas</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={pageViews.slice(0, 6)} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="path" type="category" width={100} tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="count" fill="hsl(var(--chart-2))" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Email Stats */}
      {!emailLoading && emailStats && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Funil de Email Marketing</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-muted rounded-lg">
                <p className="text-3xl font-bold">{emailStats.totalSent}</p>
                <p className="text-sm text-muted-foreground">Enviados</p>
              </div>
              <div className="text-center p-4 bg-muted rounded-lg">
                <p className="text-3xl font-bold">{emailStats.totalEmail1}</p>
                <p className="text-sm text-muted-foreground">Email 1</p>
              </div>
              <div className="text-center p-4 bg-muted rounded-lg">
                <p className="text-3xl font-bold">{emailStats.totalEmail2}</p>
                <p className="text-sm text-muted-foreground">Email 2</p>
              </div>
              <div className="text-center p-4 bg-muted rounded-lg">
                <p className="text-3xl font-bold">{emailStats.totalEmail3}</p>
                <p className="text-sm text-muted-foreground">Email 3</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Top Fontes de Tráfego - Integrado na Visão Geral */}
      {funnel && funnel.sourceData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Top Fontes de Tráfego
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              {/* Gráfico de Visitantes por Fonte */}
              <ResponsiveContainer width="100%" height={200}>
                <BarChart 
                  data={funnel.sourceData.slice(0, 5).map(s => ({
                    name: s.source.length > 12 ? s.source.slice(0, 12) + "..." : s.source,
                    visitantes: s.visitors,
                  }))} 
                  layout="vertical"
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={90} tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="visitantes" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>

              {/* Tabela resumida das fontes */}
              <div className="space-y-2">
                {funnel.sourceData.slice(0, 5).map((source, i) => (
                  <div 
                    key={i} 
                    className="flex items-center justify-between p-2 rounded-lg bg-muted/50"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold text-muted-foreground w-5">{i + 1}</span>
                      <div>
                        <p className="font-medium text-sm">{source.source}</p>
                        <p className="text-xs text-muted-foreground">
                          {source.visitors} visit. • {source.leads} leads
                        </p>
                      </div>
                    </div>
                    <span className={cn(
                      "text-xs font-medium px-2 py-1 rounded",
                      source.conversionRate >= 5 ? "bg-green-100 text-green-700" :
                      source.conversionRate >= 2 ? "bg-yellow-100 text-yellow-700" :
                      "bg-red-100 text-red-700"
                    )}>
                      {source.conversionRate.toFixed(1)}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export const DashboardSection = () => {
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: startOfDay(subDays(new Date(), 6)),
    to: endOfDay(new Date()),
  });

  return (
    <div className="space-y-6">
      {/* Date Range Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-lg font-semibold">Analytics</h2>
        <DateRangeFilter value={dateRange} onChange={setDateRange} />
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            <span className="hidden sm:inline">Visão Geral</span>
          </TabsTrigger>
          <TabsTrigger value="funnel" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            <span className="hidden sm:inline">Funil</span>
          </TabsTrigger>
          <TabsTrigger value="email" className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            <span className="hidden sm:inline">E-mail</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <OverviewTab dateRange={dateRange} />
        </TabsContent>

        <TabsContent value="funnel">
          <MarketingFunnelSection dateRange={dateRange} />
        </TabsContent>

        <TabsContent value="email">
          <EmailPerformanceSection />
        </TabsContent>
      </Tabs>
    </div>
  );
};
