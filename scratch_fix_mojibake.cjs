const fs = require('fs');
let c = fs.readFileSync('src/pages/fabrica/Phase3ArtFactoryES.tsx', 'utf8');

c = c.replace(/<label className=\{labelCls\}>Fonte<\/label>/g, '<label className={labelCls}>Fuente</label>');

c = c.replace(/<span className="text-\[12px\] font-semibold text-white\/85">.*?Ajustes Avan.*ados de Tamanho<\/span>/g, '<span className="text-[12px] font-semibold text-white/85">📏 Ajustes Avanzados de Tamaño</span>');

fs.writeFileSync('src/pages/fabrica/Phase3ArtFactoryES.tsx', c);
