import type { FabricaState } from "@/hooks/useFabricaContext";
import { supabase } from "@/integrations/supabase/client";
import { normalizeCrmFormConfig, type CrmFormConfig } from "@/lib/crm-form-config";
import { resolveFabricaProjectId } from "@/lib/fabrica-project-persistence";
import { executeIdempotentWriteWithFreshSupabaseSession } from "@/lib/supabase-session";

type FabricaCrmLocale = "pt-BR" | "es";

interface PublishFabricaCrmFormParams {
  state: FabricaState;
  userId: string;
  projectId?: string | null;
  locale?: FabricaCrmLocale;
}

interface PublishFabricaCrmFormResult {
  formId: string;
  projectId: string;
  form: CrmFormConfig;
}

export const resolveFabricaCrmFormId = (projectId?: string | null) =>
  resolveFabricaProjectId(projectId);

const isMissingCrmPublishRpc = (error: { code?: string; message?: string } | null) => {
  const message = error?.message?.toLowerCase() || "";
  return error?.code === "PGRST202"
    || error?.code === "42883"
    || message.includes("publish_fabrica_crm_form") && message.includes("not found");
};

export const publishFabricaCrmForm = async ({
  state,
  userId,
  projectId,
  locale = "pt-BR",
}: PublishFabricaCrmFormParams): Promise<PublishFabricaCrmFormResult> => {
  const canonicalProjectId = resolveFabricaProjectId(projectId || state.projectId);
  const formId = resolveFabricaCrmFormId(canonicalProjectId);
  const form = normalizeCrmFormConfig({ ...state.crmForm, id: formId }, locale);
  const settings = {
    buttonLabel: form.buttonLabel,
    successMessage: form.successMessage,
    whatsappRedirect: form.whatsappRedirect,
    agencyName: state.agencyName,
    primaryColor: form.primaryColor || state.primaryColor,
    backgroundColor: form.backgroundColor,
    textColor: form.textColor,
    fieldBackgroundColor: form.fieldBackgroundColor,
    fieldTextColor: form.fieldTextColor,
    fieldBorderColor: form.fieldBorderColor,
    buttonTextColor: form.buttonTextColor,
    whatsapp: state.whatsapp,
    whatsappDialCode: state.whatsappDialCode,
    projectId: canonicalProjectId,
  };

  const { error: rpcError } = await executeIdempotentWriteWithFreshSupabaseSession(
    () => (supabase as any).rpc("publish_fabrica_crm_form", {
      p_project_id: canonicalProjectId,
      p_name: form.name,
      p_description: form.description || null,
      p_fields: form.fields,
      p_settings: settings,
    }),
    userId,
  );

  if (rpcError && !isMissingCrmPublishRpc(rpcError)) throw rpcError;

  if (rpcError) {
    // Compatibilidade até a RPC segura ser aplicada no projeto oficial.
    const { error } = await executeIdempotentWriteWithFreshSupabaseSession(
      () => (supabase as any).from("crm_forms").upsert({
        id: formId,
        owner_id: userId,
        name: form.name,
        description: form.description || null,
        fields: form.fields,
        settings,
        embed_key: formId,
        status: "active",
        updated_at: new Date().toISOString(),
      }, { onConflict: "id" }),
      userId,
    );

    if (error) throw error;
  }
  return { formId, projectId: canonicalProjectId, form };
};
