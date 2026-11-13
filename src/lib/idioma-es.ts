// Regra ÚNICA de idioma das telas compartilhadas (login, verificação do link) e do aviso de cookies.
// O cliente brasileiro nunca cai aqui: sem nenhum dos três sinais abaixo, tudo continua em português.

/** Mesma chave que o LanguageContext usa para guardar o idioma. */
export const IDIOMA_STORAGE_KEY = "canva-viagem-language";

/** Login em espanhol, voltando para a área /es. */
export const LOGIN_ES_URL = "/login?lang=es&redirect=%2Fes";

/** Caminho da área espanhola: "/es", "/es/...", "/es?..." ou "/es#...". Não confunde com "/escola". */
export const ehCaminhoES = (path: string | null | undefined): boolean =>
  typeof path === "string" && /^\/es(?:[/?#]|$)/.test(path);

const idiomaGuardado = (): string | null => {
  try {
    return localStorage.getItem(IDIOMA_STORAGE_KEY);
  } catch {
    return null;
  }
};

/**
 * É fluxo espanhol quando:
 * 1. a URL tem ?lang=es (e ?lang=pt força o português), OU
 * 2. o parâmetro redirect aponta para um caminho que começa com /es, OU
 * 3. o aparelho guardou a preferência "es" (LanguageContext).
 */
export function ehFluxoES(search?: string): boolean {
  if (typeof window === "undefined") return false;
  const params = new URLSearchParams(search ?? window.location.search);
  const lang = (params.get("lang") || "").toLowerCase();
  if (lang === "es") return true;
  if (lang === "pt") return false;
  if (ehCaminhoES(params.get("redirect"))) return true;
  return idiomaGuardado() === "es";
}
