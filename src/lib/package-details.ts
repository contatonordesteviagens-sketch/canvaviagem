import type { AgencyType, PackageAvailability, PackageSegment } from "@/hooks/useFabricaContext";

export const PACKAGE_SEGMENT_OPTIONS: Array<{ value: PackageSegment; label: string }> = [
  { value: "passeio", label: "Passeio / receptivo" },
  { value: "pacote", label: "Pacote / emissivo" },
  { value: "sob-medida", label: "Viagem sob medida / luxo" },
  { value: "grupo", label: "Grupo / excursão" },
  { value: "cruzeiro", label: "Cruzeiro" },
  { value: "aventura", label: "Aventura / ecoturismo" },
  { value: "religioso", label: "Turismo religioso" },
  { value: "corporativo", label: "Corporativo / evento" },
  { value: "outro", label: "Outro" },
];

export const PACKAGE_AVAILABILITY_OPTIONS: Array<{ value: PackageAvailability; label: string }> = [
  { value: "disponivel", label: "Disponível" },
  { value: "ultimas-vagas", label: "Últimas vagas" },
  { value: "saida-confirmada", label: "Saída confirmada" },
  { value: "sob-consulta", label: "Sob consulta" },
  { value: "lista-de-espera", label: "Lista de espera" },
  { value: "esgotado", label: "Esgotado" },
];

type PackageGuidance = {
  description: string;
  dates: string;
  duration: string;
  departure: string;
  meetingPoint: string;
  accommodation: string;
  priceDetails: string;
  highlights: string;
  included: string;
  itinerary: string;
  requirements: string;
  documents: string;
};

const DEFAULT_GUIDANCE: PackageGuidance = {
  description: "Explique como será a experiência, para quem ela é indicada e o principal diferencial.",
  dates: "Ex.: 15 a 20/11/2026 ou saídas diárias",
  duration: "Ex.: 6 dias e 5 noites",
  departure: "Ex.: Saindo de Fortaleza",
  meetingPoint: "Ex.: Encontro no hotel às 07h30",
  accommodation: "Ex.: Hotel 4 estrelas, quarto duplo e café da manhã",
  priceDetails: "Ex.: Valor por pessoa em quarto duplo; taxas incluídas",
  highlights: "Uma informação por linha\nPôr do sol nas dunas\nGuia local especializado",
  included: "Um item por linha\nHospedagem\nTraslados\nCafé da manhã",
  itinerary: "Uma etapa por linha\nDia 1: chegada e recepção\nDia 2: passeio principal",
  requirements: "Um item por linha\nIdade mínima de 12 anos\nLevar calçado fechado",
  documents: "Um item por linha\nDocumento oficial com foto\nPassaporte válido",
};

const GUIDANCE_BY_SEGMENT: Partial<Record<PackageSegment, Partial<PackageGuidance>>> = {
  passeio: {
    dates: "Ex.: Saídas de terça a domingo, às 08h e 14h",
    duration: "Ex.: 4 horas",
    departure: "Ex.: Busca em hotéis da orla",
    meetingPoint: "Ex.: Recepção do hotel, 15 min antes",
    accommodation: "Se houver pernoite, informe o hotel e o tipo de quarto",
    priceDetails: "Ex.: Por pessoa; ingresso e transporte incluídos",
    requirements: "Um item por linha\nLevar protetor solar\nCrianças a partir de 6 anos",
  },
  pacote: {
    dates: "Ex.: 10 a 15/09/2026 — 5 noites",
    departure: "Ex.: Saindo de Fortaleza, voo direto",
    meetingPoint: "Ex.: Aeroporto de Fortaleza, balcão da companhia",
    accommodation: "Ex.: Resort 4 estrelas, apartamento duplo, meia pensão",
    priceDetails: "Ex.: Por pessoa em apartamento duplo; informe bagagem e taxas",
    documents: "Um item por linha\nRG com menos de 10 anos\nAutorização para menor, se aplicável",
  },
  "sob-medida": {
    description: "Apresente um roteiro inspiracional e deixe claro o que pode ser personalizado.",
    dates: "Ex.: Melhor período entre maio e setembro; datas flexíveis",
    duration: "Ex.: Roteiro-exemplo de 8 dias, personalizável",
    departure: "Ex.: Embarque a definir conforme a cidade do viajante",
    accommodation: "Ex.: Villa privativa ou hotel boutique selecionado",
    priceDetails: "Ex.: Investimento estimado; valor final após personalização",
    highlights: "Uma informação por linha\nGuia privado\nConcierge durante toda a viagem\nExperiências exclusivas",
  },
  grupo: {
    dates: "Ex.: Saída em 15/11/2026, sujeita a quórum até 10/08",
    departure: "Ex.: Embarques em Fortaleza e Caucaia",
    meetingPoint: "Ex.: Praça X às 05h; tolerância de 15 minutos",
    accommodation: "Ex.: Quarto duplo; suplemento para quarto individual",
    priceDetails: "Ex.: Por pessoa em quarto duplo; sinal + 10 parcelas",
    requirements: "Um item por linha\nMínimo de 20 passageiros\nBagagem: 1 mala de até 23 kg",
  },
  cruzeiro: {
    dates: "Ex.: 7 noites — embarque em Santos em 20/12/2026",
    duration: "Ex.: 7 noites, com 2 dias de navegação",
    departure: "Ex.: Porto de Santos; check-in conforme horário do voucher",
    meetingPoint: "Ex.: Terminal marítimo de passageiros",
    accommodation: "Ex.: Cabine interna, ocupação dupla, categoria garantida",
    priceDetails: "Ex.: Por pessoa em cabine dupla; informe taxas portuárias e gorjetas",
    documents: "Um item por linha\nPassaporte válido\nVisto, quando exigido\nSeguro-viagem recomendado",
  },
  aventura: {
    dates: "Ex.: Sábados, operação condicionada ao clima",
    duration: "Ex.: 4–5h de atividade; 8 km ida e volta; +450 m",
    departure: "Ex.: Traslado a partir do centro às 06h30",
    meetingPoint: "Ex.: Base da operadora, chegada 30 min antes",
    priceDetails: "Ex.: Por pessoa; equipamento e seguro incluídos",
    requirements: "Um item por linha\nCondicionamento para subidas contínuas\nPeso máximo de 110 kg\nCalçado fechado obrigatório",
  },
  religioso: {
    dates: "Ex.: Romaria de 10 a 14/10/2026",
    duration: "Ex.: 5 dias; caminhada média de 6 km por dia",
    departure: "Ex.: Embarque na Paróquia X às 05h",
    accommodation: "Ex.: Hotel simples, quarto duplo, pensão completa",
    highlights: "Uma informação por linha\nAcompanhamento espiritual\nCelebrações opcionais\nVisita aos santuários",
    requirements: "Um item por linha\nVestimenta adequada aos locais sagrados\nCaminhada diária aproximada de 6 km",
  },
  corporativo: {
    dates: "Ex.: Congresso X — 12 a 14/08/2026",
    duration: "Ex.: 3 dias e 2 noites",
    departure: "Ex.: Opções de voo dentro da política da empresa",
    meetingPoint: "Ex.: Credenciamento no pavilhão às 08h",
    accommodation: "Ex.: Hotel próximo ao evento, tarifa corporativa",
    priceDetails: "Ex.: Valor por viajante; faturamento e centro de custo sob consulta",
    requirements: "Um item por linha\nNome completo para credenciamento\nAprovação do gestor\nRestrições alimentares",
  },
};

export function suggestPackageSegment(agencyType: AgencyType): PackageSegment {
  if (agencyType === "receptiva") return "passeio";
  if (agencyType === "luxo") return "sob-medida";
  if (agencyType === "grupos") return "grupo";
  if (agencyType === "cruzeiros") return "cruzeiro";
  if (agencyType === "ecoturismo") return "aventura";
  if (agencyType === "religioso") return "religioso";
  if (agencyType === "corporativa" || agencyType === "consolidadora") return "corporativo";
  return "pacote";
}

export function getPackageGuidance(segment: PackageSegment): PackageGuidance {
  return { ...DEFAULT_GUIDANCE, ...(GUIDANCE_BY_SEGMENT[segment] || {}) };
}

export function buildPackageSlug(value: string, fallbackId = "pacote"): string {
  const slug = value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 120)
    .replace(/-+$/g, "");
  const fallback = String(fallbackId || "pacote")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase()
    .slice(0, 120);
  return slug || fallback || "pacote";
}

export function createUniquePackageSlug(value: string, usedSlugs: Iterable<string>, fallbackId = "pacote"): string {
  const used = new Set(Array.from(usedSlugs, (item) => buildPackageSlug(item)));
  const base = buildPackageSlug(value, fallbackId);
  if (!used.has(base)) return base;
  let suffix = 2;
  while (suffix < 10_000) {
    const marker = `-${suffix}`;
    const candidate = `${base.slice(0, 120 - marker.length).replace(/-+$/g, "")}${marker}`;
    if (!used.has(candidate)) return candidate;
    suffix += 1;
  }
  const marker = `-${Date.now().toString(36)}`;
  return `${base.slice(0, 120 - marker.length).replace(/-+$/g, "")}${marker}`;
}

export function linesToList(value: string): string[] {
  const seen = new Set<string>();
  return value
    .split("\n")
    .map((item) => item.trim())
    .filter((item) => {
      const key = item.toLocaleLowerCase("pt-BR");
      if (!item || seen.has(key)) return false;
      seen.add(key);
      return true;
    });
}
