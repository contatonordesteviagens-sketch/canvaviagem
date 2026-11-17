// Editor de arte simples, no jeito do Canva: toca no elemento, arrasta, aumenta, muda o texto, apaga.
// As ferramentas ficam numa barra (esquerda no computador, embaixo no celular).
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft, Check, Copy, Download, Image as ImageIcon, LayoutGrid, Minus, Palette, Pencil, Plus, Redo2,
  Bold, Briefcase, Italic, Group, Ungroup, BoxSelect, Settings2, Shapes, Smartphone, Tag, Trash2, Type, Undo2, X, ListChecks,
  AlignLeft, AlignCenter, AlignRight, Sparkles, Move, Droplet, PenLine, Crop, SlidersHorizontal, ImagePlus, Lock, LockOpen, ChevronsUp, ChevronsDown,
  ArrowUp, ArrowDown, AlignStartVertical, AlignCenterVertical, AlignEndVertical, AlignStartHorizontal, AlignCenterHorizontal, AlignEndHorizontal, LetterText, GripVertical, ClipboardCopy, Smartphone as Celular, Save, Link2, Eye, Users,
  ClipboardPaste, CopyPlus, Film, Music, Play, Clock, Layers, Wand2, ChevronLeft, ChevronRight, Mic,
  Languages,
} from "lucide-react";
import { NARRACAO_PADRAO, pedacosDaLegenda, roteiroDasCenas, vozDe, type Narracao, type TextosCena } from "@/lib/narracao";
import { INICIO_VOZ, textoCorrido, type VozGravada } from "@/lib/voz-gravada";
import { traduzirTextos, type EtapaTraducao, type IdiomaVideo } from "@/lib/traducao";
import { VOZES_IA } from "@/lib/voz-ia";
import { aiTools } from "@/data/templates";
import { PainelNarracao } from "./video-narracao";
import { PainelTraduzir } from "./video-traduzir";
import { FaixasAudio, OpcoesAudio, type PosCena, type SelAudio } from "./video-faixas";
import { clipeInicial, fimClipe, montarVoz, type ClipeVoz } from "@/lib/faixa-audio";
import type { VozNaFaixa } from "@/lib/musica-video";
/** Narrador de Ofertas: agente no ChatGPT que escreve a narração do pacote (o mesmo da lista de ferramentas de IA) */
const LINK_NARRADOR = aiTools.find((t) => t.id === "ia-narrador")?.url || "https://chatgpt.com/g/g-zuVzD4urh-redador";

/** Quebra a frase em até 3 linhas de tamanho parecido, cada uma com no máximo `max` letras quando der. */
function linhasIguais(frase: string, max: number): string {
  const p = frase.trim().split(/\s+/).filter(Boolean);
  if (p.length < 2) return frase;
  const total = frase.trim().length;
  const n = Math.min(3, p.length, Math.max(2, Math.ceil(total / max)));
  let melhor = frase, pior = Infinity;
  const tenta = (ini: number, resto: number, acc: string[]) => {
    if (resto === 1) {
      const l = [...acc, p.slice(ini).join(" ")];
      const m = Math.max(...l.map((x) => x.length));
      if (m < pior) { pior = m; melhor = l.join("\n"); }
      return;
    }
    for (let k = ini + 1; k <= p.length - resto + 1; k++) tenta(k, resto - 1, [...acc, p.slice(ini, k).join(" ")]);
  };
  if (p.length <= 16) tenta(0, n, []);
  return melhor;
}
import { MODELOS_REDE, type ModeloRede } from "./arte-extras";
import { desenharLetra, familiaDa, italicoDa, mudarFonte, negritoDa, tingirForma } from "./arte-pecas";
import { CATEGORIAS_FORMA, MOLDES_IMAGEM, desenharForma, formaComEspessura, formaPorId, svgDaForma, temEspessura } from "./arte-formas";
import { gerarLegenda, legendaDoVideo, nomeLimpo, zapDeLer } from "./arte-legenda";
import { ehIOS, fazerMp4, fazerPdf, podeMp4 } from "./arte-saida";
import { lerProjeto, midiaFaltando, novoIdProjeto, salvarProjeto } from "@/lib/biblioteca-artes";
import { lerLink, novoSlug, publicarLink, salvarNoLink, urlDoLink, type Acesso } from "@/lib/artes-link";
import { REDES, SUGESTOES_ICONE, buscarIcones, carregarImagem, desenharIcone, iconeColorido, juntarArte, miniaturaIcone, prepararImagem, seloRede, variantesIcone, type Extra, type Rede } from "./arte-extras";
import { ESTILOS_PRECO, ESTILOS_TEXTO, carregarFontes, desenharPreco, desenharTexto, pecasDoPreco, type Preco } from "./arte-estilos";
import { CORES_SOLIDAS, DEGRADES, EFEITOS, EFEITOS_DO, FILTROS, processarExtra, type FxExtra } from "./arte-efeitos";
import type { ArtEffect, ArtElementBox, ArtTweakMap } from "@/lib/fabrica-art-tweaks";
import { useFabricaContext } from "@/hooks/useFabricaContext";
import { TRIAL_DESTINOS, trialPhotoUrl } from "@/lib/inicio-arte";
import { fetchDestinationPhotos } from "@/lib/photo-search";
import {
  FONTES, INCLUSOS, MODELOS_ARTE, PAGAMENTOS, PALETAS, PROMOS, ajustesDoModelo, arteInicial, comporArte,
  STORY, estruturaDa, titulosProntos, useMiniaturas, type Arte, type CamadaArte,
} from "./arte-nova";
import { BotaoTema, useTemaNovo } from "./MenuNovo";
import { BarraZoom, useZoomPalco } from "./editor-comum/zoom";
import { KIT, corHex, lerKit, type KitMarca } from "./editor-comum/kit-marca";
import { AnuncioAgente, BotaoAcao, TOTAL_ANUNCIOS } from "./editor-comum/pecas";
import { ALTURA_FAIXA, type AnimItem, type CenaVideo, type VisualCena } from "./arte-nova";
import { ESTILOS_CENA } from "./arte-estilos";
import { CLIPES, FORMATOS_LOGO, ONDE_LOGO, capaDoClipe, cenaEmBranco, durDa, logoGrande, logoPequena, paginasDoVideo, placaDaLogo, type FormatoLogo } from "./video-paginas";
import { fazerGif, fazerVideoMp4, linhaDas, musicaDoVideo, prepararCena, type CenaPronta } from "./video-saida";
import { CenaNoPalco, PainelAnimarItem, PainelMusica, PainelVideoFundo, TocadorVideo, VideoNoPalco } from "./video-editor";
import { PainelCena } from "./video-cena";
import { CATEGORIAS_VIDEO, VIDEOS, VISUAIS_VIDEO, type VideoPronto } from "./videos-prontos";

const AMARELO = "#F5F906";
const semAcentoTela = (t: string) => t.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
const LARGURA = 1080;
type Ferramenta = "modelos" | "foto" | "texto" | "preco" | "inclusos" | "elementos" | "marca" | "cores" | "formato" | "cor" | "efeitos" | "posicao" | "estiloIcone" | "video" | "musica" | "animar" | "cena" | "narracao" | "traduzir";
/** painéis que abrem a partir do item escolhido (não ficam na barra de ferramentas) */
const CONTEXTUAIS: Ferramenta[] = ["cor", "efeitos", "posicao", "estiloIcone"];
type Sub = "transp" | "espaco" | "cortar" | "filtro" | "modeloRede" | "forma" | "espessura";
const slug = (s: string) => s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "arte";
/** itens que estão no meio da arte (com camada) vão para o motor desenhar na ordem certa */
const camadasDe = (lista: Extra[]): CamadaArte[] => lista.filter((e) => e.z != null).map((e) => ({ z: e.z as number, src: e.src, x: e.x, y: e.y, w: e.w, h: e.w * e.r, rot: e.rot }));
// tamanhos prontos (largura em px); a pessoa também digita qualquer largura ou altura
const TAMANHOS = [{ px: 360, nome: "Mini" }, { px: 540, nome: "Pequena" }, { px: 1080, nome: "Padrão" }, { px: 2160, nome: "2K" }, { px: 3840, nome: "4K" }];
/** Vídeo em pé (9:16): a largura manda; HD = 720×1280, Full HD = 1080×1920, 2K = 1440×2560, 4K = 2160×3840 */
const TAMANHOS_VIDEO = [{ px: 720, nome: "HD" }, { px: 1080, nome: "Full HD" }, { px: 1440, nome: "2K" }, { px: 2160, nome: "4K" }];
const TAMANHOS_GIF = [{ px: 320, nome: "Pequeno" }, { px: 480, nome: "Médio" }];
const LARG_MIN = 100, LARG_MAX = 3840;
const FORMATOS_SAIDA = [
  { id: "png", nome: "PNG", mime: "image/png", fator: 1.1, desc: "A melhor qualidade: cores e letras bem nítidas. Para postar no Instagram e no Facebook." },
  { id: "jpg", nome: "JPG", mime: "image/jpeg", fator: 0.28, desc: "Arquivo menor. Bom para o WhatsApp e para celular com pouca memória." },
  { id: "webp", nome: "WebP", mime: "image/webp", fator: 0.16, desc: "O mais leve. Ideal para o site da agência (a página carrega mais rápido)." },
  { id: "pdf", nome: "PDF", mime: "image/jpeg", fator: 0.3, desc: "Todas as páginas num arquivo só. Abre em qualquer celular: bom para mandar orçamento ou imprimir." },
  { id: "mp4", nome: "MP4", mime: "image/png", fator: 0, desc: "A arte vira um vídeo curto com movimento suave. Para Status, Reels e Stories." },
  { id: "gif", nome: "GIF", mime: "image/gif", fator: 0, desc: "Animação sem som, que toca sozinha. Para site, e-mail e WhatsApp." },
] as const;
type FormatoSaida = (typeof FORMATOS_SAIDA)[number]["id"];
// onde postar. "colar": a imagem vai copiada e o texto já entra escrito quando a rede deixa;
// "arquivo": a rede só aceita o arquivo, então a imagem é baixada e a legenda copiada
const enc = encodeURIComponent;
const tamanhoArquivo = (b: number) => (b < 1e6 ? `${Math.max(1, Math.round(b / 1024))} KB` : `${(b / 1e6).toFixed(1).replace(".", ",")} MB`);
/** Vídeo não se cola: toda rede vira "baixa o arquivo e copia a legenda", com a dica do jeito certo de subir vídeo. */
const DICA_VIDEO: Record<string, string> = {
  whatsapp: "Escolha o contato, toque no clipe e envie o vídeo que baixou. A legenda já vai escrita.",
  instagram: "Clique em Criar › Reels, escolha o vídeo que baixou e cole a legenda.",
  facebook: "Clique em Reels › Criar, envie o vídeo que baixou e cole a legenda.",
  tiktok: "Envie o vídeo que baixou e cole a legenda.",
  youtube: "Em Criar › Enviar vídeos, envie o vídeo que baixou (vira Shorts por ser em pé) e cole a legenda.",
  x: "O texto já vai escrito. Anexe o vídeo que baixou no post.",
  linkedin: "O texto já vai escrito. Anexe o vídeo que baixou no post.",
  pinterest: "Envie o vídeo que baixou e cole a legenda na descrição.",
};
const REDES_POSTAR: { id: string; nome: string; modo: "colar" | "arquivo"; url: (t: string) => string; dica: string }[] = [
  { id: "whatsapp", nome: "WhatsApp", modo: "colar", url: (t) => `https://web.whatsapp.com/send?text=${enc(t)}`, dica: "Escolha o contato e cole a imagem (Ctrl+V). A legenda já vai escrita." },
  { id: "instagram", nome: "Instagram", modo: "arquivo", url: () => "https://www.instagram.com/", dica: "Clique em Criar, escolha a imagem que baixou e cole a legenda." },
  { id: "facebook", nome: "Facebook", modo: "colar", url: () => "https://www.facebook.com/", dica: "Clique em \"No que você está pensando?\", cole a imagem (Ctrl+V) e depois a legenda." },
  { id: "tiktok", nome: "TikTok", modo: "arquivo", url: () => "https://www.tiktok.com/tiktokstudio/upload", dica: "Envie a imagem que baixou (modo foto) e cole a legenda." },
  { id: "youtube", nome: "YouTube", modo: "arquivo", url: () => "https://studio.youtube.com/", dica: "Em Criar › Criar post, envie a imagem que baixou e cole a legenda." },
  { id: "x", nome: "X", modo: "colar", url: (t) => `https://x.com/intent/post?text=${enc(t.length > 270 ? `${t.slice(0, 267)}…` : t)}`, dica: "O texto já vai escrito. Cole a imagem (Ctrl+V) no post." },
  { id: "linkedin", nome: "LinkedIn", modo: "colar", url: (t) => `https://www.linkedin.com/feed/?shareActive=true&text=${enc(t)}`, dica: "O texto já vai escrito. Cole a imagem (Ctrl+V) no post." },
  { id: "pinterest", nome: "Pinterest", modo: "arquivo", url: () => "https://www.pinterest.com/pin-creation-tool/", dica: "Envie a imagem que baixou e cole a legenda na descrição." },
];
const FERRAMENTAS: { id: Ferramenta; nome: string; icone: typeof Type }[] = [
  { id: "modelos", nome: "Modelos", icone: LayoutGrid }, { id: "foto", nome: "Foto", icone: ImageIcon },
  { id: "texto", nome: "Texto", icone: Type }, { id: "preco", nome: "Preço", icone: Tag },
  { id: "inclusos", nome: "Inclui", icone: ListChecks }, { id: "elementos", nome: "Elementos", icone: Shapes },
  { id: "marca", nome: "Sua marca", icone: Briefcase },
  { id: "cores", nome: "Cores", icone: Palette }, { id: "formato", nome: "Formato", icone: Smartphone },
];
// no vídeo: "Vídeo" no lugar de "Foto", "Música" no lugar de "Formato" (o vídeo é sempre em pé)
const FERRAMENTAS_VIDEO: { id: Ferramenta; nome: string; icone: typeof Type }[] = [
  { id: "modelos", nome: "Modelos", icone: LayoutGrid }, { id: "video", nome: "Vídeo", icone: Film },
  { id: "texto", nome: "Texto", icone: Type }, { id: "preco", nome: "Preço", icone: Tag },
  { id: "inclusos", nome: "Inclui", icone: ListChecks }, { id: "elementos", nome: "Elementos", icone: Shapes },
  { id: "marca", nome: "Sua marca", icone: Briefcase }, { id: "cores", nome: "Cores", icone: Palette },
  { id: "musica", nome: "Música", icone: Music }, { id: "narracao", nome: "Narração", icone: Mic },
  { id: "traduzir", nome: "Traduzir", icone: Languages },
];
// no celular a cena e o Animar também ficam na barra de baixo (no computador ficam na barra de cima)
// ordem do celular: o que mais se usa primeiro (cabem 5 sem rolar: Texto, Vídeo, Música, Narração, Modelos)
const FERR_V = (id: Ferramenta) => FERRAMENTAS_VIDEO.find((f) => f.id === id)!;
const FERRAMENTAS_VIDEO_CEL = [FERR_V("texto"), FERR_V("video"), FERR_V("musica"), FERR_V("narracao"), FERR_V("modelos"), { id: "cena" as Ferramenta, nome: "Cena", icone: Clock }, { id: "animar" as Ferramenta, nome: "Animar", icone: Wand2 }, FERR_V("preco"), FERR_V("marca"), FERR_V("cores"), FERR_V("elementos"), FERR_V("inclusos"), FERR_V("traduzir")];
const VISUAIS_CENA = VISUAIS_VIDEO;
const segs = (x: number) => x.toFixed(1).replace(".", ",") + " s";
type Estado = { a: Arte; t: ArtTweakMap; x: Extra[] };

/** Redesenha um texto já colocado com outras palavras, no mesmo estilo e na mesma escala (usado na tradução do vídeo). */
async function textoTraduzido(e: Extra, novo: string): Promise<Extra> {
  try {
    let d: { src: string; w: number; r: number } | null = null;
    let txt = novo;
    if (e.tipo === "letra") d = await desenharLetra(txt || " ", e.fonte || '800 80px "Montserrat"', e.cor || "#111111", e.ls || 0);
    else if (e.tipo === "texto" && e.estilo) {
      const caixaAlta = /^cena(Titulo|Amarelo|Etiqueta|Pilula|Numero|Pequeno)$/.test(e.estilo);
      txt = caixaAlta ? (txt || " ").toLocaleUpperCase() : txt || " ";
      d = await desenharTexto(e.estilo, txt, e.cor);
      const escala = e.nw ? e.w / e.nw : 0;
      if (escala && !txt.includes("\n") && d.w * escala > LARGURA * 0.92) {
        const quebrado = linhasIguais(txt, Math.max(8, Math.floor(txt.length * ((LARGURA * 0.88) / (d.w * escala)))));
        if (quebrado !== txt) { txt = quebrado; d = await desenharTexto(e.estilo, txt, e.cor); }
      }
    }
    if (!d) return { ...e, texto: novo };
    d = await processarExtra(d, e.fx);
    let w = e.nw ? Math.round(e.w * (d.w / e.nw)) : e.w;
    if (w > LARGURA * 0.92) w = Math.round(LARGURA * 0.92);
    const x = Math.min(LARGURA - w / 2 - 20, Math.max(w / 2 + 20, e.x));
    return { ...e, texto: novo, src: d.src, r: d.r, nw: d.w, w, x: Math.round(x) };
  } catch { return e; }
}
const iniciaisDe = (nome?: string) => {
  const p = (nome || "").trim().split(/\s+/).filter((w) => w && !/^(de|da|do|das|dos|e|&)$/i.test(w));
  return p.length ? (p[0][0] + (p[1]?.[0] || "")).toUpperCase() : "C";
};
const fonteLogo = (b: string) => (b.startsWith("data:") || b.startsWith("http") ? b : `data:image/png;base64,${b}`);
type Caixa = { l: number; t: number; r: number; b: number };
const SEM_GUIAS = { v: [] as number[], h: [] as number[] };

export default function EditorArteCanva({ variantInicial, formatoInicial = "square", aoVoltar, projetoInicial, linkInicial, copiaDoLink, videoInicial, baixarJa }: { variantInicial: number; formatoInicial?: "square" | "story"; aoVoltar: () => void; projetoInicial?: string; linkInicial?: string; copiaDoLink?: boolean; videoInicial?: VideoPronto; baixarJa?: boolean }) {
  const navigate = useNavigate();
  const { state: fabrica, update } = useFabricaContext();
  const d0 = TRIAL_DESTINOS[1];
  const inicio = useMemo<Estado>(() => {
    if (videoInicial) {
      // vídeo: começa com a primeira cena só com o vídeo; as cenas do modelo chegam logo depois
      const av: Arte = { ...arteInicial(0, fabrica, "", ""), formato: "story", titulo: videoInicial.nome, video: `/video-fundos/${videoInicial.cena}.mp4`, cena: { livre: true, visual: videoInicial.visual || "classico", dur: 3 } };
      return { a: av, t: {}, x: [] };
    }
    const a = { ...arteInicial(variantInicial, fabrica, d0.nome, trialPhotoUrl(d0.photo, 1280)), formato: formatoInicial };
    return { a, t: ajustesDoModelo(a), x: [] };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const [hist, setHist] = useState<{ lista: Estado[]; i: number }>({ lista: [inicio], i: 0 });
  const [sujo, setSujo] = useState(false);
  const [vivo, setVivo] = useState<Estado>(inicio); // muda durante o arrasto, sem entrar no histórico
  const { a, t, x } = vivo;
  const vivoRef = useRef(vivo);
  vivoRef.current = vivo;

  const [url, setUrl] = useState("");
  const [recemMovidos, setRecemMovidos] = useState<string[]>([]);
  const [els, setEls] = useState<ArtElementBox[]>([]);
  const desenhado = useRef<ArtTweakMap>({});
  const [montando, setMontando] = useState(true);
  const [erro, setErro] = useState("");
  const [aviso, setAviso] = useState("");
  const [sel, setSel] = useState<string | null>(null);
  const [ferr, setFerr] = useState<Ferramenta | null>(null);
  const [editandoTexto, setEditandoTexto] = useState(false);
  const [abaModelos, setAbaModelos] = useState<"square" | "story">(formatoInicial);
  const [sub, setSub] = useState<Sub | null>(null);
  const [tamTxt, setTamTxt] = useState<string | null>(null);
  const [verCodigo, setVerCodigo] = useState(false);
  // vários itens escolhidos juntos (Shift+clique ou "Selecionar vários") e grupos (id -> grupo)
  const [varios, setVarios] = useState<string[]>([]);
  const [modoVarios, setModoVarios] = useState(false);
  const [grupos, setGrupos] = useState<Record<string, string>>({});
  const minis = useMiniaturas(fabrica, true);
  const palco = useRef<HTMLDivElement>(null);
  const arrasto = useRef<{ id: string; x: number; y: number; dx0: number; dy0: number; s0: number; modo: "mover" | "tamanho" | "largura" | "altura"; base: Estado; extra?: boolean; jaSel?: boolean; movido?: boolean; sx0?: number; sy0?: number; bw?: number; bh?: number; juntos?: Record<string, { x: number; y: number; extra?: boolean }>; guia?: { c0: Caixa; ax: number[]; ay: number[] } } | null>(null);
  // zoom, guias de encaixe, copiar e colar, kit de marca
  // dois dedos na tela cancelam o arrasto que tinha começado
  const { zoom, zoomRef, zona, mudarZoom, tocarZona, moverZona, soltarZona } = useZoomPalco(() => {
    const d = arrasto.current;
    if (d) { arrasto.current = null; setVivo(d.base); setGuias(SEM_GUIAS); }
  });
  const [guias, setGuias] = useState(SEM_GUIAS);
  const prancheta = useRef<{ extras: Extra[]; arte: { id: string; tw: ArtTweakMap[string] }[]; marca: string; vezes: number; modelo: string } | null>(null);
  const [temCopia, setTemCopia] = useState(false);
  // o kit fica na conta (junto com os dados da agência); o do aparelho só serve de reserva
  const [kitLocal, setKit] = useState<KitMarca>(lerKit);
  const kit: KitMarca = fabrica.kitMarca ? { cores: fabrica.kitMarca.cores || [], fonteTitulo: fabrica.kitMarca.fonteTitulo || "", fonteTexto: fabrica.kitMarca.fonteTexto || "" } : kitLocal;
  const vez = useRef(0);
  const remapeando = useRef<{ antigos: ArtElementBox[]; t: ArtTweakMap } | null>(null);
  const altura = a.formato === "story" ? 1920 : 1080;
  const [celular, setCelular] = useState(() => typeof window !== "undefined" && window.innerWidth < 1024);
  useEffect(() => { const f = () => setCelular(window.innerWidth < 1024); window.addEventListener("resize", f); return () => window.removeEventListener("resize", f); }, []);
  const painelCel = celular && !!ferr;

  // ——— histórico ———
  // conta as mudanças feitas (desfazer tira 1, refazer põe 1): diz se dá para desfazer uma mudança de cenas
  const passos = useRef(0);
  const gravar = useCallback((novo: Estado) => {
    passos.current += 1;
    setVivo(novo);
    setSujo(true);
    setHist((h) => {
      const lista = [...h.lista.slice(0, h.i + 1), novo].slice(-60);
      return { lista, i: lista.length - 1 };
    });
  }, []);
  const irPara = (i: number) => { if (i < 0 || i >= hist.lista.length) return; passos.current += i - hist.i; setVivo(hist.lista[i]); setHist({ ...hist, i }); setSel(null); };
  // mudanças em várias cenas (apagar, mover, duplicar, "usar em todas") guardam uma foto do projeto inteiro
  const fotosCenas = useRef<{ lista: Pagina[]; pag: number; passo: number }[]>([]);
  const desfazerCenas = fotosCenas.current.length > 0 && fotosCenas.current[fotosCenas.current.length - 1].passo === passos.current;
  const desfazer = () => {
    if (desfazerCenas) {
      const f = fotosCenas.current.pop()!;
      abrirPagina(f.lista, f.pag);
      setSujo(true);
      setAviso("Voltei as cenas como estavam.");
      setTimeout(() => setAviso(""), 2500);
      return;
    }
    irPara(hist.i - 1);
  };
  const refazer = () => irPara(hist.i + 1);
  const mudar = (p: Partial<Arte>) => {
    const na = { ...a, ...p };
    const mudouForma = estruturaDa(na) !== estruturaDa(a);
    if (!mudouForma) return gravar({ a: na, t, x });
    setSel(null);
    const trocouModelo = na.variant !== a.variant || na.formato !== a.formato;
    if (Object.keys(t).length) {
      if (trocouModelo) { setAviso("No modelo novo, os textos e posições que você mexeu voltam ao padrão. Use Desfazer para voltar."); setTimeout(() => setAviso(""), 5000); }
      else remapeando.current = { antigos: els, t }; // mesma arte com outro preço/inclusos: leva os ajustes para os elementos certos
    }
    gravar({ a: na, t: ajustesDoModelo(na), x: trocouModelo ? x.map((e) => (e.z == null ? e : { ...e, z: undefined })) : x });
  };
  const ajustar = (id: string, p: ArtTweakMap[string], noHistorico = true) => {
    const novo = { a, x, t: { ...t, [id]: { ...(t[id] || {}), ...p } } };
    if (noHistorico) gravar(novo); else setVivo(novo);
  };
  const ajustarExtra = (id: string, p: Partial<Extra>, noHistorico = true) => {
    const novo = { a, t, x: x.map((e) => (e.id === id ? { ...e, ...p } : e)) };
    if (noHistorico) gravar(novo); else setVivo(novo);
  };

  // ——— desenho (sempre o último pedido) ———
  const marca = useMemo(() => ({ ...fabrica }), [fabrica]);
  const chaveCamadas = x.filter((e) => e.z != null).map((e) => `${e.id}:${e.z}:${Math.round(e.x)}:${Math.round(e.y)}:${Math.round(e.w)}:${e.rot || 0}:${e.src.length}:${e.src.slice(-24)}:${e.cor || ""}:${JSON.stringify(e.fx || {})}`).join("|");
  useEffect(() => {
    const n = ++vez.current;
    setMontando(true);
    const espera = setTimeout(async () => {
      try {
        let caixas: ArtElementBox[] = [];
        const u = await comporArte(a, marca, t, (e) => { caixas = e.slice(); }, { camadas: camadasDe(vivoRef.current.x) });
        if (n !== vez.current) return;
        const pend = remapeando.current;
        if (pend && !Object.keys(t).length) {
          remapeando.current = null;
          const novoT = levarAjustes(pend.antigos, caixas, pend.t);
          if (Object.keys(novoT).length) {
            const novo = { a, t: novoT, x: vivo.x };
            setVivo(novo);
            setHist((h) => ({ ...h, lista: h.lista.map((x, i) => (i === h.i ? novo : x)) }));
            return;
          }
        }
        setUrl(u);
        setRecemMovidos([]);
        setEls(caixas);
        desenhado.current = t;
        setErro("");
      } catch {
        if (n === vez.current) setErro("Não consegui montar a arte com esta foto. Escolha outra foto.");
      }
      if (n === vez.current) setMontando(false);
    }, arrasto.current ? 90 : 220);
    return () => clearTimeout(espera);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [a, t, marca, chaveCamadas]);

  useEffect(() => { if (!sel) { setVarios([]); setModoVarios(false); } }, [sel]);
  useEffect(() => { setGrupos({}); }, [a.variant, a.formato]);

  // ——— teclado ———
  const compartRef = useRef(false);
  useEffect(() => {
    const k = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLSelectElement) return;
      if (compartRef.current) return;
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z") { e.preventDefault(); if (e.shiftKey) refazer(); else desfazer(); }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "y") { e.preventDefault(); refazer(); }
      if ((e.ctrlKey || e.metaKey) && (e.key === "=" || e.key === "+")) { e.preventDefault(); mudarZoom(zoomRef.current * 1.25); }
      if ((e.ctrlKey || e.metaKey) && e.key === "-") { e.preventDefault(); mudarZoom(zoomRef.current / 1.25); }
      if ((e.ctrlKey || e.metaKey) && e.key === "0") { e.preventDefault(); mudarZoom(1); }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "c" && sel && !editandoTexto && !window.getSelection()?.toString()) { e.preventDefault(); copiar(); }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "d" && sel && marcados.length <= 1) { e.preventDefault(); duplicar(); }
      if ((e.key === "Delete" || e.key === "Backspace") && sel) { e.preventDefault(); if (marcados.length > 1) apagarVarios(); else apagar(); }
      if (e.key === "Escape") { setSel(null); setFerr(null); }
    };
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  });
  // colar (Ctrl+V): o que foi copiado aqui dentro ou uma imagem copiada do computador
  useEffect(() => {
    const p = (e: ClipboardEvent) => {
      const alvo = e.target;
      if (alvo instanceof HTMLInputElement || alvo instanceof HTMLTextAreaElement || (alvo instanceof HTMLElement && alvo.isContentEditable)) return;
      if (compartRef.current || editandoTexto) return;
      const texto = e.clipboardData?.getData("text/plain") || "";
      const img = Array.from(e.clipboardData?.files || []).find((f) => f.type.startsWith("image/"));
      if (prancheta.current && (texto === prancheta.current.marca || !img)) { e.preventDefault(); colar(); return; }
      if (img) { e.preventDefault(); lerArquivo(img, (u) => { void porImagem(u); }); }
    };
    window.addEventListener("paste", p);
    return () => window.removeEventListener("paste", p);
  });

  // ——— arrastar e aumentar ———
  const escala = () => (palco.current?.clientWidth || LARGURA) / LARGURA;
  const existe = (id: string) => x.some((e) => e.id === id) || els.some((b) => b.id === id && !t[id]?.hidden);
  const doGrupo = (id: string) => {
    const g = grupos[id];
    return g ? Object.keys(grupos).filter((k) => grupos[k] === g && existe(k)) : [id];
  };
  const marcados = varios.length > 1 ? varios : sel ? [sel] : [];
  // escolhe o item (ou o grupo dele); somando, entra ou sai da seleção. Devolve os ids que vão andar juntos, ou null se só mudou a seleção.
  const escolher = (id: string, somar: boolean): string[] | null => {
    const membros = doGrupo(id);
    setEditandoTexto(false);
    setSub(null);
    if (somar) {
      const tem = membros.every((m) => marcados.includes(m));
      const novo = tem ? marcados.filter((m) => !membros.includes(m)) : Array.from(new Set([...marcados, ...membros]));
      setVarios(novo.length > 1 ? novo : []);
      setSel(novo.length ? (tem ? novo[novo.length - 1] : id) : null);
      return null;
    }
    if (marcados.length > 1 && marcados.includes(id)) { setSel(id); return marcados; }
    setVarios(membros.length > 1 ? membros : []);
    setSel(id);
    return membros;
  };
  const basesJuntos = (ids: string[]) => Object.fromEntries(ids.map((id) => {
    const ex = x.find((q) => q.id === id);
    return [id, ex ? { x: ex.x, y: ex.y, extra: true } : { x: t[id]?.dx || 0, y: t[id]?.dy || 0 }];
  }));
  // caixa de cada item (na medida da arte), para as guias de encaixe
  const caixaDe = (id: string, v: Estado): Caixa | null => {
    const ex = v.x.find((q) => q.id === id);
    if (ex) { const h = ex.w * ex.r; return { l: ex.x - ex.w / 2, t: ex.y - h / 2, r: ex.x + ex.w / 2, b: ex.y + h / 2 }; }
    const b = els.find((q) => q.id === id);
    if (!b || v.t[id]?.hidden) return null;
    const ox = (v.t[id]?.dx || 0) - (desenhado.current[id]?.dx || 0), oy = (v.t[id]?.dy || 0) - (desenhado.current[id]?.dy || 0);
    return { l: b.x + ox, t: b.y + oy, r: b.x + b.w + ox, b: b.y + b.h + oy };
  };
  const prepararGuias = (ids: string[], v: Estado) => {
    const cs = ids.map((id) => caixaDe(id, v)).filter((c): c is Caixa => !!c);
    if (!cs.length) return undefined;
    const c0 = { l: Math.min(...cs.map((c) => c.l)), t: Math.min(...cs.map((c) => c.t)), r: Math.max(...cs.map((c) => c.r)), b: Math.max(...cs.map((c) => c.b)) };
    const ax = [0, LARGURA / 2, LARGURA], ay = [0, altura / 2, altura];
    for (const id of [...els.map((b) => b.id), ...v.x.map((q) => q.id)]) {
      if (ids.includes(id)) continue;
      const c = caixaDe(id, v);
      if (!c || (c.r - c.l > LARGURA * 0.96 && c.b - c.t > altura * 0.96)) continue; // o fundo inteiro não conta
      ax.push(c.l, (c.l + c.r) / 2, c.r);
      ay.push(c.t, (c.t + c.b) / 2, c.b);
    }
    return { c0, ax, ay };
  };
  const comecar = (e: React.PointerEvent, box: ArtElementBox, modo: "mover" | "tamanho" | "largura" | "altura") => {
    e.preventDefault();
    e.stopPropagation();
    if (modoVideo && box.id === fotoPrincipal && !(e.shiftKey || e.ctrlKey || e.metaKey || modoVarios)) { setSel(box.id); setVarios([]); setEditandoTexto(false); setSub(null); return; }
    try { (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId); } catch { /* toque sem captura */ }
    const somar = modo === "mover" && (e.shiftKey || e.ctrlKey || e.metaKey || modoVarios);
    const jaSel = sel === box.id && modo === "mover" && marcados.length <= 1 && !somar;
    let juntos: string[] | null = [box.id];
    if (modo === "mover") juntos = escolher(box.id, somar);
    else { setSel(box.id); setVarios([]); setEditandoTexto(false); }
    if (!juntos) return;
    const cur = t[box.id] || {};
    arrasto.current = { id: box.id, x: e.clientX, y: e.clientY, dx0: cur.dx || 0, dy0: cur.dy || 0, s0: cur.scale || 1, modo, base: vivo, jaSel, sx0: cur.scaleX, sy0: cur.scaleY, bw: box.w, bh: box.h, juntos: juntos.length > 1 ? basesJuntos(juntos) : undefined, guia: modo === "mover" ? prepararGuias(juntos, vivo) : undefined };
  };
  const comecarExtra = (e: React.PointerEvent, ex: Extra, modo: "mover" | "tamanho") => {
    e.preventDefault();
    e.stopPropagation();
    try { (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId); } catch { /* toque sem captura */ }
    const somar = modo === "mover" && (e.shiftKey || e.ctrlKey || e.metaKey || modoVarios);
    const jaSel = sel === ex.id && modo === "mover" && marcados.length <= 1 && !somar;
    let juntos: string[] | null = [ex.id];
    if (modo === "mover") juntos = escolher(ex.id, somar);
    else { setSel(ex.id); setVarios([]); setEditandoTexto(false); }
    if (!juntos) return;
    arrasto.current = { id: ex.id, x: e.clientX, y: e.clientY, dx0: ex.x, dy0: ex.y, s0: ex.w, modo, base: vivo, extra: true, jaSel, juntos: juntos.length > 1 ? basesJuntos(juntos) : undefined, guia: modo === "mover" ? prepararGuias(juntos, vivo) : undefined };
  };
  const mover = (e: React.PointerEvent) => {
    const d = arrasto.current;
    if (!d) return;
    const k = escala();
    let dx = (e.clientX - d.x) / k;
    let dy = (e.clientY - d.y) / k;
    if (!d.movido && Math.abs(e.clientX - d.x) + Math.abs(e.clientY - d.y) < 6) return;
    d.movido = true;
    if (d.modo === "mover" && d.guia) {
      // encaixe: perto do meio, das bordas ou de outro item, gruda e mostra a linha rosa (Alt solta)
      const g = d.guia, c = g.c0, lim = 7 / k;
      const perto = (pts: number[], alvos: number[]) => {
        // o meio e as bordas da arte (os 3 primeiros) puxam mais forte que os outros itens
        let m: number | null = null, peso = Infinity;
        alvos.forEach((al, i) => { for (const p of pts) { const df = al - p, w = Math.abs(df) * (i < 3 ? 0.4 : 1); if (Math.abs(df) <= lim && w < peso) { m = df; peso = w; } } });
        return m;
      };
      const mx = e.altKey ? null : perto([c.l + dx, (c.l + c.r) / 2 + dx, c.r + dx], g.ax);
      const my = e.altKey ? null : perto([c.t + dy, (c.t + c.b) / 2 + dy, c.b + dy], g.ay);
      if (mx !== null) dx += mx;
      if (my !== null) dy += my;
      const bate = (pts: number[], alvos: number[]) => Array.from(new Set(alvos.filter((al) => pts.some((p) => Math.abs(p - al) < 1.01)).map(Math.round)));
      const gv = mx === null ? [] : bate([c.l + dx, (c.l + c.r) / 2 + dx, c.r + dx], g.ax);
      const gh = my === null ? [] : bate([c.t + dy, (c.t + c.b) / 2 + dy, c.b + dy], g.ay);
      setGuias((o) => (o.v.join() === gv.join() && o.h.join() === gh.join() ? o : { v: gv, h: gh }));
    }
    if (d.juntos && d.modo === "mover") {
      const b = d.juntos, v = d.base;
      const nt = { ...v.t };
      for (const [id, p] of Object.entries(b)) if (!p.extra) nt[id] = { ...(nt[id] || {}), dx: Math.round(p.x + dx), dy: Math.round(p.y + dy) };
      setVivo({ a: v.a, t: nt, x: v.x.map((q) => (b[q.id] ? { ...q, x: Math.round(b[q.id].x + dx), y: Math.round(b[q.id].y + dy) } : q)) });
      return;
    }
    if (d.extra) {
      if (d.modo === "mover") ajustarExtra(d.id, { x: Math.round(d.dx0 + dx), y: Math.round(d.dy0 + dy) }, false);
      else {
        const nw = Math.round(Math.max(60, Math.min(LARGURA * 1.2, d.s0 + (dx + dy))));
        const rr = vivoRef.current.x.find((q) => q.id === d.id)?.r || 1;
        ajustarExtra(d.id, { w: nw, x: Math.round(d.dx0 + (nw - d.s0) / 2), y: Math.round(d.dy0 + ((nw - d.s0) * rr) / 2) }, false);
      }
      return;
    }
    const lim = (v: number) => Number(Math.max(0.1, Math.min(6, v)).toFixed(3));
    if (d.modo === "mover") ajustar(d.id, { dx: Math.round(d.dx0 + dx), dy: Math.round(d.dy0 + dy) }, false);
    else if (d.modo === "largura") {
      const bw = d.bw || 300, s0 = d.sx0 ?? d.s0, sx = lim(s0 * Math.max(0.05, (bw + dx) / bw));
      ajustar(d.id, { scaleX: sx, scaleY: d.sy0 ?? d.s0, dx: Math.round(d.dx0 + (bw * (sx / s0 - 1)) / 2) }, false);
    } else if (d.modo === "altura") {
      const bh = d.bh || 300, s0 = d.sy0 ?? d.s0, sy = lim(s0 * Math.max(0.05, (bh + dy) / bh));
      ajustar(d.id, { scaleY: sy, scaleX: d.sx0 ?? d.s0, dy: Math.round(d.dy0 + (bh * (sy / s0 - 1)) / 2) }, false);
    } else {
      const bw = d.bw || 300, bh = d.bh || 300;
      const f = Math.max(0.1, 1 + (dx / bw + dy / bh) / 2);
      const sc = lim(d.s0 * f), fr = sc / d.s0;
      ajustar(d.id, { scale: sc, ...(d.sx0 !== undefined ? { scaleX: lim(d.sx0 * fr) } : {}), ...(d.sy0 !== undefined ? { scaleY: lim(d.sy0 * fr) } : {}), dx: Math.round(d.dx0 + (bw * (fr - 1)) / 2), dy: Math.round(d.dy0 + (bh * (fr - 1)) / 2) }, false);
    }
  };
  const soltar = () => {
    const d = arrasto.current;
    if (!d) return;
    arrasto.current = null;
    setGuias(SEM_GUIAS);
    if (d.movido) {
      const ids = d.juntos ? Object.keys(d.juntos) : [d.id];
      if (vivo.x.some((q) => q.z != null && ids.includes(q.id))) setRecemMovidos(ids);
      if (vivo !== d.base) gravar(vivo);
      return;
    }
    // tocou (sem arrastar) num item de vários escolhidos: fica só ele, como no Canva (grupo continua junto)
    if (d.juntos && !modoVarios && doGrupo(d.id).length <= 1) { setVarios([]); setSel(d.id); return; }
    // tocou de novo no que já estava escolhido: escreve ali mesmo, na arte
    if (d.jaSel && podeEscrever(d.id)) { setSub(null); setEditandoTexto(true); }
  };

  const extraSel = x.find((e) => e.id === sel) || null;
  const caixa = els.find((b) => b.id === sel) || null;
  const ajusteSel = (sel && t[sel]) || {};
  const textoSel = caixa?.kind === "text" ? (ajusteSel.text ?? caixa.text ?? "") : null;
  const podeEscrever = (id: string) => {
    const ex = x.find((e) => e.id === id);
    if (ex) return ex.tipo !== "imagem" && ex.tipo !== "icone" && ex.tipo !== "forma";
    return els.find((q) => q.id === id)?.kind === "text";
  };
  const corSel = extraSel ? extraSel.cor || "" : ajusteSel.color || "";
  const podeCor = extraSel ? extraSel.tipo === "texto" || extraSel.tipo === "preco" || extraSel.tipo === "letra" || extraSel.tipo === "forma" || extraSel.tipo === "rede" || (extraSel.tipo === "icone" && !iconeColorido(extraSel.icone || "")) : !!caixa && caixa.kind !== "image";
  // vários juntos: apagar, aumentar, agrupar
  const apagarVarios = () => {
    const nt = { ...t };
    for (const id of marcados) if (!x.some((q) => q.id === id)) nt[id] = { ...(nt[id] || {}), hidden: true };
    gravar({ a, t: nt, x: x.filter((q) => !marcados.includes(q.id)) });
    setSel(null);
  };
  const tamanhoVarios = (f: number) => {
    const lim = (v: number) => Number(Math.max(0.1, Math.min(6, v)).toFixed(3));
    const nt = { ...t };
    for (const id of marcados) {
      if (x.some((q) => q.id === id)) continue;
      const c = nt[id] || {};
      nt[id] = { ...c, scale: lim((c.scale || 1) * f), ...(c.scaleX !== undefined ? { scaleX: lim(c.scaleX * f) } : {}), ...(c.scaleY !== undefined ? { scaleY: lim(c.scaleY * f) } : {}) };
    }
    gravar({ a, t: nt, x: x.map((q) => (marcados.includes(q.id) ? { ...q, w: Math.round(Math.max(60, Math.min(LARGURA * 1.2, q.w * f))) } : q)) });
  };
  const gruposSel = new Set(marcados.map((id) => grupos[id] || ""));
  const ehGrupo = marcados.length > 1 && gruposSel.size === 1 && !gruposSel.has("") && doGrupo(marcados[0]).length === marcados.length;
  const agrupar = () => {
    const g = `g_${Date.now()}`;
    setGrupos({ ...grupos, ...Object.fromEntries(marcados.map((id) => [id, g])) });
  };
  const desagrupar = () => {
    const ng = { ...grupos };
    for (const id of marcados) delete ng[id];
    setGrupos(ng);
  };
  const apagar = () => {
    if (extraSel) { gravar({ a, t, x: x.filter((e) => e.id !== extraSel.id) }); setSel(null); return; }
    if (sel) { ajustar(sel, { hidden: true }); setSel(null); }
  };
  const novoExtra = (e: Omit<Extra, "id" | "x" | "y">, op: { x?: number; y?: number; escolher?: boolean } = {}) => {
    const v = vivoRef.current;
    // cada item novo cai um pouco ao lado do anterior, para não ficar um em cima do outro
    const n = v.x.length % 5;
    let livreY: number | undefined;
    if (modoVideo && op.y == null) {
      // no vídeo: procura uma faixa livre na tela, a mais perto do meio (ou da faixa escura)
      const h = e.w * e.r, ocup = v.x.filter((q) => q.z == null).map((q) => [q.y - (q.w * q.r) / 2 - 16, q.y + (q.w * q.r) / 2 + 16]);
      const meio = v.a.cena?.livre && v.a.cena.visual === "faixa" ? altura * (ALTURA_FAIXA + (1 - ALTURA_FAIXA) / 2) : altura / 2;
      const opcoes: number[] = [];
      for (let y = Math.round(h / 2 + altura * 0.1); y <= altura * 0.9 - h / 2; y += 20) if (!ocup.some(([t0, t1]) => y + h / 2 > t0 && y - h / 2 < t1)) opcoes.push(y);
      livreY = opcoes.sort((p, q) => Math.abs(p - meio) - Math.abs(q - meio))[0];
    }
    const ex: Extra = { ...e, id: `x_${Date.now()}_${Math.round(Math.random() * 1000)}`, x: op.x ?? (livreY != null ? LARGURA / 2 : LARGURA / 2 + (n % 2 ? 1 : -1) * n * 40), y: op.y ?? livreY ?? altura / 2 + n * 50 - 100 };
    const novo = { ...v, x: [...v.x, ex] };
    vivoRef.current = novo;
    gravar(novo);
    if (op.escolher === false) return ex.id;
    setSub(null);
    setSel(ex.id);
    if (celular) setFerr(null);
    return ex.id;
  };
  const duplicar = () => {
    if (extraSel) { const ex = { ...extraSel, id: `x_${Date.now()}`, x: extraSel.x + 40, y: extraSel.y + 40 }; gravar({ a, t, x: [...x, ex] }); setSel(ex.id); return; }
    if (!sel) return;
    const id = `copia_${Date.now()}`;
    gravar({ a, x, t: { ...t, [id]: { ...ajusteSel, hidden: undefined, cloneOf: ajusteSel.cloneOf || sel, dx: (ajusteSel.dx || 0) + 30, dy: (ajusteSel.dy || 0) + 30 } } });
    setSel(id);
  };
  // copiar e colar (também entre páginas)
  const avisarRapido = (m: string) => { setAviso(m); setTimeout(() => setAviso((v) => (v === m ? "" : v)), m.length > 70 ? 6500 : 3500); };
  const copiar = () => {
    if (!marcados.length) return;
    const extras = x.filter((q) => marcados.includes(q.id)).map((q) => ({ ...q }));
    const arte = marcados.filter((id) => !x.some((q) => q.id === id)).map((id) => ({ id, tw: { ...(t[id] || {}) } }));
    prancheta.current = { extras, arte, marca: `canva-viagem:${Date.now()}`, vezes: 0, modelo: `${a.variant}-${a.formato}` };
    setTemCopia(true);
    try { void navigator.clipboard?.writeText(prancheta.current.marca).catch(() => undefined); } catch { /* sem acesso à área de transferência */ }
    avisarRapido(marcados.length > 1 ? `${marcados.length} itens copiados. Toque em Colar aqui ou em outra página.` : "Copiado. Toque em Colar aqui ou em outra página.");
  };
  const colar = () => {
    const p = prancheta.current;
    if (!p) return;
    const aqui = p.extras.some((q) => x.some((w) => w.id === q.id)) || p.arte.some((q) => caixaDe(q.id, vivo));
    p.vezes = aqui ? p.vezes + 1 : 0;
    const off = aqui ? 40 * p.vezes : 0, st = Date.now();
    const novos = p.extras.map((q, i) => ({ ...q, id: `x_${st}_${i}`, x: q.x + off, y: q.y + off }));
    const nt = { ...t };
    const ids = novos.map((q) => q.id);
    let fora = 0;
    p.arte.forEach((q, i) => {
      const base = q.tw.cloneOf || q.id;
      if (p.modelo !== `${a.variant}-${a.formato}` || !els.some((b) => b.id === base)) { fora++; return; }
      const id = `copia_${st}_${i}`;
      nt[id] = { ...q.tw, hidden: undefined, cloneOf: base, dx: (q.tw.dx || 0) + off, dy: (q.tw.dy || 0) + off };
      ids.push(id);
    });
    if (!ids.length) { avisarRapido("Partes do modelo só passam para uma página com o mesmo modelo. Textos, formas, ícones e imagens que você pôs passam para qualquer página."); return; }
    gravar({ a, t: nt, x: [...x, ...novos] });
    setVarios(ids.length > 1 ? ids : []);
    setSel(ids[ids.length - 1]);
    if (fora) avisarRapido("Colado. As partes do modelo da outra página ficaram de fora: elas só passam para uma página com o mesmo modelo.");
  };
  // kit de marca
  const coresMarca = Array.from(new Set((kit.cores.length ? kit.cores : [corHex(fabrica.primaryColor), corHex(fabrica.secondaryColor)]).filter(Boolean).map((c) => c.toUpperCase())));
  const mudarKit = (p: Partial<KitMarca>) => {
    const novo = { ...kit, cores: coresMarca, ...p };
    setKit(novo);
    update({ kitMarca: novo });
    try { localStorage.setItem(KIT, JSON.stringify(novo)); } catch { /* sem espaço */ }
  };
  const usarKit = async () => {
    const fontes = [kit.fonteTitulo, kit.fonteTexto].filter(Boolean);
    if (fontes.length) {
      await carregarFontes();
      await Promise.all(fontes.flatMap((f) => [400, 700, 800, 900].map((w) => document.fonts.load(`${w} 60px "${f}"`).catch(() => null))));
    }
    // os textos grandes (o maior e os que chegam perto dele) são os títulos; o resto usa a fonte do texto
    const textos = els.filter((b) => b.kind === "text" && !t[b.id]?.hidden);
    const tam = (b: ArtElementBox) => (b.fontSize || b.h) * (t[b.id]?.scale || 1);
    const maior = Math.max(0, ...textos.map(tam));
    const titulos = textos.filter((b) => tam(b) >= maior * 0.6);
    const na = { ...a, ...(coresMarca[0] ? { cor1: coresMarca[0] } : {}), ...(coresMarca[1] ? { cor2: coresMarca[1] } : {}), ...(kit.fonteTexto || kit.fonteTitulo ? { fonte: kit.fonteTexto || kit.fonteTitulo } : {}) };
    const nt = { ...t };
    for (const b of textos) {
      const fam = titulos.includes(b) && kit.fonteTitulo ? kit.fonteTitulo : kit.fonteTexto ? undefined : nt[b.id]?.fontFamily;
      if (fam !== nt[b.id]?.fontFamily) nt[b.id] = { ...(nt[b.id] || {}), fontFamily: fam };
    }
    gravar({ a: na, t: nt, x });
    avisarRapido("Kit de marca aplicado nesta arte. Use Desfazer para voltar.");
  };
  // posição na tela: a caixa desenhada + o quanto já arrastou desde o último desenho
  const pos = (b: ArtElementBox) => {
    const agora = t[b.id] || {}, antes = desenhado.current[b.id] || {};
    const ox = (agora.dx || 0) - (antes.dx || 0), oy = (agora.dy || 0) - (antes.dy || 0);
    return { left: `${((b.x + ox) / LARGURA) * 100}%`, top: `${((b.y + oy) / altura) * 100}%`, width: `${(b.w / LARGURA) * 100}%`, height: `${(b.h / altura) * 100}%` };
  };

  // ——— foto ———
  const [fotos, setFotos] = useState<{ url: string; thumb: string }[]>([]);
  const [busca, setBusca] = useState("");
  const [buscando, setBuscando] = useState(false);
  const buscaVez = useRef(0);
  async function buscarFotos(q = busca || a.destino) {
    if (q.trim().length < 3) return;
    const vezBusca = ++buscaVez.current;
    setBuscando(true);
    try {
      const achadas = await fetchDestinationPhotos(q.trim(), "pexels");
      if (vezBusca !== buscaVez.current) return;
      setFotos(achadas.slice(0, 18).map((f) => ({ url: f.url, thumb: f.thumb || f.url })));
      if (!achadas.length) setErro("Não achei fotos desse lugar. Tente outro nome ou envie a sua foto.");
    } catch {
      setErro("A busca de fotos não respondeu. Tente de novo ou envie a sua foto.");
    }
    setBuscando(false);
  }
  const lerArquivo = (f: File, fazer: (dataUrl: string) => void) => {
    const r = new FileReader();
    r.onload = () => typeof r.result === "string" && fazer(r.result);
    r.readAsDataURL(f);
  };

  // ——— elementos (redes sociais e imagens a mais) ———
  const [textoRede, setTextoRede] = useState<Partial<Record<Rede, string>>>({});
  const textoDaRede = (rede: Rede) => textoRede[rede] ?? (rede === "whatsapp" ? fabrica.whatsapp || "" : rede === "instagram" ? fabrica.instagram || "" : "");
  const porRede = async (rede: Rede) => {
    const tx = textoDaRede(rede);
    const selo = await seloRede(rede, tx);
    novoExtra({ tipo: "rede", rede, texto: tx, src: selo.src, nw: selo.w, w: Math.round(Math.min(LARGURA * 0.6, Math.max(120, selo.w * 0.8))), r: selo.r });
  };
  // a rede ainda não está na arte: entra sozinha no canto de baixo, uma em cima da outra
  const criandoRede = useRef<Set<Rede>>(new Set());
  const ultimoTextoRede = useRef<Partial<Record<Rede, string>>>({});
  const criarSeloSozinho = async (rede: Rede) => {
    if (criandoRede.current.has(rede)) return;
    criandoRede.current.add(rede);
    try {
      const tx = ultimoTextoRede.current[rede] || "";
      const selo = await seloRede(rede, tx);
      const w = Math.round(Math.min(LARGURA * 0.6, Math.max(120, selo.w * 0.8))), h = w * selo.r;
      const k = vivoRef.current.x.filter((e) => e.tipo === "rede").length;
      const id = novoExtra({ tipo: "rede", rede, texto: tx, src: selo.src, nw: selo.w, w, r: selo.r }, { x: Math.round(40 + w / 2), y: Math.round(Math.max(h / 2 + 40, altura - 60 - h / 2 - k * (h + 16))), escolher: false });
      const agora = ultimoTextoRede.current[rede] || "";
      if (agora !== tx) await redesenharExtra(id, { texto: agora });
      gravar(vivoRef.current);
    } catch {
      setErro("Não consegui pôr essa rede na arte. Toque no botão da rede para tentar de novo.");
    } finally {
      criandoRede.current.delete(rede);
    }
  };
  // escrever no campo muda também o selo dessa rede que já está na arte
  const mudarTextoRede = (rede: Rede, tx: string) => {
    setTextoRede((q) => ({ ...q, [rede]: tx }));
    if (rede === "whatsapp") update({ whatsapp: tx });
    if (rede === "instagram") update({ instagram: tx });
    ultimoTextoRede.current[rede] = tx;
    const naArte = vivoRef.current.x.filter((e) => e.tipo === "rede" && e.rede === rede);
    naArte.forEach((e) => { redesenharExtra(e.id, { texto: tx }); });
    if (!naArte.length && tx.trim() && rede !== "whatsapp" && rede !== "instagram") criarSeloSozinho(rede);
  };
  const [buscaIcone, setBuscaIcone] = useState("");
  const [icones, setIcones] = useState<string[]>([]);
  const [buscandoIcone, setBuscandoIcone] = useState(false);
  async function procurarIcones(q = buscaIcone) {
    if (q.trim().length < 2) return;
    setBuscaIcone(q);
    setBuscandoIcone(true);
    try {
      const achados = await buscarIcones(q);
      setIcones(achados);
      if (!achados.length) setErro("Não achei ícones com essa palavra. Tente outra (ex.: avião, praia, mala).");
    } catch {
      setErro("A busca de ícones não respondeu. Tente de novo.");
    }
    setBuscandoIcone(false);
  }
  async function porIcone(nome: string) {
    try {
      const cor = iconeColorido(nome) ? undefined : a.cor2;
      const d = await desenharIcone(nome, cor);
      setErro("");
      novoExtra({ tipo: "icone", icone: nome, cor, src: d.src, nw: d.w, w: 180, r: d.r });
    } catch {
      setErro("Não consegui pôr esse ícone. Tente outro.");
    }
  }
  const [preparando, setPreparando] = useState(false);
  async function porImagem(src: string, mascara?: string) {
    setPreparando(true);
    try {
      const p = await prepararImagem(src);
      // com forma (moldura): já entra recortada no formato escolhido
      const d = mascara ? await processarExtra({ src: p.src, w: p.w, r: p.r }, { mascara }) : { src: p.src, w: p.w, r: p.r };
      novoExtra({ tipo: "imagem", src: d.src, base: p.src, nw: d.w, w: Math.round(LARGURA * 0.42), r: d.r, ...(mascara ? { fx: { mascara } } : {}) });
    } catch {
      setErro("Não consegui usar esta imagem. Tente outra.");
    }
    setPreparando(false);
  }
  function porForma(id: string) {
    const fm = formaPorId(id);
    if (!fm) return;
    const cor = a.cor2 || AMARELO;
    // moldura entra grande (a tela toda no story) e desenhada em alta para a linha fina não borrar
    const moldura = id.startsWith("moldura-");
    const d = desenharForma(fm, cor, moldura ? 1920 : 640);
    setErro("");
    const w = moldura ? Math.round(LARGURA * (fm.h > fm.w * 1.5 ? (altura >= 1900 ? 1 : 0.5) : 0.8)) : fm.linha ? Math.round(LARGURA * 0.4) : Math.round(LARGURA * 0.24);
    novoExtra({ tipo: "forma", base: d.src, cor, src: d.src, nw: d.w, w, r: d.r, forma: id, esp: 1 }, moldura ? { x: LARGURA / 2, y: altura / 2 } : {});
  }
  // formas de imagem: toque numa forma com uma foto escolhida = a foto ganha a forma; sem foto = escolher uma
  const inputMoldura = useRef<HTMLInputElement>(null);
  const molduraPend = useRef<string>("");
  const [formasAbertas, setFormasAbertas] = useState<string | null>(null);
  const [maisRedes, setMaisRedes] = useState(false);
  // ——— redesenhar um extra quando o texto, o preço ou a cor mudam ———
  const desenhoPendente = useRef<Promise<void> | null>(null);
  const vezDesenho = useRef<Record<string, number>>({});
  const redesenharExtra = (id: string, p: Partial<Extra>): Promise<void> => {
    const atual = vivoRef.current.x.find((e) => e.id === id);
    if (!atual) return Promise.resolve();
    const n = { ...atual, ...p };
    const e1 = { ...vivoRef.current, x: vivoRef.current.x.map((e) => (e.id === id ? n : e)) };
    vivoRef.current = e1;
    setVivo(e1);
    const minha = (vezDesenho.current[id] = (vezDesenho.current[id] || 0) + 1);
    const job = (async () => {
      let d: { src: string; w: number; r: number } | null = null;
      let fonteBase = "";
      try {
        if (n.tipo === "rede" && n.rede) d = await seloRede(n.rede, n.texto || "", n.modelo, n.cor);
        else if (n.tipo === "letra") d = await desenharLetra(n.texto || " ", n.fonte || '800 80px "Montserrat"', n.cor || "#111111", n.ls || 0);
        else if (n.tipo === "forma" && n.forma && formaPorId(n.forma)) {
          // forma do menu: desenha de novo na cor e na espessura escolhidas (moldura em alta, como quando entra)
          d = desenharForma(formaComEspessura(formaPorId(n.forma)!, n.esp ?? 1), n.cor || AMARELO, n.forma.startsWith("moldura-") ? 1920 : 640);
        }
        else if (n.tipo === "forma" && n.base) {
          if (n.cor) d = await tingirForma(n.base, n.cor);
          else { const img = await carregarImagem(n.base); d = { src: n.base, w: img.naturalWidth, r: img.naturalHeight / img.naturalWidth }; }
        }
        else if (n.tipo === "texto" && n.estilo) {
          // textos do vídeo: título, destaque, etiqueta e pílula ficam sempre em MAIÚSCULAS (como no modelo)
          const caixaAlta = /^cena(Titulo|Amarelo|Etiqueta|Pilula|Numero|Pequeno)$/.test(n.estilo);
          let txt = caixaAlta ? (n.texto || " ").toLocaleUpperCase("pt-BR") : n.texto || " ";
          d = await desenharTexto(n.estilo, txt, n.cor);
          // frase longa numa linha só: quebra em linhas do mesmo tamanho em vez de encolher a letra
          const escala = atual.nw ? atual.w / atual.nw : 0;
          if (escala && !txt.includes("\n") && d.w * escala > LARGURA * 0.92) {
            const maxChars = Math.max(8, Math.floor(txt.length * ((LARGURA * 0.88) / (d.w * escala))));
            const quebrado = linhasIguais(txt, maxChars);
            if (quebrado !== txt) { txt = quebrado; d = await desenharTexto(n.estilo, txt, n.cor); }
          }
        }
        else if (n.tipo === "preco" && n.estilo && n.preco) d = await desenharPreco(n.estilo, n.preco, n.cor);
        else if (n.tipo === "icone" && n.icone) d = await desenharIcone(n.icone, n.cor);
        else if (n.tipo === "imagem") {
          fonteBase = n.base || atual.src;
          const img = await carregarImagem(fonteBase);
          d = { src: fonteBase, w: img.naturalWidth, r: img.naturalHeight / img.naturalWidth };
        }
        if (d) d = await processarExtra(d, n.fx);
      } catch { d = null; }
      if (!d || minha !== vezDesenho.current[id]) return;
      const v = vivoRef.current, cur = v.x.find((e) => e.id === id);
      if (!cur) return;
      let w = cur.nw ? Math.round(cur.w * (d.w / cur.nw)) : cur.tipo === "rede" ? Math.round((cur.w * cur.r) / d.r) : cur.w;
      // texto que cresceu ao escrever não passa da borda: diminui para caber (e volta para dentro)
      let xCentro = cur.x;
      if ((cur.tipo === "texto" || cur.tipo === "preco" || cur.tipo === "letra") && w > LARGURA * 0.92) w = Math.round(LARGURA * 0.92);
      if (cur.tipo === "texto" || cur.tipo === "preco" || cur.tipo === "letra") xCentro = Math.min(LARGURA - w / 2 - 20, Math.max(w / 2 + 20, cur.x));
      // texto de vídeo que ganhou linha: o topo fica no lugar e o que está embaixo desce junto (nada fica por cima)
      const hAntes = cur.w * cur.r, hDepois = w * d.r, desce = cur.tipo === "texto" && /^cena/.test(cur.estilo || "") ? Math.round(hDepois - hAntes) : 0;
      const empurra = (e: Extra) => desce !== 0 && e.id !== id && e.z == null && e.y > cur.y + 4 && Math.abs(e.x - cur.x) < (e.w + cur.w) / 2;
      const e2 = { ...v, x: v.x.map((e) => (e.id === id ? { ...cur, src: d!.src, r: d!.r, nw: d!.w, w, ...(desce ? { y: Math.round(cur.y + desce / 2) } : {}), ...(cur.tipo === "rede" ? { x: Math.round(cur.x - cur.w / 2 + w / 2) } : xCentro !== cur.x ? { x: Math.round(xCentro) } : {}), ...(cur.tipo === "imagem" && !cur.base && fonteBase ? { base: fonteBase } : {}) } : empurra(e) ? { ...e, y: e.y + desce } : e)) };
      vivoRef.current = e2;
      setVivo(e2);
    })();
    desenhoPendente.current = job;
    return job;
  };
  const terminarEdicao = async () => {
    if (!editandoTexto) return;
    setEditandoTexto(false);
    if (desenhoPendente.current) await desenhoPendente.current;
    if (vivoRef.current !== hist.lista[hist.i]) gravar(vivoRef.current);
  };
  const aplicarCor = async (c: string) => {
    if (!sel) return;
    if (extraSel) { await redesenharExtra(extraSel.id, { cor: c || undefined, fx: { ...(extraSel.fx || {}), grad: undefined } }); gravar(vivoRef.current); return; }
    ajustar(sel, { color: c || undefined, gradient: undefined });
  };
  const precoInicial = (id: string): Preco => ({
    prefixo: id === "depor" ? "" : a.prefixo || "a partir de",
    parcelas: id === "pix" ? "" : a.parcelas || "10x",
    valor: a.preco.trim() || "249",
    sufixo: a.complemento || "por pessoa",
    antes: "",
  });
  async function porTexto(id: string) {
    const est = [...ESTILOS_CENA, ...ESTILOS_TEXTO].find((e) => e.id === id)!;
    const d = await desenharTexto(id, est.texto);
    novoExtra({ tipo: "texto", estilo: id, texto: est.texto, src: d.src, nw: d.w, w: Math.round(Math.min(LARGURA * 0.62, d.w * 0.9)), r: d.r });
  }
  async function porPreco(id: string) {
    const p = precoInicial(id);
    const d = await desenharPreco(id, p);
    novoExtra({ tipo: "preco", estilo: id, preco: p, src: d.src, nw: d.w, w: Math.round(Math.min(LARGURA * 0.46, d.w * 0.8)), r: d.r });
  }
  const [previas, setPrevias] = useState<Record<string, string>>({});
  useEffect(() => {
    if (ferr !== "texto" && ferr !== "preco") return;
    let ativo = true;
    (async () => {
      if (ferr === "texto") {
        for (const e of [...ESTILOS_CENA, ...ESTILOS_TEXTO]) {
          if (previas[`t_${e.id}`]) continue;
          const d = await desenharTexto(e.id, e.texto);
          if (!ativo) return;
          setPrevias((p) => ({ ...p, [`t_${e.id}`]: d.src }));
        }
      } else {
        for (const e of ESTILOS_PRECO) {
          const d = await desenharPreco(e.id, precoInicial(e.id));
          if (!ativo) return;
          setPrevias((p) => ({ ...p, [`p_${e.id}`]: d.src }));
        }
      }
    })();
    return () => { ativo = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ferr]);
  const [novoIncluso, setNovoIncluso] = useState("");
  const porIncluso = () => {
    const tx = novoIncluso.trim();
    if (!tx || a.inclusos.includes(tx)) return;
    if (a.inclusos.length >= 6) { setAviso("A arte mostra até 6 itens. Tire um para pôr outro."); setTimeout(() => setAviso(""), 4000); return; }
    mudar({ inclusos: [...a.inclusos, tx] });
    setNovoIncluso("");
  };
  const [hex1, setHex1] = useState("");
  const [hex2, setHex2] = useState("");
  const corValida = (v: string) => { const h = v.trim().replace(/^#?/, "#"); return /^#[0-9a-f]{6}$/i.test(h) ? h.toUpperCase() : /^#[0-9a-f]{3}$/i.test(h) ? ("#" + h.slice(1).split("").map((c) => c + c).join("")).toUpperCase() : ""; };
  const [baixando, setBaixando] = useState(false);
  async function baixar() {
    if (!url || montando) return;
    setBaixando(true);
    try {
      const final = x.length ? await juntarArte(url, x, LARGURA, altura) : url;
      const link = document.createElement("a");
      link.href = final;
      link.download = nomeArquivo;
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch {
      setErro("Não consegui juntar os elementos na arte. Tire a imagem que você pôs e tente de novo.");
    }
    setBaixando(false);
  }

  // ——— o que está escolhido e as opções de cada tipo (no jeito do Canva) ———
  // caixa na tela já com o arrasto que ainda não foi redesenhado
  const caixaAtual = (b: ArtElementBox) => {
    const agora = t[b.id] || {}, antes = desenhado.current[b.id] || {};
    return { x: b.x + (agora.dx || 0) - (antes.dx || 0), y: b.y + (agora.dy || 0) - (antes.dy || 0), w: b.w, h: b.h };
  };
  const ordemDesenho = (lista: ArtElementBox[]) =>
    lista.map((b, i) => ({ b, i, z: Number(t[b.id]?.z) || 0 })).sort((p, q) => (p.z === q.z ? p.i - q.i : p.z - q.z)).map((p) => p.b);
  const fotoPrincipal = els.filter((b) => b.kind === "image").sort((p, q) => q.w * q.h - p.w * p.h)[0]?.id;
  type TipoSel = "textoArte" | "bloco" | "imagemArte" | "texto" | "preco" | "rede" | "icone" | "imagem" | "letra" | "forma";
  const tipoSel: TipoSel | null = extraSel ? extraSel.tipo : caixa ? (caixa.kind === "text" ? "textoArte" : caixa.kind === "image" ? "imagemArte" : "bloco") : null;
  const ehTextoArte = tipoSel === "textoArte";
  const iconeMono = extraSel?.tipo === "icone" && !iconeColorido(extraSel.icone || "");
  const fxSel: ArtEffect | undefined = extraSel ? extraSel.fx?.efeito : sel ? t[sel]?.effect : undefined;
  const opacSel = extraSel ? extraSel.fx?.opacidade ?? 1 : sel ? t[sel]?.opacity ?? 1 : 1;
  const recorteSel = (extraSel ? extraSel.fx?.recorte : sel ? t[sel]?.crop : undefined) || { l: 0, t: 0, r: 0, b: 0 };
  const filtroSel = extraSel ? extraSel.fx?.filtro || "" : sel ? t[sel]?.filter || "" : "";
  const gradSel = extraSel ? extraSel.fx?.grad : sel ? t[sel]?.gradient : undefined;
  // efeito, transparência, corte, filtro e degradê de um item (true = entra no histórico)
  const mudarFx = (p: Partial<FxExtra>, noHistorico = true) => {
    if (!sel) return;
    if (extraSel) {
      const job = redesenharExtra(extraSel.id, { fx: { ...(extraSel.fx || {}), ...p } });
      if (noHistorico) job.then(() => gravar(vivoRef.current));
      return;
    }
    const q: ArtTweakMap[string] = {};
    if ("efeito" in p) q.effect = p.efeito;
    if ("opacidade" in p) q.opacity = p.opacidade;
    if ("recorte" in p) q.crop = p.recorte;
    if ("filtro" in p) q.filter = p.filtro || undefined;
    if ("grad" in p) q.gradient = p.grad;
    ajustar(sel, q, noHistorico);
  };
  const usarMoldura = (id: string) => {
    if (extraSel?.tipo === "imagem") { mudarFx({ mascara: id || undefined }); return; }
    molduraPend.current = id;
    inputMoldura.current?.click();
  };
  const aplicarDegrade = (g: [string, string]) => {
    if (!sel) return;
    if (extraSel) { mudarFx({ grad: g }); return; }
    ajustar(sel, { gradient: g, color: undefined });
  };
  // tamanho: a fonte do texto (px da arte) ou a largura do item
  const tamanhoAtual = (): number | null => {
    if (extraSel) return Math.round(extraSel.w);
    if (caixa?.kind === "text" && caixa.fontSize) return Math.round(caixa.fontSize * (ajusteSel.scale || 1) * 10) / 10;
    return null;
  };
  // aumenta mantendo o canto de cima à esquerda no lugar (como no Canva)
  const escalarArte = (k: number) => {
    if (!sel || !caixa) return;
    const b = caixaAtual(caixa);
    const lim = (v: number) => Number(Math.max(0.05, Math.min(10, v)).toFixed(4));
    ajustar(sel, {
      scale: lim((ajusteSel.scale || 1) * k),
      ...(ajusteSel.scaleX !== undefined ? { scaleX: lim(ajusteSel.scaleX * k) } : {}),
      ...(ajusteSel.scaleY !== undefined ? { scaleY: lim(ajusteSel.scaleY * k) } : {}),
      dx: Math.round((ajusteSel.dx || 0) + (b.w * (k - 1)) / 2),
      dy: Math.round((ajusteSel.dy || 0) + (b.h * (k - 1)) / 2),
    });
  };
  const porTamanho = (v: number) => {
    if (!sel || !Number.isFinite(v) || v <= 0) return;
    if (extraSel) {
      const nw = Math.round(Math.max(30, Math.min(LARGURA * 1.5, v)));
      ajustarExtra(extraSel.id, { w: nw, x: Math.round(extraSel.x + (nw - extraSel.w) / 2), y: Math.round(extraSel.y + ((nw - extraSel.w) * extraSel.r) / 2) });
      return;
    }
    if (caixa?.kind === "text" && caixa.fontSize) escalarArte(v / caixa.fontSize / (ajusteSel.scale || 1));
  };
  const boxSel = () => (extraSel
    ? { x: extraSel.x - extraSel.w / 2, y: extraSel.y - (extraSel.w * extraSel.r) / 2, w: extraSel.w, h: extraSel.w * extraSel.r }
    : caixa ? caixaAtual(caixa) : null);
  const moverPara = (nx: number, ny: number) => {
    const b = boxSel();
    if (!b || !sel) return;
    if (extraSel) { ajustarExtra(extraSel.id, { x: Math.round(nx + b.w / 2), y: Math.round(ny + b.h / 2) }); return; }
    ajustar(sel, { dx: Math.round((ajusteSel.dx || 0) + nx - b.x), dy: Math.round((ajusteSel.dy || 0) + ny - b.y) });
  };
  const MARGEM = 40;
  const alinharPagina = (onde: "cima" | "meio" | "baixo" | "esq" | "centro" | "dir") => {
    const b = boxSel();
    if (!b) return;
    const nx = onde === "esq" ? MARGEM : onde === "centro" ? (LARGURA - b.w) / 2 : onde === "dir" ? LARGURA - MARGEM - b.w : b.x;
    const ny = onde === "cima" ? MARGEM : onde === "meio" ? (altura - b.h) / 2 : onde === "baixo" ? altura - MARGEM - b.h : b.y;
    moverPara(nx, ny);
  };
  const [travado, setTravado] = useState(true);
  const porLargura = (v: number) => {
    const b = boxSel();
    if (!b || !sel || v < 4) return;
    if (extraSel) { porTamanho(v); return; }
    const k = v / b.w;
    if (travado || tipoSel !== "bloco") { escalarArte(k); return; }
    ajustar(sel, { scaleX: Number(((ajusteSel.scaleX ?? ajusteSel.scale ?? 1) * k).toFixed(4)), scaleY: ajusteSel.scaleY ?? ajusteSel.scale ?? 1, dx: Math.round((ajusteSel.dx || 0) + (b.w * (k - 1)) / 2) });
  };
  const porAltura = (v: number) => {
    const b = boxSel();
    if (!b || !sel || v < 4) return;
    if (extraSel) { porTamanho(v / extraSel.r); return; }
    const k = v / b.h;
    if (travado || tipoSel !== "bloco") { escalarArte(k); return; }
    ajustar(sel, { scaleY: Number(((ajusteSel.scaleY ?? ajusteSel.scale ?? 1) * k).toFixed(4)), scaleX: ajusteSel.scaleX ?? ajusteSel.scale ?? 1, dy: Math.round((ajusteSel.dy || 0) + (b.h * (k - 1)) / 2) });
  };
  const girar = (v: number, noHistorico = true) => {
    if (!sel) return;
    if (extraSel) ajustarExtra(extraSel.id, { rot: v || undefined }, noHistorico);
    else ajustar(sel, { rotate: v || undefined }, noHistorico);
  };
  // fim de um arrasto de barrinha (transparência, força, giro…): entra no histórico uma vez só
  const fimSlider = async () => {
    if (desenhoPendente.current) await desenhoPendente.current;
    if (vivoRef.current !== hist.lista[hist.i]) gravar(vivoRef.current);
  };
  // camadas: a arte e os itens que a pessoa pôs numa fila só, de baixo para cima.
  // Item abaixo de algum elemento da arte ganha z e o motor desenha ele no meio da arte.
  type ItemPilha = { id: string; b?: ArtElementBox; extra?: Extra };
  const pilha = (): ItemPilha[] => {
    const arte = ordemDesenho(els.filter((b) => !t[b.id]?.hidden)).map((b, i) => ({ id: b.id, b, extra: undefined as Extra | undefined, z: Number.isFinite(t[b.id]?.z as number) ? (t[b.id]!.z as number) : 0, i }));
    const dentro = x.filter((e) => e.z != null).map((e, i) => ({ id: e.id, b: undefined as ArtElementBox | undefined, extra: e, z: e.z as number, i: 1000 + i }));
    const meio = [...arte, ...dentro].sort((p, q) => (p.z === q.z ? p.i - q.i : p.z - q.z));
    return [...meio.map(({ id, b, extra }) => ({ id, b, extra })), ...x.filter((e) => e.z == null).map((e) => ({ id: e.id, extra: e }))];
  };
  const aplicarPilha = (ids: string[]) => {
    const ehArte = (id: string) => els.some((b) => b.id === id);
    let ultimaArte = -1;
    ids.forEach((id, k) => { if (ehArte(id)) ultimaArte = k; });
    const nt = { ...t };
    const zExtra: Record<string, number | undefined> = {};
    ids.forEach((id, k) => {
      if (ehArte(id)) nt[id] = { ...(nt[id] || {}), z: k };
      else zExtra[id] = k <= ultimaArte ? k : undefined;
    });
    const porId = new Map(x.map((e) => [e.id, e]));
    const nx: Extra[] = ids.filter((id) => porId.has(id)).map((id) => ({ ...porId.get(id)!, z: zExtra[id] }));
    for (const e of x) if (!ids.includes(e.id)) nx.push(e);
    gravar({ a, t: nt, x: nx });
  };
  // a foto que cobre a arte inteira fica sempre embaixo: "para o fundo" para logo acima dela
  const ehFundoDaArte = (id: string) => { const b = els.find((q) => q.id === id); return !!b && (b.w * b.h >= LARGURA * altura * 0.8 || (b.kind === "image" && b.w * b.h >= LARGURA * altura * 0.4)); };
  const camada = (acao: "frente" | "tras" | "topo" | "fundo") => {
    if (!sel) return;
    const ids = pilha().map((p) => p.id);
    const i = ids.indexOf(sel);
    if (i < 0) return;
    let piso = 0;
    while (piso < ids.length && ids[piso] !== sel && ehFundoDaArte(ids[piso])) piso++;
    ids.splice(i, 1);
    const n = ids.length;
    const j = acao === "topo" ? n : acao === "fundo" ? Math.min(piso, n) : acao === "frente" ? Math.min(n, i + 1) : Math.max(Math.min(piso, i), i - 1);
    ids.splice(j, 0, sel);
    aplicarPilha(ids);
  };
  // fonte de um texto só
  const trocarFonte = async (fam: string) => {
    if (!sel) return;
    if (fam) {
      await carregarFontes();
      await Promise.all([400, 700, 800, 900].map((w) => document.fonts.load(`${w} 60px "${fam}"`).catch(() => null)));
    }
    ajustar(sel, { fontFamily: fam || undefined });
  };
  const negritoAtivo = caixa?.kind === "text" ? ajusteSel.bold ?? (caixa.fontWeight || 400) >= 600 : false;
  const italicoAtivo = caixa?.kind === "text" ? ajusteSel.italic ?? !!caixa.italic : false;
  const alinhSel = (ajusteSel.align || caixa?.align || "left").replace("start", "left").replace("end", "right");
  const proxAlinh = ({ left: "right", right: "center", center: "left" } as Record<string, "left" | "right" | "center">)[alinhSel] || "left";
  const IconeAlinh = alinhSel === "center" ? AlignCenter : alinhSel === "right" ? AlignRight : AlignLeft;
  const nomeAlinh = alinhSel === "center" ? "Centro" : alinhSel === "right" ? "Direita" : "Esquerda";
  // estilos do mesmo ícone
  const [variantes, setVariantes] = useState<{ de: string; lista: string[]; carregando: boolean }>({ de: "", lista: [], carregando: false });
  useEffect(() => {
    const nome = extraSel?.tipo === "icone" ? extraSel.icone || "" : "";
    if (ferr !== "estiloIcone" || !nome || variantes.de === nome || variantes.lista.includes(nome)) return;
    setVariantes({ de: nome, lista: [], carregando: true });
    variantesIcone(nome).then((lista) => setVariantes({ de: nome, lista, carregando: false })).catch(() => setVariantes({ de: nome, lista: [], carregando: false }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ferr, extraSel?.icone]);
  const trocarIcone = (nome: string) => {
    if (!extraSel) return;
    redesenharExtra(extraSel.id, { icone: nome, cor: iconeColorido(nome) ? undefined : extraSel.cor || a.cor2 }).then(() => gravar(vivoRef.current));
  };
  const inputSubstituir = useRef<HTMLInputElement>(null);
  const substituirImagem = async (src: string) => {
    if (!extraSel) return;
    const id = extraSel.id;
    try {
      const p = await prepararImagem(src);
      const cur = vivoRef.current.x.find((q) => q.id === id);
      if (!cur) return;
      const novo = { ...vivoRef.current, x: vivoRef.current.x.map((q) => (q.id === id ? { ...q, base: p.src, src: p.src, r: p.r, nw: p.w } : q)) };
      vivoRef.current = novo;
      setVivo(novo);
      if (cur.fx) await redesenharExtra(id, {});
      gravar(vivoRef.current);
    } catch {
      setErro("Não consegui usar esta imagem. Tente outra.");
    }
  };
  // desagrupar o selo de preço: cada texto e cada forma vira um item solto, no mesmo lugar
  const desagruparPreco = async () => {
    const ex = extraSel;
    if (!ex || ex.tipo !== "preco" || !ex.preco || !ex.estilo) return;
    try {
      const { pecas, W, H } = await pecasDoPreco(ex.estilo, ex.preco, ex.cor);
      if (!pecas.length) throw new Error("vazio");
      const k = ex.w / (ex.nw || W), ang = ((ex.rot || 0) * Math.PI) / 180, cs = Math.cos(ang), sn = Math.sin(ang);
      const carimbo = Date.now();
      const novos: Extra[] = [];
      for (let i = 0; i < pecas.length; i++) {
        const p = pecas[i];
        const ox = (p.x - W / 2) * k, oy = (p.y - H / 2) * k;
        const fx: FxExtra = {};
        if (ex.fx?.opacidade != null) fx.opacidade = ex.fx.opacidade;
        if (p.tipo === "forma" && p.sombra) fx.efeito = { tipo: "sombra", forca: 35 };
        const n: Extra = {
          id: `x_${carimbo}_${i}`, x: Math.round(ex.x + ox * cs - oy * sn), y: Math.round(ex.y + ox * sn + oy * cs),
          w: Math.max(4, Math.round(p.w * k * 10) / 10), r: p.h / p.w, rot: ex.rot, z: ex.z, src: p.src, nw: p.w,
          ...(Object.keys(fx).length ? { fx } : {}),
          ...(p.tipo === "letra" ? { tipo: "letra" as const, texto: p.texto, fonte: p.fonte, cor: p.cor, ls: p.ls } : { tipo: "forma" as const, base: p.src }),
        };
        if (n.fx) {
          const d = await processarExtra({ src: n.src, w: p.w, r: n.r }, n.fx);
          n.w = (n.w * d.w) / p.w; n.src = d.src; n.r = d.r; n.nw = d.w;
        }
        novos.push(n);
      }
      const v = vivoRef.current, i0 = v.x.findIndex((q) => q.id === ex.id);
      const nx = [...v.x.slice(0, i0), ...novos, ...v.x.slice(i0 + 1)];
      gravar({ ...v, x: nx });
      setVarios(novos.map((n) => n.id));
      setSel(novos[novos.length - 1].id);
      const perdeu = !!(ex.fx?.efeito || ex.fx?.recorte || ex.fx?.filtro);
      setAviso(`Pronto: cada parte do preço virou um item solto. Toque numa parte para mexer só nela.${perdeu ? " O efeito e o corte do selo não passam para as partes: aplique de novo em cada uma." : ""}`);
      setTimeout(() => setAviso(""), 6000);
    } catch {
      setErro("Não consegui separar este preço. Tente de novo.");
    }
  };
  // texto solto (peça desagrupada): fonte, negrito e itálico
  const estiloLetra = (p: { familia?: string; negrito?: boolean; italico?: boolean }) => {
    if (extraSel?.tipo !== "letra") return;
    redesenharExtra(extraSel.id, { fonte: mudarFonte(extraSel.fonte || '800 80px "Montserrat"', p) }).then(() => gravar(vivoRef.current));
  };
  const trocarFonteLetra = async (fam: string) => { await carregarFontes(); estiloLetra({ familia: fam || "Montserrat" }); };
  // modelo do selo das redes (só a logo, etiqueta branca, etiqueta escura)
  const [previasRede, setPreviasRede] = useState<Partial<Record<ModeloRede, string>>>({});
  useEffect(() => {
    if (sub !== "modeloRede" || extraSel?.tipo !== "rede" || !extraSel.rede) return;
    let ativo = true;
    const rede = extraSel.rede, tx = extraSel.texto || "";
    Promise.all(MODELOS_REDE.map(async (m) => [m.id, (await seloRede(rede, tx, m.id)).src] as const))
      .then((l) => { if (ativo) setPreviasRede(Object.fromEntries(l)); })
      .catch(() => null);
    return () => { ativo = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sub, extraSel?.id, extraSel?.texto]);
  const trocarModeloRede = async (m: ModeloRede, todas: boolean) => {
    if (!extraSel) return;
    const alvo = todas ? vivoRef.current.x.filter((e) => e.tipo === "rede").map((e) => e.id) : [extraSel.id];
    await Promise.all(alvo.map((id) => redesenharExtra(id, { modelo: m })));
    gravar(vivoRef.current);
  };
  // fotos já aparecem ao abrir a aba Foto
  useEffect(() => {
    if (ferr === "foto" && !fotos.length && !buscando) buscarFotos(busca || a.destino);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ferr]);

  // ——— páginas (várias artes no mesmo projeto) ———
  type Pagina = { id: string; est: Estado; hist?: { lista: Estado[]; i: number }; mini?: string; grupos?: Record<string, string> };
  const [paginas, setPaginas] = useState<Pagina[]>(() => [{ id: "p1", est: inicio }]);
  const [pag, setPag] = useState(0);
  const [novaPag, setNovaPag] = useState(false);
  const [escolhaModelo, setEscolhaModelo] = useState<{ v: number; formato: "square" | "story" } | null>(null);
  useEffect(() => { if (ferr !== "modelos") setNovaPag(false); }, [ferr]);
  const guardarPagina = (): Pagina[] => {
    const lista = paginas.slice();
    lista[pag] = { ...lista[pag], est: vivoRef.current, hist, mini: url || lista[pag].mini, grupos };
    return lista;
  };
  // guarda o projeto antes de uma mudança em várias cenas; "depois" acerta o passo quando a mudança já foi feita
  const marcarCenas = () => {
    const f = { lista: guardarPagina(), pag, passo: passos.current };
    fotosCenas.current = [...fotosCenas.current.slice(-19), f];
    return () => { f.passo = passos.current; };
  };
  const abrirPagina = (lista: Pagina[], i: number) => {
    const p = lista[i];
    setPaginas(lista);
    setPag(i);
    setSel(null); setVarios([]); setEditandoTexto(false); setSub(null);
    setTimeout(() => setGrupos(p.grupos || {}), 0);
    setUrl(p.mini || "");
    setEls([]);
    vivoRef.current = p.est;
    setVivo(p.est);
    setHist(p.hist || { lista: [p.est], i: 0 });
  };
  const irParaPagina = (i: number) => { if (i !== pag) abrirPagina(guardarPagina(), i); };
  const criarPagina = (v: number, formato: "square" | "story") => {
    marcarCenas();
    const lista = guardarPagina();
    const a0 = vivoRef.current.a;
    const na: Arte = { ...a0, variant: v, formato, ...(a0.cena?.livre ? { cena: { ...a0.cena, livre: false } } : {}) };
    lista.splice(pag + 1, 0, { id: `p${Date.now()}`, est: { a: na, t: ajustesDoModelo(na), x: [] } });
    abrirPagina(lista, pag + 1);
    setSujo(true);
  };
  const apagarPagina = () => {
    if (paginas.length < 2) return;
    marcarCenas();
    const antes = guardarPagina();
    const lista = antes.filter((_, i) => i !== pag);
    // a música fica guardada na primeira cena: se ela sair, passa para a nova primeira
    if (pag === 0 && antes[0].est.a.cena?.musica != null && lista[0]) lista[0] = { ...lista[0], est: { ...lista[0].est, a: { ...lista[0].est.a, cena: { ...(lista[0].est.a.cena || {}), musica: antes[0].est.a.cena.musica } } } };
    abrirPagina(lista, Math.max(0, pag - 1));
    setSujo(true);
    setAviso(`${modoVideo ? "Cena" : "Página"} apagada. Use Desfazer para voltar.`);
    setTimeout(() => setAviso(""), 3500);
  };
  const novaPagina = () => {
    if (modoVideo) {
      // cena nova com outro vídeo da casa; a pessoa escolhe o vídeo e põe os textos
      marcarCenas();
      const lista = guardarPagina();
      const usados = new Set(lista.map((p) => p.est.a.video));
      const clipe = CLIPES.find((c) => !usados.has(c.url))?.url || CLIPES[0].url;
      lista.splice(pag + 1, 0, { id: `c${Date.now()}`, est: cenaEmBranco(marca, vivoRef.current.a, clipe) });
      abrirPagina(lista, pag + 1);
      setSujo(true);
      setFerr("video");
      return;
    }
    setSel(null); setNovaPag(true); setAbaModelos(a.formato); setFerr("modelos");
  };
  const escolherModelo = (v: number, formato: "square" | "story") => {
    if (novaPag) { setNovaPag(false); if (celular) setFerr(null); criarPagina(v, formato); return; }
    if (v === a.variant && formato === a.formato && !a.cena?.livre) return;
    setEscolhaModelo({ v, formato });
  };
  const confirmarModelo = (como: "trocar" | "nova" | "fundo") => {
    const m = escolhaModelo;
    setEscolhaModelo(null);
    if (!m) return;
    if (como === "nova") { criarPagina(m.v, m.formato); return; }
    // no vídeo, escolher um modelo de anúncio tira a cena do modo livre (o vídeo fica no lugar da foto)
    // o título da cena livre é o nome do vídeo ("Serviços · azul"): no anúncio ele sairia como nome do pacote.
    // E o anúncio tem preço e itens: precisa de mais tempo na tela para dar para ler.
    const semLivre = a.cena?.livre ? { cena: { ...a.cena, livre: false, dur: Math.max(a.cena.dur ?? 3, 4.5) }, destino: a.destino || d0.nome, titulo: "" } : {};
    if (a.cena?.livre) { setAviso("Pronto. Coloque o destino e o preço em Preço."); setTimeout(() => setAviso(""), 4500); }
    if (como === "fundo") { mudar({ variant: m.v, formato: m.formato, ...semLivre }); return; }
    const na: Arte = { ...a, variant: m.v, formato: m.formato, ...semLivre };
    setSel(null);
    gravar({ a: na, t: ajustesDoModelo(na), x: [] });
  };

  // ——— vídeo: cada página é uma cena com o vídeo no lugar da foto ———
  const modoVideo = !!videoInicial || !!a.video || paginas.some((p) => !!p.est.a.video);
  const ferramentas = modoVideo ? FERRAMENTAS_VIDEO : FERRAMENTAS;
  // nome do projeto: no vídeo, o nome do vídeo (guardado nas cenas livres), não o título de uma cena de anúncio
  const nomeDe = (lista: { est: Estado }[]) => {
    const a0 = lista[0].est.a;
    if (!modoVideo) return a0.titulo || `Pacote ${a0.destino}`;
    return nomeLimpo(lista.map((p) => p.est.a).find((x) => x.cena?.livre && x.titulo)?.titulo || videoInicial?.nome || a0.titulo || "Meu vídeo");
  };
  const cena: CenaVideo = a.cena || {};
  const [tocando, setTocando] = useState(false);
  // prévia da cena no palco (sobe a cada pedido: escolher ou mudar uma animação, ou "Ver na cena")
  const [previaCena, setPreviaCena] = useState(0);
  const pedirPrevia = () => setPreviaCena((n) => n + 1);
  useEffect(() => { setPreviaCena(0); }, [pag]);
  const [duracaoClipe, setDuracaoClipe] = useState(0);
  useEffect(() => {
    setDuracaoClipe(0);
    if (!a.video) return;
    const v = document.createElement("video");
    v.preload = "metadata"; v.muted = true; v.src = a.video;
    v.onloadedmetadata = () => setDuracaoClipe(Number.isFinite(v.duration) ? v.duration : 0);
    return () => { v.onloadedmetadata = null; v.removeAttribute("src"); };
  }, [a.video]);
  const [montandoVideo, setMontandoVideo] = useState(!!videoInicial && !projetoInicial && !linkInicial);
  const montarVideo = (v: VideoPronto) => {
    setMontandoVideo(true);
    paginasDoVideo(v, marca)
      .then((lista) => { abrirPagina(lista.map((est, i) => ({ id: `c${i + 1}-${Date.now()}`, est })), 0); setSujo(false); })
      .catch(() => setErro("Não consegui montar o vídeo. Volte e tente de novo."))
      .finally(() => setMontandoVideo(false));
  };
  useEffect(() => {
    if (videoInicial && !projetoInicial && !linkInicial) montarVideo(videoInicial);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const mudarCena = (p: Partial<CenaVideo>) => {
    const v = vivoRef.current;
    gravar({ ...v, a: { ...v.a, cena: { ...(v.a.cena || {}), ...p } } });
  };
  // um ajuste da cena de agora vale para todas (as outras perdem o desfazer delas, para não voltar ao antigo)
  const aplicarNasCenas = (campos: (keyof CenaVideo)[], valores?: Partial<CenaVideo>) => {
    const fonte: Partial<CenaVideo> = valores || vivoRef.current.a.cena || {};
    const novos = Object.fromEntries(campos.map((c) => [c, fonte[c]])) as Partial<CenaVideo>;
    const pronto = marcarCenas();
    if (valores) mudarCena(novos);
    pronto();
    const lista = guardarPagina().map((p, i) => (i === pag ? p : { ...p, hist: undefined, est: { ...p.est, a: { ...p.est.a, cena: { ...(p.est.a.cena || {}), ...novos } } } }));
    setPaginas(lista);
    setSujo(true);
    setAviso("Pronto: vale para todas as cenas.");
    setTimeout(() => setAviso(""), 3000);
  };
  const escolherClipe = (url: string, nome: string) => {
    const v = vivoRef.current;
    gravar({ ...v, a: { ...v.a, video: url, cena: { ...(v.a.cena || {}), clipeNome: nome, inicio: 0 } } });
  };
  const usarFotoNaCena = () => {
    const v = vivoRef.current;
    gravar({ ...v, a: { ...v.a, video: undefined, foto: v.a.foto || trialPhotoUrl(d0.photo, 1280), destino: v.a.destino || d0.nome } });
    setFerr("foto");
  };
  const musicaId = pag === 0 ? cena.musica : paginas[0]?.est.a.cena?.musica;
  const escolherMusica = (id: string) => {
    if (pag === 0) { mudarCena({ musica: id }); return; }
    marcarCenas();
    const lista = guardarPagina();
    lista[0] = { ...lista[0], hist: undefined, est: { ...lista[0].est, a: { ...lista[0].est.a, cena: { ...(lista[0].est.a.cena || {}), musica: id } } } };
    setPaginas(lista);
    setSujo(true);
  };
  // ——— narração ———
  // a voz gravada fica só na memória (não vai para o projeto salvo)
  const [vozFaixa, setVozFaixa] = useState<VozGravada | null>(null);
  // a voz vira pedaços na faixa de baixo (dividir, cortar, mover, velocidade, volume)
  const [clipesVoz, setClipesVoz] = useState<ClipeVoz[]>([]);
  const [selAudio, setSelAudio] = useState<SelAudio>(null);
  const [cursorAudio, setCursorAudio] = useState<number | null>(null);
  const ultimaVoz = useRef("");
  const trocarVoz = (v: VozGravada | null) => {
    if (vozFaixa && vozFaixa !== v) URL.revokeObjectURL(vozFaixa.url);
    setVozFaixa(v); setClipesVoz(v ? [clipeInicial(v)] : []); setSelAudio(null); setCursorAudio(null);
  };
  const estDe = (i: number) => (i === pag ? vivo : paginas[i].est);
  const narracao: Narracao = { ...NARRACAO_PADRAO, ...((pag === 0 ? cena.narracao : paginas[0]?.est.a.cena?.narracao) || {}) };
  const textosDe = (est: Estado): TextosCena => ({
    titulo: est.a.titulo, destino: est.a.destino, inclusos: est.a.inclusos || [], preco: est.a.preco, parcelas: est.a.parcelas,
    soltos: est.x.filter((e) => (e.tipo === "texto" || e.tipo === "letra") && e.texto && !e.legenda).sort((p, q) => p.y - q.y).map((e) => e.texto!), livre: !!est.a.cena?.livre,
  });
  const falasDas = (lista: Estado[]) => {
    const auto = roteiroDasCenas(lista.map(textosDe), vozDe(narracao.voz).idioma, fabrica.agencyName || "");
    return lista.map((e, i) => e.a.cena?.fala ?? auto[i]);
  };
  const falas = modoVideo ? falasDas(paginas.map((_, i) => estDe(i))) : [];
  const dursCenas = modoVideo ? paginas.map((_, i) => durDa(estDe(i).a)) : [];
  const mudarCenaDe = (i: number, p: Partial<CenaVideo>) => {
    if (i === pag) { mudarCena(p); return; }
    const lista = guardarPagina();
    lista[i] = { ...lista[i], hist: undefined, est: { ...lista[i].est, a: { ...lista[i].est.a, cena: { ...(lista[i].est.a.cena || {}), ...p } } } };
    setPaginas(lista);
    setSujo(true);
  };
  const mudarNarracao = (p: Partial<Narracao>) => mudarCenaDe(0, { narracao: { ...narracao, ...p } });
  const mudarVariasCenas = (f: (i: number) => Partial<CenaVideo> | null) => {
    const pronto = marcarCenas();
    const meu = f(pag);
    if (meu) mudarCena(meu);
    pronto();
    const lista = guardarPagina().map((p, i) => { const m = i === pag ? null : f(i); return m ? { ...p, hist: undefined, est: { ...p.est, a: { ...p.est.a, cena: { ...(p.est.a.cena || {}), ...m } } } } : p; });
    setPaginas(lista);
    setSujo(true);
  };
  /** Deixa o vídeo com `dur` segundos: cada cena cresce na mesma proporção (para a voz gravada caber inteira). */
  const esticarVideo = (dur: number) => {
    const soma = dursCenas.reduce((s, d) => s + d, 0) || 1;
    const f = dur / soma;
    mudarVariasCenas((i) => ({ dur: Math.min(20, Math.max(1.5, Math.round(dursCenas[i] * f * 10) / 10)) }));
    setAviso(`Pronto: o vídeo agora tem cerca de ${dur.toFixed(1).replace(".", ",")} s e a sua voz cabe inteira.`);
    setTimeout(() => setAviso(""), 3500);
  };
  /** Põe a voz gravada no vídeo inteiro e a legenda dela nas cenas (cada trecho na cena em que é falado). */
  const comFala = async (cenas: CenaPronta[], lista: Estado[]) => {
    const volMusica = narracao.volMusica ?? 1;
    if (!vozFaixa || !clipesVoz.length) {
      if (Math.abs(volMusica - 1) > 0.01 && cenas[0]) cenas[0] = { ...cenas[0], fala: { pedacos: [], legenda: false, volMusica } };
      return { vozes: [] as VozNaFaixa[], aviso: "" };
    }
    const { ini, total } = linhaDas(cenas);
    // a voz montada com os pedaços da faixa (cortes, velocidade e volume)
    const m = await montarVoz(vozFaixa, clipesVoz, total);
    if (ultimaVoz.current) URL.revokeObjectURL(ultimaVoz.current);
    ultimaVoz.current = m.url;
    const a0 = m.trechos[0][0], z0 = Math.min(total, Math.max(...m.trechos.map((t) => t[1])));
    const texto = (narracao.roteiro ?? textoCorrido(falasDas(lista))).trim();
    const pedacos = texto && z0 > a0 ? pedacosDaLegenda(texto, a0, z0 - a0) : [];
    cenas.forEach((c, i) => {
      const a = ini[i], b = a + c.dur;
      const meus = pedacos.filter((p) => p.a >= a && p.a < b).map((p) => ({ t: p.t, a: p.a - a, b: Math.min(p.b, b) - a }));
      cenas[i] = { ...c, fala: { pedacos: meus, legenda: false, audio: i === 0 ? m.url : undefined, trechos: m.trechos, volMusica } };
    });
    return { vozes: [{ audio: m.wav, inicio: INICIO_VOZ, trechos: m.trechos }] as VozNaFaixa[], aviso: "" };
  };
  /** Liga ou desliga a legenda: cada cena ganha um texto (camada comum: muda, move, frente/trás) com o trecho
   *  do roteiro falado nela. Desligar tira só esses textos. Começa desligada. */
  const ligarLegendas = async (on: boolean) => {
    const lista = guardarPagina();
    marcarCenas();
    const nova: Pagina[] = [];
    if (!on) {
      for (const p of lista) nova.push({ ...p, est: { ...p.est, x: p.est.x.filter((e) => !e.legenda) }, hist: undefined, mini: undefined });
    } else {
      const durs = lista.map((p) => durDa(p.est.a));
      const total = durs.reduce((s, d) => s + d, 0);
      const texto = (narracao.roteiro ?? textoCorrido(falasDas(lista.map((p) => p.est)))).trim();
      const pedacos = texto ? pedacosDaLegenda(texto, 0, total) : [];
      let t = 0;
      for (let i = 0; i < lista.length; i++) {
        const p = lista[i], ini = t, fim = t + durs[i];
        t = fim;
        const palavras = pedacos.filter((q) => q.a >= ini && q.a < fim).map((q) => q.t).join(" ").split(" ").filter(Boolean);
        const x = p.est.x.filter((e) => !e.legenda);
        if (palavras.length) {
          // linhas de até 5 palavras, para caber na tela
          const linhas: string[] = [];
          for (let k = 0; k < palavras.length; k += 5) linhas.push(palavras.slice(k, k + 5).join(" "));
          const frase = linhas.join("\n");
          try {
            const d = await desenharTexto("cenaFaixa", frase);
            const w = Math.round(Math.min(LARGURA * 0.86, d.w));
            x.push({ id: `leg${Date.now().toString(36)}${i}`, tipo: "texto", estilo: "cenaFaixa", texto: frase, src: d.src, nw: d.w, w, r: d.r, x: LARGURA / 2, y: Math.round(altura * 0.8), legenda: true });
          } catch { /* sem desenho, a cena fica sem legenda */ }
        }
        nova.push({ ...p, est: { ...p.est, x }, hist: undefined, mini: undefined });
      }
    }
    const n0 = nova[0].est.a.cena || {};
    nova[0] = { ...nova[0], est: { ...nova[0].est, a: { ...nova[0].est.a, cena: { ...n0, narracao: { ...narracao, legendas: on } } } } };
    abrirPagina(nova, pag);
    setSujo(true);
  };
  /** Traduz o vídeo inteiro (textos de todas as cenas, preço por extenso, inclusos e o texto da narração).
   *  Dá para desfazer (volta tudo ao português). A voz não muda sozinha: depois gera de novo no idioma. */
  const traduzirVideo = async (para: IdiomaVideo, comFala: boolean, aoAvancar?: (p: number, etapa: EtapaTraducao) => void) => {
    const lista = guardarPagina();
    const roteiro = narracao.roteiro ?? textoCorrido(falas);
    const textos: string[] = comFala ? [roteiro] : [];
    const pega = (t?: string) => { if (t && t.trim()) textos.push(t); };
    lista.forEach(({ est: { a: ar, x } }) => {
      pega(ar.titulo); pega(ar.promo); pega(ar.periodo); pega(ar.prefixo); pega(ar.complemento); pega(ar.destino);
      ar.inclusos.forEach(pega); pega(ar.cena?.fala);
      x.forEach((e) => {
        if (e.tipo === "texto" || e.tipo === "letra") pega(e.texto);
        if (e.preco) { pega(e.preco.prefixo); pega(e.preco.sufixo); }
        // botão do WhatsApp: traduz a chamada ("Chame no WhatsApp"), o número fica
        if (e.tipo === "rede" && e.rede === "whatsapp" && e.texto) pega(e.texto.split(" · ")[0]);
      });
    });
    const mapa = await traduzirTextos(textos, para, aoAvancar);
    const tr = (t?: string) => (t && mapa.get(t.trim())) || t;
    marcarCenas();
    const nova: Pagina[] = [];
    for (const p of lista) {
      const ar = p.est.a;
      const a2: Arte = { ...ar, titulo: tr(ar.titulo) || "", promo: tr(ar.promo) || "", periodo: tr(ar.periodo) || "", prefixo: tr(ar.prefixo) || "", complemento: tr(ar.complemento) || "", destino: tr(ar.destino) || "",
        inclusos: ar.inclusos.map((t) => tr(t) || t), cena: ar.cena ? { ...ar.cena, fala: tr(ar.cena.fala) } : ar.cena };
      const x2 = await Promise.all(p.est.x.map(async (e) => {
        if ((e.tipo === "texto" || e.tipo === "letra") && e.texto && tr(e.texto) !== e.texto) return textoTraduzido(e, tr(e.texto)!);
        if (e.tipo === "rede" && e.rede && e.texto) {
          const [chamada, ...resto] = e.texto.split(" · ");
          const nova = tr(chamada);
          if (!nova || nova === chamada) return e;
          const txt = [nova, ...resto].join(" · ");
          try { const d = await seloRede(e.rede, txt, e.modelo, e.cor); return { ...e, texto: txt, src: d.src, r: d.r, nw: d.w, w: e.nw ? Math.round(e.w * (d.w / e.nw)) : e.w }; } catch { return e; }
        }
        if (e.tipo === "preco" && e.estilo && e.preco) {
          const pr = { ...e.preco, prefixo: tr(e.preco.prefixo) || "", sufixo: tr(e.preco.sufixo) || "" };
          try { const d = await processarExtra(await desenharPreco(e.estilo, pr, e.cor), e.fx); return { ...e, preco: pr, src: d.src, r: d.r, nw: d.w, w: e.nw ? Math.round(e.w * (d.w / e.nw)) : e.w }; } catch { return e; }
        }
        return e;
      }));
      nova.push({ ...p, est: { ...p.est, a: a2, x: x2 }, hist: undefined, mini: undefined });
    }
    // texto da narração traduzido fica guardado na primeira cena
    const n0 = nova[0].est.a.cena || {};
    nova[0] = { ...nova[0], est: { ...nova[0].est, a: { ...nova[0].est.a, cena: { ...n0, narracao: { ...narracao, ...(comFala ? { roteiro: tr(roteiro), aba: "ia" as const, vozIA: VOZES_IA.find((v) => v.idioma === para)?.id } : {}) } } } } };
    abrirPagina(nova, pag);
    setSujo(true);
  };
  // trocar o visual leva o grupo de itens junto: na faixa escura (Faixa) ou no meio da tela (Clássico e Azul)
  const mudarVisual = (v: VisualCena) => gravar(comVisual(vivoRef.current, v));
  /** o mesmo estilo em todas as cenas do vídeo */
  const visualEmTodas = (v: VisualCena) => {
    const lista = guardarPagina();
    marcarCenas();
    abrirPagina(lista.map((p) => ({ ...p, est: comVisual(p.est, v), hist: undefined, mini: undefined })), pag);
    setSujo(true);
  };
  const comVisual = (at: Estado, v: VisualCena): Estado => {
    const antes = at.a.cena?.livre ? at.a.cena.visual || "classico" : null;
    const na: Arte = { ...at.a, cena: { ...(at.a.cena || {}), livre: true, visual: v } };
    const H = 1920;
    const itens = at.x.filter((e) => e.z == null);
    let x = at.x;
    if (itens.length && (antes === "faixa") !== (v === "faixa")) {
      const top = Math.min(...itens.map((e) => e.y - (e.w * e.r) / 2)), base = Math.max(...itens.map((e) => e.y + (e.w * e.r) / 2));
      const cy = (top + base) / 2, alto = base - top;
      const faixaIni = H * ALTURA_FAIXA;
      const alvoCy = v === "faixa" ? faixaIni + (H - faixaIni) / 2 : H * 0.45;
      const k = v === "faixa" ? Math.min(1, ((H - faixaIni) * 0.86) / Math.max(1, alto)) : 1;
      x = at.x.map((e) => (e.z != null ? e : { ...e, w: Math.round(e.w * k), x: Math.round(LARGURA / 2 + (e.x - LARGURA / 2) * k), y: Math.round(alvoCy + (e.y - cy) * k) }));
    }
    return { ...at, a: na, x };
  };
  const trocarVideoInteiro = (v: VideoPronto) => {
    if (!window.confirm(`Trocar o vídeo inteiro por "${v.nome}"? As cenas de agora saem (use Salvar antes, se quiser guardar).`)) return;
    setFerr(null); setSel(null);
    marcarCenas();
    montarVideo(v);
  };
  // muda a ordem das cenas; a música continua na primeira
  const moverPagina = (de: number, para: number) => {
    if (para < 0 || para >= paginas.length || de === para) return;
    marcarCenas();
    const lista = guardarPagina();
    const musica = lista[0].est.a.cena?.musica;
    const [p] = lista.splice(de, 1);
    lista.splice(para, 0, p);
    const comMusica = lista.map((q, i) => {
      const c = { ...(q.est.a.cena || {}) };
      if (i === 0 && musica != null) c.musica = musica; else delete c.musica;
      return q.est.a.cena || (i === 0 && musica != null) ? { ...q, est: { ...q.est, a: { ...q.est.a, cena: c } } } : q;
    });
    abrirPagina(comMusica, para);
    setSujo(true);
  };
  const arrastePagina = useRef<number | null>(null);
  // celular: segurar uma cena ~0,3 s e arrastar para o lado muda a ordem (o arrastar do computador não funciona no toque)
  const faixaPaginas = useRef<HTMLDivElement>(null);
  // posição de cada miniatura (para as faixas de voz e música ficarem embaixo da cena certa)
  const linhaCenas = useRef<HTMLDivElement>(null);
  const [posCenas, setPosCenas] = useState<PosCena[]>([]);
  const [largLinha, setLargLinha] = useState(0);
  const chaveDurs = dursCenas.join(",");
  useEffect(() => {
    const row = linhaCenas.current;
    if (!modoVideo || !row) return;
    const medir = () => {
      const durs = chaveDurs.split(",").map(Number);
      let t = 0;
      const p = [...row.querySelectorAll<HTMLElement>("[data-pagina]")].map((el, i) => {
        const d = durs[i] || 3;
        const r = { x0: el.offsetLeft, x1: el.offsetLeft + el.offsetWidth, t0: t, t1: t + d };
        t += d;
        return r;
      });
      setPosCenas((ant) => (JSON.stringify(ant) === JSON.stringify(p) ? ant : p));
      setLargLinha(row.scrollWidth);
    };
    medir();
    const ro = new ResizeObserver(medir);
    ro.observe(row);
    return () => ro.disconnect();
  }, [modoVideo, chaveDurs, paginas.length]);
  const [arrasteToque, setArrasteToque] = useState<{ de: number; para: number } | null>(null);
  const toque = useRef<{ x: number; y: number; i: number; timer: number | null; ativo: boolean; para: number }>({ x: 0, y: 0, i: 0, timer: null, ativo: false, para: 0 });
  const iniciarToquePagina = (e: React.TouchEvent, i: number) => {
    if (paginas.length < 2 || e.touches.length !== 1) return;
    const t = toque.current;
    if (t.timer) clearTimeout(t.timer);
    t.x = e.touches[0].clientX; t.y = e.touches[0].clientY; t.i = i; t.ativo = false; t.para = i;
    t.timer = window.setTimeout(() => {
      t.timer = null; t.ativo = true;
      setArrasteToque({ de: i, para: i });
      try { navigator.vibrate?.(15); } catch { /* sem vibrar */ }
    }, 300);
  };
  const soltarToquePagina = () => {
    const t = toque.current;
    if (t.timer) { clearTimeout(t.timer); t.timer = null; }
    if (!t.ativo) return;
    t.ativo = false;
    setArrasteToque(null);
    if (t.para !== t.i) moverPagina(t.i, t.para);
  };
  useEffect(() => {
    const faixa = faixaPaginas.current;
    if (!faixa) return;
    const mover = (e: TouchEvent) => {
      const t = toque.current;
      const p = e.touches[0];
      if (!p) return;
      if (t.timer && Math.hypot(p.clientX - t.x, p.clientY - t.y) > 10) { clearTimeout(t.timer); t.timer = null; return; }
      if (!t.ativo) return;
      e.preventDefault(); // segurando uma cena: o dedo arrasta a cena, não rola a faixa
      const alvo = (document.elementFromPoint(p.clientX, p.clientY) as HTMLElement | null)?.closest("[data-pagina]") as HTMLElement | null;
      if (alvo) {
        const n = Number(alvo.dataset.pagina) - 1;
        if (n !== t.para) { t.para = n; setArrasteToque({ de: t.i, para: n }); }
      }
      // perto da borda: rola a faixa para achar cenas escondidas
      const r = faixa.getBoundingClientRect();
      if (p.clientX < r.left + 36) faixa.scrollLeft -= 12;
      else if (p.clientX > r.right - 36) faixa.scrollLeft += 12;
    };
    faixa.addEventListener("touchmove", mover, { passive: false });
    return () => faixa.removeEventListener("touchmove", mover);
  }, []);
  const duplicarCena = () => {
    marcarCenas();
    const lista = guardarPagina();
    const p = lista[pag];
    const copia: Estado = JSON.parse(JSON.stringify(p.est));
    if (copia.a.cena?.musica != null) delete copia.a.cena.musica;
    lista.splice(pag + 1, 0, { id: `c${Date.now()}`, est: copia });
    abrirPagina(lista, pag + 1);
    setSujo(true);
  };
  // animação: do item escolhido, ou de todos os itens da cena ("animTodos")
  const animDe = (id: string | null): AnimItem | undefined => (id ? cena.animEl?.[id] || cena.animTodos : cena.animTodos);
  const mudarAnim = (p: Partial<AnimItem>) => {
    const alvo = sel && sel !== fotoPrincipal ? sel : null;
    const base: AnimItem = animDe(alvo) || { anim: "aparecer" };
    const nova = { ...base, ...p } as AnimItem;
    if (alvo) mudarCena({ animEl: { ...(cena.animEl || {}), [alvo]: nova } });
    else mudarCena({ animTodos: nova, animEl: {} });
    if (nova.anim !== "nenhuma") pedirPrevia();
  };
  const animEmTodosDaCena = () => { const m = animDe(sel); if (m) mudarCena({ animTodos: m, animEl: {} }); };
  const animEmTodasAsCenas = () => { const m = animDe(sel && sel !== fotoPrincipal ? sel : null); if (m) aplicarNasCenas(["animTodos", "animEl"], { animTodos: m, animEl: {} }); };
  const durTotal = modoVideo ? paginas.reduce((s, p, i) => s + durDa(i === pag ? a : p.est.a), 0) : 0;
  const fotoBox = els.find((b) => b.id === fotoPrincipal);
  const estiloVideo: React.CSSProperties | null = !modoVideo || !a.video ? null
    : fotoBox ? pos(fotoBox)
    : cena.livre ? { left: 0, top: 0, width: "100%", height: cena.visual === "faixa" ? `${ALTURA_FAIXA * 100}%` : "100%" } : null;
  const fotoVideo = modoVideo && !!a.video && !!sel && sel === fotoPrincipal;
  const porItemCena = async (txt: string) => {
    if (!txt.trim()) return;
    const d = await desenharTexto("cenaFaixa", "✓ " + txt.trim());
    novoExtra({ tipo: "texto", estilo: "cenaFaixa", texto: "✓ " + txt.trim(), src: d.src, nw: d.w, w: Math.round(Math.min(LARGURA * 0.8, d.w)), r: d.r });
  };
  const fotoDasPrevias = modoVideo ? capaDoClipe(a.video) || a.foto || "/video-fundos/capas/praia-1.jpg" : a.foto;

  // ——— salvar o projeto neste aparelho (Minhas artes) e reabrir depois ———
  const [projetoId, setProjetoId] = useState<string>(() => projetoInicial || "");
  const [salvando, setSalvando] = useState<"" | "salvando" | "salvo">("");
  const [naConta, setNaConta] = useState(false);
  const [sair, setSair] = useState<"" | "voltar" | "conta">("");
  useEffect(() => {
    if (!projetoInicial) return;
    lerProjeto(projetoInicial).then((p) => {
      if (!p || !p.paginas.length) { setErro("Não achei este projeto. Entre com a conta em que ele foi salvo."); return; }
      setNaConta(!!p.naConta);
      let faltou = 0;
      const lista = (p.paginas as Pagina[]).map((q) => {
        if (!midiaFaltando(q.est?.a?.video)) return { id: q.id, est: q.est, grupos: q.grupos || {} };
        // vídeo enviado em outro aparelho e que não subiu para a conta: põe um da casa no lugar e avisa
        faltou += 1;
        const c = CLIPES[faltou % CLIPES.length];
        return { id: q.id, est: { ...q.est, a: { ...q.est.a, video: c.url, cena: { ...(q.est.a.cena || {}), clipeNome: c.nome, inicio: 0 } } }, grupos: q.grupos || {} };
      });
      abrirPagina(lista, 0);
      setTimeout(() => setSujo(false), 0);
      if (faltou) setAviso(faltou === 1 ? "Um vídeo seu não está neste aparelho. Coloquei um vídeo da casa no lugar: troque em Vídeo." : `${faltou} vídeos seus não estão neste aparelho. Coloquei vídeos da casa no lugar: troque em Vídeo.`);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  // ——— link da arte (equipe, outro aparelho) ———
  const [linkSlug, setLinkSlug] = useState(copiaDoLink ? "" : linkInicial || "");
  const [linkAcesso, setLinkAcesso] = useState<Acesso>("ver");
  const [linkCriado, setLinkCriado] = useState(!!linkInicial && !copiaDoLink);
  const [linkLocal, setLinkLocal] = useState(false);
  const [linkAberto, setLinkAberto] = useState(false);
  const [linkEstado, setLinkEstado] = useState<"" | "criando" | "copiado" | "erro">("");
  useEffect(() => {
    if (!linkInicial) return;
    lerLink(linkInicial).then((l) => {
      if (!l || !l.dados.length) { setErro("Esta arte é privada ou não existe mais."); return; }
      const lista = (l.dados as Pagina[]).map((q) => ({ id: q.id, est: q.est, grupos: q.grupos || {} }));
      abrirPagina(lista, 0);
      setLinkAcesso(l.acesso);
      setLinkLocal(l.local);
      if (copiaDoLink) {
        setTimeout(() => setSujo(true), 0);
        setAviso("Esta é a sua cópia: mude o que quiser. A original não muda. Toque em Salvar para guardar nas suas artes.");
        setTimeout(() => setAviso(""), 7000);
      } else setTimeout(() => setSujo(false), 0);
    }).catch(() => setErro("Não consegui abrir este link."));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const capaDe = async (lista: Pagina[], escala: number) => {
    try {
      const est0 = lista[0].est;
      const base0 = pag === 0 ? url : lista[0].mini || "";
      return base0 ? await juntarArte(base0, est0.x, LARGURA, est0.a.formato === "story" ? 1920 : 1080, escala, "image/jpeg", 0.8) : "";
    } catch { return ""; }
  };
  const dadosDe = (lista: Pagina[]) => lista.map((p) => ({ id: p.id, est: p.est, grupos: p.grupos || {} }));
  async function publicarLinkAgora(acesso: Acesso = linkAcesso): Promise<string | null> {
    setLinkEstado("criando");
    try {
      const lista = guardarPagina();
      const a0 = lista[0].est.a;
      const slugUsado = linkSlug || novoSlug(a0.destino, a0.variant);
      const r = await publicarLink({ slug: slugUsado, nome: nomeDe(lista), destino: a0.destino, variant: a0.variant, formato: a0.formato, acesso, capa: await capaDe(lista, 0.5), dados: dadosDe(lista) });
      setLinkSlug(slugUsado); setLinkCriado(true); setLinkLocal(r.local); setLinkEstado("");
      return slugUsado;
    } catch {
      setLinkEstado("erro");
      return null;
    }
  }
  const mudarAcessoLink = (ac: Acesso) => { setLinkAcesso(ac); if (linkCriado) publicarLinkAgora(ac); };
  const copiarLink = async () => {
    const s0 = linkCriado ? linkSlug : await publicarLinkAgora();
    if (!s0) return;
    try { await navigator.clipboard.writeText(urlDoLink(s0)); setLinkEstado("copiado"); setTimeout(() => setLinkEstado((e) => (e === "copiado" ? "" : e)), 3000); }
    catch { setLinkEstado(""); }
  };
  async function salvarAgora(): Promise<boolean> {
    setSalvando("salvando");
    try {
      const lista = guardarPagina();
      setPaginas(lista);
      const id = projetoId || novoIdProjeto();
      const capa = await capaDe(lista, 0.25);
      const a0 = lista[0].est.a;
      const salvo = await salvarProjeto({ id, nome: nomeDe(lista), destino: a0.destino, capa, paginas: dadosDe(lista) });
      setNaConta(!!salvo.naConta);
      // arte aberta por link (ou com link criado): a equipe vê as mudanças
      if (linkCriado && linkSlug) salvarNoLink(linkSlug, dadosDe(lista), await capaDe(lista, 0.5)).catch(() => { /* fica no aparelho */ });
      setProjetoId(id);
      setSujo(false);
      setSalvando("salvo");
      // o endereço passa a apontar para o projeto: recarregar a página reabre o que foi salvo
      try { const u = new URL(window.location.href); u.searchParams.set("projeto", id); window.history.replaceState(window.history.state, "", u.toString()); } catch { /* segue */ }
      setTimeout(() => setSalvando((s) => (s === "salvo" ? "" : s)), 2500);
      return true;
    } catch {
      setSalvando("");
      setErro("Não consegui salvar neste aparelho (memória cheia?). Baixe a arte para não perder.");
      return false;
    }
  }
  const concluirSair = (para: "voltar" | "conta") => (para === "conta" ? navigate("/minha-conta") : aoVoltar());
  // a voz fica só na memória (não vai junto ao salvar): com voz no vídeo, sempre pergunta antes de sair
  const perdeAlgo = sujo || !!vozFaixa;
  const tentarSair = (para: "voltar" | "conta" = "voltar") => { if (!perdeAlgo) concluirSair(para); else setSair(para); };

  // ——— baixar: formato, tamanho livre, legenda, postar, dicas ———
  const [compart, setCompart] = useState(false);
  const [fmtSaida, setFmtSaida] = useState<FormatoSaida>("png");
  const [largSaida, setLargSaida] = useState(1080);
  const [campoTam, setCampoTam] = useState<{ q: "l" | "a"; v: string } | null>(null);
  const [todasPag, setTodasPag] = useState(false);
  const [gerando, setGerando] = useState<number | null>(null);
  const [prontos, setProntos] = useState<{ nome: string; url: string; blob: Blob; png?: Blob }[] | null>(null);
  const [anuncio, setAnuncio] = useState(0);
  const [avisoComp, setAvisoComp] = useState("");
  const [copiado, setCopiado] = useState<"" | "imagem" | "legenda">("");
  const [previaComp, setPreviaComp] = useState("");
  const [legendaN, setLegendaN] = useState(0);
  const [legenda, setLegenda] = useState("");
  const legendaMexida = useRef(false);
  const [postando, setPostando] = useState<(typeof REDES_POSTAR)[number] | null>(null);
  const [postOk, setPostOk] = useState({ img: false, leg: false });
  const altSaida = Math.round((largSaida * altura) / LARGURA);
  const fmtAtual = FORMATOS_SAIDA.find((q) => q.id === fmtSaida)!;
  const comMp4 = podeMp4();
  const marcarCopiado = (q: "imagem" | "legenda") => { setCopiado(q); setTimeout(() => setCopiado((c) => (c === q ? "" : c)), 3500); };
  // cada download mostra outro recado (em ordem, não sorteado)
  const proximoAnuncio = () => {
    try {
      const n = Number(localStorage.getItem("cv-anuncio-baixar") || "0") || 0;
      localStorage.setItem("cv-anuncio-baixar", String(n + 1));
      return n % TOTAL_ANUNCIOS;
    } catch { return Math.floor(Math.random() * TOTAL_ANUNCIOS); }
  };
  // "Sua marca" no vídeo: a logo das cenas troca junto (e entra no alto de todas, se o vídeo foi feito sem logo)
  const logoNoVideo = async (nova: string) => {
    if (!modoVideo) return;
    const placa = await placaDaLogo(nova);
    if (!placa) return;
    const lista = guardarPagina();
    const tem = lista.some((p) => p.est.x.some((e) => e.logo));
    const nova_lista = lista.map((p) => {
      if (tem) {
        // mesma altura de antes, para a logo larga não invadir o título
        const x = p.est.x.map((e) => (e.logo ? { ...e, src: placa.src, base: placa.src, nw: placa.nw, r: placa.r, w: Math.round(Math.min(e.w * 1.6, (e.w * e.r) / Math.max(0.2, placa.r))) } : e));
        return { ...p, est: { ...p.est, x } };
      }
      const lg = logoPequena(placa);
      const cena = p.est.a.cena;
      const a2 = cena ? { ...p.est.a, cena: { ...cena, animEl: { ...(cena.animEl || {}), [lg.id]: { anim: "nenhuma" as const, vel: "normal" as const, atraso: 0 } } } } : p.est.a;
      return { ...p, est: { ...p.est, a: a2, x: [...p.est.x, lg] } };
    });
    marcarCenas();
    abrirPagina(nova_lista, pag);
    setSujo(true);
    setAviso(tem ? "Troquei a logo em todas as cenas." : "Coloquei a sua logo no alto de todas as cenas.");
    setTimeout(() => setAviso(""), 2500);
  };
  /** Onde a logo aparece (todas as cenas, início e fim, só no fim, nenhuma) e o formato (placa, redonda, quadrada, sem fundo). */
  const logoVideo = paginas[0] ? estDe(0).a.cena?.logoVideo : undefined;
  const arrumarLogo = async (mudou: Partial<NonNullable<CenaVideo["logoVideo"]>>) => {
    if (!modoVideo) return;
    const cfg = { onde: logoVideo?.onde ?? "todas", formato: logoVideo?.formato ?? "placa", ...mudou } as NonNullable<CenaVideo["logoVideo"]>;
    const logo = fabrica.logoBase64;
    const placa = logo && cfg.onde !== "nenhuma" ? await placaDaLogo(logo, cfg.formato as FormatoLogo) : null;
    if (logo && cfg.onde !== "nenhuma" && !placa) { setAviso("Não consegui abrir a sua logo. Envie de novo em Sua marca."); return; }
    const lista = guardarPagina();
    const n = lista.length;
    const quer = (i: number) => cfg.onde === "todas" || (cfg.onde === "inicio-fim" && (i === 0 || i === n - 1)) || (cfg.onde === "fim" && i === n - 1);
    const nova = lista.map((p, i) => {
      const atual = p.est.x.filter((e) => e.logo);
      let x = p.est.x;
      let anim = p.est.a.cena?.animEl;
      if (!placa || !quer(i)) x = x.filter((e) => !e.logo);
      else if (atual.length) {
        // mesma altura de antes, no mesmo lugar
        // mesmo lugar; tamanho certo para o formato novo (pequena nas cenas, grande no fecho)
        const ref = i === n - 1 && n > 1 ? logoGrande(placa, 560) : logoPequena(placa);
        x = x.map((e) => {
          if (!e.logo) return e;
          // a base da logo fica onde estava: ela cresce para cima e não cobre o texto
          const base = e.y + (e.w * e.r) / 2, h = ref.w * placa.r;
          return { ...e, src: placa.src, base: placa.src, nw: placa.nw, r: placa.r, w: ref.w, y: Math.round(Math.max(40 + h / 2, base - h / 2)) };
        });
      } else {
        let lg = i === n - 1 && n > 1 ? logoGrande(placa, 560) : logoPequena(placa);
        if (i === n - 1 && n > 1) {
          // na última cena a logo grande fica logo acima do primeiro texto
          const textos = x.filter((e) => e.tipo === "texto" || e.tipo === "rede");
          const topo = textos.length ? Math.min(...textos.map((e) => e.y - (e.w * e.r) / 2)) : altura * 0.6;
          lg = { ...lg, y: Math.round(Math.max(300 + (lg.w * lg.r) / 2, topo - 40 - (lg.w * lg.r) / 2)) };
        }
        x = [...x, lg];
        anim = { ...(anim || {}), [lg.id]: { anim: i === n - 1 ? "zoom" as const : "nenhuma" as const, vel: "normal" as const, atraso: 0 } };
      }
      const cena = p.est.a.cena ? { ...p.est.a.cena, animEl: anim, ...(i === 0 ? { logoVideo: cfg } : {}) } : p.est.a.cena;
      return { ...p, est: { ...p.est, a: { ...p.est.a, cena }, x }, hist: undefined, mini: undefined };
    });
    marcarCenas();
    abrirPagina(nova, pag);
    setSujo(true);
  };
  // vídeo: legenda feita do que as cenas mostram; arte: do destino, inclusos e preço
  const legendaAgora = (n: number) => {
    if (!modoVideo) return gerarLegenda(vivoRef.current.a, marca, n);
    const lista = guardarPagina().map((p) => p.est);
    return legendaDoVideo(roteiroDasCenas(lista.map(textosDe), "pt-BR", ""), nomeDe(guardarPagina()), marca, n);
  };
  const abrirCompartilhar = () => {
    setSel(null); setFerr(null); setProntos(null); setGerando(null); setAvisoComp(""); setPostando(null); setCopiado(""); setCampoTam(null);
    if (modoVideo) { setFmtSaida(podeMp4() ? "mp4" : "png"); setTodasPag(podeMp4()); setLargSaida(1080); }
    if (!legendaMexida.current) setLegenda(legendaAgora(legendaN));
    setPreviaComp(url);
    if (url) juntarArte(url, vivoRef.current.x, LARGURA, altura, 0.3, "image/jpeg", 0.82).then(setPreviaComp).catch(() => { /* fica a arte sem os itens */ });
    setCompart(true);
  };
  // "Baixar assim mesmo": monta o vídeo, abre o Baixar e já começa a preparar o MP4
  const baixarPend = useRef(!!baixarJa);
  const [gerarAoAbrir, setGerarAoAbrir] = useState(false);
  useEffect(() => {
    if (baixarPend.current && !montandoVideo && url && paginas.length > 0) { baixarPend.current = false; abrirCompartilhar(); setGerarAoAbrir(true); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [montandoVideo, url, paginas.length]);
  useEffect(() => {
    if (gerarAoAbrir && compart && fmtSaida === "mp4") { setGerarAoAbrir(false); void gerarArquivos(); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gerarAoAbrir, compart, fmtSaida]);
  const fecharCompartilhar = () => { if (gerando != null) return; prontos?.forEach((p) => URL.revokeObjectURL(p.url)); setProntos(null); setCompart(false); };
  const outraLegenda = () => { const n = legendaN + 1; setLegendaN(n); legendaMexida.current = false; setLegenda(legendaAgora(n)); };
  // largura ou altura digitada: a outra acompanha (a arte não deforma)
  const larguraDoCampo = (): number | null => {
    const n = campoTam ? Number(campoTam.v.replace(/\D/g, "")) : 0;
    if (!campoTam || !(n > 0)) return null;
    const l = campoTam.q === "l" ? n : Math.round((n * LARGURA) / altura);
    return Math.min(LARG_MAX, Math.max(LARG_MIN, l));
  };
  const aplicarCampoTam = () => {
    const l = larguraDoCampo();
    if (l != null) setLargSaida(l);
    setCampoTam(null);
  };
  const escolherFormato = (id: FormatoSaida) => {
    setFmtSaida(id);
    if ((id === "pdf" || id === "mp4" || id === "gif") && paginas.length > 1) setTodasPag(true);
    // cada formato de vídeo tem os tamanhos dele: se o atual não serve, volta ao padrão
    if (modoVideo && id === "gif" && !TAMANHOS_GIF.some((q) => q.px === largSaida)) setLargSaida(480);
    if (modoVideo && id === "mp4" && !TAMANHOS_VIDEO.some((q) => q.px === largSaida)) setLargSaida(1080);
  };
  const pngDe = async (b: Blob): Promise<Blob> => {
    if (b.type === "image/png") return b;
    const bm = await createImageBitmap(b);
    const c = document.createElement("canvas");
    c.width = bm.width; c.height = bm.height;
    c.getContext("2d")!.drawImage(bm, 0, 0);
    return new Promise<Blob>((ok, nao) => c.toBlob((q) => (q ? ok(q) : nao(new Error("png"))), "image/png"));
  };
  async function gerarArquivos() {
    // número ainda no campo (a pessoa digitou e tocou direto em Preparar)
    const larguraPedida = larguraDoCampo() ?? largSaida;
    if (campoTam) aplicarCampoTam();
    const fmt = fmtAtual;
    // iPhone não desenha telas com mais de ~16,7 milhões de pixels: no celular o tamanho fica no máximo possível
    const temStory = todasPag && paginas.length > 1 ? paginas.some((p, i) => (i === pag ? a : p.est.a).formato === "story") : a.formato === "story";
    const kMax = celular ? Math.sqrt(16_000_000 / (LARGURA * (temStory ? 1920 : 1080))) : 99;
    const pedido = Math.min(LARG_MAX, Math.max(LARG_MIN, Math.round(larguraPedida)));
    const k = Math.min(pedido / LARGURA, kMax);
    const lista = todasPag && paginas.length > 1 ? guardarPagina().map((p) => p.est) : [vivoRef.current];
    setAvisoComp(""); setPostando(null); setCopiado("");
    setAnuncio(proximoAnuncio());
    setGerando(3);
    const t0 = performance.now();
    const relogio = setInterval(() => setGerando((g) => (g == null ? g : Math.min(92, g + Math.max(0.6, (92 - g) * 0.07)))), 120);
    try {
      const out: { nome: string; url: string; blob: Blob; png?: Blob }[] = [];
      const nomeBase = `anuncio-${slug(lista[0].a.destino)}`;
      let trocouFormato = false;
      let avisoVideo = "";
      if (modoVideo && (fmt.id === "mp4" || fmt.id === "gif")) {
        clearInterval(relogio);
        const todas = guardarPagina().map((p) => p.est);
        const largV = Math.round(LARGURA * k);
        // letras e logos desenhados no tamanho final (nítidos em 2K e 4K); GIF é pequeno, não precisa
        const escalaV = fmt.id === "gif" ? 1 : Math.max(1, largV / LARGURA);
        const cenas = [];
        for (let i = 0; i < todas.length; i++) { cenas.push(await prepararCena(todas[i], marca, escalaV)); setGerando(3 + ((i + 1) / todas.length) * 10); }
        const narr = await comFala(cenas, todas);
        if (narr.aviso) avisoVideo = `${narr.aviso} O vídeo saiu com a legenda, sem a voz.`;
        const nomeV = `video-${slug(nomeDe(guardarPagina()))}`;
        if (fmt.id === "gif") {
          const blob = await fazerGif(cenas, largV, (p) => setGerando(15 + p * 83));
          out.push({ nome: `${nomeV}.gif`, url: URL.createObjectURL(blob), blob });
        } else {
          const mus = musicaDoVideo(todas[0].a.cena?.musica);
          let blob: Blob;
          try {
            blob = await fazerVideoMp4(cenas, mus?.arquivo, largV, (p) => setGerando(15 + p * 83), (m) => setAvisoComp(m), narr.vozes, narracao.volMusica ?? 1);
          } catch (e) {
            // aparelho que não faz vídeo tão grande: sai em Full HD e avisa
            if (largV <= 1080) throw e;
            blob = await fazerVideoMp4(cenas, mus?.arquivo, 1080, (p) => setGerando(15 + p * 83), (m) => setAvisoComp(m), narr.vozes, narracao.volMusica ?? 1);
            avisoVideo = `Este aparelho não faz vídeo em ${largV} px. Saiu em Full HD (1080 × 1920).`;
          }
          out.push({ nome: `${nomeV}.mp4`, url: URL.createObjectURL(blob), blob });
        }
      } else if (fmt.id === "pdf" || fmt.id === "mp4") {
        const dados: { dado: string; w: number; h: number }[] = [];
        for (const est of lista) {
          const alt = est.a.formato === "story" ? 1920 : 1080;
          const base = await comporArte(est.a, marca, est.t, undefined, { camadas: camadasDe(est.x), escala: k });
          const dado = await juntarArte(base, est.x, LARGURA, alt, k, fmt.id === "pdf" ? "image/jpeg" : "image/png", 0.9);
          dados.push({ dado, w: Math.round(LARGURA * k), h: Math.round(alt * k) });
        }
        const primeira = await (await fetch(dados[0].dado)).blob();
        const blob = fmt.id === "pdf" ? await fazerPdf(dados) : await fazerMp4(dados.map((d) => d.dado), dados[0].w, dados[0].h, dados.length > 1 ? 3 : 6);
        out.push({ nome: `${nomeBase}.${fmt.id}`, url: URL.createObjectURL(blob), blob, png: await pngDe(primeira) });
      } else {
        for (let i = 0; i < lista.length; i++) {
          const est = lista[i];
          const alt = est.a.formato === "story" ? 1920 : 1080;
          const base = await comporArte(est.a, marca, est.t, undefined, { camadas: camadasDe(est.x), escala: k });
          const dado = await juntarArte(base, est.x, LARGURA, alt, k, fmt.mime, 0.9);
          const blob = await (await fetch(dado)).blob();
          // o navegador pode não saber fazer WebP e devolver PNG: o nome segue o que saiu de verdade
          const ext = blob.type === "image/webp" ? "webp" : blob.type === "image/jpeg" ? "jpg" : "png";
          if (ext !== fmt.id) trocouFormato = true;
          out.push({ nome: `anuncio-${slug(est.a.destino)}${lista.length > 1 ? `-pagina-${i + 1}` : ""}.${ext}`, url: URL.createObjectURL(blob), blob });
        }
        // cópia em PNG já pronta (o colar das redes só aceita PNG, e copiar tem que ser rápido)
        if (out[0] && out[0].blob.type !== "image/png") { try { out[0].png = await pngDe(out[0].blob); } catch { /* sem cópia: fica só o Baixar */ } }
      }
      // dá tempo de ler o recado enquanto prepara
      const falta = 2600 - (performance.now() - t0);
      if (falta > 0) await new Promise((ok) => setTimeout(ok, falta));
      setGerando(100);
      await new Promise((ok) => setTimeout(ok, 250));
      setProntos(out);
      const avisos: string[] = [];
      if (trocouFormato) avisos.push("Este navegador não salva em WebP: a imagem saiu em PNG.");
      if (k < pedido / LARGURA) avisos.push(`No celular o tamanho máximo é ${Math.round(LARGURA * k)} px de largura, para não travar.`);
      if (!modoVideo && fmt.id === "mp4" && LARGURA * k > 1920) avisos.push("O vídeo sai com até 1920 px (o máximo que as redes usam).");
      if (avisoVideo) avisos.push(avisoVideo);
      else if (modoVideo && fmt.id === "mp4" && LARGURA * k > 1080) avisos.push("Instagram e WhatsApp diminuem para Full HD ao postar. O tamanho grande serve para guardar, editar ou passar na TV.");
      if (avisos.length) setAvisoComp(avisos.join(" "));
    } catch (e) {
      setAvisoComp(fmt.id === "gif" ? "Não consegui fazer o GIF. Tente o tamanho Pequeno ou um vídeo mais curto." : fmt.id === "mp4" ? `${(e as Error)?.message?.includes("MP4") ? (e as Error).message : "Não consegui fazer o vídeo."} Tente PNG ou um tamanho menor.` : "Não consegui preparar neste tamanho. Tente um tamanho menor.");
    } finally {
      clearInterval(relogio);
      setGerando(null);
    }
  }
  const arquivosProntos = () => (prontos || []).map((p) => new File([p.blob], p.nome, { type: p.blob.type }));
  const podeEnviarArquivo = (() => {
    try { return typeof navigator !== "undefined" && !!navigator.canShare && navigator.canShare({ files: [new File([new Blob(["x"], { type: "image/png" })], "a.png", { type: "image/png" })] }); } catch { return false; }
  })();
  const baixarArquivo = (p: { url: string; nome: string }) => {
    const l = document.createElement("a");
    l.href = p.url; l.download = p.nome;
    document.body.appendChild(l); l.click(); l.remove();
  };
  const baixarProntos = async () => {
    const lista = prontos || [];
    // iPhone e iPad não baixam vários arquivos de uma vez: a folha de compartilhar salva todos (Salvar imagens / Salvar em Arquivos)
    if (ehIOS() && podeEnviarArquivo) {
      try { await navigator.share({ files: arquivosProntos() }); return; }
      catch (e) { if ((e as Error)?.name === "AbortError") return; }
    }
    lista.forEach((p, i) => setTimeout(() => baixarArquivo(p), i * 450));
  };
  const enviarArquivo = async () => {
    // a legenda vai copiada junto: o Instagram ignora o texto do compartilhar, então é só colar
    navigator.clipboard?.writeText(legenda).catch(() => { /* sem cópia */ });
    try { await navigator.share({ files: arquivosProntos(), text: legenda }); }
    catch (e) { if ((e as Error)?.name !== "AbortError") setAvisoComp("O celular não abriu o compartilhar. Use Baixar e envie pelo app."); }
  };
  const copiarImagem = async (calado = false): Promise<boolean> => {
    const p = prontos?.[0];
    if (!p) return false;
    try {
      const blob = p.blob.type === "image/png" ? p.blob : p.png;
      if (!blob || typeof ClipboardItem === "undefined") throw new Error("sem cópia");
      await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
      marcarCopiado("imagem");
      return true;
    } catch {
      if (!calado) setAvisoComp("Não deu para copiar a imagem aqui. Use Baixar.");
      return false;
    }
  };
  const copiarLegenda = async () => {
    try { await navigator.clipboard.writeText(legenda); marcarCopiado("legenda"); }
    catch { setAvisoComp("Não deu para copiar. Selecione o texto da legenda e copie."); }
  };
  const postarEm = async (r: (typeof REDES_POSTAR)[number]) => {
    setPostando(r);
    setPostOk({ img: false, leg: false });
    setAvisoComp("");
    const p = prontos?.[0];
    if (!p) return;
    if (r.modo === "colar" && !p.blob.type.startsWith("video/") && p.blob.type !== "image/gif") {
      const ok = await copiarImagem(true);
      setPostOk({ img: ok, leg: false });
      window.open(r.url(legenda), "_blank", "noopener");
      if (!ok) setAvisoComp(`Não deu para copiar a imagem neste navegador. Toque em Baixar e envie o arquivo no ${r.nome}.`);
      return;
    }
    // a rede só aceita arquivo: baixa a imagem (PDF vira PNG; vídeo vai como vídeo) e copia a legenda
    if (p.blob.type === "application/pdf" && p.png) baixarArquivo({ url: URL.createObjectURL(p.png), nome: p.nome.replace(/\.pdf$/, ".png") });
    else baixarArquivo(p);
    try { await navigator.clipboard.writeText(legenda); marcarCopiado("legenda"); setPostOk({ img: false, leg: true }); } catch { /* fica o botão */ }
    window.open(r.url(legenda), "_blank", "noopener");
  };

  compartRef.current = compart || !!escolhaModelo || !!sair || linkAberto;
  useEffect(() => {
    if (!perdeAlgo) return;
    const avisar = (e: BeforeUnloadEvent) => { e.preventDefault(); e.returnValue = ""; };
    window.addEventListener("beforeunload", avisar);
    return () => window.removeEventListener("beforeunload", avisar);
  }, [perdeAlgo]);

  const opcoesAudio = modoVideo && selAudio ? (
    <OpcoesAudio sel={selAudio} clipes={clipesVoz} mudarClipes={(c) => { setClipesVoz(c); setSujo(true); }} cursor={cursorAudio}
      volMusica={narracao.volMusica ?? 1} mudarVolMusica={(v) => mudarNarracao({ volMusica: v })}
      aoTrocarMusica={() => setFerr("musica")} aoTirarMusica={() => { escolherMusica(""); setSelAudio(null); }} aoFechar={() => { setSelAudio(null); setCursorAudio(null); }} />
  ) : null;
  const abrirPainel = (id: Ferramenta) => { setSub(null); setFerr(ferr === id ? null : id); };
  const { claro } = useTemaNovo();
  const corBarra = claro ? "#FFFFFF" : "#E9E9EC";
  // o preço inteiro não leva degradê (pintaria o selo todo por cima dos números): desagrupe e pinte cada parte
  const podeDegrade = tipoSel === "textoArte" || tipoSel === "bloco" || tipoSel === "texto" || tipoSel === "letra" || tipoSel === "forma" || iconeMono;
  const ehLetra = tipoSel === "textoArte" || tipoSel === "texto" || tipoSel === "preco" || tipoSel === "rede" || tipoSel === "letra";
  const listaFx: readonly string[] = tipoSel === "textoArte" ? EFEITOS_DO.textoArte : tipoSel === "bloco" ? EFEITOS_DO.bloco : tipoSel === "forma" ? EFEITOS_DO.forma : tipoSel === "imagemArte" || tipoSel === "imagem" ? EFEITOS_DO.imagem : ehLetra ? EFEITOS_DO.letra : EFEITOS_DO.item;
  const escolherFx = (id: string) => mudarFx({ efeito: id ? { tipo: id as ArtEffect["tipo"], forca: fxSel?.forca ?? 50 } : undefined });
  const CORES_EFEITO = Array.from(new Set(["", "#000000", "#FFFFFF", "#F5F906", "#FF2BD6", "#00E5FF", "#FF3131", a.cor2.toUpperCase()]));
  const previaFx = (id: string) => {
    if (id === "curvar") return (
      <svg viewBox="0 0 100 50" className="h-12 w-20" aria-hidden>
        <path id="ed-curva-previa" d="M8,46 Q50,2 92,46" fill="none" />
        <text fontSize="22" fontWeight="800" fill="#111"><textPath href="#ed-curva-previa" startOffset="50%" textAnchor="middle">Curvar</textPath></text>
      </svg>
    );
    if (!ehLetra) {
      const forma: Record<string, React.CSSProperties> = {
        sombra: { boxShadow: "5px 5px 7px rgba(0,0,0,.45)" }, brilho: { boxShadow: "0 0 14px 4px rgba(245,249,6,.95)" },
        eco: { boxShadow: "6px 6px 0 rgba(82,113,255,.5), 12px 12px 0 rgba(82,113,255,.25)" }, contorno: { outline: "3px solid #111", outlineOffset: 2 },
        falha: { boxShadow: "-5px 0 0 #00E5FF, 5px 0 0 #FF2BD6" },
      };
      return <span className="h-9 w-9 rounded-md" style={{ background: "#5271FF", ...(forma[id] || {}) }} />;
    }
    const letra: Record<string, React.CSSProperties> = {
      sombra: { textShadow: "3px 3px 4px rgba(0,0,0,.45)" }, brilho: { textShadow: "0 0 8px #F5F906, 0 0 14px #F5F906" },
      eco: { textShadow: "3px 3px 0 rgba(0,0,0,.45), 6px 6px 0 rgba(0,0,0,.2)" },
      contorno: { color: "#FFFFFF", WebkitTextStroke: "1.5px #111", paintOrder: "stroke fill" }, fundo: { background: "#111", color: "#fff", padding: "2px 7px", borderRadius: 6 },
      vazado: { color: "transparent", WebkitTextStroke: "1.5px #111" }, neon: { color: "#fff", textShadow: "0 0 4px #FF2BD6, 0 0 10px #FF2BD6, 0 0 16px #FF2BD6" },
      falha: { textShadow: "-2px 0 #00E5FF, 2px 0 #FF2BD6" },
      desalinhado: { color: "transparent", WebkitTextStroke: "1.5px #111", textShadow: "3px 3px 0 #FF2BD6" },
    };
    return <span className="text-[26px] font-black leading-none" style={{ color: "#111", ...(letra[id] || {}) }}>Ag</span>;
  };
  const bolinha = (c: string, classe = "aspect-square w-full") => {
    const on = !gradSel && corSel.toUpperCase() === c.toUpperCase();
    return <button key={c} data-cor={c.toUpperCase()} aria-label={`Cor ${c}`} onClick={() => aplicarCor(c.toUpperCase())} className={`${classe} shrink-0 rounded-full`} style={{ background: c, border: on ? "3px solid #8B5CF6" : "2px solid rgba(127,127,127,.35)" }} />;
  };
  // ao trocar de item, fecha o que não serve para ele
  useEffect(() => { setTamTxt(null); setSub(null); }, [sel]);
  useEffect(() => {
    if (!ferr || !CONTEXTUAIS.includes(ferr)) return;
    if (!sel || marcados.length > 1 || (ferr === "cor" && !podeCor) || (ferr === "estiloIcone" && extraSel?.tipo !== "icone")) setFerr(null);
  });
  // avisos de erro somem sozinhos (menos o da arte que não montou)
  useEffect(() => {
    if (!erro || erro.startsWith("Não consegui montar")) return;
    const k = setTimeout(() => setErro(""), 6000);
    return () => clearTimeout(k);
  }, [erro]);
  const tituloPainel = (ferr === "animar" ? null : ferramentas.find((f) => f.id === ferr)?.nome) || ({ cor: "Cor", efeitos: "Efeitos", posicao: "Posição", estiloIcone: "Estilos do ícone", animar: "Animar", cena: "Cena" } as Record<string, string>)[ferr || ""] || "";

  // ——— visual ———
  const campo = "min-h-11 w-full rounded-xl border border-white/10 bg-white/[0.05] px-3 text-[16px] outline-none focus:border-[#F5F906]";
  const rotulo = "mb-1.5 block text-[12px] font-bold text-white/60";
  const chip = (on: boolean) => `min-h-10 rounded-full border px-3.5 text-[13px] font-semibold ${on ? "border-[#F5F906] bg-[#F5F906] text-black" : "border-white/15 text-white/80"}`;

  // lista de camadas (de cima para baixo), arrastável
  const [abaPos, setAbaPos] = useState<"organizar" | "camadas">("organizar");
  const [arrCam, setArrCam] = useState<{ id: string; alvo: number } | null>(null);
  const nomeCamada = (it: ItemPilha) => it.extra
    ? (it.extra.tipo === "rede" ? `${REDES.find((q) => q.id === it.extra!.rede)?.nome || "Rede"}${it.extra.texto ? `: ${it.extra.texto}` : ""}` : it.extra.texto || ({ imagem: "Imagem", preco: "Preço", icone: "Ícone", forma: "Forma" } as Record<string, string>)[it.extra.tipo] || "Item")
    : it.b!.kind === "text" ? it.b!.text || "Texto" : it.b!.id === fotoPrincipal ? "Foto de fundo" : it.b!.kind === "image" ? "Imagem da arte" : "Forma da arte";
  const miniCamada = (it: ItemPilha) => {
    if (it.extra) return <img src={it.extra.src} alt="" className="max-h-full max-w-full object-contain" />;
    const b = it.b!, s = Math.min(72 / Math.max(1, b.w), 40 / Math.max(1, b.h));
    return <span className="block" style={{ width: b.w * s, height: b.h * s, backgroundImage: url ? `url(${url})` : undefined, backgroundSize: `${LARGURA * s}px ${altura * s}px`, backgroundPosition: `${-b.x * s}px ${-b.y * s}px` }} />;
  };
  const listaCamadas = (() => {
    if (ferr !== "posicao") return null;
    const lista = pilha().slice().reverse();
    // mede só as linhas da lista que está na tela (no celular existe outra cópia escondida)
    const alvoPorY = (caixa: HTMLElement, y: number) => {
      const linhas = caixa.querySelectorAll<HTMLElement>("[data-camada-item]");
      for (let i = 0; i < linhas.length; i++) { const q = linhas[i].getBoundingClientRect(); if (y < q.top + q.height / 2) return i; }
      return linhas.length;
    };
    const soltarCamada = () => {
      const d = arrCam;
      setArrCam(null);
      if (!d) return;
      const ids = lista.map((p) => p.id);
      const de = ids.indexOf(d.id);
      if (de < 0 || d.alvo === de || d.alvo === de + 1) return;
      ids.splice(de, 1);
      ids.splice(d.alvo > de ? d.alvo - 1 : d.alvo, 0, d.id);
      // nada vai para baixo da foto que cobre a arte inteira (sumiria)
      const deBaixo = ids.reverse();
      const sem = deBaixo.filter((id) => id !== d.id);
      let piso = 0;
      while (piso < sem.length && ehFundoDaArte(sem[piso])) piso++;
      if (!ehFundoDaArte(d.id) && deBaixo.indexOf(d.id) < piso) { sem.splice(piso, 0, d.id); aplicarPilha(sem); }
      else aplicarPilha(deBaixo);
    };
    return (
      <div data-camadas className="flex flex-col gap-1.5" onPointerMove={(e) => { if (arrCam) { const al = alvoPorY(e.currentTarget, e.clientY); if (al !== arrCam.alvo) setArrCam({ ...arrCam, alvo: al }); } }} onPointerUp={soltarCamada} onPointerCancel={() => setArrCam(null)}>
        <p className="text-[11px] text-white/45">Arraste pelos pontinhos para mudar a ordem. O que está em cima aparece na frente.</p>
        {lista.map((it, i) => (
          <div
            key={it.id}
            data-camada-item={it.id}
            onClick={() => { setVarios([]); setSel(it.id); }}
            className="flex min-h-12 cursor-pointer items-center gap-2 rounded-xl px-1.5"
            style={{ background: sel === it.id ? "rgba(139,92,246,.2)" : "rgba(255,255,255,.05)", border: sel === it.id ? "1px solid #8B5CF6" : "1px solid transparent", boxShadow: arrCam && arrCam.alvo === i ? "inset 0 3px 0 #8B5CF6" : arrCam && arrCam.alvo === lista.length && i === lista.length - 1 ? "inset 0 -3px 0 #8B5CF6" : undefined, opacity: arrCam?.id === it.id ? 0.45 : 1 }}
          >
            <span
              data-pegar-camada
              aria-label="Arraste para mudar a ordem"
              onPointerDown={(e) => { e.preventDefault(); e.stopPropagation(); try { (e.currentTarget.closest("[data-camadas]") as HTMLElement | null)?.setPointerCapture(e.pointerId); } catch { /* toque */ } setArrCam({ id: it.id, alvo: i }); }}
              className="grid h-10 w-6 shrink-0 cursor-grab touch-none place-items-center text-white/50"
            ><GripVertical className="h-4 w-4" /></span>
            <span className="grid h-10 w-[72px] shrink-0 place-items-center overflow-hidden rounded-md" style={{ background: "repeating-conic-gradient(#a3a3ab 0% 25%, #85858d 0% 50%) 50% / 12px 12px" }}>{miniCamada(it)}</span>
            <span className="min-w-0 flex-1 truncate text-[12px] font-semibold">{nomeCamada(it)}</span>
          </div>
        ))}
      </div>
    );
  })();
  const painel = ferr && (
    <div className="flex flex-col gap-4">
      {ferr === "video" && <PainelVideoFundo atual={a.video} nome={cena.clipeNome} aoEscolher={escolherClipe} aoUsarFoto={usarFotoNaCena} />}
      {ferr === "musica" && <PainelMusica atual={musicaId} aoEscolher={escolherMusica} />}
      {ferr === "narracao" && modoVideo && (
        <PainelNarracao n={narracao} mudar={mudarNarracao} sugerido={textoCorrido(falas)} total={dursCenas.reduce((s, d) => s + d, 0)}
          voz={vozFaixa} aoVoz={trocarVoz} fimVoz={clipesVoz.length ? Math.max(...clipesVoz.map(fimClipe)) : undefined}
          esticar={esticarVideo} agencia={fabrica.agencyName || ""} linkNarrador={LINK_NARRADOR} aoLegendas={(on) => void ligarLegendas(on)} verVideo={() => setTocando(true)} />
      )}
      {ferr === "traduzir" && modoVideo && <PainelTraduzir traduzir={traduzirVideo} irParaNarracao={() => setFerr("narracao")} />}
      {ferr === "cena" && (
        <PainelCena
          nome={`Cena ${pag + 1} de ${paginas.length}`} ajuste={cena} durPadrao={3} durClipe={duracaoClipe} semFundo inteiro={!a.video}
          mudar={(p) => mudarCena(p as Partial<CenaVideo>)} aplicarEmTodas={(c) => aplicarNasCenas(c as (keyof CenaVideo)[])} clipes={[]}
        />
      )}
      {ferr === "animar" && (
        <PainelAnimarItem
          nome={sel && sel !== fotoPrincipal ? "Item escolhido" : "Todos os itens desta cena"}
          anim={animDe(sel && sel !== fotoPrincipal ? sel : null)} durCena={durDa(a)} mudar={mudarAnim}
          todosDaCena={sel && sel !== fotoPrincipal ? animEmTodosDaCena : undefined} todasAsCenas={animEmTodasAsCenas} aoVer={pedirPrevia}
        />
      )}
      {ferr === "modelos" && modoVideo && (
        <div data-modelos-video className="flex flex-col gap-4">
          <div>
            <p className={rotulo}>Visual desta cena</p>
            <div className="flex flex-wrap gap-1.5">
              {VISUAIS_CENA.map((v) => <button key={v.id} data-visual-cena={v.id} onClick={() => mudarVisual(v.id)} className={chip(!!cena.livre && (cena.visual || "classico") === v.id)}>{v.nome}</button>)}
            </div>
            <p className="mt-1.5 text-[11px] text-white/45">{VISUAIS_CENA.find((v) => v.id === (cena.visual || "classico"))?.desc}</p>
            <button type="button" data-visual-todas onClick={() => visualEmTodas((cena.visual || "classico") as VisualCena)} className="mt-2 min-h-10 w-full rounded-xl border border-white/15 text-[13px] font-bold">Usar este estilo no vídeo inteiro</button>
          </div>
          <p className={rotulo}>Ou use um anúncio nesta cena (o vídeo toca no lugar da foto)</p>
        </div>
      )}
      {ferr === "modelos" && (
        <div>
          {!modoVideo && <p className={rotulo}>{novaPag ? "Escolha o modelo da página nova." : "Toque num modelo: você escolhe se troca esta página, cria outra ou só muda o fundo."}</p>}
          <div className={`mb-3 grid grid-cols-2 gap-1.5 ${modoVideo ? "hidden" : ""}`}>
            <button data-aba-modelos="square" onClick={() => setAbaModelos("square")} className={chip(abaModelos === "square")}>Feed (quadrado)</button>
            <button data-aba-modelos="story" onClick={() => setAbaModelos("story")} className={chip(abaModelos === "story")}>Stories (em pé)</button>
          </div>
          <div className={`grid gap-2 ${abaModelos === "story" ? "grid-cols-3" : "grid-cols-3 lg:grid-cols-2"}`}>
            {MODELOS_ARTE.map((v) => {
              const k = abaModelos === "story" ? v + STORY : v;
              const on = a.variant === v && a.formato === abaModelos && !(modoVideo && cena.livre);
              return (
                <button key={k} data-modelo={k} aria-label={`Modelo ${v + 1}`} aria-pressed={on} onClick={() => escolherModelo(v, abaModelos)} className={`overflow-hidden rounded-xl border-2 ${on ? "border-[#F5F906]" : "border-transparent"}`}>
                  {minis.get(k) ? <img src={minis.get(k)} alt="" className={`${abaModelos === "story" ? "aspect-[9/16]" : "aspect-square"} w-full object-cover`} /> : <div className={`grid ${abaModelos === "story" ? "aspect-[9/16]" : "aspect-square"} w-full animate-pulse place-items-center bg-white/[0.06] text-[12px] font-bold text-white/50`}>{v + 1}</div>}
                </button>
              );
            })}
          </div>
        </div>
      )}
      {ferr === "modelos" && modoVideo && (
        <div data-trocar-video-inteiro className="mt-2 flex flex-col gap-4 border-t border-white/10 pt-4">
          <div>
            <p className={rotulo}>Trocar o vídeo inteiro por outro modelo</p>
            {CATEGORIAS_VIDEO.map((c) => (
              <div key={c.id} className="mb-2">
                <p className="mb-1 text-[11px] font-bold text-white/45">{c.nome}</p>
                <div className="grid grid-cols-3 gap-1.5">
                  {VIDEOS.filter((v) => v.cat === c.id).map((v) => (
                    <button key={v.id} data-trocar-video={v.id} title={v.nome} onClick={() => trocarVideoInteiro(v)} className="overflow-hidden rounded-lg border border-white/10 text-left">
                      <img src={`/video-fundos/capas/${v.cena}.jpg`} alt="" loading="lazy" className="aspect-[9/16] w-full object-cover" />
                      <span className="block truncate px-1 py-0.5 text-[10px] font-bold">{v.nome}</span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      {ferr === "foto" && (
        <>
          <div>
            <p className={rotulo}>Destinos com foto pronta</p>
            <div className="flex flex-wrap gap-1.5">
              {TRIAL_DESTINOS.map((d) => (
                <button key={d.id} data-destino={d.id} onClick={() => { mudar({ destino: d.nome, foto: trialPhotoUrl(d.photo, 1280) }); setBusca(d.nome); buscarFotos(d.nome); }} className={chip(a.destino === d.nome)}>{d.nome}</button>
              ))}
            </div>
          </div>
          <div>
            <label htmlFor="ed-busca" className={rotulo}>Buscar fotos de um lugar</label>
            <div className="flex gap-2">
              <input id="ed-busca" className={campo} placeholder="Ex.: Paris, Cancún" value={busca} onChange={(e) => setBusca(e.target.value)} onKeyDown={(e) => e.key === "Enter" && buscarFotos()} />
              <button onClick={() => buscarFotos()} disabled={buscando} className="min-h-11 shrink-0 rounded-xl px-4 text-[13px] font-black text-black disabled:opacity-60" style={{ background: AMARELO }}>{buscando ? "…" : "Buscar"}</button>
            </div>
          </div>
          {buscando && <p className="text-[12px] text-white/50">Buscando fotos…</p>}
          {fotos.length > 0 && <p className={rotulo}>Fotos de {busca || a.destino} (toque para usar)</p>}
          {fotos.length > 0 && (
            <div data-fotos-achadas className="grid grid-cols-3 gap-1.5">
              {fotos.map((f) => (
                <button key={f.url} onClick={() => mudar({ foto: f.url })} className={`overflow-hidden rounded-lg border-2 ${a.foto === f.url ? "border-[#F5F906]" : "border-transparent"}`}><img src={f.thumb} alt="" loading="lazy" className="aspect-square w-full object-cover" /></button>
              ))}
            </div>
          )}
          <label className="flex min-h-12 cursor-pointer items-center justify-center rounded-xl border border-dashed border-white/25 text-[13px] font-bold">
            Enviar uma foto minha
            <input type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) lerArquivo(f, (u) => mudar({ foto: u })); }} />
          </label>
        </>
      )}
      {ferr === "texto" && (
        <>
          {modoVideo && (
            <div>
              <p className={rotulo}>Textos de vídeo (toque para pôr na cena)</p>
              <div className="grid grid-cols-2 gap-2">
                {ESTILOS_CENA.map((e) => (
                  <button key={e.id} data-estilo-texto={e.id} aria-label={e.nome} onClick={() => porTexto(e.id)} className="flex h-20 items-center justify-center overflow-hidden rounded-xl p-2" style={{ backgroundImage: `linear-gradient(rgba(0,0,0,.4),rgba(0,0,0,.4)), url(${fotoDasPrevias})`, backgroundSize: "cover", backgroundPosition: "center" }}>
                    {previas[`t_${e.id}`] ? <img src={previas[`t_${e.id}`]} alt="" className="max-h-full max-w-full object-contain" /> : <span className="text-[11px] font-bold" style={{ color: "#fff" }}>{e.nome}</span>}
                  </button>
                ))}
              </div>
            </div>
          )}
          <div>
            <p className={rotulo}>Textos com estilo (toque para pôr na arte)</p>
            <div className="grid grid-cols-2 gap-2">
              {ESTILOS_TEXTO.map((e) => (
                <button key={e.id} data-estilo-texto={e.id} aria-label={e.nome} onClick={() => porTexto(e.id)} className="flex h-20 items-center justify-center overflow-hidden rounded-xl p-2" style={{ backgroundImage: `linear-gradient(rgba(0,0,0,.4),rgba(0,0,0,.4)), url(${fotoDasPrevias})`, backgroundSize: "cover", backgroundPosition: "center" }}>
                  {previas[`t_${e.id}`] ? <img src={previas[`t_${e.id}`]} alt="" className="max-h-full max-w-full object-contain" /> : <span className="text-[11px] font-bold" style={{ color: "#fff" }}>{e.nome}</span>}
                </button>
              ))}
            </div>
            <p className="mt-1.5 text-[11px] text-white/45">Depois toque no texto e toque de novo para escrever nele.</p>
          </div>
          {!cena.livre && (<>
          <div>
            <label htmlFor="ed-destino" className={rotulo}>Destino</label>
            <input id="ed-destino" className={campo} maxLength={40} value={a.destino} onChange={(e) => mudar({ destino: e.target.value })} />
          </div>
          <div>
            <p className={rotulo}>Título (toque num pronto ou escreva)</p>
            <div className="mb-2 flex flex-wrap gap-1.5">
              {titulosProntos(a.destino).map((x, i) => <button key={x} onClick={() => mudar({ titulo: i === 0 ? "" : x })} className={chip((a.titulo || `Pacote ${a.destino}`) === x)}>{x}</button>)}
            </div>
            <input aria-label="Título" className={campo} maxLength={40} placeholder={`Pacote ${a.destino}`} value={a.titulo} onChange={(e) => mudar({ titulo: e.target.value })} />
          </div>
          <div>
            <p className={rotulo}>Selo da promoção</p>
            <div className="flex flex-wrap gap-1.5">{PROMOS.map((x) => <button key={x} onClick={() => mudar({ promo: x })} className={chip(a.promo === x)}>{x}</button>)}</div>
          </div>
          <div>
            <label htmlFor="ed-periodo" className={rotulo}>Dias ou data da viagem</label>
            <input id="ed-periodo" className={campo} maxLength={24} placeholder="Ex.: 5 dias, Janeiro" value={a.periodo} onChange={(e) => mudar({ periodo: e.target.value })} />
          </div>
          </>)}
          <p className="text-[12px] text-white/45">Dica: toque num texto da arte para escolher. Toque de novo para escrever nele ali mesmo.</p>
        </>
      )}
      {ferr === "preco" && (
        <>
          <div>
            <p className={rotulo}>Selos de preço (toque para pôr na arte)</p>
            <div className="grid grid-cols-2 gap-2">
              {ESTILOS_PRECO.map((e) => (
                <button key={e.id} data-estilo-preco={e.id} aria-label={e.nome} onClick={() => porPreco(e.id)} className="flex h-24 items-center justify-center overflow-hidden rounded-xl p-2" style={{ backgroundImage: `linear-gradient(rgba(0,0,0,.35),rgba(0,0,0,.35)), url(${fotoDasPrevias})`, backgroundSize: "cover", backgroundPosition: "center" }}>
                  {previas[`p_${e.id}`] ? <img src={previas[`p_${e.id}`]} alt="" className="max-h-full max-w-full object-contain" /> : <span className="text-[11px] font-bold" style={{ color: "#fff" }}>{e.nome}</span>}
                </button>
              ))}
            </div>
            <p className="mt-1.5 text-[11px] text-white/45">Depois toque no selo e toque de novo para mudar o valor.</p>
          </div>
          {!cena.livre && (<>
          <div>
            <p className={rotulo}>Como mostrar o preço</p>
            <div className="flex flex-wrap gap-1.5">{PAGAMENTOS.map((p) => <button key={p.id} onClick={() => mudar({ pagamento: p.id })} className={chip(a.pagamento === p.id)}>{p.nome}</button>)}</div>
          </div>
          {a.pagamento !== "free_quote" && (
            <>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label htmlFor="ed-preco" className={rotulo}>Valor (R$)</label>
                  <input id="ed-preco" className={campo} inputMode="decimal" placeholder="Ex.: 249" maxLength={10} value={a.preco} onChange={(e) => mudar({ preco: e.target.value })} />
                </div>
                {(a.pagamento === "installments" || a.pagamento === "down_plus") && (
                  <div>
                    <label htmlFor="ed-parcelas" className={rotulo}>Parcelas</label>
                    <input id="ed-parcelas" className={campo} maxLength={4} value={a.parcelas} onChange={(e) => mudar({ parcelas: e.target.value })} />
                  </div>
                )}
              </div>
              <div className="grid grid-cols-2 gap-2">
                {(a.pagamento === "installments" || a.pagamento === "down_plus") && (
                  <div>
                    <label htmlFor="ed-prefixo" className={rotulo}>Antes do valor</label>
                    <input id="ed-prefixo" className={campo} maxLength={20} value={a.prefixo} onChange={(e) => mudar({ prefixo: e.target.value })} />
                  </div>
                )}
                <div>
                  <label htmlFor="ed-compl" className={rotulo}>Depois do valor</label>
                  <input id="ed-compl" className={campo} maxLength={20} value={a.complemento} onChange={(e) => mudar({ complemento: e.target.value })} />
                </div>
              </div>
              {!a.preco.trim() && <p className="text-[12px] text-amber-200/80">Escreva o valor para o preço aparecer na arte.</p>}
            </>
          )}
          </>)}
        </>
      )}
      {ferr === "inclusos" && (
        <>
          <div>
            <p className={rotulo}>{cena.livre ? "Toque num item para pôr na cena (vira um texto que você move e anima)" : `O que o pacote inclui (${a.inclusos.length} de 6 na arte)`}</p>
            <div className="flex flex-wrap gap-1.5">
              {[...INCLUSOS.map((i) => i.texto), ...a.inclusos.filter((tx) => !INCLUSOS.some((i) => i.texto === tx))].map((tx) => {
                const on = !cena.livre && a.inclusos.includes(tx);
                const cheio = !cena.livre && !on && a.inclusos.length >= 6;
                return <button key={tx} data-incluso={tx} onClick={() => { if (cena.livre) { void porItemCena(tx); return; } if (cheio) { setAviso("A arte mostra até 6 itens. Toque num marcado para tirar e pôr outro."); setTimeout(() => setAviso(""), 4000); return; } mudar({ inclusos: on ? a.inclusos.filter((q) => q !== tx) : [...a.inclusos, tx] }); }} className={`${chip(on)} ${cheio ? "opacity-40" : ""}`}>{on ? "✓ " : "+ "}{tx}</button>;
              })}
            </div>
          </div>
          <div>
            <label htmlFor="ed-incluso" className={rotulo}>Escrever outro item</label>
            <div className="flex gap-2">
              <input id="ed-incluso" className={campo} maxLength={26} placeholder="Ex.: Jantar de boas-vindas" value={novoIncluso} onChange={(e) => setNovoIncluso(e.target.value)} onKeyDown={(e) => { if (e.key !== "Enter") return; if (cena.livre) { void porItemCena(novoIncluso); setNovoIncluso(""); } else porIncluso(); }} />
              <button onClick={() => { if (cena.livre) { void porItemCena(novoIncluso); setNovoIncluso(""); } else porIncluso(); }} disabled={!novoIncluso.trim()} className="min-h-11 shrink-0 rounded-xl px-4 text-[13px] font-black disabled:opacity-50" style={{ background: AMARELO, color: "#111" }}>Pôr</button>
            </div>
          </div>
        </>
      )}
      {ferr === "elementos" && (
        <>
          <div data-redes-painel>
            <p className={rotulo}>Redes sociais (toque para pôr na arte)</p>
            <div className="flex flex-col gap-2">
              {REDES.filter((rd) => maisRedes || rd.id === "whatsapp" || rd.id === "instagram" || !!textoRede[rd.id]).map((rd) => (
                <div key={rd.id} className="flex items-center gap-2">
                  <button data-por-rede={rd.id} onClick={() => porRede(rd.id)} className="flex min-h-11 w-[124px] shrink-0 items-center gap-2 rounded-xl border border-white/15 px-2.5 text-[13px] font-bold">
                    <img src={`/icones-redes/${rd.id}.svg`} alt="" className="h-6 w-6 shrink-0 object-contain" />{rd.nome}
                  </button>
                  <input data-texto-rede={rd.id} aria-label={`Texto do ${rd.nome}`} className={campo} placeholder={rd.exemplo} value={textoDaRede(rd.id)} onChange={(e) => mudarTextoRede(rd.id, e.target.value)} />
                </div>
              ))}
              <button data-mais-redes aria-expanded={maisRedes} onClick={() => setMaisRedes(!maisRedes)} className="flex min-h-10 items-center justify-center gap-2 rounded-xl border border-dashed border-white/20 text-[13px] font-bold text-white/75 hover:bg-white/[0.05]">
                {maisRedes ? <>Mostrar menos<ChevronsUp className="h-4 w-4" /></> : (
                  <>
                    <span className="flex -space-x-1.5">{REDES.filter((rd) => rd.id !== "whatsapp" && rd.id !== "instagram").map((rd) => <img key={rd.id} src={`/icones-redes/${rd.id}.svg`} alt="" className="h-5 w-5 rounded-full bg-white object-contain p-0.5" />)}</span>
                    Mais redes<ChevronsDown className="h-4 w-4" />
                  </>
                )}
              </button>
            </div>
            <p className="mt-1.5 text-[11px] text-white/45">Escreva o seu @, link ou número: a rede entra na arte sozinha (canto de baixo) e muda na hora. Tocar no botão da rede põe mais uma. Vazio: só a logo.</p>
          </div>
          <div data-icones-painel>
            <p className={rotulo}>Ícones (toque para pôr na arte)</p>
            <div className="grid grid-cols-4 gap-1.5 sm:grid-cols-6">
              {SUGESTOES_ICONE.map((q) => (
                <button key={q.nome} data-sugestao-icone={q.nome} title={q.nome} onClick={() => { void porIcone(q.icone); void procurarIcones(q.nome); }} className="flex flex-col items-center gap-1 rounded-xl p-1.5 hover:bg-white/[0.08]" style={{ background: semAcentoTela(buscaIcone) === semAcentoTela(q.nome) ? (claro ? "#FFF7B0" : "rgba(245,249,6,.14)") : claro ? "#F4F4F5" : "rgba(255,255,255,.05)" }}>
                  <img src={miniaturaIcone(q.icone)} alt="" loading="lazy" className="h-9 w-9 object-contain" />
                  <span className="text-[11px] font-semibold leading-tight text-white/75">{q.nome}</span>
                </button>
              ))}
            </div>
            <label htmlFor="ed-busca-icone" className="mt-3 block text-[12px] font-bold text-white/60">Procurar outro ícone</label>
            <div className="mt-1.5 flex gap-2">
              <input id="ed-busca-icone" className={campo} placeholder="Ex.: câmera, montanha, ônibus" value={buscaIcone} onChange={(e) => setBuscaIcone(e.target.value)} onKeyDown={(e) => e.key === "Enter" && procurarIcones()} />
              <button onClick={() => procurarIcones()} disabled={buscandoIcone} className="min-h-11 shrink-0 rounded-xl px-4 text-[13px] font-black disabled:opacity-60" style={{ background: AMARELO, color: "#111" }}>{buscandoIcone ? "…" : "Buscar"}</button>
            </div>
            {icones.length > 0 && (
              <div data-icones-achados className="mt-2 grid grid-cols-6 gap-1.5">
                {icones.map((nome) => (
                  <button key={nome} data-icone={nome} title={nome} onClick={() => porIcone(nome)} className="grid aspect-square place-items-center rounded-lg p-1.5" style={{ background: "#F4F4F5" }}>
                    <img src={miniaturaIcone(nome)} alt="" loading="lazy" className="h-full w-full object-contain" />
                  </button>
                ))}
              </div>
            )}
            <p className="mt-1.5 text-[11px] text-white/45">Ícones grátis do Iconify. Os de uma cor só mudam de cor: toque no ícone e use Cor.</p>
          </div>
          <div data-formas>
            <p className={rotulo}>Formas (toque para pôr na arte)</p>
            <div className="flex flex-col gap-3">
              {CATEGORIAS_FORMA.map((cat) => {
                const aberta = formasAbertas === cat.id;
                const lista = aberta ? cat.formas : cat.formas.slice(0, 6);
                return (
                  <div key={cat.id} data-categoria-forma={cat.id}>
                    <div className="mb-1.5 flex items-center justify-between">
                      <span className="text-[12px] font-bold text-white/80">{cat.nome}</span>
                      {cat.formas.length > 6 && <button data-ver-formas={cat.id} onClick={() => setFormasAbertas(aberta ? null : cat.id)} className="min-h-8 rounded-full px-2 text-[11px] font-bold text-white/60 hover:bg-white/[0.06]">{aberta ? "Ver menos" : `Ver todas (${cat.formas.length})`}</button>}
                    </div>
                    <div className="grid grid-cols-6 gap-1.5">
                      {lista.map((fm) => (
                        <button key={fm.id} data-forma={fm.id} title={fm.nome} aria-label={fm.nome} onClick={() => porForma(fm.id)} className="grid aspect-square place-items-center rounded-lg bg-white/[0.06] p-1.5 text-white/80 hover:bg-white/[0.12]">
                          <span className="block h-full w-full" dangerouslySetInnerHTML={{ __html: svgDaForma(fm) }} />
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
            <p className="mt-1.5 text-[11px] text-white/45">Depois de pôr, toque na forma para mudar a cor, o tamanho, a transparência e os efeitos.</p>
          </div>
          <div data-formas-imagem>
            <p className={rotulo}>Formas de imagem (foto dentro da forma)</p>
            <div className="grid grid-cols-6 gap-1.5">
              {MOLDES_IMAGEM.map((fm) => (
                <button key={fm.id} data-moldura={fm.id} title={fm.nome} aria-label={`Foto em: ${fm.nome}`} onClick={() => usarMoldura(fm.id)} className="grid aspect-square place-items-center rounded-lg bg-white/[0.06] p-1 hover:bg-white/[0.12]">
                  <span className="block h-full w-full" dangerouslySetInnerHTML={{ __html: svgDaForma(fm, true) }} />
                </button>
              ))}
            </div>
            <p className="mt-1.5 text-[11px] text-white/45">{extraSel?.tipo === "imagem" ? "Toque numa forma: a imagem escolhida fica nesse formato." : "Toque numa forma e escolha a foto: ela entra já nesse formato. Com uma imagem escolhida na arte, a forma vai para ela."}</p>
          </div>
          <div>
            <p className={rotulo}>Imagem a mais (foto do hotel, do passeio…)</p>
            <label className={`flex min-h-12 cursor-pointer items-center justify-center rounded-xl border border-dashed border-white/25 text-[13px] font-bold ${preparando ? "opacity-60" : ""}`}>
              {preparando ? "Preparando…" : "Enviar uma imagem"}
              <input data-por-imagem type="file" accept="image/*" className="hidden" onChange={(e) => { const fl = e.target.files?.[0]; if (fl) lerArquivo(fl, (u) => porImagem(u)); e.target.value = ""; }} />
            </label>
            {fotos.length > 0 && (
              <>
                <p className="mb-1.5 mt-3 text-[11px] text-white/45">Ou uma das fotos que você buscou:</p>
                <div className="grid grid-cols-4 gap-1.5">
                  {fotos.slice(0, 8).map((ft) => <button key={ft.url} onClick={() => porImagem(ft.url)} className="overflow-hidden rounded-lg"><img src={ft.thumb} alt="" loading="lazy" className="aspect-square w-full object-cover" /></button>)}
                </div>
              </>
            )}
          </div>
          <p className="text-[12px] text-white/45">Vídeo por cima da foto: use o Gerador de vídeo. A arte sai em imagem (PNG, JPG ou WebP).</p>
        </>
      )}
      {ferr === "marca" && (
        <>
          <p className="text-[12px] text-white/55">Fica salvo nos seus Dados do Perfil e entra sozinho em todas as artes e vídeos.</p>
          <div className="flex items-center gap-3">
            <span className="grid h-16 w-16 shrink-0 place-items-center overflow-hidden rounded-2xl bg-white/[0.07] text-[11px] text-white/45">{fabrica.logoBase64 ? <img src={fabrica.logoBase64} alt="Sua logo" className="h-full w-full object-contain" /> : "logo"}</span>
            <label className="flex min-h-11 flex-1 cursor-pointer items-center justify-center rounded-xl border border-dashed border-white/25 text-[13px] font-bold">
              {fabrica.logoBase64 ? "Trocar a logo" : "Enviar a logo"}
              <input type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) lerArquivo(f, (u) => { update({ logoBase64: u }); void logoNoVideo(u); }); e.target.value = ""; }} />
            </label>
          </div>
          {fabrica.logoBase64 && !modoVideo && (
            <div className="flex gap-1.5">
              <button onClick={() => update({ logoFormat: "circle" })} className={chip(fabrica.logoFormat !== "square")}>Logo redonda</button>
              <button onClick={() => update({ logoFormat: "square" })} className={chip(fabrica.logoFormat === "square")}>Logo quadrada</button>
            </div>
          )}
          {modoVideo && (
            <div data-logo-video className="flex flex-col gap-2.5 rounded-2xl border border-white/10 p-3">
              <p className="text-[14px] font-extrabold">Logo no vídeo</p>
              {!fabrica.logoBase64 && <p className="text-[12px] text-white/55">Envie a sua logo acima para escolher onde ela aparece.</p>}
              <div>
                <p className={rotulo}>Onde aparece</p>
                <div className="grid grid-cols-2 gap-1.5">
                  {ONDE_LOGO.map((o) => <button key={o.id} type="button" data-logo-onde={o.id} disabled={!fabrica.logoBase64 && o.id !== "nenhuma"} onClick={() => void arrumarLogo({ onde: o.id })} className={chip((logoVideo?.onde ?? "todas") === o.id) + " disabled:opacity-40"}>{o.nome}</button>)}
                </div>
              </div>
              <div>
                <p className={rotulo}>Formato</p>
                <div className="grid grid-cols-2 gap-1.5">
                  {FORMATOS_LOGO.map((f) => <button key={f.id} type="button" data-logo-formato={f.id} disabled={!fabrica.logoBase64} onClick={() => void arrumarLogo({ formato: f.id })} className={chip((logoVideo?.formato ?? "placa") === f.id) + " disabled:opacity-40"}>{f.nome}</button>)}
                </div>
                <p className="mt-1.5 text-[11px] text-white/45">Sem fundo: use uma logo em PNG com fundo transparente.</p>
              </div>
            </div>
          )}
          <div>
            <label htmlFor="ed-whats" className={rotulo}>WhatsApp</label>
            <input id="ed-whats" className={campo} inputMode="tel" placeholder="(82) 99999-9999" value={zapDeLer(fabrica.whatsapp)} onChange={(e) => update({ whatsapp: e.target.value.replace(/\D/g, "").slice(0, 13) })} />
          </div>
          <div>
            <label htmlFor="ed-insta" className={rotulo}>Instagram</label>
            <input id="ed-insta" className={campo} placeholder="@suaagencia" value={fabrica.instagram} onChange={(e) => update({ instagram: e.target.value })} />
          </div>
          <div data-kit-marca className="flex flex-col gap-3 border-t border-white/10 pt-4">
            <div>
              <p className="text-[15px] font-extrabold">Kit de marca</p>
              <p className="text-[12px] text-white/55">As cores e as fontes da sua agência, prontas em toda arte.</p>
            </div>
            <div>
              <p className={rotulo}>Cores da marca</p>
              <div className="flex flex-wrap items-center gap-2.5">
                {coresMarca.map((c, i) => (
                  <span key={i} className="relative">
                    <label data-cor-marca={i} title="Toque para mudar a cor" className="relative block h-11 w-11 cursor-pointer rounded-full" style={{ background: c, border: "2px solid rgba(127,127,127,.35)" }}>
                      <input type="color" aria-label={`Cor da marca ${i + 1}`} value={c} onChange={(e) => mudarKit({ cores: coresMarca.map((q, j) => (j === i ? e.target.value.toUpperCase() : q)) })} className="absolute inset-0 h-full w-full cursor-pointer opacity-0" />
                    </label>
                    {coresMarca.length > 1 && <button data-tirar-cor-marca={i} aria-label={`Tirar a cor ${i + 1}`} onClick={() => mudarKit({ cores: coresMarca.filter((_, j) => j !== i) })} className="absolute -right-1.5 -top-1.5 grid h-5 w-5 place-items-center rounded-full" style={{ background: "#111111", color: "#FFFFFF", border: "1px solid rgba(255,255,255,.5)" }}><X className="h-3 w-3" /></button>}
                  </span>
                ))}
                {coresMarca.length < 6 && <button data-nova-cor-marca aria-label="Adicionar cor da marca" title="Adicionar cor" onClick={() => mudarKit({ cores: [...coresMarca, ["#0B63CE", "#16A34A", "#E11D2E", "#7C3AED", "#FFFFFF", "#F5F906", "#111111"].find((q) => q && !coresMarca.includes(q)) || "#0B63CE"] })} className="grid h-11 w-11 place-items-center rounded-full border border-dashed border-white/35 text-white/80"><Plus className="h-4 w-4" /></button>}
              </div>
              {!coresMarca.length && <p className="mt-1.5 text-[12px] text-white/45">Toque no + para pôr as cores da sua logo.</p>}
            </div>
            <div className="grid grid-cols-2 gap-2">
              {([["fonteTitulo", "Fonte do título"], ["fonteTexto", "Fonte do texto"]] as const).map(([k, nome]) => (
                <label key={k} className="flex min-w-0 flex-col">
                  <span className={rotulo}>{nome}</span>
                  <select data-fonte-marca={k} value={kit[k]} onChange={(e) => mudarKit({ [k]: e.target.value })} className={`${campo} px-2`} style={{ fontFamily: kit[k] || undefined }}>
                    <option value="">Escolher</option>
                    {FONTES.map((f) => <option key={f} value={f} style={{ fontFamily: f }}>{f}</option>)}
                  </select>
                </label>
              ))}
            </div>
            <button data-usar-kit onClick={() => void usarKit()} disabled={!coresMarca.length && !kit.fonteTitulo && !kit.fonteTexto} className="min-h-11 rounded-full text-[14px] font-black text-black disabled:opacity-40" style={{ background: AMARELO }}>Usar o kit nesta arte</button>
            <p className="text-[11px] text-white/45">A 1ª cor vira o fundo e a 2ª o destaque. A fonte do título vai no texto maior. As cores da marca também aparecem quando você muda a cor de um item.</p>
          </div>
        </>
      )}
      {ferr === "cores" && (
        <>
          <div>
            <p className={rotulo}>Paleta de cores</p>
            <div className="grid grid-cols-4 gap-2">
              {coresMarca.length > 1 && (
                <button data-paleta-marca onClick={() => mudar({ cor1: coresMarca[0], cor2: coresMarca[1] })} className={`flex flex-col items-center gap-1 rounded-xl border-2 p-1.5 ${a.cor1 === coresMarca[0] && a.cor2 === coresMarca[1] ? "border-[#F5F906]" : "border-white/10"}`}>
                  <span className="flex h-8 w-full overflow-hidden rounded-lg"><span className="flex-1" style={{ background: coresMarca[0] }} /><span className="flex-1" style={{ background: coresMarca[1] }} /></span>
                  <span className="text-[11px] font-semibold text-white/70">Sua marca</span>
                </button>
              )}
              {PALETAS.map((p) => (
                <button key={p.nome} onClick={() => mudar({ cor1: p.cor1, cor2: p.cor2 })} className={`flex flex-col items-center gap-1 rounded-xl border-2 p-1.5 ${a.cor1 === p.cor1 && a.cor2 === p.cor2 ? "border-[#F5F906]" : "border-white/10"}`}>
                  <span className="flex h-8 w-full overflow-hidden rounded-lg"><span className="flex-1" style={{ background: p.cor1 }} /><span className="flex-1" style={{ background: p.cor2 }} /></span>
                  <span className="text-[11px] font-semibold text-white/70">{p.nome}</span>
                </button>
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <div data-duas-cores className="grid grid-cols-2 gap-2">
              {([["cor1", "Cor 1", "fundo"], ["cor2", "Cor 2", "destaque"]] as const).map(([k, nome, papel]) => (
                <label key={k} data-cor-arte={k} className="relative flex min-h-14 cursor-pointer items-center gap-2 rounded-xl border border-white/10 p-2" title={`${nome} (${papel})`}>
                  <span className="h-10 w-10 shrink-0 rounded-lg" style={{ background: a[k], border: "2px solid rgba(127,127,127,.35)" }} />
                  <span className="min-w-0"><b className="block text-[13px]">{nome}</b><span className="block text-[11px] text-white/50">{papel}</span></span>
                  <input type="color" aria-label={`${nome} (${papel})`} value={a[k]} onChange={(e) => mudar({ [k]: e.target.value.toUpperCase() })} className="absolute inset-0 h-full w-full cursor-pointer opacity-0" />
                </label>
              ))}
            </div>
            <button data-ver-codigo onClick={() => setVerCodigo(!verCodigo)} className="self-start text-[12px] font-semibold text-white/55 underline underline-offset-2">{verCodigo ? "Esconder o código das cores" : "Digitar o código da cor (#)"}</button>
            {verCodigo && (
              <div className="grid grid-cols-2 gap-2">
                {([["cor1", "Cor 1", hex1, setHex1], ["cor2", "Cor 2", hex2, setHex2]] as const).map(([k, nome, hx, setHx]) => (
                  <input key={k} data-hex={k} aria-label={`Código da ${nome}`} className="min-h-9 w-full rounded-lg border border-white/10 bg-white/[0.05] px-2 font-mono text-[15px] uppercase outline-none focus:border-[#F5F906]" maxLength={7} placeholder="#000000" value={hx || a[k].toUpperCase()} onChange={(e) => { setHx(e.target.value); const c = corValida(e.target.value); if (c) mudar({ [k]: c }); }} onBlur={() => setHx("")} />
                ))}
              </div>
            )}
            <button data-inverter onClick={() => mudar({ cor1: a.cor2, cor2: a.cor1 })} className="flex min-h-11 items-center justify-center gap-2 rounded-xl border border-white/15 text-[13px] font-bold">⇄ Inverter as cores</button>
          </div>
          <div>
            <p className={rotulo}>Cor das letras em cima das faixas e selos</p>
            <div className="flex flex-wrap gap-1.5">
              {[{ n: "Automática", c: "" }, { n: "Amarelo", c: "#F5F906" }, { n: "Branco", c: "#FFFFFF" }, { n: "Preto", c: "#111111" }, { n: "Cor 2", c: a.cor2 }].map((q) => <button key={q.n} onClick={() => mudar({ corTexto: q.c })} className={chip(a.corTexto === q.c)}>{q.n}</button>)}
              <label className="relative min-h-10 cursor-pointer rounded-full border border-white/15 px-3.5 text-[13px] font-semibold leading-10">Outra<input type="color" aria-label="Outra cor das letras" value={a.corTexto || "#F5F906"} onChange={(e) => mudar({ corTexto: e.target.value.toUpperCase() })} className="absolute inset-0 h-full w-full cursor-pointer opacity-0" /></label>
            </div>
            <p className="mt-1.5 text-[11px] text-white/45">Se a cor não der para ler no fundo, a arte usa branco ou preto. Para mudar um texto só, toque nele e use Cor.</p>
          </div>
          <div>
            <p className={rotulo}>Fonte</p>
            <div className="grid grid-cols-2 gap-1.5">
              {FONTES.map((f) => <button key={f} onClick={() => mudar({ fonte: f })} className={`${chip(a.fonte === f)} truncate`} style={{ fontFamily: f }}>{f}</button>)}
            </div>
          </div>
        </>
      )}
      {ferr === "cor" && sel && (
        <>
          <div>
            {coresMarca.length > 0 && (
              <div data-cores-marca-item className="mb-3">
                <p className={rotulo}>Cores da sua marca</p>
                <div className="flex flex-wrap items-center gap-2">{coresMarca.map((c) => bolinha(c, "h-9 w-9"))}</div>
              </div>
            )}
            <p className={rotulo}>Cores da arte</p>
            <div className="flex flex-wrap items-center gap-2">
              <button data-cor-original onClick={() => aplicarCor("")} className={chip(!corSel && !gradSel)}>Original</button>
              {Array.from(new Set([a.cor1.toUpperCase(), a.cor2.toUpperCase()])).map((c) => bolinha(c, "h-9 w-9"))}
              <label title="Outra cor" className="relative h-9 w-9 shrink-0 cursor-pointer rounded-full" style={{ background: "conic-gradient(#E11D2E,#F5F906,#16A34A,#0B63CE,#7C3AED,#E11D2E)", border: "2px solid rgba(127,127,127,.35)" }}>
                <input type="color" aria-label="Outra cor" value={/^#[0-9a-f]{6}$/i.test(corSel) ? corSel : "#F5F906"} onChange={(e) => aplicarCor(e.target.value.toUpperCase())} className="absolute inset-0 h-full w-full cursor-pointer opacity-0" />
              </label>
            </div>
          </div>
          <div>
            <p className={rotulo}>Cores sólidas</p>
            <div data-cores-solidas className="grid grid-cols-7 gap-2">{CORES_SOLIDAS.map((c) => bolinha(c))}</div>
          </div>
          {podeDegrade && (
            <div>
              <p className={rotulo}>Degradês</p>
              <div data-degrades className="grid grid-cols-7 gap-2">
                {DEGRADES.map((g) => {
                  const on = !!gradSel && gradSel[0] === g[0] && gradSel[1] === g[1];
                  return <button key={g.join("-")} data-degrade={g.join("-")} aria-label={`Degradê de ${g[0]} a ${g[1]}`} onClick={() => aplicarDegrade(g)} className="aspect-square w-full rounded-full" style={{ background: `linear-gradient(135deg, ${g[0]}, ${g[1]})`, border: on ? "3px solid #8B5CF6" : "2px solid rgba(127,127,127,.35)" }} />;
                })}
              </div>
            </div>
          )}
        </>
      )}
      {ferr === "efeitos" && sel && (
        <>
          <div data-lista-efeitos className="grid grid-cols-3 gap-2">
            {listaFx.map((id) => {
              const nome = EFEITOS.find((e) => e.id === id)?.nome || id;
              const on = (fxSel?.tipo || "") === id;
              return (
                <button key={id || "nenhum"} data-efeito={id || "nenhum"} aria-pressed={on} onClick={() => escolherFx(id)} className="flex flex-col items-center gap-1 rounded-xl p-1" style={{ border: on ? "2px solid #8B5CF6" : "2px solid transparent" }}>
                  <span className="grid h-16 w-full place-items-center overflow-hidden rounded-lg" style={{ background: "#ECECEF" }}>{previaFx(id)}</span>
                  <span className="text-[11px] font-semibold text-white/75">{nome}</span>
                </button>
              );
            })}
          </div>
          {fxSel && (
            <div className="flex flex-col gap-3 rounded-xl border border-white/10 p-3">
              <label className="flex flex-col gap-1 text-[12px] font-bold text-white/70">
                <span className="flex justify-between">{fxSel.tipo === "curvar" ? "Curvatura" : "Força"}<span data-forca-valor>{fxSel.forca ?? 50}</span></span>
                <input data-forca type="range" min={5} max={100} value={fxSel.forca ?? 50} onChange={(e) => mudarFx({ efeito: { ...fxSel, forca: Number(e.target.value) } }, false)} onPointerUp={fimSlider} onKeyUp={fimSlider} className="w-full accent-[#8B5CF6]" />
              </label>
              {fxSel.tipo !== "falha" && fxSel.tipo !== "curvar" && (
                <div>
                  <p className="mb-1.5 text-[12px] font-bold text-white/70">Cor do efeito</p>
                  <div className="flex flex-wrap items-center gap-2">
                    {CORES_EFEITO.map((c) => {
                      const on = (fxSel.cor || "") === c;
                      return c
                        ? <button key={c} data-cor-efeito={c} aria-label={`Efeito na cor ${c}`} onClick={() => mudarFx({ efeito: { ...fxSel, cor: c } })} className="h-8 w-8 rounded-full" style={{ background: c, border: on ? "3px solid #8B5CF6" : "2px solid rgba(127,127,127,.35)" }} />
                        : <button key="auto" data-cor-efeito="auto" onClick={() => mudarFx({ efeito: { ...fxSel, cor: undefined } })} className={chip(on)}>Automática</button>;
                    })}
                    <label title="Outra cor" className="relative h-8 w-8 shrink-0 cursor-pointer rounded-full" style={{ background: "conic-gradient(#E11D2E,#F5F906,#16A34A,#0B63CE,#7C3AED,#E11D2E)", border: "2px solid rgba(127,127,127,.35)" }}>
                      <input type="color" aria-label="Outra cor do efeito" value={/^#[0-9a-f]{6}$/i.test(fxSel.cor || "") ? fxSel.cor : "#000000"} onChange={(e) => mudarFx({ efeito: { ...fxSel, cor: e.target.value.toUpperCase() } })} className="absolute inset-0 h-full w-full cursor-pointer opacity-0" />
                    </label>
                  </div>
                </div>
              )}
            </div>
          )}
          <p className="text-[11px] text-white/45">Toque num efeito para ver na arte. Toque em Nenhum para tirar.</p>
        </>
      )}
      {ferr === "posicao" && sel && (() => {
        const b = boxSel();
        if (!b) return null;
        const giro = extraSel ? extraSel.rot || 0 : ajusteSel.rotate || 0;
        const num = (nome: string, val: number, aplicar: (v: number) => void, id: string) => (
          <label className="flex min-w-0 flex-col gap-1 text-[11px] font-bold text-white/60">{nome}
            <input key={`${sel}-${id}-${Math.round(val)}`} data-pos={id} type="number" inputMode="decimal" defaultValue={Math.round(val)}
              onBlur={(e) => { const v = Number(e.target.value); if (e.target.value !== "" && Number.isFinite(v) && Math.round(v) !== Math.round(val)) aplicar(v); }}
              onKeyDown={(e) => { if (e.key === "Enter") (e.target as HTMLInputElement).blur(); }}
              className="min-h-10 w-full min-w-0 rounded-xl border border-white/10 bg-white/[0.05] px-2 text-[15px] outline-none focus:border-[#8B5CF6]" />
          </label>
        );
        const botao = (nome: string, Ic: typeof Type, fazer: () => void, dado: Record<string, string>) => (
          <button key={nome} {...dado} onClick={fazer} className="flex min-h-11 items-center gap-2 rounded-xl border border-white/15 px-2.5 text-left text-[12px] font-semibold"><Ic className="h-4 w-4 shrink-0" />{nome}</button>
        );
        const abas = (
          <div className="grid grid-cols-2 gap-1 rounded-xl bg-white/[0.06] p-1">
            {(["organizar", "camadas"] as const).map((q) => <button key={q} data-aba-pos={q} onClick={() => setAbaPos(q)} className={`min-h-9 rounded-lg text-[13px] font-bold ${abaPos === q ? "bg-white/[0.14] text-white" : "text-white/60"}`}>{q === "organizar" ? "Organizar" : "Camadas"}</button>)}
          </div>
        );
        if (abaPos === "camadas") return <>{abas}{listaCamadas}</>;
        return (
          <>
            {abas}
            <div>
              <p className={rotulo}>Ordem</p>
              <div className="grid grid-cols-2 gap-1.5">
                {botao("Para frente", ArrowUp, () => camada("frente"), { "data-camada": "frente" })}
                {botao("Para trás", ArrowDown, () => camada("tras"), { "data-camada": "tras" })}
                {botao("Para o topo", ChevronsUp, () => camada("topo"), { "data-camada": "topo" })}
                {botao("Para o fundo", ChevronsDown, () => camada("fundo"), { "data-camada": "fundo" })}
              </div>

            </div>
            <div>
              <p className={rotulo}>Alinhar à página</p>
              <div className="grid grid-cols-3 gap-1.5">
                {botao("Em cima", AlignStartHorizontal, () => alinharPagina("cima"), { "data-alinhar": "cima" })}
                {botao("No meio", AlignCenterHorizontal, () => alinharPagina("meio"), { "data-alinhar": "meio" })}
                {botao("Embaixo", AlignEndHorizontal, () => alinharPagina("baixo"), { "data-alinhar": "baixo" })}
                {botao("À esquerda", AlignStartVertical, () => alinharPagina("esq"), { "data-alinhar": "esq" })}
                {botao("Ao centro", AlignCenterVertical, () => alinharPagina("centro"), { "data-alinhar": "centro" })}
                {botao("À direita", AlignEndVertical, () => alinharPagina("dir"), { "data-alinhar": "dir" })}
              </div>
            </div>
            <div>
              <p className={rotulo}>Avançado</p>
              <div className="grid grid-cols-[1fr_auto_1fr] items-end gap-2">
                {num("Largura", b.w, porLargura, "w")}
                <button data-trava aria-pressed={travado || tipoSel !== "bloco"} disabled={tipoSel !== "bloco"} title={tipoSel === "bloco" ? (travado ? "Proporção travada: toque para mudar largura e altura separadas" : "Largura e altura separadas: toque para travar") : "Proporção sempre travada"} onClick={() => setTravado(!travado)} className="mb-0.5 grid h-10 w-10 place-items-center rounded-xl border border-white/15 disabled:opacity-40">
                  {travado || tipoSel !== "bloco" ? <Lock className="h-4 w-4" /> : <LockOpen className="h-4 w-4" />}
                </button>
                {num("Altura", b.h, porAltura, "h")}
              </div>
              <div className="mt-2 grid grid-cols-3 gap-2">
                {num("X", b.x, (v) => moverPara(v, b.y), "x")}
                {num("Y", b.y, (v) => moverPara(b.x, v), "y")}
                {num("Girar (°)", giro, (v) => girar((((v % 360) + 540) % 360) - 180), "r")}
              </div>
              <input data-girar aria-label="Girar" type="range" min={-180} max={180} value={giro} onChange={(e) => girar(Number(e.target.value), false)} onPointerUp={fimSlider} onKeyUp={fimSlider} className="mt-3 w-full accent-[#8B5CF6]" />
            </div>
          </>
        );
      })()}
      {ferr === "estiloIcone" && extraSel?.tipo === "icone" && (
        <div>
          <p className={rotulo}>Outros estilos deste ícone (toque para trocar)</p>
          {variantes.carregando && <p className="text-[12px] text-white/50">Buscando estilos…</p>}
          {!variantes.carregando && !variantes.lista.length && <p className="text-[12px] text-white/50">Não achei outros estilos deste ícone. Busque outro em Elementos.</p>}
          <div data-estilos-icone className="grid grid-cols-5 gap-1.5">
            {variantes.lista.map((nome) => (
              <button key={nome} data-estilo-icone={nome} title={nome} onClick={() => trocarIcone(nome)} className="grid aspect-square place-items-center rounded-lg p-1.5" style={{ background: "#F4F4F5", border: extraSel.icone === nome ? "2px solid #8B5CF6" : "2px solid transparent" }}>
                <img src={miniaturaIcone(nome)} alt="" loading="lazy" className="h-full w-full object-contain" />
              </button>
            ))}
          </div>
        </div>
      )}
      {ferr === "formato" && (
        <div className="grid grid-cols-2 gap-2">
          {[{ id: "square" as const, n: "Feed", s: "quadrado 1:1" }, { id: "story" as const, n: "Stories", s: "em pé 9:16" }].map((f) => (
            <button key={f.id} onClick={() => mudar({ formato: f.id })} className={`flex flex-col items-center gap-2 rounded-2xl border-2 p-4 ${a.formato === f.id ? "border-[#F5F906]" : "border-white/10"}`}>
              <span className={`rounded-md border-2 border-white/50 ${f.id === "square" ? "h-12 w-12" : "h-16 w-9"}`} />
              <span className="text-[14px] font-extrabold">{f.n}</span><span className="text-[11px] text-white/50">{f.s}</span>
            </button>
          ))}
        </div>
      )}
      {!CONTEXTUAIS.includes(ferr) && <button onClick={() => navigate("/fabrica/anuncio")} className="mt-2 flex min-h-11 items-center justify-center gap-2 rounded-xl border border-white/10 text-[12px] font-bold text-white/60"><Settings2 className="h-4 w-4" />Modo avançado (formulário completo)</button>}
    </div>
  );

  const botaoVarios = <BotaoAcao rotulo="Selecionar vários" icone={BoxSelect} compacto ativo={modoVarios} aoTocar={() => setModoVarios(!modoVarios)} />;
  const tamAgora = tamanhoAtual();
  const passoTam = extraSel ? 10 : 2;
  const controleTamanho = tamAgora !== null && (
    <div data-tamanho title="Tamanho" className="flex h-11 shrink-0 items-center overflow-hidden rounded-xl lg:h-10" style={{ border: "1px solid rgba(0,0,0,.2)", color: "#111" }} onPointerDown={(e) => e.stopPropagation()}>
      <button data-acao="Diminuir" aria-label="Diminuir o tamanho" onClick={() => porTamanho(tamAgora - passoTam)} className="grid h-full w-9 place-items-center hover:bg-black/10"><Minus className="h-4 w-4" /></button>
      <input
        data-tamanho-valor
        aria-label="Tamanho"
        inputMode="decimal"
        value={tamTxt ?? String(tamAgora)}
        onFocus={(e) => e.target.select()}
        onChange={(e) => setTamTxt(e.target.value)}
        onBlur={() => { const v = Number((tamTxt ?? "").replace(",", ".")); setTamTxt(null); if (tamTxt !== null && v > 0) porTamanho(v); }}
        onKeyDown={(e) => { if (e.key === "Enter") (e.target as HTMLInputElement).blur(); }}
        className="h-full w-12 bg-transparent text-center text-[15px] font-bold outline-none"
        style={{ color: "#111" }}
      />
      <button data-acao="Aumentar" aria-label="Aumentar o tamanho" onClick={() => porTamanho(tamAgora + passoTam)} className="grid h-full w-9 place-items-center hover:bg-black/10"><Plus className="h-4 w-4" /></button>
    </div>
  );
  const botaoCor = podeCor && (
    <button data-acao="Cor" onClick={() => abrirPainel("cor")} onPointerDown={(e) => e.stopPropagation()} aria-pressed={ferr === "cor"} className="flex min-h-12 min-w-[52px] shrink-0 flex-col items-center justify-center gap-0.5 rounded-xl px-1 text-[11px] font-bold hover:bg-black/10 lg:min-h-10 lg:flex-row lg:gap-1.5 lg:px-2.5 lg:text-[13px]" style={{ color: "#111", background: ferr === "cor" ? "rgba(0,0,0,.12)" : undefined }}>
      <span className="h-[18px] w-[18px] rounded-full" style={{ background: gradSel ? `linear-gradient(135deg, ${gradSel[0]}, ${gradSel[1]})` : corSel || "conic-gradient(#E11D2E,#F5F906,#16A34A,#0B63CE,#7C3AED,#E11D2E)", border: "1px solid rgba(0,0,0,.3)" }} />Cor
    </button>
  );
  const botaoSub = (id: Sub, rotulo: string, icone: typeof Type) => <BotaoAcao rotulo={rotulo} icone={icone} ativo={sub === id} aoTocar={() => setSub(sub === id ? null : id)} />;
  const botaoPainel = (id: Ferramenta, rotulo: string, icone: typeof Type) => <BotaoAcao rotulo={rotulo} icone={icone} ativo={ferr === id} aoTocar={() => abrirPainel(id)} />;
  const ehImagem = tipoSel === "imagemArte" || tipoSel === "imagem";
  const acoesSel = sel && (marcados.length > 1 ? (
    <>
      <span data-qtd-sel className="shrink-0 px-2 text-[12px] font-black" style={{ color: "#111" }}>{marcados.length} itens</span>
      {botaoVarios}
      {ehGrupo
        ? <BotaoAcao rotulo="Desagrupar" icone={Ungroup} aoTocar={desagrupar} />
        : <BotaoAcao rotulo="Agrupar" icone={Group} aoTocar={agrupar} />}
      <BotaoAcao rotulo="Menor" icone={Minus} aoTocar={() => tamanhoVarios(0.9)} />
      <BotaoAcao rotulo="Maior" icone={Plus} aoTocar={() => tamanhoVarios(1.1)} />
      <BotaoAcao rotulo="Copiar" icone={ClipboardCopy} dica="Copiar (Ctrl+C)" aoTocar={copiar} />
      {temCopia && <BotaoAcao rotulo="Colar" icone={ClipboardPaste} dica="Colar (Ctrl+V)" aoTocar={colar} />}
      <BotaoAcao rotulo="Apagar" icone={Trash2} aoTocar={apagarVarios} />
    </>
  ) : (
    <>
      {(ehTextoArte || extraSel?.tipo === "letra") && (
        <select
          data-fonte
          aria-label="Fonte do texto"
          value={extraSel?.tipo === "letra" ? familiaDa(extraSel.fonte || "") : ajusteSel.fontFamily || ""}
          onChange={(e) => (extraSel?.tipo === "letra" ? trocarFonteLetra(e.target.value) : trocarFonte(e.target.value))}
          onPointerDown={(e) => e.stopPropagation()}
          className="h-11 max-w-[140px] shrink-0 rounded-xl px-2 text-[13px] font-semibold outline-none lg:h-10"
          style={{ color: "#111", background: "transparent", border: "1px solid rgba(0,0,0,.2)", fontFamily: ajusteSel.fontFamily || undefined }}
        >
          <option value="">Fonte da arte</option>
          {FONTES.map((f) => <option key={f} value={f} style={{ fontFamily: f }}>{f}</option>)}
        </select>
      )}
      {fotoVideo && <BotaoAcao rotulo="Trocar vídeo" icone={Film} aoTocar={() => abrirPainel("video")} />}
      {fotoVideo && <BotaoAcao rotulo="Trecho e tempo" icone={Clock} aoTocar={() => abrirPainel("cena")} />}
      {ehImagem && !fotoVideo && <BotaoAcao rotulo="Substituir" icone={ImagePlus} aoTocar={() => { if (extraSel) inputSubstituir.current?.click(); else setFerr(sel === fotoPrincipal ? (modoVideo ? "video" : "foto") : "marca"); }} />}
      {modoVideo && !fotoVideo && <BotaoAcao rotulo="Animar" icone={Wand2} ativo={ferr === "animar"} aoTocar={() => abrirPainel("animar")} />}
      {podeEscrever(sel) && <BotaoAcao rotulo={extraSel?.tipo === "preco" ? "Editar preço" : "Editar"} icone={Pencil} ativo={editandoTexto} aoTocar={() => { setSub(null); setEditandoTexto(true); }} />}
      {caixa?.kind === "text" && /consulte|r\$|\d{2,}/i.test(textoSel || "") && <BotaoAcao rotulo="Pôr preço" icone={Tag} aoTocar={() => { setFerr("preco"); if (a.pagamento === "free_quote") mudar({ pagamento: "installments" }); }} />}
      {controleTamanho}
      {botaoCor}
      {extraSel?.tipo === "preco" && <BotaoAcao rotulo="Desagrupar" icone={Ungroup} dica="Separar em partes: cada texto e cada forma vira um item solto" aoTocar={desagruparPreco} />}
      {extraSel?.tipo === "rede" && botaoSub("modeloRede", "Modelo", LayoutGrid)}
      {extraSel?.tipo === "letra" && <BotaoAcao rotulo="Negrito" icone={Bold} compacto ativo={negritoDa(extraSel.fonte || "")} aoTocar={() => estiloLetra({ negrito: !negritoDa(extraSel.fonte || "") })} />}
      {extraSel?.tipo === "letra" && <BotaoAcao rotulo="Itálico" icone={Italic} compacto ativo={italicoDa(extraSel.fonte || "")} aoTocar={() => estiloLetra({ italico: !italicoDa(extraSel.fonte || "") })} />}
      {ehTextoArte && <BotaoAcao rotulo="Negrito" icone={Bold} compacto ativo={negritoAtivo} aoTocar={() => ajustar(sel, { bold: !negritoAtivo })} />}
      {ehTextoArte && <BotaoAcao rotulo="Itálico" icone={Italic} compacto ativo={italicoAtivo} aoTocar={() => ajustar(sel, { italic: !italicoAtivo })} />}
      {ehTextoArte && <BotaoAcao rotulo={nomeAlinh} icone={IconeAlinh} compacto dica={`Alinhado à ${nomeAlinh.toLowerCase()} (toque para mudar)`} aoTocar={() => ajustar(sel, { align: proxAlinh })} />}
      {ehTextoArte && botaoSub("espaco", "Espaçamento", LetterText)}
      {ehImagem && !fotoVideo && botaoSub("cortar", "Cortar", Crop)}
      {extraSel?.tipo === "imagem" && botaoSub("forma", "Forma", Shapes)}
      {ehImagem && !fotoVideo && botaoSub("filtro", "Cores", SlidersHorizontal)}
      {extraSel?.tipo === "icone" && botaoPainel("estiloIcone", "Estilo", Shapes)}
      {extraSel?.tipo === "forma" && extraSel.forma && formaPorId(extraSel.forma) && temEspessura(formaPorId(extraSel.forma)!) && botaoSub("espessura", "Espessura", PenLine)}
      {!fotoVideo && botaoSub("transp", "Transparência", Droplet)}
      {!fotoVideo && botaoPainel("efeitos", "Efeitos", Sparkles)}
      {botaoPainel("posicao", "Posição", Move)}
      <span className="hidden lg:contents">
        <BotaoAcao rotulo="Copiar" icone={ClipboardCopy} compacto dica="Copiar (Ctrl+C)" aoTocar={copiar} />
        {temCopia && <BotaoAcao rotulo="Colar" icone={ClipboardPaste} compacto dica="Colar (Ctrl+V)" aoTocar={colar} />}
        <BotaoAcao rotulo="Duplicar" icone={CopyPlus} compacto dica="Duplicar (Ctrl+D)" aoTocar={duplicar} />
        <BotaoAcao rotulo="Apagar" icone={Trash2} compacto aoTocar={apagar} />
      </span>
      {botaoVarios}
    </>
  ));
  // barrinhas que abrem embaixo da barra (transparência, espaçamento, corte, cores da imagem)
  const barrinha = (id: string, nome: string, valor: number, min: number, max: number, passo: number, aoMudar: (v: number) => void, mostrar?: string) => (
    <label key={id} className="flex min-w-[200px] flex-1 flex-col gap-1 text-[12px] font-bold" style={{ color: "#333" }}>
      <span className="flex justify-between gap-3">{nome}<span data-valor={id}>{mostrar ?? valor}</span></span>
      <input data-barrinha={id} type="range" min={min} max={max} step={passo} value={valor} onChange={(e) => aoMudar(Number(e.target.value))} onPointerUp={fimSlider} onKeyUp={fimSlider} className="w-full accent-[#8B5CF6]" />
    </label>
  );
  const NOME_CORTE = { l: "Cortar à esquerda", r: "Cortar à direita", t: "Cortar em cima", b: "Cortar embaixo" } as const;
  const popSub = sub && sel && marcados.length <= 1 && (
    <div data-sub={sub} className="flex w-full max-w-[560px] flex-wrap items-center gap-x-5 gap-y-3 rounded-2xl p-3 shadow-xl" style={{ background: corBarra, border: "1px solid rgba(0,0,0,.12)", color: "#111" }} onPointerDown={(e) => e.stopPropagation()}>
      {sub === "transp" && barrinha("transp", "Transparência", Math.round(opacSel * 100), 0, 100, 1, (v) => mudarFx({ opacidade: v / 100 }, false), `${Math.round(opacSel * 100)}%`)}
      {sub === "espessura" && extraSel?.tipo === "forma" && barrinha("espessura", "Espessura (mais fina ou mais grossa)", Math.round((extraSel.esp ?? 1) * 100), 25, 400, 5, (v) => void redesenharExtra(extraSel.id, { esp: v / 100 }), `${Math.round((extraSel.esp ?? 1) * 100)}%`)}
      {sub === "espaco" && (
        <>
          {barrinha("letras", "Espaço entre as letras", ajusteSel.letterSpacing ?? 0, -100, 800, 10, (v) => ajustar(sel, { letterSpacing: v || undefined }, false))}
          {barrinha("linhas", "Espaço entre as linhas", ajusteSel.lineSpacing ?? 1.1, 0.5, 2.5, 0.05, (v) => ajustar(sel, { lineSpacing: v }, false), (ajusteSel.lineSpacing ?? 1.1).toFixed(2))}
        </>
      )}
      {sub === "cortar" && (["l", "r", "t", "b"] as const).map((k) => barrinha(`corte-${k}`, NOME_CORTE[k], Math.round(recorteSel[k] * 100), 0, 45, 1, (v) => mudarFx({ recorte: { ...recorteSel, [k]: v / 100 } }, false), `${Math.round(recorteSel[k] * 100)}%`))}
      {sub === "modeloRede" && extraSel?.tipo === "rede" && (
        <div className="flex w-full flex-col gap-2">
          <div className="grid grid-cols-3 gap-2">
            {MODELOS_REDE.map((m) => (
              <button key={m.id} data-modelo-rede={m.id} onClick={() => trocarModeloRede(m.id, false)} className="flex flex-col items-center gap-1 rounded-xl p-1.5 text-[11px] font-bold" style={{ background: "linear-gradient(135deg,#3B6B8C,#2A4A5E)", color: "#fff", border: (extraSel.modelo || "transparente") === m.id ? "3px solid #8B5CF6" : "3px solid transparent" }}>
                <span className="grid h-10 w-full place-items-center">{previasRede[m.id] ? <img src={previasRede[m.id]} alt="" className="max-h-full max-w-full object-contain" /> : null}</span>
                {m.nome}
              </button>
            ))}
          </div>
          <button data-modelo-todas onClick={() => trocarModeloRede(extraSel.modelo || "transparente", true)} className="min-h-9 rounded-full px-3 text-[12px] font-bold" style={{ color: "#111", border: "1px solid rgba(0,0,0,.2)" }}>Usar este modelo em todas as redes</button>
        </div>
      )}
      {sub === "forma" && extraSel?.tipo === "imagem" && (
        <div data-escolher-moldura className="flex min-w-0 flex-1 flex-col gap-2">
          <span className="text-[12px] font-bold" style={{ color: "#333" }}>Forma da imagem</span>
          <div className="grid grid-cols-6 gap-1.5 sm:grid-cols-10">
            <button data-moldura-sem onClick={() => mudarFx({ mascara: undefined })} className="grid aspect-square place-items-center rounded-lg text-[10px] font-bold leading-tight" style={{ background: "#F1F1F3", color: "#111", border: !extraSel.fx?.mascara ? "2px solid #8B5CF6" : "2px solid transparent" }}>Sem forma</button>
            {MOLDES_IMAGEM.map((fm) => (
              <button key={fm.id} data-moldura-barra={fm.id} title={fm.nome} aria-label={fm.nome} onClick={() => mudarFx({ mascara: fm.id })} className="grid aspect-square place-items-center rounded-lg p-1" style={{ background: "#F1F1F3", border: extraSel.fx?.mascara === fm.id ? "2px solid #8B5CF6" : "2px solid transparent" }}>
                <span className="block h-full w-full" dangerouslySetInnerHTML={{ __html: svgDaForma(fm, true) }} />
              </button>
            ))}
          </div>
        </div>
      )}
      {sub === "filtro" && (
        <div className="flex flex-wrap gap-1.5">
          {FILTROS.map((f) => <button key={f.id || "original"} data-filtro={f.id || "original"} onClick={() => mudarFx({ filtro: f.css })} className="min-h-9 rounded-full px-3 text-[12px] font-bold" style={{ color: "#111", border: filtroSel === f.css ? "2px solid #8B5CF6" : "1px solid rgba(0,0,0,.2)" }}>{f.nome}</button>)}
        </div>
      )}
      <button aria-label="Fechar" onClick={() => setSub(null)} className="ml-auto grid h-8 w-8 shrink-0 place-items-center rounded-full hover:bg-black/10" style={{ color: "#111" }}><X className="h-4 w-4" /></button>
    </div>
  );
  // campos do selo de preço: entram no lugar das ações, e o selo fica à vista mudando na hora
  const formPreco = editandoTexto && extraSel?.tipo === "preco" && extraSel.preco ? (() => {
    const ex = extraSel, p = ex.preco!;
    const campoPreco = (campo: keyof Preco, nome: string, largo = "lg:w-32") => (
      <label className={`flex min-w-0 flex-col gap-0.5 text-[11px] font-bold ${largo}`} style={{ color: "#333" }}>{nome}
        <input
          data-preco-campo={campo}
          ref={campo === "valor" ? (el) => { if (el && !el.dataset.foco) { el.dataset.foco = "1"; el.focus(); el.select(); } } : undefined}
          value={p[campo]}
          maxLength={22}
          inputMode={campo === "valor" || campo === "antes" ? "decimal" : undefined}
          onChange={(e) => { redesenharExtra(ex.id, { preco: { ...p, [campo]: e.target.value } }); }}
          className="min-h-10 w-full rounded-lg px-2 text-[16px] font-semibold outline-none"
          style={{ background: "#fff", color: "#111", border: "1px solid rgba(0,0,0,.2)" }}
        />
      </label>
    );
    return (
      <div
        data-editor-preco
        onPointerDown={(e) => e.stopPropagation()}
        onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node)) terminarEdicao(); }}
        className="grid w-full grid-cols-2 gap-2 rounded-2xl p-2 lg:flex lg:w-auto lg:flex-wrap lg:items-end lg:justify-center lg:shadow-xl"
        style={{ background: AMARELO }}
      >
        {ex.estilo !== "depor" && campoPreco("prefixo", "Antes do valor")}
        {campoPreco("parcelas", "Parcelas", "lg:w-20")}
        {campoPreco("valor", "Valor (R$)", "lg:w-28")}
        {campoPreco("sufixo", "Depois do valor")}
        {ex.estilo === "depor" && campoPreco("antes", "Preço antigo", "lg:w-28")}
        <button onClick={() => terminarEdicao()} className="col-span-2 min-h-10 rounded-full px-5 text-[13px] font-black" style={{ background: "#111", color: AMARELO }}>Pronto</button>
      </div>
    );
  })() : null;
  // caixa de escrever em cima do próprio texto
  const kTela = palco.current ? palco.current.clientWidth / LARGURA : 0.5;
  const caixaEditor = (lugar: { left: string; top: string; width: string }, valor: string, hPx: number, aoMudar: (v: string) => void, rotuloCampo: string) => {
    const nLinhas = Math.max(1, valor.split("\n").length);
    const fs = Math.max(15, Math.min(40, (hPx / nLinhas) * 0.72));
    // a caixa cresce com o texto e não sai da arte
    const pw = palco.current?.clientWidth || 400;
    const maior = Math.max(...valor.split(String.fromCharCode(10)).map((l) => l.length), 4);
    const wpx = Math.min(pw, Math.max(160, (parseFloat(lugar.width) / 100) * pw, maior * fs * 0.64 + 18));
    const lpx = Math.max(0, Math.min(pw - wpx, (parseFloat(lugar.left) / 100) * pw));
    return (
      <textarea
        data-editor-texto
        aria-label={rotuloCampo}
        ref={(el) => { if (el && !el.dataset.foco) { el.dataset.foco = "1"; el.focus(); el.select(); } }}
        value={valor}
        rows={nLinhas}
        onChange={(e) => aoMudar(e.target.value)}
        onBlur={() => terminarEdicao()}
        onKeyDown={(e) => { if (e.key === "Escape") (e.target as HTMLTextAreaElement).blur(); }}
        onPointerDown={(e) => e.stopPropagation()}
        className="absolute z-20 resize-none overflow-hidden rounded-md p-1 text-center font-extrabold leading-[1.15] outline-none"
        style={{ left: lpx, top: lugar.top, width: wpx, fontSize: fs, fontFamily: a.fonte, background: "rgba(255,255,255,.97)", color: "#111", border: "2px solid #8B5CF6", boxShadow: "0 8px 30px rgba(0,0,0,.35)" }}
      />
    );
  };
  // nós do palco (cada elemento da arte e cada item), desenhados na ordem das camadas
  const noArte = (b: ArtElementBox) => {
              const ativo = sel === b.id && marcados.length <= 1;
              const marcado = marcados.includes(b.id);
              return (
                <div
                  key={b.id}
                  data-elemento={b.id}
                  title={b.label}
                  onPointerDown={(e) => comecar(e, b, "mover")}
                  data-marcado={marcado || undefined}
                  className={`absolute cursor-move rounded-[3px] ${marcado ? "outline outline-2 outline-[#8B5CF6]" : "hover:outline hover:outline-1 hover:outline-[#8B5CF6]/70"}`}
                  style={{ ...pos(b), minWidth: 14, minHeight: 14 }}
                >
                  {ativo && b.resizable !== false && (
                    <span onPointerDown={(e) => comecar(e, b, "tamanho")} aria-label="Arraste para aumentar ou diminuir" className="absolute -bottom-2.5 -right-2.5 h-5 w-5 cursor-nwse-resize rounded-full border-2 border-[#8B5CF6] bg-white shadow" />
                  )}
                  {ativo && b.resizable !== false && (b.kind || "shape") === "shape" && (
                    <>
                      <span data-alca="largura" onPointerDown={(e) => comecar(e, b, "largura")} aria-label="Arraste para mudar a largura" className="absolute -right-2 top-1/2 h-7 w-3.5 -translate-y-1/2 cursor-ew-resize rounded-full border-2 border-[#8B5CF6] bg-white shadow" />
                      <span data-alca="altura" onPointerDown={(e) => comecar(e, b, "altura")} aria-label="Arraste para mudar a altura" className="absolute -bottom-2 left-1/2 h-3.5 w-7 -translate-x-1/2 cursor-ns-resize rounded-full border-2 border-[#8B5CF6] bg-white shadow" />
                    </>
                  )}
                </div>
              );
            };
  const noExtra = (ex: Extra) => {
              const ativo = sel === ex.id && marcados.length <= 1, h = ex.w * ex.r, marcado = marcados.includes(ex.id);
              return (
                <div
                  key={ex.id}
                  data-extra={ex.tipo === "rede" ? ex.rede : ex.tipo === "imagem" ? "imagem" : ex.tipo === "icone" ? `icone-${ex.icone}` : `${ex.tipo}-${ex.estilo}`}
                  onPointerDown={(e) => comecarExtra(e, ex, "mover")}
                  data-marcado={marcado || undefined}
                  data-extra-id={ex.id}
                  className={`absolute cursor-move ${marcado ? "outline outline-2 outline-[#8B5CF6]" : "hover:outline hover:outline-1 hover:outline-[#8B5CF6]/70"}`}
                  style={{ left: `${((ex.x - ex.w / 2) / LARGURA) * 100}%`, top: `${((ex.y - h / 2) / altura) * 100}%`, width: `${(ex.w / LARGURA) * 100}%`, height: `${(h / altura) * 100}%`, transform: ex.rot ? `rotate(${ex.rot}deg)` : undefined }}
                >
                  <img src={ex.src} alt="" draggable={false} className="pointer-events-none h-full w-full" style={{ opacity: ex.z != null && arrasto.current?.id !== ex.id && !arrasto.current?.juntos?.[ex.id] && !recemMovidos.includes(ex.id) ? 0 : 1 }} />
                  {ativo && <span onPointerDown={(e) => comecarExtra(e, ex, "tamanho")} aria-label="Arraste para aumentar ou diminuir" className="absolute -bottom-2.5 -right-2.5 h-5 w-5 cursor-nwse-resize rounded-full border-2 border-[#8B5CF6] bg-white shadow" />}
                </div>
              );
            };
  // menuzinho em cima do item escolhido (como no Canva): copiar, colar, duplicar, apagar
  const menuItem = (() => {
    if (!sel || editandoTexto || arrasto.current?.movido) return null;
    const cs = marcados.map((id) => caixaDe(id, vivo)).filter((c): c is Caixa => !!c);
    if (!cs.length) return null;
    const l = Math.min(...cs.map((c) => c.l)), r = Math.max(...cs.map((c) => c.r)), tp = Math.min(...cs.map((c) => c.t)), bt = Math.max(...cs.map((c) => c.b));
    const k = palco.current ? palco.current.clientWidth / LARGURA : 0.5;
    const emCima = tp * k > 56; // sem espaço em cima: fica embaixo do item
    const meio = Math.max(14, Math.min(86, (((l + r) / 2) / LARGURA) * 100));
    const botao = (rotulo: string, Icone: typeof Type, fazer: () => void, dado: string) => (
      <button data-menu-item={dado} aria-label={rotulo} title={rotulo} onClick={fazer} className="grid h-9 w-9 place-items-center rounded-full hover:bg-black/10"><Icone className="h-[18px] w-[18px]" /></button>
    );
    return (
      <div
        data-menu-item-flutuante
        onPointerDown={(e) => e.stopPropagation()}
        className="absolute z-30 flex -translate-x-1/2 items-center gap-0.5 rounded-full p-0.5 shadow-lg"
        style={{ left: `${meio}%`, ...(emCima ? { top: `calc(${(tp / altura) * 100}% - 46px)` } : { top: `calc(${(bt / altura) * 100}% + 10px)` }), background: "#FFFFFF", color: "#111", border: "1px solid rgba(0,0,0,.12)" }}
      >
        {botao("Copiar", ClipboardCopy, copiar, "copiar")}
        {temCopia && botao("Colar", ClipboardPaste, colar, "colar")}
        {marcados.length <= 1 && botao("Duplicar", CopyPlus, duplicar, "duplicar")}
        {botao("Apagar", Trash2, () => (marcados.length > 1 ? apagarVarios() : apagar()), "apagar")}
      </div>
    );
  })();
  const nomeArquivo = `anuncio-${a.destino.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-")}.png`;

  return (
    <div data-editor-canva className="fixed inset-0 z-40 flex flex-col bg-[#0A0A0B] text-white">
      {/* topo */}
      <header className="flex h-14 shrink-0 items-center gap-1.5 border-b border-white/10 bg-[#141416] px-2 sm:gap-2 sm:px-3">
        <button aria-label="Voltar" onClick={() => tentarSair("voltar")} className="flex min-h-10 items-center gap-1.5 rounded-full px-2.5 text-[13px] font-bold hover:bg-white/[0.07]"><ArrowLeft className="h-5 w-5" /><span className="hidden sm:inline">Voltar</span></button>
        <div className="min-w-0 flex-1 truncate text-[14px] font-extrabold">{modoVideo ? nomeDe(paginas.map((p, i) => (i === pag ? { est: vivo } : p))) : a.titulo || `Pacote ${a.destino}`}<span className="ml-2 hidden text-[12px] font-semibold text-white/45 sm:inline">{modoVideo ? `Vídeo · ${paginas.length} ${paginas.length === 1 ? "cena" : "cenas"} · ${segs(durTotal)}` : `Modelo ${a.variant + 1} · ${a.formato === "story" ? "Stories" : "Feed"}`}</span></div>
        <span className="hidden sm:contents"><BotaoTema compacto /></span>
        <button aria-label="Desfazer" title="Desfazer (Ctrl+Z)" onClick={desfazer} disabled={hist.i === 0 && !desfazerCenas} className="grid h-10 w-10 place-items-center rounded-full hover:bg-white/[0.07] disabled:opacity-30"><Undo2 className="h-5 w-5" /></button>
        <button aria-label="Refazer" title="Refazer" onClick={refazer} disabled={hist.i >= hist.lista.length - 1} className="grid h-10 w-10 place-items-center rounded-full hover:bg-white/[0.07] disabled:opacity-30"><Redo2 className="h-5 w-5" /></button>
        {paginas.length > 1 && <span className="hidden text-[12px] font-bold text-white/50 sm:inline">{modoVideo ? "Cena" : "Página"} {pag + 1} de {paginas.length}</span>}
        <button data-link-arte onClick={() => { setSel(null); setLinkAberto(true); }} aria-label="Compartilhar link" title="Compartilhar link (equipe ou outro aparelho)" className="hidden h-10 min-w-10 shrink-0 items-center justify-center gap-1.5 rounded-full px-2 text-[13px] font-bold hover:bg-white/[0.07] sm:flex"><Link2 className="h-5 w-5" /><span className="hidden xl:inline">Link</span></button>
        <button data-salvar-projeto onClick={salvarAgora} disabled={salvando === "salvando"} title={sujo || !projetoId ? "Salvar projeto (para continuar depois)" : naConta ? "Salvo na sua conta" : "Salvo neste aparelho"} aria-label="Salvar projeto" className="flex h-10 min-w-10 shrink-0 items-center justify-center gap-1.5 rounded-full px-2 text-[13px] font-bold hover:bg-white/[0.07]">
          {salvando === "salvo" || (!sujo && projetoId) ? <Check className="h-5 w-5 text-emerald-400" /> : <Save className="h-5 w-5" />}
          <span className="hidden xl:inline">{salvando === "salvando" ? "Salvando…" : salvando === "salvo" || (!sujo && projetoId) ? "Salvo" : "Salvar"}</span>
        </button>
        <button id="ed-baixar" data-compartilhar onClick={abrirCompartilhar} disabled={!url || montando || baixando} className="flex min-h-10 min-w-10 shrink-0 items-center justify-center gap-2 rounded-full px-3 text-[14px] font-black text-black disabled:opacity-60 min-[420px]:px-4" style={{ background: "linear-gradient(135deg, #F5F906 0%, #FFD77A 100%)", boxShadow: "0 4px 18px rgba(255,196,90,.32)" }} aria-label="Baixar">
          <Download className="h-4 w-4" /><span className="hidden min-[420px]:inline">Baixar</span>
        </button>
        <button data-conta onClick={() => tentarSair("conta")} aria-label="Sua conta" title={fabrica.agencyName ? `${fabrica.agencyName}: sua conta` : "Sua conta"} className="grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-full border border-white/20 bg-white/[0.1] text-[13px] font-black">
          {fabrica.logoBase64 ? <img src={fonteLogo(fabrica.logoBase64)} alt="" className="h-full w-full object-cover" /> : iniciaisDe(fabrica.agencyName)}
        </button>
      </header>

      <div className="flex min-h-0 flex-1">
        {/* ferramentas: computador */}
        <nav aria-label="Ferramentas" className="hidden w-[76px] shrink-0 flex-col gap-1 overflow-y-auto border-r border-white/10 bg-[#141416] py-2 lg:flex">
          {ferramentas.map((f) => (
            <button key={f.id} data-ferramenta={f.id} onClick={() => setFerr(ferr === f.id ? null : f.id)} className={`mx-1.5 flex flex-col items-center gap-1 rounded-xl py-2.5 text-[11px] font-bold ${ferr === f.id ? "bg-white/10 text-white" : "text-white/60 hover:bg-white/5 hover:text-white"}`}>
              <f.icone className="h-5 w-5" style={ferr === f.id ? { color: "var(--cv-acento-texto, #F5F906)" } : undefined} />{f.nome}
            </button>
          ))}
        </nav>
        {ferr && (
          <aside className="hidden w-[330px] shrink-0 flex-col border-r border-white/10 bg-[#141416] lg:flex">
            <div className="flex items-center justify-between px-4 pt-3">
              <h2 className="text-[15px] font-extrabold">{tituloPainel}</h2>
              <button aria-label="Fechar" onClick={() => setFerr(null)} className="grid h-9 w-9 place-items-center rounded-full hover:bg-white/[0.07]"><X className="h-4 w-4" /></button>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto p-4 pt-3">{painel}</div>
          </aside>
        )}

        {/* palco */}
        <main className={`relative flex min-w-0 flex-1 flex-col items-center overflow-hidden p-3 sm:p-6 lg:pt-16 ${painelCel ? "justify-start" : "justify-center"}`} onPointerDown={() => { setSel(null); setEditandoTexto(false); setSub(null); }}>
          {aviso && !erro && <p className="absolute inset-x-3 bottom-3 z-10 mx-auto max-w-md rounded-xl border border-white/15 bg-[#1C1C20] p-2.5 text-center text-[12px] text-white/85">{aviso}</p>}
          {erro && <p className="absolute inset-x-3 top-3 z-10 rounded-xl border border-amber-400/40 bg-amber-950/90 p-2.5 text-center text-[12px] text-amber-100">{erro}</p>}
          {sel && (
            <div className="pointer-events-none absolute inset-x-3 top-3 z-30 hidden flex-col items-center gap-2 lg:flex [&>*]:pointer-events-auto" onPointerDown={(e) => e.stopPropagation()}>
              {formPreco || (
                <>
                  <div data-barra-elemento className="flex max-w-full flex-wrap items-center justify-center gap-0.5 rounded-2xl p-1 shadow-xl" style={{ background: corBarra, border: "1px solid rgba(0,0,0,.12)" }}>{acoesSel}</div>
                  {popSub}
                </>
              )}
            </div>
          )}
          {modoVideo && !sel && selAudio && (
            <div data-opcoes-audio-topo className="pointer-events-none absolute inset-x-3 top-3 z-30 hidden justify-center lg:flex [&>*]:pointer-events-auto" onPointerDown={(e) => e.stopPropagation()}>{opcoesAudio}</div>
          )}
          {modoVideo && !sel && !selAudio && (
            <div className="pointer-events-none absolute inset-x-3 top-3 z-30 hidden justify-center lg:flex [&>*]:pointer-events-auto" onPointerDown={(e) => e.stopPropagation()}>
              <div data-barra-cena className="flex max-w-full flex-wrap items-center justify-center gap-0.5 rounded-2xl p-1 shadow-xl" style={{ background: corBarra, border: "1px solid rgba(0,0,0,.12)" }}>
                <span className="shrink-0 px-2 text-[12px] font-black" style={{ color: "#111" }}>Cena {pag + 1} de {paginas.length}</span>
                <BotaoAcao rotulo={`Tempo ${segs(durDa(a))}`} icone={Clock} ativo={ferr === "cena"} aoTocar={() => abrirPainel("cena")} />
                <BotaoAcao rotulo="Transição" icone={Layers} aoTocar={() => abrirPainel("cena")} />
                <BotaoAcao rotulo="Animar" icone={Wand2} ativo={ferr === "animar"} aoTocar={() => abrirPainel("animar")} />
                <BotaoAcao rotulo="Vídeo de fundo" icone={Film} ativo={ferr === "video"} aoTocar={() => abrirPainel("video")} />
                <BotaoAcao rotulo="Ver o vídeo" icone={Play} aoTocar={() => setTocando(true)} />
              </div>
            </div>
          )}
          <div className="pointer-events-none absolute right-2 top-2 z-30 flex flex-col items-end gap-1.5 lg:bottom-3 lg:right-3 lg:top-auto" onPointerDown={(e) => e.stopPropagation()}>
            <BarraZoom zoom={zoom} mudarZoom={mudarZoom} claro={claro} />
            {temCopia && !sel && <button data-colar-solto onClick={colar} className="pointer-events-auto flex min-h-9 items-center gap-1.5 rounded-full px-3 text-[12px] font-black shadow-lg" style={{ background: claro ? "#FFFFFF" : "#1C1C20", color: claro ? "#111111" : "#FFFFFF", border: `1px solid ${claro ? "rgba(0,0,0,.14)" : "rgba(255,255,255,.15)"}` }}><ClipboardPaste className="h-4 w-4" />Colar</button>}
          </div>
          <div ref={zona} data-zona-palco className="flex min-h-0 w-full flex-1 overflow-auto [scrollbar-width:thin]" onTouchStart={tocarZona} onTouchMove={moverZona} onTouchEnd={soltarZona}>
          <div
            ref={palco}
            data-palco
            className={`relative m-auto shrink-0 touch-none select-none ${zoom === 1 ? "max-h-full w-full" : ""}`}
            style={(() => {
              const caber = painelCel ? (a.formato === "story" ? "min(100%, 24dvh)" : "min(100%, 40dvh)") : a.formato === "story" ? "min(100%, calc((100dvh - 300px) * 0.5625))" : "min(100%, calc(100dvh - 300px), 640px)";
              return zoom === 1 ? { aspectRatio: `${LARGURA} / ${altura}`, maxWidth: caber } : { aspectRatio: `${LARGURA} / ${altura}`, width: `calc(${caber} * ${zoom})`, maxWidth: "none" };
            })()}
            onPointerMove={mover}
            onPointerUp={soltar}
            onPointerCancel={soltar}
          >
            {estiloVideo && a.video && <VideoNoPalco src={a.video} estilo={estiloVideo} cena={cena} />}
            {url ? <img id="ed-previa" src={url} alt={modoVideo ? "Sua cena" : "Sua arte"} draggable={false} className={`pointer-events-none absolute inset-0 h-full w-full rounded-md ${modoVideo ? "" : "shadow-2xl"}`} /> : <div className="absolute inset-0 animate-pulse rounded-md bg-white/[0.06]" />}
            {modoVideo && url && <span aria-hidden className="pointer-events-none absolute inset-0 rounded-md" style={{ boxShadow: "0 0 0 1px rgba(255,255,255,.22), 0 18px 50px rgba(0,0,0,.45)" }} />}
            {montandoVideo && <span className="fn-sobre-foto pointer-events-none absolute inset-0 z-10 grid place-items-center rounded-md bg-black/60 text-[14px] font-bold text-white">Montando as cenas…</span>}
            {modoVideo && previaCena > 0 && !montandoVideo && <CenaNoPalco key={previaCena} preparar={() => prepararCena(guardarPagina()[pag].est, marca)} aoFim={() => setPreviaCena(0)} />}
            {montando && url && <span className="fn-sobre-foto pointer-events-none absolute right-2 top-2 rounded-full bg-black/70 px-2.5 py-1 text-[11px] font-bold text-white">Atualizando…</span>}
            {pilha().map((it) => (it.b ? noArte(it.b) : noExtra(it.extra!)))}
            {editandoTexto && caixa && textoSel !== null && caixaEditor(pos(caixa), textoSel, caixa.h * kTela, (v) => ajustar(caixa.id, { text: v }, false), `Texto: ${caixa.label || ""}`)}
            {editandoTexto && extraSel && (extraSel.tipo === "texto" || extraSel.tipo === "rede" || extraSel.tipo === "letra") && caixaEditor(
              { left: `${((extraSel.x - extraSel.w / 2) / LARGURA) * 100}%`, top: `${((extraSel.y - (extraSel.w * extraSel.r) / 2) / altura) * 100}%`, width: `${(extraSel.w / LARGURA) * 100}%` },
              extraSel.texto || "", extraSel.w * extraSel.r * kTela, (v) => { redesenharExtra(extraSel.id, { texto: extraSel.tipo === "rede" ? v.replace(/\n/g, " ") : v }); }, "Texto",
            )}
            {menuItem}
            {guias.v.map((g) => <span key={`v${g}`} data-guia="v" className="pointer-events-none absolute inset-y-0 z-20 w-px" style={{ left: `${(g / LARGURA) * 100}%`, background: "#FF2BD6", boxShadow: "0 0 0 .5px rgba(255,43,214,.4)" }} />)}
            {guias.h.map((g) => <span key={`h${g}`} data-guia="h" className="pointer-events-none absolute inset-x-0 z-20 h-px" style={{ top: `${(g / altura) * 100}%`, background: "#FF2BD6", boxShadow: "0 0 0 .5px rgba(255,43,214,.4)" }} />)}
          </div>
          </div>
          {/* no celular, as opções do áudio ficam logo acima das cenas; no computador, no topo (no lugar da barra da cena) */}
          {modoVideo && selAudio && <div className="mt-2 w-full max-w-full px-1 lg:hidden">{opcoesAudio}</div>}
          <div ref={faixaPaginas} data-paginas className="mt-3 max-w-full shrink-0 overflow-x-auto px-1 py-1" onPointerDown={(e) => e.stopPropagation()} onTouchEnd={soltarToquePagina} onTouchCancel={soltarToquePagina}>
            <div ref={linhaCenas} className="relative flex w-max items-center gap-2">
            {modoVideo && (
              <button data-ver-video onClick={() => setTocando(true)} disabled={montandoVideo} className="flex h-16 shrink-0 flex-col items-center justify-center gap-0.5 rounded-md px-3 text-[11px] font-black text-black disabled:opacity-60" style={{ background: AMARELO }}>
                <Play className="h-4 w-4" />Ver vídeo<span className="font-bold tabular-nums">{segs(durTotal)}</span>
              </button>
            )}
            {paginas.map((p, i) => {
              const img = i === pag ? url : p.mini;
              const ap = i === pag ? a : p.est.a;
              const capa = modoVideo ? capaDoClipe(ap.video) : undefined;
              return (
                <button key={p.id} data-pagina={i + 1} aria-label={`${modoVideo ? "Cena" : "Página"} ${i + 1}`} aria-current={i === pag || undefined} onClick={() => { setSelAudio(null); irParaPagina(i); }}
                  draggable={paginas.length > 1} title={paginas.length > 1 ? "Arraste para mudar a ordem" : undefined}
                  onDragStart={(e) => { arrastePagina.current = i; e.dataTransfer.effectAllowed = "move"; }}
                  onDragOver={(e) => { if (arrastePagina.current != null) e.preventDefault(); }}
                  onDrop={(e) => { e.preventDefault(); const de = arrastePagina.current; arrastePagina.current = null; if (de != null) moverPagina(de, i); }}
                  onDragEnd={() => { arrastePagina.current = null; }}
                  onTouchStart={(e) => iniciarToquePagina(e, i)} onContextMenu={(e) => e.preventDefault()}
                  data-arrastando={arrasteToque?.de === i || undefined}
                  className={`relative ${modoVideo ? "h-16" : "h-12"} shrink-0 overflow-hidden rounded-md bg-black transition-transform [-webkit-touch-callout:none] [-webkit-user-select:none] ${arrasteToque?.de === i ? "z-10 scale-110 opacity-70 shadow-xl" : ""}`}
                  style={{ aspectRatio: ap.formato === "story" ? "9 / 16" : "1 / 1", outline: arrasteToque && arrasteToque.para === i && arrasteToque.de !== i ? "3px solid #F5F906" : i === pag ? "2px solid #8B5CF6" : "1px solid rgba(255,255,255,.25)", outlineOffset: 1 }}>
                  {capa && <img src={capa} alt="" className="absolute inset-0 h-full w-full object-cover" />}
                  {img ? <img src={img} alt="" className="relative h-full w-full object-cover" /> : !capa && <span className="grid h-full w-full place-items-center bg-white/[0.06]" />}
                  <span className="fn-sobre-foto absolute bottom-0 left-0 rounded-tr bg-black/75 px-1 text-[10px] font-bold text-white">{i + 1}</span>
                  {modoVideo && <span data-tempo-pagina className="fn-sobre-foto absolute right-0 top-0 rounded-bl bg-black/75 px-1 text-[9px] font-bold tabular-nums text-white">{segs(durDa(ap))}</span>}
                </button>
              );
            })}
            <button data-nova-pagina aria-label={modoVideo ? "Adicionar cena" : "Adicionar página"} title={modoVideo ? "Adicionar cena" : "Adicionar página"} onClick={novaPagina} className={`flex ${modoVideo ? "h-16" : "h-12"} shrink-0 items-center gap-1.5 rounded-md border border-dashed border-white/30 px-3 text-[12px] font-bold text-white/80 hover:bg-white/[0.06] [html.fabrica-claro_&]:border-black/30`}><Plus className="h-4 w-4" />{modoVideo ? "Cena" : "Página"}</button>
            {paginas.length > 1 && (
              <span className="flex shrink-0 flex-col gap-1">
                <button data-mover-pagina="-1" aria-label={`Mover ${modoVideo ? "a cena" : "a página"} para a esquerda`} title="Mover para a esquerda" onClick={() => moverPagina(pag, pag - 1)} disabled={pag === 0} className="grid h-[30px] w-9 place-items-center rounded-md text-white/60 hover:bg-white/[0.06] disabled:opacity-25"><ChevronLeft className="h-4 w-4" /></button>
                <button data-mover-pagina="1" aria-label={`Mover ${modoVideo ? "a cena" : "a página"} para a direita`} title="Mover para a direita" onClick={() => moverPagina(pag, pag + 1)} disabled={pag === paginas.length - 1} className="grid h-[30px] w-9 place-items-center rounded-md text-white/60 hover:bg-white/[0.06] disabled:opacity-25"><ChevronRight className="h-4 w-4" /></button>
              </span>
            )}
            {modoVideo && <button data-duplicar-cena aria-label="Duplicar esta cena" title="Duplicar esta cena" onClick={duplicarCena} className="grid h-16 w-10 shrink-0 place-items-center rounded-md text-white/55 hover:bg-white/[0.06]"><CopyPlus className="h-4 w-4" /></button>}
            {paginas.length > 1 && <button data-apagar-pagina aria-label={modoVideo ? "Apagar esta cena" : "Apagar esta página"} title={modoVideo ? "Apagar esta cena" : "Apagar esta página"} onClick={apagarPagina} className={`grid ${modoVideo ? "h-16" : "h-12"} w-10 shrink-0 place-items-center rounded-md text-white/55 hover:bg-white/[0.06]`}><Trash2 className="h-4 w-4" /></button>}
            </div>
            {modoVideo && (
              <FaixasAudio pos={posCenas} largura={largLinha} total={dursCenas.reduce((s, d) => s + d, 0)}
                voz={vozFaixa} clipes={clipesVoz} mudarClipes={setClipesVoz}
                musica={musicaDoVideo(musicaId) || null} volMusica={narracao.volMusica ?? 1}
                sel={selAudio} setSel={setSelAudio} cursor={cursorAudio} setCursor={setCursorAudio}
                aoAdicionarVoz={() => setFerr("narracao")} aoAdicionarMusica={() => setFerr("musica")} />
            )}
          </div>
          {modoVideo && paginas.length > 1 && <p data-dica-arrastar className="mt-1 text-center text-[11px] text-white/45 sm:hidden [html.fabrica-claro_&]:text-black/50">{arrasteToque ? "Solte onde a cena deve ficar" : "Segure uma cena e arraste para mudar a ordem"}</p>}
          <p className="mt-1 hidden text-center text-[12px] text-white/40 sm:block">{modoVarios ? "Toque nos itens para juntar ou tirar da seleção. Depois arraste um deles para mover todos." : marcados.length > 1 ? "Arraste um dos itens para mover todos juntos. Shift+clique junta ou tira um item." : sel ? "Toque de novo para escrever. Arraste para mudar de lugar. Shift+clique escolhe vários." : modoVideo ? "Toque num texto para mexer nele. Toque no vídeo para trocar ou escolher o trecho." : "Toque num texto, no preço ou na logo para mexer neles."}</p>
        </main>
      </div>

      {/* celular: ações do elemento ou ferramentas */}
      <div className={`shrink-0 lg:hidden ${sel ? "" : "border-t border-white/10 bg-[#141416]"}`} style={{ paddingBottom: "env(safe-area-inset-bottom)", ...(sel ? { background: corBarra, borderTop: "1px solid rgba(0,0,0,.15)" } : {}) }}>
        {sel && formPreco ? (
          <div className="p-2">{formPreco}</div>
        ) : sel ? (
          <>
            {popSub && <div className="px-2 pt-2">{popSub}</div>}
            <div className="flex items-center">
              <div data-barra-elemento-cel className="flex min-w-0 flex-1 items-center gap-1 overflow-x-auto py-1.5 pl-2 pr-8 [scrollbar-width:none]" style={{ WebkitMaskImage: "linear-gradient(90deg, #000 82%, transparent)", maskImage: "linear-gradient(90deg, #000 82%, transparent)" }}>
                {acoesSel}
              </div>
              <button data-pronto onClick={() => { setSel(null); setSub(null); }} className="flex min-h-12 shrink-0 flex-col items-center justify-center border-l px-3 text-[11px] font-black" style={{ color: "#111", borderColor: "rgba(0,0,0,.12)" }}><Check className="h-5 w-5" />Pronto</button>
            </div>
          </>
        ) : (
          <nav aria-label="Ferramentas" className="flex overflow-x-auto pl-1 pr-8 [scrollbar-width:none]" style={{ WebkitMaskImage: "linear-gradient(90deg, #000 82%, transparent)", maskImage: "linear-gradient(90deg, #000 82%, transparent)" }}>
            {(modoVideo ? FERRAMENTAS_VIDEO_CEL : FERRAMENTAS).map((f) => (
              <button key={f.id} data-ferramenta-cel={f.id} onClick={() => setFerr(f.id)} className="flex min-h-16 min-w-[68px] shrink-0 flex-col items-center justify-center gap-1 text-[11px] font-bold text-white/70">
                <f.icone className="h-5 w-5" />{f.nome}
              </button>
            ))}
          </nav>
        )}
      </div>

      {/* celular: painel da ferramenta por cima */}
      {ferr && (
        <div className="fixed inset-x-0 bottom-0 top-[48dvh] z-50 flex flex-col lg:hidden">
          <div className="h-full overflow-y-auto rounded-t-3xl border-t border-white/10 bg-[#141416] p-4 pb-8 shadow-[0_-12px_40px_rgba(0,0,0,.5)]">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-[16px] font-extrabold">{tituloPainel}</h2>
              <button onClick={() => setFerr(null)} className="min-h-10 rounded-full px-4 text-[13px] font-black text-black" style={{ background: AMARELO }}>Pronto</button>
            </div>
            {painel}
          </div>
        </div>
      )}

      {tocando && (
        <TocadorVideo
          preparar={async () => { const lista = guardarPagina().map((p) => p.est); const cenas = await Promise.all(lista.map((e) => prepararCena(e, marca))); await comFala(cenas, lista); return cenas; }}
          musica={musicaDoVideo(musicaId)?.arquivo}
          aoFechar={() => setTocando(false)}
          aoBaixar={() => { setTocando(false); abrirCompartilhar(); }}
        />
      )}
      {escolhaModelo && (
        <div data-escolha-modelo className="fixed inset-0 z-[60] grid place-items-center bg-black/65 p-4" onPointerDown={() => setEscolhaModelo(null)}>
          <div className="w-full max-w-[420px] rounded-3xl border border-white/10 bg-[#141416] p-5 shadow-2xl" onPointerDown={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3">
              {minis.get(escolhaModelo.formato === "story" ? escolhaModelo.v + STORY : escolhaModelo.v) && <img src={minis.get(escolhaModelo.formato === "story" ? escolhaModelo.v + STORY : escolhaModelo.v)} alt="" className="h-16 w-auto rounded-lg" />}
              <h3 className="text-[16px] font-extrabold">O que fazer com o modelo {escolhaModelo.v + 1}?</h3>
            </div>
            <div className="mt-4 flex flex-col gap-2">
              {([
                ["trocar", modoVideo ? "Trocar esta cena por este anúncio" : "Trocar esta página por este modelo", modoVideo ? "O vídeo fica no lugar da foto do anúncio. Os textos que você pôs nesta cena saem." : "Começa de novo com o modelo. Os itens que você pôs (redes, ícones, preços, imagens) saem."],
                ["nova", modoVideo ? "Adicionar como cena nova" : "Adicionar como página nova", modoVideo ? "Esta cena fica como está. O anúncio vira a cena seguinte." : "Esta página fica como está. O modelo vira a página seguinte."],
                ["fundo", "Só trocar o desenho e manter meus itens", modoVideo ? "O anúncio entra e os textos que você pôs continuam no mesmo lugar, na frente." : "Muda o desenho da arte. Os itens que você pôs continuam no mesmo lugar, na frente da arte."],
              ] as const).map(([id, titulo, desc], i) => (
                <button key={id} data-confirmar-modelo={id} onClick={() => confirmarModelo(id)} className="rounded-2xl border p-3 text-left hover:bg-white/[0.05]" style={{ borderColor: i === 0 ? "rgba(245,249,6,.5)" : "rgba(255,255,255,.14)" }}>
                  <span className="block text-[14px] font-extrabold">{titulo}</span>
                  <span className="mt-0.5 block text-[12px] text-white/60">{desc}</span>
                </button>
              ))}
              <button onClick={() => setEscolhaModelo(null)} className="mt-1 min-h-10 rounded-full text-[13px] font-bold text-white/70 hover:bg-white/[0.06]">Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {compart && (
        <div data-compartilhar-painel className="fixed inset-0 z-[60] flex items-end justify-center bg-black/65 sm:items-center sm:p-4" onPointerDown={fecharCompartilhar}>
          <div className="max-h-[92dvh] w-full max-w-[480px] overflow-y-auto rounded-t-3xl border border-white/10 bg-[#141416] p-4 pb-6 shadow-2xl sm:rounded-3xl" onPointerDown={(e) => e.stopPropagation()}>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-[17px] font-extrabold">{prontos ? (modoVideo && (fmtSaida === "mp4" || fmtSaida === "gif") ? "Pronto! Seu vídeo está aqui" : "Pronto! Sua arte está aqui") : gerando != null ? "Preparando…" : "Baixar"}</h2>
              {gerando == null && <button aria-label="Fechar" onClick={fecharCompartilhar} className="grid h-9 w-9 place-items-center rounded-full hover:bg-white/[0.07]"><X className="h-4 w-4" /></button>}
            </div>

            <div data-previa-baixar className="mb-4 flex items-center gap-3 rounded-2xl bg-white/[0.05] p-2.5">
              {previaComp ? <img src={previaComp} alt={modoVideo ? "Prévia do vídeo" : "Prévia da arte"} className="h-16 w-auto max-w-[96px] shrink-0 rounded-lg object-contain shadow-md" style={modoVideo && capaDoClipe(a.video) ? { backgroundImage: `url(${capaDoClipe(a.video)})`, backgroundSize: "cover", backgroundPosition: "center" } : undefined} /> : <div className="h-16 w-16 shrink-0 rounded-lg bg-white/[0.06]" />}
              <div className="min-w-0 flex-1">
                <p className="truncate text-[14px] font-extrabold">{modoVideo ? nomeDe(paginas.map((p, i) => (i === pag ? { est: vivo } : p))) : a.titulo || `Pacote ${a.destino}`}</p>
                <p data-medida-saida className="text-[12px] text-white/60">
                  {prontos
                    ? `${prontos.length > 1 ? `${prontos.length} arquivos` : prontos[0].nome} · ${tamanhoArquivo(prontos.reduce((n, p) => n + p.blob.size, 0))}`
                    : modoVideo && (fmtSaida === "mp4" || fmtSaida === "gif") ? `${largSaida} × ${altSaida} px · ${fmtAtual.nome} · ${paginas.length} ${paginas.length === 1 ? "cena" : "cenas"} · ${segs(durTotal)}`
                    : `${largSaida} × ${altSaida} px · ${fmtAtual.nome}${todasPag && paginas.length > 1 ? ` · ${paginas.length} ${modoVideo ? "cenas" : "páginas"}` : ""}`}
                </p>
              </div>
            </div>

            {avisoComp && <p data-aviso-compartilhar className="mb-3 rounded-xl border border-white/15 bg-white/[0.05] p-2.5 text-[12px] text-white/85">{avisoComp}</p>}

            {gerando == null && !prontos && (
              <div className="flex flex-col gap-4">
                <div>
                  <p className={rotulo}>Formato</p>
                  <div className={`grid gap-1.5 ${comMp4 ? "grid-cols-5" : "grid-cols-4"}`}>
                    {FORMATOS_SAIDA.filter((q) => (q.id !== "mp4" || comMp4) && (modoVideo ? q.id === "mp4" || q.id === "gif" || q.id === "png" : q.id !== "gif")).map((q) => (
                      <button key={q.id} data-formato-saida={q.id} onClick={() => escolherFormato(q.id)} className={`min-h-10 rounded-xl border text-[13px] font-extrabold ${fmtSaida === q.id ? "border-[#F5F906] bg-[#F5F906] text-black" : "border-white/15 text-white/80"}`}>{q.nome}</button>
                    ))}
                  </div>
                  <p className="mt-1.5 text-[12px] text-white/60">{modoVideo ? (fmtSaida === "mp4" ? "O vídeo com todas as cenas, as animações e a música. Para Reels, Stories e Status." : fmtSaida === "gif" ? "Animação sem som, que toca sozinha. Para site, e-mail e WhatsApp. Arquivo pesado: melhor com vídeo curto." : "Uma imagem de cada cena, parada (sem o movimento do vídeo).") : fmtAtual.desc}</p>
                </div>
                <div>
                  <p className={rotulo}>Tamanho</p>
                  <div className={`grid gap-1.5 ${modoVideo && fmtSaida === "mp4" ? "grid-cols-4" : modoVideo && fmtSaida === "gif" ? "grid-cols-2" : "grid-cols-5"}`}>
                    {(modoVideo && fmtSaida === "mp4" ? TAMANHOS_VIDEO : modoVideo && fmtSaida === "gif" ? TAMANHOS_GIF : TAMANHOS).map((q) => (
                      <button key={q.px} data-tamanho-saida={q.px} onClick={() => { setCampoTam(null); setLargSaida(q.px); }} className={`flex min-h-12 flex-col items-center justify-center rounded-xl border leading-tight ${largSaida === q.px ? "border-[#F5F906] bg-[#F5F906] text-black" : "border-white/15 text-white/80"}`}>
                        <span className="text-[12px] font-extrabold">{q.nome}</span>
                        <span className={`text-[10px] ${largSaida === q.px ? "text-black/70" : "text-white/50"}`}>{modoVideo && (fmtSaida === "mp4" || fmtSaida === "gif") ? `${q.px}×${Math.round((q.px * altura) / LARGURA)}` : `${q.px} px`}</span>
                      </button>
                    ))}
                  </div>
                  <div className="mt-2.5 flex items-end gap-2">
                    <label className="flex flex-1 flex-col gap-1 text-[11px] font-bold text-white/60">Largura
                      <input data-largura-saida inputMode="numeric" value={campoTam?.q === "l" ? campoTam.v : String(largSaida)} onFocus={(e) => { setCampoTam({ q: "l", v: String(largSaida) }); e.currentTarget.select(); }} onChange={(e) => setCampoTam({ q: "l", v: e.target.value.replace(/\D/g, "").slice(0, 4) })} onBlur={aplicarCampoTam} onKeyDown={(e) => e.key === "Enter" && e.currentTarget.blur()} className="min-h-11 w-full rounded-xl border border-white/15 bg-white/[0.04] px-3 text-[16px] font-bold text-white outline-none focus:border-[#F5F906]" />
                    </label>
                    <span className="pb-3 text-[14px] font-bold text-white/45">×</span>
                    <label className="flex flex-1 flex-col gap-1 text-[11px] font-bold text-white/60">Altura
                      <input data-altura-saida inputMode="numeric" value={campoTam?.q === "a" ? campoTam.v : String(altSaida)} onFocus={(e) => { setCampoTam({ q: "a", v: String(altSaida) }); e.currentTarget.select(); }} onChange={(e) => setCampoTam({ q: "a", v: e.target.value.replace(/\D/g, "").slice(0, 4) })} onBlur={aplicarCampoTam} onKeyDown={(e) => e.key === "Enter" && e.currentTarget.blur()} className="min-h-11 w-full rounded-xl border border-white/15 bg-white/[0.04] px-3 text-[16px] font-bold text-white outline-none focus:border-[#F5F906]" />
                    </label>
                    <span className="pb-3 text-[12px] font-bold text-white/45">px</span>
                  </div>
                  <p className="mt-1.5 text-[11px] text-white/45">
                    Digite o tamanho que quiser ({LARG_MIN} a {LARG_MAX} px). A outra medida acompanha para a arte não deformar.
                    {fmtSaida !== "mp4" && fmtSaida !== "gif" && ` Cerca de ${Math.max(0.1, (largSaida * altSaida * fmtAtual.fator) / 1e6).toFixed(1).replace(".", ",")} MB${todasPag && paginas.length > 1 && fmtSaida !== "pdf" ? " cada" : ""}.`}
                  </p>
                  {largSaida > 2160 && <p className="mt-1 text-[12px] text-amber-200/85">Tamanho grande demora mais para preparar no celular.</p>}
                </div>
                {paginas.length > 1 && !(modoVideo && (fmtSaida === "mp4" || fmtSaida === "gif")) && (
                  <div className="grid grid-cols-2 gap-1.5">
                    <button data-saida-pagina="esta" onClick={() => setTodasPag(false)} className={chip(!todasPag)}>{modoVideo ? "Só esta cena" : "Só esta página"}</button>
                    <button data-saida-pagina="todas" onClick={() => setTodasPag(true)} className={chip(todasPag)}>Todas ({paginas.length})</button>
                  </div>
                )}
                <button data-preparar onClick={gerarArquivos} className="flex min-h-12 items-center justify-center gap-2 rounded-full text-[15px] font-black text-black" style={{ background: "linear-gradient(135deg, #F5F906 0%, #FFD77A 100%)" }}>
                  <Download className="h-4 w-4" />{fmtSaida === "pdf" ? "Preparar o PDF" : fmtSaida === "mp4" ? "Preparar o vídeo" : fmtSaida === "gif" ? "Preparar o GIF" : todasPag && paginas.length > 1 ? `Preparar as ${paginas.length} imagens` : "Preparar a imagem"}
                </button>
              </div>
            )}

            {gerando != null && (
              <div data-gerando className="flex flex-col gap-2">
                <p className="text-[13px] font-bold">{fmtSaida === "mp4" ? "Fazendo o vídeo" : fmtSaida === "gif" ? "Fazendo o GIF" : fmtSaida === "pdf" ? "Montando o PDF" : "Preparando sua arte"} ({largSaida} px)…</p>
                <div className="h-2.5 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full transition-[width] duration-150" style={{ width: `${gerando}%`, background: "linear-gradient(90deg, #F5F906, #FFC56B)" }} /></div>
                <p className="text-right text-[11px] text-white/45">{Math.round(gerando)}%</p>
              </div>
            )}

            {prontos && (
              <div className="flex flex-col gap-3">
                <button data-baixar-pronto onClick={baixarProntos} className="flex min-h-12 items-center justify-center gap-2 rounded-full text-[15px] font-black text-black" style={{ background: "linear-gradient(135deg, #F5F906 0%, #FFD77A 100%)" }}><Download className="h-4 w-4" />{ehIOS() ? "Salvar no celular" : `Baixar${prontos.length > 1 ? ` as ${prontos.length}` : ""}`}</button>
                {celular && podeEnviarArquivo && <button data-enviar-celular onClick={enviarArquivo} className="flex min-h-12 items-center justify-center gap-2 rounded-full border border-white/20 text-[14px] font-extrabold"><Celular className="h-4 w-4" />Postar ou enviar (escolha o app)</button>}
                {!celular && fmtSaida !== "mp4" && fmtSaida !== "gif" && <button data-copiar-imagem onClick={() => copiarImagem()} className="flex min-h-11 items-center justify-center gap-2 rounded-full border border-white/15 text-[13px] font-bold"><ClipboardCopy className="h-4 w-4" />{copiado === "imagem" ? "Imagem copiada! Agora é só colar (Ctrl+V)" : "Copiar imagem"}</button>}

                <div data-legenda-bloco className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
                  <div className="mb-1.5 flex items-center justify-between gap-2">
                    <p className="text-[13px] font-extrabold">Legenda pronta</p>
                    <button data-outra-legenda onClick={outraLegenda} className="min-h-8 rounded-full px-2.5 text-[12px] font-bold text-white/65 hover:bg-white/[0.06]">Outra legenda</button>
                  </div>
                  <textarea data-legenda aria-label="Legenda do post" value={legenda} onChange={(e) => { legendaMexida.current = true; setLegenda(e.target.value); }} rows={6} className="w-full resize-y rounded-xl border border-white/10 bg-black/20 p-2.5 text-[13px] leading-snug text-white/90 outline-none focus:border-[#F5F906]" />
                  <button data-copiar-legenda onClick={copiarLegenda} className="mt-2 flex min-h-10 w-full items-center justify-center gap-2 rounded-full border border-white/15 text-[13px] font-bold"><Copy className="h-4 w-4" />{copiado === "legenda" ? "Legenda copiada!" : "Copiar legenda"}</button>
                </div>

                {!celular ? (
                  <div>
                    <p className={rotulo}>Postar agora</p>
                    <div className="grid grid-cols-4 gap-1.5">
                      {REDES_POSTAR.map((q) => (
                        <button key={q.id} data-abrir-rede={q.id} onClick={() => postarEm(q)} className={`flex flex-col items-center gap-1 rounded-xl border p-2 text-[11px] font-bold hover:bg-white/[0.05] ${postando?.id === q.id ? "border-[#F5F906]" : "border-white/10"}`}>
                          <img src={`/icones-redes/${q.id}.svg`} alt="" className="h-7 w-7 object-contain" />{q.nome}
                        </button>
                      ))}
                    </div>
                    {postando ? (
                      <div data-caixa-legenda className="mt-2 rounded-xl border border-[#F5F906]/40 bg-[#F5F906]/[0.06] p-2.5">
                        <p className="text-[12px] font-bold">O {postando.nome} abriu numa aba nova. {prontos?.[0]?.blob.type.startsWith("video/") ? `O vídeo foi baixado${postOk.leg ? " e a legenda copiada" : ""}.` : postando.modo === "colar" ? (postOk.img ? "A imagem já está copiada." : "Baixe a imagem e envie lá.") : `A imagem foi baixada${postOk.leg ? " e a legenda copiada" : ""}.`}</p>
                        <p className="mt-0.5 text-[12px] text-white/65">{prontos?.[0]?.blob.type.startsWith("video/") ? DICA_VIDEO[postando.id] || postando.dica : postando.dica}</p>
                        <p className="mt-1.5 line-clamp-2 whitespace-pre-line rounded-lg bg-black/20 p-2 text-[11px] text-white/70">{legenda}</p>
                        <div className="mt-2 grid grid-cols-2 gap-1.5">
                          <button data-caixa-copiar-legenda onClick={copiarLegenda} className="min-h-9 rounded-full border border-white/20 text-[12px] font-bold">{copiado === "legenda" ? "Copiada!" : "Copiar legenda"}</button>
                          {fmtSaida !== "mp4" && fmtSaida !== "gif" ? <button data-caixa-copiar-imagem onClick={() => copiarImagem()} className="min-h-9 rounded-full border border-white/20 text-[12px] font-bold">{copiado === "imagem" ? "Copiada!" : "Copiar imagem"}</button>
                            : <button onClick={baixarProntos} className="min-h-9 rounded-full border border-white/20 text-[12px] font-bold">Baixar de novo</button>}
                        </div>
                      </div>
                    ) : (
                      <p className="mt-1.5 text-[11px] text-white/45">{prontos?.[0]?.blob.type.startsWith("video/") ? "Toque na rede: o vídeo baixa, a legenda fica copiada e a rede abre numa aba nova." : "Toque na rede: ela abre numa aba nova com a imagem e a legenda prontas para colar."} Para postar sem precisar colar, só ligando a sua conta da rede (ainda não disponível).</p>
                    )}
                  </div>
                ) : (
                  <p className="text-[11px] text-white/50">{podeEnviarArquivo ? "Em Postar ou enviar, escolha Instagram, WhatsApp, TikTok… A legenda já vai copiada: no app, é só colar." : "Baixe a imagem, copie a legenda e abra o app da rede: é só escolher a foto e colar o texto."}</p>
                )}

                <div data-dicas className="rounded-2xl border border-white/10 p-3">
                  <p className="text-[13px] font-extrabold">O que fazer agora com {modoVideo ? "este vídeo" : "esta arte"}</p>
                  <ol className="mt-2 flex flex-col gap-2 text-[12px] leading-snug text-white/75">
                    <li className="flex gap-2"><span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-[#F5F906] text-[11px] font-black text-black">1</span><span><b className="text-white">Mande no WhatsApp</b> para os seus últimos contatos e poste no Status. Quem já conversou com você é quem mais compra.</span></li>
                    <li className="flex gap-2"><span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-[#F5F906] text-[11px] font-black text-black">2</span><span><b className="text-white">{modoVideo ? "Poste como Reels e nos stories" : "Poste no feed e nos stories"}</b> com a legenda pronta. Termine sempre chamando para o WhatsApp.</span></li>
                    <li className="flex gap-2"><span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-[#F5F906] text-[11px] font-black text-black">3</span><span><b className="text-white">Impulsione o post</b> (anuncie) para aparecer para mais pessoas da sua região. Quem se interessar chama você no WhatsApp para perguntar da oferta.</span></li>
                  </ol>
                </div>

                <button onClick={() => { prontos.forEach((p) => URL.revokeObjectURL(p.url)); setProntos(null); setPostando(null); }} className="min-h-10 rounded-full text-[13px] font-bold text-white/65 hover:bg-white/[0.05]">Mudar formato ou tamanho</button>
              </div>
            )}

            {(gerando != null || prontos) && <AnuncioAgente qual={anuncio} />}

            {gerando == null && (
              <button data-link-no-baixar onClick={() => { setCompart(false); setLinkAberto(true); }} className="mt-3 flex min-h-11 w-full items-center justify-center gap-2 rounded-full border border-white/15 text-[13px] font-bold"><Link2 className="h-4 w-4" />Compartilhar link (equipe ou outro aparelho)</button>
            )}
            {gerando == null && (
              <button data-salvar-minhas onClick={salvarAgora} disabled={salvando === "salvando"} className="mt-3 flex min-h-11 w-full items-center justify-center gap-2 rounded-full border border-white/15 text-[13px] font-bold disabled:opacity-60">
                {salvando === "salvo" || (!sujo && projetoId) ? <><Check className="h-4 w-4" />{naConta ? "Salvo na sua conta" : "Salvo neste aparelho"}</> : salvando === "salvando" ? "Salvando…" : <><Save className="h-4 w-4" />Salvar nas minhas artes (para continuar depois)</>}
              </button>
            )}
          </div>
        </div>
      )}

      {linkAberto && (
        <div data-link-painel className="fixed inset-0 z-[60] flex items-end justify-center bg-black/65 sm:items-center sm:p-4" onPointerDown={() => setLinkAberto(false)}>
          <div className="max-h-[92dvh] w-full max-w-[460px] overflow-y-auto rounded-t-3xl border border-white/10 bg-[#141416] p-4 pb-6 shadow-2xl sm:rounded-3xl" onPointerDown={(e) => e.stopPropagation()}>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-[17px] font-extrabold">Compartilhar link</h2>
              <button aria-label="Fechar" onClick={() => setLinkAberto(false)} className="grid h-9 w-9 place-items-center rounded-full hover:bg-white/[0.07]"><X className="h-4 w-4" /></button>
            </div>
            <p className="mb-3 text-[13px] text-white/65">Mande para a equipe ou abra em outro aparelho: quem abrir o link cai nesta arte já carregada{paginas.length > 1 ? `, com as ${paginas.length} páginas` : ""}.</p>
            <p className={rotulo}>Quem tem o link pode</p>
            <div className="flex flex-col gap-1.5">
              {([
                { id: "privado", nome: "Somente você", desc: "Só você abre, com o seu login (bom para continuar em outro aparelho).", Icone: Lock },
                { id: "ver", nome: "Qualquer pessoa com o link pode ver", desc: "E fazer uma cópia para personalizar. A sua arte não muda.", Icone: Eye },
                { id: "editar", nome: "Qualquer pessoa com o link pode editar", desc: "Para a equipe: as mudanças aparecem para todos que têm o link.", Icone: Users },
              ] as const).map((o) => (
                <button key={o.id} data-acesso-link={o.id} onClick={() => mudarAcessoLink(o.id)} className={`flex items-start gap-3 rounded-xl border p-2.5 text-left ${linkAcesso === o.id ? "border-[#F5F906] bg-[#F5F906]/[0.07]" : "border-white/15"}`}>
                  <span className={`mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full ${linkAcesso === o.id ? "bg-[#F5F906] text-black" : "bg-white/[0.08]"}`}><o.Icone className="h-4 w-4" /></span>
                  <span className="min-w-0"><span className="block text-[14px] font-extrabold">{o.nome}</span><span className="block text-[12px] text-white/55">{o.desc}</span></span>
                </button>
              ))}
            </div>
            <div className="mt-4 flex items-center gap-2 rounded-xl border border-white/15 bg-white/[0.04] p-1.5 pl-3">
              <span data-link-url className="min-w-0 flex-1 truncate text-[13px] text-white/75">{linkCriado ? urlDoLink(linkSlug).replace(/^https?:\/\//, "") : `${window.location.host}/anuncios/arte/${novoSlug(a.destino, a.variant).replace(/-[a-z0-9]{5}$/, "-…")}`}</span>
              <button data-copiar-link onClick={copiarLink} disabled={linkEstado === "criando"} className="min-h-10 shrink-0 rounded-full px-4 text-[13px] font-black text-black disabled:opacity-60" style={{ background: "linear-gradient(135deg, #F5F906 0%, #FFD77A 100%)" }}>{linkEstado === "criando" ? "Criando…" : linkEstado === "copiado" ? "Copiado!" : "Copiar link"}</button>
            </div>
            {linkEstado === "erro" && <p className="mt-2 text-[12px] text-red-300">Não consegui criar o link agora. Tente de novo em instantes.</p>}
            {linkCriado && linkLocal && <p data-link-local className="mt-2 text-[11px] text-amber-200/85">Versão de teste: por enquanto este link só abre neste aparelho.</p>}
            {linkCriado && <p className="mt-2 text-[11px] text-white/45">O link mostra a arte do jeito que estava ao criar. Toque em Salvar depois de mudar para atualizar quem tem o link.</p>}
          </div>
        </div>
      )}

      {sair && (
        <div data-sair className="fixed inset-0 z-[70] grid place-items-center bg-black/65 p-4" onPointerDown={() => setSair("")}>
          <div className="w-full max-w-[380px] rounded-3xl border border-white/10 bg-[#141416] p-5 shadow-2xl" onPointerDown={(e) => e.stopPropagation()}>
            <h2 className="text-[17px] font-extrabold">Salvar este projeto?</h2>
            <p className="mt-1.5 text-[13px] text-white/65">Salvando, ele fica em Continue criando e você reabre depois do jeito que deixou{paginas.length > 1 ? `, com as ${paginas.length} páginas` : ""}. Descartando, as mudanças somem.</p>
            {vozFaixa && <p data-sair-voz className="narr-alerta mt-2 rounded-xl p-2.5 text-[13px] font-semibold">A voz não fica salva no projeto. Baixe o vídeo antes de sair para não perder a narração.</p>}
            <div className="mt-4 flex flex-col gap-2">
              <button data-sair-salvar onClick={async () => { const para = sair || "voltar"; if (await salvarAgora()) { setSair(""); concluirSair(para); } }} disabled={salvando === "salvando"} className="min-h-12 rounded-full text-[15px] font-black text-black disabled:opacity-60" style={{ background: "linear-gradient(135deg, #F5F906 0%, #FFD77A 100%)" }}>{salvando === "salvando" ? "Salvando…" : "Salvar e sair"}</button>
              <button data-sair-descartar onClick={() => { const para = sair || "voltar"; setSair(""); setSujo(false); concluirSair(para); }} className="min-h-11 rounded-full border border-white/20 text-[14px] font-bold">Descartar e sair</button>
              <button data-sair-continuar onClick={() => setSair("")} className="min-h-10 rounded-full text-[13px] font-bold text-white/60 hover:bg-white/[0.05]">Continuar editando</button>
            </div>
          </div>
        </div>
      )}

      <input ref={inputMoldura} data-moldura-arquivo type="file" accept="image/*" className="hidden" onChange={(e) => { const fl = e.target.files?.[0]; const m = molduraPend.current; if (fl) lerArquivo(fl, (u) => porImagem(u, m)); e.target.value = ""; }} />
      <input ref={inputSubstituir} data-substituir type="file" accept="image/*" className="hidden" onChange={(e) => { const fl = e.target.files?.[0]; if (fl) lerArquivo(fl, (u) => substituirImagem(u)); e.target.value = ""; }} />
    </div>
  );
}

/** Os elementos são numerados na ordem em que são desenhados: se a arte ganha ou perde um bloco, os números mudam.
 *  Leva cada ajuste para o elemento novo com o mesmo texto (ou, para imagens e formas, na mesma posição da fila). */
function levarAjustes(antigos: ArtElementBox[], novos: ArtElementBox[], t: ArtTweakMap): ArtTweakMap {
  const tipo = (l: ArtElementBox[], k?: string) => l.filter((b) => (b.kind || "shape") === (k || "shape"));
  const de = new Map<string, string>();
  const usados = new Set<string>();
  for (const velho of antigos) {
    if (!t[velho.id]) continue;
    let novo: ArtElementBox | undefined;
    if (velho.kind === "text") novo = novos.find((b) => b.kind === "text" && b.text === velho.text && !usados.has(b.id));
    else {
      const va = tipo(antigos, velho.kind), vn = tipo(novos, velho.kind);
      if (va.length === vn.length) novo = vn[va.indexOf(velho)];
    }
    if (novo) { de.set(velho.id, novo.id); usados.add(novo.id); }
  }
  const out: ArtTweakMap = {};
  for (const [id, aj] of Object.entries(t)) {
    if (aj.cloneOf) { const origem = de.get(aj.cloneOf); if (origem) out[id] = { ...aj, cloneOf: origem }; }
    else if (de.has(id)) out[de.get(id)!] = aj;
  }
  return out;
}
