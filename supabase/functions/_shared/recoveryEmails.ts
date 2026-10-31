// E-mails de recuperação de quem gerou o Pix / abriu o cartão e não pagou.
// Padrão do painel de e-mail marketing (PADRAO-EMAIL.md): corpo branco, sem logo, sem imagem,
// "Fala, Nome.", frases curtas, um botão, assinatura do Lucas, rodapé escuro. Sem valores.
//
// 1) pronta    → 1 h depois: "sua conta está pronta, falta um clique" (link que abre o pagamento).
// 2) desconto  → 3º dia: 20% por 24 horas, fechado com o Lucas no WhatsApp do suporte.
// 3) contato   → 7º dia: "estou tentando falar com você", conversa no WhatsApp.

export type RecoveryKind = "pronta" | "desconto" | "contato" | LeadKind;
export type LeadKind = "lead1" | "lead2" | "lead3" | "lead4" | "lead5" | "lead6";

export const RECOVERY_WHATSAPP = "5585986411294";
export const RECOVERY_DISCOUNT = 20;
export const RECOVERY_SCHEDULE_HOURS: Record<"pronta" | "desconto" | "contato", number> = { pronta: 1, desconto: 72, contato: 168 };
// Quem deixou o e-mail ou fez o quiz e não comprou: 6 e-mails, com cerca de 2 dias de intervalo.
export const LEAD_SCHEDULE_HOURS: Record<LeadKind, number> = { lead1: 1, lead2: 48, lead3: 96, lead4: 144, lead5: 192, lead6: 240 };

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));

const FONT = "font-family:Arial,Helvetica,sans-serif;";
const p = (html: string) => `<p style="margin:0 0 14px;font-size:16px;color:#1a1a2e;line-height:1.7;${FONT}">${html}</p>`;
const small = (html: string) => `<p style="margin:18px 0 0;font-size:14px;color:#555;line-height:1.6;${FONT}">${html}</p>`;
const btn = (label: string, url: string, bg: string) =>
  `<a href="${url}" style="display:block;width:100%;background-color:${bg};color:#ffffff;font-size:16px;font-weight:700;text-decoration:none;padding:16px 20px;border-radius:9px;text-align:center;box-sizing:border-box;margin:8px 0 4px;${FONT}">${label}</a>`;
const box = (html: string, bg: string, border: string) =>
  `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:6px 0 20px;"><tr><td style="background-color:${bg};border-left:4px solid ${border};border-radius:0 10px 10px 0;padding:16px 20px;"><p style="margin:0;font-size:15px;color:#1a1a2e;line-height:1.6;${FONT}">${html}</p></td></tr></table>`;
const list = (items: string[]) =>
  `<table role="presentation" cellspacing="0" cellpadding="0" style="margin:0 0 18px;">${items
    .map((t) => `<tr><td style="padding:3px 10px 3px 0;vertical-align:top;font-size:16px;color:#0a6080;${FONT}">✓</td><td style="padding:3px 0;font-size:16px;color:#1a1a2e;line-height:1.5;${FONT}">${t}</td></tr>`)
    .join("")}</table>`;

const whatsappUrl = (text: string) => `https://wa.me/${RECOVERY_WHATSAPP}?text=${encodeURIComponent(text)}`;

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
<p style="margin:0;font-size:11px;color:#94a3b8;${FONT}">Você recebe este e-mail porque começou a montar sua conta no Canva Viagem.<br><a href="${unsubscribeUrl}" style="color:#94a3b8;">Não quero mais receber</a></p>
</td></tr>
</table></td></tr></table></body></html>`;
}

export function renderRecoveryEmail(kind: RecoveryKind, vars: {
  firstName: string;
  payUrl: string;          // e-mail 1: link que entra logado e abre o pagamento
  unsubscribeUrl: string;
}): { subject: string; html: string } {
  const first = (vars.firstName || "").trim();
  const name = esc(first);
  // Sem nome cadastrado (quase todo lead só tem e-mail): saudação sem nome.
  const greeting = first ? `Fala, <strong>${name}</strong>.` : "Fala, tudo bem?";

  if (kind.startsWith("lead")) return renderLeadEmail(kind as LeadKind, first, greeting, vars.payUrl, vars.unsubscribeUrl);

  if (kind === "pronta") {
    const body = [
      p(greeting),
      p(`Sua conta já está criada. E o plano das suas 2 primeiras semanas também.`),
      p(`Está tudo separado, esperando você:`),
      list([
        "o anúncio do seu pacote, para feed e stories",
        "o carrossel com as dicas da viagem",
        "a página do pacote no seu site, pronta para mandar no WhatsApp",
        "os seus clientes organizados num lugar só",
      ]),
      p(`Ficou faltando só um passo: liberar o acesso.`),
      btn("Liberar meu acesso →", vars.payUrl, "#0a6080"),
      small(`Travou em alguma coisa no pagamento? Responda este e-mail que eu te ajudo.`),
    ].join("\n");
    return {
      subject: `${first ? `${first}, s` : "S"}ua conta está pronta. Falta um clique.`,
      html: shell(body, "O plano das suas 2 primeiras semanas já está separado.", vars.unsubscribeUrl),
    };
  }

  if (kind === "desconto") {
    const body = [
      p(greeting),
      p(`Sua conta continua lá, com o plano das 2 semanas montado. Só não foi liberada.`),
      p(`Às vezes o que segura é o momento. Então vou facilitar.`),
      box(`<strong>${RECOVERY_DISCOUNT}% de desconto</strong> para liberar a sua conta. Vale só pelas próximas <strong>24 horas</strong>.`, "#effaf3", "#25D366"),
      p(`É só me chamar no WhatsApp que eu te mando o link com o desconto aplicado.`),
      btn(`Quero meu desconto de ${RECOVERY_DISCOUNT}% →`, whatsappUrl(`Quero meu desconto de ${RECOVERY_DISCOUNT}% no Canva Viagem`), "#25D366"),
      small(`É o mesmo número do suporte. Depois de 24 horas, o desconto sai do ar.`),
    ].join("\n");
    return {
      subject: `${first ? `${first}, l` : "L"}iberei um desconto até amanhã`,
      html: shell(body, `${RECOVERY_DISCOUNT}% para liberar a sua conta. Só pelas próximas 24 horas.`, vars.unsubscribeUrl),
    };
  }

  const body = [
    p(greeting),
    p(`Te mandei alguns e-mails nos últimos dias e não tive resposta.`),
    p(`Pode ser que tenham caído no spam. Pode ser que não seja a hora. Tudo bem.`),
    p(`Só queria entender uma coisa: o que fez você parar antes de liberar a sua conta?`),
    box(`Foi o preço? Ficou alguma dúvida de como funciona? Faltou tempo agora? Me conta em uma frase, que eu respondo pessoalmente.`, "#f0f7fa", "#0a6080"),
    btn("Falar comigo no WhatsApp →", whatsappUrl(`Oi, Lucas. Vi seu e-mail sobre a minha conta no Canva Viagem`), "#25D366"),
    small(`Se preferir, é só responder este e-mail.`),
  ].join("\n");
  return {
    subject: `${first ? `${first}, e` : "E"}stou tentando falar com você`,
    html: shell(body, "O que fez você parar antes de liberar a sua conta?", vars.unsubscribeUrl),
  };
}

function renderLeadEmail(kind: LeadKind, first: string, greeting: string, url: string, unsub: string): { subject: string; html: string } {
  const hello = p(greeting);
  const go = (label: string) => btn(label, url, "#6440e6");
  const mail = (subject: string, preheader: string, parts: string[]) => ({
    subject,
    html: shell([hello, ...parts].join("\n"), preheader, unsub),
  });

  if (kind === "lead1") {
    return mail(`${first ? `${first}, s` : "S"}ua conta está pronta. Falta 1 clique.`, "Tudo configurado. Só falta escolher o plano.", [
      p(`Sua conta no Canva Viagem já está de pé.`),
      p(`Falta só uma coisa: escolher o plano. Assim que confirmar, você já cria a primeira postagem da sua agência.`),
      list(["anúncios para feed e stories", "carrosséis do seu pacote", "a página do pacote no seu site", "os seus clientes organizados num lugar só"]),
      go("Escolher meu plano →"),
      small(`Travou em alguma coisa? Responda este e-mail que eu te ajudo.`),
    ]);
  }
  if (kind === "lead2") {
    return mail(`Seu 1º anúncio pronto em poucos minutos`, "Você fala o destino. O resto sai pronto.", [
      p(`Criar a arte de cada pacote é onde o agente mais perde tempo.`),
      p(`Aqui você fala o destino, os dias e o valor. O anúncio sai pronto, com a sua logo e o seu WhatsApp.`),
      p(`O carrossel e a legenda saem junto.`),
      go("Quero fazer o meu →"),
    ]);
  }
  if (kind === "lead3") {
    return mail(`Não sabe design? A arte já vem pronta.`, "Nada de editor, nada de alinhar texto.", [
      p(`Você não abre editor. Não escolhe cor. Não alinha nada.`),
      p(`Escolhe a foto do destino, confere o preço e baixa. Se não gostar, gera outro modelo. Tem 12.`),
      p(`E dá para fazer tudo pelo celular.`),
      go("Ver os planos →"),
    ]);
  }
  if (kind === "lead4") {
    return mail(`Sem cartão? Dá para assinar no Pix.`, "O QR aparece na hora e o acesso libera sozinho.", [
      p(`Nem todo mundo quer passar o cartão, e tudo bem.`),
      p(`Na hora de pagar, é só escolher Pix. O QR aparece na tela e o acesso libera assim que o pagamento confirmar.`),
      go("Assinar no Pix →"),
      small(`Se preferir o cartão, ele também está lá.`),
    ]);
  }
  if (kind === "lead5") {
    return mail(`Sem fidelidade, sem multa. 7 dias de garantia.`, "Se não servir, você cancela em 2 cliques.", [
      p(`Sei que assinar mais uma ferramenta dá um pé atrás.`),
      p(`Então é assim: você tem 7 dias de garantia para testar com um pacote real.`),
      p(`Não serviu? Cancela em 2 cliques no seu painel, sem ligação e sem multa.`),
      go("Testar com o meu pacote →"),
    ]);
  }
  return mail(`Apaga este e-mail se você já posta todo dia`, "Mas se o seu feed anda parado, leia até o fim.", [
    p(`Se a sua agência já posta todo dia, pode fechar aqui e seguir a vida.`),
    p(`Mas se o Instagram anda parado porque criar conteúdo dá trabalho demais, foi para isso que eu fiz o Canva Viagem.`),
    go("Destravar meu Instagram →"),
    small(`Este é o último e-mail desta sequência. Se quiser falar comigo, é só responder.`),
  ]);
}
