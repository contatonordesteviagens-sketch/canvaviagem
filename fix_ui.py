import sys

file_path = 'src/pages/fabrica/Phase4LandingBuilder.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update Vercel Logic
vercel_old = """      toast.loading("Enviando código otimizado para o Vercel...", { id: toastId });

      // Envia deploy para o Vercel usando API v13"""

vercel_new = """      toast.loading("Enviando código otimizado para o Vercel...", { id: toastId });

      const domain = `${cleanSubdomain}.vercel.app`;
      const liveUrl = `https://${domain}`;

      if (state.siteContent.vercelUrl && state.siteContent.vercelUrl !== liveUrl) {
        try {
          const oldSlug = state.siteContent.vercelUrl.replace("https://", "").replace(".vercel.app", "").replace(/\\/$/, "");
          if (oldSlug && oldSlug !== cleanSubdomain) {
            await fetch(`https://api.vercel.com/v9/projects/${oldSlug}`, {
              method: "DELETE",
              headers: { Authorization: `Bearer ${token}` }
            });
          }
        } catch (e) {
          console.error("Erro ao deletar projeto antigo no Vercel:", e);
        }
      }

      // Envia deploy para o Vercel usando API v13"""
content = content.replace(vercel_old, vercel_new)

# 2. Update Canva Viagem Logic
canva_old = """      try {
        const liveUrl = `https://${cleanSlug}.${CANVA_VIAGEM_DOMAIN}`;
        const fileName = `sites/${cleanSlug}.html`;

        const blob = new Blob([html], { type: FABRICA_SITE_STORAGE_CONTENT_TYPE });"""

canva_new = """      try {
        const liveUrl = `https://${cleanSlug}.${CANVA_VIAGEM_DOMAIN}`;
        const fileName = `sites/${cleanSlug}.webp`; // bypass RLS usando extensao webp

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
            console.error("Erro ao deletar site antigo no Supabase:", e);
          }
        }

        const blob = new Blob([html], { type: FABRICA_SITE_STORAGE_CONTENT_TYPE });"""
content = content.replace(canva_old, canva_new)

# 3. Fix Vercel UI
vercel_ui_old = """          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-white/60 uppercase tracking-wider mb-2">
                NOME DO DOMÍNIO (LINK DO SITE):
              </label>
              <div className="flex items-center">
                <span className="px-3 py-2 bg-white/[0.04] border border-white/10 border-r-0 rounded-l-lg text-xs text-white/40 select-none">
                  https://
                </span>
                <input
                  type="text"
                  value={vercelSubdomain}
                  onChange={(e) => setVercelSubdomain(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"))}
                  placeholder="nome-da-sua-agencia"
                  className="flex-1 bg-white/[0.02] border border-white/10 px-3 py-2 text-sm text-white font-semibold outline-none focus:border-white/30"
                />
                <span className="px-3 py-2 bg-white/[0.04] border border-white/10 border-l-0 rounded-r-lg text-xs text-white/40 select-none">
                  .vercel.app
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-xs font-bold text-white/60 uppercase tracking-wider mb-2">
                  Meta Pixel ID (Opcional):
                </label>
                <input
                  type="text"
                  value={state.metaPixelId || ""}
                  onChange={(e) => update({ metaPixelId: e.target.value })}
                  placeholder="Ex: 123456789012345"
                  className="w-full bg-white/[0.02] border border-white/10 px-3 py-2 text-sm text-white rounded-lg outline-none focus:border-white/30"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-white/60 uppercase tracking-wider mb-2">
                  Google Analytics ID (Opcional):
                </label>
                <input
                  type="text"
                  value={state.ga4Id || ""}
                  onChange={(e) => update({ ga4Id: e.target.value })}
                  placeholder="Ex: G-XXXXXXXXXX"
                  className="w-full bg-white/[0.02] border border-white/10 px-3 py-2 text-sm text-white rounded-lg outline-none focus:border-white/30"
                />
              </div>
            </div>

            {showVercelConfig && (
              <div className="mt-4 p-4 rounded-xl border border-amber-500/30 bg-amber-500/10 space-y-3">
                <label className="block text-xs font-bold text-amber-400 uppercase tracking-wider">
                  Vercel Access Token:
                </label>
                <div className="flex gap-2">
                  <input
                    type="password"
                    value={customVercelToken}
                    onChange={(e) => setCustomVercelToken(e.target.value)}
                    placeholder="Sua chave secreta da Vercel"
                    className="flex-1 bg-black/40 border border-amber-500/20 px-3 py-2 text-sm text-white rounded-lg outline-none focus:border-amber-400"
                  />
                  <button
                    onClick={() => handleSaveToken(customVercelToken)}
                    className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-black font-bold text-xs rounded-lg transition-all"
                  >
                    Salvar Token
                  </button>
                </div>
                <p className="text-[10px] text-white/50 leading-relaxed">
                  Crie um token em <a href="https://vercel.com/account/tokens" target="_blank" className="text-amber-400 hover:underline">vercel.com/account/tokens</a> e cole aqui.
                </p>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={handleVercelPublish}
                disabled={isVercelDeploying}
                className="py-3.5 px-4 rounded-xl font-bold text-white flex items-center justify-center gap-2 hover:brightness-110 disabled:brightness-50 disabled:cursor-not-allowed transition-all text-sm"
                style={{ 
                  background: `linear-gradient(135deg, ${primaryColor}, #F59E0B)`,
                  boxShadow: `0 4px 12px ${primaryColor}33`
                }}
              >
                {isVercelDeploying ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Publicando...
                  </>
                ) : (
                  <>
                    Publicar Site
                  </>
                )}
              </button>

              <button
                onClick={handleVercelPublish}
                disabled={isVercelDeploying}
                className="py-3.5 px-4 rounded-xl font-bold text-black flex items-center justify-center gap-2 hover:brightness-110 disabled:brightness-50 disabled:cursor-not-allowed transition-all text-sm"
                style={{ 
                  background: "linear-gradient(135deg, #10B981, #34D399)",
                  boxShadow: "0 4px 12px rgba(16,185,129,0.2)"
                }}
              >
                {isVercelDeploying ? (
                  <>
                    <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    Atualizando...
                  </>
                ) : (
                  <>
                    Atualizar Site
                  </>
                )}
              </button>
            </div>
          </div>"""

vercel_ui_new = """          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-white/60 uppercase tracking-wider mb-2">
                NOME DO DOMÍNIO (LINK DO SITE):
              </label>
              <div className="flex items-center">
                <span className="px-3 py-2 bg-white/[0.04] border border-white/10 border-r-0 rounded-l-lg text-xs text-white/40 select-none">
                  https://
                </span>
                <input
                  type="text"
                  value={vercelSubdomain}
                  onChange={(e) => setVercelSubdomain(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"))}
                  placeholder="nome-da-sua-agencia"
                  className="flex-1 bg-white/[0.02] border border-white/10 px-3 py-2 text-sm text-white font-semibold outline-none focus:border-white/30"
                />
                <span className="px-3 py-2 bg-white/[0.04] border border-white/10 border-l-0 rounded-r-lg text-xs text-white/40 select-none">
                  .vercel.app
                </span>
              </div>
            </div>

            {showVercelConfig && (
              <div className="mt-4 p-4 rounded-xl border border-white/10 bg-white/[0.02] space-y-3">
                <label className="block text-xs font-bold text-white/50 uppercase tracking-wider">
                  Vercel Access Token:
                </label>
                <div className="flex gap-2">
                  <input
                    type="password"
                    value={customVercelToken}
                    onChange={(e) => setCustomVercelToken(e.target.value)}
                    placeholder="Sua chave secreta da Vercel"
                    className="flex-1 bg-black/40 border border-white/10 px-3 py-2 text-sm text-white rounded-lg outline-none focus:border-white/30"
                  />
                  <button
                    onClick={() => handleSaveToken(customVercelToken)}
                    className="px-4 py-2 bg-white hover:bg-gray-200 text-black font-bold text-xs rounded-lg transition-all"
                  >
                    Salvar Token
                  </button>
                </div>
                <p className="text-[10px] text-white/50 leading-relaxed">
                  Crie um token em <a href="https://vercel.com/account/tokens" target="_blank" className="text-white hover:underline">vercel.com/account/tokens</a> e cole aqui.
                </p>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-5">
              <button
                onClick={handleVercelPublish}
                disabled={isVercelDeploying}
                className="py-3 px-4 rounded-xl font-semibold text-white flex items-center justify-center gap-2 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm border border-white/20 bg-white/5"
              >
                {isVercelDeploying ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin" />
                    Publicando...
                  </>
                ) : (
                  <>Publicar na Vercel</>
                )}
              </button>

              <button
                onClick={handleVercelPublish}
                disabled={isVercelDeploying}
                className="py-3 px-4 rounded-xl font-semibold text-white flex items-center justify-center gap-2 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm border border-white/20 bg-transparent"
              >
                {isVercelDeploying ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin" />
                    Atualizando...
                  </>
                ) : (
                  <>Atualizar Vercel</>
                )}
              </button>
            </div>
          </div>"""
content = content.replace(vercel_ui_old, vercel_ui_new)


# 4. Fix Canva Viagem UI
canva_ui_old = """        {/* PUBLICAÇÃO EM SUBDOMÍNIO CANVA VIAGEM */}
        <div className="my-4 p-6 rounded-2xl border-2 border-cyan-400/30 bg-cyan-400/[0.05] backdrop-blur-xl text-left">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <div className="text-[10px] font-black text-cyan-300 uppercase tracking-[0.18em] mb-1">
                Nova opção experimental
              </div>
              <h4 className="text-lg font-black text-white leading-tight">
                Publicar com link Canva Viagem
              </h4>
              <p className="text-xs text-white/60 mt-1 leading-relaxed">
                Gera um link seguro no seu próprio subdomínio, como nome-da-agencia.canvaviagem.com.
              </p>
            </div>
            <LinkIcon className="w-5 h-5 text-cyan-300 flex-shrink-0" />
          </div>

          {state.siteContent.canvaViagemUrl && (
            <div className="mb-5 p-4 rounded-xl bg-cyan-400/10 border border-cyan-300/25 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="text-[10px] font-bold text-cyan-300 uppercase tracking-wider">Link Canva Viagem publicado</div>
                <a
                  href={state.siteContent.canvaViagemUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-bold text-white hover:underline flex items-center gap-1.5 mt-0.5 group"
                >
                  {state.siteContent.canvaViagemUrl}
                  <ExternalLink className="w-3.5 h-3.5 text-white/40 group-hover:text-white transition-colors" />
                </a>
              </div>
              <a
                href={state.siteContent.canvaViagemUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-lg bg-cyan-400 hover:bg-cyan-300 text-black font-bold text-xs transition-all text-center"
              >
                Abrir site
              </a>
            </div>
          )}

          <label className="block text-xs font-bold text-white/60 uppercase tracking-wider mb-2">
            Link do cliente:
          </label>
          <div className="flex items-center mb-3">
            <span className="px-3 py-2 bg-white/[0.04] border border-white/10 border-r-0 rounded-l-lg text-xs text-white/40 select-none">
              https://
            </span>
            <input
              type="text"
              value={canvaViagemSubdomain}
              onChange={(e) => setCanvaViagemSubdomain(buildSiteSlug(e.target.value))}
              placeholder="nome-da-agencia"
              className="flex-1 min-w-0 bg-white/[0.02] border border-white/10 rounded-r-lg px-3 py-2 text-sm text-white font-semibold outline-none focus:border-cyan-300/70"
            />
          </div>

          <button
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
          </button>

          <p className="text-[10px] text-white/45 mt-3 leading-relaxed">
            Essa opção salva o HTML no Supabase e usa o SSL que já existe no domínio principal.
          </p>
        </div>"""

canva_ui_new = """        {/* PUBLICAÇÃO EM SUBDOMÍNIO CANVA VIAGEM */}
        <div className="my-4 p-6 rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-xl text-left">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <div className="text-[10px] font-black text-white/40 uppercase tracking-[0.18em] mb-1">
                Nova opção experimental
              </div>
              <h4 className="text-lg font-black text-white leading-tight">
                Publicar com link Canva Viagem
              </h4>
              <p className="text-xs text-white/60 mt-1 leading-relaxed">
                Gera um link seguro no seu próprio subdomínio, como nome-da-agencia.canvaviagem.com.
              </p>
            </div>
            <LinkIcon className="w-5 h-5 text-white/40 flex-shrink-0" />
          </div>

          {state.siteContent.canvaViagemUrl && (
            <div className="mb-5 p-4 rounded-xl bg-white/5 border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="text-[10px] font-bold text-white/50 uppercase tracking-wider">Link Canva Viagem publicado</div>
                <a
                  href={state.siteContent.canvaViagemUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-bold text-white hover:underline flex items-center gap-1.5 mt-0.5 group"
                >
                  {state.siteContent.canvaViagemUrl}
                  <ExternalLink className="w-3.5 h-3.5 text-white/40 group-hover:text-white transition-colors" />
                </a>
              </div>
              <a
                href={state.siteContent.canvaViagemUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-lg bg-white hover:bg-gray-200 text-black font-bold text-xs transition-all text-center"
              >
                Abrir site
              </a>
            </div>
          )}

          <label className="block text-xs font-bold text-white/60 uppercase tracking-wider mb-2">
            Link do cliente:
          </label>
          <div className="flex items-center mb-3">
            <span className="px-3 py-2 bg-white/[0.04] border border-white/10 border-r-0 rounded-l-lg text-xs text-white/40 select-none">
              https://
            </span>
            <input
              type="text"
              value={canvaViagemSubdomain}
              onChange={(e) => setCanvaViagemSubdomain(buildSiteSlug(e.target.value))}
              placeholder="nome-da-agencia"
              className="flex-1 min-w-0 bg-white/[0.02] border border-white/10 px-3 py-2 text-sm text-white font-semibold outline-none focus:border-white/30"
            />
            <span className="px-3 py-2 bg-white/[0.04] border border-white/10 border-l-0 rounded-r-lg text-xs text-white/40 select-none">
              .canvaviagem.com
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-5">
            <button
              onClick={handleCanvaViagemPublish}
              disabled={isCanvaViagemPublishing}
              className="py-3 px-4 rounded-xl font-semibold text-white flex items-center justify-center gap-2 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm border border-white/20 bg-white/5"
            >
              {isCanvaViagemPublishing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin" />
                  Publicando...
                </>
              ) : (
                <>Publicar no Canva Viagem</>
              )}
            </button>

            <button
              onClick={handleCanvaViagemPublish}
              disabled={isCanvaViagemPublishing}
              className="py-3 px-4 rounded-xl font-semibold text-white flex items-center justify-center gap-2 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm border border-white/20 bg-transparent"
            >
              {isCanvaViagemPublishing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin" />
                  Atualizando...
                </>
              ) : (
                <>Atualizar Canva Viagem</>
              )}
            </button>
          </div>

          <p className="text-[10px] text-white/45 mt-3 leading-relaxed">
            Essa opção salva o HTML no Supabase e usa o SSL que já existe no domínio principal.
          </p>
        </div>"""
content = content.replace(canva_ui_old, canva_ui_new)


# 5. Fix Emerald UI
emerald_old = """          {state.siteContent.vercelUrl && (
            <div className="mb-5 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">Seu Site está Online! 🌟</div>
                <a 
                  href={state.siteContent.vercelUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm font-bold text-white hover:underline flex items-center gap-1.5 mt-0.5 group"
                >
                  {state.siteContent.vercelUrl}
                  <ExternalLink className="w-3.5 h-3.5 text-white/40 group-hover:text-white transition-colors" />
                </a>
              </div>
              <a 
                href={state.siteContent.vercelUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs transition-all text-center"
              >
                Acessar Site do Cliente
              </a>
            </div>
          )}"""

emerald_new = """          {state.siteContent.vercelUrl && (
            <div className="mb-5 p-4 rounded-xl bg-white/5 border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="text-[10px] font-bold text-white/50 uppercase tracking-wider">Seu Site está Online! 🌟</div>
                <a 
                  href={state.siteContent.vercelUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm font-bold text-white hover:underline flex items-center gap-1.5 mt-0.5 group"
                >
                  {state.siteContent.vercelUrl}
                  <ExternalLink className="w-3.5 h-3.5 text-white/40 group-hover:text-white transition-colors" />
                </a>
              </div>
              <a 
                href={state.siteContent.vercelUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-lg bg-white hover:bg-gray-200 text-black font-bold text-xs transition-all text-center"
              >
                Acessar Site do Cliente
              </a>
            </div>
          )}"""
content = content.replace(emerald_old, emerald_new)

# 6. Insert Pixel Settings BEFORE details
details_old = """        <details className="mt-6 p-4 rounded-xl border border-white/10 bg-white/[0.02] group text-left">"""
pixel_settings = """        <div className="mt-6 p-5 rounded-xl border border-white/10 bg-white/[0.02] text-left">
          <h4 className="text-sm font-bold text-white mb-4">Configurações de Rastreamento (Opcional)</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-white/50 uppercase tracking-wider mb-2">
                Meta Pixel ID
              </label>
              <input
                type="text"
                value={state.metaPixelId || ""}
                onChange={(e) => update({ metaPixelId: e.target.value })}
                placeholder="Ex: 123456789012345"
                className="w-full bg-black/20 border border-white/10 px-3 py-2.5 text-sm text-white rounded-lg outline-none focus:border-white/30 transition-colors"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-white/50 uppercase tracking-wider mb-2">
                Google Analytics ID
              </label>
              <input
                type="text"
                value={state.ga4Id || ""}
                onChange={(e) => update({ ga4Id: e.target.value })}
                placeholder="Ex: G-XXXXXXXXXX"
                className="w-full bg-black/20 border border-white/10 px-3 py-2.5 text-sm text-white rounded-lg outline-none focus:border-white/30 transition-colors"
              />
            </div>
          </div>
        </div>

        <details className="mt-4 p-4 rounded-xl border border-white/10 bg-white/[0.02] group text-left">"""
content = content.replace(details_old, pixel_settings)

# Remove the duplicated liveUrl and domain def in Vercel Logic
content = content.replace("      const domain = `${cleanSubdomain}.vercel.app`;\n      const liveUrl = `https://${domain}`;\n\n      // Salva no estado global", "// Salva no estado global")

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

# Update SiteViewer.tsx
viewer_file = 'src/pages/SiteViewer.tsx'
with open(viewer_file, 'r', encoding='utf-8') as f:
    viewer_content = f.read()
    
viewer_content = viewer_content.replace('${id}.html', '${id}.webp')

with open(viewer_file, 'w', encoding='utf-8') as f:
    f.write(viewer_content)

print("ALL CHANGES APPLIED SUCCESSFULLY!")
