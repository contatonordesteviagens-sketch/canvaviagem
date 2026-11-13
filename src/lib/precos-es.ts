/**
 * Fonte ÚNICA de preço, garantia, checkout e suporte das páginas em espanhol (/es/inicio, /es/planos, /es/obrigado).
 * Nenhuma página ES escreve preço, link de pagamento, e-mail ou WhatsApp direto: tudo vem daqui.
 * Preço em dólar por decisão do Lucas em 13/11/2026; euro depois.
 * Os valores abaixo são exatamente o que cada link do Stripe cobra.
 */

export const PRECO_START_ES = 29; // US$ por mês
export const PRECO_ELITE_ES = 97; // US$ por mês
export const PRECO_START_ANUAL_ES = 197; // US$ por ano (não exibido nas páginas hoje)
export const PRECO_ELITE_ANUAL_ES = 347; // US$ por ano (não exibido nas páginas hoje)

// PROVISÓRIO: aguardando decisão do Lucas
export const GARANTIA_DIAS_ES = 15;

/** Moeda exibida nas páginas ES. */
export const MOEDA_ES = "US$";
/** Código ISO da moeda para o Pixel do Meta. */
export const MOEDA_ISO_ES = "USD";

/** Formato das páginas ES: "29 US$". */
export const formatPrecio = (value: number): string => `${value} ${MOEDA_ES}`;

export type PlanoES = "start" | "elite";

export const PLANOS_ES: Record<PlanoES, { nome: string; precoMes: number }> = {
  start: { nome: "Start", precoMes: PRECO_START_ES },
  elite: { nome: "Elite", precoMes: PRECO_ELITE_ES },
};

/** Links de checkout dos botões ES (Stripe). Só o ciclo mensal é oferecido nas páginas. */
export const CHECKOUT_ES: Record<PlanoES, string> = {
  start: "https://buy.stripe.com/eVqeVe61Q3Es9mPbF28so0h",
  elite: "https://buy.stripe.com/cNi00k2PEfna2Yr10o8so0f",
};

export const CHECKOUT_ANUAL_ES: Record<PlanoES, string> = {
  start: "https://buy.stripe.com/aFaaEY61Q2AoeH94cA8so0g",
  elite: "https://buy.stripe.com/dRm3cweymgre9mPbF28so0e",
};

// PROVISÓRIO: aguardando decisão do Lucas (e-mail de suporte igual ao da página brasileira)
export const SUPORTE_EMAIL_ES = "suporte@canvaviagem.com.br";

// PROVISÓRIO: aguardando decisão do Lucas (número brasileiro atual; falta definir suporte em horário espanhol)
export const SUPORTE_WHATSAPP_ES = "https://wa.me/5585986411294";
export const suporteWhatsAppUrlES = (texto: string) => `${SUPORTE_WHATSAPP_ES}?text=${encodeURIComponent(texto)}`;
