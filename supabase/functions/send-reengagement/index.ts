import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { Resend } from "https://esm.sh/resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: Record<string, unknown>) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[REENGAGEMENT] ${step}${detailsStr}`);
};

function escapeHtml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

const getEmailTemplate = (content: string, ctaText: string, ctaLink: string) => `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Canva Viagem</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8f9fa;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
    <div style="background: linear-gradient(135deg, #7D2AE8 0%, #8B3DFF 50%, #00C4CC 100%); padding: 40px 30px; text-align: center;">
      <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: bold;">✈️ Canva Viagem</h1>
      <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 14px;">Conteúdo pronto para sua agência</p>
    </div>
    <div style="padding: 40px 30px;">
      ${content}
      <div style="text-align: center; margin: 35px 0;">
        <a href="${ctaLink}" style="display: inline-block; background: linear-gradient(135deg, #7D2AE8 0%, #8B3DFF 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 50px; font-weight: bold; font-size: 16px; box-shadow: 0 4px 15px rgba(139, 61, 255, 0.3);">
          ${ctaText}
        </a>
      </div>
    </div>
    <div style="background-color: #f8f9fa; padding: 30px; text-align: center; border-top: 1px solid #e9ecef;">
      <p style="color: #6c757d; font-size: 12px; margin: 0;">
        © 2025 Canva Viagem - Rocha Digital Mídia<br>
        <a href="https://canvaviagem.com" style="color: #8B3DFF; text-decoration: none;">canvaviagem.com</a>
      </p>
    </div>
  </div>
</body>
</html>
`;

const getReengagementContent = (name: string) => {
  const safeName = escapeHtml(name);
  return `
  <h2 style="color: #1a1a2e; margin: 0 0 20px 0; font-size: 24px;">Tudo bem por aí, ${safeName}? 👋</h2>
  <p style="color: #4a4a4a; font-size: 16px; line-height: 1.7; margin: 0 0 20px 0;">
    Faz um tempo que você não acessa o Canva Viagem. Percebi sua ausência.
  </p>
  <p style="color: #4a4a4a; font-size: 16px; line-height: 1.7; margin: 0 0 20px 0;">
    Você ainda é assinante — o conteúdo está lá, esperando por você.
  </p>

  <div style="background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%); border-radius: 16px; padding: 25px; margin: 25px 0;">
    <p style="color: #1a1a2e; font-size: 15px; margin: 0 0 15px 0; font-weight: bold;">
      Chegou coisa nova desde sua última visita:
    </p>
    <p style="color: #4a4a4a; font-size: 15px; margin: 0; line-height: 1.8;">
      🎬 <strong>Reels prontos</strong> — baixe, coloque seu logo, publique<br>
      🖼️ <strong>Artes de feed</strong> — atualizadas para esse mês<br>
      📱 <strong>Stories com CTA</strong> — para gerar clientes direto pelo Instagram
    </p>
  </div>

  <p style="color: #4a4a4a; font-size: 16px; line-height: 1.7; margin: 20px 0;">
    Postar hoje leva menos de 10 minutos. Seu primeiro post pode sair ainda hoje.
  </p>
  <p style="color: #4a4a4a; font-size: 16px; line-height: 1.7; margin: 20px 0;">
    Se travar em alguma coisa — me responde esse email. Ajudo pessoalmente.
  </p>
  <p style="color: #4a4a4a; font-size: 16px; line-height: 1.7; margin: 20px 0;">
    Lucas
  </p>
`;
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const resendKey = Deno.env.get("RESEND_API_KEY");
  const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

  if (!resendKey || !supabaseServiceKey) {
    return new Response(JSON.stringify({ error: "Configuration error" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }

  const resend = new Resend(resendKey);
  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  try {
    const now = new Date();
    const day14 = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

    // Buscar assinantes ativos cujo last_sign_in_at é anterior a 14 dias
    // e que ainda não receberam email de reengajamento (ou receberam há mais de 30 dias)
    const { data: users, error: authError } = await supabase.auth.admin.listUsers({
      perPage: 1000,
    });

    if (authError) throw authError;

    logStep("Total auth users fetched", { count: users?.users?.length ?? 0 });

    const activeUsers = (users?.users ?? []).filter((u) => {
      if (!u.last_sign_in_at) return false;
      const lastLogin = new Date(u.last_sign_in_at);
      return lastLogin < day14;
    });

    logStep("Inactive users (14+ days)", { count: activeUsers.length });

    let sent = 0;
    let errors = 0;
    let skipped = 0;

    for (const authUser of activeUsers) {
      try {
        // Verificar se é assinante ativo
        const { data: sub } = await supabase
          .from("subscriptions")
          .select("status")
          .eq("user_id", authUser.id)
          .eq("status", "active")
          .single();

        if (!sub) { skipped++; continue; }

        // Verificar se já enviamos reengajamento recentemente (últimos 30 dias)
        const { data: automation } = await supabase
          .from("user_email_automations")
          .select("reengagement_sent_at, unsubscribed")
          .eq("user_id", authUser.id)
          .single();

        if (!automation || automation.unsubscribed) { skipped++; continue; }

        const day30 = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        if (automation.reengagement_sent_at && new Date(automation.reengagement_sent_at) > day30) {
          skipped++;
          continue;
        }

        const email = authUser.email;
        if (!email) { skipped++; continue; }

        const name = authUser.user_metadata?.full_name || authUser.user_metadata?.name || email.split('@')[0];
        const content = getReengagementContent(name);
        const html = getEmailTemplate(
          content,
          "Acessar o Canva Viagem →",
          "https://canvaviagem.com"
        );

        const result = await resend.emails.send({
          from: "Canva Viagem <lucas@rochadigitalmidia.com.br>",
          to: [email],
          subject: `${name}, faz tempo que você não aparece 👋`,
          html,
        });

        if (result.data?.id) {
          await supabase.from("email_events").insert({
            email_id: result.data.id,
            type: "sent",
            recipient_email: email,
            email_type: "reengagement",
          });

          await supabase
            .from("user_email_automations")
            .update({ reengagement_sent_at: now.toISOString() })
            .eq("user_id", authUser.id);
        }

        logStep("Reengagement sent", { email });
        sent++;
      } catch (err) {
        logStep("Error processing user", { userId: authUser.id, error: String(err) });
        errors++;
      }
    }

    logStep("Reengagement completed", { sent, errors, skipped });
    return new Response(JSON.stringify({ success: true, sent, errors, skipped }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    logStep("FATAL ERROR", { message: msg });
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
