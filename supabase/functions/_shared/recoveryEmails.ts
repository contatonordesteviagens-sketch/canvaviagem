// E-mails de recuperação de quem gerou o Pix / abriu o cartão e não pagou.
// Segue o padrão do painel de e-mail marketing (PADRAO-EMAIL.md): corpo branco, sem logo,
// "Fala, Nome.", botão largo, imagem abaixo do botão, assinatura do Lucas, rodapé escuro.
//
// 1) lembrete  → 1 h e 24 h depois: link para gerar um Pix novo / pagar no cartão.
// 2) desconto  → 3º dia: 20% de desconto fechado com o Lucas no WhatsApp do suporte.

export type RecoveryKind = "lembrete" | "desconto";

export const RECOVERY_WHATSAPP = "5585986411294";
export const RECOVERY_DISCOUNT = 20;

const PLAN_LABEL: Record<string, string> = {
  monthly: "Elite Mensal (R$ 97)",
  semiannual: "Elite Semestral (R$ 347)",
  annual: "Elite Anual (R$ 482)",
};

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));

const FONT = "font-family:Arial,Helvetica,sans-serif;";
const p = (html: string) => `<p style="margin:0 0 14px;font-size:16px;color:#1a1a2e;line-height:1.7;${FONT}">${html}</p>`;
const btn = (label: string, url: string, bg: string) =>
  `<a href="${url}" style="display:block;width:100%;background-color:${bg};color:#ffffff;font-size:16px;font-weight:700;text-decoration:none;padding:16px 20px;border-radius:9px;text-align:center;box-sizing:border-box;${FONT}">${label}</a>`;
const box = (html: string, bg: string, border: string) =>
  `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:6px 0 20px;"><tr><td style="background-color:${bg};border-left:4px solid ${border};border-radius:0 10px 10px 0;padding:16px 20px;"><p style="margin:0;font-size:15px;color:#1a1a2e;line-height:1.6;${FONT}">${html}</p></td></tr></table>`;

function shell(body: string, preheader: string, unsubscribeUrl: string) {
  return `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light"></head>
<body style="margin:0;padding:0;background-color:#f4f6f9;">
<span style="display:none!important;opacity:0;color:transparent;max-height:0;overflow:hidden;">${esc(preheader)}</span>
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:#f4f6f9;padding:24px 12px;"><tr><td align="center">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;background:#ffffff;border-radius:14px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.08);">
<tr><td style="padding:28px 28px 24px;background-color:#ffffff;">
${body}
<hr style="border:none;border-top:1px solid #e8edf2;margin:24px 0;">
<p style="margin:0;font-size:16px;color:#1a1a2e;line-height:1.6;${FONT}">Um abraço,<br><strong>Lucas Ferrari</strong><br><span style="color:#555;font-size:14px;">Marketing Turístico</span><br><a href="https://instagram.com/lucasferrari.pro" style="color:#0a6080;font-size:14px;text-decoration:none;">@lucasferrari.pro</a></p>
</td></tr>
<tr><td bgcolor="#0a1628" style="padding:20px 28px;text-align:center;">
<p style="margin:0 0 6px;font-size:12px;color:#94a3b8;${FONT}">© 2026 RD TUR · Marketing Turístico · canvaviagem.com</p>
<p style="margin:0;font-size:11px;color:#94a3b8;${FONT}">Você recebe este e-mail porque começou uma assinatura no Canva Viagem.<br><a href="${unsubscribeUrl}" style="color:#94a3b8;">Não quero mais receber</a></p>
</td></tr>
</table></td></tr></table></body></html>`;
}

export function renderRecoveryEmail(kind: RecoveryKind, vars: {
  firstName: string;
  plan?: string | null;
  method?: "pix" | "cartao";
  payUrl: string;          // lembrete: link que entra logado e abre o checkout
  imageUrl?: string;
  unsubscribeUrl: string;
}): { subject: string; html: string } {
  const name = esc(vars.firstName || "tudo bem");
  const plan = PLAN_LABEL[vars.plan ?? ""] ?? "Elite";
  const image = vars.imageUrl
    ? `<img src="${vars.imageUrl}" width="504" alt="Anúncio de viagem feito na Fábrica do Canva Viagem" style="display:block;width:100%;height:auto;border-radius:8px;margin-top:20px;" />`
    : "";

  if (kind === "lembrete") {
    const metodo = vars.method === "cartao" ? "o pagamento no cartão" : "o seu Pix";
    const body = [
      p(`Fala, <strong>${name}</strong>.`),
      p(`Vi que você montou o seu plano de 2 semanas, mas ${metodo} do <strong>${esc(plan)}</strong> ficou parado no meio do caminho.`),
      p(`Acontece. O Pix expira em 1 hora e às vezes a gente se distrai com um cliente no WhatsApp.`),
      box(`Seu plano continua salvo: anúncios, carrosséis, stories, o site do pacote e os seus clientes organizados no CRM. <strong>É só liberar o acesso.</strong>`, "#f0f7fa", "#0a6080"),
      btn("Gerar meu Pix de novo →", vars.payUrl, "#0a6080"),
      image,
      `<p style="margin:18px 0 0;font-size:14px;color:#555;line-height:1.6;${FONT}">Prefere cartão? No mesmo link dá para trocar a forma de pagamento.</p>`,
    ].join("\n");
    return {
      subject: `${vars.firstName || "ei"}, seu acesso ficou pela metade`,
      html: shell(body, "Seu plano de 2 semanas continua salvo. Falta só liberar o acesso.", vars.unsubscribeUrl),
    };
  }

  const waText = encodeURIComponent(`Quero meu desconto de ${RECOVERY_DISCOUNT}% no Canva Viagem`);
  const waUrl = `https://wa.me/${RECOVERY_WHATSAPP}?text=${waText}`;
  const body = [
    p(`Fala, <strong>${name}</strong>.`),
    p(`Faz alguns dias que você deixou o <strong>${esc(plan)}</strong> quase pronto e não finalizou.`),
    p(`Então eu resolvi fazer uma coisa que não costumo fazer: liberar uma condição só pra quem chegou até o final do quiz.`),
    box(`<strong>${RECOVERY_DISCOUNT}% de desconto</strong> em qualquer plano. Fala comigo no WhatsApp que eu te passo o link com o valor já com desconto.`, "#effaf3", "#25D366"),
    btn(`Quero meu desconto de ${RECOVERY_DISCOUNT}% no WhatsApp →`, waUrl, "#25D366"),
    image,
    `<p style="margin:18px 0 0;font-size:14px;color:#555;line-height:1.6;${FONT}">É o mesmo número do suporte do Canva Viagem. Vale enquanto essa conversa estiver aberta.</p>`,
  ].join("\n");
  return {
    subject: "uma condição que eu não vou repetir",
    html: shell(body, `${RECOVERY_DISCOUNT}% de desconto para fechar o seu plano, direto comigo no WhatsApp.`, vars.unsubscribeUrl),
  };
}
