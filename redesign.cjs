const fs = require('fs');

const file = 'src/pages/fabrica/Phase4LandingBuilder.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. We need to extract the Pixel and GA section from the Vercel block and remove it.
const pixelBlockRegex = /<div className="grid grid-cols-2 gap-4 mt-4">[\s\S]*?<\/div>\s*<\/div>\s*\{showVercelConfig/;
content = content.replace(pixelBlockRegex, '{showVercelConfig');

// 2. We will redefine the buttons for Vercel
const vercelButtonsRegex = /<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">\s*<button[\s\S]*?<\/button>\s*<\/div>/;
const vercelButtonsNew = `<div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-5">
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
            </div>`;
content = content.replace(vercelButtonsRegex, vercelButtonsNew);

// 3. We will redefine the buttons for Canva Viagem
const canvaButtonsRegex = /<div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">\s*<button[\s\S]*?<\/button>\s*<\/div>/;
const canvaButtonsNew = `<div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-5">
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
            </div>`;
content = content.replace(canvaButtonsRegex, canvaButtonsNew);

// 4. Now, let's insert the Pixel section below the Canva Viagem block and above "Opções Avançadas"
const pixelAndGaSection = `
        <div className="mt-6 p-5 rounded-xl border border-white/10 bg-white/[0.02] text-left">
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
`;

content = content.replace('<details className="mt-6 p-4 rounded-xl border border-white/10 bg-white/[0.02] group text-left">', pixelAndGaSection + '\n        <details className="mt-4 p-4 rounded-xl border border-white/10 bg-white/[0.02] group text-left">');

// 5. Let's make the "Nova opção experimental" and Vercel titles more uniform
content = content.replace('border-cyan-400/30 bg-cyan-400/[0.05]', 'border-white/10 bg-white/[0.02]');
content = content.replace('text-cyan-300 uppercase', 'text-white/40 uppercase');
content = content.replace('text-cyan-300 flex-shrink-0', 'text-white/40 flex-shrink-0');
content = content.replace('bg-cyan-400/10 border-cyan-300/25', 'bg-white/5 border-white/10');
content = content.replace('text-cyan-300 uppercase tracking-wider', 'text-white/50 uppercase tracking-wider');
content = content.replace('bg-cyan-400 hover:bg-cyan-300 text-black', 'bg-white hover:bg-gray-200 text-black');

// Vercel UI standardization too
content = content.replace('bg-emerald-500/10 border-emerald-500/25', 'bg-white/5 border-white/10');
content = content.replace('text-emerald-400 uppercase tracking-wider', 'text-white/50 uppercase tracking-wider');
content = content.replace('bg-emerald-500 hover:bg-emerald-600 text-white', 'bg-white hover:bg-gray-200 text-black');

// Update input borders
content = content.replace(/focus:border-cyan-300\/70/g, 'focus:border-white/30');

fs.writeFileSync(file, content);
console.log("Redesign complete");
