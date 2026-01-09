// Declaração de tipo para o fbq
declare global {
  interface Window {
    fbq: (...args: unknown[]) => void;
  }
}

// Evento: Visualização de Conteúdo
export const trackViewContent = (contentName?: string) => {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', 'ViewContent', {
      content_name: contentName || 'Página',
    });
  }
};

// Evento: Cadastro Completo
export const trackCompleteRegistration = () => {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', 'CompleteRegistration');
  }
};

// Evento: Iniciar Checkout
export const trackInitiateCheckout = (value: number, currency: string = 'BRL') => {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', 'InitiateCheckout', {
      value: value,
      currency: currency,
    });
  }
};

// Evento: Compra/Assinatura Completa
export const trackPurchase = (value: number, currency: string = 'BRL') => {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', 'Purchase', {
      value: value,
      currency: currency,
    });
  }
};

// Evento: Assinatura (Subscribe)
export const trackSubscribe = (value: number, currency: string = 'BRL', predictedLtv?: number) => {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', 'Subscribe', {
      value: value,
      currency: currency,
      predicted_ltv: predictedLtv || value * 12,
    });
  }
};

// Evento: Lead (quando demonstra interesse)
export const trackLead = () => {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', 'Lead');
  }
};
