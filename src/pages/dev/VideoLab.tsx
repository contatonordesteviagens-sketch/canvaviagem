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

const NEON = "#eaff2b";
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
    ctx.fillStyle = "#1b1404";
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
      ctx.fillStyle = "#111";
      ctx.fill();
      ctx.fillStyle = NEON;
      ctx.fillText("OFERTA ESPECIAL", 72, 364);
      ctx.fillStyle = "#111";
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
    faixaNeon(ctx, 0, 620, cw, 70, kc, "#111");
    ctx.fillStyle = "#fff";
    ctx.fillText(d.chamada, 30, 667);
  }
  if (cena === 1) {
    ctx.globalAlpha = out;
    faixaNeon(ctx, 0, 380, W - 60, 110, k1, "#111");
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
      iconeCheck(ctx, 52, y + 40, 20, "#111", NEON);
      ctx.fillStyle = "#111";
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
    ctx.fillStyle = "#111";
    const ts = fitText(ctx, pt.topo.toUpperCase(), 800, 40, W - 100);
    ctx.font = `800 ${ts}px Montserrat, Arial`;
    ctx.fillText(pt.topo.toUpperCase(), W / 2, 520);
    ctx.save();
    ctx.translate(W / 2, 680);
    ctx.scale(0.7 + 0.3 * kp, 0.7 + 0.3 * kp);
    textoPreco(ctx, pt.valor, 0, 0, 160, W - 80, "#111");
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
      ctx.fillStyle = "#111";
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
  ctx.fillStyle = "#111";
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
const AZUL = "#1d4ed8";
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
  ctx.strokeStyle = "#c2410c";
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.arc(0, 0, 92, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(0, 0, 78, 0, Math.PI * 2);
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.fillStyle = "#c2410c";
  ctx.textAlign = "center";
  const s = fitText(ctx, txt, 900, 30, 140);
  ctx.font = `900 ${s}px Montserrat, Arial`;
  ctx.fillText(txt, 0, 10);
  ctx.restore();
}
function cenaPostal(ctx: CanvasRenderingContext2D, cena: number, lt: number, out: number, d: Dados, logo: HTMLImageElement | null, contatos: Contato[]) {
  ctx.globalAlpha = 1;
  moldura(ctx, ease(lt / 0.4));
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
    ctx.fillStyle = "#7c2d12";
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
    ctx.fillStyle = "#7c2d12";
    ctx.font = "italic 400 40px 'Playfair Display', Georgia, serif";
    ctx.fillText(pt.topo, W / 2, 710);
    textoPreco(ctx, pt.valor, W / 2, 840, 120, W - 220, "#7c2d12");
    ctx.font = "500 30px Montserrat, Arial";
    ctx.fillStyle = "#57534e";
    ctx.fillText(pt.rodape, W / 2, 895);
    selo(ctx, W - 170, 640, "OFERTA", -0.2, back((lt - 0.5) / 0.5));
  }
  if (cena === 3) {
    cartaoPapel(300, 760);
    desenharLogo(ctx, d, logo, W / 2, 440, 100, 1, "#fff");
    ctx.textAlign = "center";
    ctx.fillStyle = "#7c2d12";
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
function cenaFaixa(ctx: CanvasRenderingContext2D, cena: number, lt: number, out: number, d: Dados, logo: HTMLImageElement | null, contatos: Contato[]) {
  const k = ease(lt / 0.5);
  ctx.globalAlpha = out;
  ctx.textAlign = "left";
  if (cena === 0) {
    painel(ctx, 860, k);
    ctx.globalAlpha = out * ease((lt - 0.3) / 0.4);
    ctx.fillStyle = NEON;
    ctx.font = "800 26px Montserrat, Arial";
    ctx.fillText("PACOTE", 50, 930);
    const s = fitText(ctx, d.destino.toUpperCase(), 900, 96, W - 100);
    ctx.font = `900 ${s}px Montserrat, Arial`;
    ctx.fillStyle = "#fff";
    ctx.fillText(d.destino.toUpperCase(), 46, 1030);
    const cs = fitText(ctx, d.chamada, 600, 32, W - 100);
    ctx.font = `600 ${cs}px Montserrat, Arial`;
    ctx.fillStyle = "#d4d4d8";
    ctx.fillText(d.chamada, 50, 1090);
  }
  if (cena === 1) {
    const itens = d.itens.filter(Boolean).slice(0, 4);
    const y0 = H - 160 - itens.length * 76;
    painel(ctx, y0, k);
    ctx.fillStyle = NEON;
    ctx.font = "900 40px Montserrat, Arial";
    ctx.globalAlpha = out * k;
    ctx.fillText("ESTÁ INCLUSO", 50, y0 + 80);
    itens.forEach((it, i) => {
      const ki = ease((lt - 0.3 - i * 0.15) / 0.4);
      ctx.globalAlpha = out * ki;
      iconeCheck(ctx, 68, y0 + 145 + i * 76, 18, NEON, "#111");
      const fs = fitText(ctx, it, 700, 34, W - 160);
      ctx.font = `700 ${fs}px Montserrat, Arial`;
      ctx.fillStyle = "#fff";
      ctx.fillText(it, 104, y0 + 157 + i * 76);
    });
  }
  if (cena === 2) {
    const pt = precoTextos(d);
    painel(ctx, 820, k);
    ctx.globalAlpha = out * ease((lt - 0.3) / 0.4);
    ctx.fillStyle = "#d4d4d8";
    ctx.font = "800 30px Montserrat, Arial";
    ctx.fillText(pt.topo.toUpperCase(), 50, 900);
    ctx.save();
    ctx.translate(46, 1050);
    const kp = back((lt - 0.35) / 0.5);
    ctx.scale(0.8 + 0.2 * kp, 0.8 + 0.2 * kp);
    textoPreco(ctx, pt.valor, 0, 0, 150, W - 100, NEON);
    ctx.restore();
    ctx.fillStyle = "#fff";
    ctx.font = "600 32px Montserrat, Arial";
    ctx.fillText(pt.rodape, 50, 1110);
  }
  if (cena === 3) {
    painel(ctx, 560, k);
    desenharLogo(ctx, d, logo, W / 2, 400, 120, back(lt / 0.6));
    ctx.textAlign = "center";
    ctx.globalAlpha = ease((lt - 0.4) / 0.4);
    ctx.fillStyle = NEON;
    ctx.font = "900 60px Montserrat, Arial";
    ctx.fillText("FALE COM A GENTE", W / 2, 690);
    desenharPilulas(ctx, d, contatos, 790, lt, 82);
  }
  ctx.globalAlpha = 1;
}

// ---------- Vibrante: degradê roxo e rosa, formas redondas
function cenaVibrante(ctx: CanvasRenderingContext2D, cena: number, lt: number, out: number, d: Dados, logo: HTMLImageElement | null, contatos: Contato[]) {
  const k = ease(lt / 0.5);
  const gradBloco = (x: number, y: number, w: number, h: number) => {
    const g = ctx.createLinearGradient(x, y, x + w, y + h);
    g.addColorStop(0, "#7c3aed");
    g.addColorStop(1, "#ec4899");
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
    ctx.fillStyle = "#7c3aed";
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
      ctx.fillStyle = i % 2 ? "#7c3aed" : "#fff";
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

// ---------------- Ofertas sazonais: camada por cima de qualquer modelo ----------------
type Ocasiao = "nenhuma" | "blackfriday" | "natal" | "anonovo" | "carnaval";
const OCASIOES: { id: Ocasiao; nome: string; selo: string }[] = [
  { id: "nenhuma", nome: "Nenhuma", selo: "" },
  { id: "blackfriday", nome: "🖤 Black Friday", selo: "BLACK FRIDAY" },
  { id: "natal", nome: "🎄 Natal", selo: "OFERTA DE NATAL" },
  { id: "anonovo", nome: "✨ Ano Novo", selo: "ESPECIAL ANO NOVO" },
  { id: "carnaval", nome: "🎭 Carnaval", selo: "PROMO DE CARNAVAL" },
];

// número pseudoaleatório fixo por índice (as partículas não "pulam" entre quadros)
const rnd = (i: number, s = 1) => {
  const x = Math.sin(i * 127.1 + s * 311.7) * 43758.5453;
  return x - Math.floor(x);
};

function neve(ctx: CanvasRenderingContext2D, t: number) {
  ctx.fillStyle = "rgba(255,255,255,.9)";
  for (let i = 0; i < 70; i++) {
    const r = 2 + rnd(i, 2) * 5;
    const vel = 40 + rnd(i, 3) * 90;
    const y = ((rnd(i, 4) * H + t * vel) % (H + 20)) - 10;
    const x = rnd(i, 5) * W + Math.sin(t * 1.3 + i) * 18;
    ctx.globalAlpha = 0.45 + rnd(i, 6) * 0.5;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

const CORES_CARNAVAL = ["#facc15", "#ec4899", "#22c55e", "#3b82f6", "#f97316", "#a855f7"];
function confete(ctx: CanvasRenderingContext2D, t: number) {
  for (let i = 0; i < 80; i++) {
    const vel = 90 + rnd(i, 3) * 140;
    const y = ((rnd(i, 4) * H + t * vel) % (H + 30)) - 15;
    const x = rnd(i, 5) * W + Math.sin(t * 2 + i) * 22;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(t * (2 + rnd(i, 7) * 4) + i);
    ctx.fillStyle = CORES_CARNAVAL[i % CORES_CARNAVAL.length];
    ctx.globalAlpha = 0.9;
    ctx.fillRect(-7, -3.5, 14, 7);
    ctx.restore();
  }
  ctx.globalAlpha = 1;
}

function fogos(ctx: CanvasRenderingContext2D, t: number) {
  // explosões douradas que se repetem
  for (let b = 0; b < 4; b++) {
    const ciclo = 2.4;
    const fase = ((t + b * 0.6) % ciclo) / ciclo;
    const n = Math.floor((t + b * 0.6) / ciclo);
    const cx = 120 + rnd(b + n * 7, 1) * (W - 240);
    const cy = 140 + rnd(b + n * 7, 2) * 380;
    const raio = 30 + fase * 150;
    ctx.globalAlpha = Math.max(0, 1 - fase) * 0.9;
    for (let i = 0; i < 18; i++) {
      const a = (i / 18) * Math.PI * 2;
      ctx.fillStyle = i % 2 ? "#fde68a" : "#f5c451";
      ctx.beginPath();
      ctx.arc(cx + Math.cos(a) * raio, cy + Math.sin(a) * raio + fase * fase * 40, 3.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  // brilhos piscando
  for (let i = 0; i < 26; i++) {
    const pisca = (Math.sin(t * 3 + i * 1.7) + 1) / 2;
    ctx.globalAlpha = pisca * 0.8;
    ctx.fillStyle = "#fff7d6";
    const x = rnd(i, 8) * W;
    const y = rnd(i, 9) * H;
    const r = 2 + pisca * 3;
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
  const cores: Record<Exclude<Ocasiao, "nenhuma">, { fundo: string | null; texto: string; borda: string }> = {
    blackfriday: { fundo: "#0a0a0a", texto: "#f5c451", borda: "#f5c451" },
    natal: { fundo: "#b91c1c", texto: "#fff", borda: "#16a34a" },
    anonovo: { fundo: null, texto: "#1a1406", borda: "#fff3c4" },
    carnaval: { fundo: null, texto: "#fff", borda: "#facc15" },
  };
  const c = cores[oc as Exclude<Ocasiao, "nenhuma">];
  ctx.save();
  ctx.globalAlpha = k;
  ctx.font = "900 30px Montserrat, Arial";
  ctx.textAlign = "center";
  const w = ctx.measureText(info.selo).width + 70;
  const x = (W - w) / 2;
  const y = 92 - (1 - k) * 40;
  roundRect(ctx, x, y, w, 62, 31);
  if (oc === "anonovo") {
    const g = ctx.createLinearGradient(x, 0, x + w, 0);
    g.addColorStop(0, "#fff1c2");
    g.addColorStop(0.5, "#f5c451");
    g.addColorStop(1, "#c08a1e");
    ctx.fillStyle = g;
  } else if (oc === "carnaval") {
    const g = ctx.createLinearGradient(x, 0, x + w, 0);
    g.addColorStop(0, "#ec4899");
    g.addColorStop(0.5, "#a855f7");
    g.addColorStop(1, "#f97316");
    ctx.fillStyle = g;
  } else ctx.fillStyle = c.fundo!;
  sombra(ctx, 24, "rgba(0,0,0,.4)");
  ctx.fill();
  semSombra(ctx);
  ctx.strokeStyle = c.borda;
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.fillStyle = c.texto;
  ctx.fillText(info.selo, W / 2, y + 42);
  ctx.restore();
}

// Preço antigo riscado com o desconto, logo acima da área do preço
function precoAntigo(ctx: CanvasRenderingContext2D, d: Dados, lt: number, out: number, oc: Ocasiao, y = 250) {
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
  ctx.font = "800 40px Montserrat, Arial";
  const tw = ctx.measureText(txt).width;
  const bw = tw + 60 + (pct ? 150 : 0);
  roundRect(ctx, -bw / 2, -46, bw, 76, 38);
  ctx.fillStyle = "rgba(10,10,12,.82)";
  ctx.fill();
  const xTxt = pct ? -bw / 2 + 30 + tw / 2 : 0;
  ctx.fillStyle = "#e5e7eb";
  ctx.fillText(txt, xTxt, 6);
  ctx.strokeStyle = "#ef4444";
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(xTxt - tw / 2 - 6, -6);
  ctx.lineTo(xTxt + tw / 2 + 6, -6);
  ctx.stroke();
  if (pct) {
    roundRect(ctx, bw / 2 - 150, -40, 140, 64, 32);
    ctx.fillStyle = oc === "blackfriday" ? GOLD : "#ef4444";
    ctx.fill();
    ctx.fillStyle = oc === "blackfriday" ? "#111" : "#fff";
    ctx.font = "900 36px Montserrat, Arial";
    ctx.fillText(`-${pct}%`, bw / 2 - 80, 5);
  }
  ctx.restore();
}

function camadaOcasiao(ctx: CanvasRenderingContext2D, oc: Ocasiao, t: number, tipo: Tela, lt: number) {
  if (oc === "nenhuma") return;
  if (oc === "blackfriday") {
    // borda dourada fina e faixa preta no rodapé com o texto correndo
    ctx.strokeStyle = "rgba(245,196,81,.9)";
    ctx.lineWidth = 6;
    ctx.strokeRect(12, 12, W - 24, H - 24);
    ctx.fillStyle = "#0a0a0a";
    ctx.fillRect(0, H - 54, W, 54);
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, H - 54, W, 54);
    ctx.clip();
    ctx.fillStyle = GOLD;
    ctx.font = "900 26px Montserrat, Arial";
    ctx.textAlign = "left";
    (ctx as unknown as { letterSpacing: string }).letterSpacing = "0px";
    const pedacos = ["BLACK FRIDAY", "•", "OFERTA POR TEMPO LIMITADO", "•"];
    const larg = pedacos.map((p) => ctx.measureText(p).width);
    const ciclo = larg.reduce((a, w) => a + w + 24, 0);
    let x = -((t * 90) % ciclo);
    while (x < W) {
      pedacos.forEach((p, i) => {
        ctx.fillText(p, x, H - 18);
        x += larg[i] + 24;
      });
    }
    ctx.restore();
  }
  if (oc === "natal") neve(ctx, t);
  if (oc === "carnaval") confete(ctx, t);
  if (oc === "anonovo") fogos(ctx, t);
  // selo na abertura e no preço
  if (tipo === "abertura" || tipo === "preco") seloOcasiao(ctx, oc, ease(lt / 0.5));
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
    moldura(ctx, 1);
    ctx.globalAlpha = out * k;
    const s = fitText(ctx, texto, 400, 60, W - 120);
    ctx.font = `italic 400 ${s}px 'Playfair Display', Georgia, serif`;
    sombra(ctx, 20);
    ctx.fillStyle = "#fff";
    ctx.fillText(texto, W / 2, 1020);
    semSombra(ctx);
  } else if (modelo === "faixa") {
    painel(ctx, 960, k);
    ctx.textAlign = "left";
    const s = fitText(ctx, texto, 900, 50, W - 100);
    ctx.font = `900 ${s}px Montserrat, Arial`;
    ctx.fillStyle = "#fff";
    ctx.fillText(texto, 50, 1080);
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
    g.addColorStop(0, "#7c3aed");
    g.addColorStop(1, "#ec4899");
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
) {
  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, W, H);

  // fundo: um vídeo (ou foto) por tela, com zoom lento e fusão entre telas
  for (let i = 0; i < CENAS; i++) {
    const m = vids[i % Math.max(vids.length, 1)];
    if (!m) continue;
    const dur = TELAS[i].dur;
    const local = t - INICIOS[i];
    if (local < -FADE || local > dur + FADE) continue;
    ctx.globalAlpha = i === 0 ? 1 : clamp01(ease((local + FADE) / FADE));
    const p = clamp01(local / dur);
    if (isVideo(m)) drawCover(ctx, m, 1.04 + 0.08 * p);
    else {
      // foto: zoom e passeio lateral alternando o lado
      ctx.save();
      ctx.translate((i % 2 ? -1 : 1) * (p - 0.5) * 60, 0);
      drawCover(ctx, m, 1.08 + 0.14 * p);
      ctx.restore();
    }
  }
  ctx.globalAlpha = 1;

  const cena = telaEm(t);
  const lt = t - INICIOS[cena];
  const dur = TELAS[cena].dur;
  const out = cena === CENAS - 1 ? 1 : 1 - ease((lt - (dur - 0.35)) / 0.35);

  // escurece para dar leitura
  const g = ctx.createLinearGradient(0, 0, 0, H);
  if (cena === CENAS - 1) {
    g.addColorStop(0, "rgba(5,8,20,.55)");
    g.addColorStop(1, "rgba(5,8,20,.85)");
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

  const tipo = TELAS[cena].tipo;
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
  if (tipo === "preco") precoAntigo(ctx, d, lt, out, ocasiao, modelo === "revista" ? 790 : 250);
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
  const [ocasiao, setOcasiao] = useState<Ocasiao>("nenhuma");
  const ocasiaoRef = useRef<Ocasiao>("nenhuma");
  ocasiaoRef.current = ocasiao;
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
    link.href = "https://fonts.googleapis.com/css2?family=Montserrat:wght@500;600;700;800;900&family=Playfair+Display:ital,wght@0,700;1,400&display=swap";
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
      drawFrame(ctx, t, vidsRef.current, dadosRef.current, logoRef.current, contatosRef.current, modeloRef.current, ocasiaoRef.current);
      raf = requestAnimationFrame(loop);
    };
    vidsRef.current.forEach((v) => isVideo(v) && v.play());
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [carregando, gravando]);

  // Atalho de teste: desenha um momento do vídeo num modelo e devolve a imagem.
  useEffect(() => {
    (window as unknown as Record<string, unknown>).__videoLabQuadro = (t: number, m: Modelo, oc: Ocasiao = "nenhuma") => {
      const c = document.createElement("canvas");
      c.width = W;
      c.height = H;
      drawFrame(c.getContext("2d")!, t, vidsRef.current, dadosRef.current, logoRef.current, contatosRef.current, m, oc);
      return c.toDataURL("image/jpeg", 0.8);
    };
  });

  // Gera quadro a quadro (não depende de a tela estar visível nem da velocidade do aparelho).
  async function gerar() {
    // fotografia das opções: mudar algo na tela durante a geração não altera este vídeo
    const foto0 = {
      dados: structuredClone(dadosRef.current),
      logo: logoRef.current,
      contatos: [...contatosRef.current],
      modelo: modeloRef.current,
      ocasiao: ocasiaoRef.current,
    };
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
        drawFrame(ctx, t, vids, foto0.dados, foto0.logo, foto0.contatos, foto0.modelo, foto0.ocasiao);
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
      <style>{`@keyframes cvScan { 0% { top: 0% } 50% { top: 97% } 100% { top: 0% } } .cv-scan { animation: cvScan 1.6s ease-in-out infinite; }`}</style>
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

          <h2 className="mt-2 text-sm font-bold text-neutral-200">Oferta sazonal</h2>
          <div className="flex flex-wrap gap-2">
            {OCASIOES.map((o) => (
              <button
                key={o.id}
                id={`ocasiao-${o.id}`}
                disabled={gravando}
                onClick={() => setOcasiao(o.id)}
                className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${ocasiao === o.id ? "border-amber-400 bg-amber-400/15" : "border-neutral-700 bg-neutral-900"}`}
              >
                {o.nome}
              </button>
            ))}
          </div>
          <h2 className="mt-2 text-sm font-bold text-neutral-200">Modelo do vídeo</h2>
          <div className="grid grid-cols-3 gap-2">
            {MODELOS.map((m) => (
              <button
                key={m.id}
                id={`modelo-${m.id}`}
                disabled={gravando}
                onClick={() => setModelo(m.id)}
                className={`rounded-lg border p-2 text-left ${modelo === m.id ? "border-amber-400 bg-amber-400/10" : "border-neutral-700 bg-neutral-900"}`}
              >
                <p className="text-sm font-bold">{m.nome}</p>
                <p className="text-xs text-neutral-400">{m.desc}</p>
              </button>
            ))}
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
            <a id="baixar" className="rounded-lg bg-green-600 px-4 py-2 text-center font-semibold" href={url} download={`video-${dados.destino}-${modelo}${ocasiao !== "nenhuma" ? "-" + ocasiao : ""}.mp4`}>
              Baixar vídeo
            </a>
          )}
          {url && !editando && (
            <button id="editar" onClick={() => setEditando(true)} className="rounded-lg border border-violet-500 px-4 py-2 font-semibold text-violet-200">
              ✏️ Editar vídeo
            </button>
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
        <div className="lg:sticky lg:top-4 lg:self-start">
          <canvas ref={canvasRef} width={W} height={H} className="w-full max-w-[360px] rounded-xl border border-neutral-800" />
        </div>
      </div>
    </div>
  );
}
