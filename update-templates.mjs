import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const linksPath = path.join(__dirname, 'legendas', 'final_links.txt');
const txtPath = path.join(__dirname, 'legendas', 'LEGENDAS - AGÊNCIAS DE VIAGENS VÍDEOS .txt');
const templatesTsPath = path.join(__dirname, 'src', 'data', 'templates.ts');

if (!fs.existsSync(linksPath) || !fs.existsSync(txtPath) || !fs.existsSync(templatesTsPath)) {
  console.error('Um ou mais arquivos não foram encontrados!');
  process.exit(1);
}

// 1. Process Captions (Mesmo processo anterior)
const txtContent = fs.readFileSync(txtPath, 'utf8');
const blocks = txtContent.split(/_{3,}/);
const parsedCaptions = [];

for (let block of blocks) {
  block = block.trim();
  if (!block) continue;
  
  const lines = block.split('\n').map(l => l.trim()).filter(l => l);
  if (lines.length < 2) continue;

  let destinationLine = lines[0];
  if (destinationLine.includes('LEGENDAS VÍDEOS') || destinationLine.includes('Destinos Nacionais') || destinationLine.includes('Destinos Internacionais')) {
    destinationLine = lines[1]; // fallback if header was mixed
    if (!destinationLine) continue;
  }

  const destination = destinationLine;
  let hashtags = '';
  let textLines = [];

  // Pula a primeira linha se for o destino
  let startIdx = lines[0] === destination ? 1 : 0;
  // Se ainda for um header na pos 0 e destino na pos 1
  if (lines[1] === destination) startIdx = 2;

  for (let i = startIdx; i < lines.length; i++) {
    if (lines[i].startsWith('#')) {
      hashtags = lines[i];
    } else {
      textLines.push(lines[i]);
    }
  }

  const originalText = textLines.join(' ');
  const aidaText = `✨ Descubra as maravilhas de ${destination}! ✈️🌍\n\n${originalText}\n\n🔥 Imagine você relaxando e aproveitando cada momento sem preocupações. Nosso pacote é pensado para você viver o melhor dessa viagem e colecionar momentos inesquecíveis!\n\n👇 Clique no link da BIO ou nos chame no WhatsApp para garantir seu pacote exclusivo agora!\n📲 (99) 9 9999-9999`;

  parsedCaptions.push({
    destination,
    text: aidaText,
    hashtags: hashtags || `#${destination.replace(/\s|-/g, '')} #ViagemDosSonhos #AgenciaDeViagens`,
  });
}

// 2. Process Links
const linksText = fs.readFileSync(linksPath, 'utf8');
const linkLines = linksText.split('\n').map(l => l.trim()).filter(l => l);
const linkMap = {};

for (let i = 0; i < linkLines.length; i++) {
  if (linkLines[i].startsWith('http')) continue;
  if (linkLines[i].includes('=======')) continue;
  if (linkLines[i].toLowerCase().includes('internacionais:')) continue;
  if (linkLines[i].toLowerCase().includes('nacionais:')) continue;
  if (linkLines[i].toLowerCase().includes('extras:')) continue;
  
  let title = linkLines[i].replace(/:$/, '').trim().toLowerCase();
  let link = linkLines[i+1];
  if (link && link.startsWith('http')) {
    linkMap[title] = link;
  }
}

// 3. Process Templates
function escapeJsonString(str) {
  return str.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n');
}

let templatesContent = fs.readFileSync(templatesTsPath, 'utf8');

// The new regex correctly matches "title": "..." or title: "..."
const updatedTemplatesContent = templatesContent.replace(/({[^}]*["']?title["']?\s*:\s*["']([^"']+)["'][^}]*})/g, (match, objectContent, title) => {
  let modifiedMatch = match.substring(0, match.lastIndexOf('}'));
  let wasModified = false;

  // Adiciona description se não existir
  if (!match.includes('description:')) {
    const titleClean = title.toLowerCase().split(' -')[0].replace('eva - ', '').replace('bia - ', '').replace('mel - ', '').trim();
    
    // Fuzzy search pra legenda
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
    
    modifiedMatch += `, "description": "${escapeJsonString(descriptionText)}"`;
    wasModified = true;
  }

  // Adiciona drive_url se não existir
  if (!match.includes('drive_url:')) {
    const titleLower = title.toLowerCase().trim();
    let matchedUrl = null;
    
    // Match exato
    if (linkMap[titleLower]) {
      matchedUrl = linkMap[titleLower];
    } else {
      // Fuzzy search pro link (ex: "Bia - Ceará" vs "Ceará")
      for (const [linkTitle, url] of Object.entries(linkMap)) {
        if (titleLower.includes(linkTitle) || linkTitle.includes(titleLower)) {
          matchedUrl = url;
          break;
        }
      }
    }
    
    if (matchedUrl) {
      modifiedMatch += `, "drive_url": "${matchedUrl}"`;
      wasModified = true;
    }
  }

  if (wasModified) {
    return `${modifiedMatch} }`;
  }
  return match;
});

fs.writeFileSync(templatesTsPath, updatedTemplatesContent);
console.log(`✅ Templates atualizados com descrições e links do Drive!`);
