// Escolha do visitante no aviso de cookies das páginas /es (src/components/AvisoCookiesES.tsx).
// ATENÇÃO: hoje isto só REGISTRA a escolha. Os pixels do Meta e a etiqueta do Google Ads são carregados
// em index.html para o site inteiro (Brasil incluído) e não consultam este valor antes de carregar.

export const COOKIES_ES_KEY = "cv-es-cookies";
/** Evento disparado na janela quando a pessoa escolhe: quem for bloquear os pixels pode ouvir aqui. */
export const COOKIES_ES_EVENT = "cv-es-cookies";

export type ConsentimientoCookiesES = "aceptado" | "rechazado";

/** "aceptado", "rechazado" ou null (ainda não escolheu, ou o navegador não deixa guardar). */
export function consentimientoCookiesES(): ConsentimientoCookiesES | null {
  try {
    const raw = localStorage.getItem(COOKIES_ES_KEY);
    if (!raw) return null;
    const valor = (JSON.parse(raw) as { valor?: string } | null)?.valor;
    return valor === "aceptado" || valor === "rechazado" ? valor : null;
  } catch {
    return null;
  }
}

export function guardarConsentimientoCookiesES(valor: ConsentimientoCookiesES): void {
  try {
    localStorage.setItem(COOKIES_ES_KEY, JSON.stringify({ valor, fecha: new Date().toISOString() }));
  } catch {
    // navegador sem armazenamento: a escolha vale só para esta visita
  }
  try {
    window.dispatchEvent(new CustomEvent(COOKIES_ES_EVENT, { detail: valor }));
  } catch {
    // sem CustomEvent: nada a avisar
  }
}
