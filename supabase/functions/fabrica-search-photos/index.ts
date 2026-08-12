// Edge function: fabrica-search-photos
// Busca fotos turísticas usando Pexels (principal) e Google Custom Search (alternativo).
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { verifyFabricaAuthenticatedAccess } from "../_shared/fabricaAccess.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PhotoOut {
  id: string | number;
  url: string;
  thumb: string;
  width: number;
  height: number;
  alt: string;
}

type PhotoOrientation = "landscape" | "portrait" | "square";

const requestWindows = new Map<string, { count: number; resetsAt: number }>();
const photoCache = new Map<string, { photos: PhotoOut[]; expiresAt: number }>();

async function sha256(value: string) {
  const bytes = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest)).map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

function allowPhotoSearch(requesterId: string, limit = 30) {
  const now = Date.now();
  const current = requestWindows.get(requesterId);
  if (!current || current.resetsAt <= now) {
    requestWindows.set(requesterId, { count: 1, resetsAt: now + 60_000 });
    return true;
  }
  if (current.count >= limit) return false;
  current.count += 1;
  return true;
}

function getPositiveInteger(value: unknown, fallback: number, maximum: number) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(maximum, Math.max(1, Math.floor(parsed)));
}

async function searchPexels(
  query: string,
  perPage: number,
  orientation: PhotoOrientation,
  page: number = 1,
): Promise<PhotoOut[]> {
  const key = Deno.env.get("PEXELS_API_KEY");
  if (!key) {
    console.error("PEXELS_API_KEY missing");
    return [];
  }
  try {
    const url = `https://api.pexels.com/v1/search?query=${encodeURIComponent(query + " travel")}&per_page=${perPage}&page=${page}&orientation=${orientation}`;
    const resp = await fetch(url, { headers: { Authorization: key } });
    if (!resp.ok) {
      console.error("Pexels HTTP", resp.status, await resp.text());
      return [];
    }
    const data = await resp.json();
    return (data.photos || []).map((p: any) => ({
      id: p.id,
      url: p.src?.large2x || p.src?.large || p.src?.original,
      thumb: p.src?.medium || p.src?.small,
      alt: p.alt || query,
      width: p.width,
      height: p.height,
    }));
  } catch (e) {
    console.error("Pexels error:", e);
    return [];
  }
}

async function searchGoogle(query: string, perPage: number): Promise<PhotoOut[]> {
  const key = Deno.env.get("GOOGLE_API_KEY");
  const cx = Deno.env.get("GOOGLE_CX_ID");
  if (!key || !cx) {
    console.error("GOOGLE_API_KEY or GOOGLE_CX_ID missing");
    return [];
  }
  try {
    const num = Math.min(perPage, 10);
    const url = `https://www.googleapis.com/customsearch/v1?key=${key}&cx=${cx}&q=${encodeURIComponent(query + " turismo")}&searchType=image&num=${num}&safe=active&imgSize=large`;
    const resp = await fetch(url);
    if (!resp.ok) {
      console.error("Google HTTP", resp.status, await resp.text());
      return [];
    }
    const data = await resp.json();
    return (data.items || []).map((it: any, i: number) => ({
      id: `g-${i}-${Date.now()}`,
      url: it.link,
      thumb: it.image?.thumbnailLink || it.link,
      alt: it.title || query,
      width: it.image?.width || 1080,
      height: it.image?.height || 1080,
    }));
  } catch (e) {
    console.error("Google error:", e);
    return [];
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const access = await verifyFabricaAuthenticatedAccess(req, corsHeaders);
    const forwardedIp = req.headers.get("cf-connecting-ip")
      || req.headers.get("x-real-ip")
      || req.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
      || "unknown";
    const guestKey = `guest:${forwardedIp}:${(req.headers.get("user-agent") || "unknown").slice(0, 80)}`;
    const requesterKey = access.ok ? `user:${access.userId}` : guestKey;
    // Guests may search while building their first preview, but at a much
    // tighter rate than authenticated accounts to protect provider credits.
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    const db = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });
    const requesterHash = await sha256(requesterKey);
    const { data: persistentAllowed, error: rateError } = await db.rpc("consume_fabrica_rate_limit", {
      p_requester_hash: requesterHash,
      p_action: "photo_search",
      p_limit: access.ok ? 30 : 8,
      p_window_seconds: 60,
    });
    if (rateError) console.error("persistent photo rate limit failed", rateError.message);
    if (!allowPhotoSearch(requesterKey, access.ok ? 30 : 8) || persistentAllowed !== true) {
      return new Response(JSON.stringify({ error: "Muitas buscas seguidas. Aguarde um minuto." }), {
        status: 429,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const query = typeof body?.query === "string" ? body.query.trim().slice(0, 120) : "";
    const requestedEngine = typeof body?.engine === "string" ? body.engine.toLowerCase() : "pexels";
    const engine = requestedEngine === "google" ? "google" : "pexels";
    const allowFallback = body.fallback !== false;
    const orientation: PhotoOrientation =
      body.orientation === "portrait" || body.orientation === "square"
        ? body.orientation
        : "landscape";
    const page = getPositiveInteger(body.page, 1, 50);

    if (query.length < 2) {
      return new Response(JSON.stringify({ error: "Query é necessária" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const perPage = getPositiveInteger(body.perPage, 16, 24);
    const cacheKey = JSON.stringify({ query: query.toLocaleLowerCase("pt-BR"), engine, orientation, page, perPage });
    const cached = photoCache.get(cacheKey);
    if (cached && cached.expiresAt > Date.now()) {
      return new Response(JSON.stringify({ photos: cached.photos, cached: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let photos: PhotoOut[] = [];
    if (engine === "google") {
      photos = await searchGoogle(query, perPage);
      if (allowFallback && photos.length === 0) {
        photos = await searchPexels(query, perPage, orientation, page);
      }
    } else {
      photos = await searchPexels(query, perPage, orientation, page);
      if (allowFallback && photos.length === 0) {
        photos = await searchGoogle(query, perPage);
      }
    }

    if (photoCache.size >= 100) {
      const oldestKey = photoCache.keys().next().value;
      if (oldestKey) photoCache.delete(oldestKey);
    }
    photoCache.set(cacheKey, { photos, expiresAt: Date.now() + 5 * 60_000 });

    return new Response(JSON.stringify({ photos }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("fabrica-search-photos error:", error);
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
