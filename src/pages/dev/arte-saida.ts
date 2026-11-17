// Saídas extras da arte: PDF (todas as páginas num arquivo só, abre em qualquer celular)
// e MP4 (a arte vira um vídeo curto com zoom lento, para Status, Reels e Stories).
import { jsPDF } from "jspdf";
import { ArrayBufferTarget, Muxer } from "mp4-muxer";

export const ehIOS = () =>
  typeof navigator !== "undefined" && (/iPhone|iPad|iPod/i.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1));

export const podeMp4 = () => typeof window !== "undefined" && "VideoEncoder" in window && "VideoFrame" in window;

/** Um PDF com uma página por imagem (cada página no tamanho da arte). */
export async function fazerPdf(paginas: { dado: string; w: number; h: number }[]): Promise<Blob> {
  const p0 = paginas[0];
  const doc = new jsPDF({ orientation: p0.w >= p0.h ? "landscape" : "portrait", unit: "px", format: [p0.w, p0.h], hotfixes: ["px_scaling"], compress: true });
  paginas.forEach((p, i) => {
    if (i > 0) doc.addPage([p.w, p.h], p.w >= p.h ? "landscape" : "portrait");
    doc.addImage(p.dado, p.dado.startsWith("data:image/png") ? "PNG" : "JPEG", 0, 0, p.w, p.h, undefined, "FAST");
  });
  return doc.output("blob");
}

const carregar = (src: string) => new Promise<HTMLImageElement>((ok, erro) => {
  const i = new Image();
  i.onload = () => ok(i);
  i.onerror = () => erro(new Error("imagem"));
  i.src = src;
});

/** Vídeo MP4 (H.264) das páginas, com zoom lento. Lado maior até 1920 px. */
export async function fazerMp4(paginas: string[], largura: number, altura: number, segundosPorPagina: number, aoAvancar?: (p: number) => void): Promise<Blob> {
  if (!podeMp4()) throw new Error("Este navegador não faz vídeo MP4.");
  const k = Math.min(1, 1920 / Math.max(largura, altura));
  const W = Math.max(2, Math.round((largura * k) / 2) * 2), H = Math.max(2, Math.round((altura * k) / 2) * 2);
  const FPS = 30;
  // taxa pelo tamanho: vídeo pequeno fica leve, 1080 fica nítido
  const taxa = Math.min(8_000_000, Math.max(1_000_000, W * H * 4));
  let codec = "";
  for (const c of ["avc1.640028", "avc1.4d0028", "avc1.42002a", "avc1.640033"]) {
    try {
      const ok = await VideoEncoder.isConfigSupported({ codec: c, width: W, height: H, bitrate: taxa, framerate: FPS });
      if (ok.supported) { codec = c; break; }
    } catch { /* tenta o próximo */ }
  }
  if (!codec) throw new Error("Este navegador não faz vídeo MP4 neste tamanho.");
  const muxer = new Muxer({ target: new ArrayBufferTarget(), video: { codec: "avc", width: W, height: H }, fastStart: "in-memory" });
  let erroEnc: Error | null = null;
  const enc = new VideoEncoder({ output: (chunk, meta) => muxer.addVideoChunk(chunk, meta), error: (e) => { erroEnc = e as Error; } });
  enc.configure({ codec, width: W, height: H, bitrate: taxa, framerate: FPS });
  const c = document.createElement("canvas");
  c.width = W; c.height = H;
  const x = c.getContext("2d")!;
  x.imageSmoothingQuality = "high";
  const imgs = await Promise.all(paginas.map(carregar));
  const porPag = Math.round(segundosPorPagina * FPS);
  const total = porPag * imgs.length;
  for (let f = 0; f < total; f++) {
    if (erroEnc) throw erroEnc;
    const i = Math.floor(f / porPag), t = (f % porPag) / porPag;
    // zoom lento de 100% a 106%, centralizado
    const z = 1 + 0.06 * t;
    x.fillStyle = "#000"; x.fillRect(0, 0, W, H);
    x.drawImage(imgs[i], (W - W * z) / 2, (H - H * z) / 2, W * z, H * z);
    // troca de página com um esmaecido curto
    if (imgs.length > 1 && i < imgs.length - 1 && t > 0.88) {
      x.globalAlpha = (t - 0.88) / 0.12;
      x.drawImage(imgs[i + 1], 0, 0, W, H);
      x.globalAlpha = 1;
    }
    const quadro = new VideoFrame(c, { timestamp: Math.round((f * 1e6) / FPS), duration: Math.round(1e6 / FPS) });
    enc.encode(quadro, { keyFrame: f % (FPS * 2) === 0 });
    quadro.close();
    if (enc.encodeQueueSize > 8) await new Promise((r) => setTimeout(r, 0));
    if (f % 10 === 0) aoAvancar?.(f / total);
  }
  await enc.flush();
  enc.close();
  muxer.finalize();
  return new Blob([muxer.target.buffer], { type: "video/mp4" });
}
