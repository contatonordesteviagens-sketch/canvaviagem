import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
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
  whatsapp: string;
  niche: Niche;
  destinos: string[]; // destinos específicos vendidos pela agência
  logoBase64: string;

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
}

const defaultState: FabricaState = {
  agencyName: "",
  agencyType: "",
  agencyTypeOther: "",
  city: "",
  instagram: "",
  whatsapp: "",
  niche: "",
  destinos: [],
  logoBase64: "",
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
};

const STORAGE_KEY = "fabrica-context-v1";
// Campos pesados (base64) ficam em chaves separadas pra não estourar a quota do localStorage
const HEAVY_KEYS = ["logoBase64", "generatedAdImage", "lastCleanPhoto"] as const;
const HEAVY_STORAGE_PREFIX = "fabrica-heavy-v1:";
const GALLERY_KEY = "fabrica-gallery-v1";
const GENERATED_KEY = "fabrica-generated-v1";

const safeSetItem = (key: string, value: string): boolean => {
  try {
    localStorage.setItem(key, value);
    return true;
  } catch {
    return false;
  }
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
}

const FabricaContext = createContext<FabricaContextType | undefined>(undefined);

const loadInitialState = (): FabricaState => {
  if (typeof window === "undefined") return defaultState;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    const parsed = stored ? JSON.parse(stored) : {};
    const heavy: Record<string, string> = {};
    HEAVY_KEYS.forEach((k) => {
      const v = localStorage.getItem(HEAVY_STORAGE_PREFIX + k);
      if (v) heavy[k] = v;
    });
    let gallery: string[] = [];
    try {
      const g = localStorage.getItem(GALLERY_KEY);
      if (g) gallery = JSON.parse(g);
    } catch {}

    let generated: string[] = [];
    try {
      const gen = localStorage.getItem(GENERATED_KEY);
      if (gen) generated = JSON.parse(gen);
    } catch {}

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

export const FabricaProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<FabricaState>(loadInitialState);

  // Persistência: salva campos leves em uma chave, pesados em chaves separadas
  useEffect(() => {
    try {
      const { logoBase64, generatedAdImage, lastCleanPhoto, allGeneratedAdImages, siteContent, ...rest } = state;
      const { galleryImages, ...siteRest } = siteContent;

      // Leve (sem base64 grandes)
      safeSetItem(
        STORAGE_KEY,
        JSON.stringify({ ...rest, siteContent: siteRest })
      );

      // Pesados em chaves próprias (sobrevivem mesmo se um deles falhar)
      if (logoBase64) safeSetItem(HEAVY_STORAGE_PREFIX + "logoBase64", logoBase64);
      else localStorage.removeItem(HEAVY_STORAGE_PREFIX + "logoBase64");

      if (generatedAdImage) safeSetItem(HEAVY_STORAGE_PREFIX + "generatedAdImage", generatedAdImage);
      else localStorage.removeItem(HEAVY_STORAGE_PREFIX + "generatedAdImage");

      if (lastCleanPhoto) safeSetItem(HEAVY_STORAGE_PREFIX + "lastCleanPhoto", lastCleanPhoto);
      else localStorage.removeItem(HEAVY_STORAGE_PREFIX + "lastCleanPhoto");

      // Galeria separada (pode ter várias imagens)
      safeSetItem(GALLERY_KEY, JSON.stringify(galleryImages || []));

      // Artes geradas separadas
      safeSetItem(GENERATED_KEY, JSON.stringify(allGeneratedAdImages || []));
    } catch {}
  }, [state]);

  const { user } = useAuth();

  // ☁️ CARREGAR DO BANCO: Busca o estado salvo do usuário no Supabase
  useEffect(() => {
    if (!user?.id) return;

    const loadSavedState = async () => {
      try {
        const { data, error } = await supabase
          .from("fabrica_diagnosticos")
          .select("state_snapshot")
          .eq("user_id", user.id)
          .maybeSingle();

        if (error) {
          console.warn("[Supabase Load] Falha ao carregar estado:", error.message);
          return;
        }

        if (data?.state_snapshot) {
          const saved = data.state_snapshot as Partial<FabricaState>;
          setState((prev) => {
            // Mescla o estado com cuidado para preservar o que já está na sessão
            const merged = {
              ...prev,
              ...saved,
              siteContent: {
                ...prev.siteContent,
                ...(saved.siteContent || {}),
                galleryImages: saved.siteContent?.galleryImages || prev.siteContent?.galleryImages || [],
                sections: {
                  ...prev.siteContent.sections,
                  ...(saved.siteContent?.sections || {}),
                }
              },
              allGeneratedAdImages: saved.allGeneratedAdImages || prev.allGeneratedAdImages || []
            };
            return merged;
          });
        }
      } catch (err) {
        console.error("[Supabase Load] Erro catastrófico:", err);
      }
    };

    loadSavedState();
  }, [user?.id]);

  // ☁️ PERSISTÊNCIA NUVEM: Sincroniza estado debounced com Supabase
  useEffect(() => {
    if (!user?.id) return;
    
    const syncState = async () => {
      // 🛡️ SEGURANÇA DE HIDRATAÇÃO: Não sobe um estado VAZIO por cima do que já está na nuvem!
      if (!state.agencyName && state.digitalScore === 0 && state.currentPhase <= 1) return;

      try {
        // Salva o snapshot com fotos, logos e galeria sob controle de tamanho para não exceder limites
        const cleanState = {
          ...state,
          siteContent: {
            ...state.siteContent,
            galleryImages: (state.siteContent.galleryImages || []).slice(0, 10),
          },
          allGeneratedAdImages: (state.allGeneratedAdImages || []).slice(0, 10)
        };

        const { error } = await supabase
          .from("fabrica_diagnosticos")
          .upsert({
            user_id: user.id,
            agency_name: state.agencyName || "Nova Agência",
            digital_score: state.digitalScore || 0,
            level: state.level || 1,
            state_snapshot: cleanState as any,
            updated_at: new Date().toISOString()
          }, { onConflict: "user_id" });

        if (error) {
          console.warn("[Supabase Sync] Falha silenciosa:", error.message);
        }
      } catch (err) {
        // Falha silenciosa
      }
    };

    // Debounce 2.5s para evitar flooding do banco em digitações rápidas
    const timer = setTimeout(syncState, 2500);
    return () => clearTimeout(timer);
  }, [
    JSON.stringify({
      ...state,
      logoBase64: !!state.logoBase64,
      generatedAdImage: !!state.generatedAdImage,
      lastCleanPhoto: !!state.lastCleanPhoto,
    }),
    user?.id
  ]);

  // Histórico de alterações (Undo / Redo)
  const [history, setHistory] = useState<FabricaState[]>([]);
  const [redoStack, setRedoStack] = useState<FabricaState[]>([]);

  const update = useCallback((patch: Partial<FabricaState>) => {
    setState((prev) => {
      // Salva no histórico antes de aplicar o patch
      setHistory((h) => {
        const nextH = [...h, prev];
        if (nextH.length > 50) nextH.shift(); // limite de 50 ações
        return nextH;
      });
      // Limpa pilha de refazer ao fazer uma nova alteração
      setRedoStack([]);
      return { ...prev, ...patch };
    });
  }, []);

  const undo = useCallback(() => {
    setHistory((h) => {
      if (h.length === 0) return h;
      const prev = h[h.length - 1];
      const nextH = h.slice(0, -1);
      setState((current) => {
        setRedoStack((r) => [...r, current]);
        return prev;
      });
      return nextH;
    });
  }, []);

  const redo = useCallback(() => {
    setRedoStack((r) => {
      if (r.length === 0) return r;
      const next = r[r.length - 1];
      const nextR = r.slice(0, -1);
      setState((current) => {
        setHistory((h) => [...h, current]);
        return next;
      });
      return nextR;
    });
  }, []);

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
