// Edge function: fabrica-search-photos
// Busca fotos TURÍSTICAS usando Pixabay como motor principal e Unsplash como fallback.
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

// ---------- Pixabay (FONTE PRINCIPAL - RÁPIDA E LIVRE) ----------
async function searchPixabay(query: string, perPage: number): Promise<PhotoOut[]> {
  const PIXABAY_KEY = "43702164-3257a070183187c9569766099"; // Chave estável
  
  try {
    const url = `https://pixabay.com/api/?key=${PIXABAY_KEY}&q=${encodeURIComponent(query + " travel tourism landscape")}&image_type=photo&orientation=all&per_page=${perPage}&safesearch=true`;
    
    const resp = await fetch(url);
    if (!resp.ok) return [];
    
    const data = await resp.json();
    if (!data.hits) return [];

    return data.hits.map((h: any) => ({
      id: h.id,
      url: h.largeImageURL,
      thumb: h.webformatURL,
      alt: h.tags || query,
      width: h.imageWidth,
      height: h.imageHeight
    }));
  } catch (e) {
    console.error("Pixabay error:", e);
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
    const body = await req.json();
    const query = (body.query || "").trim();
    
    if (query.length < 2) {
      return new Response(JSON.stringify({ error: "Query é necessária" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const perPage = Math.min(body.perPage || 12, 24);

    // 1. Tenta Pixabay primeiro (Melhor custo-benefício e liberdade)
    let photos = await searchPixabay(query, perPage);

    // 2. Se falhar, usa Unsplash
    if (photos.length === 0) {
      photos = await searchUnsplash(query, perPage);
    }

    return new Response(JSON.stringify({ photos }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
