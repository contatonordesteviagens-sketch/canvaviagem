import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type AdminSiteInfo = {
  id: string; active: boolean; project_id: string | null; created_at: string;
  updated_at: string; suspended_at: string | null; suspension_reason: string | null;
};

export type AdminUserIntelligence = {
  user_id: string; name: string | null; email: string | null; phone: string | null;
  created_at: string; plan: "elite" | "start" | "inactive" | "trial_expired";
  subscription_status: string; billing_cycle: string | null; current_period_end: string | null;
  site_count: number; active_site_count: number; sites: AdminSiteInfo[];
  site_visits: number; site_clicks: number; leads: number; conversion_rate: number;
  alert: string | null;
};

export const useAdminUserIntelligence = () => useQuery({
  queryKey: ["admin-user-intelligence"],
  queryFn: async () => {
    const { data, error } = await (supabase.rpc as any)("admin_user_intelligence");
    if (error) throw error;
    return (Array.isArray(data) ? data : []) as AdminUserIntelligence[];
  },
  staleTime: 60_000,
});
