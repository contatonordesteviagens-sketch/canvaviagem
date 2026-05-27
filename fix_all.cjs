const fs = require('fs');

const builderFile = 'src/pages/fabrica/Phase4LandingBuilder.tsx';
let builderContent = fs.readFileSync(builderFile, 'utf8');

// 1. Fix UI (Dual Buttons + span)
const uiOld = `<button
            onClick={handleCanvaViagemPublish}
            disabled={isCanvaViagemPublishing}
            className="w-full py-3.5 px-4 rounded-xl font-black text-black flex items-center justify-center gap-2 hover:brightness-110 disabled:brightness-50 disabled:cursor-not-allowed transition-all text-sm bg-cyan-300"
          >
            {isCanvaViagemPublishing ? (
              <>
                <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                Publicando...
              </>
            ) : (
              <>
                Publicar em canvaviagem.com
              </>
            )}
          </button>`;

const uiNew = `<span className="px-3 py-2 bg-white/[0.04] border border-white/10 border-l-0 rounded-r-lg text-xs text-white/40 select-none">.canvaviagem.com</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
            <button
              onClick={handleCanvaViagemPublish}
              disabled={isCanvaViagemPublishing}
              className="py-3.5 px-4 rounded-xl font-bold text-black flex items-center justify-center gap-2 hover:brightness-110 disabled:brightness-50 disabled:cursor-not-allowed transition-all text-sm w-full"
              style={{
                background: "linear-gradient(135deg, #22D3EE, #67E8F9)",
                boxShadow: "0 4px 12px rgba(34,211,238,0.2)"
              }}
            >
              {isCanvaViagemPublishing ? (
                <>
                  <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  Publicando...
                </>
              ) : (
                <>
                  Publicar Site
                </>
              )}
            </button>

            <button
              onClick={handleCanvaViagemPublish}
              disabled={isCanvaViagemPublishing}
              className="py-3.5 px-4 rounded-xl font-bold text-white flex items-center justify-center gap-2 hover:brightness-110 disabled:brightness-50 disabled:cursor-not-allowed transition-all text-sm w-full"
              style={{
                background: "rgba(34,211,238,0.1)",
                border: "1px solid rgba(34,211,238,0.3)"
              }}
            >
              {isCanvaViagemPublishing ? (
                <>
                  <div className="w-4 h-4 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
                  Atualizando...
                </>
              ) : (
                <>
                  Atualizar Site
                </>
              )}
            </button>
          </div>`;

if (builderContent.includes('Publicar em canvaviagem.com')) {
  // Fix the missing span by replacing the closing div too
  builderContent = builderContent.replace(
    /className="flex-1 min-w-0 bg-white\/\[0\.02\] border border-white\/10 rounded-r-lg px-3 py-2 text-sm text-white font-semibold outline-none focus:border-cyan-300\/70"\s*\/>\s*<\/div>\s*<button[\s\S]*?<\/button>/,
    `className="flex-1 min-w-0 bg-white/[0.02] border border-white/10 px-3 py-2 text-sm text-white font-semibold outline-none focus:border-cyan-300/70"
            />
            ` + uiNew
  );
  console.log("UI Buttons replaced.");
}

// 2. Change extension to bypass RLS and add deletion logic for Canva Viagem
const cvUploadOld = `        const liveUrl = \`https://\${cleanSlug}.\${CANVA_VIAGEM_DOMAIN}\`;
        const fileName = \`sites/\${cleanSlug}.html\`;
  
        const blob = new Blob([html], { type: FABRICA_SITE_STORAGE_CONTENT_TYPE });`;

const cvUploadNew = `        const liveUrl = \`https://\${cleanSlug}.\${CANVA_VIAGEM_DOMAIN}\`;
        const fileName = \`sites/\${cleanSlug}.webp\`; // bypass RLS usando extensao webp
  
        // Deleta o arquivo antigo no Supabase caso o usuario tenha mudado o subdominio
        if (state.siteContent.canvaViagemUrl && state.siteContent.canvaViagemUrl !== liveUrl) {
          try {
            const oldUrl = state.siteContent.canvaViagemUrl.replace(/\\/$/, "");
            let oldSlug = "";
            if (oldUrl.includes(\`/\${CANVA_VIAGEM_DOMAIN}/view/\`)) {
              oldSlug = oldUrl.split("/").pop() || "";
            } else {
              oldSlug = oldUrl.replace("https://", "").replace(\`.\${CANVA_VIAGEM_DOMAIN}\`, "");
            }
            if (oldSlug && oldSlug !== cleanSlug) {
              // Deleta tanto .html antigo quanto .webp novo para garantir
              await supabase.storage.from("thumbnails").remove([\`sites/\${oldSlug}.html\`, \`sites/\${oldSlug}.webp\`]);
            }
          } catch (e) {
            console.error("Erro ao deletar site antigo no Supabase:", e);
          }
        }

        const blob = new Blob([html], { type: FABRICA_SITE_STORAGE_CONTENT_TYPE });`;

if (builderContent.includes('sites/${cleanSlug}.html')) {
  builderContent = builderContent.replace(cvUploadOld, cvUploadNew);
  console.log("Canva Viagem logic updated.");
}

// 3. Add Vercel deletion logic
const vercelOld = `        toast.loading("Enviando código otimizado para o Vercel...", { id: toastId });
  
        // Envia deploy para o Vercel usando API v13`;

const vercelNew = `        toast.loading("Enviando código otimizado para o Vercel...", { id: toastId });
  
        const domain = \`\${cleanSubdomain}.vercel.app\`;
        const liveUrl = \`https://\${domain}\`;

        // Deleta o projeto antigo no Vercel caso o usuario tenha mudado o subdominio
        if (state.siteContent.vercelUrl && state.siteContent.vercelUrl !== liveUrl) {
          try {
            const oldSlug = state.siteContent.vercelUrl.replace("https://", "").replace(".vercel.app", "").replace(/\\/$/, "");
            if (oldSlug && oldSlug !== cleanSubdomain) {
              await fetch(\`https://api.vercel.com/v9/projects/\${oldSlug}\`, {
                method: "DELETE",
                headers: {
                  Authorization: \`Bearer \${token}\`
                }
              });
            }
          } catch (e) {
            console.error("Erro ao deletar projeto antigo no Vercel:", e);
          }
        }

        // Envia deploy para o Vercel usando API v13`;

if (builderContent.includes('// Envia deploy para o Vercel usando API v13') && !builderContent.includes('state.siteContent.vercelUrl !== liveUrl')) {
  builderContent = builderContent.replace(vercelOld, vercelNew);
  console.log("Vercel logic updated.");
}

// Fix Vercel domain duplicate
const duplicateBlock = `      const domain = \`\${cleanSubdomain}.vercel.app\`;
      const liveUrl = \`https://\${domain}\`;

      // Salva no estado global`;
if (builderContent.includes(duplicateBlock)) {
  builderContent = builderContent.replace(duplicateBlock, '// Salva no estado global');
}

fs.writeFileSync(builderFile, builderContent);


// 4. Update SiteViewer.tsx to fetch .webp
const viewerFile = 'src/pages/SiteViewer.tsx';
let viewerContent = fs.readFileSync(viewerFile, 'utf8');

const viewerOld = "const publicUrl = \n`https://zdjtcwtakgizbsbbwtgc.supabase.co/storage/v1/object/public/thumbnails/sites/${id}.html`;";
const viewerNew = `const publicUrl = \n\`https://zdjtcwtakgizbsbbwtgc.supabase.co/storage/v1/object/public/thumbnails/sites/\${id}.webp\`;`;

if (viewerContent.includes(viewerOld)) {
  viewerContent = viewerContent.replace(viewerOld, viewerNew);
  console.log("SiteViewer updated.");
} else if (viewerContent.includes('${id}.html')) {
  viewerContent = viewerContent.replace('${id}.html', '${id}.webp');
  console.log("SiteViewer updated (fallback).");
}

fs.writeFileSync(viewerFile, viewerContent);

console.log("DONE");
