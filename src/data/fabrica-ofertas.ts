import type { Niche } from "@/hooks/useFabricaContext";

export interface OfertaTemplate {
  title: string;
  text: string;
}

const OFERTAS: Record<string, OfertaTemplate[]> = {
  nordeste: [
    {
      title: "Pacote Maceió 5 Dias com Tudo Incluído",
      text: "✈️ Aéreo + Hotel 4★ + Café da manhã + Transfer\n📅 Saídas semanais\n💸 6x sem juros no cartão\n🔥 R$ 1.997 por pessoa (era R$ 2.580)\n📲 Chame no WhatsApp e garanta sua vaga.",
    },
    {
      title: "Porto de Galinhas Família",
      text: "🐠 Pacote 4 dias / 3 noites\n🏨 Resort all-inclusive\n👨‍👩‍👧 Crianças até 6 anos GRÁTIS\n💸 De R$ 3.200 por R$ 2.490\n⏰ Apenas 8 vagas disponíveis.",
    },
    {
      title: "Natal Romântico - Lua de Mel",
      text: "💕 5 noites no Pipa Privilege\n🍾 Jantar especial + Spa para o casal\n🚐 Passeios incluídos\n💸 R$ 4.890 o casal\n📲 Reserva com 10% de entrada.",
    },
    {
      title: "Fortaleza 5 Noites - Promoção",
      text: "🌊 Hotel beira-mar + Café da manhã\n✈️ Aéreo incluso\n🚐 Transfer in/out + Passeio de Buggy\n💸 De R$ 2.490 por R$ 1.990\n🔥 Vagas limitadas — garanta já!",
    },
    {
      title: "Salvador Carnaval Premium",
      text: "🎉 4 noites no coração do Pelô\n🏨 Hotel 4★ + Café da manhã\n🎭 Camarote incluso 2 dias\n💸 12x de R$ 490\n📲 Consulte datas disponíveis.",
    },
    {
      title: "Jericoacoara - Pacote Completo",
      text: "🌅 6 dias no paraíso cearense\n🏨 Pousada + Café da manhã\n🚐 Transfer Fortaleza → Jeri\n🔥 Lagoa Azul + Voo de Buggy incluídos\n💸 R$ 2.890 por pessoa.",
    },
    {
      title: "Maceió + Porto de Galinhas 8 Dias",
      text: "🏝️ Combine dois destinos incríveis\n✈️ Voos + Transfers + Hotéis\n🐠 Passeio de jangada incluído\n💸 De R$ 4.800 por R$ 3.990\n📲 Pacote especial — 12x sem juros.",
    },
    {
      title: "Recife & Olinda Cultural",
      text: "🏛️ 4 noites explorando o melhor de PE\n🏨 Hotel boutique no Recife Antigo\n🎨 City tour + Olinda + Mercado de São José\n💸 R$ 1.890 por pessoa\n📲 Ideal para famílias e casais.",
    },
    {
      title: "Ilha de Boipeba - Exclusivo",
      text: "🌺 5 dias na ilha mais bonita da Bahia\n🏡 Pousada pé na areia\n🚤 Passeio de barco pelas ilhas\n💸 R$ 3.490 por pessoa\n🔥 Só 6 vagas disponíveis.",
    },
    {
      title: "Lençóis Maranhenses 7 Dias",
      text: "🏜️ Deserto de areia + lagoas azuis\n🚐 Transfer São Luís → Barreirinhas\n🏨 Pousada + Café da manhã\n🔥 Temporada de lagoas cheias (jan-jun)\n💸 R$ 2.690 por pessoa.",
    },
  ],
  sul: [
    {
      title: "Gramado no Inverno - 4 Dias",
      text: "❄️ Hotel charme no centro\n🍷 Tour da uva + chocolate\n🧀 Café colonial incluído\n💸 De R$ 2.890 por R$ 2.290\n📲 Saídas garantidas em julho.",
    },
    {
      title: "Floripa Verão Premium",
      text: "🏖️ 7 dias no Norte da Ilha\n✈️ Aéreo + transfer privativo\n🏨 Pousada pé na areia\n💸 R$ 3.490 por pessoa\n🔥 Últimas vagas para janeiro.",
    },
    {
      title: "Bento Gonçalves + Serra Gaúcha",
      text: "🍇 5 dias entre vinícolas e montanhas\n🍷 Wine tour + almoço típico incluído\n🏨 Hotel charme em Gramado\n💸 De R$ 3.200 por R$ 2.590\n📲 Grupo máximo 16 pessoas.",
    },
    {
      title: "Foz do Iguaçu - Cataratas Incríveis",
      text: "💦 4 dias nas 7 Maravilhas da Natureza\n🏨 Hotel 4★ + Café da manhã\n🚐 Parque Cataratas + Itaipu\n💸 De R$ 2.490 por R$ 1.890\n🔥 Voe de qualquer capital.",
    },
    {
      title: "Curitiba + Trem da Serra",
      text: "🚂 Passeio histórico Curitiba → Morretes\n🏙️ City tour + Jardim Botânico\n🍤 Barreado típico incluído\n💸 R$ 1.490 por pessoa\n📲 Saídas às sextas e sábados.",
    },
    {
      title: "Aparados da Serra + Cânions",
      text: "⛰️ 4 dias entre os maiores cânions do Brasil\n🏨 Pousada em Cambará do Sul\n🥾 Trilha Itaimbezinho incluída\n💸 R$ 1.990 por pessoa\n🔥 Natureza pura e intocada.",
    },
    {
      title: "Torres + Praia Gaúcha 5 Dias",
      text: "🌊 O melhor do litoral gaúcho\n🏨 Pousada + Café da manhã\n🌅 Pôr do sol nas falésias negras\n💸 R$ 1.690 por pessoa\n📲 Ideal para casais e família.",
    },
    {
      title: "Joinville + Balneário 6 Dias",
      text: "🌺 Festa das Flores + praias de SC\n🏨 2 hotéis diferentes incluídos\n🎡 Parques temáticos próximos\n💸 De R$ 2.890 por R$ 2.190\n🔥 Promoção mês de outubro.",
    },
  ],
  internacional: [
    {
      title: "Disney Orlando Família",
      text: "🏰 7 dias com 4 parques inclusos\n✈️ Aéreo + Hotel oficial Disney\n🍔 Plano de refeições\n💸 12x de R$ 1.290\n📲 Consulte saídas e datas.",
    },
    {
      title: "Cancún All Inclusive",
      text: "🌊 5 noites em resort 5★\n🍹 Bebidas e comida liberadas\n✈️ Aéreo + transfer\n💸 De R$ 7.900 por R$ 6.490\n🔥 Promo válida até sexta.",
    },
    {
      title: "Europa em 10 dias",
      text: "🇫🇷🇮🇹🇪🇸 Paris + Roma + Barcelona\n✈️ Aéreo + trens + hotéis 3★\n🍝 Café da manhã todos os dias\n💸 12x de R$ 1.490\n📲 Vagas para março/abril.",
    },
    {
      title: "Buenos Aires + Mendoza 7 Dias",
      text: "🇦🇷 Tango + vinho + gastronomia\n🍷 Visita a vinícola incluída\n🏨 Hotéis boutique 4★\n💸 De R$ 5.890 por R$ 4.490\n📲 Voos diretos de SP e RJ.",
    },
    {
      title: "Lisboa + Porto 8 Dias",
      text: "🇵🇹 Descubra Portugal de verdade\n✈️ Aéreo + trens entre cidades\n🏨 Hotéis com café da manhã\n🍷 Tour de vinho do Porto\n💸 12x de R$ 1.190 por pessoa.",
    },
    {
      title: "Miami + Bahamas 7 Noites",
      text: "🌊 O melhor do Caribe americano\n✈️ Voo direto para Miami\n🚢 Cruzeiro Bahamas 2 noites\n🏨 Hotel em South Beach\n💸 De R$ 9.900 por R$ 7.990.",
    },
    {
      title: "Japão Tokyo + Kyoto 10 Dias",
      text: "🏯 Cerejeiras + templos + tecnologia\n✈️ Aéreo + JR Pass incluso\n🏨 Hotel 3★ + ryokan tradicional\n🍣 Experiência culinária inclusa\n💸 12x de R$ 1.890.",
    },
    {
      title: "Dubai 5 Noites - Luxo Acessível",
      text: "🏙️ Burj Khalifa + Deserto + Compras\n✈️ Voo + Transfer privativo\n🏨 Hotel 5★ com café da manhã\n🎡 City tour e safári no deserto\n💸 12x de R$ 1.290 por pessoa.",
    },
    {
      title: "Peru - Machu Picchu 7 Dias",
      text: "🏔️ Maravilha do Mundo + Cusco + Lima\n✈️ Aéreo + trem Hiram Bingham\n🏨 Hotéis + guia em português\n🦙 Experiência inesquecível\n💸 R$ 7.990 por pessoa.",
    },
    {
      title: "Nova York 6 Noites",
      text: "🗽 Manhattan + Brooklyn + Central Park\n✈️ Voo direto com bagagem\n🏨 Hotel 4★ em Midtown\n🎭 Broadway show incluído\n💸 12x de R$ 1.490 por pessoa.",
    },
  ],
  cruzeiro: [
    {
      title: "Cruzeiro Costa Brasileira 7 Noites",
      text: "🚢 Cabines internas, externas ou com varanda\n🍾 Pensão completa + bebidas inclusas\n💸 A partir de R$ 2.890 por pessoa\n🔥 Embarques de Santos e Itajaí.",
    },
    {
      title: "Cruzeiro Caribe MSC",
      text: "🌴 7 noites pelas Antilhas\n🚢 Cabine com varanda\n✈️ Aéreo + transfer + cruzeiro\n💸 12x de R$ 990\n📲 Última saída do ano.",
    },
    {
      title: "Cruzeiro Mediterrâneo 10 Noites",
      text: "🇮🇹🇬🇷🇪🇸 Itália, Grécia e Espanha\n🚢 Navio Royal Caribbean 5★\n🍷 Bebidas premium inclusas\n💸 12x de R$ 1.490\n🔥 Saídas entre junho e agosto.",
    },
    {
      title: "Cruzeiro Buenos Aires + Patagônia",
      text: "🧊 Geleiras patagônicas\n🚢 Cabine com varanda panorâmica\n🇦🇷🇨🇱 Escalas em Ushuaia e Punta Arenas\n💸 12x de R$ 1.290\n📲 Experiência única na América do Sul.",
    },
    {
      title: "Cruzeiro Ilhas Gregas 7 Noites",
      text: "🏛️ Santorini + Mykonos + Rodes\n🚢 Costa Crociere Classe Magica\n🌊 Camarote com varanda garantido\n💸 De R$ 9.900 por R$ 7.490\n🔥 Temporada de verão europeu.",
    },
    {
      title: "Mini Cruzeiro - Fim de Semana",
      text: "🚢 2 noites saindo de Santos\n🍽️ Pensão completa + 1 jantar especial\n🎭 Show + casino + piscina\n💸 A partir de R$ 890 por pessoa\n📲 Saídas às quintas e sextas.",
    },
    {
      title: "Cruzeiro Transatlântico - Europa",
      text: "🌊 14 noites cruzando o Atlântico\n🚢 Embarque no Rio + Chegada em Lisboa\n🍾 All-inclusive premium\n🎻 Entretenimento diário\n💸 12x de R$ 1.890 por pessoa.",
    },
    {
      title: "Cruzeiro Nilo - Egito 7 Dias",
      text: "🏛️ Pirâmides + Templo de Luxor\n🚢 Navio boutique no Rio Nilo\n🐪 Passeio de camelo incluso\n🍽️ Pensão completa\n💸 R$ 12.990 por pessoa (12x disponível).",
    },
  ],
  aventura: [
    {
      title: "Chapada Diamantina 5 Dias",
      text: "⛰️ Trilhas + cachoeiras + Poço Azul\n🏨 Pousada + guia local\n🥾 Equipamentos inclusos\n💸 R$ 2.190 por pessoa\n📲 Grupo pequeno (máx 12).",
    },
    {
      title: "Bonito Ecoaventura",
      text: "🐠 Flutuação + Gruta do Lago Azul\n🏨 4 noites + transfer\n🥥 Café da manhã\n💸 De R$ 3.190 por R$ 2.690\n🔥 Saídas mensais.",
    },
    {
      title: "Amazônia - Expedição 5 Dias",
      text: "🌿 Floresta Amazônica + Rio Negro\n🛶 Canoa + pesca de tucunaré\n🏕️ Lodge na floresta\n🦜 Avistamento de animais silvestres\n💸 R$ 4.490 por pessoa.",
    },
    {
      title: "Pantanal - Safari Brasileiro",
      text: "🐊 Onça pintada + jacaré + tuiuiú\n🐴 Passeio a cavalo + safari de barco\n🏡 Fazenda ecológica 4★\n💸 5 dias / 4 noites por R$ 3.890\n📲 Melhor época: jul-set.",
    },
    {
      title: "Fernando de Noronha 5 Dias",
      text: "🐬 Golfinhos + mergulho + trilhas\n✈️ Voo direto Recife → Noronha\n🏡 Pousada com café da manhã\n🤿 Equipamento de mergulho incluso\n💸 R$ 6.990 por pessoa.",
    },
    {
      title: "Petrópolis + Teresópolis Serrana",
      text: "🏔️ Serra do Rio no roteiro completo\n🏰 Museu Imperial + Palácio de Cristal\n🥾 Trilha no Parque Estadual\n🏨 Pousada 3★ com café da manhã\n💸 R$ 1.290 por pessoa.",
    },
    {
      title: "Patagônia Argentina 8 Dias",
      text: "🏔️ Bariloche + El Calafate + Glaciar Perito Moreno\n🧊 Trilha nas geleiras\n🦅 Fauna local + paisagens únicas\n💸 12x de R$ 1.490\n🔥 Experiência do fim do mundo.",
    },
    {
      title: "Costa Rica - Paraíso Verde",
      text: "🐒 Selva tropical + praias do Pacífico\n🌋 Vulcão Arenal + tirolesa\n🐢 Desova de tartarugas marinhas\n🏨 Eco-lodge 4★\n💸 R$ 9.490 por pessoa (8 dias).",
    },
  ],
  luademel: [
    {
      title: "Maldivas Lua de Mel",
      text: "🏝️ 7 noites em bangalô sobre o mar\n🍾 Jantar romântico + Spa\n✈️ Aéreo + transfer marítimo\n💸 12x de R$ 2.490 por pessoa\n📲 Ofertas exclusivas para casais.",
    },
    {
      title: "Paris Romântico",
      text: "🇫🇷 5 noites no centro de Paris\n🍷 Cruzeiro pelo Sena + Torre Eiffel\n☕ Café da manhã + transfer\n💸 R$ 8.990 o casal\n🔥 Inclui surpresa romântica no quarto.",
    },
    {
      title: "Bali - Ilha dos Deuses",
      text: "🌺 8 dias na ilha mais mística do mundo\n🏡 Villa privativa com piscina\n💆 Spa balinês + yoga\n🌋 Ubud + Tanah Lot + Seminyak\n💸 12x de R$ 1.890 por pessoa.",
    },
    {
      title: "Grécia Santorini + Mykonos",
      text: "🌅 7 noites nas ilhas mais lindas do mundo\n🏡 Villa com vista para a caldeira\n🍷 Coucher do soleil + vinho grego\n🚢 Transfer de barco entre ilhas\n💸 R$ 14.990 o casal.",
    },
    {
      title: "Noronha Romântico 5 Dias",
      text: "🐬 O lugar mais mágico do Brasil\n🤿 Mergulho com golfinhos\n🏡 Pousada boutique + café da manhã\n🌅 Sundowner na Baía do Sancho\n💸 R$ 13.490 o casal.",
    },
    {
      title: "Punta Cana All Inclusive",
      text: "🌴 7 noites no Caribe\n🏨 Resort 5★ tudo incluído\n🍹 Open bar premium\n💃 Shows e entretenimento noturno\n💸 De R$ 9.900 por R$ 7.990 o casal.",
    },
    {
      title: "Itália Romântica - Toscana",
      text: "🇮🇹 Florença + Siena + Vinícolas\n🍷 Wine tour + jantar privativo\n🏡 Villa histórica na Toscana\n💸 10 dias por R$ 18.990 o casal\n📲 Experiência dos sonhos.",
    },
    {
      title: "Marrocos - 1001 Noites",
      text: "🕌 Marrakech + Fes + Deserto do Saara\n🐪 Noite no acampamento beduíno\n🏨 Riad boutique 5★\n🌟 Jantar com música ao vivo\n💸 8 dias por R$ 12.490 o casal.",
    },
  ],
};

export function getOfertasByNiche(niche: Niche): OfertaTemplate[] {
  if (!niche || !(niche in OFERTAS)) {
    return Object.values(OFERTAS).flat().slice(0, 6);
  }
  return OFERTAS[niche as string];
}
