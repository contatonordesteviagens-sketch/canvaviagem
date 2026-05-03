// ============================================================
// V2_Experiencia · ESTRUTURA ESPACIAL (Categoria "Experiência de Destino")
// ------------------------------------------------------------
// ⚠️ Apenas ARQUITETURA de regiões + MAPEAMENTO de dados.
//    - SEM CSS final, SEM design (cores/tipografia/texturas).
//    - SEM chamadas de API.
//    - Renderiza só quando categoria === "experiencia_destino"
//      E variation === 2 (forceVariant === 2).
//    - Não toca em V0_Experiencia, V1_Experiencia ou V0..V4 de Oferta.
//
// Regiões previstas (Grid):
//   ┌─────────────────────────────────────────┐
//   │              BACKGROUND (full)          │
//   │   ┌───────────────────────────────┐     │
//   │   │   TOP CENTER                  │     │
//   │   │   • Botão Polímero Fosco      │     │
//   │   │   • Preço Maciço              │     │
//   │   │   • Botão Dourado             │     │
//   │   └───────────────────────────────┘     │
//   │ ┌───────┐                   ┌─────────┐ │
//   │ │ LEFT  │                   │  RIGHT  │ │
//   │ │ Fosco │                   │ Listrado│ │
//   │ │  %    │                   │ Benef.  │ │
//   │ └───────┘                   └─────────┘ │
//   │   ┌───────────────────────────────┐     │
//   │   │   BOTTOM BANNER (CTA)         │     │
//   │   └───────────────────────────────┘     │
//   └─────────────────────────────────────────┘
// ============================================================

import type { FabricaState } from "@/hooks/useFabricaContext";

export interface V2ExperienciaBenefit {
  icon?: string;
  text: string;
}

export interface V2ExperienciaProps {
  // Background
  backgroundImage: string;
  destination: string;

  // Top center
  promoName: string;          // Botão Polímero Fosco
  price: string;              // Preço Maciço (R$)
  currency: string;
  paymentSuffix: string;      // ex: "por pessoa"
  adTitle: string;            // Botão Dourado (Título do anúncio / complemento)

  // Left panel
  discountLabel: string;      // ex: "45%"
  discountCaption: string;    // ex: "OFF" / "DESCONTO"

  // Right panel
  benefits: V2ExperienciaBenefit[];

  // Bottom banner
  ctaText: string;

  // Branding herdado do formulário (para uso futuro no CSS)
  logoBase64?: string;
  primaryColor: string;
  secondaryColor: string;
  travelPeriod: string;
  format?: "story" | "square";
}

const CTA_DEFAULT = "COMPARE E RESERVE AGORA →";

// ---------- Helpers de extração ----------
function extractDiscount(state: FabricaState): { label: string; caption: string } {
  // Tenta achar um percentual em promoName / adTitle / paymentLabel
  const haystacks = [
    state.lastPromoName,
    state.lastAdTitle,
    state.lastPaymentLabel,
    state.lastPaymentSuffix,
  ].filter(Boolean) as string[];

  for (const h of haystacks) {
    const m = h.match(/(\d{1,2})\s*%/);
    if (m) return { label: `${m[1]}%`, caption: "OFF" };
  }
  return { label: "OFF", caption: "OFERTA" };
}

function extractBenefits(state: FabricaState): V2ExperienciaBenefit[] {
  const raw = state.lastHighlights || [];
  return raw
    .map((h: any): V2ExperienciaBenefit | null => {
      if (!h) return null;
      if (typeof h === "string") {
        const text = h.trim();
        return text ? { text } : null;
      }
      const text = (h.text || h.label || "").toString().trim();
      if (!text) return null;
      return { icon: h.icon || h.emoji || undefined, text };
    })
    .filter((b): b is V2ExperienciaBenefit => !!b);
}

export function mapStateToV2Experiencia(
  state: FabricaState,
  backgroundImage: string,
): V2ExperienciaProps {
  const destination = state.destinos?.[0]?.trim() || "";
  const adTitle = (state.lastAdTitle || "").replace(/\{destino\}/gi, destination);
  const { label: discountLabel, caption: discountCaption } = extractDiscount(state);

  return {
    // Background
    backgroundImage,
    destination,

    // Top center
    promoName: state.lastPromoName || "",
    price: state.lastPrice || "",
    currency: state.lastCurrency || "R$",
    paymentSuffix: state.lastPaymentSuffix || "",
    adTitle,

    // Left
    discountLabel,
    discountCaption,

    // Right
    benefits: extractBenefits(state),

    // Bottom
    ctaText: CTA_DEFAULT,

    // Branding/contexto
    logoBase64: state.logoBase64 || "",
    primaryColor: state.primaryColor,
    secondaryColor: state.secondaryColor,
    travelPeriod: state.lastTravelPeriod || "",
    format: state.lastFormat === "square" ? "square" : "story",
  };
}

/**
 * V2Experiencia — ESQUELETO ESPACIAL.
 * As regiões estão posicionadas com classes utilitárias mínimas só para
 * indicar a arquitetura (Top / Left / Right / Bottom). Nenhuma decisão
 * de design final (cores, fontes, texturas, sombras) foi aplicada.
 */
export function V2Experiencia(props: V2ExperienciaProps) {
  const {
    backgroundImage,
    destination,
    promoName,
    price,
    currency,
    paymentSuffix,
    adTitle,
    discountLabel,
    discountCaption,
    benefits,
    ctaText,
    format = "story",
  } = props;

  const aspect = format === "square" ? "aspect-square" : "aspect-[9/16]";

  return (
    <article
      data-variant="V2_Experiencia"
      data-category="experiencia_destino"
      data-status="structure-only"
      className={`relative w-full ${aspect} overflow-hidden rounded-xl bg-black select-none`}
    >
      {/* ============ BACKGROUND ============ */}
      <img
        src={backgroundImage}
        alt={destination || "destino"}
        className="absolute inset-0 w-full h-full object-cover"
        draggable={false}
      />

      {/* Grid de regiões (estrutura, sem design final) */}
      <div className="absolute inset-0 grid grid-rows-[auto_1fr_auto]">
        {/* ============ TOP CENTER ============ */}
        <header
          data-region="top-center"
          className="flex flex-col items-center justify-start pt-[6%] gap-2"
        >
          {/* Botão Polímero Fosco · Nome da promoção */}
          <div data-slot="promo-button">{promoName}</div>

          {/* Preço Maciço · Valor (R$) */}
          <div data-slot="price">
            <span data-slot="currency">{currency}</span>
            <span data-slot="price-value">{price}</span>
            {paymentSuffix && (
              <span data-slot="price-suffix">{paymentSuffix}</span>
            )}
          </div>

          {/* Botão Dourado · Título do anúncio / Complemento */}
          <div data-slot="ad-title-button">{adTitle}</div>
        </header>

        {/* ============ MIDDLE (Left + Right) ============ */}
        <div className="relative flex justify-between items-center px-[4%]">
          {/* PAINEL ESQUERDO Fosco · Desconto */}
          <aside
            data-region="left-panel"
            className="flex flex-col items-start"
          >
            <div data-slot="discount-value">{discountLabel}</div>
            <div data-slot="discount-caption">{discountCaption}</div>
          </aside>

          {/* PAINEL DIREITO Listrado vertical · Benefícios */}
          <aside
            data-region="right-panel"
            className="flex flex-col items-end gap-1"
          >
            {benefits.length === 0 ? (
              <div data-slot="benefit-empty" />
            ) : (
              benefits.map((b, i) => (
                <div
                  key={`${i}-${b.text}`}
                  data-slot="benefit-item"
                  className="flex items-center gap-1"
                >
                  {b.icon && <span data-slot="benefit-icon">{b.icon}</span>}
                  <span data-slot="benefit-text">{b.text}</span>
                </div>
              ))
            )}
          </aside>
        </div>

        {/* ============ BOTTOM BANNER ============ */}
        <footer
          data-region="bottom-banner"
          className="flex items-center justify-center pb-[5%]"
        >
          <div data-slot="cta-text">{ctaText}</div>
        </footer>
      </div>
    </article>
  );
}

export default V2Experiencia;
