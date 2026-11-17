// Vídeo feito no editor de artes: junta as cenas (páginas) num MP4 com música, e toca a prévia na tela.
// Cada cena = vídeo de fundo (no lugar da foto) + a arte por cima (com o buraco) + os itens animados.
import { ArrayBufferTarget, Muxer } from "mp4-muxer";
import { comporArte, type AnimItem, type Arte, type CamadaArte, type Marca } from "./arte-nova";
import { carregarImagem, juntarArte, type Extra } from "./arte-extras";
import { novoGif, paletaDe } from "@/lib/gif-simples";
import type { AjusteCena } from "./video-cena";
import type { ArtElementBox, ArtTweakMap } from "@/lib/fabrica-art-tweaks";
import { QuadrosDeVideo } from "@/lib/mp4-quadros";
import { MUSICAS, prepararMusica, prepararTrilha, type FaixaAac, type VozNaFaixa } from "@/lib/musica-video";
import { ENTRADA_VOZ } from "@/lib/narracao";

export type EstadoCena = { a: Arte; t: ArtTweakMap; x: Extra[] };
type Caixa = { x: number; y: number; w: number; h: number };
type ItemAnimado = { img: CanvasImageSource; caixa: Caixa; inteiro: boolean; rot?: number; anim: AnimItem };
/** Fala da narração na cena: pedaços da legenda (segundos dentro da cena) e o áudio para a prévia. */
export type FalaPronta = { pedacos: { t: string; a: number; b: number }[]; audio?: string; legenda: boolean };
export type CenaPronta = { dur: number; aj: AjusteCena; base: CanvasImageSource; itens: ItemAnimado[]; caixa: Caixa | null; video?: string; altura: number; fala?: FalaPronta; textos?: { y: number; h: number }[] };

const LARG = 1080;
const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
const ease = (t: number) => 1 - Math.pow(1 - clamp01(t), 3);
const camadasDe = (lista: Extra[]): CamadaArte[] => lista.filter((e) => e.z != null).map((e) => ({ z: e.z as number, src: e.src, x: e.x, y: e.y, w: e.w, h: e.w * e.r, rot: e.rot }));
/** Tempo que a troca de cena leva. */
export const TROCA = 0.5;
export const durCena = (a: Arte) => Math.max(1, a.cena?.dur ?? 3);
/** Em que segundo do clipe a cena está. */
const noClipe = (aj: AjusteCena, local: number) => (aj.inicio || 0) + Math.max(0, local) * (aj.velocidade || 1);

/** A maior imagem da arte é a foto (no vídeo, o lugar do clipe). */
export const caixaDaFoto = (els: ArtElementBox[]): Caixa | null => {
  const f = els.filter((b) => b.kind === "image").sort((p, q) => q.w * q.h - p.w * p.h)[0];
  return f ? { x: f.x, y: f.y, w: f.w, h: f.h } : null;
};

/** Prepara uma cena: a arte parada (com os itens sem animação) e cada item animado separado. */
/** `escala`: 1 = arte em 1080 de largura; 2 = 4K. Mais escala deixa letras e logos nítidos no vídeo grande. */
export async function prepararCena(est: EstadoCena, marca: Marca, escala = 1): Promise<CenaPronta> {
  const { a, t, x } = est;
  const altura = a.formato === "story" ? 1920 : 1080;
  const anim: Record<string, AnimItem> = { ...(a.cena?.animEl || {}) };
  const todos = a.cena?.animTodos;
  const animado = (id: string) => !!anim[id] && anim[id].anim !== "nenhuma";
  let els: ArtElementBox[] = [];
  await comporArte(a, marca, t, (e) => { els = e.slice(); }, { camadas: camadasDe(x) });
  // "todos os itens": cada um que não tem a animação dele entra um pouco depois do anterior
  if (todos) [...els.filter((b) => b.kind !== "image" || b.id !== (a.video ? els.filter((q) => q.kind === "image").sort((p, q) => q.w * q.h - p.w * p.h)[0]?.id : "")).map((b) => b.id), ...x.filter((e) => e.z == null).map((e) => e.id)]
    .filter((id) => !anim[id]).forEach((id, i) => { anim[id] = { ...todos, atraso: (todos.atraso || 0) + i * 0.15 }; });
  const caixa = a.video ? caixaDaFoto(els) || { x: 0, y: 0, w: LARG, h: altura } : null;
  const fotoId = els.filter((b) => b.kind === "image").sort((p, q) => q.w * q.h - p.w * p.h)[0]?.id;
  const baseAnimados = a.cena?.livre ? [] : els.filter((b) => b.id !== fotoId && animado(b.id));
  const tBase: ArtTweakMap = { ...t };
  baseAnimados.forEach((b) => { tBase[b.id] = { ...(tBase[b.id] || {}), hidden: true }; });
  const baseUrl = await comporArte(a, marca, tBase, undefined, { camadas: camadasDe(x), escala });
  const topo = x.filter((e) => e.z == null);
  const juntos = await juntarArte(baseUrl, topo.filter((e) => !animado(e.id)), LARG, altura, escala);
  const itens: ItemAnimado[] = [];
  for (const e of topo.filter((q) => animado(q.id))) {
    try { itens.push({ img: await carregarImagem(e.src), caixa: { x: e.x - e.w / 2, y: e.y - (e.w * e.r) / 2, w: e.w, h: e.w * e.r }, inteiro: false, rot: e.rot, anim: anim[e.id] }); } catch { /* item com problema */ }
  }
  for (const b of baseAnimados) {
    // só este elemento: os outros escondidos
    const so: ArtTweakMap = Object.fromEntries(els.map((q) => [q.id, { ...(t[q.id] || {}), hidden: q.id !== b.id }]));
    const u = await comporArte({ ...a, video: a.video }, marca, so, undefined, { escala });
    itens.push({ img: await carregarImagem(u), caixa: { x: b.x, y: b.y, w: b.w, h: b.h }, inteiro: true, anim: anim[b.id] });
  }
  // onde há texto na cena (a legenda da narração procura um lugar livre)
  const textos = [...els.filter((b) => b.kind === "text" && (b.text || "").trim()).map((b) => ({ y: b.y, h: b.h })), ...topo.filter((e) => e.texto).map((e) => ({ y: e.y - (e.w * e.r) / 2, h: e.w * e.r }))];
  return { dur: durCena(a), aj: a.cena || {}, base: await carregarImagem(juntos), itens, caixa, video: a.video, altura, textos };
}

const DUR_ANIM = { lenta: 1, normal: 0.6, rapida: 0.32 } as const;
/** Desenha um item com a animação dele (entrada no começo da cena, saída no fim). */
function desenharItem(ctx: CanvasRenderingContext2D, it: ItemAnimado, lt: number, dur: number, altura: number) {
  const { anim, modo = "ambos", vel = "normal", atraso = 0 } = it.anim;
  const t = lt - atraso;
  if (t < 0) return;
  const d = DUR_ANIM[vel] || 0.6;
  const ent = modo === "saindo" ? 1 : ease(t / d);
  const sai = modo === "entrando" ? 1 : clamp01((dur - lt) / Math.min(0.4, d));
  const { x, y, w, h } = it.caixa;
  const cx = x + w / 2, cy = y + h / 2;
  ctx.save();
  ctx.globalAlpha *= anim === "teclado" ? sai : Math.min(ent, sai);
  if (anim === "subir") ctx.translate(0, (1 - ent) * 110 - (1 - sai) * 110);
  else if (anim === "descer") ctx.translate(0, -(1 - ent) * 110 + (1 - sai) * 110);
  else if (anim === "deslocar") ctx.translate(-(1 - ent) * LARG * 0.5 + (1 - sai) * LARG * 0.5, 0);
  else if (anim === "zoom" || anim === "pulsar") {
    const s = anim === "zoom" ? 0.55 + 0.45 * ent + (1 - sai) * 0.2 : 1 + 0.04 * Math.sin(t * 5);
    ctx.translate(cx, cy); ctx.scale(s, s); ctx.translate(-cx, -cy);
  } else if (anim === "teclado") {
    ctx.beginPath(); ctx.rect(x, y - 20, w * ent, h + 40); ctx.clip();
  }
  if (it.inteiro) ctx.drawImage(it.img, 0, 0, LARG, altura);
  else {
    ctx.translate(cx, cy);
    if (it.rot) ctx.rotate((it.rot * Math.PI) / 180);
    ctx.drawImage(it.img, -w / 2, -h / 2, w, h);
  }
  ctx.restore();
}

type Fonte = { img: CanvasImageSource; w: number; h: number } | null;
/** Uma cena no instante `lt` (segundos desde o começo dela). `fonte` é o quadro do vídeo de fundo. */
function desenharCena(ctx: CanvasRenderingContext2D, c: CenaPronta, lt: number, fonte: Fonte) {
  if (c.caixa && fonte && fonte.w && fonte.h) {
    const { x, y, w, h } = c.caixa;
    const z = c.aj.zoom || 1;
    const k = Math.max(w / fonte.w, h / fonte.h) * z;
    const dw = fonte.w * k, dh = fonte.h * k;
    ctx.save();
    ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip();
    ctx.drawImage(fonte.img, x + (w - dw) / 2 - (c.aj.px || 0) * (dw - w) / 2, y + (h - dh) / 2 - (c.aj.py || 0) * (dh - h) / 2, dw, dh);
    ctx.restore();
  }
  ctx.drawImage(c.base, 0, 0, LARG, c.altura);
  for (const it of c.itens) desenharItem(ctx, it, lt, c.dur, c.altura);
}

/** Linha do tempo: onde começa cada cena e o total. */
export const linhaDas = (cenas: { dur: number }[]) => {
  const ini: number[] = [];
  let s = 0;
  for (const c of cenas) { ini.push(s); s += c.dur; }
  return { ini, total: s };
};
/** Quais cenas aparecem no instante t, com o tempo de cada uma e como desenhar a troca. */
function quadroEm(cenas: CenaPronta[], ini: number[], t: number) {
  let i = ini.length - 1;
  while (i > 0 && t < ini[i]) i--;
  const local = t - ini[i];
  const tr = cenas[i].aj.transicao || "fundir";
  const F = Math.min(TROCA, cenas[i].dur / 3);
  if (i > 0 && local < F && tr !== "corte") return { i, local, ant: { j: i - 1, lt: cenas[i - 1].dur + local }, tr, e: local / F };
  return { i, local, ant: null, tr, e: 1 };
}
/** Desenha o vídeo inteiro no instante t (canvas no tamanho de saída). `fonteDe(j, seg)` dá o quadro do clipe da cena j. */
export function desenharVideo(ctx: CanvasRenderingContext2D, cenas: CenaPronta[], ini: number[], t: number, fonteDe: (j: number, seg: number) => Fonte) {
  const W = ctx.canvas.width, H = ctx.canvas.height;
  const k = W / LARG;
  const q = quadroEm(cenas, ini, t);
  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.fillStyle = "#000"; ctx.fillRect(0, 0, W, H);
  ctx.scale(k, k);
  const cenaJ = (j: number, lt: number) => desenharCena(ctx, cenas[j], lt, fonteDe(j, noClipe(cenas[j].aj, lt)));
  if (!q.ant) cenaJ(q.i, q.local);
  else if (q.tr === "escuro") {
    const hAlt = H / k;
    if (q.e < 0.5) { cenaJ(q.ant.j, q.ant.lt); ctx.fillStyle = `rgba(0,0,0,${q.e * 2})`; }
    else { cenaJ(q.i, q.local); ctx.fillStyle = `rgba(0,0,0,${(1 - q.e) * 2})`; }
    ctx.fillRect(0, 0, LARG, hAlt);
  } else {
    cenaJ(q.ant.j, q.ant.lt);
    const e = ease(q.e);
    ctx.save();
    if (q.tr === "deslizar") ctx.translate((1 - e) * LARG, 0);
    else if (q.tr === "zoom") {
      ctx.globalAlpha = e;
      const s = 1 + (1 - e) * 0.35, cx = LARG / 2, cy = H / k / 2;
      ctx.translate(cx, cy); ctx.scale(s, s); ctx.translate(-cx, -cy);
    } else ctx.globalAlpha = e;
    cenaJ(q.i, q.local);
    ctx.restore();
  }
  const fala = cenas[q.i].fala;
  if (fala?.legenda) desenharLegenda(ctx, fala.pedacos.find((p) => q.local >= p.a && q.local < p.b)?.t, cenas[q.i].altura, cenas[q.i].textos);
  ctx.restore();
  return q;
}

/** Legenda da narração: frase curta, branca e grossa, numa faixa escura embaixo (como nos Reels). */
function desenharLegenda(ctx: CanvasRenderingContext2D, texto: string | undefined, altura: number, textos: { y: number; h: number }[] = []) {
  if (!texto) return;
  ctx.save();
  const tam = 58;
  ctx.font = `800 ${tam}px Montserrat, Arial, sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  // uma linha se couber em 900 px; senão duas linhas do mesmo tamanho (nada de palavra sozinha embaixo)
  const palavras = texto.split(" ");
  let linhas = [texto];
  if (ctx.measureText(texto).width > 900 && palavras.length > 1) {
    let melhor = 1, menor = Infinity;
    for (let k = 1; k < palavras.length; k++) {
      const m = Math.max(ctx.measureText(palavras.slice(0, k).join(" ")).width, ctx.measureText(palavras.slice(k).join(" ")).width);
      if (m < menor) { menor = m; melhor = k; }
    }
    linhas = [palavras.slice(0, melhor).join(" "), palavras.slice(melhor).join(" ")];
  }
  const alto = linhas.length * tam * 1.2 + 34;
  const larg = Math.min(1000, Math.max(...linhas.map((x) => ctx.measureText(x).width)) + 60);
  // lugar livre: embaixo (fora da faixa dos botões do Reels) e, se tiver texto da cena ali, um pouco acima ou no alto
  const livre = (c: number) => textos.every((b) => b.y + b.h < c - alto / 2 - 10 || b.y > c + alto / 2 + 10);
  const centro = [0.79, 0.73, 0.67, 0.6, 0.2, 0.27].map((f) => altura * f).find(livre) ?? altura * 0.79;
  const y = centro - alto / 2;
  ctx.fillStyle = "rgba(0,0,0,.62)";
  ctx.beginPath();
  ctx.roundRect(LARG / 2 - larg / 2, y, larg, alto, 22);
  ctx.fill();
  ctx.fillStyle = "#FFFFFF";
  linhas.forEach((x, i) => ctx.fillText(x, LARG / 2, y + 17 + tam * 0.6 + i * tam * 1.2));
  ctx.restore();
}

// ——————————————— prévia na tela (tempo real) ———————————————
/** Toca o vídeo num canvas. Devolve uma função para parar. `aoTempo` recebe o segundo atual. */
export function tocarPrevia(canvas: HTMLCanvasElement, cenas: CenaPronta[], musica: string | undefined, aoTempo: (t: number, total: number) => void, aoFim: () => void): () => void {
  const { ini, total } = linhaDas(cenas);
  const ctx = canvas.getContext("2d")!;
  const vids = cenas.map((c) => {
    if (!c.video) return null;
    const v = document.createElement("video");
    v.muted = true; v.playsInline = true; v.preload = "auto"; v.crossOrigin = "anonymous"; v.loop = true;
    v.src = c.video;
    return v;
  });
  const audio = musica ? new Audio(musica) : null;
  const comVoz = cenas.some((c) => c.fala?.audio);
  if (audio) { audio.volume = comVoz ? 0.3 : 0.7; void audio.play().catch(() => undefined); }
  const falas = cenas.map((c) => (c.fala?.audio ? new Audio(c.fala.audio) : null));
  const falou = new Set<number>();
  const ativos = new Set<number>();
  let t0 = performance.now();
  let raf = 0;
  let parado = false;
  const passo = () => {
    if (parado) return;
    const t = (performance.now() - t0) / 1000;
    if (t >= total) { parar(); aoFim(); return; }
    const q = quadroEm(cenas, ini, t);
    const agora = new Set([q.i, ...(q.ant ? [q.ant.j] : [])]);
    agora.forEach((j) => {
      const v = vids[j];
      if (!v || ativos.has(j)) return;
      ativos.add(j);
      v.playbackRate = cenas[j].aj.velocidade || 1;
      try { v.currentTime = noClipe(cenas[j].aj, j === q.i ? q.local : cenas[j].dur); } catch { /* ainda carregando */ }
      void v.play().catch(() => undefined);
    });
    ativos.forEach((j) => { if (!agora.has(j)) { ativos.delete(j); vids[j]?.pause(); } });
    const fa = falas[q.i];
    if (fa && !falou.has(q.i) && q.local >= ENTRADA_VOZ) { falou.add(q.i); void fa.play().catch(() => undefined); }
    desenharVideo(ctx, cenas, ini, t, (j) => {
      const v = vids[j];
      return v && v.readyState >= 2 ? { img: v, w: v.videoWidth, h: v.videoHeight } : null;
    });
    aoTempo(t, total);
    raf = requestAnimationFrame(passo);
  };
  // espera o primeiro vídeo ficar pronto (até 3 s) para não começar no preto
  const primeiro = vids[0];
  const comecar = () => { t0 = performance.now(); raf = requestAnimationFrame(passo); };
  if (primeiro && primeiro.readyState < 2) {
    const tm = setTimeout(comecar, 3000);
    primeiro.addEventListener("loadeddata", () => { clearTimeout(tm); if (!parado) comecar(); }, { once: true });
  } else comecar();
  const parar = () => {
    parado = true;
    cancelAnimationFrame(raf);
    vids.forEach((v) => { if (v) { v.pause(); v.removeAttribute("src"); v.load(); } });
    audio?.pause();
    falas.forEach((f) => f?.pause());
  };
  return parar;
}

// ——————————————— MP4 com música ———————————————
export const podeFazerVideo = () => typeof window !== "undefined" && "VideoEncoder" in window && "VideoFrame" in window;
/** Música do vídeo: uma da casa (pelo id) ou a que a pessoa enviou (o próprio endereço do arquivo). */
export const ehMusicaPropria = (id?: string) => !!id && (id.startsWith("blob:") || id.startsWith("http"));
export const musicaDoVideo = (id?: string) =>
  id === "" ? undefined
  : ehMusicaPropria(id) ? { id: id!, nome: "Sua música", clima: "Enviada por você", arquivo: id!, autor: "", fonte: "" }
  : MUSICAS.find((m) => m.id === id) || MUSICAS[0];

/** Leitor do clipe de uma cena: quadro a quadro pelo arquivo; se não der, pelo <video> pulando para o segundo. */
type Leitor = { quadro: (seg: number) => Promise<Fonte>; fechar: () => void };
// leitor reserva: o próprio <video> do navegador, buscando cada quadro (mais lento, mas não trava)
async function leitorPorVideo(url: string): Promise<Leitor> {
  const v = document.createElement("video");
  v.muted = true; v.playsInline = true; v.preload = "auto"; v.crossOrigin = "anonymous"; v.src = url;
  await new Promise<void>((ok) => { v.addEventListener("loadeddata", () => ok(), { once: true }); v.addEventListener("error", () => ok(), { once: true }); setTimeout(ok, 6000); });
  return {
    quadro: async (s) => {
      const alvo = v.duration ? s % Math.max(0.1, v.duration - 0.05) : s;
      if (Math.abs(v.currentTime - alvo) > 0.02) {
        await new Promise<void>((ok) => { v.addEventListener("seeked", () => ok(), { once: true }); v.currentTime = alvo; setTimeout(ok, 1500); });
      }
      return v.videoWidth ? { img: v, w: v.videoWidth, h: v.videoHeight } : null;
    },
    fechar: () => { v.removeAttribute("src"); v.load(); },
  };
}

const ESPERA_QUADRO = 4000;
async function abrirLeitor(url: string): Promise<Leitor> {
  let q: QuadrosDeVideo;
  try { q = await QuadrosDeVideo.abrir(url); } catch { return leitorPorVideo(url); }
  // se o decodificador do aparelho travar num quadro, troca para o leitor reserva e segue
  let reserva: Leitor | null = null;
  return {
    quadro: async (s) => {
      if (reserva) return reserva.quadro(s);
      const pronto = await Promise.race([q.quadro(s).then(() => true), new Promise<false>((ok) => setTimeout(() => ok(false), ESPERA_QUADRO))]).catch(() => false);
      if (pronto) return { img: q.canvas, w: q.canvas.width, h: q.canvas.height };
      try { q.fechar(); } catch { /* já fechado */ }
      reserva = await leitorPorVideo(url);
      return reserva.quadro(s);
    },
    fechar: () => { if (reserva) reserva.fechar(); else q.fechar(); },
  };
}

export async function fazerVideoMp4(cenas: CenaPronta[], musica: string | undefined, largura: number, aoAvancar?: (p: number) => void, aoAviso?: (m: string) => void, vozes: VozNaFaixa[] = []): Promise<Blob> {
  if (!podeFazerVideo()) throw new Error("Este navegador não faz vídeo MP4.");
  const altura = cenas[0]?.altura || 1920;
  const W = Math.round(largura / 2) * 2, H = Math.round((largura * altura) / LARG / 2) * 2;
  const FPS = 30;
  const { ini, total } = linhaDas(cenas);
  // taxa de bits pelo tamanho: HD 2,5, Full HD 5, 2K 9, 4K 20 Mbps (vídeo longo um pouco menos)
  const taxa = Math.max(2_500_000, Math.round(W * H * 2.4 * (total > 24 ? 0.85 : 1)));
  let codec = "";
  const niveis = W * H > 2_100_000 ? ["avc1.640033", "avc1.640034", "avc1.4d0033"] : W * H > 1_000_000 ? ["avc1.640028", "avc1.640032", "avc1.4d0028", "avc1.640033"] : ["avc1.640028", "avc1.4d0028", "avc1.42002a", "avc1.640033"];
  for (const c of niveis) {
    try { if ((await VideoEncoder.isConfigSupported({ codec: c, width: W, height: H, bitrate: taxa, framerate: FPS })).supported) { codec = c; break; } } catch { /* próximo */ }
  }
  if (!codec) throw new Error("Este navegador não faz vídeo MP4 neste tamanho.");
  let faixa: FaixaAac | null = null;
  if (vozes.length) {
    // narração: a voz e a música viram uma faixa só (a música abaixa enquanto a voz fala)
    try {
      faixa = await prepararTrilha(musica || null, total, vozes);
    } catch (e) {
      // iPhone sem codificador de áudio: melhor sair o vídeo com a música do que não sair nada
      aoAviso?.("Este aparelho não junta a voz ao vídeo. Saiu com a música, sem a narração. No computador ou no Chrome a voz entra.");
      console.warn("[video] narração falhou", e);
      if (musica) { try { faixa = await prepararMusica(musica, total, true); } catch { faixa = null; } }
    }
  } else if (musica) {
    try { faixa = await prepararMusica(musica, total, true); } catch (e) { aoAviso?.((e as Error).message?.includes(".m4a") ? (e as Error).message : "Não consegui colocar a música neste aparelho. O vídeo saiu sem música."); }
  }
  const muxer = new Muxer({
    target: new ArrayBufferTarget(),
    video: { codec: "avc", width: W, height: H },
    ...(faixa ? { audio: { codec: "aac" as const, numberOfChannels: faixa.canais, sampleRate: faixa.sampleRate } } : {}),
    fastStart: "in-memory",
  });
  let proxAudio = 0;
  const somAte = (seg: number) => {
    if (!faixa) return;
    while (proxAudio < faixa.blocos.length && faixa.blocos[proxAudio].tempo <= seg) {
      const b = faixa.blocos[proxAudio];
      muxer.addAudioChunkRaw(b.dados, "key", Math.round(b.tempo * 1e6), Math.round(b.duracao * 1e6),
        proxAudio === 0 ? { decoderConfig: { codec: "mp4a.40.2", numberOfChannels: faixa.canais, sampleRate: faixa.sampleRate, description: faixa.descricao } } : undefined);
      proxAudio++;
    }
  };
  let erroEnc: Error | null = null;
  const enc = new VideoEncoder({ output: (chunk, meta) => muxer.addVideoChunk(chunk, meta), error: (e) => { erroEnc = e as Error; } });
  enc.configure({ codec, width: W, height: H, bitrate: taxa, framerate: FPS });
  const cv = document.createElement("canvas");
  cv.width = W; cv.height = H;
  const ctx = cv.getContext("2d")!;
  ctx.imageSmoothingQuality = "high";
  // cada clipe é aberto quando a cena entra e fechado quando sai (celular não aguenta muitos abertos)
  const leitores = new Map<number, Leitor>();
  const quadros = new Map<number, Fonte>();
  const n = Math.round(total * FPS);
  // 1º quadro = capa (WhatsApp e Instagram mostram ele parado): a cena 1 já com os textos inteiros, não no meio da animação
  const capaEm = Math.min(2, cenas[0].dur * 0.7);
  try {
    for (let f = 0; f < n; f++) {
      if (erroEnc) throw erroEnc;
      const t = f / FPS;
      const q = quadroEm(cenas, ini, t);
      const precisa = [q.i, ...(q.ant ? [q.ant.j] : [])].filter((j) => cenas[j].video);
      for (const j of precisa) if (!leitores.has(j)) leitores.set(j, await abrirLeitor(cenas[j].video!));
      for (const [j, l] of leitores) if (!precisa.includes(j)) { l.fechar(); leitores.delete(j); quadros.delete(j); }
      await Promise.all(precisa.map(async (j) => {
        const lt = j === q.i ? q.local : q.ant!.lt;
        quadros.set(j, await leitores.get(j)!.quadro(noClipe(cenas[j].aj, lt)).catch(() => quadros.get(j) || null));
      }));
      desenharVideo(ctx, cenas, ini, f === 0 ? capaEm : t, (j) => quadros.get(j) || null);
      somAte(t + 1 / FPS);
      const quadro = new VideoFrame(cv, { timestamp: Math.round((f * 1e6) / FPS), duration: Math.round(1e6 / FPS) });
      enc.encode(quadro, { keyFrame: f % (FPS * 2) === 0 });
      quadro.close();
      if (enc.encodeQueueSize > 8) await new Promise((r) => setTimeout(r, 0));
      if (f % 6 === 0) aoAvancar?.(f / n);
    }
    somAte(total + 1);
    await enc.flush();
  } finally {
    leitores.forEach((l) => l.fechar());
  }
  enc.close();
  muxer.finalize();
  return new Blob([muxer.target.buffer], { type: "video/mp4" });
}

/** Passa pelo vídeo quadro a quadro (FPS dado), desenhando cada um no canvas, e chama `cada` com ele. */
async function percorrerVideo(cenas: CenaPronta[], cv: HTMLCanvasElement, FPS: number, cada: (ctx: CanvasRenderingContext2D, f: number, n: number) => Promise<void> | void) {
  const { ini, total } = linhaDas(cenas);
  const ctx = cv.getContext("2d", { willReadFrequently: true })!;
  ctx.imageSmoothingQuality = "high";
  const leitores = new Map<number, Leitor>();
  const quadros = new Map<number, Fonte>();
  const n = Math.max(1, Math.round(total * FPS));
  try {
    for (let f = 0; f < n; f++) {
      const t = f / FPS;
      const q = quadroEm(cenas, ini, t);
      const precisa = [q.i, ...(q.ant ? [q.ant.j] : [])].filter((j) => cenas[j].video);
      for (const j of precisa) if (!leitores.has(j)) leitores.set(j, await abrirLeitor(cenas[j].video!));
      for (const [j, l] of leitores) if (!precisa.includes(j)) { l.fechar(); leitores.delete(j); quadros.delete(j); }
      await Promise.all(precisa.map(async (j) => {
        const lt = j === q.i ? q.local : q.ant!.lt;
        quadros.set(j, await leitores.get(j)!.quadro(noClipe(cenas[j].aj, lt)).catch(() => quadros.get(j) || null));
      }));
      desenharVideo(ctx, cenas, ini, t, (j) => quadros.get(j) || null);
      await cada(ctx, f, n);
    }
  } finally {
    leitores.forEach((l) => l.fechar());
  }
}

/** GIF animado (sem som): 10 quadros por segundo. Passa duas vezes: uma rápida para escolher as cores, outra para gravar. */
export async function fazerGif(cenas: CenaPronta[], largura: number, aoAvancar?: (p: number) => void): Promise<Blob> {
  const altura = cenas[0]?.altura || 1920;
  const W = Math.round(largura / 2) * 2, H = Math.round((largura * altura) / LARG / 2) * 2;
  const FPS = 10;
  const amostra = document.createElement("canvas");
  amostra.width = 120; amostra.height = Math.round((120 * H) / W);
  const amostras: Uint8ClampedArray[] = [];
  await percorrerVideo(cenas, amostra, 2, (ctx, f, n) => { amostras.push(ctx.getImageData(0, 0, amostra.width, amostra.height).data); aoAvancar?.((f / n) * 0.2); });
  const { paleta, mapa } = paletaDe(amostras);
  const gif = novoGif(W, H, paleta, mapa);
  const cv = document.createElement("canvas");
  cv.width = W; cv.height = H;
  await percorrerVideo(cenas, cv, FPS, async (ctx, f, n) => {
    gif.quadro(ctx.getImageData(0, 0, W, H).data, 100 / FPS);
    if (f % 5 === 0) { aoAvancar?.(0.2 + (f / n) * 0.8); await new Promise((r) => setTimeout(r, 0)); }
  });
  return gif.fim();
}
