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

type StripeLikeItem = {
  price?: { product?: string | { id?: string | null } | null } | null;
};

const productIdOf = (item: StripeLikeItem): string | null => {
  const product = item.price?.product;
  if (typeof product === "string") return product;
  return product?.id ?? null;
};

/** Resolve only explicitly supported products, with Elite taking precedence over Start. */
export function resolveStripePlanProduct(items?: StripeLikeItem[] | null): string | null {
  const productIds = (items ?? []).map(productIdOf).filter((id): id is string => Boolean(id));
  return productIds.find(isEliteProduct) ?? productIds.find(isStartProduct) ?? null;
}

export function isPaidSubscriptionCurrent(subscription: {
  status?: string | null;
  current_period_end?: string | number | null;
  trial_end?: string | number | null;
  trial_ends_at?: string | number | null;
}, now = Date.now()) {
  const toMillis = (value?: string | number | null) => {
    if (typeof value === "number") return value * 1000;
    return value ? Date.parse(value) : Number.NaN;
  };

  if (subscription.status === "trialing") {
    const trialEnd = toMillis(subscription.trial_end ?? subscription.trial_ends_at);
    return Number.isFinite(trialEnd) && trialEnd > now;
  }
  if (subscription.status !== "active") return false;

  const periodEnd = toMillis(subscription.current_period_end);
  return !subscription.current_period_end || (Number.isFinite(periodEnd) && periodEnd > now);
}
