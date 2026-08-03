export const FREE_CAPTIONS = [
  {
    id: "free-caption-last-spots",
    destination: "Últimas vagas",
    text: "As últimas vagas para esta viagem já estão disponíveis. Fale com a nossa equipe, confira as condições e reserve antes do encerramento.",
    hashtags: "#AgênciaDeViagens #ÚltimasVagas #Viajar",
  },
  {
    id: "free-caption-family",
    destination: "Viagem em família",
    text: "Momentos especiais começam com uma viagem bem planejada. Conte com a nossa equipe para encontrar a melhor opção para toda a família.",
    hashtags: "#ViagemEmFamília #Férias #Turismo",
  },
  {
    id: "free-caption-custom",
    destination: "Roteiro personalizado",
    text: "Seu próximo destino pode ter o seu ritmo, o seu orçamento e as experiências que combinam com você. Peça agora uma proposta personalizada.",
    hashtags: "#RoteiroPersonalizado #AgênciaDeViagens #SuaPróximaViagem",
  },
  {
    id: "free-caption-whatsapp",
    destination: "Atendimento pelo WhatsApp",
    text: "Ainda tem dúvidas sobre datas, hospedagem ou pagamento? Chame nossa equipe no WhatsApp e receba todas as informações para viajar com segurança.",
    hashtags: "#Atendimento #WhatsApp #PlanejeSuaViagem",
  },
] as const;

export const FREE_FEED_TEMPLATE_IDS = new Set([
  "local-feed-1",
  "local-feed-2",
]);

export const FREE_CAPTION_IDS = new Set<string>(FREE_CAPTIONS.map((caption) => caption.id));
