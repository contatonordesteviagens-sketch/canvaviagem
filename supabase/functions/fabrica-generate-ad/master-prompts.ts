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
- FOCO TOTAL EM DESEJO, EMOÇÃO E EXPERIÊNCIA. NÃO é um anúncio de venda.
- A FOTOGRAFIA é a protagonista absoluta e deve ocupar no MÍNIMO 70% da composição (em alguns layouts até 90%).
- Estética editorial premium, aspiracional, estilo capa de revista de viagem (Condé Nast Traveller, Kinfolk, Cereal).
- Linguagem emocional obrigatória: "Descubra", "Explore", "Viva", "Conheça". JAMAIS usar copy de venda agressiva.

🚫 PROIBIÇÕES ABSOLUTAS NESTA CATEGORIA:
- PROIBIDO caixa grande de oferta, cartão promocional, bloco pesado de preço.
- PROIBIDO preço gigante, parcelamento em destaque, selos "% OFF", "SEM JUROS", "PIX".
- PROIBIDO palavras de urgência: "OFERTA EXCLUSIVA", "APENAS HOJE", "ÚLTIMAS VAGAS", "COMPRE AGORA", "GARANTIR VAGA".
- PROIBIDO cores agressivas saturadas tipo amarelo neon + roxo elétrico em blocos sólidos grandes.
- PROIBIDO layout de venda direta / performance / Meta Ads.
- O PREÇO é OPCIONAL: se aparecer, deve ser MINÚSCULO, em texto fino, como informação discreta tipo "A partir de R$ X" — NUNCA em caixa colorida e NUNCA dominante.

✅ HIERARQUIA OBRIGATÓRIA:
1. Imagem (protagonista absoluta)
2. Título emocional curto
3. Subtítulo/detalhes leves
4. Lista de experiências (sem caixas, sem pílulas pesadas — texto leve com ícones discretos)
5. Preço (opcional, discreto, minúsculo)

✅ ESTILO VISUAL:
- Muito espaço negativo / respiro visual.
- Tipografia leve e elegante (serifada ou sans-serif refinada).
- Sem ornamentos comerciais, sem selos, sem botões CTA agressivos.
- Resultado deve parecer página de revista, não panfleto.
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
    : `[BLOCO DE EXPERIÊNCIA — EDITORIAL, SEM CARA DE OFERTA]
${opts.experienceDescription || `Roteiro de ${v.duration} explorando ${v.destination} com curadoria local e conforto.`}
Tipo de viagem: ${v.packageType} · ${v.duration}
PREÇO É OPCIONAL E DISCRETO: se inserir, use APENAS um pequeno texto fino "A partir de R$ ${v.installmentValue}" em tipografia leve, posicionado como nota lateral dentro da área segura central. NÃO usar caixa colorida, NÃO usar parcelamento em destaque, NÃO usar selos. Em layouts mais minimalistas (ED1, ED3, ED5) o preço pode ser totalmente OMITIDO em favor de "Consulte disponibilidade".`;

  const categoryRules = opts.category === "oferta" ? OFERTA_RULES : EXPERIENCIA_RULES;
  const creativeSeed = v.creativeSeed || `${opts.category}-${opts.layout.slice(0, 24)}`;
  const variationDirectives = opts.category === "oferta"
    ? [
        "ângulo fotográfico comercial amplo + bloco de preço em posição dominante diferente da geração anterior",
        "foto com profundidade lateral + cartão de oferta deslocado, nunca central igual ao anterior",
        "enquadramento aéreo/drone + estrutura de venda direta com ritmo tipográfico novo",
        "hero de destino com painel de conversão separado e composição assimétrica inédita",
      ]
    : [
        "fotografia full-bleed contemplativa, sem cartão; texto leve no centro seguro",
        "momento lifestyle com pessoas naturais e narrativa emocional; sem preço protagonista",
        "composição editorial minimalista com muito respiro e oferta omitida ou minúscula",
        "página de revista de viagem com fotografia protagonista e detalhes discretos",
      ];
  const variationIndex = Math.abs([...creativeSeed].reduce((acc, char) => acc + char.charCodeAt(0), 0)) % variationDirectives.length;
  const promoLine = opts.category === "oferta"
    ? `Selo promocional: "${v.promoName}"`
    : `Chamada editorial secundária: "${opts.experienceDescription || `Viva ${v.destination} com calma, beleza e curadoria.`}" — sem selo promocional, sem urgência e sem linguagem de oferta.`;
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
Mesmo que destino, preço e benefícios sejam parecidos com uma geração anterior, crie uma interpretação visual nova: novo enquadramento fotográfico, nova posição dos blocos, nova proporção visual, novo ritmo tipográfico e nova distribuição de respiro. Não repita a composição anterior e não reaproveite o mesmo prompt visual da outra categoria.

[REFERÊNCIAS DE ESTILO]
Use a biblioteca de referências de anúncios enviada pelo usuário APENAS como inspiração estrutural: divisão 60/40 foto + base sólida, cartão amarelo de pacote, faixa lateral vibrante, selo tipo bilhete Pix, layout editorial topo/base e grid editorial de experiências. NÃO copie destinos, preços, datas, hotéis, textos legais ou informações fixas dessas referências. Os únicos dados permitidos são os dados preenchidos no formulário abaixo.

[FOTOGRAFIA PRINCIPAL]
Uma cena extremamente realista e detalhada de ${v.destination}, com iluminação ${opts.lighting}, mostrando ${opts.sceneDescription}.

[ELEMENTOS DE INTERFACE]
Interface moderna, limpa e minimalista, com tipografia perfeita e alinhamento matemático.
Paleta principal: cor primária ${v.primaryHex}, cor secundária ${v.secondaryHex}.

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
${centerRule}

3. TIPOGRAFIA:
${typographyHierarchy}
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
- 🚫 PROIBIDO ESPAÇOS VAZIOS GRANDES DENTRO DO CARTÃO/BLOCO DE OFERTA: o cartão amarelo/colorido deve ser PREENCHIDO de forma equilibrada, com altura ajustada ao conteúdo. NÃO deixe áreas grandes em branco entre o título, o preço, a lista e o rodapé. Distribua os elementos com espaçamento RÍTMICO e CONSISTENTE; o cartão deve "respirar", não "ecoar vazio".
- O cartão de oferta deve ter altura PROPORCIONAL ao conteúdo (compacto e cheio), nunca alongado artificialmente com gaps de 30%+ entre blocos. Se sobrar muito espaço interno, ENCOLHA o cartão — não infle o vazio.
- Espaçamento entre blocos internos do cartão: máximo equivalente a 1 linha de texto. Mais que isso é ERRO de composição.
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
// 🔵 EXPERIÊNCIA DE DESTINO — ED1..ED6 (editorial, sem cara de oferta)
// ============================================================

// 🌍 ED1 — HERO CINEMATOGRÁFICO (FULL IMAGE)
export function promptIconicLandmark(v: MasterPromptVars): string {
  return buildBrain(v, {
    category: "experiencia",
    layout:
      "FULL-BLEED CINEMATOGRÁFICO — a fotografia ocupa cerca de 90% da composição, sem divisões duras nem blocos sólidos. Texto leve sobreposto no centro vertical, com gradiente sutil para legibilidade. Sem cartões, sem caixas, sem rodapé colorido.",
    lighting: "natural perfeita, hora dourada cinematográfica, profundidade de campo realista, cores vibrantes e atmosféricas",
    sceneDescription: `${v.destination} com riqueza de detalhes — céu dramático, luz dourada, pessoas naturais em momentos espontâneos (caminhando, sorrindo, contemplando), água cristalina ou paisagem icônica. ${v.destinationDescription}`,
    headline: `Descubra ${v.destination}`,
    experienceDescription: `Uma experiência inesquecível espera por você em ${v.destination}.`,
    specialization:
      "• Título elegante e LEVE no centro: 'Descubra " + v.destination + "'.\n• Subtítulo sutil abaixo: 'Uma experiência inesquecível espera por você'.\n• Pequenos ícones discretos na base do centro (SEM caixa, SEM pílula): • Hospedagem  • Passeios  • Guia local.\n• PROIBIDO caixa de preço, cartão promocional, cores agressivas.\n• Estilo: editorial, aspiracional, limpo, capa de revista de viagem.",
  });
}

// 🌍 ED2 — SPLIT SUAVE (IMAGEM + TEXTO LEVE)
export function promptSplitYellowSide(v: MasterPromptVars): string {
  return buildBrain(v, {
    category: "experiencia",
    layout:
      "DIVISÃO SUAVE — 70% SUPERIOR com fotografia hiper-realista do destino; 30% INFERIOR com área clean usando leve gradiente translúcido (NUNCA bloco sólido pesado, NUNCA cor saturada). Transição suave entre as duas áreas.",
    lighting: "natural suave, luz realista, atmosfera convidativa",
    sceneDescription: `${v.destination} com foco em experiência — mar, arquitetura ou natureza com luz natural suave, pessoas interagindo com o ambiente de forma natural. ${v.destinationDescription}`,
    headline: `Explore ${v.destination}`,
    experienceDescription: `Viva dias únicos com paisagens incríveis e momentos inesquecíveis em ${v.destination}.`,
    specialization:
      "• Texto na área inferior:\n   Título: 'Explore " + v.destination + "'.\n   Descrição: 'Viva dias únicos com paisagens incríveis e momentos inesquecíveis'.\n• Lista LEVE (sem caixas, sem pílulas): • Cultura local  • Gastronomia  • Passeios exclusivos.\n• Preço pequeno OPCIONAL e discreto, em texto fino: 'A partir de R$ " + v.installmentValue + "'. NUNCA em caixa colorida.\n• Estilo: minimalista, leve, sem aparência de anúncio agressivo.",
  });
}

// 🌍 ED3 — STORY LIFESTYLE (PESSOAS + EXPERIÊNCIA)
export function promptElegantCenterCard(v: MasterPromptVars): string {
  return buildBrain(v, {
    category: "experiencia",
    layout:
      "STORY LIFESTYLE — fotografia full-bleed dominante mostrando pessoas reais aproveitando o destino. Texto sobreposto leve, sem caixas pesadas, com gradiente sutil apenas para legibilidade.",
    lighting: "luz natural, clima feliz, sensação de liberdade, atmosfera real e espontânea",
    sceneDescription: `grupo de pessoas reais aproveitando ${v.destination} — rindo, tirando fotos, vivendo o momento. Ambiente vivo, autêntico, sem pose comercial. ${v.destinationDescription}`,
    headline: `Viva o melhor de ${v.destination}`,
    experienceDescription: `Momentos que ficam para sempre em ${v.destination}.`,
    specialization:
      "• Topo do centro: 'Viva o melhor de " + v.destination + "'.\n• Meio: 'Momentos que ficam para sempre'.\n• Base (pequeno e discreto, SEM caixas): • Passeios inclusos  • Experiência completa  • Roteiro planejado.\n• PROIBIDO preço gigante, cartões, elementos de oferta.\n• Estilo: Instagram orgânico premium, sensação real de viagem.",
  });
}

// 🌍 ED4 — MULTI EXPERIÊNCIA (GRID VISUAL)
export function promptEditorialVisual(v: MasterPromptVars): string {
  return buildBrain(v, {
    category: "experiencia",
    layout:
      "GRID EDITORIAL — lado DIREITO com 3 ou 4 imagens empilhadas mostrando experiências DIFERENTES (praia, passeio, gastronomia, ponto turístico); lado ESQUERDO com área limpa contendo texto leve. Espaçamento uniforme estilo revista.",
    lighting: "cada foto com sua própria atmosfera natural — variada e autêntica",
    sceneDescription: `múltiplas experiências distintas em ${v.destination}: praia, passeio cultural, gastronomia local, ponto turístico icônico. Cada imagem deve ser ÚNICA — proibido repetir cenas. ${v.destinationDescription}`,
    headline: `Um destino, várias experiências`,
    experienceDescription: `${v.destination} além do óbvio.`,
    specialization:
      "• Lado esquerdo:\n   Título: 'Um destino, várias experiências'.\n   Subtítulo: '" + v.destination + " além do óbvio'.\n   Lista LEVE: • Praias incríveis  • Cultura local  • Aventuras únicas.\n• SEM destaque de preço.\n• Estilo: revista de viagem, sofisticado, visual rico.\n• Cada imagem do grid precisa ser visualmente DIFERENTE — proibido cópia ou repetição.",
  });
}

// 🌍 ED5 — MINIMALISTA PREMIUM (LUXO)
export function promptTopEditorialPhoto(v: MasterPromptVars): string {
  return buildBrain(v, {
    category: "experiencia",
    layout:
      "MINIMALISTA PREMIUM — fotografia única, limpa, com composição artística. Pouquíssimo texto, muito espaço negativo, atmosfera de alto luxo. Sem caixas, sem blocos, sem listas pesadas.",
    lighting: "suave, estética premium, paleta refinada, ângulo único e artístico",
    sceneDescription: `${v.destination} em ângulo único e artístico, com luz suave e estética premium. Composição contemplativa. ${v.destinationDescription}`,
    headline: `${v.destination}`,
    experienceDescription: `Uma experiência para poucos.`,
    specialization:
      "• Centro: '" + v.destination + "'.\n• Abaixo: 'Uma experiência para poucos'.\n• NENHUM preço em destaque.\n• Pequeno detalhe na base: 'Consulte disponibilidade'.\n• MUITO espaço negativo (respiro visual).\n• Estilo: luxo, exclusivo, silencioso, alto padrão.",
  });
}

// 🌍 ED6 — COLUNA EDITORIAL + DUAS CENAS DISTINTAS
export function promptTwoSceneEditorial(v: MasterPromptVars): string {
  return buildBrain(v, {
    category: "experiencia",
    layout:
      "COLUNA ESQUERDA editorial em fundo bege/off-white com título e checklist leve; COLUNA DIREITA com duas fotografias distintas do destino, uma paisagem ampla e um detalhe cultural/local, com espaçamento uniforme",
    lighting: "editorial sofisticada, textura real, luz natural coerente entre as cenas",
    sceneDescription: `duas perspectivas diferentes de ${v.destinationDescription}: uma paisagem ampla e um detalhe sensorial local`,
    headline: `Viva ${v.destination}`,
    experienceDescription: `Explore ${v.destination} por ângulos diferentes: paisagem, cultura, descanso e momentos memoráveis em ${v.duration}.`,
    specialization:
      "• As duas fotos devem ser DIFERENTES, nunca cópias da mesma imagem.\n• Composição estilo página editorial premium, NÃO panfleto de preço.\n• Checklist curto e espaçado, sem pílulas agressivas.\n• Sem urgência, sem 'APENAS HOJE', sem preço gigante. Preço opcional como nota fina.",
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
