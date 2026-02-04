// Declaração de tipo para o fbq
declare global {
  interface Window {
    fbq: (...args: unknown[]) => void;
  }
}

import { supabase } from "@/integrations/supabase/client";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

// Helper to send server-side event via Conversions API (requires authentication)
const sendServerEvent = async (
  eventName: string,
  customData?: Record<string, unknown>,
  userData?: Record<string, unknown>
) => {
  try {
    // Security: Only send server-side events if user is authenticated
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    // Skip if no session, error getting session, or no access token
    if (sessionError || !session?.access_token) {
      return;
    }

    // Check if token is expired before making the request
    try {
      const tokenPayload = session.access_token.split('.')[1];
      if (tokenPayload) {
        const decoded = JSON.parse(atob(tokenPayload));
        if (decoded.exp && decoded.exp * 1000 < Date.now()) {
          // Token is expired, skip server-side event silently
          return;
        }
      }
    } catch {
      // If we can't decode the token, skip to avoid 401 errors
      return;
    }

    // Get fbp and fbc from cookies if available
    const fbp = document.cookie.match(/_fbp=([^;]+)/)?.[1];
    const fbc = document.cookie.match(/_fbc=([^;]+)/)?.[1];

    const response = await fetch(`${SUPABASE_URL}/functions/v1/meta-conversions-api`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({
        event_name: eventName,
        event_source_url: window.location.href,
        user_data: {
          fbp,
          fbc,
          ...userData,
        },
        custom_data: customData,
      }),
    });

    // Silently handle errors - client-side pixel still tracks
    if (!response.ok) {
      // Don't log to avoid console noise for users with expired sessions
    }
  } catch {
    // Silently fail - client-side pixel (fbq) will still track the event
  }
};

// Evento: Visualização de Conteúdo
export const trackViewContent = (contentName?: string) => {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', 'ViewContent', {
      content_name: contentName || 'Página',
    });
  }
  
  // Server-side (only for authenticated users)
  sendServerEvent('ViewContent', {
    content_name: contentName || 'Página',
  });
};

// Evento: Cadastro Completo
export const trackCompleteRegistration = () => {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', 'CompleteRegistration');
  }
  
  // Server-side (only for authenticated users)
  sendServerEvent('CompleteRegistration');
};

// Evento: Iniciar Checkout
export const trackInitiateCheckout = (value: number, currency: string = 'BRL') => {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', 'InitiateCheckout', {
      value: value,
      currency: currency,
    });
  }
  
  // Server-side (only for authenticated users)
  sendServerEvent('InitiateCheckout', {
    value,
    currency,
  });
};

// Evento: Compra/Assinatura Completa
export const trackPurchase = (value: number, currency: string = 'BRL') => {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', 'Purchase', {
      value: value,
      currency: currency,
    });
  }
  
  // Server-side (only for authenticated users)
  sendServerEvent('Purchase', {
    value,
    currency,
  });
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
  
  // Server-side (only for authenticated users)
  sendServerEvent('Subscribe', {
    value,
    currency,
    predicted_ltv: predictedLtv || value * 12,
  });
};

// Evento: Lead (quando demonstra interesse)
export const trackLead = () => {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', 'Lead');
  }
  
  // Server-side (only for authenticated users)
  sendServerEvent('Lead');
};

// Evento: AddToCart (adicionar ao carrinho)
export const trackAddToCart = (value: number, currency: string = 'BRL', contentName?: string) => {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', 'AddToCart', {
      value,
      currency,
      content_name: contentName,
    });
  }
  
  // Server-side (only for authenticated users)
  sendServerEvent('AddToCart', {
    value,
    currency,
    content_name: contentName,
  });
};

// Evento: Search (pesquisa)
export const trackSearch = (searchQuery: string) => {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', 'Search', {
      search_string: searchQuery,
    });
  }
  
  // Server-side (only for authenticated users)
  sendServerEvent('Search', {
    search_string: searchQuery,
  });
};

// Evento: Contact (contato)
export const trackContact = () => {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', 'Contact');
  }
  
  // Server-side (only for authenticated users)
  sendServerEvent('Contact');
};

// Evento: CustomizeProduct (personalização)
export const trackCustomizeProduct = (contentName?: string) => {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', 'CustomizeProduct', {
      content_name: contentName,
    });
  }
  
  // Server-side (only for authenticated users)
  sendServerEvent('CustomizeProduct', {
    content_name: contentName,
  });
};

// Evento: StartTrial (iniciar trial)
export const trackStartTrial = (value?: number, currency: string = 'BRL') => {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', 'StartTrial', {
      value,
      currency,
    });
  }
  
  // Server-side (only for authenticated users)
  sendServerEvent('StartTrial', {
    value,
    currency,
  });
};

// Evento: SubmitApplication (enviar aplicação/formulário)
export const trackSubmitApplication = () => {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', 'SubmitApplication');
  }
  
  // Server-side (only for authenticated users)
  sendServerEvent('SubmitApplication');
};

// Evento: PageView (pode ser chamado manualmente para SPAs)
export const trackPageView = () => {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', 'PageView');
  }
  
  // Server-side (only for authenticated users)
  sendServerEvent('PageView');
};
