import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { getPlanLabel, getPlanValue } from "@/lib/planAccess";

export type AdminSiteInfo = {
  id: string;
  active: boolean;
  project_id: string | null;
  created_at: string;
  updated_at: string;
  suspended_at: string | null;
  suspension_reason: string | null;
};

export type AdminUserIntelligence = {
  // Identidade
  user_id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  created_at: string;
  utm_source: string | null;

  // Plano (valores brutos da RPC)
  plan: "elite" | "start" | "inactive" | "trial_expired";
  subscription_status: string;
  billing_cycle: string | null;
  current_period_end: string | null;
  trial_ends_at: string | null;

  // Campos computados (adicionados pelo hook)
  plan_name: string;   // ex: "Plano Elite"
  plan_value: string;  // ex: "R$ 1.597,00/ano"
  origem: string;      // ex: "Stripe"

  // Sites
  site_count: number;
  active_site_count: number;
  sites: AdminSiteInfo[];

  // Métricas de uso da Fábrica
  ad_generations: number;
  carousel_generations: number;
  ad_downloads: number;
  carousel_downloads: number;
  project_count: number;

  // Métricas do site publicado
  site_visits: number;
  site_clicks: number;
  leads: number;
  conversion_rate: number;
  last_activity: string | null;

  // Alertas
  abuse_related_accounts: number;
  alert: string | null;
};

export const useAdminUserIntelligence = () =>
  useQuery({
    queryKey: ["admin-user-intelligence"],
    queryFn: async () => {
      const { data, error } = await (supabase.rpc as any)("admin_user_intelligence");
      if (error) throw error;

      const rows = Array.isArray(data) ? data : [];

      // Enriquecer cada linha com campos computados
      return rows.map((row: any): AdminUserIntelligence => ({
        user_id: row.user_id,
        name: row.name ?? null,
        email: row.email ?? null,
        phone: row.phone ?? null,
        created_at: row.created_at,
        utm_source: row.utm_source ?? null,

        plan: row.plan,
        subscription_status: row.subscription_status ?? "none",
        billing_cycle: row.billing_cycle ?? null,
        current_period_end: row.current_period_end ?? null,
        trial_ends_at: row.trial_ends_at ?? null,

        // Campos computados
        plan_name: getPlanLabel(row.plan),
        plan_value: getPlanValue(row.plan, row.billing_cycle),
        origem: row.subscription_status !== "none" ? "Stripe" : "Orgânico",

        site_count: row.site_count ?? 0,
        active_site_count: row.active_site_count ?? 0,
        sites: Array.isArray(row.sites) ? row.sites : [],

        ad_generations: row.ad_generations ?? 0,
        carousel_generations: row.carousel_generations ?? 0,
        ad_downloads: row.ad_downloads ?? 0,
        carousel_downloads: row.carousel_downloads ?? 0,
        project_count: row.project_count ?? 0,

        site_visits: row.site_visits ?? 0,
        site_clicks: row.site_clicks ?? 0,
        leads: row.leads ?? 0,
        conversion_rate: row.conversion_rate ?? 0,
        last_activity: row.last_activity ?? null,

        abuse_related_accounts: row.abuse_related_accounts ?? 0,
        alert: row.alert ?? null,
      }));
    },
    staleTime: 60_000,
  });
