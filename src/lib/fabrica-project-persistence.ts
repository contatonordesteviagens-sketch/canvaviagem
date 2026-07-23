import { supabase } from "@/integrations/supabase/client";
import type { FabricaState } from "@/hooks/useFabricaContext";
import { executeIdempotentWriteWithFreshSupabaseSession } from "@/lib/supabase-session";

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export const isPersistedProjectId = (id?: string | null): id is string =>
  Boolean(id && UUID_PATTERN.test(id));

export const createTemporaryProjectId = () =>
  `proj_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;

const isRemoteAssetUrl = (value?: string | null) =>
  Boolean(value && /^https?:\/\//i.test(value.trim()));

const keepRemoteAssets = (values?: string[], limit = 100) =>
  [...new Set((values || []).filter((value) => isRemoteAssetUrl(value)))].slice(-limit);

const hash32 = (value: string, seed: number) => {
  let hash = seed >>> 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = Math.imul(hash ^ value.charCodeAt(index), 0x01000193);
    hash ^= hash >>> 13;
  }
  return (hash >>> 0).toString(16).padStart(8, "0");
};

// Um ID temporário sempre resolve para o mesmo UUID. Assim, repetir uma
// requisição após perda de conexão continua sendo um upsert idempotente.
export const resolveFabricaProjectId = (projectId?: string | null) => {
  if (isPersistedProjectId(projectId)) return projectId;
  const source = projectId || createTemporaryProjectId();
  const raw = [
    hash32(source, 0x811c9dc5),
    hash32(source, 0x9e3779b9),
    hash32(source, 0x85ebca6b),
    hash32(source, 0xc2b2ae35),
  ].join("");
  const versioned = `${raw.slice(0, 12)}5${raw.slice(13)}`;
  const variant = ((Number.parseInt(versioned[16], 16) & 0x3) | 0x8).toString(16);
  const hex = `${versioned.slice(0, 16)}${variant}${versioned.slice(17)}`;
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20, 32)}`;
};

export const createCloudProjectSnapshot = (state: FabricaState): FabricaState => {
  const logoIsTooBig = Boolean(state.logoBase64 && state.logoBase64.length >= 400_000);

  return {
    ...state,
    logoBase64: logoIsTooBig ? "" : state.logoBase64,
    // Base64 pesado continua no cache local do projeto. URLs públicas são leves e
    // precisam viajar com o snapshot para o projeto abrir igual em outro aparelho.
    generatedAdImage: isRemoteAssetUrl(state.generatedAdImage) ? state.generatedAdImage : "",
    lastCleanPhoto: isRemoteAssetUrl(state.lastCleanPhoto) ? state.lastCleanPhoto || "" : "",
    allGeneratedAdImages: keepRemoteAssets(state.allGeneratedAdImages),
    selectedPackages: state.selectedPackages.map((item) => ({
      ...item,
      imageUrl: isRemoteAssetUrl(item.imageUrl) ? item.imageUrl : "",
      galleryImages: keepRemoteAssets(item.galleryImages, 20),
    })),
    siteContent: {
      ...state.siteContent,
      heroImageUrl: isRemoteAssetUrl(state.siteContent.heroImageUrl) ? state.siteContent.heroImageUrl : "",
      aboutImageUrl: isRemoteAssetUrl(state.siteContent.aboutImageUrl) ? state.siteContent.aboutImageUrl : "",
      galleryImages: keepRemoteAssets(state.siteContent.galleryImages, 200),
    },
  };
};

interface PersistFabricaProjectParams {
  state: FabricaState;
  userId: string;
  levelName?: string;
}

interface PersistFabricaProjectResult {
  id: string;
  stateSnapshot: FabricaState;
}

export const persistFabricaProject = async ({
  state,
  userId,
  levelName,
}: PersistFabricaProjectParams): Promise<PersistFabricaProjectResult> => {
  const id = resolveFabricaProjectId(state.projectId);
  const stateSnapshot = createCloudProjectSnapshot({ ...state, projectId: id });
  const payload = {
    id,
    user_id: userId,
    agency_name: state.agencyName?.trim() || "Novo projeto",
    digital_score: state.digitalScore || 0,
    level: state.level || 1,
    ...(levelName ? { level_name: levelName } : {}),
    state_snapshot: stateSnapshot as any,
    checklist_progress: state.checklist30days as any,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await executeIdempotentWriteWithFreshSupabaseSession(
    () => supabase
      .from("fabrica_diagnosticos")
      .upsert(payload, { onConflict: "id" })
      .select("id")
      .single(),
    userId,
  );

  if (error) throw error;
  return { id: (data as any).id as string, stateSnapshot };
};
