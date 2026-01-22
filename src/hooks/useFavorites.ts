import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface Favorite {
  id: string;
  user_id: string;
  content_type: "content_item" | "caption" | "marketing_tool";
  content_id: string;
  created_at: string;
}

export const useFavorites = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Buscar todos os favoritos do usuário
  const favorites = useQuery({
    queryKey: ["favorites", user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from("user_favorites")
        .select("*")
        .eq("user_id", user.id);

      if (error) throw error;
      return data as Favorite[];
    },
    enabled: !!user,
    staleTime: 1000 * 60 * 5,
  });

  // Verificar se um item está favoritado
  const isFavorite = (contentType: string, contentId: string): boolean => {
    return favorites.data?.some(
      (f) => f.content_type === contentType && f.content_id === contentId
    ) ?? false;
  };

  // Toggle favorito (adicionar ou remover)
  const toggleFavorite = useMutation({
    mutationFn: async ({
      contentType,
      contentId,
    }: {
      contentType: "content_item" | "caption" | "marketing_tool";
      contentId: string;
    }) => {
      if (!user) throw new Error("User not authenticated");

      const existing = favorites.data?.find(
        (f) => f.content_type === contentType && f.content_id === contentId
      );

      if (existing) {
        // Remover favorito
        const { error } = await supabase
          .from("user_favorites")
          .delete()
          .eq("id", existing.id);

        if (error) throw error;
        return { action: "removed" };
      } else {
        // Adicionar favorito
        const { error } = await supabase
          .from("user_favorites")
          .insert({
            user_id: user.id,
            content_type: contentType,
            content_id: contentId,
          });

        if (error) throw error;
        return { action: "added" };
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["favorites", user?.id] });
    },
  });

  return {
    favorites: favorites.data || [],
    isLoading: favorites.isLoading,
    isFavorite,
    toggleFavorite,
  };
};
