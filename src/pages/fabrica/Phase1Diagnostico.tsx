import { useState } from "react";
import { useFabricaContext, type Niche, type AgencyType } from "@/hooks/useFabricaContext";
import { calculateScore, getChecklistByLevel } from "@/lib/fabrica-scoring";
import { generateDiagnosticoPDF, openWhatsappWithResumo } from "@/lib/fabrica-pdf";
import { useSaveDiagnostico, useDiagnosticos } from "@/hooks/useFabricaDiagnosticos";
import { useAuth } from "@/contexts/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, Download, MessageCircle, ArrowRight, Upload, Check, Save, Plus, X } from "lucide-react";
import { toast } from "sonner";
import { WhatsappSendModal } from "@/components/fabrica/WhatsappSendModal";
import { extractPaletteFromCanvas } from "@/lib/extract-palette";

const AGENCY_TYPES: { v: AgencyType; l: string }[] = [
  { v: "autonoma", l: "Agente autônomo / Freelancer" },
  { v: "pequena", l: "Pequena agência (até 3 pessoas)" },
  { v: "media", l: "Agência média (4-10 pessoas)" },
  { v: "franquia", l: "Franquia" },
  { v: "consolidadora", l: "Consolidadora" },
  { v: "receptiva", l: "Agência Receptiva" },
  { v: "milhas", l: "Especialista em Milhas" },
  { v: "luxo", l: "Agência de Luxo / Alto Padrão" },
  { v: "corporativa", l: "Agência Corporativa (B2B)" },
  { v: "grupos", l: "Especialista em Grupos / Excursões" },
  { v: "cruzeiros", l: "Especialista em Cruzeiros" },
  { v: "ecoturismo", l: "Ecoturismo / Aventura" },
  { v: "religioso", l: "Turismo Religioso" },
  { v: "outro", l: "Outro tipo" },
];

type NicheOption = { id: Niche; label: string; emoji: string };

const NICHES_DEFAULT: NicheOption[] = [
  { id: "nordeste", label: "Praia Nordeste", emoji: "🏖️" },
  { id: "sul", label: "Praia Sul / Sudeste", emoji: "🌅" },
  { id: "internacional", label: "Internacional", emoji: "✈️" },
  { id: "cruzeiro", label: "Cruzeiros", emoji: "🚢" },
  { id: "aventura", label: "Aventura / Ecoturismo", emoji: "⛰️" },
  { id: "luademel", label: "Lua de Mel", emoji: "💕" },
];

// Opções de "carro-chefe / serviço principal" condicionadas ao tipo de agência.
// Usamos os mesmos ids do tipo Niche para reaproveitar destinos/legendas/ofertas.
const NICHES_BY_AGENCY: Partial<Record<AgencyType, NicheOption[]>> = {
  receptiva: [
    { id: "nordeste", label: "Receptivo Nordeste", emoji: "🏖️" },
    { id: "sul", label: "Receptivo Sul / Serra", emoji: "🌅" },
    { id: "aventura", label: "Receptivo Ecoturismo", emoji: "⛰️" },
    { id: "internacional", label: "City Tour / Urbano", emoji: "🏙️" },
    { id: "cruzeiro", label: "Transfer Portuário", emoji: "🚢" },
    { id: "luademel", label: "Roteiros Privativos", emoji: "💕" },
  ],
  corporativa: [
    { id: "internacional", label: "Viagens Internacionais Executivas", emoji: "✈️" },
    { id: "sul", label: "Viagens Nacionais Corporativas", emoji: "🏢" },
    { id: "luademel", label: "Eventos & Incentivo", emoji: "🎯" },
    { id: "cruzeiro", label: "Convenções & MICE", emoji: "🤝" },
    { id: "aventura", label: "Team Building / Retiros", emoji: "⛰️" },
    { id: "nordeste", label: "Workation / Bleisure", emoji: "💼" },
  ],
  religioso: [
    { id: "internacional", label: "Terra Santa", emoji: "🕊️" },
    { id: "luademel", label: "Fátima & Santuários (Europa)", emoji: "⛪" },
    { id: "sul", label: "Aparecida & Santuários BR", emoji: "🙏" },
    { id: "aventura", label: "Caminho de Santiago", emoji: "🥾" },
    { id: "nordeste", label: "Juazeiro / Canindé", emoji: "✝️" },
    { id: "cruzeiro", label: "Cruzeiros Religiosos", emoji: "🚢" },
  ],
  milhas: [
    { id: "internacional", label: "Emissões Internacionais", emoji: "✈️" },
    { id: "sul", label: "Emissões Domésticas", emoji: "🛫" },
    { id: "luademel", label: "Lua de Mel com Milhas", emoji: "💕" },
    { id: "nordeste", label: "Pacotes Nordeste com Milhas", emoji: "🏖️" },
    { id: "cruzeiro", label: "Cruzeiros + Aéreo Pontos", emoji: "🚢" },
    { id: "aventura", label: "Roteiros Premium / Executiva", emoji: "🥂" },
  ],
  luxo: [
    { id: "internacional", label: "Europa Luxo", emoji: "🇪🇺" },
    { id: "luademel", label: "Maldivas / Bora Bora", emoji: "🏝️" },
    { id: "nordeste", label: "Resorts Premium Nordeste", emoji: "🏖️" },
    { id: "cruzeiro", label: "Cruzeiros de Luxo", emoji: "🚢" },
    { id: "aventura", label: "Safáris / Expedições", emoji: "🦁" },
    { id: "sul", label: "Serra Gaúcha Premium", emoji: "🍷" },
  ],
  grupos: [
    { id: "internacional", label: "Excursões Internacionais", emoji: "✈️" },
    { id: "sul", label: "Excursões Sul / Serra", emoji: "🚌" },
    { id: "nordeste", label: "Caravanas Nordeste", emoji: "🏖️" },
    { id: "luademel", label: "Grupos da Terceira Idade", emoji: "👵" },
    { id: "aventura", label: "Grupos de Ecoturismo", emoji: "⛰️" },
    { id: "cruzeiro", label: "Grupos em Cruzeiros", emoji: "🚢" },
  ],
  cruzeiros: [
    { id: "cruzeiro", label: "Cruzeiros pela Costa BR", emoji: "🇧🇷" },
    { id: "internacional", label: "Cruzeiros Caribe", emoji: "🌴" },
    { id: "luademel", label: "Cruzeiros Mediterrâneo", emoji: "🛳️" },
    { id: "aventura", label: "Cruzeiros Fiordes / Alasca", emoji: "🧊" },
    { id: "nordeste", label: "Cruzeiros Temáticos", emoji: "🎤" },
    { id: "sul", label: "Cruzeiros Fluviais", emoji: "🚢" },
  ],
  ecoturismo: [
    { id: "aventura", label: "Chapadas & Trilhas", emoji: "⛰️" },
    { id: "nordeste", label: "Lençóis / Jalapão", emoji: "🏜️" },
    { id: "sul", label: "Bonito / Pantanal", emoji: "🐠" },
    { id: "internacional", label: "Patagônia / Atacama", emoji: "🏔️" },
    { id: "luademel", label: "Eco Lodges", emoji: "🌿" },
    { id: "cruzeiro", label: "Expedições Amazônia", emoji: "🛶" },
  ],
  consolidadora: [
    { id: "internacional", label: "Aéreo Internacional", emoji: "✈️" },
    { id: "sul", label: "Aéreo Doméstico", emoji: "🛫" },
    { id: "luademel", label: "Hotelaria Internacional", emoji: "🏨" },
    { id: "nordeste", label: "Hotelaria Nacional", emoji: "🏖️" },
    { id: "cruzeiro", label: "Cruzeiros (B2B)", emoji: "🚢" },
    { id: "aventura", label: "Pacotes Operadores", emoji: "📦" },
  ],
  franquia: NICHES_DEFAULT,
  autonoma: NICHES_DEFAULT,
  pequena: NICHES_DEFAULT,
  media: NICHES_DEFAULT,
  outro: NICHES_DEFAULT,
};

// Destinos sugeridos por tipo de agência (usado quando faz mais sentido que niche)
const DESTINOS_BY_AGENCY: Partial<Record<AgencyType, string[]>> = {
  receptiva: ["City Tour completo", "Transfer aeroporto", "Passeio de buggy", "Passeio de barco", "Tour gastronômico", "Tour histórico", "Day use em resort", "Passeio fotográfico"],
  corporativa: ["Reuniões executivas", "Convenções nacionais", "Convenções internacionais", "Viagens de incentivo", "Eventos corporativos", "Team building", "Feiras e congressos", "Bleisure / Workation"],
  religioso: ["Terra Santa (Israel)", "Fátima (Portugal)", "Lourdes (França)", "Roma / Vaticano", "Aparecida (SP)", "Juazeiro do Norte (CE)", "Caminho de Santiago", "Medjugorje"],
  milhas: ["Emissão Smiles", "Emissão Latam Pass", "Emissão TudoAzul", "Emissão Livelo", "Emissão Esfera", "Upgrade executiva", "Estratégia de pontos", "Cartões / programas"],
  luxo: ["Maldivas", "Bora Bora", "Dubai", "Santorini", "Safári África", "Aspen", "Toscana", "Polinésia"],
  grupos: ["Excursão Gramado", "Excursão Maragogi", "Excursão Beto Carrero", "Caravana Aparecida", "Excursão Disney", "Excursão Buenos Aires", "Cruzeiro em grupo", "Excursão Foz do Iguaçu"],
  cruzeiros: ["Cruzeiro Costa Brasileira", "Cruzeiro Caribe", "Cruzeiro Mediterrâneo", "Cruzeiro Fiordes", "Cruzeiro Alasca", "Cruzeiro Temático (sertanejo, gospel...)", "Cruzeiro Disney", "Cruzeiro Réveillon"],
  ecoturismo: ["Bonito (MS)", "Chapada Diamantina", "Chapada dos Veadeiros", "Jalapão", "Lençóis Maranhenses", "Pantanal", "Fernando de Noronha", "Patagônia"],
  consolidadora: ["Pacotes CVC", "Pacotes Azul Viagens", "Pacotes Decolar", "Hotelaria nacional", "Hotelaria internacional", "Aéreo nacional", "Aéreo internacional", "Seguro viagem"],
};

interface Props {
  onComplete: () => void;
  onBack: () => void;
}

export const Phase1Diagnostico = ({ onComplete, onBack }: Props) => {
  const { state, update } = useFabricaContext();
  const { user } = useAuth();
  const { data: savedProjects } = useDiagnosticos();
  const [loading, setLoading] = useState(false);

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
        toast.success("Logo atualizada!");
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

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
    return <DiagnosticoResult onNext={onComplete} onBack={onBack} onEdit={() => update({ diagnosticoCompleto: false })} />;
  }

  const nicheOptions = (state.agencyType && NICHES_BY_AGENCY[state.agencyType as AgencyType]) || NICHES_DEFAULT;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6 backdrop-blur-xl">
        <h3 className="text-xs font-bold text-white/60 uppercase tracking-widest mb-6 flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse" />
          Perfil Estratégico da Agência
        </h3>

        <div className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FabField label="Nome da agência *" value={state.agencyName} onChange={(v) => update({ agencyName: v })} placeholder="Ex: Lua Cheia Viagens" />
            <div>
              <label className="text-xs text-white/60 uppercase tracking-wider font-semibold block mb-2">Tipo de agência *</label>
              <select
                value={state.agencyType}
                onChange={(e) => update({ agencyType: e.target.value as AgencyType })}
                className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-white/40 transition-colors"
              >
                <option value="" className="bg-zinc-900">Selecione...</option>
                {AGENCY_TYPES.map((t) => (
                  <option key={t.v} value={t.v} className="bg-zinc-900">{t.l}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FabField label="@ do Instagram" value={state.instagram} onChange={(v) => update({ instagram: v.replace(/^@/, "") })} placeholder="suaagencia" />
            <FabPhoneField label="WhatsApp (com DDD)" value={state.whatsapp} onChange={(v) => update({ whatsapp: v })} />
          </div>

          <div>
            <label className="text-xs text-white/60 uppercase tracking-wider font-semibold block mb-3">Nicho / Carro-chefe *</label>
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
            <label className="text-xs text-white/60 uppercase tracking-wider font-semibold block mb-2">Seus principais destinos *</label>
            <DestinosInput destinos={state.destinos} onChange={(d) => update({ destinos: d })} primaryColor={state.primaryColor || "#F59E0B"} />
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mt-6 pt-6 border-t border-white/10">
        <button
          onClick={onBack}
          className="flex-1 py-4 rounded-xl border border-white/10 bg-white/[0.04] text-white/70 font-bold hover:bg-white/[0.08] transition-all"
        >
          Voltar
        </button>
        <button
          onClick={finalize}
          disabled={!state.agencyName || !state.whatsapp || !state.niche || state.destinos.length === 0}
          className="flex-[2] py-4 rounded-xl font-bold text-black flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed transition-all hover:brightness-110 shadow-lg"
          style={{ background: `linear-gradient(135deg, ${state.primaryColor || "#F59E0B"}, #FCD34D)` }}
        >
          Gerar Diagnóstico & Plano <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

const DiagnosticoResult = ({ onNext, onBack, onEdit }: { onNext: () => void; onBack: () => void; onEdit: () => void }) => {
  const { state } = useFabricaContext();
  const { user } = useAuth();
  const result = calculateScore(state);
  const checklist = getChecklistByLevel(result.level);
  const saveMutation = useSaveDiagnostico();
  const [waOpen, setWaOpen] = useState(false);

  const scoreColor = result.digitalScore >= 70 ? "#10B981" : result.digitalScore >= 40 ? "#F59E0B" : "#EF4444";

  const handleSave = () => {
    if (!user) {
      toast.error("Faça login para salvar seu diagnóstico", {
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
          <div className="text-[10px] font-bold tracking-[2px] mb-2" style={{ color: state.primaryColor }}>DIAGNÓSTICO TRAVELBOOST</div>
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
              <div className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: scoreColor }}>Nível {result.level} — {result.levelName}</div>
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
          <h3 className="text-sm font-extrabold uppercase tracking-wider text-gray-500 mb-4 pb-2 border-b-2 border-gray-100">⚠️ Gargalos identificados</h3>
          <div className="space-y-2 mb-7">
            {result.gargalos.map((g, i) => (
              <div key={i} className={`flex gap-3 p-3 rounded-lg ${g.level === "red" ? "bg-red-50 border border-red-200" : g.level === "amber" ? "bg-amber-50 border border-amber-200" : "bg-green-50 border border-green-200"}`}>
                <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${g.level === "red" ? "bg-red-500" : g.level === "amber" ? "bg-amber-500" : "bg-green-500"}`} />
                <div className="text-sm text-gray-700 leading-relaxed"><b className="text-gray-900">{g.dimension}:</b> {g.text}</div>
              </div>
            ))}
          </div>

          <h3 className="text-sm font-extrabold uppercase tracking-wider text-gray-500 mb-4 pb-2 border-b-2 border-gray-100">✅ Plano de Ação</h3>
          {[
            { title: "Imediato (até 7 dias)", color: "bg-red-100 text-red-700", items: checklist.imediato },
            { title: "Próximos 15 dias", color: "bg-amber-100 text-amber-700", items: checklist.quinzeDias },
            { title: "Mês 2 em diante", color: "bg-green-100 text-green-700", items: checklist.mesDois },
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
        </div>
      </motion.div>

      {/* Action buttons - 3 opções principais */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-5">
        <button
          onClick={handleSave}
          disabled={saveMutation.isPending}
          className="px-5 py-3 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-60 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-colors"
        >
          <Save className="w-4 h-4" /> {saveMutation.isPending ? "Salvando..." : "Salvar na minha conta"}
        </button>
        <button
          onClick={() => generateDiagnosticoPDF(state)}
          className="px-5 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-colors"
        >
          <Download className="w-4 h-4" /> Baixar PDF
        </button>
        <button
          onClick={() => setWaOpen(true)}
          className="px-5 py-3 bg-[#25D366] hover:brightness-110 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-colors"
        >
          <MessageCircle className="w-4 h-4" /> Enviar no WhatsApp
        </button>
      </div>

      {/* Refazer / Editar formulário */}
      <div className="grid grid-cols-1 gap-2 mt-3">
        <button
          onClick={onEdit}
          className="px-5 py-3 bg-white/[0.06] hover:bg-white/[0.12] text-white border border-white/10 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-colors"
        >
          ✏️ Editar / complementar dados (acumula sem apagar)
        </button>
      </div>

      <p className="text-[11px] text-white/40 text-center mt-2 px-4">
        Seus dados são preservados. Adicione novos destinos, pacotes e ajustes a qualquer momento — tudo fica salvo na sua conta.
      </p>

      <div className="mt-8 pt-8 border-t border-white/10 flex flex-col sm:flex-row gap-4">
        <button
          onClick={onBack}
          className="flex-1 py-4 rounded-xl border border-white/10 bg-white/[0.04] text-white/70 font-bold hover:bg-white/[0.08] transition-all"
        >
          Voltar
        </button>
        <button
          onClick={onNext}
          className="flex-[2] py-4 rounded-xl font-bold text-black flex items-center justify-center gap-2 transition-all hover:brightness-110"
          style={{ background: `linear-gradient(135deg, ${state.primaryColor}, #FCD34D)` }}
        >
          Avançar para Plano <ArrowRight className="w-4 h-4" />
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
  { code: "ES", name: "Espanha", flag: "🇪🇸", dial: "+34", maxDigits: 9, format: (d) => d.replace(/(\d{3})(?=\d)/g, "$1 ") },
  { code: "AR", name: "Argentina", flag: "🇦🇷", dial: "+54", maxDigits: 11, format: (d) => d },
  { code: "MX", name: "México", flag: "🇲🇽", dial: "+52", maxDigits: 10, format: (d) => d },
  { code: "CL", name: "Chile", flag: "🇨🇱", dial: "+56", maxDigits: 9, format: (d) => d },
  { code: "CO", name: "Colômbia", flag: "🇨🇴", dial: "+57", maxDigits: 10, format: (d) => d },
  { code: "PE", name: "Peru", flag: "🇵🇪", dial: "+51", maxDigits: 9, format: (d) => d },
  { code: "UY", name: "Uruguai", flag: "🇺🇾", dial: "+598", maxDigits: 9, format: (d) => d },
  { code: "PY", name: "Paraguai", flag: "🇵🇾", dial: "+595", maxDigits: 9, format: (d) => d },
  { code: "FR", name: "França", flag: "🇫🇷", dial: "+33", maxDigits: 9, format: (d) => d },
  { code: "IT", name: "Itália", flag: "🇮🇹", dial: "+39", maxDigits: 10, format: (d) => d },
  { code: "DE", name: "Alemanha", flag: "🇩🇪", dial: "+49", maxDigits: 11, format: (d) => d },
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
          aria-label="Selecionar país"
        >
          <span className="text-base leading-none" aria-hidden>{country.flag}</span>
          <span className="font-medium">{country.dial}</span>
          <span className="text-white/50 text-[10px]">▾</span>
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
          placeholder={country.code === "BR" ? "(11) 99999-9999" : "Número de telefone"}
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
      <option value="" className="bg-zinc-900">Selecione...</option>
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
  nordeste: ["Maragogi", "Jericoacoara", "Fernando de Noronha", "Maceió", "Natal", "Porto de Galinhas", "Salvador", "Pipa"],
  sul: ["Florianópolis", "Gramado", "Balneário Camboriú", "Bombinhas", "Curitiba", "Foz do Iguaçu"],
  internacional: ["Cancún", "Punta Cana", "Orlando", "Buenos Aires", "Paris", "Lisboa", "Dubai", "Maldivas"],
  cruzeiro: ["Cruzeiro Caribe", "Cruzeiro Mediterrâneo", "Cruzeiro pela Costa Brasileira"],
  aventura: ["Chapada Diamantina", "Chapada dos Veadeiros", "Bonito", "Jalapão", "Lençóis Maranhenses"],
  luademel: ["Maldivas", "Bora Bora", "Santorini", "Maragogi", "Fernando de Noronha", "Cancún"],
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
          placeholder="Digite e aperte Enter (ex: Paris, Gramado)..."
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
          {destinos.length === 0 && <span className="text-xs text-white/30 italic flex items-center">Nenhum adicionado ainda.</span>}
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
              Sugestões Rápidas
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
