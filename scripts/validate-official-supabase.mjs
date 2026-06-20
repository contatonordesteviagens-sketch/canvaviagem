import { readFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { resolve } from "node:path";

const officialRef = "zdjtcwtakgizbsbbwtgc";
const blockedRefs = ["mgdsjxasolxoclchyqdx"];
const skipCliLink = process.argv.includes("--skip-cli-link");
const allowedBlockedRefFiles = new Set([
  resolve("supabase/functions/_shared/officialProjectGuard.ts"),
]);

const files = [
  ".env",
  "supabase/config.toml",
  "src/integrations/supabase/client.ts",
  "src/pages/SiteViewer.tsx",
];

const scanRoots = ["src", "supabase", "public"];
const ignoredDirs = new Set(["node_modules", ".git", ".temp"]);
const scannedExtensions = new Set([
  ".cjs",
  ".css",
  ".html",
  ".js",
  ".json",
  ".jsx",
  ".mjs",
  ".sql",
  ".toml",
  ".ts",
  ".tsx",
]);

function walk(dir) {
  if (!existsSync(dir)) return;
  for (const entry of readdirSync(dir)) {
    if (ignoredDirs.has(entry)) continue;
    const abs = resolve(dir, entry);
    const stat = statSync(abs);
    if (stat.isDirectory()) {
      walk(abs);
      continue;
    }
    const dot = entry.lastIndexOf(".");
    const ext = dot >= 0 ? entry.slice(dot).toLowerCase() : "";
    if (scannedExtensions.has(ext)) files.push(abs);
  }
}

for (const root of scanRoots) walk(resolve(root));

if (!skipCliLink) {
  files.push("supabase/.temp/project-ref", "supabase/.temp/linked-project.json");
}

const errors = [];

for (const file of files) {
  const abs = resolve(file);
  if (!existsSync(abs)) continue;
  const content = readFileSync(abs, "utf8");

  for (const blockedRef of blockedRefs) {
    if (!allowedBlockedRefFiles.has(abs) && content.includes(blockedRef)) {
      errors.push(`${file} contains blocked Supabase project ${blockedRef}`);
    }
  }
}

const envPath = resolve(".env");
if (existsSync(envPath)) {
  const env = readFileSync(envPath, "utf8");
  if (!env.includes(`VITE_SUPABASE_PROJECT_ID="${officialRef}"`) && !env.includes(`VITE_SUPABASE_PROJECT_ID=${officialRef}`)) {
    errors.push(`.env must keep VITE_SUPABASE_PROJECT_ID as ${officialRef}`);
  }
  if (!env.includes(`https://${officialRef}.supabase.co`)) {
    errors.push(`.env must point VITE_SUPABASE_URL to ${officialRef}`);
  }
}

const configPath = resolve("supabase/config.toml");
if (existsSync(configPath)) {
  const config = readFileSync(configPath, "utf8");
  if (!config.includes(`project_id = "${officialRef}"`)) {
    errors.push(`supabase/config.toml must keep project_id as ${officialRef}`);
  }
}

const linkedProjectPath = resolve("supabase/.temp/project-ref");
if (!skipCliLink && existsSync(linkedProjectPath)) {
  const linkedProject = readFileSync(linkedProjectPath, "utf8").trim();
  if (linkedProject && linkedProject !== officialRef) {
    errors.push(`Supabase CLI is linked to ${linkedProject}; run supabase link for ${officialRef} before deploy`);
  }
}

if (errors.length) {
  console.error("Supabase safety lock failed:");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(`Supabase safety lock OK: ${officialRef}`);
