// ============================================================
// CATEGORIAS DE ANÚNCIO + MAPEAMENTO DE PROMPTS MESTRES
// ------------------------------------------------------------
// Substitui as 4 estratégias antigas por 2 categorias macro.
// Cada categoria contém um pool de prompts (OP1-OP4 / ED1-ED3)
// que são rotacionados aleatoriamente, sem repetir o último.
// ============================================================

import type { StrategyId } from "@/data/fabrica-prompts";

export type CategoriaId = "oferta_pacote" | "experiencia_destino";

export interface CategoriaMeta {
  id: CategoriaId;
  name: string;
  badge: string;
  emoji: string;
  description: string;
  /** Tom/foco da categoria, mostrado no card. */
  focus: string[];
  /** Cor de destaque (hex) para o card. */
  accent: string;
  /** Pool de prompts mestres usados na rotação. Ordem = OP1, OP2... / ED1, ED2... */
  prompts: { code: string; templateId: string }[];
  /** Estratégia legada equivalente (usada nos modos Foto/Custom que rodam composição local). */
  legacyStrategy: StrategyId;
}

export const CATEGORIAS: CategoriaMeta[] = [
  {
    id: "oferta_pacote",
    name: "Oferta de Pacote",
    badge: "CONVERSÃO",
    emoji: "🔴",
    description:
      "Preço dominante, gatilhos de urgência e cartão de oferta destacado. Foco em conversão imediata.",
    focus: ["Preço gigante", "Urgência", "CTA direto", "Combo Aéreo + Hotel"],
    accent: "#dc2626",
    prompts: [
      { code: "OP1", templateId: "classic_vertical" },
      { code: "OP2", templateId: "cancun_style" },
      { code: "OP3", templateId: "gramado_style" },
      { code: "OP4", templateId: "maceio_style" },
      { code: "OP5", templateId: "ticket_pix_card" },
      { code: "OP6", templateId: "side_hero_performance" },
    ],
    legacyStrategy: "matriz",
  },
  {
    id: "experiencia_destino",
    name: "Experiência de Destino",
    badge: "DESEJO",
    emoji: "🔵",
    description:
      "Emoção, narrativa visual e desejo. Foto cinematográfica do destino com presença discreta de oferta.",
    focus: ["Emoção", "Foto impactante", "Narrativa", "Aspiracional"],
    accent: "#2563eb",
    prompts: [
      { code: "ED1", templateId: "iconic_landmark" },
      { code: "ED2", templateId: "split_yellow_side" },
      { code: "ED3", templateId: "elegant_center" },
      { code: "ED4", templateId: "editorial_visual" },
      { code: "ED5", templateId: "top_editorial_photo" },
      { code: "ED6", templateId: "two_scene_editorial" },
    ],
    legacyStrategy: "vitrine",
  },
];

export function getCategoria(id: CategoriaId): CategoriaMeta {
  return CATEGORIAS.find((c) => c.id === id) ?? CATEGORIAS[0];
}

/**
 * Sorteia N prompts da categoria, garantindo:
 *  - nenhum repetido entre si
 *  - o primeiro nunca é igual ao `lastTemplateId` (último usado na sessão anterior)
 *
 * Quando N > pool disponível, completa permitindo repetição (mas avisa via console).
 */
export function pickPromptsForCategoria(
  categoriaId: CategoriaId,
  count: number,
  lastTemplateId?: string | null
): { code: string; templateId: string }[] {
  const cat = getCategoria(categoriaId);
  const pool = [...cat.prompts];

  // Embaralha
  const shuffled = pool.sort(() => Math.random() - 0.5);

  // Se o primeiro for o último usado e existir alternativa, troca com o segundo
  if (lastTemplateId && shuffled.length > 1 && shuffled[0].templateId === lastTemplateId) {
    [shuffled[0], shuffled[1]] = [shuffled[1], shuffled[0]];
  }

  const picks = shuffled.slice(0, Math.min(count, shuffled.length));

  // Se pediram mais do que o pool comporta, completa com aleatórios (com repetição)
  while (picks.length < count) {
    const random = cat.prompts[Math.floor(Math.random() * cat.prompts.length)];
    picks.push(random);
  }

  return picks;
}
