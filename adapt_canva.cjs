const fs = require('fs');

let html = fs.readFileSync('public/canva_inicio.html', 'utf8');

// The replacements for the "Por que escolher o Canva Viagem Elite?" section
const replacements = [
  {
    from: "Deixe seus designs ainda melhores com conteúdos premium e recursos aprimorados para agilizar seu trabalho.",
    to: "Acelere as vendas da sua agência com ferramentas exclusivas de inteligência artificial e um acervo premium focado no turismo."
  },
  {
    from: "Crie designs sem limites",
    to: "Fábrica de Anúncios Ilimitada"
  },
  {
    from: "Crie conteúdos profissionais impecáveis com rapidez. Aproveite modelos premium e tenha acesso ilimitado a mais de 100 milhões de fotos, elementos gráficos, vídeos, fontes, faixas de áudio e muito mais.",
    to: "Crie campanhas e ofertas irresistíveis em segundos. Digite o destino, preço e parcelas, e nossa inteligência artificial gera o anúncio completo com a sua identidade visual pronta para atrair viajantes de alto padrão."
  },
  {
    from: "Consolide sua marca",
    to: "Sites de Vendas e Roteiros"
  },
  {
    from: "Mantenha a consistência da sua marca usando recursos para definir as cores, logotipos e fontes dela. Crie diretrizes para os recursos da marca e defina o que pode e o que não pode ser editado nos modelos da sua equipe.",
    to: "Pare de perder tempo com PDFs amadores. O Criador Automático gera páginas de vendas profissionais para cada um dos seus roteiros de viagem em poucos cliques, garantindo máxima conversão no celular."
  },
  {
    from: "Faça mais em menos tempo",
    to: "Mais de 400 Mídias 4K Exclusivas"
  },
  {
    from: "Seja publicando uma imagem em várias plataformas sociais com o Redimensionamento Mágico ou removendo o fundo de um vídeo em um clique, o Canva acelera seus processos para você ter mais tempo.",
    to: "Tenha acesso imediato a um acervo gigantesco de vídeos de destinos nacionais e internacionais. Atualizado semanalmente para que o seu feed no Instagram nunca fique desatualizado ou sem engajamento."
  },
  {
    from: "Trabalhe em um só lugar",
    to: "Legendas Magnéticas com IA"
  },
  {
    from: "Centralize os fluxos de trabalho usando integrações de apps que a sua equipe já adora, como o Google Drive, SharePoint e Microsoft 365.",
    to: "Nunca mais sofra com bloqueio criativo. Nossa IA escreve legendas persuasivas e scripts de WhatsApp focados em conversão, para que você apenas copie, cole e comece a fechar pacotes no mesmo dia."
  }
];

let replacedCount = 0;
for (const r of replacements) {
  if (html.includes(r.from)) {
    html = html.replace(r.from, r.to);
    replacedCount++;
  } else {
    console.log(`Could not find: "${r.from}"`);
  }
}

fs.writeFileSync('public/canva_inicio.html', html);
console.log(`Done. Replaced ${replacedCount} items.`);
