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
  Square, Smartphone, Image as ImageIcon, Upload, Link2, Search, Wand2, Copy, ClipboardCheck, FileText, Key,
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
  { key: "bus", Icon: Bus, label: "Ônibus" },
  { key: "hotel", Icon: Hotel, label: "Hotel" },
  { key: "plane", Icon: Plane, label: "Avião" },
  { key: "ship", Icon: Ship, label: "Navio" },
  { key: "palm", Icon: Palmtree, label: "Coqueiro" },
  { key: "sun", Icon: Sun, label: "Sol" },
  { key: "food", Icon: Utensils, label: "Refeição" },
  { key: "coffee", Icon: Coffee, label: "Café" },
  { key: "map", Icon: MapPin, label: "Mapa" },
  { key: "camera", Icon: Camera, label: "Câmera" },
  { key: "star", Icon: Star, label: "Estrela" },
  { key: "heart", Icon: Heart, label: "Coração" },
  { key: "guide", Icon: User, label: "Guia" },
  { key: "wifi", Icon: Wifi, label: "Wi-Fi" },
];

interface Highlight { text: string; icon: IconKey; }

const DEFAULT_HIGHLIGHTS: Highlight[] = [
  { text: "Transporte incluso", icon: "bus" },
  { text: "Hospedagem", icon: "hotel" },
  { text: "Café da manhã", icon: "coffee" },
  { text: "Guia local", icon: "guide" },
];

const DEFAULT_EXPERIENCE_HIGHLIGHTS: Highlight[] = [
  { text: "EXPERIÊNCIA SENSORIAL", icon: "check" },
  { text: "MOMENTOS INESQUECÍVEIS", icon: "check" },
  { text: "CURADORIA PREMIUM", icon: "check" },
];

const DEFAULT_SUFFIXES_OFERTA = new Set(["por pessoa", "por casal", "por pacote", "por grupo", "total do pacote"]);
const DEFAULT_SUFFIX_EXPERIENCIA = "Sua viagem começa aqui";

// ====== Padronização de CORES por categoria ======
// Estas cores são aplicadas automaticamente ao trocar de categoria, garantindo
// um visual coerente com o "tom" daquela categoria (oferta = âmbar/quente,
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
  { id: "BRL", symbol: "R$", label: "Real (R$)", locale: "pt-BR" },
  { id: "USD", symbol: "US$", label: "Dólar (US$)", locale: "en-US" },
  { id: "EUR", symbol: "€", label: "Euro (€)", locale: "de-DE" },
  { id: "GBP", symbol: "£", label: "Libra (£)", locale: "en-GB" },
  { id: "ARS", symbol: "AR$", label: "Peso AR (AR$)", locale: "es-AR" },
];

/**
 * Formata um valor de preço aplicando separador de milhar e casa decimal
 * conforme a moeda selecionada. Aceita strings com vírgula ou ponto como decimal.
 * Ex: "4124312"  → BRL: "4.124.312,00"  USD: "4,124,312.00"
 *     "1499,90"  → BRL: "1.499,90"
 */
const formatPriceValue = (raw: string, currency: Currency, assumeCents = false, noCents = false): string => {
  const value = (raw || "").trim();
  if (!value) return "";
  
  // Limpa tudo exceto números e separadores existentes
  const cleaned = value.replace(/[^\d.,]/g, "");
  const digits = cleaned.replace(/\D/g, "");
  if (!digits) return "";

  let num = 0;
  
  // 🛡️ REGRA DE OURO: O cálculo do valor escalar numérico NÃO PODE depender de `noCents`.
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
  const sym = CURRENCY_PRESETS.find((c) => c.id === currency)?.symbol || "R$";
  return `${sym} ${formatted}`;
};

const stripCurrencyFromPrice = (raw: string, currency: Currency): string => {
  const sym = CURRENCY_PRESETS.find((c) => c.id === currency)?.symbol || "R$";
  return (raw || "").replace(sym, "").replace(/R\$|US\$|AR\$|€|£/g, "").trim();
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
  { id: "installments", name: "Parcelado",          emoji: "💳", description: "Ex: 10x R$ 149,90",       hint: "Parcelas: 10x · Valor: 149,90" },
  { id: "cash",         name: "À vista",            emoji: "💰", description: "Ex: À VISTA R$ 1.499",    hint: "Valor: 1.499" },
  { id: "down_plus",    name: "Entrada + parcelas", emoji: "💵", description: "Ex: ENTRADA + 10x R$ 149", hint: "Parcelas: ENTRADA R$ 200 + 10x · Valor: 149" },
];

const AD_TITLE_PRESETS: string[] = [
  "Conheça o melhor de {destino}",
  "Descubra {destino}",
  "Pacote {destino}",
  "Explore {destino}",
  "{destino} vai te surpreender",
  "Você precisa conhecer {destino}!",
  "O que fazer em {destino}",
  "O melhor de {destino}",
  "Meu sonho se chama {destino}",
  "Partiu {destino}",
  "Sua próxima viagem é {destino}",
  "Pacote Promocional {destino}",
  "Viagem Completa {destino}",
  "{destino} te espera",
  "Vamos para {destino}?",
];

// Presets de TÍTULO para a categoria "Experiência de Destino" (luxo / sensação)
const AD_TITLE_PRESETS_EXPERIENCIA: string[] = [
  "Sua próxima viagem é {destino}",
  "Viva o melhor de {destino}",
  "Momentos inesquecíveis em {destino}",
  "Desperte os sentidos em {destino}",
  "Experiência exclusiva em {destino}",
  "Prazer em cada detalhe · {destino}",
  "{destino} como você nunca viveu",
  "All Inclusive · {destino}",
  "Refúgio dos sonhos em {destino}",
  "Descubra o lado secreto de {destino}",
];

// Nomes "promo" sofisticados para Experiência de Destino
const PROMO_NAME_PRESETS_EXPERIENCIA: string[] = [
  "EXPERIÊNCIA EXCLUSIVA",
  "MOMENTOS INESQUECÍVEIS",
  "PRAZER EM CADA VIAGEM",
  "ALL INCLUSIVE",
  "VIVÊNCIA PREMIUM",
  "REFÚGIO DOS SONHOS",
];

const PROMO_NAME_PRESETS: string[] = [
  "OFERTA ESPECIAL",
  "SUPER OFERTA",
  "ÚLTIMAS VAGAS",
  "PROMOÇÃO DO DIA",
  "BLACK FRIDAY",
  "QUEIMA DE ESTOQUE"
];

// Defaults reconhecidos como "padrão da Oferta" — autorizados a serem sobrescritos
// quando o usuário troca de categoria sem ter customizado.
const DEFAULT_PROMO_NAMES_OFERTA = new Set(["OFERTA ESPECIAL", "Oferta Especial", "BLACK FRIDAY"]);
const DEFAULT_AD_TITLES_OFERTA = new Set(["Pacote {destino}", "Conheça o melhor de {destino}", "Descubra {destino}"]);
const DEFAULT_PROMO_NAMES_EXPERIENCIA = new Set(PROMO_NAME_PRESETS_EXPERIENCIA);
const DEFAULT_AD_TITLES_EXPERIENCIA = new Set(AD_TITLE_PRESETS_EXPERIENCIA);

const TRAVEL_PERIOD_PRESETS: string[] = [
  "5 dias", "7 dias", "10 dias", "15 dias", "Final de semana",
  "Janeiro", "Julho", "Dezembro", "Feriado prolongado", "12 a 18/01",
  "Data flexível", "Saídas semanais",
];

const TITLE_NEIGHBORS: Record<string, string[]> = {
  "Conheça o melhor de {destino}": ["Descubra {destino}", "Pacote {destino}"],
  "Descubra {destino}": ["Conheça o melhor de {destino}", "Explore {destino}"],
  "Pacote {destino}": ["Viagem Completa {destino}", "Pacote Promocional {destino}"],
  "Explore {destino}": ["Descubra {destino}", "{destino} vai te surpreender"],
  "Partiu {destino}": ["Vamos para {destino}?", "{destino} te espera"],
  "Vamos para {destino}?": ["Partiu {destino}", "{destino} te espera"],
  // Vizinhos de Experiência
  "Sua próxima viagem é {destino}": ["Viva o melhor de {destino}", "Momentos inesquecíveis em {destino}"],
  "Viva o melhor de {destino}": ["Sua próxima viagem é {destino}", "Experiência exclusiva em {destino}"],
  "Momentos inesquecíveis em {destino}": ["Desperte os sentidos em {destino}", "Prazer em cada detalhe · {destino}"],
  "Desperte os sentidos em {destino}": ["Momentos inesquecíveis em {destino}", "Refúgio dos sonhos em {destino}"],
  "Experiência exclusiva em {destino}": ["Viva o melhor de {destino}", "{destino} como você nunca viveu"],
  "Prazer em cada detalhe · {destino}": ["All Inclusive · {destino}", "Experiência exclusiva em {destino}"],
  "{destino} como você nunca viveu": ["Descubra o lado secreto de {destino}", "Viva o melhor de {destino}"],
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
// GERADOR DE LEGENDAS / COPY para Instagram
// Gera 3 variações de texto adaptadas aos dados do anúncio,
// sem chamadas à IA — 100% local, instantâneo.
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
  const dest = v.destination.trim() || "o destino";
  const destUp = dest.toUpperCase();
  const priceStr = v.price.trim();
  const hasPrice = !!priceStr && v.paymentMode !== "free_quote";
  const hasInstall = !!v.installments.trim() && v.paymentMode === "installments";
  const period = v.travelPeriod.trim();
  const agency = v.agencyName.trim() || "nossa agência";
  const ig = v.instagram.trim() ? `@${v.instagram.replace(/^@/, "").trim()}` : "";
  const wa = v.whatsapp.trim();
  const contactLine = wa
    ? `📲 Fale comigo agora: *${wa}* ${ig ? `| ${ig}` : ""}`
    : ig
    ? `📲 Nos siga: ${ig}`
    : "📲 Entre em contato para reservar!";

  // Benefícios: pega os 3 primeiros highlights como bullet points
  const benefitLines = v.highlights
    .slice(0, 4)
    .map((h) => `✅ ${h.text}`)
    .join("\n");

  const priceBlock = hasPrice
    ? hasInstall
      ? `💳 Apenas ${v.installments} de *${priceStr}* ${v.paymentSuffix}`
      : `💰 Por apenas *${priceStr}* ${v.paymentSuffix}`
    : "💬 Solicite seu orçamento personalizado!";

  const periodLine = period ? `🗓️ ${period}` : "";

  if (v.isExperience) {
    // Variante Experiência: estilo editorial/luxo
    const caps: string[] = [
      // Variação 1 — Cinematográfica
      `✨ ${destUp} vai te surpreender.\n\nExperiências como essa não se esquecem — e você merece vivê-las.\n\n${benefitLines}\n\n${periodLine ? periodLine + "\n" : ""}${contactLine}`,

      // Variação 2 — Direta com CTA
      `🌟 Já imaginou ${v.isExperience ? "viver" : "conhecer"} ${dest}?\n\n${benefitLines}\n\n${periodLine ? periodLine + "\n" : ""}Cada detalhe foi pensado para você. Vamos planejar juntos?\n\n${contactLine}`,

      // Variação 3 — Curiosidade/teaser
      `Tem destino que transforma. ${dest} é um deles. 🧳\n\n${benefitLines}\n\n${periodLine ? periodLine + "\n" : ""}💌 Reserve com a ${agency}. Parceria que entende o que você quer de uma viagem.\n\n${contactLine}`,
    ];
    return caps;
  }

  // Variante Oferta: direto e comercial
  const caps: string[] = [
    // Variação 1 — Urgência + preço em destaque
    `🚨 *${v.promoName || "OFERTA ESPECIAL"}* — ${destUp}!\n\n${benefitLines}\n\n${priceBlock}\n${periodLine ? periodLine + "\n" : ""}\n⚠️ Vagas limitadas! Não perca essa oportunidade.\n\n${contactLine}`,

    // Variação 2 — Storytelling + preço
    `Partiu ${dest}? ✈️\n\nMontamos um pacote COMPLETO pra você não se preocupar com nada:\n\n${benefitLines}\n\n${priceBlock}\n${periodLine ? periodLine + "\n" : ""}\n👉 Me chama agora e garanta sua vaga!\n\n${contactLine}`,

    // Variação 3 — Benefícios + prova social
    `📍 ${dest} — Um pacote que você vai amar!\n\nIncluso na sua viagem:\n${benefitLines}\n\n${priceBlock}\n${periodLine ? periodLine + "\n" : ""}\n✅ Agência especializada. Atendimento humanizado. Suporte 24h.\n\n${contactLine}`,
  ];
  return caps;
};

export const Phase3ArtFactory = ({ onNext, onBack }: Props) => {
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
  // Persiste destino no contexto/localStorage para sobreviver à navegação F1↔F3↔F4.
  const setDestination = (v: string) => {
    setDestinationState(v);
    const rest = (state.destinos || []).slice(1);
    update({ destinos: v.trim() ? [v, ...rest] : rest });
  };
  const [price, setPriceState] = useState(state.lastPrice || "149,90");
  const setPrice = (p: string) => { setPriceState(p); update({ lastPrice: p }); };
  const [currency, setCurrencyState] = useState<Currency>((state.lastCurrency as Currency) || "BRL");
  const setCurrency = (c: Currency) => { setCurrencyState(c); update({ lastCurrency: c }); };
  // V3: opções extras
  const [hideCents, setHideCentsState] = useState<boolean>(!!state.hideCents);
  const setHideCents = (v: boolean) => {
    setHideCentsState(v);
    update({ hideCents: v });
    // NUNCA sobrescreve o valor bruto 'price' no state, para não corromper a digitação original do usuário!
  };
  const [pricePrefix, setPricePrefixState] = useState<string>((state as any).pricePrefix ?? "a partir de");
  const setPricePrefix = (v: string) => { setPricePrefixState(v); update({ pricePrefix: v } as any); };
  const [showTotal, setShowTotalState] = useState<boolean>(state.showTotal !== false);
  const setShowTotal = (v: boolean) => { setShowTotalState(v); update({ showTotal: v }); };
  const [totalOverride, setTotalOverrideState] = useState<string>(state.totalOverride || "");
  const setTotalOverride = (v: string) => { setTotalOverrideState(v); update({ totalOverride: v }); };
  // V3: faixa azul do Pix (editável e ocultável)
  const [showPixBanner, setShowPixBannerState] = useState<boolean>((state as any).showPixBanner !== false);
  const setShowPixBanner = (v: boolean) => { setShowPixBannerState(v); update({ showPixBanner: v } as any); };
  const [pixBannerText, setPixBannerTextState] = useState<string>((state as any).pixBannerText || "");
  const setPixBannerText = (v: string) => { setPixBannerTextState(v); update({ pixBannerText: v } as any); };

  // Tipografia global (família + escala título/descrição + cor de override)
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

  // Preço formatado que será passado para o composer (ex: "R$ 1.499,90" ou "US$ 1,499.90")
  const formattedPriceForAd = formatPriceValue(stripCurrencyFromPrice(price, currency), currency, false, hideCents);
  const currencySymbol = CURRENCY_PRESETS.find((c) => c.id === currency)?.symbol || "R$";

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
        
        // Limpa chaves pesadas legadas para liberar espaço no localStorage antes de salvar a nova logo
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
        const next = "Pacote {destino}";
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
        update({ lastPaymentSuffix: "por pessoa" });
        return "por pessoa";
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
    : "Pacote {destino}";
  const [promoName, setPromoNameState] = useState(state.lastPromoName || initialPromoDefault);
  const setPromoName = (n: string) => { setPromoNameState(n); update({ lastPromoName: n }); };

  // Título do anúncio (com presets editáveis usando {destino})
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
  const adTitleVariations = buildTitleVariations(adTitleTemplate || "Pacote {destino}", destination);
  const SUFFIX_PRESETS = ["por pessoa", "por casal", "por pacote", "por grupo", "total do pacote"];
  const DESTINATION_SUGGESTIONS = Array.from(new Set([
    ...(state.destinos || []),
    "Maragogi", "Jericoacoara", "Fernando de Noronha", "Gramado", "Bonito",
    "Porto de Galinhas", "Búzios", "Cancún", "Punta Cana", "Paris",
    "Orlando", "Lisboa", "Santiago", "Bariloche", "Maldivas",
  ]));

  const [paymentMode, setPaymentModeState] = useState<PaymentMode>(state.lastPaymentMode || "installments");
  const setPaymentMode = (m: PaymentMode) => { setPaymentModeState(m); update({ lastPaymentMode: m }); };

  const [paymentLabelState, setPaymentLabelState] = useState(state.lastPaymentLabel || "");
  const setPaymentLabel = (label: string) => { setPaymentLabelState(label); update({ lastPaymentLabel: label }); };
  const [paymentSuffixState, setPaymentSuffixState] = useState(() => {
    const savedSuffix = state.lastPaymentSuffix || "por pessoa";
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
  const [forcedVariant, setForcedVariant] = useState<number | null>(null);
  // Legendas/Copy geradas automaticamente junto com as imagens
  const [adCaptions, setAdCaptions] = useState<string[]>([]);
  const [selectedCaption, setSelectedCaption] = useState<string | null>(null);
  const [captionCopied, setCaptionCopied] = useState(false);
  // Histórico das últimas variantes do compositor canvas (modo Sua Imagem) para forçar rotação
  const variantHistoryRef = useRef<number[]>([]);
  // Proteção anti-loop: limita fallbacks automáticos da IA Pura
  const retryCountRef = useRef<number>(0);
  // Versão forçada (null = automático/rotação). 0..4 fixa a variante exata para correções cirúrgicas.
  const [lastProvider, setLastProvider] = useState<"secure_gemini" | null>(() => {
    return (localStorage.getItem("fabrica_last_provider") as "secure_gemini") || "secure_gemini";
  });
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
      localStorage.setItem("fabrica_last_provider", "secure_gemini");
      setAiPureCount(0);
      setGenerationCount(0);
      setLastProvider("secure_gemini");
      toast.success("IA Pura segura no servidor ativada!");
    }
  }, []);

  useEffect(() => {
    const key = "fabrica-render-engine-version";
    if (localStorage.getItem(key) === FABRICA_RENDER_ENGINE_VERSION) return;
    // 🛡️ CACHE BUST: Limpa imagens geradas E o cache da logo antiga
    localStorage.removeItem("fabrica-heavy-v1:generatedAdImage");
    localStorage.removeItem("fabrica_last_template_id");
    localStorage.removeItem("fabrica_recent_template_ids");
    // Reseta o auto-sync da Fase 4 para que os novos dados sejam re-sincronizados
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

  // ====== Auto-contraste: detecta luminância média da imagem ativa e
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
        // tainted canvas → fallback seguro (branco com sombra cobre a maioria dos casos)
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
      // base64 vive APENAS em memória do browser → nunca toca o banco
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

  const compressImage = async (base64Str: string, maxWidth = 400): Promise<string> => {
    if (!base64Str.startsWith("data:image")) return base64Str;
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;
        if (width > maxWidth) {
          height = (maxWidth * height) / width;
          width = maxWidth;
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) return resolve(base64Str);
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/webp", 0.7));
      };
      img.onerror = () => resolve(base64Str);
      img.src = base64Str;
    });
  };

  // 🌐 Integração Inteligente de Pacotes com o Site F2 (Acumulativo)
  // Pega o último anúncio gerado e o insere no Site, preferencialmente usando a FOTO LIMPA
  // para o fundo do site, em vez da arte poluída com texto do Canva, conforme exigido pelo usuário.
  const syncGeneratedPackageToSite = async (finalComposedImg: string, sourceCleanImg?: string) => {
    if (!finalComposedImg || !destination.trim()) return;

    // A imagem que vai para o site é PREFERENCIALMENTE a foto limpa de fundo!
    const rawImageToUse = sourceCleanImg || finalComposedImg;
    const imageToUse = await compressImage(rawImageToUse);

    const currentPrice = formattedPriceForAd || price;
    const sym = CURRENCY_PRESETS.find((c) => c.id === currency)?.symbol || "R$";

    const priceLabel = (() => {
      const suffix = paymentSuffix || "por pessoa";
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
      const base = currentPackages.filter((p: any) => p.title !== "Novo pacote");
      updatedPackages = [newPkg, ...base];
    }

    // Garante APENAS a foto LIMPA (sem a arte poluída de texto do anúncio) no banco do site.
    // Se não há foto limpa (modo IA pura sem referência), não adiciona nada ao banco de fotos.
    const currentGallery = state.siteContent.galleryImages || [];
    let updatedGallery = [...currentGallery];
    if (sourceCleanImg) {
       const compressedClean = await compressImage(sourceCleanImg);
       if (!updatedGallery.includes(compressedClean)) {
         updatedGallery = [compressedClean, ...updatedGallery];
       }
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
    if (loading && genMode === "ai") return;
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
        toast.error(customSource === "upload" ? "Carregue uma imagem do seu dispositivo" : "Cole o link da imagem");
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

      const buildComposeOptions = (
        imgUrl: string,
        localStrategy: string,
        varSeed: number,
        forceVar?: number,
        paletteOverride?: { primary: string; secondary: string }
      ): any => {
        const pal = paletteOverride || selectedPalette(primaryColor, secondaryColor);
        return {
          imageUrl: imgUrl,
          format,
          destination,
          city: state.city,
          primaryColor: pal.primary,
          secondaryColor: pal.secondary,
          price: formattedPriceForAd || price,
          currencySymbol,
          hideCents,
          installments,
          promoName,
          highlights,
          hasLogo: !!state.logoBase64,
          logoDataUrl: state.logoBase64,
          logoFormat: state.logoFormat,
          footerContact1Icon: state.footerContact1Icon,
          footerContact1Value: state.footerContact1Value,
          footerContact2Icon: state.footerContact2Icon,
          footerContact2Value: state.footerContact2Value,
          whatsapp: state.whatsapp,
          instagram: state.instagram,
          paymentMode,
          paymentLabel: paymentLabel || undefined,
          paymentSuffix,
          pricePrefix: pricePrefix || undefined,
          strategy: localStrategy,
          variation: varSeed,
          forceVariant: forceVar,
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
        };
      };

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
        const TOTAL_VARIANTS_PHOTO = 6;
        const recentPhoto = variantHistoryRef.current.slice(-2);
        let candidatesPhoto = Array.from({ length: TOTAL_VARIANTS_PHOTO }, (_, i) => i).filter((v) => !recentPhoto.includes(v));
        if (candidatesPhoto.length === 0) {
          candidatesPhoto = Array.from({ length: TOTAL_VARIANTS_PHOTO }, (_, i) => i);
        }
        const nextVariantPhoto = forcedVariant !== null ? forcedVariant : candidatesPhoto[Math.floor(Math.random() * candidatesPhoto.length)];
        variantHistoryRef.current = [...variantHistoryRef.current.slice(-3), nextVariantPhoto];

        const composed = await Promise.all(
          chosen.map(async (localStrategy, idx) => {
            let img = await composeTravelAd(
              buildComposeOptions(
                photoRefs[idx],
                localStrategy,
                freshSeedPhoto + idx,
                typeof nextVariantPhoto === "number" ? (nextVariantPhoto + idx) % 6 : undefined,
                palette
              )
            );
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
        await syncGeneratedPackageToSite(composed[composed.length - 1], refImage);

        const newCount = generationCount + composed.length;
        setGenerationCount(newCount);
        localStorage.setItem("fabrica_gen_count", String(newCount));
        finishCycle(composed.length);
        // 🛡️ CRÍTICO: Limpa forcedVariant para que V0-V4 voltem a rotacionar
        // Sem isso, o fallback de erro da IA Pura trava TODAS as gerações em Variant 0
        if (forcedVariant !== null) setForcedVariant(null);
        retryCountRef.current = 0;

        toast.success(`${composed.length} ${composed.length === 1 ? "variação gerada" : "variações geradas"} com foto real!`);
        requestAnimationFrame(() => resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
        return;
      }

      // ===== MODO IA PURA: MOTOR DE LAYOUT DINÂMICO (via Lovable AI Gateway) =====
      if (genMode === "ai") {
        const refImage = selectedPhotoUrl;
        if (!refImage) {
          toast.error("Selecione uma Foto Real na galeria para a IA desenhar por cima.");
          setLoading(false);
          return;
        }

        // 🛡️ FALHA #4 FIX — Gate real de limite diário ANTES de chamar a API
        const AI_PURE_DAILY_LIMIT = 9999;
        const currentCount = getAiPureDailyCount();
        if (currentCount >= AI_PURE_DAILY_LIMIT) {
          toast.error(`Limite diário de ${AI_PURE_DAILY_LIMIT} gerações IA Pura atingido. Reinicia amanhã.`);
          setLoading(false);
          return;
        }

        // 🛡️ FALHA #9 FIX — Pré-carrega Playfair Display antes do canvas para evitar fallback em Times New Roman
        if (document.fonts?.load) {
          try {
            await Promise.race([
              document.fonts.load('900 64px "Playfair Display"'),
              new Promise((_, reject) => setTimeout(() => reject(), 2000))
            ]);
          } catch { /* fonte não disponível, usa Inter como fallback — aceitável */ }
        }

        toast.info("Iniciando IA Designer v3...");

        const highlightTexts: string[] = (highlights || []).map((h: any) =>
          typeof h === "string" ? h : (h?.text || "")
        ).filter(Boolean);

        const numToGen = isBatchMode ? 3 : 1;
        const picks = Array.from({ length: numToGen }, (_, idx) => idx);

        try {
          // 🛡️ Promise.allSettled: 1 falha NÃO derruba as outras 2 variações
          const settled = await Promise.allSettled(
            picks.map(async (idx) => {
              const { data: aiData, error: aiError } = await supabase.functions.invoke("fabrica-design-ai", {
                body: {
                  format,
                  destination: destination || "Destino",
                  price: formattedPriceForAd || price,
                  duration: travelPeriod || "5 NOITES",
                  highlights: highlightTexts,
                  promoName: promoName || "OFERTA ESPECIAL",
                  currencySymbol,
                  primaryColor,
                  secondaryColor,
                  variation: idx + 1,
                  timestamp: Date.now() + idx
                },
              });

              if (aiError) throw new Error(aiError.message || "Falha na IA");
              if ((aiData as any)?.error) throw new Error((aiData as any).error);
              const layoutJson = (aiData as any)?.layout;
              if (!layoutJson || (!layoutJson.style && !layoutJson.elements)) {
                throw new Error("Layout inválido retornado pela IA.");
              }
              return layoutJson;
            })
          );

          const results = settled
            .filter((r): r is PromiseFulfilledResult<any> => r.status === "fulfilled")
            .map(r => r.value);
          const failedCount = settled.filter(r => r.status === "rejected").length;
          if (failedCount > 0) toast.warning(`${failedCount} variação(ões) falharam, renderizando as restantes...`);
          if (results.length === 0) throw new Error("Todas as variações de IA falharam. Tente novamente.");

          const { renderIAPuraLayout, reframeImageToAspect } = await import("@/lib/fabrica-compose-art");

          const isStory = format === "story";
          const reframedBg = await reframeImageToAspect(refImage, format);

          // 🛡️ Renderização SEQUENCIAL para evitar OOM em mobile (3 canvases 1080×1920 simultâneos = ~25MB)
          const finalImages: string[] = [];
          for (const layoutJson of results) {
              const canvas = document.createElement("canvas");
              canvas.width = 1080;
              canvas.height = isStory ? 1920 : 1080;
              const ctx = canvas.getContext("2d");
              if (!ctx) throw new Error("Falha ao inicializar Canvas");

              await renderIAPuraLayout(ctx, {
                format,
                destination: destination || "Destino",
                price: formattedPriceForAd || price,
                travelPeriod: travelPeriod || "5 NOITES",
                highlights: (highlights || []) as any,
                promoName: promoName || "OFERTA ESPECIAL",
                primaryColor,
                secondaryColor,
                currencySymbol,
                paymentMode,
                installments,
                paymentSuffix,
                logoDataUrl: state.logoBase64,
                logoFormat: state.logoFormat,
                footerContact1Icon: state.footerContact1Icon,
                footerContact1Value: state.footerContact1Value,
                footerContact2Icon: state.footerContact2Icon,
                footerContact2Value: state.footerContact2Value,
                fontFamily,
                titleScale,
                descScale,
                textColorOverride,
                imageUrl: reframedBg,
              } as any, layoutJson as any);

              finalImages.push(canvas.toDataURL("image/png", 0.9));
          }

          setGeneratedImages((prev) => {
            const merged = isBatchMode ? finalImages : [...prev, ...finalImages].slice(-3);
            return merged;
          });
          setGeneratedImage(finalImages[finalImages.length - 1]);

          const currentGenerated = state.allGeneratedAdImages || [];
          const updatedGenerated = [...finalImages.slice().reverse(), ...currentGenerated].slice(0, 10);
          update({
            generatedAdImage: finalImages[finalImages.length - 1],
            allGeneratedAdImages: updatedGenerated
          });

          // 🛡️ FALHA #10 FIX — Sincroniza a PRIMEIRA imagem do lote (mais estável) em vez da última
          await syncGeneratedPackageToSite(finalImages[0], refImage);

          toast.success(`${finalImages.length} ${finalImages.length === 1 ? "Design Dinâmico gerado" : "Designs Dinâmicos gerados"} com sucesso pela IA!`);

          const nextAiPureCount = incrementAiPureDailyCount(finalImages.length);
          setAiPureCount(nextAiPureCount);

          const newCount = generationCount + finalImages.length;
          setGenerationCount(newCount);
          localStorage.setItem("fabrica_gen_count", String(newCount));
          finishCycle(finalImages.length);
          retryCountRef.current = 0;

          requestAnimationFrame(() => resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
        } catch (error: any) {
          console.error("ERRO_IA_PURA_CATCH:", error);
          toast.error("Erro ao gerar design da IA: " + (error?.message || "desconhecido"));

          // 🛡️ Anti-loop: só tenta fallback UMA vez. Sem isso, erros consecutivos entram em loop infinito.
          if (retryCountRef.current < 1 && selectedPhotoUrl) {
            retryCountRef.current += 1;
            toast.info("Carregando layout de segurança...");
            // NÃO muda genMode — mantém em 'ai' para o usuário saber onde está
            // NÃO força variant 0 — deixa a rotação normal acontecer
            setGenMode("photo");
            setTimeout(() => {
              generate();
              // Restaura modo IA após o fallback para não confundir o usuário
              setTimeout(() => setGenMode("ai"), 200);
            }, 500);
          } else {
            retryCountRef.current = 0;
            toast.error("Falha persistente na IA. Verifique sua conexão ou tente com outra foto.");
          }
        }

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
      const TOTAL_VARIANTS = 6;
      const recent = variantHistoryRef.current.slice(-2);
      let candidates = Array.from({ length: TOTAL_VARIANTS }, (_, i) => i).filter((v) => !recent.includes(v));
      if (candidates.length === 0) {
        candidates = Array.from({ length: TOTAL_VARIANTS }, (_, i) => i);
      }
      const nextVariant = forcedVariant !== null ? forcedVariant : candidates[Math.floor(Math.random() * candidates.length)];
      variantHistoryRef.current = [...variantHistoryRef.current.slice(-3), nextVariant];

      const imagesCustom = await Promise.all(
        chosen.map(async (localStrategy, idx) => {
          let img = await composeTravelAd(
            buildComposeOptions(
              refImage,
              localStrategy,
              freshSeedCustom + idx,
              typeof nextVariant === "number" ? (nextVariant + idx) % 6 : undefined,
              palette
            )
          );
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
      await syncGeneratedPackageToSite(imagesCustom[imagesCustom.length - 1], refImage);

      const newCount = generationCount + imagesCustom.length;
      setGenerationCount(newCount);
      localStorage.setItem("fabrica_gen_count", String(newCount));
      finishCycle(imagesCustom.length);

      toast.success(`${imagesCustom.length} ${imagesCustom.length === 1 ? "variação gerada" : "variações geradas"} com sua imagem!`);

    } catch (err: any) {
      console.error("generate error", err);
      // 🛡️ FALHA #8 FIX — Mensagem específica para erros de CORS em links externos
      const rawMsg = err?.message || "Erro ao gerar anúncio";
      const isCorsError = rawMsg.toLowerCase().includes("tainted") || rawMsg.toLowerCase().includes("cors") || rawMsg.toLowerCase().includes("security") || rawMsg.toLowerCase().includes("cross-origin");
      const message = isCorsError
        ? "Link externo bloqueado por segurança (CORS). Use o upload de arquivo no seu dispositivo."
        : rawMsg;
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

  // Gera as legendas de copy sempre que as imagens ou os dados do anúncio mudarem
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
      
      toast.success(isBatchMode ? "Todas as imagens baixadas!" : "Imagem baixada!");
    } catch { toast.error("Erro ao baixar imagem"); }
  };

  const sectionCls = "bg-[#0F0F11]/80 border border-white/10 rounded-3xl p-6 backdrop-blur-2xl shadow-2xl shadow-black/50 space-y-4 transition-all";
  const labelCls = "text-[10px] font-extrabold text-white/50 uppercase tracking-[0.15em] block mb-1.5";
  const inputCls = "w-full bg-white/[0.03] border border-white/10 hover:border-white/20 hover:bg-white/[0.05] focus:border-amber-400/60 focus:bg-white/[0.05] focus:shadow-[0_0_15px_rgba(251,191,36,0.15)] rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none transition-all duration-300";

  return (
    <div className="max-w-3xl mx-auto space-y-6">

      {/* Grid de Perfil e Contatos */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 bg-white/[0.02] border border-white/[0.08] p-6 rounded-2xl">
          {/* Coluna Logo: mais estreita e profissional */}
          <div className="sm:col-span-4">
            <label className="text-[10px] font-bold text-white/30 uppercase tracking-[0.15em] mb-2.5 block">Identidade Visual</label>
            {!state.logoBase64 ? (
              <label className="flex flex-col items-center justify-center gap-2.5 p-6 bg-white/[0.02] border-2 border-dashed border-white/10 rounded-2xl cursor-pointer hover:border-white/20 hover:bg-white/[0.04] transition-all group h-[110px]">
                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Upload className="w-5 h-5 text-white/40 group-hover:text-white/70" />
                </div>
                <span className="text-[10px] font-bold text-white/40 uppercase tracking-tighter group-hover:text-white/60">Subir Logo</span>
                <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
              </label>
            ) : (
              <div className="flex flex-col gap-2">
                <div className="relative group rounded-2xl overflow-hidden bg-white/[0.03] p-3 border border-white/10 h-[76px] flex items-center justify-center">
                  <img src={state.logoBase64} alt="Logo" className="max-w-full max-h-full object-contain" />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-2 cursor-pointer transition-all backdrop-blur-sm">
                    <label className="p-2 bg-white/10 hover:bg-white/20 rounded-full cursor-pointer transition-colors" title="Trocar Logo">
                      <RotateCcw className="w-4 h-4 text-white" />
                      <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                    </label>
                    <button
                      type="button"
                      onClick={() => { update({ logoBase64: "" }); toast.success("Logo removida"); }}
                      className="p-2 bg-red-500/20 hover:bg-red-500/40 rounded-full transition-colors"
                      title="Remover"
                    >
                      <X className="w-4 h-4 text-white" />
                    </button>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 h-[26px]">
                  <button 
                    type="button"
                    onClick={() => update({ logoFormat: "circle" })}
                    className={`flex-1 h-full text-[9px] font-bold uppercase tracking-wider rounded-lg border transition-all ${state.logoFormat !== "square" ? "bg-white/10 border-white/20 text-white" : "bg-transparent border-white/5 text-white/40 hover:bg-white/5"}`}
                  >
                    Redonda
                  </button>
                  <button 
                    type="button"
                    onClick={() => update({ logoFormat: "square" })}
                    className={`flex-1 h-full text-[9px] font-bold uppercase tracking-wider rounded-lg border transition-all ${state.logoFormat === "square" ? "bg-white/10 border-white/20 text-white" : "bg-transparent border-white/5 text-white/40 hover:bg-white/5"}`}
                  >
                    Quadrada
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Coluna Contatos: mais larga e organizada */}
          <div className="sm:col-span-8 space-y-3">
            <label className="text-[10px] font-bold text-white/30 uppercase tracking-[0.15em] mb-2.5 block">Canais de Atendimento</label>
            
            {/* Contato 1 */}
            <div className="flex items-center gap-2 bg-white/[0.02] p-1 rounded-xl border border-white/5 focus-within:border-white/20 transition-colors">
              <div className="w-[45%] relative">
                <select
                  value={state.footerContact1Icon || "whatsapp_green"}
                  onChange={(e) => update({ footerContact1Icon: e.target.value as any })}
                  className="w-full bg-white/5 border-none rounded-lg pl-3 pr-8 py-2 text-[11px] font-medium text-white outline-none appearance-none cursor-pointer"
                >
                  <option value="whatsapp_green" className="bg-zinc-900">WhatsApp Oficial</option>
                  <option value="whatsapp_custom" className="bg-zinc-900">WhatsApp Sólido</option>
                  <option value="instagram_gradient" className="bg-zinc-900">Instagram Color</option>
                  <option value="instagram_custom" className="bg-zinc-900">Instagram Sólido</option>
                  <option value="website" className="bg-zinc-900">Website / Link</option>
                  <option value="none" className="bg-zinc-900">Ocultar</option>
                </select>
                <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none opacity-30">
                  <ChevronDown className="w-3.5 h-3.5 text-white" />
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
                  placeholder={state.footerContact1Icon?.startsWith("whatsapp") ? "(00) 9 0000-0000" : "Link ou Telefone"}
                  className="w-full bg-transparent border-none px-3 py-2 text-[11px] text-white outline-none placeholder:text-white/10"
                />
              </div>
            </div>

            {/* Contato 2 */}
            <div className="flex items-center gap-2 bg-white/[0.02] p-1 rounded-xl border border-white/5 focus-within:border-white/20 transition-colors">
              <div className="w-[45%] relative">
                <select
                  value={state.footerContact2Icon || "instagram_gradient"}
                  onChange={(e) => update({ footerContact2Icon: e.target.value as any })}
                  className="w-full bg-white/5 border-none rounded-lg pl-3 pr-8 py-2 text-[11px] font-medium text-white outline-none appearance-none cursor-pointer"
                >
                  <option value="whatsapp_green" className="bg-zinc-900">WhatsApp Oficial</option>
                  <option value="whatsapp_custom" className="bg-zinc-900">WhatsApp Sólido</option>
                  <option value="instagram_gradient" className="bg-zinc-900">Instagram Color</option>
                  <option value="instagram_custom" className="bg-zinc-900">Instagram Sólido</option>
                  <option value="website" className="bg-zinc-900">Website / Link</option>
                  <option value="none" className="bg-zinc-900">Ocultar</option>
                </select>
                <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none opacity-30">
                  <ChevronDown className="w-3.5 h-3.5 text-white" />
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
                  placeholder={state.footerContact2Icon?.startsWith("instagram") ? "@usuario" : "Perfil ou Link"}
                  className="w-full bg-transparent border-none px-3 py-2 text-[11px] text-white outline-none placeholder:text-white/10"
                />
              </div>
            </div>
          </div>
        </div>
      {/* 0 e 1 · Modo e Categoria */}
      <div className={`${sectionCls} space-y-5`}>
        {/* Modo de Geração - Segmented Control */}
        <div>
          <h3 className="text-xs font-bold text-white/60 uppercase tracking-widest mb-2">0 · Modo de Criação</h3>
          <div className="flex bg-black/40 p-1 rounded-xl border border-white/5 w-full">
            <button
              onClick={() => setGenMode("photo")}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-[11px] font-bold transition-all disabled:opacity-30 ${genMode === "photo" ? "bg-white/10 text-white shadow-sm" : "text-white/50 hover:text-white"}`}
            >
              <ImageIcon className="w-3.5 h-3.5" /> Foto Real <span className="hidden sm:inline font-normal opacity-50">(ilimitada)</span>
            </button>
            <button
              onClick={() => setGenMode("custom")}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-[11px] font-bold transition-all disabled:opacity-30 ${genMode === "custom" ? "bg-white/10 text-white shadow-sm" : "text-white/50 hover:text-white"}`}
            >
              <Upload className="w-3.5 h-3.5" /> Sua Imagem
            </button>
            <button
              type="button"
              disabled
              title="Em manutenção — reativaremos em breve"
              aria-disabled="true"
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-[11px] font-bold text-white/30 cursor-not-allowed opacity-50"
            >
              <Wand2 className="w-3.5 h-3.5" /> IA Pura <span className="hidden sm:inline font-normal opacity-70">(desativado)</span>
            </button>
          </div>

          {/* Modo IA Pura — desativado em manutenção */}
          {genMode === "ai" && (
            <div className="mt-3 p-3 rounded-xl border border-amber-400/20 bg-amber-500/5">
              <p className="text-[11px] text-amber-200/90 leading-relaxed">
                ✨ <strong>IA Pura em manutenção.</strong> Este recurso está temporariamente indisponível. Por favor, utilize o modo "Foto Real" ou "Sua Imagem".
              </p>
            </div>
          )}




          {/* Seletor de Versão (V0..V4) — para correções cirúrgicas em cada layout */}
          <div className="mt-4">
            <h3 className="text-xs font-bold text-white/60 uppercase tracking-widest mb-2">
              0b · Versão do Layout
            </h3>
            <div className="flex bg-black/40 p-1 rounded-xl border border-white/5 w-full gap-1">
              <button
                onClick={() => setForcedVariant(null)}
                className={`flex-1 py-2 rounded-lg text-[11px] font-bold transition-all ${forcedVariant === null ? "bg-white/10 text-white shadow-sm" : "text-white/50 hover:text-white"}`}
                title="Rotação automática (sorteia entre V0..V4)"
              >
                Auto
              </button>
              {[0, 1, 2, 3, 4, 5].map((v) => (
                <button
                  key={v}
                  onClick={() => setForcedVariant(v)}
                  className={`flex-1 py-2 rounded-lg text-[11px] font-bold transition-all ${forcedVariant === v ? "bg-white/10 text-white shadow-sm" : "text-white/50 hover:text-white"}`}
                  title={`Forçar variação V${v}`}
                >
                  V{v}
                </button>
              ))}
            </div>
            <p className="text-[10px] text-white/40 mt-1.5 leading-snug">
              {forcedVariant === null
                ? "Rotação automática entre V0..V5 a cada clique."
                : <>Gerando sempre a <strong className="text-white">V{forcedVariant}</strong>. Selecione "Auto" para retomar a rotação.</>}
            </p>
          </div>
        </div>

        {/* Categoria - Compacta */}
        <div>
          <h3 className="text-xs font-bold text-white/60 uppercase tracking-widest mb-2">1 · Tipo de Anúncio</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {CATEGORIAS.map((c) => {
              const isExperiencia = c.id === "experiencia_destino";
              const selected = categoria === c.id;
              return (
                <button
                  key={c.id}
                  disabled={isExperiencia}
                  onClick={() => {
                    if (!isExperiencia) setCategoria(c.id);
                  }}
                  className={`p-3 rounded-xl border-2 text-left transition-all flex flex-col justify-between min-h-[85px] ${
                    isExperiencia
                      ? "border-white/5 bg-black/10 opacity-35 cursor-not-allowed pointer-events-none"
                      : selected
                      ? "shadow-lg scale-[1.02]"
                      : "border-white/5 bg-black/20 hover:bg-white/[0.04]"
                  }`}
                  style={selected && !isExperiencia ? { borderColor: c.accent, background: `${c.accent}33` } : undefined}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xl leading-none">{c.emoji}</span>
                    <span
                      className="text-[9px] font-extrabold px-1.5 py-0.5 rounded border tracking-wider"
                      style={{ background: `${c.accent}26`, borderColor: `${c.accent}66`, color: c.accent }}
                    >
                      {c.badge}
                    </span>
                    {isExperiencia && (
                      <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded border tracking-wider bg-amber-500/20 border-amber-500/40 text-amber-400 animate-pulse">
                        EM BREVE
                      </span>
                    )}
                  </div>
                  <div className="text-sm font-bold text-white leading-tight">{c.name}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Formato do Anúncio */}
        <div>
          <h3 className="text-xs font-bold text-white/60 uppercase tracking-widest mb-2">2 · Formato do Anúncio</h3>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setFormat("square")}
              className={`p-4 rounded-xl border-2 text-left transition-all ${
                format === "square" ? "" : "border-white/[0.08] bg-white/[0.02] hover:border-white/15"
              }`}
              style={format === "square" ? { borderColor: primaryColor, background: `${primaryColor}1a` } : undefined}
            >
              <Square className="w-6 h-6 mb-2 text-white/80" />
              <div className="text-sm font-bold text-white">Quadrado 1:1</div>
              <div className="text-[11px] text-white/55">Feed Instagram (1080×1080)</div>
            </button>
            <button
              onClick={() => setFormat("story")}
              className={`p-4 rounded-xl border-2 text-left transition-all ${
                format === "story" ? "" : "border-white/[0.08] bg-white/[0.02] hover:border-white/15"
              }`}
              style={format === "story" ? { borderColor: primaryColor, background: `${primaryColor}1a` } : undefined}
            >
              <Smartphone className="w-6 h-6 mb-2 text-white/80" />
              <div className="text-sm font-bold text-white">Stories / Reels 9:16</div>
              <div className="text-[11px] text-white/55">Vertical com safe zones (1080×1920)</div>
            </button>
          </div>
        </div>
      </div>

      {/* 1b · Galeria Pexels (modo foto ou IA Pura) */}
      {(genMode === "photo" || genMode === "ai") && (
        <div className={sectionCls}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-bold text-white/60 uppercase tracking-widest">1 · Escolha uma foto real</h3>
            <span className="text-[9px] font-bold uppercase tracking-wider text-white/30 bg-white/5 px-2 py-1 rounded-md border border-white/10">Pexels (Top)</span>
          </div>

          <>
              {/* Sugestões de destinos populares + os destinos da agência */}
              <div className="flex flex-wrap gap-1.5 mb-3">
                {[...new Set([...(state.destinos || []), ...POPULAR_PHOTO_DESTINATIONS])].slice(0, 14).map((d) => (
                  <button
                    key={d}
                    onClick={() => { setDestination(d); searchPhotos(d); }}
                    className={`px-2.5 py-1 rounded-full text-[11px] border transition-colors ${
                      photoQuery === d ? "text-black" : "bg-white/[0.05] border-white/10 text-white/70 hover:border-white/30"
                    }`}
                    style={photoQuery === d ? { background: secondaryColor, borderColor: secondaryColor } : undefined}
                  >
                    {d}
                  </button>
                ))}
              </div>

              <div className="flex gap-2 mb-3">
                <input
                  value={photoQuery}
                  onChange={(e) => setPhotoQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && searchPhotos()}
                  onFocus={(e) => e.target.select()}
                  placeholder={destination ? `Buscar "${destination}"...` : "Ex: Maragogi, Paris, Cancún..."}
                  className={inputCls}
                />
                <button
                  onClick={() => searchPhotos()}
                  disabled={searchingPhotos}
                  className="px-4 rounded-xl font-bold text-black flex items-center gap-1.5 text-sm disabled:opacity-40 hover:brightness-110"
                  style={{ background: secondaryColor }}
                >
                  {searchingPhotos ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                  Buscar
                </button>
              </div>
              {photos.length > 0 ? (() => {
                const visible = photos.slice(0, visiblePhotoCount);
                const hasMore = visiblePhotoCount < photos.length;
                return (
                  <>
                    <div className="grid grid-cols-3 gap-2">
                      {visible.map((p) => (
                        <button
                          key={p.id}
                          onClick={() => setSelectedPhotoUrl(p.url)}
                          className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                            selectedPhotoUrl === p.url ? "scale-95" : "border-white/10 hover:border-white/30"
                          }`}
                          style={selectedPhotoUrl === p.url ? { borderColor: secondaryColor, borderWidth: 3 } : undefined}
                        >
                          <img src={p.thumb} alt={p.alt} className="w-full h-full object-cover" />
                          {selectedPhotoUrl === p.url && (
                            <div className="absolute inset-0 flex items-center justify-center" style={{ background: `${primaryColor}cc` }}>
                              <Check className="w-8 h-8 text-white" />
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                    {hasMore && (
                      <button
                        onClick={() => setVisiblePhotoCount((n) => n + 3)}
                        className="w-full mt-3 py-2.5 rounded-xl border border-white/10 text-white/60 text-sm font-semibold hover:bg-white/[0.06] transition-all flex items-center justify-center gap-2"
                      >
                        <Plus className="w-4 h-4" />
                        Ver mais fotos ({photos.length - visiblePhotoCount} restantes)
                      </button>
                    )}
                  </>
                );
              })() : (
                <div className="py-8 text-center text-[11px] text-white/40">
                  {searchingPhotos ? "Buscando inspirações..." : ""}
                </div>
              )}
            </>
          </div>
        )}

      {/* 1c · Sua imagem (modo custom) */}
      {genMode === "custom" && (
        <div className={sectionCls}>
          <h3 className="text-xs font-bold text-white/60 uppercase tracking-widest mb-4">1 · Sua imagem de referência</h3>
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setCustomSource("upload")}
              className={`flex-1 py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                customSource === "upload" ? "text-black" : "bg-white/[0.04] text-white/60 hover:bg-white/[0.08]"
              }`}
              style={customSource === "upload" ? { background: secondaryColor } : undefined}
            >
              <Upload className="w-4 h-4" /> Upload
            </button>
            <button
              onClick={() => setCustomSource("link")}
              className={`flex-1 py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                customSource === "link" ? "text-black" : "bg-white/[0.04] text-white/60 hover:bg-white/[0.08]"
              }`}
              style={customSource === "link" ? { background: secondaryColor } : undefined}
            >
              <Link2 className="w-4 h-4" /> Link
            </button>
          </div>

          {customSource === "upload" && (
            <div>
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full border-2 border-dashed border-white/20 rounded-xl p-8 text-center hover:border-white/40 transition-colors"
              >
                {customImageData ? (
                  <>
                    <img src={customImageData} alt="preview" className="w-32 h-32 mx-auto rounded-lg object-cover mb-2" />
                    <p className="text-xs text-emerald-400 font-semibold">✓ Imagem carregada — clique para trocar</p>
                  </>
                ) : (
                  <>
                    <Upload className="w-8 h-8 mx-auto text-white/40 mb-2" />
                    <p className="text-sm text-white font-semibold">Clique para enviar</p>
                    <p className="text-[10px] text-white/40 mt-1">JPG, PNG ou WebP — máx 8MB</p>
                  </>
                )}
              </button>
            </div>
          )}

          {customSource === "link" && (
            <div>
              <input
                value={customLink}
                onChange={(e) => setCustomLink(e.target.value)}
                onFocus={(e) => setTimeout(() => e.target.select(), 50)}
                placeholder="https://exemplo.com/foto.jpg"
                className={inputCls}
              />
              <p className="text-[10px] text-white/40 mt-2">A IA vai adaptar a imagem ao formato escolhido.</p>
            </div>
          )}
        </div>
      )}

      {/* 3 · Dados */}
      <div className={`${sectionCls} space-y-4`}>
        <h3 className="text-xs font-bold text-white/60 uppercase tracking-widest">3 · Dados do anúncio</h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Destino *</label>
            <div className="relative">
              <input
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                onFocus={(e) => { setTimeout(() => e.target.select(), 50); setDestMenuOpen(true); }}
                onClick={() => setDestMenuOpen(true)}
                placeholder="Clique para escolher ou digite..."
                className={`${inputCls} pr-10 cursor-pointer`}
              />
              <ChevronDown className={`absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 pointer-events-none transition-transform ${destMenuOpen ? "rotate-180" : ""}`} />
              {destMenuOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setDestMenuOpen(false)} />
                  <div className="absolute left-0 right-0 mt-2 max-h-72 overflow-y-auto bg-neutral-900 border-2 rounded-xl shadow-2xl z-50 py-1" style={{ borderColor: `${secondaryColor}66` }}>
                    {DESTINATION_SUGGESTIONS.map((d) => {
                      const active = destination === d;
                      return (
                        <button
                          key={d}
                          type="button"
                          onClick={() => { setDestination(d); setDestMenuOpen(false); }}
                          className={`w-full text-left px-3 py-2 text-sm hover:bg-white/[0.08] transition-colors flex items-center gap-2 ${active ? "bg-white/[0.06] text-white font-semibold" : "text-white/80"}`}
                        >
                          {active && <Check className="w-3.5 h-3.5 flex-shrink-0" style={{ color: secondaryColor }} />}
                          <span className={active ? "" : "ml-5"}>{d}</span>
                        </button>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          </div>

          <div>
            <label className={labelCls}>
              {categoria === "experiencia_destino" ? "Nome da experiência" : "Nome da promoção"}
            </label>
            <div className="relative">
              <input
                value={promoName}
                onChange={(e) => setPromoName(e.target.value)}
                onFocus={(e) => { setTimeout(() => e.target.select(), 50); setPromoMenuOpen(true); }}
                onClick={() => setPromoMenuOpen(true)}
                className={`${inputCls} pr-10 cursor-pointer`}
              />
              <ChevronDown className={`absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 pointer-events-none transition-transform ${promoMenuOpen ? "rotate-180" : ""}`} />
              {promoMenuOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setPromoMenuOpen(false)} />
                  <div className="absolute left-0 right-0 mt-2 max-h-72 overflow-y-auto bg-neutral-900 border-2 rounded-xl shadow-2xl z-50 py-1" style={{ borderColor: `${secondaryColor}66` }}>
                    {(categoria === "experiencia_destino" ? PROMO_NAME_PRESETS_EXPERIENCIA : PROMO_NAME_PRESETS).map((p) => {
                      const active = promoName === p;
                      return (
                        <button
                          key={p}
                          type="button"
                          onClick={() => { setPromoName(p); setPromoMenuOpen(false); }}
                          className={`w-full text-left px-3 py-2 text-sm hover:bg-white/[0.08] transition-colors flex items-center gap-2 ${active ? "bg-white/[0.06] text-white font-semibold" : "text-white/80"}`}
                        >
                          {active && <Check className="w-3.5 h-3.5 flex-shrink-0" style={{ color: secondaryColor }} />}
                          <span className={active ? "" : "ml-5"}>{p}</span>
                        </button>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="sm:col-span-2">
            <label className={labelCls}>Título do anúncio</label>
            <div className="relative">
              <input
                value={adTitleTemplate}
                onChange={(e) => setAdTitleTemplate(e.target.value)}
                onFocus={(e) => { setTimeout(() => e.target.select(), 50); setAdTitleMenuOpen(true); }}
                onClick={() => setAdTitleMenuOpen(true)}
                placeholder="Ex: Pacote {destino}"
                className={`${inputCls} pr-10 cursor-pointer`}
              />
              <ChevronDown className={`absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 pointer-events-none transition-transform ${adTitleMenuOpen ? "rotate-180" : ""}`} />
              {adTitleMenuOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setAdTitleMenuOpen(false)} />
                  <div className="absolute left-0 right-0 mt-2 max-h-80 overflow-y-auto bg-neutral-900 border-2 rounded-xl shadow-2xl z-50 py-1" style={{ borderColor: `${secondaryColor}66` }}>
                    {(categoria === "experiencia_destino" ? AD_TITLE_PRESETS_EXPERIENCIA : AD_TITLE_PRESETS).map((tpl) => {
                      const preview = tpl.replace(/\{destino\}/gi, destination?.trim() || "Destino");
                      const active = tpl === adTitleTemplate;
                      return (
                        <button
                          key={tpl}
                          type="button"
                          onClick={() => { setAdTitleTemplate(tpl); setAdTitleMenuOpen(false); }}
                          className={`w-full text-left px-3 py-2.5 text-sm hover:bg-white/[0.08] transition-colors flex items-center gap-2 ${active ? "bg-white/[0.06] text-white font-semibold" : "text-white/80"}`}
                        >
                          {active && <Check className="w-3.5 h-3.5 flex-shrink-0" style={{ color: secondaryColor }} />}
                          <span className={active ? "" : "ml-5"}>{preview}</span>
                        </button>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        <div>
          <label className={labelCls}>Dias / data da viagem</label>
          <div className="relative">
            <input
              value={travelPeriod}
              onChange={(e) => setTravelPeriod(e.target.value)}
              onFocus={(e) => { setTimeout(() => e.target.select(), 50); setTravelPeriodMenuOpen(true); }}
              onClick={() => setTravelPeriodMenuOpen(true)}
              placeholder="Ex: 5 dias, Janeiro"
              className={`${inputCls} pr-10 cursor-pointer`}
            />
            <ChevronDown className={`absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 pointer-events-none transition-transform ${travelPeriodMenuOpen ? "rotate-180" : ""}`} />
            {travelPeriodMenuOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setTravelPeriodMenuOpen(false)} />
                <div className="absolute left-0 right-0 mt-2 max-h-72 overflow-y-auto bg-neutral-900 border-2 rounded-xl shadow-2xl z-50 py-1" style={{ borderColor: `${secondaryColor}66` }}>
                  {TRAVEL_PERIOD_PRESETS.map((opt) => {
                    const active = travelPeriod === opt;
                    return (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => { setTravelPeriod(opt); setTravelPeriodMenuOpen(false); }}
                        className={`w-full text-left px-3 py-2 text-sm hover:bg-white/[0.08] transition-colors flex items-center gap-2 ${active ? "bg-white/[0.06] text-white font-semibold" : "text-white/80"}`}
                      >
                        {active && <Check className="w-3.5 h-3.5 flex-shrink-0" style={{ color: secondaryColor }} />}
                        <span className={active ? "" : "ml-5"}>{opt}</span>
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Modo de pagamento */}
        {categoria !== "experiencia_destino" && (
          <div className="space-y-3">
            <label className={labelCls}>Modo de exibição do preço</label>
            <div className="grid grid-cols-3 gap-1.5">
              {PAYMENT_PRESETS.map((p) => (
                <button
                  key={p.id}
                  onClick={() => {
                    setPaymentMode(p.id);
                    if (p.id === "installments" && !installments.trim()) setInstallments("10x");
                  }}
                  className={`px-2 py-1.5 rounded-lg border-2 text-center transition-all ${
                    paymentMode === p.id ? "" : "border-white/[0.08] bg-white/[0.02] hover:border-white/15"
                  }`}
                  style={paymentMode === p.id ? { borderColor: secondaryColor, background: `${secondaryColor}1a` } : undefined}
                >
                  <span className="text-[11px] font-bold text-white">{p.name}</span>
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
              {paymentMode !== "cash" && (
                <div>
                  <label className={labelCls}>Parcelas</label>
                  <input
                    value={paymentLabel}
                    onChange={(e) => setInstallments(e.target.value)}
                    onFocus={(e) => e.target.select()}
                    placeholder="10x"
                    className={inputCls}
                  />
                </div>
              )}
              <div className={paymentMode === "cash" ? "col-span-2" : ""}>
                <label className={labelCls}>Valor ({currencySymbol})</label>
                <div className="flex gap-1.5">
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value as Currency)}
                    className="bg-white/[0.06] border border-white/10 rounded-xl px-2 py-3 text-white text-xs outline-none focus:border-white/40 cursor-pointer"
                  >
                    {CURRENCY_PRESETS.map((c) => (
                      <option key={c.id} value={c.id} className="bg-neutral-900">{c.symbol}</option>
                    ))}
                  </select>
                  <input
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    onFocus={(e) => e.target.select()}
                    placeholder="1.499,00"
                    className={`${inputCls} flex-1`}
                  />
                </div>
              </div>
              <div>
                <label className={labelCls}>Prefixo</label>
                <input
                  value={pricePrefix}
                  onChange={(e) => setPricePrefix(e.target.value)}
                  onFocus={(e) => e.target.select()}
                  placeholder="a partir de"
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>Complemento</label>
                <input
                  value={paymentSuffix}
                  onChange={(e) => setPaymentSuffix(e.target.value)}
                  onFocus={(e) => e.target.select()}
                  placeholder="por pessoa"
                  className={inputCls}
                />
              </div>
            </div>

            <div className="mt-4 bg-white/[0.03] border border-white/10 rounded-xl overflow-hidden">
              <button
                type="button"
                onClick={() => setPriceOptionsOpen((v) => !v)}
                className="w-full flex items-center justify-between px-4 py-3 hover:bg-white/[0.04] transition-colors"
              >
                <span className="text-sm font-bold text-white">Opções de preço</span>
                <ChevronDown className={`w-4 h-4 text-white/50 transition-transform ${priceOptionsOpen ? "rotate-180" : ""}`} />
              </button>
              {priceOptionsOpen && (
                <div className="px-4 pb-4 pt-1 space-y-3 border-t border-white/10">
                  <label className="flex items-center gap-2 text-[12px] text-white/80 cursor-pointer">
                    <input type="checkbox" checked={!hideCents} onChange={(e) => setHideCents(!e.target.checked)} className="accent-yellow-400" />
                    Mostrar centavos
                  </label>
                  <label className="flex items-center gap-2 text-[12px] text-white/80 cursor-pointer">
                    <input type="checkbox" checked={showTotal} onChange={(e) => setShowTotal(e.target.checked)} className="accent-yellow-400" />
                    Mostrar valor total
                  </label>
                  <label className="flex items-center gap-2 text-[12px] text-white/80 cursor-pointer">
                    <input type="checkbox" checked={showPixBanner} onChange={(e) => setShowPixBanner(e.target.checked)} className="accent-yellow-400" />
                    Mostrar faixa de desconto
                  </label>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Tipografia, Cores, Benefícios e Gerar */}
      <div className={`${sectionCls} space-y-5`}>
        {/* Tipografia — colapsável (mesmo padrão dos outros blocos) */}
        <div className="bg-white/[0.03] border border-white/10 rounded-xl overflow-hidden">
          <button
            type="button"
            onClick={() => setFontOptionsOpen((v) => !v)}
            className="w-full flex items-center justify-between px-4 py-3 hover:bg-white/[0.04] transition-colors"
          >
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-sm font-bold text-white">Tipografia</span>
              <span className="text-[10px] text-white/40 truncate" style={{ fontFamily: `${fontFamily}, Inter, sans-serif` }}>
                {fontFamily} · T {Math.round(titleScale * 100)}% · D {Math.round(descScale * 100)}%
              </span>
            </div>
            <ChevronDown className={`w-4 h-4 text-white/50 transition-transform ${fontOptionsOpen ? "rotate-180" : ""}`} />
          </button>
          {fontOptionsOpen && (
            <div className="px-4 pb-4 pt-3 space-y-4 border-t border-white/10">
              {/* Fonte: select + chips */}
              <div>
                <label className={labelCls}>Fonte</label>
                <select
                  value={FONT_PRESETS.includes(fontFamily) ? fontFamily : "Inter"}
                  onChange={(e) => setFontFamily(e.target.value)}
                  className={inputCls}
                >
                  {FONT_PRESETS.map((f) => (
                    <option key={f} value={f} className="bg-neutral-900 text-white">{f}</option>
                  ))}
                </select>
              </div>

              {/* Ajustes Avançados de Tamanho — accordion interno */}
              <div className="bg-white/[0.02] border border-white/10 rounded-xl overflow-hidden">
                <button
                  type="button"
                  onClick={() => setAdvancedSizeOpen((v) => !v)}
                  className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-white/[0.04] transition-colors"
                >
                  <span className="text-[12px] font-semibold text-white/85">⚙️ Ajustes Avançados de Tamanho</span>
                  <ChevronDown className={`w-4 h-4 text-white/50 transition-transform ${advancedSizeOpen ? "rotate-180" : ""}`} />
                </button>
                {advancedSizeOpen && (
                  <div className="px-3 pb-3 pt-2 grid grid-cols-2 gap-3 border-t border-white/10">
                    <div>
                      <label className={labelCls}>Título <span className="text-white/40">({Math.round(titleScale * 100)}%)</span></label>
                      <input type="range" min={0.6} max={1.6} step={0.05} value={titleScale}
                        onChange={(e) => setTitleScale(parseFloat(e.target.value))} className="w-full accent-yellow-400" />
                    </div>
                    <div>
                      <label className={labelCls}>Descrição <span className="text-white/40">({Math.round(descScale * 100)}%)</span></label>
                      <input type="range" min={0.6} max={1.6} step={0.05} value={descScale}
                        onChange={(e) => setDescScale(parseFloat(e.target.value))} className="w-full accent-yellow-400" />
                    </div>
                  </div>
                )}
              </div>

              {/* Cor do texto: mesmo padrão das cores Primária/Secundária */}
              <div className="bg-white/[0.02] border border-white/10 rounded-xl p-3">
                <div className="flex items-baseline justify-between mb-2">
                  <label className={labelCls}>Cor do texto</label>
                  <span className="text-[10px] text-white/40">aplica em todos os textos</span>
                </div>
                <div className="grid grid-cols-10 gap-1 mb-3">
                  {PRESET_COLORS.map((c) => (
                    <button
                      key={c}
                      onClick={() => setTextColorOverride(c)}
                      className={`w-5 h-5 rounded-full border transition-all ${(textColorOverride || "").toLowerCase() === c.toLowerCase() ? "border-white scale-125 shadow-md" : "border-white/20 hover:border-white/60"}`}
                      style={{ background: c, boxShadow: c === "#ffffff" ? "0 0 0 1px rgba(255,255,255,0.2) inset" : undefined }}
                      aria-label={c}
                      title={c}
                    />
                  ))}
                </div>
                <div className="flex gap-2 items-center">
                  <label className="relative w-10 h-10 rounded-full cursor-pointer flex-shrink-0 overflow-hidden border-2 border-white/20 hover:border-white/60 transition-all shadow-md"
                    style={{ background: "conic-gradient(from 0deg, #ff0000, #ffff00, #00ff00, #00ffff, #0000ff, #ff00ff, #ff0000)" }}>
                    <input type="color" value={textColorOverride || "#ffffff"}
                      onChange={(e) => setTextColorOverride(e.target.value)} className="absolute inset-0 opacity-0 cursor-pointer" />
                    <span className="absolute inset-1.5 rounded-full border border-white/40" style={{ background: textColorOverride || "#ffffff" }} />
                  </label>
                  <input value={textColorOverride} onChange={(e) => setTextColorOverride(e.target.value)}
                    placeholder="Padrão (branco)"
                    className="flex-1 bg-white/[0.04] border border-white/10 rounded-lg px-3 py-2 text-white text-xs outline-none focus:border-white/40 font-mono uppercase" />
                  {textColorOverride && (
                    <button onClick={() => setTextColorOverride("")}
                      className="text-[11px] text-white/60 hover:text-white px-2 py-1 rounded border border-white/10">
                      Limpar
                    </button>
                  )}
                </div>
              </div>

              <button
                onClick={() => { setFontFamily("Inter"); setTitleScale(1); setDescScale(1); setTextColorOverride(""); }}
                className="text-[11px] text-white/60 hover:text-white underline"
              >
                Restaurar padrão
              </button>
            </div>
          )}
        </div>

        {/* Cores — colapsável (mesmo padrão de Tipografia) */}
        <div className="bg-white/[0.03] border border-white/10 rounded-xl overflow-hidden">
          <button
            type="button"
            onClick={() => setColorsOpen((v) => !v)}
            className="w-full flex items-center justify-between px-4 py-3 hover:bg-white/[0.04] transition-colors"
          >
            <div className="flex items-center gap-3 min-w-0">
              <span className="text-sm font-bold text-white">Cores</span>
              <div className="flex items-center gap-1.5">
                <span
                  className="w-4 h-4 rounded-full border border-white/30 shadow-sm"
                  style={{ background: primaryColor }}
                  title={`Primária ${primaryColor}`}
                />
                <span
                  className="w-4 h-4 rounded-full border border-white/30 shadow-sm"
                  style={{ background: secondaryColor }}
                  title={`Secundária ${secondaryColor}`}
                />
                <span className="text-[10px] text-white/40 ml-1">
                  · {baseTextMode === "light" ? "Textos claros" : "Textos escuros"}
                </span>
              </div>
            </div>
            <ChevronDown className={`w-4 h-4 text-white/50 transition-transform ${colorsOpen ? "rotate-180" : ""}`} />
          </button>
          {colorsOpen && (
            <div className="px-4 pb-4 pt-3 space-y-4 border-t border-white/10">
              {/* Bolinhas de cor — clicar abre o color picker nativo */}
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: "Cor primária", value: primaryColor, setter: setPrimaryColor, hint: "Fundo principal" },
                  { label: "Cor secundária", value: secondaryColor, setter: setSecondaryColor, hint: "Acento" },
                ].map(({ label, value, setter, hint }) => (
                  <div key={label} className="flex flex-col items-start gap-2">
                    <div className="flex items-baseline justify-between w-full">
                      <label className={labelCls}>{label}</label>
                      <span className="text-[10px] text-white/40">{hint}</span>
                    </div>
                    <label
                      className="relative w-12 h-12 rounded-full cursor-pointer overflow-hidden border-2 border-white/20 hover:border-white/60 transition-all shadow-md"
                      style={{ background: value }}
                      title="Clique para escolher uma cor"
                    >
                      <input
                        type="color"
                        value={/^#[0-9a-f]{6}$/i.test(value) ? value : "#000000"}
                        onChange={(e) => setter(e.target.value)}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                      />
                    </label>
                    <span className="text-[10px] text-white/50 font-mono uppercase">{value}</span>
                  </div>
                ))}
              </div>

              {/* Cor dos Textos Base */}
              <div>
                <label className={labelCls}>Cor dos textos base</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setBaseTextMode("light")}
                    className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg border text-xs font-semibold transition-all ${
                      baseTextMode === "light"
                        ? "bg-white text-black border-white"
                        : "bg-white/[0.04] text-white/70 border-white/10 hover:border-white/30"
                    }`}
                  >
                    <span className="w-3 h-3 rounded-full bg-white border border-black/20" />
                    Textos claros
                  </button>
                  <button
                    type="button"
                    onClick={() => setBaseTextMode("dark")}
                    className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg border text-xs font-semibold transition-all ${
                      baseTextMode === "dark"
                        ? "bg-neutral-900 text-white border-white"
                        : "bg-white/[0.04] text-white/70 border-white/10 hover:border-white/30"
                    }`}
                  >
                    <span className="w-3 h-3 rounded-full bg-neutral-900 border border-white/40" />
                    Textos escuros
                  </button>
                </div>
                <p className="text-[10px] text-white/40 mt-1.5">Define a cor dos textos sobre a arte para garantir legibilidade.</p>
              </div>
            </div>
          )}
        </div>

        {/* Benefícios — em Experiência de Destino usa apenas texto, sem selector de ícones. */}
        <div>
          <div className="flex items-baseline justify-between mb-2 gap-2">
            <label className={labelCls}>{categoria === "experiencia_destino" ? "Descrição da experiência" : "Benefícios / Inclusos"}</label>
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
                  toast.success("Benefícios restaurados ao padrão");
                }}
                className="flex items-center gap-1 text-[10px] text-white/50 hover:text-white transition-colors"
                title="Restaurar benefícios padrão"
              >
                <RotateCcw className="w-3 h-3" />
                Restaurar
              </button>
              <span className="text-[10px] text-white/40">
                {highlights.length}/{MAX_HIGHLIGHTS}{categoria === "experiencia_destino" ? " · texto da experiência" : " · clique no ícone para trocar"}
              </span>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {highlights.map((h, i) => {
              const IconComp = ICON_OPTIONS.find((o) => o.key === h.icon)?.Icon || Check;
              return (
                <div key={i} className="bg-white/[0.04] border border-white/10 rounded-lg">
                  <div className="flex gap-1.5 items-center px-2.5 py-2">
                    {categoria !== "experiencia_destino" && (
                      <button
                        onClick={() => setEditingIconIdx(editingIconIdx === i ? null : i)}
                        className="w-7 h-7 rounded flex items-center justify-center hover:bg-white/10 transition-colors flex-shrink-0"
                        style={{ color: secondaryColor }}
                        title="Trocar ícone"
                      >
                        <IconComp className="w-4 h-4" />
                      </button>
                    )}
                    <input
                      value={h.text}
                      onChange={(e) => updateHighlightText(i, e.target.value)}
                      className="flex-1 min-w-0 bg-transparent text-sm text-white outline-none"
                    />
                    <button
                      onClick={() => removeHighlight(i)}
                      className="text-white/40 hover:text-red-400 flex-shrink-0"
                      title="Remover"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  {categoria !== "experiencia_destino" && editingIconIdx === i && (
                    <div className="border-t border-white/10 p-2 grid grid-cols-8 gap-1">
                      {ICON_OPTIONS.map(({ key, Icon, label }) => (
                        <button
                          key={key}
                          onClick={() => updateHighlightIcon(i, key)}
                          className={`p-1.5 rounded hover:bg-white/10 flex items-center justify-center transition-colors ${h.icon === key ? "bg-white/20" : ""}`}
                          title={label}
                        >
                          <Icon className="w-3.5 h-3.5" style={{ color: h.icon === key ? secondaryColor : "rgba(255,255,255,0.7)" }} />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}

            {/* Slot "adicionar" — só aparece se ainda dá pra adicionar */}
            {highlights.length < MAX_HIGHLIGHTS && (
              <div className="bg-white/[0.02] border border-dashed border-white/15 rounded-lg flex gap-1.5 items-center px-2.5 py-2 hover:border-white/30 transition-colors">
                <Plus className="w-4 h-4 flex-shrink-0" style={{ color: secondaryColor }} />
                <input
                  value={newHl}
                  onChange={(e) => setNewHl(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addHighlight()}
                  placeholder={categoria === "experiencia_destino" ? "Ex: Pôr do sol privativo" : "Ex: Bebidas inclusas"}
                  className="flex-1 min-w-0 bg-transparent text-sm text-white placeholder:text-white/30 outline-none"
                />
                <button
                  onClick={addHighlight}
                  disabled={!newHl.trim()}
                  className="text-xs font-bold px-2 py-1 rounded text-black disabled:opacity-30 disabled:cursor-not-allowed transition-all hover:brightness-110 flex-shrink-0"
                  style={{ background: secondaryColor }}
                  title="Adicionar"
                >
                  +
                </button>
              </div>
            )}
          </div>
          <p className="text-[10px] text-white/40 mt-1.5">
            Pressione Enter ou clique em <kbd className="text-white/60">+</kbd> para adicionar. Até {MAX_HIGHLIGHTS} benefícios.
          </p>
        </div>
        
        {/* IA Pura agora roda no servidor — chave não é mais necessária */}

        {/* Feature: Lote A/B (3 variações) */}
        <div className="bg-white/[0.03] border border-white/10 rounded-xl p-4 flex items-center justify-between gap-4 hover:bg-white/[0.05] transition-colors cursor-pointer group" onClick={() => setIsBatchMode(!isBatchMode)}>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                Gerar Lote de Teste A/B
              </h4>
              <span className="bg-indigo-500/20 text-indigo-300 text-[9px] px-1.5 py-0.5 rounded border border-indigo-500/30 font-bold uppercase">Premium</span>
            </div>
            <p className="text-[10px] text-white/50 mt-1 leading-relaxed">
              Gera 3 variações diferentes desta arte de uma vez só. {genMode === "ai" ? "Usa apenas 1 crédito de IA!" : "Mais velocidade."}
            </p>
          </div>
          
          {/* Switch toggle visual */}
          <div className={`w-12 h-6 rounded-full relative transition-colors ${isBatchMode ? 'bg-indigo-500' : 'bg-white/10'}`}>
            <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm transition-all duration-300 ${isBatchMode ? 'left-7' : 'left-1'}`} />
          </div>
        </div>



        <button
          onClick={() => generateNext()}
          disabled={loading || !destination}
          className="w-full py-4 rounded-xl font-extrabold text-black flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-300 hover:scale-[1.02] hover:brightness-110 active:scale-[0.98]"
          style={{ background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`, boxShadow: `0 10px 30px ${primaryColor}66` }}
        >
          {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Gerando com IA...</> : <><Sparkles className="w-4 h-4" /> Gerar Anúncio</>}
        </button>
        {loading && <p className="text-xs text-white/50 text-center mt-1">A IA leva 8 a 25 segundos.</p>}

        {(generationError || generatedImages.length > 0) && (
          <div ref={resultRef} className="mt-5 rounded-2xl border border-white/10 bg-white/[0.04] p-4 space-y-4 scroll-mt-24">
            {generationError && (
              <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-100">
                <div className="font-bold">Não foi possível gerar a imagem</div>
                <p className="mt-1 text-xs text-red-100/80">{generationError}</p>
              </div>
            )}

            {generatedImages.length > 0 && (
              <>
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-bold text-white">Imagem gerada</h3>
                    <p className="text-[11px] text-white/50">A última arte aparece abaixo e já está pronta para baixar.</p>
                  </div>
                  <button
                    type="button"
                    onClick={downloadPNG}
                    disabled={!generatedImage}
                    className="shrink-0 flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.08] px-3 py-2 text-xs font-bold text-white hover:bg-white/[0.12] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    Baixar PNG
                  </button>
                </div>

                <div className={`grid gap-3 ${generatedImages.length > 1 ? "grid-cols-1 sm:grid-cols-3" : "grid-cols-1"}`}>
                  {generatedImages.map((img, idx) => (
                    <div key={`${img.slice(0, 48)}-${idx}`} className="relative group/img">
                      <button
                        type="button"
                        onClick={() => setGeneratedImage(img)}
                        className={`w-full overflow-hidden rounded-xl border-2 bg-black/30 transition-all ${generatedImage === img ? "border-white shadow-lg" : "border-white/10 hover:border-white/30"}`}
                        title={`Selecionar variação ${idx + 1}`}
                      >
                        <img src={img} alt={`Anúncio gerado ${idx + 1}`} className="w-full h-auto object-contain" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          const newList = generatedImages.filter((_, i) => i !== idx);
                          setGeneratedImages(newList);
                          if (generatedImage === img) setGeneratedImage(newList[0] || "");
                          toast.success("Variação removida");
                        }}
                        className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-lg opacity-0 group-hover/img:opacity-100 transition-opacity shadow-lg hover:bg-red-600"
                        title="Excluir esta versão"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>

                {adCaptions.length > 0 && (
                  <div className="rounded-xl border border-white/10 bg-black/20 p-3">
                    <div className="flex items-center justify-between gap-3 mb-2">
                      <div className="text-xs font-bold text-white flex items-center gap-2">
                        <FileText className="w-4 h-4" /> Legenda sugerida
                      </div>
                      <button
                        type="button"
                        onClick={async () => {
                          const text = selectedCaption || adCaptions[0];
                          await navigator.clipboard.writeText(text);
                          setSelectedCaption(text);
                          setCaptionCopied(true);
                          toast.success("Legenda copiada!");
                        }}
                        className="flex items-center gap-1.5 rounded-lg border border-white/10 px-2 py-1 text-[11px] font-semibold text-white/80 hover:bg-white/[0.08] transition-colors"
                      >
                        {captionCopied ? <ClipboardCheck className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        Copiar
                      </button>
                    </div>
                    <div className="flex bg-black/30 p-1 rounded-lg border border-white/5 mb-3">
                      {adCaptions.map((_, idx) => (
                        <button
                          key={idx}
                          onClick={() => {
                            setSelectedCaption(adCaptions[idx]);
                            setCaptionCopied(false);
                          }}
                          className={`flex-1 py-1.5 rounded-md text-[10px] font-bold transition-all ${
                            (selectedCaption || adCaptions[0]) === adCaptions[idx]
                              ? "bg-white/10 text-white shadow-sm"
                              : "text-white/40 hover:text-white"
                          }`}
                        >
                          Opção {idx + 1}
                        </button>
                      ))}
                    </div>
                    <p className="whitespace-pre-line text-xs leading-relaxed text-white/70 min-h-[120px]">
                      {selectedCaption || adCaptions[0]}
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* Botão de avanço para Fase 2 */}
        <div className="mt-8 pt-6 border-t border-white/[0.06]">
          <button
            onClick={onNext}
            className="w-full flex items-center justify-center gap-3 py-4 px-6 rounded-2xl font-extrabold text-sm uppercase tracking-wider transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-amber-500/20 hover:shadow-amber-500/30"
            style={{
              background: "linear-gradient(135deg, #F59E0B, #FCD34D)",
              color: "#0A0A0A",
            }}
          >
            <span>Avançar para Fase 2 — Seu Site</span>
            <ArrowRight className="w-5 h-5" />
          </button>
          <p className="text-center text-[11px] text-white/30 mt-2">
            Crie a página de vendas da sua agência no próximo passo
          </p>
        </div>
      </div>
    </div>
  );
};
