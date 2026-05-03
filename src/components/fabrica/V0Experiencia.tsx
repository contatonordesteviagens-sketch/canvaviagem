// ============================================================
// V0_Experiencia · COMPONENTE SEMÂNTICO (estrutura + mapeamento)
// ------------------------------------------------------------
// Layout focado em LUXO e DESEJO (categoria "Experiência de Destino").
// Aqui apenas a ARQUITETURA de seções e o consumo dos campos do
// formulário lateral. SEM CSS/design e SEM chamadas de API.
//
// Este componente ainda NÃO é renderizado em produção — serve como
// blueprint da estrutura para a próxima etapa (estilização).
// As variações da categoria "Oferta de Pacote" permanecem intactas.
// ============================================================

import type { FabricaState } from "@/hooks/useFabricaContext";

export interface V0ExperienciaProps {
  /** Imagem de fundo (URL ou base64) — IA Pura, Foto Real ou Sua Imagem. */
  backgroundImage: string;
  /** Logo da agência em base64 (opcional). */
  logoBase64?: string;
  /** Destino consumido do formulário lateral. */
  destination: string;
  /** Nome da promoção (ex.: "TEMPORADA DOURADA"). */
  promoName: string;
  /** Título do anúncio (subtítulo elegante). */
  adTitle: string;
  /** Lista de benefícios/inclusos — usamos o 1º item ou os "dias de viagem". */
  highlights: Array<{ text: string; icon?: string }>;
  /** Período de viagem (ex.: "5 dias", "Janeiro"). Fallback para a pílula. */
  travelPeriod?: string;
  /** Texto de destaque (ex.: "30% OFF" / valor de desconto). */
  highlightLine?: string;
  /** Cor primária da marca (texto/realces). */
  primaryColor: string;
  /** Cor secundária da marca (CTA). */
  secondaryColor: string;
  /** Texto do CTA (default "RESERVE AGORA"). */
  ctaLabel?: string;
  /** Texto do rodapé legal (default genérico). */
  legalText?: string;
}

/**
 * Constrói as props do V0_Experiencia a partir do estado global da Fábrica.
 * Centraliza o mapeamento `formulário → componente` para reuso.
 */
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
    legalText: "Sujeito a disponibilidade. Consulte condições.",
  };
}

/**
 * V0_Experiencia — blueprint semântico (sem CSS).
 * Cada <section data-area="..."> mapeia 1:1 a especificação:
 *   bg / topo / pilula / titulo-principal / cta / rodape
 */
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
    legalText = "Sujeito a disponibilidade. Consulte condições.",
  } = props;

  // Pílula: 1º benefício, ou período de viagem como fallback.
  const pillText = highlights?.[0]?.text || travelPeriod || "";

  return (
    <article data-variant="V0_Experiencia" data-category="experiencia_destino">
      {/* 1 · BACKGROUND ─ imagem do destino + overlay degradê (CSS depois) */}
      <section data-area="bg">
        <img data-role="bg-image" src={backgroundImage} alt={destination} />
        <div data-role="bg-overlay" aria-hidden />
      </section>

      {/* 2 · TOPO ─ logo + título da categoria + subtítulo */}
      <header data-area="topo">
        {logoBase64 ? (
          <img data-role="agency-logo" src={logoBase64} alt="Logo" />
        ) : null}
        <h2 data-role="category-title" data-font="serif">
          {promoName}
        </h2>
        <p data-role="ad-subtitle" data-font="sans">
          {adTitle}
        </p>
      </header>

      {/* 3 · PÍLULA ─ benefício/dias de viagem */}
      <div data-area="pilula" role="presentation">
        <span data-role="pill-text">{pillText}</span>
      </div>

      {/* 4 · TÍTULO PRINCIPAL ─ destaque + destino */}
      <section data-area="titulo-principal">
        <p data-role="headline-line-1" data-weight="light">
          {highlightLine}
        </p>
        <h1 data-role="headline-line-2" data-weight="black">
          {destination ? destination.toUpperCase() : "NESSA VIAGEM."}
        </h1>
      </section>

      {/* 5 · CTA ─ usa cor secundária da marca */}
      <div data-area="cta">
        <button
          type="button"
          data-role="cta-button"
          data-color-source="secondaryColor"
          data-bg={secondaryColor}
        >
          {ctaLabel}
        </button>
      </div>

      {/* 6 · RODAPÉ ─ aviso legal minúsculo */}
      <footer data-area="rodape">
        <small data-role="legal">{legalText}</small>
      </footer>
    </article>
  );
}

export default V0Experiencia;
