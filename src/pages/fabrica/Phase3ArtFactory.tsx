import { useState, useRef } from "react";
import { useFabricaContext } from "@/hooks/useFabricaContext";
import { type StrategyId } from "@/data/fabrica-prompts";
import { CATEGORIAS, getCategoria, pickPromptsForCategoria, type CategoriaId } from "@/data/fabrica-categories";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { composeTravelAd, type PaymentMode } from "@/lib/fabrica-compose-art";
import {
  Loader2, Download, Sparkles, ArrowRight, Plus, X,
  Bus, Hotel, Plane, Check, Star, Heart, Sun, Camera, MapPin, Utensils, Ship, Palmtree, Coffee, Wifi, User,
  Square, Smartphone, Image as ImageIcon, Upload, Link2, Search, Wand2,
} from "lucide-react";
import { toast } from "sonner";

type GenMode = "ai" | "photo" | "custom";
type CustomSource = "upload" | "link";

interface Props { onNext: () => void; }

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
  "#0c2340", "#1d4ed8", "#2563eb", "#3b82f6",
  "#dc2626", "#991b1b", "#e85d3a", "#ff6b35",
  "#064e3b", "#0d7a5f", "#16a34a", "#22c55e",
  "#0a0a0a", "#1e293b", "#7c3aed", "#a855f7",
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
  { id: "installments",  name: "Parcelado",          emoji: "💳", description: "Ex: 10x R$ 149,90",            hint: "Parcelas: 10x · Valor: 149,90" },
  { id: "cash",          name: "À vista",            emoji: "💰", description: "Ex: À VISTA R$ 1.499",         hint: "Valor: 1.499" },
  { id: "cash_discount", name: "À vista c/ desconto",emoji: "🏷️", description: "Ex: À VISTA · 5% OFF",          hint: "Valor já com desconto" },
  { id: "from",          name: "A partir de",        emoji: "🚀", description: "Ex: A PARTIR DE R$ 1.499",     hint: "Valor mínimo do pacote" },
  { id: "daily",         name: "Diária",             emoji: "🛏️", description: "Ex: R$ 149/diária",             hint: "Valor por diária" },
  { id: "monthly",       name: "Mensal",             emoji: "📅", description: "Ex: R$ 149/mês",                hint: "Valor por mês" },
  { id: "down_plus",     name: "Entrada + parcelas", emoji: "💵", description: "Ex: ENTRADA + 10x R$ 149",      hint: "Parcelas (rótulo): ENTRADA R$ 200 + 10x · Valor: 149" },
  { id: "free_quote",    name: "Sob consulta",       emoji: "💬", description: "Ex: CONSULTE no WhatsApp",      hint: "Sem valor — direciona pra conversa" },
  { id: "custom_label",  name: "Personalizado",      emoji: "✏️", description: "Você escreve o rótulo livre",   hint: "Label livre + Valor" },
];

const CATEGORY_LOCAL_STRATEGIES: Record<CategoriaId, StrategyId[]> = {
  oferta_pacote: ["matriz", "gancho", "ancora", "vitrine"],
  experiencia_destino: ["experiencia_hero", "experiencia_editorial", "experiencia_postcard", "experiencia_lifestyle"],
};

const scopedGenerationKey = (categoria: CategoriaId, genMode: GenMode, format: "square" | "story") =>
  `fabrica_generation_cycle_${categoria}_${genMode}_${format}`;

const scopedTemplateKey = (type: "last" | "recent", categoria: CategoriaId, genMode: GenMode) =>
  `fabrica_${type}_template_ids_${categoria}_${genMode}`;

const pickDistinctLocalStrategies = (categoria: CategoriaId, seed: number, count = 2): StrategyId[] => {
  const pool = CATEGORY_LOCAL_STRATEGIES[categoria];
  return Array.from({ length: Math.min(count, pool.length) }, (_, idx) => pool[(seed + idx) % pool.length]);
};

const pickPhotoRefs = (
  photos: Array<{ id: number; url: string; thumb: string; alt: string }>,
  selectedPhotoUrl: string,
  seed: number,
  count: number,
) => {
  const unique = Array.from(new Set(photos.map((p) => p.url).filter(Boolean)));
  if (unique.length === 0) return Array.from({ length: count }, () => selectedPhotoUrl);
  const selectedIdx = Math.max(0, unique.findIndex((url) => url === selectedPhotoUrl));
  const start = unique.length > 1 ? (selectedIdx + seed) % unique.length : selectedIdx;
  return Array.from({ length: count }, (_, idx) => unique[(start + idx) % unique.length] || selectedPhotoUrl);
};

export const Phase3ArtFactory = ({ onNext }: Props) => {
  const { state, update } = useFabricaContext();
  const [categoria, setCategoria] = useState<CategoriaId>("oferta_pacote");
  const strategy: StrategyId = getCategoria(categoria).legacyStrategy;
  const [lastTemplateId, setLastTemplateId] = useState<string | null>(() => localStorage.getItem("fabrica_last_template_id"));
  const [recentTemplateIds, setRecentTemplateIds] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem("fabrica_recent_template_ids") || "[]"); }
    catch { return []; }
  });
  const [format, setFormat] = useState<"square" | "story">("story");
  const [destination, setDestination] = useState(state.destinos?.[0] || "");
  const [price, setPrice] = useState("149,90");
  const [installments, setInstallments] = useState("10x");
  const [promoName, setPromoName] = useState("OFERTA ESPECIAL");
  const [paymentMode, setPaymentMode] = useState<PaymentMode>("installments");
  const [paymentLabel, setPaymentLabel] = useState("");
  const [paymentSuffix, setPaymentSuffix] = useState("");
  const [primaryColor, setPrimaryColor] = useState(state.primaryColor || "#0c2340");
  const [secondaryColor, setSecondaryColor] = useState("#FCD34D");
  const [highlights, setHighlights] = useState<Highlight[]>(DEFAULT_HIGHLIGHTS);
  const [editingIconIdx, setEditingIconIdx] = useState<number | null>(null);
  const [newHl, setNewHl] = useState("");
  const [loading, setLoading] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string>("");
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [variationCounter, setVariationCounter] = useState(0);
  const [lastProvider, setLastProvider] = useState<"user_gemini" | "lovable_ai" | null>(null);
  const [generationCount, setGenerationCount] = useState<number>(() => {
    const saved = localStorage.getItem("fabrica_gen_count");
    return saved ? parseInt(saved, 10) : 0;
  });

  // ===== Modo de geração =====
  const [genMode, setGenMode] = useState<GenMode>("photo");
  // Foto Real (Pexels)
  const [photoQuery, setPhotoQuery] = useState("");
  const [photos, setPhotos] = useState<Array<{ id: number; url: string; thumb: string; alt: string }>>([]);
  const [selectedPhotoUrl, setSelectedPhotoUrl] = useState<string>("");
  const [searchingPhotos, setSearchingPhotos] = useState(false);
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
    try {
      const { data, error } = await supabase.functions.invoke("fabrica-search-photos", {
        body: { query: q, orientation: format === "story" ? "portrait" : "square", perPage: 24 },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      const results = data?.photos || [];
      const rotationKey = `fabrica_photo_search_rotation_${q.toLowerCase()}_${format}`;
      const rotation = Number.parseInt(localStorage.getItem(rotationKey) || "0", 10) || 0;
      localStorage.setItem(rotationKey, String(rotation + 5));
      const rotated = results.length ? [...results.slice(rotation % results.length), ...results.slice(0, rotation % results.length)] : [];
      setPhotos(rotated);
      if (!data?.photos?.length) toast.warning("Nenhuma foto encontrada — tente outro termo");
    } catch (err: any) {
      toast.error(err?.message || "Erro ao buscar fotos");
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

  const generate = async (forceVariation?: number) => {
    if (!destination.trim()) {
      toast.error("Digite o destino do anúncio");
      return;
    }
    setLoading(true);
    setGeneratedImage("");
    setGeneratedImages([]);
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

      // ===== MODO FOTO (composição local) — gera 2 variações =====
      if (genMode === "photo") {
        toast.info("Gerando 2 variações com foto real");
        const chosen = pickDistinctLocalStrategies(categoria, generationSeed, 2);
        const photoRefs = pickPhotoRefs(photos, refImage, generationSeed, chosen.length);

        const composed = await Promise.all(
          chosen.map(async (localStrategy, idx) => {
            let img = await composeTravelAd({
              imageUrl: photoRefs[idx],
              format,
              destination,
              city: state.city,
              primaryColor,
              secondaryColor,
              price,
              installments,
              promoName,
              highlights,
              hasLogo: !!state.logoBase64,
              paymentMode,
              paymentLabel: paymentLabel || undefined,
              paymentSuffix: paymentSuffix || undefined,
              strategy: localStrategy,
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

        setGeneratedImage(composed[0]);
        setGeneratedImages(composed);
        update({ generatedAdImage: composed[0], primaryColor });

        const newCount = generationCount + composed.length;
        setGenerationCount(newCount);
        localStorage.setItem("fabrica_gen_count", String(newCount));
        finishCycle(composed.length);

        toast.success("2 variações geradas com foto real!");
        return;
      }

      // ===== MODO IA PURA: gera 2 imagens escolhendo prompts distintos da categoria =====
      if (genMode === "ai") {
        const cat = getCategoria(categoria);
        const isAiExperienceStory = categoria === "experiencia_destino" && format === "story";
        const categoryLastKey = scopedTemplateKey("last", categoria, genMode);
        const categoryRecentKey = scopedTemplateKey("recent", categoria, genMode);
        const storedLast = localStorage.getItem(categoryLastKey) || (cat.prompts.some((p) => p.templateId === lastTemplateId) ? lastTemplateId : null);
        let storedRecent: string[] = [];
        try { storedRecent = JSON.parse(localStorage.getItem(categoryRecentKey) || "[]"); }
        catch { storedRecent = []; }
        const picks = isAiExperienceStory
          ? [{ code: "ED_SAFE_STORY", templateId: "photo_only_experience_story" }]
          : pickPromptsForCategoria(categoria, 2, storedLast, storedRecent);

        toast.info(`Gerando ${picks.length} ${picks.length === 1 ? "variação" : "variações"} em IA Pura — ${cat.name}`);

        const results = await Promise.all(
          picks.map((pick, idx) => supabase.functions.invoke("fabrica-generate-ad", {
            body: {
              strategy,
              format,
              destination,
              niche: state.niche,
              agencyName: state.agencyName,
              agencyType: state.agencyType === "outro" ? state.agencyTypeOther : state.agencyType,
              city: state.city,
              primaryColor,
              secondaryColor,
              hasLogo: !!state.logoBase64,
              price,
              installments,
              promoName,
              highlights,
              ctaText: state.whatsapp ? "Reserve no WhatsApp" : "Reserve agora",
              templateId: isAiExperienceStory ? undefined : pick.templateId,
              photoOnly: isAiExperienceStory,
              variation: generationSeed + idx,
              packageType: "Voo + Hotel",
              duration: "5 NOITES",
            },
          }))
        );

        const images: string[] = [];
        let providerSeen: "user_gemini" | "lovable_ai" | null = null;
        const { reframeImageToAspect } = await import("@/lib/fabrica-compose-art");
        for (const result of results) {
          if (result.error) throw result.error;
          if (result.data?.error) throw new Error(result.data.error);
          if (!result.data?.image) throw new Error("Nenhuma imagem foi gerada. Cheque os créditos de IA.");
          let img = result.data.image as string;
          try { img = await reframeImageToAspect(img, format); }
          catch (e) { console.warn("reframe failed", e); }
          if (isAiExperienceStory) {
            img = await composeTravelAd({
              imageUrl: img,
              format,
              destination,
              city: state.city,
              primaryColor,
              secondaryColor,
              price,
              installments,
              promoName,
              highlights,
              hasLogo: !!state.logoBase64,
              paymentMode,
              paymentLabel: paymentLabel || undefined,
              paymentSuffix: paymentSuffix || undefined,
              strategy: "experiencia_hero",
            });
          }
          images.push(img);
          if (result.data.provider) providerSeen = result.data.provider;
        }

        setGeneratedImages(images);
        setGeneratedImage(images[0]);
        update({ generatedAdImage: images[0], primaryColor });
        if (providerSeen) setLastProvider(providerSeen);

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

      // ===== MODO CUSTOM (link/upload do usuário) — gera 2 variações locais, sem gastar créditos de IA =====
      toast.info("Gerando 2 variações com sua imagem");
      const chosen = pickDistinctLocalStrategies(categoria, generationSeed, 2);

      const imagesCustom = await Promise.all(
        chosen.map(async (localStrategy) => {
          let img = await composeTravelAd({
            imageUrl: refImage,
            format,
            destination,
            city: state.city,
            primaryColor,
            secondaryColor,
            price,
            installments,
            promoName,
            highlights,
            hasLogo: !!state.logoBase64,
            paymentMode,
            paymentLabel: paymentLabel || undefined,
            paymentSuffix: paymentSuffix || undefined,
            strategy: localStrategy,
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

      setGeneratedImage(imagesCustom[0]);
      setGeneratedImages(imagesCustom);
      update({ generatedAdImage: imagesCustom[0], primaryColor });

      const newCount = generationCount + imagesCustom.length;
      setGenerationCount(newCount);
      localStorage.setItem("fabrica_gen_count", String(newCount));
      finishCycle(imagesCustom.length);

      toast.success("2 variações geradas com sua imagem!");

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
    generate(next);
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

  const sectionCls = "bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6 backdrop-blur-xl";
  const labelCls = "text-[11px] text-white/60 uppercase tracking-wider font-semibold block mb-1.5";
  const inputCls = "w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 outline-none focus:border-white/40";

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Banner de provedor de IA */}
      <div className={`rounded-2xl p-4 border backdrop-blur-xl ${
        lastProvider === "user_gemini"
          ? "bg-emerald-500/10 border-emerald-500/30"
          : lastProvider === "lovable_ai"
            ? "bg-blue-500/10 border-blue-500/30"
            : "bg-white/[0.03] border-white/10"
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

      {/* 0 · Modo de geração */}
      <div className={sectionCls}>
        <h3 className="text-xs font-bold text-white/60 uppercase tracking-widest mb-4">0 · Como criar a imagem</h3>
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => setGenMode("photo")}
            className={`p-3 rounded-xl border-2 text-left transition-all ${genMode === "photo" ? "" : "border-white/[0.08] bg-white/[0.02] hover:border-white/15"}`}
            style={genMode === "photo" ? { borderColor: primaryColor, background: `${primaryColor}1a` } : undefined}
          >
            <ImageIcon className="w-5 h-5 mb-1.5 text-white/80" />
            <div className="text-[12px] font-bold text-white">Foto Real <span className="text-emerald-400">(grátis)</span></div>
            <div className="text-[10px] text-white/50 leading-tight">Banco Pexels — lugares reais</div>
          </button>
          <button
            onClick={() => setGenMode("custom")}
            className={`p-3 rounded-xl border-2 text-left transition-all ${genMode === "custom" ? "" : "border-white/[0.08] bg-white/[0.02] hover:border-white/15"}`}
            style={genMode === "custom" ? { borderColor: primaryColor, background: `${primaryColor}1a` } : undefined}
          >
            <Upload className="w-5 h-5 mb-1.5 text-white/80" />
            <div className="text-[12px] font-bold text-white">Sua imagem</div>
            <div className="text-[10px] text-white/50 leading-tight">Upload ou link</div>
          </button>
          <button
            onClick={() => setGenMode("ai")}
            className={`p-3 rounded-xl border-2 text-left transition-all ${genMode === "ai" ? "" : "border-white/[0.08] bg-white/[0.02] hover:border-white/15"}`}
            style={genMode === "ai" ? { borderColor: primaryColor, background: `${primaryColor}1a` } : undefined}
          >
            <Wand2 className="w-5 h-5 mb-1.5 text-white/80" />
            <div className="text-[12px] font-bold text-white">IA Pura</div>
            <div className="text-[10px] text-white/50 leading-tight">Cria do zero (usa créditos)</div>
          </button>
        </div>
        {genMode !== "ai" && (
          <p className="text-[10px] text-white/40 mt-2 leading-snug">
            🔒 Sua imagem é usada <strong>apenas em memória</strong> para gerar o anúncio — nada é armazenado no banco de dados.
          </p>
        )}
      </div>

      {/* 1 · Categoria do anúncio (todos os modos) */}
      <div className={sectionCls}>
        <h3 className="text-xs font-bold text-white/60 uppercase tracking-widest mb-1">1 · Categoria do anúncio</h3>
        <p className="text-[11px] text-white/45 mb-4">Escolha o tipo de anúncio que deseja gerar.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {CATEGORIAS.map((c) => {
            const selected = categoria === c.id;
            return (
              <button
                key={c.id}
                onClick={() => setCategoria(c.id)}
                className={`p-5 rounded-2xl border-2 text-left transition-all ${
                  selected ? "" : "border-white/[0.08] bg-white/[0.02] hover:border-white/15"
                }`}
                style={selected ? { borderColor: c.accent, background: `${c.accent}1a` } : undefined}
              >
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-2xl leading-none">{c.emoji}</span>
                  <span
                    className="text-[10px] font-extrabold px-2 py-0.5 rounded border tracking-wider"
                    style={{ background: `${c.accent}26`, borderColor: `${c.accent}66`, color: c.accent }}
                  >
                    {c.badge}
                  </span>
                </div>
                <div className="text-base font-bold text-white mb-1.5 leading-tight">{c.name}</div>
                <p className="text-[12px] text-white/60 leading-snug mb-3">{c.description}</p>
                <div className="flex flex-wrap gap-1.5">
                  {c.focus.map((f) => (
                    <span key={f} className="text-[10px] px-2 py-0.5 rounded-full bg-white/[0.06] text-white/70 border border-white/10 whitespace-nowrap">
                      {f}
                    </span>
                  ))}
                </div>
              </button>
            );
          })}
        </div>
        <div className="mt-4 rounded-xl border border-white/10 bg-white/[0.03] p-3 text-[11px] text-white/55 leading-snug">
          <strong className="text-white/80">Regra fixa:</strong> Foto Real e Sua imagem geram 2 variações; IA Pura gera 1 para economizar créditos. Oferta destaca preço e conversão; Experiência destaca foto, emoção e estilo editorial.
        </div>
      </div>

      {/* 1b · Galeria Pexels (modo foto) */}
      {genMode === "photo" && (
        <div className={sectionCls}>
          <h3 className="text-xs font-bold text-white/60 uppercase tracking-widest mb-4">1 · Escolha uma foto real</h3>

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
          {photos.length > 0 && (
            <div className="grid grid-cols-3 gap-2">
              {photos.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setSelectedPhotoUrl(p.url)}
                  className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                    selectedPhotoUrl === p.url ? "scale-95" : "border-white/10 hover:border-white/30"
                  }`}
                  style={selectedPhotoUrl === p.url ? { borderColor: primaryColor } : undefined}
                >
                  <img src={p.thumb} alt={p.alt} className="w-full h-full object-cover" />
                  {selectedPhotoUrl === p.url && (
                    <div className="absolute inset-0 flex items-center justify-center" style={{ background: `${primaryColor}aa` }}>
                      <Check className="w-8 h-8 text-white" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}
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
        <h3 className="text-xs font-bold text-white/60 uppercase tracking-widest mb-4">2 · Formato</h3>
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

        {/* Modo de pagamento */}
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
                className={`p-2 rounded-lg border-2 text-left transition-all ${
                  paymentMode === p.id ? "" : "border-white/[0.08] bg-white/[0.02] hover:border-white/15"
                }`}
                style={paymentMode === p.id ? { borderColor: secondaryColor, background: `${secondaryColor}1a` } : undefined}
                title={p.description}
              >
                <div className="text-base leading-none mb-1">{p.emoji}</div>
                <div className="text-[11px] font-bold text-white leading-tight">{p.name}</div>
                <div className="text-[9px] text-white/45 leading-tight mt-0.5">{p.description}</div>
              </button>
            ))}
          </div>
          <p className="text-[10px] text-white/40 mb-2">{PAYMENT_PRESETS.find((p) => p.id === paymentMode)?.hint}</p>

          {/* Campos dinâmicos */}
          {paymentMode === "free_quote" ? (
            <div>
              <label className={labelCls}>Texto de chamada (sufixo)</label>
              <input
                value={paymentSuffix}
                onChange={(e) => setPaymentSuffix(e.target.value)}
                placeholder="no WhatsApp"
                className={inputCls}
              />
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>
                  {paymentMode === "installments" || paymentMode === "down_plus" ? "Parcelas / Rótulo" :
                   paymentMode === "custom_label" ? "Rótulo livre" : "Rótulo (opcional)"}
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
                    paymentMode === "cash" ? "À VISTA" :
                    paymentMode === "cash_discount" ? "À VISTA · 5% OFF" :
                    paymentMode === "from" ? "A PARTIR DE" :
                    paymentMode === "daily" ? "DIÁRIA POR" :
                    paymentMode === "monthly" ? "MENSAL POR" :
                    "Rótulo"
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
          )}

          {(paymentMode === "daily" || paymentMode === "monthly" || paymentMode === "custom_label") && (
            <div className="mt-3">
              <label className={labelCls}>Sufixo (opcional, ex: /pessoa, /diária, /mês)</label>
              <input
                value={paymentSuffix}
                onChange={(e) => setPaymentSuffix(e.target.value)}
                placeholder={paymentMode === "daily" ? "/diária" : paymentMode === "monthly" ? "/mês" : "/pessoa"}
                className={inputCls}
              />
            </div>
          )}
        </div>

        {/* Cor primária — agora editável */}
        <div>
          <label className={labelCls}>Cor primária (fundo principal)</label>
          <div className="flex gap-2 items-center mb-2">
            <input type="color" value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} className="w-12 h-10 rounded-lg border border-white/10 bg-transparent cursor-pointer" />
            <input value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} className="flex-1 bg-white/[0.04] border border-white/10 rounded-xl px-4 py-2 text-white text-sm outline-none focus:border-white/40 font-mono" />
          </div>
          <div className="flex flex-wrap gap-1.5">
            {PRESET_COLORS.map((c) => (
              <button
                key={c}
                onClick={() => setPrimaryColor(c)}
                className={`w-7 h-7 rounded-md border-2 transition-all ${primaryColor.toLowerCase() === c.toLowerCase() ? "border-white scale-110" : "border-white/20 hover:border-white/40"}`}
                style={{ background: c }}
                aria-label={c}
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

        {/* Benefícios totalmente editáveis (texto + ícone) */}
        <div>
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
        </div>

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
          <div className={generatedImages.length > 1 ? "grid grid-cols-2 gap-3 mb-4" : "mb-4"}>
            {generatedImages.map((img, idx) => (
              <div
                key={idx}
                className={`rounded-xl overflow-hidden bg-black/40 mx-auto ${
                  generatedImages.length > 1 ? "w-full" : (format === "square" ? "max-w-md" : "max-w-xs")
                }`}
              >
                <img src={img} alt={`Anúncio ${idx + 1}`} className="w-full h-auto block" />
                <button
                  onClick={() => {
                    const a = document.createElement("a");
                    a.href = img;
                    a.download = `anuncio-${(destination || "destino").toLowerCase().replace(/\s+/g, "-")}-${idx + 1}.png`;
                    document.body.appendChild(a); a.click(); a.remove();
                  }}
                  className="w-full py-2 bg-white text-black text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-white/90"
                >
                  <Download className="w-3 h-3" /> Baixar #{idx + 1}
                </button>
              </div>
            ))}
          </div>
          <button
            onClick={() => generateNext()}
            disabled={loading}
            className="w-full py-2.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-white/80 text-sm font-semibold border border-white/10 flex items-center justify-center gap-2"
          >
            <Sparkles className="w-3.5 h-3.5" /> Gerar novo anúncio (template aleatório)
          </button>
        </motion.div>
      )}

      <button onClick={onNext} className="w-full py-3 rounded-xl bg-white/[0.04] border border-white/10 text-white/80 font-semibold hover:bg-white/[0.08] flex items-center justify-center gap-2">
        Avançar para Fase 4 — Seu Site <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
};
