export const START_PRODUCT_IDS = new Set([
  "prod_TkvaozfpkAcbpM",
]);

export const ELITE_PRODUCT_IDS = new Set([
  "prod_UTFsXcKq8m0mol",
  "prod_UTSmPe3GPt8iHt",
  "prod_UTFlCWzNqvqSNx",
  "hotmart_elite",
]);
export function isEliteProduct(productId?: string | null) {
  if (!productId) return false;
  return ELITE_PRODUCT_IDS.has(productId) || productId.includes("ticto") || productId.includes("elite");
}
