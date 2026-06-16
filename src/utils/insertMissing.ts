import { supabase } from '../integrations/supabase/client';

export async function insertMissingCaptions() {
  const { data: videos } = await supabase.from('content_items').select('*').in('type', ['video', 'seasonal']);
  const { data: captions } = await supabase.from('captions').select('*');
  
  if (!videos || !captions) return;

  const unmatchedTitles = new Set<string>();
  
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
  for (const title of Array.from(unmatchedTitles)) {
    let text = `Descubra mais sobre ${title}!\n\nPlaneje sua próxima aventura conosco e viva experiências inesquecíveis. Cuidamos de todos os detalhes para que você apenas aproveite cada momento.\n\nEntre em contato e saiba mais!`;
    let hashtags = `#viagem #${title.replace(/\s+/g, '')} #agenciadeviagens #turismo #ferias #explorar`;
    
    let tLower = title.toLowerCase();
    if (tLower.includes('namorado')) {
       text = `Surpreenda seu amor neste Mês dos Namorados! ❤️\n\nCelebre o amor com uma viagem inesquecível. Destinos românticos, jantares especiais e momentos únicos aguardam por vocês. Reserve já a sua escapada romântica!\n\nEntre em contato!`;
       hashtags = '#mesdosnamorados #viagemromantica #amor #agenciadeviagens #diadosnamorados';
    } else if (tLower.includes('black friday')) {
       text = `Aproveite as ofertas imperdíveis de Black Friday! 🖤✈️\n\nDescontos exclusivos para você realizar a viagem dos sonhos. Não perca a chance de voar mais pagando menos. Ofertas por tempo limitado!\n\nEntre em contato!`;
       hashtags = '#blackfriday #ofertasdeviagem #descontos #agenciadeviagens #promocao';
    } else if (tLower.includes('réveillon') || tLower.includes('reveillon')) {
       text = `Garanta seu Réveillon inesquecível! 🎆🥂\n\nComece o ano novo com o pé direito em um destino incrível. Festas exclusivas, ceias maravilhosas e muita energia positiva. Reserve agora!\n\nEntre em contato!`;
       hashtags = '#reveillon #anonovo #viagemdeanonovo #festas #agenciadeviagens';
    } else if (tLower.includes('carnaval')) {
       text = `Caia na folia no melhor Carnaval! 🎉🎭\n\nBloquinhos, praias, festas e muita alegria. Planeje seu feriado de Carnaval conosco e viva momentos de pura diversão!\n\nEntre em contato!`;
       hashtags = '#carnaval #feriado #folia #viagemdecarnaval #agenciadeviagens';
    } else if (tLower.includes('aeroporto') || tLower.includes('bagagem') || tLower.includes('stopover') || tLower.includes('itens proibidos')) {
       text = `Dicas de Ouro para a sua Viagem! 🧳✈️\n\nAqui na nossa agência, você viaja com tranquilidade. Confira essas dicas essenciais para evitar perrengues e aproveitar cada segundo da sua jornada!\n\nEntre em contato!`;
       hashtags = '#dicasdeviagem #aeroporto #bagagem #agenciadeviagens #turismo';
    }

    newCaptions.push({
      destination: title,
      text: text,
      hashtags: hashtags
    });
  }

  console.log(`Inserting ${newCaptions.length} missing captions...`);
  
  if (newCaptions.length > 0) {
    const { error } = await supabase.from('captions').insert(newCaptions);
    if (error) {
      console.error('Error inserting captions:', error);
    } else {
      console.log('Successfully inserted missing captions!');
    }
  }
}
