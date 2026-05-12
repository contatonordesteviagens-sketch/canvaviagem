import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const ELITE_PRODUCT_IDS = new Set(["prod_UTFlCWzNqvqSNx", "prod_UTFsXcKq8m0mol", "prod_UTSmPe3GPt8iHt"]);

type HeadersMap = Record<string, string>;

const jsonResponse = (body: Record<string, unknown>, status: number, headers: HeadersMap) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...headers, "Content-Type": "application/json" },
  });

export async function verifyFabricaEliteAccess(req: Request, corsHeaders: HeadersMap) {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return { ok: false as const, response: jsonResponse({ error: "Login necessário" }, 401, corsHeaders) };
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
  const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
  const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

  const authClient = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: authHeader } },
    auth: { persistSession: false },
  });

  const { data: userData, error: userError } = await authClient.auth.getUser();
  const userId = userData?.user?.id;
  if (userError || !userId) {
    return { ok: false as const, response: jsonResponse({ error: "Sessão inválida" }, 401, corsHeaders) };
  }

  const dbClient = supabaseServiceRoleKey
    ? createClient(supabaseUrl, supabaseServiceRoleKey, { auth: { persistSession: false } })
    : authClient;

  const { data: adminRole } = await dbClient
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .eq("role", "admin")
    .maybeSingle();

  if (adminRole) return { ok: true as const, userId };

  const { data: subscription } = await dbClient
    .from("subscriptions")
    .select("product_id,status,current_period_end")
    .eq("user_id", userId)
    .in("status", ["active", "trialing"])
    .maybeSingle();

  const endDate = subscription?.current_period_end ? new Date(subscription.current_period_end) : null;
  const isCurrent = !endDate || endDate > new Date();
  const isElite = !!subscription?.product_id && ELITE_PRODUCT_IDS.has(subscription.product_id) && isCurrent;

  if (!isElite) {
    return { ok: false as const, response: jsonResponse({ error: "Plano Elite necessário" }, 403, corsHeaders) };
  }

  return { ok: true as const, userId };
}