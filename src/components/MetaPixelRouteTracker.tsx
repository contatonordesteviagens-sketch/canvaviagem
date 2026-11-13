import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { trackMetaPageView } from "@/lib/meta-pixel-sales";
import { COOKIES_ES_EVENT } from "@/lib/cookies-es";

export function MetaPixelRouteTracker() {
  const location = useLocation();
  const caminho = `${location.pathname}${location.search}`;

  useEffect(() => {
    // No fluxo espanhol sem "Aceptar", trackMetaPageView não envia nada (ver rastreamento-consentimento.ts).
    trackMetaPageView(caminho);
  }, [caminho]);

  // Ao aceitar os cookies, a página que a pessoa está vendo conta o PageView na hora (sem recarregar).
  useEffect(() => {
    const aoEscolher = (ev: Event) => {
      if ((ev as CustomEvent<string>).detail === "aceptado") trackMetaPageView(caminho);
    };
    window.addEventListener(COOKIES_ES_EVENT, aoEscolher);
    return () => window.removeEventListener(COOKIES_ES_EVENT, aoEscolher);
  }, [caminho]);

  return null;
}
