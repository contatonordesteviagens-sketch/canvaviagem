import sys

file_path = 'src/pages/fabrica/Phase4LandingBuilder.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Replace Vercel Buttons
old_vercel = """            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
            </div>"""

new_vercel = """            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-5">
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
            </div>"""

if old_vercel in content:
    content = content.replace(old_vercel, new_vercel)
    print("Vercel UI replaced")
else:
    print("Could not find Vercel UI")

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
