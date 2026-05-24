/**
 * COUNTRIES_DIAL — lista de países com DDI, flag emoji e formatação de máscara.
 * Usado pelo PhoneFieldWithDialCode (FabricaDashboard, Phase1, etc.)
 * Brasil sempre é o primeiro (padrão).
 */
export interface CountryDial {
  code: string;   // ISO 3166-1 alpha-2
  flag: string;   // emoji de bandeira
  name: string;   // nome em português
  dial: string;   // +55, +1, etc.
  dialRaw: string;  // somente dígitos: "55", "1", "351", etc.
  maxDigits: number; // max dígitos do número nacional (sem DDI)
  format: (v: string) => string; // máscara de exibição
}

function brMask(v: string): string {
  const d = v.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 2) return d.length ? `(${d}` : "";
  if (d.length <= 7) return `(${d.slice(0,2)}) ${d.slice(2)}`;
  return `(${d.slice(0,2)}) ${d.slice(2,7)}-${d.slice(7)}`;
}

function defaultMask(v: string): string {
  return v.replace(/\D/g, "");
}

export const COUNTRIES_DIAL: CountryDial[] = [
  { code: "BR", flag: "🇧🇷", name: "Brasil",          dial: "+55",  dialRaw: "55",  maxDigits: 11, format: brMask },
  { code: "US", flag: "🇺🇸", name: "Estados Unidos",   dial: "+1",   dialRaw: "1",   maxDigits: 10, format: defaultMask },
  { code: "PT", flag: "🇵🇹", name: "Portugal",         dial: "+351", dialRaw: "351", maxDigits: 9,  format: defaultMask },
  { code: "ES", flag: "🇪🇸", name: "Espanha",          dial: "+34",  dialRaw: "34",  maxDigits: 9,  format: defaultMask },
  { code: "AR", flag: "🇦🇷", name: "Argentina",        dial: "+54",  dialRaw: "54",  maxDigits: 10, format: defaultMask },
  { code: "MX", flag: "🇲🇽", name: "México",           dial: "+52",  dialRaw: "52",  maxDigits: 10, format: defaultMask },
  { code: "CO", flag: "🇨🇴", name: "Colômbia",         dial: "+57",  dialRaw: "57",  maxDigits: 10, format: defaultMask },
  { code: "CL", flag: "🇨🇱", name: "Chile",            dial: "+56",  dialRaw: "56",  maxDigits: 9,  format: defaultMask },
  { code: "PE", flag: "🇵🇪", name: "Peru",             dial: "+51",  dialRaw: "51",  maxDigits: 9,  format: defaultMask },
  { code: "UY", flag: "🇺🇾", name: "Uruguai",          dial: "+598", dialRaw: "598", maxDigits: 8,  format: defaultMask },
  { code: "PY", flag: "🇵🇾", name: "Paraguai",         dial: "+595", dialRaw: "595", maxDigits: 9,  format: defaultMask },
  { code: "BO", flag: "🇧🇴", name: "Bolívia",          dial: "+591", dialRaw: "591", maxDigits: 8,  format: defaultMask },
  { code: "VE", flag: "🇻🇪", name: "Venezuela",        dial: "+58",  dialRaw: "58",  maxDigits: 10, format: defaultMask },
  { code: "EC", flag: "🇪🇨", name: "Equador",          dial: "+593", dialRaw: "593", maxDigits: 9,  format: defaultMask },
  { code: "FR", flag: "🇫🇷", name: "França",           dial: "+33",  dialRaw: "33",  maxDigits: 9,  format: defaultMask },
  { code: "DE", flag: "🇩🇪", name: "Alemanha",         dial: "+49",  dialRaw: "49",  maxDigits: 11, format: defaultMask },
  { code: "IT", flag: "🇮🇹", name: "Itália",           dial: "+39",  dialRaw: "39",  maxDigits: 10, format: defaultMask },
  { code: "GB", flag: "🇬🇧", name: "Reino Unido",      dial: "+44",  dialRaw: "44",  maxDigits: 10, format: defaultMask },
  { code: "CA", flag: "🇨🇦", name: "Canadá",           dial: "+1",   dialRaw: "1",   maxDigits: 10, format: defaultMask },
  { code: "AU", flag: "🇦🇺", name: "Austrália",        dial: "+61",  dialRaw: "61",  maxDigits: 9,  format: defaultMask },
  { code: "JP", flag: "🇯🇵", name: "Japão",            dial: "+81",  dialRaw: "81",  maxDigits: 10, format: defaultMask },
  { code: "AE", flag: "🇦🇪", name: "Emirados Árabes",  dial: "+971", dialRaw: "971", maxDigits: 9,  format: defaultMask },
];

/**
 * Constrói o número completo para wa.me a partir de dialRaw + número nacional.
 * Remove todos os não-dígitos e concatena DDI + número.
 */
export function buildWhatsAppNumber(dialRaw: string, nationalNumber: string): string {
  const digits = nationalNumber.replace(/\D/g, "");
  return `${dialRaw}${digits}`;
}
