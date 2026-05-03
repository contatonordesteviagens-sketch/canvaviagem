// ============================================================
// V2_Experiencia · ESTRUTURA ESPACIAL (Categoria "Experiência de Destino")
// ------------------------------------------------------------
// ⚠️ ESTA É A CATEGORIA "EXPERIÊNCIA DE DESTINO".
//    NÃO EXISTEM campos de preço, desconto ou parcelamento aqui.
//
// Mapeamento ESTRITO de dados (formulário lateral → regiões):
//
//   ┌──────────────────────────────────────────────┐
//   │ BACKGROUND (100%) ← Destino (imagem de fundo)│
//   │                                              │
//   │      ┌──── TOP CONTAINER ────┐               │
//   │      │ • Botão Topo: lastPromoName          │
//   │      │ • Título Maciço: lastAdTitle          │
//   │      │   ({destino} → destinos[0])           │
//   │      │ • Botão Dourado: lastTravelPeriod    │
//   │      └──────────────────────┘               │
//   │                                              │
//   │  ┌──LEFT──┐              ┌──RIGHT──┐         │
//   │  │ Selo   │              │ Itens   │         │
//   │  │ Premium│              │ 2..N de │         │
//   │  │ ou hl[0]│             │ highlights│       │
//   │  └────────┘              └─────────┘         │
//   │                                              │
//   │ ┌──── BOTTOM BANNER ────┐                    │
//   │ │ CTA estático →        │                    │
//   │ └──────────────────────┘                     │
//   └──────────────────────────────────────────────┘
//
// CSS/design final ainda não definido — apenas regiões marcadas.
// ============================================================

import type { FabricaState } from "@/hooks/useFabricaContext";

export interface V2ExperienciaHighlight {
  text: string;
  icon?: string;
}

export interface V2ExperienciaProps {
  // Background
  backgroundImage: string;
  destination: string;

  // Top container
  promoName: string;            // → Botão Topo (Polímero Fosco)
  adTitle: string;              // → Texto Principal Maciço/Texturizado
  travelPeriod: string;         // → Botão Dourado abaixo do título

  // Left panel (selo premium / 1º highlight)
  leftHighlight: V2ExperienciaHighlight | null;
  premiumBadge: string;         // fallback estático: "EXCLUSIVO" / "PREMIUM VIP"

  // Right panel (highlights restantes)
  rightHighlights: V2ExperienciaHighlight[];

  // Bottom banner
  ctaText: string;              // estático

  // Identidade visual herdada (para futura camada de CSS)
  primaryColor: string;
  secondaryColor: string;
  fontFamily?: string;
  logoBase64?: string;

  // Formato
  format?: "story" | "square";
}

const PREMIUM_BADGE_FALLBACK = "EXCLUSIVO";
const CTA_FALLBACK = "DESCUBRA ESSA EXPERIÊNCIA →";
const TRAVEL_PERIOD_FALLBACK = "Datas exclusivas";

function normalizeHighlights(raw: any[]): V2ExperienciaHighlight[] {
  return (raw || [])
    .map((h) => {
      if (typeof h === "string") return { text: h };
      if (h && typeof h === "object") return { text: h.text || "", icon: h.icon };
      return null;
    })
    .filter((h): h is V2ExperienciaHighlight => !!h && !!h.text && h.text.trim().length > 0);
}

export function mapStateToV2Experiencia(
  state: FabricaState,
  backgroundImage: string,
): V2ExperienciaProps {
  const destination = state.destinos?.[0]?.trim() || "";
  const highlights = normalizeHighlights(state.lastHighlights || []);

  const resolvedAdTitle = (state.lastAdTitle || "")
    .replace(/\{destino\}/gi, destination);

  return {
    backgroundImage,
    destination,

    promoName: state.lastPromoName || "",
    adTitle: resolvedAdTitle,
    travelPeriod: (state.lastTravelPeriod || "").trim() || TRAVEL_PERIOD_FALLBACK,

    leftHighlight: highlights[0] || null,
    premiumBadge: PREMIUM_BADGE_FALLBACK,

    rightHighlights: highlights.slice(1, 4), // itens 2, 3 e 4

    ctaText: CTA_FALLBACK,

    primaryColor: state.primaryColor,
    secondaryColor: state.secondaryColor,
    fontFamily: (state as any).fontFamily,
    logoBase64: state.logoBase64 || "",

    format: state.lastFormat === "square" ? "square" : "story",
  };
}

/**
 * V2Experiencia — ESQUELETO ESPACIAL.
 * Regiões (Top / Left / Right / Bottom) já consomem os campos corretos
 * da categoria "Experiência de Destino". CSS final ainda pendente.
 */
export function V2Experiencia(props: V2ExperienciaProps) {
  const {
    backgroundImage,
    destination,
    promoName,
    adTitle,
    travelPeriod,
    leftHighlight,
    premiumBadge,
    rightHighlights,
    ctaText,
    format = "story",
  } = props;

  const aspect = format === "square" ? "aspect-square" : "aspect-[9/16]";

  return (
    <article
      data-variant="V2_Experiencia"
      data-category="experiencia_destino"
      data-status="layout-pending"
      className={`relative w-full ${aspect} overflow-hidden rounded-xl bg-black select-none`}
    >
      {/* ============ BACKGROUND (100%) ============ */}
      <div data-region="background" className="absolute inset-0">
        <img
          src={backgroundImage}
          alt={destination || "destino"}
          className="absolute inset-0 w-full h-full object-cover"
          draggable={false}
        />
      </div>

      {/* ============ TOP CENTRAL CONTAINER ============ */}
      <header
        data-region="top"
        className="absolute top-0 left-0 right-0 flex flex-col items-center text-center"
      >
        {/* Botão Topo (Polímero Fosco) — Nome da experiência */}
        {promoName && (
          <div data-slot="top-button-matte" data-source="lastPromoName">
            {promoName}
          </div>
        )}

        {/* Texto Principal Maciço/Texturizado — Título do anúncio */}
        {adTitle && (
          <h1 data-slot="title-massive" data-source="lastAdTitle">
            {adTitle}
          </h1>
        )}

        {/* Botão Dourado — Dias / data da viagem */}
        {travelPeriod && (
          <div data-slot="gold-button" data-source="lastTravelPeriod">
            {travelPeriod}
          </div>
        )}
      </header>

      {/* ============ LEFT PANEL (Fosco / Destaque Premium) ============ */}
      <aside
        data-region="left"
        className="absolute left-0 top-1/2 -translate-y-1/2 flex flex-col items-start"
      >
        <div data-slot="premium-badge" data-source="staticOrHighlight[0]">
          {leftHighlight?.text || premiumBadge}
        </div>
      </aside>

      {/* ============ RIGHT PANEL (Listrado vertical) ============ */}
      <aside
        data-region="right"
        className="absolute right-0 top-1/2 -translate-y-1/2 flex flex-col items-end"
      >
        <ul data-slot="highlights-list" data-source="lastHighlights[1..3]">
          {rightHighlights.map((h, i) => (
            <li key={i} data-slot="highlight-item">
              {h.icon && <span data-slot="highlight-icon">{h.icon}</span>}
              <span data-slot="highlight-text">{h.text}</span>
            </li>
          ))}
        </ul>
      </aside>

      {/* ============ BOTTOM BANNER (CTA estático) ============ */}
      <footer
        data-region="bottom"
        className="absolute bottom-0 left-0 right-0 flex items-center justify-center text-center"
      >
        <div data-slot="cta-banner" data-source="static">
          {ctaText}
        </div>
      </footer>
    </article>
  );
}

export default V2Experiencia;
