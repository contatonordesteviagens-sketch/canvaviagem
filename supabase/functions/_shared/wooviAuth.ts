import { createClient, type SupabaseClient, type User } from "https://esm.sh/@supabase/supabase-js@2.57.2";

export function adminClient(): SupabaseClient {
  return createClient(Deno.env.get("SUPABASE_URL") ?? "", Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "", {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

/** Usuário logado a partir do Bearer token do app; null se não houver sessão válida. */
export async function userFromRequest(req: Request, db: SupabaseClient): Promise<User | null> {
  const auth = req.headers.get("Authorization") ?? "";
  if (!auth.startsWith("Bearer ")) return null;
  const token = auth.slice("Bearer ".length).trim();
  if (!token) return null;
  const { data, error } = await db.auth.getUser(token);
  if (error || !data?.user) return null;
  return data.user;
}
