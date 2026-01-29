import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";
import { Resend } from "https://esm.sh/resend@4.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const generateEmailTemplate = (magicLink: string) => `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Seu Link de Acesso - Canva Viagem</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); min-height: 100vh;">
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="padding: 40px 20px;">
    <tr>
      <td align="center">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="max-width: 600px; background: #ffffff; border-radius: 20px; box-shadow: 0 20px 60px rgba(0,0,0,0.2); overflow: hidden;">
          
          <!-- Header com gradiente -->
          <tr>
            <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 40px 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">
                ✈️ Canva Viagem
              </h1>
              <p style="margin: 10px 0 0; color: rgba(255,255,255,0.9); font-size: 14px;">
                Templates profissionais para agências de viagens
              </p>
            </td>
          </tr>
          
          <!-- Conteúdo principal -->
          <tr>
            <td style="padding: 50px 40px;">
              <h2 style="margin: 0 0 20px; color: #1a1a2e; font-size: 24px; font-weight: 600; text-align: center;">
                Seu Link de Acesso 🔐
              </h2>
              
              <p style="margin: 0 0 30px; color: #4a4a68; font-size: 16px; line-height: 1.6; text-align: center;">
                Você solicitou acesso à sua conta. Clique no botão abaixo para entrar:
              </p>
              
              <!-- Botão CTA -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                <tr>
                  <td align="center" style="padding: 10px 0 30px;">
                    <a href="${magicLink}" target="_blank" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; padding: 18px 50px; border-radius: 50px; font-size: 16px; font-weight: 600; box-shadow: 0 10px 30px rgba(102,126,234,0.4); transition: all 0.3s ease;">
                      Acessar Minha Conta →
                    </a>
                  </td>
                </tr>
              </table>
              
              <!-- Info box -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background: #f8f9ff; border-radius: 12px; margin-top: 20px;">
                <tr>
                  <td style="padding: 20px;">
                    <p style="margin: 0; color: #667eea; font-size: 14px; text-align: center;">
                      ⏱️ Este link expira em <strong>1 hora</strong>
                    </p>
                  </td>
                </tr>
              </table>
              
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background: #f8f9ff; padding: 30px 40px; text-align: center; border-top: 1px solid #eee;">
              <p style="margin: 0 0 10px; color: #9999b3; font-size: 12px;">
                Se você não solicitou este acesso, ignore este email.
              </p>
              <p style="margin: 0; color: #b3b3cc; font-size: 11px;">
                © 2025 Canva Viagem. Todos os direitos reservados.
              </p>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, name, phone } = await req.json();

    console.log("[MAGIC-LINK] Processing request:", { 
      email: email ? email.substring(0, 5) + "***" : "missing",
      hasName: !!name,
      hasPhone: !!phone 
    });

    if (!email || typeof email !== "string") {
      return new Response(
        JSON.stringify({ error: "Email é obrigatório" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validar formato do email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return new Response(
        JSON.stringify({ error: "Formato de email inválido" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Criar cliente Supabase com service role
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Rate limiting: Check if email has too many recent requests (max 3 per 15 minutes)
    const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000).toISOString();
    const normalizedEmail = email.toLowerCase().trim();
    
    const { data: recentTokens, error: rateCheckError } = await supabaseAdmin
      .from("magic_link_tokens")
      .select("created_at")
      .eq("email", normalizedEmail)
      .gte("created_at", fifteenMinutesAgo);

    if (!rateCheckError && recentTokens && recentTokens.length >= 3) {
      console.log("[MAGIC-LINK] Rate limit exceeded for:", normalizedEmail.substring(0, 5) + "***");
      return new Response(
        JSON.stringify({ error: "Muitas solicitações. Aguarde alguns minutos e tente novamente." }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Gerar token único
    const token = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hora

    // Clean phone if provided
    const cleanPhone = phone ? phone.replace(/\D/g, '') : null;

    // Salvar token no banco com nome e telefone
    const { error: insertError } = await supabaseAdmin
      .from("magic_link_tokens")
      .insert({
        email: email.toLowerCase().trim(),
        token,
        expires_at: expiresAt.toISOString(),
        name: name?.trim() || null,
        phone: cleanPhone,
      });

    if (insertError) {
      console.error("Error inserting token:", insertError);
      return new Response(
        JSON.stringify({ error: "Erro ao processar solicitação" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Criar link de verificação
    const baseUrl = Deno.env.get("SITE_URL") || "https://canvaviagem.lovable.app";
    console.log("[MAGIC-LINK] Using base URL:", baseUrl);
    const magicLink = `${baseUrl}/auth/verify?token=${token}`;
    console.log("[MAGIC-LINK] Magic link generated successfully");

    // Enviar email via Resend
    const emailResponse = await resend.emails.send({
      from: "Canva Viagem <lucas@rochadigitalmidia.com.br>",
      to: [email],
      subject: "🔐 Seu Link de Acesso - Canva Viagem",
      html: generateEmailTemplate(magicLink),
    });

    console.log("[MAGIC-LINK] Email sent:", JSON.stringify({ 
      email, 
      emailId: emailResponse.data?.id,
      error: emailResponse.error 
    }));

    // Verificar se o Resend retornou erro
    if (emailResponse.error) {
      console.error("[MAGIC-LINK] Resend error details:", JSON.stringify(emailResponse.error));
      return new Response(
        JSON.stringify({ error: "Erro ao enviar email. Tente novamente." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Registrar evento de email enviado
    await supabaseAdmin
      .from("email_events")
      .insert({
        email_id: emailResponse.data?.id || token,
        type: "sent",
        email_type: "magic_link",
        recipient_email: email,
        metadata: { token_id: token }
      });

    return new Response(
      JSON.stringify({ success: true, message: "Link enviado com sucesso" }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in send-magic-link:", error);
    return new Response(
      JSON.stringify({ error: "Erro interno do servidor" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
