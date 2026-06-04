const fs = require('fs');

// --- FABRICA ES ---
let es = fs.readFileSync('src/pages/FabricaES.tsx', 'utf8');

// Sidebar Desktop & Mobile Names
es = es.replace(/Generador de Imágenes/g, 'Anuncio');
es = es.replace(/Página de Ventas/g, 'Sitio');
es = es.replace(/CRM & Leads/g, 'CRM');
es = es.replace(/Mis Activos/g, 'Plan');
es = es.replace(/Diagnóstico/g, 'Checkup');

// Admin Shortcuts
es = es.replace(
  /\{\[1, 2, 3, 4, 5\]\.map\(\(num\) => \(/,
  `{['Anuncio', 'Sitio', 'CRM', 'Plan', 'Checkup'].map((name, idx) => {
              const num = idx + 1;
              return (`
);
es = es.replace(
  />\s*Fase \{num\}\s*<\/button>/g,
  `>{name} (F{num})</button>`
);

fs.writeFileSync('src/pages/FabricaES.tsx', es, 'utf8');

// --- FABRICA PT ---
let pt = fs.readFileSync('src/pages/Fabrica.tsx', 'utf8');

// Sidebar Desktop & Mobile Names
pt = pt.replace(/Gerador de Imagens/g, 'Anúncio');
pt = pt.replace(/Página de Vendas/g, 'Site');
pt = pt.replace(/CRM & Leads/g, 'CRM');
pt = pt.replace(/Meus Ativos/g, 'Plano');
pt = pt.replace(/Diagnóstico/g, 'Checkup');

// Admin Shortcuts
pt = pt.replace(
  /\{\[1, 2, 3, 4, 5\]\.map\(\(num\) => \(/,
  `{['Anúncio', 'Site', 'CRM', 'Plano', 'Checkup'].map((name, idx) => {
              const num = idx + 1;
              return (`
);
pt = pt.replace(
  />\s*Fase \{num\}\s*<\/button>/g,
  `>{name} (F{num})</button>`
);

fs.writeFileSync('src/pages/Fabrica.tsx', pt, 'utf8');

console.log('Phases renamed successfully!');
