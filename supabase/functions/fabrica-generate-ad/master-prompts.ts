// ============================================================
// PROMPTS MESTRES — Fábrica de Anúncios
// ------------------------------------------------------------
// Estrutura em 3 camadas:
//   1) CÉREBRO COMUM   (buildBrain)   — esqueleto fixo de TODOS os anúncios
//   2) REGRAS DA CATEGORIA            — sobrepostas ao cérebro
//        🔴 OFERTA PACOTE  → conversão direta, preço dominante
//        🔵 EXPERIÊNCIA    → desejo, emoção, imagem dominante
//   3) ESPECIALIZAÇÃO DO PROMPT       — layout único de cada OP/ED
//
// Categorias finais:
//   🔴 OP1..OP4
//   🔵 ED1..ED4
// ============================================================

export interface MasterPromptVars {
  destination: string;
  destinationDescription: string;
  installments: string;
  installmentValue: string;
  totalValue: string;
  packageType: string;
  duration: string;
  promoName: string;
  city: string;
  primaryHex: string;
  secondaryHex: string;
  agencyName: string;
  highlights: string[];
  creativeSeed?: string;
}

// ============================================================
// 🔴 REGRAS ESPECÍFICAS — OFERTA DE PACOTE
// ============================================================
const OFERTA_RULES = `
══════════════════════════════════════
🔴 REGRAS ESPECÍFICAS DA CATEGORIA — OFERTA DE PACOTE
- FOCO TOTAL EM CONVERSÃO DIRETA.
- Esta categoria deve parecer um anúncio agressivo de performance, NÃO editorial.
- O PREÇO deve ser o MAIOR elemento visual da composição,
  ocupando NO MÍNIMO 25% da área do bloco central.
- A imagem/fotografia é apenas suporte visual; ela NÃO pode ser protagonista.
- Use cores vibrantes e contrastantes para destacar preço e oferta:
  roxo, azul-elétrico, amarelo, dourado.
- Elementos de URGÊNCIA SEMPRE presentes (escolha 1 ou 2):
  "OFERTA EXCLUSIVA" · "APENAS HOJE" · "ÚLTIMAS VAGAS".
- Selos / botões devem reforçar pelo menos 2 destes:
  "SEM JUROS" · "PIX" · "VOO + HOTEL".
- Tom de copy: direto, comercial, cria gatilho de decisão imediata.
══════════════════════════════════════
`;

// ============================================================
// 🔵 REGRAS ESPECÍFICAS — EXPERIÊNCIA DE DESTINO
// ============================================================
const EXPERIENCIA_RULES = `
══════════════════════════════════════
🔵 REGRAS ESPECÍFICAS DA CATEGORIA — EXPERIÊNCIA DE DESTINO
- FOCO EM DESEJO E EXPERIÊNCIA.
- Esta categoria deve parecer editorial/inspiracional, NÃO anúncio agressivo de preço.
- A IMAGEM deve ser a protagonista absoluta e ocupar a maior área visual.
- O PREÇO NÃO é o elemento principal — apresente-o pequeno, secundário e discreto dentro da área segura central, nunca no rodapé.
- Linguagem emocional obrigatória: "Descubra", "Explore", "Viva", "Conheça".
- Objetivo: gerar interesse e desejo, NÃO pressão de compra imediata.
- Estética editorial, atmosférica, aspiracional.
══════════════════════════════════════
`;

// ============================================================
// 🧠 CÉREBRO COMUM
// ============================================================
function buildBrain(v: MasterPromptVars, opts: {
  category: "oferta" | "experiencia";
  layout: string;
  lighting: string;
  sceneDescription: string;
  headline: string;
  experienceDescription?: string;
  legalFooter?: string;
  /** Texto livre extra com a "especialização" daquele OP/ED. */
  specialization?: string;
}): string {
  const benefits = (v.highlights?.length ? v.highlights : ["Hospedagem", "Aéreo", "Café da manhã", "Transfer"])
    .slice(0, 5)
    .map((b) => `• ${b}`)
    .join("\n");

  const legal = opts.legalFooter
    ?? `Saindo de ${v.city}. Taxas e impostos não inclusos. Consulte disponibilidade.`;

  const valueBlock = opts.category === "oferta"
    ? `[BLOCO DE PREÇO — DESTAQUE EXTREMO · MÍNIMO 25% DA ÁREA CENTRAL]
A partir de
${v.installments} de R$ ${v.installmentValue}     ← FONTE GIGANTE, ULTRA-BOLD
Preço total: R$ ${v.totalValue}
Selos obrigatórios: SEM JUROS · PIX · ${v.packageType.toUpperCase()}
Urgência: ${v.promoName.toUpperCase()}`
    : `[BLOCO DE EXPERIÊNCIA — DISCRETO]
${opts.experienceDescription || `Roteiro de ${v.duration} explorando ${v.destination} com curadoria local e conforto.`}
Pacote: ${v.packageType} · ${v.duration}
Preço pequeno e secundário: a partir de R$ ${v.installmentValue} em ${v.installments}, dentro da área segura central.`;

  const categoryRules = opts.category === "oferta" ? OFERTA_RULES : EXPERIENCIA_RULES;
  const creativeSeed = v.creativeSeed || `${opts.category}-${opts.layout.slice(0, 24)}`;

  return `
Um banner publicitário vertical de turismo (formato 9:16, resolução 8K), hiper-realista, com qualidade cinematográfica, iluminação natural ou dramática altamente refinada e composição profissional de nível publicitário.

A imagem deve seguir rigorosamente um layout estruturado e organizado, com hierarquia visual clara, foco em legibilidade e alto impacto visual para conversão.

A composição segue o layout: ${opts.layout}.

[VARIAÇÃO CRIATIVA OBRIGATÓRIA]
ID de variação: ${creativeSeed}.
Mesmo que destino, preço e benefícios sejam parecidos com uma geração anterior, crie uma interpretação visual nova: novo enquadramento fotográfico, nova posição dos blocos, nova proporção de cartão/faixa, novo ritmo tipográfico e nova distribuição de respiro. Não repita a composição anterior.

[REFERÊNCIAS DE ESTILO]
Use a biblioteca de referências de anúncios enviada pelo usuário APENAS como inspiração estrutural: divisão 60/40 foto + base sólida, cartão amarelo de pacote, faixa lateral vibrante, selo tipo bilhete Pix, layout editorial topo/base e grid editorial de experiências. NÃO copie destinos, preços, datas, hotéis, textos legais ou informações fixas dessas referências. Os únicos dados permitidos são os dados preenchidos no formulário abaixo.

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

${opts.specialization ? `[ESPECIALIZAÇÃO DESTE PROMPT]\n${opts.specialization}\n` : ""}
${categoryRules}

══════════════════════════════════════
DIRETRIZES ESTRITAS DE RENDERIZAÇÃO DE INTERFACE (UI/UX) E TIPOGRAFIA:
A imagem deve ser gerada no formato Vertical 9:16 (resolução 8K). O motor de geração deve obedecer rigorosamente ao seguinte sistema de grid matemático, 'Safe Zones' do Instagram Stories e prevenção de artefatos:

1. SAFE ZONES (ZONAS DE SEGURANÇA DO INSTAGRAM):
- Margem Superior (Top 15%): É TERMINANTEMENTE PROIBIDO colocar qualquer texto, logotipo ou elemento crucial de conversão nos 15% superiores da imagem.
- Margem Inferior (Bottom 20%): É TERMINANTEMENTE PROIBIDO colocar qualquer texto legal, preço ou botão nos 20% inferiores da imagem.
- Margens Laterais (Padding de 5%): Nenhum texto pode tocar a borda.

2. POSICIONAMENTO:
- Zero sobreposição entre elementos.
- Espaçamento matemático e simétrico entre todos os blocos.
- Centro de conversão obrigatório nos 65% centrais da imagem (preço, headline, destino e CTA).

3. TIPOGRAFIA:
- PREÇO = maior elemento da composição (Ultra-Bold / Heavy).
- DESTINO = segundo maior elemento (Bold).
- Texto com CONTRASTE ABSOLUTO: branco sobre fundos escuros/vibrantes; escuro sobre fundos claros. Drop-shadow suave quando o texto estiver sobre foto.
- Sans-serif moderna premium estilo Apple/alta tecnologia.

4. QUALIDADE:
- SEM distorções anatômicas (cabeças desproporcionais, membros extras, duplicação ilógica de objetos como dois relógios no mesmo pulso).
- SEM erros de texto: ortografia perfeita em português, sem caracteres alienígenas, sem fusão de letras.
- REALISMO ABSOLUTO em qualquer elemento humano, objeto ou cenário.

🚫 REGRAS ABSOLUTAS ADICIONAIS:
- GERAR UM ÚNICO BANNER PUBLICITÁRIO DE TURISMO. A saída deve conter APENAS 1 imagem única.
- É PROIBIDO gerar imagens duplicadas, repetidas, variações lado a lado, mockups em tela dupla ou duas peças dentro do mesmo arquivo.
- Escolha UM layout por geração e NÃO misture cartão central, divisão topo/base, barra lateral e grid no mesmo banner.
- É PROIBIDO duplicar fotografia, cartões, blocos de preço, botões, selos ou listas dentro da mesma imagem.
- É PROIBIDO sobrepor textos, preços, ícones ou blocos. Cada elemento deve ter respiro claro; nenhum texto pode encostar em outro bloco.
- Se a categoria for OFERTA PACOTE, use visual de venda direta com preço protagonista; se for EXPERIÊNCIA DE DESTINO, use visual editorial com fotografia protagonista. As duas categorias NÃO podem parecer o mesmo estilo visual.
- Estilo geral minimalista, alto contraste, sem poluição visual, estética premium.
- Nenhum logotipo de empresa externa, nenhuma marca d'água visível.
- Textos renderizados EXATAMENTE como escritos acima, sem traduzir, sem inventar palavras.
- Cores respeitadas com fidelidade total aos hex informados.
- Imagem pronta para postar — sem réguas, guias, marcações de safe-zone ou anotações técnicas visíveis.
══════════════════════════════════════
`;
}

// ============================================================
// 🔴 OFERTA PACOTE — OP1..OP4
// ============================================================

// 🔥 OP1 — CARTÃO DIVIDIDO (base Cancún)
export function promptClassicVertical(v: MasterPromptVars): string {
  return buildBrain(v, {
    category: "oferta",
    layout:
      "DIVISÃO HORIZONTAL EXATA — topo com fotografia full-bleed do destino e base com bloco sólido vibrante. O cartão de oferta fica INTEIRO dentro do bloco sólido inferior, sem cruzar divisórias e sem encostar em outros elementos",
    lighting: "natural diurna brilhante, hora dourada, cores vivas, sombras nítidas",
    sceneDescription: v.destinationDescription,
    headline: v.promoName,
    specialization:
      "• Cartão central íntegro e separado, com sombra projetada para profundidade, SEM sobrepor foto, badge ou lista.\n• DIVISÃO VISUAL clara entre foto e bloco sólido — zero transição gradual.\n• PREÇO extremamente dominante dentro do cartão (mínimo 30% do cartão).\n• Cores vibrantes obrigatórias: roxo + amarelo OU azul-elétrico + dourado.",
  });
}

// 🔥 OP2 — CARTÃO CENTRAL FLUTUANTE
export function promptCancunStyle(v: MasterPromptVars): string {
  return buildBrain(v, {
    category: "oferta",
    layout:
      "Fundo 100% FOTOGRÁFICO ocupando toda a tela (sem bloco sólido), com CARTÃO CENTRAL amarelo vibrante sobreposto e centralizado; selo de desconto separado acima do cartão, nunca sobre a borda do cartão",
    lighting: "tropical brilhante, céu turquesa, água cristalina, alta saturação cinematográfica",
    sceneDescription: v.destinationDescription,
    headline: v.promoName,
    specialization:
      "• Cartão AMARELO vibrante OU dourado, cantos arredondados, sombra suave para flutuar sobre a foto.\n• PREÇO no centro absoluto do cartão, fonte Ultra-Bold, ocupando 30%+ do cartão.\n• Selo CIRCULAR de desconto (% OFF, OFERTA EXCLUSIVA) deve ficar separado do cartão com margem visível; NÃO sobrepor texto nem bordas.\n• Foto NUNCA é cortada de forma agressiva — enquadramento limpo por trás do cartão como background de suporte.",
  });
}

// 🔥 OP3 — CARTÃO AÉREO (TOP DOWN)
export function promptGramadoStyle(v: MasterPromptVars): string {
  return buildBrain(v, {
    category: "oferta",
    layout:
      "FOTO AÉREA top-down ou drone-shot do destino ocupando toda a tela, com CARTÃO arredondado sobreposto na parte SUPERIOR (não centralizado), permitindo respiro inferior para a vista panorâmica respirar",
    lighting: "aérea diurna, sol alto, água translúcida com gradientes turquesa, sombras nítidas",
    sceneDescription: `vista aérea (drone) de ${v.destinationDescription}`,
    headline: `PACOTE ${v.destination}`,
    specialization:
      "• Câmera obrigatoriamente em ângulo TOP-DOWN ou drone alto, mostrando ESCALA e amplitude.\n• Cartão posicionado no TERÇO SUPERIOR — não no centro — para deixar a paisagem respirar.\n• Preço FORTE mas INTEGRADO ao cartão, com selo serrilhado tipo bilhete azul anexado na borda inferior do cartão (PIX 5% OFF).\n• Sensação de descoberta + escala da viagem.",
  });
}

// 🔥 OP4 — BARRA LATERAL (PERFORMANCE)
export function promptMaceioStyle(v: MasterPromptVars): string {
  return buildBrain(v, {
    category: "oferta",
    layout:
      "SPLIT VERTICAL — 30% à ESQUERDA com barra sólida vibrante (roxo, azul-elétrico ou amarelo) contendo TODO o texto e CTA; 70% à DIREITA com fotografia limpa do destino",
    lighting: "comercial brilhante, alto contraste, cores saturadas",
    sceneDescription: v.destinationDescription,
    headline: v.promoName,
    specialization:
      "• Barra lateral 30% com COR SÓLIDA vibrante — contém destino, preço gigante e CTA.\n• Hierarquia de leitura ULTRA-RÁPIDA (3 segundos): destino → preço → CTA.\n• CTA FORTE em botão retangular contrastante: 'RESERVAR AGORA' ou 'GARANTIR VAGA'.\n• Estilo de anúncio direto de performance (Google Ads / Meta Ads), sem ornamentos.",
  });
}

// 🔥 OP5 — BILHETE PIX / CARTÃO AMARELO
export function promptTicketPixCard(v: MasterPromptVars): string {
  return buildBrain(v, {
    category: "oferta",
    layout:
      "FOTO AÉREA OU PANORÂMICA ocupando 100% do fundo com um CARTÃO AMARELO grande e limpo no centro seguro; dentro do cartão há cabeçalho PACOTE + DESTINO, linha de ícones dos inclusos, preço maciço e selo azul serrilhado PIX anexado abaixo com margem sem sobreposição",
    lighting: "natural brilhante, comercial, cores turquesa/azul com contraste alto no cartão amarelo",
    sceneDescription: `vista ampla e clara de ${v.destinationDescription}`,
    headline: `PACOTE ${v.destination}`,
    specialization:
      "• Inspirado em cartões amarelos premium de pacote, mas usando APENAS os dados do formulário.\n• O cartão amarelo não pode encostar nas safe zones; deve parecer uma peça única e limpa.\n• Selo tipo bilhete PIX azul fica abaixo do preço com separação visível, nunca sobre texto.\n• A fotografia de fundo serve de contexto; preço e oferta dominam a conversão.",
  });
}

// 🔥 OP6 — FAIXA LATERAL + HERO DE PERFORMANCE
export function promptSideHeroPerformance(v: MasterPromptVars): string {
  return buildBrain(v, {
    category: "oferta",
    layout:
      "PAINEL LATERAL esquerdo vibrante ocupando 28-32% da largura com destino, selos e preço; lado direito com uma fotografia hero única ocupando 68-72%, com CTA em botão isolado no centro seguro",
    lighting: "dramática de fim de tarde ou manhã, alto contraste comercial, cores saturadas",
    sceneDescription: `${v.destinationDescription} em enquadramento hero cinematográfico, sem duplicar cenas`,
    headline: `OFERTA ${v.destination}`,
    specialization:
      "• Referência estrutural: faixa lateral amarela/roxa + fotografia grande, sem copiar conteúdo fixo.\n• Leitura em 3 segundos: destino → preço → CTA.\n• Painel lateral deve ter respiro interno alto, sem texto vertical colidindo.\n• Nunca usar grid; apenas uma foto hero e um painel de conversão.",
  });
}

// ============================================================
// 🔵 EXPERIÊNCIA DE DESTINO — ED1..ED4
// ============================================================

// 🌍 ED1 — STORYTELLING (Europa)
export function promptIconicLandmark(v: MasterPromptVars): string {
  return buildBrain(v, {
    category: "experiencia",
    layout:
      "BARRA LATERAL FINA (20-25%) à esquerda com fundo neutro (creme, off-white ou tom terra) contendo título narrativo vertical e ícone discreto; IMAGEM PRINCIPAL ocupando 75-80% à direita, em estilo editorial",
    lighting: "cinematográfica dramática, hora dourada ou blue hour, atmosfera aspiracional de revista",
    sceneDescription: `o marco turístico icônico de ${v.destination}, ${v.destinationDescription}, com pessoas pequenas no quadro para dar escala`,
    headline: `Descubra ${v.destination}`,
    experienceDescription: `Uma jornada de ${v.duration} pelas paisagens icônicas e pelas histórias que fazem de ${v.destination} um destino inesquecível.`,
    specialization:
      "• NARRATIVA VISUAL: a foto conta uma história — não é apenas um registro do ponto turístico.\n• Título FORTE em fonte serifada ou sans-serif elegante, posicionado verticalmente na barra lateral.\n• Ambientação RICA: clima, hora do dia e atmosfera devem ser palpáveis.\n• Linguagem editorial estilo revista de viagem.",
  });
}

// 🌍 ED2 — CHECKLIST + GRID (combo de destinos)
export function promptSplitYellowSide(v: MasterPromptVars): string {
  return buildBrain(v, {
    category: "experiencia",
    layout:
      "SPLIT VERTICAL — 45% à esquerda com fundo claro/neutro contendo título emocional + checklist de experiências/roteiro; 55% à direita com GRID editorial de 3-4 fotografias DIFERENTES do destino empilhadas (paisagem, gastronomia, cultura, atividade)",
    lighting: "cada foto do grid com sua própria atmosfera — natural variada, autêntica",
    sceneDescription: `múltiplos cenários de ${v.destinationDescription} formando um mosaico de experiências (paisagem icônica, gastronomia local, cultura, atividade típica)`,
    headline: `Explore ${v.destination}`,
    experienceDescription: `Conheça as múltiplas faces de ${v.destination}: paisagens, sabores, cultura e momentos únicos em ${v.duration}.`,
    specialization:
      "• Lado direito = GRID de 3 ou 4 fotos pequenas mostrando experiências DIFERENTES (é proibido repetir a mesma foto/cena).\n• Lado esquerdo = CHECKLIST visual com respiro generoso entre linhas.\n• Sensação de VARIEDADE e roteiro completo.\n• Comunica 'tudo o que está incluso' sem soar comercial.\n• Grid permitido APENAS nesta categoria de experiência; ainda assim é um único banner, não múltiplos anúncios.",
  });
}

// 🌍 ED3 — CLEAN INFORMATIVO
export function promptElegantCenterCard(v: MasterPromptVars): string {
  return buildBrain(v, {
    category: "experiencia",
    layout:
      "DIVISÃO HORIZONTAL — TOPO 40% com fundo neutro (off-white, creme ou tom pastel) contendo título grande + dados informativos limpos; BASE 60% com fotografia única e impactante do destino",
    lighting: "natural suave, paleta clean, atmosfera convidativa sem dramaticidade",
    sceneDescription: v.destinationDescription,
    headline: `Conheça ${v.destination}`,
    experienceDescription: `${v.duration} para se reconectar com ${v.destination}. Hospedagem selecionada, gastronomia local e tempo para o que importa.`,
    specialization:
      "• LEITURA SIMPLES: máxima clareza, mínimo de elementos, muito espaço em branco.\n• INFORMATIVO: data, duração, tipo de pacote em linha discreta no topo.\n• Estética ELEGANTE de site de hotelaria boutique.\n• Sem urgência, sem selos, sem ornamentos.",
  });
}

// 🌍 ED4 — EDITORIAL VISUAL
export function promptEditorialVisual(v: MasterPromptVars): string {
  return buildBrain(v, {
    category: "experiencia",
    layout:
      "DUAS COLUNAS verticais — coluna ESQUERDA (40%) com bloco editorial (título grande, parágrafo curto narrativo, número de página estilo revista); coluna DIREITA (60%) com UMA fotografia vertical principal e um pequeno recorte de detalhe complementar, sem repetir a mesma imagem",
    lighting: "editorial sofisticada, paleta filmica, tons quentes ou frios coerentes entre as duas fotos",
    sceneDescription: `duas cenas complementares de ${v.destinationDescription} (uma ampla, uma detalhe íntimo)`,
    headline: `Viva ${v.destination}`,
    experienceDescription: `Um capítulo de ${v.duration} em ${v.destination} — escrito por você, curado por nós.`,
    specialization:
      "• Layout ESTILO REVISTA editorial (Cereal, Kinfolk, Condé Nast Traveller).\n• STORYTELLING LEVE: parágrafo curto evocativo, não vendedor.\n• Fonte de título preferencialmente SERIFADA elegante (estilo editorial).\n• Detalhes editoriais sutis: número de página, linha fina divisória, kerning amplo.\n• Sofisticação MÁXIMA, comercialidade ZERO.",
  });
}

// ============================================================
// REGISTRO DE TEMPLATES
// ============================================================
export const MASTER_TEMPLATES = [
  // 🔴 OFERTA PACOTE
  { id: "classic_vertical",   name: "OP1 · Cartão Dividido",          builder: promptClassicVertical },
  { id: "cancun_style",       name: "OP2 · Cartão Central Flutuante", builder: promptCancunStyle },
  { id: "gramado_style",      name: "OP3 · Cartão Aéreo (Top Down)",  builder: promptGramadoStyle },
  { id: "maceio_style",       name: "OP4 · Barra Lateral Performance",builder: promptMaceioStyle },
  // 🔵 EXPERIÊNCIA DESTINO
  { id: "iconic_landmark",    name: "ED1 · Storytelling",             builder: promptIconicLandmark },
  { id: "split_yellow_side",  name: "ED2 · Checklist + Grid",         builder: promptSplitYellowSide },
  { id: "elegant_center",     name: "ED3 · Clean Informativo",        builder: promptElegantCenterCard },
  { id: "editorial_visual",   name: "ED4 · Editorial Visual",         builder: promptEditorialVisual },
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
