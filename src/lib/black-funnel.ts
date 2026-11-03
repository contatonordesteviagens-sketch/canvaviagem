// Funil da Black: a mesma página da /inicio, o mesmo e-mail e o mesmo quiz, com fundo preto e preço da Black.
// Quem entra por /black fica marcado no aparelho até voltar pela /inicio normal ou a oferta fechar.
import { isBlackFridayOpen, type CheckoutOffer } from "@/components/checkout/checkout-plans";

const KEY = "cv-funil-black";
export const BLACK_FUNNEL_PATH = "/black";

export function markBlackFunnel(on: boolean) {
  try {
    if (on) localStorage.setItem(KEY, "1");
    else localStorage.removeItem(KEY);
  } catch { /* sem storage: segue no preço normal */ }
}

export function isBlackFunnel() {
  try {
    return isBlackFridayOpen() && localStorage.getItem(KEY) === "1";
  } catch {
    return false;
  }
}

export const blackOffer = (): CheckoutOffer => (isBlackFunnel() ? "black-friday" : null);
