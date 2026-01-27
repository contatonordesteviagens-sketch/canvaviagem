import { useQuery } from "@tanstack/react-query";
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

      // Buscar emails de user_email_automations (onde os emails realmente estão)
      const { data: emailData, error: emailError } = await supabase
        .from("user_email_automations")
        .select("user_id, email, name");

      if (emailError) {
        console.error("Erro ao buscar emails:", emailError);
      }

      // Também tentar buscar de profiles como fallback
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, email");

      // Combinar dados - priorizar user_email_automations, depois profiles
      const users: ActiveUser[] = subscriptions.map((sub) => {
        const emailRecord = emailData?.find((e) => e.user_id === sub.user_id);
        const profileRecord = profiles?.find((p) => p.user_id === sub.user_id);
        
        return {
          user_id: sub.user_id,
          email: emailRecord?.email || profileRecord?.email || "Email não disponível",
          name: emailRecord?.name || null,
          status: sub.status as ActiveUser["status"],
          stripe_customer_id: sub.stripe_customer_id,
          stripe_subscription_id: sub.stripe_subscription_id,
          created_at: sub.created_at,
          current_period_end: sub.current_period_end,
        };
      });

      return users;
    },
    staleTime: 1000 * 60 * 2, // 2 minutos
  });
};
