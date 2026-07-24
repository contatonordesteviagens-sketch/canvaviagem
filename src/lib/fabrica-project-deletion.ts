import { supabase } from "@/integrations/supabase/client";

interface DeleteFabricaProjectParams {
  projectId: string;
  userId: string;
  legacySlugs?: string[];
}

const isMissingDeleteRpc = (error: { code?: string; message?: string } | null) => {
  const message = error?.message?.toLowerCase() || "";
  return error?.code === "PGRST202"
    || error?.code === "42883"
    || message.includes("delete_fabrica_project") && message.includes("not found");
};

export const deleteFabricaProject = async ({
  projectId,
  userId,
  legacySlugs = [],
}: DeleteFabricaProjectParams) => {
  const uniqueSlugs = [...new Set(legacySlugs.filter(Boolean))];
  const { error: rpcError } = await (supabase as any).rpc("delete_fabrica_project", {
    p_project_id: projectId,
    p_legacy_slugs: uniqueSlugs,
  });

  if (!rpcError) return;
  if (!isMissingDeleteRpc(rpcError)) throw rpcError;

  // Compatibilidade até a RPC transacional chegar ao projeto oficial.
  const { error: sitesError } = await supabase
    .from("public_sites")
    .delete()
    .eq("owner_id", userId)
    .eq("project_id", projectId);
  if (sitesError) throw sitesError;

  if (uniqueSlugs.length > 0) {
    const { error: slugsError } = await supabase
      .from("public_sites")
      .delete()
      .eq("owner_id", userId)
      .is("project_id", null)
      .in("id", uniqueSlugs);
    if (slugsError) throw slugsError;
  }

  // Preserve customer submissions even when the project itself is removed.
  // Detaching the form prevents the project FK cascade from deleting leads.
  const { error: formError } = await (supabase as any)
    .from("crm_forms")
    .update({ project_id: null, status: "archived" })
    .eq("owner_id", userId)
    .or(`id.eq.${projectId},embed_key.eq.${projectId}`);
  if (formError) throw formError;

  const { error: projectError } = await (supabase as any)
    .from("fabrica_diagnosticos")
    .delete()
    .eq("id", projectId)
    .eq("user_id", userId);
  if (projectError) throw projectError;
};
