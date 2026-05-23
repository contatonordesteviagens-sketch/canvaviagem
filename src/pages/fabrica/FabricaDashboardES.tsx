import { useState, useRef } from "react";
import { useFabricaContext } from "@/hooks/useFabricaContext";
import { 
  Upload, 
  X, 
  Check, 
  Trash2, 
  Copy, 
  Pencil, 
  Plus, 
  Globe, 
  Instagram, 
  Phone, 
  MapPin, 
  ExternalLink, 
  Package, 
  Link, 
  Image as ImageIcon 
} from "lucide-react";
import { toast } from "sonner";

const AGENCY_TYPES = [
  { v: "autonoma", l: "Agente autónomo / Freelancer" },
  { v: "pequena", l: "Agencia pequeña (hasta 3 personas)" },
  { v: "media", l: "Agencia mediana (4-10 personas)" },
  { v: "franquia", l: "Franquicia" },
  { v: "consolidadora", l: "Consolidadora" },
  { v: "receptiva", l: "Agencia Receptiva" },
  { v: "milhas", l: "Especialista en Millas" },
  { v: "luxo", l: "Agencia de Lujo / Alto Estándar" },
  { v: "corporativa", l: "Agencia Corporativa (B2B)" },
  { v: "grupos", l: "Especialista en Grupos / Excursiones" },
  { v: "cruzeiros", l: "Especialista en Cruceros" },
  { v: "ecoturismo", l: "Ecoturismo / Aventura" },
  { v: "religioso", l: "Turismo Religioso" },
  { v: "outro", l: "Otro tipo" },
] as const;

export const FabricaDashboardES = () => {
  const { state, update } = useFabricaContext();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form de edición de paquetes
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editPrice, setEditPrice] = useState("");

  // Form de adición de paquetes
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newPrice, setNewPrice] = useState("");

  const slugify = (text: string) => {
    return text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");
  };

  const domainSlug = state.agencyName ? slugify(state.agencyName) : "su-agencia";
  const mockUrl = `https://${domainSlug}.vercel.app`;

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const MAX = 250;
        let w = img.width, h = img.height;
        if (w > h) {
          if (w > MAX) { h *= MAX / w; w = MAX; }
        } else {
          if (h > MAX) { w *= MAX / h; h = MAX; }
        }
        canvas.width = w; canvas.height = h;
        canvas.getContext("2d")?.drawImage(img, 0, 0, w, h);

        const base64 = canvas.toDataURL("image/webp", 0.8);
        update({ logoBase64: base64 });
        toast.success("¡Logo actualizado!");
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  // Funções de Pacotes
  const startEdit = (pkg: any) => {
    setEditingId(pkg.id);
    setEditTitle(pkg.title);
    setEditDesc(pkg.description);
    setEditPrice(pkg.price);
    setShowAddForm(false);
  };

  const saveEdit = (id: string) => {
    if (!editTitle.trim()) {
      toast.error("Agrega un título al paquete");
      return;
    }
    const updated = state.selectedPackages.map((p) =>
      p.id === id ? { ...p, title: editTitle.trim(), description: editDesc.trim(), price: editPrice.trim() } : p
    );
    update({ selectedPackages: updated });
    setEditingId(null);
    toast.success("¡Paquete actualizado!");
  };

  const duplicatePackage = (original: any) => {
    const pkg = {
      ...original,
      id: `pkg_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      title: `${original.title} (copia)`,
    };
    update({ selectedPackages: [pkg, ...state.selectedPackages] });
    toast.success("¡Paquete duplicado!");
  };

  const removePackage = (id: string) => {
    const updated = state.selectedPackages.filter((p) => p.id !== id);
    update({ selectedPackages: updated });
    toast.success("¡Paquete eliminado!");
  };

  const addPackage = () => {
    if (!newTitle.trim()) {
      toast.error("Agrega un título al paquete");
      return;
    }
    const pkg = {
      id: `pkg_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      title: newTitle.trim(),
      description: newDesc.trim() || "Nueva oferta especial.",
      price: newPrice.trim() || "Consultar",
      imageUrl: "",
      ctaLabel: "Reservar ahora"
    };
    update({ selectedPackages: [pkg, ...state.selectedPackages] });
    setNewTitle("");
    setNewDesc("");
    setNewPrice("");
    setShowAddForm(false);
    toast.success("¡Nuevo paquete agregado!");
  };

  return (
    <div className="space-y-8 animate-fadeIn max-w-[1280px] mx-auto pb-12">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0F0F11] to-[#0A0A0B] border border-white/5 p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-[0_4px_30px_rgba(0,0,0,0.4)]">
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-amber-500/10 to-transparent blur-3xl rounded-full" />
        <div className="space-y-2 relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-amber-500/20 bg-amber-500/10 mb-1">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
            <span className="text-[9px] font-black uppercase tracking-wider text-amber-400">Panel General</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight flex items-center gap-2">
            Bienvenido a tu Fábrica de Destinos 🏰
          </h2>
          <p className="text-xs text-white/50 leading-relaxed max-w-xl">
            Configura el perfil de tu agencia, agrega tus paquetes y gestiona tus recursos en tiempo real. ¡Todo lo que completes aquí se sincronizará automáticamente con tu sitio de viajes!
          </p>
        </div>

        {/* Quick Analytics */}
        <div className="flex gap-4 relative z-10">
          <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4 min-w-[120px] text-center backdrop-blur-md">
            <span className="text-[9px] font-bold text-white/40 uppercase tracking-wider block mb-1">Paquetes Activos</span>
            <span className="text-2xl font-black text-amber-400">{state.selectedPackages.length}</span>
          </div>
          <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4 min-w-[120px] text-center backdrop-blur-md">
            <span className="text-[9px] font-bold text-white/40 uppercase tracking-wider block mb-1">Score Digital</span>
            <span className="text-2xl font-black text-emerald-400">{state.digitalScore || 0}%</span>
          </div>
        </div>
      </div>

      {/* Main Responsive Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Side: Agency Info & Brand (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* CARD 1: IDENTIDAD & PERFIL DE LA AGENCIA */}
          <div className="bg-[#0F0F11]/90 border border-white/5 rounded-3xl p-6 backdrop-blur-xl shadow-xl space-y-5">
            <h3 className="text-xs font-black text-white/60 uppercase tracking-widest flex items-center gap-2 mb-2">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              Identidad y Perfil de la Agencia
            </h3>

            {/* Logo y Nombre */}
            <div className="flex flex-col sm:flex-row gap-6 items-center bg-white/[0.02] border border-white/5 rounded-2xl p-4">
              {/* Logo Box */}
              <div className="relative group flex-shrink-0">
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="w-20 h-20 rounded-2xl border-2 border-dashed border-white/10 hover:border-amber-500/40 bg-white/[0.01] flex flex-col items-center justify-center overflow-hidden transition-all duration-300 cursor-pointer relative"
                >
                  {state.logoBase64 ? (
                    <img src={state.logoBase64} className="w-full h-full object-contain p-2" alt="Logo" />
                  ) : (
                    <>
                      <Upload className="w-5 h-5 text-white/30 mb-1 group-hover:text-amber-400 transition-colors" />
                      <span className="text-[8px] font-bold text-white/40 uppercase tracking-wider">Logo</span>
                    </>
                  )}
                  <input 
                    type="file" 
                    ref={fileInputRef}
                    accept="image/*" 
                    className="hidden" 
                    onChange={handleLogoUpload} 
                  />
                </div>
                {state.logoBase64 && (
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      update({ logoBase64: "" });
                      toast.success("¡Logo removido!");
                    }}
                    className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center text-white shadow-lg transition-all"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>

              {/* Dica */}
              <div className="text-center sm:text-left space-y-1">
                <span className="text-[9px] font-bold text-amber-400 uppercase tracking-wider">Foto de Perfil</span>
                <p className="text-[10px] text-white/40 leading-relaxed">
                  Sube el logo de tu agencia en formato PNG/JPG. Se aplicará en tus anuncios generados por IA y en el encabezado de tu sitio web.
                </p>
              </div>
            </div>

            {/* Inputs de Informação */}
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-white/40 uppercase tracking-wider block mb-1.5">Nombre de la Agencia *</label>
                <input 
                  type="text"
                  value={state.agencyName || ""}
                  onChange={(e) => update({ agencyName: e.target.value })}
                  placeholder="Nombre Comercial de tu Agencia"
                  className="w-full bg-white/[0.03] border border-white/5 hover:border-white/10 focus:border-amber-500/50 rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none transition-all"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-white/40 uppercase tracking-wider block mb-1.5">Tipo de Agencia</label>
                <select 
                  value={state.agencyType || ""}
                  onChange={(e) => update({ agencyType: e.target.value as any })}
                  className="w-full bg-[#161619] border border-white/5 hover:border-white/10 focus:border-amber-500/50 rounded-xl px-4 py-3 text-sm text-white focus:outline-none transition-all appearance-none cursor-pointer"
                >
                  <option value="" disabled className="text-white/30">Selecciona el tipo de tu agencia</option>
                  {AGENCY_TYPES.map((opt) => (
                    <option key={opt.v} value={opt.v} className="text-white">{opt.l}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-white/40 uppercase tracking-wider block mb-1.5">Instagram Profesional</label>
                  <div className="relative">
                    <Instagram className="absolute left-3.5 top-3.5 w-4 h-4 text-white/30" />
                    <input 
                      type="text"
                      value={state.instagram || ""}
                      onChange={(e) => {
                        let val = e.target.value;
                        if (val && !val.startsWith("@") && !val.includes("/")) {
                          val = "@" + val;
                        }
                        update({ instagram: val });
                      }}
                      placeholder="@suagencia"
                      className="w-full bg-white/[0.03] border border-white/5 hover:border-white/10 focus:border-amber-500/50 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-white/40 uppercase tracking-wider block mb-1.5">WhatsApp de Ventas *</label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-3.5 w-4 h-4 text-white/30" />
                    <input 
                      type="text"
                      value={state.whatsapp || ""}
                      onChange={(e) => update({ whatsapp: e.target.value })}
                      placeholder="(85) 99845-8995"
                      className="w-full bg-white/[0.03] border border-white/5 hover:border-white/10 focus:border-amber-500/50 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none transition-all"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-white/40 uppercase tracking-wider block mb-1.5">Dirección Física (Mapa)</label>
                <div className="relative">
                  <MapPin className="absolute left-3.5 top-3.5 w-4 h-4 text-white/30" />
                  <input 
                    type="text"
                    value={state.address || ""}
                    onChange={(e) => update({ address: e.target.value })}
                    placeholder="Av. Paulista, 1000 - São Paulo, SP"
                    className="w-full bg-white/[0.03] border border-white/5 hover:border-white/10 focus:border-amber-500/50 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none transition-all"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* CARD 2: DOMÍNIO DO SITE MOCKUP (VERCEL) */}
          <div className="bg-[#0F0F11]/90 border border-white/5 rounded-3xl p-6 backdrop-blur-xl shadow-xl space-y-4">
            <h3 className="text-xs font-black text-white/60 uppercase tracking-widest flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              Tu Dirección de Internet
            </h3>

            {/* Chrome Bar Mockup */}
            <div className="border border-white/5 rounded-2xl bg-[#070708] overflow-hidden shadow-lg">
              {/* Browser control header */}
              <div className="flex items-center gap-1.5 px-4 py-2 bg-white/[0.02] border-b border-white/5">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
                <div className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
                <div className="flex-1 max-w-[280px] mx-auto bg-white/[0.03] border border-white/5 rounded-md px-3 py-0.5 text-[10px] text-white/30 text-center truncate flex items-center justify-center gap-1 select-none">
                  <Globe className="w-2.5 h-2.5 text-white/20" />
                  {mockUrl}
                </div>
              </div>

              {/* Browser content placeholder */}
              <div className="p-5 text-center space-y-4">
                <div className="w-10 h-10 rounded-full bg-amber-500/10 text-amber-400 flex items-center justify-center mx-auto shadow-inner">
                  <Globe className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-white leading-tight">¡Tu sitio web está activo!</h4>
                  <p className="text-[10px] text-white/40 max-w-[280px] mx-auto leading-normal">
                    Todos los paquetes creados en la columna de al lado se sincronizarán al instante.
                  </p>
                </div>

                <div className="flex gap-2">
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText(mockUrl);
                      toast.success("¡Enlace copiado al portapapeles!");
                    }}
                    className="flex-1 py-2 px-3 rounded-lg bg-white/[0.04] border border-white/10 hover:bg-white/[0.08] text-[10px] font-bold text-white/80 hover:text-white transition-all"
                  >
                    Copiar Enlace
                  </button>
                  <button 
                    onClick={() => window.open(mockUrl, "_blank")}
                    className="flex-1 py-2 px-3 rounded-lg bg-amber-500 hover:bg-amber-600 text-[10px] font-bold text-black flex items-center justify-center gap-1 transition-all"
                  >
                    Visitar Sitio <ExternalLink className="w-2.5 h-2.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Package Management (7 Cols) */}
        <div className="lg:col-span-7">
          
          {/* DYNAMIC CARD: SEUS PACOTES */}
          <div className="bg-[#0F0F11]/90 border border-white/5 rounded-3xl p-6 backdrop-blur-xl shadow-xl space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-black text-white/60 uppercase tracking-widest flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  Paquetes listos para vender ({state.selectedPackages.length})
                </h3>
                <span className="text-[9px] text-white/30 uppercase font-semibold font-sans">Fase 2 / Integración Comercial</span>
              </div>
            </div>

            {/* Adicionar novo pacote Form */}
            <div className="space-y-4">
              {!showAddForm ? (
                <button
                  onClick={() => { setShowAddForm(true); setEditingId(null); }}
                  className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl border-2 border-dashed border-white/10 text-white/40 hover:border-amber-500/40 hover:text-amber-400 transition-all duration-300 text-xs uppercase font-extrabold tracking-widest bg-white/[0.01] hover:bg-amber-500/[0.02]"
                >
                  <Plus className="w-4 h-4" /> Agregar nuevo paquete
                </button>
              ) : (
                <div className="bg-[#141416] border border-white/10 rounded-2xl p-5 space-y-4 animate-scaleUp">
                  <div className="flex items-center justify-between border-b border-white/5 pb-2">
                    <span className="text-[10px] font-black text-amber-400 uppercase tracking-widest">Nuevo Paquete Comercial</span>
                    <button 
                      onClick={() => setShowAddForm(false)}
                      className="p-1 rounded-md hover:bg-white/5 text-white/40 hover:text-white transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="text-[9px] font-bold text-white/40 uppercase block mb-1">Título del Destino *</label>
                      <input
                        value={newTitle}
                        onChange={(e) => setNewTitle(e.target.value)}
                        placeholder="Ej: Jericoacoara Mágico 4 Días"
                        className="w-full bg-white/[0.03] border border-white/5 focus:border-amber-500/50 rounded-lg px-3 py-2 text-sm text-white placeholder-white/20 focus:outline-none"
                      />
                    </div>
                    
                    <div>
                      <label className="text-[9px] font-bold text-white/40 uppercase block mb-1">Qué incluye</label>
                      <textarea
                        value={newDesc}
                        onChange={(e) => setNewDesc(e.target.value)}
                        placeholder="Ej: ✔ Transporte Incluido ✔ Alojamiento con desayuno ✔ Guía local"
                        rows={3}
                        className="w-full bg-white/[0.03] border border-white/5 focus:border-amber-500/50 rounded-lg px-3 py-2 text-sm text-white placeholder-white/20 focus:outline-none resize-none"
                      />
                    </div>

                    <div>
                      <label className="text-[9px] font-bold text-white/40 uppercase block mb-1">Precio / Condiciones *</label>
                      <input
                        value={newPrice}
                        onChange={(e) => setNewPrice(e.target.value)}
                        placeholder="Ej: Desde R$ 450,00 por persona"
                        className="w-full bg-white/[0.03] border border-white/5 focus:border-amber-500/50 rounded-lg px-3 py-2 text-sm text-white placeholder-white/20 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2 border-t border-white/5">
                    <button 
                      onClick={addPackage} 
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider text-black bg-gradient-to-r from-amber-500 to-yellow-300 hover:brightness-110 transition-all shadow-md shadow-amber-500/10 cursor-pointer"
                    >
                      <Check className="w-4 h-4" /> Agregar y Sincronizar
                    </button>
                    <button 
                      onClick={() => { setShowAddForm(false); setNewTitle(""); setNewDesc(""); setNewPrice(""); }} 
                      className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/80 text-xs font-bold transition-all"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              )}

              {/* Package cards list */}
              <div className="space-y-4">
                {state.selectedPackages.length === 0 ? (
                  <div className="text-center py-12 bg-white/[0.01] border border-white/5 border-dashed rounded-3xl space-y-3">
                    <Package className="w-10 h-10 mx-auto opacity-20 text-white" />
                    <div className="space-y-1">
                      <p className="text-xs text-white/60 font-bold">Ningún paquete registrado</p>
                      <p className="text-[10px] text-white/30 max-w-[280px] mx-auto leading-normal">
                        Agrega nuevos destinos arriba para cargar automáticamente el catálogo en tu sitio web profesional.
                      </p>
                    </div>
                  </div>
                ) : (
                  state.selectedPackages.map((pkg) => (
                    <div 
                      key={pkg.id} 
                      className="bg-white/[0.01] border border-white/5 rounded-2xl p-4 hover:border-white/15 transition-all duration-300 group"
                    >
                      {editingId === pkg.id ? (
                        /* Edit mode expanded inline */
                        <div className="space-y-3">
                          <div className="text-[9px] font-black text-amber-400 uppercase tracking-widest mb-1">Editando Paquete</div>
                          <input 
                            value={editTitle} 
                            onChange={(e) => setEditTitle(e.target.value)} 
                            className="w-full bg-white/[0.04] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500/50" 
                          />
                          <textarea 
                            value={editDesc} 
                            onChange={(e) => setEditDesc(e.target.value)} 
                            rows={3} 
                            className="w-full bg-white/[0.04] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500/50 resize-none" 
                          />
                          <input 
                            value={editPrice} 
                            onChange={(e) => setEditPrice(e.target.value)} 
                            className="w-full bg-white/[0.04] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500/50" 
                          />
                          <div className="flex gap-2 pt-2 border-t border-white/5">
                            <button 
                              onClick={() => saveEdit(pkg.id)} 
                              className="flex-1 py-2 px-4 rounded-lg bg-amber-500 hover:bg-amber-600 text-black text-xs font-black uppercase tracking-wider transition-all"
                            >
                              Guardar Cambios
                            </button>
                            <button 
                              onClick={() => setEditingId(null)} 
                              className="py-2 px-4 rounded-lg bg-white/5 hover:bg-white/10 text-white/80 text-xs font-bold transition-all"
                            >
                              Cancelar
                            </button>
                          </div>
                        </div>
                      ) : (
                        /* Normal display view */
                        <div>
                          <div className="flex items-start gap-4">
                            {/* Package visual asset */}
                            <div className="w-16 h-16 rounded-xl bg-white/[0.02] border border-white/10 flex-shrink-0 overflow-hidden relative shadow-inner flex items-center justify-center">
                              {pkg.imageUrl ? (
                                <img src={pkg.imageUrl} className="w-full h-full object-cover" alt="" />
                              ) : (
                                <div className="text-white/20 text-center">
                                  <ImageIcon className="w-5 h-5 mx-auto" />
                                  <span className="text-[7px] uppercase font-bold text-white/30 block mt-0.5">Sin Foto</span>
                                </div>
                              )}
                            </div>

                            {/* Content Details */}
                            <div className="flex-1 min-w-0">
                              <h4 className="text-sm font-bold text-white leading-tight mb-1 truncate">{pkg.title}</h4>
                              <p className="text-xs text-white/50 line-clamp-2 leading-relaxed mb-2 pr-4">{pkg.description}</p>
                              
                              <span className="inline-flex text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full">
                                {pkg.price}
                              </span>
                            </div>

                            {/* Action Tools Overlay */}
                            <div className="flex gap-1">
                              <button 
                                onClick={() => startEdit(pkg)}
                                title="Editar paquete"
                                className="w-7 h-7 flex items-center justify-center rounded-lg bg-white/[0.03] border border-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-all cursor-pointer"
                              >
                                <Pencil className="w-3.5 h-3.5" />
                              </button>
                              <button 
                                onClick={() => duplicatePackage(pkg)}
                                title="Duplicar paquete"
                                className="w-7 h-7 flex items-center justify-center rounded-lg bg-white/[0.03] border border-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-all cursor-pointer"
                              >
                                <Copy className="w-3.5 h-3.5" />
                              </button>
                              <button 
                                onClick={() => removePackage(pkg.id)}
                                title="Eliminar paquete"
                                className="w-7 h-7 flex items-center justify-center rounded-lg bg-red-500/10 border border-red-500/20 text-red-400/60 hover:text-red-400 transition-all cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          {/* Image sync banner status */}
                          {pkg.imageUrl ? (
                            <div className="flex items-center gap-1.5 mt-3 py-1.5 px-3 rounded-lg border border-emerald-500/20 bg-emerald-500/5 text-[9px] font-bold text-emerald-400 font-sans">
                              <Check className="w-3 h-3" />
                              Sincronizado con Anuncio & Foto de la Fase 3
                            </div>
                          ) : (
                            <div className="flex items-center gap-1.5 mt-3 py-1.5 px-3 rounded-lg border border-amber-500/20 bg-amber-500/5 text-[9px] font-bold text-amber-400 font-sans">
                              <Link className="w-3 h-3 animate-pulse" />
                              <span>Foto vinculada ausente: Usa el <strong>Generador de Anuncios (F1)</strong> para crear el anuncio de este paquete</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>

              {/* Banner indicator */}
              {state.selectedPackages.length > 0 && (
                <div className="text-center py-2.5 rounded-xl bg-white/[0.02] border border-white/5 text-[9px] uppercase font-black tracking-widest text-white/30 font-sans">
                  ⚡ {state.selectedPackages.length} paquete{state.selectedPackages.length !== 1 ? "s" : ""} sincronizado{state.selectedPackages.length !== 1 ? "s" : ""} con tu sitio web Vercel
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
