/**
 * Acesso a ferramentas por plano.
 *
 * Ferramentas "basic" ficam liberadas para assinantes Start (capability
 * `tools.basic.use`). As demais exigem Elite (`tools.elite.use`).
 */
export const START_TOOL_IDS = new Set<string>([
  "narracao",
  "anuncio",
]);

const START_TOOL_KEYWORDS = ["narracao", "narração", "anuncio", "anúncio"];

export function isStartTool(itemId?: string | null): boolean {
  if (!itemId) return false;
  const id = itemId.trim().toLowerCase();
  if (START_TOOL_IDS.has(id)) return true;
  return START_TOOL_KEYWORDS.some((keyword) => id.includes(keyword));
}
