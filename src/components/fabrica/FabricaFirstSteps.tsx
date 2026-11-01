import { useEffect, useRef, useState } from "react";
import { ArrowRight, Check, Medal, Mic, PartyPopper, X } from "lucide-react";
import { toast } from "sonner";
import { useFabricaContext } from "@/hooks/useFabricaContext";

type StepId = "perfil" | "pacote" | "anuncio" | "site";

interface Mission {
  id: StepId;
  title: string;
  why: string;
  cta: string;
  done: boolean;
}

const LEVELS = ["Agência começando", "Agência apresentada", "Primeiro pacote na mão", "Primeira arte pronta", "Agência no ar"];

const storageKey = (projectId: string) => `cv-fabrica-primeiros-passos-ok-${projectId || "local"}`;
const doneKey = (projectId: string) => `cv-fabrica-missoes-${projectId || "local"}`;

/**
 * Missões do primeiro acesso, para quem nunca usou uma plataforma: uma coisa de cada vez,
 * sempre com o próximo botão à vista. Falar com o microfone já cumpre as duas primeiras.
 */
export function FabricaFirstSteps({
  onGo,
}: {
  onGo: (target: StepId) => void;
}) {
  const { state, isHydrated } = useFabricaContext();
  const [hidden, setHidden] = useState(() => {
    try {
      return localStorage.getItem(storageKey(state.projectId || "")) === "1";
    } catch {
      return false;
    }
  });

  const missions: Mission[] = [
    {
      id: "perfil",
      title: "Conte quem é a sua agência",
      why: "Fale no microfone ou digite. O nome e o contato entram sozinhos nas artes",
      cta: "Começar",
      done: Boolean(state.agencyName?.trim()),
    },
    {
      id: "pacote",
      title: "Diga 1 pacote que você vende",
      why: "Destino e preço. Pode ser por áudio, do jeito que você fala com o cliente",
      cta: "Dizer o pacote",
      done: state.selectedPackages.length > 0,
    },
    {
      id: "anuncio",
      title: "Gere sua primeira arte",
      why: "Leva 1 minuto e já sai pronta para postar",
      cta: "Gerar arte",
      done: (state.allGeneratedAdImages?.length ?? 0) > 0 || Boolean(state.generatedAdImage),
    },
    {
      id: "site",
      title: "Coloque seu site no ar",
      why: "Quem clicar no seu anúncio cai aqui e chama você no WhatsApp",
      cta: "Publicar site",
      done: Boolean(state.siteContent?.canvaViagemUrl),
    },
  ];

  const doneCount = missions.filter((m) => m.done).length;
  const allDone = doneCount === missions.length;
  const next = missions.find((m) => !m.done);

  // Comemora só o que foi concluído agora, não o que a pessoa já tinha ao abrir a tela.
  const doneIds = missions.filter((m) => m.done).map((m) => m.id).join(",");
  const celebrated = useRef<string | null>(null);
  useEffect(() => {
    if (!isHydrated || celebrated.current === doneIds) return;
    celebrated.current = doneIds;
    const key = doneKey(state.projectId || "");
    const current = doneIds.split(",").filter(Boolean);
    try {
      const raw = localStorage.getItem(key);
      const fresh = raw === null ? [] : current.filter((id) => !raw.split(",").includes(id));
      if (fresh.length) {
        toast.success(`Missão concluída! Você ganhou ${fresh.length > 1 ? `${fresh.length} medalhas` : "uma medalha"}.`, {
          description: `Seu nível agora: ${LEVELS[current.length]}`,
          duration: 6000,
        });
      }
      localStorage.setItem(key, doneIds);
    } catch { /* sem storage: só não comemora */ }
  }, [doneIds, isHydrated, state.projectId]);

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
    <section className="mb-6 rounded-3xl border border-[#F5F906]/30 bg-[#0A0A0B] bg-gradient-to-br from-[#F5F906]/[0.08] to-transparent p-5 sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] font-black uppercase tracking-widest text-[#F5F906]">
            Nível {doneCount + 1} de {missions.length + 1}
          </p>
          <h2 className="mt-0.5 text-lg font-black text-white sm:text-xl">{LEVELS[doneCount]}</h2>
          <p className="mt-0.5 text-xs text-white/55">
            {allDone
              ? "Agora é só gerar artes novas toda semana e responder quem chamar."
              : `${doneCount} de ${missions.length} missões. Cada uma leva poucos minutos.`}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-1" aria-label={`${doneCount} medalhas de ${missions.length}`}>
          {missions.map((m) => (
            <span
              key={m.id}
              className={`grid h-7 w-7 place-items-center rounded-full sm:h-8 sm:w-8 ${m.done ? "bg-[#F5F906] text-black" : "bg-white/5 text-white/25"}`}
            >
              <Medal className="h-4 w-4" />
            </span>
          ))}
          {allDone && (
            <button type="button" onClick={dismiss} className="ml-1 grid h-8 w-8 place-items-center rounded-lg text-white/50 hover:bg-white/10 hover:text-white" aria-label="Fechar">
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-black/40">
        <div className="h-full rounded-full bg-[#F5F906] transition-all duration-500" style={{ width: `${(doneCount / missions.length) * 100}%` }} />
      </div>

      {next && (
        <button
          type="button"
          onClick={() => onGo(next.id)}
          className="mt-4 flex w-full items-center gap-3 rounded-2xl bg-[#F5F906] p-4 text-left text-black transition-transform active:scale-[0.99]"
        >
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-black text-[#F5F906]">
            {next.id === "perfil" || next.id === "pacote" ? <Mic className="h-5 w-5" /> : <ArrowRight className="h-5 w-5" />}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-[11px] font-black uppercase tracking-widest opacity-60">Sua próxima missão</span>
            <span className="block text-[15px] font-black leading-tight">{next.title}</span>
            <span className="mt-0.5 block text-xs font-medium opacity-70">{next.why}</span>
          </span>
          <span className="hidden shrink-0 items-center gap-1 rounded-xl bg-black px-3 py-2 text-xs font-extrabold text-white sm:inline-flex">
            {next.cta} <ArrowRight className="h-3.5 w-3.5" />
          </span>
        </button>
      )}

      <ol className="mt-3 grid gap-2 sm:grid-cols-2">
        {missions.filter((m) => m.id !== next?.id).map((mission) => (
          <li
            key={mission.id}
            className={`flex items-center gap-3 rounded-2xl border p-3 ${
              mission.done ? "border-emerald-400/20 bg-emerald-400/[0.06]" : "border-white/5 bg-black/20"
            }`}
          >
            <span
              className={`grid h-7 w-7 shrink-0 place-items-center rounded-full text-xs font-black ${
                mission.done ? "bg-emerald-400 text-black" : "bg-white/10 text-white/70"
              }`}
            >
              {mission.done ? <Check className="h-4 w-4" /> : missions.indexOf(mission) + 1}
            </span>
            <span className={`min-w-0 flex-1 text-[13px] font-bold ${mission.done ? "text-white/60 line-through" : "text-white/80"}`}>{mission.title}</span>
            {!mission.done && (
              <button
                type="button"
                onClick={() => onGo(mission.id)}
                className="inline-flex min-h-9 shrink-0 items-center gap-1 rounded-xl border border-white/15 px-3 text-xs font-extrabold text-white/70 transition-colors hover:bg-white/10"
              >
                {mission.cta}
              </button>
            )}
          </li>
        ))}
      </ol>

      {allDone && (
        <p className="mt-3 flex items-center gap-2 text-xs text-emerald-300">
          <PartyPopper className="h-4 w-4" /> Dica: gere 3 artes por semana e poste uma a cada 2 dias.
        </p>
      )}
    </section>
  );
}
