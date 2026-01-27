import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  ResponsiveContainer, 
  Cell,
  LabelList 
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowDown } from "lucide-react";

interface FunnelStage {
  name: string;
  value: number;
  percentage: number;
}

interface FunnelChartProps {
  data: FunnelStage[];
}

const COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
];

export function FunnelChart({ data }: FunnelChartProps) {
  // Calculate conversion rates between stages
  const getConversionRate = (index: number) => {
    if (index === 0 || data[index - 1].value === 0) return null;
    const rate = (data[index].value / data[index - 1].value) * 100;
    return rate.toFixed(1);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span>📊</span>
          Funil de Conversão
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {data.map((stage, index) => {
            const conversionRate = getConversionRate(index);
            const widthPercentage = data[0].value > 0 
              ? Math.max((stage.value / data[0].value) * 100, 20) 
              : 100;

            return (
              <div key={stage.name} className="space-y-1">
                {index > 0 && (
                  <div className="flex items-center justify-center py-1">
                    <ArrowDown className="h-4 w-4 text-muted-foreground" />
                    {conversionRate && (
                      <span className="ml-2 text-xs font-medium text-muted-foreground">
                        {conversionRate}% conversão
                      </span>
                    )}
                  </div>
                )}
                <div 
                  className="relative mx-auto rounded-lg p-4 transition-all"
                  style={{ 
                    width: `${widthPercentage}%`,
                    backgroundColor: COLORS[index % COLORS.length],
                    opacity: 0.9,
                  }}
                >
                  <div className="flex items-center justify-between text-primary-foreground">
                    <span className="font-medium text-sm">{stage.name}</span>
                    <span className="font-bold text-lg">{stage.value.toLocaleString('pt-BR')}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Overall Conversion */}
        {data.length > 0 && data[0].value > 0 && (
          <div className="mt-6 pt-4 border-t">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Conversão Geral (Visitante → Assinante)</span>
              <span className="text-xl font-bold text-primary">
                {((data[data.length - 1].value / data[0].value) * 100).toFixed(2)}%
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
