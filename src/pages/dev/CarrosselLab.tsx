/**
 * LABORATÓRIO DE CARROSSÉIS (só em desenvolvimento).
 *
 * Desenha os 12 estilos de slide do carrossel (capa, miolo e fechamento) com dados
 * de exemplo, sem login, para diagnóstico visual antes/depois.
 *
 * URL: /dev/carrossel-lab?format=feed|story&palette=cv|cvc|teal|wine&v=impact&long=1&logo=0
 */
import { CarouselSlide, CarouselSlideVariant, ScaledSlidePreview } from "@/components/fabrica/F1CarouselBuilder";

const PHOTO = "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1600&q=80";
const PHOTO2 = "https://images.unsplash.com/photo-1519046904884-53103b34b206?w=1600&q=80";
const LOGO = "/artes/canvaviagem_premium_logo_1772930557454.png";

const PALETTES: Record<string, [string, string]> = {
  cv: ["#080808", "#F5F906"],
  cvc: ["#0B3B8C", "#FFD400"],
  laranja: ["#F39C0F", "#7A4B00"],
  teal: ["#0B8C8F", "#FFFFFF"],
  wine: ["#7A1F3D", "#F2E8D5"],
};

export const VARIANTS: CarouselSlideVariant[] = [
  "pro-bold", "pro-split", "pro-magazine", "pro-luxe",
  "impact", "itinerary", "editorial", "oferta", "minimalist", "vibrant",
  "organic", "glass", "headline", "headline-center", "headline-footer", "ticket",
];

function makeSlides(variant: CarouselSlideVariant, dest: string, long: boolean): CarouselSlide[] {
  const base = {
    imageUrl: PHOTO,
    textColor: "#ffffff",
    cta: "",
    phone: "",
    slideVariant: variant,
    bulletIcon: "check",
    coverSource: "native" as const,
  };
  const bullets = long
    ? ["Transporte rodoviário ida e volta", "Hospedagem 4 noites com café da manhã", "Passeio de buggy pelas praias", "Guia credenciado Cadastur"]
    : ["Novas experiências", "Paisagens para recordar", "Momentos além das fotos"];
  return [
    {
      ...base,
      id: "c",
      kind: "cover",
      label: "INSPIRE-SE",
      title: long ? `Réveillon em ${dest} com tudo incluso para a família toda` : `Motivos para colocar ${dest} na sua lista`,
      body: long ? "Cinco dias de praia, passeios e descanso, saindo de Maceió, a partir de 10x R$ 1.299,00 por pessoa." : "Saindo de Recife. A partir de 10x R$ 195,90 por pessoa.",
      bullets,
    },
    {
      ...base,
      id: "s",
      kind: "content",
      imageUrl: PHOTO2,
      label: "02",
      title: long ? "O que está incluso no pacote e o que você não precisa se preocupar" : "Experiências que você não vive todos os dias",
      body: long ? "Paisagens, experiências e momentos que fazem essa viagem valer a pena, com tudo resolvido antes de embarcar." : "Paisagens, experiências e momentos que fazem essa viagem valer a pena.",
      bullets,
    },
    {
      ...base,
      id: "f",
      kind: "closing",
      label: "E AÍ?",
      title: `${dest} entrou para sua lista?`,
      body: "",
      bullets: [],
      cta: "PLANEJE SUA VIAGEM COM A GENTE.",
      phone: "+55 82993702220",
      instagram: "@ilandnoronha",
      contactChannels: ["whatsapp", "instagram"],
    },
  ];
}

export default function CarrosselLab() {
  const params = new URLSearchParams(window.location.search);
  const story = params.get("format") === "story";
  const ratio = story ? 9 / 16 : 4 / 5;
  const [primary, secondary] = PALETTES[params.get("palette") || "cv"] || PALETTES.cv;
  const only = params.get("v") as CarouselSlideVariant | null;
  const long = params.get("long") === "1";
  const dest = params.get("dest") || "Fernando de Noronha";
  const logo = params.get("logo") === "0" ? "" : LOGO;
  const vs = params.get("vs");
  const variants = only ? [only] : vs ? (vs.split(",") as CarouselSlideVariant[]) : VARIANTS;
  const w = story ? 240 : 300;

  return (
    <div style={{ background: "#1a1a1a", minHeight: "100vh", padding: 16, color: "#fff", fontFamily: "Inter, sans-serif" }}>
      <div data-testid="lab-status" style={{ fontSize: 12, marginBottom: 12 }}>
        carrossel · {story ? "story" : "feed"} · {params.get("palette") || "cv"} · {long ? "longo" : "curto"} · {variants.length} estilos
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        {variants.map((variant) => {
          const slides = makeSlides(variant, dest, long);
          return (
            <div key={variant}>
              <div style={{ fontSize: 13, fontWeight: 800, marginBottom: 6 }}>{variant}</div>
              <div style={{ display: "flex", gap: 12 }}>
                {slides.map((slide, i) => (
                  <div key={slide.id} style={{ width: w }}>
                    <ScaledSlidePreview
                      slide={slide}
                      index={i}
                      total={slides.length}
                      ratio={ratio}
                      logo={logo}
                      logoPosition="top-right"
                      primary={primary}
                      secondary={secondary}
                      background="#F4F6F9"
                      width={w}
                      showPixBanner={false}
                    />
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
