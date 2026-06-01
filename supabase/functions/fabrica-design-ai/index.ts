import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { verifyFabricaEliteAccess } from "../_shared/fabricaAccess.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const GEMINI_API_KEY = Deno.env.get("IA_PURA_GEMINI_KEY") || Deno.env.get("USER_GEMINI_API_KEY");

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const access = await verifyFabricaEliteAccess(req, corsHeaders);
    if (!access.ok) return access.response;

    if (!GEMINI_API_KEY) {
      return new Response(JSON.stringify({ error: "Chave IA Pura não configurada no servidor. Adicione IA_PURA_GEMINI_KEY em Secrets." }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const { format, destination, price, highlights, promoName, currencySymbol, duration, primaryColor, secondaryColor } = body;
    const isStory = format === "story";

    const promptText = `Analise os dados do pacote de viagem abaixo e selecione qual dos 8 Estilos Premium de design é o mais adequado e elegante para este anúncio:

DADOS DO ANÚNCIO:
- Título/Destino: ${destination}
- Preço: ${currencySymbol} ${price}
- Duração/Período: ${duration}
- Destaques/Inclusos: ${Array.isArray(highlights) ? highlights.join(", ") : ""}
- Nome da Promoção: ${promoName}

OS 8 ESTILOS PREMIUM DISPONÍVEIS:

Estilo A: "New York Editorial" (Foco: Elegância com Serifa clássica)
- Ideal para hotéis urbanos sofisticados, resorts tradicionais e destinos clássicos.

Estilo B: "Caribe Resort" (Foco: Card translúcido lateral para benefícios e badge de oferta destacado)
- Ideal para resorts de praia, all-inclusive e pacotes com fotos vibrantes.

Estilo C: "Quiet Luxury Safari" (Foco: Minimalismo extremo, logo centralizado no topo, fontes finas serifadas e amplo espaço de respiro)
- Ideal para ecoturismo, safáris, viagens de lua de mel e experiências exclusivas.

Estilo D: "Jaecoo / Jeep Premium" (Foco: Bloco na base com colunas horizontais de benefícios e destaque comercial)
- Ideal para aluguel de carros, destinos de aventura e apelo comercial.

Estilo E: "Circuito Central Card" (Foco: Card flutuante centralizado na metade superior)
- Ideal para circuitos rodoviários ou europeus.

Estilo F: "Vertical Sidebar" (Foco: Faixa vertical amarela/secundária no canto esquerdo com o logo no topo)
- Ideal para cruzeiros, resorts náuticos ou anúncios institucionais de marca forte.

Estilo G: "Column Split" (Foco: Divisão vertical exata de tela, esquerda sólida com destinos e direita exibindo a foto)
- Altamente recomendado sempre que o Título/Destino contiver palavras como "Combo", "Roteiro", "Circuito" ou se listar múltiplos destinos (ex: "Combo 3 Praias", "Roteiro do Cangaço").

Estilo H: "Header & Bottom Card" (Foco: Cabeçalho estreito no topo e grande bloco detalhado na base)
- Ideal para ofertas de voos ou pacotes aéreos rápidos.

Retorne EXCLUSIVAMENTE um objeto JSON válido com o estilo selecionado e a justificativa:
{
  "style": "A" | "B" | "C" | "D" | "E" | "F" | "G" | "H",
  "justification": "Uma frase explicando por que este estilo combina perfeitamente com os dados do anúncio."
}
Retorne APENAS o JSON puro. Não envolva em markdown. Não escreva explicações fora do JSON.`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        systemInstruction: {
          parts: [{ text: `Você é um diretor de arte sênior de agências de turismo e luxo de altíssimo padrão. Sua única função é receber os dados do anúncio e escolher de forma inteligente qual dos 8 Estilos Premium pré-definidos (de A a H) é o esteticamente mais adequado para compor a imagem de fundo.` }],
        },
        contents: [
          { role: "user", parts: [{ text: promptText }] },
        ],
        generationConfig: {
          temperature: 0.2,
          responseMimeType: "application/json",
        },
      }),
    });

    if (response.status === 429) {
      return new Response(JSON.stringify({ error: "Limite de requisições atingido. Tente novamente em instantes." }), {
        status: 429,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (response.status === 402) {
      return new Response(JSON.stringify({ error: "Créditos da API de IA esgotados. Verifique a cobrança/limite da sua chave." }), {
        status: 402,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (response.status === 400 || response.status === 401 || response.status === 403) {
      return new Response(JSON.stringify({ error: "Chave IA Pura inválida, sem permissão ou com API desativada." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!response.ok) {
      const errTxt = await response.text().catch(() => "");
      console.error("Gemini API error:", response.status, errTxt);
      return new Response(JSON.stringify({ error: "Falha na API de IA" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const rawText: string = data?.candidates?.[0]?.content?.parts?.map((part: { text?: string }) => part.text || "").join("") ?? "";
    if (!rawText) throw new Error("IA não retornou conteúdo.");

    const cleaned = rawText.replace(/```json/gi, "").replace(/```/g, "").trim();
    const start = cleaned.indexOf("{");
    const end = cleaned.lastIndexOf("}");
    const jsonOutput = JSON.parse(cleaned.substring(start, end + 1));

    if (!jsonOutput || !jsonOutput.style) {
      throw new Error("JSON de layout inválido.");
    }

    return new Response(JSON.stringify({ provider: "secure_gemini", layout: jsonOutput }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e: any) {
    console.error("fabrica-design-ai error:", e);
    return new Response(JSON.stringify({ error: e?.message || "Erro desconhecido" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
