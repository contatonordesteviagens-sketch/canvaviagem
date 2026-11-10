// Lê os quadros de um MP4 (H.264) direto do arquivo, com o decodificador do navegador (WebCodecs).
// Por que: o gerador antes "tocava" cada vídeo de fundo e esperava o tempo real passar — lento (~25 s por vídeo)
// e parava quando a aba ficava escondida (o navegador deixa de decodificar vídeo em segundo plano).
// Aqui cada quadro é decodificado na hora que o gerador pede: mais rápido e funciona com a página minimizada.

type Amostra = { offset: number; tamanho: number; tempo: number; duracao: number; chave: boolean };

export type Caixa = { tipo: string; inicio: number; fim: number; corpo: number };

export function caixas(v: DataView, inicio: number, fim: number): Caixa[] {
  const lista: Caixa[] = [];
  let p = inicio;
  while (p + 8 <= fim) {
    let tamanho = v.getUint32(p);
    const tipo = String.fromCharCode(v.getUint8(p + 4), v.getUint8(p + 5), v.getUint8(p + 6), v.getUint8(p + 7));
    let corpo = p + 8;
    if (tamanho === 1) {
      tamanho = Number(v.getBigUint64(p + 8));
      corpo = p + 16;
    } else if (tamanho === 0) tamanho = fim - p;
    if (tamanho < 8) break;
    lista.push({ tipo, inicio: p, fim: Math.min(p + tamanho, fim), corpo });
    p += tamanho;
  }
  return lista;
}
export const achar = (v: DataView, pai: Caixa, tipo: string) => caixas(v, pai.corpo, pai.fim).find((c) => c.tipo === tipo);
export const caminho = (v: DataView, pai: Caixa, ...tipos: string[]) => {
  let atual: Caixa | undefined = pai;
  for (const t of tipos) {
    atual = atual && achar(v, atual, t);
    if (!atual) return undefined;
  }
  return atual;
};

/** Amostras de um MP4 fragmentado (moof + trun), com os padrões do trex/tfhd. */
function lerFragmentos(v: DataView, fim: number, moov: Caixa, idTrilha: number, escala: number): Amostra[] {
  const padrao = { dur: 0, tam: 0, flags: 0 };
  const mvex = achar(v, moov, "mvex");
  if (mvex)
    for (const trex of caixas(v, mvex.corpo, mvex.fim).filter((c) => c.tipo === "trex"))
      if (v.getUint32(trex.corpo + 4) === idTrilha) {
        padrao.dur = v.getUint32(trex.corpo + 12);
        padrao.tam = v.getUint32(trex.corpo + 16);
        padrao.flags = v.getUint32(trex.corpo + 20);
      }
  const lista: Amostra[] = [];
  for (const moof of caixas(v, 0, fim).filter((c) => c.tipo === "moof")) {
    for (const traf of caixas(v, moof.corpo, moof.fim).filter((c) => c.tipo === "traf")) {
      const tfhd = achar(v, traf, "tfhd");
      if (!tfhd) continue;
      const tf = v.getUint32(tfhd.corpo) & 0xffffff;
      if (v.getUint32(tfhd.corpo + 4) !== idTrilha) continue;
      let q = tfhd.corpo + 8;
      let base = moof.inicio;
      if (tf & 0x1) { base = Number(v.getBigUint64(q)); q += 8; }
      if (tf & 0x2) q += 4;
      let dDur = padrao.dur, dTam = padrao.tam, dFlags = padrao.flags;
      if (tf & 0x8) { dDur = v.getUint32(q); q += 4; }
      if (tf & 0x10) { dTam = v.getUint32(q); q += 4; }
      if (tf & 0x20) { dFlags = v.getUint32(q); q += 4; }
      const tfdt = achar(v, traf, "tfdt");
      let tempo = 0;
      if (tfdt) tempo = v.getUint8(tfdt.corpo) === 1 ? Number(v.getBigUint64(tfdt.corpo + 4)) : v.getUint32(tfdt.corpo + 4);
      for (const trun of caixas(v, traf.corpo, traf.fim).filter((c) => c.tipo === "trun")) {
        const ver = v.getUint8(trun.corpo);
        const fl = v.getUint32(trun.corpo) & 0xffffff;
        const qtd = v.getUint32(trun.corpo + 4);
        let r = trun.corpo + 8;
        let pos = base;
        if (fl & 0x1) { pos = base + v.getInt32(r); r += 4; }
        let primeiraFlags: number | null = null;
        if (fl & 0x4) { primeiraFlags = v.getUint32(r); r += 4; }
        for (let i = 0; i < qtd; i++) {
          let dur = dDur, tam = dTam, flags = i === 0 && primeiraFlags !== null ? primeiraFlags : dFlags, cto = 0;
          if (fl & 0x100) { dur = v.getUint32(r); r += 4; }
          if (fl & 0x200) { tam = v.getUint32(r); r += 4; }
          if (fl & 0x400) { flags = v.getUint32(r); r += 4; }
          if (fl & 0x800) { cto = ver === 1 ? v.getInt32(r) : v.getUint32(r); r += 4; }
          lista.push({ offset: pos, tamanho: tam, tempo: (tempo + cto) / escala, duracao: dur / escala, chave: ((flags >> 16) & 1) === 0 });
          pos += tam;
          tempo += dur;
        }
      }
    }
  }
  // tempos relativos ao primeiro quadro
  const t0 = Math.min(...lista.map((a) => a.tempo));
  if (Number.isFinite(t0) && t0 > 0) lista.forEach((a) => (a.tempo -= t0));
  return lista;
}

/** Monta a tabela de amostras da trilha de vídeo de um MP4 progressivo (moov no arquivo). */
function lerMp4(buf: ArrayBuffer) {
  const v = new DataView(buf);
  const moov = caixas(v, 0, buf.byteLength).find((c) => c.tipo === "moov");
  if (!moov) throw new Error("MP4 sem moov");
  for (const trak of caixas(v, moov.corpo, moov.fim).filter((c) => c.tipo === "trak")) {
    const hdlr = caminho(v, trak, "mdia", "hdlr");
    if (!hdlr) continue;
    const handler = String.fromCharCode(v.getUint8(hdlr.corpo + 8), v.getUint8(hdlr.corpo + 9), v.getUint8(hdlr.corpo + 10), v.getUint8(hdlr.corpo + 11));
    if (handler !== "vide") continue;
    const mdhd = caminho(v, trak, "mdia", "mdhd")!;
    const versao = v.getUint8(mdhd.corpo);
    const escala = versao === 1 ? v.getUint32(mdhd.corpo + 20) : v.getUint32(mdhd.corpo + 12);
    const stbl = caminho(v, trak, "mdia", "minf", "stbl");
    if (!stbl) throw new Error("MP4 sem stbl");
    const stsd = achar(v, stbl, "stsd")!;
    const entrada = caixas(v, stsd.corpo + 8, stsd.fim)[0];
    if (!entrada || !/^avc[13]$/.test(entrada.tipo)) throw new Error(`codec ${entrada?.tipo} não suportado`);
    const largura = v.getUint16(entrada.corpo + 24);
    const altura = v.getUint16(entrada.corpo + 26);
    const avcC = caixas(v, entrada.corpo + 78, entrada.fim).find((c) => c.tipo === "avcC");
    if (!avcC) throw new Error("MP4 sem avcC");
    const descricao = new Uint8Array(buf.slice(avcC.corpo, avcC.fim));
    const hex = (n: number) => n.toString(16).padStart(2, "0");
    const codec = `avc1.${hex(descricao[1])}${hex(descricao[2])}${hex(descricao[3])}`;

    // tamanhos
    const stsz = achar(v, stbl, "stsz")!;
    const tamFixo = v.getUint32(stsz.corpo + 4);
    const n = v.getUint32(stsz.corpo + 8);
    const tamanhos = Array.from({ length: n }, (_, i) => (tamFixo || v.getUint32(stsz.corpo + 12 + i * 4)));
    // tempos (dts) e deslocamento de composição (cts)
    const stts = achar(v, stbl, "stts")!;
    const dts: number[] = [];
    const durs: number[] = [];
    let acc = 0;
    for (let e = 0, q = v.getUint32(stts.corpo + 4); e < q; e++) {
      const cont = v.getUint32(stts.corpo + 8 + e * 8);
      const delta = v.getUint32(stts.corpo + 12 + e * 8);
      for (let k = 0; k < cont; k++) {
        dts.push(acc);
        durs.push(delta);
        acc += delta;
      }
    }
    const comp = new Array(n).fill(0);
    const ctts = achar(v, stbl, "ctts");
    if (ctts) {
      const ver = v.getUint8(ctts.corpo);
      let i = 0;
      for (let e = 0, q = v.getUint32(ctts.corpo + 4); e < q; e++) {
        const cont = v.getUint32(ctts.corpo + 8 + e * 8);
        const off = ver === 1 ? v.getInt32(ctts.corpo + 12 + e * 8) : v.getUint32(ctts.corpo + 12 + e * 8);
        for (let k = 0; k < cont && i < n; k++) comp[i++] = off;
      }
    }
    // quadros-chave
    const stss = achar(v, stbl, "stss");
    const chaves = new Set<number>();
    if (stss) for (let e = 0, q = v.getUint32(stss.corpo + 4); e < q; e++) chaves.add(v.getUint32(stss.corpo + 8 + e * 4) - 1);
    // posição de cada amostra no arquivo (stsc + stco/co64)
    const stco = achar(v, stbl, "stco");
    const co64 = achar(v, stbl, "co64");
    const blocos: number[] = [];
    if (stco) for (let e = 0, q = v.getUint32(stco.corpo + 4); e < q; e++) blocos.push(v.getUint32(stco.corpo + 8 + e * 4));
    else if (co64) for (let e = 0, q = v.getUint32(co64.corpo + 4); e < q; e++) blocos.push(Number(v.getBigUint64(co64.corpo + 8 + e * 8)));
    const stsc = achar(v, stbl, "stsc")!;
    const regras: { primeiro: number; porBloco: number }[] = [];
    for (let e = 0, q = v.getUint32(stsc.corpo + 4); e < q; e++) regras.push({ primeiro: v.getUint32(stsc.corpo + 8 + e * 12) - 1, porBloco: v.getUint32(stsc.corpo + 12 + e * 12) });
    const offsets: number[] = [];
    let s = 0;
    for (let b = 0; b < blocos.length && s < n; b++) {
      let r = regras.length - 1;
      while (r > 0 && regras[r].primeiro > b) r--;
      let pos = blocos[b];
      for (let k = 0; k < regras[r].porBloco && s < n; k++) {
        offsets.push(pos);
        pos += tamanhos[s];
        s++;
      }
    }
    let amostras: Amostra[] = tamanhos.map((tamanho, i) => ({
      offset: offsets[i],
      tamanho,
      tempo: (dts[i] + comp[i]) / escala,
      duracao: durs[i] / escala,
      chave: stss ? chaves.has(i) : true,
    }));
    // MP4 fragmentado (moof/mdat): a tabela de cima vem vazia e as amostras estão nos fragmentos
    if (!amostras.length) {
      const tkhd = achar(v, trak, "tkhd")!;
      const idTrilha = v.getUint8(tkhd.corpo) === 1 ? v.getUint32(tkhd.corpo + 20) : v.getUint32(tkhd.corpo + 12);
      amostras = lerFragmentos(v, buf.byteLength, moov, idTrilha, escala);
    }
    if (!amostras.length) throw new Error("MP4 sem quadros");
    const duracao = Math.max(...amostras.map((a) => a.tempo + a.duracao));
    return { codec, largura, altura, descricao, amostras, duracao };
  }
  throw new Error("MP4 sem trilha de vídeo");
}

// Os arquivos são baixados assim que o fundo é escolhido (prévia), para a geração começar na hora.
const baixados = new Map<string, Promise<ArrayBuffer>>();
export function baixarVideo(url: string): Promise<ArrayBuffer> {
  let p = baixados.get(url);
  if (!p) {
    p = fetch(url, { mode: "cors" }).then((r) => {
      if (!r.ok) throw new Error(`vídeo ${r.status}`);
      return r.arrayBuffer();
    });
    p.catch(() => baixados.delete(url));
    baixados.set(url, p);
    // guarda só os últimos 18 (os fundos atuais e alguns anteriores)
    if (baixados.size > 18) baixados.delete(baixados.keys().next().value as string);
  }
  return p;
}

/** Um vídeo de fundo lido quadro a quadro. Desenha o quadro pedido no próprio canvas (usado como fundo). */
export class QuadrosDeVideo {
  readonly canvas: HTMLCanvasElement;
  readonly duracao: number;
  private ctx: CanvasRenderingContext2D;
  private dados: Uint8Array;
  private info: ReturnType<typeof lerMp4>;
  private dec!: VideoDecoder;
  private prox = 0;
  private fila: VideoFrame[] = [];
  private atual: VideoFrame | null = null;
  private avisar: (() => void) | null = null;
  private terminou = false;
  private erro: Error | null = null;

  private constructor(buf: ArrayBuffer, info: ReturnType<typeof lerMp4>) {
    this.dados = new Uint8Array(buf);
    this.info = info;
    this.duracao = info.duracao;
    this.canvas = document.createElement("canvas");
    this.canvas.width = info.largura;
    this.canvas.height = info.altura;
    this.ctx = this.canvas.getContext("2d")!;
    this.iniciar();
  }

  static async abrir(url: string): Promise<QuadrosDeVideo> {
    if (typeof VideoDecoder === "undefined") throw new Error("sem WebCodecs");
    const buf = await baixarVideo(url);
    const info = lerMp4(buf);
    const ok = await VideoDecoder.isConfigSupported({ codec: info.codec, description: info.descricao, codedWidth: info.largura, codedHeight: info.altura });
    if (!ok.supported) throw new Error(`codec ${info.codec} não suportado`);
    return new QuadrosDeVideo(buf, info);
  }

  private iniciar() {
    this.dec = new VideoDecoder({
      output: (f) => {
        this.fila.push(f);
        this.avisar?.();
      },
      error: (e) => {
        this.erro = e as Error;
        this.avisar?.();
      },
    });
    // a fila de decodificação andou (mesmo sem quadro novo ainda): libera quem está esperando
    (this.dec as VideoDecoder & { ondequeue: (() => void) | null }).ondequeue = () => this.avisar?.();
    this.dec.configure({ codec: this.info.codec, description: this.info.descricao, codedWidth: this.info.largura, codedHeight: this.info.altura, optimizeForLatency: true });
    this.prox = 0;
    this.terminou = false;
  }

  private reiniciar() {
    try {
      this.dec.close();
    } catch {
      /* já fechado */
    }
    this.fila.forEach((f) => f.close());
    this.fila = [];
    this.atual?.close();
    this.atual = null;
    this.iniciar();
  }

  private esperarSaida() {
    return new Promise<void>((r) => {
      this.avisar = () => {
        this.avisar = null;
        r();
      };
    });
  }

  /** Desenha no canvas o quadro do segundo `seg` do vídeo (dá a volta no fim, como o loop de antes). */
  async quadro(seg: number): Promise<void> {
    const alvo = Math.max(0, seg % Math.max(this.duracao - 0.05, 0.5));
    // deu a volta: recomeça do primeiro quadro
    if (this.atual && this.atual.timestamp / 1e6 > alvo + 0.1) this.reiniciar();
    for (;;) {
      if (this.erro) throw this.erro;
      // avança na fila até o último quadro que ainda não passou do alvo
      while (this.fila.length && this.fila[0].timestamp / 1e6 <= alvo + 0.001) {
        this.atual?.close();
        this.atual = this.fila.shift()!;
      }
      if (this.fila.length || (this.terminou && !this.fila.length)) break;
      if (this.prox < this.info.amostras.length) {
        const a = this.info.amostras[this.prox++];
        this.dec.decode(
          new EncodedVideoChunk({ type: a.chave ? "key" : "delta", timestamp: Math.round(a.tempo * 1e6), duration: Math.round(a.duracao * 1e6), data: this.dados.subarray(a.offset, a.offset + a.tamanho) }),
        );
        if (this.dec.decodeQueueSize > 3) await this.esperarSaida();
      } else {
        await this.dec.flush();
        this.terminou = true;
      }
    }
    const f = this.atual || this.fila[0];
    if (f) this.ctx.drawImage(f, 0, 0, this.canvas.width, this.canvas.height);
  }

  fechar() {
    try {
      this.dec.close();
    } catch {
      /* já fechado */
    }
    this.fila.forEach((f) => f.close());
    this.fila = [];
    this.atual?.close();
    this.atual = null;
  }
}
