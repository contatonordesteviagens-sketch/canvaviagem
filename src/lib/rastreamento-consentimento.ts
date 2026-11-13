// Porta única do consentimento de rastreamento no fluxo espanhol.
// Regra: no fluxo ES (caminho /es..., ou /login e /auth em espanhol) NADA do Meta/Google carrega nem dispara
// até a pessoa clicar "Aceptar" (cv-es-cookies = aceptado). "Rechazar" ou sem escolha = nada. Fora do fluxo
// ES (Brasil) tudo segue como sempre: rastreamentoPermitido() é sempre true.
// O espelho em JS puro desta regra está em index.html (cvEhFluxoES / cvAceitou); mantenha os dois iguais.
import { useEffect, useState } from "react";
import { ehCaminhoES, IDIOMA_STORAGE_KEY } from "@/lib/idioma-es";
import { consentimientoCookiesES, COOKIES_ES_EVENT } from "@/lib/cookies-es";

declare global {
  interface Window {
    /** Definida em index.html: inicia Meta/Google (idempotente). imediato=true baixa os scripts já. */
    __cvIniciarRastreamento?: (imediato?: boolean) => void;
  }
}

/** A página aberta agora é do fluxo espanhol? Mesmo critério de src/lib/idioma-es.ts. */
export function ehFluxoESAtual(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const { pathname, search } = window.location;
    if (ehCaminhoES(pathname)) return true;
    if (/^\/(?:login|auth)(?:\/|$)/.test(pathname)) {
      const params = new URLSearchParams(search);
      const lang = (params.get("lang") || "").toLowerCase();
      if (lang === "es") return true;
      if (lang === "pt") return false;
      if (ehCaminhoES(params.get("redirect"))) return true;
      try {
        return localStorage.getItem(IDIOMA_STORAGE_KEY) === "es";
      } catch {
        return false;
      }
    }
  } catch {
    // sem URL legível: segue a regra brasileira
  }
  return false;
}

/** Pode disparar pixel/gtag/gravar analítica identificável agora? */
export function rastreamentoPermitido(): boolean {
  return !ehFluxoESAtual() || consentimientoCookiesES() === "aceptado";
}

/** Inicia Meta/Google se ainda não iniciaram (Brasil já inicia sozinho no index.html). */
export function iniciarRastreamento(imediato = false): void {
  if (typeof window !== "undefined") window.__cvIniciarRastreamento?.(imediato);
}

/** Reage ao "Aceptar"/"Rechazar" na hora, sem recarregar a página. */
export function useRastreamentoPermitido(): boolean {
  const [permitido, setPermitido] = useState(rastreamentoPermitido);
  useEffect(() => {
    const atualizar = () => setPermitido(rastreamentoPermitido());
    atualizar();
    window.addEventListener(COOKIES_ES_EVENT, atualizar);
    return () => window.removeEventListener(COOKIES_ES_EVENT, atualizar);
  }, []);
  return permitido;
}
