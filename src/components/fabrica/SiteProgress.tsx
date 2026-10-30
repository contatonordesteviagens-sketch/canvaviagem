import { ArrowRight, Check, PartyPopper } from "lucide-react";
import { useFabricaContext } from "@/hooks/useFabricaContext";

export type SiteProgressTarget = "agency" | "packages" | "palette" | "publish";

const whatsappOk = (raw: string, country: string) => {
  const digits = (raw || "").replace(/\D/g, "");
  if (country && country !== "BR") return digits.length >= 6;
  return digits.length >= 10;
};

/**
 * Checklist do site em 4 passos, com barra de progresso: diz o que falta e leva
 * direto ao lugar certo. Pensado para quem nunca fez um site.
 */
export function SiteProgress({ onGo }: { onGo: (target: SiteProgressTarget) => void }) {
  const { state } = useFabricaContext();
  const visiblePackages = state.selectedPackages.filter((p) => !p.isDraft);

  const steps: { id: SiteProgressTarget; title: string; why: string; cta: string; done: boolean }[] = [
    {
      id: "agency",
      title: "Nome da agência e WhatsApp",
      why: "Os botões do site abrem uma conversa com você",
      cta: "Preencher",
      done: Boolean(state.agencyName?.trim()) && whatsappOk(state.whatsapp, state.whatsappCountryCode || "BR"),
    },
    {
      id: "packages",
      title: "Pelo menos 1 pacote com foto e preço",
      why: "É o que o cliente procura primeiro",
      cta: "Ver pacotes",
      done: visiblePackages.some((p) => Boolean(p.imageUrl) && Boolean(p.price?.trim()) && !/^consult/i.test(p.price.trim())),
    },
    {
      id: "palette",
      title: "Sua logo ou as cores da agência",
      why: "Deixa o site com a cara da sua marca",
      cta: "Ajustar",
      done: Boolean(state.logoBase64) || (state.primaryColor || "").toUpperCase() !== "#F59E0B",
    },
    {
      id: "publish",
      title: "Publicar o site",
      why: "Gera o link para colocar na bio e mandar no WhatsApp",
      cta: "Publicar",
      done: Boolean(state.siteContent.canvaViagemUrl),
    },
  ];
  const doneCount = steps.filter((s) => s.done).length;
  const next = steps.find((s) => !s.done);

  return (
    <section aria-label="Progresso do seu site" className="mb-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[15px] font-bold text-white">
            {next ? "Seu site em 4 passos" : "Seu site está no ar!"}
          </p>
          <p className="mt-0.5 text-[13px] text-white/55">
            {next ? `${doneCount} de 4 prontos${doneCount >= 2 ? " · falta pouco" : ""}` : "Agora é só divulgar o link."}
          </p>
        </div>
        {!next && <PartyPopper className="h-6 w-6 shrink-0 text-[#F5F906]" aria-hidden="true" />}
      </div>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10" role="progressbar" aria-valuemin={0} aria-valuemax={4} aria-valuenow={doneCount}>
        <div className="h-full rounded-full bg-[#F5F906] transition-all duration-500" style={{ width: `${(doneCount / 4) * 100}%` }} />
      </div>
      <ol className="mt-3 space-y-2">
        {steps.map((step, index) => (
          <li
            key={step.id}
            className={`flex items-center gap-3 rounded-xl border px-3 py-2.5 ${
              step === next ? "border-[#F5F906]/50 bg-[#F5F906]/[0.06]" : "border-white/[0.06] bg-black/20"
            }`}
          >
            <span
              className={`grid h-7 w-7 shrink-0 place-items-center rounded-full text-xs font-black ${
                step.done ? "bg-emerald-400 text-zinc-950" : "border border-white/25 text-white/70"
              }`}
              aria-hidden="true"
            >
              {step.done ? <Check className="h-4 w-4" strokeWidth={3} /> : index + 1}
            </span>
            <span className="min-w-0 flex-1">
              <span className={`block text-sm font-semibold ${step.done ? "text-white/50 line-through" : "text-white"}`}>
                {step.title}
              </span>
              {!step.done && <span className="block text-xs text-white/50">{step.why}</span>}
            </span>
            {!step.done && (
              <button
                type="button"
                onClick={() => onGo(step.id)}
                className={`inline-flex min-h-11 shrink-0 items-center gap-1.5 rounded-full px-3.5 text-sm font-bold ${
                  step === next ? "bg-[#F5F906] text-zinc-950" : "border border-white/20 text-white"
                }`}
              >
                {step.cta}
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </button>
            )}
          </li>
        ))}
      </ol>
    </section>
  );
}
