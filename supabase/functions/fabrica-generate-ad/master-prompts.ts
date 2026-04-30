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
   • Linha de informações com ícones pequenos: "X dias ✈ 🚌 🏨 ☕" (duração + transporte + hospedagem + alimentação).
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
    ⬛ REGRAS ESPECÍFICAS DA CATEGORIA — AUTORIDADE PREMIUM (DARK 3D)
    - FOCO TOTAL NA AGÊNCIA E NO PACOTE, NÃO NO DESTINO.
    - É PROIBIDO GERAR FOTOGRAFIAS REAIS DE TURISMO (sem praias, sem hotéis, sem céu azul).
    - O fundo deve ser um Dark Mode absoluto (preto, chumbo escuro, ou gradiente radial muito escuro).
    - ESTÉTICA FINTECH / KRIPTOPIX: Use cartões de UI translúcidos (glassmorphism negro), bordas luminosas (neon suave), e profundidade espacial 3D.
    - ELEMENTOS 3D FLUTUANTES: Sempre inclua ícones premium em 3D levitando no ar (ex: moedas douradas, passaportes blindados, globos terrestres translúcidos, ou pequenos aviões dourados de papel/metal).
    - As cores primária e secundária DEVEM dominar as fontes e a iluminação. O Contraste extremo é o segredo desta categoria.
    - ADAPTAÇÃO AO FORMATO: Esta imagem será gerada para Feed (Quadrado) ou Stories (Vertical). Adapte a distribuição do design para o formato fornecido. Nunca deixe os textos baterem ou vazarem pelas bordas.
    - VENDA PURA E DIRETA: O foco do anúncio é a venda. Preço grande, destino chamativo, pacotes e formato de conversão.
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
  (d) => `Pacote especial para ${d}`,
  (d) => `Sua viagem para ${d} está pronta`,
  (d) => `${d} com tudo incluso`,
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
    ? `[BLOCO DE PREÇO — DESTAQUE EXTREMO]
${v.installments} de R$ ${v.installmentValue}     ← FONTE GIGANTE, ULTRA-BOLD
Selo principal: ${v.promoName.toUpperCase()}`
    : opts.category === "autoridade_dark"
    ? `[BLOCO DE INFORMAÇÕES — 3D PREMIUM]
${v.installments} de R$ ${v.installmentValue}     ← PREÇO LUMINOSO EM NEON/BRILHO
Selo corporativo: ${v.promoName.toUpperCase()}`
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
    ? "- PREÇO e DESTINO = competem em impacto. Foco na precisão e tecnologia.\n- TEXTO COM GLOW/NEON."
    : "- IMAGEM = protagonista absoluta; texto deve ser leve e elegante.\n- DESTINO = maior texto, mas sem competir com a fotografia.";
  const centerRule = opts.category === "oferta"
    ? "- Centro de conversão obrigatório nos 65% centrais da imagem."
    : "- Centro seguro obrigatório nos 65% centrais para título e narrativa; NÃO criar centro de conversão.";
  const objectiveLine = opts.category === "oferta"
    ? "foco em legibilidade, espaço vazio abundante e alto impacto visual para conversão imediata."
    : "foco em emoção, desejo, espaço negativo amplo, fotografia premium e leitura elegante, sem aparência de oferta.";

  return `
Um banner publicitário vertical de turismo (formato 9:16, resolução 8K), hiper-realista, com qualidade cinematográfica, iluminação natural ou dramática altamente refinada e composição profissional de nível publicitário.

A imagem deve seguir rigorosamente um layout estruturado e organizado, com hierarquia visual clara, ${objectiveLine}

A composição segue o layout: ${opts.layout}.

[VARIAÇÃO CRIATIVA OBRIGATÓRIA]
ID de variação: ${creativeSeed}.
Direção única desta geração: ${variationDirectives[variationIndex]}.
Este anúncio DEVE seguir a câmera, iluminação e estruturação exatas informadas na "Direção única", garantindo variação visual extrema. Mude os elementos de lugar e inove na composição espacial de acordo com a diretriz acima.

[FOTOGRAFIA PRINCIPAL]
Uma cena extremamente realista e detalhada de ${v.destination}, com iluminação ${opts.lighting}, mostrando ${opts.sceneDescription}.

[ELEMENTOS DE INTERFACE]
Interface moderna, limpa e minimalista, com tipografia perfeita e MUITO ESPAÇO VAZIO (Negative Space) para evitar sobreposição de textos.
Paleta obrigatória e bloqueada: cor primária ${v.primaryHex}, cor secundária ${v.secondaryHex}. Use SOMENTE essas duas cores nos blocos, preço, badges e detalhes.

Título/Chamada: "${opts.headline}"
Destino destacado: "${v.destination}"
${promoLine}

${valueBlock}

${opts.specialization ? `[ESPECIALIZAÇÃO DESTE PROMPT]\n${opts.specialization}\n` : ""}
${categoryRules}

══════════════════════════════════════
DIRETRIZES ESTRITAS DE RENDERIZAÇÃO DE INTERFACE (UI/UX) E TIPOGRAFIA:
A imagem deve ser gerada no formato Vertical 9:16 (resolução 8K). O motor de geração deve obedecer rigorosamente ao seguinte sistema de grid matemático, 'Safe Zones' do Instagram Stories e prevenção de artefatos:

1. SAFE ZONES E ESPAÇAMENTO (CRÍTICO):
- É OBRIGATÓRIO deixar margens amplas ao redor de cada bloco de texto.
- PROIBIDO sobrepor textos em cima uns dos outros ou sobre bordas de cartões.
- Margem Superior (Top 15%) e Margem Inferior (Bottom 20%): Livres de texto.

2. POSICIONAMENTO:
- Zero sobreposição entre elementos. Espaçamento visível entre título e preço.
- Espaçamento matemático e simétrico entre todos os blocos.
${centerRule}

3. TIPOGRAFIA:
${typographyHierarchy}
- Texto com CONTRASTE ABSOLUTO.

4. QUALIDADE:
- SEM erros de texto: ortografia perfeita em português.
- NUNCA crie listas de tópicos com marcadores (bullet points ou ícones pequenos).

══════════════════════════════════════
🛑 OBRIGATÓRIO: RENDERIZAÇÃO DE TEXTO EXATO E LIMPO
══════════════════════════════════════
Você DEVE escrever os textos EXATAMENTE como passados no prompt.
É proibido inventar palavras de viagem, adicionar ícones desenhados, ou criar descrições longas. O texto precisa ser uma cópia EXATA e o mais curto possível.

📋 TEXTOS EXATOS DESTE BANNER:
• Destino: «${v.destination}»
• Título principal: «${opts.headline}»
${opts.category !== "experiencia" ? `• Parcela: «${v.installments}x R$ ${v.installmentValue}»\n• Selo: «${v.promoName}»` : ""}

⚠️ NUNCA deixe letras cortadas na borda da imagem. Toda palavra deve caber inteira na imagem.
══════════════════════════════════════

🛑 REGRAS ABSOLUTAS ADICIONAIS:
- GERAR APENAS 1 IMAGEM ÚNICA (PROIBIDO fazer grids empilhados, colagens ou mockups duplos).
- O cartão da oferta (se houver) deve estar limpo e MUITO bem espaçado, sem textos amontoados.
- As cores primária e secundária informadas DEVEM ser as únicas cores dominantes.
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
    sceneDescription: `${v.destination} com riqueza de detalhes — céu dramático, luz dourada, pessoas naturais em momentos espontâneos, água cristalina ou paisagem icônica. ${v.destinationDescription}`,
    headline,
    experienceDescription: `Uma experiência inesquecível espera por você em ${v.destination}.`,
    specialization:
      "• Título elegante e LEVE no centro: '" + headline + "' — use EXATAMENTE essa frase.\n• Subtítulo sutil abaixo.\n• NENHUMA lista de ícones ou passeios.\n• PROIBIDO caixa de preço, cartão promocional, cores agressivas.\n• Estilo: editorial, aspiracional, limpo, capa de revista de viagem com MUITO espaço em branco.",
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
    sceneDescription: `${v.destination} com foco em experiência — mar, arquitetura ou natureza com luz natural suave, pessoas interagindo com o ambiente de forma natural. ${v.destinationDescription}`,
    headline,
    experienceDescription: `Dias únicos com paisagens incríveis e momentos inesquecíveis em ${v.destination}.`,
    specialization:
      "• Texto na área inferior com amplo respiro:\n   Título: '" + headline + "'\n   Descrição: 'Paisagens incríveis e momentos inesquecíveis'.\n• NENHUMA lista.\n• NENHUM preço.\n• Estilo: minimalista, leve, silencioso, sem aparência de anúncio.",
  });
}

// 🌍 ED3 — STORY LIFESTYLE (PESSOAS + EXPERIÊNCIA)
export function promptElegantCenterCard(v: MasterPromptVars): string {
  const headline = pickExperienciaHeadline(v.destination, v.creativeSeed || "ed3", v.forbiddenHeadlines);
  return buildBrain(v, {
    category: "experiencia",
    layout:
      "STORY LIFESTYLE — fotografia full-bleed dominante mostrando pessoas reais aproveitando o destino. Texto sobreposto leve, sem caixas pesadas.",
    lighting: "luz natural, clima feliz, sensação de liberdade, atmosfera real e espontânea",
    sceneDescription: `grupo de pessoas reais aproveitando ${v.destination} — rindo, tirando fotos, vivendo o momento. Ambiente vivo, autêntico, sem pose comercial. ${v.destinationDescription}`,
    headline,
    experienceDescription: `Momentos que ficam para sempre em ${v.destination}.`,
    specialization:
      "• Apenas UM bloco de texto centralizado: '" + headline + "'.\n• NENHUM texto na base, nenhum ícone.\n• PROIBIDO cartões, caixas pesadas e elementos de oferta.\n• Estilo: Instagram orgânico premium, espaço livre gigante.",
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
    experienceDescription: `${v.destination} além do óbvio.`,
    specialization:
      "• Área limpa:\n   Título: '" + headline + "'\n   Subtítulo: '" + v.destination + " além do óbvio'.\n• SEM listas.\n• SEM destaque de preço.\n• Estilo: revista de viagem minimalista, onde o silêncio e o vazio são tão importantes quanto a foto.",
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
    experienceDescription: `Uma experiência para poucos.`,
    specialization:
      "• Centro: '" + headline + "' — use EXATAMENTE essa frase.\n• Abaixo: 'Uma experiência para poucos'.\n• NENHUM preço.\n• MUITO espaço negativo (respiro visual) — o texto deve ocupar apenas 10% da tela.\n• Estilo: luxo absoluto, exclusivo, silencioso.",
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
      "• Na cor sólida: '" + headline + "' como título principal.\n• NENHUM checklist, nenhum preço, nenhum selo.\n• Composição limpa estilo página de revista.\n• Extremamente focado em tipografia espaçada e margens generosas.",
  });
}

// ============================================================
// ⬛ AUTORIDADE PREMIUM (DARK 3D) — DK1..DK3
// ============================================================

export function promptDarkNeonGlassmorphism(v: MasterPromptVars): string {
  const headline = pickOfertaHeadline(v.destination, v.creativeSeed || "dk1", v.forbiddenHeadlines);
  return buildBrain(v, {
    category: "autoridade_dark",
    layout:
      "FUNDO ESCURO PROFUNDO (Dark Mode). No centro, um cartão de vidro fumê translúcido (Glassmorphism) com bordas luminosas suaves. Texto super brilhante dentro do vidro.",
    lighting: "estúdio profissional, luz neon suave recortando o vidro, altíssimo contraste",
    sceneDescription: `um ambiente tecnológico e financeiro abstrato em fundo preto; nenhum céu e nenhuma paisagem. Foco absoluto no painel UI de ${v.destination} em glassmorphism negro`,
    headline,
    specialization:
      "• O destino não é mostrado via fotos; é exibido através da TIPOGRAFIA de alto padrão no centro.\n• Cartão translúcido (Glassmorphism Escuro) com margens enormes flutuando sobre a escuridão.\n• PROIBIDO gerar listinhas de benefícios.",
  });
}

export function promptDark3DIconsFloating(v: MasterPromptVars): string {
  const headline = pickOfertaHeadline(v.destination, v.creativeSeed || "dk2", v.forbiddenHeadlines);
  return buildBrain(v, {
    category: "autoridade_dark",
    layout:
      "FUNDO DARK COM ÍCONES 3D FLUTUANDO. Ícones premium de viagem (globos 3D, pins de localização, moedas) levitam em diferentes níveis de foco ao redor de um painel de conversão central de alta tecnologia.",
    lighting: "backlight cinematográfico (rim lighting) focando apenas nas bordas dos objetos 3D, isolando-os da escuridão do fundo",
    sceneDescription: `elementos abstratos 3D de turismo premium flutuando no vazio preto (sem céus nem água). Foco de luz dramática nos elementos. Oferta de ${v.destination} no meio`,
    headline,
    specialization:
      "• Sensação forte de autoridade, similar a um aplicativo financeiro (Fintech) ou corretora.\n• Cores de destaque restritas para dar choque e elegância no fundo negro.\n• Preço gigante iluminado como neon no centro da composição.",
  });
}

export function promptDarkMinimalGeometric(v: MasterPromptVars): string {
  const headline = pickOfertaHeadline(v.destination, v.creativeSeed || "dk3", v.forbiddenHeadlines);
  return buildBrain(v, {
    category: "autoridade_dark",
    layout:
      "COMPOSIÇÃO GEOMÉTRICA FLAT/3D EXTREMAMENTE MINIMALISTA. Apenas o preto absoluto e faixas de cor na paleta definida. Muito espaço vazio, layout assimétrico focado no poder das palavras.",
    lighting: "iluminação direcional forte sobre um único objeto ou letra principal",
    sceneDescription: `um layout puramente corporativo e geométrico focado na venda do pacote para ${v.destination}, abstrato, corporativo`,
    headline,
    specialization:
      "• MÁXIMO de espaço vazio e escuro. Foco no preço e destino em fonte GIGANTESCA.\n• Pode ter a silhueta de uma pessoa com 'rim lighting' dourado usando um celular de lado (simbolizando o cliente comprando).",
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
