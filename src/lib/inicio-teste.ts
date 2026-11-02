// Teste da /inicio: parte dos visitantes testa a arte na primeira página, o resto vê a página atual.
// O grupo fica guardado no aparelho. Com ?arte=1 ou ?arte=0 a pessoa escolhe o grupo e fica fora da conta.
import { trackEvent } from "@/hooks/useAnalyticsEvents";

export type InicioVariant = "arte" | "atual";
export type InicioStep = "visita" | "destino" | "logo" | "artes" | "email" | "quiz" | "conta";

const STORAGE_KEY = "cv-inicio-teste";
/** Fatia dos visitantes novos que vê a arte: 0 desliga o sorteio, 0.5 divide meio a meio. */
export const ARTE_SHARE = 1;

type Stored = { variant: InicioVariant; manual: boolean };

function read(): Stored | null {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null") as Stored | null;
    return parsed?.variant === "arte" || parsed?.variant === "atual" ? parsed : null;
  } catch {
    return null;
  }
}

/** Sem storage não dá para manter o grupo entre as telas: a pessoa fica na página atual e não entra na conta. */
export function resolveInicioVariant(search: string): InicioVariant {
  const forced = new URLSearchParams(search).get("arte");
  const stored = read();
  // Sorteio desligado: ninguém entra na conta nem fica preso a um grupo antes de o teste começar.
  if (forced !== "1" && forced !== "0" && !stored && ARTE_SHARE <= 0) return "atual";
  const current = forced === "1" || forced === "0"
    ? { variant: forced === "1" ? "arte" : "atual", manual: true } as Stored
    : stored ?? { variant: Math.random() < ARTE_SHARE ? "arte" : "atual", manual: false } as Stored;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
    return current.variant;
  } catch {
    return "atual";
  }
}

/** De onde veio a visita: campanha do link, anúncio do Meta ou o site anterior. */
function origemDaVisita() {
  const params = new URLSearchParams(window.location.search);
  if (params.get("utm_source")) return params.get("utm_source");
  if (params.has("fbclid")) return "meta";
  try {
    return document.referrer ? new URL(document.referrer).hostname : "direto";
  } catch {
    return "direto";
  }
}

export function trackInicioTeste(step: InicioStep) {
  const current = read();
  if (!current) return;
  // Prévia do Lovable e site local não são visitantes: ficam fora da conta, como quem escolheu o grupo.
  const isVisitor = /(^|\.)canvaviagem\.com$/.test(window.location.hostname);
  void trackEvent("inicio_teste", {
    variant: current.variant,
    step,
    manual: current.manual || !isVisitor,
    ...(step === "visita" ? { origem: origemDaVisita() } : {}),
  });
}
