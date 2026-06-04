const fs = require('fs');
const file = 'src/pages/fabrica/Phase4LandingBuilder.tsx';
let content = fs.readFileSync(file, 'utf8');

// 0. Fix the button broken syntax from the bad replace earlier (if it's still there)
// But I ran git restore so it shouldn't be broken anymore.

// 1. Add Atualizar Site button for Canva Viagem
content = content.replace(
  '<button\n            onClick={handleCanvaViagemPublish}\n            disabled={isCanvaViagemPublishing}\n            className=\"w-full py-3.5 px-4 rounded-xl font-black text-black flex items-center justify-center gap-2 hover:brightness-110 disabled:brightness-50 disabled:cursor-not-allowed transition-all text-sm bg-cyan-300\"\n          >\n            {isCanvaViagemPublishing ? (\n              <>\n                <div className=\"w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin\" />\n                Publicando...\n              </>\n            ) : (\n              <>\n                Publicar em canvaviagem.com\n              </>\n            )}\n          </button>',
  `<div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
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
          </div>`
);

// 2. Add Canva Viagem deletion logic
content = content.replace(
  'const blob = new Blob([html], { type: FABRICA_SITE_STORAGE_CONTENT_TYPE });',
  `// Deleta o arquivo HTML antigo no Supabase caso o usuario tenha mudado o subdominio
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
              await supabase.storage.from("thumbnails").remove([\`sites/\${oldSlug}.html\`]);
            }
          } catch (e) {
            console.error("Erro ao deletar site antigo no Supabase:", e);
          }
        }

        const blob = new Blob([html], { type: FABRICA_SITE_STORAGE_CONTENT_TYPE });`
);

// 3. Add Vercel deletion logic
content = content.replace(
  '// Envia deploy para o Vercel usando API v13',
  `const domain = \`\${cleanSubdomain}.vercel.app\`;
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

      // Envia deploy para o Vercel usando API v13`
);

// Remove the duplicate domain definition lower down
const duplicateBlock = `      const domain = \`\${cleanSubdomain}.vercel.app\`;
      const liveUrl = \`https://\${domain}\`;

      // Salva no estado global`;

content = content.replace(duplicateBlock, '// Salva no estado global');

fs.writeFileSync(file, content);
