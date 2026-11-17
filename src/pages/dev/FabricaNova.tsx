import { Suspense, lazy, useEffect, useMemo, useRef, useState } from "react";
import logoCanva from "@/assets/logo.png";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  AlertTriangle, ArrowLeft, BookOpen, Bot, CalendarDays, ChevronLeft, ChevronRight, Clapperboard, Download, FolderOpen, Globe,
  ImageIcon, LayoutGrid, Layers, MessageSquareText, Package, Play, Settings2, Sparkles, Users, Wand2, X, Mic, Camera, FileText,
} from "lucide-react";
import "@/styles/fabrica-tema-claro.css";
import "./fabrica-nova.css";
import { BotaoTema } from "./MenuNovo";
import { CHAVE_INICIO_NOVO } from "./menu-novo-flag";
import { FabricaProvider, useFabricaContext } from "@/hooks/useFabricaContext";
import { listarVideos, type VideoSalvo } from "@/lib/biblioteca-videos";
import { listarProjetos, type ProjetoArte } from "@/lib/biblioteca-artes";
import type { EditorSimples } from "./VideoLab";
import { MODELOS_ARTE, STORY, useMiniaturas } from "./arte-nova";
import { CATEGORIAS_VIDEO, NOME_VISUAL, VIDEOS, prontoDe, type CategoriaVideo, type VideoPronto } from "./videos-prontos";
const EditorArteCanva = lazy(() => import("./EditorArteCanva"));
const CadastroRapido = lazy(() => import("./CadastroRapido"));
const CHAVE_CADASTRO_VISTO = "cv-cadastro-rapido-visto";

// PROTÓTIPO (só localhost): Início único do Canva Viagem (portal + Fábrica), no estilo de fileiras.
// Os vídeos prontos abrem o editor simples do gerador de verdade (gera e baixa o MP4).
// As artes abrem um editor simples que usa o mesmo desenho do Criador de Anúncios.

const EditorVideo = lazy(() => import("./VideoLab").then((m) => ({ default: m.VideoLabTela })));
const AMARELO = "#F5F906";
/** amarelo como texto: no tema claro vira ocre para dar leitura (a variável vem do tema claro da Fábrica) */
const ACENTO = "var(--cv-acento-texto, #F5F906)";



// ————————————————— Vídeos prontos (catálogo em videos-prontos.ts) —————————————————
/** Cartão do vídeo pronto: cena de viagem rodando com o título por cima. Só toca quando está à vista. */
/** O véu de cada estilo na capa do cartão (o mesmo desenho do vídeo, em CSS). */
function VeuCapa({ visual }: { visual: NonNullable<VideoPronto["visual"]> }) {
  const g = (s: string) => ({ background: `linear-gradient(to bottom, ${s})` });
  const base = "absolute inset-0";
  if (visual === "azul") return <div className={base} style={g("rgba(12,70,200,.5), rgba(8,48,143,.5), rgba(4,22,80,.85)")} />;
  if (visual === "luxo") return <div className={base} style={{ ...g("rgba(0,0,0,.55), rgba(0,0,0,.25) 45%, rgba(0,0,0,.88)"), boxShadow: "inset 0 0 0 3.9cqw transparent, inset 0 0 0 4.4cqw #D4AF37" }} />;
  if (visual === "neon") return <div className={base} style={{ ...g("rgba(70,0,130,.55), rgba(30,0,80,.35), rgba(10,0,40,.85)"), borderTop: "1.1cqw solid #ff2bd6", borderBottom: "1.1cqw solid #22e3ff" }} />;
  if (visual === "vibrante") return <div className={base} style={g("rgba(255,110,0,.5), rgba(255,0,120,.22), rgba(120,0,90,.8)")} />;
  if (visual === "cartao") return <div className={base} style={g("rgba(0,0,0,.35), rgba(0,0,0,.55)")}><div className="absolute inset-x-[5.5%] top-[30%] h-[50%] rounded-[4cqw] border border-white/30 bg-black/50" /></div>;
  if (visual === "postal") return <div className={base} style={{ ...g("rgba(0,0,0,.5), rgba(0,0,0,.05) 28%, rgba(0,0,0,.72)"), borderStyle: "solid", borderColor: "#FBF8F1", borderWidth: "3.7cqw 3.7cqw 8cqw" }} />;
  if (visual === "revista") return <div className={base} style={g("rgba(0,0,0,.62), rgba(0,0,0,.1) 16%, rgba(0,0,0,.12) 60%, rgba(0,0,0,.82)")}><div className="absolute inset-[3%] border-[0.3cqw] border-white/85" /></div>;
  if (visual === "passagem") return <div className={base} style={g("rgba(6,30,70,.55), rgba(6,30,70,.3), rgba(4,18,45,.85)")}><div className="absolute inset-x-[5%] top-[84%] border-t-[0.4cqw] border-dashed border-white/55" /></div>;
  if (visual === "bf") return <div className={base} style={{ ...g("rgba(0,0,0,.6), rgba(0,0,0,.35), rgba(0,0,0,.88)"), borderTop: "2cqw solid #FFC629", borderBottom: "2cqw solid #FFC629" }} />;
  return <div className={base + " bg-gradient-to-b from-black/55 via-black/5 to-black/70"} />;
}

function CapaVideo({ v, className = "" }: { v: VideoPronto; className?: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || !("IntersectionObserver" in window)) return;
    const io = new IntersectionObserver(([e]) => (e.isIntersecting ? el.play().catch(() => {}) : el.pause()), { threshold: 0.4 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  const faixa = v.visual === "faixa";
  return (
    <div className={`relative aspect-[9/16] overflow-hidden rounded-2xl bg-neutral-900 [container-type:inline-size] ${className}`}>
      <video ref={ref} src={`/video-fundos/${v.cena}.mp4`} poster={`/video-fundos/capas/${v.cena}.jpg`} muted loop playsInline preload="none" className={"absolute inset-x-0 top-0 w-full object-cover " + (faixa ? "h-[47%]" : "h-full")} />
      {faixa ? (
        <div className="absolute inset-x-0 bottom-0 top-[47%] bg-[#0a0a0c]" style={{ borderTop: "0.9cqw solid #FFC629" }} />
      ) : (
        <VeuCapa visual={v.visual || "classico"} />
      )}
      <div className={"fn-sobre-foto absolute inset-x-[7%] text-center font-black uppercase leading-[1.05] text-white " + (faixa ? "top-[60%]" : "top-[16%]")} style={{ fontSize: "9cqw" }}>
        {v.capa[0]}{" "}
        {v.modelo === "pergunta" ? <span className="inline-block rounded-md px-[3%] text-black" style={{ background: "#FFC629" }}>{v.capa[1]}</span> : <span style={{ color: "#FFC629" }}>{v.capa[1]}</span>}
      </div>
      <span className="fn-sobre-foto absolute bottom-[5%] left-1/2 flex -translate-x-1/2 items-center gap-1 rounded-full bg-black/60 px-2 py-0.5 font-bold text-white" style={{ fontSize: "5cqw" }}><Play className="h-[1em] w-[1em]" />vídeo</span>
    </div>
  );
}

// ————————————————— Artes: arte-nova.ts e EditorArteCanva.tsx —————————————————

// ————————————————— Peças do Início —————————————————
/** Fileira que rola para o lado: arrasta no celular, setas no computador. */
/** Fila de botões (filtros) que rola para o lado: setas no computador, roda do mouse e arrastar no celular. */
function ChipsRolaveis({ children, className = "", dado }: { children: React.ReactNode; className?: string; dado?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [pode, setPode] = useState({ antes: false, depois: false });
  const medir = () => { const el = ref.current; if (!el) return; setPode({ antes: el.scrollLeft > 4, depois: el.scrollLeft + el.clientWidth < el.scrollWidth - 4 }); };
  useEffect(() => {
    medir();
    const el = ref.current;
    const t = setTimeout(medir, 400);
    // roda do mouse (para cima/baixo) rola a fila para o lado
    const roda = (e: WheelEvent) => { if (!el || el.scrollWidth <= el.clientWidth || Math.abs(e.deltaX) > Math.abs(e.deltaY)) return; e.preventDefault(); el.scrollBy({ left: e.deltaY }); };
    el?.addEventListener("wheel", roda, { passive: false });
    window.addEventListener("resize", medir);
    return () => { clearTimeout(t); el?.removeEventListener("wheel", roda); window.removeEventListener("resize", medir); };
  }, []);
  const rolar = (d: number) => ref.current?.scrollBy({ left: d * ref.current.clientWidth * 0.7, behavior: "smooth" });
  const seta = "absolute top-1/2 z-20 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full border border-white/15 bg-[#1b1b1b] shadow-xl hover:bg-[#262626]";
  return (
    <div className={`relative ${className}`}>
      {pode.antes && <button type="button" aria-label="Ver os filtros anteriores" onClick={() => rolar(-1)} className={`${seta} left-0`}><ChevronLeft className="h-4 w-4" /></button>}
      <div ref={ref} data-chips={dado} onScroll={medir} className={`-mx-4 flex gap-2 overflow-x-auto px-4 [scrollbar-width:none] sm:mx-0 ${pode.antes ? "sm:pl-11" : "sm:pl-0"} ${pode.depois ? "sm:pr-11" : "sm:pr-0"}`}>{children}</div>
      {pode.depois && <button type="button" aria-label="Ver mais filtros" onClick={() => rolar(1)} className={`${seta} right-0`}><ChevronRight className="h-4 w-4" /></button>}
    </div>
  );
}

function Fileira({ id, titulo, sub, verTudo, topo, children }: { id?: string; titulo: string; sub?: string; verTudo?: { texto: string; ir: () => void }; topo?: React.ReactNode; children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [pode, setPode] = useState({ antes: false, depois: false });
  const medir = () => {
    const el = ref.current;
    if (!el) return;
    const novo = { antes: el.scrollLeft > 8, depois: el.scrollLeft + el.clientWidth < el.scrollWidth - 8 };
    setPode((p) => (p.antes === novo.antes && p.depois === novo.depois ? p : novo));
  };
  useEffect(() => {
    medir();
    const t = setTimeout(medir, 600);
    window.addEventListener("resize", medir);
    return () => { clearTimeout(t); window.removeEventListener("resize", medir); };
  });
  const rolar = (d: number) => ref.current?.scrollBy({ left: d * ref.current.clientWidth * 0.8, behavior: "smooth" });
  const seta = "absolute top-1/2 z-10 hidden h-11 w-11 -translate-y-1/2 place-items-center rounded-full border border-white/15 bg-[#1b1b1b] shadow-xl hover:bg-[#262626] lg:grid";
  return (
    <section id={id} className="mt-8 scroll-mt-4">
      <div className="mb-3 flex items-end justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-lg font-extrabold sm:text-xl">{titulo}</h2>
          {sub && <p className="text-[13px] text-white/50">{sub}</p>}
        </div>
        {verTudo && <button onClick={verTudo.ir} className="min-h-10 shrink-0 text-[13px] font-bold text-white/70 hover:text-white">{verTudo.texto}</button>}
      </div>
      {topo}
      <div className="relative">
        {pode.antes && <button aria-label="Ver os anteriores" onClick={() => rolar(-1)} className={`${seta} -left-4`}><ChevronLeft className="h-5 w-5" /></button>}
        <div ref={ref} onScroll={medir} className="-mx-4 flex snap-x gap-3 overflow-x-auto px-4 pb-2 [scrollbar-width:none] sm:mx-0 sm:px-0">{children}</div>
        {pode.depois && <button aria-label="Ver mais" onClick={() => rolar(1)} className={`${seta} -right-4`}><ChevronRight className="h-5 w-5" /></button>}
      </div>
      {pode.depois && <p className="mt-1 text-right text-[11px] text-white/35 lg:hidden">arraste para o lado →</p>}
    </section>
  );
}

// o nome guardado é o do arquivo (video-agencia-servicos-v0.mp4): na tela vai um nome de gente
const nomeDoSalvo = (s: VideoSalvo) => (/servicos/.test(s.nome) ? "Vídeo da agência" : /sonhos|pergunta/.test(s.nome) ? "Viagem dos sonhos" : s.destino || "Vídeo");

const quando = (ms: number) => {
  const dias = Math.floor((Date.now() - ms) / 86400000);
  return dias <= 0 ? "hoje" : dias === 1 ? "ontem" : `há ${dias} dias`;
};

type Previa =
  | { tipo: "video"; v: VideoPronto }
  | { tipo: "arte"; variant: number }
  | { tipo: "salvo"; s: VideoSalvo; url: string };

function Inicio() {
  const navigate = useNavigate();
  const [, setSp] = useSearchParams();
  const { state: fabrica, isHydrated } = useFabricaContext();
  const [previa, setPrevia] = useState<Previa | null>(null);
  // quem ainda não disse nome e WhatsApp começa pelas 4 perguntas (uma vez; depois fica no botão do perfil)
  const [cadastro, setCadastro] = useState(false);
  useEffect(() => {
    if (!isHydrated) return;
    let visto = false;
    try { visto = localStorage.getItem(CHAVE_CADASTRO_VISTO) === "1"; } catch { /* sem storage */ }
    if (new URLSearchParams(window.location.search).get("cadastro") === "1" || (!visto && (!fabrica.agencyName || !fabrica.whatsapp))) setCadastro(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isHydrated]);
  const [pagamento, setPagamento] = useState(false);
  const [salvos, setSalvos] = useState<VideoSalvo[] | null>(null);
  const [projetos, setProjetos] = useState<ProjetoArte[]>([]);
  const artesRef = useRef<HTMLDivElement>(null);
  const [verArtes, setVerArtes] = useState(false);
  const minis = useMiniaturas(fabrica, verArtes);

  useEffect(() => {
    try { sessionStorage.setItem(CHAVE_INICIO_NOVO, "1"); } catch { /* segue */ }
    listarVideos().then(setSalvos);
    listarProjetos().then(setProjetos);
  }, []);
  useEffect(() => {
    const el = artesRef.current;
    if (!el || !("IntersectionObserver" in window)) return setVerArtes(true);
    const io = new IntersectionObserver(([e]) => e.isIntersecting && setVerArtes(true), { rootMargin: "300px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const ir = (caminho: string) => navigate(caminho);
  const portal = (category: string) => navigate("/", { state: { category } });
  const rolarAte = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  const [catVideo, setCatVideo] = useState<CategoriaVideo | "todos">("todos");
  const abrirVideo = (v: VideoPronto, gerar = false) => { setPrevia(null); setSp(gerar ? { video: v.id, gerar: "1" } : { video: v.id }); };
  const abrirArte = (variant: number) => { setPrevia(null); setSp({ arte: String(variant) }); };
  const fecharPrevia = () => { if (previa?.tipo === "salvo") URL.revokeObjectURL(previa.url); setPrevia(null); };


  const PRONTOS_PORTAL = [
    { nome: "Vídeos Reels", sub: "Vídeos de destinos prontos para postar", icone: Play, ir: () => portal("videos") },
    { nome: "Feed & Stories", sub: "Artes editáveis no Canva", icone: LayoutGrid, ir: () => portal("feed") },
    { nome: "Ofertas & Legendas", sub: "Textos prontos para copiar", icone: MessageSquareText, ir: () => portal("offers") },
    { nome: "Pacotes de Vídeos & Drive", sub: "Pastas com vídeos para baixar", icone: FolderOpen, ir: () => portal("downloads") },
    { nome: "Central de Downloads", sub: "Tudo para baixar em um lugar", icone: Download, ir: () => ir("/downloads") },
    { nome: "Ferramentas de IA", sub: "Agentes e robôs para a agência", icone: Sparkles, ir: () => portal("tools") },
    { nome: "Vendedor IA", sub: "Atende seus clientes por você", icone: Bot, ir: () => ir("/vendedor-ia") },
    { nome: "Videoaulas", sub: "Aprenda a usar e a vender", icone: BookOpen, ir: () => portal("videoaula") },
    { nome: "Calendário", sub: "O que postar em cada data", icone: CalendarDays, ir: () => ir("/calendar") },
  ];

  return (
    <div className="fn-pagina min-h-screen pb-10 text-white">
      {pagamento && (
        <div data-aviso-pagamento className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2 bg-red-900/90 px-4 py-2.5 text-center text-[13px]">
          <span className="flex items-center gap-2"><AlertTriangle className="h-4 w-4 shrink-0" /><b>Seu último pagamento não passou.</b> Atualize para não perder o acesso.</span>
          <button onClick={() => ir("/minha-conta")} className="min-h-9 rounded-full bg-white px-4 text-[13px] font-bold text-red-900">Atualizar pagamento</button>
        </div>
      )}

      <div className="mx-auto flex max-w-[1400px]">

        <main className="min-w-0 flex-1 px-4 pt-4 sm:px-8">
          <div className="flex items-center justify-between lg:hidden">
            <img src={logoCanva} alt="Canva Viagem" className="h-8 w-8 rounded-lg object-cover" />
            <BotaoTema compacto />
          </div>

          <h1 className="mt-4 text-center text-2xl font-black sm:mt-8 sm:text-4xl">O que vamos <span style={{ color: ACENTO }}>criar hoje?</span></h1>

          <div className="-mx-4 mt-5 flex gap-2 overflow-x-auto px-4 [scrollbar-width:none] sm:mx-0 sm:justify-center sm:px-0">
            {[
              { n: "Vídeo", i: Clapperboard, ir: () => setSp({ criar: "video" }) }, { n: "Anúncio", i: ImageIcon, ir: () => setSp({ criar: "arte" }) },
              { n: "Carrossel", i: Layers, ir: () => ir("/fabrica/carrossel") }, { n: "Site", i: Globe, ir: () => ir("/fabrica/site") },
              { n: "Pacotes", i: Package, ir: () => ir("/fabrica/planos") }, { n: "Clientes", i: Users, ir: () => ir("/fabrica/crm") },
              { n: "Prontos", i: FolderOpen, ir: () => rolarAte("conteudo-pronto") },
            ].map((a) => (
              <button key={a.n} onClick={a.ir} className="flex w-[72px] shrink-0 flex-col items-center gap-1.5 text-[12px] font-semibold text-white/80">
                <span className="grid h-14 w-14 place-items-center rounded-full bg-white/[0.07] transition-colors hover:bg-white/[0.14]"><a.i className="h-6 w-6" style={{ color: ACENTO }} /></span>
                {a.n}
              </button>
            ))}
          </div>

          <Fileira id="continue-criando" titulo="Continue criando" sub="As artes e os vídeos que você salvou. Toque para continuar de onde parou." verTudo={{ texto: "Ver tudo", ir: () => ir("/fabrica/biblioteca") }}>
            {salvos === null ? (
              <div className="h-40 w-28 shrink-0 animate-pulse rounded-xl bg-white/[0.06]" />
            ) : salvos.length === 0 && projetos.length === 0 ? (
              <button onClick={() => rolarAte("videos-prontos")} className="flex min-h-28 w-full items-center gap-4 rounded-2xl border border-dashed border-white/15 p-4 text-left sm:w-[420px]">
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-white/[0.07]"><Clapperboard className="h-6 w-6" style={{ color: ACENTO }} /></span>
                <span>
                  <span className="block text-[14px] font-bold">Você ainda não criou nada</span>
                  <span className="block text-[12px] text-white/50">Escolha um modelo abaixo. O que você gerar aparece aqui.</span>
                </span>
              </button>
            ) : (
              [...projetos.slice(0, 12).map((p) => { const ehVideo = p.paginas.some((q) => !!(q as { est?: { a?: { video?: string } } })?.est?.a?.video); return (
                <button key={p.id} data-projeto-salvo={p.id} onClick={() => { const est = (p.paginas[0] as { est?: { a?: { variant?: number; formato?: string } } })?.est?.a; setSp({ arte: String(est?.variant ?? 0), projeto: p.id, ...(est?.formato === "story" ? { formato: "story" } : {}) }); }} className="w-36 shrink-0 snap-start text-left sm:w-40">
                  <div className="relative aspect-square overflow-hidden rounded-xl bg-neutral-900">
                    {p.capa && <img src={p.capa} alt="" className="h-full w-full object-cover" />}
                    {p.paginas.length > 1 && <span className="fn-sobre-foto absolute right-1.5 top-1.5 rounded-full bg-black/65 px-2 py-0.5 text-[10px] font-bold">{p.paginas.length} {ehVideo ? "cenas" : "páginas"}</span>}
                    {ehVideo && <span className="fn-sobre-foto absolute bottom-1.5 left-1.5 grid h-6 w-6 place-items-center rounded-full bg-black/65"><Play className="h-3 w-3" /></span>}
                  </div>
                  <div className="mt-1.5 truncate text-[13px] font-bold">{p.nome}</div>
                  <div className="text-[11px] text-white/45">{ehVideo ? "Vídeo" : "Arte"} · {quando(p.atualizadoEm)}</div>
                </button>
              ); }),
              ...salvos.slice(0, 12).map((s) => (
                <button key={s.id} data-salvo onClick={() => setPrevia({ tipo: "salvo", s, url: URL.createObjectURL(s.blob) })} className="w-28 shrink-0 snap-start text-left sm:w-32">
                  <div className="relative aspect-[9/16] overflow-hidden rounded-xl bg-neutral-900">
                    {s.capa && <img src={s.capa} alt="" className="h-full w-full object-cover" />}
                    <span className="fn-sobre-foto absolute bottom-1.5 left-1.5 grid h-7 w-7 place-items-center rounded-full bg-black/60"><Play className="h-3.5 w-3.5" /></span>
                  </div>
                  <div className="mt-1.5 truncate text-[13px] font-bold">{nomeDoSalvo(s)}</div>
                  <div className="text-[11px] text-white/45">Vídeo · {quando(s.criadoEm)}</div>
                </button>
              ))]
            )}
          </Fileira>

          <Fileira id="videos-prontos" titulo="Modelos para você: vídeos" sub="Vídeos prontos da sua agência, com música. Toque em um para ver, mudar o que quiser e baixar." verTudo={{ texto: "Ver todos", ir: () => setSp({ criar: "video" }) }}
            topo={
              <ChipsRolaveis className="mb-3" dado="categorias-video">
                {([["todos", "Todos"], ...CATEGORIAS_VIDEO.map((c) => [c.id, c.nome])] as [string, string][]).map(([id, nome]) => (
                  <button key={id} data-categoria={id} aria-pressed={catVideo === id} onClick={(e) => { setCatVideo(id as CategoriaVideo | "todos"); e.currentTarget.scrollIntoView({ inline: "center", block: "nearest", behavior: "smooth" }); }} className={"min-h-10 shrink-0 rounded-full border px-4 text-[13px] font-bold " + (catVideo === id ? "border-transparent text-black" : "border-white/15 text-white/75 hover:bg-white/[0.06]")} style={catVideo === id ? { background: AMARELO } : undefined}>{nome}</button>
                ))}
              </ChipsRolaveis>
            }>
            {VIDEOS.filter((v) => catVideo === "todos" || v.cat === catVideo).map((v) => (
              <button key={v.id} data-video={v.id} onClick={() => setPrevia({ tipo: "video", v })} className="w-36 shrink-0 snap-start text-left transition-transform hover:-translate-y-1 sm:w-44">
                <CapaVideo v={v} />
                <div className="mt-1.5 truncate text-[13px] font-bold">{v.nome}</div>
                <div className="truncate text-[11px] text-white/45">{CATEGORIAS_VIDEO.find((c) => c.id === v.cat)?.nome} · {NOME_VISUAL[v.visual || "classico"]}</div>
              </button>
            ))}
          </Fileira>

          <div ref={artesRef}>
            <Fileira id="modelos-anuncio" titulo="Modelos para você: anúncios" sub="Artes de pacote com a sua marca. Toque em um modelo, escreva o destino e baixe.">
              {MODELOS_ARTE.map((v) => (
                <button key={v} data-arte={v} onClick={() => setPrevia({ tipo: "arte", variant: v })} className="w-40 shrink-0 snap-start text-left transition-transform hover:-translate-y-1 sm:w-48">
                  <div className="aspect-square overflow-hidden rounded-2xl bg-white/[0.06]">
                    {minis.get(v) ? <img src={minis.get(v)} alt="" className="h-full w-full object-cover" /> : <div className="h-full w-full animate-pulse" />}
                  </div>
                  <div className="mt-1.5 truncate text-[13px] font-bold">Modelo {v + 1}</div>
                </button>
              ))}
            </Fileira>
          </div>

          <section className="mt-8 flex flex-col gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-5 sm:flex-row sm:items-center">
            <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl" style={{ background: AMARELO }}><Wand2 className="h-7 w-7 text-black" /></span>
            <div className="min-w-0 flex-1">
              <h2 className="text-lg font-extrabold">Gerador de vídeo</h2>
              <p className="text-[13px] text-white/55">Tem um pacote para vender? Faça o vídeo dele: destino, o que inclui e o preço.</p>
            </div>
            <button id="abrir-gerador" onClick={() => setSp({ criar: "video" })} className="min-h-12 rounded-full px-6 text-sm font-black text-black" style={{ background: AMARELO }}>Criar vídeo do meu pacote</button>
          </section>

          <Fileira id="conteudo-pronto" titulo="Conteúdo pronto do Canva Viagem" sub="Vídeos, artes, legendas e ferramentas que já vêm prontos.">
            {PRONTOS_PORTAL.map((p) => (
              <button key={p.nome} onClick={p.ir} className="flex w-44 shrink-0 snap-start flex-col gap-2 rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-left transition-colors hover:bg-white/[0.07] sm:w-52">
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-white/[0.07]"><p.icone className="h-5 w-5" style={{ color: ACENTO }} /></span>
                <span className="text-[14px] font-extrabold leading-tight">{p.nome}</span>
                <span className="text-[12px] leading-snug text-white/50">{p.sub}</span>
              </button>
            ))}
          </Fileira>

          <section className="mt-8 flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <span className="grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-full bg-white/10 text-[10px] text-white/50">{fabrica.logoBase64 ? <img src={fabrica.logoBase64} alt="" className="h-full w-full object-contain" /> : "logo"}</span>
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-extrabold">{fabrica.agencyName || "Dados do Perfil"}</div>
              <div className="truncate text-[12px] text-white/50">Nome, logo, cores e WhatsApp entram sozinhos em tudo que você gerar.</div>
            </div>
            <button id="abrir-cadastro" onClick={() => setCadastro(true)} className="min-h-10 rounded-full border border-white/15 px-4 text-[13px] font-bold">Editar</button>
          </section>

          <label className="mt-8 flex items-center gap-2 text-[12px] text-white/35">
            <input type="checkbox" checked={pagamento} onChange={(e) => setPagamento(e.target.checked)} /> Protótipo: mostrar como fica o aviso de pagamento
          </label>
        </main>
      </div>



      {cadastro && <Suspense fallback={null}><CadastroRapido aoFechar={() => setCadastro(false)} /></Suspense>}
      {previa && (
        <div data-previa className="fixed inset-0 z-30 flex items-end justify-center bg-black/80 sm:items-center sm:p-6" onClick={fecharPrevia}>
          <div className="relative flex max-h-[94vh] w-full max-w-3xl flex-col gap-5 overflow-y-auto rounded-t-3xl bg-[#141416] p-5 sm:flex-row sm:rounded-3xl sm:p-7" onClick={(e) => e.stopPropagation()}>
            <button aria-label="Fechar" onClick={fecharPrevia} className="absolute right-3 top-3 z-10 grid h-10 w-10 place-items-center rounded-full bg-black/60"><X className="h-5 w-5" /></button>
            {previa.tipo === "video" && <CapaVideo v={previa.v} className="mx-auto w-[52%] shrink-0 sm:w-64" />}
            {previa.tipo === "arte" && (
              <div className="mx-auto aspect-square w-[80%] shrink-0 overflow-hidden rounded-2xl bg-white/[0.06] sm:w-80">
                {minis.get(previa.variant) && <img src={minis.get(previa.variant)} alt="" className="h-full w-full object-cover" />}
              </div>
            )}
            {previa.tipo === "salvo" && <video src={previa.url} controls autoPlay playsInline loop className="mx-auto aspect-[9/16] w-[58%] shrink-0 rounded-2xl bg-black sm:w-64" />}
            <div className="flex min-w-0 flex-1 flex-col">
              {previa.tipo === "video" && (
                <>
                  <h2 className="pr-10 text-2xl font-black">{previa.v.nome}</h2>
                  <p className="mt-1 text-[13px] text-white/55">{previa.v.resumo}. Vídeo vertical de cerca de 25 segundos, com música.</p>
                  <button id="personalizar-modelo" onClick={() => abrirVideo(previa.v)} className="mt-5 min-h-12 rounded-full text-sm font-black text-black" style={{ background: AMARELO }}>Personalizar este modelo</button>
                  <button id="baixar-direto" onClick={() => abrirVideo(previa.v, true)} className="mt-2 flex min-h-12 items-center justify-center gap-2 rounded-full border border-white/15 text-sm font-bold"><Download className="h-4 w-4" />Baixar assim mesmo</button>
                  <p className="mt-3 text-[12px] text-white/40">Sua logo e seu WhatsApp já entram sozinhos.</p>
                </>
              )}
              {previa.tipo === "arte" && (
                <>
                  <h2 className="pr-10 text-2xl font-black">Anúncio · Modelo {previa.variant + 1}</h2>
                  <p className="mt-1 text-[13px] text-white/55">Arte de pacote para o feed ou os stories. O destino, a foto e o preço são de exemplo: você troca tudo.</p>
                  <button id="personalizar-modelo" onClick={() => abrirArte(previa.variant)} className="mt-5 min-h-12 rounded-full text-sm font-black text-black" style={{ background: AMARELO }}>Personalizar este modelo</button>
                </>
              )}
              {previa.tipo === "salvo" && (
                <>
                  <h2 className="pr-10 text-2xl font-black">{nomeDoSalvo(previa.s)}</h2>
                  <p className="mt-1 text-[13px] text-white/55">Gerado {quando(previa.s.criadoEm)}. Fica guardado só neste aparelho.</p>
                  <a href={previa.url} download={`${previa.s.nome || "video"}.mp4`} className="mt-5 flex min-h-12 items-center justify-center gap-2 rounded-full text-sm font-black text-black" style={{ background: AMARELO }}><Download className="h-4 w-4" />Baixar vídeo</a>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/** Arte, versão simples: escolher um modelo; depois abre o editor estilo Canva. */
function EscolherArte({ aoEscolher, aoVoltar }: { aoEscolher: (v: number, formato?: "story") => void; aoVoltar: () => void }) {
  const navigate = useNavigate();
  const { state: fabrica } = useFabricaContext();
  const minis = useMiniaturas(fabrica, true);
  return (
    <div className="fn-pagina min-h-screen px-4 pb-16 pt-4 text-white sm:px-8">
      <div className="mx-auto max-w-5xl">
        <div className="flex items-center justify-between">
          <button onClick={aoVoltar} className="flex min-h-11 items-center gap-2 rounded-full border border-white/10 px-4 text-[13px] font-bold"><ArrowLeft className="h-4 w-4" />Voltar</button>
          <BotaoTema compacto />
        </div>
        <h1 className="mt-6 text-2xl font-black sm:text-4xl">Que arte você quer fazer?</h1>
        <p className="mt-1 text-[14px] text-white/55">Escolha um estilo. Depois é só tocar no que quiser mudar: texto, foto, preço, cores.</p>
        <div id="escolher-arte" className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {MODELOS_ARTE.map((v) => (
            <button key={v} data-escolher-arte={v} onClick={() => aoEscolher(v)} className="fn-sombra overflow-hidden rounded-2xl border border-white/10 bg-[#141416] text-left transition-transform hover:-translate-y-1">
              {minis.get(v) ? <img src={minis.get(v)} alt="" className="aspect-square w-full object-cover" /> : <div className="aspect-square w-full animate-pulse bg-white/[0.06]" />}
              <div className="p-3 text-[14px] font-extrabold">Estilo {v + 1}</div>
            </button>
          ))}
          <h2 className="col-span-full mt-4 text-[18px] font-black">Para Stories e Reels (em pé)</h2>
          {MODELOS_ARTE.map((v) => (
            <button key={`s${v}`} data-escolher-arte-story={v} onClick={() => aoEscolher(v, "story")} className="fn-sombra overflow-hidden rounded-2xl border border-white/10 bg-[#141416] text-left transition-transform hover:-translate-y-1">
              {minis.get(v + STORY) ? <img src={minis.get(v + STORY)} alt="" className="aspect-[9/16] w-full object-cover" /> : <div className="aspect-[9/16] w-full animate-pulse bg-white/[0.06]" />}
              <div className="p-3 text-[14px] font-extrabold">Stories {v + 1}</div>
            </button>
          ))}
          <button id="arte-avancada" onClick={() => navigate("/fabrica/anuncio")} className="fn-sombra flex flex-col justify-between gap-3 rounded-2xl border border-dashed border-white/20 bg-[#141416] p-4 text-left">
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-white/[0.08]"><Settings2 className="h-6 w-6" /></span>
            <span>
              <span className="block text-[15px] font-extrabold">Modo avançado</span>
              <span className="mt-1 block text-[12px] leading-snug text-white/55">O formulário completo, com todas as opções e várias artes de uma vez.</span>
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}

/** Gerador de vídeo, versão simples: escolher um modelo, sem o painel cheio de opções. */
// Estilos do vídeo de pacote (os mesmos do gerador completo, "Escolha o visual do vídeo")
const ESTILOS_PACOTE: { id: string; nome: string }[] = [
  { id: "montagem", nome: "Montagem" }, { id: "classico", nome: "Clássico" }, { id: "promo", nome: "Promo azul" },
  { id: "faixa", nome: "Faixa preta" }, { id: "cartao", nome: "Cartão" }, { id: "neon", nome: "Neon" },
  { id: "vibrante", nome: "Vibrante" }, { id: "luxo", nome: "Luxo" }, { id: "passagem", nome: "Passagem" },
  { id: "revista", nome: "Revista" }, { id: "postal", nome: "Postal" }, { id: "bf", nome: "Black Friday" },
];

const ENTRADAS_VIDEO: { id: string; nome: string; desc: string; para: string; icone: typeof Package }[] = [
  { id: "audio", nome: "Mandar um áudio", desc: "Fale o pacote e a gente escreve.", para: "/fabrica/video?entrada=audio", icone: Mic },
  { id: "foto", nome: "Mandar uma foto", desc: "Print ou foto do pacote.", para: "/fabrica/video?entrada=foto", icone: Camera },
  { id: "texto", nome: "Colar o texto", desc: "Cole o texto do pacote.", para: "/fabrica/video?entrada=texto", icone: FileText },
  { id: "pacote", nome: "Escolher um pacote", desc: "Use um pacote pronto da casa.", para: "/fabrica/video?entrada=pacote", icone: Package },
  { id: "avancado", nome: "Modo avançado", desc: "O formulário completo, com as cenas e todas as opções.", para: "/fabrica/video", icone: Settings2 },
];

function EscolherVideo({ aoEscolher, aoVoltar }: { aoEscolher: (id: string) => void; aoVoltar: () => void }) {
  const navigate = useNavigate();
  return (
    <div className="fn-pagina min-h-screen px-4 pb-16 pt-4 text-white sm:px-8">
      <div className="mx-auto max-w-5xl">
        <div className="flex items-center justify-between">
          <button onClick={aoVoltar} className="flex min-h-11 items-center gap-2 rounded-full border border-white/10 px-4 text-[13px] font-bold"><ArrowLeft className="h-4 w-4" />Início</button>
          <BotaoTema compacto />
        </div>
        <h1 className="mt-6 text-2xl font-black sm:text-4xl">Que vídeo você quer fazer?</h1>
        <h2 className="mt-6 text-[17px] font-black">Vídeo de um pacote</h2>
        <p className="mt-0.5 text-[13px] text-white/55">Conte o pacote do jeito mais fácil para você. A gente monta o vídeo com destino, o que inclui e preço.</p>
        <div id="entradas-video" className="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-5">
          {ENTRADAS_VIDEO.map((e) => (
            <button key={e.id} data-entrada-video={e.id} onClick={() => navigate(e.para)} className={`fn-sombra flex min-h-[112px] flex-col justify-between gap-2 rounded-2xl border bg-[#141416] p-3.5 text-left transition-transform hover:-translate-y-1 ${e.id === "avancado" ? "border-dashed border-white/20" : "border-white/10"}`}>
              <span className="grid h-10 w-10 place-items-center rounded-xl" style={{ background: e.id === "avancado" ? "rgba(255,255,255,.08)" : "rgba(255,198,41,.16)", color: e.id === "avancado" ? "#fff" : "#FFC629" }}><e.icone className="h-5 w-5" /></span>
              <span>
                <span className="block text-[14px] font-extrabold">{e.nome}</span>
                <span className="mt-0.5 block text-[12px] leading-snug text-white/55">{e.desc}</span>
              </span>
            </button>
          ))}
        </div>
        <h2 className="mt-8 text-[17px] font-black">Vídeo da sua agência</h2>
        <p className="mt-0.5 text-[13px] text-white/55">Pronto para postar. Depois você muda os textos, as cenas, o tempo de cada cena, a animação e a música.</p>
        <ChipsRolaveis className="sticky top-0 z-10 mt-4 bg-[hsl(var(--background))] py-2" dado="filtro-agencia">
          {CATEGORIAS_VIDEO.map((c) => (
            <a key={c.id} href={"#cat-" + c.id} onClick={(e) => { e.preventDefault(); document.getElementById("cat-" + c.id)?.scrollIntoView({ behavior: "smooth", block: "start" }); }} className="min-h-10 shrink-0 rounded-full border border-white/15 px-4 py-2 text-[13px] font-bold text-white/80 hover:bg-white/[0.06]">{c.nome}</a>
          ))}
        </ChipsRolaveis>
        <div id="escolher-video">
          {CATEGORIAS_VIDEO.map((c) => (
            <section key={c.id} id={"cat-" + c.id} data-cat-video={c.id} className="scroll-mt-16">
              <h3 className="mt-6 text-[16px] font-black">{c.nome}</h3>
              <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                {VIDEOS.filter((v) => v.cat === c.id).map((v) => (
                  <button key={v.id} data-escolher={v.id} onClick={() => aoEscolher(v.id)} className="fn-sombra overflow-hidden rounded-2xl border border-white/10 bg-[#141416] text-left transition-transform hover:-translate-y-1">
                    <CapaVideo v={v} className="rounded-none" />
                    <div className="p-3">
                      <div className="text-[14px] font-extrabold">{v.nome}</div>
                      <div className="mt-0.5 text-[12px] leading-snug text-white/55">{v.resumo}</div>
                      <div className="mt-1 text-[11px] font-bold text-white/40">{NOME_VISUAL[v.visual || "classico"]}</div>
                    </div>
                  </button>
                ))}
              </div>
            </section>
          ))}
        </div>
        <h2 className="mt-10 flex items-center gap-2 text-[17px] font-black"><Package className="h-5 w-5" />Vídeo de um pacote</h2>
        <p className="mt-0.5 text-[13px] text-white/55">Com destino, o que inclui e preço. Escolha o visual; depois você conta o pacote (por texto, áudio ou foto).</p>
        <div id="estilos-pacote" className="mt-4 grid grid-cols-3 gap-2.5 sm:grid-cols-4 lg:grid-cols-6">
          {ESTILOS_PACOTE.map((e) => (
            <button key={e.id} data-estilo-pacote={e.id} onClick={() => navigate(`/fabrica/video?estilo=${e.id}`)} className="fn-sombra overflow-hidden rounded-2xl border border-white/10 bg-[#141416] text-left transition-transform hover:-translate-y-1">
              <img src={`/video-estilos/${e.id}.jpg`} alt="" loading="lazy" className="aspect-[9/16] w-full object-cover" />
              <div className="px-2.5 py-2 text-[13px] font-extrabold">{e.nome}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function Telas() {
  const [sp, setSp] = useSearchParams();
  const video = VIDEOS.find((v) => v.id === sp.get("video"));
  const arte = sp.get("arte");
  const voltar = () => setSp({});
  const simples = useMemo<EditorSimples | null>(
    () => (video ? { modelo: video.modelo, nome: video.nome, pronto: prontoDe(video), gerarJa: sp.get("gerar") === "1", aoVoltar: voltar } : null),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [video?.id],
  );
  if (video && sp.get("antigo") !== "1") {
    return (
      <Suspense fallback={<div className="grid min-h-screen place-items-center bg-[#0A0A0B] text-sm text-white/60">Abrindo o editor…</div>}>
        <EditorArteCanva key={`v-${video.id}`} videoInicial={video} baixarJa={sp.get("gerar") === "1"} variantInicial={0} formatoInicial="story" aoVoltar={() => window.history.length > 1 ? window.history.back() : voltar()} />
      </Suspense>
    );
  }
  if (video && simples) {
    return (
      <Suspense fallback={<div className="grid min-h-screen place-items-center bg-[#0A0A0B] text-sm text-white/60">Abrindo o editor…</div>}>
        <EditorVideo key={video.id} embutido simples={simples} />
      </Suspense>
    );
  }
  if (sp.get("criar") === "video") return <EscolherVideo aoEscolher={(id) => setSp({ video: id })} aoVoltar={voltar} />;
  if (sp.get("criar") === "arte") return <EscolherArte aoEscolher={(v, formato) => setSp(formato ? { arte: String(v), formato } : { arte: String(v) })} aoVoltar={voltar} />;
  if (arte !== null) {
    return (
      <Suspense fallback={<div className="grid min-h-screen place-items-center bg-[#0A0A0B] text-sm text-white/60">Abrindo o editor…</div>}>
        <EditorArteCanva key={`${arte}-${sp.get("projeto") || ""}-${sp.get("link") || ""}`} projetoInicial={sp.get("projeto") || undefined} linkInicial={sp.get("link") || undefined} copiaDoLink={sp.get("copia") === "1"} variantInicial={Math.min(11, Math.max(0, Number(arte) || 0))} formatoInicial={sp.get("formato") === "story" ? "story" : "square"} aoVoltar={() => window.history.length > 1 ? window.history.back() : voltar()} />
      </Suspense>
    );
  }
  return <Inicio />;
}

function ComTema() {
  try { sessionStorage.setItem(CHAVE_INICIO_NOVO, "1"); } catch { /* segue */ }
  return <Telas />;
}

export default function FabricaNova() {
  return (
    <FabricaProvider>
      <ComTema />
    </FabricaProvider>
  );
}
