const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'src', 'pages', 'fabrica', 'Phase3ArtFactoryES.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// Regex matches from the opening curly brace of 1b comment to the closing curly brace of 1c comment, non-greedily
const regex = /\{\/\*\s*1b\s*·\s*Galeria\s*Pexels\/Google\s*\(modo\s*foto\)\s*\*\/\}[\s\S]+?\{\/\*\s*1c\s*·\s*Sua\s*imagem\s*\(modo\s*custom\)\s*\*\/\}[\s\S]+?\{genMode\s*===\s*"custom"\s*&&\s*\(/;

const replacementStr = `{/* 1b · Galeria Pexels (modo foto) - F1 só tem busca Pexels */}
      {genMode === "photo" && (
        <div className={sectionCls}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-bold text-white/60 uppercase tracking-widest">1 · Elige una foto real</h3>
            <span className="text-[9px] font-bold uppercase tracking-wider text-white/30 bg-white/5 px-2 py-1 rounded-md border border-white/10">Pexels (Top)</span>
          </div>

          <>
            {/* Sugestões de destinos populares + os destinos da agência */}
            <div className="flex flex-wrap gap-1.5 mb-3">
              {[...new Set([...(state.destinos || []), ...POPULAR_PHOTO_DESTINATIONS])].slice(0, 14).map((d) => (
                <button
                  key={d}
                  onClick={() => { setDestination(d); searchPhotos(d); }}
                  className={\`px-2.5 py-1 rounded-full text-[11px] border transition-colors \${
                    photoQuery === d ? "text-black" : "bg-white/[0.05] border-white/10 text-white/70 hover:border-white/30"
                  }\`}
                  style={photoQuery === d ? { background: secondaryColor, borderColor: secondaryColor } : undefined}
                >
                  {d}
                </button>
              ))}
            </div>

            <div className="flex gap-2 mb-3">
              <input
                value={photoQuery}
                onChange={(e) => setPhotoQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && searchPhotos()}
                onFocus={(e) => e.target.select()}
                placeholder={destination ? \`Buscar "\${destination}"...\` : "Ex: Maragogi, Paris, Cancún..."}
                className={inputCls}
              />
              <button
                onClick={() => searchPhotos()}
                disabled={searchingPhotos}
                className="px-4 rounded-xl font-bold text-black flex items-center gap-1.5 text-sm disabled:opacity-40 hover:brightness-110"
                style={{ background: secondaryColor }}
              >
                {searchingPhotos ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                Buscar
              </button>
            </div>
            {photos.length > 0 ? (() => {
              const visible = photos.slice(0, visiblePhotoCount);
              const hasMore = visiblePhotoCount < photos.length;
              return (
                <>
                  <div className="grid grid-cols-3 gap-2">
                    {visible.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => setSelectedPhotoUrl(p.url)}
                        className={\`relative aspect-square rounded-lg overflow-hidden border-2 transition-all \${
                          selectedPhotoUrl === p.url ? "scale-95" : "border-white/10 hover:border-white/30"
                        }\`}
                        style={selectedPhotoUrl === p.url ? { borderColor: secondaryColor, borderWidth: 3 } : undefined}
                      >
                        <img src={p.thumb} alt={p.alt} className="w-full h-full object-cover" />
                        {selectedPhotoUrl === p.url && (
                          <div className="absolute inset-0 flex items-center justify-center" style={{ background: \`\${primaryColor}cc\` }}>
                            <Check className="w-8 h-8 text-white" />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                  {hasMore && (
                    <button
                      onClick={() => setVisiblePhotoCount((n) => n + 3)}
                      className="w-full mt-3 py-2.5 rounded-xl border border-white/10 text-white/60 text-sm font-semibold hover:bg-white/[0.06] transition-all flex items-center justify-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Ver más fotos ({photos.length - visiblePhotoCount} restantes)
                    </button>
                  )}
                </>
              );
            })() : (
              <div className="py-8 text-center text-[11px] text-white/40">
                {searchingPhotos ? "Buscando inspiraciones..." : "Ingresa un destino y haz clic en buscar."}
              </div>
            )}
          </>
        </div>
      )}

      {/* 1c · Sua imagem (modo custom) */}
      {genMode === "custom" && (`;

// Discard local edits to Phase3ArtFactoryES.tsx first to ensure clean regex match
const { execSync } = require('child_process');
try {
  execSync('git checkout -- src/pages/fabrica/Phase3ArtFactoryES.tsx', { cwd: path.join(__dirname, '..') });
  console.log('Successfully discarded Phase3ArtFactoryES.tsx local changes first!');
} catch (e) {
  console.warn('Could not run git checkout, continuing with current file content...');
}

let contentFresh = fs.readFileSync(filePath, 'utf8');
if (regex.test(contentFresh)) {
  contentFresh = contentFresh.replace(regex, replacementStr);
  fs.writeFileSync(filePath, contentFresh, 'utf8');
  console.log('SUCCESS: Successfully updated Phase3ArtFactoryES.tsx using regex curly match!');
} else {
  console.error('ERROR: Could not find regex match in Phase3ArtFactoryES.tsx.');
}
