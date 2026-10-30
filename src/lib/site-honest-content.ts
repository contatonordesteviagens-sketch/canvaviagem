// Textos padrão do site da Fábrica sem números, prazos ou promessas inventados.
// O mapa troca só o texto de fábrica antigo, palavra por palavra; o que a agência
// escreveu continua igual. Vale para a prévia, para sites novos e (na exibição)
// para sites já publicados.

export type SiteStat = { num: string; label: string };

/** Números de exemplo antigos ("12+", "15k+"…): nunca são publicados. */
export const LEGACY_EXAMPLE_STATS: SiteStat[] = [
  { num: "12+", label: "Anos de Experiência" },
  { num: "15k+", label: "Viajantes Felizes" },
  { num: "25", label: "Países Atendidos" },
  { num: "99%", label: "Satisfação" },
];

/** Faixa de números nova: só rótulos; cada número aparece no site quando a agência preenche. */
export const EMPTY_SITE_STATS: SiteStat[] = [
  { num: "", label: "Anos de mercado" },
  { num: "", label: "Viajantes atendidos" },
  { num: "", label: "Destinos" },
  { num: "", label: "Nota dos clientes" },
];

/** Troca cada número de exemplo que a agência não mexeu por um campo vazio. */
export function resolveSiteStats(raw: SiteStat[] | undefined): SiteStat[] {
  if (!raw || !raw.length) return EMPTY_SITE_STATS.map((s) => ({ ...s }));
  return raw.map((stat, i) => {
    const legacy = LEGACY_EXAMPLE_STATS[i];
    // O rótulo pode já ter passado pelo mapa abaixo ("Anos de Experiência" → "Anos de mercado").
    const untouched = legacy && stat.num === legacy.num
      && (stat.label === legacy.label || stat.label === EMPTY_SITE_STATS[i].label);
    return untouched ? { ...EMPTY_SITE_STATS[i] } : { num: stat.num || "", label: stat.label || "" };
  });
}

export const LEGACY_TEAM_BADGE = "+15k Clientes Satisfeitos";
export const LEGACY_HOURS = ["Seg–Sex 8h–20h · Sáb 9h–15h", "Seg–Sex 8h–20h"];

export const HONEST_DEFAULTS = {
  orcamentoText: "Preencha nome, WhatsApp e destino. A agência responde pelo WhatsApp com uma proposta para você.",
  equipeIntro: "Cada viagem começa com uma conversa. A gente ouve o que você procura e monta a proposta pensando no seu perfil e no seu momento.",
  processoSteps: [
    { num: "1", title: "Consulta Personalizada", desc: "Você conta o destino, as datas, o orçamento e o estilo de viagem, sem compromisso." },
    { num: "2", title: "Proposta sob medida", desc: "Montamos uma proposta com hotéis, passeios e experiências pensados para o seu perfil." },
    { num: "3", title: "Embarque Tranquilo", desc: "Você recebe tudo organizado: passagens, hospedagem e transfers, com atendimento pelo WhatsApp." },
  ],
  equipeFeatures: [
    { icon: "🤝", title: "Atendimento de perto", desc: "Você fala direto com a agência em todas as etapas da compra." },
    { icon: "💬", title: "Atendimento pelo WhatsApp", desc: "Tire dúvidas e acompanhe sua reserva pela conversa no WhatsApp." },
    { icon: "🧭", title: "Roteiro do seu jeito", desc: "Hotéis, passeios e datas escolhidos a partir do que você pediu." },
    { icon: "📄", title: "Orçamento sem compromisso", desc: "Você recebe a proposta com valores e condições antes de decidir." },
  ],
  faq: [
    { q: "Vocês parcelam?", a: "As formas de pagamento aparecem na proposta de cada pacote. Pergunte pelo WhatsApp." },
    { q: "É seguro contratar com vocês?", a: "Você recebe a proposta e o contrato com todos os detalhes antes de pagar, e pode tirar qualquer dúvida antes de fechar." },
    { q: "E se eu precisar cancelar?", a: "Cada pacote tem sua política. Você recebe o contrato com tudo claro antes de fechar." },
    { q: "Como tiro dúvidas?", a: "Pelo WhatsApp, direto com a agência." },
  ],
};

// Texto de fábrica antigo (com número, prazo ou promessa) → texto neutro.
const legacyClaims: Record<string, string> = {
  "Preencha o formulário e nossa equipe entrará em contato em até 2 horas com uma proposta personalizada.": HONEST_DEFAULTS.orcamentoText,
  "Cada viagem começa com uma conversa real. Nossa equipe de especialistas conhece os destinos de perto — cada detalhe pensado para o seu perfil, seus sonhos e o seu momento.": HONEST_DEFAULTS.equipeIntro,
  "Entendemos seus sonhos, datas, orçamento e estilo em uma conversa de 30 minutos sem compromisso.": HONEST_DEFAULTS.processoSteps[0].desc,
  "Curadoria Exclusiva": HONEST_DEFAULTS.processoSteps[1].title,
  "Criamos um roteiro 100% personalizado com os melhores hotéis, passeios e experiências para o seu perfil.": HONEST_DEFAULTS.processoSteps[1].desc,
  "Cuidamos de passagens, hospedagem, transfers e suporte 24h durante toda a sua viagem.": HONEST_DEFAULTS.processoSteps[2].desc,
  "Segurança e Confiabilidade": HONEST_DEFAULTS.equipeFeatures[0].title,
  "Anos de atuação com milhares de famílias e parceiros verificados mundialmente.": HONEST_DEFAULTS.equipeFeatures[0].desc,
  "Suporte 24h Durante a Viagem": HONEST_DEFAULTS.equipeFeatures[1].title,
  "Nossa equipe está disponível a qualquer hora. Qualquer imprevisto, resolvemos.": HONEST_DEFAULTS.equipeFeatures[1].desc,
  "Experiências Exclusivas": HONEST_DEFAULTS.equipeFeatures[2].title,
  "Acesso a hotéis e experiências que não estão disponíveis para o público geral.": HONEST_DEFAULTS.equipeFeatures[2].desc,
  "Melhor Custo-Benefício": HONEST_DEFAULTS.equipeFeatures[3].title,
  "Nossa rede de parceiros oferece condições especiais que você não encontra em outros lugares.": HONEST_DEFAULTS.equipeFeatures[3].desc,
  "Sim! Em até 12x no cartão de crédito, sem juros em condições selecionadas.": HONEST_DEFAULTS.faq[0].a,
  "Somos uma agência regularizada com CNPJ ativo e parceria direta com operadoras.": HONEST_DEFAULTS.faq[1].a,
  "Como tira dúvidas?": HONEST_DEFAULTS.faq[3].q,
  "Atendimento direto pelo WhatsApp, com resposta em até 1h em horário comercial.": HONEST_DEFAULTS.faq[3].a,
  "Anos de Experiência": EMPTY_SITE_STATS[0].label,
  "Viajantes Felizes": EMPTY_SITE_STATS[1].label,
  "Países Atendidos": EMPTY_SITE_STATS[2].label,
  "Satisfação": EMPTY_SITE_STATS[3].label,
  [LEGACY_TEAM_BADGE]: "",
  [LEGACY_HOURS[0]]: "",
  [LEGACY_HOURS[1]]: "",
};

/** Devolve o texto neutro quando o valor é exatamente um texto de fábrica antigo. */
export const replaceLegacyClaim = (value: string): string =>
  Object.prototype.hasOwnProperty.call(legacyClaims, value) ? legacyClaims[value] : value;


// Topo do site conforme o tipo de agência escolhido no Painel (state.agencyType).
export type SiteAgencyKind = "emissivo" | "receptivo" | "excursao";

export const siteAgencyKind = (agencyType?: string): SiteAgencyKind =>
  agencyType === "receptiva" ? "receptivo"
    : agencyType === "grupos" || agencyType === "religioso" ? "excursao"
    : "emissivo";

/** Textos antigos do topo que contam como "não preenchido". */
export const LEGACY_HERO_EYEBROW = "Consultoria Premium de Viagens";

export function heroDefaultsFor(agencyType?: string, city?: string) {
  const place = city?.trim();
  switch (siteAgencyKind(agencyType)) {
    case "receptivo":
      return {
        eyebrow: "Passeios e receptivo",
        headline: place ? `Passeios em ${place}` : "Passeios para aproveitar cada dia",
        subheadline: "Passeios, transfers e roteiros na região. Escolha o seu e reserve pelo WhatsApp.",
      };
    case "excursao":
      return {
        eyebrow: "Excursões e grupos",
        headline: "Excursões com data marcada",
        subheadline: "Transporte, hospedagem e roteiro organizados para o grupo. Veja as próximas saídas e reserve pelo WhatsApp.",
      };
    default:
      return {
        eyebrow: "Agência de viagens",
        headline: "Sua próxima viagem começa aqui",
        subheadline: "Pacotes, passagens e hospedagem com atendimento de perto. Peça seu orçamento pelo WhatsApp, sem compromisso.",
      };
  }
}
