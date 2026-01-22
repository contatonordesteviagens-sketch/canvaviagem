import { useEmailDashboard } from "@/hooks/useEmailDashboard";
import { useAdminDashboard, usePageViews } from "@/hooks/useAdminDashboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Users, MousePointer, TrendingUp, Activity } from "lucide-react";
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
} from "recharts";

const COLORS = ['hsl(var(--primary))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];

export const DashboardSection = () => {
  const { data: stats, isLoading } = useAdminDashboard();
  const { data: pageViews } = usePageViews();
  const { metrics: emailStats, isLoading: emailLoading } = useEmailDashboard();

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

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-full">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats?.activeSubscribers || 0}</p>
                <p className="text-sm text-muted-foreground">Assinantes Ativos</p>
              </div>
            </div>
          </CardContent>
        </Card>

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
                <TrendingUp className="h-6 w-6 text-secondary-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats?.totalSubscribers || 0}</p>
                <p className="text-sm text-muted-foreground">Total Assinaturas</p>
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
      </div>

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
      </div>

      {/* Page Views */}
      {pageViews && pageViews.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Páginas Mais Acessadas</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={pageViews.slice(0, 8)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="path" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

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
    </div>
  );
};
