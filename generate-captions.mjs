import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const txtPath = path.join(__dirname, 'legendas', 'LEGENDAS - AGÊNCIAS DE VIAGENS VÍDEOS .txt');
const templatesTsPath = path.join(__dirname, 'src', 'data', 'templates.ts');
const captionsTsPath = path.join(__dirname, 'src', 'data', 'captions.ts');

if (!fs.existsSync(txtPath)) {
  console.error('File legendas txt not found!', txtPath);
  process.exit(1);
}

const txtContent = fs.readFileSync(txtPath, 'utf8');
const blocks = txtContent.split(/_{3,}/);

const parsedCaptions = [];
let currentCategory = 'nacional';

for (let block of blocks) {
  block = block.trim();
  if (!block) continue;
  
  if (block.includes('Destinos Nacionais')) {
    currentCategory = 'nacional';
    continue;
  }
  if (block.includes('Destinos Internacionais')) {
    currentCategory = 'internacional';
    continue;
  }

  const lines = block.split('\n').map(l => l.trim()).filter(l => l);
  if (lines.length < 2) continue;

  let destinationLine = lines[0];
  // Ignore headers
  if (destinationLine.includes('LEGENDAS VÍDEOS')) continue;

  const destination = destinationLine;
  let hashtags = '';
  let textLines = [];

  for (let i = 1; i < lines.length; i++) {
    if (lines[i].startsWith('#')) {
      hashtags = lines[i];
    } else {
      textLines.push(lines[i]);
    }
  }

  const originalText = textLines.join(' ');
  
  // Criando a versão AIDA/PAS
  const aidaText = `✨ Descubra as maravilhas de ${destination}! ✈️🌍\n\n${originalText}\n\n🔥 Imagine você relaxando e aproveitando cada momento sem preocupações. Nosso pacote é pensado para você viver o melhor dessa viagem e colecionar momentos inesquecíveis!\n\n👇 Clique no link da BIO ou nos chame no WhatsApp para garantir seu pacote exclusivo agora!\n📲 (99) 9 9999-9999`;

  parsedCaptions.push({
    destination,
    text: aidaText,
    hashtags: hashtags || `#${destination.replace(/\s|-/g, '')} #ViagemDosSonhos #AgenciaDeViagens`,
    category: currentCategory
  });
}

// Write to captions.ts
const captionsFileContent = `export interface Caption {
  destination: string;
  text: string;
  hashtags: string;
  category?: 'nacional' | 'internacional';
}

export const captions: Caption[] = ${JSON.stringify(parsedCaptions, null, 2)};
`;
fs.writeFileSync(captionsTsPath, captionsFileContent);
console.log(`✅ Atualizado ${captionsTsPath} com ${parsedCaptions.length} legendas AIDA.`);

// Process templates.ts
function escapeJsonString(str) {
  return str.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n');
}

let templatesContent = fs.readFileSync(templatesTsPath, 'utf8');

const updatedTemplatesContent = templatesContent.replace(/({[^}]*title:\s*["']([^"']+)["'][^}]*})/g, (match, objectContent, title) => {
  // If it already has a description, skip
  if (match.includes('description:')) return match;
  
  // Find matching caption
  const titleClean = title.toLowerCase().split(' -')[0].replace('eva - ', '').replace('bia - ', '').replace('mel - ', '').trim();
  const captionMatch = parsedCaptions.find(c => {
    const destClean = c.destination.toLowerCase().split(' -')[0].trim();
    return destClean === titleClean || titleClean.includes(destClean) || destClean.includes(titleClean);
  });
  
  let descriptionText = '';
  if (captionMatch) {
    descriptionText = captionMatch.text + '\\n\\n' + captionMatch.hashtags;
  } else {
    descriptionText = `✨ A aventura te espera com ${title}! ✈️🌍\\n\\n🔥 Nossos pacotes e conteúdos são criados para você colecionar momentos inesquecíveis sem preocupações.\\n\\n👇 Clique no link da BIO para aproveitar as melhores condições!\\n📲 (99) 9 9999-9999\\n\\n#${title.replace(/\s|-/g, '')} #ViagemPerfeita #AgenciaDeViagens`;
  }
  
  // Remove the trailing '}' and add description
  const matchWithoutBrace = match.substring(0, match.lastIndexOf('}'));
  return `${matchWithoutBrace}, "description": "${escapeJsonString(descriptionText)}" }`;
});

fs.writeFileSync(templatesTsPath, updatedTemplatesContent);
console.log(`✅ Atualizado ${templatesTsPath} com as novas legendas associadas.`);
