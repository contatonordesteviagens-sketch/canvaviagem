import { useEffect, useRef, useState } from "react";
import { Muxer, ArrayBufferTarget } from "mp4-muxer";
import { supabase } from "@/integrations/supabase/client";
import { FabricaProvider, useFabricaContext, type Pacote } from "@/hooks/useFabricaContext";

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

type Pagamento = "installments" | "down_plus" | "cash" | "free_quote";

type Dados = {
  destino: string;
  chamada: string;
  pagamento: Pagamento;
  parcelas: string;
  entrada: string;
  preco: string;
  pessoas: string;
  itens: string[];
  agencia: string;
  whatsapp: string;
  instagram: string;
  facebook: string;
  email: string;
  site: string;
};

type Contato = "whatsapp" | "instagram" | "facebook" | "email" | "site";
const CONTATOS: { id: Contato; nome: string; cor: string; texto: string }[] = [
  { id: "whatsapp", nome: "WhatsApp", cor: "#25d366", texto: "#fff" },
  { id: "instagram", nome: "Instagram", cor: "#d62976", texto: "#fff" },
  { id: "facebook", nome: "Facebook", cor: "#1877f2", texto: "#fff" },
  { id: "email", nome: "E-mail", cor: "#ffffff", texto: "#14213d" },
  { id: "site", nome: "Site", cor: "#ffffff", texto: "#14213d" },
];

// Fundo de cada quadro: vídeo do destino ou, se faltar, foto com zoom.
type Fundo = HTMLVideoElement | HTMLImageElement;
const isVideo = (m: Fundo): m is HTMLVideoElement => m instanceof HTMLVideoElement;

const ease = (t: number) => 1 - Math.pow(1 - Math.min(Math.max(t, 0), 1), 3);
const back = (t: number) => {
  t = Math.min(Math.max(t, 0), 1);
  const c = 1.7;
  return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2);
};

function drawCover(ctx: CanvasRenderingContext2D, m: Fundo, zoom: number) {
  const mw = isVideo(m) ? m.videoWidth : m.naturalWidth;
  const mh = isVideo(m) ? m.videoHeight : m.naturalHeight;
  if (!mw) return;
  const s = Math.max(W / mw, H / mh) * zoom;
  const w = mw * s;
  const h = mh * s;
  ctx.drawImage(m, (W - w) / 2, (H - h) / 2, w, h);
}

function precoTextos(d: Dados): { topo: string; valor: string; rodape: string } {
  const semPreco = d.pagamento === "free_quote" || !d.preco.trim();
  if (semPreco) return { topo: "condições especiais", valor: "Consulte", rodape: "faça sua cotação" };
  if (d.pagamento === "installments") return { topo: `em até ${d.parcelas || "10x"} de`, valor: d.preco, rodape: d.pessoas };
  if (d.pagamento === "down_plus")
    return { topo: `entrada ${d.entrada || ""} + ${d.parcelas || "10x"} de`.replace(/\s+/g, " "), valor: d.preco, rodape: d.pessoas };
  return { topo: "a partir de", valor: d.preco, rodape: d.pessoas };
}

function contatoTexto(id: Contato, d: Dados) {
  if (id === "whatsapp") return d.whatsapp ? `WhatsApp ${d.whatsapp}` : "Chame no WhatsApp";
  if (id === "instagram") return d.instagram ? (d.instagram.startsWith("@") ? d.instagram : "@" + d.instagram) : "";
  if (id === "facebook") return d.facebook ? `fb.com/${d.facebook.replace(/^https?:\/\/(www\.)?facebook\.com\//, "")}` : "";
  if (id === "email") return d.email;
  return d.site.replace(/^https?:\/\//, "").replace(/\/$/, "");
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
  vids: Fundo[],
  d: Dados,
  logo: HTMLImageElement | null,
  contatos: Contato[],
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
    if (vids[i]) drawCover(ctx, vids[i], (isVideo(vids[i]) ? 1.04 : 1.0) + (isVideo(vids[i]) ? 0.08 : 0.16) * (local / SCENE));
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
    const pt = precoTextos(d);
    const ts = fitText(ctx, pt.topo.toUpperCase(), 800, 30, W - 120);
    ctx.font = `800 ${ts}px Montserrat, Arial`;
    ctx.fillStyle = "#fff";
    ctx.fillText(pt.topo.toUpperCase(), 0, -88);
    const ps = fitText(ctx, pt.valor, 900, 112, W - 120);
    ctx.font = `900 ${ps}px Montserrat, Arial`;
    const grad = ctx.createLinearGradient(-200, -60, 200, 20);
    grad.addColorStop(0, "#fff1c2");
    grad.addColorStop(0.5, GOLD);
    grad.addColorStop(1, "#d49a2a");
    ctx.shadowColor = "rgba(0,0,0,.5)";
    ctx.shadowBlur = 22;
    ctx.fillStyle = grad;
    ctx.fillText(pt.valor, 0, 10);
    ctx.shadowBlur = 0;
    ctx.font = "600 32px Montserrat, Arial";
    ctx.fillStyle = "#fff";
    ctx.fillText(pt.rodape, 0, 58);
    ctx.restore();
  }

  if (scene === 2) {
    const k = back(lt / 0.6);
    ctx.globalAlpha = keepLast * Math.min(1, lt / 0.3);
    // logo
    ctx.save();
    ctx.translate(W / 2, 470);
    ctx.scale(0.7 + 0.3 * k, 0.7 + 0.3 * k);
    ctx.beginPath();
    ctx.arc(0, 0, 135, 0, Math.PI * 2);
    ctx.fillStyle = "#fff";
    ctx.shadowColor = "rgba(0,0,0,.4)";
    ctx.shadowBlur = 40;
    ctx.fill();
    ctx.shadowBlur = 0;
    if (logo) {
      const s = Math.min(200 / logo.width, 200 / logo.height);
      ctx.drawImage(logo, (-logo.width * s) / 2, (-logo.height * s) / 2, logo.width * s, logo.height * s);
    } else {
      ctx.fillStyle = "#14213d";
      const sz = fitText(ctx, d.agencia, 900, 44, 230);
      ctx.font = `900 ${sz}px Montserrat, Arial`;
      ctx.fillText(d.agencia, 0, sz / 3);
    }
    ctx.restore();

    const k2 = ease((lt - 0.5) / 0.5);
    ctx.globalAlpha = k2;
    ctx.font = "900 58px Montserrat, Arial";
    ctx.fillStyle = "#fff";
    ctx.fillText("Garanta sua vaga", W / 2, 700 + (1 - k2) * 20);
    const pt = precoTextos(d);
    const resumo = pt.valor === "Consulte" ? d.destino : `${d.destino} · ${pt.topo === "a partir de" ? "" : pt.topo + " "}${pt.valor}`;
    const rs = fitText(ctx, resumo, 600, 32, W - 100);
    ctx.font = `600 ${rs}px Montserrat, Arial`;
    ctx.fillText(resumo, W / 2, 752 + (1 - k2) * 20);

    // contatos escolhidos, um embaixo do outro; o primeiro pulsa
    const lista = contatos.map((id) => ({ id, txt: contatoTexto(id, d) })).filter((c) => c.txt);
    lista.slice(0, 5).forEach((c, i) => {
      const info = CONTATOS.find((x) => x.id === c.id)!;
      const kc = ease((lt - 0.9 - i * 0.15) / 0.45);
      const pulse = i === 0 ? 1 + 0.035 * Math.sin((lt - 0.9) * 6) : 1;
      ctx.globalAlpha = kc;
      ctx.save();
      ctx.translate(W / 2, 860 + i * 84 + (1 - kc) * 20);
      ctx.scale(pulse, pulse);
      const fs = fitText(ctx, c.txt, 800, i === 0 ? 34 : 30, W - 160);
      ctx.font = `800 ${fs}px Montserrat, Arial`;
      const bw = Math.min(ctx.measureText(c.txt).width + 80, W - 80);
      roundRect(ctx, -bw / 2, -36, bw, 72, 36);
      if (c.id === "instagram") {
        const gi = ctx.createLinearGradient(-bw / 2, 0, bw / 2, 0);
        gi.addColorStop(0, "#feda75");
        gi.addColorStop(0.35, "#fa7e1e");
        gi.addColorStop(0.65, "#d62976");
        gi.addColorStop(1, "#4f5bd5");
        ctx.fillStyle = gi;
      } else ctx.fillStyle = info.cor;
      ctx.fill();
      ctx.fillStyle = info.texto;
      ctx.fillText(c.txt, 0, 11);
      ctx.restore();
    });
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

// Microfone do laboratório: com login usa a transcrição da Fábrica;
// sem login usa o reconhecimento de voz do próprio Chrome.
function Microfone({ onTexto, onAviso }: { onTexto: (t: string) => void; onAviso: (m: string) => void }) {
  const [ouvindo, setOuvindo] = useState(false);
  const [parcial, setParcial] = useState("");
  const recRef = useRef<{ stop: () => void } | null>(null);
  const textoRef = useRef("");

  function iniciar() {
    const SR = (window as unknown as { SpeechRecognition?: new () => any; webkitSpeechRecognition?: new () => any });
    const Ctor = SR.SpeechRecognition || SR.webkitSpeechRecognition;
    if (!Ctor) return onAviso("Este navegador não reconhece voz. Use o Chrome.");
    const rec = new Ctor();
    rec.lang = "pt-BR";
    rec.continuous = true;
    rec.interimResults = true;
    textoRef.current = "";
    rec.onresult = (e: any) => {
      let fim = "";
      let meio = "";
      for (let i = 0; i < e.results.length; i++) {
        if (e.results[i].isFinal) fim += e.results[i][0].transcript + " ";
        else meio += e.results[i][0].transcript;
      }
      textoRef.current = fim.trim();
      setParcial((fim + meio).trim());
    };
    rec.onerror = (e: any) => onAviso(e.error === "not-allowed" ? "O Chrome bloqueou o microfone. Clique no cadeado da barra de endereço e permita." : "Erro no microfone: " + e.error);
    rec.onend = () => {
      setOuvindo(false);
      const t = textoRef.current || "";
      if (t) onTexto(t);
      else onAviso("Não entendi nada no áudio. Tente de novo, falando perto do microfone.");
    };
    rec.start();
    recRef.current = rec;
    setOuvindo(true);
    setParcial("");
  }

  return (
    <div className="rounded-lg border border-neutral-700 p-3">
      <button
        id="microfone"
        className={`w-full rounded-xl px-4 py-4 text-lg font-bold ${ouvindo ? "animate-pulse bg-red-600" : "bg-violet-600"}`}
        onClick={() => (ouvindo ? recRef.current?.stop() : iniciar())}
      >
        {ouvindo ? "⏹ Parar e enviar" : "🎤 Gravar áudio do pacote"}
      </button>
      {parcial && <p className="mt-2 text-sm italic text-neutral-300">{parcial}</p>}
    </div>
  );
}

// Reduz a foto/print para mandar à IA (máx. 1600 px, JPEG).
function lerImagem(file: File): Promise<string> {
  return new Promise((ok, erro) => {
    const img = new Image();
    img.onload = () => {
      const s = Math.min(1, 1600 / Math.max(img.width, img.height));
      const c = document.createElement("canvas");
      c.width = Math.round(img.width * s);
      c.height = Math.round(img.height * s);
      c.getContext("2d")!.drawImage(img, 0, 0, c.width, c.height);
      ok(c.toDataURL("image/jpeg", 0.85));
    };
    img.onerror = () => erro(new Error("Não consegui abrir essa imagem."));
    img.src = URL.createObjectURL(file);
  });
}

function formatarTelefone(n: string) {
  const d = (n || "").replace(/\D/g, "").replace(/^55(?=\d{10,11}$)/, "");
  if (d.length === 11) return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
  if (d.length === 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return n || "";
}

// Monta o texto de um pacote da Fábrica para a IA.
function textoDoPacote(p: Pacote) {
  return [
    `Pacote: ${p.title}`,
    p.subtitle,
    p.description,
    p.duration && `Duração: ${p.duration}`,
    p.travelDates && `Datas: ${p.travelDates}`,
    p.price && `Preço: ${p.price}`,
    p.priceDetails && `Detalhes do preço: ${p.priceDetails}`,
    p.paymentTerms && `Pagamento: ${p.paymentTerms}`,
    p.accommodation && `Hospedagem: ${p.accommodation}`,
    p.included?.length && `Incluso: ${p.included.join(", ")}`,
    p.highlights?.length && `Destaques: ${p.highlights.join(", ")}`,
  ]
    .filter(Boolean)
    .join("\n");
}

const PACOTE_EXEMPLO: Pacote = {
  id: "exemplo",
  title: "Jericoacoara 5 dias",
  description: "Pacote para casal com as dunas e lagoas de Jeri",
  price: "10x de R$ 349",
  duration: "5 dias e 4 noites",
  included: ["Pousada com café da manhã", "Transfer Fortaleza–Jeri", "Passeio Rota Leste"],
};

type Entrada = "pacote" | "audio" | "texto" | "foto";

export default function VideoLab() {
  return (
    <FabricaProvider>
      <VideoLabTela />
    </FabricaProvider>
  );
}

function VideoLabTela() {
  const { state: fabrica, isHydrated } = useFabricaContext();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const vidsRef = useRef<Fundo[]>([]);
  const [entrada, setEntrada] = useState<Entrada>("audio");
  const [frase, setFrase] = useState("");
  const [foto, setFoto] = useState<string | null>(null);
  const [dados, setDados] = useState<Dados>({
    destino: "Cancún",
    chamada: "O Caribe mexicano te espera",
    pagamento: "cash",
    parcelas: "10x",
    entrada: "",
    preco: "R$ 8.000",
    pessoas: "para o casal",
    itens: ["Aéreo ida e volta", "Hotel all inclusive", "Traslados", "Seguro viagem"],
    agencia: "Sua Agência",
    whatsapp: "(11) 99999-9999",
    instagram: "",
    facebook: "",
    email: "",
    site: "",
  });
  const [contatos, setContatos] = useState<Contato[]>(["whatsapp"]);
  const [logo, setLogo] = useState<HTMLImageElement | null>(null);
  const [status, setStatus] = useState("Carregando vídeos…");
  const [url, setUrl] = useState<string | null>(null);
  const [gravando, setGravando] = useState(false);
  const [fontes, setFontes] = useState<{ videos: number; fotos: number } | null>(null);
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
  const contatosRef = useRef(contatos);
  dadosRef.current = dados;
  logoRef.current = logo;
  contatosRef.current = contatos;

  // Dados da agência que já estão na Fábrica: logo, nome e contatos.
  const perfilAplicado = useRef(false);
  useEffect(() => {
    if (!isHydrated || perfilAplicado.current) return;
    perfilAplicado.current = true;
    const social = fabrica.socialLinks || [];
    const fb = social.find((l) => l.type === "facebook")?.url || "";
    const site = social.find((l) => l.type === "site")?.url || "";
    setDados((d) => ({
      ...d,
      agencia: fabrica.agencyName || d.agencia,
      whatsapp: fabrica.whatsapp ? formatarTelefone(fabrica.whatsapp) : d.whatsapp,
      instagram: fabrica.instagram || d.instagram,
      email: fabrica.agencyEmail || d.email,
      facebook: fb || d.facebook,
      site: site || d.site,
    }));
    if (fabrica.logoBase64) {
      const img = new Image();
      img.onload = () => setLogo(img);
      img.src = fabrica.logoBase64;
    }
  }, [isHydrated, fabrica]);

  const pacotes = (fabrica.selectedPackages || []).filter((p) => p.title);

  // Carrega os 3 fundos (vídeos do destino ou fotos de reserva).
  async function carregarFundos(itens: { tipo: "video" | "foto"; url: string }[]) {
    setCarregando(true);
    const els: Fundo[] = itens.slice(0, 3).map((m) => {
      if (m.tipo === "foto") {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.src = m.url;
        return img;
      }
      const v = document.createElement("video");
      v.src = m.url;
      v.muted = true;
      v.playsInline = true;
      v.loop = true;
      v.crossOrigin = "anonymous";
      v.preload = "auto";
      return v;
    });
    try {
      await Promise.all(
        els.map(
          (el) =>
            new Promise((r, rej) => {
              if (isVideo(el)) el.addEventListener("canplay", r, { once: true });
              else el.addEventListener("load", r, { once: true });
              el.addEventListener("error", () => rej(new Error("Um vídeo do destino não carregou.")), { once: true });
            }),
        ),
      );
    } finally {
      setCarregando(false);
    }
    vidsRef.current.forEach((v) => {
      if (isVideo(v)) { v.pause(); v.removeAttribute("src"); v.load(); }
    });
    vidsRef.current = els;
    setStatus("Pronto");
  }

  async function enviar(conteudo: { text?: string; image?: string }) {
    const texto = (conteudo.text || "").trim();
    if (!conteudo.image && texto.length < 5) return setAviso("Mande o pacote: destino, preço e o que está incluso.");
    setOcupado(true);
    setAviso("");
    setEtapa(conteudo.image ? "Lendo a imagem do pacote…" : "Preenchendo as informações do pacote…");
    try {
      const { data: sess } = await supabase.auth.getSession();
      const { data, error } = await supabase.functions.invoke("fabrica-video-pronto", {
        body: { text: texto, image: conteudo.image },
        headers: sess.session ? undefined : { "x-video-lab": "sem-login" },
      });
      if (error) {
        let msg = "Não consegui preencher agora.";
        try { msg = (await (error as { context?: Response }).context?.json())?.error || msg; } catch { /* sem corpo */ }
        throw new Error(msg);
      }
      const d = data.dados as Partial<Dados>;
      setDados((a) => ({
        ...a,
        destino: d.destino || a.destino,
        chamada: d.chamada || a.chamada,
        // pacote novo substitui o anterior inteiro (sem sobrar preço do pacote antigo)
        pagamento: d.preco ? ((d.pagamento as Pagamento) || "cash") : "free_quote",
        parcelas: d.parcelas || "10x",
        entrada: d.entrada || "",
        preco: d.preco || "",
        pessoas: d.pessoas || "",
        itens: d.itens || [],
        agencia: a.agencia === "Sua Agência" && d.agencia ? d.agencia : a.agencia,
        whatsapp: d.whatsapp && !fabrica.whatsapp ? d.whatsapp : a.whatsapp,
        instagram: d.instagram && !a.instagram ? d.instagram : a.instagram,
      }));
      if (d.instagram && !contatosRef.current.includes("instagram")) setContatos((c) => [...c, "instagram"]);
      const midias: { tipo: "video" | "foto"; url: string }[] = data.midias || [];
      if (midias.length === 0) {
        setAviso(`Não achei vídeos de ${d.destino}. Mantive os atuais.`);
      } else {
        setEtapa(`Carregando vídeos de ${d.destino}…`);
        const lista = [...midias];
        while (lista.length < 3) lista.push(midias[lista.length % midias.length]);
        await carregarFundos(lista);
        const usadas = lista.slice(0, 3);
        setFontes({ videos: usadas.filter((m) => m.tipo === "video").length, fotos: usadas.filter((m) => m.tipo === "foto").length });
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
      await enviar({ text: texto });
    } catch (e) {
      setAviso((e as Error).message);
      setEtapa("");
      setOcupado(false);
    }
  }

  async function onFoto(file?: File | null) {
    if (!file) return;
    try {
      const img = await lerImagem(file);
      setFoto(img);
      await enviar({ image: img });
    } catch (e) {
      setAviso((e as Error).message);
    }
  }

  // Colar um print (Ctrl+V) em qualquer lugar da página manda a imagem.
  useEffect(() => {
    const colar = (e: ClipboardEvent) => {
      const item = [...(e.clipboardData?.items || [])].find((i) => i.type.startsWith("image/"));
      if (!item) return;
      e.preventDefault();
      setEntrada("foto");
      onFoto(item.getAsFile());
    };
    window.addEventListener("paste", colar);
    return () => window.removeEventListener("paste", colar);
  });

  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=Montserrat:wght@600;700;800;900&display=swap";
    document.head.appendChild(link);
    Promise.all([document.fonts.load("900 40px Montserrat"), carregarFundos(CLIPS.map((url) => ({ tipo: "video" as const, url })))]).catch((e) =>
      setStatus("Erro: " + e.message),
    );
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
          if (i === sc && isVideo(v)) { v.currentTime = 0; v.play(); }
        });
        lastScene = sc;
      }
      drawFrame(ctx, t, vidsRef.current, dadosRef.current, logoRef.current, contatosRef.current);
      raf = requestAnimationFrame(loop);
    };
    vidsRef.current.forEach((v) => isVideo(v) && v.play());
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
    vids.forEach((v) => isVideo(v) && v.pause());
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
      const seek = (v: Fundo, x: number) =>
        new Promise<void>((r) => {
          if (!isVideo(v)) return r();
          const alvo = x % Math.max(v.duration - 0.1, 0.5);
          if (Math.abs(v.currentTime - alvo) < 0.001) return r();
          v.addEventListener("seeked", () => r(), { once: true });
          v.currentTime = alvo;
        });
      const n = Math.round(TOTAL * FPS);
      for (let f = 0; f < n; f++) {
        const t = f / FPS;
        const ativos = [0, 1, 2].filter((i) => vids[i] && t >= i * SCENE - FADE && t <= (i + 1) * SCENE + FADE);
        await Promise.all(ativos.map((i) => seek(vids[i], Math.max(0, t - i * SCENE + FADE))));
        drawFrame(ctx, t, vids, dadosRef.current, logoRef.current, contatosRef.current);
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
  const rotulo = "text-xs text-neutral-400";
  const set = <K extends keyof Dados>(k: K, v: Dados[K]) => setDados((d) => ({ ...d, [k]: v }));
  const abas: { id: Entrada; nome: string }[] = [
    { id: "pacote", nome: "📦 Meus pacotes" },
    { id: "audio", nome: "🎤 Áudio" },
    { id: "texto", nome: "✍️ Texto" },
    { id: "foto", nome: "🖼️ Foto" },
  ];

  return (
    <div className="min-h-screen bg-neutral-950 p-4 text-white">
      <h1 className="mb-1 text-xl font-bold">Vídeo pronto (laboratório local)</h1>
      <p className="mb-4 text-sm text-neutral-400">Mande o pacote do jeito que preferir. A IA acha o destino, preenche tudo e busca os vídeos.</p>
      <div className="flex flex-col gap-6 lg:flex-row">
        <div className="flex w-full max-w-md flex-col gap-3">
          {/* 1. como mandar o pacote */}
          <div className="grid grid-cols-4 gap-1 rounded-xl bg-neutral-900 p-1">
            {abas.map((a) => (
              <button
                key={a.id}
                id={`aba-${a.id}`}
                onClick={() => setEntrada(a.id)}
                className={`rounded-lg px-1 py-2 text-xs font-semibold ${entrada === a.id ? "bg-violet-600" : "text-neutral-300"}`}
              >
                {a.nome}
              </button>
            ))}
          </div>

          {entrada === "pacote" && (
            <div className="flex flex-col gap-2">
              {(pacotes.length ? pacotes : [PACOTE_EXEMPLO]).map((p) => (
                <button
                  key={p.id}
                  disabled={ocupado}
                  onClick={() => enviar({ text: textoDoPacote(p) })}
                  className="rounded-lg border border-neutral-700 bg-neutral-900 p-3 text-left disabled:opacity-60"
                >
                  <p className="font-semibold">{p.title}</p>
                  <p className="text-xs text-neutral-400">{[p.price, p.duration].filter(Boolean).join(" · ")}</p>
                </button>
              ))}
              {!pacotes.length && <p className="text-xs text-neutral-500">Nenhum pacote salvo na Fábrica neste navegador. Mostrei um exemplo.</p>}
            </div>
          )}

          {entrada === "audio" &&
            (logado ? (
              <Gravador onAudio={onAudio} ocupado={ocupado} />
            ) : (
              <Microfone onTexto={(t) => { setFrase(t); enviar({ text: t }); }} onAviso={setAviso} />
            ))}

          {entrada === "texto" && (
            <>
              <textarea
                id="frase"
                className={campo}
                rows={5}
                placeholder="Cole aqui o pacote: destino, preço, parcelas, o que está incluso…"
                value={frase}
                onChange={(e) => setFrase(e.target.value)}
              />
              <button id="enviar" disabled={ocupado} className="rounded-lg bg-violet-600 px-4 py-2 font-semibold disabled:opacity-60" onClick={() => enviar({ text: frase })}>
                {ocupado ? "Aguarde…" : "Enviar"}
              </button>
            </>
          )}

          {entrada === "foto" && (
            <label className="flex cursor-pointer flex-col items-center gap-2 rounded-xl border-2 border-dashed border-neutral-700 p-5 text-center">
              {foto ? <img src={foto} alt="Pacote enviado" className="max-h-48 rounded-lg" /> : <span className="text-3xl">🖼️</span>}
              <span className="text-sm font-semibold">Mande a foto ou o print do pacote</span>
              <span className="text-xs text-neutral-400">Pode ser de operadora, de post ou do WhatsApp. Também dá para colar com Ctrl+V.</span>
              <input id="foto" type="file" accept="image/*" className="hidden" disabled={ocupado} onChange={(e) => onFoto(e.target.files?.[0])} />
            </label>
          )}

          {etapa && <p id="etapa" className="text-sm text-violet-300">{etapa}</p>}
          {aviso && <p id="aviso" className="rounded-lg bg-red-500/15 p-3 text-sm text-red-200">{aviso}</p>}
          {fontes && (
            <p id="fontes" className="text-xs text-neutral-500">
              Fundo: {fontes.videos} vídeo(s){fontes.fotos ? ` e ${fontes.fotos} foto(s)` : ""} do Pexels
            </p>
          )}

          {/* 2. o pacote */}
          <h2 className="mt-2 text-sm font-bold text-neutral-200">Pacote</h2>
          <div>
            <label className={rotulo}>Destino</label>
            <input id="campo-destino" className={campo} value={dados.destino} onChange={(e) => set("destino", e.target.value)} />
          </div>
          <div>
            <label className={rotulo}>Chamada</label>
            <input id="campo-chamada" className={campo} value={dados.chamada} onChange={(e) => set("chamada", e.target.value)} />
          </div>
          <div>
            <label className={rotulo}>Pagamento</label>
            <select id="campo-pagamento" className={campo} value={dados.pagamento} onChange={(e) => set("pagamento", e.target.value as Pagamento)}>
              <option value="installments">💳 Parcelado (ex.: 10x de R$ 349)</option>
              <option value="cash">💰 À vista / a partir de</option>
              <option value="down_plus">💵 Entrada + parcelas</option>
              <option value="free_quote">💬 Sem preço (consulte)</option>
            </select>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {(dados.pagamento === "installments" || dados.pagamento === "down_plus") && (
              <div>
                <label className={rotulo}>Parcelas</label>
                <input id="campo-parcelas" className={campo} value={dados.parcelas} onChange={(e) => set("parcelas", e.target.value)} />
              </div>
            )}
            {dados.pagamento === "down_plus" && (
              <div>
                <label className={rotulo}>Entrada</label>
                <input id="campo-entrada" className={campo} value={dados.entrada} onChange={(e) => set("entrada", e.target.value)} />
              </div>
            )}
            {dados.pagamento !== "free_quote" && (
              <div className={dados.pagamento === "cash" ? "col-span-3" : ""}>
                <label className={rotulo}>{dados.pagamento === "cash" ? "Preço" : "Valor da parcela"}</label>
                <input id="campo-preco" className={campo} value={dados.preco} onChange={(e) => set("preco", e.target.value)} />
              </div>
            )}
          </div>
          <div>
            <label className={rotulo}>Para quem</label>
            <input id="campo-pessoas" className={campo} value={dados.pessoas} onChange={(e) => set("pessoas", e.target.value)} />
          </div>
          <div>
            <label className={rotulo}>O que está incluso (um por linha, até 4)</label>
            <textarea id="campo-itens" className={campo} rows={4} value={dados.itens.join("\n")} onChange={(e) => set("itens", e.target.value.split("\n"))} />
          </div>

          {/* 3. a agência e os contatos do final */}
          <h2 className="mt-2 text-sm font-bold text-neutral-200">Final do vídeo</h2>
          <div>
            <label className={rotulo}>Agência</label>
            <input id="campo-agencia" className={campo} value={dados.agencia} onChange={(e) => set("agencia", e.target.value)} />
          </div>
          <p className={rotulo}>Contatos que aparecem no vídeo</p>
          {CONTATOS.map((c) => {
            const on = contatos.includes(c.id);
            return (
              <div key={c.id} className="flex items-center gap-2">
                <input
                  id={`usar-${c.id}`}
                  type="checkbox"
                  checked={on}
                  onChange={() => setContatos((l) => (on ? l.filter((x) => x !== c.id) : [...l, c.id]))}
                  className="h-4 w-4"
                />
                <span className="w-20 text-sm">{c.nome}</span>
                <input
                  id={`campo-${c.id}`}
                  className={campo}
                  placeholder={{ whatsapp: "(88) 99999-9999", instagram: "@suaagencia", facebook: "suaagencia", email: "contato@…", site: "suaagencia.com.br" }[c.id]}
                  value={dados[c.id]}
                  onChange={(e) => set(c.id, e.target.value)}
                />
              </div>
            );
          })}
          <div>
            <label className={rotulo}>Logo {fabrica.logoBase64 ? "(da Fábrica)" : ""}</label>
            <input type="file" accept="image/*" onChange={(e) => onLogo(e.target.files?.[0])} />
          </div>

          <button
            id="gerar"
            disabled={carregando || gravando || ocupado}
            className="mt-2 rounded-lg bg-amber-400 px-4 py-3 font-bold text-black disabled:opacity-50"
            onClick={gerar}
          >
            🎬 Gerar vídeo
          </button>
          <p id="status" className="text-sm text-neutral-300">{status}</p>
          {url && (
            <a id="baixar" className="rounded-lg bg-green-600 px-4 py-2 text-center font-semibold" href={url} download={`video-${dados.destino}.mp4`}>
              Baixar vídeo
            </a>
          )}
        </div>
        <div className="lg:sticky lg:top-4 lg:self-start">
          <canvas ref={canvasRef} width={W} height={H} className="w-full max-w-[360px] rounded-xl border border-neutral-800" />
        </div>
      </div>
    </div>
  );
}
