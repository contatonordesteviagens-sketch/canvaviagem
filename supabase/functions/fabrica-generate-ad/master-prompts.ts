// ============================================================
// PROMPTS MESTRES (templates de alta conversão)
// Cada função recebe os dados do anúncio e devolve um prompt
// completo, no estilo "esqueleto perfeito" definido pelo usuário.
// ============================================================

export interface MasterPromptVars {
  destination: string;        // Ex: "RIO DE JANEIRO"
  destinationDescription: string; // descrição visual da cena
  installments: string;       // Ex: "10"
  installmentValue: string;   // Ex: "149"
  totalValue: string;         // Ex: "1490"
  packageType: string;        // Ex: "Voo + Hotel"
  duration: string;           // Ex: "5 NOITES"
  promoName: string;          // Ex: "OFERTA IMPERDÍVEL"
  city: string;               // cidade de origem
  primaryHex: string;         // cor primária (hex)
  secondaryHex: string;       // cor secundária (hex)
  agencyName: string;
  highlights: string[];       // bullets curtos
}

const COMMON_RULES = (v: MasterPromptVars) => `
══════════════════════════════════════
DIRETRIZES ESTRITAS DE RENDERIZAÇÃO (UI/UX + TIPOGRAFIA):
Formato Vertical 9:16, resolução 8K, qualidade fotográfica máxima.

1) SAFE ZONES (Instagram Stories):
- Top 15%: PROIBIDO colocar texto, logo ou elemento de conversão (área do perfil/usuário do Instagram).
- Bottom 20%: PROIBIDO colocar preço, botão ou texto legal (área da caixa "Enviar mensagem" e botões do Instagram).
- Laterais: padding mínimo de 5% — nenhum texto pode tocar as bordas.

2) POSICIONAMENTO E HIERARQUIA:
- Zero sobreposição entre blocos de texto, ícones ou linhas. Negative space matemático e claro entre todos os elementos.
- Centro de Conversão (Middle 65%): preço gigante, destino, chamada principal e botões DEVEM estar contidos nesta área central segura.
- Alinhamento perfeito: layouts centralizados precisam de eixo Y matematicamente simétrico; layouts em colunas com margens internas simétricas.

3) TIPOGRAFIA (TEXT ENGINE):
- Estética premium, minimalista, limpa, tipo Apple/interfaces de alta tecnologia. Sans-serif moderna.
- Contraste absoluto: texto branco SEMPRE sobre fundos escuros/vibrantes; texto escuro SEMPRE sobre fundos claros. Texto sobre foto recebe drop shadow escuro suave para 100% de legibilidade.
- Hierarquia de tamanhos:
  • Preço primário: maior elemento da tela, fonte Ultra-Bold/Heavy.
  • Destino: segundo maior, fonte Bold.
  • Apoio (Por pessoa, Sem Juros): pequeno, peso Regular/Medium.
  • Rodapé legal: micro, posicionado IMEDIATAMENTE acima da margem inferior proibida (20%).

4) QUALIDADE DE RENDERIZAÇÃO E ANTI-DISTORÇÃO:
- Texto perfeito em português: sem caracteres alienígenas, sem fusão de letras, sem erros de ortografia.
- Realismo absoluto: proibido gerar distorções anatômicas (cabeças desproporcionais, membros extras), duplicação ilógica de objetos (dois relógios no mesmo pulso), proporções não naturais.
- Profissionalismo fotográfico em qualquer elemento humano ou objeto.

🚫 REGRAS ABSOLUTAS:
- Nenhuma marca d'água, nenhum logotipo de empresa visível.
- Textos exatamente como escritos, sem traduzir, sem inventar.
- Cores respeitadas com fidelidade.
- Imagem pronta para postar (sem réguas, guias, anotações técnicas, sem bordas de safe zone visíveis).
══════════════════════════════════════
`;

// ============================================================
// 1. BANNER VERTICAL CLÁSSICO (prompt mestre principal)
// ============================================================
export function promptClassicVertical(v: MasterPromptVars): string {
  return `Um banner de anúncio de turismo vertical de alta conversão (formato 9:16). A composição é dividida em duas seções principais: os 60% superiores mostram uma fotografia fotorealista, brilhante e de alta qualidade de ${v.destinationDescription}. Os 40% inferiores consistem em um fundo sólido e limpo na cor azul-marinho escuro.

No topo da imagem, flutuando sobre a foto, há uma faixa na cor ${v.primaryHex} vibrante com cantos arredondados contendo apenas o texto branco, em negrito e caixa alta: '${v.promoName}', com o resto da faixa perfeitamente limpo e sem logotipos.

No centro da imagem, sobrepondo exatamente a linha divisória entre a fotografia fotorealista e o fundo sólido inferior, há uma grande caixa principal de oferta azul-escura com cantos perfeitamente arredondados. Dentro desta caixa principal:

Na parte superior: À esquerda, um ícone limpo de linha branca de uma mala de viagem, seguido pelo texto branco em fonte sans-serif 'Pacote'. À direita, alinhado, o texto grande, em negrito e em cor ${v.secondaryHex}: '${v.destination}'.

Na parte inferior da caixa principal: Um grande painel interno retangular na cor ${v.primaryHex} vibrante com cantos arredondados, dividido em duas colunas.

Coluna da esquerda: Texto minúsculo branco 'Por pessoa, a partir de'. Logo abaixo, um pequeno formato de pílula amarelo-ouro contendo o texto escuro 'SEM JUROS'. Abaixo disso, o texto branco '${v.installments}x R$' ao lado de um número '${v.installmentValue}' gigantesco, branco e em negrito. Abaixo do número gigante, texto minúsculo branco 'Preço total: R$ ${v.totalValue}'.

Coluna da direita: Três botões/pílulas ovais empilhados verticalmente em azul-escuro. O botão superior contém o texto branco '${v.packageType}'. O botão do meio contém quatro ícones de estrelas brancas sólidas. O botão inferior contém o texto branco '${v.duration}'.

Abaixo de toda a caixa de oferta central, posicionado no fundo sólido inferior, há um texto legal em fonte muito pequena, limpa e branca, centralizado em duas linhas: 'Saindo de ${v.city}. Taxas não inclusas. Consulte disponibilidade.'

O design geral é extremamente limpo, com paleta de cores vibrantes que contrastam fortemente com os textos em branco. Nenhuma marca d'água ou logotipo de empresa.
${COMMON_RULES(v)}`;
}

// ============================================================
// 2. CANCÚN-STYLE (azuis e roxos)
// ============================================================
export function promptCancunStyle(v: MasterPromptVars): string {
  return `Um banner de anúncio de turismo vertical de alta conversão (formato 9:16). A composição é dividida em duas seções principais: os 60% superiores mostram uma fotografia fotorealista, brilhante e de alta qualidade de ${v.destinationDescription}. Os 40% inferiores consistem em um fundo sólido e limpo na cor azul-marinho escuro.

No topo da imagem, flutuando sobre a foto do céu, há uma faixa roxa vibrante com cantos arredondados contendo apenas o texto branco, em negrito e caixa alta: '${v.promoName}'.

No centro da imagem, sobrepondo a linha divisória entre a foto e o fundo sólido azul-marinho, há uma grande caixa principal de oferta azul-escura com cantos arredondados. Dentro:

Topo da caixa: À esquerda, um ícone limpo de linha branca de uma mala de viagem, seguido pelo texto branco sans-serif 'Pacote'. À direita, em negrito na cor azul-ciano claro: '${v.destination}'.

Inferior da caixa: Painel interno retangular roxo vibrante com cantos arredondados, dividido em duas colunas.

Esquerda: Texto minúsculo branco 'Por pessoa, a partir de'. Pílula azul-ciano claro com texto azul-escuro 'SEM JUROS'. Texto branco '${v.installments}x R$' ao lado de '${v.installmentValue}' gigantesco branco bold. Texto minúsculo 'Preço total: R$ ${v.totalValue}'.

Direita: Três pílulas ovais azul-escuras empilhadas. Topo: '${v.packageType}'. Meio: três estrelas brancas sólidas. Base: '${v.duration}'.

Abaixo da caixa, no fundo azul-marinho, texto legal pequeno branco em duas linhas: 'Saindo de ${v.city}. Taxas e impostos não inclusos. Consulte condições.'

Paleta focada em azuis e roxos vibrantes contra textos brancos. Sem marcas d'água ou logotipos.
${COMMON_RULES(v)}`;
}

// ============================================================
// 3. GRAMADO-STYLE (cartão amarelo + selo PIX)
// ============================================================
export function promptGramadoStyle(v: MasterPromptVars): string {
  return `Uma imagem fotorealista de alta resolução e vertical (9:16) de um anúncio de viagem para ${v.destination}. O fundo é uma foto vibrante e brilhante de ${v.destinationDescription}, em um dia ensolarado sob um céu azul claro com nuvens fofas.

No topo da imagem, sobrepondo o céu, há uma grande caixa promocional amarela brilhante e sólida com cantos arredondados, centralizada.

Dentro do cartão promocional amarelo:
- No topo, texto preto sans-serif em caixa alta: "PACOTE" (grande) e texto menor preto abaixo: "${v.destination}".
- Abaixo: Texto preto sans-serif: "${v.duration} |", seguido por quatro ícones pretos nítidos dispostos horizontalmente: avião, ônibus turístico, prédio de hotel e xícara de café.
- Centralizado dentro de um cartão de preço menor, dourado/bege e arredondado: à esquerda, retângulo azul escuro arredondado com texto branco "${v.installments}X" (grande) e "sem juros" (pequeno) abaixo. À direita, preço maciço em preto sans-serif: "R$ ${v.installmentValue}", com o número extremamente grande e bold.
- Abaixo do preço: Texto preto sans-serif pequeno: "Total por pessoa: R$ ${v.totalValue}".

Sobrepondo a borda inferior do cartão amarelo: faixa de selo azul serrilhada (tipo bilhete). Dentro do selo: texto branco sans-serif: "5% OFF À VISTA NO", seguido por ícone de Pix branco quadrado e texto branco: "pix".

No canto superior esquerdo, sobre o céu azul, texto branco vertical limpo sans-serif em quatro linhas: "Saída de ${v.city}. ${v.packageType}. Oferta sujeita à disponibilidade. Consulte condições."

O canto inferior direito está limpo e vazio, sem nenhum logotipo. Iluminação natural e brilhante, detalhes nítidos.
${COMMON_RULES(v)}`;
}

// ============================================================
// 4. MACEIÓ-STYLE (vista aérea + cartão amarelo)
// ============================================================
export function promptMaceioStyle(v: MasterPromptVars): string {
  return `Uma imagem promocional de viagem fotorealista de alta resolução de ${v.destination}, em formato vertical 9:16, projetada para redes sociais. A metade superior apresenta um grande cartão promocional amarelo centralizado e arredondado sobreposto a uma foto aérea nítida de ${v.destinationDescription}.

Dentro do cartão promocional amarelo:
- No topo, texto preto bold sans-serif: "PACOTE" (grande) e texto menor preto abaixo: "${v.destination}".
- Abaixo: texto preto sans-serif: "${v.duration} |", seguido por quatro ícones pretos nítidos: avião decolando, ônibus turístico, prédio de hotel e câmera fotográfica.
- Cartão de preço dourado/bege arredondado: à esquerda, texto preto em três linhas: "a partir de", "${v.installments}X", "sem juros". À direita, preço maciço preto: "R$ ${v.installmentValue}", com o número extremamente grande e bold.
- Abaixo: texto preto sans-serif: "Total por pessoa: R$ ${v.totalValue}".

Sobrepondo a borda inferior do cartão amarelo: faixa de selo azul serrilhada. Dentro: texto branco "5% OFF À VISTA NO", ícone de Pix branco e texto "pix".

No canto inferior esquerdo, sobre a foto aérea, texto branco limpo em quatro linhas: "Saindo de ${v.city}. ${v.packageType}. Oferta sujeita a disponibilidade. Valor por pessoa em apt duplo. Consulte condições."

Canto inferior direito limpo e vazio. Iluminação natural brilhante.
${COMMON_RULES(v)}`;
}

// ============================================================
// 5. SPLIT VERTICAL CRUZEIRO/AMARELO LATERAL
// ============================================================
export function promptSplitYellowSide(v: MasterPromptVars): string {
  return `Imagem vertical formato story (9:16) de anúncio de viagem, dividida assimetricamente. O lado esquerdo é um painel vertical amarelo sólido que ocupa cerca de 30% da largura. O lado direito é uma foto fotorealista de alta qualidade de ${v.destinationDescription}.

Painel Esquerdo (Amarelo): Contém um círculo azul genérico sem texto no topo. Ao longo da borda vertical, em caixa alta preto sans-serif limpo: "${v.destination}". Na base, ícone de linha azul estilizado coerente com o destino.

Painel Direito (Foto + Texto): No topo da seção da foto, um banner retangular azul escuro arredondado com texto branco limpo: "Sua próxima viagem começa aqui". Abaixo, em título grande bold branco: "${v.destination}".

Mais abaixo, badge de oferta composta: caixa azul escura arredondada com borda dourada. Dentro, texto branco "EM ATÉ" (pequeno) seguido por "${v.installments}x*" (muito grande, bold, branco). Abaixo da caixa, botão retangular bege/dourado com texto branco: "APROVEITE AGORA".

Texto pequeno branco em itálico na borda direita: "*Consulte condições. ${v.duration}. Saindo de ${v.city}".

Iluminação nítida e cinematográfica. Composição limpa. Sem logotipos.
${COMMON_RULES(v)}`;
}

// ============================================================
// 6. EUROPEU/PONTO TURÍSTICO ICÔNICO
// ============================================================
export function promptIconicLandmark(v: MasterPromptVars): string {
  return `Banner vertical de mídia social de alta conversão para agência de viagens (formato 9:16). Dividido em dois painéis verticais. Painel esquerdo: faixa amarela vibrante sólida ocupando 30% da largura. Painel direito: foto fotorealista de alta qualidade ocupando 70%, mostrando ${v.destinationDescription}.

Painel Esquerdo (Faixa Amarela): No topo, círculo azul escuro sólido sem texto (placeholder de logo). Abaixo, alinhado verticalmente em preto sans-serif limpo: "${v.destination}". Logo abaixo, ícone de localização em preto.

Painel Direito (Foto):
- No topo, caixa azul escura arredondada com texto branco limpo: "Sua próxima viagem começa aqui".
- Centralizado, texto grande bold branco: "${v.destination}".
- Abaixo do título, caixa de oferta sobreposta. Parte superior azul escura com texto branco "EM ATÉ ${v.installments}x*", "${v.installments}x" em fonte grande e bold. Parte inferior preta mais estreita com texto branco menor: "5% OFF À VISTA NO PIX".
- Abaixo da caixa, pequeno botão branco: "APROVEITE AGORA".
- Borda direita: asterisco e texto vertical em itálico branco: "*Consulte condições. ${v.duration}".

Tipografia moderna sans-serif. Iluminação cinematográfica. Sem logotipos de terceiros.
${COMMON_RULES(v)}`;
}

// ============================================================
// 7. BLACK FRIDAY / COMBO MULTI-DESTINO
// ============================================================
export function promptBlackFridayCombo(v: MasterPromptVars): string {
  const items = (v.highlights.length ? v.highlights : ["Hotel", "Aéreo", "Transfer", "Café da manhã"]).slice(0, 4);
  return `Banner promocional vertical de turismo (9:16) dividido em dois painéis verticais. Painel esquerdo com fundo preto profundo fosco. No topo, texto bold branco caixa alta '${v.promoName}' centralizado. Abaixo, em fonte dourada bold, os textos 'Pacote' e '${v.destination}' empilhados.

Abaixo, lista de verificação vertical com quatro campos arredondados brancos. Cada campo contém um ícone de check verde circular e texto preto ao lado:
${items.map((it) => `'✓ ${it}'`).join(", ")}.

Na parte inferior do painel esquerdo, caixa de preço arredondada amarela dourada com texto preto: 'APENAS HOJE:' acima de um preço grande bold preto 'R$ ${v.installmentValue}' com símbolo de moeda menor.

O painel direito tem fundo amarelo claro e contém quatro fotografias arredondadas de alta qualidade de ${v.destinationDescription} empilhadas verticalmente, em ângulos e momentos variados (vista aérea, marco icônico, atividade turística, pessoas felizes).

Design limpo, profissional e vibrante. Sem logotipos de terceiros.
${COMMON_RULES(v)}`;
}

// ============================================================
// 8. CARTÃO MINIMALISTA TOPO + FOTO INFERIOR
// ============================================================
export function promptMinimalistTopCard(v: MasterPromptVars): string {
  return `Imagem vertical (9:16) para anúncio de turismo de alta conversão. Design dividido em seção superior de texto e seção inferior de fotografia, layout limpo e profissional.

Seção superior: fundo cor creme claro e limpo, livre de logotipos. Topo com espaço vazio para logo. Abaixo, título principal "${v.destination}" em texto azul escuro profundo, grande, bold sans-serif, centralizado. Abaixo do título, retângulo azul escuro arredondado com texto branco "Saindo de ${v.city}" e pequeno ícone de marcador de localização branco.

À esquerda, abaixo da caixa azul, lista alinhada de três itens com ícones pretos e texto azul escuro: ônibus + "Transporte"; marcador de localização + "Buggy"; pessoa com chapéu + "Guia". Linha vertical preta fina separa a lista do bloco de preços à direita.

Bloco de preços: "De R$ ${(parseInt(v.totalValue) * 1.3).toFixed(0)}" tachado em texto menor azul escuro, seguido por "por R$" e o preço principal "${v.installmentValue}" em texto azul escuro muito grande bold, com ",00" elevado e "/pessoa" abaixo em pequeno azul escuro.

Seção inferior: fotografia vibrante de alta qualidade de ${v.destinationDescription}. Iluminação natural ensolarada com cores vivas e sombras nítidas.

Composição limpa e profissional, otimizada para mobile. Sem logos. Sem marcas d'água.
${COMMON_RULES(v)}`;
}

// ============================================================
// 9. NEUTRO LIMPO COM CARD CENTRAL (fallback elegante)
// ============================================================
export function promptElegantCenterCard(v: MasterPromptVars): string {
  return `Banner vertical (9:16) de turismo premium. Foto fotorealista full-bleed de ${v.destinationDescription} ocupando todo o fundo, com leve gradiente escuro nas bordas para legibilidade.

No centro vertical, card retangular com fundo na cor ${v.primaryHex} fosco e cantos perfeitamente arredondados, ocupando ~70% da largura. Dentro do card:
- No topo, badge pequena na cor ${v.secondaryHex} com texto preto bold caixa alta "${v.promoName}".
- Título grande branco bold sans-serif: "${v.destination}".
- Linha fina branca separadora.
- Texto branco médio: "${v.packageType} · ${v.duration}".
- Bloco de preço destacado: texto branco pequeno "a partir de", número GIGANTE branco bold "${v.installments}x R$ ${v.installmentValue}", texto branco pequeno "Total: R$ ${v.totalValue}".
- Botão retangular largo na cor ${v.secondaryHex} com texto preto bold "RESERVAR AGORA".

Topo da imagem: faixa branca semi-transparente fina com texto preto pequeno "Saindo de ${v.city}".

Tipografia Outfit/Inter bold sans-serif. Composição balanceada. Sem logotipos.
${COMMON_RULES(v)}`;
}

// ============================================================
// REGISTRO DE TEMPLATES
// ============================================================
export const MASTER_TEMPLATES = [
  { id: "classic_vertical",   name: "Clássico Vertical",        builder: promptClassicVertical },
  { id: "cancun_style",       name: "Cancún (azul/roxo)",       builder: promptCancunStyle },
  { id: "gramado_style",      name: "Gramado (cartão amarelo)", builder: promptGramadoStyle },
  { id: "maceio_style",       name: "Maceió (vista aérea)",     builder: promptMaceioStyle },
  { id: "split_yellow_side",  name: "Split lateral amarelo",    builder: promptSplitYellowSide },
  { id: "iconic_landmark",    name: "Ponto turístico icônico",  builder: promptIconicLandmark },
  { id: "black_friday_combo", name: "Black Friday combo",       builder: promptBlackFridayCombo },
  { id: "minimalist_top",     name: "Minimalista topo",         builder: promptMinimalistTopCard },
  { id: "elegant_center",     name: "Card central elegante",    builder: promptElegantCenterCard },
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
