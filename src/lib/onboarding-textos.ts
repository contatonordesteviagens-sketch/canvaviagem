// Textos do quiz de entrada (Onboarding.tsx) em português e em espanhol da Espanha.
// As perguntas em português ficam no próprio Onboarding.tsx (STEPS); aqui está a tradução delas, na mesma ordem.
// Fonte do espanhol: operacao/direct-response/canva-viagem-espanha/copy-es-13-11-2026.md (seção 2).

export type QuizLang = "pt" | "es";

type Ponto = { label: string; fix: string };

export type QuizTextos = {
  pageTitle: string;
  back: string;
  chooseOne: string;
  continuar: (n: number) => string;
  email: {
    invalid: string; existing: string; title: [string, string]; sub: string; label: string;
    placeholder: string; busy: string; button: string; footer: string;
  };
  intro: { title: [string, string]; sub: [string, string]; adAlt: string; carouselAlt: string; button: string; footer: string };
  result: {
    title: [string, string]; sub: string; told: string;
    pontos: { tempo: Ponto; amador: Ponto; ninguem: Ponto; oque: Ponto; poucos: Ponto; padrao: Ponto };
    postar: string; semana1: string; semana2: string; dias: string[];
    semanas: (destino: string) => [string[], string[]];
    button: string;
  };
  destinos: Record<string, string>;
  destinoPadrao: string;
};

export const TEXTOS: Record<QuizLang, QuizTextos> = {
  pt: {
    pageTitle: "Seu plano — Canva Viagem",
    back: "Voltar",
    chooseOne: "Escolha pelo menos um",
    continuar: (n) => `Continuar (${n})`,
    email: {
      invalid: "Confira o e-mail digitado.",
      existing: "Esse e-mail já tem conta. Enviamos um link de acesso para ele.",
      title: ["Seu diagnóstico está pronto. ", "Qual é o seu e-mail?"],
      sub: "É com ele que você entra na plataforma. O seu plano aparece em seguida.",
      label: "Seu melhor e-mail",
      placeholder: "voce@suaagencia.com",
      busy: "Abrindo o seu plano…",
      button: "Ver o meu plano",
      footer: "Sem spam. Você sai da lista quando quiser.",
    },
    intro: {
      title: ["Fale da sua agência e ", "receba tudo pronto."],
      sub: ["Responda o questionário de 1 minuto para ", "liberar o seu acesso."],
      adAlt: "Anúncio feito no Canva Viagem",
      carouselAlt: "Slide de carrossel feito no Canva Viagem",
      button: "Começar agora",
      footer: "Avance para gerar mais artes sem marca d'água, com o seu preço e o seu WhatsApp.",
    },
    result: {
      title: ["Seu diagnóstico ", "está pronto"],
      sub: "Com base nas suas respostas",
      told: "O QUE VOCÊ NOS CONTOU",
      pontos: {
        tempo: { label: "Falta tempo para postar", fix: "A arte sai em minutos, sem começar do zero." },
        amador: { label: "Os posts parecem amadores", fix: "Modelos prontos, com a sua logo e as suas cores." },
        ninguem: { label: "Posta e ninguém chama", fix: "Anúncio com preço e WhatsApp, e o site do pacote para receber o pedido." },
        oque: { label: "Não sabe o que postar", fix: "Uma sugestão do que postar em cada dia." },
        poucos: { label: "Poucos pedidos de orçamento", fix: "Site com o botão do WhatsApp e seus clientes organizados em um só lugar." },
        padrao: { label: "Vender mais com a mesma rotina", fix: "Arte, site e clientes no mesmo lugar, sem precisar de equipe." },
      },
      postar: "O QUE POSTAR NAS 2 PRIMEIRAS SEMANAS",
      semana1: "Semana 1",
      semana2: "Semana 2 · novo pacote, mesmo ritmo",
      dias: ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"],
      semanas: (destino) => [
        [
          `Anúncio de ${destino} + stories do pacote`,
          "Carrossel do pacote com dicas da viagem",
          "Pacote publicado no seu site",
          "Vídeo pronto do destino",
          "Stories e vídeo de outro pacote em promoção",
          "Responder orçamentos no WhatsApp e anunciar outro pacote",
          "Organizar clientes no CRM e planejar a semana",
        ],
        [
          "Anúncio de um pacote novo + stories com enquete",
          "Carrossel: o que fazer no destino",
          "Página do pacote novo no site e link na bio",
          "Vídeo pronto de outro destino",
          "Stories com contagem regressiva da promoção",
          "Mandar a página do pacote para quem pediu orçamento",
          "CRM: quem fechou, quem falta responder e o plano da próxima semana",
        ],
      ],
      button: "Ver meu plano",
    },
    destinos: { praia: "Porto de Galinhas", serra: "Gramado", internacional: "Cancún", cruzeiro: "Cruzeiro pelo litoral", excursao: "Excursão de fim de semana" },
    destinoPadrao: "Cancún",
  },
  es: {
    pageTitle: "Tu plan | Canva Viagem",
    back: "Volver",
    chooseOne: "Elige al menos uno",
    continuar: (n) => `Continuar (${n})`,
    email: {
      invalid: "Revisa el correo escrito.",
      existing: "Ese correo ya tiene cuenta. Te hemos enviado un enlace de acceso.",
      title: ["Tu diagnóstico está listo. ", "¿Cuál es tu correo electrónico?"],
      sub: "Con él entras en la plataforma. Tu plan aparece a continuación.",
      label: "Tu mejor correo",
      placeholder: "tu@tuagencia.com",
      busy: "Abriendo tu plan…",
      button: "Ver mi plan",
      footer: "Sin spam. Te das de baja cuando quieras.",
    },
    intro: {
      title: ["Cuéntanos de tu agencia y ", "recibe todo listo."],
      sub: ["Responde un cuestionario de 1 minuto para ", "activar tu acceso."],
      adAlt: "Anuncio hecho en Canva Viagem",
      carouselAlt: "Diapositiva de carrusel hecha en Canva Viagem",
      button: "Empezar ahora",
      footer: "Sigue para crear más artes sin marca de agua, con tu precio y tu WhatsApp.",
    },
    result: {
      title: ["Tu diagnóstico ", "está listo"],
      sub: "En base a tus respuestas",
      told: "LO QUE NOS HAS CONTADO",
      pontos: {
        tempo: { label: "Te falta tiempo para publicar", fix: "La arte sale en minutos, sin empezar de cero." },
        amador: { label: "Tus publicaciones parecen de aficionado", fix: "Modelos listos, con tu logo y tus colores." },
        ninguem: { label: "Publicas y nadie escribe", fix: "Anuncio con precio y WhatsApp, y la web del paquete para recibir la solicitud." },
        oque: { label: "No sabes qué publicar", fix: "Una sugerencia de qué publicar cada día." },
        poucos: { label: "Pocas solicitudes de presupuesto", fix: "Web con botón de WhatsApp y tus clientes ordenados en un solo sitio." },
        padrao: { label: "Vender más con la misma rutina", fix: "Arte, web y clientes en el mismo sitio, sin necesitar equipo." },
      },
      postar: "QUÉ PUBLICAR LAS 2 PRIMERAS SEMANAS",
      semana1: "Semana 1",
      semana2: "Semana 2 · paquete nuevo, mismo ritmo",
      dias: ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"],
      semanas: (destino) => [
        [
          `Anuncio de ${destino} + stories del paquete`,
          "Carrusel del paquete con consejos del viaje",
          "Paquete publicado en tu web",
          "Vídeo listo del destino",
          "Stories y vídeo de otro paquete en oferta",
          "Responder presupuestos por WhatsApp y anunciar otro paquete",
          "Ordenar clientes en el CRM y planificar la semana",
        ],
        [
          "Anuncio de un paquete nuevo + stories con encuesta",
          "Carrusel: qué hacer en el destino",
          "Página del paquete nuevo en la web y enlace en la bio",
          "Vídeo listo de otro destino",
          "Stories con cuenta atrás de la promoción",
          "Mandar la página del paquete a quien pidió presupuesto",
          "CRM: quién ha cerrado, a quién falta responder y plan de la semana siguiente",
        ],
      ],
      button: "Ver mi plan",
    },
    destinos: { praia: "Mallorca", serra: "Andorra", internacional: "Punta Cana", cruzeiro: "Crucero por el Mediterráneo", excursao: "Escapada de fin de semana" },
    destinoPadrao: "Punta Cana",
  },
};

/** Perguntas em espanhol, pela chave da pergunta. As opções seguem a ordem do STEPS: [rótulo, apoio]. */
export const PERGUNTAS_ES: Record<string, { title: string; sub: string; options: [string, string][] }> = {
  objetivo: {
    title: "¿Qué cambiaría más en tu vida si vendieras más?", sub: "Sé sincero, esto cambia todo lo que te vamos a recomendar",
    options: [
      ["Pagar las facturas del mes", "Tener una caja previsible"],
      ["Hacer la primera venta", "Salir del cero de una vez"],
      ["Dejar mi trabajo", "Vivir solo de la agencia"],
      ["Hacer crecer la agencia", "Vender más de lo que ya vendo"],
    ],
  },
  ferramenta: {
    title: "¿Cómo creas tus publicaciones ahora?", sub: "Esto decide cuánto trabajo te quitamos de encima",
    options: [
      ["Editor online con plantillas", "Gratis, pero lleva horas"],
      ["Diseñador o freelance", "Caro y tarda días"],
      ["Material del mayorista o turoperador", "Igual que el de todo el mundo"],
      ["Casi no publico", "No sé por dónde empezar"],
    ],
  },
  desafio: {
    title: "¿Cuál es tu mayor problema ahora mismo?", sub: "Elige el que más pesa",
    options: [
      ["No sé qué publicar", "Me quedo mirando la pantalla en blanco"],
      ["Publico y nadie escribe", "Likes sin presupuestos"],
      ["Tardo demasiado en crearlo", "Una arte me lleva toda la tarde"],
      ["Mis publicaciones parecen de aficionado", "No transmiten confianza"],
    ],
  },
  momento: {
    title: "¿En qué momento estás?", sub: "No hay respuesta incorrecta",
    options: [
      ["Estoy empezando", "Aún no he vendido"],
      ["Ya he vendido, pero poco", "Alguna venta de vez en cuando"],
      ["Vendo todos los meses", "Quiero escalar"],
      ["Tengo equipo", "Agencia estructurada"],
    ],
  },
  orcamentos: {
    title: "¿Cuántos presupuestos recibes por semana?", sub: "Una cuenta aproximada ya ayuda",
    options: [
      ["Ninguno todavía", "El WhatsApp casi no suena"],
      ["De 1 a 5", "Llegan algunos, sin regularidad"],
      ["De 6 a 20", "Tengo movimiento, quiero más"],
      ["Más de 20", "Necesito ordenar y cerrar más"],
    ],
  },
  destinos: {
    title: "¿Qué destinos vendes más?", sub: "Marca todos los que quieras",
    options: [
      ["Sol y playa en España", "Costa, Baleares, Canarias"],
      ["Nieve y montaña", "Pirineos, Andorra, Sierra Nevada"],
      ["Internacional", "Caribe, Nueva York, Asia"],
      ["Cruceros", "Barcos e itinerarios"],
      ["Escapadas y grupos", "Viajes de un día o fin de semana, en autocar"],
    ],
  },
};

/** Telas de carregamento em espanhol, na ordem em que aparecem. Linhas de processo no lugar das avaliações. */
export const CARGAS_ES: { label: string; lines: string[] }[] = [
  { label: "Preparando tu diagnóstico…", lines: ["Leyendo tus respuestas…", "Buscando el material que te falta…", "Montando tu plan de las dos primeras semanas…"] },
  { label: "Activando tu plan…", lines: ["Aplicando tus respuestas…", "Preparando tu espacio de trabajo…", "Casi listo…"] },
];

/** Tela de oferta em espanhol: sem contador, sem avaliações, sem Pix. Preços vêm de src/lib/precos-es.ts. */
export const OFERTA_ES = {
  title: ["Tu plan está listo. ", "Activa tu acceso."] as [string, string],
  sub: "Vídeo del paquete, anuncios, stories, carruseles, web y tus clientes ordenados. Todo con tu marca.",
  recebeTitle: "Lo que recibes en este plan",
  recebe: [
    "Vídeo de tu paquete listo en minutos, a partir de un audio o de la foto del paquete",
    "Anuncios para feed y stories, con tu logo",
    "Carruseles listos para cada destino",
    "Web completa con botón a tu WhatsApp",
    "Clientes ordenados en un solo sitio",
    "Vídeos Reels listos para publicar",
    "Calendario que te dice qué publicar cada día",
  ],
  videoAlt: (n: number) => `Ejemplo de vídeo listo ${n}`,
  recomendado: "RECOMENDADO",
  per: "al mes",
  note: "Cancela cuando quieras",
  garantia: (dias: number) => `Garantía de ${dias} días`,
  garantiaTexto: "Crea el material de un paquete real de tu agencia. Si no te encaja, pide el reembolso dentro del plazo.",
  pagar: "Pagar con tarjeta",
  resumo: (nome: string, preco: string) => `Plan ${nome}: ${preco} al mes`,
};
