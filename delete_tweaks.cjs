const fs = require('fs');
const dotenvVars = fs.readFileSync('.env.local', 'utf-8')
  .split('\n')
  .filter(l => l.trim() && !l.trim().startsWith('#'))
  .reduce((acc, l) => {
    const [k, ...v] = l.split('=');
    acc[k.trim()] = v.join('=').trim().replace(/^['"]|['"]$/g, '');
    return acc;
  }, {});
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(dotenvVars.VITE_SUPABASE_URL, dotenvVars.VITE_SUPABASE_ANON_KEY);
supabase.from('fabrica_art_tweak_presets').delete().neq('id', 'dummy').then(r => { console.log('Deleted:', r); process.exit(0); }).catch(e => console.error(e));
