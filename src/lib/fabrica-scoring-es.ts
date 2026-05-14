import type { FabricaState, ScoreBreakdown, Gargalo } from "@/hooks/useFabricaContext";

const LEVEL_NAMES = [
  "Principiante",
  "En Desarrollo",
  "En Crecimiento",
  "Establecida",
  "Referencia",
];

const LEVEL_DESC = [
  "Tu agencia aún no ha construido una presencia digital sólida. Estás dejando dinero sobre la mesa y tus competidores dominan el mercado.",
  "Has comenzado, pero tu comunicación es frágil e inconstante. Falta un posicionamiento estratégico para atraer al cliente ideal.",
  "Estás en el camino correcto, pero necesitas escalar con inteligencia. Es hora de pulir la oferta e inyectar tráfico de forma agresiva.",
  "Agencia madura, con autoridad establecida. Optimiza cada etapa del embudo para extraer la máxima rentabilidad por prospecto.",
  "Nivel Elite. Eres una referencia. El desafío ahora es mantener la innovación constante y diversificar canales para dominar totalmente tu nicho.",
];

export function calculateScore(state: FabricaState): {
  digitalScore: number;
  scoreBreakdown: ScoreBreakdown;
  level: number;
  levelName: string;
  levelDescription: string;
  gargalos: Gargalo[];
} {
  // Presença (25%)
  let presenca = 0;
  if (state.followers === "10k+") presenca += 60;
  else if (state.followers === "2k-10k") presenca += 45;
  else if (state.followers === "500-2k") presenca += 25;
  else if (state.followers === "0-500") presenca += 10;
  if (state.hasHighlights) presenca += 25;
  if (state.instagram) presenca += 15;
  presenca = Math.min(100, presenca);

  // Conteúdo (25%) - Ajustado com Peso para Humanização e Estratégia
  let conteudo = 0;
  if (state.postFrequency === "diario") conteudo += 30;
  else if (state.postFrequency === "semanal") conteudo += 20;
  else if (state.postFrequency === "mensal") conteudo += 10;
  
  if (state.usesReels) conteudo += 25;
  if (state.hasPeople) conteudo += 25; // PESSOAS REAIS GERAM CONEXÃO!
  if (state.contentStrategy === "misto") conteudo += 20; // CONTEÚDO DE VALOR + PROMO
  
  conteudo = Math.min(100, conteudo);

  // Vendas (20%)
  let vendas = 0;
  const fechamentos = parseInt(state.fechamentosMes || "0", 10);
  if (fechamentos >= 20) vendas = 90;
  else if (fechamentos >= 10) vendas = 70;
  else if (fechamentos >= 5) vendas = 50;
  else if (fechamentos >= 1) vendas = 25;

  // Tráfego (15%)
  let trafego = state.investeAds ? 75 : 15;

  // Conversão (15%)
  let conversao = 0;
  const ticket = parseInt(state.ticketMedio || "0", 10);
  if (ticket >= 5000) conversao = 85;
  else if (ticket >= 2500) conversao = 65;
  else if (ticket >= 1000) conversao = 40;
  else if (ticket > 0) conversao = 20;
  if (state.hasDepoimentos) conversao = Math.min(100, conversao + 15);

  const breakdown: ScoreBreakdown = { presenca, conteudo, vendas, trafego, conversao };
  const digitalScore = Math.round(
    presenca * 0.25 + conteudo * 0.25 + vendas * 0.2 + trafego * 0.15 + conversao * 0.15
  );

  let level = 1;
  if (digitalScore >= 81) level = 5;
  else if (digitalScore >= 61) level = 4;
  else if (digitalScore >= 41) level = 3;
  else if (digitalScore >= 21) level = 2;

  const gargalos: Gargalo[] = [];
  const evaluate = (dim: string, value: number, msgs: { red: string; amber: string; green: string }) => {
    if (value < 35) gargalos.push({ dimension: dim, level: "red", text: msgs.red });
    else if (value < 65) gargalos.push({ dimension: dim, level: "amber", text: msgs.amber });
    else gargalos.push({ dimension: dim, level: "green", text: msgs.green });
  };

  evaluate("Presencia Digital", presenca, {
    red: "Tu agencia es virtualmente invisible. El cliente entra en tu perfil y siente inseguridad por falta de autoridad y profesionalismo.",
    amber: "Presencia tibia. Existes en Instagram, pero no tienes magnetismo. Necesitas destacados estructurados y una línea editorial clara.",
    green: "¡Excelente autoridad! Tu marca transmite confianza a primera vista. Continúa refinando tu branding.",
  });
  evaluate("Contenido", conteudo, {
    red: "Contenido débil o 'panfletario'. Sin rostros, sin reels y sin utilidad — el cliente te ignora y el algoritmo te entierra.",
    amber: "Produces contenido pero falta estrategia de conexión. Aparece más y mezcla entretenimiento con ventas.",
    green: "¡Mix de contenido impecable! Humanización y estrategia generando un alto compromiso natural.",
  });
  evaluate("Ventas", vendas, {
    red: "Ventas esporádicas y sin método. Tu negocio vive de recomendaciones inestables en lugar de procesos previsibles.",
    amber: "Ventas ocurriendo pero falta cadencia. Es hora de profesionalizar el guion y el seguimiento comercial.",
    green: "¡Máquina de ventas funcionando! Continúa traccionando y enfocándote en la retención de la cartera.",
  });
  evaluate("Tráfico Pago", trafego, {
    red: "Eres 100% rehén del algoritmo orgánico. Sin anuncios, tu crecimiento está bloqueado artificialmente.",
    amber: "Inviertes tímidamente. Se puede escalar el presupuesto y profesionalizar la segmentación para duplicar los prospectos.",
    green: "Tráfico activo impactando a la audiencia correcta. Optimiza el CPL (Costo por Prospecto) y escala.",
  });
  evaluate("Conversión", conversao, {
    red: "Cuello de botella crítico en la oferta. Vendes lo mismo que todos y el cliente solo pelea por descuentos. Falta generar valor percibido.",
    amber: "Conversión aceptable, pero puedes subir el ticket promedio vendiendo adicionales y servicios premium personalizados.",
    green: "¡Posicionamiento de valor máximo! El cliente paga por tu servicio, no solo por el vuelo.",
  });

  return {
    digitalScore,
    scoreBreakdown: breakdown,
    level,
    levelName: LEVEL_NAMES[level - 1],
    levelDescription: LEVEL_DESC[level - 1],
    gargalos,
  };
}

export function getChecklistByLevel(level: number) {
  const imediato = [
    { key: "bio", text: "Reescribir la bio de Instagram con propuesta clara + CTA" },
    { key: "destaques", text: "Crear 4 destacados: Sobre, Paquetes, Testimonios, Contacto" },
    { key: "whatsapp", text: "Configurar WhatsApp Business con mensaje automático" },
    { key: "primeira-oferta", text: "Publicar primera oferta de paquete en el feed" },
  ];
  const quinzeDias = [
    { key: "reels-1", text: "Publicar 3 Reels con gancho fuerte (dolor → solución)" },
    { key: "depo", text: "Recopilar 5 testimonios reales de clientes anteriores" },
    { key: "carrossel", text: "Publicar 2 carruseles educativos sobre destinos" },
    { key: "stories-diarios", text: "Subir stories diarios con detrás de escena" },
  ];
  const mesDois = [
    { key: "ads-low", text: "Iniciar campaña de tráfico $2/día (mensajes)" },
    { key: "calendar", text: "Armar calendario editorial mensual" },
    { key: "blog", text: "Publicar 2 contenidos educativos largos por mes" },
    { key: "upsell", text: "Crear upsell premium (transfer privado, day-use, etc)" },
  ];
  return { imediato, quinzeDias, mesDois };
}
