import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface EmailEvent {
  id: string;
  email_id: string;
  type: string;
  recipient_email: string | null; // Now masked in the view
  email_type: string | null;
  created_at: string;
}

// Helper to mask email (client-side fallback)
const maskEmail = (email: string | null): string | null => {
  if (!email) return null;
  const [local, domain] = email.split("@");
  if (!domain) return email;
  return `${local.slice(0, 2)}***@${domain}`;
};

interface UserEmailAutomation {
  id: string;
  email: string;
  name: string | null;
  email_1_sent_at: string | null;
  email_2_sent_at: string | null;
  email_3_sent_at: string | null;
  created_at: string;
  unsubscribed: boolean;
}

export const useEmailDashboard = () => {
  // Estatísticas da tabela user_email_automations
  const automationsQuery = useQuery({
    queryKey: ["email-automations"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_email_automations")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data as UserEmailAutomation[];
    },
    refetchInterval: 30000, // Atualiza a cada 30 segundos
  });

  // Eventos recentes - mascarar emails no cliente
  const eventsQuery = useQuery({
    queryKey: ["email-events"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("email_events")
        .select("id, email_id, type, recipient_email, email_type, created_at")
        .order("created_at", { ascending: false })
        .limit(50);
      
      if (error) throw error;
      
      // Mascarar emails no resultado
      return (data || []).map(event => ({
        ...event,
        recipient_email: maskEmail(event.recipient_email),
      })) as EmailEvent[];
    },
    refetchInterval: 30000,
  });

  // Calcular métricas
  const calculateMetrics = () => {
    const automations = automationsQuery.data || [];
    const events = eventsQuery.data || [];

    // Total enviados (soma de todos os emails)
    const totalEmail1 = automations.filter(a => a.email_1_sent_at).length;
    const totalEmail2 = automations.filter(a => a.email_2_sent_at).length;
    const totalEmail3 = automations.filter(a => a.email_3_sent_at).length;
    const totalSent = totalEmail1 + totalEmail2 + totalEmail3;

    // Taxa de abertura (eventos opened / eventos sent)
    const sentEvents = events.filter(e => e.type === "sent").length;
    const openedEvents = events.filter(e => e.type === "opened").length;
    const openRate = sentEvents > 0 ? ((openedEvents / sentEvents) * 100).toFixed(1) : "0.0";

    // Próximos envios (nas próximas 24h)
    const now = new Date();
    const next24h = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const threeDaysFromNow = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
    const fiveDaysFromNow = new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000);

    let upcomingSends = 0;
    automations.forEach(a => {
      if (a.unsubscribed) return;
      const createdAt = new Date(a.created_at);
      
      // Precisa do email 2 e já passou 3 dias
      if (!a.email_2_sent_at && createdAt <= threeDaysFromNow) {
        upcomingSends++;
      }
      // Precisa do email 3 e já passou 5 dias
      else if (!a.email_3_sent_at && a.email_2_sent_at && createdAt <= fiveDaysFromNow) {
        upcomingSends++;
      }
    });

    // Distribuição do funil
    const funnelData = [
      { name: "Apenas Email 1", value: automations.filter(a => a.email_1_sent_at && !a.email_2_sent_at).length, fill: "hsl(var(--primary))" },
      { name: "Até Email 2", value: automations.filter(a => a.email_2_sent_at && !a.email_3_sent_at).length, fill: "hsl(265, 78%, 60%)" },
      { name: "Todos os 3", value: automations.filter(a => a.email_3_sent_at).length, fill: "hsl(var(--accent))" },
      { name: "Nenhum ainda", value: automations.filter(a => !a.email_1_sent_at).length, fill: "hsl(var(--muted))" },
    ].filter(d => d.value > 0);

    // Envios por dia (últimos 7 dias)
    const dailyData: { date: string; email1: number; email2: number; email3: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split("T")[0];
      
      const dayAutomations = automations.filter(a => {
        const e1 = a.email_1_sent_at?.split("T")[0];
        const e2 = a.email_2_sent_at?.split("T")[0];
        const e3 = a.email_3_sent_at?.split("T")[0];
        return e1 === dateStr || e2 === dateStr || e3 === dateStr;
      });

      dailyData.push({
        date: date.toLocaleDateString("pt-BR", { weekday: "short", day: "numeric" }),
        email1: automations.filter(a => a.email_1_sent_at?.split("T")[0] === dateStr).length,
        email2: automations.filter(a => a.email_2_sent_at?.split("T")[0] === dateStr).length,
        email3: automations.filter(a => a.email_3_sent_at?.split("T")[0] === dateStr).length,
      });
    }

    return {
      totalSent,
      totalEmail1,
      totalEmail2,
      totalEmail3,
      openRate,
      upcomingSends,
      funnelData,
      dailyData,
      totalUsers: automations.length,
      unsubscribed: automations.filter(a => a.unsubscribed).length,
    };
  };

  return {
    automationsQuery,
    eventsQuery,
    metrics: calculateMetrics(),
    isLoading: automationsQuery.isLoading || eventsQuery.isLoading,
    error: automationsQuery.error || eventsQuery.error,
  };
};
