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

  evaluate("Presença Digital", presenca, {
    red: "Sua agência é virtualmente invisível. O cliente entra no seu perfil e sente insegurança por falta de autoridade e profissionalismo.",
    amber: "Presença morna. Você existe no Instagram, mas não tem magnetismo. Precisa de destaques estruturados e linha editorial clara.",
    green: "Ótima autoridade! Sua marca transmite confiança à primeira vista. Continue refinando seu branding.",
  });
  evaluate("Conteúdo", conteudo, {
    red: "Conteúdo fraco ou 'panfletário'. Sem rostos, sem reels e sem utilidade — o cliente te ignora e o algoritmo te enterra.",
    amber: "Produz conteúdo mas falta estratégia de conexão. Apareça mais e misture entretenimento com vendas.",
    green: "Mix de conteúdo impecável! Humanização e estratégia gerando alto engajamento natural.",
  });
  evaluate("Vendas", vendas, {
    red: "Vendas esporádicas e sem método. Seu negócio vive de indicações instáveis em vez de processos previsíveis.",
    amber: "Vendas acontecendo mas falta cadência. Hora de profissionalizar o script e o acompanhamento comercial.",
    green: "Máquina de vendas rodando! Continue tracionando e focando na retenção da carteira.",
  });
  evaluate("Tráfego Pago", trafego, {
    red: "Você é 100% refém do algoritmo orgânico. Sem anúncios, seu crescimento está artificialmente travado.",
    amber: "Investe timidamente. Dá pra escalar o orçamento e profissionalizar a segmentação para dobrar os leads.",
    green: "Tráfego ativo bombardeando a audiência certa. Otimize o CPL (Custo por Lead) e escale.",
  });
  evaluate("Conversão", conversao, {
    red: "Gargalo crítico na oferta. Você vende comodity e o cliente só briga por desconto. Falta gerar valor percebido.",
    amber: "Conversão ok, mas pode subir o ticket médio vendendo agregados e serviços premium personalizados.",
    green: "Posicionamento de valor máximo! O cliente paga pelo seu serviço, não só pelo aéreo.",
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
    { key: "bio", text: "Reescrever a bio do Instagram com proposta clara + CTA" },
    { key: "destaques", text: "Criar 4 destaques: Sobre, Pacotes, Depoimentos, Contato" },
    { key: "whatsapp", text: "Configurar WhatsApp Business com mensagem automática" },
    { key: "primeira-oferta", text: "Publicar primeira oferta de pacote no feed" },
  ];
  const quinzeDias = [
    { key: "reels-1", text: "Postar 3 Reels com gancho forte (dor → solução)" },
    { key: "depo", text: "Coletar 5 depoimentos reais de clientes anteriores" },
    { key: "carrossel", text: "Publicar 2 carrosséis educativos sobre destinos" },
    { key: "stories-diarios", text: "Subir stories diários com bastidores" },
  ];
  const mesDois = [
    { key: "ads-low", text: "Iniciar campanha de tráfego R$ 10/dia (mensagens)" },
    { key: "calendar", text: "Montar calendário editorial mensal" },
    { key: "blog", text: "Publicar 2 conteúdos educativos longos por mês" },
    { key: "upsell", text: "Criar upsell premium (transfer privativo, day-use, etc)" },
  ];
  return { imediato, quinzeDias, mesDois };
}
