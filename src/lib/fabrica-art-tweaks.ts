/**
 * ============================================================
 * CAMADA DE AJUSTES FINOS DAS ARTES (ADMIN)
 * ============================================================
 *
 * O motor de composição (`fabrica-compose-art.ts`) desenha tudo com
 * coordenadas calculadas em runtime e não "conhece" seus elementos.
 *
 * Esta camada adiciona duas capacidades SEM reescrever o motor:
 *
 *  1. REGISTRO  — cada bloco desenhado se anuncia (`record`), devolvendo
 *                 a caixa (x, y, w, h) que o editor usa para desenhar as
 *                 alças de arrastar/redimensionar.
 *  2. AJUSTE    — antes de desenhar, o bloco consulta `get(id)` e aplica
 *                 o deslocamento (dx, dy) e a escala salvos.
 *
 * Os ajustes são um simples mapa `{ elementId: { dx, dy, scale } }`.
 * Podem viver em duas camadas:
 *   • preset global da variação (tabela fabrica_art_tweak_presets)
 *   • ajuste pontual de uma arte específica (guardado junto da arte)
 */

export interface ArtElementTweak {
  dx?: number;
  dy?: number;
  scale?: number;
  /** Rotação em graus. */
  rotate?: number;
  /** Esconde o elemento. */
  hidden?: boolean;
  /** Ordem de empilhamento (maior = mais à frente). */
  z?: number;
  /** Substitui o texto (use \n para quebrar linha). */
  text?: string;
  /** Altura da linha quando o texto tem quebras. */
  lineHeight?: number;
}

export type ArtTweakMap = Record<string, ArtElementTweak>;

export interface ArtElementBox {
  id: string;
  label: string;
  /** Caixa JÁ com o ajuste aplicado, em pixels do canvas. */
  x: number;
  y: number;
  w: number;
  h: number;
  /** Tipo da primitiva desenhada. */
  kind?: "text" | "image" | "shape";
  /** Texto original (quando kind === "text"). */
  text?: string;
  /** Se false, o editor esconde as alças de escala (só move). */
  resizable?: boolean;
}


export interface ArtTweakContext {
  /** Ajuste resolvido do elemento (sempre com defaults preenchidos). */
  get(id: string): { dx: number; dy: number; scale: number };
  /** Aplica dx/dy a um ponto. */
  pt(id: string, x: number, y: number): { x: number; y: number };
  /** Escala de um elemento (1 = original). */
  s(id: string): number;
  /** Registra a caixa do elemento para o editor. */
  record(box: ArtElementBox): void;
  /** Caixas registradas nesta composição. */
  readonly elements: ArtElementBox[];
}

const NEUTRAL = { dx: 0, dy: 0, scale: 1 };

export function createArtTweakContext(tweaks?: ArtTweakMap): ArtTweakContext {
  const map = tweaks || {};
  const elements: ArtElementBox[] = [];

  return {
    elements,
    get(id: string) {
      const t = map[id];
      if (!t) return NEUTRAL;
      return {
        dx: Number.isFinite(t.dx as number) ? (t.dx as number) : 0,
        dy: Number.isFinite(t.dy as number) ? (t.dy as number) : 0,
        scale: Number.isFinite(t.scale as number) && (t.scale as number) > 0 ? (t.scale as number) : 1,
      };
    },
    pt(id: string, x: number, y: number) {
      const t = this.get(id);
      return { x: x + t.dx, y: y + t.dy };
    },
    s(id: string) {
      return this.get(id).scale;
    },
    record(box: ArtElementBox) {
      const existing = elements.findIndex((e) => e.id === box.id);
      if (existing >= 0) elements[existing] = box;
      else elements.push(box);
    },
  };
}

/** Chave canônica de um preset global. */
export function artTweakPresetKey(category: string, variant: number, format: string): string {
  return `${category}::${variant}::${format}`;
}

/** Junta preset global + ajuste pontual (o pontual vence). */
export function mergeArtTweaks(base?: ArtTweakMap, override?: ArtTweakMap): ArtTweakMap {
  if (!base && !override) return {};
  if (!override) return { ...(base || {}) };
  if (!base) return { ...override };
  const out: ArtTweakMap = { ...base };
  for (const [id, t] of Object.entries(override)) {
    out[id] = { ...(base[id] || {}), ...t };
  }
  return out;
}

export function isEmptyTweakMap(map?: ArtTweakMap): boolean {
  if (!map) return true;
  return Object.values(map).every(
    (t) => (!t.dx || t.dx === 0) && (!t.dy || t.dy === 0) && (!t.scale || t.scale === 1),
  );
}

/** Rótulo humano para o selo de variação exibido no card (admin). */
export function artVariantLabel(category: string, variant: number, format: string): string {
  const cat = category === "experiencia_destino" ? "Experiência" : "Oferta";
  const fmt = format === "story" ? "9:16" : "1:1";
  return `V${variant} · ${cat} · ${fmt}`;
}
