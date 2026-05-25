import { createContext, useContext, useState, useEffect, ReactNode, useCallback, useRef } from "react";
import type { Context } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export type Niche = "nordeste" | "sul" | "internacional" | "cruzeiro" | "aventura" | "luademel" | "";

export interface ScoreBreakdown {
  presenca: number;
  conteudo: number;
  vendas: number;
  trafego: number;
  conversao: number;
}

export interface Gargalo {
  dimension: string;
  level: "red" | "amber" | "green";
  text: string;
}

export interface Pacote {
  id: string;
  title: string;
  description: string;
  price: string;
  imageUrl?: string;
  ctaLabel?: string;
}

export interface Depoimento {
  name: string;
  text: string;
}

export type SocialType = "instagram" | "facebook" | "tiktok" | "youtube" | "google" | "linkedin" | "x" | "site";

export interface SocialLink {
  id: string;
  type: SocialType;
  url: string;
}

export interface SectionVisibility {
  hero: boolean;
  processo: boolean;
  destinos: boolean;
  porQue: boolean;
  depoimentos: boolean;
  orcamento: boolean;
  faq: boolean;
  finalCta: boolean;
}

export interface SiteContent {
  heroHeadline: string;
  heroSubheadline: string;
  heroCtaLabel: string;
  pacotesTitle: string;
  depoimentosTitle: string;
  faqTitle: string;
  finalCtaTitle: string;
  finalCtaLabel: string;
  faq: Array<{ q: string; a: string }>;
  heroImageUrl?: string; // Imagem de fundo do banner principal do site
  galleryImages: string[]; // banco de imagens geradas pra reuso
  vercelUrl?: string; // URL do site publicado no Vercel
  sections: SectionVisibility;
  animationEffect?: "none" | "neve" | "confete" | "junina_bandeiras" | "natal_luzes" | "eco_folhas" | "praia_bolhas" | "junina_baloes" | "junina_fagulhas" | "natal_estrela" | "reveillon_fogos" | "reveillon_poeira" | "carnaval_mascaras" | "pascoa_orelhas" | "pascoa_pegadas" | "praia_ondas" | "praia_sol" | "eco_borboletas" | "cruzeiro_navio" | "cruzeiro_gotas" | "internacional_aviao" | "internacional_bussola" | "luxo_aurora" | "luxo_reflexo";
  animationLocation?: "all" | "buttons" | "cards" | "footer";
  animationDuration?: "5" | "10" | "30" | "always";
  aboutImageUrl?: string; // Imagem da seção Sobre/Equipe do site
  
  // NOVOS CAMPOS PARA EDIÇÃO 100%
  heroEyebrow?: string;
  processoEyebrow?: string;
  processoTitle?: string;
  processoSteps?: Array<{ num: string; title: string; desc: string }>;
  destinosEyebrow?: string;
  equipeBadge?: string;
  equipeEyebrow?: string;
  equipeTitle?: string;
  equipeIntro?: string;
  equipeFeatures?: Array<{ icon: string; title: string; desc: string }>;
  orcamentoEyebrow?: string;
  orcamentoTitle?: string;
  orcamentoText?: string;
  atendimentoText?: string;
  footerText?: string;
}

export type AgencyType =
  | "autonoma"
  | "pequena"
  | "media"
  | "franquia"
  | "consolidadora"
  | "receptiva"
  | "milhas"
  | "luxo"
  | "corporativa"
  | "grupos"
  | "cruzeiros"
  | "ecoturismo"
  | "religioso"
  | "outro"
  | "";

export interface FabricaState {
  // Dados agência
  agencyName: string;
  agencyType: AgencyType;
  agencyTypeOther: string;
  city: string;
  instagram: string;
  socialLinks: SocialLink[];
  whatsapp: string;          // número nacional (sem DDI)
  whatsappDialCode: string;  // DDI em dígitos: "55", "1", "351"...
  whatsappCountryCode: string; // ISO code: "BR", "US", "PT"...
  agencyEmail: string;
  niche: Niche;
  destinos: string[]; // destinos específicos vendidos pela agência
  logoBase64: string;
  address?: string;

  // Diagnóstico
  postFrequency: string; // "diario" | "semanal" | "mensal" | "raro"
  followers: string; // "0-500" | "500-2k" | "2k-10k" | "10k+"
  usesReels: boolean;
  hasHighlights: boolean;
  ticketMedio: string; // numeric
  fechamentosMes: string;
  hasDepoimentos: boolean;
  investeAds: boolean;
  hasPeople: boolean; // "Aparecem pessoas reais nas redes?"
  contentStrategy: string; // "promo" | "misto"
  instagramPosts?: string; // "less_10" | "10_20" | "20_50" | "50_200" | "200_500" | "more_500"
  hasBioLink?: boolean;
  whatsappGroupActive?: boolean;
  usesVoiceovers?: boolean;
  publishesNews?: boolean;
  usesFabricaTemplates?: boolean;

  // Resultado
  digitalScore: number;
  scoreBreakdown: ScoreBreakdown;
  level: number; // 1-5
  gargalos: Gargalo[];

  // Outros
  selectedPackages: Pacote[];
  depoimentos: Depoimento[];
  primaryColor: string;
  secondaryColor: string;
  backgroundColor?: string;
  sectionOrder?: string[];
  currentPhase: number;
  checklist30days: Record<string, boolean>;
  diagnosticoCompleto: boolean;
  generatedAdImage: string; // base64 da imagem gerada na Fase 3
  lastCleanPhoto?: string; // foto limpa do destino gerada na Fase 3 (sem texto do anúncio)
  allGeneratedAdImages?: string[]; // lista de todas as artes geradas pelo usuário
  siteContent: SiteContent;

  // Persistência da Fase 3 (para não resetar ao voltar)
  lastCategoria?: string;
  lastFormat?: "square" | "story";
  lastPrice?: string;
  lastInstallments?: string;
  lastPromoName?: string;
  lastHighlights?: any[];
  lastPaymentMode?: any;
  lastPaymentLabel?: string;
  lastPaymentSuffix?: string;
  lastCurrency?: string;
  lastAdTitle?: string;
  lastTravelPeriod?: string;
  // V3: opções extras de preço/total
  hideCents?: boolean;
  showTotal?: boolean;
  totalOverride?: string;
  // V3: faixa do Pix (editável)
  showPixBanner?: boolean;
  pixBannerText?: string;
  // Tipografia global do anúncio
  fontFamily?: string;
  titleScale?: number;
  descScale?: number;
  textColorOverride?: string;
   footerContact1Icon?: "whatsapp_green" | "whatsapp_custom" | "instagram_gradient" | "instagram_custom" | "website" | "none";
  footerContact1Value?: string;
  footerContact2Icon?: "whatsapp_green" | "whatsapp_custom" | "instagram_gradient" | "instagram_custom" | "website" | "none";
  footerContact2Value?: string;
  lastEditedAt?: string;
  leadStatuses?: Record<string, string>;
}

const defaultState: FabricaState = {
  agencyName: "",
  agencyType: "",
  agencyTypeOther: "",
  city: "",
  instagram: "",
  socialLinks: [],
  whatsapp: "",
  whatsappDialCode: "55",
  whatsappCountryCode: "BR",
  agencyEmail: "",
  niche: "",
  destinos: [],
  logoBase64: "",
  address: "",
  postFrequency: "",
  followers: "",
  usesReels: false,
  hasHighlights: false,
  ticketMedio: "",
  fechamentosMes: "",
  hasDepoimentos: false,
  investeAds: false,
  hasPeople: false,
  contentStrategy: "promo",
  instagramPosts: "less_10",
  hasBioLink: false,
  whatsappGroupActive: false,
  usesVoiceovers: false,
  publishesNews: false,
  usesFabricaTemplates: false,
  digitalScore: 0,
  scoreBreakdown: { presenca: 0, conteudo: 0, vendas: 0, trafego: 0, conversao: 0 },
  level: 1,
  gargalos: [],
  selectedPackages: [],
  depoimentos: [],
  primaryColor: "#F59E0B",
  secondaryColor: "#FCD34D",
  backgroundColor: "#F4F6F9",
  sectionOrder: ["hero", "processo", "destinos", "porQue", "depoimentos", "orcamento", "faq"],
  currentPhase: 1,
  checklist30days: {},
  diagnosticoCompleto: false,
  generatedAdImage: "",
  lastCleanPhoto: "",
  allGeneratedAdImages: [],
  siteContent: {
    heroHeadline: "",
    heroSubheadline: "",
    heroCtaLabel: "Falar no WhatsApp",
    pacotesTitle: "Nossos Pacotes",
    depoimentosTitle: "Quem viajou recomenda",
    faqTitle: "Perguntas Frequentes",
    finalCtaTitle: "Pronto para sua próxima viagem?",
    finalCtaLabel: "Chamar no WhatsApp",
    faq: [
      { q: "Vocês parcelam?", a: "Sim! Em até 12x no cartão de crédito, sem juros em condições selecionadas." },
      { q: "É seguro contratar com vocês?", a: "Somos uma agência regularizada com CNPJ ativo e parceria direta com operadoras." },
      { q: "E se eu precisar cancelar?", a: "Cada pacote tem sua política. Você recebe o contrato com tudo claro antes de fechar." },
      { q: "Como tira dúvidas?", a: "Atendimento direto pelo WhatsApp, com resposta em até 1h em horário comercial." },
    ],
    heroImageUrl: "",
    galleryImages: [],
    vercelUrl: "",
    sections: {
      hero: true,
      processo: true,
      destinos: true,
      porQue: true,
      depoimentos: true,
      orcamento: true,
      faq: true,
      finalCta: true,
    },
    animationEffect: "none",
    animationLocation: "all",
    animationDuration: "always",
    aboutImageUrl: "https://img.freepik.com/fotos-gratis/voce-esta-pronto-para-suas-ferias-representante-de-vendas-dando-passaportes-e-passagens-de-aviao-para-uma-jovem-e-um-homem-para-sua-viagem-de-ferias-na-agencia-de-viagens_662251-2215.jpg?semt=ais_hybrid&w=740&q=80",
    
    // Default values for new fields
    heroEyebrow: "Consultoria Premium de Viagens",
    processoEyebrow: "Processo",
    processoTitle: "Sua viagem dos sonhos em 3 passos",
    processoSteps: [
      { num: "1", title: "Consulta Personalizada", desc: "Entendemos seus sonhos, datas, orçamento e estilo em uma conversa de 30 minutos sem compromisso." },
      { num: "2", title: "Curadoria Exclusiva", desc: "Criamos um roteiro 100% personalizado com os melhores hotéis, passeios e experiências para o seu perfil." },
      { num: "3", title: "Embarque Tranquilo", desc: "Cuidamos de passagens, hospedagem, transfers e suporte 24h durante toda a sua viagem." }
    ],
    destinosEyebrow: "Destinos",
    equipeBadge: "+15k Clientes Satisfeitos",
    equipeEyebrow: "Nossa equipe",
    equipeTitle: "Uma equipe dedicada exclusivamente a você",
    equipeIntro: "Cada viagem começa com uma conversa real. Nossa equipe de especialistas conhece os destinos de perto — cada detalhe pensado para o seu perfil, seus sonhos e o seu momento.",
    equipeFeatures: [
      { icon: "🛡️", title: "Segurança e Confiabilidade", desc: "Anos de atuação com milhares de famílias e parceiros verificados mundialmente." },
      { icon: "📞", title: "Suporte 24h Durante a Viagem", desc: "Nossa equipe está disponível a qualquer hora. Qualquer imprevisto, resolvemos." },
      { icon: "✨", title: "Experiências Exclusivas", desc: "Acesso a hotéis e experiências que não estão disponíveis para o público geral." },
      { icon: "💰", title: "Melhor Custo-Benefício", desc: "Nossa rede de parceiros oferece condições especiais que você não encontra em outros lugares." }
    ],
    orcamentoEyebrow: "Orçamento",
    orcamentoTitle: "Fale com um consultor agora",
    orcamentoText: "Preencha o formulário e nossa equipe entrará em contato em até 2 horas com uma proposta personalizada.",
    atendimentoText: "Seg–Sex 8h–20h · Sáb 9h–15h",
    footerText: "Sua parceira ideal para viagens inesquecíveis. Cuidamos de cada detalhe para que você apenas aproveite o momento.",
  },
  lastCategoria: "oferta_pacote",
  lastFormat: "story",
  lastPrice: "149,90",
  lastInstallments: "10x",
  lastPromoName: "OFERTA ESPECIAL",
  lastHighlights: undefined,
  lastPaymentMode: "installments",
  lastPaymentLabel: "",
  lastPaymentSuffix: "por pessoa",
  lastCurrency: "BRL",
  lastAdTitle: "Pacote {destino}",
  lastTravelPeriod: "",
  hideCents: false,
  showTotal: true,
  totalOverride: "",
  showPixBanner: true,
  pixBannerText: "",
  fontFamily: "Inter",
  titleScale: 1,
  descScale: 1,
  textColorOverride: "",
  footerContact1Icon: "whatsapp_green",
  footerContact1Value: "",
  footerContact2Icon: "instagram_gradient",
  footerContact2Value: "",
  lastEditedAt: "",
  leadStatuses: {},
};

const STORAGE_KEY = "fabrica-context-v1";
// Campos pesados (base64) ficam em chaves separadas pra não estourar a quota do localStorage
const HEAVY_KEYS = ["logoBase64", "generatedAdImage", "lastCleanPhoto"] as const;
const HEAVY_STORAGE_PREFIX = "fabrica-heavy-v1:";
const GALLERY_KEY = "fabrica-gallery-v1";
const GENERATED_KEY = "fabrica-generated-v1";
const LAST_ACTIVE_USER_KEY = "fabrica-last-user-id";

const scopedKey = (key: string, userId?: string | null) => (userId ? `${key}:${userId}` : key);
const scopedHeavyPrefix = (userId?: string | null) => (userId ? `${HEAVY_STORAGE_PREFIX}${userId}:` : HEAVY_STORAGE_PREFIX);

const safeSetItem = (key: string, value: string): boolean => {
  try {
    localStorage.setItem(key, value);
    return true;
  } catch {
    return false;
  }
};

const hasMeaningfulProgress = (snapshot?: Partial<FabricaState> | null): boolean => {
  if (!snapshot) return false;
  return Boolean(
    snapshot.agencyName ||
      snapshot.logoBase64 ||
      snapshot.whatsapp ||
      snapshot.instagram ||
      snapshot.agencyEmail ||
      snapshot.address ||
      (snapshot.siteContent?.galleryImages?.length ?? 0) > 0 ||
      (snapshot.allGeneratedAdImages?.length ?? 0) > 0 ||
      (snapshot.selectedPackages?.length ?? 0) > 0 ||
      (snapshot.currentPhase ?? 1) > 1
  );
};

const getStateTimestamp = (snapshot?: Partial<FabricaState> | null, fallback?: string | null): number => {
  const raw = snapshot?.lastEditedAt || fallback || 0;
  return new Date(raw).getTime() || 0;
};

const readPersistedState = (userId?: string | null): FabricaState => {
  if (typeof window === "undefined") return defaultState;

  try {
    const stored = localStorage.getItem(scopedKey(STORAGE_KEY, userId));
    const parsed = stored ? JSON.parse(stored) : {};
    const heavy: Record<string, string> = {};
    const heavyPrefix = scopedHeavyPrefix(userId);

    HEAVY_KEYS.forEach((k) => {
      const v = localStorage.getItem(heavyPrefix + k);
      if (v) heavy[k] = v;
    });

    let gallery: string[] = [];
    try {
      const g = localStorage.getItem(scopedKey(GALLERY_KEY, userId));
      if (g) gallery = JSON.parse(g);
    } catch {}

    let generated: string[] = [];
    try {
      const gen = localStorage.getItem(scopedKey(GENERATED_KEY, userId));
      if (gen) generated = JSON.parse(gen);
    } catch {}

    const explicitAds = new Set(generated);
    const legacyAds = gallery.filter((img) => typeof img === "string" && img.startsWith("data:image/png"));

    if (legacyAds.length > 0) {
      gallery = gallery.filter((img) => typeof img !== "string" || !img.startsWith("data:image/png"));
      const newAds = legacyAds.filter((ad) => !explicitAds.has(ad));
      generated = [...newAds, ...generated];

      try {
        localStorage.setItem(scopedKey(GALLERY_KEY, userId), JSON.stringify(gallery));
        localStorage.setItem(scopedKey(GENERATED_KEY, userId), JSON.stringify(generated));
      } catch {}
    }

    return {
      ...defaultState,
      ...parsed,
      ...heavy,
      allGeneratedAdImages: generated.length ? generated : (parsed.allGeneratedAdImages || []),
      siteContent: {
        ...defaultState.siteContent,
        ...(parsed.siteContent || {}),
        galleryImages: gallery.length ? gallery : (parsed.siteContent?.galleryImages || []),
        sections: {
          ...defaultState.siteContent.sections,
          ...((parsed.siteContent && parsed.siteContent.sections) || {}),
        },
      },
    };
  } catch {
    return defaultState;
  }
};

const loadInitialState = (userId?: string | null): FabricaState => {
  if (typeof window === "undefined") return defaultState;

  const rememberedUserId = userId ?? localStorage.getItem(LAST_ACTIVE_USER_KEY);
  const scopedState = rememberedUserId ? readPersistedState(rememberedUserId) : defaultState;

  if (hasMeaningfulProgress(scopedState)) return scopedState;

  const legacyState = readPersistedState();
  return hasMeaningfulProgress(legacyState) ? legacyState : scopedState;
};

const persistLocalState = (nextState: FabricaState, userId?: string | null) => {
  if (typeof window === "undefined") return;

  const resolvedUserId = userId ?? localStorage.getItem(LAST_ACTIVE_USER_KEY);

  if (resolvedUserId) {
    safeSetItem(LAST_ACTIVE_USER_KEY, resolvedUserId);
  }

  const { logoBase64, generatedAdImage, lastCleanPhoto, allGeneratedAdImages, siteContent, ...rest } = nextState;
  const { galleryImages, ...siteRest } = siteContent;

  safeSetItem(
    scopedKey(STORAGE_KEY, resolvedUserId),
    JSON.stringify({ ...rest, siteContent: siteRest })
  );

  const heavyPrefix = scopedHeavyPrefix(resolvedUserId);

  if (logoBase64) safeSetItem(heavyPrefix + "logoBase64", logoBase64);
  else localStorage.removeItem(heavyPrefix + "logoBase64");

  if (generatedAdImage) safeSetItem(heavyPrefix + "generatedAdImage", generatedAdImage);
  else localStorage.removeItem(heavyPrefix + "generatedAdImage");

  if (lastCleanPhoto) safeSetItem(heavyPrefix + "lastCleanPhoto", lastCleanPhoto);
  else localStorage.removeItem(heavyPrefix + "lastCleanPhoto");

  safeSetItem(scopedKey(GALLERY_KEY, resolvedUserId), JSON.stringify(galleryImages || []));
  safeSetItem(scopedKey(GENERATED_KEY, resolvedUserId), JSON.stringify(allGeneratedAdImages || []));
};

const clearLegacyState = () => {
  if (typeof window === "undefined") return;

  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(GALLERY_KEY);
  localStorage.removeItem(GENERATED_KEY);

  HEAVY_KEYS.forEach((key) => {
    localStorage.removeItem(`${HEAVY_STORAGE_PREFIX}${key}`);
  });
};

interface FabricaContextType {
  state: FabricaState;
  update: (patch: Partial<FabricaState>) => void;
  reset: () => void;
  setPhase: (phase: number) => void;
  toggleChecklist: (key: string) => void;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  syncStatus: "idle" | "saving" | "saved" | "error";
  lastSyncedAt: Date | null;
}

const FABRICA_CONTEXT_KEY = "__CANVA_VIAGEM_FABRICA_CONTEXT__" as const;
const globalFabricaScope = globalThis as typeof globalThis & {
  [FABRICA_CONTEXT_KEY]?: Context<FabricaContextType | undefined>;
};

const FabricaContext =
  globalFabricaScope[FABRICA_CONTEXT_KEY] ??
  (globalFabricaScope[FABRICA_CONTEXT_KEY] = createContext<FabricaContextType | undefined>(undefined));

export const FabricaProvider = ({ children }: { children: ReactNode }) => {
  const { user, loading: authLoading } = useAuth();
  const [state, setState] = useState<FabricaState>(() => loadInitialState());
  const stateRef = useRef(state);
  const lastUserEditAtRef = useRef(0);
  const [hasLoadedFromDb, setHasLoadedFromDb] = useState(false);
  const [syncStatus, setSyncStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [lastSyncedAt, setLastSyncedAt] = useState<Date | null>(null);
  const activeUserIdRef = useRef<string | null>(null);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  // Persistência: salva campos leves em uma chave, pesados em chaves separadas
  useEffect(() => {
    const userId = user?.id;
    if (!userId) return;
    if (!hasLoadedFromDb) return;

    try {
      persistLocalState(state, userId);
    } catch {}
  }, [state, user?.id, hasLoadedFromDb]);

  // ☁️ CARREGAR DO BANCO: Busca o estado salvo do usuário no Supabase
  useEffect(() => {
    if (authLoading) return;

    console.log("[Fabrica Auth Gate] Auth pronta para hidratar:", {
      authLoading,
      userId: user?.id ?? null,
    });

    if (!user?.id) {
      activeUserIdRef.current = null;
      setState(defaultState);
      setHasLoadedFromDb(false);
      return;
    }

    safeSetItem(LAST_ACTIVE_USER_KEY, user.id);
    const userChanged = activeUserIdRef.current !== user.id;
    activeUserIdRef.current = user.id;

    setHasLoadedFromDb(false);

    setState((prev) => {
      const scopedLocal = loadInitialState(user.id);
      if (userChanged) {
        return hasMeaningfulProgress(scopedLocal) ? scopedLocal : defaultState;
      }
      const hasScopedProgress = hasMeaningfulProgress(scopedLocal);
      const prevIsDefault = !hasMeaningfulProgress(prev);
      return hasScopedProgress && prevIsDefault ? scopedLocal : prev;
    });

    const loadSavedState = async () => {
      try {
        console.log("[Supabase Load] Iniciando carregamento do banco de dados...");
        const { data, error } = await supabase
          .from("fabrica_diagnosticos")
          .select("state_snapshot, updated_at")
          .eq("user_id", user.id)
          .order("updated_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (error) {
          console.warn("[Supabase Load] Falha ao carregar estado:", error.message);
          return;
        }

        if (data?.state_snapshot) {
          const saved = data.state_snapshot as unknown as FabricaState;
          setState((prev) => {
            console.log("[Supabase Load] Comparando última edição local com a nuvem.");
            const localSnapshot = readPersistedState(user.id);
            const localTime = Math.max(getStateTimestamp(prev), getStateTimestamp(localSnapshot));
            const dbTime = getStateTimestamp(saved, data.updated_at);
            const useLocal = localTime > dbTime && hasMeaningfulProgress(localSnapshot);
            const primary = useLocal ? localSnapshot : saved;
            const fallback = useLocal ? saved : localSnapshot;

            const merged = {
              ...defaultState,
              ...primary,
              logoBase64: primary.logoBase64 || fallback.logoBase64 || "",
              generatedAdImage: primary.generatedAdImage || fallback.generatedAdImage || "",
              lastCleanPhoto: primary.lastCleanPhoto || fallback.lastCleanPhoto || "",
              allGeneratedAdImages: primary.allGeneratedAdImages?.length
                ? primary.allGeneratedAdImages
                : (fallback.allGeneratedAdImages || []),
              socialLinks: primary.socialLinks?.length ? primary.socialLinks : (fallback.socialLinks || []),
              siteContent: {
                ...defaultState.siteContent,
                ...(primary.siteContent || {}),
                galleryImages: primary.siteContent?.galleryImages?.length
                  ? primary.siteContent.galleryImages
                  : (fallback.siteContent?.galleryImages || []),
                sections: {
                  ...defaultState.siteContent.sections,
                  ...(primary.siteContent?.sections || {}),
                },
              },
              lastEditedAt: useLocal
                ? (localSnapshot.lastEditedAt || prev.lastEditedAt || "")
                : (saved.lastEditedAt || data.updated_at || ""),
            };

            persistLocalState(merged as FabricaState, user.id);
            clearLegacyState();
            return merged as FabricaState;
          });
          console.log("[Supabase Load] Estado carregado e mesclado com sucesso!");
        } else {
          console.log("[Supabase Load] Nenhum estado prévio encontrado para este usuário no banco.");
        }
      } catch (err) {
        console.error("[Supabase Load] Erro catastrófico ao carregar do Supabase:", err);
      } finally {
        setHasLoadedFromDb(true);
      }
    };

    loadSavedState();
  }, [user?.id, authLoading]);

  // ☁️ PERSISTÊNCIA NUVEM: Sincroniza estado debounced com Supabase
  useEffect(() => {
    if (!user?.id || !hasLoadedFromDb) return; // 🛡️ Bloqueia sincronização antes da hidratação completa!
    
    const syncState = async () => {
      // 🛡️ SEGURANÇA DE HIDRATAÇÃO: Não sobe um estado VAZIO por cima do que já está na nuvem!
      if (!state.agencyName && state.digitalScore === 0 && state.currentPhase <= 1) return;

      setSyncStatus("saving");
      try {
        const logoForCloud = state.logoBase64 && state.logoBase64.length < 400_000 ? state.logoBase64 : "";
        const cleanState = {
          ...state,
          logoBase64: logoForCloud,
          generatedAdImage: "",
          lastCleanPhoto: "",
          siteContent: {
            ...state.siteContent,
            galleryImages: [],
          },
          allGeneratedAdImages: []
        };

        const { error } = await supabase
          .from("fabrica_diagnosticos")
          .upsert({
            user_id: user.id,
            agency_name: state.agencyName || "Nova Agência",
            state_snapshot: cleanState as any,
            updated_at: new Date().toISOString()
          }, { onConflict: "user_id" });

        if (error) {
          console.warn("[Supabase Sync] Falha:", error.message);
          setSyncStatus("error");
        } else {
          console.log("[Supabase Sync] ✓ Salvo na nuvem");
          setLastSyncedAt(new Date());
          setSyncStatus("saved");
        }
      } catch (err) {
        setSyncStatus("error");
      }
    };

    // Salva rápido para evitar que telefone/logo voltem se o usuário recarregar ou sair logo após editar.
    const timer = setTimeout(syncState, 1500);
    return () => clearTimeout(timer);
  }, [
    JSON.stringify({
      ...state,
      logoBase64: !!state.logoBase64,
      generatedAdImage: !!state.generatedAdImage,
      lastCleanPhoto: !!state.lastCleanPhoto,
      allGeneratedAdImages: state.allGeneratedAdImages?.length || 0,
      siteContent: {
        ...state.siteContent,
        galleryImages: state.siteContent?.galleryImages?.length || 0,
      },
    }),
    user?.id,
    hasLoadedFromDb
  ]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const flushCurrentState = () => {
      const currentUserId = activeUserIdRef.current;
      if (!currentUserId || !hasLoadedFromDb) return;
      persistLocalState(stateRef.current, currentUserId);
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        flushCurrentState();
      }
    };

    window.addEventListener("beforeunload", flushCurrentState);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("beforeunload", flushCurrentState);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [hasLoadedFromDb]);

  // Histórico de alterações (Undo / Redo)
  const [history, setHistory] = useState<FabricaState[]>([]);
  const [redoStack, setRedoStack] = useState<FabricaState[]>([]);

  const update = useCallback((patch: Partial<FabricaState>) => {
    const editedAt = new Date().toISOString();
    lastUserEditAtRef.current = Date.now();
    // Salva o histórico de forma limpa e síncrona no corpo do callback do evento
    const snapshot = stateRef.current;
    setHistory((h) => {
      const nextH = [...h, snapshot];
      if (nextH.length > 50) nextH.shift(); // limite de 50 ações
      return nextH;
    });
    // Limpa a pilha de refazer ao realizar uma nova alteração
    setRedoStack([]);
    // Aplica a alteração no estado principal
    setState((prev) => {
      const next = { ...prev, ...patch, lastEditedAt: editedAt };
      stateRef.current = next;
      return next;
    });
  }, []);

  const undo = useCallback(() => {
    if (history.length === 0) return;

    const previous = history[history.length - 1];
    const newHistory = history.slice(0, -1);

    // Adiciona o estado atual à pilha de refazer (redo)
    setRedoStack((prevRedo) => [...prevRedo, state]);
    // Atualiza a pilha de histórico e o estado principal
    setHistory(newHistory);
    setState(previous);
  }, [history, state]);

  const redo = useCallback(() => {
    if (redoStack.length === 0) return;

    const next = redoStack[redoStack.length - 1];
    const newRedoStack = redoStack.slice(0, -1);

    // Adiciona o estado atual à pilha de desfazer (history)
    setHistory((prevHistory) => [...prevHistory, state]);
    // Atualiza a pilha de refazer e o estado principal
    setRedoStack(newRedoStack);
    setState(next);
  }, [redoStack, state]);

  const reset = useCallback(() => {
    setHistory([]);
    setRedoStack([]);
    setState(defaultState);
  }, []);

  const setPhase = useCallback((phase: number) => {
    setState((prev) => ({ ...prev, currentPhase: phase }));
  }, []);

  const toggleChecklist = useCallback((key: string) => {
    setState((prev) => ({
      ...prev,
      checklist30days: { ...prev.checklist30days, [key]: !prev.checklist30days[key] },
    }));
  }, []);

  return (
    <FabricaContext.Provider
      value={{
        state,
        update,
        reset,
        setPhase,
        toggleChecklist,
        undo,
        redo,
        canUndo: history.length > 0,
        canRedo: redoStack.length > 0,
        syncStatus,
        lastSyncedAt,
      }}
    >
      {children}
    </FabricaContext.Provider>
  );
};

export const useFabricaContext = () => {
  const ctx = useContext(FabricaContext);
  if (!ctx) throw new Error("useFabricaContext must be used inside FabricaProvider");
  return ctx;
};
