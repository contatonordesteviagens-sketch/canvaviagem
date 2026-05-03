// ============================================================
// V0_Experiencia · LUXO & DESEJO (Categoria "Experiência de Destino")
// ------------------------------------------------------------
// Renderização visual completa (CSS + mapeamento). Não toca em
// nenhuma variação da categoria "Oferta de Pacote".
// Aspect 9:16 (story) por padrão; aceita "square" via prop.
// ============================================================

import type { FabricaState } from "@/hooks/useFabricaContext";
import {
  getContrastTextStyle,
  getDropShadowClass,
  type BaseTextMode,
} from "@/lib/fabrica-text-contrast";

export interface V0ExperienciaProps {
  backgroundImage: string;
  logoBase64?: string;
  destination: string;
  promoName: string;
  adTitle: string;
  highlights: Array<{ text: string; icon?: string }>;
  travelPeriod?: string;
  highlightLine?: string;
  primaryColor: string;
  secondaryColor: string;
  ctaLabel?: string;
  legalText?: string;
  format?: "story" | "square";
  baseTextMode?: BaseTextMode;
}

export function mapStateToV0Experiencia(
  state: FabricaState,
  backgroundImage: string,
): V0ExperienciaProps {
  const firstBenefit = state.lastHighlights?.[0]?.text || "";
  return {
    backgroundImage,
    logoBase64: state.logoBase64 || "",
    destination: state.destinos?.[0] || "",
    promoName: state.lastPromoName || "",
    adTitle: state.lastAdTitle || "",
    highlights: (state.lastHighlights as Array<{ text: string; icon?: string }>) || [],
    travelPeriod: state.lastTravelPeriod || firstBenefit || "",
    highlightLine: state.totalOverride || state.lastPrice || "",
    primaryColor: state.primaryColor,
    secondaryColor: state.secondaryColor,
    ctaLabel: "RESERVE AGORA",
    legalText: "Imagem ilustrativa, gerada mediante IA não condiz 100% com a realidade.",
    format: state.lastFormat === "square" ? "square" : "story",
  };
}

export function V0Experiencia(props: V0ExperienciaProps) {
  const {
    backgroundImage,
    logoBase64,
    destination,
    promoName,
    adTitle,
    highlights,
    travelPeriod,
    highlightLine,
    secondaryColor,
    ctaLabel = "RESERVE AGORA",
    legalText = "Imagem ilustrativa, gerada mediante IA não condiz 100% com a realidade.",
    format = "story",
  } = props;

  const pillText = highlights?.[0]?.text || travelPeriod || "";
  const aspect = format === "square" ? "aspect-square" : "aspect-[9/16]";

  // Linha 2 — destino (em caps) ou fallback estático
  const headlineLine2 = destination ? destination.toUpperCase() : "NESSA VIAGEM.";

  return (
    <article
      data-variant="V0_Experiencia"
      data-category="experiencia_destino"
      className={`relative w-full ${aspect} overflow-hidden rounded-xl bg-black select-none`}
      style={{ fontFamily: "'Inter', system-ui, sans-serif" }}
    >
      {/* 1 · BACKGROUND ─ imagem + overlay degradê */}
      <img
        src={backgroundImage}
        alt={destination || "destino"}
        className="absolute inset-0 w-full h-full object-cover"
        draggable={false}
      />
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/30 to-black/80"
      />

      {/* Conteúdo */}
      <div className="relative z-10 flex flex-col items-center h-full w-full px-6 pt-8 pb-10 text-white text-center">
        {/* 2 · TOPO ─ logo + categoria + subtítulo */}
        <header className="flex flex-col items-center gap-3 w-full">
          {logoBase64 ? (
            <img
              src={logoBase64}
              alt="Logo"
              className="h-12 w-auto object-contain mb-1 drop-shadow-lg"
            />
          ) : null}

          {promoName ? (
            <h2
              className="text-[15px] sm:text-base tracking-[0.18em] uppercase font-bold text-white drop-shadow"
              style={{ fontFamily: "'Playfair Display', 'Cormorant Garamond', Georgia, serif" }}
            >
              {promoName}
            </h2>
          ) : null}

          {adTitle ? (
            <p className="text-[11px] sm:text-xs font-light tracking-wide text-white/90">
              {adTitle}
            </p>
          ) : null}

          {/* 3 · PÍLULA ─ benefício / período */}
          {pillText ? (
            <span className="mt-2 inline-flex items-center px-4 py-1.5 rounded-full bg-white/20 backdrop-blur-sm text-[11px] sm:text-xs font-medium text-white tracking-wide">
              {pillText}
            </span>
          ) : null}
        </header>

        {/* 4 · TÍTULO PRINCIPAL ─ desconto + destino */}
        <section className="flex-1 flex flex-col items-center justify-center gap-1 w-full">
          {highlightLine ? (
            <p className="text-2xl sm:text-3xl font-light text-white tracking-wide drop-shadow-md leading-tight">
              {highlightLine}
            </p>
          ) : null}
          <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight drop-shadow-md leading-[1.05]">
            {headlineLine2}
          </h1>
        </section>

        {/* 5 · CTA */}
        <button
          type="button"
          className="mt-2 mb-6 px-8 py-3 rounded-md text-white font-bold text-xs sm:text-sm tracking-wider uppercase shadow-lg transition-transform hover:scale-[1.02]"
          style={{ background: secondaryColor }}
        >
          {ctaLabel}
        </button>
      </div>

      {/* 6 · RODAPÉ legal */}
      <footer className="absolute bottom-2 left-0 right-0 z-10 text-center px-4">
        <small className="text-[9px] sm:text-[10px] text-gray-300/80 tracking-wide">
          {legalText}
        </small>
      </footer>
    </article>
  );
}

export default V0Experiencia;
