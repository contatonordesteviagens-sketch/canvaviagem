export const ELITE_OFFER = {
  landingPath: "/inicio2",
  monthlyPrice: "R$ 97",
  annualPrice: "R$ 347",
  annualMonthlyEquivalent: "R$ 28,91",
  yearlyMonthlyTotal: "R$ 1.164",
  annualSavings: "R$ 817",
  videoId: "R2MyCdox--I",
  monthlyCheckoutUrl: "URL_STRIPE_MENSAL",
  annualCheckoutUrl: "URL_STRIPE_ANUAL",
  startVideoCooldownMs: 30 * 60 * 1000,
};

export function shouldShowStartUpgradeVideo(now = Date.now()) {
  if (typeof window === "undefined") return false;
  const key = "cv-start-upgrade-video-last-seen";
  const lastSeen = Number(window.localStorage.getItem(key) || "0");
  const shouldShow = !lastSeen || now - lastSeen > ELITE_OFFER.startVideoCooldownMs;
  if (shouldShow) window.localStorage.setItem(key, String(now));
  return shouldShow;
}
