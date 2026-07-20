import { readFile } from "node:fs/promises";

global.window = {};
await import("./template-data.js");

const states = [window.FABRICA_STATE, window.FABRICA_STATE_ALTERNATIVE];
const failures = [];
const requiredStateKeys = [
  "projectId",
  "agencyName",
  "agencyEmail",
  "address",
  "primaryColor",
  "secondaryColor",
  "selectedPackages",
  "siteContent",
  "crmForm"
];

for (const state of states) {
  for (const key of requiredStateKeys) {
    if (state[key] == null || state[key] === "") failures.push(`${state.agencyName || "Agência"}: ${key} ausente`);
  }

  for (const [index, trip] of state.selectedPackages.entries()) {
    for (const key of ["id", "title", "description", "price", "imageUrl", "ctaLabel"]) {
      if (!trip[key]) failures.push(`${state.agencyName}: pacote ${index + 1} sem ${key}`);
    }
  }

  const visibleFields = state.crmForm.fields.filter((field) => field.visible !== false);
  const crmKeys = visibleFields.map((field) => field.crmKey);
  if (new Set(crmKeys).size !== crmKeys.length) failures.push(`${state.agencyName}: crmKey duplicado`);
  for (const key of ["name", "phone", "email"]) {
    const field = visibleFields.find((item) => item.crmKey === key);
    if (!field?.required) failures.push(`${state.agencyName}: campo obrigatório ${key} ausente`);
  }
}

if (states[0].projectId === states[1].projectId) failures.push("As duas agências usam o mesmo projectId");

const html = await readFile(new URL("./index.html", import.meta.url), "utf8");
const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map((match) => match[1]);
const duplicateIds = ids.filter((id, index) => ids.indexOf(id) !== index);
if (duplicateIds.length) failures.push(`IDs duplicados: ${[...new Set(duplicateIds)].join(", ")}`);
for (const requiredId of ["primary-color", "secondary-color", "background-color", "image-file-input", "lead-form"]) {
  if (!ids.includes(requiredId)) failures.push(`Controle obrigatório sem ID: ${requiredId}`);
}

const template = await readFile(new URL("./template.js", import.meta.url), "utf8");
const forbiddenNetworkCalls = ["fetch(", "XMLHttpRequest", "sendBeacon", "supabase.", "axios."];
for (const token of forbiddenNetworkCalls) {
  if (template.includes(token)) failures.push(`Envio externo encontrado no piloto: ${token}`);
}

if (!template.includes('agency_id: state.projectId')) failures.push("Payload não carrega agency_id");
if (!template.includes("control.dataset.crmKey")) failures.push("Campos não são mapeados por crmKey");

if (failures.length) {
  console.error(failures.map((failure) => `✗ ${failure}`).join("\n"));
  process.exitCode = 1;
} else {
  console.log("✓ 2 agências de teste validadas");
  console.log("✓ identidade, pacotes e formulário têm o contrato mínimo esperado");
  console.log("✓ projectId separa os leads por agência");
  console.log("✓ formulário da prévia não possui chamadas de envio externo");
  console.log("✓ HTML sem IDs duplicados");
}
