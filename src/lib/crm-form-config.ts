export type CrmFieldType =
  | "text"
  | "tel"
  | "email"
  | "number"
  | "date"
  | "textarea"
  | "select"
  | "checkbox"
  | "radio";

export type CrmFieldWidth = "half" | "full";

export interface CrmFormField {
  id: string;
  label: string;
  type: CrmFieldType;
  placeholder?: string;
  required: boolean;
  visible: boolean;
  order: number;
  width?: CrmFieldWidth;
  options?: string[];
  crmKey?: string;
}

export interface CrmFormConfig {
  id?: string;
  name: string;
  description?: string;
  buttonLabel: string;
  successMessage: string;
  whatsappRedirect: boolean;
  primaryColor?: string;
  fields: CrmFormField[];
}

export const defaultCrmFormFieldsBR: CrmFormField[] = [
  {
    id: "nome",
    label: "Nome completo",
    type: "text",
    placeholder: "Ex: Maria Silva",
    required: true,
    visible: true,
    order: 1,
    width: "half",
    crmKey: "name",
  },
  {
    id: "wpp",
    label: "WhatsApp",
    type: "tel",
    placeholder: "(00) 00000-0000",
    required: true,
    visible: true,
    order: 2,
    width: "half",
    crmKey: "phone",
  },
  {
    id: "email",
    label: "E-mail",
    type: "email",
    placeholder: "seu@email.com",
    required: true,
    visible: true,
    order: 3,
    width: "full",
    crmKey: "email",
  },
  {
    id: "destino",
    label: "Destino de interesse",
    type: "select",
    placeholder: "Selecione...",
    required: false,
    visible: true,
    order: 4,
    width: "half",
    crmKey: "interest",
  },
  {
    id: "viaj",
    label: "Numero de viajantes",
    type: "number",
    placeholder: "2",
    required: false,
    visible: true,
    order: 5,
    width: "half",
    crmKey: "travelers",
  },
  {
    id: "ida",
    label: "Data de ida",
    type: "date",
    required: false,
    visible: true,
    order: 6,
    width: "half",
    crmKey: "departure_date",
  },
  {
    id: "volta",
    label: "Data de volta",
    type: "date",
    required: false,
    visible: true,
    order: 7,
    width: "half",
    crmKey: "return_date",
  },
  {
    id: "obs",
    label: "Observacoes",
    type: "textarea",
    placeholder: "Preferencias, ocasiao especial, orcamento...",
    required: false,
    visible: true,
    order: 8,
    width: "full",
    crmKey: "notes",
  },
];

export const defaultCrmFormFieldsES: CrmFormField[] = [
  { ...defaultCrmFormFieldsBR[0], label: "Nombre completo", placeholder: "Ej: Maria Silva" },
  { ...defaultCrmFormFieldsBR[1], label: "WhatsApp" },
  { ...defaultCrmFormFieldsBR[2], label: "E-mail", placeholder: "tu@email.com" },
  { ...defaultCrmFormFieldsBR[3], label: "Destino de interes", placeholder: "Selecciona..." },
  { ...defaultCrmFormFieldsBR[4], label: "Numero de viajeros" },
  { ...defaultCrmFormFieldsBR[5], label: "Fecha de ida" },
  { ...defaultCrmFormFieldsBR[6], label: "Fecha de vuelta" },
  { ...defaultCrmFormFieldsBR[7], label: "Observaciones", placeholder: "Preferencias, ocasion especial, presupuesto..." },
];

export const createDefaultCrmFormConfig = (locale: "pt-BR" | "es" = "pt-BR"): CrmFormConfig => {
  const isEs = locale === "es";
  return {
    name: isEs ? "Formulario principal" : "Formulario principal",
    description: isEs
      ? "Captura solicitudes de viaje y envia los datos al CRM."
      : "Captura pedidos de viagem e envia os dados ao CRM.",
    buttonLabel: isEs ? "Enviar por WhatsApp" : "Enviar pelo WhatsApp",
    successMessage: isEs
      ? "Solicitud recibida. Nuestro equipo se pondra en contacto pronto."
      : "Solicitacao recebida. Nossa equipe vai entrar em contato em breve.",
    whatsappRedirect: true,
    primaryColor: "#F59E0B",
    fields: isEs ? defaultCrmFormFieldsES : defaultCrmFormFieldsBR,
  };
};

export const normalizeCrmFormConfig = (
  value?: Partial<CrmFormConfig> | null,
  locale: "pt-BR" | "es" = "pt-BR",
): CrmFormConfig => {
  const base = createDefaultCrmFormConfig(locale);
  const fields = Array.isArray(value?.fields) && value.fields.length > 0 ? value.fields : base.fields;

  return {
    ...base,
    ...(value || {}),
    fields: fields
      .map((field, index) => ({
        ...field,
        id: field.id || `campo_${index + 1}`,
        label: field.label || `Campo ${index + 1}`,
        type: field.type || "text",
        required: Boolean(field.required),
        visible: field.visible !== false,
        order: Number.isFinite(field.order) ? field.order : index + 1,
        width: field.width || (field.type === "textarea" ? "full" : "half"),
        crmKey: field.crmKey || field.id || `field_${index + 1}`,
      }))
      .sort((a, b) => a.order - b.order),
  };
};

export const crmFieldTypeLabels: Record<CrmFieldType, string> = {
  text: "Texto",
  tel: "Telefone",
  email: "E-mail",
  number: "Numero",
  date: "Data",
  textarea: "Texto longo",
  select: "Lista",
  checkbox: "Checkbox",
  radio: "Escolha unica",
};

export const createCrmField = (order: number): CrmFormField => ({
  id: `campo_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`,
  label: "Novo campo",
  type: "text",
  placeholder: "",
  required: false,
  visible: true,
  order,
  width: "full",
  crmKey: "custom",
});
