export const SITE_TEMPLATE_IDS = [
  "standard",
  "horizonte",
  "ofertas",
  "experiencias",
  "expedicoes",
  "excursoes",
] as const;

export type SiteTemplateId = (typeof SITE_TEMPLATE_IDS)[number];

export type SiteTemplateLocale = "pt" | "es";

interface SiteTemplateCopy {
  label: string;
  audience: string;
  summary: string;
}

export interface SiteTemplateDefinition {
  id: SiteTemplateId;
  copy: Record<SiteTemplateLocale, SiteTemplateCopy>;
}

export const SITE_TEMPLATE_CATALOG: readonly SiteTemplateDefinition[] = [
  {
    id: "standard",
    copy: {
      pt: {
        label: "Padrão",
        audience: "Portfólio variado",
        summary: "Equilíbrio entre agência, pacotes e contato.",
      },
      es: {
        label: "Estándar",
        audience: "Portafolio variado",
        summary: "Equilibrio entre agencia, paquetes y contacto.",
      },
    },
  },
  {
    id: "horizonte",
    copy: {
      pt: {
        label: "Horizonte",
        audience: "Consultoria premium",
        summary: "Fotografia ampla e narrativa mais sofisticada.",
      },
      es: {
        label: "Horizonte",
        audience: "Consultoría premium",
        summary: "Fotografía amplia y narrativa sofisticada.",
      },
    },
  },
  {
    id: "ofertas",
    copy: {
      pt: {
        label: "Ofertas",
        audience: "Emissivo e promoções",
        summary: "Preço, condições e decisão rápida em primeiro plano.",
      },
      es: {
        label: "Ofertas",
        audience: "Paquetes y promociones",
        summary: "Precio, condiciones y decisión rápida en primer plano.",
      },
    },
  },
  {
    id: "experiencias",
    copy: {
      pt: {
        label: "Experiências",
        audience: "Receptivo e passeios",
        summary: "Imagens imersivas para descobrir o destino local.",
      },
      es: {
        label: "Experiencias",
        audience: "Receptivo y paseos",
        summary: "Imágenes inmersivas para descubrir el destino local.",
      },
    },
  },
  {
    id: "expedicoes",
    copy: {
      pt: {
        label: "Expedições",
        audience: "Aventura e natureza",
        summary: "Roteiros intensos com leitura visual e ritmo de jornada.",
      },
      es: {
        label: "Expediciones",
        audience: "Aventura y naturaleza",
        summary: "Rutas intensas con lectura visual y ritmo de viaje.",
      },
    },
  },
  {
    id: "excursoes",
    copy: {
      pt: {
        label: "Excursões",
        audience: "Grupos e saídas",
        summary: "Datas, confiança e organização ganham destaque.",
      },
      es: {
        label: "Excursiones",
        audience: "Grupos y salidas",
        summary: "Fechas, confianza y organización ganan protagonismo.",
      },
    },
  },
] as const;

const SITE_TEMPLATE_ID_SET = new Set<string>(SITE_TEMPLATE_IDS);

export const normalizeSiteTemplateId = (value: unknown): SiteTemplateId =>
  typeof value === "string" && SITE_TEMPLATE_ID_SET.has(value)
    ? (value as SiteTemplateId)
    : "standard";

export const getSiteTemplateDefinition = (value: unknown): SiteTemplateDefinition => {
  const id = normalizeSiteTemplateId(value);
  return SITE_TEMPLATE_CATALOG.find((template) => template.id === id) ?? SITE_TEMPLATE_CATALOG[0];
};
