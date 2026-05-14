const fs = require('fs');
let code = fs.readFileSync('src/pages/SalesPageES.tsx', 'utf8');

code = code.replace(/export default function SalesPage\(/g, 'export default function SalesPageES(');
code = code.replace(/document.title = /g, "document.documentElement.lang = 'es';\n    document.title = ");

fs.writeFileSync('src/pages/SalesPageES.tsx', code);
