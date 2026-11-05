// Detecta quando a página abriu dentro de outro app (Instagram, Facebook, TikTok, LinkedIn,
// ou o visualizador do app de e-mail no iPhone). Nesses casos o login não fica salvo no
// navegador de verdade, e a pessoa acha que "não consegue entrar pelo celular".

export function navegadorInterno(): { interno: boolean; nome: string } {
  if (typeof navigator === "undefined") return { interno: false, nome: "" };
  const ua = navigator.userAgent || "";
  const apps: [RegExp, string][] = [
    [/Instagram/i, "Instagram"],
    [/FBAN|FBAV|FB_IAB|FBIOS/i, "Facebook"],
    [/TikTok|musical_ly|Bytedance/i, "TikTok"],
    [/LinkedInApp/i, "LinkedIn"],
    [/Twitter/i, "X"],
    [/Line\//i, "Line"],
    [/GSA\//i, "app do Google"],
    [/Snapchat/i, "Snapchat"],
    [/Pinterest/i, "Pinterest"],
  ];
  for (const [re, nome] of apps) if (re.test(ua)) return { interno: true, nome };
  // iPhone/iPad: visualizador dentro de um app (Gmail, Outlook, WhatsApp) não é o Safari
  const ios = /iPhone|iPad|iPod/i.test(ua);
  const safari = /Safari\//i.test(ua) && !/CriOS|FxiOS|EdgiOS|OPiOS/i.test(ua);
  const navegadorConhecido = /CriOS|FxiOS|EdgiOS|OPiOS/i.test(ua);
  if (ios && !safari && !navegadorConhecido) return { interno: true, nome: "app de e-mail" };
  // Android WebView
  if (/Android/i.test(ua) && /; wv\)/i.test(ua)) return { interno: true, nome: "app" };
  return { interno: false, nome: "" };
}

export function ehIphone() {
  return typeof navigator !== "undefined" && /iPhone|iPad|iPod/i.test(navigator.userAgent || "");
}
