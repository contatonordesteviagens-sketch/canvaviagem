// Conteúdo da aba Gestão > Plano. Atualizar a cada rodada de trabalho: é a memória do projeto.
// Nada de número inventado: o que é proposta está escrito como proposta.

export const PLANO_ATUALIZADO_EM = "01/11/2026";

export type Owner = "Lucas" | "Claude" | "Automático";
export type ProximoPasso = { quando: string; quem: Owner; oque: string; porque: string };
export type ChecklistItem = { id: string; texto: string; quem: Owner; feito?: boolean; nota?: string };
export type ChecklistGrupo = { titulo: string; itens: ChecklistItem[] };

export const STATUS_GERAL = [
  { area: "Lista fria: só deixou o e-mail", estado: "problema", detalhe: "Parada por decisão do Lucas. Dos 20 contatos mais antigos, 5 voltaram (25%). Faltam 208, e 133 têm prova de que o e-mail existe. A conta do Resend está com 13,75% de rejeição nos últimos 15 dias, e o limite é 4%." },
  { area: "Página inicial, quiz e captura de e-mail", estado: "ok", detalhe: "Conferido em produção em 31/10." },
  { area: "Artes, carrossel e site da Fábrica", estado: "ok", detalhe: "12 modelos em rodízio, feed e stories. PNG conferido." },
  { area: "Página de planos e Black Vitalícia", estado: "ok", detalhe: "Cartão e Pix abrem com o valor certo." },
  { area: "Automação de e-mails", estado: "ok", detalhe: "Roda de hora em hora. Campanha agendada para 17/11." },
  { area: "Pixel do Meta no site", estado: "atencao", detalhe: "O site envia para outros pixels. O da INFOS ALFA, a conta usada nos anúncios, não está instalado." },
  { area: "Liberação de acesso depois de pagar", estado: "atencao", detalhe: "Pix conferido com venda real em 31/10: acesso liberado em 30 segundos e cliente gerou e baixou arte. Falta o cartão." },
  { area: "Aviso da Stripe para o sistema (webhook)", estado: "atencao", detalhe: "Ligado em 31/10. Falta ver a primeira entrega com sucesso, que deve aparecer em até 24 horas." },
] as const;

export const PROXIMOS_PASSOS: ProximoPasso[] = [
  {
    quando: "01/11",
    quem: "Claude",
    oque: "Lista fria parada. Só ver quem clicou nos 15 que não voltaram e acompanhar a rejeição da conta no Resend até ela ficar abaixo de 4%.",
    porque: "A conta está em 13,75% e o Resend pode pausar ou encerrar o envio acima de 4%. O remetente é o mesmo do link de login, então um bloqueio impede os clientes de entrar.",
  },
  {
    quando: "Hoje",
    quem: "Lucas",
    oque: "Fazer um cadastro real em canvaviagem.com/inicio?arte=1, no celular, com um e-mail de teste e a sua logo. Ver se abre o quiz.",
    porque: "O cadastro com conta de verdade foi testado só em simulação. Esse link fica fora da conta do teste.",
  },
  {
    quando: "Hoje",
    quem: "Lucas",
    oque: "Na Stripe, em Desenvolvedores > Webhooks > stripe-webhook > Editar destino, marcar o evento charge.refunded e salvar.",
    porque: "Sem esse evento, quem pede reembolso no cartão continua com acesso até o cancelamento manual. A proteção de permissões não deixou o Claude alterar isso.",
  },
  {
    quando: "Antes dos anúncios",
    quem: "Lucas",
    oque: "Decidir o pixel: compartilhar o pixel principal 2120347238758199 com a conta INFOS ALFA ou criar um pixel só do Canva Viagem nela.",
    porque: "Os anúncios saem da INFOS ALFA e o site não envia eventos para o pixel dela. Sem isso, o Meta não sabe quem comprou e não otimiza. O pixel que ela tem hoje recebe dados de outros produtos, por isso não foi ligado direto.",
  },
  {
    quando: "Hoje",
    quem: "Lucas",
    oque: "Fazer 1 compra real de R$ 48,50 no cartão, em /black-friday, com um e-mail de teste. Ver se entra na Fábrica. Depois pedir o estorno.",
    porque: "O Pix já foi confirmado por uma venda real. O cartão nunca foi testado de ponta a ponta, e eu não faço pagamentos.",
  },
  {
    quando: "01/11",
    quem: "Claude",
    oque: "Conferir na Stripe a primeira entrega do aviso de pagamento, ligado em 31/10.",
    porque: "É o aviso que a Stripe manda ao nosso sistema quando alguém paga. Sem ele o cartão libera acesso, mas a compra não fica registrada e a pessoa pode receber e-mail de cobrança.",
  },
  {
    quando: "Até 03/11",
    quem: "Lucas",
    oque: "Antes de ligar os anúncios na INFOS ALFA: acertar o saldo pendente da conta e escolher o pixel. O pixel da INFOS ALFA não está no canvaviagem.com.",
    porque: "Conta com saldo pendente pode não veicular. Sem o pixel certo, o Meta não enxerga quem veio do anúncio nem quem comprou.",
  },
  {
    quando: "Até 06/11",
    quem: "Lucas",
    oque: "Resolver o pagamento do Lovable.",
    porque: "O painel avisa que os créditos pausam em 06/11.",
  },
  {
    quando: "Até 14/11",
    quem: "Lucas",
    oque: "Pedir depoimento a 3 assinantes ativos, com autorização para usar.",
    porque: "As páginas e os e-mails não têm nenhuma prova real. Não usamos depoimento inventado.",
  },
  {
    quando: "Antes de 17/11",
    quem: "Claude",
    oque: "Revisar quem recebe a campanha da Black: leads da /inicio entram sem prova de que o e-mail existe. E impedir que erro de digitação no login vire rejeição.",
    porque: "O login e a /inicio guardam todo e-mail digitado. Quatro das nove rejeições permanentes dos últimos 15 dias parecem erro de digitação no login. A campanha não pode começar com a conta acima do limite.",
  },
  {
    quando: "17/11, 9h15",
    quem: "Automático",
    oque: "Sai o e-mail de novidades para os assinantes ativos.",
    porque: "Primeiro envio da campanha, para quem mais abre.",
  },
  {
    quando: "20/11",
    quem: "Claude",
    oque: "Ler rejeição e descadastro do primeiro envio da oferta, antes do segundo e-mail.",
    porque: "Lista parada pode dar rejeição alta. Se der, a gente reduz a lista antes do dia 23.",
  },
];

/** Calendário da campanha. Datas iguais às de BF_CAMPAIGN em _shared/recoveryEmails.ts. */
export const ENVIOS: { data: string; iso: string; kind: string; publico: string; assunto: string }[] = [
  { data: "Ter 17/11", iso: "2026-11-17", kind: "novidades", publico: "Assinantes ativos", assunto: "Tem novidade na sua conta" },
  { data: "Qui 19/11", iso: "2026-11-19", kind: "bf1", publico: "Ex-assinantes e leads", assunto: "Talvez você tenha ficado chateado" },
  { data: "Seg 23/11", iso: "2026-11-23", kind: "bf2", publico: "Ex-assinantes e leads", assunto: "O que mudou desde que você saiu" },
  { data: "Qua 25/11", iso: "2026-11-25", kind: "bf4", publico: "Ex-assinantes e leads", assunto: "Ainda está postando tudo sozinho?" },
  { data: "Sex 27/11", iso: "2026-11-27", kind: "bf3", publico: "Ex-assinantes e leads", assunto: "Quanto fica no anual" },
  { data: "Dom 29/11", iso: "2026-11-29", kind: "bf5", publico: "Ex-assinantes e leads", assunto: "A Black Vitalícia acaba em 30/11" },
  { data: "Seg 30/11", iso: "2026-11-30", kind: "bf6", publico: "Ex-assinantes e leads", assunto: "Me responde uma coisa?" },
];

export const AUTOMACOES = [
  { nome: "Lista fria: só deixou o e-mail", como: "Pausada. Envio manual, do mais antigo ao mais novo, com 50% para sempre até 30/11. 20 enviados em 31/10, 5 voltaram. Fica fora quem já assinou, tentou pagar, pediu para sair ou já recebeu e-mail nosso." },
  { nome: "Quem deixou o e-mail e não comprou", como: "6 e-mails: 1 h depois e a cada 2 dias. Ligada." },
  { nome: "Gerou Pix ou abriu o cartão e não pagou", como: "3 e-mails: 1 h, 3 dias e 7 dias. Ligada." },
  { nome: "Black Vitalícia", como: "No máximo 70 por dia, para sobrar cota do Resend para login e compra. Fecha às 23h59 de 30/11." },
];

export const FASES = [
  {
    titulo: "Fase 1 · Deixar tudo confiável",
    periodo: "Até 16/11",
    objetivo: "Ter certeza de que quem paga entra, e voltar a captar lead novo.",
    acoes: [
      "Compra de teste e webhook da Stripe.",
      "Anúncios para /inicio, com valor pequeno.",
      "3 depoimentos reais de assinantes ativos.",
    ],
  },
  {
    titulo: "Fase 2 · Black Vitalícia",
    periodo: "17 a 30/11",
    objetivo: "Trazer de volta quem já assinou, pagando metade para sempre.",
    acoes: [
      "Assinantes ativos: novidades, sem desconto.",
      "119 ex-assinantes: sequência de 6 e-mails, começando pelo pedido de desculpas.",
      "Quem deixou o e-mail há 3 dias ou mais: mesma oferta, com texto próprio.",
      "Ler as respostas do último e-mail: é a pesquisa de por que as pessoas saíram.",
    ],
  },
  {
    titulo: "Fase 3 · Não perder quem voltou",
    periodo: "Dezembro",
    objetivo: "Fazer a pessoa usar na primeira semana, porque quem não usa não renova.",
    acoes: [
      "E-mails da primeira semana: gerar a primeira arte, o primeiro carrossel, publicar o site.",
      "Corrigir o que as respostas do bf6 apontarem.",
      "Aviso antes de renovar, mostrando o que a pessoa já gerou.",
    ],
  },
  {
    titulo: "Fase 4 · Crescer",
    periodo: "A partir de janeiro",
    objetivo: "Só aumentar anúncio quando a conta fechar.",
    acoes: [
      "Comparar quanto custa cada venda com quanto a pessoa paga no primeiro ano.",
      "Oferecer o anual para quem está no mensal.",
      "Programa de indicação entre agências, testando com os assinantes ativos.",
    ],
  },
];

/** Plano em 1 página: 9 quadros, do desconhecido ao fã. */
export const NOVE_QUADROS: { fase: string; titulo: string; texto: string; estado: "pronto" | "parcial" | "falta" }[] = [
  { fase: "Antes", titulo: "Para quem", texto: "Agências e agentes de viagem sem equipe de marketing.", estado: "pronto" },
  { fase: "Antes", titulo: "Mensagem", texto: "Mande um áudio. Receba sua agência inteira pronta.", estado: "pronto" },
  { fase: "Antes", titulo: "Onde aparecer", texto: "Um canal só por enquanto: anúncios no Meta, com rastreamento.", estado: "parcial" },
  { fase: "Durante", titulo: "Captar", texto: "E-mail na /inicio e quiz, sem etapa no meio.", estado: "pronto" },
  { fase: "Durante", titulo: "Acompanhar", texto: "6 e-mails para lead e 3 para quem abriu o pagamento.", estado: "pronto" },
  { fase: "Durante", titulo: "Vender", texto: "Planos, cartão e Pix prontos. Falta prova real na página.", estado: "parcial" },
  { fase: "Depois", titulo: "Primeira experiência", texto: "Ferramenta mais fácil. Faltam os e-mails da primeira semana.", estado: "parcial" },
  { fase: "Depois", titulo: "Ficar mais tempo", texto: "Plano anual e renovação no mesmo valor. Falta o aviso de uso.", estado: "parcial" },
  { fase: "Depois", titulo: "Indicação", texto: "Ainda não existe. Entra na Fase 4.", estado: "falta" },
];

export const CHECKLIST: ChecklistGrupo[] = [
  {
    titulo: "Antes de ligar os anúncios (análise crítica de 30/10)",
    itens: [
      { id: "critica-arte-inicio", texto: "Arte com marca d'água na /inicio, com a logo salva", quem: "Claude", feito: true, nota: "No ar para metade dos visitantes novos desde 01/11. Resultado no quadro Teste da /inicio." },
      { id: "critica-video", texto: "Promessa de vídeo com a logo decidida e corrigida", quem: "Claude", feito: true, nota: "Trocado por: vídeos prontos para postar. Sem vídeo com a logo na promessa." },
      { id: "critica-botao-audio", texto: "Botão de áudio da /inicio deixa de levar ao login sem gravar", quem: "Claude", feito: true, nota: "O botão passou a se chamar Começar agora. O áudio é da conta de quem assina." },
      { id: "critica-numero-quiz", texto: "Número inventado e 14 dias de posts fora do quiz", quem: "Claude", feito: true, nota: "Saíram a nota 48 para 96, as porcentagens e os 14 dias." },
      { id: "critica-compra-dobro", texto: "Compra no cartão contada uma vez só no pixel", quem: "Claude", feito: true, nota: "Navegador e servidor usam o mesmo identificador." },
      { id: "critica-lead", texto: "Lead contado depois do e-mail, não no clique", quem: "Claude", feito: true },
      { id: "critica-pix-servidor", texto: "Compra no Pix enviada ao Meta pelo servidor", quem: "Claude", feito: true },
      { id: "critica-google-ads", texto: "Conversão do Google Ads em português", quem: "Claude" },
      { id: "critica-canva-comum", texto: "Tirar Canva comum da tabela e do quiz", quem: "Claude", feito: true },
      { id: "critica-whatsapp", texto: "WhatsApp no checkout", quem: "Claude", feito: true },
      { id: "critica-termos", texto: "Garantia de 7 dias escrita nos Termos", quem: "Claude", feito: true },
      { id: "critica-preco", texto: "Preço na /inicio", quem: "Claude" },
      { id: "critica-quiz-curto", texto: "Quiz com cerca de 10 telas e a arte na tela de preço", quem: "Claude" },
    ],
  },
  {
    titulo: "Para confiar no pagamento",
    itens: [
      { id: "compra-real-pix", texto: "Venda real no Pix, com acesso liberado e arte baixada", quem: "Lucas", feito: true },
      { id: "compra-teste-cartao", texto: "Compra real de teste no cartão, com acesso liberado", quem: "Lucas" },
      { id: "webhook-stripe-ligado", texto: "Aviso de pagamento da Stripe ligado", quem: "Claude", feito: true },
      { id: "webhook-stripe-entrega", texto: "Primeira entrega do aviso conferida", quem: "Claude" },
      { id: "precos-elite", texto: "Preços da Black em produtos que liberam acesso", quem: "Claude", feito: true },
      { id: "checkout-valores", texto: "Cartão e Pix abrem com o valor certo", quem: "Claude", feito: true },
      { id: "lovable-pago", texto: "Pagamento do Lovable resolvido", quem: "Lucas" },
    ],
  },
  {
    titulo: "Para rodar anúncios",
    itens: [
      { id: "pagina-inicio", texto: "/inicio carregando, com vitrine e sem Google", quem: "Claude", feito: true },
      { id: "quiz-completo", texto: "Quiz completo até o pagamento", quem: "Claude", feito: true },
      { id: "email-lead", texto: "Lead recebe os e-mails sozinho", quem: "Claude", feito: true },
      { id: "saldo-infos-alfa", texto: "Saldo pendente da INFOS ALFA acertado", quem: "Lucas" },
      { id: "pixel-canva-infos-alfa", texto: "Pixel da conta de anúncios instalado no site", quem: "Claude", nota: "Precisa da escolha do Lucas." },
      { id: "anuncios-ligados", texto: "Anúncios ligados com link para /inicio", quem: "Lucas" },
      { id: "regra-pausa", texto: "Definir o valor por dia e a regra de pausa", quem: "Lucas", nota: "Sugestão: pausar o conjunto que gastar R$ 194 (2 mensais) sem venda." },
    ],
  },
  {
    titulo: "Para a Black Vitalícia",
    itens: [
      { id: "pagina-bf", texto: "Página /black-friday no ar", quem: "Claude", feito: true },
      { id: "emails-bf", texto: "E-mails escritos, com texto próprio para quem nunca assinou", quem: "Claude", feito: true },
      { id: "datas-bf", texto: "Datas definidas e prazo fechando sozinho", quem: "Claude", feito: true },
      { id: "cota-resend", texto: "Campanha limitada a 70 por dia", quem: "Claude", feito: true },
      { id: "depoimentos", texto: "3 depoimentos reais autorizados", quem: "Lucas" },
      { id: "ler-primeiro-envio", texto: "Resultado do primeiro envio lido em 20/11", quem: "Claude" },
      { id: "ler-respostas", texto: "Respostas do último e-mail lidas e resumidas", quem: "Claude" },
    ],
  },
  {
    titulo: "Depois da campanha",
    itens: [
      { id: "emails-primeira-semana", texto: "E-mails da primeira semana de uso", quem: "Claude" },
      { id: "aviso-renovacao-uso", texto: "Aviso de renovação mostrando o que a pessoa gerou", quem: "Claude" },
      { id: "indicacao", texto: "Programa de indicação entre agências", quem: "Claude" },
    ],
  },
];

export const FEITO: { data: string; itens: string[] }[] = [
  {
    data: "01/11",
    itens: [
      "Arte de teste vale uma vez por aparelho: recarregar mostra as mesmas artes. Imagem menor, marca em três linhas e sem clique direito.",
      "A primeira tela do quiz mostra as artes da própria pessoa. Quem não testou vê as artes reais passando.",
      "Microfone maior na Fábrica e novo no início, ligado ao mesmo projeto. O áudio também capta WhatsApp, Instagram e cidade.",
      "Missões, níveis e medalhas para quem nunca usou a plataforma, na Fábrica e no início.",
      "Promessas corrigidas: sem vídeo com a logo, sem nota inventada, sem 14 dias e sem estrelas no quiz. Garantia de 7 dias nos Termos e WhatsApp no pagamento.",
      "Medição: Lead só com o e-mail enviado, compra no cartão sem contar em dobro e compra no Pix enviada pelo servidor.",
      "Sistema pronto para encerrar o acesso no reembolso integral do cartão, mas só funciona depois de ligar o evento na Stripe. No Pix ainda é manual.",
      "Áudio gera a arte sozinho: o preço, o WhatsApp e o Instagram falados entram na arte.",
      "Arte na /inicio: escolhe o destino, envia a logo e vê 3 artes com marca d'água. O e-mail só aparece depois. Metade dos visitantes novos vê essa página, metade vê a atual.",
      "Teste real da arte na /inicio: logo de verdade, assinante indo para a Fábrica e e-mail de conta existente, com o link entregue no Resend.",
      "Logo e destino escolhidos na /inicio passam para a Fábrica depois da assinatura. As respostas do quiz também voltaram a chegar lá.",
      "Quadro Teste da /inicio no Plano: visitas, quiz, contas e assinaturas de cada página.",
      "Aba Uso na Gestão: totais, onde as pessoas travam e os dados de cada cliente.",
      "Visitas e cliques dos sites voltaram a ser registrados. Estavam parados desde 23/07 por um erro.",
      "Carrossel gerado, site aberto, site publicado e áudio passam a ser contados para assinantes.",
      "Primeira leva da lista fria: 20 enviados, 5 voltaram. Envio parado por decisão do Lucas.",
      "Lista fria ganhou filtro opcional: só e-mail comprovado, de quem clicou em link nosso ou entrou com o Google. Nenhum e-mail saiu com ele.",
    ],
  },
  {
    data: "31/10",
    itens: [
      "Black Vitalícia: página, preços na Stripe e no Pix, e renovação no mesmo valor.",
      "Campanha agendada de 17 a 30/11, com a oferta fechando sozinha.",
      "Automação: 6 e-mails para lead e 3 para quem abriu o pagamento.",
      "Página /planos e checkout com rastreamento dos e-mails.",
      "Vitrine da /inicio e do quiz, sem botão do Google.",
      "Quem já tem conta recebe o link; e-mail novo vai direto ao quiz.",
      "12 modelos de arte em rodízio, busca de fotos e título editável.",
      "Carrossel busca as fotos do pacote escolhido.",
      "Worker publicado: sites antigos sem \"15k+\" e site suspenso leva para a /inicio.",
      "Campanha limitada a 70 e-mails por dia, por causa da cota grátis do Resend.",
      "Esta aba Plano na Gestão, com checklist que fica salvo.",
      "Aviso de pagamento da Stripe ligado de novo.",
    ],
  },
];

export const NAO_TESTADO = [
  "Cadastro de e-mail novo depois da mudança de 01/11 na /inicio: testado só em simulação. O último cadastro real foi antes dela. A primeira linha nova em Criaram conta, no quadro Teste da /inicio, confirma.",
  "Resto da migração de 23/07 dos projetos da Fábrica: só a parte do registro de visitas foi aplicada. Falta conferir se o restante está no banco.",
  "Pagamento real no cartão e com o valor da Black. O Pix foi confirmado só no preço cheio de R$ 97.",
  "Limite de 70 por dia em envio real: só simulado, roda a partir de 17/11.",
  "Celular real (iPhone): testado só em tela simulada.",
];

export const LINKS = [
  { nome: "Página inicial", url: "/inicio" },
  { nome: "Quiz", url: "/onboarding" },
  { nome: "Planos", url: "/planos" },
  { nome: "Black Vitalícia", url: "/black-friday" },
];
