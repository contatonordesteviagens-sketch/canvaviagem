import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface MarketingSource {
  source: string;
  medium: string;
  campaign: string;
  visitors: number;
  leads: number;
  subscribers: number;
  revenue: number;
  conversion_rate: number;
}

interface ROITableProps {
  data: MarketingSource[];
}

export function ROITable({ data }: ROITableProps) {
  // Get ROI indicator based on conversion rate
  const getROIIndicator = (conversionRate: number) => {
    if (conversionRate >= 3) {
      return { icon: TrendingUp, color: "text-green-500", label: "Alto" };
    } else if (conversionRate >= 1) {
      return { icon: Minus, color: "text-yellow-500", label: "Médio" };
    } else {
      return { icon: TrendingDown, color: "text-red-500", label: "Baixo" };
    }
  };

  // Sort by revenue descending
  const sortedData = [...data].sort((a, b) => Number(b.revenue) - Number(a.revenue));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span>💰</span>
          ROI por Canal de Aquisição
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Origem</TableHead>
                <TableHead>Mídia</TableHead>
                <TableHead className="text-right">Visitantes</TableHead>
                <TableHead className="text-right">Leads</TableHead>
                <TableHead className="text-right">Clientes</TableHead>
                <TableHead className="text-right">Receita</TableHead>
                <TableHead className="text-right">Conv. %</TableHead>
                <TableHead className="text-center">ROI</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                    Nenhum dado de tráfego ainda. Os dados aparecerão quando visitantes chegarem com parâmetros UTM.
                  </TableCell>
                </TableRow>
              ) : (
                sortedData.map((source, index) => {
                  const roi = getROIIndicator(Number(source.conversion_rate));
                  const ROIIcon = roi.icon;
                  
                  return (
                    <TableRow key={`${source.source}-${source.medium}-${source.campaign}-${index}`}>
                      <TableCell className="font-medium">
                        <Badge variant="outline">{source.source}</Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {source.medium}
                      </TableCell>
                      <TableCell className="text-right">
                        {Number(source.visitors).toLocaleString('pt-BR')}
                      </TableCell>
                      <TableCell className="text-right">
                        {Number(source.leads).toLocaleString('pt-BR')}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {Number(source.subscribers).toLocaleString('pt-BR')}
                      </TableCell>
                      <TableCell className="text-right font-bold text-green-600">
                        R$ {Number(source.revenue).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell className="text-right">
                        {Number(source.conversion_rate).toFixed(2)}%
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-1">
                          <ROIIcon className={`h-4 w-4 ${roi.color}`} />
                          <span className={`text-xs font-medium ${roi.color}`}>
                            {roi.label}
                          </span>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
        
        {/* Summary */}
        {sortedData.length > 0 && (
          <div className="mt-4 p-4 bg-muted/50 rounded-lg">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <p className="text-xs text-muted-foreground">Total Visitantes</p>
                <p className="text-lg font-bold">
                  {sortedData.reduce((acc, s) => acc + Number(s.visitors), 0).toLocaleString('pt-BR')}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total Leads</p>
                <p className="text-lg font-bold">
                  {sortedData.reduce((acc, s) => acc + Number(s.leads), 0).toLocaleString('pt-BR')}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total Clientes</p>
                <p className="text-lg font-bold">
                  {sortedData.reduce((acc, s) => acc + Number(s.subscribers), 0).toLocaleString('pt-BR')}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Receita Total</p>
                <p className="text-lg font-bold text-green-600">
                  R$ {sortedData.reduce((acc, s) => acc + Number(s.revenue), 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
