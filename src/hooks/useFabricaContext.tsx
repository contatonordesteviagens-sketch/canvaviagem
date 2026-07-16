import { createContext, useContext, useState, useEffect, ReactNode, useCallback, useRef } from "react";
import type { Context } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { isLocalPreviewEnabled } from "@/lib/localPreview";
import {
  createDefaultCrmFormConfig,
  normalizeCrmFormConfig,
  type CrmFormConfig,
} from "@/lib/crm-form-config";
import type { SiteTemplateId } from "@/lib/site-template-catalog";
import {
  createTemporaryProjectId,
  isPersistedProjectId,
  persistFabricaProject,
  resolveFabricaProjectId,
} from "@/lib/fabrica-project-persistence";

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

export type PackageSegment =
  | "passeio"
  | "pacote"
  | "sob-medida"
  | "grupo"
  | "cruzeiro"
  | "aventura"
  | "religioso"
  | "corporativo"
  | "outro";

export type PackageAvailability =
  | "disponivel"
  | "ultimas-vagas"
  | "saida-confirmada"
  | "sob-consulta"
  | "lista-de-espera"
  | "esgotado";

export interface PackageFaq {
  question: string;
  answer: string;
}

export interface PackageOption {
  id: string;
  label: string;
  date?: string;
  price?: string;
  availability?: PackageAvailability;
}

export interface Pacote {
  id: string;
  title: string;
  description: string;
  price: string;
  imageUrl?: string;
  ctaLabel?: string;
  isDraft?: boolean;
  slug?: string;
  segment?: PackageSegment;
  subtitle?: string;
  longDescription?: string;
  travelDates?: string;
  duration?: string;
  departureLocation?: string;
  meetingPoint?: string;
  accommodation?: string;
  priceDetails?: string;
  paymentTerms?: string;
  availability?: PackageAvailability;
  highlights?: string[];
  included?: string[];
  notIncluded?: string[];
  itinerary?: string[];
  requirements?: string[];
  documents?: string[];
  accessibility?: string[];
  cancellationPolicy?: string;
  importantNotes?: string;
  galleryImages?: string[];
  faq?: PackageFaq[];
  options?: PackageOption[];
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
  templateId?: SiteTemplateId;
  heroHeadline: string;
  heroSubheadline: string;
  heroCtaLabel: string;
  heroSecondaryCtaLabel?: string;
  navHomeLabel?: string;
  navDestinationsLabel?: string;
  navAboutLabel?: string;
  navBudgetLabel?: string;
  navWhatsAppLabel?: string;
  pacotesTitle: string;
  depoimentosTitle: string;
  depoimentosEyebrow?: string;
  depoVerifiedLabel?: string;
  faqTitle: string;
  faqEyebrow?: string;
  finalCtaTitle: string;
  finalCtaLabel: string;
  faq: Array<{ q: string; a: string }>;
  heroImageUrl?: string; // Imagem de fundo do banner principal do site
  galleryImages: string[]; // banco de imagens geradas pra reuso
  /** @deprecated Compatibilidade de leitura com snapshots de publicação antigos. */
  vercelUrl?: string;
  canvaViagemUrl?: string; // URL do site publicado no subdomínio Canva Viagem
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
  contactWhatsappLabel?: string;
  contactEmailLabel?: string;
  contactHoursLabel?: string;
  contactLocationLabel?: string;
  packageOverlayLabel?: string;
  equipeCtaLabel?: string;
  formSubmitLabel?: string;
  footerText?: string;
  footerDestinationsTitle?: string;
  footerCompanyTitle?: string;
  footerContactTitle?: string;
  footerAboutLabel?: string;
  footerProcessLabel?: string;
  footerTestimonialsLabel?: string;
  footerContactLabel?: string;
  footerHoursLabel?: string;
  footerCopyrightText?: string;
  footerCreditPrefix?: string;
  mapEyebrow?: string;
  mapTitle?: string;
  sectionColors?: Record<string, string>;
  stats?: Array<{ num: string; label: string }>;
  hiddenElements?: string[];
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
  metaPixelId?: string;
  ga4Id?: string;
  whatsappDialCode: string;  // DDI em dígitos: "55", "1", "351"...
  whatsappCountryCode: string; // ISO code: "BR", "US", "PT"...
  agencyEmail: string;
  niche: Niche;
  destinos: string[]; // destinos específicos vendidos pela agência
  logoBase64: string;
  logoFormat?: "circle" | "square";
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
  crmForm: CrmFormConfig;

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
  projectId?: string;
}

const defaultStateBR: FabricaState = {
  projectId: "",
  agencyName: "",
  agencyType: "",
  agencyTypeOther: "",
  city: "",
  instagram: "",
  socialLinks: [],
  metaPixelId: "",
  ga4Id: "",
  whatsapp: "",
  whatsappDialCode: "55",
  whatsappCountryCode: "BR",
  agencyEmail: "",
  niche: "",
  destinos: [],
  logoBase64: "",
  logoFormat: "circle",
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
  sectionOrder: ["hero", "processo", "destinos", "porQue", "depoimentos", "orcamento", "faq", "finalCta"],
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
    heroSecondaryCtaLabel: "Ver Destinos",
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
    templateId: "standard",
    sectionColors: {},
    galleryImages: [],
    vercelUrl: "",
    canvaViagemUrl: "",
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
    equipeCtaLabel: "Falar com um especialista",
    formSubmitLabel: "Enviar pelo WhatsApp",
    footerText: "Sua parceira ideal para viagens inesquecíveis. Cuidamos de cada detalhe para que você apenas aproveite o momento.",
    footerDestinationsTitle: "Destinos",
    footerCompanyTitle: "Empresa",
    footerContactTitle: "Contato",
    footerAboutLabel: "Sobre Nós",
    footerProcessLabel: "Como Funciona",
    footerTestimonialsLabel: "Depoimentos",
    footerContactLabel: "Contato",
    footerHoursLabel: "Seg–Sex 8h–20h",
    stats: [
      { num: "12+", label: "Anos de Experiência" },
      { num: "15k+", label: "Viajantes Felizes" },
      { num: "25", label: "Países Atendidos" },
      { num: "99%", label: "Satisfação" },
    ],
  },
  crmForm: createDefaultCrmFormConfig("pt-BR"),
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


const defaultStateES: FabricaState = {
  ...defaultStateBR,
  primaryColor: "#0C2340",
  secondaryColor: "#C9A84C",
  siteContent: {
    ...defaultStateBR.siteContent,
    heroHeadline: "",
    heroSubheadline: "",
    heroCtaLabel: "Hablar por WhatsApp",
    heroSecondaryCtaLabel: "Ver Destinos",
    pacotesTitle: "Nuestros Paquetes",
    depoimentosTitle: "Quienes viajaron recomiendan",
    faqTitle: "Preguntas Frecuentes",
    finalCtaTitle: "¿Listo para tu próximo viaje?",
    finalCtaLabel: "Contactar por WhatsApp",
    faq: [
      { q: "¿Se puede pagar en cuotas?", a: "¡Sí! Hasta 12 cuotas con tarjeta de crédito, sin intereses en condiciones seleccionadas." },
      { q: "¿Es seguro contratar con ustedes?", a: "Somos una agencia regulada con registro activo y asociación directa con operadores." },
      { q: "¿Y si necesito cancelar?", a: "Cada paquete tiene su política. Recibirás el contrato con todo claro antes de cerrar." },
      { q: "¿Cómo resolver dudas?", a: "Atención directa por WhatsApp, con respuesta en menos de 1h en horario comercial." },
    ],
    heroEyebrow: "Consultoría Premium de Viajes",
    processoEyebrow: "Proceso",
    processoTitle: "Tu viaje soñado en 3 pasos",
    processoSteps: [
      { num: "1", title: "Consulta Personalizada", desc: "Entendemos tus sueños, fechas, presupuesto y estilo en una charla de 30 minutos sin compromiso." },
      { num: "2", title: "Curaduría Exclusiva", desc: "Creamos un itinerario 100% personalizado con los mejores hoteles, tours y experiencias para tu perfil." },
      { num: "3", title: "Embarque Tranquilo", desc: "Cuidamos de pasajes, alojamiento, traslados y soporte 24h durante todo tu viaje." }
    ],
    destinosEyebrow: "Destinos",
    equipeBadge: "+15k Clientes Satisfechos",
    equipeEyebrow: "Nuestro equipo",
    equipeTitle: "Un equipo dedicado exclusivamente a ti",
    equipeIntro: "Cada viaje comienza con una conversación real. Nuestro equipo de expertos conoce los destinos de cerca — cada detalle pensado para tu perfil, tus sueños y tu momento.",
    equipeFeatures: [
      { icon: "🛡️", title: "Seguridad y Confiabilidad", desc: "Años de experiencia con miles de familias y socios verificados mundialmente." },
      { icon: "📞", title: "Soporte 24h Durante el Viaje", desc: "Nuestro equipo está disponible a cualquier hora. Cualquier imprevisto, lo resolvemos." },
      { icon: "✨", title: "Experiencias Exclusivas", desc: "Acceso a hoteles y experiencias que no están disponibles para el público general." },
      { icon: "💰", title: "Mejor Relación Calidad-Precio", desc: "Nuestra red de socios ofrece condiciones especiales que no encuentras en otros lugares." }
    ],
    orcamentoEyebrow: "Presupuesto",
    orcamentoTitle: "Habla con un consultor ahora",
    orcamentoText: "Completa el formulario y nuestro equipo te contactará en hasta 2 horas con una propuesta personalizada.",
    atendimentoText: "Lun–Vie 8h–20h · Sáb 9h–15h",
    equipeCtaLabel: "Hablar con un especialista",
    formSubmitLabel: "Enviar por WhatsApp",
    footerText: "Tu socio ideal para viajes inolvidables. Cuidamos cada detalle para que tú solo disfrutes el momento.",
    stats: [
      { num: "12+", label: "Años de Experiencia" },
      { num: "15k+", label: "Viajeros Felices" },
      { num: "25", label: "Países Visitados" },
      { num: "99%", label: "Satisfacción" },
    ],
  },
  crmForm: createDefaultCrmFormConfig("es"),
  lastAdTitle: "Paquete {destino}",
  lastPaymentSuffix: "por persona",
  lastCurrency: "USD1",
  selectedPackages: [],
};

const getBaseState = (): FabricaState => {
  if (typeof window !== "undefined" && window.location.pathname.startsWith("/es")) {
    return defaultStateES;
  }
  return defaultStateBR;
};

const isEs = () => typeof window !== "undefined" && window.location.pathname.startsWith("/es");

const cloneBaseState = (): FabricaState => {
  const base = getBaseState();
  if (typeof structuredClone === "function") return structuredClone(base);
  return JSON.parse(JSON.stringify(base)) as FabricaState;
};

const createFreshState = (): FabricaState => ({
  ...cloneBaseState(),
  projectId: createTemporaryProjectId(),
});

const normalizeStateSnapshot = (
  snapshot?: Partial<FabricaState> | null,
  projectId?: string | null,
): FabricaState => {
  const base = cloneBaseState();
  const resolvedProjectId = projectId || snapshot?.projectId || createTemporaryProjectId();
  return {
    ...base,
    ...(snapshot || {}),
    projectId: resolvedProjectId,
    siteContent: {
      ...base.siteContent,
      ...(snapshot?.siteContent || {}),
      sections: {
        ...base.siteContent.sections,
        ...(snapshot?.siteContent?.sections || {}),
      },
    },
    crmForm: normalizeCrmFormConfig(snapshot?.crmForm, isEs() ? "es" : "pt-BR"),
  };
};

// Chaves v1 são mantidas somente para migração de sessões já existentes.
const getStorageKey = () => isEs() ? "fabrica-context-v1-es" : "fabrica-context-v1";
const HEAVY_KEYS = ["logoBase64", "generatedAdImage", "lastCleanPhoto"] as const;
const getHeavyStoragePrefix = () => isEs() ? "fabrica-heavy-v1-es:" : "fabrica-heavy-v1:";
const getGalleryKey = () => isEs() ? "fabrica-gallery-v1-es" : "fabrica-gallery-v1";
const getGeneratedKey = () => isEs() ? "fabrica-generated-v1-es" : "fabrica-generated-v1";
const LAST_ACTIVE_USER_KEY = "fabrica-last-user-id";

const getLocaleStorageTag = () => isEs() ? "es" : "pt-BR";
const getActiveProjectKey = (userId: string) =>
  `fabrica-active-project-v2:${getLocaleStorageTag()}:${userId}`;
const getProjectStorageKey = (userId: string, projectId: string) =>
  `fabrica-context-v2:${getLocaleStorageTag()}:${userId}:${projectId}`;
const getProjectGalleryKey = (userId: string, projectId: string) =>
  `fabrica-gallery-v2:${getLocaleStorageTag()}:${userId}:${projectId}`;
const getProjectHeavyPrefix = (userId: string, projectId: string) =>
  `fabrica-heavy-v2:${getLocaleStorageTag()}:${userId}:${projectId}:`;
const PROJECT_MEDIA_CACHE_KEY = "projectMedia";

interface LocalProjectMediaCache {
  heroImageUrl?: string;
  aboutImageUrl?: string;
  packages?: Array<{
    id: string;
    index: number;
    imageUrl?: string;
    galleryImages?: string[];
  }>;
}

const scopedKey = (key: string, userId?: string | null) => (userId ? `${key}:${userId}` : key);
const scopedHeavyPrefix = (userId?: string | null) => (userId ? `${getHeavyStoragePrefix()}${userId}:` : getHeavyStoragePrefix());

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
      snapshot.lastEditedAt ||
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

const LOCAL_PREVIEW_USER_ID = "__canva_viagem_local_preview__";

const getStateTimestamp = (snapshot?: Partial<FabricaState> | null, fallback?: string | null): number => {
  const raw = snapshot?.lastEditedAt || fallback || 0;
  return new Date(raw).getTime() || 0;
};

const isRemoteMediaUrl = (value?: string | null) => Boolean(value && /^https?:\/\//i.test(value));
const isInlineMediaUrl = (value?: string | null) => Boolean(value && /^data:/i.test(value));
const hasInlineMedia = (values?: string[]) => Boolean(values?.some((value) => isInlineMediaUrl(value)));

const mergeSameProjectMedia = (base: FabricaState, local: FabricaState): FabricaState => {
  const localPackagesById = new Map(local.selectedPackages.map((pkg) => [pkg.id, pkg]));
  const selectedPackages = base.selectedPackages.map((pkg, index) => {
    const localPackage = localPackagesById.get(pkg.id) || local.selectedPackages[index];
    if (!localPackage) return pkg;
    return {
      ...pkg,
      imageUrl: pkg.imageUrl || localPackage.imageUrl,
      galleryImages: hasInlineMedia(localPackage.galleryImages)
        ? localPackage.galleryImages
        : (pkg.galleryImages?.length ? pkg.galleryImages : localPackage.galleryImages),
    };
  });

  return {
    ...base,
    logoBase64: base.logoBase64 || local.logoBase64 || "",
    generatedAdImage: local.generatedAdImage || "",
    lastCleanPhoto: local.lastCleanPhoto || "",
    allGeneratedAdImages: local.allGeneratedAdImages || [],
    selectedPackages,
    siteContent: {
      ...base.siteContent,
      heroImageUrl: base.siteContent.heroImageUrl || local.siteContent.heroImageUrl,
      aboutImageUrl: base.siteContent.aboutImageUrl || local.siteContent.aboutImageUrl,
      galleryImages: base.siteContent.galleryImages?.length
        ? base.siteContent.galleryImages
        : (local.siteContent.galleryImages || []),
    },
  };
};

const readActiveProjectId = (userId?: string | null) => {
  if (typeof window === "undefined" || !userId) return null;
  return localStorage.getItem(getActiveProjectKey(userId));
};

const readProjectState = (userId: string, projectId: string): FabricaState | null => {
  try {
    const stored = localStorage.getItem(getProjectStorageKey(userId, projectId));
    if (!stored) return null;
    const parsed = JSON.parse(stored) as Partial<FabricaState>;
    const heavy: Record<string, string> = {};
    const heavyPrefix = getProjectHeavyPrefix(userId, projectId);

    HEAVY_KEYS.forEach((k) => {
      const v = localStorage.getItem(heavyPrefix + k);
      if (v) heavy[k] = v;
    });

    let projectMedia: LocalProjectMediaCache = {};
    try {
      const cachedMedia = localStorage.getItem(heavyPrefix + PROJECT_MEDIA_CACHE_KEY);
      if (cachedMedia) projectMedia = JSON.parse(cachedMedia) as LocalProjectMediaCache;
    } catch {}

    const selectedPackages = (parsed.selectedPackages || []).map((pkg, index) => {
      const media = projectMedia.packages?.find(
        (entry) => entry.id === pkg.id && entry.index === index,
      ) || projectMedia.packages?.find((entry) => entry.id === pkg.id);
      if (!media) return pkg;
      return {
        ...pkg,
        imageUrl: pkg.imageUrl || media.imageUrl,
        galleryImages: media.galleryImages?.length ? media.galleryImages : pkg.galleryImages,
      };
    });

    let gallery: string[] = [];
    try {
      const g = localStorage.getItem(getProjectGalleryKey(userId, projectId));
      if (g) gallery = JSON.parse(g);
    } catch {}

    return normalizeStateSnapshot({
      ...parsed,
      ...heavy,
      selectedPackages,
      allGeneratedAdImages: parsed.allGeneratedAdImages || [],
      siteContent: {
        ...(parsed.siteContent || {}),
        heroImageUrl: parsed.siteContent?.heroImageUrl || projectMedia.heroImageUrl,
        aboutImageUrl: parsed.siteContent?.aboutImageUrl || projectMedia.aboutImageUrl,
        galleryImages: gallery.length ? gallery : (parsed.siteContent?.galleryImages || []),
      },
    } as Partial<FabricaState>, projectId);
  } catch {
    return null;
  }
};

const readLegacyPersistedState = (userId?: string | null): FabricaState | null => {
  try {
    const stored = localStorage.getItem(scopedKey(getStorageKey(), userId));
    if (!stored) return null;
    const parsed = JSON.parse(stored) as Partial<FabricaState>;
    const heavy: Record<string, string> = {};
    const heavyPrefix = scopedHeavyPrefix(userId);
    HEAVY_KEYS.forEach((key) => {
      const value = localStorage.getItem(heavyPrefix + key);
      if (value) heavy[key] = value;
    });

    let gallery: string[] = [];
    try {
      const storedGallery = localStorage.getItem(scopedKey(getGalleryKey(), userId));
      if (storedGallery) gallery = JSON.parse(storedGallery);
    } catch {}

    return normalizeStateSnapshot({
      ...parsed,
      ...heavy,
      siteContent: {
        ...(parsed.siteContent || {}),
        galleryImages: gallery.length ? gallery : (parsed.siteContent?.galleryImages || []),
      },
    } as Partial<FabricaState>, parsed.projectId || undefined);
  } catch {
    return null;
  }
};

const readPersistedState = (userId?: string | null, projectId?: string | null): FabricaState => {
  if (typeof window === "undefined") return createFreshState();
  const activeProjectId = projectId || readActiveProjectId(userId);
  if (userId && activeProjectId) {
    const projectState = readProjectState(userId, activeProjectId);
    if (projectState) return projectState;
    if (projectId) return normalizeStateSnapshot(null, projectId);
  }
  return readLegacyPersistedState(userId) || createFreshState();
};

const loadInitialState = (userId?: string | null): FabricaState => {
  if (typeof window === "undefined") return createFreshState();

  const rememberedUserId = userId ?? localStorage.getItem(LAST_ACTIVE_USER_KEY);
  const scopedState = rememberedUserId ? readPersistedState(rememberedUserId) : createFreshState();

  return hasMeaningfulProgress(scopedState) ? scopedState : normalizeStateSnapshot(scopedState, scopedState.projectId);
};

const persistLocalState = (nextState: FabricaState, userId?: string | null) => {
  if (typeof window === "undefined") return;

  const resolvedUserId = userId ?? localStorage.getItem(LAST_ACTIVE_USER_KEY);
  const projectId = nextState.projectId;
  if (!resolvedUserId || !projectId) return;

  safeSetItem(LAST_ACTIVE_USER_KEY, resolvedUserId);
  safeSetItem(getActiveProjectKey(resolvedUserId), projectId);

  const {
    logoBase64,
    generatedAdImage,
    lastCleanPhoto,
    allGeneratedAdImages,
    selectedPackages,
    siteContent,
    ...rest
  } = nextState;
  const { galleryImages, heroImageUrl, aboutImageUrl, ...siteRest } = siteContent;
  const remoteGeneratedImages = (allGeneratedAdImages || []).filter((value) =>
    isRemoteMediaUrl(value),
  );
  const packagesForMain = selectedPackages.map((pkg) => ({
    ...pkg,
    imageUrl: isInlineMediaUrl(pkg.imageUrl) ? undefined : pkg.imageUrl,
    galleryImages: pkg.galleryImages?.filter((value) => !isInlineMediaUrl(value)),
  }));
  const projectMedia: LocalProjectMediaCache = {
    heroImageUrl: isInlineMediaUrl(heroImageUrl) ? heroImageUrl : undefined,
    aboutImageUrl: isInlineMediaUrl(aboutImageUrl) ? aboutImageUrl : undefined,
    packages: selectedPackages
      .map((pkg, index) => ({
        id: pkg.id,
        index,
        imageUrl: isInlineMediaUrl(pkg.imageUrl) ? pkg.imageUrl : undefined,
        galleryImages: hasInlineMedia(pkg.galleryImages) ? pkg.galleryImages : undefined,
      }))
      .filter((media) => media.imageUrl || media.galleryImages?.length),
  };
  const hasProjectMedia = Boolean(
    projectMedia.heroImageUrl ||
    projectMedia.aboutImageUrl ||
    projectMedia.packages?.length,
  );
  const heavyPrefix = getProjectHeavyPrefix(resolvedUserId, projectId);

  const savedMain = safeSetItem(
    getProjectStorageKey(resolvedUserId, projectId),
    JSON.stringify({
      ...rest,
      selectedPackages: packagesForMain,
      allGeneratedAdImages: remoteGeneratedImages,
      siteContent: {
        ...siteRest,
        heroImageUrl: isInlineMediaUrl(heroImageUrl) ? undefined : heroImageUrl,
        aboutImageUrl: isInlineMediaUrl(aboutImageUrl) ? undefined : aboutImageUrl,
      },
    })
  );
  if (!savedMain) {
    toast.error("Memória do navegador cheia! Suas edições podem não ser salvas offline. Limpe o cache ou imagens geradas.");
  }

  if (logoBase64) safeSetItem(heavyPrefix + "logoBase64", logoBase64);
  else localStorage.removeItem(heavyPrefix + "logoBase64");

  if (generatedAdImage) safeSetItem(heavyPrefix + "generatedAdImage", generatedAdImage);
  else localStorage.removeItem(heavyPrefix + "generatedAdImage");

  if (lastCleanPhoto) safeSetItem(heavyPrefix + "lastCleanPhoto", lastCleanPhoto);
  else localStorage.removeItem(heavyPrefix + "lastCleanPhoto");

  if (hasProjectMedia) {
    const savedMedia = safeSetItem(
      heavyPrefix + PROJECT_MEDIA_CACHE_KEY,
      JSON.stringify(projectMedia),
    );
    if (!savedMedia) console.warn("Quota exceeded when saving project media locally.");
  } else {
    localStorage.removeItem(heavyPrefix + PROJECT_MEDIA_CACHE_KEY);
  }

  const savedGallery = safeSetItem(getProjectGalleryKey(resolvedUserId, projectId), JSON.stringify(galleryImages || []));
  
  if (!savedGallery) {
    console.warn("Quota exceeded when saving gallery to local storage.");
  }
};

const removeLocalProjectState = (userId: string, projectId?: string | null) => {
  if (!projectId) return;
  localStorage.removeItem(getProjectStorageKey(userId, projectId));
  localStorage.removeItem(getProjectGalleryKey(userId, projectId));
  const heavyPrefix = getProjectHeavyPrefix(userId, projectId);
  HEAVY_KEYS.forEach((key) => localStorage.removeItem(heavyPrefix + key));
  localStorage.removeItem(heavyPrefix + PROJECT_MEDIA_CACHE_KEY);
};

const getSavedPublicSiteSlug = (snapshot: FabricaState) => {
  const raw = snapshot.siteContent?.canvaViagemUrl?.trim();
  if (!raw) return "";
  try {
    const normalized = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
    return new URL(normalized).hostname.split(".")[0] || "";
  } catch {
    return "";
  }
};

const clearLegacyState = () => {
  if (typeof window === "undefined") return;

  localStorage.removeItem(getStorageKey());
  localStorage.removeItem(getGalleryKey());
  localStorage.removeItem(getGeneratedKey());

  HEAVY_KEYS.forEach((key) => {
    localStorage.removeItem(`${getHeavyStoragePrefix()}${key}`);
  });
};

interface FabricaContextType {
  state: FabricaState;
  update: (patch: Partial<FabricaState>) => void;
  systemUpdate: (patch: Partial<FabricaState>) => void;
  reset: () => void;
  setPhase: (phase: number) => void;
  toggleChecklist: (key: string) => void;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  syncStatus: "idle" | "saving" | "saved" | "error";
  lastSyncedAt: Date | null;
  isHydrated: boolean;
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
  const queryClient = useQueryClient();
  const [state, setState] = useState<FabricaState>(() =>
    loadInitialState(isLocalPreviewEnabled() ? LOCAL_PREVIEW_USER_ID : undefined)
  );
  const stateRef = useRef(state);
  const lastUserEditAtRef = useRef(0);
  const [hasLoadedFromDb, setHasLoadedFromDb] = useState(false);
  const [syncStatus, setSyncStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [lastSyncedAt, setLastSyncedAt] = useState<Date | null>(null);
  const activeUserIdRef = useRef<string | null>(null);
  const projectSaveQueueRef = useRef<Map<string, Promise<{ id: string; stateSnapshot: FabricaState }>>>(new Map());
  const [historyCount, setHistoryCount] = useState(0);
  const [redoCount, setRedoCount] = useState(0);
  const historyRef = useRef<FabricaState[]>([]);
  const redoStackRef = useRef<FabricaState[]>([]);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  const enqueueProjectPersistence = useCallback((
    snapshot: FabricaState,
    userId: string,
    levelName?: string,
  ) => {
    const originalProjectId = snapshot.projectId || createTemporaryProjectId();
    const queueKey = resolveFabricaProjectId(originalProjectId);
    const previous = projectSaveQueueRef.current.get(queueKey);
    const runSave = () => persistFabricaProject({
      state: { ...snapshot, projectId: queueKey },
      userId,
      levelName,
    });
    const task = previous
      ? previous.then(runSave, runSave)
      : runSave();

    projectSaveQueueRef.current.set(queueKey, task);
    void task.then(
      () => {
        if (projectSaveQueueRef.current.get(queueKey) === task) {
          projectSaveQueueRef.current.delete(queueKey);
        }
      },
      () => {
        if (projectSaveQueueRef.current.get(queueKey) === task) {
          projectSaveQueueRef.current.delete(queueKey);
        }
      },
    );
    return task;
  }, []);

  useEffect(() => {
    const handlePrefillSnapshot = (event: Event) => {
      const customEvent = event as CustomEvent<Partial<FabricaState>>;
      const snapshot = customEvent.detail;
      if (!snapshot) return;

      const previousState = stateRef.current;
      const currentUserId = activeUserIdRef.current;
      if (
        currentUserId &&
        currentUserId !== LOCAL_PREVIEW_USER_ID &&
        hasMeaningfulProgress(previousState)
      ) {
        void enqueueProjectPersistence(previousState, currentUserId).catch((error) => {
          console.warn("[Supabase Sync] Não foi possível concluir o save do projeto anterior:", error);
        });
      }

      historyRef.current = [];
      redoStackRef.current = [];
      setHistoryCount(0);
      setRedoCount(0);
      setState((prev) => {
        const resolvedProjectId = snapshot.projectId || createTemporaryProjectId();
        const incoming = normalizeStateSnapshot({
          ...snapshot,
          // ✅ Restaura a fase do projeto carregado (não mantém a fase atual)
          currentPhase: snapshot.currentPhase ?? prev.currentPhase,
          diagnosticoCompleto: false,
          lastEditedAt: new Date().toISOString(),
        }, resolvedProjectId);
        const cached = activeUserIdRef.current
          ? readProjectState(activeUserIdRef.current, resolvedProjectId)
          : null;
        const cachedIsNewer = Boolean(
          cached && getStateTimestamp(cached) > getStateTimestamp(snapshot),
        );
        const merged = cachedIsNewer && cached
          ? { ...cached, currentPhase: incoming.currentPhase, diagnosticoCompleto: false }
          : cached
            ? mergeSameProjectMedia(incoming, cached)
            : incoming;

        stateRef.current = merged;
        // ✅ Persiste no localStorage IMEDIATAMENTE para evitar restauração errada se a aba fechar
        if (activeUserIdRef.current) persistLocalState(merged, activeUserIdRef.current);
        return merged;
      });
    };

    window.addEventListener("fabrica-load-snapshot", handlePrefillSnapshot as EventListener);
    return () => window.removeEventListener("fabrica-load-snapshot", handlePrefillSnapshot as EventListener);
  }, [enqueueProjectPersistence]);

  // Persistência: salva campos leves em uma chave, pesados em chaves separadas
  useEffect(() => {
    const userId = user?.id || (isLocalPreviewEnabled() ? LOCAL_PREVIEW_USER_ID : null);
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
      if (isLocalPreviewEnabled()) {
        activeUserIdRef.current = LOCAL_PREVIEW_USER_ID;
        setState((prev) => hasMeaningfulProgress(prev) ? prev : loadInitialState(LOCAL_PREVIEW_USER_ID));
        setHasLoadedFromDb(true);
        return;
      }
      activeUserIdRef.current = null;
      setState(createFreshState());
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
        return scopedLocal;
      }
      const hasScopedProgress = hasMeaningfulProgress(scopedLocal);
      const prevIsDefault = !hasMeaningfulProgress(prev);
      return hasScopedProgress && prevIsDefault ? scopedLocal : prev;
    });

    const hydrationUserId = user.id;
    const activeProjectIdAtStart = readActiveProjectId(hydrationUserId);
    let cancelled = false;
    const canApplyHydration = () =>
      !cancelled &&
      activeUserIdRef.current === hydrationUserId &&
      readActiveProjectId(hydrationUserId) === activeProjectIdAtStart;

    const loadSavedState = async () => {
      try {
        console.log("[Supabase Load] Iniciando carregamento do banco de dados...");
        const activeProjectId = activeProjectIdAtStart;
        const localSnapshot = readPersistedState(hydrationUserId, activeProjectId || undefined);
        const requestedCloudProjectId = activeProjectId
          || (isPersistedProjectId(localSnapshot.projectId) ? localSnapshot.projectId : null);
        const hasActiveProjectCache = Boolean(
          activeProjectId && localStorage.getItem(getProjectStorageKey(hydrationUserId, activeProjectId)),
        );
        let data: any = null;
        let error: any = null;

        // Um projeto temporário ativo representa uma criação intencional ainda não enviada.
        // Nesse caso não substituímos seu conteúdo pelo último projeto da nuvem.
        if (!activeProjectId || isPersistedProjectId(requestedCloudProjectId) || !hasActiveProjectCache) {
          let request: any = supabase
            .from("fabrica_diagnosticos")
            .select("id, state_snapshot, updated_at")
            .eq("user_id", hydrationUserId);
          request = isPersistedProjectId(requestedCloudProjectId)
            ? request.eq("id", requestedCloudProjectId)
            : request.order("updated_at", { ascending: false }).limit(1);
          const result = await request.maybeSingle();
          data = result.data;
          error = result.error;
        }

        // Uma troca de projeto durante a consulta torna esta resposta obsoleta.
        if (!canApplyHydration()) return;

        if (error) {
          console.warn("[Supabase Load] Falha ao carregar estado:", error.message);
          return;
        }

        if (data?.state_snapshot) {
          const cloudSnapshot = normalizeStateSnapshot(data.state_snapshot as Partial<FabricaState>, data.id);
          const sameProject = localSnapshot.projectId === data.id;
          const localIsNewer = sameProject
            && hasMeaningfulProgress(localSnapshot)
            && getStateTimestamp(localSnapshot) > getStateTimestamp(cloudSnapshot, data.updated_at);
          const legacyLocalIsNewer = !activeProjectId
            && !sameProject
            && hasMeaningfulProgress(localSnapshot)
            && getStateTimestamp(localSnapshot) > getStateTimestamp(cloudSnapshot, data.updated_at);

          let selected = (localIsNewer || legacyLocalIsNewer) ? localSnapshot : cloudSnapshot;
          if (sameProject && !localIsNewer) {
            // A nuvem não leva base64 pesado; completamos a mídia somente com
            // o cache local do MESMO projeto, inclusive hero e pacotes.
            selected = mergeSameProjectMedia(cloudSnapshot, localSnapshot);
          }

          stateRef.current = selected;
          setState(selected);
          persistLocalState(selected, hydrationUserId);
          clearLegacyState();
          console.log("[Supabase Load] Projeto ativo carregado sem misturar snapshots.");
        } else {
          const selected = hasMeaningfulProgress(localSnapshot) ? localSnapshot : createFreshState();
          stateRef.current = selected;
          setState(selected);
          persistLocalState(selected, hydrationUserId);
          console.log("[Supabase Load] Mantendo projeto local ativo.");
        }
      } catch (err) {
        if (!cancelled && activeUserIdRef.current === hydrationUserId) {
          console.error("[Supabase Load] Erro catastrófico ao carregar do Supabase:", err);
        }
      } finally {
        if (!cancelled && activeUserIdRef.current === hydrationUserId) {
          setHasLoadedFromDb(true);
        }
      }
    };

    void loadSavedState();
    return () => {
      cancelled = true;
    };
  }, [user?.id, authLoading]);

  // ☁️ PERSISTÊNCIA NUVEM: Sincroniza estado debounced com Supabase
  useEffect(() => {
    if (!user?.id || !hasLoadedFromDb) return; // 🛡️ Bloqueia sincronização antes da hidratação completa!
    
    const syncState = async () => {
      // 🛡️ SEGURANÇA DE HIDRATAÇÃO REFORÇADA: bloqueia sync de estado vazio ou de novo projeto sem nome
      const hasContent = hasMeaningfulProgress(state);
      if (!hasContent) return;

      setSyncStatus("saving");
      try {
        const logoIsTooBig = state.logoBase64 && state.logoBase64.length >= 400_000;
        if (logoIsTooBig) {
          console.warn("[Supabase Sync] Logo muito grande para nuvem (>400KB). Use uma imagem menor.");
          if (!sessionStorage.getItem('logo-size-warned')) {
            toast.warning("⚠️ Logo muito grande — ela fica salva neste dispositivo, mas não será sincronizada em outros. Use uma imagem abaixo de 300KB.", { duration: 8000 });
            sessionStorage.setItem('logo-size-warned', '1');
          }
        }

        const originalProjectId = state.projectId || createTemporaryProjectId();
        const persistence = enqueueProjectPersistence(
          { ...state, projectId: originalProjectId },
          user.id,
        );
        const { id } = await persistence;
        const activeProjectId = stateRef.current.projectId;
        const projectStillActive = activeProjectId === originalProjectId || activeProjectId === id;

        if (id !== originalProjectId) {
          if (stateRef.current.projectId === originalProjectId) {
            const resolved = { ...stateRef.current, projectId: id };
            stateRef.current = resolved;
            setState(resolved);
            persistLocalState(resolved, user.id);
            removeLocalProjectState(user.id, originalProjectId);
          }

          const publishedSlug = getSavedPublicSiteSlug(state);
          if (publishedSlug) {
            const { error: linkError } = await supabase
              .from("public_sites")
              .update({ project_id: id })
              .eq("id", publishedSlug)
              .eq("owner_id", user.id);
            if (linkError) throw linkError;
          }
        } else if (projectStillActive) {
          // Nunca regrave o ponteiro ativo usando o snapshot antigo da closure.
          persistLocalState(stateRef.current, user.id);
        }

        await queryClient.invalidateQueries({ queryKey: ["fabrica-diagnosticos"] });
        if (projectStillActive) {
          console.log("[Supabase Sync] ✓ Projeto salvo na nuvem");
          setLastSyncedAt(new Date());
          setSyncStatus("saved");
        }
      } catch (err) {
        console.warn("[Supabase Sync] Falha:", err);
        if (stateRef.current.projectId === state.projectId) {
          setSyncStatus("error");
        }
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
    hasLoadedFromDb,
    queryClient,
    enqueueProjectPersistence
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

  const applyPatch = useCallback(
    (
      patch: Partial<FabricaState>,
      options?: { recordHistory?: boolean; markEdited?: boolean }
    ) => {
      const { recordHistory = false, markEdited = false } = options || {};

      if (markEdited) {
        lastUserEditAtRef.current = Date.now();
      }

      if (recordHistory) {
        const snapshot = stateRef.current;
        historyRef.current.push(snapshot);
        if (historyRef.current.length > 50) historyRef.current.shift();
        redoStackRef.current = [];
        setHistoryCount(historyRef.current.length);
        setRedoCount(0);
      }

      setState((prev) => {
        const next = {
          ...prev,
          ...patch,
          ...(markEdited ? { lastEditedAt: new Date().toISOString() } : {}),
        };
        stateRef.current = next;
        if (activeUserIdRef.current) {
          persistLocalState(next, activeUserIdRef.current);
        }
        return next;
      });
    },
    []
  );

  const update = useCallback((patch: Partial<FabricaState>) => {
    applyPatch(patch, { recordHistory: true, markEdited: true });
  }, [applyPatch]);

  const systemUpdate = useCallback((patch: Partial<FabricaState>) => {
    applyPatch(patch, { recordHistory: false, markEdited: false });
  }, [applyPatch]);

  const undo = useCallback(() => {
    if (historyRef.current.length === 0) return;

    const previous = historyRef.current.pop()!;
    
    // Adiciona o estado atual à pilha de refazer (redo)
    redoStackRef.current.push(stateRef.current);
    
    // Atualiza a interface
    setHistoryCount(historyRef.current.length);
    setRedoCount(redoStackRef.current.length);
    
    stateRef.current = previous;
    setState(previous);
  }, []);

  const redo = useCallback(() => {
    if (redoStackRef.current.length === 0) return;

    const next = redoStackRef.current.pop()!;
    
    // Adiciona o estado atual à pilha de desfazer (history)
    historyRef.current.push(stateRef.current);
    
    // Atualiza a interface
    setHistoryCount(historyRef.current.length);
    setRedoCount(redoStackRef.current.length);
    
    stateRef.current = next;
    setState(next);
  }, []);

  const reset = useCallback(() => {
    const previousState = stateRef.current;
    if (user?.id && hasMeaningfulProgress(previousState)) {
      void enqueueProjectPersistence(previousState, user.id).catch((error) => {
        console.warn("[Supabase Sync] Não foi possível concluir o save do projeto anterior:", error);
      });
    }

    historyRef.current = [];
    redoStackRef.current = [];
    setHistoryCount(0);
    setRedoCount(0);
    const freshState = createFreshState();
    const temporaryId = freshState.projectId!;
    stateRef.current = freshState;
    setState(freshState);
    if (activeUserIdRef.current) {
      persistLocalState(freshState, activeUserIdRef.current);
    }

    if (user?.id) {
      setSyncStatus("saving");
      const persistence = enqueueProjectPersistence(freshState, user.id, "Novo projeto");

      void persistence.then(async ({ id }) => {
        const projectStillActive = stateRef.current.projectId === temporaryId || stateRef.current.projectId === id;
        if (stateRef.current.projectId === temporaryId) {
          const resolved = { ...stateRef.current, projectId: id };
          stateRef.current = resolved;
          setState(resolved);
          persistLocalState(resolved, user.id);
          removeLocalProjectState(user.id, temporaryId);
        }
        await queryClient.invalidateQueries({ queryKey: ["fabrica-diagnosticos"] });
        if (projectStillActive) {
          setLastSyncedAt(new Date());
          setSyncStatus("saved");
        }
      }).catch((error) => {
        console.warn("[Supabase Sync] Falha ao criar projeto vazio:", error);
        if (stateRef.current.projectId === temporaryId) {
          setSyncStatus("error");
          toast.error("Não foi possível salvar o novo projeto na nuvem. Suas edições continuam neste dispositivo.");
        }
      });
    }
  }, [enqueueProjectPersistence, queryClient, user?.id]);

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
        systemUpdate,
        reset,
        setPhase,
        toggleChecklist,
        undo,
        redo,
        canUndo: historyCount > 0,
        canRedo: redoCount > 0,
        syncStatus,
        lastSyncedAt,
        isHydrated: hasLoadedFromDb,
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
