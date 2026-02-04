import { useEmailDashboard } from "@/hooks/useEmailDashboard";
import { useEmailMetrics } from "@/hooks/useMarketingFunnel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Mail, MailOpen, MousePointer, AlertTriangle, Send, CheckCircle } from "lucide-react";
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

const COLORS = ['hsl(var(--primary))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))'];

export const EmailPerformanceSection = () => {
  const { metrics: emailStats, isLoading: emailLoading } = useEmailDashboard();
  const { data: emailMetrics, isLoading: metricsLoading } = useEmailMetrics();

  const isLoading = emailLoading || metricsLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Dados para o gráfico de pizza
  const funnelPieData = [
    { name: "Email 1", value: emailStats?.totalEmail1 || 0 },
    { name: "Email 2", value: emailStats?.totalEmail2 || 0 },
    { name: "Email 3", value: emailStats?.totalEmail3 || 0 },
  ].filter(d => d.value > 0);

  // Dados para o gráfico de barras (performance por tipo)
  const emailTypeData = [
    { 
      name: "Boas-vindas",
      enviados: emailStats?.totalEmail1 || 0,
    },
    { 
      name: "Curso",
      enviados: emailStats?.totalEmail2 || 0,
    },
    { 
      name: "Oferta",
      enviados: emailStats?.totalEmail3 || 0,
    },
  ];

  return (
    <div className="space-y-6">
      {/* KPIs de Email */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-full">
                <Send className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{emailMetrics?.sent || 0}</p>
                <p className="text-xs text-muted-foreground">Enviados</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-full">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{emailMetrics?.delivered || 0}</p>
                <p className="text-xs text-muted-foreground">Entregues</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-full">
                <MailOpen className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{emailMetrics?.opened || 0}</p>
                <p className="text-xs text-muted-foreground">Abertos</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-100 rounded-full">
                <MousePointer className="h-5 w-5 text-indigo-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{emailMetrics?.clicked || 0}</p>
                <p className="text-xs text-muted-foreground">Cliques</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-full">
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{emailMetrics?.bounced || 0}</p>
                <p className="text-xs text-muted-foreground">Bounces</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-full">
                <Mail className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{emailStats?.unsubscribed || 0}</p>
                <p className="text-xs text-muted-foreground">Descadastros</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Taxas de Performance */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-green-200 bg-green-50/50">
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-green-700">
              {emailMetrics?.deliveryRate.toFixed(1) || 0}%
            </p>
            <p className="text-sm text-muted-foreground">Taxa de Entrega</p>
          </CardContent>
        </Card>

        <Card className="border-purple-200 bg-purple-50/50">
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-purple-700">
              {emailMetrics?.openRate.toFixed(1) || 0}%
            </p>
            <p className="text-sm text-muted-foreground">Taxa de Abertura</p>
          </CardContent>
        </Card>

        <Card className="border-indigo-200 bg-indigo-50/50">
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-indigo-700">
              {emailMetrics?.clickRate.toFixed(1) || 0}%
            </p>
            <p className="text-sm text-muted-foreground">Taxa de Clique</p>
          </CardContent>
        </Card>

        <Card className="border-red-200 bg-red-50/50">
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-red-700">
              {emailMetrics?.bounceRate.toFixed(1) || 0}%
            </p>
            <p className="text-sm text-muted-foreground">Taxa de Bounce</p>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Envios por Tipo */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Envios por Tipo de Email</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={emailTypeData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="enviados" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Distribuição do Funil */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Distribuição do Funil de Email</CardTitle>
          </CardHeader>
          <CardContent>
            {funnelPieData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={funnelPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {funnelPieData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[250px] flex items-center justify-center text-muted-foreground">
                Nenhum email enviado ainda
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Envios Diários */}
      {emailStats?.dailyData && emailStats.dailyData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Envios nos Últimos 7 Dias</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={emailStats.dailyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="email1" 
                  name="Email 1"
                  stroke="hsl(var(--primary))" 
                  strokeWidth={2}
                  dot={{ fill: "hsl(var(--primary))" }}
                />
                <Line 
                  type="monotone" 
                  dataKey="email2" 
                  name="Email 2"
                  stroke="hsl(var(--chart-2))" 
                  strokeWidth={2}
                  dot={{ fill: "hsl(var(--chart-2))" }}
                />
                <Line 
                  type="monotone" 
                  dataKey="email3" 
                  name="Email 3"
                  stroke="hsl(var(--chart-3))" 
                  strokeWidth={2}
                  dot={{ fill: "hsl(var(--chart-3))" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Aviso sobre Resend Webhooks */}
      <Card className="border-amber-200 bg-amber-50/50">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
            <div>
              <p className="font-medium text-amber-800">Configure os Webhooks do Resend</p>
              <p className="text-sm text-amber-700 mt-1">
                Para obter dados de abertura e cliques, configure o webhook no Resend:
              </p>
              <ol className="text-sm text-amber-700 mt-2 list-decimal ml-4 space-y-1">
                <li>Acesse <strong>resend.com/webhooks</strong></li>
                <li>Clique em "Add Webhook"</li>
                <li>Cole a URL: <code className="bg-amber-100 px-1 rounded">https://zdjtcwtakgizbsbbwtgc.supabase.co/functions/v1/resend-webhook</code></li>
                <li>Selecione: sent, delivered, opened, clicked, bounced</li>
              </ol>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
