import { useEffect, useRef, useState } from "react";
import { Muxer, ArrayBufferTarget } from "mp4-muxer";
import { supabase } from "@/integrations/supabase/client";
import { FabricaProvider, useFabricaContext, type Pacote } from "@/hooks/useFabricaContext";

// Laboratório local: monta um vídeo stories de 3 quadros no navegador,
// com vídeo real de fundo, textos animados, preço e logo da agência.
// Só existe em modo de desenvolvimento.

const W = 720;
const H = 1280;
// Telas do vídeo, na ordem. Cada uma tem o seu fundo (vídeo do destino ou foto).
type Tela = "abertura" | "inclusos" | "destaque" | "preco" | "contato";
const TELAS: { tipo: Tela; dur: number; nome: string }[] = [
  { tipo: "abertura", dur: 4.5, nome: "Abertura" },
  { tipo: "inclusos", dur: 3.8, nome: "O que inclui" },
  { tipo: "destaque", dur: 3.0, nome: "Cena extra 1" },
  { tipo: "destaque", dur: 3.0, nome: "Cena extra 2" },
  { tipo: "preco", dur: 3.8, nome: "Preço" },
  { tipo: "contato", dur: 4.2, nome: "Contato" },
];
const CENAS = TELAS.length;
const INICIOS = TELAS.map((_, i) => TELAS.slice(0, i).reduce((a, x) => a + x.dur, 0));
const FADE = 0.5;
const TOTAL = TELAS.reduce((a, x) => a + x.dur, 0);
const telaEm = (t: number) => {
  let i = 0;
  while (i < CENAS - 1 && t >= INICIOS[i + 1]) i++;
  return i;
};
// número antigo da tela em cada modelo: 0 destino, 1 inclusos, 2 preço, 3 contato
const CENA_MODELO: Record<Tela, number> = { abertura: 0, inclusos: 1, destaque: -1, preco: 2, contato: 3 };

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
  precoAntigo: string;
  pessoas: string;
  itens: string[];
  destaques: string[];
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
type Midia = { tipo: "video" | "foto"; url: string; thumb?: string; nome?: string };
const isVideo = (m: Fundo): m is HTMLVideoElement => m instanceof HTMLVideoElement;

const ease = (t: number) => 1 - Math.pow(1 - Math.min(Math.max(t, 0), 1), 3);
const back = (t: number) => {
  t = Math.min(Math.max(t, 0), 1);
  const c = 1.7;
  return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2);
};

function drawCover(ctx: CanvasRenderingContext2D, m: Fundo, zoom: number, alt = H) {
  const mw = isVideo(m) ? m.videoWidth : m.naturalWidth;
  const mh = isVideo(m) ? m.videoHeight : m.naturalHeight;
  if (!mw) return;
  const s = Math.max(W / mw, alt / mh) * zoom;
  const w = mw * s;
  const h = mh * s;
  ctx.drawImage(m, (W - w) / 2, (alt - h) / 2, w, h);
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

// ---------------- Tema: cores e fonte escolhidas pelo usuário (valem para todos os estilos) ----------------
let GOLD = "#f5c451";
let NEON = "#eaff2b";
let AZUL = "#1d4ed8";
let ROXO = "#7c3aed";
let ROSA = "#ec4899";
let TINTA = "#7c2d12";
let CARIMBO = "#c2410c";
let SOBRE_NEON = "#111";
let SOBRE_GOLD = "#1b1404";
let FONTE = "Montserrat";
// Textos 18% menores que o desenho original (pedido do Lucas: títulos e preço estavam grandes).
const ESCALA_TEXTO = 0.82;

type Tema = { c1?: string; c2?: string; fonte: string };
type Paleta = { id: string; nome: string; c1?: string; c2?: string };
const PALETAS: Paleta[] = [
  { id: "estilo", nome: "Do estilo" },
  { id: "marca", nome: "Da minha marca" },
  { id: "dourado", nome: "Dourado", c1: "#f5c451", c2: "#b45309" },
  { id: "neon", nome: "Amarelo", c1: "#eaff2b", c2: "#65a30d" },
  { id: "azul", nome: "Azul", c1: "#3b82f6", c2: "#0ea5e9" },
  { id: "roxo", nome: "Roxo e rosa", c1: "#8b5cf6", c2: ROSA },
  { id: "verde", nome: "Verde", c1: "#22c55e", c2: "#14b8a6" },
  { id: "vermelho", nome: "Vermelho", c1: "#ef4444", c2: "#f97316" },
  { id: "laranja", nome: "Laranja", c1: "#f97316", c2: "#facc15" },
  { id: "livre", nome: "Escolher" },
];
const FONTES = ["Montserrat", "Poppins", "Oswald", "Bebas Neue", "Nunito", "Raleway"];

function luz(hex: string) {
  const h = hex.replace("#", "");
  const n = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  const r = parseInt(n.slice(0, 2), 16) / 255;
  const g = parseInt(n.slice(2, 4), 16) / 255;
  const b = parseInt(n.slice(4, 6), 16) / 255;
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
const sobre = (hex: string) => (luz(hex) > 0.55 ? "#111" : "#fff");

function aplicarTema(tema: Tema) {
  const c1 = tema.c1;
  const c2 = tema.c2 || tema.c1;
  GOLD = c1 || "#f5c451";
  NEON = c1 || "#eaff2b";
  AZUL = c1 || "#1d4ed8";
  ROXO = c1 || "#7c3aed";
  ROSA = c2 || "#ec4899";
  TINTA = c1 ? (luz(c1) > 0.5 ? "#3f3f46" : c1) : "#7c2d12";
  CARIMBO = c1 || "#c2410c";
  SOBRE_NEON = sobre(NEON);
  SOBRE_GOLD = sobre(GOLD);
  FONTE = tema.fonte || "Montserrat";
}

// Toda vez que o desenho define uma fonte, aplica a escala do texto e a fonte escolhida.
function prepararCtx(ctx: CanvasRenderingContext2D) {
  const c = ctx as CanvasRenderingContext2D & { __tema?: boolean };
  if (c.__tema) return;
  const desc = Object.getOwnPropertyDescriptor(CanvasRenderingContext2D.prototype, "font")!;
  Object.defineProperty(ctx, "font", {
    configurable: true,
    get() {
      return desc.get!.call(this);
    },
    set(v: string) {
      let f = v.replace(/(\d+(?:\.\d+)?)px/, (_m, n) => `${(parseFloat(n) * ESCALA_TEXTO).toFixed(1)}px`);
      if (FONTE !== "Montserrat") f = f.replace(/Montserrat/g, `'${FONTE}'`);
      desc.set!.call(this, f);
    },
  });
  c.__tema = true;
}


// ---------------- Modelos de vídeo (4 telas: destino, inclusos, preço, contato) ----------------
type Modelo = "classico" | "neon" | "cartao" | "luxo" | "passagem" | "revista" | "postal" | "faixa" | "vibrante";
const MODELOS: { id: Modelo; nome: string; desc: string }[] = [
  { id: "classico", nome: "Clássico", desc: "Letras grandes sobre o vídeo" },
  { id: "neon", nome: "Neon", desc: "Faixas amarelas, estilo oferta" },
  { id: "cartao", nome: "Cartão", desc: "Cartão branco limpo" },
  { id: "luxo", nome: "Luxo", desc: "Título com serifa, elegante" },
  { id: "passagem", nome: "Passagem", desc: "Cartão de embarque" },
  { id: "revista", nome: "Revista", desc: "Editorial, letras finas" },
  { id: "postal", nome: "Postal", desc: "Moldura, selo e carimbo" },
  { id: "faixa", nome: "Faixa preta", desc: "Painel escuro embaixo" },
  { id: "vibrante", nome: "Vibrante", desc: "Roxo e rosa, divertido" },
];

const clamp01 = (t: number) => Math.min(Math.max(t, 0), 1);

function sombra(ctx: CanvasRenderingContext2D, blur = 18, cor = "rgba(0,0,0,.45)") {
  ctx.shadowColor = cor;
  ctx.shadowBlur = blur;
}
function semSombra(ctx: CanvasRenderingContext2D) {
  ctx.shadowBlur = 0;
}

function iconeCheck(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, fundo: string, traco: string) {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fillStyle = fundo;
  ctx.fill();
  ctx.strokeStyle = traco;
  ctx.lineWidth = Math.max(3, r / 3.6);
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(x - r * 0.45, y);
  ctx.lineTo(x - r * 0.08, y + r * 0.38);
  ctx.lineTo(x + r * 0.5, y - r * 0.4);
  ctx.stroke();
}

function contatosLista(d: Dados, contatos: Contato[]) {
  return contatos.map((id) => ({ id, txt: contatoTexto(id, d) })).filter((c) => c.txt).slice(0, 5);
}

// Pílulas de contato (usadas pelo Clássico e pelo Cartão)
function desenharPilulas(ctx: CanvasRenderingContext2D, d: Dados, contatos: Contato[], y0: number, lt: number, gap = 84) {
  contatosLista(d, contatos).forEach((c, i) => {
    const info = CONTATOS.find((x) => x.id === c.id)!;
    const kc = ease((lt - 0.9 - i * 0.15) / 0.45);
    const pulse = i === 0 ? 1 + 0.035 * Math.sin((lt - 0.9) * 6) : 1;
    ctx.globalAlpha = kc;
    ctx.save();
    ctx.translate(W / 2, y0 + i * gap + (1 - kc) * 20);
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
    ctx.textAlign = "center";
    ctx.fillText(c.txt, 0, 11);
    ctx.restore();
  });
  ctx.globalAlpha = 1;
}

function desenharLogo(ctx: CanvasRenderingContext2D, d: Dados, logo: HTMLImageElement | null, x: number, y: number, r: number, k: number, fundo = "#fff") {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(0.7 + 0.3 * k, 0.7 + 0.3 * k);
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, Math.PI * 2);
  ctx.fillStyle = fundo;
  sombra(ctx, 40, "rgba(0,0,0,.35)");
  ctx.fill();
  semSombra(ctx);
  if (logo) {
    const s = Math.min((r * 1.48) / logo.width, (r * 1.48) / logo.height);
    ctx.drawImage(logo, (-logo.width * s) / 2, (-logo.height * s) / 2, logo.width * s, logo.height * s);
  } else {
    ctx.fillStyle = "#14213d";
    ctx.textAlign = "center";
    const sz = fitText(ctx, d.agencia, 900, r / 3, r * 1.7);
    ctx.font = `900 ${sz}px Montserrat, Arial`;
    ctx.fillText(d.agencia, 0, sz / 3);
  }
  ctx.restore();
}

function textoPreco(ctx: CanvasRenderingContext2D, valor: string, x: number, y: number, max: number, maxW: number, cor: string | CanvasGradient) {
  const ps = fitText(ctx, valor, 900, max, maxW);
  ctx.font = `900 ${ps}px Montserrat, Arial`;
  ctx.fillStyle = cor;
  ctx.fillText(valor, x, y);
  return ps;
}

function gradOuro(ctx: CanvasRenderingContext2D) {
  const g = ctx.createLinearGradient(-200, -60, 200, 20);
  g.addColorStop(0, "#fff1c2");
  g.addColorStop(0.5, GOLD);
  g.addColorStop(1, "#d49a2a");
  return g;
}

// ---------- Clássico (o aprovado), agora com o preço em tela própria
function cenaClassico(ctx: CanvasRenderingContext2D, cena: number, lt: number, out: number, d: Dados, logo: HTMLImageElement | null, contatos: Contato[]) {
  ctx.textAlign = "center";
  if (cena === 0) {
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
    ctx.fillStyle = SOBRE_GOLD;
    ctx.fillText(tag, W / 2, 227);
    ctx.restore();
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
      ctx.globalAlpha = out * clamp01((lt - 0.25 - i * 0.05) / 0.25);
      ctx.save();
      ctx.translate(x + cw / 2, 1010);
      ctx.scale(1, 0.6 + 0.4 * k);
      sombra(ctx, 24);
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
    sombra(ctx, 16, "rgba(0,0,0,.5)");
    ctx.fillText(d.chamada, W / 2, 1075 + (1 - s2) * 20);
    semSombra(ctx);
  }
  if (cena === 1) {
    const t0 = ease(lt / 0.4);
    ctx.globalAlpha = out * t0;
    ctx.font = "900 50px Montserrat, Arial";
    ctx.fillStyle = "#fff";
    sombra(ctx, 18);
    ctx.fillText("O que está incluso", W / 2, 560);
    semSombra(ctx);
    ctx.textAlign = "left";
    const itens = d.itens.filter(Boolean).slice(0, 4);
    itens.forEach((it, i) => {
      const k = ease((lt - 0.25 - i * 0.18) / 0.45);
      ctx.globalAlpha = out * k;
      const y = 680 + i * 92;
      const x = 70 - (1 - k) * 60;
      ctx.font = "700 36px Montserrat, Arial";
      const w = Math.min(ctx.measureText(it).width + 116, W - 120);
      roundRect(ctx, x, y - 52, w, 74, 37);
      ctx.fillStyle = "rgba(10,14,30,.66)";
      ctx.fill();
      iconeCheck(ctx, x + 40, y - 15, 19, GOLD, "#1b1404");
      ctx.fillStyle = "#fff";
      ctx.fillText(it, x + 76, y - 2);
    });
    ctx.textAlign = "center";
  }
  if (cena === 2) {
    const pt = precoTextos(d);
    const pk = back((lt - 0.2) / 0.55);
    ctx.globalAlpha = out * clamp01((lt - 0.2) / 0.3);
    ctx.save();
    ctx.translate(W / 2, 760);
    ctx.scale(0.6 + 0.4 * pk, 0.6 + 0.4 * pk);
    const ts = fitText(ctx, pt.topo.toUpperCase(), 800, 38, W - 120);
    ctx.font = `800 ${ts}px Montserrat, Arial`;
    ctx.fillStyle = "#fff";
    sombra(ctx, 16);
    ctx.fillText(pt.topo.toUpperCase(), 0, -120);
    sombra(ctx, 26, "rgba(0,0,0,.5)");
    textoPreco(ctx, pt.valor, 0, 20, 150, W - 100, gradOuro(ctx));
    semSombra(ctx);
    ctx.font = "600 38px Montserrat, Arial";
    ctx.fillStyle = "#fff";
    sombra(ctx, 14);
    ctx.fillText(pt.rodape, 0, 90);
    semSombra(ctx);
    ctx.restore();
  }
  if (cena === 3) {
    const k = back(lt / 0.6);
    ctx.globalAlpha = clamp01(lt / 0.3);
    desenharLogo(ctx, d, logo, W / 2, 470, 135, k);
    const k2 = ease((lt - 0.5) / 0.5);
    ctx.globalAlpha = k2;
    ctx.textAlign = "center";
    ctx.font = "900 58px Montserrat, Arial";
    ctx.fillStyle = "#fff";
    ctx.fillText("Garanta sua vaga", W / 2, 700 + (1 - k2) * 20);
    const pt = precoTextos(d);
    const resumo = pt.valor === "Consulte" ? d.destino : `${d.destino} · ${pt.topo === "a partir de" ? "" : pt.topo + " "}${pt.valor}`;
    const rs = fitText(ctx, resumo, 600, 32, W - 100);
    ctx.font = `600 ${rs}px Montserrat, Arial`;
    ctx.fillText(resumo, W / 2, 752 + (1 - k2) * 20);
    desenharPilulas(ctx, d, contatos, 860, lt);
  }
}

// ---------- Neon: faixas amarelas que entram de lado, texto preto
function faixaNeon(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, k: number, cor = NEON) {
  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, w * k, h);
  ctx.clip();
  ctx.fillStyle = cor;
  ctx.fillRect(x, y, w, h);
  ctx.restore();
}
function cenaNeon(ctx: CanvasRenderingContext2D, cena: number, lt: number, out: number, d: Dados, logo: HTMLImageElement | null, contatos: Contato[]) {
  ctx.textAlign = "left";
  const k1 = ease(lt / 0.45);
  if (cena === 0) {
    ctx.globalAlpha = out;
    faixaNeon(ctx, 0, 300, W - 60, 300, k1);
    if (k1 > 0.6) {
      const kt = ease((lt - 0.3) / 0.4);
      ctx.globalAlpha = out * kt;
      ctx.font = "800 24px Montserrat, Arial";
      roundRect(ctx, 50, 330, ctx.measureText("OFERTA ESPECIAL").width + 44, 50, 25);
      ctx.fillStyle = SOBRE_NEON;
      ctx.fill();
      ctx.fillStyle = NEON;
      ctx.fillText("OFERTA ESPECIAL", 72, 364);
      ctx.fillStyle = SOBRE_NEON;
      ctx.font = "800 46px Montserrat, Arial";
      ctx.fillText("Pacote", 50, 450 + (1 - kt) * 20);
      const s = fitText(ctx, d.destino, 900, 104, W - 140);
      ctx.font = `900 ${s}px Montserrat, Arial`;
      ctx.fillText(d.destino, 46, 545 + (1 - kt) * 20);
    }
    const kc = ease((lt - 0.8) / 0.4);
    ctx.globalAlpha = out * kc;
    ctx.font = "800 34px Montserrat, Arial";
    const cw = Math.min(ctx.measureText(d.chamada).width + 60, W - 80);
    faixaNeon(ctx, 0, 620, cw, 70, kc, SOBRE_NEON);
    ctx.fillStyle = "#fff";
    ctx.fillText(d.chamada, 30, 667);
  }
  if (cena === 1) {
    ctx.globalAlpha = out;
    faixaNeon(ctx, 0, 380, W - 60, 110, k1, SOBRE_NEON);
    ctx.globalAlpha = out * k1;
    ctx.fillStyle = NEON;
    ctx.font = "900 52px Montserrat, Arial";
    ctx.fillText("Está incluso", 50, 455);
    d.itens.filter(Boolean).slice(0, 4).forEach((it, i) => {
      const k = ease((lt - 0.3 - i * 0.16) / 0.4);
      ctx.globalAlpha = out * k;
      const y = 510 + i * 96;
      ctx.font = "800 38px Montserrat, Arial";
      const w = Math.min(ctx.measureText(it).width + 120, W - 60);
      faixaNeon(ctx, 0, y, w, 80, k);
      iconeCheck(ctx, 52, y + 40, 20, SOBRE_NEON, NEON);
      ctx.fillStyle = SOBRE_NEON;
      ctx.fillText(it, 90, y + 53);
    });
  }
  if (cena === 2) {
    const pt = precoTextos(d);
    ctx.globalAlpha = out;
    faixaNeon(ctx, 0, 420, W, 380, k1);
    const kp = back((lt - 0.35) / 0.5);
    ctx.globalAlpha = out * clamp01((lt - 0.3) / 0.25);
    ctx.textAlign = "center";
    ctx.fillStyle = SOBRE_NEON;
    const ts = fitText(ctx, pt.topo.toUpperCase(), 800, 40, W - 100);
    ctx.font = `800 ${ts}px Montserrat, Arial`;
    ctx.fillText(pt.topo.toUpperCase(), W / 2, 520);
    ctx.save();
    ctx.translate(W / 2, 680);
    ctx.scale(0.7 + 0.3 * kp, 0.7 + 0.3 * kp);
    textoPreco(ctx, pt.valor, 0, 0, 160, W - 80, SOBRE_NEON);
    ctx.restore();
    ctx.font = "700 36px Montserrat, Arial";
    ctx.fillText(pt.rodape, W / 2, 760);
  }
  if (cena === 3) {
    ctx.globalAlpha = 1;
    faixaNeon(ctx, 0, 0, W, H, ease(lt / 0.5), "rgba(10,10,10,.82)");
    const k = back((lt - 0.2) / 0.6);
    ctx.globalAlpha = clamp01((lt - 0.2) / 0.3);
    desenharLogo(ctx, d, logo, W / 2, 400, 125, k);
    const k2 = ease((lt - 0.5) / 0.5);
    ctx.globalAlpha = k2;
    ctx.textAlign = "center";
    ctx.font = "900 64px Montserrat, Arial";
    ctx.fillStyle = NEON;
    ctx.fillText("RESERVE AGORA", W / 2, 620);
    ctx.font = "700 32px Montserrat, Arial";
    ctx.fillStyle = "#fff";
    ctx.fillText(`Pacote ${d.destino}`, W / 2, 672);
    contatosLista(d, contatos).forEach((c, i) => {
      const kc = ease((lt - 0.8 - i * 0.15) / 0.4);
      ctx.globalAlpha = kc;
      const y = 760 + i * 92;
      ctx.font = "800 34px Montserrat, Arial";
      const w = Math.min(ctx.measureText(c.txt).width + 90, W - 80);
      const x = (W - w) / 2;
      faixaNeon(ctx, x, y, w, 76, kc, i === 0 ? NEON : "#fff");
      ctx.fillStyle = SOBRE_NEON;
      ctx.fillText(c.txt, W / 2, y + 50);
    });
  }
  ctx.globalAlpha = 1;
}

// ---------- Cartão: cartão branco central que troca de conteúdo
function cartao(ctx: CanvasRenderingContext2D, y: number, h: number, k: number) {
  const w = W - 100;
  ctx.save();
  ctx.translate(W / 2, y + h / 2);
  ctx.scale(0.85 + 0.15 * k, 0.85 + 0.15 * k);
  sombra(ctx, 50, "rgba(0,0,0,.35)");
  roundRect(ctx, -w / 2, -h / 2, w, h, 36);
  ctx.fillStyle = "#fff";
  ctx.fill();
  semSombra(ctx);
  ctx.restore();
}
function seloAmarelo(ctx: CanvasRenderingContext2D, txt: string, cx: number, y: number) {
  ctx.font = "800 22px Montserrat, Arial";
  const w = ctx.measureText(txt).width + 40;
  roundRect(ctx, cx - w / 2, y, w, 44, 22);
  ctx.fillStyle = NEON;
  ctx.fill();
  ctx.fillStyle = SOBRE_NEON;
  ctx.textAlign = "center";
  ctx.fillText(txt, cx, y + 30);
}
function cenaCartao(ctx: CanvasRenderingContext2D, cena: number, lt: number, out: number, d: Dados, logo: HTMLImageElement | null, contatos: Contato[]) {
  const k = back(lt / 0.55);
  ctx.globalAlpha = out * clamp01(lt / 0.25);
  ctx.textAlign = "center";
  if (cena === 0) {
    cartao(ctx, 330, 330, k);
    seloAmarelo(ctx, "OFERTA ESPECIAL", W / 2, 305);
    const s = fitText(ctx, d.destino, 900, 96, W - 180);
    ctx.font = `900 ${s}px Montserrat, Arial`;
    ctx.fillStyle = "#111";
    ctx.fillText(d.destino, W / 2, 490);
    const s2 = fitText(ctx, d.chamada, 600, 34, W - 180);
    ctx.font = `600 ${s2}px Montserrat, Arial`;
    ctx.fillStyle = "#555";
    ctx.fillText(d.chamada, W / 2, 560);
  }
  if (cena === 1) {
    const itens = d.itens.filter(Boolean).slice(0, 4);
    const h = 170 + itens.length * 84;
    cartao(ctx, 300, h, k);
    ctx.font = "900 44px Montserrat, Arial";
    ctx.fillStyle = "#111";
    ctx.fillText("Está incluso", W / 2, 390);
    ctx.textAlign = "left";
    itens.forEach((it, i) => {
      const ki = ease((lt - 0.3 - i * 0.15) / 0.4);
      ctx.globalAlpha = out * ki;
      const y = 470 + i * 84;
      iconeCheck(ctx, 110, y - 12, 20, "#111", NEON);
      const fs = fitText(ctx, it, 700, 36, W - 260);
      ctx.font = `700 ${fs}px Montserrat, Arial`;
      ctx.fillStyle = "#222";
      ctx.fillText(it, 148, y);
    });
  }
  if (cena === 2) {
    const pt = precoTextos(d);
    cartao(ctx, 360, 380, k);
    seloAmarelo(ctx, d.destino.toUpperCase().slice(0, 28), W / 2, 335);
    ctx.font = "800 30px Montserrat, Arial";
    ctx.fillStyle = "#555";
    ctx.fillText(pt.topo.toUpperCase(), W / 2, 460);
    const kp = back((lt - 0.35) / 0.5);
    ctx.save();
    ctx.translate(W / 2, 590);
    ctx.scale(0.7 + 0.3 * kp, 0.7 + 0.3 * kp);
    textoPreco(ctx, pt.valor, 0, 0, 140, W - 200, "#111");
    ctx.restore();
    ctx.font = "600 32px Montserrat, Arial";
    ctx.fillStyle = "#555";
    ctx.fillText(pt.rodape, W / 2, 665);
  }
  if (cena === 3) {
    ctx.globalAlpha = 1;
    cartao(ctx, 260, 820, ease(lt / 0.5));
    desenharLogo(ctx, d, logo, W / 2, 420, 110, back(lt / 0.6), "#f4f4f4");
    const k2 = ease((lt - 0.4) / 0.5);
    ctx.globalAlpha = k2;
    ctx.textAlign = "center";
    ctx.font = "900 54px Montserrat, Arial";
    ctx.fillStyle = "#111";
    ctx.fillText("Garanta sua vaga", W / 2, 610);
    ctx.font = "600 30px Montserrat, Arial";
    ctx.fillStyle = "#555";
    ctx.fillText(`Pacote ${d.destino}`, W / 2, 658);
    desenharPilulas(ctx, d, contatos, 760, lt, 80);
  }
  ctx.globalAlpha = 1;
}

// ---------- Luxo: título com serifa, linhas finas, dourado
function cenaLuxo(ctx: CanvasRenderingContext2D, cena: number, lt: number, out: number, d: Dados, logo: HTMLImageElement | null, contatos: Contato[]) {
  ctx.textAlign = "center";
  const serif = "'Playfair Display', Georgia, serif";
  const linha = (y: number, k: number) => {
    ctx.strokeStyle = GOLD;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(W / 2 - 160 * k, y);
    ctx.lineTo(W / 2 + 160 * k, y);
    ctx.stroke();
  };
  if (cena === 0) {
    const k = ease(lt / 1.0);
    ctx.globalAlpha = out * k;
    ctx.font = "600 26px Montserrat, Arial";
    ctx.fillStyle = "#fff";
    (ctx as unknown as { letterSpacing: string }).letterSpacing = "8px";
    ctx.fillText("OFERTA ESPECIAL", W / 2, 800);
    (ctx as unknown as { letterSpacing: string }).letterSpacing = "0px";
    linha(830, k);
    const s = fitText(ctx, d.destino.toUpperCase(), 700, 110, W - 80);
    ctx.font = `700 ${s}px ${serif}`;
    sombra(ctx, 24);
    ctx.globalAlpha = out * ease((lt - 0.3) / 1.0);
    ctx.fillText(d.destino.toUpperCase(), W / 2, 950 + (1 - ease((lt - 0.3) / 1.0)) * 30);
    semSombra(ctx);
    ctx.globalAlpha = out * ease((lt - 1.0) / 0.8);
    ctx.font = `italic 400 40px ${serif}`;
    ctx.fillText(d.chamada, W / 2, 1020);
  }
  if (cena === 1) {
    ctx.globalAlpha = out * ease(lt / 0.6);
    ctx.font = `italic 400 54px ${serif}`;
    ctx.fillStyle = "#fff";
    sombra(ctx, 20);
    ctx.fillText("A experiência inclui", W / 2, 560);
    semSombra(ctx);
    linha(600, ease(lt / 0.8));
    d.itens.filter(Boolean).slice(0, 4).forEach((it, i) => {
      const k = ease((lt - 0.4 - i * 0.22) / 0.6);
      ctx.globalAlpha = out * k;
      const fs = fitText(ctx, it, 500, 40, W - 120);
      ctx.font = `500 ${fs}px Montserrat, Arial`;
      ctx.fillStyle = "#fff";
      sombra(ctx, 14);
      ctx.fillText(it, W / 2, 700 + i * 80 + (1 - k) * 16);
      semSombra(ctx);
      if (i < Math.min(d.itens.filter(Boolean).length, 4) - 1) {
        ctx.fillStyle = GOLD;
        ctx.beginPath();
        ctx.arc(W / 2, 700 + i * 80 + 38, 4, 0, Math.PI * 2);
        ctx.fill();
      }
    });
  }
  if (cena === 2) {
    const pt = precoTextos(d);
    const k = ease(lt / 0.8);
    ctx.globalAlpha = out * k;
    ctx.fillStyle = "#fff";
    ctx.font = `italic 400 44px ${serif}`;
    sombra(ctx, 16);
    ctx.fillText(pt.topo, W / 2, 640);
    linha(680, k);
    const kp = ease((lt - 0.3) / 0.8);
    ctx.globalAlpha = out * kp;
    sombra(ctx, 26, "rgba(0,0,0,.5)");
    const ps = fitText(ctx, pt.valor, 700, 140, W - 100);
    ctx.font = `700 ${ps}px ${serif}`;
    ctx.save();
    ctx.translate(W / 2, 830);
    ctx.fillStyle = gradOuro(ctx);
    ctx.fillText(pt.valor, 0, 0);
    ctx.restore();
    semSombra(ctx);
    ctx.font = "500 34px Montserrat, Arial";
    ctx.fillStyle = "#fff";
    ctx.fillText(pt.rodape, W / 2, 900);
  }
  if (cena === 3) {
    ctx.globalAlpha = clamp01(lt / 0.5);
    desenharLogo(ctx, d, logo, W / 2, 470, 125, ease(lt / 0.8));
    const k2 = ease((lt - 0.5) / 0.7);
    ctx.globalAlpha = k2;
    ctx.font = `700 64px ${serif}`;
    ctx.fillStyle = "#fff";
    ctx.fillText("Reserve sua viagem", W / 2, 700);
    linha(735, k2);
    contatosLista(d, contatos).forEach((c, i) => {
      const kc = ease((lt - 0.9 - i * 0.18) / 0.5);
      ctx.globalAlpha = kc;
      const y = 820 + i * 80;
      const fs = fitText(ctx, c.txt, 600, 34, W - 200);
      ctx.font = `600 ${fs}px Montserrat, Arial`;
      const w = Math.min(ctx.measureText(c.txt).width + 80, W - 100);
      roundRect(ctx, (W - w) / 2, y - 46, w, 66, 33);
      ctx.strokeStyle = i === 0 ? GOLD : "rgba(255,255,255,.7)";
      ctx.lineWidth = 2.5;
      ctx.stroke();
      if (i === 0) {
        ctx.fillStyle = "rgba(245,196,81,.18)";
        ctx.fill();
      }
      ctx.fillStyle = i === 0 ? GOLD : "#fff";
      ctx.fillText(c.txt, W / 2, y);
    });
  }
  ctx.globalAlpha = 1;
}

// ---------- Passagem: cartão de embarque
function bilhete(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, corte: number) {
  ctx.save();
  sombra(ctx, 40, "rgba(0,0,0,.35)");
  roundRect(ctx, x, y, w, h, 28);
  ctx.fillStyle = "#fff";
  ctx.fill();
  semSombra(ctx);
  // furos laterais e linha picotada
  ctx.globalCompositeOperation = "destination-out";
  ctx.beginPath();
  ctx.arc(x, y + corte, 22, 0, Math.PI * 2);
  ctx.arc(x + w, y + corte, 22, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalCompositeOperation = "source-over";
  ctx.setLineDash([12, 10]);
  ctx.strokeStyle = "#c9c9c9";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(x + 34, y + corte);
  ctx.lineTo(x + w - 34, y + corte);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.restore();
}
function aviao(ctx: CanvasRenderingContext2D, x: number, y: number, s: number, cor: string) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s, s);
  ctx.fillStyle = cor;
  ctx.beginPath();
  ctx.moveTo(-20, 2); ctx.lineTo(18, 2); ctx.quadraticCurveTo(26, 0, 18, -2); ctx.lineTo(-20, -2); ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.moveTo(2, -2); ctx.lineTo(-6, -16); ctx.lineTo(-1, -16); ctx.lineTo(10, -2); ctx.fill();
  ctx.beginPath(); ctx.moveTo(2, 2); ctx.lineTo(-6, 16); ctx.lineTo(-1, 16); ctx.lineTo(10, 2); ctx.fill();
  ctx.beginPath(); ctx.moveTo(-16, -2); ctx.lineTo(-20, -9); ctx.lineTo(-17, -9); ctx.lineTo(-12, -2); ctx.fill();
  ctx.restore();
}
function cenaPassagem(ctx: CanvasRenderingContext2D, cena: number, lt: number, out: number, d: Dados, logo: HTMLImageElement | null, contatos: Contato[]) {
  const k = back(lt / 0.55);
  const x = 60, w = W - 120;
  ctx.globalAlpha = out * clamp01(lt / 0.25);
  ctx.save();
  ctx.translate(0, (1 - k) * 120);
  if (cena === 0) {
    bilhete(ctx, x, 330, w, 420, 250);
    ctx.textAlign = "left";
    ctx.fillStyle = AZUL;
    ctx.font = "800 22px Montserrat, Arial";
    ctx.fillText("CARTÃO DE EMBARQUE", x + 40, 390);
    ctx.fillStyle = "#888";
    ctx.font = "600 22px Montserrat, Arial";
    ctx.fillText("DESTINO", x + 40, 440);
    const s = fitText(ctx, d.destino.toUpperCase(), 900, 84, w - 160);
    ctx.font = `900 ${s}px Montserrat, Arial`;
    ctx.fillStyle = "#111";
    ctx.fillText(d.destino.toUpperCase(), x + 40, 530);
    aviao(ctx, x + w - 70, 500, 2.2 * ease((lt - 0.4) / 0.5), AZUL);
    ctx.font = "600 30px Montserrat, Arial";
    ctx.fillStyle = "#444";
    const cs = fitText(ctx, d.chamada, 600, 30, w - 80);
    ctx.font = `600 ${cs}px Montserrat, Arial`;
    ctx.fillText(d.chamada, x + 40, 650);
    ctx.fillStyle = "#888";
    ctx.font = "600 22px Montserrat, Arial";
    ctx.fillText("PORTÃO  A1   ·   ASSENTO  VIP", x + 40, 705);
  }
  if (cena === 1) {
    const itens = d.itens.filter(Boolean).slice(0, 4);
    const h = 160 + itens.length * 80;
    bilhete(ctx, x, 360, w, h, 120);
    ctx.textAlign = "left";
    ctx.fillStyle = AZUL;
    ctx.font = "900 40px Montserrat, Arial";
    ctx.fillText("Sua bagagem inclui", x + 40, 440);
    itens.forEach((it, i) => {
      const ki = ease((lt - 0.3 - i * 0.15) / 0.4);
      ctx.globalAlpha = out * ki;
      const y = 545 + i * 80;
      iconeCheck(ctx, x + 60, y - 12, 18, AZUL, "#fff");
      const fs = fitText(ctx, it, 700, 34, w - 140);
      ctx.font = `700 ${fs}px Montserrat, Arial`;
      ctx.fillStyle = "#222";
      ctx.fillText(it, x + 96, y);
    });
  }
  if (cena === 2) {
    const pt = precoTextos(d);
    bilhete(ctx, x, 420, w, 380, 120);
    ctx.textAlign = "center";
    ctx.fillStyle = "#888";
    ctx.font = "700 24px Montserrat, Arial";
    ctx.fillText("TARIFA  ·  " + d.destino.toUpperCase().slice(0, 22), W / 2, 495);
    ctx.fillStyle = AZUL;
    ctx.font = "800 32px Montserrat, Arial";
    ctx.fillText(pt.topo.toUpperCase(), W / 2, 610);
    textoPreco(ctx, pt.valor, W / 2, 725, 130, w - 80, "#111");
    ctx.fillStyle = "#666";
    ctx.font = "600 28px Montserrat, Arial";
    ctx.fillText(pt.rodape, W / 2, 775);
  }
  if (cena === 3) {
    const nc = Math.max(contatosLista(d, contatos).length, 1);
    bilhete(ctx, x, 300, w, 400 + nc * 82, 330);
    desenharLogo(ctx, d, logo, W / 2, 410, 80, 1, "#f3f4f6");
    ctx.textAlign = "center";
    ctx.fillStyle = AZUL;
    const ts = fitText(ctx, "Embarque com a gente", 900, 48, w - 80);
    ctx.font = `900 ${ts}px Montserrat, Arial`;
    ctx.fillText("Embarque com a gente", W / 2, 580);
    ctx.restore();
    ctx.save();
    desenharPilulas(ctx, d, contatos, 700, lt, 82);
  }
  ctx.restore();
  ctx.globalAlpha = 1;
}

// ---------- Revista: editorial, título fino gigante, numeração
function cenaRevista(ctx: CanvasRenderingContext2D, cena: number, lt: number, out: number, d: Dados, logo: HTMLImageElement | null, contatos: Contato[]) {
  const k = ease(lt / 0.7);
  ctx.globalAlpha = out;
  ctx.textAlign = "left";
  const num = (n: string) => {
    ctx.font = "700 22px Montserrat, Arial";
    ctx.fillStyle = "#fff";
    ctx.fillText(n, 50, 215);
    ctx.fillRect(50, 229, 80 * k, 3);
  };
  if (cena === 0) {
    num("01 — DESTINO");
    ctx.globalAlpha = out * k;
    const nome = d.destino.toUpperCase();
    const s = fitText(ctx, nome, 300, 170, W - 60);
    ctx.font = `300 ${s}px Montserrat, Arial`;
    sombra(ctx, 20);
    ctx.fillStyle = "#fff";
    ctx.fillText(nome, 34 - (1 - k) * 80, 1040);
    semSombra(ctx);
    ctx.font = "italic 400 40px 'Playfair Display', Georgia, serif";
    ctx.globalAlpha = out * ease((lt - 0.6) / 0.6);
    ctx.fillText(d.chamada, 40, 1110);
  }
  if (cena === 1) {
    num("02 — NA MALA");
    ctx.globalAlpha = out * k;
    ctx.font = "300 72px Montserrat, Arial";
    ctx.fillStyle = "#fff";
    sombra(ctx, 18);
    ctx.fillText("Incluso", 40, 760);
    semSombra(ctx);
    d.itens.filter(Boolean).slice(0, 4).forEach((it, i) => {
      const ki = ease((lt - 0.3 - i * 0.16) / 0.45);
      ctx.globalAlpha = out * ki;
      const y = 850 + i * 70;
      ctx.fillStyle = GOLD;
      ctx.font = "700 26px Montserrat, Arial";
      ctx.fillText(String(i + 1).padStart(2, "0"), 40, y);
      ctx.fillStyle = "#fff";
      const fs = fitText(ctx, it, 500, 38, W - 160);
      ctx.font = `500 ${fs}px Montserrat, Arial`;
      sombra(ctx, 14);
      ctx.fillText(it, 100, y);
      semSombra(ctx);
    });
  }
  if (cena === 2) {
    const pt = precoTextos(d);
    num("03 — INVESTIMENTO");
    ctx.globalAlpha = out * k;
    ctx.fillStyle = "#fff";
    ctx.font = "500 34px Montserrat, Arial";
    sombra(ctx, 16);
    ctx.fillText(pt.topo, 40, 880);
    const ps = fitText(ctx, pt.valor, 300, 190, W - 60);
    ctx.font = `300 ${ps}px Montserrat, Arial`;
    ctx.fillText(pt.valor, 30 - (1 - k) * 60, 1060);
    ctx.font = "500 32px Montserrat, Arial";
    ctx.fillText(pt.rodape, 40, 1120);
    semSombra(ctx);
  }
  if (cena === 3) {
    num("04 — RESERVE");
    desenharLogo(ctx, d, logo, W / 2, 440, 120, back(lt / 0.6));
    ctx.textAlign = "center";
    ctx.globalAlpha = ease((lt - 0.4) / 0.5);
    ctx.fillStyle = "#fff";
    const hs = fitText(ctx, "Sua próxima história", 300, 66, W - 80);
    ctx.font = `300 ${hs}px Montserrat, Arial`;
    ctx.fillText("Sua próxima história", W / 2, 670);
    ctx.font = "italic 400 40px 'Playfair Display', Georgia, serif";
    ctx.fillText(`começa em ${d.destino}`, W / 2, 725);
    contatosLista(d, contatos).forEach((c, i) => {
      const kc = ease((lt - 0.9 - i * 0.15) / 0.45);
      ctx.globalAlpha = kc;
      const y = 830 + i * 74;
      const fs = fitText(ctx, c.txt, 600, 34, W - 140);
      ctx.font = `600 ${fs}px Montserrat, Arial`;
      ctx.fillStyle = i === 0 ? GOLD : "#fff";
      ctx.fillText(c.txt, W / 2, y);
      ctx.fillStyle = "rgba(255,255,255,.35)";
      ctx.fillRect(W / 2 - 120, y + 22, 240, 1.5);
    });
  }
  ctx.globalAlpha = 1;
}

// ---------- Postal: moldura branca, selo e carimbo
function moldura(ctx: CanvasRenderingContext2D, k: number) {
  const m = 28 * k;
  ctx.fillStyle = "#fbf7ef";
  ctx.fillRect(0, 0, W, m);
  ctx.fillRect(0, H - m, W, m);
  ctx.fillRect(0, 0, m, H);
  ctx.fillRect(W - m, 0, m, H);
}
function selo(ctx: CanvasRenderingContext2D, x: number, y: number, txt: string, rot: number, k: number) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rot);
  ctx.scale(0.6 + 0.4 * k, 0.6 + 0.4 * k);
  ctx.strokeStyle = CARIMBO;
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.arc(0, 0, 92, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(0, 0, 78, 0, Math.PI * 2);
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.fillStyle = CARIMBO;
  ctx.textAlign = "center";
  const s = fitText(ctx, txt, 900, 30, 140);
  ctx.font = `900 ${s}px Montserrat, Arial`;
  ctx.fillText(txt, 0, 10);
  ctx.restore();
}
function cenaPostal(ctx: CanvasRenderingContext2D, cena: number, lt: number, out: number, d: Dados, logo: HTMLImageElement | null, contatos: Contato[]) {
  ctx.globalAlpha = 1;
  const k = ease((lt - 0.2) / 0.6);
  ctx.globalAlpha = out * k;
  const cartaoPapel = (y: number, h: number) => {
    ctx.save();
    ctx.translate(W / 2, y + h / 2);
    ctx.rotate(-0.025);
    sombra(ctx, 30, "rgba(0,0,0,.3)");
    ctx.fillStyle = "#fbf7ef";
    ctx.fillRect(-(W - 140) / 2, -h / 2, W - 140, h);
    semSombra(ctx);
    ctx.restore();
  };
  if (cena === 0) {
    ctx.textAlign = "center";
    ctx.font = "italic 400 52px 'Playfair Display', Georgia, serif";
    ctx.fillStyle = "#fff";
    sombra(ctx, 20);
    ctx.fillText("Lembranças de", W / 2, 880);
    const s = fitText(ctx, d.destino, 700, 130, W - 120);
    ctx.font = `700 ${s}px 'Playfair Display', Georgia, serif`;
    ctx.fillText(d.destino, W / 2, 1010);
    semSombra(ctx);
    selo(ctx, W - 160, 220, "VIAGEM", 0.25, back((lt - 0.4) / 0.5));
  }
  if (cena === 1) {
    const itens = d.itens.filter(Boolean).slice(0, 4);
    cartaoPapel(560, 140 + itens.length * 74);
    ctx.textAlign = "left";
    ctx.fillStyle = TINTA;
    ctx.font = "italic 400 44px 'Playfair Display', Georgia, serif";
    ctx.fillText("Na sua viagem:", 110, 640);
    itens.forEach((it, i) => {
      const ki = ease((lt - 0.35 - i * 0.16) / 0.4);
      ctx.globalAlpha = out * ki;
      const fs = fitText(ctx, "— " + it, 500, 36, W - 240);
      ctx.font = `500 ${fs}px Montserrat, Arial`;
      ctx.fillStyle = "#3f3f46";
      ctx.fillText("— " + it, 120, 720 + i * 74);
    });
  }
  if (cena === 2) {
    const pt = precoTextos(d);
    cartaoPapel(620, 320);
    ctx.textAlign = "center";
    ctx.fillStyle = TINTA;
    ctx.font = "italic 400 40px 'Playfair Display', Georgia, serif";
    ctx.fillText(pt.topo, W / 2, 710);
    textoPreco(ctx, pt.valor, W / 2, 840, 120, W - 220, TINTA);
    ctx.font = "500 30px Montserrat, Arial";
    ctx.fillStyle = "#57534e";
    ctx.fillText(pt.rodape, W / 2, 895);
    selo(ctx, W - 170, 640, "OFERTA", -0.2, back((lt - 0.5) / 0.5));
  }
  if (cena === 3) {
    cartaoPapel(300, 760);
    desenharLogo(ctx, d, logo, W / 2, 440, 100, 1, "#fff");
    ctx.textAlign = "center";
    ctx.fillStyle = TINTA;
    ctx.font = "italic 400 52px 'Playfair Display', Georgia, serif";
    ctx.fillText("Vamos juntos?", W / 2, 620);
    desenharPilulas(ctx, d, contatos, 720, lt, 80);
  }
  ctx.globalAlpha = 1;
}

// ---------- Faixa preta: painel inferior escuro com destaque amarelo
function painel(ctx: CanvasRenderingContext2D, y: number, k: number) {
  ctx.fillStyle = "rgba(8,8,10,.92)";
  ctx.fillRect(0, y + (1 - k) * (H - y), W, H - y);
  ctx.fillStyle = NEON;
  ctx.fillRect(0, y + (1 - k) * (H - y), W * k, 8);
}
function cenaVibrante(ctx: CanvasRenderingContext2D, cena: number, lt: number, out: number, d: Dados, logo: HTMLImageElement | null, contatos: Contato[]) {
  const k = ease(lt / 0.5);
  const gradBloco = (x: number, y: number, w: number, h: number) => {
    const g = ctx.createLinearGradient(x, y, x + w, y + h);
    g.addColorStop(0, ROXO);
    g.addColorStop(1, ROSA);
    return g;
  };
  ctx.globalAlpha = out;
  // faixa fina em degradê no topo, que cresce a cada tela
  ctx.fillStyle = gradBloco(0, 0, W, 10);
  ctx.fillRect(0, 0, W * k, 10);
  ctx.textAlign = "center";
  if (cena === 0) {
    const kb = back((lt - 0.15) / 0.55);
    ctx.save();
    ctx.translate(W / 2, 880);
    ctx.rotate(-0.04);
    ctx.scale(0.7 + 0.3 * kb, 0.7 + 0.3 * kb);
    const s = fitText(ctx, d.destino, 900, 100, W - 160);
    ctx.font = `900 ${s}px Montserrat, Arial`;
    const w = Math.min(ctx.measureText(d.destino).width + 90, W - 60);
    roundRect(ctx, -w / 2, -95, w, 150, 75);
    ctx.fillStyle = gradBloco(-w / 2, -95, w, 150);
    ctx.fill();
    ctx.fillStyle = "#fff";
    ctx.fillText(d.destino, 0, 15);
    ctx.restore();
    ctx.globalAlpha = out * ease((lt - 0.7) / 0.5);
    ctx.font = "800 36px Montserrat, Arial";
    const cs = fitText(ctx, d.chamada, 800, 36, W - 160);
    ctx.font = `800 ${cs}px Montserrat, Arial`;
    const cw = Math.min(ctx.measureText(d.chamada).width + 60, W - 80);
    roundRect(ctx, (W - cw) / 2, 990, cw, 70, 35);
    ctx.fillStyle = "#fff";
    ctx.fill();
    ctx.fillStyle = ROXO;
    ctx.fillText(d.chamada, W / 2, 1037);
  }
  if (cena === 1) {
    ctx.globalAlpha = out * k;
    ctx.font = "900 54px Montserrat, Arial";
    ctx.fillStyle = "#fff";
    sombra(ctx, 18);
    ctx.fillText("Tá tudo incluso ✨", W / 2, 600);
    semSombra(ctx);
    d.itens.filter(Boolean).slice(0, 4).forEach((it, i) => {
      const ki = back((lt - 0.3 - i * 0.15) / 0.45);
      ctx.globalAlpha = out * clamp01((lt - 0.3 - i * 0.15) / 0.2);
      const y = 700 + i * 96;
      const fs = fitText(ctx, it, 800, 36, W - 200);
      ctx.font = `800 ${fs}px Montserrat, Arial`;
      const w = Math.min(ctx.measureText(it).width + 80, W - 80);
      ctx.save();
      ctx.translate(W / 2, y);
      ctx.scale(0.7 + 0.3 * ki, 0.7 + 0.3 * ki);
      roundRect(ctx, -w / 2, -42, w, 80, 40);
      ctx.fillStyle = i % 2 ? "#fff" : gradBloco(-w / 2, -42, w, 80);
      ctx.fill();
      ctx.fillStyle = i % 2 ? ROXO : "#fff";
      ctx.fillText(it, 0, 12);
      ctx.restore();
    });
  }
  if (cena === 2) {
    const pt = precoTextos(d);
    const kb = back((lt - 0.2) / 0.55);
    ctx.globalAlpha = out * clamp01((lt - 0.2) / 0.25);
    ctx.save();
    ctx.translate(W / 2, 760);
    ctx.scale(0.6 + 0.4 * kb, 0.6 + 0.4 * kb);
    ctx.beginPath();
    ctx.arc(0, 0, 250, 0, Math.PI * 2);
    ctx.fillStyle = gradBloco(-250, -250, 500, 500);
    sombra(ctx, 50, "rgba(124,58,237,.6)");
    ctx.fill();
    semSombra(ctx);
    ctx.fillStyle = "#fff";
    const ts = fitText(ctx, pt.topo.toUpperCase(), 800, 30, 380);
    ctx.font = `800 ${ts}px Montserrat, Arial`;
    ctx.fillText(pt.topo.toUpperCase(), 0, -80);
    textoPreco(ctx, pt.valor, 0, 40, 120, 420, "#fff");
    ctx.font = "700 30px Montserrat, Arial";
    ctx.fillText(pt.rodape, 0, 100);
    ctx.restore();
  }
  if (cena === 3) {
    desenharLogo(ctx, d, logo, W / 2, 450, 125, back(lt / 0.6));
    ctx.globalAlpha = ease((lt - 0.4) / 0.5);
    ctx.font = "900 60px Montserrat, Arial";
    ctx.fillStyle = "#fff";
    ctx.fillText("Bora viajar? 💜", W / 2, 680);
    desenharPilulas(ctx, d, contatos, 790, lt, 84);
  }
  ctx.globalAlpha = 1;
}

// ---------------- Ofertas sazonais: camada por cima de qualquer estilo ----------------
type Ocasiao = "nenhuma" | "blackfriday" | "bf_neon" | "bf_vermelha" | "natal" | "anonovo" | "carnaval";
// meses: 0 = janeiro ... 11 = dezembro. A lista se reordena sozinha pelo mês atual.
const OCASIOES: { id: Ocasiao; nome: string; selo: string; meses: number[] }[] = [
  { id: "nenhuma", nome: "Nenhuma", selo: "", meses: [] },
  { id: "blackfriday", nome: "🖤 Black Friday dourada", selo: "BLACK FRIDAY", meses: [10] },
  { id: "bf_neon", nome: "⚡ Black Friday neon", selo: "BLACK FRIDAY", meses: [10] },
  { id: "bf_vermelha", nome: "🔥 Black Friday vermelha", selo: "BLACK FRIDAY", meses: [10] },
  { id: "natal", nome: "🎄 Natal", selo: "OFERTA DE NATAL", meses: [11] },
  { id: "anonovo", nome: "✨ Ano Novo", selo: "ESPECIAL ANO NOVO", meses: [11, 0] },
  { id: "carnaval", nome: "🎭 Carnaval", selo: "🎭 CARNAVAL", meses: [0, 1] },
];
function ocasioesDoMes(hoje = new Date()) {
  const m = hoje.getMonth();
  const agora = OCASIOES.filter((o) => o.meses.includes(m));
  const resto = OCASIOES.filter((o) => !o.meses.includes(m) && o.id !== "nenhuma");
  return { agora, lista: [...agora, OCASIOES[0], ...resto] };
}
const ehBlack = (oc: Ocasiao) => oc === "blackfriday" || oc === "bf_neon" || oc === "bf_vermelha";
const ESTILO_BF: Record<"blackfriday" | "bf_neon" | "bf_vermelha", { barra: string; texto: string; borda: string | null }> = {
  blackfriday: { barra: "#0a0a0a", texto: "#f5c451", borda: "rgba(245,196,81,.9)" },
  bf_neon: { barra: "#eaff2b", texto: "#0a0a0a", borda: null },
  bf_vermelha: { barra: "#dc2626", texto: "#ffffff", borda: "rgba(220,38,38,.85)" },
};

// número pseudoaleatório fixo por índice (as partículas não "pulam" entre quadros)
const rnd = (i: number, s = 1) => {
  const x = Math.sin(i * 127.1 + s * 311.7) * 43758.5453;
  return x - Math.floor(x);
};

function neve(ctx: CanvasRenderingContext2D, t: number) {
  ctx.fillStyle = "rgba(255,255,255,.9)";
  for (let i = 0; i < 60; i++) {
    const r = 2 + rnd(i, 2) * 4;
    const vel = 40 + rnd(i, 3) * 80;
    const y = ((rnd(i, 4) * H + t * vel) % (H + 20)) - 10;
    const x = rnd(i, 5) * W + Math.sin(t * 1.3 + i) * 18;
    ctx.globalAlpha = 0.4 + rnd(i, 6) * 0.45;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

// confete minimalista: só no topo (até 20% da altura) e some antes de descer mais
function confete(ctx: CanvasRenderingContext2D, t: number) {
  const cores = [ROXO, ROSA, "#facc15", "#22c55e", "#3b82f6"];
  const faixa = H * 0.2;
  for (let i = 0; i < 34; i++) {
    const vel = 50 + rnd(i, 3) * 70;
    const y = (rnd(i, 4) * faixa + t * vel) % faixa;
    const x = rnd(i, 5) * W + Math.sin(t * 2 + i) * 14;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(t * (2 + rnd(i, 7) * 3) + i);
    ctx.fillStyle = cores[i % cores.length];
    ctx.globalAlpha = 0.85 * (1 - y / faixa);
    ctx.fillRect(-5, -2.5, 10, 5);
    ctx.restore();
  }
  ctx.globalAlpha = 1;
}

function fogos(ctx: CanvasRenderingContext2D, t: number) {
  for (let b = 0; b < 3; b++) {
    const ciclo = 2.4;
    const fase = ((t + b * 0.8) % ciclo) / ciclo;
    const n = Math.floor((t + b * 0.8) / ciclo);
    const cx = 120 + rnd(b + n * 7, 1) * (W - 240);
    const cy = 200 + rnd(b + n * 7, 2) * 260;
    const raio = 24 + fase * 120;
    ctx.globalAlpha = Math.max(0, 1 - fase) * 0.85;
    for (let i = 0; i < 16; i++) {
      const a = (i / 16) * Math.PI * 2;
      ctx.fillStyle = i % 2 ? "#fde68a" : GOLD;
      ctx.beginPath();
      ctx.arc(cx + Math.cos(a) * raio, cy + Math.sin(a) * raio + fase * fase * 36, 3, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  for (let i = 0; i < 20; i++) {
    const pisca = (Math.sin(t * 3 + i * 1.7) + 1) / 2;
    ctx.globalAlpha = pisca * 0.7;
    ctx.fillStyle = "#fff7d6";
    const x = rnd(i, 8) * W;
    const y = rnd(i, 9) * H;
    const r = 2 + pisca * 2.5;
    ctx.beginPath();
    ctx.moveTo(x, y - r * 2);
    ctx.lineTo(x + r * 0.5, y);
    ctx.lineTo(x, y + r * 2);
    ctx.lineTo(x - r * 0.5, y);
    ctx.closePath();
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

function seloOcasiao(ctx: CanvasRenderingContext2D, oc: Ocasiao, k: number) {
  const info = OCASIOES.find((o) => o.id === oc)!;
  ctx.save();
  ctx.globalAlpha = k;
  ctx.font = "900 28px Montserrat, Arial";
  ctx.textAlign = "center";
  const w = ctx.measureText(info.selo).width + 56;
  const h = 50;
  const x = (W - w) / 2;
  const y = (ehBlack(oc) ? 166 : 118) - (1 - k) * 30;
  roundRect(ctx, x, y, w, h, h / 2);
  let texto = "#fff";
  if (ehBlack(oc)) {
    const e = ESTILO_BF[oc as keyof typeof ESTILO_BF];
    ctx.fillStyle = e.barra;
    texto = e.texto;
  } else if (oc === "natal") ctx.fillStyle = "#b91c1c";
  else if (oc === "anonovo") {
    const g = ctx.createLinearGradient(x, 0, x + w, 0);
    g.addColorStop(0, "#fff1c2");
    g.addColorStop(0.5, "#f5c451");
    g.addColorStop(1, "#c08a1e");
    ctx.fillStyle = g;
    texto = "#1a1406";
  } else {
    const g = ctx.createLinearGradient(x, 0, x + w, 0);
    g.addColorStop(0, ROXO);
    g.addColorStop(1, ROSA);
    ctx.fillStyle = g;
  }
  sombra(ctx, 18, "rgba(0,0,0,.35)");
  ctx.fill();
  semSombra(ctx);
  if (oc === "blackfriday") {
    ctx.strokeStyle = "#f5c451";
    ctx.lineWidth = 2.5;
    ctx.stroke();
  }
  ctx.fillStyle = texto;
  ctx.fillText(info.selo, W / 2, y + 34);
  ctx.restore();
}

// Preço antigo riscado com o desconto, logo acima da área do preço
function precoAntigo(ctx: CanvasRenderingContext2D, d: Dados, lt: number, out: number, oc: Ocasiao, y = 300) {
  const antigo = d.precoAntigo.trim();
  if (!antigo || d.pagamento === "free_quote") return;
  const num = (v: string) => parseFloat(v.replace(/[^\d,]/g, "").replace(",", ".")) || 0;
  const a = num(antigo);
  const n = num(d.preco);
  const pct = a > 0 && n > 0 && n < a && d.pagamento === "cash" ? Math.round((1 - n / a) * 100) : 0;
  const k = back((lt - 0.15) / 0.5);
  ctx.save();
  ctx.globalAlpha = out * clamp01((lt - 0.15) / 0.25);
  ctx.translate(W / 2, y);
  ctx.scale(0.7 + 0.3 * k, 0.7 + 0.3 * k);
  ctx.textAlign = "center";
  const txt = `de ${antigo.startsWith("R$") ? antigo : "R$ " + antigo}`;
  ctx.font = "800 38px Montserrat, Arial";
  const tw = ctx.measureText(txt).width;
  const bw = tw + 48 + (pct ? 118 : 0);
  roundRect(ctx, -bw / 2, -34, bw, 60, 30);
  ctx.fillStyle = "rgba(10,10,12,.82)";
  ctx.fill();
  const xTxt = pct ? -bw / 2 + 24 + tw / 2 : 0;
  ctx.fillStyle = "#e5e7eb";
  ctx.fillText(txt, xTxt, 6);
  ctx.strokeStyle = "#ef4444";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(xTxt - tw / 2 - 5, -4);
  ctx.lineTo(xTxt + tw / 2 + 5, -4);
  ctx.stroke();
  if (pct) {
    roundRect(ctx, bw / 2 - 114, -28, 104, 48, 24);
    const bf = ehBlack(oc) ? ESTILO_BF[oc as keyof typeof ESTILO_BF] : null;
    ctx.fillStyle = bf ? (oc === "blackfriday" ? "#f5c451" : bf.barra) : "#ef4444";
    ctx.fill();
    ctx.fillStyle = bf ? (oc === "blackfriday" ? "#111" : bf.texto) : "#fff";
    ctx.font = "900 32px Montserrat, Arial";
    ctx.fillText(`-${pct}%`, bw / 2 - 62, 6);
  }
  ctx.restore();
}

function letreiro(ctx: CanvasRenderingContext2D, y: number, h: number, t: number, sentido: number, e: { barra: string; texto: string }) {
  ctx.fillStyle = e.barra;
  ctx.fillRect(0, y, W, h);
  ctx.save();
  ctx.beginPath();
  ctx.rect(0, y, W, h);
  ctx.clip();
  ctx.fillStyle = e.texto;
  ctx.font = "900 24px Montserrat, Arial";
  ctx.textAlign = "left";
  const pedacos = ["BLACK FRIDAY", "•", "OFERTA POR TEMPO LIMITADO", "•"];
  const larg = pedacos.map((p) => ctx.measureText(p).width);
  const ciclo = larg.reduce((a, w) => a + w + 22, 0);
  let x = sentido > 0 ? -((t * 80) % ciclo) : -ciclo + ((t * 80) % ciclo);
  while (x < W) {
    pedacos.forEach((p, i) => {
      ctx.fillText(p, x, y + h / 2 + 8);
      x += larg[i] + 22;
    });
  }
  ctx.restore();
}

function camadaOcasiao(ctx: CanvasRenderingContext2D, oc: Ocasiao, t: number, tipo: Tela, lt: number) {
  if (oc === "nenhuma") return;
  if (ehBlack(oc)) {
    const e = ESTILO_BF[oc as keyof typeof ESTILO_BF];
    if (e.borda) {
      ctx.strokeStyle = e.borda;
      ctx.lineWidth = 5;
      ctx.strokeRect(10, 10, W - 20, H - 20);
    }
    // letreiro em cima e embaixo, dentro da área que o Instagram não cobre
    letreiro(ctx, 104, 42, t, 1, e);
    letreiro(ctx, 1110, 42, t, -1, e);
  }
  if (oc === "natal") neve(ctx, t);
  if (oc === "carnaval") confete(ctx, t);
  if (oc === "anonovo") fogos(ctx, t);
  if (tipo === "abertura" || tipo === "preco") seloOcasiao(ctx, oc, ease(lt / 0.5));
}

// ---------------- Contato padrão (igual em todos os estilos): logo, título e botões com ícone ----------------
function icone(ctx: CanvasRenderingContext2D, id: Contato, cx: number, cy: number, r: number, cor = "#fff") {
  ctx.save();
  ctx.strokeStyle = cor;
  ctx.fillStyle = cor;
  ctx.lineWidth = Math.max(2.5, r / 5);
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  if (id === "whatsapp") {
    // balão com telefone
    ctx.beginPath();
    ctx.arc(cx, cy, r * 0.85, Math.PI * 0.72, Math.PI * 2.62);
    ctx.lineTo(cx - r * 0.95, cy + r * 0.95);
    ctx.closePath();
    ctx.stroke();
    ctx.lineWidth = Math.max(3, r / 3.4);
    ctx.beginPath();
    ctx.arc(cx, cy, r * 0.38, Math.PI * 0.75, Math.PI * 1.75);
    ctx.stroke();
  } else if (id === "instagram") {
    roundRect(ctx, cx - r * 0.85, cy - r * 0.85, r * 1.7, r * 1.7, r * 0.5);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(cx, cy, r * 0.4, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(cx + r * 0.48, cy - r * 0.48, r * 0.1, 0, Math.PI * 2);
    ctx.fill();
  } else if (id === "facebook") {
    ctx.font = `900 ${Math.round(r * 2.2)}px Arial`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("f", cx + r * 0.05, cy + r * 0.12);
    ctx.textBaseline = "alphabetic";
  } else if (id === "email") {
    ctx.strokeRect(cx - r * 0.85, cy - r * 0.6, r * 1.7, r * 1.2);
    ctx.beginPath();
    ctx.moveTo(cx - r * 0.85, cy - r * 0.6);
    ctx.lineTo(cx, cy + r * 0.1);
    ctx.lineTo(cx + r * 0.85, cy - r * 0.6);
    ctx.stroke();
  } else {
    ctx.beginPath();
    ctx.arc(cx, cy, r * 0.85, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(cx, cy, r * 0.38, r * 0.85, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cx - r * 0.85, cy);
    ctx.lineTo(cx + r * 0.85, cy);
    ctx.stroke();
  }
  ctx.restore();
}

// texto do botão: só o contato, sem a palavra "WhatsApp" (o ícone já diz)
function contatoCurto(id: Contato, d: Dados) {
  if (id === "whatsapp") return d.whatsapp || "Fale conosco";
  return contatoTexto(id, d);
}

function ajustarFonte(ctx: CanvasRenderingContext2D, molde: string, texto: string, max: number, maxW: number) {
  let s = max;
  do {
    ctx.font = molde.replace("{s}", String(s));
    s -= 3;
  } while (ctx.measureText(texto).width > maxW && s > 16);
}

const ESTILO_CTA: Record<Modelo, { titulo: string; molde: string; cor: () => string }> = {
  classico: { titulo: "Garanta sua vaga", molde: "900 {s}px Montserrat, Arial", cor: () => "#fff" },
  neon: { titulo: "RESERVE AGORA", molde: "900 {s}px Montserrat, Arial", cor: () => NEON },
  cartao: { titulo: "Garanta sua vaga", molde: "800 {s}px Montserrat, Arial", cor: () => "#fff" },
  luxo: { titulo: "Reserve sua viagem", molde: "700 {s}px 'Playfair Display', Georgia, serif", cor: () => "#fff" },
  passagem: { titulo: "Embarque com a gente", molde: "900 {s}px Montserrat, Arial", cor: () => "#fff" },
  revista: { titulo: "Sua próxima história", molde: "300 {s}px Montserrat, Arial", cor: () => "#fff" },
  postal: { titulo: "Vamos juntos?", molde: "italic 400 {s}px 'Playfair Display', Georgia, serif", cor: () => "#fff" },
  faixa: { titulo: "FALE COM A GENTE", molde: "900 {s}px Montserrat, Arial", cor: () => NEON },
  vibrante: { titulo: "Bora viajar?", molde: "900 {s}px Montserrat, Arial", cor: () => "#fff" },
};

function ctaPadrao(ctx: CanvasRenderingContext2D, d: Dados, logo: HTMLImageElement | null, contatos: Contato[], lt: number, modelo: Modelo, y0 = 0) {
  ctx.textAlign = "center";
  ctx.globalAlpha = clamp01(lt / 0.3);
  desenharLogo(ctx, d, logo, W / 2, 430 + y0, 88, back(lt / 0.6));
  const est = ESTILO_CTA[modelo];
  const k2 = ease((lt - 0.4) / 0.5);
  ctx.globalAlpha = k2;
  ajustarFonte(ctx, est.molde, est.titulo, 60, W - 120);
  ctx.fillStyle = est.cor();
  sombra(ctx, 18, "rgba(0,0,0,.5)");
  ctx.fillText(est.titulo, W / 2, 590 + y0 + (1 - k2) * 16);
  semSombra(ctx);
  const pt = precoTextos(d);
  const sub = pt.valor === "Consulte" ? d.destino : `${d.destino} · ${pt.topo === "a partir de" ? "" : pt.topo + " "}${pt.valor}`;
  ajustarFonte(ctx, "600 {s}px Montserrat, Arial", sub, 30, W - 140);
  ctx.fillStyle = "#e5e7eb";
  ctx.fillText(sub, W / 2, 636 + y0 + (1 - k2) * 16);

  contatosLista(d, contatos).forEach((c, i) => {
    const info = CONTATOS.find((x) => x.id === c.id)!;
    const txt = contatoCurto(c.id, d);
    const kc = ease((lt - 0.8 - i * 0.14) / 0.4);
    const pulse = i === 0 ? 1 + 0.03 * Math.sin((lt - 0.8) * 6) : 1;
    ctx.globalAlpha = kc;
    ctx.save();
    ctx.translate(W / 2, 715 + y0 + i * 70 + (1 - kc) * 16);
    ctx.scale(pulse, pulse);
    ajustarFonte(ctx, "700 {s}px Montserrat, Arial", txt, 30, W - 260);
    const tw = ctx.measureText(txt).width;
    const bw = tw + 104;
    const h = 56;
    roundRect(ctx, -bw / 2, -h / 2, bw, h, h / 2);
    if (c.id === "instagram") {
      const gi = ctx.createLinearGradient(-bw / 2, 0, bw / 2, 0);
      gi.addColorStop(0, "#feda75");
      gi.addColorStop(0.35, "#fa7e1e");
      gi.addColorStop(0.65, "#d62976");
      gi.addColorStop(1, "#4f5bd5");
      ctx.fillStyle = gi;
    } else ctx.fillStyle = info.cor;
    sombra(ctx, 14, "rgba(0,0,0,.3)");
    ctx.fill();
    semSombra(ctx);
    icone(ctx, c.id, -bw / 2 + 34, 0, 15, info.texto);
    ctx.fillStyle = info.texto;
    ctx.textAlign = "left";
    ctx.fillText(txt, -bw / 2 + 62, 10);
    ctx.textAlign = "center";
    ctx.restore();
  });
  ctx.globalAlpha = 1;
}

// ---------------- Faixa preta: tela dividida (vídeo em cima, bloco preto embaixo, linha sempre na mesma altura) ----------------
const LINHA_FAIXA = 640;
function cenaFaixa(ctx: CanvasRenderingContext2D, cena: number, lt: number, out: number, d: Dados, _logo: HTMLImageElement | null, _contatos: Contato[]) {
  const k = ease((lt - 0.1) / 0.5);
  ctx.globalAlpha = out * k;
  ctx.textAlign = "left";
  const y = (v: number) => v + (1 - k) * 24;
  if (cena === 0) {
    ctx.fillStyle = NEON;
    ctx.font = "800 26px Montserrat, Arial";
    ctx.fillText("PACOTE", 56, y(740));
    const s = fitText(ctx, d.destino.toUpperCase(), 900, 104, W - 112);
    ctx.font = `900 ${s}px Montserrat, Arial`;
    ctx.fillStyle = "#fff";
    ctx.fillText(d.destino.toUpperCase(), 52, y(840));
    const cs = fitText(ctx, d.chamada, 600, 34, W - 112);
    ctx.font = `600 ${cs}px Montserrat, Arial`;
    ctx.fillStyle = "#d4d4d8";
    ctx.fillText(d.chamada, 56, y(900));
  }
  if (cena === 1) {
    ctx.fillStyle = NEON;
    ctx.font = "900 38px Montserrat, Arial";
    ctx.fillText("ESTÁ INCLUSO", 56, y(730));
    d.itens.filter(Boolean).slice(0, 4).forEach((it, i) => {
      const ki = ease((lt - 0.3 - i * 0.15) / 0.4);
      ctx.globalAlpha = out * ki;
      const yy = 800 + i * 70;
      iconeCheck(ctx, 72, yy - 11, 16, NEON, SOBRE_NEON);
      const fs = fitText(ctx, it, 700, 34, W - 170);
      ctx.font = `700 ${fs}px Montserrat, Arial`;
      ctx.fillStyle = "#fff";
      ctx.fillText(it, 104, yy);
    });
  }
  if (cena === 2) {
    const pt = precoTextos(d);
    ctx.fillStyle = "#d4d4d8";
    ctx.font = "800 30px Montserrat, Arial";
    ctx.fillText(pt.topo.toUpperCase(), 56, y(780));
    const kp = back((lt - 0.3) / 0.5);
    ctx.save();
    ctx.translate(52, 915);
    ctx.scale(0.85 + 0.15 * kp, 0.85 + 0.15 * kp);
    textoPreco(ctx, pt.valor, 0, 0, 150, W - 110, NEON);
    ctx.restore();
    ctx.fillStyle = "#fff";
    ctx.font = "600 30px Montserrat, Arial";
    ctx.fillText(pt.rodape, 56, y(970));
  }
  ctx.globalAlpha = 1;
}

function cenaDestaque(ctx: CanvasRenderingContext2D, modelo: Modelo, texto: string, lt: number, out: number) {
  ctx.textAlign = "center";
  const k = ease((lt - 0.2) / 0.6);
  ctx.globalAlpha = out * k;
  if (modelo === "classico") {
    const s = fitText(ctx, texto, 900, 70, W - 100);
    ctx.font = `900 ${s}px Montserrat, Arial`;
    sombra(ctx, 24);
    ctx.fillStyle = "#fff";
    ctx.fillText(texto, W / 2, 1000 + (1 - k) * 40);
    semSombra(ctx);
    ctx.fillStyle = GOLD;
    const lw = 220 * ease((lt - 0.5) / 0.5);
    ctx.fillRect(W / 2 - lw / 2, 1035, lw, 8);
  } else if (modelo === "neon") {
    ctx.font = "900 46px Montserrat, Arial";
    const w = Math.min(ctx.measureText(texto).width + 70, W - 40);
    faixaNeon(ctx, 0, 940, w, 96, k);
    ctx.textAlign = "left";
    ctx.fillStyle = "#111";
    const s = fitText(ctx, texto, 900, 46, W - 110);
    ctx.font = `900 ${s}px Montserrat, Arial`;
    ctx.fillText(texto, 34, 1004);
  } else if (modelo === "cartao") {
    const s = fitText(ctx, texto, 800, 42, W - 200);
    ctx.font = `800 ${s}px Montserrat, Arial`;
    const w = Math.min(ctx.measureText(texto).width + 90, W - 100);
    ctx.save();
    ctx.translate(W / 2, 1000);
    ctx.scale(0.85 + 0.15 * back((lt - 0.2) / 0.5), 0.85 + 0.15 * back((lt - 0.2) / 0.5));
    sombra(ctx, 40, "rgba(0,0,0,.3)");
    roundRect(ctx, -w / 2, -60, w, 100, 30);
    ctx.fillStyle = "#fff";
    ctx.fill();
    semSombra(ctx);
    ctx.fillStyle = "#111";
    ctx.fillText(texto, 0, 6);
    ctx.restore();
  } else if (modelo === "passagem") {
    const s = fitText(ctx, texto, 800, 40, W - 220);
    ctx.font = `800 ${s}px Montserrat, Arial`;
    const w = Math.min(ctx.measureText(texto).width + 140, W - 80);
    ctx.save();
    ctx.translate(0, (1 - k) * 60);
    bilhete(ctx, (W - w) / 2, 930, w, 120, 60);
    aviao(ctx, (W - w) / 2 + 50, 990, 1.2, AZUL);
    ctx.fillStyle = "#111";
    ctx.fillText(texto, W / 2 + 30, 1004);
    ctx.restore();
  } else if (modelo === "revista") {
    ctx.textAlign = "left";
    const s = fitText(ctx, texto, 300, 76, W - 80);
    ctx.font = `300 ${s}px Montserrat, Arial`;
    sombra(ctx, 20);
    ctx.fillStyle = "#fff";
    ctx.fillText(texto, 40 - (1 - k) * 60, 1060);
    semSombra(ctx);
    ctx.fillStyle = GOLD;
    ctx.fillRect(40, 1090, 120 * k, 4);
  } else if (modelo === "postal") {
    ctx.globalAlpha = 1;
    ctx.globalAlpha = out * k;
    const s = fitText(ctx, texto, 400, 60, W - 120);
    ctx.font = `italic 400 ${s}px 'Playfair Display', Georgia, serif`;
    sombra(ctx, 20);
    ctx.fillStyle = "#fff";
    ctx.fillText(texto, W / 2, 1020);
    semSombra(ctx);
  } else if (modelo === "faixa") {
    ctx.textAlign = "left";
    const s = fitText(ctx, texto, 900, 56, W - 112);
    ctx.font = `900 ${s}px Montserrat, Arial`;
    ctx.fillStyle = "#fff";
    ctx.fillText(texto, 56, 790 + (1 - k) * 24);
    ctx.fillStyle = NEON;
    ctx.fillRect(56, 822, 140 * k, 6);
  } else if (modelo === "vibrante") {
    const s = fitText(ctx, texto, 900, 44, W - 180);
    ctx.font = `900 ${s}px Montserrat, Arial`;
    const w = Math.min(ctx.measureText(texto).width + 90, W - 60);
    const kb = back((lt - 0.2) / 0.5);
    ctx.save();
    ctx.translate(W / 2, 1000);
    ctx.rotate(-0.03);
    ctx.scale(0.7 + 0.3 * kb, 0.7 + 0.3 * kb);
    roundRect(ctx, -w / 2, -60, w, 100, 50);
    const g = ctx.createLinearGradient(-w / 2, 0, w / 2, 0);
    g.addColorStop(0, ROXO);
    g.addColorStop(1, ROSA);
    ctx.fillStyle = g;
    ctx.fill();
    ctx.fillStyle = "#fff";
    ctx.fillText(texto, 0, 6);
    ctx.restore();
  } else {
    const s = fitText(ctx, texto, 400, 64, W - 100);
    ctx.font = `italic 400 ${s}px 'Playfair Display', Georgia, serif`;
    sombra(ctx, 22);
    ctx.fillStyle = "#fff";
    ctx.fillText(texto, W / 2, 1000 + (1 - k) * 24);
    semSombra(ctx);
  }
  ctx.globalAlpha = 1;
}

function drawFrame(
  ctx: CanvasRenderingContext2D,
  t: number,
  vids: Fundo[],
  d: Dados,
  logo: HTMLImageElement | null,
  contatos: Contato[],
  modelo: Modelo = "classico",
  ocasiao: Ocasiao = "nenhuma",
  tema: Tema = { fonte: "Montserrat" },
) {
  prepararCtx(ctx);
  aplicarTema(tema);
  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, W, H);
  const dividida = modelo === "faixa";
  const alturaFundo = dividida ? LINHA_FAIXA : H;

  // fundo: um vídeo (ou foto) por tela, com zoom lento e fusão entre telas
  for (let i = 0; i < CENAS; i++) {
    const m = vids[i % Math.max(vids.length, 1)];
    if (!m) continue;
    const dur = TELAS[i].dur;
    const local = t - INICIOS[i];
    if (local < -FADE || local > dur + FADE) continue;
    ctx.globalAlpha = i === 0 ? 1 : clamp01(ease((local + FADE) / FADE));
    const p = clamp01(local / dur);
    ctx.save();
    if (dividida) {
      ctx.beginPath();
      ctx.rect(0, 0, W, alturaFundo);
      ctx.clip();
    }
    if (isVideo(m)) drawCover(ctx, m, 1.04 + 0.08 * p, alturaFundo);
    else {
      // foto: zoom e passeio lateral alternando o lado
      ctx.translate((i % 2 ? -1 : 1) * (p - 0.5) * 60, 0);
      drawCover(ctx, m, 1.08 + 0.14 * p, alturaFundo);
    }
    ctx.restore();
  }
  ctx.globalAlpha = 1;

  const cena = telaEm(t);
  const lt = t - INICIOS[cena];
  const dur = TELAS[cena].dur;
  const out = cena === CENAS - 1 ? 1 : 1 - ease((lt - (dur - 0.35)) / 0.35);
  const tipo = TELAS[cena].tipo;

  // escurece para dar leitura
  const g = ctx.createLinearGradient(0, 0, 0, H);
  if (dividida) {
    g.addColorStop(0, "rgba(0,0,0,.25)");
    g.addColorStop(0.3, "rgba(0,0,0,0)");
    g.addColorStop(1, "rgba(0,0,0,0)");
  } else if (tipo === "contato") {
    g.addColorStop(0, "rgba(5,8,20,.5)");
    g.addColorStop(1, "rgba(5,8,20,.82)");
  } else if (modelo === "luxo" || modelo === "revista" || modelo === "postal") {
    g.addColorStop(0, "rgba(0,0,0,.25)");
    g.addColorStop(0.5, "rgba(0,0,0,.35)");
    g.addColorStop(1, "rgba(0,0,0,.75)");
  } else {
    g.addColorStop(0, "rgba(0,0,0,.35)");
    g.addColorStop(0.45, "rgba(0,0,0,0)");
    g.addColorStop(0.7, "rgba(0,0,0,.25)");
    g.addColorStop(1, "rgba(0,0,0,.8)");
  }
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
  ctx.textBaseline = "alphabetic";

  // tela dividida: bloco preto embaixo e a linha sempre na mesma altura
  if (dividida) {
    ctx.fillStyle = "#0a0a0c";
    ctx.fillRect(0, LINHA_FAIXA, W, H - LINHA_FAIXA);
    ctx.fillStyle = NEON;
    ctx.fillRect(0, LINHA_FAIXA - 4, W, 8);
  }

  // conteúdo um pouco menor e mais perto do centro (respeita a sangria do Instagram);
  // os estilos que encostam nas bordas de propósito ficam em tamanho cheio
  const encolhe = !(modelo === "neon" || modelo === "faixa");
  if (tipo === "contato") {
    ctaPadrao(ctx, d, logo, contatos, lt, modelo, dividida ? 120 : 0);
  } else {
    ctx.save();
    if (encolhe) {
      ctx.translate(W / 2, 600);
      ctx.scale(0.9, 0.9);
      ctx.translate(-W / 2, -600);
    }
    if (tipo === "destaque") {
      const n = TELAS.slice(0, cena).filter((x) => x.tipo === "destaque").length;
      const texto = d.destaques[n] || (n === 0 ? d.chamada : `Conheça ${d.destino}`);
      cenaDestaque(ctx, modelo, texto, lt, out);
    } else {
      const fn = {
        classico: cenaClassico, neon: cenaNeon, cartao: cenaCartao, luxo: cenaLuxo,
        passagem: cenaPassagem, revista: cenaRevista, postal: cenaPostal, faixa: cenaFaixa, vibrante: cenaVibrante,
      }[modelo];
      fn(ctx, CENA_MODELO[tipo], lt, out, d, logo, contatos);
    }
    ctx.restore();
  }
  if (tipo === "preco") precoAntigo(ctx, d, lt, out, ocasiao, modelo === "revista" ? 775 : modelo === "faixa" ? 690 : 300);
  if (modelo === "postal") moldura(ctx, 1);
  camadaOcasiao(ctx, ocasiao, t, tipo, lt);
  ctx.globalAlpha = 1;
  semSombra(ctx);
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
    precoAntigo: "",
    pessoas: "para o casal",
    itens: ["Aéreo ida e volta", "Hotel all inclusive", "Traslados", "Seguro viagem"],
    destaques: ["Mar azul-turquesa", "Dias de puro descanso"],
    agencia: "Sua Agência",
    whatsapp: "(11) 99999-9999",
    instagram: "",
    facebook: "",
    email: "",
    site: "",
  });
  const [contatos, setContatos] = useState<Contato[]>(["whatsapp"]);
  const [modelo, setModelo] = useState<Modelo>("classico");
  const modeloRef = useRef<Modelo>("classico");
  modeloRef.current = modelo;
  // a oferta do mês já vem marcada (novembro: Black Friday; dezembro: Natal e Ano Novo; jan/fev: Carnaval)
  const sazonais = ocasioesDoMes();
  const [ocasiao, setOcasiao] = useState<Ocasiao>(sazonais.agora[0]?.id || "nenhuma");
  const [paleta, setPaleta] = useState("estilo");
  const [corLivre, setCorLivre] = useState({ c1: "#f5c451", c2: "#0ea5e9" });
  const [fonte, setFonte] = useState("Montserrat");
  const [resultados, setResultados] = useState<{ modelo: Modelo; url: string; nome: string }[]>([]);
  const [miniaturas, setMiniaturas] = useState<Partial<Record<Modelo, string>>>({});
  const ocasiaoRef = useRef<Ocasiao>("nenhuma");
  ocasiaoRef.current = ocasiao;
  const temaAtual = (): Tema => {
    if (paleta === "marca") return { c1: fabrica.primaryColor || undefined, c2: fabrica.secondaryColor || undefined, fonte };
    if (paleta === "livre") return { ...corLivre, fonte };
    const p = PALETAS.find((x) => x.id === paleta);
    return { c1: p?.c1, c2: p?.c2, fonte };
  };
  const temaRef = useRef<Tema>({ fonte: "Montserrat" });
  temaRef.current = temaAtual();
  const [fundos, setFundos] = useState<Midia[]>([]);
  const [pool, setPool] = useState<Midia[]>([]);
  const [editando, setEditando] = useState(false);
  const [telaAberta, setTelaAberta] = useState<number | null>(null);
  const [busca, setBusca] = useState("");
  const [buscando, setBuscando] = useState(false);
  const [fotoEtapa, setFotoEtapa] = useState<"" | "recebida" | "lendo" | "buscando" | "pronta" | "erro">("");
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

  // Carrega o fundo de cada tela (vídeos do destino ou fotos de reserva).
  async function carregarFundos(itens: Midia[]) {
    setCarregando(true);
    setFundos(itens.slice(0, CENAS));
    const els: Fundo[] = itens.slice(0, CENAS).map((m) => {
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

  async function enviar(conteudo: { text?: string; image?: string }, aoBuscar?: () => void): Promise<boolean> {
    const texto = (conteudo.text || "").trim();
    if (!conteudo.image && texto.length < 5) {
      setAviso("Mande o pacote: destino, preço e o que está incluso.");
      return false;
    }
    let ok = false;
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
        precoAntigo: d.precoAntigo || "",
        pessoas: d.pessoas || "",
        itens: d.itens || [],
        destaques: d.destaques?.length ? d.destaques : [],
        agencia: a.agencia === "Sua Agência" && d.agencia ? d.agencia : a.agencia,
        whatsapp: d.whatsapp && !fabrica.whatsapp ? d.whatsapp : a.whatsapp,
        instagram: d.instagram && !a.instagram ? d.instagram : a.instagram,
      }));
      if (d.instagram && !contatosRef.current.includes("instagram")) setContatos((c) => [...c, "instagram"]);
      const midias: Midia[] = data.midias || [];
      setPool(midias);
      if (midias.length === 0) {
        setAviso(`Não achei vídeos de ${d.destino}. Mantive os atuais.`);
      } else {
        setEtapa(`Carregando vídeos de ${d.destino}…`);
        aoBuscar?.();
        const lista = [...midias];
        while (lista.length < CENAS) lista.push(midias[lista.length % midias.length]);
        await carregarFundos(lista);
        const usadas = lista.slice(0, CENAS);
        setFontes({ videos: usadas.filter((m) => m.tipo === "video").length, fotos: usadas.filter((m) => m.tipo === "foto").length });
      }
      setEtapa("Pronto. Confira os campos e toque em Gerar vídeo.");
      ok = true;
    } catch (e) {
      setAviso((e as Error).message);
      setEtapa("");
    }
    setOcupado(false);
    return ok;
  }

  async function trocarFundo(i: number, m: Midia) {
    const novos = [...fundos];
    while (novos.length < CENAS) novos.push(novos[novos.length % Math.max(novos.length, 1)] || m);
    novos[i] = m;
    setUrl(null);
    try {
      await carregarFundos(novos);
      setTelaAberta(null);
    } catch (e) {
      setAviso((e as Error).message);
    }
  }

  async function buscarNoPexels() {
    if (busca.trim().length < 2) return;
    setBuscando(true);
    try {
      const { data: sess } = await supabase.auth.getSession();
      const { data, error } = await supabase.functions.invoke("fabrica-video-pronto", {
        body: { buscar: busca.trim() },
        headers: sess.session ? undefined : { "x-video-lab": "sem-login" },
      });
      if (error) throw new Error("A busca não respondeu. Tente de novo.");
      const novos: Midia[] = data.midias || [];
      if (!novos.length) setAviso(`Não achei vídeos de "${busca}".`);
      setPool((p) => [...novos, ...p.filter((x) => !novos.some((n) => n.url === x.url))]);
    } catch (e) {
      setAviso((e as Error).message);
    }
    setBuscando(false);
  }

  function usarArquivoProprio(i: number, file?: File | null) {
    if (!file) return;
    const tipo = file.type.startsWith("video/") ? "video" : "foto";
    trocarFundo(i, { tipo, url: URL.createObjectURL(file), nome: file.name });
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
    setAviso("");
    try {
      const img = await lerImagem(file);
      setFoto(img);
      setFotoEtapa("recebida");
    } catch (e) {
      setAviso((e as Error).message);
      setFotoEtapa("erro");
    }
  }

  async function enviarFoto() {
    if (!foto) return;
    setFotoEtapa("lendo");
    const ok = await enviar({ image: foto }, () => setFotoEtapa("buscando"));
    setFotoEtapa(ok ? "pronta" : "erro");
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
    link.href = "https://fonts.googleapis.com/css2?family=Montserrat:wght@300;500;600;700;800;900&family=Playfair+Display:ital,wght@0,700;1,400&family=Poppins:wght@300;500;600;700;800;900&family=Oswald:wght@300;500;600;700&family=Bebas+Neue&family=Nunito:wght@300;600;700;800;900&family=Raleway:wght@300;500;600;700;800;900&display=swap";
    document.head.appendChild(link);
    Promise.all([document.fonts.load("900 40px Montserrat"), document.fonts.load("700 40px 'Playfair Display'"), document.fonts.load("italic 400 40px 'Playfair Display'"), carregarFundos([...CLIPS, ...CLIPS].slice(0, CENAS).map((url) => ({ tipo: "video" as const, url })))]).catch((e) =>
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
      const sc = telaEm(t);
      if (sc !== lastScene) {
        const vs = vidsRef.current;
        const v = vs[sc % Math.max(vs.length, 1)];
        if (v && isVideo(v)) { v.currentTime = 0; v.play(); }
        lastScene = sc;
      }
      drawFrame(ctx, t, vidsRef.current, dadosRef.current, logoRef.current, contatosRef.current, modeloRef.current, ocasiaoRef.current, temaRef.current);
      raf = requestAnimationFrame(loop);
    };
    vidsRef.current.forEach((v) => isVideo(v) && v.play());
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [carregando, gravando]);

  // Atalho de teste: desenha um momento do vídeo num modelo e devolve a imagem.
  useEffect(() => {
    (window as unknown as Record<string, unknown>).__videoLabQuadro = (t: number, m: Modelo, oc: Ocasiao = "nenhuma", tema?: Tema) => {
      const c = document.createElement("canvas");
      c.width = W;
      c.height = H;
      drawFrame(c.getContext("2d")!, t, vidsRef.current, dadosRef.current, logoRef.current, contatosRef.current, m, oc, tema || temaRef.current);
      return c.toDataURL("image/jpeg", 0.8);
    };
  });

  useEffect(() => {
    if (carregando || gravando) return;
    const id = setTimeout(() => {
      const grande = document.createElement("canvas");
      grande.width = W;
      grande.height = H;
      const pequeno = document.createElement("canvas");
      pequeno.width = 108;
      pequeno.height = 192;
      const novas: Partial<Record<Modelo, string>> = {};
      for (const m of MODELOS) {
        drawFrame(grande.getContext("2d")!, 2.8, vidsRef.current, dadosRef.current, logoRef.current, contatosRef.current, m.id, ocasiaoRef.current, temaRef.current);
        pequeno.getContext("2d")!.drawImage(grande, 0, 0, 108, 192);
        novas[m.id] = pequeno.toDataURL("image/jpeg", 0.7);
      }
      setMiniaturas(novas);
    }, 700);
    return () => clearTimeout(id);
  }, [carregando, gravando, dados, ocasiao, paleta, corLivre, fonte, logo]);

  // Gera quadro a quadro (não depende de a tela estar visível nem da velocidade do aparelho).
  // fotografia das opções: mudar algo na tela durante a geração não altera o vídeo
  const fotografar = (modeloEscolhido: Modelo) => ({
    dados: structuredClone(dadosRef.current),
    logo: logoRef.current,
    contatos: [...contatosRef.current],
    modelo: modeloEscolhido,
    ocasiao: ocasiaoRef.current,
    tema: { ...temaRef.current },
  });

  const nomeArquivo = (m: Modelo) =>
    `video-${dadosRef.current.destino}-estilo${MODELOS.findIndex((x) => x.id === m) + 1}${ocasiaoRef.current !== "nenhuma" ? "-" + ocasiaoRef.current : ""}.mp4`;

  // 3 estilos diferentes: o escolhido e mais dois que combinam bem
  const ORDEM_SUGERIDA: Modelo[] = ["classico", "faixa", "cartao", "neon", "vibrante", "luxo", "passagem", "revista", "postal"];
  const tresEstilos = (): Modelo[] => [modeloRef.current, ...ORDEM_SUGERIDA.filter((m) => m !== modeloRef.current)].slice(0, 3);

  async function gerar() {
    setGravando(true);
    setUrl(null);
    setResultados([]);
    try {
      const m = modeloRef.current;
      const blob = await renderizar(fotografar(m), (p) => setStatus(`Gerando o vídeo… ${p}%`));
      const u = URL.createObjectURL(blob);
      setUrl(u);
      setResultados([{ modelo: m, url: u, nome: nomeArquivo(m) }]);
      setStatus("Pronto! Seu vídeo está abaixo.");
    } catch (e) {
      setStatus("Erro: " + (e as Error).message);
    }
    setGravando(false);
  }

  async function gerarTres() {
    setGravando(true);
    setUrl(null);
    setResultados([]);
    const lista = tresEstilos();
    const t0 = performance.now();
    try {
      for (let i = 0; i < lista.length; i++) {
        const m = lista[i];
        const blob = await renderizar(fotografar(m), (p) => setStatus(`Vídeo ${i + 1} de ${lista.length}… ${p}%`));
        const u = URL.createObjectURL(blob);
        if (i === 0) setUrl(u);
        setResultados((r) => [...r, { modelo: m, url: u, nome: nomeArquivo(m) }]);
      }
      const seg = ((performance.now() - t0) / 1000).toFixed(0);
      (window as unknown as { __videoLab3: unknown }).__videoLab3 = { seg };
      setStatus(`Pronto! ${lista.length} vídeos em ${seg}s. Escolha o seu abaixo.`);
    } catch (e) {
      setStatus("Erro: " + (e as Error).message);
    }
    setGravando(false);
  }

  async function compartilhar(r: { url: string; nome: string }) {
    try {
      const blob = await (await fetch(r.url)).blob();
      const file = new File([blob], r.nome, { type: "video/mp4" });
      const nav = navigator as Navigator & { canShare?: (d: { files: File[] }) => boolean };
      if (nav.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: `Pacote ${dadosRef.current.destino}` });
        return;
      }
    } catch (e) {
      if ((e as Error).name === "AbortError") return;
    }
    // sem compartilhamento (computador): baixa o arquivo
    const a = document.createElement("a");
    a.href = r.url;
    a.download = r.nome;
    a.click();
  }

  async function renderizar(foto0: ReturnType<typeof fotografar>, progresso: (p: number) => void): Promise<Blob> {
    const FPS = 30;
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    const vids = vidsRef.current;
    vids.forEach((v) => isVideo(v) && v.pause());
    {
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
      // Em vez de "pular" para cada quadro (lento: decodifica de novo a cada pulo),
      // cada vídeo toca normalmente e o quadro espera ele chegar no ponto certo.
      const tocando = new Set<number>();
      const esperar = (v: HTMLVideoElement, x: number) =>
        new Promise<void>((r) => {
          const alvo = x % Math.max(v.duration - 0.05, 0.5);
          const limite = performance.now() + 400;
          const checar = () => {
            const ct = v.currentTime;
            // chegou no ponto (ou deu a volta no loop) ou passou do tempo-limite
            if (ct >= alvo - 0.017 || (alvo > v.duration - 0.6 && ct < 0.3) || performance.now() > limite) r();
            else if ("requestVideoFrameCallback" in v) (v as HTMLVideoElement & { requestVideoFrameCallback: (cb: () => void) => void }).requestVideoFrameCallback(checar);
            else setTimeout(checar, 5);
          };
          checar();
        });
      const n = Math.round(TOTAL * FPS);
      for (let f = 0; f < n; f++) {
        const t = f / FPS;
        const ativos = [...Array(CENAS).keys()].filter((i) => t >= INICIOS[i] - FADE && t <= INICIOS[i] + TELAS[i].dur + FADE);
        // começa a tocar quem entrou e pausa quem saiu
        for (let i = 0; i < CENAS; i++) {
          const v = vids[i % Math.max(vids.length, 1)];
          if (!v || !isVideo(v)) continue;
          if (ativos.includes(i) && !tocando.has(i)) {
            tocando.add(i);
            v.currentTime = 0;
            await v.play().catch(() => undefined);
          } else if (!ativos.includes(i) && tocando.has(i)) {
            tocando.delete(i);
            v.pause();
          }
        }
        await Promise.all(ativos.map((i) => {
          const v = vids[i % Math.max(vids.length, 1)];
          return v && isVideo(v) ? esperar(v, Math.max(0, t - INICIOS[i] + FADE)) : Promise.resolve();
        }));
        drawFrame(ctx, t, vids, foto0.dados, foto0.logo, foto0.contatos, foto0.modelo, foto0.ocasiao, foto0.tema);
        const frame = new VideoFrame(canvas, { timestamp: Math.round((f * 1e6) / FPS), duration: Math.round(1e6 / FPS) });
        enc.encode(frame, { keyFrame: f % 60 === 0 });
        frame.close();
        if (f % 15 === 0) progresso(Math.round((f / n) * 100));
        if (enc.encodeQueueSize > 10) await new Promise((r) => setTimeout(r, 0));
      }
      await enc.flush();
      muxer.finalize();
      vids.forEach((v) => isVideo(v) && v.pause());
      return new Blob([muxer.target.buffer], { type: "video/mp4" });
    }
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
      <style>{`@keyframes cvScan { 0% { top: 0% } 50% { top: 97% } 100% { top: 0% } } .cv-scan { animation: cvScan 1.6s ease-in-out infinite; }`}</style>
      <h1 className="mb-1 text-xl font-bold">🎬 Vídeo pronto</h1>
      <p className="mb-4 text-sm text-neutral-400">Mande o pacote do jeito que preferir. A IA acha o destino, preenche tudo e monta 3 vídeos para você escolher.</p>
      <div className="mx-auto grid max-w-5xl gap-4 pb-28 lg:grid-cols-[28rem_1fr] lg:pb-4">
        <div className="flex min-w-0 flex-col gap-3 lg:col-start-1">
          <p className="text-xs font-bold uppercase tracking-wide text-violet-300">1. Mande o pacote</p>
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
            <div className="flex flex-col gap-3">
              {!foto ? (
                <label className="flex cursor-pointer flex-col items-center gap-2 rounded-xl border-2 border-dashed border-violet-500/60 bg-violet-500/5 p-6 text-center transition hover:bg-violet-500/10">
                  <span className="text-4xl">📸</span>
                  <span className="font-semibold">Toque para escolher a foto ou o print do pacote</span>
                  <span className="text-xs text-neutral-400">De operadora, de post ou do WhatsApp. No computador, dá para colar com Ctrl+V.</span>
                  <input id="foto" type="file" accept="image/*" className="hidden" onChange={(e) => onFoto(e.target.files?.[0])} />
                </label>
              ) : (
                <div className="flex flex-col gap-3 rounded-xl border border-neutral-700 bg-neutral-900 p-3">
                  <div className="relative mx-auto overflow-hidden rounded-lg">
                    <img src={foto} alt="Foto do pacote" className="max-h-64 rounded-lg" />
                    {(fotoEtapa === "lendo" || fotoEtapa === "buscando") && (
                      <>
                        <div className="absolute inset-0 bg-violet-900/30" />
                        <div className="cv-scan absolute inset-x-0 h-1.5 bg-gradient-to-r from-transparent via-amber-300 to-transparent shadow-[0_0_24px_6px_rgba(252,211,77,.7)]" />
                      </>
                    )}
                    {fotoEtapa === "pronta" && (
                      <div className="absolute right-2 top-2 rounded-full bg-green-600 px-3 py-1 text-xs font-bold">✓ Lida</div>
                    )}
                  </div>
                  {fotoEtapa === "recebida" && (
                    <p id="foto-recebida" className="flex items-center gap-2 rounded-lg bg-green-500/15 p-2 text-sm font-semibold text-green-300">
                      <span className="grid h-6 w-6 place-items-center rounded-full bg-green-600 text-white">✓</span>
                      Foto recebida! Agora é só enviar.
                    </p>
                  )}
                  {(fotoEtapa === "lendo" || fotoEtapa === "buscando" || fotoEtapa === "pronta") && (
                    <ol id="foto-passos" className="flex flex-col gap-1.5 text-sm">
                      {[
                        { nome: "Foto recebida", feito: true },
                        { nome: "Lendo destino, preço e inclusos da imagem", feito: fotoEtapa !== "lendo", agora: fotoEtapa === "lendo" },
                        { nome: "Buscando vídeos do destino", feito: fotoEtapa === "pronta", agora: fotoEtapa === "buscando" },
                      ].map((p) => (
                        <li key={p.nome} className={`flex items-center gap-2 ${p.feito ? "text-green-300" : p.agora ? "text-amber-200" : "text-neutral-500"}`}>
                          {p.feito ? (
                            <span className="grid h-5 w-5 place-items-center rounded-full bg-green-600 text-[11px] text-white">✓</span>
                          ) : p.agora ? (
                            <span className="h-5 w-5 animate-spin rounded-full border-2 border-amber-300 border-t-transparent" />
                          ) : (
                            <span className="h-5 w-5 rounded-full border-2 border-neutral-600" />
                          )}
                          {p.nome}
                        </li>
                      ))}
                    </ol>
                  )}
                  {fotoEtapa !== "lendo" && fotoEtapa !== "buscando" && (
                    <div className="flex gap-2">
                      <button
                        id="enviar-foto"
                        onClick={enviarFoto}
                        disabled={ocupado}
                        className={`flex-1 rounded-lg px-4 py-3 font-bold disabled:opacity-60 ${fotoEtapa === "pronta" ? "bg-neutral-700" : "animate-pulse bg-violet-600"}`}
                      >
                        {fotoEtapa === "pronta" ? "Ler de novo" : "📤 Enviar foto e montar o vídeo"}
                      </button>
                      <label className="cursor-pointer rounded-lg border border-neutral-600 px-3 py-3 text-sm">
                        Trocar
                        <input type="file" accept="image/*" className="hidden" onChange={(e) => onFoto(e.target.files?.[0])} />
                      </label>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {etapa && <p id="etapa" className="text-sm text-violet-300">{etapa}</p>}
          {aviso && <p id="aviso" className="rounded-lg bg-red-500/15 p-3 text-sm text-red-200">{aviso}</p>}
          {fontes && (
            <p id="fontes" className="text-xs text-neutral-500">
              Fundo: {fontes.videos} vídeo(s){fontes.fotos ? ` e ${fontes.fotos} foto(s)` : ""} do Pexels
            </p>
          )}

        </div>

        <div id="previa" className="lg:sticky lg:top-4 lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:self-start">
          <canvas ref={canvasRef} width={W} height={H} className="mx-auto block w-full max-w-[220px] rounded-xl border border-neutral-800 sm:max-w-[300px] lg:max-w-[360px]" />
          <p className="mt-1 text-center text-[11px] text-neutral-500">Prévia ao vivo</p>
        </div>

        <div className="flex min-w-0 flex-col gap-3 lg:col-start-1">
          <p className="text-xs font-bold uppercase tracking-wide text-violet-300">2. Escolha o visual</p>
          <h2 className="mt-2 text-sm font-bold text-neutral-200">Oferta sazonal</h2>
          {sazonais.agora.length > 0 && <p className="-mt-2 text-xs text-amber-300">Deste mês já aparecem primeiro.</p>}
          <div className="flex flex-wrap gap-1.5">
            {sazonais.lista.map((o) => (
              <button
                key={o.id}
                id={`ocasiao-${o.id}`}
                disabled={gravando}
                onClick={() => setOcasiao(o.id)}
                className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold ${ocasiao === o.id ? "border-amber-400 bg-amber-400/15" : "border-neutral-700 bg-neutral-900"}`}
              >
                {o.nome}
                {sazonais.agora.some((a) => a.id === o.id) && <span className="ml-1 text-amber-300">• agora</span>}
              </button>
            ))}
          </div>

          <h2 className="mt-2 text-sm font-bold text-neutral-200">Estilo</h2>
          <div className="-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1 sm:grid sm:grid-cols-5 sm:overflow-visible">
            {MODELOS.map((m, i) => (
              <button
                key={m.id}
                id={`modelo-${m.id}`}
                title={m.nome}
                disabled={gravando}
                onClick={() => setModelo(m.id)}
                className={`w-16 shrink-0 overflow-hidden rounded-md border text-center sm:w-auto ${modelo === m.id ? "border-amber-400 ring-2 ring-amber-400/40" : "border-neutral-700"}`}
              >
                {miniaturas[m.id] ? (
                  <img src={miniaturas[m.id]} alt={m.nome} className="aspect-[9/16] w-full object-cover" />
                ) : (
                  <div className="aspect-[9/16] w-full bg-neutral-800" />
                )}
                <p className="py-0.5 text-[11px] font-semibold">{i + 1}</p>
              </button>
            ))}
          </div>

          <h2 className="mt-2 text-sm font-bold text-neutral-200">Cores</h2>
          <div className="flex flex-wrap gap-1.5">
            {PALETAS.map((p) => {
              const c1 = p.id === "marca" ? fabrica.primaryColor : p.id === "livre" ? corLivre.c1 : p.c1;
              const c2 = p.id === "marca" ? fabrica.secondaryColor : p.id === "livre" ? corLivre.c2 : p.c2;
              return (
                <button
                  key={p.id}
                  id={`paleta-${p.id}`}
                  disabled={gravando}
                  onClick={() => setPaleta(p.id)}
                  className={`flex items-center gap-1 rounded-full border px-2 py-1 text-[11px] ${paleta === p.id ? "border-amber-400 bg-amber-400/15" : "border-neutral-700 bg-neutral-900"}`}
                >
                  {c1 && <span className="h-3 w-3 rounded-full" style={{ background: c1 }} />}
                  {c2 && <span className="-ml-1.5 h-3 w-3 rounded-full ring-1 ring-neutral-900" style={{ background: c2 }} />}
                  {p.nome}
                </button>
              );
            })}
          </div>
          {paleta === "livre" && (
            <div className="flex items-center gap-3 text-xs">
              <label className="flex items-center gap-1">Cor 1 <input id="cor1" type="color" value={corLivre.c1} onChange={(e) => setCorLivre((c) => ({ ...c, c1: e.target.value }))} /></label>
              <label className="flex items-center gap-1">Cor 2 <input id="cor2" type="color" value={corLivre.c2} onChange={(e) => setCorLivre((c) => ({ ...c, c2: e.target.value }))} /></label>
            </div>
          )}

          <h2 className="mt-2 text-sm font-bold text-neutral-200">Fonte</h2>
          <div className="flex flex-wrap gap-1.5">
            {FONTES.map((fo) => (
              <button
                key={fo}
                id={`fonte-${fo.replace(/\s/g, "")}`}
                disabled={gravando}
                onClick={() => setFonte(fo)}
                style={{ fontFamily: `'${fo}', sans-serif` }}
                className={`rounded-full border px-2.5 py-1 text-xs ${fonte === fo ? "border-amber-400 bg-amber-400/15" : "border-neutral-700 bg-neutral-900"}`}
              >
                {fo}
              </button>
            ))}
          </div>
          <details id="informacoes" className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-3">
            <summary className="cursor-pointer text-sm font-bold text-neutral-200">
              3. Confira as informações <span className="font-normal text-neutral-400">(destino, preço, inclusos, contatos)</span>
            </summary>
            <div className="mt-3 flex flex-col gap-3">
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
          {dados.pagamento !== "free_quote" && (
            <div>
              <label className={rotulo}>Preço antigo, riscado (opcional, ex.: R$ 4.990)</label>
              <input id="campo-precoAntigo" className={campo} value={dados.precoAntigo} onChange={(e) => set("precoAntigo", e.target.value)} />
            </div>
          )}
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

            </div>
          </details>

          <div className="fixed inset-x-0 bottom-0 z-20 border-t border-neutral-800 bg-neutral-950/95 p-3 backdrop-blur lg:static lg:border-0 lg:bg-transparent lg:p-0">
            <div className="mx-auto flex max-w-md flex-col gap-1.5">
              <button
                id="gerar3"
                disabled={carregando || gravando || ocupado}
                className="rounded-xl bg-amber-400 px-4 py-3.5 text-base font-bold text-black shadow-lg disabled:opacity-50"
                onClick={gerarTres}
              >
                {gravando ? status : "🎬 Gerar 3 vídeos"}
              </button>
              {!gravando && (
                <button id="gerar" disabled={carregando || ocupado} className="text-xs text-neutral-400 underline disabled:opacity-50" onClick={gerar}>
                  Gerar só o estilo {MODELOS.findIndex((m) => m.id === modelo) + 1}
                </button>
              )}
            </div>
          </div>
          <p id="status" className="text-sm text-neutral-300">{status}</p>
          {resultados.length > 0 && (
            <div id="resultados" className="flex flex-col gap-2">
              <p className="text-xs font-bold uppercase tracking-wide text-violet-300">Seus vídeos</p>
              <div className="flex snap-x gap-3 overflow-x-auto pb-2">
                {resultados.map((r) => (
                  <div key={r.url} className="w-40 shrink-0 snap-start rounded-xl border border-neutral-800 bg-neutral-900 p-2 sm:w-48">
                    <video src={r.url} controls playsInline muted loop className="aspect-[9/16] w-full rounded-lg bg-black" />
                    <p className="mt-1 text-center text-xs font-semibold">Estilo {MODELOS.findIndex((m) => m.id === r.modelo) + 1}</p>
                    <div className="mt-1 flex flex-col gap-1">
                      <button onClick={() => compartilhar(r)} className="rounded-lg bg-green-600 px-2 py-2 text-xs font-bold">📲 Compartilhar</button>
                      <a id="baixar" href={r.url} download={r.nome} className="rounded-lg bg-neutral-700 px-2 py-2 text-center text-xs font-semibold">⬇️ Baixar</a>
                      <button
                        onClick={() => { setModelo(r.modelo); setUrl(r.url); setEditando(true); }}
                        className="rounded-lg border border-violet-500 px-2 py-1.5 text-xs text-violet-200"
                      >
                        ✏️ Editar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {editando && (
            <div id="editor" className="flex flex-col gap-2 rounded-xl border border-violet-500/50 bg-neutral-900 p-3">
              <div className="flex items-center justify-between">
                <h2 className="font-bold">Editar vídeo</h2>
                <button className="text-sm text-neutral-400" onClick={() => { setEditando(false); setTelaAberta(null); }}>Fechar</button>
              </div>
              <p className="text-xs text-neutral-400">Troque o fundo de qualquer tela ou mude o texto. Depois toque em Gerar vídeo de novo.</p>
              {TELAS.map((tela, i) => {
                const m = fundos[i % Math.max(fundos.length, 1)];
                const nDest = TELAS.slice(0, i).filter((x) => x.tipo === "destaque").length;
                return (
                  <div key={i} className="rounded-lg border border-neutral-700 p-2">
                    <div className="flex items-center gap-2">
                      <div className="h-20 w-12 shrink-0 overflow-hidden rounded bg-neutral-800">
                        {m?.thumb ? (
                          <img src={m.thumb} alt="" className="h-full w-full object-cover" />
                        ) : m?.tipo === "foto" ? (
                          <img src={m.url} alt="" className="h-full w-full object-cover" />
                        ) : m ? (
                          <video src={m.url} muted className="h-full w-full object-cover" />
                        ) : null}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold">{i + 1}. {tela.nome} <span className="text-xs text-neutral-500">({tela.dur}s)</span></p>
                        {tela.tipo === "abertura" && (
                          <input className={campo + " mt-1"} value={dados.chamada} onChange={(e) => set("chamada", e.target.value)} />
                        )}
                        {tela.tipo === "destaque" && (
                          <input
                            className={campo + " mt-1"}
                            value={dados.destaques[nDest] || ""}
                            placeholder="Frase desta tela"
                            onChange={(e) => {
                              const ds = [...dados.destaques];
                              ds[nDest] = e.target.value;
                              set("destaques", ds);
                            }}
                          />
                        )}
                        {tela.tipo === "preco" && (
                          <input className={campo + " mt-1"} value={dados.preco} onChange={(e) => set("preco", e.target.value)} />
                        )}
                        {tela.tipo === "inclusos" && <p className="text-xs text-neutral-500">Os itens ficam no campo "O que está incluso".</p>}
                        {tela.tipo === "contato" && <p className="text-xs text-neutral-500">Os contatos ficam em "Final do vídeo".</p>}
                      </div>
                      <button
                        id={`trocar-${i}`}
                        onClick={() => setTelaAberta(telaAberta === i ? null : i)}
                        className="rounded-lg bg-violet-600 px-3 py-2 text-xs font-bold"
                      >
                        Trocar fundo
                      </button>
                    </div>
                    {telaAberta === i && (
                      <div className="mt-2 flex flex-col gap-2">
                        <div className="flex gap-2">
                          <input
                            className={campo}
                            placeholder={`Buscar no Pexels (ex.: ${dados.destino} praia)`}
                            value={busca}
                            onChange={(e) => setBusca(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && buscarNoPexels()}
                          />
                          <button onClick={buscarNoPexels} disabled={buscando} className="rounded-lg bg-neutral-700 px-3 text-sm">
                            {buscando ? "…" : "Buscar"}
                          </button>
                        </div>
                        <div className="grid grid-cols-4 gap-1">
                          {pool.map((p) => (
                            <button key={p.url} onClick={() => trocarFundo(i, p)} className="relative h-24 overflow-hidden rounded border border-neutral-700 hover:border-amber-400">
                              <img src={p.thumb || p.url} alt="" className="h-full w-full object-cover" />
                              {p.tipo === "video" && <span className="absolute bottom-0.5 right-0.5 rounded bg-black/70 px-1 text-[10px]">▶</span>}
                            </button>
                          ))}
                        </div>
                        <label className="cursor-pointer rounded-lg border border-dashed border-neutral-600 p-2 text-center text-sm">
                          📁 Usar um vídeo ou foto meu
                          <input type="file" accept="video/*,image/*" className="hidden" onChange={(e) => usarArquivoProprio(i, e.target.files?.[0])} />
                        </label>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
