const fs = require('fs');
const path = require('path');

const dir = 'c:\\Users\\win 10\\Desktop\\CANVA_VIAGEM_ESTAVEL_24_ABRIL\\src\\pages\\fabrica';
const files = [
  'Phase1DiagnosticoES.tsx',
  'Phase2AtivosES.tsx',
  'Phase3ArtFactoryES.tsx',
  'Phase4LandingBuilderES.tsx',
  'Phase5DashboardES.tsx'
];

const mojibakeMap = {
  'Ã¡': 'á',
  'Ã©': 'é',
  'Ã\xAD': 'í',
  'Ã³': 'ó',
  'Ãº': 'ú',
  'Ã¢': 'â',
  'Ãª': 'ê',
  'Ã®': 'î',
  'Ã´': 'ô',
  'Ã»': 'û',
  'Ã£': 'ã',
  'Ãµ': 'õ',
  'Ã§': 'ç',
  'Ã±': 'ñ',
  'Ã€': 'À',
  'Ã\x81': 'Á',
  'Ã\x89': 'É',
  'Ã\x8D': 'Í',
  'Ã\x93': 'Ó',
  'Ã\x9A': 'Ú',
  'Ã\x82': 'Â',
  'Ã\x8A': 'Ê',
  'Ã\x8E': 'Î',
  'Ã\x94': 'Ô',
  'Ã\x9B': 'Û',
  'Ã\x83': 'Ã',
  'Ã\x85': 'Å',
  'Ã\x87': 'Ç',
  'Ã\x91': 'Ñ',
  'Ã¿': 'ÿ',
  'Ã\x80': 'À',
  'Ã\x95': 'Õ',
  'Ã\x84': 'Ä',
  'Ã\x88': 'È',
  'Ã\x8C': 'Ì',
  'Ã\x92': 'Ò',
  'Ã\x99': 'Ù',
  'Ã\x96': 'Ö',
  'Ã\x9C': 'Ü',
  'Ã\x9F': 'ß',
  'Ã¼': 'ü',
  'Ã¶': 'ö',
  'Ã¤': 'ä',
  'Ã¯': 'ï',
  'Ã«': 'ë',
  'Ã¨': 'è',
  'Ã¬': 'ì',
  'Ã²': 'ò',
  'Ã¹': 'ù',
  // Specific broken chars from grep output:
  // "SÃ³", "usuÃ¡rio", "prÃ³xima", "Ã©", "SeÃ§Ãµes", "PadrÃ£o", "vocÃª", "AvanÃ§ar"
  'Ã£': 'ã',
  'Ãµ': 'õ',
  'Ã§': 'ç',
  'Ãª': 'ê',
  'Ã\xAD': 'í', // The hex \xAD is the second byte for 'í' in UTF-8
};

// also add literal char codes for latin1 vs win1252 fixes:
mojibakeMap[String.fromCharCode(195, 161)] = 'á';
mojibakeMap[String.fromCharCode(195, 169)] = 'é';
mojibakeMap[String.fromCharCode(195, 173)] = 'í';
mojibakeMap[String.fromCharCode(195, 179)] = 'ó';
mojibakeMap[String.fromCharCode(195, 186)] = 'ú';
mojibakeMap[String.fromCharCode(195, 162)] = 'â';
mojibakeMap[String.fromCharCode(195, 170)] = 'ê';
mojibakeMap[String.fromCharCode(195, 174)] = 'î';
mojibakeMap[String.fromCharCode(195, 180)] = 'ô';
mojibakeMap[String.fromCharCode(195, 187)] = 'û';
mojibakeMap[String.fromCharCode(195, 163)] = 'ã';
mojibakeMap[String.fromCharCode(195, 181)] = 'õ';
mojibakeMap[String.fromCharCode(195, 167)] = 'ç';
mojibakeMap[String.fromCharCode(195, 177)] = 'ñ';
mojibakeMap[String.fromCharCode(195, 128)] = 'À'; // € 
mojibakeMap[String.fromCharCode(195, 129)] = 'Á'; // \x81
mojibakeMap[String.fromCharCode(195, 137)] = 'É'; // \x89
mojibakeMap[String.fromCharCode(195, 141)] = 'Í'; // \x8D
mojibakeMap[String.fromCharCode(195, 147)] = 'Ó'; // \x93
mojibakeMap[String.fromCharCode(195, 154)] = 'Ú'; // \x9A
mojibakeMap[String.fromCharCode(195, 130)] = 'Â'; // \x82
mojibakeMap[String.fromCharCode(195, 138)] = 'Ê'; // \x8A
mojibakeMap[String.fromCharCode(195, 148)] = 'Ô'; // \x94
mojibakeMap[String.fromCharCode(195, 131)] = 'Ã'; // \x83
mojibakeMap[String.fromCharCode(195, 149)] = 'Õ'; // \x95
mojibakeMap[String.fromCharCode(195, 135)] = 'Ç'; // \x87
mojibakeMap[String.fromCharCode(195, 145)] = 'Ñ'; // \x91
mojibakeMap[String.fromCharCode(195, 191)] = 'ÿ'; // ¿
mojibakeMap[String.fromCharCode(194, 186)] = 'º'; // º


for (const file of files) {
  const fp = path.join(dir, file);
  if (!fs.existsSync(fp)) continue;
  let content = fs.readFileSync(fp, 'utf8');
  
  for (const [k, v] of Object.entries(mojibakeMap)) {
    content = content.split(k).join(v);
  }
  
  // Custom manual fixes just in case:
  content = content.replace(/Ã¡/g, 'á')
                   .replace(/Ã©/g, 'é')
                   .replace(/Ã³/g, 'ó')
                   .replace(/Ãº/g, 'ú')
                   .replace(/Ã¢/g, 'â')
                   .replace(/Ãª/g, 'ê')
                   .replace(/Ã´/g, 'ô')
                   .replace(/Ã£/g, 'ã')
                   .replace(/Ãµ/g, 'õ')
                   .replace(/Ã§/g, 'ç')
                   .replace(/Ã±/g, 'ñ')
                   .replace(/Ã€/g, 'À')
                   .replace(/Ã¿/g, 'ÿ')
                   .replace(/Ã\xAD/g, 'í')
                   .replace(/Ã\x81/g, 'Á')
                   .replace(/Ã\x89/g, 'É')
                   .replace(/Ã\x8D/g, 'Í')
                   .replace(/Ã\x93/g, 'Ó')
                   .replace(/Ã\x9A/g, 'Ú')
                   .replace(/Ã\x87/g, 'Ç')
                   .replace(/Ã\x82/g, 'Â')
                   .replace(/Ã\x8A/g, 'Ê')
                   .replace(/Ã\x94/g, 'Ô')
                   .replace(/Ã\x83/g, 'Ã')
                   .replace(/Ã\x95/g, 'Õ')
                   .replace(/Ã\x91/g, 'Ñ');
                   
  fs.writeFileSync(fp, content, 'utf8');
}
console.log('Fixed mojibake!');
