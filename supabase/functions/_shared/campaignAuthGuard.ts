import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

/**
 * Guard for mass-email endpoints (drip, re-engagement, win-back).
 * Allows either:
 *  - an authenticated admin (JWT with role 'admin' in public.user_roles), or
 *  - a scheduled job presenting the shared CRON_SECRET via x-cron-secret header.
 * Returns null when allowed, or a Response to return immediately when denied.
 */
export async function requireAdminOrCron(
  req: Request,
  supabase: SupabaseClient,
  corsHeaders: Record<string, string>,
): Promise<Response | null> {
  const deny = (status: number, error: string) =>
    new Response(JSON.stringify({ error }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status,
    });

  try {
    const cronSecret = Deno.env.get("CRON_SECRET");
    const providedCron = req.headers.get("x-cron-secret");
    if (cronSecret && providedCron && providedCron === cronSecret) {
      return null;
    }

    const authHeader = req.headers.get("Authorization") || "";
    const token = authHeader.replace(/^Bearer\s+/i, "").trim();
    if (!token) return deny(401, "Unauthorized");

    const { data: userData, error: userErr } = await supabase.auth.getUser(token);
    if (userErr || !userData?.user) return deny(401, "Unauthorized");

    const { data: roleRow } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userData.user.id)
      .eq("role", "admin")
      .maybeSingle();

    if (!roleRow) return deny(403, "Forbidden: admin only");
    return null;
  } catch (_e) {
    return deny(401, "Unauthorized");
  }
}

export function serviceClient(): SupabaseClient {
  return createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
}
