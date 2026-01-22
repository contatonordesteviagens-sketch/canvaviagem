import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface AuditLogEntry {
  id: string;
  table_name: string;
  record_id: string;
  action: "INSERT" | "UPDATE" | "DELETE";
  old_data: Record<string, unknown> | null;
  new_data: Record<string, unknown> | null;
  user_id: string | null;
  user_email: string | null;
  created_at: string;
  is_rolled_back: boolean;
}

interface AuditLogFilters {
  action?: string;
  table_name?: string;
  limit?: number;
}

const tableNameMap: Record<string, string> = {
  content_items: "Conteúdo",
  captions: "Legendas",
  marketing_tools: "Ferramentas",
};

const actionNameMap: Record<string, string> = {
  INSERT: "Criado",
  UPDATE: "Editado",
  DELETE: "Removido",
};

export const getTableDisplayName = (tableName: string) => {
  return tableNameMap[tableName] || tableName;
};

export const getActionDisplayName = (action: string) => {
  return actionNameMap[action] || action;
};

export const useAuditLogs = (filters: AuditLogFilters = {}) => {
  return useQuery({
    queryKey: ["audit-logs", filters],
    queryFn: async () => {
      let query = supabase
        .from("audit_log")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(filters.limit || 50);

      if (filters.action) {
        query = query.eq("action", filters.action);
      }
      if (filters.table_name) {
        query = query.eq("table_name", filters.table_name);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as AuditLogEntry[];
    },
  });
};

export const useRollbackAction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (entry: AuditLogEntry) => {
      const { table_name, record_id, action, old_data, new_data } = entry;

      // Perform rollback based on action type
      if (action === "INSERT") {
        // Undo INSERT: Delete the created record
        const { error } = await supabase
          .from(table_name as "content_items" | "captions" | "marketing_tools")
          .delete()
          .eq("id", record_id);
        if (error) throw error;
      } else if (action === "UPDATE") {
        // Undo UPDATE: Restore old_data
        if (!old_data) throw new Error("Dados anteriores não disponíveis");
        
        // Remove fields that shouldn't be updated
        const { id, created_at, ...updateData } = old_data as Record<string, unknown>;
        
        const { error } = await supabase
          .from(table_name as "content_items" | "captions" | "marketing_tools")
          .update(updateData)
          .eq("id", record_id);
        if (error) throw error;
      } else if (action === "DELETE") {
        // Undo DELETE: Recreate the record
        if (!old_data) throw new Error("Dados anteriores não disponíveis");
        
        // Use type assertion for each table to satisfy TypeScript
        if (table_name === "content_items") {
          const { error } = await supabase.from("content_items").insert(old_data as any);
          if (error) throw error;
        } else if (table_name === "captions") {
          const { error } = await supabase.from("captions").insert(old_data as any);
          if (error) throw error;
        } else if (table_name === "marketing_tools") {
          const { error } = await supabase.from("marketing_tools").insert(old_data as any);
          if (error) throw error;
        }
      }

      // Mark audit log entry as rolled back
      await supabase
        .from("audit_log")
        .update({ is_rolled_back: true })
        .eq("id", entry.id);

      return entry;
    },
    onSuccess: () => {
      // Invalidate all related queries
      queryClient.invalidateQueries({ queryKey: ["audit-logs"] });
      queryClient.invalidateQueries({ queryKey: ["content-items"] });
      queryClient.invalidateQueries({ queryKey: ["captions"] });
      queryClient.invalidateQueries({ queryKey: ["marketing-tools"] });
      queryClient.invalidateQueries({ queryKey: ["all-content-items"] });
      queryClient.invalidateQueries({ queryKey: ["all-captions"] });
      queryClient.invalidateQueries({ queryKey: ["all-marketing-tools"] });
    },
  });
};

export const useBatchRollback = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (entries: AuditLogEntry[]) => {
      const results: { success: AuditLogEntry[]; failed: AuditLogEntry[] } = {
        success: [],
        failed: [],
      };

      // Process in sequence to avoid conflicts
      for (const entry of entries) {
        try {
          const { table_name, record_id, action, old_data } = entry;

          if (action === "INSERT") {
            const { error } = await supabase
              .from(table_name as "content_items" | "captions" | "marketing_tools")
              .delete()
              .eq("id", record_id);
            if (error) throw error;
          } else if (action === "UPDATE") {
            if (!old_data) throw new Error("Dados anteriores não disponíveis");
            const { id, created_at, ...updateData } = old_data as Record<string, unknown>;
            const { error } = await supabase
              .from(table_name as "content_items" | "captions" | "marketing_tools")
              .update(updateData)
              .eq("id", record_id);
            if (error) throw error;
          } else if (action === "DELETE") {
            if (!old_data) throw new Error("Dados anteriores não disponíveis");
            if (table_name === "content_items") {
              const { error } = await supabase.from("content_items").insert(old_data as any);
              if (error) throw error;
            } else if (table_name === "captions") {
              const { error } = await supabase.from("captions").insert(old_data as any);
              if (error) throw error;
            } else if (table_name === "marketing_tools") {
              const { error } = await supabase.from("marketing_tools").insert(old_data as any);
              if (error) throw error;
            }
          }

          // Mark as rolled back
          await supabase
            .from("audit_log")
            .update({ is_rolled_back: true })
            .eq("id", entry.id);

          results.success.push(entry);
        } catch (error) {
          console.error("Rollback failed for entry:", entry.id, error);
          results.failed.push(entry);
        }
      }

      if (results.failed.length > 0 && results.success.length === 0) {
        throw new Error(`Falha ao desfazer ${results.failed.length} alterações`);
      }

      return results;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["audit-logs"] });
      queryClient.invalidateQueries({ queryKey: ["content-items"] });
      queryClient.invalidateQueries({ queryKey: ["captions"] });
      queryClient.invalidateQueries({ queryKey: ["marketing-tools"] });
      queryClient.invalidateQueries({ queryKey: ["all-content-items"] });
      queryClient.invalidateQueries({ queryKey: ["all-captions"] });
      queryClient.invalidateQueries({ queryKey: ["all-marketing-tools"] });
    },
  });
};

export const getItemTitle = (entry: AuditLogEntry): string => {
  const data = entry.new_data || entry.old_data;
  if (!data) return "Item desconhecido";
  
  // Try common title fields
  return (data.title as string) || (data.text as string)?.substring(0, 30) || "Sem título";
};
