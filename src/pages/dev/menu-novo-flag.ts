// PROTÓTIPO (só localhost): quem entrou pelo Início novo vê o menu único em todas as telas.
export const CHAVE_INICIO_NOVO = "cv-inicio-novo";

export function usaMenuNovo(): boolean {
  if (!import.meta.env.DEV) return false;
  try { return sessionStorage.getItem(CHAVE_INICIO_NOVO) === "1"; } catch { return false; }
}
