const fs = require('fs');
let code = fs.readFileSync('src/pages/PlanosES.tsx', 'utf8');

code = code.replace(/Moneda LocalCheckoutModal/g, 'PixCheckoutModal');
code = code.replace(/onGenerateMoneda Local/g, 'onGeneratePix');
code = code.replace(/activeTab === 'Moneda Local'/g, "activeTab === 'pix'");
code = code.replace(/setActiveTab\('Moneda Local'\)/g, "setActiveTab('pix')");
code = code.replace(/Moneda LocalTotal/g, 'pixTotal');
code = code.replace(/'Moneda Local'/g, "'pix'");

fs.writeFileSync('src/pages/PlanosES.tsx', code);
