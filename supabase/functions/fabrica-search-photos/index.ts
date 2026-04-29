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

    // Estratégia de busca em camadas para máxima precisão do destino:
    // 1) Tenta exatamente o nome do destino (ex: "Maragogi") — Pexels indexa por localização real
    // 2) Se vier pouco resultado, tenta com sufixo geográfico ("Brasil"/"Brazil")
    // 3) Último fallback: nome + "praia/cidade" (NUNCA termos genéricos em inglês)
    const rawQuery = body.query.trim();
    const perPage = Math.min(body.perPage || 12, 30);
    const orientation = body.orientation || "portrait";

    const tryFetch = async (query: string) => {
      const params = new URLSearchParams({
        query,
        per_page: String(perPage),
        orientation,
        locale: "pt-BR",
      });
      const r = await fetch(`https://api.pexels.com/v1/search?${params}`, {
        headers: { Authorization: PEXELS_API_KEY },
      });
      if (!r.ok) return null;
      return (await r.json()) as { photos: PexelsPhoto[]; total_results: number };
    };

    // Heurística: detecta destinos brasileiros conhecidos para reforçar contexto geográfico
    const BR_HINTS = [
      "maragogi", "jericoacoara", "fernando de noronha", "porto de galinhas",
      "gramado", "bonito", "búzios", "buzios", "florianópolis", "florianopolis",
      "salvador", "natal", "fortaleza", "recife", "rio de janeiro", "são paulo",
      "sao paulo", "ilhabela", "paraty", "ouro preto", "pipa", "morro de são paulo",
      "chapada", "lençóis", "lencois", "alter do chão", "alter do chao", "ubatuba",
      "trancoso", "arraial d'ajuda", "arraial dajuda", "caldas novas", "olinda",
    ];
    const isBR = BR_HINTS.some((h) => rawQuery.toLowerCase().includes(h));

    // Camada 1: query pura (mais preciso para destinos específicos)
    let data = await tryFetch(rawQuery);

    // Camada 2: se vier menos de 6 resultados, tenta reforçar geografia
    if (!data || data.photos.length < 6) {
      const enriched = isBR ? `${rawQuery} Brasil` : `${rawQuery} city`;
      const data2 = await tryFetch(enriched);
      if (data2 && data2.photos.length > (data?.photos.length ?? 0)) {
        data = data2;
      }
    }

    if (!data) {
      return new Response(JSON.stringify({ error: "Erro ao buscar fotos" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Filtra fora resultados claramente irrelevantes (selfies, retratos com pessoas como tema central)
    // baseado no alt-text fornecido pela Pexels.
    const BAD_TERMS = [
      "selfie", "portrait of woman", "portrait of man", "portrait of a woman",
      "portrait of a man", "model posing", "indoor portrait", "studio shot",
      "close-up of person", "person looking at camera",
    ];
    const filtered = data.photos.filter((p) => {
      const alt = (p.alt || "").toLowerCase();
      return !BAD_TERMS.some((t) => alt.includes(t));
    });

    const photos = (filtered.length >= 4 ? filtered : data.photos).map((p) => ({
      id: p.id,
      url: p.src.large2x,
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
