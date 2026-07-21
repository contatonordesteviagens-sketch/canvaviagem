import type { FabricaState } from "@/hooks/useFabricaContext";
import { supabase } from "@/integrations/supabase/client";
import { buildLandingHTML as buildLandingHTMLPt } from "@/lib/fabrica-html-export";
import { buildLandingHTML as buildLandingHTMLEs } from "@/lib/fabrica-html-export-es";
import { publishFabricaCrmForm } from "@/lib/fabrica-crm-publication";
import { persistFabricaProject } from "@/lib/fabrica-project-persistence";
import { checkCanvaSiteSlugAvailability } from "@/lib/fabrica-site-publication";
import { publishInlineSiteAssets } from "@/lib/fabrica-site-assets";
import { getCanvaSiteUrl } from "@/lib/canva-site-domain";

export type FabricaSiteLocale = "pt-BR" | "es";

interface PublishFabricaSiteParams {
  state: FabricaState;
  userId: string;
  slug: string;
  locale?: FabricaSiteLocale;
  onProgress?: (stage: "project" | "form" | "assets" | "site") => void;
}

const isMissingPublishRpc = (error: { code?: string; message?: string } | null) => {
  const message = error?.message?.toLowerCase() || "";
  return error?.code === "PGRST202"
    || error?.code === "42883"
    || message.includes("publish_fabrica_site") && message.includes("not found");
};

const wait = (milliseconds: number) => new Promise((resolve) => window.setTimeout(resolve, milliseconds));

const callPublishSiteRpc = async ({
  slug,
  projectId,
  html,
  locale,
}: {
  slug: string;
  projectId: string;
  html: string;
  locale: FabricaSiteLocale;
}) => (supabase as any).rpc("publish_fabrica_site", {
  p_slug: slug,
  p_project_id: projectId,
  p_html: html,
  p_locale: locale,
});

const publishSiteRecord = async ({
  slug,
  userId,
  projectId,
  html,
  locale,
}: {
  slug: string;
  userId: string;
  projectId: string;
  html: string;
  locale: FabricaSiteLocale;
}) => {
  let { error: rpcError } = await callPublishSiteRpc({ slug, projectId, html, locale });

  if (!rpcError) return;
  if (!isMissingPublishRpc(rpcError)) throw rpcError;

  // A migration pode existir no Postgres alguns instantes antes de aparecer
  // no cache do PostgREST. Tentativas curtas evitam um fallback incompatível
  // durante essa janela sem atrasar instalações que ainda não possuem a RPC.
  for (const delay of [180, 420]) {
    await wait(delay);
    const retry = await callPublishSiteRpc({ slug, projectId, html, locale });
    rpcError = retry.error;
    if (!rpcError) return;
    if (!isMissingPublishRpc(rpcError)) throw rpcError;
  }

  // Compatibilidade durante o rollout da migration: mantém o fluxo atual e
  // remove somente publicações antigas do mesmo projeto e proprietário.
  const { error: upsertError } = await supabase.from("public_sites").upsert({
    id: slug,
    owner_id: userId,
    project_id: projectId,
    html,
    locale,
  });
  // Se o índice atômico já estiver ativo, mas a RPC ainda não tiver chegado
  // ao cache, preservamos o site antigo em vez de apagá-lo para tentar de novo.
  if (upsertError?.code === "23505") {
    const finalRetry = await callPublishSiteRpc({ slug, projectId, html, locale });
    if (!finalRetry.error) return;
    if (isMissingPublishRpc(finalRetry.error)) {
      throw new Error("site_publish_schema_sync_pending");
    }
    throw finalRetry.error;
  }
  if (upsertError) throw upsertError;

  const { error: cleanupError } = await supabase
    .from("public_sites")
    .delete()
    .eq("owner_id", userId)
    .eq("project_id", projectId)
    .neq("id", slug);
  if (cleanupError) throw cleanupError;
};

const replacePublishedAsset = (value: string | undefined, replacements: Map<string, string>) =>
  value ? replacements.get(value) || value : value || "";

const applyPublishedAssetUrls = (
  state: FabricaState,
  replacements: Map<string, string>,
): FabricaState => {
  if (!replacements.size) return state;

  return {
    ...state,
    logoBase64: replacePublishedAsset(state.logoBase64, replacements),
    selectedPackages: state.selectedPackages.map((pkg) => ({
      ...pkg,
      imageUrl: replacePublishedAsset(pkg.imageUrl, replacements),
      galleryImages: (pkg.galleryImages || []).map((url) => replacePublishedAsset(url, replacements)),
    })),
    siteContent: {
      ...state.siteContent,
      heroImageUrl: replacePublishedAsset(state.siteContent.heroImageUrl, replacements),
      aboutImageUrl: replacePublishedAsset(state.siteContent.aboutImageUrl, replacements),
      galleryImages: (state.siteContent.galleryImages || []).map((url) => replacePublishedAsset(url, replacements)),
    },
  };
};

const collectInlineSiteAssetSources = (state: FabricaState) => [
  state.logoBase64,
  ...state.selectedPackages.flatMap((pkg) => [pkg.imageUrl, ...(pkg.galleryImages || [])]),
  state.siteContent.heroImageUrl,
  state.siteContent.aboutImageUrl,
  ...(state.siteContent.galleryImages || []),
].filter((source): source is string => Boolean(source));

export const publishFabricaSite = async ({
  state,
  userId,
  slug,
  locale = "pt-BR",
  onProgress,
}: PublishFabricaSiteParams) => {
  onProgress?.("project");
  const persistedProject = await persistFabricaProject({ state, userId });
  const projectId = persistedProject.id;

  const availability = await checkCanvaSiteSlugAvailability({
    slug,
    ownerId: userId,
    projectId,
    currentUrl: state.siteContent?.canvaViagemUrl,
  });
  if (!availability.allowed) {
    const reason = (availability as { allowed: false; reason: string }).reason;
    const error = new Error(reason || "site_slug_unavailable");
    error.name = "FabricaSiteSlugError";
    throw error;
  }

  onProgress?.("form");
  const publishedForm = await publishFabricaCrmForm({
    state: { ...state, projectId },
    userId,
    projectId,
    locale,
  });
  const projectState: FabricaState = {
    ...state,
    projectId,
    crmForm: publishedForm.form,
  };

  const sourceHtml = locale === "es"
    ? buildLandingHTMLEs(projectState, userId)
    : buildLandingHTMLPt(projectState, userId);

  onProgress?.("assets");
  const optimized = await publishInlineSiteAssets(
    sourceHtml,
    userId,
    collectInlineSiteAssetSources(projectState),
  );
  const stateWithPublishedAssets = applyPublishedAssetUrls(projectState, optimized.replacements);

  onProgress?.("site");
  await publishSiteRecord({
    slug,
    userId,
    projectId,
    html: optimized.html,
    locale,
  });

  const liveUrl = getCanvaSiteUrl(slug);
  const publishedState: FabricaState = {
    ...stateWithPublishedAssets,
    siteContent: {
      ...stateWithPublishedAssets.siteContent,
      canvaViagemUrl: liveUrl,
    },
  };
  let projectSyncPending = false;
  try {
    await persistFabricaProject({ state: publishedState, userId });
  } catch (error) {
    // O site já está no ar. A atualização do contexto logo abaixo aciona o
    // autosave novamente, então não transformamos um sucesso real em falha.
    projectSyncPending = true;
    console.warn("[Fábrica] Site publicado; o vínculo local será sincronizado novamente.", error);
  }

  return {
    projectId,
    liveUrl,
    state: publishedState,
    assetCount: optimized.assetCount,
    projectSyncPending,
  };
};
