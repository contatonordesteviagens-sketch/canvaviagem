import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { Resend } from "https://esm.sh/resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: Record<string, unknown>) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[DRIP-CAMPAIGN] ${step}${detailsStr}`);
};

// Security: HTML escape function to prevent HTML injection in email templates
function escapeHtml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// ========== EMAIL TEMPLATES ==========

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
    <!-- Header com Gradiente -->
    <div style="background: linear-gradient(135deg, #7D2AE8 0%, #8B3DFF 50%, #00C4CC 100%); padding: 40px 30px; text-align: center;">
      <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: bold;">✈️ Canva Viagem</h1>
      <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 14px;">Sua plataforma de criação para agentes de viagem</p>
    </div>
    
    <!-- Conteúdo -->
    <div style="padding: 40px 30px;">
      ${content}
      
      <!-- Botão CTA -->
      <div style="text-align: center; margin: 35px 0;">
        <a href="${ctaLink}" style="display: inline-block; background: linear-gradient(135deg, #7D2AE8 0%, #8B3DFF 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 50px; font-weight: bold; font-size: 16px; box-shadow: 0 4px 15px rgba(139, 61, 255, 0.3);">
          ${ctaText}
        </a>
      </div>
    </div>
    
    <!-- Footer -->
    <div style="background-color: #f8f9fa; padding: 30px; text-align: center; border-top: 1px solid #e9ecef;">
      <p style="color: #6c757d; font-size: 12px; margin: 0;">
        © 2025 Canva Viagem - Rocha Digital Mídia<br>
        <a href="https://canvatrip.lovable.app" style="color: #8B3DFF; text-decoration: none;">canvatrip.lovable.app</a>
      </p>
    </div>
  </div>
</body>
</html>
`;

const getEmail1Content = (name: string) => {
  const safeName = escapeHtml(name);
  return `
  <h2 style="color: #1a1a2e; margin: 0 0 20px 0; font-size: 24px;">Olá, ${safeName}! 👋</h2>
  <p style="color: #4a4a4a; font-size: 16px; line-height: 1.7; margin: 0 0 20px 0;">
    Seja muito bem-vindo(a) ao <strong>CanvaTrip</strong>! É uma alegria ter você aqui.
  </p>
  <p style="color: #4a4a4a; font-size: 16px; line-height: 1.7; margin: 0 0 20px 0;">
    Para começar da melhor forma, preparei um <strong>tutorial exclusivo</strong> ensinando como usar nossa ferramenta e criar posts incríveis para suas redes sociais.
  </p>
  
  <div style="background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%); border-radius: 16px; padding: 25px; margin: 25px 0;">
    <p style="color: #1a1a2e; font-size: 15px; margin: 0; line-height: 1.6;">
      🎥 <strong>No vídeo você vai aprender:</strong><br><br>
      ✅ Como navegar pela plataforma<br>
      ✅ Como editar templates no Canva<br>
      ✅ Dicas para criar posts que vendem
    </p>
  </div>
  
  <p style="color: #4a4a4a; font-size: 16px; line-height: 1.7; margin: 20px 0;">
    Após assistir, faça login na plataforma para criar seus primeiros posts!
  </p>
`;
};

const getEmail2Content = (name: string) => {
  const safeName = escapeHtml(name);
  return `
  <h2 style="color: #1a1a2e; margin: 0 0 20px 0; font-size: 24px;">${safeName}, este é seu próximo passo! ✈️</h2>
  <p style="color: #4a4a4a; font-size: 16px; line-height: 1.7; margin: 0 0 20px 0;">
    Você já está usando o CanvaTrip há alguns dias. Parabéns por dar esse passo!
  </p>
  <p style="color: #4a4a4a; font-size: 16px; line-height: 1.7; margin: 0 0 20px 0;">
    Mas deixa eu te perguntar: <strong>você está realmente vendendo viagens com suas redes sociais?</strong>
  </p>
  <p style="color: #4a4a4a; font-size: 16px; line-height: 1.7; margin: 0 0 25px 0;">
    Criei o curso <strong>Agente Lucrativo</strong> para agentes que querem ir além dos posts bonitos e realmente <strong>faturar alto</strong> no turismo.
  </p>
  
  <div style="background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%); border-radius: 16px; padding: 25px; margin: 25px 0;">
    <p style="color: #1a1a2e; font-size: 15px; margin: 0 0 15px 0; font-weight: bold;">
      📚 O que você vai aprender:
    </p>
    <p style="color: #4a4a4a; font-size: 15px; margin: 0; line-height: 1.8;">
      🎬 <strong>Edição de Vídeo</strong> - Crie Reels e Stories que viralizam<br>
      📢 <strong>Tráfego Pago para Viagens</strong> - Anúncios que trazem clientes<br>
      📱 <strong>Automação de WhatsApp</strong> - Atenda mais sem perder qualidade<br>
      💰 <strong>Vendas no X1</strong> - Feche mais pacotes pelo WhatsApp
    </p>
  </div>
  
  <p style="color: #4a4a4a; font-size: 16px; line-height: 1.7; margin: 20px 0;">
    Não fique só na criação de posts. <strong>Aprenda a vender de verdade!</strong>
  </p>
`;
};

const getEmail3Content = (name: string) => {
  const safeName = escapeHtml(name);
  return `
  <h2 style="color: #1a1a2e; margin: 0 0 20px 0; font-size: 24px;">Última chance, ${safeName}! 🚀</h2>
  <p style="color: #4a4a4a; font-size: 16px; line-height: 1.7; margin: 0 0 20px 0;">
    Já faz 5 dias que você está no CanvaTrip. E eu preciso ser sincero com você:
  </p>
  <p style="color: #4a4a4a; font-size: 16px; line-height: 1.7; margin: 0 0 20px 0;">
    <strong>Posts bonitos não pagam suas contas.</strong> Vendas sim.
  </p>
  <p style="color: #4a4a4a; font-size: 16px; line-height: 1.7; margin: 0 0 25px 0;">
    O mercado de turismo está mais competitivo do que nunca. Quem não se profissionaliza, fica para trás.
  </p>
  
  <div style="background: linear-gradient(135deg, #7D2AE8 0%, #8B3DFF 100%); border-radius: 16px; padding: 25px; margin: 25px 0;">
    <p style="color: #ffffff; font-size: 16px; margin: 0; line-height: 1.7; text-align: center;">
      ⚡ <strong>O Agente Lucrativo</strong> já transformou a vida de centenas de agentes de viagem.<br><br>
      Edição de Vídeo + Tráfego Pago + WhatsApp + Vendas X1<br><br>
      <strong>Tudo o que você precisa para dominar o mercado.</strong>
    </p>
  </div>
  
  <p style="color: #4a4a4a; font-size: 16px; line-height: 1.7; margin: 20px 0;">
    Esta é minha última mensagem sobre isso. A decisão é sua.
  </p>
  <p style="color: #4a4a4a; font-size: 16px; line-height: 1.7; margin: 20px 0;">
    <strong>Você quer continuar no mesmo lugar ou quer ser um Agente Lucrativo?</strong>
  </p>
`;
};

// ========== SEND FUNCTIONS ==========

// deno-lint-ignore no-explicit-any
async function sendEmail1(resend: Resend, email: string, name: string, supabase: any) {
  const content = getEmail1Content(name);
  const html = getEmailTemplate(content, "🎥 Assistir Vídeo Aula", "https://youtu.be/1Or9QJPn6OA");
  
  const result = await resend.emails.send({
    from: "Canva Viagem <lucas@rochadigitalmidia.com.br>",
    to: [email],
    subject: "Bem-vindo! Acesse seu Tutorial 🎥",
    html,
  });
  
  // Salvar evento 'sent' na tabela email_events
  if (result.data?.id) {
    const { error } = await supabase.from("email_events").insert({
      email_id: result.data.id,
      type: "sent",
      recipient_email: email,
      email_type: "email_1",
    });
    if (error) logStep("Email event insert error", { error: error.message });
  }
  
  logStep("Email 1 sent", { email, emailId: result.data?.id });
  return result;
}

// deno-lint-ignore no-explicit-any
async function sendEmail2(resend: Resend, email: string, name: string, supabase: any) {
  const content = getEmail2Content(name);
  const html = getEmailTemplate(content, "✈️ Conhecer o Curso Agente Lucrativo", "https://rochadigitalmidia.com.br/agente-lucrativo/");
  
  const result = await resend.emails.send({
    from: "Canva Viagem <lucas@rochadigitalmidia.com.br>",
    to: [email],
    subject: "Este é seu próximo passo para vender mais viagens ✈️",
    html,
  });
  
  if (result.data?.id) {
    const { error } = await supabase.from("email_events").insert({
      email_id: result.data.id,
      type: "sent",
      recipient_email: email,
      email_type: "email_2",
    });
    if (error) logStep("Email event insert error", { error: error.message });
  }
  
  logStep("Email 2 sent", { email, emailId: result.data?.id });
  return result;
}

// deno-lint-ignore no-explicit-any
async function sendEmail3(resend: Resend, email: string, name: string, supabase: any) {
  const content = getEmail3Content(name);
  const html = getEmailTemplate(content, "🚀 Quero Ser Um Agente Lucrativo", "https://rochadigitalmidia.com.br/agente-lucrativo/");
  
  const result = await resend.emails.send({
    from: "Canva Viagem <lucas@rochadigitalmidia.com.br>",
    to: [email],
    subject: "Última chance: Domine o mercado de turismo 🚀",
    html,
  });
  
  if (result.data?.id) {
    const { error } = await supabase.from("email_events").insert({
      email_id: result.data.id,
      type: "sent",
      recipient_email: email,
      email_type: "email_3",
    });
    if (error) logStep("Email event insert error", { error: error.message });
  }
  
  logStep("Email 3 sent", { email, emailId: result.data?.id });
  return result;
}

// ========== MAIN HANDLER ==========

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const resendKey = Deno.env.get("RESEND_API_KEY");
  const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

  if (!resendKey) {
    logStep("ERROR: RESEND_API_KEY not configured");
    return new Response(JSON.stringify({ error: "Configuration error" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }

  if (!supabaseServiceKey) {
    logStep("ERROR: SUPABASE_SERVICE_ROLE_KEY not configured");
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
    const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
    const fiveDaysAgo = new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000);

    logStep("Starting drip campaign", { 
      now: now.toISOString(), 
      threeDaysAgo: threeDaysAgo.toISOString(),
      fiveDaysAgo: fiveDaysAgo.toISOString() 
    });

    // Buscar usuários com emails pendentes (não unsubscribed)
    const { data: users, error } = await supabase
      .from("user_email_automations")
      .select("*")
      .eq("unsubscribed", false)
      .or("email_1_sent_at.is.null,email_2_sent_at.is.null,email_3_sent_at.is.null");

    if (error) {
      logStep("Database error", { error: error.message });
      throw error;
    }

    logStep("Users to process", { count: users?.length ?? 0 });

    const emailsSent = { email1: 0, email2: 0, email3: 0, errors: 0 };

    for (const user of users ?? []) {
      const userName = user.name || user.email.split("@")[0];
      const createdAt = new Date(user.created_at);

      try {
        // EMAIL 1: Boas-vindas (imediato - enviado assim que cadastra)
        if (!user.email_1_sent_at) {
          await sendEmail1(resend, user.email, userName, supabase);
          await supabase
            .from("user_email_automations")
            .update({ email_1_sent_at: now.toISOString() })
            .eq("id", user.id);
          emailsSent.email1++;
          continue; // Só envia 1 email por execução por usuário
        }

        // EMAIL 2: Curso Agente Lucrativo (3 dias depois do cadastro)
        if (!user.email_2_sent_at && createdAt < threeDaysAgo) {
          await sendEmail2(resend, user.email, userName, supabase);
          await supabase
            .from("user_email_automations")
            .update({ email_2_sent_at: now.toISOString() })
            .eq("id", user.id);
          emailsSent.email2++;
          continue;
        }

        // EMAIL 3: Oferta Final (5 dias depois do cadastro)
        if (!user.email_3_sent_at && createdAt < fiveDaysAgo) {
          await sendEmail3(resend, user.email, userName, supabase);
          await supabase
            .from("user_email_automations")
            .update({ email_3_sent_at: now.toISOString() })
            .eq("id", user.id);
          emailsSent.email3++;
        }
      } catch (userError) {
        logStep("Error processing user", { 
          userId: user.id, 
          email: user.email,
          error: userError instanceof Error ? userError.message : String(userError)
        });
        emailsSent.errors++;
      }
    }

    logStep("Campaign completed successfully", emailsSent);

    return new Response(JSON.stringify({ success: true, ...emailsSent }), {
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
