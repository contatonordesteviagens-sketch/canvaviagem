import { createClient } from '@supabase/supabase-js';
const supabase = createClient('https://zdjtcwtakgizbsbbwtgc.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpkanRjd3Rha2dpemJzYmJPd2RnYyIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNzY5MDMyMTIzLCJleHAiOjIwODQ2MDgxMjN9.juuc45o-OZbLQcx2LaMLyltRABAVy70kgJ_L_JXuEUs');

async function run() {
  const { data: videos, error: err1 } = await supabase.from('content_items').select('*').in('type', ['video', 'seasonal']);
  if (err1) console.error('Video fetch error:', err1);
  const { data: captions, error: err2 } = await supabase.from('captions').select('*');
  if (err2) console.error('Captions fetch error:', err2);
  
  if (!videos || !captions) return;
  
  const unmatchedTitles = new Set();
  
  for (const video of videos) {
    let match = captions.find(c => video.title.toLowerCase().includes(c.destination.toLowerCase().split(' - ')[0].toLowerCase()));
    if (!match) {
      match = captions.find(c => c.destination.toLowerCase().includes(video.title.toLowerCase().split(' ')[0].toLowerCase()));
    }
    if (!match) {
      unmatchedTitles.add(video.title);
    }
  }

  const newCaptions = [];
  for (const title of unmatchedTitles) {
    let text = `Descubra mais sobre ${title}!\n\nPlaneje sua proxima aventura conosco e viva experiencias inesqueciveis. Cuidamos de todos os detalhes para que voce apenas aproveite cada momento.\n\nEntre em contato e saiba mais!`;
    let hashtags = `#viagem #${title.replace(/\s+/g, '')} #agenciadeviagens #turismo #ferias #explorar`;
    
    let tLower = title.toLowerCase();
    if (tLower.includes('namorado')) {
       text = `Surpreenda seu amor neste Mes dos Namorados!\n\nCelebre o amor com uma viagem inesquecivel. Destinos romanticos, jantares especiais e momentos unicos aguardam por voces. Reserve ja a sua escapada romantica! \n\nEntre em contato!`;
       hashtags = '#mesdosnamorados #viagemromantica #amor #agenciadeviagens #diadosnamorados';
    } else if (tLower.includes('black friday')) {
       text = `Aproveite as ofertas imperdiveis de Black Friday!\n\nDescontos exclusivos para voce realizar a viagem dos sonhos. Nao perca a chance de voar mais pagando menos. Ofertas por tempo limitado!\n\nEntre em contato!`;
       hashtags = '#blackfriday #ofertasdeviagem #descontos #agenciadeviagens #promocao';
    } else if (tLower.includes('reveillon')) {
       text = `Garanta seu Reveillon inesquecivel!\n\nComece o ano novo com o pe direito em um destino incrivel. Festas exclusivas, ceias maravilhosas e muita energia positiva. Reserve agora! \n\nEntre em contato!`;
       hashtags = '#reveillon #anonovo #viagemdeanonovo #festas #agenciadeviagens';
    } else if (tLower.includes('carnaval')) {
       text = `Caia na folia no melhor Carnaval!\n\nBloquinhos, praias, festas e muita alegria. Planeje seu feriado de Carnaval conosco e viva momentos de pura diversao!\n\nEntre em contato!`;
       hashtags = '#carnaval #feriado #folia #viagemdecarnaval #agenciadeviagens';
    } else if (tLower.includes('aeroporto') || tLower.includes('bagagem') || tLower.includes('stopover') || tLower.includes('itens proibidos')) {
       text = `Dicas de Ouro para a sua Viagem!\n\nAqui na nossa agencia, voce viaja com tranquilidade. Confira essas dicas essenciais para evitar perrengues e aproveitar cada segundo da sua jornada!\n\nEntre em contato!`;
       hashtags = '#dicasdeviagem #aeroporto #bagagem #agenciadeviagens #turismo';
    }

    newCaptions.push({
      destination: title,
      text: text,
      hashtags: hashtags
    });
  }

  console.log(`Inserting ${newCaptions.length} captions...`);
  
  if (newCaptions.length > 0) {
    const { error } = await supabase.from('captions').insert(newCaptions);
    if (error) {
      console.error('Error inserting captions*', error);
    } else {
      console.log('Successfully inserted missing captions!');
    }
  }
}
run();
