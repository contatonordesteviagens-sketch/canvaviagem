// Painel "Traduzir" do editor de vídeo: muda todos os textos das cenas (e a fala, se quiser) para outro idioma.
// Grátis: tradutor do Chrome do computador ou, sem ele, um tradutor público gratuito (sem IA paga).
import { useState } from "react";
import { IDIOMAS_VIDEO, type EtapaTraducao, type IdiomaVideo } from "@/lib/traducao";

type Props = {
  traduzir: (para: IdiomaVideo, comFala: boolean, aoAvancar?: (p: number, etapa: EtapaTraducao) => void) => Promise<void>;
  irParaNarracao: () => void;
};

export function PainelTraduzir({ traduzir, irParaNarracao }: Props) {
  const [indo, setIndo] = useState<{ para: IdiomaVideo; pct: number; etapa: EtapaTraducao } | null>(null);
  const [comFala, setComFala] = useState(true);
  const [feito, setFeito] = useState<{ para: IdiomaVideo; fala: boolean } | null>(null);
  const [aviso, setAviso] = useState("");
  const nome = (id: IdiomaVideo) => IDIOMAS_VIDEO.find((i) => i.id === id)?.nome || id;

  const ir = async (para: IdiomaVideo) => {
    if (indo) return;
    setAviso(""); setFeito(null);
    setIndo({ para, pct: 0, etapa: "traduzindo" });
    try {
      await traduzir(para, comFala, (pct, etapa) => setIndo({ para, pct, etapa }));
      setFeito({ para, fala: comFala });
    } catch (e) { setAviso((e as Error).message || "Não consegui traduzir agora. Tente de novo."); }
    setIndo(null);
  };

  return (
    <div data-painel-traduzir className="flex flex-col gap-3">
      <p className="text-[14px] font-semibold text-white/70">Escolha o idioma. Todos os textos do vídeo mudam.</p>
      {aviso && <p data-aviso-traduzir className="narr-alerta rounded-xl p-3 text-[13px] font-semibold">{aviso}</p>}
      <div className="grid grid-cols-2 gap-2">
        {IDIOMAS_VIDEO.map((i) => (
          <button key={i.id} type="button" data-traduzir-para={i.id} disabled={!!indo} onClick={() => void ir(i.id)}
            className={`relative min-h-12 overflow-hidden rounded-xl text-[15px] font-black disabled:opacity-60 ${feito?.para === i.id ? "narr-chip-ativo" : "narr-chip"}`}>
            {indo?.para === i.id && <span className="absolute inset-y-0 left-0 bg-[#F5F906]/40 transition-[width]" style={{ width: `${Math.max(8, indo.pct * 100)}%` }} />}
            <span className="relative">{indo?.para === i.id ? `${Math.round(indo.pct * 100)}%` : i.nome}</span>
          </button>
        ))}
      </div>
      {indo && (
        <p data-traduzindo className="text-[13px] font-semibold text-white/70">
          {indo.etapa === "baixando"
            ? `Baixando o ${nome(indo.para).toLowerCase()} no seu navegador. Só na primeira vez, leva uns 20 segundos.`
            : `Traduzindo os textos para ${nome(indo.para).toLowerCase()}…`}
        </p>
      )}
      <label className="flex min-h-11 items-center justify-between gap-3 rounded-xl border border-white/10 px-3">
        <span className="text-[14px] font-bold">Traduzir a fala também</span>
        <input type="checkbox" data-traduzir-fala checked={comFala} onChange={(e) => setComFala(e.target.checked)} className="h-5 w-5 accent-[#F5F906]" />
      </label>
      {feito && (
        <div data-traduzido className="narr-ok rounded-xl p-3">
          <p className="text-[14px] font-black">Pronto: vídeo em {nome(feito.para)}.</p>
          <p className="mt-0.5 text-[13px] font-semibold">Desfazer volta ao português.</p>
          {feito.fala && (
            <button type="button" data-ir-narracao onClick={irParaNarracao} className="mt-2 min-h-11 w-full rounded-full text-[14px] font-black text-black" style={{ background: "#F5F906" }}>
              Criar a voz em {nome(feito.para)}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
