// E-mail digitado na página inicial: guardado no aparelho e na base de e-mail marketing.
import { supabase } from "@/integrations/supabase/client";

export const LEAD_EMAIL_KEY = "cv:lead-email";

export function readLeadEmail(): string {
  try {
    return localStorage.getItem(LEAD_EMAIL_KEY) || "";
  } catch {
    return "";
  }
}

/** Nunca segura a tela: registra em segundo plano e ignora falhas. */
export function captureLead(email: string, event: "lead" | "step" | "plan", data: Record<string, unknown> = {}) {
  if (!email) return;
  void supabase.functions.invoke("capture-lead", { body: { email, event, ...data } }).catch(() => undefined);
}
