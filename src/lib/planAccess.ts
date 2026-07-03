export const START_PRODUCT_IDS = new Set([
  "prod_TkvaozfpkAcbpM",
]);

export const ELITE_PRODUCT_IDS = new Set([
  "prod_UTFsXcKq8m0mol",
  "prod_UTSmPe3GPt8iHt",
  "prod_UTFlCWzNqvqSNx",
]);

export function isEliteProduct(productId?: string | null) {
  if (!productId) return false;
  return ELITE_PRODUCT_IDS.has(productId) || productId.includes("ticto") || productId.includes("elite") || productId.includes("admin");
}

export function isStartProduct(productId?: string | null) {
  if (!productId) return false;
  return START_PRODUCT_IDS.has(productId) || productId.includes("smart") || productId.includes("start") || productId.includes("basic");
}

export function hasEliteAccess(subscription: { subscribed: boolean; productId: string | null }) {
  return subscription.subscribed && isEliteProduct(subscription.productId);
}

export function hasStartAccess(subscription: { subscribed: boolean; productId: string | null }) {
  return subscription.subscribed && !hasEliteAccess(subscription);
}
