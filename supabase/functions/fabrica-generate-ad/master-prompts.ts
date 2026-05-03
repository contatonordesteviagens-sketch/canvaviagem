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
  /** Cor de texto auto-calculada para contraste sobre primaryHex (#000000 ou #FFFFFF). */
  primaryTextHex?: string;
  /** Cor de texto auto-calculada para contraste sobre secondaryHex (#000000 ou #FFFFFF). */
  secondaryTextHex?: string;
  agencyName: string;
  highlights: string[];
  creativeSeed?: string;
  /** Headlines a EVITAR nesta geração (vindas do GenerationGuard do cliente). */
  forbiddenHeadlines?: string[];
  /** Layout/templateIds a EVITAR (apenas log/uso futuro). */
  forbiddenLayouts?: string[];
  /** Formato de saída: "square" (1:1 feed) ou "story" (9:16). Default: story. */
  format?: "square" | "story";
}

/**
 * Luminance-based contrast picker (WCAG simplified).
 * Retorna "#000000" para fundos claros, "#FFFFFF" para fundos escuros.
 */
export function pickContrastText(hex: string): "#000000" | "#FFFFFF" {
  const h = (hex || "").replace("#", "").trim();
  if (h.length !== 6) return "#FFFFFF";
  const r = parseInt(h.slice(0, 2), 16) / 255;
  const g = parseInt(h.slice(2, 4), 16) / 255;
  const b = parseInt(h.slice(4, 6), 16) / 255;
  const toLin = (c: number) => (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));
  const L = 0.2126 * toLin(r) + 0.7152 * toLin(g) + 0.0722 * toLin(b);
  return L > 0.5 ? "#000000" : "#FFFFFF";
}

/**
 * Bloco de instrução INEGOCIÁVEL — adicionado no topo de TODO prompt gerado.
 * Proíbe low-contrast (light-on-light / dark-on-dark).
 */
export const CRITICAL_CONTRAST_HEADER = `[CRITICAL DESIGN LOGIC & CONTRAST RULE: The AI MUST strictly obey logical UI contrast rules. NEVER generate light text on a light background. NEVER generate dark text on a dark background. IF a button or shape is white or light-colored, the text inside it MUST be pure black or very dark. IF a button or shape is dark, the text inside it MUST be pure white. Failure to provide legible, high-contrast text is a critical error.]`;

// ============================================================
// 🔴 REGRAS ESPECÍFICAS — OFERTA DE PACOTE
// ============================================================
const OFERTA_RULES = `
══════════════════════════════════════
🎯 REFERÊNCIA VISUAL OBRIGATÓRIA — ESTILO "CVC / AGÊNCIA BRASILEIRA"
══════════════════════════════════════
A composição deve seguir o padrão visual de anúncios de agências de viagem brasileiras (CVC, Decolar, Hurb), com esta anatomia:

1. FOTO REAL DO DESTINO ocupando o fundo inteiro do banner (igreja, praia, monumento, paisagem icônica reconhecível) — sem efeitos artísticos, sem ilustração, sem render 3D. Foto de catálogo turístico, nítida, cores vibrantes e luz natural cristalina.

2. CAIXA DE PREÇO RETANGULAR no terço superior, com cantos levemente arredondados, em cor SECUNDÁRIA forte (amarelo, dourado ou cor de destaque da paleta), contendo nesta ordem vertical:
   • Etiqueta pequena no topo: "PACOTE" + NOME DO DESTINO em maiúsculas e negrito (tipografia bold sans-serif).
   • Linha de informações limpa: APENAS o texto da duração (ex: "5 DIAS"). Remova ícones redundantes de transporte/alimentação desta linha.
   • Bloco "a partir de" pequeno + selo redondo "12X sem juros" colado ao valor R$ XXX em tipografia GIGANTE bold (o preço é o maior elemento da caixa).
   • Linha fina embaixo: "Total por pessoa: R$ X.XXX".
   • Faixa inferior contrastante (azul escuro ou cor primária) com "5% OFF À VISTA NO PIX" + ícone PIX.

3. NUNCA desenhar selo/logo de agência — esse elemento é sobreposto depois pelo compositor. Deixe esse espaço vazio.

4. TEXTO LATERAL VERTICAL fino na lateral esquerda em fonte miúda branca: condições legais ("Saída de [cidade] em DD/MM/AAAA. Hospedagem [hotel]. Oferta sujeita à disponibilidade. Consulte condições.").

5. PROPORÇÃO 9:16 (story) — composição vertical com foto cobrindo 100% do fundo e a caixa amarela posicionada no terço superior central, deixando a paisagem respirar abaixo.

REGRA DE OURO: o resultado deve PARECER um story real de agência de viagem brasileira pronto para WhatsApp/Instagram — não um pôster de design moderno, não editorial, não minimalista. É anúncio comercial direto e reconhecível.

══════════════════════════════════════
🔴 REGRAS ESPECÍFICAS DA CATEGORIA — OFERTA DE PACOTE
- FOCO TOTAL EM CONVERSÃO DIRETA. Anúncio de performance comercial.
- O PREÇO deve ser o MAIOR elemento visual da composição (no mínimo 25% da área do bloco central).
- A imagem/fotografia é apenas suporte visual de fundo.
- Use EXCLUSIVAMENTE a paleta enviada. A cor primária domina os blocos e a secundária domina o preço/selos.
- Elementos de URGÊNCIA obrigatórios: "OFERTA EXCLUSIVA", "PIX", "SEM JUROS".
- Tom de copy: direto, agressivo, gatilho de decisão imediata.

[OBRIGAÇÃO DE VARIAÇÃO REAL]
Para garantir variação visual entre gerações, a IA receberá no prompt uma instrução de CÂMERA e LAYOUT. Você DEVE seguir a câmera exata especificada nesta rodada para que o anúncio fique estruturalmente único.
══════════════════════════════════════
`;

// ============================================================
// 🔵 REGRAS ESPECÍFICAS — EXPERIÊNCIA DE DESTINO
// ============================================================
const EXPERIENCIA_RULES = `
══════════════════════════════════════
🔵 REGRAS ESPECÍFICAS DA CATEGORIA — EXPERIÊNCIA DE DESTINO
- FOCO TOTAL EM DESEJO, EMOÇÃO E EXPERIÊNCIA. Não é um anúncio de venda.
- A FOTOGRAFIA é a protagonista absoluta e deve ocupar no MÍNIMO 70% da composição (em alguns layouts até 90%).
- Estética editorial premium, aspiracional, estilo capa de revista de viagem.
- O PREÇO é OPCIONAL. Se usar, deve ser MINÚSCULO e discreto: "A partir de R$ X".

✅ HIERARQUIA OBRIGATÓRIA:
1. Imagem (protagonista absoluta full-bleed, 100% da tela)
2. Título emocional
3. Subtítulo leve
4. Lista de experiências (apenas texto leve, sem caixas/cartões)

✅ ESTILO VISUAL:
    - A FOTOGRAFIA DEVE PREENCHER 100% DA TELA, edge-to-edge. 
    - Muito espaço negativo DENTRO da foto para receber texto.
    - Tipografia leve e elegante (serifada ou sans-serif refinada).
    ══════════════════════════════════════
    `;
    
    // ============================================================
    // ⬛ REGRAS ESPECÍFICAS — AUTORIDADE PREMIUM (DARK 3D)
    // ============================================================
    const AUTORIDADE_DARK_RULES = `
    ══════════════════════════════════════
    ⬛ REGRAS ESPECÍFICAS DA CATEGORIA — AUTORIDADE PREMIUM
    - FOCO TOTAL NA AGÊNCIA E NO PACOTE, NÃO NO DESTINO.
    - PROIBIDO: Fotografias reais de turismo (sem praias, sem hotéis, sem céu azul).
    - PROIBIDO ABSOLUTAMENTE: qualquer luz neon, laser, glow colorido ou efeito luminoso brilhante.
    - FUNDO obrigatório: Dark Mode fosco e sóbrio (preto, chumbo escuro ou cinza grafite muito escuro). Sem gradientes luminosos.
    - ESTÉTICA OBRIGATÓRIA: Fintech corporativo premium (estilo Nubank, Stripe, Itaú). Interface limpa, tipografia grossa, paleta sóbria.
    - ELEMENTOS 3D PERMITIDOS: objetos físicos opacos com luz de estúdio direcional suave (globos metálicos foscos, moedas opacas, malas, passaportes). Nunca translúcidos com brilho neon.
    - As cores primária e secundária DEVEM dominar as fontes e elementos. Alto contraste sem brilho artificial.
    - ADAPTAÇÃO AO FORMATO: Jamais deixe textos cortados nas bordas. Respeite as safe zones.
    - VENDA DIRETA: Preço grande, destino chamativo, layout de aplicativo financeiro.
    ══════════════════════════════════════
    `;
    

// ============================================================
// 🎨 POOL DE HEADLINES ROTATIVOS — EXPERIÊNCIA
// ------------------------------------------------------------
// Cada chamada de template ED escolhe um headline diferente,
// indexado pelo creativeSeed (timestamp+template+variação),
// garantindo variação real de copy entre gerações consecutivas.
// ============================================================
// ============================================================
// 🎨 POOLS DE HEADLINES — SET NOVO (Regra 5 do usuário)
// ------------------------------------------------------------
// 🚫 BANIDOS PARA SEMPRE: "Conheça X", "Viva X", "Explore X", "Descubra X".
// Apenas frases editoriais sem padrão "verbo + destino".
// O backend recebe `forbiddenHeadlines[]` do cliente (GenerationGuard) e
// PROÍBE qualquer escolha que tenha aparecido nas últimas N gerações.
// ============================================================

// 🚫 Banidos para sempre (padrões repetitivos detectados pelo usuário):
// "o melhor de", "seu próximo destino", "algo te espera", "o destino te espera",
// "conheça/viva/explore/descubra X".
const HEADLINE_POOL_EXPERIENCIA: ((d: string) => string)[] = [
  // 🔹 Emocional / Aspiracional
  () => `Momentos que ficam para sempre`,
  () => `Um lugar para se desconectar`,
  () => `Onde tudo faz sentido`,
  () => `Viva algo diferente de tudo`,
  () => `Histórias começam aqui`,
  () => `Memórias que você leva pra vida`,
  // 🔹 Experiência
  () => `Mais que uma viagem, uma experiência`,
  () => `Dias inesquecíveis começam aqui`,
  () => `Seu próximo capítulo começa aqui`,
  () => `Uma experiência que vale cada segundo`,
  () => `Prepare-se para viver isso`,
  () => `Isso não é só uma viagem`,
  // 🔹 Impacto curto
  () => `Simplesmente incrível`,
  () => `Imperdível`,
  () => `Surpreendente do começo ao fim`,
  () => `Difícil explicar, fácil amar`,
  // 🔹 Conversacional / Pergunta
  () => `Partiu viajar?`,
  () => `Bora viver isso?`,
  () => `Já imaginou estar aqui?`,
  () => `Tá esperando o quê?`,
  () => `Seu descanso começa agora`,
  // 🔹 Narrativo
  () => `O destino certo na hora certa`,
  () => `O lugar que você estava procurando`,
  () => `Um cenário que parece filme`,
  () => `Tudo que você precisa em um só lugar`,
  // 🔹 Premium
  () => `Experiências que elevam sua viagem`,
  () => `Um novo padrão de viajar`,
  () => `Sofisticação e natureza no mesmo lugar`,
  () => `Viagens pensadas nos mínimos detalhes`,
  // 🔹 Com destino (uso moderado — só algumas)
  (d) => `${d} do jeito que você merece`,
  (d) => `${d} além do óbvio`,
  (d) => `Sua próxima história começa em ${d}`,
];

const HEADLINE_POOL_OFERTA: ((d: string) => string)[] = [
  // 🔹 Conversão direta
  () => `Férias com tudo resolvido`,
  () => `Tudo incluso, sem complicação`,
  () => `Reserva já garantida`,
  () => `Preço que cabe no bolso`,
  () => `Sua viagem começa agora`,
  () => `Pacote completo, preço fechado`,
  // 🔹 Urgência leve
  () => `Hora de arrumar as malas`,
  () => `Não dá pra deixar passar`,
  () => `Última chance dessa semana`,
  () => `Aproveite enquanto tem`,
  // 🔹 Pergunta / Conversacional
  () => `Bora marcar essa?`,
  () => `Quando foi sua última viagem?`,
  () => `Que tal essa data?`,
  // 🔹 Promessa
  () => `Viaje sem dor de cabeça`,
  () => `Pague em parcelas, viaje agora`,
  () => `Do voo ao hotel, tudo resolvido`,
  () => `O pacote certo para o seu plano`,
  // 🔹 Com destino (variações leves)
  (d) => `Pacote para ${d}`,
  (d) => `Promoção ${d}`,
  (d) => `${d} com tudo incluso`,
  (d) => `Sua viagem para ${d}`,
];

function normalize(s: string): string {
  return s.toLowerCase().trim();
}

// Padrões PROIBIDOS por substring (Regra do usuário — anti-colapso)
const BANNED_PATTERNS = [
  "o melhor de",
  "seu próximo destino",
  "algo te espera",
  "o destino te espera",
  "conheça",
  "explore",
  "descubra",
];

function pickFromPool(
  pool: ((d: string) => string)[],
  destination: string,
  creativeSeed: string,
  forbidden: string[] = [],
): string {
  const banned = new Set(forbidden.map(normalize));
  const isBanned = (s: string) => {
    const k = normalize(s);
    if (banned.has(k)) return true;
    return BANNED_PATTERNS.some((b) => k.includes(b));
  };
  // Embaralha com seed + ruído real para evitar colisões em cliques rápidos
  const noise = Math.floor(Math.random() * 1e6);
  const seedSum = [...creativeSeed].reduce((acc, c) => acc + c.charCodeAt(0), 0) + noise;
  for (let i = 0; i < pool.length; i++) {
    const idx = (seedSum + i) % pool.length;
    const candidate = pool[idx](destination);
    if (!isBanned(candidate)) return candidate;
  }
  // Tudo bloqueado → libera por seed (último recurso)
  return pool[seedSum % pool.length](destination);
}

function pickExperienciaHeadline(
  destination: string,
  creativeSeed: string,
  forbidden: string[] = [],
): string {
  return pickFromPool(HEADLINE_POOL_EXPERIENCIA, destination, creativeSeed, forbidden);
}

function pickOfertaHeadline(
  destination: string,
  creativeSeed: string,
  forbidden: string[] = [],
): string {
  return pickFromPool(HEADLINE_POOL_OFERTA, destination, creativeSeed, forbidden);
}


// ============================================================
// 🧠 CÉREBRO COMUM
// ============================================================
function buildBrain(v: MasterPromptVars, opts: {
  category: "oferta" | "experiencia" | "autoridade_dark";
  layout: string;
  lighting: string;
  sceneDescription: string;
  headline: string;
  experienceDescription?: string;
  legalFooter?: string;
  specialization?: string;
}): string {
  const valueBlock = opts.category === "oferta"
    ? `[BLOCO DE PREÇO — CARD LIMPO E PROFISSIONAL]
APENAS três informações dentro do card, nesta ordem vertical e bem espaçadas:
  1) Valor da parcela: ${v.installments}x R$ ${v.installmentValue}  ← MAIOR ELEMENTO, ULTRA-BOLD
  2) Texto pequeno: "Total por pessoa: R$ ${v.totalValue}"
  3) Duração: ${v.duration}
🚫 PROIBIDO dentro do card: ícones de avião, ônibus, hotel, mala, câmera, xícara, estrelas ou QUALQUER pictograma. Sem listas com bullets. Sem fileiras de ícones. Card 100% tipográfico.
Selo único permitido (fora do card, opcional): "${v.promoName.toUpperCase()}"`
    : opts.category === "autoridade_dark"
    ? `[BLOCO DE INFORMAÇÕES — DARK PREMIUM]
${v.installments}x R$ ${v.installmentValue}     ← FONTE GIGANTE, ULTRA-BOLD, COR SÓLIDA SEM BRILHO
Selo: ${v.promoName.toUpperCase()}`
    : `[BLOCO DE EXPERIÊNCIA — EDITORIAL, SEM CARA DE OFERTA]
${opts.experienceDescription || `Roteiro inesquecível em ${v.destination}.`}
SEM NENHUM PREÇO, SEM PARCELAS, SEM SELOS.`;

  const categoryRules = opts.category === "oferta" ? OFERTA_RULES : opts.category === "autoridade_dark" ? AUTORIDADE_DARK_RULES : EXPERIENCIA_RULES;
  const creativeSeed = v.creativeSeed || `${opts.category}-${opts.layout.slice(0, 24)}`;
  const variationDirectives = opts.category === "oferta"
    ? [
        "LAYOUT ÚNICO DESTA GERAÇÃO: imagem full com preço direto sobre a foto em um único bloco sólido bem espaçado",
        "LAYOUT ÚNICO DESTA GERAÇÃO: divisão topo imagem + base sólida com oferta",
        "LAYOUT ÚNICO DESTA GERAÇÃO: barra lateral vertical + imagem dominante ao lado",
        "LAYOUT ÚNICO DESTA GERAÇÃO: cartão arredondado flutuando no terço inferior, com muita margem ao redor",
        "LAYOUT ÚNICO DESTA GERAÇÃO: bloco retangular simples no canto, deixando 70% da foto livre",
        "LAYOUT ÚNICO DESTA GERAÇÃO: texto centralizado com preço isolado em fonte imensa, sem bordas pesadas",
      ]
    : opts.category === "autoridade_dark"
    ? [
        "LAYOUT ÚNICO DESTA GERAÇÃO: grande globo terrestre abstrato em wireframe/3D no fundo preto, com um cartão de vidro translúcido frontal focado no preço.",
        "LAYOUT ÚNICO DESTA GERAÇÃO: moedas em 3D douradas flutuando na tela; UI centralizada com bordas arredondadas e efeito neon suave.",
        "LAYOUT ÚNICO DESTA GERAÇÃO: composição isométrica com um celular flutuando ou ícones turísticos geométricos espalhados pelo fundo dark.",
        "LAYOUT ÚNICO DESTA GERAÇÃO: estética hiper minimalista, tela preta absoluta, preço gigante no centro e um único ícone 3D super realista iluminado pela lateral.",
      ]
    : [
        "LAYOUT ÚNICO DESTA GERAÇÃO: imagem full sem caixas; apenas título leve no centro seguro; fotografia domina tudo",
        "LAYOUT ÚNICO DESTA GERAÇÃO: divisão suave topo + base sem cara de promoção; texto editorial discreto",
        "LAYOUT ÚNICO DESTA GERAÇÃO: barra lateral editorial fina com foto dominante; sem preço",
        "LAYOUT ÚNICO DESTA GERAÇÃO: imagem limpa; título curto no terço superior; nenhum bloco de venda",
        "LAYOUT ÚNICO DESTA GERAÇÃO: texto central leve sobre foto com muito respiro e espaço negativo ao redor",
      ];
  const variationIndex = Math.abs([...creativeSeed].reduce((acc, char) => acc + char.charCodeAt(0), 0)) % variationDirectives.length;
  const promoLine = opts.category === "oferta" || opts.category === "autoridade_dark"
    ? `Selo: "${v.promoName}"`
    : `Chamada editorial secundária: "${opts.experienceDescription || `Dias leves em ${v.destination}, com calma, beleza e curadoria.`}" — sem selo promocional.`;
  const typographyHierarchy = opts.category === "oferta"
    ? "- PREÇO = maior elemento da composição (Ultra-Bold / Heavy).\n- DESTINO = segundo maior elemento (Bold)."
    : opts.category === "autoridade_dark"
    ? "- PREÇO e DESTINO = competem em impacto. Foco em precisão e sobriedade corporativa.\n- TEXTO SÓLIDO E OPACO. Sem glow, sem neon, sem brilho."
    : "- IMAGEM = protagonista absoluta; texto deve ser leve e elegante.\n- DESTINO = maior texto, mas sem competir com a fotografia.";
  const centerRule = opts.category === "oferta"
    ? "- Centro de conversão obrigatório nos 65% centrais da imagem."
    : "- Centro seguro obrigatório nos 65% centrais para título e narrativa; NÃO criar centro de conversão.";
  const objectiveLine = opts.category === "oferta"
    ? "foco em legibilidade, espaço vazio abundante e alto impacto visual para conversão imediata."
    : "foco em emoção, desejo, espaço negativo amplo, fotografia premium e leitura elegante, sem aparência de oferta.";

  const fmt = v.format || "story";
  const formatHeader = fmt === "square"
    ? `Um banner publicitário QUADRADO de turismo (formato 1:1, 1080x1080, resolução 8K), para feed do Instagram.`
    : `Um banner publicitário VERTICAL de turismo (formato 9:16, 1080x1920, resolução 8K), para Stories e Reels.`;
  const formatSafeZones = fmt === "square"
    ? `SAFE ZONES (FEED 1:1):
- Margem mínima de 8% (≈86px) em TODAS as bordas. Nenhum texto, ícone ou borda de cartão pode encostar nas bordas.
- Composição equilibrada centralmente; o card de preço ocupa NO MÁXIMO 25% da área (superior OU inferior).
- O título principal fica em uma área limpa da fotografia (céu, água, areia, parede neutra).`
    : `SAFE ZONES (STORY 9:16):
- Margem Superior PROIBIDA: nenhum texto/elemento crucial nos primeiros 15% (≈288px do topo) — área do header do Instagram.
- Margem Inferior PROIBIDA: nenhum texto/preço/legal nos últimos 20% (≈384px da base) — área da caixa de mensagem.
- Margens laterais: padding mínimo de 8% (≈86px) em cada lado.
- Todo o conteúdo crítico (Título, Card de Preço, Selo) DEVE estar entre 200px do topo e 400px da base.`;

  return `
${formatHeader}
Hiper-realista, qualidade cinematográfica, iluminação natural ou dramática refinada e composição profissional.

A imagem deve seguir rigorosamente um layout estruturado e organizado, com hierarquia visual clara, ${objectiveLine}

A composição segue o layout: ${opts.layout}.

[VARIAÇÃO CRIATIVA OBRIGATÓRIA]
ID de variação: ${creativeSeed}.
Direção única desta geração: ${variationDirectives[variationIndex]}.
Este anúncio DEVE seguir a câmera, iluminação e estruturação exatas informadas na "Direção única", garantindo variação visual extrema. Mude os elementos de lugar e inove na composição espacial de acordo com a diretriz acima.

[FOTOGRAFIA PRINCIPAL — REGRAS DE CENA]
Cena extremamente realista e detalhada de ${v.destination}, com iluminação ${opts.lighting}, mostrando ${opts.sceneDescription}.

🚫 STRICTLY NO PEOPLE — REGRA NEGATIVA ABSOLUTA:
- PROIBIDO qualquer figura humana, modelo, casal, família, criança, silhueta, mão, pé, rosto ou parte de corpo na fotografia.
- A fotografia deve focar 100% na PAISAGEM, ARQUITETURA ou NATUREZA do destino.
- NO PEOPLE, NO MODELS, NO HUMANS, NO SILHOUETTES, NO HANDS, NO FACES.

[ELEMENTOS DE INTERFACE]
Interface moderna, limpa e minimalista, com tipografia perfeita e MUITO ESPAÇO VAZIO (Negative Space) para evitar sobreposição de textos.
Paleta obrigatória e bloqueada: cor primária ${v.primaryHex}, cor secundária ${v.secondaryHex}. Use SOMENTE essas duas cores nos blocos, preço, badges e detalhes.

Título/Chamada (RENDERIZAR INTEGRALMENTE, SEM TRUNCAR): "${opts.headline}"
Destino destacado: "${v.destination}"
${promoLine}

${valueBlock}

${opts.specialization ? `[ESPECIALIZAÇÃO DESTE PROMPT]\n${opts.specialization}\n` : ""}
${categoryRules}

══════════════════════════════════════
DIRETRIZES ESTRITAS DE RENDERIZAÇÃO (UI/UX, TIPOGRAFIA E SAFE ZONES):

1. ${formatSafeZones}

2. POSICIONAMENTO E ANTI-SOBREPOSIÇÃO:
- ZERO sobreposição entre blocos de texto, ícones ou cartões.
- Espaçamento matemático e simétrico entre todos os blocos.
- Nenhuma letra encostada na borda da imagem. Toda palavra deve caber INTEIRA.
${centerRule}

3. TIPOGRAFIA — FONTE OBRIGATÓRIA: sans-serif grotesca tipo "Montserrat ExtraBold" ou "Oswald Bold".
${typographyHierarchy}
- Texto com CONTRASTE ABSOLUTO: branco em fundo escuro/vibrante; escuro em fundo claro.
- Sobre fotografia: aplicar leve drop-shadow escuro para garantir 100% de legibilidade.

4. RENDERIZAÇÃO DE TEXTO — REGRA CRÍTICA:
- TÍTULO INTEGRAL: a frase "${opts.headline}" deve aparecer COMPLETA, sem cortes, sem reticências, sem truncamento. Se não couber em uma linha, quebre em duas — NUNCA corte palavras.
- Ortografia perfeita em português. Sem caracteres alienígenas, sem fusão de letras.
- NUNCA crie listas com bullets ou ícones pequenos repetidos.
- NÃO renderize mais de 2 blocos de texto distintos: TÍTULO + PREÇO (oferta) ou apenas TÍTULO (experiência).

══════════════════════════════════════
🛑 PROIBIÇÕES ABSOLUTAS (NEGATIVE PROMPT):
NO PEOPLE, NO MODELS, NO HUMANS, NO HANDS, NO FACES, NO SILHOUETTES,
NO REPETITIVE ICONS (sem fileiras de avião/ônibus/hotel/mala/câmera/xícara/estrelas dentro do card),
NO TRUNCATED TEXT, NO CUT WORDS, NO ELLIPSIS,
NO TEXT TOUCHING BORDERS, NO TEXT OVERLAP,
NO LOW CONTRAST (texto da mesma cor do fundo),
NO BLURRY TEXT, NO TEXT ARTIFACTS, NO DISTORTED LETTERS,
NO WATERMARK, NO LOGO DE TERCEIROS, NO MOCKUP DUPLO, NO COLLAGE.

📋 TEXTOS EXATOS DESTE BANNER:
• Destino: «${v.destination}»
• Título principal (INTEGRAL): «${opts.headline}»
${opts.category !== "experiencia" ? `• Parcela: «${v.installments}x R$ ${v.installmentValue}»\n• Selo: «${v.promoName}»` : ""}

🛑 GERAR APENAS 1 IMAGEM ÚNICA. As cores ${v.primaryHex} e ${v.secondaryHex} são as únicas dominantes.
══════════════════════════════════════
`;
}

// ============================================================
// 🔴 OFERTA PACOTE — OP1..OP4
// ============================================================

// 🔥 OP1 — CARTÃO DIVIDIDO
export function promptClassicVertical(v: MasterPromptVars): string {
  const headline = pickOfertaHeadline(v.destination, v.creativeSeed || "op1", v.forbiddenHeadlines);

  // ──────────────────────────────────────────────────────────────────────
  // 🔒 NOMENCLATURA 1/1/1 · V0 — ISOLAMENTO DE ESTRUTURA (Feed 1:1)
  // Foto Real / Oferta de Pacote / Quadrado 1:1 · Versão V0
  // Estrutura travada (split horizontal premium) + variáveis dinâmicas
  // ──────────────────────────────────────────────────────────────────────
  if (v.format === "square") {
    const benefits = (v.highlights && v.highlights.length > 0)
      ? v.highlights.slice(0, 4)
      : ["Transporte incluso", "Hospedagem", "Café da manhã", "Guia local"];
    const [sb1, sb2, sb3, sb4] = [0,1,2,3].map((i) => benefits[i] || "");
    const benefitsList = benefits.map((b, i) => `      ${i + 1}. ${b}`).join("\n");
    const originPill = v.city ? `Saindo de ${v.city}` : (v.agencyName || "Pacote exclusivo");
    const agencyTag = v.agencyName ? `placeholder discreto para a logo da agência "${v.agencyName}"` : "placeholder minimalista para logo da agência";
    const sqSeedMatch = (v.creativeSeed || "").match(/-v(\d+)-/);
    const sqVer = sqSeedMatch ? parseInt(sqSeedMatch[1]) : 0;
    const sqInstallmentLabel = v.installments === "1" ? "À VISTA" : `${v.installments}x`;

    // 🔒 1/1/1 · V2 — FAIXA CENTRAL HORIZONTAL + GRID 2x2
    if (sqVer === 2) {
      return `[CRITICAL DESIGN LOGIC & CONTRAST RULE: NEVER generate light text on a light background. NEVER generate dark text on a dark background. Strictly obey the color variables provided.]
[SYSTEM COMMAND: ISOLAMENTO DE ESTRUTURA]
A instrução a seguir aplica-se ÚNICA E EXCLUSIVAMENTE à Nomenclatura: 1/1/1 (Modo: Foto Real | Estilo: Oferta de Pacote | Formato: Quadrado 1:1) associada à Versão de Layout: V2.
OBRIGATÓRIO: Usar a estrutura de faixa central horizontal e grid 2x2. PROIBIDO copiar V0/V1/V3/V4 ou Experiência.

[IMAGE]
A premium, clean modern travel advertisement with a strict 1:1 square aspect ratio (1080x1080, 8K).

[BACKGROUND]
The base background of the entire LOWER HALF is a solid, clean OFF-WHITE (light cream #F7F3EC).

[TOP SECTION — Photo · Top 45%]
An 8K photorealistic image of ${v.destination}. Scene: ${v.destinationDescription}. Vibrant scenery, cinematic. Framed like a card with slightly rounded TOP corners, sitting flush against the middle ribbon below.

[MIDDLE RIBBON — The Divider]
Directly below the photo, a solid ${v.primaryHex} horizontal ribbon stretches edge-to-edge across the full width.
🚨 Centered inside this ribbon: massive, ultra-bold text reading "${v.promoName || `OFERTA ${v.destination}`}".
🚨 CRITICAL CONTRAST: this ribbon text MUST be PURE WHITE (#FFFFFF) for absolute contrast against ${v.primaryHex}. Never use dark tones here.

[BOTTOM SECTION — UI on OFF-WHITE background]
Directly below the ribbon, perfectly centered, a clean 2x2 grid of inclusions. ALL text DARK on the off-white background.
Row 1:
  • minimalist DARK icon + bold DARK text "${sb1}"     |     minimalist DARK icon + bold DARK text "${sb2}"
Row 2:
  • minimalist DARK icon + bold DARK text "${sb3}"     |     minimalist DARK icon + bold DARK text "${sb4}"

[PRICE BLOCK — bottom center]
A large, solid ${v.primaryHex} rectangular block with rounded corners. INSIDE the block, neatly stacked with ZERO overlap:
- Small PURE WHITE text "${sqInstallmentLabel}".
- MASSIVE extra-bold PURE WHITE text "R$ ${v.installmentValue}".
- Small PURE WHITE text "por pessoa".

[AESTHETIC]
Clean modern UI, flawless spelling, perfect alignment, zero overlapping text, high contrast.

[REGRAS DE ISOLAMENTO]
🚫 PROIBIDO: split horizontal 50/50 sem ribbon, gradientes, ícones 3D, watermarks, copiar V0/V1/V3/V4 ou Experiência.
🚫 PROIBIDO: texto claro em fundo claro; texto escuro em fundo escuro.
✅ OBRIGATÓRIO: foto topo (45%) + ribbon ${v.primaryHex} edge-to-edge com texto branco + grid 2x2 dark sobre off-white + price block ${v.primaryHex} com texto branco.
✅ Aspect ratio: 1:1 absoluto.`;
    }

    // 🔒 1/1/1 · V1 — SPLIT VERTICAL ESQUERDA/DIREITA + ÍCONES MONOCROMÁTICOS
    if (sqVer === 1) {
      const priceLabel = v.installments === "1" ? "À VISTA" : `EM ATÉ ${v.installments}x`;
      return `[CRITICAL DESIGN LOGIC & CONTRAST RULE: NEVER generate light text on a light background. NEVER generate dark text on a dark background. IF a background is dark, text MUST be pure white. Strictly obey the color variables provided.]
[SYSTEM COMMAND: ISOLAMENTO DE ESTRUTURA]
A instrução a seguir aplica-se ÚNICA E EXCLUSIVAMENTE à Nomenclatura: 1/1/1 (Modo: Foto Real | Estilo: Oferta de Pacote | Formato: Quadrado 1:1) associada à Versão de Layout: V1.
OBRIGATÓRIO: Layout com divisão vertical (esquerda/direita), ícones monocromáticos e padding seguro abaixo da logo.
PROIBIDO copiar V0/V2/V3/V4 ou Experiência.

[IMAGE]
A high-end, premium travel advertisement with a strict 1:1 square aspect ratio (1080x1080, 8K). The layout features a sharp, perfectly straight vertical split.

[LEFT PANEL — UI Design · 45% width]
Solid ${v.primaryHex} background covering the full height of the left 45%.
- Top-left corner: ${agencyTag}.
- 🚨 CRITICAL PADDING: a generous EMPTY vertical space (≥60px) directly below the logo BEFORE any text begins.
- Below the padding, stacked top to bottom (ALL text in ${v.primaryTextHex || "PURE WHITE"} for maximum contrast against ${v.primaryHex}):
   • Small text: "${v.promoName || "OFERTA EXCLUSIVA"}".
   • MASSIVE ultra-bold text: "${v.destination}".
   • Medium text: "${v.duration || "Pacote completo"}".

[INCLUSIONS — vertical pill stack]
Below the headline, a vertical stack of FOUR neatly aligned translucent (semi-transparent white, ~15% opacity) pill-buttons.
🚨 The AI MUST use perfectly matching MONOCHROMATIC line icons (all the EXACT same single ${v.primaryTextHex || "white"} tone) on the left of each pill, next to bold ${v.primaryTextHex || "PURE WHITE"} text:
   • "${sb1}"
   • "${sb2}"
   • "${sb3}"
   • "${sb4}"

[PRICE BLOCK — bottom-left corner of the LEFT PANEL]
A prominent, DARKER contrasting rectangular highlight box (deep charcoal/near-black) with rounded corners.
🚨 INSIDE the dark box, ALL text MUST be PURE WHITE (#FFFFFF). Stacked neatly with ZERO overlap:
- Small PURE WHITE text "${priceLabel}".
- MASSIVE extra-bold PURE WHITE text "R$ ${v.installmentValue}".
- Small PURE WHITE text "por pessoa".

[RIGHT PANEL — Photo · 55% width]
An 8K photorealistic image of ${v.destination}. Scene: ${v.destinationDescription}. Vibrant, cinematic, natural daylight.
The photo is framed like a card with slightly rounded corners, revealing a solid ${v.secondaryHex} border (≈24px thick) around its outer edges.

[AESTHETIC]
Clean modern UI, flawless spelling, zero text overlapping, perfect alignment, premium high contrast.

[REGRAS DE ISOLAMENTO]
🚫 PROIBIDO: split horizontal, ribbon central, full-bleed photo, gradientes, ícones 3D ou multi-color, watermarks, copiar V0/V2/V3/V4 ou Experiência.
🚫 PROIBIDO: texto claro em fundo claro; texto escuro em fundo escuro.
🚫 PROIBIDO: começar texto colado abaixo da logo (padding obrigatório).
✅ OBRIGATÓRIO: split vertical 45/55, padding generoso abaixo da logo, ícones MONOCROMÁTICOS em pílulas translúcidas, bloco DARK de preço com texto branco puro, foto direita com borda ${v.secondaryHex}.
✅ Aspect ratio: 1:1 absoluto.`;
    }

    return `[CRITICAL SYSTEM RULES - READ TWICE: 1. NEVER use dark text on a dark background. 2. NEVER overlap elements; respect padding. 3. Icons MUST be single-color (monochromatic), NOT colorful.]
[SYSTEM COMMAND: ISOLAMENTO DE ESTRUTURA]
A instrução a seguir aplica-se ÚNICA E EXCLUSIVAMENTE à Nomenclatura: 1/1/1 (Modo: Foto Real | Estilo: Oferta de Pacote | Formato: Quadrado 1:1) associada à Versão de Layout: V0.
Sob NENHUMA hipótese esta estrutura deve ser herdada por V1, V2, V3, V4 ou Experiência.
OBRIGATÓRIO: Ícones monocromáticos, tipografia em escala ampliada e bloco DARK de destaque para o preço.

[IMAGEM]
A premium, clean modern travel advertisement with a strict 1:1 square aspect ratio (1080x1080, 8K). The layout features a sharp, perfectly straight horizontal split exactly at 50% height.

[TOP HALF — DESIGN UI]
Solid background using the PRIMARY brand color ${v.primaryHex}. Generous internal padding.

[LOGO & PADDING]
Top-left corner: ${agencyTag}.
🚨 CRITICAL: Leave a LARGE, completely EMPTY gap of vertical space (padding ≥ 60px) directly below the logo. Absolutely NO element (text, icon, pill, line) can touch or overlap the logo area.

[TAG BUTTON — below the empty gap]
A DARK rounded pill button. The text inside this dark button MUST be PURE WHITE (#FFFFFF) bold reading "${originPill}". (Rule: Dark background = White Text — never violate this.)

[MAIN HEADLINE]
"${headline}" in MASSIVE, extra-large, ultra-bold sans-serif font, color ${v.primaryTextHex || "PURE WHITE (#FFFFFF)"}.
🚨 CRITICAL CONTRAST: headline MUST contrast strongly with ${v.primaryHex}. Never light-on-light or dark-on-dark.

[SPLIT SECTION]
Below the headline, ONE delicate, perfectly straight VERTICAL line divides the lower portion of the top half into two columns.

[LEFT SIDE — Inclusions]
A vertical stack with FOUR items. The AI MUST use perfectly matching MONOCHROMATIC line icons (all the EXACT same single color, NO colorful emojis, NO multi-color, NO 3D) next to LARGE, highly visible bold text in the same contrasting color as the headline:
${benefitsList}

[RIGHT SIDE — Price Highlight Block]
A prominent, solid DARK contrasting rectangular block (deep charcoal/near-black) with rounded corners.
🚨 INSIDE this dark block, ALL text MUST be PURE WHITE (#FFFFFF) for maximum contrast.
Stacked neatly inside, top to bottom, with ZERO overlap:
- LARGE PURE WHITE text: "${v.installments === "1" ? "À VISTA" : `EM ATÉ ${v.installments}x`}".
- GIGANTIC, screen-dominating, extra-bold PURE WHITE text: "R$ ${v.installmentValue}".
- LARGE PURE WHITE text: "por pessoa".

[BOTTOM HALF — PHOTO]
An 8K photorealistic, ultra-detailed travel photograph of ${v.destination}. Scene: ${v.destinationDescription}. Vibrant, cinematic, natural daylight — full-bleed across the bottom 50%.

[AESTHETIC]
Clean modern UI, flawless spelling, high contrast, perfect alignment, premium visual hierarchy.

[REGRAS DE ISOLAMENTO]
🚫 PROIBIDO: gradientes, brilho neon, cards flutuantes sobre a foto, texto sobre a foto, ícones 3D coloridos ou multi-color, emojis, watermarks.
🚫 PROIBIDO: texto claro em fundo claro; texto escuro em fundo escuro.
🚫 PROIBIDO: qualquer elemento tocando ou sobrepondo a logo (gap mínimo obrigatório).
🚫 PROIBIDO copiar layouts de V1/V2/V3/V4 ou de Experiência.
✅ OBRIGATÓRIO: split horizontal exato 50/50, gap vazio sob a logo, linha vertical divisória, ícones MONOCROMÁTICOS idênticos, bloco DARK dominante de preço com texto PURE WHITE, pill superior DARK com texto PURE WHITE.
✅ Aspect ratio: 1:1 absoluto. Sem letterbox.`;
  }

  // Detecta versão a partir do creativeSeed: "<tplId>-v<N>-..."
  const seedMatch = (v.creativeSeed || "").match(/-v(\d+)-/);
  const ver = seedMatch ? parseInt(seedMatch[1]) : 2;

  // ──────────────────────────────────────────────────────────────────────
  // 🔒 NOMENCLATURA 1/1/2 · V0 — SPLIT HORIZONTAL 45/55 (Stories 9:16)
  // Foto no topo (45%) + bloco UI sólido na cor secundária (55%).
  // ──────────────────────────────────────────────────────────────────────
  if (ver === 0) {
    const benefits = (v.highlights && v.highlights.length > 0)
      ? v.highlights.slice(0, 4)
      : ["Transporte incluso", "Hospedagem", "Café da manhã", "Guia local"];
    const [b1, b2, b3, b4] = [0,1,2,3].map((i) => benefits[i] || "");
    const originPill = v.city ? `Saindo de ${v.city}` : (v.agencyName || "Pacote exclusivo");
    const agencyTag = v.agencyName ? `minimalist logo placeholder for agency "${v.agencyName}"` : "minimalist logo placeholder";
    const installmentLabel = v.installments === "1" ? "À VISTA" : `${v.installments}x`;
    const pixText = "5% OFF À VISTA NO PIX";

    return `[SYSTEM COMMAND: ISOLAMENTO DE ESTRUTURA E SAFE ZONES]
A instrução a seguir aplica-se ÚNICA E EXCLUSIVAMENTE à Nomenclatura: 1/1/2 (Modo: Foto Real | Estilo: Oferta de Pacote | Formato: Stories Vertical 9:16) associada à Versão de Layout: V0 (Split Horizontal 45/55).
É TERMINANTEMENTE PROIBIDO misturar esta lógica com V1, V2, V3 ou com o estilo "Experiência de Destino".
OBRIGATÓRIO: respeitar limites da interface do Instagram Stories e aplicar contraste máximo.

[IMAGE]
A high-end, clean vertical 9:16 travel advertisement (1080x1920, 8K). The layout features a sharp, perfectly straight horizontal split.

[STRICT UI SAFE ZONES — INSTAGRAM STORIES]
- The TOP 20% (≈384px) MUST remain completely empty of typography, UI elements, or logos — reserved for Instagram header.
- The BOTTOM 20% (≈384px) MUST remain completely empty — reserved for Instagram message box.
- ALL critical content lives ONLY inside the central 60% vertical block.

[TOP HALF — PHOTO · 45% of canvas height, immediately below the top safe zone]
A full-width 8K photorealistic image of ${v.destination}. Scene: ${v.destinationDescription}. Vibrant, highly detailed, natural daylight, cinematic.
In the top-left corner of this photo area, place a small ${agencyTag}.

[BOTTOM HALF — UI DESIGN · 55% of canvas height, ending above the bottom safe zone]
Solid background using the PRIMARY brand color ${v.primaryHex}, stretching all the way down to cover the entire bottom section.

Just below the photo split: a solid ${v.secondaryHex} rounded pill button containing bold DARK text "${originPill}".

Below the button: main headline "${v.promoName || `Pacote ${v.destination}`}" in massive, heavy ultra-bold font.
🚨 CRITICAL CONTRAST RULE: this headline MUST be PURE WHITE (#FFFFFF) for maximum contrast against the ${v.primaryHex} background. Never paint the headline in dark tones over the primary background.

Below the headline: a vertical stack of FOUR clean, solid PURE WHITE pill-buttons.
🚨 CRITICAL RULE FOR INCLUSIONS: every single white pill MUST contain a minimalist DARK icon on the left and clearly rendered DARK TEXT. NEVER leave any pill empty. The four labels are:
   • "${b1}"
   • "${b2}"
   • "${b3}"
   • "${b4}"

[PRICE BLOCK — safely above the bottom 20% empty zone]
A large, solid ${v.secondaryHex} rectangular block. ALL text inside MUST be DARK for high contrast against the light secondary background, neatly stacked with ZERO overlapping:
- Top center: bold DARK text "${v.promoName || `OFERTA ${v.destination}`}".
- Below: small DARK text "PACOTE ${v.destination}" and "${v.duration}".
- Below: small DARK text "a partir de".
- Then: a solid DARK ${v.primaryHex} rounded badge containing bold BRIGHT text "${installmentLabel}", placed next to a MASSIVE extra-bold DARK price "R$ ${v.installmentValue}", with small DARK text "por pessoa" below.
- At the very bottom edge of the block: a solid DARKER ${v.primaryHex} footer strip containing bold BRIGHT text "${pixText}".

[AESTHETIC]
Clean modern UI, flawless spelling, ZERO text overlapping, perfect alignment strictly inside the central 60% block, high contrast, premium Brazilian travel agency feel.

[REGRAS DE ISOLAMENTO]
🚫 PROIBIDO: qualquer elemento dentro dos 20% do topo ou dos 20% da base.
🚫 PROIBIDO: headline em cor escura sobre o bloco ${v.primaryHex}; texto claro sobre o bloco ${v.secondaryHex}.
🚫 PROIBIDO: pílulas brancas vazias — TODAS devem conter texto escuro + ícone correspondentes.
🚫 PROIBIDO: full-bleed photo, glass card translúcido, gradientes, ícones 3D, watermarks, copiar layouts V1/V2/V3/V4 ou Experiência.
✅ OBRIGATÓRIO: split horizontal foto (topo 45%) + UI sólida ${v.primaryHex} (fundo 55%), preço como bloco dominante ${v.secondaryHex} com texto escuro, contraste máximo.
✅ Aspect ratio: 9:16 absoluto. Sem letterbox.`;
  }

  // ──────────────────────────────────────────────────────────────────────
  // 🔒 NOMENCLATURA 1/1/2 · V4 — FULL-BLEED + CARD CENTRAL FLUTUANTE (Stories 9:16)
  // Foto cobre 100% da tela; card sólido na cor PRIMÁRIA flutua centralizado.
  // Pill secundária sobreposta exatamente na borda inferior do card.
  // ──────────────────────────────────────────────────────────────────────
  if (ver === 4) {
    const agencyTag = v.agencyName ? `minimalist logo placeholder for agency "${v.agencyName}"` : "minimalist logo placeholder";
    const installmentLabel = v.installments === "1" ? "À VISTA" : `${v.installments}x`;
    const pixText = "5% OFF À VISTA NO PIX";
    const travelDates = v.duration || "DATAS A CONFIRMAR";

    return `[SYSTEM COMMAND: ISOLAMENTO DE ESTRUTURA E SAFE ZONES]
A instrução a seguir aplica-se ÚNICA E EXCLUSIVAMENTE à Nomenclatura: 1/1/2 (Modo: Foto Real | Estilo: Oferta de Pacote | Formato: Stories Vertical 9:16) associada à Versão de Layout: V4 (Foto Full-Bleed + Card Central Flutuante).
É TERMINANTEMENTE PROIBIDO misturar esta lógica com V0, V1, V2, V3 ou com o estilo "Experiência de Destino".
OBRIGATÓRIO: respeitar limites da interface do Instagram Stories e usar layout de card flutuante centralizado.

[IMAGE]
A high-end, premium vertical 9:16 travel advertisement (1080x1920, 8K).

[STRICT UI SAFE ZONES — INSTAGRAM STORIES]
- The TOP 20% (≈384px) MUST remain completely empty of typography, UI elements, or logos.
- The BOTTOM 20% (≈384px) MUST remain completely empty.
- ALL critical UI lives ONLY inside the central 60% vertical block.

[BACKGROUND — FULL BLEED]
A full-bleed, 8K photorealistic vertical photograph of ${v.destination} covering 100% of the canvas. Scene: ${v.destinationDescription}. Vibrant, highly detailed, cinematic.

[UI LAYOUT]
Just below the top 20% safe zone, in the top-left corner, place a small ${agencyTag}.

[CENTER FLOATING CARD]
Centered vertically and horizontally inside the central 60% safe area, place a large solid ${v.primaryHex} rectangular floating card with slightly rounded corners and subtle drop-shadow.

[INSIDE THE CARD — CRITICAL HIGH-CONTRAST RULE]
🚨 ALL text inside this card MUST be PURE WHITE (#FFFFFF) — except text inside the secondary-colored pill (which uses dark text). Never paint text in dark tones over the primary-colored card.

Card content, top to bottom:
1. Massive ultra-bold PURE WHITE text: "${v.promoName || `OFERTA ${v.destination}`}".
2. Medium elegant PURE WHITE text: "${v.destination}".
3. Bold PURE WHITE text showing dates: "${travelDates}", followed by a single horizontal row of small minimalist ${v.secondaryHex} icons (plane, hotel, coffee, guide).

[PRICE BLOCK — INSIDE THE CARD, SPLIT INTO TWO COLUMNS]
- LEFT column (stacked vertically):
   • small PURE WHITE text "pagamento"
   • a solid ${v.secondaryHex} rounded pill containing bold DARK text "${installmentLabel}"
   • small PURE WHITE text "por pessoa"
- RIGHT column:
   • Massive extra-bold PURE WHITE text "R$ ${v.installmentValue}"

[FLOATING EDGE BUTTON — overlapping the bottom edge of the card]
Perfectly centered and overlapping the EXACT bottom horizontal edge of the floating card (50% above the edge, 50% below), place a bright solid ${v.secondaryHex} rounded pill button containing bold DARK text "${pixText}".

[AESTHETIC]
Clean modern UI, flawless spelling, perfect alignment, high contrast, premium Brazilian travel agency feel.

[REGRAS DE ISOLAMENTO]
🚫 PROIBIDO: qualquer elemento dentro dos 20% do topo ou dos 20% da base.
🚫 PROIBIDO: texto escuro sobre o card ${v.primaryHex} (exceto dentro da pill secundária).
🚫 PROIBIDO: split horizontal 45/55, glass card translúcido, gradientes, ícones 3D, watermarks, copiar layouts V0/V1/V2/V3 ou Experiência.
✅ OBRIGATÓRIO: foto full-bleed 9:16, card sólido ${v.primaryHex} centralizado, pill ${v.secondaryHex} sobrepondo borda inferior, contraste máximo (branco puro no card / escuro na pill).
✅ Aspect ratio: 9:16 absoluto. Sem letterbox.`;
  }

  // ──────────────────────────────────────────────────────────────────────
  // 🔒 NOMENCLATURA 1/1/2 · V1 — VERTICAL UI/PHOTO SPLIT (Stories 9:16)
  // Top metade = UI sólida primária + ícones monocromáticos.
  // Bottom metade = foto-card com borda secundária + price box DARK.
  // ──────────────────────────────────────────────────────────────────────
  if (ver === 1) {
    const benefits = (v.highlights && v.highlights.length > 0)
      ? v.highlights.slice(0, 4)
      : ["Transporte incluso", "Hospedagem", "Café da manhã", "Guia local"];
    const [b1, b2, b3, b4] = [0,1,2,3].map((i) => benefits[i] || "");
    const agencyTag = v.agencyName ? `minimalist logo placeholder for agency "${v.agencyName}"` : "minimalist logo placeholder";
    const priceLabel = v.installments === "1" ? "À VISTA" : `EM ATÉ ${v.installments}x`;

    return `[CRITICAL DESIGN LOGIC & CONTRAST RULE: NEVER generate light text on a light background. NEVER generate dark text on a dark background. Strictly obey the color variables provided.]
[SYSTEM COMMAND: ISOLAMENTO DE ESTRUTURA E SAFE ZONES]
A instrução a seguir aplica-se ÚNICA E EXCLUSIVAMENTE à Nomenclatura: 1/1/2 (Modo: Foto Real | Estilo: Oferta de Pacote | Formato: Stories Vertical 9:16) associada à Versão de Layout: V1.
É TERMINANTEMENTE PROIBIDO misturar esta lógica com V0, V2, V3, V4 ou Experiência.
OBRIGATÓRIO: respeitar limites da interface do Instagram Stories.

[IMAGE]
A premium vertical 9:16 travel advertisement (1080x1920, 8K).

[STRICT UI SAFE ZONES — INSTAGRAM STORIES]
- The TOP 20% (≈384px) MUST remain completely empty of typography, logos, or primary subjects.
- The BOTTOM 20% (≈384px) MUST remain completely empty.
- ALL critical content lives ONLY inside the central 60% vertical block.

[BACKGROUND]
Solid ${v.primaryHex} background stretching across the ENTIRE canvas (full bleed).

[TOP HALF — UI · safely below the top 20% safe zone]
- Top-left corner of the central area: ${agencyTag}.
- 🚨 CRITICAL PADDING: a generous EMPTY vertical space (≥80px) directly below the logo BEFORE any text begins.
- Below the padding, stacked top to bottom (ALL text in ${v.primaryTextHex || "PURE WHITE"} for maximum contrast against ${v.primaryHex}):
   • Small text: "${v.promoName || "OFERTA EXCLUSIVA"}".
   • MASSIVE ultra-bold text: "${v.destination}".
   • Medium text: "${v.duration || "Pacote completo"}".

[INCLUSIONS — vertical pill stack]
A vertical stack of FOUR translucent (semi-transparent white, ~15% opacity) pill-buttons.
🚨 The AI MUST use perfectly matching MONOCHROMATIC line icons (all the EXACT same single ${v.primaryTextHex || "white"} tone) on the left of each pill, next to bold ${v.primaryTextHex || "PURE WHITE"} text:
   • "${b1}"
   • "${b2}"
   • "${b3}"
   • "${b4}"

[BOTTOM HALF — Photo & Price · strictly above the bottom 20% safe zone]
A large 8K photorealistic image of ${v.destination} (${v.destinationDescription}) placed as a CARD with rounded corners. A solid ${v.secondaryHex} border (≈20px thick) is visible behind the photo card.
Overlapping the BOTTOM-LEFT corner of the photo card (and strictly kept ABOVE the bottom 20% safe zone): a DARK rectangular highlight box (deep charcoal/near-black) with rounded corners.
🚨 INSIDE the dark box, ALL text MUST be PURE WHITE (#FFFFFF). Stacked neatly with ZERO overlap:
- Small PURE WHITE text "${priceLabel}".
- MASSIVE extra-bold PURE WHITE text "R$ ${v.installmentValue}".
- Small PURE WHITE text "por pessoa".

[AESTHETIC]
Clean modern UI, flawless spelling, perfect alignment, premium high contrast.

[REGRAS DE ISOLAMENTO]
🚫 PROIBIDO: qualquer elemento dentro dos 20% do topo ou dos 20% da base.
🚫 PROIBIDO: split horizontal 45/55, ribbon central, glass card, full-bleed photo sem borda, gradientes, ícones 3D ou multi-color, watermarks, copiar V0/V2/V3/V4 ou Experiência.
🚫 PROIBIDO: texto claro em fundo claro; texto escuro em fundo escuro; começar texto colado abaixo da logo.
✅ OBRIGATÓRIO: fundo sólido ${v.primaryHex} full-bleed, padding abaixo da logo, ícones MONOCROMÁTICOS em pílulas translúcidas, foto-card com borda ${v.secondaryHex}, price box DARK com texto branco puro sobreposto ao canto inferior esquerdo da foto.
✅ Aspect ratio: 9:16 absoluto. Sem letterbox.`;
  }

  // ──────────────────────────────────────────────────────────────────────
  // 🔒 NOMENCLATURA 1/1/2 · V2 — RIBBON CENTRAL + GRID 2x2 (Stories 9:16)
  // ──────────────────────────────────────────────────────────────────────
  {
    const benefits = (v.highlights && v.highlights.length > 0)
      ? v.highlights.slice(0, 4)
      : ["Transporte incluso", "Hospedagem", "Café da manhã", "Guia local"];
    const [b1, b2, b3, b4] = [0,1,2,3].map((i) => benefits[i] || "");
    const agencyTag = v.agencyName ? `minimalist logo placeholder for agency "${v.agencyName}"` : "minimalist logo placeholder";
    const installmentLabel = v.installments === "1" ? "À VISTA" : `${v.installments}x`;

    return `[CRITICAL DESIGN LOGIC & CONTRAST RULE: NEVER generate light text on a light background. NEVER generate dark text on a dark background. Strictly obey the color variables provided.]
[SYSTEM COMMAND: ISOLAMENTO DE ESTRUTURA E SAFE ZONES]
A instrução a seguir aplica-se ÚNICA E EXCLUSIVAMENTE à Nomenclatura: 1/1/2 (Modo: Foto Real | Estilo: Oferta de Pacote | Formato: Stories Vertical 9:16) associada à Versão de Layout: V2.
É TERMINANTEMENTE PROIBIDO misturar esta lógica com V0, V1, V3, V4 ou com o estilo "Experiência de Destino".
OBRIGATÓRIO: respeitar limites da interface do Instagram Stories.

[IMAGE]
A high-end vertical 9:16 travel advertisement (1080x1920, 8K).

[STRICT UI SAFE ZONES — INSTAGRAM STORIES]
- The TOP 20% (≈384px) MUST remain completely empty of typography, UI elements, or logos.
- The BOTTOM 20% (≈384px) MUST remain completely empty.
- ALL critical UI lives ONLY inside the central 60% vertical block.

[BACKGROUND]
Solid clean OFF-WHITE (light cream #F7F3EC) covering the LOWER HALF of the canvas, from the ribbon down to the bottom safe zone.

[TOP SECTION — Photo]
Starting exactly below the top 20% safe zone, a large 8K photorealistic image of ${v.destination}. Scene: ${v.destinationDescription}. Vibrant, cinematic, natural daylight. The photo extends edge-to-edge horizontally and ends flush against the middle ribbon.
In the top-left corner of the photo, place a small ${agencyTag}.

[MIDDLE RIBBON — The Divider]
Directly below the photo, a thick solid ${v.primaryHex} horizontal ribbon stretching edge-to-edge.
🚨 Inside the ribbon: massive ultra-bold text "${v.promoName || `OFERTA ${v.destination}`}".
🚨 CRITICAL CONTRAST: ribbon text MUST be PURE WHITE (#FFFFFF) for absolute contrast against ${v.primaryHex}. Never use dark text here.

[BOTTOM SECTION — UI on OFF-WHITE background]
On the off-white background below the ribbon, a perfectly aligned 2x2 grid of inclusions. ALL text DARK on the off-white background.
- Left column: minimalist DARK icon + DARK text "${b1}" (top), then "${b3}" (bottom).
- Right column: minimalist DARK icon + DARK text "${b2}" (top), then "${b4}" (bottom).

[PRICE BLOCK — safely above the bottom 20% empty zone]
A massive, solid ${v.primaryHex} rounded rectangular block. INSIDE the block, neatly stacked with ZERO overlap:
- Small PURE WHITE text "${installmentLabel}".
- HUGE extra-bold PURE WHITE text "R$ ${v.installmentValue}".
- Small PURE WHITE text "por pessoa".

[AESTHETIC]
Perfect alignment, crisp contrast, premium UI layout, flawless spelling, zero overlapping text.

[REGRAS DE ISOLAMENTO]
🚫 PROIBIDO: qualquer elemento dentro dos 20% do topo ou dos 20% da base.
🚫 PROIBIDO: texto claro em fundo claro; texto escuro em fundo escuro.
🚫 PROIBIDO: full-bleed photo, glass card translúcido, gradientes, ícones 3D, watermarks, copiar V0/V1/V3/V4 ou Experiência.
✅ OBRIGATÓRIO: foto topo + ribbon ${v.primaryHex} edge-to-edge com texto branco + grid 2x2 dark sobre off-white + price block ${v.primaryHex} com texto branco.
✅ Aspect ratio: 9:16 absoluto. Sem letterbox.`;
  }
}

// 🔥 OP2 — CARTÃO CENTRAL FLUTUANTE
export function promptCancunStyle(v: MasterPromptVars): string {
  const headline = pickOfertaHeadline(v.destination, v.creativeSeed || "op2", v.forbiddenHeadlines);
  return buildBrain(v, {
    category: "oferta",
    layout:
      "Fundo 100% FOTOGRÁFICO ocupando toda a tela, com CARTÃO CENTRAL na cor secundária enviado sobreposto e centralizado.",
    lighting: "tropical brilhante, céu turquesa, água cristalina, alta saturação cinematográfica",
    sceneDescription: v.destinationDescription,
    headline,
    specialization:
      "• Cartão na cor secundária, cantos arredondados, sombra suave para flutuar sobre a foto.\n• PREÇO absoluto e limpo dentro do cartão, fonte Ultra-Bold.\n• O cartão deve ter pouquíssimo texto e muito espaço vazio internamente para não poluir.\n• Foto NUNCA é cortada de forma agressiva — enquadramento limpo por trás do cartão.",
  });
}

// 🔥 OP3 — CARTÃO AÉREO (TOP DOWN)
export function promptGramadoStyle(v: MasterPromptVars): string {
  const headline = pickOfertaHeadline(v.destination, v.creativeSeed || "op3", v.forbiddenHeadlines);
  return buildBrain(v, {
    category: "oferta",
    layout:
      "FOTO AÉREA top-down ou drone-shot do destino ocupando toda a tela, com CARTÃO MINIMALISTA sobreposto em um dos cantos, permitindo muito respiro inferior.",
    lighting: "aérea diurna, sol alto, água translúcida com gradientes turquesa, sombras nítidas",
    sceneDescription: `vista aérea (drone) de ${v.destinationDescription}`,
    headline,
    specialization:
      "• Câmera obrigatoriamente em ângulo TOP-DOWN ou drone alto, mostrando ESCALA e amplitude.\n• Cartão posicionado com folga — não no centro — para deixar a paisagem respirar.\n• Preço FORTE e limpo, sem esmagar o título.",
  });
}

// 🔥 OP4 — BARRA LATERAL (PERFORMANCE)
export function promptMaceioStyle(v: MasterPromptVars): string {
  const headline = pickOfertaHeadline(v.destination, v.creativeSeed || "op4", v.forbiddenHeadlines);
  return buildBrain(v, {
    category: "oferta",
    layout:
      "SPLIT VERTICAL — 30% à ESQUERDA com barra sólida na cor primária; 70% à DIREITA com fotografia limpa do destino.",
    lighting: "comercial brilhante, alto contraste, cores saturadas",
    sceneDescription: v.destinationDescription,
    headline,
    specialization:
      "• Barra lateral com COR SÓLIDA vibrante, COM MUITO ESPAÇAMENTO INTERNO.\n• Hierarquia de leitura ULTRA-RÁPIDA e limpa: destino → enorme respiro visual vazio → preço gigante na base.\n• ZERO listas de texto na barra lateral, mantenha-a limpa e direta.",
  });
}

// 🔥 OP5 — CARTÃO SIMPLES
export function promptTicketPixCard(v: MasterPromptVars): string {
  const headline = pickOfertaHeadline(v.destination, v.creativeSeed || "op5", v.forbiddenHeadlines);
  return buildBrain(v, {
    category: "oferta",
    layout:
      "FOTO AÉREA OU PANORÂMICA ocupando 100% do fundo com um CARTÃO MINIMALISTA na cor secundária no centro seguro. Dentro do cartão há apenas o Destino e o Preço com enorme espaço vazio ao redor.",
    lighting: "natural brilhante, comercial, cores turquesa/azul com contraste alto no cartão",
    sceneDescription: `vista ampla e clara de ${v.destinationDescription}`,
    headline,
    specialization:
      "• O cartão não pode encostar nas safe zones; deve parecer uma peça única e extremamente limpa.\n• PROIBIDO gerar linhas de ícones ou múltiplos selos que gerem confusão.\n• A fotografia de fundo serve de contexto; o preço domina a conversão sem competir com outros textos.",
  });
}

// 🔥 OP6 — FAIXA LATERAL + HERO DE PERFORMANCE
export function promptSideHeroPerformance(v: MasterPromptVars): string {
  const headline = pickOfertaHeadline(v.destination, v.creativeSeed || "op6", v.forbiddenHeadlines);
  return buildBrain(v, {
    category: "oferta",
    layout:
      "PAINEL LATERAL esquerdo vibrante contendo título e preço; lado direito com uma fotografia hero limpa.",
    lighting: "dramática de fim de tarde ou manhã, alto contraste comercial, cores saturadas",
    sceneDescription: `${v.destinationDescription} em enquadramento hero cinematográfico, sem duplicar cenas`,
    headline,
    specialization:
      "• Faixa lateral + fotografia grande, garantindo que o painel lateral tenha MUITO VAZIO (negative space) separando título e preço.\n• Leitura limpa: destino → (espaço vazio enorme) → preço.\n• NENHUMA lista longa ou texto vertical colidindo.",
  });
}

// ============================================================
// 🔵 EXPERIÊNCIA DE DESTINO — ED1..ED6 (editorial, sem cara de oferta)
// ============================================================

// 🌍 ED1 — HERO CINEMATOGRÁFICO (FULL IMAGE)
export function promptIconicLandmark(v: MasterPromptVars): string {
  const headline = pickExperienciaHeadline(v.destination, v.creativeSeed || "ed1", v.forbiddenHeadlines);
  return buildBrain(v, {
    category: "experiencia",
    layout:
      "FULL-BLEED CINEMATOGRÁFICO — a fotografia ocupa 100% da composição, sem divisões duras. Texto leve sobreposto, com gradiente sutil apenas para legibilidade. Sem cartões, sem caixas.",
    lighting: "natural perfeita, hora dourada cinematográfica, profundidade de campo realista, cores vibrantes e atmosféricas",
    sceneDescription: `${v.destination} com riqueza de detalhes — céu dramático, luz dourada, paisagem natural intocada e arquitetura icônica, água cristalina ou paisagem icônica. ${v.destinationDescription}`,
    headline,
    experienceDescription: `Uma experiência inesquecível em ${v.destination}.`,
    specialization:
      "• ÚNICO bloco de texto: '" + headline + "' — centralizado, fonte elegante, muito respiro ao redor.\n• NENHUM subtítulo adicional, NENHUMA lista, NENHUM ícone.\n• PROIBIDO caixa de preço ou cartão promocional.\n• Estilo: capa de revista de viagem. 90% foto, 10% texto.",
  });
}

// 🌍 ED2 — SPLIT SUAVE (IMAGEM + TEXTO LEVE)
export function promptSplitYellowSide(v: MasterPromptVars): string {
  const headline = pickExperienciaHeadline(v.destination, v.creativeSeed || "ed2", v.forbiddenHeadlines);
  return buildBrain(v, {
    category: "experiencia",
    layout:
      "DIVISÃO SUAVE — 70% SUPERIOR com fotografia hiper-realista do destino; 30% INFERIOR com área clean usando leve gradiente translúcido. Transição suave entre as duas áreas.",
    lighting: "natural suave, luz realista, atmosfera convidativa",
    sceneDescription: `${v.destination} com foco em experiência — mar, arquitetura ou natureza com luz natural suave, elementos da paisagem em primeiro plano. ${v.destinationDescription}`,
    headline,
    experienceDescription: `Momentos únicos em ${v.destination}.`,
    specialization:
      "• Na área inferior: APENAS o título '" + headline + "' em fonte elegante e leve. Nenhum texto adicional.\n• NENHUMA lista, NENHUM preço.\n• Estilo: minimalista, editorial, silencioso.",
  });
}

// 🌍 ED3 — STORY LIFESTYLE (PESSOAS + EXPERIÊNCIA)
export function promptElegantCenterCard(v: MasterPromptVars): string {
  const headline = pickExperienciaHeadline(v.destination, v.creativeSeed || "ed3", v.forbiddenHeadlines);
  return buildBrain(v, {
    category: "experiencia",
    layout:
      "STORY LIFESTYLE — fotografia full-bleed dominante mostrando o destino em ângulo aspiracional, sem pessoas. Texto sobreposto leve, sem caixas pesadas.",
    lighting: "luz natural, clima feliz, sensação de liberdade, atmosfera real e espontânea",
    sceneDescription: `paisagem icônica e atmosfera viva de ${v.destination} — luz natural, cores autênticas, sem pessoas, sem silhuetas. ${v.destinationDescription}`,
    headline,
    experienceDescription: `Momentos únicos em ${v.destination}.`,
    specialization:
      "• Apenas UM texto centralizado e curto: '" + headline + "'. Nada mais.\n• PROIBIDO qualquer outro texto, ícone ou elemento de oferta.\n• Estilo: Instagram orgânico premium, foto domina 90% da tela.",
  });
}

// 🌍 ED4 — MINIMALISMO ASIMÉTRICO
export function promptEditorialVisual(v: MasterPromptVars): string {
  const headline = pickExperienciaHeadline(v.destination, v.creativeSeed || "ed4", v.forbiddenHeadlines);
  return buildBrain(v, {
    category: "experiencia",
    layout:
      "MINIMALISMO ASSIMÉTRICO — Foco em uma única foto espetacular, descentralizada, deixando uma grande área da tela completamente livre para um título flutuante.",
    lighting: "atmosfera natural premium, estética de arte fina",
    sceneDescription: `Uma única cena deslumbrante de ${v.destination}, enquadrada de forma assimétrica para deixar muito céu ou espaço negativo vazio. ${v.destinationDescription}`,
    headline,
    experienceDescription: `${v.destination} em outro nível.`,
    specialization:
      "• Único texto: '" + headline + "' — flutuando sobre o espaço vazio, fonte leve e refinada.\n• SEM subtítulo, SEM lista, SEM preço.\n• Estilo: galeria de arte moderna. Silêncio visual é o objetivo.",
  });
}

// 🌍 ED5 — MINIMALISTA PREMIUM (LUXO)
export function promptTopEditorialPhoto(v: MasterPromptVars): string {
  const headline = pickExperienciaHeadline(v.destination, v.creativeSeed || "ed5", v.forbiddenHeadlines);
  return buildBrain(v, {
    category: "experiencia",
    layout:
      "MINIMALISTA PREMIUM — fotografia única, limpa, com composição artística. Pouquíssimo texto, muito espaço negativo, atmosfera de alto luxo.",
    lighting: "suave, estética premium, paleta refinada, ângulo único e artístico",
    sceneDescription: `${v.destination} em ângulo único e artístico, com luz suave e estética premium. Composição contemplativa. ${v.destinationDescription}`,
    headline,
    experienceDescription: `Premium e exclusivo.`,
    specialization:
      "• ÚNICO texto: '" + headline + "' — centralizado, fonte ultra-leve e refinada, cor branca.\n• NENHUM outro texto, NENHUM preço.\n• O texto deve ocupar apenas 10% da tela. 90% é foto e espaço vazio.\n• Estilo: luxo silencioso, exclusividade total.",
  });
}

// 🌍 ED6 — SPLIT EDITORIAL SIMPLES
export function promptTwoSceneEditorial(v: MasterPromptVars): string {
  const headline = pickExperienciaHeadline(v.destination, v.creativeSeed || "ed6", v.forbiddenHeadlines);
  return buildBrain(v, {
    category: "experiencia",
    layout:
      "SPLIT EDITORIAL SIMPLES — DIVISÃO 50/50. Uma metade cor sólida suave com título curto; a outra metade com UMA única fotografia premium do destino.",
    lighting: "editorial sofisticada, textura real, luz natural",
    sceneDescription: `uma visão sofisticada e imersiva de ${v.destinationDescription}`,
    headline,
    experienceDescription: `${v.destination} em sua melhor forma.`,
    specialization:
      "• Na área de cor sólida: APENAS '" + headline + "' como título. Fonte grande, espaçada, elegante.\n• NENHUM checklist, NENHUM preço, NENHUM selo.\n• A metade com foto deve ser UMA ÚNICA cena clara do destino, sem divisões ou colagens.\n• Estilo: página de revista de luxo.",
  });
}

// ============================================================
// ⬛ AUTORIDADE PREMIUM (ESTILO KRIPTOPIX) — DK1..DK6
// Referência visual: Kriptopix fintech — preto sólido + acento dourado/cor
// TIPOGRAFIA OBRIGATÓRIA: fontes 100% preenchidas, sólidas, SEM borda, SEM outline
// ============================================================

// Helper para o aviso anti-neon que repete em todos os DK
const DK_TYPOGRAPHY_RULE = `
⚠️ TIPOGRAFIA — REGRA CRÍTICA (MAIS IMPORTANTE DE TODAS):
As letras e números DEVEM ser SÓLIDOS e completamente PREENCHIDOS.
PENSE ASSIM: o texto deve parecer impresso em papel ou numa tela LED — opaco, plano, sem efeito.
PROIBIDO ABSOLUTAMENTE:
- Letras com borda/contorno (outline font / stroke) — as que aparecem "vazadas" como néon de discoteca
- Efeito neon, glow, halo, luminescência ou brilho colorido em qualquer texto
- Fonte serifada ou manuscrita — use apenas sans-serif grotesca (tipo Inter Black, Helvetica Bold)
CORRETO: texto branco sólido como numa tela de aplicativo financeiro (Nubank, Stripe, Itaú app)
`;

// DK1 — PESSOA EXECUTIVA + ÍCONES 3D VIAGEM FLUTUANDO
export function promptDarkNeonGlassmorphism(v: MasterPromptVars): string {
  const headline = pickOfertaHeadline(v.destination, v.creativeSeed || "dk1", v.forbiddenHeadlines);
  return `
Crie um banner publicitário de agência de viagens no estilo visual da marca Kriptopix (fintech brasileira premium).

FUNDO: Preto absoluto (#0A0A0A). Sem gradientes, sem texturas, sem ruído.

COMPOSIÇÃO PRINCIPAL:
- Lado esquerdo: bloco de texto com tipografia Ultra-Bold branca ocupando 50% da largura.
- Lado direito: uma pessoa jovem (20-35 anos, roupa social escura ou na cor ${v.primaryHex}), expressão determinada, segurando um celular ou olhando para a câmera. Ao redor da pessoa, 3 a 4 objetos 3D de viagem flutuando: mala de viagem dourada-metálica, passaporte 3D, avião de papel dourado, globo terrestre metálico. Objetos com acabamento FOSCO-METÁLICO iluminados por luz de estúdio suave.

TEXTOS — escreva EXATAMENTE e SOMENTE estes textos:
Linha 1 (grande, branca): «${headline}»
Linha 2 (cor ${v.secondaryHex}, Bold): «${v.destination}»
Linha 3 (branca, Ultra-Bold, tamanho gigante): «${v.installments}x R$ ${v.installmentValue}»
Botão pequeno (pílula sólida na cor ${v.secondaryHex}): «Reserve Agora →»

${DK_TYPOGRAPHY_RULE}

PALETA: Fundo preto + objetos dourado-metálico + texto branco puro + acento ${v.secondaryHex}.
NÃO inclua fotografias de praia, hotel, piscina, natureza ou céu.
Resolução editorial 8K, qualidade premium de aplicativo financeiro.
`;
}

// DK2 — OBJETOS 3D VIAGEM GIGANTES FLUTUANDO (sem pessoa)
export function promptDark3DIconsFloating(v: MasterPromptVars): string {
  const headline = pickOfertaHeadline(v.destination, v.creativeSeed || "dk2", v.forbiddenHeadlines);
  return `
Crie um banner publicitário de agência de viagens no estilo visual da marca Kriptopix (fintech, preto + dourado).

COMPOSIÇÃO:
- Metade superior (60%): Fundo preto absoluto. 3 objetos 3D de viagem em tamanho GRANDE e dominante, levitando no centro superior: mala de viagem metálica dourada, passaporte 3D dourado-escuro, ônibus de turismo 3D compacto em plástico fosco. Os objetos têm acabamento FOSCO com luz de estúdio suave — SEM brilho neon, SEM translucidez.
- Metade inferior (40%): Texto e preço em fundo preto, bem espaçados com muito espaço vazio.

TEXTOS — escreva EXATAMENTE e SOMENTE estes textos:
Linha 1 (grande, branca): «${headline}»
Linha 2 (cor ${v.secondaryHex}): «${v.destination}»
Linha 3 (branca, Ultra-Bold, gigante): «${v.installments}x R$ ${v.installmentValue}»
Botão CTA (pílula ${v.secondaryHex}): «Saiba mais →»

${DK_TYPOGRAPHY_RULE}

Fundo preto + objetos em dourado/bronze metálico + texto branco sólido + acento ${v.secondaryHex}.
NÃO inclua céu, praia, hotel, natureza.
Qualidade editorial 8K.
`;
}

// DK3 — SPLIT PRETO + COR COM MAPA DE ROTAS
export function promptDarkMinimalGeometric(v: MasterPromptVars): string {
  const headline = pickOfertaHeadline(v.destination, v.creativeSeed || "dk3", v.forbiddenHeadlines);
  return `
Crie um banner publicitário de agência de viagens no estilo visual Kriptopix — split preto + cor com mapa de rotas.

COMPOSIÇÃO SPLIT VERTICAL:
PARTE SUPERIOR (65%): Fundo preto absoluto.
- À esquerda: texto Bold branco grande empilhado.
- À direita: globo terrestre 3D em dourado metálico fosco, com linhas de rota tracejadas em ${v.secondaryHex} conectando cidades ao destino ${v.destination}. Ao lado do globo, pequenos pins de localização 3D e ícone de avião em miniatura.

PARTE INFERIOR (35%): Fundo sólido na cor ${v.secondaryHex}.
- Texto escuro (preto ou ${v.primaryHex}) sobre fundo claro.
- Botão escuro com seta.

TEXTOS — escreva EXATAMENTE e SOMENTE estes textos:
No topo (branca): «${headline}»
Destino (${v.secondaryHex} no topo / preto na base): «${v.destination}»
Preço (Ultra-Bold): «${v.installments}x R$ ${v.installmentValue}»
Ícones de rota: pontinhos com 2 ou 3 nomes de cidades brasileiras conectando ao destino.

${DK_TYPOGRAPHY_RULE}

NÃO inclua praia, hotel, natureza.
Qualidade editorial 8K.
`;
}

// DK4 — PESSOA + TIPOGRAFIA BRUTALISTA (estilo editorial fintech)
export function promptDarkPersonBrutal(v: MasterPromptVars): string {
  const headline = pickOfertaHeadline(v.destination, v.creativeSeed || "dk4", v.forbiddenHeadlines);
  return `
Crie um banner publicitário premium de agência de viagens com estética editorial fintech.

COMPOSIÇÃO:
- Fundo: metade esquerda preto, metade direita na cor ${v.secondaryHex} sólido.
- Pessoa: mulher ou homem jovem executivo, segurando passaporte ou mochila, sorrindo com confiança. Posicionado centralmente cruzando as duas metades.
- Ao redor da pessoa: 2 a 3 ícones 3D de viagem flutuando — avião de papel dourado 3D, mala 3D, planeta/globo em miniatura.

TEXTOS — escreva EXATAMENTE e SOMENTE estes textos:
Topo esquerdo (branca, Bold): «${headline}»
Centro (branco, Ultra-Bold, grande): «${v.destination}»
Preço (${v.primaryHex === "#ffffff" ? "#111111" : "branco"}, Ultra-Bold, gigante): «${v.installments}x R$ ${v.installmentValue}»
Base (botão pílula escuro com seta): «Reservar agora →»

${DK_TYPOGRAPHY_RULE}

Resolução 8K, sem praia, sem hotel, sem natureza.
`;
}

// DK5 — AVIÃO 3D + TIPOGRAFIA MINIMALISTA
export function promptDarkAirplanePremium(v: MasterPromptVars): string {
  const headline = pickOfertaHeadline(v.destination, v.creativeSeed || "dk5", v.forbiddenHeadlines);
  return `
Crie um banner publicitário de agência de viagens — estilo fintech premium minimalista com avião 3D.

COMPOSIÇÃO:
- Fundo preto absoluto (#0A0A0A). Muito espaço vazio.
- No centro-superior: um avião comercial 3D realista com acabamento FOSCO METÁLICO ESCURO, em perspectiva diagonal elegante, com sombra suave projetada abaixo. O avião é o elemento visual principal e ocupa 40% da tela.
- Ao redor do avião: pequenos planetas 3D (esferas metálicas) e pins de localização minúsculos flutuando, conectados por linhas tracejadas finas na cor ${v.secondaryHex}.

TEXTOS — escreva EXATAMENTE e SOMENTE estes textos:
Topo (${v.secondaryHex}, caps, pequeno): «PACOTE DE VIAGEM»
Centro (branca, Ultra-Bold, fonte gigante): «${v.destination}»
Abaixo (branca): «${v.installments}x R$ ${v.installmentValue}»
Botão CTA (pílula ${v.secondaryHex}): «${headline} →»

${DK_TYPOGRAPHY_RULE}

Sem praia, sem hotel, sem paisagem natural. Qualidade editorial 8K.
`;
}

// DK6 — GRUPO DE PESSOAS + ÔNIBUS 3D (viagem em grupo)
export function promptDarkGroupTravel(v: MasterPromptVars): string {
  const headline = pickOfertaHeadline(v.destination, v.creativeSeed || "dk6", v.forbiddenHeadlines);
  return `
Crie um banner publicitário de agência de viagens — estilo fintech com foco em viagem em grupo.

COMPOSIÇÃO:
- Fundo: preto sólido + faixa horizontal na cor ${v.secondaryHex} cortando o terço inferior.
- Centro superior: um ônibus de turismo 3D moderno em perspectiva 3/4, acabamento FOSCO na cor ${v.primaryHex}, com detalhes dourados/cromados. Ao lado do ônibus, malas e passaportes 3D estilizados (SEM pessoas, SEM figuras humanas).
- Ao redor: planetas miniatura 3D, setas de rota, mapa simplificado.

TEXTOS — escreva EXATAMENTE e SOMENTE estes textos:
Topo esquerdo (branca, Ultra-Bold): «${headline}»
Centro (branca, fonte gigante): «${v.destination}»
Na faixa colorida (cor ${v.primaryHex === "#ffffff" ? "#111" : "branca"}, Ultra-Bold): «${v.installments}x R$ ${v.installmentValue}»
Botão (pílula escura): «Ver pacote →»

${DK_TYPOGRAPHY_RULE}

Sem foto de praia, hotel ou paisagem. Qualidade editorial 8K.
`;
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
  { id: "ticket_pix_card",    name: "OP5 · Bilhete Pix",              builder: promptTicketPixCard },
  { id: "side_hero_performance", name: "OP6 · Faixa Lateral Hero",    builder: promptSideHeroPerformance },
  { id: "yellow_box_cvc",     name: "OP7 · Box Amarelo CVC (V3)",     builder: promptYellowBoxCVC },
  // 🔵 EXPERIÊNCIA DESTINO
  { id: "iconic_landmark",    name: "ED1 · Hero Cinematográfico",     builder: promptIconicLandmark },
  { id: "split_yellow_side",  name: "ED2 · Split Suave",              builder: promptSplitYellowSide },
  { id: "elegant_center",     name: "ED3 · Story Lifestyle",          builder: promptElegantCenterCard },
  { id: "editorial_visual",   name: "ED4 · Multi Experiência (Grid)", builder: promptEditorialVisual },
  { id: "top_editorial_photo", name: "ED5 · Minimalista Premium",     builder: promptTopEditorialPhoto },
  { id: "two_scene_editorial", name: "ED6 · Duas Cenas Editoriais",   builder: promptTwoSceneEditorial },
  // ⬛ AUTORIDADE PREMIUM (DARK — ESTILO KRIPTOPIX)
  { id: "dark_neon_glassmorphism", name: "DK1 · Pessoa + Ícones 3D",   builder: promptDarkNeonGlassmorphism },
  { id: "dark_3d_icons_floating",  name: "DK2 · Objetos 3D Gigantes",  builder: promptDark3DIconsFloating },
  { id: "dark_minimal_geometric",  name: "DK3 · Mapa de Rotas",        builder: promptDarkMinimalGeometric },
  { id: "dark_person_brutal",      name: "DK4 · Split Pessoa Editorial",builder: promptDarkPersonBrutal },
  { id: "dark_airplane_premium",   name: "DK5 · Avião 3D Premium",     builder: promptDarkAirplanePremium },
  { id: "dark_group_travel",       name: "DK6 · Ônibus + Grupo",       builder: promptDarkGroupTravel },
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



// ============================================================
// V3 (CVC YELLOW BOX) — Equivalente IA do template canvas V3
// ============================================================
export function promptYellowBoxCVC(v: MasterPromptVars): string {
  const headline = pickOfertaHeadline(v.destination, v.creativeSeed || "v3-cvc", v.forbiddenHeadlines);
  const isSquare = v.format === "square";
  return `
Banner publicitário de viagem ${isSquare ? "quadrado 1:1" : "vertical 9:16"} no estilo "CVC / Decolar / Hurb" — agência de viagem brasileira tradicional, foco em conversão direta.

FUNDO: Foto aérea (drone) REAL do destino "${v.destination}" ocupando 100% do banner — mar azul-turquesa, praia, cidade ou paisagem icônica reconhecível, luz natural cristalina, alta definição. Sem efeitos artísticos, sem ilustração, sem 3D.

ELEMENTO PRINCIPAL — GRANDE BOX AMARELO:
Um grande retângulo na cor AMARELO VIBRANTE (#FFD400) com cantos bem arredondados (raio ~36px), posicionado ${isSquare ? "ocupando ~55% da largura à esquerda do banner, alinhado verticalmente ao centro" : "no terço superior do banner, ocupando ~85% da largura"}, com leve sombra sutil para destacar do fundo fotográfico.

DENTRO DO BOX (hierarquia vertical, do topo para a base):
1. TOPO: tag pequena "PACOTE" (uppercase, Bold pequeno, preto). NUNCA desenhar logo — esse espaço fica vazio (será preenchido depois pelo compositor).
2. NOME DO DESTINO: "${v.destination.toUpperCase()}" em Ultra-Bold preto, tamanho grande (dominante no box).
3. LINHA DE INFO: "${v.duration || "7 DIAS"}" + linha horizontal de 4-5 ícones MONOCROMÁTICOS pretos em outline fino (avião, ônibus, hotel, café, câmera). Sem ícones coloridos.
4. BLOCO DE PREÇO (split horizontal):
   - Esquerda: "a partir de" + "${v.installments}x sem juros" (Bold pequena, preto)
   - Direita: "R$ ${v.installmentValue}" em tamanho GIGANTE (a maior tipografia do banner inteiro), Ultra-Bold preto. Formato BRL: ponto separa milhar, vírgula separa centavos.
5. TOTAL POR PESSOA: linha pequena "Total: R$ ${v.totalValue} por pessoa" — regular pequena, preto.
6. FAIXA INFERIOR PROMOCIONAL: faixa AZUL-MARINHO (#0A2540) ou cor primária ${v.primaryHex} no rodapé do box (cantos inferiores arredondados acompanhando o box). Texto branco Bold "${v.promoName} à vista no Pix" + pequeno ícone monocromático branco do Pix ao lado.

TEXTOS EXATOS — escreva SOMENTE esses, sem inventar palavras adicionais:
- «PACOTE»
- «${v.destination.toUpperCase()}»
- «${v.duration || "7 DIAS"}»
- «a partir de»
- «${v.installments}x sem juros»
- «R$ ${v.installmentValue}»
- «Total: R$ ${v.totalValue} por pessoa»
- «${v.promoName} à vista no Pix»

REGRAS ABSOLUTAS:
- Hierarquia visual clara: o R$ do preço é SEMPRE o maior elemento do banner.
- NÃO usar ícones coloridos. Apenas monocromáticos pretos dentro do box.
- NÃO poluir. Respiração entre os blocos.
- Texto perfeitamente escrito, sem erros, sem letras cortadas.
- Box amarelo com sombra sutil. Fundo fotográfico nítido, cores naturais.
- Qualidade editorial profissional, resolução 8K.
`;
}

