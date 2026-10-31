/**
 * LABORATÓRIO DE ARTES (só em desenvolvimento).
 *
 * Desenha todas as variações do motor de anúncios (fabrica-compose-art) com
 * dados de exemplo, sem login, para diagnóstico visual e comparação antes/depois.
 *
 * URL: /dev/artes-lab?format=square|story&cat=oferta|experiencia&photo=0..2&v=0..8&scale=1
 *      &palette=cv|cvc|teal|wine&city=Maceió&legacy=1 (layouts antigos)
 *      &font=Playfair%20Display|Outfit|Montserrat&pay=installments|cash|down_plus|from|free_quote
 *      &long=1 (títulos e benefícios longos, 6 itens)&cents=0&logo=0
 */
import { useEffect, useState } from "react";
import { composeTravelAd } from "@/lib/fabrica-compose-art";
import { getArtTweakPreset, loadArtTweakPresets } from "@/lib/fabrica-art-tweak-presets";

const PHOTOS = [
  "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1600&q=80", // praia
  "https://images.unsplash.com/photo-1519046904884-53103b34b206?w=1600&q=80", // praia 2
  "https://images.unsplash.com/photo-1483729558449-99ef09a8c325?w=1600&q=80", // Rio
];

// Paletas de agências reais para testar contraste: (principal, secundária)
const PALETTES: Record<string, [string, string]> = {
  cv: ["#080808", "#F5F906"],   // Canva Viagem
  cvc: ["#0B3B8C", "#FFD400"],  // azul + amarelo
  teal: ["#0B8C8F", "#FFFFFF"], // turquesa + branco
  wine: ["#7A1F3D", "#F2E8D5"], // vinho + creme
};

const LOGO = "/artes/canvaviagem_premium_logo_1772930557454.png";

const DEFAULT_HIGHLIGHTS = [
  { text: "Transporte incluso", icon: "onibus" },
  { text: "Hospedagem", icon: "placa-do-hotel" },
  { text: "Café da manhã", icon: "cafe-da-manha" },
  { text: "Guia local", icon: "guia-turistico" },
];
const EXP_HIGHLIGHTS = [
  { text: "Passeio de barco privativo", icon: "ship" },
  { text: "Hospedagem boutique", icon: "placa-do-hotel" },
  { text: "Jantar ao pôr do sol", icon: "cafe-da-manha" },
];
// Cenário "muito texto": 6 itens compridos, como clientes reais digitam.
const LONG_HIGHLIGHTS = [
  { text: "Transporte rodoviário ida e volta", icon: "onibus" },
  { text: "Hospedagem 4 noites com café", icon: "placa-do-hotel" },
  { text: "Passeio de buggy pelas praias", icon: "map" },
  { text: "Guia credenciado Cadastur", icon: "guia-turistico" },
  { text: "Seguro viagem incluso", icon: "check" },
  { text: "City tour histórico", icon: "camera" },
];
// Formas de pagamento reais (mesmos campos que o formulário da Fábrica manda).
const PAY: Record<string, { paymentMode: string; paymentLabel: string; paymentSuffix: string; pricePrefix: string }> = {
  installments: { paymentMode: "installments", paymentLabel: "", paymentSuffix: "por pessoa", pricePrefix: "a partir de" },
  cash: { paymentMode: "cash", paymentLabel: "À VISTA", paymentSuffix: "por pessoa no Pix", pricePrefix: "" },
  down_plus: { paymentMode: "down_plus", paymentLabel: "ENTRADA +", paymentSuffix: "por pessoa, em até 10x", pricePrefix: "entrada de" },
  from: { paymentMode: "from", paymentLabel: "", paymentSuffix: "o casal", pricePrefix: "a partir de" },
  free_quote: { paymentMode: "free_quote", paymentLabel: "CONSULTE", paymentSuffix: "", pricePrefix: "" },
};

type Item = { variant: number; url?: string; error?: string; ms?: number };

export default function ArtesLab() {
  const params = new URLSearchParams(window.location.search);
  const format = (params.get("format") === "story" ? "story" : "square") as "square" | "story";
  const cat = params.get("cat") === "experiencia" ? "experiencia_destino" : "oferta_destino";
  const photo = PHOTOS[Number(params.get("photo") || 0) % PHOTOS.length];
  const only = params.get("v");
  const dest = params.get("dest") || "Maragogi";
  const city = params.get("city") || "";
  const scale = Number(params.get("scale") || 1);
  const withLogo = params.get("logo") !== "0";
  const price = params.get("price") || "149,90";
  const inst = params.get("inst") || "10x";
  const legacy = params.get("legacy") === "1";
  const font = params.get("font") || "Inter";
  const long = params.get("long") === "1";
  const cents = params.get("cents") !== "0";
  const pay = PAY[params.get("pay") || "installments"] || PAY.installments;
  const [primaryColor, secondaryColor] = PALETTES[params.get("palette") || "cv"] || PALETTES.cv;
  const vs = params.get("vs");
  const variants = only !== null ? [Number(only)] : vs ? vs.split(",").map(Number) : Array.from({ length: 12 }, (_, i) => i);

  const [items, setItems] = useState<Item[]>(variants.map((variant) => ({ variant })));

  useEffect(() => {
    let cancelled = false;
    (async () => {
      await loadArtTweakPresets();
      for (const variant of variants) {
        const t0 = performance.now();
        try {
          const isExp = cat === "experiencia_destino";
          const res = await composeTravelAd({
            imageUrl: photo,
            format,
            destination: dest,
            city,
            primaryColor,
            secondaryColor,
            price: cents ? price : price.replace(/[.,]\d{2}$/, ""),
            currencySymbol: "R$",
            hideCents: !cents,
            installments: inst,
            promoName: isExp ? "Experiência exclusiva" : (long ? "Promoção de fim de ano" : "Oferta especial"),
            highlights: (long ? LONG_HIGHLIGHTS : isExp ? EXP_HIGHLIGHTS : DEFAULT_HIGHLIGHTS) as any,
            hasLogo: withLogo,
            logoDataUrl: withLogo ? LOGO : undefined,
            logoFormat: "circle",
            whatsapp: "82993702220",
            instagram: "@ilandnoronha",
            paymentMode: pay.paymentMode,
            paymentLabel: pay.paymentLabel || inst,
            paymentSuffix: isExp ? "Sua viagem começa aqui" : pay.paymentSuffix,
            pricePrefix: pay.pricePrefix,
            strategy: "vitrine",
            variation: variant,
            forceVariant: variant,
            customHeading: params.get("heading") || undefined,
            titleOverride: isExp ? `${dest} como você nunca viu` : `Pacote ${dest}`,
            titleVariations: long
              ? [`Réveillon em ${dest} com tudo incluso para a família toda`, `Feriado prolongado em ${dest}: 5 dias de praia, passeios e descanso`, `${dest} te espera`]
              : isExp
                ? [`${dest} como você nunca viu`, `Dias que você não esquece`, `Viva ${dest} de verdade`]
                : [`Pacote ${dest}`, `Você precisa conhecer ${dest}`, `${dest} te espera`],
            travelPeriod: long ? "28/12 a 02/01" : "Dezembro",
            showPixBanner: pay.paymentMode !== "free_quote",
            showTotal: pay.paymentMode === "installments" || !!params.get("total"),
            totalOverride: params.get("total") || undefined,
            fontFamily: font,
            titleScale: Number(params.get("tscale") || 1),
            descScale: Number(params.get("dscale") || 1),
            isExperience: isExp,
            legacyLayouts: legacy,
            artTweaks: getArtTweakPreset(cat, variant, format),
          } as any);
          if (cancelled) return;
          setItems((prev) => prev.map((it) => (it.variant === variant ? { ...it, url: res.url, ms: Math.round(performance.now() - t0) } : it)));
        } catch (e: any) {
          if (cancelled) return;
          setItems((prev) => prev.map((it) => (it.variant === variant ? { ...it, error: e?.message || String(e) } : it)));
        }
      }
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const w = (format === "story" ? 360 : 480) * scale;
  const h = (format === "story" ? 640 : 480) * scale;
  const done = items.filter((i) => i.url || i.error).length;

  return (
    <div style={{ background: "#1a1a1a", minHeight: "100vh", padding: 16, color: "#fff", fontFamily: "Inter, sans-serif" }}>
      <div data-testid="lab-status" style={{ fontSize: 12, marginBottom: 12 }}>
        {format} · {cat} · {legacy ? "ANTIGO" : "NOVO"} · {params.get("palette") || "cv"} · {font} · {pay.paymentMode}{long ? " · longo" : ""} · {done}/{items.length} prontas
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 16 }}>
        {items.map((it) => (
          <div key={it.variant} style={{ width: w }}>
            <div style={{ fontSize: 13, fontWeight: 800, marginBottom: 4 }}>
              V{it.variant} {it.ms ? `· ${it.ms}ms` : ""}
            </div>
            {it.url ? (
              <img src={it.url} alt={`V${it.variant}`} width={w} height={h} style={{ display: "block", background: "#000" }} />
            ) : it.error ? (
              <div style={{ width: w, height: h, background: "#511", padding: 8, fontSize: 12 }}>{it.error}</div>
            ) : (
              <div style={{ width: w, height: h, background: "#333" }} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
