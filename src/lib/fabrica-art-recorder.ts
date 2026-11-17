/**
 * ============================================================
 * GRAVADOR UNIVERSAL DE ELEMENTOS DO CANVAS (ADMIN)
 * ============================================================
 *
 * Em vez de instrumentar variação por variação (V0, V1, ... V8) na mão,
 * este módulo embrulha o `CanvasRenderingContext2D` com um Proxy que:
 *
 *  1. Aplica ao vivo TODO estado (font, fillStyle, transform, clip...) no
 *     contexto real — assim `measureText` e a lógica do motor continuam iguais.
 *  2. NÃO desenha na hora: cada primitiva de desenho (texto, imagem, forma)
 *     vira um "elemento" com id estável, rótulo e caixa (x, y, w, h).
 *  3. No final (`replay()`), redesenha todos os elementos aplicando os ajustes
 *     do admin: mover, escalar, girar, esconder, trocar o texto (com quebra de
 *     linha) e mudar a ordem (z-index / trazer para frente).
 *
 * Resultado: TODAS as variações — inclusive as novas — ficam editáveis sem
 * tocar no código de desenho.
 */
import type { ArtElementBox, ArtTweakMap } from "@/lib/fabrica-art-tweaks";

type Cmd = { m: string; a: any[] };

interface ClipEntry {
  cmds: Cmd[];
  matrix: DOMMatrix;
  rule?: CanvasFillRule;
}

interface StateSnap {
  fillStyle: any;
  strokeStyle: any;
  font: string;
  textAlign: CanvasTextAlign;
  textBaseline: CanvasTextBaseline;
  globalAlpha: number;
  lineWidth: number;
  lineJoin: CanvasLineJoin;
  lineCap: CanvasLineCap;
  shadowColor: string;
  shadowBlur: number;
  shadowOffsetX: number;
  shadowOffsetY: number;
  globalCompositeOperation: GlobalCompositeOperation;
  imageSmoothingEnabled: boolean;
  matrix: DOMMatrix;
  clips: ClipEntry[];
}

interface DrawOp {
  id: string;
  kind: "text" | "image" | "shape";
  label: string;
  text?: string;
  path?: Cmd[];
  draw: Cmd;
  state: StateSnap;
  box: { x: number; y: number; w: number; h: number };
}

const STATE_PROPS = [
  "fillStyle",
  "strokeStyle",
  "font",
  "textAlign",
  "textBaseline",
  "globalAlpha",
  "lineWidth",
  "lineJoin",
  "lineCap",
  "shadowColor",
  "shadowBlur",
  "shadowOffsetX",
  "shadowOffsetY",
  "globalCompositeOperation",
  "imageSmoothingEnabled",
] as const;

const PATH_CMDS = new Set([
  "moveTo",
  "lineTo",
  "arc",
  "arcTo",
  "rect",
  "roundRect",
  "ellipse",
  "quadraticCurveTo",
  "bezierCurveTo",
  "closePath",
]);

function pathPoints(cmds: Cmd[]): Array<[number, number]> {
  const pts: Array<[number, number]> = [];
  for (const c of cmds) {
    const a = c.a;
    switch (c.m) {
      case "moveTo":
      case "lineTo":
        pts.push([a[0], a[1]]);
        break;
      case "rect":
      case "roundRect":
        pts.push([a[0], a[1]], [a[0] + a[2], a[1] + a[3]]);
        break;
      case "arc":
        pts.push([a[0] - a[2], a[1] - a[2]], [a[0] + a[2], a[1] + a[2]]);
        break;
      case "ellipse":
        pts.push([a[0] - a[2], a[1] - a[3]], [a[0] + a[2], a[1] + a[3]]);
        break;
      case "arcTo":
        pts.push([a[0], a[1]], [a[2], a[3]]);
        break;
      case "quadraticCurveTo":
        pts.push([a[0], a[1]], [a[2], a[3]]);
        break;
      case "bezierCurveTo":
        pts.push([a[0], a[1]], [a[2], a[3]], [a[4], a[5]]);
        break;
      default:
        break;
    }
  }
  return pts;
}

function boxFromPoints(pts: Array<[number, number]>, m: DOMMatrix) {
  if (!pts.length) return { x: 0, y: 0, w: 0, h: 0 };
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const [px, py] of pts) {
    const x = m.a * px + m.c * py + m.e;
    const y = m.b * px + m.d * py + m.f;
    if (x < minX) minX = x;
    if (y < minY) minY = y;
    if (x > maxX) maxX = x;
    if (y > maxY) maxY = y;
  }
  return { x: minX, y: minY, w: maxX - minX, h: maxY - minY };
}

/** Captura o `d` de cada Path2D criado para conseguir estimar a caixa do ícone. */
const path2dSources = new WeakMap<object, string>();
if (typeof window !== "undefined" && !(window as any).__artPath2DPatched) {
  const OriginalPath2D = (window as any).Path2D;
  if (OriginalPath2D) {
    const Patched = function (this: any, arg?: any) {
      const instance = arg === undefined ? new OriginalPath2D() : new OriginalPath2D(arg);
      if (typeof arg === "string") path2dSources.set(instance, arg);
      return instance;
    } as any;
    Patched.prototype = OriginalPath2D.prototype;
    (window as any).Path2D = Patched;
    (window as any).__artPath2DPatched = true;
  }
}

function pointsFromPathData(d: string): Array<[number, number]> {
  const nums = (d.match(/-?\d*\.?\d+(?:e[-+]?\d+)?/gi) || []).map(Number).filter((n) => Number.isFinite(n));
  const pts: Array<[number, number]> = [];
  for (let i = 0; i + 1 < nums.length; i += 2) pts.push([nums[i], nums[i + 1]]);
  return pts;
}

function fontSizeOf(font: string): number {
  const m = /(\d+(?:\.\d+)?)px/.exec(font || "");
  return m ? parseFloat(m[1]) : 16;
}

/** Separa a fonte do canvas em itálico, peso, tamanho e família. */
function partesFonte(font: string) {
  const m = /^\s*(.*?)\s*(\d+(?:\.\d+)?)px(?:\/\S+)?\s+(.+)$/.exec(font || "");
  if (!m) return { italico: false, peso: 400, tamanho: 16, familia: "sans-serif" };
  const pre = m[1].toLowerCase();
  const num = /\b([1-9]00)\b/.exec(pre)?.[1];
  const peso = num ? Number(num) : /\bbold(er)?\b/.test(pre) ? 700 : /\blighter\b/.test(pre) ? 300 : 400;
  return { italico: /\b(italic|oblique)\b/.test(pre), peso, tamanho: parseFloat(m[2]), familia: m[3] };
}

function shortLabel(kind: DrawOp["kind"], text: string, n: number): string {
  if (kind === "text") {
    const t = (text || "").trim();
    return t ? `Texto “${t.length > 22 ? `${t.slice(0, 22)}…` : t}”` : `Texto ${n}`;
  }
  if (kind === "image") return `Imagem ${n}`;
  return `Forma ${n}`;
}

export interface ArtRecorder {
  ctx: CanvasRenderingContext2D;
  /** Desenha de fato tudo o que foi gravado (idempotente). */
  replay: () => void;
  /** Caixas dos elementos, na ordem de desenho (após replay). */
  elements: ArtElementBox[];
}


const safeApply = (ctx: CanvasRenderingContext2D, method: string, args: any[]) => {
  if (method === 'drawImage') {
    if (args.length === 3) return ctx.drawImage(args[0], args[1], args[2]);
    if (args.length === 5) return ctx.drawImage(args[0], args[1], args[2], args[3], args[4]);
    if (args.length === 9) return ctx.drawImage(args[0], args[1], args[2], args[3], args[4], args[5], args[6], args[7], args[8]);
  }
  if (method === 'getImageData') return ctx.getImageData(args[0], args[1], args[2], args[3]);
  if (method === 'putImageData') {
    if (args.length === 3) return ctx.putImageData(args[0], args[1], args[2]);
    if (args.length === 7) return ctx.putImageData(args[0], args[1], args[2], args[3], args[4], args[5], args[6]);
  }
  if (method === 'fill') {
    if (args.length >= 1 && typeof args[0] === 'object') {
      if (args.length > 1) return ctx.fill(args[0], args[1]);
      return ctx.fill(args[0]);
    }
    if (args.length === 1) return ctx.fill(args[0]);
    return ctx.fill();
  }
  if (method === 'stroke') {
    if (args.length >= 1 && typeof args[0] === 'object') return ctx.stroke(args[0]);
    return ctx.stroke();
  }
  if (method === 'clip') {
    if (args.length >= 1 && typeof args[0] === 'object') {
      if (args.length > 1) return ctx.clip(args[0], args[1]);
      return ctx.clip(args[0]);
    }
    if (args.length === 1) return ctx.clip(args[0]);
    return ctx.clip();
  }
  if (method === 'fillText') {
    if (args.length > 3) return ctx.fillText(args[0], args[1], args[2], args[3]);
    return ctx.fillText(args[0], args[1], args[2]);
  }
  if (method === 'strokeText') {
    if (args.length > 3) return ctx.strokeText(args[0], args[1], args[2], args[3]);
    return ctx.strokeText(args[0], args[1], args[2]);
  }
  if (method === 'fillRect') return ctx.fillRect(args[0], args[1], args[2], args[3]);
  if (method === 'strokeRect') return ctx.strokeRect(args[0], args[1], args[2], args[3]);
  if (method === 'clearRect') return ctx.clearRect(args[0], args[1], args[2], args[3]);
  if (method === 'rect') return ctx.rect(args[0], args[1], args[2], args[3]);
  if (method === 'arc') return ctx.arc(args[0], args[1], args[2], args[3], args[4], args[5]);
  if (method === 'moveTo') return ctx.moveTo(args[0], args[1]);
  if (method === 'lineTo') return ctx.lineTo(args[0], args[1]);
  if (method === 'bezierCurveTo') return ctx.bezierCurveTo(args[0], args[1], args[2], args[3], args[4], args[5]);
  if (method === 'quadraticCurveTo') return ctx.quadraticCurveTo(args[0], args[1], args[2], args[3]);
  if (method === 'arcTo') return ctx.arcTo(args[0], args[1], args[2], args[3], args[4]);
  if (method === 'createPattern') return ctx.createPattern(args[0], args[1]);
  if (method === 'createLinearGradient') return ctx.createLinearGradient(args[0], args[1], args[2], args[3]);
  if (method === 'createRadialGradient') return ctx.createRadialGradient(args[0], args[1], args[2], args[3], args[4], args[5]);
  if (method === 'setLineDash') return ctx.setLineDash(args[0]);
  
  return (ctx as any)[method].apply(ctx, args);
};

/** Item do editor desenhado no meio da arte (atrás de algum elemento). Coordenadas da arte (1080 de largura). */
export interface ArtInjectedLayer { z: number; img: CanvasImageSource; x: number; y: number; w: number; h: number; rot?: number }

export function createArtRecorder(real: CanvasRenderingContext2D, tweaks?: ArtTweakMap, opcoes?: { escala?: number; camadas?: ArtInjectedLayer[] }): ArtRecorder {
  let map = tweaks || {};
  const escala = opcoes?.escala && opcoes.escala > 0 ? opcoes.escala : 1;
  const camadas = opcoes?.camadas || [];
  let camadasDesenhadas = false;
  /**
   * Sem ajustes de admin não há motivo para adiar o desenho: desenhamos direto
   * (comportamento original do motor) e apenas gravamos as caixas dos elementos
   * para o editor. Só quando existem tweaks é que entramos no modo "replay".
   */
  const deferred = Object.keys(map).length > 0 || camadas.length > 0;
  const ops: DrawOp[] = [];
  const counters: Record<string, number> = { text: 0, image: 0, shape: 0 };
  let pendingPath: Cmd[] = [];
  let clipStack: ClipEntry[] = [];
  const saveStack: ClipEntry[][] = [];
  let replayedUpTo = 0;
  let currentGroup: { id: string; label: string; ops: DrawOp[]; box: any; state: any } | null = null;
  const elements: ArtElementBox[] = [];

  const snap = (): StateSnap => {
    const s: any = { matrix: real.getTransform(), clips: clipStack.slice() };
    for (const p of STATE_PROPS) s[p] = (real as any)[p];
    return s as StateSnap;
  };

  const nextId = (kind: DrawOp["kind"]) => {
    counters[kind] += 1;
    const prefix = kind === "text" ? "t" : kind === "image" ? "img" : "sh";
    return `${prefix}${counters[kind]}`;
  };

  const pushOp = (op: Omit<DrawOp, "id" | "label">, text?: string) => {
    const id = nextId(op.kind);
    const n = counters[op.kind];
    ops.push({ ...op, id, label: shortLabel(op.kind, text || "", n) } as DrawOp);
  };

  const recordText = (method: "fillText" | "strokeText", a: any[]) => {
    const text = String(a[0] ?? "");
    const x = a[1] as number;
    const y = a[2] as number;
    const state = snap();
    let w = 0;
    try {
      w = real.measureText(text).width;
    } catch {
      w = text.length * fontSizeOf(state.font) * 0.5;
    }
    const fs = fontSizeOf(state.font);
    const align = state.textAlign;
    const left = align === "center" ? x - w / 2 : align === "right" || align === "end" ? x - w : x;
    const base = state.textBaseline;
    const top = base === "middle" ? y - fs * 0.55 : base === "top" || base === "hanging" ? y : y - fs * 0.8;
    const box = boxFromPoints(
      [
        [left, top],
        [left + w, top + fs * 1.1],
      ],
      state.matrix,
    );
    pushOp({ kind: "text", text, draw: { m: method, a: a.slice() }, state, box }, text);
    if (!deferred) safeApply(real, method, a);
  };

  const recordImage = (a: any[]) => {
    const state = snap();
    let dx = 0;
    let dy = 0;
    let dw = 0;
    let dh = 0;
    const src: any = a[0];
    if (a.length >= 9) {
      dx = a[5];
      dy = a[6];
      dw = a[7];
      dh = a[8];
    } else if (a.length >= 5) {
      dx = a[1];
      dy = a[2];
      dw = a[3];
      dh = a[4];
    } else {
      dx = a[1];
      dy = a[2];
      dw = src?.width || src?.naturalWidth || 0;
      dh = src?.height || src?.naturalHeight || 0;
    }
    const box = boxFromPoints(
      [
        [dx, dy],
        [dx + dw, dy + dh],
      ],
      state.matrix,
    );
    pushOp({ kind: "image", draw: { m: "drawImage", a: a.slice() }, state, box });
    if (!deferred) {
      if (a.length === 3) real.drawImage(a[0], a[1], a[2]);
      else if (a.length === 5) real.drawImage(a[0], a[1], a[2], a[3], a[4]);
      else if (a.length === 9) real.drawImage(a[0], a[1], a[2], a[3], a[4], a[5], a[6], a[7], a[8]);
      else safeApply(real, 'drawImage', a);
    }
  };

  const recordRect = (method: "fillRect" | "strokeRect", a: any[]) => {
    const state = snap();
    const box = boxFromPoints(
      [
        [a[0], a[1]],
        [a[0] + a[2], a[1] + a[3]],
      ],
      state.matrix,
    );
    pushOp({ kind: "shape", draw: { m: method, a: a.slice() }, state, box });
    if (!deferred) safeApply(real, method, a);
  };

  const recordPathDraw = (method: "fill" | "stroke", a: any[]) => {
    const state = snap();
    const cmds = pendingPath.slice();
    const box = boxFromPoints(pathPoints(cmds), state.matrix);
    pushOp({ kind: "shape", path: cmds, draw: { m: method, a: a.slice() }, state, box });
    if (!deferred) safeApply(real, method, a);
  };

  const applyClips = (clips: ClipEntry[]) => {
    for (const clip of clips) {
      real.setTransform(clip.matrix);
      real.beginPath();
      for (const c of clip.cmds) safeApply(real, c.m, c.a);
      if (clip.rule) real.clip(clip.rule);
      else real.clip();
    }
  };

  /** Fonte do texto com os ajustes (família, negrito, itálico). */
  const fonteDo = (op: DrawOp, t: any) => {
    const p = partesFonte(op.state.font);
    const peso = t.bold === true ? (p.peso >= 600 ? p.peso : 800) : t.bold === false ? (p.peso >= 600 ? 400 : p.peso) : p.peso;
    const ital = typeof t.italic === "boolean" ? t.italic : p.italico;
    const fam = t.fontFamily ? `"${t.fontFamily}"` : p.familia;
    return { font: `${ital ? "italic " : ""}${peso} ${p.tamanho}px ${fam}`, ...p, peso, ital };
  };
  /** Põe a fonte no canvas. A arte troca toda fonte pela fonte geral (setter no próprio contexto);
   *  quando o editor escolheu outra família para este texto, usa o setter original do canvas. */
  const porFonte = (op: DrawOp, t: any) => {
    const f = fonteDo(op, t).font;
    if (t.fontFamily) {
      const d = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(real), "font");
      if (d?.set) { d.set.call(real, f); return; }
    }
    real.font = f;
  };
  /** Caixa local (antes da matriz) de cada linha do texto, com os ajustes. */
  const linhasDoTexto = (op: DrawOp, t: any) => {
    const raw = typeof t.text === "string" ? t.text : op.text || "";
    const lines: string[] = String(raw).split("\n");
    const fs = fontSizeOf(op.state.font);
    const origX = op.draw.a[1] as number;
    const origY = op.draw.a[2] as number;
    let adjX = origX;
    let align: CanvasTextAlign = op.state.textAlign;
    if (t.align && t.align !== op.state.textAlign) {
      const o = op.state.textAlign === "end" ? "right" : op.state.textAlign === "start" ? "left" : op.state.textAlign;
      const n = t.align === "end" ? "right" : t.align === "start" ? "left" : t.align;
      const pos = (q: string) => (q === "center" ? 0.5 : q === "right" ? 1 : 0);
      adjX += (pos(n) - pos(o)) * (op.box.w / (Math.hypot(op.state.matrix.a, op.state.matrix.b) || 1));
      align = n as CanvasTextAlign;
    }
    const lh = Number.isFinite(t.lineHeight as number) && (t.lineHeight as number) > 0
      ? (t.lineHeight as number)
      : fs * (Number.isFinite(t.lineSpacing as number) && (t.lineSpacing as number) > 0 ? (t.lineSpacing as number) : 1.1);
    const ls = Number.isFinite(t.letterSpacing as number) ? (fs * (t.letterSpacing as number)) / 1000 : 0;
    return { lines, fs, adjX, origY, align, lh, ls };
  };
  const caixaLocalTexto = (op: DrawOp, t: any) => {
    const L = linhasDoTexto(op, t);
    real.save();
    real.setTransform(1, 0, 0, 1, 0, 0);
    porFonte(op, t);
    try { (real as any).letterSpacing = `${L.ls}px`; } catch { /* sem suporte */ }
    const ws = L.lines.map((l) => { try { return real.measureText(l).width; } catch { return l.length * L.fs * 0.5; } });
    real.restore();
    const base = op.state.textBaseline;
    const top0 = base === "middle" ? L.origY - L.fs * 0.55 : base === "top" || base === "hanging" ? L.origY : L.origY - L.fs * 0.8;
    const W = Math.max(1, ...ws);
    const left = L.align === "center" ? L.adjX - W / 2 : L.align === "right" || L.align === "end" ? L.adjX - W : L.adjX;
    let h = L.fs * 1.1 + (L.lines.length - 1) * L.lh;
    let topo = top0;
    if (t.effect?.tipo === "curvar") {
      const ang = Math.min(Math.PI * 1.8, 0.9 * Math.max(0.1, (t.effect.forca ?? 50) / 50));
      const R = W / ang;
      h += R * (1 - Math.cos(ang / 2));
    }
    if (t.effect?.tipo === "fundo") { const pad = L.fs * 0.22 * Math.max(0.1, (t.effect.forca ?? 50) / 50); return { x: left - pad, y: topo - pad * 0.6, w: W + pad * 2, h: h + pad * 1.2, L, ws }; }
    return { x: left, y: topo, w: W, h, L, ws };
  };
  /** Retângulo local da imagem desenhada (para o corte). */
  const retImagem = (op: DrawOp) => {
    const a = op.draw.a;
    if (a.length >= 9) return { x: a[5], y: a[6], w: a[7], h: a[8] };
    if (a.length >= 5) return { x: a[1], y: a[2], w: a[3], h: a[4] };
    return { x: a[1], y: a[2], w: a[0]?.width || a[0]?.naturalWidth || 0, h: a[0]?.height || a[0]?.naturalHeight || 0 };
  };
  const matrizDoAjuste = (op: DrawOp, t: any) => {
    const scale = Number.isFinite(t.scale as number) && (t.scale as number) > 0 ? (t.scale as number) : 1;
    const sx = Number.isFinite(t.scaleX as number) ? (t.scaleX as number) : scale;
    const sy = Number.isFinite(t.scaleY as number) ? (t.scaleY as number) : scale;
    const cx = op.box.x + op.box.w / 2;
    const cy = op.box.y + op.box.h / 2;
    const rot = Number.isFinite(t.rotate as number) ? (t.rotate as number) : 0;
    return { m: new DOMMatrix().translate((t.dx || 0) * escala, (t.dy || 0) * escala).translate(cx, cy).rotate(rot).scale(sx, sy).translate(-cx, -cy), sx, sy };
  };

  const drawOp = (op: DrawOp) => {
    const t = map[op.id] || {};
    if (t.hidden) return;

    real.save();
    try {
      applyClips(op.state.clips);
      for (const p of STATE_PROPS) {
        try { (real as any)[p] = (op.state as any)[p]; } catch { /* noop */ }
      }
      if (op.kind === "text") { try { porFonte(op, t); } catch { /* fonte inválida: fica a original */ } }

      // cor escolhida no editor (texto ou forma): troca o preenchimento e o contorno
      if (typeof t.color === "string" && t.color && op.kind !== "image") {
        real.fillStyle = t.color;
        if (op.draw.m === "stroke" || op.draw.m === "strokeText" || op.draw.m === "strokeRect") real.strokeStyle = t.color;
      }
      if (Number.isFinite(t.opacity as number)) real.globalAlpha = op.state.globalAlpha * Math.max(0, Math.min(1, t.opacity as number));
      if (t.filter && op.kind === "image") { try { (real as any).filter = t.filter; } catch { /* sem suporte */ } }

      const { m, sx } = matrizDoAjuste(op, t);
      const base = m.multiply(op.state.matrix);
      real.setTransform(base);
      const sc = Math.hypot(op.state.matrix.a, op.state.matrix.b) || 1;

      // degradê: da esquerda para a direita da caixa do elemento (em coordenadas locais)
      if (Array.isArray(t.gradient) && t.gradient.length === 2 && op.kind !== "image") {
        let gx0: number, gx1: number, gy: number;
        if (op.kind === "text") { const c = caixaLocalTexto(op, t); gx0 = c.x; gx1 = c.x + c.w; gy = c.y; }
        else {
          const inv = op.state.matrix.inverse();
          const p1 = inv.transformPoint({ x: op.box.x, y: op.box.y }), p2 = inv.transformPoint({ x: op.box.x + op.box.w, y: op.box.y });
          gx0 = p1.x; gx1 = p2.x; gy = p1.y;
        }
        const g = real.createLinearGradient(gx0, gy, gx1 === gx0 ? gx0 + 1 : gx1, gy);
        g.addColorStop(0, t.gradient[0]); g.addColorStop(1, t.gradient[1]);
        real.fillStyle = g;
        if (op.draw.m === "stroke" || op.draw.m === "strokeText" || op.draw.m === "strokeRect") real.strokeStyle = g;
      }
      if (op.kind === "image" && t.crop) {
        const ri = retImagem(op), c = t.crop;
        real.beginPath();
        real.rect(ri.x + ri.w * (c.l || 0), ri.y + ri.h * (c.t || 0), ri.w * Math.max(0.05, 1 - (c.l || 0) - (c.r || 0)), ri.h * Math.max(0.05, 1 - (c.t || 0) - (c.b || 0)));
        real.clip();
      }

      // ——— a primitiva, que o efeito pode pintar mais de uma vez ———
      let pinta: (modo?: "fill" | "stroke") => void;
      let u: number;
      let fsLocal = 16;
      let caixaTx: ReturnType<typeof caixaLocalTexto> | null = null;
      const fx = t.effect as { tipo: string; cor?: string; forca?: number } | undefined;
      const forca = fx ? Math.max(0.1, (fx.forca ?? 50) / 50) : 1;
      if (op.kind === "text") {
        caixaTx = caixaLocalTexto(op, t);
        const L = caixaTx.L;
        fsLocal = L.fs;
        u = L.fs * sc * sx;
        real.textAlign = L.align;
        try { (real as any).letterSpacing = `${L.ls}px`; } catch { /* sem suporte */ }
        const maxW = op.draw.a[3];
        const curva = fx?.tipo === "curvar";
        pinta = (modo) => {
          const fn = modo === "stroke" ? "strokeText" : modo === "fill" ? "fillText" : op.draw.m;
          L.lines.forEach((line, i) => {
            const y = L.origY + i * L.lh;
            if (curva && line) {
              const W = caixaTx!.ws[i] || 1;
              const ang = Math.min(Math.PI * 1.8, 0.9 * forca);
              const R = W / ang;
              const left = L.align === "center" ? L.adjX - W / 2 : L.align === "right" || L.align === "end" ? L.adjX - W : L.adjX;
              const cxL = left + W / 2;
              let acc = 0;
              real.save();
              real.textAlign = "center";
              for (const ch of Array.from(line)) {
                const cw = real.measureText(ch).width;
                const th = -ang / 2 + (acc + cw / 2) / R;
                real.save(); real.translate(cxL, y + R); real.rotate(th);
                (real as any)[fn](ch, 0, -R);
                real.restore();
                acc += cw;
              }
              real.restore();
              return;
            }
            if (typeof maxW === "number") (real as any)[fn](line, L.adjX, y, maxW);
            else (real as any)[fn](line, L.adjX, y);
          });
        };
      } else {
        u = Math.max(8, Math.min(op.box.w * sx, op.box.h * sx));
        pinta = () => {
          if (op.path) {
            real.beginPath();
            for (const c of op.path) safeApply(real, c.m, c.a);
          }
          if ((op.draw.m === "fill" || op.draw.m === "stroke") && op.draw.a.length >= 1 && typeof op.draw.a[0] === "object") {
            if (op.draw.m === "stroke") real.stroke(op.draw.a[0]);
            else if (op.draw.a.length > 1) real.fill(op.draw.a[0], op.draw.a[1]);
            else real.fill(op.draw.a[0]);
          } else if (op.draw.m === "drawImage") {
            const a = op.draw.a;
            if (a.length === 3) real.drawImage(a[0], a[1], a[2]);
            else if (a.length === 5) real.drawImage(a[0], a[1], a[2], a[3], a[4]);
            else if (a.length === 9) real.drawImage(a[0], a[1], a[2], a[3], a[4], a[5], a[6], a[7], a[8]);
            else safeApply(real, "drawImage", a);
          } else {
            safeApply(real, op.draw.m, op.draw.a);
          }
        };
      }

      const corDe = (v: any, padrao: string) => (typeof v === "string" ? v : padrao);
      const clara = (c: string) => {
        const h = /^#([0-9a-f]{6})$/i.exec(c)?.[1];
        if (!h) return true;
        const n = parseInt(h, 16);
        return (0.299 * ((n >> 16) & 255) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255)) / 255 > 0.6;
      };
      const comDeslocamento = (ox: number, oy: number, fazer: () => void) => {
        real.setTransform(new DOMMatrix().translate(ox, oy).multiply(base));
        fazer();
        real.setTransform(base);
      };
      const tipo = fx?.tipo;
      const ehTexto = op.kind === "text";
      if (tipo === "sombra") {
        real.shadowColor = fx!.cor || "rgba(0,0,0,.6)";
        real.shadowBlur = u * 0.12 * forca; real.shadowOffsetX = u * 0.06 * forca; real.shadowOffsetY = u * 0.06 * forca;
        pinta();
      } else if (tipo === "brilho") {
        real.shadowColor = fx!.cor || corDe(real.fillStyle, "#ffffff");
        real.shadowBlur = u * 0.4 * forca;
        pinta(); pinta();
      } else if (tipo === "eco") {
        const passo = u * 0.06 * forca, a0 = real.globalAlpha, f0 = real.fillStyle, s0 = real.strokeStyle;
        for (const [k, al] of [[2, 0.25], [1, 0.5]] as const) {
          real.globalAlpha = a0 * al;
          if (fx!.cor) { real.fillStyle = fx!.cor; real.strokeStyle = fx!.cor; }
          comDeslocamento(passo * k, passo * k, () => pinta());
        }
        real.globalAlpha = a0; real.fillStyle = f0; real.strokeStyle = s0;
        pinta();
      } else if (tipo === "falha") {
        const o = u * 0.05 * forca, a0 = real.globalAlpha, f0 = real.fillStyle, s0 = real.strokeStyle;
        real.globalAlpha = a0 * 0.9;
        for (const [ox, c] of [[-o, "#00E5FF"], [o, "#FF2BD6"]] as const) {
          real.fillStyle = c; real.strokeStyle = c;
          comDeslocamento(ox, 0, () => pinta());
        }
        real.globalAlpha = a0; real.fillStyle = f0; real.strokeStyle = s0;
        pinta();
      } else if (tipo === "contorno") {
        if (ehTexto) {
          real.lineJoin = "round";
          real.lineWidth = fsLocal * 0.14 * forca;
          real.strokeStyle = fx!.cor || (clara(corDe(real.fillStyle, "#ffffff")) ? "#111111" : "#FFFFFF");
          pinta("stroke"); pinta("fill");
        } else {
          pinta();
          real.lineJoin = "round";
          real.lineWidth = (u * 0.04 * forca) / sc;
          real.strokeStyle = fx!.cor || "#111111";
          if (op.path) real.stroke(); else if (op.draw.m === "fillRect") real.strokeRect(op.draw.a[0], op.draw.a[1], op.draw.a[2], op.draw.a[3]);
        }
      } else if (tipo === "fundo" && ehTexto && caixaTx) {
        const L = caixaTx.L, pad = fsLocal * 0.22 * forca, f0 = real.fillStyle;
        real.fillStyle = fx!.cor || (clara(corDe(f0, "#ffffff")) ? "#111111" : "#FFFFFF");
        L.lines.forEach((_, i) => {
          const W = caixaTx!.ws[i] || 0;
          if (!W) return;
          const left = L.align === "center" ? L.adjX - W / 2 : L.align === "right" || L.align === "end" ? L.adjX - W : L.adjX;
          real.beginPath();
          real.roundRect(left - pad, caixaTx!.y - pad * 0.6 + i * L.lh, W + pad * 2, fsLocal * 1.1 + pad * 1.2, fsLocal * 0.2);
          real.fill();
        });
        real.fillStyle = f0;
        pinta();
      } else if (tipo === "vazado" && ehTexto) {
        real.lineJoin = "round";
        real.miterLimit = 2;
        real.lineWidth = fsLocal * Math.min(0.06, 0.03 * forca);
        real.strokeStyle = fx!.cor || real.fillStyle;
        pinta("stroke");
      } else if (tipo === "desalinhado" && ehTexto) {
        // como o Canva: o recheio sai do lugar (mais claro) e as letras ficam só no contorno
        const o = fsLocal * 0.06 * forca, f0 = real.fillStyle, a0 = real.globalAlpha;
        if (fx!.cor) real.fillStyle = fx!.cor; else real.globalAlpha = a0 * 0.42;
        comDeslocamento(o * sc * sx, o * sc * sx, () => pinta("fill"));
        real.fillStyle = f0; real.globalAlpha = a0;
        real.lineJoin = "round";
        real.lineWidth = fsLocal * 0.055;
        real.strokeStyle = f0;
        pinta("stroke");
      } else if (tipo === "neon" && ehTexto) {
        const c = fx!.cor || "#FF2BD6";
        real.shadowColor = c; real.shadowBlur = u * 0.5 * forca;
        real.lineJoin = "round"; real.lineWidth = fsLocal * 0.05; real.strokeStyle = c;
        pinta("stroke");
        real.fillStyle = "#FFFFFF";
        pinta("fill");
        real.shadowBlur = u * 0.2 * forca;
        pinta("fill");
      } else {
        pinta();
      }
    } catch {
      /* uma primitiva quebrada não pode derrubar a arte inteira */
    } finally {
      real.restore();
    }
  };

  const replay = () => {
    // cópias feitas no editor ("Duplicar"): o mesmo desenho com outro id, logo depois do original
    for (const [id, tw] of Object.entries(map)) {
      if (!tw?.cloneOf || ops.some((o) => o.id === id)) continue;
      const i = ops.findIndex((o) => o.id === tw.cloneOf);
      if (i < replayedUpTo) continue;
      if (i >= 0) ops.splice(i + 1, 0, { ...ops[i], id, label: `${ops[i].label} (cópia)` });
    }
    if (replayedUpTo >= ops.length) return;
    const slice = ops.slice(replayedUpTo);
    replayedUpTo = ops.length;
    // Os IDs (t1, t2...) dependem do conteúdo da arte. Se um ajuste salvo esconde o preço,
    // ele foi feito para outra composição: usamos o layout original para o preço nunca sumir.
    const hidesPrice = ops.some(
      (op) => op.kind === "text" && map[op.id]?.hidden && /(R\$|US\$|€|\$)\s*\d/.test(op.text || ""),
    );
    if (hidesPrice) map = {};
    if (deferred) {
    type Item = { op?: DrawOp; cam?: ArtInjectedLayer; i: number; z: number };
    const ordered: Item[] = slice.map((op, i) => ({ op, i, z: Number.isFinite(map[op.id]?.z as number) ? (map[op.id]!.z as number) : 0 }));
    if (!camadasDesenhadas) { camadasDesenhadas = true; camadas.forEach((cam, k) => ordered.push({ cam, i: slice.length + k, z: cam.z })); }
    ordered.sort((a, b) => (a.z === b.z ? a.i - b.i : a.z - b.z));
    real.save();
    for (const entry of ordered) {
      if (entry.op) { drawOp(entry.op); continue; }
      const c = entry.cam!;
      real.save();
      try {
        real.setTransform(escala, 0, 0, escala, 0, 0);
        real.translate(c.x, c.y);
        if (c.rot) real.rotate((c.rot * Math.PI) / 180);
        real.drawImage(c.img, -c.w / 2, -c.h / 2, c.w, c.h);
      } catch { /* imagem que não carregou não derruba a arte */ }
      real.restore();
    }
    real.restore();
    }

    for (const op of slice) {
      const t = map[op.id] || {};
      let caixa = { x: op.box.x, y: op.box.y, w: op.box.w, h: op.box.h };
      let extra: Partial<ArtElementBox> = {};
      try {
        let local: { x: number; y: number; w: number; h: number } | null = null;
        if (op.kind === "text") {
          const c = caixaLocalTexto(op, t);
          local = { x: c.x, y: c.y, w: c.w, h: c.h };
          const p = fonteDo(op, t);
          const sc = Math.hypot(op.state.matrix.a, op.state.matrix.b) || 1;
          extra = { fontSize: Math.round(p.tamanho * sc * 10) / 10, fontWeight: partesFonte(op.state.font).peso, fontFamily: partesFonte(op.state.font).familia.replace(/"/g, "").split(",")[0].trim(), italic: partesFonte(op.state.font).italico, align: op.state.textAlign };
        } else if (op.kind === "image" && t.crop) {
          const ri = retImagem(op), c = t.crop;
          local = { x: ri.x + ri.w * (c.l || 0), y: ri.y + ri.h * (c.t || 0), w: ri.w * (1 - (c.l || 0) - (c.r || 0)), h: ri.h * (1 - (c.t || 0) - (c.b || 0)) };
        }
        const { m } = matrizDoAjuste(op, t);
        const pts = local
          ? [[local.x, local.y], [local.x + local.w, local.y], [local.x, local.y + local.h], [local.x + local.w, local.y + local.h]].map(([px, py]) => op.state.matrix.transformPoint({ x: px, y: py }))
          : [{ x: op.box.x, y: op.box.y }, { x: op.box.x + op.box.w, y: op.box.y }, { x: op.box.x, y: op.box.y + op.box.h }, { x: op.box.x + op.box.w, y: op.box.y + op.box.h }];
        const q = pts.map((p) => m.transformPoint(p));
        const xs = q.map((p) => p.x), ys = q.map((p) => p.y);
        caixa = { x: Math.min(...xs), y: Math.min(...ys), w: Math.max(...xs) - Math.min(...xs), h: Math.max(...ys) - Math.min(...ys) };
      } catch { /* fica a caixa original */ }
      elements.push({ id: op.id, label: op.label, kind: op.kind, text: op.text, ...caixa, ...extra });
    }
  };

  const proxy = new Proxy(real, {
    get(target, prop: string, receiver) {
      if (prop === "__artRecorder") return true;

      if (prop === "__beginGroup") {
        return (label: string) => {
          const id = nextId("shape");
          currentGroup = {
            id,
            label,
            ops: [],
            box: { x: 9999, y: 9999, w: 0, h: 0 },
            state: snap(),
          };
        };
      }
      if (prop === "__endGroup") {
        return () => {
          if (currentGroup && currentGroup.ops.length > 0) {
            ops.push({
              id: currentGroup.id,
              kind: "shape",
              label: currentGroup.label,
              draw: { m: "__group", a: currentGroup.ops },
              state: currentGroup.state,
              box: currentGroup.box,
            });
          }
          currentGroup = null;
        };
      }

      if (prop === "getImageData") {
        return (...a: any[]) => {
          replay();
          return safeApply(target, 'getImageData', a);
        };
      }

      if (prop === "save") {
        return () => {
          saveStack.push(clipStack.slice());
          target.save();
        };
      }
      if (prop === "restore") {
        return () => {
          clipStack = saveStack.pop() || [];
          target.restore();
        };
      }
      if (prop === "beginPath") {
        return () => {
          pendingPath = [];
          target.beginPath();
        };
      }
      if (PATH_CMDS.has(prop)) {
        return (...a: any[]) => {
          pendingPath.push({ m: prop, a });
          safeApply(target, prop, a);
        };
      }
      if (prop === "clip") {
        return (...a: any[]) => {
          clipStack = clipStack.concat([
            { cmds: pendingPath.slice(), matrix: target.getTransform(), rule: a[0] as CanvasFillRule },
          ]);
          safeApply(target, 'clip', a);
        };
      }
      if (prop === "fill" || prop === "stroke") {
        return (...a: any[]) => {
          if (a[0] && typeof a[0] === "object" && typeof (a[0] as any).addPath === "function") {
            const state = snap();
            const d = path2dSources.get(a[0] as any) || "";
            const pts = pointsFromPathData(d);
            const box = pts.length
              ? boxFromPoints(pts, state.matrix)
              : boxFromPoints([[0, 0], [24, 24]], state.matrix);
            pushOp({ kind: "shape", draw: { m: prop, a: a.slice() }, state, box });
            if (!deferred) {
              if (prop === "stroke") safeApply(target, 'stroke', a);
              else if (a.length > 1) safeApply(target, 'fill', a);
              else safeApply(target, 'fill', a);
            }
            return;
          }
          recordPathDraw(prop as "fill" | "stroke", a);
        };
      }
      if (prop === "fillText" || prop === "strokeText") {
        return (...a: any[]) => recordText(prop as "fillText", a);
      }
      if (prop === "fillRect" || prop === "strokeRect") {
        return (...a: any[]) => recordRect(prop as "fillRect", a);
      }
      if (prop === "drawImage") {
        return (...a: any[]) => recordImage(a);
      }

      const value = (target as any)[prop];
      if (typeof value === "function") return value.bind(target);
      return value;
    },
    set(target, prop: string, value) {
      (target as any)[prop] = value;
      return true;
    },
  }) as unknown as CanvasRenderingContext2D;

  return {
    ctx: proxy,
    replay,
    elements,
  };
}

