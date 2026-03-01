export interface ContentLibraryItem {
    id: string;
    category: 'offer' | 'ranking' | 'script' | 'cta';
    title: string;
    text: string;
    fullText?: string;
    isPremium: boolean;
    tags: string[];
    icon?: string;
}

export const contentLibrary: ContentLibraryItem[] = [
    // =============================================
    // OFERTAS NACIONAIS (1-25) — first 3 free
    // =============================================
    {
        id: 'off-01',
        category: 'offer',
        title: '🌊 Rio de Janeiro (RJ)',
        text: `📍 RIO DE JANEIRO | 4 NOITES\n💰 A partir de R$ 2.200/pessoa\n✈️ Aéreo + Hotel 4★ + Café da manhã\n💳 10x sem juros | Pix: 5% desconto`,
        fullText: `🌊 RIO DE JANEIRO — A CIDADE MARAVILHOSA TE ESPERA!\n\n4 noites com tudo que você precisa para uma viagem inesquecível.\n\n✅ INCLUI:\n• Passagem aérea (ida e volta)\n• Hotel 3★ ou 4★ em Copacabana ou Ipanema\n• Café da manhã todos os dias\n• Transfer aeroporto / hotel / aeroporto\n\nROTEIRO SUGERIDO:\n• Dia 1 → Cristo Redentor + Pão de Açúcar\n• Dia 2 → Praias de Ipanema e Copacabana\n• Dia 3 → Santa Teresa + Lapa + vida noturna\n• Dia 4 → Maracanã ou Jardim Botânico\n\n💰 A PARTIR DE R$ 2.200/PESSOA\n💳 Parcelamento: até 10x sem juros no cartão\n📲 Pix com 5% de desconto à vista\n\nVagas limitadas! Reserve já!\n📞 [TELEFONE] | 💬 WhatsApp: [NÚMERO]\n🌐 [SITE] | 📧 [EMAIL]\n[NOME DA AGÊNCIA] — Sua viagem, nossa especialidade.`,
        isPremium: false,
        tags: ['Nacional', 'Praia', 'Cultura'],
        icon: '🌊'
    },
    {
        id: 'off-02',
        category: 'offer',
        title: '❄️ Gramado (RS)',
        text: `📍 GRAMADO | 4 NOITES\n💰 A partir de R$ 1.800/pessoa\n🏔️ Serra + Gastronomia + Romance\n💳 10x sem juros | Pix: 5% desconto`,
        fullText: `❄️ GRAMADO — O CHARME EUROPEU NO CORAÇÃO DO BRASIL!\n\n4 noites na cidade mais romântica e encantadora do Sul.\n\n✅ INCLUI:\n• Passagem aérea para Porto Alegre + Transfer para Gramado\n• Hotel boutique ou pousada charmosa\n• Café da manhã colonial completo\n\nATRAÇÕES:\n• Chocolates e Caracol\n• Parque Knorr e Lago Negro\n• Dreamland e Mini Mundo\n• Gastronomia italiana e alemã\n• Vinícolas da Serra Gaúcha (opcional)\n\n💰 A PARTIR DE R$ 1.800/PESSOA\n💳 10x sem juros | 📲 Pix: 5% desconto\n📞 [TELEFONE] | 💬 WhatsApp: [NÚMERO]\n🌐 [SITE]\n[NOME DA AGÊNCIA]`,
        isPremium: false,
        tags: ['Nacional', 'Serra', 'Romance'],
        icon: '❄️'
    },
    {
        id: 'off-03',
        category: 'offer',
        title: '🌊 Maceió (AL)',
        text: `📍 MACEIÓ | 5 NOITES\n💰 A partir de R$ 1.800/pessoa\n🏖️ Caribe Brasileiro + All Inclusive disponível!\n💳 10x sem juros | Pix: 5% desconto`,
        fullText: `🌊 MACEIÓ — ÁGUAS VERDE-ESMERALDA TE AGUARDAM!\n\n5 noites no destino mais amado pelas famílias brasileiras.\n\n✅ INCLUI:\n• Passagem aérea (ida e volta)\n• Hotel/Resort com café da manhã\n• Transfer aeroporto/hotel\n\nNÃO PERCA:\n• Piscinas naturais de Pajuçara (jangadas)\n• Praia de Ipioca e Gunga (lindíssimas!)\n• Passeio de catamarã pelo litoral\n• Gastronomia típica alagoana\n\n🏨 OPÇÃO ALL INCLUSIVE disponível!\n\n💰 A PARTIR DE R$ 1.800/PESSOA\n💳 10x sem juros | 📲 Pix: 5% desconto\n📞 [TELEFONE] | 💬 WhatsApp: [NÚMERO]\n🌐 [SITE]\n[NOME DA AGÊNCIA]`,
        isPremium: false,
        tags: ['Nacional', 'Nordeste', 'Família'],
        icon: '🌊'
    },
    {
        id: 'off-04',
        category: 'offer',
        title: '🐠 Porto de Galinhas (PE)',
        text: `📍 PORTO DE GALINHAS | 5 NOITES\n💰 A partir de R$ 1.900/pessoa\n🐠 Piscinas naturais + Aéreo incluso\n💳 10x sem juros | Pix: 5% desconto`,
        fullText: `🐠 PORTO DE GALINHAS — O CARIBE BRASILEIRO!\n\nO destino mais desejado do Nordeste com 5 noites de paraíso.\n\n✅ INCLUI:\n• Passagem aérea (ida e volta)\n• Hotel com localização privilegiada\n• Café da manhã diário\n• Passeio de jangada nas piscinas naturais ✅\n• Transfer aeroporto / hotel\n\nATRAÇÕES IMPERDÍVEIS:\n• Piscinas naturais com peixes coloridos\n• Praia de Muro Alto — mar calmo e raso\n• Praia de Maracaípe — para quem gosta de surf\n• Gastronomia regional incrível\n\n💰 A PARTIR DE R$ 1.900/PESSOA\n💳 10x sem juros | 📲 Pix: 5% desconto\n📞 [TELEFONE] | 💬 WhatsApp: [NÚMERO]\n🌐 [SITE]\n[NOME DA AGÊNCIA]`,
        isPremium: true,
        tags: ['Nacional', 'Nordeste', 'Praia'],
        icon: '🐠'
    },
    {
        id: 'off-05',
        category: 'offer',
        title: '🌅 Fortaleza (CE)',
        text: `📍 FORTALEZA | 5 NOITES\n💰 A partir de R$ 1.600/pessoa\n☀️ Beach Park + Praia do Futuro\n💳 10x sem juros | Pix: 5% desconto`,
        fullText: `🌅 FORTALEZA — BEIRA-MAR, LAGOAS E DUNAS!\n\n5 noites de aventura e relaxamento na capital cearense.\n\n✅ INCLUI:\n• Passagem aérea (ida e volta)\n• Hotel em Beira-Mar\n• Café da manhã + Transfer\n\nROTEIRO SUGERIDO:\n• Dia 1 → Praia de Iracema + Dragão do Mar\n• Dia 2 → Beach Park\n• Dia 3 → Praia do Futuro\n• Dia 4 → Canoa Quebrada (bate-volta)\n• Dia 5 → Compras e gastronomia\n\n💰 A PARTIR DE R$ 1.600/PESSOA\n💳 10x sem juros | 📲 Pix: 5% desconto\n📞 [TELEFONE] | 💬 WhatsApp: [NÚMERO]\n🌐 [SITE]\n[NOME DA AGÊNCIA]`,
        isPremium: true,
        tags: ['Nacional', 'Nordeste', 'Aventura'],
        icon: '🌅'
    },
    {
        id: 'off-06',
        category: 'offer',
        title: '🌴 Florianópolis (SC)',
        text: `📍 FLORIANÓPOLIS | 5 NOITES\n💰 A partir de R$ 1.900/pessoa\n🏖️ 42 praias + Natureza\n💳 10x sem juros | Pix: 5% desconto`,
        fullText: `🌴 FLORIANÓPOLIS — A ILHA DA MAGIA!\n\n42 praias, lagoas e trilhas em 5 noites inesquecíveis.\n\n✅ INCLUI:\n• Passagem aérea (ida e volta)\n• Hotel em Jurerê, Ingleses ou Centro\n• Café da manhã | Transfer aeroporto/hotel\n\nDESTAQUES:\n• Praia de Jurerê Internacional\n• Lagoa da Conceição\n• Praia da Joaquina (surf)\n• Culinária açoriana típica\n\n💰 A PARTIR DE R$ 1.900/PESSOA\n💳 10x sem juros | 📲 Pix: 5% desconto\n📞 [TELEFONE] | 💬 WhatsApp: [NÚMERO]\n🌐 [SITE]\n[NOME DA AGÊNCIA]`,
        isPremium: true,
        tags: ['Nacional', 'Praia', 'Natureza'],
        icon: '🌴'
    },
    {
        id: 'off-07',
        category: 'offer',
        title: '🥁 Salvador (BA)',
        text: `📍 SALVADOR | 5 NOITES\n💰 A partir de R$ 1.700/pessoa\n🥁 Cultura, axé e praias | Pelourinho\n💳 10x sem juros | Pix: 5% desconto`,
        fullText: `🥁 SALVADOR — A CIDADE DA ALEGRIA E DA CULTURA!\n\n5 noites na capital baiana com muito ritmo e história.\n\n✅ INCLUI:\n• Passagem aérea (ida e volta)\n• Hotel em Barra ou Rio Vermelho\n• Café da manhã | Transfer\n\nROTEIRO:\n• Pelourinho — Patrimônio UNESCO\n• Praia da Barra e Ondina\n• Mercado São Joaquim\n• Elevador Lacerda\n• Gastronomia baiana (acarajé!)\n\n💰 A PARTIR DE R$ 1.700/PESSOA\n💳 10x sem juros | 📲 Pix: 5% desconto\n📞 [TELEFONE] | 💬 WhatsApp: [NÚMERO]\n🌐 [SITE]\n[NOME DA AGÊNCIA]`,
        isPremium: true,
        tags: ['Nacional', 'Nordeste', 'Cultura'],
        icon: '🥁'
    },
    {
        id: 'off-08',
        category: 'offer',
        title: '🏜️ Natal (RN)',
        text: `📍 NATAL | 5 NOITES\n💰 A partir de R$ 1.600/pessoa\n🏜️ Dunas + Buggy + Praia\n💳 10x sem juros | Pix: 5% desconto`,
        isPremium: true,
        tags: ['Nacional', 'Nordeste', 'Aventura'],
        icon: '🏜️'
    },
    {
        id: 'off-09',
        category: 'offer',
        title: '🏖️ Porto Seguro (BA)',
        text: `📍 PORTO SEGURO | 4 NOITES\n💰 A partir de R$ 1.340/pessoa\n🎉 Passarela do Descobrimento + Trancoso\n💳 12x de R$ 111.67 sem juros`,
        isPremium: true,
        tags: ['Nacional', 'Nordeste', 'Festa'],
        icon: '🏖️'
    },
    {
        id: 'off-10',
        category: 'offer',
        title: '💧 Foz do Iguaçu (PR)',
        text: `📍 FOZ DO IGUAÇU | 4 NOITES\n💰 A partir de R$ 1.150/pessoa\n🌊 Cataratas + Parque das Aves\n💳 12x de R$ 95.83 sem juros`,
        isPremium: true,
        tags: ['Nacional', 'Aventura', 'Natureza'],
        icon: '💧'
    },
    {
        id: 'off-11',
        category: 'offer',
        title: '🎢 Beto Carrero (SC)',
        text: `📍 BETO CARRERO | 3 NOITES\n💰 A partir de R$ 1.280/pessoa\n🎢 Maior Parque Temático da AL\n💳 12x de R$ 106.67 sem juros`,
        isPremium: true,
        tags: ['Nacional', 'Família', 'Parque'],
        icon: '🎢'
    },
    {
        id: 'off-12',
        category: 'offer',
        title: '🏙️ São Paulo (SP)',
        text: `📍 SÃO PAULO | 3 NOITES\n💰 A partir de R$ 890/pessoa\n🍽️ Gastronomia + Av. Paulista\n💳 12x de R$ 74.17 sem juros`,
        isPremium: true,
        tags: ['Nacional', 'Gastronomia', 'Cultura'],
        icon: '🏙️'
    },
    {
        id: 'off-13',
        category: 'offer',
        title: '🌅 Jericoacoara (CE)',
        text: `📍 JERICOACOARA | 5 NOITES\n💰 A partir de R$ 2.100/pessoa\n🏖️ Pedra Furada + Lagoa do Paraíso\n💳 12x de R$ 175.00 sem juros`,
        isPremium: true,
        tags: ['Nacional', 'Nordeste', 'Premium'],
        icon: '🌅'
    },
    {
        id: 'off-14',
        category: 'offer',
        title: '🐠 Maragogi (AL)',
        text: `📍 MARAGOGI | 4 NOITES\n💰 A partir de R$ 1.650/pessoa\n🌊 Galés + Mar cristalino\n💳 12x de R$ 137.50 sem juros`,
        isPremium: true,
        tags: ['Nacional', 'Nordeste', 'Praia'],
        icon: '🐠'
    },
    {
        id: 'off-15',
        category: 'offer',
        title: '🤿 Bonito (MS)',
        text: `📍 BONITO | 5 NOITES\n💰 A partir de R$ 2.300/pessoa\n🤿 Flutuação Rio Sucuri + Mergulho\n💳 12x de R$ 191.67 sem juros`,
        isPremium: true,
        tags: ['Nacional', 'Ecoturismo', 'Aventura'],
        icon: '🤿'
    },
    {
        id: 'off-16',
        category: 'offer',
        title: '🏝️ Fernando de Noronha (PE)',
        text: `📍 NORONHA | 5 NOITES\n💰 A partir de R$ 4.500/pessoa\n🐢 Baía do Sancho + Exclusividade\n💳 12x de R$ 375.00 sem juros`,
        isPremium: true,
        tags: ['Nacional', 'Premium', 'Ecoturismo'],
        icon: '🏝️'
    },
    {
        id: 'off-17',
        category: 'offer',
        title: '⛵ Arraial do Cabo (RJ)',
        text: `📍 ARRAIAL DO CABO | 3 NOITES\n💰 A partir de R$ 950/pessoa\n⛵ Passeio de barco incluso\n💳 12x de R$ 79.17 sem juros`,
        isPremium: true,
        tags: ['Nacional', 'Praia', 'Econômico'],
        icon: '⛵'
    },
    {
        id: 'off-18',
        category: 'offer',
        title: '🌿 Manaus (AM)',
        text: `📍 MANAUS | 4 NOITES\n💰 A partir de R$ 1.980/pessoa\n🌿 Encontro das Águas + Lodge de Selva\n💳 12x de R$ 165.00 sem juros`,
        isPremium: true,
        tags: ['Nacional', 'Ecoturismo', 'Amazônia'],
        icon: '🌿'
    },
    {
        id: 'off-19',
        category: 'offer',
        title: '🌅 João Pessoa (PB)',
        text: `📍 JOÃO PESSOA | 4 NOITES\n💰 A partir de R$ 1.420/pessoa\n🌅 Pôr do Sol no Jacaré + Tranquilidade\n💳 12x de R$ 118.33 sem juros`,
        isPremium: true,
        tags: ['Nacional', 'Nordeste', 'Tranquilidade'],
        icon: '🌅'
    },
    {
        id: 'off-20',
        category: 'offer',
        title: '🏙️ Balneário Camboriú (SC)',
        text: `📍 BALNEÁRIO CAMBORIÚ | 4 NOITES\n💰 A partir de R$ 1.350/pessoa\n🎡 Roda Gigante + Vista para o mar\n💳 12x de R$ 112.50 sem juros`,
        isPremium: true,
        tags: ['Nacional', 'Praia', 'Vida Noturna'],
        icon: '🏙️'
    },
    {
        id: 'off-21',
        category: 'offer',
        title: '🏖️ Recife (PE)',
        text: `📍 RECIFE | 5 NOITES\n💰 A partir de R$ 1.500/pessoa\n🏖️ Cultura + Gastronomia + Praia\n💳 10x sem juros | Pix: 5% desconto`,
        isPremium: true,
        tags: ['Nacional', 'Nordeste', 'Cultura'],
        icon: '🏖️'
    },
    {
        id: 'off-22',
        category: 'offer',
        title: '🏛️ Belém (PA)',
        text: `📍 BELÉM | 4 NOITES\n💰 A partir de R$ 1.600/pessoa\n🍲 Gastronomia amazônica + Natureza\n💳 10x sem juros | Pix: 5% desconto`,
        isPremium: true,
        tags: ['Nacional', 'Ecoturismo', 'Gastronomia'],
        icon: '🏛️'
    },
    {
        id: 'off-23',
        category: 'offer',
        title: '🏜️ Lençóis Maranhenses (MA)',
        text: `📍 LENÇÓIS MARANHENSES | 5 NOITES\n💰 A partir de R$ 2.500/pessoa\n🏜️ Natureza única no mundo\n💳 10x sem juros | Pix: 5% desconto`,
        isPremium: true,
        tags: ['Nacional', 'Ecoturismo', 'Natureza'],
        icon: '🏜️'
    },
    {
        id: 'off-24',
        category: 'offer',
        title: '♨️ Caldas Novas (GO)',
        text: `📍 CALDAS NOVAS | 4 NOITES\n💰 A partir de R$ 1.200/pessoa\n♨️ Termas + Resorts + Família\n💳 10x sem juros | Pix: 5% desconto`,
        isPremium: true,
        tags: ['Nacional', 'Família', 'Termas'],
        icon: '♨️'
    },
    {
        id: 'off-25',
        category: 'offer',
        title: '🏖️ Búzios (RJ)',
        text: `📍 BÚZIOS | 4 NOITES\n💰 A partir de R$ 1.800/pessoa\n🏖️ Luxo + Praia + Sofisticação\n💳 10x sem juros | Pix: 5% desconto`,
        isPremium: true,
        tags: ['Nacional', 'Premium', 'Luxo'],
        icon: '🏖️'
    },

    // =============================================
    // OFERTAS INTERNACIONAIS (26-50)
    // =============================================
    {
        id: 'off-26',
        category: 'offer',
        title: '🎢 Orlando (EUA)',
        text: `📍 ORLANDO | 8 NOITES\n💰 A partir de R$ 6.800/pessoa\n🎢 Disney + Universal Studios\n💳 12x de R$ 566.67 sem juros`,
        fullText: `🎢 ORLANDO — O MAIOR PARQUE DE DIVERSÕES DO MUNDO!\n\n7 noites de pura magia com sua família.\n\n✅ INCLUI:\n• Passagem aérea (ida e volta)\n• Hotel perto da International Drive\n• Café da manhã | Transfer aeroporto/hotel\n\n🎡 PARQUES (ingressos opcionais):\n• Walt Disney World (4 parques)\n• Universal Studios + Islands of Adventure\n• SeaWorld e Busch Gardens\n• LEGOLAND e Aquatica\n\n💡 DICA: Solicite nosso pacote com ingressos e economize!\n\n💰 A PARTIR DE R$ 6.800/PESSOA\n💳 10x sem juros | 📲 Pix: 5% desconto\n📞 [TELEFONE] | 💬 WhatsApp: [NÚMERO]\n🌐 [SITE]\n[NOME DA AGÊNCIA]`,
        isPremium: true,
        tags: ['Internacional', 'Família', 'Parques'],
        icon: '🎢'
    },
    {
        id: 'off-27',
        category: 'offer',
        title: '🥩 Buenos Aires (ARG)',
        text: `📍 BUENOS AIRES | 5 NOITES\n💰 A partir de R$ 3.500/pessoa\n🥩 Tango + Cultura | Sem visto!\n💳 10x sem juros | Pix: 5% desconto`,
        fullText: `🥩 BUENOS AIRES — A PARIS DA AMÉRICA DO SUL!\n\n5 noites na capital mais europeia da América Latina.\n\n✅ INCLUI:\n• Passagem aérea (ida e volta)\n• Hotel 3★/4★ em Palermo ou Recoleta\n• Café da manhã | Transfer aeroporto/hotel\n\nIMPERDÍVEIS:\n• La Boca e El Caminito\n• Show de Tango (recomendado!)\n• Puerto Madero\n• Recoleta e cemitério histórico\n• Gastronomia: asado e vinhos Malbec\n\n🛂 NÃO PRECISA DE VISTO!\n\n💰 A PARTIR DE R$ 3.500/PESSOA\n💳 10x sem juros | 📲 Pix: 5% desconto\n📞 [TELEFONE] | 💬 WhatsApp: [NÚMERO]\n🌐 [SITE]\n[NOME DA AGÊNCIA]`,
        isPremium: true,
        tags: ['Internacional', 'Cultura', 'Gastronomia'],
        icon: '🥩'
    },
    {
        id: 'off-28',
        category: 'offer',
        title: '🚋 Lisboa (Portugal)',
        text: `📍 LISBOA | 7 NOITES\n💰 A partir de R$ 6.500/pessoa\n🚋 História + Pastéis + Fado | Sem visto!\n💳 10x sem juros | Pix: 5% desconto`,
        fullText: `🚋 LISBOA — A CIDADE DOS SETE MORROS!\n\nA cidade mais buscada pelos brasileiros na Europa.\n\n✅ INCLUI:\n• Passagem aérea (ida e volta)\n• Hotel 3★/4★ em Lisboa Centro\n• Café da manhã | Transfer aeroporto/hotel\n\nROTEIRO CLÁSSICO:\n• Alfama e Castelo de São Jorge\n• Torre de Belém e Mosteiro dos Jerônimos\n• Sintra — excursão de 1 dia imperdível!\n• Bairro Alto + Pastéis de Belém\n• Porto — bate-volta ou extensão\n\n🛂 NÃO PRECISA DE VISTO! Falar português facilita tudo!\n\n💰 A PARTIR DE R$ 6.500/PESSOA\n💳 10x sem juros | 📲 Pix: 5% desconto\n📞 [TELEFONE] | 💬 WhatsApp: [NÚMERO]\n🌐 [SITE]\n[NOME DA AGÊNCIA]`,
        isPremium: true,
        tags: ['Internacional', 'Europa', 'Cultura'],
        icon: '🚋'
    },
    {
        id: 'off-29',
        category: 'offer',
        title: '🌴 Miami (EUA)',
        text: `📍 MIAMI | 7 NOITES\n💰 A partir de R$ 7.000/pessoa\n🌴 South Beach + Compras + Vida noturna\n💳 10x sem juros | Pix: 5% desconto`,
        isPremium: true,
        tags: ['Internacional', 'Praia', 'Compras'],
        icon: '🌴'
    },
    {
        id: 'off-30',
        category: 'offer',
        title: '🏔️ Santiago + Bariloche',
        text: `📍 SANTIAGO + BARILOCHE | 7 NOITES\n💰 A partir de R$ 5.500/pessoa\n🏔️ Gastronomia + Neve + Lagos | 2 países!\n💳 10x sem juros | Pix: 5% desconto`,
        isPremium: true,
        tags: ['Internacional', 'Neve', 'Gastronomia'],
        icon: '🏔️'
    },
    {
        id: 'off-31',
        category: 'offer',
        title: '🏝️ Cancún (México)',
        text: `📍 CANCÚN | 7 NOITES\n💰 A partir de R$ 6.500/pessoa\n🏝️ ALL INCLUSIVE | Resorts de luxo | Caribe!\n💳 10x sem juros | Pix: 5% desconto`,
        fullText: `🏝️ CANCÚN ALL INCLUSIVE — O CARIBE QUE TODO BRASILEIRO SONHA!\n\n7 noites com tudo incluído no paraíso mexicano.\n\n✅ INCLUI:\n• Passagem aérea (ida e volta)\n• Resort All Inclusive (café, almoço, jantar, bebidas)\n• Transfer aeroporto/hotel\n\n🌊 NO RESORT:\n• Piscinas e praia privativos\n• Esportes aquáticos\n• Shows e entretenimento noturno\n• Restaurantes temáticos\n\nOPCIONAIS POPULARES:\n• Chichén Itzá (Maravilha do Mundo)\n• Cenotes naturais\n• Xcaret ou Xplor (parques temáticos)\n\n💰 A PARTIR DE R$ 6.500/PESSOA\n💳 10x sem juros | 📲 Pix: 5% desconto\n📞 [TELEFONE] | 💬 WhatsApp: [NÚMERO]\n🌐 [SITE]\n[NOME DA AGÊNCIA]`,
        isPremium: true,
        tags: ['Internacional', 'All Inclusive', 'Caribe'],
        icon: '🏝️'
    },
    {
        id: 'off-32',
        category: 'offer',
        title: '🗼 Paris (França)',
        text: `📍 PARIS | 8 NOITES\n💰 A partir de R$ 10.000/pessoa\n🗼 Torre Eiffel + Louvre + Gastronomia\n💳 10x sem juros | Pix: 5% desconto`,
        isPremium: true,
        tags: ['Internacional', 'Europa', 'Romance'],
        icon: '🗼'
    },
    {
        id: 'off-33',
        category: 'offer',
        title: '🌺 Punta Cana (Rep. Dom.)',
        text: `📍 PUNTA CANA | 7 NOITES\n💰 A partir de R$ 7.500/pessoa\n🌺 ALL INCLUSIVE 5★ | Caribe!\n💳 10x sem juros | Pix: 5% desconto`,
        isPremium: true,
        tags: ['Internacional', 'All Inclusive', 'Caribe'],
        icon: '🌺'
    },
    {
        id: 'off-34',
        category: 'offer',
        title: '⛩️ Tóquio (Japão)',
        text: `📍 TÓQUIO | 10 NOITES\n💰 A partir de R$ 12.000/pessoa\n⛩️ Tecnologia + Tradição | +24% buscas!\n💳 10x sem juros | Pix: 5% desconto`,
        isPremium: true,
        tags: ['Internacional', 'Ásia', 'Cultura'],
        icon: '⛩️'
    },
    {
        id: 'off-35',
        category: 'offer',
        title: '🛕 Tailândia',
        text: `📍 TAILÂNDIA | 10 NOITES\n💰 A partir de R$ 10.000/pessoa\n🛕 Templos + Praias | +35% buscas 2024!\n💳 10x sem juros | Pix: 5% desconto`,
        isPremium: true,
        tags: ['Internacional', 'Ásia', 'Aventura'],
        icon: '🛕'
    },
    {
        id: 'off-36',
        category: 'offer',
        title: '🏙️ Dubai (EAU)',
        text: `📍 DUBAI | 7 NOITES\n💰 A partir de R$ 11.000/pessoa\n🏙️ Burj Khalifa + Deserto + Compras!\n💳 10x sem juros | Pix: 5% desconto`,
        isPremium: true,
        tags: ['Internacional', 'Luxo', 'Tendência'],
        icon: '🏙️'
    },
    {
        id: 'off-37',
        category: 'offer',
        title: '🕌 Marrocos',
        text: `📍 MARROCOS | 9 NOITES\n💰 A partir de R$ 8.500/pessoa\n🕌 TENDÊNCIA 2026 | Cultura + Deserto!\n💳 10x sem juros | Pix: 5% desconto`,
        isPremium: true,
        tags: ['Internacional', 'Tendência', 'Exótico'],
        icon: '🕌'
    },
    {
        id: 'off-38',
        category: 'offer',
        title: '🎈 Turquia',
        text: `📍 TURQUIA | 10 NOITES\n💰 A partir de R$ 9.500/pessoa\n🎈 Balões na Capadócia + Istambul!\n💳 10x sem juros | +101% reservas 2024`,
        isPremium: true,
        tags: ['Internacional', 'Tendência', 'Cultura'],
        icon: '🎈'
    },
    {
        id: 'off-39',
        category: 'offer',
        title: '🌺 Bali (Indonésia)',
        text: `📍 BALI | 10 NOITES\n💰 A partir de R$ 9.000/pessoa\n🌺 WELLNESS 2026 | Templos + Praias + Yoga\n💳 10x sem juros | Pix: 5% desconto`,
        isPremium: true,
        tags: ['Internacional', 'Wellness', 'Tendência'],
        icon: '🌺'
    },
    {
        id: 'off-40',
        category: 'offer',
        title: '🐉 China (Pequim + Shanghai)',
        text: `📍 CHINA | 12 NOITES\n💰 A partir de R$ 11.000/pessoa\n🐉 SEM VISTO até dez/2026 | +200% buscas!\n💳 10x sem juros | Pix: 5% desconto`,
        isPremium: true,
        tags: ['Internacional', 'Tendência', 'Cultura'],
        icon: '🐉'
    },
    {
        id: 'off-41',
        category: 'offer',
        title: '🦁 África do Sul',
        text: `📍 ÁFRICA DO SUL | 10 NOITES\n💰 A partir de R$ 14.000/pessoa\n🦁 +136% reservas | Safari + Vinhos!\n💳 10x sem juros | Pix: 5% desconto`,
        isPremium: true,
        tags: ['Internacional', 'Tendência', 'Safari'],
        icon: '🦁'
    },
    {
        id: 'off-42',
        category: 'offer',
        title: '🎿 Milão + Dolomitas (Itália)',
        text: `📍 MILÃO + DOLOMITAS | 10 NOITES\n💰 A partir de R$ 13.000/pessoa\n🎿 OLIMPÍADAS INVERNO 2026!\n💳 10x sem juros | Pix: 5% desconto`,
        isPremium: true,
        tags: ['Internacional', 'Europa', 'Esporte'],
        icon: '🎿'
    },
    {
        id: 'off-43',
        category: 'offer',
        title: '🏖️ Albânia + Balcãs',
        text: `📍 ALBÂNIA + BALCÃS | 10 NOITES\n💰 A partir de R$ 8.000/pessoa\n🏖️ +163% reservas | Europa alternativa!\n💳 10x sem juros | Pix: 5% desconto`,
        isPremium: true,
        tags: ['Internacional', 'Tendência', 'Europa'],
        icon: '🏖️'
    },
    {
        id: 'off-44',
        category: 'offer',
        title: '🎵 Seul (Coreia do Sul)',
        text: `📍 SEUL | 10 NOITES\n💰 A partir de R$ 10.000/pessoa\n🎵 K-pop + Gastronomia + Cultura!\n💳 10x sem juros | Pix: 5% desconto`,
        isPremium: true,
        tags: ['Internacional', 'Ásia', 'Cultura'],
        icon: '🎵'
    },
    {
        id: 'off-45',
        category: 'offer',
        title: '🎨 Barcelona (Espanha)',
        text: `📍 BARCELONA | 8 NOITES\n💰 A partir de R$ 9.500/pessoa\n🎨 Gaudí + Mar + Gastronomia!\n💳 10x sem juros | Pix: 5% desconto`,
        isPremium: true,
        tags: ['Internacional', 'Europa', 'Cultura'],
        icon: '🎨'
    },
    {
        id: 'off-46',
        category: 'offer',
        title: '🗽 Nova York (EUA)',
        text: `📍 NOVA YORK | 6 NOITES\n💰 A partir de R$ 7.200/pessoa\n🗽 Times Square + Central Park\n💳 12x de R$ 600.00 sem juros`,
        isPremium: true,
        tags: ['Internacional', 'Compras', 'Cultura'],
        icon: '🗽'
    },
    {
        id: 'off-47',
        category: 'offer',
        title: '🍕 Roma + Costa Amalfi',
        text: `📍 ROMA + AMALFI | 9 NOITES\n💰 A partir de R$ 10.000/pessoa\n🍕 Coliseu + Pizza + Costa Amalfi!\n💳 10x sem juros | Pix: 5% desconto`,
        isPremium: true,
        tags: ['Internacional', 'Europa', 'Gastronomia'],
        icon: '🍕'
    },
    {
        id: 'off-48',
        category: 'offer',
        title: '🌿 Tulum (México)',
        text: `📍 TULUM | 7 NOITES\n💰 A partir de R$ 8.500/pessoa\n🌿 Cenotes + Bem-estar + Natureza!\n💳 10x sem juros | Pix: 5% desconto`,
        isPremium: true,
        tags: ['Internacional', 'Wellness', 'Natureza'],
        icon: '🌿'
    },
    {
        id: 'off-49',
        category: 'offer',
        title: '🏛️ Grécia (Santorini + Atenas)',
        text: `📍 GRÉCIA | 10 NOITES\n💰 A partir de R$ 12.000/pessoa\n🏛️ Santorini + Atenas + Ilhas gregas!\n💳 10x sem juros | Pix: 5% desconto`,
        isPremium: true,
        tags: ['Internacional', 'Europa', 'Romance'],
        icon: '🏛️'
    },
    {
        id: 'off-50',
        category: 'offer',
        title: '🌌 Islândia',
        text: `📍 ISLÂNDIA | 8 NOITES\n💰 A partir de R$ 15.000/pessoa\n🌌 Aurora Boreal + Geisers + Natureza!\n💳 10x sem juros | Pix: 5% desconto`,
        isPremium: true,
        tags: ['Internacional', 'Premium', 'Natureza'],
        icon: '🌌'
    },

    // =============================================
    // RANKINGS — 50 Destinos Mais Buscados
    // =============================================
    // NACIONAIS (25)
    { id: 'rank-01', category: 'ranking', title: '1° Rio de Janeiro (RJ)', text: 'Praia + Cultura + Entretenimento\n+75% reservas 2025 | Todos os perfis', isPremium: true, tags: ['Nacional'], icon: '🥇' },
    { id: 'rank-02', category: 'ranking', title: '2° São Paulo (SP)', text: 'Negócios + Cultura + Gastronomia\nLíder Decolar 2024 | Executivos e turistas', isPremium: true, tags: ['Nacional'], icon: '🥈' },
    { id: 'rank-03', category: 'ranking', title: '3° Porto de Galinhas (PE)', text: 'Praia + Piscinas Naturais\n2° CVC verão 2026 | Casais e famílias', isPremium: true, tags: ['Nacional'], icon: '🥉' },
    { id: 'rank-04', category: 'ranking', title: '4° Maceió (AL)', text: 'Praia + Resort + Família\n1° família Azul Viagens 2026 | Famílias', isPremium: true, tags: ['Nacional'], icon: '📊' },
    { id: 'rank-05', category: 'ranking', title: '5° Fortaleza (CE)', text: 'Praia + Aventura + Cultura\n3,3 mi visitantes 2025 | Jovens e famílias', isPremium: true, tags: ['Nacional'], icon: '📊' },
    { id: 'rank-06', category: 'ranking', title: '6° Gramado (RS)', text: 'Serra + Gastronomia + Romance\nTop 6 Kayak 2025 | Casais', isPremium: true, tags: ['Nacional'], icon: '📊' },
    { id: 'rank-07', category: 'ranking', title: '7° Natal (RN)', text: 'Praia + Dunas + Buggy\nTop 8 Decolar 2024 | Famílias e aventureiros', isPremium: true, tags: ['Nacional'], icon: '📊' },
    { id: 'rank-08', category: 'ranking', title: '8° Salvador (BA)', text: 'Cultura + Praia + Carnaval\nTop 10 Kayak/Decolar | Todos os perfis', isPremium: true, tags: ['Nacional'], icon: '📊' },
    { id: 'rank-09', category: 'ranking', title: '9° Florianópolis (SC)', text: '42 Praias + Natureza\n+160% estrangeiros 2024 | Jovens e famílias', isPremium: true, tags: ['Nacional'], icon: '📊' },
    { id: 'rank-10', category: 'ranking', title: '10° Balneário Camboriú (SC)', text: 'Praia + Vida Noturna\nTop verão 2026 | Jovens', isPremium: true, tags: ['Nacional'], icon: '📊' },
    { id: 'rank-11', category: 'ranking', title: '11° Recife (PE)', text: 'Cultura + Gastronomia + Praia\n+25% buscas 2024 | Todos os perfis', isPremium: true, tags: ['Nacional'], icon: '📊' },
    { id: 'rank-12', category: 'ranking', title: '12° Foz do Iguaçu (PR)', text: 'Cataratas + Aventura\n2° destino intl do Brasil 2026 | Todos os perfis', isPremium: true, tags: ['Nacional'], icon: '📊' },
    { id: 'rank-13', category: 'ranking', title: '13° João Pessoa (PB)', text: 'Praias virgens + Tranquilidade\nCrescimento Kayak 2025 | Casais e famílias', isPremium: true, tags: ['Nacional'], icon: '📊' },
    { id: 'rank-14', category: 'ranking', title: '14° Porto Seguro (BA)', text: 'Praia + Festa + Trancoso\nTop 5 Decolar | Jovens', isPremium: true, tags: ['Nacional'], icon: '📊' },
    { id: 'rank-15', category: 'ranking', title: '15° Belém (PA)', text: 'Gastronomia + Amazônia\nCOP30/Hub Amazônia 2026 | Ecoturistas', isPremium: true, tags: ['Nacional'], icon: '📊' },
    { id: 'rank-16', category: 'ranking', title: '16° São Luís (MA)', text: 'Cultura + Lençóis Maranhenses\nCrescimento Kayak 2025 | Ecoturistas', isPremium: true, tags: ['Nacional'], icon: '📊' },
    { id: 'rank-17', category: 'ranking', title: '17° Jericoacoara (CE)', text: 'Kitesurf + Lagoas\nTendência boutique | Turistas premium', isPremium: true, tags: ['Nacional'], icon: '📊' },
    { id: 'rank-18', category: 'ranking', title: '18° Campos do Jordão (SP)', text: 'Serra + Gastronomia\nTop inverno nacional | Casais', isPremium: true, tags: ['Nacional'], icon: '📊' },
    { id: 'rank-19', category: 'ranking', title: '19° Fernando de Noronha (PE)', text: 'Ecoturismo Premium\nTop mergulho do Brasil | Perfil premium', isPremium: true, tags: ['Nacional'], icon: '📊' },
    { id: 'rank-20', category: 'ranking', title: '20° Lençóis Maranhenses (MA)', text: 'Natureza única no mundo\nTop ecoturismo 2026 | Ecoturistas', isPremium: true, tags: ['Nacional'], icon: '📊' },
    { id: 'rank-21', category: 'ranking', title: '21° Caldas Novas (GO)', text: 'Termas + Família\nTop 15 Decolar | Famílias', isPremium: true, tags: ['Nacional'], icon: '📊' },
    { id: 'rank-22', category: 'ranking', title: '22° Maragogi (AL)', text: 'Piscinas naturais + Praia\nTop 11 Decolar 2024 | Casais e famílias', isPremium: true, tags: ['Nacional'], icon: '📊' },
    { id: 'rank-23', category: 'ranking', title: '23° Curitiba (PR)', text: 'Cultura + Parques + Gastronomia\nCrescimento turismo receptivo | Todos os perfis', isPremium: true, tags: ['Nacional'], icon: '📊' },
    { id: 'rank-24', category: 'ranking', title: '24° Manaus (AM)', text: 'Ecoturismo + Amazônia\nHub Amazônia 2026 | Ecoturistas', isPremium: true, tags: ['Nacional'], icon: '📊' },
    { id: 'rank-25', category: 'ranking', title: '25° Búzios (RJ)', text: 'Luxo + Praia + Sofisticação\nBooking tendência 2026 | Perfil premium', isPremium: true, tags: ['Nacional'], icon: '📊' },

    // INTERNACIONAIS (25)
    { id: 'rank-26', category: 'ranking', title: '1° Lisboa (Portugal)', text: 'Cultura + História + Gastronomia\nLíder Kayak intl 2025 | Sem visto', isPremium: true, tags: ['Internacional'], icon: '🥇' },
    { id: 'rank-27', category: 'ranking', title: '2° Buenos Aires (Argentina)', text: 'Cultura + Tango + Gastronomia\nLíder Decolar intl 2024 | Sem visto', isPremium: true, tags: ['Internacional'], icon: '🥈' },
    { id: 'rank-28', category: 'ranking', title: '3° Orlando (EUA)', text: 'Parques + Família\nTop 3 Kayak 2025 | Famílias com crianças', isPremium: true, tags: ['Internacional'], icon: '🥉' },
    { id: 'rank-29', category: 'ranking', title: '4° Miami (EUA)', text: 'Praia + Compras + Vida noturna\nTop 4 Kayak 2025 | Jovens e casais', isPremium: true, tags: ['Internacional'], icon: '📊' },
    { id: 'rank-30', category: 'ranking', title: '5° Santiago (Chile)', text: 'Gastronomia + Natureza\n+54% buscas 2024 | Todos os perfis', isPremium: true, tags: ['Internacional'], icon: '📊' },
    { id: 'rank-31', category: 'ranking', title: '6° Cancún (México)', text: 'All Inclusive + Caribe\n13% buscas férias 2024 | Famílias e casais', isPremium: true, tags: ['Internacional'], icon: '📊' },
    { id: 'rank-32', category: 'ranking', title: '7° Bariloche (Argentina)', text: 'Neve + Lagos + Chocolate\n+42% buscas 2024 | Casais e famílias', isPremium: true, tags: ['Internacional'], icon: '📊' },
    { id: 'rank-33', category: 'ranking', title: '8° Paris (França)', text: 'Cultura + Romance + Arte\nClássico europeu | Casais', isPremium: true, tags: ['Internacional'], icon: '📊' },
    { id: 'rank-34', category: 'ranking', title: '9° Roma / Itália', text: 'História + Gastronomia\nTop 10 europeu | Todos os perfis', isPremium: true, tags: ['Internacional'], icon: '📊' },
    { id: 'rank-35', category: 'ranking', title: '10° Tóquio (Japão)', text: 'Cultura + Tecnologia\n+24% buscas 2024 | Jovens e entusiastas', isPremium: true, tags: ['Internacional'], icon: '📊' },
    { id: 'rank-36', category: 'ranking', title: '11° Bangkok (Tailândia)', text: 'Cultura + Gastronomia + Praias\n+35% buscas 2024 | Aventureiros', isPremium: true, tags: ['Internacional'], icon: '📊' },
    { id: 'rank-37', category: 'ranking', title: '12° Punta Cana (Rep. Dom.)', text: 'All Inclusive 5★\nTop Caribe brasileiro | Casais e famílias', isPremium: true, tags: ['Internacional'], icon: '📊' },
    { id: 'rank-38', category: 'ranking', title: '13° Nova York (EUA)', text: 'Cultura + Compras + Icônico\nClássico americano | Todos os perfis', isPremium: true, tags: ['Internacional'], icon: '📊' },
    { id: 'rank-39', category: 'ranking', title: '14° Dubai (EAU)', text: 'Luxo + Tecnologia + Deserto\nTendência luxo 2026 | Perfil premium', isPremium: true, tags: ['Internacional'], icon: '📊' },
    { id: 'rank-40', category: 'ranking', title: '15° Marrocos', text: 'Cultural + Exótico\n+34% turistas 2024 | Aventureiros culturais', isPremium: true, tags: ['Internacional'], icon: '📊' },
    { id: 'rank-41', category: 'ranking', title: '16° Turquia', text: 'Cultura + Balões\n+101% reservas 2024 | Todos os perfis', isPremium: true, tags: ['Internacional'], icon: '📊' },
    { id: 'rank-42', category: 'ranking', title: '🔥 China', text: '+200% buscas 2025\nSEM VISTO até dez/2026 para brasileiros', isPremium: true, tags: ['Tendência 2026'], icon: '🔥' },
    { id: 'rank-43', category: 'ranking', title: '🔥 Marrocos', text: '+34% turistas 2024\nDestino cultural exótico em alta', isPremium: true, tags: ['Tendência 2026'], icon: '🔥' },
    { id: 'rank-44', category: 'ranking', title: '🔥 Turquia (Capadócia)', text: '+101% reservas 2024\nCapadócia viral, hub entre 2 continentes', isPremium: true, tags: ['Tendência 2026'], icon: '🔥' },
    { id: 'rank-45', category: 'ranking', title: '🔥 África do Sul', text: '+136% reservas 2024\nSafari + vinhos + natureza', isPremium: true, tags: ['Tendência 2026'], icon: '🔥' },
    { id: 'rank-46', category: 'ranking', title: '🔥 Albânia / Balcãs', text: '+163% reservas 2024\nEuropa alternativa com preços acessíveis', isPremium: true, tags: ['Tendência 2026'], icon: '🔥' },
    { id: 'rank-47', category: 'ranking', title: '🔥 Bali (Indonésia)', text: 'Top Wellness 2026\nViagens de propósito/wellness é tendência #1', isPremium: true, tags: ['Tendência 2026'], icon: '🔥' },
    { id: 'rank-48', category: 'ranking', title: '🔥 Jericoacoara (CE)', text: 'Tendência boutique 2026\nExclusividade + natureza intocada', isPremium: true, tags: ['Tendência 2026'], icon: '🔥' },
    { id: 'rank-49', category: 'ranking', title: '🔥 Milão / Dolomitas', text: 'Olimpíadas Inverno 2026\nEvento único para turismo na Itália', isPremium: true, tags: ['Tendência 2026'], icon: '🔥' },
    { id: 'rank-50', category: 'ranking', title: '🔥 Seul (Coreia do Sul)', text: 'Top asiático Kayak 2025\nK-pop + cultura hallyu atrai jovens', isPremium: true, tags: ['Tendência 2026'], icon: '🔥' },

    // =============================================
    // SCRIPTS DE VENDAS E CONDIÇÕES
    // =============================================
    {
        id: 'script-01',
        category: 'script',
        title: '💳 Condições de Pagamento — Padrão',
        text: `Texto padrão para incluir no final de todas as ofertas com formas de pagamento e políticas.`,
        fullText: `CONDIÇÕES E FORMAS DE PAGAMENTO\n\n💳 CARTÃO DE CRÉDITO: até 10x sem juros\n📲 PIX: 5% de desconto (pagamento à vista)\n🏦 TRANSFERÊNCIA BANCÁRIA: consulte condições\n\nO QUE ESTÁ INCLUÍDO (salvo indicação contrária):\n✅ Passagem aérea (ida e volta) — classe econômica\n✅ Hospedagem conforme descrito (hotel/pousada/resort)\n✅ Café da manhã diário\n✅ Transfer aeroporto / hotel / aeroporto\n✅ Taxas de reserva e impostos\n\nO QUE NÃO ESTÁ INCLUÍDO:\n❌ Despesas pessoais e gorjetas\n❌ Alimentação além do café da manhã\n❌ Passeios opcionais (consulte valores)\n❌ Seguro viagem (RECOMENDAMOS — consulte)\n❌ Taxas de bagagem despachada\n\nRESERVA E CANCELAMENTO:\n📌 Confirmação: 30% a 50% de entrada\n📌 Saldo: até 15 dias antes da viagem\n📌 Cancelamento: sujeito à política de cada operadora\n📌 Documentação: verificar com antecedência\n\n[NOME DA AGÊNCIA] | CADASTUR: [NÚMERO]\n[TELEFONE] | [EMAIL] | [SITE]`,
        isPremium: true,
        tags: ['Pagamento', 'Condições'],
        icon: '💳'
    },
    {
        id: 'script-02',
        category: 'script',
        title: '📱 Condições Versão Curta — Stories',
        text: `Versão resumida de condições para stories e cards rápidos.`,
        fullText: `💳 FORMAS DE PAGAMENTO:\n• Pix: 5% de desconto\n• Cartão: até 10x sem juros\n\nInclui: aéreo + hotel + café da manhã + transfer\n\nVagas limitadas | Preços sujeitos à disponibilidade\n\n📞 [TELEFONE] | 💬 WhatsApp: [NÚMERO]`,
        isPremium: true,
        tags: ['Pagamento', 'Stories'],
        icon: '📱'
    },
    {
        id: 'script-03',
        category: 'script',
        title: '📋 Rodapé Padrão — WhatsApp e Feed',
        text: `Rodapé padrão com contato e CADASTUR para usar em todos os posts.`,
        fullText: `📞 [TELEFONE] | 💬 WhatsApp: [NÚMERO]\n🌐 [SITE] | 📧 [EMAIL]\n📍 [ENDEREÇO COMPLETO]\n\n[NOME DA AGÊNCIA] — Sua viagem, nossa especialidade.\nCADASTUR: [NÚMERO] | MTUR: [NÚMERO]`,
        isPremium: true,
        tags: ['Rodapé', 'Contato'],
        icon: '📋'
    },
    {
        id: 'script-04',
        category: 'script',
        title: '🔥 Rodapé de Urgência — Promoções',
        text: `Rodapé para promoções por tempo limitado com gatilho de urgência.`,
        fullText: `OFERTA POR TEMPO LIMITADO!\n\nVálido até: [DATA] ou enquanto durarem as vagas\nSaídas confirmadas: [DATAS]\n\n🔥 Não perca! Reserve agora mesmo.\n📞 [TELEFONE] | 💬 WhatsApp: [NÚMERO]\n[NOME DA AGÊNCIA]`,
        isPremium: true,
        tags: ['Urgência', 'Promoção'],
        icon: '🔥'
    },
    {
        id: 'script-05',
        category: 'script',
        title: '✅ Rodapé com Garantias',
        text: `Rodapé que transmite confiança com anos de mercado e CADASTUR.`,
        fullText: `✅ [X] anos no mercado\n✅ CADASTUR regularizado\n✅ Parceiros: [COMPANHIAS AÉREAS]\n✅ Atendimento 7 dias por semana\n✅ Melhor preço garantido\n✅ Seguro viagem disponível\n\n📞 [TELEFONE] | [NOME DA AGÊNCIA]`,
        isPremium: true,
        tags: ['Confiança', 'Garantia'],
        icon: '✅'
    },
    {
        id: 'script-06',
        category: 'script',
        title: '💼 Rodapé Corporativo',
        text: `Rodapé para viagens corporativas com emissão de NF e relatórios.`,
        fullText: `🏢 VIAGENS CORPORATIVAS:\n\n• Emissão de notas fiscais\n• Relatórios de despesas\n• Programa de fidelidade\n• Atendimento 24h\n\n📞 [TELEFONE] | 📧 [EMAIL CORPORATIVO]\n[NOME DA AGÊNCIA] | CNPJ: [NÚMERO]`,
        isPremium: true,
        tags: ['Corporativo', 'B2B'],
        icon: '💼'
    },
    {
        id: 'script-07',
        category: 'script',
        title: '💍 Rodapé Lua de Mel',
        text: `Rodapé especial para pacotes românticos com surpresas no hotel.`,
        fullText: `💍 ESPECIALISTAS EM LUA DE MEL!\n\n✨ Surpresas especiais no hotel (consulte)\n🥂 Transfer diferenciado disponível\n💌 Atendimento personalizado\n💑 Já atendemos mais de [X] casais!\n\n📞 [TELEFONE] | 💬 WhatsApp: [NÚMERO]\n[NOME DA AGÊNCIA]`,
        isPremium: true,
        tags: ['Lua de Mel', 'Romance'],
        icon: '💍'
    },
    {
        id: 'script-08',
        category: 'script',
        title: '👨‍👩‍👧‍👦 Rodapé Família',
        text: `Rodapé para pacotes familiares com dicas e quartos especiais.`,
        fullText: `👨‍👩‍👧‍👦 ESPECIALISTAS EM VIAGENS EM FAMÍLIA!\n\n🎒 Dicas de o que levar para crianças\n🏨 Quartos familiares e suítes disponíveis\n🎡 Ingressos para parques (sob consulta)\n🛡️ Seguro viagem família disponível\n\n📞 [TELEFONE] | 💬 WhatsApp: [NÚMERO]\n[NOME DA AGÊNCIA]`,
        isPremium: true,
        tags: ['Família', 'Crianças'],
        icon: '👨‍👩‍👧‍👦'
    },
    {
        id: 'script-09',
        category: 'script',
        title: '📦 Pacote Básico (Aéreo + Hotel)',
        text: `Template de "O que inclui" para pacotes básicos de aéreo + hotel.`,
        fullText: `✅ O QUE ESTÁ INCLUÍDO:\n• Passagem aérea (ida e volta) — classe econômica\n• Hotel conforme categoria selecionada\n• Café da manhã diário\n• Transfer: aeroporto → hotel → aeroporto\n\n❌ NÃO ESTÁ INCLUÍDO:\n• Alimentação adicional\n• Passeios e ingressos\n• Seguro viagem`,
        isPremium: true,
        tags: ['Pacote', 'Template'],
        icon: '📦'
    },
    {
        id: 'script-10',
        category: 'script',
        title: '📦 Pacote All Inclusive (Resort)',
        text: `Template de "O que inclui" para pacotes All Inclusive em resorts.`,
        fullText: `✅ O QUE ESTÁ INCLUÍDO:\n• Passagem aérea (ida e volta)\n• Refeições + bebidas\n• Transfer aeroporto/resort\n• Uso de piscinas, praia e academia\n• Shows e entretenimento noturno\n\n❌ NÃO ESTÁ INCLUÍDO:\n• Passeios externos ao resort\n• Serviços de spa (salvo indicação)\n• Seguro viagem`,
        isPremium: true,
        tags: ['Pacote', 'All Inclusive'],
        icon: '📦'
    },
    {
        id: 'script-11',
        category: 'script',
        title: '📦 Pacote Completo (City Tour)',
        text: `Template de "O que inclui" para pacotes completos com passeios.`,
        fullText: `✅ O QUE ESTÁ INCLUÍDO:\n• Passagem aérea (ida e volta)\n• Hotel com café da manhã\n• Transfer aeroporto/hotel\n• City tour com guia local (1 dia)\n• Passeios conforme roteiro\n• Ingressos dos principais atrativos\n\n❌ NÃO ESTÁ INCLUÍDO:\n• Refeições além do café da manhã\n• Compras e despesas pessoais\n• Seguro viagem`,
        isPremium: true,
        tags: ['Pacote', 'City Tour'],
        icon: '📦'
    },
    {
        id: 'script-12',
        category: 'script',
        title: '🚢 Pacote Cruzeiro',
        text: `Template de "O que inclui" para pacotes de cruzeiro marítimo.`,
        fullText: `✅ O QUE ESTÁ INCLUÍDO:\n• Passagem aérea até o porto de embarque\n• Cabine conforme categoria\n• Todas as refeições a bordo\n• Entretenimento e shows\n• Porto de embarque e desembarque\n\n❌ NÃO ESTÁ INCLUÍDO:\n• Bebidas alcoólicas premium\n• Excursões nos portos (opcionais)\n• Gorjetas automáticas (ship gratuity)\n• Seguro viagem`,
        isPremium: true,
        tags: ['Pacote', 'Cruzeiro'],
        icon: '🚢'
    },
    {
        id: 'script-13',
        category: 'script',
        title: '🧘 Pacote Wellness / Retiro',
        text: `Template de "O que inclui" para pacotes de bem-estar e retiros.`,
        fullText: `✅ O QUE ESTÁ INCLUÍDO:\n• Passagem aérea (ida e volta)\n• Eco-resort ou pousada de luxo\n• Café da manhã e jantar (detox/orgânico)\n• Sessões de yoga e meditação\n• Transfer aeroporto/hotel\n\n❌ NÃO ESTÁ INCLUÍDO:\n• Tratamentos individuais de spa`,
        isPremium: true,
        tags: ['Pacote', 'Wellness'],
        icon: '🧘'
    },
    {
        id: 'script-14',
        category: 'script',
        title: '📄 Documentação — Destinos Nacionais',
        text: `Guia de documentação necessária para destinos nacionais.`,
        fullText: `DOCUMENTAÇÃO NECESSÁRIA — DESTINOS NACIONAIS:\n\n• RG ou CNH válidos (menores: certidão de nascimento)\n• Menores desacompanhados: autorização notarial\n\nDICA: Consulte nossa equipe sobre os documentos específicos antes de fechar o pacote. Evite surpresas na viagem!\n\n📞 [TELEFONE] | [NOME DA AGÊNCIA]`,
        isPremium: true,
        tags: ['Documentação', 'Nacional'],
        icon: '📄'
    },
    {
        id: 'script-15',
        category: 'script',
        title: '📄 Documentação — Destinos Internacionais',
        text: `Guia de documentação para viagens internacionais e vistos.`,
        fullText: `DOCUMENTAÇÃO — DESTINOS INTERNACIONAIS:\n\nSEM VISTO (Mercosul):\n• Passaporte válido OU RG com chip\n• Argentina, Chile, Uruguai, Paraguai, Bolívia\n\nEXIGEM PASSAPORTE:\n• EUA, Europa, Ásia, África, Caribe\n• Passaporte com validade mínima de 6 meses\n\nEXIGEM VISTO:\n• EUA: ESTA (visto eletrônico)\n• Austrália: ETA (eletrônico)\n• Índia: e-Visa\n• China: SEM VISTO até dez/2026!\n\nDICA: Consulte nossa equipe!\n📞 [TELEFONE] | [NOME DA AGÊNCIA]`,
        isPremium: true,
        tags: ['Documentação', 'Internacional'],
        icon: '📄'
    },

    // =============================================
    // FRASES DE IMPACTO / CTAs
    // =============================================
    // PRAIA E NORDESTE
    { id: 'cta-01', category: 'cta', title: '🌊 Nordeste — Sol e Areia', text: 'O Nordeste te chama! Sol, areia e mar cristalino te esperam. Reserve sua escapada agora!', isPremium: true, tags: ['Nordeste', 'Praia'], icon: '🌊' },
    { id: 'cta-02', category: 'cta', title: '🌊 Férias no Nordeste', text: '🌊 Férias no melhor destino do Brasil com parcelas que cabem no bolso. 10x sem juros!', isPremium: true, tags: ['Nordeste', 'Praia'], icon: '🌊' },
    { id: 'cta-03', category: 'cta', title: '🐠 Piscinas Naturais', text: '🐠 Piscinas naturais + sol + praia = férias perfeitas! Faça suas malas — cuidamos do resto!', isPremium: true, tags: ['Nordeste', 'Praia'], icon: '🐠' },
    { id: 'cta-04', category: 'cta', title: '🦀 Nordeste Completo', text: '🦀 Acarajé, sapatilha e água quentinha. O Nordeste completo do jeito que você merece!', isPremium: true, tags: ['Nordeste', 'Gastronomia'], icon: '🦀' },
    { id: 'cta-05', category: 'cta', title: '☀️ Bronze no Nordeste', text: 'Aquele bronze que você queria está esperando por você. Vem pro Nordeste!', isPremium: true, tags: ['Nordeste', 'Praia'], icon: '☀️' },
    { id: 'cta-06', category: 'cta', title: '🌅 Sol e Tranquilidade', text: '🌅 Sol, areia e tranquilidade. O destino que vai renovar sua energia. Reserve agora!', isPremium: true, tags: ['Nordeste', 'Relaxamento'], icon: '🌅' },

    // INTERNACIONAIS
    { id: 'cta-07', category: 'cta', title: '🌎 O Mundo Te Aguarda', text: '🌎 O mundo inteiro te aguarda. Passagens, hotel e passeios em um único pacote!', isPremium: true, tags: ['Internacional'], icon: '🌎' },
    { id: 'cta-08', category: 'cta', title: '🗼 Europa Acessível', text: '🗼 Realizar o sonho de conhecer a Europa nunca foi tão acessível. Parcele em 10x!', isPremium: true, tags: ['Internacional', 'Europa'], icon: '🗼' },
    { id: 'cta-09', category: 'cta', title: '🌍 Sonho Realizado', text: '🌍 Você sonhou, nós realizamos. Destinos nacionais e internacionais com melhor custo-benefício.', isPremium: true, tags: ['Internacional'], icon: '🌍' },
    { id: 'cta-10', category: 'cta', title: '🏰 Da Torre Eiffel às Cataratas', text: '🏰 Da Torre Eiffel às Cataratas — tornamos seu sonho realidade!', isPremium: true, tags: ['Internacional'], icon: '🏰' },
    { id: 'cta-11', category: 'cta', title: '✈️ Viagem Adiada', text: 'Aquela viagem que você adiou por anos pode acontecer AGORA. Fale com a gente!', isPremium: true, tags: ['Internacional', 'Urgência'], icon: '✈️' },
    { id: 'cta-12', category: 'cta', title: '🌐 Sem Fronteiras', text: '🌐 Fronteiras não são limite para quem sonha. Voe mais alto com a [NOME DA AGÊNCIA]!', isPremium: true, tags: ['Internacional'], icon: '🌐' },

    // FAMÍLIA
    { id: 'cta-13', category: 'cta', title: '👨‍👩‍👧‍👦 Viagem em Família', text: 'Os melhores momentos da vida começam com uma boa viagem em família!', isPremium: true, tags: ['Família'], icon: '👨‍👩‍👧‍👦' },
    { id: 'cta-14', category: 'cta', title: '🏖️ All Inclusive Família', text: 'Crianças felizes, pais realizados. Pacotes all inclusive para toda a família!', isPremium: true, tags: ['Família', 'All Inclusive'], icon: '🏖️' },
    { id: 'cta-15', category: 'cta', title: '📸 Memórias em Família', text: 'A melhor lembrança de infância é uma viagem em família. Faça isso agora!', isPremium: true, tags: ['Família'], icon: '📸' },
    { id: 'cta-16', category: 'cta', title: '❤️ Momentos Perfeitos', text: 'Não espere o momento perfeito — crie memórias com quem você mais ama!', isPremium: true, tags: ['Família'], icon: '❤️' },

    // CASAL / LUA DE MEL
    { id: 'cta-17', category: 'cta', title: '💕 Amor Se Celebra Viajando', text: 'Amor se celebra viajando juntos. Pacotes românticos com condições especiais!', isPremium: true, tags: ['Casal', 'Romance'], icon: '💕' },
    { id: 'cta-18', category: 'cta', title: '💍 Lua de Mel dos Sonhos', text: 'Lua de mel dos sonhos? Aqui você encontra as melhores opções com o melhor preço!', isPremium: true, tags: ['Casal', 'Lua de Mel'], icon: '💍' },
    { id: 'cta-19', category: 'cta', title: '💑 Nova Aventura a Dois', text: 'Uma nova aventura a dois. Escolha o destino, nós cuidamos de tudo!', isPremium: true, tags: ['Casal', 'Romance'], icon: '💑' },
    { id: 'cta-20', category: 'cta', title: '🎁 Presente de Viagem', text: 'Presenteie quem você ama com uma viagem inesquecível. Consulte nossos pacotes!', isPremium: true, tags: ['Casal', 'Presente'], icon: '🎁' },

    // URGÊNCIA
    { id: 'cta-21', category: 'cta', title: '⚡ Oferta Relâmpago', text: 'OFERTA RELÂMPAGO! Só até [DATA] — Reserve agora!', isPremium: true, tags: ['Urgência', 'Promoção'], icon: '⚡' },
    { id: 'cta-22', category: 'cta', title: '🔥 Vagas Limitadas', text: 'Vagas LIMITADAS para esta saída. Garanta já o seu lugar!', isPremium: true, tags: ['Urgência'], icon: '🔥' },
    { id: 'cta-23', category: 'cta', title: '💰 Pix com Desconto', text: 'Economize na viagem dos seus sonhos. Pix com 5% de desconto!', isPremium: true, tags: ['Urgência', 'Pagamento'], icon: '💰' },
    { id: 'cta-24', category: 'cta', title: '🎯 Melhor Preço', text: '🎯 Encontramos o melhor preço para você. Consulte agora!', isPremium: true, tags: ['Urgência'], icon: '🎯' },
    { id: 'cta-25', category: 'cta', title: '⏰ Últimas Vagas', text: '⏰ Últimas [X] vagas com este valor! Depois sobe. Corre!', isPremium: true, tags: ['Urgência'], icon: '⏰' },
    { id: 'cta-26', category: 'cta', title: '🚀 Não Deixe pra Amanhã', text: '🚀 Não deixe para amanhã a viagem que pode acontecer hoje!', isPremium: true, tags: ['Urgência'], icon: '🚀' },

    // ECOTURISMO
    { id: 'cta-27', category: 'cta', title: '🌿 Natureza te Chama', text: '🌿 A natureza está te chamando. Responda com uma viagem incrível!', isPremium: true, tags: ['Ecoturismo', 'Natureza'], icon: '🌿' },
    { id: 'cta-28', category: 'cta', title: '🤿 Mergulhe em Cristalinas', text: '🤿 Mergulhe em águas cristalinas e descubra um mundo diferente!', isPremium: true, tags: ['Ecoturismo', 'Aventura'], icon: '🤿' },
    { id: 'cta-29', category: 'cta', title: '🏔️ Montanhas te Esperam', text: 'As montanhas te esperam. Vem com a gente explorar o Brasil que poucos conhecem!', isPremium: true, tags: ['Ecoturismo', 'Aventura'], icon: '🏔️' },
    { id: 'cta-30', category: 'cta', title: '🐬 Golfinhos no Mar', text: '🐬 Ver golfinhos no mar aberto é uma experiência de vida. Reserve sua viagem!', isPremium: true, tags: ['Ecoturismo', 'Natureza'], icon: '🐬' },

    // CORPORATIVO
    { id: 'cta-31', category: 'cta', title: '💼 Viagens Corporativas', text: '💼 Sua empresa merece o melhor em viagens corporativas. Consulte nossos planos!', isPremium: true, tags: ['Corporativo', 'B2B'], icon: '💼' },
    { id: 'cta-32', category: 'cta', title: '🤝 Reuniões e Eventos', text: '🤝 Reuniões, eventos e incentivos. Cuidamos de tudo com profissionalismo!', isPremium: true, tags: ['Corporativo', 'Eventos'], icon: '🤝' },
    { id: 'cta-33', category: 'cta', title: '📊 Reduza Custos', text: '📊 Reduza custos e aumente a satisfação da equipe com nossa gestão de viagens.', isPremium: true, tags: ['Corporativo'], icon: '📊' },
    { id: 'cta-34', category: 'cta', title: '🏆 Viagens de Incentivo', text: '🏆 Viagens de incentivo que motivam equipes. Fale com nosso setor corporativo!', isPremium: true, tags: ['Corporativo', 'Incentivo'], icon: '🏆' },

    // INTERCÂMBIO
    { id: 'cta-35', category: 'cta', title: '🎓 Inglês no Exterior', text: 'Aprender inglês no exterior mudará sua vida. Pesquise nossos pacotes de intercâmbio!', isPremium: true, tags: ['Intercâmbio', 'Estudos'], icon: '🎓' },
    { id: 'cta-36', category: 'cta', title: '📚 Estudar Fora', text: 'Estudar fora é investimento, não gasto. Fale com a gente sobre intercâmbio!', isPremium: true, tags: ['Intercâmbio', 'Estudos'], icon: '📚' },
    { id: 'cta-37', category: 'cta', title: '🌍 Educação + Viagem', text: 'Educação + viagem = experiência que ninguém tira de você!', isPremium: true, tags: ['Intercâmbio'], icon: '🌍' },
    { id: 'cta-38', category: 'cta', title: '🗣️ Fluência Real', text: 'Fluência real vem com imersão. Conheça nossos programas internacionais!', isPremium: true, tags: ['Intercâmbio'], icon: '🗣️' },

    // LEGENDAS COMPLETAS
    {
        id: 'cta-39',
        category: 'cta',
        title: '📝 Legenda Nordeste — Instagram',
        text: `Legenda completa para posts sobre destinos do Nordeste com tom descontraído.`,
        fullText: `Sonhando em acordar com o som do mar? 🌊☀️\n\nNão precisa mais só sonhar — com a [NOME DA AGÊNCIA] você vai lá de verdade!\n\n📍 [DESTINO] | [X] NOITES\n✅ Aéreo + Hotel + Café da manhã incluso\n💰 A partir de R$ [VALOR]\n💳 10x sem juros ou Pix com 5% desconto\n\n👇 Quer saber mais? Manda um "QUERO" nos comentários ou fale direto no WhatsApp!\n\n📞 [NÚMERO]\n[NOME DA AGÊNCIA] — Especialistas em fazer suas férias acontecerem!\n\n#viagem #nordeste #ferias #viajante #agenciadeviagens`,
        isPremium: true,
        tags: ['Legenda', 'Nordeste'],
        icon: '📝'
    },
    {
        id: 'cta-40',
        category: 'cta',
        title: '📝 Legenda Internacional — Instagram',
        text: `Legenda aspiracional para destinos internacionais com CTA para DM.`,
        fullText: `Você se imagina aqui? 🌍✨\n\n[DESCRIÇÃO CURTA DO DESTINO]\n\nCom a [NOME DA AGÊNCIA], esse sonho está mais perto do que você imagina! 🎯\n\n📍 [DESTINO] | ✈️ [X] noites\nAéreo + Hotel + Café da manhã\n💰 A partir de R$ [VALOR]/pessoa\n💳 10x sem juros no cartão\n📲 Pix com 5% de desconto\n\nQuer planejar? DM, WhatsApp ou acesse nosso link na bio!\n📞 [NÚMERO] | 🌐 [SITE]\n[NOME DA AGÊNCIA]\n\n#viageminternacional #sonho #ferias #agenciadeviagens`,
        isPremium: true,
        tags: ['Legenda', 'Internacional'],
        icon: '📝'
    },
    {
        id: 'cta-41',
        category: 'cta',
        title: '🚨 Legenda Promoção Relâmpago',
        text: `Legenda com urgência extrema para promoções com poucas vagas.`,
        fullText: `🚨 OFERTA RELÂMPAGO — CORRE!!! 🚨\n\nSó temos [X] vagas com este valor e elas vão acabar HOJE! ⏰\n\n📍 [DESTINO] — [X] NOITES\n💰 R$ [VALOR]/pessoa (antes: R$ [VALOR ANTIGO])\nAéreo + Hotel + Café da manhã\n💳 10x SEM JUROS ou Pix com 5% desconto\n\n👇 Manda "QUERO" ou chama no WhatsApp AGORA:\n📞 [NÚMERO]\n\nPreço válido somente até hoje, [DATA]\n[NOME DA AGÊNCIA] — Oportunidades reais, viagens reais.\n\n#promocao #oferta #viagem #agenciadeviagens`,
        isPremium: true,
        tags: ['Legenda', 'Promoção'],
        icon: '🚨'
    },
    {
        id: 'cta-42',
        category: 'cta',
        title: '💑 Legenda Lua de Mel / Casal',
        text: `Legenda romântica para pacotes de lua de mel com opções de destinos.`,
        fullText: `💍 Porque o início de uma nova vida merece ser celebrado com muita viagem e amor! 💕\n\nPara os noivos que estão planejando a lua de mel dos sonhos, a [NOME DA AGÊNCIA] tem opções incríveis!\n\nDestaques para casais:\n📍 [DESTINO 1] — Europa Clássica\n📍 [DESTINO 2] — Caribe All Inclusive\n📍 [DESTINO 3] — Nordeste Romântico\n\n✅ Transfer especial\n✅ Surpresa no hotel (consulte)\n✅ Atendimento personalizado\n\n💬 DM ou WhatsApp: [NÚMERO]\n🌐 [SITE]\n[NOME DA AGÊNCIA] — Sua lua de mel, nossa missão! 💕\n\n#luademel #casamento #viagem #casais #agenciadeviagens`,
        isPremium: true,
        tags: ['Legenda', 'Lua de Mel'],
        icon: '💑'
    },

    // HASHTAGS
    {
        id: 'cta-43',
        category: 'cta',
        title: '#️⃣ Hashtags — Nacionais',
        text: `Pack de hashtags para destinos nacionais brasileiros.`,
        fullText: `#viagem #brasil #viajandobrasil #turismo #agenciadeviagens #ferias #viajante #viagensdobrasil #pacotedeviagem #destinosbrasil #feriasnobrasileiro #viajacomigo #travelblogger #viajemais`,
        isPremium: true,
        tags: ['Hashtags', 'Nacional'],
        icon: '#️⃣'
    },
    {
        id: 'cta-44',
        category: 'cta',
        title: '#️⃣ Hashtags — Nordeste',
        text: `Pack de hashtags para destinos do Nordeste e praias.`,
        fullText: `#nordeste #praias #verão #marcrystal #piscinasnaturai #sol #nordestino #destinonordeste #marcelestial #agenteviaje #veraonordeste #nordestemaravilhoso`,
        isPremium: true,
        tags: ['Hashtags', 'Nordeste'],
        icon: '#️⃣'
    },
    {
        id: 'cta-45',
        category: 'cta',
        title: '#️⃣ Hashtags — Internacional',
        text: `Pack de hashtags para destinos internacionais.`,
        fullText: `#viajeminternacional #europa #eua #cancun #cancunmexico #allinclusiveholiday #travelgram #wanderlust #travellovers #travelphotography #worldtravel #turismointernacional`,
        isPremium: true,
        tags: ['Hashtags', 'Internacional'],
        icon: '#️⃣'
    },
    {
        id: 'cta-46',
        category: 'cta',
        title: '#️⃣ Hashtags — Casais',
        text: `Pack de hashtags para viagens românticas e lua de mel.`,
        fullText: `#luademel #casamento #noivos #viagemdecasamento #casais #honeymoon #love #viagensromanticas #momentos #romantismo #viajandojuntos`,
        isPremium: true,
        tags: ['Hashtags', 'Casal'],
        icon: '#️⃣'
    },
    {
        id: 'cta-47',
        category: 'cta',
        title: '#️⃣ Hashtags — Família',
        text: `Pack de hashtags para viagens em família.`,
        fullText: `#viagememfamilia #familia #crianças #feriasnafamilia #turismofamiliar #viagensinfantis #allinclusivefamily #parquestematicos #disney #orlando`,
        isPremium: true,
        tags: ['Hashtags', 'Família'],
        icon: '#️⃣'
    },
    {
        id: 'cta-48',
        category: 'cta',
        title: '#️⃣ Hashtags — Ecoturismo',
        text: `Pack de hashtags para ecoturismo e aventura.`,
        fullText: `#ecoturismo #natureza #aventura #trilha #ecologia #sustentabilidade #viajandopelonordeste #lencoismaranhenses #noronha #bonito #pantanal #amazonia`,
        isPremium: true,
        tags: ['Hashtags', 'Ecoturismo'],
        icon: '#️⃣'
    },
];
