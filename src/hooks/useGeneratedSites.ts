import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface PublicSite {
  id: string;
  created_at: string;
  updated_at: string;
  owner_id: string | null;
  // html is excluded from list view to save bandwidth
}

export const useGeneratedSites = () => {
  const { user } = useAuth();
  const isEs = typeof window !== "undefined" && window.location.pathname.startsWith("/es");
  const locale = isEs ? "es" : "pt-BR";

  return useQuery({
    queryKey: ["public-sites", user?.id, locale],
    queryFn: async () => {
      if (!user?.id) return [] as PublicSite[];
      const { data, error } = await supabase
        .from("public_sites")
        .select("id, created_at, updated_at, owner_id")
        .eq("owner_id", user.id)
        .eq("locale", locale)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as PublicSite[];
    },
    enabled: !!user?.id,
  });
};

export const useDeleteGeneratedSite = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (id: string) => {
      if (!user?.id) throw new Error("Faça login para excluir o site.");
      const { error } = await supabase.from("public_sites").delete().eq("id", id).eq("owner_id", user.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["public-sites"] });
    },
  });
};
