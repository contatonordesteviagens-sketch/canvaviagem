const fs = require('fs');
let code = fs.readFileSync('src/components/Header.tsx', 'utf8');

if (!code.includes('{ to: "/downloads", label: "Downloads", icon: Download }')) {
  code = code.replace(
    'const userNavItems = user ? [',
    'const userNavItems = user ? [\n    { to: "/downloads", label: "Downloads", icon: Download },'
  );
  fs.writeFileSync('src/components/Header.tsx', code, 'utf8');
}
