import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import type { FabricaState } from "./useFabricaContext";
import { toast } from "sonner";

export interface DiagnosticoSalvo {
  id: string;
  user_id: string;
  agency_name: string;
  digital_score: number;
  level: number;
  level_name: string | null;
  state_snapshot: FabricaState;
  checklist_progress: Record<string, boolean>;
  created_at: string;
  updated_at: string;
}

export const useDiagnosticos = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["fabrica-diagnosticos", user?.id],
    queryFn: async () => {
      if (!user) return [] as DiagnosticoSalvo[];
      const { data, error } = await supabase
        .from("fabrica_diagnosticos" as any)
        .select("*")
        .order("updated_at", { ascending: false });
      if (error) throw error;
      return (data as any[]) as DiagnosticoSalvo[];
    },
    enabled: !!user,
  });
};

export const useSaveDiagnostico = () => {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      state: FabricaState;
      score: number;
      level: number;
      levelName: string;
      existingId?: string;
    }) => {
      if (!user) throw new Error("Faça login para salvar");
      const payload = {
        user_id: user.id,
        agency_name: params.state.agencyName || "Sem nome",
        digital_score: params.score,
        level: params.level,
        level_name: params.levelName,
        state_snapshot: params.state as any,
        checklist_progress: params.state.checklist30days as any,
      };
      if (params.existingId) {
        const { data, error } = await supabase
          .from("fabrica_diagnosticos" as any)
          .update(payload)
          .eq("id", params.existingId)
          .select()
          .single();
        if (error) throw error;
        return data;
      }
      const { data, error } = await supabase
        .from("fabrica_diagnosticos" as any)
        .upsert(payload, { onConflict: "user_id" })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["fabrica-diagnosticos"] });
      toast.success("Diagnóstico salvo na sua conta!");
    },
    onError: (e: any) => {
      toast.error(e?.message || "Erro ao salvar diagnóstico");
    },
  });
};

export const useDeleteDiagnostico = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("fabrica_diagnosticos" as any)
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["fabrica-diagnosticos"] });
      toast.success("Diagnóstico removido");
    },
  });
};
