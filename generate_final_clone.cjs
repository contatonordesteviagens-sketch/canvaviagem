const fs = require('fs');

let html = fs.readFileSync('formatted.html', 'utf8');

// 1. Remove footer
html = html.replace(/<footer[\s\S]*?<\/footer>/gi, '');

// 2. Remove external links
html = html.replace(/href="https:\/\/www\.canva\.com[^"]*"/g, 'href="#"');
html = html.replace(/href="https:\/\/[^"]*canva\.com[^"]*"/g, 'href="#"');

// 3. Replace texts (Specific first)
html = html.replace(/Canva Pro/g, 'Canva Viagem Elite');
html = html.replace(/Crie designs profissionais/g, 'Crie conteúdos profissionais de viagens');
html = html.replace(/Eleve o nível do seu trabalho com os recursos premium e as ferramentas de IA do Canva Pro/g, 'Transforme sua agência de viagens com o Canva Viagem. 400 mídias de viagens, criador de anúncios, CRM e Agentes IA.');
html = html.replace(/Uma solução completa para criar e gerenciar seu trabalho\. Acesse conteúdos premium, ferramentas da marca e recursos de IA para alcançar suas metas mais rápido\./g, 'A plataforma definitiva para Agências de Viagens. Acesse o Construtor de Sites, Criador de Anúncios e centenas de mídias prontas.');
html = html.replace(/Por que escolher o Canva Pro\?/g, 'Por que escolher o Canva Viagem Elite?');
html = html.replace(/Deixe seus designs ainda melhores com conteúdos premium e recursos aprimorados para agilizar seu trabalho\./g, 'Escale suas vendas com nossas ferramentas de IA exclusivas e templates criados para o mercado de turismo.');
html = html.replace(/Ferramentas profissionais para todas as tarefas/g, 'Ferramentas de IA para impulsionar suas Vendas');
html = html.replace(/Kits de marca/g, 'Construtor de Sites');
html = html.replace(/Desenvolva sua marca com suas cores, fontes e logotipos em um só lugar\./g, 'Crie sites de alta conversão para sua agência de turismo em minutos.');
html = html.replace(/Inspiração para anúncios/g, 'Agentes de Inteligência Artificial');
html = html.replace(/Inspire-se nas principais marcas usando a biblioteca de exemplos de práticas recomendadas do Canva Marketing e crie seu próprio anúncio em minutos\./g, 'Utilize nossos agentes IA para fechar vendas no WhatsApp 24h por dia.');
html = html.replace(/Criação de anúncios com IA/g, 'Criador de Anúncios & CRM');
html = html.replace(/Insira seu site e aproveite a magia do Canva Marketing: ele extrai as imagens e informações da sua marca para criar anúncios de alto desempenho em segundos\./g, 'Gere campanhas automáticas de alta conversão para Instagram e gerencie leads no nosso CRM exclusivo.');
html = html.replace(/Ferramentas premium/g, 'Ferramentas Elite');
html = html.replace(/O Canva Pro é para quem\?/g, 'Para quem é o Canva Viagem Elite?');
html = html.replace(/Acesso a todo o conteúdo premium e ferramentas exclusivas\./g, 'Tudo que você precisa para decolar sua agência de turismo.');
html = html.replace(/Experimente o Canva Pro de graça/g, 'Comece com o Canva Viagem');
html = html.replace(/Teste grátis por 30 dias/g, 'Acesso Imediato');
html = html.replace(/Recursos Pro para todas as suas necessidades de design/g, 'Recursos Elite para todas as necessidades da sua agência');
html = html.replace(/Modelos premium/g, 'Templates de Alta Conversão');
html = html.replace(/Com o Canva Pro, você tem acesso a mais de 100 milhões de fotos, vídeos, arquivos de áudio e gráficos premium/g, 'Acesse +400 mídias de turismo e atualizações semanais com os melhores destinos');
html = html.replace(/Identidade Visual/g, 'Inteligência Artificial');
html = html.replace(/Ferramentas Mágicas/g, 'Agentes Inteligentes');
html = html.replace(/Removedor de Fundo/g, 'Atendimento 24h');
html = html.replace(/Para uso individual ou de pequenas equipes/g, 'Para consultores e agências de viagens de todos os tamanhos');
html = html.replace(/Comparar todos os recursos/g, 'Ver todos os nossos recursos');
html = html.replace(/Compare o Canva Grátis com o Canva Pro/g, 'Transforme seu jeito de vender viagens');

// Replacing menu items
html = html.replace(/>Design digital</g, '>400 Mídias de Viagens<');
html = html.replace(/>Imprimir design</g, '>Criador de Anúncios<');
html = html.replace(/>Vídeos e áudios</g, '>CRM Integrado<');
html = html.replace(/>Canva IA</g, '>Agentes IA<');
html = html.replace(/>Produto</g, '>CRM<');
html = html.replace(/>Planos</g, '>Assinaturas<');
html = html.replace(/>Negócios</g, '>Canva Viagem Start<');
html = html.replace(/>Educação</g, '>Canva Viagem Elite<');
html = html.replace(/>Ajuda</g, '>Suporte<');
html = html.replace(/>Apresentações</g, '>Posts para Instagram<');
html = html.replace(/>Redes sociais</g, '>Carrosséis<');
html = html.replace(/>Editor de fotos</g, '>Vídeos Virais<');
html = html.replace(/>Produtos para impressão</g, '>Gerenciador de Leads<');
html = html.replace(/>Sites</g, '>Funis de Vendas<');

// Replace top mockup image with the user's image
html = html.replace(/images\/547\.5x526\.2_pt-BR(_[0-9]+)?\.png/g, '/site-canva-viagem.webp');
html = html.replace(/Sua solução de design completa/g, 'Sua solução completa de marketing para turismo');

// Add a specific css snippet to hide large empty spaces if any
html = html.replace(/<\/head>/, `<style>
    footer { display: none !important; }
    .footer-wrapper { display: none !important; }
</style></head>`);

fs.writeFileSync('public/canva_inicio.html', html);
console.log("Success");
