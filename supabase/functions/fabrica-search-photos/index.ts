// Edge function: fabrica-search-photos
// Busca fotos turísticas usando Pexels (principal) e Google Custom Search (alternativo).
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

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

async function searchPexels(query: string, perPage: number): Promise<PhotoOut[]> {
  const key = Deno.env.get("PEXELS_API_KEY");
  if (!key) {
    console.error("PEXELS_API_KEY missing");
    return [];
  }
  try {
    const url = `https://api.pexels.com/v1/search?query=${encodeURIComponent(query + " travel")}&per_page=${perPage}&orientation=landscape`;
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
    const body = await req.json();
    const query = (body.query || "").trim();
    const engine = (body.engine || "pexels").toLowerCase();

    if (query.length < 2) {
      return new Response(JSON.stringify({ error: "Query é necessária" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const perPage = Math.min(body.perPage || 12, 24);

    let photos: PhotoOut[] = [];
    if (engine === "google") {
      photos = await searchGoogle(query, perPage);
      if (photos.length === 0) photos = await searchPexels(query, perPage);
    } else {
      photos = await searchPexels(query, perPage);
      if (photos.length === 0) photos = await searchGoogle(query, perPage);
    }

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
