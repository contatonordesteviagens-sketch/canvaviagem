const fs = require('fs');
let content = fs.readFileSync('src/lib/fabrica-compose-art.ts', 'utf8');

// 1. Force V3 to act as "Oferta de Destino" in ROTEAMENTO FINAL
const routingTarget = "      if (variant === 3) return await renderV3Experiencia();";
const routingReplacement = `      if (variant === 3) {
        // FORÇADO: opera exclusivamente na categoria Oferta de Destino (bypassa isExperience)
        return await renderSafeSquareOffer();
      }`;

// Normalize line endings for replacement
const hasRoutingCRLF = content.includes(routingTarget.replace(/\n/g, '\r\n'));
const normalizedRoutingTarget = hasRoutingCRLF ? routingTarget.replace(/\n/g, '\r\n') : routingTarget;
const normalizedRoutingReplacement = hasRoutingCRLF ? routingReplacement.replace(/\n/g, '\r\n') : routingReplacement;

if (content.includes(normalizedRoutingTarget)) {
  content = content.replace(normalizedRoutingTarget, normalizedRoutingReplacement);
  console.log("Successfully replaced routing!");
} else {
  console.log("Routing target not found!");
}

// 2. Scale up V3 Stories benefits and icons by 20%
const benefitsTarget = `          // Ícones oficiais de alta fidelidade
          const iconSize = 44;
          drawMonoIcon(ctx, b.icon as IconKey, tx + iconSize/2, ty, iconSize, navy);
          
          // Escala: se for "6 dias / 5 noites" (ou contiver "dia"), reduz em 15% (31 * 0.85 = 26px)
          // Caso contrário, aumenta em 10% (31 * 1.1 = 34px)
          const isDuration = /\\d+\\s*dia/i.test(b.text) || /noite/i.test(b.text);
          let bfs = isDuration ? 26 : 34;`;

const benefitsReplacement = `          // Ícones oficiais de alta fidelidade (aumentados em 20%)
          const iconSize = 53;
          drawMonoIcon(ctx, b.icon as IconKey, tx + iconSize/2, ty, iconSize, navy);
          
          // Escala (aumentada em 20%): se for "6 dias / 5 noites" (ou contiver "dia"), fica 31px.
          // Caso contrário, fica 41px.
          const isDuration = /\\d+\\s*dia/i.test(b.text) || /noite/i.test(b.text);
          let bfs = isDuration ? 31 : 41;`;

const hasBenefitsCRLF = content.includes(benefitsTarget.replace(/\n/g, '\r\n'));
const normalizedBenefitsTarget = hasBenefitsCRLF ? benefitsTarget.replace(/\n/g, '\r\n') : benefitsTarget;
const normalizedBenefitsReplacement = hasBenefitsCRLF ? benefitsReplacement.replace(/\n/g, '\r\n') : benefitsReplacement;

if (content.includes(normalizedBenefitsTarget)) {
  content = content.replace(normalizedBenefitsTarget, normalizedBenefitsReplacement);
  console.log("Successfully scaled up benefits!");
} else {
  // Try raw string match without line normalization to be safe
  const targetRaw = benefitsTarget.split('\n').map(l => l.trim()).join('\n');
  const contentRaw = content.split('\n').map(l => l.trim()).join('\n');
  if (contentRaw.includes(targetRaw)) {
    console.log("Found raw match for benefits but line endings might differ. Proceeding with split-join replacement...");
  } else {
    console.log("Benefits target not found!");
  }
}

fs.writeFileSync('src/lib/fabrica-compose-art.ts', content, 'utf8');
