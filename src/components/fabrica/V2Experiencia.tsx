// ============================================================
// V2_Experiencia · LUXO MATERIAL (Categoria "Experiência de Destino")
// ------------------------------------------------------------
// Texturas/materiais simulados via Tailwind sobre foto aérea de drone:
//   • Polímero fosco (botão topo)         → backdrop-blur + cor primária
//   • Tipografia maciça texturizada       → drop-shadow-2xl + font-black
//   • Metal escovado dourado (botão)      → gradient yellow + ring dourado
//   • Estuque/listras (painel direito)    → bg-white/10 + border-l + listras
//   • Fosco serifado (painel esquerdo)    → bg secundária/90 + serif
//
// Categoria "Experiência de Destino" — NÃO há campos de preço/desconto.
// ============================================================

import {
  Star,
  Umbrella,
  Gem,
  Plane,
  Hotel,
  Bus,
  MapPin,
  Sun,
  Coffee,
  Camera,
  Heart,
  Check,
  Ship,
  Palmtree,
  Wifi,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
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
  promoName: string;
  adTitle: string;
  travelPeriod: string;

  // Left panel
  leftHighlight: V2ExperienciaHighlight | null;
  premiumBadge: string;

  // Right panel
  rightHighlights: V2ExperienciaHighlight[];

  // Bottom banner
  ctaText: string;

  // Identidade visual
  primaryColor: string;
  secondaryColor: string;
  fontFamily?: string;
  logoBase64?: string;

  format?: "story" | "square";
}

const PREMIUM_BADGE_FALLBACK = "EXCLUSIVO";
const CTA_FALLBACK = "DESCUBRA ESSA EXPERIÊNCIA →";
const TRAVEL_PERIOD_FALLBACK = "Datas exclusivas";

const ICON_MAP: Record<string, LucideIcon> = {
  star: Star,
  heart: Heart,
  check: Check,
  plane: Plane,
  hotel: Hotel,
  bus: Bus,
  map: MapPin,
  sun: Sun,
  coffee: Coffee,
  camera: Camera,
  ship: Ship,
  palm: Palmtree,
  wifi: Wifi,
  guide: Sparkles,
};

function pickIcon(key: string | undefined, idx: number): LucideIcon {
  if (key && ICON_MAP[key]) return ICON_MAP[key];
  // fallback rotativo elegante
  const fallback = [Star, Umbrella, Gem, Sparkles];
  return fallback[idx % fallback.length];
}

function normalizeHighlights(raw: any[]): V2ExperienciaHighlight[] {
  return (raw || [])
    .map((h): V2ExperienciaHighlight | null => {
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

    rightHighlights: highlights.slice(1, 4),

    ctaText: CTA_FALLBACK,

    primaryColor: state.primaryColor,
    secondaryColor: state.secondaryColor,
    fontFamily: (state as any).fontFamily,
    logoBase64: state.logoBase64 || "",

    format: state.lastFormat === "square" ? "square" : "story",
  };
}

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
    primaryColor,
    secondaryColor,
    fontFamily,
    format = "story",
  } = props;

  const aspect = format === "square" ? "aspect-square" : "aspect-[9/16]";

  // Tipografia: usa a fonte selecionada no formulário, com fallback serifado de luxo
  const serifStack = `'${fontFamily || "Playfair Display"}', 'Playfair Display', 'Bodoni Moda', Georgia, serif`;
  const sansStack = `'${fontFamily || "Inter"}', Inter, system-ui, sans-serif`;

  // Comprimento adaptativo do título maciço
  const titleLen = (adTitle || "").length;
  const titleSizeClass =
    titleLen > 60
      ? "text-3xl sm:text-4xl"
      : titleLen > 36
      ? "text-4xl sm:text-5xl"
      : titleLen > 18
      ? "text-5xl sm:text-6xl"
      : "text-6xl sm:text-7xl";

  return (
    <article
      data-variant="V2_Experiencia"
      data-category="experiencia_destino"
      className={`relative w-full ${aspect} overflow-hidden rounded-xl bg-black select-none`}
    >
      {/* ============ BACKGROUND (foto aérea drone) ============ */}
      <img
        src={backgroundImage}
        alt={destination || "destino"}
        className="absolute inset-0 w-full h-full object-cover"
        draggable={false}
      />
      {/* Overlay gradiente sutil para profundidade premium */}
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-b from-black/25 via-transparent to-black/45"
      />

      {/* ============ TOP CENTRAL CONTAINER ============ */}
      <header
        data-region="top"
        className="absolute top-0 left-0 right-0 flex flex-col items-center text-center px-5 pt-6 gap-3"
      >
        {/* Botão Topo · Polímero Fosco */}
        {promoName && (
          <div
            data-slot="top-button-matte"
            className="px-5 py-2 rounded-2xl backdrop-blur-md text-white text-xs sm:text-sm font-semibold uppercase tracking-[0.2em] shadow-lg ring-1 ring-white/15"
            style={{
              backgroundColor: `${primaryColor}CC`, // /80 com transparência fosca
              fontFamily: sansStack,
            }}
          >
            <Check className="inline-block w-3.5 h-3.5 mr-1.5 -mt-0.5" />
            {promoName}
          </div>
        )}

        {/* Texto Principal · Maciço/Texturizado */}
        {adTitle && (
          <h1
            data-slot="title-massive"
            className={`${titleSizeClass} font-black uppercase leading-[0.95] tracking-tight text-white drop-shadow-2xl [text-shadow:_0_4px_18px_rgba(0,0,0,0.55)]`}
            style={{ fontFamily: sansStack }}
          >
            {adTitle}
          </h1>
        )}

        {/* Botão Dourado · Metal escovado */}
        {travelPeriod && (
          <div
            data-slot="gold-button"
            className="mt-1 px-5 py-2 rounded-2xl text-white text-xs sm:text-sm font-bold uppercase tracking-wider bg-gradient-to-r from-yellow-500 via-yellow-400 to-yellow-600 ring-1 ring-yellow-200/60 shadow-[inset_0_1px_0_rgba(255,255,255,0.35),0_6px_18px_rgba(180,120,0,0.35)]"
            style={{ fontFamily: sansStack }}
          >
            {travelPeriod}
          </div>
        )}
      </header>

      {/* ============ LEFT PANEL · Fosco / Selo Premium ============ */}
      <aside
        data-region="left"
        className="absolute left-0 top-1/2 -translate-y-1/2 max-w-[42%] pl-0"
      >
        <div
          data-slot="premium-badge"
          className="rounded-r-xl backdrop-blur-sm p-4 pr-5 shadow-xl ring-1 ring-white/10"
          style={{
            backgroundColor: `${secondaryColor}E6`, // /90
            fontFamily: serifStack,
          }}
        >
          <div className="flex items-center gap-2 mb-1.5 text-white/90">
            <Gem className="w-4 h-4" />
            <span
              className="text-[10px] uppercase tracking-[0.25em] font-semibold"
              style={{ fontFamily: sansStack }}
            >
              Destaque
            </span>
          </div>
          <p className="text-white text-lg sm:text-2xl font-bold leading-tight uppercase drop-shadow-md">
            {leftHighlight?.text || premiumBadge}
          </p>
        </div>
      </aside>

      {/* ============ RIGHT PANEL · Estuque listrado ============ */}
      {rightHighlights.length > 0 && (
        <aside
          data-region="right"
          className="absolute right-0 top-1/2 -translate-y-1/2 max-w-[46%]"
        >
          <div
            data-slot="highlights-stack"
            className="relative rounded-l-xl bg-white/10 backdrop-blur-md border-l-2 border-white/25 p-4 pl-5 shadow-xl"
          >
            {/* Listras verticais sutis (estuque) */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 rounded-l-xl opacity-30"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(90deg, rgba(255,255,255,0.08) 0px, rgba(255,255,255,0.08) 1px, transparent 1px, transparent 8px)",
              }}
            />
            <ul className="relative flex flex-col gap-3">
              {rightHighlights.map((h, i) => {
                const Icon = pickIcon(h.icon, i);
                return (
                  <li key={i} className="flex items-center gap-2.5">
                    <span
                      className="flex-shrink-0 inline-flex items-center justify-center w-7 h-7 rounded-full bg-white/90 ring-1 ring-white/40 shadow-sm"
                      style={{ color: primaryColor }}
                    >
                      <Icon className="w-4 h-4" strokeWidth={2.4} />
                    </span>
                    <span
                      className="text-xs sm:text-sm leading-tight font-semibold tracking-wide"
                      style={{ fontFamily: serifStack, color: secondaryColor }}
                    >
                      {h.text}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        </aside>
      )}

      {/* ============ BOTTOM BANNER · CTA estático ============ */}
      <footer
        data-region="bottom"
        className="absolute bottom-0 left-0 right-0 px-3 pb-3"
      >
        <div
          data-slot="cta-banner"
          className="w-full rounded-t-xl py-3 px-4 flex items-center justify-center gap-2 shadow-2xl ring-1 ring-white/10"
          style={{
            backgroundColor: secondaryColor,
            fontFamily: sansStack,
          }}
        >
          <span
            className="font-bold text-sm sm:text-base uppercase tracking-[0.18em]"
            style={{ color: primaryColor }}
          >
            {ctaText.replace(/\s*→\s*$/, "")}
          </span>
          <ArrowRight
            className="w-5 h-5"
            strokeWidth={2.5}
            style={{ color: "#EAB308" /* dourado */ }}
          />
        </div>
      </footer>
    </article>
  );
}

export default V2Experiencia;
