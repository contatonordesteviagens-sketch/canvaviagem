// Extrai cores dominantes de uma imagem (logo) e gera uma paleta de marca.
// Usa quantização simples por buckets de cor + filtragem de tons neutros (preto/branco/cinza/transparente).

export interface BrandPalette {
  primary: string;   // cor de marca principal (mais saturada e frequente)
  secondary: string; // cor secundária (segunda mais frequente, distante o suficiente da primária)
  accent: string;    // cor de destaque adicional
  swatches: string[]; // até 6 cores extraídas (incluindo neutros relevantes)
}

const toHex = (n: number) => n.toString(16).padStart(2, "0");
const rgbToHex = (r: number, g: number, b: number) => `#${toHex(r)}${toHex(g)}${toHex(b)}`;

const hexToRgb = (hex: string) => {
  const c = hex.replace("#", "");
  return {
    r: parseInt(c.slice(0, 2), 16),
    g: parseInt(c.slice(2, 4), 16),
    b: parseInt(c.slice(4, 6), 16),
  };
};

const colorDistance = (a: string, b: string) => {
  const ca = hexToRgb(a), cb = hexToRgb(b);
  return Math.sqrt((ca.r - cb.r) ** 2 + (ca.g - cb.g) ** 2 + (ca.b - cb.b) ** 2);
};

const saturation = (r: number, g: number, b: number) => {
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  if (max === 0) return 0;
  return (max - min) / max;
};

const luminance = (r: number, g: number, b: number) => (0.299 * r + 0.587 * g + 0.114 * b) / 255;

export async function extractBrandPaletteFromImage(src: string): Promise<BrandPalette | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      try {
        const MAX = 120;
        const scale = Math.min(1, MAX / Math.max(img.width, img.height));
        const w = Math.max(1, Math.floor(img.width * scale));
        const h = Math.max(1, Math.floor(img.height * scale));
        const canvas = document.createElement("canvas");
        canvas.width = w; canvas.height = h;
        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        if (!ctx) return resolve(null);
        ctx.drawImage(img, 0, 0, w, h);
        const data = ctx.getImageData(0, 0, w, h).data;

        // Bucket por cor reduzida (quantização)
        const buckets = new Map<string, { count: number; r: number; g: number; b: number; sat: number }>();
        const STEP = 24; // tamanho do bucket (0..255)
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i], g = data[i + 1], b = data[i + 2], a = data[i + 3];
          if (a < 200) continue; // ignora pixels transparentes
          const lum = luminance(r, g, b);
          if (lum > 0.95 || lum < 0.05) continue; // ignora branco e preto puros
          const sat = saturation(r, g, b);
          const br = Math.round(r / STEP) * STEP;
          const bg = Math.round(g / STEP) * STEP;
          const bb = Math.round(b / STEP) * STEP;
          const key = `${br}-${bg}-${bb}`;
          const cur = buckets.get(key);
          if (cur) {
            cur.count++;
            cur.r += r; cur.g += g; cur.b += b;
          } else {
            buckets.set(key, { count: 1, r, g, b, sat });
          }
        }

        if (buckets.size === 0) return resolve(null);

        // Calcula média de cada bucket e ordena por (frequência * (0.4 + saturação))
        const list = Array.from(buckets.values()).map((v) => {
          const r = Math.round(v.r / v.count);
          const g = Math.round(v.g / v.count);
          const b = Math.round(v.b / v.count);
          return {
            hex: rgbToHex(r, g, b),
            count: v.count,
            sat: saturation(r, g, b),
            score: v.count * (0.4 + saturation(r, g, b)),
          };
        });
        list.sort((a, b) => b.score - a.score);

        // Deduplica cores próximas (>40 de distância RGB)
        const distinct: typeof list = [];
        for (const c of list) {
          if (distinct.every((d) => colorDistance(d.hex, c.hex) > 40)) distinct.push(c);
          if (distinct.length >= 8) break;
        }

        // Primary: melhor score com saturação >= 0.2 (se houver)
        const saturated = distinct.filter((c) => c.sat >= 0.2);
        const primary = (saturated[0] || distinct[0]).hex;
        // Secondary: cor mais distante da primária com boa frequência
        const secondaryCandidate =
          distinct.find((c) => c.hex !== primary && colorDistance(c.hex, primary) > 80) ||
          distinct.find((c) => c.hex !== primary) ||
          distinct[0];
        const secondary = secondaryCandidate.hex;
        const accentCandidate =
          distinct.find((c) => c.hex !== primary && c.hex !== secondary && colorDistance(c.hex, primary) > 60 && colorDistance(c.hex, secondary) > 60) ||
          distinct.find((c) => c.hex !== primary && c.hex !== secondary) ||
          distinct[0];
        const accent = accentCandidate.hex;

        resolve({
          primary,
          secondary,
          accent,
          swatches: distinct.slice(0, 6).map((c) => c.hex),
        });
      } catch (err) {
        console.error("extractBrandPaletteFromImage error:", err);
        resolve(null);
      }
    };
    img.onerror = () => resolve(null);
    img.src = src;
  });
}
