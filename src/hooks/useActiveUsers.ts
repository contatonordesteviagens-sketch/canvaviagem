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
  origem?: string;
  phone?: string | null;
  sites?: any[];
  canceled_at?: string | null;
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

      // Buscar todos os perfis diretamente usando o SDK
      // O RLS permite admin ler public.profiles
      const { data: allProfiles, error: profilesError } = await supabase
        .from("profiles")
        .select("user_id, email, name, stripe_customer_id, id, created_at, phone");

      if (profilesError) {
        console.error("Erro ao buscar profiles:", profilesError);
        throw profilesError;
      }
      
      const maskedProfiles = allProfiles || [];

      // Buscar todos os sites criados pelos usuários (Para a auditoria de lixo/cancelados)
      const { data: sitesData, error: sitesError } = await supabase
        .from("public_sites")
        .select("id, owner_id, html, created_at, updated_at");

      if (sitesError) {
        console.error("Erro ao buscar sites:", sitesError);
      }
      const allSites = sitesData || [];

      // We query user_email_automations as the primary source for real emails since the user is an admin
      const { data: emailDataResult } = await supabase
        .from("user_email_automations")
        .select("user_id, email, name");
      
      const emailData = emailDataResult || [];

      // Query hotmart_sales to find users who bought via Hotmart (Using edge function to bypass RLS)
      const { data: hotmartSalesResult, error: hotmartSalesError } = await supabase.functions.invoke(
        "get-hotmart-sales"
      );
      
      if (hotmartSalesError) {
        console.error("Erro ao buscar hotmart sales:", hotmartSalesError);
      }

      const hotmartSales = hotmartSalesResult || [];

      // Otimização O(1): Criar Hash Maps para buscas instantâneas
      const subMap = new Map(subscriptions.map(s => [s.user_id, s]));
      const emailMap = new Map(emailData.map(e => [e.user_id, e]));
      const hotmartMap = new Map(
        hotmartSales
          .filter(h => h.h_email)
          .map(h => [h.h_email.toLowerCase(), h])
      );

      // O(1) Map para Sites
      const sitesMap = new Map<string, any[]>();
      allSites.forEach(site => {
        if (site.owner_id) {
          if (!sitesMap.has(site.owner_id)) sitesMap.set(site.owner_id, []);
          sitesMap.get(site.owner_id)!.push(site);
        }
      });

      // Mapeia todos os perfis (usuários do sistema)
      const users: ActiveUser[] = maskedProfiles.map((profile) => {
        const sub = subMap.get(profile.user_id);
        const emailRecord = emailMap.get(profile.user_id);
        
        let plan_name = "Gratuito";
        let plan_value = "R$ 0,00";
        let status = "inactive" as ActiveUser["status"];
        let origem = "Orgânico";
        
        // Se quisermos extrair real emails
        const finalEmail = emailRecord?.email || profile.email || "Email não disponível";

        // Verifica se há venda na Hotmart por este email
        const hotmartSale: any = finalEmail !== "Email não disponível" 
          ? hotmartMap.get(finalEmail.toLowerCase())
          : undefined;

        if (hotmartSale) origem = "Hotmart";

        if (sub) {
            status = sub.status as ActiveUser["status"];
            const isElite = isEliteProduct(sub.product_id);
            plan_name = isElite ? "Plano Elite" : "Plano Start";
            plan_value = isElite ? "R$ 90,00" : "R$ 39,00";

            if ((sub as any).plan_name) plan_name = (sub as any).plan_name;
            if ((sub as any).plan_amount) plan_value = `R$ ${((sub as any).plan_amount / 100).toFixed(2).replace('.', ',')}`;
            
            origem = sub.stripe_subscription_id ? "Stripe" : (hotmartSale ? "Hotmart" : "Orgânico");
        } else if (hotmartSale) {
            const hStatus = hotmartSale.h_status;
            if (hStatus === "APPROVED" || hStatus === "COMPLETED") status = "active";
            else if (hStatus === "CANCELED" || hStatus === "REFUNDED" || hStatus === "CHARGEBACK") status = "canceled";
            else if (hStatus === "DELAYED") status = "past_due";
            else status = "inactive";

            plan_name = hotmartSale.h_product_name || "Plano Elite";
            plan_value = hotmartSale.h_price_value ? `R$ ${Number(hotmartSale.h_price_value).toFixed(2).replace('.', ',')}` : "R$ 197,00";
        }

        // Tenta encontrar a data mais antiga possível para representar o início real
        const dates = [
          sub?.created_at,
          hotmartSale?.h_purchase_date,
          profile.created_at
        ].filter(Boolean).map(d => new Date(d as string).getTime());
        
        const oldestDate = dates.length > 0 ? new Date(Math.min(...dates)).toISOString() : new Date().toISOString();

        return {
          user_id: profile.id || profile.user_id,
          email: finalEmail,
          name: emailRecord?.name || profile.name || null,
          status: status,
          stripe_customer_id: sub?.stripe_customer_id || profile.stripe_customer_id || null,
          stripe_subscription_id: sub?.stripe_subscription_id || null,
          created_at: oldestDate,
          current_period_end: sub?.current_period_end || null,
          profile_id: profile.id,
          product_id: sub?.product_id || null,
          plan_name,
          plan_value,
          origem,
          phone: profile.phone,
          sites: sitesMap.get(profile.id) || sitesMap.get(profile.user_id) || [],
          canceled_at: status === "canceled" ? (sub?.updated_at || hotmartSale?.h_updated_at || hotmartSale?.updated_at || null) : null,
        };
      });

      // Adiciona assinaturas órfãs (que não tem profile) só por garantia
      const profileUserIds = new Set(maskedProfiles.map(p => p.user_id));
      const orphanSubs = subscriptions.filter(s => !profileUserIds.has(s.user_id));
      
      orphanSubs.forEach((sub) => {
        const emailRecord = emailMap.get(sub.user_id);
        const isElite = isEliteProduct(sub.product_id);
        let plan_name = isElite ? "Plano Elite" : "Plano Start";
        let plan_value = isElite ? "R$ 90,00" : "R$ 39,00";
        let origem = sub.stripe_subscription_id ? "Stripe" : "Hotmart";

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
          origem,
          phone: null,
          sites: sitesMap.get(sub.user_id) || [],
          canceled_at: sub.status === "canceled" ? sub.updated_at : null,
        });
      });

      // Adiciona vendas Hotmart órfãs (que não tem profile nem subscription)
      const existingEmails = new Set(users.map(u => u.email.toLowerCase()));
      const orphanHotmart = hotmartSales.filter(h => h.h_email && !existingEmails.has(h.h_email.toLowerCase()));
      
      orphanHotmart.forEach((sale) => {
        const email = sale.h_email.toLowerCase();
        users.push({
          user_id: `hotmart_orphan_${email}`, // Fake ID just for keying
          email: email,
          name: sale.h_buyer_name || null,
          status: (sale.h_status === "APPROVED" || sale.h_status === "COMPLETED") ? "active" : "canceled",
          stripe_customer_id: null,
          stripe_subscription_id: null,
          created_at: sale.h_purchase_date || new Date().toISOString(),
          current_period_end: null,
          profile_id: undefined,
          product_id: null,
          plan_name: sale.h_product_name || "Plano Elite",
          plan_value: sale.h_price_value ? `R$ ${Number(sale.h_price_value).toFixed(2).replace('.', ',')}` : "R$ 197,00",
          origem: "Hotmart",
          phone: sale.h_buyer_phone || null,
          sites: [], // Orphan hotmart won't have matched sites unless by email (skipped for now)
          canceled_at: (sale.h_status === "CANCELED" || sale.h_status === "REFUNDED" || sale.h_status === "CHARGEBACK") ? (sale.h_updated_at || sale.updated_at) : null,
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
