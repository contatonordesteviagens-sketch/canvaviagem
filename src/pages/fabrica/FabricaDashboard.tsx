import { useState, useRef, useEffect } from "react";
import { useFabricaContext, type Pacote } from "@/hooks/useFabricaContext";
import { useDiagnosticos, useSaveDiagnostico, type DiagnosticoSalvo } from "@/hooks/useFabricaDiagnosticos";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { BusinessExtractor } from "@/components/fabrica/BusinessExtractor";
import { BrandPaletteEditor } from "@/components/fabrica/BrandPaletteEditor";
import { ProjectSwitchDialog } from "@/components/fabrica/ProjectSwitchDialog";
import { PackageAdvancedFields } from "@/components/fabrica/PackageAdvancedFields";

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
  Mail,
  Image as ImageIcon 
} from "lucide-react";
import { toast } from "sonner";
import { COUNTRIES_DIAL, type CountryDial } from "@/lib/countriesDial";
import { useQueryClient } from "@tanstack/react-query";
import { buildPackageSlug, createUniquePackageSlug } from "@/lib/package-details";
import { deleteFabricaProject } from "@/lib/fabrica-project-deletion";

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

const UI_ACCENT = "#F5F906";
const UI_ACCENT_BORDER_SOFT = "rgba(245, 249, 6, 0.35)";

export const FabricaDashboard = ({ onNavigate }: { onNavigate?: (tab: "dashboard" | "phase" | "library", phase?: number) => void }) => {
  const { state, update, reset, deleteAndDiscardCurrentProject, switchProject } = useFabricaContext();
  const { user } = useAuth();
  const { data: savedProjects } = useDiagnosticos();
  const saveProject = useSaveDiagnostico();
  const queryClient = useQueryClient();
  const [projectsPanelOpen, setProjectsPanelOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [pendingProjectSwitch, setPendingProjectSwitch] = useState<DiagnosticoSalvo | null>(null);
  const [isSwitchingProject, setIsSwitchingProject] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadSavedProject = async (project: DiagnosticoSalvo) => {
    const targetName = project.agency_name || "Sem nome";
    const isRecovered = project.source === "published_recovery";
    setIsSwitchingProject(true);
    try {
      await switchProject({ ...project.state_snapshot, projectId: project.id });
      setPendingProjectSwitch(null);
      if (isRecovered) toast.warning(`Site legado "${targetName}" recuperado. Revise os dados antes de republicar.`);
      else toast.success(`Projeto "${targetName}" carregado!`);
      window.setTimeout(() => onNavigate?.("phase", 2), 100);
    } catch {
      toast.error("Não foi possível salvar o projeto atual. A troca foi cancelada para proteger suas alterações.");
    } finally {
      setIsSwitchingProject(false);
    }
  };

  const requestProjectSwitch = (project: DiagnosticoSalvo) => {
    if (project.id === state.projectId) {
      toast.info("Este projeto já está aberto.");
      return;
    }
    if (!state.agencyName) {
      void loadSavedProject(project);
      return;
    }
    setPendingProjectSwitch(project);
  };

  const handleSaveProject = async () => {
    if (!user) { toast.error("Faça login para salvar"); return; }
    setIsSaving(true);
    try {
      const saved = await saveProject.mutateAsync({
        state,
        score: state.digitalScore || 0,
        level: 1,
        levelName: "Projeto Salvo",
        existingId: state.projectId,
      });
      // ✅ FIX CRÍTICO: Atualiza o projectId no state com o ID retornado pelo Supabase
      // Isso evita que o auto-sync crie um segundo registro duplicado
      if ((saved as any)?.id && (saved as any).id !== state.projectId) {
        update({ projectId: (saved as any).id });
      }
      toast.success("✅ Projeto salvo com sucesso na sua conta!");
    } catch (e: any) {
      toast.error(e?.message || "Erro ao salvar projeto");
    } finally {
      setIsSaving(false);
    }
  };

  // Sites publicados reais (canvaviagem.com) deste usuário
  const [publishedSites, setPublishedSites] = useState<{ id: string; updated_at: string; project_id?: string | null }[]>([]);
  // Leads canônicos de toda a conta (mesma fonte do CRM, sem telemetria anônima)
  const [realLeadsCount, setRealLeadsCount] = useState<number>(0);

  useEffect(() => {
    if (!user?.id) return;
    let cancelled = false;
    (async () => {
      try {
        const { data: sites } = await supabase
          .from("public_sites")
          .select("id, updated_at, project_id")
          .eq("owner_id", user.id)
          .eq("locale", "pt-BR")
          .order("updated_at", { ascending: false });
        if (!cancelled && sites) setPublishedSites(sites);

        const { count } = await (supabase as any)
          .from("crm_form_submissions")
          .select("*", { count: "exact", head: true })
          .eq("owner_id", user.id);
        if (!cancelled) setRealLeadsCount(count || 0);
      } catch (e) {
        console.warn("[FabricaDashboard] Falha ao sincronizar sites/leads:", e);
      }
    })();
    return () => { cancelled = true; };
  }, [user?.id, state.siteContent?.canvaViagemUrl, state.siteContent?.vercelUrl]);


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
  const [editDetails, setEditDetails] = useState<Partial<Pacote>>({});

  // Form de adição de pacotes
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newPrice, setNewPrice] = useState("");
  const [newDetails, setNewDetails] = useState<Partial<Pacote>>({});

  // Address Autocomplete
  const [addressQuery, setAddressQuery] = useState(state.address || "");
  const [addressOptions, setAddressOptions] = useState<any[]>([]);
  const [showAddressOptions, setShowAddressOptions] = useState(false);
  const addressTimeoutRef = useRef<any>(null);

  const handleAddressChange = (val: string) => {
    setAddressQuery(val);
    update({ address: val });
    if (addressTimeoutRef.current) clearTimeout(addressTimeoutRef.current);
    if (!val || val.length < 4) {
      setAddressOptions([]);
      setShowAddressOptions(false);
      return;
    }
    addressTimeoutRef.current = setTimeout(() => {
      fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(val)}&format=json&addressdetails=1&limit=5&countrycodes=br`)
        .then(r => r.json())
        .then(data => {
          setAddressOptions(data);
          setShowAddressOptions(data.length > 0);
        }).catch(() => {});
    }, 600);
  };

  const selectAddress = (addr: any) => {
    const formatted = addr.display_name;
    setAddressQuery(formatted);
    update({ address: formatted });
    setShowAddressOptions(false);
  };

  useEffect(() => {
    setAddressQuery(state.address || "");
  }, [state.address]);

  const slugify = (text: string) => {
    return text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");
  };


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
    setEditDetails(pkg);
    setShowAddForm(false);
  };

  const saveEdit = (id: string) => {
    if (!editTitle.trim()) {
      toast.error("Adicione um título ao pacote");
      return;
    }
    const updated = state.selectedPackages.map((p) =>
      p.id === id ? { ...p, ...editDetails, title: editTitle.trim(), description: editDesc.trim(), price: editPrice.trim() } : p
    );
    update({ selectedPackages: updated });
    setEditingId(null);
    toast.success("Pacote atualizado!");
  };

  const duplicatePackage = (original: any) => {
    const id = `pkg_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const usedSlugs = state.selectedPackages.map((item) => item.slug || buildPackageSlug(item.title, item.id));
    const pkg = {
      ...original,
      id,
      title: `${original.title} (cópia)`,
      slug: createUniquePackageSlug(`${original.slug || original.title}-copia`, usedSlugs, id),
    };
    update({ selectedPackages: [pkg, ...state.selectedPackages] });
    toast.success("Pacote duplicado!");
  };

  const removePackage = (id: string) => {
    const updated = state.selectedPackages.filter((p) => p.id !== id);
    update({ selectedPackages: updated });
    toast.success("Pacote removido!");
  };

  const togglePublish = (id: string, currentDraft: boolean) => {
    const updated = state.selectedPackages.map(p => p.id === id ? { ...p, isDraft: !currentDraft } : p);
    update({ selectedPackages: updated });
    toast.success(currentDraft ? "Pacote aprovado e enviado para o site!" : "Pacote removido do site (rascunho).");
  };

  const addPackage = () => {
    if (!newTitle.trim()) {
      toast.error("Adicione um título ao pacote");
      return;
    }
    const id = `pkg_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const usedSlugs = state.selectedPackages.map((item) => item.slug || buildPackageSlug(item.title, item.id));
    const pkg = {
      imageUrl: "",
      ctaLabel: "Reservar agora",
      ...newDetails,
      id,
      title: newTitle.trim(),
      slug: newDetails.slug || createUniquePackageSlug(newTitle.trim(), usedSlugs, id),
      description: newDesc.trim() || "Nova oferta especial.",
      price: newPrice.trim() || "Consulte",
    };
    update({ selectedPackages: [pkg, ...state.selectedPackages] });
    setNewTitle("");
    setNewDesc("");
    setNewPrice("");
    setNewDetails({});
    setShowAddForm(false);
    toast.success("Novo pacote adicionado!");
  };

  const handleExtractorData = (data: any) => {
    let newUpdates: any = {};
    if (data.agencyName) newUpdates.agencyName = data.agencyName;
    if (data.niche) newUpdates.agencyType = data.niche;
    
    // Convert extracted array into proper package objects
    if (data.packages && Array.isArray(data.packages)) {
      const usedSlugs = new Set(state.selectedPackages.map((item) => item.slug || buildPackageSlug(item.title, item.id)));
      const newPackages = data.packages.map((pkg: any, index: number) => {
        const id = `pkg_${Date.now()}_${index}_${Math.random().toString(36).slice(2, 7)}`;
        const title = pkg.title || "Pacote IA";
        const slug = createUniquePackageSlug(title, usedSlugs, id);
        usedSlugs.add(slug);
        return {
          id,
          title,
          slug,
          description: pkg.description || "",
          price: pkg.price || "Consulte",
          imageUrl: "",
          ctaLabel: "Reservar agora"
        };
      });
      newUpdates.selectedPackages = [...newPackages, ...state.selectedPackages];
    }
    
    if (Object.keys(newUpdates).length > 0) {
      update(newUpdates);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn max-w-[1280px] mx-auto pb-12">
      <ProjectSwitchDialog
        open={Boolean(pendingProjectSwitch)}
        currentName={state.agencyName || "Sem nome"}
        targetName={pendingProjectSwitch?.agency_name || "Sem nome"}
        busy={isSwitchingProject}
        onCancel={() => !isSwitchingProject && setPendingProjectSwitch(null)}
        onConfirm={() => pendingProjectSwitch && void loadSavedProject(pendingProjectSwitch)}
      />

      {/* Projetos Salvos */}
      {user && (
        <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl relative overflow-hidden transition-all shadow-[0_4px_20px_rgba(0,0,0,0.2)]">
          <div className="absolute top-0 left-0 w-1 h-full" style={{ background: UI_ACCENT }}></div>
          <button
            type="button"
            onClick={() => setProjectsPanelOpen(!projectsPanelOpen)}
            className="w-full flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1 sm:gap-2 text-[11px] text-white/60 font-bold uppercase tracking-wider outline-none text-left"
          >
            <span className="flex items-center gap-1.5">📂 EDITAR SITES (Projetos Salvos) {savedProjects && savedProjects.length > 0 && `(${savedProjects.length})`}</span>
            <span className="text-[10px] text-white/30 font-medium self-end sm:self-auto">{projectsPanelOpen ? "▲ RECOLHER" : "▼ EXPANDIR / CARREGAR"}</span>
          </button>
          
          {projectsPanelOpen && (
            <div className="mt-3 flex flex-col sm:flex-row gap-2 pt-2 border-t border-white/5">
              {savedProjects && savedProjects.length > 0 ? (
                <select
                  value=""
                  onChange={(e) => {
                    const val = e.target.value;
                    if (!val) return;
                    const p = savedProjects!.find(x => x.id === val);
                    if (!p || !p.state_snapshot) return;
                    requestProjectSwitch(p);
                  }}
                  className="flex-1 bg-white/[0.04] border border-white/10 rounded-lg px-3 py-2 text-white outline-none focus:border-white/30 transition-colors text-xs"
                >
                  <option value="" className="bg-zinc-900">Selecione o site que deseja editar...</option>
                  {savedProjects!.map((p) => {
                    // ✅ FIX #8: Labels com informações úteis para distinguir projetos
                    const snap = p.state_snapshot as any;
                    const pkgCount = snap?.selectedPackages?.length || 0;
                    const score = snap?.digitalScore || p.digital_score || 0;
                    const date = new Date(p.updated_at).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' });
                    const isCurrent = p.id === state.projectId;
                    const isRecovered = p.source === "published_recovery";
                    return (
                      <option key={p.id} value={p.id} className="bg-zinc-900">
                        {isCurrent ? '● ' : ''}{p.agency_name || "Sem Nome"}{isRecovered ? " • Recuperado" : ""} — {pkgCount} pacote{pkgCount !== 1 ? 's' : ''} • Score {score}% • {date}
                      </option>
                    );
                  })}
                </select>
              ) : (
                <div className="flex-1 bg-white/[0.01] border border-white/5 rounded-lg px-3 py-2 text-white/40 text-xs flex items-center">
                  Nenhum projeto salvo encontrado
                </div>
              )}
              {/* Botão Salvar Projeto */}
              <button
                type="button"
                onClick={handleSaveProject}
                disabled={isSaving || !state.agencyName}
                className="px-3 py-2 rounded-lg text-white text-xs font-bold transition-all border border-emerald-500/40 bg-emerald-500/10 hover:bg-emerald-500/20 active:scale-95 shrink-0 flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
                title={!state.agencyName ? "Preencha o nome da agência antes de salvar" : "Salvar projeto atual na sua conta"}
              >
                {isSaving ? (
                  <>
                    <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z" />
                    </svg>
                    <span>Salvando...</span>
                  </>
                ) : (
                  <>
                    <span>💾</span>
                    <span>Salvar Projeto</span>
                  </>
                )}
              </button>

              {state.projectId && (
                <button
                  type="button"
                  onClick={async () => {
                    const currentName = state.agencyName || 'Sem nome';
                    if (!window.confirm(`⚠️ Deseja realmente excluir o projeto salvo "${currentName}"? Esta ação não pode ser desfeita.`)) return;
                    try {
                      const projectId = state.projectId || "";
                      const storedProject = savedProjects?.find((project) => project.id === projectId);
                      const snapshot = storedProject?.state_snapshot || state;
                      const linkedSlugs = publishedSites.filter((site) => site.project_id === projectId).map((site) => site.id);
                      for (const url of [snapshot.siteContent?.canvaViagemUrl, snapshot.siteContent?.vercelUrl]) {
                        if (!url) continue;
                        try { linkedSlugs.push(new URL(url).hostname.split(".")[0]); } catch { /* URL legado inválido */ }
                      }
                      const uniqueSlugs = [...new Set(linkedSlugs.filter(Boolean))];
                      await deleteAndDiscardCurrentProject(async (persistedProjectId) => {
                        if (persistedProjectId) {
                          await deleteFabricaProject({ projectId: persistedProjectId, userId: user!.id, legacySlugs: uniqueSlugs });
                        } else if (uniqueSlugs.length > 0) {
                          const { error: slugsError } = await supabase
                            .from("public_sites")
                            .delete()
                            .eq("owner_id", user!.id)
                            .is("project_id", null)
                            .in("id", uniqueSlugs);
                          if (slugsError) throw slugsError;
                        }
                      });
                      setPublishedSites((sites) => sites.filter((site) => site.project_id !== projectId && !uniqueSlugs.includes(site.id)));
                      await Promise.all([
                        queryClient.invalidateQueries({ queryKey: ["fabrica-diagnosticos"] }),
                        queryClient.invalidateQueries({ queryKey: ["public-sites"] }),
                      ]);
                      toast.success("🗑️ Projeto excluído com sucesso!");
                    } catch (err: any) {
                      toast.error(err?.message || "Erro ao excluir projeto.");
                    }
                  }}
                  className="px-3 py-2 rounded-lg text-red-400 text-xs font-bold transition-all border border-red-500/20 bg-red-500/10 hover:bg-red-500/20 active:scale-95 shrink-0 flex items-center justify-center gap-1.5"
                  title="Excluir o projeto atual"
                >
                  <span>🗑️</span>
                  <span>Excluir Projeto</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => {
                  const confirmed = window.confirm(
                    `⚠️ Antes de criar um novo projeto, certifique-se de ter salvo o projeto atual ("${state.agencyName || 'Sem nome'}").\n\nDeseja continuar e criar um novo projeto em branco?`
                   );
                   if (!confirmed) return;
                   reset();
                   toast.success("Novo projeto iniciado! Você pode preencher os dados iniciais aqui.");
                   setProjectsPanelOpen(false);
                   onNavigate?.("phase", 1);
                }}
                className="px-3 py-2 rounded-lg text-white text-xs font-bold transition-all border border-white/10 hover:bg-white/5 active:scale-95 shrink-0 flex items-center justify-center gap-1.5"
                style={{ borderColor: UI_ACCENT_BORDER_SOFT }}
              >
                <span>+ Novo Projeto</span>
              </button>
            </div>
          )}
        </div>
      )}



      {/* Main Responsive Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* Left Side: Agency Info & Brand (5 Cols) */}
        <div className="md:col-span-5 space-y-6">
          
          {/* CARD 1: IDENTIDADE & PERFIL DA AGÊNCIA */}
          <div className="bg-[#0F0F11]/90 border border-white/5 rounded-3xl p-6 backdrop-blur-xl shadow-xl space-y-5">
            <h3 
              onClick={() => onNavigate?.("phase", 5)}
              className="text-xs font-black text-white/60 uppercase tracking-widest flex items-center gap-2 mb-2 cursor-pointer hover:text-amber-400 transition-colors group"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              Identidade & Perfil da Agência
              <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity ml-1 text-amber-400 shrink-0" />
            </h3>

            {/* Logo e Nome */}
            <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-start bg-white/[0.02] border border-white/5 rounded-2xl p-4 sm:p-5">
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

              {/* Nome e Tipo da Agência integrados ao card da Logo no Mobile e Desktop */}
              <div className="flex-1 w-full space-y-4">
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
              </div>
            </div>

            {/* Inputs de Informação Restantes */}
            <div className="space-y-4 pt-2">

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
                  <label className="text-[10px] font-bold text-white/40 uppercase tracking-wider block mb-1.5">E-mail da Agência</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-white/30" />
                    <input 
                      type="email"
                      value={state.agencyEmail || ""}
                      onChange={(e) => update({ agencyEmail: e.target.value })}
                      placeholder="contato@suaagencia.com.br"
                      className="w-full bg-white/[0.03] border border-white/5 hover:border-white/10 focus:border-amber-500/50 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none transition-all"
                    />
                  </div>
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
                </div>              <div>
                <label className="text-[10px] font-bold text-white/40 uppercase tracking-wider block mb-1.5">Endereço Físico (Mapa)</label>
                <div className="relative">
                  <MapPin className="absolute left-3.5 top-3.5 w-4 h-4 text-white/30" />
                  <input 
                    type="text"
                    value={addressQuery}
                    onChange={(e) => handleAddressChange(e.target.value)}
                    onFocus={() => { if (addressOptions.length > 0) setShowAddressOptions(true); }}
                    onBlur={() => setTimeout(() => setShowAddressOptions(false), 200)}
                    placeholder="Av. Paulista, 1000 - São Paulo, SP"
                    className="w-full bg-white/[0.03] border border-white/5 hover:border-white/10 focus:border-amber-500/50 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none transition-all"
                  />
                  {showAddressOptions && (
                    <div className="absolute z-50 top-full left-0 mt-1 w-full max-h-48 overflow-y-auto rounded-xl border border-white/10 bg-[#161619] shadow-2xl">
                      {addressOptions.map((opt, i) => (
                        <button
                          key={i}
                          type="button"
                          onMouseDown={() => selectAddress(opt)}
                          className="w-full text-left px-4 py-3 text-xs text-white/80 hover:bg-white/10 transition-colors border-b border-white/5 last:border-0"
                        >
                          {opt.display_name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-4">
                <div className="mb-3">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-white/55">Cores da marca</div>
                  <p className="mt-1 text-[10px] leading-relaxed text-white/35">
                    Defina uma vez e use automaticamente nos anúncios e nos sites.
                  </p>
                </div>
                <BrandPaletteEditor
                  compact
                  primaryColor={state.primaryColor}
                  secondaryColor={state.secondaryColor}
                  backgroundColor={state.backgroundColor || "#F4F6F9"}
                  onChange={(patch) => update(patch)}
                />
              </div>
            </div>
          </div>

          {/* CARD RESUMO & HISTÓRICO DO USUÁRIO */}
          <div className="mt-6 bg-[#0F0F11]/90 border border-white/5 rounded-3xl p-6 backdrop-blur-xl shadow-xl space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black text-white/60 uppercase tracking-widest flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-violet-400" />
                Resumo & Histórico da sua Fábrica
              </h3>
              <span className="text-[9px] text-white/30 uppercase font-semibold">Apenas o seu conteúdo</span>
            </div>

            {/* Cards de contagem */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div 
                onClick={() => onNavigate?.("phase", 1)}
                className="bg-white/[0.02] border border-white/5 rounded-2xl p-4 text-center cursor-pointer hover:bg-white/[0.06] hover:border-violet-500/30 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
              >
                <div className="w-8 h-8 rounded-xl bg-violet-500/10 text-violet-400 flex items-center justify-center mx-auto mb-2">
                  <ImageIcon className="w-4 h-4" />
                </div>
                <div className="text-2xl font-black text-white leading-none">{state.allGeneratedAdImages?.length || 0}</div>
                <div className="text-[9px] font-bold text-white/40 uppercase tracking-wider mt-1.5">Imagens geradas</div>
              </div>
              <div 
                onClick={() => onNavigate?.("phase", 2)}
                className="bg-white/[0.02] border border-white/5 rounded-2xl p-4 text-center cursor-pointer hover:bg-white/[0.06] hover:border-emerald-500/30 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
              >
                <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto mb-2">
                  <Globe className="w-4 h-4" />
                </div>
                <div className="text-2xl font-black text-white leading-none">{publishedSites.length}</div>
                <div className="text-[9px] font-bold text-white/40 uppercase tracking-wider mt-1.5">Sites publicados</div>
                {publishedSites.length > 0 && (
                   <div className="text-[9px] text-zinc-500/80 mb-2 leading-tight">
                     Dica: Para editar um destes sites, selecione-o na lista <b>"EDITAR SITE"</b> no topo da página.
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
                  Sites publicados ({publishedSites.length})
                </div>
                <div className="space-y-1.5">
                  {publishedSites.map((site) => {
                    const url = `https://${site.id}.canvaviagem.com`;
                    return (
                      <div key={site.id} className="flex flex-col sm:flex-row gap-2">
                        <a
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 flex items-center justify-between gap-2 min-w-0 px-3 py-2.5 rounded-xl bg-emerald-500/5 border border-emerald-500/15 hover:bg-emerald-500/10 transition-all group"
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
                            // 1. Tenta encontrar por ID exato do projeto (ignorando user.id se foi salvo com UUID do usuário)
                            let p = (site.project_id && site.project_id !== user?.id)
                              ? savedProjects?.find(x => x.id === site.project_id)
                              : undefined;

                            // 2. Se não encontrou por ID, procura pelo slug da URL ou nome da agência ou ID do site
                            if (!p) {
                              p = savedProjects?.find(x => {
                                const snap = x.state_snapshot as any;
                                const urlSlug = snap?.siteContent?.canvaViagemUrl?.replace('https://', '')?.split('.')[0] || snap?.siteContent?.vercelUrl?.replace('https://', '')?.split('.')[0];
                                const agencySlug = x.agency_name ? slugify(x.agency_name) : null;
                                return urlSlug === site.id || agencySlug === site.id || x.id === site.id || x.id === site.project_id;
                              });
                            }

                            if (!p?.state_snapshot) {
                              toast.error(`O site "${site.id}" ainda não possui um projeto editável recuperado. Atualize a página e tente novamente.`);
                              return;
                            }
                            requestProjectSwitch(p);
                          }}
                          className="px-3 py-2.5 rounded-xl bg-violet-500/10 border border-violet-500/20 hover:bg-violet-500/20 text-violet-400 text-xs font-bold transition-all shrink-0 flex items-center gap-1.5"
                        >
                          <Pencil className="w-3.5 h-3.5" /> Editar Site
                        </button>
                        <button
                          type="button"
                          onClick={async () => {
                            if (!window.confirm(`⚠️ Deseja realmente despublicar o site "${url}"? O projeto continuará salvo para edição.`)) return;
                            try {
                              const project = savedProjects?.find((candidate) => candidate.id === site.project_id) || savedProjects?.find((candidate) => {
                                const snapshot = candidate.state_snapshot as any;
                                const savedSlug = snapshot?.siteContent?.canvaViagemUrl?.replace(/^https?:\/\//, "")?.split(".")[0];
                                return savedSlug === site.id;
                              });
                              const { error } = await supabase.from("public_sites").delete().eq("id", site.id).eq("owner_id", user!.id);
                              if (error) throw error;
                              if (project?.state_snapshot) {
                                const nextSnapshot = {
                                  ...project.state_snapshot,
                                  siteContent: { ...project.state_snapshot.siteContent, canvaViagemUrl: "", vercelUrl: "" },
                                };
                                if (/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(project.id)) {
                                  const { error: projectError } = await supabase.from("fabrica_diagnosticos" as any).update({ state_snapshot: nextSnapshot }).eq("id", project.id).eq("user_id", user!.id);
                                  if (projectError) throw projectError;
                                }
                                if (project.id === state.projectId) {
                                  update({ siteContent: { ...state.siteContent, canvaViagemUrl: "", vercelUrl: "" } });
                                }
                              }
                              setPublishedSites(prev => prev.filter(s => s.id !== site.id));
                              await Promise.all([
                                queryClient.invalidateQueries({ queryKey: ["fabrica-diagnosticos"] }),
                                queryClient.invalidateQueries({ queryKey: ["public-sites"] }),
                              ]);
                              toast.success("Site despublicado. O projeto continua disponível para edição.");
                            } catch (err: any) {
                              toast.error(err?.message || "Erro ao excluir site publicado");
                            }
                          }}
                          className="px-3 py-2.5 rounded-xl bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 text-red-400 text-xs font-bold transition-all shrink-0 flex items-center gap-1.5"
                          title="Tirar o site do ar sem apagar o projeto"
                        >
                          📴 Despublicar
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
                  <div className="text-[10px] font-bold text-white/40 uppercase tracking-wider">Últimas imagens geradas</div>
                  <span className="text-[9px] text-white/30">{state.allGeneratedAdImages!.length} no total</span>
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
                  {state.allGeneratedAdImages!.slice(-6).reverse().map((src, i) => (
                    <a
                      key={i}
                      href={src}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="aspect-square rounded-lg overflow-hidden border border-white/5 hover:border-violet-500/40 transition-all bg-white/[0.02]"
                    >
                      <img src={src} alt={`Geração ${i + 1}`} className="w-full h-full object-cover" loading="lazy" />
                    </a>
                  ))}
                </div>
              </div>
            )}

            {(state.allGeneratedAdImages?.length || 0) === 0 && !state.siteContent?.canvaViagemUrl && !state.siteContent?.vercelUrl && (
              <p className="text-[11px] text-white/40 italic text-center py-2">
                Seu histórico aparecerá aqui assim que você gerar suas primeiras imagens ou publicar seu primeiro site.
              </p>
            )}
            
            {/* Call to action de Avançar para Fase 1 */}
            <div className="pt-2 border-t border-white/5">
              <button
                onClick={() => {
                  const confirmed = window.confirm(
                    `Deseja começar um novo projeto em branco? O projeto atual ("${state.agencyName || "Sem nome"}") continuará salvo.`
                  );
                  if (!confirmed) return;
                  reset();
                  onNavigate?.("phase", 1);
                }}
                className="w-full py-3 rounded-xl bg-white/[0.03] hover:bg-violet-500/10 border border-white/5 hover:border-violet-500/30 text-white/60 hover:text-violet-400 text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2"
              >
                <Plus className="w-3.5 h-3.5" /> Começar Novo Projeto (Fase 1)
              </button>
            </div>
          </div>
        </div>

        {/* Right Side: Package Management (7 Cols) */}
        <div className="md:col-span-7 space-y-6">
          
          {/* Temporariamente oculto - voltar depois */}
          {false && <BusinessExtractor onExtract={handleExtractorData} />}

          {/* DYNAMIC CARD: SEUS PACOTES */}
          <div className="bg-[#0F0F11]/90 border border-white/5 rounded-3xl p-6 backdrop-blur-xl shadow-xl space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 
                  onClick={() => onNavigate?.("phase", 2)}
                  className="text-xs font-black text-white/60 uppercase tracking-widest flex items-center gap-2 cursor-pointer hover:text-emerald-400 transition-colors group"
                >
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

                  <PackageAdvancedFields
                    pacote={{
                      id: "novo-pacote",
                      title: newTitle,
                      description: newDesc,
                      price: newPrice,
                      ctaLabel: "Reservar agora",
                      ...newDetails,
                    }}
                    agencyType={state.agencyType}
                    onChange={(patch) => setNewDetails((current) => ({ ...current, ...patch }))}
                  />

                  <div className="flex gap-2 pt-2 border-t border-white/5">
                    <button 
                      onClick={addPackage} 
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider text-black bg-gradient-to-r from-amber-500 to-yellow-300 hover:brightness-110 transition-all shadow-md shadow-amber-500/10 cursor-pointer"
                    >
                      <Check className="w-4 h-4" /> Adicionar e Sincronizar
                    </button>
                    <button 
                      onClick={() => { setShowAddForm(false); setNewTitle(""); setNewDesc(""); setNewPrice(""); setNewDetails({}); }}
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
                          <PackageAdvancedFields
                            pacote={{
                              id: pkg.id,
                              title: editTitle,
                              description: editDesc,
                              price: editPrice,
                              ...editDetails,
                            }}
                            agencyType={state.agencyType}
                            onChange={(patch) => setEditDetails((current) => ({ ...current, ...patch }))}
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
                          <div className="flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-4">
                            <div className="flex items-start gap-3 flex-1 min-w-0">
                              {/* Package visual asset */}
                              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-white/[0.02] border border-white/10 flex-shrink-0 overflow-hidden relative shadow-inner flex items-center justify-center">
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
                                
                                <span className="inline-flex text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-lg w-fit mt-0.5 max-w-full">
                                  <span className="line-clamp-2">{pkg.price}</span>
                                </span>
                              </div>
                            </div>

                            {/* Action Tools Overlay */}
                            <div className="flex flex-wrap gap-1.5 items-center w-full sm:w-auto justify-end pt-2 sm:pt-0 border-t sm:border-0 border-white/5">
                              {pkg.isDraft ? (
                                <button
                                  onClick={() => togglePublish(pkg.id, true)}
                                  title="Aprovar e Enviar para o Site"
                                  className="h-7 px-2 flex items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400 text-[10px] font-bold hover:bg-emerald-500/30 transition-all cursor-pointer mr-1"
                                >
                                  <Check className="w-3.5 h-3.5 mr-1" /> Aprovar para o Site
                                </button>
                              ) : (
                                <span className="h-7 px-2 flex items-center justify-center rounded-lg bg-white/5 text-white/50 text-[9px] font-bold mr-1 uppercase tracking-wider border border-white/10">
                                  No Site
                                </span>
                              )}
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
                  ⚡ {state.selectedPackages.length} pacote{state.selectedPackages.length !== 1 ? "s" : ""} sincronizado{state.selectedPackages.length !== 1 ? "s" : ""} com seu site Canva Viagem
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
