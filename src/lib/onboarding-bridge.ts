/**
 * Ponte entre o quiz de entrada (/onboarding) e a Fábrica.
 *
 * O quiz guarda as respostas no navegador antes do pagamento. Depois que a
 * pessoa assina, aproveitamos o destino e o momento da agência para ela não
 * começar a Fábrica do zero: o primeiro anúncio já sai com o destino dela.
 */
import type { FabricaState } from "@/hooks/useFabricaContext";

const QUIZ_KEY = "cv-onboarding-v2";
const DESTINO_KEY = "cv-onboarding-destino";
const LOGO_KEY = "cv-onboarding-logo";
const APPLIED_KEY = "cv-onboarding-aplicado";

// Mesmos rótulos usados no quiz (Onboarding.tsx).
const DESTINO_POR_GRUPO: Record<string, string> = {
  praia: "Porto de Galinhas",
  serra: "Gramado",
  internacional: "Cancún",
  cruzeiro: "Cruzeiro pelo litoral",
  excursao: "Excursão de fim de semana",
};

const TIPO_POR_MOMENTO: Record<string, FabricaState["agencyType"]> = {
  comecando: "autonoma",
  pouco: "autonoma",
  "todo-mes": "pequena",
  equipe: "media",
};

export interface OnboardingAnswers {
  destino: string;
  logo: string;
  destinosGrupo: string[];
  momento?: string;
  travas: string[];
  objetivo?: string;
}

export function readOnboardingAnswers(): OnboardingAnswers | null {
  try {
    const raw = localStorage.getItem(QUIZ_KEY);
    const destinoDigitado = (sessionStorage.getItem(DESTINO_KEY) || localStorage.getItem(DESTINO_KEY) || "").trim();
    const logo = sessionStorage.getItem(LOGO_KEY) || localStorage.getItem(LOGO_KEY) || "";
    if (!raw && !destinoDigitado && !logo) return null;
    const parsed = raw ? (JSON.parse(raw) as { answers?: Record<string, string[]> }) : {};
    const answers = parsed.answers || {};
    const destinosGrupo = answers.destinos || [];
    const destino = destinoDigitado || (destinosGrupo[0] ? DESTINO_POR_GRUPO[destinosGrupo[0]] : "") || "";
    return {
      destino,
      logo,
      destinosGrupo,
      momento: answers.momento?.[0],
      travas: answers.travas || [],
      objetivo: answers.objetivo?.[0],
    };
  } catch {
    return null;
  }
}

export function hasPendingOnboarding(): boolean {
  try {
    if (localStorage.getItem(APPLIED_KEY)) return false;
  } catch {
    return false;
  }
  return readOnboardingAnswers() !== null;
}

/** Monta o que a Fábrica pode herdar do quiz sem sobrescrever nada que já exista. */
export function buildFabricaPatchFromOnboarding(
  state: Pick<FabricaState, "destinos" | "agencyType" | "logoBase64">,
  answers: OnboardingAnswers,
): Partial<FabricaState> {
  const patch: Partial<FabricaState> = {};
  if (!(state.destinos || []).filter(Boolean).length && answers.destino) {
    patch.destinos = [answers.destino];
  }
  if (!state.logoBase64 && answers.logo) {
    patch.logoBase64 = answers.logo;
  }
  if (!state.agencyType && answers.momento && TIPO_POR_MOMENTO[answers.momento]) {
    patch.agencyType = TIPO_POR_MOMENTO[answers.momento];
  }
  return patch;
}

export function markOnboardingApplied() {
  try {
    localStorage.setItem(APPLIED_KEY, new Date().toISOString());
    localStorage.removeItem(LOGO_KEY);
  } catch {
    /* sem storage: na pior hipótese reaplica, e o patch não sobrescreve nada */
  }
}
