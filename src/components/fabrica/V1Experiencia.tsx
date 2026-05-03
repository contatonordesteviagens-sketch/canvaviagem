// ============================================================
// V1_Experiencia · LUXO CINEMATOGRÁFICO (Categoria "Experiência de Destino")
// ------------------------------------------------------------
// Estrutura semântica + mapeamento de dados (sem CSS final).
// NÃO toca em V0_Experiencia nem em variações de "Oferta de Pacote".
// Renderização real (canvas) acontece em fabrica-compose-art.ts
// quando isExperience === true && forceVariant === 1.
// ============================================================

import type { FabricaState } from "@/hooks/useFabricaContext";

export interface V1ExperienciaProps {
  /** URL/base64 da imagem (IA ou foto real) baseada no Destino. */
  backgroundImage: string;
  /** Logo do usuário (opcional). */
  logoBase64?: string;

  // ---- Bloco Superior (Identidade) ----
  /** Consome "Nome da promoção" (renderizado como "Nome da experiência" na UI). */
  promoName: string;
  /** Consome "Dias / data da viagem" — renderizado em fonte cursiva/caligráfica. */
  travelPeriod: string;

  // ---- Bloco Central (Tipografia Principal) ----
  /** Consome "Benefícios / Inclusos" (junta os textos em uma frase de descrição). */
  experienceDescription: string;
  /** Consome "Título do anúncio" já com {destino} resolvido. */
  adTitle: string;

  // ---- Bloco Inferior (Slogan) ----
  /** Consome o "Complemento" (paymentSuffix). Ex: "Sua viagem começa aqui". */
  slogan: string;

  // ---- Identidade visual ----
  destination: string;
  primaryColor: string;
  secondaryColor: string;
  format?: "story" | "square";
}

/** Frase charmosa para travelPeriod quando o campo está vazio. */
const TRAVEL_PERIOD_FALLBACK = "uma jornada inesquecível";
/** Slogan padrão se o "Complemento" estiver vazio. */
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
  };
}

/**
 * Esqueleto React da V1_Experiencia.
 * ⚠️ Sem CSS final — apenas estrutura semântica para validar mapeamento.
 *    O CSS/canvas real será aplicado em etapa posterior.
 */
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
  } = props;

  const aspect = format === "square" ? "aspect-square" : "aspect-[9/16]";

  return (
    <article
      data-variant="V1_Experiencia"
      data-category="experiencia_destino"
      className={`relative w-full ${aspect} overflow-hidden rounded-xl bg-black select-none`}
    >
      {/* 1 · BACKGROUND */}
      <img
        src={backgroundImage}
        alt={destination || "destino"}
        className="absolute inset-0 w-full h-full object-cover"
        draggable={false}
      />
      <div aria-hidden className="absolute inset-0 bg-black/40" />

      {/* Conteúdo centralizado verticalmente em 3 blocos */}
      <div className="relative z-10 flex flex-col items-center justify-between h-full w-full px-6 py-10 text-white text-center">
        {/* 2 · BLOCO SUPERIOR — Identidade */}
        <header className="flex flex-col items-center gap-2 w-full" data-block="superior">
          {logoBase64 ? (
            <img src={logoBase64} alt="Logo" className="h-12 w-auto object-contain mb-1" />
          ) : null}
          {promoName ? (
            <p data-field="promoName" className="uppercase tracking-widest text-xs font-semibold">
              {promoName}
            </p>
          ) : null}
          <p data-field="travelPeriod" className="italic text-sm">
            {travelPeriod}
          </p>
        </header>

        {/* 3 · BLOCO CENTRAL — Tipografia Principal */}
        <section className="flex flex-col items-center gap-2 w-full" data-block="central">
          <h1 data-field="experienceDescription" className="text-3xl font-extrabold uppercase leading-tight">
            {experienceDescription}
          </h1>
          {adTitle ? (
            <p data-field="adTitle" className="text-base font-light tracking-wide">
              {adTitle}
            </p>
          ) : null}
        </section>

        {/* 4 · BLOCO INFERIOR — Slogan */}
        <footer className="w-full" data-block="inferior">
          <p data-field="slogan" className="text-sm font-medium tracking-wide">
            {slogan}
          </p>
        </footer>
      </div>
    </article>
  );
}

export default V1Experiencia;
