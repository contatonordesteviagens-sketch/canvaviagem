import { supabase } from "@/integrations/supabase/client";
import {
  CANVA_VIAGEM_DOMAIN,
  buildCanvaSiteSlug,
  extractCanvaSiteSlug,
  normalizeCanvaSiteUrl,
} from "@/lib/canva-site-domain";

export type CanvaSiteSlugConflict = "another_owner" | "another_project";

export const resolveFabricaSiteSlug = (savedUrl: string | undefined, agencyName: string) => {
  const normalized = normalizeCanvaSiteUrl(savedUrl || "");
  if (normalized) {
    const parsed = new URL(normalized);
    // URLs antigas /view/{uuid} não podem voltar a criar um domínio com UUID.
    if (parsed.hostname !== CANVA_VIAGEM_DOMAIN) {
      return extractCanvaSiteSlug(normalized);
    }
  }
  return buildCanvaSiteSlug(agencyName);
};

export const checkCanvaSiteSlugAvailability = async ({
  slug,
  ownerId,
  projectId,
  currentUrl,
}: {
  slug: string;
  ownerId: string;
  projectId: string;
  currentUrl?: string;
}): Promise<{ allowed: true } | { allowed: false; reason: CanvaSiteSlugConflict }> => {
  const { data, error } = await supabase
    .from("public_sites")
    .select("owner_id, project_id")
    .eq("id", slug)
    .maybeSingle();

  if (error) throw error;
  if (!data) return { allowed: true };
  if (data.owner_id !== ownerId) return { allowed: false, reason: "another_owner" };

  const currentSlug = currentUrl ? extractCanvaSiteSlug(currentUrl) : "";
  const belongsToCurrentProject = data.project_id === projectId;
  if (belongsToCurrentProject) return { allowed: true };

  // Uma publicaÃ§Ã£o jÃ¡ vinculada nunca pode ser tomada por outro projeto,
  // mesmo que o estado desse projeto contenha uma URL antiga ou copiada.
  if (data.project_id) return { allowed: false, reason: "another_project" };

  // Compatibilidade limitada com publicaÃ§Ãµes legadas ainda sem project_id.
  // O vÃ­nculo definitivo Ã© gravado assim que o projeto recuperado Ã© salvo.
  if (currentSlug === slug) return { allowed: true };

  return { allowed: false, reason: "another_project" };
};
