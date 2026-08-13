export const START_PRODUCT_IDS = new Set([
  "prod_TkvaozfpkAcbpM",
  "start_ticto",
  "monthly_access_ticto",
]);

export const ELITE_PRODUCT_IDS = new Set([
  "prod_UTFsXcKq8m0mol",
  "prod_UTSmPe3GPt8iHt",
  "prod_UTFlCWzNqvqSNx",
  "hotmart_elite",
  "elite_ticto",
  "monthly_access_pix",
  "annual_access_pix",
]);

export const PRIMARY_ADMIN_EMAIL = "lucashenriquephd@gmail.com";

export function isPrimaryAdminEmail(email?: string | null) {
  return email?.trim().toLowerCase() === PRIMARY_ADMIN_EMAIL;
}

export function isEliteProduct(productId?: string | null) {
  if (!productId) return false;
  return ELITE_PRODUCT_IDS.has(productId.trim());
}

export function isStartProduct(productId?: string | null) {
  if (!productId) return false;
  return START_PRODUCT_IDS.has(productId.trim());
}

export function hasEliteAccess(subscription: { subscribed: boolean; productId: string | null }) {
  return subscription.subscribed && isEliteProduct(subscription.productId);
}

export function hasStartAccess(subscription: { subscribed: boolean; productId: string | null }) {
  return subscription.subscribed && isStartProduct(subscription.productId);
}

// ─── Preços reais dos produtos (fonte: Stripe Dashboard) ─────────────────────
// Nunca use valores hard-coded fora desta função.
export function getPlanLabel(
  plan: "elite" | "start" | "inactive" | "trial_expired" | string | null | undefined,
): string {
  switch (plan) {
    case "elite": return "Plano Elite";
    case "start": return "Plano Start";
    case "trial_expired": return "Trial Vencido";
    default: return "Gratuito";
  }
}

export function getPlanValue(
  plan: "elite" | "start" | "inactive" | "trial_expired" | string | null | undefined,
  billingCycle: string | null | undefined,
  planAmountCents?: number | null,
): string {
  // Prioridade 1: valor real do Stripe (em centavos → reais)
  if (planAmountCents && planAmountCents > 0) {
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" })
      .format(planAmountCents / 100);
  }

  const cycle = (billingCycle || "").toLowerCase();

  // Prioridade 2: derivar do plano + ciclo
  if (plan === "elite") {
    if (cycle === "year" || cycle === "yearly" || cycle === "annual") return "R$ 1.597,00/ano";
    if (cycle === "semester" || cycle === "semiannual") return "R$ 997,00/sem.";
    return "R$ 197,00/mês";
  }
  if (plan === "start") return "R$ 97,00/mês";
  return "Gratuito";
}
