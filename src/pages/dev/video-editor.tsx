// Peças do vídeo dentro do editor de artes: vídeo de fundo no palco, painéis (vídeo, música, animar)
// e a prévia "Ver o vídeo". O resto (texto, preço, inclusos, elementos, marca, cores) é o editor de artes.
import { useEffect, useMemo, useRef, useState } from "react";
import { Check, Clock, Image as ImageIcon, Pause, Play, Sparkles, Upload, X } from "lucide-react";
import type { AnimItem, CenaVideo } from "./arte-nova";
import { ANIMACOES, type Animacao, type ModoAnim, type VelAnim } from "./video-cena";
import { CATEGORIAS_CLIPE, CLIPES, capaDoClipe } from "./video-paginas";
import { ehMusicaPropria, tocarPrevia, type CenaPronta } from "./video-saida";
import { MUSICAS } from "@/lib/musica-video";

const fmt = (s: number) => s.toFixed(1).replace(".", ",") + " s";
const chip = (on: boolean) => `min-h-10 rounded-full border px-3.5 text-[13px] font-semibold ${on ? "border-[#F5F906] bg-[#F5F906] text-black" : "border-white/15 text-white/80"}`;
const rotulo = "mb-1.5 block text-[12px] font-bold text-white/60";

/** O vídeo de fundo tocando no palco, no lugar da foto: repete o trecho da cena na velocidade escolhida. */
export function VideoNoPalco({ src, estilo, cena }: { src: string; estilo: React.CSSProperties; cena: CenaVideo }) {
  const ref = useRef<HTMLVideoElement>(null);
  const vel = cena.velocidade || 1, inicio = cena.inicio || 0, dur = Math.max(1, cena.dur ?? 3);
  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    v.playbackRate = vel;
    const fim = () => inicio + dur * vel;
    const volta = () => { if (v.currentTime < inicio - 0.05 || v.currentTime > fim()) { try { v.currentTime = inicio; } catch { /* ainda carregando */ } } };
    const pronto = () => { try { v.currentTime = inicio; } catch { /* */ } v.playbackRate = vel; void v.play().catch(() => undefined); };
    v.addEventListener("timeupdate", volta);
    v.addEventListener("loadedmetadata", pronto);
    if (v.readyState >= 1) pronto();
    return () => { v.removeEventListener("timeupdate", volta); v.removeEventListener("loadedmetadata", pronto); };
  }, [src, vel, inicio, dur]);
  const z = cena.zoom || 1;
  return (
    <div data-video-palco className="pointer-events-none absolute overflow-hidden" style={estilo}>
      <video
        ref={ref} src={src} muted playsInline autoPlay loop preload="auto"
        className="h-full w-full object-cover"
        style={{ transform: `translate(${-(cena.px || 0) * (z - 1) * 50}%, ${-(cena.py || 0) * (z - 1) * 50}%) scale(${z})`, transformOrigin: "center" }}
      />
    </div>
  );
}

/** Painel "Vídeo": troca o vídeo de fundo da cena por um da casa, um do cliente ou uma foto. */
export function PainelVideoFundo({ atual, nome, aoEscolher, aoUsarFoto }: { atual?: string; nome?: string; aoEscolher: (url: string, nome: string) => void; aoUsarFoto: () => void }) {
  const arquivo = useRef<HTMLInputElement>(null);
  const [cat, setCat] = useState<string>("todos");
  const lista = CLIPES.filter((c) => cat === "todos" || c.cat === cat);
  const capa = capaDoClipe(atual);
  return (
    <div data-painel-video className="flex flex-col gap-4">
      <div className="flex items-center gap-3 rounded-2xl bg-white/[0.05] p-2.5">
        {capa ? <img src={capa} alt="" className="h-16 w-12 shrink-0 rounded-lg object-cover" /> : <span className="grid h-16 w-12 shrink-0 place-items-center rounded-lg bg-white/[0.08] text-[10px] font-bold text-white/60">{atual ? "Seu vídeo" : "Foto"}</span>}
        <div className="min-w-0 flex-1">
          <p className="text-[12px] font-bold text-white/55">Vídeo desta cena</p>
          <p className="truncate text-[14px] font-extrabold">{atual ? nome || "Vídeo enviado" : "Foto (sem vídeo)"}</p>
        </div>
      </div>
      <button type="button" data-enviar-video onClick={() => arquivo.current?.click()} className="flex min-h-12 items-center justify-center gap-2 rounded-xl border border-dashed border-white/25 text-[14px] font-bold"><Upload className="h-4 w-4" />Enviar um vídeo seu</button>
      <input ref={arquivo} type="file" accept="video/mp4,video/quicktime,video/webm" className="hidden" onChange={(e) => {
        const f = e.target.files?.[0];
        if (f) aoEscolher(URL.createObjectURL(f), f.name.replace(/\.[a-z0-9]+$/i, ""));
        e.target.value = "";
      }} />
      <div>
        <p className={rotulo}>Vídeos prontos</p>
        <div className="-mx-1 mb-2 flex gap-1.5 overflow-x-auto px-1 pb-1 [scrollbar-width:none]">
          {[{ id: "todos", nome: "Todos" }, ...CATEGORIAS_CLIPE].map((c) => (
            <button key={c.id} type="button" data-cat-clipe={c.id} onClick={() => setCat(c.id)} className={chip(cat === c.id) + " shrink-0"}>{c.nome}</button>
          ))}
        </div>
        <div className="grid grid-cols-3 gap-1.5">
          {lista.map((c) => (
            <button key={c.url} type="button" data-clipe={c.url} title={c.nome} aria-label={c.nome} aria-pressed={atual === c.url} onClick={() => aoEscolher(c.url, c.nome)} className={"relative overflow-hidden rounded-lg border-2 " + (atual === c.url ? "border-[#F5F906]" : "border-transparent")}>
              <img src={c.capa} alt="" loading="lazy" className="aspect-[9/16] w-full object-cover" />
              {atual === c.url && <span className="absolute right-1 top-1 grid h-5 w-5 place-items-center rounded-full bg-[#F5F906] text-black"><Check className="h-3.5 w-3.5" /></span>}
              <span className="absolute inset-x-0 bottom-0 truncate bg-black/60 px-1 py-0.5 text-[10px] font-bold">{c.nome}</span>
            </button>
          ))}
        </div>
      </div>
      <button type="button" data-usar-foto onClick={aoUsarFoto} className="flex min-h-11 items-center justify-center gap-2 rounded-xl border border-white/15 text-[13px] font-bold"><ImageIcon className="h-4 w-4" />Usar uma foto nesta cena</button>
    </div>
  );
}

/** Painel "Música": a trilha do vídeo inteiro, com botão para ouvir antes. */
export function PainelMusica({ atual, aoEscolher }: { atual: string | undefined; aoEscolher: (id: string) => void }) {
  const [ouvindo, setOuvindo] = useState("");
  const som = useRef<HTMLAudioElement | null>(null);
  useEffect(() => () => { som.current?.pause(); }, []);
  const ouvir = (id: string, arquivo: string) => {
    som.current?.pause();
    if (ouvindo === id) { setOuvindo(""); return; }
    const a = new Audio(arquivo);
    a.volume = 0.7;
    a.onended = () => setOuvindo("");
    void a.play().catch(() => setOuvindo(""));
    som.current = a;
    setOuvindo(id);
  };
  const escolhida = atual === "" ? "" : atual || MUSICAS[0].id;
  const propria = ehMusicaPropria(atual) ? atual! : "";
  const arquivo = useRef<HTMLInputElement | null>(null);
  const [erroMusica, setErroMusica] = useState("");
  const enviar = (f: File | undefined) => {
    setErroMusica("");
    if (!f) return;
    if (!f.type.startsWith("audio/") && !/\.(mp3|m4a|aac|wav|ogg)$/i.test(f.name)) { setErroMusica("Esse arquivo não é de música. Use MP3, M4A ou WAV."); return; }
    if (f.size > 25 * 1024 * 1024) { setErroMusica("Música grande demais (máximo 25 MB)."); return; }
    aoEscolher(URL.createObjectURL(f));
  };
  return (
    <div data-painel-musica className="flex flex-col gap-2">
      <p className="text-[12px] text-white/55">A música vale para o vídeo inteiro. As da lista são livres para usar em anúncio.</p>
      {propria && (
        <div className="flex min-h-14 items-center gap-2 rounded-xl border border-[#F5F906] bg-[#F5F906]/10 px-2">
          <button type="button" aria-label={ouvindo === "propria" ? "Parar" : "Ouvir a sua música"} onClick={() => ouvir("propria", propria)} className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white/[0.08]">{ouvindo === "propria" ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}</button>
          <span className="min-w-0 flex-1"><span className="block truncate text-[14px] font-extrabold">Sua música</span><span className="block truncate text-[12px] text-white/55">Enviada por você</span></span>
          <Check className="h-5 w-5 shrink-0 text-[#F5F906]" />
        </div>
      )}
      {MUSICAS.map((m) => (
        <div key={m.id} className={"flex min-h-14 items-center gap-2 rounded-xl border px-2 " + (escolhida === m.id ? "border-[#F5F906] bg-[#F5F906]/10" : "border-white/10 bg-white/[0.03]")}>
          <button type="button" aria-label={ouvindo === m.id ? "Parar" : `Ouvir ${m.nome}`} onClick={() => ouvir(m.id, m.arquivo)} className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white/[0.08]">{ouvindo === m.id ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}</button>
          <button type="button" data-musica={m.id} onClick={() => aoEscolher(m.id)} className="min-w-0 flex-1 text-left">
            <span className="block truncate text-[14px] font-extrabold">{m.nome}</span>
            <span className="block truncate text-[12px] text-white/55">{m.clima}</span>
          </button>
          {escolhida === m.id && <Check className="h-5 w-5 shrink-0 text-[#F5F906]" />}
        </div>
      ))}
      <button type="button" data-musica="" onClick={() => aoEscolher("")} className={chip(escolhida === "") + " mt-1"}>Sem música</button>
      <button type="button" data-enviar-musica onClick={() => arquivo.current?.click()} className="flex min-h-11 items-center justify-center gap-2 rounded-xl border border-dashed border-white/25 text-[13px] font-bold"><Upload className="h-4 w-4" />Enviar uma música sua</button>
      <input ref={arquivo} type="file" accept="audio/*,.mp3,.m4a,.aac,.wav,.ogg" className="hidden" onChange={(e) => { enviar(e.target.files?.[0]); e.target.value = ""; }} />
      {erroMusica && <p className="text-[12px] text-red-300">{erroMusica}</p>}
      <p className="text-[11px] text-white/40">Use só música que você tem direito de usar. Música de artista famoso pode tirar o som do seu anúncio no Instagram.</p>
    </div>
  );
}

/** "Animar" (como no Canva): a animação do item escolhido, ou de todos os itens da cena. */
/** Amostras animadas dos botões de animação (repetem sem parar, para a pessoa ver cada efeito antes de escolher). */
const AMOSTRA_ANIM: Partial<Record<Animacao, string>> = {
  aparecer: "cv-am-aparecer 1.8s ease-out infinite", subir: "cv-am-subir 1.8s ease-out infinite", descer: "cv-am-descer 1.8s ease-out infinite",
  deslocar: "cv-am-deslocar 1.8s ease-out infinite", zoom: "cv-am-zoom 1.8s ease-out infinite", pulsar: "cv-am-pulsar 1.2s ease-in-out infinite",
};
const ESTILO_AMOSTRAS = `
@keyframes cv-am-aparecer { 0% { opacity: 0 } 35%, 100% { opacity: 1 } }
@keyframes cv-am-subir { 0% { opacity: 0; transform: translateY(10px) } 35%, 100% { opacity: 1; transform: none } }
@keyframes cv-am-descer { 0% { opacity: 0; transform: translateY(-10px) } 35%, 100% { opacity: 1; transform: none } }
@keyframes cv-am-deslocar { 0% { opacity: 0; transform: translateX(-14px) } 35%, 100% { opacity: 1; transform: none } }
@keyframes cv-am-zoom { 0% { opacity: 0; transform: scale(.4) } 35%, 100% { opacity: 1; transform: none } }
@keyframes cv-am-pulsar { 0%, 100% { transform: scale(1) } 50% { transform: scale(1.18) } }
@keyframes cv-am-teclado { 0% { width: 0 } 45%, 100% { width: 1.3em } }
.cv-anim-teclado { display: inline-block; overflow: hidden; white-space: nowrap; vertical-align: bottom; animation: cv-am-teclado 1.8s steps(2) infinite }
@media (prefers-reduced-motion: reduce) { [data-painel-animar] * { animation: none !important } }
`;

export function PainelAnimarItem({ nome, anim, durCena, mudar, todosDaCena, todasAsCenas, aoVer }: {
  nome: string; anim: AnimItem | undefined; durCena: number;
  mudar: (p: Partial<AnimItem>) => void; todosDaCena?: () => void; todasAsCenas: () => void; aoVer?: () => void;
}) {
  const atual: Animacao = anim?.anim || "nenhuma";
  const livre = atual !== "nenhuma";
  const lista = ANIMACOES.filter((a) => a.id !== "padrao");
  return (
    <div data-painel-animar className="flex flex-col gap-5">
      <style>{ESTILO_AMOSTRAS}</style>
      <div className="flex items-center justify-between gap-2">
        <p className="text-[14px] font-extrabold">{nome}</p>
        {aoVer && <button type="button" data-ver-animacao onClick={aoVer} className="flex min-h-10 shrink-0 items-center gap-1.5 rounded-full border border-white/15 px-3.5 text-[13px] font-bold"><Play className="h-4 w-4" />Ver na cena</button>}
      </div>
      <section>
        <p className={rotulo}><Sparkles className="mr-1 inline h-3.5 w-3.5" />Sugestões</p>
        <div className="grid grid-cols-3 gap-1.5">
          {lista.map((a) => (
            <button key={a.id} type="button" data-animacao={a.id} onClick={() => mudar({ anim: a.id })} className={"flex min-h-16 flex-col items-center justify-center gap-1 rounded-xl border text-[12px] font-bold " + (atual === a.id ? "border-[#F5F906] bg-[#F5F906]/10" : "border-white/10 bg-white/[0.03]")}>
              <span className={"text-[17px] font-black " + (atual === a.id ? "text-[#F5F906]" : "text-white/80")} style={{ animation: AMOSTRA_ANIM[a.id] }}>{a.id === "teclado" ? <span className="cv-anim-teclado">Aa</span> : "Aa"}</span>{a.nome}
            </button>
          ))}
        </div>
      </section>
      {livre && (
        <>
          <section>
            <p className={rotulo}>Quando anima</p>
            <div className="flex flex-wrap gap-1.5">
              {([["ambos", "Ambos"], ["entrando", "Entrando"], ["saindo", "Saindo"]] as [ModoAnim, string][]).map(([id, n]) => <button key={id} type="button" data-anim-modo={id} onClick={() => mudar({ modo: id })} className={chip((anim?.modo || "ambos") === id)}>{n}</button>)}
            </div>
          </section>
          <section>
            <p className={rotulo}>Velocidade da animação</p>
            <div className="flex flex-wrap gap-1.5">
              {([["lenta", "Lenta"], ["normal", "Normal"], ["rapida", "Rápida"]] as [VelAnim, string][]).map(([id, n]) => <button key={id} type="button" data-anim-vel={id} onClick={() => mudar({ vel: id })} className={chip((anim?.vel || "normal") === id)}>{n}</button>)}
            </div>
          </section>
          <section>
            <p className={rotulo}><Clock className="mr-1 inline h-3.5 w-3.5" />Aparece depois de</p>
            <div className="flex items-center gap-3">
              <input type="range" data-anim-atraso aria-label="Segundos até aparecer" min={0} max={Math.max(0, Math.round((durCena - 0.8) * 10) / 10)} step={0.1} value={anim?.atraso || 0} onChange={(e) => mudar({ atraso: Number(e.target.value) })} className="w-full accent-[#F5F906]" />
              <span className="w-16 shrink-0 text-right text-[13px] font-bold tabular-nums">{fmt(anim?.atraso || 0)}</span>
            </div>
          </section>
        </>
      )}
      <div className="flex flex-col gap-2">
        {todosDaCena && <button type="button" data-animar-todos onClick={todosDaCena} className="min-h-11 rounded-xl border border-white/15 text-[13px] font-bold">Usar em todos os itens desta cena</button>}
        <button type="button" data-animar-todas onClick={todasAsCenas} className="min-h-11 rounded-xl border border-white/15 text-[13px] font-bold">Usar em todos os itens de todas as cenas</button>
      </div>
    </div>
  );
}

/** Toca só a cena atual por cima do palco, uma vez, para ver a animação enquanto edita. Tocar nela para. */
export function CenaNoPalco({ preparar, aoFim }: { preparar: () => Promise<CenaPronta>; aoFim: () => void }) {
  const tela = useRef<HTMLCanvasElement>(null);
  const [pronta, setPronta] = useState<CenaPronta | null>(null);
  const fim = useRef(aoFim);
  fim.current = aoFim;
  useEffect(() => {
    let vivo = true;
    preparar().then((c) => { if (vivo) setPronta(c); }).catch(() => vivo && fim.current());
    return () => { vivo = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    if (!pronta || !tela.current) return;
    const parar = tocarPrevia(tela.current, [pronta], undefined, () => undefined, () => setTimeout(() => fim.current(), 250));
    return () => parar();
  }, [pronta]);
  const altura = pronta?.altura || 1920;
  return (
    <button type="button" data-cena-no-palco aria-label="Parar a prévia" onPointerDown={(e) => e.stopPropagation()} onClick={() => fim.current()} className="absolute inset-0 z-30 overflow-hidden rounded-md bg-black/30">
      <canvas ref={tela} width={540} height={Math.round((540 * altura) / 1080)} className={"h-full w-full transition-opacity " + (pronta ? "opacity-100" : "opacity-0")} />
      <span className="pointer-events-none absolute left-2 top-2 flex items-center gap-1 rounded-full bg-black/70 px-2.5 py-1 text-[11px] font-bold text-white"><Play className="h-3 w-3" />{pronta ? "Prévia da cena" : "Preparando…"}</span>
    </button>
  );
}

/** "Ver o vídeo": prepara as cenas e toca o vídeo inteiro com a música. */
export function TocadorVideo({ preparar, musica, aoFechar, aoBaixar }: { preparar: () => Promise<CenaPronta[]>; musica?: string; aoFechar: () => void; aoBaixar: () => void }) {
  const tela = useRef<HTMLCanvasElement>(null);
  const [cenas, setCenas] = useState<CenaPronta[] | null>(null);
  const [erro, setErro] = useState("");
  const [tempo, setTempo] = useState({ t: 0, total: 0 });
  const [acabou, setAcabou] = useState(false);
  const [vez, setVez] = useState(0);
  const parar = useRef<() => void>(() => undefined);
  useEffect(() => {
    let vivo = true;
    preparar().then((c) => { if (vivo) setCenas(c); }).catch(() => vivo && setErro("Não consegui preparar o vídeo. Tente de novo."));
    return () => { vivo = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    if (!cenas || !tela.current) return;
    setAcabou(false);
    parar.current = tocarPrevia(tela.current, cenas, musica, (t, total) => setTempo({ t, total }), () => setAcabou(true));
    return () => parar.current();
  }, [cenas, musica, vez]);
  const altura = cenas?.[0]?.altura || 1920;
  const pct = useMemo(() => (tempo.total ? Math.min(100, (tempo.t / tempo.total) * 100) : 0), [tempo]);
  return (
    <div data-tocador-video className="fixed inset-0 z-[70] flex flex-col items-center justify-center gap-3 bg-black/90 p-4" onPointerDown={aoFechar}>
      <div className="relative flex max-h-full flex-col items-center gap-3" onPointerDown={(e) => e.stopPropagation()}>
        <div className="relative overflow-hidden rounded-xl bg-black shadow-2xl" style={{ height: "min(78dvh, calc((100vw - 32px) * " + altura / 1080 + "))", aspectRatio: `1080 / ${altura}` }}>
          <canvas ref={tela} width={540} height={Math.round((540 * altura) / 1080)} className="h-full w-full" />
          {!cenas && !erro && <span className="absolute inset-0 grid place-items-center text-[14px] font-bold text-white/80">Preparando o vídeo…</span>}
          {erro && <span className="absolute inset-0 grid place-items-center p-6 text-center text-[14px] font-bold text-amber-200">{erro}</span>}
          {acabou && (
            <button type="button" data-ver-de-novo onClick={() => setVez((n) => n + 1)} className="absolute inset-0 grid place-items-center bg-black/50">
              <span className="flex items-center gap-2 rounded-full bg-white px-5 py-3 text-[14px] font-black text-black"><Play className="h-5 w-5" />Ver de novo</span>
            </button>
          )}
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/15"><div className="h-full bg-[#F5F906]" style={{ width: `${pct}%` }} /></div>
        <div className="flex w-full items-center justify-between gap-2 text-[12px] font-bold text-white/70">
          <span className="tabular-nums">{fmt(tempo.t)} de {fmt(tempo.total)}</span>
          <div className="flex gap-2">
            <button type="button" data-baixar-do-tocador onClick={aoBaixar} className="min-h-10 rounded-full px-4 text-[13px] font-black text-black" style={{ background: "#F5F906" }}>Baixar</button>
            <button type="button" aria-label="Fechar" data-fechar-tocador onClick={aoFechar} className="grid h-10 w-10 place-items-center rounded-full bg-white/10"><X className="h-5 w-5" /></button>
          </div>
        </div>
      </div>
    </div>
  );
}
