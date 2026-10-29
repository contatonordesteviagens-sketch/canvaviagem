/**
 * URL e chave pública (anon) do Supabase para chamadas feitas fora do cliente oficial
 * (fetch manual, HTML do site publicado). O nome da variável mudou entre ambientes
 * (VITE_SUPABASE_PUBLISHABLE_KEY x VITE_SUPABASE_ANON_KEY); quando ela faltava, o site
 * publicado saía com a chave vazia e não registrava nenhuma visita.
 * A chave anon é pública por definição (é a mesma de src/integrations/supabase/client.ts).
 */
const FALLBACK_URL = "https://zdjtcwtakgizbsbbwtgc.supabase.co";
const FALLBACK_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpkanRjd3Rha2dpemJzYmJ3dGdjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkwMzIxMjMsImV4cCI6MjA4NDYwODEyM30.juuc45o-OZbLQcx2LaMLyltRABAVy70kgJ_L_JXeUEs";

export const SUPABASE_PUBLIC_URL: string = import.meta.env.VITE_SUPABASE_URL || FALLBACK_URL;
export const SUPABASE_PUBLIC_KEY: string =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY || FALLBACK_ANON_KEY;
