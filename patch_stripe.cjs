const fs = require('fs');
const path = 'c:/Users/win 10/Desktop/CANVA E FABRICA - JUNHO 26/supabase/functions/stripe-dashboard/index.ts';
let code = fs.readFileSync(path, 'utf8');

const fetchAllFn = `
async function fetchAll(stripeCall) {
  const items = [];
  for await (const item of stripeCall) {
    items.push(item);
  }
  return items;
}
`;

code = code.replace('// ============ STRIPE DATA FETCH ============', fetchAllFn + '\n    // ============ STRIPE DATA FETCH ============');

code = code.replace(/await stripe\.subscriptions\.list\(([^)]+)\)/g, 'await fetchAll(stripe.subscriptions.list($1))');
code = code.replace(/await stripe\.customers\.list\(([^)]+)\)/g, 'await fetchAll(stripe.customers.list($1))');
code = code.replace(/await stripe\.invoices\.list\(([^)]+)\)/g, 'await fetchAll(stripe.invoices.list($1))');

// The original code used variables like `activeSubscriptions.data`. Since `fetchAll` returns an array directly, we need to replace `.data`.
code = code.replace(/activeSubscriptions\.data/g, 'activeSubscriptions');
code = code.replace(/allSubscriptions\.data/g, 'allSubscriptions');
code = code.replace(/canceledSubscriptions\.data/g, 'canceledSubscriptions');
code = code.replace(/trialingSubscriptions\.data/g, 'trialingSubscriptions');
code = code.replace(/customers\.data/g, 'customers');
code = code.replace(/invoices\.data/g, 'invoices');
code = code.replace(/allPaidInvoices\.data/g, 'allPaidInvoices');
code = code.replace(/recentInvoices\.data/g, 'recentInvoices');

fs.writeFileSync(path, code);
