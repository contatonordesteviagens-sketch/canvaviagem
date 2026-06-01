import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { Resend } from "https://esm.sh/resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[TICTO-WEBHOOK] ${step}${detailsStr}`);
};

function redactEmail(email: string | null | undefined): string {
  if (!email || typeof email !== 'string') return '[no-email]';
  const parts = email.split('@');
  if (parts.length !== 2) return '[invalid-email]';
  const redacted = parts[0].length > 2 ? parts[0].substring(0, 2) + '***' : '***';
  return `${redacted}@${parts[1]}`;
}

async function findExistingUserIdByEmail(supabase: any, email: string): Promise<string | null> {
  const { data: profileUser, error: profileError } = await supabase
    .from("profiles")
    .select("user_id")
    .eq("email", email)
    .maybeSingle();

  if (profileError) {
    logStep("WARN: profile lookup failed, falling back to auth list", { error: profileError.message });
  }

  if (profileUser?.user_id) return profileUser.user_id;

  for (let page = 1; page <= 20; page++) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: 1000 });
    if (error) {
      logStep("WARN: auth listUsers fallback failed", { error: error.message });
      return null;
    }

    const matchedUser = data?.users?.find((user: any) => user.email?.toLowerCase().trim() === email);
    if (matchedUser?.id) return matchedUser.id;
    if (!data?.users || data.users.length < 1000) break;
  }

  return null;
}

// ZAIA WEBHOOK HELPER
async function triggerZaiaWebhook(webhookEnvVar: string, data: { email: string; name?: string; phone?: string; magic_link?: string }) {
  const webhookUrl = Deno.env.get(webhookEnvVar);
  if (!webhookUrl) {
    logStep(`ZAIA webhook not configured: ${webhookEnvVar}`);
    return;
  }
  try {
    const payload: any = {
      email: data.email,
      name: data.name || data.email.split("@")[0],
      timestamp: new Date().toISOString(),
    };
    if (data.phone) payload.phone = data.phone;
    if (data.magic_link) payload.magic_link = data.magic_link;

    await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    logStep(`ZAIA webhook triggered: ${webhookEnvVar}`);
  } catch (error) {
    logStep(`ERROR triggering ZAIA webhook: ${webhookEnvVar}`, { error: String(error) });
  }
}

// SHARED ONBOARDING LOGIC
async function ensureUserAndOnboarding(
  supabase: any,
  resend: any,
  email: string,
  name: string | undefined,
  stripeCustomerId: string,
  stripeSubscriptionId: string,
  phone: string | null,
  productId?: string
) {
  const normalizedEmail = email.toLowerCase().trim();
  logStep("Starting onboarding for", { email: redactEmail(normalizedEmail), productId });

  const existingUserId = await findExistingUserIdByEmail(supabase, normalizedEmail);
  let userId: string;

  if (existingUserId) {
    logStep("Existing user found", { userId: existingUserId });
    userId = existingUserId;
  } else {
    const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
      email: normalizedEmail,
      email_confirm: true,
    });
    
    if (createError) {
      if (createError.message?.includes("registered") || createError.message?.includes("exists")) {
        const retryUserId = await findExistingUserIdByEmail(supabase, normalizedEmail);
        if (retryUserId) {
          logStep("User found on retry after creation conflict", { userId: retryUserId });
          userId = retryUserId;
        } else {
          logStep("ERROR: Conflict reported but user still not found on retry", { error: createError.message });
          return;
        }
      } else {
        logStep("ERROR: Failed to create user", { error: createError.message });
        return;
      }
    } else {
      userId = newUser.user.id;
      logStep("New user created", { userId });
    }
  }

  // 2. Upsert Profile
  const profileData: any = {
    user_id: userId,
    email: normalizedEmail,
    name: name || normalizedEmail.split('@')[0],
    stripe_customer_id: stripeCustomerId,
    updated_at: new Date().toISOString(),
  };
  if (phone) profileData.phone = phone;

  const { error: profileError } = await supabase.from("profiles").upsert(profileData, { onConflict: "user_id" });
  if (profileError) logStep("ERROR: Failed to upsert profile", { error: profileError.message });

  // 3. Upsert Subscription
  const { error: subError } = await supabase.from("subscriptions").upsert({
    user_id: userId,
    stripe_customer_id: stripeCustomerId,
    stripe_subscription_id: stripeSubscriptionId,
    status: "active",
    product_id: productId || "monthly_access_ticto",
    updated_at: new Date().toISOString(),
  }, { onConflict: "user_id" });

  if (subError) logStep("ERROR: Failed to upsert subscription", { error: subError.message });

  // 4. Generate Magic Link Token
  const siteUrl = Deno.env.get("SITE_URL") || "https://canvaviagem.lovable.app";
  const token = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
  let magicLink: string | undefined = undefined;

  const { error: tokenError } = await supabase.from("magic_link_tokens").insert({
    email: normalizedEmail,
    token,
    expires_at: expiresAt.toISOString(),
    name: name,
    phone: phone,
  });

  if (tokenError) {
    logStep("ERROR: Failed to create magic link token", { error: tokenError.message });
  } else {
    magicLink = `${siteUrl}/auth/verify?token=${token}`;
    logStep("Magic link token created successfully", { email: redactEmail(normalizedEmail) });
  }

  // 5. Send emails via Resend if available
  if (resend && magicLink) {
    await sendAutoMagicLinkEmail(supabase, resend, normalizedEmail, magicLink, token, name || "Visitante");
    await sendWelcomeEmail(supabase, resend, normalizedEmail, productId);
  }

  // 6. Trigger Zaia Welcome
  await triggerZaiaWebhook("ZAIA_WEBHOOK_WELCOME", {
    email: normalizedEmail,
    name: name,
    phone: phone || undefined,
    magic_link: magicLink,
  });
}

async function sendAutoMagicLinkEmail(supabase: any, resend: any, email: string, magicLink: string, token: string, customerName: string) {
  try {
    const emailResponse = await resend.emails.send({
      from: Deno.env.get("RESEND_FROM_EMAIL") || "Canva Viagem <lucas@rochadigitalmidia.com.br>",
      to: [email],
      subject: "🔐 Seu Link de Acesso - Canva Viagem",
      html: `
        <!DOCTYPE html>
        <html lang="pt-BR">
        <head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Seu Link de Acesso</title></head>
        <body style="margin: 0; padding: 0; font-family: sans-serif; background: #667eea;">
          <div style="background: white; max-width: 600px; margin: 40px auto; padding: 20px; text-align: center; border-radius: 10px;">
             <h1>Olá, ${customerName}!</h1>
             <p>Seu pagamento foi confirmado! Clique abaixo para acessar:</p>
             <a href="${magicLink}" style="background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">Acessar Minha Conta</a>
              <p style="margin-top: 20px; font-size: 12px; color: #888;">Link expira em 24 horas.</p>
          </div>
        </body>
        </html>
      `,
    });
    if (emailResponse?.error) {
      logStep("ERROR: Resend rejected auto magic link email", { email: redactEmail(email), error: emailResponse.error });
      await supabase.from("email_events").insert({
        email_id: token,
        type: "failed",
        email_type: "magic_link_auto",
        recipient_email: email,
        metadata: { token_id: token, provider_error: emailResponse.error },
      });
      return;
    }
    await supabase.from("email_events").insert({
      email_id: emailResponse?.data?.id || token,
      type: "sent",
      email_type: "magic_link_auto",
      recipient_email: email,
      metadata: { token_id: token },
    });
    logStep("Auto magic link email sent", { email: redactEmail(email), emailId: emailResponse?.data?.id });
  } catch (error: any) {
    logStep("ERROR: Failed to send auto magic link email", { error: error.message });
  }
}

async function sendWelcomeEmail(supabase: any, resend: any, email: string, productId?: string) {
  const appUrl = Deno.env.get("APP_URL") || "https://canvaviagem.com";
  const planName = "Acesso Premium Ticto 👑";
  const ctaUrl = `${appUrl}/fabrica`;
  const ctaLabel = "🚀 Acessar a Fábrica";
  const extras = `<li><strong>🏭 Fábrica de Anúncios IA</strong> (Premium)</li>
       <li><strong>🌐 Criador de Sites de Viagem</strong> (Premium)</li>
       <li>Vídeos Reels Virais</li>
       <li>Robôs de IA</li>
       <li>Templates Editáveis</li>`;
  try {
    const emailResponse = await resend.emails.send({
      from: Deno.env.get("RESEND_FROM_EMAIL") || "Canva Viagem <lucas@rochadigitalmidia.com.br>",
      to: [email],
      subject: `🚀 Bem-vindo ao Canva Viagem`,
      html: `
        <!DOCTYPE html>
        <html><body>
          <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px;">
             <h1>Bem-vindo ao Canva Viagem! 🌴</h1>
             <p>Sua assinatura do <strong>${planName}</strong> está ativa.</p>
             <p>Você agora tem acesso a:</p>
             <ul>${extras}</ul>
             <p style="margin-top:24px"><a href="${ctaUrl}" style="background:#0ea5e9;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold">${ctaLabel}</a></p>
          </div>
        </body></html>
      `,
    });
    if (emailResponse?.error) {
      logStep("ERROR welcome email", { email: redactEmail(email), error: emailResponse.error });
      await supabase.from("email_events").insert({
        email_id: `${email}-welcome-${Date.now()}`,
        type: "failed",
        email_type: "welcome_ticto",
        recipient_email: email,
        metadata: { product_id: productId, provider_error: emailResponse.error },
      });
      return;
    }
    await supabase.from("email_events").insert({
      email_id: emailResponse?.data?.id || `${email}-welcome-${Date.now()}`,
      type: "sent",
      email_type: "welcome_ticto",
      recipient_email: email,
      metadata: { product_id: productId },
    });
    logStep("Welcome email sent", { email: redactEmail(email), productId, emailId: emailResponse?.data?.id });
  } catch (error: any) { logStep("ERROR welcome email", { error: error.message }); }
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const resendKey = Deno.env.get("RESEND_API_KEY") || Deno.env.get("resend");
  const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  const tictoSecretToken = Deno.env.get("TICTO_WEBHOOK_SECRET_TOKEN");

  const resend = resendKey ? new Resend(resendKey) : null;
  const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, { auth: { autoRefreshToken: false, persistSession: false } });

  try {
    const rawBody = await req.text();
    const payload = JSON.parse(rawBody);
    
    logStep("Event received", { event: payload.event, status: payload.data?.status });

    // Se houver um token configurado nas variáveis de ambiente do Supabase, valide o header de segurança da Ticto
    const authorizationHeader = req.headers.get("authorization") || req.headers.get("x-ticto-token");
    if (tictoSecretToken && authorizationHeader !== tictoSecretToken) {
      logStep("ERROR: Unauthorized access request", { receivedToken: authorizationHeader });
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: corsHeaders });
    }

    // Ticto V2 events: Geralmente "sale_approved", "subscription_active", ou payload.data.status === "approved"
    const isApproved = payload.event === "sale_approved" || 
                       payload.event === "order_completed" ||
                       payload.data?.status === "approved" ||
                       payload.data?.status === "paid" ||
                       payload.data?.status === "complete";

    if (isApproved) {
      const email = payload.data?.customer?.email || payload.data?.email;
      const name = payload.data?.customer?.name || payload.data?.name || email?.split("@")[0];
      const phone = payload.data?.customer?.phone || payload.data?.phone ? String(payload.data?.customer?.phone || payload.data?.phone).replace(/\D/g, '') : null;
      
      const transactionId = payload.data?.transaction_id || payload.data?.id || `ticto-${Date.now()}`;
      const rawProductId = payload.data?.product?.id ? String(payload.data?.product?.id) : undefined;
      const productName = payload.data?.product?.name || "Canva Viagem Premium";

      // Map product_id to Start or Elite based on the product name
      let productId = rawProductId || "monthly_access_ticto";
      if (productName.toLowerCase().includes("start")) {
        productId = "start_ticto";
      } else if (productName.toLowerCase().includes("elite")) {
        productId = "elite_ticto";
      }

      if (email) {
        logStep("Processing approved payment onboarding", { email: redactEmail(email), transactionId, productId });
        
        // Ativar assinatura/criar usuário usando a lógica reutilizável
        // Para a Ticto, usamos o prefixo tic_ para o stripeCustomerId e stripeSubscriptionId dummy
        const customerIdDummy = `tic_cust_${email}`;
        const subscriptionIdDummy = `tic_sub_${transactionId}`;
        
        await ensureUserAndOnboarding(
          supabaseAdmin, 
          resend, 
          email, 
          name, 
          customerIdDummy, 
          subscriptionIdDummy, 
          phone, 
          productId || "monthly_access_ticto"
        );

        // Opcionalmente salvar na tabela de vendas
        try {
          const { error: salesErr } = await supabaseAdmin
            .from("hotmart_sales") // Reutilizando a estrutura de vendas genérica ou salvando para referência
            .upsert({
              h_transaction: transactionId,
              h_email: email,
              h_product_id: productId || "monthly_access_ticto",
              h_product_name: productName,
              h_status: "APPROVED",
              h_buyer_name: name,
            }, { onConflict: "h_transaction" });
          if (salesErr) logStep("WARN: Failed to save sale record in hotmart_sales", { error: salesErr.message });
        } catch (e: any) {
          logStep("WARN: Error writing sale record", { error: e.message });
        }

      } else {
        logStep("WARN: Email not found in payload data");
      }
    }

    return new Response(JSON.stringify({ received: true }), { headers: corsHeaders, status: 200 });
  } catch (err: any) {
    logStep("ERROR in ticto-webhook", { message: err.message });
    return new Response(JSON.stringify({ error: err.message }), { headers: corsHeaders, status: 500 });
  }
});
