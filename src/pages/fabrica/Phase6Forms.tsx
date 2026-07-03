import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  Check,
  Code2,
  Copy,
  Eye,
  EyeOff,
  Plus,
  Save,
  Sparkles,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useFabricaContext } from "@/hooks/useFabricaContext";
import {
  createCrmField,
  crmFieldTypeLabels,
  normalizeCrmFormConfig,
  type CrmFieldType,
  type CrmFormField,
} from "@/lib/crm-form-config";

const fieldTypes = Object.keys(crmFieldTypeLabels) as CrmFieldType[];
const colorPresets = ["#F59E0B", "#2563EB", "#10B981", "#EC4899", "#7C3AED", "#0F172A"];

const encodeEmbedConfig = (value: unknown) => {
  try {
    return window.btoa(unescape(encodeURIComponent(JSON.stringify(value))));
  } catch {
    return "";
  }
};

const FieldInput = ({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) => (
  <label className="block space-y-1.5">
    <span className="text-[10px] font-black uppercase tracking-widest text-white/35">{label}</span>
    <input
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2.5 text-sm text-white outline-none transition-colors placeholder:text-white/25 focus:border-amber-400/60"
    />
  </label>
);

const FieldSelect = ({
  label,
  value,
  onChange,
  children,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  children: ReactNode;
}) => (
  <label className="block space-y-1.5">
    <span className="text-[10px] font-black uppercase tracking-widest text-white/35">{label}</span>
    <select
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="w-full rounded-xl border border-white/10 bg-zinc-950 px-3 py-2.5 text-sm text-white outline-none transition-colors focus:border-amber-400/60"
    >
      {children}
    </select>
  </label>
);

const ColorInput = ({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) => (
  <label className="block space-y-1.5">
    <span className="text-[10px] font-black uppercase tracking-widest text-white/35">{label}</span>
    <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] p-2">
      <input
        type="color"
        value={/^#[0-9a-fA-F]{6}$/.test(value) ? value : "#000000"}
        onChange={(event) => onChange(event.target.value)}
        className="h-10 w-12 cursor-pointer rounded-lg border-0 bg-transparent p-0"
      />
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="min-w-0 flex-1 bg-transparent px-1 text-sm font-bold uppercase text-white outline-none"
      />
    </div>
  </label>
);

export const Phase6Forms = ({ onBack, onNext }: { onBack: () => void; onNext: () => void }) => {
  const { state, update } = useFabricaContext();
  const { user, isAdmin } = useAuth();
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!isAdmin) {
    return (
      <div className="mx-auto max-w-4xl py-16 text-center animate-in fade-in duration-300">
        <div className="rounded-3xl border border-amber-500/20 bg-gradient-to-br from-amber-500/10 via-black/40 to-black/60 p-8 shadow-[0_0_30px_rgba(245,158,11,0.08)] backdrop-blur-xl">
          <div className="w-14 h-14 rounded-2xl bg-amber-400/20 text-amber-300 border border-amber-400/30 flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
            🔒
          </div>
          <h2 className="text-xl font-black text-white mb-2">Módulo Exclusivo para Administradores</h2>
          <p className="text-sm text-white/60 max-w-md mx-auto mb-6">
            A configuração avançada de formulários e geração de embeds externos está disponível exclusivamente para a administração do sistema.
          </p>
          {onBack && (
            <button
              onClick={onBack}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold text-sm transition-all"
            >
              <ArrowLeft className="w-4 h-4" /> Voltar ao CRM
            </button>
          )}
        </div>
      </div>
    );
  }

  const form = normalizeCrmFormConfig(state.crmForm);
  const embedKey = form.id || state.projectId || user?.id || "FORM_ID";
  const embedOwnerId = user?.id || "";
  const publicOrigin = "https://canvaviagem.com";
  const formTheme = {
    primaryColor: form.primaryColor || state.primaryColor || "#F59E0B",
    backgroundColor: form.backgroundColor || "#F8FAFC",
    textColor: form.textColor || "#0F172A",
    fieldBackgroundColor: form.fieldBackgroundColor || "#FFFFFF",
    fieldTextColor: form.fieldTextColor || "#0F172A",
    fieldBorderColor: form.fieldBorderColor || "#E2E8F0",
    buttonTextColor: form.buttonTextColor || "#111827",
  };

  const visibleFields = useMemo(
    () => form.fields.filter((field) => field.visible !== false).sort((a, b) => a.order - b.order),
    [form.fields],
  );

  const embedConfig = encodeEmbedConfig({
    id: embedKey,
    embed_key: embedKey,
    owner_id: embedOwnerId,
    name: form.name,
    description: form.description,
    fields: form.fields,
    settings: {
      buttonLabel: form.buttonLabel,
      successMessage: form.successMessage,
      ...formTheme,
      whatsappRedirect: form.whatsappRedirect,
      whatsapp: state.whatsapp,
      whatsappDialCode: state.whatsappDialCode,
    },
  });

  const embedCode = `<div data-canva-viagem-form="${embedKey}" data-canva-viagem-owner="${embedOwnerId}" data-canva-viagem-config="${embedConfig}"></div>
<script async src="${publicOrigin}/embed/form.js"></script>`;

  const setForm = (patch: Partial<typeof form>) => {
    update({
      crmForm: normalizeCrmFormConfig({
        ...form,
        ...patch,
        id: embedKey,
      }),
    });
  };

  const updateField = (fieldId: string, patch: Partial<CrmFormField>) => {
    setForm({
      fields: form.fields.map((field) => (field.id === fieldId ? { ...field, ...patch } : field)),
    });
  };

  const moveField = (fieldId: string, direction: -1 | 1) => {
    const sorted = [...form.fields].sort((a, b) => a.order - b.order);
    const index = sorted.findIndex((field) => field.id === fieldId);
    const target = index + direction;
    if (index < 0 || target < 0 || target >= sorted.length) return;
    const next = [...sorted];
    const currentOrder = next[index].order;
    next[index] = { ...next[index], order: next[target].order };
    next[target] = { ...next[target], order: currentOrder };
    setForm({ fields: next });
  };

  const addField = () => {
    const maxOrder = Math.max(0, ...form.fields.map((field) => field.order || 0));
    setForm({ fields: [...form.fields, createCrmField(maxOrder + 1)] });
  };

  const removeField = (fieldId: string) => {
    setForm({ fields: form.fields.filter((field) => field.id !== fieldId) });
  };

  const savePublicForm = async () => {
    if (!user?.id) {
      toast.error("Faca login para salvar o formulario.");
      return;
    }

    setSaving(true);
    try {
      const publicForm = normalizeCrmFormConfig({ ...form, ...formTheme, id: embedKey });
      update({ crmForm: publicForm });

      const { error } = await (supabase as any).from("crm_forms").upsert({
        id: embedKey,
        owner_id: user.id,
        name: publicForm.name,
        description: publicForm.description || null,
        fields: publicForm.fields,
        settings: {
          buttonLabel: publicForm.buttonLabel,
          successMessage: publicForm.successMessage,
          whatsappRedirect: publicForm.whatsappRedirect,
          agencyName: state.agencyName,
          primaryColor: publicForm.primaryColor || state.primaryColor,
          backgroundColor: publicForm.backgroundColor,
          textColor: publicForm.textColor,
          fieldBackgroundColor: publicForm.fieldBackgroundColor,
          fieldTextColor: publicForm.fieldTextColor,
          fieldBorderColor: publicForm.fieldBorderColor,
          buttonTextColor: publicForm.buttonTextColor,
          whatsapp: state.whatsapp,
          whatsappDialCode: state.whatsappDialCode,
        },
        embed_key: embedKey,
        status: "active",
        updated_at: new Date().toISOString(),
      });

      if (error) throw error;
      toast.success("Formulario salvo e pronto para o site externo.");
    } catch (error: any) {
      console.warn("Falha ao publicar formulario publico:", error);
      toast.warning("Formulario salvo na Fabrica. A publicacao externa depende da migration no Supabase.");
    } finally {
      setSaving(false);
    }
  };

  const copyEmbed = async () => {
    try {
      await navigator.clipboard.writeText(embedCode);
      setCopied(true);
      toast.success("Codigo copiado.");
      setTimeout(() => setCopied(false), 2200);
    } catch {
      toast.error("Nao foi possivel copiar automaticamente.");
    }
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col gap-4 rounded-3xl border border-white/10 bg-white/[0.03] p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="text-[10px] font-black uppercase tracking-[0.28em] text-amber-300/80">Fase 4 • Formulários Avançados & Embeds</div>
          <h1 className="mt-2 text-2xl font-black tracking-tight text-white sm:text-3xl">Personalização de Captura & Integração Externa</h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/55">
            Diferente do seu Site principal (F2), aqui você configura as perguntas estratégicas de qualificação ou gera o código para embutir este formulário em páginas externas (WordPress, Wix, Framer, etc.).
          </p>
        </div>
        <button
          onClick={savePublicForm}
          disabled={saving}
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-amber-400 px-5 py-3 text-sm font-black text-zinc-950 transition-transform active:scale-95 disabled:opacity-60 shadow-[0_0_20px_rgba(245,158,11,0.2)] hover:bg-amber-300"
        >
          {saving ? <Check className="h-4 w-4" /> : <Save className="h-4 w-4" />}
          {saving ? "Salvando..." : "Salvar formulário"}
        </button>
      </div>

      {/* Box Didático Explicativo - Jornada do Lead na Agência */}
      <div className="rounded-3xl border border-amber-500/30 bg-gradient-to-br from-amber-500/10 via-black/40 to-black/60 p-6 shadow-[0_0_30px_rgba(245,158,11,0.08)] backdrop-blur-xl">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-white/10 pb-4 mb-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-400/20 text-amber-300 border border-amber-400/30">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-white flex items-center gap-2">
                Como Funciona a Jornada do Lead no Canva Viagem?
                <span className="rounded-full bg-amber-400/20 px-2.5 py-0.5 text-[10px] font-extrabold text-amber-300 border border-amber-400/30">Guia Didático</span>
              </h3>
              <p className="text-xs text-white/60">Entenda a ordem lógica das etapas do seu ecossistema digital e o papel deste módulo:</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Passo 1 */}
          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4 relative overflow-hidden group hover:border-white/20 transition-all">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">Etapa 1 • F2</span>
              <span className="text-xs font-bold text-white/30">Site</span>
            </div>
            <h4 className="text-sm font-black text-white mb-1 flex items-center gap-1.5">🌐 1. Site da Agência</h4>
            <p className="text-[11px] leading-relaxed text-white/60">
              Sua página principal de alta conversão. É o destino para onde você direciona seus anúncios e clientes.
            </p>
          </div>

          {/* Passo 2 */}
          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4 relative overflow-hidden group hover:border-white/20 transition-all">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded bg-violet-500/20 text-violet-300 border border-violet-500/30">Etapa 2 • F3</span>
              <span className="text-xs font-bold text-white/30">CRM</span>
            </div>
            <h4 className="text-sm font-black text-white mb-1 flex items-center gap-1.5">👥 2. CRM & Gestão</h4>
            <p className="text-[11px] leading-relaxed text-white/60">
              O painel onde chegam os contatos capturados. É aqui que você gerencia seus leads, faz atendimentos e fecha vendas.
            </p>
          </div>

          {/* Passo 3 - EM DESTAQUE */}
          <div className="rounded-2xl border-2 border-amber-400/60 bg-amber-400/[0.08] p-4 relative overflow-hidden shadow-[0_0_20px_rgba(245,158,11,0.15)]">
            <div className="absolute -right-6 -top-6 h-16 w-16 rounded-full bg-amber-400/10 blur-xl"></div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded bg-amber-400 text-zinc-950 font-extrabold shadow-sm animate-pulse">Etapa 3 • F4 (Aqui!)</span>
              <span className="text-xs font-bold text-amber-300">Formulários</span>
            </div>
            <h4 className="text-sm font-black text-amber-300 mb-1 flex items-center gap-1.5">📝 3. Formulários & Embeds</h4>
            <p className="text-[11px] leading-relaxed text-amber-100/80">
              Ferramenta avançada para personalizar as perguntas de qualificação ou levar seu formulário para sites externos (WordPress/Wix).
            </p>
          </div>

          {/* Passo 4 */}
          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4 relative overflow-hidden group hover:border-white/20 transition-all">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">Etapa 4 • F5/F6</span>
              <span className="text-xs font-bold text-white/30">Estratégia</span>
            </div>
            <h4 className="text-sm font-black text-white mb-1 flex items-center gap-1.5">⚡ 4. Checkup & Plano</h4>
            <p className="text-[11px] leading-relaxed text-white/60">
              O diagnóstico digital da agência e o planejamento estratégico de metas e crescimento contínuo de faturamento.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
        <div className="space-y-5">
          <section className="rounded-3xl border border-white/10 bg-zinc-950/60 p-5">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FieldInput label="Nome interno" value={form.name} onChange={(value) => setForm({ name: value })} />
              <FieldInput label="Texto do botao" value={form.buttonLabel} onChange={(value) => setForm({ buttonLabel: value })} />
              <div className="md:col-span-2">
                <FieldInput
                  label="Mensagem de sucesso"
                  value={form.successMessage}
                  onChange={(value) => setForm({ successMessage: value })}
                />
              </div>
            </div>
            <label className="mt-4 flex cursor-pointer items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
              <span>
                <span className="block text-sm font-bold text-white">Redirecionar para WhatsApp apos envio</span>
                <span className="mt-1 block text-xs leading-relaxed text-white/45">Desligue para apenas salvar no CRM e mostrar a mensagem de sucesso.</span>
              </span>
              <input
                type="checkbox"
                checked={form.whatsappRedirect}
                onChange={(event) => setForm({ whatsappRedirect: event.target.checked })}
                className="h-5 w-5 accent-amber-400"
              />
            </label>
          </section>

          <section className="rounded-3xl border border-white/10 bg-zinc-950/60 p-5">
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h2 className="text-lg font-black text-white">Aparencia do formulario</h2>
                <p className="mt-1 text-xs leading-relaxed text-white/45">
                  Por padrao usa a cor da agencia. Para embeds externos, personalize o fundo, letras, campos e botao.
                </p>
              </div>
              <button
                onClick={() =>
                  setForm({
                    primaryColor: state.primaryColor || "#F59E0B",
                    backgroundColor: "#F8FAFC",
                    textColor: "#0F172A",
                    fieldBackgroundColor: "#FFFFFF",
                    fieldTextColor: "#0F172A",
                    fieldBorderColor: "#E2E8F0",
                    buttonTextColor: "#111827",
                  })
                }
                className="rounded-xl border border-white/10 bg-white/[0.06] px-3 py-2 text-xs font-bold text-white/70 transition-colors hover:bg-white/[0.1] hover:text-white"
              >
                Sincronizar com o site
              </button>
            </div>
            <div className="mb-4 flex flex-wrap gap-2">
              {colorPresets.map((color) => (
                <button
                  key={color}
                  onClick={() => setForm({ primaryColor: color })}
                  className="h-9 w-9 rounded-full border border-white/20 ring-offset-2 ring-offset-zinc-950 transition-transform hover:scale-105"
                  style={{ backgroundColor: color, boxShadow: formTheme.primaryColor === color ? "0 0 0 2px rgba(255,255,255,.9)" : undefined }}
                  title={color}
                />
              ))}
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <ColorInput label="Cor principal" value={formTheme.primaryColor} onChange={(value) => setForm({ primaryColor: value })} />
              <ColorInput label="Fundo" value={formTheme.backgroundColor} onChange={(value) => setForm({ backgroundColor: value })} />
              <ColorInput label="Texto" value={formTheme.textColor} onChange={(value) => setForm({ textColor: value })} />
              <ColorInput label="Fundo dos campos" value={formTheme.fieldBackgroundColor} onChange={(value) => setForm({ fieldBackgroundColor: value })} />
              <ColorInput label="Texto dos campos" value={formTheme.fieldTextColor} onChange={(value) => setForm({ fieldTextColor: value })} />
              <ColorInput label="Borda dos campos" value={formTheme.fieldBorderColor} onChange={(value) => setForm({ fieldBorderColor: value })} />
              <ColorInput label="Texto do botao" value={formTheme.buttonTextColor} onChange={(value) => setForm({ buttonTextColor: value })} />
            </div>
          </section>

          <section className="rounded-3xl border border-white/10 bg-zinc-950/60 p-5">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-black text-white">Campos do formulario</h2>
                <p className="mt-1 text-xs text-white/45">Reordene, oculte, renomeie ou adicione perguntas para qualificar melhor cada lead.</p>
              </div>
              <button
                onClick={addField}
                className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.06] px-3 py-2 text-xs font-bold text-white transition-colors hover:bg-white/[0.1]"
              >
                <Plus className="h-4 w-4" />
                Campo
              </button>
            </div>

            <div className="space-y-3">
              {[...form.fields].sort((a, b) => a.order - b.order).map((field) => (
                <div key={field.id} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="truncate text-sm font-black text-white">{field.label || "Campo sem nome"}</div>
                      <div className="mt-1 text-[10px] font-bold uppercase tracking-widest text-white/30">{crmFieldTypeLabels[field.type]}</div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button onClick={() => moveField(field.id, -1)} className="rounded-lg p-2 text-white/45 hover:bg-white/10 hover:text-white">
                        <ArrowUp className="h-4 w-4" />
                      </button>
                      <button onClick={() => moveField(field.id, 1)} className="rounded-lg p-2 text-white/45 hover:bg-white/10 hover:text-white">
                        <ArrowDown className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => updateField(field.id, { visible: !field.visible })}
                        className="rounded-lg p-2 text-white/45 hover:bg-white/10 hover:text-white"
                      >
                        {field.visible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                      </button>
                      <button onClick={() => removeField(field.id)} className="rounded-lg p-2 text-red-300/70 hover:bg-red-500/10 hover:text-red-200">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                    <FieldInput label="Rotulo" value={field.label} onChange={(value) => updateField(field.id, { label: value })} />
                    <FieldInput label="Placeholder" value={field.placeholder || ""} onChange={(value) => updateField(field.id, { placeholder: value })} />
                    <FieldSelect label="Tipo" value={field.type} onChange={(value) => updateField(field.id, { type: value as CrmFieldType })}>
                      {fieldTypes.map((type) => (
                        <option key={type} value={type}>
                          {crmFieldTypeLabels[type]}
                        </option>
                      ))}
                    </FieldSelect>
                    <FieldSelect label="Largura" value={field.width || "full"} onChange={(value) => updateField(field.id, { width: value as any })}>
                      <option value="full">Linha inteira</option>
                      <option value="half">Meia linha</option>
                    </FieldSelect>
                    {(field.type === "select" || field.type === "radio") && (
                      <div className="md:col-span-2">
                        <FieldInput
                          label="Opcoes, separadas por virgula"
                          value={(field.options || []).join(", ")}
                          onChange={(value) =>
                            updateField(field.id, {
                              options: value
                                .split(",")
                                .map((item) => item.trim())
                                .filter(Boolean),
                            })
                          }
                        />
                      </div>
                    )}
                  </div>

                  <div className="mt-3 flex flex-wrap gap-3">
                    <label className="inline-flex items-center gap-2 text-xs font-bold text-white/60">
                      <input
                        type="checkbox"
                        checked={field.required}
                        onChange={(event) => updateField(field.id, { required: event.target.checked })}
                        className="h-4 w-4 accent-amber-400"
                      />
                      Obrigatorio
                    </label>
                    <label className="inline-flex items-center gap-2 text-xs font-bold text-white/60">
                      <input
                        type="checkbox"
                        checked={field.visible !== false}
                        onChange={(event) => updateField(field.id, { visible: event.target.checked })}
                        className="h-4 w-4 accent-amber-400"
                      />
                      Visivel
                    </label>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        <aside className="space-y-5">
          <section className="rounded-3xl border border-white/10 bg-zinc-950/70 p-5">
            <h2 className="text-lg font-black text-white">Previa</h2>
            <div
              className="mt-4 rounded-[28px] border p-5 shadow-[0_18px_45px_rgba(15,23,42,.12)]"
              style={{
                backgroundColor: formTheme.backgroundColor,
                color: formTheme.textColor,
                borderColor: formTheme.fieldBorderColor,
              }}
            >
              <div className="text-xs font-black uppercase tracking-widest opacity-55">Orcamento</div>
              <div className="mt-2 text-xl font-black">Fale com um consultor</div>
              <div className="mt-4 grid grid-cols-1 gap-3">
                {visibleFields.map((field) => (
                  <label key={field.id} className="block">
                    <span className="mb-1.5 block text-[10px] font-black uppercase tracking-widest opacity-55">
                      {field.label} {field.required ? "*" : ""}
                    </span>
                    {field.type === "checkbox" ? (
                      <div
                        className="flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm font-bold"
                        style={{ backgroundColor: formTheme.fieldBackgroundColor, borderColor: formTheme.fieldBorderColor, color: formTheme.fieldTextColor }}
                      >
                        <span className="h-5 w-5 rounded-md border" style={{ borderColor: formTheme.primaryColor }} />
                        {field.placeholder || "Sim"}
                      </div>
                    ) : field.type === "textarea" ? (
                      <textarea
                        disabled
                        placeholder={field.placeholder}
                        className="h-20 w-full rounded-2xl border px-4 py-3 text-sm"
                        style={{ backgroundColor: formTheme.fieldBackgroundColor, borderColor: formTheme.fieldBorderColor, color: formTheme.fieldTextColor }}
                      />
                    ) : field.type === "select" || field.type === "radio" ? (
                      <select
                        disabled
                        className="w-full rounded-2xl border px-4 py-3 text-sm"
                        style={{ backgroundColor: formTheme.fieldBackgroundColor, borderColor: formTheme.fieldBorderColor, color: formTheme.fieldTextColor }}
                      >
                        <option>{field.placeholder || "Selecione..."}</option>
                      </select>
                    ) : (
                      <input
                        disabled
                        type={field.type === "tel" ? "tel" : field.type}
                        placeholder={field.placeholder}
                        className="w-full rounded-2xl border px-4 py-3 text-sm"
                        style={{ backgroundColor: formTheme.fieldBackgroundColor, borderColor: formTheme.fieldBorderColor, color: formTheme.fieldTextColor }}
                      />
                    )}
                  </label>
                ))}
              </div>
              <button
                className="mt-4 w-full rounded-2xl px-4 py-3.5 text-sm font-black shadow-[0_14px_30px_rgba(15,23,42,.16)]"
                style={{ backgroundColor: formTheme.primaryColor, color: formTheme.buttonTextColor }}
              >
                {form.buttonLabel}
              </button>
            </div>
          </section>

          <section className="rounded-3xl border border-white/10 bg-zinc-950/70 p-5">
            <div className="flex items-center gap-2 text-white">
              <Code2 className="h-5 w-5 text-amber-300" />
              <h2 className="text-lg font-black">Codigo externo</h2>
            </div>
            <p className="mt-2 text-xs leading-relaxed text-white/45">
              Cole este bloco no WordPress, Wix, Framer ou HTML. Os envios entram no CRM desta conta.
            </p>
            <pre className="mt-4 max-h-44 overflow-auto rounded-2xl border border-white/10 bg-black/50 p-4 text-[11px] leading-relaxed text-amber-50/80">
              {embedCode}
            </pre>
            <button
              onClick={copyEmbed}
              className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.06] px-4 py-3 text-sm font-black text-white transition-colors hover:bg-white/[0.1]"
            >
              {copied ? <Check className="h-4 w-4 text-emerald-300" /> : <Copy className="h-4 w-4" />}
              {copied ? "Copiado" : "Copiar codigo"}
            </button>
          </section>
        </aside>
      </div>

      <div className="flex flex-col gap-3 rounded-3xl border border-white/10 bg-black/30 p-3 sm:flex-row">
        <button onClick={onBack} className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-bold text-white/70 hover:bg-white/[0.08] transition-colors">
          <ArrowLeft className="h-4 w-4" />
          Voltar: CRM (F3)
        </button>
        <button onClick={onNext} className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-amber-400 px-4 py-3 text-sm font-black text-zinc-950 hover:bg-amber-300 transition-colors shadow-[0_0_20px_rgba(245,158,11,0.3)]">
          Avançar: Checkup (F5)
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};
