// Faixas de áudio embaixo das cenas (como num editor de vídeo): Voz e Música.
// A posição de cada segundo acompanha as miniaturas das cenas (cena 2 fica embaixo da cena 2).
// Voz: tocar seleciona e marca o ponto do corte; arrastar move; puxar as bordas corta; Dividir, Volume, Velocidade, Apagar.
// Música: Volume, Trocar, Tirar. Com voz, a música abaixa sozinha para 15% enquanto a voz fala.
import { useEffect, useRef, useState } from "react";
import { INICIO_VOZ, type VozGravada } from "@/lib/voz-gravada";
import { MIN_CLIPE, VEL_MAX, VEL_MIN, VOL_MAX, dividirClipe, durClipe, fimClipe, ondasDe, type ClipeVoz } from "@/lib/faixa-audio";

/** Onde cada cena está na faixa (px, relativo à linha das miniaturas). */
export type PosCena = { x0: number; x1: number; t0: number; t1: number };
export type SelAudio = { tipo: "voz"; id: string } | { tipo: "musica" } | null;

const xDe = (pos: PosCena[], t: number) => {
  if (!pos.length) return 0;
  const p = pos.find((c) => t < c.t1) || pos[pos.length - 1];
  const k = p.t1 > p.t0 ? (Math.min(Math.max(t, p.t0), p.t1) - p.t0) / (p.t1 - p.t0) : 0;
  return p.x0 + k * (p.x1 - p.x0);
};
const tDe = (pos: PosCena[], x: number) => {
  if (!pos.length) return 0;
  for (let i = 0; i < pos.length; i++) {
    const p = pos[i];
    if (x < p.x0) return p.t0; // no vão entre duas cenas
    if (x <= p.x1) return p.t0 + ((x - p.x0) / Math.max(1, p.x1 - p.x0)) * (p.t1 - p.t0);
  }
  return pos[pos.length - 1].t1;
};

function Ondas({ ondas, de, ate, dur, w, h, cor }: { ondas: Float32Array | null; de: number; ate: number; dur: number; w: number; h: number; cor: string }) {
  const tela = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = tela.current;
    if (!c || !ondas || w < 2) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    c.width = Math.round(w * dpr); c.height = Math.round(h * dpr);
    const g = c.getContext("2d")!;
    g.scale(dpr, dpr);
    g.clearRect(0, 0, w, h);
    g.fillStyle = cor;
    for (let x = 0; x < w; x += 2) {
      const s = de + (x / w) * (ate - de);
      const v = ondas[Math.min(ondas.length - 1, Math.floor((s / Math.max(0.01, dur)) * ondas.length))] || 0;
      const a = Math.max(1, v * (h - 4));
      g.fillRect(x, (h - a) / 2, 1.2, a);
    }
  }, [ondas, de, ate, dur, w, h, cor]);
  return <canvas ref={tela} aria-hidden className="pointer-events-none absolute inset-0" style={{ width: w, height: h }} />;
}

type Props = {
  pos: PosCena[]; largura: number; total: number;
  voz: VozGravada | null; clipes: ClipeVoz[]; mudarClipes: (c: ClipeVoz[]) => void;
  musica: { nome: string } | null; volMusica: number;
  sel: SelAudio; setSel: (s: SelAudio) => void; cursor: number | null; setCursor: (t: number | null) => void;
  aoAdicionarVoz: () => void; aoAdicionarMusica: () => void;
};

export function FaixasAudio({ pos, largura, total, voz, clipes, mudarClipes, musica, volMusica, sel, setSel, cursor, setCursor, aoAdicionarVoz, aoAdicionarMusica }: Props) {
  const [ondas, setOndas] = useState<Float32Array | null>(null);
  const arraste = useRef<{ id: string; modo: "mover" | "esq" | "dir"; x0: number; t0: number; orig: ClipeVoz; mexeu: boolean } | null>(null);
  const faixa = useRef<HTMLDivElement>(null);
  useEffect(() => { setOndas(null); if (voz) void ondasDe(voz).then(setOndas).catch(() => undefined); }, [voz]);
  if (!pos.length) return null;
  const xIni = pos[0].x0, xFim = pos[pos.length - 1].x1;
  const rot = "absolute left-0 flex items-center pr-2 text-[10px] font-black uppercase tracking-wide text-white/45 [html.fabrica-claro_&]:text-black/50";

  const xLocal = (e: React.PointerEvent) => e.clientX - (faixa.current?.getBoundingClientRect().left || 0);
  const comecar = (e: React.PointerEvent, c: ClipeVoz, modo: "mover" | "esq" | "dir") => {
    e.stopPropagation();
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    arraste.current = { id: c.id, modo, x0: xLocal(e), t0: tDe(pos, xLocal(e)), orig: c, mexeu: false };
  };
  const mover = (e: React.PointerEvent) => {
    const a = arraste.current;
    if (!a) return;
    const x = xLocal(e);
    if (!a.mexeu && Math.abs(x - a.x0) < 4) return;
    a.mexeu = true;
    const t = tDe(pos, x), o = a.orig, fonte = voz?.dur || o.ate;
    let n: ClipeVoz = o;
    if (a.modo === "mover") {
      const ini = Math.min(Math.max(INICIO_VOZ, o.ini + (t - a.t0)), Math.max(INICIO_VOZ, total - MIN_CLIPE));
      n = { ...o, ini: Math.round(ini * 100) / 100 };
    } else if (a.modo === "esq") {
      const T = Math.min(Math.max(t, INICIO_VOZ, o.ini - o.de / o.vel), fimClipe(o) - MIN_CLIPE);
      n = { ...o, ini: T, de: o.de + (T - o.ini) * o.vel };
    } else {
      const E = Math.max(Math.min(t, o.ini + (fonte - o.de) / o.vel), o.ini + MIN_CLIPE);
      n = { ...o, ate: o.de + (E - o.ini) * o.vel };
    }
    mudarClipes(clipes.map((c) => (c.id === o.id ? n : c)));
  };
  const soltar = (e: React.PointerEvent) => {
    const a = arraste.current;
    arraste.current = null;
    if (a && !a.mexeu) { setSel({ tipo: "voz", id: a.id }); setCursor(tDe(pos, xLocal(e))); }
  };

  return (
    <div ref={faixa} data-faixas-audio className="relative mt-1.5 select-none" style={{ width: largura, height: 74 }} onPointerDown={(e) => e.stopPropagation()}>
      {/* Voz */}
      <span className={rot} style={{ top: 0, height: 38, width: xIni }}>Voz</span>
      <div className="absolute rounded-md bg-white/[0.05] [html.fabrica-claro_&]:bg-black/[0.05]" style={{ left: xIni, width: xFim - xIni, top: 0, height: 38 }} />
      {voz && clipes.length ? clipes.map((c) => {
        const x0 = xDe(pos, c.ini), x1 = Math.max(x0 + 8, xDe(pos, Math.min(total, fimClipe(c))));
        const s = sel?.tipo === "voz" && sel.id === c.id;
        return (
          <div key={c.id} data-clipe-voz={c.id} role="button" aria-label={`Voz ${durClipe(c).toFixed(1)} s`}
            onPointerDown={(e) => comecar(e, c, "mover")} onPointerMove={mover} onPointerUp={soltar} onPointerCancel={() => { arraste.current = null; }}
            className="absolute cursor-grab touch-none overflow-hidden rounded-md active:cursor-grabbing"
            style={{ left: x0, width: x1 - x0, top: 2, height: 34, background: s ? "#8B5CF6" : "rgba(139,92,246,.55)", outline: s ? "2px solid #F5F906" : "none", outlineOffset: 1 }}>
            <Ondas ondas={ondas} de={c.de} ate={c.ate} dur={voz.dur} w={x1 - x0} h={34} cor="rgba(255,255,255,.85)" />
            {c.vel !== 1 && <span className="pointer-events-none absolute right-1 top-0.5 rounded bg-black/55 px-1 text-[9px] font-black text-white">{c.vel}x</span>}
            {s && <>
              <span data-borda-esq onPointerDown={(e) => comecar(e, c, "esq")} onPointerMove={mover} onPointerUp={soltar} className="absolute inset-y-0 left-0 w-3 cursor-ew-resize touch-none" style={{ background: "#F5F906" }} />
              <span data-borda-dir onPointerDown={(e) => comecar(e, c, "dir")} onPointerMove={mover} onPointerUp={soltar} className="absolute inset-y-0 right-0 w-3 cursor-ew-resize touch-none" style={{ background: "#F5F906" }} />
            </>}
          </div>
        );
      }) : (
        <button type="button" data-faixa-adicionar-voz onClick={aoAdicionarVoz} className="absolute rounded-md border border-dashed border-white/25 text-[11px] font-bold text-white/60 [html.fabrica-claro_&]:border-black/25 [html.fabrica-claro_&]:text-black/55" style={{ left: xIni, width: xFim - xIni, top: 2, height: 34 }}>+ Voz</button>
      )}
      {cursor != null && sel?.tipo === "voz" && <span data-cursor-audio className="pointer-events-none absolute z-10 w-0.5 rounded bg-white shadow [html.fabrica-claro_&]:bg-black" style={{ left: xDe(pos, cursor) - 1, top: -2, height: 42 }} />}

      {/* Música */}
      <span className={rot} style={{ top: 42, height: 30, width: xIni }}>Música</span>
      {musica ? (
        <button type="button" data-faixa-musica onClick={() => { setSel({ tipo: "musica" }); setCursor(null); }}
          className="absolute flex items-center gap-2 overflow-hidden rounded-md px-2 text-left text-[11px] font-bold text-white"
          style={{ left: xIni, width: xFim - xIni, top: 42, height: 30, background: sel?.tipo === "musica" ? "#0E9F6E" : "rgba(14,159,110,.55)", outline: sel?.tipo === "musica" ? "2px solid #F5F906" : "none", outlineOffset: 1 }}>
          <span className="truncate">{musica.nome}</span>
          <span className="ml-auto shrink-0 rounded bg-black/40 px-1 text-[10px] tabular-nums">{Math.round(volMusica * 100)}%{clipes.length && voz ? " · 15% na voz" : ""}</span>
        </button>
      ) : (
        <button type="button" data-faixa-adicionar-musica onClick={aoAdicionarMusica} className="absolute rounded-md border border-dashed border-white/25 text-[11px] font-bold text-white/60 [html.fabrica-claro_&]:border-black/25 [html.fabrica-claro_&]:text-black/55" style={{ left: xIni, width: xFim - xIni, top: 42, height: 30 }}>+ Música</button>
      )}
    </div>
  );
}

/** Barra de opções do áudio escolhido (fica acima das cenas, no lugar das opções da cena). */
export function OpcoesAudio({ sel, clipes, mudarClipes, cursor, volMusica, mudarVolMusica, aoTrocarMusica, aoTirarMusica, aoFechar }: {
  sel: SelAudio; clipes: ClipeVoz[]; mudarClipes: (c: ClipeVoz[]) => void; cursor: number | null;
  volMusica: number; mudarVolMusica: (v: number) => void; aoTrocarMusica: () => void; aoTirarMusica: () => void; aoFechar: () => void;
}) {
  if (!sel) return null;
  const pilula = "flex min-h-9 shrink-0 items-center gap-1.5 rounded-full px-3 text-[12px] font-bold hover:bg-white/[0.08] [html.fabrica-claro_&]:hover:bg-black/[0.06]";
  const barra = "mx-auto flex max-w-full flex-wrap items-center justify-center gap-x-1 gap-y-0.5 rounded-2xl sm:flex-nowrap sm:overflow-x-auto border border-white/10 bg-[#1c1c1f] px-2 py-1 text-white shadow-xl [scrollbar-width:none] [html.fabrica-claro_&]:border-black/10 [html.fabrica-claro_&]:bg-white [html.fabrica-claro_&]:text-black";
  const deslizar = (valor: number, min: number, max: number, passo: number, mudar: (v: number) => void, rotulo: string, dado: string) => (
    <label className="flex shrink-0 items-center gap-2 px-2 text-[12px] font-bold">
      {rotulo}
      <input type="range" data-controle={dado} min={min} max={max} step={passo} value={valor} onChange={(e) => mudar(Number(e.target.value))} className="w-24 accent-[#F5F906]" />
      <span className="w-9 tabular-nums">{Math.round(valor * 100)}%</span>
    </label>
  );
  if (sel.tipo === "musica") {
    return (
      <div data-opcoes-audio="musica" className={barra}>
        <span className="shrink-0 whitespace-nowrap px-2 text-[12px] font-black">Música</span>
        {deslizar(volMusica, 0, VOL_MAX, 0.05, mudarVolMusica, "Volume", "volume-musica")}
        <button type="button" data-trocar-musica onClick={aoTrocarMusica} className={pilula}>Trocar</button>
        <button type="button" data-tirar-musica onClick={aoTirarMusica} className={pilula}>Tirar</button>
        <button type="button" onClick={aoFechar} className={pilula}>Pronto</button>
      </div>
    );
  }
  const c = clipes.find((x) => x.id === sel.id);
  if (!c) return null;
  const mudar = (p: Partial<ClipeVoz>) => mudarClipes(clipes.map((x) => (x.id === c.id ? { ...x, ...p } : x)));
  const podeDividir = cursor != null && cursor - c.ini >= MIN_CLIPE && fimClipe(c) - cursor >= MIN_CLIPE;
  return (
    <div data-opcoes-audio="voz" className={barra}>
      <span className="shrink-0 whitespace-nowrap px-2 text-[12px] font-black">Voz · {durClipe(c).toFixed(1)} s</span>
      <button type="button" data-dividir-voz disabled={!podeDividir} onClick={() => cursor != null && mudarClipes(dividirClipe(clipes, c.id, cursor))} className={`${pilula} disabled:opacity-40`} title="Toque na voz no ponto do corte">Dividir</button>
      {deslizar(c.vol, 0, VOL_MAX, 0.05, (v) => mudar({ vol: v }), "Volume", "volume-voz")}
      <span className="flex shrink-0 items-center gap-0.5 px-1">
        {[0.75, 1, 1.25, 1.5].filter((v) => v >= VEL_MIN && v <= VEL_MAX).map((v) => (
          <button key={v} type="button" data-velocidade-voz={v} onClick={() => mudar({ vel: v })}
            className={`min-h-8 rounded-full px-2.5 text-[12px] font-black ${c.vel === v ? "bg-[#F5F906] text-black" : "hover:bg-white/[0.08]"}`}>{v}x</button>
        ))}
      </span>
      <button type="button" data-apagar-voz onClick={() => mudarClipes(clipes.filter((x) => x.id !== c.id))} className={pilula}>Apagar</button>
      <button type="button" onClick={aoFechar} className={pilula}>Pronto</button>
    </div>
  );
}
