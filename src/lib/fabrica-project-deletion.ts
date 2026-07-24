import { supabase } from "@/integrations/supabase/client";
import {
  executeIdempotentWriteWithFreshSupabaseSession,
  executeReadWithFreshSupabaseSession,
} from "@/lib/supabase-session";

interface DeleteFabricaProjectParams {
  projectId: string;
  userId: string;
  legacySlugs?: string[];
}

export const deleteFabricaProject = async ({
  projectId,
  userId,
  legacySlugs = [],
}: DeleteFabricaProjectParams) => {
  const uniqueSlugs = [...new Set(legacySlugs.filter(Boolean))];

  // Detach forms first so an older ON DELETE CASCADE constraint can never
  // remove customer submissions together with the project.
  const { error: formError } = await executeIdempotentWriteWithFreshSupabaseSession(
    () => (supabase as any)
      .from("crm_forms")
      .update({ project_id: null, status: "archived" })
      .eq("owner_id", userId)
      .or(`project_id.eq.${projectId},id.eq.${projectId},embed_key.eq.${projectId}`),
    userId,
  );
  if (formError) throw formError;

  const { data: linkedForms, error: linkedFormsError } = await executeReadWithFreshSupabaseSession(
    () => (supabase as any)
      .from("crm_forms")
      .select("id")
      .eq("owner_id", userId)
      .eq("project_id", projectId)
      .limit(1),
    userId,
  );
  if (linkedFormsError) throw linkedFormsError;
  if (linkedForms?.length) {
    throw new Error("Não foi possível preservar os leads deste projeto. A exclusão foi cancelada.");
  }

  const { error: sitesError } = await executeIdempotentWriteWithFreshSupabaseSession(
    () => supabase
      .from("public_sites")
      .delete()
      .eq("owner_id", userId)
      .eq("project_id", projectId),
    userId,
  );
  if (sitesError) throw sitesError;

  if (uniqueSlugs.length > 0) {
    const { error: slugsError } = await executeIdempotentWriteWithFreshSupabaseSession(
      () => supabase
        .from("public_sites")
        .delete()
        .eq("owner_id", userId)
        .is("project_id", null)
        .in("id", uniqueSlugs),
      userId,
    );
    if (slugsError) throw slugsError;
  }

  const { error: projectError } = await executeIdempotentWriteWithFreshSupabaseSession(
    () => (supabase as any)
      .from("fabrica_diagnosticos")
      .delete()
      .eq("id", projectId)
      .eq("user_id", userId),
    userId,
  );
  if (projectError) throw projectError;

  const [
    { data: remainingProject, error: projectCheckError },
    { data: remainingSites, error: sitesCheckError },
  ] = await Promise.all([
    executeReadWithFreshSupabaseSession(
      () => (supabase as any)
        .from("fabrica_diagnosticos")
        .select("id")
        .eq("id", projectId)
        .eq("user_id", userId)
        .maybeSingle(),
      userId,
    ),
    executeReadWithFreshSupabaseSession(
      () => supabase
        .from("public_sites")
        .select("id")
        .eq("owner_id", userId)
        .eq("project_id", projectId)
        .limit(1),
      userId,
    ),
  ]);

  if (projectCheckError) throw projectCheckError;
  if (sitesCheckError) throw sitesCheckError;
  if (remainingProject || remainingSites?.length) {
    throw new Error("O projeto ainda aparece no banco. Atualize a página e tente excluir novamente.");
  }
};
