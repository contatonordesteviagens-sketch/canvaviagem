// Helper de legibilidade tipográfica para as variações de arte (V0–V5).
// Aplica drop-shadow forte e inverte cor + sombra quando o usuário escolhe
// "Textos escuros" no painel de cores da Etapa 3.

export type BaseTextMode = "light" | "dark";

/** Sombra forte para textos brancos sobre fundo de imagem variável. */
export const TEXT_SHADOW_LIGHT_CSS =
  "0 2px 4px rgba(0,0,0,0.85), 0 6px 18px rgba(0,0,0,0.55), 0 0 1px rgba(0,0,0,0.6)";

/** Sombra branca para textos pretos sobre fundo claro/texturizado. */
export const TEXT_SHADOW_DARK_CSS =
  "0 2px 4px rgba(255,255,255,0.85), 0 6px 18px rgba(255,255,255,0.55), 0 0 1px rgba(255,255,255,0.7)";

/** Tailwind drop-shadow para casos onde textShadow não se aplica. */
export const DROP_SHADOW_LIGHT_CLASS =
  "drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]";
export const DROP_SHADOW_DARK_CLASS =
  "drop-shadow-[0_2px_4px_rgba(255,255,255,0.8)]";

export function getContrastTextStyle(mode: BaseTextMode = "light") {
  return {
    color: mode === "dark" ? "#0A0A0A" : "#FFFFFF",
    textShadow: mode === "dark" ? TEXT_SHADOW_DARK_CSS : TEXT_SHADOW_LIGHT_CSS,
  } as const;
}

export function getDropShadowClass(mode: BaseTextMode = "light") {
  return mode === "dark" ? DROP_SHADOW_DARK_CLASS : DROP_SHADOW_LIGHT_CLASS;
}

/** Cor de texto pura (sem sombra) — útil em pílulas/labels secundárias. */
export function getTextColor(mode: BaseTextMode = "light") {
  return mode === "dark" ? "#0A0A0A" : "#FFFFFF";
}
