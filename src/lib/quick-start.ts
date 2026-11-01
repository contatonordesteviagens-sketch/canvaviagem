// Entrada só com o e-mail: guarda o lead e abre o quiz na hora, sem link nem tela de confirmação.
import { supabase } from "@/integrations/supabase/client";
import { captureLead, LEAD_EMAIL_KEY } from "@/lib/lead-capture";
import { trackMetaEvent } from "@/lib/meta-pixel-sales";

/**
 * session: e-mail novo, já tem conta e sessão (mailer_autoconfirm).
 * existing: já tem conta e recebeu o link; entrar sem ele seria inseguro.
 * fallback: não deu para criar nem mandar o link; a pessoa segue para o quiz sem sessão.
 */
export type QuickStartResult = "session" | "existing" | "fallback";

export async function startWithEmail(email: string, redirect: string | null): Promise<QuickStartResult> {
  const normalizedEmail = email.toLowerCase().trim();
  try { localStorage.setItem(LEAD_EMAIL_KEY, normalizedEmail); } catch { /* storage indisponível */ }
  captureLead(normalizedEmail, "lead");
  trackMetaEvent("Lead", { content_name: "inicio_email", content_category: "email_enviado" });
  const randomBytes = crypto.getRandomValues(new Uint8Array(24));
  const password = Array.from(randomBytes, (b) => b.toString(16).padStart(2, "0")).join("");
  const { data: signUp, error: signUpError } = await supabase.auth
    .signUp({ email: normalizedEmail, password, options: { data: { quick_start: true } } })
    .catch(() => ({ data: { session: null }, error: null }));
  if (signUp?.session) return "session";
  if (signUpError && /already|exists/i.test(`${signUpError.code ?? ""} ${signUpError.message}`)) {
    const { data: linkSent } = await supabase.functions
      .invoke("send-magic-link", { body: { email: normalizedEmail, siteUrl: window.location.origin, redirect } })
      .catch(() => ({ data: null }));
    if (linkSent?.success) return "existing";
  }
  return "fallback";
}
