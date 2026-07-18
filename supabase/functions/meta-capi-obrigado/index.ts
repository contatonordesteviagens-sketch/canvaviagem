// Meta Conversions API — Purchase event for /obrigado
// Public endpoint (no auth). Fires server-side Purchase to pixel 2120347238758199.
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const PIXEL_ID = "2120347238758199";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

async function sha256Hex(input: string): Promise<string> {
  const buf = new TextEncoder().encode(input.trim().toLowerCase());
  const hash = await crypto.subtle.digest("SHA-256", buf);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const accessToken = Deno.env.get("META_CAPI_TOKEN_2120347238758199");
    if (!accessToken) {
      return new Response(JSON.stringify({ error: "Token not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json().catch(() => ({}));
    const {
      event_id,
      event_source_url,
      value = 29.0,
      currency = "BRL",
      email,
      fbp,
      fbc,
    } = body ?? {};

    const clientIp =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("cf-connecting-ip") ||
      undefined;
    const userAgent = req.headers.get("user-agent") || "";

    const user_data: Record<string, unknown> = {
      client_ip_address: clientIp,
      client_user_agent: userAgent,
    };
    if (email) user_data.em = [await sha256Hex(String(email))];
    if (fbp) user_data.fbp = fbp;
    if (fbc) user_data.fbc = fbc;

    const eventData = {
      event_name: "Purchase",
      event_time: Math.floor(Date.now() / 1000),
      event_id: event_id || `obrigado_${Date.now()}`,
      event_source_url: event_source_url || "https://canvaviagem.lovable.app/obrigado",
      action_source: "website",
      user_data,
      custom_data: { value, currency },
    };

    const url = `https://graph.facebook.com/v18.0/${PIXEL_ID}/events`;
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ data: [eventData], access_token: accessToken }),
    });
    const result = await response.json();

    if (!response.ok) {
      console.error(`[Meta CAPI ${PIXEL_ID}] error:`, result);
      return new Response(JSON.stringify({ error: "Meta API error", result }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`[Meta CAPI ${PIXEL_ID}] Purchase sent`, result);
    return new Response(
      JSON.stringify({ success: true, pixel_id: PIXEL_ID, result }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    console.error("meta-capi-obrigado error:", e);
    return new Response(JSON.stringify({ error: "Internal error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
