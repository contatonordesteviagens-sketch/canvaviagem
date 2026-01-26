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

// Redact email for logging (security best practice - avoid PII in logs)
function redactEmail(email: string | null | undefined): string {
  if (!email || typeof email !== 'string') return '[no-email]';
  const parts = email.split('@');
  if (parts.length !== 2) return '[invalid-email]';
  const localPart = parts[0];
  const domain = parts[1];
  const redacted = localPart.length > 2 
    ? localPart.substring(0, 2) + '***' 
    : '***';
  return `${redacted}@${domain}`;
}

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

// Valid languages
const VALID_LANGUAGES = ['pt', 'en', 'es'] as const;
type Language = typeof VALID_LANGUAGES[number];

function detectLanguage(metadata?: Record<string, string> | null): Language {
  const lang = metadata?.language || metadata?.locale?.substring(0, 2) || 'pt';
  return VALID_LANGUAGES.includes(lang as Language) ? (lang as Language) : 'pt';
}

// ============= EMAIL TEMPLATES (i18n) =============
const emailTemplates = {
  welcome: {
    pt: {
      subject: "🚀 Acesso Liberado: Bem-vindo ao Futuro do Marketing de Viagens! 🌴",
      heading: "Bem-vindo ao Canva Viagens!",
      subheading: "Sua agência acaba de ganhar superpoderes.",
      confirmed: "Pagamento Confirmado com Sucesso! ✅",
      intro: "É oficial: você faz parte do grupo seleto de agentes que usam tecnologia de ponta para vender mais. Seu acesso está ativo e liberado.",
      arsenal: "O que está incluso no seu arsenal:",
      features: [
        { icon: "📹", text: "Vídeos Reels Virais prontos para postar" },
        { icon: "🤖", text: "10 Robôs de IA trabalhando por você" },
        { icon: "🎨", text: "Templates Editáveis de alta conversão" },
        { icon: "📱", text: "Estratégias para: Instagram, TikTok e YouTube" },
        { icon: "🌴", text: "Banco de Imagens exclusivo de destinos" },
      ],
      cta: "🚀 Acessar Minha Plataforma",
      ctaSubtext: "Toque no botão para começar a criar",
      accessTitle: "🔐 Seu Acesso Seguro:",
      accessText: "Basta digitar seu email na tela de login e enviaremos um Link Mágico. Sem senhas complicadas para decorar!",
      footer: "Transformando agentes em autoridades digitais.",
      support: "Precisa de suporte VIP?",
    },
    en: {
      subject: "🚀 Access Granted: Welcome to the Future of Travel Marketing! 🌴",
      heading: "Welcome to Canva Viagens!",
      subheading: "Your agency just gained superpowers.",
      confirmed: "Payment Confirmed Successfully! ✅",
      intro: "It's official: you're now part of the select group of agents using cutting-edge technology to sell more. Your access is active and ready.",
      arsenal: "What's included in your arsenal:",
      features: [
        { icon: "📹", text: "Viral Reels Videos ready to post" },
        { icon: "🤖", text: "10 AI Robots working for you" },
        { icon: "🎨", text: "High-converting Editable Templates" },
        { icon: "📱", text: "Strategies for: Instagram, TikTok, and YouTube" },
        { icon: "🌴", text: "Exclusive destination image library" },
      ],
      cta: "🚀 Access My Platform",
      ctaSubtext: "Tap the button to start creating",
      accessTitle: "🔐 Your Secure Access:",
      accessText: "Just enter your email on the login screen and we'll send you a Magic Link. No complicated passwords to remember!",
      footer: "Transforming agents into digital authorities.",
      support: "Need VIP support?",
    },
    es: {
      subject: "🚀 Acceso Liberado: ¡Bienvenido al Futuro del Marketing de Viajes! 🌴",
      heading: "¡Bienvenido a Canva Viagens!",
      subheading: "Tu agencia acaba de ganar superpoderes.",
      confirmed: "¡Pago Confirmado con Éxito! ✅",
      intro: "Es oficial: ahora formas parte del grupo selecto de agentes que usan tecnología de punta para vender más. Tu acceso está activo y listo.",
      arsenal: "Lo que incluye tu arsenal:",
      features: [
        { icon: "📹", text: "Videos Reels Virales listos para publicar" },
        { icon: "🤖", text: "10 Robots de IA trabajando para ti" },
        { icon: "🎨", text: "Templates Editables de alta conversión" },
        { icon: "📱", text: "Estrategias para: Instagram, TikTok y YouTube" },
        { icon: "🌴", text: "Banco de Imágenes exclusivo de destinos" },
      ],
      cta: "🚀 Acceder a Mi Plataforma",
      ctaSubtext: "Toca el botón para empezar a crear",
      accessTitle: "🔐 Tu Acceso Seguro:",
      accessText: "Solo ingresa tu email en la pantalla de login y te enviaremos un Link Mágico. ¡Sin contraseñas complicadas!",
      footer: "Transformando agentes en autoridades digitales.",
      support: "¿Necesitas soporte VIP?",
    },
  },
  cancellation: {
    pt: {
      subject: "💔 Sentiremos sua falta (e seus resultados também...)",
      heading: "Sua assinatura foi pausada",
      goodbye: "Não é um adeus, é um 'até logo'!",
      intro: "Confirmamos o cancelamento da sua assinatura. Seu acesso às ferramentas de IA, templates e artes de viagem foi encerrado por enquanto.",
      lostTitle: "⚠️ O que você acaba de perder:",
      lostItems: ["Atualizações semanais de Reels", "Acesso aos novos Robôs de Atendimento", "Suporte prioritário de marketing"],
      outro: "Sabemos que a vida de agente é corrida. Quando estiver pronto para automatizar seu marketing novamente, estaremos te esperando de portas abertas (e com novidades!).",
      cta: "🔙 Quero Reativar Agora",
      error: "Foi um erro?",
    },
    en: {
      subject: "💔 We'll miss you (and your results too...)",
      heading: "Your subscription has been paused",
      goodbye: "This isn't goodbye, it's 'see you later'!",
      intro: "We confirm the cancellation of your subscription. Your access to AI tools, templates, and travel designs has ended for now.",
      lostTitle: "⚠️ What you just lost:",
      lostItems: ["Weekly Reels updates", "Access to new Service Robots", "Priority marketing support"],
      outro: "We know an agent's life is busy. When you're ready to automate your marketing again, we'll be waiting with open doors (and news!).",
      cta: "🔙 I Want to Reactivate Now",
      error: "Was this a mistake?",
    },
    es: {
      subject: "💔 Te extrañaremos (y tus resultados también...)",
      heading: "Tu suscripción ha sido pausada",
      goodbye: "¡No es un adiós, es un 'hasta pronto'!",
      intro: "Confirmamos la cancelación de tu suscripción. Tu acceso a las herramientas de IA, templates y diseños de viaje ha terminado por ahora.",
      lostTitle: "⚠️ Lo que acabas de perder:",
      lostItems: ["Actualizaciones semanales de Reels", "Acceso a los nuevos Robots de Atención", "Soporte prioritario de marketing"],
      outro: "Sabemos que la vida de agente es ajetreada. Cuando estés listo para automatizar tu marketing nuevamente, te estaremos esperando con las puertas abiertas (¡y con novedades!).",
      cta: "🔙 Quiero Reactivar Ahora",
      error: "¿Fue un error?",
    },
  },
  paymentFailed: {
    pt: {
      subject: "🔴 Ação Necessária: Evite o bloqueio do seu marketing",
      alert: "⚠️ ALERTA DE SISTEMA",
      heading: "O pagamento falhou",
      intro: "Olá! Tivemos um probleminha ao processar a renovação da sua assinatura do Canva Viagens.",
      warning: "Consequência: Seus acessos aos templates, robôs e downloads ilimitados podem ser suspensos temporariamente nas próximas 24h.",
      reason: "Geralmente isso acontece por: cartão vencido, limite insuficiente ou bloqueio preventivo do banco.",
      cta: "🔄 Atualizar Cartão Agora",
      urgency: "Não deixe sua agência parar de vender! Resolva isso em menos de 1 minuto.",
      altPayment: "Precisa de um boleto ou PIX?",
    },
    en: {
      subject: "🔴 Action Required: Avoid blocking your marketing",
      alert: "⚠️ SYSTEM ALERT",
      heading: "Payment failed",
      intro: "Hi! We had a small problem processing your Canva Viagens subscription renewal.",
      warning: "Consequence: Your access to templates, robots, and unlimited downloads may be temporarily suspended in the next 24 hours.",
      reason: "This usually happens due to: expired card, insufficient limit, or preventive bank block.",
      cta: "🔄 Update Card Now",
      urgency: "Don't let your agency stop selling! Solve this in less than 1 minute.",
      altPayment: "Need a different payment method?",
    },
    es: {
      subject: "🔴 Acción Requerida: Evita el bloqueo de tu marketing",
      alert: "⚠️ ALERTA DEL SISTEMA",
      heading: "El pago falló",
      intro: "¡Hola! Tuvimos un pequeño problema al procesar la renovación de tu suscripción de Canva Viagens.",
      warning: "Consecuencia: Tu acceso a templates, robots y descargas ilimitadas puede ser suspendido temporalmente en las próximas 24 horas.",
      reason: "Esto generalmente sucede por: tarjeta vencida, límite insuficiente o bloqueo preventivo del banco.",
      cta: "🔄 Actualizar Tarjeta Ahora",
      urgency: "¡No dejes que tu agencia deje de vender! Resuelve esto en menos de 1 minuto.",
      altPayment: "¿Necesitas otro método de pago?",
    },
  },
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
  const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
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

  const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });
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
  
  if (!isValidEmail(rawEmail)) {
    logStep("ERROR: Invalid or missing email in session", { rawEmail: rawEmail ? "[REDACTED]" : "null" });
    return;
  }
  
  const email = rawEmail.toLowerCase();
  const stripeCustomerId = session.customer as string;
  const stripeSubscriptionId = session.subscription as string;
  
  // Detectar idioma do metadata
  const userLanguage = detectLanguage(session.metadata);

  logStep("Checkout details", { 
    email: redactEmail(email), 
    stripeCustomerId, 
    stripeSubscriptionId,
    language: userLanguage 
  });

  // ARQUITETURA NOVA: NÃO criar usuário via Admin API
  // Apenas popular tabelas customizadas - Magic Link cria usuário

  // Verificar se já existe profile com este stripe_customer_id
  const { data: existingProfile } = await supabase
    .from("profiles")
    .select("id, user_id")
    .eq("stripe_customer_id", stripeCustomerId)
    .maybeSingle();

  if (existingProfile) {
    // Atualizar profile existente
    const { error: profileError } = await supabase
      .from("profiles")
      .update({
        email,
        language: userLanguage,
        updated_at: new Date().toISOString(),
      })
      .eq("stripe_customer_id", stripeCustomerId);

    if (profileError) {
      logStep("ERROR: Failed to update profile", { error: profileError.message });
    } else {
      logStep("Profile updated successfully");
    }

    // Atualizar subscription existente
    const { error: subError } = await supabase
      .from("subscriptions")
      .update({
        stripe_subscription_id: stripeSubscriptionId,
        status: "active",
        product_id: "prod_TkvaozfpkAcbpM",
        updated_at: new Date().toISOString(),
      })
      .eq("stripe_customer_id", stripeCustomerId);

    if (subError) {
      logStep("ERROR: Failed to update subscription", { error: subError.message });
    }
  } else {
    // Verificar se existe profile por email (usuário existente via Magic Link)
    const { data: profileByEmail } = await supabase
      .from("profiles")
      .select("id, user_id")
      .eq("email", email)
      .maybeSingle();

    if (profileByEmail) {
      // Atualizar profile existente com stripe_customer_id
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          stripe_customer_id: stripeCustomerId,
          language: userLanguage,
          updated_at: new Date().toISOString(),
        })
        .eq("email", email);

      if (profileError) {
        logStep("ERROR: Failed to update profile with stripe_customer_id", { error: profileError.message });
      }

      // Criar ou atualizar subscription
      const { error: subError } = await supabase
        .from("subscriptions")
        .upsert({
          user_id: profileByEmail.user_id,
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
    } else {
      // Novo cliente - criar profile placeholder (user_id será atualizado no Magic Link)
      // Usar um UUID temporário que será substituído quando o usuário fizer login
      const tempUserId = crypto.randomUUID();
      
      const { error: profileError } = await supabase
        .from("profiles")
        .insert({
          user_id: tempUserId,
          email,
          stripe_customer_id: stripeCustomerId,
          language: userLanguage,
        });

      if (profileError) {
        logStep("ERROR: Failed to create placeholder profile", { error: profileError.message });
      } else {
        logStep("Placeholder profile created for new customer");
      }

      // Criar subscription para novo cliente
      const { error: subError } = await supabase
        .from("subscriptions")
        .insert({
          user_id: tempUserId,
          stripe_customer_id: stripeCustomerId,
          stripe_subscription_id: stripeSubscriptionId,
          status: "active",
          product_id: "prod_TkvaozfpkAcbpM",
        });

      if (subError) {
        logStep("ERROR: Failed to create subscription", { error: subError.message });
      }
    }
  }

  logStep("Profile and subscription processed successfully");

  // Enviar e-mail de boas-vindas no idioma correto
  if (resend) {
    await sendWelcomeEmail(resend, email, userLanguage);
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

  // Get user profile for notification (with language)
  const { data: profile } = await supabase
    .from("profiles")
    .select("email, language")
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

  // Send cancellation email in user's language
  if (resend && profile?.email) {
    const lang = (profile.language as Language) || 'pt';
    await sendCancellationEmail(resend, profile.email, lang);
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

  // Get user profile for notification (with language)
  const { data: profile } = await supabase
    .from("profiles")
    .select("email, language")
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

  // Send payment failed email in user's language
  if (resend && profile?.email) {
    const lang = (profile.language as Language) || 'pt';
    await sendPaymentFailedEmail(resend, profile.email, lang);
  }
}

// ============= EMAIL SENDING FUNCTIONS (i18n) =============

async function sendWelcomeEmail(resend: any, email: string, language: Language = 'pt') {
  const appUrl = Deno.env.get("APP_URL") || "https://canvaviagem.lovable.app";
  const t = emailTemplates.welcome[language] || emailTemplates.welcome.pt;

  try {
    const featuresHtml = t.features.map(f => `
      <div style="display: flex; align-items: center; gap: 10px; padding: 12px; background: #f3f4f6; border-radius: 8px;">
        <span style="font-size: 24px;">${f.icon}</span>
        <span style="color: #4b5563;">${f.text}</span>
      </div>
    `).join('');

    await resend.emails.send({
      from: Deno.env.get("RESEND_FROM_EMAIL") || "Canva Viagem <lucas@rochadigitalmidia.com.br>",
      to: [email],
      subject: t.subject,
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
              <h1 style="color: white; margin: 10px 0; font-size: 28px;">${t.heading}</h1>
              <p style="color: rgba(255,255,255,0.9); margin-top: 10px; font-size: 16px;">${t.subheading}</p>
            </div>
            
            <div style="padding: 40px 30px;">
              <h2 style="color: #1f2937; margin-top: 0;">${t.confirmed}</h2>
              
              <p style="color: #4b5563; line-height: 1.6;">${t.intro}</p>
              
              <h3 style="color: #1f2937;">${t.arsenal}</h3>
              
              <div style="display: grid; gap: 12px;">
                ${featuresHtml}
              </div>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${appUrl}/auth" 
                   style="display: inline-block; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: white; padding: 15px 40px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
                  ${t.cta}
                </a>
                <p style="color: #6b7280; font-size: 14px; margin-top: 10px;">${t.ctaSubtext}</p>
              </div>
              
              <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin-top: 20px;">
                <p style="color: #6b7280; font-size: 14px; margin: 0;">
                  <strong>${t.accessTitle}</strong><br><br>
                  Email: <strong>${email}</strong><br><br>
                  ${t.accessText}
                </p>
              </div>
            </div>
            
            <div style="background-color: #f9fafb; padding: 20px 30px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="font-size: 24px; margin: 0 0 10px 0;">🌍 ✈️ 📸</p>
              <p style="color: #6b7280; font-size: 12px; margin: 0;">
                © 2025 Canva Viagens & Marketing.<br>
                ${t.footer}
              </p>
              <p style="color: #9ca3af; font-size: 12px; margin-top: 10px;">
                ${t.support} <a href="https://wa.me/5585986411294" style="color: #6366f1;">WhatsApp</a>
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
    });
    logStep("Welcome email sent successfully", { email: redactEmail(email), language });
  } catch (error: unknown) {
    logStep("ERROR: Failed to send welcome email", { error: error instanceof Error ? error.message : String(error), email: redactEmail(email) });
  }
}

async function sendCancellationEmail(resend: any, email: string, language: Language = 'pt') {
  const appUrl = Deno.env.get("APP_URL") || "https://canvaviagem.lovable.app";
  const t = emailTemplates.cancellation[language] || emailTemplates.cancellation.pt;

  try {
    const lostItemsHtml = t.lostItems.map(item => `<li>${item}</li>`).join('');

    await resend.emails.send({
      from: Deno.env.get("RESEND_FROM_EMAIL") || "Canva Viagem <lucas@rochadigitalmidia.com.br>",
      to: [email],
      subject: t.subject,
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
              <h1 style="color: white; margin: 10px 0; font-size: 28px;">${t.heading}</h1>
            </div>
            
            <div style="padding: 40px 30px;">
              <h2 style="color: #1f2937; margin-top: 0;">${t.goodbye}</h2>
              
              <p style="color: #4b5563; line-height: 1.6;">${t.intro}</p>
              
              <div style="background-color: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <p style="color: #991b1b; font-weight: bold; margin: 0 0 10px 0;">${t.lostTitle}</p>
                <ul style="color: #991b1b; margin: 0; padding-left: 20px; line-height: 1.8;">
                  ${lostItemsHtml}
                </ul>
              </div>
              
              <p style="color: #4b5563; line-height: 1.6;">${t.outro}</p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${appUrl}/planos" 
                   style="display: inline-block; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: white; padding: 15px 40px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
                  ${t.cta}
                </a>
              </div>
            </div>
            
            <div style="background-color: #f9fafb; padding: 20px 30px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="color: #9ca3af; font-size: 12px; margin: 0;">
                ${t.error} <a href="https://wa.me/5585986411294" style="color: #6366f1;">WhatsApp</a>
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
    });
    logStep("Cancellation email sent successfully", { email: redactEmail(email), language });
  } catch (error: unknown) {
    logStep("ERROR: Failed to send cancellation email", { error: error instanceof Error ? error.message : String(error), email: redactEmail(email) });
  }
}

async function sendPaymentFailedEmail(resend: any, email: string, language: Language = 'pt') {
  const appUrl = Deno.env.get("APP_URL") || "https://canvaviagem.lovable.app";
  const t = emailTemplates.paymentFailed[language] || emailTemplates.paymentFailed.pt;

  try {
    await resend.emails.send({
      from: Deno.env.get("RESEND_FROM_EMAIL") || "Canva Viagem <lucas@rochadigitalmidia.com.br>",
      to: [email],
      subject: t.subject,
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
              <p style="color: white; font-size: 14px; font-weight: bold; margin: 0;">${t.alert}</p>
            </div>
            
            <div style="padding: 40px 30px;">
              <div style="text-align: center; margin-bottom: 20px;">
                <p style="font-size: 50px; margin: 0;">💳 🚫</p>
              </div>
              
              <h2 style="color: #1f2937; margin-top: 0; text-align: center;">${t.heading}</h2>
              
              <p style="color: #4b5563; line-height: 1.6;">${t.intro}</p>
              
              <div style="background-color: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
                <p style="color: #92400e; margin: 0; font-weight: bold;">${t.warning}</p>
              </div>
              
              <p style="color: #4b5563; line-height: 1.6;">${t.reason}</p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${appUrl}/planos" 
                   style="display: inline-block; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: white; padding: 15px 40px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
                  ${t.cta}
                </a>
              </div>
              
              <p style="color: #4b5563; line-height: 1.6; text-align: center;">${t.urgency}</p>
            </div>
            
            <div style="background-color: #f9fafb; padding: 20px 30px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="color: #9ca3af; font-size: 12px; margin: 0;">
                ${t.altPayment} <a href="https://wa.me/5585986411294" style="color: #6366f1;">WhatsApp</a>
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
    });
    logStep("Payment failed email sent successfully", { email: redactEmail(email), language });
  } catch (error: unknown) {
    logStep("ERROR: Failed to send payment failed email", { error: error instanceof Error ? error.message : String(error), email: redactEmail(email) });
  }
}
