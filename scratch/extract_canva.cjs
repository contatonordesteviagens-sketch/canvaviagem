const fs = require("fs");
const path = require("path");

const htmlPath = path.join(__dirname, "../public/canva_inicio.html");
const html = fs.readFileSync(htmlPath, "utf8");

// Encontrar o início da seção "Por que escolher o Canva Viagem Elite?"
const startText = 'Por que escolher o Canva Viagem Elite?';
const startIndex = html.lastIndexOf("<section", html.indexOf(startText));

// Encontrar o fim da seção de ferramentas/tabs, que é a seção seguinte de "Ferramentas profissionais"
const endText = "Como a IA cria seu anúncio";
const endIndex = html.lastIndexOf("</section>", html.indexOf(endText)) + 10;

if (startIndex === -1 || endIndex === -1) {
  console.error("Não foi possível encontrar os limites da seção no HTML.");
  process.exit(1);
}

const extractedHtml = html.substring(startIndex, endIndex);
fs.writeFileSync(path.join(__dirname, "extracted_section.html"), extractedHtml);
console.log("HTML Extraído com Sucesso! Tamanho:", extractedHtml.length);
