import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://zdjtcwtakgizbsbbwtgc.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpkanRjd3Rha2dpemJzYmJ3dGdjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkwMzIxMjMsImV4cCI6MjA4NDYwODEyM30.juuc45o-OZbLQcx2LaMLyltRABAVy70kgJ_L_JXeUEs'
);

async function run() {
  console.log('Fetching existing tools...');
  const { data: existingTools } = await supabase.from('marketing_tools').select('*');
  
  // Identify the ones to KEEP
  const keepTitles = ["IA Vendedor de Viagens", "Narração de Ofertas de Viagens"];
  
  for (const tool of existingTools) {
    if (!keepTitles.some(t => tool.title.includes(t)) && tool.is_active) {
      console.log(`Deactivating: ${tool.title}`);
      await supabase.from('marketing_tools').update({ is_active: false }).eq('id', tool.id);
    }
  }
  
  const newAgents = [
    {
      title: 'Planejador de Viagens e Orçamento',
      description: 'Organize roteiros completos e orçamentos para voos e estadias',
      icon: '✈️',
      url: 'https://chatgpt.com/g/g-r8SGCXKNZ-travel-guidetrip-planner-budget-therapy-flights',
      is_new: true,
      is_active: true,
      display_order: 2,
      language: 'pt'
    },
    {
      title: 'Criador de Reels de Viagem Viral',
      description: 'Desenvolva roteiros persuasivos e virais para Instagram e TikTok',
      icon: '📱',
      url: 'https://chatgpt.com/g/g-6851247efce881918e6a24af2dda817f-travelogpt',
      is_new: true,
      is_active: true,
      display_order: 3,
      language: 'pt'
    },
    {
      title: 'Especialista em MKT de Viagens',
      description: 'Agente avançado especialista em estratégias de marketing digital',
      icon: '📈',
      url: 'https://chatgpt.com/g/g-wSNbQvXiW-kokomo-s-travel-marketing-maven',
      is_new: true,
      is_active: true,
      display_order: 4,
      language: 'pt'
    },
    {
      title: 'MKT de Viagens de Luxo',
      description: 'Estratégias de vendas exclusivas para atrair o público de alto padrão',
      icon: '💎',
      url: 'https://chatgpt.com/g/g-69da78b2a00881919aee189836db975a-luxury-travel-marketing-copilot',
      is_new: true,
      is_active: true,
      display_order: 5,
      language: 'pt'
    },
    {
      title: 'Planejamento de Reels',
      description: 'Estruture o seu calendário de vídeos e conteúdo passo a passo',
      icon: '🎬',
      url: 'https://chatgpt.com/g/g-69b17250b3448191b799a5b0e5414b5a-travel-reel-studio',
      is_new: true,
      is_active: true,
      display_order: 6,
      language: 'pt'
    },
    {
      title: 'MKT de Viagens B2B',
      description: 'Abordagens comerciais precisas para atrair clientes e empresas corporativas',
      icon: '💼',
      url: 'https://chatgpt.com/g/g-69d8bcd147048191ae8cad3fe0137a6e-marketing-manager-why-not-travel',
      is_new: true,
      is_active: true,
      display_order: 7,
      language: 'pt'
    }
  ];
  
  for (const agent of newAgents) {
    console.log(`Inserting: ${agent.title}`);
    await supabase.from('marketing_tools').insert(agent);
  }
  
  console.log('Done!');
}

run();
