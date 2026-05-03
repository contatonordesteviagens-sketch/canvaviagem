// ============================================================
// V2_Experiencia · ESTRUTURA LÓGICA (Categoria "Experiência de Destino")
// ------------------------------------------------------------
// ⚠️ Esta variação está em fase de ESQUELETO LÓGICO apenas.
//    - Renderização visual (CSS/layout) ainda NÃO foi definida.
//    - Só é selecionada quando categoria === "experiencia_destino"
//      E variation === 2 (forceVariant === 2).
//    - Herda os mesmos dados do formulário lateral via FabricaState
//      (Destino, Preço, Benefícios, Cores, Logo, Período, etc.).
//    - NÃO afeta V0_Experiencia nem V1_Experiencia, nem variações
//      da categoria "Oferta de Pacote" (V0..V4).
// ============================================================

import type { FabricaState } from "@/hooks/useFabricaContext";

export interface V2ExperienciaProps {
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
}

const TRAVEL_PERIOD_FALLBACK = "uma jornada inesquecível";
const SLOGAN_FALLBACK = "Sua viagem começa aqui";

export function mapStateToV2Experiencia(
  state: FabricaState,
  backgroundImage: string,
): V2ExperienciaProps {
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
 * V2Experiencia — placeholder visual.
 * O design/CSS final será implementado em uma etapa posterior.
 * Por enquanto apenas renderiza o background com um marcador discreto
 * para confirmar que o roteamento da variante está funcionando.
 */
export function V2Experiencia(props: V2ExperienciaProps) {
  const { backgroundImage, destination, format = "story" } = props;
  const aspect = format === "square" ? "aspect-square" : "aspect-[9/16]";

  return (
    <article
      data-variant="V2_Experiencia"
      data-category="experiencia_destino"
      data-status="layout-pending"
      className={`relative w-full ${aspect} overflow-hidden rounded-xl bg-black select-none`}
    >
      <img
        src={backgroundImage}
        alt={destination || "destino"}
        className="absolute inset-0 w-full h-full object-cover"
        draggable={false}
      />
      {/* Layout/CSS da V2_Experiencia ainda não definido. */}
    </article>
  );
}

export default V2Experiencia;
