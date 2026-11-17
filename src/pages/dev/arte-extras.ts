// Coisas que a pessoa põe por cima da arte no editor: ícones de redes sociais e imagens a mais.
// Cada uma vira uma imagem pronta (PNG ou SVG); na hora de baixar, são desenhadas por cima da arte.

export type Rede = "whatsapp" | "instagram" | "facebook" | "tiktok" | "youtube" | "site";
export type ModeloRede = "transparente" | "pilula" | "escuro";
export const MODELOS_REDE: { id: ModeloRede; nome: string }[] = [
  { id: "transparente", nome: "Só a logo" },
  { id: "pilula", nome: "Etiqueta branca" },
  { id: "escuro", nome: "Etiqueta escura" },
];
export type Extra = {
  id: string;
  tipo: "rede" | "imagem" | "texto" | "preco" | "icone" | "letra" | "forma";
  /** modelo do selo da rede social */
  modelo?: ModeloRede;
  /** fonte CSS de um texto solto (peça de um selo desagrupado) */
  fonte?: string;
  /** espaço entre letras do texto solto */
  ls?: number;
  /** camada no meio da arte: desenhado atrás dos elementos com z maior (sem z: por cima de tudo) */
  z?: number;
  /** ícone do Iconify ("prefixo:nome") */
  icone?: string;
  rede?: Rede;
  texto?: string;
  /** estilo do texto pronto ou do selo de preço (arte-estilos.ts) */
  estilo?: string;
  cor?: string;
  preco?: { prefixo: string; parcelas: string; valor: string; sufixo: string; antes: string };
  /** largura natural do desenho: serve para manter o tamanho quando o texto muda */
  nw?: number;
  /** efeito, transparência, filtro, degradê e corte (arte-efeitos.ts) */
  fx?: import("./arte-efeitos").FxExtra;
  /** imagem limpa, antes do efeito e do corte (só fotos enviadas) */
  base?: string;
  /** giro em graus */
  rot?: number;
  /** é a logo da agência (placa branca): troca sozinha quando a logo muda em "Sua marca" */
  logo?: boolean;
  src: string;
  /** centro e largura em pixels da arte (1080 de largura); r = altura / largura */
  x: number; y: number; w: number; r: number;
};

export const REDES: { id: Rede; nome: string; cor: string; exemplo: string }[] = [
  { id: "whatsapp", nome: "WhatsApp", cor: "#25D366", exemplo: "(82) 99999-9999" },
  { id: "instagram", nome: "Instagram", cor: "#E1306C", exemplo: "@suaagencia" },
  { id: "facebook", nome: "Facebook", cor: "#1877F2", exemplo: "/suaagencia" },
  { id: "tiktok", nome: "TikTok", cor: "#111111", exemplo: "@suaagencia" },
  { id: "youtube", nome: "YouTube", cor: "#FF0000", exemplo: "@suaagencia" },
  { id: "site", nome: "Site", cor: "#334155", exemplo: "suaagencia.com.br" },
];

const FONTE = '700 42px "Montserrat", Arial, Helvetica, sans-serif';

/** Logo oficial de cada rede (conjuntos "logos", "skill-icons" e "mdi" do Iconify, uso livre), em public/icones-redes. */
const logos = new Map<Rede, Promise<HTMLImageElement>>();
const logoDa = (rede: Rede) => {
  if (!logos.has(rede)) logos.set(rede, carregarImagem(`/icones-redes/${rede}.svg`));
  return logos.get(rede)!;
};

/** Selo da rede: logo + @ ou número. Modelos: só a logo (fundo transparente, como o WhatsApp e o Instagram da arte),
 *  etiqueta branca ou etiqueta escura. `cor` muda a cor das letras. Sem texto: só a logo. */
export async function seloRede(rede: Rede, texto: string, modelo: ModeloRede = "transparente", cor?: string): Promise<{ src: string; w: number; r: number }> {
  const t = texto.trim();
  try { await document.fonts.load(FONTE); } catch { /* fonte do sistema */ }
  const transp = modelo === "transparente";
  const h = 112, lado = transp ? 80 : 72, pad = transp ? 10 : 20;
  const c = document.createElement("canvas");
  const ctx = c.getContext("2d")!;
  ctx.font = FONTE;
  const w = Math.round(t ? pad + lado + 18 + ctx.measureText(t).width + (transp ? 16 : 30) : h);
  c.width = w; c.height = h;
  if (!transp) {
    ctx.fillStyle = modelo === "escuro" ? "rgba(17,17,20,.78)" : "#fff";
    ctx.beginPath(); ctx.roundRect(0, 0, w, h, h / 2); ctx.fill();
  }
  try {
    const img = await logoDa(rede);
    const k = Math.min(lado / img.naturalWidth, lado / img.naturalHeight);
    const iw = img.naturalWidth * k, ih = img.naturalHeight * k;
    const cx = t ? pad + lado / 2 : w / 2;
    ctx.drawImage(img, cx - iw / 2, h / 2 - ih / 2, iw, ih);
  } catch {
    const info = REDES.find((q) => q.id === rede)!;
    ctx.fillStyle = info.cor; ctx.beginPath(); ctx.arc(t ? pad + lado / 2 : w / 2, h / 2, lado / 2, 0, Math.PI * 2); ctx.fill();
  }
  if (t) {
    ctx.font = FONTE; ctx.textBaseline = "middle";
    ctx.fillStyle = cor || (modelo === "pilula" ? "#16161A" : "#FFFFFF");
    if (transp) { ctx.shadowColor = "rgba(0,0,0,.45)"; ctx.shadowBlur = 8; ctx.shadowOffsetY = 2; }
    ctx.fillText(t, pad + lado + 18, h / 2 + 2);
  }
  return { src: c.toDataURL("image/png"), w, r: h / w };
}

export function carregarImagem(src: string): Promise<HTMLImageElement> {
  return new Promise((ok, falhou) => {
    const img = new Image();
    if (/^https?:/.test(src)) img.crossOrigin = "anonymous";
    img.onload = () => ok(img);
    img.onerror = () => falhou(new Error("imagem"));
    img.src = src;
  });
}

/** Foto a mais: diminui, arredonda os cantos e põe borda branca (fica com cara de foto colada). */
export async function prepararImagem(src: string): Promise<{ src: string; w: number; r: number }> {
  const img = await carregarImagem(src);
  const lado = 720;
  const k = Math.min(1, lado / Math.max(img.naturalWidth, img.naturalHeight));
  const w = Math.round(img.naturalWidth * k), h = Math.round(img.naturalHeight * k);
  const borda = Math.round(Math.max(w, h) * 0.025), raio = Math.round(Math.max(w, h) * 0.05);
  const c = document.createElement("canvas");
  c.width = w + borda * 2; c.height = h + borda * 2;
  const ctx = c.getContext("2d")!;
  ctx.fillStyle = "#fff";
  ctx.beginPath(); ctx.roundRect(0, 0, c.width, c.height, raio + borda); ctx.fill();
  ctx.save();
  ctx.beginPath(); ctx.roundRect(borda, borda, w, h, raio); ctx.clip();
  ctx.drawImage(img, borda, borda, w, h);
  ctx.restore();
  return { src: c.toDataURL("image/png"), w: c.width, r: c.height / c.width };
}

/** Arte final: a arte do motor e, por cima, cada extra na ordem em que entrou. */
export async function juntarArte(base: string, extras: Extra[], larg: number, alt: number, escala = 1, tipo = "image/png", qualidade = 0.92): Promise<string> {
  const c = document.createElement("canvas");
  c.width = Math.round(larg * escala); c.height = Math.round(alt * escala);
  const ctx = c.getContext("2d")!;
  ctx.imageSmoothingQuality = "high";
  if (tipo === "image/jpeg") { ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, c.width, c.height); }
  ctx.drawImage(await carregarImagem(base), 0, 0, c.width, c.height);
  ctx.scale(escala, escala);
  // os itens com camada (z) já estão dentro da arte
  for (const e of extras.filter((q) => q.z == null)) {
    const h = e.w * e.r;
    const img = await carregarImagem(e.src);
    ctx.save();
    ctx.translate(e.x, e.y);
    if (e.rot) ctx.rotate((e.rot * Math.PI) / 180);
    ctx.drawImage(img, -e.w / 2, -h / 2, e.w, h);
    ctx.restore();
  }
  return c.toDataURL(tipo, qualidade);
}

// ——— ícones (Iconify: api grátis, sem chave; só coleções com licença livre para uso comercial) ———
const COLECOES = "fluent-emoji-flat,noto,mdi,ph,tabler,mingcute,material-symbols";
const TRADUZ: Record<string, string> = {
  aviao: "airplane", praia: "beach", hotel: "hotel", mala: "luggage", sol: "sun", palmeira: "palm tree", coqueiro: "palm tree",
  navio: "ship", cruzeiro: "ship", mapa: "map", camera: "camera", foto: "camera", coracao: "heart", estrela: "star", onibus: "bus",
  carro: "car", passaporte: "passport", ingresso: "ticket", passagem: "ticket", montanha: "mountain", piscina: "swimming pool",
  comida: "food", cafe: "coffee", fogo: "fire", promocao: "sale", oferta: "sale", desconto: "percent", relogio: "clock",
  calendario: "calendar", telefone: "phone", localizacao: "location", pin: "map pin", natal: "christmas", onda: "wave",
  peixe: "fish", oculos: "sunglasses", seta: "arrow", presente: "gift", dinheiro: "money", cartao: "credit card", mundo: "globe",
  globo: "globe", bandeira: "flag", neve: "snow", ilha: "island", barco: "boat", trem: "train", familia: "family", crianca: "child",
  casal: "couple", anel: "ring", taca: "wine glass", drink: "cocktail", festa: "party", check: "check", raio: "lightning",
  chave: "key", cama: "bed", wifi: "wifi", mochila: "backpack", bussola: "compass", fogos: "fireworks",
};
// só o servidor principal: os espelhos não liberam o acesso de outros sites (CORS). Se o cache do navegador
// guardou o ícone sem a liberação, a segunda tentativa pede de novo sem cache.
const SERVIDORES = ["https://api.iconify.design"];
async function pedirIconify(caminho: string, tipo: "json" | "text"): Promise<unknown> {
  let erro: unknown = null;
  for (const host of SERVIDORES) {
    for (const cache of ["default", "reload"] as RequestCache[]) {
      try {
        const resp = await fetch(host + caminho, { cache });
        if (resp.ok) return tipo === "json" ? await resp.json() : await resp.text();
      } catch (e) { erro = e; }
    }
  }
  throw erro || new Error("iconify");
}
/** Outros estilos do mesmo ícone (colorido, cheio, linha…), para trocar sem mudar o lugar. */
export async function variantesIcone(nome: string): Promise<string[]> {
  const base = (nome.split(":")[1] || nome).replace(/-(fill|filled|line|outline|outlined|bold|duotone|light|thin|regular|rounded|sharp|solid|twotone|round)$/g, "").replace(/-/g, " ");
  const j = (await pedirIconify(`/search?query=${encodeURIComponent(base)}&limit=80&prefixes=${COLECOES},fluent,lucide,iconoir,solar`, "json")) as { icons?: string[] };
  const lista = (j.icons || []).filter((n) => n !== nome);
  const porColecao = new Map<string, string[]>();
  for (const n of lista) { const p = n.split(":")[0]; if (!porColecao.has(p)) porColecao.set(p, []); porColecao.get(p)!.push(n); }
  // um pouco de cada coleção primeiro, para mostrar estilos diferentes
  const out: string[] = [];
  for (let i = 0; out.length < 30 && i < 6; i++) for (const v of porColecao.values()) if (v[i] && out.length < 30) out.push(v[i]);
  return out;
}
const semAcento = (t: string) => t.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
/** atalhos do painel: o desenho do ícone com o nome embaixo */
export const SUGESTOES_ICONE: { nome: string; icone: string }[] = [
  { nome: "Avião", icone: "fluent-emoji-flat:airplane" }, { nome: "Praia", icone: "fluent-emoji-flat:beach-with-umbrella" },
  { nome: "Mala", icone: "fluent-emoji-flat:luggage" }, { nome: "Hotel", icone: "fluent-emoji-flat:hotel" },
  { nome: "Sol", icone: "fluent-emoji-flat:sun" }, { nome: "Palmeira", icone: "fluent-emoji-flat:palm-tree" },
  { nome: "Navio", icone: "fluent-emoji-flat:passenger-ship" }, { nome: "Mapa", icone: "fluent-emoji-flat:world-map" },
  { nome: "Estrela", icone: "fluent-emoji-flat:star" }, { nome: "Coração", icone: "fluent-emoji-flat:red-heart" },
  { nome: "Ingresso", icone: "fluent-emoji-flat:ticket" }, { nome: "Fogo", icone: "fluent-emoji-flat:fire" },
];
export async function buscarIcones(q: string): Promise<string[]> {
  const termo = semAcento(q);
  if (termo.length < 2) return [];
  const en = TRADUZ[termo] || termo;
  const j = (await pedirIconify(`/search?query=${encodeURIComponent(en)}&limit=60&prefixes=${COLECOES}`, "json")) as { icons?: string[] };
  // os coloridos primeiro
  return (j.icons || []).sort((a, b) => Number(/^(fluent-emoji-flat|noto):/.test(b)) - Number(/^(fluent-emoji-flat|noto):/.test(a))).slice(0, 48);
}
export const miniaturaIcone = (nome: string) => `https://api.iconify.design/${nome.replace(":", "/")}.svg?height=48`;
export const iconeColorido = (nome: string) => /^(fluent-emoji-flat|noto):/.test(nome);
const cacheIcone = new Map<string, string>();
/** O ícone pronto para pôr na arte (SVG em data URL). Os de uma cor só recebem a cor pedida. */
export async function desenharIcone(nome: string, cor?: string): Promise<{ src: string; w: number; r: number }> {
  const chave = `${nome}|${iconeColorido(nome) ? "" : cor || "#111111"}`;
  let txt = cacheIcone.get(chave);
  if (!txt) {
    const corQ = iconeColorido(nome) ? "" : `&color=${encodeURIComponent(cor || "#111111")}`;
    const caminho = `/${nome.replace(":", "/")}.svg?height=256${corQ}`;
    try {
      txt = (await pedirIconify(caminho, "text")) as string;
    } catch {
      // último recurso: carrega como imagem e vira PNG
      const img = await carregarImagem(`https://api.iconify.design${caminho}&t=${Date.now()}`);
      const c = document.createElement("canvas");
      c.width = img.naturalWidth || 256; c.height = img.naturalHeight || 256;
      c.getContext("2d")!.drawImage(img, 0, 0, c.width, c.height);
      return { src: c.toDataURL("image/png"), w: c.width, r: c.height / c.width };
    }
    cacheIcone.set(chave, txt);
  }
  const w = Number(/width="([\d.]+)"/.exec(txt)?.[1] || 256), h = Number(/height="([\d.]+)"/.exec(txt)?.[1] || 256);
  return { src: `data:image/svg+xml;charset=utf-8,${encodeURIComponent(txt)}`, w, r: h / w };
}
