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
  /** Headlines a EVITAR nesta geração (vindas do GenerationGuard do cliente). */
  forbiddenHeadlines?: string[];
  /** Layout/templateIds a EVITAR (apenas log/uso futuro). */
  forbiddenLayouts?: string[];
  /** Formato de saída: "square" (1:1 feed) ou "story" (9:16). Default: story. */
  format?: "square" | "story";
}

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

3. SELO/LOGO DA AGÊNCIA pequeno e discreto no canto inferior direito (círculo colorido).

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
    ? `[BLOCO DE PREÇO — CARD ÚNICO E LIMPO]
APENAS DOIS textos dentro do card, nesta ordem:
  1) "${v.installments}x R$ ${v.installmentValue}"  ← MAIOR ELEMENTO, ULTRA-BOLD, fonte gigante
  2) "Total R$ ${v.totalValue}"  ← linha pequena, fina, abaixo do preço
🚫 PROIBIDO dentro do card: ícones (avião/ônibus/hotel/mala/câmera/xícara/estrelas), bullets, listas, duração, selos extras, múltiplas linhas de copy. Card 100% tipográfico, mínimo absoluto.
Selo único permitido FORA do card (canto, opcional, pequeno): "${v.promoName.toUpperCase()}"`
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
  return buildBrain(v, {
    category: "oferta",
    layout:
      "DIVISÃO HORIZONTAL — topo com fotografia full-bleed do destino e base com bloco sólido vibrante. O bloco sólido possui muito espaço livre interno.",
    lighting: "natural diurna brilhante, hora dourada, cores vivas, sombras nítidas",
    sceneDescription: v.destinationDescription,
    headline,
    specialization:
      "• Bloco de conversão íntegro e separado. O cartão de oferta DEVE ficar com folga, SEM encostar nas bordas ou na foto principal.\n• DIVISÃO VISUAL clara entre foto e bloco.\n• PREÇO espaçado e legível, com margem vazia ao seu redor.\n• Cores obrigatórias: bloco na cor primária e destaques na cor secundária.",
  });
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

// DK1 — PESSOA CORPORATIVA + ÍCONES 3D FLUTUANDO
export function promptDarkNeonGlassmorphism(v: MasterPromptVars): string {
  const headline = pickOfertaHeadline(v.destination, v.creativeSeed || "dk1", v.forbiddenHeadlines);
  return `
Banner publicitário vertical 9:16 no estilo de uma fintech premium brasileira (referência: Kriptopix).

FUNDO: Preto absoluto (#0A0A0A), sem gradientes, sem texturas.

COMPOSIÇÃO: No lado esquerdo, texto em bloco com tipografia Ultra-Bold. No lado direito, objetos 3D de viagem flutuando (avião dourado, passaporte metálico, mala 3D) com luz de estúdio lateral suave.

PESSOA: Opcional. Se incluída, deve ser uma pessoa com aparência executiva/profissional, roupa escura ou na cor ${v.primaryHex}, olhando para o lado ou para a câmera com expressão determinada.

TEXTOS EXATOS — escreva SOMENTE esses textos, SEM inventar palavras:
- Headline (fonte Ultra-Bold branca, grande): «${headline}»
- Destino (fonte Bold, cor ${v.secondaryHex}): «${v.destination}»
- Preço (fonte Ultra-Bold branca, tamanho gigante): «${v.installments}x R$ ${v.installmentValue}»
- Botão CTA pequeno (pílula na cor ${v.secondaryHex} com seta): «Reserve Agora →»

TIPOGRAFIA: APENAS fontes sólidas, cor sólida. PROIBIDO: outline, vazado, neon, glow.
PALETA: Fundo preto + destaque obrigatório na cor ${v.secondaryHex} apenas em botão e acento.

🛑 REGRAS ABSOLUTAS:
- Texto perfeitamente escrito, sem erros ortográficos, sem letras cortadas na borda.
- NÃO gere fotografias de praia, hotel, natureza ou turismo no fundo.
- Máximo de 4 blocos de texto distintos na imagem inteira.
- Qualidade editorial profissional, resolução 8K.
`;
}

// DK2 — OBJETOS 3D DOURADOS GIGANTES + HEADLINE IMPACTANTE
export function promptDark3DIconsFloating(v: MasterPromptVars): string {
  const headline = pickOfertaHeadline(v.destination, v.creativeSeed || "dk2", v.forbiddenHeadlines);
  return `
Banner publicitário vertical 9:16 no estilo fintech premium (referência: Kriptopix - layout com moedas 3D gigantes acima de texto).

FUNDO: Preto absoluto na metade superior. Na metade inferior, fundo levemente mais escuro ou igual.

COMPOSIÇÃO: Na metade superior da tela, 2 a 3 objetos 3D de viagem em tamanho GIGANTE e proporção dominante (passaportes metálicos dourados, mala de viagem 3D, globo terrestre metálico, bilhete de avião 3D dourado). Os objetos têm acabamento FOSCO-METÁLICO com reflexos de luz de estúdio suave. Na metade inferior: texto e preço bem espaçados.

LOGO DA MARCA no topo, discreta (apenas um ícone K ou similar).

TEXTOS EXATOS — escreva SOMENTE esses textos, SEM inventar palavras:
- Headline (fonte Ultra-Bold branca ou ${v.secondaryHex}, grande): «${headline}»
- Destino (fonte Bold, branco): «${v.destination}»
- Preço (fonte Ultra-Bold branca, tamanho gigante): «${v.installments}x R$ ${v.installmentValue}»
- Botão CTA (pílula com seta na cor ${v.secondaryHex}): «Saiba mais →»

TIPOGRAFIA: Apenas sólida. PROIBIDO outline, vazado, neon, glow.
PALETA: Fundo preto + objetos em dourado-metálico + texto branco + acento ${v.secondaryHex}.

🛑 REGRAS ABSOLUTAS:
- Texto perfeitamente escrito, sem erros ortográficos, sem letras cortadas.
- NÃO gere praia, hotel, natureza, céu.
- Qualidade editorial profissional, resolução 8K.
`;
}

// DK3 — SPLIT FUNDO PRETO + COR COM MOCKUP / MAPA DE ROTAS
export function promptDarkMinimalGeometric(v: MasterPromptVars): string {
  const headline = pickOfertaHeadline(v.destination, v.creativeSeed || "dk3", v.forbiddenHeadlines);
  return `
Banner publicitário vertical 9:16 no estilo fintech premium (referência: Kriptopix - layout split preto + amarelo com mockup de app e rotas globais).

COMPOSIÇÃO SPLIT VERTICAL:
- TOPO (60% da tela): Fundo PRETO ABSOLUTO. Texto Bold branco grande à esquerda. À direita, um mockup 3D de celular mostrando um "app de pacotes de viagem" na tela, OU um globo terrestre abstrato em dourado-metálico com linhas de rotas tracejadas conectando cidades (estilo mapa de voos).
- BASE (40% da tela): Fundo na cor ${v.secondaryHex} (amarelo ouro). Texto escuro sobre ele. Botão escuro com seta.

TEXTOS EXATOS — escreva SOMENTE esses textos, SEM inventar palavras:
- Headline (fonte Ultra-Bold branca no topo): «${headline}»
- Destino (fonte Bold na cor ${v.secondaryHex} ou preto, dependendo da área): «${v.destination}»
- Preço (fonte Ultra-Bold, cor contrastante): «${v.installments}x R$ ${v.installmentValue}»
- Linha ícones de rotas: pontinhos com nomes de 2 ou 3 cidades conectando ao destino.

TIPOGRAFIA: Apenas sólida, Ultra-Bold. PROIBIDO outline, vazado, neon, glow.

🛑 REGRAS ABSOLUTAS:
- Texto perfeitamente escrito, sem erros ortográficos, sem letras cortadas.
- NÃO gere praia, hotel, natureza.
- Qualidade editorial profissional, resolução 8K.
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
  // 🔵 EXPERIÊNCIA DESTINO
  { id: "iconic_landmark",    name: "ED1 · Hero Cinematográfico",     builder: promptIconicLandmark },
  { id: "split_yellow_side",  name: "ED2 · Split Suave",              builder: promptSplitYellowSide },
  { id: "elegant_center",     name: "ED3 · Story Lifestyle",          builder: promptElegantCenterCard },
  { id: "editorial_visual",   name: "ED4 · Multi Experiência (Grid)", builder: promptEditorialVisual },
  { id: "top_editorial_photo", name: "ED5 · Minimalista Premium",     builder: promptTopEditorialPhoto },
  { id: "two_scene_editorial", name: "ED6 · Duas Cenas Editoriais",   builder: promptTwoSceneEditorial },
  // ⬛ AUTORIDADE PREMIUM (DARK 3D)
  { id: "dark_neon_glassmorphism", name: "DK1 · Vidro e Neon",        builder: promptDarkNeonGlassmorphism },
  { id: "dark_3d_icons_floating",  name: "DK2 · Ícones 3D Flutuando", builder: promptDark3DIconsFloating },
  { id: "dark_minimal_geometric",  name: "DK3 · Geométrico Minimal",  builder: promptDarkMinimalGeometric },
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
