import { useState, useRef } from "react";
import { useFabricaContext } from "@/hooks/useFabricaContext";
import { type StrategyId } from "@/data/fabrica-prompts";
import { CATEGORIAS, getCategoria, pickPromptsForCategoria, type CategoriaId } from "@/data/fabrica-categories";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { composeTravelAd, type PaymentMode } from "@/lib/fabrica-compose-art";
import { getForbiddenSets, registerGeneration, freshSeed } from "@/lib/fabrica-generation-guard";
import {
  Loader2, Download, Sparkles, ArrowRight, Plus, X, Trash2, ChevronDown,
  Bus, Hotel, Plane, Check, Star, Heart, Sun, Camera, MapPin, Utensils, Ship, Palmtree, Coffee, Wifi, User,
  Square, Smartphone, Image as ImageIcon, Upload, Link2, Search, Wand2,
} from "lucide-react";
import { toast } from "sonner";

type GenMode = "ai" | "photo" | "custom";
type CustomSource = "upload" | "link";

interface Props { onNext: () => void; onBack: () => void; }

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

const PRESET_COLORS = [
  // Escuros
  "#0a0a0a", "#0c2340", "#1e293b", "#1d4ed8",
  // Médios
  "#2563eb", "#3b82f6", "#7c3aed", "#a855f7",
  // Quentes
  "#dc2626", "#991b1b", "#e85d3a", "#064e3b",
  // Claros / Especiais
  "#ffffff", "#f8fafc", "#0d7a5f", "#16a34a",
];

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

export const Phase3ArtFactory = ({ onNext, onBack }: Props) => {
  const { state, update } = useFabricaContext();
  const [categoria, setCategoriaState] = useState<CategoriaId>((state.lastCategoria as CategoriaId) || "oferta_pacote");
  const setCategoria = (c: CategoriaId) => { setCategoriaState(c); update({ lastCategoria: c }); };

  const strategy: StrategyId = getCategoria(categoria).legacyStrategy;
  const [lastTemplateId, setLastTemplateId] = useState<string | null>(() => localStorage.getItem("fabrica_last_template_id"));
  const [recentTemplateIds, setRecentTemplateIds] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem("fabrica_recent_template_ids") || "[]"); }
    catch { return []; }
  });
  const [format, setFormatState] = useState<"square" | "story">(state.lastFormat || "story");
  const setFormat = (f: "square" | "story") => { setFormatState(f); update({ lastFormat: f }); };

  const [destination, setDestination] = useState(state.destinos?.[0] || "");
  const [price, setPriceState] = useState(state.lastPrice || "149,90");
  const setPrice = (p: string) => { setPriceState(p); update({ lastPrice: p }); };

  const [installments, setInstallmentsState] = useState(state.lastInstallments || "10x");
  const setInstallments = (i: string) => { setInstallmentsState(i); update({ lastInstallments: i }); };

  const [promoName, setPromoNameState] = useState(state.lastPromoName || "OFERTA ESPECIAL");
  const setPromoName = (n: string) => { setPromoNameState(n); update({ lastPromoName: n }); };

  // Título do anúncio (com presets editáveis usando {destino})
  const [adTitleTemplate, setAdTitleTemplateState] = useState(state.lastAdTitle || "Pacote {destino}");
  const setAdTitleTemplate = (t: string) => { setAdTitleTemplateState(t); update({ lastAdTitle: t }); };
  const [adTitleMenuOpen, setAdTitleMenuOpen] = useState(false);
  const resolvedAdTitle = (adTitleTemplate || "").replace(/\{destino\}/gi, destination?.trim() || "Destino");

  const [paymentMode, setPaymentModeState] = useState<PaymentMode>(state.lastPaymentMode || "installments");
  const setPaymentMode = (m: PaymentMode) => { setPaymentModeState(m); update({ lastPaymentMode: m }); };

  const [paymentLabel, setPaymentLabel] = useState("");
  const [paymentSuffix, setPaymentSuffix] = useState("");
  const [primaryColor, setPrimaryColorState] = useState(state.primaryColor || "#F59E0B");
  const [secondaryColor, setSecondaryColorState] = useState(state.secondaryColor || "#FCD34D");
  
  const setPrimaryColor = (c: string) => { setPrimaryColorState(c); update({ primaryColor: c }); };
  const setSecondaryColor = (c: string) => { setSecondaryColorState(c); update({ secondaryColor: c }); };

  const [highlights, setHighlightsState] = useState<Highlight[]>(state.lastHighlights || DEFAULT_HIGHLIGHTS);
  const setHighlights = (h: Highlight[]) => { setHighlightsState(h); update({ lastHighlights: h }); };
  const [editingIconIdx, setEditingIconIdx] = useState<number | null>(null);
  const [newHl, setNewHl] = useState("");
  const [loading, setLoading] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string>("");
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [variationCounter, setVariationCounter] = useState(0);
  // Histórico das últimas variantes do compositor canvas (modo Sua Imagem) para forçar rotação
  const variantHistoryRef = useRef<number[]>([]);
  const [lastProvider, setLastProvider] = useState<"user_gemini" | "lovable_ai" | null>(null);
  const [generationCount, setGenerationCount] = useState<number>(() => {
    const saved = localStorage.getItem("fabrica_gen_count");
    return saved ? parseInt(saved, 10) : 0;
  });

  // ===== Modo de geração =====
  const [genMode, setGenMode] = useState<GenMode>("photo");
  const [searchEngine, setSearchEngine] = useState<"pexels" | "google">("pexels");
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

  // Termos de turismo para garantir que o Unsplash retorne fotos de destinos reais
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

  const addHighlight = () => {
    const v = newHl.trim();
    if (!v || highlights.length >= 5) return;
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

  const generate = async (forceVariation?: number, accumulate: boolean = false) => {
    if (!destination.trim()) {
      toast.error("Digite o destino do anúncio");
      return;
    }
    setLoading(true);
    setGeneratedImage("");
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

      // ===== MODO FOTO (composição local) — gera 1 imagem única =====
      if (genMode === "photo") {
        toast.info("Gerando 1 imagem única com foto real");
        const guard = getForbiddenSets(categoria, "photo", format);
        const stratHistKey = scopedStrategyHistoryKey(categoria, "photo", format);
        let stratHistory: StrategyId[] = [];
        try { stratHistory = JSON.parse(localStorage.getItem(stratHistKey) || "[]"); } catch { stratHistory = []; }
        // Combina histórico local + histórico do guard (proíbe layouts recentes)
        const mergedHist = Array.from(new Set([...stratHistory, ...(guard.layouts as StrategyId[])]));
        const freshSeedPhoto = freshSeed(generationSeed);
        const chosen = pickDistinctLocalStrategies(categoria, freshSeedPhoto, 1, mergedHist);
        localStorage.setItem(stratHistKey, JSON.stringify(chosen));
        const photoRefs = pickPhotoRefs(photos, refImage, freshSeedPhoto, chosen.length);

        // Paleta — sempre usa exatamente as cores selecionadas pelo usuário.
        const palette = selectedPalette(primaryColor, secondaryColor);

        const composed = await Promise.all(
          chosen.map(async (localStrategy, idx) => {
            let img = await composeTravelAd({
              imageUrl: photoRefs[idx],
              format,
              destination,
              city: state.city,
              primaryColor: palette.primary,
              secondaryColor: palette.secondary,
              price,
              installments,
              promoName,
              highlights,
              hasLogo: !!state.logoBase64,
              paymentMode,
              paymentLabel: paymentLabel || undefined,
              paymentSuffix: paymentSuffix || undefined,
              strategy: localStrategy,
              variation: freshSeedPhoto + idx,
            });
            if (state.logoBase64) {
              try {
                const { composeLogoOnImage } = await import("@/lib/fabrica-logo-overlay");
                img = await composeLogoOnImage(img, state.logoBase64);
              } catch (e) {
                console.warn("Falha ao compor logo:", e);
              }
            }
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
        update({ generatedAdImage: composed[composed.length - 1], primaryColor: palette.primary });

        const newCount = generationCount + composed.length;
        setGenerationCount(newCount);
        localStorage.setItem("fabrica_gen_count", String(newCount));
        finishCycle(composed.length);

        toast.success(`${composed.length} ${composed.length === 1 ? "variação gerada" : "variações geradas"} com foto real!`);
        return;
      }

        // ===== MODO IA PURA: gera 1 prompt da categoria; Experiência usa fluxo seguro sem texto da IA =====
      if (genMode === "ai") {
        const cat = getCategoria(categoria);
        const isAiExperienceStory = categoria === "experiencia_destino";
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
          ? [{ code: "ED_SAFE_STORY", templateId: "photo_only_experience_story" }]
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

        const results = await Promise.all(
          picks.map((pick, idx) => supabase.functions.invoke("fabrica-generate-ad", {
            body: {
              strategy: categoria === "oferta_pacote" ? "ancora" : categoria === "experiencia_destino" ? "vitrine" : "matriz",
              format,
              // 🚨 HACK DE EMERGÊNCIA: Injeta ordens no único campo que o servidor antigo lê
              destination: `${destination.toUpperCase()} (STRICT RULE: NO PEOPLE, ONLY LANDSCAPE. WRITE FULL TITLE: "Pacote para ${destination}". NO ICONS IN PRICE TAG)`,
              niche: state.niche,
              agencyName: state.agencyName,
              agencyType: state.agencyType === "outro" ? state.agencyTypeOther : state.agencyType,
              city: state.city,
              primaryColor: palette.primary,
              secondaryColor: palette.secondary,
              hasLogo: !!state.logoBase64,
              price,
              installments,
              promoName: (promoName || "Oferta Especial").toUpperCase(),
              highlights,
              ctaText: state.whatsapp ? "Reserve no WhatsApp" : "Reserve agora",
              templateId: pick.templateId,
              photoOnly: false, // Voltamos para a IA profissional
              variation: freshSeedAi + idx + Math.random(), // Garante que NUNCA repita a imagem
              packageType: "Voo + Hotel",
              duration: "5 NOITES",
              forbiddenHeadlines: guard.headlines,
              forbiddenLayouts: guard.layouts,
            },
          }))
        );

        const images: string[] = [];
        let providerSeen: "user_gemini" | "lovable_ai" | null = null;
        const { reframeImageToAspect } = await import("@/lib/fabrica-compose-art");

        for (const result of results) {
          if (result.error) throw result.error;
          if (result.data?.error) throw new Error(result.data.error);
          if (!result.data?.image) throw new Error("Nenhuma imagem foi gerada.");
          
          let img = result.data.image as string;
          // Ajusta o enquadramento se a IA entregar algo fora do aspecto (especialmente em Square)
          try { img = await reframeImageToAspect(img, format); }
          catch (e) { console.warn("reframe failed", e); }
          
          images.push(img);
          if (result.data.provider) providerSeen = result.data.provider;
        }

        const MAX_VARIATIONS_AI = 3;
        setGeneratedImages((prev) => [...prev, ...images].slice(-MAX_VARIATIONS_AI));
        setGeneratedImage(images[images.length - 1]);
        update({ generatedAdImage: images[images.length - 1], primaryColor: palette.primary });
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
        finishCycle(images.length);

        toast.success(`${images.length} ${images.length === 1 ? "variação gerada" : "variações geradas"} — ${cat.name}`);
        return;
      }

      // ===== MODO CUSTOM (link/upload do usuário) — gera 1 imagem local, sem gastar créditos de IA =====
      toast.info("Gerando 1 imagem única com sua imagem");
      const guardCustom = getForbiddenSets(categoria, "custom", format);
      const stratHistKeyCustom = scopedStrategyHistoryKey(categoria, "custom", format);
      let stratHistoryCustom: StrategyId[] = [];
      try { stratHistoryCustom = JSON.parse(localStorage.getItem(stratHistKeyCustom) || "[]"); } catch { stratHistoryCustom = []; }
      const mergedHistCustom = Array.from(new Set([...stratHistoryCustom, ...(guardCustom.layouts as StrategyId[])]));
      const freshSeedCustom = freshSeed(generationSeed);
      const chosen = pickDistinctLocalStrategies(categoria, freshSeedCustom, 1, mergedHistCustom);
      localStorage.setItem(stratHistKeyCustom, JSON.stringify(chosen));
      const palette = selectedPalette(primaryColor, secondaryColor);

      // Rotação determinística entre as 3 variantes do compositor (V0/V1/V2)
      // evitando a última usada — garante imagem nova a cada clique.
      const TOTAL_VARIANTS = 3;
      const lastUsed = variantHistoryRef.current[variantHistoryRef.current.length - 1];
      const candidates = Array.from({ length: TOTAL_VARIANTS }, (_, i) => i).filter((v) => v !== lastUsed);
      const nextVariant = candidates[Math.floor(Math.random() * candidates.length)];
      variantHistoryRef.current = [...variantHistoryRef.current.slice(-2), nextVariant];

      const imagesCustom = await Promise.all(
        chosen.map(async (localStrategy) => {
          let img = await composeTravelAd({
            imageUrl: refImage,
            format,
            destination,
            city: state.city,
            primaryColor: palette.primary,
            secondaryColor: palette.secondary,
            price,
            installments,
            promoName,
            highlights,
            hasLogo: !!state.logoBase64,
            paymentMode,
            paymentLabel: paymentLabel || undefined,
            paymentSuffix: paymentSuffix || undefined,
            strategy: localStrategy,
            variation: freshSeedCustom,
            forceVariant: nextVariant,
          });
          if (state.logoBase64) {
            try {
              const { composeLogoOnImage } = await import("@/lib/fabrica-logo-overlay");
              img = await composeLogoOnImage(img, state.logoBase64);
            } catch (e) {
              console.warn("Falha ao compor logo:", e);
            }
          }
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
      update({ generatedAdImage: imagesCustom[imagesCustom.length - 1], primaryColor: palette.primary });

      const newCount = generationCount + imagesCustom.length;
      setGenerationCount(newCount);
      localStorage.setItem("fabrica_gen_count", String(newCount));
      finishCycle(imagesCustom.length);

      toast.success(`${imagesCustom.length} ${imagesCustom.length === 1 ? "variação gerada" : "variações geradas"} com sua imagem!`);

    } catch (err: any) {
      console.error("generate error", err);
      toast.error(err?.message || "Erro ao gerar anúncio");
    } finally {
      setLoading(false);
    }
  };

  const generateNext = () => {
    const next = variationCounter + 1;
    setVariationCounter(next);
    generate(next, true);
  };

  const downloadPNG = () => {
    if (!generatedImage) return;
    try {
      const a = document.createElement("a");
      a.href = generatedImage;
      a.download = `anuncio-${(destination || "destino").toLowerCase().replace(/\s+/g, "-")}-${format}.png`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      toast.success("Imagem baixada!");
    } catch { toast.error("Erro ao baixar imagem"); }
  };

  const sectionCls = "bg-white/[0.05] border border-white/[0.08] rounded-2xl p-6";
  const labelCls = "text-[11px] text-white/60 uppercase tracking-wider font-semibold block mb-1.5";
  const inputCls = "w-full bg-white/[0.06] border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 outline-none focus:border-white/40";

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Banner de provedor de IA */}
      <div className={`rounded-2xl p-4 border ${
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
              {lastProvider === "user_gemini" && "Usando sua chave Gemini (grátis)"}
              {lastProvider === "lovable_ai" && "Usando créditos da plataforma"}
              {!lastProvider && "Provedor de IA configurado"}
            </div>
            <p className="text-[11px] text-white/60 leading-snug mt-0.5">
              {lastProvider === "user_gemini" && (
                <>Cota gratuita do Google: ~1.500 imagens/dia. Cheque seu uso em <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="underline text-emerald-300">aistudio.google.com</a>.</>
              )}
              {lastProvider === "lovable_ai" && (
                <>Cada imagem consome créditos. Se acabar, sua chave Gemini gratuita será usada automaticamente.</>
              )}
              {!lastProvider && (
                <>Tentaremos primeiro sua chave Gemini gratuita. Se falhar, cai pra créditos da plataforma. Imagens geradas nesta sessão: <strong className="text-white">{generationCount}</strong></>
              )}
            </p>
          </div>
          <div className="text-right shrink-0">
            <div className="text-[10px] text-white/40 uppercase tracking-wider">Geradas</div>
            <div className="text-lg font-bold text-white">{generationCount}</div>
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
              <ImageIcon className="w-3.5 h-3.5" /> Foto Real <span className="hidden sm:inline font-normal opacity-50">(grátis)</span>
            </button>
            <button
              onClick={() => setGenMode("custom")}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-[11px] font-bold transition-all disabled:opacity-30 ${genMode === "custom" ? "bg-white/10 text-white shadow-sm" : "text-white/50 hover:text-white"}`}
            >
              <Upload className="w-3.5 h-3.5" /> Sua Imagem
            </button>
            <button
              onClick={() => setGenMode("ai")}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-[11px] font-bold transition-all ${genMode === "ai" ? "bg-white/10 text-white shadow-sm" : "text-white/50 hover:text-white"}`}
            >
              <Wand2 className="w-3.5 h-3.5" /> IA Pura
            </button>
          </div>
          {genMode !== "ai" && (
            <p className="text-[10px] text-white/40 mt-1.5 leading-snug">
              🔒 A imagem é processada <strong>apenas em memória</strong> para gerar o anúncio.
            </p>
          )}
        </div>

        {/* Categoria - Compacta */}
        <div>
          <h3 className="text-xs font-bold text-white/60 uppercase tracking-widest mb-2">1 · Estilo do Anúncio</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {CATEGORIAS.map((c) => {
              const selected = categoria === c.id;
              return (
                <button
                  key={c.id}
                  onClick={() => {
                    setCategoria(c.id);
                  }}
                  className={`p-3 rounded-xl border-2 text-left transition-all flex flex-col justify-between min-h-[85px] ${
                    selected ? "shadow-lg scale-[1.02]" : "border-white/5 bg-black/20 hover:bg-white/[0.04]"
                  }`}
                  style={selected ? { borderColor: c.accent, background: `${c.accent}33` } : undefined}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xl leading-none">{c.emoji}</span>
                    <span
                      className="text-[9px] font-extrabold px-1.5 py-0.5 rounded border tracking-wider"
                      style={{ background: `${c.accent}26`, borderColor: `${c.accent}66`, color: c.accent }}
                    >
                      {c.badge}
                    </span>
                  </div>
                  <div className="text-sm font-bold text-white leading-tight">{c.name}</div>
                </button>
              );
            })}
          </div>
          <p className="text-[10px] text-white/40 mt-2">
            Cada clique gera 1 imagem única. A próxima geração troca layout, texto e formatação automaticamente.
          </p>
        </div>
      </div>

      {/* 1b · Galeria Pexels/Google (modo foto) */}
      {genMode === "photo" && (
        <div className={sectionCls}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-bold text-white/60 uppercase tracking-widest">1 · Escolha uma foto real</h3>
            <div className="flex bg-black/40 p-1 rounded-lg border border-white/10 scale-90 origin-right">
              <button
                onClick={() => setSearchEngine("pexels")}
                className={`px-3 py-1.5 rounded-md text-[10px] font-bold transition-all ${searchEngine === "pexels" ? "bg-white/10 text-white" : "text-white/40 hover:text-white"}`}
              >
                Pexels (Top)
              </button>
              <button
                onClick={() => setSearchEngine("google")}
                className={`px-3 py-1.5 rounded-md text-[10px] font-bold transition-all ${searchEngine === "google" ? "bg-white/10 text-white" : "text-white/40 hover:text-white"}`}
              >
                Google/Web
              </button>
            </div>
          </div>

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
          {photos.length > 0 && (() => {
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
                {!hasMore && photos.length > 3 && (
                  <p className="text-[10px] text-white/30 text-center mt-2">Todas as {photos.length} fotos exibidas.</p>
                )}
              </>
            );
          })()}
          {photos.length === 0 && !searchingPhotos && (
            <p className="text-xs text-white/40 text-center py-6">Digite o destino e clique em buscar.</p>
          )}
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
                placeholder="https://exemplo.com/foto.jpg"
                className={inputCls}
              />
              {customLink && (
                <div className="mt-3 rounded-lg overflow-hidden bg-black/40 max-w-[180px]">
                  <img src={customLink} alt="preview" className="w-full h-auto" onError={() => toast.error("Link inválido ou imagem não carregou")} />
                </div>
              )}
              <p className="text-[10px] text-white/40 mt-2">A IA vai adaptar a imagem ao formato escolhido (vertical/quadrado).</p>
            </div>
          )}
        </div>
      )}

      {/* 2 · Formato */}
      <div className={sectionCls}>
        <h3 className="text-xs font-bold text-white/60 uppercase tracking-widest mb-3">2 · Formato</h3>
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

      {/* 3 · Dados */}
      <div className={`${sectionCls} space-y-4`}>
        <h3 className="text-xs font-bold text-white/60 uppercase tracking-widest">3 · Dados do anúncio</h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Destino *</label>
            {state.destinos && state.destinos.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-2">
                {state.destinos.map((d) => (
                  <button
                    key={d}
                    onClick={() => setDestination(d)}
                    className={`px-2.5 py-1 rounded-full text-[11px] border transition-colors ${
                      destination === d ? "text-black" : "bg-white/[0.05] border-white/10 text-white/70 hover:border-white/30"
                    }`}
                    style={destination === d ? { background: primaryColor, borderColor: primaryColor } : undefined}
                  >
                    {d}
                  </button>
                ))}
              </div>
            )}
            <input value={destination} onChange={(e) => setDestination(e.target.value)} placeholder="Ex: Maragogi, Cancún..." className={inputCls} />
          </div>

          <div>
            <label className={labelCls}>Nome da promoção</label>
            <input value={promoName} onChange={(e) => setPromoName(e.target.value)} placeholder="Ex: BLACK FRIDAY" className={inputCls} />
          </div>
        </div>

        {/* Modo de pagamento — compacto */}
        <div>
          <label className={labelCls}>Modo de exibição do preço</label>
          <div className="grid grid-cols-3 gap-1.5 mb-3">
            {PAYMENT_PRESETS.map((p) => (
              <button
                key={p.id}
                onClick={() => {
                  setPaymentMode(p.id);
                  setPaymentLabel("");
                  setPaymentSuffix("");
                }}
                className={`px-2 py-1.5 rounded-lg border-2 text-center transition-all ${
                  paymentMode === p.id ? "" : "border-white/[0.08] bg-white/[0.02] hover:border-white/15"
                }`}
                style={paymentMode === p.id ? { borderColor: secondaryColor, background: `${secondaryColor}1a` } : undefined}
                title={p.description}
              >
                <span className="text-sm mr-1">{p.emoji}</span>
                <span className="text-[11px] font-bold text-white">{p.name}</span>
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>
                {paymentMode === "installments" || paymentMode === "down_plus" ? "Parcelas / Rótulo" : "Rótulo (opcional)"}
              </label>
              <input
                value={paymentMode === "installments" || paymentMode === "down_plus" ? installments : paymentLabel}
                onChange={(e) =>
                  paymentMode === "installments" || paymentMode === "down_plus"
                    ? setInstallments(e.target.value)
                    : setPaymentLabel(e.target.value)
                }
                placeholder={
                  paymentMode === "installments" ? "10x" :
                  paymentMode === "down_plus" ? "ENTRADA R$ 200 + 10x" :
                  "À VISTA"
                }
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Valor (R$)</label>
              <input
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="149,90"
                className={inputCls}
              />
            </div>
          </div>
        </div>

        {/* Cor primária — agora editável */}
        <div>
          <label className={labelCls}>Cor primária (fundo principal)</label>
          <div className="flex gap-2 items-center mb-2">
            <input type="color" value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} className="w-12 h-10 rounded-lg border border-white/10 bg-transparent cursor-pointer" />
            <input value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} className="flex-1 bg-white/[0.04] border border-white/10 rounded-xl px-4 py-2 text-white text-sm outline-none focus:border-white/40 font-mono" />
          </div>
          <div className="flex gap-1.5 flex-wrap">
            {PRESET_COLORS.map((c) => (
              <button
                key={c}
                onClick={() => setPrimaryColor(c)}
                className={`w-6 h-6 rounded-full border-2 transition-all ${primaryColor.toLowerCase() === c.toLowerCase() ? "border-white scale-125 shadow-lg" : "border-white/20 hover:border-white/60"}`}
                style={{ background: c, boxShadow: c === "#ffffff" || c === "#f8fafc" ? "0 0 0 1px rgba(255,255,255,0.2) inset" : undefined }}
                aria-label={c}
                title={c}
              />
            ))}
          </div>
        </div>

        {/* Cor secundária */}
        <div>
          <label className={labelCls}>Cor secundária (acento)</label>
          <div className="flex gap-2 items-center">
            <input type="color" value={secondaryColor} onChange={(e) => setSecondaryColor(e.target.value)} className="w-12 h-10 rounded-lg border border-white/10 bg-transparent cursor-pointer" />
            <input value={secondaryColor} onChange={(e) => setSecondaryColor(e.target.value)} className="flex-1 bg-white/[0.04] border border-white/10 rounded-xl px-4 py-2 text-white text-sm outline-none focus:border-white/40 font-mono" />
          </div>
        </div>

        {/* Benefícios totalmente editáveis (texto + ícone) — oculto para Autoridade Premium */}
        {true && (
          <>
            <label className={labelCls}>Benefícios / Inclusos ({highlights.length}/5) — clique no ícone para trocar</label>
            <div className="space-y-2 mb-2">
              {highlights.map((h, i) => {
                const IconComp = ICON_OPTIONS.find((o) => o.key === h.icon)?.Icon || Check;
                return (
                  <div key={i} className="bg-white/[0.04] border border-white/10 rounded-lg">
                    <div className="flex gap-2 items-center px-3 py-2">
                      <button
                        onClick={() => setEditingIconIdx(editingIconIdx === i ? null : i)}
                        className="w-7 h-7 rounded flex items-center justify-center hover:bg-white/10 transition-colors flex-shrink-0"
                        style={{ color: secondaryColor }}
                        title="Trocar ícone"
                      >
                        <IconComp className="w-4 h-4" />
                      </button>
                      <input
                        value={h.text}
                        onChange={(e) => updateHighlightText(i, e.target.value)}
                        className="flex-1 bg-transparent text-sm text-white outline-none"
                      />
                      <button onClick={() => removeHighlight(i)} className="text-white/40 hover:text-red-400">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    {editingIconIdx === i && (
                      <div className="border-t border-white/10 p-2 grid grid-cols-8 gap-1">
                        {ICON_OPTIONS.map(({ key, Icon, label }) => (
                          <button
                            key={key}
                            onClick={() => updateHighlightIcon(i, key)}
                            className={`p-2 rounded hover:bg-white/10 flex items-center justify-center transition-colors ${h.icon === key ? "bg-white/20" : ""}`}
                            title={label}
                          >
                            <Icon className="w-4 h-4" style={{ color: h.icon === key ? secondaryColor : "rgba(255,255,255,0.7)" }} />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            {highlights.length < 5 && (
              <div className="flex gap-2">
                <input
                  value={newHl}
                  onChange={(e) => setNewHl(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addHighlight()}
                  placeholder="Ex: Bebidas inclusas"
                  className="flex-1 bg-white/[0.04] border border-white/10 rounded-lg px-3 py-2 text-white text-sm placeholder:text-white/30 outline-none focus:border-white/40"
                />
                <button
                  onClick={addHighlight}
                  disabled={!newHl.trim()}
                  className="px-4 py-2 rounded-lg font-bold text-black flex items-center gap-1.5 text-sm disabled:opacity-40 disabled:cursor-not-allowed transition-all hover:brightness-110"
                  style={{ background: secondaryColor }}
                >
                  <Plus className="w-4 h-4" /> Adicionar
                </button>
              </div>
            )}
            <p className="text-[10px] text-white/40 mt-1.5">
              Pressione Enter ou clique em Adicionar. O novo benefício entrará na próxima geração da arte.
            </p>
          </>
        )}


        <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3 text-[11px] text-amber-200/90">
          💡 Dados da Fase 1: <strong>{state.agencyName || "agência"}</strong>
          {state.city && <> · {state.city}</>}
          {state.niche && <> · nicho {state.niche}</>}
          {!state.logoBase64 && <> · <span className="text-amber-300">sem logo (será usado o nome como wordmark)</span></>}
        </div>

        <button
          onClick={() => generateNext()}
          disabled={loading || !destination}
          className="w-full py-4 rounded-xl font-bold text-black flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed transition-all hover:brightness-110"
          style={{ background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`, boxShadow: `0 8px 24px ${primaryColor}55` }}
        >
          {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Gerando com IA...</> : <><Sparkles className="w-4 h-4" /> Gerar Anúncio</>}
        </button>
        {loading && <p className="text-xs text-white/50 text-center mt-1">A IA leva 8 a 25 segundos.</p>}
      </div>

      {generatedImages.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className={sectionCls}>
          <h3 className="text-xs font-bold text-white/60 uppercase tracking-widest mb-4">
            Seu anúncio
          </h3>
          <div className={
            generatedImages.length === 1 ? "mb-4" :
            generatedImages.length === 2 ? "grid grid-cols-2 gap-3 mb-4" :
            "grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4"
          }>
            {generatedImages.map((img, idx) => (
              <div
                key={idx}
                className={`rounded-xl overflow-hidden bg-black/40 mx-auto ${
                  generatedImages.length > 1 ? "w-full" : (format === "square" ? "max-w-md" : "max-w-xs")
                }`}
              >
                <img src={img} alt={`Anúncio ${idx + 1}`} className="w-full h-auto block" />
              </div>
            ))}
          </div>
          {generatedImages.length >= 3 && (
            <p className="text-[11px] text-amber-300/80 text-center mb-2">
              Limite de 3 variações atingido. Ao gerar uma nova, a mais antiga será substituída.
            </p>
          )}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => {
                const target = generatedImages[generatedImages.length - 1];
                if (!target) return;
                const a = document.createElement("a");
                a.href = target;
                a.download = `anuncio-${(destination || "destino").toLowerCase().replace(/\s+/g, "-")}-${format}-${generatedImages.length}.png`;
                document.body.appendChild(a); a.click(); a.remove();
              }}
              className="flex-1 py-4 rounded-xl font-bold text-black flex items-center justify-center gap-2 transition-all hover:brightness-110"
              style={{ background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`, boxShadow: `0 8px 24px ${primaryColor}55` }}
            >
              <Download className="w-4 h-4" /> Baixar imagem
            </button>
            <button
              onClick={() => generateNext()}
              disabled={loading}
              className="flex-1 py-4 rounded-xl font-bold text-black flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed transition-all hover:brightness-110"
              style={{ background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`, boxShadow: `0 8px 24px ${primaryColor}55` }}
            >
              {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Gerando...</> : <><Sparkles className="w-4 h-4" /> Gerar nova variação</>}
            </button>
          </div>
        </motion.div>
      )}

      <div className="flex gap-3">
        <button onClick={onBack} className="flex-1 py-4 rounded-xl bg-white/[0.04] border border-white/10 text-white/70 font-semibold hover:bg-white/[0.08] transition-colors">
          Voltar
        </button>
        <button onClick={onNext} className="flex-[2] py-4 rounded-xl bg-white/[0.04] border border-white/10 text-white/80 font-semibold hover:bg-white/[0.08] flex items-center justify-center gap-2">
          Avançar para Fase 4 — Seu Site <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
