// Utilitário compartilhado para e-mails transacionais de boas-vindas e magic link.
// Usado tanto pelo webhook do Stripe quanto pelo webhook da Hotmart, garantindo
// que o disparo do Resend permaneça consistente independente do gateway.

import { isEliteProduct } from "./planAccess.ts";

export type PlanLevel = "Elite" | "Start";

export function resolvePlanFromProductId(productId?: string | null): PlanLevel {
  if (isEliteProduct(productId)) return "Elite";
  return "Start";
}

function redactEmail(email?: string | null): string {
  if (!email) return "(no-email)";
  const [user, domain] = email.split("@");
  return `${user.slice(0, 2)}***@${domain ?? "?"}`;
}

const FROM = () =>
  Deno.env.get("RESEND_FROM_EMAIL") ||
  "Canva Viagem <lucas@rochadigitalmidia.com.br>";

/**
 * Envia o e-mail de "magic link" com o link de acesso de 24h.
 * Agnóstico ao gateway de pagamento.
 */
export async function sendAutoMagicLinkEmail(
  supabase: any,
  resend: any,
  email: string,
  magicLink: string,
  token: string,
  customerName: string,
) {
  if (!resend) return;
  try {
    const emailResponse = await resend.emails.send({
      from: FROM(),
      to: [email],
      subject: "🔐 Seu Link de Acesso - Canva Viagem",
      html: `
        <!DOCTYPE html>
        <html lang="pt-BR">
        <head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Seu Link de Acesso</title></head>
        <body style="margin:0;padding:0;font-family:sans-serif;background:#667eea;">
          <div style="background:white;max-width:600px;margin:40px auto;padding:24px;text-align:center;border-radius:12px;">
            <h1>Olá, ${customerName}!</h1>
            <p>Seu pagamento foi confirmado! Clique abaixo para acessar:</p>
            <a href="${magicLink}" style="background:#667eea;color:white;padding:15px 30px;text-decoration:none;border-radius:6px;display:inline-block;font-weight:bold">Acessar Minha Conta</a>
            <p style="margin-top:20px;font-size:12px;color:#888;">Link expira em 24 horas.</p>
          </div>
        </body>
        </html>
      `,
    });

    if (emailResponse?.error) {
      console.log("[WELCOME-UTIL] ERROR magic link", { email: redactEmail(email), error: emailResponse.error });
      await supabase.from("email_events").insert({
        email_id: token,
        type: "failed",
        email_type: "magic_link_auto",
        recipient_email: email,
        metadata: { token_id: token, provider_error: emailResponse.error },
      });
      return;
    }

    await supabase.from("email_events").insert({
      email_id: emailResponse?.data?.id || token,
      type: "sent",
      email_type: "magic_link_auto",
      recipient_email: email,
      metadata: { token_id: token },
    });
    console.log("[WELCOME-UTIL] Magic link enviado", { email: redactEmail(email) });
  } catch (e: any) {
    console.log("[WELCOME-UTIL] EXC magic link", { error: e.message });
  }
}

/**
 * Envia o e-mail de boas-vindas com diferenciação Elite vs Start.
 * `productId` é opcional — se vier nulo, trata como Start.
 */
export async function sendWelcomeEmail(
  supabase: any,
  resend: any,
  email: string,
  productId?: string | null,
  gateway: "stripe" | "hotmart" = "stripe",
) {
  if (!resend) return;
  const appUrl = Deno.env.get("APP_URL") || "https://canvaviagem.com";
  const plan = resolvePlanFromProductId(productId ?? null);
  const isElite = plan === "Elite";
  const planName = isElite ? "Plano Elite 👑" : "Plano Start";
  const ctaUrl = isElite ? `${appUrl}/fabrica` : `${appUrl}/`;
  const ctaLabel = isElite ? "🚀 Acessar a Fábrica" : "🌴 Acessar meu Painel";
  const eliteExtras = isElite
    ? `<li><strong>🏭 Fábrica de Anúncios IA</strong> (exclusivo Elite)</li>
       <li><strong>🌐 Criador de Sites de Viagem</strong> (exclusivo Elite)</li>`
    : `<li>Vídeos Reels Virais</li>
       <li>Robôs de IA</li>
       <li>Templates Editáveis</li>`;

  try {
    const emailResponse = await resend.emails.send({
      from: FROM(),
      to: [email],
      subject: `🚀 Bem-vindo ao Canva Viagem — ${planName}`,
      html: `
        <!DOCTYPE html>
        <html><body>
          <div style="font-family:sans-serif;max-width:600px;margin:auto;padding:20px;">
             <h1>Bem-vindo ao Canva Viagem! 🌴</h1>
             <p>Sua assinatura do <strong>${planName}</strong> está ativa.</p>
             <p>Você agora tem acesso a:</p>
             <ul>${eliteExtras}</ul>
             <p style="margin-top:24px"><a href="${ctaUrl}" style="background:#0ea5e9;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold">${ctaLabel}</a></p>
             <p style="margin-top:20px;font-size:11px;color:#888;">Dúvidas? Responda este e-mail.</p>
          </div>
        </body></html>
      `,
    });

    const emailType = isElite ? "welcome_elite" : "welcome_start";
    if (emailResponse?.error) {
      console.log("[WELCOME-UTIL] ERROR welcome", { email: redactEmail(email), error: emailResponse.error });
      await supabase.from("email_events").insert({
        email_id: `${email}-welcome-${Date.now()}`,
        type: "failed",
        email_type: emailType,
        recipient_email: email,
        metadata: { product_id: productId, gateway, provider_error: emailResponse.error },
      });
      return;
    }

    await supabase.from("email_events").insert({
      email_id: emailResponse?.data?.id || `${email}-welcome-${Date.now()}`,
      type: "sent",
      email_type: emailType,
      recipient_email: email,
      metadata: { product_id: productId, gateway },
    });
    console.log("[WELCOME-UTIL] Welcome enviado", { email: redactEmail(email), plan, gateway });
  } catch (e: any) {
    console.log("[WELCOME-UTIL] EXC welcome", { error: e.message });
  }
}
