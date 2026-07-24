import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const allowedEventTypes = new Set([
  "page_view",
  "click_whatsapp",
  "click_intent",
  "time_on_site",
  "lead_captured",
  "package_view",
  "package_not_found",
  "package_cta",
  "package_cta_unavailable",
]);

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

const cleanText = (value: unknown, max: number) =>
  String(value ?? "").trim().slice(0, max);

const sha256 = async (value: string) => {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
};

const hostnameFromHeader = (value: string | null) => {
  if (!value || value === "null") return "";
  try {
    return new URL(value).hostname.toLowerCase();
  } catch {
    return "";
  }
};

const sanitizeEventData = (value: unknown) => {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  const cloned = JSON.parse(JSON.stringify(value)) as Record<string, unknown>;
  delete cloned.agency_id;
  delete cloned.project_id;
  delete cloned.site_id;
  delete cloned.ingestion;
  return cloned;
};

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  if (request.method !== "POST") {
    return json({ error: "Method not allowed" }, 405);
  }

  try {
    const rawBody = await request.text();
    if (rawBody.length > 20_000) return json({ error: "Payload too large" }, 413);

    const body = JSON.parse(rawBody) as Record<string, unknown>;
    const siteId = cleanText(body.site_id, 80).toLowerCase();
    const projectId = cleanText(body.project_id, 80).toLowerCase();
    const sessionId = cleanText(body.session_id, 100);
    const eventType = cleanText(body.event_type, 60);

    if (!/^[a-z0-9](?:[a-z0-9-]{0,78}[a-z0-9])?$/.test(siteId)) {
      return json({ error: "Invalid site" }, 400);
    }
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(projectId)) {
      return json({ error: "Invalid project" }, 400);
    }
    if (!/^sess_[a-z0-9_-]{10,95}$/i.test(sessionId)) {
      return json({ error: "Invalid session" }, 400);
    }
    if (!allowedEventTypes.has(eventType)) {
      return json({ error: "Invalid event" }, 400);
    }

    const originHost = hostnameFromHeader(request.headers.get("origin"));
    const refererHost = hostnameFromHeader(request.headers.get("referer"));
    const expectedHost = `${siteId}.canvaviagem.com`;
    if (originHost !== expectedHost && refererHost !== expectedHost) {
      return json({ error: "Invalid site origin" }, 403);
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    const { data: site, error: siteError } = await supabase
      .from("public_sites")
      .select("owner_id, project_id")
      .eq("id", siteId)
      .eq("project_id", projectId)
      .maybeSingle();
    if (siteError) throw siteError;
    if (!site?.owner_id || site.project_id !== projectId) {
      return json({ error: "Site project not found" }, 404);
    }

    const forwardedIp = cleanText(
      request.headers.get("cf-connecting-ip")
        || request.headers.get("x-forwarded-for")?.split(",")[0],
      80,
    );
    const fingerprint = await sha256(
      `${forwardedIp || "unknown"}|${cleanText(request.headers.get("user-agent"), 240)}`,
    );
    const { data: rateAllowed, error: rateError } = await supabase.rpc(
      "check_fabrica_event_rate_limit",
      {
        p_project_id: projectId,
        p_fingerprint: fingerprint,
        p_limit: 120,
        p_window_seconds: 600,
      },
    );
    if (rateError) throw rateError;
    if (rateAllowed === false) {
      return json({ error: "Too many events" }, 429);
    }

    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString();
    const { count: recentCount, error: countError } = await supabase
      .from("analytics_events")
      .select("id", { count: "exact", head: true })
      .eq("user_id", site.owner_id)
      .eq("session_id", sessionId)
      .gte("created_at", tenMinutesAgo);
    if (countError) throw countError;
    if ((recentCount || 0) >= 120) {
      return json({ error: "Too many events" }, 429);
    }

    if (eventType === "page_view") {
      const { data: existing, error: existingError } = await supabase
        .from("analytics_events")
        .select("id")
        .eq("user_id", site.owner_id)
        .eq("session_id", sessionId)
        .eq("event_type", "page_view")
        .contains("event_data", { project_id: projectId, site_id: siteId })
        .limit(1)
        .maybeSingle();
      if (existingError) throw existingError;
      if (existing) return json({ ok: true, duplicate: true });
    }

    const eventData = sanitizeEventData(body.event_data);
    const encodedData = JSON.stringify(eventData);
    if (encodedData.length > 10_000) return json({ error: "Event data too large" }, 413);

    const { error: insertError } = await supabase.from("analytics_events").insert({
      user_id: site.owner_id,
      session_id: sessionId,
      event_type: eventType,
      url_path: cleanText(body.url_path, 500) || null,
      event_data: {
        ...eventData,
        agency_id: site.owner_id,
        project_id: projectId,
        site_id: siteId,
        ingestion: "validated_v1",
      },
    });
    if (insertError) throw insertError;

    return json({ ok: true });
  } catch (error) {
    console.error("track-fabrica-event error", error);
    return json({ error: "Internal error" }, 500);
  }
});
