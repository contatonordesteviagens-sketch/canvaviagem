// Edge function: fabrica-search-photos
// Busca fotos REAIS de destinos turísticos.
// Estratégia: Wikimedia Commons (fotos geo-tagueadas reais) + Pexels (complemento).
// Wikimedia é a fonte primária porque tem fotos enciclopédicas dos destinos
// (ex: Maragogi, Fernando de Noronha, Gramado têm artigos com galerias reais).
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PhotoOut {
  id: string;
  url: string;
  thumb: string;
  width: number;
  height: number;
  alt: string;
  source: "wikimedia" | "pexels";
}

interface SearchBody {
  query: string;
  orientation?: "landscape" | "portrait" | "square";
  perPage?: number;
}

// =====================================================================
// Mapeamento de destinos: aliases (palavras de busca) e nome do artigo
// na Wikipedia em português, que dá acesso direto às fotos do lugar.
// =====================================================================
const DESTINATION_MAP: Record<
  string,
  { wikiTitles: string[]; pexelsQueries: string[]; locale: string }
> = {
  // BR — ambíguos / específicos
  "maragogi":          { wikiTitles: ["Maragogi"],                                pexelsQueries: ["Maragogi Alagoas", "Maragogi Brazil beach"],     locale: "pt-BR" },
  "gramado":           { wikiTitles: ["Gramado", "Gramado (Rio Grande do Sul)"],  pexelsQueries: ["Gramado Rio Grande do Sul", "Gramado RS"],       locale: "pt-BR" },
  "bonito":            { wikiTitles: ["Bonito (Mato Grosso do Sul)"],             pexelsQueries: ["Bonito Mato Grosso do Sul"],                     locale: "pt-BR" },
  "natal":             { wikiTitles: ["Natal (Rio Grande do Norte)"],             pexelsQueries: ["Natal Rio Grande do Norte"],                     locale: "pt-BR" },
  "fernando de noronha": { wikiTitles: ["Fernando de Noronha"],                   pexelsQueries: ["Fernando de Noronha Brazil"],                    locale: "pt-BR" },
  "noronha":           { wikiTitles: ["Fernando de Noronha"],                     pexelsQueries: ["Fernando de Noronha Brazil"],                    locale: "pt-BR" },
  "jericoacoara":      { wikiTitles: ["Jericoacoara"],                            pexelsQueries: ["Jericoacoara Ceará"],                            locale: "pt-BR" },
  "porto de galinhas": { wikiTitles: ["Porto de Galinhas"],                       pexelsQueries: ["Porto de Galinhas Pernambuco"],                  locale: "pt-BR" },
  "búzios":            { wikiTitles: ["Armação dos Búzios"],                      pexelsQueries: ["Buzios Brazil beach"],                           locale: "pt-BR" },
  "buzios":            { wikiTitles: ["Armação dos Búzios"],                      pexelsQueries: ["Buzios Brazil beach"],                           locale: "pt-BR" },
  "salvador":          { wikiTitles: ["Salvador (Bahia)"],                        pexelsQueries: ["Salvador Bahia Pelourinho"],                     locale: "pt-BR" },
  "recife":            { wikiTitles: ["Recife"],                                  pexelsQueries: ["Recife Pernambuco"],                             locale: "pt-BR" },
  "olinda":            { wikiTitles: ["Olinda"],                                  pexelsQueries: ["Olinda Pernambuco"],                             locale: "pt-BR" },
  "fortaleza":         { wikiTitles: ["Fortaleza"],                               pexelsQueries: ["Fortaleza Ceará beach"],                         locale: "pt-BR" },
  "rio de janeiro":    { wikiTitles: ["Rio de Janeiro"],                          pexelsQueries: ["Rio de Janeiro Brazil"],                         locale: "pt-BR" },
  "florianópolis":     { wikiTitles: ["Florianópolis"],                           pexelsQueries: ["Florianopolis Santa Catarina"],                  locale: "pt-BR" },
  "florianopolis":     { wikiTitles: ["Florianópolis"],                           pexelsQueries: ["Florianopolis Brazil"],                          locale: "pt-BR" },
  "pipa":              { wikiTitles: ["Praia da Pipa"],                           pexelsQueries: ["Praia da Pipa"],                                 locale: "pt-BR" },
  "morro de são paulo":{ wikiTitles: ["Morro de São Paulo"],                      pexelsQueries: ["Morro de São Paulo Bahia"],                      locale: "pt-BR" },
  "trancoso":          { wikiTitles: ["Trancoso (Porto Seguro)"],                 pexelsQueries: ["Trancoso Bahia"],                                locale: "pt-BR" },
  "alter do chão":     { wikiTitles: ["Alter do Chão"],                           pexelsQueries: ["Alter do Chão Pará"],                            locale: "pt-BR" },
  "alter do chao":     { wikiTitles: ["Alter do Chão"],                           pexelsQueries: ["Alter do Chão Pará"],                            locale: "pt-BR" },
  "ilhabela":          { wikiTitles: ["Ilhabela"],                                pexelsQueries: ["Ilhabela São Paulo"],                            locale: "pt-BR" },
  "paraty":            { wikiTitles: ["Paraty"],                                  pexelsQueries: ["Paraty Rio de Janeiro"],                         locale: "pt-BR" },
  "ouro preto":        { wikiTitles: ["Ouro Preto"],                              pexelsQueries: ["Ouro Preto Minas Gerais"],                       locale: "pt-BR" },
  "ubatuba":           { wikiTitles: ["Ubatuba"],                                 pexelsQueries: ["Ubatuba São Paulo"],                             locale: "pt-BR" },
  "caldas novas":      { wikiTitles: ["Caldas Novas"],                            pexelsQueries: ["Caldas Novas Goiás"],                            locale: "pt-BR" },
  "chapada":           { wikiTitles: ["Chapada Diamantina"],                      pexelsQueries: ["Chapada Diamantina"],                            locale: "pt-BR" },

  // Internacionais
  "paris":        { wikiTitles: ["Paris"],            pexelsQueries: ["Paris Eiffel Tower"],          locale: "en-US" },
  "orlando":      { wikiTitles: ["Orlando"],          pexelsQueries: ["Orlando Florida"],             locale: "en-US" },
  "lisboa":       { wikiTitles: ["Lisboa"],           pexelsQueries: ["Lisbon Portugal"],             locale: "pt-PT" },
  "lisbon":       { wikiTitles: ["Lisboa"],           pexelsQueries: ["Lisbon Portugal"],             locale: "pt-PT" },
  "santiago":     { wikiTitles: ["Santiago"],         pexelsQueries: ["Santiago Chile"],              locale: "es" },
  "cancún":       { wikiTitles: ["Cancún"],           pexelsQueries: ["Cancun Mexico beach"],         locale: "en-US" },
  "cancun":       { wikiTitles: ["Cancún"],           pexelsQueries: ["Cancun Mexico beach"],         locale: "en-US" },
  "punta cana":   { wikiTitles: ["Punta Cana"],       pexelsQueries: ["Punta Cana Dominican Republic"], locale: "en-US" },
  "buenos aires": { wikiTitles: ["Buenos Aires"],     pexelsQueries: ["Buenos Aires Argentina"],      locale: "es" },
  "miami":        { wikiTitles: ["Miami"],            pexelsQueries: ["Miami Beach Florida"],         locale: "en-US" },
  "nova york":    { wikiTitles: ["Nova Iorque"],      pexelsQueries: ["New York City skyline"],       locale: "en-US" },
  "new york":     { wikiTitles: ["Nova Iorque"],      pexelsQueries: ["New York City skyline"],       locale: "en-US" },
  "dubai":        { wikiTitles: ["Dubai"],            pexelsQueries: ["Dubai skyline"],               locale: "en-US" },
  "roma":         { wikiTitles: ["Roma"],             pexelsQueries: ["Rome Italy Colosseum"],        locale: "en-US" },
  "rome":         { wikiTitles: ["Roma"],             pexelsQueries: ["Rome Italy Colosseum"],        locale: "en-US" },
  "londres":      { wikiTitles: ["Londres"],          pexelsQueries: ["London Big Ben"],              locale: "en-US" },
  "london":       { wikiTitles: ["Londres"],          pexelsQueries: ["London Big Ben"],              locale: "en-US" },
  "madri":        { wikiTitles: ["Madrid"],           pexelsQueries: ["Madrid Spain"],                locale: "es" },
  "madrid":       { wikiTitles: ["Madrid"],           pexelsQueries: ["Madrid Spain"],                locale: "es" },
  "barcelona":    { wikiTitles: ["Barcelona"],        pexelsQueries: ["Barcelona Sagrada Familia"],   locale: "es" },
  "tóquio":       { wikiTitles: ["Tóquio"],           pexelsQueries: ["Tokyo Japan"],                 locale: "en-US" },
  "tokyo":        { wikiTitles: ["Tóquio"],           pexelsQueries: ["Tokyo Japan"],                 locale: "en-US" },
};

// =====================================================================
// Wikimedia Commons: pega TODAS as imagens de uma página da Wikipedia (PT)
// Endpoint público, sem API key.
// =====================================================================
async function fetchWikimediaImages(wikiTitle: string, perPage: number): Promise<PhotoOut[]> {
  try {
    const url = new URL("https://pt.wikipedia.org/w/api.php");
    url.searchParams.set("action", "query");
    url.searchParams.set("format", "json");
    url.searchParams.set("origin", "*");
    url.searchParams.set("prop", "images");
    url.searchParams.set("titles", wikiTitle);
    url.searchParams.set("imlimit", "50");

    const res = await fetch(url.toString());
    if (!res.ok) return [];
    const data = await res.json();
    const pages = data?.query?.pages || {};
    const imageNames: string[] = [];
    for (const pid of Object.keys(pages)) {
      const imgs = pages[pid]?.images || [];
      for (const i of imgs) {
        const t = i.title as string;
        // Filtra ícones, logos, mapas (queremos fotos reais do destino)
        if (!t) continue;
        const lower = t.toLowerCase();
        if (lower.endsWith(".svg")) continue;
        if (lower.includes("flag") || lower.includes("bandeira")) continue;
        if (lower.includes("brasão") || lower.includes("brasao") || lower.includes("coat_of_arms")) continue;
        if (lower.includes("logo")) continue;
        if (lower.includes("map") || lower.includes("mapa")) continue;
        if (lower.includes("commons-logo") || lower.includes("wikipedia")) continue;
        if (lower.includes(".ogg") || lower.includes(".ogv") || lower.includes(".webm")) continue;
        imageNames.push(t);
      }
    }

    if (imageNames.length === 0) return [];

    // Busca URLs reais das imagens via imageinfo (em lote)
    const batch = imageNames.slice(0, Math.min(perPage * 2, 30));
    const u2 = new URL("https://commons.wikimedia.org/w/api.php");
    u2.searchParams.set("action", "query");
    u2.searchParams.set("format", "json");
    u2.searchParams.set("origin", "*");
    u2.searchParams.set("prop", "imageinfo");
    u2.searchParams.set("iiprop", "url|size|mime");
    u2.searchParams.set("iiurlwidth", "1200");
    u2.searchParams.set("titles", batch.join("|"));

    const r2 = await fetch(u2.toString());
    if (!r2.ok) return [];
    const d2 = await r2.json();
    const pages2 = d2?.query?.pages || {};
    const out: PhotoOut[] = [];
    for (const pid of Object.keys(pages2)) {
      const p = pages2[pid];
      const info = p?.imageinfo?.[0];
      if (!info?.url) continue;
      const mime = (info.mime || "").toLowerCase();
      if (!mime.startsWith("image/")) continue;
      const w = Number(info.thumbwidth || info.width || 1200);
      const h = Number(info.thumbheight || info.height || 800);
      // Descarta imagens muito pequenas ou em formato estranho
      if (w < 600 || h < 400) continue;
      out.push({
        id: `wiki-${pid}`,
        url: info.thumburl || info.url,
        thumb: info.thumburl || info.url,
        width: w,
        height: h,
        alt: (p.title || "").replace(/^File:/i, "").replace(/\.[^.]+$/, ""),
        source: "wikimedia",
      });
      if (out.length >= perPage) break;
    }
    return out;
  } catch (e) {
    console.error("wikimedia error:", e);
    return [];
  }
}

// =====================================================================
// Pexels: complemento (banco maior, mas menos preciso para destinos BR)
// =====================================================================
async function fetchPexels(
  apiKey: string,
  query: string,
  locale: string,
  perPage: number,
  orientation: string,
): Promise<PhotoOut[]> {
  try {
    const params = new URLSearchParams({
      query,
      per_page: String(perPage),
      orientation,
      locale,
    });
    const r = await fetch(`https://api.pexels.com/v1/search?${params}`, {
      headers: { Authorization: apiKey },
    });
    if (!r.ok) return [];
    const data = await r.json();
    return (data.photos || []).map((p: any) => ({
      id: `pexels-${p.id}`,
      url: p.src.large2x,
      thumb: p.src.medium,
      width: p.width,
      height: p.height,
      alt: p.alt || "",
      source: "pexels" as const,
    }));
  } catch (e) {
    console.error("pexels error:", e);
    return [];
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const PEXELS_API_KEY = Deno.env.get("PEXELS_API_KEY");
    const body = (await req.json()) as SearchBody;
    if (!body.query || body.query.trim().length < 2) {
      return new Response(JSON.stringify({ error: "Query é obrigatória" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const rawQuery = body.query.trim();
    const lower = rawQuery.toLowerCase();
    const perPage = Math.min(body.perPage || 12, 30);
    const orientation = body.orientation || "portrait";

    const mapped = DESTINATION_MAP[lower];

    // 1) Wikimedia primeiro (fotos REAIS do destino)
    const allPhotos: PhotoOut[] = [];
    const wikiTitles = mapped?.wikiTitles ?? [rawQuery];
    for (const title of wikiTitles) {
      const wikiPhotos = await fetchWikimediaImages(title, perPage);
      allPhotos.push(...wikiPhotos);
      if (allPhotos.length >= perPage) break;
    }

    // 2) Pexels para completar até perPage
    if (allPhotos.length < perPage && PEXELS_API_KEY) {
      const pexelsQueries = mapped?.pexelsQueries ?? [rawQuery];
      const pexelsLocale = mapped?.locale ?? "pt-BR";
      for (const q of pexelsQueries) {
        const need = perPage - allPhotos.length;
        if (need <= 0) break;
        const pexels = await fetchPexels(PEXELS_API_KEY, q, pexelsLocale, need, orientation);

        // Filtros anti-lixo Pexels (cachorro, comida, frutas, retratos, texturas)
        const BAD_TERMS = [
          "selfie", "portrait of", "model posing", "studio shot",
          "close-up of person", "puppy", "dog", "cat", "kitten",
          "strawberry", "banana", "fruit", "food on plate", "tacos",
          "pizza", "burger", "salad", "grass texture", "green grass",
          "lawn", "blades of grass", "grass background",
        ];
        const cleanPexels = pexels.filter((p) => {
          const a = p.alt.toLowerCase();
          return !BAD_TERMS.some((t) => a.includes(t));
        });
        allPhotos.push(...cleanPexels);
      }
    }

    // Dedup por URL
    const seen = new Set<string>();
    const final = allPhotos.filter((p) => {
      if (seen.has(p.url)) return false;
      seen.add(p.url);
      return true;
    }).slice(0, perPage);

    return new Response(JSON.stringify({ photos: final }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("fabrica-search-photos error:", err);
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "Erro inesperado" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
