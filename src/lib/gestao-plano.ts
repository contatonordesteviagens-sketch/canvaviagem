// Conteúdo da aba Gestão > Plano. Atualizar a cada rodada de trabalho: é a memória do projeto.
// Nada de número inventado: o que é proposta está escrito como proposta.

export const PLANO_ATUALIZADO_EM = "01/11/2026";

export type Owner = "Lucas" | "Claude" | "Automático";
export type ProximoPasso = { quando: string; quem: Owner; oque: string; porque: string };
export type ChecklistItem = { id: string; texto: string; quem: Owner; feito?: boolean; nota?: string };
export type ChecklistGrupo = { titulo: string; itens: ChecklistItem[] };

/** Marco estratégico atual. A contagem vem da tabela de assinaturas; o que está em caminhos é proposta. */
export const META = {
  titulo: "Meta: 10 assinantes novos até 06/11",
  inicio: "2026-11-01T03:00:00Z",
  alvo: 10,
  emDiaNoInicio: 26,
  ritmo: "Nos últimos 30 dias entraram 3 assinantes pagos. A meta é 20 vezes esse ritmo, então depende de tudo abaixo sair nos próximos 2 dias.",
  regra: "Conta assinatura nova desde 01/11. Ex-assinante que volta aparece só em Em dia. A compra de teste do Lucas entra aqui até o estorno.",
  caminhos: [
    { nome: "Quem quase comprou", alvo: "1 a 2", como: "12 pessoas terminaram o quiz ou abriram o pagamento. O Lucas fala com uma a uma." },
    { nome: "Lista fria pelo Brevo", alvo: "2 a 3", como: "133 com e-mail comprovado, 50% para sempre. Pelo Brevo, rejeição não trava o login. A chave já está salva. Falta o sim do Lucas." },
    { nome: "Ex-assinantes", alvo: "2 a 3", como: "119 pessoas que já pagaram. Antecipar o primeiro e-mail da Black, que hoje sai em 19/11. Decisão do Lucas." },
    { nome: "Anúncios para /inicio", alvo: "0 a 1", como: "Decisão do Lucas: começar com R$ 50 por dia, R$ 250 até 06/11. Dá cerca de 75 visitas pelo custo atual da INFOS ALFA, de R$ 3,29 por visita, em outro produto. Só ligar depois do cadastro e do cartão testados." },
  ],
  aviso: "As quantidades são estimativas: o Canva Viagem ainda não tem histórico de venda por anúncio nesta página.",
};

export const STATUS_GERAL = [
  { area: "Aviso da Stripe para o sistema (webhook)", estado: "ok", detalhe: "Consertado em 01/11: o segredo estava errado e o reenvio voltou 200 às 23:32. Falta ver uma compra real no cartão passando por ele." },
  { area: "Lista fria: só deixou o e-mail", estado: "problema", detalhe: "Parada por decisão do Lucas. Dos 20 contatos mais antigos, 5 voltaram (25%). Faltam 208, e 133 têm prova de que o e-mail existe. A conta do Resend está com 13,75% de rejeição nos últimos 15 dias, e o limite é 4%." },
  { area: "Página inicial, quiz e captura de e-mail", estado: "atencao", detalhe: "No ar. Em 01/11 foram 93 visitas e nenhum e-mail deixado. A origem ainda não é conhecida: cada visita registra de onde veio. Página refeita em 02/11, com a tela de e-mail antes do quiz. Cadastro de e-mail novo segue sem teste real." },
  { area: "Artes, carrossel e site da Fábrica", estado: "ok", detalhe: "12 modelos em rodízio, feed e stories. PNG conferido." },
  { area: "Página de planos e Black Vitalícia", estado: "ok", detalhe: "Cartão e Pix abrem com o valor certo." },
  { area: "Automação de e-mails", estado: "ok", detalhe: "Roda de hora em hora. Campanha agendada para 17/11." },
  { area: "Pixel do Meta no site", estado: "ok", detalhe: "O pixel da INFOS ALFA recebe eventos do canvaviagem.com desde 01/11, só pelo navegador. A conta está ativa." },
  { area: "Segurança", estado: "ok", detalhe: "Conferida em 01/11: nenhuma chave secreta no site nem nos commits recentes, e dados de clientes fechados para quem não é admin. Sobram itens menores no checklist." },
  { area: "Liberação de acesso depois de pagar", estado: "atencao", detalhe: "Pix conferido com venda real em 31/10: acesso liberado em 30 segundos e cliente gerou e baixou arte. Falta o cartão." },
] as const;

export const PROXIMOS_PASSOS: ProximoPasso[] = [
  {
    quando: "02/11",
    quem: "Lucas",
    oque: "Fazer um cadastro real em canvaviagem.com/inicio?arte=1, no celular, com um e-mail de teste e a sua logo. Ver se abre o quiz.",
    porque: "O cadastro com conta de verdade foi testado só em simulação, e hoje nenhuma das 93 visitas deixou e-mail. Esse link fica fora da conta do teste.",
  },
  {
    quando: "02/11",
    quem: "Lucas",
    oque: "Fazer 1 compra real de R$ 48,50 no cartão, em /black-friday, com um e-mail de teste. Ver se entra na Fábrica. Depois pedir o estorno e ver se o acesso sai.",
    porque: "O Pix já foi confirmado por uma venda real. O cartão nunca foi testado de ponta a ponta, e eu não faço pagamentos.",
  },
  {
    quando: "02/11",
    quem: "Lucas",
    oque: "Falar com as 12 pessoas que terminaram o quiz ou abriram o pagamento. A lista está na Gestão.",
    porque: "É quem está mais perto de comprar, e não custa nada.",
  },
  {
    quando: "02/11",
    quem: "Lucas",
    oque: "Decidir 3 coisas da meta: enviar a lista fria de 133 pelo Brevo, antecipar a Black para os 119 ex-assinantes, e o valor por dia dos anúncios.",
    porque: "Sem isso a meta depende só de quem chega sozinho, e foram 3 assinantes em 30 dias.",
  },
  {
    quando: "02/11",
    quem: "Claude",
    oque: "Escrever os anúncios e preparar a campanha para /inicio, para o Lucas aprovar antes de ligar.",
    porque: "A campanha ativa na INFOS ALFA é de outro produto. Para o Canva Viagem ainda não existe anúncio pronto.",
  },
  {
    quando: "03/11",
    quem: "Claude",
    oque: "Ler a origem das visitas da /inicio e o resultado de cada caminho da meta, e dizer o que aumentar e o que parar.",
    porque: "Com 3 dias restantes ainda dá para mudar o caminho.",
  },
  {
    quando: "Até 06/11",
    quem: "Lucas",
    oque: "Resolver o pagamento do Lovable.",
    porque: "O painel avisa que os créditos pausam em 06/11, no último dia da meta. Sem créditos não dá para corrigir nada pelo chat.",
  },
  {
    quando: "06/11",
    quem: "Claude",
    oque: "Fechar a meta: quantos assinantes entraram, de onde vieram e quanto custou cada um.",
    porque: "É o que decide quanto colocar em anúncio depois.",
  },
  {
    quando: "Até 14/11",
    quem: "Lucas",
    oque: "Pedir depoimento a 3 assinantes ativos, com autorização para usar.",
    porque: "As páginas e os e-mails não têm depoimento real. Não usamos depoimento inventado.",
  },
  {
    quando: "Antes de 17/11",
    quem: "Claude",
    oque: "Acompanhar a rejeição da conta no Resend até ficar abaixo de 4%. Revisar quem recebe a campanha da Black e impedir que erro de digitação no login vire rejeição.",
    porque: "A conta está em 13,75%. O login e a /inicio guardam todo e-mail digitado, e quatro das nove rejeições permanentes parecem erro de digitação.",
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
  { nome: "Lista fria: só deixou o e-mail", como: "Pausada. Envio manual, do mais antigo ao mais novo, com 50% para sempre até 30/11. 20 enviados em 31/10, 5 voltaram. Fica fora quem já assinou, tentou pagar, pediu para sair ou já recebeu e-mail nosso. Quando sair de novo, vai pelo Brevo." },
  { nome: "Quem deixou o e-mail e não comprou", como: "6 e-mails: 1 h depois e a cada 2 dias. Ligada." },
  { nome: "Gerou Pix ou abriu o cartão e não pagou", como: "3 e-mails: 1 h, 3 dias e 7 dias. Ligada." },
  { nome: "Black Vitalícia", como: "Pelo Brevo, até 400 por dia. Fecha às 23h59 de 30/11." },
];

export const FASES = [
  {
    titulo: "Agora · 10 assinantes em 5 dias",
    periodo: "01 a 06/11",
    objetivo: "Provar que o funil novo vende e descobrir de onde vem a venda.",
    acoes: [
      "Testar cadastro e cartão antes de gastar em anúncio.",
      "Vender primeiro para quem já conhece: quem quase comprou, lista fria e ex-assinantes.",
      "Anúncios para /inicio, pausando o conjunto que gastar R$ 194 sem venda.",
      "Ler o resultado em 03/11 e fechar em 06/11.",
    ],
  },
  {
    titulo: "Fase 1 · Deixar tudo confiável",
    periodo: "Até 16/11",
    objetivo: "Ter certeza de que quem paga entra, e voltar a captar lead novo.",
    acoes: [
      "Compra de teste e webhook da Stripe.",
      "Manter nos anúncios só o que vendeu na meta de 5 dias.",
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
    titulo: "Meta: 10 assinantes até 06/11",
    itens: [
      { id: "meta-segredo-stripe", texto: "Segredo certo do webhook colado no Lovable", quem: "Lucas", feito: true },
      { id: "meta-chave-brevo", texto: "Chave do Brevo colada no Lovable", quem: "Lucas", feito: true, nota: "Só com permissão de e-mail transacional. Expira se ficar 90 dias sem uso." },
      { id: "meta-webhook-200", texto: "Aviso reenviado na Stripe voltando 200", quem: "Claude", feito: true },
      { id: "meta-cadastro-real", texto: "Cadastro real de e-mail novo no celular", quem: "Lucas" },
      { id: "meta-mornos", texto: "12 pessoas que quase compraram contatadas", quem: "Lucas" },
      { id: "meta-origem", texto: "Origem de cada visita da /inicio registrada", quem: "Claude", feito: true },
      { id: "meta-fria-pronta", texto: "Lista fria pronta para sair pelo Brevo", quem: "Claude", feito: true, nota: "Nenhum e-mail da lista saiu. O envio depende do sim do Lucas." },
      { id: "meta-fria-enviada", texto: "Lista fria de 133 enviada", quem: "Lucas" },
      { id: "meta-ex-assinantes", texto: "Decisão sobre antecipar a Black para os 119 ex-assinantes", quem: "Lucas" },
      { id: "meta-anuncios-prontos", texto: "Anúncios e campanha prontos para aprovar", quem: "Claude" },
      { id: "meta-leitura-0311", texto: "Resultado lido em 03/11", quem: "Claude" },
      { id: "meta-fechamento", texto: "Meta fechada em 06/11, com custo por assinante", quem: "Claude" },
    ],
  },
  {
    titulo: "Segurança (conferida em 01/11)",
    itens: [
      { id: "seg-chaves-site", texto: "Nenhuma chave secreta no código publicado do site", quem: "Claude", feito: true },
      { id: "seg-chaves-commits", texto: "Nenhuma chave nova nos últimos 40 commits", quem: "Claude", feito: true },
      { id: "seg-dados-fechados", texto: "Clientes, leads e funções de admin fechados para visitante", quem: "Claude", feito: true, nota: "Testado sem login: nenhuma linha devolvida." },
      { id: "seg-painel-mkt", texto: "Painel de marketing sem expor o arquivo de chaves", quem: "Claude", feito: true },
      { id: "seg-chave-google", texto: "Trocar a chave Google que está em Vendedor-de-Viagens-IA-main/App.tsx", quem: "Lucas", nota: "O repositório é privado e essa pasta não vai para o site. Risco baixo." },
      { id: "seg-canva-inicio", texto: "Tirar do site a cópia canva_inicio.html, usada pela página CanvaClone", quem: "Claude", nota: "É pública e traz uma chave Google que parece ser da página copiada." },
      { id: "seg-pacotes", texto: "Atualizar pacotes com alerta: 20 no total, 2 críticos", quem: "Claude", nota: "Depois da meta, para não mexer no site durante a venda." },
      { id: "seg-pixel-teste", texto: "Pixel fora do site local e da prévia do Lovable", quem: "Claude", nota: "Hoje os testes também entram no pixel." },
    ],
  },
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
      { id: "critica-quiz-curto", texto: "Quiz com 10 telas", quem: "Claude", feito: true },
    ],
  },
  {
    titulo: "Para confiar no pagamento",
    itens: [
      { id: "compra-real-pix", texto: "Venda real no Pix, com acesso liberado e arte baixada", quem: "Lucas", feito: true },
      { id: "compra-teste-cartao", texto: "Compra real de teste no cartão, com acesso liberado", quem: "Lucas" },
      { id: "webhook-stripe-ligado", texto: "Aviso de pagamento da Stripe ligado", quem: "Claude", feito: true },
      { id: "webhook-stripe-entrega", texto: "Primeira entrega do aviso conferida", quem: "Claude", feito: true, nota: "Primeiro 200 em 01/11, às 23:32, depois de trocar o segredo." },
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
      { id: "saldo-infos-alfa", texto: "Saldo pendente da INFOS ALFA acertado", quem: "Lucas", feito: true, nota: "Conta ativa em 01/11, com campanha de outro produto entregando." },
      { id: "pixel-canva-infos-alfa", texto: "Pixel da conta de anúncios instalado no site", quem: "Claude", feito: true, nota: "Só no navegador. Falta o token do servidor." },
      { id: "anuncios-ligados", texto: "Anúncios ligados com link para /inicio", quem: "Lucas" },
      { id: "regra-pausa", texto: "Definir o valor por dia e a regra de pausa", quem: "Lucas", nota: "Decidido: R$ 50 por dia. Pausar o conjunto que gastar R$ 194 (2 mensais) sem venda." },
    ],
  },
  {
    titulo: "Para a Black Vitalícia",
    itens: [
      { id: "pagina-bf", texto: "Página /black-friday no ar", quem: "Claude", feito: true },
      { id: "emails-bf", texto: "E-mails escritos, com texto próprio para quem nunca assinou", quem: "Claude", feito: true },
      { id: "datas-bf", texto: "Datas definidas e prazo fechando sozinho", quem: "Claude", feito: true },
      { id: "cota-resend", texto: "Campanha limitada: 70 por dia no Resend, 400 no Brevo", quem: "Claude", feito: true },
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
    data: "02/11",
    itens: [
      "/inicio refeita em uma página só: chamada do áudio, destino digitado ou em botões, logo e 3 artes. O teste meio a meio acabou.",
      "Logo entra na arte como a pessoa enviou, sem fundo nem borda. Artes maiores: uma por vez no celular, com aviso de arrastar.",
      "Depois das artes, o botão leva à tela de e-mail, como login para usar a ferramenta, e só então ao quiz.",
      "Página mais limpa: créditos menores, vitrine depois deles, roda colorida de marketing, redes sociais na foto, conteúdo pronto só com título e vídeos.",
      "Corrigido o uso de num por em um nas páginas de venda.",
      "Pix do quiz abre direto no popup, sem CPF: QR Code, botão verde de copiar e relógio de 10 minutos. O Pix vale 24 horas e continua aparecendo quando o relógio zera. Depois de pagar, a pessoa confere ou corrige o e-mail de acesso.",
      "E-mail de compra explica como entrar em outro aparelho, com link fixo para a página de login. Ainda sem teste com pagamento real.",
      "Quadro Onde as pessoas desistem no Plano: cada etapa da página ao pagamento, as respostas do quiz e o filtro só de anúncios.",
      "Pergunta de destinos menor, com o botão de continuar à vista no celular.",
      "Quiz mais limpo: só a logo no topo, barra em 50% depois de 2 respostas, artes menores em pilha, carregamento de 7 segundos em círculo, com avaliações curtas, antes do diagnóstico e do plano.",
      "Plano: ao escolher, aparecem Pix e cartão no próprio plano. Abaixo, garantia e 4 prints de clientes em carrossel. Saiu o prêmio de 14 dias de posts.",
    ],
  },
  {
    data: "01/11",
    itens: [
      "Meta definida: 10 assinantes novos até 06/11, com contador neste Plano.",
      "Aviso da Stripe consertado: o segredo estava errado e o reenvio voltou 200. Chave do Brevo salva, só com permissão de e-mail transacional.",
      "Conferência final: aviso da Stripe com todas as entregas falhando, 93 visitas sem nenhum e-mail na /inicio e pixel da INFOS ALFA recebendo do site.",
      "Segurança conferida: nenhuma chave exposta no site e dados fechados para quem não é admin.",
      "Cada visita da /inicio passa a registrar de onde veio.",
      "Lista fria pronta para sair pelo Brevo, sem nenhum envio feito.",
      "Artes do teste trocadas para os Modelos 1, 5 e 2. O Modelo 6, do cartão branco com sobra, saiu do rodízio.",
      "Quiz de 19 para 10 telas, 6 perguntas, com prints de clientes antes do preço. As 3 artes passam inteiras na primeira tela.",
      "Limite de 10 áudios por dia por cliente, com aviso só no nono.",
      "Pixel da INFOS ALFA ligado no site, só no navegador por enquanto.",
      "Arte de teste vale uma vez por aparelho: recarregar mostra as mesmas artes. Imagem menor, marca em três linhas e sem clique direito.",
      "A primeira tela do quiz mostra as artes da própria pessoa. Quem não testou vê as artes reais passando.",
      "Microfone maior na Fábrica e novo no início, ligado ao mesmo projeto. O áudio também capta WhatsApp, Instagram e cidade.",
      "Missões, níveis e medalhas para quem nunca usou a plataforma, na Fábrica e no início.",
      "Promessas corrigidas: sem vídeo com a logo, sem nota inventada, sem 14 dias e sem estrelas no quiz. Garantia de 7 dias nos Termos e WhatsApp no pagamento.",
      "Medição: Lead só com o e-mail enviado, compra no cartão sem contar em dobro e compra no Pix enviada pelo servidor.",
      "Reembolso integral no cartão encerra o acesso: evento ligado na Stripe em 01/11, ainda sem reembolso real para confirmar. No Pix ainda é manual.",
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
  "Destino digitado fora da lista usa foto neutra de avião: sem conta, a busca de fotos não abre.",
  "Cadastro de e-mail novo depois da mudança de 01/11 na /inicio: testado só em simulação. O último cadastro real foi antes dela. A primeira linha nova em Criaram conta, no quadro Teste da /inicio, confirma.",
  "Resto da migração de 23/07 dos projetos da Fábrica: só a parte do registro de visitas foi aplicada. Falta conferir se o restante está no banco.",
  "Pagamento real no cartão e com o valor da Black. O Pix foi confirmado só no preço cheio de R$ 97.",
  "Limite de 70 por dia em envio real: só simulado, roda a partir de 17/11.",
  "Celular real (iPhone): testado só em tela simulada. Inclui o microfone.",
  "Áudio: salvar em conta real, aviso no nono e bloqueio depois do décimo.",
  "Reembolso no cartão cortando o acesso: o aviso voltou a funcionar, mas nenhum reembolso real passou por ele.",
  "Envio pelo Brevo: a chave está salva, mas nenhum e-mail saiu por lá.",
];

export const LINKS = [
  { nome: "Página inicial", url: "/inicio" },
  { nome: "Quiz", url: "/onboarding" },
  { nome: "Planos", url: "/planos" },
  { nome: "Black Vitalícia", url: "/black-friday" },
];
