// Painel "Narração" do editor de vídeo, com duas abas:
//  • Voz de IA: vozes grátis do Piper geradas no próprio aparelho (português, espanhol, inglês).
//  • Sua voz: gravar lendo o texto num teleprompter (janela no meio da tela, vídeo atrás) ou enviar um áudio pronto.
// O texto já vem feito das cenas; quem quiser outro usa o Narrador de Ofertas e cola aqui.
// A voz fica só na memória e entra no vídeo inteiro, com a música abaixando.
// Textos curtos de propósito: o Lucas pediu "quanto menos palavras, melhor".
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AlertTriangle, Check, ClipboardPaste, Copy, Download, ExternalLink, Languages, Loader2, Mic, Pause, Play, RotateCcw, Sparkles, Square, Trash2, Upload, Wand2, X } from "lucide-react";
import type { Narracao } from "@/lib/narracao";
import { INICIO_VOZ, abrirMicrofone, podeGravar, prepararVoz, tempoDeLeitura, type Microfone, type VozGravada } from "@/lib/voz-gravada";
import { IDIOMAS_VIDEO, type IdiomaVideo } from "@/lib/traducao";
import { AMOSTRA, IDIOMAS_IA, VOZES_IA, gerarVozIA, vozIA, vozesBaixadas, type IdiomaIA, type Progresso } from "@/lib/voz-ia";

const seg = (s: number) => Math.round(s) + " s";
const relogio = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
const botao = "flex min-h-10 items-center justify-center gap-1.5 rounded-full px-3.5 text-[13px] font-bold";

type Props = {
  n: Narracao; mudar: (p: Partial<Narracao>) => void;
  /** texto feito das cenas do vídeo */
  sugerido: string;
  /** segundos do vídeo */
  total: number;
  voz: VozGravada | null; aoVoz: (v: VozGravada | null) => void;
  /** deixa o vídeo com esta duração (as cenas crescem na mesma proporção) */
  esticar: (dur: number) => void;
  agencia: string; linkNarrador: string;
  /** traduz os textos de todas as cenas (e a fala, se pedir) */
  traduzir: (para: IdiomaVideo, comFala: boolean, aoAvancar?: (p: number) => void) => Promise<void>;
};

export function PainelNarracao({ n, mudar, sugerido, total, voz, aoVoz, esticar, agencia, linkNarrador, traduzir }: Props) {
  const texto = n.roteiro ?? sugerido;
  const leitura = tempoDeLeitura(texto);
  const cabe = Math.max(1, total - INICIO_VOZ - 0.2);
  const aba = n.aba ?? "ia";
  const escolhida = vozIA(n.vozIA);
  const [idioma, setIdioma] = useState<IdiomaIA>(escolhida.idioma);
  const [baixadas, setBaixadas] = useState<Set<string>>(new Set());
  const [gerando, setGerando] = useState<{ id: string; amostra: boolean; p: Progresso } | null>(null);
  const [aviso, setAviso] = useState("");
  const [copiado, setCopiado] = useState(false);
  const [gravando, setGravando] = useState<null | "video" | "teste">(null);
  const [ouvindo, setOuvindo] = useState(false);
  const [teste, setTeste] = useState<VozGravada | null>(null);
  const [lendo, setLendo] = useState(false);
  const [traduzindo, setTraduzindo] = useState<{ para: IdiomaVideo; pct: number } | null>(null);
  const [traduzFala, setTraduzFala] = useState(true);
  const [traduzido, setTraduzido] = useState<IdiomaVideo | null>(null);
  const som = useRef<HTMLAudioElement | null>(null);
  const arquivo = useRef<HTMLInputElement>(null);
  useEffect(() => () => { som.current?.pause(); }, []);
  useEffect(() => { void vozesBaixadas().then(setBaixadas); }, []);

  const pararSom = () => { som.current?.pause(); setOuvindo(false); };
  const ouvir = (v: VozGravada) => {
    if (ouvindo) { pararSom(); return; }
    const a = new Audio(v.url);
    a.onended = () => setOuvindo(false);
    som.current = a;
    setOuvindo(true);
    void a.play().catch(() => setOuvindo(false));
  };

  // ——— voz de IA ———
  const gerarIA = async (id: string, amostra: boolean) => {
    if (gerando) return;
    setAviso(""); pararSom();
    setGerando({ id, amostra, p: { fase: "gerando", pct: 0 } });
    try {
      const v = await gerarVozIA(amostra ? AMOSTRA[vozIA(id).idioma] : texto, id, (p) => setGerando({ id, amostra, p }));
      setBaixadas((b) => new Set(b).add(id));
      if (amostra) { const a = new Audio(v.url); som.current = a; void a.play().catch(() => undefined); }
      else aoVoz(v);
    } catch (e) { setAviso((e as Error).message); }
    setGerando(null);
  };
  const progressoTexto = (p: Progresso) => (p.fase === "baixando" ? `Baixando a voz ${Math.round(p.pct * 100)}%` : "Criando a voz…");

  // ——— sua voz ———
  const fimDaGravacao = async (blob: Blob, modo: "video" | "teste") => {
    setGravando(null);
    if (!blob.size) { setAviso("A gravação veio vazia. Confira o microfone e grave de novo."); return; }
    setLendo(true);
    try {
      const v = await prepararVoz(blob, "gravada");
      if (modo === "teste") { setTeste(v); som.current?.pause(); const a = new Audio(v.url); som.current = a; void a.play().catch(() => undefined); }
      else { aoVoz(v); setTeste(null); }
    } catch (e) { setAviso((e as Error).message); }
    setLendo(false);
  };
  const enviar = async (f: File | undefined) => {
    setAviso("");
    if (!f) return;
    if (f.size > 30 * 1024 * 1024) { setAviso("Áudio grande demais (máximo 30 MB)."); return; }
    setLendo(true);
    try { aoVoz(await prepararVoz(f, "enviada")); } catch (e) { setAviso((e as Error).message); }
    setLendo(false);
  };
  const gravar = (modo: "video" | "teste") => { setAviso(""); pararSom(); setGravando(modo); };

  // ——— tradução ———
  const traduzirPara = async (para: IdiomaVideo) => {
    if (traduzindo) return;
    setAviso(""); setTraduzido(null);
    setTraduzindo({ para, pct: 0 });
    try {
      await traduzir(para, traduzFala, (pct) => setTraduzindo({ para, pct }));
      setTraduzido(para);
      setTimeout(() => setTraduzido((t) => (t === para ? null : t)), 9000);
      if (traduzFala) setIdioma(para);
    } catch (e) { setAviso((e as Error).message || "Não consegui traduzir agora. Tente de novo."); }
    setTraduzindo(null);
  };
  const nomeIdioma = (id: IdiomaVideo) => IDIOMAS_VIDEO.find((i) => i.id === id)?.nome || id;

  // ——— texto ———
  const colar = async () => {
    try {
      const t = (await navigator.clipboard.readText()).trim();
      if (t) { mudar({ roteiro: t.slice(0, 1500) }); setAviso(""); } else setAviso("Nada copiado ainda.");
    } catch { setAviso("Toque e segure no campo de texto e escolha Colar."); }
  };
  const exemplo = `Pacote Rio de Janeiro, 2 pessoas, 4 noites, R$ [valor]. Agência ${agencia.trim() || "[sua agência]"}. Vídeo de ${Math.round(total)} segundos.`;
  const copiarExemplo = async () => {
    try { await navigator.clipboard.writeText(exemplo); setCopiado(true); setTimeout(() => setCopiado(false), 2000); } catch { setAviso("Toque e segure no exemplo para copiar."); }
  };

  const passou = voz ? voz.dur + INICIO_VOZ > total + 0.1 : false;
  const durCerta = voz ? Math.ceil(voz.dur + INICIO_VOZ + 0.6) : total;
  const longo = leitura > cabe;

  const caixaTexto = (
    <section>
      <div className="mb-1.5 flex items-center justify-between gap-2">
        <label htmlFor="narr-texto" className="text-[14px] font-black">Seu texto</label>
        <div className="flex gap-1">
          <button type="button" data-colar-texto onClick={colar} className={`${botao} narr-destaque min-h-9 px-2.5`}><ClipboardPaste className="h-4 w-4" />Colar</button>
          {n.roteiro != null && <button type="button" data-texto-do-video onClick={() => mudar({ roteiro: undefined })} className={`${botao} min-h-9 px-2.5 text-white/60`}><RotateCcw className="h-4 w-4" />Original</button>}
        </div>
      </div>
      <textarea id="narr-texto" data-texto-narracao value={texto} rows={5} maxLength={1500} onChange={(e) => mudar({ roteiro: e.target.value })} placeholder="Escreva ou cole o que vai ser falado."
        className="w-full resize-none rounded-xl border border-white/10 bg-black/30 px-3 py-2.5 text-[15px] leading-relaxed text-white outline-none focus:border-[#F5F906]" />
      <div data-tempo-leitura className="mt-1.5 flex flex-wrap items-center gap-1.5 text-[12px] font-bold">
        <span className={`rounded-full px-2.5 py-1 ${longo ? "narr-alerta" : "narr-chip"}`}>Fala {seg(leitura)}</span>
        <span className="narr-chip rounded-full px-2.5 py-1">Vídeo {seg(total)}</span>
        {longo && <span className="narr-destaque">Texto longo: corte um pouco</span>}
      </div>
    </section>
  );

  return (
    <div data-painel-narracao className="flex flex-col gap-4">
      <div data-abas-narracao className="grid grid-cols-2 gap-1 rounded-xl bg-white/[0.06] p-1">
        {(["ia", "propria"] as const).map((q) => (
          <button key={q} type="button" data-aba-narracao={q} onClick={() => { setAviso(""); mudar({ aba: q }); }} className={`flex min-h-9 items-center justify-center gap-1.5 rounded-lg text-[13px] font-bold ${aba === q ? "bg-white/[0.14] text-white" : "text-white/60"}`}>
            {q === "ia" ? <><Wand2 className="h-4 w-4" />Voz de IA</> : <><Mic className="h-4 w-4" />Sua voz</>}
          </button>
        ))}
      </div>

      {aviso && (
        <p data-aviso-narracao className="narr-alerta flex items-start gap-2 rounded-xl p-3 text-[13px] font-semibold">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" /><span className="flex-1">{aviso}</span>
          <button type="button" aria-label="Fechar aviso" onClick={() => setAviso("")}><X className="h-4 w-4" /></button>
        </p>
      )}

      {voz && (
        <section data-voz-no-video className="narr-ok rounded-2xl p-3">
          <p className="flex items-center gap-1.5 text-[15px] font-black"><Check className="h-5 w-5" />Voz no vídeo · {seg(voz.dur)}</p>
          <div className="mt-2.5 flex flex-wrap gap-1.5">
            <button type="button" data-ouvir-voz onClick={() => ouvir(voz)} className={`${botao} border border-white/20`}>{ouvindo ? <><Pause className="h-4 w-4" />Parar</> : <><Play className="h-4 w-4" />Ouvir</>}</button>
            <button type="button" data-tirar-voz onClick={() => { pararSom(); aoVoz(null); }} className={`${botao} text-white/60`}><Trash2 className="h-4 w-4" />Tirar</button>
          </div>
          {passou && (
            <button type="button" data-esticar-video onClick={() => esticar(durCerta)} className="mt-2.5 min-h-11 w-full rounded-full text-[14px] font-black text-black" style={{ background: "#F5F906" }}>
              Fala maior que o vídeo · Aumentar para {seg(durCerta)}
            </button>
          )}
        </section>
      )}

      {aba === "ia" ? (
        <>
          <div className="flex gap-1.5">
            {IDIOMAS_IA.map((l) => (
              <button key={l.id} type="button" data-idioma-ia={l.id} onClick={() => setIdioma(l.id)} className={`min-h-9 flex-1 rounded-full text-[13px] font-bold ${idioma === l.id ? "narr-chip-ativo" : "narr-chip"}`}>{l.nome}</button>
            ))}
          </div>
          <div data-vozes-ia className="grid grid-cols-2 gap-1.5">
            {VOZES_IA.filter((v) => v.idioma === idioma).map((v) => {
              const sel = escolhida.id === v.id;
              const ocupado = gerando?.id === v.id && gerando.amostra;
              return (
                <div key={v.id} data-voz-ia={v.id} className={`flex items-center gap-1 rounded-xl border p-1.5 pl-2.5 ${sel ? "narr-sel" : "border-white/10"}`}>
                  <button type="button" onClick={() => mudar({ vozIA: v.id })} className="min-w-0 flex-1 text-left">
                    <span className="block truncate text-[14px] font-black">{v.nome}</span>
                    <span className="block truncate text-[11px] font-semibold text-white/55">{v.genero === "F" ? "Mulher" : "Homem"} · {v.sotaque}</span>
                  </button>
                  <button type="button" data-amostra-ia={v.id} aria-label={`Ouvir ${v.nome}`} onClick={() => void gerarIA(v.id, true)} disabled={!!gerando} className="narr-destaque grid h-9 w-9 shrink-0 place-items-center rounded-full disabled:opacity-40">
                    {ocupado ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
                  </button>
                </div>
              );
            })}
          </div>
          {idioma === "pt" && <p className="-mt-2 text-[11px] font-semibold text-white/45">Em português só há vozes de homem.</p>}
          {gerando?.amostra && <p className="narr-destaque -mt-2 text-[12px] font-bold">{progressoTexto(gerando.p)}</p>}

          <button type="button" data-gerar-voz-ia onClick={() => void gerarIA(escolhida.id, false)} disabled={!!gerando || !texto.trim()}
            className="relative flex min-h-14 items-center justify-center overflow-hidden rounded-2xl text-[16px] font-black text-black disabled:opacity-60" style={{ background: "#F5F906" }}>
            {gerando && !gerando.amostra && <span className="absolute inset-y-0 left-0 bg-black/15 transition-[width]" style={{ width: `${Math.round(gerando.p.pct * 100)}%` }} />}
            <span className="relative flex items-center gap-2">
              {gerando && !gerando.amostra ? <><Loader2 className="h-5 w-5 animate-spin" />{progressoTexto(gerando.p)}</> : <><Wand2 className="h-5 w-5" />{voz?.origem === "ia" ? "Gerar de novo" : "Gerar voz"} · {escolhida.nome}</>}
            </span>
          </button>
          {!baixadas.has(escolhida.id) && !gerando && <p className="-mt-2 flex items-center justify-center gap-1 text-[11px] font-semibold text-white/45"><Download className="h-3.5 w-3.5" />1ª vez baixa a voz ({escolhida.mb} MB). Depois é na hora.</p>}
          {caixaTexto}
        </>
      ) : (
        <>
          <button type="button" data-gravar-voz onClick={() => gravar("video")} disabled={!podeGravar() || lendo}
            className="flex min-h-14 items-center justify-center gap-2.5 rounded-2xl text-[17px] font-black text-black disabled:opacity-50" style={{ background: "#F5F906" }}>
            <Mic className="h-6 w-6" />{lendo ? "Preparando…" : voz?.origem === "gravada" ? "Gravar de novo" : "Gravar voz"}
          </button>
          {!podeGravar() && <p className="narr-destaque text-[13px] font-bold">Este navegador não grava. Use o Chrome ou envie um áudio.</p>}
          <div data-dicas-gravar className="flex items-center justify-between gap-2">
            <p className="text-[12px] font-semibold text-white/60">Lugar silencioso, celular perto da boca.</p>
            <button type="button" data-teste-voz onClick={() => (teste ? ouvir(teste) : gravar("teste"))} disabled={!podeGravar() || lendo} className={`${botao} narr-contorno shrink-0 border disabled:opacity-40`}>
              {teste ? (ouvindo ? <><Pause className="h-4 w-4" />Parar</> : <><Play className="h-4 w-4" />Ouvir teste</>) : <><Mic className="h-4 w-4" />Teste 5 s</>}
            </button>
          </div>
          {caixaTexto}
          <button type="button" data-enviar-audio onClick={() => arquivo.current?.click()} disabled={lendo} className="flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-dashed border-white/25 text-[13px] font-bold disabled:opacity-50"><Upload className="h-4 w-4" />Enviar áudio pronto</button>
          <input ref={arquivo} data-arquivo-audio type="file" accept="audio/*,.mp3,.m4a,.aac,.wav,.ogg,.opus" className="hidden" onChange={(e) => { void enviar(e.target.files?.[0]); e.target.value = ""; }} />
        </>
      )}

      <section data-narrador-ofertas className="narr-cartao rounded-2xl p-3">
        <p className="flex items-center gap-1.5 text-[15px] font-black"><Sparkles className="narr-destaque h-4 w-4" />Quer um texto novo?</p>
        <p className="mt-1 text-[13px] text-white/70">Mande seu pacote ao Narrador. Cole o texto aqui.</p>
        <div className="mt-2 flex items-start gap-2 rounded-xl bg-black/30 p-2.5">
          <p data-exemplo-narrador className="flex-1 select-text text-[12px] leading-snug text-white/80">{exemplo}</p>
          <button type="button" data-copiar-exemplo onClick={copiarExemplo} aria-label="Copiar exemplo" className="narr-destaque shrink-0 p-1">{copiado ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}</button>
        </div>
        <a href={linkNarrador} target="_blank" rel="noopener noreferrer" data-abrir-narrador className="mt-2 flex min-h-11 items-center justify-center gap-1.5 rounded-full bg-white text-[14px] font-black text-black">
          <ExternalLink className="h-4 w-4" />Abrir Narrador
        </a>
      </section>

      <label className="flex min-h-11 items-center justify-between gap-3 rounded-xl border border-white/10 px-3">
        <span className="text-[14px] font-bold">Legenda na tela</span>
        <input type="checkbox" data-legendas checked={n.legendas} onChange={(e) => mudar({ legendas: e.target.checked })} className="h-5 w-5 accent-[#F5F906]" />
      </label>

      <section data-traduzir-video className="narr-cartao rounded-2xl p-3">
        <p className="flex items-center gap-1.5 text-[15px] font-black"><Languages className="narr-destaque h-4 w-4" />Traduzir vídeo</p>
        <p className="mt-1 text-[13px] text-white/70">Todos os textos das cenas mudam de idioma.</p>
        <div className="mt-2 grid grid-cols-2 gap-2">
          {IDIOMAS_VIDEO.map((i) => (
            <button key={i.id} type="button" data-traduzir-para={i.id} disabled={!!traduzindo} onClick={() => void traduzirPara(i.id)}
              className={`relative flex min-h-12 items-center justify-center gap-2 overflow-hidden rounded-xl text-[14px] font-black disabled:opacity-60 ${traduzido === i.id ? "narr-chip-ativo" : "narr-chip"}`}>
              {traduzindo?.para === i.id && <span className="absolute inset-y-0 left-0 bg-[#F5F906]/40" style={{ width: `${Math.max(8, traduzindo.pct * 100)}%` }} />}
              <Languages className="relative h-4 w-4" />
              <span className="relative">{traduzindo?.para === i.id ? "Traduzindo…" : i.nome}</span>
            </button>
          ))}
        </div>
        <label className="mt-2 flex min-h-10 items-center gap-2 text-[13px] font-bold">
          <input type="checkbox" data-traduzir-fala checked={traduzFala} onChange={(e) => setTraduzFala(e.target.checked)} className="h-5 w-5 accent-[#F5F906]" />
          Traduzir a fala também
        </label>
        {traduzido && (
          <p data-traduzido className="narr-ok mt-1 rounded-xl px-3 py-2 text-[13px] font-bold">
            Pronto: vídeo em {nomeIdioma(traduzido)}.{traduzFala ? " Agora toque em Gerar voz." : ""} Desfazer volta ao português.
          </p>
        )}
      </section>

      {gravando && (
        <Teleprompter texto={gravando === "teste" ? (texto.split(/(?<=[.!?])\s+/).slice(0, 2).join(" ") || texto) : texto}
          limite={gravando === "teste" ? 5 : cabe} leitura={gravando === "teste" ? 5 : Math.max(leitura, 3)} teste={gravando === "teste"}
          aoFechar={() => setGravando(null)} aoFim={(b) => void fimDaGravacao(b, gravando)} />
      )}
    </div>
  );
}

/** Janela no meio da tela (o vídeo continua atrás): abre o microfone, conta 3, 2, 1, grava e o texto sobe
 *  no ritmo da leitura. Para sozinho no fim do vídeo. Erro aparece aqui dentro, sem fechar sozinho. */
function Teleprompter({ texto, limite, leitura, teste, aoFim, aoFechar }: { texto: string; limite: number; leitura: number; teste: boolean; aoFim: (b: Blob) => void; aoFechar: () => void }) {
  const [conta, setConta] = useState(3);
  const [t, setT] = useState(0);
  const [nivel, setNivel] = useState(0);
  const [erro, setErro] = useState("");
  const [tentativa, setTentativa] = useState(0);
  const caixa = useRef<HTMLDivElement>(null);
  const mic = useRef<Microfone | null>(null);
  const acabou = useRef(false);

  const parar = async () => {
    const m = mic.current;
    if (acabou.current || !m) return;
    acabou.current = true;
    aoFim(await m.parar());
  };
  const cancelar = () => { acabou.current = true; mic.current?.fechar(); aoFechar(); };

  useEffect(() => {
    let vivo = true;
    let raf = 0, relog = 0;
    acabou.current = false;
    (async () => {
      let m: Microfone;
      try { m = await abrirMicrofone(); } catch (e) { if (vivo) setErro((e as Error).message); return; }
      if (!vivo) { m.fechar(); return; }
      mic.current = m;
      // contagem com a barrinha do microfone mexendo (mostra que está ouvindo)
      relog = window.setInterval(() => setNivel(m.nivel()), 60);
      for (let k = 3; k > 0; k--) { if (!vivo) return; setConta(k); await new Promise((r) => setTimeout(r, 800)); }
      clearInterval(relog);
      if (!vivo || acabou.current) return;
      m.gravar();
      setConta(0);
      const t0 = performance.now();
      const passo = () => {
        if (!vivo || acabou.current) return;
        const s = (performance.now() - t0) / 1000;
        setT(s);
        setNivel(m.nivel());
        // a linha amarela passa pelo texto no ritmo da leitura
        const c = caixa.current, p = c?.firstElementChild as HTMLElement | null;
        if (c && p) {
          const cs = getComputedStyle(p);
          const alturaTexto = p.offsetHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom);
          c.scrollTop = Math.min(1, s / leitura) * Math.max(0, alturaTexto - 30);
        }
        if (s >= limite) { void parar(); return; }
        raf = requestAnimationFrame(passo);
      };
      raf = requestAnimationFrame(passo);
    })();
    return () => { vivo = false; cancelAnimationFrame(raf); clearInterval(relog); if (!acabou.current) mic.current?.fechar(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tentativa]);
  const tentarDeNovo = () => { setErro(""); setConta(3); setT(0); setNivel(0); setTentativa((k) => k + 1); };
  const [tituloErro, ...passosErro] = erro.split("\n");

  // cores fixas (style): sempre fundo escuro e letra branca, também no tema claro do editor
  const BR = "#ffffff", APAGADO = "rgba(255,255,255,0.55)", LINHA = "rgba(255,255,255,0.12)";
  return createPortal(
    <div data-teleprompter className="fixed inset-0 z-[200] flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.45)" }} role="dialog" aria-label={teste ? "Teste de voz" : "Gravando a narração"}>
      <div className="flex h-[52vh] max-h-[520px] min-h-[300px] w-full max-w-[520px] flex-col overflow-hidden rounded-3xl shadow-2xl" style={{ background: "rgba(12,12,13,0.94)", color: BR, border: `1px solid ${LINHA}` }}>
        <div className="flex items-center gap-2.5 px-4 pb-2 pt-3">
          <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${conta === 0 && !erro ? "animate-pulse" : ""}`} style={{ background: conta === 0 && !erro ? "#ef4444" : "rgba(255,255,255,0.3)" }} />
          <span className="flex-1 text-[13px] font-black" style={{ color: BR }}>{erro ? "Microfone" : conta > 0 ? "Prepare-se" : teste ? "Teste" : "Gravando"}</span>
          {!erro && <span data-tempo-gravacao className="text-[14px] font-black tabular-nums" style={{ color: BR }}>{relogio(t)}<span style={{ color: APAGADO }}> / {relogio(limite)}</span></span>}
        </div>
        {!erro && <div className="mx-4 h-1 overflow-hidden rounded-full" style={{ background: LINHA }}><div className="h-full transition-[width] duration-75" style={{ width: `${Math.round(nivel * 100)}%`, background: "#F5F906" }} /></div>}

        <div className="relative min-h-0 flex-1">
          {erro ? (
            <div data-erro-microfone className="flex h-full flex-col items-center justify-center gap-3 px-6 text-center">
              <AlertTriangle className="h-8 w-8" style={{ color: "#F5F906" }} />
              <p className="text-[17px] font-black leading-snug" style={{ color: BR }}>{tituloErro}</p>
              {passosErro.length > 0 && (
                <ol className="space-y-1.5 text-left text-[14px] font-semibold leading-snug" style={{ color: APAGADO }}>
                  {passosErro.map((p) => <li key={p}>{p}</li>)}
                </ol>
              )}
            </div>
          ) : (
            <>
              <div ref={caixa} className="h-full overflow-hidden px-5 sm:px-8">
                <p className="whitespace-pre-wrap pb-[40vh] pt-[9vh] text-[20px] font-bold leading-[1.5] sm:text-[23px]" style={{ color: BR }}>{texto || "Escreva o texto antes de gravar."}</p>
              </div>
              <div className="pointer-events-none absolute inset-x-0 top-0 h-[9vh]" style={{ background: "linear-gradient(to bottom, rgba(12,12,13,1) 0%, rgba(12,12,13,0.75) 60%, rgba(12,12,13,0.35) 100%)" }} />
              <div className="pointer-events-none absolute inset-x-3 top-[9vh] h-0.5 rounded-full" style={{ background: "#F5F906" }} />
              {conta > 0 && <div data-contagem className="absolute inset-0 grid place-items-center text-[72px] font-black" style={{ background: "rgba(12,12,13,0.75)", color: "#F5F906" }}>{conta}</div>}
            </>
          )}
        </div>

        <div className="flex gap-2 p-3" style={{ borderTop: `1px solid ${LINHA}` }}>
          <button type="button" data-cancelar-gravacao onClick={cancelar} className="min-h-12 rounded-full px-5 text-[14px] font-bold" style={{ border: "1px solid rgba(255,255,255,0.25)", color: BR, background: "transparent" }}>{erro ? "Fechar" : "Cancelar"}</button>
          {erro && (
            <button type="button" data-tentar-microfone onClick={tentarDeNovo} className="flex min-h-12 flex-1 items-center justify-center gap-2 rounded-full text-[15px] font-black" style={{ background: "#F5F906", color: "#111" }}>
              <RotateCcw className="h-4 w-4" />Tentar de novo
            </button>
          )}
          {!erro && (
            <button type="button" data-parar-gravacao onClick={() => void parar()} disabled={conta > 0} className="flex min-h-12 flex-1 items-center justify-center gap-2 rounded-full text-[15px] font-black disabled:opacity-40" style={{ background: "#ef4444", color: BR }}>
              <Square className="h-4 w-4 fill-current" />Parar e usar
            </button>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}
