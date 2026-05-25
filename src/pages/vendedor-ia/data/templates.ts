export interface TemplateScript {
  title: string;
  content: string;
  technique: string;
  learning: string;
}

export interface TemplateCategory {
  id: string;
  title: string;
  icon: string;
  scripts: TemplateScript[];
}

export const SALES_TEMPLATES: TemplateCategory[] = [
  {
    id: 'abertura',
    title: '1. Abertura do Atendimento',
    icon: '👋',
    scripts: [
      { title: 'Curiosidade Ativa', content: 'Oi [Nome]! Vi seu interesse em [Destino] e separei algo curioso aqui.\n\nVc já conhece a região ou é sua primeira vez planejando essa viagem?', technique: 'Gatilho da Curiosidade', learning: '🧠 Abre um loop mental que exige resposta.' },
      { title: 'Acolhimento Especialista', content: 'Olá [Nome]! Tudo bem? Recebi seu pedido sobre [Destino]. 😊\n\nVc busca algo mais relaxante ou quer aproveitar pra conhecer todos os pontos turísticos?', technique: 'Filtro de Perfil', learning: '🧠 Mostra consultoria e não apenas venda de passagem.' },
      { title: 'Quebra de Gelo Humana', content: 'Oi [Nome]! Que escolha incrível de destino! 😍\n\nPara eu te mandar as melhores opções, vc viaja sozinho ou acompanhado?', technique: 'Sondagem Inicial', learning: '🧠 Pergunta de baixo atrito para iniciar o fluxo.' },
      { title: 'Agilidade VIP', content: 'Oi! Sou [Seu Nome]. Já estou com o sistema aberto aqui pra vc.\n\nQual seria a data ideal pra sua partida ou as datas são flexíveis?', technique: 'Prontidão de Atendimento', learning: '🧠 Transmite autoridade e agilidade imediata.' },
      { title: 'Conexão por Destino', content: 'Oi [Nome]! Sabia que [Destino] está com uma procura enorme pra essa data?\n\nVc já tem um hotel em mente ou quer que eu te sugira os melhores custos-benefícios?', technique: 'Gatilho de Escassez', learning: '🧠 Alerta o cérebro reptiliano sobre a alta demanda.' },
      { title: 'Abordagem Direta', content: 'Olá! Que prazer te atender. Vi que vc quer ir para [Destino]. 😊\n\nVc prefere voos diretos ou escalas mais baratas funcionam pra vc?', technique: 'Escolha Binária', learning: '🧠 Facilita a decisão inicial do cliente.' },
      { title: 'Entusiasmo Contagiante', content: 'Oi [Nome]! Acabei de voltar de um treinamento sobre [Destino].\n\nVc quer as opções padrão ou prefere saber dos segredos que só quem é especialista conhece?', technique: 'Gatilho de Exclusividade', learning: '🧠 Posiciona vc como detentor de informação privilegiada.' },
      { title: 'Retorno Amigável', content: 'Oi [Nome], tudo bem? Recebi sua mensagem sobre as passagens.\n\nVc já tem uma média de orçamento ou quer que eu busque a melhor oferta do dia?', technique: 'Ancoragem de Expectativa', learning: '🧠 Ajuda a qualificar o cliente sem ser invasivo.' },
      { title: 'Simplicidade Eficiente', content: 'Oi! Recebi seu interesse. Para ganhar tempo, vc prefere falar por aqui ou uma ligação rápida de 2 min ajuda mais?', technique: 'Controle de Canal', learning: '🧠 Dá poder de escolha ao cliente enquanto busca eficiência.' },
      { title: 'Foco no Sonho', content: 'Olá! Que viagem fantástica vc está planejando! ✨\n\nEssa viagem é pra comemorar algo especial ou é aquele descanso merecido?', technique: 'Busca do Porquê', learning: '🧠 Ativa o sistema límbico (emoção) logo de cara.' }
    ]
  },
  {
    id: 'conexao',
    title: '2. Conexão & Rapport',
    icon: '❤️',
    scripts: [
      { title: 'Empatia de Viajante', content: 'Te entendo perfeitamente, [Nome]. Planejar viagem dá um frio na barriga, né?\n\nO que é mais importante pra vc hoje: conforto total ou o melhor preço possível?', technique: 'Validação Emocional', learning: '🧠 Gera espelhamento de sentimentos.' },
      { title: 'Futuro Desejado', content: 'Imagine vc já lá em [Destino], sem se preocupar com nada, só aproveitando...\n\nQual é a primeira coisa que vc quer fazer quando chegar lá?', technique: 'Future Pacing', learning: '🧠 Faz o cérebro "viver" a experiência antes de pagar.' },
      { title: 'Cuidado Consultivo', content: 'Eu cuido de cada detalhe como se fosse a minha própria viagem, sabe?\n\nVc prefere que eu foque na localização ou na estrutura do hotel?', technique: 'Gatilho de Reciprocidade', learning: '🧠 Cria um vínculo de confiança e zelo.' },
      { title: 'Espelhamento de Ritmo', content: 'Pelo que vc me disse, vc gosta de praticidade, certo?\n\nPrefere que eu te mande o PDF completo ou quer que eu explique os pontos principais por áudio?', technique: 'Adaptação de Canal', learning: '🧠 Respeita o estilo de processamento do cliente.' },
      { title: 'Segurança Familiar', content: 'Como vc vai com a família, minha prioridade é a segurança e o conforto deles.\n\nVc faz questão de hotel com área kids ou um lugar mais silencioso é melhor?', technique: 'Cérebro Reptiliano (Proteção)', learning: '🧠 Foca no instinto de proteção familiar.' },
      { title: 'Reconhecimento de Estilo', content: 'Vi que vc tem bom gosto, [Destino] é para quem aprecia o melhor da vida.\n\nVc busca experiências gastronômicas ou prefere passeios históricos?', technique: 'Elogio Implícito', learning: '🧠 Eleva a autoestima do cliente e gera conexão.' },
      { title: 'Partilha de Valor', content: 'Eu também amo esse destino, é renovador! ✨\n\nVc quer que eu inclua aquele passeio secreto que quase ninguém conhece no roteiro?', technique: 'Gatilho de Pertencimento', learning: '🧠 Cria uma "comunidade" entre vc e o cliente.' },
      { title: 'Alívio de Stress', content: 'Deixa a parte chata da burocracia comigo, vc só precisa escolher a mala.\n\nFaz sentido pra vc eu já deixar tudo pré-agendado pra evitar filas?', technique: 'Redução de Atrito', learning: '🧠 Vende conveniência, não apenas produto.' },
      { title: 'Escuta Ativa', content: 'Entendi o que vc busca. Se eu encontrar algo que une esse conforto com um preço menor, vc quer ver agora?', technique: 'Gatilho de Oportunidade', learning: '🧠 Mostra que vc está "caçando" o melhor pra ele.' },
      { title: 'Validação de Sonho', content: 'Essa viagem tem tudo pra ser a melhor da sua vida. 🌟\n\nO que te deixaria mais feliz: um upgrade de quarto ou um jantar de boas-vindas?', technique: 'Foco no Benefício', learning: '🧠 Direciona o pensamento para o ganho emocional.' }
    ]
  },
  {
    id: 'autoridade',
    title: '3. Autoridade Profissional',
    icon: '🎓',
    scripts: [
      { title: 'Especialista em Logística', content: 'Eu já emiti mais de [X] passagens para esse destino só este mês.\n\nQuer que eu use minha experiência pra evitar as conexões mais cansativas pra vc?', technique: 'Prova Social + Autoridade', learning: '🧠 Números geram confiança imediata.' },
      { title: 'Consultoria de Riscos', content: 'Meu trabalho é garantir que nada dê errado enquanto vc relaxa.\n\nVc prefere o seguro viagem básico ou o que cobre cancelamentos de última hora?', technique: 'Prevenção de Perda', learning: '🧠 Posiciona vc como protetor do investimento do cliente.' },
      { title: 'Acesso Exclusivo', content: 'Tenho um canal direto com os fornecedores em [Destino] que sites comuns não têm.\n\nQuer que eu tente um benefício exclusivo pra sua reserva hoje?', technique: 'Gatilho de Exclusividade', learning: '🧠 Diferencia vc de plataformas de autoatendimento.' },
      { title: 'Segurança 24h', content: 'Viajar comigo é ter um especialista no seu bolso 24h por dia.\n\nSe o voo atrasar, quem resolve sou eu, não vc. Isso te traz mais tranquilidade?', technique: 'Venda de Suporte', learning: '🧠 Resolve o medo do desamparo em viagens.' },
      { title: 'Conhecimento Técnico', content: 'Muitos sites escondem taxas, mas aqui vc tem clareza total de cada centavo.\n\nVc prefere a tarifa que permite bagagem despachada ou só a de mão?', technique: 'Transparência Radical', learning: '🧠 Constrói autoridade através da ética e clareza.' },
      { title: 'Curadoria de Elite', content: 'Eu filtrei as 3 melhores opções entre 50 disponíveis, pra vc não perder tempo.\n\nPodemos analisar a que tem o melhor custo-benefício agora?', technique: 'Redução de Carga Cognitiva', learning: '🧠 Vende seu tempo e critério como valor.' },
      { title: 'Histórico de Sucesso', content: 'Acabei de resolver uma situação parecida para outro cliente e ele está amando a viagem.\n\nVc quer seguir pelo caminho que eu sei que não tem erro?', technique: 'Prova Social Indireta', learning: '🧠 Usa o sucesso de outros para validar a sugestão.' },
      { title: 'Certificação de Qualidade', content: 'Trabalho apenas com hotéis inspecionados pessoalmente ou por nossa rede.\n\nQualidade é inegociável pra vc também, certo?', technique: 'Ancoragem de Padrão', learning: '🧠 Define um padrão alto que sites de desconto não batem.' },
      { title: 'Expertise em Tarifas', content: 'Existem 12 tipos de tarifas para esse voo. Eu achei a única que permite remarcação sem multa.\n\nFlexibilidade é importante pra vc nessa viagem?', technique: 'Demonstração de Domínio', learning: '🧠 Mostra que vc conhece o que o cliente nem sabia que existia.' },
      { title: 'Liderança no Atendimento', content: 'Como seu consultor, minha recomendação técnica é a Opção B.\n\nQuer que eu te explique por que ela é mais segura a longo prazo?', technique: 'Recomendação Assertiva', learning: '🧠 Líderes recomendam, vendedores apenas mostram.' }
    ]
  },
  {
    id: 'valor_preco',
    title: '4. Valor vs Preço',
    icon: '⚖️',
    scripts: [
      { title: 'Fatiamento (Cafézinho)', content: 'O investimento total parece grande, mas veja só: são apenas R$ [Valor] por dia de viagem.\n\nMenos que um jantar fora pra garantir memórias pra vida toda. Faz sentido pra vc?', technique: 'Salami Slicing', learning: '🧠 Diminui a percepção de custo ao fragmentar o valor.' },
      { title: 'Investimento em Memória', content: 'Dinheiro a gente recupera, mas o tempo com seus filhos em [Destino] não volta.\n\nO que vale mais pra vc hoje: economizar R$ 200 ou ter a foto perfeita com eles?', technique: 'Aversão à Perda de Tempo', learning: '🧠 Toca na dor emocional da perda de momentos.' },
      { title: 'Custo do Barato', content: 'O barato na internet muitas vezes sai caro em taxas escondidas e falta de suporte.\n\nVc prefere o menor preço ou a garantia de que não terá gastos extras lá?', technique: 'Educação de Consumo', learning: '🧠 Alerta sobre o perigo de focar apenas no preço nominal.' },
      { title: 'O "Sanduíche"', content: 'Nesse valor está incluso o voo premium, hotel 4 estrelas e meu suporte VIP.\n\nConsiderando todos esses benefícios, o preço ficou dentro do que vc esperava?', technique: 'Price Sandwich', learning: '🧠 Envolve o preço entre benefícios para suavizar o impacto.' },
      { title: 'Seguro Contra Stress', content: 'A diferença de preço é o valor da sua paz de espírito se algo der errado.\n\nVale a pena arriscar suas férias por essa diferença de valor?', technique: 'Venda de Segurança', learning: '🧠 Posiciona o preço extra como um investimento em proteção.' },
      { title: 'Comparação Injusta', content: 'Comparar meu serviço com um site de buscas é como comparar um alfaiate com uma loja de departamento.\n\nVc prefere algo sob medida pra vc ou o que todo mundo compra?', technique: 'Diferenciação por Qualidade', learning: '🧠 Ancoragem em exclusividade e personalização.' },
      { title: 'Valor do Tempo', content: 'Quanto vale as 10 horas que vc gastaria pesquisando e que eu já resolvi pra vc?\n\nPodemos focar agora em como vc vai aproveitar esse tempo extra?', technique: 'Venda de Tempo', learning: '🧠 O tempo é o ativo mais escasso do cliente moderno.' },
      { title: 'Numerologia de Prestígio', content: 'Consegui fechar por 12x de R$ 497. Note que é menos de 500 por mês.\n\nFica confortável pra vc pagar essa parcela e ainda ter fôlego pra gastar lá?', technique: 'Ancoragem de Parcela', learning: '🧠 O cérebro foca no primeiro dígito (4 vs 5).' },
      { title: 'Diferencial de Entrega', content: 'O preço é o que vc paga, o valor é o que vc recebe. E vc está recebendo o melhor.\n\nPrefere garantir essa qualidade agora ou arriscar com o básico?', technique: 'Frase de Autoridade', learning: '🧠 Usa clichês de vendas poderosos para validar o preço.' },
      { title: 'Ancoragem de Lote', content: 'Esse é o último lote com essa tarifa. Amanhã o preço sobe R$ 300.\n\nQuer garantir o preço antigo hoje ou prefere esperar e pagar o novo?', technique: 'Urgência Financeira', learning: '🧠 Cria uma justificativa lógica para o fechamento imediato.' }
    ]
  },
  {
    id: 'objecoes',
    title: '5. Matador de Objeções',
    icon: '🛡️',
    scripts: [
      { title: 'Isolamento (Vou ver com o sócio)', content: 'Entendo, decisões assim precisam de consenso. Mas me diga, vc gostou do que eu montei?\n\nSe ele der o ok, podemos emitir hoje mesmo?', technique: 'Isolamento de Objeção', learning: '🧠 Descobre se a objeção é real ou apenas uma desculpa.' },
      { title: 'Achei mais barato', content: 'Poxa, que bom que vc achou! Mas vc conferiu se as taxas e a bagagem estão inclusas?\n\nQuer que eu analise pra vc se esse preço é real ou tem "pegadinha"?', technique: 'Aikido Verbal', learning: '🧠 Usa a força do oponente (o preço baixo) para mostrar seu valor.' },
      { title: 'Vou pensar', content: 'Claro, pensar é importante. Mas o que exatamente te deixou com dúvida: o roteiro ou o investimento?\n\nPergunto pra eu tentar ajustar o que está faltando pra vc!', technique: 'Sondagem de Dúvida', learning: '🧠 Não aceita o "vou pensar" passivamente.' },
      { title: 'Está caro', content: 'Caro comparado a quê? Se eu te mostrar que o retorno desse investimento em prazer é maior, vc reconsidera?\n\nPodemos ver uma opção com um dia a menos pra encaixar no seu bolso?', technique: 'Reenquadramento', learning: '🧠 Desafia a percepção de valor sem ser agressivo.' },
      { title: 'Medo de Viajar', content: 'É normal ter receio em destinos novos. Por isso eu te acompanho pelo WhatsApp o tempo todo.\n\nIsso te deixa mais seguro pra gente seguir com a reserva?', technique: 'Mitigação de Risco', learning: '🧠 Transforma o medo em confiança no serviço.' },
      { title: 'Falta de Tempo', content: 'Justamente por vc estar sem tempo que eu fiz todo o trabalho pesado.\n\nVc só precisa me dar o "ok" e o resto é comigo. Podemos fechar assim?', technique: 'Solução de Conveniência', learning: '🧠 Usa a própria objeção como motivo de compra.' },
      { title: 'Comparação de Agências', content: 'Outras agências vendem pacotes, eu vendo experiências sem erros.\n\nVc prefere ser mais um número ou ter um consultor dedicado ao seu sonho?', technique: 'Gatilho de Exclusividade', learning: '🧠 Ataca a concorrência focando no atendimento.' },
      { title: 'Data Incerta', content: 'Se a dúvida é a data, podemos fechar uma tarifa flexível com alteração grátis.\n\nEssa segurança resolve o seu problema pra fecharmos agora?', technique: 'Remoção de Obstáculo', learning: '🧠 Oferece uma ponte segura para o fechamento.' },
      { title: 'Orçamento Estourado', content: 'Poxa, entendo. Vamos fazer o seguinte: eu tiro o [Item Opcional] e o valor cai R$ 400.\n\nFica melhor pra vc assim ou prefere parcelar em mais vezes?', technique: 'Concessão Planejada', learning: '🧠 Mostra flexibilidade para ajudar o cliente.' },
      { title: 'Dúvida do Destino', content: 'Dúvida entre [Destino A] e [Destino B]? Vamos ver qual deles tem o melhor clima na sua data?\n\nSe eu te provar que o A é melhor agora, fechamos o roteiro?', technique: 'Fechamento Condicional', learning: '🧠 Usa dados lógicos para resolver indecisão emocional.' }
    ]
  },
  {
    id: 'fechamento',
    title: '6. Fechamento Direto',
    icon: '🚀',
    scripts: [
      { title: 'Duplo Vínculo', content: 'Excelente escolha! Vai ser uma viagem inesquecível. ✨\n\nVc prefere que eu emita no seu CPF ou no da empresa?\n\nE o pagamento, fica melhor no Pix ou Cartão?', technique: 'Double Bind', learning: '🧠 Não dá a opção de não comprar, apenas de como pagar.' },
      { title: 'Fechamento Presuntivo', content: 'Já deixei os nomes pré-bloqueados aqui pra não perdermos essa tarifa.\n\nPosso te mandar o link de pagamento agora ou prefere que eu ligue pra passar os dados?', technique: 'Assumptive Close', learning: '🧠 Age como se a venda já estivesse feita.' },
      { title: 'Escassez de Tempo', content: '[Nome], essa tarifa expira em 30 minutos e só tenho mais 2 lugares.\n\nGaranto sua reserva agora ou deixamos para a próxima oportunidade (com preço novo)?', technique: 'Gatilho de Escassez', learning: '🧠 Força uma decisão rápida pelo medo da perda.' },
      { title: 'Bônus de Fechamento', content: 'Se fecharmos nos próximos 15 minutos, eu consigo te dar o transfer cortesia.\n\nPodemos bater o martelo agora pra eu garantir esse presente pra vc?', technique: 'Gatilho de Reciprocidade', learning: '🧠 Recompensa a decisão rápida com um ganho extra.' },
      { title: 'Próximo Passo', content: 'O roteiro está perfeito e o preço está excelente. Só falta sua assinatura.\n\nMe manda a foto do seu documento pra eu gerar o contrato?', technique: 'Condução por Etapas', learning: '🧠 Simplifica o fechamento em uma tarefa pequena.' },
      { title: 'Resumo da Vitória', content: 'Voo direto, hotel top, preço promocional e suporte VIP. Tudo pronto!\n\nPosso gerar o link de pagamento ou vc tem mais alguma dúvida pequena?', technique: 'Checklist de Aprovação', learning: '🧠 Resume os ganhos para validar a decisão.' },
      { title: 'Gatilho de Grupo', content: 'Acabei de fechar outros 3 casais para esse mesmo hotel hoje.\n\nQuer garantir sua vaga antes que o hotel dê "sold out" pros brasileiros?', technique: 'Prova Social + Medo', learning: '🧠 Usa o comportamento de outros como prova de que é bom.' },
      { title: 'Pergunta Final', content: 'Tudo certo com o roteiro e com o valor. O que nos impede de começar a emitir agora?', technique: 'Pergunta de Fechamento', learning: '🧠 Identifica travas invisíveis no último segundo.' },
      { title: 'Facilitador de Pagamento', content: 'Consegui dividir em 12x sem juros pra vc. Ficou muito leve.\n\nPodemos seguir com a emissão ou vc quer pagar uma parte à vista?', technique: 'Ajuste de Fluxo', learning: '🧠 Tira a dor do pagamento com a facilidade do parcelamento.' },
      { title: 'Compromisso com o Prazer', content: 'Sua felicidade está a um "sim" de distância. Vamo nessa?\n\nQual o melhor e-mail pra eu mandar as confirmações?', technique: 'Apelo Emocional', learning: '🧠 Conecta a ação de compra com o resultado de felicidade.' }
    ]
  },
  {
    id: 'vacuo',
    title: '7. Vácuo Estratégico',
    icon: '👻',
    scripts: [
      { title: 'Técnica do Desapego', content: '[Nome], como não tive seu retorno, imagino que os planos mudaram ou a prioridade é outra.\n\nDevo liberar sua reserva para o próximo da lista ou quer que eu segure por mais 1 hora?', technique: 'Break-up Script', learning: '🧠 Faz o cliente sentir que está perdendo a oportunidade.' },
      { title: 'Lembrete Amigável', content: 'Oi! Imaginei que seu dia foi corrido hoje. 🏃‍♂️\n\nConseguiu dar uma olhadinha na proposta ou quer que eu resuma pra vc por aqui?', technique: 'Follow-up de Empatia', learning: '🧠 Não cobra a venda, cobra a atenção de forma leve.' },
      { title: 'Gatilho de Tarifa', content: 'Eita! Acabei de ver que o sistema vai atualizar os preços em breve.\n\nQuer que eu tente segurar o valor antigo pra vc por mais alguns minutos?', technique: 'Urgência Externa', learning: '🧠 Cria um motivo externo para ele responder rápido.' },
      { title: 'Apenas uma Pergunta', content: '[Nome], só pra eu não te incomodar mais: a viagem ainda está nos seus planos ou prefere que eu encerre seu atendimento?', technique: 'Pergunta de Desfecho', learning: '🧠 Exige uma resposta Sim/Não, limpando o funil.' },
      { title: 'Curiosidade de Vácuo', content: 'Oi! Aconteceu algo com o roteiro que vc não gostou ou foi só a correria mesmo?\n\nMe diz pra eu poder te ajudar melhor!', technique: 'Busca de Feedback', learning: '🧠 Traz o cliente de volta para o diálogo humano.' },
      { title: 'Última Chamada', content: 'Vou precisar liberar as vagas do hotel se não fecharmos agora. 😔\n\nÉ sua última chance de garantir esse preço. Vamos fechar ou posso liberar?', technique: 'Ultimato Educado', learning: '🧠 Usa a escassez real para forçar o posicionamento.' },
      { title: 'O "Oi" Perdido', content: 'Oi! Acho que minha última mensagem se perdeu na sua caixa. 😊\n\nFicou alguma dúvida sobre o parcelamento ou as datas?', technique: 'Reinício de Fluxo', learning: '🧠 Dá uma "saída honrosa" para o cliente que esqueceu de responder.' },
      { title: 'Novidade no Destino', content: '[Nome], saiu uma notícia ótima sobre [Destino] hoje que vc vai amar!\n\nMe dá um alô aqui que eu te conto e já aproveitamos pra finalizar sua reserva?', technique: 'Reativação por Conteúdo', learning: '🧠 Oferece valor para ganhar a atenção de volta.' },
      { title: 'Humor Leve', content: 'Acho que vc já viajou e esqueceu de me levar na mala! 😂\n\nBrincadeiras à parte, podemos seguir com sua reserva ou paramos por aqui?', technique: 'Quebra de Padrão', learning: '🧠 Usa o humor para desarmar a tensão do vácuo.' },
      { title: 'Valor em Queda', content: '[Nome]! Apareceu uma vaga de última hora com um desconto extra.\n\nSe vc responder agora, eu consigo aplicar pra vc. Topa?', technique: 'Gatilho de Ganho Inesperado', learning: '🧠 Oferece um motivo financeiro forte para o retorno.' }
    ]
  },
  {
    id: 'sinal',
    title: '8. Pedido de Sinal',
    icon: '💳',
    scripts: [
      { title: 'Trava de Tarifa', content: 'Para eu travar esse preço agora, o sistema pede um sinal de R$ [Valor].\n\nFica melhor pra vc fazer esse pix agora ou prefere daqui a 30 min?', technique: 'Ancoragem de Ação', learning: '🧠 Foca na "trava do preço" e não no "pagamento".' },
      { title: 'Garantia de Vaga', content: 'O hotel só garante sua vaga com a confirmação do sinal de reserva.\n\nPodemos fazer isso agora pra vc não perder o quarto com vista?', technique: 'Segurança de Reserva', learning: '🧠 Associa o sinal ao benefício direto (a vista).' },
      { title: 'Primeiro Passo', content: 'Vamos dar o primeiro passo? Com o sinal de R$ [Valor] eu já emito seu contrato.\n\nQual o melhor e-mail pra eu te mandar o comprovante de recebimento?', technique: 'Micro-Conversão', learning: '🧠 Trata o sinal como o início de um processo positivo.' }
    ].map(s => ({ ...s, technique: 'Comprometimento Financeiro', learning: '🧠 Gera compromisso real do cliente com a viagem.' })) as TemplateScript[]
  }
];
