import Stripe from "https://esm.sh/stripe@18.5.0";

export type SubscriptionRow = {
  user_id?: string | null;
  status?: string | null;
  product_id?: string | null;
  current_period_end?: string | null;
  stripe_customer_id?: string | null;
  stripe_subscription_id?: string | null;
  billing_provider?: string | null;
  billing_cycle?: string | null;
  trial_ends_at?: string | null;
};

export const isPeriodCurrent = (end?: string | null) => !end || new Date(end).getTime() > Date.now();

/** A local row that says "active" but whose paid period already ended is stale data, not a real block. */
export const isStaleSubscription = (row: SubscriptionRow | null) =>
  Boolean(row && row.status === "active" && row.current_period_end && !isPeriodCurrent(row.current_period_end));

const cycleOf = (subscription: Stripe.Subscription) => {
  const recurring = subscription.items.data[0]?.price?.recurring;
  if (!recurring) return null;
  if (recurring.interval === "year") return "annual";
  if (recurring.interval === "month" && recurring.interval_count === 6) return "semiannual";
  if (recurring.interval === "month") return "monthly";
  return null;
};

export const periodEndOf = (subscription: Stripe.Subscription) => {
  const raw = (subscription as unknown as { current_period_end?: number }).current_period_end
    ?? subscription.items.data[0]?.current_period_end;
  return raw ? new Date(raw * 1000).toISOString() : null;
};

/**
 * Safety net for missed Stripe webhooks: re-reads the subscription straight from Stripe
 * and persists the fresh status/period. Returns the refreshed row (or the original one
 * when nothing could be refreshed). Never throws.
 */
export async function refreshSubscriptionFromStripe(
  db: { from: (table: string) => any },
  userId: string,
  row: SubscriptionRow | null,
): Promise<SubscriptionRow | null> {
  const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
  if (!stripeKey || !row) return row;
  if (!row.stripe_subscription_id && !row.stripe_customer_id) return row;

  try {
    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });
    let subscription: Stripe.Subscription | null = null;

    if (row.stripe_subscription_id) {
      subscription = await stripe.subscriptions.retrieve(row.stripe_subscription_id);
    }
    if ((!subscription || subscription.status === "canceled") && row.stripe_customer_id) {
      const list = await stripe.subscriptions.list({
        customer: row.stripe_customer_id,
        status: "all",
        limit: 20,
      });
      const live = list.data.find((candidate) =>
        candidate.status === "active" || candidate.status === "trialing"
      );
      if (live) subscription = live;
    }
    if (!subscription) return row;

    const refreshed: SubscriptionRow = {
      ...row,
      status: subscription.status,
      product_id: (subscription.items.data[0]?.price?.product as string | null) ?? row.product_id ?? null,
      current_period_end: periodEndOf(subscription),
      stripe_subscription_id: subscription.id,
      stripe_customer_id: typeof subscription.customer === "string"
        ? subscription.customer
        : row.stripe_customer_id ?? null,
      billing_provider: "stripe",
      billing_cycle: cycleOf(subscription) ?? row.billing_cycle ?? null,
    };

    await db.from("subscriptions").update({
      status: refreshed.status,
      product_id: refreshed.product_id,
      current_period_end: refreshed.current_period_end,
      stripe_subscription_id: refreshed.stripe_subscription_id,
      stripe_customer_id: refreshed.stripe_customer_id,
      billing_provider: refreshed.billing_provider,
      billing_cycle: refreshed.billing_cycle,
      updated_at: new Date().toISOString(),
    }).eq("user_id", userId);

    console.log("[STRIPE-REFRESH]", JSON.stringify({
      userId,
      from: { status: row.status, end: row.current_period_end },
      to: { status: refreshed.status, end: refreshed.current_period_end },
    }));

    return refreshed;
  } catch (error) {
    console.error("[STRIPE-REFRESH] failed", error);
    return row;
  }
}
