// Purchase pela Conversions API da Meta, para vários pixels.
// Para adicionar um pixel: inclua { pixelId, tokenEnv } abaixo e salve o token no segredo com esse nome.
// Pixel sem token é pulado; falha de um pixel nunca quebra quem chamou.
import type { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

export const META_CAPI_PIXELS: ReadonlyArray<{ pixelId: string; tokenEnv: string }> = [
  { pixelId: "2120347238758199", tokenEnv: "META_CAPI_TOKEN_2120347238758199" },
  { pixelId: "1824488118557875", tokenEnv: "META_CAPI_TOKEN_1824488118557875" },
];

export type MetaMatch = {
  email?: string | null;
  phone?: string | null;
  firstName?: string | null;
  userId?: string | null;
  fbp?: string | null;
  fbc?: string | null;
  ip?: string | null;
  userAgent?: string | null;
};

const clip = (v: unknown, max: number) => (typeof v === "string" && v.trim() ? v.trim().slice(0, max) : null);

/** fbp/fbc, IP e user agent de uma requisição + corpo, limpos e com tamanho limitado. */
export function matchFromRequest(req: Request, body: any): Pick<MetaMatch, "fbp" | "fbc" | "ip" | "userAgent"> {
  const fwd = req.headers.get("cf-connecting-ip") || req.headers.get("x-forwarded-for")?.split(",")[0] || req.headers.get("x-real-ip");
  const fbp = clip(body?.fbp, 200);
  const fbc = clip(body?.fbc, 300);
  return {
    fbp: fbp && /^fb\.\d\.\d+\.\S+$/.test(fbp) ? fbp : null,
    fbc: fbc && /^fb\.\d\.\d+\.\S+$/.test(fbc) ? fbc : null,
    ip: clip(fwd, 64),
    userAgent: clip(req.headers.get("user-agent"), 500),
  };
}

export async function sha256Hex(input: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(input));
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, "0")).join("");
}

/** Completa telefone e primeiro nome pelo perfil do usuário, quando existirem. */
export async function enrichFromProfile(db: SupabaseClient, match: MetaMatch): Promise<MetaMatch> {
  if (!match.userId) return match;
  try {
    const { data } = await db.from("profiles").select("email,name,phone").eq("user_id", match.userId).maybeSingle();
    return {
      ...match,
      email: match.email || data?.email || null,
      phone: match.phone || data?.phone || null,
      firstName: match.firstName || (data?.name ? String(data.name).trim().split(/\s+/)[0] : null),
    };
  } catch {
    return match;
  }
}

async function buildUserData(m: MetaMatch): Promise<Record<string, unknown>> {
  const u: Record<string, unknown> = {};
  const email = m.email?.toLowerCase().trim();
  if (email && email.includes("@")) u.em = [await sha256Hex(email)];
  let phone = (m.phone || "").replace(/\D/g, "");
  if (phone.length === 10 || phone.length === 11) phone = `55${phone}`;
  if (phone.length >= 12) u.ph = [await sha256Hex(phone)];
  const fn = m.firstName?.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z]/g, "");
  if (fn) u.fn = [await sha256Hex(fn)];
  if (m.userId) u.external_id = [await sha256Hex(m.userId)];
  if (m.fbp) u.fbp = m.fbp;
  if (m.fbc) u.fbc = m.fbc;
  if (m.ip) u.client_ip_address = m.ip;
  if (m.userAgent) u.client_user_agent = m.userAgent;
  return u;
}

/**
 * Envia o Purchase a todos os pixels com token. Mesmo event_id do navegador → a Meta conta uma compra só.
 * Retorna quantos pixels tinham token e quantos aceitaram.
 */
export async function sendPurchaseToMeta(params: {
  eventId: string;
  value: number;
  currency: string;
  sourceUrl: string;
  match: MetaMatch;
  log?: (step: string, details?: unknown) => void;
}): Promise<{ configured: number; sent: number }> {
  const log = params.log ?? ((s: string, d?: unknown) => console.log(`[META-CAPI] ${s}`, d ?? ""));
  if (!(params.value > 0)) return { configured: 0, sent: 0 };
  const targets = META_CAPI_PIXELS.map((p) => ({ ...p, token: Deno.env.get(p.tokenEnv) })).filter((p) => p.token);
  if (!targets.length) return { configured: 0, sent: 0 };
  const userData = await buildUserData(params.match);
  const event = {
    event_name: "Purchase",
    event_time: Math.floor(Date.now() / 1000),
    event_id: params.eventId,
    event_source_url: params.sourceUrl,
    action_source: "website",
    user_data: userData,
    custom_data: { value: params.value, currency: params.currency },
  };
  const results = await Promise.all(targets.map(async (t) => {
    try {
      const res = await fetch(`https://graph.facebook.com/v18.0/${t.pixelId}/events`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: AbortSignal.timeout(8000),
        body: JSON.stringify({ access_token: t.token, data: [event] }),
      });
      if (!res.ok) log("Meta recusou a compra", { pixel: t.pixelId, eventId: params.eventId, status: res.status });
      return res.ok;
    } catch (err) {
      log("Falha ao avisar a Meta", { pixel: t.pixelId, eventId: params.eventId, message: (err as Error).message });
      return false;
    }
  }));
  return { configured: targets.length, sent: results.filter(Boolean).length };
}
