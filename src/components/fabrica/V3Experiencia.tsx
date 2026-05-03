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
  } = props;

  const aspect = format === "square" ? "aspect-square" : "aspect-[9/16]";
  const titleFont =
    fontFamily ||
    "'Playfair Display', 'Cormorant Garamond', 'Bodoni Moda', Georgia, serif";
  const onPrimaryText = safeOnPrimary(primaryColor, secondaryColor);

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

      {/* OVERLAY OBRIGATÓRIO — força legibilidade Dark Premium */}
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-black/65"
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
          2 · TOPO · texto isolado (sans-serif branco pequeno)
         ───────────────────────────────────────────── */}
      <header
        data-region="top"
        className="absolute top-0 left-0 right-0 flex justify-center pt-8 px-6 z-10"
      >
        {promoName ? (
          <span
            data-field="promoName"
            className="text-white text-[13px] sm:text-sm font-medium tracking-wide text-center drop-shadow-lg"
            style={{ fontFamily: "Inter, system-ui, sans-serif" }}
          >
            {promoName}
          </span>
        ) : null}
      </header>

      {/* ─────────────────────────────────────────────
          3 · CLUSTER INFERIOR
             - Título maciço serif branco com drop-shadow-2xl
             - Botão sólido rounded-full (Cor Primária)
             - Botão outline rounded-full (borda Primária)
         ───────────────────────────────────────────── */}
      <section
        data-region="bottom-cluster"
        className="absolute left-0 right-0 bottom-0 flex flex-col items-center gap-4 px-6 pb-10 z-10"
      >
        {adTitle ? (() => {
          const len = adTitle.length;
          // Auto-fit: texto curto = gigante, longo = reduz
          const sizeClass =
            len <= 14
              ? "text-6xl sm:text-7xl md:text-8xl"
              : len <= 24
                ? "text-5xl sm:text-6xl md:text-7xl"
                : len <= 40
                  ? "text-4xl sm:text-5xl md:text-6xl"
                  : "text-3xl sm:text-4xl md:text-5xl";
          return (
            <h1
              data-field="adTitle"
              className={`text-white text-center font-bold uppercase leading-[0.95] tracking-tight drop-shadow-2xl shadow-black ${sizeClass}`}
              style={{
                fontFamily: titleFont,
                textShadow:
                  "0 4px 18px rgba(0,0,0,0.85), 0 2px 6px rgba(0,0,0,0.95)",
              }}
            >
              {adTitle}
            </h1>
          );
        })() : null}

        <div className="flex flex-col items-center gap-2.5 w-full mt-2">
          {travelPeriod ? (
            <button
              type="button"
              data-field="travelPeriod"
              data-style="solid"
              className="rounded-full px-7 py-2.5 font-sans font-bold text-[13px] sm:text-sm tracking-wide shadow-xl shadow-black/50"
              style={{
                background: primaryColor,
                color: onPrimaryText,
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
              className="rounded-full px-7 py-2.5 font-sans font-bold text-[13px] sm:text-sm tracking-wide bg-transparent border-2 backdrop-blur-sm"
              style={{
                borderColor: primaryColor,
                color: primaryColor,
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
