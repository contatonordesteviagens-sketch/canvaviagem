import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const root = process.cwd();
const failures = [];

const read = (path) => readFileSync(join(root, path), "utf8").replace(/\r\n?/g, "\n");
const requireText = (path, needle, message) => {
  if (!read(path).includes(needle)) failures.push(`${path}: ${message}`);
};
const rejectText = (path, needle, message) => {
  if (read(path).includes(needle)) failures.push(`${path}: ${message}`);
};

const extractSet = (source, name) => {
  const block = source.match(new RegExp(`export const ${name} = new Set\\(\\[([\\s\\S]*?)\\]\\)`));
  if (!block) return [];
  return [...block[1].matchAll(/"([^"]+)"/g)].map((match) => match[1]).sort();
};

const walk = (directory) => {
  const output = [];
  for (const name of readdirSync(directory)) {
    const path = join(directory, name);
    const stat = statSync(path);
    if (stat.isDirectory()) output.push(...walk(path));
    else if (/\.(ts|tsx|js|mjs)$/.test(name)) output.push(path);
  }
  return output;
};

const frontendAccess = read("src/lib/planAccess.ts");
const serverAccess = read("supabase/functions/_shared/planAccess.ts");
const frontendElite = extractSet(frontendAccess, "ELITE_PRODUCT_IDS");
const serverElite = extractSet(serverAccess, "ELITE_PRODUCT_IDS");
const frontendStart = extractSet(frontendAccess, "START_PRODUCT_IDS");
const serverStart = extractSet(serverAccess, "START_PRODUCT_IDS");

if (JSON.stringify(frontendElite) !== JSON.stringify(serverElite)) {
  failures.push("Elite product IDs differ between browser and server.");
}
if (JSON.stringify(frontendStart) !== JSON.stringify(serverStart)) {
  failures.push("Start product IDs differ between browser and server.");
}
for (const path of ["src/lib/planAccess.ts", "supabase/functions/_shared/planAccess.ts"]) {
  requireText(path, "isPrimaryAdminEmail", "primary administrator identity must be centralized.");
}
requireText(
  "supabase/functions/fabrica-entitlements/index.ts",
  "Boolean(adminRole) || isPrimaryAdminEmail(userEmail)",
  "server entitlements must preserve primary administrator access.",
);
requireText(
  "supabase/functions/_shared/fabricaAccess.ts",
  "adminRole || isPrimaryAdminEmail(userEmail)",
  "Elite-only Fabrica APIs must preserve primary administrator access.",
);
requireText(
  "supabase/migrations/20260813153000_align_primary_admin_fabrica_access.sql",
  "INSERT INTO public.user_roles",
  "primary administrator role must be repaired in the database.",
);

requireText(
  "src/contexts/EntitlementsContext.tsx",
  "const FREE_LIMITS = { ad_export: 3, carousel_export: 1, projects: 1 };",
  "browser fallback must expose 3 ad exports, 1 carousel export and 1 project.",
);
for (const capability of [
  '"library.premium.open"',
  '"tools.basic.use"',
  '"tools.elite.use"',
]) {
  requireText(
    "src/contexts/EntitlementsContext.tsx",
    capability,
    `browser entitlement matrix is missing ${capability}.`,
  );
  requireText(
    "supabase/functions/fabrica-entitlements/index.ts",
    capability,
    `server entitlement matrix is missing ${capability}.`,
  );
}
requireText(
  "src/contexts/EntitlementsContext.tsx",
  '"library.premium.open": elite || start',
  "Start must retain the paid media library.",
);
requireText(
  "src/contexts/EntitlementsContext.tsx",
  '"tools.elite.use": elite',
  "Start must not inherit Elite-only AI tools.",
);
requireText(
  "src/lib/premium-utils.ts",
  "FREE_CAPTION_IDS",
  "free captions must use stable IDs instead of list position.",
);
requireText(
  "src/lib/premium-utils.ts",
  "FREE_FEED_TEMPLATE_IDS",
  "free art templates must use stable IDs instead of list position.",
);
rejectText(
  "src/lib/premium-utils.ts",
  "index >=",
  "free content must never depend on its visual list position.",
);
const premiumCardSource = read("src/components/canva/PremiumCard.tsx");
const guardedPremiumActions = premiumCardSource.match(/if \(onPremiumRequired\)/g) ?? [];
if (guardedPremiumActions.length < 3) {
  failures.push("PremiumCard: card, caption and Drive actions must all obey the premium gate.");
}
requireText(
  "src/components/UpgradePromptDialog.tsx",
  'isGuest && isPremiumOnlyFeature',
  "premium-only guest actions must explain the paid plan instead of promising access after free signup.",
);
requireText(
  "src/components/UpgradePromptDialog.tsx",
  'isGuest && !isPremiumOnlyFeature',
  "free guest quotas must still preserve the account-creation handoff.",
);
for (const [needle, label] of [
  ["ad_export: 3", "3 ad exports"],
  ["carousel_export: 1", "1 carousel export"],
  ["projects: 1", "1 saved project"],
]) {
  requireText("supabase/functions/fabrica-entitlements/index.ts", needle, `server limit must be ${label}.`);
}

for (const productId of frontendElite) {
  requireText(
    "supabase/migrations/20260729170000_freemium_entitlements.sql",
    `'${productId}'`,
    `SQL entitlement catalog is missing ${productId}.`,
  );
}

rejectText("src/lib/planAccess.ts", '.includes("elite")', "plan access must use exact product IDs.");
rejectText(
  "supabase/functions/_shared/planAccess.ts",
  '.includes("elite")',
  "server plan access must use exact product IDs.",
);
for (const [routine, label] of [
  ["publish_fabrica_crm_form", "CRM form publishing"],
  ["publish_fabrica_site", "site publishing"],
  ["promote_fabrica_legacy_lead", "legacy lead promotion"],
]) {
  const migration = read("supabase/migrations/20260729170000_freemium_entitlements.sql");
  const securityInvoker = new RegExp(
    `ALTER\\s+FUNCTION\\s+public\\.${routine}\\s*\\([^)]*\\)\\s+SECURITY\\s+INVOKER`,
    "i",
  );
  if (!securityInvoker.test(migration)) {
    failures.push(`SQL migration: ${label} must explicitly obey RLS.`);
  }
}
requireText(
  "supabase/migrations/20260729170000_freemium_entitlements.sql",
  "CREATE TRIGGER enforce_fabrica_project_limit",
  "free project quota needs a concurrency-safe database trigger.",
);
requireText(
  "supabase/migrations/20260729170000_freemium_entitlements.sql",
  "CREATE OR REPLACE FUNCTION public.materialize_fabrica_published_site",
  "legacy sites need an atomic, authenticated project recovery RPC.",
);
requireText(
  "supabase/migrations/20260729170000_freemium_entitlements.sql",
  "app.fabrica_recovery_site_id",
  "the project-limit exception must be scoped to the recovery transaction.",
);
requireText(
  "supabase/migrations/20260729170000_freemium_entitlements.sql",
  "CREATE OR REPLACE FUNCTION public.delete_fabrica_project",
  "project deletion must preserve CRM submissions through the owner-validated RPC.",
);
requireText(
  "supabase/migrations/20260729170000_freemium_entitlements.sql",
  "OR public.is_admin()",
  "new RLS policies must preserve administrator access.",
);
const freemiumMigration = read("supabase/migrations/20260729170000_freemium_entitlements.sql");
const projectDeleteStatements = freemiumMigration.match(/DELETE FROM public\.fabrica_diagnosticos/g) ?? [];
if (projectDeleteStatements.length !== 1) {
  failures.push("SQL migration: project deletion must exist only in the explicit owner-validated RPC.");
}
requireText(
  "supabase/migrations/20260729170000_freemium_entitlements.sql",
  "DELETE FROM public.fabrica_diagnosticos\n  WHERE id = p_project_id\n    AND user_id = current_user_id;",
  "explicit project deletion must require both the selected project and authenticated owner.",
);
rejectText(
  "supabase/migrations/20260729170000_freemium_entitlements.sql",
  "DELETE FROM public.crm_form_submissions",
  "freemium migration must never delete captured leads.",
);

requireText(
  "supabase/functions/fabrica-search-photos/index.ts",
  "access.ok ? 30 : 8",
  "guest preview photo search must have a stricter server-side rate limit.",
);
requireText(
  "supabase/functions/fabrica-pexels-search/index.ts",
  "verifyFabricaAuthenticatedAccess",
  "the authenticated-only photo endpoint must remain protected.",
);
requireText(
  "supabase/functions/vendedor-generate-response/index.ts",
  "verifyFabricaEliteAccess",
  "Vendedor IA must be enforced as Elite on the server.",
);
requireText(
  "src/pages/vendedor-ia/VendedorIA.tsx",
  'can("vendedor.use")',
  "Vendedor IA client access must use the exact Elite entitlement.",
);
rejectText(
  "src/pages/vendedor-ia/VendedorIA.tsx",
  "usage.count >= 10",
  "Elite Vendedor IA access must not have a stale browser-only daily limit.",
);
requireText(
  "src/contexts/AuthContext.tsx",
  "isSubscriptionSnapshotCurrent",
  "cached subscription access must expire with its saved trial or billing period.",
);
requireText(
  "supabase/functions/create-checkout/index.ts",
  "const origin = getAppOrigin();",
  "checkout redirects must use the configured application origin.",
);
requireText(
  "supabase/functions/create-checkout/index.ts",
  "return_to",
  "checkout must preserve the blocked feature return path.",
);
requireText(
  "supabase/functions/create-checkout/index.ts",
  "billingCycle: requestedCycle",
  "checkout confirmation must preserve the purchased billing cycle for accurate analytics.",
);
requireText(
  "supabase/functions/create-checkout/index.ts",
  'end_behavior: { missing_payment_method: "cancel" as const }',
  "trials without an attached payment method must cancel at trial end.",
);
requireText(
  "supabase/functions/stripe-webhook/index.ts",
  ': "past_due";',
  "failed subscription invoices must revoke Elite access immediately.",
);
const stripeWebhookSource = read("supabase/functions/stripe-webhook/index.ts");
const subscriptionUpdatedHandler = stripeWebhookSource.match(
  /async function handleSubscriptionUpdated[\s\S]*?(?=async function handleSubscriptionDeleted)/,
)?.[0] ?? "";
for (const checkoutOnlyIdentifier of ["authoritativeSubscription", "session.", "stripeSubscriptionId", "sha256Hex(email)"]) {
  if (subscriptionUpdatedHandler.includes(checkoutOnlyIdentifier)) {
    failures.push(`stripe-webhook: subscription.updated references checkout-only identifier ${checkoutOnlyIdentifier}.`);
  }
}
requireText(
  "src/pages/Inicio2.tsx",
  'searchParams.get("upgrade")',
  "the sales page must adapt its message to the blocked feature.",
);
requireText(
  "src/pages/Obrigado.tsx",
  'track("returned_to_feature"',
  "purchase confirmation must return customers to the feature they unlocked.",
);
rejectText(
  "supabase/functions/create-checkout/index.ts",
  'req.headers.get("origin")',
  "checkout must not trust arbitrary browser origins.",
);
rejectText(
  "supabase/functions/create-checkout/index.ts",
  "encodeURIComponent(user.email",
  "checkout return URLs must not expose customer email.",
);
rejectText(
  "src/pages/Inicio2.tsx",
  "window.location.assign(fallbackUrl)",
  "the canonical checkout must not fall back to a direct Payment Link.",
);
requireText(
  "src/contexts/EntitlementsContext.tsx",
  "const buildGuestSnapshot",
  "guests need explicit local preview permissions instead of account fallbacks.",
);
rejectText(
  "src/contexts/EntitlementsContext.tsx",
  "snapshot.capabilities.unlimited",
  "usage reservations must always be confirmed by the server.",
);
requireText(
  "src/contexts/EntitlementsContext.tsx",
  "if (isAdmin) {",
  "administrator exports must bypass free-tier metering failures.",
);
requireText(
  "src/contexts/EntitlementsContext.tsx",
  "isAdmin || Boolean(snapshot.capabilities[capability])",
  "administrator capabilities must remain fully enabled in the browser.",
);
requireText(
  "src/hooks/useFabricaContext.tsx",
  'const GUEST_USER_ID = "__canva_viagem_guest__";',
  "guest drafts must use an isolated local namespace.",
);
requireText(
  "src/hooks/useFabricaContext.tsx",
  "pendingGuestImportProjectRef",
  "guest drafts must survive until cloud persistence is confirmed.",
);
requireText(
  "src/hooks/useFabricaDiagnosticos.ts",
  '.rpc("materialize_fabrica_published_site"',
  "the browser must use the atomic site-recovery RPC.",
);
requireText(
  "src/lib/fabrica-project-deletion.ts",
  '.rpc("delete_fabrica_project"',
  "project deletion must not depend on Elite-only direct CRM mutations.",
);
for (const path of ["src/pages/Fabrica.tsx", "src/pages/FabricaES.tsx"]) {
  rejectText(path, "<Navigate ", "Fabrica must remain open for guest configuration.");
}
rejectText(
  "src/pages/Index.tsx",
  "/auth?redirect=/fabrica",
  "the free creation CTA must open the guest Fabrica preview before requiring an account.",
);
rejectText(
  "src/components/canva/BottomNav.tsx",
  'navigate("/auth")',
  "the Fabrica tab must remain available to guests.",
);
for (const path of [
  "src/pages/fabrica/Phase3ArtFactory.tsx",
  "src/pages/fabrica/Phase3ArtFactoryES.tsx",
]) {
  requireText(path, "isAdPreviewLocked", "guest and exhausted ad previews must be protected.");
  requireText(path, 'reserve("ad_export"', "ad downloads must reserve server-side quota.");
  requireText(path, "await commit(reservation.reservationId)", "ad downloads must commit server-side quota.");
  requireText(path, "release(reservation.reservationId)", "failed ad downloads must release reservations.");
  requireText(
    path,
    "Boolean(reservation.unlimited) && isBatchMode",
    "batch downloads must use the current server entitlement, never a stale browser snapshot.",
  );
}
requireText(
  "src/components/fabrica/F1CarouselBuilder.tsx",
  "isCarouselPreviewLocked",
  "guest and exhausted carousel previews must be protected.",
);
requireText("src/components/fabrica/F1CarouselBuilder.tsx", 'reserve("carousel_export"', "carousel downloads must reserve server-side quota.");
requireText("src/components/fabrica/F1CarouselBuilder.tsx", "await commit(reservation.reservationId)", "carousel downloads must commit server-side quota.");
requireText(
  "supabase/functions/fabrica-generate-ad/index.ts",
  "verifyFabricaEliteAccess",
  "AI image generation must be enforced as Elite on the server.",
);
rejectText(
  "supabase/functions/fabrica-generate-ad/index.ts",
  "userGeminiKey",
  "provider secrets must never be accepted from the browser request body.",
);

const secretPatterns = [
  [/AIza[0-9A-Za-z_-]{20,}/, "Google API key"],
  [/sk_live_[0-9A-Za-z]+/, "Stripe live secret"],
  [/abc_prod_[0-9A-Za-z]+/, "AbacatePay production secret"],
];
for (const absolutePath of walk(join(root, "src"))) {
  const source = readFileSync(absolutePath, "utf8");
  for (const [pattern, label] of secretPatterns) {
    if (pattern.test(source)) {
      failures.push(`${relative(root, absolutePath)}: exposed ${label}.`);
    }
  }
}

if (failures.length) {
  console.error("Freemium contract validation failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("Freemium contract OK: 1 project, 3 ad exports, 1 carousel export, exact plans, protected APIs.");
