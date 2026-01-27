import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

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

interface EmailMetrics {
  totalSent: number;
  totalOpened: number;
  totalClicked: number;
  openRate: number;
  clickRate: number;
  topEmail: string | null;
}

interface FunnelStage {
  name: string;
  value: number;
  percentage: number;
}

interface MarketingStats {
  sources: MarketingSource[];
  totalVisitors: number;
  totalLeads: number;
  totalSubscribers: number;
  totalRevenue: number;
  overallConversion: number;
  emailMetrics: EmailMetrics;
  funnel: FunnelStage[];
  topSource: MarketingSource | null;
}

export const useMarketingStats = () => {
  return useQuery<MarketingStats>({
    queryKey: ["marketing-stats"],
    queryFn: async () => {
      // Fetch aggregated data from the marketing_stats view
      const { data: sources, error: sourcesError } = await supabase
        .from("marketing_stats")
        .select("*");

      if (sourcesError) throw sourcesError;

      // Fetch email events for metrics
      const { data: emailEvents, error: emailError } = await supabase
        .from("email_events")
        .select("*");

      if (emailError) throw emailError;

      // Fetch email automations for engaged users count
      const { data: emailAutomations, error: autoError } = await supabase
        .from("user_email_automations")
        .select("*");

      if (autoError) throw autoError;

      // Calculate totals
      const typedSources = (sources || []) as MarketingSource[];
      const totalVisitors = typedSources.reduce((acc, s) => acc + Number(s.visitors || 0), 0);
      const totalLeads = typedSources.reduce((acc, s) => acc + Number(s.leads || 0), 0);
      const totalSubscribers = typedSources.reduce((acc, s) => acc + Number(s.subscribers || 0), 0);
      const totalRevenue = typedSources.reduce((acc, s) => acc + Number(s.revenue || 0), 0);
      const overallConversion = totalVisitors > 0 
        ? ((totalSubscribers / totalVisitors) * 100) 
        : 0;

      // Calculate email metrics
      const sentEvents = (emailEvents || []).filter(e => e.type === "sent" || e.type === "email.sent");
      const openedEvents = (emailEvents || []).filter(e => e.type === "opened" || e.type === "email.opened");
      const clickedEvents = (emailEvents || []).filter(e => e.type === "clicked" || e.type === "email.clicked");

      const totalSent = sentEvents.length;
      const totalOpened = openedEvents.length;
      const totalClicked = clickedEvents.length;
      const openRate = totalSent > 0 ? (totalOpened / totalSent) * 100 : 0;
      const clickRate = totalOpened > 0 ? (totalClicked / totalOpened) * 100 : 0;

      // Find top performing email type
      const emailTypeCounts: Record<string, number> = {};
      clickedEvents.forEach(e => {
        const emailType = e.email_type || "unknown";
        emailTypeCounts[emailType] = (emailTypeCounts[emailType] || 0) + 1;
      });
      const topEmail = Object.entries(emailTypeCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || null;

      // Calculate engaged users (opened at least 1 email)
      const engagedUsers = (emailAutomations || []).filter(a => 
        a.email_1_sent_at || a.email_2_sent_at || a.email_3_sent_at
      ).length;

      // Build funnel
      const funnel: FunnelStage[] = [
        { 
          name: "Visitantes", 
          value: totalVisitors,
          percentage: 100 
        },
        { 
          name: "Leads (Cadastros)", 
          value: totalLeads,
          percentage: totalVisitors > 0 ? (totalLeads / totalVisitors) * 100 : 0 
        },
        { 
          name: "Engajados (Email)", 
          value: engagedUsers,
          percentage: totalLeads > 0 ? (engagedUsers / totalLeads) * 100 : 0 
        },
        { 
          name: "Assinantes", 
          value: totalSubscribers,
          percentage: engagedUsers > 0 ? (totalSubscribers / engagedUsers) * 100 : 0 
        },
      ];

      // Find top source by revenue
      const topSource = typedSources.length > 0 
        ? typedSources.reduce((best, s) => 
            Number(s.revenue) > Number(best.revenue) ? s : best
          )
        : null;

      return {
        sources: typedSources,
        totalVisitors,
        totalLeads,
        totalSubscribers,
        totalRevenue,
        overallConversion,
        emailMetrics: {
          totalSent,
          totalOpened,
          totalClicked,
          openRate,
          clickRate,
          topEmail,
        },
        funnel,
        topSource,
      };
    },
    staleTime: 1000 * 60 * 2, // 2 minutes cache
  });
};
