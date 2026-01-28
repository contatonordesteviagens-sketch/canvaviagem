import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ContentItem, Caption } from "./useContent";

export interface CalendarEntry {
  id: string;
  content_item_id: string | null;
  caption_id: string | null;
  day_of_year: number;
  year: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
  content_item?: ContentItem | null;
  caption?: Caption | null;
}

// Hook para buscar entradas do calendário de um mês/ano específico
export const useCalendarEntries = (year: number) => {
  return useQuery({
    queryKey: ["calendar-entries", year],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("calendar_entries")
        .select("*")
        .eq("year", year)
        .order("day_of_year", { ascending: true });

      if (error) throw error;
      return data as CalendarEntry[];
    },
    staleTime: 1000 * 60 * 5,
  });
};

// Hook para buscar content items e captions para associar ao calendário
export const useCalendarContentOptions = () => {
  return useQuery({
    queryKey: ["calendar-content-options"],
    queryFn: async () => {
      const [contentResult, captionResult] = await Promise.all([
        supabase
          .from("content_items")
          .select("*")
          .in("type", ["video", "seasonal"])
          .eq("is_active", true)
          .order("created_at", { ascending: false }),
        supabase
          .from("captions")
          .select("*")
          .eq("is_active", true)
          .order("created_at", { ascending: false }),
      ]);

      if (contentResult.error) throw contentResult.error;
      if (captionResult.error) throw captionResult.error;

      return {
        contentItems: contentResult.data as ContentItem[],
        captions: captionResult.data as Caption[],
      };
    },
    staleTime: 1000 * 60 * 5,
  });
};

// Hook para criar/atualizar entrada do calendário
export const useUpsertCalendarEntry = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      day_of_year: number;
      year: number;
      content_item_id?: string | null;
      caption_id?: string | null;
      notes?: string | null;
    }) => {
      // Usar upsert com conflito no (day_of_year, year)
      const { error } = await supabase
        .from("calendar_entries")
        .upsert(
          {
            day_of_year: data.day_of_year,
            year: data.year,
            content_item_id: data.content_item_id || null,
            caption_id: data.caption_id || null,
            notes: data.notes || null,
          },
          {
            onConflict: "day_of_year,year",
          }
        );

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["calendar-entries", variables.year] });
    },
  });
};

// Hook para deletar entrada do calendário
export const useDeleteCalendarEntry = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ day_of_year, year }: { day_of_year: number; year: number }) => {
      const { error } = await supabase
        .from("calendar_entries")
        .delete()
        .eq("day_of_year", day_of_year)
        .eq("year", year);

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["calendar-entries", variables.year] });
    },
  });
};

// Função utilitária para calcular o dia do ano
export const getDayOfYear = (day: number, month: number, year: number): number => {
  const start = new Date(year, 0, 0);
  const diff = new Date(year, month, day).getTime() - start.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
};

// Hook para auto-distribuir novos conteúdos no calendário (próximos 7 dias)
export const useAutoDistributeContent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (contentItems: ContentItem[]) => {
      const now = new Date();
      const year = now.getFullYear();
      const startDayOfYear = getDayOfYear(now.getDate(), now.getMonth(), year);

      // Buscar entradas existentes para os próximos 7 dias
      const { data: existingEntries, error: fetchError } = await supabase
        .from("calendar_entries")
        .select("day_of_year")
        .eq("year", year)
        .gte("day_of_year", startDayOfYear)
        .lte("day_of_year", startDayOfYear + 7);

      if (fetchError) throw fetchError;

      const occupiedDays = new Set(existingEntries?.map((e) => e.day_of_year) || []);

      // Distribuir conteúdos em dias vazios
      const newEntries: { day_of_year: number; year: number; content_item_id: string }[] = [];
      let contentIndex = 0;

      for (let offset = 0; offset <= 7 && contentIndex < contentItems.length; offset++) {
        const dayOfYear = startDayOfYear + offset;
        if (!occupiedDays.has(dayOfYear)) {
          newEntries.push({
            day_of_year: dayOfYear,
            year,
            content_item_id: contentItems[contentIndex].id,
          });
          contentIndex++;
        }
      }

      if (newEntries.length > 0) {
        const { error } = await supabase.from("calendar_entries").insert(newEntries);
        if (error) throw error;
      }

      return newEntries.length;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["calendar-entries"] });
    },
  });
};
