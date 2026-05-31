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

    const promptText = `Crie um layout moderno e de altíssima conversão de acordo com um dos 8 Estilos Premium mapeados de referências de marcas famosas de turismo e automóveis.
Destino/Título do Pacote: ${destination}
Preço: ${currencySymbol} ${price}
Duração: ${duration}
Destaques: ${Array.isArray(highlights) ? highlights.join(", ") : ""}
Promoção: ${promoName}

O formato do canvas é ${isStory ? "1080x1920" : "1080x1080"}.

CORES EXATAS DO USUÁRIO (Obrigatório usar estritamente):
- Cor Primária: ${primaryColor || "#0c2340"}
- Cor Secundária: ${secondaryColor || "#FCD34D"}

REGRAS DE OURO DOS 8 ESTILOS PREMIUM:
Escolha de forma inteligente qual destes 8 estilos combina melhor com as informações fornecidas e gere as coordenadas exatas:

Estilo A: "New York Editorial" (Elegância com Serifa)
- Textos centralizados com fontes elegantes de Serifa (ex: 'Georgia' ou 'Playfair Display'). Título gigante centralizado (Y: ${isStory ? "450" : "250"}).
- Uma pílula de preço (type 'box') dourada/secundária (${secondaryColor || "#FCD34D"}) centralizada logo abaixo do título contendo o valor em texto escuro.
- Um botão vazado (type 'box' com borderColor="${secondaryColor || "#FCD34D"}", borderWidth=3) na base centralizado contendo "VER PREÇOS AGORA" ou similar.

Estilo B: "Caribe Resort" (Card lateral de benefícios + Destaque geométrico)
- Uma grande caixa translúcida à direita (type 'box', X=${isStory ? "540" : "600"}, Y=${isStory ? "300" : "200"}, width=480, height=${isStory ? "1200" : "700"}, backgroundColor="rgba(255,255,255,0.92)", borderRadius=24) contendo os benefícios listados.
- Um badge de desconto massivo à esquerda (type 'box', X=60, Y=${isStory ? "400" : "300"}, width=400, height=180, backgroundColor="${primaryColor || "#0c2340"}") contendo o preço ou "45% OFF".

Estilo C: "Quiet Luxury Safari" (Minimalismo extremo e sofisticação)
- Logo centralizada no topo. Textos centralizados pequenos com amplo respiro visual.
- Fonte serifada e itálica leve, convidativa: "Sua história começa aqui..." ou "Every moment, unforgettable".

Estilo D: "Jaecoo / Jeep Premium" (Bloco de impacto na base + Destaque inclinado)
- Bloco na base (type 'box', X=40, Y=${isStory ? "1200" : "700"}, width=1000, height=${isStory ? "450" : "280"}, backgroundColor="rgba(0,0,0,0.85)") contendo colunas de benefícios em texto (ex: "5 ANOS SEM JUROS + 7 ANOS DE GARANTIA").

Estilo E: "Circuito Central Card" (Inspirado em Portugal)
- Uma grande caixa centralizada flutuante na metade superior (type 'box', X=80, Y=150, width=920, height=800, backgroundColor="${primaryColor || "#0000D8"}", borderRadius=40) contendo o título do pacote, destaques, preço ("12x sem juros" em badge amarelo) e preço gigante.
- O Pix (type 'box', X=120, Y=870, width=840, height=80, backgroundColor="${secondaryColor || "#FCD34D"}") acoplado à base do card.

Estilo F: "Vertical Sidebar" (Inspirado em Cruzeiros CVC)
- Uma barra vertical sólida no canto esquerdo da tela (type 'box', X=0, Y=0, width=${isStory ? "200" : "150"}, height=${isStory ? "1920" : "1080"}, backgroundColor="${secondaryColor || "#FCD34D"}") contendo o logo no topo e um texto vertical. O restante da imagem de fundo exibe o título e card de parcelamento centralizados.

Estilo G: "Column Split" (Inspirado em Enseada Combo)
- Divisão vertical: metade esquerda (40% de largura) com fundo sólido escuro (type 'box', X=0, Y=0, width=${isStory ? "440" : "380"}, height=${isStory ? "1920" : "1080"}, backgroundColor="${primaryColor || "#0c2340"}") contendo o título (ex: "Combo 3 Praias"), bullets de benefícios com checkmarks e o card de preço na base. Metade direita mostra a foto.

Estilo H: "Header & Bottom Card" (Inspirado em Decolar Cancún)
- Um cabeçalho estreito no topo (type 'box', X=60, Y=80, width=960, height=100, backgroundColor="${primaryColor || "#0c2340"}", borderRadius=50) contendo chamadas da marca.
- Uma grande caixa no terço inferior (type 'box', X=40, Y=${isStory ? "1100" : "680"}, width=1000, height=${isStory ? "580" : "320"}, backgroundColor="rgba(0,0,0,0.85)", borderRadius=32) dividida entre preço em bloco e detalhes.

Retorne EXCLUSIVAMENTE um JSON válido com a estrutura:
{
  "elements": [
    // elementos geométricos (box) e tipográficos (text) perfeitamente posicionados sem colisão
  ]
}
Retorne APENAS o JSON puro. Não envolva em markdown. Não escreva explicações.`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        systemInstruction: {
          parts: [{ text: `Você é um designer de layouts publicitários profissional de agências de turismo e luxo de altíssimo padrão. Sua única função é retornar um objeto JSON válido descrevendo os elementos de design seguindo estritamente um dos 8 estilos premium descritos pelo usuário.
REGRAS CRÍTICAS DE CORES E CONTRASTE:
1. Você DEVE usar estritamente as cores fornecidas pelo usuário:
   - Cor Primária: ${primaryColor || "#0C2340"}.
   - Cor Secundária: ${secondaryColor || "#FCD34D"}.
2. É expressamente proibido inventar cores alheias (como vermelho, azul puro, verde) a menos que fornecidas nas variáveis.
3. Se gerar um botão vazado (stroke/outline), utilize a propriedade 'borderColor' (ex: "${secondaryColor || "#FCD34D"}") e 'borderWidth' (ex: 3), sem preencher 'backgroundColor'.

REGRAS DE ALINHAMENTO E COMPOSIÇÃO:
1. NUNCA sobreponha textos ou caixas. Calcule a altura das fontes e dê espaçamento generoso.
2. No Estilo New York Editorial (Estilo A), use fontFamily: "Playfair Display" ou "Georgia" para títulos e subtítulos elegantes.
3. No Estilo Caribe (Estilo B) ou Decolar (Estilo H), organize bem os cards e preços flutuantes.
4. No Estilo Quiet Luxury Safari (Estilo C), mantenha tudo pequeno, centralizado, nobre, com amplo espaço livre.
5. No Estilo Combo Split (Estilo G), posicione o fundo sólido na esquerda e alinhe a listagem com os destinos e preços de forma super organizada.` }],
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

    if (!jsonOutput || !Array.isArray(jsonOutput.elements)) {
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
