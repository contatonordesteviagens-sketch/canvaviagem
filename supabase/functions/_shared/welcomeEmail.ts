// Utilitário compartilhado para e-mails transacionais de boas-vindas e magic link.
// Usado pelo webhook do Stripe para garantir
// que o disparo do Resend permaneça consistente.

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
 * Envia um ÚNICO e-mail unificado contendo as Boas-Vindas + Benefícios do Plano + Link Mágico de acesso.
 */
export async function sendUnifiedWelcomeEmail(
  supabase: any,
  resend: any,
  email: string,
  magicLink: string,
  token: string,
  customerName: string,
  productId?: string | null,
) {
  if (!resend) return;
  const plan = resolvePlanFromProductId(productId ?? null);
  const isElite = plan === "Elite";
  const planName = isElite ? "Plano Elite 👑" : "Plano Start";
  
  const eliteExtras = isElite
    ? `<li style="margin-bottom:8px;"><strong>🏭 Fábrica de Anúncios IA</strong> (Criador de imagens e copys em segundos)</li>
       <li style="margin-bottom:8px;"><strong>🌐 Criador de Sites de Viagem</strong> (Hospedagem inclusa)</li>
       <li><strong>🎨 Canva Viagem Start</strong> (Vídeos, templates e robôs)</li>`
    : `<li style="margin-bottom:8px;"><strong>🎬 Vídeos Reels Virais</strong></li>
       <li style="margin-bottom:8px;"><strong>🤖 Robôs de IA</strong></li>
       <li><strong>🎨 Templates Editáveis</strong></li>`;

  try {
    const emailResponse = await resend.emails.send({
      from: FROM(),
      to: [email],
      subject: `🔐 Seu Link de Acesso — Bem-vindo ao Canva Viagem!`,
      html: `
        <!DOCTYPE html>
        <html lang="pt-BR">
        <head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Bem-vindo ao Canva Viagem</title></head>
        <body style="margin:0;padding:0;font-family:sans-serif;background:#f3f4f6;">
          <div style="background:white;max-width:600px;margin:40px auto;padding:32px;text-align:center;border-radius:12px;box-shadow:0 4px 6px -1px rgba(0,0,0,0.1);">
            <h1 style="color:#1f2937;margin-bottom:8px;">Olá, ${customerName}! 🌴</h1>
            <h2 style="color:#6366f1;font-size:20px;margin-top:0;">Bem-vindo ao Canva Viagem!</h2>
            
            <p style="color:#4b5563;font-size:16px;line-height:1.5;margin-bottom:24px;">
              Seu pagamento foi confirmado com sucesso e sua assinatura do <strong>${planName}</strong> está ativa!
            </p>
            
            <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:20px;text-align:left;margin-bottom:24px;">
              <h3 style="margin-top:0;color:#334155;font-size:16px;">Você agora tem acesso a:</h3>
              <ul style="color:#475569;margin-bottom:0;padding-left:20px;line-height:1.6;">
                ${eliteExtras}
              </ul>
            </div>
            
            <p style="color:#4b5563;font-size:16px;margin-bottom:24px;">Clique no botão abaixo para entrar na sua conta agora mesmo. Sem senhas complicadas, apenas um clique:</p>
            
            <a href="${magicLink}" style="background:#6366f1;color:white;padding:16px 32px;text-decoration:none;border-radius:8px;display:inline-block;font-weight:bold;font-size:16px;box-shadow:0 4px 6px -1px rgba(99, 102, 241, 0.4);">
              🔐 Acessar Minha Conta
            </a>
            
            <p style="margin-top:20px;font-size:12px;color:#94a3b8;">Este link de acesso seguro expira em 24 horas.</p>
            
            <hr style="border:none;border-top:1px solid #e2e8f0;margin:32px 0;">
            <p style="font-size:12px;color:#94a3b8;margin:0;">
              Precisa de ajuda? Basta responder a este e-mail.<br>
              Equipe Canva Viagem
            </p>
          </div>
        </body>
        </html>
      `,
    });

    const emailType = isElite ? "unified_welcome_elite" : "unified_welcome_start";
    if (emailResponse?.error) {
      console.log("[WELCOME-UTIL] ERROR unified welcome", { email: redactEmail(email), error: emailResponse.error });
      await supabase.from("email_events").insert({
        email_id: token,
        type: "failed",
        email_type: emailType,
        recipient_email: email,
        metadata: { token_id: token, product_id: productId, gateway, provider_error: emailResponse.error },
      });
      return;
    }

    await supabase.from("email_events").insert({
      email_id: emailResponse?.data?.id || token,
      type: "sent",
      email_type: emailType,
      recipient_email: email,
      metadata: { token_id: token, product_id: productId, gateway },
    });
    console.log("[WELCOME-UTIL] Unified welcome enviado", { email: redactEmail(email), plan, gateway });
  } catch (e: any) {
    console.log("[WELCOME-UTIL] EXC unified welcome", { error: e.message });
  }
}
