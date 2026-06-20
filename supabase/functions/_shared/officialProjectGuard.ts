export const OFFICIAL_SUPABASE_PROJECT_REF = "zdjtcwtakgizbsbbwtgc";
export const BLOCKED_SUPABASE_PROJECT_REFS = new Set(["mgdsjxasolxoclchyqdx"]);

export function assertOfficialSupabaseProject(context: string) {
  const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";

  if (!supabaseUrl.includes(`${OFFICIAL_SUPABASE_PROJECT_REF}.supabase.co`)) {
    throw new Error(
      `[${context}] Safety lock: SUPABASE_URL must point to ${OFFICIAL_SUPABASE_PROJECT_REF}. Current value is blocked.`,
    );
  }

  for (const blockedRef of BLOCKED_SUPABASE_PROJECT_REFS) {
    if (supabaseUrl.includes(blockedRef)) {
      throw new Error(`[${context}] Safety lock: blocked Supabase project ${blockedRef} detected.`);
    }
  }
}
