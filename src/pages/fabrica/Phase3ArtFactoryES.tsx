import { useState, useRef, useEffect } from "react";
import { useFabricaContext } from "@/hooks/useFabricaContext";
import { useAuth } from "@/contexts/AuthContext";
import { useDiagnosticos } from "@/hooks/useFabricaDiagnosticos";
import { type StrategyId } from "@/data/fabrica-prompts";
import { CATEGORIAS, getCategoria, pickPromptsForCategoria, type CategoriaId } from "@/data/fabrica-categories";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { composeTravelAd, formatAdPhone, type PaymentMode } from "@/lib/fabrica-compose-art";
import { getForbiddenSets, registerGeneration, freshSeed } from "@/lib/fabrica-generation-guard";
import {
  Loader2, Download, Sparkles, ArrowRight, Plus, X, Trash2, ChevronDown, RotateCcw,
  Bus, Hotel, Plane, Check, Star, Heart, Sun, Camera, MapPin, Utensils, Ship, Palmtree, Coffee, Wifi, User,
  Square, Smartphone, Image as ImageIcon, Upload, Link2, Search, Wand2, Copy, ClipboardCheck, FileText,
} from "lucide-react";
import { toast } from "sonner";

type GenMode = "ai" | "photo" | "custom";
type CustomSource = "upload" | "link";

interface Props { onNext: () => void; onBack: () => void; }

const FABRICA_RENDER_ENGINE_VERSION = "canvas-hybrid-v3-nowordmark";

const BADGE_BG: Record<string, string> = {
  blue: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  purple: "bg-purple-500/15 text-purple-400 border-purple-500/30",
  green: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  red: "bg-red-500/15 text-red-400 border-red-500/30",
};

type IconKey = "bus" | "hotel" | "plane" | "check" | "star" | "heart" | "sun" | "camera" | "map" | "food" | "ship" | "palm" | "coffee" | "guide" | "wifi";

const ICON_OPTIONS: { key: IconKey; Icon: typeof Bus; label: string }[] = [
  { key: "check", Icon: Check, label: "Check" },
  { key: "bus", Icon: Bus, label: "Autobús" },
  { key: "hotel", Icon: Hotel, label: "Hotel" },
  { key: "plane", Icon: Plane, label: "Avión" },
  { key: "ship", Icon: Ship, label: "Barco" },
  { key: "palm", Icon: Palmtree, label: "Palmera" },
  { key: "sun", Icon: Sun, label: "Sol" },
  { key: "food", Icon: Utensils, label: "Comida" },
  { key: "coffee", Icon: Coffee, label: "Café" },
  { key: "map", Icon: MapPin, label: "Mapa" },
  { key: "camera", Icon: Camera, label: "Cámara" },
  { key: "star", Icon: Star, label: "Estrella" },
  { key: "heart", Icon: Heart, label: "Corazón" },
  { key: "guide", Icon: User, label: "Guía" },
  { key: "wifi", Icon: Wifi, label: "Wi-Fi" },
];

interface Highlight { text: string; icon: IconKey; }

const DEFAULT_HIGHLIGHTS: Highlight[] = [
  { text: "Transporte incluido", icon: "bus" },
  { text: "Alojamiento", icon: "hotel" },
  { text: "Desayuno", icon: "coffee" },
  { text: "Guía local", icon: "guide" },
];

const DEFAULT_EXPERIENCE_HIGHLIGHTS: Highlight[] = [
  { text: "EXPERIENCIA SENSORIAL", icon: "check" },
  { text: "MOMENTOS INOLVIDABLES", icon: "check" },
  { text: "CURADURÍA PREMIUM", icon: "check" },
];

const DEFAULT_SUFFIXES_OFERTA = new Set(["por persona", "por pareja", "por paquete", "por grupo", "total del paquete"]);
const DEFAULT_SUFFIX_EXPERIENCIA = "Tu viaje comienza aquí";

// ====== Padronização de CORES por categoria ======
// Estas cores são aplicadas automaticamente ao trocar de categoria, garantindo
// um visual coerente com o "tom" daquela categoria (oferta = 🖼️mbar/quente,
// experiência = navy/dourado luxo). O usuário pode customizar livremente depois;
// só são re-aplicadas se ele ainda estiver usando os defaults da OUTRA categoria.
const DEFAULT_COLORS_OFERTA = { primary: "#F59E0B", secondary: "#FCD34D" };
const DEFAULT_COLORS_EXPERIENCIA = { primary: "#0C2340", secondary: "#C9A84C" };

const isSameHex = (a: string, b: string) =>
  (a || "").trim().toLowerCase() === (b || "").trim().toLowerCase();

const isDefaultColorsOferta = (p: string, s: string) =>
  isSameHex(p, DEFAULT_COLORS_OFERTA.primary) && isSameHex(s, DEFAULT_COLORS_OFERTA.secondary);
const isDefaultColorsExperiencia = (p: string, s: string) =>
  isSameHex(p, DEFAULT_COLORS_EXPERIENCIA.primary) && isSameHex(s, DEFAULT_COLORS_EXPERIENCIA.secondary);

const sameHighlightTexts = (items: Highlight[], defaults: Highlight[]) =>
  items.length === defaults.length &&
  items.every((item, index) => item.text === defaults[index]?.text);

// Paleta enxuta: 10 cores distintas (sem repetir tons próximos)
const PRESET_COLORS = [
  "#000000", // preto
  "#ffffff", // branco
  "#6b7280", // cinza
  "#0c2340", // azul marinho
  "#2563eb", // azul
  "#7c3aed", // roxo
  "#dc2626", // vermelho
  "#f97316", // laranja
  "#facc15", // amarelo
  "#16a34a", // verde
];

type Currency = "BRL" | "USD" | "EUR" | "ARS" | "GBP";
const CURRENCY_PRESETS: { id: Currency; symbol: string; label: string; locale: string }[] = [
  { id: "BRL", symbol: "$", label: "Real ($)", locale: "es-ES" },
  { id: "USD", symbol: "US$", label: "Dólar (US$)", locale: "en-US" },
  { id: "EUR", symbol: "🖼️‚¬", label: "Euro (🖼️‚¬)", locale: "de-DE" },
  { id: "GBP", symbol: "Â£", label: "Libra (Â£)", locale: "en-GB" },
  { id: "ARS", symbol: "A$", label: "Peso AR (A$)", locale: "es-AR" },
];

/**
 * Formata um valor de preço aplicando separador de milhar e casa decimal
 * conforme a moeda selecionada. Aceita strings com vírgula ou ponto como decimal.
 * Ex: "4124312"  🖼️†’ BRL: "4.124.312,00"  USD: "4,124,312.00"
 *     "1499,90"  🖼️†’ BRL: "1.499,90"
 */
const formatPriceValue = (raw: string, currency: Currency, assumeCents = false, noCents = false): string => {
  const value = (raw || "").trim();
  if (!value) return "";
  
  // Limpa tudo exceto números e separadores existentes
  const cleaned = value.replace(/[^\d.,]/g, "");
  const digits = cleaned.replace(/\D/g, "");
  if (!digits) return "";

  let num = 0;
  
  // ðŸ›¡ï¸ REGRA DE OURO: O cálculo do valor escalar numérico NÃƒO PODE depender de `noCents`.
  // Nós extraímos o valor REAL contido na string e apenas FORMATAMOS depois.
  if (assumeCents) {
    // Se assumeCents for true (vindo de digitação direta sem separador), trata os últimos 2 como decimais
    num = parseInt(digits, 10) / 100;
  } else {
    // Tenta encontrar o último separador decimal para extrair a parte inteira e fracionária.
    const lastComma = cleaned.lastIndexOf(",");
    const lastDot = cleaned.lastIndexOf(".");
    const lastSep = Math.max(lastComma, lastDot);
    
    if (lastSep !== -1) {
      // Pega o texto após o separador e valida se são no máximo 2 dígitos
      const afterSepText = cleaned.slice(lastSep + 1).replace(/\D/g, "");
      
      // Se tiver mais de 2 dígitos após o separador, provavelmente é separador de milhar em digitação errática
      if (afterSepText.length > 2) {
         // Trata tudo como dígitos contínuos, valor bruto
         num = parseInt(digits, 10);
      } else {
         // Interpretamos como decimal legítimo
         const intPart = cleaned.slice(0, lastSep).replace(/\D/g, "");
         const decPart = afterSepText.slice(0, 2);
         num = parseInt(intPart || "0", 10) + parseInt(decPart.padEnd(2, "0"), 10) / 100;
      }
    } else {
      // Sem nenhum separador, é um inteiro puro
      num = parseInt(digits, 10);
    }
  }

  const preset = CURRENCY_PRESETS.find((c) => c.id === currency)!;
  try {
    return new Intl.NumberFormat(preset.locale, {
      minimumFractionDigits: noCents ? 0 : 2,
      maximumFractionDigits: noCents ? 0 : 2,
    }).format(num);
  } catch {
    return value;
  }
};

const buildPriceWithCurrency = (raw: string, currency: Currency): string => {
  const formatted = formatPriceValue(raw, currency);
  if (!formatted) return "";
  const sym = CURRENCY_PRESETS.find((c) => c.id === currency)?.symbol || "$";
  return `${sym} ${formatted}`;
};

const stripCurrencyFromPrice = (raw: string, currency: Currency): string => {
  const sym = CURRENCY_PRESETS.find((c) => c.id === currency)?.symbol || "$";
  return (raw || "").replace(sym, "").replace(/R\$|US\$|AR\$|🖼️‚¬|Â£/g, "").trim();
};

const formatPriceWhileTyping = (raw: string, currency: Currency): string => {
  const value = stripCurrencyFromPrice(raw, currency);
  if (!value.trim()) return "";
  
  // Se contiver letras, não tenta formatar como número (permite "Grátis", "Sob consulta")
  if (/[A-Za-zÀ-ÿ]/.test(value)) return value;
  
  const digits = value.replace(/\D/g, "");
  const hasManualSeparator = /[.,]/.test(value);
  
  // Assume centavos se houver muitos dígitos e nenhum separador foi digitado ainda
  const shouldAssumeCents = digits.length >= 4 && !hasManualSeparator;
  
  if (digits.length >= 3 || hasManualSeparator) {
    return formatPriceValue(value, currency, shouldAssumeCents);
  }
  return value;
};

interface PaymentPreset {
  id: PaymentMode;
  name: string;
  emoji: string;
  description: string;
  hint: string;          // dica do que digitar
  defaultLabel?: string; // label padrão
}

const PAYMENT_PRESETS: PaymentPreset[] = [
  { id: "installments", name: "En cuotas",          emoji: "💳", description: "Ex: 10x $ 149,90",       hint: "Parcelas: 10x · Valor: 149,90" },
  { id: "cash",         name: "Al contado",            emoji: "💰", description: "Ex: À VISTA $ 1.499",    hint: "Valor: 1.499" },
  { id: "down_plus",    name: "Enganche + cuotas", emoji: "ðŸ’µ", description: "Ex: ENTRADA + 10x $ 149", hint: "Parcelas: ENTRADA $ 200 + 10x · Valor: 149" },
];

const AD_TITLE_PRESETS: string[] = [
  "Conoce lo mejor de {destino}",
  "Descubre {destino}",
  "Paquete {destino}",
  "Explora {destino}",
  "{destino} te va a sorprender",
  "¡Tienes que conocer {destino}!",
  "Qué hacer en {destino}",
  "Lo mejor de {destino}",
  "Mi sueño se llama {destino}",
  "¿Vámonos a {destino}",
  "Tu próximo viaje es {destino}",
  "Paquete Promocional {destino}",
  "Viaje Completo {destino}",
  "{destino} te espera",
  "¿Vamos a {destino}?",
];

// Presets de TÍTULO para a categoria "Experiencia de Destino" (luxo / sensação)
const AD_TITLE_PRESETS_EXPERIENCIA: string[] = [
  "Tu próximo viaje es {destino}",
  "Vive lo mejor de {destino}",
  "Momentos inolvidables en {destino}",
  "Despierta tus sentidos en {destino}",
  "Experiencia exclusiva en {destino}",
  "Placer en cada detalle · {destino}",
  "{destino} como nunca has vivido",
  "All Inclusive · {destino}",
  "Refugio de los sueños en {destino}",
  "Descubre el lado secreto de {destino}",
];

// Nomes "promo" sofisticados para Experiencia de Destino
const PROMO_NAME_PRESETS_EXPERIENCIA: string[] = [
  "EXPERIENCIA EXCLUSIVA",
  "MOMENTOS INOLVIDABLES",
  "PLACER EN CADA VIAJE",
  "ALL INCLUSIVE",
  "VIVENCIA PREMIUM",
  "REFUGIO DE LOS SUEÑOS",
];

const PROMO_NAME_PRESETS: string[] = [
  "OFERTA ESPECIAL",
  "SÚPER OFERTA",
  "ÚLTIMOS CUPOS",
  "PROMOCIÓN DEL DÍA",
  "BLACK FRIDAY",
  "LIQUIDACIÓN"
];

// Defaults reconhecidos como "padrão da Oferta" — autorizados a serem sobrescritos
// quando o usuário troca de categoria sem ter customizado.
const DEFAULT_PROMO_NAMES_OFERTA = new Set(["OFERTA ESPECIAL", "Oferta Especial", "BLACK FRIDAY"]);
const DEFAULT_AD_TITLES_OFERTA = new Set(["Paquete {destino}", "Conoce lo mejor de {destino}", "Descubre {destino}"]);
const DEFAULT_PROMO_NAMES_EXPERIENCIA = new Set(PROMO_NAME_PRESETS_EXPERIENCIA);
const DEFAULT_AD_TITLES_EXPERIENCIA = new Set(AD_TITLE_PRESETS_EXPERIENCIA);

const TRAVEL_PERIOD_PRESETS: string[] = [
  "5 días", "7 días", "10 días", "15 días", "Fin de semana",
  "Enero", "Julio", "Diciembre", "Fin de semana largo", "12 al 18/01",
  "Fecha flexible", "Salidas semanales",
];

const TITLE_NEIGHBORS: Record<string, string[]> = {
  "Conoce lo mejor de {destino}": ["Descubre {destino}", "Paquete {destino}"],
  "Descubre {destino}": ["Conoce lo mejor de {destino}", "Explora {destino}"],
  "Paquete {destino}": ["Viaje Completo {destino}", "Paquete Promocional {destino}"],
  "Explora {destino}": ["Descubre {destino}", "{destino} te va a sorprender"],
  "¿Vámonos a {destino}": ["¿Vamos a {destino}?", "{destino} te espera"],
  "¿Vamos a {destino}?": ["¿Vámonos a {destino}", "{destino} te espera"],
  // Vizinhos de Experiência
  "Tu próximo viaje es {destino}": ["Vive lo mejor de {destino}", "Momentos inolvidables en {destino}"],
  "Vive lo mejor de {destino}": ["Tu próximo viaje es {destino}", "Experiencia exclusiva en {destino}"],
  "Momentos inolvidables en {destino}": ["Despierta tus sentidos en {destino}", "Placer en cada detalle · {destino}"],
  "Despierta tus sentidos en {destino}": ["Momentos inolvidables en {destino}", "Refugio de los sueños en {destino}"],
  "Experiencia exclusiva en {destino}": ["Vive lo mejor de {destino}", "{destino} como nunca has vivido"],
  "Placer en cada detalle · {destino}": ["All Inclusive · {destino}", "Experiencia exclusiva en {destino}"],
  "{destino} como nunca has vivido": ["Descubre el lado secreto de {destino}", "Vive lo mejor de {destino}"],
};

const buildTitleVariations = (template: string, destination: string): string[] => {
  const dest = (destination || "").trim() || "Destino";
  const fill = (t: string) => t.replace(/\{destino\}/gi, dest);
  const main = fill(template);
  // Se o template foi editado (não bate com nenhum preset), reaproveita vizinhos do preset mais próximo.
  const neighbors = TITLE_NEIGHBORS[template] || [];
  const isExperienceTemplate = AD_TITLE_PRESETS_EXPERIENCIA.includes(template);
  const poolForFallback = isExperienceTemplate ? AD_TITLE_PRESETS_EXPERIENCIA : AD_TITLE_PRESETS;
  const fallback = poolForFallback.filter((p) => p !== template).slice(0, 2);
  const pool = [main, ...neighbors.map(fill), ...fallback.map(fill)];
  // dedup mantendo ordem
  const seen = new Set<string>();
  const out: string[] = [];
  for (const t of pool) {
    const key = t.toLowerCase();
    if (!seen.has(key)) { seen.add(key); out.push(t); }
    if (out.length >= 3) break;
  }
  while (out.length < 3) out.push(main);
  return out;
};

const CATEGORY_LOCAL_STRATEGIES: Record<CategoriaId, StrategyId[]> = {
  oferta_pacote: ["matriz", "gancho", "ancora", "vitrine"],
  experiencia_destino: ["experiencia_hero", "experiencia_postcard", "experiencia_editorial", "experiencia_lifestyle"],
};

const normalizeHexColor = (value: string, fallback: string) => {
  const raw = value.trim();
  if (/^#[0-9a-f]{6}$/i.test(raw)) return raw;
  if (/^[0-9a-f]{6}$/i.test(raw)) return `#${raw}`;
  return fallback;
};

const selectedPalette = (primary: string, secondary: string) => ({
  primary: normalizeHexColor(primary, "#0c2340"),
  secondary: normalizeHexColor(secondary, "#FCD34D"),
});

const scopedGenerationKey = (categoria: CategoriaId, genMode: GenMode, format: "square" | "story") =>
  `fabrica_generation_cycle_${categoria}_${genMode}_${format}`;

const scopedTemplateKey = (type: "last" | "recent", categoria: CategoriaId, genMode: GenMode) =>
  `fabrica_${type}_template_ids_${categoria}_${genMode}`;

const scopedStrategyHistoryKey = (categoria: CategoriaId, genMode: GenMode, format: "square" | "story") =>
  `fabrica_strategy_history_${categoria}_${genMode}_${format}`;

const shuffleArray = <T,>(arr: T[]): T[] => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

/**
 * Escolhe `count` estratégias DISTINTAS para a categoria, evitando ao máximo
 * repetir as estratégias usadas na geração anterior. Se o pool for muito pequeno
 * para evitar todas, prioriza as que estão fora do histórico mais recente.
 */
const pickDistinctLocalStrategies = (
  categoria: CategoriaId,
  _seed: number,
  count = 1,
  history: StrategyId[] = [],
): StrategyId[] => {
  const pool = CATEGORY_LOCAL_STRATEGIES[categoria];
  const desired = Math.min(count, pool.length);
  // Prefere estratégias FORA do histórico recente; se faltar, completa com as do histórico
  // (mas embaralhadas para nunca repetir exatamente a mesma sequência).
  const fresh = shuffleArray(pool.filter((s) => !history.includes(s)));
  const stale = shuffleArray(pool.filter((s) => history.includes(s)));
  const ordered = [...fresh, ...stale];
  return ordered.slice(0, desired);
};

const pickPhotoRefs = (
  photos: Array<{ id: number; url: string; thumb: string; alt: string }>,
  selectedPhotoUrl: string,
  _seed: number,
  count: number,
) => {
  // SEMPRE usa a foto que o usuário selecionou como primeira.
  // Se não houver seleção, cai para a primeira da lista.
  const primary = selectedPhotoUrl || photos[0]?.url || "";
  return Array.from({ length: count }, () => primary);
};

// ============================================================
// GENERADOR DE PIES DE FOTO / COPY para Instagram
// Gera 3 variações de texto adaptadas aos dados do anúncio,
// sem chamadas Ã  IA — 100% local, instant🖼️neo.
// ============================================================
interface CaptionVars {
  destination: string;
  price: string;
  installments: string;
  paymentMode: string;
  paymentSuffix: string;
  highlights: Highlight[];
  promoName: string;
  travelPeriod: string;
  agencyName: string;
  whatsapp: string;
  instagram: string;
  isExperience: boolean;
}

const buildAdCaptions = (v: CaptionVars): string[] => {
  const dest = v.destination.trim() || "el destino";
  const destUp = dest.toUpperCase();
  const priceStr = v.price.trim();
  const hasPrice = !!priceStr && v.paymentMode !== "free_quote";
  const hasInstall = !!v.installments.trim() && v.paymentMode === "installments";
  const period = v.travelPeriod.trim();
  const agency = v.agencyName.trim() || "nuestra agencia";
  const ig = v.instagram.trim() ? `@${v.instagram.replace(/^@/, "").trim()}` : "";
  const wa = v.whatsapp.trim();
  const contactLine = wa
    ? `📱 Habla conmigo ahora: *${wa}* ${ig ? `| ${ig}` : ""}`
    : ig
    ? `📱 Síguenos: ${ig}`
    : "📱 ¡Contáctanos para reservar!";

  // Benefícios: pega os 3 primeiros highlights como bullet points
  const benefitLines = v.highlights
    .slice(0, 4)
    .map((h: any) => `✅ ${typeof h === "string" ? h : h.text}`)
    .join("\n");

  const priceBlock = hasPrice
    ? hasInstall
      ? `💳 Solo ${v.installments} de *${priceStr}* ${v.paymentSuffix}`
      : `💰 Por solo *${priceStr}* ${v.paymentSuffix}`
    : "¡Solicita tu presupuesto personalizado!";

  const periodLine = period ? `📅 ${period}` : "";

  if (v.isExperience) {
    // Variante Experiência: estilo editorial/luxo
    const caps: string[] = [
      // Variação 1 — Cinematográfica
      `✨ ${destUp} te sorprenderá.\n\nExperiencias como esta no se olvidan — y tú mereces vivirlas.\n\n${benefitLines}\n\n${periodLine ? periodLine + "\n" : ""}${contactLine}`,

      // Variação 2 — Direta com CTA
      `🌟 ¿Ya imaginaste ${v.isExperience ? "vivir" : "conocer"} ${dest}?\n\n${benefitLines}\n\n${periodLine ? periodLine + "\n" : ""}Cada detalle ha sido pensado para ti. ¿Planeamos juntos?\n\n${contactLine}`,

      // Variação 3 — Curiosidade/teaser
      `Hay destinos que transforman. ${dest} es uno de ellos. 🧳\n\n${benefitLines}\n\n${periodLine ? periodLine + "\n" : ""}💌 Reserva con ${agency}. Una agencia que entiende lo que buscas en un viaje.\n\n${contactLine}`,
    ];
    return caps;
  }

  // Variante Oferta: direto e comercial
  const caps: string[] = [
    // Variação 1 — Urgência + preço em destaque
    `🚨 *${v.promoName || "OFERTA ESPECIAL"}* — ${destUp}!\n\n${benefitLines}\n\n${priceBlock}\n${periodLine ? periodLine + "\n" : ""}\n⚠️ ¡Cupos limitados! No pierdas esta oportunidad.\n\n${contactLine}`,

    // Variação 2 — Storytelling + preço
    `¿Vámonos a ${dest}? ✈️\n\nArmamos un paquete COMPLETO para que no te preocupes por nada:\n\n${benefitLines}\n\n${priceBlock}\n${periodLine ? periodLine + "\n" : ""}\n👉 ¡Escríbeme ahora y asegura tu lugar!\n\n${contactLine}`,

    // Variação 3 — Benefícios + prova social
    `📍 ${dest} — ¡Un paquete que te va a encantar!\n\nIncluido en tu viaje:\n${benefitLines}\n\n${priceBlock}\n${periodLine ? periodLine + "\n" : ""}\n✅ Agencia especializada. Atención personalizada. Soporte 24h.\n\n${contactLine}`,
  ];
  return caps;
};

export const Phase3ArtFactoryES = ({ onNext, onBack }: Props) => {
  const { state, update, systemUpdate, reset } = useFabricaContext();
  const { user } = useAuth();
  const { data: savedProjects } = useDiagnosticos();
  const [categoria, setCategoriaState] = useState<CategoriaId>((state.lastCategoria as CategoriaId) || "oferta_pacote");
  

  

  const strategy: StrategyId = getCategoria(categoria).legacyStrategy;
  const [lastTemplateId, setLastTemplateId] = useState<string | null>(() => localStorage.getItem("fabrica_last_template_id"));
  const [recentTemplateIds, setRecentTemplateIds] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem("fabrica_recent_template_ids") || "[]"); }
    catch { return []; }
  });
  const [format, setFormatState] = useState<"square" | "story">(state.lastFormat || "story");
  const setFormat = (f: "square" | "story") => { setFormatState(f); update({ lastFormat: f }); };

  const [destinationState, setDestinationState] = useState(state.destinos?.[0] || "");
  const destination = destinationState;
  // Persiste destino no contexto/localStorage para sobreviver Ã  navegação F1🖼️†”F3🖼️†”F4.
  const setDestination = (v: string) => {
    setDestinationState(v);
    const rest = (state.destinos || []).slice(1);
    update({ destinos: v.trim() ? [v, ...rest] : rest });
  };
  const [price, setPriceState] = useState(state.lastPrice || "149,90");
  const setPrice = (p: string) => { setPriceState(p); update({ lastPrice: p }); };
  const [currency, setCurrencyState] = useState<Currency>((state.lastCurrency as Currency) || "USD");
  const setCurrency = (c: Currency) => { setCurrencyState(c); update({ lastCurrency: c }); };
  // V3: opções extras
  const [hideCents, setHideCentsState] = useState<boolean>(!!state.hideCents);
  const setHideCents = (v: boolean) => {
    setHideCentsState(v);
    update({ hideCents: v });
    // NUNCA sobrescreve o valor bruto 'price' no state, para não corromper a digitação original do usuário!
  };
  const [showTotal, setShowTotalState] = useState<boolean>(state.showTotal !== false);
  const setShowTotal = (v: boolean) => { setShowTotalState(v); update({ showTotal: v }); };
  const [totalOverride, setTotalOverrideState] = useState<string>(state.totalOverride || "");
  const setTotalOverride = (v: string) => { setTotalOverrideState(v); update({ totalOverride: v }); };
  // V3: faixa azul do Pix (editável e ocultável)
  const [showPixBanner, setShowPixBannerState] = useState<boolean>((state as any).showPixBanner !== false);
  const setShowPixBanner = (v: boolean) => { setShowPixBannerState(v); update({ showPixBanner: v } as any); };
  const [pixBannerText, setPixBannerTextState] = useState<string>((state as any).pixBannerText || "");
  const setPixBannerText = (v: string) => { setPixBannerTextState(v); update({ pixBannerText: v } as any); };

  // Tipografía global (familia + escala título/descripción + color de override)
  const [fontFamily, setFontFamilyState] = useState<string>((state as any).fontFamily || "Inter");
  const setFontFamily = (v: string) => { setFontFamilyState(v); update({ fontFamily: v } as any); };
  const [titleScale, setTitleScaleState] = useState<number>(((state as any).titleScale as number) || 1);
  const setTitleScale = (v: number) => { setTitleScaleState(v); update({ titleScale: v } as any); };
  const [descScale, setDescScaleState] = useState<number>(((state as any).descScale as number) || 1);
  const setDescScale = (v: number) => { setDescScaleState(v); update({ descScale: v } as any); };
  const [textColorOverride, setTextColorOverrideState] = useState<string>((state as any).textColorOverride || "");
  const [autoTextColor, setAutoTextColor] = useState<string>("#ffffff");
  // Cor efetiva: se o usuário escolheu manualmente, respeita; senão usa auto-contraste.
  const effectiveTextColor = textColorOverride || autoTextColor;
  const setTextColorOverride = (v: string) => { setTextColorOverrideState(v); update({ textColorOverride: v } as any); };
  const [fontOptionsOpen, setFontOptionsOpen] = useState(false);
  const [advancedSizeOpen, setAdvancedSizeOpen] = useState(false);
  const [colorsOpen, setColorsOpen] = useState(false);
  // "Cor dos textos base": força textos claros ou escuros nas artes
  const [baseTextMode, setBaseTextModeState] = useState<"light" | "dark">(
    (((state as any).baseTextMode as "light" | "dark") || "light")
  );
  const setBaseTextMode = (m: "light" | "dark") => {
    setBaseTextModeState(m);
    update({ baseTextMode: m } as any);
    // sincroniza com o override de cor de texto já existente
    setTextColorOverride(m === "light" ? "#FFFFFF" : "#0A0A0A");
  };
  const FONT_PRESETS = ["Inter", "Poppins", "Montserrat", "Roboto", "Oswald", "Bebas Neue", "Playfair Display", "Lora", "Raleway", "Nunito", "Work Sans", "DM Sans"];

  // Carrega Google Font dinamicamente quando o usuário escolhe uma família custom
  useEffect(() => {
    if (!fontFamily || fontFamily === "Inter") return;
    const id = `gf-${fontFamily.replace(/\s+/g, "-").toLowerCase()}`;
    if (document.getElementById(id)) return;
    const link = document.createElement("link");
    link.id = id;
    link.rel = "stylesheet";
    link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(fontFamily)}:wght@400;500;600;700;800;900&display=swap`;
    document.head.appendChild(link);
    // Garante que o canvas use a fonte já carregada antes de renderizar
    if ((document as any).fonts?.load) {
      (document as any).fonts.load(`900 32px "${fontFamily}"`).catch(() => {});
      (document as any).fonts.load(`400 16px "${fontFamily}"`).catch(() => {});
    }
  }, [fontFamily]);

  // Preço formatado que será passado para o composer (ex: "$ 1.499,90" ou "US$ 1,499.90")
  const formattedPriceForAd = formatPriceValue(stripCurrencyFromPrice(price, currency), currency, false, hideCents);
  const currencySymbol = CURRENCY_PRESETS.find((c) => c.id === currency)?.symbol || "$";

  const [installments, setInstallmentsState] = useState(state.lastInstallments || "10x");
  const setInstallments = (i: string) => { setInstallmentsState(i); update({ lastInstallments: i }); };

  
  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const MAX_WIDTH = 250;
        const MAX_HEIGHT = 250;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0, width, height);
        
        // Limpia claves pesadas legadas para liberar espacio en el localStorage antes de guardar el nuevo logo
        try {
          Object.keys(localStorage).forEach((key) => {
            if (key.startsWith("fabrica-heavy-v1:") && key !== "fabrica-heavy-v1:logoBase64") {
              localStorage.removeItem(key);
            }
          });
        } catch (e) {
          console.warn("Clean storage failed", e);
        }

        update({ logoBase64: canvas.toDataURL("image/png") });
        toast.success("Logo adicionada com sucesso!");
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const setCategoria = (c: CategoriaId) => {
    const previousCategoria = categoria;
    setCategoriaState(c);
    update({ lastCategoria: c });
    // Troca defaults de promoName / adTitle quando ainda são padrões da outra categoria
    setPromoNameState((prev) => {
      if (c === "experiencia_destino" && DEFAULT_PROMO_NAMES_OFERTA.has(prev)) {
        const next = PROMO_NAME_PRESETS_EXPERIENCIA[0];
        update({ lastPromoName: next });
        return next;
      }
      if (c === "oferta_pacote" && DEFAULT_PROMO_NAMES_EXPERIENCIA.has(prev)) {
        const next = "OFERTA ESPECIAL";
        update({ lastPromoName: next });
        return next;
      }
      return prev;
    });
    setAdTitleTemplateState((prev) => {
      if (c === "experiencia_destino" && DEFAULT_AD_TITLES_OFERTA.has(prev)) {
        const next = AD_TITLE_PRESETS_EXPERIENCIA[0];
        update({ lastAdTitle: next });
        return next;
      }
      if (c === "oferta_pacote" && DEFAULT_AD_TITLES_EXPERIENCIA.has(prev)) {
        const next = "Paquete {destino}";
        update({ lastAdTitle: next });
        return next;
      }
      return prev;
    });
    setPaymentSuffixState((prev) => {
      if (c === "experiencia_destino" && DEFAULT_SUFFIXES_OFERTA.has(prev)) {
        update({ lastPaymentSuffix: DEFAULT_SUFFIX_EXPERIENCIA });
        return DEFAULT_SUFFIX_EXPERIENCIA;
      }
      if (c === "oferta_pacote" && prev === DEFAULT_SUFFIX_EXPERIENCIA) {
        update({ lastPaymentSuffix: "por persona" });
        return "por persona";
      }
      return prev;
    });
    setHighlightsState((prev) => {
      const shouldUseExperienceDefaults =
        c === "experiencia_destino" &&
        (previousCategoria !== "experiencia_destino" || sameHighlightTexts(prev, DEFAULT_HIGHLIGHTS));
      const shouldRestoreOfferDefaults =
        c === "oferta_pacote" &&
        sameHighlightTexts(prev, DEFAULT_EXPERIENCE_HIGHLIGHTS);
      if (shouldUseExperienceDefaults) {
        update({ lastHighlights: DEFAULT_EXPERIENCE_HIGHLIGHTS });
        return DEFAULT_EXPERIENCE_HIGHLIGHTS;
      }
      if (shouldRestoreOfferDefaults) {
        update({ lastHighlights: DEFAULT_HIGHLIGHTS });
        return DEFAULT_HIGHLIGHTS;
      }
      return prev;
    });

    // Padronização de CORES por categoria — só sobrescreve se o usuário ainda
    // estiver com os defaults da OUTRA categoria (preserva customização manual).
    setPrimaryColorState((prevP) => {
      const prevS = secondaryColor;
      if (c === "experiencia_destino" && isDefaultColorsOferta(prevP, prevS)) {
        setSecondaryColorState(DEFAULT_COLORS_EXPERIENCIA.secondary);
        update({ primaryColor: DEFAULT_COLORS_EXPERIENCIA.primary, secondaryColor: DEFAULT_COLORS_EXPERIENCIA.secondary });
        return DEFAULT_COLORS_EXPERIENCIA.primary;
      }
      if (c === "oferta_pacote" && isDefaultColorsExperiencia(prevP, prevS)) {
        setSecondaryColorState(DEFAULT_COLORS_OFERTA.secondary);
        update({ primaryColor: DEFAULT_COLORS_OFERTA.primary, secondaryColor: DEFAULT_COLORS_OFERTA.secondary });
        return DEFAULT_COLORS_OFERTA.primary;
      }
      return prevP;
    });

    // Limpa override manual de cor de texto ao trocar categoria —
    // o auto-contraste (claro/escuro baseado na imagem) volta a valer.
    setTextColorOverrideState("");
    update({ textColorOverride: "" } as any);
  };

  const initialPromoDefault = ((state.lastCategoria as CategoriaId) === "experiencia_destino")
    ? PROMO_NAME_PRESETS_EXPERIENCIA[0]
    : "OFERTA ESPECIAL";
  const initialAdTitleDefault = ((state.lastCategoria as CategoriaId) === "experiencia_destino")
    ? AD_TITLE_PRESETS_EXPERIENCIA[0]
    : "Paquete {destino}";
  const [promoName, setPromoNameState] = useState(state.lastPromoName || initialPromoDefault);
  const setPromoName = (n: string) => { setPromoNameState(n); update({ lastPromoName: n }); };

  // Título del anuncio (com presets editáveis usando {destino})
  const [adTitleTemplate, setAdTitleTemplateState] = useState(state.lastAdTitle || initialAdTitleDefault);
  const setAdTitleTemplate = (t: string) => { setAdTitleTemplateState(t); update({ lastAdTitle: t }); };
  const [adTitleMenuOpen, setAdTitleMenuOpen] = useState(false);
  const [promoMenuOpen, setPromoMenuOpen] = useState(false);
  const [travelPeriod, setTravelPeriodState] = useState(state.lastTravelPeriod || "");
  const setTravelPeriod = (v: string) => { setTravelPeriodState(v); update({ lastTravelPeriod: v }); };
  const [travelPeriodMenuOpen, setTravelPeriodMenuOpen] = useState(false);
  const [destMenuOpen, setDestMenuOpen] = useState(false);
  const [suffixMenuOpen, setSuffixMenuOpen] = useState(false);
  const [priceOptionsOpen, setPriceOptionsOpen] = useState(false);
  const [priceOptionsEnabled, setPriceOptionsEnabled] = useState(false);
  const resolvedAdTitle = (adTitleTemplate || "").replace(/\{destino\}/gi, destination?.trim() || "Destino");
  const adTitleVariations = buildTitleVariations(adTitleTemplate || "Paquete {destino}", destination);
  const SUFFIX_PRESETS = ["por persona", "por pareja", "por paquete", "por grupo", "total del paquete"];
  const DESTINATION_SUGGESTIONS = Array.from(new Set([
    ...(state.destinos || []),
    "Cancún", "Punta Cana", "Buenos Aires", "Machu Picchu", "Cartagena",
    "Riviera Maya", "San Andrés", "Ciudad de México", "Santiago", "Río de Janeiro",
    "Cusco", "Punta del Este", "Orlando", "Miami", "Madrid",
  ]));

  const [paymentMode, setPaymentModeState] = useState<PaymentMode>(state.lastPaymentMode || "installments");
  const setPaymentMode = (m: PaymentMode) => { setPaymentModeState(m); update({ lastPaymentMode: m }); };

  const [paymentLabelState, setPaymentLabelState] = useState(state.lastPaymentLabel || "");
  const setPaymentLabel = (label: string) => { setPaymentLabelState(label); update({ lastPaymentLabel: label }); };
  const [paymentSuffixState, setPaymentSuffixState] = useState(() => {
    const savedSuffix = state.lastPaymentSuffix || "por persona";
    return (state.lastCategoria as CategoriaId) === "experiencia_destino" && DEFAULT_SUFFIXES_OFERTA.has(savedSuffix)
      ? DEFAULT_SUFFIX_EXPERIENCIA
      : savedSuffix;
  });
  const setPaymentSuffix = (suffix: string) => { setPaymentSuffixState(suffix); update({ lastPaymentSuffix: suffix }); };
  const paymentLabel = paymentMode === "installments" || paymentMode === "down_plus" ? installments : paymentLabelState;
  const paymentSuffix = paymentSuffixState;
  const initialCategoryColors = ((state.lastCategoria as CategoriaId) === "experiencia_destino")
    ? DEFAULT_COLORS_EXPERIENCIA
    : DEFAULT_COLORS_OFERTA;
  const [primaryColor, setPrimaryColorState] = useState(state.primaryColor || initialCategoryColors.primary);
  const [secondaryColor, setSecondaryColorState] = useState(state.secondaryColor || initialCategoryColors.secondary);
  
  const setPrimaryColor = (c: string) => { setPrimaryColorState(c); update({ primaryColor: c }); };
  const setSecondaryColor = (c: string) => { setSecondaryColorState(c); update({ secondaryColor: c }); };

  const [highlights, setHighlightsState] = useState<Highlight[]>(() => {
    const savedHighlights = state.lastHighlights || DEFAULT_HIGHLIGHTS;
    if ((state.lastCategoria as CategoriaId) === "experiencia_destino" && sameHighlightTexts(savedHighlights, DEFAULT_HIGHLIGHTS)) {
      return DEFAULT_EXPERIENCE_HIGHLIGHTS;
    }
    return savedHighlights;
  });
  const setHighlights = (h: Highlight[]) => { setHighlightsState(h); update({ lastHighlights: h }); };
  const [editingIconIdx, setEditingIconIdx] = useState<number | null>(null);
  const [newHl, setNewHl] = useState("");
  const [loading, setLoading] = useState(false);
  const [projectsPanelOpen, setProjectsPanelOpen] = useState(false);
  const [isBatchMode, setIsBatchMode] = useState(false); // Nova feature: Lote A/B (3 variações)
  const [generatedImage, setGeneratedImage] = useState<string>("");
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [variationCounter, setVariationCounter] = useState(0);
  // Pies de foto/Copy generados automáticamente junto con las imágenes
  const [adCaptions, setAdCaptions] = useState<string[]>([]);
  const [selectedCaption, setSelectedCaption] = useState<string | null>(null);
  const [captionCopied, setCaptionCopied] = useState(false);
  // Histórico das últimas variantes do compositor canvas (modo Tu Imagen) para forçar rotação
  const variantHistoryRef = useRef<number[]>([]);
  // Versão forçada (null = automático/rotação). 0..4 fixa a variante exata para correções cirúrgicas.
  const [forcedVariant, setForcedVariant] = useState<number | null>(null);
  const [lastProvider, setLastProvider] = useState<"user_gemini" | "lovable_ai" | null>(null);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const resultRef = useRef<HTMLDivElement | null>(null);
  const [generationCount, setGenerationCount] = useState<number>(() => {
    const saved = localStorage.getItem("fabrica_gen_count");
    return saved ? parseInt(saved, 10) : 0;
  });

  const getAiPureDailyCount = () => {
    const today = new Date().toISOString().split('T')[0];
    const savedDay = localStorage.getItem("fabrica_ai_pure_day");
    if (savedDay !== today) {
      localStorage.setItem("fabrica_ai_pure_day", today);
      localStorage.setItem("fabrica_ai_pure_daily_count", "0");
      return 0;
    }
    const savedCount = localStorage.getItem("fabrica_ai_pure_daily_count");
    return savedCount ? parseInt(savedCount, 10) : 0;
  };

  const incrementAiPureDailyCount = (amount: number) => {
    const today = new Date().toISOString().split('T')[0];
    const current = getAiPureDailyCount();
    const next = current + amount;
    localStorage.setItem("fabrica_ai_pure_day", today);
    localStorage.setItem("fabrica_ai_pure_daily_count", String(next));
    return next;
  };

  const [aiPureCount, setAiPureCount] = useState<number>(() => getAiPureDailyCount());

  useEffect(() => {
    setCategoriaState((state.lastCategoria as CategoriaId) || "oferta_pacote");
    setFormatState(state.lastFormat || "story");
    setDestinationState(state.destinos?.[0] || "");
    setPriceState(state.lastPrice || "149,90");
    setCurrencyState((state.lastCurrency as Currency) || "BRL");
    setHideCentsState(!!state.hideCents);
    setShowTotalState(state.showTotal !== false);
    setTotalOverrideState(state.totalOverride || "");
    setShowPixBannerState((state as any).showPixBanner !== false);
    setPixBannerTextState((state as any).pixBannerText || "");
    setFontFamilyState((state as any).fontFamily || "Inter");
    setTitleScaleState(((state as any).titleScale as number) || 1);
    setDescScaleState(((state as any).descScale as number) || 1);
    setTextColorOverrideState((state as any).textColorOverride || "");
    setInstallmentsState(state.lastInstallments || "10x");
    setPromoNameState(state.lastPromoName || initialPromoDefault);
    setAdTitleTemplateState(state.lastAdTitle || initialAdTitleDefault);
    setTravelPeriodState(state.lastTravelPeriod || "");
    setPaymentModeState(state.lastPaymentMode || "installments");
    setPaymentLabelState(state.lastPaymentLabel || "");
    setPaymentSuffixState(() => {
      const savedSuffix = state.lastPaymentSuffix || "por pessoa";
      return (state.lastCategoria as CategoriaId) === "experiencia_destino" && DEFAULT_SUFFIXES_OFERTA.has(savedSuffix)
        ? DEFAULT_SUFFIX_EXPERIENCIA
        : savedSuffix;
    });
    setPrimaryColorState(state.primaryColor || initialCategoryColors.primary);
    setSecondaryColorState(state.secondaryColor || initialCategoryColors.secondary);
    setHighlightsState(() => {
      const savedHighlights = state.lastHighlights || DEFAULT_HIGHLIGHTS;
      if ((state.lastCategoria as CategoriaId) === "experiencia_destino" && sameHighlightTexts(savedHighlights, DEFAULT_HIGHLIGHTS)) {
        return DEFAULT_EXPERIENCE_HIGHLIGHTS;
      }
      return savedHighlights;
    });
  }, [
    state.lastCategoria,
    state.lastFormat,
    state.destinos,
    state.lastPrice,
    state.lastCurrency,
    state.hideCents,
    state.showTotal,
    state.totalOverride,
    (state as any).showPixBanner,
    (state as any).pixBannerText,
    (state as any).fontFamily,
    (state as any).titleScale,
    (state as any).descScale,
    (state as any).textColorOverride,
    state.lastInstallments,
    state.lastPromoName,
    state.lastAdTitle,
    state.lastTravelPeriod,
    state.lastPaymentMode,
    state.lastPaymentLabel,
    state.lastPaymentSuffix,
    state.primaryColor,
    state.secondaryColor,
    state.lastHighlights,
    initialPromoDefault,
    initialAdTitleDefault,
    initialCategoryColors.primary,
    initialCategoryColors.secondary,
  ]);

  // Zerar limites de geração diária de todos os usuários (uma única vez por nova versão)
  useEffect(() => {
    const resetKey = "fabrica_limits_reset_v4";
    if (!localStorage.getItem(resetKey)) {
      localStorage.setItem(resetKey, "true");
      localStorage.setItem("fabrica_ai_pure_daily_count", "0");
      localStorage.setItem("fabrica_gen_count", "0");
      // Quando reiniciar os limites (nova chave adicionada), forçamos o provedor inicial a ser "user_gemini"
      // para permitir que todos os usuários tentem usar a nova chave sem esbarrar no limite local!
      localStorage.setItem("fabrica_last_provider", "user_gemini");
      setAiPureCount(0);
      setGenerationCount(0);
      setLastProvider("user_gemini");
      toast.success("¡Límites de generación diaria reiniciados con la nueva clave API!");
    }
  }, []);

  useEffect(() => {
    const key = "fabrica-render-engine-version";
    if (localStorage.getItem(key) === FABRICA_RENDER_ENGINE_VERSION) return;
    // ðŸ›¡ï¸ CACHE BUST: Limpa imagens geradas E o cache da logo antiga
    localStorage.removeItem("fabrica-heavy-v1:generatedAdImage");
    localStorage.removeItem("fabrica_last_template_id");
    localStorage.removeItem("fabrica_recent_template_ids");
    // Resetea el auto-sync de la Fase 4 para que los nuevos datos sean re-sincronizados
    localStorage.removeItem("fabrica-phase4-autosync-v1");
    Object.keys(localStorage)
      .filter((k) => k.startsWith("fabrica_generation_cycle_") || k.startsWith("fabrica_strategy_history_") || k.startsWith("fabrica_last_template_ids_") || k.startsWith("fabrica_recent_template_ids_"))
      .forEach((k) => localStorage.removeItem(k));
    setGeneratedImage("");
    setGeneratedImages([]);
    systemUpdate({ generatedAdImage: "" });
    localStorage.setItem(key, FABRICA_RENDER_ENGINE_VERSION);
  }, [systemUpdate]);

  // ===== Modo de geração =====
  const [genMode, setGenMode] = useState<GenMode>("photo");
  const [searchEngine, setSearchEngine] = useState<"pexels" | "google" | "galeria" | "geradas">("pexels");
  // Foto Real (Pexels/Google)
  const [photoQuery, setPhotoQuery] = useState("");
  const [photos, setPhotos] = useState<Array<{ id: number; url: string; thumb: string; alt: string }>>([]);
  const [selectedPhotoUrl, setSelectedPhotoUrl] = useState<string>("");
  const [searchingPhotos, setSearchingPhotos] = useState(false);
  const [visiblePhotoCount, setVisiblePhotoCount] = useState(3);
  // Sua imagem
  const [customSource, setCustomSource] = useState<CustomSource>("upload");
  const [customImageData, setCustomImageData] = useState<string>(""); // base64 (upload) ou URL (link) — só em memória
  const [customLink, setCustomLink] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ====== Auto-contraste: detecta lumin🖼️ncia média da imagem ativa e
  // define cor de texto padrão (branca em fundos escuros, preta em fundos claros).
  // Garante nitidez/legibilidade automaticamente; o usuário ainda pode sobrescrever.
  useEffect(() => {
    const activeUrl =
      genMode === "photo" ? selectedPhotoUrl :
      genMode === "custom" ? (customSource === "upload" ? customImageData : customLink.trim()) :
      "";
    if (!activeUrl) {
      setAutoTextColor("#ffffff");
      return;
    }
    let cancelled = false;
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      if (cancelled) return;
      try {
        const w = 32, h = 32;
        const canvas = document.createElement("canvas");
        canvas.width = w; canvas.height = h;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        ctx.drawImage(img, 0, 0, w, h);
        const data = ctx.getImageData(0, 0, w, h).data;
        let sum = 0, n = 0;
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i] / 255, g = data[i + 1] / 255, b = data[i + 2] / 255;
          sum += 0.299 * r + 0.587 * g + 0.114 * b;
          n++;
        }
        const lum = n ? sum / n : 0.5;
        setAutoTextColor(lum > 0.55 ? "#0d0d0d" : "#ffffff");
      } catch {
        // tainted canvas 🖼️†’ fallback seguro (branco com sombra cobre a maioria dos casos)
        setAutoTextColor("#ffffff");
      }
    };
    img.onerror = () => setAutoTextColor("#ffffff");
    img.src = activeUrl;
    return () => { cancelled = true; };
  }, [genMode, selectedPhotoUrl, customImageData, customLink, customSource]);


  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Selecione uma imagem válida");
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      toast.error("Imagem muito grande (máx 8MB)");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      // base64 vive APENAS em memória do browser 🖼️†’ nunca toca o banco
      setCustomImageData(String(reader.result || ""));
      toast.success("Imagem carregada (apenas em memória)");
    };
    reader.onerror = () => toast.error("Erro ao ler imagem");
    reader.readAsDataURL(file);
  };

  const TRAVEL_TERMS_CYCLE = [
    "beach", "tropical beach", "ocean", "coastline", "sea", "paradise",
    "landscape", "nature", "tourism", "travel", "resort", "scenic",
    "aerial view", "sunset beach", "vacation", "holiday destination",
    "travel photography", "adventure", "waterfall", "mountain",
    "city tourism", "skyline", "cultural travel", "sightseeing",
  ];

  const searchPhotos = async (overrideQuery?: string) => {
    const q = (overrideQuery ?? photoQuery ?? destination).trim();
    if (!q) {
      toast.error("Digite o destino para buscar fotos");
      return;
    }
    setPhotoQuery(q);
    setSearchingPhotos(true);
    setPhotos([]);
    setSelectedPhotoUrl("");

    setPhotoQuery(q);


    try {
      const { data, error } = await supabase.functions.invoke("fabrica-search-photos", {
        body: { 
          query: q, 
          perPage: 12, 
          engine: searchEngine 
        }
      });

      if (error) throw error;
      if (data?.photos) {
        setPhotos(data.photos);
        setVisiblePhotoCount(3);
        setSelectedPhotoUrl("");
        toast.success(`Fotos de ${q} carregadas com sucesso!`);
      }
    } catch (err) {
      console.error("Erro ao buscar fotos:", err);
      toast.error("Erro na busca de fotos.");
    } finally {
      setSearchingPhotos(false);
    }
  };

  const POPULAR_PHOTO_DESTINATIONS = [
    "Jericoacoara", "Maragogi", "Fernando de Noronha", "Gramado", "Bonito",
    "Porto de Galinhas", "Búzios", "Cancún", "Punta Cana", "Paris",
    "Orlando", "Lisboa", "Santiago", "Bariloche", "Maldivas",
  ];

  const MAX_HIGHLIGHTS = 6;
  const addHighlight = () => {
    const v = newHl.trim();
    if (!v || highlights.length >= MAX_HIGHLIGHTS) return;
    setHighlights([...highlights, { text: v, icon: "check" }]);
    setNewHl("");
  };
  const removeHighlight = (i: number) => setHighlights(highlights.filter((_, idx) => idx !== i));
  const updateHighlightText = (i: number, text: string) =>
    setHighlights(highlights.map((h, idx) => (idx === i ? { ...h, text } : h)));
  const updateHighlightIcon = (i: number, icon: IconKey) => {
    setHighlights(highlights.map((h, idx) => (idx === i ? { ...h, icon } : h)));
    setEditingIconIdx(null);
  };

  // ðŸŒ Integración Inteligente de Paquetes con el Sitio F2 (Acumulativo)
  // Pega o último anúncio gerado e o insere no Site, preferencialmente usando a FOTO LIMPA
  // para o fundo do site, em vez da arte poluída com texto do Canva, conforme exigido pelo usuário.
  const syncGeneratedPackageToSite = (finalComposedImg: string, sourceCleanImg?: string) => {
    if (!finalComposedImg || !destination.trim()) return;

    // A imagem que vai para o site é PREFERENCIALMENTE a foto limpa de fundo!
    const imageToUse = sourceCleanImg || finalComposedImg;

    const currentPrice = formattedPriceForAd || price;
    const sym = CURRENCY_PRESETS.find((c) => c.id === currency)?.symbol || "$";

    const priceLabel = (() => {
      const suffix = paymentSuffix || "por persona";
      const pVal = `${sym} ${currentPrice}`;
      if (paymentMode === "installments") return `${installments || "10x"} de ${pVal} ${suffix}`;
      if (paymentMode === "cash") return `À vista ${pVal} ${suffix}`;
      return `${pVal} ${suffix}`;
    })();

    const descLines = highlights.slice(0, 4).map((h) => `✅ ${h.text}`).join("\n");
    const period = travelPeriod ? `\n📅 ${travelPeriod}` : "";
    
    const cleanDest = destination.trim();
    const newPkg = {
      id: `gen-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      title: cleanDest,
      description: descLines + period,
      price: priceLabel,
      imageUrl: imageToUse,
      ctaLabel: "Reservar",
      isDraft: true,
    };

    const currentPackages = state.selectedPackages || [];
    const existingIdx = currentPackages.findIndex(
      (p: any) => (p.title || "").toLowerCase().trim() === cleanDest.toLowerCase()
    );

    let updatedPackages = [];
    if (existingIdx > -1) {
      updatedPackages = [...currentPackages];
      updatedPackages[existingIdx] = {
        ...updatedPackages[existingIdx],
        price: priceLabel,
        imageUrl: imageToUse,
        description: newPkg.description,
      };
    } else {
      const base = currentPackages.filter((p: any) => p.title !== "Nuevo paquete");
      updatedPackages = [newPkg, ...base];
    }

    // Garante APENAS a foto LIMPA (sem a arte poluída de texto do anúncio) no banco do site.
    // Se não há foto limpa (modo IA pura sem referência), não adiciona nada ao banco de fotos.
    const currentGallery = state.siteContent.galleryImages || [];
    let updatedGallery = [...currentGallery];
    if (sourceCleanImg && !updatedGallery.includes(sourceCleanImg)) {
       updatedGallery = [sourceCleanImg, ...updatedGallery];
    }

    // Inteligência Adicional: Se o site não tem NENHUMA foto de capa no Hero,
    // usa a primeira foto limpa gerada como capa inicial do site!
    const hasHero = !!state.siteContent.heroImageUrl;

    update({
      selectedPackages: updatedPackages,
      lastCleanPhoto: sourceCleanImg || finalComposedImg,
      siteContent: {
        ...state.siteContent,
        galleryImages: updatedGallery,
        heroImageUrl: hasHero ? state.siteContent.heroImageUrl : imageToUse
      }
    } as any);
  };

  const generate = async (forceVariation?: number, accumulate: boolean = false) => {
    if (!destination.trim()) {
      toast.error("Digite o destino do anúncio");
      return;
    }
    setLoading(true);
    setGeneratedImage("");
    setGenerationError(null);
    if (!accumulate) setGeneratedImages([]);
    try {
      // Resolve imagem de referência conforme modo
      const refImage =
        genMode === "photo" ? selectedPhotoUrl :
        genMode === "custom" ? (customSource === "upload" ? customImageData : customLink.trim()) :
        "";

      if (genMode === "photo" && !refImage) {
        toast.error("Selecione uma foto da galeria primeiro");
        setLoading(false);
        return;
      }
      if (genMode === "custom" && !refImage) {
        toast.error(customSource === "upload" ? "Sube una imagen desde tu dispositivo" : "Pega el enlace de la imagen");
        setLoading(false);
        return;
      }
      const activeVariation = forceVariation ?? variationCounter;
      const cycleKey = scopedGenerationKey(categoria, genMode, format);
      const storedCycle = Number.parseInt(localStorage.getItem(cycleKey) || "0", 10);
      const generationSeed = Math.max(activeVariation, Number.isFinite(storedCycle) ? storedCycle : 0);
      const finishCycle = (amount: number) => {
        const nextSeed = generationSeed + amount;
        setVariationCounter(nextSeed);
        localStorage.setItem(cycleKey, String(nextSeed));
      };

      // ===== TRAVA DE CRÉDITOS DA PLATAFORMA (20 gerações no modo IA sem chave própria) =====
      const PLATFORM_CREDIT_LIMIT = 20;
      if (genMode === "ai" && aiPureCount >= PLATFORM_CREDIT_LIMIT && lastProvider !== "user_gemini") {
        toast.error(
          `⚡ ¡Límite de ${PLATFORM_CREDIT_LIMIT} generaciones de IA Pura diarias alcanzado! Usa las otras formas ilimitadas: modo Foto Real y modo Tu Foto, o conecta tu clave Gemini en Configuración.`,
          { duration: 8000 }
        );
        setLoading(false);
        return;
      }

      // ===== MODO FOTO (composição local) — gera 1 ou mais imagens =====
      if (genMode === "photo") {
        toast.info(isBatchMode ? "Gerando lote de 3 variações com foto real" : "Gerando 1 imagem única com foto real");
        const guard = getForbiddenSets(categoria, "photo", format);
        const stratHistKey = scopedStrategyHistoryKey(categoria, "photo", format);
        let stratHistory: StrategyId[] = [];
        try { stratHistory = JSON.parse(localStorage.getItem(stratHistKey) || "[]"); } catch { stratHistory = []; }
        // Combina histórico local + histórico do guard (proíbe layouts recentes)
        const mergedHist = Array.from(new Set([...stratHistory, ...(guard.layouts as StrategyId[])]));
        const freshSeedPhoto = freshSeed(generationSeed);
        // Feature Lote A/B: Pede 3 estratégias distintas se isBatchMode estiver ativado
        const numToGen = isBatchMode ? 3 : 1;
        const chosen = pickDistinctLocalStrategies(categoria, freshSeedPhoto, numToGen, mergedHist);
        localStorage.setItem(stratHistKey, JSON.stringify(chosen));
        const photoRefs = pickPhotoRefs(photos, refImage, freshSeedPhoto, chosen.length);

        // Paleta — sempre usa exatamente as cores selecionadas pelo usuário.
        const palette = selectedPalette(primaryColor, secondaryColor);

        // Rotação determinística entre as 5 variantes do compositor (V0/V1/V2/V3/V4)
        // evitando as 2 últimas usadas — garante imagem nova a cada clique e cobre V4.
        const TOTAL_VARIANTS_PHOTO = 5;
        const recentPhoto = variantHistoryRef.current.slice(-2);
        let candidatesPhoto = Array.from({ length: TOTAL_VARIANTS_PHOTO }, (_, i) => i).filter((v) => !recentPhoto.includes(v));
        if (candidatesPhoto.length === 0) {
          candidatesPhoto = Array.from({ length: TOTAL_VARIANTS_PHOTO }, (_, i) => i);
        }
        const nextVariantPhoto = forcedVariant !== null ? forcedVariant : candidatesPhoto[Math.floor(Math.random() * candidatesPhoto.length)];
        variantHistoryRef.current = [...variantHistoryRef.current.slice(-3), nextVariantPhoto];

        const composed = await Promise.all(
          chosen.map(async (localStrategy, idx) => {
            let img = await composeTravelAd({
              imageUrl: photoRefs[idx],
              format,
              destination,
              city: state.city,
              primaryColor: palette.primary,
              secondaryColor: palette.secondary,
              price: formattedPriceForAd || price,
              currencySymbol,
              installments,
              promoName,
              highlights,
              hasLogo: !!state.logoBase64,
              logoDataUrl: state.logoBase64,
              footerContact1Icon: state.footerContact1Icon,
              footerContact1Value: state.footerContact1Value,
              footerContact2Icon: state.footerContact2Icon,
              footerContact2Value: state.footerContact2Value,
              whatsapp: state.whatsapp,
              instagram: state.instagram,
              paymentMode,
              paymentLabel: paymentLabel || undefined,
              paymentSuffix,
              strategy: localStrategy,
              variation: freshSeedPhoto + idx,
              forceVariant: typeof nextVariantPhoto === "number" ? (nextVariantPhoto + idx) % 5 : undefined,
              titleOverride: resolvedAdTitle,
              titleVariations: adTitleVariations,
              travelPeriod,
              totalOverride: totalOverride || undefined,
              showPixBanner,
              pixBannerText: pixBannerText || undefined,
              showTotal,
              fontFamily,
              titleScale,
              descScale,
              textColorOverride: effectiveTextColor,
              isExperience: categoria === "experiencia_destino",
            });
            return img;
          })
        );

        // Registra no GenerationGuard (a "headline" no modo foto = promoName, pois é o que aparece)
        registerGeneration(categoria, "photo", format, {
          layoutId: chosen[0],
          headline: promoName || "OFERTA ESPECIAL",
          primary: palette.primary,
          secondary: palette.secondary,
        });

        const MAX_VARIATIONS_PHOTO = 3;
        setGeneratedImages((prev) => [...prev, ...composed].slice(-MAX_VARIATIONS_PHOTO));
        setGeneratedImage(composed[composed.length - 1]);
        const currentGenerated = state.allGeneratedAdImages || [];
        const updatedGenerated = [composed[composed.length - 1], ...currentGenerated].slice(0, 10);
        update({ 
          generatedAdImage: composed[composed.length - 1], 
          primaryColor: palette.primary,
          allGeneratedAdImages: updatedGenerated
        });
        syncGeneratedPackageToSite(composed[composed.length - 1], refImage);

        const newCount = generationCount + composed.length;
        setGenerationCount(newCount);
        localStorage.setItem("fabrica_gen_count", String(newCount));
        finishCycle(composed.length);

        toast.success(`${composed.length} ${composed.length === 1 ? "variação gerada" : "variações geradas"} com foto real!`);
        requestAnimationFrame(() => resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
        return;
      }

        // ===== MODO IA PURA: gera 1 prompt da categoria; Experiência usa fluxo seguro sem texto da IA =====
      if (genMode === "ai") {
        const cat = getCategoria(categoria);
        // HÍBRIDO: para Experiencia de Destino (qualquer formato — square 1:1 ou story 9:16),
        // a IA gera APENAS o fundo fotográfico limpo; o motor Canvas (composeTravelAd)
        // desenha por cima logo, textos, preço, ícones e contraste com HEX exato.
        const isAiExperienceStory = categoria === "experiencia_destino" && (format === "square" || format === "story");
        const guard = getForbiddenSets(categoria, "ai", format);
        const categoryLastKey = scopedTemplateKey("last", categoria, "ai");
        const categoryRecentKey = scopedTemplateKey("recent", categoria, "ai");
        const storedLast = localStorage.getItem(categoryLastKey) || (cat.prompts.some((p) => p.templateId === lastTemplateId) ? lastTemplateId : null);
        let storedRecent: string[] = [];
        try { storedRecent = JSON.parse(localStorage.getItem(categoryRecentKey) || "[]"); }
        catch { storedRecent = []; }
        // Junta histórico local com o GenerationGuard para evitar repetir templates
        const mergedRecent = Array.from(new Set([...storedRecent, ...guard.layouts]));
        const picks = isAiExperienceStory
          ? [{ code: "ED_SAFE_BACKGROUND", templateId: "photo_only_experience_background" }]
          : pickPromptsForCategoria(categoria, 1, storedLast, mergedRecent);
        const freshSeedAi = freshSeed(generationSeed);

        // Paleta — sempre usa exatamente as cores selecionadas pelo usuário.
        const palette = selectedPalette(primaryColor, secondaryColor);
        const aiExperienceStrategy = (() => {
          if (!isAiExperienceStory) return "experiencia_hero" as StrategyId;
          const key = scopedStrategyHistoryKey(categoria, "ai", format);
          let history: StrategyId[] = [];
          try { history = JSON.parse(localStorage.getItem(key) || "[]"); } catch { history = []; }
          const mergedH = Array.from(new Set([...history, ...(guard.layouts as StrategyId[])]));
          const [picked] = pickDistinctLocalStrategies(categoria, freshSeedAi, 1, mergedH);
          localStorage.setItem(key, JSON.stringify([picked]));
          return picked;
        })();

        toast.info(`Gerando ${picks.length} ${picks.length === 1 ? "variação" : "variações"} em IA Pura — ${cat.name}`);

        // PROMPT DE FUNDO LIMPO — A IA é instruída a gerar APENAS a fotografia,
        // sem nenhum elemento gráfico/tipográfico. Toda a UI (logo, textos, preço,
        // 🖼️”€🖼️”€ PROMPTS PARA EXPERIÃŠNCIA DE DESTINO (BLINDADOS) 🖼️”€🖼️”€🖼️”€🖼️”€🖼️”€🖼️”€🖼️”€🖼️”€🖼️”€🖼️”€🖼️”€🖼️”€🖼️”€🖼️”€🖼️”€🖼️”€
        // REGRA DE OURO: a imagem da IA deve ser APENAS fotografia.
        // O motor de renderização (Canvas) é desenhado depois pelo motor Canvas (composeTravelAd).
        const NEGATIVE_UI = `STRICT NEGATIVE CONSTRAINTS — the output MUST be a pure photograph only. ABSOLUTELY FORBIDDEN: any text, letters, numbers, words, captions, headlines, prices, currency symbols, dates, typography, fonts, watermarks, signatures, logos, brand marks, badges, stamps, stickers, labels, banners, ribbons, callouts, speech bubbles, icons, pictograms, emojis, arrows, frames, borders, overlays, color blocks, gradients painted on top, UI elements, buttons, cards, panels, mockup chrome, phone frames, social media UI, Instagram/Facebook/TikTok interface, hashtags, @mentions, QR codes, barcodes. The image must look like an untouched RAW photograph straight from a professional camera — nothing rendered, nothing added, no graphic design whatsoever. No people, no faces, no crowds.`;
        const experienceBackgroundPrompt = (variant: number) => {
          const base = `Ultra-high-end editorial travel photography, cinematic 8K, Shot on RED. Magnificent landscape of ${destination || "paradise destination"}.`;
          const variants = [
            `Misty morning light, ethereal atmosphere, soft focus background, minimalist composition. Luxury resort architecture visible in the distance. Wide lens.`,
            `Golden hour sunset, dramatic long shadows, deep blue ocean, golden sand. Rim lighting on palm trees. Tropical paradise vibe.`,
            `Night photography, luxury outdoor lounge with fire pit, starry sky, turquoise pool glowing. Sophisticated and mysterious atmosphere.`,
            `Aerial view, turquoise water patterns, white sandbars, luxury yacht anchored. Minimalist blue and white palette.`,
            `Elegant interior of a luxury villa overlooking the ocean through floor-to-ceiling windows. Morning light, white linen, neutral tones.`,
          ];
          return `${base} ${variants[variant % variants.length]} ${NEGATIVE_UI}`;
        };

        // 🖼️”€🖼️”€ Decisão V4 em IA Pura (apenas Oferta de Paquete) 🖼️”€🖼️”€🖼️”€🖼️”€🖼️”€🖼️”€🖼️”€🖼️”€🖼️”€🖼️”€🖼️”€🖼️”€🖼️”€🖼️”€🖼️”€🖼️”€🖼️”€
        // Sorteia se esta geração será V4 (compositor card) ou IA tradicional,
        // respeitando histórico para garantir variedade entre cliques.
        const isOfertaIA = categoria === "oferta_pacote";
        // Experiencia de Destino: V0-V4 agora totalmente suportados
        const totalVariantsAi = 5;
        const recentAi = variantHistoryRef.current.slice(-2);
        let candidatesAi = Array.from({ length: totalVariantsAi }, (_, i) => i).filter((v) => !recentAi.includes(v));
        if (candidatesAi.length === 0) candidatesAi = Array.from({ length: totalVariantsAi }, (_, i) => i);
        const nextVariantAi = forcedVariant !== null && forcedVariant >= 0 && forcedVariant < totalVariantsAi
          ? forcedVariant
          : candidatesAi[Math.floor(Math.random() * candidatesAi.length)];
        const shouldComposeOfertaAi = isOfertaIA;
        const mustComposeWithCanvas = isAiExperienceStory || shouldComposeOfertaAi;
        variantHistoryRef.current = [...variantHistoryRef.current.slice(-3), nextVariantAi];

        const results = await Promise.all(
          picks.map((pick, idx) => supabase.functions.invoke("fabrica-generate-ad", {
            body: {
              strategy: categoria === "oferta_pacote" ? "ancora" : categoria === "experiencia_destino" ? "vitrine" : "matriz",
              format,
              destination: isAiExperienceStory
                ? destination
                : destination.toUpperCase(),
              niche: state.niche,
              agencyName: state.agencyName,
              agencyType: state.agencyType === "outro" ? state.agencyTypeOther : state.agencyType,
              city: state.city,
              primaryColor: palette.primary,
              secondaryColor: palette.secondary,
              hasLogo: !!state.logoBase64,
              price: formattedPriceForAd || price,
              currencySymbol,
              installments,
              promoName: (promoName || "Oferta Especial").toUpperCase(),
              highlights: categoria === "experiencia_destino" ? [] : highlights,
              ctaText: state.whatsapp ? "Reserve no WhatsApp" : "Reserve agora",
              templateId: mustComposeWithCanvas ? undefined : pick.templateId,
              photoOnly: true,
              canvasOnly: mustComposeWithCanvas,
              variation: (forcedVariant !== null ? forcedVariant : nextVariantAi) + idx,
              packageType: "Voo + Hotel",
              duration: categoria === "experiencia_destino" ? (travelPeriod || "") : (travelPeriod || "5 NOITES"),
              forbiddenHeadlines: guard.headlines,
              forbiddenLayouts: guard.layouts,
              ...(isAiExperienceStory
                ? { customPrompt: experienceBackgroundPrompt(nextVariantAi + idx) }
                : {}),
              iaPuraMode: true,
              userGeminiKey: "AIzaSyBqZ0IOgfYIprzdfirVQUiE6hbtWOS1Tw0",
            },
          }))
        );

        const images: string[] = [];
        let providerSeen: "user_gemini" | "lovable_ai" | null = null;
        const { reframeImageToAspect } = await import("@/lib/fabrica-compose-art");
        let cleanBackgroundForSite = ""; // Içado para coletar a última foto da IA

        for (const result of results) {
          if (result.error) throw result.error;
          if (result.data?.error && result.data?.fallback === false) {
            setGenerationError(result.data.error);
            toast.error(result.data.error);
            return;
          }
          if (result.data?.error) throw new Error(result.data.error);
          if (!result.data?.image) throw new Error("Nenhuma imagem foi gerada.");

          let img = result.data.image as string;
          // Ajusta o enquadramento se a IA entregar algo fora do aspecto (especialmente em Square)
          try { img = await reframeImageToAspect(img, format); }
          catch (e) { console.warn("reframe failed", e); }

          // TRAVA DE CÃ“DIGO: a IA entrega apenas o fundo. A arte final SEMPRE passa pelo Canvas.
          cleanBackgroundForSite = img; // Preserva a foto LIMPA da IA antes de sujar com o texto!
          
          // Define estratégia para o motor Canvas:
          const canvasStrategy: StrategyId = isAiExperienceStory 
            ? aiExperienceStrategy 
            : (cat.legacyStrategy || "matriz");
            
          // ðŸ§  INTELIGÃŠNCIA LOTE A/B PARA IA:
          // Em vez de fazer 3 chamadas pagas para a IA, usamos o MESMO fundo limpo gerado acima
          // e mandamos o motor Canvas renderizar 3 variações visuais diferentes dele instantaneamente!
          const numVersions = isBatchMode ? 3 : 1;
          const renderVersions = Array.from({ length: numVersions }, (_, i) => i);
          
          const renderedSet = await Promise.all(
            renderVersions.map(async (vIdx) => {
              const finalImg = await composeTravelAd({
                imageUrl: img,
                format,
                destination,
                city: state.city,
                primaryColor: palette.primary,
                secondaryColor: palette.secondary,
                price: formattedPriceForAd || price,
                currencySymbol,
                installments,
                promoName,
                highlights,
                hasLogo: !!state.logoBase64,
                logoDataUrl: state.logoBase64,
                footerContact1Icon: state.footerContact1Icon,
                footerContact1Value: state.footerContact1Value,
                footerContact2Icon: state.footerContact2Icon,
                footerContact2Value: state.footerContact2Value,
                whatsapp: state.whatsapp,
                instagram: state.instagram,
                paymentMode,
                paymentLabel: paymentLabel || undefined,
                paymentSuffix,
                strategy: canvasStrategy,
                variation: freshSeedAi + images.length + vIdx,
                // Força variação diferente para cada versão do loop garantindo A/B visual!
                forceVariant: typeof nextVariantAi === "number" ? (nextVariantAi + images.length + vIdx) % 5 : undefined,
                isExperience: categoria === "experiencia_destino",
                titleOverride: resolvedAdTitle,
                titleVariations: adTitleVariations,
                travelPeriod,
                totalOverride: totalOverride || undefined,
                showPixBanner,
                pixBannerText: pixBannerText || undefined,
                showTotal,
                fontFamily,
                titleScale,
                descScale,
                textColorOverride: effectiveTextColor,
              });
              return finalImg;
            })
          );

          images.push(...renderedSet);
          if (result.data.provider) providerSeen = result.data.provider;
        }

        const MAX_VARIATIONS_AI = 3;
        setGeneratedImages((prev) => [...prev, ...images].slice(-MAX_VARIATIONS_AI));
        setGeneratedImage(images[images.length - 1]);
        const currentGenerated = state.allGeneratedAdImages || [];
        const updatedGenerated = [images[images.length - 1], ...currentGenerated].slice(0, 10);
        update({ 
          generatedAdImage: images[images.length - 1], 
          primaryColor: palette.primary,
          allGeneratedAdImages: updatedGenerated
        });
        // Passa a ÃšLTIMA imagem final E a ÃšLTIMA imagem limpa gerada no loop (via closure seria complexo, então guardamos uma referência fora do loop se precisasse, mas podemos re-extrair ou apenas guardar no array)
        // ATENÃ‡ÃƒO: Para IA, como gera múltiplos em array, precisamos capturar a LIMPA da que foi pra tela!
        syncGeneratedPackageToSite(images[images.length - 1], cleanBackgroundForSite);
        if (providerSeen) setLastProvider(providerSeen);

        // Registra no GenerationGuard
        const layoutId = isAiExperienceStory ? aiExperienceStrategy : (picks[0]?.templateId || "ai_unknown");
        // Headline real é decidida no backend, mas registramos a "categoria visual" como hash:
        // o que importa é layout+paleta para impedir mesmo arranjo no próximo clique.
        registerGeneration(categoria, "ai", format, {
          layoutId,
          headline: `${categoria}-${freshSeedAi}`, // o real fica no backend; isso impede colisão
          primary: palette.primary,
          secondary: palette.secondary,
        });

        // Persiste o último prompt usado para a próxima rotação não repetir
        const usedTemplateIds = isAiExperienceStory ? [] : picks.map((p) => p.templateId);
        const lastUsed = usedTemplateIds[usedTemplateIds.length - 1];
        const nextRecent = isAiExperienceStory ? storedRecent : [...usedTemplateIds, ...storedRecent.filter((id) => !usedTemplateIds.includes(id))].slice(0, Math.max(1, cat.prompts.length - usedTemplateIds.length));
        if (!isAiExperienceStory && lastUsed) {
          setLastTemplateId(lastUsed);
          setRecentTemplateIds(nextRecent);
          localStorage.setItem(categoryLastKey, lastUsed);
          localStorage.setItem(categoryRecentKey, JSON.stringify(nextRecent));
          localStorage.setItem("fabrica_last_template_id", lastUsed);
          localStorage.setItem("fabrica_recent_template_ids", JSON.stringify(nextRecent));
        }

        const newCount = generationCount + images.length;
        setGenerationCount(newCount);
        localStorage.setItem("fabrica_gen_count", String(newCount));

        const newAiCount = incrementAiPureDailyCount(images.length);
        setAiPureCount(newAiCount);

        finishCycle(images.length);

        toast.success(`${images.length} ${images.length === 1 ? "variação gerada" : "variações geradas"} — ${cat.name}`);
        return;
      }

      // ===== MODO CUSTOM (link/upload do usuário) — gera 1 ou mais imagens locais =====
      toast.info(isBatchMode ? "Gerando lote de 3 variações com sua imagem" : "Gerando 1 imagem única com sua imagem");
      const guardCustom = getForbiddenSets(categoria, "custom", format);
      const stratHistKeyCustom = scopedStrategyHistoryKey(categoria, "custom", format);
      let stratHistoryCustom: StrategyId[] = [];
      try { stratHistoryCustom = JSON.parse(localStorage.getItem(stratHistKeyCustom) || "[]"); } catch { stratHistoryCustom = []; }
      const mergedHistCustom = Array.from(new Set([...stratHistoryCustom, ...(guardCustom.layouts as StrategyId[])]));
      const freshSeedCustom = freshSeed(generationSeed);
      // Feature Lote A/B: Pede 3 estratégias distintas se isBatchMode estiver ativado
      const numToGenCustom = isBatchMode ? 3 : 1;
      const chosen = pickDistinctLocalStrategies(categoria, freshSeedCustom, numToGenCustom, mergedHistCustom);
      localStorage.setItem(stratHistKeyCustom, JSON.stringify(chosen));
      const palette = selectedPalette(primaryColor, secondaryColor);

      // Rotação determinística entre as 5 variantes do compositor (V0/V1/V2/V3/V4)
      const TOTAL_VARIANTS = 5;
      const recent = variantHistoryRef.current.slice(-2);
      let candidates = Array.from({ length: TOTAL_VARIANTS }, (_, i) => i).filter((v) => !recent.includes(v));
      if (candidates.length === 0) {
        candidates = Array.from({ length: TOTAL_VARIANTS }, (_, i) => i);
      }
      const nextVariant = forcedVariant !== null ? forcedVariant : candidates[Math.floor(Math.random() * candidates.length)];
      variantHistoryRef.current = [...variantHistoryRef.current.slice(-3), nextVariant];

      const imagesCustom = await Promise.all(
        chosen.map(async (localStrategy, idx) => {
          let img = await composeTravelAd({
            imageUrl: refImage,
            format,
            destination,
            city: state.city,
            primaryColor: palette.primary,
            secondaryColor: palette.secondary,
            price: formattedPriceForAd || price,
            currencySymbol,
            installments,
            promoName,
            highlights,
            hasLogo: !!state.logoBase64,
            logoDataUrl: state.logoBase64,
            footerContact1Icon: state.footerContact1Icon,
            footerContact1Value: state.footerContact1Value,
            footerContact2Icon: state.footerContact2Icon,
            footerContact2Value: state.footerContact2Value,
            whatsapp: state.whatsapp,
            instagram: state.instagram,
            paymentMode,
            paymentLabel: paymentLabel || undefined,
            paymentSuffix,
            strategy: localStrategy,
            variation: freshSeedCustom + idx,
            forceVariant: typeof nextVariant === "number" ? (nextVariant + idx) % 5 : undefined,
            isExperience: categoria === "experiencia_destino",
            titleOverride: resolvedAdTitle,
            titleVariations: adTitleVariations,
            travelPeriod,
            totalOverride: totalOverride || undefined,
            showPixBanner,
            pixBannerText: pixBannerText || undefined,
            showTotal,
            fontFamily,
            titleScale,
            descScale,
            textColorOverride: effectiveTextColor,
          });
          return img;
        })
      );

      registerGeneration(categoria, "custom", format, {
        layoutId: chosen[0],
        headline: promoName || "OFERTA ESPECIAL",
        primary: palette.primary,
        secondary: palette.secondary,
      });

      // Acumula até 3 variações lado a lado (não substitui as anteriores)
      const MAX_VARIATIONS = 3;
      setGeneratedImages((prev) => {
        const merged = [...prev, ...imagesCustom].slice(-MAX_VARIATIONS);
        return merged;
      });
      setGeneratedImage(imagesCustom[imagesCustom.length - 1]);
      const currentGenerated = state.allGeneratedAdImages || [];
      const updatedGenerated = [imagesCustom[imagesCustom.length - 1], ...currentGenerated].slice(0, 10);
      update({ 
        generatedAdImage: imagesCustom[imagesCustom.length - 1], 
        primaryColor: palette.primary,
        allGeneratedAdImages: updatedGenerated
      });
      syncGeneratedPackageToSite(imagesCustom[imagesCustom.length - 1], refImage);

      const newCount = generationCount + imagesCustom.length;
      setGenerationCount(newCount);
      localStorage.setItem("fabrica_gen_count", String(newCount));
      finishCycle(imagesCustom.length);

      toast.success(`${imagesCustom.length} ${imagesCustom.length === 1 ? "variação gerada" : "variações geradas"} com sua imagem!`);

    } catch (err: any) {
      console.error("generate error", err);
      const message = err?.message || "Erro ao gerar anúncio";
      setGenerationError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const generateNext = () => {
    const next = variationCounter + 1;
    setVariationCounter(next);
    generate(next, true);
  };

  // Genera los pies de foto de copy siempre que las imágenes o los datos del anuncio cambien
  useEffect(() => {
    if (generatedImages.length === 0) return;
    const caps = buildAdCaptions({
      destination,
      price: formattedPriceForAd || price,
      installments: paymentLabel || installments,
      paymentMode,
      paymentSuffix,
      highlights,
      promoName,
      travelPeriod,
      agencyName: state.agencyName,
      whatsapp: state.footerContact1Value || state.whatsapp,
      instagram: state.footerContact2Value || state.instagram,
      isExperience: categoria === "experiencia_destino",
    });
    setAdCaptions(caps);
    setSelectedCaption(null);
    setCaptionCopied(false);
  }, [generatedImages.length, destination, formattedPriceForAd, price, paymentLabel, installments, paymentMode, paymentSuffix, highlights, promoName, travelPeriod, categoria, state.agencyName, state.footerContact1Value, state.whatsapp, state.footerContact2Value, state.instagram]);

  const downloadPNG = () => {
    if (generatedImages.length === 0) return;
    
    try {
      const toDownload = isBatchMode ? generatedImages : [generatedImage];
      
      toDownload.forEach((img, idx) => {
        const a = document.createElement("a");
        a.href = img;
        const suffix = isBatchMode ? `-v${idx + 1}` : "";
        a.download = `anuncio-${(destination || "destino").toLowerCase().replace(/\s+/g, "-")}-${format}${suffix}.png`;
        document.body.appendChild(a);
        a.click();
        a.remove();
      });
      
      toast.success(isBatchMode ? "¡Todas las imágenes descargadas!" : "¡Imagen descargada!");
    } catch { toast.error("Error al descargar la imagen"); }
  };

  const sectionCls = "bg-white/[0.05] border border-white/[0.08] rounded-2xl p-6";
  const labelCls = "text-[11px] text-white/60 uppercase tracking-wider font-semibold block mb-1.5";
  const inputCls = "w-full bg-white/[0.06] border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 outline-none focus:border-white/40";

  return (
    <div className="max-w-3xl lg:max-w-[1550px] mx-auto transition-all duration-300">
      {/* Banner de provedor de IA */}
      {genMode === "ai" && (
        <div className={`rounded-2xl p-4 border mb-6 ${
          lastProvider === "user_gemini"
            ? "bg-emerald-500/15 border-emerald-500/30"
            : lastProvider === "lovable_ai"
              ? "bg-blue-500/15 border-blue-500/30"
              : "bg-white/[0.05] border-white/10"
        }`}>
          <div className="flex items-start gap-3">
            <div className="text-2xl">
              {lastProvider === "user_gemini" ? "🟢" : lastProvider === "lovable_ai" ? "🔵" : "⚡"}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-bold text-white">
                {lastProvider === "user_gemini" && "Usando tu clave Gemini (gratis)"}
                {lastProvider === "lovable_ai" && "Usando créditos de la plataforma"}
                {!lastProvider && "Proveedor de IA configurado"}
              </div>
              <p className="text-[11px] text-white/60 leading-snug mt-0.5">
                {lastProvider === "user_gemini" && (
                  <>Cuota gratuita de Google: ~1.500 imágenes/día. Revisa tu uso en <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="underline text-emerald-300">aistudio.google.com</a>.</>
                )}
                {lastProvider === "lovable_ai" && (
                  <>Cada imagen consume créditos de la plataforma.</>
                )}
                {!lastProvider && (
                  <>Intentaremos primero usar tu clave Gemini gratuita. Si falla, se usarán los créditos de la plataforma.</>
                )}
              </p>
              {/* Barra de progreso de créditos */}
              {lastProvider !== "user_gemini" && (
                <div className="mt-2">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[10px] text-white/40 uppercase tracking-wider">Créditos IA usados</span>
                    <span className={`text-[11px] font-bold ${
                      aiPureCount >= 20 ? "text-red-400" :
                      aiPureCount >= 15 ? "text-amber-400" :
                      "text-emerald-400"
                    }`}>{aiPureCount}/20</span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
                    <div
                      className={`h-1.5 rounded-full transition-all duration-500 ${
                        aiPureCount >= 20 ? "bg-red-500" :
                        aiPureCount >= 15 ? "bg-amber-400" :
                        "bg-emerald-500"
                      }`}
                      style={{ width: `${Math.min(100, (aiPureCount / 20) * 100)}%` }}
                    />
                  </div>
                  {aiPureCount >= 20 && (
                    <p className="text-[10px] text-red-400 mt-1">⚡ Límite alcanzado. Conecta tu clave Gemini gratuita para continuar.</p>
                  )}
                  {aiPureCount >= 15 && aiPureCount < 20 && (
                    <p className="text-[10px] text-amber-400 mt-1">⚠️ {20 - aiPureCount} generaciones restantes en esta sesión.</p>
                  )}
                </div>
              )}
            </div>
            <div className="text-right shrink-0">
              <div className="text-[10px] text-white/40 uppercase tracking-wider">Generadas</div>
              <div className="text-lg font-bold text-white">{aiPureCount}</div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* COLUNA ESQUERDA: Sidebar de Configurações */}
        <div className="lg:col-span-5 space-y-6">
          <MinimizableCard title="👤 Perfil y Canales de Atención">
            <div className="space-y-5">
                            {user && (
                <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl relative overflow-hidden transition-all shadow-[0_4px_20px_rgba(0,0,0,0.2)]">
                  <div className="absolute top-0 left-0 w-1 h-full" style={{ background: primaryColor }}></div>
                  <button
                    type="button"
                    onClick={() => setProjectsPanelOpen(!projectsPanelOpen)}
                    className="w-full flex items-center justify-between text-[11px] text-white/60 font-bold uppercase tracking-wider outline-none text-left"
                  >
                    <span className="flex items-center gap-1.5">📂 Proyectos Guardados {savedProjects && savedProjects.length > 0 && `(${savedProjects.length})`}</span>
                    <span className="text-[10px] text-white/30 font-medium">{projectsPanelOpen ? "▲ Contraer" : "▼ Expandir / Cargar"}</span>
                  </button>
                  
                  {projectsPanelOpen && (
                    <div className="mt-3 flex flex-col sm:flex-row gap-2 pt-2 border-t border-white/5">
                      {savedProjects && savedProjects.length > 0 ? (
                        <select
                          onChange={(e) => {
                            const p = savedProjects.find(x => x.id === e.target.value);
                            if (p && p.state_snapshot) {
                               update({ 
                                 ...p.state_snapshot, 
                                 currentPhase: state.currentPhase, 
                                 diagnosticoCompleto: false 
                               });
                               toast.success(`¡Proyecto "${p.agency_name || 'Sin Nombre'}" cargado! Todas las configuraciones han sido restauradas.`);
                            }
                            e.target.value = "";
                          }}
                          className="flex-1 bg-white/[0.04] border border-white/10 rounded-lg px-3 py-2 text-white outline-none focus:border-white/30 transition-colors text-xs"
                        >
                          <option value="" className="bg-zinc-900">Seleccionar un proyecto...</option>
                          {savedProjects.map((p) => (
                            <option key={p.id} value={p.id} className="bg-zinc-900">{p.agency_name || "Sin Nombre"} ({new Date(p.updated_at).toLocaleDateString()})</option>
                          ))}
                        </select>
                      ) : (
                        <div className="flex-1 bg-white/[0.01] border border-white/5 rounded-lg px-3 py-2 text-white/40 text-xs flex items-center">
                          No se encontraron proyectos guardados
                        </div>
                      )}
                      
                      <button
                        type="button"
                        onClick={() => {
                          const currentPhase = state.currentPhase;
                          reset();
                          setTimeout(() => {
                            update({ currentPhase });
                          }, 50);
                          toast.success("¡Nuevo projeto iniciado! Las informaciones han sido reiniciadas.");
                        }}
                        className="px-3 py-2 rounded-lg text-white text-xs font-bold transition-all border border-white/10 hover:bg-white/5 active:scale-95 shrink-0 flex items-center justify-center gap-1.5"
                        style={{ borderColor: `${primaryColor}40` }}
                      >
                        <span>+ Nuevo</span>
                      </button>
                    </div>
                  )}
                </div>
              )}

              <div className="grid grid-cols-1 gap-4">
                {/* Logo */}
                <div>
                  <label className="text-[10px] font-bold text-white/30 uppercase tracking-[0.15em] mb-2.5 block">Identidad Visual</label>
                  {!state.logoBase64 ? (
                    <label className="flex flex-col items-center justify-center gap-2.5 p-4 bg-white/[0.02] border-2 border-dashed border-white/10 rounded-2xl cursor-pointer hover:border-white/20 hover:bg-white/[0.04] transition-all group h-[100px]">
                      <Upload className="w-5 h-5 text-white/40 group-hover:text-white/70" />
                      <span className="text-[10px] font-bold text-white/40 uppercase tracking-tighter group-hover:text-white/60">Subir Logo</span>
                      <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                    </label>
                  ) : (
                    <div className="relative group rounded-2xl overflow-hidden bg-white/[0.03] p-3 border border-white/10 h-[100px] flex items-center justify-center">
                      <img src={state.logoBase64} alt="Logo" className="max-w-full max-h-full object-contain" />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-2 cursor-pointer transition-all backdrop-blur-sm">
                        <label className="p-2 bg-white/10 hover:bg-white/20 rounded-full cursor-pointer transition-colors" title="Cambiar Logo">
                          <RotateCcw className="w-4 h-4 text-white" />
                          <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                        </label>
                        <button
                          type="button"
                          onClick={() => { update({ logoBase64: "" }); toast.success("Logotipo eliminado"); }}
                          className="p-2 bg-red-500/20 hover:bg-red-500/40 rounded-full transition-colors"
                          title="Eliminar"
                        >
                          <X className="w-4 h-4 text-white" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Contatos */}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-white/30 uppercase tracking-[0.15em] mb-1 block">Canales de Atención</label>
                  
                  {/* Contato 1 */}
                  <div className="flex items-center gap-2 bg-white/[0.02] p-1 rounded-xl border border-white/5 focus-within:border-white/20 transition-colors">
                    <div className="w-[45%] relative">
                      <select
                        value={state.footerContact1Icon || "whatsapp_green"}
                        onChange={(e) => update({ footerContact1Icon: e.target.value as any })}
                        className="w-full bg-white/5 border-none rounded-lg pl-2 pr-6 py-1.5 text-[10px] font-medium text-white outline-none appearance-none cursor-pointer"
                      >
                        <option value="whatsapp_green" className="bg-zinc-900">WhatsApp Oficial</option>
                        <option value="whatsapp_custom" className="bg-zinc-900">WhatsApp Sólido</option>
                        <option value="instagram_gradient" className="bg-zinc-900">Instagram Color</option>
                        <option value="instagram_custom" className="bg-zinc-900">Instagram Sólido</option>
                        <option value="website" className="bg-zinc-900">Website / Enlace</option>
                        <option value="none" className="bg-zinc-900">Ocultar</option>
                      </select>
                      <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none opacity-30">
                        <ChevronDown className="w-3 h-3 text-white" />
                      </div>
                    </div>
                    <div className="w-[55%]">
                      <input
                        value={state.footerContact1Value ?? formatAdPhone(state.whatsapp || "")}
                        onChange={(e) => {
                          const isPhone = state.footerContact1Icon?.startsWith("whatsapp");
                          const val = isPhone ? formatAdPhone(e.target.value) : e.target.value;
                          update({ footerContact1Value: val });
                        }}
                        placeholder={state.footerContact1Icon?.startsWith("whatsapp") ? "(00) 9 0000-0000" : "Enlace o Teléfono"}
                        className="w-full bg-transparent border-none px-2 py-1.5 text-[10px] text-white outline-none placeholder:text-white/10"
                      />
                    </div>
                  </div>

                  {/* Contato 2 */}
                  <div className="flex items-center gap-2 bg-white/[0.02] p-1 rounded-xl border border-white/5 focus-within:border-white/20 transition-colors">
                    <div className="w-[45%] relative">
                      <select
                        value={state.footerContact2Icon || "instagram_gradient"}
                        onChange={(e) => update({ footerContact2Icon: e.target.value as any })}
                        className="w-full bg-white/5 border-none rounded-lg pl-2 pr-6 py-1.5 text-[10px] font-medium text-white outline-none appearance-none cursor-pointer"
                      >
                        <option value="whatsapp_green" className="bg-zinc-900">WhatsApp Oficial</option>
                        <option value="whatsapp_custom" className="bg-zinc-900">WhatsApp Sólido</option>
                        <option value="instagram_gradient" className="bg-zinc-900">Instagram Color</option>
                        <option value="instagram_custom" className="bg-zinc-900">Instagram Sólido</option>
                        <option value="website" className="bg-zinc-900">Website / Enlace</option>
                        <option value="none" className="bg-zinc-900">Ocultar</option>
                      </select>
                      <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none opacity-30">
                        <ChevronDown className="w-3 h-3 text-white" />
                      </div>
                    </div>
                    <div className="w-[55%]">
                      <input
                        value={state.footerContact2Value ?? (state.instagram || "")}
                        onChange={(e) => {
                          const isPhone = state.footerContact2Icon?.startsWith("whatsapp");
                          const isInsta = state.footerContact2Icon?.startsWith("instagram");
                          let val = e.target.value;
                          if (isPhone) val = formatAdPhone(val);
                          else if (isInsta) val = val.replace(/^@/, "");
                          update({ footerContact2Value: val });
                        }}
                        placeholder={state.footerContact2Icon?.startsWith("instagram") ? "@usuario" : "Perfil o Enlace"}
                        className="w-full bg-transparent border-none px-2 py-1.5 text-[10px] text-white outline-none placeholder:text-white/10"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </MinimizableCard>

          <MinimizableCard title="🛠️ Modo de Creación y Categoría">
            <div className="space-y-4">
              {/* Modo de Geração */}
              <div>
                <label className={labelCls}>Modo de Creación</label>
                <div className="flex bg-black/40 p-1 rounded-xl border border-white/5 w-full">
                  <button
                    type="button"
                    onClick={() => setGenMode("photo")}
                    className={`flex-1 flex items-center justify-center gap-1 py-2 rounded-lg text-[10px] font-bold transition-all disabled:opacity-30 ${genMode === "photo" ? "bg-white/10 text-white shadow-sm" : "text-white/50 hover:text-white"}`}
                  >
                    <ImageIcon className="w-3.5 h-3.5 inline mr-1" /> Foto Real <span className="hidden sm:inline font-normal opacity-50">(ilimitada)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setGenMode("custom")}
                    className={`flex-1 flex items-center justify-center gap-1 py-2 rounded-lg text-[10px] font-bold transition-all disabled:opacity-30 ${genMode === "custom" ? "bg-white/10 text-white shadow-sm" : "text-white/50 hover:text-white"}`}
                  >
                    <Upload className="w-3.5 h-3.5 inline mr-1" /> Tu Foto
                  </button>
                  <button
                    type="button"
                    disabled
                    title="En mantenimiento — lo reactivaremos pronto"
                    aria-disabled="true"
                    className="flex-1 flex items-center justify-center gap-1 py-2 rounded-lg text-[10px] font-bold text-white/30 cursor-not-allowed opacity-50"
                  >
                    <Sparkles className="w-3.5 h-3.5 inline mr-1" /> Imagen IA <span className="hidden sm:inline font-normal opacity-70">(desactivado)</span>
                  </button>
                </div>
              </div>


              {/* Layout Version Selector */}
              {genMode !== "custom" && (
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className={labelCls}>0b · Versión del Layout</label>
                    <span className="text-[9px] text-white/30 font-bold uppercase tracking-wider bg-white/5 px-2 py-0.5 rounded border border-white/10">Engine v3</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: "canvas-hybrid-v3-nowordmark", label: "Texto Integrado (Nueva)", desc: "Layout integrado premium sin franja gris", labelTag: "Mejor" },
                      { id: "canvas-v3-clean", label: "Estilo Clásico", desc: "Texto con fondo semi-transparente clásico", labelTag: "Original" },
                      { id: "canvas-v3-minimalist", label: "Arte Limpio", desc: "Diseño minimalista enfocado en la foto", labelTag: "Sutil" },
                    ].map((opt) => {
                      const selected = (state as any).renderEngineVersion === opt.id || (opt.id === "canvas-hybrid-v3-nowordmark" && !(state as any).renderEngineVersion);
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => update({ renderEngineVersion: opt.id } as any)}
                          className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all ${
                            selected
                              ? "bg-white/[0.08] text-white"
                              : "bg-white/[0.02] text-white/60 border-white/5 hover:border-white/20"
                          }`}
                          style={selected ? { borderColor: primaryColor } : undefined}
                        >
                          <span className="text-[10px] font-bold block leading-tight">{opt.label}</span>
                          <span className="text-[8px] text-white/40 block mt-1 leading-normal scale-90">{opt.desc}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Categoria */}
              <div>
                <label className={labelCls}>1 · Tipo de Anuncio</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: "oferta_pacote", label: "Oferta de Paquete", desc: "Foco en precio, cuotas, salidas e incluidos. Ideal para cerrar ventas rápidas.", badge: "Ventas" },
                    { id: "experiencia_destino", label: "Experiencia de Destino", desc: "Foco visual, sentimento y exclusividad. Ideal para atraer leads cualificados.", badge: "Lujo" },
                  ].map((opt) => {
                    const selected = categoria === opt.id;
                    const badgeColor = opt.badge === "Ventas" ? "bg-amber-500/20 text-amber-300" : "bg-emerald-500/20 text-emerald-300";
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => {
                          setCategoriaState(opt.id as CategoriaId);
                          update({ lastCategoria: opt.id });
                          /* syncCategoryDefaults removido */
                        }}
                        className={`flex flex-col items-start p-4 rounded-2xl border text-left transition-all relative ${
                          selected
                            ? "bg-white/[0.08] text-white"
                            : "bg-white/[0.02] text-white/60 border-white/5 hover:border-white/20"
                        }`}
                        style={selected ? { borderColor: primaryColor } : undefined}
                      >
                        <span className={`absolute top-3 right-3 text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded ${badgeColor}`}>
                          {opt.badge}
                        </span>
                        <span className="text-[11px] font-extrabold block mb-1">{opt.label}</span>
                        <span className="text-[9px] text-white/40 block leading-relaxed">{opt.desc}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Formato */}
              {genMode !== "custom" && (
                <div>
                  <label className={labelCls}>2 · Formato del Anuncio</label>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { id: "story", label: "Story / Reels", size: "9:16 (1080x1920)", desc: "Ideal para Stories y Reels de Instagram", Icon: Smartphone },
                      { id: "square", label: "Cuadrado Feed", size: "1:1 (1080x1080)", desc: "Ideal para Feed y WhatsApp", Icon: Square },
                    ].map((opt) => {
                      const selected = format === opt.id;
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => setFormat(opt.id as "square" | "story")}
                          className={`flex items-center gap-3 p-3.5 rounded-xl border text-left transition-all ${
                            selected
                              ? "bg-white/[0.08] text-white"
                              : "bg-white/[0.02] text-white/60 border-white/5 hover:border-white/20"
                          }`}
                          style={selected ? { borderColor: primaryColor } : undefined}
                        >
                          <opt.Icon className="w-5 h-5 flex-shrink-0" style={{ color: selected ? primaryColor : "rgba(255,255,255,0.4)" }} />
                          <div>
                            <span className="text-[11px] font-bold block">{opt.label}</span>
                            <span className="text-[9px] text-white/40 block">{opt.size}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </MinimizableCard>

          {genMode === "photo" && (
            <MinimizableCard title="📷 Elegir una foto real">
              <div className="space-y-4">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                    <input
                      value={photoQuery}
                      onChange={(e) => setPhotoQuery(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && searchPhotos(photoQuery)}
                      placeholder="Buscar destino (ej: Cancún, Orlando, Madrid...)"
                      className="w-full bg-white/[0.05] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-white/30 outline-none focus:border-white/30"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => searchPhotos(photoQuery)}
                    disabled={searchingPhotos || !photoQuery.trim()}
                    className="px-4 py-2.5 bg-white/10 hover:bg-white/15 disabled:opacity-40 disabled:hover:bg-white/10 rounded-xl text-xs font-bold text-white transition-all flex items-center gap-1.5"
                  >
                    {searchingPhotos ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Buscar"}
                  </button>
                </div>

                {photos.length > 0 ? (
                  <div className="grid grid-cols-3 gap-2 max-h-[220px] overflow-y-auto pr-1">
                    {photos.map((p) => {
                      const active = selectedPhotoUrl === p.url;
                      return (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => {
                            setSelectedPhotoUrl(p.url);
                            toast.success("¡Foto seleccionada!");
                          }}
                          className={`relative aspect-[3/4] rounded-lg overflow-hidden border-2 bg-zinc-950 transition-all ${
                            active ? "border-white scale-95 shadow-lg" : "border-white/5 hover:border-white/20"
                          }`}
                        >
                          <img src={p.thumb} alt={p.alt} className="w-full h-full object-cover" />
                          {active && (
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                              <Check className="w-5 h-5 text-white" />
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-[10px] text-white/40 text-center py-4">¡Escribe tu destino arriba y busca entre miles de fotos de alta calidad!</p>
                )}
              </div>
            </MinimizableCard>
          )}

          {genMode === "custom" && (
            <MinimizableCard title="🖼️ Su imagen de referencia">
              <div className="space-y-4">
                <div className="flex bg-black/40 p-1 rounded-xl border border-white/5 w-full">
                  <button
                    type="button"
                    onClick={() => setCustomSource("upload")}
                    className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold transition-all ${customSource === "upload" ? "bg-white/10 text-white shadow-sm" : "text-white/50 hover:text-white"}`}
                  >
                    <Upload className="w-3.5 h-3.5 inline mr-1" /> Archivo de Computadora
                  </button>
                  <button
                    type="button"
                    onClick={() => setCustomSource("link")}
                    className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold transition-all ${customSource === "link" ? "bg-white/10 text-white shadow-sm" : "text-white/50 hover:text-white"}`}
                  >
                    <Link2 className="w-3.5 h-3.5 inline mr-1" /> Enlace de Internet (URL)
                  </button>
                </div>

                {customSource === "upload" ? (
                  <div>
                    {!customImageData ? (
                      <label className="flex flex-col items-center justify-center gap-3 p-8 bg-white/[0.02] border-2 border-dashed border-white/10 rounded-2xl cursor-pointer hover:border-white/20 hover:bg-white/[0.04] transition-all group h-[140px]">
                        <ImageIcon className="w-8 h-8 text-white/30 group-hover:scale-110 transition-transform" />
                        <div className="text-center">
                          <span className="text-[11px] font-bold text-white/50 block group-hover:text-white/80">Elegir imagen de anuncio</span>
                          <span className="text-[9px] text-white/30 block mt-0.5">JPG o PNG, hasta 5MB</span>
                        </div>
                        <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                      </label>
                    ) : (
                      <div className="relative group rounded-2xl overflow-hidden bg-black/40 border border-white/10 aspect-video flex items-center justify-center">
                        <img src={customImageData} alt="Custom upload" className="max-w-full max-h-full object-contain" />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-2 cursor-pointer transition-all backdrop-blur-sm">
                          <label className="p-2.5 bg-white/10 hover:bg-white/20 rounded-full cursor-pointer transition-colors" title="Cambiar imagen">
                            <RotateCcw className="w-4 h-4 text-white" />
                            <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                          </label>
                          <button
                            type="button"
                            onClick={() => { setCustomImageData(""); toast.success("Imagen removida"); }}
                            className="p-2.5 bg-red-500/20 hover:bg-red-500/40 rounded-full transition-colors"
                            title="Eliminar"
                          >
                            <X className="w-4 h-4 text-white" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-2">
                    <label className={labelCls}>URL de la imagen externa</label>
                    <input
                      value={customLink}
                      onChange={(e) => {
                        setCustomLink(e.target.value);
                        setCustomImageData(e.target.value);
                      }}
                      placeholder="https://ejemplo.com/tu-imagen.jpg"
                      className={inputCls}
                    />
                  </div>
                )}
              </div>
            </MinimizableCard>
          )}

          <MinimizableCard title="📝 Datos del anuncio">
            <div className="space-y-4">
              {/* Destino */}
              <div>
                <div className="flex items-baseline justify-between mb-1.5">
                  <label className={labelCls}>Nombre del Destino</label>
                  <span className="text-[9px] text-white/30 font-bold uppercase">Campo Obligatorio</span>
                </div>
                <div className="relative">
                  <input
                    value={destinationState}
                    onChange={(e) => setDestination(e.target.value)}
                    placeholder="Ej: Cancún, Porto de Galinhas, Buenos Aires..."
                    className={inputCls}
                  />
                  {destinationState && (
                    <button
                      type="button"
                      onClick={() => setDestination("")}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Price Options */}
              {categoria === "oferta_pacote" && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelCls}>Moneda</label>
                    <select
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value as Currency)}
                      className="w-full bg-white/[0.06] border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white outline-none focus:border-white/40 appearance-none animate-none"
                    >
                      {CURRENCY_PRESETS.map((c) => (
                        <option key={c.id} value={c.id} className="bg-zinc-900">{c.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={labelCls}>Precio Base</label>
                    <input
                      value={price}
                      onChange={(e) => setPrice(formatPriceWhileTyping(e.target.value, currency))}
                      placeholder="Ej: 149.90"
                      className="w-full bg-white/[0.06] border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white outline-none focus:border-white/40"
                    />
                  </div>
                </div>
              )}

              {/* Installments Options */}
              {categoria === "oferta_pacote" && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelCls}>Opción de Pago</label>
                    <select
                      value={paymentMode}
                      onChange={(e) => setPaymentMode(e.target.value as PaymentMode)}
                      className="w-full bg-white/[0.06] border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white outline-none focus:border-white/40"
                    >
                      {PAYMENT_PRESETS.map((p) => (
                        <option key={p.id} value={p.id} className="bg-zinc-900">{p.emoji} {p.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={labelCls}>
                      {paymentMode === "installments" && "Cuotas (ej: 10x)"}
                      {paymentMode === "cash" && "Texto de Destacado"}
                      {paymentMode === "down_plus" && "Detalle del Pago"}
                    </label>
                    <input
                      value={installments}
                      onChange={(e) => setInstallments(e.target.value)}
                      placeholder={PAYMENT_PRESETS.find(p => p.id === paymentMode)?.hint || "Ej: 10x"}
                      className="w-full bg-white/[0.06] border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white outline-none focus:border-white/40"
                    />
                  </div>
                </div>
              )}

              {/* Extras & Price Suffix */}
              {categoria === "oferta_pacote" && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className={labelCls}>Sufijo del Precio (ej: por persona)</label>
                    <div className="flex gap-2">
                      {Array.from(DEFAULT_SUFFIXES_OFERTA).slice(0, 3).map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => setPaymentSuffix(s)}
                          className={`text-[9px] px-2 py-0.5 rounded border transition-colors ${
                            paymentSuffix === s
                              ? "bg-white/10 text-white border-white/20"
                              : "bg-white/[0.02] text-white/40 border-white/5 hover:border-white/15"
                          }`}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                  <input
                    value={paymentSuffix}
                    onChange={(e) => setPaymentSuffix(e.target.value)}
                    placeholder="Ej: por persona, en hab doble..."
                    className={inputCls}
                  />

                  {/* Hide cents check */}
                  <div className="flex items-center justify-between p-2 rounded-xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-colors cursor-pointer" onClick={() => setHideCents(!hideCents)}>
                    <div>
                      <span className="text-[11px] font-bold text-white block">Ocultar Centavos (,00)</span>
                      <span className="text-[9px] text-white/40 block mt-0.5">Muestra precios como $ 1.499 en lugar de $ 1.499,00</span>
                    </div>
                    <div className={`w-10 h-5 rounded-full relative transition-colors ${hideCents ? 'bg-emerald-500' : 'bg-white/10'}`}>
                      <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-all duration-200 ${hideCents ? 'left-5.5' : 'left-0.5'}`} />
                    </div>
                  </div>

                  {/* Show Total value check */}
                  <div className="flex items-center justify-between p-2 rounded-xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-colors cursor-pointer" onClick={() => setShowTotal(!showTotal)}>
                    <div>
                      <span className="text-[11px] font-bold text-white block">Mostrar Valor Total del Paquete</span>
                      <span className="text-[9px] text-white/40 block mt-0.5">Agrega una línea extra con el valor total abajo de la financiación</span>
                    </div>
                    <div className={`w-10 h-5 rounded-full relative transition-colors ${showTotal ? 'bg-emerald-500' : 'bg-white/10'}`}>
                      <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-all duration-200 ${showTotal ? 'left-5.5' : 'left-0.5'}`} />
                    </div>
                  </div>

                  {showTotal && (
                    <div>
                      <label className={labelCls}>Sobrescrever Valor Total (Opcional)</label>
                      <input
                        value={totalOverride}
                        onChange={(e) => setTotalOverride(e.target.value)}
                        placeholder="Ej: Valor total del paquete $ 1.499,00"
                        className={inputCls}
                      />
                      <p className="text-[9px] text-white/40 mt-1">Déjalo en blanco para calcular automáticamente en base al Precio Base × 10.</p>
                    </div>
                  )}
                </div>
              )}

              {/* PIX/Descuento Banner controls */}
              {categoria === "oferta_pacote" && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-2 rounded-xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-colors cursor-pointer" onClick={() => setShowPixBanner(!showPixBanner)}>
                    <div>
                      <span className="text-[11px] font-bold text-white block">Mostrar Destacado Transferencia / Pix</span>
                      <span className="text-[9px] text-white/40 block mt-0.5">Agrega una franja de descuento en la parte inferior</span>
                    </div>
                    <div className={`w-10 h-5 rounded-full relative transition-colors ${showPixBanner ? 'bg-emerald-500' : 'bg-white/10'}`}>
                      <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-all duration-200 ${showPixBanner ? 'left-5.5' : 'left-0.5'}`} />
                    </div>
                  </div>

                  {showPixBanner && (
                    <div>
                      <label className={labelCls}>Texto del Destacado (ex: +5% OFF en Transferencia)</label>
                      <input
                        value={pixBannerText}
                        onChange={(e) => setPixBannerText(e.target.value)}
                        placeholder="Ej: +5% de descuento por transferencia"
                        className={inputCls}
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Typography controls */}
              {genMode !== "custom" && (
                <div className="space-y-4">
                  {/* Font Family selector */}
                  <div className="border border-white/5 rounded-xl bg-white/[0.01] overflow-hidden">
                    <button
                      type="button"
                      onClick={() => setFontOptionsOpen(!fontOptionsOpen)}
                      className="w-full flex items-center justify-between p-3 text-left focus:outline-none"
                    >
                      <div>
                        <span className="text-[11px] font-bold text-white block">🔤 Familia de Fuentes</span>
                        <span className="text-[9px] text-white/40 block mt-0.5">Fuente actual: {fontFamily}</span>
                      </div>
                      <ChevronDown className={`w-4 h-4 text-white/50 transition-transform ${fontOptionsOpen ? "rotate-180" : ""}`} />
                    </button>
                    {fontOptionsOpen && (
                      <div className="p-3 border-t border-white/5 grid grid-cols-3 gap-1.5 max-h-[160px] overflow-y-auto">
                        {FONT_PRESETS.map((f) => (
                          <button
                            key={f}
                            type="button"
                            onClick={() => setFontFamily(f)}
                            className={`px-2 py-1.5 rounded-lg border text-center transition-all text-[10px] font-medium truncate ${
                              fontFamily === f
                                ? "bg-white/10 text-white border-white/20"
                                : "bg-white/[0.02] text-white/60 border-white/5 hover:border-white/15"
                            }`}
                            style={{ fontFamily: f }}
                          >
                            {f}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Title & Desc Scalers */}
                  <div className="border border-white/5 rounded-xl bg-white/[0.01] overflow-hidden">
                    <button
                      type="button"
                      onClick={() => setAdvancedSizeOpen(!advancedSizeOpen)}
                      className="w-full flex items-center justify-between p-3 text-left focus:outline-none"
                    >
                      <div>
                        <span className="text-[11px] font-bold text-white block">📏 Escala y Ajustes de Tamaño</span>
                        <span className="text-[9px] text-white/40 block mt-0.5">Título: {Math.round(titleScale * 100)}% · Descripción: {Math.round(descScale * 100)}%</span>
                      </div>
                      <ChevronDown className={`w-4 h-4 text-white/50 transition-transform ${advancedSizeOpen ? "rotate-180" : ""}`} />
                    </button>
                    {advancedSizeOpen && (
                      <div className="p-4 border-t border-white/5 space-y-4">
                        <div>
                          <div className="flex justify-between text-[10px] text-white/60 mb-1">
                            <span>Tamaño del Título</span>
                            <span>{Math.round(titleScale * 100)}%</span>
                          </div>
                          <input
                            type="range"
                            min="0.7"
                            max="1.4"
                            step="0.05"
                            value={titleScale}
                            onChange={(e) => setTitleScale(parseFloat(e.target.value))}
                            className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-amber-500"
                          />
                        </div>
                        <div>
                          <div className="flex justify-between text-[10px] text-white/60 mb-1">
                            <span>Tamaño de la Descripción</span>
                            <span>{Math.round(descScale * 100)}%</span>
                          </div>
                          <input
                            type="range"
                            min="0.7"
                            max="1.4"
                            step="0.05"
                            value={descScale}
                            onChange={(e) => setDescScale(parseFloat(e.target.value))}
                            className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-amber-500"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Color Customizer */}
              {genMode !== "custom" && (
                <div className="border border-white/5 rounded-xl bg-white/[0.01] overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setColorsOpen(!colorsOpen)}
                    className="w-full flex items-center justify-between p-3 text-left focus:outline-none"
                  >
                    <div>
                      <span className="text-[11px] font-bold text-white block">🎨 Colores de Fuentes y Arte</span>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span
                          className="w-4.5 h-4.5 rounded-full border border-white/30 shadow-sm"
                          style={{ background: primaryColor }}
                          title={`Primaria ${primaryColor}`}
                        />
                        <span
                          className="w-4.5 h-4.5 rounded-full border border-white/30 shadow-sm"
                          style={{ background: secondaryColor }}
                          title={`Secundaria ${secondaryColor}`}
                        />
                        <span className="text-[10px] text-white/40 ml-1">
                          · {baseTextMode === "light" ? "Textos claros" : "Textos oscuros"}
                        </span>
                      </div>
                    </div>
                    <ChevronDown className={`w-4 h-4 text-white/50 transition-transform ${colorsOpen ? "rotate-180" : ""}`} />
                  </button>
                  {colorsOpen && (
                    <div className="p-4 border-t border-white/5 space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        {[
                          { label: "Color primario", value: primaryColor, setter: setPrimaryColor, hint: "Fondo principal" },
                          { label: "Color secundario", value: secondaryColor, setter: setSecondaryColor, hint: "Acento" },
                        ].map(({ label, value, setter, hint }) => (
                          <div key={label} className="flex flex-col items-start gap-1">
                            <div className="flex items-baseline justify-between w-full">
                              <label className={labelCls}>{label}</label>
                            </div>
                            <label
                              className="relative w-10 h-10 rounded-full cursor-pointer overflow-hidden border-2 border-white/20 hover:border-white/60 transition-all shadow-md"
                              style={{ background: value }}
                            >
                              <input
                                type="color"
                                value={/^#[0-9a-f]{6}$/i.test(value) ? value : "#000000"}
                                onChange={(e) => setter(e.target.value)}
                                className="absolute inset-0 opacity-0 cursor-pointer"
                              />
                            </label>
                            <span className="text-[9px] text-white/50 font-mono uppercase mt-1">{value}</span>
                          </div>
                        ))}
                      </div>

                      {/* Cor dos Textos Base */}
                      <div>
                        <label className={labelCls}>Color de textos base</label>
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            onClick={() => setBaseTextMode("light")}
                            className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg border text-xs font-semibold transition-all ${
                              baseTextMode === "light"
                                ? "bg-white text-black border-white"
                                : "bg-white/[0.04] text-white/70 border-white/10 hover:border-white/30"
                            }`}
                          >
                            <span className="w-2.5 h-2.5 rounded-full bg-white border border-black/20" />
                            Textos claros
                          </button>
                          <button
                            type="button"
                            onClick={() => setBaseTextMode("dark")}
                            className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg border text-xs font-semibold transition-all ${
                              baseTextMode === "dark"
                                ? "bg-neutral-900 text-white border-white"
                                : "bg-white/[0.04] text-white/70 border-white/10 hover:border-white/30"
                            }`}
                          >
                            <span className="w-2.5 h-2.5 rounded-full bg-neutral-900 border border-white/40" />
                            Textos oscuros
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Highlights/Benefits */}
              <div>
                <div className="flex items-baseline justify-between mb-1.5 gap-2">
                  <label className={labelCls}>{categoria === "experiencia_destino" ? "Descripción de la experiencia" : "Beneficios / Incluidos"}</label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        const defaults = categoria === "experiencia_destino"
                          ? DEFAULT_EXPERIENCE_HIGHLIGHTS
                          : DEFAULT_HIGHLIGHTS;
                        setHighlights(defaults);
                        setNewHl("");
                        setEditingIconIdx(null);
                        toast.success("Beneficios restaurados a los predeterminados");
                      }}
                      className="flex items-center gap-1 text-[9px] text-white/50 hover:text-white transition-colors"
                    >
                      <RotateCcw className="w-2.5 h-2.5" />
                      Restaurar
                    </button>
                    <span className="text-[9px] text-white/40">
                      {highlights.length}/{MAX_HIGHLIGHTS}
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-2">
                  {highlights.map((h, i) => {
                    const IconComp = ICON_OPTIONS.find((o) => o.key === h.icon)?.Icon || Check;
                    return (
                      <div key={i} className="bg-white/[0.04] border border-white/10 rounded-lg">
                        <div className="flex gap-1.5 items-center px-2 py-1.5">
                          {categoria !== "experiencia_destino" && (
                            <button
                              type="button"
                              onClick={() => setEditingIconIdx(editingIconIdx === i ? null : i)}
                              className="w-6 h-6 rounded flex items-center justify-center hover:bg-white/10 transition-colors flex-shrink-0"
                              style={{ color: secondaryColor }}
                            >
                              <IconComp className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <input
                            value={h.text}
                            onChange={(e) => updateHighlightText(i, e.target.value)}
                            className="flex-1 min-w-0 bg-transparent text-xs text-white outline-none"
                          />
                          <button
                            type="button"
                            onClick={() => removeHighlight(i)}
                            className="text-white/40 hover:text-red-400 flex-shrink-0"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        {categoria !== "experiencia_destino" && editingIconIdx === i && (
                          <div className="border-t border-white/10 p-2 grid grid-cols-8 gap-1">
                            {ICON_OPTIONS.map(({ key, Icon, label }) => (
                              <button
                                key={key}
                                type="button"
                                onClick={() => updateHighlightIcon(i, key)}
                                className={`p-1 rounded hover:bg-white/10 flex items-center justify-center transition-colors ${h.icon === key ? "bg-white/20" : ""}`}
                                title={label}
                              >
                                <Icon className="w-3 h-3" style={{ color: h.icon === key ? secondaryColor : "rgba(255,255,255,0.7)" }} />
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {highlights.length < MAX_HIGHLIGHTS && (
                    <div className="bg-white/[0.02] border border-dashed border-white/15 rounded-lg flex gap-1.5 items-center px-2 py-1.5 hover:border-white/30 transition-colors">
                      <Plus className="w-3.5 h-3.5 flex-shrink-0" style={{ color: secondaryColor }} />
                      <input
                        value={newHl}
                        onChange={(e) => setNewHl(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && addHighlight()}
                        placeholder={categoria === "experiencia_destino" ? "Ex: Atardecer privado" : "Ex: Bebidas incluidas"}
                        className="flex-1 min-w-0 bg-transparent text-xs text-white placeholder:text-white/30 outline-none"
                      />
                      <button
                        type="button"
                        onClick={addHighlight}
                        disabled={!newHl.trim()}
                        className="text-[10px] font-bold px-2 py-0.5 rounded text-black disabled:opacity-30 disabled:cursor-not-allowed transition-all hover:brightness-110 flex-shrink-0"
                        style={{ background: secondaryColor }}
                      >
                        +
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Lote A/B Switch */}
              <div className="bg-white/[0.03] border border-white/10 rounded-xl p-3 flex items-center justify-between gap-4 hover:bg-white/[0.05] transition-colors cursor-pointer group" onClick={() => setIsBatchMode(!isBatchMode)}>
                <div className="flex-1">
                  <div className="flex items-center gap-1.5">
                    <h4 className="text-[11px] font-bold text-white uppercase tracking-wider flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-amber-400" />
                      Probar Lote A/B (3 artes)
                    </h4>
                  </div>
                  <p className="text-[9px] text-white/50 mt-0.5 leading-relaxed">
                    Genera 3 variaciones del arte al mismo tiempo.
                  </p>
                </div>
                <div className={`w-10 h-5 rounded-full relative transition-colors ${isBatchMode ? 'bg-indigo-500' : 'bg-white/10'}`}>
                  <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-all duration-300 ${isBatchMode ? 'left-5.5' : 'left-0.5'}`} />
                </div>
              </div>
            </div>
          </MinimizableCard>

          <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3 text-[10px] text-amber-200/90 leading-relaxed">
            💡 Datos sincronizados de la agencia: <strong>{state.agencyName || "agencia"}</strong>
            {state.city && <> · {state.city}</>}
            {state.niche && <> · nicho {state.niche}</>}
            {!state.logoBase64 && <> · <span className="text-amber-300">usando wordmark de texto</span></>}
          </div>

          <button
            onClick={() => generateNext()}
            disabled={loading || !destination}
            className="w-full py-4 rounded-xl font-bold text-black flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed transition-all hover:brightness-110 text-xs uppercase tracking-wider"
            style={{ background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`, boxShadow: `0 8px 24px ${primaryColor}55` }}
          >
            {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Generando con IA...</> : <><Sparkles className="w-4 h-4" /> Generar Anuncio</>}
          </button>
          {loading && <p className="text-[10px] text-white/50 text-center mt-1">La IA toma de 8 a 25 segundos.</p>}
        </div>

        {/* COLUNA DIREITA: Resultado e visualização */}
        <div className="lg:col-span-7 space-y-6 lg:sticky lg:top-24">
          {(generationError || generatedImages.length > 0) ? (
            <div ref={resultRef} className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 space-y-4 scroll-mt-24">
              {generationError && (
                <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-100">
                  <div className="font-bold">No se pudo generar la imagen</div>
                  <p className="mt-1 text-[11px] text-red-100/80">{generationError}</p>
                </div>
              )}

              {generatedImages.length > 0 && (
                <>
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <h3 className="text-sm font-bold text-white">Tu Arte Generado</h3>
                      <p className="text-[10px] text-white/50">Haz clic en las opciones para descargar o cambiar la versión activa.</p>
                    </div>
                    <button
                      type="button"
                      onClick={downloadPNG}
                      disabled={!generatedImage}
                      className="shrink-0 flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.08] px-3.5 py-2 text-xs font-bold text-white hover:bg-white/[0.12] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Descargar PNG
                    </button>
                  </div>

                  <div className={`grid gap-3 ${generatedImages.length > 1 ? "grid-cols-3" : "grid-cols-1"}`}>
                    {generatedImages.map((img, idx) => (
                      <div key={`${img.slice(0, 48)}-${idx}`} className="relative group/img">
                        <button
                          type="button"
                          onClick={() => setGeneratedImage(img)}
                          className={`w-full overflow-hidden rounded-xl border-2 bg-black/30 transition-all ${generatedImage === img ? "border-white shadow-lg scale-98" : "border-white/10 hover:border-white/30"}`}
                          title={`Seleccionar variación ${idx + 1}`}
                        >
                          <img src={img} alt={`Anuncio generado ${idx + 1}`} className="w-full h-auto object-contain" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            const newList = generatedImages.filter((_, i) => i !== idx);
                            setGeneratedImages(newList);
                            if (generatedImage === img) setGeneratedImage(newList[0] || "");
                            toast.success("Variación eliminada");
                          }}
                          className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-lg opacity-0 group-hover/img:opacity-100 transition-opacity shadow-lg hover:bg-red-600"
                          title="Eliminar"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>

                  {adCaptions.length > 0 && (
                    <div className="rounded-xl border border-white/10 bg-black/20 p-4">
                      <div className="flex items-center justify-between gap-3 mb-2">
                        <div className="text-xs font-bold text-white flex items-center gap-1.5">
                          <FileText className="w-4 h-4 text-amber-400" /> Leyenda sugerida
                        </div>
                        <button
                          type="button"
                          onClick={async () => {
                            const text = selectedCaption || adCaptions[0];
                            await navigator.clipboard.writeText(text);
                            setSelectedCaption(text);
                            setCaptionCopied(true);
                            toast.success("¡Leyenda copiada!");
                          }}
                          className="flex items-center gap-1.5 rounded-lg border border-white/10 px-2.5 py-1 text-[10px] font-semibold text-white/80 hover:bg-white/[0.08] transition-colors"
                        >
                          {captionCopied ? <ClipboardCheck className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          Copiar
                        </button>
                      </div>
                      <div className="flex bg-black/30 p-0.5 rounded-lg border border-white/5 mb-3">
                        {adCaptions.map((_, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => {
                              setSelectedCaption(adCaptions[idx]);
                              setCaptionCopied(false);
                            }}
                            className={`flex-1 py-1 rounded-md text-[9px] font-bold transition-all ${
                              (selectedCaption || adCaptions[0]) === adCaptions[idx]
                                ? "bg-white/10 text-white shadow-sm"
                                : "text-white/40 hover:text-white"
                            }`}
                          >
                            Opción {idx + 1}
                          </button>
                        ))}
                      </div>
                      <p className="whitespace-pre-line text-[11px] leading-relaxed text-white/70 min-h-[100px] max-h-[160px] overflow-y-auto pr-1">
                        {selectedCaption || adCaptions[0]}
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>
          ) : (
            <div className="rounded-3xl border border-dashed border-white/15 bg-white/[0.01] p-12 text-center text-white/40 flex flex-col items-center justify-center min-h-[360px]">
              <Sparkles className="w-8 h-8 mb-3 opacity-30 text-amber-400 animate-pulse" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-white/80">Esperando Generación del Arte</h4>
              <p className="text-[11px] text-white/40 max-w-xs mt-1.5 leading-relaxed">¡Define los parámetros en el panel lateral izquierdo y haz clic en el botón para generar un creativo de ventas ultra profesional en segundos!</p>
            </div>
          )}

          {/* Botão de avanço para Fase 2 */}
          <div className="pt-6 border-t border-white/[0.06]">
            <button
              onClick={onNext}
              className="w-full flex items-center justify-center gap-2.5 py-4 px-6 rounded-2xl font-extrabold text-xs uppercase tracking-wider transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-amber-500/20 hover:shadow-amber-500/30"
              style={{
                background: "linear-gradient(135deg, #F59E0B, #FCD34D)",
                color: "#0A0A0A",
              }}
            >
              <span>Avanzar a la Fase 2 — Tu Sitio</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <p className="text-center text-[10px] text-white/30 mt-2">
              Crea la página de ventas de tu agencia en el siguiente paso
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const MinimizableCard = ({ title, children, defaultOpen = false }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) => {
  const { state } = useFabricaContext();
  const primaryColor = state.primaryColor || "#F59E0B";
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div
      className="bg-white/[0.03] border rounded-2xl backdrop-blur-xl transition-all duration-300 overflow-hidden"
      style={{
        borderColor: isOpen ? `${primaryColor}66` : "rgba(255, 255, 255, 0.06)",
        boxShadow: isOpen ? `0 10px 30px ${primaryColor}15` : "none",
      }}
    >
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4.5 text-left focus:outline-none select-none group"
      >
        <h3
          className="text-[11px] font-black uppercase tracking-widest transition-all duration-300 flex items-center gap-2"
          style={{ color: isOpen ? primaryColor : "rgba(255, 255, 255, 0.6)" }}
        >
          {isOpen && (
            <span
              className="w-2 h-2 rounded-full animate-pulse flex-shrink-0"
              style={{ backgroundColor: primaryColor }}
            />
          )}
          {title}
        </h3>
        <div
          className="w-7 h-7 rounded-lg flex items-center justify-center border transition-all duration-300 text-xs font-black"
          style={{
            borderColor: isOpen ? `${primaryColor}66` : "rgba(255, 255, 255, 0.15)",
            backgroundColor: isOpen ? `${primaryColor}15` : "transparent",
            color: isOpen ? primaryColor : "rgba(255, 255, 255, 0.6)",
          }}
        >
          {isOpen ? "–" : "+"}
        </div>
      </button>

      <div
        className={`transition-all duration-300 ease-in-out ${
          isOpen ? "max-h-[4000px] opacity-100 p-5 pt-0 border-t border-white/[0.04]" : "max-h-0 opacity-0 pointer-events-none"
        }`}
      >
        {children}
      </div>
    </div>
  );
};
