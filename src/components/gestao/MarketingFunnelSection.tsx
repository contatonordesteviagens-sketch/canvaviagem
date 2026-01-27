import { useMarketingFunnel, DateRangeParam } from "@/hooks/useMarketingFunnel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Users, Mail, MailOpen, MousePointer, CreditCard, ArrowDown, TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";
import type { DateRange } from "react-day-picker";

interface FunnelStepProps {
  icon: React.ReactNode;
  label: string;
  value: number;
  conversionRate?: number;
  previousValue?: number;
  color: string;
  isLast?: boolean;
}

const FunnelStep = ({ icon, label, value, conversionRate, color, isLast }: FunnelStepProps) => {
  return (
    <div className="flex flex-col items-center">
      <div 
        className={cn(
          "w-full max-w-md p-4 rounded-lg border-2 transition-all hover:shadow-md",
          color
        )}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-background/50 rounded-full">
              {icon}
            </div>
            <div>
              <p className="font-semibold text-foreground">{label}</p>
              <p className="text-2xl font-bold text-foreground">{value.toLocaleString("pt-BR")}</p>
            </div>
          </div>
        </div>
      </div>
      
      {!isLast && (
        <div className="flex flex-col items-center my-2">
          <ArrowDown className="h-6 w-6 text-muted-foreground" />
          {conversionRate !== undefined && (
            <span className={cn(
              "text-sm font-medium px-2 py-1 rounded",
              conversionRate >= 50 ? "bg-green-100 text-green-700" :
              conversionRate >= 20 ? "bg-yellow-100 text-yellow-700" :
              "bg-red-100 text-red-700"
            )}>
              {conversionRate.toFixed(1)}% conversão
            </span>
          )}
        </div>
      )}
    </div>
  );
};

interface MarketingFunnelSectionProps {
  dateRange?: DateRange;
}

export const MarketingFunnelSection = ({ dateRange }: MarketingFunnelSectionProps) => {
  const dateRangeParam: DateRangeParam | undefined = dateRange ? { from: dateRange.from, to: dateRange.to } : undefined;
  const { data: funnel, isLoading, error } = useMarketingFunnel(dateRangeParam);

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
          <p className="text-destructive">Erro ao carregar dados do funil</p>
        </CardContent>
      </Card>
    );
  }

  if (!funnel) return null;

  return (
    <div className="space-y-6">
      {/* Resumo do Funil */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-blue-200 bg-blue-50/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Users className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{funnel.visitors}</p>
                <p className="text-sm text-muted-foreground">Visitantes</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-purple-200 bg-purple-50/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-2xl font-bold">{funnel.leads}</p>
                <p className="text-sm text-muted-foreground">Leads</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-green-200 bg-green-50/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <CreditCard className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-2xl font-bold">{funnel.subscribers}</p>
                <p className="text-sm text-muted-foreground">Assinantes</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              {funnel.conversionRates.overallConversion >= 1 ? (
                <TrendingUp className="h-5 w-5 text-primary" />
              ) : (
                <TrendingDown className="h-5 w-5 text-destructive" />
              )}
              <div>
                <p className="text-2xl font-bold">{funnel.conversionRates.overallConversion.toFixed(2)}%</p>
                <p className="text-sm text-muted-foreground">Conversão Total</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Funil Visual */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Funil de Conversão Completo</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center space-y-0">
          <FunnelStep
            icon={<Users className="h-5 w-5 text-blue-600" />}
            label="Visitantes"
            value={funnel.visitors}
            conversionRate={funnel.conversionRates.visitorToLead}
            color="border-blue-300 bg-blue-50"
          />
          
          <FunnelStep
            icon={<Mail className="h-5 w-5 text-purple-600" />}
            label="Leads (Cadastros)"
            value={funnel.leads}
            conversionRate={funnel.conversionRates.leadToEmail1}
            color="border-purple-300 bg-purple-50"
          />
          
          <FunnelStep
            icon={<MailOpen className="h-5 w-5 text-indigo-600" />}
            label="Email 1 Enviado"
            value={funnel.email1Sent}
            conversionRate={funnel.conversionRates.email1ToEmail2}
            color="border-indigo-300 bg-indigo-50"
          />
          
          <FunnelStep
            icon={<MailOpen className="h-5 w-5 text-violet-600" />}
            label="Email 2 Enviado"
            value={funnel.email2Sent}
            conversionRate={funnel.conversionRates.email2ToEmail3}
            color="border-violet-300 bg-violet-50"
          />
          
          <FunnelStep
            icon={<MousePointer className="h-5 w-5 text-pink-600" />}
            label="Email 3 Enviado"
            value={funnel.email3Sent}
            conversionRate={funnel.conversionRates.email3ToSubscriber}
            color="border-pink-300 bg-pink-50"
          />
          
          <FunnelStep
            icon={<CreditCard className="h-5 w-5 text-green-600" />}
            label="Assinantes Pagantes"
            value={funnel.subscribers}
            color="border-green-300 bg-green-50"
            isLast
          />
        </CardContent>
      </Card>

      {/* Taxas de Conversão Detalhadas */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Taxas de Conversão por Etapa</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { label: "Visitante → Lead", value: funnel.conversionRates.visitorToLead },
              { label: "Lead → Email 1", value: funnel.conversionRates.leadToEmail1 },
              { label: "Email 1 Aberto", value: funnel.conversionRates.email1Opened },
              { label: "Email 1 → Email 2", value: funnel.conversionRates.email1ToEmail2 },
              { label: "Email 2 → Email 3", value: funnel.conversionRates.email2ToEmail3 },
              { label: "Email 3 → Assinante", value: funnel.conversionRates.email3ToSubscriber },
            ].map((item, i) => (
              <div 
                key={i} 
                className={cn(
                  "text-center p-3 rounded-lg",
                  item.value >= 50 ? "bg-green-50 text-green-700" :
                  item.value >= 20 ? "bg-yellow-50 text-yellow-700" :
                  "bg-red-50 text-red-700"
                )}
              >
                <p className="text-2xl font-bold">{item.value.toFixed(1)}%</p>
                <p className="text-xs">{item.label}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
