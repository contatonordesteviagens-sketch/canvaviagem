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
import { COUNTRIES_DIAL, type CountryDial } from "@/lib/countriesDial";

const AGENCY_TYPES = [
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
] as const;

export const FabricaDashboard = () => {
  const { state, update } = useFabricaContext();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [phoneDropOpen, setPhoneDropOpen] = useState(false);

  // Deriva o país atual a partir do código salvo no estado (padrão Brasil)
  const currentCountry: CountryDial =
    COUNTRIES_DIAL.find((c) => c.code === (state.whatsappCountryCode || "BR")) ||
    COUNTRIES_DIAL[0];

  const handleCountrySelect = (c: CountryDial) => {
    setPhoneDropOpen(false);
    update({ whatsappDialCode: c.dialRaw, whatsappCountryCode: c.code, whatsapp: "" });
  };

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editPrice, setEditPrice] = useState("");

  // Form de adição de pacotes
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

  const domainSlug = state.agencyName ? slugify(state.agencyName) : "sua-agencia";
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
        toast.success("Logo atualizada!");
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
      toast.error("Adicione um título ao pacote");
      return;
    }
    const updated = state.selectedPackages.map((p) =>
      p.id === id ? { ...p, title: editTitle.trim(), description: editDesc.trim(), price: editPrice.trim() } : p
    );
    update({ selectedPackages: updated });
    setEditingId(null);
    toast.success("Pacote atualizado!");
  };

  const duplicatePackage = (original: any) => {
    const pkg = {
      ...original,
      id: `pkg_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      title: `${original.title} (cópia)`,
    };
    update({ selectedPackages: [pkg, ...state.selectedPackages] });
    toast.success("Pacote duplicado!");
  };

  const removePackage = (id: string) => {
    const updated = state.selectedPackages.filter((p) => p.id !== id);
    update({ selectedPackages: updated });
    toast.success("Pacote removido!");
  };

  const addPackage = () => {
    if (!newTitle.trim()) {
      toast.error("Adicione um título ao pacote");
      return;
    }
    const pkg = {
      id: `pkg_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      title: newTitle.trim(),
      description: newDesc.trim() || "Nova oferta especial.",
      price: newPrice.trim() || "Consulte",
      imageUrl: "",
      ctaLabel: "Reservar agora"
    };
    update({ selectedPackages: [pkg, ...state.selectedPackages] });
    setNewTitle("");
    setNewDesc("");
    setNewPrice("");
    setShowAddForm(false);
    toast.success("Novo pacote adicionado!");
  };

  return (
    <div className="space-y-8 animate-fadeIn max-w-[1280px] mx-auto pb-12">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0F0F11] to-[#0A0A0B] border border-white/5 p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-[0_4px_30px_rgba(0,0,0,0.4)]">
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-amber-500/10 to-transparent blur-3xl rounded-full" />
        <div className="space-y-2 relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-amber-500/20 bg-amber-500/10 mb-1">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
            <span className="text-[9px] font-black uppercase tracking-wider text-amber-400">Painel Geral</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight flex items-center gap-2">
            Bem-vindo à sua Fábrica de Destinos 🏰
          </h2>
          <p className="text-xs text-white/50 leading-relaxed max-w-xl">
            Configure o perfil da sua agência, adicione seus pacotes e gerencie suas mídias em tempo real. Tudo o que você preencher aqui será sincronizado com o seu site de viagens!
          </p>
        </div>

        {/* Quick Analytics */}
        <div className="flex gap-4 relative z-10">
          <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4 min-w-[120px] text-center backdrop-blur-md">
            <span className="text-[9px] font-bold text-white/40 uppercase tracking-wider block mb-1">Pacotes Ativos</span>
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
          
          {/* CARD 1: IDENTIDADE & PERFIL DA AGÊNCIA */}
          <div className="bg-[#0F0F11]/90 border border-white/5 rounded-3xl p-6 backdrop-blur-xl shadow-xl space-y-5">
            <h3 className="text-xs font-black text-white/60 uppercase tracking-widest flex items-center gap-2 mb-2">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              Identidade & Perfil da Agência
            </h3>

            {/* Logo e Nome */}
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
                      toast.success("Logo removida!");
                    }}
                    className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center text-white shadow-lg transition-all"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>

              {/* Dica */}
              <div className="text-center sm:text-left space-y-1">
                <span className="text-[9px] font-bold text-amber-400 uppercase tracking-wider">Foto do Perfil</span>
                <p className="text-[10px] text-white/40 leading-relaxed">
                  Envie a logo da sua agência em formato PNG/JPG. Ela será aplicada em seus anúncios gerados por IA e no cabeçalho do seu site.
                </p>
              </div>
            </div>

            {/* Inputs de Informação */}
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-white/40 uppercase tracking-wider block mb-1.5">Nome da Agência *</label>
                <input 
                  type="text"
                  value={state.agencyName || ""}
                  onChange={(e) => update({ agencyName: e.target.value })}
                  placeholder="Nome Comercial da sua Agência"
                  className="w-full bg-white/[0.03] border border-white/5 hover:border-white/10 focus:border-amber-500/50 rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none transition-all"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-white/40 uppercase tracking-wider block mb-1.5">Tipo de Agência</label>
                <select 
                  value={state.agencyType || ""}
                  onChange={(e) => update({ agencyType: e.target.value as any })}
                  className="w-full bg-[#161619] border border-white/5 hover:border-white/10 focus:border-amber-500/50 rounded-xl px-4 py-3 text-sm text-white focus:outline-none transition-all appearance-none cursor-pointer"
                >
                  <option value="" disabled className="text-white/30">Selecione o tipo da sua agência</option>
                  {AGENCY_TYPES.map((opt) => (
                    <option key={opt.v} value={opt.v} className="text-white">{opt.l}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-white/40 uppercase tracking-wider block mb-1.5">Instagram Profissional</label>
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
                      placeholder="@suaagencia"
                      className="w-full bg-white/[0.03] border border-white/5 hover:border-white/10 focus:border-amber-500/50 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-white/40 uppercase tracking-wider block mb-1.5">WhatsApp de Vendas *</label>
                  <div className="relative flex items-stretch w-full bg-white/[0.03] border border-white/5 hover:border-white/10 focus-within:border-amber-500/50 rounded-xl overflow-visible transition-all">
                    {/* Seletor de país / DDI */}
                    <button
                      type="button"
                      onClick={() => setPhoneDropOpen((v) => !v)}
                      className="flex items-center gap-1.5 px-3 border-r border-white/10 bg-white/[0.02] hover:bg-white/[0.06] text-sm text-white/85 transition-colors select-none rounded-l-xl shrink-0"
                      aria-label="Selecionar país"
                    >
                      <span className="text-base leading-none" aria-hidden>{currentCountry.flag}</span>
                      <span className="font-semibold text-xs">{currentCountry.dial}</span>
                      <span className="text-white/40 text-[10px]">▾</span>
                    </button>

                    {/* Dropdown de países */}
                    {phoneDropOpen && (
                      <div className="absolute z-50 top-full left-0 mt-1 w-64 max-h-64 overflow-y-auto rounded-xl border border-white/10 bg-zinc-900 shadow-2xl">
                        {COUNTRIES_DIAL.map((c) => (
                          <button
                            key={c.code}
                            type="button"
                            onClick={() => handleCountrySelect(c)}
                            className={`w-full flex items-center gap-2 px-3 py-2 text-sm text-white/85 hover:bg-white/10 transition-colors ${
                              c.code === currentCountry.code ? "bg-white/[0.06]" : ""
                            }`}
                          >
                            <span className="text-base">{c.flag}</span>
                            <span className="flex-1 text-left">{c.name}</span>
                            <span className="text-white/50 text-xs">{c.dial}</span>
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Campo do número nacional */}
                    <input
                      type="tel"
                      inputMode="numeric"
                      autoComplete="tel-national"
                      value={currentCountry.format(
                        (state.whatsapp || "").replace(/\D/g, "").slice(0, currentCountry.maxDigits)
                      )}
                      onChange={(e) => {
                        const raw = e.target.value.replace(/\D/g, "").slice(0, currentCountry.maxDigits);
                        update({ whatsapp: raw });
                        if (phoneDropOpen) setPhoneDropOpen(false);
                      }}
                      placeholder={
                        currentCountry.code === "BR" ? "(85) 99999-9999" : "Número de telefone"
                      }
                      className="flex-1 bg-transparent px-3 py-3 text-sm text-white placeholder-white/20 outline-none min-w-0"
                    />
                  </div>
                  {/* Preview do número completo para WhatsApp */}
                  {state.whatsapp && (
                    <p className="text-[9px] text-white/30 mt-1 pl-1">
                      wa.me/{currentCountry.dialRaw}{(state.whatsapp || "").replace(/\D/g, "")}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-white/40 uppercase tracking-wider block mb-1.5">Endereço Físico (Mapa)</label>
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
              Seu Endereço de Internet
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
                  <h4 className="text-xs font-bold text-white leading-tight">O site da sua agência está ativo!</h4>
                  <p className="text-[10px] text-white/40 max-w-[280px] mx-auto leading-normal">
                    Todos os pacotes criados na coluna ao lado serão sincronizados instantaneamente.
                  </p>
                </div>

                <div className="flex gap-2">
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText(mockUrl);
                      toast.success("Link copiado para a área de transferência!");
                    }}
                    className="flex-1 py-2 px-3 rounded-lg bg-white/[0.04] border border-white/10 hover:bg-white/[0.08] text-[10px] font-bold text-white/80 hover:text-white transition-all"
                  >
                    Copiar Link
                  </button>
                  <button 
                    onClick={() => window.open(mockUrl, "_blank")}
                    className="flex-1 py-2 px-3 rounded-lg bg-amber-500 hover:bg-amber-600 text-[10px] font-bold text-black flex items-center justify-center gap-1 transition-all"
                  >
                    Visitar Site <ExternalLink className="w-2.5 h-2.5" />
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
                  Pacotes prontos para vender ({state.selectedPackages.length})
                </h3>
                <span className="text-[9px] text-white/30 uppercase font-semibold">Fase 2 / Integração Comercial</span>
              </div>
            </div>

            {/* Adicionar novo pacote Form */}
            <div className="space-y-4">
              {!showAddForm ? (
                <button
                  onClick={() => { setShowAddForm(true); setEditingId(null); }}
                  className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl border-2 border-dashed border-white/10 text-white/40 hover:border-amber-500/40 hover:text-amber-400 transition-all duration-300 text-xs uppercase font-extrabold tracking-widest bg-white/[0.01] hover:bg-amber-500/[0.02]"
                >
                  <Plus className="w-4 h-4" /> Adicionar novo pacote
                </button>
              ) : (
                <div className="bg-[#141416] border border-white/10 rounded-2xl p-5 space-y-4 animate-scaleUp">
                  <div className="flex items-center justify-between border-b border-white/5 pb-2">
                    <span className="text-[10px] font-black text-amber-400 uppercase tracking-widest">Novo Pacote Comercial</span>
                    <button 
                      onClick={() => setShowAddForm(false)}
                      className="p-1 rounded-md hover:bg-white/5 text-white/40 hover:text-white transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="text-[9px] font-bold text-white/40 uppercase block mb-1">Título do Destino *</label>
                      <input
                        value={newTitle}
                        onChange={(e) => setNewTitle(e.target.value)}
                        placeholder="Ex: Jericoacoara Mágico 4 Dias"
                        className="w-full bg-white/[0.03] border border-white/5 focus:border-amber-500/50 rounded-lg px-3 py-2 text-sm text-white placeholder-white/20 focus:outline-none"
                      />
                    </div>
                    
                    <div>
                      <label className="text-[9px] font-bold text-white/40 uppercase block mb-1">O que está incluso</label>
                      <textarea
                        value={newDesc}
                        onChange={(e) => setNewDesc(e.target.value)}
                        placeholder="Ex: ✔ Transporte Inclusivo ✔ Hospedagem com café ✔ Guia local"
                        rows={3}
                        className="w-full bg-white/[0.03] border border-white/5 focus:border-amber-500/50 rounded-lg px-3 py-2 text-sm text-white placeholder-white/20 focus:outline-none resize-none"
                      />
                    </div>

                    <div>
                      <label className="text-[9px] font-bold text-white/40 uppercase block mb-1">Preço / Condições *</label>
                      <input
                        value={newPrice}
                        onChange={(e) => setNewPrice(e.target.value)}
                        placeholder="Ex: À vista R$ 450,00 por pessoa"
                        className="w-full bg-white/[0.03] border border-white/5 focus:border-amber-500/50 rounded-lg px-3 py-2 text-sm text-white placeholder-white/20 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2 border-t border-white/5">
                    <button 
                      onClick={addPackage} 
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider text-black bg-gradient-to-r from-amber-500 to-yellow-300 hover:brightness-110 transition-all shadow-md shadow-amber-500/10 cursor-pointer"
                    >
                      <Check className="w-4 h-4" /> Adicionar e Sincronizar
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
                      <p className="text-xs text-white/60 font-bold">Nenhum pacote cadastrado</p>
                      <p className="text-[10px] text-white/30 max-w-[280px] mx-auto leading-normal">
                        Adicione novos destinos acima para carregar automaticamente o catálogo no seu site profissional.
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
                          <div className="text-[9px] font-black text-amber-400 uppercase tracking-widest mb-1">Editando Pacote</div>
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
                              Salvar Alterações
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
                                  <span className="text-[7px] uppercase font-bold text-white/30 block mt-0.5">Sem Foto</span>
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
                                title="Editar pacote"
                                className="w-7 h-7 flex items-center justify-center rounded-lg bg-white/[0.03] border border-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-all cursor-pointer"
                              >
                                <Pencil className="w-3.5 h-3.5" />
                              </button>
                              <button 
                                onClick={() => duplicatePackage(pkg)}
                                title="Duplicar pacote"
                                className="w-7 h-7 flex items-center justify-center rounded-lg bg-white/[0.03] border border-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-all cursor-pointer"
                              >
                                <Copy className="w-3.5 h-3.5" />
                              </button>
                              <button 
                                onClick={() => removePackage(pkg.id)}
                                title="Remover pacote"
                                className="w-7 h-7 flex items-center justify-center rounded-lg bg-red-500/10 border border-red-500/20 text-red-400/60 hover:text-red-400 transition-all cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          {/* Image sync banner status */}
                          {pkg.imageUrl ? (
                            <div className="flex items-center gap-1.5 mt-3 py-1.5 px-3 rounded-lg border border-emerald-500/20 bg-emerald-500/5 text-[9px] font-bold text-emerald-400">
                              <Check className="w-3 h-3" />
                              Sincronizado com Anúncio & Foto da Fase 3
                            </div>
                          ) : (
                            <div className="flex items-center gap-1.5 mt-3 py-1.5 px-3 rounded-lg border border-amber-500/20 bg-amber-500/5 text-[9px] font-bold text-amber-400">
                              <Link className="w-3 h-3 animate-pulse" />
                              <span>Foto vinculada ausente: Use o <strong>Gerador de Anúncios (F1)</strong> para criar a arte deste pacote</span>
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
                <div className="text-center py-2.5 rounded-xl bg-white/[0.02] border border-white/5 text-[9px] uppercase font-black tracking-widest text-white/30">
                  ⚡ {state.selectedPackages.length} pacote{state.selectedPackages.length !== 1 ? "s" : ""} sincronizado{state.selectedPackages.length !== 1 ? "s" : ""} com seu site Vercel
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
