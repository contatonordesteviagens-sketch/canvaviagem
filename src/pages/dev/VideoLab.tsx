import { useEffect, useMemo, useRef, useState } from "react";
import { Muxer, ArrayBufferTarget } from "mp4-muxer";
import { supabase } from "@/integrations/supabase/client";
import { FabricaProvider, useFabricaContext, type Pacote } from "@/hooks/useFabricaContext";
import { useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useJornada } from "@/lib/jornada";
import { OQueFazerAgora } from "@/components/jornada/OQueFazerAgora";
import { salvarVideo } from "@/lib/biblioteca-videos";
import { createPortal } from "react-dom";
import { MontarPorToque } from "@/components/video/MontarPorToque";
import { QuadrosDeVideo, baixarVideo } from "@/lib/mp4-quadros";
import { Check, ChevronRight, Download, Image as ImageIcon, Maximize2, Pencil, Share } from "lucide-react";
import { NavegadorInternoAviso } from "@/components/jornada/NavegadorInternoAviso";

// Laboratório local: monta um vídeo stories de 3 quadros no navegador,
// com vídeo real de fundo, textos animados, preço e logo da agência.
// Só existe em modo de desenvolvimento.

const W = 720;
const H = 1280;
// Telas do vídeo, na ordem. Cada uma tem o seu fundo (vídeo do destino ou foto).
type Tela = "abertura" | "inclusos" | "destaque" | "preco" | "contato";
type TelaDef = { tipo: Tela; dur: number; nome: string };
const TELAS: TelaDef[] = [
  { tipo: "abertura", dur: 4.5, nome: "Abertura" },
  { tipo: "inclusos", dur: 3.8, nome: "O que inclui" },
  { tipo: "destaque", dur: 3.0, nome: "Cena extra 1" },
  { tipo: "destaque", dur: 3.0, nome: "Cena extra 2" },
  { tipo: "preco", dur: 3.8, nome: "Preço" },
  { tipo: "contato", dur: 4.2, nome: "Contato" },
];
// quantos fundos (vídeos do destino) um vídeo usa: um por tela
const CENAS = TELAS.length;
const FADE = 0.5;
// Roteiro = a ordem das telas. "3 vídeos diferentes" gera um de cada, para o cliente escolher o gancho.
// Regra de venda (Lucas): primeiro o valor (destino, experiência, o que inclui), o preço SEMPRE por último, antes do contato.
type Roteiro = "padrao" | "experiencia" | "gancho";
const ROTEIROS: { id: Roteiro; nome: string }[] = [
  { id: "padrao", nome: "Destino primeiro" },
  { id: "experiencia", nome: "Experiência primeiro" },
  { id: "gancho", nome: "Frase de impacto primeiro" },
];
function montarTelas(roteiro: Roteiro, curto: boolean): TelaDef[] {
  const [ab, inc, d1, d2, pr, ct] = TELAS as [TelaDef, TelaDef, TelaDef, TelaDef, TelaDef, TelaDef];
  let lista = roteiro === "experiencia" ? [d1, d2, ab, inc, pr, ct] : roteiro === "gancho" ? [d1, ab, inc, d2, pr, ct] : [ab, d1, inc, d2, pr, ct];
  // versão curta (12 s): só abertura, preço e contato (o preço continua depois do destino)
  if (curto) lista = lista.filter((x) => x.tipo === "abertura" || x.tipo === "preco" || x.tipo === "contato").map((x) => (x.tipo === "abertura" ? { ...x, dur: 4 } : x));
  return lista;
}
// Linha do tempo de um vídeo: as telas, quando cada uma começa e a duração total
type Linha = { telas: TelaDef[]; inicios: number[]; total: number };
function linhaDoTempo(telas: TelaDef[]): Linha {
  const inicios = telas.map((_, i) => telas.slice(0, i).reduce((a, x) => a + x.dur, 0));
  return { telas, inicios, total: telas.reduce((a, x) => a + x.dur, 0) };
}
const LINHA_PADRAO = linhaDoTempo(TELAS);
const telaEm = (t: number, L: Linha = LINHA_PADRAO) => {
  let i = 0;
  while (i < L.telas.length - 1 && t >= L.inicios[i + 1]) i++;
  return i;
};
// O navegador consegue montar o MP4? (WebCodecs: Chrome, Edge, Safari 16.4+. Falta em iPhone antigo e em alguns navegadores internos.)
const GERA_MP4 = typeof window !== "undefined" && "VideoEncoder" in window && "VideoFrame" in window;
const CELULAR = typeof window !== "undefined" && (window.matchMedia?.("(pointer: coarse)").matches ?? false) && window.innerWidth < 900;
// número antigo da tela em cada modelo: 0 destino, 1 inclusos, 2 preço, 3 contato
const CENA_MODELO: Record<Tela, number> = { abertura: 0, inclusos: 1, destaque: -1, preco: 2, contato: 3 };

// Vídeos de Cancún do Pexels, usados até o agente mandar o pacote dele.
const CLIPS = [
  "https://videos.pexels.com/video-files/27556568/12167684_720_1280_60fps.mp4",
  "https://videos.pexels.com/video-files/28743484/12461846_720_1280_30fps.mp4",
  "https://videos.pexels.com/video-files/27785059/12224003_720_1280_60fps.mp4",
];

type Pagamento = "installments" | "down_plus" | "cash" | "free_quote";
// Tipo de oferta: a IA reconhece pelo áudio/texto (ou detectarTipo, enquanto o servidor não devolve) e o cliente pode corrigir.
type TipoOferta = "pacote" | "aereo" | "hotel" | "cruzeiro" | "excursao" | "passeio" | "servico";
const TIPOS: { id: TipoOferta; nome: string; rotulo: string; curto: string; inclusos: string; cta: string; busca: string }[] = [
  { id: "pacote", nome: "Pacote completo", rotulo: "PACOTE COMPLETO", curto: "Pacote", inclusos: "O que está incluso", cta: "Garanta sua vaga", busca: "" },
  { id: "aereo", nome: "Só passagem aérea", rotulo: "PASSAGEM AÉREA", curto: "Passagem", inclusos: "Detalhes do voo", cta: "Garanta sua passagem", busca: "airplane wing window clouds" },
  { id: "hotel", nome: "Hotel ou resort", rotulo: "HOSPEDAGEM", curto: "Hospedagem", inclusos: "Sua hospedagem inclui", cta: "Reserve sua estadia", busca: "luxury resort pool" },
  { id: "cruzeiro", nome: "Cruzeiro", rotulo: "CRUZEIRO", curto: "Cruzeiro", inclusos: "A bordo você tem", cta: "Garanta sua cabine", busca: "cruise ship sea deck" },
  { id: "excursao", nome: "Excursão em grupo", rotulo: "EXCURSÃO", curto: "Excursão", inclusos: "A excursão inclui", cta: "Garanta seu lugar", busca: "tour bus road trip" },
  { id: "passeio", nome: "Passeio ou day use", rotulo: "PASSEIO", curto: "Passeio", inclusos: "O passeio inclui", cta: "Reserve seu passeio", busca: "boat tour excursion" },
  { id: "servico", nome: "Serviço (seguro, chip, câmbio)", rotulo: "SERVIÇO DE VIAGEM", curto: "Serviço", inclusos: "O que está incluso", cta: "Fale com a gente", busca: "airport passport suitcase" },
];
type Formato = "stories" | "feed";
// Feed 4:5: o vídeo sai com 1080×1350, recortando a faixa central do quadro 9:16 (de RECORTE_FEED até RECORTE_FEED + 900)
const FEED_W = 1080;
const FEED_H = 1350;
const RECORTE_FEED = 170;

type Dados = {
  destino: string;
  chamada: string;
  pagamento: Pagamento;
  parcelas: string;
  entrada: string;
  preco: string;
  precoAntigo: string;
  pessoas: string;
  saida: string;
  datas: string;
  tipo: TipoOferta;
  urgencia: string;
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
// fundo: vídeo tocando (prévia), foto, ou canvas com o quadro lido do arquivo (geração rápida)
type Fundo = HTMLVideoElement | HTMLImageElement | HTMLCanvasElement;
type Midia = { tipo: "video" | "foto"; url: string; thumb?: string; nome?: string };
const isVideo = (m: Fundo): m is HTMLVideoElement => m instanceof HTMLVideoElement;

const ease = (t: number) => 1 - Math.pow(1 - Math.min(Math.max(t, 0), 1), 3);
const back = (t: number) => {
  t = Math.min(Math.max(t, 0), 1);
  const c = 1.7;
  return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2);
};

function drawCover(ctx: CanvasRenderingContext2D, m: Fundo, zoom: number, alt = H) {
  const mw = isVideo(m) ? m.videoWidth : m instanceof HTMLCanvasElement ? m.width : m.naturalWidth;
  const mh = isVideo(m) ? m.videoHeight : m instanceof HTMLCanvasElement ? m.height : m.naturalHeight;
  if (!mw) return;
  const s = Math.max(W / mw, alt / mh) * zoom;
  const w = mw * s;
  const h = mh * s;
  ctx.drawImage(m, (W - w) / 2, (alt - h) / 2, w, h);
}

const infoTipo = (d: Dados) => TIPOS.find((t) => t.id === d.tipo) || TIPOS[0];
const ehPacote = (d: Dados) => !d.tipo || d.tipo === "pacote";
/** Título da tela de inclusos: o do estilo quando é pacote; senão o do tipo, na mesma caixa (alta ou normal). */
function tituloInclusos(d: Dados, padrao: string) {
  if (ehPacote(d)) return padrao;
  const t = infoTipo(d).inclusos;
  return padrao === padrao.toUpperCase() ? t.toUpperCase() : t;
}
function tituloCta(d: Dados, padrao: string) {
  if (ehPacote(d)) return padrao;
  const t = infoTipo(d).cta;
  return padrao === padrao.toUpperCase() ? t.toUpperCase() : t;
}
function nomeOferta(d: Dados) {
  switch (d.tipo) {
    case "aereo": return `Passagem para ${d.destino}`;
    case "hotel": return `Hospedagem em ${d.destino}`;
    case "cruzeiro": return `Cruzeiro ${d.destino}`;
    case "excursao": return `Excursão para ${d.destino}`;
    case "passeio": return `Passeio em ${d.destino}`;
    case "servico": return d.destino;
    default: return `Pacote ${d.destino}`;
  }
}
// Plano B enquanto a função do servidor não devolve "tipo": reconhece pelas palavras do texto.
function detectarTipo(texto: string): TipoOferta {
  const t = texto.toLowerCase();
  const tem = (re: RegExp) => re.test(t);
  if (tem(/cruzeiro|navio|cabine|a bordo/)) return "cruzeiro";
  if (tem(/seguro[- ]viagem|chip internacional|chip de viagem|c[âa]mbio|visto (americano|canadense|para)|assessoria de visto/)) return "servico";
  const aereo = tem(/passagem|passagens|a[ée]re[oa]|\bvoos?\b|ida e volta|bagagem|milhas/);
  const hospedagem = tem(/hotel|hospedagem|resort|pousada|di[áa]rias?|all inclusive/);
  const pacote = tem(/pacote|transfer|traslado/);
  if (tem(/excurs[ãa]o|bate[- ]e?[- ]?volta|[ôo]nibus|\bvan\b|sa[íi]da em grupo|caravana/) && !aereo) return "excursao";
  if (tem(/day use|passeio|\btour\b|city tour|trilha|mergulho/) && !aereo && !hospedagem && !pacote) return "passeio";
  if (aereo && !hospedagem && !pacote) return "aereo";
  if (hospedagem && !aereo && !pacote) return "hotel";
  return "pacote";
}

function precoTextos(d: Dados): { topo: string; valor: string; rodape: string } {
  const semPreco = d.pagamento === "free_quote" || !d.preco.trim();
  if (semPreco) return { topo: "condições especiais", valor: "Sob consulta", rodape: "peça sua cotação" };
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
let LARANJA = "#F26B21";
let AZUL_P = "#1D6BE8";
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
// As mesmas fontes do Anúncio (FONT_PRESETS do Phase3ArtFactory).
const FONTES = ["Montserrat", "Inter", "Poppins", "Roboto", "Oswald", "Bebas Neue", "Playfair Display", "Lora", "Raleway", "Nunito", "Work Sans", "DM Sans"];

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
  LARANJA = c1 || "#F26B21";
  AZUL_P = c1 || "#1D6BE8";
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
type Modelo = "classico" | "neon" | "cartao" | "luxo" | "passagem" | "revista" | "postal" | "faixa" | "vibrante" | "bf" | "promo" | "montagem";
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
  { id: "bf", nome: "Black Friday", desc: "Preto e laranja, cartão forte e ícones" },
  { id: "promo", nome: "Promo azul", desc: "Cartões brancos e azul, estilo checklist" },
  { id: "montagem", nome: "Montagem de viagem", desc: "Cenas de viagem com etiqueta 📍, título grande e ícones" },
];

// Ordem dos estilos na lista e no rodízio. Em novembro os dois de Black Friday vêm primeiro e são o padrão.
const ORDEM_SUGERIDA: Modelo[] = new Date().getMonth() === 10
  ? ["bf", "montagem", "promo", "classico", "faixa", "cartao", "neon", "vibrante", "luxo", "passagem", "revista", "postal"]
  : ["montagem", "classico", "promo", "faixa", "cartao", "neon", "vibrante", "luxo", "passagem", "revista", "postal", "bf"];
const MODELOS_NA_ORDEM = ORDEM_SUGERIDA.map((id) => MODELOS.find((m) => m.id === id)!).filter(Boolean);

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
    const tag = ehPacote(d) ? "PACOTE COMPLETO" : infoTipo(d).rotulo;
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
    ctx.fillText(tituloInclusos(d, "O que está incluso"), W / 2, 560);
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
    const resumo = pt.valor === "Sob consulta" ? d.destino : `${d.destino} · ${pt.topo === "a partir de" ? "" : pt.topo + " "}${pt.valor}`;
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
      ctx.fillText(infoTipo(d).curto, 50, 450 + (1 - kt) * 20);
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
    ctx.fillText(tituloInclusos(d, "Está incluso"), 50, 455);
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
    ctx.fillText(nomeOferta(d), W / 2, 672);
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
    ctx.fillText(tituloInclusos(d, "Está incluso"), W / 2, 390);
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
    ctx.fillText(nomeOferta(d), W / 2, 658);
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
    ctx.fillText(tituloInclusos(d, "A experiência inclui"), W / 2, 560);
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
    ctx.fillText(tituloInclusos(d, "Sua bagagem inclui"), x + 40, 440);
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
    ctx.fillText(tituloInclusos(d, "Incluso"), 40, 760);
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
    ctx.fillText(tituloInclusos(d, "Na sua viagem:"), 110, 640);
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
    ctx.fillText(tituloInclusos(d, "Tá tudo incluso ✨"), W / 2, 600);
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
type Ocasiao = "nenhuma" | "blackfriday" | "bf_neon" | "bf_vermelha" | "natal" | "anonovo" | "carnaval" | "verao" | "pascoa" | "maes" | "namorados" | "ferias_julho" | "pais" | "criancas" | "feriado";
// meses: 0 = janeiro ... 11 = dezembro. A lista se reordena sozinha pelo mês atual.
const OCASIOES: { id: Ocasiao; nome: string; selo: string; meses: number[] }[] = [
  { id: "nenhuma", nome: "Nenhuma", selo: "", meses: [] },
  { id: "blackfriday", nome: "🖤 Black Friday dourada", selo: "BLACK FRIDAY", meses: [10] },
  { id: "bf_neon", nome: "⚡ Black Friday neon", selo: "BLACK FRIDAY", meses: [10] },
  { id: "bf_vermelha", nome: "🔥 Black Friday vermelha", selo: "BLACK FRIDAY", meses: [10] },
  { id: "natal", nome: "🎄 Natal", selo: "OFERTA DE NATAL", meses: [11] },
  { id: "anonovo", nome: "✨ Ano Novo", selo: "ESPECIAL ANO NOVO", meses: [11, 0] },
  { id: "carnaval", nome: "🎭 Carnaval", selo: "🎭 CARNAVAL", meses: [0, 1] },
  { id: "verao", nome: "☀️ Verão", selo: "ESPECIAL DE VERÃO", meses: [11, 0, 1] },
  { id: "pascoa", nome: "🐣 Páscoa", selo: "FERIADO DE PÁSCOA", meses: [2, 3] },
  { id: "maes", nome: "💐 Dia das Mães", selo: "PRESENTE DE DIA DAS MÃES", meses: [4] },
  { id: "namorados", nome: "❤️ Dia dos Namorados", selo: "DIA DOS NAMORADOS", meses: [5] },
  { id: "ferias_julho", nome: "🏖️ Férias de julho", selo: "FÉRIAS DE JULHO", meses: [5, 6] },
  { id: "pais", nome: "👔 Dia dos Pais", selo: "PRESENTE DE DIA DOS PAIS", meses: [7] },
  { id: "criancas", nome: "🎈 Dia das Crianças", selo: "DIA DAS CRIANÇAS", meses: [9] },
  { id: "feriado", nome: "📅 Feriado prolongado", selo: "FERIADO PROLONGADO", meses: [] },
];
// cor do selo de cada ocasião (as Black Friday têm estilo próprio)
const COR_SELO: Partial<Record<Ocasiao, { fundo: string; texto: string }>> = {
  natal: { fundo: "#b91c1c", texto: "#fff" },
  verao: { fundo: "#f59e0b", texto: "#1a1406" },
  pascoa: { fundo: "#f9a8d4", texto: "#4a044e" },
  maes: { fundo: "#db2777", texto: "#fff" },
  namorados: { fundo: "#dc2626", texto: "#fff" },
  ferias_julho: { fundo: "#0ea5e9", texto: "#fff" },
  pais: { fundo: "#1e3a8a", texto: "#fff" },
  criancas: { fundo: "#7c3aed", texto: "#fff" },
  feriado: { fundo: "#16a34a", texto: "#fff" },
};
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

function coracoes(ctx: CanvasRenderingContext2D, t: number, cor: string) {
  const faixa = H * 0.22;
  for (let i = 0; i < 16; i++) {
    const vel = 30 + rnd(i, 3) * 40;
    const y = faixa - ((rnd(i, 4) * faixa + t * vel) % faixa); // sobem
    const x = rnd(i, 5) * W + Math.sin(t * 1.5 + i) * 12;
    const r = 5 + rnd(i, 2) * 6;
    ctx.save();
    ctx.translate(x, y);
    ctx.globalAlpha = 0.75 * (y / faixa);
    ctx.fillStyle = cor;
    ctx.beginPath();
    ctx.moveTo(0, r);
    ctx.bezierCurveTo(-r * 1.4, -r * 0.2, -r * 0.6, -r * 1.2, 0, -r * 0.4);
    ctx.bezierCurveTo(r * 0.6, -r * 1.2, r * 1.4, -r * 0.2, 0, r);
    ctx.fill();
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

function seloOcasiao(ctx: CanvasRenderingContext2D, oc: Ocasiao, k: number, yExtra = 0) {
  const info = OCASIOES.find((o) => o.id === oc)!;
  ctx.save();
  ctx.globalAlpha = k;
  ctx.font = "900 28px Montserrat, Arial";
  ctx.textAlign = "center";
  const w = ctx.measureText(info.selo).width + 56;
  const h = 50;
  const x = (W - w) / 2;
  const y = (ehBlack(oc) ? 166 : 118) + yExtra - (1 - k) * 30;
  roundRect(ctx, x, y, w, h, h / 2);
  let texto = "#fff";
  if (ehBlack(oc)) {
    const e = ESTILO_BF[oc as keyof typeof ESTILO_BF];
    ctx.fillStyle = e.barra;
    texto = e.texto;
  } else if (COR_SELO[oc]) {
    ctx.fillStyle = COR_SELO[oc]!.fundo;
    texto = COR_SELO[oc]!.texto;
  } else if (oc === "anonovo") {
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
function textoSaida(d: Dados) {
  const datas = (d.datas || "").trim();
  const saida = (d.saida || "").trim();
  if (!datas && !saida) return "";
  // passagem aérea: mostra o trecho (origem → destino)
  if (d.tipo === "aereo" && saida) return `${saida} → ${d.destino}${datas ? ` · ${datas}` : ""}`;
  if (datas && saida) return `Saída ${datas} · de ${saida}`;
  return datas ? `Saída ${datas}` : `Saída de ${saida}`;
}

// "Saída 12 a 17/12 · de Fortaleza" na tela do preço, numa pílula escura.
// Fica no mesmo ponto do preço antigo (que varia por estilo); quando os dois existem, a saída sobe.
function linhaSaida(ctx: CanvasRenderingContext2D, d: Dados, lt: number, out: number, modelo: Modelo, oc: Ocasiao = "nenhuma") {
  const txt = textoSaida(d);
  if (!txt) return;
  const temAntigo = !!d.precoAntigo.trim() && d.pagamento !== "free_quote";
  let y: number;
  if (modelo === "revista") y = temAntigo ? 703 : 775;
  else if (modelo === "faixa") y = temAntigo ? 618 : 690;
  else if (oc === "nenhuma") y = temAntigo ? 228 : 300;
  else y = 930; // o selo da ocasião ocupa o topo: a saída desce para perto da urgência
  const k = back((lt - 0.3) / 0.5);
  ctx.save();
  ctx.globalAlpha = out * clamp01((lt - 0.3) / 0.25);
  ctx.translate(W / 2, y);
  ctx.scale(0.8 + 0.2 * k, 0.8 + 0.2 * k);
  fitText(ctx, txt, 800, 30, W - 200);
  const tw = ctx.measureText(txt).width;
  const bw = tw + 64;
  roundRect(ctx, -bw / 2, -30, bw, 54, 27);
  ctx.fillStyle = "rgba(10,10,12,.82)";
  ctx.fill();
  ctx.fillStyle = NEON;
  ctx.beginPath();
  ctx.arc(-bw / 2 + 26, -3, 7, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#f3f4f6";
  ctx.textAlign = "left";
  ctx.fillText(txt, -bw / 2 + 44, 7);
  ctx.restore();
}

// Selo de urgência, só quando o cliente escreve (nunca automático): "ÚLTIMAS VAGAS", "ATÉ 20/11".
function linhaUrgencia(ctx: CanvasRenderingContext2D, d: Dados, lt: number, out: number, modelo: Modelo) {
  const txt = (d.urgencia || "").trim().toUpperCase();
  if (!txt) return;
  const y = modelo === "revista" ? 640 : modelo === "faixa" ? 1035 : 1000;
  const k = back((lt - 0.45) / 0.5);
  const pulso = 1 + 0.025 * Math.sin(lt * 5);
  ctx.save();
  ctx.globalAlpha = out * clamp01((lt - 0.45) / 0.25);
  ctx.translate(W / 2, y);
  ctx.scale((0.8 + 0.2 * k) * pulso, (0.8 + 0.2 * k) * pulso);
  ctx.textAlign = "center";
  fitText(ctx, txt, 900, 30, W - 220);
  const tw = ctx.measureText(txt).width;
  const bw = tw + 56;
  roundRect(ctx, -bw / 2, -29, bw, 54, 27);
  ctx.fillStyle = "#dc2626";
  ctx.fill();
  ctx.fillStyle = "#fff";
  ctx.fillText(txt, 0, 10);
  ctx.restore();
}

// Enquanto a função do servidor não devolve "saida" e "datas", procura no próprio texto do pacote.
const MESES = "janeiro|fevereiro|março|marco|abril|maio|junho|julho|agosto|setembro|outubro|novembro|dezembro";
function extrairSaida(texto: string): { saida: string; datas: string } {
  const t = ` ${texto} `.replace(/\s+/g, " ");
  const mSaida = t.match(/\b(?:sa[íi]da|saindo|partindo|partida|embarque)\s+(?:de|do|da|em)\s+([\wÀ-ÿ]+(?:\s+(?:de|do|da|dos|das)\s+[\wÀ-ÿ]+|\s+[\wÀ-ÿ]+)?)/i);
  const mData =
    t.match(new RegExp(String.raw`\b(\d{1,2}\s*(?:a|à|até|-)\s*\d{1,2}\s*(?:de\s+)?(?:\/\s*\d{1,2}(?:\/\d{2,4})?|(?:${MESES})(?:\s+de\s+\d{4})?))`, "i")) ||
    t.match(/\b(\d{1,2}\/\d{1,2}(?:\/\d{2,4})?)\b/) ||
    t.match(new RegExp(String.raw`\b(\d{1,2}\s+de\s+(?:${MESES})(?:\s+de\s+\d{4})?)`, "i")) ||
    t.match(new RegExp(String.raw`\b(?:em|para|pra)\s+((?:${MESES})(?:\s*(?:de|\/)\s*\d{4})?)\b`, "i"));
  const PARA = new Set(["dia", "no", "na", "em", "com", "por", "para", "pra", "e", "a", "o", "as", "os", "às", "ao", "aos", "de", "do", "da"]);
  let saida = mSaida ? mSaida[1].trim() : "";
  while (saida && PARA.has(saida.split(" ").slice(-1)[0].toLowerCase())) saida = saida.split(" ").slice(0, -1).join(" ");
  saida = saida.split(" ").map((p) => (p.length > 3 && p === p.toLowerCase() ? p[0].toUpperCase() + p.slice(1) : p)).join(" ").slice(0, 30);
  let datas = mData ? mData[1].replace(/\s+/g, " ").trim().slice(0, 22) : "";
  if (datas && new RegExp(`^(?:${MESES})`, "i").test(datas)) datas = `em ${datas.toLowerCase()}`;
  return { saida, datas };
}

// Legenda pronta para colar no post, com o que está no vídeo.
function montarLegenda(d: Dados, contatos: Contato[]): string {
  const pt = precoTextos(d);
  const linhas: string[] = [];
  linhas.push(`✈️ ${d.chamada || d.destino}`);
  linhas.push(`📍 ${ehPacote(d) ? d.destino : nomeOferta(d)}${d.pessoas ? ` · ${d.pessoas}` : ""}`);
  // valor primeiro (o que inclui, quando), preço por último
  d.itens.filter(Boolean).forEach((it) => linhas.push(`✅ ${it}`));
  const saida = textoSaida(d);
  if (saida) linhas.push(`📅 ${saida}`);
  if (pt.valor === "Sob consulta") linhas.push("💬 Consulte valores e condições");
  else {
    const antigo = d.precoAntigo.trim();
    const preco = pt.topo === "a partir de" ? `a partir de ${pt.valor}` : `${pt.topo} ${pt.valor}`;
    linhas.push(`💰 ${antigo ? `De ${antigo.startsWith("R$") ? antigo : "R$ " + antigo} por ` : ""}${preco}`);
  }
  if ((d.urgencia || "").trim()) linhas.push(`⏳ ${d.urgencia.trim()}`);
  if (d.agencia && d.agencia !== "Sua Agência") linhas.push(`✨ ${d.agencia}`);
  if (contatos.includes("whatsapp")) linhas.push(`📲 ${d.whatsapp ? `Chame no WhatsApp: ${d.whatsapp}` : "Chame no WhatsApp"}`);
  if (contatos.includes("instagram") && d.instagram) linhas.push(`📸 ${d.instagram}`);
  if (contatos.includes("site") && d.site) linhas.push(`🌐 ${d.site}`);
  const tag = d.destino.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-zA-Z0-9]/g, "").toLowerCase();
  linhas.push("");
  linhas.push(`#${tag || "viagem"} #viagem #agenciadeviagens #pacotedeviagem #ferias`);
  return linhas.join("\n");
}

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

function camadaOcasiao(ctx: CanvasRenderingContext2D, oc: Ocasiao, t: number, tipo: Tela, lt: number, feed = false) {
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
  if (oc === "maes") coracoes(ctx, t, "#f472b6");
  if (oc === "namorados") coracoes(ctx, t, "#ef4444");
  if (oc === "carnaval") confete(ctx, t);
  if (oc === "anonovo") fogos(ctx, t);
  if (tipo === "abertura" || tipo === "preco") seloOcasiao(ctx, oc, ease(lt / 0.5), feed ? (ehBlack(oc) ? 14 : 58) : 0);
}

// Gerar com a tela escondida (outra aba, outro app, janela atrás) deixa o navegador sem decodificar o vídeo
// e com os relógios a 1 por segundo: cada quadro levava ~1 s e o fundo saía congelado.
// Então a geração pausa enquanto a tela está escondida e continua sozinha quando a pessoa volta.
// A tela está parada? (aba escondida ou janela atrás de outra: o navegador para de desenhar a página,
// às vezes sem avisar que ela ficou escondida). Se o próximo quadro da tela não chega em 300 ms, está parada.
const telaParada = () =>
  new Promise<boolean>((r) => {
    if (document.hidden) return r(true);
    let veio = false;
    requestAnimationFrame(() => {
      veio = true;
      r(false);
    });
    setTimeout(() => !veio && r(true), 300);
  });
// espera a tela voltar a ser desenhada (a pessoa voltou para a aba/janela)
const esperarTelaVisivel = () => new Promise<void>((r) => requestAnimationFrame(() => r()));
// Celular: mantém a tela acesa enquanto gera (onde o navegador permitir).
type Trava = { release: () => Promise<void> };
async function manterTelaAcesa(): Promise<() => void> {
  const nav = navigator as Navigator & { wakeLock?: { request: (t: "screen") => Promise<Trava> } };
  if (!nav.wakeLock) return () => undefined;
  let trava: Trava | null = null;
  const pedir = async () => {
    try {
      trava = await nav.wakeLock!.request("screen");
    } catch {
      trava = null;
    }
  };
  // a trava cai quando a tela some; pede de novo quando a pessoa volta
  const aoVoltar = () => {
    if (!document.hidden) void pedir();
  };
  await pedir();
  document.addEventListener("visibilitychange", aoVoltar);
  return () => {
    document.removeEventListener("visibilitychange", aoVoltar);
    void trava?.release().catch(() => undefined);
  };
}

// Logo que "contamina" o canvas (imagem de outro site sem permissão) impede gerar o MP4.
// Testa num canvas de 1 px: se contaminar, o vídeo sai sem a logo em vez de dar erro.
function logoSemContaminar(img: HTMLImageElement | null): HTMLImageElement | null {
  if (!img) return null;
  try {
    const c = document.createElement("canvas");
    c.width = 1;
    c.height = 1;
    const x = c.getContext("2d")!;
    x.drawImage(img, 0, 0, 1, 1);
    x.getImageData(0, 0, 1, 1);
    return img;
  } catch {
    return null;
  }
}

const CHAVE_SALVO = "cv-gerador-video-v1";
const CHAVE_FUNDOS = "cv-gerador-fundos-v1";
function fundosSalvos(): Midia[] {
  try {
    const l = JSON.parse(localStorage.getItem(CHAVE_FUNDOS) || "[]");
    return Array.isArray(l) ? l.filter((m) => m && typeof m.url === "string" && /^https:\/\//.test(m.url)) : [];
  } catch {
    return [];
  }
}

// ---------------- Contato padrão (igual em todos os estilos): logo, título e botões com ícone ----------------
// Os mesmos ícones oficiais que saem nos anúncios da Fábrica (public/social-icons)
const ARQ_ICONE: Record<Contato, string> = { whatsapp: "whatsapp", instagram: "instagram_fino", facebook: "facebook", email: "email_azul", site: "site" };
const ICONES_ANUNCIO: Partial<Record<Contato, HTMLImageElement>> = {};
if (typeof window !== "undefined") {
  (Object.keys(ARQ_ICONE) as Contato[]).forEach((id) => {
    const img = new Image();
    img.src = `/social-icons/${ARQ_ICONE[id]}.png`;
    ICONES_ANUNCIO[id] = img;
  });
}
function icone(ctx: CanvasRenderingContext2D, id: Contato, cx: number, cy: number, r: number, cor = "#fff") {
  const img = ICONES_ANUNCIO[id];
  if (img && img.complete && img.naturalWidth > 0) {
    ctx.save();
    if (id !== "whatsapp") {
      // fundo branco para o ícone colorido não sumir no botão da mesma cor
      ctx.beginPath();
      ctx.arc(cx, cy, r * 1.25, 0, Math.PI * 2);
      ctx.fillStyle = "#fff";
      ctx.fill();
    }
    const t = id === "whatsapp" ? r * 2.5 : r * 1.7;
    ctx.drawImage(img, cx - t / 2, cy - t / 2, t, t);
    ctx.restore();
    return;
  }
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
  bf: { titulo: "Garanta sua vaga", molde: "900 {s}px Montserrat, Arial", cor: () => LARANJA },
  promo: { titulo: "Garanta sua vaga", molde: "italic 900 {s}px Montserrat, Arial", cor: () => "#fff" },
  montagem: { titulo: "Fale conosco!", molde: "900 {s}px Montserrat, Arial", cor: () => "#fff" },
};

function ctaPadrao(ctx: CanvasRenderingContext2D, d: Dados, logo: HTMLImageElement | null, contatos: Contato[], lt: number, modelo: Modelo, y0 = 0) {
  ctx.textAlign = "center";
  ctx.globalAlpha = clamp01(lt / 0.3);
  desenharLogo(ctx, d, logo, W / 2, 430 + y0, 88, back(lt / 0.6));
  const est = ESTILO_CTA[modelo];
  const k2 = ease((lt - 0.4) / 0.5);
  ctx.globalAlpha = k2;
  ajustarFonte(ctx, est.molde, tituloCta(d, est.titulo), 60, W - 120);
  ctx.fillStyle = est.cor();
  sombra(ctx, 18, "rgba(0,0,0,.5)");
  ctx.fillText(tituloCta(d, est.titulo), W / 2, 590 + y0 + (1 - k2) * 16);
  semSombra(ctx);
  const pt = precoTextos(d);
  const sub = pt.valor === "Sob consulta" ? d.destino : `${d.destino} · ${pt.topo === "a partir de" ? "" : pt.topo + " "}${pt.valor}`;
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
    ctx.fillText(ehPacote(d) ? "PACOTE" : infoTipo(d).rotulo, 56, y(740));
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
    ctx.fillText(tituloInclusos(d, "ESTÁ INCLUSO"), 56, y(730));
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

// ——— Ícones dos itens (vetor, desenhados aqui; se existir um PNG em /video-elementos/<nome>.png ele é usado no lugar) ———
type Glifo = "aviao" | "hotel" | "transfer" | "cafe" | "passeio" | "seguro" | "bagagem" | "calendario" | "pin" | "check";
const NOMES_ELEMENTOS: Glifo[] = ["aviao", "hotel", "transfer", "cafe", "passeio", "seguro", "bagagem", "calendario", "pin", "check"];
const ELEMENTOS = new Map<string, HTMLImageElement | null>();
function carregarElementos() {
  if (typeof window === "undefined" || ELEMENTOS.size) return;
  for (const n of NOMES_ELEMENTOS) {
    ELEMENTOS.set(n, null);
    const img = new Image();
    img.onload = () => ELEMENTOS.set(n, img);
    img.src = `/video-elementos/${n}.png`;
  }
}
const elemento = (nome: string) => ELEMENTOS.get(nome) || null;
function glifoDoItem(txt: string): Glifo {
  const t = txt.toLowerCase();
  if (/a[ée]re|voo|passag|milhas|embarque/.test(t)) return "aviao";
  if (/hotel|pousada|resort|hosped|di[áa]ria|noite|cabine/.test(t)) return "hotel";
  if (/transfer|traslado|[ôo]nibus|\bvan\b|transporte|carro|locação|aluguel/.test(t)) return "transfer";
  if (/caf[ée]|refei|almo[çc]|jantar|pens[ãa]o|all inclusive|bebida|open bar/.test(t)) return "cafe";
  if (/passeio|tour|city|trilha|mergulho|ingresso|parque|show|roteiro/.test(t)) return "passeio";
  if (/seguro|assist/.test(t)) return "seguro";
  if (/bagagem|mala|despach/.test(t)) return "bagagem";
  if (/data|sa[íi]da|dia /.test(t)) return "calendario";
  if (/guia|local|destino|cidade/.test(t)) return "pin";
  return "check";
}
function desenharGlifo(ctx: CanvasRenderingContext2D, g: Glifo, cx: number, cy: number, s: number, cor: string) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.strokeStyle = cor;
  ctx.fillStyle = cor;
  ctx.lineWidth = Math.max(2.5, s * 0.24);
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  const circulo = (x: number, y: number, r: number) => {
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  };
  switch (g) {
    case "aviao":
      ctx.rotate(-Math.PI / 4);
      ctx.beginPath();
      ctx.moveTo(0, -s);
      ctx.lineTo(0, s * 0.95);
      ctx.moveTo(-s, s * 0.05);
      ctx.lineTo(s, s * 0.05);
      ctx.moveTo(-s * 0.45, s * 0.85);
      ctx.lineTo(s * 0.45, s * 0.85);
      ctx.stroke();
      break;
    case "hotel":
      ctx.beginPath();
      ctx.moveTo(-s, s * 0.7);
      ctx.lineTo(-s, -s * 0.1);
      ctx.lineTo(s, -s * 0.1);
      ctx.lineTo(s, s * 0.7);
      ctx.moveTo(-s, s * 0.3);
      ctx.lineTo(s, s * 0.3);
      ctx.stroke();
      roundRect(ctx, -s * 0.8, -s * 0.55, s * 0.7, s * 0.4, 3);
      ctx.fill();
      break;
    case "transfer":
      roundRect(ctx, -s, -s * 0.85, 2 * s, s * 1.35, 4);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(-s, -s * 0.15);
      ctx.lineTo(s, -s * 0.15);
      ctx.stroke();
      circulo(-s * 0.55, s * 0.78, s * 0.24);
      circulo(s * 0.55, s * 0.78, s * 0.24);
      break;
    case "cafe":
      roundRect(ctx, -s * 0.9, -s * 0.5, s * 1.4, s * 1.2, 4);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(s * 0.6, 0, s * 0.38, -Math.PI / 2, Math.PI / 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(-s * 0.9, s * 0.98);
      ctx.lineTo(s * 0.75, s * 0.98);
      ctx.stroke();
      break;
    case "passeio":
      roundRect(ctx, -s, -s * 0.55, 2 * s, s * 1.35, 4);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(0, s * 0.12, s * 0.4, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(-s * 0.45, -s * 0.55);
      ctx.lineTo(-s * 0.25, -s * 0.95);
      ctx.lineTo(s * 0.25, -s * 0.95);
      ctx.lineTo(s * 0.45, -s * 0.55);
      ctx.stroke();
      break;
    case "seguro":
      ctx.beginPath();
      ctx.moveTo(0, -s);
      ctx.lineTo(s, -s * 0.6);
      ctx.lineTo(s * 0.85, s * 0.3);
      ctx.lineTo(0, s);
      ctx.lineTo(-s * 0.85, s * 0.3);
      ctx.lineTo(-s, -s * 0.6);
      ctx.closePath();
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(-s * 0.4, 0);
      ctx.lineTo(-s * 0.1, s * 0.32);
      ctx.lineTo(s * 0.45, -s * 0.35);
      ctx.stroke();
      break;
    case "bagagem":
      roundRect(ctx, -s * 0.85, -s * 0.45, s * 1.7, s * 1.4, 4);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(-s * 0.35, -s * 0.45);
      ctx.lineTo(-s * 0.35, -s * 0.9);
      ctx.lineTo(s * 0.35, -s * 0.9);
      ctx.lineTo(s * 0.35, -s * 0.45);
      ctx.stroke();
      break;
    case "calendario":
      roundRect(ctx, -s, -s * 0.7, 2 * s, s * 1.6, 4);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(-s, -s * 0.2);
      ctx.lineTo(s, -s * 0.2);
      ctx.moveTo(-s * 0.5, -s);
      ctx.lineTo(-s * 0.5, -s * 0.45);
      ctx.moveTo(s * 0.5, -s);
      ctx.lineTo(s * 0.5, -s * 0.45);
      ctx.stroke();
      break;
    case "pin":
      ctx.beginPath();
      ctx.arc(0, -s * 0.3, s * 0.62, Math.PI * 0.75, Math.PI * 2.25);
      ctx.lineTo(0, s);
      ctx.closePath();
      ctx.stroke();
      circulo(0, -s * 0.3, s * 0.2);
      break;
    default:
      ctx.beginPath();
      ctx.moveTo(-s * 0.6, 0.05 * s);
      ctx.lineTo(-s * 0.15, s * 0.5);
      ctx.lineTo(s * 0.65, -s * 0.45);
      ctx.stroke();
  }
  ctx.restore();
}
/** Quadrado arredondado com o ícone do item dentro (PNG de /video-elementos se existir, senão o vetor). */
function iconeItem(ctx: CanvasRenderingContext2D, txt: string, cx: number, cy: number, tam: number, fundo: string, traco: string, raio = 12) {
  const g = glifoDoItem(txt);
  roundRect(ctx, cx - tam / 2, cy - tam / 2, tam, tam, raio);
  ctx.fillStyle = fundo;
  ctx.fill();
  const img = elemento(g);
  if (img) ctx.drawImage(img, cx - tam * 0.34, cy - tam * 0.34, tam * 0.68, tam * 0.68);
  else desenharGlifo(ctx, g, cx, cy, tam * 0.27, traco);
}
function quebrarLinhas(ctx: CanvasRenderingContext2D, texto: string, maxW: number, max = 3): string[] {
  const linhas: string[] = [];
  let atual = "";
  for (const p of texto.split(/\s+/)) {
    const tent = atual ? `${atual} ${p}` : p;
    if (ctx.measureText(tent).width > maxW && atual) {
      linhas.push(atual);
      atual = p;
    } else atual = tent;
  }
  if (atual) linhas.push(atual);
  return linhas.slice(0, max);
}
/** Escolhe o maior tamanho (até `max`) em que o texto cabe em `linhasMax` linhas de `maxW`. Define a fonte e devolve as linhas. */
function linhasQueCabem(ctx: CanvasRenderingContext2D, texto: string, molde: string, max: number, min: number, maxW: number, linhasMax: number): { tam: number; linhas: string[] } {
  let tam = max;
  for (;;) {
    ctx.font = molde.replace("{s}", String(tam));
    const linhas = quebrarLinhas(ctx, texto, maxW, 9);
    if (linhas.length <= linhasMax || tam <= min) return { tam, linhas: linhas.slice(0, linhasMax) };
    tam -= 4;
  }
}
function cartaoVidro(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r = 32, fundo = "rgba(8,8,10,.62)") {
  ctx.save();
  sombra(ctx, 40, "rgba(0,0,0,.35)");
  roundRect(ctx, x, y, w, h, r);
  ctx.fillStyle = fundo;
  ctx.fill();
  semSombra(ctx);
  roundRect(ctx, x, y, w, h, r);
  ctx.lineWidth = 2;
  ctx.strokeStyle = "rgba(255,255,255,.12)";
  ctx.stroke();
  ctx.restore();
}
function pilula(ctx: CanvasRenderingContext2D, cx: number, cy: number, txt: string, fundo: string, cor: string, molde = "800 {s}px Montserrat, Arial", tam = 24, maxW = 560) {
  ctx.save();
  let t = tam;
  do {
    ctx.font = molde.replace("{s}", String(t));
    t -= 2;
  } while (ctx.measureText(txt).width > maxW && t > 14);
  const w = ctx.measureText(txt).width + 48;
  roundRect(ctx, cx - w / 2, cy - 27, w, 54, 27);
  ctx.fillStyle = fundo;
  ctx.fill();
  ctx.fillStyle = cor;
  ctx.textAlign = "center";
  ctx.fillText(txt, cx, cy + 9);
  ctx.restore();
  return ctx.measureText(txt).width + 48;
}

// ——— Estilo Black Friday: vídeo em tela cheia com véu escuro, "Black" cheio em laranja + "Friday" branco,
// um cartão forte por tela, cupom laranja e itens com ícone ———
function letrasBf(ctx: CanvasRenderingContext2D, x: number, y: number, tam: number, alinhado: CanvasTextAlign = "left") {
  ctx.save();
  ctx.textAlign = alinhado;
  ctx.lineJoin = "round";
  ctx.font = `900 ${tam}px Montserrat, Arial`;
  // "Black" cheio em laranja (o vazado ficava feio sobre o vídeo)
  sombra(ctx, 18, "rgba(0,0,0,.45)");
  ctx.fillStyle = LARANJA;
  ctx.fillText("Black", x, y);
  ctx.fillStyle = "#fff";
  ctx.font = `900 ${Math.round(tam * 0.92)}px Montserrat, Arial`;
  ctx.fillText("Friday", x, y + tam * 0.86);
  ctx.restore();
}
function cenaBf(ctx: CanvasRenderingContext2D, cena: number, lt: number, out: number, d: Dados, logo: HTMLImageElement | null, _contatos: Contato[]) {
  const k = ease(lt / 0.5);
  const k2 = ease((lt - 0.2) / 0.5);
  const k3 = back((lt - 0.4) / 0.5);
  const X = 40;
  const LARG = W - 80;
  ctx.globalAlpha = out * k;
  if (cena === 0) {
    if (d.agencia && d.agencia !== "Sua Agência") {
      ctx.font = "700 24px Montserrat, Arial";
      ctx.textAlign = "center";
      ctx.fillStyle = "rgba(255,255,255,.85)";
      if (logo) desenharLogo(ctx, d, logo, W / 2, 232, 30, k);
      else ctx.fillText(d.agencia.toUpperCase(), W / 2, 240);
    }
    ctx.save();
    ctx.translate(0, (1 - k) * -30);
    letrasBf(ctx, W / 2, 430, 150, "center");
    ctx.restore();
    ctx.globalAlpha = out * k2;
    const dest = linhasQueCabem(ctx, d.destino.toUpperCase(), "900 {s}px Montserrat, Arial", 84, 44, LARG - 80, 2);
    const altura = 70 + dest.linhas.length * (dest.tam * 1.05) + 62 + 92;
    const topo = 600;
    cartaoVidro(ctx, X, topo, LARG, altura);
    ctx.textAlign = "center";
    ctx.fillStyle = LARANJA;
    ctx.font = `900 ${dest.tam}px Montserrat, Arial`;
    let y = topo + 60 + dest.tam * 0.8;
    for (const l of dest.linhas) {
      ctx.fillText(l, W / 2, y);
      y += dest.tam * 1.05;
    }
    fitText(ctx, d.chamada, 600, 28, LARG - 80);
    ctx.fillStyle = "#fff";
    ctx.fillText(d.chamada, W / 2, y + 12);
    // abertura vende o destino; o preço só aparece na tela de preço
    const teaser = "OFERTA BLACK FRIDAY";
    ctx.globalAlpha = out * clamp01((lt - 0.4) / 0.3);
    ctx.save();
    ctx.translate(W / 2, y + 86);
    ctx.scale(0.85 + 0.15 * k3, 0.85 + 0.15 * k3);
    pilula(ctx, 0, 0, teaser, LARANJA, "#fff", "800 {s}px Montserrat, Arial", 26, LARG - 120);
    ctx.restore();
  } else if (cena === 1) {
    letrasBf(ctx, X, 250, 64);
    ctx.globalAlpha = out * k2;
    const itens = d.itens.filter(Boolean).slice(0, 4);
    const topo = 340;
    const altura = 150 + itens.length * 92 + 80;
    cartaoVidro(ctx, X, topo, LARG, altura);
    ctx.textAlign = "left";
    pilula(ctx, X + 40 + 120, topo + 64, tituloInclusos(d, "O QUE ESTÁ INCLUSO").toUpperCase(), LARANJA, "#fff", "800 {s}px Montserrat, Arial", 22, 360);
    itens.forEach((it, i) => {
      ctx.globalAlpha = out * clamp01((lt - 0.3 - i * 0.12) / 0.3);
      const yy = topo + 150 + i * 92;
      iconeItem(ctx, it, X + 66, yy, 56, LARANJA, "#fff", 14);
      ctx.textAlign = "left";
      fitText(ctx, it, 700, 30, LARG - 140);
      ctx.fillStyle = "#fff";
      ctx.fillText(it, X + 112, yy + 10);
    });
    ctx.globalAlpha = out * clamp01((lt - 0.8) / 0.3);
    pilula(ctx, W / 2, topo + altura - 48, "APROVEITE A BLACK FRIDAY", "rgba(255,255,255,.1)", "#fff", "800 {s}px Montserrat, Arial", 22, LARG - 120);
  } else if (cena === 2) {
    letrasBf(ctx, X, 250, 64);
    ctx.globalAlpha = out * k2;
    const pt = precoTextos(d);
    const antigo = d.precoAntigo.trim();
    const temAntigo = !!antigo && d.pagamento !== "free_quote";
    const saida = textoSaida(d);
    const topo = 380;
    const altura = 60 + (temAntigo ? 40 : 0) + 44 + 130 + (pt.rodape ? 40 : 0) + (saida ? 40 : 0) + 100;
    cartaoVidro(ctx, X, topo, LARG, altura);
    ctx.textAlign = "center";
    let y = topo + 60;
    if (temAntigo) {
      const txt = `de ${antigo.startsWith("R$") ? antigo : "R$ " + antigo}`;
      ctx.font = "600 26px Montserrat, Arial";
      ctx.fillStyle = "#a1a1aa";
      ctx.fillText(txt, W / 2, y);
      const tw = ctx.measureText(txt).width;
      ctx.strokeStyle = "#ef4444";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(W / 2 - tw / 2 - 4, y - 9);
      ctx.lineTo(W / 2 + tw / 2 + 4, y - 9);
      ctx.stroke();
      y += 40;
    }
    fitText(ctx, pt.topo.toUpperCase(), 700, 26, LARG - 100);
    ctx.fillStyle = "rgba(255,255,255,.85)";
    ctx.fillText(pt.topo.toUpperCase(), W / 2, y + 8);
    y += 44;
    ctx.save();
    ctx.translate(W / 2, y + 90);
    ctx.scale(0.8 + 0.2 * k3, 0.8 + 0.2 * k3);
    fitText(ctx, pt.valor, 900, 120, LARG - 100);
    ctx.fillStyle = LARANJA;
    ctx.fillText(pt.valor, 0, 0);
    ctx.restore();
    y += 130;
    if (pt.rodape) {
      fitText(ctx, pt.rodape, 500, 26, LARG - 100);
      ctx.fillStyle = "rgba(255,255,255,.8)";
      ctx.fillText(pt.rodape, W / 2, y + 8);
      y += 40;
    }
    if (saida) {
      fitText(ctx, saida, 600, 24, LARG - 100);
      ctx.fillStyle = "rgba(255,255,255,.7)";
      ctx.fillText(saida, W / 2, y + 8);
      y += 40;
    }
    ctx.globalAlpha = out * clamp01((lt - 0.45) / 0.3);
    const urg = d.urgencia.trim();
    pilula(ctx, W / 2, y + 52, urg ? urg.toUpperCase() : "OFERTA POR TEMPO LIMITADO", urg ? "#dc2626" : LARANJA, "#fff", "800 {s}px Montserrat, Arial", 24, LARG - 120);
  }
  ctx.globalAlpha = 1;
}

// ——— Estilo Promo azul: véu azul sobre o vídeo, título branco em itálico com brilho, painel azul inclinado,
// cartões brancos com ícones redondos e itens com check (estilo checklist) ———
const AZUL_ESCURO = "#0B3FA6";
const TINTA_PROMO = "#0B1F4D";
function painelInclinado(ctx: CanvasRenderingContext2D, cx: number, cy: number, w: number, h: number, cor: string, desenhar: () => void, rot = 0) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(rot);
  sombra(ctx, 30, "rgba(0,0,0,.3)");
  roundRect(ctx, -w / 2, -h / 2, w, h, 18);
  ctx.fillStyle = cor;
  ctx.fill();
  semSombra(ctx);
  desenhar();
  ctx.restore();
}
function aviaoRastro(ctx: CanvasRenderingContext2D, x: number, y: number, k: number) {
  ctx.save();
  ctx.globalAlpha *= k;
  ctx.strokeStyle = "rgba(255,255,255,.7)";
  ctx.lineWidth = 3;
  ctx.setLineDash([6, 10]);
  ctx.beginPath();
  ctx.moveTo(x - 220, y + 60);
  ctx.quadraticCurveTo(x - 110, y + 70, x - 20, y + 10);
  ctx.stroke();
  ctx.setLineDash([]);
  desenharGlifo(ctx, "aviao", x, y, 16, "#fff");
  ctx.restore();
}
function cartaoBranco(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
  ctx.save();
  sombra(ctx, 50, "rgba(0,20,80,.35)");
  roundRect(ctx, x, y, w, h, 30);
  ctx.fillStyle = "#fff";
  ctx.fill();
  semSombra(ctx);
  ctx.restore();
}
function cenaPromo(ctx: CanvasRenderingContext2D, cena: number, lt: number, out: number, d: Dados, logo: HTMLImageElement | null, _contatos: Contato[]) {
  const k = ease(lt / 0.5);
  const k2 = ease((lt - 0.2) / 0.5);
  const k3 = back((lt - 0.4) / 0.5);
  const X = 40;
  const LARG = W - 80;
  ctx.globalAlpha = out * k;
  if (cena === 0) {
    // marca da agência numa pílula branca, como no banner
    if (d.agencia && d.agencia !== "Sua Agência") {
      if (logo) desenharLogo(ctx, d, logo, 76, 236, 30, k);
      ctx.textAlign = "left";
      ctx.font = "800 22px Montserrat, Arial";
      const w = ctx.measureText(d.agencia).width + 40;
      roundRect(ctx, logo ? 116 : X, 212, w, 48, 24);
      ctx.fillStyle = "#fff";
      ctx.fill();
      ctx.fillStyle = AZUL_ESCURO;
      ctx.fillText(d.agencia, (logo ? 116 : X) + 20, 244);
    }
    aviaoRastro(ctx, 600, 300, k2);
    // destino grande, itálico, com brilho azul
    const dest = linhasQueCabem(ctx, d.destino.toUpperCase(), "italic 900 {s}px Montserrat, Arial", 92, 48, LARG - 20, 2);
    ctx.textAlign = "center";
    let y = 470;
    ctx.save();
    ctx.translate(0, (1 - k) * -24);
    sombra(ctx, 28, "rgba(29,107,232,.9)");
    ctx.fillStyle = "#fff";
    ctx.font = `italic 900 ${dest.tam}px Montserrat, Arial`;
    for (const l of dest.linhas) {
      ctx.fillText(l, W / 2, y);
      y += dest.tam * 1.02;
    }
    semSombra(ctx);
    ctx.restore();
    // painel azul inclinado com a frase
    ctx.globalAlpha = out * k2;
    ctx.font = "italic 800 30px Montserrat, Arial";
    const ch = linhasQueCabem(ctx, d.chamada, "italic 800 {s}px Montserrat, Arial", 34, 22, LARG - 120, 2);
    const hP = 40 + ch.linhas.length * (ch.tam * 1.15);
    painelInclinado(ctx, W / 2, y + hP / 2 + 6, LARG - 40, hP, AZUL_P, () => {
      ctx.textAlign = "center";
      ctx.fillStyle = "#fff";
      ctx.font = `italic 800 ${ch.tam}px Montserrat, Arial`;
      ch.linhas.forEach((l, i) => ctx.fillText(l, 0, -hP / 2 + 30 + ch.tam * 0.75 + i * ch.tam * 1.15));
    });
    y += hP + 60;
    // abertura vende o destino; o preço só aparece na tela de preço
    const teaser = "VEJA O QUE ESTÁ INCLUSO";
    ctx.globalAlpha = out * clamp01((lt - 0.4) / 0.3);
    ctx.save();
    ctx.translate(W / 2, y + 30);
    ctx.scale(0.85 + 0.15 * k3, 0.85 + 0.15 * k3);
    pilula(ctx, 0, 0, teaser, "#fff", AZUL_ESCURO, "800 {s}px Montserrat, Arial", 26, LARG - 120);
    ctx.restore();
  } else if (cena === 1) {
    const itens = d.itens.filter(Boolean).slice(0, 4);
    const topo = 330;
    const altura = 190 + itens.length * 90;
    ctx.globalAlpha = out * k2;
    cartaoBranco(ctx, X, topo, LARG, altura);
    // medalha redonda azul no alto do cartão
    ctx.save();
    ctx.translate(W / 2, topo);
    ctx.scale(0.7 + 0.3 * k3, 0.7 + 0.3 * k3);
    ctx.beginPath();
    ctx.arc(0, 0, 50, 0, Math.PI * 2);
    ctx.fillStyle = "#fff";
    ctx.fill();
    ctx.beginPath();
    ctx.arc(0, 0, 40, 0, Math.PI * 2);
    ctx.fillStyle = AZUL_P;
    ctx.fill();
    desenharGlifo(ctx, "check", 0, 0, 15, "#fff");
    ctx.restore();
    pilula(ctx, W / 2, topo + 104, tituloInclusos(d, "O QUE INCLUI").toUpperCase(), AZUL_ESCURO, "#fff", "800 {s}px Montserrat, Arial", 22, LARG - 120);
    itens.forEach((it, i) => {
      ctx.globalAlpha = out * clamp01((lt - 0.3 - i * 0.12) / 0.3);
      const yy = topo + 190 + i * 90;
      iconeItem(ctx, it, X + 66, yy, 54, AZUL_P, "#fff", 14);
      ctx.textAlign = "left";
      fitText(ctx, it, 700, 30, LARG - 140);
      ctx.fillStyle = TINTA_PROMO;
      ctx.fillText(it, X + 112, yy + 10);
    });
  } else if (cena === 2) {
    const pt = precoTextos(d);
    const antigo = d.precoAntigo.trim();
    const temAntigo = !!antigo && d.pagamento !== "free_quote";
    const saida = textoSaida(d);
    const urg = d.urgencia.trim();
    const topo = 400;
    const altura = 140 + 140 + (temAntigo ? 40 : 0) + (pt.rodape ? 40 : 0) + (saida ? 40 : 0) + (urg ? 80 : 40);
    ctx.globalAlpha = out * k2;
    cartaoBranco(ctx, X, topo, LARG, altura);
    pilula(ctx, W / 2, topo + 64, pt.topo.toUpperCase(), AZUL_ESCURO, "#fff", "800 {s}px Montserrat, Arial", 22, LARG - 120);
    ctx.textAlign = "center";
    let y = topo + 140;
    if (temAntigo) {
      const txt = `de ${antigo.startsWith("R$") ? antigo : "R$ " + antigo}`;
      ctx.font = "600 26px Montserrat, Arial";
      ctx.fillStyle = "#64748b";
      ctx.fillText(txt, W / 2, y + 8);
      const tw = ctx.measureText(txt).width;
      ctx.strokeStyle = "#ef4444";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(W / 2 - tw / 2 - 4, y - 1);
      ctx.lineTo(W / 2 + tw / 2 + 4, y - 1);
      ctx.stroke();
      y += 40;
    }
    ctx.save();
    ctx.translate(W / 2, y + 96);
    ctx.scale(0.8 + 0.2 * k3, 0.8 + 0.2 * k3);
    fitText(ctx, pt.valor, 900, 124, LARG - 100);
    ctx.fillStyle = AZUL_ESCURO;
    ctx.fillText(pt.valor, 0, 0);
    ctx.restore();
    y += 140;
    if (pt.rodape) {
      fitText(ctx, pt.rodape, 600, 26, LARG - 100);
      ctx.fillStyle = TINTA_PROMO;
      ctx.fillText(pt.rodape, W / 2, y + 8);
      y += 40;
    }
    if (saida) {
      fitText(ctx, saida, 600, 24, LARG - 100);
      ctx.fillStyle = "#475569";
      ctx.fillText(saida, W / 2, y + 8);
      y += 40;
    }
    if (urg) {
      ctx.globalAlpha = out * clamp01((lt - 0.45) / 0.3);
      pilula(ctx, W / 2, y + 40, urg.toUpperCase(), "#dc2626", "#fff", "800 {s}px Montserrat, Arial", 24, LARG - 120);
    }
  }
  ctx.globalAlpha = 1;
}

// ---------------- Montagem de viagem (referência: Reels de Black Friday do Lucas) ----------------
// Cenas de viagem trocando, etiqueta "📍 TEXTO" no topo (1ª palavra em amarelo), título grande no centro com a
// última palavra em amarelo, linha de aviãozinho, fileira de ícones do que inclui e "Fale conosco!" no fim.
const AMARELO_MONTAGEM = () => GOLD;

function etiquetaMontagem(ctx: CanvasRenderingContext2D, texto: string, lt: number, out: number) {
  const k = ease(lt / 0.4);
  ctx.save();
  ctx.globalAlpha = out * k;
  ctx.textAlign = "left";
  ctx.font = "800 30px Montserrat, Arial";
  const palavras = texto.toUpperCase().split(/\s+/).filter(Boolean);
  const x0 = 70 + (1 - k) * -30;
  const y = 250;
  sombra(ctx, 14, "rgba(0,0,0,.6)");
  ctx.fillStyle = "#fff";
  ctx.fillText("📍", x0, y);
  let x = x0 + 44;
  palavras.forEach((p, i) => {
    ctx.fillStyle = i === 0 ? AMARELO_MONTAGEM() : "#fff";
    const larg = ctx.measureText(p + " ").width;
    if (x + larg > W - 60) return;
    ctx.fillText(p, x, y);
    x += larg;
  });
  semSombra(ctx);
  ctx.restore();
}

// linha tracejada em curva com um aviãozinho andando nela
function aviaozinho(ctx: CanvasRenderingContext2D, lt: number, out: number, y: number) {
  const k = clamp01(lt / 1.4);
  ctx.save();
  ctx.globalAlpha = out * 0.9;
  ctx.strokeStyle = "rgba(255,255,255,.85)";
  ctx.lineWidth = 3;
  ctx.setLineDash([10, 10]);
  ctx.beginPath();
  const x0 = 90;
  const x1 = W - 120;
  const pontos = 40;
  for (let i = 0; i <= pontos * k; i++) {
    const u = i / pontos;
    const px = x0 + (x1 - x0) * u;
    const py = y + Math.sin(u * Math.PI * 1.5) * 50;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.stroke();
  ctx.setLineDash([]);
  const ux = k;
  const ax = x0 + (x1 - x0) * ux;
  const ay = y + Math.sin(ux * Math.PI * 1.5) * 50;
  ctx.translate(ax, ay);
  ctx.rotate(Math.cos(ux * Math.PI * 1.5) * 0.6 - 0.2);
  ctx.font = "44px Arial";
  ctx.fillStyle = "#fff";
  ctx.textAlign = "center";
  ctx.fillText("✈", 0, 14);
  ctx.restore();
}

// título grande com a última palavra destacada, em até 3 linhas
function tituloMontagem(ctx: CanvasRenderingContext2D, texto: string, yCentro: number, lt: number, out: number, max = 96) {
  const r = linhasQueCabem(ctx, texto.toUpperCase(), "900 {s}px Montserrat, Arial", max, 46, W - 120, 3);
  const k = back((lt - 0.15) / 0.55);
  ctx.save();
  ctx.globalAlpha = out * clamp01((lt - 0.15) / 0.3);
  ctx.textAlign = "center";
  ctx.font = `900 ${r.tam}px Montserrat, Arial`;
  const altura = r.linhas.length * r.tam * 1.05;
  const y0 = yCentro - altura / 2 + r.tam * 0.8;
  sombra(ctx, 26, "rgba(0,0,0,.55)");
  r.linhas.forEach((linha, i) => {
    const y = y0 + i * r.tam * 1.05 + (1 - k) * 40;
    const ultima = i === r.linhas.length - 1;
    if (!ultima) {
      ctx.fillStyle = "#fff";
      ctx.fillText(linha, W / 2, y);
      return;
    }
    // na última linha, a última palavra em amarelo
    const partes = linha.split(" ");
    const fim = partes.pop() || "";
    const comeco = partes.length ? partes.join(" ") + " " : "";
    const wc = ctx.measureText(comeco).width;
    const wf = ctx.measureText(fim).width;
    const xi = W / 2 - (wc + wf) / 2;
    ctx.textAlign = "left";
    ctx.fillStyle = "#fff";
    ctx.fillText(comeco, xi, y);
    ctx.fillStyle = AMARELO_MONTAGEM();
    ctx.fillText(fim, xi + wc, y);
    ctx.textAlign = "center";
  });
  semSombra(ctx);
  ctx.restore();
  return y0 + r.linhas.length * r.tam * 1.05;
}

function iconeDoItem(item: string) {
  const t = item.toLowerCase();
  if (/aére|aere|voo|passage|ida e volta|bagagem/.test(t)) return "✈️";
  if (/hotel|hosped|pousada|resort|quarto|hostel|temporada/.test(t)) return "🏨";
  if (/traslad|translad|transfer|ônibus|onibus|transporte|motorista|carro|van/.test(t)) return "🚐";
  if (/café|cafe|almoço|almoco|refei|pensão|pensao|all inclusive|bebida|jantar|snack/.test(t)) return "🍽️";
  if (/seguro/.test(t)) return "🛡️";
  if (/ingresso|show|parque/.test(t)) return "🎟️";
  if (/barco|lancha|catamar|mergulho|praia/.test(t)) return "🚤";
  if (/passeio|tour|guia|buggy|4x4|trilha/.test(t)) return "🧭";
  if (/piscina|spa/.test(t)) return "🏊";
  return "✔️";
}

function cenaMontagem(ctx: CanvasRenderingContext2D, cena: number, lt: number, out: number, d: Dados, _logo: HTMLImageElement | null, _contatos: Contato[]) {
  ctx.textAlign = "center";
  if (cena === 0) {
    // abertura: etiqueta com o tipo, aviãozinho e o destino grande
    etiquetaMontagem(ctx, ehPacote(d) ? "Pacotes de viagem" : infoTipo(d).rotulo, lt, out);
    aviaozinho(ctx, lt, out, 470);
    const fim = tituloMontagem(ctx, d.destino || "Sua próxima viagem", 760, lt, out, 104);
    const k = ease((lt - 0.8) / 0.5);
    ctx.globalAlpha = out * k;
    sombra(ctx, 16, "rgba(0,0,0,.6)");
    ajustarFonte(ctx, "600 {s}px Montserrat, Arial", d.chamada, 38, W - 140);
    ctx.fillStyle = "#fff";
    ctx.fillText(d.chamada, W / 2, fim + 30 + (1 - k) * 16);
    semSombra(ctx);
    ctx.globalAlpha = 1;
  }
  if (cena === 1) {
    // o que inclui: etiqueta, título e a fileira de ícones (como "Pacotes completos ✈️🏨🚌☕")
    etiquetaMontagem(ctx, "O que está incluso", lt, out);
    const itens = d.itens.filter(Boolean).slice(0, 4);
    const k = ease((lt - 0.1) / 0.45);
    ctx.globalAlpha = out * k;
    ctx.font = "800 34px Montserrat, Arial";
    ctx.fillStyle = AMARELO_MONTAGEM();
    sombra(ctx, 14, "rgba(0,0,0,.6)");
    ctx.fillText(ehPacote(d) ? "PACOTES COMPLETOS" : infoTipo(d).curto.toUpperCase(), W / 2, 600 + (1 - k) * 20);
    semSombra(ctx);
    const lado = 104;
    const gap = 26;
    const total = itens.length * lado + (itens.length - 1) * gap;
    itens.forEach((it, i) => {
      const ki = back((lt - 0.3 - i * 0.12) / 0.45);
      ctx.globalAlpha = out * clamp01((lt - 0.3 - i * 0.12) / 0.25);
      const x = W / 2 - total / 2 + i * (lado + gap);
      const y = 650;
      ctx.save();
      ctx.translate(x + lado / 2, y + lado / 2);
      ctx.scale(0.6 + 0.4 * ki, 0.6 + 0.4 * ki);
      roundRect(ctx, -lado / 2, -lado / 2, lado, lado, 22);
      ctx.fillStyle = "#fff";
      sombra(ctx, 18, "rgba(0,0,0,.35)");
      ctx.fill();
      semSombra(ctx);
      ctx.font = "52px Arial";
      ctx.textBaseline = "middle";
      ctx.fillText(iconeDoItem(it), 0, 4);
      ctx.textBaseline = "alphabetic";
      ctx.restore();
    });
    // os nomes, pequenos, embaixo
    ctx.globalAlpha = out * ease((lt - 0.8) / 0.5);
    sombra(ctx, 12, "rgba(0,0,0,.6)");
    ajustarFonte(ctx, "700 {s}px Montserrat, Arial", itens.join(" · "), 30, W - 120);
    ctx.fillStyle = "#fff";
    ctx.fillText(itens.join(" · "), W / 2, 820);
    semSombra(ctx);
    ctx.globalAlpha = 1;
  }
  if (cena === 2) {
    // preço por último: "a partir de" + valor grande, com o selo amarelo
    etiquetaMontagem(ctx, d.destino || "Sua viagem", lt, out);
    const pt = precoTextos(d);
    const pk = back((lt - 0.2) / 0.55);
    ctx.globalAlpha = out * clamp01((lt - 0.2) / 0.3);
    ctx.save();
    ctx.translate(W / 2, 700);
    ctx.scale(0.7 + 0.3 * pk, 0.7 + 0.3 * pk);
    sombra(ctx, 16, "rgba(0,0,0,.6)");
    ajustarFonte(ctx, "800 {s}px Montserrat, Arial", pt.topo.toUpperCase(), 36, W - 140);
    ctx.fillStyle = "#fff";
    ctx.fillText(pt.topo.toUpperCase(), 0, -100);
    textoPreco(ctx, pt.valor, 0, 30, 140, W - 100, AMARELO_MONTAGEM());
    if (pt.rodape) {
      ctx.font = "600 36px Montserrat, Arial";
      ctx.fillStyle = "#fff";
      ctx.fillText(pt.rodape, 0, 100);
    }
    semSombra(ctx);
    ctx.restore();
    ctx.globalAlpha = 1;
  }
}

function cenaDestaque(ctx: CanvasRenderingContext2D, modelo: Modelo, texto: string, lt: number, out: number) {
  ctx.textAlign = "center";
  const k = ease((lt - 0.2) / 0.6);
  ctx.globalAlpha = out * k;
  if (modelo === "montagem") {
    etiquetaMontagem(ctx, texto, lt, out);
    aviaozinho(ctx, lt, out, 860);
    ctx.globalAlpha = 1;
    return;
  }
  if (modelo === "bf") {
    letrasBf(ctx, 40, 250, 64);
    const r = linhasQueCabem(ctx, texto, "900 {s}px Montserrat, Arial", 76, 40, W - 120, 2);
    ctx.textAlign = "center";
    sombra(ctx, 24);
    ctx.fillStyle = "#fff";
    ctx.font = `900 ${r.tam}px Montserrat, Arial`;
    r.linhas.forEach((l, i) => ctx.fillText(l, W / 2, 640 + i * r.tam * 1.08 + (1 - k) * 40));
    semSombra(ctx);
    ctx.fillStyle = LARANJA;
    const lw = 200 * ease((lt - 0.5) / 0.5);
    ctx.fillRect(W / 2 - lw / 2, 640 + r.linhas.length * r.tam * 1.08 - 4, lw, 8);
    ctx.globalAlpha = 1;
    return;
  }
  if (modelo === "promo") {
    const r = linhasQueCabem(ctx, texto, "italic 900 {s}px Montserrat, Arial", 60, 34, W - 180, 2);
    const h = 50 + r.linhas.length * r.tam * 1.12;
    painelInclinado(ctx, W / 2, 660, W - 100, h, AZUL_P, () => {
      ctx.textAlign = "center";
      ctx.fillStyle = "#fff";
      ctx.font = `italic 900 ${r.tam}px Montserrat, Arial`;
      r.linhas.forEach((l, i) => ctx.fillText(l, 0, -h / 2 + 36 + r.tam * 0.78 + i * r.tam * 1.12));
    });
    ctx.globalAlpha = 1;
    return;
  }
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

// Na prévia do feed 4:5, escurece o que fica fora do recorte.
function mascaraFeed(ctx: CanvasRenderingContext2D) {
  ctx.save();
  ctx.globalAlpha = 1;
  ctx.fillStyle = "rgba(0,0,0,.62)";
  ctx.fillRect(0, 0, W, RECORTE_FEED);
  ctx.fillRect(0, RECORTE_FEED + 900, W, H - RECORTE_FEED - 900);
  ctx.fillStyle = NEON;
  ctx.fillRect(0, RECORTE_FEED - 2, W, 3);
  ctx.fillRect(0, RECORTE_FEED + 899, W, 3);
  ctx.fillStyle = "#fff";
  ctx.textAlign = "center";
  ctx.font = "700 22px Montserrat, Arial";
  ctx.fillText("FEED 4:5 · sai só o que está entre as linhas", W / 2, H - 70);
  ctx.restore();
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
  L: Linha = LINHA_PADRAO,
  feed = false,
) {
  prepararCtx(ctx);
  aplicarTema(tema);
  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, W, H);
  const dividida = modelo === "faixa";
  const alturaFundo = dividida ? LINHA_FAIXA : H;

  // fundo: um vídeo (ou foto) por tela, com zoom lento e fusão entre telas
  for (let i = 0; i < L.telas.length; i++) {
    const m = vids[i % Math.max(vids.length, 1)];
    if (!m) continue;
    const dur = L.telas[i].dur;
    const local = t - L.inicios[i];
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

  const cena = telaEm(t, L);
  const lt = t - L.inicios[cena];
  const dur = L.telas[cena].dur;
  const out = cena === L.telas.length - 1 ? 1 : 1 - ease((lt - (dur - 0.35)) / 0.35);
  const tipo = L.telas[cena].tipo;

  // escurece para dar leitura
  const g = ctx.createLinearGradient(0, 0, 0, H);
  if (dividida) {
    g.addColorStop(0, "rgba(0,0,0,.25)");
    g.addColorStop(0.3, "rgba(0,0,0,0)");
    g.addColorStop(1, "rgba(0,0,0,0)");
  } else if (tipo === "contato") {
    g.addColorStop(0, "rgba(5,8,20,.5)");
    g.addColorStop(1, "rgba(5,8,20,.82)");
  } else if (modelo === "bf") {
    g.addColorStop(0, "rgba(0,0,0,.6)");
    g.addColorStop(0.5, "rgba(0,0,0,.45)");
    g.addColorStop(1, "rgba(0,0,0,.88)");
  } else if (modelo === "promo") {
    g.addColorStop(0, "rgba(10,55,160,.5)");
    g.addColorStop(0.55, "rgba(8,40,120,.55)");
    g.addColorStop(1, "rgba(4,18,60,.9)");
  } else if (modelo === "luxo" || modelo === "revista") {
    g.addColorStop(0, "rgba(0,0,0,.3)");
    g.addColorStop(0.4, "rgba(0,0,0,.5)");
    g.addColorStop(0.65, "rgba(0,0,0,.68)");
    g.addColorStop(1, "rgba(0,0,0,.85)");
  } else if (modelo === "postal") {
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
  const encolhe = !(modelo === "neon" || modelo === "faixa" || modelo === "bf" || modelo === "promo");
  if (tipo === "contato") {
    ctaPadrao(ctx, d, logo, contatos, lt, modelo, dividida ? 120 : 0);
  } else {
    ctx.save();
    if (encolhe) {
      ctx.translate(W / 2, 600);
      ctx.scale(0.9, 0.9);
      ctx.translate(-W / 2, -600);
    }
    const semItens = tipo === "inclusos" && !d.itens.some(Boolean);
    if (tipo === "destaque" || semItens) {
      const n = L.telas.slice(0, cena).filter((x) => x.tipo === "destaque").length;
      const texto = semItens ? (d.destaques[2] || d.chamada) : d.destaques[n] || (n === 0 ? d.chamada : `Conheça ${d.destino}`);
      cenaDestaque(ctx, modelo, texto, lt, out);
    } else {
      const fn = {
        classico: cenaClassico, neon: cenaNeon, cartao: cenaCartao, luxo: cenaLuxo,
        passagem: cenaPassagem, revista: cenaRevista, postal: cenaPostal, faixa: cenaFaixa, vibrante: cenaVibrante, bf: cenaBf, promo: cenaPromo, montagem: cenaMontagem,
      }[modelo];
      fn(ctx, CENA_MODELO[tipo], lt, out, d, logo, contatos);
    }
    ctx.restore();
  }
  // Black Friday e Promo desenham preço antigo, saída e urgência dentro do próprio cartão
  const cartaoProprio = modelo === "bf" || modelo === "promo";
  if (tipo === "preco" && !cartaoProprio) precoAntigo(ctx, d, lt, out, ocasiao, modelo === "revista" ? 775 : modelo === "faixa" ? 690 : 300);
  if (tipo === "preco" && !cartaoProprio) linhaSaida(ctx, d, lt, out, modelo, ocasiao);
  if (tipo === "preco" && !cartaoProprio) linhaUrgencia(ctx, d, lt, out, modelo);
  if (modelo === "postal") moldura(ctx, 1);
  if (!(modelo === "bf" && ehBlack(ocasiao))) camadaOcasiao(ctx, ocasiao, t, tipo, lt, feed);
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
      className={`w-full rounded-2xl px-4 py-4 text-[16px] font-bold disabled:opacity-60 ${gravando ? "animate-pulse bg-red-600 text-white" : "bg-[#F5F906] text-black"}`}
      onClick={() => {
        if (gravando) { recRef.current?.stop(); setGravando(false); }
        else iniciar().catch(() => alert("O navegador bloqueou o microfone. Clique no cadeado da barra de endereço e permita."));
      }}
    >
      {gravando ? `Parar e enviar (${seg}s)` : "Gravar áudio do pacote"}
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
    <div>
      <button
        id="microfone"
        className={`w-full rounded-2xl px-4 py-4 text-[16px] font-bold ${ouvindo ? "animate-pulse bg-red-600 text-white" : "bg-[#F5F906] text-black"}`}
        onClick={() => (ouvindo ? recRef.current?.stop() : iniciar())}
      >
        {ouvindo ? "Parar e enviar" : "Gravar áudio do pacote"}
      </button>
      {parcial && <p className="mt-2 text-[13px] italic text-white/70">{parcial}</p>}
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

type Entrada = "montar" | "pacote" | "audio" | "texto" | "foto";

export default function VideoLab() {
  return (
    <FabricaProvider>
      <VideoLabTela />
    </FabricaProvider>
  );
}

export function VideoLabTela({ embutido = false }: { embutido?: boolean }) {
  const { state: fabrica, isHydrated } = useFabricaContext();
  const { user } = useAuth();
  const { marcar, marcada } = useJornada();
  const [params] = useSearchParams();
  const [restantes, setRestantes] = useState<number | null>(null);
  const [mostrarOqueFazer, setMostrarOqueFazer] = useState(params.get("missao") === "postar_video");
  const autoRodou = useRef(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const vidsRef = useRef<Fundo[]>([]);
  const [entrada, setEntrada] = useState<Entrada>("montar");
  const [frase, setFrase] = useState("");
  const [foto, setFoto] = useState<string | null>(null);
  // o que a agência preencheu fica salvo no aparelho: recarregar a página não apaga nada
  const salvo = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem(CHAVE_SALVO) || "null") as { dados?: Partial<Dados>; contatos?: Contato[] } | null;
    } catch {
      return null;
    }
  }, []);
  const [dados, setDados] = useState<Dados>(() => ({
    destino: "Cancún",
    chamada: "O Caribe mexicano te espera",
    pagamento: "cash",
    parcelas: "10x",
    entrada: "",
    preco: "R$ 8.000",
    precoAntigo: "",
    pessoas: "para o casal",
    saida: "",
    datas: "",
    tipo: "pacote",
    urgencia: "",
    itens: ["Aéreo ida e volta", "Hotel all inclusive", "Traslados", "Seguro viagem"],
    destaques: ["Mar azul-turquesa", "Dias de puro descanso"],
    agencia: "Sua Agência",
    whatsapp: "(11) 99999-9999",
    instagram: "",
    facebook: "",
    email: "",
    site: "",
    ...(salvo?.dados || {}),
  }));
  const [contatos, setContatos] = useState<Contato[]>(salvo?.contatos?.length ? salvo.contatos : ["whatsapp"]);
  useEffect(() => {
    const t = setTimeout(() => {
      try {
        localStorage.setItem(CHAVE_SALVO, JSON.stringify({ dados, contatos }));
      } catch {
        /* sem espaço ou modo privado: segue sem salvar */
      }
    }, 400);
    return () => clearTimeout(t);
  }, [dados, contatos]);
  const [modelo, setModelo] = useState<Modelo>(ORDEM_SUGERIDA[0]);
  const modeloRef = useRef<Modelo>(ORDEM_SUGERIDA[0]);
  modeloRef.current = modelo;
  // fileira de estilos no celular: o estilo ativo (inclusive quando o gerador troca sozinho) fica à vista
  const estilosRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const fila = estilosRef.current;
    const ativo = fila?.querySelector<HTMLElement>('[aria-checked="true"]');
    if (!fila || !ativo || fila.scrollWidth <= fila.clientWidth) return;
    const dx = ativo.getBoundingClientRect().left - fila.getBoundingClientRect().left;
    fila.scrollTo({ left: fila.scrollLeft + dx - (fila.clientWidth - ativo.offsetWidth) / 2, behavior: "smooth" });
  }, [modelo]);
  // Rodízio: cada "Gerar" usa o estilo seguinte da ordem (1 vídeo) ou os 3 seguintes (3 vídeos),
  // para nunca repetir a variação anterior. Escolher um estilo na lista reposiciona o rodízio nele.
  const proximoRef = useRef(0);
  const roteiroRef = useRef(0);
  // a oferta do mês fica sugerida na lista (selo AGORA), mas só entra se o cliente escolher
  const sazonais = ocasioesDoMes();
  const [ocasiao, setOcasiao] = useState<Ocasiao>("nenhuma");
  const [paleta, setPaleta] = useState("estilo");
  const [corLivre, setCorLivre] = useState({ c1: "#f5c451", c2: "#0ea5e9" });
  const [fonte, setFonte] = useState("Montserrat");
  const [resultados, setResultados] = useState<{ modelo: Modelo; url: string; nome: string; roteiro: Roteiro; formato: Formato }[]>([]);
  // formato: stories 9:16 (720×1280) ou feed 4:5 (1080×1350, recorte do centro)
  const [formato, setFormato] = useState<Formato>("stories");
  const formatoRef = useRef<Formato>("stories");
  formatoRef.current = formato;
  // duração: completo (22 s, 6 telas) ou curto (12 s: abertura, preço e contato)
  const [curto, setCurto] = useState(false);
  const curtoRef = useRef(false);
  curtoRef.current = curto;
  const linhaPrevia = linhaDoTempo(montarTelas("padrao", curto));
  const linhaRef = useRef(LINHA_PADRAO);
  linhaRef.current = linhaPrevia;
  const [legendaCopiada, setLegendaCopiada] = useState(false);
  const [miniaturas, setMiniaturas] = useState<Partial<Record<Modelo, string>>>({});
  // painel aberto embaixo (estilo, cores, fonte…); declarado aqui porque as miniaturas dependem dele
  const [folha, setFolha] = useState<null | "oferta" | "estilo" | "cores" | "fonte" | "duracao" | "formato">(null);
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
  // os vídeos de fundo também ficam salvos: ao recarregar, o destino salvo volta com as imagens dele
  useEffect(() => {
    const online = fundos.filter((m) => /^https:\/\//.test(m.url));
    // os vídeos de exemplo (Cancún) não contam: só guarda o fundo de um destino de verdade
    if (!online.length || online.every((m) => CLIPS.includes(m.url))) return;
    try {
      localStorage.setItem(CHAVE_FUNDOS, JSON.stringify(online));
    } catch {
      /* sem espaço: segue sem salvar */
    }
  }, [fundos]);
  const [pool, setPool] = useState<Midia[]>([]);
  const [editando, setEditando] = useState(false);
  const [telaAberta, setTelaAberta] = useState<number | null>(null);
  const [busca, setBusca] = useState("");
  const [buscando, setBuscando] = useState(false);
  const [fotoEtapa, setFotoEtapa] = useState<"" | "recebida" | "lendo" | "buscando" | "pronta" | "erro">("");
  const [logo, setLogo] = useState<HTMLImageElement | null>(null);
  const [status, setStatus] = useState("Carregando vídeos…");
  const [pausado, setPausado] = useState(false);
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
    // cores e fonte da marca (Fábrica): o vídeo já nasce com elas; dá para trocar depois em "Ajustar o visual"
    if (fabrica.primaryColor) setPaleta("marca");
    if (fabrica.fontFamily && FONTES.includes(fabrica.fontFamily)) setFonte(fabrica.fontFamily);
    if (fabrica.logoBase64) {
      // A logo pode vir como endereço de outro site (ex.: site publicado), não só embutida.
      // Sem crossOrigin ela "contamina" o canvas e o MP4 não é gerado ("tainted sources").
      // Com crossOrigin: se o site da imagem não permitir, ela não carrega e o vídeo sai sem logo, sem erro.
      const img = new Image();
      if (/^https?:\/\//i.test(fabrica.logoBase64)) img.crossOrigin = "anonymous";
      img.onload = () => setLogo(img);
      img.onerror = () => setLogo(null);
      img.src = fabrica.logoBase64;
    }
  }, [isHydrated, fabrica]);

  const pacotes = (fabrica.selectedPackages || []).filter((p) => p.title);

  useEffect(() => {
    if (autoRodou.current || !isHydrated || carregando || params.get("gerar") !== "1") return;
    const ultimo = pacotes[pacotes.length - 1];
    if (!ultimo) return;
    autoRodou.current = true;
    setEntrada("pacote");
    enviar({ text: textoDoPacote(ultimo) }).then((ok) => {
      if (ok) gerarTres();
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isHydrated, carregando, pacotes.length]);

  // Ao abrir: os fundos do último destino salvo; sem eles (ou se algum link expirou), os vídeos de exemplo.
  async function carregarInicial() {
    const exemplo = [...CLIPS, ...CLIPS].slice(0, CENAS).map((url) => ({ tipo: "video" as const, url }));
    const salvos = salvo?.dados?.destino ? fundosSalvos() : [];
    if (salvos.length >= CENAS) {
      try {
        await carregarFundos(salvos.slice(0, CENAS));
        return;
      } catch {
        /* link expirado: volta para o exemplo */
      }
    }
    await carregarFundos(exemplo);
  }

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
      v.dataset.origem = m.url;
      if (typeof VideoDecoder !== "undefined") {
        // Baixa uma vez só: o mesmo arquivo serve para a prévia e para a geração rápida.
        // (Antes cada vídeo vinha duas vezes: ~30 MB a mais nos dados móveis.)
        const limite = new Promise<never>((_, rej) => setTimeout(() => rej(new Error("lento")), 15000));
        Promise.race([baixarVideo(m.url), limite])
          .then((buf) => { if (!v.src) { v.src = URL.createObjectURL(new Blob([buf], { type: "video/mp4" })); v.load(); } })
          .catch(() => { if (!v.src) { v.src = m.url; v.load(); } });
      } else {
        v.src = m.url;
      }
      v.muted = true;
      v.defaultMuted = true;
      v.setAttribute("muted", "");
      v.playsInline = true;
      v.setAttribute("playsinline", "");
      v.loop = true;
      v.crossOrigin = "anonymous";
      v.preload = "auto";
      return v;
    });
    try {
      await Promise.all(
        els.map(
          (el) =>
            new Promise<void>((r, rej) => {
              let feito = false;
              const ok = () => { if (!feito) { feito = true; clearTimeout(limite); r(); } };
              // iPhone: vídeo fora da tela não baixa sozinho e o "canplay" nunca chegava (ficava em "Carregando vídeos…").
              // Pede o carregamento, toca sem som por um instante e aceita o primeiro sinal de que há imagem.
              const limite = setTimeout(ok, 20000);
              if (isVideo(el)) {
                el.addEventListener("loadeddata", ok, { once: true });
                el.addEventListener("canplay", ok, { once: true });
                const tocar = () => {
                  try {
                    el.play().then(() => el.pause()).catch(() => undefined);
                  } catch { /* navegador sem play automático: o limite de tempo segue */ }
                };
                if (el.getAttribute("src")) { el.load(); tocar(); }
                else el.addEventListener("loadstart", tocar, { once: true });
              } else {
                el.addEventListener("load", ok, { once: true });
                if ((el as HTMLImageElement).complete && (el as HTMLImageElement).naturalWidth) ok();
              }
              el.addEventListener("error", () => { if (!feito) { feito = true; clearTimeout(limite); rej(new Error("Um vídeo do destino não carregou.")); } }, { once: true });
            }),
        ),
      );
    } finally {
      setCarregando(false);
    }
    vidsRef.current.forEach((v) => {
      if (isVideo(v)) { v.pause(); if (v.src.startsWith("blob:")) URL.revokeObjectURL(v.src); v.removeAttribute("src"); v.load(); }
    });
    vidsRef.current = els;
    setStatus("Pronto");
  }

  async function enviar(conteudo: { text?: string; image?: string; buscas?: string[] }, aoBuscar?: () => void): Promise<boolean> {
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
      // enquanto o servidor não devolve saída e datas, tenta achar no próprio texto
      const extra = extrairSaida(conteudo.text || "");
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
        saida: d.saida || extra.saida,
        datas: d.datas || extra.datas,
        tipo: (d.tipo as TipoOferta) || detectarTipo(texto),
        urgencia: "",
        itens: d.itens || [],
        destaques: d.destaques?.length ? d.destaques : [],
        agencia: a.agencia === "Sua Agência" && d.agencia ? d.agencia : a.agencia,
        whatsapp: d.whatsapp && !fabrica.whatsapp ? d.whatsapp : a.whatsapp,
        instagram: d.instagram && !a.instagram ? d.instagram : a.instagram,
      }));
      if (d.instagram && !contatosRef.current.includes("instagram")) setContatos((c) => [...c, "instagram"]);
      let midias: Midia[] = data.midias || [];
      // Experiência ou serviço (sem destino fixo): fundos buscados pelos termos do tema, intercalados
      const proprias = conteudo.buscas?.filter(Boolean) || [];
      if (proprias.length) {
        try {
          const porTermo = await Promise.all(proprias.map((t) => buscarMidias(t).catch(() => [] as Midia[])));
          const vistos = new Set<string>();
          const mistura: Midia[] = [];
          for (let i = 0; i < 10; i++)
            for (const lista of porTermo) {
              const m = lista[i];
              if (m && !vistos.has(m.url)) { vistos.add(m.url); mistura.push(m); }
            }
          if (mistura.length >= 3) midias = mistura;
        } catch { /* fica com os vídeos que o servidor achou */ }
      }
      setPool(midias);
      if (midias.length === 0) {
        setAviso(`Não achei vídeos de ${d.destino}. Mantive os atuais.`);
      } else {
        setEtapa(`Carregando vídeos de ${d.destino}…`);
        aoBuscar?.();
        const lista = [...midias];
        while (lista.length < CENAS) lista.push(midias[lista.length % midias.length]);
        // oferta que não é pacote: um fundo do tipo (avião, navio, resort…) na 2ª tela
        const termoTipo = TIPOS.find((x) => x.id === ((d.tipo as TipoOferta) || detectarTipo(texto)))?.busca;
        if (termoTipo && !conteudo.buscas?.length) {
          try {
            const doTipo = await buscarMidias(termoTipo);
            if (doTipo[0]) lista[1] = doTipo[0];
          } catch { /* sem fundo do tipo: segue só com o destino */ }
        }
        await carregarFundos(lista);
        const usadas = lista.slice(0, CENAS);
        setFontes({ videos: usadas.filter((m) => m.tipo === "video").length, fotos: usadas.filter((m) => m.tipo === "foto").length });
      }
      setEtapa("Pronto. Confira os campos e toque em Gerar 3 vídeos.");
      if (typeof data.videos_restantes === "number") setRestantes(data.videos_restantes);
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

  // Busca avulsa no Pexels (não conta no limite diário).
  async function buscarMidias(termo: string): Promise<Midia[]> {
    const { data: sess } = await supabase.auth.getSession();
    const { data, error } = await supabase.functions.invoke("fabrica-video-pronto", {
      body: { buscar: termo },
      headers: sess.session ? undefined : { "x-video-lab": "sem-login" },
    });
    if (error) throw new Error("A busca não respondeu. Tente de novo.");
    return (data.midias || []) as Midia[];
  }

  async function buscarNoPexels() {
    if (busca.trim().length < 2) return;
    setBuscando(true);
    try {
      const novos = await buscarMidias(busca.trim());
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
    link.href = "https://fonts.googleapis.com/css2?family=Montserrat:wght@300;500;600;700;800;900&family=Playfair+Display:ital,wght@0,700;1,400&family=Poppins:wght@300;500;600;700;800;900&family=Oswald:wght@300;500;600;700&family=Bebas+Neue&family=Nunito:wght@300;600;700;800;900&family=Raleway:wght@300;500;600;700;800;900&family=Inter:wght@300;500;600;700;800;900&family=Roboto:wght@300;500;700;900&family=Lora:wght@500;600;700&family=Work+Sans:wght@300;500;600;700;800;900&family=DM+Sans:wght@300;500;600;700;800;900&display=swap";
    document.head.appendChild(link);
    carregarElementos();
    Promise.all([document.fonts.load("900 40px Montserrat"), document.fonts.load("700 40px 'Playfair Display'"), document.fonts.load("italic 400 40px 'Playfair Display'"), carregarInicial()]).catch((e) =>
      setStatus("Erro: " + e.message),
    );
    return () => link.remove();
  }, []);

  // prévia ao vivo, em loop. Leve no celular: 30 quadros por segundo, só o vídeo da cena atual tocando,
  // e tudo parado quando a prévia sai da tela ou a aba fica em segundo plano.
  useEffect(() => {
    if (carregando || gravando) return;
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    let raf = 0;
    let visivel = true;
    let tempo = 0; // segundos de prévia já mostrados (pausa não pula cena)
    let ultimo = performance.now();
    let ultimoDesenho = 0;
    let lastScene = -1;
    const pausarTodos = () => vidsRef.current.forEach((v) => isVideo(v) && !v.paused && v.pause());
    const tocarSo = (atual: Fundo | undefined) =>
      vidsRef.current.forEach((v) => {
        if (!isVideo(v)) return;
        if (v === atual) v.play().catch(() => undefined);
        else if (!v.paused) v.pause();
      });
    const loop = (agora: number) => {
      raf = requestAnimationFrame(loop);
      const dt = Math.min(agora - ultimo, 100);
      ultimo = agora;
      if (!visivel || document.hidden) return;
      tempo += dt / 1000;
      if (agora - ultimoDesenho < 32) return;
      ultimoDesenho = agora;
      const L = linhaRef.current;
      const t = tempo % L.total;
      const sc = telaEm(t, L);
      if (sc !== lastScene) {
        const vs = vidsRef.current;
        const v = vs[sc % Math.max(vs.length, 1)];
        if (v && isVideo(v)) v.currentTime = 0;
        tocarSo(v);
        lastScene = sc;
      }
      const feed = formatoRef.current === "feed";
      drawFrame(ctx, t, vidsRef.current, dadosRef.current, logoRef.current, contatosRef.current, modeloRef.current, ocasiaoRef.current, temaRef.current, L, feed);
      if (feed) mascaraFeed(ctx);
    };
    const obs = new IntersectionObserver(([e]) => {
      visivel = e.isIntersecting;
      if (!visivel) pausarTodos();
      else lastScene = -1; // volta a tocar o vídeo da cena
    });
    obs.observe(canvas);
    const aoTrocarAba = () => {
      if (document.hidden) pausarTodos();
      else lastScene = -1;
    };
    document.addEventListener("visibilitychange", aoTrocarAba);
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      obs.disconnect();
      document.removeEventListener("visibilitychange", aoTrocarAba);
    };
  }, [carregando, gravando, curto]);

  // Atalho de teste: desenha um momento do vídeo num modelo e devolve a imagem.
  useEffect(() => {
    (window as unknown as Record<string, unknown>).__videoLabQuadro = (t: number, m: Modelo, oc: Ocasiao = "nenhuma", tema?: Tema, roteiro: Roteiro = "padrao", curtoQ: boolean = curtoRef.current, feedQ: boolean = formatoRef.current === "feed") => {
      const L = linhaDoTempo(montarTelas(roteiro, curtoQ));
      if (feedQ) {
        const g = document.createElement("canvas");
        g.width = 1080;
        g.height = 1920;
        const gc = g.getContext("2d")!;
        gc.scale(1.5, 1.5);
        drawFrame(gc, t, vidsRef.current, dadosRef.current, logoRef.current, contatosRef.current, m, oc, tema || temaRef.current, L, true);
        const sc = document.createElement("canvas");
        sc.width = FEED_W;
        sc.height = FEED_H;
        sc.getContext("2d")!.drawImage(g, 0, RECORTE_FEED * 1.5, 1080, FEED_H, 0, 0, FEED_W, FEED_H);
        return sc.toDataURL("image/jpeg", 0.8);
      }
      const c = document.createElement("canvas");
      c.width = W;
      c.height = H;
      drawFrame(c.getContext("2d")!, t, vidsRef.current, dadosRef.current, logoRef.current, contatosRef.current, m, oc, tema || temaRef.current, L);
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
      setMiniaturas((a) => ({ ...a, ...novas }));
    }, 900);
    return () => clearTimeout(id);
  }, [carregando, gravando, dados, ocasiao, paleta, corLivre, fonte, logo, folha, modelo]);

  // Gera quadro a quadro (não depende de a tela estar visível nem da velocidade do aparelho).
  // fotografia das opções: mudar algo na tela durante a geração não altera o vídeo
  const fotografar = (modeloEscolhido: Modelo, roteiro: Roteiro = "padrao") => ({
    dados: structuredClone(dadosRef.current),
    logo: logoSemContaminar(logoRef.current),
    contatos: [...contatosRef.current],
    modelo: modeloEscolhido,
    ocasiao: ocasiaoRef.current,
    tema: { ...temaRef.current },
    roteiro,
    linha: linhaDoTempo(montarTelas(roteiro, curtoRef.current)),
    formato: formatoRef.current,
  });

  const nomeArquivo = (m: Modelo) =>
    `video-${dadosRef.current.destino}-estilo${MODELOS.findIndex((x) => x.id === m) + 1}${ocasiaoRef.current !== "nenhuma" ? "-" + ocasiaoRef.current : ""}${curtoRef.current ? "-curto" : ""}${formatoRef.current === "feed" ? "-feed" : ""}.mp4`;

  // 3 estilos diferentes: o escolhido e mais dois que combinam bem

  // Capa pequena do vídeo (último quadro desenhado), para a biblioteca.
  function capaAtual(): string {
    try {
      const c = document.createElement("canvas");
      c.width = 108;
      c.height = 192;
      c.getContext("2d")!.drawImage(canvasRef.current!, 0, 0, 108, 192);
      return c.toDataURL("image/jpeg", 0.6);
    } catch {
      return "";
    }
  }

  async function guardar(m: Modelo, blob: Blob) {
    const d = dadosRef.current;
    try {
      await salvarVideo({
        nome: nomeArquivo(m),
        destino: d.destino,
        estilo: MODELOS.findIndex((x) => x.id === m) + 1,
        ocasiao: ocasiaoRef.current,
        tamanho: blob.size,
        blob,
        capa: capaAtual(),
      });
    } catch { /* sem espaço ou sem IndexedDB: o vídeo continua na tela */ }
  }

  // Um registro por rodada de geração. É o que aparece na Gestão.
  async function registrarNaGestao(quantos: number) {
    marcar("video");
    if (!user) return;
    await (supabase.from("user_activities") as any)
      .insert({ user_id: user.id, activity_type: "video_pronto", points_earned: 25, metadata: { destino: dadosRef.current.destino, quantos, ocasiao: ocasiaoRef.current } })
      .then(() => undefined)
      .catch(() => undefined);
  }

  async function gerar() {
    const soltarTela = await manterTelaAcesa();
    setGravando(true);
    setEtapa("");
    setUrl(null);
    setResultados([]);
    try {
      const m = ORDEM_SUGERIDA[proximoRef.current % ORDEM_SUGERIDA.length];
      const roteiro = ROTEIROS[roteiroRef.current % ROTEIROS.length].id;
      proximoRef.current += 1;
      roteiroRef.current += 1;
      setModelo(m);
      const blob = await renderizarComReserva(fotografar(m, roteiro), (p) => setStatus(`Gerando o vídeo… ${p}%`));
      const u = URL.createObjectURL(blob);
      setUrl(u);
      setResultados([{ modelo: m, url: u, nome: nomeArquivo(m), roteiro, formato: formatoRef.current }]);
      setTimeout(() => document.getElementById("resultados")?.scrollIntoView({ behavior: "smooth", block: "start" }), 200);
      await guardar(m, blob);
      registrarNaGestao(1);
      setStatus("Pronto! Seu vídeo está abaixo.");
    } catch (e) {
      setStatus("Erro: " + (e as Error).message);
      setAviso(`Não consegui montar o vídeo neste aparelho (${(e as Error).message}). Feche outras abas e tente de novo; se continuar, abra no Chrome ou no Safari.`);
    }
    setGravando(false);
    setPausado(false);
    soltarTela();
  }

  // Se a geração rápida falhar no aparelho, tenta de novo do jeito simples antes de mostrar erro.
  async function renderizarComReserva(foto: ReturnType<typeof fotografar>, progresso: (p: number) => void) {
    try {
      return await renderizar(foto, progresso);
    } catch (e) {
      console.warn("[video] geração rápida falhou, tentando do jeito simples", e);
      progresso(0);
      return await renderizar(foto, progresso, true);
    }
  }

  async function gerarTres() {
    const soltarTela = await manterTelaAcesa();
    setGravando(true);
    setEtapa(""); // a mensagem "toque em Gerar" já não vale: os vídeos estão saindo
    setUrl(null);
    setResultados([]);
    // os 3 estilos seguintes do rodízio (a próxima rodada começa de onde esta parou)
    const inicio = proximoRef.current;
    const lista: Modelo[] = [0, 1, 2].map((i) => ORDEM_SUGERIDA[(inicio + i) % ORDEM_SUGERIDA.length]);
    proximoRef.current += 3;
    setModelo(lista[0]);
    // cada um dos 3 com um roteiro: destino primeiro, preço primeiro, frase de impacto primeiro
    const roteiros: Roteiro[] = ["padrao", "experiencia", "gancho"];
    const t0 = performance.now();
    try {
      for (let i = 0; i < lista.length; i++) {
        const m = lista[i];
        const roteiro = roteiros[i % roteiros.length];
        const blob = await renderizarComReserva(fotografar(m, roteiro), (p) => setStatus(`Vídeo ${i + 1} de ${lista.length}… ${p}%`));
        const u = URL.createObjectURL(blob);
        if (i === 0) setUrl(u);
        setResultados((r) => [...r, { modelo: m, url: u, nome: nomeArquivo(m), roteiro, formato: formatoRef.current }]);
        // o primeiro vídeo pronto aparece na tela (no celular ele ficava lá embaixo, depois do quiz)
        if (i === 0) setTimeout(() => document.getElementById("resultados")?.scrollIntoView({ behavior: "smooth", block: "start" }), 200);
        await guardar(m, blob);
      }
      registrarNaGestao(lista.length);
      const seg = ((performance.now() - t0) / 1000).toFixed(0);
      (window as unknown as { __videoLab3: unknown }).__videoLab3 = { seg };
      setStatus(`Pronto! ${lista.length} vídeos em ${seg}s. Escolha o seu abaixo.`);
    } catch (e) {
      setStatus("Erro: " + (e as Error).message);
      setAviso(`Não consegui montar o vídeo neste aparelho (${(e as Error).message}). Feche outras abas e tente de novo; se continuar, abra no Chrome ou no Safari.`);
    }
    setGravando(false);
    setPausado(false);
    soltarTela();
  }

  const legenda = montarLegenda(dados, contatos);
  async function copiarLegenda() {
    try {
      await navigator.clipboard.writeText(legenda);
      setLegendaCopiada(true);
      setTimeout(() => setLegendaCopiada(false), 2500);
    } catch {
      window.prompt("Copie a legenda:", legenda);
    }
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

  async function renderizar(foto0: ReturnType<typeof fotografar>, progresso: (p: number) => void, semRapido = false): Promise<Blob> {
    // celular: 24 quadros por segundo (20% menos trabalho, a diferença não aparece no Reels)
    const FPS = CELULAR ? 24 : 30;
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    const vids = vidsRef.current;
    vids.forEach((v) => isVideo(v) && v.pause());
    {
      // feed 4:5: desenha em 1080×1920 (nítido) e recorta a faixa central 1080×1350; stories: o canvas de sempre
      const feed = foto0.formato === "feed";
      const OW = feed ? FEED_W : W;
      const OH = feed ? FEED_H : H;
      let gctx: CanvasRenderingContext2D | null = null;
      let saida: HTMLCanvasElement | null = null;
      let sctx: CanvasRenderingContext2D | null = null;
      let grande: HTMLCanvasElement | null = null;
      if (feed) {
        grande = document.createElement("canvas");
        grande.width = 1080;
        grande.height = 1920;
        gctx = grande.getContext("2d")!;
        gctx.scale(1.5, 1.5);
        saida = document.createElement("canvas");
        saida.width = FEED_W;
        saida.height = FEED_H;
        sctx = saida.getContext("2d")!;
      }
      const codecs = ["avc1.4d0028", "avc1.640028", "avc1.42002a"];
      let codec = "";
      for (const c of codecs) {
        const ok = await VideoEncoder.isConfigSupported({ codec: c, width: OW, height: OH, bitrate: 4_500_000, framerate: FPS });
        if (ok.supported) { codec = c; break; }
      }
      if (!codec) throw new Error("Este navegador não gera MP4");
      const muxer = new Muxer({ target: new ArrayBufferTarget(), video: { codec: "avc", width: OW, height: OH }, fastStart: "in-memory" });
      let erroEnc: Error | null = null;
      const enc = new VideoEncoder({
        output: (chunk, meta) => muxer.addVideoChunk(chunk, meta),
        error: (e) => { erroEnc = e as Error; },
      });
      enc.configure({ codec, width: OW, height: OH, bitrate: CELULAR ? 3_000_000 : 4_500_000, framerate: FPS });
      // Em vez de "pular" para cada quadro (lento: decodifica de novo a cada pulo),
      // cada vídeo toca normalmente e o quadro espera ele chegar no ponto certo.
      const tocando = new Set<number>();
      const esperar = (v: HTMLVideoElement, x: number) =>
        new Promise<void>((r) => {
          const alvo = x % Math.max(v.duration - 0.05, 0.5);
          const limite = performance.now() + 400;
          // O quadro novo chega pelo requestVideoFrameCallback; se a aba/painel estiver escondido ele não dispara,
          // então um setTimeout em paralelo garante que a geração nunca trava (só fica mais lenta).
          let tempo: ReturnType<typeof setTimeout> | undefined;
          let rvfc: number | undefined;
          const vv = v as HTMLVideoElement & { requestVideoFrameCallback?: (cb: () => void) => number; cancelVideoFrameCallback?: (id: number) => void };
          const checar = () => {
            if (tempo !== undefined) clearTimeout(tempo);
            if (rvfc !== undefined && vv.cancelVideoFrameCallback) vv.cancelVideoFrameCallback(rvfc);
            const ct = v.currentTime;
            // chegou no ponto (ou deu a volta no loop) ou passou do tempo-limite
            if (ct >= alvo - 0.017 || (alvo > v.duration - 0.6 && ct < 0.3) || performance.now() > limite) r();
            else {
              if (vv.requestVideoFrameCallback) rvfc = vv.requestVideoFrameCallback(checar);
              tempo = setTimeout(checar, vv.requestVideoFrameCallback ? 40 : 5);
            }
          };
          checar();
        });
      const L = foto0.linha;
      const n = Math.round(L.total * FPS);
      // Geração rápida: cada vídeo de fundo é lido quadro a quadro do arquivo (não precisa tocar nem
      // esperar o tempo real, e continua com a página minimizada). Se algum não der, só ele volta ao jeito antigo.
      const fontes: (QuadrosDeVideo | null)[] = semRapido
        ? vids.map(() => null)
        : await Promise.all(vids.map((v) => (isVideo(v) ? QuadrosDeVideo.abrir(v.dataset.origem || v.currentSrc || v.src).catch(() => null) : Promise.resolve(null))));
      let todosLidos = vids.every((v, i) => !isVideo(v) || fontes[i]);
      const vidsDesenho: Fundo[] = vids.map((v, i) => fontes[i]?.canvas ?? v);
      // um quadro que não chega em 3 s (celular sem memória, decodificador travado): aquele fundo passa a tocar normalmente
      const comLimite = (k: number, p: Promise<void>) =>
        Promise.race([p.then(() => true), new Promise<boolean>((r) => setTimeout(() => r(false), 3000))]).then((ok) => {
          if (ok || !fontes[k]) return;
          fontes[k]!.fechar();
          fontes[k] = null;
          vidsDesenho[k] = vids[k];
          todosLidos = false;
        });
      for (let f = 0; f < n; f++) {
        if (!todosLidos && (document.hidden || (f % 15 === 0 && (await telaParada())))) {
          vids.forEach((v) => isVideo(v) && !v.paused && v.pause());
          setPausado(true);
          await esperarTelaVisivel();
          setPausado(false);
          for (const i of tocando) {
            const v = vids[i % Math.max(vids.length, 1)];
            if (v && isVideo(v)) await v.play().catch(() => undefined);
          }
        }
        const t = f / FPS;
        const ativos = [...Array(L.telas.length).keys()].filter((i) => t >= L.inicios[i] - FADE && t <= L.inicios[i] + L.telas[i].dur + FADE);
        // começa a tocar quem entrou e pausa quem saiu
        for (let i = 0; i < L.telas.length; i++) {
          const v = vids[i % Math.max(vids.length, 1)];
          if (!v || !isVideo(v) || fontes[i % Math.max(vids.length, 1)]) continue;
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
          const k = i % Math.max(vids.length, 1);
          const v = vids[k];
          const local = Math.max(0, t - L.inicios[i] + FADE);
          if (fontes[k]) return comLimite(k, fontes[k]!.quadro(local).catch(() => undefined));
          return v && isVideo(v) ? esperar(v, local) : Promise.resolve();
        }));
        if (erroEnc) throw erroEnc;
        if (feed && gctx && sctx && grande) {
          drawFrame(gctx, t, vidsDesenho, foto0.dados, foto0.logo, foto0.contatos, foto0.modelo, foto0.ocasiao, foto0.tema, L, true);
          sctx.drawImage(grande, 0, RECORTE_FEED * 1.5, 1080, FEED_H, 0, 0, FEED_W, FEED_H);
        } else {
          drawFrame(ctx, t, vidsDesenho, foto0.dados, foto0.logo, foto0.contatos, foto0.modelo, foto0.ocasiao, foto0.tema, L);
        }
        const frame = new VideoFrame(saida || canvas, { timestamp: Math.round((f * 1e6) / FPS), duration: Math.round(1e6 / FPS) });
        enc.encode(frame, { keyFrame: f % 60 === 0 });
        frame.close();
        if (f % 15 === 0) progresso(Math.round((f / n) * 100));
        // espera o codificador sem relógio (setTimeout fica a 1 por segundo com a aba escondida)
        if (enc.encodeQueueSize > 10)
          await new Promise<void>((r) => {
            const h = () => {
              enc.removeEventListener("dequeue", h);
              r();
            };
            enc.addEventListener("dequeue", h);
          });
      }
      fontes.forEach((q) => q?.fechar());
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

  const [infoAberta, setInfoAberta] = useState(false);
  const [maisOpcoes, setMaisOpcoes] = useState(false);

  const campo = "w-full rounded-xl border border-white/10 bg-white/[0.05] px-3 py-2.5 text-[16px] text-white outline-none focus:border-[#F5F906]/60";
  const rotulo = "mb-1 block text-[12px] font-semibold text-white/55";
  const set = <K extends keyof Dados>(k: K, v: Dados[K]) => setDados((d) => ({ ...d, [k]: v }));
  const abas: { id: Entrada; nome: string }[] = [
    { id: "montar", nome: "✨ Montar" },
    { id: "pacote", nome: "📦 Pacotes" },
    { id: "audio", nome: "🎙️ Áudio" },
    { id: "texto", nome: "✍️ Texto" },
    { id: "foto", nome: "📷 Foto" },
  ];
  const barraVisivel = entrada !== "montar" || resultados.length > 0 || gravando;
  const nomeOcasiaoCurto = () => OCASIOES.find((o) => o.id === ocasiao)?.nome.replace(/^\S+\s/, "") || "Nenhuma";
  const chip = (on: boolean) =>
    `min-h-9 rounded-full border px-3 text-[13px] font-semibold transition-all active:scale-95 disabled:opacity-50 ${on ? "border-[#F5F906] bg-[#F5F906] text-black" : "border-white/15 text-white/75"}`;
  const visualRapido = (
    <div className="flex flex-col gap-3">
      <div>
        <p className="mb-1.5 text-[12px] font-semibold text-white/55">Cores</p>
        <div className="flex flex-wrap gap-2">
          {PALETAS.map((p) => {
            const c1 = p.id === "marca" ? fabrica.primaryColor : p.id === "livre" ? corLivre.c1 : p.c1;
            const c2 = p.id === "marca" ? fabrica.secondaryColor : p.id === "livre" ? corLivre.c2 : p.c2;
            return (
              <button key={p.id} disabled={gravando} onClick={() => setPaleta(p.id)} className={`${chip(paleta === p.id)} flex items-center gap-1.5`}>
                {c1 && (
                  <span className="flex">
                    <span className="h-4 w-4 rounded-full ring-2 ring-[#141416]" style={{ background: c1 }} />
                    {c2 && <span className="-ml-1.5 h-4 w-4 rounded-full ring-2 ring-[#141416]" style={{ background: c2 }} />}
                  </span>
                )}
                {p.nome}
              </button>
            );
          })}
        </div>
        {paleta === "livre" && (
          <div className="mt-2 flex items-center gap-4 text-[13px]">
            <label className="flex items-center gap-2">Cor 1 <input type="color" value={corLivre.c1} onChange={(e) => setCorLivre((c) => ({ ...c, c1: e.target.value }))} /></label>
            <label className="flex items-center gap-2">Cor 2 <input type="color" value={corLivre.c2} onChange={(e) => setCorLivre((c) => ({ ...c, c2: e.target.value }))} /></label>
          </div>
        )}
      </div>
      <div>
        <p className="mb-1.5 text-[12px] font-semibold text-white/55">Fonte</p>
        <div className="flex flex-wrap gap-2">
          {FONTES.slice(0, 6).map((fo) => (
            <button key={fo} disabled={gravando} onClick={() => setFonte(fo)} className={chip(fonte === fo)} style={{ fontFamily: `'${fo}', sans-serif` }}>
              {fo}
            </button>
          ))}
          <button disabled={gravando} onClick={() => setFolha("fonte")} className={chip(!FONTES.slice(0, 6).includes(fonte))}>
            {FONTES.slice(0, 6).includes(fonte) ? "Outras…" : fonte}
          </button>
        </div>
      </div>
      <div className="flex flex-wrap gap-4">
        <div>
          <p className="mb-1.5 text-[12px] font-semibold text-white/55">Duração</p>
          <div className="flex gap-2">
            <button disabled={gravando} onClick={() => setCurto(false)} className={chip(!curto)}>22 s</button>
            <button disabled={gravando} onClick={() => setCurto(true)} className={chip(curto)}>12 s</button>
          </div>
        </div>
        <div>
          <p className="mb-1.5 text-[12px] font-semibold text-white/55">Formato</p>
          <div className="flex gap-2">
            <button disabled={gravando} onClick={() => setFormato("stories")} className={chip(formato === "stories")}>Stories</button>
            <button disabled={gravando} onClick={() => setFormato("feed")} className={chip(formato === "feed")}>Feed 4:5</button>
          </div>
        </div>
      </div>
      <button disabled={gravando} onClick={() => setFolha("oferta")} className="flex min-h-11 items-center justify-between rounded-xl border border-white/10 px-3 text-[14px]">
        <span className="text-white/55">Ocasião</span>
        <span className="font-semibold">{nomeOcasiaoCurto()} ›</span>
      </button>
      <p className="text-[12px] text-white/45">O estilo você troca nos cartões em cima da prévia. Depois toque em gerar de novo.</p>
    </div>
  );
  const nomeOcasiao = OCASIOES.find((o) => o.id === ocasiao)?.nome.replace(/^\S+\s/, "") || "Nenhuma";
  const idxModelo = MODELOS.findIndex((m) => m.id === modelo);
  const nomePaleta = PALETAS.find((p) => p.id === paleta)?.nome || "Do estilo";
  const telaCheia = (id: string) => {
    const v = document.getElementById(id) as (HTMLVideoElement & { webkitEnterFullscreen?: () => void }) | null;
    if (!v) return;
    if (v.requestFullscreen) v.requestFullscreen().catch(() => v.webkitEnterFullscreen?.());
    else v.webkitEnterFullscreen?.();
  };
  const botaoIcone = "flex min-h-12 flex-col items-center justify-center gap-1 rounded-xl bg-white/[0.06] text-[11px] font-semibold text-white/80 active:bg-white/[0.12]";

  return (
    <div className={embutido ? "text-white" : "min-h-screen bg-[#0A0A0B] p-4 text-white"}>
      <style>{`@keyframes cvScan { 0% { top: 0% } 50% { top: 97% } 100% { top: 0% } } .cv-scan { animation: cvScan 1.6s ease-in-out infinite; }`}</style>
      {!embutido && <h1 className="mb-3 text-xl font-black">Gerador de vídeo</h1>}
      <div className="mx-auto grid max-w-5xl gap-5 pb-36 lg:grid-cols-[26rem_1fr] lg:pb-4">
        {/* ——— 1. Mande o pacote ——— */}
        <div className="flex min-w-0 flex-col gap-3 lg:col-start-1">
          <NavegadorInternoAviso />
          {!GERA_MP4 && (
            <p id="sem-mp4" className="rounded-2xl border border-amber-400/40 bg-amber-500/10 p-3 text-[13px] leading-5 text-amber-100">
              Este navegador não consegue montar o vídeo. Abra o Canva Viagem no <b>Chrome</b> ou no <b>Safari atualizado</b> (iPhone: iOS 16.4 ou mais novo), ou no computador.
            </p>
          )}
          {resultados.length === 0 && <p className="px-1 text-[13px] text-white/55">Como você quer criar o vídeo? Monte aqui, use um pacote seu, mande um áudio, um texto ou a foto do pacote.</p>}
          <div role="tablist" aria-label="Como mandar o pacote" className="grid grid-cols-5 gap-1 rounded-2xl bg-white/[0.06] p-1">
            {abas.map((a) => (
              <button
                key={a.id}
                id={`aba-${a.id}`}
                role="tab"
                aria-selected={entrada === a.id}
                onClick={() => setEntrada(a.id)}
                className={`flex min-h-12 flex-col items-center justify-center gap-0.5 rounded-xl text-[12px] font-semibold leading-none transition-colors ${entrada === a.id ? "bg-white/[0.14] text-white shadow-sm" : "text-white/60"}`}
              >
                <span aria-hidden className="text-[15px] leading-none">{a.nome.split(" ")[0]}</span>
                {a.nome.split(" ").slice(1).join(" ")}
              </button>
            ))}
          </div>

          <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <div className={entrada === "montar" ? "" : "hidden"} style={{ ["--cv-gruda" as string]: barraVisivel ? "88px" : "12px" }}>
              <MontarPorToque
                ocupado={ocupado}
                ocasioes={sazonais.lista.map((o) => ({ id: o.id, nome: o.nome }))}
                ocasioesDestaque={sazonais.agora.length + 1}
                whatsapp={dados.whatsapp}
                onWhatsapp={(w) => set("whatsapp", w)}
                curto={curto}
                onCurto={setCurto}
                onMeusPacotes={() => setEntrada("pacote")}
                onPrevia={(t) => setDados((d) => (d.destino === t ? d : { ...d, destino: t }))}
                ocasiao={ocasiao}
                onOcasiao={(id) => setOcasiao(id as Ocasiao)}
                onMontar={(texto, buscas) => {
                  enviar({ text: texto, buscas }).then((ok) => {
                    if (ok) gerarTres();
                  });
                }}
              />
            </div>
            {entrada === "pacote" && (
              <div className="flex flex-col gap-2">
                <p className="text-[13px] text-white/55">Toque num pacote para virar vídeo.</p>
                {(pacotes.length ? pacotes : [PACOTE_EXEMPLO]).map((p) => (
                  <button
                    key={p.id}
                    disabled={ocupado}
                    onClick={() => enviar({ text: textoDoPacote(p) })}
                    className="flex min-h-12 items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2.5 text-left disabled:opacity-60"
                  >
                    <span className="min-w-0">
                      <span className="block truncate text-[15px] font-semibold">{p.title}</span>
                      <span className="block text-[12px] text-white/50">{p.id === "exemplo" ? "Exemplo: toque para ver como fica" : [p.price, p.duration].filter(Boolean).join(" · ")}</span>
                    </span>
                    <ChevronRight className="h-4 w-4 shrink-0 text-white/40" />
                  </button>
                ))}
                {!pacotes.length && <p className="text-[12px] text-white/40">Você ainda não tem pacote salvo. Este é um exemplo.</p>}
              </div>
            )}

            {entrada === "audio" && (
              <div className="flex flex-col gap-3">
                {logado ? <Gravador onAudio={onAudio} ocupado={ocupado} /> : <Microfone onTexto={(t) => { setFrase(t); enviar({ text: t }); }} onAviso={setAviso} />}
                <p className="text-[13px] text-white/55">
                  Fale como se fosse para um cliente. <span className="text-white/80">"Sou a Sol Viagens. Vendo Gramado, 5 dias, por 1.990 reais, com hotel e café. Meu WhatsApp é 82 99999-9999."</span>
                </p>
              </div>
            )}

            {entrada === "texto" && (
              <div className="flex flex-col gap-3">
                <textarea
                  id="frase"
                  className={campo}
                  rows={4}
                  placeholder="Cole o pacote como você manda no WhatsApp: destino, preço, o que inclui."
                  value={frase}
                  onChange={(e) => setFrase(e.target.value)}
                />
                <button id="enviar" disabled={ocupado} className="min-h-12 rounded-xl text-[15px] font-bold text-black disabled:opacity-60" style={{ background: "#F5F906" }} onClick={() => enviar({ text: frase })}>
                  {ocupado ? "Aguarde…" : "Enviar"}
                </button>
              </div>
            )}

            {entrada === "foto" && (
              <div className="flex flex-col gap-3">
                {!foto ? (
                  <label className="flex min-h-36 cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-white/20 bg-white/[0.02] p-5 text-center">
                    <ImageIcon className="h-7 w-7 text-[#F5F906]" />
                    <span className="text-[15px] font-semibold">Escolher foto ou print do pacote</span>
                    <span className="text-[12px] text-white/50">Flyer da operadora, post ou print do WhatsApp.</span>
                    <input id="foto" type="file" accept="image/*" className="hidden" onChange={(e) => onFoto(e.target.files?.[0])} />
                  </label>
                ) : (
                  <div className="flex flex-col gap-3">
                    <div className="relative mx-auto overflow-hidden rounded-xl">
                      <img src={foto} alt="Foto do pacote" className="max-h-56 rounded-xl" />
                      {(fotoEtapa === "lendo" || fotoEtapa === "buscando") && (
                        <>
                          <div className="absolute inset-0 bg-black/40" />
                          <div className="cv-scan absolute inset-x-0 h-1.5 bg-gradient-to-r from-transparent via-[#F5F906] to-transparent shadow-[0_0_24px_6px_rgba(245,249,6,.6)]" />
                        </>
                      )}
                      {fotoEtapa === "pronta" && <div className="absolute right-2 top-2 rounded-full px-3 py-1 text-[12px] font-bold text-black" style={{ background: "#F5F906" }}>Lida</div>}
                    </div>
                    {fotoEtapa === "recebida" && (
                      <p id="foto-recebida" className="flex items-center gap-2 text-[14px] font-semibold">
                        <span className="grid h-6 w-6 place-items-center rounded-full text-black" style={{ background: "#F5F906" }}><Check className="h-3.5 w-3.5" /></span>
                        Foto recebida. Agora é só enviar.
                      </p>
                    )}
                    {(fotoEtapa === "lendo" || fotoEtapa === "buscando" || fotoEtapa === "pronta") && (
                      <ol id="foto-passos" className="flex flex-col gap-1.5 text-[13px]">
                        {[
                          { nome: "Foto recebida", feito: true },
                          { nome: "Lendo destino, preço e inclusos", feito: fotoEtapa !== "lendo", agora: fotoEtapa === "lendo" },
                          { nome: "Buscando vídeos do destino", feito: fotoEtapa === "pronta", agora: fotoEtapa === "buscando" },
                        ].map((p) => (
                          <li key={p.nome} className={`flex items-center gap-2 ${p.feito ? "text-white" : p.agora ? "text-[#F5F906]" : "text-white/40"}`}>
                            {p.feito ? (
                              <span className="grid h-5 w-5 place-items-center rounded-full text-black" style={{ background: "#F5F906" }}><Check className="h-3 w-3" /></span>
                            ) : p.agora ? (
                              <span className="h-5 w-5 animate-spin rounded-full border-2 border-[#F5F906] border-t-transparent" />
                            ) : (
                              <span className="h-5 w-5 rounded-full border-2 border-white/20" />
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
                          className={`min-h-12 flex-1 rounded-xl text-[15px] font-bold disabled:opacity-60 ${fotoEtapa === "pronta" ? "bg-white/[0.08] text-white" : "text-black"}`}
                          style={fotoEtapa === "pronta" ? undefined : { background: "#F5F906" }}
                        >
                          {fotoEtapa === "pronta" ? "Ler de novo" : "Enviar foto"}
                        </button>
                        <label className="grid min-h-12 cursor-pointer place-items-center rounded-xl border border-white/15 px-4 text-[14px] font-semibold">
                          Trocar
                          <input type="file" accept="image/*" className="hidden" onChange={(e) => onFoto(e.target.files?.[0])} />
                        </label>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </section>

          {etapa && <p id="etapa" className="text-[13px] font-semibold text-[#F5F906]">{etapa}</p>}
          {aviso && <p id="aviso" className="rounded-xl border border-red-400/30 bg-red-500/10 p-3 text-[13px] text-red-200">{aviso}</p>}
          {fontes && (
            <p id="fontes" className="text-[12px] text-white/40">
              Fundo: {fontes.videos} vídeo{fontes.videos === 1 ? "" : "s"}{fontes.fotos ? ` e ${fontes.fotos} foto${fontes.fotos === 1 ? "" : "s"}` : ""} do destino
            </p>
          )}
        </div>

        {/* ——— Prévia ——— */}
        <div id="previa" className="min-w-0 lg:sticky lg:top-4 lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:self-start">
          {/* destino e estilos em cima da prévia: toque num estilo e veja na hora */}
          <p className="mb-2 truncate text-center text-[13px] text-white/55">
            Prévia{dados.destino ? <> · <b className="text-white">{dados.destino}</b></> : null}
          </p>
          <p className="mb-2 text-center text-[12px] font-bold uppercase tracking-wider text-white/45">Escolha o visual do vídeo</p>
          <div ref={estilosRef} role="radiogroup" aria-label="Estilo do vídeo" className="-mx-1 mb-1 flex snap-x gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden [mask-image:linear-gradient(to_right,black_85%,transparent)] lg:mb-3 lg:flex-wrap lg:justify-center lg:overflow-visible lg:[mask-image:none]">
            {MODELOS_NA_ORDEM.map((m) => {
              const ativo = modelo === m.id;
              return (
                <button
                  key={m.id}
                  role="radio"
                  aria-checked={ativo}
                  aria-label={m.nome}
                  title={m.desc}
                  disabled={gravando}
                  onClick={() => {
                    setModelo(m.id);
                    proximoRef.current = Math.max(0, ORDEM_SUGERIDA.indexOf(m.id));
                  }}
                  className="group flex w-[68px] shrink-0 snap-start flex-col items-center gap-1 transition-transform duration-200 active:scale-95 disabled:opacity-50 lg:w-[60px]"
                >
                  <span className={`block aspect-[9/16] w-full overflow-hidden rounded-lg border-2 transition-all ${ativo ? "border-[#F5F906] shadow-[0_4px_18px_-6px_rgba(245,249,6,.8)]" : "border-white/10 opacity-80 group-hover:opacity-100"}`}>
                    {miniaturas[m.id] ? <img src={miniaturas[m.id]} alt="" className="h-full w-full object-cover" /> : <span className="block h-full w-full animate-pulse bg-white/[0.06]" />}
                  </span>
                  <span className={`w-full truncate text-center text-[11px] font-bold leading-tight ${ativo ? "text-[#F5F906]" : "text-white/70"}`}>{m.nome}</span>
                </button>
              );
            })}
          </div>
          <p className="mb-3 text-center text-[11px] text-white/40 lg:hidden">Arraste para o lado e veja os {MODELOS_NA_ORDEM.length} visuais →</p>
          <div className="relative mx-auto w-full max-w-[190px] sm:max-w-[260px] lg:max-w-[min(300px,calc((100vh-330px)*0.5625))]">
            <canvas ref={canvasRef} width={W} height={H} className="block w-full rounded-2xl border border-white/10" />
            <span key={modelo} className="pointer-events-none absolute left-2 top-2 rounded-full bg-black/70 px-2.5 py-1 text-[11px] font-bold text-white animate-in fade-in slide-in-from-top-1 duration-300">
              {MODELOS.find((m) => m.id === modelo)?.nome}
            </span>
          </div>
          <p className="mt-1.5 text-center text-[11px] text-white/40">Prévia ao vivo</p>
        </div>

        {/* ——— 2. Visual ——— */}
        <div className="flex min-w-0 flex-col gap-5 lg:col-start-1">
          {resultados.length > 0 && (
          <section>
            <p className="mb-2 px-1 text-[12px] font-bold uppercase tracking-wide text-white/45">Ajustar o visual</p>
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">{visualRapido}</div>
            <div className="hidden">
              <LinhaLista id="linha-oferta" titulo="Oferta sazonal" valor={ocasiao === "nenhuma" && sazonais.agora.length ? "Nenhuma · sugestão do mês na lista" : nomeOcasiao} destaque={sazonais.agora.some((a) => a.id === ocasiao)} onClick={() => setFolha("oferta")} />
              <LinhaLista id="linha-mais" titulo="Mais opções" valor={maisOpcoes ? "" : "cores, fonte, duração e formato"} aberto={maisOpcoes} onClick={() => setMaisOpcoes((v) => !v)} />
              {maisOpcoes && <LinhaLista id="linha-cores" titulo="Cores" valor={nomePaleta} onClick={() => setFolha("cores")} />}
              {maisOpcoes && <LinhaLista id="linha-fonte" titulo="Fonte" valor={fonte} onClick={() => setFolha("fonte")} />}
              {maisOpcoes && <LinhaLista id="linha-duracao" titulo="Duração" valor={curto ? "12 s · curto" : "22 s · completo"} onClick={() => setFolha("duracao")} />}
              {maisOpcoes && <LinhaLista id="linha-formato" titulo="Formato" valor={formato === "feed" ? "Feed 4:5" : "Stories 9:16"} onClick={() => setFolha("formato")} />}
            </div>
          </section>
          )}

          <section className={entrada === "montar" && resultados.length === 0 ? "hidden" : ""}>
            <p className="mb-2 px-1 text-[12px] font-bold uppercase tracking-wide text-white/45">Informações</p>
            <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]">
              <LinhaLista id="linha-info" titulo="Destino, preço e contatos" valor={ehPacote(dados) ? dados.destino : `${infoTipo(dados).curto} · ${dados.destino}`} aberto={infoAberta} onClick={() => setInfoAberta((v) => !v)} />
              {infoAberta && (
                <div className="flex flex-col gap-3 border-t border-white/10 p-4">
                  <div>
                    <label className={rotulo}>Tipo de oferta</label>
                    <select id="campo-tipo" className={campo} value={dados.tipo} onChange={(e) => set("tipo", e.target.value as TipoOferta)}>
                      {TIPOS.map((t) => (
                        <option key={t.id} value={t.id}>{t.nome}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={rotulo}>Destino</label>
                    <input id="campo-destino" className={campo} value={dados.destino} onChange={(e) => set("destino", e.target.value)} />
                  </div>
                  <div>
                    <label className={rotulo}>Frase de abertura</label>
                    <input id="campo-chamada" className={campo} value={dados.chamada} onChange={(e) => set("chamada", e.target.value)} />
                  </div>
                  <div>
                    <label className={rotulo}>Pagamento</label>
                    <select id="campo-pagamento" className={campo} value={dados.pagamento} onChange={(e) => set("pagamento", e.target.value as Pagamento)}>
                      <option value="installments">Parcelado (ex.: 10x de R$ 349)</option>
                      <option value="cash">À vista / a partir de</option>
                      <option value="down_plus">Entrada + parcelas</option>
                      <option value="free_quote">Sem preço (consulte)</option>
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
                      <div className={dados.pagamento === "cash" ? "col-span-3" : dados.pagamento === "installments" ? "col-span-2" : ""}>
                        <label className={rotulo}>{dados.pagamento === "cash" ? "Preço" : "Valor da parcela"}</label>
                        <input id="campo-preco" className={campo} value={dados.preco} onChange={(e) => set("preco", e.target.value)} />
                      </div>
                    )}
                  </div>
                  {dados.pagamento !== "free_quote" && (
                    <div>
                      <label className={rotulo}>Preço antigo, riscado (opcional)</label>
                      <input id="campo-precoAntigo" className={campo} placeholder="Ex.: R$ 4.990" value={dados.precoAntigo} onChange={(e) => set("precoAntigo", e.target.value)} />
                    </div>
                  )}
                  <div>
                    <label className={rotulo}>Para quem</label>
                    <input id="campo-pessoas" className={campo} value={dados.pessoas} onChange={(e) => set("pessoas", e.target.value)} />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className={rotulo}>Saída de (cidade)</label>
                      <input id="campo-saida" className={campo} placeholder="Ex.: Fortaleza" value={dados.saida} onChange={(e) => set("saida", e.target.value)} />
                    </div>
                    <div>
                      <label className={rotulo}>Data da viagem</label>
                      <input id="campo-datas" className={campo} placeholder="Ex.: 12 a 17/12" value={dados.datas} onChange={(e) => set("datas", e.target.value)} />
                    </div>
                  </div>
                  <div>
                    <label className={rotulo}>Urgência (opcional, só se for verdade)</label>
                    <input id="campo-urgencia" className={campo} placeholder="Ex.: Últimas vagas · Até 20/11" value={dados.urgencia} onChange={(e) => set("urgencia", e.target.value)} />
                  </div>
                  <div>
                    <label className={rotulo}>O que está incluso (um por linha, até 4)</label>
                    <textarea id="campo-itens" className={campo} rows={4} value={dados.itens.join("\n")} onChange={(e) => set("itens", e.target.value.split("\n"))} />
                  </div>
                  <div>
                    <label className={rotulo}>Agência</label>
                    <input id="campo-agencia" className={campo} value={dados.agencia} onChange={(e) => set("agencia", e.target.value)} />
                  </div>
                  <p className={rotulo}>Contatos no final do vídeo</p>
                  {CONTATOS.map((c) => {
                    const on = contatos.includes(c.id);
                    return (
                      <div key={c.id} className="flex items-center gap-2">
                        <input
                          id={`usar-${c.id}`}
                          type="checkbox"
                          checked={on}
                          onChange={() => setContatos((l) => (on ? l.filter((x) => x !== c.id) : [...l, c.id]))}
                          className="h-5 w-5 accent-[#F5F906]"
                        />
                        <span className="w-20 text-[13px]">{c.nome}</span>
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
                    <input type="file" accept="image/*" className="text-[13px]" onChange={(e) => onLogo(e.target.files?.[0])} />
                  </div>
                </div>
              )}
            </div>
          </section>

          <p id="status" className={`text-[13px] text-white/60 ${status === "Pronto" || !status ? "hidden" : ""}`}>{status}</p>
          {restantes !== null && (
            <p id="restantes" className="-mt-3 text-[12px] text-white/40">
              {restantes > 0 ? `Você ainda pode montar ${restantes} pacote${restantes === 1 ? "" : "s"} em vídeo hoje.` : "Você usou os vídeos de hoje. Amanhã libera de novo."}
            </p>
          )}

          {/* ——— Seus vídeos ——— */}
          {resultados.length > 0 && (
            <section id="resultados" className="order-first" style={{ scrollMarginTop: 80 }}>
              <p className="mb-2 px-1 text-[12px] font-bold uppercase tracking-wide text-white/45">Seus vídeos</p>
              <div className="flex flex-col gap-4">
                {resultados.map((r, i) => (
                  <article key={r.url} className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
                    <video id={`video-${i}`} src={r.url} controls playsInline muted loop className="mx-auto aspect-[9/16] w-full max-w-[250px] rounded-xl bg-black" />
                    <p className="mt-2 text-center text-[13px] font-semibold text-white/80">
                      Vídeo {i + 1} · {MODELOS.find((m) => m.id === r.modelo)?.nome}
                      {resultados.length > 1 && <span className="font-normal text-white/50"> · {ROTEIROS.find((x) => x.id === r.roteiro)?.nome}</span>}
                      {r.formato === "feed" && <span className="font-normal text-white/50"> · Feed 4:5</span>}
                    </p>
                    <div className="mt-2 grid grid-cols-4 gap-2">
                      <button onClick={() => compartilhar(r)} className={botaoIcone} aria-label="Enviar">
                        <Share className="h-5 w-5 text-[#F5F906]" /> Enviar
                      </button>
                      <a id="baixar" href={r.url} download={r.nome} className={botaoIcone} aria-label="Baixar">
                        <Download className="h-5 w-5" /> Baixar
                      </a>
                      <button onClick={() => { setModelo(r.modelo); setUrl(r.url); setEditando(true); setTimeout(() => document.getElementById("editor")?.scrollIntoView({ behavior: "smooth", block: "start" }), 80); }} className={botaoIcone} aria-label="Editar">
                        <Pencil className="h-5 w-5" /> Editar
                      </button>
                      <button onClick={() => telaCheia(`video-${i}`)} className={botaoIcone} aria-label="Tela cheia">
                        <Maximize2 className="h-5 w-5" /> Tela cheia
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          )}

          {resultados.length > 0 && (
            <section id="legenda" className="order-first rounded-2xl border border-white/10 bg-white/[0.03] p-3">
              <div className="flex items-center justify-between gap-2">
                <p className="text-[12px] font-bold uppercase tracking-wide text-white/45">Legenda pronta para o post</p>
                <button id="copiar-legenda" type="button" onClick={copiarLegenda} className="min-h-10 rounded-xl px-3 text-[13px] font-bold text-black" style={{ background: "#F5F906" }}>
                  {legendaCopiada ? "Copiada!" : "Copiar"}
                </button>
              </div>
              <pre className="mt-2 whitespace-pre-wrap font-sans text-[13px] leading-5 text-white/80">{legenda}</pre>
            </section>
          )}

          {(resultados.length > 0 || mostrarOqueFazer) && (
            <OQueFazerAgora momento="video" feito={marcada("postar_video")} onConfirmar={() => { marcar("postar_video"); setMostrarOqueFazer(false); }} />
          )}

          {editando && (
            <section id="editor" className="flex flex-col gap-2 rounded-2xl border border-white/10 bg-white/[0.03] p-3">
              <div className="flex items-center justify-between">
                <h2 className="text-[15px] font-bold">Editar vídeo</h2>
                <button className="min-h-10 px-2 text-[14px] font-semibold text-[#F5F906]" onClick={() => { setEditando(false); setTelaAberta(null); }}>Pronto</button>
              </div>
              <div className="rounded-xl border border-white/10 p-3">{visualRapido}</div>
              <p className="text-[12px] text-white/50">Troque o fundo de uma tela ou mude o texto. Depois gere de novo.</p>
              {linhaPrevia.telas.map((tela, i) => {
                const m = fundos[i % Math.max(fundos.length, 1)];
                const nDest = linhaPrevia.telas.slice(0, i).filter((x) => x.tipo === "destaque").length;
                return (
                  <div key={i} className="rounded-xl border border-white/10 p-2">
                    <div className="flex items-center gap-2">
                      <div className="h-20 w-12 shrink-0 overflow-hidden rounded-lg bg-white/[0.06]">
                        {m?.thumb ? <img src={m.thumb} alt="" className="h-full w-full object-cover" /> : m?.tipo === "foto" ? <img src={m.url} alt="" className="h-full w-full object-cover" /> : m ? <video src={m.url} muted className="h-full w-full object-cover" /> : null}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-[13px] font-semibold">{i + 1}. {tela.nome} <span className="text-[11px] text-white/40">({tela.dur}s)</span></p>
                        {tela.tipo === "abertura" && <input className={campo + " mt-1"} value={dados.chamada} onChange={(e) => set("chamada", e.target.value)} />}
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
                        {tela.tipo === "preco" && <input className={campo + " mt-1"} value={dados.preco} onChange={(e) => set("preco", e.target.value)} />}
                        {tela.tipo === "inclusos" && <p className="text-[11px] text-white/40">Os itens ficam em Informações.</p>}
                        {tela.tipo === "contato" && <p className="text-[11px] text-white/40">Os contatos ficam em Informações.</p>}
                      </div>
                      <button id={`trocar-${i}`} onClick={() => setTelaAberta(telaAberta === i ? null : i)} className="min-h-10 rounded-lg bg-white/[0.08] px-3 text-[12px] font-bold">
                        Trocar fundo
                      </button>
                    </div>
                    {telaAberta === i && (
                      <div className="mt-2 flex flex-col gap-2">
                        <div className="flex gap-2">
                          <input className={campo} placeholder={`Buscar vídeo (ex.: ${dados.destino} praia)`} value={busca} onChange={(e) => setBusca(e.target.value)} onKeyDown={(e) => e.key === "Enter" && buscarNoPexels()} />
                          <button onClick={buscarNoPexels} disabled={buscando} className="min-h-11 rounded-xl bg-white/[0.08] px-3 text-[13px] font-semibold">{buscando ? "…" : "Buscar"}</button>
                        </div>
                        <div className="grid grid-cols-4 gap-1">
                          {pool.map((p) => (
                            <button key={p.url} onClick={() => trocarFundo(i, p)} className="relative h-24 overflow-hidden rounded-lg border border-white/10">
                              <img src={p.thumb || p.url} alt="" className="h-full w-full object-cover" />
                              {p.tipo === "video" && <span className="absolute bottom-0.5 right-0.5 rounded bg-black/70 px-1 text-[10px]">▶</span>}
                            </button>
                          ))}
                        </div>
                        <label className="grid min-h-11 cursor-pointer place-items-center rounded-xl border border-dashed border-white/20 text-[13px]">
                          Usar um vídeo ou foto meu
                          <input type="file" accept="video/*,image/*" className="hidden" onChange={(e) => usarArquivoProprio(i, e.target.files?.[0])} />
                        </label>
                      </div>
                    )}
                  </div>
                );
              })}
            </section>
          )}
        </div>
      </div>

      {/* ——— Barra de ação (fixa no celular) ———
          No "Montar" o quiz tem o próprio botão: a barra só aparece depois de gerar (para refazer). */}
      <div className={`${barraVisivel ? "" : "hidden"} fixed inset-x-0 bottom-0 z-20 border-t border-white/10 bg-[#0A0A0B]/95 px-3 pt-2.5 pb-[max(10px,env(safe-area-inset-bottom))] backdrop-blur lg:static lg:mt-4 lg:border-0 lg:bg-transparent lg:p-0`}>
        {gravando && (
          <p id="aviso-gerando" role="status" className={`mx-auto mb-2 max-w-md text-center text-[12px] font-semibold ${pausado ? "text-[#F5F906]" : "text-white/60"}`}>
            {pausado ? "Pausado. Volte para esta tela e o vídeo continua de onde parou." : "Deixe esta tela aberta até terminar."}
          </p>
        )}
        <div className="mx-auto grid max-w-md grid-cols-[1fr_1.5fr] gap-2">
          <button id="gerar" disabled={carregando || gravando || ocupado || !GERA_MP4} className="min-h-12 rounded-2xl bg-white/[0.08] text-[15px] font-bold text-white disabled:opacity-50" onClick={gerar}>
            1 vídeo
          </button>
          <button id="gerar3" disabled={carregando || gravando || ocupado || !GERA_MP4} className="min-h-12 rounded-2xl text-[15px] font-black text-black disabled:opacity-60" style={{ background: "#F5F906" }} onClick={gerarTres}>
            {gravando ? (pausado ? "Pausado" : status) : "3 vídeos diferentes"}
          </button>
        </div>
      </div>

      {/* ——— Folhas de escolha ——— */}
      <Folha aberta={folha === "oferta"} titulo="Oferta sazonal" onFechar={() => setFolha(null)}>
        {sazonais.lista.map((o) => (
          <button key={o.id} id={`ocasiao-${o.id}`} disabled={gravando} onClick={() => { setOcasiao(o.id); setFolha(null); }} className="flex min-h-12 w-full items-center justify-between px-4 text-left text-[15px]">
            <span>
              {o.nome}
              {sazonais.agora.some((a) => a.id === o.id) && <span className="ml-2 rounded-full px-2 py-0.5 text-[10px] font-black text-black" style={{ background: "#F5F906" }}>AGORA</span>}
            </span>
            {ocasiao === o.id && <Check className="h-5 w-5 text-[#F5F906]" />}
          </button>
        ))}
      </Folha>
      <Folha aberta={folha === "estilo"} titulo="Estilo do vídeo" onFechar={() => setFolha(null)}>
        <div className="grid grid-cols-3 gap-2 p-3">
          {MODELOS_NA_ORDEM.map((m) => (
            <button key={m.id} id={`modelo-${m.id}`} disabled={gravando} onClick={() => { setModelo(m.id); proximoRef.current = Math.max(0, ORDEM_SUGERIDA.indexOf(m.id)); setFolha(null); }} className={`overflow-hidden rounded-xl border text-center ${modelo === m.id ? "border-[#F5F906] ring-2 ring-[#F5F906]/40" : "border-white/10"}`}>
              {miniaturas[m.id] ? <img src={miniaturas[m.id]} alt={m.nome} className="aspect-[9/16] w-full object-cover" /> : <div className="aspect-[9/16] w-full bg-white/[0.06]" />}
              <span className="block py-1.5 text-[12px] font-semibold">{m.nome}</span>
            </button>
          ))}
        </div>
      </Folha>
      <Folha aberta={folha === "cores"} titulo="Cores" onFechar={() => setFolha(null)}>
        {PALETAS.map((p) => {
          const c1 = p.id === "marca" ? fabrica.primaryColor : p.id === "livre" ? corLivre.c1 : p.c1;
          const c2 = p.id === "marca" ? fabrica.secondaryColor : p.id === "livre" ? corLivre.c2 : p.c2;
          return (
            <button key={p.id} id={`paleta-${p.id}`} disabled={gravando} onClick={() => { setPaleta(p.id); if (p.id !== "livre") setFolha(null); }} className="flex min-h-12 w-full items-center justify-between px-4 text-left text-[15px]">
              <span className="flex items-center gap-2">
                <span className="flex">
                  {c1 && <span className="h-5 w-5 rounded-full ring-2 ring-[#141416]" style={{ background: c1 }} />}
                  {c2 && <span className="-ml-2 h-5 w-5 rounded-full ring-2 ring-[#141416]" style={{ background: c2 }} />}
                </span>
                {p.nome}
              </span>
              {paleta === p.id && <Check className="h-5 w-5 text-[#F5F906]" />}
            </button>
          );
        })}
        {paleta === "livre" && (
          <div className="flex items-center gap-4 px-4 py-3 text-[14px]">
            <label className="flex items-center gap-2">Cor 1 <input id="cor1" type="color" value={corLivre.c1} onChange={(e) => setCorLivre((c) => ({ ...c, c1: e.target.value }))} /></label>
            <label className="flex items-center gap-2">Cor 2 <input id="cor2" type="color" value={corLivre.c2} onChange={(e) => setCorLivre((c) => ({ ...c, c2: e.target.value }))} /></label>
          </div>
        )}
      </Folha>
      <Folha aberta={folha === "duracao"} titulo="Duração" onFechar={() => setFolha(null)}>
        {[
          { curto: false, nome: "Completo", desc: "22 s · abertura, o que inclui, 2 cenas, preço e contato" },
          { curto: true, nome: "Curto", desc: "12 s · abertura, preço e contato. Bom para status e stories" },
        ].map((o) => (
          <button key={o.nome} id={`duracao-${o.curto ? "curto" : "completo"}`} disabled={gravando} onClick={() => { setCurto(o.curto); setFolha(null); }} className="flex min-h-14 w-full items-center justify-between gap-3 px-4 py-2 text-left">
            <span>
              <span className="block text-[16px] font-semibold">{o.nome}</span>
              <span className="block text-[12px] text-white/50">{o.desc}</span>
            </span>
            {curto === o.curto && <Check className="h-5 w-5 shrink-0 text-[#F5F906]" />}
          </button>
        ))}
      </Folha>
      <Folha aberta={folha === "formato"} titulo="Formato" onFechar={() => setFolha(null)}>
        {[
          { id: "stories" as Formato, nome: "Stories 9:16", desc: "720×1280 · stories, Reels e status do WhatsApp" },
          { id: "feed" as Formato, nome: "Feed 4:5", desc: "1080×1350 · post no feed do Instagram e do Facebook" },
        ].map((o) => (
          <button key={o.id} id={`formato-${o.id}`} disabled={gravando} onClick={() => { setFormato(o.id); setFolha(null); }} className="flex min-h-14 w-full items-center justify-between gap-3 px-4 py-2 text-left">
            <span>
              <span className="block text-[16px] font-semibold">{o.nome}</span>
              <span className="block text-[12px] text-white/50">{o.desc}</span>
            </span>
            {formato === o.id && <Check className="h-5 w-5 shrink-0 text-[#F5F906]" />}
          </button>
        ))}
      </Folha>
      <Folha aberta={folha === "fonte"} titulo="Fonte" onFechar={() => setFolha(null)}>
        {FONTES.map((fo) => (
          <button key={fo} id={`fonte-${fo.replace(/\s/g, "")}`} disabled={gravando} onClick={() => { setFonte(fo); setFolha(null); }} className="flex min-h-12 w-full items-center justify-between px-4 text-left text-[17px]" style={{ fontFamily: `'${fo}', sans-serif` }}>
            <span>{fo}</span>
            {fonte === fo && <Check className="h-5 w-5 text-[#F5F906]" />}
          </button>
        ))}
      </Folha>
    </div>
  );
}

/** Linha de lista agrupada (como nos Ajustes do iPhone): título à esquerda, valor e seta à direita. */
function LinhaLista({ id, titulo, valor, miniatura, destaque, aberto, onClick }: { id?: string; titulo: string; valor: string; miniatura?: string; destaque?: boolean; aberto?: boolean; onClick: () => void }) {
  return (
    <button id={id} type="button" onClick={onClick} className="flex min-h-[52px] w-full items-center gap-3 px-4 py-2 text-left active:bg-white/[0.06]">
      <span className="flex-1 text-[15px] font-semibold text-white">{titulo}</span>
      {miniatura && <img src={miniatura} alt="" className="h-9 w-5 rounded object-cover" />}
      <span className={`max-w-[48%] truncate text-[14px] ${destaque ? "font-semibold text-[#F5F906]" : "text-white/55"}`}>{valor}</span>
      <ChevronRight className={`h-4 w-4 shrink-0 text-white/35 transition-transform ${aberto ? "rotate-90" : ""}`} />
    </button>
  );
}

/** Folha que sobe de baixo, com a lista de opções. Fecha ao tocar fora ou em Pronto. */
function Folha({ aberta, titulo, onFechar, children }: { aberta: boolean; titulo: string; onFechar: () => void; children: React.ReactNode }) {
  useEffect(() => {
    if (!aberta) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onFechar();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [aberta, onFechar]);
  if (!aberta) return null;
  return createPortal(
    <div className="fixed inset-0 z-[60] flex items-end justify-center lg:items-center" role="dialog" aria-modal="true" aria-label={titulo}>
      <button type="button" aria-label="Fechar" onClick={onFechar} className="absolute inset-0 bg-black/60" />
      <div className="relative flex max-h-[78vh] w-full max-w-lg flex-col overflow-hidden rounded-t-3xl border border-white/10 bg-[#141416] text-white shadow-2xl lg:rounded-3xl">
        <div className="flex items-center justify-between px-4 pb-2 pt-3">
          <span className="w-16" />
          <span className="text-[15px] font-bold">{titulo}</span>
          <button type="button" onClick={onFechar} className="min-h-10 w-16 text-right text-[15px] font-bold text-[#F5F906]">Pronto</button>
        </div>
        <div className="mx-auto mb-1 h-1 w-10 rounded-full bg-white/20" />
        <div className="divide-y divide-white/[0.06] overflow-y-auto pb-[max(12px,env(safe-area-inset-bottom))]">{children}</div>
      </div>
    </div>,
    document.body,
  );
}
