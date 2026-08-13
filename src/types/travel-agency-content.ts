export type TravelAgencyBillingCycle = "monthly" | "semiannual" | "annual";

export type LandingAnalyticsPayload = Record<string, unknown>;

export type LandingSectionActions = {
  onScrollToPlans: (source: string) => void;
  onRecordEvent: (eventType: string, data?: LandingAnalyticsPayload) => void;
};

export type LandingCheckoutAction = {
  checkoutLoading: TravelAgencyBillingCycle | null;
  onCheckout: (cycle: TravelAgencyBillingCycle, value: number) => void;
};
