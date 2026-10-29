import { useState } from "react";
import { ArrowRight, Check, PartyPopper, X } from "lucide-react";
import { useFabricaContext } from "@/hooks/useFabricaContext";

type StepId = "perfil" | "pacote" | "anuncio" | "site";

interface FirstStep {
  id: StepId;
  title: string;
  why: string;
  cta: string;
  done: boolean;
}

const storageKey = (projectId: string) => `cv-fabrica-primeiros-passos-ok-${projectId || "local"}`;

const whatsappOk = (raw: string, country: string) => {
  const digits = (raw || "").replace(/\D/g, "");
  if (country && country !== "BR") return digits.length >= 6;
  return digits.length === 11 || (digits.length === 10 && digits[2] !== "9");
};

/**
 * Checklist do primeiro acesso: quatro passos até o primeiro resultado real
 * (perfil → pacote → anúncio → site no ar). Some sozinho quando tudo está feito.
 */
export function FabricaFirstSteps({
  onGo,
}: {
  onGo: (target: StepId) => void;
}) {
  const { state } = useFabricaContext();
  const [hidden, setHidden] = useState(() => {
    try {
      return localStorage.getItem(storageKey(state.projectId || "")) === "1";
    } catch {
      return false;
    }
  });

  const steps: FirstStep[] = [
    {
      id: "perfil",
      title: "Preencha nome da agência e WhatsApp",
      why: "Aparecem sozinhos em todas as artes e no site",
      cta: "Preencher",
      done: Boolean(state.agencyName?.trim()) && whatsappOk(state.whatsapp, state.whatsappCountryCode || "BR"),
    },
    {
      id: "pacote",
      title: "Cadastre 1 pacote que você vende",
      why: "Destino, preço e o que está incluso",
      cta: "Cadastrar",
      done: state.selectedPackages.some((p) => !p.isDraft),
    },
    {
      id: "anuncio",
      title: "Gere seu primeiro anúncio",
      why: "Leva 1 minuto. Já sai pronto para postar",
      cta: "Gerar",
      done: (state.allGeneratedAdImages?.length ?? 0) > 0 || Boolean(state.generatedAdImage),
    },
    {
      id: "site",
      title: "Publique seu site",
      why: "Quem clicar no seu anúncio cai aqui e pede orçamento",
      cta: "Publicar",
      done: Boolean(state.siteContent?.canvaViagemUrl),
    },
  ];

  const doneCount = steps.filter((s) => s.done).length;
  const allDone = doneCount === steps.length;
  const next = steps.find((s) => !s.done);

  if (hidden) return null;

  const dismiss = () => {
    setHidden(true);
    try {
      localStorage.setItem(storageKey(state.projectId || ""), "1");
    } catch {
      /* ignore */
    }
  };

  return (
    <section className="mb-6 rounded-3xl border border-[#F5F906]/30 bg-gradient-to-br from-[#F5F906]/[0.08] to-transparent p-5 sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-black text-white sm:text-lg">
            {allDone ? "Tudo pronto! Sua agência já está no ar" : "Primeiros passos"}
          </h2>
          <p className="mt-0.5 text-xs text-white/55">
            {allDone
              ? "Agora é só gerar artes novas toda semana e responder quem chamar."
              : `${doneCount} de ${steps.length} feitos · em 10 minutos você tem anúncio e site prontos`}
          </p>
        </div>
        {allDone ? (
          <button type="button" onClick={dismiss} className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-white/50 hover:bg-white/10 hover:text-white" aria-label="Fechar">
            <X className="h-4 w-4" />
          </button>
        ) : (
          <span className="shrink-0 rounded-full bg-black/40 px-3 py-1 text-xs font-bold text-[#F5F906]">
            {Math.round((doneCount / steps.length) * 100)}%
          </span>
        )}
      </div>

      <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-black/40">
        <div className="h-full rounded-full bg-[#F5F906] transition-all duration-500" style={{ width: `${(doneCount / steps.length) * 100}%` }} />
      </div>

      <ol className="mt-4 grid gap-2 sm:grid-cols-2">
        {steps.map((step, index) => {
          const isNext = next?.id === step.id;
          return (
            <li
              key={step.id}
              className={`flex items-center gap-3 rounded-2xl border p-3 ${
                step.done
                  ? "border-emerald-400/20 bg-emerald-400/[0.06]"
                  : isNext
                    ? "border-[#F5F906]/50 bg-black/40"
                    : "border-white/5 bg-black/20 opacity-70"
              }`}
            >
              <span
                className={`grid h-7 w-7 shrink-0 place-items-center rounded-full text-xs font-black ${
                  step.done ? "bg-emerald-400 text-black" : "bg-white/10 text-white/70"
                }`}
              >
                {step.done ? <Check className="h-4 w-4" /> : index + 1}
              </span>
              <span className="min-w-0 flex-1">
                <span className={`block text-[13px] font-bold ${step.done ? "text-white/60 line-through" : "text-white"}`}>{step.title}</span>
                {!step.done && <span className="block text-[11px] text-white/45">{step.why}</span>}
              </span>
              {!step.done && (
                <button
                  type="button"
                  onClick={() => onGo(step.id)}
                  className={`inline-flex min-h-9 shrink-0 items-center gap-1 rounded-xl px-3 text-xs font-extrabold transition-colors ${
                    isNext ? "bg-[#F5F906] text-black hover:brightness-95" : "border border-white/15 text-white/70 hover:bg-white/10"
                  }`}
                >
                  {step.cta} <ArrowRight className="h-3.5 w-3.5" />
                </button>
              )}
            </li>
          );
        })}
      </ol>

      {allDone && (
        <p className="mt-3 flex items-center gap-2 text-xs text-emerald-300">
          <PartyPopper className="h-4 w-4" /> Dica: gere 3 artes por semana e poste uma a cada 2 dias.
        </p>
      )}
    </section>
  );
}
