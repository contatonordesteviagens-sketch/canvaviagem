import { auth, defineMcp } from "@lovable.dev/mcp-js";
import getProfileTool from "./tools/get-profile";
import listFavoritesTool from "./tools/list-favorites";
import listGeneratedSitesTool from "./tools/list-generated-sites";

// The OAuth issuer MUST be the direct Supabase host (never the .lovable.cloud proxy).
// Build it from VITE_SUPABASE_PROJECT_ID, which Vite inlines at build time.
const projectRef = import.meta.env.VITE_SUPABASE_PROJECT_ID ?? "project-ref-unset";

export default defineMcp({
  name: "canva-viagem-mcp",
  title: "Canva Viagem MCP",
  version: "0.1.0",
  instructions:
    "Read-only tools for the signed-in Canva Viagem user: read your profile, list your favorites, and list your generated landing pages from the Fábrica.",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  tools: [getProfileTool, listFavoritesTool, listGeneratedSitesTool],
});
