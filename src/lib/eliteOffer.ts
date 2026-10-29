export const ELITE_OFFER = {
  landingPath: "/inicio",
  monthlyPrice: "R$ 97",
  semiannualPrice: "R$ 347",
  annualPrice: "R$ 482",
  annualMonthlyEquivalent: "R$ 40,16",
  yearlyMonthlyTotal: "R$ 1.164",
  annualSavings: "R$ 682",
  videoId: "R2MyCdox--I",
  monthlyCheckoutUrl: "https://buy.stripe.com/fZucN6bma6QEeH96kI8so0c",
  semiannualCheckoutUrl: "https://buy.stripe.com/8x2cN60HwcaY2Yr38w8so0j",
  annualCheckoutUrl: "https://buy.stripe.com/6oUdRa0Hwa2Qcz1dNa8so0i",
  startVideoCooldownMs: 30 * 60 * 1000,
};

/**
 * Link da Stripe com a conta logada. Sem isso, quem entra com o Google num e-mail e paga
 * digitando outro (ou com erro, tipo ".con") recebe o acesso numa conta que não é a dele.
 * O stripe-webhook usa client_reference_id para achar o usuário certo.
 */
export function withCheckoutIdentity(checkoutUrl: string, user?: { id?: string | null; email?: string | null } | null) {
  const url = new URL(checkoutUrl);
  if (user?.id) url.searchParams.set("client_reference_id", user.id);
  if (user?.email) url.searchParams.set("prefilled_email", user.email);
  return url.toString();
}

export type UpgradeFeature =
  | "ad_export"
  | "carousel_export"
  | "site_publish"
  | "crm"
  | "voice"
  | "vendedor"
  | "premium_content"
  | "fabrica";

export function buildUpgradePath(feature: UpgradeFeature, returnTo?: string) {
  const params = new URLSearchParams({ upgrade: feature });
  if (returnTo?.startsWith("/")) params.set("returnTo", returnTo);
  return `${ELITE_OFFER.landingPath}?${params.toString()}`;
}

export function shouldShowStartUpgradeVideo(now = Date.now()) {
  if (typeof window === "undefined") return false;
  const key = "cv-start-upgrade-video-last-seen";
  const lastSeen = Number(window.localStorage.getItem(key) || "0");
  const shouldShow = !lastSeen || now - lastSeen > ELITE_OFFER.startVideoCooldownMs;
  if (shouldShow) window.localStorage.setItem(key, String(now));
  return shouldShow;
}
