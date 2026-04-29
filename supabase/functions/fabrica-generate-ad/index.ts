// Edge function: fabrica-generate-ad
// Gera anúncios de turismo com Lovable AI (Nano Banana 2)
// 4 estratégias visualmente DIFERENTES, formatos 1:1 e 9:16,
// safe zones para Reels/Stories/Feed, cores e ícones respeitados.
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { getTemplateById, MASTER_TEMPLATES, type MasterPromptVars } from "./master-prompts.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type Strategy = "ancora" | "vitrine" | "matriz" | "gancho";
type Format = "square" | "story";

interface Highlight {
  text: string;
  icon?: string; // nome do ícone: bus, hotel, plane, check, star, heart, sun, camera, map, food, ship, palm
}

interface AdParams {
  strategy: Strategy;
  format?: Format; // "square" 1:1 ou "story" 9:16
  photoOnly?: boolean; // gera apenas fotografia limpa; textos serão compostos no canvas do app
  destination: string;
  niche?: string;
  agencyName?: string;
  agencyType?: string;
  city?: string;
  primaryColor?: string;
  secondaryColor?: string;
  hasLogo?: boolean; // se true, deixa espaço para logo; se false, NÃO deixa
  price?: string;
  installments?: string;
  promoName?: string;
  highlights?: (string | Highlight)[];
  ctaText?: string;
  variation?: number; // 0..3 — varia composição mesmo com mesmos parâmetros
  templateId?: string; // se definido, usa um template mestre em vez do builder de estratégia
  packageType?: string; // ex: "Voo + Hotel"
  duration?: string;    // ex: "5 NOITES"
}

// ===== Tom visual por tipo de agência =====
function agencyTone(t?: string): string {
  if (!t) return "design profissional vibrante";
  const k = t.toLowerCase();
  const map: Record<string, string> = {
    autonoma: "design pessoal, próximo, artesanal, tipografia amigável",
    pequena: "estética acolhedora, familiar, profissional sem ser corporativa",
    media: "design profissional consolidado, layout limpo e moderno",
    franquia: "padrão visual corporativo limpo, alta consistência de marca",
    consolidadora: "estética B2B robusta, sóbria, hierarquia clara, foco em confiança",
    receptiva: "vibrante e local, cores tropicais, atmosfera de boas-vindas",
    milhas: "premium minimalista, elementos de companhias aéreas, dourado/preto status",
    luxo: "ultra-premium, paleta sóbria, tipografia serifada elegante, fotografia editorial",
    corporativa: "B2B sóbria, navy/cinza, sans-serif limpa, foco em executivos",
    grupos: "alegre e coletivo, pessoas felizes em grupo, atmosfera de celebração",
    cruzeiros: "náutica premium, azuis profundos, dourados, navios e oceano",
    ecoturismo: "verde-natureza terrosa, fotografia selvagem, vibe sustentável",
    religioso: "respeitoso e contemplativo, paleta sóbria, atmosfera serena",
  };
  return map[k] || `perfil "${t}"`;
}

// ===== Cor → nome em português (para o modelo de imagem reforçar) =====
function hexToName(hex?: string): string {
  if (!hex) return "azul-marinho profundo";
  const h = hex.toLowerCase().replace("#", "");
  const map: Record<string, string> = {
    "0c2340": "azul-marinho profundo", "0f1b3d": "azul-marinho profundo",
    "1a4a6e": "azul-petróleo", "2563eb": "azul royal vibrante",
    "1d4ed8": "azul cobalto profundo", "3b82f6": "azul céu vibrante",
    "0a0a0a": "preto absoluto fosco", "000000": "preto profundo",
    "f59e0b": "âmbar dourado vibrante", "fcd34d": "amarelo-ouro brilhante",
    "ffd700": "dourado clássico", "f5c518": "amarelo-ouro intenso",
    "e85d3a": "laranja terracota", "c4654a": "terracota queimado",
    "064e3b": "verde-esmeralda profundo", "0d7a5f": "verde-esmeralda",
    "c9a84c": "dourado champagne", "ff6b35": "laranja vibrante",
    "ffffff": "branco puro", "fafbfc": "branco off-white",
    "e94560": "rosa-coral intenso", "ff0000": "vermelho puro intenso",
    "dc2626": "vermelho carmim vibrante", "991b1b": "vermelho vinho profundo",
    "7c2d12": "marrom-vermelho terra",
  };
  if (map[h]) return map[h];
  // fallback: classifica por canal
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  if (r > 180 && g < 80 && b < 80) return `vermelho intenso saturado (${hex})`;
  if (b > 180 && r < 100) return `azul vibrante profundo (${hex})`;
  if (g > 150 && r < 120 && b < 120) return `verde vivo (${hex})`;
  if (r > 200 && g > 150 && b < 100) return `amarelo-âmbar (${hex})`;
  return `cor sólida exatamente ${hex}`;
}

// ===== Cena por nicho =====
function nicheToScene(niche?: string, destination?: string): string {
  const dest = destination || "destino brasileiro";
  switch ((niche || "").toLowerCase()) {
    case "nordeste":
      return `praia tropical paradisíaca de ${dest}, mar turquesa cristalino, falésias coloridas, jangadas, areia clara, céu azul ensolarado`;
    case "sul":
      return `paisagem de ${dest}, arquitetura colonial europeia, vinícolas, montanhas verdes, clima ameno`;
    case "internacional":
      return `cartão-postal icônico de ${dest}, marcos arquitetônicos famosos, cenário cosmopolita`;
    case "cruzeiro":
      return `navio de cruzeiro luxuoso ancorado em baía de ${dest}, deck panorâmico, mar profundo`;
    case "aventura":
      return `paisagem natural selvagem de ${dest}, cachoeiras, trilhas, natureza preservada`;
    case "luademel":
      return `cenário romântico de ${dest}, pôr-do-sol dourado, atmosfera íntima`;
    default:
      return `paisagem deslumbrante de ${dest}, qualidade de cartão-postal, iluminação cinematográfica`;
  }
}

// ===== Mapa de ícones (nomes em pt para o modelo) =====
const ICON_DESC: Record<string, string> = {
  bus: "ícone simples de ônibus em linha branca fina",
  hotel: "ícone simples de hotel/cama em linha branca fina",
  plane: "ícone simples de avião em linha branca fina",
  check: "ícone de check (✓) em círculo verde",
  star: "ícone de estrela cheia",
  heart: "ícone de coração",
  sun: "ícone de sol",
  camera: "ícone de câmera",
  map: "ícone de pin de mapa",
  food: "ícone de garfo e faca (refeição)",
  ship: "ícone de navio",
  palm: "ícone de coqueiro",
  coffee: "ícone de xícara de café",
  guide: "ícone de pessoa com prancheta (guia)",
  wifi: "ícone de wifi",
};

function iconLine(h: Highlight): string {
  const desc = h.icon && ICON_DESC[h.icon] ? ICON_DESC[h.icon] : "ícone de check verde";
  return `${desc} + texto bold "${h.text}"`;
}

// ===== Safe zones por formato (descritivas, SEM números/pixels) =====
function safeZoneRules(format: Format): string {
  if (format === "story") {
    return `FORMATO VERTICAL 9:16 — para Stories e Reels.
GERE A IMAGEM DIRETAMENTE EM PROPORÇÃO VERTICAL 9:16 (mais alta do que larga, formato de celular em pé).
NÃO entregue uma composição quadrada — a tela é 1080x1920, vertical.
SAFE ZONES (deixe respiro generoso, NÃO posicione textos críticos nestas áreas):
- Topo: faixa superior livre para o nome de usuário do app.
- Base: faixa inferior larga livre para legenda, música e botões do app.
- Lateral direita: coluna estreita livre para botões de interação.
- Lateral esquerda: pequena margem de respiro.
Concentre TODO o conteúdo importante (preço, headline, CTA, logo) no MIOLO CENTRAL VERTICAL — entre 18% e 82% da altura — e centralize horizontalmente, deixando ~10% de margem em cada lateral, pois as bordas podem ser recortadas em telas diferentes.`;
  }
  return `FORMATO QUADRADO 1:1 — para o feed do Instagram (1080x1080).
GERE A IMAGEM DIRETAMENTE EM PROPORÇÃO QUADRADA, nunca vertical nem horizontal.
SAFE ZONES: respiro generoso em todas as bordas. Composição equilibrada, perfeita para o grid.`;
}

// ===== Normaliza highlights =====
function normalizeHighlights(arr?: (string | Highlight)[]): Highlight[] {
  if (!arr || arr.length === 0) {
    return [
      { text: "Transporte incluso", icon: "bus" },
      { text: "Hospedagem", icon: "hotel" },
      { text: "Café da manhã", icon: "coffee" },
      { text: "Guia local", icon: "guide" },
    ];
  }
  return arr.slice(0, 5).map((h) =>
    typeof h === "string" ? { text: h, icon: "check" } : { text: h.text, icon: h.icon || "check" }
  );
}

// ===== Prompt builder =====
function buildPrompt(p: AdParams): string {
  const dest = p.destination || "destino paradisíaco";
  const agency = p.agencyName || "Agência de Viagens";
  const cityTxt = p.city ? `Saindo de ${p.city}` : "Pacote completo";
  const primaryHex = (p.primaryColor || "#0c2340").toUpperCase();
  const secondaryHex = (p.secondaryColor || "#F5C518").toUpperCase();
  const primaryName = hexToName(p.primaryColor);
  const secondaryName = hexToName(p.secondaryColor || "#F5C518");
  const price = p.price || "149,90";
  const installments = p.installments || "10x";
  const promo = (p.promoName || "OFERTA ESPECIAL").toUpperCase();
  const highlights = normalizeHighlights(p.highlights);
  const scene = nicheToScene(p.niche, dest);
  const tone = agencyTone(p.agencyType);
  const format: Format = p.format || (p.strategy === "matriz" ? "square" : "story");
  const safeZone = safeZoneRules(format);
  const variation = p.variation ?? 0;

  // Logo: SEMPRE deixar área limpa no topo esquerdo (a logo será composta no cliente depois).
  // Se a agência NÃO tem logo, escrever o nome como wordmark.
  const logoArea = p.hasLogo
    ? `No canto SUPERIOR ESQUERDO da imagem, deixe uma ÁREA TOTALMENTE LIMPA E VAZIA (sem nenhum texto, ícone, gráfico ou padrão), com proporção retangular horizontal compacta — essa região receberá a logo da agência depois. Não preencha, não decore, não escreva nada nessa região.`
    : `No canto SUPERIOR ESQUERDO, escrever em texto limpo branco bold sans-serif compacto o nome da agência: "${agency}" — apenas wordmark, sem caixa, sem fundo, sem ícone.`;

  // ===== STRINGS EXATAS — lista única, congelada =====
  // Mostramos UMA ÚNICA vez no topo do prompt. Nada mais pode ser inventado.
  const exactStrings: string[] = [
    `"Conheça ${dest}!"`,
    `"${cityTxt}"`,
    `"${promo}"`,
    ...highlights.map((h) => `"${h.text}"`),
    `"${installments} R$ ${price}"`,
    `"/pessoa"`,
  ];

  // ===== REGRAS GLOBAIS =====
  const RULES = `
══════════════════════════════════════
🚫 REGRAS ABSOLUTAS (violar = imagem inutilizável)

0) SAÍDA ÚNICA E LAYOUT ÚNICO:
   • GERAR APENAS 1 banner publicitário final, em uma única composição centralizada.
   • É PROIBIDO criar duas imagens lado a lado, variações, mockups, previews, cards duplicados ou collage de anúncios.
   • Escolha UM layout e siga esse layout até o fim; nunca misture dois layouts no mesmo banner.
   • É PROIBIDO duplicar foto, bloco de preço, cartão, botão, selo ou lista.
   • Zero sobreposição: texto, preço, ícones e blocos precisam ter respiro claro e não podem tocar/encobrir outro elemento.

1) NADA DE GUIAS / ANOTAÇÕES TÉCNICAS:
   NUNCA renderize números de pixel ("1080px", "40px"), réguas, linhas-guia, setas de medida,
   marcações de safe zone, retângulos pontilhados, anotações ou qualquer texto de instrução.
   A imagem é o ANÚNCIO FINAL pronto para postar.

2) TEXTO — APENAS AS STRINGS DESTA LISTA, NADA MAIS:
   ${exactStrings.join("\n   ")}
   • Copie caractere por caractere, com os acentos exatos (ç ã õ é á í ó ú â ê ô).
   • É PROIBIDO inventar palavras, frases, dores, slogans, hashtags, watermarks ou benefícios extras.
   • É PROIBIDO traduzir, abreviar, encurtar ou substituir por sinônimos.
   • É PROIBIDO misturar inglês ou espanhol.
   • Se você não consegue desenhar uma palavra com legibilidade perfeita, deixe o ESPAÇO VAZIO.
   • Exemplos do que NUNCA fazer (alucinações já vistas a evitar):
     ✗ "tempna detro pezetas" / "Perobleniza um contaita" / "xa de pica" / "Motel" (a menos que esteja na lista)
     ✗ Qualquer texto fora da lista acima.

3) COR — OBRIGATÓRIA, SEM SUBSTITUIÇÃO:
   • PRIMÁRIA = ${primaryHex} (${primaryName}). Use EXATAMENTE essa cor nos blocos sólidos principais, fundos de seções e títulos.
   • SECUNDÁRIA = ${secondaryHex} (${secondaryName}). APENAS pequenos detalhes: badges, ícones, caixa de preço.
   • PROIBIDO trocar a primária por laranja, dourado, amarelo "padrão de turismo" ou qualquer cor "viagem genérica".
   • Se a primária for vermelha → blocos vermelhos. Se for azul → azuis. Se for preta → pretos. Sem exceção.

4) BENEFÍCIOS:
   Renderize EXATAMENTE estes ${highlights.length} benefícios na ordem dada:
   ${highlights.map((h, i) => `${i + 1}. "${h.text}" + ${ICON_DESC[h.icon || "check"] || "ícone de check"}`).join("\n   ")}
   NÃO adicione benefícios extras ("Motel", "Bebidas grátis", etc.) que não estejam nesta lista.

TOM VISUAL: ${tone}.

${safeZone}
══════════════════════════════════════`;

  // ===== Composições por estratégia (cada uma DIFERENTE de verdade) =====
  // Vamos variar a composição também por "variation" (0-3) para gerar variações visuais reais.

  switch (p.strategy) {
    // ================================================================
    // 1) ÂNCORA — duas colunas verticais com checklist de benefícios
    // ================================================================
    case "ancora": {
      const layouts = [
        // var 0: 40/60 esquerda sólida + grade 2x2 de fotos
        `LAYOUT: dividida em DUAS COLUNAS verticais (40% esquerda + 60% direita).
COLUNA ESQUERDA (40%): fundo SÓLIDO em ${primaryHex}. ${logoArea} Centralizado verticalmente, em CAIXA-ALTA branco bold sans-serif tamanho XGG: "${promo}". Abaixo, lista vertical de ${highlights.length} pílulas brancas arredondadas (border-radius 999px), cada uma com ${highlights.map(iconLine).join(" / ")}. Na base, caixa retangular grande arredondada em ${secondaryHex} com texto preto bold: "${installments} R$ ${price}" enorme.
COLUNA DIREITA (60%): fundo ${secondaryHex} suave, contendo GRADE 2x2 de 4 fotografias quadradas de cantos arredondados, com pequeno espaçamento entre elas, cada uma mostrando ${scene} em cenas diferentes (vista aérea, marco icônico, atividade turística, pessoas felizes).`,

        // var 1: full-bleed foto à direita, painel sólido à esquerda mais largo (50/50)
        `LAYOUT: dividida em DUAS COLUNAS (50/50).
ESQUERDA (50%): fundo SÓLIDO em ${primaryHex}. ${logoArea} Empilhado verticalmente: badge ${secondaryHex} com texto preto "${cityTxt}", título branco bold "${promo}" tamanho XG, lista vertical de ${highlights.length} itens com ${highlights.map(iconLine).join(" / ")}, e na base bloco branco arredondado com preço preto bold "${installments} R$ ${price}".
DIREITA (50%): fotografia ÚNICA full-bleed ultra-realista de ${scene}, sem bordas, ocupando toda a altura.`,

        // var 2: layout invertido — coluna direita sólida
        `LAYOUT: dividida em DUAS COLUNAS verticais (60% esquerda + 40% direita).
ESQUERDA (60%): GRID DE 3 fotografias verticais empilhadas com cantos arredondados de ${scene} em ângulos variados.
DIREITA (40%): fundo SÓLIDO em ${primaryHex}. ${logoArea} Em destaque vertical: título branco "${promo}" CAIXA-ALTA, lista de ${highlights.length} pílulas brancas com ${highlights.map(iconLine).join(" / ")}, caixa de preço ${secondaryHex} arredondada com preço preto bold.`,

        // var 3: linha horizontal — banner topo cor primária + carrossel de fotos
        `LAYOUT: empilhado verticalmente em 3 faixas.
FAIXA SUPERIOR (30% altura): fundo SÓLIDO em ${primaryHex}, ${logoArea} ao lado esquerdo + título branco bold "${promo}" centralizado.
FAIXA CENTRAL (50% altura): grid 2x2 de 4 fotos quadradas de ${scene} com cantos arredondados.
FAIXA INFERIOR (20% altura): fundo ${secondaryHex} com lista horizontal de ${highlights.length} chips brancos arredondados (${highlights.map((h) => `"✓ ${h.text}"`).join(", ")}) e ao final caixa preta com preço branco bold "${installments} R$ ${price}".`,
      ];
      return `Imagem promocional de turismo, alta qualidade publicitária. ${layouts[variation % 4]}
Tipografia bold sans-serif Montserrat/Outfit. Foco em conversão.
${RULES}`;
    }

    // ================================================================
    // 2) VITRINE — editorial com foto MASSIVA + título "Conheça"
    // ================================================================
    case "vitrine": {
      const layouts = [
        // var 0: foto inferior 55% + bloco superior cor primária
        `LAYOUT: empilhado verticalmente em 2 seções.
SUPERIOR (45% altura): fundo SÓLIDO em ${primaryHex}. ${logoArea} Centralizado, título BRANCO sans-serif bold tamanho XGG: "Conheça ${dest}!". Abaixo, badge arredondada em ${secondaryHex} com texto preto bold: "${cityTxt}" + ícone de pin pequeno. À esquerda da seção, lista de 3 itens com ${highlights.slice(0, 3).map(iconLine).join(" / ")}. À direita, bloco de preço em texto BRANCO: "${installments} R$" pequeno acima e "${price}" gigante bold + "/pessoa" pequeno abaixo. Linha vertical fina branca como divisor.
INFERIOR (55% altura): fotografia ÚNICA full-bleed ultra-realista de ${scene}, ocupando toda a largura, iluminação solar nítida, qualidade National Geographic.`,

        // var 1: foto MASSIVA superior (70%) + faixa inferior promocional
        `LAYOUT: empilhado.
SUPERIOR (70% altura): fotografia full-bleed de ${scene}, com gradiente sutil escuro embaixo. Sobre a foto, no terço inferior, título BRANCO bold com sombra projetada XGG: "Conheça ${dest}!". ${logoArea}
INFERIOR (30% altura): fundo SÓLIDO em ${primaryHex}. À esquerda, badge ${secondaryHex} "${cityTxt}" + lista horizontal de chips brancos com ${highlights.slice(0, 3).map((h) => `"✓ ${h.text}"`).join(", ")}. À direita, caixa ${secondaryHex} arredondada com preço preto bold "${installments} R$ ${price}".`,

        // var 2: split diagonal artístico
        `LAYOUT: dividida por DIAGONAL.
METADE SUPERIOR-DIREITA (separada por diagonal de canto inferior-esquerdo a canto superior-direito): fundo SÓLIDO em ${primaryHex}. ${logoArea} Título branco bold XGG inclinado levemente: "Conheça ${dest}!". Lista de ${highlights.length} ícones brancos finos com ${highlights.map(iconLine).join(" / ")}. Badge ${secondaryHex} "${cityTxt}".
METADE INFERIOR-ESQUERDA: fotografia full-bleed de ${scene}. Na esquina inferior esquerda, caixa ${secondaryHex} arredondada com "${installments} R$ ${price}" preto bold.`,

        // var 3: moldura + foto central + texto laterais
        `LAYOUT: foto central com moldura grossa em ${primaryHex}.
A imagem inteira tem fundo SÓLIDO ${primaryHex}. ${logoArea} no topo. Centralizado, retângulo de fotografia ultra-realista de ${scene} ocupando ~60% da altura, com cantos arredondados. Acima da foto, título branco bold XG "Conheça ${dest}!". Abaixo da foto, lista horizontal de chips brancos arredondados com ${highlights.slice(0, 3).map((h) => `"✓ ${h.text}"`).join(", ")}. Na base, caixa ${secondaryHex} com preço preto bold "${installments} R$ ${price}" + sufixo "/pessoa".`,
      ];
      return `Anúncio editorial de turismo de alta conversão para "${agency}". ${layouts[variation % 4]}
Tipografia Inter/Outfit bold sans-serif. Composição limpa, mobile-first.
${RULES}`;
    }

    // ================================================================
    // 3) MATRIZ — quadrado 1:1 limpo, dois lados (foto + lista)
    // ================================================================
    case "matriz": {
      const layouts = [
        // var 0: foto direita + texto esquerda
        `LAYOUT: dividida em DUAS COLUNAS iguais (50/50).
ESQUERDA (50%): fundo SÓLIDO em ${primaryHex}. ${logoArea} Centralizado verticalmente, título grande BRANCO bold "Conheça ${dest}!". Badge ${secondaryHex} "${cityTxt}". Lista de ${highlights.length} itens com ${highlights.map(iconLine).join(" / ")}. Na base, caixa ${secondaryHex} arredondada com texto preto bold: "${installments} R$ ${price}" tamanho XG.
DIREITA (50%): fotografia ÚNICA full-bleed ultra-realista de ${scene}, ocupando toda a altura, sem bordas brancas.`,

        // var 1: foto topo + checklist embaixo
        `LAYOUT: empilhado.
TOPO (50% altura): fotografia full-bleed de ${scene}. ${logoArea} sobre a foto no canto superior esquerdo. No canto superior direito, badge ${secondaryHex} "${cityTxt}".
INFERIOR (50% altura): fundo SÓLIDO em ${primaryHex}. À esquerda, título branco bold "Conheça ${dest}!". À direita, lista vertical de ${highlights.length} pílulas brancas com ${highlights.map(iconLine).join(" / ")}. Na base inferior, caixa ${secondaryHex} arredondada de largura total com preço preto bold "${installments} R$ ${price}" centralizado.`,

        // var 2: 4 quadrantes
        `LAYOUT: dividida em 4 QUADRANTES iguais.
QUADRANTE SUPERIOR-ESQUERDO: fundo SÓLIDO ${primaryHex}, ${logoArea} + título branco bold "Conheça ${dest}!".
QUADRANTE SUPERIOR-DIREITO: fotografia de ${scene} em close.
QUADRANTE INFERIOR-ESQUERDO: fotografia de ${scene} em ângulo diferente.
QUADRANTE INFERIOR-DIREITO: fundo SÓLIDO ${primaryHex}, lista de ${highlights.length} itens brancos ${highlights.map(iconLine).join(" / ")} + caixa de preço ${secondaryHex} preto bold "${installments} R$ ${price}".`,

        // var 3: foto centralizada com info abaixo
        `LAYOUT: 3 faixas horizontais.
FAIXA SUPERIOR (15%): fundo ${primaryHex}, ${logoArea} à esquerda + badge ${secondaryHex} "${cityTxt}" à direita.
FAIXA CENTRAL (60%): fotografia full-bleed de ${scene} com título branco bold "Conheça ${dest}!" sobreposto na parte inferior com sombra.
FAIXA INFERIOR (25%): fundo ${primaryHex}, à esquerda lista horizontal de chips brancos com ${highlights.slice(0, 3).map((h) => `"✓ ${h.text}"`).join(", ")}, à direita caixa ${secondaryHex} arredondada preço preto bold "${installments} R$ ${price}".`,
      ];
      return `Anúncio quadrado 1:1 (1080x1080) profissional para "${agency}". ${layouts[variation % 4]}
Tipografia Outfit/Inter bold sans-serif. Qualidade publicitária Instagram feed premium.
${RULES}`;
    }

    // ================================================================
    // 4) GANCHO — alto contraste emocional, antes/depois ou foco intenso
    // ================================================================
    case "gancho": {
      // Hook = alto contraste emocional, MAS sempre vendendo o pacote real.
      // Usamos APENAS as strings exatas declaradas em RULES. Nada de inventar dores.
      const hookHeadline = `Conheça ${dest}!`;
      const hookSubtitle = cityTxt;

      const layouts = [
        // var 0: dois painéis lado a lado contrastantes (sem texto extra)
        `LAYOUT: dividida em DOIS PAINÉIS verticais (45/55).
PAINEL ESQUERDO (45%): fundo SÓLIDO em ${primaryHex} fosco premium. ${logoArea} Centralizado verticalmente, texto BRANCO CAIXA-ALTA bold tamanho XG: "${promo}". Logo abaixo, badge ${secondaryHex} pequena com texto preto: "${hookSubtitle}". Lista vertical de ${highlights.length} pílulas brancas arredondadas com ${highlights.map(iconLine).join(" / ")}. Na base, caixa ${secondaryHex} arredondada com texto preto bold ENORME: "${installments} R$ ${price}" e logo abaixo, em texto preto pequeno: "/pessoa".
PAINEL DIREITO (55%): fundo ${secondaryHex} claro, com 4 fotografias retangulares de cantos arredondados, empilhadas verticalmente com pequeno espaçamento, mostrando ${scene} em cenas variadas (vista aérea, marco famoso, atividade turística, pessoas felizes).`,

        // var 1: HOOK destino — split horizontal (gancho de DESEJO, não de dor genérica)
        `LAYOUT: dividido HORIZONTALMENTE em duas metades.
METADE SUPERIOR (45%): fotografia full-bleed CINEMATOGRÁFICA de ${scene}, com leve gradiente escuro embaixo. Sobre a foto, centralizado, título BRANCO bold sans-serif XGG com sombra projetada: "${hookHeadline}". ${logoArea}
METADE INFERIOR (55%): fundo SÓLIDO em ${primaryHex} vibrante. Texto branco bold CAIXA-ALTA tamanho XG centralizado: "${promo}". Lista vertical de ${highlights.length} pílulas brancas arredondadas com ${highlights.map(iconLine).join(" / ")}. Na base, caixa ${secondaryHex} arredondada larga com preço preto bold ENORME: "${installments} R$ ${price}" + texto preto pequeno: "/pessoa".
Entre as duas metades, uma SETA BRANCA fina apontando para baixo, ligando a foto à oferta.`,

        // var 2: foto explosiva fundo + texto sobreposto centralizado
        `LAYOUT: foto ÚNICA full-bleed de ${scene} ocupando 100% da imagem, com OVERLAY SÓLIDO em ${primaryHex} a 70% de opacidade.
${logoArea} no topo. Centralizado verticalmente sobre a foto, em colunas: título branco bold XGG "${hookHeadline}", abaixo badge ${secondaryHex} preto "${hookSubtitle}", abaixo CAIXA-ALTA branco bold ENORME "${promo}". Em pílulas brancas semi-transparentes, lista de ${highlights.length} itens com ${highlights.map(iconLine).join(" / ")}. Na base, caixa SÓLIDA ${secondaryHex} arredondada com preço preto bold gigante "${installments} R$ ${price}" + texto preto pequeno "/pessoa". Atmosfera vibrante.`,

        // var 3: badge de oferta gigante centralizado
        `LAYOUT: foto de ${scene} ocupa 100% do fundo. Sobre ela, ${logoArea} no topo. No CENTRO, círculo gigante em ${secondaryHex} (~60% da largura) com texto preto CAIXA-ALTA bold dentro: "${promo}" no topo do círculo, "${installments} R$ ${price}" no meio em tamanho gigante, e "${hookSubtitle}" embaixo pequeno.
Embaixo do círculo, em retângulo SÓLIDO ${primaryHex} arredondado, lista horizontal de ${highlights.length} chips brancos arredondados, cada um com ${highlights.map(iconLine).join(" / ")}.`,
      ];
      return `Anúncio de alto impacto emocional para "${agency}". ${layouts[variation % 4]}
Tipografia Montserrat/Outfit bold. Ultra-realista, fotografia premium, foco em desejo de viagem e conversão.
${RULES}`;
    }
  }

  return `Imagem promocional de turismo de "${agency}" para ${dest}. ${RULES}`;
}

function buildTextFreeDestinationPrompt(p: AdParams): string {
  const dest = p.destination || "destino paradisíaco";
  const scene = nicheToScene(p.niche, dest);
  const formatLine = (p.format || "story") === "story"
    ? "formato vertical 9:16, enquadramento de celular em pé, 1080x1920"
    : "formato quadrado 1:1, 1080x1080";

  return `
Fotografia turística hiper-realista de ${dest}, ${formatLine}, qualidade editorial premium, iluminação natural cinematográfica.

CENA: ${scene}.

REGRAS ABSOLUTAS:
- GERAR APENAS UMA ÚNICA FOTO FINAL, full-bleed, preenchendo 100% da tela.
- PROIBIDO qualquer divisão de tela, colagem, grid, duas fotos, três fotos, moldura, cartão, pôster, mockup ou variações lado a lado.
- PROIBIDO qualquer texto, letra, palavra, número, preço, legenda, placa legível, logo, marca d'água, botão, selo ou tipografia.
- Deixar área visual limpa no centro inferior para o app aplicar textos depois, mas sem renderizar nenhum texto agora.
- Pessoas e cenário naturais, sem deformações anatômicas, sem objetos duplicados, sem aparência artificial.

Resultado: uma foto única, limpa e realista do destino, pronta para receber layout e textos pelo sistema.
`;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const USER_GEMINI_API_KEY = Deno.env.get("USER_GEMINI_API_KEY");
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!USER_GEMINI_API_KEY && !LOVABLE_API_KEY) {
      throw new Error("Nenhuma chave de IA configurada");
    }

    const body = (await req.json()) as AdParams;

    // templateId tem prioridade sobre strategy. Photo-only dispensa strategy legada.
    if (!body.templateId && !body.photoOnly) {
      if (!body.strategy || !["ancora", "vitrine", "matriz", "gancho"].includes(body.strategy)) {
        return new Response(JSON.stringify({ error: "Invalid strategy" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    // Se variation não vier, gera aleatório para garantir variedade entre cliques
    const variation = typeof body.variation === "number" ? body.variation : Math.floor(Math.random() * 4);
    const finalBody = { ...body, variation };

    // === Decide qual prompt usar ===
    let prompt: string;
    let usedTemplateId: string | null = null;

    if (body.photoOnly) {
      prompt = buildTextFreeDestinationPrompt(finalBody);
    } else if (body.templateId) {
      const tpl = getTemplateById(body.templateId);
      if (!tpl) {
        return new Response(JSON.stringify({ error: `Template ${body.templateId} not found` }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      // Preserva vírgula/centavos do preço (ex.: "149,90" — NÃO virar "1499").
      const rawPrice = (finalBody.price || "149,90").trim();
      const priceFormatted = rawPrice
        .replace(/[^\d.,]/g, "")        // mantém apenas dígitos, ponto e vírgula
        .replace(/\.(?=\d{3}(\D|$))/g, ""); // remove pontos de milhar (1.499,90 → 1499,90)
      const priceNumeric = parseFloat(priceFormatted.replace(/\./g, "").replace(",", ".")) || 149.9;
      const installmentsCount = parseInt((finalBody.installments || "10x").replace(/\D/g, "") || "10");
      const totalNum = priceNumeric * installmentsCount;
      // Formata total no padrão BR: "1.499,00" (com ponto de milhar e vírgula decimal)
      const formatBR = (n: number) => n.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      const vars: MasterPromptVars = {
        destination: (finalBody.destination || "DESTINO").toUpperCase(),
        destinationDescription: nicheToScene(finalBody.niche, finalBody.destination),
        installments: String(installmentsCount),
        installmentValue: priceFormatted || "149,90",
        totalValue: formatBR(totalNum),
        packageType: finalBody.packageType || "Voo + Hotel",
        duration: finalBody.duration || "5 NOITES",
        promoName: (finalBody.promoName || "OFERTA EXCLUSIVA").toUpperCase(),
        city: finalBody.city || "sua cidade",
        primaryHex: (finalBody.primaryColor || "#0c2340").toUpperCase(),
        secondaryHex: (finalBody.secondaryColor || "#FCD34D").toUpperCase(),
        agencyName: finalBody.agencyName || "",
        highlights: (finalBody.highlights || []).map((h) => typeof h === "string" ? h : h.text),
        creativeSeed: `${tpl.id}-v${variation}-${Date.now()}`,
      };
      prompt = tpl.builder(vars);
      usedTemplateId = tpl.id;
    } else {
      prompt = buildPrompt(finalBody);
    }

    const imageTemperature = body.photoOnly ? 0.72 : 1.18;
    const imageTopP = body.photoOnly ? 0.88 : 0.96;

    // Estratégia de provider: tenta USER_GEMINI primeiro, faz fallback para Lovable AI
    const useUserKey = !!USER_GEMINI_API_KEY;
    let provider: "user_gemini" | "lovable_ai" = useUserKey ? "user_gemini" : "lovable_ai";

    console.log("Generating ad", {
      strategy: finalBody.strategy,
      format: finalBody.format,
      variation,
      destination: finalBody.destination,
      hasLogo: finalBody.hasLogo,
      primaryColor: finalBody.primaryColor,
      promptLength: prompt.length,
      provider,
    });

    let imageUrl: string | undefined;

    // ===== Tentativa 1: chave Gemini do usuário (Google AI Studio) =====
    if (provider === "user_gemini") {
      // Os nomes de modelo válidos no endpoint público v1beta variam.
      // Tentamos vários candidatos em ordem até obter sucesso (ou um erro que não seja 404).
      const geminiModelCandidates = [
        "gemini-2.5-flash-image",
        "gemini-2.0-flash-exp-image-generation",
        "gemini-2.0-flash-preview-image-generation",
        "gemini-2.5-flash-image-preview",
      ];
      let geminiResp: Response | null = null;
      let lastErrText = "";
      try {
        for (const modelName of geminiModelCandidates) {
          geminiResp = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${USER_GEMINI_API_KEY}`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: {
                  responseModalities: ["IMAGE", "TEXT"],
                  temperature: imageTemperature,
                  topP: imageTopP,
                  maxOutputTokens: 8192,
                },
              }),
            }
          );
          if (geminiResp.ok) {
            console.log("User Gemini succeeded with model:", modelName);
            break;
          }
          lastErrText = await geminiResp.clone().text();
          // Só tenta o próximo candidato em 404 (modelo não encontrado/suportado)
          if (geminiResp.status !== 404) break;
          console.warn(`Gemini model ${modelName} returned 404, trying next candidate`);
        }

        if (geminiResp && geminiResp.ok) {
          const gd = await geminiResp.json();
          const parts = gd?.candidates?.[0]?.content?.parts || [];
          const imgPart = parts.find((p: { inlineData?: { data?: string; mimeType?: string } }) => p?.inlineData?.data);
          if (imgPart?.inlineData?.data) {
            const mime = imgPart.inlineData.mimeType || "image/png";
            imageUrl = `data:${mime};base64,${imgPart.inlineData.data}`;
          }
        } else if (geminiResp) {
          const errText = lastErrText || (await geminiResp.text());
          console.warn("User Gemini key failed, will fallback to Lovable AI:", geminiResp.status, errText.slice(0, 200));
          // Se for erro de quota/auth, tenta Lovable AI
          if (LOVABLE_API_KEY) {
            provider = "lovable_ai";
          } else {
            // Sem fallback disponível: retorna erro claro
            if (geminiResp.status === 429) {
              return new Response(
                JSON.stringify({ error: "Sua cota gratuita do Gemini foi atingida. Aguarde 1 minuto ou adicione faturamento no Google AI Studio.", provider: "user_gemini" }),
                { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
              );
            }
            if (geminiResp.status === 401 || geminiResp.status === 403) {
              return new Response(
                JSON.stringify({ error: "Sua chave Gemini é inválida ou foi revogada. Atualize-a em Configurações.", provider: "user_gemini" }),
                { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
              );
            }
            return new Response(
              JSON.stringify({ error: "Falha ao gerar com sua chave Gemini", detail: errText.slice(0, 200), provider: "user_gemini" }),
              { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
          }
        }
      } catch (e) {
        console.warn("User Gemini exception, fallback to Lovable AI:", e);
        if (LOVABLE_API_KEY) provider = "lovable_ai";
        else throw e;
      }
    }

    // ===== Tentativa 2: Lovable AI Gateway =====
    if (!imageUrl && provider === "lovable_ai" && LOVABLE_API_KEY) {
      const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3.1-flash-image-preview",
          messages: [{ role: "user", content: prompt }],
          modalities: ["image", "text"],
          temperature: imageTemperature,
          top_p: imageTopP,
          max_tokens: 8192,
        }),
      });

      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Limite de requisições atingido. Tente novamente em 1 minuto.", provider }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({
            error: "Créditos de IA esgotados. Adicione sua própria chave Gemini gratuita em Configurações ou recarregue créditos.",
            provider,
            action: "add_user_key",
          }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (!response.ok) {
        const errText = await response.text();
        console.error("Lovable AI gateway error:", response.status, errText);
        return new Response(JSON.stringify({ error: "Falha ao gerar imagem", detail: errText, provider }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const data = await response.json();
      imageUrl = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;
    }

    if (!imageUrl) {
      console.error("No image returned from any provider");
      return new Response(JSON.stringify({ error: "Nenhuma imagem gerada", provider }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ image: imageUrl, prompt, variation, provider, templateId: usedTemplateId }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("fabrica-generate-ad error:", err);
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "Erro inesperado" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
