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

export function createArtRecorder(real: CanvasRenderingContext2D, tweaks?: ArtTweakMap): ArtRecorder {
  const map = tweaks || {};
  /**
   * Sem ajustes de admin não há motivo para adiar o desenho: desenhamos direto
   * (comportamento original do motor) e apenas gravamos as caixas dos elementos
   * para o editor. Só quando existem tweaks é que entramos no modo "replay".
   */
  const deferred = Object.keys(map).length > 0;
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
    if (!deferred) (real as any)[method].apply(real, a);
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
      else (real as any).drawImage.apply(real, a);
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
    if (!deferred) (real as any)[method].apply(real, a);
  };

  const recordPathDraw = (method: "fill" | "stroke", a: any[]) => {
    const state = snap();
    const cmds = pendingPath.slice();
    const box = boxFromPoints(pathPoints(cmds), state.matrix);
    pushOp({ kind: "shape", path: cmds, draw: { m: method, a: a.slice() }, state, box });
    if (!deferred) (real as any)[method].apply(real, a);
  };

  const applyClips = (clips: ClipEntry[]) => {
    for (const clip of clips) {
      real.setTransform(clip.matrix);
      real.beginPath();
      for (const c of clip.cmds) (real as any)[c.m].apply(real, c.a);
      if (clip.rule) real.clip(clip.rule);
      else real.clip();
    }
  };

  const drawOp = (op: DrawOp) => {
    const t = map[op.id] || {};
    if (t.hidden) return;
    const dx = Number.isFinite(t.dx as number) ? (t.dx as number) : 0;
    const dy = Number.isFinite(t.dy as number) ? (t.dy as number) : 0;
    const scale = Number.isFinite(t.scale as number) && (t.scale as number) > 0 ? (t.scale as number) : 1;
    const rot = Number.isFinite(t.rotate as number) ? (t.rotate as number) : 0;

    real.save();
    try {
      applyClips(op.state.clips);
      for (const p of STATE_PROPS) {
        try {
          if (p === 'font' && (t.bold || t.italic)) {
             let f = (op.state as any)[p];
             f = f.replace(/bold\s/i, '').replace(/italic\s/i, '').replace(/oblique\s/i, '').replace(/normal\s/i, '');
             if (t.bold) f = "bold " + f;
             if (t.italic) f = "italic " + f;
             (real as any)[p] = f;
          } else {
             (real as any)[p] = (op.state as any)[p];
          }
        } catch {
          /* noop */
        }
      }

      const cx = op.box.x + op.box.w / 2;
      const cy = op.box.y + op.box.h / 2;
      let m = new DOMMatrix();
      const sx = Number.isFinite(t.scaleX as number) ? (t.scaleX as number) : scale;
      const sy = Number.isFinite(t.scaleY as number) ? (t.scaleY as number) : scale;
      m = m.translate(dx, dy).translate(cx, cy).scale(sx, sy).rotate(rot).translate(-cx, -cy);
      real.setTransform(m.multiply(op.state.matrix));

      if (op.kind === "text") {
        const raw = typeof t.text === "string" ? t.text : op.text || "";
        const lines = raw.split("\n");
        const fs = fontSizeOf(op.state.font);
        const origX = op.draw.a[1] as number;
        const origY = op.draw.a[2] as number;
        let adjX = origX;
        if (t.align && t.align !== op.state.textAlign) {
           real.textAlign = t.align;
           if (op.state.textAlign === "left" && t.align === "center") adjX += op.box.w / 2;
           else if (op.state.textAlign === "left" && t.align === "right") adjX += op.box.w;
           else if (op.state.textAlign === "center" && t.align === "left") adjX -= op.box.w / 2;
           else if (op.state.textAlign === "center" && t.align === "right") adjX += op.box.w / 2;
           else if (op.state.textAlign === "right" && t.align === "left") adjX -= op.box.w;
           else if (op.state.textAlign === "right" && t.align === "center") adjX -= op.box.w / 2;
        }
        const lh = Number.isFinite(t.lineHeight as number) && (t.lineHeight as number) > 0
          ? (t.lineHeight as number)
          : fs * 1.1;
        const maxW = op.draw.a[3];
        lines.forEach((line, i) => {
          if (typeof maxW === "number") (real as any)[op.draw.m].apply(real, [line, adjX, origY + i * lh, maxW]);
          else (real as any)[op.draw.m].apply(real, [line, adjX, origY + i * lh]);
        });
      } else if (op.path) {
        real.beginPath();
        for (const c of op.path) (real as any)[c.m].apply(real, c.a);
        
        if ((op.draw.m === "fill" || op.draw.m === "stroke") && op.draw.a.length >= 1 && typeof op.draw.a[0] === "object") {
          if (op.draw.m === "stroke") real.stroke(op.draw.a[0]);
          else if (op.draw.a.length > 1) real.fill(op.draw.a[0], op.draw.a[1]);
          else real.fill(op.draw.a[0]);
        } else if (op.draw.m === "drawImage") {
          if (op.draw.a.length === 3) real.drawImage(op.draw.a[0], op.draw.a[1], op.draw.a[2]);
          else if (op.draw.a.length === 5) real.drawImage(op.draw.a[0], op.draw.a[1], op.draw.a[2], op.draw.a[3], op.draw.a[4]);
          else if (op.draw.a.length === 9) real.drawImage(op.draw.a[0], op.draw.a[1], op.draw.a[2], op.draw.a[3], op.draw.a[4], op.draw.a[5], op.draw.a[6], op.draw.a[7], op.draw.a[8]);
          else (real as any).drawImage.apply(real, op.draw.a);
        } else {
          (real as any)[op.draw.m].apply(real, op.draw.a);
        }
      } else {
        if ((op.draw.m === "fill" || op.draw.m === "stroke") && op.draw.a.length >= 1 && typeof op.draw.a[0] === "object") {
          if (op.draw.m === "stroke") real.stroke(op.draw.a[0]);
          else if (op.draw.a.length > 1) real.fill(op.draw.a[0], op.draw.a[1]);
          else real.fill(op.draw.a[0]);
        } else if (op.draw.m === "drawImage") {
          if (op.draw.a.length === 3) real.drawImage(op.draw.a[0], op.draw.a[1], op.draw.a[2]);
          else if (op.draw.a.length === 5) real.drawImage(op.draw.a[0], op.draw.a[1], op.draw.a[2], op.draw.a[3], op.draw.a[4]);
          else if (op.draw.a.length === 9) real.drawImage(op.draw.a[0], op.draw.a[1], op.draw.a[2], op.draw.a[3], op.draw.a[4], op.draw.a[5], op.draw.a[6], op.draw.a[7], op.draw.a[8]);
          else (real as any).drawImage.apply(real, op.draw.a);
        } else {
          (real as any)[op.draw.m].apply(real, op.draw.a);
        }
      }
    } catch {
      /* uma primitiva quebrada não pode derrubar a arte inteira */
    } finally {
      real.restore();
    }
  };

  const replay = () => {
    if (replayedUpTo >= ops.length) return;
    const slice = ops.slice(replayedUpTo);
    replayedUpTo = ops.length;
    if (deferred) {
    const ordered = slice
      .map((op, i) => ({ op, i, z: Number.isFinite(map[op.id]?.z as number) ? (map[op.id]!.z as number) : 0 }))
      .sort((a, b) => (a.z === b.z ? a.i - b.i : a.z - b.z));
    real.save();
    for (const entry of ordered) drawOp(entry.op);
    real.restore();
    }

    for (const op of slice) {
      const t = map[op.id] || {};
      const scale = Number.isFinite(t.scale as number) && (t.scale as number) > 0 ? (t.scale as number) : 1;
      const cx = op.box.x + op.box.w / 2;
      const cy = op.box.y + op.box.h / 2;
      const w = op.box.w * scale;
      const h = op.box.h * scale;
      elements.push({
        id: op.id,
        label: op.label,
        kind: op.kind,
        text: op.text,
        x: cx - w / 2 + (t.dx || 0),
        y: cy - h / 2 + (t.dy || 0),
        w,
        h,
      });
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
          return (target as any).getImageData.apply(target, a);
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
          (target as any)[prop].apply(target, a);
        };
      }
      if (prop === "clip") {
        return (...a: any[]) => {
          clipStack = clipStack.concat([
            { cmds: pendingPath.slice(), matrix: target.getTransform(), rule: a[0] as CanvasFillRule },
          ]);
          (target as any).clip.apply(target, a);
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
              if (prop === "stroke") target.stroke(a[0]);
              else if (a.length > 1) target.fill(a[0], a[1]);
              else target.fill(a[0]);
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
