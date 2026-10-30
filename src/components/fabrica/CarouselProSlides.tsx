/**
 * MODELOS PRO DO CARROSSEL — quatro famílias modeladas nas referências de mercado,
 * com as regras da skill `design-artes-fabrica`:
 * - um ponto focal por slide (título grande ou foto), hierarquia clara;
 * - cor de destaque só em detalhes (filete, numeral, botão); nunca pílula ao lado de texto branco;
 * - mesma margem e mesmo eixo em todos os slides; indicador de página e "arraste" na capa;
 * - painéis com a altura do conteúdo.
 *
 * Base de desenho: 432px de largura (como o CarouselCanvas); altura = 432 / ratio.
 */
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
const isLight = (hex: string) => luminance(hex) > 0.45;
const onColor = (hex: string) => (isLight(hex) ? "#111318" : "#FFFFFF");
const INK = "#111318";
const INK_SOFT = "#3A3F47";
const PAPER = "#F7F6F2";
const CREAM = "#F3EEE4";
const NIGHT = "#0B0C0F";

const clean = (s?: string) => (s || "").replace(/\s+/g, " ").trim();

// ───────── peças compartilhadas ─────────
const crossOrigin = (src: string) => (src.startsWith("data:") || src.startsWith("blob:") ? undefined : "anonymous");

function Photo({ src, style, radius = 0, focus = "center" }: { src: string; style: CSSProperties; radius?: number; focus?: string }) {
  if (!src) return <div style={{ ...style, background: "#2A2D33", borderRadius: radius }} />;
  return (
    <div style={{ ...style, overflow: "hidden", borderRadius: radius }}>
      <img src={src} alt="" crossOrigin={crossOrigin(src)} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: focus, display: "block" }} />
    </div>
  );
}

function Logo({ src, light = true }: { src: string; light?: boolean }) {
  if (!src) return null;
  return (
    <img
      src={src}
      alt=""
      crossOrigin={crossOrigin(src)}
      style={{ position: "absolute", zIndex: 40, top: 20, right: 20, width: 38, height: 38, borderRadius: 10, objectFit: "contain", padding: 4, background: light ? "rgba(255,255,255,.96)" : "rgba(17,19,24,.9)", boxShadow: "0 6px 18px rgba(0,0,0,.22)", boxSizing: "border-box" }}
    />
  );
}

function Kicker({ text, color, ff, align = "left" }: { text: string; color: string; ff: string; align?: "left" | "center" }) {
  if (!text) return null;
  return (
    <div style={{ display: "flex", flexShrink: 0, alignItems: "center", justifyContent: align === "center" ? "center" : "flex-start", gap: 8, color, fontFamily: ff, fontSize: 10, fontWeight: 800, letterSpacing: ".2em", textTransform: "uppercase", lineHeight: 1.2 }}>
      <span style={{ width: 20, height: 2, background: color, flex: "0 0 auto" }} />
      <span>{text}</span>
    </div>
  );
}

function titleSize(text: string, base: number) {
  const n = clean(text).length;
  if (n > 72) return Math.round(base * 0.68);
  if (n > 54) return Math.round(base * 0.78);
  if (n > 38) return Math.round(base * 0.88);
  return base;
}

function Title({ text, color, ff, base, serif = false, align = "left", maxLines = 4, italic = false }: { text: string; color: string; ff: string; base: number; serif?: boolean; align?: "left" | "center"; maxLines?: number; italic?: boolean }) {
  if (!text) return null;
  const size = titleSize(text, base);
  return (
    <h3 style={{ margin: 0, flexShrink: 0, color, fontFamily: serif ? "'Playfair Display', Georgia, serif" : ff, fontSize: size, fontWeight: serif ? 700 : 800, fontStyle: italic ? "italic" : "normal", lineHeight: serif ? 1.04 : 0.98, letterSpacing: serif ? "0" : "-0.02em", textAlign: align, overflowWrap: "break-word", display: "-webkit-box", WebkitBoxOrient: "vertical", WebkitLineClamp: maxLines, overflow: "hidden" }}>
      {text}
    </h3>
  );
}

function Body({ text, color, ff, size = 14, align = "left", maxLines = 3 }: { text: string; color: string; ff: string; size?: number; align?: "left" | "center"; maxLines?: number }) {
  if (!text) return null;
  return (
    <p style={{ margin: 0, flexShrink: 0, color, fontFamily: ff, fontSize: size, lineHeight: 1.4, fontWeight: 500, textAlign: align, display: "-webkit-box", WebkitBoxOrient: "vertical", WebkitLineClamp: maxLines, overflow: "hidden", overflowWrap: "break-word" }}>
      {text}
    </p>
  );
}

function Bullets({ items, color, accent, ff, kind = "bar", max = 4, size = 13 }: { items: string[]; color: string; accent: string; ff: string; kind?: "bar" | "check" | "number" | "dash"; max?: number; size?: number }) {
  const list = items.map(clean).filter(Boolean).slice(0, max);
  if (!list.length) return null;
  return (
    <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "grid", gap: 8, flexShrink: 0 }}>
      {list.map((t, i) => (
        <li key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10, color, fontFamily: ff, fontSize: size, lineHeight: 1.3, fontWeight: 600 }}>
          {kind === "bar" && <span style={{ width: 4, height: size * 1.1, borderRadius: 2, background: accent, flex: "0 0 auto", marginTop: 2 }} />}
          {kind === "check" && (
            <span style={{ width: 18, height: 18, borderRadius: 9, background: accent, color: onColor(accent), fontSize: 11, fontWeight: 900, display: "grid", placeItems: "center", flex: "0 0 auto" }}>✓</span>
          )}
          {kind === "number" && <span style={{ color: accent, fontWeight: 800, fontSize: size - 1, minWidth: 22, letterSpacing: ".04em" }}>{String(i + 1).padStart(2, "0")}</span>}
          {kind === "dash" && <span style={{ width: 14, height: 1.5, background: accent, flex: "0 0 auto", marginTop: size * 0.6 }} />}
          <span style={{ overflowWrap: "break-word", minWidth: 0 }}>{t}</span>
        </li>
      ))}
    </ul>
  );
}

function PageMark({ index, total, color, ff, swipe = false, swipeText = "arraste" }: { index: number; total: number; color: string; ff: string; swipe?: boolean; swipeText?: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", color, fontFamily: ff, fontSize: 11, fontWeight: 700, letterSpacing: ".12em", textTransform: "uppercase" }}>
      <span>{String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}</span>
      {swipe ? <span>{swipeText} →</span> : <span />}
    </div>
  );
}

function Button({ text, bg, fg, ff, outline = false, full = true }: { text: string; bg: string; fg: string; ff: string; outline?: boolean; full?: boolean }) {
  if (!text) return null;
  return (
    <div style={{ display: full ? "flex" : "inline-flex", alignItems: "center", justifyContent: "center", minHeight: 50, padding: "0 22px", borderRadius: 12, background: outline ? "transparent" : bg, color: outline ? bg : fg, border: outline ? `2px solid ${bg}` : "none", fontFamily: ff, fontSize: 13, fontWeight: 800, letterSpacing: ".08em", textTransform: "uppercase", textAlign: "center", boxSizing: "border-box", boxShadow: outline ? "none" : "0 10px 26px rgba(0,0,0,.18)" }}>
      {text}
    </div>
  );
}

function Contacts({ slide, color, ff }: { slide: CarouselSlide; color: string; ff: string }) {
  const channels = slide.contactChannels ?? ([slide.phone ? "whatsapp" : null, slide.instagram ? "instagram" : null, slide.email ? "email" : null].filter(Boolean) as string[]);
  const rows: { icon?: string; text: string }[] = [];
  if (channels.includes("whatsapp") && slide.phone) rows.push({ icon: "/social-icons/whatsapp.png", text: slide.phone });
  if (channels.includes("instagram") && slide.instagram) rows.push({ icon: "/social-icons/instagram_bolinha.png", text: slide.instagram.startsWith("@") ? slide.instagram : `@${slide.instagram}` });
  if (channels.includes("email") && slide.email) rows.push({ text: slide.email });
  if (slide.website) rows.push({ text: slide.website });
  if (!rows.length) return null;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {rows.map((r, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: 9, color, fontFamily: ff, fontSize: 14, fontWeight: 700 }}>
          {r.icon && <img src={r.icon} alt="" aria-hidden="true" style={{ width: 20, height: 20, objectFit: "contain", flex: "0 0 auto" }} />}
          <span style={{ overflowWrap: "anywhere" }}>{r.text}</span>
        </div>
      ))}
    </div>
  );
}

function Frame({ canvasRef, ratio, background, children, ff }: { canvasRef?: ProSlideProps["canvasRef"]; ratio: number; background: string; children: ReactNode; ff: string }) {
  return (
    <div ref={canvasRef} data-carousel-canvas style={{ width: "100%", aspectRatio: `${ratio}`, position: "relative", overflow: "hidden", isolation: "isolate", background, fontFamily: ff, boxSizing: "border-box" }}>
      {children}
    </div>
  );
}

// ───────── modelos ─────────
export function ProSlide(p: ProSlideProps) {
  const { slide, ratio } = p;
  const story = ratio < 0.68;
  const ff = slide.fontFamily || "Inter, ui-sans-serif, system-ui, sans-serif";
  const primary = p.primary || "#0B3B8C";
  const secondary = p.secondary || "#FFD400";
  // destaque sobre fundo escuro: a cor clara da marca; se as duas forem escuras, branco
  const accentOnDark = isLight(secondary) ? secondary : isLight(primary) ? primary : "#FFFFFF";
  // cor "forte" da marca para botões e blocos: a escura; se as duas forem claras, escurece a principal
  const strong = !isLight(primary) ? primary : !isLight(secondary) ? secondary : INK;
  const kind = slide.kind;
  const title = clean(slide.title);
  const body = clean(slide.body);
  const cta = clean(slide.cta) || "Fale com a gente";
  const label = clean(slide.label);
  const titleColor = slide.titleStyle?.color;
  const bodyColor = slide.bodyStyle?.color;
  const M = 28; // margem lateral/base
  const safeTop = story ? 64 : 24;
  const safeBottom = story ? 96 : M;
  const ctx = { slide, index: p.index, total: p.total, ff };
  const variant = slide.slideVariant as ProSlideVariant;

  // ── BOLD: foto + título enorme, numeral grande no miolo, fechamento na cor forte ──
  if (variant === "pro-bold") {
    if (kind === "cover") {
      return (
        <Frame canvasRef={p.canvasRef} ratio={ratio} background={NIGHT} ff={ff}>
          <Photo src={slide.imageUrl} style={{ position: "absolute", inset: 0 }} />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(0,0,0,.18) 0%, rgba(0,0,0,0) 30%, rgba(0,0,0,.55) 58%, rgba(0,0,0,.94) 100%)" }} />
          <Logo src={p.logo} />
          <div style={{ position: "absolute", left: M, right: M, bottom: safeBottom, display: "grid", gap: 14 }}>
            <Kicker text={label} color={accentOnDark} ff={ff} />
            <Title text={title} color={titleColor || "#FFFFFF"} ff={ff} base={story ? 46 : 42} />
            <Body text={body} color={bodyColor || "rgba(255,255,255,.85)"} ff={ff} maxLines={2} />
            <div style={{ height: 2, width: 44, background: accentOnDark, marginTop: 2 }} />
            <PageMark {...ctx} color="rgba(255,255,255,.75)" swipe />
          </div>
        </Frame>
      );
    }
    if (kind === "content") {
      const photoH = story ? "44%" : "46%";
      return (
        <Frame canvasRef={p.canvasRef} ratio={ratio} background={NIGHT} ff={ff}>
          <Photo src={slide.imageUrl} style={{ position: "absolute", left: 0, right: 0, top: 0, height: photoH }} />
          <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: photoH, background: `linear-gradient(180deg, rgba(11,12,15,0) 55%, ${NIGHT} 100%)` }} />
          <Logo src={p.logo} />
          <div style={{ position: "absolute", left: M, right: M, top: `calc(${photoH} - 34px)`, bottom: safeBottom, display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ color: accentOnDark, fontFamily: ff, fontSize: 64, fontWeight: 900, lineHeight: 0.9, letterSpacing: "-0.04em" }}>{String(p.index + 1).padStart(2, "0")}</div>
            <Title text={title} color={titleColor || "#FFFFFF"} ff={ff} base={30} maxLines={3} />
            <Body text={body} color={bodyColor || "rgba(255,255,255,.78)"} ff={ff} maxLines={3} />
            <Bullets items={slide.bullets} color="#FFFFFF" accent={accentOnDark} ff={ff} kind="bar" />
            <div style={{ marginTop: "auto" }}><PageMark {...ctx} color="rgba(255,255,255,.55)" /></div>
          </div>
        </Frame>
      );
    }
    const bg = strong === INK && !isLight(primary) ? primary : strong;
    const fg = onColor(bg);
    return (
      <Frame canvasRef={p.canvasRef} ratio={ratio} background={bg} ff={ff}>
        <Logo src={p.logo} light={!isLight(bg)} />
        <div style={{ position: "absolute", left: M, right: M, top: safeTop + 60, bottom: safeBottom, display: "flex", flexDirection: "column", justifyContent: "flex-end", gap: 16 }}>
          <Kicker text={label} color={accentOnDark === bg ? fg : (isLight(bg) ? INK : accentOnDark)} ff={ff} />
          <Title text={title} color={titleColor || fg} ff={ff} base={38} maxLines={4} />
          <Body text={body} color={bodyColor || fg} ff={ff} maxLines={2} />
          <Button text={cta} bg={isLight(bg) ? INK : accentOnDark} fg={isLight(bg) ? "#FFFFFF" : onColor(accentOnDark)} ff={ff} />
          <Contacts slide={slide} color={fg} ff={ff} />
        </div>
      </Frame>
    );
  }

  // ── SPLIT: foto em cima, painel claro com faixa de título na emenda (CVC / "Conheça") ──
  if (variant === "pro-split") {
    const panelFg = INK;
    if (kind === "cover") {
      const photoH = story ? "56%" : "54%";
      return (
        <Frame canvasRef={p.canvasRef} ratio={ratio} background={PAPER} ff={ff}>
          <Photo src={slide.imageUrl} style={{ position: "absolute", left: 0, right: 0, top: 0, height: photoH }} />
          <Logo src={p.logo} />
          <div style={{ position: "absolute", left: 0, right: 0, top: photoH, bottom: 0, background: PAPER }} />
          <div style={{ position: "absolute", left: M, right: M, top: `calc(${photoH} - 30px)`, bottom: safeBottom, display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ alignSelf: "flex-start", maxWidth: "100%", background: strong, color: onColor(strong), padding: "12px 18px", borderRadius: 10, boxShadow: "0 10px 26px rgba(0,0,0,.18)" }}>
              <Title text={title} color={titleColor || onColor(strong)} ff={ff} base={28} maxLines={3} />
            </div>
            <Body text={body} color={bodyColor || INK_SOFT} ff={ff} maxLines={2} />
            <Bullets items={slide.bullets} color={panelFg} accent={strong} ff={ff} kind="check" max={title.length > 54 ? 2 : 3} />
            <div style={{ marginTop: "auto" }}><PageMark {...ctx} color={INK_SOFT} swipe /></div>
          </div>
        </Frame>
      );
    }
    if (kind === "content") {
      return (
        <Frame canvasRef={p.canvasRef} ratio={ratio} background={PAPER} ff={ff}>
          <Photo src={slide.imageUrl} style={{ position: "absolute", left: 16, right: 16, top: 16, height: story ? "38%" : "40%" }} radius={18} />
          <Logo src={p.logo} />
          <div style={{ position: "absolute", left: M, top: `calc(${story ? "38%" : "40%"} - 8px)`, width: 48, height: 48, borderRadius: 24, background: strong, color: onColor(strong), display: "grid", placeItems: "center", fontFamily: ff, fontSize: 18, fontWeight: 900, boxShadow: "0 8px 20px rgba(0,0,0,.2)" }}>{String(p.index + 1).padStart(2, "0")}</div>
          <div style={{ position: "absolute", left: M, right: M, top: `calc(${story ? "38%" : "40%"} + 54px)`, bottom: safeBottom, display: "flex", flexDirection: "column", gap: 12 }}>
            {label && <Kicker text={label} color={strong} ff={ff} />}
            <Title text={title} color={titleColor || INK} ff={ff} base={28} maxLines={3} />
            <Body text={body} color={bodyColor || INK_SOFT} ff={ff} maxLines={3} />
            <Bullets items={slide.bullets} color={INK} accent={strong} ff={ff} kind="check" max={title.length > 54 ? 3 : 4} />
            <div style={{ marginTop: "auto" }}><PageMark {...ctx} color={INK_SOFT} /></div>
          </div>
        </Frame>
      );
    }
    return (
      <Frame canvasRef={p.canvasRef} ratio={ratio} background={PAPER} ff={ff}>
        <Photo src={slide.imageUrl} style={{ position: "absolute", left: 16, right: 16, top: 16, height: story ? "34%" : "36%" }} radius={18} />
        <Logo src={p.logo} />
        <div style={{ position: "absolute", left: M, right: M, top: `calc(${story ? "34%" : "36%"} + 40px)`, bottom: safeBottom, display: "flex", flexDirection: "column", gap: 14 }}>
          {label && <Kicker text={label} color={strong} ff={ff} />}
          <Title text={title} color={titleColor || INK} ff={ff} base={32} maxLines={3} />
          <Body text={body} color={bodyColor || INK_SOFT} ff={ff} maxLines={2} />
          <Button text={cta} bg={strong} fg={onColor(strong)} ff={ff} />
          <Contacts slide={slide} color={INK} ff={ff} />
        </div>
      </Frame>
    );
  }

  // ── MAGAZINE: serifa, moldura fina, creme ──
  if (variant === "pro-magazine") {
    if (kind === "cover") {
      return (
        <Frame canvasRef={p.canvasRef} ratio={ratio} background={NIGHT} ff={ff}>
          <Photo src={slide.imageUrl} style={{ position: "absolute", inset: 0 }} />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(0,0,0,.35) 0%, rgba(0,0,0,0) 35%, rgba(0,0,0,.72) 100%)" }} />
          <div style={{ position: "absolute", inset: 14, border: "1.5px solid rgba(255,255,255,.75)", pointerEvents: "none" }} />
          <Logo src={p.logo} />
          <div style={{ position: "absolute", left: 34, top: safeTop + 12 }}><Kicker text={label} color="#FFFFFF" ff={ff} /></div>
          <div style={{ position: "absolute", left: 34, right: 34, bottom: safeBottom + 8, display: "grid", gap: 12 }}>
            <Title text={title} color={titleColor || "#FFFFFF"} ff={ff} base={story ? 44 : 40} serif />
            <Body text={body} color={bodyColor || "rgba(255,255,255,.85)"} ff={ff} maxLines={2} />
            <PageMark {...ctx} color="rgba(255,255,255,.8)" swipe />
          </div>
        </Frame>
      );
    }
    if (kind === "content") {
      return (
        <Frame canvasRef={p.canvasRef} ratio={ratio} background={CREAM} ff={ff}>
          <Photo src={slide.imageUrl} style={{ position: "absolute", left: 0, right: 0, top: 0, height: story ? "36%" : "38%" }} />
          <Logo src={p.logo} />
          <div style={{ position: "absolute", left: M, right: M, top: `calc(${story ? "36%" : "38%"} + 18px)`, bottom: safeBottom, display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
              <span style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 54, lineHeight: 1, color: strong, fontWeight: 400 }}>{String(p.index + 1).padStart(2, "0")}</span>
              <span style={{ flex: 1, height: 1, background: "rgba(17,19,24,.25)" }} />
              {label && <span style={{ fontFamily: ff, fontSize: 10, letterSpacing: ".2em", textTransform: "uppercase", color: INK_SOFT, fontWeight: 700 }}>{label}</span>}
            </div>
            <Title text={title} color={titleColor || INK} ff={ff} base={30} serif maxLines={3} />
            <Body text={body} color={bodyColor || INK_SOFT} ff={ff} maxLines={3} />
            <Bullets items={slide.bullets} color={INK} accent={strong} ff={ff} kind="dash" />
            <div style={{ marginTop: "auto" }}><PageMark {...ctx} color={INK_SOFT} /></div>
          </div>
        </Frame>
      );
    }
    return (
      <Frame canvasRef={p.canvasRef} ratio={ratio} background={CREAM} ff={ff}>
        <div style={{ position: "absolute", inset: 14, border: `1.5px solid ${strong}`, opacity: 0.6, pointerEvents: "none" }} />
        <Logo src={p.logo} />
        <div style={{ position: "absolute", left: 36, right: 36, top: safeTop + 50, bottom: safeBottom + 10, display: "flex", flexDirection: "column", justifyContent: "center", gap: 16, textAlign: "center", alignItems: "center" }}>
          <Kicker text={label} color={strong} ff={ff} align="center" />
          <Title text={title} color={titleColor || INK} ff={ff} base={36} serif align="center" maxLines={4} />
          <Body text={body} color={bodyColor || INK_SOFT} ff={ff} align="center" maxLines={2} />
          <Button text={cta} bg={strong} fg={onColor(strong)} ff={ff} outline full={false} />
          <Contacts slide={slide} color={INK} ff={ff} />
        </div>
      </Frame>
    );
  }

  // ── LUXE: preto, foto em moldura alta, serifa e filete dourado ──
  const gold = isLight(secondary) && secondary.toLowerCase() !== "#ffffff" ? secondary : "#D4B36A";
  if (kind === "cover") {
    return (
      <Frame canvasRef={p.canvasRef} ratio={ratio} background={NIGHT} ff={ff}>
        <Photo src={slide.imageUrl} style={{ position: "absolute", right: 18, top: safeTop, bottom: safeBottom - 6, width: "46%" }} radius={16} />
        <Logo src={p.logo} light={false} />
        <div style={{ position: "absolute", left: M, right: "calc(46% + 34px)", top: safeTop + 30, bottom: safeBottom, display: "flex", flexDirection: "column", justifyContent: "flex-end", gap: 14, overflow: "hidden" }}>
          <Kicker text={label} color={gold} ff={ff} />
          <Title text={title} color={titleColor || "#FFFFFF"} ff={ff} base={30} serif maxLines={5} />
          <div style={{ width: 40, height: 1.5, background: gold }} />
          <Body text={body} color={bodyColor || "rgba(255,255,255,.72)"} ff={ff} size={13} maxLines={3} />
          <PageMark {...ctx} color="rgba(255,255,255,.55)" swipe />
        </div>
      </Frame>
    );
  }
  if (kind === "content") {
    return (
      <Frame canvasRef={p.canvasRef} ratio={ratio} background={NIGHT} ff={ff}>
        <Photo src={slide.imageUrl} style={{ position: "absolute", left: 18, right: 18, top: 18, height: story ? "40%" : "42%" }} radius={16} />
        <Logo src={p.logo} light={false} />
        <div style={{ position: "absolute", left: M, right: M, top: `calc(${story ? "40%" : "42%"} + 40px)`, bottom: safeBottom, display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 30, color: gold, lineHeight: 1 }}>{String(p.index + 1).padStart(2, "0")}</span>
            <span style={{ flex: 1, height: 1, background: "rgba(255,255,255,.18)" }} />
            {label && <span style={{ fontFamily: ff, fontSize: 10, letterSpacing: ".2em", textTransform: "uppercase", color: gold, fontWeight: 700 }}>{label}</span>}
          </div>
          <Title text={title} color={titleColor || "#FFFFFF"} ff={ff} base={30} serif maxLines={3} />
          <Body text={body} color={bodyColor || "rgba(255,255,255,.72)"} ff={ff} maxLines={3} />
          <Bullets items={slide.bullets} color="rgba(255,255,255,.9)" accent={gold} ff={ff} kind="dash" />
          <div style={{ marginTop: "auto" }}><PageMark {...ctx} color="rgba(255,255,255,.45)" /></div>
        </div>
      </Frame>
    );
  }
  return (
    <Frame canvasRef={p.canvasRef} ratio={ratio} background={NIGHT} ff={ff}>
      <Photo src={slide.imageUrl} style={{ position: "absolute", inset: 0, opacity: 0.35 }} />
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(11,12,15,.2), rgba(11,12,15,.95) 70%)" }} />
      <Logo src={p.logo} light={false} />
      <div style={{ position: "absolute", left: M, right: M, top: safeTop + 40, bottom: safeBottom, display: "flex", flexDirection: "column", justifyContent: "flex-end", gap: 16 }}>
        <Kicker text={label} color={gold} ff={ff} />
        <Title text={title} color={titleColor || "#FFFFFF"} ff={ff} base={36} serif maxLines={4} />
        <Body text={body} color={bodyColor || "rgba(255,255,255,.75)"} ff={ff} maxLines={2} />
        <Button text={cta} bg={gold} fg={onColor(gold)} ff={ff} />
        <Contacts slide={slide} color="#FFFFFF" ff={ff} />
      </div>
    </Frame>
  );
}
