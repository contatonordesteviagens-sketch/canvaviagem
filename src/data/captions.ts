export interface Caption {
  destination: string;
  text: string;
  hashtags: string;
  category?: 'nacional' | 'internacional';
}

export const captions: Caption[] = [
  // Destinos Nacionais
  {
    destination: "Maragogi - AL",
    text: "Busca aventura em Maragogi - AL? 🏊‍♂️🌊 Conhecido como o \"Caribe Brasileiro\", Maragogi tem águas cristalinas perfeitas para mergulho e passeios de catamarã. Nossos pacotes cheios de adrenalina incluem ✈️ passagens e hospedagem, a partir de 10x de R$190,00.\n✔️ Ideal para quem ama explorar e se divertir ao máximo.\nGaranta sua vaga pelo WhatsApp: (99) 9 9999-9999",
    hashtags: "#DestinoDeAventura #PacotesDeViagem #ViagemAventura",
    category: "nacional"
  },
  {
    destination: "Salvador - BA",
    text: "Viajar para Salvador - BA é colecionar momentos inesquecíveis! 🎭🌴 Explore o Pelourinho, prove o acarajé e sinta a energia única da Bahia. Nossos pacotes oferecem ✈️ passagens e 🏨 hospedagem, para você viver uma experiência cultural rica e vibrante.\n✔️ Invista em memórias que valem mais que qualquer coisa.\nPlaneje pelo WhatsApp: (99) 9 9999-9999",
    hashtags: "#ViajarÉInvestir #FériasPerfeitas #MomentosInesquecíveis",
    category: "nacional"
  },
  {
    destination: "Trancoso - BA",
    text: "Planeje sua viagem dos sonhos para Trancoso - BA! 🏖️✨ Com praias paradisíacas e um centrinho charmoso, Trancoso é perfeito para relaxar e curtir a natureza. Nossos pacotes personalizados incluem ✈️ passagens, 🏨 hospedagem e passeios, com parcelamento em até 12x.\n✔️ Um destino incrível para quem busca paz e beleza.\nFale com a gente pelo WhatsApp: (99) 9 9999-9999",
    hashtags: "#ExplorarOMundo #PacotesDeViagem #FériasPerfeitas",
    category: "nacional"
  },
  {
    destination: "Jalapão - TO",
    text: "Sonha com o Jalapão - TO? 🏜️🌄 Esse destino é famoso pelas dunas douradas, cachoeiras cristalinas e fervedouros únicos. Nosso pacote a partir de R$2.500 inclui ✈️ passagens, 🏨 hospedagem e passeios guiados para explorar o melhor da região.\n✔️ Uma experiência de tranquilidade e conexão com a natureza.\nGaranta sua viagem pelo WhatsApp: (99) 9 9999-9999",
    hashtags: "#Jalapão #DestinoDosSonhos #FériasNoParaíso",
    category: "nacional"
  },
  {
    destination: "Foz do Iguaçu",
    text: "Reduza o estresse em Foz do Iguaçu! 🌊✨ As Cataratas do Iguaçu são uma das 7 Maravilhas Naturais do Mundo, perfeitas para quem busca renovar as energias. Nosso pacote inclui ✈️ passagens e 🏨 hospedagem, para você relaxar e conhecer a cultura local.\n✔️ Uma viagem para desconectar e aprender com o mundo.\nPlaneje agora pelo WhatsApp: (99) 9 9999-9999",
    hashtags: "#ViajarÉViver #ReduçãoDoEstresse #ExplorandoNovasCulturas",
    category: "nacional"
  },
  {
    destination: "Florianópolis - SC",
    text: "Relembre momentos incríveis em Florianópolis - SC! 🏖️🌅 Conhecida como a \"Ilha da Magia\", Floripa tem praias para todos os gostos, de Jurerê a Campeche. Nosso pacote inclui ✈️ passagens e 🏨 hospedagem, para você planejar sua próxima viagem dos sonhos.\n✔️ Um destino com paisagens de tirar o fôlego e muita diversão.\nDescubra mais pelo WhatsApp: (99) 9 9999-9999",
    hashtags: "#Florianópolis #TBTDeViagem #DestinoIncrível",
    category: "nacional"
  },
  {
    destination: "Gramado",
    text: "Evite imprevistos em Gramado! 🎄✨ Chegue cedo ao aeroporto e mantenha seus documentos como passaporte 🛂 e identidade à mão para uma viagem tranquila. Gramado é famosa pelo Natal Luz e pela arquitetura encantadora.\n✔️ Dicas para curtir o charme da Serra Gaúcha sem estresse.\nPlaneje pelo WhatsApp: (99) 9 9999-9999",
    hashtags: "#DicasDeViagem #ViajarSemEstresse #PlanejamentoDeViagem",
    category: "nacional"
  },
  {
    destination: "Natal - RN",
    text: "Curta o calor em 3 paraísos: Natal - RN, Porto de Galinhas e Angra dos Reis! 🏖️☀️ Natal tem dunas incríveis e passeios de buggy em Genipabu, perfeitos para o verão. Nossos pacotes incluem ✈️ passagens e 🏨 hospedagem para você escolher seu destino favorito.\n✔️ Três opções de praias paradisíacas para suas férias.\nFale com a gente pelo WhatsApp: (99) 9 9999-9999",
    hashtags: "#DestinosDeVerão #ViajarÉViver",
    category: "nacional"
  },
  {
    destination: "Fortaleza - CE",
    text: "Fortaleza - CE te espera para uma viagem inesquecível! 🌊✨ Reúna a galera e curta o sol, as praias como Morro Branco e a cultura vibrante do Ceará. Nosso pacote inclui ✈️ passagens, 🏨 hospedagem e passeios para explorar a cidade e arredores.\n✔️ Uma experiência perfeita para grupos de amigos ou família.\nPlaneje agora pelo WhatsApp: (99) 9 9999-9999",
    hashtags: "#BoraPraFortaleza #ViagemComAmigos #FériasNaPraia",
    category: "nacional"
  },
  {
    destination: "Pantanal",
    text: "Viva dias inesquecíveis no Pantanal! 🐾🌿 Conhecido pela biodiversidade, esse destino é ideal para safáris fotográficos e observação de animais como onças e jacarés. Nosso pacote para 2 adultos inclui ✈️ passagens e hospedagem, por apenas R$2.900.\n✔️ Uma aventura na natureza que você nunca vai esquecer.\nGaranta sua viagem pelo WhatsApp: (99) 9 9999-9999",
    hashtags: "#PantanalDosSonhos #PacoteDeViagem #FériasInesquecíveis",
    category: "nacional"
  },
  {
    destination: "Rio de Janeiro",
    text: "Descubra o Rio de Janeiro e viva experiências únicas! 🌄✨ Conhecida como a Cidade Maravilhosa, o Rio tem o Cristo Redentor, o Pão de Açúcar e praias famosas como Copacabana. Nosso pacote inclui ✈️ passagens, 🏨 hospedagem e passeios para explorar os pontos turísticos mais icônicos.\n✔️ Uma viagem para se encantar com cada cantinho da cidade.\nEntre em contato pelo WhatsApp: (99) 9 9999-9999",
    hashtags: "#ViajarÉViver #MagiaDosDestinos #FériasInesquecíveis",
    category: "nacional"
  },
  {
    destination: "Recife",
    text: "Busca conforto em Recife? 🌴✨ Nosso pacote para a capital pernambucana inclui café da manhã delicioso, Wi-Fi, TV e estacionamento, a partir de 10x de R$450,00. Explore o Recife Antigo e as praias de Boa Viagem com total comodidade.\n✔️ Tudo pensado para você relaxar e aproveitar ao máximo.\nFale com a gente pelo WhatsApp: (99) 9 9999-9999",
    hashtags: "#PacotesCompletos #ViajarComConforto #BenefíciosExclusivos",
    category: "nacional"
  },
  {
    destination: "Balneário Camboriú",
    text: "Sonha com Balneário Camboriú? 🏙️🏖️ Conhecida pelos arranha-céus e pela praia central, esse destino é perfeito para quem busca diversão e modernidade. Nosso pacote a partir de R$2.500 inclui ✈️ passagens, 🏨 hospedagem e passeios como o Parque Unipraias.\n✔️ Um destino para curtir dias de sol e agito.\nGaranta sua vaga pelo WhatsApp: (99) 9 9999-9999",
    hashtags: "#BalneárioCamboriú #DestinoDosSonhos #FériasIncríveis",
    category: "nacional"
  },
  {
    destination: "Alter do Chão",
    text: "Explore novos horizontes em Alter do Chão! 🏝️🌊 Conhecido como o \"Caribe Amazônico\", esse destino tem praias de água doce e uma vibe única. Nossos pacotes especiais incluem ✈️ passagens, 🏨 hospedagem e passeios de barco, com condições facilitadas de pagamento.\n✔️ Um paraíso no coração da Amazônia para sua próxima aventura.\nPlaneje pelo WhatsApp: (99) 9 9999-9999",
    hashtags: "#ExploreOMundo #PacoteDeViagem #ViagemSemComplicações",
    category: "nacional"
  },
  {
    destination: "Maragogi",
    text: "Descubra as maravilhas de Maragogi! 🐠🌴 Suas águas cristalinas e corais são perfeitas para snorkeling e passeios de buggy. Nosso pacote a partir de 10x de R$450,00 inclui ✈️ passagens, 🏨 hospedagem e traslados para você aproveitar o melhor do destino.\n✔️ Um pedacinho do paraíso brasileiro te espera.\nFale com a gente pelo WhatsApp: (99) 9 9999-9999",
    hashtags: "#BelezasDoBrasil #ViajarPeloBrasil #FériasNoBrasil",
    category: "nacional"
  },
  {
    destination: "Arraial do Cabo",
    text: "Crie memórias inesquecíveis em Arraial do Cabo! 🏖️📸 Com praias como a Prainha e passeios de barco para a Praia do Farol, esse destino é um sonho para quem ama o mar. Nossos pacotes oferecem ✈️ passagens e 🏨 hospedagem para você viver momentos únicos.\n✔️ Viajar é a melhor forma de colecionar experiências.\nPlaneje sua viagem pelo WhatsApp: (99) 9 9999-9999",
    hashtags: "#ColecioneMemórias #ExperiênciasInesquecíveis #FériasDosSonhos",
    category: "nacional"
  },
  {
    destination: "Rota das Emoções",
    text: "Cada passo da sua viagem pela Rota das Emoções é memorável! 🏜️🚤 Esse roteiro inclui Lençóis Maranhenses, Delta do Parnaíba e Jericoacoara, com paisagens de tirar o fôlego. Nosso pacote oferece ✈️ passagens, 🏨 hospedagem e passeios guiados para curtir cada detalhe.\n✔️ A aventura está em cada parada dessa jornada incrível.\nFale com a gente pelo WhatsApp: (99) 9 9999-9999",
    hashtags: "#JornadaDeViagem #FériasIncríveis #ExperiênciasInesquecíveis",
    category: "nacional"
  },
  {
    destination: "Maceió - AL",
    text: "Está na hora de planejar suas férias dos sonhos em Maceió - AL! 🌴✨ Curta 5 dias nesse paraíso nordestino com praias de águas cristalinas e coqueiros que parecem de cartão-postal. Nosso pacote inclui: ✈️ passagens aéreas de ida e volta, 🧳 bagagem despachada e 🏨 5 diárias em um hotel de luxo com vista para o mar. Tudo isso por apenas 10x de R$450,00!\n✔️ Um destino perfeito para relaxar e tirar fotos incríveis 📸.\nGaranta seu pacote agora no WhatsApp: (99) 9 9999-9999",
    hashtags: "#ViajarÉViver #MaceióDream #AgenciaDeViagens",
    category: "nacional"
  },
  {
    destination: "Lençóis Maranhenses",
    text: "Desconecte-se nos Lençóis Maranhenses, um dos destinos mais impressionantes do Brasil! 🏜️✨ Com dunas brancas e lagoas cristalinas, esse paraíso é perfeito para quem ama natureza. Nosso pacote especial inclui: 5 noites para 2 adultos, ✈️ passagens aéreas e traslados, tudo por 10x de R$450,00.\n✔️ Uma experiência única para relaxar e se encantar com a beleza natural.\nReserve agora pelo WhatsApp: (99) 9 9999-9999",
    hashtags: "#LençóisMaranhenses #DestinoDosSonhos #FériasPerfeitas",
    category: "nacional"
  },
  {
    destination: "Fernando de Noronha",
    text: "Planeje sua viagem para Fernando de Noronha sem preocupações! 🐠🏝️ Esse arquipélago é famoso pelas praias paradisíacas e vida marinha rica, ideal para mergulhos inesquecíveis. Nosso pacote completo inclui ✈️ passagens aéreas, 🏨 hospedagem em pousada charmosa e até opções de passeios para explorar a ilha, tudo em até 10x sem juros.\n✔️ Suporte personalizado para você curtir cada momento.\nFale conosco pelo WhatsApp: (99) 9 9999-9999",
    hashtags: "#ViajarSemPreocupação #PacoteDeViagem #AgenciaDeViagens",
    category: "nacional"
  },
  {
    destination: "Angra dos Reis",
    text: "Transforme seus sonhos em realidade em Angra dos Reis! ⛵🌊 Com mais de 300 ilhas e águas cristalinas, esse destino é perfeito para quem busca tranquilidade e beleza natural. Nossos pacotes personalizados incluem ✈️ passagens, 🏨 hospedagem e passeios de barco para explorar as ilhas, tudo planejado para uma experiência incrível.\n✔️ Uma viagem para relaxar e se encantar com o mar.\nPlaneje sua aventura pelo WhatsApp: (99) 9 9999-9999",
    hashtags: "#ExplorarOMundo #ViagemSemComplicação #AgenciaDeViagens",
    category: "nacional"
  },
  {
    destination: "Jericoacoara - CE",
    text: "Relaxe em Jericoacoara - CE, um dos destinos mais charmosos do Brasil! 🌅✨ Conhecida pelo pôr do sol na Duna do Por do Sol e pela Lagoa do Paraíso, Jeri é perfeita para quem ama natureza e tranquilidade. Nosso pacote inclui ✈️ passagens, 🏨 hospedagem e traslados, com parcelamento no boleto para facilitar sua viagem.\n✔️ Atendimento personalizado para você viajar sem preocupações.\nFale com a gente pelo WhatsApp: (99) 9 9999-9999",
    hashtags: "#PlanejeSuasFérias #PacotesImperdíveis #FériasDosSonhos",
    category: "nacional"
  },
  {
    destination: "Porto de Galinhas",
    text: "Suas férias estão chegando, e Porto de Galinhas te espera! 🏖️🐠 Não deixe para última hora: esse destino é famoso pelas piscinas naturais e praias de areia branca. Nosso pacote inclui ✈️ passagens, 🏨 hospedagem e passeios para explorar as belezas da região, tudo organizado para você.\n✔️ Uma viagem perfeita, sem estresse, com cada detalhe planejado.\nFale agora pelo WhatsApp: (99) 9 9999-9999",
    hashtags: "#PlanejeSuasFérias #ViagemSemEstresse #FériasPerfeitas",
    category: "nacional"
  },
  {
    destination: "Amazônia",
    text: "Embarque em um cruzeiro completo pela Amazônia! 🌿🚤 Desfrute de 5 dias navegando pelos rios, com gastronomia regional, atividades como trilhas e observação de botos, e paradas em comunidades locais. Nosso pacote inclui tudo: alimentação, passeios e hospedagem a bordo, com parcelamento facilitado.\n✔️ Uma experiência única para se conectar com a natureza.\nReserve pelo WhatsApp: (99) 9 9999-9999",
    hashtags: "#CruzeiroDosSonhos #EmbarqueJá #FériasInesquecíveis",
    category: "nacional"
  },
  {
    destination: "Amazonas",
    text: "Invista em experiências no Amazonas! 🌳✨ Conheça a Floresta Amazônica, navegue pelos rios e aprenda sobre a cultura indígena local. Cada destino traz aprendizados e memórias que valem mais que qualquer bem material, e nosso pacote inclui ✈️ passagens e 🏨 hospedagem.\n✔️ Fique rico em histórias para contar por toda a vida.\nPlaneje pelo WhatsApp: (99) 9 9999-9999",
    hashtags: "#LembreteDeViagem #ExperiênciasIncríveis #ColecioneMomentos",
    category: "nacional"
  },
  {
    destination: "Alagoas",
    text: "Desbrave Alagoas com pacotes a partir de R$2.500! 🏖️🌊 Explore praias como São Miguel dos Milagres e Pajuçara, com suas águas mornas e cenários perfeitos para relaxar. Nosso pacote inclui ✈️ passagens, 🏨 hospedagem e passeios para conhecer o melhor da região.\n✔️ Um destino nacional cheio de belezas para descobrir.\nFale com a gente pelo WhatsApp: (99) 9 9999-9999",
    hashtags: "#ExploreOMundo #PacotesNacionais #FériasIncríveis",
    category: "nacional"
  },
  {
    destination: "Florianópolis",
    text: "Cada viagem para Florianópolis é um novo capítulo na sua vida! 🏝️📸 Conhecida pelas praias e pela vibe descontraída, Floripa tem opções para todos os gostos, de surfe a trilhas. Nosso pacote inclui ✈️ passagens e 🏨 hospedagem para você criar memórias inesquecíveis.\n✔️ Uma aventura única na Ilha da Magia te espera.\nPlaneje agora pelo WhatsApp: (99) 9 9999-9999",
    hashtags: "#NovaHistória #FériasIncríveis #ColecioneMomentos",
    category: "nacional"
  },
  {
    destination: "Genipabu",
    text: "Viaje em família para Genipabu! 🐪🌴 Conhecido pelas dunas e passeios de buggy, esse destino é perfeito para crianças e adultos. Outras opções incríveis incluem Gramado, Florianópolis e Pantanal, com pacotes que incluem ✈️ passagens e 🏨 hospedagem.\n✔️ Momentos inesquecíveis para todas as idades garantidos.\nPlaneje agora pelo WhatsApp: (99) 9 9999-9999",
    hashtags: "#ViagemComCrianças #FériasEmFamília #Genipabu",
    category: "nacional"
  },
  {
    destination: "João Pessoa",
    text: "Não perca seu voo para João Pessoa! ✈️🛂 Chegue com antecedência ao aeroporto, faça o check-in online e configure alarmes no celular para o horário de embarque. João Pessoa tem praias lindas como Tambaú e uma orla perfeita para caminhadas.\n✔️ Dicas para uma viagem tranquila e sem correrias.\nFale com a gente pelo WhatsApp: (99) 9 9999-9999",
    hashtags: "#DicasDeViagem #NaoPercaSeuVoo #ViagemSemEstresse",
    category: "nacional"
  },
  {
    destination: "Ouro Preto",
    text: "Planeje sua viagem para Ouro Preto com antecedência! 🏰✨ Para garantir as melhores ofertas em passagens e hospedagem, programe-se com 3 a 6 meses. Ouro Preto é famosa pela história, igrejas barrocas e o charme das ladeiras.\n✔️ Economize e evite imprevistos para uma viagem perfeita.\nFale com a gente pelo WhatsApp: (99) 9 9999-9999",
    hashtags: "#DicasDeViagem #PlanejamentoDeViagem #FériasPerfeitas",
    category: "nacional"
  },
  {
    destination: "5 Praias Floripa",
    text: "Prepare-se para 5 Praias Floripa! 🏖️✈️ Leve um adaptador universal, contrate um seguro viagem e verifique passaporte 🛂 e identidade para evitar imprevistos. Florianópolis tem praias incríveis como Joaquina e Daniela, perfeitas para o verão.\n✔️ Itens essenciais para curtir a Ilha da Magia sem preocupações.\nPlaneje pelo WhatsApp: (99) 9 9999-9999",
    hashtags: "#DicasDeViagem #ViagemNacional #FériasPerfeitas",
    category: "nacional"
  },
  // Destinos Internacionais
  {
    destination: "Cuzumel",
    text: "Explore Cuzumel com conforto e sem preocupações! 🏝️🌊 Esse paraíso mexicano é famoso pelos recifes de corais e mergulhos incríveis. Nosso pacote inclui 5 diárias, ✈️ passagens de ida e volta, transfer do aeroporto ao hotel e passeios exclusivos, por apenas R$1.500 por pessoa.\n✔️ Uma viagem para relaxar e explorar o Caribe.\nGaranta sua viagem pelo WhatsApp: (99) 9 9999-9999",
    hashtags: "#DescubraCuzumel #PacotesDeViagem #FériasInesquecíveis",
    category: "internacional"
  },
  {
    destination: "Filipinas",
    text: "Faça uma viagem rápida e econômica para as Filipinas! 🏖️✈️ Conhecidas pelas praias de Boracay e Palawan, as Filipinas são um destino dos sonhos. Nosso pacote inclui ✈️ passagens aéreas de ida e volta de São Paulo, por apenas R$520,00.\n✔️ Conforto e tranquilidade para explorar esse paraíso asiático.\nGaranta sua passagem pelo WhatsApp: (99) 9 9999-9999",
    hashtags: "#ViagemEconomica #PassagensAéreas #Filipinas",
    category: "internacional"
  },
  {
    destination: "Namíbia",
    text: "Celebre o Dia do Turista em Namíbia! 🏜️📸 Explore desertos como o Namib, safáris com elefantes e a cultura local única. Nossos pacotes oferecem ✈️ passagens e 🏨 hospedagem para você viver aventuras inesquecíveis nesse destino africano.\n✔️ O mundo é cheio de descobertas para viajantes apaixonados.\nPlaneje sua viagem pelo WhatsApp: (99) 9 9999-9999",
    hashtags: "#DiaDoTurista #ExplorarOMundo #FériasInesquecíveis",
    category: "internacional"
  },
  {
    destination: "Montevidéu",
    text: "Proporcione uma experiência mágica em Montevidéu! 🏙️✨ A capital uruguaia tem um charme único, com a Rambla, o Mercado del Puerto e o centro histórico. Nosso pacote em até 12x sem juros inclui ✈️ passagens, 🏨 hospedagem e passeios para conhecer a cidade.\n✔️ Viva momentos únicos nesse destino sul-americano.\nGaranta seu pacote pelo WhatsApp: (99) 9 9999-9999",
    hashtags: "#Montevidéu #FériasInternacionais #MagiaDaViagem",
    category: "internacional"
  },
  {
    destination: "Fort Lauderdale",
    text: "Viaje para Fort Lauderdale com conforto! 🏖️✈️ Leve travesseiro de pescoço, vista roupas leves e hidrate-se durante o voo para aproveitar ao máximo. Conhecida como a \"Veneza da América\", Fort Lauderdale tem canais e praias lindas.\n✔️ Dicas para um voo tranquilo e uma viagem inesquecível.\nPlaneje pelo WhatsApp: (99) 9 9999-9999",
    hashtags: "#DicasDeViagem #ConfortoNosVoos #VooConfortável",
    category: "internacional"
  },
  {
    destination: "Lisboa",
    text: "Sonha com neve em Lisboa? ❄️✨ Embora Lisboa seja mais conhecida pelo clima ameno, você pode curtir destinos nevados como Zermatt, Valle Nevado e Bariloche. Nossos pacotes incluem ✈️ passagens e 🏨 hospedagem para um inverno mágico.\n✔️ Escolha seu destino gelado e viva o frio com estilo.\nFale com a gente pelo WhatsApp: (99) 9 9999-9999",
    hashtags: "#DestinosDeNeve #ViagemDeInverno #Lisboa",
    category: "internacional"
  },
  {
    destination: "Paris",
    text: "Deixe tudo por nossa conta em Paris! 🗼✈️ A Cidade Luz é perfeita para quem ama arte, gastronomia e romantismo. Nosso pacote inclui ✈️ passagens, 🏨 hospedagem e passeios para o Louvre, Torre Eiffel e Montmartre, com suporte completo.\n✔️ Viaje sem preocupações e viva a magia parisiense.\nFale com a gente pelo WhatsApp: (99) 9 9999-9999",
    hashtags: "#AgenciaDeViagens #PacotesDeViagem #ViajarÉViver",
    category: "internacional"
  },
  {
    destination: "Nova Zelândia",
    text: "Encante-se com a Nova Zelândia! 🏔️✨ Com paisagens de tirar o fôlego, como os fiordes de Milford Sound e as locações de \"O Senhor dos Anéis\", esse destino é um sonho. Nosso pacote em até 10x de R$850,00 inclui ✈️ passagens e 🏨 hospedagem.\n✔️ Uma viagem para explorar a natureza e a cultura Maori.\nGaranta sua viagem pelo WhatsApp: (99) 9 9999-9999",
    hashtags: "#NovaZelândia #PacotesDeViagem #FériasNaNatureza",
    category: "internacional"
  },
  {
    destination: "Taiwan",
    text: "Cada aventura em Taiwan faz parte de quem somos! 🏯📸 Conhecida pela modernidade de Taipei e pela cultura tradicional, Taiwan é um destino fascinante. Nossos pacotes incluem ✈️ passagens e 🏨 hospedagem para você criar histórias inesquecíveis.\n✔️ Viva experiências únicas nesse destino asiático.\nPlaneje agora pelo WhatsApp: (99) 9 9999-9999",
    hashtags: "#ViajarÉViver #MemóriasInesquecíveis #AventuraEDescoberta",
    category: "internacional"
  },
  {
    destination: "Cusco",
    text: "Prepare-se para Cusco! 🏔️🧳 Saiba como agir se sua bagagem for extraviada: informe a companhia aérea, tenha o comprovante de despacho e contrate um seguro viagem. Cusco é a porta de entrada para Machu Picchu, com história e cultura incríveis.\n✔️ Dicas para resolver imprevistos e curtir sua viagem.\nFale com a gente pelo WhatsApp: (99) 9 9999-9999",
    hashtags: "#DicasDeViagem #BagagemExtraviada #ViagemSemEstresse",
    category: "internacional"
  },
  {
    destination: "Egito",
    text: "Aproveite dias incríveis no Egito! 🏜️✨ Conheça as Pirâmides de Gizé e o Rio Nilo com nosso pacote para 2 adultos, que inclui ✈️ passagens, 🏨 hospedagem e passeios guiados, a partir de 10x de R$150,00.\n✔️ Uma viagem histórica cheia de descanso e descobertas.\nGaranta sua vaga pelo WhatsApp: (99) 9 9999-9999",
    hashtags: "#ExcursãoEgito #ÚltimasVagas #FériasPerfeitas",
    category: "internacional"
  },
  {
    destination: "Washington",
    text: "Viaje para Washington com segurança! 🏛️✈️ Pesquise sobre o destino, use serviços oficiais como táxis credenciados e evite sacar grandes quantias de dinheiro. Washington tem museus incríveis e monumentos como o Lincoln Memorial.\n✔️ Dicas para uma viagem tranquila e sem golpes.\nPlaneje pelo WhatsApp: (99) 9 9999-9999",
    hashtags: "#DicasDeViagem #GolpesContraTuristas #ViagemSegura",
    category: "internacional"
  },
  {
    destination: "Chicago",
    text: "Não deixe seus sonhos de viagem para Chicago para depois! 🏙️✨ Conhecida pela arquitetura e pela pizza deep-dish, Chicago é um destino vibrante. Nossos pacotes personalizados incluem ✈️ passagens, 🏨 hospedagem e passeios, com facilidade no pagamento.\n✔️ Ofertas especiais para você explorar essa cidade incrível.\nFale com a gente pelo WhatsApp: (99) 9 9999-9999",
    hashtags: "#ViajeMaisVivaMais #PacotesDeViagem #FériasDosSonhos",
    category: "internacional"
  },
  {
    destination: "Ushuaia",
    text: "Saia da rotina em Ushuaia! ❄️✈️ Conhecida como o \"Fim do Mundo\", Ushuaia é perfeita para quem ama frio e paisagens glaciais. Nossos pacotes a partir de 10x de R$150,00 incluem ✈️ passagens, 🏨 hospedagem e passeios como o Trem do Fim do Mundo.\n✔️ Um destino único para sua próxima aventura.\nPlaneje agora pelo WhatsApp: (99) 9 9999-9999",
    hashtags: "#NovosDestinos #PacotesDeViagem #ExplorarOMundo",
    category: "internacional"
  },
  {
    destination: "Boston",
    text: "Curta dias de sol em Boston! 🏛️✨ Explore a Freedom Trail e o charme histórico dessa cidade americana. Nossos pacotes especiais incluem ✈️ passagens, 🏨 hospedagem e passeios, com facilidade de pagamento para tornar sua viagem ainda mais tranquila.\n✔️ Uma aventura inesquecível te espera na Nova Inglaterra.\nGaranta sua vaga pelo WhatsApp: (99) 9 9999-9999",
    hashtags: "#PartiuBoston #ViagemDosSonhos #FériasIncríveis",
    category: "internacional"
  },
  {
    destination: "Machu Picchu",
    text: "Viaje de avião para Machu Picchu pela primeira vez! 🏔️✈️ Chegue cedo ao aeroporto, siga as regras de bagagem e relaxe durante o voo. Machu Picchu é uma das 7 Maravilhas do Mundo, com ruínas incas que vão te encantar.\n✔️ Dicas para curtir a experiência e explorar esse destino histórico.\nFale com a gente pelo WhatsApp: (99) 9 9999-9999",
    hashtags: "#PrimeiraViagem #DicasDeViagem #ViajarDeAvião",
    category: "internacional"
  },
  {
    destination: "Salar de Uyuni",
    text: "Escolha o destino perfeito para Salar de Uyuni! 🏜️📸 O maior deserto de sal do mundo é ideal para fotos incríveis e paisagens surreais. Nossa equipe te ajuda a planejar a viagem dos sonhos, com ✈️ passagens e 🏨 hospedagem inclusas.\n✔️ Um lugar para relaxar, explorar ou se aventurar.\nFale com a gente pelo WhatsApp: (99) 9 9999-9999",
    hashtags: "#DestinoIdeal #PlanejeSuaViagem #FériasDosSonhos",
    category: "internacional"
  },
  {
    destination: "Cancún",
    text: "Nossos clientes amam suas viagens para Cancún! 🏖️✨ Com praias de areia branca e águas turquesas, Cancún é um paraíso no México. Trabalhamos para garantir que cada experiência seja única, com ✈️ passagens e 🏨 hospedagem inclusas.\n✔️ Faça parte dessas histórias de sucesso e viva o Caribe.\nPlaneje sua viagem pelo WhatsApp: (99) 9 9999-9999",
    hashtags: "#FeedbackDeClientes #ViagemIncrível #SatisfaçãoGarantida",
    category: "internacional"
  },
  {
    destination: "Israel",
    text: "Evite erros ao planejar sua viagem para Israel! 🏛️✈️ Conhecido pela história de Jerusalém e pelo Mar Morto, Israel é um destino único. Confira dicas para uma jornada sem dores de cabeça, com ✈️ passagens e 🏨 hospedagem organizadas por nós.\n✔️ Viaje com mais segurança e aproveite cada momento.\nPlaneje pelo WhatsApp: (99) 9 9999-9999",
    hashtags: "#DicasDeViagem #ViagemInternacional #ViajarSemEstresse",
    category: "internacional"
  },
  {
    destination: "Bruxelas",
    text: "Passaporte vencido antes de ir para Bruxelas? 🛂✈️ Não se preocupe! Saiba como resolver rapidamente: renove com antecedência e verifique as exigências do destino. Bruxelas é famosa pelo chocolate e pela Grand Place, um destino imperdível.\n✔️ Planeje com antecedência e evite problemas no embarque.\nFale com a gente pelo WhatsApp: (99) 9 9999-9999",
    hashtags: "#PassaporteVencido #DicasDeViagem #PlanejamentoDeViagem",
    category: "internacional"
  },
  {
    destination: "Dublin",
    text: "Viaje sozinho para Dublin com segurança! 🍀✨ Conhecida pelos pubs e pela cultura celta, Dublin é perfeita para uma aventura solo. Confira dicas essenciais para uma jornada tranquila, como escolher hostels seguros e planejar seu roteiro.\n✔️ Salve essas dicas e curta sua viagem com confiança.\nPlaneje sua aventura pelo WhatsApp: (99) 9 9999-9999",
    hashtags: "#DicasDeSegurança #ViajarSozinho #ViagemSegura",
    category: "internacional"
  },
  {
    destination: "Jordânia",
    text: "Planeje sua primeira aventura como mochileiro em Jordânia! 🏜️🧳 Conhecida por Petra e pelo deserto de Wadi Rum, Jordânia é um destino épico. Dicas como levar uma mochila leve e reservar passeios guiados garantem uma viagem sem estresse.\n✔️ Um guia essencial para começar sua jornada.\nSalve e planeje pelo WhatsApp: (99) 9 9999-9999",
    hashtags: "#MochileirosDePrimeiraViagem #DicasDeMochileiro #AventuraPeloMundo",
    category: "internacional"
  },
  {
    destination: "África",
    text: "Explore a África sem gastar muito! 🦒📸 De safáris na Tanzânia a praias em Zanzibar, há opções para todos os bolsos. Dicas como viajar na baixa temporada e escolher hospedagens econômicas ajudam a curtir ao máximo.\n✔️ Aproveite sua próxima aventura africana com orçamento limitado.\nPlaneje pelo WhatsApp: (99) 9 9999-9999",
    hashtags: "#ViajarComPouco #DicasDeViagem #ViagemEconomica",
    category: "internacional"
  },
  {
    destination: "Punta Cana",
    text: "Está na hora de planejar suas férias dos sonhos em Punta Cana! 🏖️✨ Com resorts all-inclusive e praias de areia branca, esse destino é perfeito para relaxar. Nosso pacote inclui ✈️ passagens, 🏨 hospedagem e traslados, por 10x de R$450,00.\n✔️ Um paraíso caribenho para descansar e se divertir.\nGaranta seu pacote pelo WhatsApp: (99) 9 9999-9999",
    hashtags: "#ViajarÉViver #PuntaCanaDream #AgenciaDeViagens",
    category: "internacional"
  },
  {
    destination: "Praga",
    text: "Descubra Praga com pacotes exclusivos! 🏰✨ Conhecida pela Ponte Carlos e pelo Castelo de Praga, essa cidade é um conto de fadas. Nossos pacotes oferecem ✈️ passagens, 🏨 hospedagem e passeios, com preços acessíveis e suporte completo.\n✔️ Condições facilitadas para todos os perfis de viajantes.\nPlaneje sua viagem pelo WhatsApp: (99) 9 9999-9999",
    hashtags: "#DescubraOMundo #ViajeComEstilo #AgenciaDeViagens",
    category: "internacional"
  },
  {
    destination: "New York",
    text: "Desconecte-se em New York! 🏙️✨ A Big Apple tem atrações como a Times Square, o Central Park e a Estátua da Liberdade. Nosso pacote especial inclui 5 noites para 2 adultos, ✈️ passagens aéreas e traslados, por 10x de R$450,00.\n✔️ Um destino vibrante para viver momentos inesquecíveis.\nReserve agora pelo WhatsApp: (99) 9 9999-9999",
    hashtags: "#NewYork #DestinoDosSonhos #FériasPerfeitas",
    category: "internacional"
  },
  {
    destination: "Bariloche",
    text: "Planeje sua viagem para Bariloche sem preocupações! ❄️✈️ Conhecida pelas montanhas nevadas e chocolates artesanais, Bariloche é perfeita para o inverno. Nosso pacote inclui ✈️ passagens, 🏨 hospedagem e passeios para esquiar, em até 10x sem juros.\n✔️ Suporte personalizado para você curtir cada momento.\nFale conosco pelo WhatsApp: (99) 9 9999-9999",
    hashtags: "#ViajarSemPreocupação #PacoteDeViagem #AgenciaDeViagens",
    category: "internacional"
  },
  {
    destination: "Suíça",
    text: "Sonha com a Suíça? 🏔️✨ Com os Alpes, lagos cristalinos e cidades como Zurique, esse destino é um sonho. Nosso pacote inclui 3 noites para 2 adultos com ✈️ passagens aéreas, por 10x de R$250,00, para você curtir paisagens de tirar o fôlego.\n✔️ Relaxe e explore a beleza suíça com conforto.\nGaranta sua viagem pelo WhatsApp: (99) 9 9999-9999",
    hashtags: "#Suíça #BoraPraNeve #FériasNoParaíso",
    category: "internacional"
  },
  {
    destination: "Budapeste",
    text: "Transforme seus sonhos em realidade em Budapeste! 🏰✨ Conhecida pelo Parlamento e pelas termas, Budapeste é perfeita para quem ama história e relaxamento. Nossos pacotes personalizados incluem ✈️ passagens, 🏨 hospedagem e passeios para explorar a cidade.\n✔️ Uma viagem para se encantar com a Europa Oriental.\nPlaneje sua aventura pelo WhatsApp: (99) 9 9999-9999",
    hashtags: "#ExplorarOMundo #ViagemSemComplicação #AgenciaDeViagens",
    category: "internacional"
  },
  {
    destination: "Orlando",
    text: "Relaxe em Orlando com nossos pacotes perfeitos! 🎢✨ Conhecida pelos parques da Disney e Universal, Orlando é ideal para famílias e amantes de diversão. Nosso pacote inclui ✈️ passagens, 🏨 hospedagem e ingressos, com parcelamento no boleto.\n✔️ Um destino mágico para criar memórias inesquecíveis.\nFale com a gente pelo WhatsApp: (99) 9 9999-9999",
    hashtags: "#PlanejeSuasFérias #PacotesImperdíveis #FériasDosSonhos",
    category: "internacional"
  },
  {
    destination: "Aruba",
    text: "Viaje para Aruba com segurança! 🏖️✈️ Adicione o seguro bagagem ao seu pacote e proteja sua mala contra perdas ou extravios. Aruba é famosa pelas praias de Eagle Beach e pela vibe caribenha, perfeita para relaxar.\n✔️ Cobertura completa para curtir sem preocupações.\nAdicione ao seu pacote pelo WhatsApp: (99) 9 9999-9999",
    hashtags: "#SeguroBagagem #ViagemTranquila #ViajarComSegurança",
    category: "internacional"
  },
  {
    destination: "Phi Phi",
    text: "Suas férias estão chegando, e Phi Phi te espera! 🏝️✨ Conhecida pelas águas cristalinas e falésias, Phi Phi é um paraíso na Tailândia. Nosso pacote inclui ✈️ passagens, 🏨 hospedagem e passeios de barco para explorar as ilhas, tudo organizado para você.\n✔️ Não deixe para última hora e garanta uma viagem perfeita.\nFale agora pelo WhatsApp: (99) 9 9999-9999",
    hashtags: "#PlanejeSuasFérias #ViagemSemEstresse #FériasPerfeitas",
    category: "internacional"
  },
  {
    destination: "São Francisco",
    text: "Embarque em um cruzeiro completo por São Francisco! 🚤✨ Navegue pela Baía de São Francisco, com vista para a Golden Gate, e desfrute de gastronomia e atividades a bordo. Nosso pacote inclui tudo: alimentação, passeios e hospedagem, com parcelamento facilitado.\n✔️ Uma experiência única para explorar a costa da Califórnia.\nReserve pelo WhatsApp: (99) 9 9999-9999",
    hashtags: "#CruzeiroDosSonhos #EmbarqueJá #FériasInesquecíveis",
    category: "internacional"
  },
  {
    destination: "Pisa",
    text: "Descubra Pisa e viva experiências únicas! 🏛️✨ Conhecida pela Torre Inclinada e pela Piazza dei Miracoli, Pisa é um destino cheio de história. Nosso pacote inclui ✈️ passagens, 🏨 hospedagem e passeios para explorar a cidade e arredores, como Florença.\n✔️ Uma viagem para se encantar com a Itália.\nEntre em contato pelo WhatsApp: (99) 9 9999-9999",
    hashtags: "#ViajarÉViver #MagiaDosDestinos #FériasInesquecíveis",
    category: "internacional"
  },
  {
    destination: "Capadócia",
    text: "Busca aventura na Capadócia? 🎈✨ Conhecida pelos passeios de balão e pelas formações rochosas únicas, a Capadócia é perfeita para quem ama emoção. Nossos pacotes cheios de adrenalina incluem ✈️ passagens e hospedagem, a partir de 10x de R$190,00.\n✔️ Um destino para explorar e se divertir ao máximo.\nGaranta sua vaga pelo WhatsApp: (99) 9 9999-9999",
    hashtags: "#DestinoDeAventura #PacotesDeViagem #ViagemAventura",
    category: "internacional"
  },
  {
    destination: "Lima",
    text: "Viajar para Lima é colecionar momentos inesquecíveis! 🍽️✨ Conhecida pela gastronomia premiada e pelo centro histórico, Lima é um destino vibrante. Nossos pacotes oferecem ✈️ passagens e 🏨 hospedagem para você viver uma experiência cultural única.\n✔️ Invista em memórias que valem mais que qualquer coisa.\nPlaneje pelo WhatsApp: (99) 9 9999-9999",
    hashtags: "#ViajarÉInvestir #FériasPerfeitas #MomentosInesquecíveis",
    category: "internacional"
  },
  {
    destination: "Grécia",
    text: "Planeje sua viagem dos sonhos para a Grécia! 🏛️✨ Com ilhas como Santorini e Mykonos, a Grécia é perfeita para quem ama história e praias. Nossos pacotes personalizados incluem ✈️ passagens, 🏨 hospedagem e passeios, com parcelamento em até 12x.\n✔️ Um destino incrível para relaxar e explorar.\nFale com a gente pelo WhatsApp: (99) 9 9999-9999",
    hashtags: "#ExplorarOMundo #PacotesDeViagem #FériasPerfeitas",
    category: "internacional"
  },
  {
    destination: "Singapura",
    text: "Sonha com Singapura? 🏙️✨ Conhecida pela modernidade de Marina Bay Sands e pelos Gardens by the Bay, Singapura é um destino futurista. Nosso pacote a partir de R$5.000 inclui ✈️ passagens, 🏨 hospedagem e passeios para explorar a cidade.\n✔️ Uma experiência de tranquilidade e beleza urbana.\nGaranta sua viagem pelo WhatsApp: (99) 9 9999-9999",
    hashtags: "#Singapura #DestinoDosSonhos #FériasNoParaíso",
    category: "internacional"
  },
  {
    destination: "Maldivas",
    text: "Reduza o estresse nas Maldivas! 🏝️✨ Com bangalôs sobre o mar e águas cristalinas, esse destino é perfeito para relaxar. Nosso pacote inclui ✈️ passagens e 🏨 hospedagem, para você desconectar e conhecer a cultura local.\n✔️ Uma viagem para renovar as energias e se encantar.\nPlaneje agora pelo WhatsApp: (99) 9 9999-9999",
    hashtags: "#ViajarÉViver #ReduçãoDoEstresse #ExplorandoNovasCulturas",
    category: "internacional"
  },
  {
    destination: "Berlim",
    text: "Relembre momentos incríveis em Berlim! 🏛️✨ Conhecida pelo Muro de Berlim e pela vida noturna vibrante, Berlim é um destino cheio de história. Nosso pacote inclui ✈️ passagens e 🏨 hospedagem para você planejar sua próxima viagem dos sonhos.\n✔️ Um destino com cultura e modernidade para se apaixonar.\nDescubra mais pelo WhatsApp: (99) 9 9999-9999",
    hashtags: "#Berlim #TBTDeViagem #DestinoIncrível",
    category: "internacional"
  },
  {
    destination: "Roma",
    text: "Evite imprevistos em Roma! 🏛️✈️ Chegue cedo ao aeroporto e mantenha seus documentos como passaporte 🛂 à mão para uma viagem tranquila. Roma é famosa pelo Coliseu e pela culinária italiana, como a carbonara autêntica.\n✔️ Dicas para curtir a Cidade Eterna sem estresse.\nPlaneje pelo WhatsApp: (99) 9 9999-9999",
    hashtags: "#DicasDeViagem #ViajarSemEstresse #PlanejamentoDeViagem",
    category: "internacional"
  },
  {
    destination: "Istambul",
    text: "Curta o calor em 3 paraísos: Istambul, Dubai e Phuket! 🌍✨ Istambul tem o Grand Bazaar e a Mesquita Azul, perfeitos para o verão. Nossos pacotes incluem ✈️ passagens e 🏨 hospedagem para você escolher seu destino favorito.\n✔️ Três opções internacionais para suas férias.\nFale com a gente pelo WhatsApp: (99) 9 9999-9999",
    hashtags: "#DestinosDeVerão #ViajarÉViver",
    category: "internacional"
  },
  {
    destination: "Santiago",
    text: "Santiago te espera para uma viagem inesquecível! 🏔️✨ Reúna a galera e curta a cultura chilena, com vinícolas e o centro histórico. Nosso pacote inclui ✈️ passagens, 🏨 hospedagem e passeios para explorar a cidade e arredores, como o Valle Nevado.\n✔️ Uma experiência perfeita para grupos de amigos ou família.\nPlaneje agora pelo WhatsApp: (99) 9 9999-9999",
    hashtags: "#BoraPraSantiago #ViagemComAmigos #FériasNaCidade",
    category: "internacional"
  },
  {
    destination: "Frankfurt",
    text: "Busca conforto em Frankfurt? 🏙️✨ Nosso pacote para a cidade alemã inclui café da manhã delicioso, Wi-Fi, TV e estacionamento, a partir de 10x de R$450,00. Explore o Römer e o Rio Meno com total comodidade.\n✔️ Tudo pensado para você relaxar e aproveitar ao máximo.\nFale com a gente pelo WhatsApp: (99) 9 9999-9999",
    hashtags: "#PacotesCompletos #ViajarComConforto #BenefíciosExclusivos",
    category: "internacional"
  },
  {
    destination: "Bangkok",
    text: "Sonha com Bangkok? 🏯✨ Conhecida pelos templos como o Wat Arun e pelos mercados flutuantes, Bangkok é um destino vibrante. Nosso pacote a partir de R$2.500 inclui ✈️ passagens, 🏨 hospedagem e passeios para explorar a cidade.\n✔️ Um destino para explorar a cultura tailandesa.\nGaranta sua vaga pelo WhatsApp: (99) 9 9999-9999",
    hashtags: "#Bangkok #DestinoDosSonhos #FériasIncríveis",
    category: "internacional"
  },
  {
    destination: "Munique",
    text: "Explore novos horizontes em Munique! 🍻✨ Conhecida pela Oktoberfest e pelo Englischer Garten, Munique é perfeita para quem ama cultura e cerveja. Nossos pacotes especiais incluem ✈️ passagens, 🏨 hospedagem e passeios, com condições facilitadas.\n✔️ Um destino europeu para sua próxima aventura.\nPlaneje pelo WhatsApp: (99) 9 9999-9999",
    hashtags: "#ExploreOMundo #PacoteDeViagem #ViagemSemComplicações",
    category: "internacional"
  },
  {
    destination: "Dubai",
    text: "Descubra as maravilhas de Dubai! 🏙️✨ Com o Burj Khalifa e os shoppings de luxo, Dubai é um destino moderno e fascinante. Nosso pacote a partir de 10x de R$450,00 inclui ✈️ passagens, 🏨 hospedagem e passeios para conhecer o deserto e a cidade.\n✔️ Um destino internacional cheio de glamour te espera.\nFale com a gente pelo WhatsApp: (99) 9 9999-9999",
    hashtags: "#BelezasDeDubai #ViajarPeloMundo #FériasInternacionais",
    category: "internacional"
  },
  {
    destination: "Buenos Aires",
    text: "Crie memórias inesquecíveis em Buenos Aires! 🕺✨ Conhecida pelo tango e pela gastronomia, como o bife de chorizo, Buenos Aires é um destino vibrante. Nossos pacotes oferecem ✈️ passagens e 🏨 hospedagem para você viver momentos únicos.\n✔️ Viajar é a melhor forma de colecionar experiências.\nPlaneje sua viagem pelo WhatsApp: (99) 9 9999-9999",
    hashtags: "#ColecioneMemórias #ExperiênciasInesquecíveis #FériasDosSonhos",
    category: "internacional"
  },
  {
    destination: "Phuket",
    text: "Cada passo da sua viagem para Phuket é memorável! 🏖️✨ Conhecida pelas praias de Patong e pelas ilhas próximas, Phuket é um paraíso tailandês. Nosso pacote oferece ✈️ passagens, 🏨 hospedagem e passeios de barco para curtir cada detalhe.\n✔️ A aventura está em cada parada dessa jornada incrível.\nFale com a gente pelo WhatsApp: (99) 9 9999-9999",
    hashtags: "#JornadaDeViagem #FériasIncríveis #ExperiênciasInesquecíveis",
    category: "internacional"
  },
  {
    destination: "Ilha de Páscoa",
    text: "Invista em experiências na Ilha de Páscoa! 🗿✨ Conhecida pelos moais e pela cultura Rapa Nui, esse destino é único. Cada viagem traz aprendizados e memórias, e nosso pacote inclui ✈️ passagens e 🏨 hospedagem para você explorar a ilha.\n✔️ Fique rico em histórias para contar por toda a vida.\nPlaneje pelo WhatsApp: (99) 9 9999-9999",
    hashtags: "#LembreteDeViagem #ExperiênciasIncríveis #ColecioneMomentos",
    category: "internacional"
  },
  {
    destination: "Bali",
    text: "Desbrave Bali com pacotes a partir de R$9.500! 🏝️✨ Com templos como Uluwatu e praias paradisíacas, Bali é um destino internacional incrível. Nosso pacote inclui ✈️ passagens, 🏨 hospedagem e passeios para conhecer a cultura balinesa.\n✔️ Uma viagem para relaxar e se conectar com a natureza.\nFale com a gente pelo WhatsApp: (99) 9 9999-9999",
    hashtags: "#ExploreOMundo #PacotesInternacionais #FériasIncríveis",
    category: "internacional"
  },
  {
    destination: "Havana",
    text: "Cada viagem para Havana é um novo capítulo na sua vida! 🎶✨ Conhecida pela música, pelos carros antigos e pela história, Havana é um destino vibrante. Nosso pacote inclui ✈️ passagens e 🏨 hospedagem para você criar memórias inesquecíveis.\n✔️ Uma aventura única na capital cubana te espera.\nPlaneje agora pelo WhatsApp: (99) 9 9999-9999",
    hashtags: "#NovaHistória #FériasIncríveis #ColecioneMomentos",
    category: "internacional"
  },
  {
    destination: "Toronto",
    text: "Aproveite o tempo no aeroporto antes de ir para Toronto! ✈️🧳 Explore lojas, leia um livro ou descanse em áreas tranquilas para recarregar as energias. Toronto tem atrações como a CN Tower e o Distillery District, perfeitas para sua viagem.\n✔️ Dicas para tornar sua espera mais produtiva e agradável.\nPlaneje sua viagem pelo WhatsApp: (99) 9 9999-9999",
    hashtags: "#ConexãoDeVoo #DicasDeViagem #TempoDeEspera",
    category: "internacional"
  },
  {
    destination: "Sydney",
    text: "Não perca seu voo para Sydney! ✈️🛂 Chegue com antecedência ao aeroporto, faça o check-in online e configure alarmes no celular para o horário de embarque. Sydney tem a Opera House e Bondi Beach, perfeitas para explorar.\n✔️ Dicas para uma viagem tranquila e sem correrias.\nFale com a gente pelo WhatsApp: (99) 9 9999-9999",
    hashtags: "#DicasDeViagem #NaoPercaSeuVoo #ViagemSemEstresse",
    category: "internacional"
  },
  {
    destination: "Londres",
    text: "Planeje sua viagem para Londres pelo nosso site! 🏰✈️ Rápido, seguro e com ofertas exclusivas, nosso pacote inclui ✈️ passagens, 🏨 hospedagem e passeios para o Big Ben, o London Eye e o Palácio de Buckingham.\n✔️ Tudo pronto para sua próxima aventura em poucos cliques.\nAcesse pelo WhatsApp: (99) 9 9999-9999",
    hashtags: "#CompreOnline #PacotesDeViagem #FériasDosSonhos",
    category: "internacional"
  },
  {
    destination: "Amsterdã",
    text: "Evite surpresas no aeroporto ao viajar para Amsterdã! 🧳✈️ Confira dicas para não ter problemas com excesso de bagagem e curta os canais, os museus como o Van Gogh e as tulipas holandesas. Nosso pacote inclui ✈️ passagens e 🏨 hospedagem.\n✔️ Viaje tranquilo e aproveite cada momento sem estresse.\nFale com a gente pelo WhatsApp: (99) 9 9999-9999",
    hashtags: "#DicasDeViagem #ExcessoDeBagagem #ViagemSemEstresse",
    category: "internacional"
  },
  {
    destination: "Madri",
    text: "Prepare-se para Madri! 🏛️✈️ Leve um adaptador universal, contrate um seguro viagem e verifique passaporte 🛂 e visto para evitar imprevistos. Madri tem o Palácio Real e a Plaza Mayor, perfeitos para explorar a cultura espanhola.\n✔️ Itens essenciais para curtir a capital espanhola sem preocupações.\nPlaneje pelo WhatsApp: (99) 9 9999-9999",
    hashtags: "#DicasDeViagem #ViagemInternacional #FériasPerfeitas",
    category: "internacional"
  },
  {
    destination: "Cartagena",
    text: "Planeje sua viagem para Cartagena com antecedência! 🏖️✨ Para garantir as melhores ofertas em passagens e hospedagem, programe-se com 3 a 6 meses. Cartagena é famosa pela cidade murada e pelas praias caribenhas.\n✔️ Economize e evite imprevistos para uma viagem perfeita.\nFale com a gente pelo WhatsApp: (99) 9 9999-9999",
    hashtags: "#DicasDeViagem #PlanejamentoDeViagem #FériasPerfeitas",
    category: "internacional"
  },
  {
    destination: "Veneza",
    text: "Viaje em família para Veneza! 🚤✨ Conhecida pelos canais e pela Praça de São Marcos, Veneza é mágica para crianças e adultos. Outras opções incríveis incluem Paris, Orlando e Lisboa, com pacotes que incluem ✈️ passagens e 🏨 hospedagem.\n✔️ Momentos inesquecíveis para todas as idades garantidos.\nPlaneje agora pelo WhatsApp: (99) 9 9999-9999",
    hashtags: "#ViagemComCrianças #FériasEmFamília #Veneza",
    category: "internacional"
  },
  {
    destination: "Milão",
    text: "Explore Milão com conforto! 🏛️✨ Conhecida pela Duomo e pela moda, Milão é um destino elegante. Nosso pacote inclui 5 diárias, ✈️ passagens de ida e volta, transfer do aeroporto ao hotel e passeios exclusivos, por apenas R$1.500 por pessoa.\n✔️ Uma viagem para relaxar e explorar a Itália.\nGaranta sua viagem pelo WhatsApp: (99) 9 9999-9999",
    hashtags: "#DescubraMilão #PacotesDeViagem #FériasInesquecíveis",
    category: "internacional"
  },
  {
    destination: "Hong Kong",
    text: "Faça uma viagem rápida e econômica para Hong Kong! 🏙️✈️ Conhecida pelo skyline e pelos mercados noturnos, Hong Kong é um destino vibrante. Nosso pacote inclui ✈️ passagens aéreas de ida e volta de São Paulo, por apenas R$520,00.\n✔️ Conforto e tranquilidade para explorar esse destino asiático.\nGaranta sua passagem pelo WhatsApp: (99) 9 9999-9999",
    hashtags: "#ViagemEconomica #PassagensAéreas #HongKong",
    category: "internacional"
  },
  {
    destination: "Barcelona",
    text: "Celebre o Dia do Turista em Barcelona! 🏛️✨ Explore a Sagrada Família e o Parc Güell com nossos pacotes que oferecem ✈️ passagens e 🏨 hospedagem. Barcelona é perfeita para quem ama arquitetura e cultura catalã.\n✔️ O mundo é cheio de descobertas para viajantes apaixonados.\nPlaneje sua viagem pelo WhatsApp: (99) 9 9999-9999",
    hashtags: "#DiaDoTurista #ExplorarOMundo #FériasInesquecíveis",
    category: "internacional"
  },
  {
    destination: "Atenas",
    text: "Proporcione uma experiência mágica em Atenas! 🏛️✨ Conhecida pela Acrópole e pela história grega, Atenas é um destino fascinante. Nosso pacote em até 12x sem juros inclui ✈️ passagens, 🏨 hospedagem e passeios para conhecer a cidade.\n✔️ Viva momentos únicos nesse destino histórico.\nGaranta seu pacote pelo WhatsApp: (99) 9 9999-9999",
    hashtags: "#Atenas #FériasInternacionais #MagiaDaViagem",
    category: "internacional"
  },
  {
    destination: "Itália",
    text: "Viaje para Itália com conforto! 🏛️✈️ Leve travesseiro de pescoço, vista roupas leves e hidrate-se durante o voo para aproveitar ao máximo. Itália tem destinos como Roma e Florença, perfeitos para explorar a cultura italiana.\n✔️ Dicas para um voo tranquilo e uma viagem inesquecível.\nPlaneje pelo WhatsApp: (99) 9 9999-9999",
    hashtags: "#DicasDeViagem #ConfortoNosVoos #VooConfortável",
    category: "internacional"
  },
  {
    destination: "Tulum",
    text: "Sonha com neve em Tulum? ❄️✨ Embora Tulum seja mais conhecida pelas praias e ruínas maias, você pode curtir destinos nevados como Zermatt, Valle Nevado e Bariloche. Nossos pacotes incluem ✈️ passagens e 🏨 hospedagem para um inverno mágico.\n✔️ Escolha seu destino gelado e viva o frio com estilo.\nFale com a gente pelo WhatsApp: (99) 9 9999-9999",
    hashtags: "#DestinosDeNeve #ViagemDeInverno #Tulum",
    category: "internacional"
  },
  {
    destination: "Siena",
    text: "Deixe tudo por nossa conta em Siena! 🏛️✈️ Conhecida pela Piazza del Campo e pela arquitetura medieval, Siena é um destino encantador na Toscana. Nosso pacote inclui ✈️ passagens, 🏨 hospedagem e passeios para explorar a região.\n✔️ Viaje sem preocupações e viva a magia italiana.\nFale com a gente pelo WhatsApp: (99) 9 9999-9999",
    hashtags: "#AgenciaDeViagens #PacotesDeViagem #ViajarÉViver",
    category: "internacional"
  },
  {
    destination: "Los Angeles",
    text: "Encante-se com Los Angeles! 🌟✨ Com a Calçada da Fama e as praias de Santa Monica, LA é um destino dos sonhos. Nosso pacote em até 10x de R$850,00 inclui ✈️ passagens e 🏨 hospedagem para você explorar Hollywood e muito mais.\n✔️ Uma viagem para explorar a cultura americana.\nGaranta sua viagem pelo WhatsApp: (99) 9 9999-9999",
    hashtags: "#LosAngeles #PacotesDeViagem #FériasNaCali",
    category: "internacional"
  },
  {
    destination: "Tokyo",
    text: "Cada aventura em Tokyo faz parte de quem somos! 🏯✨ Conhecida pela modernidade de Shibuya e pela tradição de Asakusa, Tokyo é fascinante. Nossos pacotes incluem ✈️ passagens e 🏨 hospedagem para você criar histórias inesquecíveis.\n✔️ Viva experiências únicas nesse destino japonês.\nPlaneje agora pelo WhatsApp: (99) 9 9999-9999",
    hashtags: "#ViajarÉViver #MemóriasInesquecíveis #AventuraEDescoberta",
    category: "internacional"
  },
  {
    destination: "Miami",
    text: "Prepare-se para Miami! 🏖️🧳 Saiba como agir se sua bagagem for extraviada: informe a companhia aérea, tenha o comprovante de despacho e contrate um seguro viagem. Miami tem South Beach e a vibe latina de Little Havana.\n✔️ Dicas para resolver imprevistos e curtir sua viagem.\nFale com a gente pelo WhatsApp: (99) 9 9999-9999",
    hashtags: "#DicasDeViagem #BagagemExtraviada #ViagemSemEstresse",
    category: "internacional"
  },
  {
    destination: "Las Vegas",
    text: "Aproveite dias incríveis em Las Vegas! 🎰✨ Conhecida pelos cassinos e shows, Las Vegas é pura diversão. Nosso pacote para 2 adultos inclui ✈️ passagens, 🏨 hospedagem e passeios, a partir de 10x de R$150,00.\n✔️ Uma viagem cheia de entretenimento e glamour.\nGaranta sua vaga pelo WhatsApp: (99) 9 9999-9999",
    hashtags: "#ExcursãoLasVegas #ÚltimasVagas #FériasPerfeitas",
    category: "internacional"
  },
  {
    destination: "Vancouver",
    text: "Viaje para Vancouver com segurança! 🏔️✈️ Pesquise sobre o destino, use serviços oficiais como táxis credenciados e evite sacar grandes quantias de dinheiro. Vancouver tem o Stanley Park e montanhas incríveis para explorar.\n✔️ Dicas para uma viagem tranquila e sem golpes.\nPlaneje pelo WhatsApp: (99) 9 9999-9999",
    hashtags: "#DicasDeViagem #GolpesContraTuristas #ViagemSegura",
    category: "internacional"
  },
  {
    destination: "Playa del Carmen",
    text: "Não deixe seus sonhos de viagem para Playa del Carmen para depois! 🏖️✨ Com praias caribenhas e a Quinta Avenida, Playa é um destino vibrante. Nossos pacotes personalizados incluem ✈️ passagens, 🏨 hospedagem e passeios, com facilidade no pagamento.\n✔️ Ofertas especiais para você explorar esse paraíso mexicano.\nFale com a gente pelo WhatsApp: (99) 9 9999-9999",
    hashtags: "#ViajeMaisVivaMais #PacotesDeViagem #FériasDosSonhos",
    category: "internacional"
  },
  {
    destination: "Florença",
    text: "Saia da rotina em Florença! 🏛️✨ Conhecida pela Duomo e pela arte renascentista, Florença é um destino cultural. Nossos pacotes a partir de 10x de R$150,00 incluem ✈️ passagens, 🏨 hospedagem e passeios para explorar a Toscana.\n✔️ Um destino único para sua próxima aventura.\nPlaneje agora pelo WhatsApp: (99) 9 9999-9999",
    hashtags: "#NovosDestinos #PacotesDeViagem #ExplorarOMundo",
    category: "internacional"
  },
  {
    destination: "Riviera Maya",
    text: "Curta dias de sol na Riviera Maya! 🏖️✨ Com cenotes e ruínas maias como Chichén Itzá, esse destino é um paraíso. Nossos pacotes especiais incluem ✈️ passagens, 🏨 hospedagem e passeios, com facilidade de pagamento para sua viagem.\n✔️ Uma aventura inesquecível te espera no México.\nGaranta sua vaga pelo WhatsApp: (99) 9 9999-9999",
    hashtags: "#PartiuRivieraMaya #ViagemDosSonhos #FériasIncríveis",
    category: "internacional"
  },
  {
    destination: "Tailândia",
    text: "Escolha o destino perfeito para Tailândia! 🏝️✨ Conhecida pelos templos, mercados e praias como Krabi, a Tailândia é ideal para todos os estilos. Nossa equipe te ajuda a planejar a viagem dos sonhos, com ✈️ passagens e 🏨 hospedagem inclusas.\n✔️ Um lugar para relaxar, explorar ou se aventurar.\nFale com a gente pelo WhatsApp: (99) 9 9999-9999",
    hashtags: "#DestinoIdeal #PlanejeSuaViagem #FériasDosSonhos",
    category: "internacional"
  },
  {
    destination: "Chile",
    text: "Nossos clientes amam suas viagens para Chile! 🏔️✨ Com o Deserto do Atacama e a Patagônia, o Chile é um destino incrível. Trabalhamos para garantir que cada experiência seja única, com ✈️ passagens e 🏨 hospedagem inclusas.\n✔️ Faça parte dessas histórias de sucesso e viva o Chile.\nPlaneje sua viagem pelo WhatsApp: (99) 9 9999-9999",
    hashtags: "#FeedbackDeClientes #ViagemIncrível #SatisfaçãoGarantida",
    category: "internacional"
  },
  {
    destination: "Seychelles",
    text: "Evite erros ao planejar sua viagem para Seychelles! 🏝️✈️ Conhecido pelas praias paradisíacas e natureza exuberante, Seychelles é um destino único. Confira dicas para uma jornada sem dores de cabeça, com ✈️ passagens e 🏨 hospedagem organizadas por nós.\n✔️ Viaje com mais segurança e aproveite cada momento.\nPlaneje pelo WhatsApp: (99) 9 9999-9999",
    hashtags: "#DicasDeViagem #ViagemInternacional #ViajarSemEstresse",
    category: "internacional"
  },
  {
    destination: "Colômbia",
    text: "Descubra a Colômbia e viva experiências únicas! 🌺✨ Com destinos como Bogotá, Medellín e Cartagena, a Colômbia oferece cultura, praias e montanhas. Nosso pacote inclui ✈️ passagens, 🏨 hospedagem e passeios para explorar o melhor do país.\n✔️ Uma viagem para se encantar com a diversidade colombiana.\nEntre em contato pelo WhatsApp: (99) 9 9999-9999",
    hashtags: "#ViajarÉViver #MagiaDosDestinos #FériasInesquecíveis",
    category: "internacional"
  },
  {
    destination: "DISNEY",
    text: "Realize o sonho de conhecer a Disney! 🏰✨ Com parques mágicos como Magic Kingdom, Hollywood Studios e Animal Kingdom, Orlando é o destino perfeito para famílias. Nosso pacote inclui ✈️ passagens, 🏨 hospedagem e ingressos para os parques.\n✔️ Uma experiência mágica para todas as idades.\nGaranta sua viagem pelo WhatsApp: (99) 9 9999-9999",
    hashtags: "#DisneyDream #ViagemEmFamília #FériasMágicas",
    category: "internacional"
  },
  {
    destination: "Destinos Europa",
    text: "Explore os melhores destinos da Europa! 🏰✨ De Paris a Roma, de Barcelona a Amsterdã, a Europa oferece história, cultura e paisagens incríveis. Nossos pacotes incluem ✈️ passagens, 🏨 hospedagem e passeios personalizados.\n✔️ Monte sua viagem europeia dos sonhos conosco.\nPlaneje pelo WhatsApp: (99) 9 9999-9999",
    hashtags: "#EuropaDosSonhos #ViagemInternacional #FériasPerfeitas",
    category: "internacional"
  },
  {
    destination: "Green Island",
    text: "Descubra Green Island, um paraíso tropical! 🏝️✨ Com recifes de coral e praias intocadas, esse destino é perfeito para mergulho e relaxamento. Nosso pacote inclui ✈️ passagens, 🏨 hospedagem e passeios de barco.\n✔️ Uma experiência única em meio à natureza.\nGaranta sua viagem pelo WhatsApp: (99) 9 9999-9999",
    hashtags: "#GreenIsland #ParaísoTropical #FériasInesquecíveis",
    category: "internacional"
  },
  {
    destination: "Talin Estônia",
    text: "Explore o charme medieval de Tallinn, na Estônia! 🏰✨ Com sua Old Town preservada e arquitetura encantadora, Tallinn é um destino europeu único. Nosso pacote inclui ✈️ passagens, 🏨 hospedagem e passeios históricos.\n✔️ Descubra a pérola do Báltico.\nPlaneje pelo WhatsApp: (99) 9 9999-9999",
    hashtags: "#Tallinn #DestinoEuropeu #ViagemCultural",
    category: "internacional"
  },
  {
    destination: "Vale Sagrado",
    text: "Explore o Vale Sagrado dos Incas! 🏔️✨ Com ruínas históricas, mercados coloridos e paisagens andinas, o Vale Sagrado é um destino imperdível no Peru. Nosso pacote inclui ✈️ passagens, 🏨 hospedagem e passeios guiados.\n✔️ Uma viagem para conectar-se com a história inca.\nGaranta sua viagem pelo WhatsApp: (99) 9 9999-9999",
    hashtags: "#ValeSagrado #HistóriaInca #FériasNoPeru",
    category: "internacional"
  }
];
