const fs = require('fs');

const path = 'src/pages/fabrica/FabricaDashboardES.tsx';
let content = fs.readFileSync(path, 'utf-8');
const lines = content.split('\n');

// 1. Add supabase import if it's missing
let hasSupabase = false;
let importIndex = -1;
for(let i = 0; i < lines.length; i++) {
    if(lines[i].includes('import { supabase } from "@/integrations/supabase/client";')) {
        hasSupabase = true;
    }
    if(lines[i].startsWith('import ') && importIndex === -1) {
        importIndex = i; // just remember where imports start
    }
}
if (!hasSupabase) {
    lines.splice(2, 0, 'import { supabase } from "@/integrations/supabase/client";');
}

// 2. Add publishedSites state and useEffect
let hasPublishedSites = false;
let stateInsertIndex = -1;
for(let i = 0; i < lines.length; i++) {
    if(lines[i].includes('const [publishedSites, setPublishedSites]')) {
        hasPublishedSites = true;
    }
    if(lines[i].includes('const handleSaveProject = async () => {')) {
        stateInsertIndex = i - 1; 
    }
}

if (!hasPublishedSites && stateInsertIndex !== -1) {
    const stateLogic = `
  // Sitios publicados reales (canvaviagem.com) de este usuario
  const [publishedSites, setPublishedSites] = useState<{ id: string; updated_at: string }[]>([]);
  // Leads reales capturados (sincronizado con CRM Fase 5)
  const [realLeadsCount, setRealLeadsCount] = useState<number>(0);

  useEffect(() => {
    if (!user?.id) return;
    let cancelled = false;
    (async () => {
      try {
        const { data: sites } = await supabase
          .from("public_sites")
          .select("id, updated_at")
          .eq("owner_id", user.id)
          .order("updated_at", { ascending: false });
        if (!cancelled && sites) setPublishedSites(sites);

        const { count } = await supabase
          .from("analytics_events")
          .select("*", { count: "exact", head: true })
          .eq("event_type", "lead_captured")
          .contains("event_data", { agency_id: user.id });
        if (!cancelled) setRealLeadsCount(count || 0);
      } catch (e) {
        console.warn("[FabricaDashboardES] Fallo al sincronizar sitios/leads:", e);
      }
    })();
    return () => { cancelled = true; };
  }, [user?.id, state.siteContent?.canvaViagemUrl, state.siteContent?.vercelUrl]);
`;
    lines.splice(stateInsertIndex, 0, stateLogic);
}

// 3. Add the UI block below the physical address (map) section
let uiInsertIndex = -1;
for(let i = 0; i < lines.length; i++) {
    // Look for the end of the left column.
    // In FabricaDashboardES, it's before the Right Side Package Management
    if(lines[i].includes('{/* Right Side: Package Management (7 Cols) */}')) {
        uiInsertIndex = i - 2;
        break;
    }
}

if (uiInsertIndex !== -1) {
    const uiBlock = `
          {/* CARD RESUMO & HISTÓRICO DO USUÁRIO */}
          <div className="mt-6 bg-[#0F0F11]/90 border border-white/5 rounded-3xl p-6 backdrop-blur-xl shadow-xl space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black text-white/60 uppercase tracking-widest flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-violet-400" />
                Resumen e Historial de tu Fábrica
              </h3>
              <span className="text-[9px] text-white/30 uppercase font-semibold">Sólo tu contenido</span>
            </div>

            {/* Cards de contagem */}
            <div className="grid grid-cols-3 gap-3">
              <div 
                onClick={() => onNavigate?.("phase", 1)}
                className="bg-white/[0.02] border border-white/5 rounded-2xl p-4 text-center cursor-pointer hover:bg-white/[0.06] hover:border-violet-500/30 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
              >
                <div className="w-8 h-8 rounded-xl bg-violet-500/10 text-violet-400 flex items-center justify-center mx-auto mb-2">
                  <ImageIcon className="w-4 h-4" />
                </div>
                <div className="text-2xl font-black text-white leading-none">{state.allGeneratedAdImages?.length || 0}</div>
                <div className="text-[9px] font-bold text-white/40 uppercase tracking-wider mt-1.5">Imágenes generadas</div>
              </div>
              <div 
                onClick={() => onNavigate?.("phase", 2)}
                className="bg-white/[0.02] border border-white/5 rounded-2xl p-4 text-center cursor-pointer hover:bg-white/[0.06] hover:border-emerald-500/30 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
              >
                <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto mb-2">
                  <Globe className="w-4 h-4" />
                </div>
                <div className="text-2xl font-black text-white leading-none">{publishedSites.length}</div>
                <div className="text-[9px] font-bold text-white/40 uppercase tracking-wider mt-1.5">Sitios publicados</div>
                {publishedSites.length > 0 && (
                   <div className="text-[9px] text-zinc-500/80 mb-2 leading-tight">
                     Tip: Para editar uno de estos sitios, haz clic en el botón <b>"Editar Sitio"</b> abajo.
                   </div>
                )}
              </div>
              <div 
                onClick={() => onNavigate?.("phase", 3)}
                className="bg-white/[0.02] border border-white/5 rounded-2xl p-4 text-center cursor-pointer hover:bg-white/[0.06] hover:border-amber-500/30 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
              >
                <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center mx-auto mb-2">
                  <Package className="w-4 h-4" />
                </div>
                <div className="text-2xl font-black text-white leading-none">{realLeadsCount}</div>
                <div className="text-[9px] font-bold text-white/40 uppercase tracking-wider mt-1.5">Leads capturados</div>
              </div>
            </div>

            {/* Histórico de sites publicados no canvaviagem.com */}
            {publishedSites.length > 0 && (
              <div>
                <div className="text-[10px] font-bold text-white/40 uppercase tracking-wider mb-2">
                  Sitios publicados ({publishedSites.length})
                </div>
                <div className="space-y-1.5">
                  {publishedSites.map((site) => {
                    const url = \`https://\${site.id}.canvaviagem.com\`;
                    return (
                      <div key={site.id} className="flex items-center gap-2">
                        <a
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl bg-emerald-500/5 border border-emerald-500/15 hover:bg-emerald-500/10 transition-all group"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <Globe className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                            <span className="text-xs text-white/85 font-semibold truncate">{site.id}.canvaviagem.com</span>
                          </div>
                          <ExternalLink className="w-3.5 h-3.5 text-white/40 group-hover:text-white shrink-0" />
                        </a>
                        <button
                          type="button"
                          onClick={() => {
                            const p = savedProjects?.find((x: any) => x.id === site.id);
                            if (p && p.state_snapshot) {
                              const currentName = state.agencyName || 'Sin nombre';
                              const targetName = p.agency_name || 'Sin nombre';
                              if (state.agencyName && p.id !== state.projectId) {
                                const ok = window.confirm(\`⚠️ Tienes ediciones no guardadas en el proyecto "\${currentName}".\\n\\nSi continúas, estas ediciones se perderán.\\n\\n¿Deseas cargar "\${targetName}" para editar?\`);
                                if (!ok) return;
                              }
                              window.dispatchEvent(new CustomEvent("fabrica-load-snapshot", { detail: { ...p.state_snapshot, projectId: p.id } }));
                              toast.success(\`📂 ¡Proyecto "\${targetName}" cargado!\`);
                              setTimeout(() => onNavigate?.("phase", 2), 100);
                            } else {
                               toast.error("Proyecto no encontrado o datos inválidos.");
                            }
                          }}
                          className="px-3 py-2.5 rounded-xl bg-violet-500/10 border border-violet-500/20 hover:bg-violet-500/20 text-violet-400 text-xs font-bold transition-all shrink-0 flex items-center gap-1.5"
                        >
                          <Pencil className="w-3.5 h-3.5" /> Editar Sitio
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Histórico de imagens geradas (miniaturas) */}
            {(state.allGeneratedAdImages?.length || 0) > 0 && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="text-[10px] font-bold text-white/40 uppercase tracking-wider">Últimas imágenes generadas</div>
                  <span className="text-[9px] text-white/30">{state.allGeneratedAdImages!.length} en total</span>
                </div>
                <div className="grid grid-cols-6 gap-1.5">
                  {state.allGeneratedAdImages!.slice(-6).reverse().map((src, i) => (
                    <a
                      key={i}
                      href={src}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="aspect-square rounded-lg overflow-hidden border border-white/5 hover:border-violet-500/40 transition-all bg-white/[0.02]"
                    >
                      <img src={src} alt={\`Generación \${i + 1}\`} className="w-full h-full object-cover" loading="lazy" />
                    </a>
                  ))}
                </div>
              </div>
            )}

            {(state.allGeneratedAdImages?.length || 0) === 0 && !state.siteContent?.vercelUrl && (
              <p className="text-[11px] text-white/40 italic text-center py-2">
                Tu historial aparecerá aquí tan pronto como generes tus primeras imágenes o publiques tu primer sitio.
              </p>
            )}
            
            {/* Call to action de Avançar para Fase 1 */}
            <div className="pt-2 border-t border-white/5">
              <button
                onClick={() => onNavigate?.("phase", 1)}
                className="w-full py-3 rounded-xl bg-white/[0.03] hover:bg-violet-500/10 border border-white/5 hover:border-violet-500/30 text-white/60 hover:text-violet-400 text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2"
              >
                <Plus className="w-3.5 h-3.5" /> Comenzar Nuevo Proyecto (Fase 1)
              </button>
            </div>
          </div>
`;
    // ensure we don't insert duplicate blocks
    if (!content.includes('Resumen e Historial de tu Fábrica')) {
        lines.splice(uiInsertIndex, 0, uiBlock);
    }
}

fs.writeFileSync(path, lines.join('\\n'));
console.log("Updated FabricaDashboardES.tsx");
