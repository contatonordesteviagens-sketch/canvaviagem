import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface PublicSite {
  id: string;
  created_at: string;
  updated_at: string;
  owner_id: string | null;
  // html is excluded from list view to save bandwidth
}

export const useGeneratedSites = () => {
  return useQuery({
    queryKey: ["public-sites"],
    queryFn: async () => {
      const isEs = typeof window !== 'undefined' && window.location.pathname.startsWith('/es');
      const locale = isEs ? 'es' : 'pt-BR';
      const { data, error } = await supabase
        .from("public_sites")
        .select("id, created_at, updated_at, owner_id")
        .eq("locale", locale)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as PublicSite[];
    },
  });
};

export const useDeleteGeneratedSite = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("public_sites").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["public-sites"] });
    },
  });
};
