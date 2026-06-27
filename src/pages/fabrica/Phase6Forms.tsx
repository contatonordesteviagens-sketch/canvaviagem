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

export const Phase6Forms = ({ onBack, onNext }: { onBack: () => void; onNext: () => void }) => {
  const { state, update } = useFabricaContext();
  const { user } = useAuth();
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);

  const form = normalizeCrmFormConfig(state.crmForm);
  const embedKey = form.id || state.projectId || user?.id || "FORM_ID";
  const publicOrigin = "https://canvaviagem.com";

  const visibleFields = useMemo(
    () => form.fields.filter((field) => field.visible !== false).sort((a, b) => a.order - b.order),
    [form.fields],
  );

  const embedCode = `<div data-canva-viagem-form="${embedKey}"></div>
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
      const publicForm = normalizeCrmFormConfig({ ...form, id: embedKey });
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
          primaryColor: state.primaryColor,
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
          <div className="text-[10px] font-black uppercase tracking-[0.28em] text-amber-300/80">Formularios</div>
          <h1 className="mt-2 text-2xl font-black tracking-tight text-white sm:text-3xl">Captura de leads para qualquer site</h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/55">
            Edite os campos que aparecem no site da Fabrica e publique o mesmo formulario em WordPress, Wix ou HTML.
          </p>
        </div>
        <button
          onClick={savePublicForm}
          disabled={saving}
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-amber-400 px-5 py-3 text-sm font-black text-zinc-950 transition-transform active:scale-95 disabled:opacity-60"
        >
          {saving ? <Check className="h-4 w-4" /> : <Save className="h-4 w-4" />}
          {saving ? "Salvando..." : "Salvar formulario"}
        </button>
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
            <div className="mt-4 rounded-2xl bg-zinc-100 p-4 text-zinc-950">
              <div className="text-xs font-black uppercase tracking-widest text-zinc-500">Orcamento</div>
              <div className="mt-2 text-xl font-black">Fale com um consultor</div>
              <div className="mt-4 grid grid-cols-1 gap-3">
                {visibleFields.map((field) => (
                  <label key={field.id} className="block">
                    <span className="mb-1.5 block text-[10px] font-black uppercase tracking-widest text-zinc-500">
                      {field.label} {field.required ? "*" : ""}
                    </span>
                    {field.type === "textarea" ? (
                      <textarea disabled placeholder={field.placeholder} className="h-20 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm" />
                    ) : field.type === "select" || field.type === "radio" ? (
                      <select disabled className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm">
                        <option>{field.placeholder || "Selecione..."}</option>
                      </select>
                    ) : (
                      <input disabled type={field.type === "tel" ? "tel" : field.type} placeholder={field.placeholder} className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm" />
                    )}
                  </label>
                ))}
              </div>
              <button className="mt-4 w-full rounded-xl bg-amber-400 px-4 py-3 text-sm font-black text-zinc-950">
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
        <button onClick={onBack} className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-bold text-white/70">
          <ArrowLeft className="h-4 w-4" />
          Voltar ao site
        </button>
        <button onClick={onNext} className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-amber-400 px-4 py-3 text-sm font-black text-zinc-950">
          Ir para o CRM
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};
