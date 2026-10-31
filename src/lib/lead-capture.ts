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
  void (async () => {
    const { error } = await supabase.functions.invoke("capture-lead", { body: { email, event, ...data } });
    if (!error || event !== "lead") return;
    // Plano B para não perder o lead se capture-lead estiver fora do ar: a função do link também guarda
    // o e-mail (com redirect /onboarding, que a automação reconhece). A pessoa recebe um link de acesso.
    await supabase.functions.invoke("send-magic-link", {
      body: { email, name: null, phone: null, siteUrl: window.location.origin, redirect: "/onboarding" },
    });
  })().catch(() => undefined);
}
