import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { Resend } from "https://esm.sh/resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[ABACATEPAY-WEBHOOK] ${step}${detailsStr}`);
};

/**
 * Verifica a assinatura do AbacatePay para garantir que o webhook é legítimo.
 */
async function verifySignature(body: string, signature: string | null, secret: string): Promise<boolean> {
  if (!signature || !secret) return false;
  
  const encoder = new TextEncoder();
  const keyBuffer = encoder.encode(secret);
  const bodyBuffer = encoder.encode(body);
  
  const key = await crypto.subtle.importKey(
    "raw",
    keyBuffer,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  
  const signatureBuffer = await crypto.subtle.sign(
    "HMAC",
    key,
    bodyBuffer
  );
  
  const hashArray = Array.from(new Uint8Array(signatureBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
  
  return hashHex === signature;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const resendKey = Deno.env.get("RESEND_API_KEY");
  const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  const webhookSecret = Deno.env.get("ABACATEPAY_WEBHOOK_SECRET");

  const resend = resendKey ? new Resend(resendKey) : null;
  const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, { 
    auth: { autoRefreshToken: false, persistSession: false } 
  });

  try {
    const rawBody = await req.text();
    const signature = req.headers.get("x-abacatepay-signature");

    logStep("Recebendo notificação", { hasSignature: !!signature });

    // Verificar segurança
    if (webhookSecret && !await verifySignature(rawBody, signature, webhookSecret)) {
      logStep("ERRO: Assinatura inválida");
      return new Response(JSON.stringify({ error: "Invalid signature" }), { status: 401 });
    }

    const payload = JSON.parse(rawBody);
    const event = payload.event; // billing.paid
    const data = payload.data;

    if (event === "billing.paid" || data?.status === "paid") {
      const email = data.customer?.email || data.metadata?.email;
      const name = data.customer?.name || data.metadata?.name || email?.split('@')[0];
      const phone = data.customer?.phone || data.metadata?.phone;
      const amount = data.amount;

      if (!email) {
        logStep("ERRO: E-mail não encontrado no payload");
        return new Response(JSON.stringify({ error: "E-mail missing" }), { status: 400 });
      }

      logStep("Processando pagamento aprovado", { email, amount });

      // 1. Garantir que o usuário existe
      const normalizedEmail = email.toLowerCase().trim();
      const { data: userData, error: getUserError } = await supabaseAdmin.auth.admin.getUserByEmail(normalizedEmail);
      if (getUserError) {
        // Se não encontrar (404 ou null user), não é erro fatal, prossiga
        console.log("[ABACATEPAY] Informação da busca:", getUserError.message);
      }
      const existingUser = userData?.user;
      let userId: string;

      if (existingUser) {
        userId = existingUser.id;
        logStep("Usuário existente encontrado", { userId });
      } else {
        const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
          email: normalizedEmail,
          email_confirm: true,
          user_metadata: { name }
        });
        if (createError) throw createError;
        userId = newUser.user.id;
        logStep("Novo usuário criado", { userId });
      }

      // 2. Atualizar Perfil
      const profileUpdate: any = {
        user_id: userId,
        email: normalizedEmail,
        name,
        updated_at: new Date().toISOString(),
      };
      if (phone) profileUpdate.phone = phone;

      await supabaseAdmin.from("profiles").upsert(profileUpdate, { onConflict: "user_id" });

      // 3. Ativar Assinatura (30 dias para PIX mensal)
      const isAnnual = amount >= 18000; // Simples check pelo valor em centavos
      const durationDays = isAnnual ? 365 : 30;
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + durationDays);

      await supabaseAdmin.from("subscriptions").upsert({
        user_id: userId,
        status: "active",
        product_id: isAnnual ? "annual_access_pix" : "monthly_access_pix",
        current_period_end: endDate.toISOString(),
        updated_at: new Date().toISOString(),
      }, { onConflict: "user_id" });

      logStep("Assinatura ativada no banco de dados");

      // 4. Enviar Link de Acesso
      if (resend) {
        const token = crypto.randomUUID();
        const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hora

        await supabaseAdmin.from("magic_link_tokens").insert({
          email: normalizedEmail,
          token,
          expires_at: expiresAt.toISOString(),
          name,
        });

        const siteUrl = Deno.env.get("SITE_URL") || "https://canvaviagem.com.br";
        const magicLink = `${siteUrl}/auth/verify?token=${token}`;

        await resend.emails.send({
          from: "Canva Viagem <lucas@rochadigitalmidia.com.br>",
          to: [normalizedEmail],
          subject: "🔐 Seu Acesso Premium - Canva Viagem",
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; background: #f9fafb; border-radius: 20px;">
              <h2 style="color: #1a1a1a;">Olá, ${name}!</h2>
              <p style="color: #4b5563; font-size: 16px;">Seu pagamento via PIX foi confirmado com sucesso! 🎉</p>
              <p style="color: #4b5563; font-size: 16px;">Clique no botão abaixo para acessar sua conta premium agora mesmo:</p>
              <a href="${magicLink}" style="background: #000; color: #fff; padding: 18px 30px; text-decoration: none; border-radius: 12px; display: inline-block; margin: 25px 0; font-weight: bold; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">ACESSAR MINHA CONTA →</a>
              <hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 20px 0;">
              <p style="color: #9ca3af; font-size: 11px;">Por segurança, este link é válido por 1 hora. Se o link expirar, você pode solicitar um novo na página de login.</p>
            </div>
          `,
        });
        logStep("E-mail de boas-vindas enviado");
      }
    }

    return new Response(JSON.stringify({ success: true }), { headers: corsHeaders, status: 200 });
  } catch (err: any) {
    logStep("ERRO no webhook", { message: err.message });
    return new Response(JSON.stringify({ error: err.message }), { headers: corsHeaders, status: 500 });
  }
});

