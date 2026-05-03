// ============================================================
// V3_Experiencia · NOTURNA / DARK PREMIUM
// (Categoria "Experiência de Destino")
// ------------------------------------------------------------
// ESTRUTURA ESPACIAL + MAPEAMENTO DE DADOS (sem design final).
// Background universal (Foto Real / Sua Imagem / IA Pura) +
// regiões isoladas: TOPO (Nome da experiência) e CLUSTER
// INFERIOR (Título maciço, Botão sólido = data, Botão outline =
// 1º item da descrição).
//
// CSS final será aplicado em etapa posterior. NÃO toca em
// V0/V1/V2_Experiencia nem em variações de Oferta de Pacote.
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

    // TOPO
    promoName: state.lastPromoName || "",

    // CLUSTER INFERIOR
    adTitle: resolvedAdTitle,
    travelPeriod: (state.lastTravelPeriod || "").trim(),
    firstHighlight: highlights[0]?.text || "",

    // Identidade
    primaryColor: state.primaryColor,
    secondaryColor: state.secondaryColor,
    fontFamily: (state as any).fontFamily,
    logoBase64: state.logoBase64 || "",

    format: state.lastFormat === "square" ? "square" : "story",
  };
}

/**
 * Estrutura React/HTML da V3_Experiencia.
 * O background é UNIVERSAL — flutua sobre qualquer imagem
 * (upload do usuário, Pexels/Unsplash ou IA Pura).
 * As regiões abaixo são posicionadas de forma independente.
 */
export function V3Experiencia(props: V3ExperienciaProps) {
  const {
    backgroundImage,
    destination,
    promoName,
    adTitle,
    travelPeriod,
    firstHighlight,
    format = "story",
  } = props;

  const aspect = format === "square" ? "aspect-square" : "aspect-[9/16]";

  return (
    <article
      data-variant="V3_Experiencia"
      data-category="experiencia_destino"
      className={`relative w-full ${aspect} overflow-hidden rounded-xl bg-black select-none`}
    >
      {/* ─────────────────────────────────────────────
          1 · BACKGROUND UNIVERSAL
          Renderiza a imagem independentemente do modo
          (Foto Real / Sua Imagem / IA Pura).
          UI flutua de forma independente acima.
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

      {/* ─────────────────────────────────────────────
          2 · TOPO · texto isolado
          Consome: Nome da experiência (state.lastPromoName)
         ───────────────────────────────────────────── */}
      <header
        data-region="top"
        className="absolute top-0 left-0 right-0 flex justify-center pt-6 px-6 z-10"
      >
        {promoName ? (
          <span data-field="promoName" className="text-white">
            {promoName}
          </span>
        ) : null}
      </header>

      {/* ─────────────────────────────────────────────
          3 · CLUSTER INFERIOR · agrupamento centro-baixo
          - Título maciço  → adTitle
          - Botão sólido   → travelPeriod (dias/data)
          - Botão outline  → firstHighlight (1º item da descrição)
         ───────────────────────────────────────────── */}
      <section
        data-region="bottom-cluster"
        className="absolute left-0 right-0 bottom-0 flex flex-col items-center gap-3 px-6 pb-10 z-10"
      >
        {adTitle ? (
          <h1 data-field="adTitle" className="text-white text-center">
            {adTitle}
          </h1>
        ) : null}

        {travelPeriod ? (
          <button
            type="button"
            data-field="travelPeriod"
            data-style="solid"
            className="text-white"
          >
            {travelPeriod}
          </button>
        ) : null}

        {firstHighlight ? (
          <button
            type="button"
            data-field="firstHighlight"
            data-style="outline"
            className="text-white"
          >
            {firstHighlight}
          </button>
        ) : null}
      </section>
    </article>
  );
}

export default V3Experiencia;
