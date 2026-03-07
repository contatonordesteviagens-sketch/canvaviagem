import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { Resend } from "https://esm.sh/resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: Record<string, unknown>) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[WINBACK] ${step}${detailsStr}`);
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
      <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 14px;">Sentimos sua falta</p>
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

// D+7: Saudade + convite para voltar
const getWinback1Content = (name: string) => {
  const safeName = escapeHtml(name);
  return `
  <h2 style="color: #1a1a2e; margin: 0 0 20px 0; font-size: 24px;">Sentimos sua falta, ${safeName} 💜</h2>
  <p style="color: #4a4a4a; font-size: 16px; line-height: 1.7; margin: 0 0 20px 0;">
    Faz uma semana que você cancelou o Canva Viagem.
  </p>
  <p style="color: #4a4a4a; font-size: 16px; line-height: 1.7; margin: 0 0 20px 0;">
    Quero entender o que aconteceu — você pode me responder esse email?
    Qualquer feedback ajuda, e levo a sério.
  </p>
  <p style="color: #4a4a4a; font-size: 16px; line-height: 1.7; margin: 0 0 25px 0;">
    Se foi algo que podemos resolver — acesso, conteúdo, qualquer coisa —
    me fala que resolvo agora.
  </p>
  <div style="background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%); border-radius: 16px; padding: 25px; margin: 25px 0;">
    <p style="color: #1a1a2e; font-size: 15px; margin: 0; line-height: 1.6;">
      Enquanto isso — a porta está aberta.<br><br>
      Se quiser voltar, é só clicar abaixo.<br>
      <strong>Primeiro mês por R$19</strong> — exclusivo para quem já foi assinante.
    </p>
  </div>
  <p style="color: #4a4a4a; font-size: 16px; line-height: 1.7; margin: 20px 0;">
    Lucas
  </p>
`;
};

// D+21: Prova social + oferta mensal
const getWinback2Content = (name: string) => {
  const safeName = escapeHtml(name);
  return `
  <h2 style="color: #1a1a2e; margin: 0 0 20px 0; font-size: 24px;">${safeName}, o que está rolando no Canva Viagem 🔥</h2>
  <p style="color: #4a4a4a; font-size: 16px; line-height: 1.7; margin: 0 0 20px 0;">
    Desde que você saiu, chegaram novos conteúdos. Deixa eu te contar o que está em alta:
  </p>
  <div style="background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%); border-radius: 16px; padding: 25px; margin: 25px 0;">
    <p style="color: #1a1a2e; font-size: 15px; margin: 0; line-height: 1.8;">
      🎬 <strong>Novos Reels de destinos</strong> — prontos para postar no Instagram<br>
      🖼️ <strong>Artes de temporada</strong> — atualizadas para a época do ano<br>
      📱 <strong>Stories com CTA</strong> — para converter seguidores em clientes<br>
      ✍️ <strong>Legendas prontas</strong> — com copy testado que gera engajamento
    </p>
  </div>
  <p style="color: #4a4a4a; font-size: 16px; line-height: 1.7; margin: 20px 0;">
    As agências que continuam postando estão aparecendo. As que pararam, estão sumindo.
  </p>
  <p style="color: #4a4a4a; font-size: 16px; line-height: 1.7; margin: 20px 0;">
    Volte por R$29/mês — sem fidelidade, cancele quando quiser.
  </p>
  <p style="color: #4a4a4a; font-size: 16px; line-height: 1.7; margin: 20px 0;">
    Lucas
  </p>
`;
};

// D+45: Oferta anual final
const getWinback3Content = (name: string) => {
  const safeName = escapeHtml(name);
  return `
  <h2 style="color: #1a1a2e; margin: 0 0 20px 0; font-size: 24px;">Última mensagem, ${safeName} — e uma oferta especial 🎁</h2>
  <p style="color: #4a4a4a; font-size: 16px; line-height: 1.7; margin: 0 0 20px 0;">
    Faz mais de um mês que você cancelou. Esta é minha última mensagem.
  </p>
  <p style="color: #4a4a4a; font-size: 16px; line-height: 1.7; margin: 0 0 25px 0;">
    Mas antes de encerrar — quero fazer uma oferta que não faço para quem nunca foi assinante:
  </p>
  <div style="background: linear-gradient(135deg, #7D2AE8 0%, #8B3DFF 100%); border-radius: 16px; padding: 30px; margin: 25px 0; text-align: center;">
    <p style="color: #ffffff; font-size: 22px; margin: 0 0 10px 0; font-weight: bold;">
      Plano Anual por R$147
    </p>
    <p style="color: rgba(255,255,255,0.9); font-size: 16px; margin: 0 0 15px 0;">
      = R$12,25/mês — exclusivo para ex-assinantes
    </p>
    <p style="color: rgba(255,255,255,0.8); font-size: 14px; margin: 0;">
      12 meses garantidos · Válido por 72 horas
    </p>
  </div>
  <p style="color: #4a4a4a; font-size: 16px; line-height: 1.7; margin: 20px 0;">
    Depois disso, o preço volta ao normal e não repito essa oferta.
  </p>
  <p style="color: #4a4a4a; font-size: 16px; line-height: 1.7; margin: 20px 0;">
    Se não quiser voltar, tudo bem — obrigado por ter sido assinante. Espero te ver de volta um dia.
  </p>
  <p style="color: #4a4a4a; font-size: 16px; line-height: 1.7; margin: 20px 0;">
    Lucas
  </p>
`;
};

// deno-lint-ignore no-explicit-any
async function sendWinbackEmail(resend: Resend, supabase: any, user: { id: string; email: string; name: string | null }, emailNum: 1 | 2 | 3) {
  const name = user.name || user.email.split('@')[0];
  const columnMap = { 1: 'winback_1_sent_at', 2: 'winback_2_sent_at', 3: 'winback_3_sent_at' };

  let content: string;
  let subject: string;
  let ctaText: string;
  // D+45 offer uses a special checkout — for now points to standard monthly
  const ctaLink = "https://buy.stripe.com/8x26oIgGuej656zaAY8so05";

  if (emailNum === 1) {
    content = getWinback1Content(name);
    subject = "Sentimos sua falta — o que aconteceu? 💜";
    ctaText = "Voltar por R$19 no primeiro mês";
  } else if (emailNum === 2) {
    content = getWinback2Content(name);
    subject = "Veja o que chegou desde que você saiu 🔥";
    ctaText = "Voltar ao Canva Viagem — R$29/mês";
  } else {
    content = getWinback3Content(name);
    subject = "Última mensagem — oferta especial para você 🎁";
    ctaText = "Garantir Plano Anual por R$147";
  }

  const html = getEmailTemplate(content, ctaText, ctaLink);
  const result = await resend.emails.send({
    from: "Canva Viagem <lucas@rochadigitalmidia.com.br>",
    to: [user.email],
    subject,
    html,
  });

  if (result.data?.id) {
    await supabase.from("email_events").insert({
      email_id: result.data.id,
      type: "sent",
      recipient_email: user.email,
      email_type: `winback_${emailNum}`,
    });

    await supabase
      .from("winback_emails")
      .update({ [columnMap[emailNum]]: new Date().toISOString() })
      .eq("user_id", user.id);
  }

  logStep(`Winback email ${emailNum} sent`, { email: user.email });
  return result;
}

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
    const day7  = new Date(now.getTime() - 7  * 24 * 60 * 60 * 1000);
    const day21 = new Date(now.getTime() - 21 * 24 * 60 * 60 * 1000);
    const day45 = new Date(now.getTime() - 45 * 24 * 60 * 60 * 1000);

    const { data: users, error } = await supabase
      .from("winback_emails")
      .select("*")
      .eq("unsubscribed", false)
      .is("reactivated_at", null)
      .or("winback_1_sent_at.is.null,winback_2_sent_at.is.null,winback_3_sent_at.is.null");

    if (error) throw error;

    logStep("Users to process", { count: users?.length ?? 0 });

    const sent = { w1: 0, w2: 0, w3: 0, errors: 0 };

    for (const user of users ?? []) {
      const canceledAt = new Date(user.canceled_at);
      try {
        if (!user.winback_1_sent_at && canceledAt < day7) {
          await sendWinbackEmail(resend, supabase, user, 1);
          sent.w1++;
          continue;
        }
        if (!user.winback_2_sent_at && canceledAt < day21) {
          await sendWinbackEmail(resend, supabase, user, 2);
          sent.w2++;
          continue;
        }
        if (!user.winback_3_sent_at && canceledAt < day45) {
          await sendWinbackEmail(resend, supabase, user, 3);
          sent.w3++;
        }
      } catch (err) {
        logStep("Error processing user", { userId: user.user_id, error: String(err) });
        sent.errors++;
      }
    }

    logStep("Win-back completed", sent);
    return new Response(JSON.stringify({ success: true, ...sent }), {
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
