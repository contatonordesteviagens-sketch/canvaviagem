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

// ---------- Unsplash Source (sem API key — FALLBACK PRINCIPAL) ----------
// Usa termos de turismo variados para garantir fotos de praias/destinos
const TRAVEL_TERMS = [
  "beach paradise",
  "tourism landscape",
  "travel destination",
  "tropical beach",
  "ocean sunset",
  "nature travel",
  "holiday resort",
  "aerial beach",
  "sea coast",
  "scenic view",
  "tourism attraction",
  "vacation spot",
];

function buildUnsplashPhotos(query: string, perPage: number, orientation: string): PhotoOut[] {
  const isPortrait = orientation === "portrait";
  const w = isPortrait ? 1080 : 1600;
  const h = isPortrait ? 1920 : 1200;
  const out: PhotoOut[] = [];

  for (let i = 0; i < perPage; i++) {
    // Rotaciona entre termos de turismo para variar os resultados
    const travelTerm = TRAVEL_TERMS[i % TRAVEL_TERMS.length];
    const searchTerm = encodeURIComponent(`${query} ${travelTerm}`);
    // Adiciona timestamp + índice como seed para forçar imagens diferentes
    const sig = `${Math.floor(Date.now() / 10000)}-${i}`;
    const url = `https://source.unsplash.com/${w}x${h}/?${searchTerm}&sig=${sig}`;

    out.push({
      id: `unsplash-${i}-${sig}`,
      url,
      thumb: url,
      width: w,
      height: h,
      alt: `${query} - foto ${i + 1}`,
    });
  }

  return out;
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

    let photos: PhotoOut[] = [];
    let source = "unsplash";

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
