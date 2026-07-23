import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type CSSProperties,
  type ReactNode,
} from "react";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Download,
  ImagePlus,
  LayoutGrid,
  Lock,
  Maximize2,
  RefreshCw,
  Rows,
  Search,
  Sparkles,
  Upload,
  X,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { toast } from "sonner";
import { useFabricaContext, type Pacote } from "@/hooks/useFabricaContext";
import { composeTravelAd } from "@/lib/fabrica-compose-art";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

type CarouselSize = 3 | 4 | 5 | 6;
type CarouselSlideKind = "cover" | "content" | "closing";
type CarouselSlideVariant = "impact" | "itinerary" | "editorial";
type LabelStyle = "filled" | "outline-thin" | "outline-thick" | "stripe-left" | "rectangle" | "translucent" | "gradient";

const FONT_PRESETS = [
  "Inter",
  "Poppins",
  "Montserrat",
  "Roboto",
  "Oswald",
  "Bebas Neue",
  "Playfair Display",
  "Lora",
  "Raleway",
  "Nunito",
  "Work Sans",
  "DM Sans",
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
  labelColor?: string;
  fontFamily?: string;
  fontWeight?: "normal" | "bold";
  fontStyle?: "normal" | "italic";
  textDecoration?: "none" | "underline";
  instagram?: string;
  website?: string;
  titleStyle?: FieldTypography;
  bodyStyle?: FieldTypography;
  bulletStyle?: FieldTypography;
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
}

const DEFAULT_COVER_RATIO = 4 / 5;

const createId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `slide_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

const compact = (values: Array<string | undefined>) =>
  values.map((value) => (value || "").trim()).filter(Boolean);

const uniqueImages = (values: Array<string | undefined>) =>
  Array.from(new Set(values.map((value) => (value || "").trim()).filter(Boolean)));

const readableText = (hex: string) => {
  const normalized = hex.replace("#", "");
  if (!/^[0-9a-f]{6}$/i.test(normalized)) return "#F8FAFC";
  const [red, green, blue] = [0, 2, 4].map((index) =>
    Number.parseInt(normalized.slice(index, index + 2), 16),
  );
  return (red * 299 + green * 587 + blue * 114) / 1000 > 150 ? "#111318" : "#F8FAFC";
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

function contentPresets(pacote: Pacote, isEs: boolean) {
  const highlights = compact(pacote.highlights || []);
  const included = compact(pacote.included || []);
  const itinerary = compact(pacote.itinerary || []);
  const planning = compact([
    pacote.travelDates && `${isEs ? "Fechas" : "Datas"}: ${pacote.travelDates}`,
    pacote.duration && `${isEs ? "Duración" : "Duração"}: ${pacote.duration}`,
    pacote.departureLocation && `${isEs ? "Salida" : "Saída"}: ${pacote.departureLocation}`,
    pacote.accommodation && `${isEs ? "Alojamiento" : "Hospedagem"}: ${pacote.accommodation}`,
    pacote.price && `${isEs ? "Valor" : "Valor"}: ${pacote.price}`,
    pacote.paymentTerms && `${isEs ? "Pago" : "Pagamento"}: ${pacote.paymentTerms}`,
  ]);

  const stripStars = (s: string) =>
    s
      .replace(/⭐|✨|\b⭐\b/gu, "")
      .replace(/^[-\*\s•]+/, "")
      .trim();

  const cleanBody = (s: string | undefined, maxLen = 140) => {
    if (!s) return "";
    const cleaned = stripStars(s);
    if (cleaned.length <= maxLen) return cleaned;
    return cleaned.slice(0, maxLen).replace(/\s+\S*$/, "") + "...";
  };

  const cleanHighlights = highlights.map(stripStars).filter(Boolean);
  const cleanIncluded = included.map(stripStars).filter(Boolean);
  const cleanPlanning = planning.map(stripStars).filter(Boolean);
  const cleanItinerary = itinerary.map(stripStars).filter(Boolean);

  return [
    {
      label: isEs ? "La experiencia" : "A experiência",
      title: stripStars(pacote.subtitle || pacote.title || ""),
      body: cleanBody(pacote.longDescription || pacote.description, 160),
      bullets: cleanHighlights.slice(0, 8),
    },
    {
      label: isEs ? "Incluido" : "O que inclui",
      title: isEs ? "Todo lo que forma parte de tu viaje" : "Tudo que faz parte da sua viagem",
      body: cleanIncluded.length ? "" : cleanBody(pacote.description, 120),
      bullets: (cleanIncluded.length ? cleanIncluded : cleanHighlights).slice(0, 8),
    },
    {
      label: isEs ? "Planifica" : "Planeje",
      title: isEs ? "Información para organizarte" : "Informações para se organizar",
      body: cleanBody(pacote.importantNotes, 110),
      bullets: (cleanPlanning.length ? cleanPlanning : cleanItinerary).slice(0, 4),
    },
    {
      label: isEs ? "Condiciones" : "Condições especiais",
      title: isEs ? "Reserva tu cupo con beneficios" : "Garanta sua vaga com facilidades",
      body: isEs ? "Oportunidad exclusiva para nuestros viajeros:" : "Oportunidade imperdível para nossos viajantes:",
      bullets: compact([
        isEs ? "Atención personalizada por WhatsApp" : "Atendimento exclusivo no WhatsApp",
        isEs ? "Opciones de pago flexibles" : "Opções flexíveis de parcelamento",
        isEs ? "Soporte durante todo el viaje" : "Suporte completo durante toda a viagem",
      ]),
    },
  ];
}

function createSlides(
  pacote: Pacote,
  total: CarouselSize,
  coverImage: string,
  phone: string,
  isEs: boolean,
  extraImages: string[] = [],
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
  const presets = contentPresets(pacote, isEs);
  const contentCount = total - 2;
  const selectedPresets =
    contentCount === 1
      ? [
          {
            ...presets[0],
            bullets: compact([...(pacote.included || []), ...(pacote.highlights || [])]).slice(0, 8),
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
      label: "",
      title: pacote.title,
      body: "",
      bullets: [],
      imageUrl: coverImage,
      textColor: "#FFFFFF",
      cta: "",
      phone: "",
      slideVariant: "impact",
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
      slideVariant: "impact",
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
    title: "",
    body: "",
    bullets: [],
    imageUrl: getImg(selectedPresets.length),
    textColor: "#FFFFFF",
    cta: pacote.ctaLabel || (isEs ? "Reserva tu viaje por WhatsApp" : "Reserve sua viagem pelo WhatsApp"),
    phone,
    slideVariant: "impact",
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

function mergeSlidesForSize(
  current: CarouselSlide[],
  generated: CarouselSlide[],
): CarouselSlide[] {
  const currentContent = current.filter((slide) => slide.kind === "content");
  const currentClosing = current.find((slide) => slide.kind === "closing");

  return generated.map((slide, index) => {
    if (slide.kind === "cover") return slide;
    if (slide.kind === "closing" && currentClosing) {
      const merged = { ...slide, ...currentClosing, id: currentClosing.id };
      return { ...merged, imageUrl: merged.imageUrl || slide.imageUrl };
    }
    const contentIndex = generated.slice(0, index).filter((item) => item.kind === "content").length;
    const existing = currentContent[contentIndex];
    if (!existing) return slide;
    const merged = { ...slide, ...existing, id: existing.id };
    return { ...merged, imageUrl: merged.imageUrl || slide.imageUrl };
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
  logo,
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

  if (slide.kind === "cover") {
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
          <img
            src={slide.imageUrl}
            alt=""
            crossOrigin={
              slide.imageUrl.startsWith("data:") || slide.imageUrl.startsWith("blob:")
                ? undefined
                : "anonymous"
            }
            style={{ width: "100%", height: "100%", display: "block", objectFit: "cover" }}
          />
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
            Gere a arte de capa na aba Anúncio
          </div>
        )}
      </div>
    );
  }

  const isClosing = slide.kind === "closing";
  const onSecondary = readableText(secondary);
  const ff = slide.fontFamily || "Inter, ui-sans-serif, system-ui, sans-serif";
  
  const titleBold = slide.titleStyle?.bold !== undefined ? slide.titleStyle.bold : (slide.fontWeight === "normal" ? false : true);
  const titleWeight = titleBold ? 950 : 600;
  const titleStyleAttr = (slide.titleStyle?.italic !== undefined ? slide.titleStyle.italic : slide.fontStyle === "italic") ? "italic" : "normal";
  const titleDecAttr = (slide.titleStyle?.underline !== undefined ? slide.titleStyle.underline : slide.textDecoration === "underline") ? "underline" : "none";
  const titleColor = slide.titleStyle?.color || slide.textColor;

  const bodyBold = slide.bodyStyle?.bold !== undefined ? slide.bodyStyle.bold : (slide.fontWeight === "bold" ? true : false);
  const bodyWeight = bodyBold ? 750 : 450;
  const bodyStyleAttr = (slide.bodyStyle?.italic !== undefined ? slide.bodyStyle.italic : slide.fontStyle === "italic") ? "italic" : "normal";
  const bodyDecAttr = (slide.bodyStyle?.underline !== undefined ? slide.bodyStyle.underline : slide.textDecoration === "underline") ? "underline" : "none";
  const bodyColor = slide.bodyStyle?.color || slide.textColor;

  const bulletBold = slide.bulletStyle?.bold !== undefined ? slide.bulletStyle.bold : (slide.fontWeight === "bold" ? true : false);
  const bulletWeight = bulletBold ? 700 : 450;
  const bulletStyleAttr = (slide.bulletStyle?.italic !== undefined ? slide.bulletStyle.italic : slide.fontStyle === "italic") ? "italic" : "normal";
  const bulletDecAttr = (slide.bulletStyle?.underline !== undefined ? slide.bulletStyle.underline : slide.textDecoration === "underline") ? "underline" : "none";
  const bulletColor = slide.bulletStyle?.color || slide.textColor;

  const textShadow = slide.showShadow === false ? "none" : `0px ${Math.round(3 * Z)}px ${Math.round(18 * Z)}px rgba(0, 0, 0, 0.75)`;
  const bodyShadow = slide.showShadow === false ? "none" : `0px ${Math.round(2 * Z)}px ${Math.round(12 * Z)}px rgba(0, 0, 0, 0.82)`;
  const bulletShadow = slide.showShadow === false ? "none" : `0px ${Math.round(2 * Z)}px ${Math.round(10 * Z)}px rgba(0, 0, 0, 0.88)`;

  const renderLabel = (label: string) => {
    if (!label) return null;
    const rawBg = slide.labelColor || secondary;
    const bg = rawBg.toUpperCase() === "#F5F906" ? "#F5F906" : rawBg;
    const fg = readableText(bg);

    const style = slide.labelStyle || "filled";
    const commonStyle: CSSProperties = {
      display: "inline-flex",
      maxWidth: "100%",
      marginBottom: Math.round(13 * Z),
      padding: `${Math.round(7 * Z)}px ${Math.round(12 * Z)}px`,
      fontSize: Math.round(10 * Z),
      lineHeight: 1.15,
      fontWeight: 900,
      letterSpacing: ".12em",
      textTransform: "uppercase",
      boxSizing: "border-box",
    };

    if (style === "outline-thin") {
      return (
        <div style={{ ...commonStyle, borderRadius: Math.round(999 * Z), border: `${Math.round(1 * Z)}px solid ${bg}`, background: "rgba(0, 0, 0, 0.45)", color: "#F8FAFC", padding: `${Math.round(6 * Z)}px ${Math.round(12 * Z)}px`, fontWeight: 800 }}>
          {label}
        </div>
      );
    }
    if (style === "outline-thick") {
      return (
        <div style={{ ...commonStyle, borderRadius: Math.round(999 * Z), border: `${Math.round(2.5 * Z)}px solid ${bg}`, background: "rgba(0, 0, 0, 0.60)", color: "#F8FAFC", padding: `${Math.round(6 * Z)}px ${Math.round(12 * Z)}px` }}>
          {label}
        </div>
      );
    }
    if (style === "stripe-left") {
      return (
        <div style={{ ...commonStyle, borderLeft: `${Math.round(4 * Z)}px solid ${bg}`, background: "rgba(0, 0, 0, 0.55)", color: "#F8FAFC", padding: `${Math.round(6 * Z)}px ${Math.round(12 * Z)}px`, fontWeight: 800 }}>
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
      return (
        <div style={{ ...commonStyle, borderRadius: Math.round(999 * Z), background: `linear-gradient(90deg, ${bg} 0%, rgba(255, 255, 255, 0.80) 100%)`, color: fg, boxShadow: slide.showShadow === false ? "none" : `0px ${Math.round(4 * Z)}px ${Math.round(14 * Z)}px rgba(0, 0, 0, 0.35)` }}>
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
      {/* ── Background Photo & Gradient Overlay (zIndex: 0) ── */}
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

      {/* ── Content & Text Boxes (zIndex: 10) ── */}
      <div style={{ position: "relative", zIndex: 10, width: "100%", height: "100%" }}>
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
              {logo ? (
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
              ) : (
                <div
                  style={{
                    color: "#111318",
                    fontSize: Math.round(14 * Z),
                    fontWeight: 800,
                    letterSpacing: ".06em",
                    textTransform: "uppercase",
                  }}
                >
                  Sua logo
                </div>
              )}
            </div>

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
              {slide.body || "Atendimento humanizado, parcelamento facilitado e suporte do início ao fim do seu roteiro."}
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
          /* ── CONTENT SLIDES — 3 visual variants ── */
          <>
            {/* ─── VARIANT: IMPACT (default) — full-bleed photo, content at bottom ─── */}
            {(slide.slideVariant === "impact" || !slide.slideVariant) && (
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  padding: "8%",
                  boxSizing: "border-box",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: Math.round(12 * Z) }}>
                  {logo ? (
                    <img
                      src={logo}
                      alt=""
                      crossOrigin={logo.startsWith("data:") || logo.startsWith("blob:") ? undefined : "anonymous"}
                      style={{ width: Math.round(42 * Z), height: Math.round(42 * Z), borderRadius: Math.round(12 * Z), objectFit: "contain", background: "rgba(255, 255, 255, 0.94)", padding: Math.round(5 * Z), boxShadow: `0px ${Math.round(8 * Z)}px ${Math.round(24 * Z)}px rgba(0, 0, 0, 0.24)` }}
                    />
                  ) : <span />}
                </div>
                <div>
                  {renderLabel(slide.label)}
                  {slide.title && (
                    <h3 style={{ maxWidth: "96%", margin: 0, color: titleColor, fontSize: Math.round((ratio < 0.68 ? 31 : 35) * Z), lineHeight: 1.02, fontFamily: ff, fontWeight: titleWeight, fontStyle: titleStyleAttr, textDecoration: titleDecAttr, overflowWrap: "anywhere", wordBreak: "break-word", textShadow }}>
                      {slide.title}
                    </h3>
                  )}
                  {slide.body && (
                    <p style={{ maxWidth: "94%", margin: `${Math.round(13 * Z)}px 0 0`, color: bodyColor, fontSize: Math.round((ratio < 0.68 ? 13 : 14) * Z), lineHeight: 1.45, fontFamily: ff, fontWeight: bodyWeight, fontStyle: bodyStyleAttr, textDecoration: bodyDecAttr, opacity: 0.94, overflowWrap: "anywhere", wordBreak: "break-word", whiteSpace: "pre-wrap", textShadow: bodyShadow }}>
                      {slide.body}
                    </p>
                  )}
                  {slide.bullets.length > 0 && (
                    <ul style={{ display: "grid", gap: Math.round(7 * Z), maxWidth: "96%", margin: `${Math.round(15 * Z)}px 0 0`, padding: 0, listStyle: "none" }}>
                      {slide.bullets.slice(0, 8).map((item, bulletIndex) => {
                        if (!item.trim()) return <li key={`${slide.id}-b-${bulletIndex}`} style={{ height: Math.round(10 * Z) }} />;
                        return (
                          <li key={`${slide.id}-b-${bulletIndex}`} style={{ display: "flex", gap: Math.round(8 * Z), alignItems: "flex-start", color: bulletColor, fontSize: Math.round(13 * Z), lineHeight: 1.35, fontFamily: ff, fontWeight: bulletWeight, fontStyle: bulletStyleAttr, textDecoration: bulletDecAttr, overflowWrap: "anywhere", wordBreak: "break-word", textShadow: bulletShadow }}>
                            <span>{item}</span>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
              </div>
            )}

            {/* ─── VARIANT: ITINERARY — photo top ~45%, colored block bottom ─── */}
            {slide.slideVariant === "itinerary" && (() => {
              const onPrimary = readableText(primary);
              const isBgDark = onPrimary === "#F8FAFC";
              const isTextDark = readableText(slide.textColor) === "#F8FAFC";
              const boxTextColor = isBgDark && isTextDark ? onPrimary : slide.textColor;
              const boxTitleColor = slide.titleStyle?.color || boxTextColor;
              const boxBodyColor = slide.bodyStyle?.color || boxTextColor;
              const boxBulletColor = slide.bulletStyle?.color || boxTextColor;
              return (
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    display: "flex",
                    flexDirection: "column",
                    boxSizing: "border-box",
                  }}
                >
                  <div style={{ position: "relative", height: "45%", width: "100%", flexShrink: 0, overflow: "hidden" }}>
                    {logo && (
                      <img
                        src={logo}
                        alt=""
                        crossOrigin={logo.startsWith("data:") || logo.startsWith("blob:") ? undefined : "anonymous"}
                        style={{ position: "absolute", top: "12%", left: "7%", width: Math.round(36 * Z), height: Math.round(36 * Z), borderRadius: Math.round(10 * Z), objectFit: "contain", background: "rgba(255, 255, 255, 0.94)", padding: Math.round(4 * Z), zIndex: 5, boxShadow: `0px ${Math.round(4 * Z)}px ${Math.round(16 * Z)}px rgba(0, 0, 0, 0.22)` }}
                      />
                    )}
                  </div>
                  <div
                    style={{
                      flex: 1,
                      background: primary,
                      color: boxTextColor,
                      padding: "7% 8% 8%",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                      boxSizing: "border-box",
                      borderTop: `${Math.round(3 * Z)}px solid ${secondary}`,
                    }}
                  >
                    <div>
                      {renderLabel(slide.label)}
                      {slide.title && (
                        <h3 style={{ margin: 0, color: boxTitleColor, fontSize: Math.round((ratio < 0.68 ? 26 : 30) * Z), lineHeight: 1.05, fontFamily: ff, fontWeight: titleWeight, fontStyle: titleStyleAttr, textDecoration: titleDecAttr, overflowWrap: "anywhere", wordBreak: "break-word", textShadow: "none" }}>
                          {slide.title}
                        </h3>
                      )}
                      {slide.body && (
                        <p style={{ margin: `${Math.round(10 * Z)}px 0 0`, color: boxBodyColor, fontSize: Math.round(13 * Z), lineHeight: 1.42, fontFamily: ff, fontWeight: bodyWeight, fontStyle: bodyStyleAttr, textDecoration: bodyDecAttr, opacity: 0.9, overflowWrap: "anywhere", wordBreak: "break-word", whiteSpace: "pre-wrap", textShadow: "none" }}>
                          {slide.body}
                        </p>
                      )}
                    </div>
                    {slide.bullets.length > 0 && (
                      <ul style={{ display: "grid", gap: Math.round(6 * Z), padding: 0, margin: `${Math.round(12 * Z)}px 0 0`, listStyle: "none" }}>
                        {slide.bullets.slice(0, 8).map((item, bulletIndex) => {
                          if (!item.trim()) return <li key={`${slide.id}-b-${bulletIndex}`} style={{ height: Math.round(8 * Z) }} />;
                          return (
                            <li key={`${slide.id}-b-${bulletIndex}`} style={{ display: "flex", gap: Math.round(7 * Z), alignItems: "flex-start", color: boxBulletColor, fontSize: Math.round(12 * Z), lineHeight: 1.3, fontFamily: ff, fontWeight: bulletWeight, fontStyle: bulletStyleAttr, textDecoration: bulletDecAttr, overflowWrap: "anywhere", wordBreak: "break-word", textShadow: "none" }}>
                              <span>{item}</span>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </div>
                </div>
              );
            })()}

            {/* ─── VARIANT: EDITORIAL — photo full background, floating glass card at bottom ─── */}
            {slide.slideVariant === "editorial" && (() => {
              const boxTextColor = readableText(primary);
              const boxTitleColor = slide.titleStyle?.color || boxTextColor;
              const boxBodyColor = slide.bodyStyle?.color || boxTextColor;
              const boxBulletColor = slide.bulletStyle?.color || boxTextColor;
              return (
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    padding: "7%",
                    boxSizing: "border-box",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-start" }}>
                    {logo ? (
                      <img
                        src={logo}
                        alt=""
                        crossOrigin={logo.startsWith("data:") || logo.startsWith("blob:") ? undefined : "anonymous"}
                        style={{ width: Math.round(38 * Z), height: Math.round(38 * Z), borderRadius: Math.round(10 * Z), objectFit: "contain", background: "rgba(255, 255, 255, 0.94)", padding: Math.round(4 * Z), boxShadow: `0px ${Math.round(4 * Z)}px ${Math.round(16 * Z)}px rgba(0, 0, 0, 0.22)` }}
                      />
                    ) : <span />}
                  </div>
                  <div
                    style={{
                      width: "100%",
                      borderRadius: Math.round(18 * Z),
                      background: safeHexToRgba(primary, 0.93),
                      backdropFilter: "blur(8px)",
                      border: `${Math.round(2 * Z)}px solid ${secondary}`,
                      padding: "8% 9%",
                      display: "flex",
                      flexDirection: "column",
                      gap: Math.round(10 * Z),
                      overflow: "hidden",
                      boxSizing: "border-box",
                    }}
                  >
                    {renderLabel(slide.label)}
                    {slide.title && (
                      <h3 style={{ margin: 0, color: boxTitleColor, fontSize: Math.round((ratio < 0.68 ? 24 : 28) * Z), lineHeight: 1.05, fontFamily: ff, fontWeight: titleWeight, fontStyle: titleStyleAttr, textDecoration: titleDecAttr, overflowWrap: "anywhere", wordBreak: "break-word", textShadow: "none" }}>
                        {slide.title}
                      </h3>
                    )}
                    {slide.body && (
                      <p style={{ margin: 0, color: boxBodyColor, fontSize: Math.round(12 * Z), lineHeight: 1.42, fontFamily: ff, fontWeight: bodyWeight, fontStyle: bodyStyleAttr, textDecoration: bodyDecAttr, opacity: 0.88, overflowWrap: "anywhere", wordBreak: "break-word", whiteSpace: "pre-wrap", textShadow: "none" }}>
                        {slide.body}
                      </p>
                    )}
                    {slide.bullets.length > 0 && (
                      <ul style={{ display: "grid", gap: Math.round(7 * Z), padding: 0, margin: 0, listStyle: "none" }}>
                        {slide.bullets.slice(0, 8).map((item, bulletIndex) => {
                          if (!item.trim()) return <li key={`${slide.id}-b-${bulletIndex}`} style={{ height: Math.round(8 * Z) }} />;
                          return (
                            <li key={`${slide.id}-b-${bulletIndex}`} style={{ display: "flex", gap: Math.round(7 * Z), alignItems: "flex-start", color: boxBulletColor, fontSize: Math.round(12 * Z), lineHeight: 1.3, fontFamily: ff, fontWeight: bulletWeight, fontStyle: bulletStyleAttr, textDecoration: bulletDecAttr, overflowWrap: "anywhere", wordBreak: "break-word", textShadow: "none" }}>
                              <span>{item}</span>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </div>
                </div>
              );
            })()}
          </>
        )}
      </div>
    </div>
  );
}

function ScaledSlidePreview({
  slide,
  index,
  total,
  ratio,
  logo,
  primary,
  secondary,
  width,
}: {
  slide: CarouselSlide;
  index: number;
  total: number;
  ratio: number;
  logo: string;
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
          primary={primary}
          secondary={secondary}
        />
      </div>
    </div>
  );
}

function CarouselField({
  label,
  optionalAction,
  children,
}: {
  label: string;
  optionalAction?: ReactNode;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 flex min-h-5 items-center justify-between gap-3 text-[10px] font-bold uppercase tracking-[0.12em] text-white/45">
        <span>{label}</span>
        {optionalAction}
      </span>
      {children}
    </label>
  );
}

function MiniTypographyBar({
  style = {},
  fallbackBold = false,
  fallbackColor = "#FFFFFF",
  primaryColor = "#F5F906",
  secondaryColor = "#00F0FF",
  onChange,
  onSelectTextColor,
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
  onSelectTextColor?: (color: string) => void;
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
    if (onSelectTextColor) onSelectTextColor(hex);
  };

  const brandColors = [
    { hex: "#FFFFFF", label: isEs ? "Claro" : "Claro" },
    { hex: primaryColor || "#F5F906", label: isEs ? "Principal" : "Primária" },
    { hex: secondaryColor || "#00F0FF", label: isEs ? "Secundario" : "Secundária" },
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
            className={`h-7 w-7 rounded-full border-2 transition-all hover:scale-110 ${
              currentColor.toUpperCase() === hex.toUpperCase()
                ? "scale-110 border-white ring-2 ring-[#F5F906] ring-offset-1 ring-offset-zinc-900"
                : "border-white/30"
            }`} style={{ backgroundColor: hex }} />
        ))}
        {/* Arco-íris */}
        <div className="relative cursor-pointer transition-transform hover:scale-110"
          style={{ width: 28, height: 28, borderRadius: "50%", padding: 2,
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
          title={isEs ? "Cursiva (I)" : "Itálico (I)"}
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
            className={`h-7 w-7 rounded-full border-2 transition-all hover:scale-110 ${
              currentColor.toUpperCase() === hex.toUpperCase()
                ? "scale-110 border-white ring-2 ring-[#F5F906] ring-offset-1 ring-offset-zinc-900"
                : "border-white/30"
            }`}
            style={{ backgroundColor: hex }}
          />
        ))}

        {/* Círculo arco-íris: anel externo colorido + cor atual no centro */}
        <div
          className="relative cursor-pointer transition-transform hover:scale-110"
          style={{
            width: 28,
            height: 28,
            borderRadius: "50%",
            padding: 2.5,
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
          {/* Input color nativo invisível sobreposto */}
          <input
            type="color"
            value={currentColor.startsWith("#") ? currentColor : "#FFFFFF"}
            onChange={(e) => handleColorClick(e.target.value)}
            className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
            style={{ borderRadius: "50%" }}
          />
        </div>

        {/* Botão para código HEX (por último, separado e discreto) */}
        <div className="flex items-center border-l border-white/15 pl-2">
          {!showHexInput ? (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                setShowHexInput(true);
                setHexInput(currentColor);
              }}
              title={isEs ? "Adicionar código HEX" : "Adicionar código da cor (HEX)"}
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
                ×
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function F1CarouselBuilder({ sourceImage = "", locale = "pt" }: F1CarouselBuilderProps) {
  const { state } = useFabricaContext();
  const { user } = useAuth();
  const isEs = locale === "es";
  const packages = state.selectedPackages.filter((pacote) => !pacote.isDraft);
  const [selectedPackageId, setSelectedPackageId] = useState(packages[0]?.id || "");
  const selectedPackage = packages.find((pacote) => pacote.id === selectedPackageId) || packages[0];
  const coverImage = sourceImage || state.generatedAdImage || "";
  const carouselContact =
    [
      { icon: state.footerContact1Icon, value: state.footerContact1Value },
      { icon: state.footerContact2Icon, value: state.footerContact2Value },
    ].find((contact) => contact.icon?.startsWith("whatsapp") && contact.value?.trim())?.value?.trim() ||
    "";
  const agencyPhone =
    carouselContact || phoneLabel(state.whatsappDialCode || "55", state.whatsapp || "");
  const [slideCount, setSlideCount] = useState<CarouselSize>(6);
  const slideCountRef = useRef<CarouselSize>(6);
  const [slides, setSlides] = useState<CarouselSlide[]>(() =>
    selectedPackage
      ? createSlides(selectedPackage, 6, coverImage, agencyPhone, isEs, uniqueImages([...(state.siteContent.galleryImages || [])]))
      : [],
  );
  const slideArchiveRef = useRef<CarouselSlide[]>(
    selectedPackage
      ? createSlides(selectedPackage, 6, coverImage, agencyPhone, isEs, uniqueImages([...(state.siteContent.galleryImages || [])]))
      : [],
  );
  const slidesRef = useRef(slides);
  const selectedPackageIdRef = useRef(selectedPackage?.id || "");
  const skipNextPersistRef = useRef("");
  const [activeIndex, setActiveIndex] = useState(() => (slides.length > 1 ? 1 : 0));
  const [viewMode, setViewMode] = useState<"ribbon" | "stack" | "focus">("ribbon");
  const [zoomScale, setZoomScale] = useState<number>(1);
  const [coverRatio, setCoverRatio] = useState(DEFAULT_COVER_RATIO);
  const [photoQuery, setPhotoQuery] = useState("");
  const [photoResults, setPhotoResults] = useState<PhotoResult[]>([]);
  const [searchingPhotos, setSearchingPhotos] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [showNewCarouselModal, setShowNewCarouselModal] = useState(false);
  const exportRefs = useRef<Array<HTMLDivElement | null>>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadRequestRef = useRef(new Map<string, symbol>());
  const activeSlide = slides[activeIndex];

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
        ...(state.siteContent.galleryImages || []),
        state.lastCleanPhoto,
      ]).slice(0, 16),
    [
      selectedPackage?.galleryImages,
      selectedPackage?.imageUrl,
      state.lastCleanPhoto,
      state.siteContent.galleryImages,
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
    if (!coverImage) {
      setCoverRatio(DEFAULT_COVER_RATIO);
      return;
    }
    const image = new Image();
    image.onload = () => {
      if (image.naturalWidth && image.naturalHeight) {
        setCoverRatio(image.naturalWidth / image.naturalHeight);
      }
    };
    image.src = coverImage;
  }, [coverImage]);

  useEffect(() => {
    skipNextPersistRef.current = storageKey;
    if (!selectedPackage) {
      slideArchiveRef.current = [];
      setSlides([]);
      setActiveIndex(0);
      return;
    }

    const preferredCount = slideCountRef.current;
    const destImages = uniqueImages([...(state.siteContent.galleryImages || []), ...photoResults.map((p) => p.url)]);
    const generated = createSlides(
      selectedPackage,
      preferredCount,
      coverImage,
      agencyPhone,
      isEs,
      destImages,
    );
    const generatedArchive = createSlides(
      selectedPackage,
      6,
      coverImage,
      agencyPhone,
      isEs,
      destImages,
    );

    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const parsed = JSON.parse(stored) as {
          slideCount?: CarouselSize;
          slides?: CarouselSlide[];
          allSlides?: CarouselSlide[];
        };
        const restoredCount =
          parsed.slideCount === 3 || parsed.slideCount === 4 || parsed.slideCount === 5 || parsed.slideCount === 6
            ? parsed.slideCount
            : preferredCount;
        const restoredArchive = mergeSlidesForSize(
          parsed.allSlides || parsed.slides || [],
          generatedArchive,
        ).map((slide) => {
          const withCover = slide.kind === "cover" ? { ...slide, imageUrl: coverImage } : slide;
          // backward compat: add new fields if missing from old localStorage saves
          return {
            ...withCover,
            slideVariant: withCover.slideVariant ?? "impact",
            bulletIcon: withCover.bulletIcon ?? "none",
          } as CarouselSlide;
        });
        const restoredBase = createSlides(
          selectedPackage,
          restoredCount,
          coverImage,
          agencyPhone,
          isEs,
          destImages,
        );
        const restored = mergeSlidesForSize(restoredArchive, restoredBase).map((slide) =>
          slide.kind === "cover" ? { ...slide, imageUrl: coverImage } : slide,
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
  }, [agencyPhone, coverImage, isEs, selectedPackage, storageKey, state.siteContent.galleryImages, photoResults]);

  useEffect(() => {
    if (!slides.length) return;
    if (skipNextPersistRef.current === storageKey) {
      skipNextPersistRef.current = "";
      return;
    }
    const persistDraft = (notifyError = true) => {
      try {
        const destImages = uniqueImages([...(state.siteContent.galleryImages || []), ...photoResults.map((p) => p.url)]);
        const generatedArchive = selectedPackage
          ? createSlides(selectedPackage, 6, coverImage, agencyPhone, isEs, destImages)
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
            slide.kind === "cover" || slide.imageUrl.startsWith("data:")
              ? ""
              : slide.imageUrl,
        });
        localStorage.setItem(
          storageKey,
          JSON.stringify({
            slideCount,
            slides: slides.map(safeSlide),
            allSlides: allSlides.map(safeSlide),
          }),
        );
      } catch {
        if (notifyError) {
          toast.error(
            isEs
              ? "No fue posible guardar el borrador en este navegador."
              : "Não foi possível salvar o rascunho neste navegador.",
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
  }, [slideCount, slides, storageKey, selectedPackage, coverImage, agencyPhone, isEs]);

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
    if (!activeSlide || activeSlide.kind === "cover") return;
    setSlides((current) =>
      current.map((slide, index) => (index === activeIndex ? { ...slide, ...patch } : slide)),
    );
  };

  const patchAllContentSlides = (patch: Partial<CarouselSlide>) => {
    setSlides((current) =>
      current.map((slide) => (slide.kind === "content" ? { ...slide, ...patch } : slide)),
    );
  };

  const changeSlideCount = (nextCount: CarouselSize) => {
    if (!selectedPackage) return;
    const destImages = uniqueImages([...(state.siteContent.galleryImages || []), ...photoResults.map((p) => p.url)]);
    const generated = createSlides(
      selectedPackage,
      nextCount,
      coverImage,
      agencyPhone,
      isEs,
      destImages,
    );
    const generatedArchive = createSlides(
      selectedPackage,
      6,
      coverImage,
      agencyPhone,
      isEs,
      destImages,
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
    const destImages = uniqueImages([...(state.siteContent.galleryImages || []), ...photoResults.map((p) => p.url)]);
    const generatedArchive = createSlides(
      selectedPackage,
      6,
      coverImage,
      agencyPhone,
      isEs,
      destImages,
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
      ),
    );
    slideArchiveRef.current = generatedArchive;
    setSlides(generated);
    setActiveIndex(generated.length > 1 ? 1 : 0);
    toast.success(
      isEs
        ? "Contenido actualizado con los datos reales del paquete."
        : "Conteúdo atualizado com os dados reais do pacote.",
    );
  };

  const discardAndCreateNew = () => {
    try {
      localStorage.removeItem(storageKey);
    } catch {}
    const currentIdx = packages.findIndex((p) => p.id === selectedPackage?.id);
    const nextPkg = packages[(currentIdx + 1) % packages.length] || selectedPackage;
    if (nextPkg && nextPkg.id !== selectedPackage?.id) {
      setSelectedPackageId(nextPkg.id);
    } else {
      regenerate();
    }
    setShowNewCarouselModal(false);
    toast.success(isEs ? "¡Nuevo carrusel generado!" : "Novo carrossel gerado com sucesso!");
  };

  const [generatingCoverAd, setGeneratingCoverAd] = useState(false);

  const generateNewCoverAd = async (targetPackage?: Pacote) => {
    const pkg = targetPackage || selectedPackage;
    if (!pkg) return;
    setGeneratingCoverAd(true);
    try {
      const dest = pkg.title || state.destinos[0] || "Viagem Incrível";
      const available = uniqueImages([
        pkg.imageUrl,
        ...(pkg.galleryImages || []),
        ...(state.siteContent.galleryImages || []),
        ...photoResults.map((p) => p.url),
        coverImage,
      ]);
      const currentCover = slides[0]?.imageUrl || coverImage;
      const nextIdx = (available.indexOf(currentCover) + 1) % available.length;
      const nextPhoto = available[nextIdx] || available[0] || coverImage || "";
      
      const format = coverRatio > 0.92 ? "feed" : "story";
      const composed = await composeTravelAd({
        imageUrl: nextPhoto,
        imageLuminance: state.autoLuminance ?? true,
        format,
        destination: dest,
        city: state.city,
        primaryColor: state.primaryColor,
        secondaryColor: state.secondaryColor,
        price: pkg.price || state.price || "Consulte",
        currencySymbol: state.currencySymbol || "R$",
        hideCents: state.hideCents ?? false,
        installments: state.installments || "",
        promoName: state.promoName || "OFERTA EXCLUSIVA",
        highlights: [...(pkg.highlights || []), ...(pkg.included || [])].filter(Boolean).slice(0, 3),
        hasLogo: !!state.logoBase64,
        logoDataUrl: state.logoBase64,
        logoFormat: state.logoFormat || "circle",
        footerContact1Icon: state.footerContact1Icon || "phone",
        footerContact1Value: pkg.agencyPhone || state.footerContact1Value || "",
        whatsapp: state.whatsapp || pkg.agencyPhone || "",
        instagram: state.instagram || "",
        paymentMode: state.paymentMode || "pix_card",
        paymentSuffix: state.paymentSuffix || "",
        pricePrefix: state.pricePrefix || "a partir de",
        strategy: "impacto_duplo",
        variation: Math.floor(Math.random() * 9),
        showPixBanner: state.showPixBanner ?? true,
        showTotal: state.showTotal ?? true,
        fontFamily: state.fontFamily || "Inter",
      });
      
      setSlides((curr) =>
        curr.map((slide, idx) =>
          idx === 0 ? { ...slide, imageUrl: composed } : slide
        )
      );
      toast.success(isEs ? "¡Nueva portada generada con arte publicitario!" : "Nova capa no estilo Anúncio F1 gerada com sucesso!");
    } catch (err) {
      console.error("Falha ao gerar capa F1:", err);
      toast.error(isEs ? "Error al generar portada." : "Erro ao gerar capa com arte F1.");
    } finally {
      setGeneratingCoverAd(false);
    }
  };

  const generateNewCover = () => {
    if (!availableImages.length) return;
    const currentCover = slides[0]?.imageUrl || coverImage;
    const nextIdx = (availableImages.indexOf(currentCover) + 1) % availableImages.length;
    const nextImage = availableImages[nextIdx] || availableImages[0] || coverImage;
    setSlides((curr) =>
      curr.map((slide, idx) =>
        idx === 0 ? { ...slide, imageUrl: nextImage } : slide
      )
    );
    toast.success(isEs ? "¡Nueva portada aplicada!" : "Nova foto de capa aplicada com sucesso!");
  };

  const generateNewSlidePhoto = () => {
    if (!activeSlide || !availableImages.length) return;
    const currentImg = activeSlide.imageUrl;
    const nextIdx = (availableImages.indexOf(currentImg) + 1) % availableImages.length;
    const nextImage = availableImages[nextIdx] || availableImages[0] || currentImg;
    setSlides((curr) =>
      curr.map((slide, idx) =>
        idx === activeIndex ? { ...slide, imageUrl: nextImage } : slide
      )
    );
    toast.success(isEs ? "¡Foto del slide cambiada!" : "Foto do slide atualizada com sucesso!");
  };

  const searchPhotos = async () => {
    const query =
      photoQuery.trim() ||
      selectedPackage?.title.trim() ||
      state.destinos.find(Boolean) ||
      "";
    if (!query) {
      toast.error(isEs ? "Escribe un destino para buscar." : "Digite um destino para buscar.");
      return;
    }

    setPhotoQuery(query);
    setSearchingPhotos(true);
    setPhotoResults([]);
    try {
      const { data, error } = await supabase.functions.invoke("fabrica-search-photos", {
        body: {
          query,
          perPage: 8,
          engine: "pexels",
          orientation: coverRatio > 0.92 ? "square" : "portrait",
          fallback: false,
        },
      });
      if (error) throw error;
      const safePhotos = (Array.isArray(data?.photos) ? data.photos : []).filter(
        (photo: PhotoResult) => /^https:\/\/images\.pexels\.com\//i.test(photo.url || ""),
      );
      setPhotoResults(safePhotos);
      if (!safePhotos.length) {
        toast.info(isEs ? "No encontramos fotos para esta búsqueda." : "Nenhuma foto encontrada para esta busca.");
      }
    } catch (error) {
      console.error("Erro ao buscar fotos para o carrossel:", error);
      toast.error(isEs ? "No fue posible buscar fotos ahora." : "Não foi possível buscar fotos agora.");
    } finally {
      setSearchingPhotos(false);
    }
  };

  const handleUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    const targetSlideId = activeSlide?.kind === "cover" ? "" : activeSlide?.id || "";
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
              : "Você mudou de pacote. Selecione o slide novamente para aplicar a foto.",
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
        const { error } = await supabase.storage
          .from("thumbnails")
          .upload(path, optimized, {
            contentType: "image/webp",
            upsert: true,
        });
        if (error) throw error;
        const publicUrl = supabase.storage.from("thumbnails").getPublicUrl(path).data.publicUrl;
        if (uploadRequestRef.current.get(requestKey) !== requestToken) return;
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
            ? "Foto aplicada temporalmente. Inicia sesión para conservarla al volver."
          : "Foto aplicada temporariamente. Entre na conta para mantê-la ao voltar.",
        );
      }
    } catch {
      if (uploadRequestRef.current.get(requestKey) === requestToken) {
        toast.error(isEs ? "No fue posible preparar esta imagen." : "Não foi possível preparar esta imagem.");
      }
    } finally {
      if (uploadRequestRef.current.get(requestKey) === requestToken) {
        uploadRequestRef.current.delete(requestKey);
      }
    }
  };

  const downloadAll = async () => {
    if (!selectedPackage || !slides.length) return;
    if (!coverImage) {
      setActiveIndex(0);
      toast.error(
        isEs
          ? "Genera primero la portada en la pestaña Anuncio."
          : "Gere primeiro a arte de capa na aba Anúncio.",
      );
      return;
    }

    const closingSlide = slides.find((slide) => slide.kind === "closing");
    if (!state.logoBase64) {
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
          ? "Agrega el teléfono o WhatsApp en la imagen final."
          : "Adicione o telefone ou WhatsApp na imagem final.",
      );
      return;
    }
    if (!closingSlide.cta.trim()) {
      setActiveIndex(slides.length - 1);
      toast.error(
        isEs
          ? "Agrega una llamada a la acción en la imagen final."
          : "Adicione uma chamada para ação na imagem final.",
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

    for (let index = 1; index < resolvedSlides.length; index += 1) {
      try {
        await assertExportImageReadable(resolvedSlides[index].imageUrl);
      } catch {
        setActiveIndex(index);
        toast.error(
          isEs
            ? `La foto de la imagen ${index + 1} no permite exportación. Usa otra foto del banco o envía un archivo.`
            : `A foto da imagem ${index + 1} não permite exportação. Use outra foto do banco ou envie um arquivo.`,
        );
        return;
      }
    }
    try {
      await assertExportImageReadable(state.logoBase64);
    } catch {
      setActiveIndex(resolvedSlides.length - 1);
      toast.error(
        isEs
          ? "La logo actual no permite exportación. Vuelve a enviarla en el Panel."
          : "A logo atual não permite exportação. Envie-a novamente no Painel.",
      );
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
      const coverToDownload = resolvedSlides[0]?.imageUrl || coverImage;
      await downloadOriginalImage(coverToDownload, `carrossel-${slug}-01-capa.png`);
      const { default: html2canvas } = await import("html2canvas");

      for (let index = 1; index < resolvedSlides.length; index += 1) {
        const node = exportRefs.current[index];
        if (!node) throw new Error("missing-export-node");

        // ── 1. Pré-carrega TODAS as imagens como data: URL no nó original ──
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

        // ── 2. Aguarda o browser re-renderizar com as data:URLs ──
        await new Promise((resolve) => window.setTimeout(resolve, 400));

        // ── 3. Traz o nó pro viewport (necessário para html2canvas ver os pixels) ──
        const prevPosition = node.style.position;
        const prevLeft = node.style.left;
        const prevTop = node.style.top;
        const prevOpacity = node.style.opacity;
        const prevPointerEvents = node.style.pointerEvents;
        const prevZIndex = node.style.zIndex;

        node.style.position = "fixed";
        node.style.left = "0px";
        node.style.top = "0px";
        node.style.opacity = "0.001";
        node.style.pointerEvents = "none";
        node.style.zIndex = "99999";

        await new Promise((resolve) => window.setTimeout(resolve, 120));

        // ── 4. Captura com html2canvas ──
        const canvas = await html2canvas(node, {
          backgroundColor: "#08090B",
          useCORS: true,
          allowTaint: true,
          scale: 2,
          logging: false,
          imageTimeout: 15000,
          width: node.offsetWidth,
          height: node.offsetHeight,
          windowWidth: node.offsetWidth,
          windowHeight: node.offsetHeight,
        });

        // ── 5. Restaura posição original ──
        node.style.position = prevPosition;
        node.style.left = prevLeft;
        node.style.top = prevTop;
        node.style.opacity = prevOpacity;
        node.style.pointerEvents = prevPointerEvents;
        node.style.zIndex = prevZIndex;

        // ── 6. Baixa a imagem ──
        const link = document.createElement("a");
        link.href = canvas.toDataURL("image/png", 1);
        link.download = `carrossel-${slug}-${String(index + 1).padStart(2, "0")}.png`;
        document.body.appendChild(link);
        link.click();
        link.remove();
        await new Promise((resolve) => window.setTimeout(resolve, 200));
      }

      toast.success(
        isEs
          ? `${slides.length} imágenes listas. La portada original fue preservada.`
          : `${slides.length} imagens prontas. A capa original foi preservada.`,
      );
    } catch (error) {
      console.error("Falha ao exportar carrossel:", error);
      toast.error(
        isEs
          ? "No fue posible exportar. Prueba otra foto del banco o un archivo enviado."
          : "Não foi possível exportar. Tente outra foto do banco ou um arquivo enviado.",
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
    if (!activeSlide || activeSlide.kind === "cover") return null;
    return (
      <div className="rounded-2xl border border-white/10 bg-[#0F0F11] p-4 sm:p-5 shadow-lg">
        <div className="flex items-center gap-2">
          <ImagePlus className="h-4 w-4 text-[#F5F906]" />
          <h3 className="text-sm font-bold text-white">
            {activeSlide.kind === "closing"
              ? (isEs ? "Fondo del cierre" : "Fundo do fechamento")
              : (isEs ? "Foto de esta imagen" : "Foto desta imagem")}
          </h3>
        </div>

        <div className="mt-3 flex gap-2">
          <input
            value={photoQuery}
            onChange={(event) => setPhotoQuery(event.target.value)}
            onKeyDown={(event) => event.key === "Enter" && searchPhotos()}
            placeholder={selectedPackage.title || (isEs ? "Destino" : "Destino")}
            className="f1-carousel-input min-w-0 flex-1"
          />
          <button
            type="button"
            onClick={searchPhotos}
            disabled={searchingPhotos}
            aria-label={isEs ? "Buscar fotos" : "Buscar fotos"}
            className="grid min-h-11 min-w-11 place-items-center rounded-xl bg-[#F5F906] text-zinc-950 disabled:opacity-50 hover:bg-[#F5F906]/90 transition-colors"
          >
            {searchingPhotos ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
          </button>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            aria-label={isEs ? "Enviar imagen" : "Enviar imagem"}
            className="grid min-h-11 min-w-11 place-items-center rounded-xl border border-white/15 text-white/70 hover:bg-white/[0.05]"
          >
            <Upload className="h-4 w-4" />
          </button>
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleUpload} className="hidden" />
        </div>

        {state.destinos.length > 0 && (
          <div className="mt-2 flex gap-2 overflow-x-auto pb-1">
            {state.destinos.filter(Boolean).slice(0, 6).map((destination) => (
              <button
                key={destination}
                type="button"
                onClick={() => setPhotoQuery(destination)}
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
                ? (isEs ? "Resultados de la búsqueda" : "Resultados da busca")
                : (isEs ? "Banco de imágenes" : "Banco de imagens")}
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
                    slide.kind !== "cover" &&
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
          </div>
        )}

        <div className="mt-3">
          <CarouselField label={isEs ? "O pega un enlace de imagen" : "Ou cole um link de imagem"}>
            <input
              value={activeSlide.imageUrl.startsWith("data:") ? "" : activeSlide.imageUrl}
              onChange={(event) => patchActive({ imageUrl: event.target.value })}
              placeholder="https://..."
              className="f1-carousel-input text-xs"
            />
          </CarouselField>
        </div>
      </div>
    );
  };

  const renderPublishFooterBox = () => {
    return (
      <div className="rounded-2xl border border-[#F5F906]/30 bg-[#F5F906]/[0.06] p-4 sm:p-5 shadow-xl space-y-3.5">
        <div className="flex items-center gap-3">
          <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[#F5F906] text-xs font-black text-zinc-950">4</span>
          <div>
            <p className="text-sm font-bold text-white">
              {isEs ? "Todo listo para publicar" : "Tudo pronto para publicar"}
            </p>
            <p className="text-[10px] text-white/55">
              {isEs ? "La portada no se procesa nuevamente." : "A capa não é processada novamente."}
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
          <button
            type="button"
            onClick={() => setShowNewCarouselModal(true)}
            className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-xl border border-red-500/40 bg-red-500/15 px-3 text-xs font-extrabold text-red-300 hover:bg-red-500/25 transition-colors"
          >
            {isEs ? "+ Nuevo Carrusel" : "+ Gerar Novo Carrossel"}
          </button>
          <button
            type="button"
            onClick={downloadAll}
            disabled={downloading}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#F5F906] px-3 text-xs font-extrabold text-zinc-950 hover:bg-[#F5F906]/90 disabled:opacity-50 transition-colors shadow-lg shadow-[#F5F906]/10"
          >
            <Download className="h-4 w-4 shrink-0" />
            <span className="truncate">{isEs ? `Descargar ${slides.length} imágenes` : `Baixar ${slides.length} imagens`}</span>
          </button>
        </div>
      </div>
    );
  };

  return (
    <section className="space-y-4" data-testid="f1-carousel-builder">
      <div className="rounded-2xl border border-white/10 bg-[#0F0F11] p-4 sm:p-5">
        <div className="flex items-center gap-2 mb-4">
          <span className="grid h-6 w-6 place-items-center rounded-full bg-[#F5F906] text-[11px] font-black text-zinc-950">1</span>
          <h3 className="text-sm font-bold text-white">
            {isEs ? "Elige el paquete, cantidad y estilo" : "Escolha o pacote, quantidade e estilo"}
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
                onChange={(event) => setSelectedPackageId(event.target.value)}
                className="min-h-11 w-full rounded-xl border border-white/10 bg-zinc-900 px-3 text-sm font-semibold text-white outline-none focus:border-[#F5F906]"
              >
                {packages.map((pacote) => (
                  <option key={pacote.id} value={pacote.id}>{pacote.title}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-4">
            <fieldset>
              <legend className="text-[10px] font-bold uppercase tracking-[0.14em] text-white/45">
                {isEs ? "Total de imágenes" : "Total de imagens"}
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

            <fieldset>
              <legend className="text-[10px] font-bold uppercase tracking-[0.14em] text-white/45">
                {isEs ? "Estilo visual del slide" : "Estilo visual do slide"}
              </legend>
              <div className="mt-1.5 grid grid-cols-3 gap-2">
                {([
                  ["impact",    isEs ? "Impacto"    : "Impacto",    "Foto cheia + texto em baixo"],
                  ["itinerary", isEs ? "Roteiro"    : "Roteiro",    "Foto no topo + bloco colorido"],
                  ["editorial", isEs ? "Editorial"  : "Editorial",  "Card flutuante central"],
                ] as const).map(([variant, labelText, hint]) => {
                  const currentContentSlide = slides.find(s => s.kind === "content");
                  const isActiveVariant = currentContentSlide ? (currentContentSlide.slideVariant || "impact") === variant : variant === "impact";
                  return (
                    <button
                      key={variant}
                      type="button"
                      aria-pressed={isActiveVariant}
                      title={hint}
                      onClick={() => patchAllContentSlides({ slideVariant: variant })}
                      className={`flex min-h-10 flex-col items-center justify-center gap-1 rounded-xl border px-2 py-1.5 text-[10px] font-bold transition-colors ${
                        isActiveVariant
                          ? "border-[#F5F906] bg-[#F5F906]/15 text-[#F5F906]"
                          : "border-white/10 bg-white/[0.02] text-white/60 hover:bg-white/[0.06] hover:text-white"
                      }`}
                    >
                      <span className="text-sm leading-none">
                        {variant === "impact" ? "🖼" : variant === "itinerary" ? "📋" : "🪟"}
                      </span>
                      {labelText}
                    </button>
                  );
                })}
              </div>
            </fieldset>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-[#0F0F11] p-3 sm:p-4">
        {/* Header: título + contador + controles de modo e zoom */}
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="grid h-6 w-6 place-items-center rounded-full bg-[#F5F906] text-[11px] font-black text-zinc-950">2</span>
            <div>
              <h3 className="text-sm font-bold text-white">{isEs ? "Revisa la secuencia" : "Revise a sequência"}</h3>
              <p className="text-[10px] text-white/40">
                {isEs ? "Toca una imagen para abrirla." : "Toque em uma imagem para abri-la."}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Contador + Setas de Navegação */}
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
                aria-label={isEs ? "Próximo" : "Próximo"}
                title={isEs ? "Siguiente diapositiva (>)" : "Próximo slide (>)"}
                className="grid h-7 w-7 place-items-center rounded-lg text-white/70 hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-25"
              >
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Botões de modo de visualização */}
            <div className="flex items-center gap-1 rounded-xl border border-white/10 p-1">
              <button
                type="button"
                onClick={() => setViewMode("ribbon")}
                aria-pressed={viewMode === "ribbon"}
                aria-label={isEs ? "Vista horizontal" : "Visualização horizontal"}
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
                aria-label={isEs ? "Vista vertical" : "Visualização vertical"}
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

            {/* Controles de Zoom (ocultos no modo focus pois já tem escala grande) */}
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
                  title={`${Math.round(zoomScale * 100)}% — ${isEs ? "clic para resetear" : "clique para redefinir"}`}
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

        {/* ── MODO: FAIXA HORIZONTAL (ribbon) ── */}
        {viewMode === "ribbon" && (() => {
          // Redimensionamento dinâmico: quanto mais slides, menor cada thumb
          // 3 slides → ~220px | 4 → ~185px | 5 → ~155px | 6 → ~135px | 7+ → ~115px
          const baseWidth = Math.round(Math.max(110, 290 - slides.length * 22));
          const thumbWidth = Math.round(baseWidth * zoomScale);
          const thumbHeight = Math.round(thumbWidth / coverRatio);
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

              <div id="f1-ribbon-scroll" className="f1-carousel-scroll flex snap-x gap-4 overflow-x-auto pb-3 pt-1 px-2 w-full">
                {slides.map((slide, index) => {
                  const isActive = activeIndex === index;
                  return (
                    <button
                      key={slide.id}
                      type="button"
                      onClick={() => setActiveIndex(index)}
                      aria-label={`${isEs ? "Abrir imagen" : "Abrir imagem"} ${index + 1}`}
                      aria-pressed={isActive}
                      style={{
                        flex: "0 0 auto",
                        width: `${thumbWidth}px`,
                      }}
                      className={`snap-center group relative flex flex-col overflow-hidden rounded-2xl border-2 bg-[#121316] text-left transition-all ${
                        isActive
                          ? "border-[#F5F906] shadow-[0_0_24px_rgba(245,249,6,0.22)] ring-1 ring-[#F5F906]/40"
                          : "border-white/12 hover:border-white/30 hover:-translate-y-0.5"
                      }`}
                    >
                      <ScaledSlidePreview
                        slide={slide}
                        index={index}
                        total={slides.length}
                        ratio={coverRatio}
                        logo={state.logoBase64}
                        primary={state.primaryColor}
                        secondary={state.secondaryColor}
                        width={thumbWidth}
                      />
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
                              ? (isEs ? "Original" : "Original")
                              : slide.kind === "closing"
                                ? (isEs ? "Contacto" : "Fechamento")
                                : `${isEs ? "Diapositiva" : "Slide"} ${index + 1}`}
                          </span>
                        </div>
                        {slide.kind === "cover" && <Lock className="h-3 w-3 shrink-0 text-[#F5F906]" />}
                      </div>
                    </button>
                  );
                })}
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
                aria-label={isEs ? "Próxima" : "Próxima"}
                title={isEs ? "Rolagem e próximo slide" : "Rolagem e próximo slide"}
                className="absolute right-1 z-20 grid h-9 w-9 place-items-center rounded-full border border-white/20 bg-black/80 text-white shadow-lg backdrop-blur-md transition-all hover:bg-black hover:scale-105 disabled:pointer-events-none disabled:opacity-0"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          );
        })()}

        {/* ── MODO: GRADE VERTICAL (stack) — uma embaixo da outra ── */}
        {viewMode === "stack" && (() => {
          // Redimensionamento dinâmico na grade
          // 3 slides → 2 colunas grandes | 4 → 2 cols | 5-6 → 3 cols | 7+ → 4 cols
          const cols = slides.length <= 4 ? 2 : slides.length <= 6 ? 3 : 4;
          const baseWidth = Math.round(Math.max(140, 340 - slides.length * 20));
          const thumbWidth = Math.round(baseWidth * zoomScale);
          const gridClass = cols === 2 ? "grid-cols-2" : cols === 3 ? "grid-cols-2 md:grid-cols-3" : "grid-cols-2 md:grid-cols-4";
          return (
            <div className={`grid ${gridClass} gap-4`}>
              {slides.map((slide, index) => {
                const isActive = activeIndex === index;
                return (
                  <button
                    key={slide.id}
                    type="button"
                    onClick={() => setActiveIndex(index)}
                    aria-label={`${isEs ? "Abrir imagen" : "Abrir imagem"} ${index + 1}`}
                    aria-pressed={isActive}
                    style={{ width: "100%", maxWidth: `${thumbWidth}px` }}
                    className={`group relative mx-auto flex flex-col overflow-hidden rounded-2xl border-2 bg-[#121316] text-left transition-all ${
                      isActive
                        ? "border-[#F5F906] shadow-[0_0_24px_rgba(245,249,6,0.22)] ring-1 ring-[#F5F906]/40"
                        : "border-white/12 hover:border-white/30 hover:-translate-y-0.5"
                    }`}
                  >
                    <ScaledSlidePreview
                      slide={slide}
                      index={index}
                      total={slides.length}
                      ratio={coverRatio}
                      logo={state.logoBase64}
                      primary={state.primaryColor}
                      secondary={state.secondaryColor}
                      width={thumbWidth}
                    />
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
                            ? (isEs ? "Portada original" : "Capa original")
                            : slide.kind === "closing"
                              ? (isEs ? "Cierre + contacto" : "Fechamento + contato")
                              : `${isEs ? "Contenido" : "Conteúdo"} ${index + 1}`}
                        </span>
                      </div>
                      {slide.kind === "cover" && <Lock className="h-3.5 w-3.5 shrink-0 text-[#F5F906]" />}
                    </div>
                  </button>
                );
              })}
            </div>
          );
        })()}

        {/* ── MODO: FOCO — uma imagem grande por vez com setas ── */}
        {viewMode === "focus" && (() => {
          const thumbWidth = Math.round(380 * zoomScale);
          return (
            <div className="flex flex-col items-center gap-3">
              {/* Setas de navegação + indicador */}
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
                  aria-label={isEs ? "Siguiente imagen" : "Próxima imagem"}
                  className="grid h-10 w-10 place-items-center rounded-xl border border-white/10 text-white/70 hover:bg-white/[0.06] disabled:opacity-25"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>

              {/* Canvas do slide ativo em destaque */}
              <div className="mx-auto overflow-hidden rounded-2xl border-2 border-[#F5F906] shadow-[0_0_32px_rgba(245,249,6,0.15)]">
                {activeSlide && (
                  <ScaledSlidePreview
                    slide={activeSlide}
                    index={activeIndex}
                    total={slides.length}
                    ratio={coverRatio}
                    logo={state.logoBase64}
                    primary={state.primaryColor}
                    secondary={state.secondaryColor}
                    width={thumbWidth}
                  />
                )}
              </div>

              <p className="text-[10px] text-white/40">
                {activeSlide?.kind === "cover"
                  ? (isEs ? "Portada original — bloqueada." : "Capa original — bloqueada.")
                  : activeSlide?.kind === "closing"
                    ? (isEs ? "Cierre + contac      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,.82fr)_minmax(340px,1.18fr)]">
        {/* ══ LEFT: Slide Editor ══ */}
        <div className="order-2 space-y-3 lg:order-1">
          {/* ── Card: Slide being edited ── */}
          <div className="rounded-2xl border border-white/10 bg-[#0F0F11] overflow-hidden">
            {/* Header bar */}
            <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-white/[0.06]">
              <div className="flex items-center gap-2.5">
                <span className="grid h-6 w-6 place-items-center rounded-full bg-[#F5F906] text-[11px] font-black text-zinc-950">3</span>
                <div>
                  <h3 className="text-sm font-bold text-white leading-none">
                    {activeSlide?.kind === "cover"
                      ? (isEs ? "Portada protegida" : "Capa protegida")
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
                  aria-label={isEs ? "Próxima" : "Próxima"}
                  className="grid h-7 w-7 place-items-center rounded-lg text-white/60 hover:bg-white/[0.08] hover:text-white disabled:opacity-25 transition-all"
                >
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {/* Capa protegida */}
            {activeSlide?.kind === "cover" && (
              <div className="m-4 rounded-xl border border-[#F5F906]/20 bg-[#F5F906]/[0.05] p-4 flex gap-3">
                <Lock className="mt-0.5 h-5 w-5 shrink-0 text-[#F5F906]" />
                <div>
                  <p className="text-sm font-bold text-white">{isEs ? "Esta imagen no se modifica." : "Esta imagem não será modificada."}</p>
                  <p className="mt-1 text-xs leading-relaxed text-white/50">
                    {isEs
                      ? "Es exactamente la pieza generada en Anuncio."
                      : "É exatamente a arte gerada em Anúncio. Ela é baixada pelo arquivo original."}
                  </p>
                  {!coverImage && (
                    <p className="mt-3 rounded-lg bg-amber-300/10 px-3 py-2 text-xs font-semibold text-amber-100">
                      {isEs
                        ? "Vuelve a Anuncio, genera la portada y usa "Transformar en carrusel"."
                        : "Volte para Anúncio, gere a capa e use "Transformar em carrossel"."}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Content & Closing slide editor */}
            {activeSlide && activeSlide.kind !== "cover" && (
              <div className="divide-y divide-white/[0.06]">

                {/* ── SECTION 1: Estilo & Fonte ── */}
                <div className="px-4 py-3.5 space-y-3">
                  <p className="text-[9px] font-extrabold uppercase tracking-[0.18em] text-white/30">
                    {isEs ? "Estilo e Tipografía" : "Estilo e Tipografia"}
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
                        aria-label={isEs ? "Tipo de letra" : "Família da fonte"}
                        className="w-full rounded-xl border border-white/10 bg-black/60 px-3 py-2 text-[11px] font-bold text-white outline-none focus:border-[#F5F906] focus:ring-2 focus:ring-[#F5F906]/15 transition-all cursor-pointer"
                      >
                        <option value="Inter">Inter — Moderno</option>
                        <option value="Montserrat">Montserrat — Elegante</option>
                        <option value="Poppins">Poppins — Geométrico</option>
                        <option value="Outfit">Outfit — Vibrante</option>
                        <option value="Playfair Display">Playfair — Luxo</option>
                        <option value="Roboto">Roboto — Clássica</option>
                      </select>
                    </div>
                    {/* Shadow toggle */}
                    <div className="space-y-1.5">
                      <label className="text-[9.5px] font-bold uppercase tracking-[0.12em] text-white/40 block">
                        {isEs ? "Opciones" : "Opções"}
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
                </div>

                {/* ── SECTION 2: Selo / Etiqueta ── */}
                <div className="px-4 py-3.5 space-y-3">
                  <p className="text-[9px] font-extrabold uppercase tracking-[0.18em] text-white/30">
                    {isEs ? "Etiqueta (Sello)" : "Selo (Destaque)"}
                  </p>
                  <input
                    value={activeSlide.label || ""}
                    maxLength={32}
                    placeholder={isEs ? "Ej: ROTA 01" : "Ex: DESTINO INCRÍVEL"}
                    onChange={(event) => patchActive({ label: event.target.value })}
                    className="f1-carousel-input !min-h-[38px] !py-2 !text-[13px]"
                  />
                  {/* Pill suggestions */}
                  <div className="flex flex-wrap gap-1.5">
                    {["ROTEIRO", "INCLUI", "DESTINO", "PIX", "OFERTA"].map((pill) => (
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
                  {/* Label style */}
                  <div className="flex flex-wrap gap-1">
                    {([
                      ["filled", "Sólido"],
                      ["outline-thin", "Borda fina"],
                      ["outline-thick", "Borda forte"],
                      ["stripe-left", "Tarja"],
                      ["rectangle", "Retângulo"],
                      ["translucent", "Translúcido"],
                      ["gradient", "Degradê"],
                    ] as const).map(([styleKey, styleTitle]) => (
                      <button
{
                      (activeSlide.labelStyle || "filled") === styleKey
                        ? "border-[#F5F906] bg-[#F5F906]/15 text-[#F5F906] shadow-[0_0_10px_rgba(245,249,6,0.2)]"
                        : "border-white/10 text-white/55 hover:border-white/25 hover:text-white"
                    }`}
                  >
                    {styleTitle}
                  </button>
                ))}
              </div>
            </div>

            {activeSlide.kind === "content" ? (
              <>
                {/* ── SECTIONS 3 & 4: Título e Descrição Curta (Lado a Lado) ── */}
                <div className="grid grid-cols-2 gap-3 px-4 py-3.5">
                  {/* SECTION 3: Título */}
                  <div className="space-y-1.5">
                    <p className="text-[9px] font-extrabold uppercase tracking-[0.18em] text-white/30">
                      {isEs ? "Título principal" : "Título principal"}
                    </p>
                    <div className="flex items-start gap-2">
                      <textarea
                        value={activeSlide.title}
                        maxLength={80}
                        rows={3}
                        placeholder={isEs ? "Ex: Descubra este destino" : "Ex: Porto de Galinhas"}
                        onChange={(event) => patchActive({ title: event.target.value })}
                        className="f1-carousel-input !py-2.5 text-sm resize-none flex-1 leading-snug"
                      />
                      <MiniTypographyBar
                        style={activeSlide.titleStyle}
                        fallbackBold={activeSlide.fontWeight !== "normal"}
                        fallbackColor={activeSlide.textColor || "#FFFFFF"}
                        primaryColor={state.primaryColor}
                        secondaryColor={state.secondaryColor}
                        onChange={(updated) => patchActive({ titleStyle: updated })}
                        onSelectTextColor={(color) => patchActive({ textColor: color })}
                        isEs={isEs}
                        vertical
                      />
                    </div>
                  </div>

                  {/* SECTION 4: Descrição Curta */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <p className="text-[9px] font-extrabold uppercase tracking-[0.18em] text-white/30">
                        {isEs ? "Descripción corta" : "Descrição curta"}
                      </p>
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
                    <div className="flex items-start gap-2">
                      <textarea
                        value={activeSlide.body}
                        maxLength={260}
                        rows={3}
                        placeholder={isEs ? "Ex: Incluye..." : "Ex: Inclui transfer, guia..."}
                        onChange={(event) => patchActive({ body: event.target.value })}
                        className="f1-carousel-input !py-2.5 text-sm resize-none flex-1 leading-snug"
                      />
                      <MiniTypographyBar
                        style={activeSlide.bodyStyle}
                        fallbackBold={activeSlide.fontWeight === "bold"}
                        fallbackColor={activeSlide.textColor || "#FFFFFF"}
                        primaryColor={state.primaryColor}
                        secondaryColor={state.secondaryColor}
                        onChange={(updated) => patchActive({ bodyStyle: updated })}
                        onSelectTextColor={(color) => patchActive({ textColor: color })}
                        isEs={isEs}
                        vertical
                      />
                    </div>
                  </div>
                </div>

                {/* ── SECTION 5: Descrição Inferior (bullets) ── */}
                <div className="px-4 pb-3.5 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <p className="text-[9px] font-extrabold uppercase tracking-[0.18em] text-white/30">
                      {isEs ? "Descripción inferior" : "Descrição inferior"}
                    </p>
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
                  <div className="flex items-start gap-2">
                    <textarea
                      value={activeSlide.bullets.join("\n")}
                      rows={4}
                      placeholder={isEs
                        ? "Ej: Sugerencia:\nTransporte\nGuía local\nSeguro"
                        : "Sugestão:\nTransporte\nGuia local\nSeguro"}
                      onChange={(event) =>
                        patchActive({
                          bullets: event.target.value
                            .split(/\r?\n/)
                            .map((item) => item.slice(0, 100))
                            .slice(0, 8),
                        })
                      }
                      className="f1-carousel-input !min-h-[90px] !py-2.5 text-sm resize-none flex-1 leading-snug"
                    />
                    <MiniTypographyBar
                      style={activeSlide.bulletStyle}
                      fallbackBold={activeSlide.fontWeight === "bold"}
                      fallbackColor={activeSlide.textColor || "#FFFFFF"}
                      primaryColor={state.primaryColor}
                      secondaryColor={state.secondaryColor}
                      onChange={(updated) => patchActive({ bulletStyle: updated })}
                      onSelectTextColor={(color) => patchActive({ textColor: color })}
                      isEs={isEs}
                      vertical
                    />
                  </div>
                  <p className="text-[9px] text-white/25">{isEs ? "Una línea = un ítem. Máx 8 ítems." : "Uma linha = um item. Máx 8 itens."}</p>
                </div>
              </>
                ) : (
                  /* ── Closing slide fields ── */
                  <div className="divide-y divide-white/[0.06]">
                    <div className="px-4 py-3.5 space-y-2">
                      <p className="text-[9px] font-extrabold uppercase tracking-[0.18em] text-white/30">
                        {isEs ? "Llamada a la acción" : "Chamada para Ação"}
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
                    <div className="px-4 py-3.5 grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <label className="text-[9.5px] font-bold uppercase tracking-[0.12em] text-white/35 block">
                          {isEs ? "WhatsApp / Teléfono" : "WhatsApp / Telefone"}
                        </label>
                        <input
                          value={activeSlide.phone || ""}
                          maxLength={32}
                          onChange={(event) => patchActive({ phone: event.target.value })}
                          className="f1-carousel-input !min-h-[40px] !py-2 !text-[13px]"
                          placeholder="(00) 00000-0000"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[9.5px] font-bold uppercase tracking-[0.12em] text-white/35 block">
                          Instagram
                        </label>
                        <input
                          value={activeSlide.instagram || ""}
                          maxLength={32}
                          onChange={(event) => patchActive({ instagram: event.target.value })}
                          className="f1-carousel-input !min-h-[40px] !py-2 !text-[13px]"
                          placeholder="@seuagência"
                        />
                      </div>
                    </div>
                    <div className="px-4 py-3.5 space-y-1.5">
                      <label className="text-[9.5px] font-bold uppercase tracking-[0.12em] text-white/35 block">
                        {isEs ? "Sitio Web" : "Site (opcional)"}
                      </label>
                      <input
                        value={activeSlide.website || ""}
                        maxLength={40}
                        onChange={(event) => patchActive({ website: event.target.value })}
                        className="f1-carousel-input !min-h-[40px] !py-2 !text-[13px]"
                        placeholder="www.seusite.com.br"
                      />
                    </div>
                    {!state.logoBase64 && (
                      <div className="px-4 py-3">
                        <p className="rounded-xl border border-amber-300/20 bg-amber-300/[0.06] px-3 py-2 text-xs text-amber-100/80">
                          {isEs
                            ? "Agrega la logo en el Panel de la Fábrica para completar el cierre."
                            : "Adicione a logo no Painel da Fábrica para completar o fechamento."}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {activeSlide && activeSlide.kind !== "cover" && (
            <div className="block lg:hidden space-y-4">
              {renderPhotoSelectionBox()}
              {renderPublishFooterBox()}
            </div>
          )}
        </div>
               )}
                  </>
                )}
              </div>
            )}

          </div>

          {activeSlide && activeSlide.kind !== "cover" && (
            <div className="block lg:hidden space-y-4">
              {renderPhotoSelectionBox()}
              {renderPublishFooterBox()}
            </div>
          )}
        </div>

        <aside className="order-1 lg:order-2 lg:sticky lg:top-5 lg:self-start max-h-[calc(100vh-1.5rem)] overflow-y-auto scrollbar-thin pr-1 space-y-4">
          <div className="rounded-2xl border border-white/10 bg-[#0F0F11] p-3 sm:p-4">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-white/35">
                  {isEs ? "Vista previa" : "Prévia"}
                </p>
                <p className="mt-1 text-xs text-white/55">
                  {isEs ? "Formato heredado de la portada" : "Formato herdado da capa"}
                </p>
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setActiveIndex((current) => Math.max(0, current - 1))}
                  disabled={activeIndex === 0}
                  aria-label={isEs ? "Imagen anterior" : "Imagem anterior"}
                  className="grid min-h-11 min-w-11 place-items-center rounded-xl border border-white/10 text-white/70 disabled:opacity-25"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setActiveIndex((current) => Math.min(slides.length - 1, current + 1))}
                  disabled={activeIndex === slides.length - 1}
                  aria-label={isEs ? "Siguiente imagen" : "Próxima imagem"}
                  className="grid min-h-11 min-w-11 place-items-center rounded-xl border border-white/10 text-white/70 disabled:opacity-25"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
            <div className="mx-auto flex justify-center overflow-hidden rounded-2xl border border-white/10 bg-zinc-950 shadow-2xl">
              {activeSlide && (
                <ScaledSlidePreview
                  slide={activeSlide}
                  index={activeIndex}
                  total={slides.length}
                  ratio={coverRatio}
                  logo={state.logoBase64}
                  primary={state.primaryColor}
                  secondary={state.secondaryColor}
                  width={360}
                />
              )}
            </div>
            <p className="mt-3 text-center text-[10px] leading-relaxed text-white/35">
              {activeSlide?.kind === "cover"
                ? (isEs ? "Portada original bloqueada." : "Capa original bloqueada.")
                : (isEs ? "Los cambios aparecen aquí al instante." : "As alterações aparecem aqui na hora.")}
            </p>
          </div>

          <div className="hidden lg:block space-y-4">
            {renderPhotoSelectionBox()}
            {renderPublishFooterBox()}
          </div>
        </aside>
      </div>

      {showNewCarouselModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl border border-white/15 bg-zinc-950 p-6 shadow-2xl space-y-5">
            <div className="flex items-center gap-3 text-[#F5F906]">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-[#F5F906]/15 text-[#F5F906]">
                <Sparkles className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-black text-white">
                {isEs ? "¿Ya descargaste las imágenes de este carrusel?" : "Já baixou as imagens desse carrossel?"}
              </h3>
            </div>
            <p className="text-xs leading-relaxed text-white/70">
              {isEs
                ? "Atención: Al generar un nuevo carrusel o descartar el actual, los cambios y fotos personalizadas se perderán."
                : "Atenção: Ao gerar um novo carrossel, as fotos e edições do carrossel atual serão descartadas. Certifique-se de baixar as imagens antes se quiser mantê-las."}
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
                {isEs ? "Descargar imágenes del carrusel" : "Baixar Imagens do Carrossel"}
              </button>
              <button
                type="button"
                onClick={discardAndCreateNew}
                className="w-full min-h-11 rounded-xl border border-red-500/40 bg-red-500/15 font-extrabold text-red-400 hover:bg-red-500/25 transition-colors flex items-center justify-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                {isEs ? "Descartar actual y generar nuevo" : "Excluir Carrossel, Descartar e Gerar Novo"}
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

      <div
        aria-hidden="true"
        style={{
          position: "fixed",
          left: 0,
          top: 0,
          width: "1px",
          height: "1px",
          opacity: 0,
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
            ratio={coverRatio}
            logo={state.logoBase64}
            primary={state.primaryColor}
            secondary={state.secondaryColor}
            canvasRef={(node) => {
              exportRefs.current[index] = node;
            }}
            exportMode
          />
        ))}
      </div>

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
