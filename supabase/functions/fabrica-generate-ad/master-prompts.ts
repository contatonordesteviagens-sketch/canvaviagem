// ============================================================
// PROMPTS MESTRES — Fábrica de Anúncios
// ------------------------------------------------------------
// Todos os prompts seguem o "CÉREBRO COMUM" abaixo:
// banner vertical 9:16, 8K, hiper-realista, cinematográfico,
// com layout estruturado, hierarquia clara e UI minimalista.
//
// Categorias:
//   🔴 OFERTA PACOTE  → OP1..OP4 (foco: preço dominante)
//   🔵 EXPERIÊNCIA    → ED1..ED3 (foco: emoção / desejo)
// ============================================================

export interface MasterPromptVars {
  destination: string;            // Ex: "RIO DE JANEIRO"
  destinationDescription: string; // Cena detalhada do destino
  installments: string;           // Ex: "10x"
  installmentValue: string;       // Ex: "149"
  totalValue: string;             // Ex: "1490"
  packageType: string;            // Ex: "Voo + Hotel"
  duration: string;               // Ex: "5 NOITES"
  promoName: string;              // Ex: "OFERTA IMPERDÍVEL"
  city: string;                   // Cidade de origem
  primaryHex: string;             // Cor primária (hex)
  secondaryHex: string;           // Cor secundária (hex)
  agencyName: string;
  highlights: string[];           // Benefícios curtos
}

// ============================================================
// 🧠 CÉREBRO COMUM — esqueleto que TODOS os prompts usam
// ============================================================
function buildBrain(v: MasterPromptVars, opts: {
  layout: string;
  lighting: string;
  sceneDescription: string;
  headline: string;
  block: "oferta" | "experiencia";
  experienceDescription?: string; // só p/ ED
  legalFooter?: string;
}): string {
  const benefits = (v.highlights?.length ? v.highlights : ["Hospedagem", "Aéreo", "Café da manhã", "Transfer"])
    .slice(0, 5)
    .map((b) => `• ${b}`)
    .join("\n");

  const legal = opts.legalFooter
    ?? `Saindo de ${v.city}. Taxas e impostos não inclusos. Consulte disponibilidade.`;

  const valueBlock = opts.block === "oferta"
    ? `[BLOCO DE PREÇO — DESTAQUE EXTREMO]
A partir de
${v.installments} de R$ ${v.installmentValue}
Preço total: R$ ${v.totalValue}
Pacote: ${v.packageType} · ${v.duration}`
    : `[BLOCO DE VALOR — EXPERIÊNCIA]
${opts.experienceDescription || `Roteiro completo de ${v.duration} explorando ${v.destination} com curadoria local e conforto premium.`}
Pacote: ${v.packageType} · ${v.duration}`;

  return `
Um banner publicitário vertical de turismo (formato 9:16, resolução 8K), hiper-realista, com qualidade cinematográfica, iluminação natural ou dramática altamente refinada e composição profissional de nível publicitário.

A imagem deve seguir rigorosamente um layout estruturado e organizado, com hierarquia visual clara, foco em legibilidade e alto impacto visual para conversão.

A composição segue o layout: ${opts.layout}.

[FOTOGRAFIA PRINCIPAL]
Uma cena extremamente realista e detalhada de ${v.destination}, com iluminação ${opts.lighting}, mostrando ${opts.sceneDescription}.

[ELEMENTOS DE INTERFACE]
Interface moderna, limpa e minimalista, com tipografia perfeita e alinhamento matemático.
Paleta principal: cor primária ${v.primaryHex}, cor secundária ${v.secondaryHex}.

Título/Chamada: "${opts.headline}"
Destino destacado: "${v.destination}"
Selo promocional: "${v.promoName}"

${valueBlock}

Benefícios:
${benefits}

Rodapé legal:
${legal}

══════════════════════════════════════
DIRETRIZES ESTRITAS DE RENDERIZAÇÃO (UI/UX + TIPOGRAFIA):

1) SAFE ZONES (Instagram Stories):
- Top 15%: PROIBIDO colocar texto, logo ou elemento de conversão (área do perfil do Instagram).
- Bottom 20%: PROIBIDO colocar preço, botão ou texto legal (área da caixa "Enviar mensagem").
- Laterais: padding mínimo de 5%; nenhum texto encosta nas bordas.

2) HIERARQUIA E POSICIONAMENTO:
- Centro de Conversão (Middle 65%): preço/headline/destino e botões DEVEM ficar contidos aqui.
- Zero sobreposição entre blocos. Negative space matemático e claro entre todos os elementos.
- Alinhamento perfeito: layouts centralizados com eixo Y simétrico; colunas com margens internas iguais.

3) TIPOGRAFIA (TEXT ENGINE):
- Estética premium minimalista, sans-serif moderna estilo Apple/alta tecnologia.
- Contraste absoluto: branco sobre fundos escuros/vibrantes, escuro sobre claros. Texto sobre foto recebe drop-shadow suave.
- Hierarquia: preço primário = maior elemento (Ultra-Bold). Destino = segundo maior (Bold). Apoio (Por pessoa, Sem Juros) = pequeno (Regular/Medium). Rodapé legal = micro, logo acima da safe-zone inferior.

4) QUALIDADE E ANTI-DISTORÇÃO:
- Texto perfeito em português: sem caracteres alienígenas, sem fusão de letras, sem erros de ortografia.
- Realismo absoluto: proibido distorção anatômica (cabeça desproporcional, membros extras), duplicação ilógica de objetos (dois relógios no mesmo pulso), proporções não naturais.
- Renderização profissional em qualquer elemento humano ou objeto.

🚫 REGRAS ABSOLUTAS:
- Estilo geral minimalista, alto contraste, sem poluição visual, estética premium.
- Nenhum logotipo de empresa externa, nenhuma marca d'água visível.
- Textos exatamente como escritos acima, sem traduzir, sem inventar.
- Cores respeitadas com fidelidade.
- Imagem pronta para postar (sem réguas, guias, anotações ou bordas de safe-zone visíveis).
══════════════════════════════════════
`;
}

// ============================================================
// 🔴 OFERTA PACOTE — OP1..OP4
// ============================================================

// OP1 — Clássico vertical (foto top + caixa de oferta dominante)
export function promptClassicVertical(v: MasterPromptVars): string {
  return buildBrain(v, {
    layout:
      "60% superiores com fotografia fotorealista do destino; 40% inferiores com painel sólido azul-marinho escuro; caixa de oferta arredondada centralizada cruzando a divisória",
    lighting: "natural diurna brilhante, hora dourada com cores vivas e sombras nítidas",
    sceneDescription: v.destinationDescription,
    headline: v.promoName,
    block: "oferta",
  });
}

// OP2 — Cancún style (azuis e roxos vibrantes)
export function promptCancunStyle(v: MasterPromptVars): string {
  return buildBrain(v, {
    layout:
      "60% superiores com foto vibrante de praia/cidade; 40% inferiores azul-marinho; painel interno roxo vibrante dividido em 2 colunas (preço à esquerda, pílulas de pacote à direita)",
    lighting: "tropical brilhante, céu azul-turquesa, água cristalina, alto saturação cinematográfica",
    sceneDescription: v.destinationDescription,
    headline: v.promoName,
    block: "oferta",
  });
}

// OP3 — Gramado style (cartão amarelo + selo PIX serrilhado)
export function promptGramadoStyle(v: MasterPromptVars): string {
  return buildBrain(v, {
    layout:
      "foto full-bleed do destino com cartão promocional amarelo brilhante centralizado no topo, selo azul serrilhado tipo bilhete na borda inferior do cartão com '5% OFF NO PIX'",
    lighting: "diurna ensolarada, céu azul claro com nuvens fofas, cores vivas e sombras suaves",
    sceneDescription: v.destinationDescription,
    headline: `PACOTE ${v.destination}`,
    block: "oferta",
  });
}

// OP4 — Maceió style (vista aérea + cartão amarelo)
export function promptMaceioStyle(v: MasterPromptVars): string {
  return buildBrain(v, {
    layout:
      "metade superior com vista aérea cinematográfica do destino, grande cartão promocional amarelo arredondado sobreposto e centralizado, selo azul serrilhado com PIX na base do cartão",
    lighting: "aérea diurna, sol alto, água translúcida com gradientes turquesa, sombras nítidas",
    sceneDescription: `vista aérea de ${v.destinationDescription}`,
    headline: `PACOTE ${v.destination}`,
    block: "oferta",
  });
}

// ============================================================
// 🔵 EXPERIÊNCIA DE DESTINO — ED1..ED3
// ============================================================

// ED1 — Ponto turístico icônico (split amarelo + foto do landmark)
export function promptIconicLandmark(v: MasterPromptVars): string {
  return buildBrain(v, {
    layout:
      "split vertical: 30% à esquerda com painel amarelo sólido contendo nome do destino na vertical e ícone de localização; 70% à direita com foto cinematográfica do marco turístico icônico",
    lighting: "cinematográfica dramática, hora dourada, contraste alto, atmosfera aspiracional",
    sceneDescription: `o marco turístico icônico de ${v.destination}, ${v.destinationDescription}`,
    headline: "Sua próxima viagem começa aqui",
    block: "experiencia",
    experienceDescription: `Viva o icônico ${v.destination} em ${v.duration} de imersão cultural, com pontos turísticos imperdíveis e momentos que ficam para a vida.`,
  });
}

// ED2 — Split lateral amarelo (faixa amarela + foto cinematográfica)
export function promptSplitYellowSide(v: MasterPromptVars): string {
  return buildBrain(v, {
    layout:
      "asimétrico: faixa vertical amarela ocupando 30% à esquerda com nome do destino em caixa alta vertical; 70% à direita com fotografia cinematográfica do destino e badge de oferta sobreposta",
    lighting: "cinematográfica suave, golden hour ou blue hour, profundidade de campo, atmosfera de cinema",
    sceneDescription: v.destinationDescription,
    headline: "Sua próxima viagem começa aqui",
    block: "experiencia",
    experienceDescription: `Roteiro de ${v.duration} em ${v.destination} com curadoria local, conforto premium e momentos inesquecíveis.`,
  });
}

// ED3 — Card central elegante (foto full-bleed + card central)
export function promptElegantCenterCard(v: MasterPromptVars): string {
  return buildBrain(v, {
    layout:
      "fotografia full-bleed do destino ocupando todo o fundo, leve gradiente escuro nas bordas; card retangular central na cor primária ocupando 70% da largura, contendo título, linha separadora e botão CTA",
    lighting: "premium aspiracional, luz natural rica, paleta saturada, profundidade cinematográfica",
    sceneDescription: v.destinationDescription,
    headline: `Conheça ${v.destination}`,
    block: "experiencia",
    experienceDescription: `Uma experiência premium em ${v.destination}: ${v.duration} curados com hospedagem selecionada, gastronomia local e atrações exclusivas.`,
  });
}

// ============================================================
// REGISTRO DE TEMPLATES
// ============================================================
export const MASTER_TEMPLATES = [
  // 🔴 OFERTA PACOTE
  { id: "classic_vertical",   name: "OP1 · Clássico Vertical",        builder: promptClassicVertical },
  { id: "cancun_style",       name: "OP2 · Cancún (azul/roxo)",       builder: promptCancunStyle },
  { id: "gramado_style",      name: "OP3 · Gramado (cartão amarelo)", builder: promptGramadoStyle },
  { id: "maceio_style",       name: "OP4 · Maceió (vista aérea)",     builder: promptMaceioStyle },
  // 🔵 EXPERIÊNCIA DESTINO
  { id: "iconic_landmark",    name: "ED1 · Ponto turístico icônico",  builder: promptIconicLandmark },
  { id: "split_yellow_side",  name: "ED2 · Split lateral amarelo",    builder: promptSplitYellowSide },
  { id: "elegant_center",     name: "ED3 · Card central elegante",    builder: promptElegantCenterCard },
] as const;

export type MasterTemplateId = typeof MASTER_TEMPLATES[number]["id"];

export function getTemplateById(id: string) {
  return MASTER_TEMPLATES.find((t) => t.id === id);
}

export function pickRandomTemplates(n: number, exclude: string[] = []): typeof MASTER_TEMPLATES[number][] {
  const pool = MASTER_TEMPLATES.filter((t) => !exclude.includes(t.id));
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, n);
}
