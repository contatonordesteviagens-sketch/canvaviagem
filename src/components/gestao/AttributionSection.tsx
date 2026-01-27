import { useMarketingFunnel } from "@/hooks/useMarketingFunnel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, Globe, TrendingUp, Users, CreditCard } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";
import { cn } from "@/lib/utils";

export const AttributionSection = () => {
  const { data: funnel, isLoading, error } = useMarketingFunnel();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-destructive">Erro ao carregar dados de atribuição</p>
        </CardContent>
      </Card>
    );
  }

  if (!funnel) return null;

  // Dados para o gráfico de barras de fontes
  const sourceChartData = funnel.sourceData.slice(0, 6).map(s => ({
    name: s.source.length > 15 ? s.source.slice(0, 15) + "..." : s.source,
    visitantes: s.visitors,
    leads: s.leads,
    assinantes: s.subscribers,
  }));

  return (
    <div className="space-y-6">
      {/* Resumo de Fontes */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-full">
                <Globe className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{funnel.sourceData.length}</p>
                <p className="text-xs text-muted-foreground">Fontes Identificadas</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-full">
                <Users className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{funnel.visitors}</p>
                <p className="text-xs text-muted-foreground">Total Visitantes</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-full">
                <CreditCard className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{funnel.subscribers}</p>
                <p className="text-xs text-muted-foreground">Total Assinantes</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-full">
                <TrendingUp className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{funnel.conversionRates.overallConversion.toFixed(2)}%</p>
                <p className="text-xs text-muted-foreground">Conversão Geral</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Visitantes por Fonte */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Visitantes por Fonte</CardTitle>
          </CardHeader>
          <CardContent>
            {sourceChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={sourceChartData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="visitantes" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[250px] flex items-center justify-center text-muted-foreground">
                Nenhum dado de tráfego ainda
              </div>
            )}
          </CardContent>
        </Card>

        {/* Tendência Diária */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Tendência dos Últimos 7 Dias</CardTitle>
          </CardHeader>
          <CardContent>
            {funnel.dailyData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={funnel.dailyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                  <YAxis />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="visitors" 
                    name="Visitantes"
                    stroke="hsl(var(--primary))" 
                    strokeWidth={2}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="leads" 
                    name="Leads"
                    stroke="hsl(var(--chart-2))" 
                    strokeWidth={2}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="subscribers" 
                    name="Assinantes"
                    stroke="hsl(var(--chart-3))" 
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[250px] flex items-center justify-center text-muted-foreground">
                Nenhum dado diário ainda
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Tabela de Atribuição */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Atribuição por Fonte de Tráfego</CardTitle>
        </CardHeader>
        <CardContent>
          {funnel.sourceData.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fonte</TableHead>
                  <TableHead className="text-right">Visitantes</TableHead>
                  <TableHead className="text-right">Leads</TableHead>
                  <TableHead className="text-right">Assinantes</TableHead>
                  <TableHead className="text-right">Taxa Conv.</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {funnel.sourceData.map((source, i) => (
                  <TableRow key={i}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <Globe className="h-4 w-4 text-muted-foreground" />
                        {source.source}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">{source.visitors}</TableCell>
                    <TableCell className="text-right">{source.leads}</TableCell>
                    <TableCell className="text-right">{source.subscribers}</TableCell>
                    <TableCell className="text-right">
                      <span className={cn(
                        "px-2 py-1 rounded text-xs font-medium",
                        source.conversionRate >= 5 ? "bg-green-100 text-green-700" :
                        source.conversionRate >= 2 ? "bg-yellow-100 text-yellow-700" :
                        "bg-red-100 text-red-700"
                      )}>
                        {source.conversionRate.toFixed(2)}%
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Globe className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>Nenhuma fonte de tráfego rastreada ainda</p>
              <p className="text-sm mt-1">
                Use links com UTM (ex: ?utm_source=instagram&utm_medium=social) para rastrear suas campanhas
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dica de UTM */}
      <Card className="border-blue-200 bg-blue-50/50">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Globe className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <p className="font-medium text-blue-800">Dica: Use UTMs em seus links</p>
              <p className="text-sm text-blue-700 mt-1">
                Adicione parâmetros UTM aos seus links de marketing para rastrear a origem dos visitantes:
              </p>
              <code className="block text-xs bg-blue-100 p-2 rounded mt-2 text-blue-800">
                seusite.com/planos?utm_source=instagram&utm_medium=social&utm_campaign=janeiro
              </code>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
