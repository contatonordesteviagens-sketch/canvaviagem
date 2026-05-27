import sys
import re

file_path = 'src/pages/fabrica/Phase4LandingBuilder.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Normalize newlines
content = content.replace('\r\n', '\n')

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
                Gera um link seguro no seu domínio principal, como canvaviagem.com/view/nome-da-agencia.
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
              https://canvaviagem.com/view/
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
                Nova opção
              </div>
              <h4 className="text-lg font-black text-white leading-tight">
                Publicar com link Canva Viagem
              </h4>
              <p className="text-xs text-white/60 mt-1 leading-relaxed">
                Gera um link seguro no seu domínio principal, como canvaviagem.com/view/nome-da-agencia.
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
              https://canvaviagem.com/view/
            </span>
            <input
              type="text"
              value={canvaViagemSubdomain}
              onChange={(e) => setCanvaViagemSubdomain(buildSiteSlug(e.target.value))}
              placeholder="nome-da-agencia"
              className="flex-1 min-w-0 bg-white/[0.02] border border-white/10 rounded-r-lg px-3 py-2 text-sm text-white font-semibold outline-none focus:border-white/30"
            />
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

if canva_ui_old in content:
    content = content.replace(canva_ui_old, canva_ui_new)
    print("SUCCESS: canva_ui replaced")
else:
    print("ERROR: canva_ui not found")

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
