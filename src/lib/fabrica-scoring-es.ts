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
  // Presencia (25%)
  let presenca = 0;
  if (state.followers === "10k+") presenca += 30;
  else if (state.followers === "2k-10k") presenca += 20;
  else if (state.followers === "500-2k") presenca += 10;
  else if (state.followers === "0-500") presenca += 5;

  const posts = state.instagramPosts || "less_10";
  if (posts === "more_500") presenca += 30;
  else if (posts === "200_500") presenca += 25;
  else if (posts === "50_200") presenca += 20;
  else if (posts === "20_50") presenca += 15;
  else if (posts === "10_20") presenca += 10;
  else presenca += 5;

  if (state.hasHighlights) presenca += 15;
  if (state.instagram) presenca += 10;
  if (state.hasBioLink) presenca += 15;
  presenca = Math.min(100, presenca);

  // Contenido (25%)
  let conteudo = 0;
  if (state.postFrequency === "diario") conteudo += 20;
  else if (state.postFrequency === "semanal") conteudo += 15;
  else if (state.postFrequency === "mensal") conteudo += 10;
  else conteudo += 5;
  
  if (state.usesReels) conteudo += 15;
  if (state.hasPeople) conteudo += 15; 
  if (state.contentStrategy === "misto") conteudo += 15; 
  if (state.usesVoiceovers) conteudo += 15;
  if (state.publishesNews) conteudo += 10;
  if (state.usesFabricaTemplates) conteudo += 10;
  
  conteudo = Math.min(100, conteudo);

  // Ventas (20%)
  let vendas = 0;
  const fechamentos = parseInt(state.fechamentosMes || "0", 10);
  if (fechamentos >= 20) vendas = 65;
  else if (fechamentos >= 10) vendas = 50;
  else if (fechamentos >= 5) vendas = 35;
  else if (fechamentos >= 1) vendas = 20;

  if (state.whatsappGroupActive) vendas += 20;
  if (state.whatsapp) vendas += 15;

  vendas = Math.min(100, vendas);

  // Tráfico (15%)
  let trafego = state.investeAds ? 65 : 15;
  if (posts === "200_500" || posts === "more_500") trafego += 20; 
  if (state.usesFabricaTemplates) trafego += 15; 

  trafego = Math.min(100, trafego);

  // Conversión (15%)
  let conversao = 0;
  const ticket = parseInt(state.ticketMedio || "0", 10);
  if (ticket >= 5000) conversao = 55;
  else if (ticket >= 2500) conversao = 45;
  else if (ticket >= 1000) conversao = 30;
  else if (ticket > 0) conversao = 15;

  if (state.hasDepoimentos) conversao += 15;
  if (state.hasBioLink) conversao += 15;
  if (state.whatsappGroupActive) conversao += 15;

  conversao = Math.min(100, conversao);

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
    red: "Tu agencia es virtualmente invisible. El cliente entra en tu perfil y siente inseguridad por falta de autoridad, link en la bio, pocos posts o falta de destacados organizados.",
    amber: "Presencia tibia. Existes en Instagram, pero no tienes magnetismo. Necesitas destacados estructurados, enlace profesional en la bio y constancia en la publicación de posts.",
    green: "¡Excelente autoridad! Tu marca transmite confianza a primera vista, feed estructurado y puntos de conversión activos. Continúa refinando tu branding.",
  });
  evaluate("Contenido", conteudo, {
    red: "Contenido débil o 'panfletario'. Sin rostros, sin reels, sin uso de herramientas Canva Viagem, y sin utilidad — el cliente te ignora y el algoritmo te entierra.",
    amber: "Produces contenido pero falta estrategia de conexión. Usa voces sintéticas realistas en ElevenLabs/Fish Audio y publica diariamente usando la Fábrica de plantillas.",
    green: "¡Mix de contenido impecable! Humanización, uso inteligente de IAs de voz, noticias de turismo y estrategia generando un alto compromiso natural.",
  });
  evaluate("Ventas", vendas, {
    red: "Ventas esporádicas y sin método. Tu negocio vive de recomendaciones inestables. Falta crear un grupo VIP de avisos en WhatsApp y nutrir prospectos diariamente.",
    amber: "Ventas ocurriendo pero falta cadencia. Crea el grupo VIP de avisos de WhatsApp solo para administradores y envía 5 promociones por día generadas en Fabrica.",
    green: "¡Máquina de ventas funcionando! Proceso de nutrición diaria activo con grupo VIP silencioso en WhatsApp y campañas recurrentes.",
  });
  evaluate("Tráfico Pago", trafego, {
    red: "Eres 100% rehén del algoritmo orgánico. Sin anuncios apuntando a tu sitio de Fabrica, tu crecimiento está bloqueado artificialmente.",
    amber: "Inviertes tímidamente o faltan creativos persuasivos. Utiliza el generador de la Fábrica para tener nuevas artes diarias y probar públicos en la campaña.",
    green: "Tráfico activo direccionando prospectos de Instagram y Facebook directo a la landing page de Fabrica y luego a WhatsApp.",
  });
  evaluate("Conversión", conversao, {
    red: "Cuello de botella crítico en la oferta. Vendes lo mismo que todos y el cliente solo pelea por descuentos. Falta un sitio publicado profesional, testimonios destacados y prueba social.",
    amber: "Conversión aceptable, pero puedes subir el ticket promedio y la conversión publicando testimonios de clientes reales y personalizando propuestas de valor diferenciadas.",
    green: "¡Posicionamiento de valor máximo! Landing page generada por Fabrica en el enlace de la bio, muchos testimonios, fotos de clientes y grupo de ofertas activo.",
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

export function getChecklistByLevel(level: number, state?: FabricaState) {
  const posts = state?.instagramPosts || "less_10";
  const isInicial = posts === "less_10" || posts === "10_20";

  if (isInicial) {
    return {
      imediato: [
        { key: "site-bio", text: "Publicar el sitio profesional generado en Fábrica y añadir en el enlace de la bio de Instagram" },
        { key: "cores-feed", text: "Abrir Canva Viagem y estandarizar los colores visuales de tu feed de Instagram" },
        { key: "destaques-inicial", text: "Organizar y crear 4 destacados principales: Sobre Nosotros, Paquetes, Testimonios, Contacto" },
        { key: "grupo-whats", text: "Crear un grupo VIP de avisos en WhatsApp (configurado: 'solo los administradores envían mensajes')" },
      ],
      quinzeDias: [
        { key: "convite-vip", text: "Crear una invitación personalizada y enviarla a todos tus contactos para unirse al grupo de avisos" },
        { key: "fabrica-5por-dia", text: "Entrar en la Fábrica de Canva Viagem y generar 5 nuevas promociones por día (feed e historias)" },
        { key: "disparar-whats", text: "Enviar diariamente las 5 imágenes de avisos y promociones en tu grupo VIP silencioso de clientes" },
        { key: "stories-diarios", text: "Subir stories diarios humanizados mostrando el detrás de escena de reservas o destinos populares" },
      ],
      mesDois: [
        { key: "reels-1", text: "Grabar y publicar 3 Reels en el feed con consejos rápidos usando los guiones listos de Canva Viagem" },
        { key: "depo-historico", text: "Recopilar los primeros testimonios y comentarios de clientes anteriores y publicarlos en el feed/destacados" },
        { key: "fotos-reais", text: "Publicar más fotos reales de clientes viajando y esmerarse en la personalización de los textos de paquetes" },
        { key: "ads-low", text: "Iniciar anuncios sencillos ($2/día) en Instagram dirigiendo el tráfico directo a tu sitio de Fabrica" },
      ]
    };
  } else {
    // Fase Avançada / Em Crescimento
    return {
      imediato: [
        { key: "revisar-site-bio", text: "Optimizar el enlace de la bio con la versión actualizada de tu landing page de Fabrica" },
        { key: "depo-destaques-avancado", text: "Añadir testimonios y fotos reales de clientes viajando en los Destacados más recientes" },
        { key: "fabrica-destinos-premium", text: "Usar la Fábrica para generar 5 promociones al día enfocándose en destinos exclusivos y premium" },
        { key: "whats-premium", text: "Crear un grupo VIP de ofertas exclusivas y relámpago en WhatsApp con contactos de alta recurrencia" },
      ],
      quinzeDias: [
        { key: "referencias-virais", text: "Buscar videos virales en TikTok y Reels de turismo para usarlos como referencia de edición y gancho" },
        { key: "roteiro-persuasivo", text: "Usar el Narrador de Ofertas o Robot de IA para generar textos persuasivos para tus guiones" },
        { key: "voz-ia-sintetica", text: "Generar narraciones de audio realistas en ElevenLabs o Fish Audio para insertar en los videos de Instagram/TikTok" },
        { key: "blog-noticias-turismo", text: "Buscar noticias de turismo en blogs de mercado y publicar tu análisis en carrusel para generar autoridad" },
      ],
      mesDois: [
        { key: "repostar-influencers", text: "Repostar o hacer coautoría con influencers en destinos turísticos y hacer reseñas de hoteles" },
        { key: "trafego-landingpage", text: "Configurar campañas de tráfico pagado (Meta Ads) enviando directo a la landing page de Fabrica y luego a WhatsApp" },
        { key: "campanha-sazonal", text: "Lanzar campañas estacionales de cupones y descuentos por tiempo limitado para el grupo VIP de WhatsApp" },
        { key: "upsell-premium", text: "Añadir mejoras premium a los presupuestos (como traslados privados, day-use o salas vip en aeropuertos)" },
      ]
    };
  }
}

