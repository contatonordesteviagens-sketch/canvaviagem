import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { isEliteProduct } from "../_shared/planAccess.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: Record<string, unknown>) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[PROMOTIONAL-CAMPAIGN] ${step}${detailsStr}`);
};

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
      <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 14px;">Melhorando a sua agência diariamente</p>
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

  // SEGURANÇA: exigir admin autenticado (JWT + role 'admin')
  try {
    const authHeader = req.headers.get("Authorization") || "";
    const token = authHeader.replace(/^Bearer\s+/i, "").trim();
    if (!token) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 401,
      });
    }
    const { data: userData, error: userErr } = await supabase.auth.getUser(token);
    if (userErr || !userData?.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 401,
      });
    }
    const { data: roleRow } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userData.user.id)
      .eq("role", "admin")
      .maybeSingle();
    if (!roleRow) {
      return new Response(JSON.stringify({ error: "Forbidden: admin only" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 403,
      });
    }
  } catch (_e) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 401,
    });
  }

  try {
    const { campaignType } = await req.json();
    logStep("Triggering campaign:", { campaignType });

    if (campaignType === "recovery") {
      // 1. Fetch checkouts from abandoned_checkouts
      const { data: abandoned } = await supabase
        .from("abandoned_checkouts")
        .select("email, id");

      // 2. Fetch past due / unpaid subscriptions
      const { data: pastDue } = await supabase
        .from("subscriptions")
        .select("user_id")
        .or("status.eq.past_due,status.eq.unpaid");

      // Get email addresses for pastDue from profiles
      const userIds = (pastDue || []).map(s => s.user_id);
      let pastDueEmails: string[] = [];
      if (userIds.length > 0) {
        const { data: profiles } = await supabase
          .from("profiles")
          .select("email")
          .in("user_id", userIds);
        pastDueEmails = (profiles || []).map(p => p.email).filter(Boolean);
      }

      // Combine emails and remove duplicates
      const allEmails = Array.from(new Set([
        ...(abandoned || []).map(a => a.email),
        ...pastDueEmails
      ])).filter(Boolean);

      logStep("Target recovery audience size:", { count: allEmails.length });

      let sent = 0;
      let errors = 0;

      for (const email of allEmails) {
        try {
          const name = email.split('@')[0];
          const content = `
            <h2 style="color: #1a1a2e; margin: 0 0 20px 0; font-size: 24px;">Ficou alguma dúvida sobre o seu acesso? 🤔</h2>
            <p style="color: #4a4a4a; font-size: 16px; line-height: 1.7; margin: 0 0 20px 0;">
              Olá, ${name}!
            </p>
            <p style="color: #4a4a4a; font-size: 16px; line-height: 1.7; margin: 0 0 20px 0;">
              Percebi que você tentou garantir seu acesso ao <strong>Canva Viagem</strong> recentemente, mas a sua inscrição não foi finalizada.
            </p>
            <p style="color: #4a4a4a; font-size: 16px; line-height: 1.7; margin: 0 0 20px 0;">
              Se você teve qualquer problema com a forma de pagamento, limite ou erro no cartão, eu posso te ajudar pessoalmente! Basta responder a este e-mail.
            </p>
            <p style="color: #4a4a4a; font-size: 16px; line-height: 1.7; margin: 0 0 25px 0;">
              Caso queira tentar novamente e ter acesso imediato a mais de 1.000 templates de viagens, reels virais e legendas prontas, clique no link seguro abaixo:
            </p>
          `;

          const ctaLink = "https://buy.stripe.com/8x26oIgGuej656zaAY8so05";
          const html = getEmailTemplate(content, "Finalizar Minha Inscrição com Segurança", ctaLink);

          const result = await resend.emails.send({
            from: "Canva Viagem <contato@canvaviagem.com>",
            to: [email],
            subject: "Ficou alguma dúvida sobre o seu acesso ao Canva Viagem? 🤔",
            html,
          });

          if (result.data?.id) {
            await supabase.from("email_events").insert({
              email_id: result.data.id,
              type: "sent",
              recipient_email: email,
              email_type: "manual_recovery",
            });
            sent++;
          } else {
            errors++;
          }
        } catch (e) {
          logStep("Error sending recovery email to:", { email, error: String(e) });
          errors++;
        }
      }

      return new Response(JSON.stringify({ success: true, sent, errors }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });

    } else if (campaignType === "upgrade") {
      // 1. Fetch active subscriptions
      const { data: activeSubs } = await supabase
        .from("subscriptions")
        .select("user_id, product_id")
        .eq("status", "active");

      const startUserIds = (activeSubs || [])
        .filter(s => !isEliteProduct(s.product_id))
        .map(s => s.user_id);

      let targetUsers: { email: string; name: string }[] = [];
      if (startUserIds.length > 0) {
        const { data: profiles } = await supabase
          .from("profiles")
          .select("email, name")
          .in("user_id", startUserIds);
        targetUsers = (profiles || []).map(p => ({
          email: p.email || "",
          name: p.name || p.email?.split('@')[0] || "Parceiro"
        })).filter(u => u.email);
      }

      logStep("Target upgrade audience size:", { count: targetUsers.length });

      let sent = 0;
      let errors = 0;

      for (const user of targetUsers) {
        try {
          const content = `
            <h2 style="color: #1a1a2e; margin: 0 0 20px 0; font-size: 24px;">Upgrade Especial: Fábrica de Anúncios IA e Criador de Sites 🚀</h2>
            <p style="color: #4a4a4a; font-size: 16px; line-height: 1.7; margin: 0 0 20px 0;">
              Olá, ${user.name}!
            </p>
            <p style="color: #4a4a4a; font-size: 16px; line-height: 1.7; margin: 0 0 20px 0;">
              Como assinante ativo do Canva Viagem, você já tem acesso aos melhores templates. Mas hoje quero te fazer um convite para subir de nível e automatizar 100% da sua agência.
            </p>
            <p style="color: #4a4a4a; font-size: 16px; line-height: 1.7; margin: 0 0 20px 0;">
              O <strong>Plano Elite</strong> libera para você:
            </p>
            <ul style="color: #4a4a4a; font-size: 15px; line-height: 1.8; margin: 0 0 20px 20px; padding: 0;">
              <li>🏭 <strong>A Fábrica de Anúncios com IA:</strong> Digite o destino e nossa inteligência artificial cria o roteiro, legenda e escolhe as fotos perfeitas para o seu anúncio em segundos.</li>
              <li>🌐 <strong>Criador de Sites de Viagem:</strong> Crie páginas de vendas de viagens profissionais e de alta conversão sem saber nada de programação.</li>
            </ul>
            <p style="color: #4a4a4a; font-size: 16px; line-height: 1.7; margin: 0 0 25px 0;">
              Preparamos uma condição de upgrade exclusiva com desconto para você que já é de casa!
            </p>
          `;

          const ctaLink = "https://buy.stripe.com/8x26oIgGuej656zaAY8so05";
          const html = getEmailTemplate(content, "Fazer Upgrade para Plano Elite Agora", ctaLink);

          const result = await resend.emails.send({
            from: "Canva Viagem <contato@canvaviagem.com>",
            to: [user.email],
            subject: "💥 [Upgrade Especial] Libere a Fábrica de Anúncios IA e Criador de Sites 🚀",
            html,
          });

          if (result.data?.id) {
            await supabase.from("email_events").insert({
              email_id: result.data.id,
              type: "sent",
              recipient_email: user.email,
              email_type: "manual_upgrade_elite",
            });
            sent++;
          } else {
            errors++;
          }
        } catch (e) {
          logStep("Error sending upgrade email to:", { email: user.email, error: String(e) });
          errors++;
        }
      }

      return new Response(JSON.stringify({ success: true, sent, errors }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });

    } else {
      return new Response(JSON.stringify({ error: "Invalid campaign type" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

  } catch (error) {
    logStep("Fatal Error", { error: String(error) });
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
