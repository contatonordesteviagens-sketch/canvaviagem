// Painel "Narração" do editor de vídeo: liga a voz, escolhe uma das 8 vozes, velocidade e tom,
// mostra o roteiro de cada cena (feito do que aparece na tela, e a pessoa pode mudar) e o revisor.
import { useEffect, useRef, useState } from "react";
import { AlertTriangle, Check, Mic, Play, RefreshCw, Square, Wand2 } from "lucide-react";
import { TONS, VOZES, gerarVoz, ouvirNoAparelho, revisarNarracao, tempoDaFala, textoParaFala, vozDe, type Idioma, type Narracao, type Tom } from "@/lib/narracao";

const chip = (on: boolean) => `min-h-10 rounded-full border px-3.5 text-[13px] font-semibold ${on ? "border-[#F5F906] bg-[#F5F906] text-black" : "border-white/15 text-white/80"}`;
const rotulo = "mb-1.5 block text-[12px] font-bold text-white/60";
const seg = (s: number) => s.toFixed(1).replace(".", ",") + " s";
const AMOSTRA: Record<Idioma, string> = { "pt-BR": "Olá! Essa é a minha voz no seu vídeo de viagem.", "es-ES": "¡Hola! Esta es mi voz en tu vídeo de viaje." };

export function PainelNarracao({ n, mudar, falas, durs, mudarFala, mudarDur, refazerRoteiro, ajustarTodas }: {
  n: Narracao; mudar: (p: Partial<Narracao>) => void;
  falas: string[]; durs: number[]; mudarFala: (i: number, t: string) => void; mudarDur: (i: number, d: number) => void;
  refazerRoteiro: () => void; ajustarTodas: () => void;
}) {
  const v = vozDe(n.voz);
  const [ouvindo, setOuvindo] = useState<string | null>(null);
  const [aviso, setAviso] = useState("");
  const parar = useRef<() => void>(() => undefined);
  useEffect(() => () => parar.current(), []);
  const avisos = n.ligada ? revisarNarracao(falas, durs, n) : [];

  // ouve com a voz de verdade (servidor); se a voz ainda não estiver ligada, ouve com a voz do aparelho só para sentir o ritmo
  const ouvir = async (chave: string, texto: string, voz = n) => {
    parar.current();
    if (ouvindo === chave) { setOuvindo(null); return; }
    setOuvindo(chave); setAviso("");
    try {
      const mp3 = await gerarVoz(texto, voz);
      const url = URL.createObjectURL(new Blob([mp3], { type: "audio/mpeg" }));
      const a = new Audio(url);
      a.onended = () => setOuvindo((o) => (o === chave ? null : o));
      parar.current = () => { a.pause(); URL.revokeObjectURL(url); };
      await a.play();
    } catch (e) {
      setAviso(`${(e as Error).message} Tocando com a voz do aparelho, só para você ouvir o ritmo.`);
      parar.current = ouvirNoAparelho(texto, voz);
      const est = tempoDaFala(texto, vozDe(voz.voz).idioma, voz.vel, voz.tom);
      setTimeout(() => setOuvindo((o) => (o === chave ? null : o)), est * 1000 + 400);
    }
  };

  return (
    <div data-painel-narracao className="flex flex-col gap-5">
      <button type="button" data-ligar-narracao onClick={() => mudar({ ligada: !n.ligada })} className={`flex min-h-14 items-center gap-3 rounded-2xl border px-4 text-left ${n.ligada ? "border-[#F5F906] bg-[#F5F906]/10" : "border-white/15"}`}>
        <Mic className={`h-5 w-5 shrink-0 ${n.ligada ? "text-[#F5F906]" : "text-white/70"}`} />
        <span className="min-w-0 flex-1"><span className="block text-[15px] font-extrabold">{n.ligada ? "Narração ligada" : "Colocar narração"}</span><span className="block text-[12px] text-white/55">Uma voz fala o texto de cada cena, com legenda.</span></span>
        <span className={`h-6 w-11 shrink-0 rounded-full p-0.5 transition-colors ${n.ligada ? "bg-[#F5F906]" : "bg-white/20"}`}><span className={`block h-5 w-5 rounded-full bg-black transition-transform ${n.ligada ? "translate-x-5" : ""}`} /></span>
      </button>

      {n.ligada && (
        <>
          <section>
            <p className={rotulo}>Voz</p>
            {(["pt-BR", "es-ES"] as Idioma[]).map((l) => (
              <div key={l} className="mb-2">
                <p className="mb-1 text-[11px] font-bold uppercase tracking-wide text-white/40">{l === "pt-BR" ? "Português (Brasil)" : "Espanhol (Espanha)"}</p>
                <div className="grid grid-cols-2 gap-1.5">
                  {VOZES.filter((x) => x.idioma === l).map((x) => (
                    <div key={x.id} className={`flex items-center gap-1 rounded-xl border ${n.voz === x.id ? "border-[#F5F906] bg-[#F5F906]/10" : "border-white/10 bg-white/[0.03]"}`}>
                      <button type="button" data-voz={x.id} onClick={() => mudar({ voz: x.id })} className="min-h-14 min-w-0 flex-1 px-2.5 text-left">
                        <span className="flex items-center gap-1 text-[13px] font-extrabold">{n.voz === x.id && <Check className="h-3.5 w-3.5 shrink-0 text-[#F5F906]" />}{x.nome}</span>
                        <span className="block truncate text-[11px] text-white/50">{x.genero === "F" ? "Mulher" : "Homem"} · {x.jeito}</span>
                      </button>
                      <button type="button" aria-label={`Ouvir a voz ${x.nome}`} data-ouvir-voz={x.id} onClick={() => ouvir("amostra-" + x.id, AMOSTRA[x.idioma], { ...n, voz: x.id })} className="grid h-11 w-10 shrink-0 place-items-center text-white/70">
                        {ouvindo === "amostra-" + x.id ? <Square className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </section>

          <section>
            <p className={rotulo}>Velocidade da fala · {n.vel.toFixed(2).replace(".", ",")}x</p>
            <div className="flex items-center gap-3">
              <span className="text-[12px] text-white/50">Devagar</span>
              <input type="range" data-vel-fala aria-label="Velocidade da fala" min={0.8} max={1.4} step={0.05} value={n.vel} onChange={(e) => mudar({ vel: Number(e.target.value) })} className="w-full accent-[#F5F906]" />
              <span className="text-[12px] text-white/50">Rápido</span>
            </div>
          </section>

          <section>
            <p className={rotulo}>Jeito de falar</p>
            <div className="flex flex-wrap gap-1.5">
              {(Object.keys(TONS) as Tom[]).map((t) => <button key={t} type="button" data-tom={t} onClick={() => mudar({ tom: t })} className={chip(n.tom === t)}>{TONS[t].nome}</button>)}
            </div>
          </section>

          <label className="flex min-h-12 items-center justify-between gap-3 rounded-xl border border-white/10 px-3">
            <span className="text-[14px] font-bold">Legenda na tela<span className="block text-[11px] font-normal text-white/50">O que a voz fala aparece escrito embaixo.</span></span>
            <input type="checkbox" data-legendas checked={n.legendas} onChange={(e) => mudar({ legendas: e.target.checked })} className="h-5 w-5 accent-[#F5F906]" />
          </label>

          <section>
            <div className="mb-1.5 flex items-center justify-between gap-2">
              <p className="text-[12px] font-bold text-white/60">O que a voz fala em cada cena</p>
              <button type="button" data-refazer-roteiro onClick={refazerRoteiro} className="flex min-h-9 items-center gap-1 rounded-full px-2.5 text-[12px] font-bold text-white/70"><RefreshCw className="h-3.5 w-3.5" />Refazer do vídeo</button>
            </div>
            <div className="flex flex-col gap-2">
              {falas.map((f, i) => {
                const fala = tempoDaFala(f, v.idioma, n.vel, n.tom);
                const passou = fala > durs[i] - 0.45;
                // o que a voz vai ler de fato (números por extenso, siglas, palavras trocadas): mostra quando muda
                const lido = textoParaFala(f, v.idioma);
                const mudaLeitura = !!f.trim() && lido.toLowerCase().replace(/[^a-zà-ÿ]/g, "") !== f.toLowerCase().replace(/[^a-zà-ÿ]/g, "");
                return (
                  <div key={i} data-fala-cena={i + 1} className="rounded-xl border border-white/10 bg-white/[0.03] p-2.5">
                    <div className="mb-1 flex items-center justify-between gap-2 text-[11px] font-bold">
                      <span className="text-white/55">Cena {i + 1}</span>
                      <span className={passou ? "text-amber-300" : "text-white/45"}>fala {seg(fala)} · cena {seg(durs[i])}</span>
                    </div>
                    <textarea value={f} rows={Math.min(5, Math.max(2, Math.ceil(f.length / 30)))} maxLength={300} onChange={(e) => mudarFala(i, e.target.value)} placeholder="Sem fala nesta cena" aria-label={`Fala da cena ${i + 1}`}
                      className="w-full resize-none rounded-lg border border-white/10 bg-black/30 px-2.5 py-2 text-[15px] leading-snug text-white outline-none focus:border-[#F5F906]" />
                    {mudaLeitura && <p data-voz-le={i + 1} className="mt-1 text-[11px] leading-snug text-white/55"><span className="font-bold text-white/70">A voz lê:</span> {lido}</p>}
                    <div className="mt-1 flex items-center gap-1.5">
                      <button type="button" data-ouvir-cena={i + 1} disabled={!f.trim()} onClick={() => ouvir("cena-" + i, f)} className="flex min-h-9 items-center gap-1 rounded-full border border-white/15 px-3 text-[12px] font-bold disabled:opacity-40">
                        {ouvindo === "cena-" + i ? <><Square className="h-3.5 w-3.5" />Parar</> : <><Play className="h-3.5 w-3.5" />Ouvir</>}
                      </button>
                      {passou && <button type="button" data-ajustar-cena={i + 1} onClick={() => mudarDur(i, Math.min(15, Math.ceil((fala + 0.7) * 10) / 10))} className="min-h-9 rounded-full px-3 text-[12px] font-bold text-amber-300">Cena com {seg(Math.min(15, Math.ceil((fala + 0.7) * 10) / 10))}</button>}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          <section data-revisor-narracao className="rounded-2xl border border-white/10 p-3">
            <p className="mb-1.5 flex items-center gap-1.5 text-[13px] font-extrabold"><Wand2 className="h-4 w-4 text-[#F5F906]" />Revisor da narração</p>
            {!avisos.length ? (
              <p className="flex items-center gap-1.5 text-[13px] text-emerald-300"><Check className="h-4 w-4" />Tudo certo: as falas cabem nas cenas e a voz vai ler tudo direito.</p>
            ) : (
              <>
                <ul className="flex flex-col gap-1.5">
                  {avisos.map((a, k) => <li key={k} className={`flex gap-1.5 text-[12px] ${a.nivel === "erro" ? "text-amber-200" : "text-white/70"}`}><AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />{a.msg}</li>)}
                </ul>
                {avisos.some((a) => a.ajuste) && <button type="button" data-ajustar-tempos onClick={ajustarTodas} className="mt-2.5 min-h-11 w-full rounded-full text-[13px] font-black text-black" style={{ background: "#F5F906" }}>Ajustar o tempo das cenas à fala</button>}
              </>
            )}
            {avisos.some((a) => a.nivel === "erro" && a.ajuste) && <p className="mt-2 text-[11px] text-white/45">Com aviso em amarelo a fala pode ser cortada pela próxima cena.</p>}
          </section>
          {aviso && <p data-aviso-narracao className="rounded-xl border border-white/15 bg-white/[0.05] p-2.5 text-[12px] text-white/80"><AlertTriangle className="mr-1 inline h-3.5 w-3.5" />{aviso}</p>}
        </>
      )}
    </div>
  );
}
