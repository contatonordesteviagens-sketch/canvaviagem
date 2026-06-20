export const START_PRODUCT_IDS = new Set([
  "prod_TkvaozfpkAcbpM",
]);

export const ELITE_PRODUCT_IDS = new Set([
  "prod_UTFsXcKq8m0mol",
  "prod_UTSmPe3GPt8iHt",
  "prod_UTFlCWzNqvqSNx",
  "hotmart_elite",
]);

export const HOTMART_ELITE_PRODUCT_IDS = new Set(["7876791"]);
export const CANONICAL_HOTMART_ELITE_PRODUCT_ID = "hotmart_elite";

export function isEliteProduct(productId?: string | null) {
  if (!productId) return false;
  return ELITE_PRODUCT_IDS.has(productId) || productId.includes("ticto") || productId.includes("elite");
}

export function normalizeHotmartProductId(productId?: string | null): string | null {
  if (!productId) return null;
  if (HOTMART_ELITE_PRODUCT_IDS.has(productId)) return CANONICAL_HOTMART_ELITE_PRODUCT_ID;
  return null;
}
