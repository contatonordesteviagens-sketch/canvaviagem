/**
 * GenerationGuard — Engine global anti-repetição da Fábrica de Anúncios.
 *
 * Registra o "DNA" das últimas N gerações (layout + headline + paleta) por
 * (categoria × modo × formato) e devolve listas de itens PROIBIDOS para a
 * próxima geração. Garante que duas gerações consecutivas sejam visualmente
 * e textualmente diferentes — sem depender da boa vontade do modelo de IA.
 *
 * Funciona em TODOS os modos: foto (Pexels), IA pura, custom (upload/link).
 */

export type GuardCategory = string;          // ex: "oferta_pacote" | "experiencia_destino"
export type GuardMode = "photo" | "ai" | "custom";
export type GuardFormat = "square" | "story";

export interface GenerationDNA {
  /** Identificador do layout escolhido (strategy local OU templateId IA) */
  layoutId: string;
  /** Frase principal renderizada (headline) */
  headline: string;
  /** Cor primária usada (hex) */
  primary: string;
  /** Cor secundária usada (hex) */
  secondary: string;
  /** Hash determinístico do conjunto (preenchido pelo helper) */
  hash?: string;
  /** Timestamp em ms */
  ts?: number;
}

const HISTORY_SIZE = 4; // últimas 4 gerações ficam BLOQUEADAS

const keyFor = (cat: GuardCategory, mode: GuardMode, fmt: GuardFormat) =>
  `fabrica_guard_${cat}_${mode}_${fmt}_v1`;

function safeRead(key: string): GenerationDNA[] {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

function hashDNA(dna: Omit<GenerationDNA, "hash" | "ts">): string {
  const s = `${dna.layoutId}|${dna.headline.toLowerCase().trim()}|${dna.primary.toLowerCase()}|${dna.secondary.toLowerCase()}`;
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h << 5) - h + s.charCodeAt(i);
    h |= 0;
  }
  return `h${Math.abs(h).toString(36)}`;
}

/**
 * Lê o histórico recente e devolve listas de itens proibidos.
 * Use ANTES de escolher layout/headline/paleta da nova geração.
 */
export function getForbiddenSets(
  cat: GuardCategory,
  mode: GuardMode,
  fmt: GuardFormat,
): {
  layouts: string[];
  headlines: string[];
  palettes: string[]; // "primaryHex|secondaryHex"
  hashes: string[];
  history: GenerationDNA[];
} {
  const history = safeRead(keyFor(cat, mode, fmt)).slice(0, HISTORY_SIZE);
  const layouts = Array.from(new Set(history.map((h) => h.layoutId)));
  const headlines = Array.from(new Set(history.map((h) => h.headline.toLowerCase().trim())));
  const palettes = Array.from(
    new Set(history.map((h) => `${h.primary.toLowerCase()}|${h.secondary.toLowerCase()}`)),
  );
  const hashes = Array.from(new Set(history.map((h) => h.hash || hashDNA(h))));
  return { layouts, headlines, palettes, hashes, history };
}

/**
 * Registra a geração que acabou de sair para que a próxima a evite.
 */
export function registerGeneration(
  cat: GuardCategory,
  mode: GuardMode,
  fmt: GuardFormat,
  dna: GenerationDNA,
): void {
  const key = keyFor(cat, mode, fmt);
  const entry: GenerationDNA = {
    ...dna,
    hash: hashDNA(dna),
    ts: Date.now(),
  };
  const next = [entry, ...safeRead(key).filter((h) => h.hash !== entry.hash)].slice(0, HISTORY_SIZE);
  try {
    localStorage.setItem(key, JSON.stringify(next));
  } catch {
    /* ignore quota */
  }
}

/**
 * Helper genérico: escolhe um item de uma pool que NÃO esteja na lista de
 * proibidos. Se TODOS estiverem proibidos (pool pequena), libera o mais antigo.
 */
export function pickAvoiding<T>(
  pool: T[],
  forbidden: string[],
  toKey: (item: T) => string,
  seed: number,
): T {
  if (pool.length === 0) throw new Error("pool vazia");
  const allowed = pool.filter((p) => !forbidden.includes(toKey(p).toLowerCase().trim()));
  const final = allowed.length > 0 ? allowed : pool;
  const idx = ((seed % final.length) + final.length) % final.length;
  return final[idx];
}

/**
 * Combina uma seed numérica com uma string aleatória para criar um seed
 * verdadeiramente único por geração (evita colisões quando o usuário
 * clica rápido).
 */
export function freshSeed(base: number): number {
  const rand = Math.floor(Math.random() * 1e6);
  return Math.abs((base * 31 + rand + Date.now()) | 0);
}
