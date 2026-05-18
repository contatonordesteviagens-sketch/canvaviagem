const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'src', 'pages', 'fabrica', 'Phase3ArtFactoryES.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// Normalize CRLF to LF for reliable matching
content = content.replace(/\r\n/g, '\n');

// 1. Replace searchEngine state definition
const oldState = '  const [searchEngine, setSearchEngine] = useState<"pexels" | "google" | "galeria">("pexels");';
const newState = '  const [searchEngine, setSearchEngine] = useState<"pexels" | "google" | "galeria" | "geradas">("pexels");';

if (content.includes(oldState)) {
  content = content.replace(oldState, newState);
  console.log("State replaced successfully!");
} else {
  console.log("State old string not found!");
}

// 2. Replace the photo panel selection block
const oldPanelStart = '      {/* 1b · Galeria Pexels/Google (modo foto) */}\n      {genMode === "photo" && (\n        <div className={sectionCls}>\n          <div className="flex items-center justify-between mb-4">\n            <h3 className="text-xs font-bold text-white/60 uppercase tracking-widest">1 · Elige una foto real</h3>';

const oldPanelEnd = '                  <ImageIcon className="w-8 h-8 text-white/20 mx-auto mb-2" />\n                  <p className="text-sm font-bold text-white/70 mb-1">Galeria ainda vazia</p>\n                  <p className="text-[11px] text-white/40">\n                    Tus fotos aparecerán aquí automáticamente tan pronto como subas fotos al sitio o generes anuncios.\n                  </p>\n                </div>\n              )}\n            </>\n          )}\n        </div>\n      )}';

// Let's find index of oldPanelStart and index of oldPanelEnd
const startIndex = content.indexOf(oldPanelStart);
if (startIndex !== -1) {
  const endIndex = content.indexOf(oldPanelEnd, startIndex);
  if (endIndex !== -1) {
    const fullOldBlock = content.substring(startIndex, endIndex + oldPanelEnd.length);
    
    const newBlock = `      {/* 1b · Galeria Pexels/Google (modo foto) */}
      {genMode === "photo" && (
        <div className={sectionCls}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-bold text-white/60 uppercase tracking-widest">1 · Elige una foto real</h3>
            <div className="flex bg-black/40 p-1 rounded-lg border border-white/10 scale-90 origin-right flex-nowrap">
              {[
                { id: "pexels", label: "Pexels (Top)" },
                { id: "google", label: "Google/Web" },
                { id: "galeria", label: "🖼️­  Mi Galería" },
                { id: "geradas", label: "⚡ Artes Creadas" }
              ].map((eng) => (
                <button
                  key={eng.id}
                  onClick={() => setSearchEngine(eng.id as any)}
                  className={\`px-2 py-1.5 rounded-md text-[9px] uppercase tracking-wider font-bold transition-all whitespace-nowrap \${
                    searchEngine === eng.id 
                      ? (eng.id === "galeria" ? "bg-indigo-500 text-white shadow-md" : "bg-orange-500 text-white shadow-md" : "bg-white/10 text-white") 
                      : "text-white/40 hover:text-white"
                  }\`}
                >
                  {eng.label}
                </button>
              ))}
            </div>
          </div>

          {searchEngine === "pexels" || searchEngine === "google" ? (
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
                        Ver mais fotos ({photos.length - visiblePhotoCount} restantes)
                      </button>
                    )}
                  </>
                );
              })() : (
                <div className="py-8 text-center text-[11px] text-white/40">
                  {searchingPhotos ? "Buscando inspirações..." : "Ingresa un destino y haz clic en buscar."}
                </div>
              )}
            </>
          ) : searchEngine === "galeria" ? (
            <>
              {/* NUEVO RENDER DE LA GALERÍA DE LA AGENCIA */}
              <p className="text-[10px] text-indigo-300/80 mb-3 leading-relaxed font-medium">
                📸 Fotos utilizadas recientemente en tu Sitio y anuncios generados. 
                Centralizadas e reutilizáveis instantaneamente.
              </p>
              {(state.siteContent.galleryImages || []).length > 0 ? (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-80 overflow-y-auto pr-1 custom-scrollbar">
                  {(state.siteContent.galleryImages || []).map((imgUrl: string, idx: number) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedPhotoUrl(imgUrl)}
                      className={\`relative aspect-square rounded-lg overflow-hidden border-2 transition-all \${
                        selectedPhotoUrl === imgUrl ? "scale-95" : "border-white/10 hover:border-white/30"
                      }\`}
                      style={selectedPhotoUrl === imgUrl ? { borderColor: secondaryColor, borderWidth: 3 } : undefined}
                    >
                      <img src={imgUrl} alt="Foto da Galeria" className="w-full h-full object-cover" />
                      {selectedPhotoUrl === imgUrl && (
                        <div className="absolute inset-0 flex items-center justify-center" style={{ background: \`\${primaryColor}cc\` }}>
                          <Check className="w-8 h-8 text-white" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="p-8 border border-dashed border-white/10 rounded-xl text-center">
                  <ImageIcon className="w-8 h-8 text-white/20 mx-auto mb-2" />
                  <p className="text-sm font-bold text-white/70 mb-1">Galeria ainda vazia</p>
                  <p className="text-[11px] text-white/40">
                    Tus fotos aparecerán aquí automáticamente tan pronto como subas fotos al sitio o generes anuncios.
                  </p>
                </div>
              )}
            </>
          ) : (
            <>
              {/* ABA DE TODAS AS ARTES DE ANÚNCIOS GERADOS COM SALVAMENTO E EXCLUSÃO (DEVE TER UMA ABA DE TODAS AS IMAGENS QUE FORAM GERADAS) */}
              <p className="text-[10px] text-orange-300/80 mb-3 leading-relaxed font-medium">
                ⚡ Todos los anuncios creados con IA en tu cuenta. Haz clic para usarlos como fondo o descargarlos directamente.
              </p>
              {(state.allGeneratedAdImages || []).length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-96 overflow-y-auto pr-1 custom-scrollbar">
                  {(state.allGeneratedAdImages || []).map((imgUrl: string, idx: number) => (
                    <div
                      key={idx}
                      className={\`relative group aspect-[4/5] rounded-xl overflow-hidden border-2 transition-all bg-black/40 \${
                        selectedPhotoUrl === imgUrl ? "scale-95" : "border-white/10 hover:border-white/30"
                      }\`}
                      style={selectedPhotoUrl === imgUrl ? { borderColor: secondaryColor, borderWidth: 3 } : undefined}
                    >
                      <img src={imgUrl} alt="Arte Gerada" className="w-full h-full object-cover" />
                      
                      {/* Hover Overlay com controles */}
                      <div className="absolute inset-0 bg-black/75 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-3 gap-2 text-center">
                        <button
                          onClick={() => setSelectedPhotoUrl(imgUrl)}
                          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-1.5 px-2 rounded-lg text-[10px] uppercase tracking-wider flex items-center justify-center gap-1 cursor-pointer border-0"
                        >
                          <Check className="w-3.5 h-3.5" /> Usar Fondo
                        </button>
                        <button
                          onClick={() => {
                            const link = document.createElement("a");
                            link.href = imgUrl;
                            link.download = \`anuncio-fabrica-\${idx + 1}.png\`;
                            link.click();
                            toast.success("¡Descarga iniciada!");
                          }}
                          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-1.5 px-2 rounded-lg text-[10px] uppercase tracking-wider flex items-center justify-center gap-1 cursor-pointer border-0"
                        >
                          <Download className="w-3.5 h-3.5" /> Descargar PNG
                        </button>
                        <button
                          onClick={() => {
                            const updated = (state.allGeneratedAdImages || []).filter((_, i) => i !== idx);
                            update({ allGeneratedAdImages: updated });
                            toast.success("Anuncio eliminado del historial");
                          }}
                          className="w-full bg-red-500/20 hover:bg-red-500/40 text-red-300 font-bold py-1 px-2 rounded-lg text-[9px] uppercase tracking-wider flex items-center justify-center gap-1 cursor-pointer border-0"
                        >
                          <Trash2 className="w-3 h-3" /> Anuncio eliminado
                        </button>
                      </div>

                      {/* Selected indicator */}
                      {selectedPhotoUrl === imgUrl && (
                        <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center shadow-lg">
                          <Check className="w-4 h-4 text-white" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 border border-dashed border-white/10 rounded-xl text-center">
                  <ImageIcon className="w-8 h-8 text-white/20 mx-auto mb-2" />
                  <p className="text-sm font-bold text-white/70 mb-1">Aún no hay anuncios creados</p>
                  <p className="text-[11px] text-white/40">
                    Crea tu primer anuncio para ver todas tus artes archivadas de forma segura aquí.
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      )}`;

    content = content.replace(fullOldBlock, newBlock);
    console.log("Panel replaced successfully!");
  } else {
    console.log("End panel not found!");
  }
} else {
  console.log("Start panel not found!");
}

// 3. Let's do the three 'update({ generatedAdImage:' additions in ES.
// A. Photo Generation
const oldPhotoUpdate = '        update({ generatedAdImage: composed[composed.length - 1], primaryColor: palette.primary });';
const newPhotoUpdate = `        const currentGenerated = state.allGeneratedAdImages || [];
        const updatedGenerated = [composed[composed.length - 1], ...currentGenerated].slice(0, 30);
        update({ 
          generatedAdImage: composed[composed.length - 1], 
          primaryColor: palette.primary,
          allGeneratedAdImages: updatedGenerated
        });`;

if (content.includes(oldPhotoUpdate)) {
  content = content.replace(oldPhotoUpdate, newPhotoUpdate);
  console.log("Photo update replaced!");
}

// B. AI Generation
const oldAiUpdate = '        update({ generatedAdImage: images[images.length - 1], primaryColor: palette.primary });';
const newAiUpdate = `        const currentGenerated = state.allGeneratedAdImages || [];
        const updatedGenerated = [images[images.length - 1], ...currentGenerated].slice(0, 30);
        update({ 
          generatedAdImage: images[images.length - 1], 
          primaryColor: palette.primary,
          allGeneratedAdImages: updatedGenerated
        });`;

if (content.includes(oldAiUpdate)) {
  content = content.replace(oldAiUpdate, newAiUpdate);
  console.log("AI update replaced!");
}

// C. Custom Generation
const oldCustomUpdate = '      update({ generatedAdImage: imagesCustom[imagesCustom.length - 1], primaryColor: palette.primary });';
const newCustomUpdate = `      const currentGenerated = state.allGeneratedAdImages || [];
      const updatedGenerated = [imagesCustom[imagesCustom.length - 1], ...currentGenerated].slice(0, 30);
      update({ 
        generatedAdImage: imagesCustom[imagesCustom.length - 1], 
        primaryColor: palette.primary,
        allGeneratedAdImages: updatedGenerated
      });`;

if (content.includes(oldCustomUpdate)) {
  content = content.replace(oldCustomUpdate, newCustomUpdate);
  console.log("Custom update replaced!");
}

fs.writeFileSync(filePath, content, 'utf8');
console.log("ES File patched successfully!");
