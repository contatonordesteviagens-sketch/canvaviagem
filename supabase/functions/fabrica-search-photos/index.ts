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

    const rawQuery = body.query.trim();
    const perPage = Math.min(body.perPage || 12, 30);
    const orientation = body.orientation || "portrait";

    const tryFetch = async (query: string, locale = "pt-BR") => {
      const params = new URLSearchParams({
        query,
        per_page: String(perPage),
        orientation,
        locale,
      });
      const r = await fetch(`https://api.pexels.com/v1/search?${params}`, {
        headers: { Authorization: PEXELS_API_KEY },
      });
      if (!r.ok) return null;
      return (await r.json()) as { photos: PexelsPhoto[]; total_results: number };
    };

    // Mapeamento explícito para destinos AMBÍGUOS (palavras que também são substantivos comuns)
    // ou que precisam de termo turístico em inglês para a Pexels achar fotos certas.
    const lower = rawQuery.toLowerCase().trim();
    const DESTINATION_MAP: Record<string, { queries: string[]; locale?: string }> = {
      // BR ambíguos (gramado=grass, bonito=pretty, natal=christmas, etc.)
      "gramado":           { queries: ["Gramado Rio Grande do Sul", "Gramado Serra Gaúcha", "Gramado RS Brasil"] },
      "bonito":            { queries: ["Bonito Mato Grosso do Sul", "Bonito MS Brasil", "Gruta Bonito Brasil"] },
      "natal":             { queries: ["Natal Rio Grande do Norte", "Natal RN Brasil", "Praia Natal Brasil"] },
      "salvador":          { queries: ["Salvador Bahia Pelourinho", "Salvador BA Brasil"] },
      "recife":            { queries: ["Recife Pernambuco", "Recife Antigo Brasil"] },
      "olinda":            { queries: ["Olinda Pernambuco", "Olinda Brasil histórica"] },
      "pipa":              { queries: ["Praia da Pipa Rio Grande do Norte", "Pipa Brasil praia"] },
      // Internacionais comuns — em inglês para resultados melhores
      "paris":             { queries: ["Paris Eiffel Tower", "Paris France skyline"], locale: "en-US" },
      "orlando":           { queries: ["Orlando Florida", "Orlando theme park"], locale: "en-US" },
      "lisboa":            { queries: ["Lisboa Portugal", "Lisbon tram"], locale: "pt-PT" },
      "lisbon":            { queries: ["Lisbon Portugal", "Lisbon tram"], locale: "pt-PT" },
      "santiago":          { queries: ["Santiago Chile", "Santiago Andes"], locale: "es" },
      "cancún":            { queries: ["Cancun Mexico beach", "Cancun resort"], locale: "en-US" },
      "cancun":            { queries: ["Cancun Mexico beach", "Cancun resort"], locale: "en-US" },
      "punta cana":        { queries: ["Punta Cana Dominican Republic", "Punta Cana resort beach"], locale: "en-US" },
      "buenos aires":      { queries: ["Buenos Aires Argentina", "Buenos Aires city"], locale: "es" },
      "miami":             { queries: ["Miami Beach Florida", "Miami skyline"], locale: "en-US" },
      "nova york":         { queries: ["New York City skyline", "Manhattan NYC"], locale: "en-US" },
      "new york":          { queries: ["New York City skyline", "Manhattan NYC"], locale: "en-US" },
      "dubai":             { queries: ["Dubai skyline", "Dubai Burj Khalifa"], locale: "en-US" },
      "roma":              { queries: ["Rome Italy Colosseum", "Rome cityscape"], locale: "en-US" },
      "rome":              { queries: ["Rome Italy Colosseum", "Rome cityscape"], locale: "en-US" },
      "londres":           { queries: ["London UK Big Ben", "London skyline"], locale: "en-US" },
      "london":            { queries: ["London UK Big Ben", "London skyline"], locale: "en-US" },
      "madri":             { queries: ["Madrid Spain", "Madrid Plaza Mayor"], locale: "es" },
      "madrid":            { queries: ["Madrid Spain", "Madrid Plaza Mayor"], locale: "es" },
      "barcelona":         { queries: ["Barcelona Spain Sagrada Familia", "Barcelona beach"], locale: "es" },
      "tóquio":            { queries: ["Tokyo Japan skyline", "Tokyo Shibuya"], locale: "en-US" },
      "tokyo":             { queries: ["Tokyo Japan skyline", "Tokyo Shibuya"], locale: "en-US" },
    };

    // Lista de destinos brasileiros conhecidos para reforçar geografia automaticamente
    const BR_HINTS = [
      "maragogi", "jericoacoara", "fernando de noronha", "porto de galinhas",
      "búzios", "buzios", "florianópolis", "florianopolis", "fortaleza",
      "rio de janeiro", "são paulo", "sao paulo", "ilhabela", "paraty",
      "ouro preto", "morro de são paulo", "chapada", "lençóis", "lencois",
      "alter do chão", "alter do chao", "ubatuba", "trancoso",
      "arraial d'ajuda", "arraial dajuda", "caldas novas",
    ];

    // Decide a lista de queries a tentar, em ordem de prioridade
    const mapped = DESTINATION_MAP[lower];
    const queriesToTry: { q: string; locale: string }[] = [];

    if (mapped) {
      // Destino mapeado: usa SOMENTE as queries específicas (evita "gramado" puro virar grama)
      mapped.queries.forEach((q) => queriesToTry.push({ q, locale: mapped.locale || "pt-BR" }));
    } else {
      const isBR = BR_HINTS.some((h) => lower.includes(h));
      queriesToTry.push({ q: rawQuery, locale: "pt-BR" });
      queriesToTry.push({ q: isBR ? `${rawQuery} Brasil` : `${rawQuery} travel`, locale: isBR ? "pt-BR" : "en-US" });
    }

    // Executa as tentativas e fica com a que trouxe mais fotos
    let data: { photos: PexelsPhoto[]; total_results: number } | null = null;
    for (const attempt of queriesToTry) {
      const res = await tryFetch(attempt.q, attempt.locale);
      if (res && res.photos.length > (data?.photos.length ?? 0)) {
        data = res;
      }
      if (data && data.photos.length >= 8) break;
    }

    if (!data) {
      return new Response(JSON.stringify({ error: "Erro ao buscar fotos" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Filtra resultados irrelevantes: selfies/retratos e TEXTURAS (grama, areia, parede)
    const BAD_TERMS = [
      "selfie", "portrait of woman", "portrait of man", "portrait of a woman",
      "portrait of a man", "model posing", "indoor portrait", "studio shot",
      "close-up of person", "person looking at camera",
    ];
    const TEXTURE_TERMS = [
      "grass texture", "green grass", "lawn", "close-up of grass",
      "blades of grass", "sand texture", "wall texture", "grass background",
      "field of grass", "grassy field close",
    ];
    const isCityQuery = !!mapped || BR_HINTS.some((h) => lower.includes(h));

    const filtered = data.photos.filter((p) => {
      const alt = (p.alt || "").toLowerCase();
      if (BAD_TERMS.some((t) => alt.includes(t))) return false;
      if (isCityQuery && TEXTURE_TERMS.some((t) => alt.includes(t))) return false;
      return true;
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
