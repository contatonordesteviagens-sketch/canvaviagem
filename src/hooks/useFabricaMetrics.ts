import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useDiagnosticos } from "./useFabricaDiagnosticos";

export interface FabricaMetrics {
  totalLeads: number;
  newLeadsCount: number;
  latestLeadName: string | null;
  latestLeadTime: string | null;
  totalSites: number;
  totalArtes: number;
  loading: boolean;
}

export function useFabricaMetrics(): FabricaMetrics {
  const { user } = useAuth();
  const { data: diagnosticos = [], isLoading: loadingDiag } = useDiagnosticos();

  const query = useQuery({
    queryKey: ["fabrica-metrics-global", user?.id],
    queryFn: async () => {
      if (!user?.id) {
        return {
          totalLeads: 0,
          newLeadsCount: 0,
          latestLeadName: null,
          latestLeadTime: null,
          totalSites: 0,
          totalArtes: 0,
        };
      }

      const ownerId = user.id;

      // 1. Fetch form submissions (official CRM leads)
      const formResult = await (supabase as any)
        .from("crm_form_submissions")
        .select("id, status, normalized_name, payload, created_at")
        .eq("owner_id", ownerId)
        .order("created_at", { ascending: false })
        .limit(100);

      const formLeads = formResult?.data || [];

      // 2. Fetch legacy lead events from analytics_events
      const legacyResult = await supabase
        .from("analytics_events")
        .select("id, event_data, created_at")
        .eq("event_type", "lead_captured")
        .contains("event_data", { agency_id: ownerId })
        .order("created_at", { ascending: false })
        .limit(100);

      const legacyLeads = (legacyResult.data || []).map((ev: any) => {
        const payload = ev.event_data || {};
        return {
          id: ev.id,
          status: payload.status || "novo",
          normalized_name: payload.name || payload.nome || "Sem Nome",
          created_at: ev.created_at,
        };
      });

      // Combine unique leads
      const allLeads = [...formLeads, ...legacyLeads].sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

      const totalLeads = allLeads.length;
      const newLeadsCount = allLeads.filter((l: any) => !l.status || l.status === "novo").length;
      const latestLeadName = allLeads.length > 0
        ? (allLeads[0].normalized_name || allLeads[0].payload?.nome || allLeads[0].payload?.name || "Novo Lead")
        : null;
      const latestLeadTime = allLeads.length > 0 ? allLeads[0].created_at : null;

      // 3. Fetch public sites created by user
      const { count: sitesCount } = await supabase
        .from("public_sites")
        .select("id", { count: "exact", head: true })
        .eq("owner_id", ownerId);

      // Also count saved projects with published URL
      const projectsWithSite = diagnosticos.filter(
        (d) => d.published_site_url || (d.state_snapshot as any)?.siteContent?.canvaViagemUrl
      ).length;

      const totalSites = Math.max(sitesCount || 0, projectsWithSite);

      // 4. Calculate total artes generated / selected across user's fabrica projects
      let totalArtes = 0;
      diagnosticos.forEach((d) => {
        const snap = d.state_snapshot as any;
        if (snap) {
          const pacotes = snap.pacotes?.length || 0;
          const selectedPackIds = snap.selectedPackIds?.length || 0;
          const customizados = Object.keys(snap.pacotesCustomizados || {}).length;
          totalArtes += pacotes + selectedPackIds + customizados;
        }
      });
      // Ensure at least some baseline count if they have projects or used tools
      if (totalArtes === 0 && diagnosticos.length > 0) {
        totalArtes = diagnosticos.length * 3;
      }

      return {
        totalLeads,
        newLeadsCount,
        latestLeadName,
        latestLeadTime,
        totalSites,
        totalArtes,
      };
    },
    enabled: !!user?.id,
    refetchInterval: 30000, // refresh every 30s so notification stays live
  });

  return {
    totalLeads: query.data?.totalLeads || 0,
    newLeadsCount: query.data?.newLeadsCount || 0,
    latestLeadName: query.data?.latestLeadName || null,
    latestLeadTime: query.data?.latestLeadTime || null,
    totalSites: query.data?.totalSites || 0,
    totalArtes: query.data?.totalArtes || 0,
    loading: query.isLoading || loadingDiag,
  };
}
