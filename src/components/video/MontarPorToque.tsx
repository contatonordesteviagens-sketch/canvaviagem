import { useState } from "react";
import { ArrowLeft, Check } from "lucide-react";

// Montar o vídeo só tocando: destino → tipo de oferta → o que está incluso → preço (opcional).
// O texto montado vai pelo mesmo caminho do áudio, então destino, vídeos e campos saem iguais.

type Regiao = "nacional" | "internacional";
type Tipo = { id: string; nome: string; frase: string; emoji: string; cor: string; inclusos: string[] };

const DESTINOS: Record<Regiao, { nome: string; emoji: string }[]> = {
  nacional: [
    { nome: "Gramado", emoji: "🌲" },
    { nome: "Porto de Galinhas", emoji: "🐠" },
    { nome: "Maceió", emoji: "🏖️" },
    { nome: "Fernando de Noronha", emoji: "🐢" },
    { nome: "Rio de Janeiro", emoji: "⛰️" },
    { nome: "Foz do Iguaçu", emoji: "💦" },
    { nome: "Jericoacoara", emoji: "🌅" },
    { nome: "Porto Seguro", emoji: "🌴" },
    { nome: "Bonito", emoji: "🐟" },
    { nome: "Maragogi", emoji: "🏝️" },
  ],
  internacional: [
    { nome: "Cancún", emoji: "🏝️" },
    { nome: "Orlando", emoji: "🎢" },
    { nome: "Buenos Aires", emoji: "💃" },
    { nome: "Santiago", emoji: "🍷" },
    { nome: "Punta Cana", emoji: "🥥" },
    { nome: "Bariloche", emoji: "🏔️" },
    { nome: "Lisboa", emoji: "🚋" },
    { nome: "Paris", emoji: "🗼" },
  ],
};

const TIPOS: Tipo[] = [
  { id: "pacote", nome: "Pacote completo", frase: "Pacote completo", emoji: "🧳", cor: "#F5F906", inclusos: ["Aéreo ida e volta", "Hotel com café da manhã", "Traslados", "Seguro viagem", "Passeios", "All inclusive"] },
  { id: "aereo", nome: "Passagem aérea", frase: "Passagem aérea", emoji: "✈️", cor: "#4DA3FF", inclusos: ["Ida e volta", "Bagagem de mão", "Mala despachada", "Taxas inclusas"] },
  { id: "hotel", nome: "Hotel ou resort", frase: "Hospedagem em hotel", emoji: "🏨", cor: "#B98CFF", inclusos: ["Café da manhã", "All inclusive", "Piscina", "Quarto com vista", "Wi-Fi"] },
  { id: "cruzeiro", nome: "Cruzeiro", frase: "Cruzeiro", emoji: "🚢", cor: "#3FD8E0", inclusos: ["Pensão completa", "Shows a bordo", "Taxas portuárias", "Bebidas"] },
  { id: "excursao", nome: "Excursão", frase: "Excursão em grupo", emoji: "🚌", cor: "#4BE08A", inclusos: ["Ônibus executivo", "Hotel", "Guia acompanhante", "Café da manhã"] },
  { id: "passeio", nome: "Passeio ou day use", frase: "Passeio", emoji: "🚤", cor: "#FF9A3D", inclusos: ["Transporte", "Guia", "Almoço", "Fotos"] },
];

const entra = "animate-in fade-in slide-in-from-bottom-2 duration-300 fill-mode-both";

export function MontarPorToque({ ocupado, onMontar }: { ocupado: boolean; onMontar: (texto: string) => void }) {
  const [passo, setPasso] = useState(0);
  const [regiao, setRegiao] = useState<Regiao>("nacional");
  const [destino, setDestino] = useState("");
  const [outro, setOutro] = useState("");
  const [tipo, setTipo] = useState<Tipo | null>(null);
  const [inclusos, setInclusos] = useState<string[]>([]);
  const [preco, setPreco] = useState("");

  function escolherDestino(nome: string) {
    setDestino(nome);
    setPasso(1);
  }
  function escolherTipo(t: Tipo) {
    setTipo(t);
    setInclusos(t.inclusos.slice(0, 3));
    setPasso(2);
  }
  function alternar(item: string) {
    setInclusos((l) => (l.includes(item) ? l.filter((x) => x !== item) : [...l, item]));
  }
  function montar() {
    if (!tipo || !destino) return;
    const partes = [`${tipo.frase} para ${destino}.`];
    if (inclusos.length) partes.push(`Inclui: ${inclusos.join(", ")}.`);
    const p = preco.trim();
    partes.push(p ? `Por ${/^r\$/i.test(p) ? p : "R$ " + p}.` : "Valor sob consulta.");
    onMontar(partes.join(" "));
  }

  const titulos = ["Pra onde é a viagem?", "O que você está vendendo?", "O que está incluso?"];

  return (
    <div className="flex flex-col gap-4">
      {/* progresso */}
      <div className="flex items-center gap-2">
        {passo > 0 && (
          <button aria-label="Voltar" onClick={() => setPasso(passo - 1)} className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white/[0.08] transition-transform active:scale-90">
            <ArrowLeft className="h-4 w-4" />
          </button>
        )}
        <div className="flex flex-1 gap-1.5">
          {[0, 1, 2].map((i) => (
            <span key={i} className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/10">
              <span className="block h-full rounded-full bg-[#F5F906] transition-all duration-500" style={{ width: i <= passo ? "100%" : "0%" }} />
            </span>
          ))}
        </div>
      </div>

      <div key={passo} className={entra}>
        <p className="mb-1 text-[11px] font-bold uppercase tracking-widest text-[#F5F906]">Passo {passo + 1} de 3</p>
        <h3 className="mb-3 text-[19px] font-extrabold leading-tight">{titulos[passo]}</h3>

        {passo === 0 && (
          <div className="flex flex-col gap-3">
            <div className="grid grid-cols-2 gap-2 rounded-2xl bg-white/[0.06] p-1">
              {(["nacional", "internacional"] as Regiao[]).map((r) => (
                <button
                  key={r}
                  onClick={() => setRegiao(r)}
                  className={`min-h-12 rounded-xl text-[15px] font-bold transition-all duration-200 active:scale-95 ${regiao === r ? "bg-[#F5F906] text-black shadow-lg" : "text-white/70"}`}
                >
                  {r === "nacional" ? "🌴 Nacional" : "✈️ Internacional"}
                </button>
              ))}
            </div>
            <div key={regiao} className="grid grid-cols-2 gap-2">
              {DESTINOS[regiao].map((d, i) => (
                <button
                  key={d.nome}
                  onClick={() => escolherDestino(d.nome)}
                  style={{ animationDelay: `${i * 35}ms` }}
                  className={`animate-in fade-in zoom-in-95 duration-300 fill-mode-both flex min-h-12 items-center gap-2 rounded-xl border px-3 text-left text-[14px] font-semibold transition-all active:scale-95 ${destino === d.nome ? "border-[#F5F906] bg-[#F5F906]/15" : "border-white/10 bg-white/[0.04] hover:bg-white/[0.08]"}`}
                >
                  <span className="text-[20px] leading-none">{d.emoji}</span>
                  <span className="min-w-0 truncate">{d.nome}</span>
                </button>
              ))}
            </div>
            <form
              className="flex gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                if (outro.trim()) escolherDestino(outro.trim());
              }}
            >
              <input
                value={outro}
                onChange={(e) => setOutro(e.target.value)}
                placeholder="Outro destino"
                className="min-h-12 w-full rounded-xl border border-white/10 bg-white/[0.05] px-3 text-[15px] outline-none focus:border-[#F5F906]/60"
              />
              <button type="submit" className="min-h-12 shrink-0 rounded-xl bg-white/[0.12] px-4 text-[14px] font-bold transition-transform active:scale-95">
                Ok
              </button>
            </form>
          </div>
        )}

        {passo === 1 && (
          <div className="grid grid-cols-2 gap-2">
            {TIPOS.map((t, i) => (
              <button
                key={t.id}
                onClick={() => escolherTipo(t)}
                style={{ animationDelay: `${i * 45}ms`, borderColor: tipo?.id === t.id ? t.cor : `${t.cor}40`, background: `linear-gradient(160deg, ${t.cor}26, ${t.cor}08)` }}
                className="animate-in fade-in zoom-in-95 duration-300 fill-mode-both flex min-h-24 flex-col items-start justify-between rounded-2xl border-2 p-3 text-left transition-transform active:scale-95"
              >
                <span className="grid h-10 w-10 place-items-center rounded-xl text-[22px]" style={{ background: `${t.cor}33` }}>{t.emoji}</span>
                <span className="text-[14px] font-bold leading-tight">{t.nome}</span>
              </button>
            ))}
          </div>
        )}

        {passo === 2 && tipo && (
          <div className="flex flex-col gap-4">
            <p className="-mt-1 text-[13px] text-white/55">
              {tipo.emoji} {tipo.nome} · {destino}. Toque para marcar o que entra.
            </p>
            <div className="flex flex-wrap gap-2">
              {tipo.inclusos.map((it, i) => {
                const on = inclusos.includes(it);
                return (
                  <button
                    key={it}
                    onClick={() => alternar(it)}
                    style={{ animationDelay: `${i * 40}ms`, ...(on ? { background: tipo.cor, borderColor: tipo.cor } : {}) }}
                    className={`animate-in fade-in zoom-in-95 duration-300 fill-mode-both flex min-h-11 items-center gap-1.5 rounded-full border px-3.5 text-[14px] font-semibold transition-all active:scale-95 ${on ? "text-black" : "border-white/15 bg-white/[0.04] text-white/80"}`}
                  >
                    {on && <Check className="h-4 w-4" />}
                    {it}
                  </button>
                );
              })}
            </div>
            <label className="block">
              <span className="mb-1 block text-[12px] font-semibold text-white/55">Preço (opcional, aparece só no fim do vídeo)</span>
              <input
                inputMode="decimal"
                value={preco}
                onChange={(e) => setPreco(e.target.value)}
                placeholder="Ex.: 1.990"
                className="min-h-12 w-full rounded-xl border border-white/10 bg-white/[0.05] px-3 text-[15px] outline-none focus:border-[#F5F906]/60"
              />
            </label>
            <button
              disabled={ocupado}
              onClick={montar}
              className="min-h-14 rounded-2xl text-[16px] font-extrabold text-black shadow-[0_8px_30px_-8px_rgba(245,249,6,.7)] transition-transform active:scale-[.97] disabled:opacity-60"
              style={{ background: "#F5F906" }}
            >
              {ocupado ? "Montando seus vídeos…" : "Montar meus 3 vídeos"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
