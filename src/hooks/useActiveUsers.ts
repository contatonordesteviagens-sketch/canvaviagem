import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface ActiveUser {
  user_id: string;
  email: string;
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
      // Buscar dados de subscriptions com profiles
      const { data: subscriptions, error: subError } = await supabase
        .from("subscriptions")
        .select("*")
        .order("created_at", { ascending: false });

      if (subError) throw subError;

      // Buscar profiles para obter emails
      const { data: profiles, error: profError } = await supabase
        .from("profiles")
        .select("user_id, email");

      if (profError) throw profError;

      // Combinar dados
      const users: ActiveUser[] = subscriptions.map((sub) => {
        const profile = profiles.find((p) => p.user_id === sub.user_id);
        return {
          user_id: sub.user_id,
          email: profile?.email || "Email não disponível",
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
