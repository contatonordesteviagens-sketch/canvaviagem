// Extrai uma paleta dominante (primária + secundária) de um canvas.
// Algoritmo leve: quantiza pixels em buckets de cor (4 bits/canal),
// ignora pixels transparentes/quase brancos/quase pretos, conta frequência
// e escolhe a cor mais frequente como primária. A secundária é a próxima
// cor com matiz suficientemente diferente da primária.

const toHex = (n: number) => n.toString(16).padStart(2, "0");
const rgbToHex = (r: number, g: number, b: number) => `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();

function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  return [h * 360, s, l];
}

export function extractPaletteFromCanvas(
  ctx: CanvasRenderingContext2D | null,
  width: number,
  height: number,
): { primary?: string; secondary?: string } {
  if (!ctx || width === 0 || height === 0) return {};
  let data: Uint8ClampedArray;
  try {
    data = ctx.getImageData(0, 0, width, height).data;
  } catch {
    return {};
  }

  const buckets = new Map<number, { count: number; r: number; g: number; b: number }>();
  const step = 4 * Math.max(1, Math.floor(Math.sqrt((width * height) / 20000)));

  for (let i = 0; i < data.length; i += step) {
    const r = data[i], g = data[i + 1], b = data[i + 2], a = data[i + 3];
    if (a < 200) continue;
    // ignora quase branco / quase preto / cinzas neutros
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    if (max > 240 && min > 240) continue;
    if (max < 25) continue;
    if (max - min < 12 && max > 200) continue;

    // quantiza em 4 bits por canal (16 valores)
    const key = ((r >> 4) << 8) | ((g >> 4) << 4) | (b >> 4);
    const entry = buckets.get(key);
    if (entry) {
      entry.count++;
      entry.r += r; entry.g += g; entry.b += b;
    } else {
      buckets.set(key, { count: 1, r, g, b });
    }
  }

  if (buckets.size === 0) return {};

  const sorted = Array.from(buckets.values())
    .map((e) => ({
      count: e.count,
      r: Math.round(e.r / e.count),
      g: Math.round(e.g / e.count),
      b: Math.round(e.b / e.count),
    }))
    .sort((a, b) => b.count - a.count);

  const primary = sorted[0];
  const [pH] = rgbToHsl(primary.r, primary.g, primary.b);

  // secundária: cor com matiz suficientemente diferente
  let secondary = sorted.slice(1).find((c) => {
    const [h] = rgbToHsl(c.r, c.g, c.b);
    const diff = Math.min(Math.abs(h - pH), 360 - Math.abs(h - pH));
    return diff > 25;
  });
  // fallback: segunda mais frequente
  if (!secondary && sorted.length > 1) secondary = sorted[1];

  return {
    primary: rgbToHex(primary.r, primary.g, primary.b),
    secondary: secondary ? rgbToHex(secondary.r, secondary.g, secondary.b) : undefined,
  };
}
