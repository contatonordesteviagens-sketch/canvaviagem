import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage, type Language } from "@/contexts/LanguageContext";
import { sortByLanguagePriority } from "@/lib/language-utils";
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
  // External media fields
  media_url: string | null;
  media_type: 'gif' | 'video' | null;
  is_highlighted: boolean;
}

export interface Caption {
  id: string;
  destination: string;
  text: string;
  hashtags: string;
  category: 'nacional' | 'internacional' | null;
  is_active: boolean;
  display_order: number;
  language: string | null;
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
  language: string | null;
  created_at: string;
  updated_at: string;
}

// Hook para buscar content items por tipo with language priority ordering
export const useContentItems = (type?: string | string[], featuredOnly?: boolean, forcedLanguage?: Language) => {
  const { language: contextLanguage } = useLanguage();
  const language = forcedLanguage || contextLanguage;
  
  return useQuery({
    queryKey: ["content-items", type, featuredOnly, language],
    queryFn: async () => {
      let query = supabase
        .from("content_items")
        .select("*")
        .eq("is_active", true)
        .order("is_featured", { ascending: false })
        .order("created_at", { ascending: false });
      
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
      
      // ⭐ FILTRAR POR IDIOMA NO BANCO ⭐
      if (language === 'pt') {
        query = query.or('language.eq.pt,language.is.null');
      } else {
        query = query.eq('language', language);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      
      // Ordenar por display_order e created_at (sem fallback de idioma)
      return (data as ContentItem[]).sort((a, b) => {
        const aOrder = a.display_order ?? 9999;
        const bOrder = b.display_order ?? 9999;
        if (aOrder !== bOrder) return aOrder - bOrder;
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });
    },
    staleTime: 0, // Always refetch to ensure fresh data
  });
};

// Hook para buscar os 3 IDs mais recentes (para badge "Novo" dinâmico)
export const useNewestItemIds = () => {
  return useQuery({
    queryKey: ["newest-item-ids"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("content_items")
        .select("id")
        .eq("is_active", true)
        .order("created_at", { ascending: false })
        .limit(3);
      
      if (error) throw error;
      return data?.map(item => item.id) || [];
    },
    staleTime: 0, // Always refetch
  });
};

// Hook para buscar itens em destaque (is_featured) - filtered by language
export const useFeaturedItems = (forcedLanguage?: Language) => {
  const { language: contextLanguage } = useLanguage();
  const language = forcedLanguage || contextLanguage;
  
  return useQuery({
    queryKey: ["featured-items", language],
    queryFn: async () => {
      let query = supabase
        .from("content_items")
        .select("*")
        .eq("is_active", true)
        .eq("is_featured", true)
        .in("type", ["video", "seasonal"])
        .order("display_order", { ascending: true })
        .limit(10);
      
      // Filter by language in database
      if (language === 'pt') {
        query = query.or('language.eq.pt,language.is.null');
      } else {
        query = query.eq('language', language);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data as ContentItem[];
    },
    staleTime: 0, // Always refetch
  });
};

// Hook para buscar itens destacados (is_highlighted) - seção especial na home
export const useHighlightedItems = (forcedLanguage?: Language) => {
  const { language: contextLanguage } = useLanguage();
  const language = forcedLanguage || contextLanguage;
  
  return useQuery({
    queryKey: ["highlighted-items", language],
    queryFn: async () => {
      let query = supabase
        .from("content_items")
        .select("*")
        .eq("is_active", true)
        .eq("is_highlighted", true);
      
      // ⭐ FILTRAR POR IDIOMA NO BANCO ⭐
      if (language === 'pt') {
        query = query.or('language.eq.pt,language.is.null');
      } else {
        query = query.eq('language', language);
      }
      
      const { data, error } = await query
        .order("display_order", { ascending: true })
        .limit(3);
      
      if (error) throw error;
      return data as ContentItem[];
    },
    staleTime: 0, // Always refetch
  });
};

// Hook para buscar vídeos (templates)
export const useVideoTemplates = (category?: string) => {
  const { language } = useLanguage();
  
  return useQuery({
    queryKey: ["video-templates", category, language],
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
      return sortByLanguagePriority(data as ContentItem[], language);
    },
    staleTime: 0, // Always refetch
  });
};

// Hook para buscar captions
export const useCaptions = (category?: 'nacional' | 'internacional', forcedLanguage?: Language) => {
  const { language: contextLanguage } = useLanguage();
  const language = forcedLanguage || contextLanguage;
  
  return useQuery({
    queryKey: ["captions", category, language],
    queryFn: async () => {
      let query = supabase
        .from("captions")
        .select("*")
        .eq("is_active", true)
        .order("display_order", { ascending: true });
      
      if (category) {
        query = query.eq("category", category);
      }
      
      // ⭐ FILTRAR POR IDIOMA NO BANCO ⭐
      if (language === 'pt') {
        query = query.or('language.eq.pt,language.is.null');
      } else {
        query = query.eq('language', language);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data as Caption[];
    },
    staleTime: 0, // Always refetch
  });
};

// Hook para buscar marketing tools
export const useMarketingTools = (forcedLanguage?: Language) => {
  const { language: contextLanguage } = useLanguage();
  const language = forcedLanguage || contextLanguage;
  
  return useQuery({
    queryKey: ["marketing-tools", language],
    queryFn: async () => {
      let query = supabase
        .from("marketing_tools")
        .select("*")
        .eq("is_active", true)
        .order("display_order", { ascending: true });
      
      // ⭐ FILTRAR POR IDIOMA NO BANCO ⭐
      if (language === 'pt') {
        query = query.or('language.eq.pt,language.is.null');
      } else {
        query = query.eq('language', language);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data as MarketingTool[];
    },
    staleTime: 0, // Always refetch
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
      description?: string | null;
      is_active?: boolean;
      language?: string;
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
      queryClient.invalidateQueries({ queryKey: ["featured-items"] });
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
  const queryClient = useQueryClient();
  
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
    onSuccess: () => {
      // Invalidate ALL caches to ensure user-facing pages update
      queryClient.invalidateQueries({ queryKey: ['all-content-items'] });
      queryClient.invalidateQueries({ queryKey: ['content-items'] });
      queryClient.invalidateQueries({ queryKey: ['featured-items'] });
      queryClient.invalidateQueries({ queryKey: ['highlighted-items'] });
      queryClient.invalidateQueries({ queryKey: ['video-templates'] });
      queryClient.invalidateQueries({ queryKey: ['all-captions'] });
      queryClient.invalidateQueries({ queryKey: ['captions'] });
      queryClient.invalidateQueries({ queryKey: ['all-marketing-tools'] });
      queryClient.invalidateQueries({ queryKey: ['marketing-tools'] });
      
      console.log('✅ Display order updated and caches invalidated');
    },
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
