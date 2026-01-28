import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface ActiveUser {
  user_id: string;
  email: string; // Masked email by default (e.g., "lu***@gmail.com")
  name: string | null;
  status: "active" | "canceled" | "past_due" | "trialing" | "inactive";
  stripe_customer_id: string | null; // Masked (e.g., "cus_***1234")
  stripe_subscription_id: string | null;
  created_at: string;
  current_period_end: string | null;
  profile_id?: string; // For audited PII access
}

// Helper to mask email (fallback for client-side masking)
const maskEmail = (email: string | null): string => {
  if (!email) return "Email não disponível";
  const [local, domain] = email.split("@");
  if (!domain) return email;
  return `${local.slice(0, 2)}***@${domain}`;
};

// Helper to mask Stripe ID
const maskStripeId = (id: string | null): string | null => {
  if (!id) return null;
  return `cus_***${id.slice(-4)}`;
};

export const useActiveUsers = () => {
  return useQuery({
    queryKey: ["active-users"],
    queryFn: async () => {
      // Buscar dados de subscriptions
      const { data: subscriptions, error: subError } = await supabase
        .from("subscriptions")
        .select("*")
        .order("created_at", { ascending: false });

      if (subError) throw subError;

      // Tentar usar a view mascarada de profiles primeiro via REST API
      // (evita conflito de tipos com o SDK)
      let maskedProfiles: Array<{
        user_id: string;
        email_masked: string;
        name: string | null;
        stripe_id_masked: string | null;
        id: string;
      }> = [];
      
      try {
        const session = await supabase.auth.getSession();
        const response = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/profiles_admin_view?select=user_id,email_masked,name,stripe_id_masked,id`,
          {
            headers: {
              'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
              'Authorization': `Bearer ${session.data.session?.access_token}`,
            },
          }
        );
        if (response.ok) {
          maskedProfiles = await response.json();
        }
      } catch (err) {
        console.log("View profiles_admin_view not available, using fallback");
      }

      // Fallback para user_email_automations se a view falhar
      let emailData: Array<{ user_id: string; email: string; name: string | null }> = [];
      if (maskedProfiles.length === 0) {
        const { data } = await supabase
          .from("user_email_automations")
          .select("user_id, email, name");
        emailData = data || [];
      }

      // Combinar dados - priorizar view mascarada, depois fallback com mascaramento client-side
      const users: ActiveUser[] = subscriptions.map((sub) => {
        const maskedProfile = maskedProfiles.find((p) => p.user_id === sub.user_id);
        const emailRecord = emailData?.find((e) => e.user_id === sub.user_id);
        
        return {
          user_id: sub.user_id,
          email: maskedProfile?.email_masked || maskEmail(emailRecord?.email || null),
          name: maskedProfile?.name || emailRecord?.name || null,
          status: sub.status as ActiveUser["status"],
          stripe_customer_id: maskedProfile?.stripe_id_masked || maskStripeId(sub.stripe_customer_id),
          stripe_subscription_id: sub.stripe_subscription_id,
          created_at: sub.created_at,
          current_period_end: sub.current_period_end,
          profile_id: maskedProfile?.id,
        };
      });

      return users;
    },
    staleTime: 1000 * 60 * 2, // 2 minutos
  });
};

// Hook para revelar email completo COM AUDITORIA
export const useRevealEmail = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      recordId, 
      tableName, 
      reason 
    }: { 
      recordId: string; 
      tableName: 'profiles' | 'abandoned_checkouts' | 'user_email_automations'; 
      reason: string;
    }) => {
      if (!reason || reason.trim().length < 5) {
        throw new Error("Motivo obrigatório (mínimo 5 caracteres)");
      }

      const { data, error } = await supabase.rpc('get_customer_email_audited', {
        p_record_id: recordId,
        p_table_name: tableName,
        p_reason: reason.trim(),
      });

      if (error) throw error;
      return data as string;
    },
    onSuccess: () => {
      // Invalidar audit log para atualizar histórico
      queryClient.invalidateQueries({ queryKey: ["audit-log"] });
    },
  });
};
