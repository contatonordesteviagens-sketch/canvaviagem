import { useState } from "react";
import { useFabricaContext, type Niche, type AgencyType } from "@/hooks/useFabricaContext";
import { calculateScore, getChecklistByLevel } from "@/lib/fabrica-scoring-es";
import { generateDiagnosticoPDF, openWhatsappWithResumo } from "@/lib/fabrica-pdf";
import { useSaveDiagnostico, useDiagnosticos } from "@/hooks/useFabricaDiagnosticos";
import { useAuth } from "@/contexts/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, Download, MessageCircle, ArrowRight, Upload, Check, Save, Plus, X, Sparkles, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { WhatsappSendModal } from "@/components/fabrica/WhatsappSendModal";
import { useMarketingTools } from "@/hooks/useContent";
import { extractPaletteFromCanvas } from "@/lib/extract-palette";

const AGENCY_TYPES: { v: AgencyType; l: string }[] = [
  { v: "autonoma", l: "Agente autónomo / Freelancer" },
  { v: "pequena", l: "Agencia pequeña (hasta 3 personas)" },
  { v: "media", l: "Agencia mediana (4-10 personas)" },
  { v: "franquia", l: "Franquicia" },
  { v: "consolidadora", l: "Consolidador" },
  { v: "receptiva", l: "Agencia Receptiva" },
  { v: "milhas", l: "Especialista en Millas" },
  { v: "luxo", l: "Agencia de Lujo / Alto Nivel" },
  { v: "corporativa", l: "Agencia Corporativa (B2B)" },
  { v: "grupos", l: "Especialista en Grupos / Excursiones" },
  { v: "cruzeiros", l: "Especialista en Cruceros" },
  { v: "ecoturismo", l: "Ecoturismo / Aventura" },
  { v: "religioso", l: "Turismo Religioso" },
  { v: "outro", l: "Otro tipo" },
];

type NicheOption = { id: Niche; label: string; emoji: string };

const NICHES_DEFAULT: NicheOption[] = [
  { id: "nordeste", label: "Playa Caribe / Tulum", emoji: "ðŸ–ï¸" },
  { id: "sul", label: "Playa Pacífico / Cancún", emoji: "🌅" },
  { id: "internacional", label: "Internacional", emoji: "âœˆï¸" },
  { id: "cruzeiro", label: "Cruceros", emoji: "🚢" },
  { id: "aventura", label: "Aventura / Ecoturismo", emoji: "â›°ï¸" },
  { id: "luademel", label: "Luna de Miel", emoji: "💕" },
];

// Opções de "carro-chefe / serviço principal" condicionadas ao tipo de agência.
// Usamos os mesmos ids do tipo Niche para reaproveitar destinos/legendas/ofertas.
const NICHES_BY_AGENCY: Partial<Record<AgencyType, NicheOption[]>> = {
  receptiva: [
    { id: "nordeste", label: "Receptivo Caribe", emoji: "ðŸ–ï¸" },
    { id: "sul", label: "Receptivo Pacífico", emoji: "🌅" },
    { id: "aventura", label: "Receptivo Ecoturismo", emoji: "â›°ï¸" },
    { id: "internacional", label: "City Tour / Urbano", emoji: "ðŸ™ï¸" },
    { id: "cruzeiro", label: "Transfer Portuario", emoji: "🚢" },
    { id: "luademel", label: "Rutas Privadas", emoji: "💕" },
  ],
  corporativa: [
    { id: "internacional", label: "Viajes Internacionales Ejecutivos", emoji: "âœˆï¸" },
    { id: "sul", label: "Viajes Nacionales Corporativos", emoji: "ðŸ¢" },
    { id: "luademel", label: "Eventos e Incentivos", emoji: "🎯" },
    { id: "cruzeiro", label: "Convenciones y MICE", emoji: "ðŸ¤" },
    { id: "aventura", label: "Team Building / Retiros", emoji: "â›°ï¸" },
    { id: "nordeste", label: "Workation / Bleisure", emoji: "💼" },
  ],
  religioso: [
    { id: "internacional", label: "Tierra Santa", emoji: "ðŸ•Šï¸" },
    { id: "luademel", label: "Fátima y Santuarios (Europa)", emoji: "⛪" },
    { id: "sul", label: "Santuarios Nacionales", emoji: "ðŸ™" },
    { id: "aventura", label: "Camino de Santiago", emoji: "🥾" },
    { id: "nordeste", label: "Rutas de Peregrinación", emoji: "âœï¸" },
    { id: "cruzeiro", label: "Cruceros Religiosos", emoji: "🚢" },
  ],
  milhas: [
    { id: "internacional", label: "Emisiones Internacionales", emoji: "âœˆï¸" },
    { id: "sul", label: "Emisiones Domésticas", emoji: "🛫" },
    { id: "luademel", label: "Luna de Miel con Millas", emoji: "💕" },
    { id: "nordeste", label: "Paquetes Caribe con Millas", emoji: "ðŸ–ï¸" },
    { id: "cruzeiro", label: "Cruceros + Vuelos con Puntos", emoji: "🚢" },
    { id: "aventura", label: "Rutas Premium / Ejecutiva", emoji: "🥂" },
  ],
  luxo: [
    { id: "internacional", label: "Europa Lujo", emoji: "🇪🇺" },
    { id: "luademel", label: "Maldivas / Bora Bora", emoji: "ðŸï¸" },
    { id: "nordeste", label: "Resorts Premium Caribe", emoji: "ðŸ–ï¸" },
    { id: "cruzeiro", label: "Cruceros de Lujo", emoji: "🚢" },
    { id: "aventura", label: "Safaris / Expediciones", emoji: "ðŸ¦" },
    { id: "sul", label: "Destinos de Nieve Premium", emoji: "ðŸ·" },
  ],
  grupos: [
    { id: "internacional", label: "Excursiones Internacionales", emoji: "âœˆï¸" },
    { id: "sul", label: "Excursiones Pacífico / Nieve", emoji: "🚌" },
    { id: "nordeste", label: "Caravanas Caribe", emoji: "ðŸ–ï¸" },
    { id: "luademel", label: "Grupos de Tercera Edad", emoji: "👵" },
    { id: "aventura", label: "Grupos de Ecoturismo", emoji: "â›°ï¸" },
    { id: "cruzeiro", label: "Grupos en Cruceros", emoji: "🚢" },
  ],
  cruzeiros: [
    { id: "cruzeiro", label: "Cruceros por la Costa LATAM", emoji: "🇧🇷" },
    { id: "internacional", label: "Cruceros Caribe", emoji: "🌴" },
    { id: "luademel", label: "Cruceros Mediterráneo", emoji: "ðŸ›³ï¸" },
    { id: "aventura", label: "Cruceros Fiordos / Alaska", emoji: "🧊" },
    { id: "nordeste", label: "Cruceros Temáticos", emoji: "🎤" },
    { id: "sul", label: "Cruceros Fluviales", emoji: "🚢" },
  ],
  ecoturismo: [
    { id: "aventura", label: "Montañas y Senderos", emoji: "â›°ï¸" },
    { id: "nordeste", label: "Desiertos / Oasis", emoji: "ðŸœï¸" },
    { id: "sul", label: "Selvas / Safari Pantanales", emoji: "ðŸ " },
    { id: "internacional", label: "Patagonia / Atacama", emoji: "ðŸ”ï¸" },
    { id: "luademel", label: "Eco Lodges", emoji: "🌿" },
    { id: "cruzeiro", label: "Expediciones Amazonia", emoji: "🛶" },
  ],
  consolidadora: [
    { id: "internacional", label: "Aéreo Internacional", emoji: "âœˆï¸" },
    { id: "sul", label: "Aéreo Doméstico", emoji: "🛫" },
    { id: "luademel", label: "Hotelería Internacional", emoji: "ðŸ¨" },
    { id: "nordeste", label: "Hotelería Nacional", emoji: "ðŸ–ï¸" },
    { id: "cruzeiro", label: "Cruceros (B2B)", emoji: "🚢" },
    { id: "aventura", label: "Paquetes Operadores", emoji: "📦" },
  ],
  franquia: NICHES_DEFAULT,
  autonoma: NICHES_DEFAULT,
  pequena: NICHES_DEFAULT,
  media: NICHES_DEFAULT,
  outro: NICHES_DEFAULT,
};

// Destinos sugeridos por tipo de agência (usado quando faz mais sentido que niche)
const DESTINOS_BY_AGENCY: Partial<Record<AgencyType, string[]>> = {
  receptiva: ["City Tour completo", "Traslado aeropuerto", "Paseo en buggy", "Paseo en barco", "Tour gastronómico", "Tour histórico", "Day use en resort", "Paseo fotográfico"],
  corporativa: ["Reuniones ejecutivas", "Convenciones nacionales", "Convenciones internacionales", "Viajes de incentivo", "Eventos corporativos", "Team building", "Ferias y congresos", "Bleisure / Workation"],
  religioso: ["Terra Santa (Israel)", "Fátima (Portugal)", "Lourdes (França)", "Roma / Vaticano", "Aparecida (Brasil)", "Santuarios locales", "Camino de Santiago", "Medjugorje"],
  milhas: ["Emisión con Millas Smiles", "Emisión con Latam Pass", "Emisión con Azul", "Emisión con Livelo", "Emisión con Esfera", "Upgrade a Ejecutiva", "Estrategia de puntos", "Tarjetas / programas"],
  luxo: ["Maldivas", "Bora Bora", "Dubai", "Santorini", "Safári África", "Aspen", "Toscana", "Polinésia"],
  grupos: ["Excursión Bariloche", "Excursión Cancún", "Excursión Parques Temáticos", "Caravana Religiosa", "Excursión Disney", "Excursión Buenos Aires", "Crucero en grupo", "Excursión Cataratas"],
  cruzeiros: ["Crucero Costa LATAM", "Crucero Caribe", "Crucero Mediterráneo", "Crucero Fiordos", "Crucero Alaska", "Crucero Temático", "Crucero Disney", "Crucero Año Nuevo"],
  ecoturismo: ["Ecoturismo / Selva", "Montañas y Ríos", "Parques Nacionales", "Desiertos y Oasis", "Dunas y Lagunas", "Safari Pantanal", "Riviera Maya", "Patagônia"],
  consolidadora: ["Paquetes de Operadores", "Paquetes Mayoristas", "Paquetes Online", "Hotelería nacional", "Hotelería internacional", "Vuelos nacionales", "Vuelos internacionales", "Seguro de viaje"],
};

interface Props {
  onComplete: () => void;
  onBack: () => void;
}

export const Phase1DiagnosticoES = ({ onComplete, onBack }: Props) => {
  const { state, update, reset } = useFabricaContext();
  const { user } = useAuth();
  const { data: savedProjects } = useDiagnosticos();
  const [loading, setLoading] = useState(false);
  const [projectsPanelOpen, setProjectsPanelOpen] = useState(false);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const MAX = 250;
        let w = img.width, h = img.height;
        if (w > h) { if (w > MAX) { h *= MAX / w; w = MAX; } }
        else { if (h > MAX) { w *= MAX / h; h = MAX; } }
        canvas.width = w; canvas.height = h;
        canvas.getContext("2d")?.drawImage(img, 0, 0, w, h);
        
        // Limpa chaves pesadas legadas para liberar espaço no localStorage
        try {
          Object.keys(localStorage).forEach((key) => {
            if (key.startsWith("fabrica-heavy-v1:") && key !== "fabrica-heavy-v1:logoBase64") {
              localStorage.removeItem(key);
            }
          });
        } catch (e) {
          console.warn("Clean storage failed", e);
        }

        const base64 = canvas.toDataURL("image/webp", 0.8);
        update({ logoBase64: base64 });
        toast.success("¡Logo actualizado!");
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const [formStep, setFormStep] = useState(1);

  const finalize = () => {
    const result = calculateScore(state);
    update({
      digitalScore: result.digitalScore,
      scoreBreakdown: result.scoreBreakdown,
      level: result.level,
      gargalos: result.gargalos,
      diagnosticoCompleto: true,
    });
  };

  if (state.diagnosticoCompleto) {
    return <DiagnosticoResult onNext={onComplete} onBack={onBack} onEdit={() => { update({ diagnosticoCompleto: false }); setFormStep(1); }} />;
  }

  const nicheOptions = (state.agencyType && NICHES_BY_AGENCY[state.agencyType as AgencyType]) || NICHES_DEFAULT;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Proyectos Guardados */}
                    {user && (
                <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl relative overflow-hidden transition-all shadow-[0_4px_20px_rgba(0,0,0,0.2)]">
                  <div className="absolute top-0 left-0 w-1 h-full" style={{ background: state.primaryColor || "#F59E0B" }}></div>
                  <button
                    type="button"
                    onClick={() => setProjectsPanelOpen(!projectsPanelOpen)}
                    className="w-full flex items-center justify-between text-[11px] text-white/60 font-bold uppercase tracking-wider outline-none text-left"
                  >
                    <span className="flex items-center gap-1.5">📂 Proyectos Guardados {savedProjects && savedProjects.length > 0 && `(${savedProjects.length})`}</span>
                    <span className="text-[10px] text-white/30 font-medium">{projectsPanelOpen ? "▲ Contraer" : "▼ Expandir / Cargar"}</span>
                  </button>
                  
                  {projectsPanelOpen && (
                    <div className="mt-3 flex flex-col sm:flex-row gap-2 pt-2 border-t border-white/5">
                      {savedProjects && savedProjects.length > 0 ? (
                        <select
                          onChange={(e) => {
                            const p = savedProjects.find(x => x.id === e.target.value);
                            if (p && p.state_snapshot) {
                               update({ 
                                 ...p.state_snapshot, 
                                 currentPhase: state.currentPhase, 
                                 diagnosticoCompleto: false 
                               });
                               toast.success(`¡Proyecto "${p.agency_name || 'Sin Nombre'}" cargado! Todas las configuraciones han sido restauradas.`);
                            }
                            e.target.value = "";
                          }}
                          className="flex-1 bg-white/[0.04] border border-white/10 rounded-lg px-3 py-2 text-white outline-none focus:border-white/30 transition-colors text-xs"
                        >
                          <option value="" className="bg-zinc-900">Seleccionar un proyecto...</option>
                          {savedProjects.map((p) => (
                            <option key={p.id} value={p.id} className="bg-zinc-900">{p.agency_name || "Sin Nombre"} (Guardado el {new Date(p.updated_at).toLocaleDateString()})</option>
                          ))}
                        </select>
                      ) : (
                        <div className="flex-1 bg-white/[0.01] border border-white/5 rounded-lg px-3 py-2 text-white/40 text-xs flex items-center">
                          No se encontraron proyectos guardados
                        </div>
                      )}
                      
                      <button
                        type="button"
                        onClick={() => {
                          const currentPhase = state.currentPhase;
                          reset();
                          setTimeout(() => {
                            update({ currentPhase });
                          }, 50);
                          toast.success("¡Nuevo proyecto iniciado! Las informaciones han sido reiniciadas.");
                        }}
                        className="px-3 py-2 rounded-lg text-white text-xs font-bold transition-all border border-white/10 hover:bg-white/5 active:scale-95 shrink-0 flex items-center justify-center gap-1.5"
                        style={{ borderColor: `${state.primaryColor || "#F59E0B"}40` }}
                      >
                        <span>+ Nuevo</span>
                      </button>
                    </div>
                  )}
                </div>
              )}

      <div className="bg-white/[0.03] border border-white/[0.06] rounded-3xl p-6 backdrop-blur-xl overflow-hidden relative">
        
        {/* Steps Indicator */}
        <div className="flex items-center justify-center gap-4 mb-8">
          {[
            { s: 1, l: "Perfil Estratégico" },
            { s: 2, l: "Madurez Digital" }
          ].map((x) => (
            <div key={x.s} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold transition-all duration-300 ${formStep >= x.s ? 'text-black' : 'bg-white/10 text-white/40'}`}
                   style={formStep >= x.s ? { background: `linear-gradient(135deg, ${state.primaryColor || "#F59E0B"}, #FCD34D)` } : {}}>
                {formStep > x.s ? <Check className="w-4 h-4" /> : x.s}
              </div>
              <span className={`text-[10px] uppercase font-bold tracking-widest ${formStep >= x.s ? 'text-white' : 'text-white/30'}`}>{x.l}</span>
              {x.s === 1 && <div className={`w-12 h-[2px] ${formStep > 1 ? 'bg-green-400' : 'bg-white/10'}`} />}
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {formStep === 1 ? (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-5"
            >
              <h3 className="text-xs font-bold text-white/60 uppercase tracking-widest mb-4 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse" />
                1. Identidad y Perfil de la Agencia
              </h3>

              {/* Campos de identidad ya preenchidos en el Panel Inicial se omiten aquí para simplificar */}
              <div>
                <label className="text-xs text-white/60 uppercase tracking-wider font-semibold block mb-3">Nicho / Producto Estrella *</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {nicheOptions.map((n) => (
                    <button
                      key={n.id}
                      onClick={() => update({ niche: n.id })}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        state.niche === n.id ? "border-2" : "border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.04]"
                      }`}
                      style={state.niche === n.id ? { borderColor: state.primaryColor, background: `${state.primaryColor}1a` } : undefined}
                    >
                      <div className="text-xl mb-1">{n.emoji}</div>
                      <div className="text-[11px] font-bold text-white leading-tight">{n.label}</div>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs text-white/60 uppercase tracking-wider font-semibold block mb-2">Tus principales destinos *</label>
                <DestinosInput destinos={state.destinos} onChange={(d) => update({ destinos: d })} primaryColor={state.primaryColor || "#F59E0B"} />
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <h3 className="text-xs font-bold text-white/60 uppercase tracking-widest mb-6 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                2. Radiografía de Madurez Digital
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FabSelect
                  label="Frecuencia de Publicación *"
                  value={state.postFrequency}
                  onChange={(v) => update({ postFrequency: v })}
                  options={[
                    { v: "diario", l: "Diario (Consistente)" },
                    { v: "semanal", l: "Semanal (Algunas veces)" },
                    { v: "mensal", l: "Mensual (Muy esporádico)" },
                    { v: "raro", l: "Raramente publico" }
                  ]}
                />
                <FabSelect
                  label="Tamaño de la Audiencia *"
                  value={state.followers}
                  onChange={(v) => update({ followers: v })}
                  options={[
                    { v: "0-500", l: "0 a 500 seguidores" },
                    { v: "500-2k", l: "500 a 2.000 seguidores" },
                    { v: "2k-10k", l: "2.000 a 10.000 seguidores" },
                    { v: "10k+", l: "Más de 10.000" }
                  ]}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FabSelect
                  label="Línea Editorial / Contenido *"
                  value={state.contentStrategy || "promo"}
                  onChange={(v) => update({ contentStrategy: v })}
                  options={[
                    { v: "promo", l: "Enfoque 100% en Promociones / Ofertas" },
                    { v: "misto", l: "Mixto (Consejos de valor + Promociones)" }
                  ]}
                />
                <FabField 
                  label="Ventas por mes (Promedio de Cierres) *" 
                  value={state.fechamentosMes} 
                  onChange={(v) => update({ fechamentosMes: v.replace(/\D/g, "") })} 
                  placeholder="Ex: 15" 
                />
              </div>

              <div className="grid grid-cols-1 gap-4">
                <FabSelect
                  label="Cantidad de publicaciones en Instagram *"
                  value={state.instagramPosts || "less_10"}
                  onChange={(v) => update({ instagramPosts: v })}
                  options={[
                    { v: "less_10", l: "Menos de 10 publicaciones (Fase Inicial / Desde Cero)" },
                    { v: "10_20", l: "Entre 10 y 20 publicaciones" },
                    { v: "20_50", l: "Más de 20 publicaciones" },
                    { v: "50_200", l: "Más de 50 publicaciones" },
                    { v: "200_500", l: "Más de 200 publicaciones" },
                    { v: "more_500", l: "Más de 500 publicaciones" }
                  ]}
                />
              </div>

              <div className="bg-white/[0.02] p-4 rounded-2xl border border-white/5 grid grid-cols-1 sm:grid-cols-2 gap-3">
                 <FabToggle label="¿Aparecen personas reales (dueños/equipo)?" value={!!state.hasPeople} onChange={(v) => update({ hasPeople: v })} />
                 <FabToggle label="¿Publicas Reels con frecuencia?" value={!!state.usesReels} onChange={(v) => update({ usesReels: v })} />
                 <FabToggle label="¿Inviertes en Anuncios Pagados (Tráfico)?" value={!!state.investeAds} onChange={(v) => update({ investeAds: v })} />
                 <FabToggle label="¿Tienes Testimonios de Clientes Destacados?" value={!!state.hasDepoimentos} onChange={(v) => update({ hasDepoimentos: v })} />
                 <FabToggle label="¿Publicaste el sitio generado y lo pusiste en el enlace de la bio?" value={!!state.hasBioLink} onChange={(v) => update({ hasBioLink: v })} />
                 <FabToggle label="¿Creaste un grupo VIP de avisos en WhatsApp (solo admin envía)?" value={!!state.whatsappGroupActive} onChange={(v) => update({ whatsappGroupActive: v })} />
                 <FabToggle label="¿Usas voces sintéticas de IA (ElevenLabs / Fish Audio) en Reels?" value={!!state.usesVoiceovers} onChange={(v) => update({ usesVoiceovers: v })} />
                 <FabToggle label="¿Buscas noticias de turismo y compartes fotos de influencers para curaduría?" value={!!state.publishesNews} onChange={(v) => update({ publishesNews: v })} />
                 <FabToggle label="¿Generas 5 nuevas promociones al día en Fábrica y las publicas?" value={!!state.usesFabricaTemplates} onChange={(v) => update({ usesFabricaTemplates: v })} />
              </div>

              <div className="flex gap-3 bg-blue-500/10 border border-blue-500/20 p-3 rounded-xl items-start">
                <div className="text-xl">💡</div>
                <p className="text-[11px] text-blue-200 leading-relaxed">¡Sé 100% transparente! Este diagnóstico es para que TÚ descubras exactamente dónde está el cuello de botella que te impide facturar más.</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Ações do formulário */}
      <div className="flex flex-col sm:flex-row gap-3 mt-6">
        {formStep === 1 ? (
          <>
            <button
              onClick={onBack}
              className="flex-1 py-4 rounded-xl border border-white/10 bg-white/[0.04] text-white/70 font-bold hover:bg-white/[0.08] transition-all"
            >
              Volver
            </button>
            <button
              onClick={() => setFormStep(2)}
              disabled={!state.niche || state.destinos.length === 0}
              className="flex-[2] py-4 rounded-xl font-bold text-black flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed transition-all hover:brightness-110 shadow-lg"
              style={{ background: `linear-gradient(135deg, ${state.primaryColor || "#F59E0B"}, #FCD34D)` }}
            >
              Siguiente Etapa: Diagnóstico <ChevronRight className="w-4 h-4" />
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => setFormStep(1)}
              className="flex-1 py-4 rounded-xl border border-white/10 bg-white/[0.04] text-white/70 font-bold hover:bg-white/[0.08] transition-all"
            >
              Volver
            </button>
            <button
              onClick={finalize}
              disabled={!state.postFrequency || !state.followers || !state.fechamentosMes || !state.instagramPosts}
              className="flex-[2] py-4 rounded-xl font-black text-black flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed transition-all hover:brightness-110 shadow-lg shadow-yellow-500/20 uppercase tracking-wider text-sm"
              style={{ background: `linear-gradient(135deg, #10B981, #FCD34D)` }}
            >
              🔥 Generar Mi Dossier Completo
            </button>
          </>
        )}
      </div>
    </div>
  );
};

const DiagnosticoResult = ({ onNext, onBack, onEdit }: { onNext: () => void; onBack: () => void; onEdit: () => void }) => {
  const { state } = useFabricaContext();
  const { user } = useAuth();
  const result = calculateScore(state);
  const checklist = getChecklistByLevel(result.level, state);
  const saveMutation = useSaveDiagnostico();
  const [waOpen, setWaOpen] = useState(false);
  const { data: tools = [], isLoading: loadingTools } = useMarketingTools();
  const filteredTools = tools.filter((t: any) => !t.title.toLowerCase().includes("vendedor de viagens"));

  const scoreColor = result.digitalScore >= 70 ? "#10B981" : result.digitalScore >= 40 ? "#F59E0B" : "#EF4444";

  const handleSave = () => {
    if (!user) {
      toast.error("Inicia sesión para guardar tu diagnóstico", {
        action: { label: "Entrar", onClick: () => (window.location.href = "/auth") },
      });
      return;
    }
    saveMutation.mutate({
      state,
      score: result.digitalScore,
      level: result.level,
      levelName: result.levelName,
    });
  };

  return (
    <div className="max-w-3xl mx-auto">
      <WhatsappSendModal
        open={waOpen}
        onClose={() => setWaOpen(false)}
        onSend={(phoneFull) => openWhatsappWithResumo(state, phoneFull)}
        defaultPhone={state.whatsapp}
      />
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white text-black rounded-3xl overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-br from-[#0D1425] to-[#1a2744] text-white p-7">
          <div className="text-[10px] font-bold tracking-[2px] mb-2" style={{ color: state.primaryColor }}>DIAGNÓSTICO CANVA VIAGEM</div>
          <h2 className="text-2xl font-extrabold mb-1">{state.agencyName}</h2>
          <p className="text-sm text-white/60 mb-4">{state.city} • @{state.instagram}</p>
        </div>

        {/* Score */}
        <div className="bg-gradient-to-br from-[#f8fffe] to-[#f0faf5] border-b-4 p-7" style={{ borderColor: scoreColor }}>
          <div className="flex items-center gap-6 mb-5">
            <div className="w-24 h-24 rounded-full flex flex-col items-center justify-center text-white font-extrabold flex-shrink-0" style={{ background: scoreColor }}>
              <div className="text-3xl leading-none">{result.digitalScore}</div>
              <div className="text-[10px] opacity-80 mt-0.5">/ 100</div>
            </div>
            <div>
              <div className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: scoreColor }}>Nivel {result.level} — {result.levelName}</div>
              <p className="text-sm text-gray-600 leading-relaxed">{result.levelDescription}</p>
            </div>
          </div>
          <div className="grid grid-cols-5 gap-2 max-sm:grid-cols-2">
            {Object.entries(result.scoreBreakdown).map(([k, v]) => (
              <div key={k} className="bg-white rounded-lg p-2.5 border border-gray-200 text-center">
                <div className="text-lg font-extrabold mb-0.5" style={{ color: v >= 70 ? "#10B981" : v >= 40 ? "#F59E0B" : "#EF4444" }}>{v}</div>
                <div className="text-[9px] text-gray-500 font-semibold uppercase tracking-wide">{k}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Body */}
        <div className="p-7">
          <h3 className="text-sm font-extrabold uppercase tracking-wider text-gray-500 mb-4 pb-2 border-b-2 border-gray-100">âš ï¸ Cuellos de botella identificados</h3>
          <div className="space-y-2 mb-7">
            {result.gargalos.map((g, i) => (
              <div key={i} className={`flex gap-3 p-3 rounded-lg ${g.level === "red" ? "bg-red-50 border border-red-200" : g.level === "amber" ? "bg-amber-50 border border-amber-200" : "bg-green-50 border border-green-200"}`}>
                <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${g.level === "red" ? "bg-red-500" : g.level === "amber" ? "bg-amber-500" : "bg-green-500"}`} />
                <div className="text-sm text-gray-700 leading-relaxed"><b className="text-gray-900">{g.dimension}:</b> {g.text}</div>
              </div>
            ))}
          </div>

          <h3 className="text-sm font-extrabold uppercase tracking-wider text-gray-500 mb-4 pb-2 border-b-2 border-gray-100">✅ Plan de Acción</h3>
          {[
            { title: "Inmediato (hasta 7 días)", color: "bg-red-100 text-red-700", items: checklist.imediato },
            { title: "Siguientes 15 días", color: "bg-amber-100 text-amber-700", items: checklist.quinzeDias },
            { title: "Mes 2 en adelante", color: "bg-green-100 text-green-700", items: checklist.mesDois },
          ].map((phase, i) => (
            <div key={i} className="mb-5">
              <div className="text-sm font-bold text-gray-900 mb-2 flex items-center gap-2">
                <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${phase.color}`}>{phase.title}</span>
              </div>
              {phase.items.map((it) => (
                <div key={it.key} className="flex gap-3 p-2.5 rounded-lg border border-gray-200 mb-1.5 bg-white">
                  <div className="w-4 h-4 rounded border-2 border-gray-300 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-gray-700">{it.text}</div>
                </div>
              ))}
            </div>
          ))}

          {/* 🆕 📚 Dossier de Recomendaciones Estratégicas */}
          <h3 className="text-sm font-extrabold uppercase tracking-wider text-gray-500 mt-6 mb-4 pb-2 border-b-2 border-gray-100">📚 Dossier de Recomendaciones Estratégicas</h3>
          
          <div className="bg-gradient-to-br from-zinc-50 to-gray-50 border border-gray-200 rounded-2xl p-6 space-y-6 text-sm text-gray-700 mb-6">
            <div className="flex gap-3.5 items-start">
              <div className="w-8 h-8 rounded-lg bg-yellow-500/10 flex items-center justify-center text-lg flex-shrink-0">🌐</div>
              <div>
                <h4 className="font-extrabold text-gray-900 mb-1">1. Posicionamiento Digital y Enlace en Bio</h4>
                <p className="text-xs leading-relaxed text-gray-600">
                  Transmite profesionalismo y autoridad de inmediato. Publica tu sitio web generado en la Fábrica y agrégalo como enlace principal de tu biografía de Instagram. Estandariza los colores de tu feed utilizando la paleta de Canva Viagem y organiza tus destacados con dedicación en al menos 4 secciones esenciales: <b>Quiénes Somos (Sobre Mí), Nuestros Paquetes, Testimonios de Clientes y Contacto Directo</b>.
                </p>
              </div>
            </div>

            <div className="flex gap-3.5 items-start">
              <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center text-lg flex-shrink-0">💬</div>
              <div>
                <h4 className="font-extrabold text-gray-900 mb-1">2. Máquina de Ventas en WhatsApp (Grupo VIP)</h4>
                <p className="text-xs leading-relaxed text-gray-600">
                  Crea un grupo VIP de avisos y ofertas en WhatsApp y configura los permisos para que <b>solo los administradores puedan enviar mensajes</b> (evitando spam y que la gente se salga). Escribe una invitación personalizada y elegante, y envíala uno a uno a todos tus contactos invitándolos a entrar. Todos los días, abre la Fábrica de Canva Viagem, genera <b>5 nuevas ofertas al día en formato feed e historias</b>, y compártelas en tu grupo VIP de avisos para retener y convertir clientes constantemente.
                </p>
              </div>
            </div>

            <div className="flex gap-3.5 items-start">
              <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center text-lg flex-shrink-0">🎙️</div>
              <div>
                <h4 className="font-extrabold text-gray-900 mb-1">3. Videos Virales y Locución Realista con Inteligencia Artificial</h4>
                <p className="text-xs leading-relaxed text-gray-600">
                  Aumenta de manera masiva las visualizaciones y retención de tus Reels y TikToks. Utiliza el <b>Narrador de Ofertas</b> o el <b>Robot de IA</b> integrados en Canva Viagem para crear tus guiones de venta altamente persuasivos. Luego, genera locuciones realistas y profesionales con las siguientes plataformas punteras en síntesis de voz:
                </p>
                <div className="mt-2.5 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <a href="https://fish.audio/pt/text-to-speech/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-gray-100 border border-gray-200 rounded-lg font-semibold text-gray-800 transition-colors">
                    <span className="w-2 h-2 rounded-full bg-blue-500" /> Fish Audio <ExternalLink className="w-3 h-3 text-gray-400" />
                  </a>
                  <a href="https://elevenlabs.io/app/speech-synthesis/text-to-speech" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-gray-100 border border-gray-200 rounded-lg font-semibold text-gray-800 transition-colors">
                    <span className="w-2 h-2 rounded-full bg-purple-500" /> ElevenLabs <ExternalLink className="w-3 h-3 text-gray-400" />
                  </a>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Agrega el audio generado encima de las plantillas premium del Canva Viagem o clips reales del destino. Busca referencias de videos virales y ganchos exitosos de turismo en TikTok para inspirarte a multiplicar tus conversiones.
                </p>
              </div>
            </div>

            <div className="flex gap-3.5 items-start">
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-lg flex-shrink-0">📰</div>
              <div>
                <h4 className="font-extrabold text-gray-900 mb-1">4. Curaduría de Contenido y Noticias del Sector</h4>
                <p className="text-xs leading-relaxed text-gray-600">
                  Gana autoridad inmediata frente a tu audiencia. Investiga noticias interesantes del sector en blogs del mercado de turismo. Comparte fotos y videos maravillosos de grandes influencers de viajes en los destinos específicos que vendes (dando los debidos créditos), comentando tu opinión y tips del itinerario. Esto educa e inspira a viajar.
                </p>
              </div>
            </div>

            <div className="flex gap-3.5 items-start">
              <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center text-lg flex-shrink-0">⚡</div>
              <div>
                <h4 className="font-extrabold text-gray-900 mb-1">5. Campañas de Anuncios en Redes Sociales (Tráfico Pago)</h4>
                <p className="text-xs leading-relaxed text-gray-600">
                  Escala y atrae clientes fríos todos los días. Si ya cuentas con tus primeras publicaciones, crea campañas de tráfico pago (Meta Ads) dirigidas al público del feed/stories de Instagram enviándolos directamente a tu landing page profesional del Fabrica. Al visualizar tu web de viajes, ¡hacen clic en el botón de reservar y van listos a tu WhatsApp para cerrar la venta!
                </p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Action buttons - 3 opções principais */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-5">
        <button
          onClick={handleSave}
          disabled={saveMutation.isPending}
          className="px-5 py-3 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-60 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-colors"
        >
          <Save className="w-4 h-4" /> {saveMutation.isPending ? "Guardando..." : "Guardar en mi cuenta"}
        </button>
        <button
          onClick={() => generateDiagnosticoPDF(state)}
          className="px-5 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-colors"
        >
          <Download className="w-4 h-4" /> Descargar PDF
        </button>
        <button
          onClick={() => setWaOpen(true)}
          className="px-5 py-3 bg-[#25D366] hover:brightness-110 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-colors"
        >
          <MessageCircle className="w-4 h-4" /> Enviar por WhatsApp
        </button>
      </div>

      {/* Refazer / Editar formulário */}
      <div className="grid grid-cols-1 gap-2 mt-3">
        <button
          onClick={onEdit}
          className="px-5 py-3 bg-white/[0.06] hover:bg-white/[0.12] text-white border border-white/10 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-colors"
        >
          âœï¸ Editar / complementar datos (se acumula sin borrar)
        </button>
      </div>

      <p className="text-[11px] text-white/40 text-center mt-2 px-4">
        Tus datos están protegidos. Agrega nuevos destinos, paquetes y ajustes en cualquier momento — todo queda guardado en tu cuenta.
      </p>

      {/* 🤖 Robots de IA y Herramientas Estratégicas */}
      <div className="mt-8 p-6 bg-white/[0.02] border border-white/[0.08] rounded-3xl space-y-4">
        <div className="flex items-center gap-2">
          <span className="text-xl">🤖</span>
          <h3 className="text-sm font-extrabold uppercase tracking-widest text-white/80">Robots de IA y Herramientas Estratégicas</h3>
        </div>
        
        {loadingTools ? (
          <div className="h-24 bg-white/[0.03] animate-pulse rounded-xl" />
        ) : filteredTools.length === 0 ? (
          <p className="text-white/40 text-sm">No hay herramientas cargadas.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {filteredTools.map((tool: any) => (
              <a key={tool.id} href={tool.url} target="_blank" rel="noopener" className="flex items-center gap-3 bg-gradient-to-br from-purple-500/5 to-blue-500/5 border border-white/[0.08] hover:border-purple-500/30 rounded-xl p-3.5 transition-all hover:shadow-lg hover:shadow-purple-500/5 group relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/0 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="w-9 h-9 rounded-xl bg-white/[0.06] flex items-center justify-center text-xl shadow-inner">{tool.icon || "🤖"}</div>
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-bold text-white leading-tight mb-0.5">{tool.title}</div>
                  <div className="text-[10px] text-purple-300/80 flex items-center gap-1">
                    <Sparkles className="w-2.5 h-2.5" /> Inteligencia Artificial
                  </div>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-white/20 group-hover:text-purple-300 transition-colors relative z-10" />
              </a>
            ))}
          </div>
        )}
      </div>

      <div className="mt-8 pt-8 border-t border-white/10 flex flex-col sm:flex-row gap-4">
        <button
          onClick={onBack}
          className="flex-1 py-4 rounded-xl border border-white/10 bg-white/[0.04] text-white/70 font-bold hover:bg-white/[0.08] transition-all"
        >
          Volver
        </button>
        <button
          onClick={onNext}
          className="flex-[2] py-4 rounded-xl font-bold text-black flex items-center justify-center gap-2 transition-all hover:brightness-110"
          style={{ background: `linear-gradient(135deg, ${state.primaryColor}, #FCD34D)` }}
        >
          Avanzar al Plan <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

// ===== Inputs =====
const FabField = ({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) => (
  <div>
    <label className="text-xs text-white/60 uppercase tracking-wider font-semibold block mb-2">{label}</label>
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 outline-none focus:border-white/40 transition-colors"
    />
  </div>
);

// Country list with flag, dial code and national mask formatting.
const COUNTRIES: { code: string; name: string; flag: string; dial: string; maxDigits: number; format: (d: string) => string }[] = [
  { code: "BR", name: "Brasil", flag: "🇧🇷", dial: "+55", maxDigits: 11, format: (d) => {
      if (!d) return "";
      if (d.length <= 2) return `(${d}`;
      if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
      if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
      return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7, 11)}`;
    } },
  { code: "US", name: "Estados Unidos", flag: "🇺🇸", dial: "+1", maxDigits: 10, format: (d) => d.length <= 3 ? d : d.length <= 6 ? `(${d.slice(0,3)}) ${d.slice(3)}` : `(${d.slice(0,3)}) ${d.slice(3,6)}-${d.slice(6,10)}` },
  { code: "PT", name: "Portugal", flag: "🇵🇹", dial: "+351", maxDigits: 9, format: (d) => d.replace(/(\d{3})(?=\d)/g, "$1 ") },
  { code: "ES", name: "España", flag: "🇪🇸", dial: "+34", maxDigits: 9, format: (d) => d.replace(/(\d{3})(?=\d)/g, "$1 ") },
  { code: "AR", name: "Argentina", flag: "🇦🇷", dial: "+54", maxDigits: 11, format: (d) => d },
  { code: "MX", name: "México", flag: "🇲🇽", dial: "+52", maxDigits: 10, format: (d) => d },
  { code: "CL", name: "Chile", flag: "🇨🇱", dial: "+56", maxDigits: 9, format: (d) => d },
  { code: "CO", name: "Colombia", flag: "🇨🇴", dial: "+57", maxDigits: 10, format: (d) => d },
  { code: "PE", name: "Perú", flag: "🇵🇪", dial: "+51", maxDigits: 9, format: (d) => d },
  { code: "UY", name: "Uruguay", flag: "🇺🇾", dial: "+598", maxDigits: 9, format: (d) => d },
  { code: "PY", name: "Paraguay", flag: "🇵🇾", dial: "+595", maxDigits: 9, format: (d) => d },
  { code: "FR", name: "Francia", flag: "🇫🇷", dial: "+33", maxDigits: 9, format: (d) => d },
  { code: "IT", name: "Italia", flag: "🇮🇹", dial: "+39", maxDigits: 10, format: (d) => d },
  { code: "DE", name: "Alemania", flag: "🇩🇪", dial: "+49", maxDigits: 11, format: (d) => d },
  { code: "GB", name: "Reino Unido", flag: "🇬🇧", dial: "+44", maxDigits: 10, format: (d) => d },
];

// WhatsApp field with country picker (flag + dial code) + national mask
const FabPhoneField = ({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) => {
  const [country, setCountry] = useState(COUNTRIES[0]);
  const [open, setOpen] = useState(false);

  return (
    <div>
      <label className="text-xs text-white/60 uppercase tracking-wider font-semibold block mb-2">{label}</label>
      <div className="flex items-stretch w-full bg-white/[0.04] border border-white/10 rounded-xl overflow-visible focus-within:border-white/40 transition-colors relative">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex items-center gap-1.5 px-3 border-r border-white/10 bg-white/[0.03] text-sm text-white/85 hover:bg-white/[0.06] transition-colors select-none"
          aria-label="Seleccionar país"
        >
          <span className="text-base leading-none" aria-hidden>{country.flag}</span>
          <span className="font-medium">{country.dial}</span>
          <span className="text-white/50 text-[10px]">â–¾</span>
        </button>
        {open && (
          <div className="absolute z-50 top-full left-0 mt-1 w-64 max-h-64 overflow-y-auto rounded-xl border border-white/10 bg-zinc-900 shadow-2xl">
            {COUNTRIES.map((c) => (
              <button
                key={c.code}
                type="button"
                onClick={() => { setCountry(c); setOpen(false); onChange(""); }}
                className={`w-full flex items-center gap-2 px-3 py-2 text-sm text-white/85 hover:bg-white/10 transition-colors ${c.code === country.code ? "bg-white/[0.06]" : ""}`}
              >
                <span className="text-base">{c.flag}</span>
                <span className="flex-1 text-left">{c.name}</span>
                <span className="text-white/50 text-xs">{c.dial}</span>
              </button>
            ))}
          </div>
        )}
        <input
          type="tel"
          inputMode="numeric"
          autoComplete="tel-national"
          value={country.format(value.replace(/\D/g, "").slice(0, country.maxDigits))}
          onChange={(e) => onChange(e.target.value.replace(/\D/g, "").slice(0, country.maxDigits))}
          placeholder={country.code === "BR" ? "(11) 99999-9999" : "Número de teléfono"}
          className="flex-1 bg-transparent px-3 py-3 text-white placeholder:text-white/30 outline-none min-w-0"
        />
      </div>
    </div>
  );
};

const FabSelect = ({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: { v: string; l: string }[] }) => (
  <div>
    <label className="text-xs text-white/60 uppercase tracking-wider font-semibold block mb-2">{label}</label>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-white/40 transition-colors"
    >
      <option value="" className="bg-zinc-900">Seleccione...</option>
      {options.map((o) => (
        <option key={o.v} value={o.v} className="bg-zinc-900">{o.l}</option>
      ))}
    </select>
  </div>
);

const FabToggle = ({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) => (
  <button
    onClick={() => onChange(!value)}
    className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all ${value ? "border-white/30 bg-white/[0.06]" : "border-white/[0.08] bg-white/[0.02] hover:border-white/15"}`}
  >
    <span className="text-sm text-white/85 text-left">{label}</span>
    <div className={`w-6 h-6 rounded-md flex items-center justify-center transition-all ${value ? "" : "border-2 border-white/20"}`} style={value ? { background: "#10B981" } : undefined}>
      {value && <Check className="w-4 h-4 text-white" />}
    </div>
  </button>
);

const DESTINOS_SUGERIDOS: Record<string, string[]> = {
  nordeste: ["Cancún", "Punta Cana", "Riviera Maya", "Cartagena", "San Andrés", "Los Cabos", "Acapulco", "Varadero"],
  sul: ["Santiago", "Bariloche", "Viña del Mar", "Mendoza", "Bogotá", "Machu Picchu"],
  internacional: ["Cancún", "Punta Cana", "Orlando", "Buenos Aires", "Paris", "Lisboa", "Dubai", "Maldivas"],
  cruzeiro: ["Crucero Caribe", "Crucero Mediterráneo", "Cruzeiro pela Costa Brasileira"],
  aventura: ["Montañas y Ríos", "Parques Nacionales", "Bonito", "Desiertos y Oasis", "Dunas y Lagunas"],
  luademel: ["Maldivas", "Bora Bora", "Santorini", "Cancún", "Riviera Maya", "Cancún"],
};

const DestinosInput = ({ destinos, onChange, primaryColor }: { destinos: string[]; onChange: (d: string[]) => void; primaryColor: string }) => {
  const [input, setInput] = useState("");
  const { state } = useFabricaContext();
  const baseSugestoes =
    (state.agencyType && DESTINOS_BY_AGENCY[state.agencyType as AgencyType]) ||
    DESTINOS_SUGERIDOS[state.niche] ||
    [];
  const sugestoes = baseSugestoes.filter((s) => !destinos.includes(s));

  const add = (dest: string) => {
    const trimmed = dest.trim();
    if (!trimmed || destinos.includes(trimmed)) return;
    onChange([...destinos, trimmed]);
    setInput("");
  };
  const remove = (d: string) => onChange(destinos.filter((x) => x !== d));

  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
      <div className="relative mb-4">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), add(input))}
          placeholder="Escribe y presiona Enter (ej: Cancún, Madrid)..."
          className="w-full bg-white/[0.04] border border-white/10 rounded-xl pl-4 pr-12 py-3 text-sm text-white placeholder:text-white/30 outline-none focus:border-white/40 transition-colors"
        />
        <button
          onClick={() => add(input)}
          disabled={!input.trim()}
          className="absolute right-1.5 top-1.5 bottom-1.5 aspect-square rounded-lg flex items-center justify-center text-black disabled:opacity-40 transition-all hover:scale-105 active:scale-95"
          style={{ background: primaryColor }}
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-3">
        <div className="flex flex-wrap gap-2 min-h-[32px]">
          {destinos.length === 0 && <span className="text-xs text-white/30 italic flex items-center">Aún no se ha añadido ninguno.</span>}
          {destinos.map((d) => (
            <span key={d} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-black animate-in zoom-in duration-200" style={{ background: primaryColor }}>
              {d}
              <button onClick={() => remove(d)} className="hover:bg-black/20 p-0.5 rounded-full transition-colors"><X className="w-3 h-3" /></button>
            </span>
          ))}
        </div>

        {sugestoes.length > 0 && (
          <div className="pt-3 border-t border-white/10">
            <div className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-2 flex items-center gap-2">
              Sugerencias Rápidas
            </div>
            <div className="flex flex-wrap gap-1.5">
              {sugestoes.slice(0, 8).map((s) => (
                <button
                  key={s}
                  onClick={() => add(s)}
                  className="px-3 py-1.5 rounded-lg text-[11px] font-medium bg-white/[0.04] border border-white/10 text-white/60 hover:border-white/30 hover:text-white hover:bg-white/[0.08] transition-all active:scale-95"
                >
                  + {s}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

