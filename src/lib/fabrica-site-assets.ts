import { supabase } from "@/integrations/supabase/client";

const SITE_ASSET_BUCKET = "thumbnails";
const SITE_ASSET_CONTENT_TYPE = "image/webp";
const INLINE_IMAGE_PATTERN = /data:image\/[a-zA-Z0-9.+-]+;base64,[a-zA-Z0-9+/=]+/g;

const optimizeImageBlobToWebp = async (blob: Blob, maxDimension = 1600) => {
  const bitmap = await createImageBitmap(blob);
  try {
    const scale = Math.min(1, maxDimension / Math.max(bitmap.width, bitmap.height));
    const width = Math.max(1, Math.round(bitmap.width * scale));
    const height = Math.max(1, Math.round(bitmap.height * scale));
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Não foi possível preparar uma imagem do site.");
    context.drawImage(bitmap, 0, 0, width, height);
    const optimized = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, SITE_ASSET_CONTENT_TYPE, 0.82));
    if (!optimized) throw new Error("Não foi possível converter uma imagem do site.");
    return optimized;
  } finally {
    bitmap.close();
  }
};

const hashBlob = async (blob: Blob) => {
  const bytes = await blob.arrayBuffer();
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
};

export const publishInlineSiteAssets = async (
  html: string,
  userId: string,
  additionalSources: string[] = [],
) => {
  let publishedHtml = html;
  const embeddedImages = Array.from(new Set([
    ...(publishedHtml.match(INLINE_IMAGE_PATTERN) || []),
    ...additionalSources.filter((source) => /^data:image\/[a-zA-Z0-9.+-]+;base64,/i.test(source)),
  ]));
  const replacements = new Map<string, string>();

  for (const base64Data of embeddedImages) {
    const sourceResponse = await fetch(base64Data);
    if (!sourceResponse.ok) throw new Error("Não foi possível ler uma imagem incorporada ao site.");
    const optimizedBlob = await optimizeImageBlobToWebp(await sourceResponse.blob());
    const hash = await hashBlob(optimizedBlob);
    const filename = `sites/${userId}/assets/${hash}.webp`;
    const { error: uploadError } = await supabase.storage
      .from(SITE_ASSET_BUCKET)
      .upload(filename, optimizedBlob, {
        contentType: SITE_ASSET_CONTENT_TYPE,
        upsert: true,
      });
    if (uploadError) throw uploadError;
    const publicUrl = supabase.storage.from(SITE_ASSET_BUCKET).getPublicUrl(filename).data.publicUrl;
    replacements.set(base64Data, publicUrl);
    publishedHtml = publishedHtml.split(base64Data).join(publicUrl);
  }

  if (/data:image\/[a-zA-Z0-9.+-]+;base64,/i.test(publishedHtml)) {
    throw new Error("Não foi possível otimizar todas as imagens do site.");
  }

  return { html: publishedHtml, assetCount: embeddedImages.length, replacements };
};
