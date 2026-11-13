import { useEffect } from "react";
import { COOKIES_ES_EVENT } from "@/lib/cookies-es";
import { rastreamentoPermitido } from "@/lib/rastreamento-consentimento";

const ES_PIXEL_ID = "1560736461820497";

export const SpanishPixel = () => {
  useEffect(() => {
    // Pixel is already initialized in index.html — only track PageView here.
    // Fluxo espanhol: o PageView só sai depois do "Aceptar" (na hora do aceite, sem recarregar).
    let enviado = false;
    const enviarPageView = () => {
      if (enviado || !rastreamentoPermitido()) return;
      if (typeof window !== 'undefined' && window.fbq) {
        enviado = true;
        window.fbq('trackSingle', ES_PIXEL_ID, 'PageView');
        console.log('[Meta ES Pixel] PageView tracked for pixel:', ES_PIXEL_ID);
      }
    };
    enviarPageView();
    window.addEventListener(COOKIES_ES_EVENT, enviarPageView);
    return () => window.removeEventListener(COOKIES_ES_EVENT, enviarPageView);
  }, []);

  // O <noscript> de pixel foi retirado: ele dispararia sem consentimento (RGPD / LSSI art. 22.2).
  return null;
};
