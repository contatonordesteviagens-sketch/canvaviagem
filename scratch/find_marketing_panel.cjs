const fs = require('fs');
const path = require('path');

const rootSearchPaths = [
  'C:/Users/win 10/Desktop',
  'C:/Users/win 10/Downloads',
  'C:/Users/win 10'
];

console.log("=== INICIANDO BUSCA DO PROJETO DO PAINEL ===");

function searchDir(dir, depth) {
  if (depth > 4) return;
  try {
    const files = fs.readdirSync(dir);
    
    // Check if package.json exists in this folder
    if (files.includes('package.json')) {
      const pPath = path.join(dir, 'package.json');
      const pContent = JSON.parse(fs.readFileSync(pPath, 'utf8'));
      if (
        (pContent.name && (pContent.name.includes('marketing') || pContent.name.includes('painel') || pContent.name.includes('email'))) ||
        dir.toLowerCase().includes('marketing') ||
        dir.toLowerCase().includes('painel')
      ) {
        console.log(`[PROJETO ENCONTRADO]`);
        console.log(`Pasta: ${dir}`);
        console.log(`Nome do package.json: ${pContent.name}`);
        console.log(`----------------------------------------`);
      }
    }

    // Traverse subdirectories
    for (const file of files) {
      const fullPath = path.join(dir, file);
      if (file === 'node_modules' || file === '.git' || file === '.lovable' || file === '.netlify') continue;
      
      const stat = fs.statSync(fullPath);
      if (stat.isDirectory()) {
        searchDir(fullPath, depth + 1);
      }
    }
  } catch (err) {
    // skip errors
  }
}

rootSearchPaths.forEach(root => {
  if (fs.existsSync(root)) {
    searchDir(root, 0);
  }
});

console.log("=== BUSCA CONCLUÍDA ===");
