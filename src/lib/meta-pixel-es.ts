// Meta Pixel ES (Spanish) - Separate tracking for Spanish-speaking users
// Pixel ID: 1560736461820497

declare global {
  interface Window {
    fbq: (...args: unknown[]) => void;
  }
}

const ES_PIXEL_ID = "1560736461820497";
// Pixel "cv test" (1824488118557875), o da conta de anúncio CV TEST usada na Espanha: recebe os mesmos eventos.
const ES_PIXEL_IDS = [ES_PIXEL_ID, "1824488118557875"] as const;
const enviarES = (evento: string, dados?: Record<string, unknown>) => {
  for (const id of ES_PIXEL_IDS) {
    if (dados) window.fbq('trackSingle', id, evento, dados);
    else window.fbq('trackSingle', id, evento);
  }
};

// Track Purchase event for ES pixel only
export const trackESPurchase = (value: number, currency: string = 'USD') => {
  if (typeof window !== 'undefined' && window.fbq) {
    enviarES('Purchase', {
      value,
      currency,
    });
    console.log(`[Meta ES Pixel] Purchase tracked: ${value} ${currency}`);
  }
};

// Track Subscribe event for ES pixel only
export const trackESSubscribe = (value: number, currency: string = 'USD', predictedLtv?: number) => {
  if (typeof window !== 'undefined' && window.fbq) {
    enviarES('Subscribe', {
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
    enviarES('InitiateCheckout', {
      value,
      currency,
    });
    console.log(`[Meta ES Pixel] InitiateCheckout tracked: ${value} ${currency}`);
  }
};

// Track ViewContent event for ES pixel only
export const trackESViewContent = (contentName?: string) => {
  if (typeof window !== 'undefined' && window.fbq) {
    enviarES('ViewContent', {
      content_name: contentName || 'Página ES',
    });
    console.log(`[Meta ES Pixel] ViewContent tracked: ${contentName || 'Página ES'}`);
  }
};

// Track Lead event for ES pixel only
export const trackESLead = () => {
  if (typeof window !== 'undefined' && window.fbq) {
    enviarES('Lead');
    console.log('[Meta ES Pixel] Lead tracked');
  }
};

// Track CompleteRegistration event for ES pixel only
export const trackESCompleteRegistration = () => {
  if (typeof window !== 'undefined' && window.fbq) {
    enviarES('CompleteRegistration');
    console.log('[Meta ES Pixel] CompleteRegistration tracked');
  }
};
