// ============================================================
// V1_Experiencia · LUXO CINEMATOGRÁFICO (Categoria "Experiência de Destino")
// ------------------------------------------------------------
// Layout editorial centralizado com hierarquia tipográfica precisa:
// Serif (Playfair Display) para Nome da Promoção e bloco central,
// Cursive (Dancing Script) para o subtítulo do topo e Slogan italic.
// NÃO toca em V0_Experiencia nem em variações de "Oferta de Pacote".
// ============================================================

import type { FabricaState } from "@/hooks/useFabricaContext";
import {
  getContrastTextStyle,
  getDropShadowClass,
  type BaseTextMode,
} from "@/lib/fabrica-text-contrast";

export interface V1ExperienciaProps {
  backgroundImage: string;
  logoBase64?: string;
  promoName: string;
  travelPeriod: string;
  experienceDescription: string;
  adTitle: string;
  slogan: string;
  destination: string;
  primaryColor: string;
  secondaryColor: string;
  format?: "story" | "square";
  baseTextMode?: BaseTextMode;
}

const TRAVEL_PERIOD_FALLBACK = "uma jornada inesquecível";
const SLOGAN_FALLBACK = "Sua viagem começa aqui";

export function mapStateToV1Experiencia(
  state: FabricaState,
  backgroundImage: string,
): V1ExperienciaProps {
  const highlightsText = (state.lastHighlights || [])
    .map((h: any) => (typeof h === "string" ? h : h?.text))
    .filter((t: any): t is string => !!t && t.trim().length > 0)
    .join(" · ");

  const resolvedAdTitle = (state.lastAdTitle || "")
    .replace(/\{destino\}/gi, state.destinos?.[0]?.trim() || "");

  return {
    backgroundImage,
    logoBase64: state.logoBase64 || "",
    promoName: state.lastPromoName || "",
    travelPeriod: (state.lastTravelPeriod || "").trim() || TRAVEL_PERIOD_FALLBACK,
    experienceDescription: highlightsText || (state.destinos?.[0] || "").toUpperCase(),
    adTitle: resolvedAdTitle,
    slogan: (state.lastPaymentSuffix || "").trim() || SLOGAN_FALLBACK,
    destination: state.destinos?.[0] || "",
    primaryColor: state.primaryColor,
    secondaryColor: state.secondaryColor,
    format: state.lastFormat === "square" ? "square" : "story",
    baseTextMode: ((state as any).baseTextMode as BaseTextMode) || "light",
  };
}

export function V1Experiencia(props: V1ExperienciaProps) {
  const {
    backgroundImage,
    logoBase64,
    promoName,
    travelPeriod,
    experienceDescription,
    adTitle,
    slogan,
    destination,
    format = "story",
    baseTextMode = "light",
  } = props;

  const aspect = format === "square" ? "aspect-square" : "aspect-[9/16]";
  const textStyle = getContrastTextStyle(baseTextMode);
  const dropClass = getDropShadowClass(baseTextMode);
  const textColorCls = baseTextMode === "dark" ? "text-neutral-900" : "text-white";

  return (
    <article
      data-variant="V1_Experiencia"
      data-category="experiencia_destino"
      className={`relative w-full ${aspect} overflow-hidden rounded-xl bg-black select-none`}
      style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
    >
      {/* 1 · BACKGROUND */}
      <img
        src={backgroundImage}
        alt={destination || "destino"}
        className="absolute inset-0 w-full h-full object-cover"
        draggable={false}
      />
      {/* Overlay sutil — preserva paisagem */}
      <div aria-hidden className="absolute inset-0 bg-black/30" />

      {/* Conteúdo: 3 blocos centralizados (topo · centro · slogan) */}
      <div className="relative z-10 flex flex-col items-center justify-between h-full w-full px-6 py-10 text-white text-center">
        {/* 2 · BLOCO SUPERIOR — Identidade */}
        <header className="flex flex-col items-center gap-2 w-full">
          {logoBase64 ? (
            <img
              src={logoBase64}
              alt="Logo"
              className="h-12 w-auto object-contain mb-2 drop-shadow-[0_2px_6px_rgba(0,0,0,0.4)]"
            />
          ) : null}
          {promoName ? (
            <h2 className="font-serif uppercase tracking-[0.3em] text-sm sm:text-base font-semibold drop-shadow-md">
              {promoName}
            </h2>
          ) : null}
          <p className="font-fabrica-script text-base sm:text-lg text-white/95 drop-shadow-md leading-tight">
            {travelPeriod}
          </p>
        </header>

        {/* 3 · BLOCO CENTRAL — Tipografia Principal */}
        <section className="flex flex-col items-center gap-3 w-full">
          <h1
            className="font-serif font-bold uppercase text-3xl sm:text-5xl leading-tight tracking-tight drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]"
            style={{ fontFamily: "'Playfair Display', 'Bodoni Moda', Georgia, serif" }}
          >
            {experienceDescription}
          </h1>
          {adTitle ? (
            <p
              className="font-serif font-normal text-base sm:text-xl text-white/95 drop-shadow-md leading-snug"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              {adTitle}
            </p>
          ) : null}
        </section>

        {/* 4 · BLOCO INFERIOR — Slogan */}
        <footer className="w-full">
          <p className="font-serif italic font-medium text-sm sm:text-base text-white drop-shadow-md">
            {slogan}
          </p>
        </footer>
      </div>
    </article>
  );
}

export default V1Experiencia;
