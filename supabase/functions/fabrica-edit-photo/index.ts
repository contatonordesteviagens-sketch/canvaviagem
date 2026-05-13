// Edge function: fabrica-edit-photo
// Recebe uma imagem de referência (base64 OU URL) + parâmetros do anúncio
// e usa Nano Banana 2 (gemini-3.1-flash-image-preview) para REENQUADRAR/ADAPTAR
// a foto ao formato desejado e adicionar overlay de texto/preço/benefícios.
//
// IMPORTANTE: nada é persistido no banco. A imagem trafega só em memória.
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { verifyFabricaEliteAccess } from "../_shared/fabricaAccess.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface Highlight { text: string; icon?: string; }

interface EditBody {
  imageUrl: string; // data:image/...;base64,... OU https://...
  format?: "square" | "story";
  destination: string;
  agencyName?: string;
  city?: string;
  primaryColor?: string;
  secondaryColor?: string;
  hasLogo?: boolean;
  price?: string;
  installments?: string;
  promoName?: string;
  highlights?: Highlight[];
}

const ICON_DESC: Record<string, string> = {
  bus: "ícone de ônibus em linha branca fina",
  hotel: "ícone de hotel/cama em linha branca fina",
  plane: "ícone de avião em linha branca fina",
  check: "ícone de check (✓)",
  star: "ícone de estrela",
  heart: "ícone de coração",
  sun: "ícone de sol",
  camera: "ícone de câmera",
  map: "ícone de pin de mapa",
  food: "ícone de garfo e faca",
  ship: "ícone de navio",
  palm: "ícone de coqueiro",
  coffee: "ícone de xícara de café",
  guide: "ícone de pessoa (guia)",
  wifi: "ícone de wifi",
};

function buildEditPrompt(p: EditBody): string {
  const dest = p.destination || "destino";
  const agency = p.agencyName || "Agência";
  const cityTxt = p.city ? `Saindo de ${p.city}` : "Pacote completo";
  const primary = (p.primaryColor || "#0c2340").toUpperCase();
  const secondary = (p.secondaryColor || "#FCD34D").toUpperCase();
  const price = p.price || "149,90";
  const installments = p.installments || "10x";
  const promo = (p.promoName || "OFERTA ESPECIAL").toUpperCase();
  const highlights = (p.highlights || []).slice(0, 5);
  const format = p.format || "story";

  const aspectRule = format === "story"
    ? `FORMATO FINAL: VERTICAL 9:16 (1080x1920) — adapte/reenquadre a foto de referência mantendo o sujeito principal centralizado. Se a foto original for horizontal/quadrada, faça crop inteligente focando no elemento mais bonito (mar, marco, paisagem) e estenda o cenário lateralmente de forma natural se precisar.`
    : `FORMATO FINAL: QUADRADO 1:1 (1080x1080) — adapte/reenquadre a foto mantendo o sujeito principal bem composto.`;

  const logoArea = p.hasLogo
    ? `No canto SUPERIOR ESQUERDO, deixe uma área retangular limpa e vazia (a logo será composta pelo cliente depois).`
    : `No canto SUPERIOR ESQUERDO, escreva em branco bold sans-serif compacto: "${agency}".`;

  const exactStrings = [
    `"Conheça ${dest}!"`,
    `"${cityTxt}"`,
    `"${promo}"`,
    ...highlights.map((h) => `"${h.text}"`),
    `"${installments} R$ ${price}"`,
    `"/pessoa"`,
  ];

  const benefitsBlock = highlights.length > 0
    ? `Lista vertical de ${highlights.length} pílulas brancas arredondadas, cada uma com:\n   ${highlights.map((h, i) => `${i + 1}. ${ICON_DESC[h.icon || "check"]} + texto bold "${h.text}"`).join("\n   ")}`
    : "";

  return `Você recebeu uma fotografia REAL de referência. Sua tarefa é TRANSFORMAR essa foto em um anúncio publicitário profissional de turismo.

${aspectRule}

USE A FOTO RECEBIDA como o BACKGROUND principal do anúncio (full-bleed, ocupando ~60-70% da composição). Não substitua a foto por uma gerada — mantenha o cenário, as cores e a luz da foto original. Se necessário, faça crop inteligente ou expansão sutil das bordas para encaixar no formato.

═══════════════════════════════════════
LAYOUT FINAL DO ANÚNCIO:

1) FOTO DE REFERÊNCIA: ocupa o topo (story) ou metade superior (square), full-bleed, com leve gradiente escuro embaixo para legibilidade.
2) ${logoArea}
3) Sobre a foto, no terço inferior dela: título BRANCO bold sans-serif XGG com sombra suave: "Conheça ${dest}!".
4) FAIXA INFERIOR (parte sólida abaixo da foto): fundo SÓLIDO em ${primary}.
5) Dentro da faixa inferior:
   - Badge arredondada em ${secondary} com texto preto bold: "${cityTxt}".
   - Título branco bold CAIXA-ALTA tamanho XG: "${promo}".
   ${benefitsBlock ? `- ${benefitsBlock}` : ""}
   - Caixa retangular grande arredondada em ${secondary} com texto preto bold ENORME: "${installments} R$ ${price}" e ao lado pequeno preto: "/pessoa".

═══════════════════════════════════════
🚫 REGRAS ABSOLUTAS:

1) NUNCA renderize números de pixel, réguas, linhas-guia, anotações técnicas ou marcações de safe zone. A imagem é o anúncio FINAL.

2) TEXTO — APENAS as strings desta lista, NADA MAIS:
   ${exactStrings.join("\n   ")}
   • Acentos exatos em português (ç ã õ é á í ó ú â ê ô).
   • PROIBIDO inventar palavras, frases, slogans, dores ou benefícios extras.
   • PROIBIDO traduzir, abreviar ou misturar inglês/espanhol.
   • Se não conseguir desenhar uma palavra com legibilidade perfeita, DEIXE VAZIO.

3) COR PRIMÁRIA = ${primary}. Use EXATAMENTE essa cor nos blocos sólidos. PROIBIDO trocar por laranja/dourado/cor "padrão de turismo".

4) FOTO: NÃO substitua o cenário da foto original. Mantenha o local, a iluminação e os elementos visuais reais. Apenas adicione o overlay de texto e o painel inferior sólido com a oferta.

5) Tipografia: Inter ou Outfit bold sans-serif. Composição limpa, mobile-first, qualidade publicitária Instagram premium.`;
}

async function urlToBase64DataUrl(url: string): Promise<string> {
  // Se já é data URL, retorna como está
  if (url.startsWith("data:")) return url;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Falha ao baixar imagem (${res.status})`);
  const ct = res.headers.get("content-type") || "image/jpeg";
  const buf = new Uint8Array(await res.arrayBuffer());
  // Limite ~10MB para não estourar
  if (buf.byteLength > 10 * 1024 * 1024) {
    throw new Error("Imagem muito grande (máx 10MB)");
  }
  // Converte em chunks para não estourar a stack
  let binary = "";
  const chunkSize = 0x8000;
  for (let i = 0; i < buf.byteLength; i += chunkSize) {
    binary += String.fromCharCode(...buf.subarray(i, i + chunkSize));
  }
  const b64 = btoa(binary);
  return `data:${ct};base64,${b64}`;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const access = await verifyFabricaEliteAccess(req, corsHeaders);
    if (!access.ok) return access.response;

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const body = (await req.json()) as EditBody;
    if (!body.imageUrl || !body.destination) {
      return new Response(JSON.stringify({ error: "imageUrl e destination são obrigatórios" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Garante data URL — Pexels às vezes vem como https direto, modelo prefere data URL
    let referenceImage: string;
    try {
      referenceImage = await urlToBase64DataUrl(body.imageUrl);
    } catch (e) {
      console.error("Failed to fetch reference image:", e);
      return new Response(JSON.stringify({ error: "Não foi possível carregar a imagem de referência" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const prompt = buildEditPrompt(body);
    console.log("Editing photo", {
      destination: body.destination,
      format: body.format,
      hasLogo: body.hasLogo,
      promptLength: prompt.length,
      refImageSize: referenceImage.length,
    });

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3.1-flash-image-preview",
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: prompt },
              { type: "image_url", image_url: { url: referenceImage } },
            ],
          },
        ],
        modalities: ["image", "text"],
      }),
    });

    if (response.status === 429) {
      // Fallback: devolve a foto original (sem edição IA) para não travar o fluxo
      return new Response(JSON.stringify({
        image: referenceImage,
        fallback: true,
        warning: "Limite de requisições da IA atingido. Mostrando a foto original sem edição. Tente gerar novamente em 1 minuto.",
      }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (response.status === 402) {
      // Fallback: devolve a foto original quando os créditos de IA acabam
      return new Response(JSON.stringify({
        image: referenceImage,
        fallback: true,
        warning: "Créditos de IA esgotados. Mostrando a foto original sem edição. Adicione créditos no workspace para reativar a edição IA.",
      }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!response.ok) {
      const errText = await response.text();
      console.error("AI gateway error:", response.status, errText);
      return new Response(JSON.stringify({ error: "Falha ao editar imagem", detail: errText }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const imageUrl = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;
    if (!imageUrl) {
      console.error("No image returned from edit");
      return new Response(JSON.stringify({ error: "Nenhuma imagem gerada" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ image: imageUrl }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("fabrica-edit-photo error:", err);
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "Erro inesperado" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
