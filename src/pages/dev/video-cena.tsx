// Ajustes de cada cena do vídeo pronto (sem linha do tempo): tempo da cena, transição, vídeo de fundo,
// trecho do vídeo, velocidade, enquadramento e a animação do texto (como o "Animar" do Canva).
// Fica em Pronto.ajustes (por cena) e Pronto.todas (o padrão do vídeo inteiro).
import { useRef } from "react";
import { Clock, Crop, Film, Gauge, Layers, Scissors, Sparkles, Upload } from "lucide-react";

const W = 720;
const H = 1280;

export type Transicao = "fundir" | "corte" | "deslizar" | "zoom" | "escuro";
export type Animacao = "padrao" | "aparecer" | "subir" | "descer" | "deslocar" | "zoom" | "teclado" | "pulsar" | "nenhuma";
export type ModoAnim = "ambos" | "entrando" | "saindo";
export type VelAnim = "lenta" | "normal" | "rapida";

export type AjusteCena = {
  /** segundos que a cena fica na tela */
  dur?: number;
  /** como a cena entra (a anterior sai do mesmo jeito) */
  transicao?: Transicao;
  /** 0,5 = câmera lenta; 2 = o dobro da velocidade */
  velocidade?: number;
  /** de que segundo do vídeo de fundo a cena começa ("os últimos 3 s de um vídeo de 10 s" = 7) */
  inicio?: number;
  /** enquadramento: 1 = vídeo inteiro; 2 = o dobro de perto */
  zoom?: number;
  /** posição do enquadramento, de -1 a 1 */
  px?: number;
  py?: number;
  /** vídeo de fundo trocado (da casa ou enviado pelo cliente) */
  clipe?: string;
  clipeNome?: string;
  /** animação do texto */
  anim?: Animacao;
  animModo?: ModoAnim;
  animVel?: VelAnim;
  /** o texto aparece depois de X segundos da cena */
  atraso?: number;
};

export const TRANSICOES: { id: Transicao; nome: string }[] = [
  { id: "fundir", nome: "Fundir" }, { id: "corte", nome: "Corte seco" }, { id: "deslizar", nome: "Deslizar" },
  { id: "zoom", nome: "Zoom" }, { id: "escuro", nome: "Pelo preto" },
];
export const ANIMACOES: { id: Animacao; nome: string }[] = [
  { id: "padrao", nome: "Do modelo" }, { id: "aparecer", nome: "Aparecer" }, { id: "subir", nome: "Subir" }, { id: "descer", nome: "Descer" },
  { id: "deslocar", nome: "Deslocar" }, { id: "zoom", nome: "Zoom" }, { id: "teclado", nome: "Teclado" }, { id: "pulsar", nome: "Pulsar" }, { id: "nenhuma", nome: "Sem animação" },
];
export const VELOCIDADES = [0.5, 0.75, 1, 1.5, 2];
const DUR_ANIM: Record<VelAnim, number> = { lenta: 1, normal: 0.6, rapida: 0.32 };

type ComAjustes = { ajustes?: Record<string, AjusteCena>; todas?: AjusteCena };
/** O ajuste valendo na cena: o do vídeo inteiro, e por cima o da própria cena. */
export function ajusteDe(p: ComAjustes | undefined, chave: string | undefined): AjusteCena {
  if (!p) return {};
  return { ...(p.todas || {}), ...((chave && p.ajustes?.[chave]) || {}) };
}
/** Chave estável da cena ("item-2"), para o ajuste não mudar de cena quando o texto muda. */
export const chaveCena = (parte: string, n = 0) => `${parte}-${n}`;
/** Resumo do que mexe na linha do tempo e nos fundos (para recarregar só quando precisa). */
export function assinaturaAjustes(p: ComAjustes | undefined) {
  if (!p) return "";
  const um = (a?: AjusteCena) => (a ? `${a.dur ?? ""}/${a.clipe ?? ""}` : "");
  return um(p.todas) + "|" + Object.entries(p.ajustes || {}).map(([k, a]) => k + ":" + um(a)).join(",");
}

/** Só os vídeos trocados (mudou: recarrega os fundos). */
export function assinaturaClipes(p: ComAjustes | undefined) {
  if (!p) return "";
  return (p.todas?.clipe || "") + "|" + Object.entries(p.ajustes || {}).filter(([, a]) => a.clipe).map(([k, a]) => k + ":" + a.clipe).join(",");
}
/** Os fundos de um vídeo pronto com os vídeos que o cliente trocou em cada cena. */
export function comClipesTrocados<T extends { tipo: "video" | "foto"; url: string; nome?: string }>(lista: T[], chaves: (string | undefined)[], p: ComAjustes | undefined): T[] {
  return lista.map((m, i) => {
    const a = ajusteDe(p, chaves[i]);
    return a.clipe ? ({ ...m, tipo: "video", url: a.clipe, nome: a.clipeNome || m.nome } as T) : m;
  });
}

/** Em que segundo do vídeo de fundo está a cena, depois de `local` segundos (trecho + velocidade). */
export const tempoNoClipe = (a: AjusteCena, local: number) => (a.inicio || 0) + Math.max(0, local) * (a.velocidade || 1);

const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
const ease = (t: number) => 1 - Math.pow(1 - clamp01(t), 3);

/** Como desenhar o fundo de uma cena que está entrando: `local` vai de -fade até a duração. */
export function entradaFundo(a: AjusteCena, local: number, fade: number, primeira: boolean) {
  const e = primeira ? 1 : ease((local + fade) / fade);
  const t = a.transicao || "fundir";
  if (t === "corte") return { mostra: primeira || local >= 0, alpha: 1, dx: 0, escala: 1 };
  if (t === "escuro") return { mostra: primeira || local >= 0, alpha: 1, dx: 0, escala: 1 };
  if (t === "deslizar") return { mostra: true, alpha: 1, dx: primeira ? 0 : (1 - e) * W, escala: 1 };
  if (t === "zoom") return { mostra: true, alpha: e, dx: 0, escala: primeira ? 1 : 1 + (1 - e) * 0.35 };
  return { mostra: true, alpha: e, dx: 0, escala: 1 };
}
/** Véu preto da transição "pelo preto" (mais escuro no ponto da troca). */
export function veuEscuro(a: AjusteCena, local: number, fade: number) {
  if ((a.transicao || "fundir") !== "escuro" || Math.abs(local) > fade) return 0;
  return 1 - Math.abs(local) / fade;
}
/** Enquadramento escolhido: deslocamento em pixels para o zoom total da cena. */
export function enquadrar(a: AjusteCena, zoomTotal: number, alt = H) {
  const folga = Math.max(0, zoomTotal - 1);
  return { x: -(a.px || 0) * folga * (W / 2), y: -(a.py || 0) * folga * (alt / 2) };
}

/**
 * Desenha o texto da cena com a animação escolhida. `desenhar(lt, out)` é o desenho do modelo.
 * Sem animação escolhida ("Do modelo"), só aplica o atraso.
 */
export function comAnimacao(ctx: CanvasRenderingContext2D, a: AjusteCena, lt: number, out: number, desenhar: (lt: number, out: number) => void) {
  const t = lt - (a.atraso || 0);
  if (t < 0) return;
  const anim = a.anim || "padrao";
  if (anim === "padrao") return desenhar(t, out);
  if (anim === "nenhuma") return desenhar(99, 1);
  const modo = a.animModo || "ambos";
  const dur = DUR_ANIM[a.animVel || "normal"];
  const ent = modo === "saindo" ? 1 : ease(t / dur);
  const sai = modo === "entrando" ? 1 : clamp01(out);
  ctx.save();
  ctx.globalAlpha *= Math.min(ent, sai);
  if (anim === "subir") ctx.translate(0, (1 - ent) * 140 - (1 - sai) * 140);
  else if (anim === "descer") ctx.translate(0, -(1 - ent) * 140 + (1 - sai) * 140);
  else if (anim === "deslocar") ctx.translate(-(1 - ent) * W * 0.55 + (1 - sai) * W * 0.55, 0);
  else if (anim === "zoom") {
    const s = 0.55 + 0.45 * ent + (1 - sai) * 0.25;
    ctx.translate(W / 2, H / 2);
    ctx.scale(s, s);
    ctx.translate(-W / 2, -H / 2);
  } else if (anim === "pulsar") {
    const s = 1 + 0.035 * Math.sin(t * 5);
    ctx.translate(W / 2, H / 2);
    ctx.scale(s, s);
    ctx.translate(-W / 2, -H / 2);
  } else if (anim === "teclado") {
    // as letras vão surgindo da esquerda para a direita, como alguém digitando
    ctx.globalAlpha = 1;
    ctx.beginPath();
    ctx.rect(0, 0, W * Math.min(ent, sai), H);
    ctx.clip();
  }
  desenhar(99, 1);
  ctx.restore();
}

// ——————————————— Painéis do editor ———————————————
const chip = (on: boolean) =>
  "min-h-10 rounded-full border px-3 text-[13px] font-semibold " + (on ? "border-[#F5F906] bg-[#F5F906]/15 text-white" : "border-white/15 text-white/75 active:bg-white/10");
const titulo = "mb-1.5 flex items-center gap-1.5 text-[12px] font-bold uppercase tracking-wide text-white/55";
const fmt = (s: number) => s.toFixed(1).replace(".", ",") + " s";

export type ClipeDaCasa = { url: string; capa: string; nome: string };

/** Menu da direita: a cena escolhida (vídeo, trecho, velocidade, tempo, transição, enquadrar). */
export function PainelCena({
  nome, ajuste, durPadrao, durClipe, mudar, aplicarEmTodas, clipes, capaAtual, inteiro = false, semFundo = false,
}: {
  nome: string;
  /** sem a escolha do vídeo de fundo (no editor de artes ela fica no painel Vídeo) */
  semFundo?: boolean;
  /** editando o vídeo inteiro: sem troca de vídeo nem trecho (são de cada cena) */
  inteiro?: boolean;
  ajuste: AjusteCena;
  durPadrao: number;
  /** duração do vídeo de fundo desta cena (0 = ainda carregando) */
  durClipe: number;
  mudar: (p: Partial<AjusteCena>) => void;
  aplicarEmTodas: (campos: (keyof AjusteCena)[]) => void;
  clipes: ClipeDaCasa[];
  capaAtual?: string;
}) {
  const arquivo = useRef<HTMLInputElement>(null);
  const dur = ajuste.dur ?? durPadrao;
  const vel = ajuste.velocidade || 1;
  const usa = dur * vel; // segundos do vídeo de fundo que a cena consome
  const maxInicio = Math.max(0, (durClipe || 0) - usa);
  const inicio = Math.min(ajuste.inicio || 0, maxInicio);
  const zoom = ajuste.zoom || 1;
  const todas = (campos: (keyof AjusteCena)[]) => (
    <button type="button" onClick={() => aplicarEmTodas(campos)} className="mt-1.5 text-[12px] font-semibold text-[#F5F906] underline-offset-2 hover:underline">Usar em todas as cenas</button>
  );
  return (
    <div data-painel-cena className="flex flex-col gap-5">
      <p className="text-[15px] font-extrabold">{nome}</p>

      {!inteiro && (
        <>
      {!semFundo && <section>
        <p className={titulo}><Film className="h-3.5 w-3.5" />Vídeo de fundo</p>
        <div className="flex items-center gap-2">
          {capaAtual && <img src={capaAtual} alt="" className="h-14 w-10 shrink-0 rounded-md object-cover" />}
          <span className="min-w-0 flex-1 truncate text-[13px] text-white/70">{ajuste.clipeNome || "Vídeo do modelo"}</span>
          {ajuste.clipe && <button type="button" onClick={() => mudar({ clipe: undefined, clipeNome: undefined, inicio: 0 })} className="min-h-9 px-2 text-[12px] font-semibold text-white/60">Voltar</button>}
        </div>
        <div className="mt-2 grid grid-cols-5 gap-1.5">
          {clipes.map((c) => (
            <button key={c.url} type="button" data-clipe={c.url} aria-label={c.nome} title={c.nome} aria-pressed={ajuste.clipe === c.url} onClick={() => mudar({ clipe: c.url, clipeNome: c.nome, inicio: 0 })} className={"overflow-hidden rounded-lg border-2 " + (ajuste.clipe === c.url ? "border-[#F5F906]" : "border-transparent")}>
              <img src={c.capa} alt="" loading="lazy" className="aspect-[3/4] w-full object-cover" />
            </button>
          ))}
        </div>
        <button type="button" onClick={() => arquivo.current?.click()} className="mt-2 flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-dashed border-white/25 text-[13px] font-bold"><Upload className="h-4 w-4" />Enviar um vídeo seu</button>
        <input ref={arquivo} type="file" accept="video/mp4,video/quicktime,video/webm" className="hidden" onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) mudar({ clipe: URL.createObjectURL(f), clipeNome: f.name, inicio: 0 });
          e.target.value = "";
        }} />
      </section>}

      <section>
        <p className={titulo}><Scissors className="h-3.5 w-3.5" />Trecho do vídeo</p>
        {durClipe ? (
          <>
            <input type="range" aria-label="Começar o trecho em" min={0} max={Math.max(0.1, maxInicio)} step={0.1} value={inicio} disabled={maxInicio <= 0} onChange={(e) => mudar({ inicio: Number(e.target.value) })} className="w-full accent-[#F5F906]" />
            <div className="flex justify-between text-[12px] text-white/60"><span>Usa de {fmt(inicio)} a {fmt(Math.min(durClipe, inicio + usa))}</span><span>vídeo de {fmt(durClipe)}</span></div>
            <div className="mt-2 flex gap-1.5">
              <button type="button" onClick={() => mudar({ inicio: 0 })} className={chip(inicio <= 0.05)}>Começo</button>
              <button type="button" onClick={() => mudar({ inicio: Math.round((maxInicio / 2) * 10) / 10 })} className={chip(maxInicio > 0 && Math.abs(inicio - maxInicio / 2) < 0.1)}>Meio</button>
              <button type="button" onClick={() => mudar({ inicio: Math.floor(maxInicio * 10) / 10 })} className={chip(maxInicio > 0 && inicio >= maxInicio - 0.1)}>Final</button>
            </div>
            {maxInicio <= 0 && <p className="mt-1 text-[11px] text-white/45">A cena usa o vídeo inteiro. Diminua o tempo da cena ou a velocidade para escolher um trecho.</p>}
          </>
        ) : <p className="text-[12px] text-white/45">Carregando o vídeo…</p>}
      </section>

        </>
      )}
      {inteiro && <p className="-mt-3 text-[12px] text-white/55">O que você mudar aqui vale para todas as cenas. Para trocar o vídeo ou escolher o trecho, toque numa cena embaixo da prévia.</p>}

      <section>
        <p className={titulo}><Gauge className="h-3.5 w-3.5" />Velocidade do vídeo</p>
        <div className="flex flex-wrap gap-1.5">
          {VELOCIDADES.map((v) => <button key={v} type="button" data-velocidade={v} onClick={() => mudar({ velocidade: v })} className={chip(vel === v)}>{v === 1 ? "Normal" : String(v).replace(".", ",") + "x"}</button>)}
        </div>
        {todas(["velocidade"])}
      </section>

      <section>
        <p className={titulo}><Clock className="h-3.5 w-3.5" />Tempo da cena</p>
        <div className="flex items-center gap-3">
          <input type="range" aria-label="Tempo da cena em segundos" min={1.5} max={8} step={0.1} value={dur} onChange={(e) => mudar({ dur: Number(e.target.value) })} className="w-full accent-[#F5F906]" />
          <span data-tempo-cena className="w-14 shrink-0 text-right text-[14px] font-black tabular-nums">{fmt(dur)}</span>
        </div>
        <div className="flex items-center gap-3">
          {ajuste.dur != null && <button type="button" onClick={() => mudar({ dur: undefined })} className="text-[12px] font-semibold text-white/60">Voltar ao do modelo ({fmt(durPadrao)})</button>}
          {todas(["dur"])}
        </div>
      </section>

      <section>
        <p className={titulo}><Layers className="h-3.5 w-3.5" />Transição para esta cena</p>
        <div className="flex flex-wrap gap-1.5">
          {TRANSICOES.map((t) => <button key={t.id} type="button" data-transicao={t.id} onClick={() => mudar({ transicao: t.id })} className={chip((ajuste.transicao || "fundir") === t.id)}>{t.nome}</button>)}
        </div>
        {todas(["transicao"])}
      </section>

      <section>
        <p className={titulo}><Crop className="h-3.5 w-3.5" />Enquadrar</p>
        <label className="flex items-center gap-3 text-[12px] text-white/60">Aproximar
          <input type="range" aria-label="Aproximar o vídeo" min={1} max={2.5} step={0.05} value={zoom} onChange={(e) => mudar({ zoom: Number(e.target.value) })} className="w-full accent-[#F5F906]" />
        </label>
        <label className="mt-1 flex items-center gap-3 text-[12px] text-white/60">Para o lado
          <input type="range" aria-label="Mover para o lado" min={-1} max={1} step={0.05} value={ajuste.px || 0} disabled={zoom <= 1} onChange={(e) => mudar({ px: Number(e.target.value) })} className="w-full accent-[#F5F906]" />
        </label>
        <label className="mt-1 flex items-center gap-3 text-[12px] text-white/60">Para cima
          <input type="range" aria-label="Mover para cima ou para baixo" min={-1} max={1} step={0.05} value={ajuste.py || 0} disabled={zoom <= 1} onChange={(e) => mudar({ py: Number(e.target.value) })} className="w-full accent-[#F5F906]" />
        </label>
        {zoom > 1 && <button type="button" onClick={() => mudar({ zoom: 1, px: 0, py: 0 })} className="mt-1 text-[12px] font-semibold text-white/60">Mostrar o vídeo inteiro</button>}
      </section>
    </div>
  );
}

/** O "Animar" do texto da cena: sugestões, quando anima, velocidade e quando o texto aparece. */
export function PainelAnimar({ nome, ajuste, durCena, mudar, aplicarEmTodas }: { nome: string; ajuste: AjusteCena; durCena: number; mudar: (p: Partial<AjusteCena>) => void; aplicarEmTodas: (campos: (keyof AjusteCena)[]) => void }) {
  const anim = ajuste.anim || "padrao";
  const livre = anim !== "padrao" && anim !== "nenhuma";
  return (
    <div data-painel-animar className="flex flex-col gap-5">
      <p className="text-[15px] font-extrabold">Animar o texto · {nome}</p>
      <section>
        <p className={titulo}><Sparkles className="h-3.5 w-3.5" />Sugestões</p>
        <div className="grid grid-cols-3 gap-1.5">
          {ANIMACOES.map((a) => (
            <button key={a.id} type="button" data-animacao={a.id} onClick={() => mudar({ anim: a.id })} className={"flex min-h-16 flex-col items-center justify-center gap-1 rounded-xl border text-[12px] font-bold " + (anim === a.id ? "border-[#F5F906] bg-[#F5F906]/10" : "border-white/10 bg-white/[0.03]")}>
              <span className={"text-[17px] font-black " + (anim === a.id ? "text-[#F5F906]" : "text-white/80")}>Aa</span>{a.nome}
            </button>
          ))}
        </div>
      </section>
      {livre && (
        <>
          <section>
            <p className={titulo}>Quando anima</p>
            <div className="flex flex-wrap gap-1.5">
              {([["ambos", "Ambos"], ["entrando", "Entrando"], ["saindo", "Saindo"]] as [ModoAnim, string][]).map(([id, n]) => <button key={id} type="button" data-anim-modo={id} onClick={() => mudar({ animModo: id })} className={chip((ajuste.animModo || "ambos") === id)}>{n}</button>)}
            </div>
          </section>
          <section>
            <p className={titulo}>Velocidade da animação</p>
            <div className="flex flex-wrap gap-1.5">
              {([["lenta", "Lenta"], ["normal", "Normal"], ["rapida", "Rápida"]] as [VelAnim, string][]).map(([id, n]) => <button key={id} type="button" onClick={() => mudar({ animVel: id })} className={chip((ajuste.animVel || "normal") === id)}>{n}</button>)}
            </div>
          </section>
        </>
      )}
      <section>
        <p className={titulo}><Clock className="h-3.5 w-3.5" />O texto aparece</p>
        <div className="flex items-center gap-3">
          <input type="range" aria-label="Segundos até o texto aparecer" min={0} max={Math.max(0, Math.round((durCena - 1) * 10) / 10)} step={0.1} value={ajuste.atraso || 0} onChange={(e) => mudar({ atraso: Number(e.target.value) })} className="w-full accent-[#F5F906]" />
          <span className="w-24 shrink-0 text-right text-[13px] font-bold">{(ajuste.atraso || 0) > 0 ? "depois de " + fmt(ajuste.atraso || 0) : "logo no início"}</span>
        </div>
      </section>
      <button type="button" onClick={() => aplicarEmTodas(["anim", "animModo", "animVel"])} className="min-h-11 rounded-xl border border-white/15 text-[13px] font-bold">Usar esta animação em todas as cenas</button>
    </div>
  );
}
