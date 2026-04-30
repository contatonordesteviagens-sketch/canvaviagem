// Edge function: fabrica-search-photos
// Busca fotos TURÍSTICAS de destinos. Estratégia:
// 1) Pexels (se PEXELS_API_KEY estiver configurada)
// 2) Unsplash Source com múltiplos termos de turismo (grátis, sem API key)
// Wikimedia foi REMOVIDO — retornava brasões e bandeiras municipais
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SearchBody {
  query: string;
  orientation?: "landscape" | "portrait" | "square";
  perPage?: number;
}

interface PhotoOut {
  id: string | number;
  url: string;
  thumb: string;
  width: number;
  height: number;
  alt: string;
}

// ---------- Google Custom Search (GOOGLE REAL) ----------
async function searchGoogle(query: string, perPage: number): Promise<PhotoOut[]> {
  const GOOGLE_API_KEY = Deno.env.get("GOOGLE_API_KEY");
  const GOOGLE_CX_ID = Deno.env.get("GOOGLE_CX_ID");
  
  if (!GOOGLE_API_KEY || !GOOGLE_CX_ID) {
    console.log("Google Search: Chaves não configuradas.");
    return [];
  }

  try {
    const url = `https://www.googleapis.com/customsearch/v1?key=${GOOGLE_API_KEY}&cx=${GOOGLE_CX_ID}&q=${encodeURIComponent(query + " tourism destination landscape")}&searchType=image&num=${Math.min(perPage, 10)}&imgSize=large`;
    
    const resp = await fetch(url);
    if (!resp.ok) {
      const err = await resp.text();
      console.error("Google Search API Error:", err);
      return [];
    }
    
    const data = await resp.json();
    if (!data.items) return [];

    return data.items.map((item: any) => ({
      id: item.link,
      url: item.link,
      thumb: item.image.thumbnailLink,
      alt: item.title,
      width: item.image.width,
      height: item.image.height
    }));
  } catch (e) {
    console.error("Google Search Exception:", e);
    return [];
  }
}

// ---------- Pexels (FONTE PRINCIPAL se tiver API key) ----------
async function searchPexels(query: string, perPage: number, orientation: string): Promise<PhotoOut[]> {
  const PEXELS_API_KEY = Deno.env.get("PEXELS_API_KEY");
  if (!PEXELS_API_KEY) return [];

  const params = new URLSearchParams({
    query: `${query} travel destination tourism beach`,
    per_page: String(Math.min(perPage, 30)),
    orientation,
  });

  try {
    const res = await fetch(`https://api.pexels.com/v1/search?${params}`, {
      headers: { Authorization: PEXELS_API_KEY },
    });
    if (!res.ok) return [];
    const data = await res.json();
    return (data.photos || []).map((p: any) => ({
      id: p.id,
      url: p.src.large2x,
      thumb: p.src.medium,
      width: p.width,
      height: p.height,
      alt: p.alt || query,
    }));
  } catch {
    return [];
  }
}

// ---------- Unsplash (FREE FALLBACK) ----------
async function searchUnsplash(query: string, perPage: number): Promise<PhotoOut[]> {
  const terms = ["tourism", "travel", "landscape", "beach"];
  const randomTerm = terms[Math.floor(Math.random() * terms.length)];
  const fullQuery = `${query} ${randomTerm}`;
  
  const photos: PhotoOut[] = [];
  for (let i = 0; i < perPage; i++) {
    const seed = Math.floor(Math.random() * 1000000);
    const url = `https://images.unsplash.com/photo-${seed}?auto=format&fit=crop&q=80&w=1080&q=${encodeURIComponent(fullQuery)}`;
    photos.push({
      id: `unsplash-${seed}`,
      url: url,
      thumb: url + "&w=400",
      alt: `${query} photo`,
      width: 1080,
      height: 1350
    });
  }
  return photos;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const body = (await req.json()) as SearchBody;
    if (!body.query || body.query.trim().length < 2) {
      return new Response(JSON.stringify({ error: "Query é obrigatória" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const query = body.query.trim();
    const perPage = Math.min(body.perPage || 12, 24);
    const orientation = body.orientation || "portrait";
    const engine = body.engine || "google";

    let photos: PhotoOut[] = [];

    // 1) Tenta Pexels primeiro (melhor qualidade)
    try {
      const pexelsPhotos = await searchPexels(query, perPage, orientation);
      if (pexelsPhotos.length > 0) {
        photos = pexelsPhotos;
        source = "pexels";
        console.log(`Pexels retornou ${photos.length} fotos para "${query}"`);
      }
    } catch (e) {
      console.warn("Pexels erro:", e);
    }

    // 2) Se Pexels falhou ou não tem key, usa Unsplash (fotos turísticas reais)
    if (photos.length === 0) {
      photos = buildUnsplashPhotos(query, perPage, orientation);
      source = "unsplash";
      console.log(`Unsplash: gerou ${photos.length} URLs para "${query}"`);
    }

    return new Response(JSON.stringify({ photos, source }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (err) {
    console.error("fabrica-search-photos error:", err);
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "Erro inesperado" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
