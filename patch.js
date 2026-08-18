const fs = require('fs');
const p = 'supabase/functions/verify-magic-link/index.ts';
let c = fs.readFileSync(p, 'utf8');
c = c.replace('.eq("status", "active")', '.in("status", ["active", "trialing"])');
c = c.replace('status: "active", limit: 10', 'status: "all", limit: 10');
// Also need to correctly filter the stripe result!
c = c.replace(
  'const subscription = activeSubscriptions.data[0];',
  'const subscription = activeSubscriptions.data.find(s => s.status === "active" || s.status === "trialing");'
);
fs.writeFileSync(p, c);
