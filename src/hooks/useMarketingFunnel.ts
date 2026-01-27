import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface FunnelMetrics {
  // Números absolutos
  visitors: number;
  leads: number;
  email1Sent: number;
  email1Opened: number;
  email2Sent: number;
  email2Opened: number;
  email3Sent: number;
  email3Opened: number;
  subscribers: number;
  
  // Taxas de conversão
  conversionRates: {
    visitorToLead: number;
    leadToEmail1: number;
    email1Opened: number;
    email1ToEmail2: number;
    email2ToEmail3: number;
    email3ToSubscriber: number;
    overallConversion: number;
  };
  
  // Dados por fonte
  sourceData: {
    source: string;
    visitors: number;
    leads: number;
    subscribers: number;
    conversionRate: number;
  }[];
  
  // Dados diários
  dailyData: {
    date: string;
    visitors: number;
    leads: number;
    subscribers: number;
  }[];
}

export interface EmailMetrics {
  sent: number;
  delivered: number;
  opened: number;
  clicked: number;
  bounced: number;
  deliveryRate: number;
  openRate: number;
  clickRate: number;
  bounceRate: number;
}

export interface DateRangeParam {
  from?: Date;
  to?: Date;
}

export const useMarketingFunnel = (dateRange?: DateRangeParam) => {
  return useQuery<FunnelMetrics>({
    queryKey: ["marketing-funnel", dateRange?.from?.toISOString(), dateRange?.to?.toISOString()],
    queryFn: async () => {
      // Construir queries com filtro de data
      let trafficQuery = supabase.from("traffic_sources").select("*").order("created_at", { ascending: false });
      let automationsQuery = supabase.from("user_email_automations").select("*");
      let subscriptionsQuery = supabase.from("subscriptions").select("*").eq("status", "active");
      let emailEventsQuery = supabase.from("email_events").select("*");
      let pageViewsQuery = supabase.from("page_views").select("*");

      // Aplicar filtro de data se existir
      if (dateRange?.from) {
        const fromISO = dateRange.from.toISOString();
        trafficQuery = trafficQuery.gte("created_at", fromISO);
        automationsQuery = automationsQuery.gte("created_at", fromISO);
        subscriptionsQuery = subscriptionsQuery.gte("created_at", fromISO);
        emailEventsQuery = emailEventsQuery.gte("created_at", fromISO);
        pageViewsQuery = pageViewsQuery.gte("viewed_at", fromISO);
      }
      if (dateRange?.to) {
        const toISO = dateRange.to.toISOString();
        trafficQuery = trafficQuery.lte("created_at", toISO);
        automationsQuery = automationsQuery.lte("created_at", toISO);
        subscriptionsQuery = subscriptionsQuery.lte("created_at", toISO);
        emailEventsQuery = emailEventsQuery.lte("created_at", toISO);
        pageViewsQuery = pageViewsQuery.lte("viewed_at", toISO);
      }

      // Buscar dados em paralelo
      const [
        trafficResult,
        automationsResult,
        subscriptionsResult,
        emailEventsResult,
        pageViewsResult,
      ] = await Promise.all([
        trafficQuery,
        automationsQuery,
        subscriptionsQuery,
        emailEventsQuery,
        pageViewsQuery,
      ]);

      const traffic = trafficResult.data || [];
      const automations = automationsResult.data || [];
      const subscriptions = subscriptionsResult.data || [];
      const emailEvents = emailEventsResult.data || [];
      const pageViews = pageViewsResult.data || [];

      // Métricas de email
      const email1Opened = emailEvents.filter(e => e.type === "opened" && e.email_type === "email_1").length;
      const email2Opened = emailEvents.filter(e => e.type === "opened" && e.email_type === "email_2").length;
      const email3Opened = emailEvents.filter(e => e.type === "opened" && e.email_type === "email_3").length;

      // Contadores
      const visitors = new Set(pageViews.map(p => p.user_id || p.id)).size || traffic.length;
      const leads = automations.length;
      const email1Sent = automations.filter(a => a.email_1_sent_at).length;
      const email2Sent = automations.filter(a => a.email_2_sent_at).length;
      const email3Sent = automations.filter(a => a.email_3_sent_at).length;
      const subscribers = subscriptions.length;

      // Taxas de conversão
      const conversionRates = {
        visitorToLead: visitors > 0 ? (leads / visitors) * 100 : 0,
        leadToEmail1: leads > 0 ? (email1Sent / leads) * 100 : 0,
        email1Opened: email1Sent > 0 ? (email1Opened / email1Sent) * 100 : 0,
        email1ToEmail2: email1Sent > 0 ? (email2Sent / email1Sent) * 100 : 0,
        email2ToEmail3: email2Sent > 0 ? (email3Sent / email2Sent) * 100 : 0,
        email3ToSubscriber: email3Sent > 0 ? (subscribers / email3Sent) * 100 : 0,
        overallConversion: visitors > 0 ? (subscribers / visitors) * 100 : 0,
      };

      // Agrupar por fonte
      const sourceMap = new Map<string, { visitors: number; leads: number; subscribers: number }>();
      
      traffic.forEach(t => {
        const source = t.utm_source || (t.referrer ? new URL(t.referrer).hostname : "Direto");
        const current = sourceMap.get(source) || { visitors: 0, leads: 0, subscribers: 0 };
        current.visitors++;
        sourceMap.set(source, current);
      });

      // Associar leads às fontes (simplificado)
      const sourceData = Array.from(sourceMap.entries()).map(([source, data]) => ({
        source,
        visitors: data.visitors,
        leads: data.leads,
        subscribers: data.subscribers,
        conversionRate: data.visitors > 0 ? (data.subscribers / data.visitors) * 100 : 0,
      })).sort((a, b) => b.visitors - a.visitors);

      // Dados diários (últimos 7 dias)
      const now = new Date();
      const dailyData = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split("T")[0];
        
        dailyData.push({
          date: date.toLocaleDateString("pt-BR", { weekday: "short", day: "numeric" }),
          visitors: traffic.filter(t => t.created_at?.startsWith(dateStr)).length,
          leads: automations.filter(a => a.created_at?.startsWith(dateStr)).length,
          subscribers: subscriptions.filter(s => s.created_at?.startsWith(dateStr)).length,
        });
      }

      return {
        visitors,
        leads,
        email1Sent,
        email1Opened,
        email2Sent,
        email2Opened,
        email3Sent,
        email3Opened,
        subscribers,
        conversionRates,
        sourceData,
        dailyData,
      };
    },
    staleTime: 1000 * 60 * 2, // 2 minutos
    refetchInterval: 1000 * 60 * 5, // 5 minutos
  });
};

export const useEmailMetrics = () => {
  return useQuery<EmailMetrics>({
    queryKey: ["email-metrics"],
    queryFn: async () => {
      const { data: events } = await supabase
        .from("email_events")
        .select("*");

      const allEvents = events || [];
      
      const sent = allEvents.filter(e => e.type === "sent").length;
      const delivered = allEvents.filter(e => e.type === "delivered").length;
      const opened = allEvents.filter(e => e.type === "opened").length;
      const clicked = allEvents.filter(e => e.type === "clicked").length;
      const bounced = allEvents.filter(e => e.type === "bounced").length;

      return {
        sent,
        delivered,
        opened,
        clicked,
        bounced,
        deliveryRate: sent > 0 ? (delivered / sent) * 100 : 0,
        openRate: delivered > 0 ? (opened / delivered) * 100 : 0,
        clickRate: opened > 0 ? (clicked / opened) * 100 : 0,
        bounceRate: sent > 0 ? (bounced / sent) * 100 : 0,
      };
    },
    staleTime: 1000 * 60 * 2,
  });
};
