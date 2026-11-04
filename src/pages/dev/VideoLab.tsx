import { useEffect, useRef, useState } from "react";
import { Muxer, ArrayBufferTarget } from "mp4-muxer";
import { supabase } from "@/integrations/supabase/client";

// Laboratório local: monta um vídeo stories de 3 quadros no navegador,
// com vídeo real de fundo, textos animados, preço e logo da agência.
// Só existe em modo de desenvolvimento.

const W = 720;
const H = 1280;
const SCENE = 4.6; // segundos por quadro
const FADE = 0.5;
const TOTAL = SCENE * 3;

// Vídeos de Cancún do Pexels, usados até o agente mandar o pacote dele.
const CLIPS = [
  "https://videos.pexels.com/video-files/27556568/12167684_720_1280_60fps.mp4",
  "https://videos.pexels.com/video-files/28743484/12461846_720_1280_30fps.mp4",
  "https://videos.pexels.com/video-files/27785059/12224003_720_1280_60fps.mp4",
];

type Dados = {
  destino: string;
  chamada: string;
  preco: string;
  pessoas: string;
  itens: string[];
  agencia: string;
  whatsapp: string;
};

// Lê a frase do jeito que o cliente falaria no áudio.
function lerFrase(frase: string): Partial<Dados> {
  const out: Partial<Dados> = {};
  const dest = frase.match(/pacote\s+(?:para\s+|pra\s+|de\s+)?(.+?)(?=\s*(?:,|\.|r\$|\d|\s(?:por|para|pra|com|em)\s|$))/i);
  if (dest) out.destino = dest[1].trim();
  else {
    const alt = frase.match(/\b(?:para|pra|em)\s+((?:[A-ZÀ-Ú][\wÀ-ú]+)(?:\s+(?:de|do|da|dos|das)?\s*[A-ZÀ-Ú][\wÀ-ú]+)*)/);
    if (alt) out.destino = alt[1].trim();
  }
  const preco = frase.match(/r\$\s*([\d.,]+)|([\d.,]+)\s*(?:mil|reais)/i);
  if (preco) {
    let v = (preco[1] || preco[2]).replace(/\./g, "").replace(",", ".");
    let n = parseFloat(v);
    if (/mil/i.test(preco[0])) n *= 1000;
    if (!isNaN(n)) out.preco = "R$ " + n.toLocaleString("pt-BR", { maximumFractionDigits: 0 });
  }
  if (/casal/i.test(frase)) out.pessoas = "para o casal";
  else {
    const p = frase.match(/(\d+)\s*pessoas?/i);
    if (p) out.pessoas = `para ${p[1]} pessoas`;
  }
  return out;
}

const ease = (t: number) => 1 - Math.pow(1 - Math.min(Math.max(t, 0), 1), 3);
const back = (t: number) => {
  t = Math.min(Math.max(t, 0), 1);
  const c = 1.7;
  return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2);
};

function drawCover(ctx: CanvasRenderingContext2D, v: HTMLVideoElement, zoom: number) {
  if (!v.videoWidth) return;
  const s = Math.max(W / v.videoWidth, H / v.videoHeight) * zoom;
  const w = v.videoWidth * s;
  const h = v.videoHeight * s;
  ctx.drawImage(v, (W - w) / 2, (H - h) / 2, w, h);
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function fitText(ctx: CanvasRenderingContext2D, text: string, weight: number, max: number, maxW: number) {
  let size = max;
  do {
    ctx.font = `${weight} ${size}px Montserrat, Arial, sans-serif`;
    size -= 4;
  } while (ctx.measureText(text).width > maxW && size > 20);
  return size + 4;
}

const GOLD = "#f5c451";

function drawFrame(
  ctx: CanvasRenderingContext2D,
  t: number,
  vids: HTMLVideoElement[],
  d: Dados,
  logo: HTMLImageElement | null,
) {
  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, W, H);

  // fundo: vídeos com zoom lento e fusão entre quadros
  for (let i = 0; i < 3; i++) {
    const start = i * SCENE;
    const local = t - start;
    if (local < -FADE || local > SCENE + FADE) continue;
    const a = i === 0 ? 1 : ease((local + FADE) / FADE);
    ctx.globalAlpha = Math.min(a, 1);
    drawCover(ctx, vids[i], 1.04 + 0.08 * (local / SCENE));
  }
  ctx.globalAlpha = 1;

  const scene = Math.min(Math.floor(t / SCENE), 2);
  const lt = t - scene * SCENE;
  const out = 1 - ease((lt - (SCENE - 0.35)) / 0.35); // texto sai no fim do quadro
  const keepLast = scene === 2 ? 1 : out;

  // escurece para dar leitura
  const g = ctx.createLinearGradient(0, 0, 0, H);
  if (scene === 2) {
    g.addColorStop(0, "rgba(5,8,20,.55)");
    g.addColorStop(1, "rgba(5,8,20,.85)");
  } else {
    g.addColorStop(0, "rgba(0,0,0,.35)");
    g.addColorStop(0.45, "rgba(0,0,0,0)");
    g.addColorStop(0.7, "rgba(0,0,0,.25)");
    g.addColorStop(1, "rgba(0,0,0,.8)");
  }
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);

  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";

  if (scene === 0) {
    ctx.globalAlpha = out;
    // selo
    const p = ease(lt / 0.5);
    ctx.save();
    ctx.translate(0, (1 - p) * -30);
    ctx.globalAlpha = out * p;
    ctx.font = "800 26px Montserrat, Arial";
    const tag = "PACOTE COMPLETO";
    const tw = ctx.measureText(tag).width + 48;
    roundRect(ctx, (W - tw) / 2, 190, tw, 54, 27);
    ctx.fillStyle = GOLD;
    ctx.fill();
    ctx.fillStyle = "#1b1404";
    ctx.fillText(tag, W / 2, 227);
    ctx.restore();

    // destino com letras subindo
    const nome = d.destino.toUpperCase();
    const size = fitText(ctx, nome, 900, 150, W - 80);
    ctx.font = `900 ${size}px Montserrat, Arial`;
    const total = ctx.measureText(nome).width;
    let x = (W - total) / 2;
    ctx.textAlign = "left";
    for (let i = 0; i < nome.length; i++) {
      const ch = nome[i];
      const cw = ctx.measureText(ch).width;
      const k = back((lt - 0.25 - i * 0.05) / 0.5);
      ctx.globalAlpha = out * Math.min(1, Math.max(0, (lt - 0.25 - i * 0.05) / 0.25));
      ctx.save();
      ctx.translate(x + cw / 2, 1010);
      ctx.scale(1, 0.6 + 0.4 * k);
      ctx.shadowColor = "rgba(0,0,0,.45)";
      ctx.shadowBlur = 24;
      ctx.fillStyle = "#fff";
      ctx.fillText(ch, -cw / 2, (1 - k) * 60);
      ctx.restore();
      x += cw;
    }
    ctx.textAlign = "center";
    const s2 = ease((lt - 0.9) / 0.5);
    ctx.globalAlpha = out * s2;
    ctx.font = "600 38px Montserrat, Arial";
    ctx.fillStyle = "#fff";
    ctx.shadowColor = "rgba(0,0,0,.5)";
    ctx.shadowBlur = 16;
    ctx.fillText(d.chamada, W / 2, 1075 + (1 - s2) * 20);
    ctx.shadowBlur = 0;
  }

  if (scene === 1) {
    // lista do que está incluso
    ctx.textAlign = "left";
    const top = 640;
    d.itens.slice(0, 4).forEach((it, i) => {
      const k = ease((lt - 0.15 - i * 0.18) / 0.45);
      ctx.globalAlpha = out * k;
      const y = top + i * 82;
      const x = 70 - (1 - k) * 60;
      ctx.font = "700 34px Montserrat, Arial";
      const w = ctx.measureText(it).width + 110;
      roundRect(ctx, x, y - 50, w, 68, 34);
      ctx.fillStyle = "rgba(10,14,30,.62)";
      ctx.fill();
      ctx.beginPath();
      ctx.arc(x + 38, y - 16, 18, 0, Math.PI * 2);
      ctx.fillStyle = GOLD;
      ctx.fill();
      ctx.strokeStyle = "#1b1404";
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(x + 29, y - 16);
      ctx.lineTo(x + 36, y - 9);
      ctx.lineTo(x + 48, y - 24);
      ctx.stroke();
      ctx.fillStyle = "#fff";
      ctx.fillText(it, x + 72, y - 4);
    });
    ctx.textAlign = "center";

    // preço
    const pk = back((lt - 1.1) / 0.55);
    ctx.globalAlpha = out * Math.min(1, Math.max(0, (lt - 1.1) / 0.3));
    ctx.save();
    ctx.translate(W / 2, 1060);
    ctx.scale(0.6 + 0.4 * pk, 0.6 + 0.4 * pk);
    ctx.font = "700 30px Montserrat, Arial";
    ctx.fillStyle = "#fff";
    ctx.fillText("a partir de", 0, -88);
    const ps = fitText(ctx, d.preco, 900, 112, W - 120);
    ctx.font = `900 ${ps}px Montserrat, Arial`;
    const grad = ctx.createLinearGradient(-200, -60, 200, 20);
    grad.addColorStop(0, "#fff1c2");
    grad.addColorStop(0.5, GOLD);
    grad.addColorStop(1, "#d49a2a");
    ctx.shadowColor = "rgba(0,0,0,.5)";
    ctx.shadowBlur = 22;
    ctx.fillStyle = grad;
    ctx.fillText(d.preco, 0, 10);
    ctx.shadowBlur = 0;
    ctx.font = "600 32px Montserrat, Arial";
    ctx.fillStyle = "#fff";
    ctx.fillText(d.pessoas, 0, 58);
    ctx.restore();
  }

  if (scene === 2) {
    const k = back(lt / 0.6);
    ctx.globalAlpha = keepLast * Math.min(1, lt / 0.3);
    // logo
    ctx.save();
    ctx.translate(W / 2, 560);
    ctx.scale(0.7 + 0.3 * k, 0.7 + 0.3 * k);
    ctx.beginPath();
    ctx.arc(0, 0, 150, 0, Math.PI * 2);
    ctx.fillStyle = "#fff";
    ctx.shadowColor = "rgba(0,0,0,.4)";
    ctx.shadowBlur = 40;
    ctx.fill();
    ctx.shadowBlur = 0;
    if (logo) {
      const s = Math.min(220 / logo.width, 220 / logo.height);
      ctx.drawImage(logo, (-logo.width * s) / 2, (-logo.height * s) / 2, logo.width * s, logo.height * s);
    } else {
      ctx.fillStyle = "#14213d";
      const sz = fitText(ctx, d.agencia, 900, 44, 250);
      ctx.font = `900 ${sz}px Montserrat, Arial`;
      ctx.fillText(d.agencia, 0, sz / 3);
    }
    ctx.restore();

    const k2 = ease((lt - 0.5) / 0.5);
    ctx.globalAlpha = k2;
    ctx.font = "900 58px Montserrat, Arial";
    ctx.fillStyle = "#fff";
    ctx.fillText("Garanta sua vaga", W / 2, 820 + (1 - k2) * 20);
    ctx.font = "600 32px Montserrat, Arial";
    ctx.fillText(`${d.destino} ${d.pessoas}, ${d.preco}`, W / 2, 870 + (1 - k2) * 20);

    // botão do WhatsApp pulsando
    const k3 = ease((lt - 0.9) / 0.5);
    const pulse = 1 + 0.035 * Math.sin((lt - 0.9) * 6);
    ctx.globalAlpha = k3;
    ctx.save();
    ctx.translate(W / 2, 990);
    ctx.scale(pulse, pulse);
    ctx.font = "800 34px Montserrat, Arial";
    const label = `WhatsApp ${d.whatsapp}`;
    const bw = ctx.measureText(label).width + 90;
    roundRect(ctx, -bw / 2, -42, bw, 84, 42);
    ctx.fillStyle = "#25d366";
    ctx.fill();
    ctx.fillStyle = "#fff";
    ctx.fillText(label, 0, 12);
    ctx.restore();
  }
  ctx.globalAlpha = 1;
}

// Grava o áudio e transcreve com a mesma função da Fábrica.
async function transcrever(blob: Blob): Promise<string> {
  const { data: sess } = await supabase.auth.getSession();
  const token = sess.session?.access_token;
  if (!token) throw new Error("Entre na sua conta para usar o áudio.");
  const ext = blob.type.includes("webm") ? "webm" : "mp4";
  const fd = new FormData();
  fd.append("file", new File([blob], `audio.${ext}`, { type: blob.type }));
  const base = import.meta.env.VITE_SUPABASE_URL || "https://zdjtcwtakgizbsbbwtgc.supabase.co";
  const res = await fetch(`${base}/functions/v1/fabrica-transcribe-audio`, { method: "POST", headers: { Authorization: `Bearer ${token}` }, body: fd });
  const tipo = res.headers.get("Content-Type") || "";
  if (!res.ok) {
    const e = tipo.includes("json") ? await res.json().catch(() => ({})) : {};
    throw new Error(e.error || `Falha na transcrição (${res.status})`);
  }
  if (tipo.includes("application/json")) return ((await res.json()).text || "").trim();
  let texto = "";
  const reader = res.body!.getReader();
  const dec = new TextDecoder();
  let resto = "";
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    resto += dec.decode(value, { stream: true });
    const linhas = resto.split("\n");
    resto = linhas.pop() || "";
    for (const l of linhas) {
      if (!l.startsWith("data: ")) continue;
      try {
        const ev = JSON.parse(l.slice(6));
        if (ev.type === "transcript.text.delta") texto += ev.delta;
        else if (ev.type === "transcript.text.done") texto = ev.text;
      } catch { /* linha parcial */ }
    }
  }
  return texto.trim();
}

function Gravador({ onAudio, ocupado }: { onAudio: (b: Blob) => void; ocupado: boolean }) {
  const [gravando, setGravando] = useState(false);
  const [seg, setSeg] = useState(0);
  const recRef = useRef<MediaRecorder | null>(null);

  async function iniciar() {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mime = ["audio/webm", "audio/mp4"].find((t) => MediaRecorder.isTypeSupported(t)) || "";
    const rec = new MediaRecorder(stream, mime ? { mimeType: mime } : undefined);
    const partes: Blob[] = [];
    rec.ondataavailable = (e) => e.data.size && partes.push(e.data);
    rec.onstop = () => {
      stream.getTracks().forEach((t) => t.stop());
      onAudio(new Blob(partes, { type: rec.mimeType }));
    };
    rec.start();
    recRef.current = rec;
    setGravando(true);
    setSeg(0);
    const t0 = Date.now();
    const id = setInterval(() => {
      if (rec.state !== "recording") return clearInterval(id);
      setSeg(Math.round((Date.now() - t0) / 1000));
    }, 500);
  }

  return (
    <button
      id="microfone"
      disabled={ocupado}
      className={`w-full rounded-xl px-4 py-4 text-lg font-bold disabled:opacity-60 ${gravando ? "animate-pulse bg-red-600" : "bg-violet-600"}`}
      onClick={() => {
        if (gravando) { recRef.current?.stop(); setGravando(false); }
        else iniciar().catch(() => alert("O navegador bloqueou o microfone. Clique no cadeado da barra de endereço e permita."));
      }}
    >
      {gravando ? `⏹ Parar e enviar (${seg}s)` : "🎤 Gravar áudio do pacote"}
    </button>
  );
}

export default function VideoLab() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const vidsRef = useRef<HTMLVideoElement[]>([]);
  const [frase, setFrase] = useState("");
  const [dados, setDados] = useState<Dados>({
    destino: "Cancún",
    chamada: "O Caribe mexicano te espera",
    preco: "R$ 8.000",
    pessoas: "para o casal",
    itens: ["Aéreo ida e volta", "Hotel all inclusive", "Traslados", "Seguro viagem"],
    agencia: "Sua Agência",
    whatsapp: "(11) 99999-9999",
  });
  const [logo, setLogo] = useState<HTMLImageElement | null>(null);
  const [status, setStatus] = useState("Carregando vídeos…");
  const [url, setUrl] = useState<string | null>(null);
  const [gravando, setGravando] = useState(false);
  const [fontes, setFontes] = useState<string[]>([]);
  const [ocupado, setOcupado] = useState(false);
  const [etapa, setEtapa] = useState("");
  const [aviso, setAviso] = useState("");
  const [carregando, setCarregando] = useState(true);
  const [logado, setLogado] = useState<boolean | null>(null);
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setLogado(!!data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, sess) => setLogado(!!sess));
    return () => sub.subscription.unsubscribe();
  }, []);
  const dadosRef = useRef(dados);
  const logoRef = useRef(logo);
  dadosRef.current = dados;
  logoRef.current = logo;

  // Carrega os 3 vídeos de fundo (do Pexels ou os de teste).
  async function carregarClipes(urls: string[]) {
    setCarregando(true);
    const vids = urls.slice(0, 3).map((src) => {
      const v = document.createElement("video");
      v.src = src;
      v.muted = true;
      v.playsInline = true;
      v.loop = true;
      v.crossOrigin = "anonymous";
      v.preload = "auto";
      return v;
    });
    await Promise.all(vids.map((v) => new Promise((r, rej) => {
      v.addEventListener("canplay", r, { once: true });
      v.addEventListener("error", () => rej(new Error("vídeo não carregou")), { once: true });
    })));
    vidsRef.current.forEach((v) => { v.pause(); v.removeAttribute("src"); v.load(); });
    vidsRef.current = vids;
    setCarregando(false);
    setStatus("Pronto");
  }

  async function enviar(texto: string) {
    texto = texto.trim();
    if (texto.length < 5) return setAviso("Fale ou escreva o pacote: destino, preço e o que está incluso.");
    setOcupado(true);
    setAviso("");
    setEtapa("Preenchendo as informações do pacote…");
    try {
      const { data, error } = await supabase.functions.invoke("fabrica-video-pronto", { body: { text: texto } });
      if (error) {
        let msg = "Não consegui preencher agora.";
        try { msg = (await (error as { context?: Response }).context?.json())?.error || msg; } catch { /* sem corpo */ }
        if (/sess|login/i.test(msg)) msg = "Entre na sua conta para a IA preencher o pacote (link acima).";
        throw new Error(msg);
      }
      const d = data.dados as Dados;
      setDados((atual) => ({
        destino: d.destino || atual.destino,
        chamada: d.chamada || atual.chamada,
        preco: d.preco || atual.preco,
        pessoas: d.pessoas || atual.pessoas,
        itens: d.itens?.length ? d.itens : atual.itens,
        agencia: d.agencia || atual.agencia,
        whatsapp: d.whatsapp || atual.whatsapp,
      }));
      const lista: { url: string }[] = data.videos || [];
      if (lista.length === 0) {
        setAviso(`Não achei vídeos de ${d.destino}. Mantive os vídeos atuais.`);
      } else {
        setEtapa(`Carregando vídeos de ${d.destino}…`);
        const urls = lista.map((v) => v.url);
        while (urls.length < 3) urls.push(urls[urls.length % lista.length]);
        setFontes(urls.slice(0, 3));
        await carregarClipes(urls);
      }
      setEtapa("Pronto. Confira os campos e toque em Gerar vídeo.");
    } catch (e) {
      setAviso((e as Error).message);
      setEtapa("");
    }
    setOcupado(false);
  }

  async function onAudio(blob: Blob) {
    if (blob.size < 2000) return setAviso("O áudio ficou curto demais. Grave de novo.");
    setOcupado(true);
    setAviso("");
    setEtapa("Transcrevendo o áudio…");
    try {
      const texto = await transcrever(blob);
      if (!texto) throw new Error("Não entendi nada no áudio. Grave de novo, perto do microfone.");
      setFrase(texto);
      setOcupado(false);
      await enviar(texto);
    } catch (e) {
      setAviso((e as Error).message);
      setEtapa("");
      setOcupado(false);
    }
  }

  async function buscarVideos(destino: string) {
    setStatus(`Buscando vídeos de ${destino}…`);
    const { data, error } = await supabase.functions.invoke("fabrica-pexels-search", { body: { query: destino, kind: "video" } });
    const lista: { url: string }[] = data?.videos || [];
    if (error || lista.length < 3) {
      setStatus(error ? "Busca exige login de assinante. Mantive os vídeos atuais." : `Achei só ${lista.length} vídeo(s) de ${destino}. Mantive os atuais.`);
      return;
    }
    setFontes(lista.slice(0, 3).map((v) => v.url));
    await carregarClipes(lista.map((v) => v.url));
  }

  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=Montserrat:wght@600;700;800;900&display=swap";
    document.head.appendChild(link);
    Promise.all([document.fonts.load("900 40px Montserrat"), carregarClipes(CLIPS)]).catch((e) => setStatus("Erro: " + e.message));
    return () => link.remove();
  }, []);

  // prévia ao vivo, em loop
  useEffect(() => {
    if (carregando || gravando) return;
    const ctx = canvasRef.current!.getContext("2d")!;
    let raf = 0;
    const t0 = performance.now();
    let lastScene = -1;
    const loop = () => {
      const t = ((performance.now() - t0) / 1000) % TOTAL;
      const sc = Math.min(Math.floor(t / SCENE), 2);
      if (sc !== lastScene) {
        vidsRef.current.forEach((v, i) => {
          if (i === sc) { v.currentTime = 0; v.play(); }
        });
        lastScene = sc;
      }
      drawFrame(ctx, t, vidsRef.current, dadosRef.current, logoRef.current);
      raf = requestAnimationFrame(loop);
    };
    vidsRef.current.forEach((v) => v.play());
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [carregando, gravando]);


  // Gera quadro a quadro (não depende de a tela estar visível nem da velocidade do aparelho).
  async function gerar() {
    setGravando(true);
    setUrl(null);
    const FPS = 30;
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    const vids = vidsRef.current;
    vids.forEach((v) => v.pause());
    const t0 = performance.now();
    try {
      const codecs = ["avc1.4d0028", "avc1.640028", "avc1.42002a"];
      let codec = "";
      for (const c of codecs) {
        const ok = await VideoEncoder.isConfigSupported({ codec: c, width: W, height: H, bitrate: 6_000_000, framerate: FPS });
        if (ok.supported) { codec = c; break; }
      }
      if (!codec) throw new Error("Este navegador não gera MP4");
      const muxer = new Muxer({ target: new ArrayBufferTarget(), video: { codec: "avc", width: W, height: H }, fastStart: "in-memory" });
      const enc = new VideoEncoder({ output: (chunk, meta) => muxer.addVideoChunk(chunk, meta), error: (e) => { throw e; } });
      enc.configure({ codec, width: W, height: H, bitrate: 6_000_000, framerate: FPS });
      const seek = (v: HTMLVideoElement, x: number) =>
        new Promise<void>((r) => {
          const alvo = x % Math.max(v.duration - 0.1, 0.5);
          if (Math.abs(v.currentTime - alvo) < 0.001) return r();
          v.addEventListener("seeked", () => r(), { once: true });
          v.currentTime = alvo;
        });
      const n = Math.round(TOTAL * FPS);
      for (let f = 0; f < n; f++) {
        const t = f / FPS;
        const ativos = [0, 1, 2].filter((i) => t >= i * SCENE - FADE && t <= (i + 1) * SCENE + FADE);
        await Promise.all(ativos.map((i) => seek(vids[i], Math.max(0, t - i * SCENE + FADE))));
        drawFrame(ctx, t, vids, dadosRef.current, logoRef.current);
        const frame = new VideoFrame(canvas, { timestamp: Math.round((f * 1e6) / FPS), duration: Math.round(1e6 / FPS) });
        enc.encode(frame, { keyFrame: f % 60 === 0 });
        frame.close();
        if (f % 15 === 0) setStatus(`Gerando o vídeo… ${Math.round((f / n) * 100)}%`);
        if (enc.encodeQueueSize > 10) await new Promise((r) => setTimeout(r, 0));
      }
      await enc.flush();
      muxer.finalize();
      const blob = new Blob([muxer.target.buffer], { type: "video/mp4" });
      setUrl(URL.createObjectURL(blob));
      const seg = ((performance.now() - t0) / 1000).toFixed(1);
      (window as unknown as { __videoLab: unknown }).__videoLab = { size: blob.size, seg };
      setStatus(`Pronto: ${(blob.size / 1e6).toFixed(1)} MB, mp4, gerado em ${seg}s`);
    } catch (e) {
      setStatus("Erro: " + (e as Error).message);
    }
    setGravando(false);
  }

  function onLogo(f?: File) {
    if (!f) return;
    const img = new Image();
    img.onload = () => setLogo(img);
    img.src = URL.createObjectURL(f);
  }

  const campo = "w-full rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-white";
  const ext = "mp4";

  return (
    <div className="min-h-screen bg-neutral-950 p-4 text-white">
      <h1 className="mb-4 text-xl font-bold">Laboratório: vídeo pronto</h1>
      <div className="flex flex-col gap-6 lg:flex-row">
        <div className="flex w-full max-w-md flex-col gap-3">
          {logado === false && (
            <p className="rounded-lg bg-amber-500/15 p-3 text-sm text-amber-200">
              Para o áudio e a busca funcionarem, entre na sua conta em <a className="underline" href="/login?redirect=/admin-video-lab">/login</a>.
            </p>
          )}
          <p className="text-sm text-neutral-300">Fale o destino, o preço, para quem é e o que está incluso. A IA preenche tudo e busca os vídeos.</p>
          <Gravador onAudio={onAudio} ocupado={ocupado} />
          <label className="text-xs text-neutral-400">Ou escreva o pacote</label>
          <textarea id="frase" className={campo} rows={3} value={frase} onChange={(e) => setFrase(e.target.value)} />
          <button id="enviar" disabled={ocupado} className="rounded-lg bg-violet-600 px-4 py-2 font-semibold disabled:opacity-60" onClick={() => enviar(frase)}>
            {ocupado ? "Aguarde…" : "Enviar"}
          </button>
          {etapa && <p id="etapa" className="text-sm text-violet-300">{etapa}</p>}
          {aviso && <p id="aviso" className="rounded-lg bg-red-500/15 p-3 text-sm text-red-200">{aviso}</p>}
          {fontes.length > 0 && <p id="fontes" className="text-xs text-neutral-500">Vídeos do Pexels ({fontes.length})</p>}
          {(["destino", "chamada", "preco", "pessoas", "agencia", "whatsapp"] as const).map((k) => (
            <div key={k}>
              <label className="text-xs text-neutral-400">{k}</label>
              <input className={campo} value={dados[k]} onChange={(e) => setDados({ ...dados, [k]: e.target.value })} />
            </div>
          ))}
          <div>
            <label className="text-xs text-neutral-400">itens (um por linha)</label>
            <textarea className={campo} rows={4} value={dados.itens.join("\n")} onChange={(e) => setDados({ ...dados, itens: e.target.value.split("\n") })} />
          </div>
          <div>
            <label className="text-xs text-neutral-400">logo</label>
            <input type="file" accept="image/*" onChange={(e) => onLogo(e.target.files?.[0])} />
          </div>
          <button disabled={carregando || gravando || ocupado} className="rounded-lg bg-amber-400 px-4 py-3 font-bold text-black disabled:opacity-50" onClick={gerar}>
            Gerar vídeo
          </button>
          <p id="status" className="text-sm text-neutral-300">{status}</p>
          {url && (
            <a id="baixar" className="rounded-lg bg-green-600 px-4 py-2 text-center font-semibold" href={url} download={`video-${dados.destino}.${ext}`}>
              Baixar vídeo
            </a>
          )}
        </div>
        <canvas ref={canvasRef} width={W} height={H} className="w-full max-w-[360px] rounded-xl border border-neutral-800" />
      </div>
    </div>
  );
}
