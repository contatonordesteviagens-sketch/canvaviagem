import { useState } from "react";
import { Check, ChevronDown, ChevronUp, Rocket } from "lucide-react";

export type Momento = "video" | "arte" | "carrossel" | "site" | "cliente";

// O que fazer com cada coisa depois de pronta. Linguagem de quem nunca fez marketing.
const ACOES: Record<Momento, { titulo: string; passos: { t: string; d: string }[]; confirmar: string }> = {
  video: {
    titulo: "Seu vídeo está pronto. Agora é postar:",
    passos: [
      { t: "Poste nos stories do Instagram", d: "Abra o Instagram, toque em + e escolha Story. Esse vídeo já está no tamanho certo." },
      { t: "Coloque no status do WhatsApp", d: "Seus contatos veem sem você mandar nada." },
      { t: "Mande para 5 clientes que já pediram orçamento", d: "Quem já perguntou preço é quem mais compra." },
    ],
    confirmar: "Já postei",
  },
  arte: {
    titulo: "Sua arte está pronta. Agora é postar:",
    passos: [
      { t: "Poste no feed com a legenda pronta", d: "Copie a legenda aqui embaixo e cole no Instagram." },
      { t: "Fixe nos destaques", d: "Crie um destaque com o nome do destino." },
      { t: "Impulsione por R$ 20 por 3 dias", d: "No Instagram, toque em Impulsionar e escolha a sua cidade." },
    ],
    confirmar: "Já postei",
  },
  carrossel: {
    titulo: "Seu carrossel está pronto. Agora é postar:",
    passos: [
      { t: "Poste todas as imagens juntas, na ordem", d: "No Instagram, selecione várias fotos numa publicação só." },
      { t: "Use a primeira imagem como capa", d: "É ela que aparece no seu perfil." },
      { t: "Responda os comentários no mesmo dia", d: "Quem comenta está quase pedindo orçamento." },
    ],
    confirmar: "Já postei",
  },
  site: {
    titulo: "Seu site está no ar. Agora é espalhar o link:",
    passos: [
      { t: "Coloque o link na bio do Instagram", d: "Perfil > Editar perfil > Links." },
      { t: "Mande o link para os clientes no WhatsApp", d: "Quem perguntar por pacote recebe o link." },
      { t: "Use o link como destino dos seus anúncios", d: "Quem clica no anúncio cai no seu site e chama você." },
    ],
    confirmar: "Já coloquei na bio",
  },
  cliente: {
    titulo: "Chegou um pedido de orçamento. Agora é fechar:",
    passos: [
      { t: "Responda em até 5 minutos", d: "É quando a pessoa está mais pronta para comprar." },
      { t: "Mude a etapa para \"Em contato\"", d: "Assim você sabe com quem ainda falta falar." },
      { t: "Mande o vídeo do pacote na conversa", d: "Vídeo vende mais que texto." },
    ],
    confirmar: "Já respondi",
  },
};

const chaveVezes = (m: Momento) => `cv-oque-fazer-${m}`;

/** Quantas vezes o painel já apareceu para este momento neste aparelho. */
function vezes(m: Momento) {
  try {
    return Number(localStorage.getItem(chaveVezes(m)) || 0);
  } catch {
    return 0;
  }
}

export function OQueFazerAgora({
  momento,
  feito,
  onConfirmar,
  extra,
}: {
  momento: Momento;
  feito?: boolean;
  onConfirmar?: () => void;
  extra?: React.ReactNode;
}) {
  const a = ACOES[momento];
  // Nas 3 primeiras vezes vem aberto; depois, recolhido num link.
  const [aberto, setAberto] = useState(() => {
    const n = vezes(momento);
    try {
      localStorage.setItem(chaveVezes(momento), String(n + 1));
    } catch { /* sem storage */ }
    return n < 3;
  });

  return (
    <section
      id={`oque-fazer-${momento}`}
      className="rounded-2xl border border-emerald-400/30 bg-gradient-to-br from-emerald-500/10 to-transparent p-4 text-white"
    >
      <button type="button" onClick={() => setAberto((v) => !v)} className="flex w-full items-center gap-2 text-left">
        <Rocket className="h-5 w-5 shrink-0 text-emerald-300" />
        <span className="flex-1 text-sm font-extrabold sm:text-base">{a.titulo}</span>
        {aberto ? <ChevronUp className="h-4 w-4 text-white/50" /> : <ChevronDown className="h-4 w-4 text-white/50" />}
      </button>
      {aberto && (
        <>
          <ol className="mt-3 space-y-2">
            {a.passos.map((p, i) => (
              <li key={p.t} className="flex gap-3 rounded-xl bg-black/30 p-3">
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-emerald-400 text-sm font-black text-black">{i + 1}</span>
                <div className="min-w-0">
                  <p className="text-sm font-bold leading-tight">{p.t}</p>
                  <p className="mt-0.5 text-xs text-white/60">{p.d}</p>
                </div>
              </li>
            ))}
          </ol>
          {extra}
          {onConfirmar && (
            <button
              type="button"
              disabled={feito}
              onClick={onConfirmar}
              className={`mt-3 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl px-4 text-sm font-bold ${feito ? "bg-emerald-400/20 text-emerald-200" : "bg-emerald-400 text-black"}`}
            >
              <Check className="h-4 w-4" /> {feito ? "Feito! Missão concluída" : a.confirmar}
            </button>
          )}
        </>
      )}
    </section>
  );
}
