// Efeitos, filtros, transparência e corte dos itens que a pessoa põe por cima da arte (textos prontos, selos, ícones, imagens).
// Cada item é uma imagem: o efeito é aplicado sobre ela (sombra, brilho, eco, contorno, fundo, vazado, neon, falha).
// Os textos e blocos da própria arte usam os mesmos efeitos, mas desenhados pelo motor (fabrica-art-recorder.ts).
import type { ArtEffect, ArtEffectKind } from "@/lib/fabrica-art-tweaks";
import { carregarImagem } from "./arte-extras";
import { formaPorId, recortarNaForma } from "./arte-formas";

export type FxExtra = {
  efeito?: ArtEffect;
  /** 0 a 1 */
  opacidade?: number;
  /** filtro de cor (CSS filter) */
  filtro?: string;
  /** degradê por cima (só ícones de uma cor) */
  grad?: [string, string];
  /** corte: quanto tirar de cada lado (0 a 0.45) */
  recorte?: { l: number; t: number; r: number; b: number };
  /** forma da foto (id de arte-formas): a imagem fica recortada no formato */
  mascara?: string;
};
type Desenho = { src: string; w: number; r: number };

export const EFEITOS: { id: ArtEffectKind | ""; nome: string }[] = [
  { id: "", nome: "Nenhum" },
  { id: "sombra", nome: "Projetada" },
  { id: "brilho", nome: "Brilhante" },
  { id: "eco", nome: "Eco" },
  { id: "contorno", nome: "Contorno" },
  { id: "fundo", nome: "Fundo" },
  { id: "vazado", nome: "Vazado" },
  { id: "neon", nome: "Neon" },
  { id: "falha", nome: "Falha" },
  { id: "desalinhado", nome: "Desalinhado" },
  { id: "curvar", nome: "Curvar" },
];
/** Que efeitos cada tipo de item aceita (como no Canva: blocos e imagens têm menos). */
export const EFEITOS_DO = {
  textoArte: ["", "sombra", "brilho", "eco", "contorno", "fundo", "vazado", "neon", "falha", "desalinhado", "curvar"],
  /** textos prontos, preço e selos (são imagens, mas são letras) */
  letra: ["", "sombra", "brilho", "eco", "contorno", "fundo", "vazado", "neon", "falha", "desalinhado", "curvar"],
  bloco: ["", "sombra", "brilho", "eco", "contorno", "falha"],
  imagem: ["", "sombra", "brilho", "eco", "falha"],
  item: ["", "sombra", "brilho", "eco", "contorno", "fundo", "vazado", "neon", "falha"],
  /** formas soltas (peças de um selo desagrupado) */
  forma: ["", "sombra", "brilho", "eco", "contorno", "falha"],
} as const;

export const FILTROS: { id: string; nome: string; css: string }[] = [
  { id: "", nome: "Original", css: "" },
  { id: "vivo", nome: "Vivo", css: "saturate(1.6) contrast(1.08)" },
  { id: "quente", nome: "Quente", css: "sepia(.25) saturate(1.4) hue-rotate(-8deg)" },
  { id: "frio", nome: "Frio", css: "saturate(1.15) hue-rotate(12deg) brightness(1.03)" },
  { id: "claro", nome: "Claro", css: "brightness(1.18)" },
  { id: "escuro", nome: "Escuro", css: "brightness(.78)" },
  { id: "pb", nome: "Preto e branco", css: "grayscale(1)" },
  { id: "sepia", nome: "Sépia", css: "sepia(.85)" },
];

export const CORES_SOLIDAS = [
  "#000000", "#545454", "#737373", "#A6A6A6", "#D9D9D9", "#F1F1F1", "#FFFFFF",
  "#FF3131", "#FF5757", "#FF66C4", "#CB6CE6", "#8C52FF", "#5E17EB", "#3B0A8C",
  "#0097B2", "#0CC0DF", "#5CE1E6", "#38B6FF", "#5271FF", "#004AAD", "#1A237E",
  "#00BF63", "#7ED957", "#C1FF72", "#FFDE59", "#FFBD59", "#FF914D", "#F5F906",
];
export const DEGRADES: [string, string][] = [
  ["#000000", "#737373"], ["#000000", "#C89116"], ["#F5F906", "#FF914D"], ["#FF3131", "#FF914D"], ["#8C52FF", "#5CE1E6"],
  ["#5170FF", "#FF66C4"], ["#0097B2", "#7ED957"], ["#FF66C4", "#FFDE59"], ["#004AAD", "#CB6CE6"], ["#00BF63", "#0097B2"],
  ["#FF5757", "#8C52FF"], ["#FFDE59", "#FF66C4"], ["#38B6FF", "#004AAD"], ["#F1F1F1", "#A6A6A6"],
];

const tela = (w: number, h: number) => {
  const c = document.createElement("canvas");
  c.width = Math.max(1, Math.round(w)); c.height = Math.max(1, Math.round(h));
  return { c, x: c.getContext("2d")! };
};
/** A mesma imagem pintada de uma cor só (mantém o recorte das letras). */
function tingida(img: CanvasImageSource, w: number, h: number, cor: string | CanvasGradient) {
  const t = tela(w, h);
  t.x.drawImage(img, 0, 0, w, h);
  t.x.globalCompositeOperation = "source-in";
  t.x.fillStyle = cor;
  t.x.fillRect(0, 0, w, h);
  return t.c;
}
/** Linhas das bordas do desenho (onde a cor ou a transparência muda de repente), numa cor só.
 *  Sem cor: a cor média do desenho. Degradês suaves não viram linha. */
function bordasDe(c: HTMLCanvasElement, cor?: string) {
  const W = c.width, H = c.height;
  const out = tela(W, H);
  let d: Uint8ClampedArray;
  try { d = c.getContext("2d")!.getImageData(0, 0, W, H).data; } catch { return out.c; }
  const m = out.x.createImageData(W, H), md = m.data;
  // cor já multiplicada pela transparência, calculada uma vez por pixel
  const N = W * H, pr = new Float32Array(N), pg = new Float32Array(N), pb = new Float32Array(N);
  let sr = 0, sg = 0, sb = 0, n = 0;
  for (let p = 0, i = 0; p < N; p++, i += 4) {
    const al = d[i + 3] / 255;
    pr[p] = d[i] * al; pg[p] = d[i + 1] * al; pb[p] = d[i + 2] * al;
    if (d[i + 3] > 200 && p % 3 === 0) { sr += d[i]; sg += d[i + 1]; sb += d[i + 2]; n++; }
  }
  const dif = (p: number, q: number) => Math.max(Math.abs(d[p * 4 + 3] - d[q * 4 + 3]), Math.abs(pr[p] - pr[q]), Math.abs(pg[p] - pg[q]), Math.abs(pb[p] - pb[q]));
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const p = y * W + x;
    let v = 0;
    if (x + 1 < W) v = dif(p, p + 1);
    if (y + 1 < H) v = Math.max(v, dif(p, p + W));
    if (v > 46) md[p * 4 + 3] = Math.min(255, v * 2);
  }
  out.x.putImageData(m, 0, 0);
  // sem cor escolhida: a cor média do próprio desenho (texto branco vira linha branca)
  const auto = n ? `rgb(${Math.round(sr / n)},${Math.round(sg / n)},${Math.round(sb / n)})` : "#FFFFFF";
  return tingida(out.c, W, H, cor || auto);
}

/** Caixa do que é sólido no desenho (alfa forte), para centralizar o fundo. */
function caixaSolida(c: HTMLCanvasElement) {
  const W = c.width, H = c.height;
  try {
    const d = c.getContext("2d")!.getImageData(0, 0, W, H).data;
    let x0 = W, y0 = H, x1 = -1, y1 = -1;
    for (let y = 0; y < H; y += 2) for (let x = 0; x < W; x += 2) {
      if (d[(y * W + x) * 4 + 3] > 150) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
    }
    if (x1 >= 0) return { x: x0, y: y0, w: x1 - x0 + 1, h: y1 - y0 + 1 };
  } catch { /* sem leitura */ }
  return { x: 0, y: 0, w: W, h: H };
}
const vazio = (fx?: FxExtra) => !fx || (!fx.efeito && (fx.opacidade == null || fx.opacidade >= 1) && !fx.filtro && !fx.grad && !fx.recorte && !fx.mascara);

/** Aplica corte, filtro, degradê, efeito e transparência sobre o desenho do item. */
export async function processarExtra(d: Desenho, fx?: FxExtra): Promise<Desenho> {
  if (vazio(fx)) return d;
  const img = await carregarImagem(d.src);
  const W0 = Math.round(d.w), H0 = Math.round(d.w * d.r);
  // 1. corte
  const rc = fx!.recorte || { l: 0, t: 0, r: 0, b: 0 };
  const sx = W0 * rc.l, sy = H0 * rc.t;
  let cw = Math.max(4, W0 * (1 - rc.l - rc.r)), ch = Math.max(4, H0 * (1 - rc.t - rc.b));
  const k = { w: img.naturalWidth / W0 || 1, h: img.naturalHeight / H0 || 1 };
  let base = tela(cw, ch);
  if (fx!.filtro) { try { (base.x as unknown as { filter: string }).filter = fx!.filtro; } catch { /* sem suporte */ } }
  base.x.drawImage(img, sx * k.w, sy * k.h, cw * k.w, ch * k.h, 0, 0, cw, ch);
  // 1b. forma da foto (círculo, coração, estrela…)
  const molde = fx!.mascara ? formaPorId(fx!.mascara) : undefined;
  if (molde) {
    const c2 = recortarNaForma(base.c, molde);
    base = { c: c2, x: c2.getContext("2d")! };
    cw = c2.width; ch = c2.height;
  }
  // 2. degradê (pinta o item inteiro)
  if (fx!.grad) {
    const g = base.x.createLinearGradient(0, 0, cw, 0);
    g.addColorStop(0, fx!.grad[0]); g.addColorStop(1, fx!.grad[1]);
    const c2 = tingida(base.c, cw, ch, g);
    base = { c: c2, x: c2.getContext("2d")! };
  }
  // 3. efeito (com margem para a sombra e o brilho caberem)
  const ef = fx!.efeito;
  const forca = ef ? Math.max(0.1, (ef.forca ?? 50) / 50) : 1;
  const u = Math.min(cw, ch);
  const pad = ef ? Math.round(Math.max(cw, ch) * 0.1 * forca + u * 0.2) : 0;
  const out = tela(cw + pad * 2, ch + pad * 2);
  const o = out.x;
  const p = (img2: CanvasImageSource, dx = 0, dy = 0) => o.drawImage(img2, pad + dx, pad + dy, cw, ch);
  switch (ef?.tipo) {
    case "sombra":
      o.shadowColor = ef.cor || "rgba(0,0,0,.6)"; o.shadowBlur = u * 0.12 * forca; o.shadowOffsetX = u * 0.06 * forca; o.shadowOffsetY = u * 0.06 * forca;
      p(base.c); break;
    case "brilho":
      o.shadowColor = ef.cor || "#FFFFFF"; o.shadowBlur = u * 0.35 * forca;
      p(base.c); p(base.c); break;
    case "eco": {
      const passo = u * 0.06 * forca;
      const fonte = ef.cor ? tingida(base.c, cw, ch, ef.cor) : base.c;
      o.globalAlpha = 0.25; p(fonte, passo * 2, passo * 2);
      o.globalAlpha = 0.5; p(fonte, passo, passo);
      o.globalAlpha = 1; p(base.c); break;
    }
    case "falha": {
      const d2 = u * 0.05 * forca;
      o.globalAlpha = 0.9; p(tingida(base.c, cw, ch, "#00E5FF"), -d2, 0); p(tingida(base.c, cw, ch, "#FF2BD6"), d2, 0);
      o.globalAlpha = 1; p(base.c); break;
    }
    case "vazado": {
      // só as linhas: contorna cada borda do desenho (inclusive as letras dentro de uma etiqueta)
      const linhas = bordasDe(base.c, ef.cor);
      const r = Math.max(1.2, u * 0.012 * forca);
      for (let i = 0; i < 12; i++) { const a = (Math.PI * 2 * i) / 12; p(linhas, Math.cos(a) * r, Math.sin(a) * r); }
      p(linhas);
      break;
    }
    case "contorno": {
      const r = Math.max(2, u * 0.04 * forca);
      const borda = tingida(base.c, cw, ch, ef.cor || "#111111");
      const anel = tela(cw + pad * 2, ch + pad * 2);
      for (let i = 0; i < 16; i++) { const a = (Math.PI * 2 * i) / 16; anel.x.drawImage(borda, pad + Math.cos(a) * r, pad + Math.sin(a) * r, cw, ch); }
      o.drawImage(anel.c, 0, 0); p(base.c);
      break;
    }
    case "fundo": {
      // centraliza no que é sólido (ignora sombras e brilhos fracos do desenho)
      const bx = caixaSolida(base.c);
      const m = u * 0.18 * forca;
      o.fillStyle = ef.cor || "#111111";
      o.beginPath(); o.roundRect(pad + bx.x - m, pad + bx.y - m, bx.w + m * 2, bx.h + m * 2, Math.min(u * 0.3, m * 2)); o.fill();
      p(base.c); break;
    }
    case "desalinhado": {
      // como o Canva: o recheio sai do lugar (mais claro) e as letras ficam só no contorno
      const d2 = u * 0.06 * forca;
      if (ef.cor) p(tingida(base.c, cw, ch, ef.cor), d2, d2);
      else { o.globalAlpha = 0.42; p(base.c, d2, d2); o.globalAlpha = 1; }
      const linhas = bordasDe(base.c);
      const r = Math.max(1.2, u * 0.012 * Math.min(1.5, forca));
      for (let i = 0; i < 12; i++) { const a = (Math.PI * 2 * i) / 12; p(linhas, Math.cos(a) * r, Math.sin(a) * r); }
      p(linhas);
      break;
    }
    case "curvar": {
      // cada fatia vertical vai para o seu lugar num arco (como o texto curvo do Canva)
      const ang = Math.min(Math.PI * 1.8, 0.9 * forca);
      const Rr = cw / ang;
      const pts: [number, number][] = [];
      const passo = Math.max(1, cw / 600);
      for (let x = 0; x <= cw; x += passo) {
        const th = -ang / 2 + (x / cw) * ang;
        for (const yy of [0, ch]) pts.push([Math.sin(th) * (Rr + ch - yy), -Math.cos(th) * (Rr + ch - yy)]);
      }
      const xs = pts.map((q) => q[0]), ys = pts.map((q) => q[1]);
      const mnx = Math.min(...xs), mny = Math.min(...ys);
      const cv = tela(Math.ceil(Math.max(...xs) - mnx) + 4, Math.ceil(Math.max(...ys) - mny) + 4);
      for (let x = 0; x < cw; x += passo) {
        const th = -ang / 2 + ((x + passo / 2) / cw) * ang;
        cv.x.save();
        cv.x.translate(2 - mnx, 2 - mny);
        cv.x.rotate(th);
        cv.x.drawImage(base.c, x, 0, passo, ch, -passo / 2 - 0.5, -(Rr + ch), passo + 1, ch);
        cv.x.restore();
      }
      const fimC = tela(cv.c.width, cv.c.height);
      fimC.x.globalAlpha = fx!.opacidade != null && fx!.opacidade < 1 ? Math.max(0, fx!.opacidade) : 1;
      fimC.x.drawImage(cv.c, 0, 0);
      return { src: fimC.c.toDataURL("image/png"), w: fimC.c.width, r: fimC.c.height / fimC.c.width };
    }
    case "neon": {
      const c = ef.cor || "#FF2BD6";
      o.shadowColor = c; o.shadowBlur = u * 0.4 * forca;
      p(tingida(base.c, cw, ch, c)); o.shadowBlur = u * 0.15 * forca;
      p(tingida(base.c, cw, ch, "#FFFFFF")); break;
    }
    default:
      p(base.c);
  }
  // 4. transparência
  let fim = out.c;
  if (fx!.opacidade != null && fx!.opacidade < 1) {
    const t2 = tela(out.c.width, out.c.height);
    t2.x.globalAlpha = Math.max(0, fx!.opacidade);
    t2.x.drawImage(out.c, 0, 0);
    fim = t2.c;
  }
  return { src: fim.toDataURL("image/png"), w: fim.width, r: fim.height / fim.width };
}
