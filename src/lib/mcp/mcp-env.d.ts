// Tool files run in Deno (Supabase Edge Function) at runtime, but Vite
// typechecks them as part of the app. Declare Deno-side globals here.
declare const process: { env: Record<string, string | undefined> };
