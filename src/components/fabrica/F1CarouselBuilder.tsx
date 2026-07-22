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
  if (!/^[0-9a-f]{6}$/i.test(normalized)) return `rgba(15,15,17,${alpha})`;
  const [red, green, blue] = [0, 2, 4].map((index) =>
    Number.parseInt(normalized.slice(index, index + 2), 16),
  );
  return `rgba(${red},${green},${blue},${alpha})`;
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

  const getImg = (idx: number) => {
    const valid = allDestImages.filter(Boolean);
    if (!valid.length) return ""; // fallback to empty instead of coverImage
    return valid[idx % valid.length] || "";
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
      imageUrl: getImg(index + 1),
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
    imageUrl: getImg(contentCount + 1),
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
  const computedHeight = Math.round(432 / (ratio || 0.8));
  const dimensions: CSSProperties = exportMode
    ? { width: 432, height: computedHeight }
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
              font: "800 18px/1.35 Inter, sans-serif",
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

  const textShadow = slide.showShadow === false ? "none" : "0 3px 18px rgba(0,0,0,.72)";
  const bodyShadow = slide.showShadow === false ? "none" : "0 2px 12px rgba(0,0,0,.82)";
  const bulletShadow = slide.showShadow === false ? "none" : "0 2px 10px rgba(0,0,0,.88)";

  const renderLabel = (label: string) => {
    if (!label) return null;
    const rawBg = slide.labelColor || secondary;
    const bg = rawBg.toUpperCase() === "#F5F906" ? "#F5F906" : rawBg;
    const fg = readableText(bg);

    const style = slide.labelStyle || "filled";
    if (style === "outline-thin") {
      return (
        <div style={{ display: "inline-flex", maxWidth: "100%", marginBottom: 13, borderRadius: 999, border: `1px solid ${bg}`, background: "rgba(0,0,0,.45)", color: "#F8FAFC", padding: "6px 12px", fontSize: 10, lineHeight: 1.15, fontWeight: 800, letterSpacing: ".12em", textTransform: "uppercase" }}>
          {label}
        </div>
      );
    }
    if (style === "outline-thick") {
      return (
        <div style={{ display: "inline-flex", maxWidth: "100%", marginBottom: 13, borderRadius: 999, border: `2.5px solid ${bg}`, background: "rgba(0,0,0,.6)", color: "#F8FAFC", padding: "6px 12px", fontSize: 10, lineHeight: 1.15, fontWeight: 900, letterSpacing: ".12em", textTransform: "uppercase" }}>
          {label}
        </div>
      );
    }
    if (style === "stripe-left") {
      return (
        <div style={{ display: "inline-flex", maxWidth: "100%", marginBottom: 13, borderLeft: `4px solid ${bg}`, background: "rgba(0,0,0,.55)", color: "#F8FAFC", padding: "6px 12px", fontSize: 10, lineHeight: 1.15, fontWeight: 800, letterSpacing: ".12em", textTransform: "uppercase" }}>
          {label}
        </div>
      );
    }
    if (style === "rectangle") {
      return (
        <div style={{ display: "inline-flex", maxWidth: "100%", marginBottom: 13, borderRadius: 0, background: bg, color: fg, padding: "7px 12px", fontSize: 10, lineHeight: 1.15, fontWeight: 900, letterSpacing: ".12em", textTransform: "uppercase", boxShadow: slide.showShadow === false ? "none" : "0 4px 14px rgba(0,0,0,.35)" }}>
          {label}
        </div>
      );
    }
    if (style === "translucent") {
      return (
        <div style={{ display: "inline-flex", maxWidth: "100%", marginBottom: 13, borderRadius: 999, background: `${bg}80`, color: fg, padding: "7px 12px", fontSize: 10, lineHeight: 1.15, fontWeight: 900, letterSpacing: ".12em", textTransform: "uppercase" }}>
          {label}
        </div>
      );
    }
    if (style === "gradient") {
      return (
        <div style={{ display: "inline-flex", maxWidth: "100%", marginBottom: 13, borderRadius: 999, background: `linear-gradient(90deg, ${bg}, rgba(255,255,255,0.8))`, color: fg, padding: "7px 12px", fontSize: 10, lineHeight: 1.15, fontWeight: 900, letterSpacing: ".12em", textTransform: "uppercase", boxShadow: slide.showShadow === false ? "none" : "0 4px 14px rgba(0,0,0,.35)" }}>
          {label}
        </div>
      );
    }
    return (
      <div style={{ display: "inline-flex", maxWidth: "100%", marginBottom: 13, borderRadius: 999, background: bg, color: fg, padding: "7px 12px", fontSize: 10, lineHeight: 1.15, fontWeight: 900, letterSpacing: ".12em", textTransform: "uppercase", boxShadow: slide.showShadow === false ? "none" : "0 4px 14px rgba(0,0,0,.35)" }}>
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
        background: `linear-gradient(145deg, ${primary}, ${secondary})`,
        color: slide.textColor,
        fontFamily: ff,
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
            zIndex: -3,
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
          zIndex: -2,
          background: slide.showShadow === false
            ? "transparent"
            : isClosing
              ? "linear-gradient(180deg,rgba(5,7,10,.58),rgba(5,7,10,.82))"
              : "linear-gradient(180deg,rgba(5,7,10,.22) 0%,rgba(5,7,10,.08) 30%,rgba(5,7,10,.78) 68%,rgba(5,7,10,.94) 100%)",
        }}
      />

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
          }}
        >
          <div
            style={{
              background: "rgba(255,255,255,.96)",
              padding: "16px 28px",
              borderRadius: 24,
              boxShadow: "0 8px 24px rgba(0,0,0,.35)",
              marginBottom: 16,
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
                  maxHeight: ratio < 0.68 ? 58 : 66,
                  maxWidth: 210,
                  objectFit: "contain",
                }}
              />
            ) : (
              <div
                style={{
                  color: "#111318",
                  fontSize: 14,
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
              margin: "0 0 8px",
              color: titleColor,
              fontSize: ratio < 0.68 ? 24 : 28,
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
              margin: "0 0 20px",
              color: bodyColor,
              fontSize: ratio < 0.68 ? 13 : 14,
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
              minHeight: 52,
              padding: "0 28px",
              borderRadius: 999,
              background: "#F5F906",
              color: "#111318",
              fontSize: 15,
              fontWeight: 900,
              letterSpacing: ".04em",
              textTransform: "uppercase",
              boxShadow: slide.showShadow === false ? "none" : "0 8px 26px rgba(245,249,6,.28)",
            }}
          >
            {slide.cta}
          </div>

          {slide.phone && (
            <div
              style={{
                marginTop: 18,
                color: "#F8FAFC",
                fontSize: ratio < 0.68 ? 18 : 20,
                lineHeight: 1.2,
                fontWeight: 800,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                textShadow: slide.showShadow === false ? "none" : "0 2px 12px rgba(0,0,0,.82)",
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="#25D366" style={{ filter: "drop-shadow(0 2px 6px rgba(0,0,0,.5))" }}>
                <path d="M11.999 0C5.373 0 0 5.373 0 12c0 2.126.556 4.196 1.614 6.012L.053 23.947l6.096-1.597C7.935 23.411 9.948 24 11.999 24 18.626 24 24 18.627 24 12S18.626 0 11.999 0zm6.166 17.067c-.259.73-1.512 1.405-2.09 1.463-.559.055-1.079.255-3.468-.682-2.885-1.132-4.757-4.088-4.901-4.281-.143-.193-1.173-1.564-1.173-2.984 0-1.42.744-2.122 1.009-2.414.259-.285.566-.356.755-.356.188 0 .376.002.541.011.174.009.407-.066.638.489.236.568.804 1.956.874 2.101.07.145.117.315.022.507-.095.193-.143.315-.284.482-.143.167-.301.374-.429.501-.143.143-.292.298-.125.586.167.288.742 1.228 1.596 1.986 1.101.977 2.031 1.281 2.319 1.424.288.143.456.12.625-.072.167-.193.717-.837.908-1.124.193-.288.384-.24.649-.143.264.098 1.68 0.793 1.968.937.288.143.479.215.549.335.071.12.071.698-.188 1.428z" />
              </svg>
              <span>{slide.phone}</span>
            </div>
          )}
          {slide.instagram && (
            <div
              style={{
                marginTop: 10,
                color: "#F8FAFC",
                fontSize: 15,
                lineHeight: 1.2,
                fontWeight: 700,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                textShadow: slide.showShadow === false ? "none" : "0 2px 12px rgba(0,0,0,.82)",
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" style={{ filter: "drop-shadow(0 2px 6px rgba(0,0,0,.5))" }}>
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
              </svg>
              <span>{slide.instagram}</span>
            </div>
          )}
          {slide.website && (
            <div
              style={{
                marginTop: 8,
                color: "#F8FAFC",
                fontSize: 15,
                lineHeight: 1.2,
                fontWeight: 700,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                textShadow: slide.showShadow === false ? "none" : "0 2px 12px rgba(0,0,0,.82)",
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ filter: "drop-shadow(0 2px 6px rgba(0,0,0,.5))" }}>
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
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                {logo ? (
                  <img
                    src={logo}
                    alt=""
                    crossOrigin={logo.startsWith("data:") || logo.startsWith("blob:") ? undefined : "anonymous"}
                    style={{ width: 42, height: 42, borderRadius: 12, objectFit: "contain", background: "rgba(255,255,255,.94)", padding: 5, boxShadow: "0 8px 24px rgba(0,0,0,.24)" }}
                  />
                ) : <span />}
              </div>
              <div>
                {renderLabel(slide.label)}
                {slide.title && (
                  <h3 style={{ maxWidth: "96%", margin: 0, color: titleColor, fontSize: ratio < 0.68 ? 31 : 35, lineHeight: 1.02, fontFamily: ff, fontWeight: titleWeight, fontStyle: titleStyleAttr, textDecoration: titleDecAttr, overflowWrap: "anywhere", wordBreak: "break-word", textShadow }}>
                    {slide.title}
                  </h3>
                )}
                {slide.body && (
                  <p style={{ maxWidth: "94%", margin: "13px 0 0", color: bodyColor, fontSize: ratio < 0.68 ? 13 : 14, lineHeight: 1.45, fontFamily: ff, fontWeight: bodyWeight, fontStyle: bodyStyleAttr, textDecoration: bodyDecAttr, opacity: 0.94, overflowWrap: "anywhere", wordBreak: "break-word", whiteSpace: "pre-wrap", textShadow: bodyShadow }}>
                    {slide.body}
                  </p>
                )}
                {slide.bullets.length > 0 && (
                  <ul style={{ display: "grid", gap: 7, maxWidth: "96%", margin: "15px 0 0", padding: 0, listStyle: "none" }}>
                    {slide.bullets.slice(0, 8).map((item, bulletIndex) => {
                      if (!item.trim()) return <li key={`${slide.id}-b-${bulletIndex}`} style={{ height: 10 }} />;
                      return (
                        <li key={`${slide.id}-b-${bulletIndex}`} style={{ display: "flex", gap: 8, alignItems: "flex-start", color: bulletColor, fontSize: 13, lineHeight: 1.35, fontFamily: ff, fontWeight: bulletWeight, fontStyle: bulletStyleAttr, textDecoration: bulletDecAttr, overflowWrap: "anywhere", wordBreak: "break-word", textShadow: bulletShadow }}>
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
              <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column" }}>
                {/* Photo zone top */}
                <div style={{ flex: "0 0 45%", position: "relative", overflow: "hidden" }}>
                  {slide.imageUrl && (
                    <img src={slide.imageUrl} alt="" crossOrigin={slide.imageUrl.startsWith("data:") || slide.imageUrl.startsWith("blob:") ? undefined : "anonymous"}
                      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
                  )}
                  <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg,rgba(0,0,0,.08),rgba(0,0,0,.52))" }} />
                  {/* logo top left */}
                  {logo && (
                    <img src={logo} alt="" crossOrigin={logo.startsWith("data:") || logo.startsWith("blob:") ? undefined : "anonymous"}
                      style={{ position: "absolute", top: "8%", left: "8%", width: 34, height: 34, borderRadius: 10, objectFit: "contain", background: "rgba(255,255,255,.94)", padding: 4, boxShadow: "0 4px 16px rgba(0,0,0,.22)" }} />
                  )}
                </div>
                {/* Content block bottom */}
                <div style={{ flex: 1, background: primary, padding: "7% 8%", display: "flex", flexDirection: "column", justifyContent: "center", gap: 10, overflow: "hidden" }}>
                  {renderLabel(slide.label)}
                  {slide.title && (
                    <h3 style={{ margin: 0, color: boxTitleColor, fontSize: ratio < 0.68 ? 22 : 26, lineHeight: 1.1, fontFamily: ff, fontWeight: titleWeight, fontStyle: titleStyleAttr, textDecoration: titleDecAttr, overflowWrap: "anywhere", wordBreak: "break-word", textShadow: "none" }}>
                      {slide.title}
                    </h3>
                  )}
                  {slide.body && (
                    <p style={{ margin: 0, color: boxBodyColor, fontSize: 12, lineHeight: 1.4, fontFamily: ff, fontWeight: bodyWeight, fontStyle: bodyStyleAttr, textDecoration: bodyDecAttr, opacity: 0.88, overflowWrap: "anywhere", wordBreak: "break-word", whiteSpace: "pre-wrap", textShadow: "none" }}>
                      {slide.body}
                    </p>
                  )}
                  {slide.bullets.length > 0 && (
                    <ul style={{ display: "grid", gap: 6, padding: 0, margin: 0, listStyle: "none" }}>
                      {slide.bullets.slice(0, 8).map((item, bulletIndex) => {
                        if (!item.trim()) return <li key={`${slide.id}-b-${bulletIndex}`} style={{ height: 8 }} />;
                        return (
                          <li key={`${slide.id}-b-${bulletIndex}`} style={{ display: "flex", gap: 7, alignItems: "flex-start", color: boxBulletColor, fontSize: 12, lineHeight: 1.3, fontFamily: ff, fontWeight: bulletWeight, fontStyle: bulletStyleAttr, textDecoration: bulletDecAttr, overflowWrap: "anywhere", wordBreak: "break-word", textShadow: "none" }}>
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

          {/* ─── VARIANT: EDITORIAL — photo full-bleed + floating card center ─── */}
          {slide.slideVariant === "editorial" && (() => {
            const onPrimary = readableText(primary);
            const isBgDark = onPrimary === "#F8FAFC";
            const isTextDark = readableText(slide.textColor) === "#F8FAFC";
            const boxTextColor = isBgDark && isTextDark ? onPrimary : slide.textColor;
            const boxTitleColor = slide.titleStyle?.color || boxTextColor;
            const boxBodyColor = slide.bodyStyle?.color || boxTextColor;
            const boxBulletColor = slide.bulletStyle?.color || boxTextColor;
            return (
              <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", padding: "8%" }}>
                {/* Logo */}
                {logo && (
                  <img src={logo} alt="" crossOrigin={logo.startsWith("data:") || logo.startsWith("blob:") ? undefined : "anonymous"}
                    style={{ position: "absolute", top: "7%", left: "7%", width: 34, height: 34, borderRadius: 10, objectFit: "contain", background: "rgba(255,255,255,.94)", padding: 4, boxShadow: "0 4px 16px rgba(0,0,0,.22)" }} />
                )}
                {/* Floating card */}
                <div style={{ width: "100%", borderRadius: 18, background: safeHexToRgba(primary, 0.93), backdropFilter: "blur(8px)", border: `2px solid ${secondary}`, padding: "8% 9%", display: "flex", flexDirection: "column", gap: 10, overflow: "hidden" }}>
                  {renderLabel(slide.label)}
                  {slide.title && (
                    <h3 style={{ margin: 0, color: boxTitleColor, fontSize: ratio < 0.68 ? 24 : 28, lineHeight: 1.05, fontFamily: ff, fontWeight: titleWeight, fontStyle: titleStyleAttr, textDecoration: titleDecAttr, overflowWrap: "anywhere", wordBreak: "break-word", textShadow: "none" }}>
                      {slide.title}
                    </h3>
                  )}
                  {slide.body && (
                    <p style={{ margin: 0, color: boxBodyColor, fontSize: 12, lineHeight: 1.42, fontFamily: ff, fontWeight: bodyWeight, fontStyle: bodyStyleAttr, textDecoration: bodyDecAttr, opacity: 0.88, overflowWrap: "anywhere", wordBreak: "break-word", whiteSpace: "pre-wrap", textShadow: "none" }}>
                      {slide.body}
                    </p>
                  )}
                  {slide.bullets.length > 0 && (
                    <ul style={{ display: "grid", gap: 7, padding: 0, margin: 0, listStyle: "none" }}>
                      {slide.bullets.slice(0, 8).map((item, bulletIndex) => {
                        if (!item.trim()) return <li key={`${slide.id}-b-${bulletIndex}`} style={{ height: 8 }} />;
                        return (
                          <li key={`${slide.id}-b-${bulletIndex}`} style={{ display: "flex", gap: 7, alignItems: "flex-start", color: boxBulletColor, fontSize: 12, lineHeight: 1.3, fontFamily: ff, fontWeight: bulletWeight, fontStyle: bulletStyleAttr, textDecoration: bulletDecAttr, overflowWrap: "anywhere", wordBreak: "break-word", textShadow: "none" }}>
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
          exportMode
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
  onChange,
  isEs = false,
}: {
  style?: FieldTypography;
  fallbackBold?: boolean;
  fallbackColor?: string;
  onChange: (updated: FieldTypography) => void;
  isEs?: boolean;
}) {
  const isBold = style.bold !== undefined ? style.bold : fallbackBold;
  const isItalic = style.italic !== undefined ? style.italic : false;
  const isUnderline = style.underline !== undefined ? style.underline : false;
  const currentColor = style.color || fallbackColor;

  const presetColors = ["#FFFFFF", "#F5F906", "#00F0FF", "#10B981", "#F97316", "#18181B"];

  return (
    <div className="mb-1.5 flex flex-wrap items-center justify-between gap-2 rounded-lg border border-white/10 bg-white/[0.03] px-2 py-1.5">
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            onChange({ ...style, bold: !isBold });
          }}
          title={isEs ? "Negrita (B)" : "Negrito (B)"}
          className={`grid h-6 w-6 place-items-center rounded text-xs font-black transition-colors ${
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
          className={`grid h-6 w-6 place-items-center rounded text-xs font-bold italic transition-colors ${
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
          className={`grid h-6 w-6 place-items-center rounded text-xs font-bold underline transition-colors ${
            isUnderline
              ? "bg-[#F5F906] text-zinc-950 shadow-sm"
              : "text-white/70 hover:bg-white/10 hover:text-white"
          }`}
        >
          U
        </button>
      </div>

      <div className="flex items-center gap-1.5">
        {presetColors.map((hex) => (
          <button
            key={hex}
            type="button"
            onClick={(e) => {
              e.preventDefault();
              onChange({ ...style, color: hex === fallbackColor && !style.color ? undefined : hex });
            }}
            title={hex}
            className={`h-4 w-4 rounded-full border transition-transform hover:scale-110 ${
              currentColor.toUpperCase() === hex
                ? "scale-110 border-white ring-2 ring-[#F5F906]/60 ring-offset-1 ring-offset-zinc-900"
                : "border-white/20"
            }`}
            style={{ backgroundColor: hex }}
          />
        ))}
        <div className="relative flex items-center">
          <input
            type="color"
            value={currentColor.startsWith("#") ? currentColor : "#FFFFFF"}
            onChange={(e) => onChange({ ...style, color: e.target.value })}
            title={isEs ? "Color personalizado" : "Cor personalizada"}
            className="h-5 w-5 cursor-pointer rounded-full border border-white/30 bg-transparent p-0 outline-none hover:scale-110"
          />
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

    const seenPhotos = new Map<string, number>();
    for (let index = 1; index < slides.length; index += 1) {
      const imageUrl = slides[index].imageUrl.trim();
      if (!imageUrl) continue;
      const firstIndex = seenPhotos.get(imageUrl);
      if (firstIndex !== undefined) {
        setActiveIndex(index);
        toast.error(
          isEs
            ? `La imagen ${index + 1} repite la foto de la imagen ${firstIndex + 1}. Elige otra foto.`
            : `A imagem ${index + 1} repete a foto da imagem ${firstIndex + 1}. Escolha outra foto.`,
        );
        return;
      }
      seenPhotos.set(imageUrl, index);
    }

    for (let index = 1; index < slides.length; index += 1) {
      try {
        await assertExportImageReadable(slides[index].imageUrl);
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
      setActiveIndex(slides.length - 1);
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
      const coverToDownload = slides[0]?.imageUrl || coverImage;
      await downloadOriginalImage(coverToDownload, `carrossel-${slug}-01-capa.png`);
      const { default: html2canvas } = await import("html2canvas");

      for (let index = 1; index < slides.length; index += 1) {
        const node = exportRefs.current[index];
        if (!node) throw new Error("missing-export-node");

        const clone = node.cloneNode(true) as HTMLDivElement;
        const imgs = clone.querySelectorAll("img");
        for (let i = 0; i < imgs.length; i += 1) {
          const img = imgs[i];
          const src = img.getAttribute("src");
          if (src && !src.startsWith("data:") && !src.startsWith("blob:")) {
            const cleanSrc = await prepareImageForCanvas(src);
            img.setAttribute("src", cleanSrc);
            img.removeAttribute("crossorigin");
          }
        }

        clone.style.position = "fixed";
        clone.style.left = "-15000px";
        clone.style.top = "0";
        clone.style.zIndex = "999999";
        document.body.appendChild(clone);

        await new Promise((resolve) => window.setTimeout(resolve, 80));

        const canvas = await html2canvas(clone, {
          backgroundColor: "#08090B",
          useCORS: true,
          allowTaint: true,
          scale: 2,
          logging: false,
        });

        document.body.removeChild(clone);

        const link = document.createElement("a");
        link.href = canvas.toDataURL("image/png", 1);
        link.download = `carrossel-${slug}-${String(index + 1).padStart(2, "0")}.png`;
        document.body.appendChild(link);
        link.click();
        link.remove();
        await new Promise((resolve) => window.setTimeout(resolve, 180));
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
          const thumbWidth = Math.round(155 * zoomScale);
          const thumbHeight = Math.round(thumbWidth / coverRatio);
          return (
            <div className="f1-carousel-scroll flex snap-x gap-4 overflow-x-auto pb-3 pt-1">
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
                    className={`snap-start group relative flex flex-col overflow-hidden rounded-2xl border-2 bg-[#121316] text-left transition-all ${
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
          );
        })()}

        {/* ── MODO: GRADE VERTICAL (stack) — uma embaixo da outra ── */}
        {viewMode === "stack" && (() => {
          const thumbWidth = Math.round(280 * zoomScale);
          return (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
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
                    ? (isEs ? "Cierre + contacto" : "Fechamento + contato")
                    : `${isEs ? "Contenido" : "Conteúdo"} ${activeIndex} — ${isEs ? "toca para editar abajo" : "toque para editar abaixo"}`}
              </p>
            </div>
          );
        })()}
      </div>


      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,.82fr)_minmax(340px,1.18fr)]">
        <div className="order-2 space-y-4 xl:order-1">
          <div className="rounded-2xl border border-white/10 bg-[#0F0F11] p-4 sm:p-5">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="grid h-6 w-6 place-items-center rounded-full bg-[#F5F906] text-[11px] font-black text-zinc-950">3</span>
                <div>
                  <h3 className="text-sm font-bold text-white">
                    {activeSlide?.kind === "cover"
                      ? (isEs ? "Portada protegida" : "Capa protegida")
                      : activeSlide?.kind === "closing"
                        ? (isEs ? "Edita el cierre" : "Edite o fechamento")
                        : (isEs ? "Foto y texto de esta imagen" : "Foto e texto desta imagem")}
                  </h3>
                  {/* Badge indicador do tipo de slide */}
                  <span className={`inline-block mt-0.5 rounded-md px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
                    activeSlide?.kind === "cover"
                      ? "bg-[#F5F906]/15 text-[#F5F906]"
                      : activeSlide?.kind === "closing"
                        ? "bg-white/10 text-white/60"
                        : "bg-white/[0.06] text-white/45"
                  }`}>
                    {activeSlide?.kind === "cover"
                      ? (isEs ? "Portada" : "Capa")
                      : activeSlide?.kind === "closing"
                        ? (isEs ? "Cierre" : "Fechamento")
                        : `${isEs ? "Slide" : "Slide"} ${activeIndex + 1} / ${slides.length}`}
                  </span>
                </div>
              </div>

              {/* Navegação rápida prev/next diretamente no painel de edição */}
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setActiveIndex((c) => Math.max(0, c - 1))}
                  disabled={activeIndex === 0}
                  aria-label={isEs ? "Imagen anterior" : "Imagem anterior"}
                  title={isEs ? "Anterior" : "Anterior"}
                  className="grid h-8 w-8 place-items-center rounded-lg border border-white/10 text-white/60 hover:bg-white/[0.06] hover:text-white disabled:opacity-25"
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                </button>
                <span className="min-w-[28px] text-center text-[10px] font-bold text-white/35">
                  {activeIndex + 1}/{slides.length}
                </span>
                <button
                  type="button"
                  onClick={() => setActiveIndex((c) => Math.min(slides.length - 1, c + 1))}
                  disabled={activeIndex === slides.length - 1}
                  aria-label={isEs ? "Siguiente imagen" : "Próxima imagem"}
                  title={isEs ? "Siguiente" : "Próxima"}
                  className="grid h-8 w-8 place-items-center rounded-lg border border-white/10 text-white/60 hover:bg-white/[0.06] hover:text-white disabled:opacity-25"
                >
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {activeSlide?.kind === "cover" && (
              <div className="mt-4 rounded-xl border border-[#F5F906]/25 bg-[#F5F906]/[0.06] p-4">
                <div className="flex gap-3">
                  <Lock className="mt-0.5 h-5 w-5 shrink-0 text-[#F5F906]" />
                  <div>
                    <p className="text-sm font-bold text-white">
                      {isEs ? "Esta imagen no se modifica." : "Esta imagem não será modificada."}
                    </p>
                    <p className="mt-1 text-xs leading-relaxed text-white/55">
                      {isEs
                        ? "Es exactamente la pieza generada en Anuncio. También se descarga desde el archivo original, sin recomposición."
                        : "É exatamente a arte gerada em Anúncio. Ela também é baixada pelo arquivo original, sem recomposição."}
                    </p>
                    {!coverImage && (
                      <p className="mt-3 rounded-lg bg-amber-300/10 px-3 py-2 text-xs font-semibold text-amber-100">
                        {isEs
                          ? "Vuelve a Anuncio, genera la portada y usa “Transformar en carrusel”."
                          : "Volte para Anúncio, gere a capa e use “Transformar em carrossel”."}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeSlide && activeSlide.kind !== "cover" && (
              <div className="mt-4 space-y-4">
                {/* ── Barra de Formatação (Fonte, Peso e Estilo) ── */}
                <div className="rounded-xl border border-white/10 bg-zinc-900/80 p-3 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#F5F906]">
                      {isEs ? "Estilo y Tipografía" : "Estilo e Tipografia"}
                    </span>
                    <label className="flex items-center gap-1.5 cursor-pointer text-xs font-bold text-white/80">
                      <input
                        type="checkbox"
                        checked={activeSlide.showShadow !== false}
                        onChange={(event) => patchActive({ showShadow: event.target.checked })}
                        className="rounded border-white/20 bg-black text-[#F5F906] focus:ring-[#F5F906]"
                      />
                      <span>{isEs ? "Sombra en textos" : "Sombra nos textos"}</span>
                    </label>
                  </div>
                  <div>
                    <select
                      value={activeSlide.fontFamily || "Inter"}
                      onChange={(event) => patchActive({ fontFamily: event.target.value })}
                      aria-label={isEs ? "Tipo de letra" : "Família da fonte"}
                      className="min-h-9 w-full rounded-lg border border-white/10 bg-black/60 px-2.5 text-xs font-bold text-white outline-none focus:border-[#F5F906]"
                    >
                      <option value="Inter">Inter (Padrão Moderno)</option>
                      <option value="Montserrat">Montserrat (Elegante)</option>
                      <option value="Poppins">Poppins (Geométrica)</option>
                      <option value="Outfit">Outfit (Vibrante)</option>
                      <option value="Playfair Display">Playfair Display (Editorial/Luxo)</option>
                      <option value="Roboto">Roboto (Clássica)</option>
                    </select>
                  </div>
                </div>

                {activeSlide.kind === "content" ? (
                  <>
                    <CarouselField label={isEs ? "Etiqueta corta (Selo)" : "Selo curto (Destaque superior)"}>
                      <div className="space-y-2">
                        <input
                          value={activeSlide.label || ""}
                          maxLength={32}
                          placeholder={isEs ? "Ej: DESLIZA O RUTA 01" : "Ex: ROTEIRO OU DESLIZE"}
                          onChange={(event) => patchActive({ label: event.target.value })}
                          className="f1-carousel-input"
                        />
                        <div className="flex flex-wrap gap-1.5">
                          {["ROTEIRO COMPLETO", "O QUE INCLUI", "DESTINO INCRÍVEL", "GARANTIDO", "FAIXA PIX"].map((pill) => (
                            <button
                              key={pill}
                              type="button"
                              onClick={() => patchActive({ label: pill })}
                              className="rounded-md border border-white/10 bg-white/[0.03] px-2 py-1 text-[9px] font-bold text-white/60 hover:border-white/25 hover:text-white"
                            >
                              + {pill}
                            </button>
                          ))}
                        </div>
                      </div>
                    </CarouselField>

                    <CarouselField label={isEs ? "Estilo del selo" : "Estilo do selo"}>
                      <div className="grid grid-cols-3 gap-1.5 sm:grid-cols-4 lg:grid-cols-3">
                        {([
                          ["filled", isEs ? "Sólido" : "Sólido"],
                          ["outline-thin", isEs ? "Borda fina" : "Borda fina"],
                          ["outline-thick", isEs ? "Borda forte" : "Borda forte"],
                          ["stripe-left", isEs ? "Tarja" : "Tarja"],
                          ["rectangle", "Retângulo"],
                          ["translucent", "Translúcido 50%"],
                          ["gradient", "Degradê"],
                        ] as const).map(([styleKey, styleTitle]) => (
                          <button
                            key={styleKey}
                            type="button"
                            onClick={() => patchActive({ labelStyle: styleKey })}
                            className={`rounded-lg border px-2 py-1.5 text-[10px] font-bold transition-colors ${
                              (activeSlide.labelStyle || "filled") === styleKey
                                ? "border-[#F5F906] bg-[#F5F906]/15 text-[#F5F906]"
                                : "border-white/10 text-white/60 hover:bg-white/[0.05]"
                            }`}
                          >
                            {styleTitle}
                          </button>
                        ))}
                      </div>
                    </CarouselField>

                    <CarouselField label={isEs ? "Título" : "Título principal"}>
                      <MiniTypographyBar
                        style={activeSlide.titleStyle}
                        fallbackBold={activeSlide.fontWeight !== "normal"}
                        fallbackColor={activeSlide.textColor || "#FFFFFF"}
                        onChange={(updated) => patchActive({ titleStyle: updated })}
                        isEs={isEs}
                      />
                      <textarea
                        value={activeSlide.title}
                        maxLength={80}
                        rows={2}
                        onChange={(event) => patchActive({ title: event.target.value })}
                        className="f1-carousel-input resize-none"
                      />
                    </CarouselField>
                    <CarouselField
                      label={isEs ? "Descripción corta" : "Descrição curta / Subtítulo"}
                      optionalAction={
                        activeSlide.body ? (
                          <button
                            type="button"
                            onClick={(event) => {
                              event.preventDefault();
                              patchActive({ body: "" });
                            }}
                            className="inline-flex min-h-7 items-center gap-1 rounded-md px-2 text-[9px] text-white/45 hover:bg-white/[0.05] hover:text-white"
                          >
                            <X className="h-3 w-3" /> {isEs ? "Quitar" : "Remover"}
                          </button>
                        ) : null
                      }
                    >
                      <MiniTypographyBar
                        style={activeSlide.bodyStyle}
                        fallbackBold={activeSlide.fontWeight === "bold"}
                        fallbackColor={activeSlide.textColor || "#FFFFFF"}
                        onChange={(updated) => patchActive({ bodyStyle: updated })}
                        isEs={isEs}
                      />
                      <textarea
                        value={activeSlide.body}
                        maxLength={260}
                        rows={3}
                        onChange={(event) => patchActive({ body: event.target.value })}
                        className="f1-carousel-input resize-y"
                      />
                    </CarouselField>
                    <CarouselField
                      label={isEs ? "Párrafos o líneas (uno por línea)" : "Topo do parágrafo ou linha (um por linha)"}
                      optionalAction={
                        activeSlide.bullets.length ? (
                          <button
                            type="button"
                            onClick={(event) => {
                              event.preventDefault();
                              patchActive({ bullets: [] });
                            }}
                            className="inline-flex min-h-7 items-center gap-1 rounded-md px-2 text-[9px] text-white/45 hover:bg-white/[0.05] hover:text-white"
                          >
                            <X className="h-3 w-3" /> {isEs ? "Quitar" : "Remover"}
                          </button>
                        ) : null
                      }
                    >
                      <MiniTypographyBar
                        style={activeSlide.bulletStyle}
                        fallbackBold={activeSlide.fontWeight === "bold"}
                        fallbackColor={activeSlide.textColor || "#FFFFFF"}
                        onChange={(updated) => patchActive({ bulletStyle: updated })}
                        isEs={isEs}
                      />
                      <textarea
                        value={activeSlide.bullets.join("\n")}
                        rows={5}
                        placeholder={isEs ? "Escribe un tópico por línea...\nDeja una línea en blanco para espaciar" : "Digite um tópico por linha...\nDeixe uma linha em branco para espaçar parágrafos"}
                        onChange={(event) =>
                          patchActive({
                            bullets: event.target.value
                              .split(/\r?\n/)
                              .map((item) => item.slice(0, 100))
                              .slice(0, 8),
                          })
                        }
                        className="f1-carousel-input resize-y"
                      />
                    </CarouselField>
                  </>
                ) : (
                  <>
                    <CarouselField label={isEs ? "Llamada principal" : "Chamada principal"}>
                      <input
                        value={activeSlide.cta}
                        maxLength={62}
                        onChange={(event) => patchActive({ cta: event.target.value })}
                        className="f1-carousel-input mb-2"
                      />
                      <div className="flex flex-wrap gap-1">
                        {["RESERVE SUA VAGA", "FALE CONOSCO", "SAIBA MAIS", "ENTRE EM CONTATO", "GARANTA SEU LUGAR"].map(suggestion => (
                          <button
                            key={suggestion}
                            type="button"
                            onClick={() => patchActive({ cta: suggestion })}
                            className="rounded bg-white/[0.04] px-2 py-1 text-[9px] font-bold text-white/60 hover:bg-white/[0.08] hover:text-white"
                          >
                            {suggestion}
                          </button>
                        ))}
                      </div>
                    </CarouselField>
                    <CarouselField label={isEs ? "Teléfono o WhatsApp" : "Telefone ou WhatsApp"}>
                      <input
                        value={activeSlide.phone || ""}
                        maxLength={32}
                        onChange={(event) => patchActive({ phone: event.target.value })}
                        className="f1-carousel-input"
                        placeholder="(00) 00000-0000"
                      />
                    </CarouselField>
                    <CarouselField label="Instagram (Opcional)">
                      <input
                        value={activeSlide.instagram || ""}
                        maxLength={32}
                        onChange={(event) => patchActive({ instagram: event.target.value })}
                        className="f1-carousel-input"
                        placeholder="@seuinstrumento"
                      />
                    </CarouselField>
                    <CarouselField label={isEs ? "Sitio Web (Opcional)" : "Site (Opcional)"}>
                      <input
                        value={activeSlide.website || ""}
                        maxLength={40}
                        onChange={(event) => patchActive({ website: event.target.value })}
                        className="f1-carousel-input"
                        placeholder="www.seusite.com.br"
                      />
                    </CarouselField>
                    {!state.logoBase64 && (
                      <p className="rounded-xl border border-amber-300/20 bg-amber-300/[0.06] px-3 py-2 text-xs text-amber-100/80">
                        {isEs
                          ? "Agrega la logo en el Panel de la Fábrica para completar el cierre."
                          : "Adicione a logo no Painel da Fábrica para completar o fechamento."}
                      </p>
                    )}
                  </>
                )}

                <CarouselField label={isEs ? "Color del texto" : "Cor do texto"}>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      ["#FFFFFF", isEs ? "Claro" : "Claro"],
                      [state.primaryColor, isEs ? "Principal" : "Primária"],
                      [state.secondaryColor, isEs ? "Secundario" : "Secundária"],
                    ].map(([color, label]) => (
                      <button
                        key={`${color}-${label}`}
                        type="button"
                        aria-pressed={activeSlide.textColor.toUpperCase() === color.toUpperCase()}
                        onClick={() => patchActive({ textColor: color })}
                        className={`flex min-h-11 items-center justify-center gap-2 rounded-xl border px-2 text-[10px] font-bold ${
                          activeSlide.textColor.toUpperCase() === color.toUpperCase()
                            ? "border-[#F5F906] text-white"
                            : "border-white/10 text-white/55 hover:bg-white/[0.04]"
                        }`}
                      >
                        <span className="h-3.5 w-3.5 rounded-full border border-white/20" style={{ background: color }} />
                        {label}
                      </button>
                    ))}
                  </div>
                </CarouselField>
              </div>
            )}
          </div>

          {activeSlide && activeSlide.kind !== "cover" && (
            <div className="rounded-2xl border border-white/10 bg-[#0F0F11] p-4 sm:p-5">
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
                  className="grid min-h-11 min-w-11 place-items-center rounded-xl bg-[#F5F906] text-zinc-950 disabled:opacity-50"
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
                      className="min-h-9 shrink-0 rounded-full border border-white/10 px-3 text-[10px] font-bold text-white/55 hover:border-white/25 hover:text-white"
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
                  <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
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
                          className={`relative aspect-square overflow-hidden rounded-xl border-2 ${
                            selected
                              ? "border-[#F5F906]"
                              : usedByOtherSlide
                                ? "cursor-not-allowed border-white/5 opacity-35"
                                : "border-white/10 hover:border-white/30"
                          }`}
                        >
                          <img
                            src={photo.thumb}
                            alt={photo.alt || ""}
                            className="h-full w-full object-cover"
                            loading="lazy"
                          />
                          {selected && (
                            <span className="absolute right-1.5 top-1.5 grid h-6 w-6 place-items-center rounded-full bg-[#F5F906] text-zinc-950">
                              <Check className="h-3.5 w-3.5" />
                            </span>
                          )}
                          {usedByOtherSlide && !selected && (
                            <span className="absolute inset-x-1.5 bottom-1.5 rounded-md bg-black/75 px-1 py-0.5 text-[8px] font-bold uppercase text-white/80">
                              {isEs ? "En uso" : "Em uso"}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <CarouselField label={isEs ? "O pega un enlace de imagen" : "Ou cole um link de imagem"}>
                <input
                  value={activeSlide.imageUrl.startsWith("data:") ? "" : activeSlide.imageUrl}
                  onChange={(event) => patchActive({ imageUrl: event.target.value })}
                  placeholder="https://..."
                  className="f1-carousel-input"
                />
              </CarouselField>
            </div>
          )}
        </div>

        <aside className="order-1 xl:order-2 xl:sticky xl:top-5 xl:self-start">
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
                  width={410}
                />
              )}
            </div>
            <p className="mt-3 text-center text-[10px] leading-relaxed text-white/35">
              {activeSlide?.kind === "cover"
                ? (isEs ? "Portada original bloqueada." : "Capa original bloqueada.")
                : (isEs ? "Los cambios aparecen aquí al instante." : "As alterações aparecem aqui na hora.")}
            </p>
          </div>
        </aside>
      </div>

      <div className="rounded-2xl border border-[#F5F906]/25 bg-[#F5F906]/[0.05] p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[#F5F906] text-[11px] font-black text-zinc-950">4</span>
            <div>
              <p className="text-sm font-bold text-white">
                {isEs ? "Todo listo para publicar" : "Tudo pronto para publicar"}
              </p>
              <p className="text-[10px] text-white/45">
                {isEs ? "La portada no se procesa nuevamente." : "A capa não é processada novamente."}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => setShowNewCarouselModal(true)}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-red-500/40 bg-red-500/15 px-4 text-sm font-extrabold text-red-400 hover:bg-red-500/25 transition-colors"
            >
              {isEs ? "+ Nuevo Carrusel" : "+ Gerar Novo Carrossel"}
            </button>
            <button
              type="button"
              onClick={downloadAll}
              disabled={downloading}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#F5F906] px-4 text-sm font-extrabold text-zinc-950 disabled:opacity-50"
            >
              <Download className="h-4 w-4" />
              {isEs ? `Descargar ${slides.length} imágenes` : `Baixar ${slides.length} imagens`}
            </button>
          </div>
        </div>
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
        style={{ position: "fixed", left: "-12000px", top: 0, pointerEvents: "none" }}
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
