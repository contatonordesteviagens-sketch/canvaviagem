import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { isEliteProduct } from "@/lib/planAccess";

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
        created_at: string;
      }> = [];
      
      try {
        const session = await supabase.auth.getSession();
        const response = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/profiles_admin_view?select=user_id,email_masked,name,stripe_id_masked,id,created_at&limit=2000`,
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
        console.log("View profiles_admin_view not available, using fallback", err);
      }

      // We query user_email_automations as the primary source for real emails since the user is an admin
      const { data: emailDataResult } = await supabase
        .from("user_email_automations")
        .select("user_id, email, name");
      
      const emailData = emailDataResult || [];

      // Mapeia todos os perfis (usuários do sistema)
      const users: ActiveUser[] = maskedProfiles.map((profile) => {
        const sub = subscriptions.find((s) => s.user_id === profile.user_id);
        const emailRecord = emailData?.find((e) => e.user_id === profile.user_id);
        
        let plan_name = "Gratuito";
        let plan_value = "R$ 0,00";
        let status = "inactive" as ActiveUser["status"];
        
        if (sub) {
            status = sub.status as ActiveUser["status"];
            const isElite = isEliteProduct(sub.product_id);
            plan_name = isElite ? "Plano Elite" : "Plano Start";
            plan_value = isElite ? "R$ 90,00" : "R$ 39,00";

            if ((sub as any).plan_name) plan_name = (sub as any).plan_name;
            if ((sub as any).plan_amount) plan_value = `R$ ${((sub as any).plan_amount / 100).toFixed(2).replace('.', ',')}`;
        }

        return {
          user_id: profile.user_id,
          email: emailRecord?.email || profile.email_masked || "Email não disponível",
          name: emailRecord?.name || profile.name || null,
          status: status,
          stripe_customer_id: sub?.stripe_customer_id || profile.stripe_id_masked || null,
          stripe_subscription_id: sub?.stripe_subscription_id || null,
          created_at: profile.created_at || sub?.created_at || new Date().toISOString(),
          current_period_end: sub?.current_period_end || null,
          profile_id: profile.id,
          product_id: sub?.product_id || null,
          plan_name,
          plan_value,
        };
      });

      // Adiciona assinaturas órfãs (que não tem profile) só por garantia
      const profileUserIds = new Set(maskedProfiles.map(p => p.user_id));
      const orphanSubs = subscriptions.filter(s => !profileUserIds.has(s.user_id));
      
      orphanSubs.forEach((sub) => {
        const emailRecord = emailData?.find((e) => e.user_id === sub.user_id);
        const isElite = isEliteProduct(sub.product_id);
        let plan_name = isElite ? "Plano Elite" : "Plano Start";
        let plan_value = isElite ? "R$ 90,00" : "R$ 39,00";

        if ((sub as any).plan_name) plan_name = (sub as any).plan_name;
        if ((sub as any).plan_amount) plan_value = `R$ ${((sub as any).plan_amount / 100).toFixed(2).replace('.', ',')}`;

        users.push({
          user_id: sub.user_id,
          email: emailRecord?.email || "Email não disponível",
          name: emailRecord?.name || null,
          status: sub.status as ActiveUser["status"],
          stripe_customer_id: sub.stripe_customer_id || null,
          stripe_subscription_id: sub.stripe_subscription_id,
          created_at: sub.created_at,
          current_period_end: sub.current_period_end,
          profile_id: undefined,
          product_id: sub.product_id,
          plan_name,
          plan_value,
        });
      });

      // Ordenar por data de criação mais recente
      users.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

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
