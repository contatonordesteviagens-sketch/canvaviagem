const fs = require('fs');
const path = require('path');

const destFolder = 'C:\\Users\\win 10\\Desktop\\CANVA_VIAGEM_ESTAVEL_24_ABRIL\\public\\canva-viagem';

const replacements = [
    { from: /Crie designs profissionais/g, to: "Tenha um feed profissional de viagens" },
    { from: /Canva Pro/g, to: "Canva Viagem" },
    { from: /Ferramentas premium, conteúdo exclusivo e IA para você criar qualquer coisa\. Experimente o Canva Pro grátis\./g, to: "A única plataforma do mercado de turismo que combina 250+ vídeos 4K e artes editáveis com a revolucionária Fábrica de Anúncios com I.A." },
    { from: /Experimente o Canva Pro grátis/g, to: "Quero começar agora" },
    { from: /Por que escolher o Canva Pro\?/g, to: "Por que escolher o Canva Viagem?" },
    { from: /Ferramentas profissionais para tudo o que você precisa/g, to: "Ferramentas essenciais para sua agência de viagem" },
    { from: /Trabalhe melhor com a IA/g, to: "Trabalhe melhor com a Inteligência Artificial" },
    { from: /Modelos premium, possibilidades infinitas/g, to: "Mídias premium, possibilidades infinitas" },
    { from: /Mais de 20 milhões/g, to: "Mais de 187 agências" },
    { from: /de pessoas usam o Canva Pro/g, to: "já viraram a chave e lucram mais" },
    { from: /Perguntas frequentes/g, to: "Perguntas Frequentes" }
];

function processDirectory(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
            processDirectory(fullPath);
        } else if (fullPath.endsWith('.html') || fullPath.endsWith('.js') || fullPath.endsWith('.json')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            let modified = false;
            
            // Also handle unicode escapes for JSON/JS:
            // "Crie designs profissionais" -> Crie designs profissionais
            for (let r of replacements) {
                if (content.match(r.from)) {
                    content = content.replace(r.from, r.to);
                    modified = true;
                }
            }

            if (modified) {
                fs.writeFileSync(fullPath, content, 'utf8');
                console.log(`Updated: ${fullPath}`);
            }
        }
    }
}

processDirectory(destFolder);
console.log('Deep replacement complete.');
