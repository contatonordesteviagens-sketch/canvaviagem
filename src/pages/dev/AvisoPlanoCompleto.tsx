// PROTÓTIPO (só localhost): agora só existe um plano. Quem ainda está no Start vê, uma vez por visita,
// o que ganha no plano completo. Para testar no localhost: sessionStorage "cv-simular-start" = "1".
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Check, Crown, X } from "lucide-react";
import { useEntitlements } from "@/contexts/EntitlementsContext";
import { buildUpgradePath, ELITE_OFFER } from "@/lib/eliteOffer";

const AMARELO = "#F5F906";
const CHAVE_VISTO = "cv-aviso-plano-completo";

const GANHOS = [
  "Vídeos com a sua logo e o seu WhatsApp, prontos em minutos",
  "Anúncios com editor: troque foto, texto, preço e cores",
  "Carrossel e site da sua agência",
  "CRM e Vendedor IA para responder clientes",
  "Todos os vídeos e artes prontos da biblioteca",
];

const simulandoStart = () => {
  try { return import.meta.env.DEV && sessionStorage.getItem("cv-simular-start") === "1"; } catch { return false; }
};

export function AvisoPlanoCompleto() {
  const navigate = useNavigate();
  const { tier, loading } = useEntitlements();
  const ehStart = simulandoStart() || tier === "start_legacy";
  const [aberto, setAberto] = useState(false);

  useEffect(() => {
    if (loading || !ehStart) return;
    let visto = false;
    try { visto = sessionStorage.getItem(CHAVE_VISTO) === "1"; } catch { /* sem storage */ }
    if (visto) return;
    const t = setTimeout(() => setAberto(true), 1500);
    return () => clearTimeout(t);
  }, [loading, ehStart]);

  const fechar = () => {
    setAberto(false);
    try { sessionStorage.setItem(CHAVE_VISTO, "1"); } catch { /* sem storage */ }
  };

  if (!aberto) return null;
  return (
    <div data-aviso-plano className="fixed inset-0 z-[60] flex items-end justify-center bg-black/60 p-0 sm:items-center sm:p-6" onClick={fechar}>
      <div className="relative w-full max-w-md rounded-t-3xl border border-white/10 bg-[#141416] p-6 pb-8 text-white sm:rounded-3xl" onClick={(e) => e.stopPropagation()}>
        <button aria-label="Fechar" onClick={fechar} className="absolute right-3 top-3 grid h-10 w-10 place-items-center rounded-full hover:bg-white/[0.07]"><X className="h-5 w-5" /></button>
        <span className="grid h-12 w-12 place-items-center rounded-2xl" style={{ background: AMARELO }}><Crown className="h-6 w-6 text-black" /></span>
        <h2 className="mt-4 text-[22px] font-black leading-tight">Libere a plataforma inteira</h2>
        <p className="mt-1 text-[14px] text-white/60">Você está no plano Start. No plano completo você também tem:</p>
        <ul className="mt-4 space-y-2.5">
          {GANHOS.map((g) => (
            <li key={g} className="flex gap-2.5 text-[14px] leading-snug">
              <Check className="mt-0.5 h-4 w-4 shrink-0" style={{ color: AMARELO }} />{g}
            </li>
          ))}
        </ul>
        <button
          data-aviso-plano-sim
          onClick={() => { fechar(); navigate(buildUpgradePath("fabrica")); }}
          className="mt-6 min-h-12 w-full rounded-full text-[15px] font-black text-black"
          style={{ background: AMARELO }}
        >
          Quero o plano completo · {ELITE_OFFER.monthlyPrice}/mês
        </button>
        <button onClick={fechar} className="mt-2 min-h-11 w-full rounded-full text-[14px] font-bold text-white/60">Agora não</button>
      </div>
    </div>
  );
}
