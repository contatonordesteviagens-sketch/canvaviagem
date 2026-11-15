import { getMarketingAttribution } from "@/hooks/useTrackUtm";
import { rastreamentoPermitido } from "@/lib/rastreamento-consentimento";

const readCookie = (name: string) => {
  const hit = document.cookie.split("; ").find((c) => c.startsWith(`${name}=`));
  return hit ? decodeURIComponent(hit.slice(name.length + 1)) : undefined;
};

/** Cookies da Meta e UTMs da visita, enviados ao criar a cobrança para a Conversions API casar a compra. */
export function getMetaMatchData(): Record<string, string> {
  const out: Record<string, string> = {};
  try {
    if (rastreamentoPermitido()) {
      const fbp = readCookie("_fbp");
      const fbc = readCookie("_fbc");
      if (fbp) out.fbp = fbp;
      if (fbc) out.fbc = fbc;
    }
    const a = getMarketingAttribution();
    for (const k of ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"] as const) {
      const v = a?.[k];
      if (v) out[k] = String(v).slice(0, 200);
    }
  } catch { /* sem cookies/storage */ }
  return out;
}
