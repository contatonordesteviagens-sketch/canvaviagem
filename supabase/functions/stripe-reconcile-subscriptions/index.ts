import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { assertOfficialSupabaseProject } from "../_shared/officialProjectGuard.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const json = (body: Record<string, unknown>, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

const billingCycleOf = (subscription: Stripe.Subscription) => {
  const recurring = subscription.items.data[0]?.price?.recurring;
  if (!recurring) return null;
  if (recurring.interval === "year") return "annual";
  if (recurring.interval === "month" && recurring.interval_count === 6) return "semiannual";
  if (recurring.interval === "month") return "monthly";
  return null;
};

const periodEndOf = (subscription: Stripe.Subscription) => {
  const raw = (subscription as unknown as { current_period_end?: number }).current_period_end
    ?? subscription.items.data[0]?.current_period_end;
  return raw ? new Date(raw * 1000).toISOString() : null;
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    assertOfficialSupabaseProject("stripe-reconcile-subscriptions");

    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY") ?? "";
    if (!supabaseUrl || !serviceKey || !stripeKey) {
      return json({ error: "Service configuration error" }, 500);
    }

    const authHeader = req.headers.get("Authorization") ?? "";
    if (!authHeader.startsWith("Bearer ")) return json({ error: "Unauthorized" }, 401);
    const token = authHeader.slice("Bearer ".length).trim();

    const db = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });

    // Allowed callers: service-role key (maintenance) or an admin user JWT.
    let authorized = token === serviceKey;
    if (!authorized) {
      const authClient = createClient(supabaseUrl, anonKey, {
        global: { headers: { Authorization: authHeader } },
        auth: { persistSession: false },
      });
      const { data: userData } = await authClient.auth.getUser();
      const userId = userData?.user?.id;
      if (userId) {
        const { data: adminRole } = await db
          .from("user_roles")
          .select("role")
          .eq("user_id", userId)
          .eq("role", "admin")
          .limit(1)
          .maybeSingle();
        authorized = Boolean(adminRole);
      }
    }
    if (!authorized) return json({ error: "Unauthorized" }, 403);

    const body = await req.json().catch(() => ({}));
    const dryRun = body?.dry_run !== false;
    const scope = body?.scope === "all" ? "all" : "expired";
    const limit = Math.min(Math.max(Number(body?.limit) || 25, 1), 100);
    const offset = Math.max(Number(body?.offset) || 0, 0);

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });

    // Diagnostics: which webhook endpoints Stripe knows about and what it recently tried to send.
    if (body?.action === "webhook_status") {
      const endpoints = await stripe.webhookEndpoints.list({ limit: 20 });
      const events = await stripe.events.list({ limit: 20 });
      return json({
        endpoints: endpoints.data.map((endpoint) => ({
          id: endpoint.id,
          url: endpoint.url,
          status: endpoint.status,
          api_version: endpoint.api_version,
          enabled_events: endpoint.enabled_events,
        })),
        recent_events: events.data.map((event) => ({
          id: event.id,
          type: event.type,
          created: new Date(event.created * 1000).toISOString(),
          pending_webhooks: event.pending_webhooks,
        })),
      });
    }

    // Creates (once) the Stripe webhook endpoint that keeps renewals in sync.
    // The signing secret is never returned or logged — only its last 4 characters,
    // so the operator can confirm which secret to copy from the Stripe dashboard.
    if (body?.action === "webhook_install") {
      const targetUrl = `${supabaseUrl}/functions/v1/stripe-webhook`;
      const existing = await stripe.webhookEndpoints.list({ limit: 50 });
      const already = existing.data.find((endpoint) => endpoint.url === targetUrl);
      if (already) {
        return json({ created: false, endpoint_id: already.id, url: already.url, status: already.status });
      }
      const endpoint = await stripe.webhookEndpoints.create({
        url: targetUrl,
        enabled_events: [
          "checkout.session.completed",
          "checkout.session.expired",
          "customer.subscription.created",
          "customer.subscription.updated",
          "customer.subscription.deleted",
          "invoice.payment_succeeded",
          "invoice.payment_failed",
        ],
        description: "Canva Viagem - sincronizacao de assinaturas",
      });
      return json({
        created: true,
        endpoint_id: endpoint.id,
        url: endpoint.url,
        status: endpoint.status,
        signing_secret_last4: (endpoint.secret ?? "").slice(-4),
      });
    }



    let query = db
      .from("subscriptions")
      .select("user_id,status,product_id,current_period_end,stripe_customer_id,stripe_subscription_id,billing_provider,billing_cycle")
      .order("current_period_end", { ascending: true })
      .range(offset, offset + limit - 1);
    if (scope === "expired") {
      query = query.eq("status", "active").lte("current_period_end", new Date().toISOString());
    }
    const { data: rows, error: rowsError } = await query;
    if (rowsError) throw rowsError;

    const results: Record<string, unknown>[] = [];
    let renewed = 0;
    let expired = 0;
    let untouched = 0;

    for (const row of rows ?? []) {
      // Only Stripe-backed records are reconcilable here. Hotmart/PIX rows stay untouched.
      if (!row.stripe_subscription_id && !row.stripe_customer_id) {
        untouched += 1;
        continue;
      }

      let subscription: Stripe.Subscription | null = null;
      try {
        if (row.stripe_subscription_id) {
          subscription = await stripe.subscriptions.retrieve(row.stripe_subscription_id);
        }
        if ((!subscription || subscription.status === "canceled") && row.stripe_customer_id) {
          const list = await stripe.subscriptions.list({
            customer: row.stripe_customer_id,
            status: "all",
            limit: 20,
          });
          const live = list.data.find((candidate) =>
            candidate.status === "active" || candidate.status === "trialing" || candidate.status === "past_due"
          );
          if (live) subscription = live;
        }
      } catch (error) {
        results.push({ user_id: row.user_id, action: "stripe_error", detail: String(error) });
        continue;
      }

      if (!subscription) {
        results.push({ user_id: row.user_id, action: "not_found_in_stripe", local_status: row.status });
        continue;
      }

      const productId = (subscription.items.data[0]?.price?.product as string | null) ?? row.product_id;
      const nextEnd = periodEndOf(subscription);
      const nextStatus = subscription.status;
      const nextCycle = billingCycleOf(subscription) ?? row.billing_cycle;

      const changed = nextStatus !== row.status
        || nextEnd !== row.current_period_end
        || productId !== row.product_id
        || row.billing_provider !== "stripe"
        || nextCycle !== row.billing_cycle;

      const localCurrent = !row.current_period_end || new Date(row.current_period_end) > new Date();
      const stripeCurrent = nextStatus === "active" || nextStatus === "trialing";
      if (stripeCurrent && !localCurrent) renewed += 1;
      else if (!stripeCurrent && localCurrent) expired += 1;

      if (!changed) {
        untouched += 1;
        continue;
      }

      if (!dryRun) {
        const { error: updateError } = await db
          .from("subscriptions")
          .update({
            status: nextStatus,
            product_id: productId,
            current_period_end: nextEnd,
            stripe_subscription_id: subscription.id,
            stripe_customer_id: typeof subscription.customer === "string"
              ? subscription.customer
              : row.stripe_customer_id,
            billing_provider: "stripe",
            billing_cycle: nextCycle,
            updated_at: new Date().toISOString(),
          })
          .eq("user_id", row.user_id);
        if (updateError) {
          results.push({ user_id: row.user_id, action: "update_failed", detail: updateError.message });
          continue;
        }
        try {
          await db.rpc("sync_user_public_site_access", { p_user_id: row.user_id });
        } catch (_syncError) {
          // site sync is best-effort; the subscription update already landed
        }
      }

      results.push({
        user_id: row.user_id,
        action: dryRun ? "would_update" : "updated",
        from: { status: row.status, current_period_end: row.current_period_end, product_id: row.product_id },
        to: { status: nextStatus, current_period_end: nextEnd, product_id: productId, billing_cycle: nextCycle },
      });
    }

    console.log("[STRIPE-RECONCILE]", JSON.stringify({ dryRun, total: rows?.length ?? 0, renewed, expired, untouched }));

    return json({
      dry_run: dryRun,
      total: rows?.length ?? 0,
      renewed_from_stripe: renewed,
      expired_in_stripe: expired,
      untouched,
      results,
    });
  } catch (error) {
    console.error("[STRIPE-RECONCILE]", error);
    return json({ error: "Service temporarily unavailable" }, 500);
  }
});
