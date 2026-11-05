import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowRight, Check, ChevronDown, ChevronUp, Medal, Sparkles } from "lucide-react";
import { MISSOES, useJornada, type Missao, type MissaoId } from "@/lib/jornada";

const AMARELO = "#F5F906";

/**
 * O guia da jornada. "cartao": o bloco grande do Início e do Painel, com uma missão por vez.
 * "faixa": a linha fina no topo de cada tela da Fábrica, dizendo onde a pessoa está e o que vem depois.
 */
export function JornadaGuia({ variante = "cartao", onIr }: { variante?: "cartao" | "faixa"; onIr?: (m: Missao) => void }) {
  const { missoes, atual, concluidas, total, nivel, isHydrated } = useJornada();
  const navigate = useNavigate();
  const location = useLocation();
  const [listaAberta, setListaAberta] = useState(false);

  if (!isHydrated) return null;

  const ir = (m: Missao) => {
    if (onIr) return onIr(m);
    navigate(m.caminho + (m.tipo === "confirmar" ? "?missao=" + m.id : ""));
  };

  const todas = concluidas === total;
  const caminhoAtual = location.pathname.toLowerCase();
  const nestaTela = atual ? caminhoAtual.startsWith(atual.caminho.toLowerCase()) && (atual.caminho !== "/fabrica" || caminhoAtual === "/fabrica") : false;

  if (variante === "faixa") {
    if (todas) return null;
    return (
      <div
        id="jornada-faixa"
        className="mb-4 flex items-center gap-3 rounded-2xl border px-3 py-2.5 text-white"
        style={{ borderColor: `${AMARELO}40`, background: `linear-gradient(90deg, ${AMARELO}14, transparent)` }}
      >
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-sm font-black text-black" style={{ background: AMARELO }}>
          {atual!.numero}
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: AMARELO }}>
            Missão {atual!.numero} de {total}
          </p>
          <p className="truncate text-sm font-bold">{atual!.titulo}</p>
        </div>
        {nestaTela ? (
          <span className="shrink-0 rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-bold text-white/80">Você está aqui</span>
        ) : (
          <button
            type="button"
            onClick={() => ir(atual!)}
            className="inline-flex min-h-10 shrink-0 items-center gap-1 rounded-xl px-3 text-xs font-black text-black"
            style={{ background: AMARELO }}
          >
            {atual!.cta} <ArrowRight className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    );
  }

  return (
    <section
      id="jornada-cartao"
      className="mb-6 rounded-3xl border bg-[#0A0A0B] p-4 text-white sm:p-6"
      style={{ borderColor: `${AMARELO}4d`, backgroundImage: `linear-gradient(135deg, ${AMARELO}14, transparent 60%)` }}
    >
      <div className="min-w-0">
        <p className="text-[11px] font-black uppercase tracking-widest" style={{ color: AMARELO }}>
          {todas || !atual ? "Jornada completa" : `Missão ${atual.numero} de ${total}`}
        </p>
        <h2 className="mt-0.5 text-lg font-black sm:text-xl">{nivel}</h2>
        <p className="mt-0.5 text-xs text-white/55">
          {todas ? "Agora é rotina: 1 vídeo e 1 arte por semana, e responder quem chamar." : `${concluidas} de ${total} feitas. Cada uma leva poucos minutos.`}
        </p>
      </div>

      <div className="mt-3 flex items-center gap-3">
        <div className="h-2 flex-1 overflow-hidden rounded-full bg-black/40">
          <div className="h-full rounded-full transition-all duration-500" style={{ width: `${(concluidas / total) * 100}%`, background: AMARELO }} />
        </div>
        <div className="flex shrink-0 gap-0.5" aria-label={`${concluidas} medalhas de ${total}`}>
          {missoes.map((m) => (
            <span key={m.id} className="grid h-5 w-5 place-items-center rounded-full sm:h-6 sm:w-6" style={m.feita ? { background: AMARELO, color: "#000" } : { background: "rgba(255,255,255,.06)", color: "rgba(255,255,255,.25)" }}>
              <Medal className="h-3 w-3" />
            </span>
          ))}
        </div>
      </div>

      {atual && (
        <button
          type="button"
          id="jornada-proxima"
          onClick={() => ir(atual)}
          className="mt-4 flex w-full flex-col gap-3 rounded-2xl p-4 text-left text-black transition-transform active:scale-[0.99] sm:flex-row sm:items-center"
          style={{ background: AMARELO }}
        >
          <span className="flex min-w-0 flex-1 items-start gap-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-black text-white">
              <Sparkles className="h-5 w-5" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-[10px] font-black uppercase tracking-widest text-black/60">Sua próxima missão</span>
              <span className="block text-base font-black leading-tight sm:text-lg">{atual.titulo}</span>
              <span className="mt-0.5 block text-xs text-black/70">{atual.porque}</span>
            </span>
          </span>
          <span className="inline-flex min-h-11 w-full shrink-0 items-center justify-center gap-1 rounded-xl bg-black px-4 text-sm font-black text-white sm:w-auto">
            {atual.cta} <ArrowRight className="h-4 w-4" />
          </span>
        </button>
      )}

      <button type="button" onClick={() => setListaAberta((v) => !v)} className="mt-3 inline-flex min-h-9 items-center gap-1 text-xs font-semibold text-white/60">
        {listaAberta ? "Esconder" : "Ver"} todas as missões {listaAberta ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
      </button>
      {listaAberta && (
        <ol className="mt-2 space-y-1.5">
          {missoes.map((m) => (
            <li key={m.id} className={`flex items-center gap-3 rounded-xl px-3 py-2 ${m.feita ? "bg-white/[0.03]" : "bg-white/[0.05]"}`}>
              <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full text-xs font-black" style={m.feita ? { background: AMARELO, color: "#000" } : { background: "rgba(255,255,255,.08)" }}>
                {m.feita ? <Check className="h-4 w-4" /> : m.numero}
              </span>
              <span className={`flex-1 text-sm ${m.feita ? "text-white/45 line-through" : "font-semibold"}`}>{m.titulo}</span>
              {!m.feita && m.id !== atual?.id && (
                <button type="button" onClick={() => ir(m)} className="min-h-9 rounded-lg border border-white/15 px-2.5 text-[11px] font-bold text-white/80">
                  Ir
                </button>
              )}
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}

export { MISSOES };
export type { MissaoId };
