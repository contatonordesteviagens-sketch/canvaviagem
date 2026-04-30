// Edge function: fabrica-search-photos
// Busca fotos reais de destinos. Estratégia em cascata:
// 1) Wikimedia Commons (fotos geo-tagueadas reais, sem API key) — melhor para destinos BR
// 2) Unsplash Source (alta qualidade, sem API key) — fallback paisagens
// 3) Pexels (último fallback, requer PEXELS_API_KEY)
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

// ---------- Wikimedia Commons ----------
// Usa a API generator=search com prop=imageinfo p/ trazer URL direto + dimensões.
// Filtra por mime image/jpeg|png e tamanho mínimo p/ evitar miniaturas/ícones.
async function searchWikimedia(query: string, perPage: number): Promise<PhotoOut[]> {
  const params = new URLSearchParams({
    action: "query",
    format: "json",
    generator: "search",
    gsrsearch: `${query} (beach OR tourism OR landscape OR travel) -map -flag -logo -football -soccer -stadium -politician filetype:bitmap`,
    gsrnamespace: "6", // File namespace
    gsrlimit: String(Math.min(perPage * 2, 40)), // pega mais p/ filtrar depois
    prop: "imageinfo",
    iiprop: "url|size|mime|extmetadata",
    iiurlwidth: "1600",
    origin: "*",
  });

  const res = await fetch(`https://commons.wikimedia.org/w/api.php?${params}`, {
    headers: { "User-Agent": "CanvaViagem/1.0 (contato@canvaviagem.com)" },
  });
  if (!res.ok) return [];

  const data = await res.json();
  const pages = data?.query?.pages;
  if (!pages) return [];

  const photos: PhotoOut[] = [];
  for (const key of Object.keys(pages)) {
    const p = pages[key];
    const info = p?.imageinfo?.[0];
    if (!info) continue;
    const mime = info.mime || "";
    if (!mime.startsWith("image/jpeg") && !mime.startsWith("image/png")) continue;
    const w = info.thumbwidth || info.width || 0;
    const h = info.thumbheight || info.height || 0;
    if (w < 800 || h < 600) continue; // descarta miniaturas
    photos.push({
      id: p.pageid,
      url: info.thumburl || info.url,
      thumb: info.thumburl || info.url,
      width: w,
      height: h,
      alt: (p.title || "").replace(/^File:/, "").replace(/\.(jpg|jpeg|png)$/i, ""),
    });
    if (photos.length >= perPage) break;
  }
  return photos;
}

// ---------- Unsplash Source (sem API key, retorna URL direta) ----------
// Não tem busca paginada oficial sem API key, então geramos N variações com seed diferente.
function buildUnsplashFallback(query: string, perPage: number, orientation: string): PhotoOut[] {
  const isPortrait = orientation === "portrait";
  const w = isPortrait ? 1080 : 1600;
  const h = isPortrait ? 1920 : 1200;
  const out: PhotoOut[] = [];
  for (let i = 0; i < perPage; i++) {
    const sig = `${Date.now()}-${i}`;
    const url = `https://source.unsplash.com/${w}x${h}/?${encodeURIComponent(query + " travel")}&sig=${sig}`;
    out.push({
      id: `unsplash-${sig}`,
      url,
      thumb: url,
      width: w,
      height: h,
      alt: query,
    });
  }
  return out;
}

// ---------- Pexels (último fallback) ----------
async function searchPexels(query: string, perPage: number, orientation: string): Promise<PhotoOut[]> {
  const PEXELS_API_KEY = Deno.env.get("PEXELS_API_KEY");
  if (!PEXELS_API_KEY) return [];
  const params = new URLSearchParams({
    query: `${query} travel destination tourism landscape beach`,
    per_page: String(Math.min(perPage, 30)),
    orientation,
  });
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
    let source = "wikimedia";

    // 1) Wikimedia Commons — melhor para destinos brasileiros específicos
    try {
      photos = await searchWikimedia(query, perPage);
    } catch (e) {
      console.warn("Wikimedia falhou:", e);
    }

    // 2) Se Wikimedia não trouxe o suficiente, completa com Unsplash
    if (photos.length < Math.min(6, perPage)) {
      const need = perPage - photos.length;
      const unsplash = buildUnsplashFallback(query, need, orientation);
      photos = [...photos, ...unsplash];
      source = photos.length > unsplash.length ? "wikimedia+unsplash" : "unsplash";
    }

    // 3) Se ainda assim falhou (improvável), tenta Pexels como último recurso
    if (photos.length === 0) {
      photos = await searchPexels(query, perPage, orientation);
      source = "pexels";
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
