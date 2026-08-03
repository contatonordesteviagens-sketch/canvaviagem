import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type CSSProperties,
} from "react";
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  AlertTriangle,
  ArrowDownLeft,
  ArrowDownRight,
  ArrowUpLeft,
  ArrowUpRight,
  Check,
  ChevronLeft,
  ChevronRight,
  Download,
  Eye,
  EyeOff,
  ImagePlus,
  Instagram,
  LayoutGrid,
  Lock,
  Mail,
  Maximize2,
  RefreshCw,
  Rows,
  Search,
  Smartphone,
  Square,
  Sparkles,
  Upload,
  X,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { toast } from "sonner";
import { FabricaPaywallDialog } from "@/components/fabrica/FabricaPaywallDialog";
import { useAuth } from "@/contexts/AuthContext";
import { useEntitlements } from "@/contexts/EntitlementsContext";
import { useFabricaContext, type Pacote } from "@/hooks/useFabricaContext";
import { supabase } from "@/integrations/supabase/client";
import { createExportIdentity } from "@/lib/exportIdentity";

type CarouselSize = 3 | 4 | 5 | 6;
type CarouselFormat = "feed" | "story";
type CarouselSlideKind = "cover" | "content" | "closing";
type CarouselContactChannel = "whatsapp" | "instagram" | "email";
type LogoPosition = "top-left" | "top-right" | "bottom-left" | "bottom-right";
type CarouselSlideVariant =
  | "impact"
  | "itinerary"
  | "editorial"
  | "oferta"
  | "minimalist"
  | "vibrant"
  | "organic"
  | "glass"
  | "headline"
  | "headline-center"
  | "headline-footer"
  | "ticket";
type LabelStyle =
  | "filled"
  | "outline-thin"
  | "outline-thick"
  | "stripe-left"
  | "line-top"
  | "line-bottom"
  | "rectangle"
  | "translucent"
  | "gradient";
type LabelAlignment = "auto" | "left" | "center" | "right";

function SealStyleGlyph({ style }: { style: LabelStyle }) {
  const base = "relative block h-3.5 w-6 text-current";
  if (style === "stripe-left") {
    return <span className={`${base} border-l-2 border-current bg-current/10`} />;
  }
  if (style === "line-top" || style === "line-bottom") {
    return (
      <span className={base}>
        <span className={`absolute inset-x-0 ${style === "line-top" ? "top-0" : "bottom-0"} h-0.5 bg-current`} />
      </span>
    );
  }
  if (style === "outline-thin" || style === "outline-thick") {
    return <span className={`${base} rounded-full border-current ${style === "outline-thick" ? "border-2" : "border"}`} />;
  }
  return (
    <span
      className={`${base} ${style === "rectangle" ? "rounded-sm" : "rounded-full"} ${
        style === "translucent" ? "bg-current/35" : "bg-current"
      }`}
      style={style === "gradient" ? { background: "linear-gradient(90deg,currentColor,transparent)" } : undefined}
    />
  );
}

const CAROUSEL_VARIANTS: CarouselSlideVariant[] = [
  "impact",
  "itinerary",
  "editorial",
  "oferta",
  "minimalist",
  "vibrant",
  "organic",
  "glass",
  "headline",
  "headline-center",
  "headline-footer",
  "ticket",
];

interface FieldTypography {
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  color?: string;
}

interface CarouselSlide {
  id: string;
  kind: CarouselSlideKind;
  label: string;
  title: string;
  body: string;
  bullets: string[];
  imageUrl: string;
  textColor: string;
  cta: string;
  phone: string;
  slideVariant: CarouselSlideVariant;
  bulletIcon: string;
  showShadow?: boolean;
  labelStyle?: LabelStyle;
  labelAlignment?: LabelAlignment;
  contentAlignment?: LabelAlignment;
  labelColor?: string;
  labelTextColor?: string;
  fontFamily?: string;
  fontWeight?: "normal" | "bold";
  fontStyle?: "normal" | "italic";
  textDecoration?: "none" | "underline";
  instagram?: string;
  email?: string;
  website?: string;
  contactChannels?: CarouselContactChannel[];
  titleStyle?: FieldTypography;
  bodyStyle?: FieldTypography;
  bulletStyle?: FieldTypography;
  coverSource?: "ad" | "native";
}

interface PhotoResult {
  id: string | number;
  url: string;
  thumb: string;
  alt: string;
}

interface F1CarouselBuilderProps {
  sourceImage?: string;
  locale?: "pt" | "es";
  onNext?: () => void;
  onBackToAd?: () => void;
}

const CAROUSEL_RATIOS: Record<CarouselFormat, number> = {
  feed: 4 / 5,
  story: 9 / 16,
};

const createId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `slide_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

const compact = (values: Array<string | undefined>) =>
  values.map((value) => (value || "").trim()).filter(Boolean);

const uniqueImages = (values: Array<string | undefined>) =>
  Array.from(new Set(values.map((value) => (value || "").trim()).filter(Boolean)));

const isUserUploadedImage = (value = "") =>
  value.startsWith("data:") ||
  value.startsWith("blob:") ||
  /\/storage\/v1\/object\/public\/thumbnails\/sites\//i.test(value);

const cleanCarouselText = (value = "") =>
  value
    .replace(/^[\p{Extended_Pictographic}\uFE0F\u200D\sâ€¢âœ“âœ”â˜‘â–ªâ–«â– â–¡âžœâ†’\-*]+/gu, "")
    .replace(/\s+/g, " ")
    .trim();

const splitBalancedHeadline = (value: string, maxLines = 3) => {
  const words = cleanCarouselText(value).split(/\s+/).filter(Boolean);
  if (!words.length) return [];

  const characterCount = words.join(" ").length;
  const lineCount = Math.min(maxLines, characterCount > 28 ? 3 : characterCount > 15 ? 2 : 1);
  const lines: string[] = [];
  let cursor = 0;

  for (let lineIndex = 0; lineIndex < lineCount; lineIndex += 1) {
    const wordsLeft = words.length - cursor;
    const linesLeft = lineCount - lineIndex;
    const targetLength = Math.ceil(
      words.slice(cursor).join(" ").length / Math.max(1, linesLeft),
    );
    const lineWords: string[] = [];

    while (cursor < words.length) {
      const candidate = [...lineWords, words[cursor]].join(" ");
      const mustLeave = linesLeft - 1;
      if (
        lineWords.length &&
        candidate.length > targetLength &&
        wordsLeft - lineWords.length > mustLeave
      ) {
        break;
      }
      lineWords.push(words[cursor]);
      cursor += 1;
    }
    lines.push(lineWords.join(" "));
  }

  if (cursor < words.length) {
    lines[lines.length - 1] = `${lines[lines.length - 1]} ${words.slice(cursor).join(" ")}`;
  }
  return lines.filter(Boolean);
};

const readableText = (hex: string) => {
  const light = "#F8FAFC";
  const dark = "#111318";
  return contrastRatio(dark, hex) >= contrastRatio(light, hex) ? dark : light;
};

const colorLuminance = (hex: string) => {
  const normalized = hex.replace("#", "");
  if (!/^[0-9a-f]{6}$/i.test(normalized)) return 0;
  const channels = [0, 2, 4].map((index) => {
    const channel = Number.parseInt(normalized.slice(index, index + 2), 16) / 255;
    return channel <= 0.03928
      ? channel / 12.92
      : ((channel + 0.055) / 1.055) ** 2.4;
  });
  return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722;
};

const contrastRatio = (foreground: string, background: string) => {
  const lighter = Math.max(colorLuminance(foreground), colorLuminance(background));
  const darker = Math.min(colorLuminance(foreground), colorLuminance(background));
  return (lighter + 0.05) / (darker + 0.05);
};

const readableGradientText = (start: string, end: string) => {
  const light = "#F8FAFC";
  const dark = "#111318";
  const lightScore = Math.min(contrastRatio(light, start), contrastRatio(light, end));
  const darkScore = Math.min(contrastRatio(dark, start), contrastRatio(dark, end));
  return darkScore >= lightScore ? dark : light;
};

const editableColor = (preferred: string | undefined, fallback: string) =>
  preferred && /^#[0-9a-f]{6}$/i.test(preferred) ? preferred : fallback;

const mixHexColor = (source: string, target: string, targetWeight: number) => {
  const parse = (value: string) => {
    const normalized = value.replace("#", "");
    return [0, 2, 4].map((index) =>
      Number.parseInt(normalized.slice(index, index + 2), 16),
    );
  };
  const sourceChannels = parse(source);
  const targetChannels = parse(target);
  const weight = Math.max(0, Math.min(1, targetWeight));
  return `#${sourceChannels
    .map((channel, index) =>
      Math.round(channel * (1 - weight) + targetChannels[index] * weight)
        .toString(16)
        .padStart(2, "0"),
    )
    .join("")}`;
};

const isHeadlineVariant = (variant: CarouselSlideVariant) =>
  variant === "headline" ||
  variant === "headline-center" ||
  variant === "headline-footer";

const defaultContentTextColor = (variant: CarouselSlideVariant, primary: string) => {
  if (
    variant === "editorial" ||
    variant === "minimalist" ||
    variant === "organic" ||
    variant === "ticket"
  ) {
    return "#17191D";
  }
  if (variant === "vibrant") return readableText(primary);
  return "#F8FAFC";
};

const usesLightContentPanel = (variant: CarouselSlideVariant) =>
  variant === "editorial" ||
  variant === "minimalist" ||
  variant === "organic" ||
  variant === "ticket";

const carryFieldTypography = (
  style: FieldTypography | undefined,
  fromVariant: CarouselSlideVariant,
  toVariant: CarouselSlideVariant,
) => {
  const needsColorReset =
    fromVariant === "vibrant" ||
    toVariant === "vibrant" ||
    usesLightContentPanel(fromVariant) !== usesLightContentPanel(toVariant);
  if (!style || !needsColorReset) {
    return style;
  }
  const { color: _discardedColor, ...typography } = style;
  return typography;
};

const normalizeName = (value = "") =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();

const carouselCaption = (pacote: Pacote, brand: string, phone: string, isEs: boolean) => {
  const details = compact([...(pacote.highlights || []), ...(pacote.included || [])])
    .map(cleanCarouselText)
    .filter(Boolean)
    .slice(0, 5);
  const destinationTag = normalizeName(pacote.title).replace(/[^a-z0-9]+/g, "");
  const lines = isEs
    ? [
        `Â¿Listo para vivir ${pacote.title}?`,
        pacote.description || "Preparamos una experiencia completa para que disfrutes cada momento.",
        ...details.map((item) => `â€¢ ${item}`),
        pacote.price ? `InversiÃ³n: ${pacote.price}` : "",
        phone ? `Habla con ${brand} por WhatsApp: ${phone}` : `Habla con ${brand} y reserva tu viaje.`,
        `#viajes #${destinationTag} #turismo #vacaciones`,
      ]
    : [
        `Pronto para viver ${pacote.title}?`,
        pacote.description || "Preparamos uma experiÃªncia completa para vocÃª aproveitar cada momento.",
        ...details.map((item) => `â€¢ ${item}`),
        pacote.price ? `Investimento: ${pacote.price}` : "",
        phone ? `Fale com a ${brand} pelo WhatsApp: ${phone}` : `Fale com a ${brand} e reserve sua viagem.`,
        `#viagem #${destinationTag} #turismo #ferias`,
      ];
  return lines.filter(Boolean).join("\n\n");
};

const safeHexToRgba = (hex: string, alpha: number) => {
  let normalized = (hex || "").replace("#", "").trim();
  if (/^[0-9a-f]{3}$/i.test(normalized)) {
    normalized = normalized.split("").map((c) => c + c).join("");
  }
  if (!/^[0-9a-f]{6}$/i.test(normalized)) return `rgba(15, 15, 17, ${alpha})`;
  const [red, green, blue] = [0, 2, 4].map((index) =>
    Number.parseInt(normalized.slice(index, index + 2), 16),
  );
  return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
};

const phoneLabel = (dialCode: string, phone: string) => {
  const dial = dialCode.replace(/\D/g, "");
  const number = phone.replace(/\D/g, "");
  if (!number) return "";
  return `+${dial || "55"} ${number}`;
};

function coverTitleSuggestions(pacote: Pacote, isEs: boolean): string[] {
  const destination =
    cleanCarouselText(pacote.title).replace(/^(pacote|paquete)\s+/i, "") ||
    (isEs ? "tu prÃ³ximo destino" : "seu prÃ³ximo destino");
  const suggestions = isEs
    ? [
        `Descubre ${destination}`,
        `${destination}: el viaje que mereces`,
        `Tu prÃ³xima historia comienza en ${destination}`,
        `Vive dÃ­as inolvidables en ${destination}`,
        `${destination} como siempre lo soÃ±aste`,
      ]
    : [
        `Descubra ${destination}`,
        `${destination}: a viagem que vocÃª merece`,
        `Sua prÃ³xima histÃ³ria comeÃ§a em ${destination}`,
        `Viva dias inesquecÃ­veis em ${destination}`,
        `${destination} do jeito que vocÃª sempre sonhou`,
      ];

  return suggestions.map((title) =>
    title.length > 80 ? `${title.slice(0, 77).replace(/\s+\S*$/, "")}...` : title,
  );
}

function contentPresets(
  pacote: Pacote,
  isEs: boolean,
  strategy: CarouselSlideVariant = "impact",
) {
  const destination = cleanCarouselText(pacote.title);
  const highlights = compact(pacote.highlights || []).map(cleanCarouselText).filter(Boolean);
  const included = compact(pacote.included || []).map(cleanCarouselText).filter(Boolean);
  const itinerary = compact(pacote.itinerary || []).map(cleanCarouselText).filter(Boolean);
  const planning = compact([
    pacote.travelDates && `${isEs ? "Fechas" : "Datas"}: ${pacote.travelDates}`,
    pacote.duration && `${isEs ? "DuraciÃ³n" : "DuraÃ§Ã£o"}: ${pacote.duration}`,
    pacote.departureLocation && `${isEs ? "Salida" : "SaÃ­da"}: ${pacote.departureLocation}`,
    pacote.accommodation && `${isEs ? "Alojamiento" : "Hospedagem"}: ${pacote.accommodation}`,
    pacote.price && `${isEs ? "Valor" : "Valor"}: ${pacote.price}`,
    pacote.paymentTerms && `${isEs ? "Pago" : "Pagamento"}: ${pacote.paymentTerms}`,
  ]);

  const cleanBody = (s: string | undefined, maxLen = 140) => {
    if (!s) return "";
    const cleaned = cleanCarouselText(s);
    if (cleaned.length <= maxLen) return cleaned;
    return cleaned.slice(0, maxLen).replace(/\s+\S*$/, "") + "...";
  };

  const hasIncludedItems = included.length > 0;
  const packageFacts = (hasIncludedItems ? included : highlights).slice(0, 5);
  const logistics = planning.map(cleanCarouselText).filter(Boolean).slice(0, 5);
  const route = (itinerary.length ? itinerary : highlights).slice(0, 5);
  const description = cleanBody(pacote.longDescription || pacote.description, 150);
  const shortDescription = cleanBody(pacote.description || pacote.subtitle, 110);
  const priceAndTerms = compact([pacote.price, pacote.paymentTerms]).map(cleanCarouselText);

  const strategies: Partial<Record<CarouselSlideVariant, Array<{
    label: string;
    title: string;
    body: string;
    bullets: string[];
  }>>> = {
    impact: [
      {
        label: isEs ? "InspÃ­rate" : "Imagine-se aqui",
        title: destination,
        body: description || (isEs ? "Un viaje para salir de la rutina y coleccionar buenos recuerdos." : "Uma viagem para sair da rotina e colecionar boas memÃ³rias."),
        bullets: highlights.slice(0, 3),
      },
      {
        label: isEs ? "La experiencia" : "O que vocÃª vai viver",
        title: pacote.subtitle ? cleanCarouselText(pacote.subtitle) : (isEs ? "DÃ­as para recordar" : "Dias para lembrar"),
        body: shortDescription,
        bullets: route.slice(0, 4),
      },
      {
        label: hasIncludedItems
          ? (isEs ? "Todo organizado" : "Tudo organizado")
          : (isEs ? "Destacados del viaje" : "Destaques da viagem"),
        title: hasIncludedItems
          ? (isEs ? "Viaja con mÃ¡s tranquilidad" : "Viaje com mais tranquilidade")
          : (isEs ? "QuÃ© hace especial este viaje" : "O que torna esta viagem especial"),
        body: cleanBody(pacote.importantNotes, 100),
        bullets: packageFacts,
      },
      {
        label: isEs ? "Tu prÃ³xima historia" : "Sua prÃ³xima histÃ³ria",
        title: isEs ? `Â¿Nos vemos en ${destination}?` : `Nos vemos em ${destination}?`,
        body: isEs ? "Guarda este post y habla con nuestro equipo cuando quieras planificar." : "Salve este post e fale com nossa equipe quando quiser planejar.",
        bullets: priceAndTerms,
      },
    ],
    itinerary: [
      {
        label: isEs ? "Ruta resumida" : "Roteiro resumido",
        title: isEs ? `AsÃ­ serÃ¡ ${destination}` : `Assim serÃ¡ ${destination}`,
        body: shortDescription,
        bullets: route,
      },
      {
        label: hasIncludedItems
          ? (isEs ? "Incluido" : "O que estÃ¡ incluÃ­do")
          : (isEs ? "Destacados" : "Destaques"),
        title: hasIncludedItems
          ? (isEs ? "Lo esencial ya estÃ¡ previsto" : "O essencial jÃ¡ estÃ¡ previsto")
          : (isEs ? "QuÃ© vale la pena conocer" : "O que vale a pena conhecer"),
        body: "",
        bullets: packageFacts,
      },
      {
        label: isEs ? "OrganÃ­zate" : "Para se organizar",
        title: isEs ? "Fechas y logÃ­stica" : "Datas e logÃ­stica",
        body: cleanBody(pacote.importantNotes, 100),
        bullets: logistics,
      },
      {
        label: isEs ? "PrÃ³ximo paso" : "PrÃ³ximo passo",
        title: isEs ? "Solicita el itinerario completo" : "PeÃ§a o roteiro completo",
        body: isEs ? "Habla con la agencia y confirma todos los detalles antes de reservar." : "Fale com a agÃªncia e confirme todos os detalhes antes de reservar.",
        bullets: priceAndTerms,
      },
    ],
    editorial: [
      {
        label: isEs ? "GuÃ­a rÃ¡pida" : "Guia rÃ¡pido",
        title: isEs ? `Lo mejor de ${destination}` : `O melhor de ${destination}`,
        body: description,
        bullets: highlights.slice(0, 3),
      },
      {
        label: isEs ? "Experiencias" : "ExperiÃªncias",
        title: isEs ? "QuÃ© vale la pena vivir" : "O que vale a pena viver",
        body: "",
        bullets: route,
      },
      {
        label: isEs ? "Consejo para planificar" : "Dica para planejar",
        title: isEs ? "Planifica sin improvisar" : "Planeje sem improviso",
        body: cleanBody(pacote.importantNotes, 120) || (isEs ? "Confirma fechas, disponibilidad y condiciones con el equipo antes de reservar." : "Confirme datas, disponibilidade e condiÃ§Ãµes com a equipe antes de reservar."),
        bullets: logistics.slice(0, 3),
      },
      {
        label: isEs ? "GuÃ¡rdalo" : "Salve para consultar",
        title: isEs ? "Tu guÃ­a empieza aquÃ­" : "Seu planejamento comeÃ§a aqui",
        body: isEs ? "Comparte con quien viajarÃ­a contigo." : "Compartilhe com quem viajaria com vocÃª.",
        bullets: packageFacts.slice(0, 3),
      },
    ],
    oferta: [
      {
        label: isEs ? "Oferta del viaje" : "Oferta da viagem",
        title: destination,
        body: pacote.price ? `${isEs ? "Desde" : "A partir de"} ${cleanCarouselText(pacote.price)}` : shortDescription,
        bullets: packageFacts.slice(0, 4),
      },
      {
        label: hasIncludedItems
          ? (isEs ? "Tu paquete" : "Seu pacote")
          : (isEs ? "Destacados" : "Destaques"),
        title: hasIncludedItems
          ? (isEs ? "QuÃ© recibes al reservar" : "O que vocÃª recebe ao reservar")
          : (isEs ? "QuÃ© hace especial este viaje" : "O que torna esta viagem especial"),
        body: "",
        bullets: packageFacts,
      },
      {
        label: isEs ? "Condiciones" : "CondiÃ§Ãµes",
        title: isEs ? "Planifica tu inversiÃ³n" : "Planeje seu investimento",
        body: cleanBody(pacote.paymentTerms, 110),
        bullets: logistics,
      },
      {
        label: isEs ? "Cotiza ahora" : "Solicite sua cotaÃ§Ã£o",
        title: isEs ? "Confirma valor y disponibilidad" : "Confirme valor e disponibilidade",
        body: isEs ? "Habla por WhatsApp y recibe la informaciÃ³n actualizada." : "Fale pelo WhatsApp e receba as informaÃ§Ãµes atualizadas.",
        bullets: priceAndTerms,
      },
    ],
    minimalist: [
      {
        label: isEs ? "Viaja tranquilo" : "Viaje tranquilo",
        title: isEs ? "Menos preocupaciÃ³n. MÃ¡s viaje." : "Menos preocupaÃ§Ã£o. Mais viagem.",
        body: description,
        bullets: packageFacts.slice(0, 3),
      },
      {
        label: isEs ? "Conveniencia" : "Praticidade",
        title: isEs ? "Lo importante ya organizado" : "O importante jÃ¡ organizado",
        body: "",
        bullets: logistics.length ? logistics : packageFacts,
      },
      {
        label: isEs ? "Soporte" : "Apoio",
        title: isEs ? "InformaciÃ³n antes de decidir" : "InformaÃ§Ã£o antes de decidir",
        body: cleanBody(pacote.importantNotes, 120),
        bullets: route.slice(0, 3),
      },
      {
        label: isEs ? "Habla con la agencia" : "Fale com a agÃªncia",
        title: isEs ? "Aclara tus dudas antes de decidir" : "Tire suas dÃºvidas antes de decidir",
        body: isEs ? "Solicita valores, disponibilidad y condiciones actualizadas." : "Solicite valores, disponibilidade e condiÃ§Ãµes atualizadas.",
        bullets: priceAndTerms,
      },
    ],
    vibrant: [
      {
        label: isEs ? "Antes de reservar" : "Antes de reservar",
        title: isEs ? `Lo que debes saber sobre ${destination}` : `O que saber sobre ${destination}`,
        body: shortDescription,
        bullets: logistics.slice(0, 3),
      },
      {
        label: hasIncludedItems
          ? (isEs ? "Â¿QuÃ© incluye?" : "O que inclui?")
          : (isEs ? "Destacados" : "Destaques"),
        title: hasIncludedItems
          ? (isEs ? "Revisa los elementos del paquete" : "Confira os itens do pacote")
          : (isEs ? "Conoce los destacados del viaje" : "ConheÃ§a os destaques da viagem"),
        body: "",
        bullets: packageFacts,
      },
      {
        label: isEs ? "Pago y fechas" : "Pagamento e datas",
        title: isEs ? "Confirma antes de decidir" : "Confirme antes de decidir",
        body: cleanBody(pacote.paymentTerms, 100),
        bullets: logistics,
      },
      {
        label: isEs ? "Â¿Tienes dudas?" : "Ficou com dÃºvidas?",
        title: isEs ? "Habla con nuestro equipo" : "Fale com nossa equipe",
        body: isEs ? "Recibe valores, disponibilidad y condiciones actualizadas por WhatsApp." : "Receba valores, disponibilidade e condiÃ§Ãµes atualizadas pelo WhatsApp.",
        bullets: priceAndTerms,
      },
    ],
    organic: [
      {
        label: isEs ? "Viaja a tu ritmo" : "Viaje no seu ritmo",
        title: destination,
        body: description || (isEs ? "Una experiencia pensada para disfrutar sin prisa." : "Uma experiÃªncia pensada para aproveitar sem pressa."),
        bullets: highlights.slice(0, 3),
      },
      {
        label: isEs ? "Momentos que quedan" : "Momentos que ficam",
        title: isEs ? "Una experiencia con tu manera de viajar" : "Uma experiÃªncia com o seu jeito de viajar",
        body: shortDescription,
        bullets: route.slice(0, 4),
      },
      {
        label: isEs ? "Todo mÃ¡s ligero" : "Tudo mais leve",
        title: isEs ? "Lo esencial ya estÃ¡ organizado" : "O essencial jÃ¡ estÃ¡ organizado",
        body: cleanBody(pacote.importantNotes, 100),
        bullets: packageFacts,
      },
      {
        label: isEs ? "Guarda esta idea" : "Guarde esta ideia",
        title: isEs ? `Tu prÃ³xima pausa puede ser ${destination}` : `Sua prÃ³xima pausa pode ser ${destination}`,
        body: isEs ? "Comparte con quien viajarÃ­a contigo." : "Compartilhe com quem viajaria com vocÃª.",
        bullets: priceAndTerms,
      },
    ],
    glass: [
      {
        label: isEs ? "Mira con calma" : "Veja com calma",
        title: isEs ? `Descubre ${destination}` : `Descubra ${destination}`,
        body: description,
        bullets: highlights.slice(0, 3),
      },
      {
        label: isEs ? "Lo que importa" : "O que importa",
        title: isEs ? "Una visiÃ³n clara de tu viaje" : "Uma visÃ£o clara da sua viagem",
        body: shortDescription,
        bullets: packageFacts,
      },
      {
        label: isEs ? "Antes de decidir" : "Antes de decidir",
        title: isEs ? "Fechas, condiciones y detalles" : "Datas, condiÃ§Ãµes e detalhes",
        body: cleanBody(pacote.importantNotes, 110),
        bullets: logistics,
      },
      {
        label: isEs ? "Siguiente paso" : "PrÃ³ximo passo",
        title: isEs ? "Habla con quien conoce el destino" : "Fale com quem conhece o destino",
        body: isEs ? "Recibe informaciÃ³n actualizada por WhatsApp." : "Receba informaÃ§Ãµes atualizadas pelo WhatsApp.",
        bullets: priceAndTerms,
      },
    ],
    headline: [
      {
        label: isEs ? "Tu prÃ³ximo destino" : "Seu prÃ³ximo destino",
        title: isEs ? `Â¿Pensando en viajar a ${destination}?` : `Pensando em viajar para ${destination}?`,
        body:
          description ||
          (isEs
            ? "Descubre lo esencial antes de preparar tu viaje."
            : "Confira o que vocÃª precisa saber antes de preparar sua viagem."),
        bullets: highlights.slice(0, 3),
      },
      {
        label: isEs ? "La experiencia" : "A experiÃªncia",
        title: isEs ? "Lo que hace este viaje inolvidable" : "O que torna esta viagem inesquecÃ­vel",
        body: shortDescription,
        bullets: route.slice(0, 4),
      },
      {
        label: isEs ? "Viaja preparado" : "Viaje preparado",
        title: isEs ? "Todo lo importante en un solo lugar" : "Tudo o que importa em um sÃ³ lugar",
        body: cleanBody(pacote.importantNotes, 110),
        bullets: logistics.length ? logistics : packageFacts,
      },
      {
        label: isEs ? "Guarda esta idea" : "Salve esta ideia",
        title: isEs ? `Tu historia puede comenzar en ${destination}` : `Sua histÃ³ria pode comeÃ§ar em ${destination}`,
        body:
          isEs
            ? "Comparte con quien vivirÃ­a esta experiencia contigo."
            : "Compartilhe com quem viveria essa experiÃªncia com vocÃª.",
        bullets: priceAndTerms,
      },
    ],
    ticket: [
      {
        label: isEs ? "Tarjeta de embarque" : "CartÃ£o de embarque",
        title: destination,
        body:
          shortDescription ||
          (isEs ? "Tu viaje empieza con una buena planificaciÃ³n." : "Sua viagem comeÃ§a com um bom planejamento."),
        bullets: compact([pacote.duration, pacote.travelDates, pacote.departureLocation])
          .map(cleanCarouselText)
          .filter(Boolean),
      },
      {
        label: isEs ? "Servicios incluidos" : "ServiÃ§os incluÃ­dos",
        title: isEs ? "Tu viaje, organizado" : "Sua viagem, organizada",
        body: "",
        bullets: packageFacts,
      },
      {
        label: isEs ? "Datos del viaje" : "Dados da viagem",
        title: isEs ? "Fechas, salida y alojamiento" : "Datas, saÃ­da e hospedagem",
        body: cleanBody(pacote.importantNotes, 100),
        bullets: logistics,
      },
      {
        label: isEs ? "Confirma tu embarque" : "Confirme seu embarque",
        title: isEs ? "Solicita disponibilidad" : "Consulte a disponibilidade",
        body:
          isEs
            ? "Habla con nuestro equipo para recibir los valores actualizados."
            : "Fale com nossa equipe para receber os valores atualizados.",
        bullets: priceAndTerms,
      },
    ],
  };

  if (strategy === "headline-center" || strategy === "headline-footer") {
    return strategies.headline || [];
  }
  return strategies[strategy] || strategies.impact || [];
}

function createSlides(
  pacote: Pacote,
  total: CarouselSize,
  coverImage: string,
  phone: string,
  isEs: boolean,
  extraImages: string[] = [],
  strategy: CarouselSlideVariant = "impact",
  coverSource: "ad" | "native" = "native",
): CarouselSlide[] {
  const allDestImages = uniqueImages([
    pacote.imageUrl,
    ...(pacote.galleryImages || []),
    ...extraImages,
  ]).filter((img) => img !== coverImage);

  const validImages = allDestImages.filter(Boolean);
  const getImg = (idx: number) => {
    if (!validImages.length) return ""; // fallback to empty instead of coverImage
    return validImages[idx % validImages.length] || "";
  };
  const presets = contentPresets(pacote, isEs, strategy);
  const contentCount = total - 2;
  const selectedPresets =
    contentCount === 1
      ? [
          {
            ...presets[0],
            bullets: compact([...(pacote.included || []), ...(pacote.highlights || [])])
              .map(cleanCarouselText)
              .filter(Boolean)
              .slice(0, 5),
          },
        ]
      : contentCount === 2
        ? [presets[0], (pacote.included?.length || pacote.highlights?.length) ? presets[1] : presets[2]]
        : contentCount === 3
          ? presets.slice(0, 3)
          : presets.slice(0, 4);

  const slides: CarouselSlide[] = [
    {
      id: createId(),
      kind: "cover",
      label: isEs ? "DESCUBRE" : "DESCUBRA",
      title: pacote.title,
      body:
        pacote.description ||
        (pacote.price
          ? isEs
            ? `Viaja desde ${pacote.price}`
            : `Viaje a partir de ${pacote.price}`
          : isEs
            ? "Una experiencia pensada para recordar."
            : "Uma experiÃªncia feita para lembrar."),
      bullets: compact([...(pacote.highlights || []), ...(pacote.included || [])])
        .map(cleanCarouselText)
        .filter(Boolean)
        .slice(0, 2),
      imageUrl: coverImage,
      textColor: "#FFFFFF",
      cta: "",
      phone: "",
      slideVariant: strategy,
      bulletIcon: "none",
      showShadow: true,
      labelStyle: "filled",
      fontFamily: "Inter",
      fontWeight: "normal",
      fontStyle: "normal",
      textDecoration: "none",
      titleStyle: { bold: true, italic: false, underline: false },
      bodyStyle: { bold: false, italic: false, underline: false },
      bulletStyle: { bold: false, italic: false, underline: false },
      coverSource,
    },
  ];

  selectedPresets.forEach((preset, index) => {
    slides.push({
      id: createId(),
      kind: "content",
      ...preset,
      imageUrl: getImg(index),
      textColor: "#FFFFFF",
      cta: "",
      phone: "",
      slideVariant: strategy,
      bulletIcon: "none",
      showShadow: true,
      labelStyle: "filled",
      fontFamily: "Inter",
      fontWeight: "normal",
      fontStyle: "normal",
      textDecoration: "none",
      titleStyle: { bold: true, italic: false, underline: false },
      bodyStyle: { bold: false, italic: false, underline: false },
      bulletStyle: { bold: false, italic: false, underline: false },
    });
  });

  slides.push({
    id: createId(),
    kind: "closing",
    label: "",
    title: isEs ? "Da el siguiente paso hacia tu viaje" : "DÃª o prÃ³ximo passo para a sua viagem",
    body: isEs
      ? "Habla con nuestro equipo y recibe una propuesta personalizada."
      : "Fale com nossa equipe e receba uma proposta personalizada.",
    bullets: [],
    imageUrl: getImg(selectedPresets.length),
    textColor: "#FFFFFF",
    cta: pacote.ctaLabel || (isEs ? "Reserva tu viaje por WhatsApp" : "Reserve sua viagem pelo WhatsApp"),
    phone,
    slideVariant: strategy,
    bulletIcon: "none",
    showShadow: true,
    labelStyle: "filled",
    fontFamily: "Inter",
    fontWeight: "normal",
    fontStyle: "normal",
    textDecoration: "none",
    titleStyle: { bold: true, italic: false, underline: false },
    bodyStyle: { bold: false, italic: false, underline: false },
    bulletStyle: { bold: false, italic: false, underline: false },
  });
  return slides;
}

function distributeUniqueSlideImages(
  items: CarouselSlide[],
  candidates: string[],
  preserveUploads = false,
): CarouselSlide[] {
  const pool = uniqueImages(candidates);
  if (!pool.length) return items;

  const used = new Set<string>();
  items.forEach((slide) => {
    if (slide.kind === "cover" && slide.imageUrl) used.add(slide.imageUrl);
  });

  return items.map((slide) => {
    if (slide.kind === "cover") return slide;
    if (preserveUploads && isUserUploadedImage(slide.imageUrl)) {
      used.add(slide.imageUrl);
      return slide;
    }
    const nextImage = pool.find((image) => !used.has(image));
    if (!nextImage) {
      if (slide.imageUrl && !used.has(slide.imageUrl)) used.add(slide.imageUrl);
      return slide;
    }
    used.add(nextImage);
    return { ...slide, imageUrl: nextImage };
  });
}

function mergeSlidesForSize(
  current: CarouselSlide[],
  generated: CarouselSlide[],
): CarouselSlide[] {
  const currentCover = current.find((slide) => slide.kind === "cover");
  const currentContent = current.filter((slide) => slide.kind === "content");
  const currentClosing = current.find((slide) => slide.kind === "closing");

  return generated.map((slide, index) => {
    if (slide.kind === "cover") return carrySlidePresentation(slide, currentCover);
    if (slide.kind === "closing" && currentClosing) {
      const merged = { ...slide, ...currentClosing, id: currentClosing.id };
      return {
        ...merged,
        slideVariant: slide.slideVariant,
        imageUrl: merged.imageUrl || slide.imageUrl,
      };
    }
    const contentIndex = generated.slice(0, index).filter((item) => item.kind === "content").length;
    const existing = currentContent[contentIndex];
    if (!existing) return slide;
    return carrySlidePresentation(slide, existing);
  });
}

function mergeActiveIntoArchive(
  active: CarouselSlide[],
  archive: CarouselSlide[],
): CarouselSlide[] {
  const activeCover = active.find((slide) => slide.kind === "cover");
  const activeClosing = active.find((slide) => slide.kind === "closing");
  const activeContent = active.filter((slide) => slide.kind === "content");
  let contentIndex = 0;

  return archive.map((slide) => {
    if (slide.kind === "cover") return activeCover || slide;
    if (slide.kind === "closing") return activeClosing || slide;
    const replacement = activeContent[contentIndex];
    contentIndex += 1;
    return replacement || slide;
  });
}

function carrySlidePresentation(next: CarouselSlide, current?: CarouselSlide): CarouselSlide {
  if (!current || current.kind !== next.kind) return next;
  if (next.kind === "cover") {
    if (next.coverSource === "ad" || current.coverSource === "ad") return next;
    return {
      ...next,
      ...current,
      slideVariant: next.slideVariant,
      coverSource: "native",
      imageUrl: current.imageUrl || next.imageUrl,
    };
  }
  if (next.kind === "closing") {
    return {
      ...next,
      ...current,
      id: current.id,
      slideVariant: next.slideVariant,
      title: current.title || next.title,
      body: current.body || next.body,
      cta: current.cta || next.cta,
      phone: current.phone || next.phone,
      imageUrl: current.imageUrl || next.imageUrl,
    };
  }
  return {
    ...next,
    id: current.id,
    slideVariant: next.slideVariant,
    imageUrl: current.imageUrl || next.imageUrl,
    textColor: next.textColor,
    bulletIcon: current.bulletIcon,
    showShadow: current.showShadow,
    labelStyle: current.labelStyle,
    labelAlignment: current.labelAlignment,
    contentAlignment: current.contentAlignment,
    labelColor: current.labelColor,
    labelTextColor: current.labelTextColor,
    fontFamily: current.fontFamily,
    fontWeight: current.fontWeight,
    fontStyle: current.fontStyle,
    textDecoration: current.textDecoration,
    titleStyle: carryFieldTypography(current.titleStyle, current.slideVariant, next.slideVariant),
    bodyStyle: carryFieldTypography(current.bodyStyle, current.slideVariant, next.slideVariant),
    bulletStyle: carryFieldTypography(current.bulletStyle, current.slideVariant, next.slideVariant),
  };
}

async function optimizeUpload(file: File) {
  const bitmap = await createImageBitmap(file);
  try {
    const scale = Math.min(1, 1800 / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(bitmap.width * scale));
    canvas.height = Math.max(1, Math.round(bitmap.height * scale));
    const context = canvas.getContext("2d");
    if (!context) throw new Error("canvas");
    context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/webp", 0.84),
    );
    if (!blob) throw new Error("image-optimization");
    return blob;
  } finally {
    bitmap.close();
  }
}

async function hashBlob(blob: Blob) {
  const bytes = await blob.arrayBuffer();
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

async function blobToDataUrl(blob: Blob) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}

async function prepareImageForCanvas(source: string): Promise<string> {
  if (!source || source.startsWith("data:") || source.startsWith("blob:")) return source;
  try {
    const response = await fetch(source, { mode: "cors", cache: "no-cache" });
    if (response.ok) {
      const blob = await response.blob();
      return await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result || source));
        reader.onerror = () => resolve(source);
        reader.readAsDataURL(blob);
      });
    }
  } catch {
    // Ignore fetch error, try Image fallback
  }
  try {
    return await new Promise<string>((resolve) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        try {
          const canvas = document.createElement("canvas");
          canvas.width = img.naturalWidth || 800;
          canvas.height = img.naturalHeight || 800;
          const ctx = canvas.getContext("2d");
          ctx?.drawImage(img, 0, 0);
          resolve(canvas.toDataURL("image/png"));
        } catch {
          resolve(source);
        }
      };
      img.onerror = () => resolve(source);
      const sep = source.includes("?") ? "&" : "?";
      img.src = `${source}${sep}_cb=${Date.now()}`;
    });
  } catch {
    return source;
  }
}

async function downloadOriginalImage(source: string, filename: string) {
  if (source.startsWith("data:") || source.startsWith("blob:")) {
    const link = document.createElement("a");
    link.href = source;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    return;
  }

  try {
    const response = await fetch(source, { mode: "cors", cache: "no-cache" });
    if (!response.ok) throw new Error("cover-download");
    const objectUrl = URL.createObjectURL(await response.blob());
    const link = document.createElement("a");
    link.href = objectUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1_000);
  } catch {
    const link = document.createElement("a");
    link.href = source;
    link.download = filename;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    document.body.appendChild(link);
    link.click();
    link.remove();
  }
}

async function assertExportImageReadable(source: string) {
  if (!source || source.startsWith("data:") || source.startsWith("blob:")) return;
  await prepareImageForCanvas(source);
}

function CarouselCanvas({
  slide,
  index,
  total,
  ratio,
  logo: logoSource,
  logoPosition,
  primary,
  secondary,
  canvasRef,
  exportMode = false,
}: {
  slide: CarouselSlide;
  index: number;
  total: number;
  ratio: number;
  logo: string;
  logoPosition: LogoPosition;
  primary: string;
  secondary: string;
  canvasRef?: (node: HTMLDivElement | null) => void;
  exportMode?: boolean;
}) {
  const Z = exportMode ? 2.5 : 1;
  const baseWidth = Math.round(432 * Z);
  const computedHeight = Math.round((432 / (ratio || 0.8)) * Z);
  const dimensions: CSSProperties = exportMode
    ? { width: baseWidth, height: computedHeight }
    : { width: "100%", aspectRatio: `${ratio}` };

  if (slide.kind === "cover" && slide.coverSource === "ad") {
    return (
      <div
        ref={canvasRef}
        data-carousel-canvas
        style={{
          ...dimensions,
          position: "relative",
          overflow: "hidden",
          background: "#08090B",
          boxSizing: "border-box",
        }}
      >
        {slide.imageUrl ? (
          <>
            <img
              src={slide.imageUrl}
              alt=""
              aria-hidden="true"
              crossOrigin={
                slide.imageUrl.startsWith("data:") || slide.imageUrl.startsWith("blob:")
                  ? undefined
                  : "anonymous"
              }
              style={{
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "100%",
                display: "block",
                objectFit: "cover",
                opacity: 0.3,
              }}
            />
            <div
              aria-hidden="true"
              style={{ position: "absolute", inset: 0, background: "rgba(8,9,11,.58)" }}
            />
            <img
              src={slide.imageUrl}
              alt=""
              crossOrigin={
                slide.imageUrl.startsWith("data:") || slide.imageUrl.startsWith("blob:")
                  ? undefined
                  : "anonymous"
              }
              style={{
                position: "relative",
                zIndex: 1,
                width: "100%",
                height: "100%",
                display: "block",
                objectFit: "contain",
              }}
            />
          </>
        ) : (
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "grid",
              placeItems: "center",
              padding: "12%",
              color: "#F8FAFC",
              textAlign: "center",
              font: `${Math.round(800 * Z)} ${Math.round(18 * Z)}px/1.35 Inter, sans-serif`,
            }}
          >
            Gere a arte de capa na aba AnÃºncio
          </div>
        )}
      </div>
    );
  }

  // Legacy layouts positioned the logo independently. Keep them disabled and
  // render one predictable brand layer for every editable carousel design.
  const logo: string = "";
  const logoIsLeft = logoPosition.endsWith("left");
  const logoIsBottom = logoPosition.startsWith("bottom");
  const renderPositionedLogo = () =>
    logoSource ? (
      <img
        src={logoSource}
        alt=""
        crossOrigin={
          logoSource.startsWith("data:") || logoSource.startsWith("blob:")
            ? undefined
            : "anonymous"
        }
        style={{
          position: "absolute",
          zIndex: 40,
          top: logoIsBottom ? undefined : ratio < 0.68 ? "3.5%" : "5%",
          bottom: logoIsBottom ? (ratio < 0.68 ? "4.5%" : "5%") : undefined,
          left: logoIsLeft ? "5%" : undefined,
          right: logoIsLeft ? undefined : "5%",
          width: Math.round((ratio < 0.68 ? 36 : 40) * Z),
          height: Math.round((ratio < 0.68 ? 36 : 40) * Z),
          borderRadius: Math.round(10 * Z),
          objectFit: "contain",
          background: "rgba(255,255,255,.96)",
          padding: Math.round(4 * Z),
          boxShadow: `0 ${Math.round(6 * Z)}px ${Math.round(18 * Z)}px rgba(0,0,0,.24)`,
          boxSizing: "border-box",
          pointerEvents: "none",
        }}
      />
    ) : null;

  const isClosing = slide.kind === "closing";
  const isLastContent = slide.kind === "content" && index === total - 2;
  const ff = slide.fontFamily || "Inter, ui-sans-serif, system-ui, sans-serif";
  
  const titleBold = slide.titleStyle?.bold !== undefined ? slide.titleStyle.bold : (slide.fontWeight === "normal" ? false : true);
  const titleWeight = titleBold ? 950 : 600;
  const titleStyleAttr = (slide.titleStyle?.italic !== undefined ? slide.titleStyle.italic : slide.fontStyle === "italic") ? "italic" : "normal";
  const titleDecAttr = (slide.titleStyle?.underline !== undefined ? slide.titleStyle.underline : slide.textDecoration === "underline") ? "underline" : "none";
  const contentTextFallback = defaultContentTextColor(slide.slideVariant, primary);
  const titleColor = editableColor(
    slide.titleStyle?.color,
    isClosing ? slide.textColor || "#F8FAFC" : contentTextFallback,
  );

  const bodyBold = slide.bodyStyle?.bold !== undefined ? slide.bodyStyle.bold : (slide.fontWeight === "bold" ? true : false);
  const bodyWeight = bodyBold ? 750 : 450;
  const bodyStyleAttr = (slide.bodyStyle?.italic !== undefined ? slide.bodyStyle.italic : slide.fontStyle === "italic") ? "italic" : "normal";
  const bodyDecAttr = (slide.bodyStyle?.underline !== undefined ? slide.bodyStyle.underline : slide.textDecoration === "underline") ? "underline" : "none";
  const bodyColor = editableColor(
    slide.bodyStyle?.color,
    isClosing ? slide.textColor || "#F8FAFC" : contentTextFallback,
  );

  const bulletBold = slide.bulletStyle?.bold !== undefined ? slide.bulletStyle.bold : (slide.fontWeight === "bold" ? true : false);
  const bulletWeight = bulletBold ? 700 : 450;
  const bulletStyleAttr = (slide.bulletStyle?.italic !== undefined ? slide.bulletStyle.italic : slide.fontStyle === "italic") ? "italic" : "normal";
  const bulletDecAttr = (slide.bulletStyle?.underline !== undefined ? slide.bulletStyle.underline : slide.textDecoration === "underline") ? "underline" : "none";
  const bulletColor = editableColor(
    slide.bulletStyle?.color,
    isClosing ? slide.textColor || "#F8FAFC" : contentTextFallback,
  );
  const titleLength = cleanCarouselText(slide.title).length;
  const titleScale = titleLength > 70 ? 0.76 : titleLength > 52 ? 0.84 : titleLength > 38 ? 0.92 : 1;
  const contentLength =
    titleLength +
    cleanCarouselText(slide.body).length +
    slide.bullets.reduce((total, item) => total + cleanCarouselText(item).length, 0);
  const isDenseSlide = contentLength > 165;
  const denseTextScale =
    contentLength > 520 ? 0.62 : contentLength > 360 ? 0.72 : contentLength > 240 ? 0.84 : 1;
  const automaticContentAlignment: Exclude<LabelAlignment, "auto"> =
    slide.slideVariant === "headline-center"
      ? "center"
      : index % 2 === 1
        ? "right"
        : "left";
  const resolvedContentAlignment =
    slide.contentAlignment && slide.contentAlignment !== "auto"
      ? slide.contentAlignment
      : automaticContentAlignment;
  const contentOnRight = resolvedContentAlignment === "right";
  const safeTextWrap: CSSProperties = {
    overflowWrap: "break-word",
    wordBreak: "normal",
    hyphens: "none",
  };

  const textShadow = slide.showShadow === false ? "none" : `0px ${Math.round(3 * Z)}px ${Math.round(18 * Z)}px rgba(0, 0, 0, 0.75)`;
  const bodyShadow = slide.showShadow === false ? "none" : `0px ${Math.round(2 * Z)}px ${Math.round(12 * Z)}px rgba(0, 0, 0, 0.82)`;
  const bulletShadow = slide.showShadow === false ? "none" : `0px ${Math.round(2 * Z)}px ${Math.round(10 * Z)}px rgba(0, 0, 0, 0.88)`;

  const renderLabel = (
    label: string,
    alignment: "left" | "center" | "right" = "left",
  ) => {
    if (!label) return null;
    const rawBg = slide.labelColor || secondary;
    const bg = rawBg.toUpperCase() === "#F5F906" ? "#F5F906" : rawBg;
    const fg = editableColor(slide.labelTextColor, readableText(bg));
    const resolvedAlignment =
      slide.labelAlignment && slide.labelAlignment !== "auto"
        ? slide.labelAlignment
        : alignment;
    const alignmentMargins =
      resolvedAlignment === "center"
        ? { marginLeft: "auto", marginRight: "auto" }
        : resolvedAlignment === "right"
          ? { marginLeft: "auto", marginRight: 0 }
          : { marginLeft: 0, marginRight: "auto" };

    const style = slide.labelStyle || "filled";
    const commonStyle: CSSProperties = {
      display: "block",
      alignSelf:
        resolvedAlignment === "right"
          ? "flex-end"
          : resolvedAlignment === "center"
            ? "center"
            : "flex-start",
      width: "fit-content",
      maxWidth: "88%",
      marginBottom: Math.round(10 * Z),
      ...alignmentMargins,
      padding: `${Math.round(5 * Z)}px ${Math.round(9 * Z)}px`,
      fontSize: Math.round(8 * Z),
      lineHeight: 1.15,
      fontWeight: 900,
      letterSpacing: ".08em",
      textTransform: "uppercase",
      boxSizing: "border-box",
      verticalAlign: "middle",
      whiteSpace: "normal",
      ...safeTextWrap,
    };

    if (style === "outline-thin") {
      return (
        <div style={{ ...commonStyle, borderRadius: Math.round(999 * Z), border: `${Math.max(1, Math.round(1 * Z))}px solid ${bg}`, background: "transparent", color: fg, padding: `${Math.round(6 * Z)}px ${Math.round(12 * Z)}px`, fontWeight: 800 }}>
          {label}
        </div>
      );
    }
    if (style === "outline-thick") {
      return (
        <div style={{ ...commonStyle, borderRadius: Math.round(999 * Z), border: `${Math.round(2.5 * Z)}px solid ${bg}`, background: "rgba(0, 0, 0, 0.60)", color: fg, padding: `${Math.round(6 * Z)}px ${Math.round(12 * Z)}px` }}>
          {label}
        </div>
      );
    }
    if (style === "stripe-left") {
      return (
        <div style={{ ...commonStyle, borderLeft: `${Math.round(4 * Z)}px solid ${bg}`, background: "rgba(0, 0, 0, 0.55)", color: fg, padding: `${Math.round(6 * Z)}px ${Math.round(12 * Z)}px`, fontWeight: 800 }}>
          {label}
        </div>
      );
    }
    if (style === "line-top") {
      return (
        <div style={{ ...commonStyle, borderTop: `${Math.max(2, Math.round(3 * Z))}px solid ${bg}`, background: "transparent", color: fg, padding: `${Math.round(7 * Z)}px ${Math.round(2 * Z)}px ${Math.round(3 * Z)}px`, fontWeight: 800 }}>
          {label}
        </div>
      );
    }
    if (style === "line-bottom") {
      return (
        <div style={{ ...commonStyle, borderBottom: `${Math.max(2, Math.round(3 * Z))}px solid ${bg}`, background: "transparent", color: fg, padding: `${Math.round(3 * Z)}px ${Math.round(2 * Z)}px ${Math.round(7 * Z)}px`, fontWeight: 800 }}>
          {label}
        </div>
      );
    }
    if (style === "rectangle") {
      return (
        <div style={{ ...commonStyle, borderRadius: 0, background: bg, color: fg, boxShadow: slide.showShadow === false ? "none" : `0px ${Math.round(4 * Z)}px ${Math.round(14 * Z)}px rgba(0, 0, 0, 0.35)` }}>
          {label}
        </div>
      );
    }
    if (style === "translucent") {
      return (
        <div style={{ ...commonStyle, borderRadius: Math.round(999 * Z), background: safeHexToRgba(bg, 0.5), color: fg }}>
          {label}
        </div>
      );
    }
    if (style === "gradient") {
      const defaultGradientFg = readableText(bg);
      const gradientEnd = mixHexColor(
        bg,
        defaultGradientFg === "#111318" ? "#FFFFFF" : "#000000",
        0.32,
      );
      const gradientFg = editableColor(
        slide.labelTextColor,
        readableGradientText(bg, gradientEnd),
      );
      return (
        <div style={{ ...commonStyle, borderRadius: Math.round(999 * Z), background: `linear-gradient(90deg, ${bg} 0%, ${gradientEnd} 100%)`, color: gradientFg, boxShadow: slide.showShadow === false ? "none" : `0px ${Math.round(4 * Z)}px ${Math.round(14 * Z)}px rgba(0, 0, 0, 0.35)` }}>
          {label}
        </div>
      );
    }
    return (
      <div style={{ ...commonStyle, borderRadius: Math.round(999 * Z), background: bg, color: fg, boxShadow: slide.showShadow === false ? "none" : `0px ${Math.round(4 * Z)}px ${Math.round(14 * Z)}px rgba(0, 0, 0, 0.35)` }}>
        {label}
      </div>
    );
  };

  const renderBullets = ({
    color,
    max = 5,
    numbered = false,
    columns = 1,
    textShadow: customTextShadow = "none",
    align = "left",
    compact = false,
    scale = 1,
  }: {
    color: string;
    max?: number;
    numbered?: boolean;
    columns?: 1 | 2;
    textShadow?: string;
    align?: "left" | "center" | "right";
    compact?: boolean;
    scale?: number;
  }) => {
    const items = slide.bullets.map(cleanCarouselText).filter(Boolean).slice(0, max);
    if (!items.length) return null;
    const dense = items.join("").length > 105 || items.some((item) => item.length > 34);
    return (
      <ul
        style={{
          display: "grid",
          gridTemplateColumns: columns === 2 ? "repeat(2, minmax(0, 1fr))" : "1fr",
          gap: `${Math.round((compact ? 4 : dense ? 5 : 7) * scale * Z)}px ${Math.round((compact ? 9 : 12) * scale * Z)}px`,
          padding: 0,
          margin: `${Math.round((compact ? 9 : 14) * scale * Z)}px 0 0`,
          listStyle: "none",
        }}
      >
        {items.map((item, bulletIndex) => (
          <li
            key={`${slide.id}-b-${bulletIndex}`}
            style={{
              display: "flex",
              flexDirection: align === "right" ? "row-reverse" : "row",
              justifyContent: align === "center" ? "center" : "flex-start",
              gap: Math.round((compact ? 6 : 8) * scale * Z),
              alignItems: "flex-start",
              minWidth: 0,
              color,
              textAlign: align,
              fontSize: Math.max(6, Math.round((compact ? 9 : dense ? 10.25 : 11.5) * scale * Z)),
              lineHeight: compact ? 1.18 : dense ? 1.24 : 1.32,
              fontFamily: ff,
              fontWeight: bulletWeight,
              fontStyle: bulletStyleAttr,
              textDecoration: bulletDecAttr,
              ...safeTextWrap,
              textShadow: customTextShadow,
            }}
          >
            <span
              style={{
                flex: "0 0 auto",
                minWidth: numbered ? Math.round(20 * Z) : Math.round(5 * Z),
                height: numbered ? "auto" : Math.round(5 * Z),
                marginTop: numbered ? 0 : Math.round(5 * Z),
                borderRadius: numbered ? 0 : Math.round(99 * Z),
                background: numbered ? "transparent" : secondary,
                color: numbered ? secondary : "transparent",
                fontSize: Math.round(9 * Z),
                lineHeight: 1.45,
                fontWeight: 900,
              }}
            >
              {numbered ? String(bulletIndex + 1).padStart(2, "0") : ""}
            </span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    );
  };

  if (isClosing) {
    const storyMode = ratio < 0.68;
    const variant = slide.slideVariant || "impact";
    const closingContactLength =
      cleanCarouselText(slide.phone).length +
      cleanCarouselText(slide.instagram).length +
      cleanCarouselText(slide.email).length +
      cleanCarouselText(slide.website).length;
    const closingContentLength =
      titleLength +
      cleanCarouselText(slide.body).length +
      cleanCarouselText(slide.cta).length +
      closingContactLength;
    const closingTextScale =
      closingContentLength > 190
        ? 0.76
        : closingContentLength > 145
          ? 0.84
          : closingContentLength > 110
            ? 0.92
            : 1;
    const closingCompact = closingContentLength > 145;
    const stripedClosing = isHeadlineVariant(variant);
    const closingHeadlineLines = stripedClosing ? splitBalancedHeadline(slide.title) : [];
    const closingLongestHeadline = Math.max(
      0,
      ...closingHeadlineLines.map((line) => line.length),
    );
    const closingHeadlineFontScale = Math.max(
      0.42,
      Math.min(1, 19 / Math.max(19, closingLongestHeadline)),
    );
    const centeredHeadline = variant === "headline-center";
    const brandGradient = `linear-gradient(100deg, ${primary} 0%, ${secondary} 100%)`;
    const gradientForeground = readableGradientText(primary, secondary);
    const brandForeground = readableText(primary);
    const lightPanel = ["editorial", "minimalist", "organic", "ticket"].includes(variant);
    const panelForeground = lightPanel
      ? "#17191D"
      : variant === "vibrant"
        ? readableText(primary)
        : "#F8FAFC";
    const closingTitleColor = editableColor(slide.titleStyle?.color, panelForeground);
    const closingBodyColor = editableColor(slide.bodyStyle?.color, panelForeground);
    const activeContactChannels =
      slide.contactChannels ??
      [
        slide.phone ? "whatsapp" : undefined,
        slide.instagram ? "instagram" : undefined,
        slide.email ? "email" : undefined,
      ].filter((channel): channel is CarouselContactChannel => Boolean(channel));
    const panelStyle: CSSProperties = {
      position: "absolute",
      display: "flex",
      flexDirection: "column",
      boxSizing: "border-box",
      zIndex: 10,
    };
    let contentStyle: CSSProperties = {
      ...panelStyle,
      inset: 0,
      alignItems: "center",
      justifyContent: "center",
      padding: storyMode ? "17% 9% 21%" : "11% 9%",
      textAlign: "center",
    };
    let panelBackground = "transparent";
    let panelBorder = "none";
    let panelRadius: string | number = 0;
    let panelShadow = "none";
    let titleBackground = "transparent";
    let titleForeground = closingTitleColor;
    const titlePadding = 0;
    const titleRadius: string | number = 0;
    let ctaBackground = primary;
    let ctaForeground = brandForeground;
    let ctaBorder = "none";
    let ctaRadius = Math.round(999 * Z);
    let accentPlacement: "top" | "side" | "dash" | "none" = "none";

    if (variant === "itinerary") {
      contentStyle = {
        ...panelStyle,
        top: storyMode ? "40%" : "36%",
        left: 0,
        right: 0,
        bottom: storyMode ? "20%" : 0,
        justifyContent: "center",
        alignItems: "flex-start",
        padding: "8% 9%",
        textAlign: "left",
      };
      panelBackground = "rgba(8,9,11,.94)";
      panelBorder = `${Math.max(3, Math.round(5 * Z))}px solid ${secondary}`;
      accentPlacement = "top";
    } else if (variant === "editorial") {
      contentStyle = {
        ...panelStyle,
        top: storyMode ? "38%" : "34%",
        bottom: storyMode ? "20%" : 0,
        left: 0,
        right: 0,
        justifyContent: "center",
        alignItems: "flex-start",
        padding: closingCompact ? "5% 8%" : "7% 8%",
        textAlign: "left",
      };
      panelBackground = "#F3F2EE";
      panelBorder = `${Math.max(3, Math.round(5 * Z))}px solid ${secondary}`;
      accentPlacement = "top";
      ctaBackground = secondary;
      ctaForeground = readableText(secondary);
      ctaRadius = Math.round(8 * Z);
    } else if (variant === "oferta") {
      contentStyle = {
        ...panelStyle,
        left: "8%",
        right: "8%",
        bottom: storyMode ? "20%" : "9%",
        justifyContent: "center",
        alignItems: "center",
        padding: "8% 8%",
        textAlign: "center",
      };
      panelBackground = "rgba(8,9,11,.94)";
      panelBorder = `${Math.max(2, Math.round(3 * Z))}px solid ${primary}`;
      panelRadius = Math.round(24 * Z);
      panelShadow = `0 ${Math.round(18 * Z)}px ${Math.round(48 * Z)}px rgba(0,0,0,.36)`;
      ctaBackground = brandGradient;
      ctaForeground = gradientForeground;
      ctaRadius = Math.round(10 * Z);
    } else if (variant === "minimalist") {
      contentStyle = {
        ...panelStyle,
        top: storyMode ? "38%" : "34%",
        left: 0,
        right: 0,
        bottom: storyMode ? "20%" : 0,
        justifyContent: "center",
        alignItems: "flex-start",
        padding: closingCompact ? "5% 8%" : "7% 8%",
        textAlign: "left",
      };
      panelBackground = "rgba(248,248,246,.98)";
      panelBorder = `${Math.max(3, Math.round(5 * Z))}px solid ${primary}`;
      accentPlacement = "top";
      ctaBackground = "transparent";
      ctaForeground = primary;
      ctaBorder = `${Math.max(1, Math.round(2 * Z))}px solid ${primary}`;
      ctaRadius = Math.round(8 * Z);
    } else if (variant === "vibrant") {
      contentStyle = {
        ...panelStyle,
        top: storyMode ? "38%" : "34%",
        bottom: storyMode ? "20%" : 0,
        left: 0,
        right: 0,
        justifyContent: "center",
        alignItems: "flex-start",
        padding: closingCompact ? "5% 8%" : "7% 8%",
        textAlign: "left",
      };
      panelBackground = primary;
      panelBorder = `${Math.max(4, Math.round(7 * Z))}px solid ${secondary}`;
      accentPlacement = "top";
      ctaBackground = secondary;
      ctaForeground = readableText(secondary);
      ctaRadius = Math.round(8 * Z);
    } else if (variant === "organic") {
      contentStyle = {
        ...panelStyle,
        top: storyMode ? "38%" : "34%",
        left: 0,
        right: 0,
        bottom: storyMode ? "20%" : 0,
        justifyContent: "center",
        alignItems: "flex-start",
        padding: closingCompact ? "5% 8%" : "7% 8%",
        textAlign: "left",
      };
      panelBackground = "rgba(248,248,246,.98)";
      panelBorder = `${Math.max(3, Math.round(5 * Z))}px solid ${primary}`;
      panelRadius = `0 ${Math.round(90 * Z)}px 0 0`;
      ctaBackground = primary;
      ctaForeground = brandForeground;
    } else if (variant === "glass") {
      contentStyle = {
        ...panelStyle,
        left: "7%",
        right: "7%",
        bottom: storyMode ? "21%" : "8%",
        justifyContent: "center",
        alignItems: "flex-start",
        padding: "8% 8%",
        textAlign: "left",
      };
      panelBackground = "rgba(8,9,11,.78)";
      panelBorder = "1px solid rgba(255,255,255,.42)";
      panelRadius = Math.round(24 * Z);
      panelShadow = `0 ${Math.round(18 * Z)}px ${Math.round(48 * Z)}px rgba(0,0,0,.36)`;
      ctaBackground = safeHexToRgba(primary, 0.88);
      ctaForeground = brandForeground;
      ctaBorder = "1px solid rgba(255,255,255,.28)";
      ctaRadius = Math.round(10 * Z);
    } else if (isHeadlineVariant(variant)) {
      contentStyle = {
        ...panelStyle,
        top:
          logoSource && !logoIsBottom
            ? storyMode ? "14%" : "15%"
            : variant === "headline-footer"
              ? storyMode ? "25%" : "22%"
              : storyMode ? "10%" : "9%",
        bottom: logoSource && logoIsBottom
          ? storyMode ? "13%" : "14%"
          : storyMode ? "8%" : "7%",
        left: "8%",
        right: "8%",
        alignItems: centeredHeadline ? "center" : "flex-start",
        justifyContent: "flex-start",
        padding: 0,
        textAlign: centeredHeadline ? "center" : "left",
      };
      titleBackground = "transparent";
      titleForeground = "#FFFFFF";
      ctaBackground = brandGradient;
      ctaForeground = gradientForeground;
      ctaRadius = Math.round(5 * Z);
    } else if (variant === "ticket") {
      contentStyle = {
        ...panelStyle,
        left: "7%",
        right: "7%",
        bottom: storyMode ? "20%" : "8%",
        justifyContent: "center",
        alignItems: "flex-start",
        padding: "8% 9%",
        textAlign: "left",
      };
      panelBackground = "#F6F2E9";
      panelBorder = `${Math.max(1, Math.round(2 * Z))}px solid ${primary}`;
      panelRadius = Math.round(14 * Z);
      panelShadow = `0 ${Math.round(18 * Z)}px ${Math.round(44 * Z)}px rgba(0,0,0,.32)`;
      accentPlacement = "dash";
      ctaBackground = primary;
      ctaForeground = brandForeground;
      ctaRadius = Math.round(5 * Z);
    }

    return (
      <div
        ref={canvasRef}
        data-carousel-canvas
        style={{
          ...dimensions,
          position: "relative",
          overflow: "hidden",
          isolation: "isolate",
          background: "#08090B",
          fontFamily: ff,
          boxSizing: "border-box",
        }}
      >
        {slide.imageUrl && (
          <img
            src={slide.imageUrl}
            alt=""
            crossOrigin={
              slide.imageUrl.startsWith("data:") || slide.imageUrl.startsWith("blob:")
                ? undefined
                : "anonymous"
            }
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
        )}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              variant === "editorial" || variant === "vibrant"
                ? "linear-gradient(90deg, rgba(5,7,10,.08), rgba(5,7,10,.52))"
                : "linear-gradient(180deg, rgba(5,7,10,.24), rgba(5,7,10,.78))",
          }}
        />
        <div
          style={{
            ...contentStyle,
            background: panelBackground,
            border: accentPlacement === "top" ? "none" : panelBorder,
            borderTop: accentPlacement === "top" ? panelBorder : undefined,
            borderRadius: panelRadius,
            boxShadow: panelShadow,
            color: panelForeground,
          }}
        >
          {accentPlacement === "dash" && (
            <div
              aria-hidden="true"
              style={{
                position: "absolute",
                top: "10%",
                bottom: "10%",
                right: "20%",
                borderRight: `${Math.max(1, Math.round(2 * Z))}px dashed ${safeHexToRgba(primary, 0.45)}`,
              }}
            />
          )}
          {logo && (
            <img
              src={logo}
              alt=""
              crossOrigin={logo.startsWith("data:") || logo.startsWith("blob:") ? undefined : "anonymous"}
              style={{
                width: Math.round((storyMode ? 54 : 58) * Z),
                height: Math.round((storyMode ? 54 : 58) * Z),
                marginBottom: Math.round(15 * Z),
                borderRadius: Math.round(12 * Z),
                objectFit: "contain",
                background: "rgba(255,255,255,.96)",
                padding: Math.round(6 * Z),
                boxShadow: `0 ${Math.round(6 * Z)}px ${Math.round(18 * Z)}px rgba(0,0,0,.24)`,
              }}
            />
          )}
          {renderLabel(
            slide.label,
            contentStyle.alignItems === "center"
              ? "center"
              : contentStyle.alignItems === "flex-end"
                ? "right"
                : "left",
          )}
          {stripedClosing ? (
            <div
              style={{
                display: "flex",
                width: "100%",
                flexDirection: "column",
                alignItems: centeredHeadline ? "center" : "flex-start",
              }}
            >
              {closingHeadlineLines.map((line, lineIndex) => (
                <span
                  key={`${slide.id}-closing-headline-${lineIndex}`}
                  style={{
                    display: "block",
                    width: "fit-content",
                    maxWidth: "100%",
                    marginTop: lineIndex ? Math.round(3 * Z) : 0,
                    padding: `${Math.round(5 * Z)}px ${Math.round(12 * Z)}px`,
                    background: `linear-gradient(100deg, rgba(0,0,0,.28), rgba(0,0,0,.18)), linear-gradient(${96 + lineIndex * 7}deg, ${primary} 0%, ${secondary} 100%)`,
                    color: "#FFFFFF",
                    fontSize: Math.round(
                      (storyMode ? 26 : 29) *
                        titleScale *
                        closingHeadlineFontScale *
                        Z,
                    ),
                    lineHeight: 1.02,
                    fontFamily: ff,
                    fontWeight: titleWeight,
                    fontStyle: titleStyleAttr,
                    textDecoration: titleDecAttr,
                    whiteSpace: "nowrap",
                    borderRadius: Math.round(3 * Z),
                    boxShadow: `0 ${Math.round(7 * Z)}px ${Math.round(22 * Z)}px rgba(0,0,0,.22)`,
                    textShadow: `0 ${Math.round(1 * Z)}px ${Math.round(4 * Z)}px rgba(0,0,0,.35)`,
                    boxSizing: "border-box",
                  }}
                >
                  {line}
                </span>
              ))}
            </div>
          ) : (
            <h3
              style={{
                maxWidth: variant === "ticket" ? "72%" : "96%",
                margin: 0,
                padding: titlePadding,
                borderRadius: titleRadius,
                background: titleBackground,
                color: titleForeground,
                fontSize: Math.round(
                  (storyMode ? 27 : 30) *
                    titleScale *
                    closingTextScale *
                    Z,
                ),
                lineHeight: 1.04,
                fontFamily: ff,
                fontWeight: titleWeight,
                fontStyle: titleStyleAttr,
                textDecoration: titleDecAttr,
                ...safeTextWrap,
                textShadow: titleBackground === "transparent" && !lightPanel ? textShadow : "none",
              }}
            >
              {slide.title}
            </h3>
          )}
          <p
            style={{
              maxWidth: variant === "ticket" ? "70%" : "92%",
              margin: stripedClosing
                ? `auto 0 ${Math.round(14 * Z)}px`
                : `${Math.round((closingCompact ? 8 : 12) * Z)}px 0 ${Math.round((closingCompact ? 12 : 18) * Z)}px`,
              color: closingBodyColor,
              fontSize: Math.max(
                Math.round(10 * Z),
                Math.round((storyMode ? 13 : 14) * closingTextScale * Z),
              ),
              lineHeight: closingCompact ? 1.32 : 1.42,
              fontFamily: ff,
              fontWeight: bodyWeight,
              fontStyle: bodyStyleAttr,
              textDecoration: bodyDecAttr,
              whiteSpace: "pre-wrap",
              ...safeTextWrap,
              textShadow: !lightPanel && variant !== "vibrant" ? bodyShadow : "none",
            }}
          >
            {slide.body}
          </p>
          <div
            style={{
              display: "inline-flex",
              minHeight: Math.round((closingCompact ? 42 : 48) * Z),
              maxWidth: variant === "ticket" ? "76%" : "100%",
              alignItems: "center",
              justifyContent: "center",
              padding: `0 ${Math.round((closingCompact ? 17 : 24) * Z)}px`,
              border: ctaBorder,
              borderRadius: ctaRadius,
              background: ctaBackground,
              color: ctaForeground,
              fontSize: Math.max(
                Math.round(9 * Z),
                Math.round(13 * closingTextScale * Z),
              ),
              lineHeight: 1.15,
              fontWeight: 900,
              textAlign: "center",
              textTransform: "uppercase",
              boxSizing: "border-box",
              ...safeTextWrap,
            }}
          >
            {slide.cta}
          </div>
          {activeContactChannels.includes("whatsapp") && slide.phone && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: Math.round(7 * Z),
                maxWidth: "100%",
                marginTop: Math.round((closingCompact ? 10 : 15) * Z),
                color: closingBodyColor,
                fontSize: Math.max(
                  Math.round(10 * Z),
                  Math.round((storyMode ? 14 : 16) * closingTextScale * Z),
                ),
                lineHeight: 1.2,
                fontWeight: 800,
                textShadow: !lightPanel && variant !== "vibrant" ? bodyShadow : "none",
                ...safeTextWrap,
              }}
            >
              <img
                src="/assets/whatsapp-icon.png"
                alt=""
                aria-hidden="true"
                style={{
                  width: Math.round(20 * Z),
                  height: Math.round(20 * Z),
                  flex: "0 0 auto",
                  objectFit: "contain",
                }}
              />
              <span>{slide.phone}</span>
            </div>
          )}
          {(activeContactChannels.includes("instagram") && slide.instagram) ||
          (activeContactChannels.includes("email") && slide.email) ||
          slide.website ? (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems:
                  contentStyle.alignItems === "center"
                    ? "center"
                    : contentStyle.alignItems === "flex-end"
                      ? "flex-end"
                      : "flex-start",
                gap: `${Math.round(6 * Z)}px ${Math.round(12 * Z)}px`,
                width: "100%",
                maxWidth: variant === "ticket" ? "76%" : "100%",
                marginTop: Math.round((closingCompact ? 6 : 9) * Z),
                color: closingBodyColor,
                fontSize: Math.max(
                  Math.round(9 * Z),
                  Math.round((storyMode ? 12 : 13) * closingTextScale * Z),
                ),
                lineHeight: 1.25,
                fontWeight: 700,
                textShadow: !lightPanel && variant !== "vibrant" ? bodyShadow : "none",
                ...safeTextWrap,
              }}
            >
              {activeContactChannels.includes("instagram") && slide.instagram && (
                <span style={{ display: "inline-flex", maxWidth: "100%", alignItems: "center", gap: Math.round(6 * Z), ...safeTextWrap }}>
                  <Instagram
                    aria-hidden="true"
                    style={{
                      width: Math.round(17 * Z),
                      height: Math.round(17 * Z),
                      color: "#E1306C",
                      flex: "0 0 auto",
                    }}
                  />
                  {slide.instagram}
                </span>
              )}
              {activeContactChannels.includes("email") && slide.email && (
                <span style={{ display: "inline-flex", maxWidth: "100%", alignItems: "center", gap: Math.round(6 * Z), ...safeTextWrap }}>
                  <Mail
                    aria-hidden="true"
                    style={{
                      width: Math.round(17 * Z),
                      height: Math.round(17 * Z),
                      flex: "0 0 auto",
                    }}
                  />
                  {slide.email}
                </span>
              )}
              {slide.website && <span style={{ maxWidth: "100%", ...safeTextWrap }}>{slide.website}</span>}
            </div>
          ) : null}
        </div>
        {renderPositionedLogo()}
      </div>
    );
  }

  return (
    <div
      ref={canvasRef}
      data-carousel-canvas
      style={{
        ...dimensions,
        position: "relative",
        overflow: "hidden",
        isolation: "isolate",
        background: `linear-gradient(145deg, ${primary} 0%, ${secondary} 100%)`,
        color: slide.textColor,
        fontFamily: ff,
        boxSizing: "border-box",
      }}
    >
      {/* â”€â”€ Background Photo & Gradient Overlay (zIndex: 0) â”€â”€ */}
      <div style={{ position: "absolute", inset: 0, zIndex: 0, pointerEvents: "none" }}>
        {slide.imageUrl && (
          <img
            src={slide.imageUrl}
            alt=""
            crossOrigin={
              slide.imageUrl.startsWith("data:") || slide.imageUrl.startsWith("blob:")
                ? undefined
                : "anonymous"
            }
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
        )}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: slide.showShadow === false
              ? "transparent"
              : isClosing
                ? "linear-gradient(180deg, rgba(5, 7, 10, 0.58) 0%, rgba(5, 7, 10, 0.82) 100%)"
                : "linear-gradient(180deg, rgba(5, 7, 10, 0.22) 0%, rgba(5, 7, 10, 0.08) 30%, rgba(5, 7, 10, 0.78) 68%, rgba(5, 7, 10, 0.94) 100%)",
          }}
        />
      </div>

      {/* â”€â”€ Content & Text Boxes (zIndex: 10) â”€â”€ */}
      <div
        style={{
          position: "absolute",
          zIndex: 10,
          inset: ratio < 0.68 && !isClosing ? "14% 0 20%" : 0,
        }}
      >
        {isClosing ? (
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              padding: "11% 9%",
              textAlign: "center",
              boxSizing: "border-box",
            }}
          >
            {logo && (
              <div
                style={{
                  background: "rgba(255, 255, 255, 0.96)",
                  padding: `${Math.round(16 * Z)}px ${Math.round(28 * Z)}px`,
                  borderRadius: Math.round(24 * Z),
                  boxShadow: `0px ${Math.round(8 * Z)}px ${Math.round(24 * Z)}px rgba(0, 0, 0, 0.35)`,
                  marginBottom: Math.round(16 * Z),
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <img
                  src={logo}
                  alt=""
                  crossOrigin={
                    logo.startsWith("data:") || logo.startsWith("blob:")
                      ? undefined
                      : "anonymous"
                  }
                  style={{
                    maxHeight: Math.round((ratio < 0.68 ? 58 : 66) * Z),
                    maxWidth: Math.round(210 * Z),
                    objectFit: "contain",
                  }}
                />
              </div>
            )}

            <h3
              style={{
                maxWidth: "94%",
                margin: `0 0 ${Math.round(8 * Z)}px`,
                color: titleColor,
                fontSize: Math.round((ratio < 0.68 ? 24 : 28) * Z),
                lineHeight: 1.08,
                fontFamily: ff,
                fontWeight: titleWeight,
                fontStyle: titleStyleAttr,
                textDecoration: titleDecAttr,
                textShadow,
              }}
            >
              {slide.title || "Agende agora e garanta sua viagem perfeita"}
            </h3>
            <p
              style={{
                maxWidth: "88%",
                margin: `0 0 ${Math.round(20 * Z)}px`,
                color: bodyColor,
                fontSize: Math.round((ratio < 0.68 ? 13 : 14) * Z),
                lineHeight: 1.45,
                fontFamily: ff,
                fontWeight: bodyWeight,
                fontStyle: bodyStyleAttr,
                textDecoration: bodyDecAttr,
                opacity: 0.92,
                textShadow: bodyShadow,
              }}
            >
              {slide.body || "Atendimento humanizado, parcelamento facilitado e suporte do inÃ­cio ao fim do seu roteiro."}
            </p>

            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                minHeight: Math.round(52 * Z),
                padding: `0 ${Math.round(28 * Z)}px`,
                borderRadius: Math.round(999 * Z),
                background: "#F5F906",
                color: "#111318",
                fontSize: Math.round(15 * Z),
                fontWeight: 900,
                letterSpacing: ".04em",
                textTransform: "uppercase",
                boxShadow: slide.showShadow === false ? "none" : `0px ${Math.round(8 * Z)}px ${Math.round(26 * Z)}px rgba(245, 249, 6, 0.28)`,
              }}
            >
              {slide.cta}
            </div>

            {slide.phone && (
              <div
                style={{
                  marginTop: Math.round(18 * Z),
                  color: "#F8FAFC",
                  fontSize: Math.round((ratio < 0.68 ? 18 : 20) * Z),
                  lineHeight: 1.2,
                  fontWeight: 800,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: Math.round(8 * Z),
                  textShadow: slide.showShadow === false ? "none" : `0px ${Math.round(2 * Z)}px ${Math.round(12 * Z)}px rgba(0, 0, 0, 0.82)`,
                }}
              >
                <svg width={Math.round(20 * Z)} height={Math.round(20 * Z)} viewBox="0 0 24 24" fill="#25D366" style={{ filter: "drop-shadow(0px 2px 6px rgba(0, 0, 0, 0.5))" }}>
                  <path d="M11.999 0C5.373 0 0 5.373 0 12c0 2.126.556 4.196 1.614 6.012L.053 23.947l6.096-1.597C7.935 23.411 9.948 24 11.999 24 18.626 24 24 18.627 24 12S18.626 0 11.999 0zm6.166 17.067c-.259.73-1.512 1.405-2.09 1.463-.559.055-1.079.255-3.468-.682-2.885-1.132-4.757-4.088-4.901-4.281-.143-.193-1.173-1.564-1.173-2.984 0-1.42.744-2.122 1.009-2.414.259-.285.566-.356.755-.356.188 0 .376.002.541.011.174.009.407-.066.638.489.236.568.804 1.956.874 2.101.07.145.117.315.022.507-.095.193-.143.315-.284.482-.143.167-.301.374-.429.501-.143.143-.292.298-.125.586.167.288.742 1.228 1.596 1.986 1.101.977 2.031 1.281 2.319 1.424.288.143.456.12.625-.072.167-.193.717-.837.908-1.124.193-.288.384-.24.649-.143.264.098 1.68 0.793 1.968.937.288.143.479.215.549.335.071.12.071.698-.188 1.428z" />
                </svg>
                <span>{slide.phone}</span>
              </div>
            )}
            {slide.instagram && (
              <div
                style={{
                  marginTop: Math.round(10 * Z),
                  color: "#F8FAFC",
                  fontSize: Math.round(15 * Z),
                  lineHeight: 1.2,
                  fontWeight: 700,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: Math.round(8 * Z),
                  textShadow: slide.showShadow === false ? "none" : `0px ${Math.round(2 * Z)}px ${Math.round(12 * Z)}px rgba(0, 0, 0, 0.82)`,
                }}
              >
                <svg width={Math.round(18 * Z)} height={Math.round(18 * Z)} viewBox="0 0 24 24" fill="currentColor" style={{ filter: "drop-shadow(0px 2px 6px rgba(0, 0, 0, 0.5))" }}>
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
                </svg>
                <span>{slide.instagram}</span>
              </div>
            )}
            {slide.website && (
              <div
                style={{
                  marginTop: Math.round(8 * Z),
                  color: "#F8FAFC",
                  fontSize: Math.round(15 * Z),
                  lineHeight: 1.2,
                  fontWeight: 700,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: Math.round(8 * Z),
                  textShadow: slide.showShadow === false ? "none" : `0px ${Math.round(2 * Z)}px ${Math.round(12 * Z)}px rgba(0, 0, 0, 0.82)`,
                }}
              >
                <svg width={Math.round(18 * Z)} height={Math.round(18 * Z)} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ filter: "drop-shadow(0px 2px 6px rgba(0, 0, 0, 0.5))" }}>
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="2" y1="12" x2="22" y2="12"/>
                  <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
                </svg>
                <span>{slide.website}</span>
              </div>
            )}
          </div>
        ) : (
          /* â”€â”€ CONTENT SLIDES â€” 3 visual variants â”€â”€ */
          <>
            {/* â”€â”€â”€ VARIANT: IMPACT (default) â€” full-bleed photo, content at bottom â”€â”€â”€ */}
            {(slide.slideVariant === "impact" || !slide.slideVariant) && (
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  boxSizing: "border-box",
                }}
              >
                <div style={{ position: "absolute", left: "8%", right: "8%", top: "8%", display: "flex", alignItems: "center", justifyContent: "space-between", gap: Math.round(12 * Z) }}>
                  {logo ? (
                    <img
                      src={logo}
                      alt=""
                      crossOrigin={logo.startsWith("data:") || logo.startsWith("blob:") ? undefined : "anonymous"}
                      style={{ width: Math.round(42 * Z), height: Math.round(42 * Z), borderRadius: Math.round(12 * Z), objectFit: "contain", background: "rgba(255, 255, 255, 0.94)", padding: Math.round(5 * Z), boxShadow: `0px ${Math.round(8 * Z)}px ${Math.round(24 * Z)}px rgba(0, 0, 0, 0.24)` }}
                    />
                  ) : <span />}
                </div>
                <div style={{ position: "absolute", left: "8%", right: "8%", bottom: "14%" }}>
                  {renderLabel(slide.label)}
                  {slide.title && (
                    <h3 style={{ maxWidth: "88%", margin: 0, color: titleColor, fontSize: Math.round((ratio < 0.68 ? 30 : 34) * titleScale * Z), lineHeight: 1.04, fontFamily: ff, fontWeight: titleWeight, fontStyle: titleStyleAttr, textDecoration: titleDecAttr, ...safeTextWrap, textShadow }}>
                      {slide.title}
                    </h3>
                  )}
                  {slide.body && (
                    <p style={{ maxWidth: "88%", margin: `${Math.round(11 * Z)}px 0 0`, color: bodyColor, fontSize: Math.round((ratio < 0.68 ? 12 : 13) * Z), lineHeight: 1.42, fontFamily: ff, fontWeight: bodyWeight, fontStyle: bodyStyleAttr, textDecoration: bodyDecAttr, opacity: 0.94, ...safeTextWrap, whiteSpace: "pre-wrap", textShadow: bodyShadow }}>
                      {slide.body}
                    </p>
                  )}
                  {renderBullets({ color: bulletColor, max: 4, columns: 2, textShadow: bulletShadow })}
                </div>
              </div>
            )}

            {/* â”€â”€â”€ VARIANT: ITINERARY â€” photo top ~45%, colored block bottom â”€â”€â”€ */}
            {slide.slideVariant === "itinerary" && (
              <div style={{ position: "absolute", inset: 0, boxSizing: "border-box" }}>
                {logo && (
                  <img
                    src={logo}
                    alt=""
                    crossOrigin={logo.startsWith("data:") || logo.startsWith("blob:") ? undefined : "anonymous"}
                    style={{ position: "absolute", top: "7%", left: "7%", width: Math.round(36 * Z), height: Math.round(36 * Z), borderRadius: Math.round(10 * Z), objectFit: "contain", background: "rgba(255, 255, 255, 0.94)", padding: Math.round(4 * Z), zIndex: 5, boxShadow: `0px ${Math.round(4 * Z)}px ${Math.round(16 * Z)}px rgba(0, 0, 0, 0.22)` }}
                  />
                )}
                <div
                  style={{
                    position: "absolute",
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: "rgba(8, 9, 11, 0.92)",
                    color: bodyColor,
                    padding: isDenseSlide ? "4.5% 8% 5%" : "6.5% 8% 7.5%",
                    boxSizing: "border-box",
                    borderTop: `${Math.max(2, Math.round(3 * Z))}px solid ${secondary}`,
                    boxShadow: `0 ${Math.round(-12 * Z)}px ${Math.round(32 * Z)}px rgba(0,0,0,.24)`,
                  }}
                >
                  {renderLabel(slide.label)}
                  {slide.title && (
                    <h3 style={{ maxWidth: "92%", margin: 0, color: titleColor, fontSize: Math.max(11, Math.round((isDenseSlide ? 19 : ratio < 0.68 ? 24 : 28) * titleScale * denseTextScale * Z)), lineHeight: 1.06, fontFamily: ff, fontWeight: titleWeight, fontStyle: titleStyleAttr, textDecoration: titleDecAttr, ...safeTextWrap, textShadow }}>
                      {slide.title}
                    </h3>
                  )}
                  {slide.body && (
                    <p style={{ maxWidth: "92%", margin: `${Math.round((isDenseSlide ? 6 : 9) * denseTextScale * Z)}px 0 0`, color: bodyColor, fontSize: Math.max(6, Math.round((isDenseSlide ? 10.25 : 12) * denseTextScale * Z)), lineHeight: isDenseSlide ? 1.24 : 1.38, fontFamily: ff, fontWeight: bodyWeight, fontStyle: bodyStyleAttr, textDecoration: bodyDecAttr, opacity: 0.94, ...safeTextWrap, whiteSpace: "pre-wrap", textShadow: bodyShadow }}>
                      {slide.body}
                    </p>
                  )}
                  {renderBullets({ color: bulletColor, max: 4, numbered: true, textShadow: bulletShadow, compact: isDenseSlide, scale: denseTextScale })}
                </div>
              </div>
            )}

            {/* â”€â”€â”€ VARIANT: EDITORIAL â€” useful guide with photo-forward split layout â”€â”€â”€ */}
            {slide.slideVariant === "editorial" && (
              <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: contentOnRight ? "row-reverse" : "row", alignItems: "stretch" }}>
                <div
                  style={{
                    width: ratio < 0.68 ? "58%" : "52%",
                    minWidth: 0,
                    background: "#F3F2EE",
                    padding: "8% 6%",
                    boxSizing: "border-box",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: contentOnRight ? "flex-end" : "flex-start",
                    textAlign: contentOnRight ? "right" : "left",
                    borderRight: contentOnRight ? undefined : `${Math.round(4 * Z)}px solid ${secondary}`,
                    borderLeft: contentOnRight ? `${Math.round(4 * Z)}px solid ${secondary}` : undefined,
                  }}
                >
                  {renderLabel(slide.label, contentOnRight ? "right" : "left")}
                  {slide.title && (
                    <h3 style={{ margin: 0, color: titleColor, fontSize: Math.round((ratio < 0.68 ? 20 : 23) * titleScale * Z), lineHeight: 1.06, fontFamily: ff, fontWeight: titleWeight, fontStyle: titleStyleAttr, textDecoration: titleDecAttr, ...safeTextWrap }}>
                      {slide.title}
                    </h3>
                  )}
                  {slide.body && (
                    <p style={{ margin: `${Math.round(11 * Z)}px 0 0`, color: bodyColor, fontSize: Math.round(11.5 * Z), lineHeight: 1.42, fontFamily: ff, fontWeight: bodyWeight, fontStyle: bodyStyleAttr, textDecoration: bodyDecAttr, whiteSpace: "pre-wrap" }}>
                      {slide.body}
                    </p>
                  )}
                  {renderBullets({ color: bulletColor, max: 4, align: contentOnRight ? "right" : "left" })}
                </div>
                <div style={{ position: "relative", flex: 1 }}>
                  {logo && (
                    <img
                      src={logo}
                      alt=""
                      crossOrigin={logo.startsWith("data:") || logo.startsWith("blob:") ? undefined : "anonymous"}
                      style={{ position: "absolute", right: "12%", top: "8%", width: Math.round(36 * Z), height: Math.round(36 * Z), borderRadius: Math.round(9 * Z), objectFit: "contain", background: "rgba(255,255,255,.94)", padding: Math.round(4 * Z) }}
                    />
                  )}
                </div>
              </div>
            )}

            {/* â”€â”€â”€ VARIANT: OFERTA â€” conversion panel using the agency palette â”€â”€â”€ */}
            {slide.slideVariant === "oferta" && (() => {
              const offerTitleSize = isDenseSlide ? 19 : titleLength > 38 ? 22 : ratio < 0.68 ? 25 : 28;
              return (
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "flex-end",
                    alignItems: "center",
                    boxSizing: "border-box",
                  }}
                >
                  <div style={{ position: "absolute", top: "7%", right: "7%", zIndex: 12 }}>
                    {logo ? (
                      <img
                        src={logo}
                        alt=""
                        crossOrigin={logo.startsWith("data:") || logo.startsWith("blob:") ? undefined : "anonymous"}
                        style={{ width: Math.round(40 * Z), height: Math.round(40 * Z), borderRadius: Math.round(10 * Z), objectFit: "contain", background: "rgba(255, 255, 255, 0.94)", padding: Math.round(5 * Z), boxShadow: `0px ${Math.round(6 * Z)}px ${Math.round(20 * Z)}px rgba(0, 0, 0, 0.24)` }}
                      />
                    ) : <span />}
                  </div>
                  <div
                    style={{
                      width: "82%",
                      background: "rgba(8, 9, 11, 0.94)",
                      color: bodyColor,
                      padding: isDenseSlide ? "4.5% 8%" : "6% 8%",
                      borderTop: `${Math.max(3, Math.round(5 * Z))}px solid ${primary}`,
                      borderLeft: `${Math.max(1, Math.round(2 * Z))}px solid ${primary}`,
                      borderRight: `${Math.max(1, Math.round(2 * Z))}px solid ${primary}`,
                      borderTopLeftRadius: Math.round(24 * Z),
                      borderTopRightRadius: Math.round(24 * Z),
                      boxShadow: `0 ${Math.round(-10 * Z)}px ${Math.round(34 * Z)}px rgba(0, 0, 0, 0.2)`,
                      position: "relative",
                      zIndex: 10,
                      boxSizing: "border-box",
                      textAlign: "center",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "center" }}>
                      {renderLabel(slide.label, "center")}
                    </div>
                    {slide.title && (
                      <h3 style={{ maxWidth: "92%", margin: "0 auto", color: titleColor, fontSize: Math.max(11, Math.round(offerTitleSize * titleScale * denseTextScale * Z)), lineHeight: 1.04, fontFamily: ff, fontWeight: titleWeight, fontStyle: titleStyleAttr, textDecoration: titleDecAttr, ...safeTextWrap }}>
                        {slide.title}
                      </h3>
                    )}
                    {slide.body && (
                      <p style={{ maxWidth: "92%", margin: `${Math.round((isDenseSlide ? 7 : 10) * denseTextScale * Z)}px auto 0`, color: bodyColor, fontSize: Math.max(6, Math.round((isDenseSlide ? 10.5 : 12.5) * denseTextScale * Z)), lineHeight: isDenseSlide ? 1.24 : 1.4, fontFamily: ff, fontWeight: bodyWeight, fontStyle: bodyStyleAttr, textDecoration: bodyDecAttr, opacity: 0.94, whiteSpace: "pre-wrap" }}>
                        {slide.body}
                      </p>
                    )}
                    {renderBullets({ color: bulletColor, max: 4, columns: 2, align: "center", compact: isDenseSlide, scale: denseTextScale })}
                  </div>
                </div>
              );
            })()}

            {/* â”€â”€â”€ VARIANT: MINIMALIST â€” quiet service-led composition â”€â”€â”€ */}
            {slide.slideVariant === "minimalist" && (
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "flex-end",
                  boxSizing: "border-box",
                }}
              >
                {logo && (
                  <img
                    src={logo}
                    alt=""
                    crossOrigin={logo.startsWith("data:") || logo.startsWith("blob:") ? undefined : "anonymous"}
                    style={{ position: "absolute", right: "7%", top: "7%", width: Math.round(38 * Z), height: Math.round(38 * Z), borderRadius: Math.round(9 * Z), objectFit: "contain", background: "rgba(255,255,255,.94)", padding: Math.round(4 * Z), boxShadow: `0 ${Math.round(6 * Z)}px ${Math.round(18 * Z)}px rgba(0,0,0,.22)` }}
                  />
                )}
                <div style={{ background: "rgba(248,248,246,0.98)", color: titleColor, padding: isDenseSlide ? "4.5% 8%" : "6.5% 8%", borderTop: `${Math.max(3, Math.round(5 * Z))}px solid ${primary}`, boxShadow: `0 ${Math.round(-10 * Z)}px ${Math.round(32 * Z)}px rgba(0,0,0,.2)`, boxSizing: "border-box" }}>
                  {renderLabel(slide.label)}
                  {slide.title && (
                    <h3 style={{ maxWidth: "88%", margin: 0, color: titleColor, fontSize: Math.round((ratio < 0.68 ? 27 : 31) * titleScale * Z), lineHeight: 1.04, fontFamily: ff, fontWeight: titleWeight, fontStyle: titleStyleAttr, textDecoration: titleDecAttr, ...safeTextWrap }}>
                      {slide.title}
                    </h3>
                  )}
                  {slide.body && (
                    <p style={{ maxWidth: "92%", margin: `${Math.round(10 * Z)}px 0 0`, color: bodyColor, fontSize: Math.round(12.5 * Z), lineHeight: 1.42, fontFamily: ff, fontWeight: bodyWeight, fontStyle: bodyStyleAttr, textDecoration: bodyDecAttr, whiteSpace: "pre-wrap" }}>
                      {slide.body}
                    </p>
                  )}
                  {renderBullets({ color: bulletColor, max: 3, columns: 2 })}
                </div>
              </div>
            )}

            {/* â”€â”€â”€ VARIANT: VIBRANT â€” FAQ split layout without decorative gradients â”€â”€â”€ */}
            {slide.slideVariant === "vibrant" && (() => {
              const faqTitleSize = isDenseSlide ? 16 : titleLength > 38 ? 18 : ratio < 0.68 ? 20 : 23;
              return (
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    display: "flex",
                    flexDirection: contentOnRight ? "row-reverse" : "row",
                    alignItems: "stretch",
                    boxSizing: "border-box",
                  }}
                >
                  <div
                    style={{
                      width: ratio < 0.68 ? "58%" : "52%",
                      minWidth: 0,
                      background: primary,
                      color: titleColor,
                      padding: isDenseSlide ? "5.5% 7.5%" : "9% 7.5%",
                      borderTop: `${Math.max(4, Math.round(7 * Z))}px solid ${secondary}`,
                      boxSizing: "border-box",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "center",
                      alignItems: contentOnRight ? "flex-end" : "flex-start",
                      textAlign: contentOnRight ? "right" : "left",
                      boxShadow: `${(contentOnRight ? -1 : 1) * Math.round(10 * Z)}px 0 ${Math.round(32 * Z)}px rgba(0,0,0,.2)`,
                    }}
                  >
                    {renderLabel(slide.label, contentOnRight ? "right" : "left")}
                    {slide.title && (
                      <h3 style={{ maxWidth: "94%", margin: 0, color: titleColor, fontSize: Math.max(11, Math.round(faqTitleSize * titleScale * denseTextScale * Z)), lineHeight: 1.05, fontFamily: ff, fontWeight: titleWeight, fontStyle: titleStyleAttr, textDecoration: titleDecAttr, ...safeTextWrap }}>
                        {slide.title}
                      </h3>
                    )}
                    {slide.body && (
                      <p style={{ maxWidth: "94%", margin: `${Math.round((isDenseSlide ? 7 : 10) * denseTextScale * Z)}px 0 0`, color: bodyColor, fontSize: Math.max(6, Math.round((isDenseSlide ? 10.25 : 12) * denseTextScale * Z)), lineHeight: isDenseSlide ? 1.24 : 1.4, fontFamily: ff, fontWeight: bodyWeight, fontStyle: bodyStyleAttr, textDecoration: bodyDecAttr, opacity: 0.9 }}>
                        {slide.body}
                      </p>
                    )}
                    {renderBullets({ color: bulletColor, max: 4, numbered: true, compact: isDenseSlide, scale: denseTextScale, align: contentOnRight ? "right" : "left" })}
                  </div>
                  <div style={{ position: "relative", flex: 1 }}>
                    {logo && (
                      <img
                        src={logo}
                        alt=""
                        crossOrigin={logo.startsWith("data:") || logo.startsWith("blob:") ? undefined : "anonymous"}
                        style={{ position: "absolute", right: "13%", top: "8%", width: Math.round(38 * Z), height: Math.round(38 * Z), borderRadius: Math.round(9 * Z), objectFit: "contain", background: "rgba(255,255,255,.94)", padding: Math.round(4 * Z), boxShadow: `0 ${Math.round(6 * Z)}px ${Math.round(18 * Z)}px rgba(0,0,0,.22)` }}
                      />
                    )}
                  </div>
                </div>
              );
            })()}

            {/* Curved editorial panel with alternating visual rhythm. */}
            {slide.slideVariant === "organic" && (() => {
              const alignRight = contentOnRight;
              return (
                <div style={{ position: "absolute", inset: 0, boxSizing: "border-box" }}>
                  {logo && (
                    <img
                      src={logo}
                      alt=""
                      crossOrigin={logo.startsWith("data:") || logo.startsWith("blob:") ? undefined : "anonymous"}
                      style={{ position: "absolute", [alignRight ? "left" : "right"]: "7%", top: "7%", width: Math.round(38 * Z), height: Math.round(38 * Z), borderRadius: Math.round(9 * Z), objectFit: "contain", background: "rgba(255,255,255,.94)", padding: Math.round(4 * Z), boxShadow: `0 ${Math.round(6 * Z)}px ${Math.round(18 * Z)}px rgba(0,0,0,.22)` }}
                    />
                  )}
                  <div
                    style={{
                      position: "absolute",
                      [alignRight ? "right" : "left"]: 0,
                      bottom: 0,
                      width: "91%",
                      padding: isDenseSlide ? "5% 8%" : "7% 8% 7.5%",
                      background: "rgba(248,248,246,.97)",
                      borderTop: `${Math.max(3, Math.round(5 * Z))}px solid ${primary}`,
                      borderTopLeftRadius: alignRight ? Math.round(118 * Z) : 0,
                      borderTopRightRadius: alignRight ? 0 : Math.round(118 * Z),
                      boxShadow: `0 ${Math.round(-12 * Z)}px ${Math.round(34 * Z)}px rgba(0,0,0,.2)`,
                      boxSizing: "border-box",
                      textAlign: alignRight ? "right" : "left",
                    }}
                  >
                    <div style={{ display: "flex", flexDirection: "column", alignItems: alignRight ? "flex-end" : "flex-start" }}>
                      {renderLabel(slide.label, alignRight ? "right" : "left")}
                      {slide.title && (
                        <h3 style={{ maxWidth: "82%", margin: 0, color: titleColor, fontSize: Math.round((ratio < 0.68 ? 25 : 30) * titleScale * Z), lineHeight: 1.04, fontFamily: ff, fontWeight: titleWeight, fontStyle: titleStyleAttr, textDecoration: titleDecAttr, ...safeTextWrap }}>
                          {slide.title}
                        </h3>
                      )}
                      {slide.body && (
                        <p style={{ maxWidth: "84%", margin: `${Math.round(10 * Z)}px 0 0`, color: bodyColor, fontSize: Math.round(12.5 * Z), lineHeight: 1.42, fontFamily: ff, fontWeight: bodyWeight, fontStyle: bodyStyleAttr, textDecoration: bodyDecAttr, whiteSpace: "pre-wrap" }}>
                          {slide.body}
                        </p>
                      )}
                      {renderBullets({ color: bulletColor, max: 4, columns: 2, align: alignRight ? "right" : "left" })}
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Transparent panel keeps the destination visible while separating copy. */}
            {slide.slideVariant === "glass" && (() => {
              const alignRight = contentOnRight;
              return (
                <div style={{ position: "absolute", inset: 0, boxSizing: "border-box" }}>
                  {logo && (
                    <img
                      src={logo}
                      alt=""
                      crossOrigin={logo.startsWith("data:") || logo.startsWith("blob:") ? undefined : "anonymous"}
                      style={{ position: "absolute", [alignRight ? "left" : "right"]: "7%", top: "7%", width: Math.round(38 * Z), height: Math.round(38 * Z), borderRadius: Math.round(9 * Z), objectFit: "contain", background: "rgba(255,255,255,.94)", padding: Math.round(4 * Z), boxShadow: `0 ${Math.round(6 * Z)}px ${Math.round(18 * Z)}px rgba(0,0,0,.22)` }}
                    />
                  )}
                  <div
                    style={{
                      position: "absolute",
                      [alignRight ? "right" : "left"]: "7%",
                      bottom: "9%",
                      width: ratio < 0.68 ? "82%" : "72%",
                      padding: isDenseSlide ? "5% 7%" : "6.5% 7%",
                      background: "rgba(8,9,11,.78)",
                      border: "1px solid rgba(255,255,255,.38)",
                      borderRadius: Math.round(24 * Z),
                      boxShadow: `0 ${Math.round(16 * Z)}px ${Math.round(42 * Z)}px rgba(0,0,0,.34)`,
                      boxSizing: "border-box",
                      textAlign: alignRight ? "right" : "left",
                    }}
                  >
                    <div style={{ display: "flex", flexDirection: "column", alignItems: alignRight ? "flex-end" : "flex-start" }}>
                      {renderLabel(slide.label, alignRight ? "right" : "left")}
                      {slide.title && (
                        <h3 style={{ maxWidth: "94%", margin: 0, color: titleColor, fontSize: Math.round((ratio < 0.68 ? 25 : 29) * titleScale * Z), lineHeight: 1.05, fontFamily: ff, fontWeight: titleWeight, fontStyle: titleStyleAttr, textDecoration: titleDecAttr, textShadow, ...safeTextWrap }}>
                          {slide.title}
                        </h3>
                      )}
                      {slide.body && (
                        <p style={{ maxWidth: "94%", margin: `${Math.round(10 * Z)}px 0 0`, color: bodyColor, fontSize: Math.round(12 * Z), lineHeight: 1.42, fontFamily: ff, fontWeight: bodyWeight, fontStyle: bodyStyleAttr, textDecoration: bodyDecAttr, textShadow: bodyShadow, whiteSpace: "pre-wrap" }}>
                          {slide.body}
                        </p>
                      )}
                      {renderBullets({ color: bulletColor, max: 4, columns: 1, textShadow: bulletShadow, align: alignRight ? "right" : "left" })}
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Brand headline: full-bleed image with an automatic-contrast gradient hook. */}
            {isHeadlineVariant(slide.slideVariant) && (() => {
              const storyMode = ratio < 0.68;
              const headlineLines = splitBalancedHeadline(slide.title);
              const centeredLayout = slide.slideVariant === "headline-center";
              const footerLayout = slide.slideVariant === "headline-footer";
              const informationAtBottom =
                isLastContent ||
                centeredLayout ||
                footerLayout ||
                slide.slideVariant === "headline";
              const longestHeadline = Math.max(0, ...headlineLines.map((line) => line.length));
              const headlineFontScale = Math.max(
                0.42,
                Math.min(1, 19 / Math.max(19, longestHeadline)),
              );
              const lowerContentInset =
                centeredLayout
                  ? { left: "8%", right: "8%" }
                  : logoIsBottom && logoIsLeft
                  ? { left: "20%", right: "8%" }
                  : logoIsBottom
                    ? { left: "8%", right: "20%" }
                    : { left: "8%", right: "8%" };
              return (
                <div style={{ position: "absolute", inset: 0, boxSizing: "border-box" }}>
                  <div
                    style={{
                      position: "absolute",
                      top: footerLayout
                        ? undefined
                        : centeredLayout
                          ? storyMode ? "38%" : "36%"
                        : logoSource && !logoIsBottom
                          ? storyMode ? "14%" : "15%"
                          : storyMode ? "6%" : "9%",
                      bottom: footerLayout ? (storyMode ? "26%" : "24%") : undefined,
                      left: "8%",
                      right: "8%",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: centeredLayout ? "center" : "flex-start",
                    }}
                  >
                    {renderLabel(slide.label, centeredLayout ? "center" : "left")}
                    {slide.title && (
                      <div
                        style={{
                          maxWidth: "88%",
                          margin: 0,
                          fontFamily: ff,
                          fontStyle: titleStyleAttr,
                          textDecoration: titleDecAttr,
                          textAlign: centeredLayout ? "center" : "left",
                        }}
                      >
                        {headlineLines.map((line, lineIndex) => (
                          <span
                            key={`${slide.id}-headline-${lineIndex}`}
                            style={{
                              display: "table",
                              width: "fit-content",
                              maxWidth: "100%",
                              marginTop: lineIndex ? Math.round(3 * Z) : 0,
                              marginLeft: centeredLayout ? "auto" : 0,
                              marginRight: centeredLayout ? "auto" : 0,
                              padding: `${Math.round(5 * Z)}px ${Math.round(13 * Z)}px`,
                              background: `linear-gradient(100deg, rgba(0,0,0,.28), rgba(0,0,0,.18)), linear-gradient(${96 + lineIndex * 7}deg, ${primary} 0%, ${secondary} 100%)`,
                              color: "#FFFFFF",
                              fontSize: Math.round((storyMode ? 29 : 33) * titleScale * headlineFontScale * Z),
                              lineHeight: 1.02,
                              fontWeight: titleWeight,
                              whiteSpace: "nowrap",
                              borderRadius: Math.round(3 * Z),
                              boxShadow: `0 ${Math.round(7 * Z)}px ${Math.round(22 * Z)}px rgba(0,0,0,.22)`,
                              textShadow: `0 ${Math.round(1 * Z)}px ${Math.round(4 * Z)}px rgba(0,0,0,.35)`,
                              boxSizing: "border-box",
                            }}
                          >
                            {line}
                          </span>
                        ))}
                      </div>
                    )}
                    {!informationAtBottom && slide.body && (
                      <p
                        style={{
                          maxWidth: "82%",
                          margin: `${Math.round(18 * Z)}px 0 0`,
                          color: bodyColor,
                          fontSize: Math.round((storyMode ? 15 : 16) * Z),
                          lineHeight: 1.38,
                          fontFamily: ff,
                          fontWeight: bodyWeight,
                          fontStyle: bodyStyleAttr,
                          textDecoration: bodyDecAttr,
                          whiteSpace: "pre-wrap",
                          textShadow: bodyShadow,
                        }}
                      >
                        {slide.body}
                      </p>
                    )}
                    {!informationAtBottom &&
                      renderBullets({ color: bulletColor, max: 4, textShadow: bulletShadow })}
                  </div>
                  {informationAtBottom && (slide.body || slide.bullets.some(Boolean)) && (
                    <div
                      style={{
                        position: "absolute",
                        ...lowerContentInset,
                        bottom: logoSource && logoIsBottom
                          ? storyMode ? "15%" : "16%"
                          : storyMode ? "9%" : "8%",
                        padding: `${Math.round(16 * Z)}px ${Math.round(18 * Z)}px`,
                        color: "#FFFFFF",
                        textAlign: centeredLayout ? "center" : "left",
                        background:
                          "linear-gradient(180deg, rgba(5,7,10,.82) 0%, rgba(5,7,10,.16) 100%)",
                        borderTop: "1px solid rgba(255,255,255,.3)",
                        borderRadius: `${Math.round(12 * Z)}px ${Math.round(12 * Z)}px ${Math.round(4 * Z)}px ${Math.round(4 * Z)}px`,
                        boxShadow: `0 -${Math.round(10 * Z)}px ${Math.round(30 * Z)}px rgba(5,7,10,.3)`,
                        boxSizing: "border-box",
                      }}
                    >
                      {slide.body && (
                        <p
                          style={{
                            margin: 0,
                            color: "#FFFFFF",
                            fontSize: Math.round((storyMode ? 14 : 15) * Z),
                            lineHeight: 1.38,
                            fontFamily: ff,
                            fontWeight: bodyWeight,
                            fontStyle: bodyStyleAttr,
                            textDecoration: bodyDecAttr,
                            whiteSpace: "pre-wrap",
                            textShadow: bodyShadow,
                            textAlign: centeredLayout ? "center" : "left",
                          }}
                        >
                          {slide.body}
                        </p>
                      )}
                      {renderBullets({
                        color: "#FFFFFF",
                        max: 4,
                        compact: true,
                        textShadow: bulletShadow,
                        align: centeredLayout ? "center" : "left",
                      })}
                    </div>
                  )}
                </div>
              );
            })()}

            {/* Boarding pass: travel-native layout with a perforated information stub. */}
            {slide.slideVariant === "ticket" && (() => {
              const storyMode = ratio < 0.68;
              return (
                <div style={{ position: "absolute", inset: 0, boxSizing: "border-box" }}>
                  {logo && (
                    <img
                      src={logo}
                      alt=""
                      crossOrigin={logo.startsWith("data:") || logo.startsWith("blob:") ? undefined : "anonymous"}
                      style={{
                        position: "absolute",
                        left: "8%",
                        top: storyMode ? "1%" : "7%",
                        width: Math.round(38 * Z),
                        height: Math.round(38 * Z),
                        borderRadius: Math.round(9 * Z),
                        objectFit: "contain",
                        background: "rgba(255,255,255,.94)",
                        padding: Math.round(4 * Z),
                        boxShadow: `0 ${Math.round(6 * Z)}px ${Math.round(18 * Z)}px rgba(0,0,0,.22)`,
                      }}
                    />
                  )}
                  <div
                    style={{
                      position: "absolute",
                      left: "7%",
                      right: "7%",
                      bottom: storyMode ? 0 : "8%",
                      padding: isDenseSlide ? "5% 25% 5% 8%" : "7% 25% 7% 8%",
                      background: "#F6F2E9",
                      color: "#17191D",
                      border: `${Math.max(1, Math.round(2 * Z))}px solid ${primary}`,
                      borderRadius: Math.round(14 * Z),
                      boxShadow: `0 ${Math.round(18 * Z)}px ${Math.round(44 * Z)}px rgba(0,0,0,.3)`,
                      boxSizing: "border-box",
                    }}
                  >
                    <div
                      aria-hidden="true"
                      style={{
                        position: "absolute",
                        top: "9%",
                        bottom: "9%",
                        right: "20%",
                        borderRight: `${Math.max(1, Math.round(2 * Z))}px dashed ${safeHexToRgba(primary, 0.48)}`,
                      }}
                    />
                    <div
                      aria-hidden="true"
                      style={{
                        position: "absolute",
                        right: "6%",
                        top: "12%",
                        bottom: "12%",
                        width: "8%",
                        borderRadius: Math.round(4 * Z),
                        background: `repeating-linear-gradient(90deg, ${primary} 0 ${Math.round(2 * Z)}px, transparent ${Math.round(2 * Z)}px ${Math.round(4 * Z)}px)`,
                        opacity: 0.72,
                      }}
                    />
                    {renderLabel(slide.label)}
                    {slide.title && (
                      <h3 style={{ maxWidth: "96%", margin: 0, color: titleColor, fontSize: Math.round((storyMode ? 26 : 30) * titleScale * Z), lineHeight: 1.04, fontFamily: ff, fontWeight: titleWeight, fontStyle: titleStyleAttr, textDecoration: titleDecAttr, ...safeTextWrap }}>
                        {slide.title}
                      </h3>
                    )}
                    {slide.body && (
                      <p style={{ maxWidth: "96%", margin: `${Math.round(10 * Z)}px 0 0`, color: bodyColor, fontSize: Math.round(12 * Z), lineHeight: 1.4, fontFamily: ff, fontWeight: bodyWeight, fontStyle: bodyStyleAttr, textDecoration: bodyDecAttr, whiteSpace: "pre-wrap" }}>
                        {slide.body}
                      </p>
                    )}
                    {renderBullets({ color: bulletColor, max: 4, compact: true })}
                  </div>
                </div>
              );
            })()}
          </>
        )}
      </div>
      {renderPositionedLogo()}
    </div>
  );
}

function ScaledSlidePreview({
  slide,
  index,
  total,
  ratio,
  logo,
  logoPosition,
  primary,
  secondary,
  width,
}: {
  slide: CarouselSlide;
  index: number;
  total: number;
  ratio: number;
  logo: string;
  logoPosition: LogoPosition;
  primary: string;
  secondary: string;
  width: number;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [parentWidth, setParentWidth] = useState<number>(width);

  useEffect(() => {
    const el = containerRef.current?.parentElement;
    if (!el) return;
    const updateWidth = () => {
      if (el.clientWidth > 0) {
        setParentWidth(el.clientWidth);
      }
    };
    updateWidth();
    const observer = new ResizeObserver(() => updateWidth());
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const effectiveWidth = Math.min(width, parentWidth || width);
  const baseWidth = 432;
  const baseHeight = Math.round(baseWidth / ratio);
  const scale = effectiveWidth / baseWidth;
  const targetHeight = Math.round(effectiveWidth / ratio);

  return (
    <div
      ref={containerRef}
      style={{
        width: `${effectiveWidth}px`,
        maxWidth: "100%",
        height: `${targetHeight}px`,
        position: "relative",
        overflow: "hidden",
        background: "#08090B",
        margin: "0 auto",
      }}
    >
      <div
        style={{
          width: `${baseWidth}px`,
          height: `${baseHeight}px`,
          transformOrigin: "top left",
          transform: `scale(${scale})`,
          pointerEvents: "none",
        }}
      >
        <CarouselCanvas
          slide={slide}
          index={index}
          total={total}
          ratio={ratio}
          logo={logo}
          logoPosition={logoPosition}
          primary={primary}
          secondary={secondary}
        />
      </div>
    </div>
  );
}

function MiniTypographyBar({
  style = {},
  fallbackBold = false,
  fallbackColor = "#FFFFFF",
  primaryColor = "#F5F906",
  secondaryColor = "#00F0FF",
  onChange,
  isEs = false,
  compact = false,
  vertical = false,
}: {
  style?: FieldTypography;
  fallbackBold?: boolean;
  fallbackColor?: string;
  primaryColor?: string;
  secondaryColor?: string;
  onChange: (updated: FieldTypography) => void;
  isEs?: boolean;
  compact?: boolean;
  vertical?: boolean;
}) {
  const [showHexInput, setShowHexInput] = useState(false);
  const [hexInput, setHexInput] = useState("");

  const isBold = style.bold !== undefined ? style.bold : fallbackBold;
  const isItalic = style.italic !== undefined ? style.italic : false;
  const isUnderline = style.underline !== undefined ? style.underline : false;
  const currentColor = style.color || fallbackColor;

  const handleColorClick = (hex: string) => {
    onChange({ ...style, color: hex });
  };

  const brandColors = [
    { hex: "#FFFFFF", label: isEs ? "Claro" : "Claro" },
    { hex: primaryColor || "#F5F906", label: isEs ? "Principal" : "PrimÃ¡ria" },
    { hex: secondaryColor || "#00F0FF", label: isEs ? "Secundario" : "SecundÃ¡ria" },
  ];

  if (vertical) {
    return (
      <div className="flex flex-col items-center gap-1 rounded-lg border border-white/10 bg-white/[0.03] px-1.5 py-2">
        {/* B / I / U vertical */}
        {[
          { key: "bold", label: "B", active: isBold, cls: "font-black", action: () => onChange({ ...style, bold: !isBold }) },
          { key: "italic", label: "I", active: isItalic, cls: "italic font-bold", action: () => onChange({ ...style, italic: !isItalic }) },
          { key: "underline", label: "U", active: isUnderline, cls: "underline font-bold", action: () => onChange({ ...style, underline: !isUnderline }) },
        ].map(({ key, label, active, cls, action }) => (
          <button key={key} type="button" onClick={(e) => { e.preventDefault(); action(); }}
            className={`grid h-8 w-8 place-items-center rounded text-sm transition-colors ${cls} ${
              active ? "bg-[#F5F906] text-zinc-950" : "text-white/70 hover:bg-white/10 hover:text-white"
            }`}>{label}</button>
        ))}
        <div className="my-1 w-4 border-t border-white/15" />
        {/* Cores verticais */}
        {brandColors.map(({ hex, label }) => (
          <button key={hex} type="button" onClick={(e) => { e.preventDefault(); handleColorClick(hex); }}
            title={`${label} (${hex})`}
            className={`${compact ? "h-[18px] w-[18px]" : "h-6 w-6"} rounded-full border-2 transition-all hover:scale-110 ${
              currentColor.toUpperCase() === hex.toUpperCase()
                ? "scale-110 border-white ring-2 ring-[#F5F906] ring-offset-1 ring-offset-zinc-900"
                : "border-white/30"
            }`} style={{ backgroundColor: hex }} />
        ))}
        {/* Arco-Ã­ris */}
        <div className="relative cursor-pointer transition-transform hover:scale-110"
          style={{ width: 24, height: 24, borderRadius: "50%", padding: 2,
            background: "conic-gradient(from 0deg, #ff0000, #ff8800, #ffff00, #00ff00, #00ffff, #0000ff, #ff00ff, #ff0000)" }}
          title={isEs ? "Elegir color" : "Qualquer cor"}
        >
          <div style={{ width: "100%", height: "100%", borderRadius: "50%", backgroundColor: currentColor, border: "1px solid rgba(0,0,0,0.35)" }} />
          <input type="color" value={currentColor.startsWith("#") ? currentColor : "#FFFFFF"}
            onChange={(e) => handleColorClick(e.target.value)}
            className="absolute inset-0 h-full w-full cursor-pointer opacity-0" style={{ borderRadius: "50%" }} />
        </div>
      </div>
    );
  }

  return (
    <div className={`flex flex-wrap items-center justify-between gap-1.5 rounded-lg border border-white/10 bg-white/[0.03] px-2 py-1 ${
      compact ? "" : "mb-1"
    }`}>
      {/* B / I / U (Lado esquerdo) */}
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            onChange({ ...style, bold: !isBold });
          }}
          title={isEs ? "Negrita (B)" : "Negrito (B)"}
          className={`grid h-8 w-8 place-items-center rounded text-sm font-black transition-colors ${
            isBold
              ? "bg-[#F5F906] text-zinc-950 shadow-sm"
              : "text-white/70 hover:bg-white/10 hover:text-white"
          }`}
        >
          B
        </button>
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            onChange({ ...style, italic: !isItalic });
          }}
          title={isEs ? "Cursiva (I)" : "ItÃ¡lico (I)"}
          className={`grid h-8 w-8 place-items-center rounded text-sm font-bold italic transition-colors ${
            isItalic
              ? "bg-[#F5F906] text-zinc-950 shadow-sm"
              : "text-white/70 hover:bg-white/10 hover:text-white"
          }`}
        >
          I
        </button>
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            onChange({ ...style, underline: !isUnderline });
          }}
          title={isEs ? "Subrayado (U)" : "Sublinhado (U)"}
          className={`grid h-8 w-8 place-items-center rounded text-sm font-bold underline transition-colors ${
            isUnderline
              ? "bg-[#F5F906] text-zinc-950 shadow-sm"
              : "text-white/70 hover:bg-white/10 hover:text-white"
          }`}
        >
          U
        </button>
      </div>

      {/* Bolinhas das cores e Hex code (Lado direito) */}
      <div className="flex items-center gap-2">
        {brandColors.map(({ hex, label }) => (
          <button
            key={`${hex}-${label}`}
            type="button"
            onClick={(e) => {
              e.preventDefault();
              handleColorClick(hex);
            }}
            title={`${label} (${hex})`}
            className="h-6 w-6 rounded-full border-2 transition-all hover:scale-110"
            data-selected={currentColor.toUpperCase() === hex.toUpperCase()}
            style={{
              backgroundColor: hex,
              borderColor:
                currentColor.toUpperCase() === hex.toUpperCase()
                  ? "#FFFFFF"
                  : "rgba(255,255,255,.3)",
              boxShadow:
                currentColor.toUpperCase() === hex.toUpperCase()
                  ? "0 0 0 2px #F5F906"
                  : "none",
              transform:
                currentColor.toUpperCase() === hex.toUpperCase()
                  ? "scale(1.08)"
                  : undefined,
            }}
          />
        ))}

        {/* CÃ­rculo arco-Ã­ris: anel externo colorido + cor atual no centro */}
        <div
          className="relative cursor-pointer transition-transform hover:scale-110"
          style={{
            width: compact ? 18 : 24,
            height: compact ? 18 : 24,
            borderRadius: "50%",
            padding: compact ? 1.5 : 2.5,
            background: "conic-gradient(from 0deg, #ff0000, #ff8800, #ffff00, #00ff00, #00ffff, #0000ff, #ff00ff, #ff0000)",
            boxShadow: "0 0 6px 1px rgba(255,255,255,0.18)",
          }}
          title={isEs ? "Elegir cualquier color" : "Clique para escolher qualquer cor"}
        >
          {/* Centro: mostra a cor selecionada atualmente */}
          <div
            style={{
              width: "100%",
              height: "100%",
              borderRadius: "50%",
              backgroundColor: currentColor,
              border: "1.5px solid rgba(0,0,0,0.35)",
            }}
          />
          {/* Input color nativo invisÃ­vel sobreposto */}
          <input
            type="color"
            value={currentColor.startsWith("#") ? currentColor : "#FFFFFF"}
            onChange={(e) => handleColorClick(e.target.value)}
            className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
            style={{ borderRadius: "50%" }}
          />
        </div>

        {/* BotÃ£o para cÃ³digo HEX (por Ãºltimo, separado e discreto) */}
        <div className="flex items-center border-l border-white/15 pl-2">
          {!showHexInput ? (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                setShowHexInput(true);
                setHexInput(currentColor);
              }}
              title={isEs ? "Adicionar cÃ³digo HEX" : "Adicionar cÃ³digo da cor (HEX)"}
              className="rounded border border-white/10 bg-white/[0.04] px-1.5 py-0.5 text-[9px] font-mono font-bold text-white/60 hover:border-white/25 hover:bg-white/10 hover:text-white transition-all"
            >
              HEX #
            </button>
          ) : (
            <div className="flex items-center gap-1">
              <input
                type="text"
                value={hexInput}
                onChange={(e) => setHexInput(e.target.value)}
                placeholder="#RRGGBB"
                className="w-16 rounded bg-zinc-900 border border-white/20 px-1 py-0.5 text-[9px] font-mono text-white outline-none focus:border-[#F5F906]"
              />
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  if (hexInput.startsWith("#") || hexInput.length === 6) {
                    const formatted = hexInput.startsWith("#") ? hexInput : `#${hexInput}`;
                    handleColorClick(formatted);
                  }
                  setShowHexInput(false);
                }}
                className="rounded bg-[#F5F906] px-1 py-0.5 text-[9px] font-bold text-zinc-950"
              >
                OK
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  setShowHexInput(false);
                }}
                className="text-[9px] text-white/50 hover:text-white px-0.5"
              >
                Ã—
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function F1CarouselBuilder({
  sourceImage = "",
  locale = "pt",
  onNext,
  onBackToAd,
}: F1CarouselBuilderProps) {
  const { state } = useFabricaContext();
  const { user } = useAuth();
  const { reserve, commit, release, track, can, tier, remaining } = useEntitlements();
  const isEs = locale === "es";
  const isCarouselPreviewLocked = tier === "guest"
    || (!can("carousel.export") && remaining?.carousel_export === 0);
  const adCoverHandoffKey = `fabrica-carousel-ad-cover:${state.projectId || "local"}`;
  const [hasAdCoverHandoff] = useState(() => {
    if (sourceImage.trim()) return true;
    try {
      return (
        sessionStorage.getItem(adCoverHandoffKey) === "1" &&
        Boolean(state.generatedAdImage?.trim())
      );
    } catch {
      return false;
    }
  });
  useEffect(() => {
    if (!hasAdCoverHandoff) return;
    try {
      sessionStorage.removeItem(adCoverHandoffKey);
    } catch {}
  }, [adCoverHandoffKey, hasAdCoverHandoff]);
  const currentDestination = state.destinos.find((destination) => destination?.trim()) || "";
  const packages = useMemo(() => {
    const valid = state.selectedPackages.filter((pacote) => pacote.title?.trim());
    const currentName = normalizeName(currentDestination);
    return [...valid].sort((a, b) => {
      const aCurrent = normalizeName(a.title) === currentName ? 1 : 0;
      const bCurrent = normalizeName(b.title) === currentName ? 1 : 0;
      if (aCurrent !== bCurrent) return bCurrent - aCurrent;
      if (Boolean(a.isDraft) !== Boolean(b.isDraft)) return a.isDraft ? 1 : -1;
      return 0;
    });
  }, [currentDestination, state.selectedPackages]);
  const [selectedPackageId, setSelectedPackageId] = useState(packages[0]?.id || "");
  const selectedPackage = packages.find((pacote) => pacote.id === selectedPackageId) || packages[0];
  const selectedPackageName = normalizeName(selectedPackage?.title);
  const currentDestinationName = normalizeName(currentDestination);
  const selectedIsCurrent =
    Boolean(selectedPackageName) &&
    (!currentDestinationName ||
      selectedPackageName === currentDestinationName ||
      selectedPackageName.includes(currentDestinationName) ||
      currentDestinationName.includes(selectedPackageName));
  const inheritedCoverImage = selectedIsCurrent
    ? sourceImage.trim() ||
      (hasAdCoverHandoff ? state.generatedAdImage?.trim() || "" : "")
    : "";
  const coverSource: "ad" | "native" = inheritedCoverImage ? "ad" : "native";
  const coverImage =
    inheritedCoverImage ||
    selectedPackage?.imageUrl ||
    selectedPackage?.galleryImages?.[0] ||
    (selectedIsCurrent
      ? state.lastCleanPhoto || state.siteContent.galleryImages?.[0] || ""
      : "");
  const configuredFooterContacts = [
    { icon: state.footerContact1Icon, value: state.footerContact1Value },
    { icon: state.footerContact2Icon, value: state.footerContact2Value },
  ];
  const carouselContact =
    configuredFooterContacts
      .find((contact) => contact.icon?.startsWith("whatsapp") && contact.value?.trim())
      ?.value?.trim() || "";
  const agencyPhone =
    carouselContact || phoneLabel(state.whatsappDialCode || "55", state.whatsapp || "");
  const agencyInstagram =
    configuredFooterContacts
      .find((contact) => contact.icon?.startsWith("instagram") && contact.value?.trim())
      ?.value?.trim() ||
    state.instagram?.trim() ||
    "";
  const agencyEmail = state.agencyEmail?.trim() || "";
  const [slideCount, setSlideCount] = useState<CarouselSize>(6);
  const [carouselFormat, setCarouselFormat] = useState<CarouselFormat>("feed");
  const [showLogo, setShowLogo] = useState(true);
  const [logoPosition, setLogoPosition] = useState<LogoPosition>("top-right");
  const slideCountRef = useRef<CarouselSize>(6);
  const [slides, setSlides] = useState<CarouselSlide[]>(() =>
    selectedPackage
      ? createSlides(selectedPackage, 6, coverImage, agencyPhone, isEs, uniqueImages([...(state.siteContent.galleryImages || [])]), "impact", coverSource)
      : [],
  );
  const slideArchiveRef = useRef<CarouselSlide[]>(
    selectedPackage
      ? createSlides(selectedPackage, 6, coverImage, agencyPhone, isEs, uniqueImages([...(state.siteContent.galleryImages || [])]), "impact", coverSource)
      : [],
  );
  const slidesRef = useRef(slides);
  const selectedPackageIdRef = useRef(selectedPackage?.id || "");
  const skipNextPersistRef = useRef("");
  const [activeIndex, setActiveIndex] = useState(() => (slides.length > 1 ? 1 : 0));
  const [viewMode, setViewMode] = useState<"ribbon" | "stack" | "focus">("ribbon");
  const [maximizedSlide, setMaximizedSlide] = useState<CarouselSlide | null>(null);
  const [zoomScale, setZoomScale] = useState<number>(1);
  const carouselRatio = CAROUSEL_RATIOS[carouselFormat];
  const [photoQuery, setPhotoQuery] = useState("");
  const [photoResults, setPhotoResults] = useState<PhotoResult[]>([]);
  const [photoPage, setPhotoPage] = useState(1);
  const [photoHasMore, setPhotoHasMore] = useState(false);
  const [photoDestination, setPhotoDestination] = useState("");
  const [searchingPhotos, setSearchingPhotos] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [showNewCarouselModal, setShowNewCarouselModal] = useState(false);
  const [showExportPaywall, setShowExportPaywall] = useState(false);
  const [captionText, setCaptionText] = useState("");
  const [captionEdited, setCaptionEdited] = useState(false);
  const [generatingCaption, setGeneratingCaption] = useState(false);
  const [photoPanelOpen, setPhotoPanelOpen] = useState(true);
  const exportRefs = useRef<Array<HTMLDivElement | null>>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadRequestRef = useRef(new Map<string, symbol>());
  const autoPhotoSyncRef = useRef("");
  const photoSearchRequestRef = useRef(0);
  const activeSlide = slides[activeIndex];
  const activeCoverIsProtected =
    activeSlide?.kind === "cover" && activeSlide.coverSource === "ad";
  const effectiveCoverSource = slides[0]?.coverSource || coverSource;
  const renderedLogo = showLogo ? state.logoBase64 : "";
  const activeFieldFallback =
    activeSlide && activeSlide.kind !== "closing"
      ? defaultContentTextColor(activeSlide.slideVariant, state.primaryColor)
      : activeSlide?.textColor || "#FFFFFF";
  const qualityIssues = useMemo(() => {
    const issues: string[] = [];
    const contentSlides = slides.filter((slide) => slide.kind === "content");
    const closingSlide = slides.find((slide) => slide.kind === "closing");
    if (!selectedPackage?.title?.trim()) {
      issues.push(isEs ? "Selecciona un paquete" : "Selecione um pacote");
    }
    if (!slides.find((slide) => slide.kind === "cover")?.imageUrl?.trim()) {
      issues.push(isEs ? "Elige la foto de portada" : "Escolha a foto da capa");
    }
    if (showLogo && !state.logoBase64?.trim()) {
      issues.push(isEs ? "Agrega el logo en el Panel" : "Adicione a logo no Painel");
    }
    if (!contentSlides.length || contentSlides.some((slide) => !cleanCarouselText(slide.title))) {
      issues.push(isEs ? "Completa los tÃ­tulos" : "Complete os tÃ­tulos");
    }
    if (slides.some((slide) => slide.kind !== "cover" && !slide.imageUrl?.trim())) {
      issues.push(isEs ? "Elige las fotos" : "Escolha as fotos");
    }
    if (!closingSlide?.cta?.trim()) {
      issues.push(isEs ? "Define la llamada final" : "Defina a chamada final");
    }
    const closingChannels =
      closingSlide?.contactChannels ??
      (closingSlide?.phone ? (["whatsapp"] as CarouselContactChannel[]) : []);
    if (closingChannels.includes("whatsapp") && !closingSlide?.phone?.trim()) {
      issues.push(isEs ? "Agrega el WhatsApp" : "Adicione o WhatsApp");
    }
    if (closingChannels.includes("instagram") && !closingSlide?.instagram?.trim()) {
      issues.push(isEs ? "Agrega Instagram" : "Adicione o Instagram");
    }
    if (closingChannels.includes("email") && !closingSlide?.email?.trim()) {
      issues.push(isEs ? "Agrega el correo" : "Adicione o e-mail");
    }
    return issues;
  }, [isEs, selectedPackage?.title, showLogo, slides, state.logoBase64]);
  const qualityReady = qualityIssues.length === 0;

  const generateCaption = async () => {
    if (!selectedPackage) return;
    setGeneratingCaption(true);
    try {
      await Promise.resolve();
      setCaptionText(
        carouselCaption(
          selectedPackage,
          state.agencyName || (isEs ? "Agencia de Viajes" : "AgÃªncia de Viagens"),
          agencyPhone,
          isEs,
        ),
      );
      setCaptionEdited(false);
      toast.success(isEs ? "Â¡Leyenda generada!" : "Legenda gerada com sucesso!");
    } finally {
      setGeneratingCaption(false);
    }
  };

  const zoomIn = () => setZoomScale((curr) => Math.min(1.6, Number((curr + 0.15).toFixed(2))));
  const zoomOut = () => setZoomScale((curr) => Math.max(0.5, Number((curr - 0.15).toFixed(2))));
  const zoomReset = () => setZoomScale(1);

  useEffect(() => {
    slideCountRef.current = slideCount;
  }, [slideCount]);

  useEffect(() => {
    slidesRef.current = slides;
  }, [slides]);

  useEffect(() => {
    selectedPackageIdRef.current = selectedPackage?.id || "";
  }, [selectedPackage?.id]);

  useEffect(
    () => () => {
      uploadRequestRef.current.clear();
    },
    [],
  );

  const availableImages = useMemo(
    () =>
      uniqueImages([
        selectedPackage?.imageUrl,
        ...(selectedPackage?.galleryImages || []),
        ...(selectedIsCurrent ? [state.lastCleanPhoto, ...(state.siteContent.galleryImages || [])] : []),
      ]).slice(0, 16),
    [
      selectedPackage?.galleryImages,
      selectedPackage?.imageUrl,
      state.lastCleanPhoto,
      state.siteContent.galleryImages,
      selectedIsCurrent,
    ],
  );

  const storageKey = useMemo(
    () => `fabrica-carousel-v2:${locale}:${state.projectId || "local"}:${selectedPackage?.id || "none"}`,
    [locale, selectedPackage?.id, state.projectId],
  );

  useEffect(() => {
    if (selectedPackageId && packages.some((pacote) => pacote.id === selectedPackageId)) return;
    setSelectedPackageId(packages[0]?.id || "");
  }, [packages, selectedPackageId]);

  useEffect(() => {
    const currentPackage = packages.find(
      (pacote) => normalizeName(pacote.title) === normalizeName(currentDestination),
    );
    if (currentPackage && currentPackage.id !== selectedPackageIdRef.current) {
      setSelectedPackageId(currentPackage.id);
    }
  }, [currentDestination, packages]);

  useEffect(() => {
    const initialDestination =
      currentDestination.trim() ||
      state.destinos.find((destination) => destination?.trim())?.trim() ||
      selectedPackage?.title ||
      "";
    setPhotoDestination(initialDestination);
    setPhotoQuery(initialDestination);
    setPhotoResults([]);
    setPhotoPage(1);
    setPhotoHasMore(false);
    setCaptionEdited(false);
    setCaptionText(
      selectedPackage
        ? carouselCaption(
            selectedPackage,
            state.agencyName || (isEs ? "Agencia de Viajes" : "AgÃªncia de Viagens"),
            agencyPhone,
            isEs,
          )
        : "",
    );
  }, [agencyPhone, currentDestination, isEs, selectedPackage, state.agencyName, state.destinos]);

  useEffect(() => {
    skipNextPersistRef.current = storageKey;
    setShowLogo(true);
    setLogoPosition("top-right");
    setCarouselFormat("feed");
    if (!selectedPackage) {
      slideArchiveRef.current = [];
      setSlides([]);
      setActiveIndex(0);
      return;
    }

    const preferredCount = slideCountRef.current;
    const destImages = availableImages;
    const generated = createSlides(
      selectedPackage,
      preferredCount,
      coverImage,
      agencyPhone,
      isEs,
      destImages,
      "impact",
      coverSource,
    );
    const generatedArchive = createSlides(
      selectedPackage,
      6,
      coverImage,
      agencyPhone,
      isEs,
      destImages,
      "impact",
      coverSource,
    );

    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const parsed = JSON.parse(stored) as {
          slideCount?: CarouselSize;
          slides?: CarouselSlide[];
          allSlides?: CarouselSlide[];
          showLogo?: boolean;
          logoPosition?: LogoPosition;
          carouselFormat?: CarouselFormat;
          photoDestination?: string;
          captionText?: string;
          captionEdited?: boolean;
        };
        setShowLogo(parsed.showLogo !== false);
        if (
          parsed.logoPosition === "top-left" ||
          parsed.logoPosition === "top-right" ||
          parsed.logoPosition === "bottom-left" ||
          parsed.logoPosition === "bottom-right"
        ) {
          setLogoPosition(parsed.logoPosition);
        }
        setCarouselFormat(parsed.carouselFormat === "story" ? "story" : "feed");
        if (parsed.photoDestination?.trim()) {
          setPhotoDestination(parsed.photoDestination.trim());
          setPhotoQuery(parsed.photoDestination.trim());
        }
        if (typeof parsed.captionText === "string") {
          setCaptionText(parsed.captionText);
          setCaptionEdited(parsed.captionEdited === true);
        }
        const storedSlides = parsed.allSlides || parsed.slides || [];
        const restoredStrategy =
          storedSlides.find((slide) => slide.kind === "content")?.slideVariant || "impact";
        const restoredArchiveBase = createSlides(
          selectedPackage,
          6,
          coverImage,
          agencyPhone,
          isEs,
          destImages,
          restoredStrategy,
          coverSource,
        );
        const restoredCount =
          parsed.slideCount === 3 || parsed.slideCount === 4 || parsed.slideCount === 5 || parsed.slideCount === 6
            ? parsed.slideCount
            : preferredCount;
        const restoredArchive = mergeSlidesForSize(
          storedSlides,
          restoredArchiveBase,
        ).map((slide) => {
          const withCover =
            slide.kind === "cover"
              ? {
                  ...slide,
                  imageUrl:
                    coverSource === "ad"
                      ? coverImage
                      : slide.imageUrl || coverImage,
                  coverSource,
                }
              : slide;
          const legacyColor =
            withCover.kind === "content" &&
            /^#[0-9a-f]{6}$/i.test(withCover.textColor || "") &&
            !["#FFFFFF", "#F8FAFC"].includes(withCover.textColor.toUpperCase())
              ? withCover.textColor
              : undefined;
          // backward compat: add new fields if missing from old localStorage saves
          return {
            ...withCover,
            slideVariant: withCover.slideVariant ?? "impact",
            bulletIcon: withCover.bulletIcon ?? "none",
            titleStyle: { ...withCover.titleStyle, color: withCover.titleStyle?.color || legacyColor },
            bodyStyle: { ...withCover.bodyStyle, color: withCover.bodyStyle?.color || legacyColor },
            bulletStyle: { ...withCover.bulletStyle, color: withCover.bulletStyle?.color || legacyColor },
          } as CarouselSlide;
        });
        const restoredBase = createSlides(
          selectedPackage,
          restoredCount,
          coverImage,
          agencyPhone,
          isEs,
          destImages,
          restoredStrategy,
          coverSource,
        );
        const restored = mergeSlidesForSize(restoredArchive, restoredBase).map((slide) =>
          slide.kind === "cover"
            ? {
                ...slide,
                imageUrl:
                  coverSource === "ad"
                    ? coverImage
                    : slide.imageUrl || coverImage,
                coverSource,
              }
            : slide,
        );
        slideArchiveRef.current = restoredArchive;
        setSlideCount(restoredCount);
        setSlides(restored);
        setActiveIndex(restored.length > 1 ? 1 : 0);
        return;
      }
    } catch {
      localStorage.removeItem(storageKey);
    }

    slideArchiveRef.current = generatedArchive;
    setSlides(generated);
    setActiveIndex(generated.length > 1 ? 1 : 0);
  }, [agencyPhone, availableImages, coverImage, coverSource, isEs, selectedPackage, storageKey]);

  useEffect(() => {
    const defaultChannels = [
      agencyPhone ? "whatsapp" : undefined,
      agencyInstagram ? "instagram" : undefined,
      agencyEmail ? "email" : undefined,
    ].filter((channel): channel is CarouselContactChannel => Boolean(channel));
    const hydrateContacts = (items: CarouselSlide[]) =>
      items.map((slide) =>
        slide.kind === "closing"
          ? {
              ...slide,
              phone: slide.phone || agencyPhone,
              instagram: slide.instagram ?? agencyInstagram,
              email: slide.email ?? agencyEmail,
              contactChannels: slide.contactChannels ?? defaultChannels,
            }
          : slide,
      );

    slideArchiveRef.current = hydrateContacts(slideArchiveRef.current);
    setSlides((current) => hydrateContacts(current));
  }, [agencyEmail, agencyInstagram, agencyPhone, storageKey]);

  useEffect(() => {
    if (!slides.length) return;
    if (skipNextPersistRef.current === storageKey) {
      skipNextPersistRef.current = "";
      return;
    }
    const persistDraft = (notifyError = true) => {
      try {
        const destImages = uniqueImages([...availableImages, ...photoResults.map((p) => p.url)]);
        const persistedStrategy =
          slides.find((slide) => slide.kind === "content")?.slideVariant || "impact";
        const generatedArchive = selectedPackage
          ? createSlides(selectedPackage, 6, coverImage, agencyPhone, isEs, destImages, persistedStrategy, effectiveCoverSource)
          : [];
        const archiveBase = mergeSlidesForSize(
          slideArchiveRef.current,
          generatedArchive,
        );
        const allSlides = mergeActiveIntoArchive(slides, archiveBase);
        slideArchiveRef.current = allSlides;
        const safeSlide = (slide: CarouselSlide) => ({
          ...slide,
          imageUrl:
            (slide.kind === "cover" && slide.coverSource === "ad") ||
            slide.imageUrl.startsWith("data:")
              ? ""
              : slide.imageUrl,
        });
        localStorage.setItem(
          storageKey,
          JSON.stringify({
            slideCount,
            showLogo,
            logoPosition,
            carouselFormat,
            photoDestination,
            captionText,
            captionEdited,
            slides: slides.map(safeSlide),
            allSlides: allSlides.map(safeSlide),
          }),
        );
      } catch {
        if (notifyError) {
          toast.error(
            isEs
              ? "No fue posible guardar el borrador en este navegador."
              : "NÃ£o foi possÃ­vel salvar o rascunho neste navegador.",
          );
        }
      }
    };
    const persistBeforeLeaving = () => persistDraft(false);
    const timer = window.setTimeout(() => persistDraft(true), 300);
    window.addEventListener("pagehide", persistBeforeLeaving);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("pagehide", persistBeforeLeaving);
      persistDraft(false);
    };
  }, [agencyPhone, availableImages, captionEdited, captionText, carouselFormat, coverImage, effectiveCoverSource, isEs, logoPosition, photoDestination, photoResults, selectedPackage, showLogo, slideCount, slides, storageKey]);

  useEffect(() => {
    const ff = activeSlide?.fontFamily || "Inter";
    if (!ff || ff === "Inter") return;
    const id = `gf-${ff.replace(/\s+/g, "-").toLowerCase()}`;
    if (!document.getElementById(id)) {
      const link = document.createElement("link");
      link.id = id;
      link.rel = "stylesheet";
      link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(ff)}:wght@400;500;600;700;800;900&display=swap`;
      document.head.appendChild(link);
    }
  }, [activeSlide?.fontFamily]);

  const patchActive = (patch: Partial<CarouselSlide>) => {
    if (!activeSlide || activeCoverIsProtected) return;
    setSlides((current) =>
      current.map((slide, index) => (index === activeIndex ? { ...slide, ...patch } : slide)),
    );
  };
  const activeClosingChannels =
    activeSlide?.kind === "closing"
      ? activeSlide.contactChannels ??
        (activeSlide.phone ? (["whatsapp"] as CarouselContactChannel[]) : [])
      : [];
  const toggleClosingChannel = (channel: CarouselContactChannel) => {
    const nextChannels = activeClosingChannels.includes(channel)
      ? activeClosingChannels.filter((item) => item !== channel)
      : [...activeClosingChannels, channel];
    patchActive({ contactChannels: nextChannels });
  };

  const currentStrategy =
    slides.find((slide) => slide.kind === "content")?.slideVariant || "impact";

  const applyCarouselStrategy = (strategy: CarouselSlideVariant) => {
    if (!selectedPackage) return;
    const destImages = uniqueImages([...availableImages, ...photoResults.map((p) => p.url)]);
    const currentArchive = mergeActiveIntoArchive(slides, slideArchiveRef.current);
    const currentCover = currentArchive.find((slide) => slide.kind === "cover");
    const currentContent = currentArchive.filter((slide) => slide.kind === "content");
    const currentClosing = currentArchive.find((slide) => slide.kind === "closing");
    let contentIndex = 0;
    const generatedArchive = createSlides(
      selectedPackage,
      6,
      coverImage,
      agencyPhone,
      isEs,
      destImages,
      strategy,
      effectiveCoverSource,
    ).map((slide) => {
      if (slide.kind === "cover") return carrySlidePresentation(slide, currentCover);
      if (slide.kind === "closing") return carrySlidePresentation(slide, currentClosing);
      const current = currentContent[contentIndex];
      contentIndex += 1;
      return carrySlidePresentation(slide, current);
    });
    const generated = mergeSlidesForSize(
      generatedArchive,
      createSlides(
        selectedPackage,
        slideCount,
        coverImage,
        agencyPhone,
        isEs,
        destImages,
        strategy,
        effectiveCoverSource,
      ),
    );
    slideArchiveRef.current = generatedArchive;
    setSlides(generated);
    setActiveIndex(generated.length > 1 ? 1 : 0);
    toast.success(
      isEs ? "Estrategia aplicada al carrusel." : "EstratÃ©gia aplicada ao carrossel.",
    );
  };

  const switchToNativeCover = () => {
    if (!selectedPackage) return;
    const nativeCoverImage =
      selectedPackage.imageUrl ||
      selectedPackage.galleryImages?.[0] ||
      availableImages[0] ||
      "";
    const nativeCover = createSlides(
      selectedPackage,
      slideCount,
      nativeCoverImage,
      agencyPhone,
      isEs,
      availableImages,
      currentStrategy,
      "native",
    )[0];
    if (!nativeCover) return;
    slideArchiveRef.current = slideArchiveRef.current.map((slide) =>
      slide.kind === "cover" ? nativeCover : slide,
    );
    setSlides((current) =>
      current.map((slide) => (slide.kind === "cover" ? nativeCover : slide)),
    );
    setActiveIndex(0);
    toast.success(
      isEs
        ? "Portada editable del carrusel aplicada."
        : "Capa editÃ¡vel do carrossel aplicada.",
    );
  };

  const changeSlideCount = (nextCount: CarouselSize) => {
    if (!selectedPackage) return;
    const destImages = uniqueImages([...availableImages, ...photoResults.map((p) => p.url)]);
    const generated = createSlides(
      selectedPackage,
      nextCount,
      coverImage,
      agencyPhone,
      isEs,
      destImages,
      currentStrategy,
      effectiveCoverSource,
    );
    const generatedArchive = createSlides(
      selectedPackage,
      6,
      coverImage,
      agencyPhone,
      isEs,
      destImages,
      currentStrategy,
      effectiveCoverSource,
    );
    setSlides((current) => {
      const archiveBase = mergeSlidesForSize(
        slideArchiveRef.current,
        generatedArchive,
      );
      const archive = mergeActiveIntoArchive(current, archiveBase);
      slideArchiveRef.current = archive;
      return mergeSlidesForSize(archive, generated);
    });
    setSlideCount(nextCount);
    setActiveIndex((current) => Math.min(current, nextCount - 1));
  };

  const regenerate = () => {
    if (!selectedPackage) return;
    uploadRequestRef.current.clear();
    const destImages = uniqueImages([...availableImages, ...photoResults.map((p) => p.url)]);
    const currentVariant =
      slides.find((slide) => slide.kind === "content")?.slideVariant || "impact";
    const nextVariant =
      CAROUSEL_VARIANTS[
        (CAROUSEL_VARIANTS.indexOf(currentVariant) + 1) % CAROUSEL_VARIANTS.length
      ];
    const generatedArchive = createSlides(
      selectedPackage,
      6,
      coverImage,
      agencyPhone,
      isEs,
      destImages,
      nextVariant,
      effectiveCoverSource,
    );
    const generated = mergeSlidesForSize(
      generatedArchive,
      createSlides(
        selectedPackage,
        slideCount,
        coverImage,
        agencyPhone,
        isEs,
        destImages,
        nextVariant,
        effectiveCoverSource,
      ),
    );
    slideArchiveRef.current = generatedArchive;
    setSlides(generated);
    setActiveIndex(generated.length > 1 ? 1 : 0);
    toast.success(
      isEs
        ? "Contenido actualizado con los datos reales del paquete."
        : "ConteÃºdo atualizado com os dados reais do pacote.",
    );
  };

  const discardAndCreateNew = () => {
    try {
      localStorage.removeItem(storageKey);
    } catch {}
    regenerate();
    setShowNewCarouselModal(false);
    toast.success(
      isEs
        ? `Nuevo carrusel de ${selectedPackage?.title || "este destino"} generado.`
        : `Novo carrossel de ${selectedPackage?.title || "este destino"} gerado.`,
    );
  };

  const applyPhotoPoolToCarousel = (
    photos: PhotoResult[],
    preserveUploads = false,
  ) => {
    const urls = uniqueImages(photos.map((photo) => photo.url));
    if (!urls.length) return;
    slideArchiveRef.current = distributeUniqueSlideImages(
      slideArchiveRef.current,
      urls,
      preserveUploads,
    );
    setSlides((current) =>
      distributeUniqueSlideImages(current, urls, preserveUploads),
    );
  };

  const searchPhotos = async ({
    syncAll = false,
    queryOverride = "",
    silent = false,
    pageOverride = 1,
  }: {
    syncAll?: boolean;
    queryOverride?: string;
    silent?: boolean;
    pageOverride?: number;
  } = {}) => {
    if (!user) {
      if (!silent) setShowExportPaywall(true);
      return;
    }

    const requestId = photoSearchRequestRef.current + 1;
    photoSearchRequestRef.current = requestId;
    const targetPackageId = selectedPackage?.id || "";
    const query =
      queryOverride.trim() ||
      photoQuery.trim() ||
      photoDestination.trim() ||
      state.destinos.find(Boolean) ||
      selectedPackage?.title.trim() ||
      "";
    if (!query) {
      toast.error(isEs ? "Escribe un destino para buscar." : "Digite um destino para buscar.");
      return;
    }

    setPhotoQuery(query);
    setPhotoDestination(query);
    setSearchingPhotos(true);
    setPhotoResults([]);
    try {
      const { data, error } = await supabase.functions.invoke("fabrica-search-photos", {
        body: {
          query,
          perPage: 8,
          page: pageOverride,
          engine: "pexels",
          orientation: "portrait",
          fallback: false,
        },
      });
      if (error) throw error;
      if (
        photoSearchRequestRef.current !== requestId ||
        selectedPackageIdRef.current !== targetPackageId
      ) {
        return;
      }
      const safePhotos = (Array.isArray(data?.photos) ? data.photos : []).filter(
        (photo: PhotoResult) => /^https:\/\/images\.pexels\.com\//i.test(photo.url || ""),
      );
      setPhotoResults(safePhotos);
      setPhotoPage(pageOverride);
      setPhotoHasMore(safePhotos.length === 8);
      if (syncAll && safePhotos.length) {
        applyPhotoPoolToCarousel(safePhotos, silent);
        if (!silent) {
          toast.success(
            isEs
              ? "Fotos unicas sincronizadas con el destino."
              : "Fotos Ãºnicas sincronizadas com o destino.",
          );
        }
      }
      if (!safePhotos.length && !silent) {
        toast.info(isEs ? "No encontramos fotos para esta bÃºsqueda." : "Nenhuma foto encontrada para esta busca.");
      }
    } catch (error) {
      if (
        photoSearchRequestRef.current !== requestId ||
        selectedPackageIdRef.current !== targetPackageId
      ) {
        return;
      }
      if (silent) return;
      console.error("Erro ao buscar fotos para o carrossel:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : String(error) || (isEs ? "No fue posible buscar fotos ahora." : "Não foi possível buscar fotos agora."),
      );
    } finally {
      if (photoSearchRequestRef.current === requestId) {
        setSearchingPhotos(false);
      }
    }
  };

  useEffect(() => {
    const packageKey = [
      state.projectId || "local",
      selectedPackage?.id || "",
      normalizeName(photoDestination || selectedPackage?.title || ""),
    ].join(":");
    if (!selectedPackage?.id || autoPhotoSyncRef.current === packageKey) return;
    autoPhotoSyncRef.current = packageKey;
    void searchPhotos({
      syncAll: true,
      queryOverride: photoDestination || selectedPackage.title,
      silent: true,
    });
    // A troca de pacote e a unica origem desta sincronizacao automatica.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [photoDestination, selectedPackage?.id, selectedPackage?.title, state.projectId]);

  const handleUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    const targetSlideId = activeCoverIsProtected ? "" : activeSlide?.id || "";
    const targetPackageId = selectedPackage?.id || "";
    if (!targetSlideId || !targetPackageId) return;
    const requestKey = `${targetPackageId}:${targetSlideId}`;
    const requestToken = Symbol(requestKey);
    uploadRequestRef.current.set(requestKey, requestToken);
    if (!file.type.startsWith("image/")) {
      uploadRequestRef.current.delete(requestKey);
      toast.error(isEs ? "Selecciona un archivo de imagen." : "Selecione um arquivo de imagem.");
      return;
    }

    try {
      const optimized = await optimizeUpload(file);
      if (uploadRequestRef.current.get(requestKey) !== requestToken) return;
      const applyToOriginalSlide = (imageUrl: string) => {
        if (uploadRequestRef.current.get(requestKey) !== requestToken) return false;
        if (selectedPackageIdRef.current !== targetPackageId) {
          toast.info(
            isEs
              ? "Cambiaste de paquete. Vuelve a elegir el slide para aplicar la foto."
              : "VocÃª mudou de pacote. Selecione o slide novamente para aplicar a foto.",
          );
          return false;
        }
        slideArchiveRef.current = slideArchiveRef.current.map((slide) =>
          slide.id === targetSlideId ? { ...slide, imageUrl } : slide,
        );
        setSlides((current) =>
          current.map((slide) =>
            slide.id === targetSlideId ? { ...slide, imageUrl } : slide,
          ),
        );
        return true;
      };

      if (user?.id) {
        const hash = await hashBlob(optimized);
        const path = `sites/${user.id}/assets/${hash}.webp`;
        let publicUrl = "";
        try {
          const { error } = await supabase.storage
            .from("thumbnails")
            .upload(path, optimized, {
              contentType: "image/webp",
              upsert: true,
          });
          if (error) throw error;
          publicUrl = supabase.storage.from("thumbnails").getPublicUrl(path).data.publicUrl;
        } catch (uploadError) {
          console.warn("Falha no upload do Supabase, usando Base64", uploadError);
        }

        if (uploadRequestRef.current.get(requestKey) !== requestToken) return;
        
        if (publicUrl) {
          if (!applyToOriginalSlide(publicUrl)) return;
          toast.success(
            isEs
              ? "Foto optimizada, guardada y aplicada."
              : "Foto otimizada, salva e aplicada.",
          );
        } else {
          if (!applyToOriginalSlide(await blobToDataUrl(optimized))) return;
          toast.success(
            isEs
              ? "Foto aplicada temporalmente (offline)."
              : "Foto aplicada temporariamente (salvamento na nuvem indisponível).",
          );
        }
      } else {
        if (!applyToOriginalSlide(await blobToDataUrl(optimized))) return;
        toast.success(
          isEs
            ? "Foto aplicada temporalmente. Inicia sesiÃ³n para conservarla al volver."
          : "Foto aplicada temporariamente. Entre na conta para mantÃª-la ao voltar.",
        );
      }
    } catch {
      if (uploadRequestRef.current.get(requestKey) === requestToken) {
        toast.error(isEs ? "No fue posible preparar esta imagen." : "NÃ£o foi possÃ­vel preparar esta imagem.");
      }
    } finally {
      if (uploadRequestRef.current.get(requestKey) === requestToken) {
        uploadRequestRef.current.delete(requestKey);
      }
    }
  };

  const downloadAll = async () => {
    if (!selectedPackage || !slides.length) return;
    if (!user) {
      setShowExportPaywall(true);
      return;
    }
    if (!qualityReady) {
      toast.error(
        isEs
          ? `Revisa antes de descargar: ${qualityIssues[0] || "faltan datos"}.`
          : `Revise antes de baixar: ${qualityIssues[0] || "faltam dados"}.`,
      );
      return;
    }
    if (!slides[0]?.imageUrl?.trim()) {
      setActiveIndex(0);
      toast.error(
        isEs
          ? "Elige una foto para la portada."
          : "Escolha uma foto para a capa.",
      );
      return;
    }

    const closingSlide = slides.find((slide) => slide.kind === "closing");
    if (showLogo && !state.logoBase64) {
      setActiveIndex(slides.length - 1);
      toast.error(
        isEs
          ? "Agrega la logo de la empresa antes de descargar."
          : "Adicione a logo da empresa antes de baixar.",
      );
      return;
    }
    if (!closingSlide?.phone.trim()) {
      setActiveIndex(slides.length - 1);
      toast.error(
        isEs
          ? "Agrega el telÃ©fono o WhatsApp en la imagen final."
          : "Adicione o telefone ou WhatsApp na imagem final.",
      );
      return;
    }
    if (!closingSlide.cta.trim()) {
      setActiveIndex(slides.length - 1);
      toast.error(
        isEs
          ? "Agrega una llamada a la acciÃ³n en la imagen final."
          : "Adicione uma chamada para aÃ§Ã£o na imagem final.",
      );
      return;
    }

    const emptyPhotoIndex = slides.findIndex(
      (slide) => slide.kind === "content" && !slide.imageUrl,
    );
    if (emptyPhotoIndex >= 0) {
      setActiveIndex(emptyPhotoIndex);
      toast.error(
        isEs
          ? `Selecciona la foto de la imagen ${emptyPhotoIndex + 1}.`
          : `Selecione a foto da imagem ${emptyPhotoIndex + 1}.`,
      );
      return;
    }

    const availablePool = uniqueImages([
      ...(selectedPackage.galleryImages || []),
      ...(selectedPackage.imageUrl ? [selectedPackage.imageUrl] : []),
      ...(state.siteContent.galleryImages || []),
      ...photoResults.map((p) => p.url),
      ...slides.map((s) => s.imageUrl),
    ]).filter(Boolean);

    const used = new Set<string>();
    const resolvedSlides = slides.map((slide, idx) => {
      if (idx === 0) {
        used.add(slide.imageUrl);
        return slide;
      }
      let img = slide.imageUrl.trim();
      if (!img || used.has(img)) {
        const replacement = availablePool.find((candidate) => !used.has(candidate));
        if (replacement) {
          img = replacement;
        }
      }
      used.add(img);
      return { ...slide, imageUrl: img };
    });
    setSlides(resolvedSlides);

    const preserveOriginalCover =
      resolvedSlides[0]?.coverSource === "ad" && carouselFormat === "feed";
    const validationStartIndex = preserveOriginalCover ? 1 : 0;
    for (let index = validationStartIndex; index < resolvedSlides.length; index += 1) {
      try {
        await assertExportImageReadable(resolvedSlides[index].imageUrl);
      } catch {
        setActiveIndex(index);
        toast.error(
          isEs
            ? `La foto de la imagen ${index + 1} no permite exportaciÃ³n. Usa otra foto del banco o envÃ­a un archivo.`
            : `A foto da imagem ${index + 1} nÃ£o permite exportaÃ§Ã£o. Use outra foto do banco ou envie um arquivo.`,
        );
        return;
      }
    }
    try {
      if (showLogo) await assertExportImageReadable(state.logoBase64);
    } catch {
      setActiveIndex(resolvedSlides.length - 1);
      toast.error(
        isEs
          ? "La logo actual no permite exportaciÃ³n. Vuelve a enviarla en el Panel."
          : "A logo atual nÃ£o permite exportaÃ§Ã£o. Envie-a novamente no Painel.",
      );
      return;
    }

    const exportIdentity = createExportIdentity(
      "carousel",
      state.projectId,
      JSON.stringify({
        format: carouselFormat,
        packageId: selectedPackage.id,
        slides: resolvedSlides.map((slide) => ({
          id: slide.id,
          kind: slide.kind,
          title: slide.title,
          body: slide.body,
          bullets: slide.bullets,
          cta: slide.cta,
          image: `${slide.imageUrl.length}:${slide.imageUrl.slice(-96)}`,
        })),
      }),
    );
    const reservation = await reserve("carousel_export", exportIdentity, {
      projectId: state.projectId,
      metadata: {
        package_id: selectedPackage.id,
        slide_count: resolvedSlides.length,
        format: carouselFormat,
      },
    });
    if (!reservation.allowed) {
      if (reservation.error) {
        toast.error(reservation.error);
      } else {
        track("free_limit_reached", { capability: "carousel_export" });
        track("paywall_viewed", {
          feature: "carousel_export",
          source: "carousel_download",
        });
        setShowExportPaywall(true);
      }
      return;
    }

    setDownloading(true);
    const slug = (selectedPackage.slug || selectedPackage.title || "pacote")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

    try {
      if (preserveOriginalCover) {
        const coverToDownload = resolvedSlides[0]?.imageUrl || coverImage;
        await downloadOriginalImage(coverToDownload, `carrossel-${slug}-01-capa.png`);
      }
      const { default: html2canvas } = await import("html2canvas");

      for (let index = preserveOriginalCover ? 1 : 0; index < resolvedSlides.length; index += 1) {
        const node = exportRefs.current[index];
        if (!node) throw new Error("missing-export-node");

        // â”€â”€ 1. PrÃ©-carrega TODAS as imagens como data: URL no nÃ³ original â”€â”€
        const imgNodes = node.querySelectorAll("img");
        await Promise.all(
          Array.from(imgNodes).map(async (img) => {
            const src = img.getAttribute("src");
            if (src && !src.startsWith("data:") && !src.startsWith("blob:")) {
              const dataUrl = await prepareImageForCanvas(src);
              img.setAttribute("src", dataUrl);
              img.removeAttribute("crossorigin");
            }
          })
        );

        // â”€â”€ 2. Aguarda o browser re-renderizar com as data:URLs â”€â”€
        await new Promise((resolve) => window.setTimeout(resolve, 400));

        // â”€â”€ 3. Traz o nÃ³ pro viewport (necessÃ¡rio para html2canvas ver os pixels) â”€â”€
        const prevPosition = node.style.position;
        const prevPointerEvents = node.style.pointerEvents;
        const prevZIndex = node.style.zIndex;

        // Bring it into viewport just in case (the wrapper is offscreen so it's fine)
        node.style.position = "fixed";
        node.style.pointerEvents = "none";
        node.style.zIndex = "99999";

        await new Promise((resolve) => window.setTimeout(resolve, 120));

        // â”€â”€ 4. Captura com html2canvas â”€â”€
        const canvas = await html2canvas(node, {
          backgroundColor: "#08090B",
          useCORS: true,
          allowTaint: true,
          scale: 1,
          logging: false,
          imageTimeout: 15000,
          width: node.offsetWidth,
          height: node.offsetHeight,
          windowWidth: node.offsetWidth,
          windowHeight: node.offsetHeight,
        });

        // â”€â”€ 5. Restaura posiÃ§Ã£o original â”€â”€
        node.style.position = prevPosition;
        node.style.pointerEvents = prevPointerEvents;
        node.style.zIndex = prevZIndex;

        // â”€â”€ 6. Baixa a imagem â”€â”€
        const link = document.createElement("a");
        link.href = canvas.toDataURL("image/png", 1);
        link.download = `carrossel-${slug}-${String(index + 1).padStart(2, "0")}.png`;
        document.body.appendChild(link);
        link.click();
        link.remove();
        await new Promise((resolve) => window.setTimeout(resolve, 200));
      }

      await commit(reservation.reservationId);
      track("free_export_completed", {
        feature: "carousel_export",
        package_id: selectedPackage.id,
        slide_count: resolvedSlides.length,
        duplicate: Boolean(reservation.duplicate),
      });
      toast.success(
        isEs
          ? preserveOriginalCover
            ? `${slides.length} imÃ¡genes listas. La portada del anuncio fue preservada.`
            : `${slides.length} imÃ¡genes listas para publicar.`
          : preserveOriginalCover
            ? `${slides.length} imagens prontas. A capa do anÃºncio foi preservada.`
            : `${slides.length} imagens prontas para publicar.`,
      );
    } catch (error) {
      console.error("Falha ao exportar carrossel:", error);
      await release(reservation.reservationId).catch(() => undefined);
      toast.error(
        isEs
          ? "No fue posible exportar. Prueba otra foto del banco o un archivo enviado."
          : "NÃ£o foi possÃ­vel exportar. Tente outra foto do banco ou um arquivo enviado.",
      );
    } finally {
      setDownloading(false);
    }
  };

  if (!selectedPackage) {
    return (
      <section className="rounded-2xl border border-white/10 bg-[#0F0F11] p-5 sm:p-6">
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#F5F906]">
          {isEs ? "Carrusel" : "Carrossel"}
        </p>
        <h2 className="mt-3 text-xl font-bold text-white">
          {isEs ? "Primero agrega un paquete" : "Primeiro adicione um pacote"}
        </h2>
        <p className="mt-2 max-w-[65ch] text-sm leading-relaxed text-white/55">
          {isEs
            ? "El carrusel usa el mismo paquete sincronizado en el Panel, Plan y Sitio."
            : "O carrossel usa o mesmo pacote sincronizado no Painel, Plano e Site."}
        </p>
      </section>
    );
  }

  const renderPhotoSelectionBox = () => {
    if (!activeSlide || activeCoverIsProtected) return null;
    return (
      <details
        open={photoPanelOpen}
        onToggle={(event) => setPhotoPanelOpen(event.currentTarget.open)}
        className="rounded-2xl border border-white/10 bg-[#0F0F11] p-4 shadow-lg"
      >
        <summary className="flex cursor-pointer list-none items-center justify-between gap-3">
          <span className="flex items-center gap-2">
            <ImagePlus className="h-4 w-4 text-[#F5F906]" />
            <span className="text-sm font-bold text-white">
            {activeSlide.kind === "closing"
              ? (isEs ? "Fondo del cierre" : "Fundo do fechamento")
              : (isEs ? "Foto de esta imagen" : "Foto desta imagem")}
            </span>
          </span>
          <span className="text-[10px] font-bold text-white/45">
            {photoPanelOpen ? (isEs ? "Cerrar" : "Recolher") : (isEs ? "Cambiar" : "Trocar foto")}
          </span>
        </summary>

        <div className="mt-3 grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto]">
          <div className="min-w-0">
            <label className="mb-1.5 block text-[9px] font-bold uppercase tracking-[0.12em] text-white/40">
              {isEs ? "Destino de las fotos" : "Destino das fotos"}
            </label>
            <div className="flex gap-2">
              <input
                value={photoQuery}
                onChange={(event) => setPhotoQuery(event.target.value)}
                onKeyDown={(event) => event.key === "Enter" && void searchPhotos()}
                placeholder={isEs ? "Ej: Fernando de Noronha" : "Ex: Fernando de Noronha"}
                className="f1-carousel-input min-w-0 flex-1"
              />
              <button
                type="button"
                onClick={() => void searchPhotos()}
                disabled={searchingPhotos}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#F5F906] px-4 text-[10px] font-extrabold text-zinc-950 disabled:opacity-50 hover:bg-[#F5F906]/90 transition-colors"
              >
                {searchingPhotos ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                {isEs ? "Buscar" : "Buscar"}
              </button>
            </div>
          </div>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="mt-auto inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-white/15 px-4 text-[10px] font-bold text-white/75 hover:bg-white/[0.05]"
          >
            <Upload className="h-4 w-4" />
            {isEs ? "Subir mi foto" : "Adicionar minha foto"}
          </button>
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleUpload} className="hidden" />
        </div>

        <button
          type="button"
          onClick={() =>
            void searchPhotos({
              syncAll: true,
              queryOverride: photoQuery || photoDestination || selectedPackage.title,
              pageOverride: 1,
            })
          }
          disabled={searchingPhotos}
          className="mt-2 inline-flex min-h-9 w-full items-center justify-center gap-2 rounded-lg border border-[#F5F906]/35 bg-[#F5F906]/[0.07] px-3 text-[10px] font-extrabold text-[#F5F906] transition-colors hover:bg-[#F5F906]/[0.12] disabled:opacity-50"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${searchingPhotos ? "animate-spin" : ""}`} />
          {isEs ? "Sincronizar fotos del destino" : "Sincronizar fotos do destino"}
        </button>

        {state.destinos.length > 0 && (
          <div className="mt-2 flex gap-2 overflow-x-auto pb-1">
            {state.destinos.filter(Boolean).slice(0, 6).map((destination) => (
              <button
                key={destination}
                type="button"
                onClick={() => {
                  setPhotoQuery(destination);
                  setPhotoDestination(destination);
                }}
                className="min-h-8 shrink-0 rounded-full border border-white/10 px-3 text-[10px] font-bold text-white/55 hover:border-white/25 hover:text-white transition-colors"
              >
                {destination}
              </button>
            ))}
          </div>
        )}

        {(photoResults.length > 0 || availableImages.length > 0) && (
          <div className="mt-4">
            <p className="mb-2 text-[9px] font-bold uppercase tracking-[0.13em] text-white/35">
              {photoResults.length
                ? (isEs ? "Resultados de la bÃºsqueda" : "Resultados da busca")
                : (isEs ? "Banco de imÃ¡genes" : "Banco de imagens")}
            </p>
            <div className="grid grid-cols-4 gap-2">
              {(photoResults.length
                ? photoResults.map((photo) => ({
                    url: photo.url,
                    thumb: photo.thumb || photo.url,
                    alt: photo.alt,
                  }))
                : availableImages.map((url) => ({ url, thumb: url, alt: "" }))
              ).slice(0, 8).map((photo, index) => {
                const selected = activeSlide.imageUrl === photo.url;
                const usedByOtherSlide = slides.some(
                  (slide, slideIndex) =>
                    slideIndex !== activeIndex &&
                    slide.imageUrl === photo.url,
                );
                return (
                  <button
                    key={`${photo.url}-${index}`}
                    type="button"
                    disabled={usedByOtherSlide}
                    onClick={() => patchActive({ imageUrl: photo.url })}
                    aria-label={`${isEs ? "Usar foto" : "Usar foto"} ${index + 1}`}
                    className={`relative aspect-square overflow-hidden rounded-xl border-2 transition-all ${
                      selected
                        ? "border-[#F5F906] scale-95 ring-2 ring-[#F5F906]/50"
                        : usedByOtherSlide
                          ? "cursor-not-allowed border-white/5 opacity-35"
                          : "border-white/10 hover:border-white/30 hover:scale-105"
                    }`}
                  >
                    <img
                      src={photo.thumb}
                      alt={photo.alt || ""}
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                    {selected && (
                      <span className="absolute right-1 top-1 grid h-5 w-5 place-items-center rounded-full bg-[#F5F906] text-zinc-950">
                        <Check className="h-3 w-3" />
                      </span>
                    )}
                    {usedByOtherSlide && !selected && (
                      <span className="absolute inset-x-1 bottom-1 rounded bg-black/75 px-1 py-0.5 text-[7px] font-bold uppercase text-white/80">
                        {isEs ? "En uso" : "Em uso"}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
            {photoResults.length > 0 && (
              <div className="mt-3 flex items-center justify-between gap-3">
                <span className="text-[9px] font-medium text-white/35">
                  {isEs ? `PÃ¡gina ${photoPage}` : `PÃ¡gina ${photoPage}`}
                </span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    disabled={searchingPhotos || photoPage <= 1}
                    onClick={() => void searchPhotos({ queryOverride: photoDestination || photoQuery, pageOverride: Math.max(1, photoPage - 1) })}
                    className="min-h-8 rounded-lg border border-white/10 px-3 text-[9px] font-bold text-white/60 hover:bg-white/[0.05] disabled:opacity-30"
                  >
                    {isEs ? "Anterior" : "Anterior"}
                  </button>
                  <button
                    type="button"
                    disabled={searchingPhotos || !photoHasMore}
                    onClick={() => void searchPhotos({ queryOverride: photoDestination || photoQuery, pageOverride: photoPage + 1 })}
                    className="inline-flex min-h-8 items-center gap-1.5 rounded-lg border border-[#F5F906]/35 bg-[#F5F906]/[0.07] px-3 text-[9px] font-extrabold text-[#F5F906] hover:bg-[#F5F906]/[0.12] disabled:opacity-30"
                  >
                    {isEs ? "Ver mÃ¡s fotos" : "Ver mais fotos"}
                    <ChevronRight className="h-3 w-3" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        <details className="mt-3 border-t border-white/[0.06] pt-3">
          <summary className="cursor-pointer text-[9px] font-bold text-white/40 hover:text-white/65">
            {isEs ? "Usar enlace de una imagen" : "Usar link de uma imagem"}
          </summary>
          <div className="mt-2">
            <input
              value={activeSlide.imageUrl.startsWith("data:") ? "" : activeSlide.imageUrl}
              onChange={(event) => patchActive({ imageUrl: event.target.value })}
              placeholder="https://..."
              className="f1-carousel-input text-xs"
            />
          </div>
        </details>
      </details>
    );
  };

  const renderPublishFooterBox = () => {
    return (
      <div className="space-y-4">
        {/* â”€â”€ Ready-to-publish caption â”€â”€ */}
        <div className="rounded-2xl border border-[#F5F906]/20 bg-[#0F0F11] overflow-hidden shadow-lg">
          <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-white/[0.06]">
            <div className="flex items-center gap-2.5">
              <Sparkles className="h-4 w-4 text-[#F5F906]" />
              <h3 className="text-sm font-bold text-white">
                {isEs ? "Texto listo para publicar" : "Legenda pronta"}
              </h3>
            </div>
            <button
              type="button"
              onClick={generateCaption}
              disabled={generatingCaption}
              className="rounded-lg bg-[#F5F906] px-3 py-1.5 text-xs font-extrabold text-zinc-950 hover:bg-[#F5F906]/90 disabled:opacity-50 transition-colors shadow-md flex items-center gap-1.5"
            >
              {generatingCaption ? <RefreshCw className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
              {isEs ? "Reescribir" : "Reescrever"}
            </button>
          </div>
          <div className="p-4 bg-black/40">
            <textarea
              value={captionText}
              onChange={(e) => {
                setCaptionText(e.target.value);
                setCaptionEdited(true);
              }}
              placeholder={isEs ? "Tu texto aparecerÃ¡ aquÃ­..." : "Sua legenda aparecerÃ¡ aqui..."}
              rows={5}
              className="w-full rounded-xl border border-white/10 bg-[#121316] px-3 py-2.5 text-xs text-white outline-none focus:border-[#F5F906] focus:ring-1 focus:ring-[#F5F906]/30 transition-all resize-y"
            />
          </div>
        </div>

      </div>
    );
  };

  const renderActionBar = () => (
    <div className={`rounded-2xl border bg-[#0F0F11] p-4 sm:p-5 ${qualityReady ? "border-emerald-400/25" : "border-amber-300/25"}`}>
      <div className="mb-3 flex items-center gap-3">
        <span className={`grid h-7 w-7 shrink-0 place-items-center rounded-full text-xs font-black ${qualityReady ? "bg-emerald-400 text-emerald-950" : "bg-amber-300 text-amber-950"}`}>
          {qualityReady ? <Check className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
        </span>
        <div className="min-w-0">
          <p className="text-sm font-bold text-white">
            {qualityReady
              ? (isEs ? "Listo para publicar" : "Pronto para publicar")
              : (isEs ? "Revisa antes de publicar" : "Revise antes de publicar")}
          </p>
          <p className="text-[10px] text-white/50">{selectedPackage?.title}</p>
        </div>
      </div>
      {!qualityReady && (
        <div className="mb-3 flex flex-wrap gap-1.5">
          {qualityIssues.map((issue) => (
            <span key={issue} className="rounded-full border border-amber-300/20 bg-amber-300/[0.06] px-2.5 py-1 text-[10px] font-semibold text-amber-100/80">
              {issue}
            </span>
          ))}
        </div>
      )}
      <div className="grid gap-2.5 sm:grid-cols-3">
        <button type="button" onClick={() => setShowNewCarouselModal(true)} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/[0.04] px-3 text-xs font-extrabold text-white/80 hover:bg-white/[0.08]">
          <RefreshCw className="h-4 w-4" />
          {isEs ? "Nueva variaciÃ³n" : "Nova variaÃ§Ã£o"}
        </button>
        <button type="button" onClick={downloadAll} disabled={downloading || !qualityReady} title={!qualityReady ? qualityIssues.join(" â€¢ ") : undefined} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#F5F906] px-3 text-xs font-extrabold text-zinc-950 hover:bg-[#F5F906]/90 disabled:cursor-not-allowed disabled:opacity-40">
          <Download className="h-4 w-4" />
          {isEs ? `Descargar ${slides.length} imÃ¡genes` : `Baixar ${slides.length} imagens`}
        </button>
        {onNext && (
          <button type="button" onClick={onNext} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-cyan-400/30 bg-cyan-400/10 px-3 text-xs font-extrabold text-cyan-300 hover:bg-cyan-400/15">
            {isEs ? "Avanzar al Sitio (F3)" : "AvanÃ§ar para o Site (F3)"}
          </button>
        )}
      </div>
    </div>
  );

  return (
    <section className="space-y-4" data-testid="f1-carousel-builder">
      <div className="rounded-2xl border border-white/10 bg-[#0F0F11] p-4 sm:p-5">
        <div className="flex items-center gap-2 mb-4">
          <span className="grid h-6 w-6 place-items-center rounded-full bg-[#F5F906] text-[11px] font-black text-zinc-950">1</span>
          <h3 className="text-sm font-bold text-white">
            {isEs ? "Elige el paquete, cantidad y objetivo" : "Escolha o pacote, quantidade e objetivo"}
          </h3>
        </div>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1.2fr)_minmax(280px,1fr)]">
          <div className="space-y-3">
            <div>
              <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.14em] text-white/45">
                {isEs ? "Paquete seleccionado" : "Pacote selecionado"}
              </label>
              <select
                value={selectedPackage.id}
                onChange={(event) => {
                  const nextPackageId = event.target.value;
                  photoSearchRequestRef.current += 1;
                  selectedPackageIdRef.current = nextPackageId;
                  setSearchingPhotos(false);
                  setSelectedPackageId(nextPackageId);
                }}
                className="min-h-11 w-full rounded-xl border border-white/10 bg-zinc-900 px-3 text-sm font-semibold text-white outline-none focus:border-[#F5F906]"
              >
                {packages.map((pacote) => (
                  <option key={pacote.id} value={pacote.id}>{pacote.title}</option>
                ))}
              </select>
            </div>
            <div className="hidden">
              <div className="flex min-w-0 items-center gap-2.5">
                {showLogo ? (
                  <Eye className="h-4 w-4 shrink-0 text-[#F5F906]" />
                ) : (
                  <EyeOff className="h-4 w-4 shrink-0 text-white/40" />
                )}
                <div className="min-w-0">
                  <p className="text-[11px] font-bold text-white">
                    {isEs ? "Mostrar logo" : "Mostrar logo"}
                  </p>
                  <p className="truncate text-[9px] text-white/40">
                    {isEs
                      ? "Visible en todo el carrusel"
                      : "VisÃ­vel em todo o carrossel"}
                  </p>
                </div>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={showLogo}
                onClick={() => setShowLogo((current) => !current)}
                className={`relative h-6 w-11 shrink-0 rounded-full border transition-colors ${
                  showLogo
                    ? "border-[#F5F906] bg-[#F5F906]"
                    : "border-white/15 bg-white/10"
                }`}
              >
                <span
                  className={`absolute top-0.5 h-[18px] w-[18px] rounded-full bg-white shadow-sm transition-transform ${
                    showLogo ? "translate-x-5" : "translate-x-0.5"
                  }`}
                />
              </button>
            </div>
            <div className="rounded-xl border border-white/10 bg-black/20 p-2">
              <button
                type="button"
                role="switch"
                aria-checked={showLogo}
                onClick={() => setShowLogo((current) => !current)}
                className={`flex min-h-10 w-full items-center justify-between gap-3 rounded-lg border px-3 text-left transition-colors ${
                  showLogo
                    ? "border-[#F5F906]/55 bg-[#F5F906]/10"
                    : "border-white/10 bg-white/[0.02] hover:bg-white/[0.05]"
                }`}
              >
                <span className="flex min-w-0 items-center gap-2.5">
                  {showLogo ? (
                    <Eye className="h-4 w-4 shrink-0 text-[#F5F906]" />
                  ) : (
                    <EyeOff className="h-4 w-4 shrink-0 text-white/40" />
                  )}
                  <span>
                    <span className="block text-[11px] font-bold text-white">
                      {isEs ? "Mostrar logo" : "Mostrar logo"}
                    </span>
                    <span className="block text-[9px] text-white/40">
                      {showLogo
                        ? isEs ? "Logo activado" : "Logo ativada"
                        : isEs ? "Logo desactivado" : "Logo desativada"}
                    </span>
                  </span>
                </span>
                <span
                  className={`rounded-md px-2 py-1 text-[9px] font-extrabold uppercase ${
                    showLogo ? "bg-[#F5F906] text-zinc-950" : "bg-white/10 text-white/50"
                  }`}
                >
                  {showLogo ? (isEs ? "SÃ­" : "Sim") : (isEs ? "No" : "NÃ£o")}
                </span>
              </button>
              {showLogo && (
                <div className="mt-2 flex items-center justify-between gap-3 px-1 pb-0.5">
                  <span className="text-[9px] font-bold uppercase tracking-[0.12em] text-white/40">
                    {isEs ? "PosiciÃ³n" : "PosiÃ§Ã£o"}
                  </span>
                  <div
                    className="grid grid-cols-4 gap-1"
                    role="group"
                    aria-label={isEs ? "PosiciÃ³n del logo" : "PosiÃ§Ã£o da logo"}
                  >
                    {([
                      ["top-left", ArrowUpLeft, isEs ? "Arriba izquierda" : "Superior esquerda"],
                      ["top-right", ArrowUpRight, isEs ? "Arriba derecha" : "Superior direita"],
                      ["bottom-left", ArrowDownLeft, isEs ? "Abajo izquierda" : "Inferior esquerda"],
                      ["bottom-right", ArrowDownRight, isEs ? "Abajo derecha" : "Inferior direita"],
                    ] as const).map(([position, Icon, label]) => (
                      <button
                        key={position}
                        type="button"
                        title={label}
                        aria-label={label}
                        aria-pressed={logoPosition === position}
                        onClick={() => setLogoPosition(position)}
                        className={`grid h-8 w-8 place-items-center rounded-lg border transition-colors ${
                          logoPosition === position
                            ? "border-[#F5F906] bg-[#F5F906] text-zinc-950"
                            : "border-white/10 bg-white/[0.03] text-white/55 hover:bg-white/[0.08] hover:text-white"
                        }`}
                      >
                        <Icon className="h-3.5 w-3.5" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
            {onBackToAd && effectiveCoverSource !== "ad" && (
              <button
                type="button"
                onClick={onBackToAd}
                className="inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/[0.03] px-3 text-[11px] font-bold text-white/75 transition-colors hover:bg-white/[0.07] hover:text-white"
              >
                <ImagePlus className="h-4 w-4 text-[#F5F906]" />
                {isEs ? "Crear portada en Anuncio (F1)" : "Criar capa no AnÃºncio (F1)"}
              </button>
            )}
          </div>

          <div>
            <fieldset>
              <legend className="text-[10px] font-bold uppercase tracking-[0.14em] text-white/45">
                {isEs ? "Total de imÃ¡genes" : "Total de imagens"}
              </legend>
              <div className="mt-1.5 grid grid-cols-4 gap-2">
                {([3, 4, 5, 6] as CarouselSize[]).map((count) => (
                  <button
                    key={count}
                    type="button"
                    aria-pressed={slideCount === count}
                    onClick={() => changeSlideCount(count)}
                    className={`min-h-10 rounded-xl border px-2.5 text-xs font-extrabold transition-colors ${
                      slideCount === count
                        ? "border-[#F5F906] bg-[#F5F906] text-zinc-950 shadow-sm"
                        : "border-white/10 bg-white/[0.02] text-white/70 hover:bg-white/[0.06] hover:text-white"
                    }`}
                  >
                    {count}
                  </button>
                ))}
              </div>
            </fieldset>
            <fieldset className="mt-3">
              <legend className="text-[10px] font-bold uppercase tracking-[0.14em] text-white/45">
                {isEs ? "Formato de salida" : "Formato de saÃ­da"}
              </legend>
              <div className="mt-1.5 grid grid-cols-2 gap-2">
                {([
                  ["feed", Square, "Feed 4:5", "1080 Ã— 1350"],
                  ["story", Smartphone, "Stories 9:16", "1080 Ã— 1920"],
                ] as const).map(([format, Icon, labelText, dimensionsText]) => {
                  const active = carouselFormat === format;
                  return (
                    <div
                      key={format}
                      role="button"
                      tabIndex={0}
                      aria-pressed={active}
                      onClick={() => setCarouselFormat(format)}
                      onKeyDown={(e) => e.key === "Enter" && setCarouselFormat(format)}
                      className={`flex min-h-12 cursor-pointer items-center gap-2.5 rounded-xl border px-3 text-left transition-colors ${
                        active
                          ? "border-[#F5F906] bg-[#F5F906]/10 text-white"
                          : "border-white/10 bg-white/[0.02] text-white/65 hover:bg-white/[0.06] hover:text-white"
                      }`}
                    >
                      <Icon className={`h-4 w-4 shrink-0 ${active ? "text-[#F5F906]" : "text-white/45"}`} />
                      <span className="min-w-0">
                        <span className="block text-[10px] font-extrabold">{labelText}</span>
                        <span className="block text-[8px] text-white/40">{dimensionsText}</span>
                      </span>
                    </div>
                  );
                })}
              </div>
            </fieldset>
            </div>

            <fieldset className="min-w-0 lg:col-span-2">
              <legend className="text-[10px] font-bold uppercase tracking-[0.14em] text-white/45">
                {isEs ? "Formato del carrusel" : "Formato do carrossel"}
              </legend>
              <div className="mt-1.5 grid grid-cols-3 gap-1.5 sm:grid-cols-4 lg:grid-cols-6">
                {([
                  ["impact", isEs ? "Inspirar" : "Inspirar", isEs ? "Deseo y experiencia" : "Desejo e experiÃªncia"],
                  ["oferta", isEs ? "Oferta" : "Oferta", isEs ? "Valor y conversiÃ³n" : "Valor e conversÃ£o"],
                  ["editorial", isEs ? "GuÃ­a" : "Guia", isEs ? "Ãštil para guardar" : "Ãštil para salvar"],
                  ["vibrant", "FAQ", isEs ? "Resuelve objeciones" : "Resolve objeÃ§Ãµes"],
                  ["minimalist", isEs ? "Confianza" : "ConfianÃ§a", isEs ? "Claridad y atenciÃ³n" : "Clareza e atendimento"],
                  ["itinerary", isEs ? "Itinerario" : "Roteiro", isEs ? "Ruta y logÃ­stica" : "Percurso e logÃ­stica"],
                  ["organic", "Curvo", isEs ? "Formas orgÃ¡nicas" : "Formas orgÃ¢nicas"],
                  ["glass", "Transparente", isEs ? "Ligero y sofisticado" : "Leve e sofisticado"],
                  ["headline", isEs ? "Titular" : "Destaque", isEs ? "Gancho con degradado" : "Gancho com degradÃª"],
                  ["ticket", isEs ? "Billete" : "Bilhete", isEs ? "Estilo tarjeta de embarque" : "Estilo cartÃ£o de embarque"],
                  ["headline-center", isEs ? "Franjas centro" : "Faixas centrais", isEs ? "Informacion centrada abajo" : "Informacoes centralizadas abaixo"],
                  ["headline-footer", isEs ? "Franjas bajas" : "Faixas inferiores", isEs ? "Titulo e informacion en la base" : "Titulo e informacoes na base"],
                ] as const).map(([variant, labelText, description]) => {
                  const isActiveVariant = currentStrategy === variant;
                  return (
                    <button
                      key={variant}
                      type="button"
                      aria-pressed={isActiveVariant}
                      aria-label={`${labelText}: ${description}`}
                      title={description}
                      onClick={() => applyCarouselStrategy(variant)}
                      className={`min-h-9 whitespace-nowrap rounded-lg border px-2 py-2 text-center transition-colors ${
                        isActiveVariant
                          ? "border-[#F5F906] bg-[#F5F906]/10"
                          : "border-white/10 bg-transparent hover:border-white/20 hover:bg-white/[0.03]"
                      }`}
                    >
                      <span className={`block text-[10px] font-extrabold ${isActiveVariant ? "text-[#F5F906]" : "text-white/75"}`}>
                        {labelText}
                      </span>
                    </button>
                  );
                })}
              </div>
            </fieldset>
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-[#0F0F11] p-3 sm:p-4">
        {/* Header: tÃ­tulo + contador + controles de modo e zoom */}
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="grid h-6 w-6 place-items-center rounded-full bg-[#F5F906] text-[11px] font-black text-zinc-950">2</span>
            <div>
              <h3 className="text-sm font-bold text-white">{isEs ? "Revisa la secuencia" : "Revise a sequÃªncia"}</h3>
              <p className="text-[10px] text-white/40">
                {isEs ? "Toca una imagen para abrirla." : "Toque em uma imagem para abri-la."}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Contador + Setas de NavegaÃ§Ã£o */}
            <div className="flex items-center rounded-xl border border-white/10 bg-black/50 p-0.5">
              <button
                type="button"
                onClick={() => setActiveIndex((c) => Math.max(0, c - 1))}
                disabled={activeIndex === 0}
                aria-label={isEs ? "Anterior" : "Anterior"}
                title={isEs ? "Diapositiva anterior (<)" : "Slide anterior (<)"}
                className="grid h-7 w-7 place-items-center rounded-lg text-white/70 hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-25"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
              </button>
              <span className="min-w-[85px] text-center px-2 text-[10px] font-bold text-white/75">
                {isEs ? "Imagen" : "Imagem"} {activeIndex + 1} / {slides.length}
              </span>
              <button
                type="button"
                onClick={() => setActiveIndex((c) => Math.min(slides.length - 1, c + 1))}
                disabled={activeIndex === slides.length - 1}
                aria-label={isEs ? "PrÃ³ximo" : "PrÃ³ximo"}
                title={isEs ? "Siguiente diapositiva (>)" : "PrÃ³ximo slide (>)"}
                className="grid h-7 w-7 place-items-center rounded-lg text-white/70 hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-25"
              >
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* BotÃµes de modo de visualizaÃ§Ã£o */}
            <div className="flex items-center gap-1 rounded-xl border border-white/10 p-1">
              <button
                type="button"
                onClick={() => setViewMode("ribbon")}
                aria-pressed={viewMode === "ribbon"}
                aria-label={isEs ? "Vista horizontal" : "VisualizaÃ§Ã£o horizontal"}
                title={isEs ? "Fila horizontal" : "Faixa horizontal"}
                className={`grid h-8 w-8 place-items-center rounded-lg transition-colors ${
                  viewMode === "ribbon"
                    ? "bg-[#F5F906] text-zinc-950"
                    : "text-white/50 hover:bg-white/[0.07] hover:text-white"
                }`}
              >
                <LayoutGrid className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode("stack")}
                aria-pressed={viewMode === "stack"}
                aria-label={isEs ? "Vista vertical" : "VisualizaÃ§Ã£o vertical"}
                title={isEs ? "Grade vertical" : "Grade vertical (uma abaixo da outra)"}
                className={`grid h-8 w-8 place-items-center rounded-lg transition-colors ${
                  viewMode === "stack"
                    ? "bg-[#F5F906] text-zinc-950"
                    : "text-white/50 hover:bg-white/[0.07] hover:text-white"
                }`}
              >
                <Rows className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode("focus")}
                aria-pressed={viewMode === "focus"}
                aria-label={isEs ? "Vista en foco" : "Modo foco"}
                title={isEs ? "Una imagen a la vez" : "Uma imagem por vez (foco)"}
                className={`grid h-8 w-8 place-items-center rounded-lg transition-colors ${
                  viewMode === "focus"
                    ? "bg-[#F5F906] text-zinc-950"
                    : "text-white/50 hover:bg-white/[0.07] hover:text-white"
                }`}
              >
                <Maximize2 className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Controles de Zoom (ocultos no modo focus pois jÃ¡ tem escala grande) */}
            {viewMode !== "focus" && (
              <div className="flex items-center gap-1 rounded-xl border border-white/10 p-1">
                <button
                  type="button"
                  onClick={zoomOut}
                  disabled={zoomScale <= 0.5}
                  aria-label={isEs ? "Reducir zoom" : "Reduzir zoom"}
                  title={isEs ? "Reducir" : "Diminuir"}
                  className="grid h-8 w-8 place-items-center rounded-lg text-white/50 hover:bg-white/[0.07] hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
                >
                  <ZoomOut className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={zoomReset}
                  aria-label={isEs ? "Ajustar zoom" : "Ajustar zoom"}
                  title={`${Math.round(zoomScale * 100)}% â€” ${isEs ? "clic para resetear" : "clique para redefinir"}`}
                  className="min-w-[34px] rounded-lg px-1 py-1 text-[9px] font-bold text-white/40 hover:bg-white/[0.07] hover:text-white"
                >
                  {Math.round(zoomScale * 100)}%
                </button>
                <button
                  type="button"
                  onClick={zoomIn}
                  disabled={zoomScale >= 1.6}
                  aria-label={isEs ? "Aumentar zoom" : "Aumentar zoom"}
                  title={isEs ? "Ampliar" : "Ampliar"}
                  className="grid h-8 w-8 place-items-center rounded-lg text-white/50 hover:bg-white/[0.07] hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
                >
                  <ZoomIn className="h-3.5 w-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* â”€â”€ MODO: FAIXA HORIZONTAL (ribbon) â”€â”€ */}
        {viewMode === "ribbon" && (() => {
          const isMobile = typeof window !== "undefined" && window.innerWidth < 420;
          const widthsByCount: Record<CarouselSize, number> = isMobile
            ? { 3: 210, 4: 190, 5: 172, 6: 156 }
            : { 3: 300, 4: 250, 5: 205, 6: 170 };
          const baseWidth = widthsByCount[slideCount];
          const thumbWidth = Math.round(baseWidth * zoomScale);
          return (
            <div className="relative flex items-center group/ribbon">
              {/* Seta esquerda */}
              <button
                type="button"
                onClick={() => {
                  const container = document.getElementById("f1-ribbon-scroll");
                  if (container) container.scrollBy({ left: -thumbWidth - 16, behavior: "smooth" });
                  setActiveIndex((c) => Math.max(0, c - 1));
                }}
                disabled={activeIndex === 0}
                aria-label={isEs ? "Anterior" : "Anterior"}
                title={isEs ? "Rolagem e slide anterior" : "Rolagem e slide anterior"}
                className="absolute left-1 z-20 grid h-9 w-9 place-items-center rounded-full border border-white/20 bg-black/80 text-white shadow-lg backdrop-blur-md transition-all hover:bg-black hover:scale-105 disabled:pointer-events-none disabled:opacity-0"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>

              <div id="f1-ribbon-scroll" className="f1-carousel-scroll w-full snap-x overflow-x-auto pb-3 pt-1">
                <div className="mx-auto flex w-max min-w-full justify-center gap-4 px-2">
                  {slides.map((slide, index) => {
                  const isActive = activeIndex === index;
                  return (
                    <div
                      key={slide.id}
                      role="button"
                      tabIndex={0}
                      onClick={() => setActiveIndex(index)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          setActiveIndex(index);
                        }
                      }}
                      aria-label={`${isEs ? "Abrir imagen" : "Abrir imagem"} ${index + 1}`}
                      aria-pressed={isActive}
                      style={{
                        flex: "0 0 auto",
                        width: `${thumbWidth}px`,
                      }}
                      className={`snap-center group relative flex flex-col overflow-hidden rounded-2xl border-2 bg-[#121316] text-left transition-all cursor-pointer ${
                        isActive
                          ? "border-[#F5F906] shadow-[0_0_24px_rgba(245,249,6,0.22)] ring-1 ring-[#F5F906]/40"
                          : "border-white/12 hover:border-white/30 hover:-translate-y-0.5"
                      }`}
                    >
                      <ScaledSlidePreview
                        slide={slide}
                        index={index}
                        total={slides.length}
                        ratio={carouselRatio}
                        logo={renderedLogo}
                        logoPosition={logoPosition}
                        primary={state.primaryColor}
                        secondary={state.secondaryColor}
                        width={thumbWidth}
                      />
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setMaximizedSlide(slide);
                        }}
                        className="absolute top-2 right-2 p-1.5 bg-black/60 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:bg-black/90 backdrop-blur-md z-10"
                        title={isEs ? "Ampliar imagen" : "Ampliar imagem"}
                      >
                        <Maximize2 className="w-3.5 h-3.5" />
                      </button>
                      <div
                        className={`flex w-full items-center justify-between gap-1 border-t px-2.5 py-2 transition-colors ${
                          isActive
                            ? "border-[#F5F906]/30 bg-[#F5F906]/15"
                            : slide.kind === "cover"
                              ? "border-[#F5F906]/20 bg-[#F5F906]/[0.05]"
                              : slide.kind === "closing"
                                ? "border-[#00F0FF]/20 bg-[#00F0FF]/[0.05]"
                                : "border-white/10 bg-[#0E0F12]"
                        }`}
                      >
                        <div className="flex items-center gap-1.5 truncate">
                          <span
                            className={`rounded px-1.5 py-0.5 text-[9px] font-black tracking-wider uppercase ${
                              slide.kind === "cover"
                                ? "bg-[#F5F906] text-zinc-950"
                                : slide.kind === "closing"
                                  ? "bg-[#00F0FF] text-zinc-950"
                                  : "bg-white/15 text-white"
                            }`}
                          >
                            {slide.kind === "cover"
                              ? (isEs ? "PORTADA" : "CAPA")
                              : slide.kind === "closing"
                                ? (isEs ? "CIERRE" : "FIM")
                                : `#${index + 1}`}
                          </span>
                          <span
                            className={`truncate text-[10px] font-bold ${
                              isActive
                                ? "text-[#F5F906]"
                                : slide.kind === "cover"
                                  ? "text-[#F5F906]"
                                  : slide.kind === "closing"
                                    ? "text-[#00F0FF]"
                                    : "text-white/80"
                            }`}
                          >
                            {slide.kind === "cover"
                              ? slide.coverSource === "ad"
                                ? "Original"
                                : (isEs ? "Editable" : "EditÃ¡vel")
                              : slide.kind === "closing"
                                ? (isEs ? "Contacto" : "Fechamento")
                                : `${isEs ? "Diapositiva" : "Slide"} ${index + 1}`}
                          </span>
                        </div>
                        {slide.kind === "cover" && slide.coverSource === "ad" && (
                          <Lock className="h-3 w-3 shrink-0 text-[#F5F906]" />
                        )}
                      </div>
                    </div>
                  );
                  })}
                </div>
              </div>

              {/* Seta direita */}
              <button
                type="button"
                onClick={() => {
                  const container = document.getElementById("f1-ribbon-scroll");
                  if (container) container.scrollBy({ left: thumbWidth + 16, behavior: "smooth" });
                  setActiveIndex((c) => Math.min(slides.length - 1, c + 1));
                }}
                disabled={activeIndex === slides.length - 1}
                aria-label={isEs ? "PrÃ³xima" : "PrÃ³xima"}
                title={isEs ? "Rolagem e prÃ³ximo slide" : "Rolagem e prÃ³ximo slide"}
                className="absolute right-1 z-20 grid h-9 w-9 place-items-center rounded-full border border-white/20 bg-black/80 text-white shadow-lg backdrop-blur-md transition-all hover:bg-black hover:scale-105 disabled:pointer-events-none disabled:opacity-0"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          );
        })()}

        {/* â”€â”€ MODO: GRADE VERTICAL (stack) â€” uma embaixo da outra â”€â”€ */}
        {viewMode === "stack" && (() => {
          // Redimensionamento dinÃ¢mico na grade
          // 3 slides â†’ 2 colunas grandes | 4 â†’ 2 cols | 5-6 â†’ 3 cols | 7+ â†’ 4 cols
          const cols = slides.length <= 4 ? 2 : slides.length <= 6 ? 3 : 4;
          const isMobile = typeof window !== "undefined" && window.innerWidth < 420;
          const baseWidth = isMobile ? Math.max(120, 160 - slides.length * 5) : Math.round(Math.max(140, 340 - slides.length * 20));
          const thumbWidth = Math.round(baseWidth * zoomScale);
          const gridClass = cols === 2 ? "grid-cols-2" : cols === 3 ? "grid-cols-2 md:grid-cols-3" : "grid-cols-2 md:grid-cols-4";
          return (
            <div className={`grid ${gridClass} gap-4`}>
              {slides.map((slide, index) => {
                const isActive = activeIndex === index;
                return (
                  <div
                    key={slide.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => setActiveIndex(index)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        setActiveIndex(index);
                      }
                    }}
                    aria-label={`${isEs ? "Abrir imagen" : "Abrir imagem"} ${index + 1}`}
                    aria-pressed={isActive}
                    style={{ width: "100%", maxWidth: `${thumbWidth}px` }}
                    className={`group relative mx-auto flex flex-col overflow-hidden rounded-2xl border-2 bg-[#121316] text-left transition-all cursor-pointer ${
                      isActive
                        ? "border-[#F5F906] shadow-[0_0_24px_rgba(245,249,6,0.22)] ring-1 ring-[#F5F906]/40"
                        : "border-white/12 hover:border-white/30 hover:-translate-y-0.5"
                    }`}
                  >
                    <ScaledSlidePreview
                      slide={slide}
                      index={index}
                      total={slides.length}
                      ratio={carouselRatio}
                      logo={renderedLogo}
                      logoPosition={logoPosition}
                      primary={state.primaryColor}
                      secondary={state.secondaryColor}
                      width={thumbWidth}
                    />
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setMaximizedSlide(slide);
                      }}
                      className="absolute top-2 right-2 p-1.5 bg-black/60 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:bg-black/90 backdrop-blur-md z-10"
                      title={isEs ? "Ampliar imagen" : "Ampliar imagem"}
                    >
                      <Maximize2 className="w-3.5 h-3.5" />
                    </button>
                    <div
                      className={`flex w-full items-center justify-between gap-2 border-t px-3 py-2.5 transition-colors ${
                        isActive
                          ? "border-[#F5F906]/30 bg-[#F5F906]/15"
                          : slide.kind === "cover"
                            ? "border-[#F5F906]/20 bg-[#F5F906]/[0.05]"
                            : slide.kind === "closing"
                              ? "border-[#00F0FF]/20 bg-[#00F0FF]/[0.05]"
                              : "border-white/10 bg-[#0E0F12]"
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <span
                          className={`grid h-5 px-1.5 place-items-center rounded text-[9px] font-black tracking-wider uppercase ${
                            slide.kind === "cover"
                              ? "bg-[#F5F906] text-zinc-950"
                              : slide.kind === "closing"
                                ? "bg-[#00F0FF] text-zinc-950"
                                : "bg-white/15 text-white"
                          }`}
                        >
                          {slide.kind === "cover"
                            ? (isEs ? "PORTADA" : "CAPA")
                            : slide.kind === "closing"
                              ? (isEs ? "CIERRE" : "FIM")
                              : `#${index + 1}`}
                        </span>
                        <span
                          className={`truncate text-[11px] font-bold ${
                            isActive
                              ? "text-[#F5F906]"
                              : slide.kind === "cover"
                                ? "text-[#F5F906]"
                                : slide.kind === "closing"
                                  ? "text-[#00F0FF]"
                                  : "text-white/80"
                          }`}
                        >
                          {slide.kind === "cover"
                            ? slide.coverSource === "ad"
                              ? (isEs ? "Portada del anuncio" : "Capa do anÃºncio")
                              : (isEs ? "Portada editable" : "Capa editÃ¡vel")
                            : slide.kind === "closing"
                              ? (isEs ? "Cierre + contacto" : "Fechamento + contato")
                              : `${isEs ? "Contenido" : "ConteÃºdo"} ${index + 1}`}
                        </span>
                      </div>
                      {slide.kind === "cover" && slide.coverSource === "ad" && (
                        <Lock className="h-3.5 w-3.5 shrink-0 text-[#F5F906]" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })()}

        {/* â”€â”€ MODO: FOCO â€” uma imagem grande por vez com setas â”€â”€ */}
        {viewMode === "focus" && (() => {
          const isMobile = typeof window !== "undefined" && window.innerWidth < 420;
          const baseFocusW = isMobile ? window.innerWidth - 64 : 380;
          const thumbWidth = Math.round(baseFocusW * zoomScale);
          return (
            <div className="flex flex-col items-center gap-3">
              {/* Setas de navegaÃ§Ã£o + indicador */}
              <div className="flex w-full items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => setActiveIndex((c) => Math.max(0, c - 1))}
                  disabled={activeIndex === 0}
                  aria-label={isEs ? "Imagen anterior" : "Imagem anterior"}
                  className="grid h-10 w-10 place-items-center rounded-xl border border-white/10 text-white/70 hover:bg-white/[0.06] disabled:opacity-25"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>

                <div className="flex gap-1.5">
                  {slides.map((_, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setActiveIndex(idx)}
                      aria-label={`${isEs ? "Ir a imagen" : "Ir para imagem"} ${idx + 1}`}
                      className={`h-1.5 rounded-full transition-all ${
                        activeIndex === idx
                          ? "w-5 bg-[#F5F906]"
                          : "w-1.5 bg-white/20 hover:bg-white/40"
                      }`}
                    />
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => setActiveIndex((c) => Math.min(slides.length - 1, c + 1))}
                  disabled={activeIndex === slides.length - 1}
                  aria-label={isEs ? "Siguiente imagen" : "PrÃ³xima imagem"}
                  className="grid h-10 w-10 place-items-center rounded-xl border border-white/10 text-white/70 hover:bg-white/[0.06] disabled:opacity-25"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>

              {/* Canvas do slide ativo em destaque */}
              <div className="group relative mx-auto overflow-hidden rounded-2xl border-2 border-[#F5F906] shadow-[0_0_32px_rgba(245,249,6,0.15)]">
                  {activeSlide && (
                    <>
                      <ScaledSlidePreview
                        slide={activeSlide}
                        index={activeIndex}
                        total={slides.length}
                        ratio={carouselRatio}
                        logo={renderedLogo}
                        logoPosition={logoPosition}
                        primary={state.primaryColor}
                        secondary={state.secondaryColor}
                        width={thumbWidth}
                      />
                      <button
                        type="button"
                        onClick={() => setMaximizedSlide(activeSlide)}
                        className="absolute inset-0 z-10 flex items-center justify-center bg-black/60 opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100"
                        title={isEs ? "Ampliar imagen" : "Ampliar imagem"}
                      >
                        <span className="flex items-center gap-2 rounded-full bg-white/20 px-4 py-2 text-sm font-bold text-white backdrop-blur-md">
                          <Maximize2 className="h-4 w-4" />
                          {isEs ? "Ver más grande" : "Ver maior"}
                        </span>
                      </button>
                    </>
                  )}
              </div>

              <p className="text-[10px] text-white/40">
                {activeSlide?.kind === "cover"
                  ? activeCoverIsProtected
                    ? (isEs ? "Portada creada en Anuncio." : "Capa criada no AnÃºncio.")
                    : (isEs ? "Edita esta portada." : "Edite esta capa.")
                  : activeSlide?.kind === "closing"
                    ? (isEs ? "Cierre + contacto" : "Fechamento + contato")
                    : `${isEs ? "Edita la imagen" : "Edite a imagem"} ${activeIndex + 1}`}
              </p>
            </div>
          );
        })()}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,.82fr)_minmax(340px,1.18fr)]">
        {/* â• â•  LEFT: Slide Editor â• â•  */}
        <div className="order-2 space-y-3 lg:order-1">
          {/* â”€â”€ Card: Slide being edited â”€â”€ */}
          <div className="rounded-2xl border border-white/10 bg-[#0F0F11] overflow-hidden">
            {/* Header bar */}
            <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-white/[0.06]">
              <div className="flex items-center gap-2.5">
                <span className="grid h-6 w-6 place-items-center rounded-full bg-[#F5F906] text-[11px] font-black text-zinc-950">3</span>
                <div>
                  <h3 className="text-sm font-bold text-white leading-none">
                    {activeSlide?.kind === "cover"
                      ? activeCoverIsProtected
                        ? (isEs ? "Portada del anuncio" : "Capa do anÃºncio")
                        : (isEs ? "Edita la portada" : "Editar capa")
                      : activeSlide?.kind === "closing"
                        ? (isEs ? "Edita el cierre" : "Edite o fechamento")
                        : (isEs ? "Foto y texto de esta imagen" : "Editar slide")}
                  </h3>
                  <span className={`inline-flex items-center mt-0.5 rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
                    activeSlide?.kind === "cover"
                      ? "bg-[#F5F906]/15 text-[#F5F906]"
                      : activeSlide?.kind === "closing"
                        ? "bg-cyan-400/10 text-cyan-400"
                        : "bg-white/[0.06] text-white/45"
                  }`}>
                    {activeSlide?.kind === "cover"
                      ? (isEs ? "Portada" : "Capa")
                      : activeSlide?.kind === "closing"
                        ? (isEs ? "Cierre" : "Fechamento")
                        : `Slide ${activeIndex + 1} / ${slides.length}`}
                  </span>
                </div>
              </div>
              {/* Quick nav */}
              <div className="flex items-center gap-1 rounded-xl border border-white/10 bg-black/40 p-0.5">
                <button
                  type="button"
                  onClick={() => setActiveIndex((c) => Math.max(0, c - 1))}
                  disabled={activeIndex === 0}
                  aria-label={isEs ? "Anterior" : "Anterior"}
                  className="grid h-7 w-7 place-items-center rounded-lg text-white/60 hover:bg-white/[0.08] hover:text-white disabled:opacity-25 transition-all"
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                </button>
                <span className="min-w-[28px] text-center text-[10px] font-bold text-white/40">{activeIndex + 1}/{slides.length}</span>
                <button
                  type="button"
                  onClick={() => setActiveIndex((c) => Math.min(slides.length - 1, c + 1))}
                  disabled={activeIndex === slides.length - 1}
                  aria-label={isEs ? "PrÃ³xima" : "PrÃ³xima"}
                  className="grid h-7 w-7 place-items-center rounded-lg text-white/60 hover:bg-white/[0.08] hover:text-white disabled:opacity-25 transition-all"
                >
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {/* Capa herdada do anÃºncio */}
            {activeCoverIsProtected && (
              <div className="m-4 rounded-xl border border-[#F5F906]/20 bg-[#F5F906]/[0.05] p-4 flex gap-3">
                <Lock className="mt-0.5 h-5 w-5 shrink-0 text-[#F5F906]" />
                <div className="flex-1">
                  <p className="text-sm font-bold text-white">
                    {isEs ? "Portada creada en Anuncio." : "Capa criada no AnÃºncio."}
                  </p>
                  <p className="mt-1 text-xs leading-relaxed text-white/50">
                    {isEs
                      ? "La pieza original se mantiene intacta al descargar."
                      : "A arte original serÃ¡ preservada exatamente como foi gerada."}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {onBackToAd && (
                      <button
                        type="button"
                        onClick={onBackToAd}
                        className="min-h-9 rounded-lg border border-white/15 px-3 text-[10px] font-bold text-white/75 transition-colors hover:bg-white/[0.06]"
                      >
                        {isEs ? "Crear otra en Anuncio" : "Gerar outra no AnÃºncio"}
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={switchToNativeCover}
                      className="min-h-9 rounded-lg bg-[#F5F906] px-3 text-[10px] font-extrabold text-zinc-950 transition-transform active:scale-[0.98]"
                    >
                      {isEs ? "Usar portada editable" : "Usar capa editÃ¡vel"}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Content & Closing slide editor */}
            {activeSlide && !activeCoverIsProtected && (
              <div className="divide-y divide-white/[0.06]">

                {/* â”€â”€ SECTION 1: Estilo & Fonte â”€â”€ */}
                <div className="px-4 py-3.5 space-y-3">
                  <p className="text-[9px] font-extrabold uppercase tracking-[0.18em] text-white/30">
                    {isEs ? "Estilo e TipografÃ­a" : "Estilo e Tipografia"}
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {/* Font selector */}
                    <div className="space-y-1.5">
                      <label className="text-[9.5px] font-bold uppercase tracking-[0.12em] text-white/40 block">
                        {isEs ? "Fuente" : "Fonte"}
                      </label>
                      <select
                        value={activeSlide.fontFamily || "Inter"}
                        onChange={(event) => patchActive({ fontFamily: event.target.value })}
                        aria-label={isEs ? "Tipo de letra" : "FamÃ­lia da fonte"}
                        className="w-full rounded-xl border border-white/10 bg-black/60 px-3 py-2 text-[11px] font-bold text-white outline-none focus:border-[#F5F906] focus:ring-2 focus:ring-[#F5F906]/15 transition-all cursor-pointer"
                      >
                        <option value="Inter">Inter â€” Moderno</option>
                        <option value="Montserrat">Montserrat â€” Elegante</option>
                        <option value="Poppins">Poppins â€” GeomÃ©trico</option>
                        <option value="Outfit">Outfit â€” Vibrante</option>
                        <option value="Playfair Display">Playfair â€” Luxo</option>
                        <option value="Roboto">Roboto â€” ClÃ¡ssica</option>
                      </select>
                    </div>
                    {/* Shadow toggle */}
                    <div className="space-y-1.5">
                      <label className="text-[9.5px] font-bold uppercase tracking-[0.12em] text-white/40 block">
                        {isEs ? "Opciones" : "OpÃ§Ãµes"}
                      </label>
                      <label className={`flex items-center gap-2.5 cursor-pointer rounded-xl border px-3 py-2 transition-all ${
                        activeSlide.showShadow !== false
                          ? "border-[#F5F906]/30 bg-[#F5F906]/[0.07]"
                          : "border-white/10 bg-black/40 hover:border-white/20"
                      }`}>
                        <input
                          type="checkbox"
                          checked={activeSlide.showShadow !== false}
                          onChange={(event) => patchActive({ showShadow: event.target.checked })}
                          className="sr-only"
                        />
                        <div className={`h-4 w-7 rounded-full transition-all relative ${activeSlide.showShadow !== false ? "bg-[#F5F906]" : "bg-white/20"}`}>
                          <span className={`absolute top-0.5 h-3 w-3 rounded-full bg-white shadow transition-all ${activeSlide.showShadow !== false ? "left-3.5" : "left-0.5"}`} />
                        </div>
                        <span className="text-[11px] font-bold text-white/70">{isEs ? "Sombra" : "Sombra"}</span>
                      </label>
                    </div>
                  </div>
                  {["editorial", "vibrant", "organic", "glass", "headline-center", "headline-footer"].includes(activeSlide.slideVariant) && (
                    <fieldset>
                      <legend className="mb-1.5 text-[9px] font-bold uppercase tracking-[0.12em] text-white/40">
                        {isEs ? "PosiciÃ³n del contenido" : "PosiÃ§Ã£o do conteÃºdo"}
                      </legend>
                      <div className="grid grid-cols-4 gap-1">
                        {([
                          ["auto", Sparkles, "Auto"],
                          ["left", AlignLeft, isEs ? "Izquierda" : "Esquerda"],
                          ["center", AlignCenter, "Centro"],
                          ["right", AlignRight, isEs ? "Derecha" : "Direita"],
                        ] as const).map(([alignment, Icon, label]) => (
                          <button
                            key={alignment}
                            type="button"
                            title={label}
                            aria-label={label}
                            aria-pressed={(activeSlide.contentAlignment || "auto") === alignment}
                            onClick={() => patchActive({ contentAlignment: alignment })}
                            className={`grid min-h-8 place-items-center rounded-lg border transition-colors ${
                              (activeSlide.contentAlignment || "auto") === alignment
                                ? "border-[#F5F906] bg-[#F5F906]/10 text-[#F5F906]"
                                : "border-white/10 bg-white/[0.02] text-white/50 hover:text-white"
                            }`}
                          >
                            <Icon className="h-3.5 w-3.5" />
                          </button>
                        ))}
                      </div>
                    </fieldset>
                  )}
                </div>

                {/* â”€â”€ SECTION 2: Selo / Etiqueta â”€â”€ */}
                <div className="px-4 py-3.5 space-y-3">
                  <p className="text-[9px] font-extrabold uppercase tracking-[0.18em] text-white/30">
                    {isEs ? "Etiqueta opcional" : "Selo opcional"}
                  </p>
                  <input
                    value={activeSlide.label || ""}
                    maxLength={32}
                    placeholder={isEs ? "Ej: GUÃA RÃPIDA" : "Ex: GUIA RÃPIDO"}
                    onChange={(event) => patchActive({ label: event.target.value })}
                    className="f1-carousel-input !min-h-[38px] !py-2 !text-[13px]"
                  />
                  {/* Pill suggestions */}
                  <div className="flex flex-wrap gap-1.5">
                    {["EXPERIÃŠNCIA", "ROTEIRO", "GUIA", "INCLUI", "DICA"].map((pill) => (
                      <button
                        key={pill}
                        type="button"
                        onClick={() => patchActive({ label: pill })}
                        className="rounded-full border border-white/12 bg-white/[0.04] px-2.5 py-1 text-[9px] font-bold text-white/55 hover:border-[#F5F906]/40 hover:bg-[#F5F906]/[0.08] hover:text-[#F5F906] transition-all"
                      >
                        + {pill}
                      </button>
                    ))}
                  </div>
                  <details className="rounded-xl border border-white/[0.07] bg-black/20 p-2.5">
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-2 text-[9px] font-bold text-white/55">
                      <span>{isEs ? "Personalizar etiqueta" : "Personalizar selo"}</span>
                      <span className="text-[8px] font-medium text-white/30">
                        {isEs ? "formato, posiciÃ³n y color" : "formato, posiÃ§Ã£o e cor"}
                      </span>
                    </summary>
                    <div className="mt-3">
                      <p className="mb-1.5 text-[8px] font-bold uppercase tracking-[0.12em] text-white/30">
                        {isEs ? "Formato" : "Formato"}
                      </p>
                      <div className="grid grid-cols-5 gap-1">
                      {([
                        ["filled", "Capsula"],
                        ["rectangle", isEs ? "Cuadrado" : "Quadrado"],
                        ["outline-thin", "Contorno"],
                        ["outline-thick", isEs ? "Borde fuerte" : "Borda forte"],
                        ["translucent", "Suave"],
                        ["gradient", isEs ? "Degradado" : "Degrade"],
                        ["stripe-left", isEs ? "Linea lateral" : "Linha lateral"],
                        ["line-top", isEs ? "Linea arriba" : "Linha acima"],
                        ["line-bottom", isEs ? "Linea abajo" : "Linha abaixo"],
                      ] as const).map(([styleKey, styleTitle]) => (
                        <button
                          key={styleKey}
                          type="button"
                          title={styleTitle}
                          aria-label={styleTitle}
                          aria-pressed={(activeSlide.labelStyle || "filled") === styleKey}
                          onClick={() => patchActive({ labelStyle: styleKey })}
                          className={`grid min-h-8 place-items-center rounded-md border px-1 py-1 transition-colors ${
                            (activeSlide.labelStyle || "filled") === styleKey
                              ? "border-[#F5F906] bg-[#F5F906]/10 text-[#F5F906]"
                              : "border-white/10 bg-white/[0.02] text-white/55 hover:border-white/25 hover:text-white"
                          }`}
                        >
                          <SealStyleGlyph style={styleKey} />
                        </button>
                      ))}
                      </div>
                    </div>
                    <div className="mt-3">
                      <p className="mb-1.5 text-[8px] font-bold uppercase tracking-[0.12em] text-white/30">
                        {isEs ? "PosiciÃ³n" : "PosiÃ§Ã£o"}
                      </p>
                      <div className="grid grid-cols-4 gap-1">
                      {([
                        ["auto", Sparkles, "Auto"],
                        ["left", AlignLeft, isEs ? "Izquierda" : "Esquerda"],
                        ["center", AlignCenter, "Centro"],
                        ["right", AlignRight, isEs ? "Derecha" : "Direita"],
                      ] as const).map(([alignmentKey, Icon, alignmentTitle]) => (
                        <button
                          key={alignmentKey}
                          type="button"
                          title={alignmentTitle}
                          aria-label={alignmentTitle}
                          aria-pressed={(activeSlide.labelAlignment || "auto") === alignmentKey}
                          onClick={() => patchActive({ labelAlignment: alignmentKey })}
                          className={`grid min-h-8 place-items-center rounded-md border transition-colors ${
                            (activeSlide.labelAlignment || "auto") === alignmentKey
                              ? "border-[#F5F906] bg-[#F5F906]/10 text-[#F5F906]"
                              : "border-white/10 bg-white/[0.02] text-white/55 hover:border-white/25 hover:text-white"
                          }`}
                        >
                          <Icon className="h-3.5 w-3.5" />
                        </button>
                      ))}
                      </div>
                    </div>
                  {/* Legacy compact selector kept hidden for saved drafts. */}
                  <div className="hidden">
                    {([
                      ["filled", "SÃ³lido"],
                      ["outline-thin", "Contorno"],
                      ["translucent", "Suave"],
                    ] as const).map(([styleKey, styleTitle]) => (
                      <button
                        key={styleKey}
                        type="button"
                        onClick={() => patchActive({ labelStyle: styleKey })}
                        className={`rounded-full border px-2.5 py-1 text-[9px] font-bold leading-tight transition-all ${
                          (activeSlide.labelStyle || "filled") === styleKey
                            ? "border-[#F5F906] bg-[#F5F906]/15 text-[#F5F906] shadow-[0_0_10px_rgba(245,249,6,0.2)]"
                            : "border-white/10 text-white/55 hover:border-white/25 hover:text-white"
                        }`}
                      >
                        {styleTitle}
                      </button>
                    ))}
                  </div>
                  <div className="grid grid-cols-2 gap-3 border-t border-white/[0.06] pt-3">
                    <div>
                      <p className="mb-2 text-[8px] font-bold uppercase tracking-[0.12em] text-white/30">
                        {isEs ? "Fondo del sello" : "Fundo do selo"}
                      </p>
                      <div className="flex items-center gap-1.5">
                        {[state.primaryColor, state.secondaryColor, "#FFFFFF", "#111318"].map((color, colorIndex) => (
                          <button
                            key={`label-bg-${color}-${colorIndex}`}
                            type="button"
                            aria-label={`${isEs ? "Fondo" : "Fundo"} ${color}`}
                            onClick={() => patchActive({ labelColor: color })}
                            className={`h-5 w-5 rounded-full border-2 transition-transform hover:scale-110 ${
                              (activeSlide.labelColor || state.secondaryColor).toUpperCase() === color.toUpperCase()
                                ? "border-[#F5F906] ring-1 ring-[#F5F906]"
                                : "border-white/25"
                            }`}
                            style={{ backgroundColor: color }}
                          />
                        ))}
                        <label
                          title={isEs ? "Elegir otro color" : "Escolher outra cor"}
                          className="relative h-5 w-5 cursor-pointer rounded-full border border-white/25"
                          style={{
                            background:
                              "conic-gradient(#ef4444, #f59e0b, #eab308, #22c55e, #06b6d4, #3b82f6, #a855f7, #ef4444)",
                          }}
                        >
                          <input
                            type="color"
                            value={activeSlide.labelColor || state.secondaryColor}
                            onChange={(event) => patchActive({ labelColor: event.target.value })}
                            className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                          />
                        </label>
                      </div>
                    </div>
                    <div>
                      <p className="mb-2 text-[8px] font-bold uppercase tracking-[0.12em] text-white/30">
                        {isEs ? "Texto del sello" : "Texto do selo"}
                      </p>
                      <div className="flex items-center gap-1.5">
                        {["#FFFFFF", "#111318", state.primaryColor, state.secondaryColor].map((color, colorIndex) => (
                          <button
                            key={`label-text-${color}-${colorIndex}`}
                            type="button"
                            aria-label={`${isEs ? "Texto" : "Texto"} ${color}`}
                            onClick={() => patchActive({ labelTextColor: color })}
                            className={`h-5 w-5 rounded-full border-2 transition-transform hover:scale-110 ${
                              (activeSlide.labelTextColor || readableText(activeSlide.labelColor || state.secondaryColor)).toUpperCase() === color.toUpperCase()
                                ? "border-[#F5F906] ring-1 ring-[#F5F906]"
                                : "border-white/25"
                            }`}
                            style={{ backgroundColor: color }}
                          />
                        ))}
                        <label
                          title={isEs ? "Elegir otro color" : "Escolher outra cor"}
                          className="relative h-5 w-5 cursor-pointer rounded-full border border-white/25"
                          style={{
                            background:
                              "conic-gradient(#ef4444, #f59e0b, #eab308, #22c55e, #06b6d4, #3b82f6, #a855f7, #ef4444)",
                          }}
                        >
                          <input
                            type="color"
                            value={activeSlide.labelTextColor || readableText(activeSlide.labelColor || state.secondaryColor)}
                            onChange={(event) => patchActive({ labelTextColor: event.target.value })}
                            className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                          />
                        </label>
                      </div>
                    </div>
                  </div>
                  </details>
                </div>

                {activeSlide.kind !== "closing" ? (
                  <>
                    {/* â”€â”€ SECTION 3: TÃ­tulo â”€â”€ */}
                    <div className="px-4 py-3.5 space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-[9px] font-extrabold uppercase tracking-[0.18em] text-white/30">
                      {isEs ? "TÃ­tulo" : "TÃ­tulo"}
                    </p>
                    <MiniTypographyBar
                      style={activeSlide.titleStyle}
                      fallbackBold={activeSlide.fontWeight !== "normal"}
                      fallbackColor={activeFieldFallback}
                      primaryColor={state.primaryColor}
                      secondaryColor={state.secondaryColor}
                      onChange={(updated) => patchActive({ titleStyle: updated })}
                      isEs={isEs}
                      compact
                    />
                  </div>
                  <textarea
                    value={activeSlide.title}
                    maxLength={80}
                    rows={3}
                    placeholder={isEs ? "Ex: Descubra este destino" : "Ex: Porto de Galinhas"}
                    onChange={(event) => patchActive({ title: event.target.value })}
                    className="f1-carousel-input !py-2.5 text-sm resize-none w-full leading-snug"
                  />
                  {activeSlide.kind === "cover" && selectedPackage && (
                    <div className="space-y-1.5">
                      <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-white/30">
                        {isEs ? "TÃ­tulos sugeridos" : "TÃ­tulos sugeridos"}
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {coverTitleSuggestions(selectedPackage, isEs).map((suggestion) => (
                          <button
                            key={suggestion}
                            type="button"
                            onClick={() => patchActive({ title: suggestion })}
                            className={`rounded-full border px-2.5 py-1.5 text-left text-[9px] font-semibold leading-tight transition-colors ${
                              activeSlide.title === suggestion
                                ? "border-[#F5F906] bg-[#F5F906]/15 text-[#F5F906]"
                                : "border-white/10 bg-white/[0.03] text-white/55 hover:border-[#F5F906]/35 hover:text-white"
                            }`}
                          >
                            {suggestion}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* â”€â”€ SECTION 4: DescriÃ§Ã£o Curta â”€â”€ */}
                <div className="px-4 pb-3.5 space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-[9px] font-extrabold uppercase tracking-[0.18em] text-white/30">
                      {isEs ? "DescripciÃ³n" : "DescriÃ§Ã£o"}
                    </p>
                    <div className="flex items-center gap-1.5">
                      <MiniTypographyBar
                        style={activeSlide.bodyStyle}
                        fallbackBold={activeSlide.fontWeight === "bold"}
                        fallbackColor={activeFieldFallback}
                        primaryColor={state.primaryColor}
                        secondaryColor={state.secondaryColor}
                        onChange={(updated) => patchActive({ bodyStyle: updated })}
                        isEs={isEs}
                        compact
                      />
                      {activeSlide.body && (
                        <button
                          type="button"
                          onClick={(e) => { e.preventDefault(); patchActive({ body: "" }); }}
                          className="grid h-4 w-4 place-items-center rounded-full text-white/30 hover:bg-white/10 hover:text-white transition-all"
                          title="Remover"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      )}
                    </div>
                  </div>
                  <textarea
                    value={activeSlide.body}
                    maxLength={260}
                    rows={3}
                    placeholder={isEs ? "Ex: Incluye..." : "Ex: Inclui transfer, guia..."}
                    onChange={(event) => patchActive({ body: event.target.value })}
                    className="f1-carousel-input !py-2.5 text-sm resize-none w-full leading-snug"
                  />
                </div>

                {/* â”€â”€ SECTION 5: DescriÃ§Ã£o Inferior (bullets) â”€â”€ */}
                <div className="px-4 pb-3.5 space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-[9px] font-extrabold uppercase tracking-[0.18em] text-white/30">
                      {isEs ? "InformaciÃ³n complementaria (opcional)" : "InformaÃ§Ãµes complementares (opcional)"}
                    </p>
                    <div className="flex items-center gap-1.5">
                      <MiniTypographyBar
                        style={activeSlide.bulletStyle}
                        fallbackBold={activeSlide.fontWeight === "bold"}
                        fallbackColor={activeFieldFallback}
                        primaryColor={state.primaryColor}
                        secondaryColor={state.secondaryColor}
                        onChange={(updated) => patchActive({ bulletStyle: updated })}
                        isEs={isEs}
                        compact
                      />
                      {activeSlide.bullets.length > 0 && (
                        <button
                          type="button"
                          onClick={(e) => { e.preventDefault(); patchActive({ bullets: [] }); }}
                          className="grid h-4 w-4 place-items-center rounded-full text-white/30 hover:bg-white/10 hover:text-white transition-all"
                          title="Remover"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      )}
                    </div>
                  </div>
                  <textarea
                    value={activeSlide.bullets.join("\n")}
                    rows={3}
                    placeholder={isEs
                      ? "Transporte incluido\nGuÃ­a local\nSeguro de viaje"
                      : "Transporte incluso\nGuia local\nSeguro viagem"}
                    onChange={(event) =>
                      patchActive({
                        bullets: event.target.value
                          .split(/\r?\n/)
                          .map((item) => cleanCarouselText(item).slice(0, 100))
                          .slice(0, 4),
                      })
                    }
                    className="f1-carousel-input !min-h-[76px] !py-2.5 text-sm resize-none w-full leading-snug"
                  />
                  <p className="text-[9px] text-white/25">{isEs ? "Una lÃ­nea por informaciÃ³n. MÃ¡ximo 4." : "Uma linha por informaÃ§Ã£o. MÃ¡ximo 4."}</p>
                </div>
              </>
                ) : (
                  /* â”€â”€ Closing slide fields â”€â”€ */
                  <div className="divide-y divide-white/[0.06]">
                    <div className="px-4 py-3.5 space-y-2">
                      <p className="text-[9px] font-extrabold uppercase tracking-[0.18em] text-white/30">
                        {isEs ? "Llamada a la acciÃ³n" : "Chamada para AÃ§Ã£o"}
                      </p>
                      <input
                        value={activeSlide.cta}
                        maxLength={62}
                        onChange={(event) => patchActive({ cta: event.target.value })}
                        className="f1-carousel-input !min-h-[40px] !py-2"
                        placeholder="RESERVE SUA VAGA"
                      />
                      <div className="flex flex-wrap gap-1.5">
                        {["RESERVE SUA VAGA", "FALE CONOSCO", "SAIBA MAIS", "GARANTA SEU LUGAR"].map(suggestion => (
                          <button
                            key={suggestion}
                            type="button"
                            onClick={() => patchActive({ cta: suggestion })}
                            className="rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1 text-[9px] font-bold text-white/55 hover:border-[#F5F906]/40 hover:bg-[#F5F906]/[0.08] hover:text-[#F5F906] transition-all"
                          >
                            + {suggestion}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="px-4 py-3.5 space-y-3">
                      <div>
                        <p className="mb-2 text-[9.5px] font-bold uppercase tracking-[0.12em] text-white/35">
                          {isEs ? "Canales visibles en el cierre" : "Canais visÃ­veis no fechamento"}
                        </p>
                        <div className="grid grid-cols-3 gap-2">
                          {([
                            ["whatsapp", "/assets/whatsapp-icon.png", "WhatsApp"],
                            ["instagram", Instagram, "Instagram"],
                            ["email", Mail, isEs ? "Correo" : "E-mail"],
                          ] as const).map(([channel, icon, label]) => {
                            const selected = activeClosingChannels.includes(channel);
                            return (
                              <button
                                key={channel}
                                type="button"
                                aria-pressed={selected}
                                onClick={() => toggleClosingChannel(channel)}
                                className={`flex min-h-10 items-center justify-center gap-2 rounded-lg border px-2 text-[10px] font-extrabold transition-colors ${
                                  selected
                                    ? "border-[#F5F906]/60 bg-[#F5F906]/10 text-[#F5F906]"
                                    : "border-white/10 bg-white/[0.02] text-white/45 hover:bg-white/[0.05] hover:text-white/70"
                                }`}
                              >
                                {typeof icon === "string" ? (
                                  <img src={icon} alt="" className="h-4 w-4 object-contain" />
                                ) : (
                                  (() => {
                                    const Icon = icon;
                                    return <Icon className="h-4 w-4" aria-hidden="true" />;
                                  })()
                                )}
                                <span>{label}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        {activeClosingChannels.includes("whatsapp") && (
                          <div className="space-y-1.5">
                            <label className="text-[9.5px] font-bold uppercase tracking-[0.12em] text-white/35 block">
                              {isEs ? "WhatsApp / TelÃ©fono" : "WhatsApp / Telefone"}
                            </label>
                            <input
                              value={activeSlide.phone || ""}
                              maxLength={32}
                              onChange={(event) => patchActive({ phone: event.target.value })}
                              className="f1-carousel-input !min-h-[40px] !py-2 !text-[13px]"
                              placeholder="(00) 00000-0000"
                            />
                          </div>
                        )}
                        {activeClosingChannels.includes("instagram") && (
                          <div className="space-y-1.5">
                            <label className="text-[9.5px] font-bold uppercase tracking-[0.12em] text-white/35 block">
                              Instagram
                            </label>
                            <input
                              value={activeSlide.instagram || ""}
                              maxLength={48}
                              onChange={(event) => patchActive({ instagram: event.target.value })}
                              className="f1-carousel-input !min-h-[40px] !py-2 !text-[13px]"
                              placeholder="@suaagencia"
                            />
                          </div>
                        )}
                        {activeClosingChannels.includes("email") && (
                          <div className="space-y-1.5 sm:col-span-2">
                            <label className="text-[9.5px] font-bold uppercase tracking-[0.12em] text-white/35 block">
                              {isEs ? "Correo" : "E-mail"}
                            </label>
                            <input
                              type="email"
                              value={activeSlide.email || ""}
                              maxLength={80}
                              onChange={(event) => patchActive({ email: event.target.value })}
                              className="f1-carousel-input !min-h-[40px] !py-2 !text-[13px]"
                              placeholder="contato@suaagencia.com"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                    {showLogo && !state.logoBase64 && (
                      <div className="px-4 py-3">
                        <p className="rounded-xl border border-amber-300/20 bg-amber-300/[0.06] px-3 py-2 text-xs text-amber-100/80">
                          {isEs
                            ? "Agrega la logo en el Panel de la FÃ¡brica para completar el cierre."
                            : "Adicione a logo no Painel da FÃ¡brica para completar o fechamento."}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {activeSlide && !activeCoverIsProtected && (
            <div className="mt-4 block lg:hidden">{renderPhotoSelectionBox()}</div>
          )}
          {activeSlide && <div className="mt-4">{renderPublishFooterBox()}</div>}
        </div>

        <aside className="order-1 lg:order-2 lg:sticky lg:top-5 lg:self-start pr-1 space-y-4">
          <div className="rounded-2xl border border-white/10 bg-[#0F0F11] p-3 sm:p-4">
            <div className="mb-3">
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-white/35">
                {isEs ? "Vista previa" : "PrÃ©via"}
              </p>
              <p className="mt-1 text-xs text-white/55">
                {carouselFormat === "story"
                  ? isEs
                    ? "Formato Stories 9:16"
                    : "Formato Stories 9:16"
                  : "Formato Feed 4:5"}
              </p>
            </div>
            
            <div className="relative mx-auto flex w-full max-w-[420px] justify-center overflow-hidden rounded-2xl border border-white/10 bg-zinc-950 shadow-2xl">
              {activeSlide && (
                <div className={`transition ${isCarouselPreviewLocked ? "blur-md" : ""}`}>
                  <ScaledSlidePreview
                    slide={activeSlide}
                    index={activeIndex}
                    total={slides.length}
                    ratio={carouselRatio}
                    logo={renderedLogo}
                    logoPosition={logoPosition}
                    primary={state.primaryColor}
                    secondary={state.secondaryColor}
                    width={400}
                  />
                </div>
              )}
              {activeSlide && isCarouselPreviewLocked && (
                <button
                  type="button"
                  onClick={() => setShowExportPaywall(true)}
                  className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-black/35 px-8 text-center text-white backdrop-blur-[1px]"
                >
                  <span className="grid h-11 w-11 place-items-center rounded-full border border-white/20 bg-black/70">
                    <Lock className="h-5 w-5" />
                  </span>
                  <span className="text-sm font-black">
                    {tier === "guest"
                      ? (isEs ? "Crea tu cuenta para liberar el carrusel" : "Crie sua conta para liberar o carrossel")
                      : (isEs ? "Vista previa lista. Desbloquea la descarga con Elite" : "PrÃ©via pronta. Libere o download no Elite")}
                  </span>
                </button>
              )}
            </div>

            {/* Setas de navegaÃ§Ã£o abaixo do preview */}
            <div className="mt-4 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setActiveIndex((current) => Math.max(0, current - 1))}
                disabled={activeIndex === 0}
                aria-label={isEs ? "Imagen anterior" : "Imagem anterior"}
                className="flex min-h-10 min-w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] text-white/70 hover:bg-white/[0.08] hover:text-white transition-all disabled:pointer-events-none disabled:opacity-25"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="text-xs font-bold text-white/50 w-24 text-center">
                {activeIndex + 1} / {slides.length}
              </span>
              <button
                type="button"
                onClick={() => setActiveIndex((current) => Math.min(slides.length - 1, current + 1))}
                disabled={activeIndex === slides.length - 1}
                aria-label={isEs ? "Siguiente imagen" : "PrÃ³xima imagem"}
                className="flex min-h-10 min-w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] text-white/70 hover:bg-white/[0.08] hover:text-white transition-all disabled:pointer-events-none disabled:opacity-25"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            <p className="mt-4 text-center text-[10px] leading-relaxed text-white/35">
              {activeSlide?.kind === "cover"
                ? activeCoverIsProtected
                  ? (isEs ? "Portada original del anuncio." : "Capa original do anÃºncio.")
                  : (isEs ? "Los cambios aparecen aquÃ­ al instante." : "As alteraÃ§Ãµes aparecem aqui na hora.")
                : (isEs ? "Los cambios aparecen aquÃ­ al instante." : "As alteraÃ§Ãµes aparecem aqui na hora.")}
            </p>
          </div>

          <div className="hidden lg:block space-y-4">
            {renderPhotoSelectionBox()}
          </div>
        </aside>
      </div>

      {slides.length > 0 && renderActionBar()}

      {showNewCarouselModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl border border-white/15 bg-zinc-950 p-6 shadow-2xl space-y-5">
            <div className="flex items-center gap-3 text-[#F5F906]">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-[#F5F906]/15 text-[#F5F906]">
                <Sparkles className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-black text-white">
                {isEs ? "Â¿Ya descargaste las imÃ¡genes de este carrusel?" : "JÃ¡ baixou as imagens desse carrossel?"}
              </h3>
            </div>
            <p className="text-xs leading-relaxed text-white/70">
              {isEs
                ? "Se crearÃ¡ una nueva composiciÃ³n para el mismo destino. Puedes descargar la versiÃ³n actual antes de continuar."
                : "SerÃ¡ criada uma nova composiÃ§Ã£o para o mesmo destino. VocÃª pode baixar a versÃ£o atual antes de continuar."}
            </p>
            <div className="flex flex-col gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowNewCarouselModal(false);
                  downloadAll();
                }}
                className="w-full min-h-11 rounded-xl bg-[#F5F906] font-extrabold text-zinc-950 hover:bg-[#F5F906]/90 transition-colors flex items-center justify-center gap-2"
              >
                <Download className="h-4 w-4" />
                {isEs ? "Descargar imÃ¡genes del carrusel" : "Baixar Imagens do Carrossel"}
              </button>
              <button
                type="button"
                onClick={discardAndCreateNew}
                className="w-full min-h-11 rounded-xl border border-white/15 bg-white/[0.05] font-extrabold text-white/80 hover:bg-white/[0.09] transition-colors flex items-center justify-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                {isEs ? "Generar otra variaciÃ³n" : "Gerar outra variaÃ§Ã£o"}
              </button>
              <button
                type="button"
                onClick={() => setShowNewCarouselModal(false)}
                className="w-full min-h-10 rounded-xl font-bold text-white/50 hover:text-white transition-colors text-xs"
              >
                {isEs ? "Cancelar y volver" : "Cancelar e voltar"}
              </button>
            </div>
          </div>
        </div>
      )}

      <FabricaPaywallDialog
        open={showExportPaywall}
        onOpenChange={setShowExportPaywall}
        feature="carousel_export"
        title={isEs ? "Tu carrusel estÃ¡ listo" : "Seu carrossel estÃ¡ pronto"}
        description={
          isEs
            ? "Tu proyecto sigue guardado. Activa Elite para descargar nuevos carruseles sin lÃ­mite."
            : "Seu projeto continua salvo. Ative o Elite para baixar novos carrossÃ©is sem limite."
        }
      />

      <div
        aria-hidden="true"
        style={{
          position: "fixed",
          left: "-9999px",
          top: "-9999px",
          width: "1px",
          height: "1px",
          pointerEvents: "none",
          overflow: "visible",
          zIndex: -1,
        }}
      >
        {slides.map((slide, index) => (
          <CarouselCanvas
            key={`export-${slide.id}`}
            slide={slide}
            index={index}
            total={slides.length}
            ratio={carouselRatio}
            logo={renderedLogo}
            logoPosition={logoPosition}
            primary={state.primaryColor}
            secondary={state.secondaryColor}
            canvasRef={(node) => {
              exportRefs.current[index] = node;
            }}
            exportMode
          />
        ))}
      </div>

      {/* Maximize Image Modal */}
      {maximizedSlide && (
        <div
          className="fixed inset-0 z-[999] flex items-center justify-center bg-black/90 p-8 backdrop-blur-md"
          onClick={() => setMaximizedSlide(null)}
        >
          <div
            className="relative max-h-full max-w-full overflow-hidden rounded-2xl shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setMaximizedSlide(null)}
              className="absolute right-4 top-4 z-10 grid h-10 w-10 place-items-center rounded-full bg-black/50 text-white backdrop-blur-md transition-colors hover:bg-black/80"
              title={isEs ? "Cerrar" : "Fechar"}
            >
              <X className="h-5 w-5" />
            </button>
            <ScaledSlidePreview
              slide={maximizedSlide}
              index={slides.findIndex((s) => s.id === maximizedSlide.id)}
              total={slides.length}
              ratio={carouselRatio}
              logo={renderedLogo}
              logoPosition={logoPosition}
              primary={state.primaryColor}
              secondary={state.secondaryColor}
              width={carouselFormat === "feed" ? Math.min(window.innerWidth - 64, window.innerHeight - 64, 800) : Math.min(window.innerWidth - 64, (window.innerHeight - 64) * carouselRatio, 500)}
            />
          </div>
        </div>
      )}

      <style>{`
        .f1-carousel-input {
          min-height: 44px;
          width: 100%;
          border: 1px solid rgba(255,255,255,.1);
          border-radius: 12px;
          background: rgba(255,255,255,.035);
          padding: 10px 12px;
          color: rgba(255,255,255,.9);
          font-size: 14px;
          outline: none;
        }
        .f1-carousel-input:focus {
          border-color: #F5F906;
          box-shadow: 0 0 0 2px rgba(245,249,6,.12);
        }
        .f1-carousel-scroll {
          scrollbar-width: thin;
          scrollbar-color: rgba(255,255,255,.2) transparent;
        }
      `}</style>
    </section>
  );
}
