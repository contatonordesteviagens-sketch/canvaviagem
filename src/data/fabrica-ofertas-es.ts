import type { Niche } from "@/hooks/useFabricaContext";

export interface OfertaTemplate {
  title: string;
  text: string;
}

const OFERTAS_ES: Record<string, OfertaTemplate[]> = {
  nordeste: [
    {
      title: "Paquete Cancún 5 Días con Todo Incluido",
      text: "✈️ Vuelo + Hotel 4★ + Desayuno + Traslado\n📅 Salidas semanales\n💸 6x sin interés con tarjeta\n🔥 $ 1,997 por persona (antes $ 2,580)\n📲 Escríbenos al WhatsApp y reserva tu lugar.",
    },
    {
      title: "Punta Cana en Familia",
      text: "🐠 Paquete 4 días / 3 noches\n🏨 Resort all-inclusive\n👨‍👩‍👧 Niños hasta 6 años GRATIS\n💸 De $ 3,200 por $ 2,490\n⏰ Solo 8 cupos disponibles.",
    },
    {
      title: "Playa del Carmen Romántico - Luna de Miel",
      text: "💕 5 noches en Resort Premium\n🍾 Cena especial + Spa para la pareja\n🚐 Excursiones incluidas\n💸 $ 4,890 por pareja\n📲 Reserva con 10% de adelanto.",
    },
    {
      title: "Tulum 5 Noches - Promoción",
      text: "🌊 Hotel frente al mar + Desayuno\n✈️ Vuelo incluido\n🚐 Traslado in/out + Paseo en Buggy\n💸 De $ 2,490 por $ 1,990\n🔥 Cupos limitados — ¡asegura el tuyo!",
    },
    {
      title: "Cartagena Histórica Premium",
      text: "🎉 4 noches en el corazón de la Ciudad Amurallada\n🏨 Hotel 4★ + Desayuno\n🎭 Tour guiado incluido\n💸 12x de $ 490\n📲 Consulta fechas disponibles.",
    },
    {
      title: "San Andrés - Paquete Completo",
      text: "🌅 6 días en el paraíso colombiano\n🏨 Posada + Desayuno\n🚐 Traslado aeropuerto → hotel\n🔥 Mar de los 7 colores + Tour incluido\n💸 $ 2,890 por persona.",
    },
    {
      title: "Cancún + Riviera Maya 8 Días",
      text: "🏝️ Combina dos destinos increíbles\n✈️ Vuelos + Traslados + Hoteles\n🐠 Snorkeling incluido\n💸 De $ 4,800 por $ 3,990\n📲 Paquete especial — 12x sin interés.",
    },
    {
      title: "Santa Marta Cultural",
      text: "🏛️ 4 noches explorando lo mejor de Colombia\n🏨 Hotel boutique en el centro histórico\n🎨 City tour + Parque Tayrona\n💸 $ 1,890 por persona\n📲 Ideal para familias y parejas.",
    },
    {
      title: "Isla Holbox - Exclusivo",
      text: "🌺 5 días en la isla más bonita de México\n🏡 Posada frente al mar\n🚤 Paseo en lancha por las islas\n💸 $ 3,490 por persona\n🔥 Solo 6 cupos disponibles.",
    },
    {
      title: "Galápagos 7 Días",
      text: "🏜️ Naturaleza única + playas cristalinas\n🚐 Traslado entre islas\n🏨 Hotel + Desayuno\n🔥 Temporada de avistamiento\n💸 $ 2,690 por persona.",
    },
  ],
  sul: [
    {
      title: "Bariloche en Invierno - 4 Dias",
      text: "❄️ Hotel con encanto en el centro\n🍷 Tour de vino + chocolate\n🧀 Cena típica incluida\n💸 De $ 2,890 por $ 2,290\n📲 Salidas garantizadas en julio.",
    },
    {
      title: "Ushuaia Fin del Mundo",
      text: "🏔️ 7 días en el extremo sur\n✈️ Vuelo + traslado privado\n🏨 Hotel frente al canal\n💸 $ 3,490 por persona\n🔥 Últimos cupos para enero.",
    },
    {
      title: "Mendoza + Ruta del Vino",
      text: "🍇 5 días entre viñedos y montañas\n🍷 Wine tour + almuerzo típico incluido\n🏨 Hotel con encanto\n💸 De $ 3,200 por $ 2,590\n📲 Grupo máximo 16 personas.",
    },
    {
      title: "El Calafate - Glaciares Increíbles",
      text: "💦 4 días en los glaciares milenarios\n🏨 Hotel 4★ + Desayuno\n🚐 Parque Nacional Perito Moreno\n💸 De $ 2,490 por $ 1,890\n🔥 Vuela desde cualquier capital.",
    },
    {
      title: "Santiago + Valle Nevado",
      text: "🚂 Paseo histórico por Santiago\n🏙️ City tour + Viñedos\n🍤 Cena show incluida\n💸 $ 1,490 por persona\n📲 Salidas los viernes y sábados.",
    },
    {
      title: "Torres del Paine + Canales",
      text: "⛰️ 4 días entre los mayores paisajes de Chile\n🏨 Hotel en Puerto Natales\n🥾 Trekking incluido\n💸 $ 1,990 por persona\n🔥 Naturaleza pura e intacta.",
    },
    {
      title: "Viña del Mar + Valparaíso 5 Días",
      text: "🌊 Lo mejor del litoral chileno\n🏨 Hotel + Desayuno\n🌅 Atardecer en las playas\n💸 $ 1,690 por persona\n📲 Ideal para parejas y familia.",
    },
    {
      title: "Puerto Varas + Lagos 6 Dias",
      text: "🌺 Volcanes + lagos de Chile\n🏨 2 hoteles diferentes incluidos\n🎡 Excursiones naturales próximas\n💸 De $ 2,890 por $ 2,190\n🔥 Promoción mes de octubre.",
    },
  ],
  internacional: [
    {
      title: "Disney Orlando Familia",
      text: "🏰 7 días con 4 parques incluidos\n✈️ Vuelo + Hotel oficial Disney\n🍔 Plan de comidas\n💸 12x de $ 1,290\n📲 Consulta salidas y fechas.",
    },
    {
      title: "Europa en 10 días",
      text: "🇫🇷🇮🇹🇪🇸 París + Roma + Barcelona\n✈️ Vuelo + trenes + hoteles 3★\n🍝 Desayuno todos los días\n💸 12x de $ 1,490\n📲 Cupos para marzo/abril.",
    },
    {
      title: "Miami + Bahamas 7 Noches",
      text: "🌊 Lo mejor del Caribe americano\n✈️ Vuelo directo a Miami\n🚢 Crucero Bahamas 2 noches\n🏨 Hotel en South Beach\n💸 De $ 9,900 por $ 7,990.",
    },
    {
      title: "Japón Tokyo + Kyoto 10 Días",
      text: "🏯 Cerezos + templos + tecnología\n✈️ Vuelo + JR Pass incluido\n🏨 Hotel 3★ + ryokan tradicional\n🍣 Experiencia culinaria incluida\n💸 12x de $ 1,890.",
    },
    {
      title: "Dubai 5 Noches - Lujo Accesible",
      text: "🏙️ Burj Khalifa + Desierto + Compras\n✈️ Vuelo + Traslado privado\n🏨 Hotel 5★ con desayuno\n🎡 City tour y safari en el desierto\n💸 12x de $ 1,290 por persona.",
    },
    {
      title: "New York 6 Noites",
      text: "🗽 Manhattan + Brooklyn + Central Park\n✈️ Vuelo directo con equipaje\n🏨 Hotel 4★ en Midtown\n🎭 Broadway show incluido\n💸 12x de $ 1,490 por persona.",
    },
    {
      title: "París Romántico",
      text: "🇫🇷 5 noches en el centro de París\n🍷 Crucero por el Sena + Torre Eiffel\n☕ Desayuno + traslado\n💸 $ 8,990 por pareja\n🔥 Incluye sorpresa romántica en el cuarto.",
    },
    {
      title: "Grecia Santorini + Mykonos",
      text: "🌅 7 noches en las islas más lindas del mundo\n🏡 Villa con vista a la caldera\n🍷 Atardecer + vino griego\n🚢 Traslado de barco entre islas\n💸 $ 14,990 por pareja.",
    },
  ],
  cruzeiro: [
    {
      title: "Crucero Caribe All Inclusive 7 Noches",
      text: "🚢 Cabinas internas, externas o con balcón\n🍾 Pensión completa + bebidas incluidas\n💸 A partir de $ 2,890 por persona\n🔥 Salidas de Miami y Panamá.",
    },
    {
      title: "Crucero Mediterráneo 10 Noches",
      text: "🇮🇹🇬🇷🇪🇸 Italia, Grecia y España\n🚢 Barco Royal Caribbean 5★\n🍷 Bebidas premium incluidas\n💸 12x de $ 1,490\n🔥 Salidas entre junio y agosto.",
    },
    {
      title: "Crucero Buenos Aires + Patagonia",
      text: "🧊 Glaciares patagónicos\n🚢 Cabina con balcón panorámico\n🇦🇷🇨🇱 Escalas en Ushuaia y Punta Arenas\n💸 12x de $ 1,290\n📲 Experiencia única en América del Sur.",
    },
    {
      title: "Crucero Islas Griegas 7 Noches",
      text: "🏛️ Santorini + Mykonos + Rodas\n🚢 Costa Cruceros Clase Magica\n🌊 Camarote con balcón garantizado\n💸 De $ 9,900 por $ 7,490\n🔥 Temporada de verano europeo.",
    },
  ],
  aventura: [
    {
      title: "Machu Picchu 7 Días",
      text: "🏔️ Maravilla del Mundo + Cusco + Lima\n✈️ Vuelo + tren Hiram Bingham\n🏨 Hoteles + guía en español\n🦙 Experiencia inolvidable\n💸 $ 7,990 por persona.",
    },
    {
      title: "Salar de Uyuni 5 Días",
      text: "🏜️ Espejo de sal + paisajes irreales\n🚐 Traslado 4x4 incluido\n🏨 Hotel de sal + Desayuno\n📸 Sesión de fotos incluida\n💸 $ 2,190 por persona.",
    },
    {
      title: "Costa Rica - Paraíso Verde",
      text: "🐒 Selva tropical + playas del Pacífico\n\n🌋 Volcán Arenal + tirolesa\n🐢 Desove de tortugas marinas\n🏨 Eco-lodge 4★\n💸 $ 9,490 por persona (8 días).",
    },
  ],
  luademel: [
    {
      title: "Maldivas Luna de Miel",
      text: "🏝️ 7 noches en bungalow sobre el mar\n🍾 Cena romántica + Spa\n✈️ Vuelo + traslado marítimo\n💸 12x de $ 2,490 por persona\n📲 Ofertas exclusivas para parejas.",
    },
    {
      title: "Bali - Isla de los Dioses",
      text: "🌺 8 días en la isla más mística del mundo\n🏡 Villa privada con piscina\n\n💆 Spa balinés + yoga\n🌋 Ubud + Tanah Lot + Seminyak\n💸 12x de $ 1,890 por persona.",
    },
  ],
};

export function getOfertasByNicheES(niche: Niche): OfertaTemplate[] {
  if (!niche || !(niche in OFERTAS_ES)) {
    return Object.values(OFERTAS_ES).flat().slice(0, 6);
  }
  return OFERTAS_ES[niche as string];
}
