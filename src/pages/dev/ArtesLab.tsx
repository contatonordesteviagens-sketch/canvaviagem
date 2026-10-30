/**
 * LABORATÓRIO DE ARTES (só em desenvolvimento).
 *
 * Desenha todas as variações do motor de anúncios (fabrica-compose-art) com
 * dados de exemplo, sem login, para diagnóstico visual e comparação antes/depois.
 *
 * URL: /dev/artes-lab?format=square|story&cat=oferta|experiencia&photo=0..2&v=0..8&scale=1
 */
import { useEffect, useState } from "react";
import { composeTravelAd } from "@/lib/fabrica-compose-art";
import { getArtTweakPreset, loadArtTweakPresets } from "@/lib/fabrica-art-tweak-presets";

const PHOTOS = [
  "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1600&q=80", // praia
  "https://images.unsplash.com/photo-1519046904884-53103b34b206?w=1600&q=80", // praia 2
  "https://images.unsplash.com/photo-1483729558449-99ef09a8c325?w=1600&q=80", // Rio
];

const LOGO = "/artes/canvaviagem_premium_logo_1772930557454.png";

const DEFAULT_HIGHLIGHTS = [
  { text: "Transporte incluso", icon: "onibus" },
  { text: "Hospedagem", icon: "placa-do-hotel" },
  { text: "Café da manhã", icon: "cafe-da-manha" },
  { text: "Guia local", icon: "guia-turistico" },
];
const EXP_HIGHLIGHTS = [
  { text: "EXPERIÊNCIA SENSORIAL", icon: "check" },
  { text: "MOMENTOS INESQUECÍVEIS", icon: "check" },
  { text: "CURADORIA PREMIUM", icon: "check" },
];

type Item = { variant: number; url?: string; error?: string; ms?: number };

export default function ArtesLab() {
  const params = new URLSearchParams(window.location.search);
  const format = (params.get("format") === "story" ? "story" : "square") as "square" | "story";
  const cat = params.get("cat") === "experiencia" ? "experiencia_destino" : "oferta_destino";
  const photo = PHOTOS[Number(params.get("photo") || 0) % PHOTOS.length];
  const only = params.get("v");
  const dest = params.get("dest") || "Maragogi";
  const scale = Number(params.get("scale") || 1);
  const withLogo = params.get("logo") !== "0";
  const price = params.get("price") || "149,90";
  const inst = params.get("inst") || "10x";
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
            city: "",
            primaryColor: "#080808",
            secondaryColor: "#F5F906",
            price,
            currencySymbol: "R$",
            hideCents: false,
            installments: inst,
            promoName: isExp ? "EXPERIÊNCIA EXCLUSIVA" : "OFERTA ESPECIAL",
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
            titleOverride: `Pacote ${dest}`,
            titleVariations: [`Pacote ${dest}`, `Você precisa conhecer ${dest}`, `${dest} te espera`],
            travelPeriod: "Dezembro",
            showPixBanner: true,
            showTotal: true,
            fontFamily: "Inter",
            titleScale: 1,
            descScale: 1,
            isExperience: isExp,
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
        {format} · {cat} · {done}/{items.length} prontas
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
