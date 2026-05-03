// ============================================================
// V3_Experiencia · NOTURNA / DARK PREMIUM
// (Categoria "Experiência de Destino")
// ------------------------------------------------------------
// ESTRUTURA LÓGICA APENAS — sem layout/CSS final.
// Este componente é um STUB que apenas mapeia os dados do
// formulário lateral e renderiza um placeholder mínimo, para que
// o seletor de versão (V3) funcione no fluxo da Fábrica.
//
// Renderização real (Tailwind + canvas) será implementada
// em uma próxima etapa, sem tocar nas variações já existentes:
//   • Oferta de Pacote: V0..V5
//   • Experiência de Destino: V0_Experiencia, V1_Experiencia,
//     V2_Experiencia (todas CONGELADAS).
// ============================================================

import type { FabricaState } from "@/hooks/useFabricaContext";

export interface V3ExperienciaHighlight {
  text: string;
  icon?: string;
}

export interface V3ExperienciaProps {
  // Background
  backgroundImage: string;
  destination: string;

  // Identidade da experiência
  promoName: string;
  adTitle: string;
  travelPeriod: string;

  // Conteúdo
  highlights: V3ExperienciaHighlight[];

  // Identidade visual herdada do formulário lateral
  primaryColor: string;
  secondaryColor: string;
  fontFamily?: string;
  logoBase64?: string;

  format?: "story" | "square";
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

  return {
    backgroundImage,
    destination,
    promoName: state.lastPromoName || "",
    adTitle: resolvedAdTitle,
    travelPeriod: (state.lastTravelPeriod || "").trim(),
    highlights: normalizeHighlights(state.lastHighlights || []),
    primaryColor: state.primaryColor,
    secondaryColor: state.secondaryColor,
    fontFamily: (state as any).fontFamily,
    logoBase64: state.logoBase64 || "",
    format: state.lastFormat === "square" ? "square" : "story",
  };
}

/**
 * STUB visual — apenas estrutura lógica.
 * O design/CSS noturno premium será implementado em etapa posterior.
 */
export function V3Experiencia(props: V3ExperienciaProps) {
  const { backgroundImage, destination, format = "story" } = props;
  const aspect = format === "square" ? "aspect-square" : "aspect-[9/16]";

  return (
    <article
      data-variant="V3_Experiencia"
      data-category="experiencia_destino"
      className={`relative w-full ${aspect} overflow-hidden rounded-xl bg-black select-none`}
    >
      <img
        src={backgroundImage}
        alt={destination || "destino"}
        className="absolute inset-0 w-full h-full object-cover opacity-90"
        draggable={false}
      />
      {/* Placeholder — layout noturno premium pendente */}
      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
        <span className="text-white/40 text-[10px] uppercase tracking-[0.3em]">
          V3 · Noturna (em construção)
        </span>
      </div>
    </article>
  );
}

export default V3Experiencia;
