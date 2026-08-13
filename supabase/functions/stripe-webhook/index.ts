import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { sendUnifiedWelcomeEmail } from "../_shared/welcomeEmail.ts";
import { assertOfficialSupabaseProject } from "../_shared/officialProjectGuard.ts";

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

async function sha256Hex(input: string): Promise<string> {
  const bytes = new TextEncoder().encode(input.trim().toLowerCase());
  const hash = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(hash))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

async function trackPaidInvoiceConversion(invoice: Stripe.Invoice, supabase: any, stripe: Stripe): Promise<boolean> {
  const amountPaid = Number(invoice.amount_paid || 0);
  if (!invoice.id || amountPaid <= 0) return true;

  const { data: existingEvents, error: lookupError } = await supabase
    .from("analytics_events")
    .select("id,event_type,event_data")
    .in("event_type", ["purchase_paid_pending", "purchase_paid"])
    .contains("event_data", { invoice_id: invoice.id })
    .limit(2);
  if (lookupError) {
    logStep("WARN: paid conversion idempotency lookup failed", { invoiceId: invoice.id, error: lookupError.message });
  }
  if (existingEvents?.some((event: any) => event.event_type === "purchase_paid")) {
    logStep("Paid conversion already recorded", { invoiceId: invoice.id });
    return true;
  }

  let landingVariant = "general";
  const subscriptionId = invoice.subscription as string | null;
  if (subscriptionId) {
    try {
      const subscription = await stripe.subscriptions.retrieve(subscriptionId);
      landingVariant = subscription.metadata?.landing_variant || "general";
    } catch (error: any) {
      logStep("WARN: subscription metadata unavailable for conversion", { invoiceId: invoice.id, error: error.message });
    }
  }

  const value = amountPaid / 100;
  const currency = (invoice.currency || "brl").toUpperCase();
  const eventId = `stripe_invoice_${invoice.id}`;
  const email = invoice.customer_email;
  const eventData = {
    invoice_id: invoice.id,
    stripe_customer_id: invoice.customer,
    subscription_id: subscriptionId,
    billing_reason: invoice.billing_reason,
    offer_variant: landingVariant,
    value,
    currency,
    meta_event_id: eventId,
    status: "pending",
  };
  let pendingEventId = existingEvents?.find((event: any) => event.event_type === "purchase_paid_pending")?.id;
  if (!pendingEventId) {
    const { data: pendingEvent, error: pendingError } = await supabase
      .from("analytics_events")
      .insert({
        user_id: null,
        session_id: `stripe:${invoice.id}`,
        event_type: "purchase_paid_pending",
        event_data: eventData,
        url_path: "/stripe-webhook",
      })
      .select("id")
      .single();
    if (pendingError) {
      logStep("WARN: unable to persist pending paid conversion", { invoiceId: invoice.id, error: pendingError.message });
    } else {
      pendingEventId = pendingEvent?.id;
    }
  }

  const accessToken = Deno.env.get("META_CAPI_TOKEN_2120347238758199");
  let metaSent = false;
  if (accessToken) {
    try {
      const userData: Record<string, unknown> = {};
      if (isValidEmail(email)) userData.em = [await sha256Hex(email)];
      const response = await fetch("https://graph.facebook.com/v18.0/2120347238758199/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: AbortSignal.timeout(8000),
        body: JSON.stringify({
          access_token: accessToken,
          data: [{
            event_name: "Purchase",
            event_time: Math.floor(Date.now() / 1000),
            event_id: eventId,
            event_source_url: "https://canvaviagem.com/obrigado",
            action_source: "website",
            user_data: userData,
            custom_data: { value, currency },
          }],
        }),
      });
      metaSent = response.ok;
      if (!response.ok) {
        logStep("WARN: Meta CAPI paid conversion failed", { invoiceId: invoice.id, status: response.status });
      }
    } catch (error: any) {
      logStep("WARN: Meta CAPI paid conversion request failed", { invoiceId: invoice.id, error: error.message });
    }
  } else {
    logStep("WARN: Meta CAPI token not configured for paid conversion", { invoiceId: invoice.id });
    metaSent = true;
  }

  if (!metaSent) {
    logStep("Paid conversion remains pending", { invoiceId: invoice.id, value, currency, landingVariant });
    return false;
  }

  const sentEventData = { ...eventData, status: "sent", sent_at: new Date().toISOString() };
  const { error: saveError } = pendingEventId
    ? await supabase
      .from("analytics_events")
      .update({ event_type: "purchase_paid", event_data: sentEventData })
      .eq("id", pendingEventId)
    : await supabase.from("analytics_events").insert({
      user_id: null,
      session_id: `stripe:${invoice.id}`,
      event_type: "purchase_paid",
      event_data: sentEventData,
      url_path: "/stripe-webhook",
    });
  if (saveError) {
    logStep("ERROR recording paid conversion", { invoiceId: invoice.id, error: saveError.message });
    return false;
  }
  logStep("Paid conversion recorded", { invoiceId: invoice.id, value, currency, landingVariant });
  return true;
}

async function trackPaidInvoiceConversionSafely(invoice: Stripe.Invoice, supabase: any, stripe: Stripe): Promise<boolean> {
  try {
    return await trackPaidInvoiceConversion(invoice, supabase, stripe);
  } catch (error: any) {
    logStep("WARN: paid conversion tracking isolated from provisioning", { invoiceId: invoice.id, error: error.message });
    return false;
  }
}

async function hasPendingPaidConversion(invoiceId: string, supabase: any): Promise<boolean> {
  const { data, error } = await supabase
    .from("analytics_events")
    .select("id")
    .eq("event_type", "purchase_paid_pending")
    .contains("event_data", { invoice_id: invoiceId })
    .limit(1);
  if (error) {
    logStep("WARN: pending conversion lookup failed", { invoiceId, error: error.message });
    return false;
  }
  return Boolean(data?.length);
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

type SubscriptionAccessDetails = {
  status: string;
  currentPeriodEnd: string | null;
  trialStartedAt: string | null;
  trialEndsAt: string | null;
  billingCycle: string | null;
};

function getSubscriptionAccessDetails(subscription: Stripe.Subscription): SubscriptionAccessDetails {
  const recurring = subscription.items.data[0]?.price?.recurring;
  const billingCycle = recurring?.interval === "year"
    ? "annual"
    : recurring?.interval === "month" && recurring.interval_count === 6
      ? "semiannual"
      : recurring?.interval === "month"
        ? "monthly"
        : null;

  return {
    status: subscription.status,
    currentPeriodEnd: subscription.current_period_end
      ? new Date(subscription.current_period_end * 1000).toISOString()
      : null,
    trialStartedAt: subscription.trial_start
      ? new Date(subscription.trial_start * 1000).toISOString()
      : null,
    trialEndsAt: subscription.trial_end
      ? new Date(subscription.trial_end * 1000).toISOString()
      : null,
    billingCycle,
  };
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
  productId?: string,
  accessDetails?: SubscriptionAccessDetails,
) {
  const normalizedEmail = email.toLowerCase().trim();
  logStep("Starting onboarding for", { email: redactEmail(normalizedEmail), productId });

  // 1. Check/Create User sem getUserByEmail (não é suportado no runtime Deno)
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
      // Tratar possível corrida ou usuário já registrado de forma silenciosa que não quebre o fluxo
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

  // 3. Upsert Subscription — NUNCA forçar fallback de produto.
  // Se productId vier nulo, salvamos null e logamos para investigação manual,
  // em vez de rebaixar a compra (ex: Elite virando Start).
  if (!productId) {
    logStep("WARN: productId not resolved for subscription — saving as null", {
      email: redactEmail(normalizedEmail),
      stripeCustomerId,
      stripeSubscriptionId,
    });
  }
  const { error: subError } = await supabase.from("subscriptions").upsert({
    user_id: userId,
    stripe_customer_id: stripeCustomerId,
    stripe_subscription_id: stripeSubscriptionId,
    status: accessDetails?.status ?? "active",
    product_id: productId || null,
    current_period_end: accessDetails?.currentPeriodEnd ?? null,
    trial_started_at: accessDetails?.trialStartedAt ?? null,
    trial_ends_at: accessDetails?.trialEndsAt ?? null,
    billing_provider: "stripe",
    billing_cycle: accessDetails?.billingCycle ?? null,
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

  // 5. Send unified email via Resend if available
  if (resend && magicLink) {
    await sendUnifiedWelcomeEmail(
      supabase,
      resend,
      normalizedEmail,
      magicLink,
      token,
      name || "Visitante",
      productId,
      "stripe"
    );
  }

  // 6. Trigger Zaia Welcome (with the generated magic link for WhatsApp delivery!)
  await triggerZaiaWebhook("ZAIA_WEBHOOK_WELCOME", {
    email: normalizedEmail,
    name: name,
    phone: phone || undefined,
    magic_link: magicLink,
  });
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  assertOfficialSupabaseProject("stripe-webhook");

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

  let claimedEventId = "";
  try {
    const body = await req.text();
    const signature = req.headers.get("stripe-signature");
    if (!signature) throw new Error("No signature");

    const event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret);
    logStep("Event received", { type: event.type, id: event.id });
    const { data: claimed, error: claimError } = await supabaseAdmin.rpc("claim_stripe_webhook_event", {
      p_event_id: event.id,
      p_event_type: event.type,
    });
    if (claimError) throw claimError;
    if (!claimed) {
      return new Response(JSON.stringify({ received: true, duplicate: true }), { headers: corsHeaders, status: 200 });
    }
    claimedEventId = event.id;

    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutCompleted(event.data.object, supabaseAdmin, resend, stripe);
        break;
      case "customer.subscription.created":
        await handleSubscriptionCreated(event.data.object, supabaseAdmin, stripe);
        break;
      case "customer.subscription.updated":
        await handleSubscriptionUpdated(event.data.object, supabaseAdmin, stripe);
        break;
      case "customer.subscription.deleted":
        await handleSubscriptionDeleted(event.data.object, supabaseAdmin, resend, stripe);
        break;
      case "invoice.payment_succeeded":
        await handlePaymentSucceeded(event.data.object, supabaseAdmin, resend, stripe);
        break;
      case "invoice.payment_failed":
        await handlePaymentFailed(event.data.object, supabaseAdmin, resend, stripe);
        break;
      case "checkout.session.expired":
        await handleCheckoutExpired(event.data.object, supabaseAdmin, resend);
        break;
      default:
        logStep("Unhandled event type", { type: event.type });
    }

    const { error: completionError } = await supabaseAdmin
      .from("stripe_webhook_events")
      .update({ status: "completed", completed_at: new Date().toISOString(), updated_at: new Date().toISOString() })
      .eq("event_id", event.id);
    if (completionError) throw completionError;

    return new Response(JSON.stringify({ received: true }), { headers: corsHeaders, status: 200 });
  } catch (err: any) {
    if (claimedEventId) {
      await supabaseAdmin
        .from("stripe_webhook_events")
        .update({ status: "failed", last_error: String(err?.message || err).slice(0, 1000), updated_at: new Date().toISOString() })
        .eq("event_id", claimedEventId);
    }
    logStep("ERROR in stripe-webhook", { message: err.message });
    return new Response(JSON.stringify({ error: GENERIC_ERRORS.serviceError }), { headers: corsHeaders, status: 500 });
  }
});

async function handleCheckoutCompleted(session: Stripe.Checkout.Session, supabase: any, resend: any, stripe: Stripe) {
  logStep("Processing checkout.session.completed", { sessionId: session.id });
  const email = session.customer_email || session.customer_details?.email;
  if (!isValidEmail(email)) return;

  const customerName = session.customer_details?.name || email.split("@")[0];
  const customerPhone = session.customer_details?.phone ? session.customer_details.phone.replace(/\D/g, '') : null;
  const stripeCustomerId = session.customer as string;
  const stripeSubscriptionId = session.subscription as string;

  let productId: string | undefined = undefined;
  let accessDetails: SubscriptionAccessDetails | undefined;
  let authoritativeSubscription: Stripe.Subscription | undefined;
  if (stripeSubscriptionId) {
    try {
      const subscription = await stripe.subscriptions.retrieve(stripeSubscriptionId);
      authoritativeSubscription = subscription;
      const retrievedProductId = subscription.items.data[0]?.price?.product as string;
      accessDetails = getSubscriptionAccessDetails(subscription);
      if (retrievedProductId) {
        productId = retrievedProductId;
        logStep("Retrieved product ID from subscription", { productId });
      }
    } catch (e: any) {
      logStep("ERROR retrieving subscription for product ID", { error: e.message });
    }
  }

  // Backup: line items do Checkout Session
  if (!productId) {
    try {
      logStep("Attempting fallback product ID fetch from session line items", { sessionId: session.id });
      const lineItems = await stripe.checkout.sessions.listLineItems(session.id, { limit: 1 });
      const lineProductId = lineItems.data[0]?.price?.product as string;
      if (lineProductId) {
        productId = lineProductId;
        logStep("Retrieved product ID from line items backup", { productId });
      }
    } catch (e: any) {
      logStep("ERROR in line items fallback", { error: e.message });
    }
  }

  if (accessDetails?.status === "trialing" && authoritativeSubscription) {
    const referencedUserId = session.client_reference_id || session.metadata?.user_id || "";
    if (!referencedUserId) throw new Error(`Trial checkout ${session.id} is missing user_id`);

    const paymentMethodRef = authoritativeSubscription.default_payment_method;
    let paymentFingerprint = "";
    if (paymentMethodRef) {
      const paymentMethod = typeof paymentMethodRef === "string"
        ? await stripe.paymentMethods.retrieve(paymentMethodRef)
        : paymentMethodRef;
      paymentFingerprint = paymentMethod.card?.fingerprint || "";
    }

    const { data: trialClaimed, error: trialClaimError } = await supabase.rpc("claim_fabrica_trial", {
      p_user_id: referencedUserId,
      p_email_hash: await sha256Hex(email),
      p_payment_fingerprint: paymentFingerprint,
      p_stripe_customer_id: stripeCustomerId,
      p_stripe_subscription_id: stripeSubscriptionId,
    });
    if (trialClaimError) throw trialClaimError;
    if (!trialClaimed) {
      await stripe.subscriptions.cancel(stripeSubscriptionId);
      logStep("Duplicate trial blocked", { sessionId: session.id, userId: referencedUserId });
      return;
    }
  }

  await ensureUserAndOnboarding(
    supabase,
    resend,
    email,
    customerName,
    stripeCustomerId,
    stripeSubscriptionId,
    customerPhone,
    productId,
    accessDetails,
  );
}

async function handleSubscriptionCreated(subscription: Stripe.Subscription, supabase: any, stripe: Stripe) {
  logStep("Processing customer.subscription.created", { subscriptionId: subscription.id });
  await handleSubscriptionUpdated(subscription, supabase, stripe);
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription, supabase: any, stripe: Stripe) {
  logStep("Processing customer.subscription.updated", { subscriptionId: subscription.id });
  // Stripe doesn't guarantee webhook order. Re-read the authoritative object
  // before mutating access so an older event cannot reactivate a canceled user.
  subscription = await stripe.subscriptions.retrieve(subscription.id);
  const stripeCustomerId = subscription.customer as string;
  const productId = subscription.items.data[0]?.price?.product as string | undefined;
  const accessDetails = getSubscriptionAccessDetails(subscription);
  const { error } = await supabase.from("subscriptions").update({
    status: accessDetails.status,
    current_period_end: accessDetails.currentPeriodEnd,
    trial_started_at: accessDetails.trialStartedAt,
    trial_ends_at: accessDetails.trialEndsAt,
    billing_provider: "stripe",
    billing_cycle: accessDetails.billingCycle,
    product_id: productId ?? null,
    stripe_subscription_id: subscription.id,
    updated_at: new Date().toISOString(),
  }).eq("stripe_customer_id", stripeCustomerId);
  if (error) throw error;
  const { data: localSubscription, error: localError } = await supabase
    .from("subscriptions")
    .select("user_id")
    .eq("stripe_customer_id", stripeCustomerId)
    .maybeSingle();
  if (localError) throw localError;
  if (localSubscription?.user_id) {
    const { error: siteAccessError } = await supabase.rpc("sync_user_public_site_access", {
      p_user_id: localSubscription.user_id,
    });
    if (siteAccessError) throw siteAccessError;
  }

}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription, supabase: any, resend: any, stripe: Stripe) {
  try {
    subscription = await stripe.subscriptions.retrieve(subscription.id);
  } catch (error: any) {
    if (error?.statusCode !== 404 && error?.code !== "resource_missing") throw error;
  }
  const stripeCustomerId = subscription.customer as string;
  const { data: profile } = await supabase.from("profiles").select("email, name").eq("stripe_customer_id", stripeCustomerId).single();
  const { error: cancellationError } = await supabase.from("subscriptions").update({ status: "canceled", updated_at: new Date().toISOString() }).eq("stripe_customer_id", stripeCustomerId);
  if (cancellationError) throw cancellationError;
  const { data: canceledSubscription, error: canceledLookupError } = await supabase
    .from("subscriptions")
    .select("user_id")
    .eq("stripe_customer_id", stripeCustomerId)
    .maybeSingle();
  if (canceledLookupError) throw canceledLookupError;
  if (canceledSubscription?.user_id) {
    const { error: siteAccessError } = await supabase.rpc("sync_user_public_site_access", { p_user_id: canceledSubscription.user_id });
    if (siteAccessError) throw siteAccessError;
  }
  if (resend && profile?.email) await sendCancellationEmail(resend, profile.email);
  if (profile?.email) await triggerZaiaWebhook("ZAIA_WEBHOOK_CANCELLATION", { email: profile.email, name: profile.name });
}

async function handlePaymentSucceeded(invoice: Stripe.Invoice, supabase: any, resend: any, stripe: Stripe) {
  logStep("Processing invoice.payment_succeeded", { invoiceId: invoice.id });
  const stripeCustomerId = invoice.customer as string;
  if (invoice.id && await hasPendingPaidConversion(invoice.id, supabase)) {
    logStep("Retrying paid conversion without repeating provisioning", { invoiceId: invoice.id });
    const conversionTracked = await trackPaidInvoiceConversionSafely(invoice, supabase, stripe);
    if (!conversionTracked) throw new Error(`Paid conversion still pending for invoice ${invoice.id}`);
    return;
  }

  // Check if this is the first payment (Subscription Creation)
  if (invoice.billing_reason === 'subscription_create') {
    const email = invoice.customer_email || invoice.customer_name; // Fallback? invoice.customer_email should be set.
    if (isValidEmail(email)) {
      const customerName = invoice.customer_name || email.split("@")[0];
      const subscriptionId = invoice.subscription as string;
      
      let productId: string | undefined = undefined;
      let accessDetails: SubscriptionAccessDetails | undefined;
      if (subscriptionId) {
        try {
          const subscription = await stripe.subscriptions.retrieve(subscriptionId);
          const retrievedProductId = subscription.items.data[0]?.price?.product as string;
          accessDetails = getSubscriptionAccessDetails(subscription);
          if (retrievedProductId) {
            productId = retrievedProductId;
            logStep("Retrieved product ID from subscription (invoice)", { productId });
          }
        } catch (e: any) {
          logStep("ERROR retrieving subscription for product ID (invoice)", { error: e.message });
        }
      }

      // Backup: line items do invoice
      if (!productId) {
        const lineProductId = invoice.lines?.data?.[0]?.price?.product as string;
        if (lineProductId) {
          productId = lineProductId;
          logStep("Retrieved product ID from invoice lines data", { productId });
        }
      }

      await ensureUserAndOnboarding(
        supabase,
        resend,
        email,
        customerName,
        stripeCustomerId,
        subscriptionId,
        null,
        productId,
        accessDetails,
      );
      const conversionTracked = await trackPaidInvoiceConversionSafely(invoice, supabase, stripe);
      if (!conversionTracked) throw new Error(`Paid conversion pending for invoice ${invoice.id}`);
      return; // ensureUserAndOnboarding also upserts subscription, so we can return or continue. 
    } else {
      logStep("No email in invoice for subscription_create", { invoiceId: invoice.id });
    }
  }

  const subscriptionId = invoice.subscription as string | null;
  if (subscriptionId) {
    const authoritativeSubscription = await stripe.subscriptions.retrieve(subscriptionId);
    const authoritativeAccess = getSubscriptionAccessDetails(authoritativeSubscription);
    const authoritativeProductId = authoritativeSubscription.items.data[0]?.price?.product as string | undefined;
    const { error: authoritativeUpdateError } = await supabase.from("subscriptions").update({
      status: authoritativeAccess.status,
      current_period_end: authoritativeAccess.currentPeriodEnd,
      trial_started_at: authoritativeAccess.trialStartedAt,
      trial_ends_at: authoritativeAccess.trialEndsAt,
      product_id: authoritativeProductId ?? null,
      stripe_subscription_id: authoritativeSubscription.id,
      updated_at: new Date().toISOString(),
    }).eq("stripe_customer_id", stripeCustomerId);
    if (authoritativeUpdateError) throw authoritativeUpdateError;
  } else {
  const { error } = await supabase.from("subscriptions").update({
    status: "active",
    updated_at: new Date().toISOString(),
  }).eq("stripe_customer_id", stripeCustomerId);
  if (error) throw error;
  }
  const conversionTracked = await trackPaidInvoiceConversionSafely(invoice, supabase, stripe);
  if (!conversionTracked) throw new Error(`Paid conversion pending for invoice ${invoice.id}`);
}

async function handlePaymentFailed(invoice: Stripe.Invoice, supabase: any, resend: any, stripe: Stripe) {
  const stripeCustomerId = invoice.customer as string;
  const { data: profile } = await supabase.from("profiles").select("email, name").eq("stripe_customer_id", stripeCustomerId).single();
  const subscriptionId = invoice.subscription as string | null;
  let nextStatus = "past_due";
  let authoritativeFields: Record<string, unknown> = {};
  if (subscriptionId) {
    const authoritativeSubscription = await stripe.subscriptions.retrieve(subscriptionId);
    const access = getSubscriptionAccessDetails(authoritativeSubscription);
    // A failed invoice must revoke paid access immediately. Never keep an
    // active/trialing snapshot just because subscription.updated arrived late.
    nextStatus = ["canceled", "unpaid", "paused", "incomplete_expired"].includes(access.status)
      ? access.status
      : "past_due";
    authoritativeFields = {
      current_period_end: access.currentPeriodEnd,
      trial_started_at: access.trialStartedAt,
      trial_ends_at: access.trialEndsAt,
      product_id: authoritativeSubscription.items.data[0]?.price?.product ?? null,
      stripe_subscription_id: authoritativeSubscription.id,
    };
  }
  const { error: paymentStatusError } = await supabase.from("subscriptions").update({
    status: nextStatus,
    ...authoritativeFields,
    updated_at: new Date().toISOString(),
  }).eq("stripe_customer_id", stripeCustomerId);
  if (paymentStatusError) throw paymentStatusError;
  const { data: failedSubscription, error: failedLookupError } = await supabase
    .from("subscriptions")
    .select("user_id")
    .eq("stripe_customer_id", stripeCustomerId)
    .maybeSingle();
  if (failedLookupError) throw failedLookupError;
  if (failedSubscription?.user_id) {
    const { error: siteAccessError } = await supabase.rpc("sync_user_public_site_access", { p_user_id: failedSubscription.user_id });
    if (siteAccessError) throw siteAccessError;
  }
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
// sendAutoMagicLinkEmail e sendWelcomeEmail foram movidos para
// `../_shared/welcomeEmail.ts` para serem reutilizados pelos webhooks.

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
