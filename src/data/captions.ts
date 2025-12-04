export interface Caption {
  destination: string;
  text: string;
  hashtags: string;
  category?: 'nacional' | 'internacional';
}

export const captions: Caption[] = [
  // NACIONAIS
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
    text: "Curta o calor em Natal - RN! 🏖️☀️ Natal tem dunas incríveis e passeios de buggy em Genipabu, perfeitos para o verão. Nossos pacotes incluem ✈️ passagens e 🏨 hospedagem para você escolher seu destino favorito.\n✔️ Praias paradisíacas para suas férias.\nFale com a gente pelo WhatsApp: (99) 9 9999-9999",
    hashtags: "#DestinosDeVerão #ViajarÉViver #NatalRN",
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
    destination: "Porto de Galinhas",
    text: "Suas férias estão chegando, e Porto de Galinhas te espera! 🏖️🐠 Não deixe para última hora: esse destino é famoso pelas piscinas naturais e praias de areia branca. Nosso pacote inclui ✈️ passagens, 🏨 hospedagem e passeios para explorar as belezas da região.\n✔️ Uma viagem perfeita, sem estresse, com cada detalhe planejado.\nFale agora pelo WhatsApp: (99) 9 9999-9999",
    hashtags: "#PlanejeSuasFérias #ViagemSemEstresse #FériasPerfeitas",
    category: "nacional"
  },
  {
    destination: "Jericoacoara - CE",
    text: "Relaxe em Jericoacoara - CE, um dos destinos mais charmosos do Brasil! 🌅✨ Conhecida pelo pôr do sol na Duna do Por do Sol e pela Lagoa do Paraíso, Jeri é perfeita para quem ama natureza e tranquilidade. Nosso pacote inclui ✈️ passagens, 🏨 hospedagem e traslados.\n✔️ Atendimento personalizado para você viajar sem preocupações.\nFale com a gente pelo WhatsApp: (99) 9 9999-9999",
    hashtags: "#PlanejeSuasFérias #PacotesImperdíveis #FériasDosSonhos",
    category: "nacional"
  },
  {
    destination: "Fernando de Noronha",
    text: "Planeje sua viagem para Fernando de Noronha sem preocupações! 🐠🏝️ Esse arquipélago é famoso pelas praias paradisíacas e vida marinha rica, ideal para mergulhos inesquecíveis. Nosso pacote completo inclui ✈️ passagens aéreas, 🏨 hospedagem em pousada charmosa e passeios, tudo em até 10x sem juros.\n✔️ Suporte personalizado para você curtir cada momento.\nFale conosco pelo WhatsApp: (99) 9 9999-9999",
    hashtags: "#ViajarSemPreocupação #PacoteDeViagem #Noronha",
    category: "nacional"
  },
  {
    destination: "Lençóis Maranhenses",
    text: "Desconecte-se nos Lençóis Maranhenses, um dos destinos mais impressionantes do Brasil! 🏜️✨ Com dunas brancas e lagoas cristalinas, esse paraíso é perfeito para quem ama natureza. Nosso pacote especial inclui: 5 noites para 2 adultos, ✈️ passagens aéreas e traslados, tudo por 10x de R$450,00.\n✔️ Uma experiência única para relaxar e se encantar com a beleza natural.\nReserve agora pelo WhatsApp: (99) 9 9999-9999",
    hashtags: "#LençóisMaranhenses #DestinoDosSonhos #FériasPerfeitas",
    category: "nacional"
  },
  {
    destination: "Angra dos Reis",
    text: "Transforme seus sonhos em realidade em Angra dos Reis! ⛵🌊 Com mais de 300 ilhas e águas cristalinas, esse destino é perfeito para quem busca tranquilidade e beleza natural. Nossos pacotes personalizados incluem ✈️ passagens, 🏨 hospedagem e passeios de barco para explorar as ilhas.\n✔️ Uma viagem para relaxar e se encantar com o mar.\nPlaneje sua aventura pelo WhatsApp: (99) 9 9999-9999",
    hashtags: "#ExplorarOMundo #ViagemSemComplicação #AngraDoReis",
    category: "nacional"
  },
  {
    destination: "Arraial do Cabo",
    text: "Crie memórias inesquecíveis em Arraial do Cabo! 🏖️📸 Com praias como a Prainha e passeios de barco para a Praia do Farol, esse destino é um sonho para quem ama o mar. Nossos pacotes oferecem ✈️ passagens e 🏨 hospedagem para você viver momentos únicos.\n✔️ Viajar é a melhor forma de colecionar experiências.\nPlaneje sua viagem pelo WhatsApp: (99) 9 9999-9999",
    hashtags: "#ColecioneMemórias #ExperiênciasInesquecíveis #ArraialDoCabo",
    category: "nacional"
  },
  {
    destination: "Rota das Emoções",
    text: "Cada passo da sua viagem pela Rota das Emoções é memorável! 🏜️🚤 Esse roteiro inclui Lençóis Maranhenses, Delta do Parnaíba e Jericoacoara, com paisagens de tirar o fôlego. Nosso pacote oferece ✈️ passagens, 🏨 hospedagem e passeios guiados para curtir cada detalhe.\n✔️ A aventura está em cada parada dessa jornada incrível.\nFale com a gente pelo WhatsApp: (99) 9 9999-9999",
    hashtags: "#JornadaDeViagem #FériasIncríveis #RotaDasEmoções",
    category: "nacional"
  },
  {
    destination: "Maceió - AL",
    text: "Está na hora de planejar suas férias dos sonhos em Maceió - AL! 🌴✨ Curta 5 dias nesse paraíso nordestino com praias de águas cristalinas e coqueiros que parecem de cartão-postal. Nosso pacote inclui: ✈️ passagens aéreas de ida e volta, 🧳 bagagem despachada e 🏨 5 diárias em um hotel de luxo com vista para o mar. Tudo isso por apenas 10x de R$450,00!\n✔️ Um destino perfeito para relaxar e tirar fotos incríveis 📸.\nGaranta seu pacote agora no WhatsApp: (99) 9 9999-9999",
    hashtags: "#ViajarÉViver #MaceióDream #AgenciaDeViagens",
    category: "nacional"
  },
  {
    destination: "Recife",
    text: "Busca conforto em Recife? 🌴✨ Nosso pacote para a capital pernambucana inclui café da manhã delicioso, Wi-Fi, TV e estacionamento, a partir de 10x de R$450,00. Explore o Recife Antigo e as praias de Boa Viagem com total comodidade.\n✔️ Tudo pensado para você relaxar e aproveitar ao máximo.\nFale com a gente pelo WhatsApp: (99) 9 9999-9999",
    hashtags: "#PacotesCompletos #ViajarComConforto #Recife",
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
    hashtags: "#ExploreOMundo #PacoteDeViagem #AlterDoChão",
    category: "nacional"
  },
  {
    destination: "Amazônia",
    text: "Embarque em um cruzeiro completo pela Amazônia! 🌿🚤 Desfrute de 5 dias navegando pelos rios, com gastronomia regional, atividades como trilhas e observação de botos, e paradas em comunidades locais. Nosso pacote inclui tudo: alimentação, passeios e hospedagem a bordo, com parcelamento facilitado.\n✔️ Uma experiência única para se conectar com a natureza.\nReserve pelo WhatsApp: (99) 9 9999-9999",
    hashtags: "#CruzeiroDosSonhos #EmbarqueJá #Amazônia",
    category: "nacional"
  },
  {
    destination: "Amazonas",
    text: "Invista em experiências no Amazonas! 🌳✨ Conheça a Floresta Amazônica, navegue pelos rios e aprenda sobre a cultura indígena local. Cada destino traz aprendizados e memórias que valem mais que qualquer bem material, e nosso pacote inclui ✈️ passagens e 🏨 hospedagem.\n✔️ Fique rico em histórias para contar por toda a vida.\nPlaneje pelo WhatsApp: (99) 9 9999-9999",
    hashtags: "#LembreteDeViagem #ExperiênciasIncríveis #Amazonas",
    category: "nacional"
  },
  {
    destination: "Alagoas",
    text: "Desbrave Alagoas com pacotes a partir de R$2.500! 🏖️🌊 Explore praias como São Miguel dos Milagres e Pajuçara, com suas águas mornas e cenários perfeitos para relaxar. Nosso pacote inclui ✈️ passagens, 🏨 hospedagem e passeios para conhecer o melhor da região.\n✔️ Um destino nacional cheio de belezas para descobrir.\nFale com a gente pelo WhatsApp: (99) 9 9999-9999",
    hashtags: "#ExploreOMundo #PacotesNacionais #Alagoas",
    category: "nacional"
  },
  {
    destination: "Genipabu",
    text: "Viaje em família para Genipabu! 🐪🌴 Conhecido pelas dunas e passeios de buggy, esse destino é perfeito para crianças e adultos. Nossos pacotes incluem ✈️ passagens e 🏨 hospedagem para momentos inesquecíveis.\n✔️ Momentos inesquecíveis para todas as idades garantidos.\nPlaneje agora pelo WhatsApp: (99) 9 9999-9999",
    hashtags: "#ViagemComCrianças #FériasEmFamília #Genipabu",
    category: "nacional"
  },
  {
    destination: "Ouro Preto",
    text: "Planeje sua viagem para Ouro Preto com antecedência! 🏰✨ Para garantir as melhores ofertas em passagens e hospedagem, programe-se com 3 a 6 meses. Ouro Preto é famosa pela história, igrejas barrocas e o charme das ladeiras.\n✔️ Economize e evite imprevistos para uma viagem perfeita.\nFale com a gente pelo WhatsApp: (99) 9 9999-9999",
    hashtags: "#DicasDeViagem #PlanejamentoDeViagem #OuroPreto",
    category: "nacional"
  },
  {
    destination: "João Pessoa",
    text: "Não perca seu voo para João Pessoa! ✈️🛂 Chegue com antecedência ao aeroporto, faça o check-in online e configure alarmes no celular para o horário de embarque. João Pessoa tem praias lindas como Tambaú e uma orla perfeita para caminhadas.\n✔️ Dicas para uma viagem tranquila e sem correrias.\nFale com a gente pelo WhatsApp: (99) 9 9999-9999",
    hashtags: "#DicasDeViagem #NaoPercaSeuVoo #JoãoPessoa",
    category: "nacional"
  },
  {
    destination: "Bonito - MS",
    text: "Bonito - MS é o paraíso do ecoturismo! 🐠🌿 Rios de águas cristalinas, grutas e cachoeiras fazem desse destino uma experiência única. Nosso pacote inclui ✈️ passagens, 🏨 hospedagem e passeios de flutuação.\n✔️ Conecte-se com a natureza em um dos destinos mais preservados do Brasil!\nPlaneje agora pelo WhatsApp: (99) 9 9999-9999",
    hashtags: "#Bonito #Ecoturismo #AventuraNaNatureza",
    category: "nacional"
  },
  {
    destination: "Chapada Diamantina",
    text: "A Chapada Diamantina é um tesouro baiano! 🏔️⛰️ Com cachoeiras, grutas e trilhas incríveis, esse destino é perfeito para os aventureiros. Nosso pacote inclui ✈️ passagens, 🏨 hospedagem e guia local.\n✔️ Uma aventura épica te espera na Bahia!\nFale com a gente pelo WhatsApp: (99) 9 9999-9999",
    hashtags: "#ChapadaDiamantina #AventuraBahia #TrilhasIncríveis",
    category: "nacional"
  },
  {
    destination: "Curitiba - PR",
    text: "Curitiba é a capital mais verde do Brasil! 🌳🚋 Com parques incríveis, o Jardim Botânico e gastronomia diversificada, a cidade é perfeita para city tour. Nosso pacote inclui ✈️ passagens e 🏨 hospedagem.\n✔️ Descubra os encantos da capital paranaense!\nReserve pelo WhatsApp: (99) 9 9999-9999",
    hashtags: "#Curitiba #CidadeVerde #TurismoCultural",
    category: "nacional"
  },
  {
    destination: "São Paulo",
    text: "São Paulo nunca dorme! 🏙️🎭 Com museus, restaurantes e vida cultural intensa, SP é o destino ideal para quem ama cidade grande. Nosso pacote inclui ✈️ passagens e 🏨 hospedagem em hotéis centrais.\n✔️ A maior metrópole da América Latina te espera!\nPlaneje pelo WhatsApp: (99) 9 9999-9999",
    hashtags: "#SãoPaulo #TurismoCultural #GastronomiaIncível",
    category: "nacional"
  },
  {
    destination: "Belo Horizonte - MG",
    text: "BH é comida e cultura de qualidade! 🍺🎨 Com bares tradicionais, o Mercado Central e Pampulha, Belo Horizonte oferece experiências únicas. Nosso pacote inclui ✈️ passagens e 🏨 hospedagem.\n✔️ Saboreie o melhor de Minas Gerais!\nFale conosco pelo WhatsApp: (99) 9 9999-9999",
    hashtags: "#BeloHorizonte #ComidaMineira #CulturaMineira",
    category: "nacional"
  },
  {
    destination: "Manaus - AM",
    text: "Manaus é a porta de entrada para a Amazônia! 🌴🚤 Com o encontro das águas, Teatro Amazonas e selva, a cidade oferece experiências únicas. Nosso pacote inclui ✈️ passagens, 🏨 hospedagem e city tour.\n✔️ Explore a capital do Amazonas!\nFale conosco pelo WhatsApp: (99) 9 9999-9999",
    hashtags: "#Manaus #EncontroDasÁguas #AmazôniaViva",
    category: "nacional"
  },

  // INTERNACIONAIS
  {
    destination: "Cozumel",
    text: "Explore Cozumel com conforto e sem preocupações! 🏝️🌊 Esse paraíso mexicano é famoso pelos recifes de corais e mergulhos incríveis. Nosso pacote inclui 5 diárias, ✈️ passagens de ida e volta, transfer do aeroporto ao hotel e passeios exclusivos, por apenas R$1.500 por pessoa.\n✔️ Uma viagem para relaxar e explorar o Caribe.\nGaranta sua viagem pelo WhatsApp: (99) 9 9999-9999",
    hashtags: "#DescubraCozumel #PacotesDeViagem #FériasInesquecíveis",
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
    hashtags: "#DiaDoTurista #ExplorarOMundo #Namíbia",
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
    hashtags: "#DicasDeViagem #ConfortoNosVoos #FortLauderdale",
    category: "internacional"
  },
  {
    destination: "Lisboa",
    text: "Sonha com Lisboa? ❄️✨ Lisboa é conhecida pelo clima ameno, história rica e pastéis de Belém irresistíveis. Nossos pacotes incluem ✈️ passagens e 🏨 hospedagem para uma experiência portuguesa completa.\n✔️ Escolha seu destino europeu e viva o charme de Portugal.\nFale com a gente pelo WhatsApp: (99) 9 9999-9999",
    hashtags: "#DestinosEuropa #ViagemPortugal #Lisboa",
    category: "internacional"
  },
  {
    destination: "Paris",
    text: "Deixe tudo por nossa conta em Paris! 🗼✈️ A Cidade Luz é perfeita para quem ama arte, gastronomia e romantismo. Nosso pacote inclui ✈️ passagens, 🏨 hospedagem e passeios para o Louvre, Torre Eiffel e Montmartre, com suporte completo.\n✔️ Viaje sem preocupações e viva a magia parisiense.\nFale com a gente pelo WhatsApp: (99) 9 9999-9999",
    hashtags: "#AgenciaDeViagens #PacotesDeViagem #Paris",
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
    hashtags: "#ViajarÉViver #MemóriasInesquecíveis #Taiwan",
    category: "internacional"
  },
  {
    destination: "Cusco",
    text: "Prepare-se para Cusco! 🏔️🧳 Cusco é a porta de entrada para Machu Picchu, com história e cultura incríveis. Nosso pacote inclui ✈️ passagens, 🏨 hospedagem e passeios guiados.\n✔️ Dicas para resolver imprevistos e curtir sua viagem.\nFale com a gente pelo WhatsApp: (99) 9 9999-9999",
    hashtags: "#DicasDeViagem #Cusco #ViagemSemEstresse",
    category: "internacional"
  },
  {
    destination: "Egito",
    text: "Aproveite dias incríveis no Egito! 🏜️✨ Conheça as Pirâmides de Gizé e o Rio Nilo com nosso pacote para 2 adultos, que inclui ✈️ passagens, 🏨 hospedagem e passeios guiados, a partir de 10x de R$150,00.\n✔️ Uma viagem histórica cheia de descanso e descobertas.\nGaranta sua vaga pelo WhatsApp: (99) 9 9999-9999",
    hashtags: "#ExcursãoEgito #ÚltimasVagas #Egito",
    category: "internacional"
  },
  {
    destination: "Washington",
    text: "Viaje para Washington com segurança! 🏛️✈️ Pesquise sobre o destino, use serviços oficiais como táxis credenciados e evite sacar grandes quantias de dinheiro. Washington tem museus incríveis e monumentos como o Lincoln Memorial.\n✔️ Dicas para uma viagem tranquila e sem golpes.\nPlaneje pelo WhatsApp: (99) 9 9999-9999",
    hashtags: "#DicasDeViagem #Washington #ViagemSegura",
    category: "internacional"
  },
  {
    destination: "Chicago",
    text: "Não deixe seus sonhos de viagem para Chicago para depois! 🏙️✨ Conhecida pela arquitetura e pela pizza deep-dish, Chicago é um destino vibrante. Nossos pacotes personalizados incluem ✈️ passagens, 🏨 hospedagem e passeios, com facilidade no pagamento.\n✔️ Ofertas especiais para você explorar essa cidade incrível.\nFale com a gente pelo WhatsApp: (99) 9 9999-9999",
    hashtags: "#ViajeMaisVivaMais #PacotesDeViagem #Chicago",
    category: "internacional"
  },
  {
    destination: "Ushuaia",
    text: "Saia da rotina em Ushuaia! ❄️✈️ Conhecida como o \"Fim do Mundo\", Ushuaia é perfeita para quem ama frio e paisagens glaciais. Nossos pacotes a partir de 10x de R$150,00 incluem ✈️ passagens, 🏨 hospedagem e passeios como o Trem do Fim do Mundo.\n✔️ Um destino único para sua próxima aventura.\nPlaneje agora pelo WhatsApp: (99) 9 9999-9999",
    hashtags: "#NovosDestinos #PacotesDeViagem #Ushuaia",
    category: "internacional"
  },
  {
    destination: "Boston",
    text: "Curta dias de sol em Boston! 🏛️✨ Explore a Freedom Trail e o charme histórico dessa cidade americana. Nossos pacotes especiais incluem ✈️ passagens, 🏨 hospedagem e passeios, com facilidade de pagamento para tornar sua viagem ainda mais tranquila.\n✔️ Uma aventura inesquecível te espera na Nova Inglaterra.\nGaranta sua vaga pelo WhatsApp: (99) 9 9999-9999",
    hashtags: "#PartiuBoston #ViagemDosSonhos #Boston",
    category: "internacional"
  },
  {
    destination: "Machu Picchu",
    text: "Viaje de avião para Machu Picchu pela primeira vez! 🏔️✈️ Chegue cedo ao aeroporto, siga as regras de bagagem e relaxe durante o voo. Machu Picchu é uma das 7 Maravilhas do Mundo, com ruínas incas que vão te encantar.\n✔️ Dicas para curtir a experiência e explorar esse destino histórico.\nFale com a gente pelo WhatsApp: (99) 9 9999-9999",
    hashtags: "#PrimeiraViagem #DicasDeViagem #MachuPicchu",
    category: "internacional"
  },
  {
    destination: "Salar de Uyuni",
    text: "Escolha o destino perfeito para Salar de Uyuni! 🏜️📸 O maior deserto de sal do mundo é ideal para fotos incríveis e paisagens surreais. Nossa equipe te ajuda a planejar a viagem dos sonhos, com ✈️ passagens e 🏨 hospedagem inclusas.\n✔️ Um lugar para relaxar, explorar ou se aventurar.\nFale com a gente pelo WhatsApp: (99) 9 9999-9999",
    hashtags: "#DestinoIdeal #PlanejeSuaViagem #SalarDeUyuni",
    category: "internacional"
  },
  {
    destination: "Cancún",
    text: "Nossos clientes amam suas viagens para Cancún! 🏖️✨ Com praias de areia branca e águas turquesas, Cancún é um paraíso no México. Trabalhamos para garantir que cada experiência seja única, com ✈️ passagens e 🏨 hospedagem inclusas.\n✔️ Faça parte dessas histórias de sucesso e viva o Caribe.\nPlaneje sua viagem pelo WhatsApp: (99) 9 9999-9999",
    hashtags: "#FeedbackDeClientes #ViagemIncrível #Cancún",
    category: "internacional"
  },
  {
    destination: "Israel",
    text: "Evite erros ao planejar sua viagem para Israel! 🏛️✈️ Conhecido pela história de Jerusalém e pelo Mar Morto, Israel é um destino único. Confira dicas para uma jornada sem dores de cabeça, com ✈️ passagens e 🏨 hospedagem organizadas por nós.\n✔️ Viaje com mais segurança e aproveite cada momento.\nPlaneje pelo WhatsApp: (99) 9 9999-9999",
    hashtags: "#DicasDeViagem #ViagemInternacional #Israel",
    category: "internacional"
  },
  {
    destination: "Bruxelas",
    text: "Passaporte vencido antes de ir para Bruxelas? 🛂✈️ Não se preocupe! Saiba como resolver rapidamente: renove com antecedência e verifique as exigências do destino. Bruxelas é famosa pelo chocolate e pela Grand Place, um destino imperdível.\n✔️ Planeje com antecedência e evite problemas no embarque.\nFale com a gente pelo WhatsApp: (99) 9 9999-9999",
    hashtags: "#PassaporteVencido #DicasDeViagem #Bruxelas",
    category: "internacional"
  },
  {
    destination: "Dublin",
    text: "Viaje sozinho para Dublin com segurança! 🍀✨ Conhecida pelos pubs e pela cultura celta, Dublin é perfeita para uma aventura solo. Confira dicas essenciais para uma jornada tranquila, como escolher hostels seguros e planejar seu roteiro.\n✔️ Salve essas dicas e curta sua viagem com confiança.\nPlaneje sua aventura pelo WhatsApp: (99) 9 9999-9999",
    hashtags: "#DicasDeSegurança #ViajarSozinho #Dublin",
    category: "internacional"
  },
  {
    destination: "Jordânia",
    text: "Planeje sua primeira aventura como mochileiro em Jordânia! 🏜️🧳 Conhecida por Petra e pelo deserto de Wadi Rum, Jordânia é um destino épico. Dicas como levar uma mochila leve e reservar passeios guiados garantem uma viagem sem estresse.\n✔️ Um guia essencial para começar sua jornada.\nSalve e planeje pelo WhatsApp: (99) 9 9999-9999",
    hashtags: "#MochileirosDePrimeiraViagem #DicasDeMochileiro #Jordânia",
    category: "internacional"
  },
  {
    destination: "África",
    text: "Explore a África sem gastar muito! 🦒📸 De safáris na Tanzânia a praias em Zanzibar, há opções para todos os bolsos. Dicas como viajar na baixa temporada e escolher hospedagens econômicas ajudam a curtir ao máximo.\n✔️ Aproveite sua próxima aventura africana com orçamento limitado.\nPlaneje pelo WhatsApp: (99) 9 9999-9999",
    hashtags: "#ViajarComPouco #DicasDeViagem #África",
    category: "internacional"
  },
  {
    destination: "Punta Cana",
    text: "Está na hora de planejar suas férias dos sonhos em Punta Cana! 🏖️✨ Com resorts all-inclusive e praias de areia branca, esse destino é perfeito para relaxar. Nosso pacote inclui ✈️ passagens, 🏨 hospedagem e traslados, por 10x de R$450,00.\n✔️ Um paraíso caribenho para descansar e se divertir.\nGaranta seu pacote pelo WhatsApp: (99) 9 9999-9999",
    hashtags: "#ViajarÉViver #PuntaCanaDream #PuntaCana",
    category: "internacional"
  },
  {
    destination: "Praga",
    text: "Descubra Praga com pacotes exclusivos! 🏰✨ Conhecida pela Ponte Carlos e pelo Castelo de Praga, essa cidade é um conto de fadas. Nossos pacotes oferecem ✈️ passagens, 🏨 hospedagem e passeios, com preços acessíveis e suporte completo.\n✔️ Condições facilitadas para todos os perfis de viajantes.\nPlaneje sua viagem pelo WhatsApp: (99) 9 9999-9999",
    hashtags: "#DescubraOMundo #ViajeComEstilo #Praga",
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
    hashtags: "#ViajarSemPreocupação #PacoteDeViagem #Bariloche",
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
    hashtags: "#ExplorarOMundo #ViagemSemComplicação #Budapeste",
    category: "internacional"
  },
  {
    destination: "Orlando",
    text: "Relaxe em Orlando com nossos pacotes perfeitos! 🎢✨ Conhecida pelos parques da Disney e Universal, Orlando é ideal para famílias e amantes de diversão. Nosso pacote inclui ✈️ passagens, 🏨 hospedagem e ingressos, com parcelamento no boleto.\n✔️ Um destino mágico para criar memórias inesquecíveis.\nFale com a gente pelo WhatsApp: (99) 9 9999-9999",
    hashtags: "#PlanejeSuasFérias #PacotesImperdíveis #Orlando",
    category: "internacional"
  },
  {
    destination: "Aruba",
    text: "Viaje para Aruba com segurança! 🏖️✈️ Adicione o seguro bagagem ao seu pacote e proteja sua mala contra perdas ou extravios. Aruba é famosa pelas praias de Eagle Beach e pela vibe caribenha, perfeita para relaxar.\n✔️ Cobertura completa para curtir sem preocupações.\nAdicione ao seu pacote pelo WhatsApp: (99) 9 9999-9999",
    hashtags: "#SeguroBagagem #ViagemTranquila #Aruba",
    category: "internacional"
  },
  {
    destination: "Phi Phi",
    text: "Suas férias estão chegando, e Phi Phi te espera! 🏝️✨ Conhecida pelas águas cristalinas e falésias, Phi Phi é um paraíso na Tailândia. Nosso pacote inclui ✈️ passagens, 🏨 hospedagem e passeios de barco para explorar as ilhas, tudo organizado para você.\n✔️ Não deixe para última hora e garanta uma viagem perfeita.\nFale agora pelo WhatsApp: (99) 9 9999-9999",
    hashtags: "#PlanejeSuasFérias #ViagemSemEstresse #PhiPhi",
    category: "internacional"
  },
  {
    destination: "São Francisco",
    text: "Embarque em uma aventura por São Francisco! 🚤✨ Navegue pela Baía de São Francisco, com vista para a Golden Gate, e desfrute de gastronomia e atividades a bordo. Nosso pacote inclui tudo: alimentação, passeios e hospedagem.\n✔️ Uma experiência única para explorar a costa da Califórnia.\nReserve pelo WhatsApp: (99) 9 9999-9999",
    hashtags: "#CruzeiroDosSonhos #EmbarqueJá #SãoFrancisco",
    category: "internacional"
  },
  {
    destination: "Pisa",
    text: "Descubra Pisa e viva experiências únicas! 🏛️✨ Conhecida pela Torre Inclinada e pela Piazza dei Miracoli, Pisa é um destino cheio de história. Nosso pacote inclui ✈️ passagens, 🏨 hospedagem e passeios para explorar a cidade e arredores, como Florença.\n✔️ Uma viagem para se encantar com a Itália.\nEntre em contato pelo WhatsApp: (99) 9 9999-9999",
    hashtags: "#ViajarÉViver #MagiaDosDestinos #Pisa",
    category: "internacional"
  },
  {
    destination: "Capadócia",
    text: "Busca aventura na Capadócia? 🎈✨ Conhecida pelos passeios de balão e pelas formações rochosas únicas, a Capadócia é perfeita para quem ama emoção. Nossos pacotes cheios de adrenalina incluem ✈️ passagens e hospedagem, a partir de 10x de R$190,00.\n✔️ Um destino para explorar e se divertir ao máximo.\nGaranta sua vaga pelo WhatsApp: (99) 9 9999-9999",
    hashtags: "#DestinoDeAventura #PacotesDeViagem #Capadócia",
    category: "internacional"
  },
  {
    destination: "Lima",
    text: "Viajar para Lima é colecionar momentos inesquecíveis! 🍽️✨ Conhecida pela gastronomia premiada e pelo centro histórico, Lima é um destino vibrante. Nossos pacotes oferecem ✈️ passagens e 🏨 hospedagem para você viver uma experiência cultural única.\n✔️ Invista em memórias que valem mais que qualquer coisa.\nPlaneje pelo WhatsApp: (99) 9 9999-9999",
    hashtags: "#ViajarÉInvestir #FériasPerfeitas #Lima",
    category: "internacional"
  },
  {
    destination: "Grécia",
    text: "Planeje sua viagem dos sonhos para a Grécia! 🏛️✨ Com ilhas como Santorini e Mykonos, a Grécia é perfeita para quem ama história e praias. Nossos pacotes personalizados incluem ✈️ passagens, 🏨 hospedagem e passeios, com parcelamento em até 12x.\n✔️ Um destino incrível para relaxar e explorar.\nFale com a gente pelo WhatsApp: (99) 9 9999-9999",
    hashtags: "#ExplorarOMundo #PacotesDeViagem #Grécia",
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
    hashtags: "#ViajarÉViver #ReduçãoDoEstresse #Maldivas",
    category: "internacional"
  },
  {
    destination: "Dubai",
    text: "Descubra Dubai e viva o luxo! 🏙️✨ Com arranha-céus impressionantes, praias douradas e compras incríveis, Dubai é um destino único. Nosso pacote inclui ✈️ passagens, 🏨 hospedagem em hotéis 5 estrelas e passeios exclusivos.\n✔️ Viva experiências de tirar o fôlego.\nPlaneje pelo WhatsApp: (99) 9 9999-9999",
    hashtags: "#Dubai #LuxoEConforto #DestinoDosSonhos",
    category: "internacional"
  },
  {
    destination: "Itália",
    text: "A Itália te espera para uma viagem inesquecível! 🍝🏛️ De Roma a Veneza, explore história, arte e gastronomia de primeira. Nosso pacote inclui ✈️ passagens, 🏨 hospedagem e passeios pelos pontos mais icônicos.\n✔️ Uma experiência que vai marcar sua vida.\nFale com a gente pelo WhatsApp: (99) 9 9999-9999",
    hashtags: "#Itália #ViagemDosSonhos #CulturaEGastronomia",
    category: "internacional"
  },
  {
    destination: "Disney",
    text: "Realize o sonho de conhecer a Disney! 🏰✨ Com parques mágicos e atrações para todas as idades, Orlando é o destino perfeito para famílias. Nosso pacote inclui ✈️ passagens, 🏨 hospedagem e ingressos para os parques.\n✔️ Crie memórias mágicas que durarão para sempre.\nGaranta seu pacote pelo WhatsApp: (99) 9 9999-9999",
    hashtags: "#Disney #SonhosRealizados #FériasEmFamília",
    category: "internacional"
  },
  {
    destination: "Tailândia",
    text: "Explore a Tailândia e suas maravilhas! 🏝️🛕 De Bangkok a Phuket, descubra templos, praias e uma cultura fascinante. Nosso pacote inclui ✈️ passagens, 🏨 hospedagem e passeios guiados.\n✔️ Uma aventura asiática que você nunca vai esquecer.\nPlaneje pelo WhatsApp: (99) 9 9999-9999",
    hashtags: "#Tailândia #AventuraAsiática #DestinoExótico",
    category: "internacional"
  },
  {
    destination: "Seychelles",
    text: "Sonha com Seychelles? 🏝️✨ Com praias de areia branca e águas turquesa, esse arquipélago é o paraíso na Terra. Nosso pacote inclui ✈️ passagens, 🏨 hospedagem em resort e passeios pelas ilhas.\n✔️ O destino perfeito para lua de mel ou relaxamento.\nGaranta sua viagem pelo WhatsApp: (99) 9 9999-9999",
    hashtags: "#Seychelles #ParaísoNaTerra #LuaDeMel",
    category: "internacional"
  },
];
