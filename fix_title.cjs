const fs = require('fs');
let content = fs.readFileSync('src/pages/fabrica/Phase3ArtFactory.tsx', 'utf8');
content = content.replace(/const buildTitleVariations = \([\s\S]*?return out;\r?\n\};/, 
'const buildTitleVariations = (template: string, destination: string): string[] => {\n  const dest = (destination || \\).trim() || \Destino\;\n  const fill = (t: string) => t.replace(/\\{destino\\}/gi, dest);\n  const main = fill(template);\n  return [main, main, main, main, main];\n};');
fs.writeFileSync('src/pages/fabrica/Phase3ArtFactory.tsx', content);

let contentEs = fs.readFileSync('src/pages/fabrica/Phase3ArtFactoryES.tsx', 'utf8');
contentEs = contentEs.replace(/const buildTitleVariations = \([\s\S]*?return out;\r?\n\};/, 
'const buildTitleVariations = (template: string, destination: string): string[] => {\n  const dest = (destination || \\).trim() || \Destino *\;\n  const fill = (t: string) => t.replace(/\\{destino\\}/gi, dest);\n  const main = fill(template);\n  return [main, main, main, main, main];\n};');
fs.writeFileSync('src/pages/fabrica/Phase3ArtFactoryES.tsx', contentEs);

