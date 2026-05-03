// ============================================================
// V3_Experiencia · NOTURNA / DARK PREMIUM
// (Categoria "Experiência de Destino")
// ------------------------------------------------------------
// Estética OBRIGATÓRIA: Dark Premium / Noturna.
// Suporta os 3 modos de imagem (Foto Real, Sua Imagem, IA Pura).
// Overlay forte garante leitura branca mesmo sobre fotos claras.
//
// NÃO toca em V0/V1/V2_Experiencia nem em variações de Oferta.
// ============================================================

import type { FabricaState } from "@/hooks/useFabricaContext";
import {
  getContrastTextStyle,
  getDropShadowClass,
  type BaseTextMode,
} from "@/lib/fabrica-text-contrast";

export interface V3ExperienciaHighlight {
  text: string;
  icon?: string;
}

export interface V3ExperienciaProps {
  // Background universal (suporta os 3 modos)
  backgroundImage: string;
  destination: string;

  // TOPO (texto isolado)
  promoName: string;

  // CLUSTER INFERIOR
  adTitle: string;            // Título maciço
  travelPeriod: string;       // Botão sólido (dias / data)
  firstHighlight: string;     // Botão outline (1º item da descrição)

  // Identidade visual herdada do formulário lateral
  primaryColor: string;
  secondaryColor: string;
  fontFamily?: string;
  logoBase64?: string;

  format?: "story" | "square";
  baseTextMode?: BaseTextMode;
}

// ── Utilidades de cor para garantir contraste seguro no botão sólido ──
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const c = hex.replace("#", "");
  if (c.length !== 6) return null;
  const r = parseInt(c.slice(0, 2), 16);
  const g = parseInt(c.slice(2, 4), 16);
  const b = parseInt(c.slice(4, 6), 16);
  if ([r, g, b].some(Number.isNaN)) return null;
  return { r, g, b };
}
function relLuminance(hex: string): number {
  const rgb = hexToRgb(hex);
  if (!rgb) return 0.5;
  const srgb = [rgb.r, rgb.g, rgb.b].map((v) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * srgb[0] + 0.7152 * srgb[1] + 0.0722 * srgb[2];
}
function contrastRatio(a: string, b: string): number {
  const L1 = relLuminance(a);
  const L2 = relLuminance(b);
  const [hi, lo] = L1 > L2 ? [L1, L2] : [L2, L1];
  return (hi + 0.05) / (lo + 0.05);
}
/** Devolve a Cor Secundária se o contraste contra a Primária for >= 4.5; senão branco/preto seguro. */
function safeOnPrimary(primary: string, secondary: string): string {
  if (contrastRatio(primary, secondary) >= 4.5) return secondary;
  // fallback: escolhe branco ou preto pelo maior contraste
  return contrastRatio(primary, "#FFFFFF") >= contrastRatio(primary, "#000000")
    ? "#FFFFFF"
    : "#000000";
}

function normalizeHighlights(raw: any[]): V3ExperienciaHighlight[] {
  return (raw || [])
    .map((h): V3ExperienciaHighlight | null => {
      if (typeof h === "string") return { text: h };
      if (h && typeof h === "object") return { text: h.text || "", icon: h.icon };
      return null;
    })
    .filter(
      (h): h is V3ExperienciaHighlight => !!h && !!h.text && h.text.trim().length > 0,
    );
}

export function mapStateToV3Experiencia(
  state: FabricaState,
  backgroundImage: string,
): V3ExperienciaProps {
  const destination = state.destinos?.[0]?.trim() || "";
  const resolvedAdTitle = (state.lastAdTitle || "").replace(
    /\{destino\}/gi,
    destination,
  );
  const highlights = normalizeHighlights(state.lastHighlights || []);

  return {
    backgroundImage,
    destination,
    promoName: state.lastPromoName || "",
    adTitle: resolvedAdTitle,
    travelPeriod: (state.lastTravelPeriod || "").trim(),
    firstHighlight: highlights[0]?.text || "",
    primaryColor: state.primaryColor,
    secondaryColor: state.secondaryColor,
    fontFamily: (state as any).fontFamily,
    logoBase64: state.logoBase64 || "",
    format: state.lastFormat === "square" ? "square" : "story",
    baseTextMode: ((state as any).baseTextMode as BaseTextMode) || "light",
  };
}

export function V3Experiencia(props: V3ExperienciaProps) {
  const {
    backgroundImage,
    destination,
    promoName,
    adTitle,
    travelPeriod,
    firstHighlight,
    primaryColor,
    secondaryColor,
    fontFamily,
    format = "story",
    baseTextMode = "light",
  } = props;

  const aspect = format === "square" ? "aspect-square" : "aspect-[9/16]";
  const titleFont =
    fontFamily ||
    "'Playfair Display', 'Cormorant Garamond', 'Bodoni Moda', Georgia, serif";
  const onPrimaryText = safeOnPrimary(primaryColor, secondaryColor);
  const isDarkText = baseTextMode === "dark";
  const textStyle = getContrastTextStyle(baseTextMode);
  const dropClass = getDropShadowClass(baseTextMode);
  const titleColor = isDarkText ? "#0A0A0A" : "#FFFFFF";

  return (
    <article
      data-variant="V3_Experiencia"
      data-category="experiencia_destino"
      className={`relative w-full ${aspect} overflow-hidden rounded-xl bg-black select-none`}
      style={{ fontFamily: "Inter, system-ui, sans-serif" }}
    >
      {/* ─────────────────────────────────────────────
          1 · BACKGROUND UNIVERSAL (Foto Real / Sua Imagem / IA Pura)
         ───────────────────────────────────────────── */}
      <div
        data-region="background"
        className="absolute inset-0 w-full h-full"
        style={{
          backgroundImage: `url("${backgroundImage}")`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
        aria-label={destination || "destino"}
      />

      {/* OVERLAY OBRIGATÓRIO — força legibilidade. Inverte para "lavagem clara" no modo Textos Escuros */}
      <div
        aria-hidden
        className={`absolute inset-0 ${
          isDarkText
            ? "bg-gradient-to-t from-white/85 via-white/25 to-white/65"
            : "bg-gradient-to-t from-black/85 via-black/25 to-black/65"
        }`}
      />
      {/* Vinheta lateral sutil para profundidade noturna */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(0,0,0,0) 45%, rgba(0,0,0,0.55) 100%)",
        }}
      />

      {/* ─────────────────────────────────────────────
          2 · TOPO · logo + nome da experiência
         ───────────────────────────────────────────── */}
      <header
        data-region="top"
        className="absolute top-0 left-0 right-0 flex flex-col items-center gap-3 pt-8 px-6 z-10"
      >
        {props.logoBase64 ? (
          <img
            src={props.logoBase64}
            alt="logo"
            className="object-contain bg-transparent max-h-16 sm:max-h-20 w-auto drop-shadow-[0_4px_8px_rgba(0,0,0,0.5)]"
          />
        ) : null}
        {promoName ? (
          <span
            data-field="promoName"
            className={`text-[13px] sm:text-sm font-medium tracking-widest uppercase text-center ${dropClass}`}
            style={{ fontFamily: "Inter, system-ui, sans-serif", ...textStyle }}
          >
            {promoName}
          </span>
        ) : null}
      </header>

      {/* ─────────────────────────────────────────────
          3 · CLUSTER INFERIOR
             - Título serif branco com sombra cinematográfica difusa
             - Botão sólido (Cor Primária + glassmorphism)
             - Botão outline (borda Primária + glassmorphism)
         ───────────────────────────────────────────── */}
      <section
        data-region="bottom-cluster"
        className="absolute left-0 right-0 bottom-0 flex flex-col items-center gap-6 px-6 pb-12 z-10"
      >
        {adTitle ? (() => {
          const len = adTitle.length;
          // Auto-fit: texto curto = grande, longo = reduz (com respiro)
          const sizeClass =
            len <= 14
              ? "text-5xl sm:text-6xl md:text-7xl"
              : len <= 24
                ? "text-4xl sm:text-5xl md:text-6xl"
                : len <= 40
                  ? "text-3xl sm:text-4xl md:text-5xl"
                  : "text-2xl sm:text-3xl md:text-4xl";
          return (
            <h1
              data-field="adTitle"
              className={`text-white text-center font-bold uppercase leading-tight tracking-wide drop-shadow-2xl drop-shadow-[0_10px_10px_rgba(0,0,0,0.6)] ${sizeClass}`}
              style={{
                fontFamily: titleFont,
                textShadow:
                  "0 8px 24px rgba(0,0,0,0.55), 0 2px 6px rgba(0,0,0,0.45)",
              }}
            >
              {adTitle}
            </h1>
          );
        })() : null}

        <div className="flex flex-col items-center gap-3 w-full">
          {travelPeriod ? (
            <button
              type="button"
              data-field="travelPeriod"
              data-style="solid"
              className="rounded-full px-7 py-2.5 font-sans font-bold text-[13px] sm:text-sm tracking-wide shadow-xl shadow-black/50 backdrop-blur-md bg-opacity-90"
              style={{
                background: primaryColor,
                color: onPrimaryText,
                opacity: 0.92,
              }}
            >
              {travelPeriod}
            </button>
          ) : null}

          {firstHighlight ? (
            <button
              type="button"
              data-field="firstHighlight"
              data-style="outline"
              className="rounded-full px-7 py-2.5 font-sans font-bold text-[13px] sm:text-sm tracking-wide border-2 backdrop-blur-md"
              style={{
                borderColor: primaryColor,
                color: primaryColor,
                background: "rgba(255,255,255,0.06)",
              }}
            >
              {firstHighlight}
            </button>
          ) : null}
        </div>
      </section>
    </article>
  );
}

export default V3Experiencia;
