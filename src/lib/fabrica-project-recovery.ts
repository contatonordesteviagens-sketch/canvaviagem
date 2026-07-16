import type {
  FabricaState,
  PackageAvailability,
  PackageSegment,
  Pacote,
  SiteContent,
} from "@/hooks/useFabricaContext";
import { normalizeSiteTemplateId } from "@/lib/site-template-catalog";

export interface PublishedSiteRecoveryOptions {
  siteId: string;
  siteUrl: string;
}

const MAX_TEXT_LENGTH = 10_000;
const MAX_LIST_ITEMS = 60;

const cleanText = (value: unknown, maxLength = MAX_TEXT_LENGTH) =>
  typeof value === "string"
    ? value.replace(/\s+/g, " ").trim().slice(0, maxLength)
    : "";

const normalizedLabel = (value: unknown) =>
  cleanText(value, 120)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

const safeImageUrl = (value: unknown) => {
  const raw = cleanText(value, 600_000);
  if (!raw) return "";
  if (/^https?:\/\//i.test(raw)) return raw;
  if (/^data:image\/(?:png|jpe?g|webp|gif);(?:base64|charset=)/i.test(raw)) return raw;
  return "";
};

const safeHexColor = (value: unknown) => {
  const raw = cleanText(value, 32);
  const match = raw.match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i);
  if (!match) return "";
  if (match[1].length === 6) return `#${match[1].toUpperCase()}`;
  return `#${match[1]
    .split("")
    .map((character) => character + character)
    .join("")
    .toUpperCase()}`;
};

const textAt = (document: Document, selector: string, maxLength = MAX_TEXT_LENGTH) =>
  cleanText(document.querySelector(selector)?.textContent, maxLength);

const attributeAt = (document: Document, selector: string, attribute: string) =>
  cleanText(document.querySelector(selector)?.getAttribute(attribute), 600_000);

const extractCssVariable = (css: string, variable: string) => {
  const escapedVariable = variable.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = css.match(new RegExp(`${escapedVariable}\\s*:\\s*([^;}]+)`, "i"));
  return safeHexColor(match?.[1]);
};

const extractCssUrl = (declarations: string) => {
  const match = declarations.match(/url\(\s*(["']?)(.*?)\1\s*\)/i);
  return safeImageUrl(match?.[2]);
};

const extractRuleUrl = (css: string, selectorPattern: RegExp) => {
  const flags = selectorPattern.flags.includes("g") ? selectorPattern.flags : `${selectorPattern.flags}g`;
  const pattern = new RegExp(selectorPattern.source, flags);
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(css))) {
    const url = extractCssUrl(match[1] || "");
    if (url) return url;
  }
  return "";
};

const compactDetectedFields = <T extends Record<string, unknown>>(fields: T) =>
  Object.fromEntries(
    Object.entries(fields).filter(([, value]) => {
      if (value === undefined || value === null || value === "") return false;
      if (Array.isArray(value)) return value.length > 0;
      if (typeof value === "object") return Object.keys(value as Record<string, unknown>).length > 0;
      return true;
    }),
  ) as Partial<T>;

/**
 * Extracts a JSON array/object assigned to a JavaScript variable without
 * evaluating any JavaScript. The scanner only returns a balanced JSON value,
 * which is then decoded with JSON.parse.
 */
const extractJsonAssignment = (source: string, variableName: string): unknown => {
  const assignment = new RegExp(`(?:const|let|var)\\s+${variableName}\\s*=`).exec(source);
  if (!assignment) return null;

  let cursor = assignment.index + assignment[0].length;
  while (/\s/.test(source[cursor] || "")) cursor += 1;
  const opening = source[cursor];
  if (opening !== "[" && opening !== "{") return null;

  const closing = opening === "[" ? "]" : "}";
  let depth = 0;
  let inString = false;
  let escaped = false;

  for (let index = cursor; index < source.length; index += 1) {
    const character = source[index];
    if (inString) {
      if (escaped) escaped = false;
      else if (character === "\\") escaped = true;
      else if (character === '"') inString = false;
      continue;
    }

    if (character === '"') {
      inString = true;
      continue;
    }
    if (character === opening) depth += 1;
    else if (character === closing) {
      depth -= 1;
      if (depth === 0) {
        try {
          return JSON.parse(source.slice(cursor, index + 1));
        } catch {
          return null;
        }
      }
    }
  }

  return null;
};

const safeStringArray = (value: unknown) =>
  Array.isArray(value)
    ? value
        .map((item) => cleanText(item, 2_000))
        .filter(Boolean)
        .slice(0, MAX_LIST_ITEMS)
    : [];

const segmentFromLabel = (value: unknown): PackageSegment | undefined => {
  const label = normalizedLabel(value);
  if (label.includes("passeio") || label.includes("receptivo")) return "passeio";
  if (label.includes("sob medida") || label.includes("luxo")) return "sob-medida";
  if (label.includes("grupo") || label.includes("excurs")) return "grupo";
  if (label.includes("cruzeiro")) return "cruzeiro";
  if (label.includes("aventura") || label.includes("ecotur")) return "aventura";
  if (label.includes("relig")) return "religioso";
  if (label.includes("corporat") || label.includes("evento")) return "corporativo";
  if (label.includes("pacote") || label.includes("emissivo")) return "pacote";
  return label ? "outro" : undefined;
};

const availabilityFromLabel = (value: unknown): PackageAvailability | undefined => {
  const label = normalizedLabel(value);
  if (label.includes("ultima") && label.includes("vaga")) return "ultimas-vagas";
  if (label.includes("saida confirmada")) return "saida-confirmada";
  if (label.includes("sob consulta")) return "sob-consulta";
  if (label.includes("lista") && label.includes("espera")) return "lista-de-espera";
  if (label.includes("esgot")) return "esgotado";
  if (label.includes("dispon")) return "disponivel";
  return undefined;
};

const packageFromRecord = (value: unknown, index: number): Pacote | null => {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const record = value as Record<string, unknown>;
  const title = cleanText(record.title, 300);
  if (!title) return null;

  const summary = cleanText(record.summary, 2_000);
  const longDescription = cleanText(record.description, MAX_TEXT_LENGTH);
  const faq = Array.isArray(record.faq)
    ? record.faq
        .map((item) => {
          if (!item || typeof item !== "object" || Array.isArray(item)) return null;
          const faqItem = item as Record<string, unknown>;
          const question = cleanText(faqItem.question, 500);
          const answer = cleanText(faqItem.answer, 3_000);
          return question && answer ? { question, answer } : null;
        })
        .filter((item): item is { question: string; answer: string } => Boolean(item))
        .slice(0, 30)
    : [];

  const galleryImages = Array.isArray(record.galleryImages)
    ? Array.from(new Set(record.galleryImages.map(safeImageUrl).filter(Boolean))).slice(0, 5)
    : [];
  const imageUrl = safeImageUrl(record.imageUrl) || galleryImages[0] || "";

  const pacote: Pacote = {
    id: cleanText(record.id, 160) || `legacy-package-${index + 1}`,
    title,
    description: summary || longDescription,
    price: cleanText(record.price, 300) || "Sob consulta",
    imageUrl,
    slug: cleanText(record.slug, 160) || undefined,
    subtitle: cleanText(record.subtitle, 500) || undefined,
    longDescription: longDescription || undefined,
    priceDetails: cleanText(record.priceDetails, 1_000) || undefined,
    paymentTerms: cleanText(record.paymentTerms, 1_000) || undefined,
    travelDates: cleanText(record.travelDates, 1_000) || undefined,
    duration: cleanText(record.duration, 500) || undefined,
    departureLocation: cleanText(record.departureLocation, 1_000) || undefined,
    meetingPoint: cleanText(record.meetingPoint, 1_000) || undefined,
    accommodation: cleanText(record.accommodation, 2_000) || undefined,
    cancellationPolicy: cleanText(record.cancellationPolicy, 3_000) || undefined,
    importantNotes: cleanText(record.importantNotes, 3_000) || undefined,
    segment: segmentFromLabel(record.category),
    availability: availabilityFromLabel(record.availability),
  };

  const listFields = [
    "highlights",
    "included",
    "notIncluded",
    "itinerary",
    "requirements",
    "documents",
    "accessibility",
  ] as const;
  listFields.forEach((field) => {
    const list = safeStringArray(record[field]);
    if (list.length) pacote[field] = list;
  });
  if (galleryImages.length) pacote.galleryImages = galleryImages;
  if (faq.length) pacote.faq = faq;
  return pacote;
};

const recoverPackages = (document: Document) => {
  let packageRecords: unknown = null;
  for (const script of Array.from(document.querySelectorAll("script"))) {
    const source = script.textContent || "";
    if (!source.includes("PACKAGE_DETAILS")) continue;
    packageRecords = extractJsonAssignment(source, "PACKAGE_DETAILS");
    if (Array.isArray(packageRecords)) break;
  }

  if (Array.isArray(packageRecords)) {
    const recovered = packageRecords
      .slice(0, 100)
      .map(packageFromRecord)
      .filter((item): item is Pacote => Boolean(item));
    if (recovered.length) return recovered;
  }

  return Array.from(document.querySelectorAll<HTMLElement>(".dest-card"))
    .slice(0, 100)
    .map((card, index): Pacote | null => {
      const title = cleanText(card.querySelector("h3")?.textContent, 300);
      if (!title) return null;
      const href = cleanText(card.getAttribute("href"), 160);
      const hrefId = href.match(/^#pacote-(.+)$/i)?.[1];
      return {
        id: hrefId || `legacy-package-${index + 1}`,
        title,
        description: cleanText(card.querySelector(".dest-body p")?.textContent, 2_000),
        price: cleanText(card.querySelector(".dest-price")?.textContent, 300) || "Sob consulta",
        imageUrl: safeImageUrl(card.querySelector("img")?.getAttribute("src")),
        ctaLabel: cleanText(card.querySelector(".dest-cta")?.textContent, 200) || undefined,
      };
    })
    .filter((item): item is Pacote => Boolean(item));
};

const humanizeSlug = (siteId: string) =>
  siteId
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ") || "Site recuperado";

const trimTestimonialQuotes = (value: string) => value.replace(/^["'“”]+|["'“”]+$/g, "").trim();

export const recoverFabricaStateFromPublishedHtml = (
  html: string,
  options: PublishedSiteRecoveryOptions,
): Partial<FabricaState> => {
  const siteUrl = cleanText(options.siteUrl, 2_000);
  const fallbackName = humanizeSlug(cleanText(options.siteId, 160));
  const minimalSnapshot: Partial<FabricaState> = {
    agencyName: fallbackName,
    siteContent: { canvaViagemUrl: siteUrl } as SiteContent,
  };

  if (typeof DOMParser === "undefined" || !html) return minimalSnapshot;

  try {
    // DOMParser creates an inert document. No script content is ever executed;
    // PACKAGE_DETAILS is read as text and decoded exclusively with JSON.parse.
    const document = new DOMParser().parseFromString(html, "text/html");
    const css = Array.from(document.querySelectorAll("style"))
      .map((style) => style.textContent || "")
      .join("\n");

    const agencyName =
      textAt(document, ".brand-name", 300) ||
      textAt(document, ".foot-brand", 300) ||
      cleanText(document.title.split(/\s+[—|-]\s+/)[0], 300) ||
      fallbackName;
    const logoBase64 = safeImageUrl(attributeAt(document, ".brand-logo", "src"));
    const selectedPackages = recoverPackages(document);

    const depoimentos = Array.from(document.querySelectorAll(".depo-card"))
      .slice(0, 20)
      .map((card) => ({
        name: cleanText(card.querySelector(".depo-name")?.textContent, 300),
        text: trimTestimonialQuotes(cleanText(card.querySelector(".depo-text")?.textContent, 3_000)),
      }))
      .filter((item) => item.name && item.text);

    const faq = Array.from(document.querySelectorAll(".faq-item"))
      .slice(0, 30)
      .map((item) => ({
        q: cleanText(item.querySelector("summary")?.textContent, 500),
        a: cleanText(item.querySelector("p")?.textContent, 3_000),
      }))
      .filter((item) => item.q && item.a);

    const sections = {
      hero: Boolean(document.querySelector("#inicio.hero, section#inicio")),
      processo: Boolean(document.querySelector("section#processo")),
      destinos: Boolean(document.querySelector("section#destinos")),
      porQue: Boolean(document.querySelector("section#por-que")),
      depoimentos: Boolean(document.querySelector("section.depo-bg, section#depoimentos")),
      orcamento: Boolean(document.querySelector("section#orcamento:not([data-package-reservation-only])")),
      faq: Boolean(document.querySelector("section#faq")),
      finalCta: Boolean(document.querySelector("section.final-cta, section#final-cta")),
    };

    const sectionOrder: FabricaState["sectionOrder"] = [];
    const sectionName = (element: Element) => {
      if (element.id === "inicio" || element.classList.contains("hero")) return "hero";
      if (element.id === "processo") return "processo";
      if (element.id === "destinos") return "destinos";
      if (element.id === "por-que") return "porQue";
      if (element.classList.contains("depo-bg") || element.id === "depoimentos") return "depoimentos";
      if (element.id === "orcamento" && !element.hasAttribute("data-package-reservation-only")) return "orcamento";
      if (element.id === "faq") return "faq";
      if (element.classList.contains("final-cta") || element.id === "final-cta") return "finalCta";
      return "";
    };
    Array.from(document.querySelectorAll("body > section")).forEach((section) => {
      const name = sectionName(section);
      if (name && !sectionOrder.includes(name)) sectionOrder.push(name);
    });

    const sectionColors: Record<string, string> = {};
    Array.from(document.querySelectorAll<HTMLElement>("[data-site-section]")).forEach((element) => {
      const section = cleanText(element.dataset.siteSection, 80);
      const color = safeHexColor(element.style.getPropertyValue("--section-bg"));
      if (section && color) sectionColors[section] = color;
    });

    const processSteps = Array.from(document.querySelectorAll(".proc-card"))
      .slice(0, 12)
      .map((card) => ({
        num: cleanText(card.querySelector(".proc-num")?.textContent, 40),
        title: cleanText(card.querySelector("h3")?.textContent, 300),
        desc: cleanText(card.querySelector("p")?.textContent, 2_000),
      }))
      .filter((step) => step.title || step.desc);
    const equipeFeatures = Array.from(document.querySelectorAll(".equipe-features .feat"))
      .slice(0, 12)
      .map((feature) => ({
        icon: cleanText(feature.querySelector(".feat-icon")?.textContent, 40),
        title: cleanText(feature.querySelector("h4")?.textContent, 300),
        desc: cleanText(feature.querySelector("p")?.textContent, 2_000),
      }))
      .filter((feature) => feature.title || feature.desc);
    const stats = Array.from(document.querySelectorAll(".stats-bar > div"))
      .slice(0, 12)
      .map((stat) => ({
        num: cleanText(stat.querySelector(".stat-num")?.textContent, 80),
        label: cleanText(stat.querySelector(".stat-label")?.textContent, 300),
      }))
      .filter((stat) => stat.num || stat.label);

    const editableText = (key: string, maxLength = MAX_TEXT_LENGTH) =>
      textAt(document, `[data-site-edit-key="${key}"]`, maxLength);
    const recognizedSectionCount = Object.values(sections).filter(Boolean).length;
    const sectionsAreReliable = Boolean(document.body?.dataset.siteTemplate) || recognizedSectionCount >= 2;
    const rawSiteContent: Partial<SiteContent> = {
      templateId: normalizeSiteTemplateId(document.body?.dataset.siteTemplate),
      canvaViagemUrl: siteUrl,
      ...(sectionsAreReliable ? { sections } : {}),
      ...(Object.keys(sectionColors).length ? { sectionColors } : {}),
      heroHeadline: textAt(document, "#inicio h1", 1_000),
      heroSubheadline: textAt(document, "#inicio .lead", 3_000),
      heroCtaLabel: textAt(document, "#inicio .hero-actions .btn:not(.btn-outline)", 300),
      heroSecondaryCtaLabel: textAt(document, "#inicio .hero-actions .btn-outline", 300),
      heroEyebrow: textAt(document, "#inicio .eyebrow", 300),
      heroImageUrl: extractRuleUrl(css, /\.hero::before\s*\{([^}]*)\}/i),
      navHomeLabel: editableText("navHomeLabel", 200),
      navDestinationsLabel: editableText("navDestinationsLabel", 200),
      navAboutLabel: editableText("navAboutLabel", 200),
      navBudgetLabel: editableText("navBudgetLabel", 200),
      navWhatsAppLabel: editableText("navWhatsAppLabel", 200),
      packageOverlayLabel: editableText("packageOverlayLabel", 200),
      processoEyebrow: textAt(document, "#processo .section-eyebrow", 300),
      processoTitle: textAt(document, "#processo .section-title", 1_000),
      processoSteps: processSteps,
      destinosEyebrow: textAt(document, "#destinos .section-eyebrow", 300),
      pacotesTitle: textAt(document, "#destinos .section-title", 1_000),
      equipeBadge: textAt(document, "#por-que .badge-counter", 300),
      equipeEyebrow: textAt(document, "#por-que .eyebrow", 300),
      equipeTitle: textAt(document, "#por-que h2", 1_000),
      equipeIntro: textAt(document, "#por-que .intro", 3_000),
      equipeFeatures,
      equipeCtaLabel: textAt(document, "#por-que .btn", 300),
      aboutImageUrl: extractCssUrl(attributeAt(document, "#por-que .equipe-img", "style")),
      depoimentosEyebrow: editableText("depoimentosEyebrow", 300),
      depoimentosTitle: textAt(document, ".depo-bg .section-title", 1_000),
      depoVerifiedLabel: editableText("depoVerifiedLabel", 300),
      orcamentoEyebrow: textAt(document, "#orcamento:not([data-package-reservation-only]) .orc-info .eyebrow", 300),
      orcamentoTitle: textAt(document, "#orcamento:not([data-package-reservation-only]) .orc-info h2", 1_000),
      orcamentoText: textAt(document, "#orcamento:not([data-package-reservation-only]) .orc-info > p", 3_000),
      atendimentoText: textAt(document, '[data-site-edit-key="contactHoursLabel"] + span', 500),
      formSubmitLabel: textAt(document, ".orc-form .form-submit", 300),
      faqEyebrow: editableText("faqEyebrow", 300),
      faqTitle: textAt(document, "#faq .section-title", 1_000),
      faq,
      finalCtaTitle: textAt(document, ".final-cta h2", 1_000),
      finalCtaLabel: textAt(document, ".final-cta .btn", 300),
      footerText: textAt(document, ".foot-desc", 3_000),
      footerDestinationsTitle: editableText("footerDestinationsTitle", 300),
      footerCompanyTitle: editableText("footerCompanyTitle", 300),
      footerContactTitle: editableText("footerContactTitle", 300),
      footerAboutLabel: editableText("footerAboutLabel", 300),
      footerProcessLabel: editableText("footerProcessLabel", 300),
      footerTestimonialsLabel: editableText("footerTestimonialsLabel", 300),
      footerContactLabel: editableText("footerContactLabel", 300),
      footerHoursLabel: editableText("footerHoursLabel", 500),
      footerCopyrightText: editableText("footerCopyrightText", 1_000),
      footerCreditPrefix: editableText("footerCreditPrefix", 500),
      mapEyebrow: editableText("mapEyebrow", 300),
      mapTitle: editableText("mapTitle", 1_000),
      stats,
    };
    const siteContent = compactDetectedFields(rawSiteContent) as Partial<SiteContent>;

    const primaryColor = extractCssVariable(css, "--brand");
    const secondaryColor = extractCssVariable(css, "--brand-secondary");
    const backgroundColor = extractCssVariable(css, "--brand-bg");
    const whatsapp = textAt(document, '[data-site-contact="whatsapp"]', 100).replace(/\D/g, "");
    const agencyEmail = textAt(document, '[data-site-contact="email"]', 500);
    const address = textAt(document, '[data-site-contact="address"]', 1_000);

    const recovered: Partial<FabricaState> = {
      agencyName,
      siteContent: siteContent as SiteContent,
    };
    if (selectedPackages.length) recovered.selectedPackages = selectedPackages;
    if (depoimentos.length) recovered.depoimentos = depoimentos;
    if (logoBase64) recovered.logoBase64 = logoBase64;
    if (primaryColor) recovered.primaryColor = primaryColor;
    if (secondaryColor) recovered.secondaryColor = secondaryColor;
    if (backgroundColor) recovered.backgroundColor = backgroundColor;
    if (whatsapp) recovered.whatsapp = whatsapp;
    if (agencyEmail) recovered.agencyEmail = agencyEmail;
    if (address) recovered.address = address;
    if (sectionOrder.length) recovered.sectionOrder = sectionOrder;
    return recovered;
  } catch {
    return minimalSnapshot;
  }
};
