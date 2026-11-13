// Teste da /inicio: parte dos visitantes testa a arte na primeira página, o resto vê a página atual.
// O grupo fica guardado no aparelho. Com ?arte=1 ou ?arte=0 a pessoa escolhe o grupo e fica fora da conta.
import { trackEvent } from "@/hooks/useAnalyticsEvents";
import { trackFunnelEvent } from "@/lib/meta-pixel-sales";

export type InicioVariant = "arte" | "atual";
export type InicioStep = "visita" | "destino" | "logo" | "artes" | "botao" | "tela_email" | "email" | "quiz" | "quiz_tela" | "resposta" | "plano" | "pagar" | "conta";

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

/** lang, preco e moeda só vêm do quiz em espanhol (preço próprio); sem eles vale o preço em reais. */
export type InicioExtra = { tela?: string; valor?: string; lang?: string; preco?: number; moeda?: string };

const PLAN_VALUES: Record<string, number> = { monthly: 97, semiannual: 347, annual: 482 };
const REGISTRO_KEY = "cv-pixel-registro";

/**
 * Cada etapa do funil vira um evento no pixel do Canva Viagem.
 * Visita (ViewContent), e-mail (Lead), início do pagamento (InitiateCheckout) e compra (Purchase) já saem nas próprias telas.
 */
function sendToPixel(step: InicioStep, extra?: InicioExtra) {
  const tela = extra?.tela;
  const valor = extra?.valor;
  switch (step) {
    case "destino": return trackFunnelEvent("CustomizeProduct", { content_name: "destino" });
    case "logo": return trackFunnelEvent("EnviouLogo", {}, true);
    case "artes": return trackFunnelEvent("ViuArtes", {}, true);
    case "botao": return trackFunnelEvent("CliqueBotao", { local: valor ?? "" }, true);
    case "tela_email": return trackFunnelEvent("TelaEmail", {}, true);
    case "quiz": return trackFunnelEvent("IniciouQuiz", {}, true);
    case "quiz_tela": return trackFunnelEvent("TelaQuiz", { tela: tela ?? "" }, true);
    case "resposta": return trackFunnelEvent("RespostaQuiz", { pergunta: tela ?? "", resposta: valor ?? "" }, true);
    case "plano": return trackFunnelEvent("AddToCart", { value: extra?.preco ?? PLAN_VALUES[valor ?? ""] ?? 0, currency: extra?.moeda ?? "BRL", content_name: `Canva Viagem ${valor ?? ""}` });
    case "pagar": return trackFunnelEvent("AddPaymentInfo", { value: extra?.preco ?? PLAN_VALUES[tela ?? ""] ?? 0, currency: extra?.moeda ?? "BRL", content_name: `Canva Viagem ${tela ?? ""}`, content_category: valor ?? "" });
    case "conta": {
      // Uma vez por aparelho: a conta é marcada de novo a cada abertura do quiz.
      try {
        if (localStorage.getItem(REGISTRO_KEY)) return;
        localStorage.setItem(REGISTRO_KEY, "1");
      } catch { /* sem storage, envia mesmo assim */ }
      return trackFunnelEvent("CompleteRegistration", { content_name: "quiz" });
    }
    default: return;
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

export function trackInicioTeste(step: InicioStep, extra?: InicioExtra) {
  // Quem entra direto pelo link do quiz ou do e-mail, sem passar pela página, também conta no funil.
  const current = read() ?? { variant: "arte" as InicioVariant, manual: false };
  // Prévia do Lovable e site local não são visitantes: ficam fora da conta, como quem escolheu o grupo.
  const isVisitor = /(^|\.)canvaviagem\.com$/.test(window.location.hostname);
  sendToPixel(step, extra);
  void trackEvent("inicio_teste", {
    variant: current.variant,
    step,
    manual: current.manual || !isVisitor,
    ...(step === "visita" ? { origem: origemDaVisita() } : {}),
    ...extra,
  });
}
