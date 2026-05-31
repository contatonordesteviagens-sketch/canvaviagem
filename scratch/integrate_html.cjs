const fs = require("fs");
const path = require("path");

const htmlContent = fs.readFileSync(path.join(__dirname, "extracted_section.html"), "utf8");
const inicioPath = path.join(__dirname, "../src/pages/Inicio.tsx");
let inicioCode = fs.readFileSync(inicioPath, "utf8");

// Identificar a seção antiga em Inicio.tsx a ser substituída
const sectionStartKeyword = "{/* POR QUE ESCOLHER O CANVA VIAGEM ELITE (Adaptação do Canva) */}";
const sectionEndKeyword = "{/* COMO A IA CRIA SEU ANÚNCIO */}";

const startIndex = inicioCode.indexOf(sectionStartKeyword);
const endIndex = inicioCode.indexOf(sectionEndKeyword);

if (startIndex === -1 || endIndex === -1) {
  console.error("Não foi possível localizar os comentários de marcação em Inicio.tsx.");
  process.exit(1);
}

// Substituir a dobra pelo renderizador nativo de HTML
const replacement = `${sectionStartKeyword}
      <div dangerouslySetInnerHTML={{ __html: CANVA_FEATURES_HTML }} />
      \n      `;

let newCode = inicioCode.substring(0, startIndex) + replacement + inicioCode.substring(endIndex);

// Remover qualquer definição anterior de CANVA_FEATURES_HTML para evitar duplicidade
const constantKeyword = "const CANVA_FEATURES_HTML =";
const constIndex = newCode.indexOf(constantKeyword);
if (constIndex !== -1) {
  newCode = newCode.substring(0, constIndex);
}

// Injetar o HTML bruto como uma constante no fim do arquivo
newCode += `\n\nconst CANVA_FEATURES_HTML = \`${htmlContent.replace(/`/g, "\\`").replace(/\${/g, "\\${")}\`;\n`;

fs.writeFileSync(inicioPath, newCode);
console.log("HTML Integrado com Sucesso em Inicio.tsx!");
