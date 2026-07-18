// Extração estruturada de dados de agência de viagens a partir de texto livre.
// Usa Lovable AI Gateway (Gemini 2.5 Flash) — sem chaves externas.

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const SYSTEM_PROMPT = `Você é um extrator de informações de negócios para agências de viagens brasileiras.
Receberá um texto (geralmente transcrição de áudio falado pelo dono da agência) e deve retornar APENAS um JSON estritamente no formato:
{
  "agencyName": "string",
  "niche": "string",
  "publicoAlvo": "string",
  "estiloMarca": "string",
  "destinos": ["string"],
  "packages": [
    {
      "title": "string",
      "description": "string",
      "price": "string",
      "badge": "string",
      "segment": "passeio|pacote|sob-medida|grupo|cruzeiro|aventura|religioso|corporativo|outro",
      "subtitle": "string",
      "longDescription": "string",
      "travelDates": "string",
      "duration": "string",
      "departureLocation": "string",
      "meetingPoint": "string",
      "accommodation": "string",
      "priceDetails": "string",
      "paymentTerms": "string",
      "availability": "disponivel|ultimas-vagas|saida-confirmada|sob-consulta|lista-de-espera|esgotado",
      "highlights": ["string"],
      "included": ["string"],
      "notIncluded": ["string"],
      "itinerary": ["string"],
      "requirements": ["string"],
      "documents": ["string"],
      "accessibility": ["string"],
      "cancellationPolicy": "string",
      "importantNotes": "string",
      "faq": [{ "question": "string", "answer": "string" }]
    }
  ],
  "diferenciais": ["string"]
}
Regras:
- Se o usuário citar destinos (ex: Jericoacoara, Canoa Quebrada, Rio de Janeiro), liste-os em "destinos" E gere pelo menos um pacote sugerido por destino em "packages".
- Use português brasileiro natural.
- Se faltar informação, retorne string vazia ou array vazio — NUNCA invente um nome de agência.
- "price" pode ser estimativa formatada (ex: "R$ 1.890,00") ou "Consulte".
- Extraia detalhes somente quando forem ditos ou claramente implicados no texto. NÃO invente datas, inclusões, hotel, documentos, políticas ou condições.
- Separe listas faladas nos arrays corretos. Preserve valores, datas e condições exatamente como o usuário informou.
- Campos detalhados são opcionais; use string vazia ou array vazio quando ausentes.
- NÃO use blocos de markdown. Retorne JSON puro.`;

function tryParseJson(text: string): any | null {
  try { return JSON.parse(text); } catch {}
  const cleaned = text.trim().replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```$/i, "").trim();
  try { return JSON.parse(cleaned); } catch {}
  const match = cleaned.match(/\{[\s\S]*\}/);
  if (match) { try { return JSON.parse(match[0]); } catch {} }
  return null;
}

const PACKAGE_SEGMENTS = new Set([
  "passeio", "pacote", "sob-medida", "grupo", "cruzeiro",
  "aventura", "religioso", "corporativo", "outro",
]);
const PACKAGE_AVAILABILITY = new Set([
  "disponivel", "ultimas-vagas", "saida-confirmada",
  "sob-consulta", "lista-de-espera", "esgotado",
]);

function stringList(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.map((item) => String(item || "").trim()).filter(Boolean);
}

function optionalString(value: unknown): string {
  return String(value || "").trim();
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(
        JSON.stringify({ error: "LOVABLE_API_KEY not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { text } = await req.json().catch(() => ({ text: "" }));
    if (!text || typeof text !== "string" || text.trim().length < 5) {
      return new Response(
        JSON.stringify({ error: "Texto vazio ou muito curto." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const aiResp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: text },
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (!aiResp.ok) {
      const detail = await aiResp.text().catch(() => "");
      console.error("Gemini upstream error", aiResp.status, detail);
      if (aiResp.status === 402) {
        return new Response(
          JSON.stringify({ error: "Créditos da IA esgotados. Recarregue no Lovable." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (aiResp.status === 429) {
        return new Response(
          JSON.stringify({ error: "Limite de requisições atingido. Tente em alguns segundos." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      return new Response(
        JSON.stringify({ error: `Falha na IA: ${aiResp.status}`, detail }),
        { status: aiResp.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const json = await aiResp.json();
    const raw = json?.choices?.[0]?.message?.content || "";
    const parsed = tryParseJson(raw);

    if (!parsed) {
      console.error("Could not parse extracted JSON:", raw);
      return new Response(
        JSON.stringify({
          agencyName: "",
          niche: "",
          publicoAlvo: "",
          estiloMarca: "",
          destinos: [],
          packages: [],
          diferenciais: [],
          _warning: "IA não retornou JSON válido. Reformule o áudio.",
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Normaliza schema
    const safe = {
      agencyName: String(parsed.agencyName || ""),
      niche: String(parsed.niche || ""),
      publicoAlvo: String(parsed.publicoAlvo || ""),
      estiloMarca: String(parsed.estiloMarca || ""),
      destinos: Array.isArray(parsed.destinos) ? parsed.destinos.map(String) : [],
      packages: Array.isArray(parsed.packages) ? parsed.packages.map((p: any) => ({
        title: optionalString(p?.title),
        description: optionalString(p?.description),
        price: optionalString(p?.price) || "Consulte",
        badge: optionalString(p?.badge),
        segment: PACKAGE_SEGMENTS.has(p?.segment) ? p.segment : "",
        subtitle: optionalString(p?.subtitle),
        longDescription: optionalString(p?.longDescription),
        travelDates: optionalString(p?.travelDates),
        duration: optionalString(p?.duration),
        departureLocation: optionalString(p?.departureLocation),
        meetingPoint: optionalString(p?.meetingPoint),
        accommodation: optionalString(p?.accommodation),
        priceDetails: optionalString(p?.priceDetails),
        paymentTerms: optionalString(p?.paymentTerms),
        availability: PACKAGE_AVAILABILITY.has(p?.availability) ? p.availability : "",
        highlights: stringList(p?.highlights),
        included: stringList(p?.included),
        notIncluded: stringList(p?.notIncluded),
        itinerary: stringList(p?.itinerary),
        requirements: stringList(p?.requirements),
        documents: stringList(p?.documents),
        accessibility: stringList(p?.accessibility),
        cancellationPolicy: optionalString(p?.cancellationPolicy),
        importantNotes: optionalString(p?.importantNotes),
        faq: Array.isArray(p?.faq)
          ? p.faq
              .map((item: any) => ({
                question: optionalString(item?.question),
                answer: optionalString(item?.answer),
              }))
              .filter((item: { question: string; answer: string }) => item.question || item.answer)
          : [],
      })) : [],
      diferenciais: Array.isArray(parsed.diferenciais) ? parsed.diferenciais.map(String) : [],
    };

    return new Response(JSON.stringify(safe), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("fabrica-extract-business-info-v2 error", err);
    return new Response(
      JSON.stringify({ error: (err as Error).message || "Erro inesperado" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
