import {
  isPaidSubscriptionCurrent,
  resolveStripePlanProduct,
} from "./planAccess.ts";

const assertEquals = (actual: unknown, expected: unknown, message: string) => {
  if (actual !== expected) throw new Error(`${message}: expected ${expected}, received ${actual}`);
};

Deno.test("multi-item subscriptions prefer a recognized Elite product", () => {
  const product = resolveStripePlanProduct([
    { price: { product: "prod_TkvaozfpkAcbpM" } },
    { price: { product: "unknown_addon" } },
    { price: { product: "prod_UTFsXcKq8m0mol" } },
  ]);
  assertEquals(product, "prod_UTFsXcKq8m0mol", "Elite must take precedence over Start");
});

Deno.test("unknown Stripe products never grant paid access", () => {
  assertEquals(
    resolveStripePlanProduct([{ price: { product: "unknown_product" } }]),
    null,
    "Unknown products must be rejected",
  );
});

Deno.test("active and current trialing subscriptions are valid", () => {
  const futureSeconds = Math.floor(Date.now() / 1000) + 3600;
  assertEquals(isPaidSubscriptionCurrent({ status: "active", current_period_end: futureSeconds }), true, "Active");
  assertEquals(isPaidSubscriptionCurrent({ status: "trialing", trial_end: futureSeconds }), true, "Trialing");
});

Deno.test("expired trials and non-paying states are blocked", () => {
  const pastSeconds = Math.floor(Date.now() / 1000) - 3600;
  assertEquals(isPaidSubscriptionCurrent({ status: "trialing", trial_end: pastSeconds }), false, "Expired trial");
  for (const status of ["canceled", "past_due", "unpaid", "paused", "incomplete"]) {
    assertEquals(isPaidSubscriptionCurrent({ status }), false, status);
  }
});