// Música de fundo do Gerador de vídeo: prepara a faixa de áudio (AAC) que entra no MP4.
// Dois caminhos, para funcionar em todos os navegadores que geram o vídeo:
//  A) com AudioEncoder (Chrome, Edge, Safari novo): decodifica qualquer arquivo (mp3, m4a, wav), corta no tamanho
//     do vídeo, aplica entrada e saída suaves e codifica em AAC;
//  B) sem AudioEncoder (iPhone com iOS 16.4 a 18): copia os blocos AAC de um arquivo .m4a direto para o vídeo.
//     As faixas da casa já têm a saída suave no fim do arquivo, então o trecho usado é o final da faixa.
import { caixas, achar, caminho } from "@/lib/mp4-quadros";

export type Musica = { id: string; nome: string; clima: string; arquivo: string; autor: string; fonte: string };

// Todas as faixas são CC0 (domínio público, uso comercial livre, sem crédito obrigatório), do Freesound.
export const MUSICAS: Musica[] = [
  { id: "verao", nome: "Verão", clima: "Animada, eletrônica", arquivo: "/video-musicas/verao.m4a", autor: "Seth_Makes_Sounds", fonte: "https://freesound.org/people/Seth_Makes_Sounds/sounds/687014" },
  { id: "violao", nome: "Violão alegre", clima: "Leve, com batida", arquivo: "/video-musicas/violao.m4a", autor: "Seth_Makes_Sounds", fonte: "https://freesound.org/people/Seth_Makes_Sounds/sounds/686611" },
  { id: "acustica", nome: "Acústica", clima: "Violão com orquestra", arquivo: "/video-musicas/acustica.m4a", autor: "guitarman213", fonte: "https://freesound.org/people/guitarman213/sounds/709034" },
  { id: "ceu-azul", nome: "Céu azul", clima: "Alegre, ukulele", arquivo: "/video-musicas/ceu-azul.m4a", autor: "Sergmusic", fonte: "https://freesound.org/people/Sergmusic/sounds/639933" },
  { id: "tropical", nome: "Praia tropical", clima: "Calma, de praia", arquivo: "/video-musicas/tropical.m4a", autor: "szegvari", fonte: "https://freesound.org/people/szegvari/sounds/595776" },
];

/** Escolha do cliente: rodízio das faixas da casa, uma faixa fixa, a música dele ou nenhuma. */
export type EscolhaMusica = "auto" | "nenhuma" | "minha" | string;

export type FaixaAac = {
  sampleRate: number;
  canais: number;
  /** AudioSpecificConfig (vai no cabeçalho do MP4) */
  descricao: Uint8Array;
  blocos: { dados: Uint8Array; tempo: number; duracao: number }[];
};

const TAXA = 44100;
const temCodificador = () => typeof AudioEncoder !== "undefined" && typeof AudioData !== "undefined";

async function lerArquivo(fonte: string | Blob): Promise<ArrayBuffer> {
  if (typeof fonte !== "string") return fonte.arrayBuffer();
  const r = await fetch(fonte);
  if (!r.ok) throw new Error(`música ${r.status}`);
  return r.arrayBuffer();
}

/** Lê os blocos AAC de um .m4a (MP4 com trilha de áudio mp4a). */
function lerM4a(buf: ArrayBuffer): FaixaAac {
  const v = new DataView(buf);
  const moov = caixas(v, 0, buf.byteLength).find((c) => c.tipo === "moov");
  if (!moov) throw new Error("não é m4a");
  for (const trak of caixas(v, moov.corpo, moov.fim).filter((c) => c.tipo === "trak")) {
    const hdlr = caminho(v, trak, "mdia", "hdlr");
    if (!hdlr) continue;
    const tipo = String.fromCharCode(v.getUint8(hdlr.corpo + 8), v.getUint8(hdlr.corpo + 9), v.getUint8(hdlr.corpo + 10), v.getUint8(hdlr.corpo + 11));
    if (tipo !== "soun") continue;
    const stbl = caminho(v, trak, "mdia", "minf", "stbl");
    if (!stbl) break;
    const stsd = achar(v, stbl, "stsd")!;
    const entrada = caixas(v, stsd.corpo + 8, stsd.fim)[0];
    if (!entrada || entrada.tipo !== "mp4a") throw new Error("áudio não é AAC");
    const esds = caixas(v, entrada.corpo + 28, entrada.fim).find((c) => c.tipo === "esds");
    if (!esds) throw new Error("m4a sem esds");
    // dentro do esds: procura o descritor 0x05 (DecoderSpecificInfo = AudioSpecificConfig)
    let p = esds.corpo + 4;
    let descricao: Uint8Array | null = null;
    const lerTamanho = () => {
      let n = 0;
      for (let i = 0; i < 4; i++) {
        const b = v.getUint8(p++);
        n = (n << 7) | (b & 0x7f);
        if (!(b & 0x80)) break;
      }
      return n;
    };
    while (p < esds.fim - 1) {
      const tag = v.getUint8(p++);
      const tam = lerTamanho();
      if (tag === 0x03) p += 3;
      else if (tag === 0x04) p += 13;
      else if (tag === 0x05) {
        descricao = new Uint8Array(buf.slice(p, p + tam));
        break;
      } else p += tam;
    }
    if (!descricao || descricao.length < 2) throw new Error("m4a sem configuração");
    const TAXAS = [96000, 88200, 64000, 48000, 44100, 32000, 24000, 22050, 16000, 12000, 11025, 8000, 7350];
    const sampleRate = TAXAS[((descricao[0] & 0x07) << 1) | (descricao[1] >> 7)] || TAXA;
    const canais = (descricao[1] >> 3) & 0x0f || 2;

    const stsz = achar(v, stbl, "stsz")!;
    const fixo = v.getUint32(stsz.corpo + 4);
    const n = v.getUint32(stsz.corpo + 8);
    const tamanhos = Array.from({ length: n }, (_, i) => fixo || v.getUint32(stsz.corpo + 12 + i * 4));
    const stco = achar(v, stbl, "stco");
    const co64 = achar(v, stbl, "co64");
    const blocosArq: number[] = [];
    if (stco) for (let e = 0, q = v.getUint32(stco.corpo + 4); e < q; e++) blocosArq.push(v.getUint32(stco.corpo + 8 + e * 4));
    else if (co64) for (let e = 0, q = v.getUint32(co64.corpo + 4); e < q; e++) blocosArq.push(Number(v.getBigUint64(co64.corpo + 8 + e * 8)));
    const stsc = achar(v, stbl, "stsc")!;
    const regras: { primeiro: number; porBloco: number }[] = [];
    for (let e = 0, q = v.getUint32(stsc.corpo + 4); e < q; e++) regras.push({ primeiro: v.getUint32(stsc.corpo + 8 + e * 12) - 1, porBloco: v.getUint32(stsc.corpo + 12 + e * 12) });
    const bytes = new Uint8Array(buf);
    const dur = 1024 / sampleRate;
    const blocos: FaixaAac["blocos"] = [];
    let s = 0;
    for (let b = 0; b < blocosArq.length && s < n; b++) {
      let r = regras.length - 1;
      while (r > 0 && regras[r].primeiro > b) r--;
      let pos = blocosArq[b];
      for (let k = 0; k < regras[r].porBloco && s < n; k++) {
        blocos.push({ dados: bytes.subarray(pos, pos + tamanhos[s]), tempo: s * dur, duracao: dur });
        pos += tamanhos[s];
        s++;
      }
    }
    if (!blocos.length) throw new Error("m4a vazio");
    return { sampleRate, canais, descricao, blocos };
  }
  throw new Error("arquivo sem áudio AAC");
}

/** Caminho B: copia os blocos do .m4a. `doFim` usa o trecho final (onde está a saída suave das faixas da casa). */
function recortar(faixa: FaixaAac, segundos: number, doFim: boolean): FaixaAac {
  const dur = 1024 / faixa.sampleRate;
  const quantos = Math.min(faixa.blocos.length, Math.ceil(segundos / dur));
  const inicio = doFim ? faixa.blocos.length - quantos : 0;
  const blocos = faixa.blocos.slice(inicio, inicio + quantos).map((b, i) => ({ dados: b.dados, tempo: i * dur, duracao: dur }));
  return { ...faixa, blocos };
}

/** Caminho A: decodifica, corta, suaviza entrada e saída e codifica em AAC. */
async function codificar(buf: ArrayBuffer, segundos: number): Promise<FaixaAac> {
  const config = { codec: "mp4a.40.2", sampleRate: TAXA, numberOfChannels: 2, bitrate: 128_000 };
  const ok = await AudioEncoder.isConfigSupported(config);
  if (!ok.supported) throw new Error("sem AAC");
  const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  const ac = new Ctx();
  let original: AudioBuffer;
  try {
    original = await ac.decodeAudioData(buf.slice(0));
  } finally {
    ac.close().catch(() => undefined);
  }
  const off = new OfflineAudioContext(2, Math.ceil(segundos * TAXA), TAXA);
  const src = off.createBufferSource();
  src.buffer = original;
  src.loop = original.duration < segundos; // música mais curta que o vídeo: repete
  const ganho = off.createGain();
  const saida = Math.min(2, segundos / 4);
  ganho.gain.setValueAtTime(0, 0);
  ganho.gain.linearRampToValueAtTime(0.9, 0.25);
  ganho.gain.setValueAtTime(0.9, Math.max(0.3, segundos - saida));
  ganho.gain.linearRampToValueAtTime(0, segundos);
  src.connect(ganho).connect(off.destination);
  src.start(0);
  const pronto = await off.startRendering();

  const blocos: FaixaAac["blocos"] = [];
  let descricao: Uint8Array | null = null;
  let erro: Error | null = null;
  const enc = new AudioEncoder({
    output: (chunk, meta) => {
      const d = meta?.decoderConfig?.description;
      if (d && !descricao) descricao = new Uint8Array(d instanceof ArrayBuffer ? d : (d as ArrayBufferView).buffer.slice((d as ArrayBufferView).byteOffset, (d as ArrayBufferView).byteOffset + (d as ArrayBufferView).byteLength));
      const dados = new Uint8Array(chunk.byteLength);
      chunk.copyTo(dados);
      blocos.push({ dados, tempo: chunk.timestamp / 1e6, duracao: (chunk.duration || (1024 / TAXA) * 1e6) / 1e6 });
    },
    error: (e) => {
      erro = e as Error;
    },
  });
  enc.configure(config);
  const total = pronto.length;
  const esq = pronto.getChannelData(0);
  const dir = pronto.numberOfChannels > 1 ? pronto.getChannelData(1) : esq;
  const PASSO = 1024 * 16;
  for (let i = 0; i < total; i += PASSO) {
    const n = Math.min(PASSO, total - i);
    const plano = new Float32Array(n * 2);
    plano.set(esq.subarray(i, i + n), 0);
    plano.set(dir.subarray(i, i + n), n);
    const dado = new AudioData({ format: "f32-planar", sampleRate: TAXA, numberOfFrames: n, numberOfChannels: 2, timestamp: Math.round((i / TAXA) * 1e6), data: plano });
    enc.encode(dado);
    dado.close();
  }
  await enc.flush();
  enc.close();
  if (erro) throw erro;
  if (!blocos.length) throw new Error("áudio vazio");
  // tempos a partir do zero e nada além do fim do vídeo
  const t0 = blocos[0].tempo;
  const limpos = blocos.map((b) => ({ ...b, tempo: Math.max(0, b.tempo - t0) })).filter((b) => b.tempo < segundos);
  // AAC-LC, 44,1 kHz, estéreo, caso o navegador não devolva a configuração
  return { sampleRate: TAXA, canais: 2, descricao: descricao || new Uint8Array([0x12, 0x10]), blocos: limpos };
}

/**
 * Prepara a música no tamanho do vídeo. `daCasa` = faixa do Canva Viagem (.m4a com saída suave no fim).
 * `forcarCopia` é só para teste (simula o iPhone sem AudioEncoder).
 */
export async function prepararMusica(fonte: string | Blob, segundos: number, daCasa: boolean, forcarCopia = false): Promise<FaixaAac> {
  const buf = await lerArquivo(fonte);
  if (temCodificador() && !forcarCopia) {
    try {
      return await codificar(buf, segundos);
    } catch (e) {
      console.warn("[musica] codificação falhou, tentando copiar o AAC", e);
    }
  }
  try {
    return recortar(lerM4a(buf), segundos, daCasa);
  } catch {
    throw new Error("Neste aparelho a música precisa ser um arquivo .m4a (AAC). O vídeo saiu sem música.");
  }
}

/** A faixa da casa da vez no rodízio. */
export const musicaDaVez = (n: number) => MUSICAS[((n % MUSICAS.length) + MUSICAS.length) % MUSICAS.length];
