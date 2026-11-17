// PROTÓTIPO (só localhost): o começo para quem é leigo. Quatro perguntas, uma por tela, e pronto:
// nome, o que vende, logo e WhatsApp entram sozinhos em todos os vídeos e artes (ficam nos Dados do Perfil).
import { useState } from "react";
import { ArrowLeft, Check, ImagePlus } from "lucide-react";
import { useFabricaContext } from "@/hooks/useFabricaContext";
import type { AgencyType } from "@/hooks/useFabricaContext";

const AMARELO = "#F5F906";

// a mesma lista do painel da Fábrica (Dados do Perfil)
const TIPOS: { v: Exclude<AgencyType, "">; l: string }[] = [
  { v: "autonoma", l: "Agente autônomo" }, { v: "pequena", l: "Pequena agência" }, { v: "media", l: "Agência média" },
  { v: "franquia", l: "Franquia" }, { v: "consolidadora", l: "Consolidadora" }, { v: "receptiva", l: "Receptivo" },
  { v: "milhas", l: "Milhas" }, { v: "luxo", l: "Luxo / alto padrão" }, { v: "corporativa", l: "Corporativo" },
  { v: "grupos", l: "Grupos e excursões" }, { v: "cruzeiros", l: "Cruzeiros" }, { v: "ecoturismo", l: "Ecoturismo e aventura" },
  { v: "religioso", l: "Turismo religioso" }, { v: "outro", l: "Outro" },
];

export const CHAVE_CADASTRO_VISTO = "cv-cadastro-rapido-visto";

export default function CadastroRapido({ aoFechar }: { aoFechar: () => void }) {
  const { state: fabrica, update } = useFabricaContext();
  const [passo, setPasso] = useState(0);
  const [nome, setNome] = useState(fabrica.agencyName || "");
  const [whats, setWhats] = useState(fabrica.whatsapp || "");

  const fechar = () => {
    try { localStorage.setItem(CHAVE_CADASTRO_VISTO, "1"); } catch { /* sem storage */ }
    aoFechar();
  };
  const seguir = () => setPasso((p) => p + 1);
  const lerLogo = (f: File) => {
    const r = new FileReader();
    r.onload = () => typeof r.result === "string" && update({ logoBase64: r.result });
    r.readAsDataURL(f);
  };

  const campo = "min-h-14 w-full rounded-2xl border border-white/15 bg-white/[0.05] px-4 text-[18px] font-semibold outline-none focus:border-[#F5F906]";
  const botao = "min-h-14 w-full rounded-full text-[16px] font-black text-black disabled:opacity-40";
  const TOTAL = 4;

  return (
    <div data-cadastro-rapido className="fixed inset-0 z-[55] flex flex-col bg-[#0A0A0B] text-white">
      <div className="mx-auto flex w-full max-w-lg flex-1 flex-col px-5 pb-8 pt-4">
        <div className="flex items-center justify-between">
          <button aria-label="Voltar" onClick={() => (passo === 0 ? fechar() : setPasso(passo - 1))} className="grid h-11 w-11 place-items-center rounded-full border border-white/10"><ArrowLeft className="h-5 w-5" /></button>
          {passo < TOTAL && <span className="text-[13px] font-bold text-white/50">{passo + 1} de {TOTAL}</span>}
          <button onClick={fechar} className="min-h-11 px-2 text-[13px] font-bold text-white/50">Fazer depois</button>
        </div>
        {passo < TOTAL && (
          <div className="mt-4 flex gap-1.5">
            {Array.from({ length: TOTAL }, (_, i) => <span key={i} className="h-1.5 flex-1 rounded-full" style={{ background: i <= passo ? AMARELO : "rgba(255,255,255,.12)" }} />)}
          </div>
        )}

        <div className="flex flex-1 flex-col justify-center gap-5 py-6">
          {passo === 0 && (
            <>
              <h1 className="text-[28px] font-black leading-tight">Qual é o nome da sua agência?</h1>
              <input id="cad-nome" autoFocus className={campo} placeholder="Ex.: Nordeste Viagens" maxLength={40} value={nome} onChange={(e) => setNome(e.target.value)} onKeyDown={(e) => e.key === "Enter" && nome.trim() && (update({ agencyName: nome.trim() }), seguir())} />
              <button className={botao} style={{ background: AMARELO }} disabled={!nome.trim()} onClick={() => { update({ agencyName: nome.trim() }); seguir(); }}>Continuar</button>
            </>
          )}
          {passo === 1 && (
            <>
              <h1 className="text-[28px] font-black leading-tight">O que você vende?</h1>
              <p className="-mt-3 text-[14px] text-white/55">Toque no que mais combina. Os textos dos vídeos e artes seguem esse estilo.</p>
              <div className="flex flex-wrap gap-2">
                {TIPOS.map((tp) => {
                  const on = fabrica.agencyType === tp.v;
                  return (
                    <button key={tp.v} data-tipo={tp.v} onClick={() => { update({ agencyType: tp.v }); setTimeout(seguir, 180); }} className={`min-h-12 rounded-full border px-4 text-[15px] font-bold ${on ? "border-[#F5F906] bg-[#F5F906] text-black" : "border-white/15 text-white/85"}`}>
                      {tp.l}
                    </button>
                  );
                })}
              </div>
            </>
          )}
          {passo === 2 && (
            <>
              <h1 className="text-[28px] font-black leading-tight">Mande a sua logo</h1>
              <p className="-mt-3 text-[14px] text-white/55">Ela aparece no canto de cada vídeo e arte.</p>
              <label className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-3xl border-2 border-dashed border-white/20 p-8 text-center">
                {fabrica.logoBase64
                  ? <img src={fabrica.logoBase64} alt="Sua logo" className="h-28 w-28 rounded-2xl bg-white/[0.06] object-contain" />
                  : <span className="grid h-20 w-20 place-items-center rounded-2xl bg-white/[0.07]"><ImagePlus className="h-9 w-9 text-white/60" /></span>}
                <span className="text-[16px] font-extrabold">{fabrica.logoBase64 ? "Trocar a logo" : "Escolher a logo"}</span>
                <span className="text-[12px] text-white/45">Foto ou imagem do celular</span>
                <input data-cad-logo type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) lerLogo(f); }} />
              </label>
              <button className={botao} style={{ background: AMARELO }} onClick={seguir}>{fabrica.logoBase64 ? "Continuar" : "Não tenho logo agora"}</button>
            </>
          )}
          {passo === 3 && (
            <>
              <h1 className="text-[28px] font-black leading-tight">Qual é o seu WhatsApp?</h1>
              <p className="-mt-3 text-[14px] text-white/55">É por ele que os clientes vão te chamar.</p>
              <input id="cad-whats" autoFocus className={campo} inputMode="tel" placeholder="(82) 99999-9999" maxLength={20} value={whats} onChange={(e) => setWhats(e.target.value)} />
              <button className={botao} style={{ background: AMARELO }} disabled={whats.replace(/\D/g, "").length < 10} onClick={() => { update({ whatsapp: whats.trim() }); seguir(); }}>Continuar</button>
            </>
          )}
          {passo === 4 && (
            <div className="flex flex-col items-center gap-4 text-center">
              <span className="grid h-20 w-20 place-items-center rounded-full" style={{ background: AMARELO }}><Check className="h-10 w-10 text-black" /></span>
              <h1 className="text-[28px] font-black leading-tight">Pronto, {fabrica.agencyName || nome}!</h1>
              <p className="text-[15px] text-white/60">Seu nome, sua logo e seu WhatsApp já entram sozinhos em todos os vídeos e artes. Dá para mudar quando quiser em Dados do Perfil.</p>
              <button className={`${botao} mt-2`} style={{ background: AMARELO }} onClick={fechar}>Começar a criar</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
