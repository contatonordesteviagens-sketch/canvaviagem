import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://zdjtcwtakgizbsbbwtgc.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpkanRjd3Rha2dpemJzYmJ3dGdjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkwMzIxMjMsImV4cCI6MjA4NDYwODEyM30.juuc45o-OZbLQcx2LaMLyltRABAVy70kgJ_L_JXeUEs";

const supabase = createClient(supabaseUrl, supabaseKey);

async function runMigration() {
  console.log('🔍 Buscando todos os vídeos e sazonais disponíveis no banco para inspeção de títulos...');
  
  const { data: allItems, error: fetchErr } = await supabase
    .from('content_items')
    .select('id, title, type')
    .in('type', ['video', 'seasonal']);

  if (fetchErr) {
    console.error('❌ Erro ao buscar itens:', fetchErr);
    return;
  }

  // Vamos procurar por palavras-chave chave no banco para Férias & Alta Temporada
  const keywords = [
    { key: "Jericoacoara", highlighted: true },
    { key: "Cancún", highlighted: true },
    { key: "Resort All inclusive", highlighted: true },
    { key: "Porto de Galinhas", highlighted: false },
    { key: "Canoa Quebrada", highlighted: false },
    { key: "Orlando", highlighted: false },
    { key: "Destino dos sonhos", highlighted: false },
    { key: "Rio de Janeiro", highlighted: false },
    { key: "Florianópolis", highlighted: false },
    { key: "Noronha", highlighted: false },
    { key: "Maragogi", highlighted: false },
    { key: "Maceió", highlighted: false },
    { key: "Punta Cana", highlighted: false },
    { key: "Recife", highlighted: false }
  ];

  console.log('\n☀️ Promovendo vídeos para Férias & Alta Temporada (is_featured = true)...');
  let promotedCount = 0;
  
  for (const item of allItems || []) {
    // Verificar se título tem Copa ou Futebol
    if (item.title.toLowerCase().includes('copa') || item.title.toLowerCase().includes('futebol') || item.title.toLowerCase().includes('seleções')) {
      await supabase.from('content_items').update({ is_featured: false, is_highlighted: false }).eq('id', item.id);
      console.log(`🧹 Garantido desativado: "${item.title}"`);
      continue;
    }

    // Verificar se o item bate com alguma keyword de férias/alta temporada
    for (let i = 0; i < keywords.length; i++) {
      const kw = keywords[i];
      if (item.title.toLowerCase().includes(kw.key.toLowerCase())) {
        if (promotedCount < 10) {
          promotedCount++;
          const { error: updateErr } = await supabase
            .from('content_items')
            .update({
              is_featured: true,
              is_highlighted: kw.highlighted,
              display_order: promotedCount,
              is_active: true
            })
            .eq('id', item.id);

          if (updateErr) {
            console.error(`❌ Erro ao promover "${item.title}":`, updateErr);
          } else {
            console.log(`✅ Promovido [#${promotedCount}]: "${item.title}" (featured: true, highlighted: ${kw.highlighted})`);
          }
          break;
        }
      }
    }
  }

  console.log(`\n🎉 Migração atualizada! Total de itens promovidos no banco: ${promotedCount}`);
}

runMigration();
