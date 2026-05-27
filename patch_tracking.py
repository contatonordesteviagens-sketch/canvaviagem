import sys

file_path = 'src/pages/fabrica/Phase4LandingBuilder.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

tracking_block = """
        <div className="mt-6 p-5 rounded-xl border border-white/10 bg-white/[0.02] text-left">
          <h4 className="text-sm font-bold text-white mb-4">Configurações de Rastreamento</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-white/50 uppercase tracking-wider mb-2">
                Meta Pixel ID (Opcional)
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
                Google Analytics ID (Opcional)
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
"""

insert_target = """        <div className="mt-8 pt-8 border-t border-white/10 flex flex-col sm:flex-row gap-4">"""

if insert_target in content:
    content = content.replace(insert_target, tracking_block + '\n' + insert_target)
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)
    print("SUCCESS Phase4")
else:
    print("FAILED Phase4")

# Also for ES
file_path_es = 'src/pages/fabrica/Phase4LandingBuilderES.tsx'
with open(file_path_es, 'r', encoding='utf-8') as f:
    content_es = f.read()

if insert_target in content_es:
    content_es = content_es.replace(insert_target, tracking_block + '\n' + insert_target)
    with open(file_path_es, 'w', encoding='utf-8') as f:
        f.write(content_es)
    print("SUCCESS Phase4 ES")
else:
    print("FAILED Phase4 ES")
