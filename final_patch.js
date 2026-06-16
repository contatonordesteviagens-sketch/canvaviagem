const fs = require('fs');
const path = require('path');

const projectRoot = 'C:\\Users\\win 10\\Desktop\\CANVA E FABRICA - JUNHO 26';
const file = path.join(projectRoot, 'src', 'lib', 'fabrica-compose-art.ts');
let lines = fs.readFileSync(file, 'utf8').split('\n');

let targetIdx = -1;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('if (variant === 5) {')) {
    if (lines[i+1] && lines[i+1].includes('// Reutiliza o motor Aurora Premium que é altamente estético e compatível')) {
      targetIdx = i + 3; // The line after '}'
      break;
    }
  }
}

if (targetIdx !== -1) {
  let v6Code = fs.readFileSync('C:\\\\Users\\\\win 10\\\\.gemini\\\\antigravity-ide\\\\brain\\\\c443d779-b877-4ea6-9166-cf9baa21e119\\\\scratch\\\\patch-v6.mjs', 'utf8').split('const v6Code = \')[1].split('\;')[0];
  lines.splice(targetIdx, 0, v6Code);
  
  let content = lines.join('\n');
  content = content.replace(
    /\\/\\/ Variantes ATIVAS: V0, V1, V2, V3, V4, V5 \\(todas implementadas\\)\\.\\r?\\n\\s*const TOTAL_VARIANTS = 6;/g,
    '// Variantes ATIVAS: V0, V1, V2, V3, V4, V5, V6 (todas implementadas).\\n    const TOTAL_VARIANTS = 7;'
  );
  content = content.replace(
    /const variant = \\(\\(v % 6\\) \\+ 6\\) % 6;/g,
    'const variant = ((v % 7) + 7) % 7;'
  );
  
  fs.writeFileSync(file, content, 'utf8');
  console.log("V6 patched successfully into compose-art.ts!");
} else {
  console.log("Could not find the target index.");
}

const phase3ArtFactoryPath = path.join(projectRoot, 'src', 'pages', 'fabrica', 'Phase3ArtFactory.tsx');
const phase3ArtFactoryESPath = path.join(projectRoot, 'src', 'pages', 'fabrica', 'Phase3ArtFactoryES.tsx');

[phase3ArtFactoryPath, phase3ArtFactoryESPath].forEach(filePath => {
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    content = content.replace(/const TOTAL_VARIANTS_PHOTO = 6;/g, 'const TOTAL_VARIANTS_PHOTO = 7;');
    content = content.replace(/const TOTAL_VARIANTS = 6;/g, 'const TOTAL_VARIANTS = 7;');
    content = content.replace(/\\[0, 1, 2, 3, 4, 5\\]\\.map/g, '[0, 1, 2, 3, 4, 5, 6].map');
    content = content.replace(/Variações \\(V0\\.\\.V5\\)/g, 'Variações (V0..V6)');
    content = content.replace(/Seletor de Versão \\(V0\\.\\.V5\\)/g, 'Seletor de Versão (V0..V6)');
    fs.writeFileSync(filePath, content, 'utf8');
  }
});
