const fs = require('fs');
const path = require('path');

const htmlPath = 'C:\\Users\\win 10\\Downloads\\saveweb2zip-com-www-canva-com\\index.html';
const destFolder = 'C:\\Users\\win 10\\Desktop\\CANVA_VIAGEM_ESTAVEL_24_ABRIL\\public\\canva-viagem';
const destHtmlPath = path.join(destFolder, 'index.html');

// Create destination folder if it doesn't exist
if (!fs.existsSync(destFolder)) {
    fs.mkdirSync(destFolder, { recursive: true });
}

// Copy the entire directory (excluding index.html for now)
function copyDir(src, dest) {
    if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
    let entries = fs.readdirSync(src, { withFileTypes: true });
    for (let entry of entries) {
        let srcPath = path.join(src, entry.name);
        let destPath = path.join(dest, entry.name);
        if (entry.isDirectory()) {
            copyDir(srcPath, destPath);
        } else if (entry.name !== 'index.html') {
            fs.copyFileSync(srcPath, destPath);
        }
    }
}
copyDir('C:\\Users\\win 10\\Downloads\\saveweb2zip-com-www-canva-com', destFolder);

// Read the HTML
let html = fs.readFileSync(htmlPath, 'utf8');

// Replacements
const replacements = [
    { from: /Crie designs profissionais/g, to: "Tenha um feed profissional de viagens" },
    { from: /Canva Pro/g, to: "Canva Viagem" },
    { from: /Ferramentas premium, conteúdo exclusivo e IA para você criar qualquer coisa. Experimente o Canva Pro grátis./g, to: "A única plataforma do mercado de turismo que combina 250+ vídeos 4K e artes editáveis com a revolucionária Fábrica de Anúncios com I.A." },
    { from: /Experimente o Canva Pro grátis/g, to: "Quero começar agora" },
    { from: /Por que escolher o Canva Pro\?/g, to: "Por que escolher o Canva Viagem?" },
    { from: /Ferramentas profissionais para tudo o que você precisa/g, to: "Ferramentas essenciais para o marketing da sua agência" },
    { from: /Trabalhe melhor com a IA/g, to: "Trabalhe melhor com a Inteligência Artificial" },
    { from: /Modelos premium, possibilidades infinitas/g, to: "Mídias premium, possibilidades infinitas" },
    { from: /Mais de 20 milhões/g, to: "Mais de 187 agências" },
    { from: /de pessoas usam o Canva Pro/g, to: "já viraram a chave e lucram mais" },
    { from: /Perguntas frequentes/g, to: "Perguntas Frequentes" }
];

for (let r of replacements) {
    html = html.replace(r.from, r.to);
}

// Write the modified HTML
fs.writeFileSync(destHtmlPath, html, 'utf8');
console.log('Done mapping Canva Viagem copy to the cloned HTML!');
