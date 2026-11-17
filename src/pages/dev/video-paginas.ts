// Vídeos no editor de artes: cada cena do vídeo pronto vira uma página (story) com o vídeo de fundo
// tocando no lugar da foto e os textos como itens soltos (dá para tocar, mudar, mover e animar cada um).
import { ALTURA_FAIXA, AMARELO_CENA, arteInicial, type AnimItem, type Arte, type CenaVideo, type Marca, type VisualCena } from "./arte-nova";
import { desenharTexto } from "./arte-estilos";
import { carregarImagem, seloRede, type Extra } from "./arte-extras";
import { prontoDe, type VideoPronto } from "./videos-prontos";
import { MUSICAS } from "@/lib/musica-video";
import type { ArtTweakMap } from "@/lib/fabrica-art-tweaks";

export type EstadoPagina = { a: Arte; t: ArtTweakMap; x: Extra[] };

// ——— clipes da casa (public/video-fundos) ———
export const CATEGORIAS_CLIPE: { id: string; nome: string }[] = [
  { id: "praia", nome: "Praia" }, { id: "resort", nome: "Resort" }, { id: "cafe", nome: "Café na piscina" }, { id: "buggy", nome: "Buggy nas dunas" },
  { id: "mergulho", nome: "Mergulho" }, { id: "casal", nome: "Casal no pôr do sol" }, { id: "cachoeira", nome: "Cachoeira" }, { id: "piscina", nome: "Piscina com vista" },
  { id: "barco", nome: "Lancha" }, { id: "aeroporto", nome: "Aeroporto" }, { id: "janela", nome: "Janela do avião" }, { id: "bangalo", nome: "Bangalôs no mar" },
  { id: "veleiro", nome: "Veleiro" }, { id: "balao", nome: "Balão" },
];
export type Clipe = { url: string; capa: string; nome: string; cat: string };
export const CLIPES: Clipe[] = CATEGORIAS_CLIPE.flatMap((c) => [1, 2].map((n) => ({ url: `/video-fundos/${c.id}-${n}.mp4`, capa: `/video-fundos/capas/${c.id}-${n}.jpg`, nome: `${c.nome} ${n}`, cat: c.id })));
/** Capa (imagem parada) de um clipe da casa; vídeo enviado não tem. */
export const capaDoClipe = (url?: string) => {
  const m = url?.match(/\/video-fundos\/([a-z]+-\d)\.mp4$/);
  return m ? `/video-fundos/capas/${m[1]}.jpg` : undefined;
};
export const nomeDoClipe = (url?: string) => CLIPES.find((c) => c.url === url)?.nome;

// ——— textos padrão dos vídeos (os mesmos do gerador) ———
type ItemP = { titulo: string; sub: string; fundo: string };
type ProntoP = {
  titulo: string; destaque: string; subtitulo: string; selo: string; itens: ItemP[]; pilulas: string[];
  gancho: string; ganchoDestaque: string; virada: string; viradaDestaque: string; ofertas: ItemP[]; fecho: string; visual?: VisualCena;
};
function padrao(): ProntoP {
  const black = new Date().getMonth() === 10;
  return {
    titulo: black ? "BLACK" : "SUA PRÓXIMA", destaque: black ? "FRIDAY" : "VIAGEM", subtitulo: black ? "DE VIAGENS" : "COMEÇA AQUI",
    selo: black ? "OFERTAS ESPECIAIS" : "FALE COM A GENTE",
    itens: [
      { titulo: "Destinos", sub: "paradisíacos", fundo: "praia" }, { titulo: "Hospedagens", sub: "incríveis", fundo: "resort" },
      { titulo: "Momentos", sub: "inesquecíveis", fundo: "cafe" }, { titulo: "Passeios", sub: "e aventuras", fundo: "buggy" },
      { titulo: "Experiências", sub: "únicas", fundo: "mergulho" }, { titulo: "Viagens", sub: "a dois", fundo: "casal" },
      { titulo: "Natureza", sub: "de tirar o fôlego", fundo: "cachoeira" },
    ],
    pilulas: ["PACOTES", "HOTÉIS", "PASSEIOS"], gancho: "", ganchoDestaque: "",
    virada: "Chegou a hora", viradaDestaque: "de tirar do papel",
    ofertas: [
      { titulo: "Hotéis", sub: "aquele hotel dos sonhos", fundo: "resort" }, { titulo: "Destinos", sub: "aquele destino paradisíaco", fundo: "bangalo" },
      { titulo: "A dois", sub: "a viagem que vocês merecem", fundo: "casal" },
    ],
    fecho: black ? "Sua viagem na Black Friday" : "Sua próxima viagem começa aqui",
  };
}

type Parte = "intro" | "item" | "oferta" | "gancho" | "virada" | "etiqueta" | "resumo" | "escolha" | "fecho";
type CenaDef = { parte: Parte; dur: number; cats: string[]; n?: number };
function cenasDo(modelo: "lista" | "pergunta", p: ProntoP): CenaDef[] {
  if (modelo === "lista") {
    const itens = p.itens.filter((i) => i.titulo.trim()).slice(0, 7);
    return [
      { parte: "intro", dur: 3, cats: ["balao", "janela", "praia"] },
      ...itens.map((it, n) => ({ parte: "item" as const, dur: 2.6, cats: [it.fundo], n })),
      { parte: "oferta", dur: 3.4, cats: ["piscina", "bangalo", "resort"] },
      { parte: "fecho", dur: 3.8, cats: ["barco", "veleiro", "praia"] },
    ];
  }
  const ofertas = p.ofertas.filter((i) => i.titulo.trim()).slice(0, 4);
  return [
    { parte: "gancho", dur: 3.2, cats: ["aeroporto"] },
    { parte: "virada", dur: 2.8, cats: ["barco", "mergulho", "praia"] },
    { parte: "intro", dur: 2.8, cats: ["janela", "balao", "piscina"] },
    ...ofertas.map((it, n) => ({ parte: "etiqueta" as const, dur: 3, cats: [it.fundo], n })),
    { parte: "resumo", dur: 3, cats: ["praia", "bangalo", "barco"] },
    { parte: "escolha", dur: 2.8, cats: ["cachoeira", "buggy", "piscina"] },
    { parte: "fecho", dur: 3.8, cats: ["veleiro", "barco", "praia"] },
  ];
}
// o clipe de cada cena: um da categoria, sem repetir no mesmo vídeo
function clipesDas(cenas: CenaDef[]): string[] {
  const usados = new Set<string>();
  return cenas.map((c, i) => {
    const cats = c.cats.length ? c.cats : ["praia"];
    let cat = cats[0];
    let n = (i % 2) + 1;
    for (let k = 0; k < cats.length * 2 && usados.has(`${cat}-${n}`); k++) {
      n = (n % 2) + 1;
      if (k % 2 === 1) cat = cats[(cats.indexOf(cat) + 1) % cats.length];
    }
    usados.add(`${cat}-${n}`);
    return `/video-fundos/${cat}-${n}.mp4`;
  });
}

// quebra uma frase em até 3 linhas de ~16 letras (caixa alta)
function quebrar(frase: string, max = 16): string {
  const palavras = frase.trim().toUpperCase().split(/\s+/).filter(Boolean);
  const linhas: string[] = [];
  for (const p of palavras) {
    const ult = linhas[linhas.length - 1];
    if (ult && (ult + " " + p).length <= max) linhas[linhas.length - 1] = ult + " " + p;
    else linhas.push(p);
  }
  // mesmo número de linhas, mas com tamanhos parecidos (nada de uma palavra sozinha embaixo)
  const n = Math.min(3, linhas.length);
  if (n > 1 && palavras.length <= 14) {
    let melhor: string[] | null = null, pior = Infinity;
    const tenta = (ini: number, resto: number, acc: string[]) => {
      if (resto === 1) {
        const l = [...acc, palavras.slice(ini).join(" ")];
        const m = Math.max(...l.map((x) => x.length));
        if (m < pior) { pior = m; melhor = l; }
        return;
      }
      for (let k = ini + 1; k <= palavras.length - resto + 1; k++) tenta(k, resto - 1, [...acc, palavras.slice(ini, k).join(" ")]);
    };
    tenta(0, n, []);
    if (melhor && pior <= Math.max(max, ...linhas.slice(0, n).map((x) => x.length))) return (melhor as string[]).join("\n");
  }
  return linhas.slice(0, 3).join("\n");
}

/** Número do WhatsApp do jeito que se lê: (11) 91234-5678 no Brasil, +código no resto. */
function zapLegivel(numero: string, ddi = "55"): string {
  const d = numero.replace(/\D/g, "");
  if (!d) return "";
  if ((ddi || "55") === "55") {
    const local = d.length > 11 && d.startsWith("55") ? d.slice(2) : d;
    if (local.length === 10 || local.length === 11) return local.length === 11 ? `(${local.slice(0, 2)}) ${local.slice(2, 7)}-${local.slice(7)}` : `(${local.slice(0, 2)}) ${local.slice(2, 6)}-${local.slice(6)}`;
    return numero.trim();
  }
  return `+${ddi} ${d}`;
}

/** Formato da logo no vídeo: placa branca (padrão), redonda, quadrada ou do jeito que veio (sem fundo). */
export type FormatoLogo = "placa" | "redonda" | "quadrada" | "original";
export const FORMATOS_LOGO: { id: FormatoLogo; nome: string }[] = [
  { id: "placa", nome: "Placa" }, { id: "redonda", nome: "Redonda" }, { id: "quadrada", nome: "Quadrada" }, { id: "original", nome: "Sem fundo" },
];
export const ONDE_LOGO: { id: "todas" | "inicio-fim" | "fim" | "nenhuma"; nome: string }[] = [
  { id: "todas", nome: "Em todas as cenas" }, { id: "inicio-fim", nome: "Início e fim" }, { id: "fim", nome: "Só no fim" }, { id: "nenhuma", nome: "Sem logo" },
];

/** Logo sobre uma placa branca: aparece em cima de qualquer vídeo (logo escura no mar sumia). */
async function logoNaPlaca(img: HTMLImageElement, formato: FormatoLogo = "placa"): Promise<string> {
  const nw = Math.max(1, img.naturalWidth), nh = Math.max(1, img.naturalHeight);
  const c = document.createElement("canvas");
  const g = c.getContext("2d")!;
  if (formato === "redonda" || formato === "quadrada") {
    // a logo inteira cabe dentro do círculo (ou do quadrado), sem cortar
    const L = 600;
    c.width = L; c.height = L;
    g.fillStyle = "rgba(255,255,255,0.96)";
    g.beginPath();
    if (formato === "redonda") g.arc(L / 2, L / 2, L / 2, 0, Math.PI * 2); else g.roundRect(0, 0, L, L, 64);
    g.fill();
    const cabe = formato === "redonda" ? L * 0.66 : L * 0.8;
    const k = Math.min(cabe / nw, cabe / nh);
    g.drawImage(img, (L - nw * k) / 2, (L - nh * k) / 2, nw * k, nh * k);
    return c.toDataURL("image/png");
  }
  const lw = 520, lh = Math.round(lw * (nh / nw));
  const alt = Math.min(lh, 300), larg = Math.round(lw * (alt / Math.max(1, lh)));
  if (formato === "original") {
    c.width = larg; c.height = alt;
    g.drawImage(img, 0, 0, larg, alt);
    return c.toDataURL("image/png");
  }
  const pad = 36;
  c.width = larg + pad * 2; c.height = alt + pad * 2;
  g.fillStyle = "rgba(255,255,255,0.94)";
  g.beginPath(); g.roundRect(0, 0, c.width, c.height, Math.min(48, c.height / 2)); g.fill();
  g.drawImage(img, pad, pad, larg, alt);
  return c.toDataURL("image/png");
}

let seq = 0;
const novoId = () => `v${Date.now().toString(36)}${(seq++).toString(36)}`;
const W = 1080, H = 1920;

/** Um item de texto da cena, com a largura proporcional ao tamanho pedido (`esc` = 1 é o tamanho do estilo). */
async function texto(estilo: string, t: string, x: number, y: number, esc = 1, cor?: string, alinhar: "centro" | "esquerda" = "centro"): Promise<Extra | null> {
  if (!t.trim()) return null;
  const d = await desenharTexto(estilo, t, cor);
  const w = Math.round(Math.min(W - 60, d.w * esc));
  return { id: novoId(), tipo: "texto", estilo, texto: t, cor, src: d.src, nw: d.w, w, r: d.r, x: alinhar === "esquerda" ? Math.round(x + w / 2) : x, y: Math.round(y) };
}

/** Os itens de uma cena. `cy` é o centro da área do texto e `k` a escala (menor na faixa). */
async function itensDaCena(c: CenaDef, p: ProntoP, m: Marca, cy: number, k: number, faixa: boolean, gancho: [string, string]): Promise<Extra[]> {
  const L: (Extra | null)[] = [];
  const cx = W / 2;
  const n = c.n || 0;
  if (c.parte === "intro") {
    L.push(await texto("cenaTitulo", p.titulo.trim().toUpperCase(), cx, cy - 150 * k, 0.78 * k));
    L.push(await texto("cenaAmarelo", p.destaque.trim().toUpperCase(), cx, cy - 20 * k, 0.78 * k));
    L.push(await texto("cenaPequeno", p.subtitulo.trim().toUpperCase(), cx, cy + 95 * k, 0.95 * k));
    L.push(await texto("cenaEtiqueta", p.selo.trim().toUpperCase(), cx, cy + 215 * k, 0.62 * k));
  } else if (c.parte === "item") {
    const it = p.itens.filter((i) => i.titulo.trim())[n];
    if (it) {
      const x0 = faixa ? 90 : 70;
      const num = await texto("cenaNumero", String(n + 1).padStart(2, "0"), x0, cy, 0.85 * k, undefined, "esquerda");
      L.push(num);
      const xt = (num ? num.x + num.w / 2 : x0) + 4;
      L.push(await texto("cenaTitulo", it.titulo.trim().toUpperCase(), xt, cy - 32 * k, 0.5 * k, undefined, "esquerda"));
      L.push(await texto("cenaPequeno", it.sub.trim(), xt, cy + 52 * k, 0.95 * k, undefined, "esquerda"));
    }
  } else if (c.parte === "oferta") {
    L.push(await texto("cenaPequeno", "CONDIÇÕES ESPECIAIS EM", cx, cy - 160 * k, 0.95 * k));
    const pils = p.pilulas.filter(Boolean).slice(0, 3).map((x) => x.toUpperCase());
    const desenhos = await Promise.all(pils.map((x) => texto("cenaPilula", x, 0, cy - 50 * k, 0.78 * k)));
    const ok = desenhos.filter((d): d is Extra => !!d);
    const total = ok.reduce((s, d) => s + d.w, 0) + (ok.length - 1) * 8;
    let x = cx - total / 2;
    for (const d of ok) { d.x = Math.round(x + d.w / 2); x += d.w + 8; L.push(d); }
    L.push(await texto("cenaEtiqueta", p.selo.trim().toUpperCase(), cx, cy + 80 * k, 0.95 * k));
    L.push(await texto("cenaPequeno", "PARA A SUA PRÓXIMA VIAGEM", cx, cy + 210 * k, 0.95 * k));
  } else if (c.parte === "gancho" || c.parte === "virada" || c.parte === "resumo" || c.parte === "escolha") {
    const [linha, destaque, sub] =
      c.parte === "gancho" ? [p.gancho.trim() || gancho[0], p.gancho.trim() ? p.ganchoDestaque : gancho[1], ""]
      : c.parte === "virada" ? [p.virada, p.viradaDestaque, ""]
      : c.parte === "resumo" ? [p.pilulas.filter(Boolean).slice(0, 3).join(", ").replace(/, ([^,]*)$/, " e $1"), p.selo || "com condições especiais", "para a sua próxima viagem"]
      : ["É só escolher", "o seu destino", ""];
    const t1 = quebrar(linha);
    const nl = t1 ? t1.split("\n").length : 0;
    L.push(await texto("cenaTitulo", t1, cx, cy - 60 * k - (nl - 1) * 30 * k, 0.57 * k));
    L.push(await texto("cenaEtiqueta", destaque.trim().toUpperCase(), cx, cy + 40 * k + (nl - 1) * 40 * k, 0.95 * k));
    L.push(await texto("cenaPequeno", sub, cx, cy + 160 * k + (nl - 1) * 40 * k, 0.95 * k));
  } else if (c.parte === "etiqueta") {
    const it = p.ofertas.filter((i) => i.titulo.trim())[n];
    if (it) {
      L.push(await texto("cenaEtiqueta", it.titulo.trim().toUpperCase(), cx, cy - 20 * k, 1.75 * k));
      L.push(await texto("cenaFaixa", it.sub.trim(), cx, cy + 150 * k, 0.95 * k));
    }
  } else if (c.parte === "fecho") {
    let y = cy - 280 * k;
    if (m.logoBase64) {
      const src = m.logoBase64.startsWith("data:") || m.logoBase64.startsWith("http") ? m.logoBase64 : `data:image/png;base64,${m.logoBase64}`;
      try {
        const img = await carregarImagem(await logoNaPlaca(await carregarImagem(src)));
        const r = img.naturalHeight / Math.max(1, img.naturalWidth);
        const w = Math.round(Math.min(340, 200 / Math.max(0.3, r)) * k);
        L.push({ id: novoId(), tipo: "imagem", src: img.src, base: img.src, nw: img.naturalWidth, w, r, x: cx, y: Math.round(y), logo: true });
      } catch { /* logo com problema: segue sem */ }
    }
    y += 210 * k;
    L.push(await texto("cenaTitulo", quebrar(p.fecho.trim() || "Fale com a gente", 18), cx, y, 0.5 * k));
    const marca = [`${p.titulo} ${p.destaque}`.trim(), p.selo.trim()].filter(Boolean).join(" · ").toUpperCase();
    L.push(await texto("cenaPequeno", marca, cx, y + 140 * k, 0.8 * k, AMARELO_CENA));
    // botão do WhatsApp com o número da agência (sem número de exemplo)
    const zap = zapLegivel(m.whatsapp || "", (m as { whatsappDialCode?: string }).whatsappDialCode);
    const selo = await seloRede("whatsapp", zap ? `Chame no WhatsApp · ${zap}` : "Chame no WhatsApp", "escuro");
    const ws = Math.round(Math.min(W - 160, selo.w * 0.9 * k));
    L.push({ id: novoId(), tipo: "rede", rede: "whatsapp", modelo: "escuro", texto: zap ? `Chame no WhatsApp · ${zap}` : "Chame no WhatsApp", src: selo.src, nw: selo.w, w: ws, r: selo.r, x: cx, y: Math.round(y + 260 * k) });
    const insta = (m.instagram || "").trim();
    if (insta) {
      const s2 = await seloRede("instagram", insta.startsWith("@") ? insta : `@${insta}`, "transparente");
      L.push({ id: novoId(), tipo: "rede", rede: "instagram", modelo: "transparente", texto: insta.startsWith("@") ? insta : `@${insta}`, src: s2.src, nw: s2.w, w: Math.round(Math.min(W - 200, s2.w * 0.8 * k)), r: s2.r, x: cx, y: Math.round(y + 380 * k) });
    }
  }
  return L.filter((e): e is Extra => !!e);
}

// centro do texto em cada parte, no visual clássico/azul (o vídeo toma a tela toda)
const CENTRO: Record<Parte, number> = { intro: 720, item: 1360, oferta: 820, gancho: 880, virada: 880, etiqueta: 920, resumo: 880, escolha: 880, fecho: 1240 };

/** Animação padrão dos itens: cada um sobe um pouco depois do anterior. */
function animacoes(x: Extra[]): Record<string, AnimItem> {
  return Object.fromEntries(x.map((e, i) => [e.id, { anim: e.tipo === "rede" ? "aparecer" : i === 0 ? "zoom" : "subir", vel: "normal", atraso: Math.round(i * 2) / 10 } as AnimItem]));
}

/**
 * As páginas (cenas) de um vídeo pronto. Cada uma tem o clipe, o tempo, a transição e os textos como itens.
 * `variacao` troca a frase de abertura do modelo "pergunta".
 */
/** Logo grande da última cena (no lugar de onde fica no fecho). */
export function logoGrande(placa: { src: string; nw: number; r: number }, y: number, id = novoId()): Extra {
  const w = Math.round(Math.min(340, (placa.r > 0.9 ? 260 : 200) / Math.max(0.3, placa.r)));
  return { id, tipo: "imagem", src: placa.src, base: placa.src, nw: placa.nw, w, r: placa.r, x: W / 2, y: Math.round(y), logo: true };
}

/** A logo na placa branca, pronta para entrar numa cena (null se a imagem não abrir). */
export async function placaDaLogo(logo: string, formato: FormatoLogo = "placa"): Promise<{ src: string; nw: number; r: number } | null> {
  try {
    const src = logo.startsWith("data:") || logo.startsWith("http") || logo.startsWith("blob:") ? logo : `data:image/png;base64,${logo}`;
    const img = await carregarImagem(await logoNaPlaca(await carregarImagem(src), formato));
    return { src: img.src, nw: img.naturalWidth, r: img.naturalHeight / Math.max(1, img.naturalWidth) };
  } catch { return null; }
}

/** Logo pequena no alto da cena: dentro do recorte 4:5 do feed (285 a 1635) e abaixo do nome do perfil no Reels. */
export function logoPequena(placa: { src: string; nw: number; r: number }, id = novoId()): Extra {
  // redonda e quadrada ficam um pouco maiores (a logo fica dentro, menor)
  const w = Math.round(Math.min(230, (placa.r > 0.9 ? 150 : 96) / Math.max(0.25, placa.r)));
  return { id, tipo: "imagem", src: placa.src, base: placa.src, nw: placa.nw, w, r: placa.r, x: W / 2, y: Math.round(320 + (w * placa.r) / 2), logo: true };
}

export async function paginasDoVideo(v: VideoPronto, m: Marca, variacao = 0): Promise<EstadoPagina[]> {
  const base = padrao();
  const extra = (prontoDe(v) || {}) as Partial<ProntoP> & { itens?: ItemP[]; ofertas?: ItemP[] };
  const p: ProntoP = { ...base, ...extra, itens: extra.itens || base.itens, ofertas: extra.ofertas || base.ofertas, pilulas: extra.pilulas || base.pilulas };
  const visual: VisualCena = v.visual || "classico";
  const faixa = visual === "faixa";
  const cenas = cenasDo(v.modelo, p);
  const clipes = clipesDas(cenas);
  if (v.cena) clipes[0] = `/video-fundos/${v.cena}.mp4`;
  const GANCHOS: [string, string][] = [["Sabe aquela viagem que você vive", "adiando?"], ["E se a sua próxima viagem", "começasse hoje?"], ["Aquele destino dos sonhos", "está mais perto"]];
  const gancho = GANCHOS[variacao % GANCHOS.length];
  const yFaixa = Math.round(H * ALTURA_FAIXA);
  const out: EstadoPagina[] = [];
  // logo pequena no alto de cada cena (o vídeo encaminhado continua com a marca); a última cena já tem a logo grande
  const placa = m.logoBase64 ? await placaDaLogo(m.logoBase64) : null;
  for (let i = 0; i < cenas.length; i++) {
    const c = cenas[i];
    const cy = faixa ? Math.round(yFaixa + (H - yFaixa) / 2 + (c.parte === "fecho" ? 60 : 0)) : CENTRO[c.parte];
    const x = await itensDaCena(c, p, m, cy, faixa ? 0.86 : 1, faixa, gancho);
    const anim = animacoes(x);
    if (placa && c.parte !== "fecho") {
      const id = novoId();
      x.push(logoPequena(placa, id));
      anim[id] = { anim: "nenhuma", vel: "normal", atraso: 0 } as AnimItem;
    }
    const cena: CenaVideo = { livre: true, visual, dur: c.dur, transicao: "fundir", animEl: anim, clipeNome: nomeDoClipe(clipes[i]) };
    if (i === 0) cena.musica = MUSICAS[0].id;
    const a: Arte = { ...arteInicial(0, m, "", ""), formato: "story", titulo: v.nome, video: clipes[i], cena };
    out.push({ a, t: {}, x });
  }
  return out;
}

/** Cena nova em branco (o cliente coloca o texto que quiser), no mesmo visual da cena de agora. */
export function cenaEmBranco(m: Marca, modelo: Arte, clipe: string): EstadoPagina {
  const visual = modelo.cena?.visual || "classico";
  const a: Arte = { ...arteInicial(0, m, "", ""), formato: "story", titulo: modelo.titulo, video: clipe, cena: { livre: true, visual, dur: 3, transicao: "fundir", clipeNome: nomeDoClipe(clipe) } };
  return { a, t: {}, x: [] };
}

/** Duração de cada cena e o total do vídeo. */
export const durDa = (a: Arte) => Math.max(1, a.cena?.dur ?? 3);
