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

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
  const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
  const resendKey = Deno.env.get("RESEND_API_KEY");
  const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

  if (!stripeKey) {
    logStep("ERROR: STRIPE_SECRET_KEY not configured");
    return new Response(JSON.stringify({ error: "Stripe key not configured" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }

  if (!webhookSecret) {
    logStep("ERROR: STRIPE_WEBHOOK_SECRET not configured");
    return new Response(JSON.stringify({ error: "Webhook secret not configured" }), {
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
      return new Response(JSON.stringify({ error: "No signature" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    let event: Stripe.Event;
    try {
      event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret);
    } catch (err: unknown) {
      logStep("ERROR: Webhook signature verification failed", { error: err instanceof Error ? err.message : String(err) });
      return new Response(JSON.stringify({ error: "Webhook signature verification failed" }), {
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
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});

async function handleCheckoutCompleted(session: Stripe.Checkout.Session, supabase: any, resend: any) {
  logStep("Processing checkout.session.completed", { sessionId: session.id });

  const email = session.customer_email || session.customer_details?.email;
  if (!email) {
    logStep("ERROR: No email found in session");
    return;
  }

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
  const appUrl = Deno.env.get("APP_URL") || "https://id-preview--998ca1b7-1f9d-4bc1-bba2-e32e02c74e9e.lovable.app";

  try {
    await resend.emails.send({
      from: "onboarding@resend.dev",
      to: [email],
      subject: "🎉 Seu acesso está liberado! - Canva Viagens",
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
              <h1 style="color: white; margin: 0; font-size: 28px;">✈️ Canva Viagens</h1>
              <p style="color: rgba(255,255,255,0.9); margin-top: 10px; font-size: 16px;">Bem-vindo(a)!</p>
            </div>
            
            <div style="padding: 40px 30px;">
              <h2 style="color: #1f2937; margin-top: 0;">🎉 Pagamento Confirmado!</h2>
              
              <p style="color: #4b5563; line-height: 1.6;">
                Seu pagamento de <strong>R$ 9,90</strong> foi processado com sucesso e sua assinatura mensal está ativa!
              </p>
              
              <p style="color: #4b5563; line-height: 1.6;">
                Agora você tem acesso completo a todos os recursos da plataforma:
              </p>
              
              <ul style="color: #4b5563; line-height: 2;">
                <li>📹 Vídeos Reels profissionais</li>
                <li>🎨 Templates 100% editáveis</li>
                <li>🤖 10 Robôs de IA</li>
                <li>📝 Legendas prontas</li>
                <li>📥 Downloads ilimitados</li>
              </ul>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${appUrl}/auth" 
                   style="display: inline-block; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: white; padding: 15px 40px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
                  Acessar Plataforma
                </a>
              </div>
              
              <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin-top: 20px;">
                <p style="color: #6b7280; font-size: 14px; margin: 0;">
                  <strong>Como fazer login:</strong><br>
                  Use o email <strong>${email}</strong> para acessar. Você receberá um link mágico no seu email para entrar - não precisa de senha!
                </p>
              </div>
            </div>
            
            <div style="background-color: #f9fafb; padding: 20px 30px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="color: #9ca3af; font-size: 12px; margin: 0;">
                Precisa de ajuda? Fale conosco no WhatsApp: (85) 9 8641-1294
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
  const appUrl = Deno.env.get("APP_URL") || "https://id-preview--998ca1b7-1f9d-4bc1-bba2-e32e02c74e9e.lovable.app";

  try {
    await resend.emails.send({
      from: "onboarding@resend.dev",
      to: [email],
      subject: "😢 Sua assinatura foi cancelada - Canva Viagens",
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
              <h1 style="color: white; margin: 0; font-size: 28px;">✈️ Canva Viagens</h1>
            </div>
            
            <div style="padding: 40px 30px;">
              <h2 style="color: #1f2937; margin-top: 0;">Assinatura Cancelada</h2>
              
              <p style="color: #4b5563; line-height: 1.6;">
                Sua assinatura foi cancelada e seu acesso à plataforma foi encerrado.
              </p>
              
              <p style="color: #4b5563; line-height: 1.6;">
                Sentimos muito em ver você partir! 😢
              </p>
              
              <p style="color: #4b5563; line-height: 1.6;">
                Se mudar de ideia, você pode reativar sua assinatura a qualquer momento:
              </p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${appUrl}/planos" 
                   style="display: inline-block; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: white; padding: 15px 40px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
                  Reativar Assinatura
                </a>
              </div>
              
              <p style="color: #6b7280; font-size: 14px;">
                Obrigado por ter feito parte da nossa comunidade!
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
  try {
    await resend.emails.send({
      from: "onboarding@resend.dev",
      to: [email],
      subject: "⚠️ Problema com seu pagamento - Canva Viagens",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
        </head>
        <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f5f5f5;">
          <div style="max-width: 600px; margin: 0 auto; background-color: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <div style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding: 40px 20px; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 28px;">⚠️ Atenção</h1>
            </div>
            
            <div style="padding: 40px 30px;">
              <h2 style="color: #1f2937; margin-top: 0;">Falha no Pagamento</h2>
              
              <p style="color: #4b5563; line-height: 1.6;">
                Não conseguimos processar o pagamento da sua assinatura mensal.
              </p>
              
              <p style="color: #4b5563; line-height: 1.6;">
                <strong>Seu acesso foi temporariamente bloqueado.</strong>
              </p>
              
              <div style="background-color: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <p style="color: #92400e; margin: 0; font-weight: bold;">O que fazer:</p>
                <ul style="color: #92400e; margin-top: 10px; padding-left: 20px;">
                  <li>Verifique os dados do seu cartão</li>
                  <li>Certifique-se de que há saldo disponível</li>
                  <li>Atualize suas informações de pagamento</li>
                </ul>
              </div>
              
              <p style="color: #4b5563; line-height: 1.6;">
                Assim que o pagamento for processado, seu acesso será restaurado automaticamente.
              </p>
              
              <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin-top: 20px;">
                <p style="color: #6b7280; font-size: 14px; margin: 0;">
                  Precisa de ajuda? Fale conosco no WhatsApp: (85) 9 8641-1294
                </p>
              </div>
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
