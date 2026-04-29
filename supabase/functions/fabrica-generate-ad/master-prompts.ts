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
🔴 REGRAS ESPECÍFICAS DA CATEGORIA — OFERTA DE PACOTE
- FOCO TOTAL EM CONVERSÃO DIRETA.
- Esta categoria deve parecer um anúncio agressivo de performance, NÃO editorial.
- O PREÇO deve ser o MAIOR elemento visual da composição,
  ocupando NO MÍNIMO 25% da área do bloco central.
- A imagem/fotografia é apenas suporte visual; ela NÃO pode ser protagonista.
- Use EXCLUSIVAMENTE a paleta enviada pelo formulário: a cor primária deve dominar fundos/blocos e a cor secundária deve aparecer em preço, badges e detalhes.
- É PROIBIDO inventar verde, preto, azul, laranja, dourado ou qualquer outra cor dominante se ela não for uma das cores selecionadas pelo usuário.
- Elementos de URGÊNCIA SEMPRE presentes (escolha 1 ou 2):
  "OFERTA EXCLUSIVA" · "APENAS HOJE" · "ÚLTIMAS VAGAS".
- Selos / botões devem reforçar pelo menos 2 destes:
  "SEM JUROS" · "PIX" · "VOO + HOTEL".
- Tom de copy: direto, comercial, cria gatilho de decisão imediata.

══════════════════════════════════════
🚨 REGRA MAIS IMPORTANTE DO SISTEMA — NÃO REPETIÇÃO (CRÍTICA ABSOLUTA)
══════════════════════════════════════
É TERMINANTEMENTE PROIBIDO gerar imagens iguais, similares ou com a mesma
estrutura visual da geração anterior. Cada nova imagem DEVE ser
VISUALMENTE DIFERENTE da anterior. Se a anterior teve cartão central →
agora NÃO usar cartão central. Se teve fundo azul → usar outra cor
dominante. Se teve layout dividido → usar outro tipo de layout. Se o
preço estava na posição X → mudar completamente de posição.

A IA deve FORÇAR variação estrutural — não apenas trocar texto.

[OBRIGAÇÃO DE VARIAÇÃO REAL]
A cada nova geração, ALTERAR pelo menos 4 destes elementos:
  1. Tipo de layout (estrutura visual)
  2. Posição do preço
  3. Estilo do container (cartão, faixa, selo, lateral, etc)
  4. Cores principais
  5. Hierarquia dos elementos
  6. Tipo de imagem (aérea, close, lifestyle, panorâmica)
  7. Estilo de iluminação
Se esses elementos não mudarem, a geração está ERRADA.

[CONTROLE DE LAYOUT — ESCOLHER 1 POR VEZ]
Escolher APENAS UM layout por geração (proibido repetir o anterior):
  1. Cartão central flutuante
  2. Divisão topo imagem + base oferta
  3. Barra lateral + imagem
  4. Preço sobreposto direto na imagem (sem cartão)
  5. Cartão inclinado/assimétrico
  6. Layout minimalista com preço isolado

[VARIAÇÃO DE POSIÇÃO DO PREÇO]
O preço NUNCA pode ficar sempre no mesmo lugar. Alternar entre:
centro · canto inferior (dentro da safe zone) · lado direito ·
lado esquerdo · dentro de selo · sobreposto livre na imagem.

[VARIAÇÃO DE ESTILO VISUAL]
Alternar estrutura, iluminação e composição, MAS SEM trocar a paleta:
usar sempre a cor primária e a cor secundária selecionadas no formulário.

[ANTI-REPETIÇÃO DE ESTRUTURA — PROIBIDO]
🚫 Usar sempre o mesmo "cartão com preço".
🚫 Repetir mesma composição da geração anterior.
🚫 Repetir posição dos elementos.
🚫 Gerar layouts clonados.
Se parecer semelhante à anterior → ERRADO, refazer.

[CONTROLE FINAL DE QUALIDADE — VALIDAR ANTES DE FINALIZAR]
✔ Essa imagem é diferente da anterior?
✔ O layout mudou?
✔ O preço mudou de posição?
✔ As cores respeitam exatamente a primária e secundária selecionadas?
✔ A estrutura é nova?
Se alguma resposta for "não", REFAZER a imagem.

[REGRAS FIXAS]
- Gerar APENAS UMA imagem.
- Não duplicar elementos.
- Não sobrepor textos.
- Não repetir layout anterior.
- Não gerar arte semelhante.

[RESULTADO ESPERADO]
Cada geração deve parecer um anúncio completamente novo, uma nova
campanha, uma nova abordagem visual. NUNCA uma repetição.
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
- Linguagem emocional. Tom aspiracional, contemplativo, NUNCA agressivo.

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
- Muito espaço negativo DENTRO da imagem (céu, mar, areia, paisagem) — NÃO criar bordas brancas, molduras ou margens externas vazias.
- A FOTOGRAFIA DEVE PREENCHER 100% DA TELA, full-bleed, edge-to-edge. PROIBIDO moldura branca, polaroid, fundo branco visível em volta da foto, layout "imagem flutuando dentro de papel".
- Tipografia leve e elegante (serifada ou sans-serif refinada).
- Sem ornamentos comerciais, sem selos, sem botões CTA agressivos.
- Resultado deve parecer página de revista (foto de capa cobrindo a página inteira), não cartão postal pequeno em cima de fundo branco.

══════════════════════════════════════
🚨 REGRA MAIS IMPORTANTE — VARIAÇÃO DE COPY (CRÍTICA ABSOLUTA)
══════════════════════════════════════
É TERMINANTEMENTE PROIBIDO repetir o mesmo estilo de título em gerações
consecutivas. Isso inclui "Viva [DESTINO]", "Descubra [DESTINO]",
"Explore [DESTINO]". NÃO pode repetir a mesma estrutura de frase.
Cada nova imagem deve usar uma abordagem COMPLETAMENTE DIFERENTE de copy.

[OBRIGAÇÃO DE VARIAÇÃO DE TÍTULOS]
A cada nova geração, MUDAR:
  1. Verbo principal
  2. Estrutura da frase
  3. Estilo de comunicação
  4. Tamanho do texto

[ESTILOS DE TÍTULO — ALTERNAR ENTRE ELES]
🎯 Emocional: "Momentos que ficam para sempre" · "Um lugar para se desconectar" · "Onde tudo faz sentido"
🎯 Experiência: "Dias inesquecíveis começam aqui" · "Sua próxima história começa no destino" · "Mais que uma viagem, uma experiência"
🎯 Curto e impactante: "O melhor de [DESTINO]" · "Seu próximo destino é esse" · "Uma experiência diferente de tudo"
🎯 Inspiracional: "Permita-se viver isso" · "Você merece esse destino" · "O mundo te espera"
🎯 Ação leve: "Partiu viajar?" · "Hora de arrumar as malas" · "Bora viajar?"

[REGRA DE NÃO REPETIÇÃO]
🚫 PROIBIDO usar o mesmo verbo em sequência.
🚫 PROIBIDO repetir padrão "verbo + destino".
🚫 PROIBIDO usar sempre frases curtas iguais.
🚫 PROIBIDO repetir estrutura de copy.
Se a anterior usou "Viva Cancún", a próxima NÃO pode ser "Explore Cancún".
Tem que mudar COMPLETAMENTE o estilo.

[VARIAÇÃO DE ESTRUTURA — ALTERNAR]
frase com destino · frase sem destino · frase emocional ·
frase narrativa · frase curta · frase longa.

[CONTROLE FINAL]
✔ O título é diferente do anterior?
✔ A estrutura mudou?
✔ O estilo de linguagem mudou?
✔ Não parece repetido?
Se parecer repetido → REFAZER.

[RESULTADO ESPERADO]
Cada imagem deve parecer uma campanha diferente, uma ideia nova,
uma abordagem criativa única. NUNCA uma repetição.
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

const HEADLINE_POOL_EXPERIENCIA: ((d: string) => string)[] = [
  () => `Momentos que ficam para sempre`,
  (d) => `O melhor de ${d}`,
  () => `Seu próximo destino é esse`,
  () => `Dias inesquecíveis começam aqui`,
  () => `Uma experiência única`,
  () => `Partiu viajar?`,
  () => `Dias que você não esquece`,
  () => `Um lugar para se desconectar`,
  () => `Onde tudo faz sentido`,
  () => `Mais que uma viagem, uma experiência`,
  () => `Permita-se viver isso`,
  () => `Você merece esse destino`,
  () => `O mundo te espera`,
  () => `Hora de arrumar as malas`,
  () => `Bora viajar?`,
  (d) => `${d} te espera`,
  (d) => `Sua próxima história começa em ${d}`,
  () => `A viagem que muda o ritmo`,
];

const HEADLINE_POOL_OFERTA: ((d: string) => string)[] = [
  (d) => `Pacote especial para ${d}`,
  () => `Férias com tudo resolvido`,
  () => `Preço especial para viajar`,
  () => `Seu próximo destino é esse`,
  (d) => `O melhor de ${d}`,
  () => `Partiu viajar?`,
  () => `Hora de arrumar as malas`,
  (d) => `Sua viagem para ${d}`,
  () => `Tudo incluso, sem complicação`,
  () => `Reserva já garantida`,
];

function normalize(s: string): string {
  return s.toLowerCase().trim();
}

function pickFromPool(
  pool: ((d: string) => string)[],
  destination: string,
  creativeSeed: string,
  forbidden: string[] = [],
): string {
  const banned = new Set(forbidden.map(normalize));
  const seedSum = [...creativeSeed].reduce((acc, c) => acc + c.charCodeAt(0), 0);
  // Tenta até encontrar uma frase fora do bloqueio
  for (let i = 0; i < pool.length; i++) {
    const idx = (seedSum + i) % pool.length;
    const candidate = pool[idx](destination);
    if (!banned.has(normalize(candidate))) return candidate;
  }
  // Todas bloqueadas → libera a mais "antiga" (primeira fora do mais recente)
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
Mesmo que destino, preço e benefícios sejam parecidos com uma geração anterior, crie uma interpretação visual nova: novo enquadramento fotográfico, nova posição dos blocos, nova proporção visual, novo ritmo tipográfico e nova distribuição de respiro. Não repita a composição anterior e não reaproveite o mesmo prompt visual da outra categoria.

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
🛑 LISTA ZERO-TIPO — TEXTOS LITERAIS OBRIGATÓRIOS (COPIAR CARACTERE A CARACTERE)
══════════════════════════════════════
Este é o requisito MAIS CRÍTICO de toda a geração. Erros ortográficos invalidam a imagem e exigem refazer.
Os textos abaixo DEVEM aparecer no banner EXATAMENTE como escritos, sem alterar UMA ÚNICA letra, acento, espaço ou pontuação. NÃO traduzir, NÃO abreviar, NÃO inventar palavras, NÃO improvisar caracteres parecidos. Se o modelo não souber renderizar uma letra com fidelidade, REFAZER até ficar 100% correto.

📋 TEXTOS EXATOS PERMITIDOS NESTE BANNER:
• Destino: «${v.destination}»  (renderizar a palavra COMPLETA — contar as letras antes de desenhar; a primeira e a última letra DEVEM aparecer inteiras com a MESMA altura das demais)
• Título principal: «${opts.headline}»
• Promoção/selo, se usar: «${v.promoName}»
• Cidade de origem: «${v.city}»
• Parcela: «${v.installments}x R$ ${v.installmentValue}»
• Preço total: «Preço total: R$ ${v.totalValue}»
• CTA (se houver): «RESERVAR AGORA»  (NUNCA "RESERVAR AGOR", "RESEVAR", "RESEVAR AGORA")
• Rodapé: «Saindo de ${v.city}. Taxas e impostos não inclusos. Consulte disponibilidade.»
• Lista de benefícios: copiar PALAVRA POR PALAVRA cada item enviado. Se não souber soletrar com 100% de certeza, OMITIR o item — NUNCA inventar caracteres, NUNCA repetir letras aleatórias.

══════════════════════════════════════
🚨 REGRA ANTI-CORTE (CRÍTICA — JÁ CAUSOU PALAVRAS OBSCENAS)
══════════════════════════════════════
TODA palavra renderizada DEVE caber 100% dentro da área visível do banner, com no mínimo 5% de margem interna em CADA lado (esquerda, direita, topo, base).

⛔ É TERMINANTEMENTE PROIBIDO que qualquer letra fique cortada pela borda da imagem, pelo "bleed" do canvas, ou por qualquer elemento sobreposto. Cortar letras NUNCA é aceitável — nem 1 pixel.

⛔ EXEMPLO REAL DE FALHA CATASTRÓFICA (NÃO REPETIR):
   "OFERTA ESPECIAL" foi renderizado tão largo que o "O" inicial e o "L" final foram cortados pela borda, transformando-se em «SURUBA ESPECIA» — palavra OBSCENA em português brasileiro. ISSO É INACEITÁVEL.

⛔ Palavras que JAMAIS podem aparecer no banner por acidente de corte (são todas obscenas/ofensivas em português brasileiro):
   "SURUBA", "PORRA", "MERDA", "BOSTA", "PUTA", "CARALHO", "BUCETA", "CU", "PINTO", "PIROCA", "CACETE", "FODA", "FODE", "FUDEU", "VIADO", "BICHA", "PUTO", "PUTAS", "VAGABA", "VADIA", "PIRANHA".
   Se a palavra renderizada SOAR ou PARECER qualquer uma dessas, REGENERAR a imagem do zero, reduzindo o tamanho da fonte do título até caber inteira com folga.

✅ COMO EVITAR:
1. ANTES de escolher o tamanho da fonte, contar as letras de CADA palavra do título.
2. Calcular a largura disponível (largura da imagem - 10% de padding lateral total).
3. Se a palavra não couber, REDUZIR o tamanho até caber INTEIRA com 5% de margem em cada lado.
4. Quebrar em DUAS LINHAS é preferível a cortar uma letra. Ex: «OFERTA / ESPECIAL» em duas linhas é OK; «SURUBA ESPECIA» em uma linha cortada é PROIBIDO.
5. Após renderizar, verificar visualmente se a primeira letra (A, B, C...) e a última letra estão COMPLETAS e VISÍVEIS. Se não estiverem, REGENERAR.
══════════════════════════════════════

══════════════════════════════════════
🔤 DICIONÁRIO ANTI-ERRO — PALAVRAS QUE O MODELO COSTUMA ERRAR
══════════════════════════════════════
Estas são as palavras em português que modelos de geração de imagem mais erram. Use SEMPRE a grafia da coluna CERTO. NUNCA a coluna ERRADO.

MOEDA E NÚMEROS:
  ❌ "RS 149,90"     ✅ "R$ 149,90"        (símbolo é R + cifrão, sem espaço entre R e $)
  ❌ "R5 149,90"     ✅ "R$ 149,90"        (cifrão "$", não o número "5")
  ❌ "B$ 149,90"     ✅ "R$ 149,90"        (letra "R", não "B")
  ❌ "RS\$ 149,90"   ✅ "R$ 149,90"
  ❌ "R$ 1500"       ✅ "R$ 1.500,00"      (sempre incluir centavos quando exibir total)
  ❌ "1499,00"       ✅ "1.499,00"         (ponto de milhar obrigatório a partir de 1.000)
  ❌ "1.499.00"      ✅ "1.499,00"         (centavos com VÍRGULA, nunca ponto)
  ❌ "1,499,00"      ✅ "1.499,00"         (milhar com PONTO, nunca vírgula)
  ❌ "10X"           ✅ "10x"              (x minúsculo nas parcelas)

ALIMENTAÇÃO E HOSPEDAGEM:
  ❌ "Café da mênha"      ✅ "Café da manhã"
  ❌ "Café da mânha"      ✅ "Café da manhã"
  ❌ "Café da manha"      ✅ "Café da manhã"  (til no "a" final é obrigatório)
  ❌ "Café da mâhna"      ✅ "Café da manhã"
  ❌ "Café da mãnha"      ✅ "Café da manhã"
  ❌ "Cafe da manhã"      ✅ "Café da manhã"  (acento agudo no "e")
  ❌ "Almolço"            ✅ "Almoço"
  ❌ "Hospedajem"         ✅ "Hospedagem"
  ❌ "Hospadagem"         ✅ "Hospedagem"
  ❌ "Hospadaem"          ✅ "Hospedagem"     (já apareceu — proibido)
  ❌ "Hospedaem"          ✅ "Hospedagem"
  ❌ "Hospedagen"         ✅ "Hospedagem"
  ❌ "Hotell"             ✅ "Hotel"
  ❌ "Pousadda"           ✅ "Pousada"
  ❌ "Reffeições"         ✅ "Refeições"
  ❌ "Transffer"          ✅ "Transfer"
  ❌ "Passeos"            ✅ "Passeios"
  ❌ "Pacceios"           ✅ "Passeios"
  ❌ "Guia locall"        ✅ "Guia local"

CIDADES E DESTINOS BRASILEIROS:
  ❌ "Fortalesa"          ✅ "Fortaleza"
  ❌ "Fartalesa"          ✅ "Fortaleza"      (já apareceu — proibido)
  ❌ "Fartaleza"          ✅ "Fortaleza"
  ❌ "Fortaleza"          ✅ "Fortaleza"
  ❌ "Maseió"             ✅ "Maceió"
  ❌ "Jericoacora"        ✅ "Jericoacoara"
  ❌ "Jiricoacoara"       ✅ "Jericoacoara"
  ❌ "ERICOACOARA"        ✅ "JERICOACOARA"  (NUNCA cortar o "J" inicial)
  ❌ "Cancum"             ✅ "Cancún"
  ❌ "Buzzios"            ✅ "Búzios"
  ❌ "Florianopolis"      ✅ "Florianópolis"
  ❌ "Fernando de Noronia" ✅ "Fernando de Noronha"
  ❌ "Porto Segurro"      ✅ "Porto Seguro"
  ❌ "Salvadorr"          ✅ "Salvador"
  ❌ "Recifie"            ✅ "Recife"
  ❌ "Natall"             ✅ "Natal"
  ❌ "Gramaddo"           ✅ "Gramado"
  ❌ "Bonitto"            ✅ "Bonito"
  ❌ "Rio de Janero"      ✅ "Rio de Janeiro"
  ❌ "Rio de Janneiro"    ✅ "Rio de Janeiro"

PALAVRAS COMERCIAIS, EMOCIONAIS E LEGAIS:
  ❌ "dispatbibiiibade"   ✅ "disponibilidade"
  ❌ "dispobibibidade"    ✅ "disponibilidade"
  ❌ "disponiblidade"     ✅ "disponibilidade"
  ❌ "Consultte"          ✅ "Consulte"
  ❌ "Reservaa"           ✅ "Reserva"
  ❌ "Reservar agorra"    ✅ "Reservar agora"
  ❌ "Garantta"           ✅ "Garanta"
  ❌ "Compree"            ✅ "Compre"
  ❌ "Imperdivel"         ✅ "Imperdível"
  ❌ "Promosão"           ✅ "Promoção"
  ❌ "Ofertta"            ✅ "Oferta"
  ❌ "Excluziva"          ✅ "Exclusiva"
  ❌ "Ultimas"            ✅ "Últimas"
  ❌ "Vagass"             ✅ "Vagas"
  ❌ "Pacotte"            ✅ "Pacote"
  ❌ "Voo + Hotell"       ✅ "Voo + Hotel"
  ❌ "Aereo"              ✅ "Aéreo"
  ❌ "PIIX"               ✅ "PIX"
  ❌ "Sem juross"         ✅ "Sem juros"
  ❌ "Saindoo"            ✅ "Saindo"
  ❌ "Taxass"             ✅ "Taxas"
  ❌ "impostoss"          ✅ "impostos"
  ❌ "incluzos"           ✅ "inclusos"
  ❌ "incluidos"          ✅ "inclusos"
  ❌ "Preçço"             ✅ "Preço"
  ❌ "Preco"              ✅ "Preço"  (cedilha obrigatória)
  ❌ "naum"               ✅ "não"
  ❌ "nao"                ✅ "não"
  ❌ "Descrubra"          ✅ "Descubra"
  ❌ "Descobra"           ✅ "Descubra"
  ❌ "experiência"        ✅ "experiência"   (acento agudo no "e", circunflexo no segundo "e")
  ❌ "expériência"        ✅ "experiência"   (NÃO usa acento agudo no primeiro "e")
  ❌ "expériêncio"        ✅ "experiência"   (a palavra termina em "a", é FEMININA — "uma experiência", nunca "um experiência" nem "expériêncio")
  ❌ "expêriencia"        ✅ "experiência"
  ❌ "experienca"         ✅ "experiência"
  ❌ "ineséquevel"        ✅ "inesquecível"  (já apareceu — proibido)
  ❌ "inesquesivel"       ✅ "inesquecível"
  ❌ "inesquecivel"       ✅ "inesquecível"  (acento agudo no "i")
  ❌ "inesqueçivel"       ✅ "inesquecível"  (sem cedilha, é "c" simples)
  ❌ "pocuos"             ✅ "poucos"        (já apareceu — proibido)
  ❌ "pucos"              ✅ "poucos"
  ❌ "Para pocuos"        ✅ "Para poucos"
  ❌ "espera por voce"    ✅ "espera por você"  (acento circunflexo obrigatório)
  ❌ "voce"               ✅ "você"
  ❌ "viajem"             ✅ "viagem"        (com G, não com J)
  ❌ "Tipo de viajem"     ✅ "Tipo de viagem"
  ❌ "Conheca"            ✅ "Conheça"       (cedilha obrigatória)
  ❌ "Explore"            ✅ "Explore"
  ❌ "Vivencie"           ✅ "Vivencie"
  ❌ "Roteiro"            ✅ "Roteiro"

══════════════════════════════════════
🔍 CHECKLIST DE PURGA ORTOGRÁFICA (REVISAR ANTES DE FINALIZAR)
══════════════════════════════════════
Para CADA palavra renderizada na imagem, validar mentalmente:

1. ✓ É uma palavra REAL do português brasileiro (existe no dicionário)?
2. ✓ Tem o NÚMERO EXATO de letras da palavra original (sem letras a mais ou a menos)?
3. ✓ Não tem "letras fantasmas" — repetições aleatórias de "i", "b", "p", "l", "s", "t" no meio?
4. ✓ Não tem letras coladas/fundidas que parecem outra letra?
5. ✓ A PRIMEIRA letra de cada palavra está visível e do MESMO tamanho que as demais? (jamais cortar inicial — "ERICOACOARA" é ERRO; "SURUBA ESPECIA" é ERRO GRAVE)
6. ✓ A ÚLTIMA letra de cada palavra está completa, sem cortes?
7. ✓ Símbolo de moeda é "R$" (R maiúsculo + cifrão "$")? Nunca "RS", "R5", "B$", "BS".
8. ✓ Números acima de 999 têm PONTO de milhar e VÍRGULA nos centavos? ("1.499,00")
9. ✓ Acentos obrigatórios presentes: "Café", "manhã", "Preço", "disponibilidade", "não", "inclusos", "Aéreo", "Últimas", "Búzios", "Maceió", "Cancún", "Florianópolis", "experiência", "inesquecível", "você"?
10. ✓ Cedilha "ç" presente onde necessário: "Preço", "Promoção", "Almoço", "Refeições", "Conheça"?
11. ✓ Til "~" presente em: "manhã", "não", "São", "Promoção"?
12. ✓ Nenhuma palavra em inglês inventada substituindo palavra portuguesa?
13. ✓ Nenhuma palavra cortada acidentalmente formou palavrão ou termo obsceno?
14. ✓ Concordância de gênero/número correta? ("uma experiência", não "um experiência"; "para poucos", não "para pocuos")
15. ✓ Categoria EXPERIÊNCIA: NÃO renderizou cartão amarelo de oferta, NÃO listou "Tipo de viagem: Voo + Hotel", NÃO mostrou parcelamento? (esses elementos são EXCLUSIVOS de OFERTA)

⚠️ Se QUALQUER palavra falhar em QUALQUER um dos 15 itens acima, REGENERAR aquela palavra do zero antes de finalizar a imagem. É preferível OMITIR um texto a renderizá-lo com erro ortográfico.

⚠️ REGRA DE OURO: na dúvida sobre como soletrar, OMITIR a palavra. Texto faltando é menos grave que texto errado, e MUITO menos grave que texto cortado virando obscenidade.
══════════════════════════════════════


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
  const headline = pickOfertaHeadline(v.destination, v.creativeSeed || "op1");
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
  const headline = pickOfertaHeadline(v.destination, v.creativeSeed || "op2");
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
  const headline = pickOfertaHeadline(v.destination, v.creativeSeed || "op3");
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
  const headline = pickOfertaHeadline(v.destination, v.creativeSeed || "op4");
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
  const headline = pickOfertaHeadline(v.destination, v.creativeSeed || "op5");
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
  const headline = pickOfertaHeadline(v.destination, v.creativeSeed || "op6");
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
