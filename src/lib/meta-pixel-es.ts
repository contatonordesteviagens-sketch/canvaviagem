// Meta Pixel ES (Spanish) - Separate tracking for Spanish-speaking users
// Pixel ID: 1560736461820497

declare global {
  interface Window {
    fbq: (...args: unknown[]) => void;
  }
}

const ES_PIXEL_ID = "1560736461820497";

// Track Purchase event for ES pixel only
export const trackESPurchase = (value: number, currency: string = 'USD') => {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('trackSingle', ES_PIXEL_ID, 'Purchase', {
      value,
      currency,
    });
    console.log(`[Meta ES Pixel] Purchase tracked: ${value} ${currency}`);
  }
};

// Track Subscribe event for ES pixel only
export const trackESSubscribe = (value: number, currency: string = 'USD', predictedLtv?: number) => {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('trackSingle', ES_PIXEL_ID, 'Subscribe', {
      value,
      currency,
      predicted_ltv: predictedLtv || value * 12,
    });
    console.log(`[Meta ES Pixel] Subscribe tracked: ${value} ${currency}, LTV: ${predictedLtv || value * 12}`);
  }
};

// Track InitiateCheckout event for ES pixel only
export const trackESInitiateCheckout = (value: number, currency: string = 'USD') => {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('trackSingle', ES_PIXEL_ID, 'InitiateCheckout', {
      value,
      currency,
    });
    console.log(`[Meta ES Pixel] InitiateCheckout tracked: ${value} ${currency}`);
  }
};

// Track ViewContent event for ES pixel only
export const trackESViewContent = (contentName?: string) => {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('trackSingle', ES_PIXEL_ID, 'ViewContent', {
      content_name: contentName || 'Página ES',
    });
    console.log(`[Meta ES Pixel] ViewContent tracked: ${contentName || 'Página ES'}`);
  }
};

// Track Lead event for ES pixel only
export const trackESLead = () => {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('trackSingle', ES_PIXEL_ID, 'Lead');
    console.log('[Meta ES Pixel] Lead tracked');
  }
};

// Track CompleteRegistration event for ES pixel only
export const trackESCompleteRegistration = () => {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('trackSingle', ES_PIXEL_ID, 'CompleteRegistration');
    console.log('[Meta ES Pixel] CompleteRegistration tracked');
  }
};
