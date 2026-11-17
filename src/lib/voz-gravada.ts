// Voz do próprio cliente para o vídeo: gravar pelo microfone (celular ou computador) ou enviar um áudio pronto.
// O áudio fica só na memória enquanto o editor está aberto (não vai para a biblioteca, para não ocupar espaço).
// Tudo vira WAV mono, sem o silêncio do começo e do fim e com o volume acertado, para juntar com a música no MP4.

export type VozGravada = { audio: ArrayBuffer; dur: number; origem: "gravada" | "enviada" | "ia"; url: string };

/** O vídeo começa a falar um pouco depois do início (dá tempo da primeira cena aparecer). */
export const INICIO_VOZ = 0.25;

const Ctx = () => window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;

/** Formato que o navegador sabe gravar: webm/opus (Chrome, Android) ou mp4/aac (iPhone). */
function formatoDeGravacao(): string {
  if (typeof MediaRecorder === "undefined") return "";
  for (const t of ["audio/webm;codecs=opus", "audio/webm", "audio/mp4", "audio/aac", "audio/ogg;codecs=opus"]) {
    try { if (MediaRecorder.isTypeSupported(t)) return t; } catch { /* próximo */ }
  }
  return "";
}

export const podeGravar = () => typeof navigator !== "undefined" && !!navigator.mediaDevices?.getUserMedia && typeof MediaRecorder !== "undefined";

/** Microfone aberto uma vez só: mede o volume durante a contagem e grava quando `gravar()` é chamado.
 *  (Abrir, fechar e abrir de novo em seguida falha em alguns computadores com Windows.) */
export type Microfone = { nivel: () => number; gravar: () => void; parar: () => Promise<Blob>; fechar: () => void };

/** Passos para liberar o microfone bloqueado, do jeito de cada aparelho (1ª linha = título, as outras = passos). */
function comoLiberar(): string {
  const ua = navigator.userAgent;
  if (/iPhone|iPad|iPod/i.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1))
    return "O microfone está bloqueado\n1. Toque em aA, no endereço do site\n2. Ajustes do site › Microfone › Permitir\n3. Toque em Tentar de novo";
  if (/Android/i.test(ua))
    return "O microfone está bloqueado\n1. Toque no ícone à esquerda do endereço do site\n2. Permissões › Microfone › Permitir\n3. Toque em Tentar de novo";
  return "O microfone está bloqueado\n1. Clique no ícone à esquerda do endereço do site\n2. Em Microfone, escolha Permitir\n3. Clique em Tentar de novo";
}

async function erroDoMicrofone(e: unknown): Promise<Error> {
  const nome = (e as Error)?.name;
  const msg = (e as Error)?.message || "";
  console.error("[narração] microfone:", e);
  if (nome === "NotAllowedError" || nome === "SecurityError") {
    // o computador ou o celular bloqueia o microfone para o navegador inteiro
    if (/system/i.test(msg)) return new Error("O aparelho bloqueia o microfone\n1. Abra os Ajustes do aparelho › Privacidade › Microfone\n2. Ligue o microfone para o navegador\n3. Clique em Tentar de novo");
    let estado = "";
    try { estado = (await navigator.permissions.query({ name: "microphone" as PermissionName })).state; } catch { /* Safari antigo */ }
    // a pessoa fechou a pergunta sem escolher: basta tentar de novo
    if (estado === "prompt") return new Error("Falta liberar o microfone\nToque em Tentar de novo e escolha Permitir.");
    return new Error(comoLiberar());
  }
  if (nome === "NotFoundError" || nome === "OverconstrainedError") return new Error("Não achei microfone\nConecte um microfone ou use o celular.");
  if (nome === "NotReadableError" || nome === "AbortError") return new Error("O microfone está ocupado\nFeche o outro programa que usa o microfone e tente de novo.");
  return new Error("Não consegui abrir o microfone\nTente de novo.");
}

export async function abrirMicrofone(): Promise<Microfone> {
  if (typeof window !== "undefined" && !window.isSecureContext) throw new Error("O microfone só funciona em site seguro\nAbra o site com https://");
  if (!podeGravar()) throw new Error("Este navegador não grava áudio\nUse o Chrome ou o Safari.");
  let stream: MediaStream;
  try {
    stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true } });
  } catch (e) {
    // alguns aparelhos recusam as opções: tenta o microfone simples antes de desistir
    if ((e as Error)?.name === "NotAllowedError" || (e as Error)?.name === "SecurityError") throw await erroDoMicrofone(e);
    try { stream = await navigator.mediaDevices.getUserMedia({ audio: true }); } catch (e2) { throw await erroDoMicrofone(e2); }
  }
  const tipo = formatoDeGravacao();
  let rec: MediaRecorder;
  try { rec = new MediaRecorder(stream, tipo ? { mimeType: tipo } : undefined); } catch { rec = new MediaRecorder(stream); }
  const partes: Blob[] = [];
  rec.ondataavailable = (e) => { if (e.data.size) partes.push(e.data); };
  // medidor de volume (se falhar, a gravação segue sem a barrinha)
  let medir = () => 0;
  let ac: AudioContext | null = null;
  try {
    ac = new (Ctx())();
    const analisador = ac.createAnalyser();
    analisador.fftSize = 512;
    ac.createMediaStreamSource(stream).connect(analisador);
    void ac.resume().catch(() => undefined);
    const amostras = new Uint8Array(analisador.fftSize);
    medir = () => {
      analisador.getByteTimeDomainData(amostras);
      let pico = 0;
      for (const v of amostras) pico = Math.max(pico, Math.abs(v - 128));
      return Math.min(1, pico / 90);
    };
  } catch { /* sem medidor */ }
  let fechado = false;
  const fechar = () => {
    if (fechado) return;
    fechado = true;
    try { if (rec.state !== "inactive") rec.stop(); } catch { /* já parado */ }
    stream.getTracks().forEach((t) => t.stop());
    ac?.close().catch(() => undefined);
  };
  return {
    nivel: medir,
    gravar: () => { if (rec.state === "inactive") rec.start(250); },
    parar: () => new Promise<Blob>((ok) => {
      const fim = () => { const b = new Blob(partes, { type: rec.mimeType || tipo || "audio/webm" }); fechar(); ok(b); };
      if (rec.state === "inactive") { fim(); return; }
      rec.onstop = fim;
      try { rec.stop(); } catch { fim(); }
    }),
    fechar,
  };
}

/** Lê qualquer áudio (gravado ou enviado), tira o silêncio das pontas, acerta o volume e devolve WAV mono. */
export async function prepararVoz(arquivo: Blob, origem: VozGravada["origem"]): Promise<VozGravada> {
  const ac = new (Ctx())();
  let b: AudioBuffer;
  try {
    b = await ac.decodeAudioData(await arquivo.arrayBuffer());
  } catch {
    throw new Error("Não consegui ler esse áudio. Use MP3, M4A, WAV ou grave aqui.");
  } finally {
    ac.close().catch(() => undefined);
  }
  // junta os canais em um
  const n = b.length, taxa = b.sampleRate;
  const mono = new Float32Array(n);
  for (let c = 0; c < b.numberOfChannels; c++) { const d = b.getChannelData(c); for (let i = 0; i < n; i++) mono[i] += d[i] / b.numberOfChannels; }
  // silêncio das pontas: procura onde o som passa de um limite, em janelas de 20 ms
  const jan = Math.round(taxa * 0.02);
  let pico = 0;
  for (let i = 0; i < n; i++) pico = Math.max(pico, Math.abs(mono[i]));
  if (pico < 0.01) throw new Error("O áudio ficou mudo. Confira se o microfone certo está ligado e grave de novo.");
  const limite = Math.max(0.012, pico * 0.06);
  const temSom = (ini: number) => { let m = 0; for (let i = ini; i < Math.min(n, ini + jan); i++) m = Math.max(m, Math.abs(mono[i])); return m > limite; };
  let ini = 0, fim = n;
  while (ini < n && !temSom(ini)) ini += jan;
  while (fim > ini && !temSom(Math.max(0, fim - jan))) fim -= jan;
  ini = Math.max(0, ini - Math.round(taxa * 0.08));
  fim = Math.min(n, fim + Math.round(taxa * 0.25));
  const corte = mono.subarray(ini, fim);
  // volume: pico em -1 dB, com 10 ms de entrada e saída suaves (sem estalo)
  const ganho = Math.min(6, 0.89 / pico);
  const suave = Math.round(taxa * 0.01);
  const out = new Float32Array(corte.length);
  for (let i = 0; i < corte.length; i++) {
    const borda = Math.min(1, i / suave, (corte.length - 1 - i) / suave);
    out[i] = Math.max(-1, Math.min(1, corte[i] * ganho * borda));
  }
  const audio = wavDe(out, taxa);
  return { audio, dur: out.length / taxa, origem, url: URL.createObjectURL(new Blob([audio], { type: "audio/wav" })) };
}

export function wavDe(d: Float32Array, taxa: number): ArrayBuffer {
  const buf = new ArrayBuffer(44 + d.length * 2);
  const v = new DataView(buf);
  const txt = (o: number, s: string) => { for (let i = 0; i < s.length; i++) v.setUint8(o + i, s.charCodeAt(i)); };
  txt(0, "RIFF"); v.setUint32(4, 36 + d.length * 2, true); txt(8, "WAVE");
  txt(12, "fmt "); v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, 1, true);
  v.setUint32(24, taxa, true); v.setUint32(28, taxa * 2, true); v.setUint16(32, 2, true); v.setUint16(34, 16, true);
  txt(36, "data"); v.setUint32(40, d.length * 2, true);
  for (let i = 0; i < d.length; i++) v.setInt16(44 + i * 2, Math.round(d[i] * 32767), true);
  return buf;
}

/** Junta as falas das cenas num texto só, para ler de uma vez (cada frase termina com ponto). */
export function textoCorrido(falas: string[]): string {
  return falas.map((f) => f.replace(/\s+/g, " ").trim()).filter(Boolean).map((f) => (/[.!?…]$/.test(f) ? f : f + ".")).join(" ");
}

/** Segundos para ler um texto em voz alta, num ritmo de anúncio (cerca de 2,6 palavras por segundo). */
export const tempoDeLeitura = (t: string) => {
  const p = t.trim() ? t.trim().split(/\s+/).length : 0;
  return p ? p / 2.6 + 0.6 : 0;
};
