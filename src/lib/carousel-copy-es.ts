/**
 * Copys do carrossel em espanhol (rota /es/fabrica). Espelha as famílias do PT em
 * F1CarouselBuilder (inspirar, oferta, guia, FAQ): gancho específico na capa, uma
 * ideia por slide, CTA de guardar/enviar/comentar/escrever por WhatsApp.
 * Sem números, preços ou promessas inventadas: tudo que é dado vem do pacote.
 */
import type { Pacote } from "@/hooks/useFabricaContext";

type Size = 3 | 4 | 5 | 6;
export interface EsTextBlock { label: string; title: string; body: string; bullets: string[]; cta?: string }
export interface EsTextPool { title: string[]; body: string[]; bullets: string[][] }

const clean = (s?: string) => (s || "").replace(/\s+/g, " ").trim();
const uniq = (items: string[]) => items.map(clean).filter((x, i, a) => x && a.indexOf(x) === i);

type Family = "inspire" | "offer" | "guide" | "faq";
export const esFamily = (strategy: string): Family =>
  strategy === "oferta" || strategy === "pro-split" ? "offer"
    : strategy === "editorial" || strategy === "pro-magazine" ? "guide"
      : strategy === "vibrant" ? "faq"
        : "inspire";

function facts(p: Pacote) {
  return {
    destination: clean(p.title) || "tu próximo destino",
    included: uniq([...(p.included || []), ...(p.highlights || [])]),
    price: clean(p.price),
    payment: clean(p.paymentTerms),
    duration: clean(p.duration),
    dates: clean(p.travelDates),
    origin: clean(p.departureLocation),
  };
}

const block = (title: string, body = "", bullets: string[] = [], label = "", cta?: string): EsTextBlock => ({ label, title, body, bullets, cta });

/** Sequência completa (capa, miolo, fechamento) para o tamanho pedido. */
export function documentedSequenceEs(p: Pacote, total: Size, strategy: string): EsTextBlock[] {
  const f = facts(p);
  const d = f.destination;
  const family = esFamily(strategy);
  let cover: EsTextBlock;
  let middle: EsTextBlock[];
  let closing: EsTextBlock;

  if (family === "offer") {
    cover = block(
      f.price ? `${d} ${/^(R\$|US\$|AR\$|€|£|\$)?\s*[\d.,]+\s*$/.test(f.price) ? `desde ${f.price}` : f.price}` : `Paquete ${d} con todo organizado`,
      f.origin ? `Saliendo de ${f.origin}.` : "Pasaje, hospedaje y paseos en un solo lugar: tú solo haces la maleta.",
      [],
      "OFERTA",
    );
    middle = [
      block("Lo que incluye", "", f.included.slice(0, 3), "INCLUYE"),
      block(f.duration || f.dates ? "Cuándo salir y por cuánto tiempo" : "Tú eliges la fecha, nosotros el resto", f.duration || f.dates || "Días suficientes para conocer sin prisa.", [], "FECHAS"),
      block(f.payment ? "Cómo pagar" : f.price ? `Desde ${f.price}` : "Valores a consultar, sin compromiso", f.payment || "Pago facilitado, sin letra chica.", [], "VALOR"),
      block("Cómo reservar en 3 pasos", "", ["Escríbenos por WhatsApp", "Elige la fecha", "Recibe el itinerario listo"], "RESERVA"),
    ];
    closing = block(`¿Quieres asegurar ${d}?`, "Escríbenos por WhatsApp y te pasamos fechas y valores.", [], "", "Reserva por WhatsApp");
  } else if (family === "guide") {
    cover = block(`Guía rápida de ${d}: guárdala para no olvidar`, "Lo esencial para planear sin errores, en pocos slides.", [], "GUÍA DE VIAJE");
    middle = [
      block("Mejor época para ir", "El clima y los precios cambian mucho durante el año; la fecha correcta hace la diferencia.", [], "01"),
      block("Dónde hospedarse (y dónde no)", "Quedarte cerca de lo que quieres ver ahorra tiempo y traslados.", [], "02"),
      block("Lo que no puede faltar en el itinerario", "Reserva lo imperdible antes y deja el resto para improvisar.", [], "03"),
      block("Qué llevar en la maleta", "Lleva menos de lo que crees que necesitas.", [], "04"),
    ];
    closing = block(`¿Quieres este itinerario de ${d} listo para ti?`, "Armamos el viaje a tu ritmo y a tu presupuesto.", [], "", "Guarda esta guía");
  } else if (family === "faq") {
    cover = block(`¿Dudas sobre ${d}? Respondo las más comunes`, "Respuestas cortas, directo al punto.", [], "PREGUNTAS");
    middle = [
      block("¿Cuántos días necesito?", "Depende de lo que quieras ver; te ayudamos a calcularlo.", [], "01"),
      block("¿Dónde es mejor quedarse?", "Cerca de lo que importa para ti, no de lo que está de moda.", [], "02"),
      block("¿Vale la pena un paquete?", "Resuelve traslado, hospedaje y paseos de una sola vez.", [], "03"),
      block("¿Cuándo sale más económico?", "Fuera de temporada alta el mismo itinerario suele salir mejor.", [], "04"),
    ];
    closing = block(`¿Te quedó alguna duda sobre ${d}?`, "Escríbenos por WhatsApp: respondemos rápido y sin compromiso.", [], "", "Comenta tu pregunta");
  } else {
    cover = block(`Motivos para poner ${d} en tu lista`, "Un viaje para desconectar de verdad, con todo organizado para ti.", [], "INSPÍRATE");
    middle = [
      block("Despertar con esta vista todos los días", "Para eso organizamos todo: tú solo disfrutas.", [], "01"),
      block("Días sin reloj, sin tráfico, sin prisa", "Sin planillas y sin estrés: nosotros armamos el itinerario.", [], "02"),
      block("Comida local, mar y atardecer en el mismo día", "Paquete cerrado, cabeza libre.", [], "03"),
      block("El paseo que todos recuerdan al volver", "El tipo de día que se vuelve historia en familia.", [], "04"),
    ];
    closing = block(`¿${d} entró en tu lista?`, "Guarda este post y envíalo a quien viajaría contigo.", [], "¿Y AHORA?", "Planea tu viaje con nosotros");
  }

  const contentCount = Math.max(1, total - 2);
  const included = f.included;
  const pick = (i: number) => (included.length ? [0, 1].map((k) => included[(i * 2 + k) % included.length]).filter((x, j, a) => a.indexOf(x) === j) : []);
  const mid = middle.slice(0, contentCount).map((b, i) => (b.bullets.length ? b : { ...b, bullets: pick(i) }));
  return [cover, ...mid, closing];
}

/** Opções para o botão "outra sugestão" de cada campo. */
export function textPoolEs(p: Pacote, total: Size, strategy: string, slideIndex: number): EsTextPool {
  const f = facts(p);
  const d = f.destination;
  const isCover = slideIndex === 0;
  const isClosing = slideIndex === total - 1;
  const coverTitles = [
    `${d}: lo que nadie te cuenta antes de ir`,
    `Antes de reservar tu viaje a ${d}, lee esto`,
    `${d} sin estrés: guárdalo antes de reservar`,
    `Errores de quien va a ${d} por primera vez`,
    `Por qué todos están hablando de ${d}`,
    `¿Ya imaginaste despertar en ${d}?`,
  ];
  const seq = documentedSequenceEs(p, total, strategy);
  const own = seq[Math.min(slideIndex, seq.length - 1)];
  const title = isCover
    ? [own.title, ...coverTitles]
    : isClosing
      ? [own.title, `¿Quieres ir a ${d} sin dolores de cabeza?`, `Escríbenos y armamos tu itinerario de ${d}`]
      : [own.title, ...seq.slice(1, -1).map((b) => b.title)];
  const body = isClosing
    ? [own.body, "Guarda este post y envíalo a quien viajaría contigo.", "Comenta 📍 y te enviamos las opciones."]
    : [own.body, "Para eso organizamos todo: tú solo disfrutas.", "Paquete cerrado, cabeza libre.", "Todo resuelto antes de embarcar."];
  const bullets = [
    f.included.slice(0, 3),
    uniq([f.dates, f.duration, f.origin ? `Saliendo de ${f.origin}` : ""]),
    ["Todo organizado", "Itinerario a tu ritmo", "Soporte durante el viaje"],
  ].filter((x) => x.length);
  return { title: uniq(title), body: uniq(body), bullets };
}

export function ctaSuggestionsEs(p: Pacote): string[] {
  const d = facts(p).destination;
  return uniq([
    "Escríbenos por WhatsApp: fechas y valores sin compromiso.",
    "Guárdalo y envíalo a quien viaja contigo.",
    "Comenta 📍 y te enviamos las opciones.",
    `¿Quieres el itinerario de ${d} listo? Escríbenos.`,
    "Planea tu viaje con nosotros.",
    "Solicita tu cotización.",
  ]).map((t) => t.slice(0, 62));
}
