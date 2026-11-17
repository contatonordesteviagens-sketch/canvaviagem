// Desagrupar: um selo de preço vira peças soltas (cada texto e cada forma), como no Canva.
// Como funciona: o desenho do selo roda num contexto "espião". Cada pintura (texto, forma, linha)
// é feita sozinha numa tela limpa e recortada no tamanho certo. Os textos guardam letra, cor e
// tamanho, para continuar editáveis; as formas viram imagens que mudam de cor.

export type Peca =
  | { tipo: "letra"; texto: string; fonte: string; cor: string; ls: number; src: string; x: number; y: number; w: number; h: number }
  | { tipo: "forma"; src: string; x: number; y: number; w: number; h: number; sombra: boolean };
export type Desenho = { src: string; w: number; r: number };

type Recorte = { src: string; x: number; y: number; w: number; h: number };
function recortar(c: HTMLCanvasElement, limiar = 8): Recorte | null {
  const ctx = c.getContext("2d")!;
  const { width: W, height: H } = c;
  const d = ctx.getImageData(0, 0, W, H).data;
  let x0 = W, y0 = H, x1 = -1, y1 = -1;
  for (let y = 0; y < H; y++) {
    const linha = y * W * 4;
    for (let x = 0; x < W; x++) {
      if (d[linha + x * 4 + 3] > limiar) {
        if (x < x0) x0 = x;
        if (x > x1) x1 = x;
        if (y < y0) y0 = y;
        if (y > y1) y1 = y;
      }
    }
  }
  if (x1 < 0) return null;
  const w = x1 - x0 + 1, h = y1 - y0 + 1;
  const out = document.createElement("canvas");
  out.width = w; out.height = h;
  out.getContext("2d")!.drawImage(c, x0, y0, w, h, 0, 0, w, h);
  return { src: out.toDataURL("image/png"), x: x0 + w / 2, y: y0 + h / 2, w, h };
}

/** Roda `desenhar` num contexto espião de W×H e devolve cada pintura como uma peça. */
export function capturarPecas(W: number, H: number, desenhar: (c: CanvasRenderingContext2D) => void): Peca[] {
  const cv = document.createElement("canvas");
  cv.width = Math.ceil(W); cv.height = Math.ceil(H);
  const real = cv.getContext("2d", { willReadFrequently: true })!;
  real.textBaseline = "alphabetic";
  const pecas: Peca[] = [];
  const limpar = () => { real.save(); real.setTransform(1, 0, 0, 1, 0, 0); real.clearRect(0, 0, cv.width, cv.height); real.restore(); };
  const semSombra = <T,>(fazer: () => T): { tinha: boolean } => {
    const s = { c: real.shadowColor, b: real.shadowBlur, x: real.shadowOffsetX, y: real.shadowOffsetY };
    const tinha = (s.b > 0 || s.x !== 0 || s.y !== 0) && !/^(transparent|rgba\(0, 0, 0, 0\))$/.test(s.c);
    real.shadowColor = "transparent"; real.shadowBlur = 0; real.shadowOffsetX = 0; real.shadowOffsetY = 0;
    try { fazer(); } finally { real.shadowColor = s.c; real.shadowBlur = s.b; real.shadowOffsetX = s.x; real.shadowOffsetY = s.y; }
    return { tinha };
  };
  const forma = (fazer: () => void) => {
    limpar();
    const { tinha } = semSombra(fazer);
    const r = recortar(cv);
    if (r) pecas.push({ tipo: "forma", ...r, sombra: tinha });
  };
  const texto = (a: unknown[]) => {
    limpar();
    semSombra(() => (real.fillText as (...x: unknown[]) => void)(...a));
    const r = recortar(cv);
    if (!r) return;
    const ls = parseFloat(String((real as unknown as { letterSpacing?: string }).letterSpacing || "0")) || 0;
    const cor = typeof real.fillStyle === "string" ? real.fillStyle : "#111111";
    pecas.push({ tipo: "letra", texto: String(a[0] ?? ""), fonte: real.font, cor, ls, ...r });
  };
  const espioes: Record<string, (...a: unknown[]) => void> = {
    fill: (...a) => forma(() => (real.fill as (...x: unknown[]) => void)(...a)),
    stroke: (...a) => forma(() => (real.stroke as (...x: unknown[]) => void)(...a)),
    fillRect: (...a) => forma(() => (real.fillRect as (...x: unknown[]) => void)(...a)),
    strokeRect: (...a) => forma(() => (real.strokeRect as (...x: unknown[]) => void)(...a)),
    drawImage: (...a) => forma(() => (real.drawImage as (...x: unknown[]) => void)(...a)),
    strokeText: (...a) => forma(() => (real.strokeText as (...x: unknown[]) => void)(...a)),
    fillText: (...a) => texto(a),
  };
  const espiao = new Proxy(real, {
    get(alvo, p) {
      if (typeof p === "string" && espioes[p]) return espioes[p];
      const v = Reflect.get(alvo, p);
      return typeof v === "function" ? v.bind(alvo) : v;
    },
    set(alvo, p, v) { Reflect.set(alvo, p, v); return true; },
  });
  desenhar(espiao);
  return pecas;
}

/** Texto solto (peça de um selo desagrupado): recortado no tamanho exato das letras. */
export async function desenharLetra(texto: string, fonte: string, cor: string | CanvasGradient, ls = 0): Promise<Desenho> {
  try { await document.fonts.load(fonte); } catch { /* fonte do sistema */ }
  const linhas = (texto || " ").split("\n");
  const px = parseFloat(/(\d+(?:\.\d+)?)px/.exec(fonte)?.[1] || "60");
  const lh = px * 1.15;
  const m = document.createElement("canvas").getContext("2d")!;
  m.font = fonte;
  try { (m as unknown as { letterSpacing: string }).letterSpacing = `${ls}px`; } catch { /* sem suporte */ }
  const W = Math.ceil(Math.max(...linhas.map((l) => m.measureText(l).width), px * 0.5) + px * 1.2);
  const H = Math.ceil(lh * linhas.length + px);
  const cv = document.createElement("canvas");
  cv.width = W; cv.height = H;
  const c = cv.getContext("2d", { willReadFrequently: true })!;
  c.font = fonte;
  try { (c as unknown as { letterSpacing: string }).letterSpacing = `${ls}px`; } catch { /* sem suporte */ }
  c.textAlign = "center";
  c.textBaseline = "alphabetic";
  c.fillStyle = cor;
  linhas.forEach((l, i) => c.fillText(l, W / 2, px * 0.5 + px * 0.85 + i * lh));
  const r = recortar(cv);
  if (!r) return { src: cv.toDataURL("image/png"), w: Math.max(4, Math.round(px * 0.5)), r: 1 };
  return { src: r.src, w: r.w, r: r.h / r.w };
}

/** Troca a família ou o peso de uma fonte CSS ("900 130px "Montserrat"") mantendo o tamanho. */
export function mudarFonte(fonte: string, p: { familia?: string; negrito?: boolean; italico?: boolean }): string {
  const px = /(\d+(?:\.\d+)?)px/.exec(fonte)?.[1] || "60";
  const fam = p.familia ? `"${p.familia}"` : (fonte.split(/px\s+/)[1] || '"Montserrat"');
  const pesoAtual = Number(/\b([1-9]00)\b/.exec(fonte)?.[1] || (/\bbold\b/.test(fonte) ? 700 : 400));
  const peso = p.negrito === undefined ? pesoAtual : p.negrito ? Math.max(700, pesoAtual >= 700 ? pesoAtual : 800) : 400;
  const ital = p.italico === undefined ? /\bitalic\b/.test(fonte) : p.italico;
  return `${ital ? "italic " : ""}${peso} ${px}px ${fam}`;
}
export const familiaDa = (fonte: string) => (fonte.split(/px\s+/)[1] || "").replace(/"/g, "").split(",")[0].trim();
export const negritoDa = (fonte: string) => Number(/\b([1-9]00)\b/.exec(fonte)?.[1] || (/\bbold\b/.test(fonte) ? 700 : 400)) >= 600;
export const italicoDa = (fonte: string) => /\bitalic\b/.test(fonte);

/** Forma pintada de uma cor (ou degradê) só, mantendo o recorte. */
export async function tingirForma(src: string, cor: string): Promise<Desenho> {
  const img = new Image();
  img.src = src;
  await img.decode();
  const c = document.createElement("canvas");
  c.width = img.naturalWidth; c.height = img.naturalHeight;
  const x = c.getContext("2d")!;
  x.drawImage(img, 0, 0);
  x.globalCompositeOperation = "source-in";
  x.fillStyle = cor;
  x.fillRect(0, 0, c.width, c.height);
  return { src: c.toDataURL("image/png"), w: c.width, r: c.height / c.width };
}
