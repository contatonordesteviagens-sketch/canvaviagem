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
    const { 
      format, 
      destination, 
      price, 
      highlights, 
      promoName, 
      currencySymbol, 
      duration, 
      primaryColor, 
      secondaryColor,
      variation
    } = body;

    const isStory = format === "story";
    const width = 1080;
    const height = isStory ? 1920 : 1080;
    // Safe zone: footer reserved below this Y
    const safeY = isStory ? 1650 : 900;
    const v = Number(variation) || 1;

    const inputPrimary = primaryColor || "#0C2340";
    const inputSecondary = secondaryColor || "#F59E0B";
    const highlightList = Array.isArray(highlights) ? highlights.join(", ") : String(highlights || "");

    // ============================================================
    // MATHEMATICAL ZONE DEFINITIONS — mutually exclusive per variation
    // These make it STRUCTURALLY IMPOSSIBLE for the LLM to produce
    // the same layout across the 3 batch calls.
    // ============================================================

    // Variation 1 — BOTTOM HEAVY
    // Main content block anchored in the lower 50% of the canvas
    const v1 = {
      archetype: "BOTTOM HEAVY — toda a composição principal deve estar na metade INFERIOR da tela",
      anchorZone: `Y entre ${Math.round(height * 0.5)} e ${safeY}`,
      forbiddenZone: `PROIBIDO posicionar o card/caixa principal com Y < ${Math.round(height * 0.5)}. A metade superior (Y < ${Math.round(height * 0.5)}) só pode ter texto solto (título do destino) ou badge de promoção, NUNCA caixas opacas grandes.`,
      mandatoryFirstElement: `O primeiro elemento do array DEVE ser uma box em Y = ${Math.round(height * 0.52)}, x = 40, width = ${width - 80}, height >= ${Math.round(height * 0.28)}, backgroundColor = "${inputPrimary}" com borderRadius = 24.`,
      pricePosition: `O preço DEVE estar dentro dessa caixa, alinhado à ESQUERDA (textAlign: "left"), com fontSize entre 72 e 96px.`,
    };

    // Variation 2 — LEFT SIDEBAR SPLIT
    // A vertical panel occupies the left column, content on the right floats
    const v2 = {
      archetype: "LEFT SIDEBAR SPLIT — painel vertical estreito na esquerda, conteúdo flutuante na direita",
      anchorZone: `Uma coluna vertical ESQUERDA de x=0 a x=${Math.round(width * 0.38)}, altura total de Y=0 a Y=${safeY}`,
      forbiddenZone: `PROIBIDO criar um card/caixa grande centralizado (x entre 150 e 750 com width > 600). O layout DEVE ser assimétrico: coluna da esquerda + elementos flutuantes na direita.`,
      mandatoryFirstElement: `O primeiro elemento do array DEVE ser uma box em x=0, y=0, width=${Math.round(width * 0.38)}, height=${safeY}, backgroundColor = "${inputPrimary}" (painel lateral completo, sem borderRadius).`,
      pricePosition: `O preço DEVE estar na coluna da DIREITA (x > ${Math.round(width * 0.42)}), textAlign: "right", fontSize entre 80 e 110px.`,
    };

    // Variation 3 — FLOATING CENTER CAPSULE
    // A compact floating capsule/card centered vertically and horizontally
    const v3 = {
      archetype: "FLOATING CENTER CAPSULE — cartão compacto flutuante no centro da tela, extremamente minimalista",
      anchorZone: `Centro da tela: x entre 60 e ${width - 60}, Y entre ${Math.round(height * 0.3)} e ${Math.round(height * 0.72)}`,
      forbiddenZone: `PROIBIDO criar painéis que toquem as bordas laterais (x=0 ou x+width=${width}). PROIBIDO criar elementos com Y > ${Math.round(height * 0.73)}. A composição deve parecer uma peça flutuando no centro sobre a foto.`,
      mandatoryFirstElement: `O primeiro elemento do array DEVE ser uma box de alta transparência em x=${Math.round(width * 0.08)}, y=${Math.round(height * 0.32)}, width=${Math.round(width * 0.84)}, height=${Math.round(height * 0.36)}, backgroundColor = "rgba(${parseInt(inputPrimary.slice(1,3),16)},${parseInt(inputPrimary.slice(3,5),16)},${parseInt(inputPrimary.slice(5,7),16)},0.82)", borderRadius=32.`,
      pricePosition: `O preço DEVE estar centralizado (textAlign: "center") dentro do card, fontSize entre 64 e 88px.`,
    };

    const variantConfig = v === 1 ? v1 : v === 2 ? v2 : v3;

    // ============================================================
    // SYSTEM INSTRUCTION — identity of the model
    // ============================================================
    const systemInstruction = `Você é um Engenheiro de UI/UX sênior especializado em compor coordenadas matemáticas precisas de elementos gráficos em Canvas 2D (dimensões exatas: ${width}x${height}px) para anúncios de viagem premium. 
Sua ÚNICA função é retornar um JSON puro com a chave "elements" contendo um array de objetos do tipo box ou text. 
Você NUNCA repete o mesmo layout se a variação mudar. Você é obcecado em respeitar as zonas de coordenadas proibidas.`;

    // ============================================================
    // USER PROMPT — data-driven with hard coordinate constraints
    // ============================================================
    const promptText = `TAREFA: Gere um layout de anúncio de viagem premium para um canvas ${width}x${height}px.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
DADOS DO PACOTE (OBRIGATÓRIO inserir todos no design):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- Destino: ${destination}
- Preço: ${currencySymbol || "R$"} ${price}
- Período: ${duration}
- Benefícios: ${highlightList}
- Badge/Promoção: ${promoName}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
IDENTIDADE VISUAL (USE EXATAMENTE ESTAS CORES):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- COR PRIMÁRIA (cards, painéis, fundos): ${inputPrimary}
- COR SECUNDÁRIA (badges, preço, destaques): ${inputSecondary}
- Texto sobre fundo escuro: "#FFFFFF"
- Texto sobre fundo claro: "#111111"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🚨 ZONA MORTA — NUNCA ULTRAPASSE:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- PROIBIDO qualquer elemento com Y > ${safeY}px. Essa área é reservada exclusivamente para o rodapé de branding que será sobreposto depois.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎯 VARIAÇÃO ${v} DE 3 — ARQUÉTIPO: ${variantConfig.archetype}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

ZONA PERMITIDA: ${variantConfig.anchorZone}

${variantConfig.forbiddenZone}

ELEMENTO ÂNCORA OBRIGATÓRIO (PRIMEIRO DO ARRAY):
${variantConfig.mandatoryFirstElement}

POSICIONAMENTO DO PREÇO:
${variantConfig.pricePosition}

REGRAS RESTANTES DO LAYOUT:
1. O badge da promoção ("${promoName}") DEVE ser uma box com backgroundColor="${inputSecondary}" e borderRadius entre 20 e 40.
2. O título do destino ("${destination}") deve ter fontSize entre 52 e 80px, fontWeight "900".
3. Os benefícios (${highlightList}) devem ser textos individuais separados com fontSize entre 24 e 32px.
4. Todos os elementos text DEVEM ter campo "width" definido para controle do text wrap.
5. NÃO use x ou y negativos. NÃO ultrapasse x + width > ${width} ou y + height > ${safeY}.
6. Mínimo de 6 elementos, máximo de 14 elementos no array.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FORMATO DE SAÍDA — JSON PURO (sem markdown, sem explicações):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
{
  "elements": [
    { "type": "box", "x": number, "y": number, "width": number, "height": number, "backgroundColor": string, "borderRadius": number },
    { "type": "text", "x": number, "y": number, "width": number, "height": number, "content": string, "color": string, "fontSize": number, "fontFamily": "Inter", "fontWeight": "900"|"bold"|"normal", "textAlign": "left"|"center"|"right" }
  ]
}`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: systemInstruction }] },
        contents: [{ role: "user", parts: [{ text: promptText }] }],
        generationConfig: {
          temperature: 1.0,
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

    // Robust Bracket-Matching Extractor — survives markdown noise, trailing text, invalid escapes
    const extractJSON = (str: string): any => {
      // Sanitize invisible control chars that break JSON.parse
      const sanitized = str.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "");
      const firstOpen = sanitized.indexOf("{");
      if (firstOpen === -1) throw new Error("Não foi encontrado início de objeto JSON na resposta.");
      
      let count = 0;
      for (let i = firstOpen; i < sanitized.length; i++) {
        if (sanitized[i] === "{") {
          count++;
        } else if (sanitized[i] === "}") {
          count--;
          if (count === 0) {
            const candidate = sanitized.substring(firstOpen, i + 1);
            try {
              return JSON.parse(candidate);
            } catch (_e) {
              // Try repairing trailing commas before closing bracket/brace
              try {
                const repaired = candidate.replace(/,\s*([}\]])/g, "$1");
                return JSON.parse(repaired);
              } catch (_e2) {
                // Continue scanning for next balanced block
              }
            }
          }
        }
      }
      throw new Error("Formato JSON corrompido ou chaves desbalanceadas.");
    };

    const jsonOutput = extractJSON(rawText);

    if (!jsonOutput || !Array.isArray(jsonOutput.elements) || jsonOutput.elements.length === 0) {
      throw new Error("JSON de layout dinâmico inválido ou vazio.");
    }

    // Log chosen variation for observability (visible in Supabase function logs)
    console.log(`[IA_PURA] variation=${v} format=${format} elements=${jsonOutput.elements.length} destination="${destination}"`);

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
