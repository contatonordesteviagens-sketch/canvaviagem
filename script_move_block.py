import os

file_path = "src/pages/fabrica/Phase3ArtFactoryES.tsx"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Update perPage
content = content.replace("perPage: 12,", "perPage: 40,")

# 2. Extract the photo block
# It starts at:           {genMode === "photo" && (
# It ends right before:           <MinimizableCard title="📝 Datos del anuncio">
import re

pattern = r'(\s*\{genMode === "photo" && \(\s*<MinimizableCard title="📷 Elegir una foto real">.*?\s*</MinimizableCard>\s*\)\}\s*\{genMode === "custom" && \(\s*<MinimizableCard title="🖼️ Su imagen de referencia">.*?\s*</MinimizableCard>\s*\)\})'
match = re.search(pattern, content, re.DOTALL)

if match:
    block = match.group(1)
    
    # Remove block from original location
    content = content.replace(block, "")
    
    # Add LATAM quick search chips inside the photo block
    chips_html = """
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {["Cancún", "Punta Cana", "Buenos Aires", "Bariloche", "Santiago", "Cartagena", "Orlando", "Miami"].map(dest => (
                    <button
                      key={dest}
                      onClick={() => { setPhotoQuery(dest); searchPhotos(dest); }}
                      className="px-2 py-1 bg-white/5 hover:bg-white/10 rounded-md text-[10px] text-white/70 transition-colors border border-white/10"
                    >
                      {dest}
                    </button>
                  ))}
                </div>"""
                
    # Insert chips right after the search input div
    search_div_end = '                    </button>\n                  </div>'
    block_with_chips = block.replace(search_div_end, search_div_end + chips_html)
    
    # Insert block right before <MinimizableCard title="👤 Perfil y Canales de Atención">
    target = '        <div className="w-full space-y-6">\n          <MinimizableCard title="👤 Perfil y Canales de Atención">'
    if target in content:
        content = content.replace(target, '        <div className="w-full space-y-6">\n' + block_with_chips + '\n          <MinimizableCard title="👤 Perfil y Canales de Atención">')
        
        with open(file_path, "w", encoding="utf-8") as f:
            f.write(content)
        print("Success: Block moved, chips added, and perPage updated.")
    else:
        print("Error: Could not find target location to insert block.")
else:
    print("Error: Could not find the photo block to extract.")
