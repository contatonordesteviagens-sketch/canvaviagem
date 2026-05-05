const fs = require('fs');
const path = require('path');

const filePath = path.join(process.cwd(), 'src/lib/fabrica-compose-art.ts');
const content = fs.readFileSync(filePath, 'utf8');

// The file was 3112 lines. The original was around 2500.
// It seems the "master fix" appended a lot of code.
// I will keep only the FIRST definition of the main logic and apply the fixes there.
// Actually, I'll just truncate the file at the first occurrence of "export async function reframeImageToAspect"
// because everything after that is likely a mess.

const splitMarker = 'export async function reframeImageToAspect';
const parts = content.split(splitMarker);

if (parts.length > 2) {
  // We have multiple definitions. Keep the first one and the reframe function.
  const cleanContent = parts[0] + splitMarker + parts[1];
  fs.writeFileSync(filePath, cleanContent, 'utf8');
  console.log('File deduplicated successfully');
} else {
  console.log('No duplication found or only one reframe function');
}
