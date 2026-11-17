// Peças de tela que o editor de artes e o de vídeo usam igual: o botão das barras de ação e o recado da formação.
import { Sparkles, type LucideIcon } from "lucide-react";

// Recados da formação Agente de Viagens Lucrativo: um diferente a cada download, cada um com outra situação.
// Só promete o que a página da formação promete (/quiz-agente-lucrativo).
export const TOTAL_ANUNCIOS = 6;
/** Página da formação (abre sempre em nova guia). */
export const URL_FORMACAO = "/quiz-agente-lucrativo";
export function AnuncioAgente({ qual }: { qual: number }) {
  // sempre em NOVA guia: o cliente não pode sair do editor (perderia o vídeo)
  const link = { href: URL_FORMACAO, target: "_blank", rel: "noopener noreferrer" } as const;
  const botao = (texto: string, escuro = false) => (
    <a data-anuncio-saiba {...link} className="mt-3 inline-block rounded-full px-4 py-2 text-[13px] font-black" style={escuro ? { background: "#111", color: "#F5F906" } : { background: "#F5F906", color: "#111" }}>{texto}</a>
  );
  const n = ((qual % TOTAL_ANUNCIOS) + TOTAL_ANUNCIOS) % TOTAL_ANUNCIOS;
  if (n === 0) return (
    <div data-anuncio="0" className="mt-4 rounded-2xl p-4" style={{ background: "#F5F906", color: "#111" }}>
      <p className="text-[18px] font-black leading-tight">Post bonito não paga as contas. O que paga é cliente com pacote fechado.</p>
      <p className="mt-1.5 text-[13px] font-semibold">Faça a formação Agente de Viagens Lucrativo: treinamento prático para transformar seus conteúdos em venda de viagens.</p>
      {botao("Quero vender mais viagens", true)}
    </div>
  );
  if (n === 1) return (
    <div data-anuncio="1" className="mt-4 rounded-2xl border border-white/10 bg-white/[0.04] p-4">
      <p className="text-[11px] font-black uppercase tracking-wider text-[#F5F906]">Agente de Viagens Lucrativo</p>
      <p className="mt-1 text-[16px] font-extrabold leading-snug">Seu post teve curtida, mas ninguém chamou no WhatsApp?</p>
      <p className="mt-1 text-[13px] text-white/70">Aprenda a levar quem viu o post até a conversa, e da conversa até o pacote fechado.</p>
      {botao("Ver a formação")}
    </div>
  );
  if (n === 2) return (
    <div data-anuncio="2" className="mt-4 flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-3">
      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl" style={{ background: "#F5F906", color: "#111" }}><Sparkles className="h-5 w-5" /></span>
      <p className="min-w-0 flex-1 text-[13px] leading-snug text-white/80"><b className="text-white">Arte pronta. E a venda?</b> Na formação Agente de Viagens Lucrativo você aprende a usar artes e vídeos para vender viagens todos os dias.</p>
      <a data-anuncio-saiba {...link} className="shrink-0 rounded-full px-3 py-2 text-[12px] font-black" style={{ background: "#F5F906", color: "#111" }}>Saiba mais</a>
    </div>
  );
  if (n === 3) return (
    <div data-anuncio="3" className="mt-4 rounded-2xl p-4" style={{ background: "#111", color: "#fff", border: "1px solid rgba(245,249,6,.35)" }}>
      <p className="text-[17px] font-black leading-tight" style={{ color: "#F5F906" }}>O cliente pediu o preço e sumiu?</p>
      <p className="mt-1.5 text-[13px]" style={{ color: "rgba(255,255,255,.8)" }}>Não é falta de cliente: é a conversa. No Agente de Viagens Lucrativo você aprende a conduzir o WhatsApp até o fechamento.</p>
      {botao("Quero aprender a fechar")}
    </div>
  );
  if (n === 4) return (
    <div data-anuncio="4" className="mt-4 rounded-2xl border p-4" style={{ borderColor: "rgba(245,249,6,.3)", background: "linear-gradient(135deg, rgba(245,249,6,.08), rgba(255,170,60,.06))" }}>
      <p className="text-[11px] font-black uppercase tracking-wider text-[#F5F906]">Agente de Viagens Lucrativo</p>
      <p className="mt-1 text-[15px] font-extrabold">Use essas artes para vender mais viagens</p>
      <ul className="mt-2 flex flex-col gap-1 text-[12px] text-white/75">
        <li>· O que postar e quando</li>
        <li>· Como levar o cliente do post para o WhatsApp</li>
        <li>· Como fechar o pacote na conversa</li>
      </ul>
      {botao("Saiba mais")}
    </div>
  );
  return (
    <div data-anuncio="5" className="mt-4 rounded-2xl p-4" style={{ background: "linear-gradient(135deg, #F5F906 0%, #FFD77A 100%)", color: "#111" }}>
      <p className="text-[17px] font-black leading-tight">Posta todo dia e a agenda continua vazia?</p>
      <p className="mt-1.5 text-[13px] font-semibold">Conteúdo sem estratégia não vende. Na formação Agente de Viagens Lucrativo você aprende a transformar post em viagem vendida.</p>
      {botao("Conhecer a formação", true)}
    </div>
  );
}

export function BotaoAcao({ rotulo, icone: Icone, aoTocar, ativo, compacto, dica }: { rotulo: string; icone: LucideIcon; aoTocar: () => void; ativo?: boolean; compacto?: boolean; dica?: string }) {
  return (
    <button data-acao={rotulo} title={dica || rotulo} aria-label={dica || rotulo} onClick={aoTocar} onPointerDown={(e) => e.stopPropagation()} aria-pressed={ativo} className={`flex min-h-12 min-w-[52px] shrink-0 flex-col items-center justify-center gap-0.5 rounded-xl px-1 text-[11px] font-bold hover:bg-black/10 lg:min-h-10 lg:flex-row lg:gap-1.5 lg:text-[13px] ${compacto ? "lg:min-w-10 lg:px-2" : "lg:px-2.5"}`} style={{ color: "#111", background: ativo ? "rgba(0,0,0,.14)" : undefined }}>
      <Icone className="h-[18px] w-[18px]" /><span className={compacto ? "lg:hidden" : ""}>{rotulo}</span>
    </button>
  );
}
