/** GIF animado sem biblioteca: uma paleta de 256 cores para o vídeo todo (as cores que mais aparecem
 *  em quadros de amostra) e compressão LZW. Feito para vídeos curtos e pequenos (até ~480 px). */

/** Monta a paleta a partir de quadros de amostra (RGBA). Devolve a paleta e a tabela 15 bits -> índice. */
export function paletaDe(amostras: Uint8ClampedArray[]): { paleta: Uint8Array; mapa: Uint8Array } {
  const conta = new Uint32Array(32768);
  for (const d of amostras) for (let i = 0; i < d.length; i += 4 * 3) conta[((d[i] >> 3) << 10) | ((d[i + 1] >> 3) << 5) | (d[i + 2] >> 3)]++;
  const usados: number[] = [];
  for (let c = 0; c < 32768; c++) if (conta[c]) usados.push(c);
  usados.sort((a, b) => conta[b] - conta[a]);
  // escolhe as mais frequentes, pulando as muito parecidas com uma já escolhida (dá lugar a mais tons)
  const escolhidas: number[] = [];
  const perto = (a: number, b: number, lim: number) => Math.abs((a >> 10) - (b >> 10)) <= lim && Math.abs(((a >> 5) & 31) - ((b >> 5) & 31)) <= lim && Math.abs((a & 31) - (b & 31)) <= lim;
  for (const lim of [1, 0]) {
    for (const c of usados) {
      if (escolhidas.length >= 256) break;
      if (!escolhidas.some((e) => e === c || (lim && perto(e, c, lim)))) escolhidas.push(c);
    }
  }
  while (escolhidas.length < 256) escolhidas.push(0);
  const paleta = new Uint8Array(256 * 3);
  const rgb = escolhidas.map((c) => [((c >> 10) << 3) | 4, (((c >> 5) & 31) << 3) | 4, ((c & 31) << 3) | 4]);
  rgb.forEach(([r, g, b], i) => { paleta[i * 3] = r; paleta[i * 3 + 1] = g; paleta[i * 3 + 2] = b; });
  // tabela: cada cor de 15 bits aponta para a cor mais próxima da paleta
  const mapa = new Uint8Array(32768);
  for (let c = 0; c < 32768; c++) {
    const r = ((c >> 10) << 3) | 4, g = (((c >> 5) & 31) << 3) | 4, b = ((c & 31) << 3) | 4;
    let melhor = 0, dist = Infinity;
    for (let i = 0; i < 256; i++) {
      const dr = r - rgb[i][0], dg = g - rgb[i][1], db = b - rgb[i][2];
      const dd = dr * dr * 2 + dg * dg * 4 + db * db * 3;
      if (dd < dist) { dist = dd; melhor = i; if (!dd) break; }
    }
    mapa[c] = melhor;
  }
  return { paleta, mapa };
}

class Bytes {
  private partes: Uint8Array[] = [];
  private buf = new Uint8Array(1 << 16);
  private n = 0;
  byte(b: number) { if (this.n === this.buf.length) this.descarrega(); this.buf[this.n++] = b; }
  bytes(a: ArrayLike<number>) { for (let i = 0; i < a.length; i++) this.byte(a[i]); }
  palavra(v: number) { this.byte(v & 255); this.byte((v >> 8) & 255); }
  private descarrega() { this.partes.push(this.buf.slice(0, this.n)); this.n = 0; }
  blob(): Blob { this.descarrega(); return new Blob(this.partes as BlobPart[], { type: "image/gif" }); }
}

/** Compressão LZW do GIF (8 bits por pixel), já em sub-blocos de até 255 bytes. */
function lzw(px: Uint8Array, saida: Bytes) {
  const MIN = 8, LIMPA = 256, FIM = 257;
  saida.byte(MIN);
  let bloco: number[] = [];
  let acum = 0, nb = 0;
  const poe = (cod: number, tam: number) => {
    acum |= cod << nb; nb += tam;
    while (nb >= 8) { bloco.push(acum & 255); acum >>>= 8; nb -= 8; if (bloco.length === 255) { saida.byte(255); saida.bytes(bloco); bloco = []; } }
  };
  let dic = new Map<number, number>();
  let prox = 258, tam = 9;
  poe(LIMPA, tam);
  let atual = px[0];
  for (let i = 1; i < px.length; i++) {
    const k = px[i];
    const chave = (atual << 8) | k;
    const ach = dic.get(chave);
    if (ach !== undefined) { atual = ach; continue; }
    poe(atual, tam);
    if (prox < 4096) {
      dic.set(chave, prox++);
      if (prox > 1 << tam && tam < 12) tam++;
    } else {
      poe(LIMPA, tam);
      dic = new Map(); prox = 258; tam = 9;
    }
    atual = k;
  }
  poe(atual, tam);
  poe(FIM, tam);
  if (nb > 0) bloco.push(acum & 255);
  if (bloco.length) { saida.byte(bloco.length); saida.bytes(bloco); }
  saida.byte(0);
}

/** Escritor de GIF: começa com a paleta, recebe quadros RGBA um a um. */
export function novoGif(w: number, h: number, paleta: Uint8Array, mapa: Uint8Array) {
  const out = new Bytes();
  out.bytes([0x47, 0x49, 0x46, 0x38, 0x39, 0x61]); // GIF89a
  out.palavra(w); out.palavra(h);
  out.byte(0xf7); out.byte(0); out.byte(0); // paleta global de 256 cores
  out.bytes(paleta);
  out.bytes([0x21, 0xff, 0x0b, ...Array.from("NETSCAPE2.0").map((c) => c.charCodeAt(0)), 0x03, 0x01, 0x00, 0x00, 0x00]); // repete sempre
  const idx = new Uint8Array(w * h);
  return {
    quadro(rgba: Uint8ClampedArray, centesimos: number) {
      for (let i = 0, p = 0; p < idx.length; i += 4, p++) idx[p] = mapa[((rgba[i] >> 3) << 10) | ((rgba[i + 1] >> 3) << 5) | (rgba[i + 2] >> 3)];
      out.bytes([0x21, 0xf9, 0x04, 0x00]); out.palavra(centesimos); out.byte(0); out.byte(0);
      out.byte(0x2c); out.palavra(0); out.palavra(0); out.palavra(w); out.palavra(h); out.byte(0);
      lzw(idx, out);
    },
    fim(): Blob { out.byte(0x3b); return out.blob(); },
  };
}
