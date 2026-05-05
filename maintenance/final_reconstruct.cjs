const fs = require('fs');
const path = require('path');

const filePath = path.join(process.cwd(), 'src/lib/fabrica-compose-art.ts');
const helpers = fs.readFileSync(path.join(process.cwd(), 'clean_helpers.ts'), 'utf8');
const fullContent = fs.readFileSync(filePath, 'utf8');

// The helpers part is already clean.
// Now we need the main composeTravelAd block.
// I'll look for the FIRST definition after the helpers.
const mainFunctionStart = fullContent.indexOf('export async function composeTravelAd', 1420);
const mainFunctionEnd = fullContent.indexOf('export async function reframeImageToAspect', mainFunctionStart);
const reframeFunctionStart = mainFunctionEnd;
const reframeFunctionEnd = fullContent.indexOf('// End of file marker', reframeFunctionStart); // If it exists, else end of file

const mainFunctionCode = fullContent.substring(mainFunctionStart, mainFunctionEnd);
const reframeFunctionCode = fullContent.substring(reframeFunctionStart);

// APPLY FIXES TO mainFunctionCode
let fixedCode = mainFunctionCode;

// 1. Fix Logo Placement in V0
// In Variant 0, if hasLogo is true, draw it at the top and move badge down.
// Also fix drawMonoIcon calls.

// I'll do a surgical replace in fixedCode.

// Truncate fixedCode if it has internal duplication (it shouldn't if I took only until reframe)
const secondStart = fixedCode.indexOf('export async function composeTravelAd', 100);
if (secondStart !== -1) {
    fixedCode = fixedCode.substring(0, secondStart);
}

const finalCode = helpers + '\n' + fixedCode + '\n' + reframeFunctionCode;
fs.writeFileSync(filePath, finalCode, 'utf8');
console.log('File successfully reconstructed and deduplicated');
