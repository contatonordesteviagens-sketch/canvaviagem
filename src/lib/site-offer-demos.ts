import type { FabricaState, Pacote } from "@/hooks/useFabricaContext";
import { buildLandingHTML } from "@/lib/fabrica-html-export";
import type { SiteTemplateId } from "@/lib/site-template-catalog";

export type SiteOfferDemo = {
  id: string;
  agencyName: string;
  category: string;
  templateId: SiteTemplateId;
  templateLabel: string;
  accent: string;
  packageNames: string[];
  html: string;
};

type DemoDefinition = Omit<SiteOfferDemo, "html" | "packageNames"> & {
  city: string;
  logoUrl: string;
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  heroImageUrl: string;
  headline: string;
  subheadline: string;
  packages: Pacote[];
};

const image = (id: string) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1400&q=84`;

const demoAsset = (fileName: string) =>
  new URL(`/demo-sites/${fileName}`, window.location.origin).href;

const packageItem = (
  id: string,
  title: string,
  price: string,
  imageUrl: string,
  details: Partial<Pacote>,
): Pacote => ({
  id,
  title,
  price,
  imageUrl,
  description: details.description || "Pacote completo com atendimento especializado.",
  ctaLabel: "Pedir orçamento",
  availability: "disponivel",
  highlights: [],
  included: [],
  notIncluded: [],
  itinerary: [],
  ...details,
});

const definitions: DemoDefinition[] = [
  {
    id: "brisa-brasil",
    agencyName: "Brisa Brasil Viagens",
    category: "Pacotes nacionais",
    templateId: "ofertas",
    templateLabel: "Ofertas",
    accent: "#007D96",
    city: "Recife, PE",
    logoUrl: demoAsset("brisa-brasil.svg"),
    primaryColor: "#007D96",
    secondaryColor: "#FFCB45",
    backgroundColor: "#F4FBFC",
    heroImageUrl: image("photo-1598515214211-89d3c73ae83b"),
    headline: "O Brasil que você sonha, com tudo organizado para embarcar.",
    subheadline: "Pacotes nacionais com hospedagem, traslados e atendimento do primeiro orçamento até a volta para casa.",
    packages: [
      packageItem("brisa-jeri", "Jericoacoara Essencial, 5 dias", "10x de R$ 289", image("photo-1509316785289-025f5b846b35"), {
        badge: "Mais procurado",
        segment: "pacote",
        subtitle: "Vila de Jeri, Lagoa do Paraíso e passeio pelo litoral leste",
        longDescription: "Uma viagem completa para conhecer os cartões-postais de Jericoacoara sem perder tempo organizando cada etapa separadamente.",
        travelDates: "Saídas semanais de agosto a dezembro",
        duration: "5 dias e 4 noites",
        departureLocation: "Fortaleza",
        accommodation: "Pousada selecionada com café da manhã",
        paymentTerms: "Entrada + saldo em até 10x no cartão",
        highlights: ["Lagoa do Paraíso", "Pedra Furada", "Pôr do sol na duna"],
        included: ["Hospedagem", "Café da manhã", "Traslado Fortaleza–Jeri", "Passeio litoral leste"],
        notIncluded: ["Passagem aérea", "Alimentação não mencionada"],
        itinerary: ["Dia 1: chegada e traslado", "Dia 2: litoral leste", "Dia 3: dia livre", "Dia 4: vila e pôr do sol", "Dia 5: retorno"],
      }),
      packageItem("brisa-porto", "Porto de Galinhas em Família", "12x de R$ 319", image("photo-1507525428034-b723cf961d3e"), {
        badge: "Família",
        segment: "pacote",
        subtitle: "Piscinas naturais, resort e tempo livre para toda a família",
        travelDates: "Setembro e outubro",
        duration: "6 dias e 5 noites",
        accommodation: "Resort 4 estrelas com café da manhã",
        paymentTerms: "Até 12x no cartão",
        highlights: ["Piscinas naturais", "Praia de Muro Alto", "Estrutura para crianças"],
        included: ["Hospedagem", "Café da manhã", "Traslados", "Passeio de jangada"],
      }),
      packageItem("brisa-noronha", "Fernando de Noronha Exclusivo", "12x de R$ 649", image("photo-1507525428034-b723cf961d3e"), {
        badge: "Experiência premium",
        segment: "sob-medida",
        subtitle: "Praias preservadas, barco e roteiro pensado para o casal",
        travelDates: "Datas sob consulta",
        duration: "5 dias e 4 noites",
        accommodation: "Pousada boutique com café da manhã",
        availability: "sob-consulta",
        highlights: ["Baía do Sancho", "Passeio de barco", "Pôr do sol no Boldró"],
        included: ["Hospedagem", "Transfers", "Ilha tour", "Passeio de barco"],
      }),
    ],
  },
  {
    id: "atlas-mundo",
    agencyName: "Atlas Mundo",
    category: "Viagens internacionais",
    templateId: "horizonte",
    templateLabel: "Horizonte",
    accent: "#D9B86C",
    city: "São Paulo, SP",
    logoUrl: demoAsset("atlas-mundo.svg"),
    primaryColor: "#10233F",
    secondaryColor: "#D9B86C",
    backgroundColor: "#F7F2E8",
    heroImageUrl: image("photo-1502602898657-3e91760cbb34"),
    headline: "Grandes viagens começam com um roteiro bem cuidado.",
    subheadline: "Curadoria internacional para casais e famílias que querem viajar com escolhas seguras e suporte em português.",
    packages: [
      packageItem("atlas-paris", "Paris Romântica — 6 noites", "12x de R$ 799", image("photo-1502602898657-3e91760cbb34"), {
        badge: "Lua de mel",
        segment: "sob-medida",
        subtitle: "Hotel central, passeio pelo Sena e experiências para dois",
        longDescription: "Uma seleção de experiências clássicas de Paris com tempo livre para o casal viver a cidade no próprio ritmo.",
        travelDates: "Março, abril e maio",
        duration: "7 dias e 6 noites",
        accommodation: "Hotel 4 estrelas no centro",
        paymentTerms: "Entrada de 20% + até 12x",
        highlights: ["Torre Eiffel", "Cruzeiro pelo Sena", "Montmartre"],
        included: ["Aéreo ida e volta", "Hotel com café", "Transfer", "Passeio panorâmico"],
      }),
      packageItem("atlas-roma", "Roma & Toscana — 8 dias", "12x de R$ 949", image("photo-1552832230-c0197dd311b5"), {
        badge: "Roteiro autoral",
        segment: "sob-medida",
        subtitle: "História, gastronomia e cidades que parecem cenário de filme",
        travelDates: "Abril e setembro",
        duration: "8 dias e 7 noites",
        accommodation: "Hotéis 4 estrelas",
        highlights: ["Coliseu", "Vaticano", "Florença", "Vinícola na Toscana"],
        included: ["Aéreo", "Hospedagem", "Trens internos", "Dois passeios guiados"],
      }),
      packageItem("atlas-dubai", "Dubai para Toda a Família", "12x de R$ 1.089", image("photo-1512453979798-5ea266f8880c"), {
        badge: "Férias escolares",
        segment: "pacote",
        subtitle: "Cidade, deserto e atrações para adultos e crianças",
        travelDates: "Janeiro e julho",
        duration: "7 dias e 6 noites",
        accommodation: "Hotel 5 estrelas com café da manhã",
        highlights: ["Burj Khalifa", "Safári no deserto", "Abu Dhabi"],
        included: ["Aéreo", "Hotel", "Traslados", "City tour", "Safári"],
      }),
    ],
  },
  {
    id: "viva-ceara",
    agencyName: "Viva Ceará Receptivo",
    category: "Passeios e receptivo",
    templateId: "experiencias",
    templateLabel: "Experiências",
    accent: "#13A896",
    city: "Fortaleza, CE",
    logoUrl: demoAsset("viva-ceara.svg"),
    primaryColor: "#073B3A",
    secondaryColor: "#FFC857",
    backgroundColor: "#F2FAF8",
    heroImageUrl: image("photo-1500534623283-312aade485b7"),
    headline: "Conheça o Ceará de verdade.",
    subheadline: "Passeios locais com guia, transporte e informação clara para você aproveitar cada dia sem improviso.",
    packages: [
      packageItem("viva-jeri", "Jericoacoara, Litoral Leste", "R$ 189 por pessoa", image("photo-1509316785289-025f5b846b35"), {
        badge: "Saída diária",
        segment: "passeio",
        subtitle: "Árvore da Preguiça, Buraco Azul e Lagoa do Paraíso",
        longDescription: "Um dia inteiro para conhecer as paisagens mais famosas do litoral leste de Jericoacoara com transporte e acompanhamento local.",
        travelDates: "Todos os dias, saída às 8h",
        duration: "8 horas",
        meetingPoint: "Busca nas pousadas da Vila de Jeri",
        priceDetails: "Valor por pessoa; taxas locais não inclusas",
        highlights: ["Buraco Azul", "Lagoa do Paraíso", "Praia do Preá"],
        included: ["Transporte 4x4", "Motorista credenciado", "Busca na pousada"],
        notIncluded: ["Almoço", "Ingressos e taxas ambientais"],
      }),
      packageItem("viva-cumbuco", "Cumbuco com Passeio de Buggy", "R$ 159 por pessoa", image("photo-1509316785289-025f5b846b35"), {
        badge: "Aventura",
        segment: "passeio",
        subtitle: "Dunas, lagoas e emoção com ou sem adrenalina",
        travelDates: "Terça a domingo",
        duration: "6 horas",
        departureLocation: "Hotéis de Fortaleza",
        highlights: ["Passeio de buggy", "Lagoa do Banana", "Dunas do Cumbuco"],
        included: ["Transporte ida e volta", "Buggy compartilhado", "Guia local"],
      }),
      packageItem("viva-fortaleza", "Fortaleza Essencial, City Tour", "R$ 89 por pessoa", image("photo-1500534623283-312aade485b7"), {
        badge: "Primeira visita",
        segment: "passeio",
        subtitle: "História, cultura, orla e os pontos mais conhecidos da capital",
        travelDates: "Segundas, quartas e sextas",
        duration: "4 horas",
        meetingPoint: "Busca nos hotéis da orla",
        highlights: ["Praia de Iracema", "Mercado Central", "Centro Dragão do Mar"],
        included: ["Transporte climatizado", "Guia credenciado", "Seguro passageiro"],
      }),
    ],
  },
];

const createDemoState = (demo: DemoDefinition): FabricaState => ({
  projectId: `modelo-${demo.id}`,
  agencyName: demo.agencyName,
  agencyType: demo.templateId === "experiencias" ? "receptiva" : "pequena",
  city: demo.city,
  address: demo.city,
  agencyEmail: `contato@${demo.id}.com.br`,
  whatsapp: "85998458995",
  whatsappDialCode: "55",
  socialLinks: [],
  logoBase64: demo.logoUrl,
  primaryColor: demo.primaryColor,
  secondaryColor: demo.secondaryColor,
  backgroundColor: demo.backgroundColor,
  selectedPackages: demo.packages,
  destinos: demo.packages.map((item) => item.title.split("—")[0].trim()),
  depoimentos: [],
  sectionOrder: ["hero", "processo", "destinos", "porQue", "orcamento", "faq", "finalCta"],
  metaPixelId: "",
  ga4Id: "",
  siteContent: {
    templateId: demo.templateId,
    heroHeadline: demo.headline,
    heroSubheadline: demo.subheadline,
    heroCtaLabel: "Testar pedido de orçamento",
    heroSecondaryCtaLabel: "Ver experiências",
    heroEyebrow: `MODELO DEMONSTRATIVO • ${demo.category.toUpperCase()}`,
    heroImageUrl: demo.heroImageUrl,
    pacotesTitle: "Experiências em destaque",
    destinosEyebrow: "Escolha sua próxima viagem",
    processoEyebrow: "Como funciona",
    processoTitle: "Do interesse ao embarque em 3 passos",
    processoSteps: [
      { num: "1", title: "Escolha", desc: "Veja fotos, datas, valores e tudo o que está incluído." },
      { num: "2", title: "Converse", desc: "Peça seu orçamento pelo formulário ou pelo WhatsApp." },
      { num: "3", title: "Viaje", desc: "Confirme os detalhes e receba acompanhamento até o embarque." },
    ],
    equipeBadge: "MODELO OFICIAL CANVA VIAGEM",
    equipeEyebrow: "Atendimento",
    equipeTitle: "Informação clara antes de você decidir",
    equipeIntro: "Marca, textos, valores e pacotes desta demonstração foram preenchidos para mostrar uma experiência completa ao viajante.",
    equipeFeatures: [
      { icon: "✓", title: "Pacotes completos", desc: "Fotos, datas, condições, inclusões e roteiro em uma única página." },
      { icon: "✓", title: "Contato direto", desc: "Formulário e WhatsApp sempre visíveis para facilitar o pedido de orçamento." },
      { icon: "✓", title: "Edição simples", desc: "A agência troca textos, imagens, cores e pacotes dentro da plataforma." },
      { icon: "✓", title: "Feito para celular", desc: "A estrutura se adapta a telas pequenas e ao computador." },
    ],
    depoimentosTitle: "Quem viajou recomenda",
    faqTitle: "Dúvidas antes de pedir orçamento",
    faqEyebrow: "Perguntas frequentes",
    faq: [
      { q: "Posso personalizar este modelo?", a: "Sim. Nome, logo, cores, imagens, textos, pacotes e contatos podem ser alterados." },
      { q: "Este pacote é uma oferta real?", a: "Não. Esta é uma demonstração oficial do Canva Viagem; nomes, preços e condições são exemplos visuais." },
      { q: "O site funciona no celular?", a: "Sim. O modelo foi preparado para computador e celular." },
    ],
    orcamentoEyebrow: "Peça uma proposta",
    orcamentoTitle: "Quer montar uma viagem como esta?",
    orcamentoText: "Esta é uma demonstração. Ao enviar, você abre o atendimento oficial do Canva Viagem no WhatsApp.",
    atendimentoText: "Atendimento em horário comercial",
    formSubmitLabel: "Falar com o Canva Viagem no WhatsApp",
    finalCtaTitle: "Sua próxima viagem pode começar aqui.",
    finalCtaLabel: "Falar com o Canva Viagem",
    footerText: "Modelo demonstrativo oficial do Canva Viagem. Marca, pacotes, preços e condições são fictícios.",
    footerCopyrightText: "Modelo demonstrativo — Canva Viagem",
    galleryImages: demo.packages.map((item) => item.imageUrl || ""),
    sections: {
      hero: true,
      processo: true,
      destinos: true,
      porQue: true,
      depoimentos: false,
      orcamento: true,
      faq: true,
      finalCta: true,
    },
    animationEffect: "none",
    animationLocation: "all",
    animationDuration: "always",
    stats: [
      { num: "3", label: "Roteiros selecionados" },
      { num: "Atendimento", label: "Antes e durante a viagem" },
      { num: "Compra segura", label: "Condições transparentes" },
      { num: "Suporte", label: "Fale com nossa equipe" },
    ],
  },
} as FabricaState);

const demoOrder = ["atlas-mundo", "viva-ceara", "brisa-brasil"];

export const siteOfferDemos: SiteOfferDemo[] = [...definitions]
  .sort((a, b) => demoOrder.indexOf(a.id) - demoOrder.indexOf(b.id))
  .map((demo) => ({
  id: demo.id,
  agencyName: demo.agencyName,
  category: demo.category,
  templateId: demo.templateId,
  templateLabel: demo.templateLabel,
  accent: demo.accent,
  packageNames: demo.packages.map((item) => item.title),
  html: buildLandingHTML(createDemoState(demo)).replace(
    "</head>",
    `<style>#por-que.equipe{background:#0b1324!important}#por-que .equipe-left h2,#por-que .equipe-left .intro,#por-que .feat h4,#por-que .feat p{color:#fff!important}#por-que .equipe-left .intro,#por-que .feat p{opacity:.82}</style></head>`,
  ),
}));
