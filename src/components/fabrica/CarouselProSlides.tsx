/**
 * MODELOS PRO DO CARROSSEL — reconstruídos a partir das referências em
 * C:\Users\win 10\Downloads\referencias (30/10):
 *
 * - "neon"   (pro-bold)     → Kriptopix: fundo preto, brilho na cor de destaque, grade fina,
 *                             cartões escuros com borda luminosa, pílula "Arraste para o lado →",
 *                             chips de ícone, linha pontilhada com pins.
 * - "oferta" (pro-split)    → Clube Turismo (Natal R$195): cartão arredondado na cor da marca com
 *                             "Oferta | frase", destino enorme, inclusos em caixa alta, ABA COM
 *                             AVIÃO no canto, sub-cartão branco com preço e faixa "Consulte-nos".
 * - "enseada"(pro-magazine) → Enseada "3 praias em 1 dia": bloco claro no topo com título gigante,
 *                             barra "Saindo de X 📍", lista de ícones | divisor | preço, foto embaixo.
 * - "conheca"(pro-luxe)     → "Conheça Maragogi!": painel creme à esquerda, título em bloco da cor da
 *                             marca invadindo a foto, lista de ícones grandes, pílula de preço, filete.
 *
 * Ícones reais em /assets/icons (avião, ônibus, hotel, café, guia, pino, calendário…), escolhidos
 * pelo texto de cada tópico. Preço detectado no texto ("R$ 1.299,00") vira bloco de preço.
 * Base de desenho: 432px de largura; altura = 432 / ratio.
 */
import { formatAdPhone } from "@/lib/fabrica-compose-art";
import type { CSSProperties, ReactNode } from "react";
import type { CarouselSlide } from "@/components/fabrica/F1CarouselBuilder";

export const PRO_SLIDE_VARIANTS = ["pro-bold", "pro-split", "pro-magazine", "pro-luxe"] as const;
export type ProSlideVariant = (typeof PRO_SLIDE_VARIANTS)[number];
export const isProSlideVariant = (v?: string): v is ProSlideVariant =>
  !!v && (PRO_SLIDE_VARIANTS as readonly string[]).includes(v);

interface ProSlideProps {
  slide: CarouselSlide;
  index: number;
  total: number;
  ratio: number;
  logo: string;
  primary: string;
  secondary: string;
  canvasRef?: (node: HTMLDivElement | null) => void;
}

// ───────── cores ─────────
const hexToRgb = (hex: string) => {
  const h = hex.replace("#", "");
  const full = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  const n = parseInt(full.slice(0, 6), 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
};
const luminance = (hex: string) => {
  try {
    const { r, g, b } = hexToRgb(hex);
    const f = (c: number) => { const v = c / 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
    return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
  } catch { return 0; }
};
const rgba = (hex: string, a: number) => { try { const { r, g, b } = hexToRgb(hex); return `rgba(${r},${g},${b},${a})`; } catch { return `rgba(0,0,0,${a})`; } };
const isLight = (hex: string) => luminance(hex) > 0.45;
const contrast = (a: string, b: string) => { const x = luminance(a), y = luminance(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };
/** Texto sobre a cor: escolhe preto ou branco pelo maior contraste (branco em laranja não passa). */
const onColor = (hex: string) => (contrast(hex, "#111318") >= contrast(hex, "#FFFFFF") ? "#111318" : "#FFFFFF");
/** Escurece a cor da marca até ficar legível como texto sobre um fundo claro. */
const readableOn = (hex: string, bg: string) => {
  try {
    const { r, g, b } = hexToRgb(hex);
    for (let k = 1; k > 0.1; k -= 0.05) {
      const c = "#" + [r, g, b].map((v) => Math.round(v * k).toString(16).padStart(2, "0")).join("");
      if (contrast(c, bg) >= 4.5) return c;
    }
  } catch { /* cor inválida: cai no preto */ }
  return "#111318";
};
const INK = "#111318";
const INK_SOFT = "#4A4F58";
const CREAM = "#FBF7EF";
const NIGHT = "#0A0B0E";

const clean = (s?: string) => (s || "").replace(/\s+/g, " ").trim();

// Textos fixos dos modelos. O carrossel não recebe o idioma por props; a Fábrica em
// espanhol vive em /es/fabrica (e o laboratório aceita ?lang=es).
const PT = { trip: "Viagem", swipe: "Arraste para o lado", swipeShort: "Arraste", swipeCaps: "ARRASTE", from: "A partir de", fromLower: "a partir de", perPerson: "por pessoa", perPersonShort: "/pessoa", by: "por", offer: "Oferta", tagline: "A sua melhor viagem começa aqui.", leaving: "Saindo de", askPrices: "Consulte valores e datas", askUs: "Consulte-nos", fareNote: "Tarifa sujeita a alteração sem aviso prévio", itinerary: "Roteiro", talk: "Fale com a gente" };
const ES: typeof PT = { trip: "Viaje", swipe: "Desliza al lado", swipeShort: "Desliza", swipeCaps: "DESLIZA", from: "Desde", fromLower: "desde", perPerson: "por persona", perPersonShort: "/persona", by: "por", offer: "Oferta", tagline: "Tu mejor viaje empieza aquí.", leaving: "Saliendo de", askPrices: "Consulta valores y fechas", askUs: "Consúltanos", fareNote: "Tarifa sujeta a cambios sin previo aviso", itinerary: "Itinerario", talk: "Habla con nosotros" };
const tr = () => {
  if (typeof window === "undefined") return PT;
  const es = /^\/es(\/|$)/.test(window.location.pathname) || new URLSearchParams(window.location.search).get("lang") === "es";
  return es ? ES : PT;
};

// ───────── ícones reais do projeto (/assets/icons) ─────────
const ICON_RULES: [RegExp, string][] = [
  [/ritmo|rotina|sem pressa/i, "relogio"],
  [/conhecer de verdade|valem a visita/i, "guia-turistico"],
  [/voltar com|mem[óo]rias/i, "aviao"],
  [/a[ée]reo|voo|passag|avi[ãa]o|embarque/i, "aviao"],
  [/[ôo]nibus|transporte|rodovi|transfer|traslado/i, "onibus"],
  [/hospeda|hotel|pousada|noite|resort|quarto|apartamento/i, "placa-do-hotel"],
  [/caf[ée]|refei|almo[çc]o|jantar|all ?inclusive|pens[ãa]o|gastronom|comida/i, "cafe-da-manha"],
  [/guia|acompanh|recep/i, "guia-turistico"],
  [/seguro|assist/i, "kit-de-primeiros-socorros"],
  [/data|dia |dias|sa[ií]da|per[ií]odo|\d{1,2}\/\d{1,2}/i, "calendar"],
  [/barco|lancha|catamar|cruzeiro|balsa|mergulho/i, "balsa"],
  [/carro|aluguel|buggy|4x4|jipe|jeep/i, "carro-sedan-na-frente"],
  [/hor[áa]rio|tempo|hora/i, "relogio"],
  [/passeio|tour|roteiro|visita|praia|trilha|city/i, "pino-de-localizacao"],
  [/organiz|planej|sem preocupa/i, "calendar"],
  [/ritmo|tempo|hor[aá]rio/i, "relogio"],
  [/suporte|atendimento|acompanh|soporte/i, "guia-turistico"],
];
const iconFor = (text: string, fallback = "pino-de-localizacao") => {
  for (const [re, name] of ICON_RULES) if (re.test(text)) return name;
  return fallback;
};
/** Ícone PNG monocromático: `tone` branco ou preto (filtro CSS; funciona no html-to-image). */
function Icon({ name, size = 20, tone = "dark", style }: { name: string; size?: number; tone?: "dark" | "light"; style?: CSSProperties }) {
  return (
    <img
      src={`/assets/icons/${name}.png`}
      alt=""
      aria-hidden="true"
      style={{ width: size, height: size, objectFit: "contain", flex: "0 0 auto", filter: tone === "light" ? "brightness(0) invert(1)" : "brightness(0)", ...style }}
    />
  );
}
/** Chip quadrado arredondado com ícone (a "aba do avião" da Clube Turismo). */
function IconChip({ name, bg, size = 40, radius = 12, style }: { name: string; bg: string; size?: number; radius?: number; style?: CSSProperties }) {
  return (
    <span style={{ width: size, height: size, borderRadius: radius, background: bg, display: "grid", placeItems: "center", flex: "0 0 auto", ...style }}>
      <Icon name={name} size={Math.round(size * 0.55)} tone={isLight(bg) ? "dark" : "light"} />
    </span>
  );
}

// ───────── preço no texto ─────────
const PRICE_RE = /(?:(\d{1,2})\s*x\s*)?(?:de\s+|desde\s+)?(?:R\$|US\$|AR\$|€|\$)\s?(\d{1,3}(?:\.\d{3})*|\d+)(?:,(\d{2}))?/i;
function extractPrice(texts: string[]) {
  for (const t of texts) {
    const m = t.match(PRICE_RE);
    if (m) return { installments: m[1] ? `${m[1]}x` : "", int: m[2], cents: m[3] || "", raw: m[0], sym: m[0].match(/R\$|US\$|AR\$|€|\$/)?.[0] || "R$" };
  }
  return null;
}
type Price = NonNullable<ReturnType<typeof extractPrice>>;

// ───────── peças ─────────
const crossOrigin = (src: string): "anonymous" | undefined => (src.startsWith("data:") || src.startsWith("blob:") ? undefined : "anonymous");

function Photo({ src, style, radius = 0 }: { src: string; style: CSSProperties; radius?: number }) {
  if (!src) return <div style={{ ...style, background: "#2A2D33", borderRadius: radius }} />;
  return (
    <div style={{ ...style, overflow: "hidden", borderRadius: radius }}>
      <img src={src} alt="" crossOrigin={crossOrigin(src)} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
    </div>
  );
}

function Logo({ src, dark = false, pos = "right" }: { src: string; dark?: boolean; pos?: "left" | "right" | "center" }) {
  if (!src) return null;
  return (
    <img
      src={src}
      alt=""
      crossOrigin={crossOrigin(src)}
      style={{ position: "absolute", zIndex: 40, top: 18, ...(pos === "center" ? { left: "50%", transform: "translateX(-50%)" } : pos === "left" ? { left: 18 } : { right: 18 }), width: 40, height: 40, borderRadius: 12, objectFit: "contain", padding: 4, background: dark ? "rgba(17,19,24,.92)" : "rgba(255,255,255,.96)", boxShadow: "0 6px 18px rgba(0,0,0,.22)", boxSizing: "border-box" }}
    />
  );
}

function titleSize(text: string, base: number) {
  const n = clean(text).length;
  if (n > 72) return Math.round(base * 0.64);
  if (n > 54) return Math.round(base * 0.74);
  if (n > 38) return Math.round(base * 0.86);
  return base;
}

function Title({ text, color, ff, base, align = "left", maxLines = 4, weight = 800, tight = true, accentWord, accentColor }: { text: string; color: string; ff: string; base: number; align?: "left" | "center"; maxLines?: number; weight?: number; tight?: boolean; accentWord?: boolean; accentColor?: string }) {
  if (!text) return null;
  const size = titleSize(text, base);
  let node: ReactNode = text;
  if (accentWord && accentColor) {
    const words = text.split(" ");
    if (words.length > 2) {
      const last = words.pop();
      node = <>{words.join(" ")} <span style={{ color: accentColor }}>{last}</span></>;
    }
  }
  return (
    <h3 style={{ margin: 0, flexShrink: 0, color, fontFamily: ff, fontSize: size, fontWeight: weight, lineHeight: tight ? 0.98 : 1.08, letterSpacing: tight ? "-0.025em" : "-0.01em", textAlign: align, overflowWrap: "break-word", display: "-webkit-box", WebkitBoxOrient: "vertical", WebkitLineClamp: maxLines, overflow: "hidden" }}>
      {node}
    </h3>
  );
}

function Body({ text, color, ff, size = 14, align = "left", maxLines = 3, weight = 500 }: { text: string; color: string; ff: string; size?: number; align?: "left" | "center"; maxLines?: number; weight?: number }) {
  if (!text) return null;
  return (
    <p style={{ margin: 0, flexShrink: 0, color, fontFamily: ff, fontSize: size, lineHeight: 1.38, fontWeight: weight, textAlign: align, display: "-webkit-box", WebkitBoxOrient: "vertical", WebkitLineClamp: maxLines, overflow: "hidden", overflowWrap: "break-word" }}>
      {text}
    </p>
  );
}

function IconList({ items, color, ff, size = 15, max = 4, chip, iconTone, gap = 10, bold = true }: { items: string[]; color: string; ff: string; size?: number; max?: number; chip?: string; iconTone?: "dark" | "light"; gap?: number; bold?: boolean }) {
  const list = items.map(clean).filter(Boolean).slice(0, max);
  if (!list.length) return null;
  const tone: "dark" | "light" = iconTone ?? (color === "#FFFFFF" || color.startsWith("rgba(255") ? "light" : "dark");
  return (
    <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "grid", gap, flexShrink: 0 }}>
      {list.map((t, i) => (
        <li key={i} style={{ display: "flex", alignItems: "center", gap: 10, color, fontFamily: ff, fontSize: size, lineHeight: 1.25, fontWeight: bold ? 700 : 600, minWidth: 0 }}>
          {chip ? <IconChip name={iconFor(t)} bg={chip} size={Math.round(size * 1.9)} radius={Math.round(size * 0.55)} /> : <Icon name={iconFor(t)} size={Math.round(size * 1.45)} tone={tone} />}
          <span style={{ overflowWrap: "break-word", minWidth: 0 }}>{t}</span>
        </li>
      ))}
    </ul>
  );
}

function SwipePill({ bg, fg, ff, text = tr().swipe }: { bg: string; fg: string; ff: string; text?: string }) {
  return (
    <span style={{ display: "inline-flex", alignSelf: "flex-start", alignItems: "center", gap: 8, padding: "6px 12px 6px 6px", borderRadius: 999, background: bg, color: fg, fontFamily: ff, fontSize: 11, fontWeight: 700, flexShrink: 0 }}>
      <span style={{ width: 20, height: 20, borderRadius: 10, background: fg, color: bg, display: "grid", placeItems: "center", fontSize: 12, fontWeight: 900 }}>→</span>
      {text}
    </span>
  );
}

function PageMark({ index, total, color, ff }: { index: number; total: number; color: string; ff: string }) {
  return <span style={{ color, fontFamily: ff, fontSize: 11, fontWeight: 700, letterSpacing: ".14em", flexShrink: 0 }}>{String(index + 1).padStart(2, "0")}/{String(total).padStart(2, "0")}</span>;
}

function Button({ text, bg, fg, ff, arrow = true, size = 13 }: { text: string; bg: string; fg: string; ff: string; arrow?: boolean; size?: number }) {
  if (!text) return null;
  return (
    <div style={{ display: "inline-flex", alignSelf: "flex-start", alignItems: "center", justifyContent: "center", gap: 10, minHeight: 48, padding: "0 20px 0 22px", borderRadius: 999, background: bg, color: fg, fontFamily: ff, fontSize: size, fontWeight: 800, letterSpacing: ".04em", boxSizing: "border-box", boxShadow: `0 12px 28px ${rgba(bg, 0.35)}`, flexShrink: 0, maxWidth: "100%" }}>
      <span style={{ overflowWrap: "anywhere" }}>{text}</span>
      {arrow && <span style={{ width: 26, height: 26, borderRadius: 13, background: fg, color: bg, display: "grid", placeItems: "center", fontSize: 14, fontWeight: 900, flex: "0 0 auto" }}>→</span>}
    </div>
  );
}

function PriceTag({ price, color, ff, prefix = tr().from, suffix = tr().perPerson, size = 54 }: { price: Price; color: string; ff: string; prefix?: string; suffix?: string; size?: number }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 2, color, fontFamily: ff, flexShrink: 0 }}>
      {prefix && <span style={{ fontSize: Math.round(size * 0.24), fontWeight: 700, letterSpacing: ".06em", textTransform: "uppercase", opacity: 0.85 }}>{prefix}</span>}
      <span style={{ display: "flex", alignItems: "flex-start", gap: 6, lineHeight: 0.9 }}>
        <span style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", fontWeight: 800, fontSize: Math.round(size * 0.3), lineHeight: 1, marginTop: Math.round(size * 0.12) }}>
          {price.installments && <span>{price.installments}</span>}
          <span>{price.sym}</span>
        </span>
        <span style={{ fontSize: size, fontWeight: 900, letterSpacing: "-0.04em" }}>{price.int}</span>
        {price.cents && <span style={{ fontSize: Math.round(size * 0.34), fontWeight: 800, marginTop: Math.round(size * 0.1) }}>,{price.cents}</span>}
      </span>
      {suffix && <span style={{ fontSize: Math.round(size * 0.22), fontWeight: 600, opacity: 0.85 }}>{suffix}</span>}
    </div>
  );
}

function Contacts({ slide, color, ff, size = 14 }: { slide: CarouselSlide; color: string; ff: string; size?: number }) {
  const channels = slide.contactChannels ?? ([slide.phone ? "whatsapp" : null, slide.instagram ? "instagram" : null, slide.email ? "email" : null].filter(Boolean) as string[]);
  const rows: { icon?: string; text: string }[] = [];
  if (channels.includes("whatsapp") && slide.phone) rows.push({ icon: "/social-icons/whatsapp.png", text: formatAdPhone(slide.phone) });
  if (channels.includes("instagram") && slide.instagram) rows.push({ icon: "/social-icons/instagram_bolinha.png", text: slide.instagram.startsWith("@") ? slide.instagram : `@${slide.instagram}` });
  if (channels.includes("email") && slide.email) rows.push({ icon: "/social-icons/email_azul.png", text: slide.email });
  if (slide.website) rows.push({ icon: "/social-icons/site.png", text: slide.website });
  if (!rows.length) return null;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8, flexShrink: 0 }}>
      {rows.map((r, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: 9, color, fontFamily: ff, fontSize: size, fontWeight: 700 }}>
          {r.icon && <img src={r.icon} alt="" aria-hidden="true" style={{ width: Math.round(size * 1.5), height: Math.round(size * 1.5), objectFit: "contain", flex: "0 0 auto" }} />}
          <span style={{ overflowWrap: "anywhere" }}>{r.text}</span>
        </div>
      ))}
    </div>
  );
}

function Frame({ canvasRef, ratio, background, children, ff }: { canvasRef?: ProSlideProps["canvasRef"]; ratio: number; background: string; children: ReactNode; ff: string }) {
  return (
    <div ref={canvasRef} data-carousel-canvas style={{ width: "100%", aspectRatio: `${ratio}`, position: "relative", overflow: "hidden", isolation: "isolate", background, fontFamily: ff, boxSizing: "border-box" }}>
      <div aria-hidden="true" style={{ position: "absolute", inset: 0, background, zIndex: -1 }} />
      {children}
    </div>
  );
}

function NeonBackdrop({ accent, glowAt = "70% 20%" }: { accent: string; glowAt?: string }) {
  return (
    <>
      <div style={{ position: "absolute", inset: 0, backgroundImage: `linear-gradient(${rgba("#ffffff", 0.05)} 1px, transparent 1px), linear-gradient(90deg, ${rgba("#ffffff", 0.05)} 1px, transparent 1px)`, backgroundSize: "36px 36px" }} />
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(circle at ${glowAt}, ${rgba(accent, 0.55)} 0%, ${rgba(accent, 0.18)} 22%, rgba(0,0,0,0) 55%)` }} />
    </>
  );
}

// ───────── modelos ─────────
export function ProSlide(p: ProSlideProps) {
  const { slide, ratio } = p;
  const T = tr();
  const story = ratio < 0.68;
  const ff = slide.fontFamily || "Inter, ui-sans-serif, system-ui, sans-serif";
  const primary = p.primary || "#0B3B8C";
  const secondary = p.secondary || "#FFD400";
  const accent = isLight(secondary) ? secondary : isLight(primary) ? primary : "#FFD400";
  const strong = !isLight(primary) ? primary : !isLight(secondary) ? secondary : INK;
  const kind = slide.kind;
  const title = clean(slide.title);
  const bodyRaw = clean(slide.body);
  const cta = clean(slide.cta) || T.talk;
  const rawLabel = clean(slide.label);
  const label = /^\d+$/.test(rawLabel) ? "" : rawLabel;
  const bullets = slide.bullets.map(clean).filter(Boolean);
  const price = extractPrice([bodyRaw, ...bullets]);
  const body = price && bodyRaw.includes(price.raw) ? clean(bodyRaw.replace(PRICE_RE, "").replace(/\b(a partir de|por pessoa)\b/gi, "").replace(/^[\s,.;:-]+|[\s,.;:-]+$/g, "")) : bodyRaw;
  const bulletsNoPrice = price ? bullets.filter((b) => !b.includes(price.raw)) : bullets;
  const departure = [bodyRaw, ...bullets].map((t) => t.match(/(?:sa[ií](?:ndo|da)|saliendo|salida) (?:de|desde) ([^.,;]+)/i)?.[1]?.trim()).find(Boolean);
  const bodyNoDeparture = clean((departure ? body.replace(/(?:sa[ií](?:ndo|da)|saliendo|salida) (?:de|desde) [^.,;]+[.,;]?/i, "") : body).replace(/^[\s,.;:-]+|[\s,.;:-]+$/g, ""));
  const titleColor = slide.titleStyle?.color;
  const bodyColor = slide.bodyStyle?.color;
  const M = 26;
  const safeTop = story ? 64 : 22;
  const safeBottom = story ? 96 : 26;
  const variant = slide.slideVariant as ProSlideVariant;
  const num = String(p.index + 1).padStart(2, "0");
  const totalStr = String(p.total).padStart(2, "0");

  // ═══════════ NEON (Kriptopix) ═══════════
  if (variant === "pro-bold") {
    const accentFg = onColor(accent);
    const glowCard: CSSProperties = { background: "rgba(14,15,19,.92)", border: `1px solid ${rgba(accent, 0.45)}`, boxShadow: `0 24px 60px rgba(0,0,0,.5), 0 0 40px ${rgba(accent, 0.18)}`, borderRadius: 22 };
    const topBar = (
      <div style={{ position: "absolute", left: M, right: M, top: safeTop, display: "flex", alignItems: "center", justifyContent: "space-between", zIndex: 30 }}>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 8, color: "rgba(255,255,255,.85)", fontFamily: ff, fontSize: 10, fontWeight: 700, letterSpacing: ".16em", textTransform: "uppercase" }}>
          <span style={{ width: 8, height: 8, borderRadius: 4, background: accent, boxShadow: `0 0 12px ${accent}` }} />
          {label || T.trip}
        </span>
        <PageMark index={p.index} total={p.total} color="rgba(255,255,255,.6)" ff={ff} />
      </div>
    );
    if (kind === "cover") {
      return (
        <Frame canvasRef={p.canvasRef} ratio={ratio} background={NIGHT} ff={ff}>
          <NeonBackdrop accent={accent} glowAt="80% 15%" />
          {topBar}
          <Logo src={p.logo} dark pos="center" />
          <div style={{ position: "absolute", left: M, right: M, top: safeTop + 72, display: "flex", flexDirection: "column", gap: 14 }}>
            <Title text={title} color={titleColor || "#FFFFFF"} ff={ff} base={story ? 40 : 36} maxLines={3} accentWord accentColor={accent} />
            <Body text={bodyNoDeparture} color={bodyColor || "rgba(255,255,255,.72)"} ff={ff} size={13} maxLines={2} />
            <SwipePill bg={accent} fg={accentFg} ff={ff} />
          </div>
          <div style={{ position: "absolute", left: M, right: M, bottom: safeBottom, top: story ? "54%" : "56%", ...glowCard, overflow: "hidden" }}>
            <Photo src={slide.imageUrl} style={{ position: "absolute", inset: 0 }} />
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(10,11,14,0) 45%, rgba(10,11,14,.9) 100%)" }} />
            <div style={{ position: "absolute", left: 14, right: 14, bottom: 14, display: "flex", gap: 8, flexWrap: "wrap", alignItems: "flex-end" }}>
              {price ? (
                <PriceTag price={price} color="#FFFFFF" ff={ff} size={40} />
              ) : (
                bulletsNoPrice.slice(0, 3).map((b, i) => (
                  <span key={i} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 10px", borderRadius: 999, background: "rgba(255,255,255,.1)", border: "1px solid rgba(255,255,255,.18)", color: "#fff", fontFamily: ff, fontSize: 10.5, fontWeight: 700 }}>
                    <Icon name={iconFor(b)} size={13} tone="light" />{b}
                  </span>
                ))
              )}
            </div>
          </div>
        </Frame>
      );
    }
    if (kind === "content") {
      const photoH = story ? "28%" : "30%";
      return (
        <Frame canvasRef={p.canvasRef} ratio={ratio} background={NIGHT} ff={ff}>
          <NeonBackdrop accent={accent} glowAt="15% 85%" />
          {topBar}
          <Logo src={p.logo} dark pos="center" />
          <div style={{ position: "absolute", left: M, right: M, top: safeTop + 58, bottom: safeBottom, display: "flex", flexDirection: "column" }}>
          <Photo src={slide.imageUrl} style={{ flex: "1 1 0", minHeight: 90 }} radius={18} />
          <div style={{ position: "relative", flexShrink: 0, marginTop: -18, ...glowCard, padding: "18px 20px", display: "flex", flexDirection: "column", gap: 12, boxSizing: "border-box", overflow: "hidden" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
              <span style={{ width: 40, height: 40, borderRadius: 12, background: accent, color: accentFg, display: "grid", placeItems: "center", fontFamily: ff, fontSize: 16, fontWeight: 900, boxShadow: `0 0 18px ${rgba(accent, 0.6)}` }}>{num}</span>
              <span style={{ flex: 1, height: 1, backgroundImage: `linear-gradient(90deg, ${accent} 50%, transparent 50%)`, backgroundSize: "8px 1px", opacity: 0.6 }} />
              <Icon name={iconFor(title + " " + bodyRaw)} size={22} tone="light" />
            </div>
            <Title text={title} color={titleColor || "#FFFFFF"} ff={ff} base={26} maxLines={3} />
            <Body text={bodyNoDeparture} color={bodyColor || "rgba(255,255,255,.7)"} ff={ff} size={12.5} maxLines={bulletsNoPrice.length > 3 ? 2 : 3} />
            {price ? <PriceTag price={price} color={accent} ff={ff} size={44} /> : <IconList items={bulletsNoPrice} color="#FFFFFF" ff={ff} size={12.5} chip={rgba(accent, 0.16)} iconTone="light" gap={7} />}
          </div>
          </div>
        </Frame>
      );
    }
    return (
      <Frame canvasRef={p.canvasRef} ratio={ratio} background={NIGHT} ff={ff}>
        <NeonBackdrop accent={accent} glowAt="50% 100%" />
        {topBar}
        <Logo src={p.logo} dark pos="center" />
        <div style={{ position: "absolute", left: M, right: M, top: safeTop + 90, height: 70 }}>
          <div style={{ position: "absolute", left: 14, right: 14, top: 32, borderTop: `2px dashed ${rgba(accent, 0.5)}` }} />
          {[0, 50, 100].map((x, i) => (
            <span key={i} style={{ position: "absolute", left: `calc(${x}% - 14px)`, top: 18, width: 28, height: 28, borderRadius: 14, background: i === 2 ? accent : "rgba(14,15,19,.95)", border: `2px solid ${accent}`, display: "grid", placeItems: "center", boxShadow: i === 2 ? `0 0 18px ${rgba(accent, 0.7)}` : "none" }}>
              <Icon name={i === 0 ? "pino-de-localizacao" : i === 1 ? "aviao" : "placa-do-hotel"} size={14} tone={i === 2 ? (isLight(accent) ? "dark" : "light") : "light"} />
            </span>
          ))}
        </div>
        <div style={{ position: "absolute", left: M, right: M, bottom: safeBottom, display: "flex", flexDirection: "column", gap: 14 }}>
          <Title text={title} color={titleColor || "#FFFFFF"} ff={ff} base={34} maxLines={4} accentWord accentColor={accent} />
          <Body text={bodyNoDeparture} color={bodyColor || "rgba(255,255,255,.72)"} ff={ff} size={13} maxLines={2} />
          <Button text={cta} bg={accent} fg={accentFg} ff={ff} />
          <Contacts slide={slide} color="#FFFFFF" ff={ff} />
        </div>
      </Frame>
    );
  }

  // ═══════════ OFERTA (Clube Turismo) ═══════════
  if (variant === "pro-split") {
    const cardBg = strong;
    const cardFg = onColor(cardBg);
    const stripe = accent;
    const tagline = bodyNoDeparture || T.tagline;
    if (kind === "cover") {
      return (
        <Frame canvasRef={p.canvasRef} ratio={ratio} background={NIGHT} ff={ff}>
          <Photo src={slide.imageUrl} style={{ position: "absolute", inset: 0 }} />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(0,0,0,.05), rgba(0,0,0,.35) 100%)" }} />
          <Logo src={p.logo} />
          <div style={{ position: "absolute", left: M, right: story ? "16%" : "12%", bottom: safeBottom + 18, background: cardBg, color: cardFg, borderRadius: 22, boxShadow: "0 24px 60px rgba(0,0,0,.35)" }}>
            <div style={{ padding: "18px 18px 14px", display: "flex", flexDirection: "column", gap: 8 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontFamily: ff, fontSize: 24, fontWeight: 900, letterSpacing: "-0.02em", flexShrink: 0 }}>{label || T.offer}</span>
                <span style={{ width: 1.5, height: 26, background: rgba(cardFg, 0.5), flexShrink: 0 }} />
                <div style={{ flex: "1 1 0", minWidth: 0 }}><Body text={tagline} color={cardFg} ff={ff} size={11} maxLines={2} weight={600} /></div>
              </div>
              <Title text={title} color={titleColor || cardFg} ff={ff} base={story ? 34 : 32} maxLines={4} weight={900} />
              {departure && (
                <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontFamily: ff, fontSize: 12, fontWeight: 700 }}>
                  <Icon name="pino-de-localizacao" size={14} tone={isLight(cardBg) ? "dark" : "light"} /> {T.leaving} {departure}
                </span>
              )}
              {bulletsNoPrice.length > 0 && (
                <div style={{ fontFamily: ff, fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: ".02em", lineHeight: 1.3, opacity: 0.95 }}>
                  {bulletsNoPrice.slice(0, 3).join(" + ")}
                </div>
              )}
            </div>
            <div style={{ position: "relative", background: "#FFFFFF", color: cardBg, borderRadius: "0 0 22px 22px", overflow: "hidden" }}>
              <IconChip name="aviao" bg={stripe} size={44} radius={0} style={{ position: "absolute", left: 0, top: 0, borderRadius: "0 0 14px 0" }} />
              <div style={{ padding: "14px 18px 0 62px" }}>
                {price ? <PriceTag price={price} color={readableOn(cardBg, "#FFFFFF")} ff={ff} size={50} /> : <Title text={T.askPrices} color={readableOn(cardBg, "#FFFFFF")} ff={ff} base={20} maxLines={2} />}
              </div>
              <div style={{ marginTop: 12, background: stripe, color: onColor(stripe), textAlign: "center", padding: "9px 0", fontFamily: ff, fontSize: 13, fontWeight: 800 }}>{T.askUs} →</div>
            </div>
          </div>
          <div style={{ position: "absolute", left: M, right: M, bottom: safeBottom - 14, display: "flex", justifyContent: "space-between", color: "rgba(255,255,255,.85)", fontFamily: ff, fontSize: 9.5, fontWeight: 600 }}>
            <span>{T.fareNote}</span>
            <PageMark index={p.index} total={p.total} color="rgba(255,255,255,.85)" ff={ff} />
          </div>
        </Frame>
      );
    }
    if (kind === "content") {
      return (
        <Frame canvasRef={p.canvasRef} ratio={ratio} background={NIGHT} ff={ff}>
          <Photo src={slide.imageUrl} style={{ position: "absolute", inset: 0 }} />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(0,0,0,.05), rgba(0,0,0,.4) 100%)" }} />
          <Logo src={p.logo} />
          <div style={{ position: "absolute", left: M, right: M, bottom: safeBottom + 18, background: cardBg, color: cardFg, borderRadius: 22, boxShadow: "0 24px 60px rgba(0,0,0,.35)", padding: "18px 18px 20px", display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ width: 38, height: 38, borderRadius: 10, background: stripe, color: onColor(stripe), display: "grid", placeItems: "center", fontFamily: ff, fontSize: 15, fontWeight: 900, flexShrink: 0 }}>{num}</span>
              <span style={{ fontFamily: ff, fontSize: 11, fontWeight: 800, letterSpacing: ".14em", textTransform: "uppercase", opacity: 0.9 }}>{label}</span>
            </div>
            <Title text={title} color={titleColor || cardFg} ff={ff} base={27} maxLines={3} weight={900} />
            <Body text={bodyNoDeparture} color={bodyColor || cardFg} ff={ff} size={12.5} maxLines={3} />
            {price ? <PriceTag price={price} color={cardFg} ff={ff} size={46} /> : <IconList items={bulletsNoPrice} color={cardFg} ff={ff} size={13} chip={stripe} gap={8} />}
          </div>
          <div style={{ position: "absolute", right: M, bottom: safeBottom - 14 }}><PageMark index={p.index} total={p.total} color="rgba(255,255,255,.85)" ff={ff} /></div>
        </Frame>
      );
    }
    return (
      <Frame canvasRef={p.canvasRef} ratio={ratio} background={cardBg} ff={ff}>
        <Photo src={slide.imageUrl} style={{ position: "absolute", left: 0, right: 0, top: 0, height: "46%" }} />
        <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: "46%", background: `linear-gradient(180deg, rgba(0,0,0,0) 50%, ${cardBg} 100%)` }} />
        <Logo src={p.logo} />
        <div style={{ position: "absolute", left: M, right: M, top: "42%", bottom: safeBottom, display: "flex", flexDirection: "column", gap: 14, color: cardFg }}>
          <div style={{ display: "flex", gap: 8 }}>
            {["aviao", "onibus", "placa-do-hotel", "cafe-da-manha"].map((n) => <IconChip key={n} name={n} bg={stripe} size={34} radius={9} />)}
          </div>
          <Title text={title} color={titleColor || cardFg} ff={ff} base={32} maxLines={3} weight={900} />
          <Body text={bodyNoDeparture} color={bodyColor || cardFg} ff={ff} size={13} maxLines={2} />
          <Button text={cta} bg={stripe} fg={onColor(stripe)} ff={ff} />
          <Contacts slide={slide} color={cardFg} ff={ff} />
        </div>
      </Frame>
    );
  }

  // ═══════════ ENSEADA ("3 praias em 1 dia") ═══════════
  if (variant === "pro-magazine") {
    const paper = isLight(secondary) && secondary.toLowerCase() !== "#ffffff" ? secondary : CREAM;
    const ink = readableOn(strong, paper);
    const bar = strong;
    const barFg = onColor(bar);
    // Bloco claro com a altura do conteúdo; a foto ocupa o que sobrar (mínimo dado).
    const block = (children: ReactNode, minPhoto = "30%") => (
      <>
        <Logo src={p.logo} pos="right" />
        <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column" }}>
          <div style={{ background: paper, padding: `${safeTop + 44}px ${M}px 22px`, display: "flex", flexDirection: "column", gap: 12, flexShrink: 0 }}>{children}</div>
          <div style={{ flex: 1, minHeight: minPhoto, position: "relative" }}>
            <Photo src={slide.imageUrl} style={{ position: "absolute", inset: 0 }} />
          </div>
        </div>
      </>
    );
    if (kind === "cover") {
      return (
        <Frame canvasRef={p.canvasRef} ratio={ratio} background={paper} ff={ff}>
          {block(
            <>
              <Title text={title} color={titleColor || ink} ff={ff} base={story ? 44 : 40} maxLines={4} weight={900} />
              <span style={{ alignSelf: "flex-start", display: "inline-flex", alignItems: "center", gap: 8, background: bar, color: barFg, padding: "8px 14px", fontFamily: ff, fontSize: 14, fontWeight: 600, maxWidth: "100%", flexShrink: 0 }}>
                {departure ? `${T.leaving} ${departure}` : bodyNoDeparture || label}
                <Icon name="pino-de-localizacao" size={15} tone={isLight(bar) ? "dark" : "light"} />
              </span>
              <div style={{ display: "flex", alignItems: "stretch", gap: 14, marginTop: 4, flexShrink: 0, flexWrap: "wrap" }}>
                <IconList items={bulletsNoPrice} color={ink} ff={ff} size={15} max={3} gap={8} bold={false} />
                <span style={{ width: 2, background: ink, opacity: 0.8, margin: "2px 0" }} />
                <div style={{ display: "flex", alignItems: "center", minWidth: 0 }}>
                  {price ? <PriceTag price={price} color={ink} ff={ff} prefix={T.fromLower} suffix={T.perPersonShort} size={38} /> : <SwipePill bg={bar} fg={barFg} ff={ff} text={T.swipeShort} />}
                </div>
              </div>
            </>,
          )}
          <div style={{ position: "absolute", left: M, bottom: safeBottom - 8, color: "#fff", fontFamily: ff, fontSize: 11, fontWeight: 700, letterSpacing: ".14em", textShadow: "0 2px 8px rgba(0,0,0,.6)" }}>{num}/{totalStr} · {T.swipeCaps} →</div>
        </Frame>
      );
    }
    if (kind === "content") {
      return (
        <Frame canvasRef={p.canvasRef} ratio={ratio} background={paper} ff={ff}>
          {block(
            <>
              <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
                <span style={{ fontFamily: ff, fontSize: 44, fontWeight: 900, color: ink, lineHeight: 1, letterSpacing: "-0.04em" }}>{num}</span>
                <span style={{ background: bar, color: barFg, padding: "6px 12px", fontFamily: ff, fontSize: 11, fontWeight: 800, letterSpacing: ".12em", textTransform: "uppercase" }}>{label || T.itinerary}</span>
              </div>
              <Title text={title} color={titleColor || ink} ff={ff} base={30} maxLines={3} weight={900} />
              <Body text={bodyNoDeparture} color={bodyColor || INK_SOFT} ff={ff} size={13} maxLines={2} />
              <div style={{ display: "flex", alignItems: "stretch", gap: 16, flexShrink: 0 }}>
                <IconList items={bulletsNoPrice} color={ink} ff={ff} size={14} max={4} gap={7} bold={false} />
                {price && <><span style={{ width: 2, background: ink, opacity: 0.8 }} /><div style={{ display: "flex", alignItems: "center", minWidth: 0 }}><PriceTag price={price} color={ink} ff={ff} prefix={T.by} suffix={T.perPersonShort} size={36} /></div></>}
              </div>
            </>,
          )}
          <div style={{ position: "absolute", right: M, bottom: safeBottom - 8, color: "#fff", fontFamily: ff, fontSize: 11, fontWeight: 700, letterSpacing: ".14em", textShadow: "0 2px 8px rgba(0,0,0,.6)" }}>{num}/{totalStr}</div>
        </Frame>
      );
    }
    return (
      <Frame canvasRef={p.canvasRef} ratio={ratio} background={paper} ff={ff}>
        {block(
          <>
            <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
              {["aviao", "onibus", "placa-do-hotel", "guia-turistico"].map((n) => <IconChip key={n} name={n} bg={bar} size={36} radius={10} />)}
            </div>
            <Title text={title} color={titleColor || ink} ff={ff} base={34} maxLines={3} weight={900} />
            <Body text={bodyNoDeparture} color={bodyColor || INK_SOFT} ff={ff} size={13} maxLines={2} />
            <Button text={cta} bg={bar} fg={barFg} ff={ff} />
            <Contacts slide={slide} color={ink} ff={ff} />
          </>,
          "24%",
        )}
      </Frame>
    );
  }

  // ═══════════ CONHEÇA ("Conheça Maragogi!") ═══════════
  const panel = CREAM;
  const teal = strong === INK ? "#0E7C86" : strong;
  const tealFg = onColor(teal);
  const tealText = readableOn(teal, panel);
  const panelW = story ? "60%" : "52%";
  const panelInner = `calc(${panelW} - ${M + 18}px)`;
  const titleBlock = (text: string, base: number) => (
    <div style={{ alignSelf: "flex-start", marginLeft: -M, width: `calc(100% + ${M + 58}px)`, background: teal, color: tealFg, padding: "14px 18px 16px 26px", borderRadius: "0 14px 14px 0", boxShadow: "0 18px 40px rgba(0,0,0,.28)", boxSizing: "border-box", flexShrink: 0, zIndex: 5 }}>
      <Title text={text} color={titleColor || tealFg} ff={ff} base={base} maxLines={4} weight={900} />
    </div>
  );
  if (kind === "cover") {
    return (
      <Frame canvasRef={p.canvasRef} ratio={ratio} background={panel} ff={ff}>
        <Photo src={slide.imageUrl} style={{ position: "absolute", top: 0, bottom: 0, right: 0, left: panelW }} />
        <Logo src={p.logo} pos="left" />
        <div style={{ position: "absolute", left: M, width: panelInner, top: safeTop + 64, bottom: safeBottom, display: "flex", flexDirection: "column", gap: 14 }}>
          {titleBlock(title, story ? 32 : 30)}
          <span style={{ flex: 1 }} />
          <Body text={bodyNoDeparture} color={bodyColor || INK_SOFT} ff={ff} size={12.5} maxLines={3} />
          <IconList items={bulletsNoPrice} color={tealText} ff={ff} size={16} max={3} gap={10} iconTone="dark" />
          {price ? (
            <div style={{ alignSelf: "flex-start", background: teal, color: tealFg, borderRadius: 12, padding: "8px 14px", display: "flex", alignItems: "center", gap: 10, fontFamily: ff, flexShrink: 0 }}>
              <span style={{ fontSize: 10, lineHeight: 1.15, fontWeight: 600, whiteSpace: "nowrap" }}>{T.from}<br /><b style={{ fontSize: 14 }}>{price.installments ? `${price.installments} ` : ""}{price.sym}</b></span>
              <span style={{ fontSize: 28, fontWeight: 900, letterSpacing: "-0.03em", whiteSpace: "nowrap" }}>{price.int}<span style={{ fontSize: 14 }}>{price.cents ? `,${price.cents}` : ""}</span></span>
            </div>
          ) : (
            <SwipePill bg={teal} fg={tealFg} ff={ff} />
          )}
          <span style={{ height: 3, width: "100%", background: teal, marginTop: 4, flexShrink: 0 }} />
        </div>
      </Frame>
    );
  }
  if (kind === "content") {
    const flip = p.index % 2 === 0;
    return (
      <Frame canvasRef={p.canvasRef} ratio={ratio} background={panel} ff={ff}>
        <Photo src={slide.imageUrl} style={{ position: "absolute", top: 0, bottom: 0, ...(flip ? { left: 0, width: `calc(100% - ${panelW})` } : { right: 0, width: `calc(100% - ${panelW})` }) }} />
        <Logo src={p.logo} pos={flip ? "right" : "left"} />
        <div style={{ position: "absolute", top: safeTop + 40, bottom: safeBottom, ...(flip ? { right: M } : { left: M }), width: panelInner, display: "flex", flexDirection: "column", justifyContent: "center", gap: 12 }}>
          <span style={{ alignSelf: "flex-start", background: teal, color: tealFg, borderRadius: 10, padding: "6px 12px", fontFamily: ff, fontSize: 18, fontWeight: 900, flexShrink: 0 }}>{num}</span>
          <Title text={title} color={titleColor || tealText} ff={ff} base={27} maxLines={4} weight={900} />
          <Body text={bodyNoDeparture} color={bodyColor || INK_SOFT} ff={ff} size={12.5} maxLines={3} />
          {price ? <PriceTag price={price} color={tealText} ff={ff} size={40} /> : <IconList items={bulletsNoPrice} color={tealText} ff={ff} size={14} max={4} gap={8} iconTone="dark" />}
          <span style={{ height: 3, width: 60, background: teal, flexShrink: 0 }} />
        </div>
      </Frame>
    );
  }
  return (
    <Frame canvasRef={p.canvasRef} ratio={ratio} background={panel} ff={ff}>
      <Photo src={slide.imageUrl} style={{ position: "absolute", top: 0, bottom: 0, right: 0, left: "62%" }} />
      <Logo src={p.logo} pos="left" />
      <div style={{ position: "absolute", left: M, width: `calc(62% - ${M + 18}px)`, top: safeTop + 64, bottom: safeBottom, display: "flex", flexDirection: "column", gap: 14 }}>
        {titleBlock(title, 28)}
        <span style={{ flex: 1 }} />
        <Body text={bodyNoDeparture} color={bodyColor || INK_SOFT} ff={ff} size={12.5} maxLines={3} />
        <Button text={cta} bg={teal} fg={tealFg} ff={ff} size={11} />
        <Contacts slide={slide} color={INK} ff={ff} size={13} />
        <span style={{ flex: 1 }} />
        <span style={{ height: 3, width: "100%", background: teal, flexShrink: 0 }} />
      </div>
    </Frame>
  );
}
