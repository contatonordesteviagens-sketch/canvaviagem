import { supabase } from "@/integrations/supabase/client";
import {
  executeIdempotentWriteWithFreshSupabaseSession,
  executeReadWithFreshSupabaseSession,
} from "@/lib/supabase-session";

interface DeleteFabricaProjectParams {
  projectId: string;
  linkedProjectIds?: string[];
  userId: string;
  legacySlugs?: string[];
}

export const deleteFabricaProject = async ({
  projectId,
  linkedProjectIds = [],
  userId,
  legacySlugs = [],
}: DeleteFabricaProjectParams) => {
  const uniqueSlugs = [...new Set(legacySlugs.filter(Boolean))];
  const uniqueProjectIds = [...new Set([projectId, ...linkedProjectIds].filter(Boolean))];

  // The authenticated RPC owns the transaction: it archives forms before
  // removing the project, so captured leads never follow an old cascade.
  for (const [index, ownedProjectId] of uniqueProjectIds.entries()) {
    const { error } = await executeIdempotentWriteWithFreshSupabaseSession(
      () => (supabase as any).rpc("delete_fabrica_project", {
        p_project_id: ownedProjectId,
        p_legacy_slugs: index === 0 ? uniqueSlugs : [],
      }),
      userId,
    );
    if (error) throw error;
  }

  const [
    { data: remainingProjectResult, error: projectCheckError },
    { data: remainingSitesResult, error: sitesCheckError },
  ] = await Promise.all([
    executeReadWithFreshSupabaseSession(
      () => (supabase as any)
        .from("fabrica_diagnosticos")
        .select("id")
        .eq("user_id", userId)
        .in("id", uniqueProjectIds)
        .limit(1),
      userId,
    ),
    executeReadWithFreshSupabaseSession(
      () => supabase
        .from("public_sites")
        .select("id")
        .eq("owner_id", userId)
        .in("project_id", uniqueProjectIds)
        .limit(1),
      userId,
    ),
  ]);

  if (projectCheckError) throw projectCheckError;
  if (sitesCheckError) throw sitesCheckError;
  const remainingProject = Array.isArray(remainingProjectResult) ? remainingProjectResult : [];
  const remainingSites = Array.isArray(remainingSitesResult) ? remainingSitesResult : [];
  let remainingLegacySites: { id: string }[] = [];
  if (uniqueSlugs.length > 0) {
    const { data, error } = await executeReadWithFreshSupabaseSession(
      () => supabase
        .from("public_sites")
        .select("id")
        .eq("owner_id", userId)
        .in("id", uniqueSlugs)
        .limit(1),
      userId,
    );
    if (error) throw error;
    remainingLegacySites = data || [];
  }

  if (remainingProject?.length || remainingSites?.length || remainingLegacySites.length) {
    throw new Error("O projeto ainda aparece no banco. Atualize a página e tente excluir novamente.");
  }
};
