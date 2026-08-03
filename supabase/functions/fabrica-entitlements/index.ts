import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { assertOfficialSupabaseProject } from "../_shared/officialProjectGuard.ts";
import { isEliteProduct, isStartProduct } from "../_shared/planAccess.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const FREE_LIMITS = {
  ad_export: 3,
  carousel_export: 2,
  projects: 1,
} as const;

const TRACKED_EVENTS = new Set([
  "fabrica_opened",
  "free_quota_seen",
  "free_export_reserved",
  "free_export_completed",
  "free_limit_reached",
  "paywall_viewed",
  "upgrade_clicked",
  "site_publish_blocked",
  "crm_preview_opened",
  "landing_viewed",
  "plan_selected",
  "checkout_started",
  "checkout_completed",
  "returned_to_feature",
]);

type Tier =
  | "free"
  | "start_legacy"
  | "unknown_paid"
  | "elite_trial"
  | "elite"
  | "admin";

const jsonResponse = (body: Record<string, unknown>, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

const isCurrent = (end?: string | null) => !end || new Date(end).getTime() > Date.now();

function classifyTier(
  subscription: {
    product_id?: string | null;
    status?: string | null;
    current_period_end?: string | null;
    trial_ends_at?: string | null;
  } | null,
  isAdmin: boolean,
): Tier {
  if (isAdmin) return "admin";
  if (!subscription || !["active", "trialing"].includes(subscription.status ?? "")) return "free";
  if (subscription.status === "trialing") {
    const trialEnd = subscription.trial_ends_at ?? subscription.current_period_end;
    if (!trialEnd || !isCurrent(trialEnd)) return "free";
  } else if (!isCurrent(subscription.current_period_end)) {
    return "free";
  }
  if (isEliteProduct(subscription.product_id)) {
    return subscription.status === "trialing" ? "elite_trial" : "elite";
  }
  if (isStartProduct(subscription.product_id)) return "start_legacy";
  return "unknown_paid";
}

function buildCapabilities(tier: Tier) {
  const fullAccess = tier === "admin" || tier === "elite" || tier === "elite_trial";
  return {
    "fabrica.open": true,
    "fabrica.configure": true,
    "fabrica.save": true,
    "photos.search": true,
    "ad.preview": true,
    "carousel.preview": true,
    "site.preview": true,
    "ad.export": fullAccess,
    "carousel.export": fullAccess,
    "site.publish": fullAccess,
    "crm.real_data": fullAccess,
    "voice.use": fullAccess,
    "vendedor.use": fullAccess,
    "library.premium.open": fullAccess || tier === "start_legacy",
    "tools.basic.use": fullAccess || tier === "start_legacy",
    "tools.elite.use": fullAccess,
    "premium_content.open": fullAccess || tier === "start_legacy",
    unlimited: fullAccess,
  };
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    assertOfficialSupabaseProject("fabrica-entitlements");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return jsonResponse({ error: "Login necessário" }, 401);
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    if (!supabaseUrl || !anonKey || !serviceKey) {
      return jsonResponse({ error: "Serviço temporariamente indisponível" }, 503);
    }

    const authClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
      auth: { persistSession: false },
    });
    const db = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });

    const token = authHeader.slice("Bearer ".length).trim();
    let userId: string | null = null;
    try {
      const { data: claimsData, error: claimsError } = await authClient.auth.getClaims(token);
      if (!claimsError && typeof claimsData?.claims?.sub === "string") {
        userId = claimsData.claims.sub;
      }
    } catch (_authError) {
      userId = null;
    }
    if (!userId) return jsonResponse({ error: "Sessão inválida" }, 401);

    const body = await req.json().catch(() => ({}));
    const action = typeof body.action === "string" ? body.action : "status";

    const [{ data: adminRole }, { data: subscription }] = await Promise.all([
      db.from("user_roles").select("role").eq("user_id", userId).eq("role", "admin").limit(1).maybeSingle(),
      db
        .from("subscriptions")
        .select("product_id,status,current_period_end,trial_started_at,trial_ends_at,billing_provider,billing_cycle")
        .eq("user_id", userId)
        .limit(1)
        .maybeSingle(),
    ]);

    const tier = classifyTier(subscription, Boolean(adminRole));
    const capabilities = buildCapabilities(tier);
    const unlimited = capabilities.unlimited;

    if (action === "status") {
      const { data: usageRows, error: usageError } = await db
        .from("fabrica_usage_ledger")
        .select("capability,status")
        .eq("user_id", userId)
        .eq("status", "committed");

      if (usageError) throw usageError;

      const used = {
        ad_export: usageRows?.filter((row) => row.capability === "ad_export").length ?? 0,
        carousel_export: usageRows?.filter((row) => row.capability === "carousel_export").length ?? 0,
      };

      return jsonResponse({
        tier,
        capabilities,
        limits: unlimited ? null : FREE_LIMITS,
        used,
        remaining: unlimited
          ? null
          : {
              ad_export: Math.max(FREE_LIMITS.ad_export - used.ad_export, 0),
              carousel_export: Math.max(FREE_LIMITS.carousel_export - used.carousel_export, 0),
            },
        subscription: subscription ?? null,
        needs_review: tier === "unknown_paid",
      });
    }

    if (action === "reserve") {
      const capability = body.capability;
      if (capability !== "ad_export" && capability !== "carousel_export") {
        return jsonResponse({ error: "Crédito inválido" }, 400);
      }

      if (unlimited) {
        return jsonResponse({ allowed: true, unlimited: true, reservation_id: null, remaining: null });
      }

      const idempotencyKey = typeof body.idempotency_key === "string" ? body.idempotency_key : "";
      const limit = FREE_LIMITS[capability];
      const { data, error } = await db.rpc("reserve_fabrica_usage", {
        p_user_id: userId,
        p_capability: capability,
        p_idempotency_key: idempotencyKey,
        p_project_id: typeof body.project_id === "string" ? body.project_id : "",
        p_metadata: typeof body.metadata === "object" && body.metadata ? body.metadata : {},
        p_limit: limit,
      });
      if (error) throw error;
      const reservation = data && typeof data === "object" && !Array.isArray(data)
        ? data as Record<string, unknown>
        : {};
      return jsonResponse({ ...reservation, unlimited: false });
    }

    if (action === "commit" || action === "release") {
      const reservationId = typeof body.reservation_id === "string" ? body.reservation_id : "";
      if (!reservationId) return jsonResponse({ error: "Reserva inválida" }, 400);

      const nextStatus = action === "commit" ? "committed" : "released";
      const { data, error } = await db
        .from("fabrica_usage_ledger")
        .update({ status: nextStatus, updated_at: new Date().toISOString() })
        .eq("id", reservationId)
        .eq("user_id", userId)
        .in("status", action === "commit" ? ["reserved", "committed"] : ["reserved", "released"])
        .select("id,status,capability")
        .maybeSingle();
      if (error) throw error;
      if (!data) return jsonResponse({ error: "Reserva não encontrada" }, 404);
      return jsonResponse({ ok: true, reservation: data });
    }

    if (action === "track") {
      const eventType = typeof body.event_type === "string" ? body.event_type : "";
      if (!TRACKED_EVENTS.has(eventType)) return jsonResponse({ error: "Evento inválido" }, 400);

      const eventData = typeof body.event_data === "object" && body.event_data
        ? body.event_data
        : {};
      const { error } = await db.from("analytics_events").insert({
        user_id: userId,
        session_id: `product-${crypto.randomUUID()}`,
        event_type: eventType,
        event_data: {
          ...eventData,
          tier,
          ingestion: "product_funnel_v1",
        },
        url_path: typeof body.url_path === "string" ? body.url_path.slice(0, 300) : null,
      });
      if (error) throw error;
      return jsonResponse({ ok: true });
    }

    return jsonResponse({ error: "Ação inválida" }, 400);
  } catch (error) {
    console.error("[FABRICA-ENTITLEMENTS]", error);
    return jsonResponse({ error: "Serviço temporariamente indisponível" }, 500);
  }
});
