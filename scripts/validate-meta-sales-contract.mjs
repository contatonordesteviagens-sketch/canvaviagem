import { readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const read = (path) => readFileSync(join(root, path), "utf8").replace(/\r\n?/g, "\n");
const failures = [];
const requireText = (path, needle, message) => {
  if (!read(path).includes(needle)) failures.push(`${path}: ${message}`);
};
const rejectText = (path, needle, message) => {
  if (read(path).includes(needle)) failures.push(`${path}: ${message}`);
};

requireText("index.html", "fbq('init', '2120347238758199');", "primary Meta pixel must be initialized globally.");
rejectText("index.html", "fbq('track', 'PageView');", "global PageView must not duplicate the SPA route tracker.");
requireText("src/App.tsx", "<MetaPixelRouteTracker />", "every SPA route must emit PageView.");

for (const path of [
  "src/pages/TravelAgencyContentLanding.tsx",
  "src/pages/SiteOfferLanding.tsx",
  "src/pages/AdsOfferLanding.tsx",
  "src/pages/OfferLanding.tsx",
  "src/pages/Inicio2.tsx",
]) {
  requireText(path, 'trackMetaEvent("ViewContent"', "sales entry must emit ViewContent.");
  requireText(path, 'trackMetaEvent("InitiateCheckout"', "checkout CTA must emit InitiateCheckout.");
}

rejectText(
  "src/pages/TravelAgencyContentLanding.tsx",
  "buy.stripe.com",
  "carousel entry must use the canonical authenticated Stripe checkout.",
);
requireText(
  "src/pages/TravelAgencyContentLanding.tsx",
  'offer: "content"',
  "carousel checkout must preserve its offer attribution.",
);
requireText(
  "src/pages/Obrigado.tsx",
  'supabase.functions.invoke("verify-checkout-conversion"',
  "Purchase must be verified by Stripe before tracking.",
);
requireText("src/pages/Obrigado.tsx", 'trackMetaEvent("Purchase"', "verified checkout must emit Purchase.");
requireText("src/pages/Obrigado.tsx", 'trackMetaEvent("Subscribe"', "verified subscription must emit Subscribe.");
requireText(
  "supabase/functions/verify-checkout-conversion/index.ts",
  "sessionUserId === userId",
  "checkout conversion must belong to the authenticated user.",
);
requireText(
  "supabase/functions/verify-checkout-conversion/index.ts",
  'session.payment_status === "paid"',
  "checkout conversion must be paid.",
);

if (failures.length) {
  console.error("Meta sales tracking validation failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("Meta sales tracking OK: PageView, ViewContent, InitiateCheckout and verified Purchase/Subscribe.");
