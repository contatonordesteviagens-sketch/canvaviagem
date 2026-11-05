import { useState } from "react";
import { ChevronUp, HelpCircle, Lightbulb } from "lucide-react";

export type FabricaGuideKey = "painel" | "video" | "biblioteca" | "anuncio" | "carrossel" | "site" | "crm" | "pacotes";

interface GuideContent {
  title: string;
  steps: string[];
  tip: string;
}

// Textos curtos, em linguagem de quem nunca usou ferramenta de design.
const GUIDES: Record<FabricaGuideKey, GuideContent> = {
  painel: {
    title: "Comece por aqui",
    steps: [
      "Abra \"Dados do perfil\" e preencha o nome da agência, WhatsApp e Instagram. Eles aparecem sozinhos em todas as artes e no site.",
      "Escolha as cores da sua marca, ou clique numa paleta pronta.",
      "Cadastre seus pacotes em \"Meus Pacotes\" e depois clique em \"Criar anúncio\".",
    ],
    tip: "Tudo salva sozinho. Pode fechar e voltar depois que nada se perde.",
  },
  video: {
    title: "Seu vídeo pronto em 3 passos",
    steps: [
      "Mande o pacote de um jeito só: fale no microfone, cole um texto, mande a foto do pacote ou escolha um pacote salvo.",
      "A IA acha o destino, preenche o preço e o que inclui, e busca vídeos reais do lugar. Confira e mude o que quiser.",
      "Toque em \"Gerar 3 vídeos\", escolha o que mais gostou e poste nos stories.",
    ],
    tip: "Fale como se estivesse contando para um cliente. Quanto mais detalhes, melhor sai o vídeo.",
  },
  biblioteca: {
    title: "Tudo que você já gerou",
    steps: [
      "Os vídeos ficam guardados neste aparelho. Toque para baixar ou compartilhar de novo.",
      "As artes e os sites ficam na sua conta e aparecem em qualquer aparelho.",
      "Para apagar, toque em Remover. Não dá para desfazer.",
    ],
    tip: "Poste 1 vídeo e 1 arte por semana. É o que mantém a agência aparecendo.",
  },
  anuncio: {
    title: "Crie um anúncio em 3 passos",
    steps: [
      "Escolha o destino. As fotos aparecem sozinhas e a primeira já vem escolhida (clique em outra para trocar).",
      "Confira o preço e os textos em \"Textos e preço\".",
      "Clique em \"Gerar Anúncio\", depois em \"Baixar esta arte\" e copie a legenda pronta.",
    ],
    tip: "Não gostou do visual? Clique em gerar de novo: cada arte sai em um modelo diferente, até passar pelos 12.",
  },
  carrossel: {
    title: "Monte um carrossel em 3 passos",
    steps: [
      "Escolha o pacote. O carrossel é montado na hora com os dados dele.",
      "Clique em cada imagem para trocar o texto ou a foto.",
      "Baixe as imagens e copie a legenda pronta.",
    ],
    tip: "No Instagram, poste todas as imagens juntas, na mesma publicação e na ordem.",
  },
  site: {
    title: "Seu site pronto em 3 passos",
    steps: [
      "Escolha um modelo de site. Pode trocar depois sem perder textos nem fotos.",
      "Clique direto nos textos e nas fotos da prévia para editar.",
      "Escolha o endereço do site e clique em \"Publicar meu site\".",
    ],
    tip: "Pacote em rascunho não aparece no site. Use o botão \"Mostrar no site\".",
  },
  crm: {
    title: "Seus clientes interessados",
    steps: [
      "Toda pessoa que pede orçamento no seu site aparece aqui automaticamente.",
      "Clique no WhatsApp do cliente para chamar na hora.",
      "Mude a etapa do atendimento para saber com quem falta falar.",
    ],
    tip: "Responda em até 5 minutos: é quando o cliente está mais pronto para comprar.",
  },
  pacotes: {
    title: "Seus pacotes de viagem",
    steps: [
      "Clique em \"+\" para criar um pacote: destino, preço e o que está incluso.",
      "Pacote em rascunho não aparece no site. Aprove para mostrar.",
      "O Anúncio, o Carrossel e o Site puxam os dados daqui. Cadastre uma vez e use em tudo.",
    ],
    tip: "Preço no formato \"R$ 1.997\" fica mais bonito nas artes.",
  },
};

const storageKey = (key: FabricaGuideKey) => `cv-fabrica-guia-${key}`;

const readClosed = (key: FabricaGuideKey) => {
  try {
    return localStorage.getItem(storageKey(key)) === "fechado";
  } catch {
    return false;
  }
};

/** Mini tutorial no topo de cada tela da Fábrica. Aberto na primeira visita; depois vira um botão "?". */
export function FabricaStepGuide({ section }: { section: FabricaGuideKey }) {
  const guide = GUIDES[section];
  const [closed, setClosed] = useState(() => readClosed(section));

  const toggle = (next: boolean) => {
    setClosed(next);
    try {
      localStorage.setItem(storageKey(section), next ? "fechado" : "aberto");
    } catch {
      /* sem storage: só não lembra a preferência */
    }
  };

  if (closed) {
    return (
      <button
        type="button"
        onClick={() => toggle(false)}
        className="mb-4 inline-flex min-h-9 items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3.5 text-xs font-semibold text-white/60 transition-colors hover:border-[#F5F906]/40 hover:text-white"
      >
        <HelpCircle className="h-4 w-4 text-[#F5F906]" />
        Como funciona esta tela?
      </button>
    );
  }

  return (
    <section className="mb-5 rounded-2xl border border-[#F5F906]/25 bg-[#F5F906]/[0.04] p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <h2 className="flex items-center gap-2 text-sm font-extrabold text-white sm:text-base">
          <HelpCircle className="h-5 w-5 shrink-0 text-[#F5F906]" />
          {guide.title}
        </h2>
        <button
          type="button"
          onClick={() => toggle(true)}
          className="inline-flex min-h-10 shrink-0 items-center gap-1 rounded-lg px-2.5 text-xs font-semibold text-white/50 transition-colors hover:bg-white/5 hover:text-white"
        >
          Entendi <ChevronUp className="h-3.5 w-3.5" />
        </button>
      </div>
      <ol className="mt-3 grid gap-2.5 sm:grid-cols-3">
        {guide.steps.map((step, index) => (
          <li key={step} className="flex gap-3 rounded-xl bg-black/30 p-3 text-[13px] leading-snug text-white/80">
            <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-[#F5F906] text-xs font-black text-black">
              {index + 1}
            </span>
            <span>{step}</span>
          </li>
        ))}
      </ol>
      <p className="mt-3 flex items-start gap-2 text-xs text-white/55">
        <Lightbulb className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#F5F906]" />
        {guide.tip}
      </p>
    </section>
  );
}
