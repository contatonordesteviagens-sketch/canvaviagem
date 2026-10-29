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

export function checkoutPath(cycle: CheckoutCycle, method?: "cartao" | "pix") {
  const params = new URLSearchParams({ plano: cycle });
  if (method) params.set("metodo", method);
  return `/checkout?${params.toString()}`;
}
