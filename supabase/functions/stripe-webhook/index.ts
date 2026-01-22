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

// Generic error messages for clients (security best practice)
const GENERIC_ERRORS = {
  badRequest: "Bad request",
  serviceError: "Service temporarily unavailable",
  configError: "Service configuration error",
};

// Email validation helper function
function isValidEmail(email: string | null | undefined): email is string {
  if (!email || typeof email !== 'string') return false;
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email) && email.length <= 254;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
  const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
  // Modificado para aceitar maiúsculo ou minúsculo
  const resendKey = Deno.env.get("RESEND_API_KEY") || Deno.env.get("resend");
  const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

  if (!stripeKey) {
    logStep("ERROR: STRIPE_SECRET_KEY not configured");
    return new Response(JSON.stringify({ error: GENERIC_ERRORS.configError }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }

  if (!webhookSecret) {
    logStep("ERROR: STRIPE_WEBHOOK_SECRET not configured");
    return new Response(JSON.stringify({ error: GENERIC_ERRORS.configError }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }

  const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
  const resend = resendKey ? new Resend(resendKey) : null;
  const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  try {
    const body = await req.text();
    const signature = req.headers.get("stripe-signature");

    if (!signature) {
      logStep("ERROR: No stripe-signature header");
      return new Response(JSON.stringify({ error: GENERIC_ERRORS.badRequest }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    let event: Stripe.Event;
    try {
      event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret);
    } catch (err: unknown) {
      logStep("ERROR: Webhook signature verification failed", { error: err instanceof Error ? err.message : String(err) });
      return new Response(JSON.stringify({ error: GENERIC_ERRORS.badRequest }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

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
        await handlePaymentSucceeded(event.data.object, supabaseAdmin);
        break;

      case "invoice.payment_failed":
        await handlePaymentFailed(event.data.object, supabaseAdmin, resend);
        break;

      default:
        logStep("Unhandled event type", { type: event.type });
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in stripe-webhook", { message: errorMessage });
    return new Response(JSON.stringify({ error: GENERIC_ERRORS.serviceError }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});

async function handleCheckoutCompleted(session: Stripe.Checkout.Session, supabase: any, resend: any) {
  logStep("Processing checkout.session.completed", { sessionId: session.id });

  const rawEmail = session.customer_email || session.customer_details?.email;
  
  // Validate email format before processing
  if (!isValidEmail(rawEmail)) {
    logStep("ERROR: Invalid or missing email in session", { rawEmail: rawEmail ? "[REDACTED]" : "null" });
    return;
  }
  
  const email = rawEmail;

  const stripeCustomerId = session.customer as string;
  const stripeSubscriptionId = session.subscription as string;

  logStep("Checkout details", { email, stripeCustomerId, stripeSubscriptionId });

  // Check if user already exists
  const { data: existingUsers } = await supabase.auth.admin.listUsers();
  const existingUser = existingUsers?.users?.find((u: any) => u.email === email);

  let userId: string;

  if (existingUser) {
    logStep("Existing user found", { userId: existingUser.id });
    userId = existingUser.id;
  } else {
    // Create new user with email
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

  // Update or create profile
  const { error: profileError } = await supabase
    .from("profiles")
    .upsert({
      user_id: userId,
      email,
      stripe_customer_id: stripeCustomerId,
      updated_at: new Date().toISOString(),
    }, {
      onConflict: "user_id",
    });

  if (profileError) {
    logStep("ERROR: Failed to upsert profile", { error: profileError.message });
  }

  // Create or update subscription
  const { error: subError } = await supabase
    .from("subscriptions")
    .upsert({
      user_id: userId,
      stripe_customer_id: stripeCustomerId,
      stripe_subscription_id: stripeSubscriptionId,
      status: "active",
      product_id: "prod_TkvaozfpkAcbpM",
      updated_at: new Date().toISOString(),
    }, {
      onConflict: "user_id",
    });

  if (subError) {
    logStep("ERROR: Failed to upsert subscription", { error: subError.message });
  }

  logStep("User and subscription created/updated successfully");

  // Send welcome email
  if (resend) {
    await sendWelcomeEmail(resend, email);
  }
}

async function handleSubscriptionCreated(subscription: Stripe.Subscription, supabase: any) {
  logStep("Processing customer.subscription.created", { subscriptionId: subscription.id });
  // Already handled in checkout.session.completed
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription, supabase: any) {
  logStep("Processing customer.subscription.updated", { subscriptionId: subscription.id, status: subscription.status });

  const stripeCustomerId = subscription.customer as string;
  const status = subscription.status;

  const { error } = await supabase
    .from("subscriptions")
    .update({
      status: status === "active" || status === "trialing" ? "active" : status,
      current_period_end: subscription.current_period_end 
        ? new Date(subscription.current_period_end * 1000).toISOString() 
        : null,
      updated_at: new Date().toISOString(),
    })
    .eq("stripe_customer_id", stripeCustomerId);

  if (error) {
    logStep("ERROR: Failed to update subscription", { error: error.message });
  } else {
    logStep("Subscription updated successfully");
  }
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription, supabase: any, resend: any) {
  logStep("Processing customer.subscription.deleted", { subscriptionId: subscription.id });

  const stripeCustomerId = subscription.customer as string;

  // Get user email for notification
  const { data: profile } = await supabase
    .from("profiles")
    .select("email")
    .eq("stripe_customer_id", stripeCustomerId)
    .single();

  const { error } = await supabase
    .from("subscriptions")
    .update({
      status: "canceled",
      updated_at: new Date().toISOString(),
    })
    .eq("stripe_customer_id", stripeCustomerId);

  if (error) {
    logStep("ERROR: Failed to update subscription to canceled", { error: error.message });
  } else {
    logStep("Subscription marked as canceled");
  }

  // Send cancellation email
  if (resend && profile?.email) {
    await sendCancellationEmail(resend, profile.email);
  }
}

async function handlePaymentSucceeded(invoice: Stripe.Invoice, supabase: any) {
  logStep("Processing invoice.payment_succeeded", { invoiceId: invoice.id });

  const stripeCustomerId = invoice.customer as string;

  const { error } = await supabase
    .from("subscriptions")
    .update({
      status: "active",
      updated_at: new Date().toISOString(),
    })
    .eq("stripe_customer_id", stripeCustomerId);

  if (error) {
    logStep("ERROR: Failed to reactivate subscription", { error: error.message });
  } else {
    logStep("Subscription reactivated after successful payment");
  }
}

async function handlePaymentFailed(invoice: Stripe.Invoice, supabase: any, resend: any) {
  logStep("Processing invoice.payment_failed", { invoiceId: invoice.id });

  const stripeCustomerId = invoice.customer as string;

  // Get user email for notification
  const { data: profile } = await supabase
    .from("profiles")
    .select("email")
    .eq("stripe_customer_id", stripeCustomerId)
    .single();

  const { error } = await supabase
    .from("subscriptions")
    .update({
      status: "past_due",
      updated_at: new Date().toISOString(),
    })
    .eq("stripe_customer_id", stripeCustomerId);

  if (error) {
    logStep("ERROR: Failed to update subscription to past_due", { error: error.message });
  } else {
    logStep("Subscription marked as past_due");
  }

  // Send payment failed email
  if (resend && profile?.email) {
    await sendPaymentFailedEmail(resend, profile.email);
  }
}

async function sendWelcomeEmail(resend: any, email: string) {
  const appUrl = Deno.env.get("APP_URL") || "https://canvatrip.lovable.app";

  try {
    await resend.emails.send({
      from: Deno.env.get("RESEND_FROM_EMAIL") || "Canva Viagem <lucas@rochadigitalmidia.com.br>",
      to: [email],
      subject: "🚀 Acesso Liberado: Bem-vindo ao Futuro do Marketing de Viagens! 🌴",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
        </head>
        <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f5f5f5;">
          <div style="max-width: 600px; margin: 0 auto; background-color: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <div style="background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); padding: 40px 20px; text-align: center;">
              <p style="font-size: 40px; margin: 0;">✈️ 🤖 📱</p>
              <h1 style="color: white; margin: 10px 0; font-size: 28px;">Bem-vindo ao Canva Viagens!</h1>
              <p style="color: rgba(255,255,255,0.9); margin-top: 10px; font-size: 16px;">Sua agência acaba de ganhar superpoderes.</p>
            </div>
            
            <div style="padding: 40px 30px;">
              <h2 style="color: #1f2937; margin-top: 0;">Pagamento Confirmado com Sucesso! ✅</h2>
              
              <p style="color: #4b5563; line-height: 1.6;">
                É oficial: você faz parte do grupo seleto de agentes que usam tecnologia de ponta para vender mais. Seu acesso está ativo e liberado.
              </p>
              
              <h3 style="color: #1f2937;">O que está incluso no seu arsenal:</h3>
              
              <div style="display: grid; gap: 12px;">
                <div style="display: flex; align-items: center; gap: 10px; padding: 12px; background: #f3f4f6; border-radius: 8px;">
                  <span style="font-size: 24px;">📹</span>
                  <span style="color: #4b5563;">Vídeos Reels Virais prontos para postar</span>
                </div>
                <div style="display: flex; align-items: center; gap: 10px; padding: 12px; background: #f3f4f6; border-radius: 8px;">
                  <span style="font-size: 24px;">🤖</span>
                  <span style="color: #4b5563;">10 Robôs de IA trabalhando por você</span>
                </div>
                <div style="display: flex; align-items: center; gap: 10px; padding: 12px; background: #f3f4f6; border-radius: 8px;">
                  <span style="font-size: 24px;">🎨</span>
                  <span style="color: #4b5563;">Templates Editáveis de alta conversão</span>
                </div>
                <div style="display: flex; align-items: center; gap: 10px; padding: 12px; background: #f3f4f6; border-radius: 8px;">
                  <span style="font-size: 24px;">📱</span>
                  <span style="color: #4b5563;">Estratégias para: Instagram, TikTok e YouTube</span>
                </div>
                <div style="display: flex; align-items: center; gap: 10px; padding: 12px; background: #f3f4f6; border-radius: 8px;">
                  <span style="font-size: 24px;">🌴</span>
                  <span style="color: #4b5563;">Banco de Imagens exclusivo de destinos</span>
                </div>
              </div>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${appUrl}/auth" 
                   style="display: inline-block; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: white; padding: 15px 40px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
                  🚀 Acessar Minha Plataforma
                </a>
                <p style="color: #6b7280; font-size: 14px; margin-top: 10px;">Toque no botão para começar a criar</p>
              </div>
              
              <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin-top: 20px;">
                <p style="color: #6b7280; font-size: 14px; margin: 0;">
                  <strong>🔐 Seu Acesso Seguro:</strong><br><br>
                  Email cadastrado: <strong>${email}</strong><br><br>
                  Basta digitar seu email na tela de login e enviaremos um Link Mágico. Sem senhas complicadas para decorar!
                </p>
              </div>
            </div>
            
            <div style="background-color: #f9fafb; padding: 20px 30px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="font-size: 24px; margin: 0 0 10px 0;">🌍 ✈️ 📸</p>
              <p style="color: #6b7280; font-size: 12px; margin: 0;">
                © 2025 Canva Viagens & Marketing.<br>
                Transformando agentes em autoridades digitais.
              </p>
              <p style="color: #9ca3af; font-size: 12px; margin-top: 10px;">
                Precisa de suporte VIP? <a href="https://wa.me/5585986411294" style="color: #6366f1;">Chame no WhatsApp</a>
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
    });
    logStep("Welcome email sent successfully", { email });
  } catch (error: unknown) {
    logStep("ERROR: Failed to send welcome email", { error: error instanceof Error ? error.message : String(error), email });
  }
}

async function sendCancellationEmail(resend: any, email: string) {
  const appUrl = Deno.env.get("APP_URL") || "https://canvatrip.lovable.app";

  try {
    await resend.emails.send({
      from: Deno.env.get("RESEND_FROM_EMAIL") || "Canva Viagem <lucas@rochadigitalmidia.com.br>",
      to: [email],
      subject: "💔 Sentiremos sua falta (e seus resultados também...)",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
        </head>
        <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f5f5f5;">
          <div style="max-width: 600px; margin: 0 auto; background-color: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <div style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); padding: 40px 20px; text-align: center;">
              <p style="font-size: 50px; margin: 0;">😢</p>
              <h1 style="color: white; margin: 10px 0; font-size: 28px;">Sua assinatura foi pausada</h1>
            </div>
            
            <div style="padding: 40px 30px;">
              <h2 style="color: #1f2937; margin-top: 0;">Não é um adeus, é um "até logo"!</h2>
              
              <p style="color: #4b5563; line-height: 1.6;">
                Confirmamos o cancelamento da sua assinatura. Seu acesso às ferramentas de IA, templates e artes de viagem foi encerrado por enquanto.
              </p>
              
              <div style="background-color: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <p style="color: #991b1b; font-weight: bold; margin: 0 0 10px 0;">⚠️ O que você acaba de perder:</p>
                <ul style="color: #991b1b; margin: 0; padding-left: 20px; line-height: 1.8;">
                  <li>Atualizações semanais de Reels</li>
                  <li>Acesso aos novos Robôs de Atendimento</li>
                  <li>Suporte prioritário de marketing</li>
                </ul>
              </div>
              
              <p style="color: #4b5563; line-height: 1.6;">
                Sabemos que a vida de agente é corrida. Quando estiver pronto para automatizar seu marketing novamente, estaremos te esperando de portas abertas (e com novidades!).
              </p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${appUrl}/planos" 
                   style="display: inline-block; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: white; padding: 15px 40px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
                  🔙 Quero Reativar Agora
                </a>
              </div>
            </div>
            
            <div style="background-color: #f9fafb; padding: 20px 30px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="color: #9ca3af; font-size: 12px; margin: 0;">
                Foi um erro? <a href="https://wa.me/5585986411294" style="color: #6366f1;">Fale conosco no WhatsApp</a>
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
    });
    logStep("Cancellation email sent successfully", { email });
  } catch (error: unknown) {
    logStep("ERROR: Failed to send cancellation email", { error: error instanceof Error ? error.message : String(error), email });
  }
}

async function sendPaymentFailedEmail(resend: any, email: string) {
  const appUrl = Deno.env.get("APP_URL") || "https://canvatrip.lovable.app";

  try {
    await resend.emails.send({
      from: Deno.env.get("RESEND_FROM_EMAIL") || "Canva Viagem <lucas@rochadigitalmidia.com.br>",
      to: [email],
      subject: "🔴 Ação Necessária: Evite o bloqueio do seu marketing",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
        </head>
        <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f5f5f5;">
          <div style="max-width: 600px; margin: 0 auto; background-color: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <div style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding: 30px 20px; text-align: center;">
              <p style="color: white; font-size: 14px; font-weight: bold; margin: 0;">⚠️ ALERTA DE SISTEMA</p>
            </div>
            
            <div style="padding: 40px 30px;">
              <div style="text-align: center; margin-bottom: 20px;">
                <p style="font-size: 50px; margin: 0;">💳 🚫</p>
              </div>
              
              <h2 style="color: #1f2937; margin-top: 0; text-align: center;">O pagamento falhou</h2>
              
              <p style="color: #4b5563; line-height: 1.6;">
                Olá! Tivemos um probleminha ao processar a renovação da sua assinatura do Canva Viagens.
              </p>
              
              <div style="background-color: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
                <p style="color: #92400e; margin: 0; font-weight: bold;">
                  Consequência: Seus acessos aos templates, robôs e downloads ilimitados podem ser suspensos temporariamente nas próximas 24h.
                </p>
              </div>
              
              <p style="color: #4b5563; line-height: 1.6;">
                Geralmente isso acontece por: cartão vencido, limite insuficiente ou bloqueio preventivo do banco.
              </p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${appUrl}/planos" 
                   style="display: inline-block; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: white; padding: 15px 40px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
                  🔄 Atualizar Cartão Agora
                </a>
              </div>
              
              <p style="color: #4b5563; line-height: 1.6; text-align: center;">
                Não deixe sua agência parar de vender! Resolva isso em menos de 1 minuto.
              </p>
            </div>
            
            <div style="background-color: #f9fafb; padding: 20px 30px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="color: #9ca3af; font-size: 12px; margin: 0;">
                Precisa de um boleto ou PIX? <a href="https://wa.me/5585986411294" style="color: #6366f1;">Chame o Suporte</a>
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
    });
    logStep("Payment failed email sent successfully", { email });
  } catch (error: unknown) {
    logStep("ERROR: Failed to send payment failed email", { error: error instanceof Error ? error.message : String(error), email });
  }
}
