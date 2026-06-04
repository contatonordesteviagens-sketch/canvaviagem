const fs = require('fs');

let html = fs.readFileSync('public/canva_inicio.html', 'utf8');

// Replace Free trial texts
html = html.replace(/Comece seu teste grátis do Canva Viagem Elite/g, 'Assine o Canva Viagem Elite Agora');
html = html.replace(/Comece seu teste grátis do Canva Pro/g, 'Assine o Canva Viagem Elite Agora');
html = html.replace(/Iniciar teste gratuito/gi, 'Começar Agora');
html = html.replace(/Teste grátis de 30 dias/gi, 'Acesso Imediato');
html = html.replace(/Experimente grátis/gi, 'Assine Agora');
html = html.replace(/É grátis/gi, 'Acesso Premium');
html = html.replace(/Canva Grátis/gi, 'Design Amador');
html = html.replace(/gratuito/gi, 'premium');
html = html.replace(/grátis/gi, 'imediato');

// Replace standard Canva Pro text with Canva Viagem text
html = html.replace(/Design para todos/gi, 'O Marketing da sua Agência em Piloto Automático');
html = html.replace(/Tudo o que você precisa para criar/gi, 'Tudo o que sua Agência de Viagens precisa para faturar');
html = html.replace(/Qualquer pessoa ou equipe/gi, 'Agências de viagens de todos os tamanhos');

// Try to remove FAQs about free
html = html.replace(/Sim, o Canva é grátis para qualquer pessoa/gi, 'Nossas ferramentas são focadas no público Elite de turismo.');

fs.writeFileSync('public/canva_inicio.html', html);
console.log('Cleaned Canva clone HTML');
