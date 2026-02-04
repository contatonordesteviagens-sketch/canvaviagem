import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useIsAdmin } from "./useContent";

export interface DashboardStats {
  totalSubscribers: number;
  activeSubscribers: number;
  totalClicks: number;
  topContent: Array<{ content_id: string; content_type: string; clicks: number; title?: string }>;
  clicksByType: Array<{ type: string; count: number }>;
  recentSubscriptions: Array<{ date: string; count: number }>;
}

export interface AdminNote {
  id: string;
  content: string;
  updated_at: string;
  updated_by: string | null;
}

export interface PageView {
  id: string;
  user_id: string | null;
  page_path: string;
  viewed_at: string;
}

export const useAdminDashboard = () => {
  const { data: isAdmin } = useIsAdmin();

  return useQuery({
    queryKey: ["admin-dashboard"],
    queryFn: async (): Promise<DashboardStats> => {
      // Buscar total de assinantes
      const { data: subscriptions, error: subError } = await supabase
        .from("subscriptions")
        .select("*");
      
      if (subError) throw subError;

      const activeSubscribers = subscriptions?.filter(s => s.status === 'active').length || 0;
      const totalSubscribers = subscriptions?.length || 0;

      // Buscar cliques agregados
      const { data: clicks, error: clickError } = await supabase
        .from("content_clicks")
        .select("content_id, content_type");
      
      if (clickError) throw clickError;

      // Agregar cliques por content_id
      const clickCounts: Record<string, { content_id: string; content_type: string; clicks: number }> = {};
      clicks?.forEach(click => {
        const key = click.content_id;
        if (!clickCounts[key]) {
          clickCounts[key] = { 
            content_id: click.content_id, 
            content_type: click.content_type, 
            clicks: 0 
          };
        }
        clickCounts[key].clicks++;
      });

      const topContent = Object.values(clickCounts)
        .sort((a, b) => b.clicks - a.clicks)
        .slice(0, 5);

      // Agregar cliques por tipo
      const typeCountsMap: Record<string, number> = {};
      clicks?.forEach(click => {
        typeCountsMap[click.content_type] = (typeCountsMap[click.content_type] || 0) + 1;
      });
      const clicksByType = Object.entries(typeCountsMap).map(([type, count]) => ({ type, count }));

      // Assinaturas recentes (últimos 7 dias)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      const recentSubs = subscriptions?.filter(s => 
        new Date(s.created_at) >= sevenDaysAgo
      ) || [];

      // Agrupar por dia
      const subsByDay: Record<string, number> = {};
      recentSubs.forEach(sub => {
        const day = new Date(sub.created_at).toISOString().split('T')[0];
        subsByDay[day] = (subsByDay[day] || 0) + 1;
      });

      const recentSubscriptions = Object.entries(subsByDay)
        .map(([date, count]) => ({ date, count }))
        .sort((a, b) => a.date.localeCompare(b.date));

      return {
        totalSubscribers,
        activeSubscribers,
        totalClicks: clicks?.length || 0,
        topContent,
        clicksByType,
        recentSubscriptions,
      };
    },
    enabled: isAdmin === true,
    staleTime: 1000 * 60 * 2, // 2 minutos
  });
};

// Hook para page views - usando query genérica já que a tabela foi recém criada
export const usePageViews = () => {
  const { data: isAdmin } = useIsAdmin();

  return useQuery({
    queryKey: ["page-views"],
    queryFn: async () => {
      // Usando rpc ou query direta com tipagem manual
      const { data, error } = await supabase
        .rpc('get_page_views' as never)
        .limit(1000);
      
      // Se a função não existir, retornar vazio
      if (error) {
        console.log("Page views query not available yet");
        return [];
      }

      // Agregar por página
      const pageCounts: Record<string, number> = {};
      (data as PageView[])?.forEach(view => {
        pageCounts[view.page_path] = (pageCounts[view.page_path] || 0) + 1;
      });

      return Object.entries(pageCounts)
        .map(([path, count]) => ({ path, count }))
        .sort((a, b) => b.count - a.count);
    },
    enabled: isAdmin === true,
    staleTime: 1000 * 60 * 2,
  });
};

// Hook para notas do admin - com tipagem explícita
export const useAdminNotes = () => {
  const { data: isAdmin } = useIsAdmin();

  return useQuery({
    queryKey: ["admin-notes"],
    queryFn: async (): Promise<AdminNote | null> => {
      // Query genérica para tabela nova
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/admin_notes?order=updated_at.desc&limit=1`,
        {
          headers: {
            'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
            'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
          },
        }
      );
      
      if (!response.ok) {
        console.log("Admin notes table not ready yet");
        return null;
      }
      
      const data = await response.json();
      return data?.[0] || null;
    },
    enabled: isAdmin === true,
  });
};

// Hook para salvar notas
export const useSaveAdminNote = () => {
  return async (content: string, noteId?: string) => {
    const session = await supabase.auth.getSession();
    const token = session.data.session?.access_token;
    
    if (noteId) {
      // Update existing note
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/admin_notes?id=eq.${noteId}`,
        {
          method: 'PATCH',
          headers: {
            'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=minimal',
          },
          body: JSON.stringify({ content, updated_at: new Date().toISOString() }),
        }
      );
      if (!response.ok) throw new Error('Failed to update note');
    } else {
      // Insert new note
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/admin_notes`,
        {
          method: 'POST',
          headers: {
            'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=minimal',
          },
          body: JSON.stringify({ content }),
        }
      );
      if (!response.ok) throw new Error('Failed to create note');
    }
  };
};

// Hook para tracking de page view
export const useTrackPageView = () => {
  const trackPageView = async (pagePath: string, userId?: string) => {
    try {
      const session = await supabase.auth.getSession();
      const token = session.data.session?.access_token;
      
      await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/page_views`,
        {
          method: 'POST',
          headers: {
            'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
            'Authorization': `Bearer ${token || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=minimal',
          },
          body: JSON.stringify({ page_path: pagePath, user_id: userId || null }),
        }
      );
    } catch (error) {
      console.error("Error tracking page view:", error);
    }
  };

  return { trackPageView };
};
