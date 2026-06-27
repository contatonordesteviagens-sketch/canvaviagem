import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface UserSite {
  id: string;
  created_at: string;
  updated_at: string;
  html: string;
}

export interface UserDetails {
  phone: string | null;
  images_generated: number;
  total_activities: number;
  last_active: string | null;
  sites: UserSite[];
}

export const useUserDetails = (userId: string | null) => {
  return useQuery({
    queryKey: ["user-details", userId],
    enabled: !!userId,
    queryFn: async (): Promise<UserDetails> => {
      // Fetch phone from profiles
      const { data: profile } = await supabase
        .from("profiles")
        .select("phone")
        .eq("user_id", userId)
        .maybeSingle();

      let phone = profile?.phone || null;

      // Fetch from leads if still null
      if (!phone) {
        const { data: lead } = await (supabase as any)
          .from("leads")
          .select("whatsapp")
          .eq("user_id", userId)
          .maybeSingle();
        if (lead?.whatsapp) {
          phone = lead.whatsapp;
        }
      }

      // Fetch activities
      const { data: activities } = await supabase
        .from("user_activities")
        .select("activity_type, created_at")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      const imagesGenerated = activities?.filter(a => a.activity_type === "art").length || 0;
      const totalActivities = activities?.length || 0;
      const lastActive = activities && activities.length > 0 ? activities[0].created_at : null;

      // Fetch sites
      const { data: sitesData } = await supabase
        .from("public_sites")
        .select("id, created_at, updated_at, html")
        .eq("owner_id", userId)
        .order("created_at", { ascending: false });

      return {
        phone,
        images_generated: imagesGenerated,
        total_activities: totalActivities,
        last_active: lastActive,
        sites: sitesData || []
      };
    }
  });
};

export const useDeleteUserSite = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (siteId: string) => {
      const { error } = await supabase
        .from("public_sites")
        .delete()
        .eq("id", siteId);
      
      if (error) throw error;
      return siteId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-details"] });
    }
  });
};
