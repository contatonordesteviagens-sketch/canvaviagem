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
