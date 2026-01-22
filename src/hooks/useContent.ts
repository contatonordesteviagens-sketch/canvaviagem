import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

// Types
export interface ContentItem {
  id: string;
  title: string;
  url: string;
  type: 'video' | 'feed' | 'story' | 'seasonal' | 'weekly-story' | 'resource' | 'download';
  category: string | null;
  subcategory: string | null;
  image_url: string | null;
  icon: string;
  description: string | null;
  is_new: boolean;
  is_featured: boolean;
  is_active: boolean;
  display_order: number;
  language: string | null;
  created_at: string;
  updated_at: string;
}

export interface Caption {
  id: string;
  destination: string;
  text: string;
  hashtags: string;
  category: 'nacional' | 'internacional' | null;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface MarketingTool {
  id: string;
  title: string;
  url: string;
  icon: string;
  description: string | null;
  is_new: boolean;
  is_featured: boolean;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

// Hook para buscar content items por tipo
export const useContentItems = (type?: string | string[], featuredOnly?: boolean) => {
  return useQuery({
    queryKey: ["content-items", type, featuredOnly],
    queryFn: async () => {
      let query = supabase
        .from("content_items")
        .select("*")
        .eq("is_active", true)
        .order("display_order", { ascending: true });
      
      if (type) {
        if (Array.isArray(type)) {
          query = query.in("type", type);
        } else {
          query = query.eq("type", type);
        }
      }

      if (featuredOnly) {
        query = query.eq("is_featured", true);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data as ContentItem[];
    },
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
};

// Hook para buscar itens em destaque
export const useFeaturedItems = () => {
  return useQuery({
    queryKey: ["featured-items"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("content_items")
        .select("*")
        .eq("is_active", true)
        .eq("is_featured", true)
        .in("type", ["video", "seasonal"])
        .order("display_order", { ascending: true })
        .limit(10);
      
      if (error) throw error;
      return data as ContentItem[];
    },
    staleTime: 1000 * 60 * 5,
  });
};

// Hook para buscar vídeos (templates)
export const useVideoTemplates = (category?: string) => {
  return useQuery({
    queryKey: ["video-templates", category],
    queryFn: async () => {
      let query = supabase
        .from("content_items")
        .select("*")
        .in("type", ["video", "seasonal"])
        .eq("is_active", true)
        .order("display_order", { ascending: true });
      
      if (category) {
        query = query.eq("category", category);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data as ContentItem[];
    },
    staleTime: 1000 * 60 * 5,
  });
};

// Hook para buscar captions
export const useCaptions = (category?: 'nacional' | 'internacional') => {
  return useQuery({
    queryKey: ["captions", category],
    queryFn: async () => {
      let query = supabase
        .from("captions")
        .select("*")
        .eq("is_active", true)
        .order("display_order", { ascending: true });
      
      if (category) {
        query = query.eq("category", category);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data as Caption[];
    },
    staleTime: 1000 * 60 * 5,
  });
};

// Hook para buscar marketing tools
export const useMarketingTools = () => {
  return useQuery({
    queryKey: ["marketing-tools"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("marketing_tools")
        .select("*")
        .eq("is_active", true)
        .order("display_order", { ascending: true });
      
      if (error) throw error;
      return data as MarketingTool[];
    },
    staleTime: 1000 * 60 * 5,
  });
};

// Hook para tracking de cliques
export const useTrackClick = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  const mutation = useMutation({
    mutationFn: async ({ 
      contentType, 
      contentId 
    }: { 
      contentType: string; 
      contentId: string;
    }) => {
      const { error } = await supabase.from("content_clicks").insert({
        content_type: contentType,
        content_id: contentId,
        user_id: user?.id || null,
      });
      
      if (error) {
        console.error("Error tracking click:", error);
        throw error;
      }
    },
  });
  
  const trackClick = (contentType: string, contentId: string) => {
    mutation.mutate({ contentType, contentId });
  };
  
  return { trackClick, isTracking: mutation.isPending };
};

// Hook para verificar se é admin
export const useIsAdmin = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ["is-admin", user?.id],
    queryFn: async () => {
      if (!user) return false;
      
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "admin")
        .maybeSingle();
      
      if (error) {
        console.error("Error checking admin status:", error);
        return false;
      }
      
      return !!data;
    },
    enabled: !!user,
    staleTime: 1000 * 60 * 10, // 10 minutos
  });
};

// Hook para buscar todos os content items (para admin)
export const useAllContentItems = () => {
  const { data: isAdmin } = useIsAdmin();
  
  return useQuery({
    queryKey: ["all-content-items"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("content_items")
        .select("*")
        .order("type", { ascending: true })
        .order("display_order", { ascending: true });
      
      if (error) throw error;
      return data as ContentItem[];
    },
    enabled: isAdmin === true,
  });
};

// Hook para buscar todos os captions (para admin)
export const useAllCaptions = () => {
  const { data: isAdmin } = useIsAdmin();
  
  return useQuery({
    queryKey: ["all-captions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("captions")
        .select("*")
        .order("display_order", { ascending: true });
      
      if (error) throw error;
      return data as Caption[];
    },
    enabled: isAdmin === true,
  });
};

// Hook para buscar todos os marketing tools (para admin)
export const useAllMarketingTools = () => {
  const { data: isAdmin } = useIsAdmin();
  
  return useQuery({
    queryKey: ["all-marketing-tools"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("marketing_tools")
        .select("*")
        .order("display_order", { ascending: true });
      
      if (error) throw error;
      return data as MarketingTool[];
    },
    enabled: isAdmin === true,
  });
};

// Mutation hooks for admin updates
export const useUpdateContentItem = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: { 
      id: string; 
      title?: string; 
      url?: string; 
      is_active?: boolean 
    }) => {
      const { id, ...updateData } = data;
      const { error } = await supabase
        .from("content_items")
        .update({ ...updateData, updated_at: new Date().toISOString() })
        .eq("id", id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["all-content-items"] });
      queryClient.invalidateQueries({ queryKey: ["content-items"] });
      queryClient.invalidateQueries({ queryKey: ["video-templates"] });
    },
  });
};

export const useUpdateCaption = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: { 
      id: string; 
      destination?: string;
      text?: string;
      hashtags?: string;
      is_active?: boolean 
    }) => {
      const { id, ...updateData } = data;
      const { error } = await supabase
        .from("captions")
        .update({ ...updateData, updated_at: new Date().toISOString() })
        .eq("id", id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["all-captions"] });
      queryClient.invalidateQueries({ queryKey: ["captions"] });
    },
  });
};

export const useUpdateMarketingTool = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: { 
      id: string; 
      title?: string; 
      url?: string; 
      is_active?: boolean 
    }) => {
      const { id, ...updateData } = data;
      const { error } = await supabase
        .from("marketing_tools")
        .update({ ...updateData, updated_at: new Date().toISOString() })
        .eq("id", id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["all-marketing-tools"] });
      queryClient.invalidateQueries({ queryKey: ["marketing-tools"] });
    },
  });
};

// Create mutations
export const useCreateContentItem = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: {
      title: string;
      url: string;
      type: string;
      category?: string | null;
      icon?: string;
      language?: string;
      is_new?: boolean;
      is_active?: boolean;
    }) => {
      const { error } = await supabase
        .from("content_items")
        .insert({
          title: data.title,
          url: data.url,
          type: data.type,
          category: data.category || null,
          icon: data.icon || "✨",
          language: data.language || null,
          is_new: data.is_new ?? false,
          is_active: data.is_active ?? true,
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["all-content-items"] });
      queryClient.invalidateQueries({ queryKey: ["content-items"] });
      queryClient.invalidateQueries({ queryKey: ["video-templates"] });
    },
  });
};

export const useCreateCaption = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: {
      destination: string;
      text: string;
      hashtags: string;
      category?: "nacional" | "internacional" | null;
      is_active?: boolean;
    }) => {
      const { error } = await supabase
        .from("captions")
        .insert({
          destination: data.destination,
          text: data.text,
          hashtags: data.hashtags,
          category: data.category || null,
          is_active: data.is_active ?? true,
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["all-captions"] });
      queryClient.invalidateQueries({ queryKey: ["captions"] });
    },
  });
};

export const useCreateMarketingTool = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: {
      title: string;
      url: string;
      icon?: string;
      description?: string;
      is_new?: boolean;
      is_active?: boolean;
    }) => {
      const { error } = await supabase
        .from("marketing_tools")
        .insert({
          title: data.title,
          url: data.url,
          icon: data.icon || "🤖",
          description: data.description || null,
          is_new: data.is_new ?? false,
          is_active: data.is_active ?? true,
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["all-marketing-tools"] });
      queryClient.invalidateQueries({ queryKey: ["marketing-tools"] });
    },
  });
};

// Update display order mutation
export const useUpdateDisplayOrder = () => {
  return useMutation({
    mutationFn: async ({ 
      table, 
      items 
    }: { 
      table: "content_items" | "captions" | "marketing_tools"; 
      items: { id: string; display_order: number }[];
    }) => {
      // Update each item's display_order
      for (const item of items) {
        const { error } = await supabase
          .from(table)
          .update({ display_order: item.display_order })
          .eq("id", item.id);
        
        if (error) throw error;
      }
    },
    // No onSuccess invalidation - optimistic updates handle UI immediately
  });
};

// Delete mutations
export const useDeleteContentItem = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("content_items")
        .delete()
        .eq("id", id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["all-content-items"] });
      queryClient.invalidateQueries({ queryKey: ["content-items"] });
      queryClient.invalidateQueries({ queryKey: ["video-templates"] });
    },
  });
};

export const useDeleteCaption = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("captions")
        .delete()
        .eq("id", id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["all-captions"] });
      queryClient.invalidateQueries({ queryKey: ["captions"] });
    },
  });
};

export const useDeleteMarketingTool = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("marketing_tools")
        .delete()
        .eq("id", id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["all-marketing-tools"] });
      queryClient.invalidateQueries({ queryKey: ["marketing-tools"] });
    },
  });
};
