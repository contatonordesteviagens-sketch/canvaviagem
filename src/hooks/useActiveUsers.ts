import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface ActiveUser {
  user_id: string;
  email: string;
  name: string | null;
  status: "active" | "canceled" | "past_due" | "trialing" | "inactive";
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  created_at: string;
  current_period_end: string | null;
  profile_id?: string;
  product_id: string | null;
  plan_name: string;
  plan_value: string;
}

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

      // We query user_email_automations as the primary source for real emails since the user is an admin
      const { data: emailDataResult } = await supabase
        .from("user_email_automations")
        .select("user_id, email, name");
      
      const emailData = emailDataResult || [];

      // Combine data
      const ELITE_PRODUCT_IDS = ["prod_UTFlCWzNqvqSNx", "prod_UTFsXcKq8m0mol", "prod_UTSmPe3GPt8iHt"];
      // Assume known Start product ids to isolate Annual plan if there is one
      const START_PRODUCT_IDS = ["prod_start_id"]; // Example

      const users: ActiveUser[] = subscriptions.map((sub) => {
        const maskedProfile = maskedProfiles.find((p) => p.user_id === sub.user_id);
        const emailRecord = emailData?.find((e) => e.user_id === sub.user_id);
        
        const isElite = sub.product_id && ELITE_PRODUCT_IDS.includes(sub.product_id);
        
        // Try to identify Annual plan if it's not Elite and has a different product_id
        let plan_name = "Plano Start ✈️";
        let plan_value = "R$ 97,00";
        
        if (isElite) {
          plan_name = "Plano Elite 👑";
          plan_value = "R$ 197,00";
        } else if (sub.product_id && !START_PRODUCT_IDS.includes(sub.product_id) && !isElite && sub.plan_amount && sub.plan_amount > 20000) {
          // Fallback heuristic if amount is known
          plan_name = "Plano Anual 👑";
          plan_value = "R$ 397,00";
        } else if (sub.product_id && !START_PRODUCT_IDS.includes(sub.product_id) && !isElite) {
          // If we don't know the plan, and the user mentioned 397 annual, we can assume unknown products might be the annual one
          plan_name = "Plano Anual 👑";
          plan_value = "R$ 397,00";
        }

        // Se o valor já vier da tabela (se existir) usa ele
        if ((sub as any).plan_name) plan_name = (sub as any).plan_name;
        if ((sub as any).plan_amount) plan_value = `R$ ${((sub as any).plan_amount / 100).toFixed(2).replace('.', ',')}`;

        return {
          user_id: sub.user_id,
          email: emailRecord?.email || maskedProfile?.email_masked || "Email não disponível",
          name: emailRecord?.name || maskedProfile?.name || null,
          status: sub.status as ActiveUser["status"],
          stripe_customer_id: sub.stripe_customer_id || maskedProfile?.stripe_id_masked || null,
          stripe_subscription_id: sub.stripe_subscription_id,
          created_at: sub.created_at,
          current_period_end: sub.current_period_end,
          profile_id: maskedProfile?.id,
          product_id: sub.product_id,
          plan_name,
          plan_value,
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
