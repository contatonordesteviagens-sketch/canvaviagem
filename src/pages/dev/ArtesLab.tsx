/**
 * LABORATÓRIO DE ARTES (só em desenvolvimento).
 *
 * Desenha todas as variações do motor de anúncios (fabrica-compose-art) com
 * dados de exemplo, sem login, para diagnóstico visual e comparação antes/depois.
 *
 * URL: /dev/artes-lab?format=square|story&cat=oferta|experiencia&photo=0..2&v=0..8&scale=1
 *      &palette=cv|cvc|teal|wine&city=Maceió&legacy=1 (layouts antigos)
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
  const [primaryColor, secondaryColor] = PALETTES[params.get("palette") || "cv"] || PALETTES.cv;
  const variants = only !== null ? [Number(only)] : [0, 1, 2, 3, 4, 5, 6, 7, 8];

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
            price,
            currencySymbol: "R$",
            hideCents: false,
            installments: inst,
            promoName: isExp ? "Experiência exclusiva" : "Oferta especial",
            highlights: (isExp ? EXP_HIGHLIGHTS : DEFAULT_HIGHLIGHTS) as any,
            hasLogo: withLogo,
            logoDataUrl: withLogo ? LOGO : undefined,
            logoFormat: "circle",
            whatsapp: "82993702220",
            instagram: "@ilandnoronha",
            paymentMode: "installments",
            paymentLabel: inst,
            paymentSuffix: isExp ? "Sua viagem começa aqui" : "por pessoa",
            pricePrefix: "a partir de",
            strategy: "vitrine",
            variation: variant,
            forceVariant: variant,
            titleOverride: isExp ? `${dest} como você nunca viu` : `Pacote ${dest}`,
            titleVariations: isExp
              ? [`${dest} como você nunca viu`, `Dias que você não esquece`, `Viva ${dest} de verdade`]
              : [`Pacote ${dest}`, `Você precisa conhecer ${dest}`, `${dest} te espera`],
            travelPeriod: "Dezembro",
            showPixBanner: true,
            showTotal: true,
            fontFamily: "Inter",
            titleScale: 1,
            descScale: 1,
            isExperience: isExp,
            legacyLayouts: legacy,
            artTweaks: legacy ? getArtTweakPreset(cat, variant, format) : undefined,
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
        {format} · {cat} · {legacy ? "ANTIGO" : "NOVO"} · {params.get("palette") || "cv"} · {done}/{items.length} prontas
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
