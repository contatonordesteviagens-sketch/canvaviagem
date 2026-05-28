import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useIsAdmin } from "./useContent";
import type { DateRange } from "react-day-picker";

export interface StripeDashboardData {
  mrr: number;
  activeSubscribers: number;
  totalCustomers: number;
  churnRate: number;
  currentMonthRevenue: number;
  lastMonthRevenue: number;
  growth: number;
  revenueChartData: { month: string; revenue: number }[];
  subscriptionChartData: { month: string; subscriptions: number }[];
  // Novas métricas
  totalRevenue: number;
  averageTicket: number;
  estimatedLTV: number;
  monthlyChurns: number;
  trialingCount: number;
}

export const useStripeDashboard = (dateRange?: DateRange) => {
  const { data: isAdmin } = useIsAdmin();

  return useQuery<StripeDashboardData>({
    queryKey: ["stripe-dashboard", dateRange?.from, dateRange?.to],
    queryFn: async () => {
      const body = {
        from: dateRange?.from?.toISOString(),
        to: dateRange?.to?.toISOString(),
      };
      const { data, error } = await supabase.functions.invoke("stripe-dashboard", {
        body,
      });

      if (error) {
        console.error("Error fetching stripe dashboard:", error);
        throw error;
      }

      return data as StripeDashboardData;
    },
    enabled: isAdmin === true,
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
  });
};
