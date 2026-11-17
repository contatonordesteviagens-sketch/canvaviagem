// Artes do Início novo e do editor simples: o mesmo motor do Criador de Anúncios, com menos campos.
import { useEffect, useState } from "react";
import { composeTravelAd } from "@/lib/fabrica-compose-art";
import { getArtTweakPreset, loadArtTweakPresets } from "@/lib/fabrica-art-tweak-presets";
import type { ArtElementBox, ArtTweakMap } from "@/lib/fabrica-art-tweaks";
import { trialPhotoUrl } from "@/lib/inicio-arte";
import { carregarFontes } from "./arte-estilos";

export const INCLUSOS: { texto: string; icon: string }[] = [
  { texto: "Aéreo ida e volta", icon: "plane" }, { texto: "Hospedagem", icon: "hotel" }, { texto: "Café da manhã", icon: "coffee" },
  { texto: "Traslados", icon: "bus" }, { texto: "Passeios", icon: "map" }, { texto: "Seguro viagem", icon: "check" },
  { texto: "Guia local", icon: "guide" }, { texto: "All inclusive", icon: "food" },
  { texto: "Pensão completa", icon: "food" }, { texto: "Ingressos", icon: "star" }, { texto: "Cruzeiro", icon: "ship" },
  { texto: "Day use", icon: "sun" }, { texto: "Wi-Fi", icon: "wifi" }, { texto: "Ensaio de fotos", icon: "camera" },
  { texto: "Lua de mel", icon: "heart" }, { texto: "Pé na areia", icon: "palm" }, { texto: "Ônibus leito", icon: "bus" },
  { texto: "Kit viagem", icon: "check" },
];

export type Pagamento = "free_quote" | "installments" | "cash" | "down_plus" | "from";
export const PAGAMENTOS: { id: Pagamento; nome: string }[] = [
  { id: "installments", nome: "Parcelado" }, { id: "cash", nome: "À vista" }, { id: "down_plus", nome: "Entrada + parcelas" },
  { id: "from", nome: "A partir de" }, { id: "free_quote", nome: "Sem preço (consulte)" },
];

export type Arte = {
  variant: number; formato: "square" | "story"; destino: string; foto: string;
  titulo: string; promo: string; periodo: string;
  preco: string; parcelas: string; pagamento: Pagamento; prefixo: string; complemento: string;
  inclusos: string[]; fonte: string; cor1: string; cor2: string; corTexto: string;
  /** vídeo: o clipe que toca no lugar da foto (a foto vira um buraco na arte) */
  video?: string;
  /** vídeo: os ajustes desta cena (tempo, transição, trecho, velocidade, enquadrar, animação) */
  cena?: CenaVideo;
};
export type VisualCena = "classico" | "faixa" | "azul";
export type AnimItem = { anim: import("./video-cena").Animacao; modo?: import("./video-cena").ModoAnim; vel?: import("./video-cena").VelAnim; atraso?: number };
export type CenaVideo = import("./video-cena").AjusteCena & {
  /** cena só com o vídeo (sem o layout de anúncio): os textos são itens soltos por cima */
  livre?: boolean;
  /** visual da cena livre: vídeo na tela toda, vídeo em cima com faixa escura, ou com o véu azul */
  visual?: VisualCena;
  /** animação de cada item (pelo id do elemento da arte ou do item solto) */
  animEl?: Record<string, AnimItem>;
  /** animação de todos os itens da cena (quando o item não tem a dele) */
  animTodos?: AnimItem;
  /** só na primeira cena: a música do vídeo inteiro ("" = sem música) */
  musica?: string;
  /** nome do clipe (para mostrar ao cliente) */
  clipeNome?: string;
  /** o que a voz fala nesta cena (sem valor = roteiro automático; "" = cena sem fala) */
  fala?: string;
  /** só na primeira cena: a narração do vídeo inteiro (voz, velocidade, tom, legenda) */
  narracao?: import("@/lib/narracao").Narracao;
};
export type Marca = { primaryColor?: string; secondaryColor?: string; logoBase64?: string; logoFormat?: string; whatsapp?: string; instagram?: string };

export const MODELOS_ARTE = Array.from({ length: 12 }, (_, i) => i);
export const FOTO_EXEMPLO = trialPhotoUrl(35858830, 1280);
export const FONTES = [
  "Montserrat", "Poppins", "Inter", "Bebas Neue", "Oswald", "Anton", "Archivo Black", "Barlow Condensed",
  "Raleway", "Nunito", "Lato", "Righteous", "Playfair Display", "Abril Fatface", "Lora", "Lobster", "Pacifico", "Dancing Script",
  "Bungee", "Permanent Marker", "Rye", "Press Start 2P",
];
export const PALETAS: { nome: string; cor1: string; cor2: string }[] = [
  { nome: "Amarelo", cor1: "#111111", cor2: "#F5F906" }, { nome: "Mar", cor1: "#0B3B8C", cor2: "#FFD400" },
  { nome: "Sol", cor1: "#E85D04", cor2: "#FFE066" }, { nome: "Verde", cor1: "#0B6E4F", cor2: "#F4D35E" },
  { nome: "Rosa", cor1: "#B5179E", cor2: "#FFD6E8" }, { nome: "Vinho", cor1: "#7B1E3A", cor2: "#F2C14E" },
  { nome: "Céu", cor1: "#0096C7", cor2: "#FFFFFF" }, { nome: "Areia", cor1: "#8C6A3F", cor2: "#F6E7C8" },
  { nome: "Caribe", cor1: "#00838F", cor2: "#FFE082" }, { nome: "Coral", cor1: "#E63946", cor2: "#F1FAEE" },
  { nome: "Noite", cor1: "#14213D", cor2: "#FCA311" }, { nome: "Lilás", cor1: "#5B21B6", cor2: "#FDE68A" },
  { nome: "Laranja", cor1: "#111111", cor2: "#FF7A00" }, { nome: "Floresta", cor1: "#1B4332", cor2: "#B7E4C7" },
  { nome: "Vermelho", cor1: "#B91C1C", cor2: "#FDE047" }, { nome: "Turquesa", cor1: "#0E7490", cor2: "#FFFFFF" },
];
export const PROMOS = ["Oferta especial", "Promoção", "Últimas vagas", "Black Friday", "Férias", "Lançamento"];
export const titulosProntos = (d: string) => [`Pacote ${d}`, `Você precisa conhecer ${d}`, `${d} te espera`, `Férias em ${d}`, `Viaje para ${d}`];

const corDaMarca = (c: string | undefined, padraoPerfil: string, nossa: string) => (!c || c.toUpperCase() === padraoPerfil ? nossa : c);
export const arteInicial = (variant: number, m: Marca, destino = "Maragogi", foto = FOTO_EXEMPLO): Arte => ({
  variant, formato: "square", destino, foto, titulo: "", promo: "Oferta especial", periodo: "",
  preco: "", parcelas: "10x", pagamento: "free_quote", prefixo: "a partir de", complemento: "por pessoa",
  inclusos: INCLUSOS.slice(0, 4).map((i) => i.texto), fonte: "Montserrat",
  // cor da marca quando a pessoa escolheu uma; sem escolha (ou com o padrão do perfil), amarelo vivo e preto
  cor1: corDaMarca(m.primaryColor, "#F59E0B", "#111111"), cor2: corDaMarca(m.secondaryColor, "#171717", "#F5F906"), corTexto: "",
});

/** Ponto de partida do editor: nenhum ajuste (os presets do admin são dos layouts antigos e não valem nos 12 modelos). */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const ajustesDoModelo = (_a: Pick<Arte, "variant" | "formato">): ArtTweakMap => ({});

/** O que muda a lista de elementos da arte: se mudar, os ajustes por elemento deixam de bater e voltam ao zero. */
export const estruturaDa = (a: Arte) =>
  JSON.stringify([a.variant, a.formato, a.pagamento !== "free_quote" && a.preco.trim() !== "" ? a.pagamento : "sem-preco", a.inclusos.length, !!a.periodo, !!a.promo, !!a.cena?.livre, a.cena?.livre ? a.cena.visual || "" : ""]);

export type CamadaArte = { z: number; src: string; x: number; y: number; w: number; h: number; rot?: number };
export async function comporArte(a: Arte, m: Marca, ajustes?: ArtTweakMap, aoMedir?: (els: ArtElementBox[]) => void, extra?: { camadas?: CamadaArte[]; escala?: number }): Promise<string> {
  const camadasProntas = await Promise.all((extra?.camadas || []).map(async (c) => {
    const img = new Image();
    img.src = c.src;
    try { await img.decode(); } catch { /* imagem com problema: desenha nada */ }
    return { z: c.z, img, x: c.x, y: c.y, w: c.w, h: c.h, rot: c.rot };
  }));
  if (a.cena?.livre) return comporCena(a, aoMedir, camadasProntas, extra?.escala || 1);
  await loadArtTweakPresets();
  await carregarFontes();
  await Promise.all([400, 700, 800, 900].map((p) => document.fonts.load(`${p} 80px "${a.fonte}"`).catch(() => null)));
  const comPreco = a.pagamento !== "free_quote" && a.preco.trim() !== "";
  const pagamento: Pagamento = comPreco ? a.pagamento : "free_quote";
  const pay =
    pagamento === "installments" ? { paymentLabel: a.parcelas, paymentSuffix: a.complemento, pricePrefix: a.prefixo }
    : pagamento === "cash" ? { paymentLabel: "À VISTA", paymentSuffix: a.complemento, pricePrefix: "" }
    : pagamento === "down_plus" ? { paymentSuffix: a.complemento, pricePrefix: a.prefixo }
    : pagamento === "from" ? { paymentSuffix: a.complemento, pricePrefix: "" }
    : { paymentLabel: "CONSULTE", paymentSuffix: "", pricePrefix: "" };
  const titulo = a.titulo || `Pacote ${a.destino}`;
  const desenhar = (tw: ArtTweakMap | undefined, medir: ((els: ArtElementBox[]) => void) | undefined, escala?: number) => composeTravelAd({
    imageUrl: a.video ? fotoBranca() : a.foto, format: a.formato, punchPhoto: !!a.video, destination: a.destino, city: "",
    primaryColor: a.cor1, secondaryColor: a.cor2,
    price: a.preco, currencySymbol: "R$", hideCents: !/[.,]\d{2}$/.test(a.preco), installments: a.parcelas,
    promoName: a.promo,
    highlights: a.inclusos.map((t) => ({ text: t, icon: INCLUSOS.find((i) => i.texto === t)?.icon || "check" })),
    hasLogo: !!m.logoBase64, logoDataUrl: m.logoBase64 || undefined, logoFormat: m.logoFormat || "circle",
    whatsapp: m.whatsapp || "", instagram: m.instagram || "",
    paymentMode: pagamento, ...pay,
    strategy: "vitrine", variation: a.variant, forceVariant: a.variant,
    customHeading: a.titulo || undefined,
    titleOverride: titulo, titleVariations: [titulo],
    travelPeriod: a.periodo || undefined,
    showPixBanner: false, showTotal: false, fontFamily: a.fonte,
    textColorOverride: a.corTexto || undefined,
    artTweaks: getArtTweakPreset("oferta_destino", a.variant, a.formato),
    userTweaks: tw,
    onArtElements: medir,
    renderScale: escala,
    injectedLayers: camadasProntas.length ? camadasProntas : undefined,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } as any);
  if (comPreco) return (await desenhar(ajustes, aoMedir, extra?.escala)).url;
  // sem preço: nada de "Consulte valores". Mede a arte uma vez, esconde o bloco do preço e encolhe o cartão que sobrou
  let medidos: ArtElementBox[] = [];
  await desenhar(undefined, (els) => { medidos = els; });
  const sem = ajustesSemPreco(medidos);
  if (!Object.keys(sem).length) return (await desenhar(ajustes, aoMedir, extra?.escala)).url;
  return (await desenhar({ ...sem, ...(ajustes || {}) }, aoMedir, extra?.escala)).url;
}

const TEXTO_SEM_PRECO = /^(consulte|consulte valores|valores|no whatsapp|consulte no whatsapp|r\$|valores por pessoa.*)$/i;
/** Sem preço: esconde os textos do "Consulte valores" e o cartão que só tinha eles; o cartão que divide espaço com
 *  outros textos encolhe até o último texto (o topo fica no lugar). Medidas em pixels da arte (1080 de largura). */
function ajustesSemPreco(els: ArtElementBox[]): ArtTweakMap {
  const textos = els.filter((e) => e.kind === "text" && e.text);
  const doPreco = textos.filter((e) => TEXTO_SEM_PRECO.test((e.text || "").trim()));
  if (!doPreco.length) return {};
  const dentro = (box: ArtElementBox, t: ArtElementBox) => {
    const cx = t.x + t.w / 2, cy = t.y + t.h / 2;
    return cx >= box.x && cx <= box.x + box.w && cy >= box.y && cy <= box.y + box.h;
  };
  const W = els.reduce((m, e) => Math.max(m, e.x + e.w), 1), H = els.reduce((m, e) => Math.max(m, e.y + e.h), 1);
  const out: ArtTweakMap = Object.fromEntries(doPreco.map((e) => [e.id, { hidden: true }]));
  for (const box of els.filter((e) => e.kind === "shape")) {
    const area = (box.w * box.h) / (W * H);
    const ts = textos.filter((t) => dentro(box, t));
    const comPreco = ts.filter((t) => doPreco.includes(t));
    if (!comPreco.length) continue;
    if (ts.length === comPreco.length) { if (area < 0.2) out[box.id] = { hidden: true }; continue; }
    // cartão com outros textos: encolhe por baixo, se o preço estava embaixo e o cartão não encosta na borda
    if (area > 0.45 || box.y + box.h >= H - 4) continue;
    const resto = els.filter((e) => e !== box && !out[e.id] && e.kind !== "shape" && !(e.kind === "text" && !(e.text || "").trim()) && e.w <= box.w && e.h <= box.h && dentro(box, e));
    if (!resto.length) continue;
    const topoConteudo = Math.min(...resto.map((e) => e.y));
    const baseConteudo = Math.max(...resto.map((e) => e.y + e.h));
    if (comPreco.some((t) => t.y + t.h / 2 < baseConteudo)) continue;
    const novaAltura = Math.min(box.h, baseConteudo - box.y + Math.max(24, topoConteudo - box.y));
    if (novaAltura > box.h * 0.88) continue;
    const sy = novaAltura / box.h;
    out[box.id] = { scaleY: sy, scaleX: 1, dy: -(box.h - novaAltura) / 2 };
  }
  return out;
}

/** Foto lisa usada só para abrir o buraco do vídeo (ela nunca aparece). */
let branca = "";
function fotoBranca() {
  if (branca) return branca;
  const c = document.createElement("canvas");
  c.width = 32; c.height = 32;
  const x = c.getContext("2d")!;
  x.fillStyle = "#fff";
  x.fillRect(0, 0, 32, 32);
  return (branca = c.toDataURL("image/png"));
}
/** Altura da parte do vídeo no visual "faixa" (o resto é a faixa escura com os textos). */
export const ALTURA_FAIXA = 0.47;
export const AMARELO_CENA = "#FFC629";
/**
 * Cena livre do vídeo: só o fundo (vídeo ou foto), o véu do visual escolhido e os itens com camada.
 * Os textos são itens soltos do editor (dá para tocar, mudar, mover e animar cada um).
 */
async function comporCena(a: Arte, aoMedir: ((els: ArtElementBox[]) => void) | undefined, camadas: { z: number; img: HTMLImageElement; x: number; y: number; w: number; h: number; rot?: number }[], escala: number): Promise<string> {
  const W = 1080, H = a.formato === "story" ? 1920 : 1080;
  const c = document.createElement("canvas");
  c.width = Math.round(W * escala); c.height = Math.round(H * escala);
  const x = c.getContext("2d")!;
  x.scale(escala, escala);
  const visual = a.cena?.visual || "classico";
  const fotoH = visual === "faixa" ? Math.round(H * ALTURA_FAIXA) : H;
  if (!a.video && a.foto) {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = a.foto;
    try {
      await img.decode();
      const k = Math.max(W / img.naturalWidth, fotoH / img.naturalHeight);
      const sw = W / k, sh = fotoH / k;
      x.drawImage(img, (img.naturalWidth - sw) / 2, (img.naturalHeight - sh) / 2, sw, sh, 0, 0, W, fotoH);
    } catch { /* sem a foto: fica o fundo escuro */ }
  }
  if (visual === "azul") {
    const g = x.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, "rgba(12,70,200,.5)"); g.addColorStop(0.5, "rgba(8,48,143,.5)"); g.addColorStop(1, "rgba(4,22,80,.85)");
    x.fillStyle = g; x.fillRect(0, 0, W, H);
  } else if (visual === "faixa") {
    x.fillStyle = "#0a0a0c"; x.fillRect(0, fotoH, W, H - fotoH);
    x.fillStyle = AMARELO_CENA; x.fillRect(0, fotoH, W, 10);
  } else {
    const g = x.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, "rgba(0,0,0,.5)"); g.addColorStop(0.28, "rgba(0,0,0,.05)"); g.addColorStop(0.6, "rgba(0,0,0,.08)"); g.addColorStop(1, "rgba(0,0,0,.72)");
    x.fillStyle = g; x.fillRect(0, 0, W, H);
  }
  for (const cam of camadas.slice().sort((p, q) => p.z - q.z)) {
    x.save();
    x.translate(cam.x, cam.y);
    if (cam.rot) x.rotate((cam.rot * Math.PI) / 180);
    try { x.drawImage(cam.img, -cam.w / 2, -cam.h / 2, cam.w, cam.h); } catch { /* imagem com problema */ }
    x.restore();
  }
  aoMedir?.([{ id: "foto", label: a.video ? "Vídeo de fundo" : "Foto de fundo", x: 0, y: 0, w: W, h: fotoH, kind: "image", resizable: false }]);
  return c.toDataURL("image/png");
}

// miniaturas dos 12 modelos: desenhadas uma vez por visita, uma de cada vez para não travar a tela.
// Chave: o número do modelo no Feed; o número + STORY no Stories.
export const STORY = 100;
const miniaturas = new Map<number, string>();
let fila: Promise<void> | null = null;
const ouvintes = new Set<() => void>();
function pedirMiniaturas(m: Marca) {
  if (fila) return;
  fila = (async () => {
    for (const k of [...MODELOS_ARTE, ...MODELOS_ARTE.map((v) => v + STORY)]) {
      const v = k % STORY;
      try {
        const a = { ...arteInicial(v, m), preco: "249", pagamento: "installments" as Pagamento, formato: (k >= STORY ? "story" : "square") as Arte["formato"] };
        miniaturas.set(k, await comporArte(a, m));
      } catch {
        /* um modelo que falhar fica sem miniatura; os outros seguem */
      }
      ouvintes.forEach((f) => f());
      await new Promise((r) => setTimeout(r, 30));
    }
  })();
}
export function useMiniaturas(m: Marca, ligado: boolean) {
  const [, repintar] = useState(0);
  useEffect(() => {
    if (!ligado) return;
    const f = () => repintar((n) => n + 1);
    ouvintes.add(f);
    pedirMiniaturas(m);
    return () => void ouvintes.delete(f);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ligado]);
  return miniaturas;
}
