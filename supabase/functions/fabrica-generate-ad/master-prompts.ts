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
    : `[BLOCO DE EXPERIÊNCIA — EDITORIAL, SEM CARA DE OFERTA]
${opts.experienceDescription || `Roteiro de ${v.duration} explorando ${v.destination} com curadoria local e conforto.`}
Tipo de viagem: ${v.packageType} · ${v.duration}
PREÇO É OPCIONAL E DISCRETO: se inserir, use APENAS um pequeno texto fino "A partir de R$ ${v.installmentValue}" em tipografia leve, posicionado como nota lateral dentro da área segura central. NÃO usar caixa colorida, NÃO usar parcelamento em destaque, NÃO usar selos. Em layouts mais minimalistas (ED1, ED3, ED5) o preço pode ser totalmente OMITIDO em favor de "Consulte disponibilidade".`;

  const categoryRules = opts.category === "oferta" ? OFERTA_RULES : EXPERIENCIA_RULES;
  const creativeSeed = v.creativeSeed || `${opts.category}-${opts.layout.slice(0, 24)}`;
  const variationDirectives = opts.category === "oferta"
    ? [
        "LAYOUT ÚNICO DESTA GERAÇÃO: imagem full com preço direto sobre a foto, SEM cartão central · POSIÇÃO PREÇO: lado esquerdo livre · CORES: usar SOMENTE a primária e secundária informadas · IMAGEM: panorâmica praia · ILUMINAÇÃO: natural cristalina",
        "LAYOUT ÚNICO DESTA GERAÇÃO: divisão topo imagem 60% + base sólida 40% com oferta · POSIÇÃO PREÇO: base inferior dentro da safe zone · CORES: usar SOMENTE a primária e secundária informadas · IMAGEM: aérea/drone · ILUMINAÇÃO: luz dramática de meio-dia",
        "LAYOUT ÚNICO DESTA GERAÇÃO: barra lateral vertical + imagem dominante · POSIÇÃO PREÇO: lado direito dentro da barra · CORES: usar SOMENTE a primária e secundária informadas · IMAGEM: close lifestyle · ILUMINAÇÃO: backlight quente",
        "LAYOUT ÚNICO DESTA GERAÇÃO: grid de fotos com preço em selo isolado · POSIÇÃO PREÇO: selo no canto oposto à imagem principal · CORES: usar SOMENTE a primária e secundária informadas · IMAGEM: múltiplos recortes turísticos · ILUMINAÇÃO: comercial brilhante",
        "LAYOUT ÚNICO DESTA GERAÇÃO: cartão inclinado/assimétrico tipo ticket · POSIÇÃO PREÇO: dentro de selo circular · CORES: usar SOMENTE a primária e secundária informadas · IMAGEM: lifestyle pessoas viajando · ILUMINAÇÃO: sunset cinematográfico",
        "LAYOUT ÚNICO DESTA GERAÇÃO: texto central leve com preço isolado, sem bloco pesado · POSIÇÃO PREÇO: centro inferior · CORES: usar SOMENTE a primária e secundária informadas · IMAGEM: detalhe arquitetônico ou close · ILUMINAÇÃO: luz suave difusa",
      ]
    : [
        "LAYOUT ÚNICO DESTA GERAÇÃO: imagem full sem caixas; texto leve no centro seguro; fotografia contemplativa domina tudo",
        "LAYOUT ÚNICO DESTA GERAÇÃO: divisão topo + base suave sem cara de promoção; imagem ocupa a maior parte; texto editorial discreto",
        "LAYOUT ÚNICO DESTA GERAÇÃO: barra lateral editorial fina com foto dominante; sem preço protagonista; linguagem emocional",
        "LAYOUT ÚNICO DESTA GERAÇÃO: grid editorial de fotos diferentes; título curto e leve; nenhum bloco de venda",
        "LAYOUT ÚNICO DESTA GERAÇÃO: texto central leve sobre foto limpa; muito respiro; sem cartão e sem selo",
      ];
  const variationIndex = Math.abs([...creativeSeed].reduce((acc, char) => acc + char.charCodeAt(0), 0)) % variationDirectives.length;
  const promoLine = opts.category === "oferta"
    ? `Selo promocional: "${v.promoName}"`
    : `Chamada editorial secundária: "${opts.experienceDescription || `Dias leves em ${v.destination}, com calma, beleza e curadoria.`}" — sem selo promocional, sem urgência e sem linguagem de oferta.`;
  const typographyHierarchy = opts.category === "oferta"
    ? "- PREÇO = maior elemento da composição (Ultra-Bold / Heavy).\n- DESTINO = segundo maior elemento (Bold)."
    : "- IMAGEM = protagonista absoluta; texto deve ser leve e elegante.\n- DESTINO = maior texto, mas sem competir com a fotografia.\n- PREÇO, se existir, deve ser o menor elemento informativo e nunca usar Ultra-Bold.";
  const centerRule = opts.category === "oferta"
    ? "- Centro de conversão obrigatório nos 65% centrais da imagem (preço, headline, destino e CTA)."
    : "- Centro seguro obrigatório nos 65% centrais para título e narrativa; NÃO criar centro de conversão com preço/CTA grande.";
  const objectiveLine = opts.category === "oferta"
    ? "foco em legibilidade e alto impacto visual para conversão imediata."
    : "foco em emoção, desejo, fotografia premium e leitura elegante, sem aparência de oferta.";

  return `
Um banner publicitário vertical de turismo (formato 9:16, resolução 8K), hiper-realista, com qualidade cinematográfica, iluminação natural ou dramática altamente refinada e composição profissional de nível publicitário.

A imagem deve seguir rigorosamente um layout estruturado e organizado, com hierarquia visual clara, ${objectiveLine}

A composição segue o layout: ${opts.layout}.

[VARIAÇÃO CRIATIVA OBRIGATÓRIA]
ID de variação: ${creativeSeed}.
Direção única desta geração: ${variationDirectives[variationIndex]}.
Este anúncio DEVE seguir a câmera, iluminação e estruturação exatas informadas na "Direção única", garantindo variação visual extrema. Mude os elementos de lugar e inove na composição espacial de acordo com a diretriz acima.

[REFERÊNCIAS DE ESTILO]
Use a biblioteca de referências de anúncios enviada pelo usuário APENAS como inspiração estrutural: divisão 60/40 foto + base sólida, cartão amarelo de pacote, faixa lateral vibrante, selo tipo bilhete Pix, layout editorial topo/base e grid editorial de experiências. NÃO copie destinos, preços, datas, hotéis, textos legais ou informações fixas dessas referências. Os únicos dados permitidos são os dados preenchidos no formulário abaixo.

[FOTOGRAFIA PRINCIPAL]
Uma cena extremamente realista e detalhada de ${v.destination}, com iluminação ${opts.lighting}, mostrando ${opts.sceneDescription}.

[ELEMENTOS DE INTERFACE]
Interface moderna, limpa e minimalista, com tipografia perfeita e alinhamento matemático.
Paleta obrigatória e bloqueada: cor primária ${v.primaryHex}, cor secundária ${v.secondaryHex}. Use SOMENTE essas duas cores nos blocos, preço, badges, barras, cartões e detalhes. É proibido substituir por verde/preto/azul/amarelo genérico ou qualquer paleta sugerida pelo estilo.

Título/Chamada: "${opts.headline}"
Destino destacado: "${v.destination}"
${promoLine}

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
- Se houver logo ou nome da agência no topo esquerdo, reservar uma área limpa exclusiva; cidade, badge, título, preço e qualquer texto devem começar abaixo ou ao lado, nunca por cima dessa área.
${centerRule}

3. TIPOGRAFIA:
${typographyHierarchy}
- Texto com CONTRASTE ABSOLUTO: branco sobre fundos escuros/vibrantes; escuro sobre fundos claros. Drop-shadow suave quando o texto estiver sobre foto.
- Sans-serif moderna premium estilo Apple/alta tecnologia.

4. QUALIDADE:
- SEM distorções anatômicas (cabeças desproporcionais, membros extras, duplicação ilógica de objetos como dois relógios no mesmo pulso).
- SEM erros de texto: ortografia perfeita em português, sem caracteres alienígenas, sem fusão de letras.
- REALISMO ABSOLUTO em qualquer elemento humano, objeto ou cenário.

══════════════════════════════════════
🛑 OBRIGATÓRIO: RENDERIZAÇÃO DE TEXTO EXATO
══════════════════════════════════════
Você DEVE escrever os textos EXATAMENTE como passados no prompt.
É proibido inventar palavras de viagem, adicionar adjetivos ou criar seus próprios títulos. 
O texto precisa ser uma cópia EXATA.

📋 TEXTOS EXATOS DESTE BANNER:
• Destino: «${v.destination}»
• Título principal: «${opts.headline}»
• Parcela: «${v.installments}x R$ ${v.installmentValue}»
• Preço total: «Preço total: R$ ${v.totalValue}»
• Rodapé: «Saindo de ${v.city}. Consulte disponibilidade.»

⚠️ NUNCA deixe letras cortadas na borda da imagem. Toda palavra deve caber inteira na imagem.
══════════════════════════════════════

🛑 REGRAS ABSOLUTAS ADICIONAIS:
- GERAR APENAS 1 IMAGEM.
- É PROIBIDO gerar mockups duplos, duas peças ou colagens.
- O cartão da oferta deve estar bem preenchido e organizado.
- Textos renderizados EXATAMENTE como listados, sem "adivinhar" palavras.
- As cores primária e secundária informadas DEVEM ser as únicas cores dominantes.
══════════════════════════════════════
`;
}

// ============================================================
// 🔴 OFERTA PACOTE — OP1..OP4
// ============================================================

// 🔥 OP1 — CARTÃO DIVIDIDO (base Cancún)
export function promptClassicVertical(v: MasterPromptVars): string {
  const headline = pickOfertaHeadline(v.destination, v.creativeSeed || "op1", v.forbiddenHeadlines);
  return buildBrain(v, {
    category: "oferta",
    layout:
      "DIVISÃO HORIZONTAL EXATA — topo com fotografia full-bleed do destino e base com bloco sólido vibrante. O cartão de oferta fica INTEIRO dentro do bloco sólido inferior, sem cruzar divisórias e sem encostar em outros elementos",
    lighting: "natural diurna brilhante, hora dourada, cores vivas, sombras nítidas",
    sceneDescription: v.destinationDescription,
    headline,
    specialization:
      "• Cartão central íntegro e separado, com sombra projetada para profundidade, SEM sobrepor foto, badge ou lista.\n• DIVISÃO VISUAL clara entre foto e bloco sólido — zero transição gradual.\n• PREÇO extremamente dominante dentro do cartão (mínimo 30% do cartão).\n• Cores obrigatórias: fundo/bloco na cor primária enviada e preço/badges na cor secundária enviada — sem trocar por paleta pronta.",
  });
}

// 🔥 OP2 — CARTÃO CENTRAL FLUTUANTE
export function promptCancunStyle(v: MasterPromptVars): string {
  const headline = pickOfertaHeadline(v.destination, v.creativeSeed || "op2", v.forbiddenHeadlines);
  return buildBrain(v, {
    category: "oferta",
    layout:
      "Fundo 100% FOTOGRÁFICO ocupando toda a tela (sem bloco sólido), com CARTÃO CENTRAL na cor secundária enviada sobreposto e centralizado; selo de desconto separado acima do cartão, nunca sobre a borda do cartão",
    lighting: "tropical brilhante, céu turquesa, água cristalina, alta saturação cinematográfica",
    sceneDescription: v.destinationDescription,
    headline,
    specialization:
      "• Cartão na cor secundária enviada, cantos arredondados, sombra suave para flutuar sobre a foto.\n• PREÇO no centro absoluto do cartão, fonte Ultra-Bold, ocupando 30%+ do cartão.\n• Selo CIRCULAR de desconto deve usar a cor primária enviada e ficar separado do cartão com margem visível; NÃO sobrepor texto nem bordas.\n• Foto NUNCA é cortada de forma agressiva — enquadramento limpo por trás do cartão como background de suporte.",
  });
}

// 🔥 OP3 — CARTÃO AÉREO (TOP DOWN)
export function promptGramadoStyle(v: MasterPromptVars): string {
  const headline = pickOfertaHeadline(v.destination, v.creativeSeed || "op3", v.forbiddenHeadlines);
  return buildBrain(v, {
    category: "oferta",
    layout:
      "FOTO AÉREA top-down ou drone-shot do destino ocupando toda a tela, com CARTÃO arredondado sobreposto na parte SUPERIOR (não centralizado), permitindo respiro inferior para a vista panorâmica respirar",
    lighting: "aérea diurna, sol alto, água translúcida com gradientes turquesa, sombras nítidas",
    sceneDescription: `vista aérea (drone) de ${v.destinationDescription}`,
    headline,
    specialization:
      "• Câmera obrigatoriamente em ângulo TOP-DOWN ou drone alto, mostrando ESCALA e amplitude.\n• Cartão posicionado no TERÇO SUPERIOR — não no centro — para deixar a paisagem respirar.\n• Preço FORTE mas INTEGRADO ao cartão, com selo serrilhado tipo bilhete azul anexado na borda inferior do cartão (PIX 5% OFF).\n• Sensação de descoberta + escala da viagem.",
  });
}

// 🔥 OP4 — BARRA LATERAL (PERFORMANCE)
export function promptMaceioStyle(v: MasterPromptVars): string {
  const headline = pickOfertaHeadline(v.destination, v.creativeSeed || "op4", v.forbiddenHeadlines);
  return buildBrain(v, {
    category: "oferta",
    layout:
      "SPLIT VERTICAL — 30% à ESQUERDA com barra sólida na cor primária enviada contendo TODO o texto e CTA; 70% à DIREITA com fotografia limpa do destino",
    lighting: "comercial brilhante, alto contraste, cores saturadas",
    sceneDescription: v.destinationDescription,
    headline,
    specialization:
      "• Barra lateral 30% com COR SÓLIDA vibrante — contém destino, preço gigante e CTA.\n• Hierarquia de leitura ULTRA-RÁPIDA (3 segundos): destino → preço → CTA.\n• CTA FORTE em botão retangular contrastante: 'RESERVAR AGORA' ou 'GARANTIR VAGA'.\n• Estilo de anúncio direto de performance (Google Ads / Meta Ads), sem ornamentos.",
  });
}

// 🔥 OP5 — BILHETE PIX / CARTÃO AMARELO
export function promptTicketPixCard(v: MasterPromptVars): string {
  const headline = pickOfertaHeadline(v.destination, v.creativeSeed || "op5", v.forbiddenHeadlines);
  return buildBrain(v, {
    category: "oferta",
    layout:
      "FOTO AÉREA OU PANORÂMICA ocupando 100% do fundo com um CARTÃO grande e limpo na cor secundária enviada no centro seguro; dentro do cartão há cabeçalho PACOTE + DESTINO, linha de ícones dos inclusos, preço maciço e selo serrilhado PIX na cor primária enviada anexado abaixo com margem sem sobreposição",
    lighting: "natural brilhante, comercial, cores turquesa/azul com contraste alto no cartão amarelo",
    sceneDescription: `vista ampla e clara de ${v.destinationDescription}`,
    headline,
    specialization:
      "• Inspirado em cartões premium de pacote, mas usando APENAS os dados e cores do formulário.\n• O cartão na cor secundária enviada não pode encostar nas safe zones; deve parecer uma peça única e limpa.\n• Selo tipo bilhete PIX na cor primária enviada fica abaixo do preço com separação visível, nunca sobre texto.\n• A fotografia de fundo serve de contexto; preço e oferta dominam a conversão.",
  });
}

// 🔥 OP6 — FAIXA LATERAL + HERO DE PERFORMANCE
export function promptSideHeroPerformance(v: MasterPromptVars): string {
  const headline = pickOfertaHeadline(v.destination, v.creativeSeed || "op6", v.forbiddenHeadlines);
  return buildBrain(v, {
    category: "oferta",
    layout:
      "PAINEL LATERAL esquerdo vibrante ocupando 28-32% da largura com destino, selos e preço; lado direito com uma fotografia hero única ocupando 68-72%, com CTA em botão isolado no centro seguro",
    lighting: "dramática de fim de tarde ou manhã, alto contraste comercial, cores saturadas",
    sceneDescription: `${v.destinationDescription} em enquadramento hero cinematográfico, sem duplicar cenas`,
    headline,
    specialization:
      "• Referência estrutural: faixa lateral + fotografia grande, usando a cor primária enviada no painel e a secundária nos destaques, sem copiar conteúdo fixo.\n• Leitura em 3 segundos: destino → preço → CTA.\n• Painel lateral deve ter respiro interno alto, sem texto vertical colidindo.\n• Nunca usar grid; apenas uma foto hero e um painel de conversão.",
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
      "FULL-BLEED CINEMATOGRÁFICO — a fotografia ocupa cerca de 90% da composição, sem divisões duras nem blocos sólidos. Texto leve sobreposto no centro vertical, com gradiente sutil para legibilidade. Sem cartões, sem caixas, sem rodapé colorido.",
    lighting: "natural perfeita, hora dourada cinematográfica, profundidade de campo realista, cores vibrantes e atmosféricas",
    sceneDescription: `${v.destination} com riqueza de detalhes — céu dramático, luz dourada, pessoas naturais em momentos espontâneos (caminhando, sorrindo, contemplando), água cristalina ou paisagem icônica. ${v.destinationDescription}`,
    headline,
    experienceDescription: `Uma experiência inesquecível espera por você em ${v.destination}.`,
    specialization:
      "• Título elegante e LEVE no centro: '" + headline + "' — use EXATAMENTE essa frase, NÃO substitua por 'Descubra/Explore/Viva' fixos.\n• Subtítulo sutil abaixo: 'Uma experiência inesquecível espera por você'.\n• Pequenos ícones discretos na base do centro (SEM caixa, SEM pílula): • Hospedagem  • Passeios  • Guia local.\n• PROIBIDO caixa de preço, cartão promocional, cores agressivas.\n• Estilo: editorial, aspiracional, limpo, capa de revista de viagem.",
  });
}

// 🌍 ED2 — SPLIT SUAVE (IMAGEM + TEXTO LEVE)
export function promptSplitYellowSide(v: MasterPromptVars): string {
  const headline = pickExperienciaHeadline(v.destination, v.creativeSeed || "ed2", v.forbiddenHeadlines);
  return buildBrain(v, {
    category: "experiencia",
    layout:
      "DIVISÃO SUAVE — 70% SUPERIOR com fotografia hiper-realista do destino; 30% INFERIOR com área clean usando leve gradiente translúcido (NUNCA bloco sólido pesado, NUNCA cor saturada). Transição suave entre as duas áreas.",
    lighting: "natural suave, luz realista, atmosfera convidativa",
    sceneDescription: `${v.destination} com foco em experiência — mar, arquitetura ou natureza com luz natural suave, pessoas interagindo com o ambiente de forma natural. ${v.destinationDescription}`,
    headline,
    experienceDescription: `Dias únicos com paisagens incríveis e momentos inesquecíveis em ${v.destination}.`,
    specialization:
      "• Texto na área inferior:\n   Título: '" + headline + "' — use EXATAMENTE essa frase, NÃO substitua por verbos fixos.\n   Descrição: 'Paisagens incríveis e momentos inesquecíveis'.\n• Lista LEVE (sem caixas, sem pílulas): • Cultura local  • Gastronomia  • Passeios exclusivos.\n• Preço pequeno OPCIONAL e discreto, em texto fino: 'A partir de R$ " + v.installmentValue + "'. NUNCA em caixa colorida.\n• Estilo: minimalista, leve, sem aparência de anúncio agressivo.",
  });
}

// 🌍 ED3 — STORY LIFESTYLE (PESSOAS + EXPERIÊNCIA)
export function promptElegantCenterCard(v: MasterPromptVars): string {
  const headline = pickExperienciaHeadline(v.destination, v.creativeSeed || "ed3", v.forbiddenHeadlines);
  return buildBrain(v, {
    category: "experiencia",
    layout:
      "STORY LIFESTYLE — fotografia full-bleed dominante mostrando pessoas reais aproveitando o destino. Texto sobreposto leve, sem caixas pesadas, com gradiente sutil apenas para legibilidade.",
    lighting: "luz natural, clima feliz, sensação de liberdade, atmosfera real e espontânea",
    sceneDescription: `grupo de pessoas reais aproveitando ${v.destination} — rindo, tirando fotos, vivendo o momento. Ambiente vivo, autêntico, sem pose comercial. ${v.destinationDescription}`,
    headline,
    experienceDescription: `Momentos que ficam para sempre em ${v.destination}.`,
    specialization:
      "• Topo do centro: '" + headline + "' — use EXATAMENTE essa frase como título principal.\n• Meio: 'Momentos que ficam para sempre'.\n• Base (pequeno e discreto, SEM caixas): • Passeios inclusos  • Experiência completa  • Roteiro planejado.\n• PROIBIDO preço gigante, cartões, elementos de oferta.\n• Estilo: Instagram orgânico premium, sensação real de viagem.",
  });
}

// 🌍 ED4 — MULTI EXPERIÊNCIA (GRID VISUAL)
export function promptEditorialVisual(v: MasterPromptVars): string {
  const headline = pickExperienciaHeadline(v.destination, v.creativeSeed || "ed4", v.forbiddenHeadlines);
  return buildBrain(v, {
    category: "experiencia",
    layout:
      "GRID EDITORIAL — lado DIREITO com 3 ou 4 imagens empilhadas mostrando experiências DIFERENTES (praia, passeio, gastronomia, ponto turístico); lado ESQUERDO com área limpa contendo texto leve. Espaçamento uniforme estilo revista.",
    lighting: "cada foto com sua própria atmosfera natural — variada e autêntica",
    sceneDescription: `múltiplas experiências distintas em ${v.destination}: praia, passeio cultural, gastronomia local, ponto turístico icônico. Cada imagem deve ser ÚNICA — proibido repetir cenas. ${v.destinationDescription}`,
    headline,
    experienceDescription: `${v.destination} além do óbvio.`,
    specialization:
      "• Lado esquerdo:\n   Título: '" + headline + "' — use EXATAMENTE essa frase.\n   Subtítulo: '" + v.destination + " além do óbvio'.\n   Lista LEVE: • Praias incríveis  • Cultura local  • Aventuras únicas.\n• SEM destaque de preço.\n• Estilo: revista de viagem, sofisticado, visual rico.\n• Cada imagem do grid precisa ser visualmente DIFERENTE — proibido cópia ou repetição.",
  });
}

// 🌍 ED5 — MINIMALISTA PREMIUM (LUXO)
export function promptTopEditorialPhoto(v: MasterPromptVars): string {
  const headline = pickExperienciaHeadline(v.destination, v.creativeSeed || "ed5", v.forbiddenHeadlines);
  return buildBrain(v, {
    category: "experiencia",
    layout:
      "MINIMALISTA PREMIUM — fotografia única, limpa, com composição artística. Pouquíssimo texto, muito espaço negativo, atmosfera de alto luxo. Sem caixas, sem blocos, sem listas pesadas.",
    lighting: "suave, estética premium, paleta refinada, ângulo único e artístico",
    sceneDescription: `${v.destination} em ângulo único e artístico, com luz suave e estética premium. Composição contemplativa. ${v.destinationDescription}`,
    headline,
    experienceDescription: `Uma experiência para poucos.`,
    specialization:
      "• Centro: '" + headline + "' — use EXATAMENTE essa frase como título principal.\n• Abaixo: 'Uma experiência para poucos'.\n• NENHUM preço em destaque.\n• Pequeno detalhe na base: 'Consulte disponibilidade'.\n• MUITO espaço negativo (respiro visual).\n• Estilo: luxo, exclusivo, silencioso, alto padrão.",
  });
}

// 🌍 ED6 — COLUNA EDITORIAL + DUAS CENAS DISTINTAS
export function promptTwoSceneEditorial(v: MasterPromptVars): string {
  const headline = pickExperienciaHeadline(v.destination, v.creativeSeed || "ed6", v.forbiddenHeadlines);
  return buildBrain(v, {
    category: "experiencia",
    layout:
      "COLUNA ESQUERDA editorial em fundo bege/off-white com título e checklist leve; COLUNA DIREITA com duas fotografias distintas do destino, uma paisagem ampla e um detalhe cultural/local, com espaçamento uniforme",
    lighting: "editorial sofisticada, textura real, luz natural coerente entre as cenas",
    sceneDescription: `duas perspectivas diferentes de ${v.destinationDescription}: uma paisagem ampla e um detalhe sensorial local`,
    headline,
    experienceDescription: `${v.destination} por ângulos diferentes: paisagem, cultura, descanso e momentos memoráveis em ${v.duration}.`,
    specialization:
      "• Coluna esquerda: '" + headline + "' como título principal — use EXATAMENTE essa frase, NÃO substitua por 'Viva/Explore/Descubra' fixos.\n• As duas fotos devem ser DIFERENTES, nunca cópias da mesma imagem.\n• Composição estilo página editorial premium, NÃO panfleto de preço.\n• Checklist curto e espaçado, sem pílulas agressivas.\n• Sem urgência, sem 'APENAS HOJE', sem preço gigante. Preço opcional como nota fina.",
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
