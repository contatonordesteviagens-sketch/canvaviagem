/**
 * "Pacote em uma frase": transforma o que a dona da agência digita
 * ("Noronha, 5 dias, 10x R$ 1.299,00, aéreo saindo de Recife + hotel com café")
 * num Pacote. Usado no Painel e no estado vazio do Carrossel.
 */
import type { Pacote } from "@/hooks/useFabricaContext";
import { buildPackageSlug, createUniquePackageSlug } from "@/lib/package-details";

export interface QuickPackageParse {
  title: string;
  price: string;
  installments: string;
  duration: string;
  departure: string;
  included: string[];
}

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export function parseQuickPackage(text: string): QuickPackageParse {
  // Protege a vírgula decimal ("1.299,00") para ela não virar separador de campo.
  const protectedText = text.replace(/(\d),(\d{2})\b/g, "$1⁣$2");
  const parts = protectedText
    .split(/[,;|]+|\s+e\s+(?=\d)/)
    .map((p) => p.replace(/⁣/g, ",").trim())
    .filter(Boolean);
  const title = parts.shift() || text.trim();
  let price = "";
  let installments = "";
  let duration = "";
  let departure = "";
  const included: string[] = [];

  for (const part of parts) {
    // preço: número depois do símbolo da moeda (não o "10" de "10x")
    const priceMatch = part.match(/(R\$|US\$|€|\$)\s*(\d{1,3}(?:[.\s]\d{3})*(?:,\d{1,2})?|\d+(?:,\d{1,2})?)/i)
      || (/\b(reais|por pessoa)\b/i.test(part) ? part.match(/()(\d{1,3}(?:[.\s]\d{3})*(?:,\d{1,2})?)/) : null);
    const instMatch = part.match(/\b(\d{1,2})\s*x\b/i);
    const durationMatch = part.match(/\b(\d{1,2})\s*(dias?|noites?|di[aá]rias?)\b/i);
    const departureMatch = part.match(/sa[ií](?:ndo|da)\s+de\s+([^+]+)/i);

    if (!price && priceMatch) {
      const sym = priceMatch[1] || "R$";
      price = `${sym} ${priceMatch[2].trim()}`;
      if (instMatch) installments = `${instMatch[1]}x`;
      // o resto da frase (ex.: "aéreo saindo de Recife") continua valendo como incluso
      const rest = part.replace(priceMatch[0], "").replace(/\b\d{1,2}\s*x\b/i, "").replace(/\b(a partir de|por pessoa|em até|sem juros|de)\b/gi, "").trim();
      if (rest.length > 3) included.push(...splitIncluded(rest));
      continue;
    }
    if (!duration && durationMatch) {
      duration = `${durationMatch[1]} ${durationMatch[2].toLowerCase()}`;
      continue;
    }
    if (departureMatch && !departure) departure = cap(departureMatch[1].split(/\s*\+\s*/)[0].trim());
    // "aéreo saindo de Recife" vira incluso "Aéreo"; a saída fica no campo próprio
    included.push(...splitIncluded(part.replace(/sa[ií](?:ndo|da)\s+de\s+[^+]+/i, "").trim()));
  }
  return { title: cap(title), price, installments, duration, departure, included: included.map(cap).filter((x, i, a) => a.indexOf(x) === i) };
}

function splitIncluded(part: string): string[] {
  return part
    .split(/\s*\+\s*|\s+e\s+(?=[a-záéíóúç])/i)
    .map((x) => x.replace(/^(com|incluindo|incluso)\s+/i, "").trim())
    .filter((x) => x.length > 1);
}

export function buildQuickPackage(text: string, existing: Pacote[]): Pacote | null {
  const parsed = parseQuickPackage(text);
  if (!parsed.title) return null;
  const id = `pkg_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  const usedSlugs = existing.map((item) => item.slug || buildPackageSlug(item.title, item.id));
  const priceLabel = parsed.price ? (parsed.installments ? `${parsed.installments} ${parsed.price}` : parsed.price) : "";
  const descriptionParts = [
    parsed.duration ? `${parsed.duration} em ${parsed.title}` : `Viagem para ${parsed.title}`,
    parsed.departure ? `saindo de ${parsed.departure}` : "",
    parsed.included.length ? `com ${parsed.included.slice(0, 3).join(", ").toLowerCase()}` : "",
  ].filter(Boolean);
  return {
    id,
    title: parsed.title,
    slug: createUniquePackageSlug(parsed.title, usedSlugs, id),
    description: `${descriptionParts.join(", ")}.`,
    price: priceLabel || "Consulte",
    duration: parsed.duration || undefined,
    included: parsed.included.length ? parsed.included : undefined,
    departureLocation: parsed.departure || undefined,
    paymentTerms: parsed.installments && parsed.price ? `${parsed.installments} de ${parsed.price}` : undefined,
    imageUrl: "",
    ctaLabel: "Reservar agora",
    isDraft: false,
  } as Pacote;
}
