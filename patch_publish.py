import sys

def patch_file(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Find the handleCanvaViagemPublish logic block
    old_upload = """      const liveUrl = `${CANVA_VIAGEM_SITE_BASE_URL}/${cleanSlug}`;
      const fileName = `sites/${cleanSlug}.webp`; // bypass RLS

      if (state.siteContent.canvaViagemUrl && state.siteContent.canvaViagemUrl !== liveUrl) {
        try {
          const oldUrl = state.siteContent.canvaViagemUrl.replace(/\\/$/, "");
          let oldSlug = "";
          if (oldUrl.includes(`/${CANVA_VIAGEM_DOMAIN}/view/`)) {
            oldSlug = oldUrl.split("/").pop() || "";
          } else {
            oldSlug = oldUrl.replace("https://", "").replace(`.${CANVA_VIAGEM_DOMAIN}`, "");
          }
          if (oldSlug && oldSlug !== cleanSlug) {
            await supabase.storage.from("thumbnails").remove([`sites/${oldSlug}.html`, `sites/${oldSlug}.webp`]);
          }
        } catch (e) {
          console.warn("Could not remove old site", e);
        }
      }

      const blob = new Blob([finalHtml], { type: FABRICA_SITE_STORAGE_CONTENT_TYPE });

      const { error: uploadError } = await supabase.storage
        .from("thumbnails")
        .upload(fileName, blob, {
          contentType: FABRICA_SITE_STORAGE_CONTENT_TYPE,
          upsert: true,
          cacheControl: "0",
        });

      if (uploadError) throw uploadError;"""

    new_upload = """      const liveUrl = `${CANVA_VIAGEM_SITE_BASE_URL}/${cleanSlug}`;
      const fileNameSlug = `sites/${cleanSlug}.webp`; // Tentativa com nome personalizado
      const fileNameId = `sites/${user.id}.webp`; // Upload Oficial (passa RLS)

      if (state.siteContent.canvaViagemUrl && state.siteContent.canvaViagemUrl !== liveUrl) {
        try {
          const oldUrl = state.siteContent.canvaViagemUrl.replace(/\\/$/, "");
          let oldSlug = "";
          if (oldUrl.includes(`/${CANVA_VIAGEM_DOMAIN}/view/`)) {
            oldSlug = oldUrl.split("/").pop() || "";
          } else {
            oldSlug = oldUrl.replace("https://", "").replace(`.${CANVA_VIAGEM_DOMAIN}`, "");
          }
          if (oldSlug && oldSlug !== cleanSlug) {
            await supabase.storage.from("thumbnails").remove([`sites/${oldSlug}.html`, `sites/${oldSlug}.webp`]);
          }
        } catch (e) {
          console.warn("Could not remove old site", e);
        }
      }

      const blob = new Blob([finalHtml], { type: FABRICA_SITE_STORAGE_CONTENT_TYPE });

      // O VERCEL SEMPRE UPA NO USER.ID OFICIALMENTE PRA NÃO DAR ERRO DE RLS
      const { error: uploadIdError } = await supabase.storage
        .from("thumbnails")
        .upload(fileNameId, blob, {
          contentType: FABRICA_SITE_STORAGE_CONTENT_TYPE,
          upsert: true,
          cacheControl: "0",
        });

      if (uploadIdError) throw uploadIdError;

      // DEPOIS TENTA O NOME PERSONALIZADO (que pode dar bloqueio de RLS)
      const { error: uploadSlugError } = await supabase.storage
        .from("thumbnails")
        .upload(fileNameSlug, blob, {
          contentType: FABRICA_SITE_STORAGE_CONTENT_TYPE,
          upsert: true,
          cacheControl: "0",
        });

      // SE DER ERRO DE RLS NO SLUG, CAIMOS PARA O LINK SEGURO DO ID IGUAL O ANTIGO FAZIA
      let finalUrl = liveUrl;
      if (uploadSlugError) {
          console.warn("RLS bloqueou o link personalizado. Usando o ID seguro.");
          finalUrl = `${CANVA_VIAGEM_SITE_BASE_URL}/${user.id}`;
      }"""

    if old_upload in content:
        content = content.replace(old_upload, new_upload)
        
        # Also need to replace the liveUrl usage below it
        old_success = """      setPublishedUrl(liveUrl);
      update({ siteContent: { ...state.siteContent, canvaViagemUrl: liveUrl } });"""
        new_success = """      setPublishedUrl(finalUrl);
      update({ siteContent: { ...state.siteContent, canvaViagemUrl: finalUrl } });"""
        content = content.replace(old_success, new_success)

        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"SUCCESS {file_path}")
    else:
        print(f"FAILED to find old upload block in {file_path}")

patch_file('src/pages/fabrica/Phase4LandingBuilder.tsx')
patch_file('src/pages/fabrica/Phase4LandingBuilderES.tsx')
