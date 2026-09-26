import type { SiteContent } from "@/hooks/useFabricaContext";

// Translate only exact factory sample copy carried over from an ES draft.
// Never run a general-purpose translation over a customer's own writing.
const ptDefaults: Record<string, string> = {
  "Consultoría Premium de Viajes": "Consultoria Premium de Viagens",
  "Nuestros Paquetes": "Nossos Pacotes",
  "Quienes viajaron recomiendan": "Quem viajou recomenda",
  "Preguntas Frecuentes": "Perguntas Frequentes",
  "¿Listo para tu próximo viaje?": "Pronto para sua próxima viagem?",
  "Contactar por WhatsApp": "Chamar no WhatsApp",
  "Hablar por WhatsApp": "Falar no WhatsApp",
  "Proceso": "Processo",
  "Tu viaje de ensueño en 3 pasos": "Sua viagem dos sonhos em 3 passos",
  "Tu viaje soñado en 3 pasos": "Sua viagem dos sonhos em 3 passos",
  "+15k Clientes Satisfechos": "+15k Clientes Satisfeitos",
  "Nuestro equipo": "Nossa equipe",
  "Un equipo dedicado exclusivamente a ti": "Uma equipe dedicada exclusivamente a você",
  "Cada viaje comienza con una conversación real. Nuestro equipo de expertos conoce los destinos de cerca — cada detalle pensado para tu perfil, tus sueños y tu momento.": "Cada viagem começa com uma conversa real. Nossa equipe de especialistas conhece os destinos de perto — cada detalhe pensado para o seu perfil, seus sonhos e o seu momento.",
  "Entendemos tus sueños, fechas, presupuesto y estilo en una charla de 30 minutos sin compromiso.": "Entendemos seus sonhos, datas, orçamento e estilo em uma conversa de 30 minutos sem compromisso.",
  "Curaduría Exclusiva": "Curadoria Exclusiva",
  "Creamos un itinerario 100% personalizado con los mejores hoteles, tours y experiencias para tu perfil.": "Criamos um roteiro 100% personalizado com os melhores hotéis, passeios e experiências para o seu perfil.",
  "Cuidamos de pasajes, alojamiento, traslados y soporte 24h durante todo tu viaje.": "Cuidamos de passagens, hospedagem, transfers e suporte 24h durante toda a sua viagem.",
  "Seguridad y Confiabilidad": "Segurança e Confiabilidade",
  "Años de experiencia con miles de familias y socios verificados mundialmente.": "Anos de atuação com milhares de famílias e parceiros verificados mundialmente.",
  "Soporte 24h Durante el Viaje": "Suporte 24h Durante a Viagem",
  "Nuestro equipo está disponible a cualquier hora. Cualquier imprevisto, lo resolvemos.": "Nossa equipe está disponível a qualquer hora. Qualquer imprevisto, resolvemos.",
  "Experiencias Exclusivas": "Experiências Exclusivas",
  "Acceso a hoteles y experiencias que no están disponibles para el público general.": "Acesso a hotéis e experiências que não estão disponíveis para o público geral.",
  "Mejor Relación Calidad-Precio": "Melhor Custo-Benefício",
  "Nuestra red de socios ofrece condiciones especiales que no encuentras en otros lugares.": "Nossa rede de parceiros oferece condições especiais que você não encontra em outros lugares.",
  "Presupuesto": "Orçamento",
  "Habla con un consultor ahora": "Fale com um consultor agora",
  "Completa el formulario y nuestro equipo te contactará en hasta 2 horas con una propuesta personalizada.": "Preencha o formulário e nossa equipe entrará em contato em até 2 horas com uma proposta personalizada.",
  "Lun–Vie 8h–20h · Sáb 9h–15h": "Seg–Sex 8h–20h · Sáb 9h–15h",
  "Lun–Vie 8h–20h": "Seg–Sex 8h–20h",
  "Hablar con un especialista": "Falar com um especialista",
  "Enviar por WhatsApp": "Enviar pelo WhatsApp",
  "Tu socio ideal para viajes inolvidables. Cuidamos cada detalle para que tú solo disfrutes el momento.": "Sua parceira ideal para viagens inesquecíveis. Cuidamos de cada detalhe para que você apenas aproveite o momento.",
  "Años de Experiencia": "Anos de Experiência",
  "Viajeros Felices": "Viajantes Felizes",
  "Países Visitados": "Países Atendidos",
  "Satisfacción": "Satisfação",
  "¿Se puede pagar en cuotas?": "Vocês parcelam?",
  "¡Sí! Hasta 12 cuotas con tarjeta de crédito, sin intereses en condiciones seleccionadas.": "Sim! Em até 12x no cartão de crédito, sem juros em condições selecionadas.",
  "¿Es seguro contratar con ustedes?": "É seguro contratar com vocês?",
  "Somos una agencia regulada con registro activo y asociación directa con operadores.": "Somos uma agência regularizada com CNPJ ativo e parceria direta com operadoras.",
  "¿Y si necesito cancelar?": "E se eu precisar cancelar?",
  "Cada paquete tiene su política. Recibirás el contrato con todo claro antes de cerrar.": "Cada pacote tem sua política. Você recebe o contrato com tudo claro antes de fechar.",
  "¿Cómo resolver dudas?": "Como tira dúvidas?",
  "Atención directa por WhatsApp, con respuesta en menos de 1h en horario comercial.": "Atendimento direto pelo WhatsApp, com resposta em até 1h em horário comercial.",
};

const replaceDefault = (value: string | undefined) => value ? ptDefaults[value] || value : value;

export function normalizePortugueseSiteDefaults(content: SiteContent): SiteContent {
  const normalized = { ...content };
  const fields = [
    "heroEyebrow", "heroCtaLabel", "pacotesTitle", "depoimentosTitle", "faqTitle",
    "finalCtaTitle", "finalCtaLabel", "processoEyebrow", "processoTitle",
    "equipeBadge", "equipeEyebrow", "equipeTitle", "equipeIntro", "orcamentoEyebrow",
    "orcamentoTitle", "orcamentoText", "atendimentoText", "equipeCtaLabel",
    "formSubmitLabel", "footerText", "footerHoursLabel",
  ] as const;
  for (const field of fields) {
    const value = normalized[field];
    if (value) normalized[field] = replaceDefault(value);
  }
  if (content.processoSteps) normalized.processoSteps = content.processoSteps.map(step => ({
    ...step, title: replaceDefault(step.title) || step.title, desc: replaceDefault(step.desc) || step.desc,
  }));
  if (content.equipeFeatures) normalized.equipeFeatures = content.equipeFeatures.map(feature => ({
    ...feature, title: replaceDefault(feature.title) || feature.title, desc: replaceDefault(feature.desc) || feature.desc,
  }));
  if (content.stats) normalized.stats = content.stats.map(stat => ({
    ...stat, label: replaceDefault(stat.label) || stat.label,
  }));
  if (content.faq) normalized.faq = content.faq.map(item => ({
    ...item, q: replaceDefault(item.q) || item.q, a: replaceDefault(item.a) || item.a,
  }));
  return normalized;
}