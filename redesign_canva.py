import sys

file_path = 'src/pages/fabrica/Phase4LandingBuilder.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Replace Canva Viagem Buttons
old_canva = """          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
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
          </div>"""

new_canva = """          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-5">
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
            </div>"""

if old_canva in content:
    content = content.replace(old_canva, new_canva)
    print("Canva Viagem UI replaced")
else:
    print("Could not find Canva Viagem UI")

old_border_cyan = "border-cyan-400/30 bg-cyan-400/[0.05]"
new_border_cyan = "border-white/10 bg-white/[0.02]"
if old_border_cyan in content:
    content = content.replace(old_border_cyan, new_border_cyan)

old_cyan_text = "text-cyan-300 uppercase tracking-[0.18em]"
new_cyan_text = "text-white/40 uppercase tracking-[0.18em]"
if old_cyan_text in content:
    content = content.replace(old_cyan_text, new_cyan_text)

old_cyan_link = "text-cyan-300 flex-shrink-0"
new_cyan_link = "text-white/40 flex-shrink-0"
if old_cyan_link in content:
    content = content.replace(old_cyan_link, new_cyan_link)
    
old_cyan_badge = "bg-cyan-400/10 border-cyan-300/25"
new_cyan_badge = "bg-white/5 border-white/10"
if old_cyan_badge in content:
    content = content.replace(old_cyan_badge, new_cyan_badge)
    
old_cyan_title = "text-cyan-300 uppercase tracking-wider"
new_cyan_title = "text-white/50 uppercase tracking-wider"
if old_cyan_title in content:
    content = content.replace(old_cyan_title, new_cyan_title)
    
old_cyan_btn = "bg-cyan-400 hover:bg-cyan-300 text-black"
new_cyan_btn = "bg-white hover:bg-gray-200 text-black"
if old_cyan_btn in content:
    content = content.replace(old_cyan_btn, new_cyan_btn)


with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
