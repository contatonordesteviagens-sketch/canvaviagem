import { useNavigate } from "react-router-dom";
import { Check, Minus, Sparkles } from "lucide-react";
import { buildUpgradePath } from "@/lib/eliteOffer";

const SUPORTE_WHATSAPP = "https://wa.me/5585986411294?text=";

/** O que muda do Start para o Elite (só o que o sistema libera de verdade em cada plano). */
const COMPARACAO: { item: string; start: boolean; elite: boolean }[] = [
  { item: "Biblioteca de vídeos, artes e legendas prontas", start: true, elite: true },
  { item: "Ferramentas básicas e microfone", start: true, elite: true },
  { item: "Vídeo pronto do seu pacote: manda um áudio e saem 3 vídeos em 1 minuto", start: false, elite: true },
  { item: "Anúncios prontos com a sua logo, para baixar e postar", start: false, elite: true },
  { item: "Carrosséis prontos para o Instagram", start: false, elite: true },
  { item: "Site da agência publicado", start: false, elite: true },
  { item: "CRM com os seus clientes e pedidos de orçamento", start: false, elite: true },
  { item: "Sem limite de quantidade na Fábrica", start: false, elite: true },
];

const BENEFICIOS = [
  { titulo: "Vídeo pronto em 1 minuto", texto: "Fale o pacote no áudio, mande um texto ou a foto da operadora. Saem 3 vídeos com o seu preço, logo e WhatsApp." },
  { titulo: "Anúncio e carrossel com a sua marca", texto: "Arte de oferta para stories e feed, e carrossel de conteúdo, prontos para baixar." },
  { titulo: "Site e CRM da agência", texto: "Uma página da agência no ar e os contatos de quem pediu orçamento num lugar só." },
];

/** Tela cheia: quem é Start tentou abrir algo do Elite. */
export function UpgradeEliteTela({ email, voltar }: { email?: string | null; voltar: () => void }) {
  const navigate = useNavigate();
  const texto = encodeURIComponent(`Olá! Sou assinante Start do Canva Viagem (${email || ""}) e quero fazer o upgrade para o Elite.`);
  return (
    <div className="min-h-screen bg-[#0A0A0B] px-4 py-8 text-white">
      <div className="mx-auto w-full max-w-lg">
        <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[12px] font-black text-black" style={{ background: "#F5F906" }}>
          <Sparkles className="h-3.5 w-3.5" /> Plano Elite
        </span>
        <h1 className="mt-3 text-[26px] font-black leading-tight">Libere a ferramenta completa e faça o marketing da agência em minutos</h1>
        <p className="mt-2 text-[15px] leading-6 text-white/70">
          Seu plano Start continua ativo: a biblioteca segue liberada. O Elite acrescenta a Fábrica, onde o vídeo, o anúncio, o carrossel e o site saem prontos com a sua marca.
        </p>

        <div className="mt-5 flex flex-col gap-2.5">
          {BENEFICIOS.map((b) => (
            <div key={b.titulo} className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
              <p className="text-[16px] font-bold">{b.titulo}</p>
              <p className="mt-1 text-[14px] leading-5 text-white/65">{b.texto}</p>
            </div>
          ))}
        </div>

        <div className="mt-5 overflow-hidden rounded-2xl border border-white/10">
          <div className="grid grid-cols-[1fr_56px_56px] bg-white/[0.06] px-4 py-2.5 text-[12px] font-bold uppercase tracking-wide text-white/55">
            <span>O que você tem</span>
            <span className="text-center">Start</span>
            <span className="text-center text-[#F5F906]">Elite</span>
          </div>
          {COMPARACAO.map((c) => (
            <div key={c.item} className="grid grid-cols-[1fr_56px_56px] items-center border-t border-white/[0.06] px-4 py-2.5 text-[14px]">
              <span className="pr-2 leading-5 text-white/85">{c.item}</span>
              <span className="flex justify-center">{c.start ? <Check className="h-5 w-5 text-white/70" /> : <Minus className="h-5 w-5 text-white/25" />}</span>
              <span className="flex justify-center"><Check className="h-5 w-5 text-[#F5F906]" /></span>
            </div>
          ))}
        </div>

        <div className="sticky bottom-0 -mx-4 mt-6 flex flex-col gap-2 bg-[#0A0A0B]/95 px-4 pb-[max(12px,env(safe-area-inset-bottom))] pt-3 backdrop-blur">
          <button onClick={() => navigate(buildUpgradePath("fabrica", "/fabrica"))} className="min-h-12 rounded-2xl text-[16px] font-black text-black" style={{ background: "#F5F906" }}>
            Fazer upgrade para o Elite
          </button>
          <div className="grid grid-cols-2 gap-2">
            <a href={SUPORTE_WHATSAPP + texto} target="_blank" rel="noreferrer" className="grid min-h-11 place-items-center rounded-2xl bg-white/[0.08] text-[14px] font-bold">
              Tirar dúvida no WhatsApp
            </a>
            <button onClick={voltar} className="min-h-11 rounded-2xl bg-white/[0.04] text-[14px] font-semibold text-white/70">
              Voltar à biblioteca
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Faixa no portal para quem é Start. */
export function UpgradeEliteFaixa() {
  const navigate = useNavigate();
  return (
    <div className="mx-auto mb-5 w-full max-w-4xl rounded-3xl border border-[#F5F906]/30 bg-[#0A0A0B] p-5 text-left text-white">
      <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-black text-black" style={{ background: "#F5F906" }}>
        <Sparkles className="h-3.5 w-3.5" /> Novo no Elite
      </span>
      <p className="mt-2.5 text-[20px] font-black leading-tight">Mande um áudio do pacote e receba 3 vídeos prontos em 1 minuto</p>
      <ul className="mt-3 grid gap-1.5 text-[14px] text-white/75 sm:grid-cols-2">
        {["Vídeo pronto com seu preço, logo e WhatsApp", "Anúncios e carrosséis com a sua marca", "Site da agência no ar", "CRM com os pedidos de orçamento"].map((t) => (
          <li key={t} className="flex items-start gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0 text-[#F5F906]" />{t}</li>
        ))}
      </ul>
      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
        <button onClick={() => navigate(buildUpgradePath("fabrica", "/fabrica"))} className="min-h-12 rounded-2xl px-5 text-[15px] font-black text-black" style={{ background: "#F5F906" }}>
          Fazer upgrade para o Elite
        </button>
        <button onClick={() => navigate("/fabrica/video")} className="min-h-12 rounded-2xl bg-white/[0.08] px-5 text-[15px] font-bold">
          Ver o que o Elite libera
        </button>
      </div>
    </div>
  );
}
