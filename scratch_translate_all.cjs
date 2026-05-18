const fs = require('fs');

function translateFile(filePath, replacements) {
  let c = fs.readFileSync(filePath, 'utf8');
  for (const [pt, es] of Object.entries(replacements)) {
    c = c.split(pt).join(es);
  }
  fs.writeFileSync(filePath, c);
}

// Phase 1
translateFile('src/pages/fabrica/Phase1DiagnosticoES.tsx', {
  '"Voltar"': '"Volver"',
  '>Voltar<': '>Volver<',
  'Editar / complementar formulário': 'Editar / complementar formulario',
  'Editar / complementar datos (se acumula sin borrar)': 'Editar / complementar datos (se acumula sin borrar)', // keep
  'Avançar': 'Avanzar'
});

// Phase 2
translateFile('src/pages/fabrica/Phase2AtivosES.tsx', {
  'Novo pacote adicionado e já visível no Site!': '¡Nuevo paquete añadido y visible en el sitio!',
  'Adicionar novo pacote': 'Añadir nuevo paquete',
  'Novo pacote': 'Nuevo paquete',
  'Adicionar ao Site': 'Añadir al Sitio',
  'Salvar no Site': 'Guardar en el Sitio',
  'title="Editar"': 'title="Editar"', // same
  'title="Remover"': 'title="Eliminar"',
  '>Voltar<': '>Volver<',
  'Avançar': 'Avanzar'
});

// Phase 3
translateFile('src/pages/fabrica/Phase3ArtFactoryES.tsx', {
  '"Novo pacote"': '"Nuevo paquete"',
  'title="Remover"': 'title="Eliminar"',
  'title="Adicionar"': 'title="Añadir"'
});

// Phase 5
translateFile('src/pages/fabrica/Phase5DashboardES.tsx', {
  'Novos Templates de Gramado/RS': 'Nuevos Templates de Cancún',
  'Editar Dados': 'Editar Datos',
  '>Voltar<': '>Volver<',
  'Avançar': 'Avanzar'
});

