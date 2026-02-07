import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { Resend } from "https://esm.sh/resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[STRIPE-WEBHOOK] ${step}${detailsStr}`);
};

// Redact email for logging
function redactEmail(email: string | null | undefined): string {
  if (!email || typeof email !== 'string') return '[no-email]';
  const parts = email.split('@');
  if (parts.length !== 2) return '[invalid-email]';
  const redacted = parts[0].length > 2 ? parts[0].substring(0, 2) + '***' : '***';
  return `${redacted}@${parts[1]}`;
}

const GENERIC_ERRORS = {
  badRequest: "Bad request",
  serviceError: "Service temporarily unavailable",
  configError: "Service configuration error",
};

function isValidEmail(email: string | null | undefined): email is string {
  if (!email || typeof email !== 'string') return false;
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email) && email.length <= 254;
}

// ZAIA WEBHOOK HELPER
async function triggerZaiaWebhook(webhookEnvVar: string, data: { email: string; name?: string; phone?: string }) {
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
  phone: string | null
) {
  logStep("Starting onboarding for", { email: redactEmail(email) });

  // 1. Check/Create User
  const { data: existingUsers } = await supabase.auth.admin.listUsers();
  const existingUser = existingUsers?.users?.find((u: any) => u.email === email);
  let userId: string;

  if (existingUser) {
    logStep("Existing user found", { userId: existingUser.id });
    userId = existingUser.id;
  } else {
    const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
      email,
      email_confirm: true,
    });
    if (createError) {
      logStep("ERROR: Failed to create user", { error: createError.message });
      return;
    }
    userId = newUser.user.id;
    logStep("New user created", { userId });
  }

  // 2. Upsert Profile
  const profileData: any = {
    user_id: userId,
    email,
    name: name || email.split('@')[0],
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
    product_id: "prod_TkvaozfpkAcbpM",
    updated_at: new Date().toISOString(),
  }, { onConflict: "user_id" });

  if (subError) logStep("ERROR: Failed to upsert subscription", { error: subError.message });

  // 4. Send Magic Link & Welcome Email
  if (resend) {
    const siteUrl = Deno.env.get("SITE_URL") || "https://canvaviagem.lovable.app";
    const token = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    const { error: tokenError } = await supabase.from("magic_link_tokens").insert({
      email: email.toLowerCase().trim(),
      token,
      expires_at: expiresAt.toISOString(),
      name: name,
      phone: phone,
    });

    if (tokenError) {
      logStep("ERROR: Failed to create magic link token", { error: tokenError.message });
    } else {
      const magicLink = `${siteUrl}/auth/verify?token=${token}`;
      await sendAutoMagicLinkEmail(resend, email, magicLink, name || "Visitante");
      logStep("Magic link sent automatically", { email: redactEmail(email) });
    }

    await sendWelcomeEmail(resend, email);
  }

  // 5. Trigger Zaia Welcome
  await triggerZaiaWebhook("ZAIA_WEBHOOK_WELCOME", {
    email,
    name: name,
    phone: phone || undefined
  });
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
  const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
  const resendKey = Deno.env.get("RESEND_API_KEY") || Deno.env.get("resend");
  const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

  if (!stripeKey || !webhookSecret) {
    return new Response(JSON.stringify({ error: GENERIC_ERRORS.configError }), { status: 500, headers: corsHeaders });
  }

  const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
  const resend = resendKey ? new Resend(resendKey) : null;
  const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, { auth: { autoRefreshToken: false, persistSession: false } });

  try {
    const body = await req.text();
    const signature = req.headers.get("stripe-signature");
    if (!signature) throw new Error("No signature");

    const event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret);
    logStep("Event received", { type: event.type, id: event.id });

    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutCompleted(event.data.object, supabaseAdmin, resend);
        break;
      case "customer.subscription.created":
        await handleSubscriptionCreated(event.data.object, supabaseAdmin);
        break;
      case "customer.subscription.updated":
        await handleSubscriptionUpdated(event.data.object, supabaseAdmin);
        break;
      case "customer.subscription.deleted":
        await handleSubscriptionDeleted(event.data.object, supabaseAdmin, resend);
        break;
      case "invoice.payment_succeeded":
        await handlePaymentSucceeded(event.data.object, supabaseAdmin, resend);
        break;
      case "invoice.payment_failed":
        await handlePaymentFailed(event.data.object, supabaseAdmin, resend);
        break;
      case "checkout.session.expired":
        await handleCheckoutExpired(event.data.object, supabaseAdmin, resend);
        break;
      default:
        logStep("Unhandled event type", { type: event.type });
    }

    return new Response(JSON.stringify({ received: true }), { headers: corsHeaders, status: 200 });
  } catch (err: any) {
    logStep("ERROR in stripe-webhook", { message: err.message });
    return new Response(JSON.stringify({ error: GENERIC_ERRORS.serviceError }), { headers: corsHeaders, status: 500 });
  }
});

async function handleCheckoutCompleted(session: Stripe.Checkout.Session, supabase: any, resend: any) {
  logStep("Processing checkout.session.completed", { sessionId: session.id });
  const email = session.customer_email || session.customer_details?.email;
  if (!isValidEmail(email)) return;

  const customerName = session.customer_details?.name || email.split("@")[0];
  const customerPhone = session.customer_details?.phone ? session.customer_details.phone.replace(/\D/g, '') : null;
  const stripeCustomerId = session.customer as string;
  const stripeSubscriptionId = session.subscription as string;

  await ensureUserAndOnboarding(supabase, resend, email, customerName, stripeCustomerId, stripeSubscriptionId, customerPhone);
}

async function handleSubscriptionCreated(subscription: Stripe.Subscription, supabase: any) {
  // Only needed if we want to track 'incomplete' subs
  logStep("Processing customer.subscription.created", { subscriptionId: subscription.id });
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription, supabase: any) {
  logStep("Processing customer.subscription.updated", { subscriptionId: subscription.id });
  const stripeCustomerId = subscription.customer as string;
  const { error } = await supabase.from("subscriptions").update({
    status: subscription.status === "active" || subscription.status === "trialing" ? "active" : subscription.status,
    current_period_end: subscription.current_period_end ? new Date(subscription.current_period_end * 1000).toISOString() : null,
    updated_at: new Date().toISOString(),
  }).eq("stripe_customer_id", stripeCustomerId);
  if (error) logStep("ERROR updating subscription", { error: error.message });
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription, supabase: any, resend: any) {
  const stripeCustomerId = subscription.customer as string;
  const { data: profile } = await supabase.from("profiles").select("email, name").eq("stripe_customer_id", stripeCustomerId).single();
  await supabase.from("subscriptions").update({ status: "canceled", updated_at: new Date().toISOString() }).eq("stripe_customer_id", stripeCustomerId);
  if (resend && profile?.email) await sendCancellationEmail(resend, profile.email);
  if (profile?.email) await triggerZaiaWebhook("ZAIA_WEBHOOK_CANCELLATION", { email: profile.email, name: profile.name });
}

async function handlePaymentSucceeded(invoice: Stripe.Invoice, supabase: any, resend: any) {
  logStep("Processing invoice.payment_succeeded", { invoiceId: invoice.id });
  const stripeCustomerId = invoice.customer as string;

  // Check if this is the first payment (Subscription Creation)
  if (invoice.billing_reason === 'subscription_create') {
    const email = invoice.customer_email || invoice.customer_name; // Fallback? invoice.customer_email should be set.
    if (isValidEmail(email)) {
      const customerName = invoice.customer_name || email.split("@")[0];
      const subscriptionId = invoice.subscription as string;
      // NOTE: Invoice doesn't have phone. 
      await ensureUserAndOnboarding(supabase, resend, email, customerName, stripeCustomerId, subscriptionId, null);
      return; // ensureUserAndOnboarding also upserts subscription, so we can return or continue. 
      // But standard logic below updates status too. It's fine to duplicate update.
    } else {
      logStep("No email in invoice for subscription_create", { invoiceId: invoice.id });
    }
  }

  const { error } = await supabase.from("subscriptions").update({
    status: "active",
    updated_at: new Date().toISOString(),
  }).eq("stripe_customer_id", stripeCustomerId);
  if (error) logStep("ERROR reactivating subscription", { error: error.message });
}

async function handlePaymentFailed(invoice: Stripe.Invoice, supabase: any, resend: any) {
  const stripeCustomerId = invoice.customer as string;
  const { data: profile } = await supabase.from("profiles").select("email, name").eq("stripe_customer_id", stripeCustomerId).single();
  await supabase.from("subscriptions").update({ status: "past_due", updated_at: new Date().toISOString() }).eq("stripe_customer_id", stripeCustomerId);
  if (resend && profile?.email) await sendPaymentFailedEmail(resend, profile.email);
  if (profile?.email) await triggerZaiaWebhook("ZAIA_WEBHOOK_PAYMENT_FAILED", { email: profile.email, name: profile.name });
}

async function handleCheckoutExpired(session: Stripe.Checkout.Session, supabase: any, resend: any) {
  const email = session.customer_details?.email || session.customer_email;
  if (!isValidEmail(email)) return;
  await supabase.from("abandoned_checkouts").insert({ email, session_id: session.id, amount: session.amount_total });
  if (resend) await sendRecoveryEmail(resend, email);
  await triggerZaiaWebhook("ZAIA_WEBHOOK_RECOVERY", { email });
}

// EMAIL TEMPLATES (Restored)
async function sendAutoMagicLinkEmail(resend: any, email: string, magicLink: string, customerName: string) {
  try {
    await resend.emails.send({
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
             <p style="margin-top: 20px; font-size: 12px; color: #888;">Link expira em 1 hora.</p>
          </div>
        </body>
        </html>
      `,
    });
    logStep("Auto magic link email sent", { email: redactEmail(email) });
  } catch (error: any) {
    logStep("ERROR: Failed to send auto magic link email", { error: error.message });
  }
}

async function sendWelcomeEmail(resend: any, email: string) {
  const appUrl = Deno.env.get("APP_URL") || "https://canvatrip.lovable.app";
  try {
    await resend.emails.send({
      from: Deno.env.get("RESEND_FROM_EMAIL") || "Canva Viagem <lucas@rochadigitalmidia.com.br>",
      to: [email],
      subject: "🚀 Bem-vindo ao Canva Viagens!",
      html: `
        <!DOCTYPE html>
        <html><body>
          <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px;">
             <h1>Bem-vindo ao Canva Viagens! 🌴</h1>
             <p>Você agora tem acesso a:</p>
             <ul>
               <li>Vídeos Reels Virais</li>
               <li>Robôs de IA</li>
               <li>Templates Editáveis</li>
             </ul>
             <p>Acesse agora: <a href="${appUrl}/planos">${appUrl}</a></p>
          </div>
        </body></html>
      `,
    });
  } catch (error: any) { logStep("ERROR welcome email", { error: error.message }); }
}

async function sendCancellationEmail(resend: any, email: string) {
  const appUrl = Deno.env.get("APP_URL") || "https://canvatrip.lovable.app";
  try {
    await resend.emails.send({
      from: Deno.env.get("RESEND_FROM_EMAIL") || "Canva Viagem <lucas@rochadigitalmidia.com.br>",
      to: [email],
      subject: "💔 Sentiremos sua falta",
      html: `<html><body><h1>Sua assinatura foi cancelada.</h1><p>Esperamos te ver em breve.</p><a href="${appUrl}/planos">Reativar</a></body></html>`
    });
  } catch (e: any) { logStep("ERROR cancel email", { error: e.message }); }
}

async function sendPaymentFailedEmail(resend: any, email: string) {
  const appUrl = Deno.env.get("APP_URL") || "https://canvatrip.lovable.app";
  try {
    await resend.emails.send({
      from: Deno.env.get("RESEND_FROM_EMAIL") || "Canva Viagem <lucas@rochadigitalmidia.com.br>",
      to: [email],
      subject: "🔴 Pagamento Falhou",
      html: `<html><body><h1>O pagamento falhou 😢</h1><p>Atualize seu cartão para evitar bloqueio.</p><a href="${appUrl}/planos">Atualizar Cartão</a></body></html>`
    });
  } catch (e: any) { logStep("ERROR fail email", { error: e.message }); }
}

async function sendRecoveryEmail(resend: any, email: string) {
  const checkoutUrl = "https://buy.stripe.com/8x26oIgGuej656zaAY8so05";
  try {
    await resend.emails.send({
      from: Deno.env.get("RESEND_FROM_EMAIL") || "Canva Viagem <lucas@rochadigitalmidia.com.br>",
      to: [email],
      subject: "🛒 Você esqueceu algo...",
      html: `<html><body><h1>Você esqueceu algo...</h1><p>Finalize sua compra do Canva Viagens.</p><a href="${checkoutUrl}">Finalizar Compra</a></body></html>`
    });
  } catch (e: any) { logStep("ERROR recovery email", { error: e.message }); }
}
