const fs = require('fs');
let html = fs.readFileSync('public/canva_inicio.html', 'utf8');

// Replace all canva.com links with #
html = html.replace(/href="https:\/\/www\.canva\.com[^"]*"/g, 'href="#"');
html = html.replace(/href="https:\/\/[^"]*canva\.com[^"]*"/g, 'href="#"');

fs.writeFileSync('public/canva_inicio.html', html);
