// Faixa de voz do vídeo, editável como num editor de vídeo: a voz vira pedaços (clipes) que dá para
// arrastar, dividir, cortar nas bordas, acelerar/desacelerar e mudar o volume.
// Tudo no próprio aparelho. A voz montada (WAV) começa no segundo INICIO_VOZ do vídeo.
import { INICIO_VOZ, wavDe, type VozGravada } from "@/lib/voz-gravada";

/** Um pedaço da voz: começa em `ini` (segundo do vídeo) e toca o trecho `de`→`ate` do áudio original. */
export type ClipeVoz = { id: string; ini: number; de: number; ate: number; vel: number; vol: number };
export type VozMontada = { url: string; wav: ArrayBuffer; trechos: [number, number][] };

export const VEL_MIN = 0.75, VEL_MAX = 1.5, VOL_MAX = 1.5, MIN_CLIPE = 0.3;
let seq = 0;
const novoId = () => `v${Date.now().toString(36)}${(seq++).toString(36)}`;

export const durClipe = (c: ClipeVoz) => Math.max(0, (c.ate - c.de) / c.vel);
export const fimClipe = (c: ClipeVoz) => c.ini + durClipe(c);
export const clipeInicial = (v: VozGravada): ClipeVoz => ({ id: novoId(), ini: INICIO_VOZ, de: 0, ate: v.dur, vel: 1, vol: 1 });

/** Divide o pedaço no segundo `t` do vídeo (os dois lados precisam ter pelo menos 0,3 s). */
export function dividirClipe(lista: ClipeVoz[], id: string, t: number): ClipeVoz[] {
  const c = lista.find((x) => x.id === id);
  if (!c) return lista;
  const rel = t - c.ini;
  if (rel < MIN_CLIPE || durClipe(c) - rel < MIN_CLIPE) return lista;
  const corte = c.de + rel * c.vel;
  return lista.flatMap((x) => (x.id !== id ? [x] : [{ ...c, ate: corte }, { ...c, id: novoId(), ini: t, de: corte }]));
}

/** Trechos do vídeo em que a voz fala (para abaixar a música). */
export const trechosDe = (clipes: ClipeVoz[]): [number, number][] =>
  clipes.map((c) => [c.ini, fimClipe(c)] as [number, number]).sort((a, b) => a[0] - b[0]);

// ——— áudio original decodificado (uma vez por voz) ———
type Amostras = { dados: Float32Array; taxa: number };
const cache = new WeakMap<VozGravada, Promise<Amostras>>();
export function amostrasDe(v: VozGravada): Promise<Amostras> {
  let p = cache.get(v);
  if (!p) {
    p = (async () => {
      const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ac = new Ctx();
      try {
        const b = await ac.decodeAudioData(v.audio.slice(0));
        return { dados: b.getChannelData(0).slice(), taxa: b.sampleRate };
      } finally { ac.close().catch(() => undefined); }
    })();
    cache.set(v, p);
  }
  return p;
}

/** Picos do som (0 a 1) em `n` colunas, para desenhar as ondas. */
export async function ondasDe(v: VozGravada, n = 800): Promise<Float32Array> {
  const { dados } = await amostrasDe(v);
  const out = new Float32Array(n);
  const passo = dados.length / n;
  let max = 0;
  for (let i = 0; i < n; i++) {
    let p = 0;
    const a = Math.floor(i * passo), z = Math.min(dados.length, Math.floor((i + 1) * passo));
    for (let k = a; k < z; k += 4) p = Math.max(p, Math.abs(dados[k]));
    out[i] = p; max = Math.max(max, p);
  }
  if (max > 0) for (let i = 0; i < n; i++) out[i] /= max;
  return out;
}

/** Muda a velocidade sem mudar o tom da voz (WSOLA: junta pedacinhos parecidos com janelas suaves). */
function esticar(d: Float32Array, taxa: number, vel: number): Float32Array {
  if (Math.abs(vel - 1) < 0.01 || d.length < taxa * 0.1) return d.slice();
  const N = Math.round(taxa * 0.032), Hs = Math.floor(N / 2), Ha = Hs * vel, tol = Math.round(taxa * 0.008);
  const janela = new Float32Array(N);
  for (let i = 0; i < N; i++) janela[i] = 0.5 - 0.5 * Math.cos((2 * Math.PI * i) / (N - 1));
  const tam = Math.ceil(d.length / vel) + N;
  const out = new Float32Array(tam), peso = new Float32Array(tam);
  let ant = 0;
  for (let k = 0; ; k++) {
    const pos = k * Hs, ideal = Math.round(k * Ha);
    if (ideal + N >= d.length || pos + N >= tam) break;
    let melhor = ideal;
    if (k > 0) {
      // procura perto do ideal o pedaço que mais se parece com a continuação natural do anterior
      const nat = ant + Hs;
      let topo = -Infinity;
      for (let c = Math.max(0, ideal - tol); c <= Math.min(d.length - N - 1, ideal + tol); c += 2) {
        let s = 0;
        for (let i = 0; i < N; i += 4) s += d[c + i] * (d[nat + i] || 0);
        if (s > topo) { topo = s; melhor = c; }
      }
    }
    for (let i = 0; i < N; i++) { out[pos + i] += d[melhor + i] * janela[i]; peso[pos + i] += janela[i]; }
    ant = melhor;
  }
  let fim = 0;
  for (let i = 0; i < tam; i++) { if (peso[i] > 1e-3) { out[i] /= peso[i]; fim = i; } }
  return out.subarray(0, fim + 1);
}

/** Monta a voz do vídeo com os pedaços (WAV que começa em INICIO_VOZ e vai até o fim do vídeo). */
export async function montarVoz(v: VozGravada, clipes: ClipeVoz[], total: number): Promise<VozMontada> {
  const { dados, taxa } = await amostrasDe(v);
  const out = new Float32Array(Math.max(1, Math.ceil((total - INICIO_VOZ) * taxa)));
  const borda = Math.round(taxa * 0.012);
  for (const c of clipes) {
    const seg = dados.subarray(Math.max(0, Math.round(c.de * taxa)), Math.min(dados.length, Math.round(c.ate * taxa)));
    const e = esticar(seg, taxa, c.vel);
    const ini = Math.round((c.ini - INICIO_VOZ) * taxa);
    for (let i = 0; i < e.length; i++) {
      const j = ini + i;
      if (j < 0) continue;
      if (j >= out.length) break;
      // entrada e saída suaves (corte sem estalo)
      const f = Math.min(1, i / borda, (e.length - 1 - i) / borda);
      out[j] += e[i] * c.vol * f;
    }
  }
  for (let i = 0; i < out.length; i++) out[i] = Math.max(-1, Math.min(1, out[i]));
  const wav = wavDe(out, taxa);
  return { wav, url: URL.createObjectURL(new Blob([wav], { type: "audio/wav" })), trechos: trechosDe(clipes) };
}
