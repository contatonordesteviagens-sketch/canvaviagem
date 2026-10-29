// Trava simples para tarefas agendadas chamadas sem segredo (pg_cron com a chave pública):
// a tarefa só roda se a última execução foi há mais de `minIntervalMs`. Chamar várias vezes não repete nada.
import type { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

export async function claimJobRun(db: SupabaseClient, job: string, minIntervalMs: number): Promise<boolean> {
  const { data } = await db.from("job_runs").select("last_run_at").eq("job", job).maybeSingle();
  const last = data?.last_run_at ? Date.parse(data.last_run_at) : 0;
  if (Date.now() - last < minIntervalMs) return false;
  const { error } = await db.from("job_runs").upsert({ job, last_run_at: new Date().toISOString() }, { onConflict: "job" });
  return !error;
}
