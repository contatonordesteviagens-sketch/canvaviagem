// Quem abre o link da arte cai aqui: vê a arte e escolhe personalizar (cria uma cópia) ou editar (se o dono deixou).
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Copy, Lock, Pencil } from "lucide-react";
import { lerLink, type ArteLink } from "@/lib/artes-link";

export default function ArteCompartilhada() {
  const { slug = "" } = useParams();
  const navigate = useNavigate();
  const [arte, setArte] = useState<ArteLink | null | undefined>(undefined);
  useEffect(() => { lerLink(slug).then(setArte).catch(() => setArte(null)); }, [slug]);
  const abrir = (copia: boolean) => {
    if (!arte) return;
    const q = new URLSearchParams({ arte: String(arte.variant), link: arte.slug, ...(arte.formato === "story" ? { formato: "story" } : {}), ...(copia ? { copia: "1" } : {}) });
    navigate(`/dev/fabrica-nova?${q.toString()}`);
  };
  return (
    <div className="grid min-h-screen place-items-center bg-[#0A0A0B] p-4 text-white">
      {arte === undefined ? (
        <p className="text-sm text-white/60">Abrindo a arte…</p>
      ) : arte === null ? (
        <div data-link-fechado className="max-w-sm text-center">
          <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-white/[0.08]"><Lock className="h-6 w-6" /></span>
          <h1 className="mt-4 text-xl font-black">Esta arte é privada ou não existe mais</h1>
          <p className="mt-2 text-sm text-white/60">Peça para quem mandou o link mudar o acesso para "Qualquer pessoa com o link".</p>
          <button onClick={() => navigate("/dev/fabrica-nova")} className="mt-5 min-h-11 rounded-full bg-white/[0.1] px-5 text-sm font-bold">Ir para a Fábrica</button>
        </div>
      ) : (
        <div data-link-aberto className="w-full max-w-md">
          <p className="text-center text-[12px] font-bold uppercase tracking-wider text-white/50">Arte compartilhada com você</p>
          <h1 className="mt-1 text-center text-xl font-black">{arte.nome}</h1>
          {arte.capa && <img src={arte.capa} alt={`Arte: ${arte.nome}`} className="mx-auto mt-4 max-h-[52dvh] w-auto rounded-2xl shadow-2xl" />}
          {arte.dados.length > 1 && <p className="mt-2 text-center text-[12px] text-white/50">{arte.dados.length} páginas</p>}
          <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.04] p-4">
            <p className="text-[15px] font-extrabold">Deseja personalizar essa arte?</p>
            <p className="mt-1 text-[13px] text-white/60">Vamos criar uma cópia nas suas artes. A original não muda.</p>
            <button data-link-copia onClick={() => abrir(true)} className="mt-3 flex min-h-12 w-full items-center justify-center gap-2 rounded-full text-[15px] font-black text-black" style={{ background: "linear-gradient(135deg, #F5F906 0%, #FFD77A 100%)" }}><Copy className="h-4 w-4" />Personalizar (criar uma cópia)</button>
            {(arte.acesso === "editar" || arte.ehDono) && (
              <button data-link-editar onClick={() => abrir(false)} className="mt-2 flex min-h-11 w-full items-center justify-center gap-2 rounded-full border border-white/20 text-[14px] font-bold"><Pencil className="h-4 w-4" />Editar a original (quem tem o link vê as mudanças)</button>
            )}
          </div>
          {arte.local && <p className="mt-3 text-center text-[11px] text-white/40">Teste: este link está guardado só neste aparelho.</p>}
        </div>
      )}
    </div>
  );
}
