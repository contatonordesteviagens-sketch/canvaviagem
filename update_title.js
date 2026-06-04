const fs = require('fs');
let c = fs.readFileSync('src/lib/fabrica-compose-art.ts', 'utf8');
const search = `    const pickedFromVariations = (titleVariations && titleVariations.length > 0)
      ? (titleVariations[variantIdx % titleVariations.length] || "").trim()
      : "";
    const titleText = sanitizeAdText(
      pickedFromVariations
        ? pickedFromVariations
        : (titleOverride && titleOverride.trim())
          ? titleOverride.trim()`;

const replace = `    const pickedFromVariations = (titleVariations && titleVariations.length > 0)
      ? (titleVariations[variantIdx % titleVariations.length] || "").trim()
      : undefined;
    const titleText = sanitizeAdText(
      typeof pickedFromVariations === "string"
        ? pickedFromVariations
        : typeof titleOverride === "string"
          ? titleOverride.trim()`;

if (c.includes(search)) {
    c = c.replace(search, replace);
    fs.writeFileSync('src/lib/fabrica-compose-art.ts', c, 'utf8');
    console.log("Success");
} else {
    console.log("Not found");
}
