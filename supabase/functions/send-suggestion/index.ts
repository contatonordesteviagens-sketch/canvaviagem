import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@4.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const generateEmailTemplate = (name: string, email: string, suggestion: string) => `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Nova Sugestão - Canva Viagem</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #f5f5f5;">
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="padding: 40px 20px;">
    <tr>
      <td align="center">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="max-width: 600px; background: #ffffff; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 12px 12px 0 0;">
              <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 700;">
                💡 Nova Sugestão Recebida
              </h1>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <p style="margin: 0 0 20px; color: #333; font-size: 16px;">
                <strong>De:</strong> ${name || 'Anônimo'}
              </p>
              <p style="margin: 0 0 20px; color: #333; font-size: 16px;">
                <strong>Email:</strong> ${email}
              </p>
              <p style="margin: 0 0 10px; color: #333; font-size: 16px;">
                <strong>Sugestão:</strong>
              </p>
              <div style="background: #f8f9ff; border-left: 4px solid #667eea; padding: 20px; border-radius: 4px; margin-bottom: 20px;">
                <p style="margin: 0; color: #555; font-size: 15px; line-height: 1.6; white-space: pre-wrap;">${suggestion}</p>
              </div>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background: #f8f9ff; padding: 20px; text-align: center; border-radius: 0 0 12px 12px;">
              <p style="margin: 0; color: #999; font-size: 12px;">
                © 2025 Canva Viagem - Sistema de Sugestões
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
    const { name, email, suggestion } = await req.json();

    console.log("[SEND-SUGGESTION] Processing request:", {
      email: email ? email.substring(0, 5) + "***" : "missing",
      hasName: !!name,
      hasSuggestion: !!suggestion
    });

    // Validation: Required fields
    if (!email || !suggestion) {
      return new Response(
        JSON.stringify({ error: "Email e sugestão são obrigatórios" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validation: Email format
    const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
    if (!emailRegex.test(email)) {
      return new Response(
        JSON.stringify({ error: "Email inválido" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validation: Suggestion length (10-1000 characters)
    const cleanSuggestion = suggestion.trim();
    if (cleanSuggestion.length < 10 || cleanSuggestion.length > 1000) {
      return new Response(
        JSON.stringify({ error: "Sugestão deve ter entre 10 e 1000 caracteres" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Sanitize inputs to prevent XSS/injection
    const sanitize = (str: string) => str.replace(/[<>]/g, '');
    const safeName = name ? sanitize(name.substring(0, 100)) : '';
    const safeEmail = sanitize(email.substring(0, 255));
    const safeSuggestion = sanitize(cleanSuggestion);

    // Send email via Resend to admin
    const emailResponse = await resend.emails.send({
      from: "Canva Viagem <lucas@rochadigitalmidia.com.br>",
      to: ["agenciarochadigitalmidia@gmail.com"],
      replyTo: email,
      subject: `💡 Nova Sugestão de ${name || email}`,
      html: generateEmailTemplate(name || '', email, suggestion),
    });

    console.log("[SEND-SUGGESTION] Email sent:", JSON.stringify({
      emailId: emailResponse.data?.id,
      error: emailResponse.error
    }));

    if (emailResponse.error) {
      console.error("[SEND-SUGGESTION] Resend error:", JSON.stringify(emailResponse.error));
      return new Response(
        JSON.stringify({ error: "Erro ao enviar email" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, message: "Sugestão enviada com sucesso" }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("[SEND-SUGGESTION] Error:", error);
    return new Response(
      JSON.stringify({ error: "Erro interno do servidor" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
