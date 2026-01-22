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
  is_active: boolean;
  display_order: number;
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
export const useContentItems = (type?: string | string[]) => {
  return useQuery({
    queryKey: ["content-items", type],
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
      
      const { data, error } = await query;
      if (error) throw error;
      return data as ContentItem[];
    },
    staleTime: 1000 * 60 * 5, // 5 minutos
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
