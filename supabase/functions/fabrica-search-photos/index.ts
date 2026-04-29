// Edge function: fabrica-search-photos
// Busca fotos reais de destinos via Pexels API (gratuito).
// Não armazena nada — apenas proxy de busca.
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PexelsPhoto {
  id: number;
  width: number;
  height: number;
  photographer: string;
  src: {
    original: string;
    large2x: string;
    large: string;
    medium: string;
    portrait: string;
    landscape: string;
  };
  alt: string;
}

interface SearchBody {
  query: string;
  orientation?: "landscape" | "portrait" | "square";
  perPage?: number;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const PEXELS_API_KEY = Deno.env.get("PEXELS_API_KEY");
    if (!PEXELS_API_KEY) throw new Error("PEXELS_API_KEY not configured");

    const body = (await req.json()) as SearchBody;
    if (!body.query || body.query.trim().length < 2) {
      return new Response(JSON.stringify({ error: "Query é obrigatória" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Enriquece query: adiciona "travel destination" para resultados melhores
    const enrichedQuery = `${body.query.trim()} beach travel destination`;
    const params = new URLSearchParams({
      query: enrichedQuery,
      per_page: String(Math.min(body.perPage || 12, 30)),
      orientation: body.orientation || "portrait",
    });

    const res = await fetch(`https://api.pexels.com/v1/search?${params}`, {
      headers: { Authorization: PEXELS_API_KEY },
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error("Pexels error:", res.status, errText);
      return new Response(JSON.stringify({ error: "Erro ao buscar fotos", detail: errText }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await res.json();
    // Retorna apenas dados estritamente necessários — SEM crédito de fotógrafo (usuário pediu)
    const photos = (data.photos as PexelsPhoto[]).map((p) => ({
      id: p.id,
      url: p.src.large2x, // alta qualidade para edição posterior
      thumb: p.src.medium,
      width: p.width,
      height: p.height,
      alt: p.alt,
    }));

    return new Response(JSON.stringify({ photos }), {
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
