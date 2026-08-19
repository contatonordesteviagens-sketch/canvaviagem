import { readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const failures = [];
const read = (path) => readFileSync(join(root, path), "utf8").replace(/\r\n?/g, "\n");

const requireText = (path, needle, message) => {
  if (!read(path).includes(needle)) failures.push(`${path}: ${message}`);
};

const rejectText = (path, needle, message) => {
  if (read(path).includes(needle)) failures.push(`${path}: ${message}`);
};

for (const [path, needle, message] of [
  ["src/App.tsx", '<ProtectedRoute requireSubscription><Index /></ProtectedRoute>', "the platform home must require an active subscription."],
  ["src/App.tsx", '<ProtectedRoute requireElite><Fabrica /></ProtectedRoute>', "the Fabrica must require Elite."],
  ["src/components/ProtectedRoute.tsx", '<Navigate to="/inicio" replace />', "blocked accounts must return to the sales page."],
  ["src/contexts/EntitlementsContext.tsx", '"fabrica.open": false', "guests must not receive a Fabrica preview."],
  ["src/lib/planAccess.ts", '"prod_TkvaozfpkAcbpM"', "the Start monthly product must be explicitly classified."],
  ["src/lib/planAccess.ts", '"prod_UTFsXcKq8m0mol"', "the Elite monthly product must be explicitly classified."],
  ["src/lib/planAccess.ts", '"prod_UTSmPe3GPt8iHt"', "the current Elite annual product must be explicitly classified."],
  ["src/lib/planAccess.ts", '"prod_UTFlCWzNqvqSNx"', "the legacy Elite annual product must be explicitly classified."],
  ["src/contexts/AuthContext.tsx", "cv-sub-cache-v3-", "the subscriber access fix must invalidate stale negative subscription caches."],
  ["supabase/functions/check-subscription/index.ts", "localSubscriptionRecord?.stripe_customer_id", "Stripe verification must prefer the customer ID already linked to the authenticated user."],
  ["supabase/functions/check-subscription/index.ts", "...customers.data.map((customer) => customer.id)", "Stripe verification must retain email lookup as a recovery path for legacy subscribers."],
  ["supabase/functions/create-checkout/index.ts", "client_reference_id: user.id", "checkout must bind the Stripe session to the authenticated user."],
  ["supabase/functions/stripe-webhook/index.ts", "getUserById(referencedUserId)", "the signed Stripe webhook must provision the authenticated checkout user by stable ID."],
  ["supabase/functions/fabrica-entitlements/index.ts", 'error: "Plano Elite necessário"', "the entitlement API must reject unpaid reservations."],
  ["supabase/functions/fabrica-entitlements/index.ts", 'if (isStartProduct(subscription.product_id)) return "start_legacy";', "Start subscribers must receive Start capabilities."],
  ["supabase/functions/_shared/fabricaAccess.ts", "return verifyFabricaEliteAccess(req, corsHeaders);", "authenticated Fabrica APIs must enforce Elite access."],
  ["supabase/functions/_shared/fabricaAccess.ts", "isEliteProduct(subscription?.product_id) && isCurrent", "protected Fabrica APIs must require an explicit Elite product."],
]) {
  requireText(path, needle, message);
}

for (const [path, needle, message] of [
  ["src/contexts/EntitlementsContext.tsx", "FREE_LIMITS", "browser free quotas must not exist."],
  ["src/contexts/EntitlementsContext.tsx", "elite_trial", "trial access must not exist in the browser."],
  ["supabase/functions/fabrica-entitlements/index.ts", "FREE_LIMITS", "server free quotas must not exist."],
  ["supabase/functions/fabrica-entitlements/index.ts", "reserve_fabrica_usage", "unpaid usage reservations must not be created."],
  ["supabase/functions/create-checkout/index.ts", "trial_period_days", "checkout must not create trials."],
  ["supabase/functions/create-checkout/index.ts", "trial_settings", "checkout must not configure trials."],
  ["supabase/functions/create-checkout/index.ts", "trialEligible", "checkout must not contain trial eligibility logic."],
  ["supabase/functions/verify-magic-link/index.ts", 'status: "trialing"', "magic-link verification must not grant trial access."],
  ["src/contexts/EntitlementsContext.tsx", 'billingProvider === "stripe"', "the browser must not promote every Stripe product to Elite."],
  ["supabase/functions/fabrica-entitlements/index.ts", 'subscription.billing_provider === "stripe"', "the entitlement API must not promote every Stripe product to Elite."],
  ["supabase/functions/_shared/fabricaAccess.ts", 'subscription?.billing_provider === "stripe"', "protected APIs must not promote every Stripe product to Elite."],
]) {
  rejectText(path, needle, message);
}

const salesFiles = [
  "src/pages/Inicio2.tsx",
  "src/pages/InicioES.tsx",
  "src/pages/AdsOfferLanding.tsx",
  "src/pages/SiteOfferLanding.tsx",
  "src/pages/OfferLanding.tsx",
  "src/components/PricingAccordion.tsx",
];
const forbiddenCopy = /teste gr[aá]tis|3 dias gr[aá]tis|3 d[ií]as gratis|conta gratuita|plano gr[aá]tis/i;
for (const path of salesFiles) {
  if (forbiddenCopy.test(read(path))) failures.push(`${path}: free-trial sales copy is still present.`);
}

if (failures.length) {
  console.error("Paid-access contract validation failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("Paid-access contract OK: no free quotas, no trial checkout, subscriber-only platform and Elite-only Fabrica.");
