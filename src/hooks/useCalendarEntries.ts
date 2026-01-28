import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface CalendarEntry {
  id: string;
  year: number;
  day_of_year: number;
  content_item_id: string | null;
  caption_id: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  content_item?: {
    id: string;
    title: string;
    url: string;
    type: string;
    icon: string;
  } | null;
  caption?: {
    id: string;
    destination: string;
    text: string;
    hashtags: string;
  } | null;
}

// Helper to get day of year from a date
export const getDayOfYear = (date: Date): number => {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date.getTime() - start.getTime();
  const oneDay = 1000 * 60 * 60 * 24;
  return Math.floor(diff / oneDay);
};

// Helper to get date from day of year
export const getDateFromDayOfYear = (year: number, dayOfYear: number): Date => {
  const date = new Date(year, 0);
  date.setDate(dayOfYear);
  return date;
};

// Hook para buscar entradas do calendário por mês
export const useCalendarEntries = (year: number, month: number) => {
  return useQuery({
    queryKey: ["calendar-entries", year, month],
    queryFn: async () => {
      // Calculate day of year range for the month
      const firstDayOfMonth = new Date(year, month, 1);
      const lastDayOfMonth = new Date(year, month + 1, 0);
      const startDay = getDayOfYear(firstDayOfMonth);
      const endDay = getDayOfYear(lastDayOfMonth);

      const { data, error } = await supabase
        .from("calendar_entries")
        .select(`
          *,
          content_item:content_items(id, title, url, type, icon),
          caption:captions(id, destination, text, hashtags)
        `)
        .eq("year", year)
        .gte("day_of_year", startDay)
        .lte("day_of_year", endDay);

      if (error) throw error;
      return data as CalendarEntry[];
    },
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
};

// Hook para agendar conteúdo automaticamente
export const useScheduleContent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      contentItemId,
      caption,
    }: {
      contentItemId: string;
      caption?: string;
    }) => {
      const today = new Date();
      const nextDays = Array.from({ length: 7 }, (_, i) => {
        const date = new Date(today);
        date.setDate(date.getDate() + i + 1);
        return {
          year: date.getFullYear(),
          day_of_year: getDayOfYear(date),
          date,
        };
      });

      // Find first available day
      for (const day of nextDays) {
        const { data: existing } = await supabase
          .from("calendar_entries")
          .select("id")
          .eq("year", day.year)
          .eq("day_of_year", day.day_of_year)
          .maybeSingle();

        if (!existing) {
          // Day is free - schedule here
          const { error } = await supabase.from("calendar_entries").insert({
            year: day.year,
            day_of_year: day.day_of_year,
            content_item_id: contentItemId,
            notes: caption || null,
          });

          if (error) throw error;

          return { 
            scheduled: true, 
            day: day.day_of_year, 
            year: day.year,
            date: day.date,
          };
        }
      }

      return { scheduled: false };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["calendar-entries"] });
    },
  });
};

// Hook para criar/atualizar entrada do calendário
export const useUpdateCalendarEntry = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      year,
      dayOfYear,
      contentItemId,
      captionId,
      notes,
    }: {
      year: number;
      dayOfYear: number;
      contentItemId?: string | null;
      captionId?: string | null;
      notes?: string | null;
    }) => {
      // Check if entry exists
      const { data: existing } = await supabase
        .from("calendar_entries")
        .select("id")
        .eq("year", year)
        .eq("day_of_year", dayOfYear)
        .maybeSingle();

      if (existing) {
        // Update existing
        const { error } = await supabase
          .from("calendar_entries")
          .update({
            content_item_id: contentItemId,
            caption_id: captionId,
            notes,
            updated_at: new Date().toISOString(),
          })
          .eq("id", existing.id);

        if (error) throw error;
      } else {
        // Create new
        const { error } = await supabase.from("calendar_entries").insert({
          year,
          day_of_year: dayOfYear,
          content_item_id: contentItemId || null,
          caption_id: captionId || null,
          notes: notes || null,
        });

        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["calendar-entries"] });
    },
  });
};
