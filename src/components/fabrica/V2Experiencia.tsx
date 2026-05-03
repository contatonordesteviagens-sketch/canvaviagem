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
import {
  getContrastTextStyle,
  getDropShadowClass,
  type BaseTextMode,
} from "@/lib/fabrica-text-contrast";

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
  baseTextMode?: BaseTextMode;
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
    baseTextMode: ((state as any).baseTextMode as BaseTextMode) || "light",
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
    baseTextMode = "light",
  } = props;

  const aspect = format === "square" ? "aspect-square" : "aspect-[9/16]";
  const textStyle = getContrastTextStyle(baseTextMode);
  const dropClass = getDropShadowClass(baseTextMode);
  const titleColor = baseTextMode === "dark" ? "#0A0A0A" : "#FFFFFF";

  // Tipografia editorial de luxo: serif para títulos/destaques, sans para tags
  const serifStack = `'${fontFamily || "Playfair Display"}', 'Playfair Display', 'Bodoni Moda', Georgia, serif`;
  const sansStack = `'Inter', system-ui, -apple-system, sans-serif`;

  // Título cinematográfico — escala mais agressiva
  const titleLen = (adTitle || "").length;
  const titleSizeClass =
    titleLen > 60
      ? "text-4xl sm:text-5xl"
      : titleLen > 36
      ? "text-5xl sm:text-6xl"
      : titleLen > 18
      ? "text-6xl sm:text-7xl"
      : "text-7xl sm:text-8xl";

  // Acento dourado refinado (metal escovado)
  const goldGradient =
    "linear-gradient(135deg, #b8860b 0%, #f5d97a 35%, #fff5cc 50%, #f5d97a 65%, #a87808 100%)";

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

      {/* Overlay cinematográfico: vinheta superior e inferior + viés sutil para legibilidade */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.15) 22%, rgba(0,0,0,0.05) 45%, rgba(0,0,0,0.25) 72%, rgba(0,0,0,0.75) 100%)",
        }}
      />
      {/* Vinheta radial nas bordas */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,0.45) 100%)",
        }}
      />

      {/* ============ TOP CENTRAL CONTAINER ============ */}
      <header
        data-region="top"
        className="absolute top-0 left-0 right-0 flex flex-col items-center text-center px-6 pt-7 gap-4"
      >
        {/* Tag superior · vidro escuro com borda dourada (refinado, neutro vs. cor da marca) */}
        {promoName && (
          <div
            data-slot="top-button-matte"
            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full backdrop-blur-xl bg-black/35 text-white text-[10px] sm:text-xs font-medium uppercase tracking-[0.32em] shadow-lg"
            style={{
              fontFamily: sansStack,
              border: "1px solid rgba(245, 217, 122, 0.45)",
              boxShadow:
                "inset 0 1px 0 rgba(255,255,255,0.08), 0 8px 24px rgba(0,0,0,0.35)",
            }}
          >
            <span
              className="inline-block w-1 h-1 rounded-full"
              style={{ background: goldGradient }}
            />
            {promoName}
          </div>
        )}

        {/* Texto Principal · Editorial Serif gigante */}
        {adTitle && (
          <h1
            data-slot="title-massive"
            className={`${titleSizeClass} font-bold leading-[0.92] tracking-[-0.015em] text-white`}
            style={{
              fontFamily: serifStack,
              textShadow:
                "0 2px 4px rgba(0,0,0,0.45), 0 8px 32px rgba(0,0,0,0.55), 0 1px 0 rgba(255,255,255,0.05)",
            }}
          >
            {adTitle}
          </h1>
        )}

        {/* Período · Linha dourada com texto (sem caixa pesada) */}
        {travelPeriod && (
          <div
            data-slot="gold-button"
            className="flex items-center gap-3 mt-1"
            style={{ fontFamily: sansStack }}
          >
            <span
              aria-hidden
              className="inline-block h-px w-8"
              style={{ background: goldGradient }}
            />
            <span
              className="text-[10px] sm:text-xs font-semibold uppercase tracking-[0.4em]"
              style={{
                background: goldGradient,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              {travelPeriod}
            </span>
            <span
              aria-hidden
              className="inline-block h-px w-8"
              style={{ background: goldGradient }}
            />
          </div>
        )}
      </header>

      {/* ============ LEFT PANEL · Selo lateral vertical refinado ============ */}
      <aside
        data-region="left"
        className="absolute left-0 top-1/2 -translate-y-1/2 max-w-[40%]"
      >
        <div
          data-slot="premium-badge"
          className="relative rounded-r-lg backdrop-blur-md py-3 pl-3 pr-5 shadow-2xl"
          style={{
            backgroundColor: `${secondaryColor}F2`,
            fontFamily: serifStack,
            borderLeft: "3px solid",
            borderImage: `${goldGradient} 1`,
          }}
        >
          {/* Linha dourada vertical interna */}
          <div
            aria-hidden
            className="absolute left-0 top-3 bottom-3 w-[2px]"
            style={{ background: goldGradient }}
          />
          <div
            className="flex items-center gap-1.5 mb-1.5"
            style={{
              fontFamily: sansStack,
              background: goldGradient,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            <Gem className="w-3 h-3" style={{ color: "#f5d97a" }} />
            <span className="text-[9px] uppercase tracking-[0.3em] font-bold">
              Destaque
            </span>
          </div>
          <p className="text-white text-base sm:text-xl font-semibold leading-[1.05] uppercase tracking-tight">
            {leftHighlight?.text || premiumBadge}
          </p>
        </div>
      </aside>

      {/* ============ RIGHT PANEL · Vidro escuro com lista vertical ============ */}
      {rightHighlights.length > 0 && (
        <aside
          data-region="right"
          className="absolute right-0 top-1/2 -translate-y-1/2 max-w-[44%]"
        >
          <div
            data-slot="highlights-stack"
            className="relative rounded-l-lg backdrop-blur-md py-4 pl-4 pr-3 shadow-2xl"
            style={{
              backgroundColor: "rgba(15, 15, 20, 0.55)",
              borderRight: "3px solid",
              borderImage: `${goldGradient} 1`,
            }}
          >
            {/* Linha dourada vertical interna direita */}
            <div
              aria-hidden
              className="absolute right-0 top-3 bottom-3 w-[2px]"
              style={{ background: goldGradient }}
            />
            <ul className="relative flex flex-col gap-2.5">
              {rightHighlights.map((h, i) => {
                const Icon = pickIcon(h.icon, i);
                return (
                  <li key={i} className="flex items-center gap-2.5">
                    <span
                      className="flex-shrink-0 inline-flex items-center justify-center w-6 h-6 rounded-full"
                      style={{
                        background: goldGradient,
                        boxShadow:
                          "inset 0 1px 0 rgba(255,255,255,0.4), 0 2px 6px rgba(0,0,0,0.4)",
                      }}
                    >
                      <Icon
                        className="w-3 h-3"
                        strokeWidth={2.5}
                        style={{ color: "#3a2a05" }}
                      />
                    </span>
                    <span
                      className="text-[11px] sm:text-sm leading-tight font-medium tracking-wide text-white"
                      style={{ fontFamily: serifStack }}
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

      {/* ============ BOTTOM BANNER · CTA editorial com fio dourado ============ */}
      <footer
        data-region="bottom"
        className="absolute bottom-0 left-0 right-0 px-4 pb-4"
      >
        {/* Fio dourado superior */}
        <div
          aria-hidden
          className="h-px w-full mb-0"
          style={{ background: goldGradient }}
        />
        <div
          data-slot="cta-banner"
          className="w-full rounded-b-lg py-3.5 px-5 flex items-center justify-center gap-3 shadow-2xl"
          style={{
            background: `linear-gradient(180deg, ${secondaryColor} 0%, ${secondaryColor}EE 100%)`,
            fontFamily: sansStack,
            boxShadow:
              "inset 0 1px 0 rgba(255,255,255,0.08), 0 -4px 20px rgba(0,0,0,0.3)",
          }}
        >
          <span
            className="font-semibold text-xs sm:text-sm uppercase tracking-[0.32em] text-white"
          >
            {ctaText.replace(/\s*→\s*$/, "")}
          </span>
          <span
            className="inline-flex items-center justify-center w-6 h-6 rounded-full"
            style={{ background: goldGradient }}
          >
            <ArrowRight
              className="w-3.5 h-3.5"
              strokeWidth={3}
              style={{ color: "#3a2a05" }}
            />
          </span>
        </div>
      </footer>
    </article>
  );
}

export default V2Experiencia;
