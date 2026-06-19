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

      // Fetch phone from hotmart_sales if not in profile
      let phone = profile?.phone || null;
      
      if (!phone) {
        // Try getting email from subscriptions to check hotmart_sales
        const { data: sub } = await supabase
          .from("subscriptions")
          .select("user_id, status")
          .eq("user_id", userId)
          .maybeSingle();

        if (sub) {
          // Find email using admin view
          try {
            const session = await supabase.auth.getSession();
            const response = await fetch(
              `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/profiles_admin_view?select=email_masked&user_id=eq.${userId}`,
              {
                headers: {
                  'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
                  'Authorization': `Bearer ${session.data.session?.access_token}`,
                },
              }
            );
            if (response.ok) {
              const resJson = await response.json();
              if (resJson && resJson.length > 0 && resJson[0].email_masked) {
                const { data: hotmartSale } = await supabase
                  .from("hotmart_sales")
                  .select("h_buyer_phone")
                  .eq("h_email", resJson[0].email_masked)
                  .maybeSingle();
                
                if (hotmartSale?.h_buyer_phone) {
                  phone = hotmartSale.h_buyer_phone;
                }
              }
            }
          } catch (e) {
            console.error("Error fetching email for hotmart check", e);
          }
        }
      }

      // Fetch from leads if still null
      if (!phone) {
        const { data: lead } = await supabase
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
