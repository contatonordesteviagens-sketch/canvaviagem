import { ELITE_OFFER } from "@/lib/eliteOffer";

export type CheckoutCycle = "monthly" | "semiannual" | "annual";

export function isCheckoutCycle(value: unknown): value is CheckoutCycle {
  return value === "monthly" || value === "semiannual" || value === "annual";
}

/** Dados exibidos no resumo da página de pagamento. Preços vêm de ELITE_OFFER (fonte única). */
export const CHECKOUT_PLANS: Record<CheckoutCycle, {
  name: string;
  price: string;
  priceLong: string;
  per: string;
  billing: string;
  valueCents: number;
}> = {
  monthly: {
    name: "Elite Mensal",
    price: ELITE_OFFER.monthlyPrice,
    priceLong: "R$ 97,00",
    per: "/mês",
    billing: "Cobrado todo mês",
    valueCents: 9700,
  },
  semiannual: {
    name: "Elite Semestral",
    price: ELITE_OFFER.semiannualPrice,
    priceLong: "R$ 347,00",
    per: "/6 meses",
    billing: "Cobrado a cada 6 meses",
    valueCents: 34700,
  },
  annual: {
    name: "Elite Anual",
    price: ELITE_OFFER.annualPrice,
    priceLong: "R$ 482,00",
    per: "/ano",
    billing: "Cobrado uma vez por ano",
    valueCents: 48200,
  },
};

export type CheckoutOffer = "black-friday" | null;

/** Black Friday: mesmos planos com 50%. A oferta vem da URL e o servidor confirma o valor cobrado. */
export const BLACK_FRIDAY_PLANS: typeof CHECKOUT_PLANS = {
  monthly: { ...CHECKOUT_PLANS.monthly, price: "R$ 48,50", priceLong: "R$ 48,50", valueCents: 4850 },
  semiannual: { ...CHECKOUT_PLANS.semiannual, price: "R$ 173,50", priceLong: "R$ 173,50", valueCents: 17350 },
  annual: { ...CHECKOUT_PLANS.annual, price: "R$ 241", priceLong: "R$ 241,00", valueCents: 24100 },
};

/** A oferta fecha sozinha às 23h59 de 30/11 (Brasília). As funções create-checkout e woovi têm a mesma data. */
export const isBlackFridayOpen = () => Date.now() < Date.parse("2026-12-01T03:00:00Z");

export const plansFor = (offer: CheckoutOffer) => (offer ? BLACK_FRIDAY_PLANS : CHECKOUT_PLANS);

export function checkoutPath(cycle: CheckoutCycle, method?: "cartao" | "pix", offer: CheckoutOffer = null) {
  const params = new URLSearchParams({ plano: cycle });
  if (method) params.set("metodo", method);
  if (offer) params.set("oferta", offer);
  return `/checkout?${params.toString()}`;
}
