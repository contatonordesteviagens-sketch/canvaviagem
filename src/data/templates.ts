export interface Template {
  id?: string;
  title: string;
  url: string;
  type: 'video' | 'feed' | 'story' | 'seasonal';
  category?: 'nacional' | 'internacional' | 'influencer-eva' | 'influencer-mel' | 'influencer-bia' | string;
  is_new?: boolean;
  image_url?: string;
  icon?: string;
  drive_url?: string;
}

export const templates: Template[] = [
  {
    "title": "Beto Carrero 1",
    "url": "https://www.canva.com/design/DAG9S3v2-Xs/SlewfwY2SK7tWD8Kh8PQnA/view?utm_content=DAG9S3v2-Xs&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview",
    "type": "video",
    "category": "nacional",
    "is_new": true,
    "description": "✨ A aventura te espera com Beto Carrero 1! ✈️🌍\\n\\n🔥 Nossos pacotes e conteúdos são criados para você colecionar momentos inesquecíveis sem preocupações.\\n\\n👇 Clique no link da BIO para aproveitar as melhores condições!\\n📲 (99) 9 9999-9999\\n\\n#BetoCarrero1 #ViagemPerfeita #AgenciaDeViagens"
  },
  {
    "title": "Beto Carrero 2",
    "url": "https://www.canva.com/design/DAG9S-vZM7E/x1W88qKaCcyg7xEgXpB2Xw/view?utm_content=DAG9S-vZM7E&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview",
    "type": "video",
    "category": "nacional",
    "is_new": true,
    "description": "✨ A aventura te espera com Beto Carrero 2! ✈️🌍\\n\\n🔥 Nossos pacotes e conteúdos são criados para você colecionar momentos inesquecíveis sem preocupações.\\n\\n👇 Clique no link da BIO para aproveitar as melhores condições!\\n📲 (99) 9 9999-9999\\n\\n#BetoCarrero2 #ViagemPerfeita #AgenciaDeViagens"
  },
  {
    "title": "Eva - Destinos",
    "url": "https://www.canva.com/design/DAG9S4RtOxw/TCkudfkvm9UR0spYybxRgw/view?utm_content=DAG9S4RtOxw&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview",
    "type": "video",
    "category": "influencer-eva",
    "is_new": true,
    "description": "Com nossos pacotes exclusivos, você pode descobrir o mundo de forma prática, segura e com preços acessíveis. Seja uma viagem rápida ou aquele destino dos seus sonhos, estamos prontos para te levar até lá! 🌎💼\n🔹 Pacotes personalizados para todos os perfis de viajantes. 🔹 Condições de pagamento facilitadas. 🔹 Suporte completo durante toda a sua viagem.\n🚀 Aproveite nossas ofertas especiais e comece a explorar o mundo!\n#DescubraOMundo #ViajeComEstilo #ExploradoresModernos #ViagemDosSonhos #AgenciaDeViagens #PacotesDeViagem #ViajandoPeloMundo"
  },
  {
    "title": "Eva - Dubai 2",
    "url": "https://www.canva.com/design/DAG9TCOrDTY/wKMgRGy0lpWPcMGwiRBpnw/view?utm_content=DAG9TCOrDTY&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview",
    "type": "video",
    "category": "influencer-eva",
    "is_new": true,
    "description": "Descubra as maravilhas de Dubai! 🏙️✨ Com o Burj Khalifa e os shoppings de luxo, Dubai é um destino moderno e fascinante. Nosso pacote a partir de 10x de R$450,00 inclui ✈️ passagens, 🏨 hospedagem e passeios para conhecer o deserto e a cidade.\n✔️ Um destino internacional cheio de glamour te espera.\nFale com a gente pelo WhatsApp: (99) 9 9999-9999\n#BelezasDeDubai #ViajarPeloMundo #FériasInternacionais",
    "drive_url": "https://drive.google.com/file/d/13BCK3_0ZhbK0Ogenc8bAydyOObsUcmlG/view?usp=drive_link"
  },
  {
    "title": "Eva - Paris 2",
    "url": "https://www.canva.com/design/DAG9TO_rCfY/KfeUizKIZ37ELrlcqW__Kg/view?utm_content=DAG9TO_rCfY&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview",
    "type": "video",
    "category": "influencer-eva",
    "is_new": true,
    "description": "Viaje sozinho para Paris com segurança! 🗼✨ Conhecida pela Torre Eiffel e pelos cafés, Paris é perfeita para uma aventura solo. Confira dicas essenciais para uma jornada tranquila, como escolher hotéis seguros e planejar seu roteiro.\n✔️ Salve essas dicas e curta sua viagem com confiança.\nPlaneje sua aventura pelo WhatsApp: (99) 9 9999-9999\n#DicasDeSegurança #ViajarSozinho #ViagemSegura"
  },
  {
    "title": "Eva - Roma",
    "url": "https://www.canva.com/design/DAG9TH2QDlI/e3Dp22xh9ORyokUSoqBbxQ/view?utm_content=DAG9TH2QDlI&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview",
    "type": "video",
    "category": "influencer-eva",
    "is_new": true,
    "description": "Evite imprevistos em Roma! 🏛️✈️ Chegue cedo ao aeroporto e mantenha seus documentos como passaporte 🛂 à mão para uma viagem tranquila. Roma é famosa pelo Coliseu e pela culinária italiana, como a carbonara autêntica.\n✔️ Dicas para curtir a Cidade Eterna sem estresse.\nPlaneje pelo WhatsApp: (99) 9 9999-9999\n#DicasDeViagem #ViajarSemEstresse #PlanejamentoDeViagem"
  },
  {
    "title": "Eva - Foz do Iguaçu",
    "url": "https://www.canva.com/design/DAG9Te0N8_4/MS2Pbpjl9eBoPeyrGEaZqw/view?utm_content=DAG9Te0N8_4&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview",
    "type": "video",
    "category": "influencer-eva",
    "is_new": true,
    "description": "Levante cedo para viajar para Foz do Iguaçu e viva um dia incrível! 🌊✨ As Cataratas e o Parque das Aves são paradas obrigatórias nesse destino cheio de natureza. Nosso pacote inclui ✈️ passagens e 🏨 hospedagem para você começar o dia com o pé direito.\n✔️ Nada como um amanhecer rumo a um destino dos sonhos.\nFale com a gente pelo WhatsApp: (99) 9 9999-9999\n#AcordarCedo #ViagemDosSonhos #FériasIncríveis",
    "drive_url": "https://drive.google.com/file/d/10i5BGZUQ9BxjzOhbFCRQ-dJUhltV8nav/view?usp=drive_link"
  },
  {
    "title": "Bia - Ceará",
    "url": "https://www.canva.com/design/DAG9TZvP9zQ/Iuv0I4ERobM3QdbyCCiQQw/view?utm_content=DAG9TZvP9zQ&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview",
    "type": "video",
    "category": "influencer-bia",
    "is_new": true,
    "description": "✨ Descubra as maravilhas de Namíbia! ✈️🌍\n\nCelebre o Dia do Turista em Namíbia! 🏜️📸 Explore desertos como o Namib, safáris com elefantes e a cultura local única. Nossos pacotes oferecem ✈️ passagens e 🏨 hospedagem para você viver aventuras inesquecíveis nesse destino africano. ✔️ O mundo é cheio de descobertas para viajantes apaixonados. Planeje sua viagem pelo WhatsApp: (99) 9 9999-9999\n\n🔥 Imagine você relaxando e aproveitando cada momento sem preocupações. Nosso pacote é pensado para você viver o melhor dessa viagem e colecionar momentos inesquecíveis!\n\n👇 Clique no link da BIO ou nos chame no WhatsApp para garantir seu pacote exclusivo agora!\n📲 (99) 9 9999-9999\\n\\n#DiaDoTurista #ExplorarOMundo #FériasInesquecíveis"
  },
  {
    "title": "Bia - Canoa Quebrada",
    "url": "https://www.canva.com/design/DAG9TYMIt98/sX5SRhcQlvB2Aieh_IiUKw/view?utm_content=DAG9TYMIt98&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview",
    "type": "video",
    "category": "influencer-bia",
    "is_new": true,
    "description": "✨ Descubra as maravilhas de Namíbia! ✈️🌍\n\nCelebre o Dia do Turista em Namíbia! 🏜️📸 Explore desertos como o Namib, safáris com elefantes e a cultura local única. Nossos pacotes oferecem ✈️ passagens e 🏨 hospedagem para você viver aventuras inesquecíveis nesse destino africano. ✔️ O mundo é cheio de descobertas para viajantes apaixonados. Planeje sua viagem pelo WhatsApp: (99) 9 9999-9999\n\n🔥 Imagine você relaxando e aproveitando cada momento sem preocupações. Nosso pacote é pensado para você viver o melhor dessa viagem e colecionar momentos inesquecíveis!\n\n👇 Clique no link da BIO ou nos chame no WhatsApp para garantir seu pacote exclusivo agora!\n📲 (99) 9 9999-9999\\n\\n#DiaDoTurista #ExplorarOMundo #FériasInesquecíveis"
  },
  {
    "title": "Bia - Jericoacoara",
    "url": "https://www.canva.com/design/DAG9TfxEuT4/nGCpaJevmQNasD6cHAEf6A/view?utm_content=DAG9TfxEuT4&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview",
    "type": "video",
    "category": "influencer-bia",
    "is_new": true,
    "description": "Viaje para Jericoacoara - CE 2 com segurança e tranquilidade! 🧳✈️ Adicione o seguro bagagem ao seu pacote e proteja sua mala contra perdas, danos ou extravios. Jeri é um destino mágico, e queremos que você curta cada momento sem imprevistos.\n✔️ Cobertura completa e assistência rápida para qualquer situação.\nAdicione ao seu pacote pelo WhatsApp: (99) 9 9999-9999\n#SeguroBagagem #ViagemTranquila #ViajarComSegurança",
    "drive_url": "https://drive.google.com/file/d/11KjCpWManwQUucEcR5MNJWL-a5-U1jdr/view?usp=drive_link"
  },
  {
    "title": "1ª vez no aeroporto",
    "url": "https://www.canva.com/design/DAGkwz6Stn8/5DPMi1DhNpaXJI-J3NKGxw/view?utm_content=DAGkwz6Stn8&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview",
    "type": "video",
    "description": "✨ A aventura te espera com 1ª vez no aeroporto! ✈️🌍\\n\\n🔥 Nossos pacotes e conteúdos são criados para você colecionar momentos inesquecíveis sem preocupações.\\n\\n👇 Clique no link da BIO para aproveitar as melhores condições!\\n📲 (99) 9 9999-9999\\n\\n#1ªveznoaeroporto #ViagemPerfeita #AgenciaDeViagens"
  },
  {
    "title": "5 motivos stopover",
    "url": "https://www.canva.com/design/DAGgIR03ya4/uIilbTx2KqhMAcvum1zJhA/view?utm_content=DAGgIR03ya4&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview",
    "type": "video",
    "description": "✨ A aventura te espera com 5 motivos stopover! ✈️🌍\\n\\n🔥 Nossos pacotes e conteúdos são criados para você colecionar momentos inesquecíveis sem preocupações.\\n\\n👇 Clique no link da BIO para aproveitar as melhores condições!\\n📲 (99) 9 9999-9999\\n\\n#5motivosstopover #ViagemPerfeita #AgenciaDeViagens"
  },
  {
    "title": "Bagagem de mãos",
    "url": "https://www.canva.com/design/DAGiIypPPKM/ekpIHP0DECKGnpD8Ab7yfw/view?utm_content=DAGiIypPPKM&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview",
    "type": "video",
    "description": "✨ A aventura te espera com Bagagem de mãos! ✈️🌍\\n\\n🔥 Nossos pacotes e conteúdos são criados para você colecionar momentos inesquecíveis sem preocupações.\\n\\n👇 Clique no link da BIO para aproveitar as melhores condições!\\n📲 (99) 9 9999-9999\\n\\n#Bagagemdemãos #ViagemPerfeita #AgenciaDeViagens"
  },
  {
    "title": "Colômbia",
    "url": "https://www.canva.com/design/DAGgIc5rv80/gVw4XEdLKrZwSdcz1yXHug/view?utm_content=DAGgIc5rv80&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview",
    "type": "video",
    "description": "Planeje sua primeira aventura como mochileiro em Colômbia! 🏔️🧳 Conhecida por Cartagena e Medellín, a Colômbia é um destino épico. Dicas como levar uma mochila leve e reservar passeios guiados garantem uma viagem sem estresse.\n✔️ Um guia essencial para começar sua jornada.\nSalve e planeje pelo WhatsApp: (99) 9 9999-9999\n#MochileirosDePrimeiraViagem #DicasDeMochileiro #AventuraPeloMundo \nVeneza\nExplore Veneza sem gastar muito! 🚤✨ Com os canais e a Praça de São Marcos, Veneza é mágica. Dicas como viajar na baixa temporada e escolher hospedagens econômicas ajudam a curtir ao máximo com orçamento limitado.\n✔️ Aproveite sua próxima aventura italiana com pouco.\nPlaneje pelo WhatsApp: (99) 9 9999-9999\n#ViajarComPouco #DicasDeViagem #ViagemEconomica",
    "drive_url": "https://drive.google.com/file/d/16Jfb9ZRiR6uAG6VV0rSxpsKv1cQE4L0L/view?usp=drive_link"
  },
  {
    "title": "Destinos Europa",
    "url": "https://www.canva.com/design/DAGgIUG7euo/Js89o2jxqADTtUSWygOcXQ/view?utm_content=DAGgIUG7euo&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview",
    "type": "video",
    "description": "✨ A aventura te espera com Destinos Europa! ✈️🌍\\n\\n🔥 Nossos pacotes e conteúdos são criados para você colecionar momentos inesquecíveis sem preocupações.\\n\\n👇 Clique no link da BIO para aproveitar as melhores condições!\\n📲 (99) 9 9999-9999\\n\\n#DestinosEuropa #ViagemPerfeita #AgenciaDeViagens"
  },
  {
    "title": "Erros Aeroporto",
    "url": "https://www.canva.com/design/DAGh7kfQjS0/hCb2QaCmX653zGW3vXxsXQ/view?utm_content=DAGh7kfQjS0&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview",
    "type": "video",
    "description": "✨ A aventura te espera com Erros Aeroporto! ✈️🌍\\n\\n🔥 Nossos pacotes e conteúdos são criados para você colecionar momentos inesquecíveis sem preocupações.\\n\\n👇 Clique no link da BIO para aproveitar as melhores condições!\\n📲 (99) 9 9999-9999\\n\\n#ErrosAeroporto #ViagemPerfeita #AgenciaDeViagens"
  },
  {
    "title": "Eu sei que...",
    "url": "https://www.canva.com/design/DAGgIQOdvZg/1LxyXTMTADzvAoVI2dTXUQ/view?utm_content=DAGgIQOdvZg&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview",
    "type": "video",
    "description": "✨ A aventura te espera com Eu sei que...! ✈️🌍\\n\\n🔥 Nossos pacotes e conteúdos são criados para você colecionar momentos inesquecíveis sem preocupações.\\n\\n👇 Clique no link da BIO para aproveitar as melhores condições!\\n📲 (99) 9 9999-9999\\n\\n#Euseique... #ViagemPerfeita #AgenciaDeViagens"
  },
  {
    "title": "Green Island",
    "url": "https://www.canva.com/design/DAGgIbjdtE0/eYVe9FWc-0ZHcOYKLnsi8w/view?utm_content=DAGgIbjdtE0&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview",
    "type": "video",
    "description": "✨ A aventura te espera com Green Island! ✈️🌍\\n\\n🔥 Nossos pacotes e conteúdos são criados para você colecionar momentos inesquecíveis sem preocupações.\\n\\n👇 Clique no link da BIO para aproveitar as melhores condições!\\n📲 (99) 9 9999-9999\\n\\n#GreenIsland #ViagemPerfeita #AgenciaDeViagens",
    "drive_url": "https://drive.google.com/file/d/16I46MjTa3z2VYwtwWxQ5Vn2huBXG9HAu/view?usp=drive_link"
  },
  {
    "title": "Itália",
    "url": "https://www.canva.com/design/DAGgIYNbZUY/eqdtdLIqCxdg_LcMsx_Kiw/view?utm_content=DAGgIYNbZUY&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview",
    "type": "video",
    "description": "Passaporte vencido antes de ir para Itália? 🛂✈️ Não se preocupe! Saiba como resolver rapidamente: renove com antecedência e verifique as exigências do destino. Itália tem Roma, Veneza e a Costa Amalfitana, destinos imperdíveis.\n✔️ Planeje com antecedência e evite problemas no embarque.\nFale com a gente pelo WhatsApp: (99) 9 9999-9999\n#PassaporteVencido #DicasDeViagem #PlanejamentoDeViagem",
    "drive_url": "https://drive.google.com/file/d/123DM5h9VObNWH2PC7sMw9RfpNQb2j0tE/view?usp=drive_link"
  },
  {
    "title": "Itens Proibidos na Viagem",
    "url": "https://www.canva.com/design/DAGiH3WGzjI/3zoZqBG1jNnHUuyIqka2Tg/view?utm_content=DAGiH3WGzjI&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview",
    "type": "video",
    "description": "✨ A aventura te espera com Itens Proibidos na Viagem! ✈️🌍\\n\\n🔥 Nossos pacotes e conteúdos são criados para você colecionar momentos inesquecíveis sem preocupações.\\n\\n👇 Clique no link da BIO para aproveitar as melhores condições!\\n📲 (99) 9 9999-9999\\n\\n#ItensProibidosnaViagem #ViagemPerfeita #AgenciaDeViagens"
  },
  {
    "title": "Lugares para conhecer",
    "url": "https://www.canva.com/design/DAGgIVPtLog/cIOBFuXjIwlyjMqFCkZmxg/view?utm_content=DAGgIVPtLog&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview",
    "type": "video",
    "description": "✨ A aventura te espera com Lugares para conhecer! ✈️🌍\\n\\n🔥 Nossos pacotes e conteúdos são criados para você colecionar momentos inesquecíveis sem preocupações.\\n\\n👇 Clique no link da BIO para aproveitar as melhores condições!\\n📲 (99) 9 9999-9999\\n\\n#Lugaresparaconhecer #ViagemPerfeita #AgenciaDeViagens"
  },
  {
    "title": "Paris",
    "url": "https://www.canva.com/design/DAGgIVn4s4Q/6CSoVcYM3EqimBownlS3Bw/view?utm_content=DAGgIVn4s4Q&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview",
    "type": "video",
    "description": "Viaje sozinho para Paris com segurança! 🗼✨ Conhecida pela Torre Eiffel e pelos cafés, Paris é perfeita para uma aventura solo. Confira dicas essenciais para uma jornada tranquila, como escolher hotéis seguros e planejar seu roteiro.\n✔️ Salve essas dicas e curta sua viagem com confiança.\nPlaneje sua aventura pelo WhatsApp: (99) 9 9999-9999\n#DicasDeSegurança #ViajarSozinho #ViagemSegura"
  },
  {
    "title": "Passeios vale a pena?",
    "url": "https://www.canva.com/design/DAGkxBw6Vsk/oXeUFCy0U8zvvCxZeIYdQQ/view?utm_content=DAGkxBw6Vsk&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview",
    "type": "video",
    "description": "✨ A aventura te espera com Passeios vale a pena?! ✈️🌍\\n\\n🔥 Nossos pacotes e conteúdos são criados para você colecionar momentos inesquecíveis sem preocupações.\\n\\n👇 Clique no link da BIO para aproveitar as melhores condições!\\n📲 (99) 9 9999-9999\\n\\n#Passeiosvaleapena? #ViagemPerfeita #AgenciaDeViagens"
  },
  {
    "title": "Resort All inclusive",
    "url": "https://www.canva.com/design/DAGgITNYaS4/RMeuZ_9Sg776J6t7WpCfiw/view?utm_content=DAGgITNYaS4&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview",
    "type": "video",
    "description": "✨ A aventura te espera com Resort All inclusive! ✈️🌍\\n\\n🔥 Nossos pacotes e conteúdos são criados para você colecionar momentos inesquecíveis sem preocupações.\\n\\n👇 Clique no link da BIO para aproveitar as melhores condições!\\n📲 (99) 9 9999-9999\\n\\n#ResortAllinclusive #ViagemPerfeita #AgenciaDeViagens"
  },
  {
    "title": "Tipos de viajantes",
    "url": "https://www.canva.com/design/DAGiH0U9WOk/qIKJKOYtQr-FJPyq0Bu-Vw/view?utm_content=DAGiH0U9WOk&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview",
    "type": "video",
    "description": "✨ A aventura te espera com Tipos de viajantes! ✈️🌍\\n\\n🔥 Nossos pacotes e conteúdos são criados para você colecionar momentos inesquecíveis sem preocupações.\\n\\n👇 Clique no link da BIO para aproveitar as melhores condições!\\n📲 (99) 9 9999-9999\\n\\n#Tiposdeviajantes #ViagemPerfeita #AgenciaDeViagens"
  },
  {
    "title": "Vale Sagrado",
    "url": "https://www.canva.com/design/DAGgIaWq6JM/w5oMJAcSAnbT-IdIr4RHhg/view?utm_content=DAGgIaWq6JM&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview",
    "type": "video",
    "description": "Está na hora de planejar suas férias dos sonhos no Vale Sagrado! 🏔️✨ ComSorry about that, something didn't go as planned. Please try again, and if you're still seeing this message, go ahead and restart the app.\n\n\n\n\n\n\nLEGENDAS AGÊNCIA DE VIAGEM\nARTE 1\nEstá na hora de deixar de sonhar e começar a planejar suas férias dos sonhos. Que tal curtir 5 dias no paraíso, com tudo que você precisa para relaxar e aproveitar ao máximo? 😎🌊\n🔸 Pacote Completo Inclui: ✈️ Passagem aérea de ida e volta 🧳 Bagagem despachada 🏨 5 diárias em hotel de luxo\nE o melhor: você pode fazer tudo isso em até 10x de R$450,00! Não perca a chance de viver essa experiência única. 🌟\n📲 Garanta já o seu pacote e prepare-se para uma aventura que vai ficar marcada na memória!\n#ViajarÉViver #CancunDream #AgenciaDeViagens #PacotesDeViagem #DestinoDosSonhos  #DescontoEspecial",
    "drive_url": "https://drive.google.com/file/d/153DwvNqOJzPksR1XjUXHoMYp6IX79_n2/view?usp=drive_link"
  },
  {
    "title": "Veneza",
    "url": "https://www.canva.com/design/DAGgIb2XeXY/7fKgFr7W8fFjrsIYVscUsw/view?utm_content=DAGgIb2XeXY&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview",
    "type": "video",
    "description": "Viaje em família para Veneza! 🚤✨ Conhecida pelos canais e pela Praça de São Marcos, Veneza é mágica para crianças e adultos. Outras opções incríveis incluem Paris, Orlando e Lisboa, com pacotes que incluem ✈️ passagens e 🏨 hospedagem.\n✔️ Momentos inesquecíveis para todas as idades garantidos.\nPlaneje agora pelo WhatsApp: (99) 9 9999-9999\n#ViagemComCrianças #FériasEmFamília #Veneza",
    "drive_url": "https://drive.google.com/file/d/14z2pfoMaPJaaYmorF3wri-7h0YT00rtD/view?usp=drive_link"
  },
  {
    "title": "Florianópolis",
    "url": "https://www.canva.com/design/DAGhwSfDeH4/RuNAiv6jYqNO5DgZkingog/view?utm_content=DAGhwSfDeH4&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview",
    "type": "video",
    "description": "Relembre momentos incríveis em Florianópolis - SC! 🏖️🌅 Conhecida como a \"Ilha da Magia\", Floripa tem praias para todos os gostos, de Jurerê a Campeche. Nosso pacote inclui ✈️ passagens e 🏨 hospedagem, para você planejar sua próxima viagem dos sonhos.\n✔️ Um destino com paisagens de tirar o fôlego e muita diversão.\nDescubra mais pelo WhatsApp: (99) 9 9999-9999\n#Florianópolis #TBTDeViagem #DestinoIncrível",
    "drive_url": "https://drive.google.com/file/d/10WpZTgI6o3Tunt9zZfOhl78qJwFHA_K6/view?usp=drive_link"
  },
  {
    "title": "Gramado",
    "url": "https://www.canva.com/design/DAGhwMD4p38/n5PE59SkUst9g6gz9r8TGA/view?utm_content=DAGhwMD4p38&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview",
    "type": "video",
    "description": "Evite surpresas no aeroporto ao viajar para Gramado! 🧳✈️ Confira dicas para não ter problemas com excesso de bagagem e curta o charme da Serra Gaúcha, com suas ruas floridas e o clima europeu. Nosso pacote inclui ✈️ passagens e 🏨 hospedagem.\n✔️ Viaje tranquilo e aproveite cada momento sem estresse.\nFale com a gente pelo WhatsApp: (99) 9 9999-9999\n#DicasDeViagem #ExcessoDeBagagem #ViagemSemEstresse",
    "drive_url": "https://drive.google.com/file/d/11L2RzID7XdutobpsEidXivyKsuumC2zs/view?usp=drive_link"
  },
  {
    "title": "Jalapão -",
    "url": "https://www.canva.com/design/DAGhwEYMGGc/UG3YbQaMWIPKSpohnITB1w/view?utm_content=DAGhwEYMGGc&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview",
    "type": "video",
    "description": "Sonha com o Jalapão - TO? 🏜️🌄 Esse destino é famoso pelas dunas douradas, cachoeiras cristalinas e fervedouros únicos. Nosso pacote a partir de R$2.500 inclui ✈️ passagens, 🏨 hospedagem e passeios guiados para explorar o melhor da região.\n✔️ Uma experiência de tranquilidade e conexão com a natureza.\nGaranta sua viagem pelo WhatsApp: (99) 9 9999-9999\n#Jalapão #DestinoDosSonhos #FériasNoParaíso",
    "drive_url": "https://drive.google.com/file/d/112UUcnFQlh6a6j4QtLXuyX83KO9w6MKZ/view?usp=drive_link"
  },
  {
    "title": "João Pessoa",
    "url": "https://www.canva.com/design/DAGhwZzplL0/fEvo_iUeyHONkXVHzfYWJA/view?utm_content=DAGhwZzplL0&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview",
    "type": "video",
    "description": "✨ A aventura te espera com João Pessoa! ✈️🌍\\n\\n🔥 Nossos pacotes e conteúdos são criados para você colecionar momentos inesquecíveis sem preocupações.\\n\\n👇 Clique no link da BIO para aproveitar as melhores condições!\\n📲 (99) 9 9999-9999\\n\\n#JoãoPessoa #ViagemPerfeita #AgenciaDeViagens"
  },
  {
    "title": "Maceió - AL",
    "url": "https://www.canva.com/design/DAGhwnD60oU/drXQPfEBddupMAG1nRFLFw/view?utm_content=DAGhwnD60oU&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview",
    "type": "video",
    "description": "Está na hora de planejar suas férias dos sonhos em Maceió - AL! 🌴✨ Curta 5 dias nesse paraíso nordestino com praias de águas cristalinas e coqueiros que parecem de cartão-postal. Nosso pacote inclui: ✈️ passagens aéreas de ida e volta, 🧳 bagagem despachada e 🏨 5 diárias em um hotel de luxo com vista para o mar. Tudo isso por apenas 10x de R$450,00!\n✔️ Um destino perfeito para relaxar e tirar fotos incríveis 📸.\nGaranta seu pacote agora no WhatsApp: (99) 9 9999-9999\n#ViajarÉViver #MaceióDream #AgenciaDeViagens",
    "drive_url": "https://drive.google.com/file/d/11EaH5lDoZ-vz7qlySeti0YlYF71VXQb8/view?usp=drive_link"
  },
  {
    "title": "Maragogi",
    "url": "https://www.canva.com/design/DAGhw_eHvbM/qxWP7WwLFPC7KF7NySVs4g/view?utm_content=DAGhw_eHvbM&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview",
    "type": "video",
    "description": "Descubra as maravilhas de Maragogi! 🐠🌴 Suas águas cristalinas e corais são perfeitas para snorkeling e passeios de buggy. Nosso pacote a partir de 10x de R$450,00 inclui ✈️ passagens, 🏨 hospedagem e traslados para você aproveitar o melhor do destino.\n✔️ Um pedacinho do paraíso brasileiro te espera.\nFale com a gente pelo WhatsApp: (99) 9 9999-9999\n#BelezasDoBrasil #ViajarPeloBrasil #FériasNoBrasil",
    "drive_url": "https://drive.google.com/file/d/10LeDT87lhcl9XFOck533SscCs5I2iqqZ/view?usp=drive_link"
  },
  {
    "title": "Natal -",
    "url": "https://www.canva.com/design/DAGhwzeB__g/tzzeNJVuhZ69H9bzdqjyAA/view?utm_content=DAGhwzeB__g&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview",
    "type": "video",
    "description": "Curta o calor em 3 paraísos: Natal - RN, Porto de Galinhas e Angra dos Reis! 🏖️☀️ Natal tem dunas incríveis e passeios de buggy em Genipabu, perfeitos para o verão. Nossos pacotes incluem ✈️ passagens e 🏨 hospedagem para você escolher seu destino favorito.\n✔️ Três opções de praias paradisíacas para suas férias.\nFale com a gente pelo WhatsApp: (99) 9 9999-9999\n #DestinosDeVerão #ViajarÉViver",
    "drive_url": "https://drive.google.com/file/d/1vYhYavLpGaDnMdvti8tmHV_CAsv-MLNG/view?usp=drive_link"
  },
  {
    "title": "Pantanal",
    "url": "https://www.canva.com/design/DAGhwGGAzDo/k-esCqBx31QG2ZoilCXc_w/view?utm_content=DAGhwGGAzDo&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview",
    "type": "video",
    "description": "Viva dias inesquecíveis no Pantanal! 🐾🌿 Conhecido pela biodiversidade, esse destino é ideal para safáris fotográficos e observação de animais como onças e jacarés. Nosso pacote para 2 adultos inclui ✈️ passagens e hospedagem, por apenas R$2.900.\n✔️ Uma aventura na natureza que você nunca vai esquecer.\nGaranta sua viagem pelo WhatsApp: (99) 9 9999-9999\n#PantanalDosSonhos #PacoteDeViagem #FériasInesquecíveis",
    "drive_url": "https://drive.google.com/file/d/11-A9Nw4g9P0pY-FbtgeV2PNQBir1qi3E/view?usp=drive_link"
  },
  {
    "title": "Rio de Janeiro",
    "url": "https://www.canva.com/design/DAGhxyWDmZw/zAtIqQAWopsfzD3XmNoVlQ/view?utm_content=DAGhxyWDmZw&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview",
    "type": "video",
    "description": "Descubra o Rio de Janeiro e viva experiências únicas! 🌄✨ Conhecida como a Cidade Maravilhosa, o Rio tem o Cristo Redentor, o Pão de Açúcar e praias famosas como Copacabana. Nosso pacote inclui ✈️ passagens, 🏨 hospedagem e passeios para explorar os pontos turísticos mais icônicos.\n✔️ Uma viagem para se encantar com cada cantinho da cidade.\nEntre em contato pelo WhatsApp: (99) 9 9999-9999\n#ViajarÉViver #MagiaDosDestinos #FériasInesquecíveis",
    "drive_url": "https://drive.google.com/file/d/10WyscibbG8F45bzSUJ0LWxhRYNBq9UiX/view?usp=drive_link"
  },
  {
    "title": "Rota das Emoções",
    "url": "https://www.canva.com/design/DAGhweeLbpA/vjpvI0SswmRQO9eMVodzPw/view?utm_content=DAGhweeLbpA&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview",
    "type": "video",
    "description": "Cada passo da sua viagem pela Rota das Emoções é memorável! 🏜️🚤 Esse roteiro inclui Lençóis Maranhenses, Delta do Parnaíba e Jericoacoara, com paisagens de tirar o fôlego. Nosso pacote oferece ✈️ passagens, 🏨 hospedagem e passeios guiados para curtir cada detalhe.\n✔️ A aventura está em cada parada dessa jornada incrível.\nFale com a gente pelo WhatsApp: (99) 9 9999-9999\n#JornadaDeViagem #FériasIncríveis #ExperiênciasInesquecíveis"
  },
  {
    "title": "Seychelles",
    "url": "https://www.canva.com/design/DAGgIZTaKmY/p_oJQNqw2lzTi9Iwsn8j2A/view?utm_content=DAGgIZTaKmY&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview",
    "type": "video",
    "description": "Evite erros ao planejar sua viagem para Seychelles! 🏝️✈️ Conhecidas pelas praias de areia branca e tartarugas gigantes, as Seychelles são um paraíso. Confira dicas para uma jornada sem dores de cabeça, com ✈️ passagens e 🏨 hospedagem organizadas por nós.\n✔️ Viaje com mais segurança e aproveite cada momento.\nPlaneje pelo WhatsApp: (99) 9 9999-9999\n#DicasDeViagem #ViagemInternacional #ViajarSemEstresse",
    "drive_url": "https://drive.google.com/file/d/15Zv4yNxO22wgGS3ndsdBMIFMJZrGEQLn/view?usp=drive_link"
  },
  {
    "title": "Talin Estônia",
    "url": "https://www.canva.com/design/DAGgIcMi9Cw/iMTL2rcrMkidPTfF26_wvA/view?utm_content=DAGgIcMi9Cw&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview",
    "type": "video",
    "description": "✨ A aventura te espera com Talin Estônia! ✈️🌍\\n\\n🔥 Nossos pacotes e conteúdos são criados para você colecionar momentos inesquecíveis sem preocupações.\\n\\n👇 Clique no link da BIO para aproveitar as melhores condições!\\n📲 (99) 9 9999-9999\\n\\n#TalinEstônia #ViagemPerfeita #AgenciaDeViagens"
  },
  {
    "title": "Tailândia",
    "url": "https://www.canva.com/design/DAGgIW08oec/20D9OkJgnfUwUPf7HY5zdw/view?utm_content=DAGgIW08oec&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview",
    "type": "video",
    "description": "Escolha o destino perfeito para Tailândia! 🏝️✨ Conhecida pelos templos, mercados e praias como Krabi, a Tailândia é ideal para todos os estilos. Nossa equipe te ajuda a planejar a viagem dos sonhos, com ✈️ passagens e 🏨 hospedagem inclusas.\n✔️ Um lugar para relaxar, explorar ou se aventurar.\nFale com a gente pelo WhatsApp: (99) 9 9999-9999\n#DestinoIdeal #PlanejeSuaViagem #FériasDosSonhos",
    "drive_url": "https://drive.google.com/file/d/15htqp9okcLW1Bdoaql8VXAB8Rqpy3cI1/view?usp=drive_link"
  },
  {
    "title": "Veneza",
    "url": "https://www.canva.com/design/DAGgIb2XeXY/7fKgFr7W8fFjrsIYVscUsw/view?utm_content=DAGgIb2XeXY&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview",
    "type": "video",
    "description": "Viaje em família para Veneza! 🚤✨ Conhecida pelos canais e pela Praça de São Marcos, Veneza é mágica para crianças e adultos. Outras opções incríveis incluem Paris, Orlando e Lisboa, com pacotes que incluem ✈️ passagens e 🏨 hospedagem.\n✔️ Momentos inesquecíveis para todas as idades garantidos.\nPlaneje agora pelo WhatsApp: (99) 9 9999-9999\n#ViagemComCrianças #FériasEmFamília #Veneza",
    "drive_url": "https://drive.google.com/file/d/14z2pfoMaPJaaYmorF3wri-7h0YT00rtD/view?usp=drive_link"
  },
  {
    "title": "Bia (Black Friday)",
    "url": "https://www.canva.com/design/DAG2Tvngdhs/My6C92vRgzpf_z4ibppq5Q/view?utm_content=DAG2Tvngdhs&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview",
    "type": "seasonal",
    "description": "✨ A aventura te espera com Bia (Black Friday)! ✈️🌍\\n\\n🔥 Nossos pacotes e conteúdos são criados para você colecionar momentos inesquecíveis sem preocupações.\\n\\n👇 Clique no link da BIO para aproveitar as melhores condições!\\n📲 (99) 9 9999-9999\\n\\n#Bia(BlackFriday) #ViagemPerfeita #AgenciaDeViagens"
  },
  {
    "title": "Bia (Carnaval Salvador)",
    "url": "https://www.canva.com/design/DAG2dvQ0Yz8/ihxicpkJls4fNaU7LY4n7g/view?utm_content=DAG2dvQ0Yz8&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview",
    "type": "seasonal",
    "description": "✨ Descubra as maravilhas de Salvador - BA! ✈️🌍\n\nViajar para Salvador - BA é colecionar momentos inesquecíveis! 🎭🌴 Explore o Pelourinho, prove o acarajé e sinta a energia única da Bahia. Nossos pacotes oferecem ✈️ passagens e 🏨 hospedagem, para você viver uma experiência cultural rica e vibrante. ✔️ Invista em memórias que valem mais que qualquer coisa. Planeje pelo WhatsApp: (99) 9 9999-9999\n\n🔥 Imagine você relaxando e aproveitando cada momento sem preocupações. Nosso pacote é pensado para você viver o melhor dessa viagem e colecionar momentos inesquecíveis!\n\n👇 Clique no link da BIO ou nos chame no WhatsApp para garantir seu pacote exclusivo agora!\n📲 (99) 9 9999-9999\\n\\n#ViajarÉInvestir #FériasPerfeitas #MomentosInesquecíveis",
    "drive_url": "https://drive.google.com/file/d/11Ea8Vvrgff2o7h-FKfeHpvmAPG6mnd4M/view?usp=drive_link"
  },
  {
    "title": "Bia (Destino dos sonhos)",
    "url": "https://www.canva.com/design/DAG2ShXwTgQ/TykqR0LrPfrflxz-arMk2A/view?utm_content=DAG2ShXwTgQ&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview",
    "type": "seasonal",
    "description": "✨ A aventura te espera com Bia (Destino dos sonhos)! ✈️🌍\\n\\n🔥 Nossos pacotes e conteúdos são criados para você colecionar momentos inesquecíveis sem preocupações.\\n\\n👇 Clique no link da BIO para aproveitar as melhores condições!\\n📲 (99) 9 9999-9999\\n\\n#Bia(Destinodossonhos) #ViagemPerfeita #AgenciaDeViagens"
  },
  {
    "title": "Bia (Natal em família)",
    "url": "https://www.canva.com/design/DAG2esOrpvA/dXYNi37HEi9FT98QlBWGrQ/view?utm_content=DAG2esOrpvA&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview",
    "type": "seasonal",
    "description": "✨ Descubra as maravilhas de Natal - RN! ✈️🌍\n\nCurta o calor em 3 paraísos: Natal - RN, Porto de Galinhas e Angra dos Reis! 🏖️☀️ Natal tem dunas incríveis e passeios de buggy em Genipabu, perfeitos para o verão. Nossos pacotes incluem ✈️ passagens e 🏨 hospedagem para você escolher seu destino favorito. ✔️ Três opções de praias paradisíacas para suas férias. Fale com a gente pelo WhatsApp: (99) 9 9999-9999\n\n🔥 Imagine você relaxando e aproveitando cada momento sem preocupações. Nosso pacote é pensado para você viver o melhor dessa viagem e colecionar momentos inesquecíveis!\n\n👇 Clique no link da BIO ou nos chame no WhatsApp para garantir seu pacote exclusivo agora!\n📲 (99) 9 9999-9999\\n\\n#DestinosDeVerão #ViajarÉViver"
  },
  {
    "title": "Bia (Pacote Completo)",
    "url": "https://www.canva.com/design/DAG2bL4Y8hQ/9i5oG8w_x6xY2b8hL4Y8hQ/view?utm_content=DAG2bL4Y8hQ&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview",
    "type": "seasonal",
    "description": "✨ A aventura te espera com Bia (Pacote Completo)! ✈️🌍\\n\\n🔥 Nossos pacotes e conteúdos são criados para você colecionar momentos inesquecíveis sem preocupações.\\n\\n👇 Clique no link da BIO para aproveitar as melhores condições!\\n📲 (99) 9 9999-9999\\n\\n#Bia(PacoteCompleto) #ViagemPerfeita #AgenciaDeViagens"
  },
  {
    "title": "Bia (Presente Natal)",
    "url": "https://www.canva.com/design/DAG2LaxD0w4/sfuP-w_Lqeo2hIn7NhT_6Q/view?utm_content=DAG2LaxD0w4&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview",
    "type": "seasonal",
    "description": "✨ Descubra as maravilhas de Natal - RN! ✈️🌍\n\nCurta o calor em 3 paraísos: Natal - RN, Porto de Galinhas e Angra dos Reis! 🏖️☀️ Natal tem dunas incríveis e passeios de buggy em Genipabu, perfeitos para o verão. Nossos pacotes incluem ✈️ passagens e 🏨 hospedagem para você escolher seu destino favorito. ✔️ Três opções de praias paradisíacas para suas férias. Fale com a gente pelo WhatsApp: (99) 9 9999-9999\n\n🔥 Imagine você relaxando e aproveitando cada momento sem preocupações. Nosso pacote é pensado para você viver o melhor dessa viagem e colecionar momentos inesquecíveis!\n\n👇 Clique no link da BIO ou nos chame no WhatsApp para garantir seu pacote exclusivo agora!\n📲 (99) 9 9999-9999\\n\\n#DestinosDeVerão #ViajarÉViver"
  },
  {
    "title": "Bia (Réveillon Rio)",
    "url": "https://www.canva.com/design/DAG2esOrpvA/dXYNi37HEi9FT98QlBWGrQ/view?utm_content=DAG2esOrpvA&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview",
    "type": "seasonal",
    "description": "✨ A aventura te espera com Bia (Réveillon Rio)! ✈️🌍\\n\\n🔥 Nossos pacotes e conteúdos são criados para você colecionar momentos inesquecíveis sem preocupações.\\n\\n👇 Clique no link da BIO para aproveitar as melhores condições!\\n📲 (99) 9 9999-9999\\n\\n#Bia(RéveillonRio) #ViagemPerfeita #AgenciaDeViagens"
  },
  {
    "title": "Bia Black Friday 2",
    "url": "https://www.canva.com/design/DAG2fD0RJF4/cFRDjOLIAPSHOM-C88saTw/view?utm_content=DAG2fD0RJF4&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview",
    "type": "seasonal",
    "description": "✨ A aventura te espera com Bia Black Friday 2! ✈️🌍\\n\\n🔥 Nossos pacotes e conteúdos são criados para você colecionar momentos inesquecíveis sem preocupações.\\n\\n👇 Clique no link da BIO para aproveitar as melhores condições!\\n📲 (99) 9 9999-9999\\n\\n#BiaBlackFriday2 #ViagemPerfeita #AgenciaDeViagens"
  },
  {
    "title": "Black Friday 35% Off",
    "url": "https://www.canva.com/design/DAG2ewQXkWs/ytL5S0yd5-feIUfWmn9SjA/view?utm_content=DAG2ewQXkWs&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview",
    "type": "seasonal",
    "description": "✨ A aventura te espera com Black Friday 35% Off! ✈️🌍\\n\\n🔥 Nossos pacotes e conteúdos são criados para você colecionar momentos inesquecíveis sem preocupações.\\n\\n👇 Clique no link da BIO para aproveitar as melhores condições!\\n📲 (99) 9 9999-9999\\n\\n#BlackFriday35%Off #ViagemPerfeita #AgenciaDeViagens"
  },
  {
    "title": "Carnaval Nordeste",
    "url": "https://www.canva.com/design/DAG2NTVWbtU/G1B3M23OhAgpJWIszRqdHw/view?utm_content=DAG2NTVWbtU&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview",
    "type": "seasonal",
    "description": "✨ A aventura te espera com Carnaval Nordeste! ✈️🌍\\n\\n🔥 Nossos pacotes e conteúdos são criados para você colecionar momentos inesquecíveis sem preocupações.\\n\\n👇 Clique no link da BIO para aproveitar as melhores condições!\\n📲 (99) 9 9999-9999\\n\\n#CarnavalNordeste #ViagemPerfeita #AgenciaDeViagens"
  },
  {
    "title": "Celebre o Natal",
    "url": "https://www.canva.com/design/DAG2LkHZ4Sk/_yTOsI7028OobGeEPyDGDA/view?utm_content=DAG2LkHZ4Sk&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview",
    "type": "seasonal",
    "description": "Curta o calor em 3 paraísos: Natal - RN, Porto de Galinhas e Angra dos Reis! 🏖️☀️ Natal tem dunas incríveis e passeios de buggy em Genipabu, perfeitos para o verão. Nossos pacotes incluem ✈️ passagens e 🏨 hospedagem para você escolher seu destino favorito.\n✔️ Três opções de praias paradisíacas para suas férias.\nFale com a gente pelo WhatsApp: (99) 9 9999-9999\n #DestinosDeVerão #ViajarÉViver",
    "drive_url": "https://drive.google.com/file/d/1vYhYavLpGaDnMdvti8tmHV_CAsv-MLNG/view?usp=drive_link"
  },
  {
    "title": "Eva - Black Friday",
    "url": "https://www.canva.com/design/DAG2fJqDKbI/FT7f4rvEJEpfQI7WT1E46Q/view?utm_content=DAG2fJqDKbI&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview",
    "type": "seasonal",
    "description": "✨ A aventura te espera com Eva - Black Friday! ✈️🌍\\n\\n🔥 Nossos pacotes e conteúdos são criados para você colecionar momentos inesquecíveis sem preocupações.\\n\\n👇 Clique no link da BIO para aproveitar as melhores condições!\\n📲 (99) 9 9999-9999\\n\\n#EvaBlackFriday #ViagemPerfeita #AgenciaDeViagens"
  },
  {
    "title": "Eva - Destinos Feriados",
    "url": "https://www.canva.com/design/DAG2e15f7q4/CwiKH8s1RN4IZDbZvYMsGg/view?utm_content=DAG2e15f7q4&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview",
    "type": "seasonal",
    "description": "✨ A aventura te espera com Eva - Destinos Feriados! ✈️🌍\\n\\n🔥 Nossos pacotes e conteúdos são criados para você colecionar momentos inesquecíveis sem preocupações.\\n\\n👇 Clique no link da BIO para aproveitar as melhores condições!\\n📲 (99) 9 9999-9999\\n\\n#EvaDestinosFeriados #ViagemPerfeita #AgenciaDeViagens"
  },
  {
    "title": "Eva - Feriados Viagens",
    "url": "https://www.canva.com/design/DAG2fJqDKbI/FT7f4rvEJEpfQI7WT1E46Q/view?utm_content=DAG2fJqDKbI&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview",
    "type": "seasonal",
    "description": "✨ A aventura te espera com Eva - Feriados Viagens! ✈️🌍\\n\\n🔥 Nossos pacotes e conteúdos são criados para você colecionar momentos inesquecíveis sem preocupações.\\n\\n👇 Clique no link da BIO para aproveitar as melhores condições!\\n📲 (99) 9 9999-9999\\n\\n#EvaFeriadosViagens #ViagemPerfeita #AgenciaDeViagens"
  },
  {
    "title": "Frase de Natal",
    "url": "https://www.canva.com/design/DAG2MP7UnZ8/B3FaakS8WlmUjEVdhGvBhw/view?utm_content=DAG2MP7UnZ8&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview",
    "type": "seasonal",
    "description": "Curta o calor em 3 paraísos: Natal - RN, Porto de Galinhas e Angra dos Reis! 🏖️☀️ Natal tem dunas incríveis e passeios de buggy em Genipabu, perfeitos para o verão. Nossos pacotes incluem ✈️ passagens e 🏨 hospedagem para você escolher seu destino favorito.\n✔️ Três opções de praias paradisíacas para suas férias.\nFale com a gente pelo WhatsApp: (99) 9 9999-9999\n #DestinosDeVerão #ViajarÉViver",
    "drive_url": "https://drive.google.com/file/d/1vYhYavLpGaDnMdvti8tmHV_CAsv-MLNG/view?usp=drive_link"
  },
  {
    "title": "Frase Réveillon",
    "url": "https://www.canva.com/design/DAG2MUhlXWc/kBvjZrgkKpeZLDoaipjxjw/view?utm_content=DAG2MUhlXWc&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview",
    "type": "seasonal",
    "description": "✨ A aventura te espera com Frase Réveillon! ✈️🌍\\n\\n🔥 Nossos pacotes e conteúdos são criados para você colecionar momentos inesquecíveis sem preocupações.\\n\\n👇 Clique no link da BIO para aproveitar as melhores condições!\\n📲 (99) 9 9999-9999\\n\\n#FraseRéveillon #ViagemPerfeita #AgenciaDeViagens"
  },
  {
    "title": "Mel (Black Friday)",
    "url": "https://www.canva.com/design/DAG2bL4Y8hQ/9i5oG8w_x6xY2b8hL4Y8hQ/view?utm_content=DAG2bL4Y8hQ&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview",
    "type": "seasonal",
    "description": "✨ A aventura te espera com Mel (Black Friday)! ✈️🌍\\n\\n🔥 Nossos pacotes e conteúdos são criados para você colecionar momentos inesquecíveis sem preocupações.\\n\\n👇 Clique no link da BIO para aproveitar as melhores condições!\\n📲 (99) 9 9999-9999\\n\\n#Mel(BlackFriday) #ViagemPerfeita #AgenciaDeViagens"
  },
  {
    "title": "Mel (Destinos Feriados)",
    "url": "https://www.canva.com/design/DAG2e15f7q4/CwiKH8s1RN4IZDbZvYMsGg/view?utm_content=DAG2e15f7q4&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview",
    "type": "seasonal",
    "description": "✨ A aventura te espera com Mel (Destinos Feriados)! ✈️🌍\\n\\n🔥 Nossos pacotes e conteúdos são criados para você colecionar momentos inesquecíveis sem preocupações.\\n\\n👇 Clique no link da BIO para aproveitar as melhores condições!\\n📲 (99) 9 9999-9999\\n\\n#Mel(DestinosFeriados) #ViagemPerfeita #AgenciaDeViagens"
  },
  {
    "title": "Mel (Semana Santa)",
    "url": "https://www.canva.com/design/DAG2bL4Y8hQ/9i5oG8w_x6xY2b8hL4Y8hQ/view?utm_content=DAG2bL4Y8hQ&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview",
    "type": "seasonal",
    "description": "✨ A aventura te espera com Mel (Semana Santa)! ✈️🌍\\n\\n🔥 Nossos pacotes e conteúdos são criados para você colecionar momentos inesquecíveis sem preocupações.\\n\\n👇 Clique no link da BIO para aproveitar as melhores condições!\\n📲 (99) 9 9999-9999\\n\\n#Mel(SemanaSanta) #ViagemPerfeita #AgenciaDeViagens"
  },
  {
    "title": "Mel - Black Friday Europa",
    "url": "https://www.canva.com/design/DAG2bL4Y8hQ/9i5oG8w_x6xY2b8hL4Y8hQ/view?utm_content=DAG2bL4Y8hQ&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview",
    "type": "seasonal",
    "description": "✨ Descubra as maravilhas de Cuzumel! ✈️🌍\n\nExplore Cuzumel com conforto e sem preocupações! 🏝️🌊 Esse paraíso mexicano é famoso pelos recifes de corais e mergulhos incríveis. Nosso pacote inclui 5 diárias, ✈️ passagens de ida e volta, transfer do aeroporto ao hotel e passeios exclusivos, por apenas R$1.500 por pessoa. ✔️ Uma viagem para relaxar e explorar o Caribe. Garanta sua viagem pelo WhatsApp: (99) 9 9999-9999\n\n🔥 Imagine você relaxando e aproveitando cada momento sem preocupações. Nosso pacote é pensado para você viver o melhor dessa viagem e colecionar momentos inesquecíveis!\n\n👇 Clique no link da BIO ou nos chame no WhatsApp para garantir seu pacote exclusivo agora!\n📲 (99) 9 9999-9999\\n\\n#DescubraCuzumel #PacotesDeViagem #FériasInesquecíveis"
  },
  {
    "title": "Mel - Feriado Páscoa",
    "url": "https://www.canva.com/design/DAG2ezMKhPE/l7CGJgr73Nb_sPiQ7SGvTw/view?utm_content=DAG2ezMKhPE&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview",
    "type": "seasonal",
    "description": "✨ Descubra as maravilhas de Cuzumel! ✈️🌍\n\nExplore Cuzumel com conforto e sem preocupações! 🏝️🌊 Esse paraíso mexicano é famoso pelos recifes de corais e mergulhos incríveis. Nosso pacote inclui 5 diárias, ✈️ passagens de ida e volta, transfer do aeroporto ao hotel e passeios exclusivos, por apenas R$1.500 por pessoa. ✔️ Uma viagem para relaxar e explorar o Caribe. Garanta sua viagem pelo WhatsApp: (99) 9 9999-9999\n\n🔥 Imagine você relaxando e aproveitando cada momento sem preocupações. Nosso pacote é pensado para você viver o melhor dessa viagem e colecionar momentos inesquecíveis!\n\n👇 Clique no link da BIO ou nos chame no WhatsApp para garantir seu pacote exclusivo agora!\n📲 (99) 9 9999-9999\\n\\n#DescubraCuzumel #PacotesDeViagem #FériasInesquecíveis"
  },
  {
    "title": "Mel - Viagens Feriados",
    "url": "https://www.canva.com/design/DAG2ewQXkWs/ytL5S0yd5-feIUfWmn9SjA/view?utm_content=DAG2ewQXkWs&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview",
    "type": "seasonal",
    "description": "✨ Descubra as maravilhas de Cuzumel! ✈️🌍\n\nExplore Cuzumel com conforto e sem preocupações! 🏝️🌊 Esse paraíso mexicano é famoso pelos recifes de corais e mergulhos incríveis. Nosso pacote inclui 5 diárias, ✈️ passagens de ida e volta, transfer do aeroporto ao hotel e passeios exclusivos, por apenas R$1.500 por pessoa. ✔️ Uma viagem para relaxar e explorar o Caribe. Garanta sua viagem pelo WhatsApp: (99) 9 9999-9999\n\n🔥 Imagine você relaxando e aproveitando cada momento sem preocupações. Nosso pacote é pensado para você viver o melhor dessa viagem e colecionar momentos inesquecíveis!\n\n👇 Clique no link da BIO ou nos chame no WhatsApp para garantir seu pacote exclusivo agora!\n📲 (99) 9 9999-9999\\n\\n#DescubraCuzumel #PacotesDeViagem #FériasInesquecíveis"
  },
  {
    "title": "Natal dos Sonhos",
    "url": "https://www.canva.com/design/DAG2LnOTuIA/6CltNCXcbKnxlObEPzB0eg/view?utm_content=DAG2LnOTuIA&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview",
    "type": "seasonal",
    "description": "Curta o calor em 3 paraísos: Natal - RN, Porto de Galinhas e Angra dos Reis! 🏖️☀️ Natal tem dunas incríveis e passeios de buggy em Genipabu, perfeitos para o verão. Nossos pacotes incluem ✈️ passagens e 🏨 hospedagem para você escolher seu destino favorito.\n✔️ Três opções de praias paradisíacas para suas férias.\nFale com a gente pelo WhatsApp: (99) 9 9999-9999\n #DestinosDeVerão #ViajarÉViver",
    "drive_url": "https://drive.google.com/file/d/1vYhYavLpGaDnMdvti8tmHV_CAsv-MLNG/view?usp=drive_link"
  },
  {
    "title": "Natal Gramado",
    "url": "https://www.canva.com/design/DAG2N5iiD_g/qSqV4BXxZNT629GfErS42A/view?utm_content=DAG2N5iiD_g&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview",
    "type": "seasonal",
    "description": "Evite surpresas no aeroporto ao viajar para Gramado! 🧳✈️ Confira dicas para não ter problemas com excesso de bagagem e curta o charme da Serra Gaúcha, com suas ruas floridas e o clima europeu. Nosso pacote inclui ✈️ passagens e 🏨 hospedagem.\n✔️ Viaje tranquilo e aproveite cada momento sem estresse.\nFale com a gente pelo WhatsApp: (99) 9 9999-9999\n#DicasDeViagem #ExcessoDeBagagem #ViagemSemEstresse",
    "drive_url": "https://drive.google.com/file/d/11L2RzID7XdutobpsEidXivyKsuumC2zs/view?usp=drive_link"
  },
  {
    "title": "Páscoa Relaxante",
    "url": "https://www.canva.com/design/DAG2N7dTofI/wJapsS0wfFGkYAVzUSm6hA/view?utm_content=DAG2N7dTofI&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview",
    "type": "seasonal",
    "description": "✨ A aventura te espera com Páscoa Relaxante! ✈️🌍\\n\\n🔥 Nossos pacotes e conteúdos são criados para você colecionar momentos inesquecíveis sem preocupações.\\n\\n👇 Clique no link da BIO para aproveitar as melhores condições!\\n📲 (99) 9 9999-9999\\n\\n#PáscoaRelaxante #ViagemPerfeita #AgenciaDeViagens"
  },
  {
    "title": "Réveillon Nacional",
    "url": "https://www.canva.com/design/DAG2M7BqCnk/YXHk02BfhrC5HyjO04Ji0w/view?utm_content=DAG2M7BqCnk&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview",
    "type": "seasonal",
    "description": "✨ A aventura te espera com Réveillon Nacional! ✈️🌍\\n\\n🔥 Nossos pacotes e conteúdos são criados para você colecionar momentos inesquecíveis sem preocupações.\\n\\n👇 Clique no link da BIO para aproveitar as melhores condições!\\n📲 (99) 9 9999-9999\\n\\n#RéveillonNacional #ViagemPerfeita #AgenciaDeViagens"
  },
  {
    "title": "Réveillon Rio",
    "url": "https://www.canva.com/design/DAG2N67Bnf0/k79e-9a0IrLHB5OHKo9JWw/view?utm_content=DAG2N67Bnf0&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview",
    "type": "seasonal",
    "description": "✨ A aventura te espera com Réveillon Rio! ✈️🌍\\n\\n🔥 Nossos pacotes e conteúdos são criados para você colecionar momentos inesquecíveis sem preocupações.\\n\\n👇 Clique no link da BIO para aproveitar as melhores condições!\\n📲 (99) 9 9999-9999\\n\\n#RéveillonRio #ViagemPerfeita #AgenciaDeViagens"
  },
  {
    "title": "Réveillon Viagem",
    "url": "https://www.canva.com/design/DAG2L3wN6BE/NVmirH2Ki59fgKEWBf0t3Q/view?utm_content=DAG2L3wN6BE&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview",
    "type": "seasonal",
    "description": "✨ A aventura te espera com Réveillon Viagem! ✈️🌍\\n\\n🔥 Nossos pacotes e conteúdos são criados para você colecionar momentos inesquecíveis sem preocupações.\\n\\n👇 Clique no link da BIO para aproveitar as melhores condições!\\n📲 (99) 9 9999-9999\\n\\n#RéveillonViagem #ViagemPerfeita #AgenciaDeViagens"
  },
  {
    "title": "África",
    "url": "https://www.canva.com/design/DAGgIEMmR_M/9f-k7CtYZlHsTYhCHkg/view?utm_content=DAGgIEMmR_M&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview",
    "type": "video",
    "description": "Explore a África sem gastar muito! 🦒📸 De safáris na Tanzânia a praias em Zanzibar, há opções para todos os bolsos. Dicas como viajar na baixa temporada e escolher hospedagens econômicas ajudam a curtir ao máximo.\n✔️ Aproveite sua próxima aventura africana com orçamento limitado.\nPlaneje pelo WhatsApp: (99) 9 9999-9999\n#ViajarComPouco #DicasDeViagem #ViagemEconomica",
    "drive_url": "https://drive.google.com/file/d/17Ofo4jAnLbnikaWetBAx6tJnvmjau_8q/view?usp=drive_link"
  },
  {
    "title": "Aruba",
    "url": "https://www.canva.com/design/DAGgIFd9l88/54j3J9Q23L8z0P4f-p_j1Q/view?utm_content=DAGgIFd9l88&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview",
    "type": "video",
    "description": "Viaje para Aruba com segurança! 🏖️✈️ Adicione o seguro bagagem ao seu pacote e proteja sua mala contra perdas ou extravios. Aruba é famosa pelas praias de Eagle Beach e pela vibe caribenha, perfeita para relaxar.\n✔️ Cobertura completa para curtir sem preocupações.\nAdicione ao seu pacote pelo WhatsApp: (99) 9 9999-9999\n#SeguroBagagem #ViagemTranquila #ViajarComSegurança",
    "drive_url": "https://drive.google.com/file/d/14Qetkp_UKJzEmhgR6phVqsUPt0qgFQEW/view?usp=drive_link"
  },
  {
    "title": "Bariloche",
    "url": "https://www.canva.com/design/DAGgICGduVA/AE_OxvSOWEEtHfPOD_4AWA/view?utm_content=DAGgICGduVA&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview",
    "type": "video",
    "description": "Planeje sua viagem para Bariloche sem preocupações! ❄️✈️ Conhecida pelas montanhas nevadas e chocolates artesanais, Bariloche é perfeita para o inverno. Nosso pacote inclui ✈️ passagens, 🏨 hospedagem e passeios para esquiar, em até 10x sem juros.\n✔️ Suporte personalizado para você curtir cada momento.\nFale conosco pelo WhatsApp: (99) 9 9999-9999\n#ViajarSemPreocupação #PacoteDeViagem #AgenciaDeViagens",
    "drive_url": "https://drive.google.com/file/d/13lituNWpsQYcVpH-B2iBYWaYMZHAFZiP/view?usp=drive_link"
  },
  {
    "title": "Boston",
    "url": "https://www.canva.com/design/DAGgIGMu4RE/Tnp3KV3JhHKDaxuoPwunBQ/view?utm_content=DAGgIGMu4RE&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview",
    "type": "video",
    "description": "Curta dias de sol em Boston! 🏛️✨ Explore a Freedom Trail e o charme histórico dessa cidade americana. Nossos pacotes especiais incluem ✈️ passagens, 🏨 hospedagem e passeios, com facilidade de pagamento para tornar sua viagem ainda mais tranquila.\n✔️ Uma aventura inesquecível te espera na Nova Inglaterra.\nGaranta sua vaga pelo WhatsApp: (99) 9 9999-9999\n#PartiuBoston #ViagemDosSonhos #FériasIncríveis",
    "drive_url": "https://drive.google.com/file/d/17CJOrapIBVZl5PoVHAvOU4PPT4NsJIjh/view?usp=drive_link"
  },
  {
    "title": "Bruxelas",
    "url": "https://www.canva.com/design/DAGgIHM3a8A/8sTBGWxCgx5a_V33JtFu_A/view?utm_content=DAGgIHM3a8A&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview",
    "type": "video",
    "description": "Passaporte vencido antes de ir para Bruxelas? 🛂✈️ Não se preocupe! Saiba como resolver rapidamente: renove com antecedência e verifique as exigências do destino. Bruxelas é famosa pelo chocolate e pela Grand Place, um destino imperdível.\n✔️ Planeje com antecedência e evite problemas no embarque.\nFale com a gente pelo WhatsApp: (99) 9 9999-9999\n#PassaporteVencido #DicasDeViagem #PlanejamentoDeViagem"
  },
  {
    "title": "Budapeste",
    "url": "https://www.canva.com/design/DAGkxkJV9sU/D72AYyJxa27ztlbkzrRHzg/view?utm_content=DAGkxkJV9sU&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview",
    "type": "video",
    "description": "Transforme seus sonhos em realidade em Budapeste! 🏰✨ Conhecida pelo Parlamento e pelas termas, Budapeste é perfeita para quem ama história e relaxamento. Nossos pacotes personalizados incluem ✈️ passagens, 🏨 hospedagem e passeios para explorar a cidade.\n✔️ Uma viagem para se encantar com a Europa Oriental.\nPlaneje sua aventura pelo WhatsApp: (99) 9 9999-9999\n#ExplorarOMundo #ViagemSemComplicação #AgenciaDeViagens",
    "drive_url": "https://drive.google.com/file/d/14CUIscnbzCX9DM1Ui9CRWiGG6Px2uVwd/view?usp=drive_link"
  },
  {
    "title": "Cancún",
    "url": "https://www.canva.com/design/DAGleD4ewV0/h6k2V1slWWhWMjBOb6RqvA/view?utm_content=DAGleD4ewV0&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview",
    "type": "video",
    "description": "Nossos clientes amam suas viagens para Cancún! 🏖️✨ Com praias de areia branca e águas turquesas, Cancún é um paraíso no México. Trabalhamos para garantir que cada experiência seja única, com ✈️ passagens e 🏨 hospedagem inclusas.\n✔️ Faça parte dessas histórias de sucesso e viva o Caribe.\nPlaneje sua viagem pelo WhatsApp: (99) 9 9999-9999\n#FeedbackDeClientes #ViagemIncrível #SatisfaçãoGarantida",
    "drive_url": "https://drive.google.com/file/d/12RpuACuT0MGESYXOxra0kRm291OLXBtz/view?usp=drive_link"
  },
  {
    "title": "Capadócia",
    "url": "https://www.canva.com/design/DAGgIMYGeUo/hNOn3acstET00eZMSZevCQ/view?utm_content=DAGgIMYGeUo&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview",
    "type": "video",
    "description": "Busca aventura na Capadócia? 🎈✨ Conhecida pelos passeios de balão e pelas formações rochosas únicas, a Capadócia é perfeita para quem ama emoção. Nossos pacotes cheios de adrenalina incluem ✈️ passagens e hospedagem, a partir de 10x de R$190,00.\n✔️ Um destino para explorar e se divertir ao máximo.\nGaranta sua vaga pelo WhatsApp: (99) 9 9999-9999\n#DestinoDeAventura #PacotesDeViagem #ViagemAventura",
    "drive_url": "https://drive.google.com/file/d/11joLZdCBVZ7MkrXEqRVgoR76vJ4SpdpX/view?usp=drive_link"
  },
  {
    "title": "Chicago",
    "url": "https://www.canva.com/design/DAGgIEv81n8/16sFv3o7t2n_95k022u8_A/view?utm_content=DAGgIEv81n8&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview",
    "type": "video",
    "description": "Não deixe seus sonhos de viagem para Chicago para depois! 🏙️✨ Conhecida pela arquitetura e pela pizza deep-dish, Chicago é um destino vibrante. Nossos pacotes personalizados incluem ✈️ passagens, 🏨 hospedagem e passeios, com facilidade no pagamento.\n✔️ Ofertas especiais para você explorar essa cidade incrível.\nFale com a gente pelo WhatsApp: (99) 9 9999-9999\n#ViajeMaisVivaMais #PacotesDeViagem #FériasDosSonhos",
    "drive_url": "https://drive.google.com/file/d/176Y8TsXip9DhhKgtoxWDJ3i27nzvS599/view?usp=drive_link"
  },
  {
    "title": "Cozumel",
    "url": "https://www.canva.com/design/DAGgIGpU45c/L2mK-u75F_cQ_i-q1R2D6w/view?utm_content=DAGgIGpU45c&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview",
    "type": "video",
    "description": "✨ A aventura te espera com Cozumel! ✈️🌍\\n\\n🔥 Nossos pacotes e conteúdos são criados para você colecionar momentos inesquecíveis sem preocupações.\\n\\n👇 Clique no link da BIO para aproveitar as melhores condições!\\n📲 (99) 9 9999-9999\\n\\n#Cozumel #ViagemPerfeita #AgenciaDeViagens",
    "drive_url": "https://drive.google.com/file/d/12kazChdZyF0deFFzuIZ1Cq2Dj8d7rYsp/view?usp=drive_link"
  },
  {
    "title": "Cusco",
    "url": "https://www.canva.com/design/DAGgIH1_gY8/11l8w_5g_5v_7y_7x_8o_A/view?utm_content=DAGgIH1_gY8&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview",
    "type": "video",
    "description": "Prepare-se para Cusco! 🏔️🧳 Saiba como agir se sua bagagem for extraviada: informe a companhia aérea, tenha o comprovante de despacho e contrate um seguro viagem. Cusco é a porta de entrada para Machu Picchu, com história e cultura incríveis.\n✔️ Dicas para resolver imprevistos e curtir sua viagem.\nFale com a gente pelo WhatsApp: (99) 9 9999-9999\n#DicasDeViagem #BagagemExtraviada #ViagemSemEstresse",
    "drive_url": "https://drive.google.com/file/d/13lnK_smqj5kU7ukYH21H6bKs1hXyWkH9/view?usp=drive_link"
  },
  {
    "title": "DISNEY",
    "url": "https://www.canva.com/design/DAG2LCX13mE/xUzLv91eUXUH_vWak40iaA/view?utm_content=DAG2LCX13mE&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview",
    "type": "video",
    "description": "✨ A aventura te espera com DISNEY! ✈️🌍\\n\\n🔥 Nossos pacotes e conteúdos são criados para você colecionar momentos inesquecíveis sem preocupações.\\n\\n👇 Clique no link da BIO para aproveitar as melhores condições!\\n📲 (99) 9 9999-9999\\n\\n#DISNEY #ViagemPerfeita #AgenciaDeViagens"
  },
  {
    "title": "Dublin",
    "url": "https://www.canva.com/design/DAGgIAhaqtE/12aTG-FlJoUZgKv6eYjfYQ/view?utm_content=DAGgIAhaqtE&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview",
    "type": "video",
    "description": "Viaje sozinho para Dublin com segurança! 🍀✨ Conhecida pelos pubs e pela cultura celta, Dublin é perfeita para uma aventura solo. Confira dicas essenciais para uma jornada tranquila, como escolher hostels seguros e planejar seu roteiro.\n✔️ Salve essas dicas e curta sua viagem com confiança.\nPlaneje sua aventura pelo WhatsApp: (99) 9 9999-9999\n#DicasDeSegurança #ViajarSozinho #ViagemSegura"
  },
  {
    "title": "Egito",
    "url": "https://www.canva.com/design/DAGgIH1_gY8/11l8w_5g_5v_7y_7x_8o_A/view?utm_content=DAGgIH1_gY8&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview",
    "type": "video",
    "description": "Aproveite dias incríveis no Egito! 🏜️✨ Conheça as Pirâmides de Gizé e o Rio Nilo com nosso pacote para 2 adultos, que inclui ✈️ passagens, 🏨 hospedagem e passeios guiados, a partir de 10x de R$150,00.\n✔️ Uma viagem histórica cheia de descanso e descobertas.\nGaranta sua vaga pelo WhatsApp: (99) 9 9999-9999\n#ExcursãoEgito #ÚltimasVagas #FériasPerfeitas",
    "drive_url": "https://drive.google.com/file/d/12JM1Bxbqx7UPxIVdRLHNBIApQLJAyIIp/view?usp=drive_link"
  },
  {
    "title": "Filipinas",
    "url": "https://www.canva.com/design/DAGgIE0GMEg/nMMdOVIYmO1IUpw4vOLmQg/view?utm_content=DAGgIE0GMEg&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview",
    "type": "video",
    "description": "Faça uma viagem rápida e econômica para as Filipinas! 🏖️✈️ Conhecidas pelas praias de Boracay e Palawan, as Filipinas são um destino dos sonhos. Nosso pacote inclui ✈️ passagens aéreas de ida e volta de São Paulo, por apenas R$520,00.\n✔️ Conforto e tranquilidade para explorar esse paraíso asiático.\nGaranta sua passagem pelo WhatsApp: (99) 9 9999-9999\n#ViagemEconomica #PassagensAéreas #Filipinas",
    "drive_url": "https://drive.google.com/file/d/12XPKOUI1PYH1Wv9QRFcZ5DjWrrNx_5Bc/view?usp=drive_link"
  },
  {
    "title": "Fort Lauderdale",
    "url": "https://www.canva.com/design/DAGgIAhaqtE/12aTG-FlJoUZgKv6eYjfYQ/view?utm_content=DAGgIAhaqtE&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview",
    "type": "video",
    "description": "Viaje para Fort Lauderdale com conforto! 🏖️✈️ Leve travesseiro de pescoço, vista roupas leves e hidrate-se durante o voo para aproveitar ao máximo. Conhecida como a \"Veneza da América\", Fort Lauderdale tem canais e praias lindas.\n✔️ Dicas para um voo tranquilo e uma viagem inesquecível.\nPlaneje pelo WhatsApp: (99) 9 9999-9999\n#DicasDeViagem #ConfortoNosVoos #VooConfortável",
    "drive_url": "https://drive.google.com/file/d/11lI17jUd0UAEegy80UKB6rCu2mynLkc1/view?usp=drive_link"
  },
  {
    "title": "Grécia",
    "url": "https://www.canva.com/design/DAGgIGpU45c/L2mK-u75F_cQ_i-q1R2D6w/view?utm_content=DAGgIGpU45c&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview",
    "type": "video",
    "description": "Planeje sua viagem dos sonhos para a Grécia! 🏛️✨ Com ilhas como Santorini e Mykonos, a Grécia é perfeita para quem ama história e praias. Nossos pacotes personalizados incluem ✈️ passagens, 🏨 hospedagem e passeios, com parcelamento em até 12x.\n✔️ Um destino incrível para relaxar e explorar.\nFale com a gente pelo WhatsApp: (99) 9 9999-9999\n#ExplorarOMundo #PacotesDeViagem #FériasPerfeitas",
    "drive_url": "https://drive.google.com/file/d/12w7XtopwQlCFeq5dAVx8b_6YTPkGVru_/view?usp=drive_link"
  },
  {
    "title": "Israel",
    "url": "https://www.canva.com/design/DAGgIEv81n8/16sFv3o7t2n_95k022u8_A/view?utm_content=DAGgIEv81n8&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview",
    "type": "video",
    "description": "Evite erros ao planejar sua viagem para Israel! 🏛️✈️ Conhecido pela história de Jerusalém e pelo Mar Morto, Israel é um destino único. Confira dicas para uma jornada sem dores de cabeça, com ✈️ passagens e 🏨 hospedagem organizadas por nós.\n✔️ Viaje com mais segurança e aproveite cada momento.\nPlaneje pelo WhatsApp: (99) 9 9999-9999\n#DicasDeViagem #ViagemInternacional #ViajarSemEstresse",
    "drive_url": "https://drive.google.com/file/d/13YP7q3sD2sUsdzothWCmbhFmfK1X8U7A/view?usp=drive_link"
  },
  {
    "title": "Jordânia",
    "url": "https://www.canva.com/design/DAGgIFd9l88/54j3J9Q23L8z0P4f-p_j1Q/view?utm_content=DAGgIFd9l88&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview",
    "type": "video",
    "description": "Planeje sua primeira aventura como mochileiro em Jordânia! 🏜️🧳 Conhecida por Petra e pelo deserto de Wadi Rum, Jordânia é um destino épico. Dicas como levar uma mochila leve e reservar passeios guiados garantem uma viagem sem estresse.\n✔️ Um guia essencial para começar sua jornada.\nSalve e planeje pelo WhatsApp: (99) 9 9999-9999\n#MochileirosDePrimeiraViagem #DicasDeMochileiro #AventuraPeloMundo",
    "drive_url": "https://drive.google.com/file/d/13FoBEspFXJhDTEuWzIRX3sC3h3kXmmZE/view?usp=drive_link"
  },
  {
    "title": "Lima",
    "url": "https://www.canva.com/design/DAGgIABwarE/NZnn5WxJGQOvbzt2lS70KA/view?utm_content=DAGgIABwarE&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview",
    "type": "video",
    "description": "Viajar para Lima é colecionar momentos inesquecíveis! 🍽️✨ Conhecida pela gastronomia premiada e pelo centro histórico, Lima é um destino vibrante. Nossos pacotes oferecem ✈️ passagens e 🏨 hospedagem para você viver uma experiência cultural única.\n✔️ Invista em memórias que valem mais que qualquer coisa.\nPlaneje pelo WhatsApp: (99) 9 9999-9999\n#ViajarÉInvestir #FériasPerfeitas #MomentosInesquecíveis",
    "drive_url": "https://drive.google.com/file/d/16zxunOAHFxDW6fk8Ik2zo5-hOTWPq3dz/view?usp=drive_link"
  },
  {
    "title": "Machu Picchu",
    "url": "https://www.canva.com/design/DAGgIFd9l88/54j3J9Q23L8z0P4f-p_j1Q/view?utm_content=DAGgIFd9l88&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview",
    "type": "video",
    "description": "Viaje de avião para Machu Picchu pela primeira vez! 🏔️✈️ Chegue cedo ao aeroporto, siga as regras de bagagem e relaxe durante o voo. Machu Picchu é uma das 7 Maravilhas do Mundo, com ruínas incas que vão te encantar.\n✔️ Dicas para curtir a experiência e explorar esse destino histórico.\nFale com a gente pelo WhatsApp: (99) 9 9999-9999\n#PrimeiraViagem #DicasDeViagem #ViajarDeAvião"
  },
  {
    "title": "Maldivas",
    "url": "https://www.canva.com/design/DAGgIDyBNgg/iqZtppBAHjRERXni8aH7Uw/view?utm_content=DAGgIDyBNgg&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview",
    "type": "video",
    "description": "Reduza o estresse nas Maldivas! 🏝️✨ Com bangalôs sobre o mar e águas cristalinas, esse destino é perfeito para relaxar. Nosso pacote inclui ✈️ passagens e 🏨 hospedagem, para você desconectar e conhecer a cultura local.\n✔️ Uma viagem para renovar as energias e se encantar.\nPlaneje agora pelo WhatsApp: (99) 9 9999-9999\n#ViajarÉViver #ReduçãoDoEstresse #ExplorandoNovasCulturas",
    "drive_url": "https://drive.google.com/file/d/1KgDLZBTbhtxKBwmPHCwdsMtknBv3O3JQ/view?usp=drive_link"
  },
  {
    "title": "Montevidéu",
    "url": "https://www.canva.com/design/DAGgIEv81n8/16sFv3o7t2n_95k022u8_A/view?utm_content=DAGgIEv81n8&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview",
    "type": "video",
    "description": "Proporcione uma experiência mágica em Montevidéu! 🏙️✨ A capital uruguaia tem um charme único, com a Rambla, o Mercado del Puerto e o centro histórico. Nosso pacote em até 12x sem juros inclui ✈️ passagens, 🏨 hospedagem e passeios para conhecer a cidade.\n✔️ Viva momentos únicos nesse destino sul-americano.\nGaranta seu pacote pelo WhatsApp: (99) 9 9999-9999\n#Montevidéu #FériasInternacionais #MagiaDaViagem"
  },
  {
    "title": "Namíbia",
    "url": "https://www.canva.com/design/DAGkxaKBTk8/vnaegHxIpjNZhs7iXhEyQA/view?utm_content=DAGkxaKBTk8&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview",
    "type": "video",
    "description": "Celebre o Dia do Turista em Namíbia! 🏜️📸 Explore desertos como o Namib, safáris com elefantes e a cultura local única. Nossos pacotes oferecem ✈️ passagens e 🏨 hospedagem para você viver aventuras inesquecíveis nesse destino africano.\n✔️ O mundo é cheio de descobertas para viajantes apaixonados.\nPlaneje sua viagem pelo WhatsApp: (99) 9 9999-9999\n#DiaDoTurista #ExplorarOMundo #FériasInesquecíveis"
  },
  {
    "title": "New York",
    "url": "https://www.canva.com/design/DAGgIBHfJ2U/qla_d-c4Ka9R9mknJp9-Qw/view?utm_content=DAGgIBHfJ2U&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview",
    "type": "video",
    "description": "Desconecte-se em New York! 🏙️✨ A Big Apple tem atrações como a Times Square, o Central Park e a Estátua da Liberdade. Nosso pacote especial inclui 5 noites para 2 adultos, ✈️ passagens aéreas e traslados, por 10x de R$450,00.\n✔️ Um destino vibrante para viver momentos inesquecíveis.\nReserve agora pelo WhatsApp: (99) 9 9999-9999\n#NewYork #DestinoDosSonhos #FériasPerfeitas"
  },
  {
    "title": "Nova Zelândia",
    "url": "https://www.canva.com/design/DAGgINGc6Z8/OsM-5OopG49o8mN0rd0RMg/view?utm_content=DAGgINGc6Z8&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview",
    "type": "video",
    "description": "Encante-se com a Nova Zelândia! 🏔️✨ Com paisagens de tirar o fôlego, como os fiordes de Milford Sound e as locações de \"O Senhor dos Anéis\", esse destino é um sonho. Nosso pacote em até 10x de R$850,00 inclui ✈️ passagens e 🏨 hospedagem.\n✔️ Uma viagem para explorar a natureza e a cultura Maori.\nGaranta sua viagem pelo WhatsApp: (99) 9 9999-9999\n#NovaZelândia #PacotesDeViagem #FériasNaNatureza"
  },
  {
    "title": "Orlando",
    "url": "https://www.canva.com/design/DAGgIPVEnEk/wbm0-iA2_9PQ2cCOmJ6bAw/view?utm_content=DAGgIPVEnEk&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview",
    "type": "video",
    "description": "Relaxe em Orlando com nossos pacotes perfeitos! 🎢✨ Conhecida pelos parques da Disney e Universal, Orlando é ideal para famílias e amantes de diversão. Nosso pacote inclui ✈️ passagens, 🏨 hospedagem e ingressos, com parcelamento no boleto.\n✔️ Um destino mágico para criar memórias inesquecíveis.\nFale com a gente pelo WhatsApp: (99) 9 9999-9999\n#PlanejeSuasFérias #PacotesImperdíveis #FériasDosSonhos"
  },
  {
    "title": "Paris",
    "url": "https://www.canva.com/design/DAGgIGpU45c/L2mK-u75F_cQ_i-q1R2D6w/view?utm_content=DAGgIGpU45c&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview",
    "type": "video",
    "description": "Viaje sozinho para Paris com segurança! 🗼✨ Conhecida pela Torre Eiffel e pelos cafés, Paris é perfeita para uma aventura solo. Confira dicas essenciais para uma jornada tranquila, como escolher hotéis seguros e planejar seu roteiro.\n✔️ Salve essas dicas e curta sua viagem com confiança.\nPlaneje sua aventura pelo WhatsApp: (99) 9 9999-9999\n#DicasDeSegurança #ViajarSozinho #ViagemSegura"
  },
  {
    "title": "Phi Phi",
    "url": "https://www.canva.com/design/DAGgIHM3a8A/8sTBGWxCgx5a_V33JtFu_A/view?utm_content=DAGgIHM3a8A&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview",
    "type": "video",
    "description": "Suas férias estão chegando, e Phi Phi te espera! 🏝️✨ Conhecida pelas águas cristalinas e falésias, Phi Phi é um paraíso na Tailândia. Nosso pacote inclui ✈️ passagens, 🏨 hospedagem e passeios de barco para explorar as ilhas, tudo organizado para você.\n✔️ Não deixe para última hora e garanta uma viagem perfeita.\nFale agora pelo WhatsApp: (99) 9 9999-9999\n#PlanejeSuasFérias #ViagemSemEstresse #FériasPerfeitas",
    "drive_url": "https://drive.google.com/file/d/1715AG9DS8x04gPYkyagsNRpZpBVf5b52/view?usp=drive_link"
  },
  {
    "title": "Pisa",
    "url": "https://www.canva.com/design/DAGgIEMmR_M/9f-k7CtYZlHsTYhCHkg/view?utm_content=DAGgIEMmR_M&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview",
    "type": "video",
    "description": "Descubra Pisa e viva experiências únicas! 🏛️✨ Conhecida pela Torre Inclinada e pela Piazza dei Miracoli, Pisa é um destino cheio de história. Nosso pacote inclui ✈️ passagens, 🏨 hospedagem e passeios para explorar a cidade e arredores, como Florença.\n✔️ Uma viagem para se encantar com a Itália.\nEntre em contato pelo WhatsApp: (99) 9 9999-9999\n#ViajarÉViver #MagiaDosDestinos #FériasInesquecíveis"
  },
  {
    "title": "Praga",
    "url": "https://www.canva.com/design/DAGgIH1_gY8/11l8w_5g_5v_7y_7x_8o_A/view?utm_content=DAGgIH1_gY8&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview",
    "type": "video",
    "description": "Descubra Praga com pacotes exclusivos! 🏰✨ Conhecida pela Ponte Carlos e pelo Castelo de Praga, essa cidade é um conto de fadas. Nossos pacotes oferecem ✈️ passagens, 🏨 hospedagem e passeios, com preços acessíveis e suporte completo.\n✔️ Condições facilitadas para todos os perfis de viajantes.\nPlaneje sua viagem pelo WhatsApp: (99) 9 9999-9999\n#DescubraOMundo #ViajeComEstilo #AgenciaDeViagens",
    "drive_url": "https://drive.google.com/file/d/173n8iP4v75kIDj_NPucHRP4oOUXPKwZa/view?usp=drive_link"
  },
  {
    "title": "Punta Cana",
    "url": "https://www.canva.com/design/DAGgIKZu79g/cML-09vBKb9uzoxMLro2sA/view?utm_content=DAGgIKZu79g&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview",
    "type": "video",
    "description": "Está na hora de planejar suas férias dos sonhos em Punta Cana! 🏖️✨ Com resorts all-inclusive e praias de areia branca, esse destino é perfeito para relaxar. Nosso pacote inclui ✈️ passagens, 🏨 hospedagem e traslados, por 10x de R$450,00.\n✔️ Um paraíso caribenho para descansar e se divertir.\nGaranta seu pacote pelo WhatsApp: (99) 9 9999-9999\n#ViajarÉViver #PuntaCanaDream #AgenciaDeViagens"
  },
  {
    "title": "Salar de Uyuni",
    "url": "https://www.canva.com/design/DAGgIMYGeUo/hNOn3acstET00eZMSZevCQ/view?utm_content=DAGgIMYGeUo&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview",
    "type": "video",
    "description": "Escolha o destino perfeito para Salar de Uyuni! 🏜️📸 O maior deserto de sal do mundo é ideal para fotos incríveis e paisagens surreais. Nossa equipe te ajuda a planejar a viagem dos sonhos, com ✈️ passagens e 🏨 hospedagem inclusas.\n✔️ Um lugar para relaxar, explorar ou se aventurar.\nFale com a gente pelo WhatsApp: (99) 9 9999-9999\n#DestinoIdeal #PlanejeSuaViagem #FériasDosSonhos",
    "drive_url": "https://drive.google.com/file/d/14lfWkvHalF4KKFP1YEYrVok_NJgr7Rbf/view?usp=drive_link"
  },
  {
    "title": "São Francisco",
    "url": "https://www.canva.com/design/DAGgICJnnqQ/bmbU2kAUJFJUYIf2woRW3g/view?utm_content=DAGgICJnnqQ&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview",
    "type": "video",
    "description": "Embarque em um cruzeiro completo por São Francisco! 🚤✨ Navegue pela Baía de São Francisco, com vista para a Golden Gate, e desfrute de gastronomia e atividades a bordo. Nosso pacote inclui tudo: alimentação, passeios e hospedagem, com parcelamento facilitado.\n✔️ Uma experiência única para explorar a costa da Califórnia.\nReserve pelo WhatsApp: (99) 9 9999-9999\n#CruzeiroDosSonhos #EmbarqueJá #FériasInesquecíveis"
  },
  {
    "title": "Singapura",
    "url": "https://www.canva.com/design/DAGgINGc6Z8/OsM-5OopG49o8mN0rd0RMg/view?utm_content=DAGgINGc6Z8&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview",
    "type": "video",
    "description": "Sonha com Singapura? 🏙️✨ Conhecida pela modernidade de Marina Bay Sands e pelos Gardens by the Bay, Singapura é um destino futurista. Nosso pacote a partir de R$5.000 inclui ✈️ passagens, 🏨 hospedagem e passeios para explorar a cidade.\n✔️ Uma experiência de tranquilidade e beleza urbana.\nGaranta sua viagem pelo WhatsApp: (99) 9 9999-9999\n#Singapura #DestinoDosSonhos #FériasNoParaíso"
  },
  {
    "title": "Suiça",
    "url": "https://www.canva.com/design/DAGgIFd9l88/54j3J9Q23L8z0P4f-p_j1Q/view?utm_content=DAGgIFd9l88&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview",
    "type": "video",
    "description": "✨ A aventura te espera com Suiça! ✈️🌍\\n\\n🔥 Nossos pacotes e conteúdos são criados para você colecionar momentos inesquecíveis sem preocupações.\\n\\n👇 Clique no link da BIO para aproveitar as melhores condições!\\n📲 (99) 9 9999-9999\\n\\n#Suiça #ViagemPerfeita #AgenciaDeViagens"
  },
  {
    "title": "Taiwan",
    "url": "https://www.canva.com/design/DAGgICx70m4/6gpner1Xp3SaWs5zhm8fnQ/view?utm_content=DAGgICx70m4&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview",
    "type": "video",
    "description": "Cada aventura em Taiwan faz parte de quem somos! 🏯📸 Conhecida pela modernidade de Taipei e pela cultura tradicional, Taiwan é um destino fascinante. Nossos pacotes incluem ✈️ passagens e 🏨 hospedagem para você criar histórias inesquecíveis.\n✔️ Viva experiências únicas nesse destino asiático.\nPlaneje agora pelo WhatsApp: (99) 9 9999-9999\n#ViajarÉViver #MemóriasInesquecíveis #AventuraEDescoberta"
  },
  {
    "title": "Ushuaia",
    "url": "https://www.canva.com/design/DAGgIOfB964/Pt9ixDYkUe4pHBxt9U_L8g/view?utm_content=DAGgIOfB964&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview",
    "type": "video",
    "description": "Saia da rotina em Ushuaia! ❄️✈️ Conhecida como o \"Fim do Mundo\", Ushuaia é perfeita para quem ama frio e paisagens glaciais. Nossos pacotes a partir de 10x de R$150,00 incluem ✈️ passagens, 🏨 hospedagem e passeios como o Trem do Fim do Mundo.\n✔️ Um destino único para sua próxima aventura.\nPlaneje agora pelo WhatsApp: (99) 9 9999-9999\n#NovosDestinos #PacotesDeViagem #ExplorarOMundo"
  },
  {
    "title": "Washington",
    "url": "https://www.canva.com/design/DAGgIDWqY5E/A96uH3kJXwqZiWTr51nXRg/view?utm_content=DAGgIDWqY5E&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview",
    "type": "video",
    "description": "Viaje para Washington com segurança! 🏛️✈️ Pesquise sobre o destino, use serviços oficiais como táxis credenciados e evite sacar grandes quantias de dinheiro. Washington tem museus incríveis e monumentos como o Lincoln Memorial.\n✔️ Dicas para uma viagem tranquila e sem golpes.\nPlaneje pelo WhatsApp: (99) 9 9999-9999\n#DicasDeViagem #GolpesContraTuristas #ViagemSegura"
  },
  {
    "title": "Amsterdã",
    "url": "https://www.canva.com/design/DAGgIR3Uj_s/J7DMRsphXv0alSR7Pdb9eg/view?utm_content=DAGgIR3Uj_s&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview",
    "type": "video",
    "description": "Evite surpresas no aeroporto ao viajar para Amsterdã! 🧳✈️ Confira dicas para não ter problemas com excesso de bagagem e curta os canais, os museus como o Van Gogh e as tulipas holandesas. Nosso pacote inclui ✈️ passagens e 🏨 hospedagem.\n✔️ Viaje tranquilo e aproveite cada momento sem estresse.\nFale com a gente pelo WhatsApp: (99) 9 9999-9999\n#DicasDeViagem #ExcessoDeBagagem #ViagemSemEstresse",
    "drive_url": "https://drive.google.com/file/d/14lt3EasFTVCE_WbRidGQxemKoMIb8G9-/view?usp=drive_link"
  },
  {
    "title": "Amsterdã 2",
    "url": "https://www.canva.com/design/DAGgIcmzY_E/r3WQBPg9qcEiHDFe-b-TCg/view?utm_content=DAGgIcmzY_E&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview",
    "type": "video",
    "description": "Evite surpresas no aeroporto ao viajar para Amsterdã! 🧳✈️ Confira dicas para não ter problemas com excesso de bagagem e curta os canais, os museus como o Van Gogh e as tulipas holandesas. Nosso pacote inclui ✈️ passagens e 🏨 hospedagem.\n✔️ Viaje tranquilo e aproveite cada momento sem estresse.\nFale com a gente pelo WhatsApp: (99) 9 9999-9999\n#DicasDeViagem #ExcessoDeBagagem #ViagemSemEstresse",
    "drive_url": "https://drive.google.com/file/d/14lt3EasFTVCE_WbRidGQxemKoMIb8G9-/view?usp=drive_link"
  },
  {
    "title": "Atenas",
    "url": "https://www.canva.com/design/DAGgIVLFL6c/sN4xUOkZJTbGJ5vZ6kQ18Q/view?utm_content=DAGgIVLFL6c&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview",
    "type": "video",
    "description": "Proporcione uma experiência mágica em Atenas! 🏛️✨ Conhecida pela Acrópole e pela história grega, Atenas é um destino fascinante. Nosso pacote em até 12x sem juros inclui ✈️ passagens, 🏨 hospedagem e passeios para conhecer a cidade.\n✔️ Viva momentos únicos nesse destino histórico.\nGaranta seu pacote pelo WhatsApp: (99) 9 9999-9999\n#Atenas #FériasInternacionais #MagiaDaViagem",
    "drive_url": "https://drive.google.com/file/d/14UQcXCy5m5KruQryEqeR-S2Y36bPUYVa/view?usp=drive_link"
  },
  {
    "title": "Bali",
    "url": "https://www.canva.com/design/DAGgIBc0onY/x4vLLY939_RdIrA4XICf5w/view?utm_content=DAGgIBc0onY&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview",
    "type": "video",
    "description": "Desbrave Bali com pacotes a partir de R$9.500! 🏝️✨ Com templos como Uluwatu e praias paradisíacas, Bali é um destino internacional incrível. Nosso pacote inclui ✈️ passagens, 🏨 hospedagem e passeios para conhecer a cultura balinesa.\n✔️ Uma viagem para relaxar e se conectar com a natureza.\nFale com a gente pelo WhatsApp: (99) 9 9999-9999\n#ExploreOMundo #PacotesInternacionais #FériasIncríveis",
    "drive_url": "https://drive.google.com/file/d/13nE_5UouaL2uuX6KwnjFyzjd3X3wY_EU/view?usp=drive_link"
  },
  {
    "title": "Bangkok",
    "url": "https://www.canva.com/design/DAGgIeC0clw/AowfyjEsUwNBiOEGmYqUTw/view?utm_content=DAGgIeC0clw&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview",
    "type": "video",
    "description": "Sonha com Bangkok? 🏯✨ Conhecida pelos templos como o Wat Arun e pelos mercados flutuantes, Bangkok é um destino vibrante. Nosso pacote a partir de R$2.500 inclui ✈️ passagens, 🏨 hospedagem e passeios para explorar a cidade.\n✔️ Um destino para explorar a cultura tailandesa.\nGaranta sua vaga pelo WhatsApp: (99) 9 9999-9999\n#Bangkok #DestinoDosSonhos #FériasIncríveis",
    "drive_url": "https://drive.google.com/file/d/17ZxvJqdPt4WGuosoyOQF2MK2lWqbL7BS/view?usp=drive_link"
  },
  {
    "title": "Barcelona",
    "url": "https://www.canva.com/design/DAGgIVLFL6c/sN4xUOkZJTbGJ5vZ6kQ18Q/view?utm_content=DAGgIVLFL6c&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview",
    "type": "video",
    "description": "Celebre o Dia do Turista em Barcelona! 🏛️✨ Explore a Sagrada Família e o Parc Güell com nossos pacotes que oferecem ✈️ passagens e 🏨 hospedagem. Barcelona é perfeita para quem ama arquitetura e cultura catalã.\n✔️ O mundo é cheio de descobertas para viajantes apaixonados.\nPlaneje sua viagem pelo WhatsApp: (99) 9 9999-9999\n#DiaDoTurista #ExplorarOMundo #FériasInesquecíveis",
    "drive_url": "https://drive.google.com/file/d/14UiSdexiKw5YFaymTv8RlNIhYLNz83Ow/view?usp=drive_link"
  },
  {
    "title": "Berlim",
    "url": "https://www.canva.com/design/DAGgICa3icM/XUL5DCACv4mYeGq4syIzmw/view?utm_content=DAGgICa3icM&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview",
    "type": "video",
    "description": "Relembre momentos incríveis em Berlim! 🏛️✨ Conhecida pelo Muro de Berlim e pela vida noturna vibrante, Berlim é um destino cheio de história. Nosso pacote inclui ✈️ passagens e 🏨 hospedagem para você planejar sua próxima viagem dos sonhos.\n✔️ Um destino com cultura e modernidade para se apaixonar.\nDescubra mais pelo WhatsApp: (99) 9 9999-9999\n#Berlim #TBTDeViagem #DestinoIncrível",
    "drive_url": "https://drive.google.com/file/d/16tvUY6Yl9nLoRsOaYiZU9gzr_hK-STiJ/view?usp=drive_link"
  },
  {
    "title": "Buenos Aires",
    "url": "https://www.canva.com/design/DAGgIfy2Ca0/Hr95Q6ST7258CMco-HbxDQ/view?utm_content=DAGgIfy2Ca0&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview",
    "type": "video",
    "description": "Crie memórias inesquecíveis em Buenos Aires! 🕺✨ Conhecida pelo tango e pela gastronomia, como o bife de chorizo, Buenos Aires é um destino vibrante. Nossos pacotes oferecem ✈️ passagens e 🏨 hospedagem para você viver momentos únicos.\n✔️ Viajar é a melhor forma de colecionar experiências.\nPlaneje sua viagem pelo WhatsApp: (99) 9 9999-9999\n#ColecioneMemórias #ExperiênciasInesquecíveis #FériasDosSonhos",
    "drive_url": "https://drive.google.com/file/d/11_83xtMwYDS_E15nSddFC-nddLwVXzwr/view?usp=drive_link"
  },
  {
    "title": "Cartagena",
    "url": "https://www.canva.com/design/DAGgIaIGeIM/JYgK-PBpXfnIqH0znFw-zw/view?utm_content=DAGgIaIGeIM&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview",
    "type": "video",
    "description": "Planeje sua viagem para Cartagena com antecedência! 🏖️✨ Para garantir as melhores ofertas em passagens e hospedagem, programe-se com 3 a 6 meses. Cartagena é famosa pela cidade murada e pelas praias caribenhas.\n✔️ Economize e evite imprevistos para uma viagem perfeita.\nFale com a gente pelo WhatsApp: (99) 9 9999-9999\n#DicasDeViagem #PlanejamentoDeViagem #FériasPerfeitas",
    "drive_url": "https://drive.google.com/file/d/11P9THfMnqi8jdhN5B1FLVCzYJj4Szx5I/view?usp=drive_link"
  },
  {
    "title": "Dubai",
    "url": "https://www.canva.com/design/DAGgIQx3iW8/D8lV3a_3aHeKQ1JI3Pd3OQ/view?utm_content=DAGgIQx3iW8&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview",
    "type": "video",
    "description": "Descubra as maravilhas de Dubai! 🏙️✨ Com o Burj Khalifa e os shoppings de luxo, Dubai é um destino moderno e fascinante. Nosso pacote a partir de 10x de R$450,00 inclui ✈️ passagens, 🏨 hospedagem e passeios para conhecer o deserto e a cidade.\n✔️ Um destino internacional cheio de glamour te espera.\nFale com a gente pelo WhatsApp: (99) 9 9999-9999\n#BelezasDeDubai #ViajarPeloMundo #FériasInternacionais",
    "drive_url": "https://drive.google.com/file/d/13BCK3_0ZhbK0Ogenc8bAydyOObsUcmlG/view?usp=drive_link"
  },
  {
    "title": "Florença",
    "url": "https://www.canva.com/design/DAGgIe1FmSk/bFSgFqaodmrSZsV04AtBhQ/view?utm_content=DAGgIe1FmSk&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview",
    "type": "video",
    "description": "Saia da rotina em Florença! 🏛️✨ Conhecida pela Duomo e pela arte renascentista, Florença é um destino cultural. Nossos pacotes a partir de 10x de R$150,00 incluem ✈️ passagens, 🏨 hospedagem e passeios para explorar a Toscana.\n✔️ Um destino único para sua próxima aventura.\nPlaneje agora pelo WhatsApp: (99) 9 9999-9999\n#NovosDestinos #PacotesDeViagem #ExplorarOMundo",
    "drive_url": "https://drive.google.com/file/d/14ZnngFhqqtTeXoAvWqyNDhansf_oW0DB/view?usp=drive_link"
  },
  {
    "title": "Frankfurt",
    "url": "https://www.canva.com/design/DAGgIaE8E9Q/jnbP70f-e2-JTnfHvpFIIw/view?utm_content=DAGgIaE8E9Q&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview",
    "type": "video",
    "description": "Busca conforto em Frankfurt? 🏙️✨ Nosso pacote para a cidade alemã inclui café da manhã delicioso, Wi-Fi, TV e estacionamento, a partir de 10x de R$450,00. Explore o Römer e o Rio Meno com total comodidade.\n✔️ Tudo pensado para você relaxar e aproveitar ao máximo.\nFale com a gente pelo WhatsApp: (99) 9 9999-9999\n#PacotesCompletos #ViajarComConforto #BenefíciosExclusivos"
  },
  {
    "title": "Havana",
    "url": "https://www.canva.com/design/DAGgIIzdW8Q/pCZAay9vuoXa2Xms6_So5w/view?utm_content=DAGgIIzdW8Q&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview",
    "type": "video",
    "description": "Cada viagem para Havana é um novo capítulo na sua vida! 🎶✨ Conhecida pela música, pelos carros antigos e pela história, Havana é um destino vibrante. Nosso pacote inclui ✈️ passagens e 🏨 hospedagem para você criar memórias inesquecíveis.\n✔️ Uma aventura única na capital cubana te espera.\nPlaneje agora pelo WhatsApp: (99) 9 9999-9999\n#NovaHistória #FériasIncríveis #ColecioneMomentos",
    "drive_url": "https://drive.google.com/file/d/14mzIawQF4E5QhAeinx1QAr_v5XORXwQm/view?usp=drive_link"
  },
  {
    "title": "Havana 2",
    "url": "https://www.canva.com/design/DAGgIfy2Ca0/Hr95Q6ST7258CMco-HbxDQ/view?utm_content=DAGgIfy2Ca0&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview",
    "type": "video",
    "description": "Cada viagem para Havana é um novo capítulo na sua vida! 🎶✨ Conhecida pela música, pelos carros antigos e pela história, Havana é um destino vibrante. Nosso pacote inclui ✈️ passagens e 🏨 hospedagem para você criar memórias inesquecíveis.\n✔️ Uma aventura única na capital cubana te espera.\nPlaneje agora pelo WhatsApp: (99) 9 9999-9999\n#NovaHistória #FériasIncríveis #ColecioneMomentos",
    "drive_url": "https://drive.google.com/file/d/14mzIawQF4E5QhAeinx1QAr_v5XORXwQm/view?usp=drive_link"
  },
  {
    "title": "Hong Kong",
    "url": "https://www.canva.com/design/DAGkxrEQhaA/Uxja1UOzzbRORe3gapcq9A/view?utm_content=DAGkxrEQhaA&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview",
    "type": "video",
    "description": "Faça uma viagem rápida e econômica para Hong Kong! 🏙️✈️ Conhecida pelo skyline e pelos mercados noturnos, Hong Kong é um destino vibrante. Nosso pacote inclui ✈️ passagens aéreas de ida e volta de São Paulo, por apenas R$520,00.\n✔️ Conforto e tranquilidade para explorar esse destino asiático.\nGaranta sua passagem pelo WhatsApp: (99) 9 9999-9999\n#ViagemEconomica #PassagensAéreas #HongKong",
    "drive_url": "https://drive.google.com/file/d/11P5Qs2gbTDatiGJC6bdGJAoGEqMR6hxQ/view?usp=drive_link"
  },
  {
    "title": "Ilha de Páscoa",
    "url": "https://www.canva.com/design/DAGgIBc0onY/x4vLLY939_RdIrA4XICf5w/view?utm_content=DAGgIBc0onY&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview",
    "type": "video",
    "description": "Invista em experiências na Ilha de Páscoa! 🗿✨ Conhecida pelos moais e pela cultura Rapa Nui, esse destino é único. Cada viagem traz aprendizados e memórias, e nosso pacote inclui ✈️ passagens e 🏨 hospedagem para você explorar a ilha.\n✔️ Fique rico em histórias para contar por toda a vida.\nPlaneje pelo WhatsApp: (99) 9 9999-9999\n#LembreteDeViagem #ExperiênciasIncríveis #ColecioneMomentos",
    "drive_url": "https://drive.google.com/file/d/13xncXj0kYKHhA7CwZmMODnuUplNm8CHj/view?usp=drive_link"
  },
  {
    "title": "Istambul",
    "url": "https://www.canva.com/design/DAGgIFgynkQ/sTk_DjnzNhbRFLmpJgDAkQ/view?utm_content=DAGgIFgynkQ&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview",
    "type": "video",
    "description": "Curta o calor em 3 paraísos: Istambul, Dubai e Phuket! 🌍✨ Istambul tem o Grand Bazaar e a Mesquita Azul, perfeitos para o verão. Nossos pacotes incluem ✈️ passagens e 🏨 hospedagem para você escolher seu destino favorito.\n✔️ Três opções internacionais para suas férias.\nFale com a gente pelo WhatsApp: (99) 9 9999-9999\n#DestinosDeVerão #ViajarÉViver",
    "drive_url": "https://drive.google.com/file/d/11XeR8mUA74-_PVfdF01d2Hr3wELdrqFZ/view?usp=drive_link"
  },
  {
    "title": "Itália",
    "url": "https://www.canva.com/design/DAGgIQX9aoE/NzEO3LVAaZLmNIrFwf0OjA/view?utm_content=DAGgIQX9aoE&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview",
    "type": "video",
    "description": "Passaporte vencido antes de ir para Itália? 🛂✈️ Não se preocupe! Saiba como resolver rapidamente: renove com antecedência e verifique as exigências do destino. Itália tem Roma, Veneza e a Costa Amalfitana, destinos imperdíveis.\n✔️ Planeje com antecedência e evite problemas no embarque.\nFale com a gente pelo WhatsApp: (99) 9 9999-9999\n#PassaporteVencido #DicasDeViagem #PlanejamentoDeViagem",
    "drive_url": "https://drive.google.com/file/d/123DM5h9VObNWH2PC7sMw9RfpNQb2j0tE/view?usp=drive_link"
  },
  {
    "title": "Las Vegas",
    "url": "https://www.canva.com/design/DAGgIaE8E9Q/jnbP70f-e2-JTnfHvpFIIw/view?utm_content=DAGgIaE8E9Q&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview",
    "type": "video",
    "description": "Aproveite dias incríveis em Las Vegas! 🎰✨ Conhecida pelos cassinos e shows, Las Vegas é pura diversão. Nosso pacote para 2 adultos inclui ✈️ passagens, 🏨 hospedagem e passeios, a partir de 10x de R$150,00.\n✔️ Uma viagem cheia de entretenimento e glamour.\nGaranta sua vaga pelo WhatsApp: (99) 9 9999-9999\n#ExcursãoLasVegas #ÚltimasVagas #FériasPerfeitas",
    "drive_url": "https://drive.google.com/file/d/1395jEwtwNqIFjDehC9zhGCY-xZdsDf8u/view?usp=drive_link"
  },
  {
    "title": "Lisboa",
    "url": "https://www.canva.com/design/DAGgIVf4UOQ/50ss3rLMLZTo86vSgVp1gA/view?utm_content=DAGgIVf4UOQ&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview",
    "type": "video",
    "description": "Sonha com neve em Lisboa? ❄️✨ Embora Lisboa seja mais conhecida pelo clima ameno, você pode curtir destinos nevados como Zermatt, Valle Nevado e Bariloche. Nossos pacotes incluem ✈️ passagens e 🏨 hospedagem para um inverno mágico.\n✔️ Escolha seu destino gelado e viva o frio com estilo.\nFale com a gente pelo WhatsApp: (99) 9 9999-9999\n#DestinosDeNeve #ViagemDeInverno #Lisboa"
  },
  {
    "title": "Londres",
    "url": "https://www.canva.com/design/DAGkxrEQhaA/Uxja1UOzzbRORe3gapcq9A/view?utm_content=DAGkxrEQhaA&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview",
    "type": "video",
    "description": "Planeje sua viagem para Londres pelo nosso site! 🏰✈️ Rápido, seguro e com ofertas exclusivas, nosso pacote inclui ✈️ passagens, 🏨 hospedagem e passeios para o Big Ben, o London Eye e o Palácio de Buckingham.\n✔️ Tudo pronto para sua próxima aventura em poucos cliques.\nAcesse pelo WhatsApp: (99) 9 9999-9999\n#CompreOnline #PacotesDeViagem #FériasDosSonhos"
  },
  {
    "title": "Los Angeles",
    "url": "https://www.canva.com/design/DAGgIFgynkQ/sTk_DjnzNhbRFLmpJgDAkQ/view?utm_content=DAGgIFgynkQ&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview",
    "type": "video",
    "description": "Encante-se com Los Angeles! 🌟✨ Com a Calçada da Fama e as praias de Santa Monica, LA é um destino dos sonhos. Nosso pacote em até 10x de R$850,00 inclui ✈️ passagens e 🏨 hospedagem para você explorar Hollywood e muito mais.\n✔️ Uma viagem para explorar a cultura americana.\nGaranta sua viagem pelo WhatsApp: (99) 9 9999-9999\n#LosAngeles #PacotesDeViagem #FériasNaCali \nTokyo\nCada aventura em Tokyo faz parte de quem somos! 🏯✨ Conhecida pela modernidade de Shibuya e pela tradição de Asakusa, Tokyo é fascinante. Nossos pacotes incluem ✈️ passagens e 🏨 hospedagem para você criar histórias inesquecíveis.\n✔️ Viva experiências únicas nesse destino japonês.\nPlaneje agora pelo WhatsApp: (99) 9 9999-9999\n#ViajarÉViver #MemóriasInesquecíveis #AventuraEDescoberta"
  },
  {
    "title": "Madri",
    "url": "https://www.canva.com/design/DAGgIOg8LZs/ktrot3t27LZWsHrQz6iOHQ/view?utm_content=DAGgIOg8LZs&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview",
    "type": "video",
    "description": "Prepare-se para Madri! 🏛️✈️ Leve um adaptador universal, contrate um seguro viagem e verifique passaporte 🛂 e visto para evitar imprevistos. Madri tem o Palácio Real e a Plaza Mayor, perfeitos para explorar a cultura espanhola.\n✔️ Itens essenciais para curtir a capital espanhola sem preocupações.\nPlaneje pelo WhatsApp: (99) 9 9999-9999\n#DicasDeViagem #ViagemInternacional #FériasPerfeitas",
    "drive_url": "https://drive.google.com/file/d/11KUUHXnZ6hUOhB1ralJnU_Z0KUT-Flkh/view?usp=drive_link"
  },
  {
    "title": "Miami",
    "url": "https://www.canva.com/design/DAGgIaIGeIM/JYgK-PBpXfnIqH0znFw-zw/view?utm_content=DAGgIaIGeIM&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview",
    "type": "video",
    "description": "Prepare-se para Miami! 🏖️🧳 Saiba como agir se sua bagagem for extraviada: informe a companhia aérea, tenha o comprovante de despacho e contrate um seguro viagem. Miami tem South Beach e a vibe latina de Little Havana.\n✔️ Dicas para resolver imprevistos e curtir sua viagem.\nFale com a gente pelo WhatsApp: (99) 9 9999-9999\n#DicasDeViagem #BagagemExtraviada #ViagemSemEstresse"
  },
  {
    "title": "Milão",
    "url": "https://www.canva.com/design/DAGgIeC0clw/AowfyjEsUwNBiOEGmYqUTw/view?utm_content=DAGgIeC0clw&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview",
    "type": "video",
    "description": "Explore Milão com conforto! 🏛️✨ Conhecida pela Duomo e pela moda, Milão é um destino elegante. Nosso pacote inclui 5 diárias, ✈️ passagens de ida e volta, transfer do aeroporto ao hotel e passeios exclusivos, por apenas R$1.500 por pessoa.\n✔️ Uma viagem para relaxar e explorar a Itália.\nGaranta sua viagem pelo WhatsApp: (99) 9 9999-9999\n#DescubraMilão #PacotesDeViagem #FériasInesquecíveis"
  },
  {
    "title": "Munique",
    "url": "https://www.canva.com/design/DAGgIWvNtdA/agfWkW39gzVWXYhlPdvOzg/view?utm_content=DAGgIWvNtdA&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview",
    "type": "video",
    "description": "Explore novos horizontes em Munique! 🍻✨ Conhecida pela Oktoberfest e pelo Englischer Garten, Munique é perfeita para quem ama cultura e cerveja. Nossos pacotes especiais incluem ✈️ passagens, 🏨 hospedagem e passeios, com condições facilitadas.\n✔️ Um destino europeu para sua próxima aventura.\nPlaneje pelo WhatsApp: (99) 9 9999-9999\n#ExploreOMundo #PacoteDeViagem #ViagemSemComplicações"
  },
  {
    "title": "Phuket",
    "url": "https://www.canva.com/design/DAGgIe1FmSk/bFSgFqaodmrSZsV04AtBhQ/view?utm_content=DAGgIe1FmSk&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview",
    "type": "video",
    "description": "Cada passo da sua viagem para Phuket é memorável! 🏖️✨ Conhecida pelas praias de Patong e pelas ilhas próximas, Phuket é um paraíso tailandês. Nosso pacote oferece ✈️ passagens, 🏨 hospedagem e passeios de barco para curtir cada detalhe.\n✔️ A aventura está em cada parada dessa jornada incrível.\nFale com a gente pelo WhatsApp: (99) 9 9999-9999\n#JornadaDeViagem #FériasIncríveis #ExperiênciasInesquecíveis"
  },
  {
    "title": "Playa Del Carmen",
    "url": "https://www.canva.com/design/DAGgIU7GrTM/gd3BcmnPgPeSzfxEpgqH3w/view?utm_content=DAGgIU7GrTM&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview",
    "type": "video",
    "description": "Não deixe seus sonhos de viagem para Playa del Carmen para depois! 🏖️✨ Com praias caribenhas e a Quinta Avenida, Playa é um destino vibrante. Nossos pacotes personalizados incluem ✈️ passagens, 🏨 hospedagem e passeios, com facilidade no pagamento.\n✔️ Ofertas especiais para você explorar esse paraíso mexicano.\nFale com a gente pelo WhatsApp: (99) 9 9999-9999\n#ViajeMaisVivaMais #PacotesDeViagem #FériasDosSonhos"
  },
  {
    "title": "Riviera Maya",
    "url": "https://www.canva.com/design/DAGgIQX9aoE/NzEO3LVAaZLmNIrFwf0OjA/view?utm_content=DAGgIQX9aoE&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview",
    "type": "video",
    "description": "Curta dias de sol na Riviera Maya! 🏖️✨ Com cenotes e ruínas maias como Chichén Itzá, esse destino é um paraíso. Nossos pacotes especiais incluem ✈️ passagens, 🏨 hospedagem e passeios, com facilidade de pagamento para sua viagem.\n✔️ Uma aventura inesquecível te espera no México.\nGaranta sua vaga pelo WhatsApp: (99) 9 9999-9999\n#PartiuRivieraMaya #ViagemDosSonhos #FériasIncríveis \nConteúdos Internacionais ✈️"
  },
  {
    "title": "Roma",
    "url": "https://www.canva.com/design/DAGgIU7GrTM/gd3BcmnPgPeSzfxEpgqH3w/view?utm_content=DAGgIU7GrTM&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview",
    "type": "video",
    "description": "Evite imprevistos em Roma! 🏛️✈️ Chegue cedo ao aeroporto e mantenha seus documentos como passaporte 🛂 à mão para uma viagem tranquila. Roma é famosa pelo Coliseu e pela culinária italiana, como a carbonara autêntica.\n✔️ Dicas para curtir a Cidade Eterna sem estresse.\nPlaneje pelo WhatsApp: (99) 9 9999-9999\n#DicasDeViagem #ViajarSemEstresse #PlanejamentoDeViagem"
  },
  {
    "title": "Santiago",
    "url": "https://www.canva.com/design/DAGgIVEAcbs/CbiYmoUZtQTIGMBt5QLl2w/view?utm_content=DAGgIVEAcbs&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview",
    "type": "video",
    "description": "Santiago te espera para uma viagem inesquecível! 🏔️✨ Reúna a galera e curta a cultura chilena, com vinícolas e o centro histórico. Nosso pacote inclui ✈️ passagens, 🏨 hospedagem e passeios para explorar a cidade e arredores, como o Valle Nevado.\n✔️ Uma experiência perfeita para grupos de amigos ou família.\nPlaneje agora pelo WhatsApp: (99) 9 9999-9999\n#BoraPraSantiago #ViagemComAmigos #FériasNaCidade"
  },
  {
    "title": "Santiago 2",
    "url": "https://www.canva.com/design/DAGgIBc0onY/x4vLLY939_RdIrA4XICf5w/view?utm_content=DAGgIBc0onY&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview",
    "type": "video",
    "description": "Santiago te espera para uma viagem inesquecível! 🏔️✨ Reúna a galera e curta a cultura chilena, com vinícolas e o centro histórico. Nosso pacote inclui ✈️ passagens, 🏨 hospedagem e passeios para explorar a cidade e arredores, como o Valle Nevado.\n✔️ Uma experiência perfeita para grupos de amigos ou família.\nPlaneje agora pelo WhatsApp: (99) 9 9999-9999\n#BoraPraSantiago #ViagemComAmigos #FériasNaCidade"
  },
  {
    "title": "Siena",
    "url": "https://www.canva.com/design/DAGgIVEAcbs/CbiYmoUZtQTIGMBt5QLl2w/view?utm_content=DAGgIVEAcbs&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview",
    "type": "video",
    "description": "Deixe tudo por nossa conta em Siena! 🏛️✈️ Conhecida pela Piazza del Campo e pela arquitetura medieval, Siena é um destino encantador na Toscana. Nosso pacote inclui ✈️ passagens, 🏨 hospedagem e passeios para explorar a região.\n✔️ Viaje sem preocupações e viva a magia italiana.\nFale com a gente pelo WhatsApp: (99) 9 9999-9999\n#AgenciaDeViagens #PacotesDeViagem #ViajarÉViver"
  },
  {
    "title": "Sydney",
    "url": "https://www.canva.com/design/DAGgIVXEKro/XqlAf6FYlwxdYIJyOZzZiw/view?utm_content=DAGgIVXEKro&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview",
    "type": "video",
    "description": "Não perca seu voo para Sydney! ✈️🛂 Chegue com antecedência ao aeroporto, faça o check-in online e configure alarmes no celular para o horário de embarque. Sydney tem a Opera House e Bondi Beach, perfeitas para explorar.\n✔️ Dicas para uma viagem tranquila e sem correrias.\nFale com a gente pelo WhatsApp: (99) 9 9999-9999\n#DicasDeViagem #NaoPercaSeuVoo #ViagemSemEstresse"
  },
  {
    "title": "Tokyo",
    "url": "https://www.canva.com/design/DAGgIBc0onY/x4vLLY939_RdIrA4XICf5w/view?utm_content=DAGgIBc0onY&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview",
    "type": "video",
    "description": "✨ A aventura te espera com Tokyo! ✈️🌍\\n\\n🔥 Nossos pacotes e conteúdos são criados para você colecionar momentos inesquecíveis sem preocupações.\\n\\n👇 Clique no link da BIO para aproveitar as melhores condições!\\n📲 (99) 9 9999-9999\\n\\n#Tokyo #ViagemPerfeita #AgenciaDeViagens"
  },
  {
    "title": "Toronto",
    "url": "https://www.canva.com/design/DAGgIOg8LZs/ktrot3t27LZWsHrQz6iOHQ/view?utm_content=DAGgIOg8LZs&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview",
    "type": "video",
    "description": "Aproveite o tempo no aeroporto antes de ir para Toronto! ✈️🧳 Explore lojas, leia um livro ou descanse em áreas tranquilas para recarregar as energias. Toronto tem atrações como a CN Tower e o Distillery District, perfeitas para sua viagem.\n✔️ Dicas para tornar sua espera mais produtiva e agradável.\nPlaneje sua viagem pelo WhatsApp: (99) 9 9999-9999\n#ConexãoDeVoo #DicasDeViagem #TempoDeEspera"
  },
  {
    "title": "Tulum",
    "url": "https://www.canva.com/design/DAGgIVf4UOQ/50ss3rLMLZTo86vSgVp1gA/view?utm_content=DAGgIVf4UOQ&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview",
    "type": "video",
    "description": "✨ A aventura te espera com Tulum! ✈️🌍\\n\\n🔥 Nossos pacotes e conteúdos são criados para você colecionar momentos inesquecíveis sem preocupações.\\n\\n👇 Clique no link da BIO para aproveitar as melhores condições!\\n📲 (99) 9 9999-9999\\n\\n#Tulum #ViagemPerfeita #AgenciaDeViagens"
  },
  {
    "title": "Vancouver",
    "url": "https://www.canva.com/design/DAGgICa3icM/XUL5DCACv4mYeGq4syIzmw/view?utm_content=DAGgICa3icM&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview",
    "type": "video",
    "description": "Viaje para Vancouver com segurança! 🏔️✈️ Pesquise sobre o destino, use serviços oficiais como táxis credenciados e evite sacar grandes quantias de dinheiro. Vancouver tem o Stanley Park e montanhas incríveis para explorar.\n✔️ Dicas para uma viagem tranquila e sem golpes.\nPlaneje pelo WhatsApp: (99) 9 9999-9999\n#DicasDeViagem #GolpesContraTuristas #ViagemSegura"
  },
  {
    "title": "Veneza",
    "url": "https://www.canva.com/design/DAGgIIzdW8Q/pCZAay9vuoXa2Xms6_So5w/view?utm_content=DAGgIIzdW8Q&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview",
    "type": "video",
    "description": "Viaje em família para Veneza! 🚤✨ Conhecida pelos canais e pela Praça de São Marcos, Veneza é mágica para crianças e adultos. Outras opções incríveis incluem Paris, Orlando e Lisboa, com pacotes que incluem ✈️ passagens e 🏨 hospedagem.\n✔️ Momentos inesquecíveis para todas as idades garantidos.\nPlaneje agora pelo WhatsApp: (99) 9 9999-9999\n#ViagemComCrianças #FériasEmFamília #Veneza",
    "drive_url": "https://drive.google.com/file/d/14z2pfoMaPJaaYmorF3wri-7h0YT00rtD/view?usp=drive_link"
  },
  {
    "title": "5 Praias Floripa",
    "url": "https://www.canva.com/design/DAGhwS47xPc/nB1DGxHhCj4jH1ZATP8xeQ/view?utm_content=DAGhwS47xPc&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview",
    "type": "video",
    "description": "✨ A aventura te espera com 5 Praias Floripa! ✈️🌍\\n\\n🔥 Nossos pacotes e conteúdos são criados para você colecionar momentos inesquecíveis sem preocupações.\\n\\n👇 Clique no link da BIO para aproveitar as melhores condições!\\n📲 (99) 9 9999-9999\\n\\n#5PraiasFloripa #ViagemPerfeita #AgenciaDeViagens"
  },
  {
    "title": "Alagoas",
    "url": "https://www.canva.com/design/DAGhw3sD28w/yFm8fW4z_5yXo0Xf_8_p_A/view?utm_content=DAGhw3sD28w&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview",
    "type": "video",
    "description": "Desbrave Alagoas com pacotes a partir de R$2.500! 🏖️🌊 Explore praias como São Miguel dos Milagres e Pajuçara, com suas águas mornas e cenários perfeitos para relaxar. Nosso pacote inclui ✈️ passagens, 🏨 hospedagem e passeios para conhecer o melhor da região.\n✔️ Um destino nacional cheio de belezas para descobrir.\nFale com a gente pelo WhatsApp: (99) 9 9999-9999\n#ExploreOMundo #PacotesNacionais #FériasIncríveis \nFlorianópolis\nCada viagem para Florianópolis é um novo capítulo na sua vida! 🏝️📸 Conhecida pelas praias e pela vibe descontraída, Floripa tem opções para todos os gostos, de surfe a trilhas. Nosso pacote inclui ✈️ passagens e 🏨 hospedagem para você criar memórias inesquecíveis.\n✔️ Uma aventura única na Ilha da Magia te espera.\nPlaneje agora pelo WhatsApp: (99) 9 9999-9999\n#NovaHistória #FériasIncríveis #ColecioneMomentos"
  },
  {
    "title": "Alter do Chão",
    "url": "https://www.canva.com/design/DAGhwMPXsXA/RvDv-RPL5DPL73FWyISG_w/view?utm_content=DAGhwMPXsXA&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview",
    "type": "video",
    "description": "Explore novos horizontes em Alter do Chão! 🏝️🌊 Conhecido como o \"Caribe Amazônico\", esse destino tem praias de água doce e uma vibe única. Nossos pacotes especiais incluem ✈️ passagens, 🏨 hospedagem e passeios de barco, com condições facilitadas de pagamento.\n✔️ Um paraíso no coração da Amazônia para sua próxima aventura.\nPlaneje pelo WhatsApp: (99) 9 9999-9999\n#ExploreOMundo #PacoteDeViagem #ViagemSemComplicações",
    "drive_url": "https://drive.google.com/file/d/1MbuUZT24JUU06g26z7tl_CdzVbseYbfO/view?usp=drive_link"
  },
  {
    "title": "Amazônia",
    "url": "https://www.canva.com/design/DAGhw828f00/kS69K92z1Zf-c30Hw20DkQ/view?utm_content=DAGhw828f00&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview",
    "type": "video",
    "description": "Embarque em um cruzeiro completo pela Amazônia! 🌿🚤 Desfrute de 5 dias navegando pelos rios, com gastronomia regional, atividades como trilhas e observação de botos, e paradas em comunidades locais. Nosso pacote inclui tudo: alimentação, passeios e hospedagem a bordo, com parcelamento facilitado.\n✔️ Uma experiência única para se conectar com a natureza.\nReserve pelo WhatsApp: (99) 9 9999-9999\n#CruzeiroDosSonhos #EmbarqueJá #FériasInesquecíveis"
  },
  {
    "title": "Amazonas",
    "url": "https://www.canva.com/design/DAGhw828f00/kS69K92z1Zf-c30Hw20DkQ/view?utm_content=DAGhw828f00&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview",
    "type": "video",
    "description": "Invista em experiências no Amazonas! 🌳✨ Conheça a Floresta Amazônica, navegue pelos rios e aprenda sobre a cultura indígena local. Cada destino traz aprendizados e memórias que valem mais que qualquer bem material, e nosso pacote inclui ✈️ passagens e 🏨 hospedagem.\n✔️ Fique rico em histórias para contar por toda a vida.\nPlaneje pelo WhatsApp: (99) 9 9999-9999\n#LembreteDeViagem #ExperiênciasIncríveis #ColecioneMomentos"
  },
  {
    "title": "Angra dos Reis",
    "url": "https://www.canva.com/design/DAGhvTRTvRg/PPKZZv7xizd-XnytywMa7Q/view?utm_content=DAGhvTRTvRg&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview",
    "type": "video",
    "description": "Explore as maravilhas de Angra dos Reis! ⛵🌊 Com ilhas paradisíacas como Ilha Grande e Lopes Mendes, esse destino é perfeito para quem ama o mar. Nosso pacote a partir de 10x de R$250,00 inclui ✈️ passagens, 🏨 hospedagem e passeios de barco.\n✔️ Um roteiro cheio de praias e natureza para suas férias.\nGaranta sua viagem pelo WhatsApp: (99) 9 9999-9999\n#PasseiosAngra #PraiasDoRJ #FériasPerfeitas \n5 Praias Floripa\nPrepare-se para 5 Praias Floripa! 🏖️✈️ Leve um adaptador universal, contrate um seguro viagem e verifique passaporte 🛂 e identidade para evitar imprevistos. Florianópolis tem praias incríveis como Joaquina e Daniela, perfeitas para o verão.\n✔️ Itens essenciais para curtir a Ilha da Magia sem preocupações.\nPlaneje pelo WhatsApp: (99) 9 9999-9999\n#DicasDeViagem #ViagemNacional #FériasPerfeitas",
    "drive_url": "https://drive.google.com/file/d/11I4vws3kvAi3eVkdHX8drR3Lb2i6Hn0Q/view?usp=drive_link"
  },
  {
    "title": "Arraial do Cabo",
    "url": "https://www.canva.com/design/DAGhx1FIZ9A/8qF6DjcZAv4_IN_qwJuYMw/view?utm_content=DAGhx1FIZ9A&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview",
    "type": "video",
    "description": "Crie memórias inesquecíveis em Arraial do Cabo! 🏖️📸 Com praias como a Prainha e passeios de barco para a Praia do Farol, esse destino é um sonho para quem ama o mar. Nossos pacotes oferecem ✈️ passagens e 🏨 hospedagem para você viver momentos únicos.\n✔️ Viajar é a melhor forma de colecionar experiências.\nPlaneje sua viagem pelo WhatsApp: (99) 9 9999-9999\n#ColecioneMemórias #ExperiênciasInesquecíveis #FériasDosSonhos"
  },
  {
    "title": "Balneário Camboriú",
    "url": "https://www.canva.com/design/DAGkxPpLy4w/HSkS1GTYdNiwDfyG9B1f9g/view?utm_content=DAGkxPpLy4w&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview",
    "type": "video",
    "description": "Sonha com Balneário Camboriú? 🏙️🏖️ Conhecida pelos arranha-céus e pela praia central, esse destino é perfeito para quem busca diversão e modernidade. Nosso pacote a partir de R$2.500 inclui ✈️ passagens, 🏨 hospedagem e passeios como o Parque Unipraias.\n✔️ Um destino para curtir dias de sol e agito.\nGaranta sua vaga pelo WhatsApp: (99) 9 9999-9999\n#BalneárioCamboriú #DestinoDosSonhos #FériasIncríveis",
    "drive_url": "https://drive.google.com/file/d/16MLNHPAj0FHwPygFH8OUY0QSoDbWnTgc/view?usp=drive_link"
  },
  {
    "title": "Fernando de Noronha",
    "url": "https://www.canva.com/design/DAGgHZ-fCuI/RFrxKhGE6O92snzhuuv0BA/view?utm_content=DAGgHZ-fCuI&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview",
    "type": "video",
    "description": "Planeje sua viagem para Fernando de Noronha sem preocupações! 🐠🏝️ Esse arquipélago é famoso pelas praias paradisíacas e vida marinha rica, ideal para mergulhos inesquecíveis. Nosso pacote completo inclui ✈️ passagens aéreas, 🏨 hospedagem em pousada charmosa e até opções de passeios para explorar a ilha, tudo em até 10x sem juros.\n✔️ Suporte personalizado para você curtir cada momento.\nFale conosco pelo WhatsApp: (99) 9 9999-9999\n#ViajarSemPreocupação #PacoteDeViagem #AgenciaDeViagens",
    "drive_url": "https://drive.google.com/file/d/10yEMLzRjLik8_3MM-Oz77oBJQWZODZHX/view?usp=drive_link"
  },
  {
    "title": "Fernando de Noronha 2",
    "url": "https://www.canva.com/design/DAGgHZ-fCuI/RFrxKhGE6O92snzhuuv0BA/view?utm_content=DAGgHZ-fCuI&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview",
    "type": "video",
    "description": "Planeje sua viagem para Fernando de Noronha sem preocupações! 🐠🏝️ Esse arquipélago é famoso pelas praias paradisíacas e vida marinha rica, ideal para mergulhos inesquecíveis. Nosso pacote completo inclui ✈️ passagens aéreas, 🏨 hospedagem em pousada charmosa e até opções de passeios para explorar a ilha, tudo em até 10x sem juros.\n✔️ Suporte personalizado para você curtir cada momento.\nFale conosco pelo WhatsApp: (99) 9 9999-9999\n#ViajarSemPreocupação #PacoteDeViagem #AgenciaDeViagens",
    "drive_url": "https://drive.google.com/file/d/10yEMLzRjLik8_3MM-Oz77oBJQWZODZHX/view?usp=drive_link"
  },
  {
    "title": "Florianópolis",
    "url": "https://www.canva.com/design/DAGhwS47xPc/nB1DGxHhCj4jH1ZATP8xeQ/view?utm_content=DAGhwS47xPc&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview",
    "type": "video",
    "description": "Relembre momentos incríveis em Florianópolis - SC! 🏖️🌅 Conhecida como a \"Ilha da Magia\", Floripa tem praias para todos os gostos, de Jurerê a Campeche. Nosso pacote inclui ✈️ passagens e 🏨 hospedagem, para você planejar sua próxima viagem dos sonhos.\n✔️ Um destino com paisagens de tirar o fôlego e muita diversão.\nDescubra mais pelo WhatsApp: (99) 9 9999-9999\n#Florianópolis #TBTDeViagem #DestinoIncrível",
    "drive_url": "https://drive.google.com/file/d/10WpZTgI6o3Tunt9zZfOhl78qJwFHA_K6/view?usp=drive_link"
  },
  {
    "title": "Florianópolis - SC",
    "url": "https://www.canva.com/design/DAGhx_YRl4E/KkH3YyyjWUbaHasgdbRhnw/view?utm_content=DAGhx_YRl4E&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview",
    "type": "video",
    "description": "Relembre momentos incríveis em Florianópolis - SC! 🏖️🌅 Conhecida como a \"Ilha da Magia\", Floripa tem praias para todos os gostos, de Jurerê a Campeche. Nosso pacote inclui ✈️ passagens e 🏨 hospedagem, para você planejar sua próxima viagem dos sonhos.\n✔️ Um destino com paisagens de tirar o fôlego e muita diversão.\nDescubra mais pelo WhatsApp: (99) 9 9999-9999\n#Florianópolis #TBTDeViagem #DestinoIncrível",
    "drive_url": "https://drive.google.com/file/d/10WpZTgI6o3Tunt9zZfOhl78qJwFHA_K6/view?usp=drive_link"
  },
  {
    "title": "Foz do Iguaçu",
    "url": "https://www.canva.com/design/DAGhx1v1w7w/F17wJ25v9l9cQ65F-E_36g/view?utm_content=DAGhx1v1w7w&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview",
    "type": "video",
    "description": "Levante cedo para viajar para Foz do Iguaçu e viva um dia incrível! 🌊✨ As Cataratas e o Parque das Aves são paradas obrigatórias nesse destino cheio de natureza. Nosso pacote inclui ✈️ passagens e 🏨 hospedagem para você começar o dia com o pé direito.\n✔️ Nada como um amanhecer rumo a um destino dos sonhos.\nFale com a gente pelo WhatsApp: (99) 9 9999-9999\n#AcordarCedo #ViagemDosSonhos #FériasIncríveis",
    "drive_url": "https://drive.google.com/file/d/10i5BGZUQ9BxjzOhbFCRQ-dJUhltV8nav/view?usp=drive_link"
  },
  {
    "title": "Fortaleza - CE",
    "url": "https://www.canva.com/design/DAGhx2zhYTo/TP_AUJzDtnYgSNnPH1pBQQ/view?utm_content=DAGhx2zhYTo&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview",
    "type": "video",
    "description": "Fortaleza - CE te espera para uma viagem inesquecível! 🌊✨ Reúna a galera e curta o sol, as praias como Morro Branco e a cultura vibrante do Ceará. Nosso pacote inclui ✈️ passagens, 🏨 hospedagem e passeios para explorar a cidade e arredores.\n✔️ Uma experiência perfeita para grupos de amigos ou família.\nPlaneje agora pelo WhatsApp: (99) 9 9999-9999\n#BoraPraFortaleza #ViagemComAmigos #FériasNaPraia",
    "drive_url": "https://drive.google.com/file/d/1EqYrTE5jDMNNBoSlL28CLuj3-1GuJGPb/view?usp=drive_link"
  },
  {
    "title": "Genipabu",
    "url": "https://www.canva.com/design/DAGhwaQuLJg/kKB3SFgHCa39cJx01EnpNg/view?utm_content=DAGhwaQuLJg&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview",
    "type": "video",
    "description": "Viaje em família para Genipabu! 🐪🌴 Conhecido pelas dunas e passeios de buggy, esse destino é perfeito para crianças e adultos. Outras opções incríveis incluem Gramado, Florianópolis e Pantanal, com pacotes que incluem ✈️ passagens e 🏨 hospedagem.\n✔️ Momentos inesquecíveis para todas as idades garantidos.\nPlaneje agora pelo WhatsApp: (99) 9 9999-9999\n#ViagemComCrianças #FériasEmFamília #Genipabu \nDestinos Internacionais ✈️",
    "drive_url": "https://drive.google.com/file/d/164zk3RU3OkQ_lfEVE9u9hw4y2YdDILnX/view?usp=drive_link"
  },
  {
    "title": "Gramado",
    "url": "https://www.canva.com/design/DAGhwMD4p38/n5PE59SkUst9g6gz9r8TGA/view?utm_content=DAGhwMD4p38&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview",
    "type": "video",
    "description": "Evite surpresas no aeroporto ao viajar para Gramado! 🧳✈️ Confira dicas para não ter problemas com excesso de bagagem e curta o charme da Serra Gaúcha, com suas ruas floridas e o clima europeu. Nosso pacote inclui ✈️ passagens e 🏨 hospedagem.\n✔️ Viaje tranquilo e aproveite cada momento sem estresse.\nFale com a gente pelo WhatsApp: (99) 9 9999-9999\n#DicasDeViagem #ExcessoDeBagagem #ViagemSemEstresse",
    "drive_url": "https://drive.google.com/file/d/11L2RzID7XdutobpsEidXivyKsuumC2zs/view?usp=drive_link"
  },
  {
    "title": "Jalapão - TO",
    "url": "https://www.canva.com/design/DAGhwEYMGGc/UG3YbQaMWIPKSpohnITB1w/view?utm_content=DAGhwEYMGGc&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview",
    "type": "video",
    "description": "Sonha com o Jalapão - TO? 🏜️🌄 Esse destino é famoso pelas dunas douradas, cachoeiras cristalinas e fervedouros únicos. Nosso pacote a partir de R$2.500 inclui ✈️ passagens, 🏨 hospedagem e passeios guiados para explorar o melhor da região.\n✔️ Uma experiência de tranquilidade e conexão com a natureza.\nGaranta sua viagem pelo WhatsApp: (99) 9 9999-9999\n#Jalapão #DestinoDosSonhos #FériasNoParaíso",
    "drive_url": "https://drive.google.com/file/d/112UUcnFQlh6a6j4QtLXuyX83KO9w6MKZ/view?usp=drive_link"
  },
  {
    "title": "Jericoacoara - CE",
    "url": "https://www.canva.com/design/DAGhxtB6T-o/RCEDEQt4lZNBjH4PvtHkag/view?utm_content=DAGhxtB6T-o&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview",
    "type": "video",
    "description": "Relaxe em Jericoacoara - CE, um dos destinos mais charmosos do Brasil! 🌅✨ Conhecida pelo pôr do sol na Duna do Por do Sol e pela Lagoa do Paraíso, Jeri é perfeita para quem ama natureza e tranquilidade. Nosso pacote inclui ✈️ passagens, 🏨 hospedagem e traslados, com parcelamento no boleto para facilitar sua viagem.\n✔️ Atendimento personalizado para você viajar sem preocupações.\nFale com a gente pelo WhatsApp: (99) 9 9999-9999\n#PlanejeSuasFérias #PacotesImperdíveis #FériasDosSonhos",
    "drive_url": "https://drive.google.com/file/d/11KjCpWManwQUucEcR5MNJWL-a5-U1jdr/view?usp=drive_link"
  },
  {
    "title": "Jericoacoara - CE 2",
    "url": "https://www.canva.com/design/DAGhxtB6T-o/RCEDEQt4lZNBjH4PvtHkag/view?utm_content=DAGhxtB6T-o&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview",
    "type": "video",
    "description": "Relaxe em Jericoacoara - CE, um dos destinos mais charmosos do Brasil! 🌅✨ Conhecida pelo pôr do sol na Duna do Por do Sol e pela Lagoa do Paraíso, Jeri é perfeita para quem ama natureza e tranquilidade. Nosso pacote inclui ✈️ passagens, 🏨 hospedagem e traslados, com parcelamento no boleto para facilitar sua viagem.\n✔️ Atendimento personalizado para você viajar sem preocupações.\nFale com a gente pelo WhatsApp: (99) 9 9999-9999\n#PlanejeSuasFérias #PacotesImperdíveis #FériasDosSonhos",
    "drive_url": "https://drive.google.com/file/d/11KjCpWManwQUucEcR5MNJWL-a5-U1jdr/view?usp=drive_link"
  },
  {
    "title": "João Pessoa",
    "url": "https://www.canva.com/design/DAGhwRksmlI/gyGrROLbdlUM3cT9tEzM7g/view?utm_content=DAGhwRksmlI&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview",
    "type": "video",
    "description": "✨ A aventura te espera com João Pessoa! ✈️🌍\\n\\n🔥 Nossos pacotes e conteúdos são criados para você colecionar momentos inesquecíveis sem preocupações.\\n\\n👇 Clique no link da BIO para aproveitar as melhores condições!\\n📲 (99) 9 9999-9999\\n\\n#JoãoPessoa #ViagemPerfeita #AgenciaDeViagens"
  },
  {
    "title": "Lençóis Maranhenses",
    "url": "https://www.canva.com/design/DAGhv3tKwjM/hkKEdAi4X4NLB0fkiaIMVw/view?utm_content=DAGhv3tKwjM&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview",
    "type": "video",
    "description": "✨ A aventura te espera com Lençóis Maranhenses! ✈️🌍\\n\\n🔥 Nossos pacotes e conteúdos são criados para você colecionar momentos inesquecíveis sem preocupações.\\n\\n👇 Clique no link da BIO para aproveitar as melhores condições!\\n📲 (99) 9 9999-9999\\n\\n#LençóisMaranhenses #ViagemPerfeita #AgenciaDeViagens"
  },
  {
    "title": "Maceió - AL",
    "url": "https://www.canva.com/design/DAGhw3sD28w/yFm8fW4z_5yXo0Xf_8_p_A/view?utm_content=DAGhw3sD28w&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview",
    "type": "video",
    "description": "Está na hora de planejar suas férias dos sonhos em Maceió - AL! 🌴✨ Curta 5 dias nesse paraíso nordestino com praias de águas cristalinas e coqueiros que parecem de cartão-postal. Nosso pacote inclui: ✈️ passagens aéreas de ida e volta, 🧳 bagagem despachada e 🏨 5 diárias em um hotel de luxo com vista para o mar. Tudo isso por apenas 10x de R$450,00!\n✔️ Um destino perfeito para relaxar e tirar fotos incríveis 📸.\nGaranta seu pacote agora no WhatsApp: (99) 9 9999-9999\n#ViajarÉViver #MaceióDream #AgenciaDeViagens",
    "drive_url": "https://drive.google.com/file/d/11EaH5lDoZ-vz7qlySeti0YlYF71VXQb8/view?usp=drive_link"
  },
  {
    "title": "Maceió - AL 2",
    "url": "https://www.canva.com/design/DAGhxmTOAhQ/wrNbplr_yXOl3ZDrWlJexQ/view?utm_content=DAGhxmTOAhQ&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview",
    "type": "video",
    "description": "Está na hora de planejar suas férias dos sonhos em Maceió - AL! 🌴✨ Curta 5 dias nesse paraíso nordestino com praias de águas cristalinas e coqueiros que parecem de cartão-postal. Nosso pacote inclui: ✈️ passagens aéreas de ida e volta, 🧳 bagagem despachada e 🏨 5 diárias em um hotel de luxo com vista para o mar. Tudo isso por apenas 10x de R$450,00!\n✔️ Um destino perfeito para relaxar e tirar fotos incríveis 📸.\nGaranta seu pacote agora no WhatsApp: (99) 9 9999-9999\n#ViajarÉViver #MaceióDream #AgenciaDeViagens",
    "drive_url": "https://drive.google.com/file/d/11EaH5lDoZ-vz7qlySeti0YlYF71VXQb8/view?usp=drive_link"
  },
  {
    "title": "Maragogi",
    "url": "https://www.canva.com/design/DAGhw_eHvbM/qxWP7WwLFPC7KF7NySVs4g/view?utm_content=DAGhw_eHvbM&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview",
    "type": "video",
    "description": "Descubra as maravilhas de Maragogi! 🐠🌴 Suas águas cristalinas e corais são perfeitas para snorkeling e passeios de buggy. Nosso pacote a partir de 10x de R$450,00 inclui ✈️ passagens, 🏨 hospedagem e traslados para você aproveitar o melhor do destino.\n✔️ Um pedacinho do paraíso brasileiro te espera.\nFale com a gente pelo WhatsApp: (99) 9 9999-9999\n#BelezasDoBrasil #ViajarPeloBrasil #FériasNoBrasil",
    "drive_url": "https://drive.google.com/file/d/10LeDT87lhcl9XFOck533SscCs5I2iqqZ/view?usp=drive_link"
  },
  {
    "title": "Maragogi - AL",
    "url": "https://www.canva.com/design/DAGhwJyD-m4/TE1xwqFNlGEAgV4gjLRX-w/view?utm_content=DAGhwJyD-m4&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview",
    "type": "video",
    "description": "Descubra as maravilhas de Maragogi! 🐠🌴 Suas águas cristalinas e corais são perfeitas para snorkeling e passeios de buggy. Nosso pacote a partir de 10x de R$450,00 inclui ✈️ passagens, 🏨 hospedagem e traslados para você aproveitar o melhor do destino.\n✔️ Um pedacinho do paraíso brasileiro te espera.\nFale com a gente pelo WhatsApp: (99) 9 9999-9999\n#BelezasDoBrasil #ViajarPeloBrasil #FériasNoBrasil",
    "drive_url": "https://drive.google.com/file/d/10LeDT87lhcl9XFOck533SscCs5I2iqqZ/view?usp=drive_link"
  },
  {
    "title": "Natal - RN",
    "url": "https://www.canva.com/design/DAGhwz53i7M/20_V42J1bT-lW9404WJ_7w/view?utm_content=DAGhwz53i7M&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview",
    "type": "video",
    "description": "Curta o calor em 3 paraísos: Natal - RN, Porto de Galinhas e Angra dos Reis! 🏖️☀️ Natal tem dunas incríveis e passeios de buggy em Genipabu, perfeitos para o verão. Nossos pacotes incluem ✈️ passagens e 🏨 hospedagem para você escolher seu destino favorito.\n✔️ Três opções de praias paradisíacas para suas férias.\nFale com a gente pelo WhatsApp: (99) 9 9999-9999\n #DestinosDeVerão #ViajarÉViver",
    "drive_url": "https://drive.google.com/file/d/1vYhYavLpGaDnMdvti8tmHV_CAsv-MLNG/view?usp=drive_link"
  },
  {
    "title": "Ouro Preto",
    "url": "https://www.canva.com/design/DAGhyI8YO-s/7t2BK0UOu13ckNb6PEbl6A/view?utm_content=DAGhyI8YO-s&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview",
    "type": "video",
    "description": "Planeje sua viagem para Ouro Preto com antecedência! 🏰✨ Para garantir as melhores ofertas em passagens e hospedagem, programe-se com 3 a 6 meses. Ouro Preto é famosa pela história, igrejas barrocas e o charme das ladeiras.\n✔️ Economize e evite imprevistos para uma viagem perfeita.\nFale com a gente pelo WhatsApp: (99) 9 9999-9999\n#DicasDeViagem #PlanejamentoDeViagem #FériasPerfeitas"
  },
  {
    "title": "Pantanal",
    "url": "https://www.canva.com/design/DAGhwGGAzDo/k-esCqBx31QG2ZoilCXc_w/view?utm_content=DAGhwGGAzDo&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview",
    "type": "video",
    "description": "Viva dias inesquecíveis no Pantanal! 🐾🌿 Conhecido pela biodiversidade, esse destino é ideal para safáris fotográficos e observação de animais como onças e jacarés. Nosso pacote para 2 adultos inclui ✈️ passagens e hospedagem, por apenas R$2.900.\n✔️ Uma aventura na natureza que você nunca vai esquecer.\nGaranta sua viagem pelo WhatsApp: (99) 9 9999-9999\n#PantanalDosSonhos #PacoteDeViagem #FériasInesquecíveis",
    "drive_url": "https://drive.google.com/file/d/11-A9Nw4g9P0pY-FbtgeV2PNQBir1qi3E/view?usp=drive_link"
  },
  {
    "title": "Porto de Galinhas",
    "url": "https://www.canva.com/design/DAGhwGiUmwQ/yUkdvMfiPGQS6oeEOVG3aQ/view?utm_content=DAGhwGiUmwQ&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview",
    "type": "video",
    "description": "Planeje sua viagem para Porto de Galinhas pelo nosso site! 🏖️✈️ Rápido, seguro e com ofertas exclusivas, nosso pacote inclui ✈️ passagens, 🏨 hospedagem e passeios para explorar as piscinas naturais e a vila charmosa de Porto.\n✔️ Tudo pronto para sua próxima aventura em poucos cliques.\nAcesse pelo WhatsApp: (99) 9 9999-9999\n#CompreOnline #PacotesDeViagem #FériasDosSonhos",
    "drive_url": "https://drive.google.com/file/d/113qBaiObhwaIVivBhxIVej7gAss1Ekci/view?usp=drive_link"
  },
  {
    "title": "Recife",
    "url": "https://www.canva.com/design/DAGhw3sD28w/yFm8fW4z_5yXo0Xf_8_p_A/view?utm_content=DAGhw3sD28w&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview",
    "type": "video",
    "description": "Busca conforto em Recife? 🌴✨ Nosso pacote para a capital pernambucana inclui café da manhã delicioso, Wi-Fi, TV e estacionamento, a partir de 10x de R$450,00. Explore o Recife Antigo e as praias de Boa Viagem com total comodidade.\n✔️ Tudo pensado para você relaxar e aproveitar ao máximo.\nFale com a gente pelo WhatsApp: (99) 9 9999-9999\n#PacotesCompletos #ViajarComConforto #BenefíciosExclusivos",
    "drive_url": "https://drive.google.com/file/d/10R4FB_cytxJtbLbyToePYOwBSuxpXE5A/view?usp=drive_link"
  },
  {
    "title": "Rio de Janeiro",
    "url": "https://www.canva.com/design/DAGhx_hxmTI/JpbgiwdrRa1oFsQX1cEJIA/view?utm_content=DAGhx_hxmTI&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview",
    "type": "video",
    "description": "Descubra o Rio de Janeiro e viva experiências únicas! 🌄✨ Conhecida como a Cidade Maravilhosa, o Rio tem o Cristo Redentor, o Pão de Açúcar e praias famosas como Copacabana. Nosso pacote inclui ✈️ passagens, 🏨 hospedagem e passeios para explorar os pontos turísticos mais icônicos.\n✔️ Uma viagem para se encantar com cada cantinho da cidade.\nEntre em contato pelo WhatsApp: (99) 9 9999-9999\n#ViajarÉViver #MagiaDosDestinos #FériasInesquecíveis",
    "drive_url": "https://drive.google.com/file/d/10WyscibbG8F45bzSUJ0LWxhRYNBq9UiX/view?usp=drive_link"
  },
  {
    "title": "Rota das Emoções",
    "url": "https://www.canva.com/design/DAGhwfgi3L4/WT5FvMVg4ZV26zgCdLBV-A/view?utm_content=DAGhwfgi3L4&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview",
    "type": "video",
    "description": "Cada passo da sua viagem pela Rota das Emoções é memorável! 🏜️🚤 Esse roteiro inclui Lençóis Maranhenses, Delta do Parnaíba e Jericoacoara, com paisagens de tirar o fôlego. Nosso pacote oferece ✈️ passagens, 🏨 hospedagem e passeios guiados para curtir cada detalhe.\n✔️ A aventura está em cada parada dessa jornada incrível.\nFale com a gente pelo WhatsApp: (99) 9 9999-9999\n#JornadaDeViagem #FériasIncríveis #ExperiênciasInesquecíveis"
  },
  {
    "title": "Salvador - BA",
    "url": "https://www.canva.com/design/DAGhw9-Yw7k/g_192p953xYd8gGf3D7W9w/view?utm_content=DAGhw9-Yw7k&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview",
    "type": "video",
    "description": "Viajar para Salvador - BA é colecionar momentos inesquecíveis! 🎭🌴 Explore o Pelourinho, prove o acarajé e sinta a energia única da Bahia. Nossos pacotes oferecem ✈️ passagens e 🏨 hospedagem, para você viver uma experiência cultural rica e vibrante.\n✔️ Invista em memórias que valem mais que qualquer coisa.\nPlaneje pelo WhatsApp: (99) 9 9999-9999\n#ViajarÉInvestir #FériasPerfeitas #MomentosInesquecíveis",
    "drive_url": "https://drive.google.com/file/d/11Ea8Vvrgff2o7h-FKfeHpvmAPG6mnd4M/view?usp=drive_link"
  },
  {
    "title": "Trancoso - BA",
    "url": "https://www.canva.com/design/DAGhx91gbYs/ZrP6pSy-0JFNwSuMRCuL0g/view?utm_content=DAGhx91gbYs&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview",
    "type": "video",
    "description": "Planeje sua viagem dos sonhos para Trancoso - BA! 🏖️✨ Com praias paradisíacas e um centrinho charmoso, Trancoso é perfeito para relaxar e curtir a natureza. Nossos pacotes personalizados incluem ✈️ passagens, 🏨 hospedagem e passeios, com parcelamento em até 12x.\n✔️ Um destino incrível para quem busca paz e beleza.\nFale com a gente pelo WhatsApp: (99) 9 9999-9999\n#ExplorarOMundo #PacotesDeViagem #FériasPerfeitas",
    "drive_url": "https://drive.google.com/file/d/11E5sLSzQwF5DkCQG43uh5492tDNcmuRF/view?usp=drive_link"
  }
];

export const feedTemplates: Template[] = [
  {
    id: "local-feed-1",
    title: "Pacote Maragogi (Grátis)",
    url: "https://www.canva.com/design/DAHCpqz2lQ8/fAODQlar4Sd_e9IdHz3UdA/view?utm_content=DAHCpqz2lQ8&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview",
    type: "feed",
    image_url: "/artes/arte-gratis-1.webp",
    is_new: true
    },
  {
    id: "local-feed-2",
    title: "Rio de Janeiro (Grátis)",
    url: "https://www.canva.com/design/DAHCpiGNm10/53d8yEuYU_wX6aoU1rYdPQ/view?utm_content=DAHCpiGNm10&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview",
    type: "feed",
    image_url: "/artes/arte-gratis-2.webp",
    is_new: true
    },
  {
    id: "local-feed-3",
    title: "3 Desejos para o Feriado",
    url: "https://www.canva.com/design/DAGiOUhpooE/LmnTreX2G68yNYErZ9mdHw/view?utm_content=DAGiOUhpooE&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview",
    type: "feed",
    image_url: "/artes/arte-paga-1.webp",
    is_new: true
    },
  {
    id: "local-feed-4",
    title: "Explorar o Mundo",
    url: "https://www.canva.com/design/DAGiOUhpooE/LmnTreX2G68yNYErZ9mdHw/view?utm_content=DAGiOUhpooE&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview",
    type: "feed",
    image_url: "/artes/arte-paga-2.webp",
    is_new: true
    },
  { title: "Feed Arte 1", url: "https://www.canva.com/design/DAGiNV9zcOg/jXSDpSTmksgu1fRODn9e0g/view?utm_content=DAGiNV9zcOg&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview", type: "feed"   },
  { title: "Feed Arte 2", url: "https://www.canva.com/design/DAGifn0vJ5I/LtyUY9gGlChc-pxvei3bsw/view?utm_content=DAGifn0vJ5I&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview", type: "feed"   },
  { title: "Feed Arte 3", url: "https://www.canva.com/design/DAGiOBEVLY8/xT87ZDCn_VKeK6AXMCr0yQ/view?utm_content=DAGiOBEVLY8&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview", type: "feed"   },
  { title: "Feed Arte 5", url: "https://www.canva.com/design/DAGiOUhpooE/LmnTreX2G68yNYErZ9mdHw/view?utm_content=DAGiOUhpooE&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview", type: "feed"   },
];

export const storyTemplates: Template[] = [
  { title: "Story Arte 1", url: "https://www.canva.com/design/DAGiOVX_JZY/F4R-fuuQ7B8DerVl9yH0Jw/view?utm_content=DAGiOVX_JZY&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview", type: "story"   },
  { title: "Story Arte 2", url: "https://www.canva.com/design/DAGifzSI834/3aBvmcMoWMa4pfE1vo9PTA/view?utm_content=DAGifzSI834&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview", type: "story"   },
];

export const weeklyStories: Template[] = [
  { title: "Semana 1", url: "https://www.canva.com/design/DAGie5Ni45g/Mp-nIDB59t5TX9aAUFX1mQ/view?utm_content=DAGie5Ni45g&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview", type: "story"   },
  { title: "Semana 2", url: "https://www.canva.com/design/DAGifpaTJCg/TXjUXR3HBYiJVU3IpVNurA/view?utm_content=DAGifpaTJCg&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview", type: "story"   },
  { title: "Semana 3", url: "https://www.canva.com/design/DAGhttuR8tQ/GlvKUT5ZX5yXcpRAN6AMIw/view?utm_content=DAGhttuR8tQ&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview", type: "story"   },
  { title: "Semana 4", url: "https://www.canva.com/design/DAGi29_D8kg/JOCZKABeWOkAKZAK3WT0lQ/view?utm_content=DAGi29_D8kg&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview", "type": "story"   },
];

export const aiTools = [
  {
    title: "IA Vendedor de Viagens (novo)",
    url: "/vendedor-ia",
    icon: "🤖",
    description: "Assistente IA para vender viagens"
  },
  {
    title: "Criador de Headlines (Mr. Beast)",
    url: "https://chatgpt.com/g/g-mXIK1OLtB-headlines-de-alto-impacto",
    icon: "🎯",
    description: "Crie títulos de alto impacto para seus conteúdos"
  },
  {
    title: "Criador de Promessas Únicas",
    url: "https://chatgpt.com/g/g-pvCUBPOH1-gerador-de-promessas-com-mecanismo-unico",
    icon: "✨",
    description: "Gere promessas com mecanismo único"
  },
  {
    title: "Criador de Quizz 2.0",
    url: "https://chatgpt.com/g/g-673e0736558881918f8e65ed8c8c5e81-funil-de-quiz-2-0",
    icon: "❓",
    description: "Crie funis de quiz interativos"
  },
  {
    title: "Mapa de Dores e Desejos",
    url: "https://chatgpt.com/g/g-673e2ac6d1f08191bac9d38be1970598-mapa-de-dores-e-desejos",
    icon: "🎯",
    description: "Mapeie dores e desejos do seu público"
  },
  {
    title: "Criador de Cursos em Vídeo",
    url: "https://chatgpt.com/g/g-e53YJbtqR-criador-de-cursos-em-video",
    icon: "🎓",
    description: "Desenvolva cursos em vídeo profissionais"
  },
  {
    title: "Criador de Bônus e Order Bumps",
    url: "https://chatgpt.com/g/g-gYZKgxBX6-criador-de-bonus-e-order-bumps",
    icon: "🎁",
    description: "Crie bônus e ofertas irresistíveis"
  },
  {
    title: "Corpo de Anúncios",
    url: "https://chatgpt.com/g/g-67e9da4bd78881919f6c27aa46c0c076-corpo-de-anuncios",
    icon: "📝",
    description: "Desenvolva textos persuasivos para anúncios"
  },
  {
    title: "9 Óticas de Hooks",
    url: "https://chatgpt.com/g/g-67e9d49f4dc88191b0e9e850ef4bb8ed-9-oticas-de-hooks",
    icon: "🪝",
    description: "Crie ganchos com 9 óticas diferentes"
  },
];

// Narração de Ofertas separada para ficar em primeiro
export const narracaoTool = {
  title: "Narração de Ofertas de Viagens",
  url: "https://chatgpt.com/g/g-zuVzD4urh-redador",
  icon: "🎙️",
  description: "Narrar com sua voz - Crie narrações profissionais para vídeos"
};

// IA Vendedor de Viagens - ferramenta nova
export const iaVendedorTool = {
  title: "IA Vendedor de Viagens",
  url: "/vendedor-ia",
  icon: "🤖",
  is_new: true
  };

export const resources = [
  {
    name: "PDF de Produtos",
    url: "https://bit.ly/150videos-destinos",
    icon: "📄"
  },
  {
    name: "Comunidade Agente Lucrativo",
    url: "https://hotmart.com/pt-br/club/agente-lucrativo",
    icon: "👥"
  },
  {
    name: "Grupo WhatsApp",
    url: "https://chat.whatsapp.com/Glq12Ih9jOz5IhtHJ98ud0",
    icon: "💬"
  },
  {
    name: "Calendário Editorial",
    url: "https://www.notion.so/PLANNER-DE-AG-NCIA-DE-VIAGENS-LUCRATIVA-22ca83fea5d080dc9826fb043d5d000a",
    icon: "📅"
  }
];

export const videoDownloads = [
  {
    name: "Vídeos Internacionais",
    url: "https://drive.google.com/drive/folders/10LWKcjLVA6L1FLkzRGDpDmCkKlTHoNOu",
    icon: "🌍"
  },
  {
    name: "Vídeos Nacionais",
    url: "https://drive.google.com/drive/folders/10KCEnIdj6oC8rtOAEl-G0nHtPfC56ln9?usp=drive_link",
    icon: "🇧🇷"
  },
  {
    name: "Vídeos Extras",
    url: "https://drive.google.com/drive/folders/14uF1au_WY7XI5X2lfkQUKq8LGVl0OHO7",
    icon: "⭐"
  }
];
