import type { FabricaState, ScoreBreakdown, Gargalo } from "@/hooks/useFabricaContext";

const LEVEL_NAMES = [
  "Iniciante",
  "Em Desenvolvimento",
  "Em Crescimento",
  "Estabelecida",
  "Referência",
];

const LEVEL_DESC = [
  "Sua agência ainda não construiu uma presença digital sólida. Você está deixando dinheiro na mesa e seus concorrentes estão dominando o mercado.",
  "Você já começou, mas sua comunicação está frágil e inconstante. Falta posicionamento estratégico para atrair o cliente certo.",
  "Você está no caminho certo, mas precisa escalar com inteligência. Hora de lapidar a oferta e injetar tráfego de forma agressiva.",
  "Agência madura, com autoridade estabelecida. Otimize cada etapa do funil para extrair a máxima lucratividade por lead.",
  "Nível Elite. Você é referência. O desafio agora é manter a inovação constante e diversificar canais para dominar totalmente o seu nicho.",
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

  // Conteúdo (25%)
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

  // Vendas (20%)
  let vendas = 0;
  const fechamentos = parseInt(state.fechamentosMes || "0", 10);
  if (fechamentos >= 20) vendas = 65;
  else if (fechamentos >= 10) vendas = 50;
  else if (fechamentos >= 5) vendas = 35;
  else if (fechamentos >= 1) vendas = 20;

  if (state.whatsappGroupActive) vendas += 20;
  if (state.whatsapp) vendas += 15;

  vendas = Math.min(100, vendas);

  // Tráfego (15%)
  let trafego = state.investeAds ? 65 : 15;
  if (posts === "200_500" || posts === "more_500") trafego += 20; // Tráfego orgânico forte construído por histórico de posts
  if (state.usesFabricaTemplates) trafego += 15; // criativos consistentes ajudam na atração

  trafego = Math.min(100, trafego);

  // Conversão (15%)
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

  evaluate("Presença Digital", presenca, {
    red: "Sua agência é virtualmente invisível. O cliente entra no seu perfil e sente insegurança por falta de autoridade, link na bio, poucos posts ou falta de destaques organizados.",
    amber: "Presença morna. Você existe no Instagram, mas não tem magnetismo. Precisa de destaques estruturados, link profissional na bio e constância na publicação de posts.",
    green: "Ótima autoridade! Sua marca transmite confiança à primeira vista, feed estruturado e pontos de conversão ativos. Continue refinando seu branding.",
  });
  evaluate("Conteúdo", conteudo, {
    red: "Conteúdo fraco ou 'panfletário'. Sem rostos, sem reels, sem uso de ferramentas Canva Viagem, e sem utilidade — o cliente te ignora e o algoritmo te enterra.",
    amber: "Produz conteúdo mas falta estratégia de conexão. Use vozes sintéticas realistas no ElevenLabs/Fish Audio e poste diariamente usando a Fábrica de templates.",
    green: "Mix de conteúdo impecável! Humanização, uso inteligente de IAs de voz, notícias de turismo e estratégia gerando alto engajamento natural.",
  });
  evaluate("Vendas", vendas, {
    red: "Vendas esporádicas e sem método. Seu negócio vive de indicações instáveis. Falta criar um grupo VIP de avisos no WhatsApp e nutrir leads diariamente.",
    amber: "Vendas acontecendo mas falta cadência. Crie o grupo VIP de avisos do WhatsApp somente para administrador e mande 5 promoções por dia geradas no Fabrica.",
    green: "Máquina de vendas rodando! Processo de nutrição diária ativo com grupo VIP silencioso no WhatsApp e campanhas recorrentes.",
  });
  evaluate("Tráfego Pago", trafego, {
    red: "Você é 100% refém do algoritmo orgânico. Sem anúncios apontando para seu site do Fabrica, seu crescimento está artificialmente travado.",
    amber: "Investe timidamente ou faltam criativos persuasivos. Utilize o gerador da Fábrica para ter novas artes diárias e testar públicos na campanha.",
    green: "Tráfego ativo direcionando leads do Instagram e Facebook direto para a landing page do Fabrica e depois para o WhatsApp.",
  });
  evaluate("Conversão", conversao, {
    red: "Gargalo crítico na oferta. Você vende comodity e o cliente só briga por desconto. Falta um site publicado profissional, depoimentos em destaque e prova social.",
    amber: "Conversão ok, mas pode subir o ticket e a conversão publicando depoimentos de clientes reais e personalizando propostas de valor diferenciadas.",
    green: "Posicionamento de valor máximo! Landing page gerada pelo Fabrica no link da bio, muitos depoimentos, fotos de clientes e grupo de ofertas ativo.",
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
        { key: "site-bio", text: "Publicar o site profissional gerado no Fábrica e adicionar no link da bio do Instagram" },
        { key: "cores-feed", text: "Abrir o Canva Viagem e padronizar as cores visuais do seu feed do Instagram" },
        { key: "destaques-inicial", text: "Organizar e criar 4 destaques principais: Sobre Nós, Pacotes, Depoimentos, Contato" },
        { key: "grupo-whats", text: "Criar grupo VIP de avisos no WhatsApp (configurado: 'somente administradores mandam mensagem')" },
      ],
      quinzeDias: [
        { key: "convite-vip", text: "Criar um convite personalizado e enviar para todos os clientes/contatos entrarem no grupo de avisos" },
        { key: "fabrica-5por-dia", text: "Entrar no Fábrica do Canva Viagem e gerar 5 novas promoções por dia (feed e stories)" },
        { key: "disparar-whats", text: "Mandar diariamente as 5 imagens de avisos e promoções no seu grupo VIP silencioso de clientes" },
        { key: "stories-diarios", text: "Subir stories diários humanizados mostrando bastidores de reservas ou destinos populares" },
      ],
      mesDois: [
        { key: "reels-1", text: "Gravar e postar 3 Reels no feed com dicas rápidas usando os roteiros prontos do Canva Viagem" },
        { key: "depo-historico", text: "Coletar os primeiros depoimentos e feedbacks de clientes anteriores e postar no feed/destaques" },
        { key: "fotos-reais", text: "Postar mais fotos reais de clientes viajando e caprichar na personalização das legendas de pacotes" },
        { key: "ads-low", text: "Iniciar anúncios simples (R$ 10/dia) no Instagram direcionando o tráfego direto para o seu site do Fabrica" },
      ]
    };
  } else {
    // Fase Avançada / Em Crescimento
    return {
      imediato: [
        { key: "revisar-site-bio", text: "Otimizar o link da bio com a versão atualizada da sua landing page do Fabrica" },
        { key: "depo-destaques-avancado", text: "Adicionar depoimentos e fotos reais de clientes viajando nos Destaques mais recentes" },
        { key: "fabrica-destinos-premium", text: "Usar o Fábrica para gerar 5 promoções por dia focando em destinos exclusivos e premium" },
        { key: "whats-premium", text: "Criar um grupo VIP de ofertas exclusivas e relâmpago no WhatsApp com contatos de alta recorrência" },
      ],
      quinzeDias: [
        { key: "referencias-virais", text: "Pesquisar vídeos virais no TikTok e Reels de turismo para usar como referência de edição e gancho" },
        { key: "roteiro-persuasivo", text: "Usar o Narrador de Ofertas ou Robô de IA para gerar textos persuasivos para os seus roteiros" },
        { key: "voz-ia-sintetica", text: "Gerar narrações de áudio realistas na ElevenLabs ou Fish Audio para inserir nos vídeos do Instagram/TikTok" },
        { key: "blog-noticias-turismo", text: "Pesquisar notícias sobre turismo em blogs do mercado e postar sua análise em carrossel para gerar autoridade" },
      ],
      mesDois: [
        { key: "repostar-influencers", text: "Repostar ou fazer co-autoria com influenciadores em destinos turísticos e fazer reviews de hotéis" },
        { key: "trafego-landingpage", text: "Configurar campanhas de tráfego pago (Meta Ads) enviando direto para a landing page do Fabrica e para o WhatsApp" },
        { key: "campanha-sazonal", text: "Lançar campanhas sazonais de cupons e descontos por tempo limitado para a base do grupo VIP de WhatsApp" },
        { key: "upsell-premium", text: "Adicionar upgrades premium nos orçamentos (como transfer privativo, day-use ou lounges em aeroportos)" },
      ]
    };
  }
}

