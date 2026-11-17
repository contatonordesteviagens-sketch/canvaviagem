// Catálogo dos vídeos prontos da Fábrica (Início e "Que vídeo você quer fazer?").
// Cada vídeo usa o motor dos vídeos prontos do VideoLab: "lista" (serviços numerados) ou "pergunta" (frase de abertura e ofertas).
// Os textos são exemplos que a agência troca; nada de desconto, número ou depoimento inventado.
// Fundos disponíveis (public/video-fundos): praia, resort, cafe, buggy, mergulho, casal, cachoeira, piscina, barco, aeroporto, janela, bangalo, veleiro, balao.

export type Item = { titulo: string; sub: string; fundo: string };
/** Estilos do vídeo (os mesmos do vídeo de pacote). Todo vídeo pode trocar de estilo no editor. */
export type VisualVideo = "classico" | "faixa" | "azul" | "luxo" | "neon" | "vibrante" | "cartao" | "postal" | "revista" | "passagem" | "bf";
export type CategoriaVideo = "servicos" | "personalizado" | "pacotes" | "sonhos" | "praia" | "aventura" | "lua" | "casamento" | "familia" | "grupo" | "excursao" | "voos" | "transfer" | "datas";
export type VideoPronto = {
  id: string; nome: string; resumo: string; modelo: "lista" | "pergunta"; cena: string;
  cat: CategoriaVideo; visual?: VisualVideo;
  /** texto do cartão (o vídeo de verdade é desenhado pelo gerador) */
  capa: [string, string];
  pronto?: Record<string, unknown>;
  lista?: Item[];
};

export const CATEGORIAS_VIDEO: { id: CategoriaVideo; nome: string }[] = [
  { id: "servicos", nome: "Serviços" }, { id: "personalizado", nome: "Pacote personalizado" }, { id: "pacotes", nome: "Pacotes completos" },
  { id: "voos", nome: "Voos e passagens" }, { id: "datas", nome: "Datas especiais" }, { id: "sonhos", nome: "Destinos dos sonhos" },
  { id: "praia", nome: "Praias e resorts" }, { id: "aventura", nome: "Natureza e aventura" }, { id: "lua", nome: "Lua de mel" },
  { id: "casamento", nome: "Casamento e bodas" }, { id: "familia", nome: "Férias em família" }, { id: "grupo", nome: "Viagem em grupo" },
  { id: "excursao", nome: "Excursões" }, { id: "transfer", nome: "Transfer" },
];
export const VISUAIS_VIDEO: { id: VisualVideo; nome: string; desc: string }[] = [
  { id: "classico", nome: "Clássico", desc: "vídeo na tela toda" },
  { id: "faixa", nome: "Faixa preta", desc: "vídeo em cima e o texto na faixa escura" },
  { id: "azul", nome: "Promo azul", desc: "vídeo com véu azul" },
  { id: "luxo", nome: "Luxo", desc: "escuro com moldura dourada" },
  { id: "neon", nome: "Neon", desc: "roxo com luzes rosa e azul" },
  { id: "vibrante", nome: "Vibrante", desc: "laranja e rosa, cheio de energia" },
  { id: "cartao", nome: "Cartão", desc: "texto num cartão escuro no meio" },
  { id: "postal", nome: "Postal", desc: "moldura branca de cartão-postal" },
  { id: "revista", nome: "Revista", desc: "moldura fina de capa de revista" },
  { id: "passagem", nome: "Passagem", desc: "azul-marinho com picote de bilhete" },
  { id: "bf", nome: "Black Friday", desc: "preto com faixas amarelas" },
];
export const NOME_VISUAL = Object.fromEntries(VISUAIS_VIDEO.map((v) => [v.id, v.nome])) as Record<VisualVideo, string>;

const NOVEMBRO = new Date().getMonth() === 10;
const it = (titulo: string, sub: string, fundo: string): Item => ({ titulo, sub, fundo });

export const VIDEOS: VideoPronto[] = [
  // ——— Serviços ———
  { id: "servicos", cat: "servicos", nome: "Nossos serviços", resumo: "Tudo que a agência vende, em lista numerada", modelo: "lista", cena: "praia-1", capa: NOVEMBRO ? ["BLACK FRIDAY", "de viagens"] : ["Sua próxima viagem", "começa aqui"] },
  {
    id: "servicos-faixa", cat: "servicos", visual: "faixa", nome: "Serviços · faixa com imagem", resumo: "Vídeo em cima e os serviços na faixa escura", modelo: "lista", cena: "janela-1", capa: ["Tudo para", "sua viagem"],
    lista: [it("Passagens", "nacionais e internacionais", "janela"), it("Hotéis", "e resorts", "resort"), it("Pacotes", "aéreo e hotel juntos", "praia"), it("Cruzeiros", "pelo litoral", "veleiro"), it("Passeios", "no destino", "barco"), it("Seguro viagem", "para viajar tranquilo", "aeroporto")],
    pronto: { titulo: "TUDO PARA", destaque: "SUA VIAGEM", subtitulo: "EM UM SÓ LUGAR", selo: "FALE COM A GENTE", fecho: "Monte a sua viagem com a gente" },
  },
  {
    id: "servicos-azul", cat: "servicos", visual: "azul", nome: "Serviços · azul", resumo: "Os serviços da agência com banho de azul", modelo: "lista", cena: "aeroporto-1", capa: ["Sua agência", "de viagens"],
    lista: [it("Passagens", "para onde você quiser", "aeroporto"), it("Hospedagem", "do seu jeito", "resort"), it("Pacotes", "completos", "bangalo"), it("Passeios", "e experiências", "buggy"), it("Seguro viagem", "para toda a família", "janela")],
    pronto: { titulo: "SUA AGÊNCIA", destaque: "DE VIAGENS", subtitulo: "ATENDIMENTO DE GENTE", selo: "PEÇA SEU ORÇAMENTO", fecho: "Peça o seu orçamento agora" },
  },
  // ——— Destinos dos sonhos ———
  { id: "sonhos", cat: "sonhos", nome: "Viagem dos sonhos", resumo: "Pergunta de abertura e ofertas em destaque", modelo: "pergunta", cena: "bangalo-1", capa: ["Qual é a viagem dos", "seus sonhos?"] },
  {
    id: "sonhos-faixa", cat: "sonhos", visual: "faixa", nome: "Para onde você sempre quis ir?", resumo: "Pergunta, lugares de tirar o fôlego e contato", modelo: "pergunta", cena: "balao-1", capa: ["Para onde você", "sempre quis ir?"],
    lista: [it("Ilhas", "de água cristalina", "bangalo"), it("Balão", "ao nascer do sol", "balao"), it("Veleiro", "ao pôr do sol", "veleiro")],
    pronto: { gancho: "Para onde você", ganchoDestaque: "sempre quis ir?", titulo: "DESTINOS", destaque: "DOS SONHOS", subtitulo: "PERTO DE VOCÊ", fecho: "A gente leva você até lá" },
  },
  {
    id: "lugares-azul", cat: "sonhos", visual: "azul", nome: "Lugares para conhecer", resumo: "Lista de lugares incríveis para inspirar", modelo: "lista", cena: "cachoeira-2", capa: ["Lugares para", "conhecer"],
    lista: [it("Praias", "paradisíacas", "praia"), it("Cachoeiras", "escondidas", "cachoeira"), it("Dunas", "a perder de vista", "buggy"), it("Ilhas", "de água clara", "bangalo"), it("Céu", "cheio de balões", "balao")],
    pronto: { titulo: "LUGARES", destaque: "PARA CONHECER", subtitulo: "ANTES DE TUDO", selo: "SALVE ESTE VÍDEO", fecho: "Escolha o próximo e fale com a gente" },
  },
  // ——— Praias e resorts ———
  {
    id: "praia", cat: "praia", nome: "Praias e resorts", resumo: "Para vender verão, praia e all inclusive", modelo: "lista", cena: "resort-1", capa: ["Praias", "e resorts"],
    lista: [it("Praias", "paradisíacas", "praia"), it("Resorts", "all inclusive", "resort"), it("Bangalôs", "sobre o mar", "bangalo"), it("Passeios", "de lancha", "barco"), it("Mergulho", "em águas claras", "mergulho")],
    pronto: { titulo: "PRAIAS", destaque: "E RESORTS", subtitulo: "PARA O SEU VERÃO", fecho: "Seu verão começa aqui" },
  },
  {
    id: "praia-faixa", cat: "praia", visual: "faixa", nome: "Verão dos sonhos", resumo: "Praia, piscina e descanso, com faixa escura", modelo: "lista", cena: "piscina-1", capa: ["Verão", "dos sonhos"],
    lista: [it("Resorts", "com tudo incluso", "resort"), it("Piscinas", "com vista para o mar", "piscina"), it("Café da manhã", "na beira da piscina", "cafe"), it("Lancha", "nas praias vizinhas", "barco")],
    pronto: { titulo: "VERÃO", destaque: "DOS SONHOS", subtitulo: "PRAIA, SOL E DESCANSO", fecho: "Reserve o seu verão" },
  },
  {
    id: "resort-azul", cat: "praia", visual: "azul", nome: "Férias sem preocupação", resumo: "Pergunta e resorts com tudo incluso", modelo: "pergunta", cena: "resort-2", capa: ["Férias sem", "preocupação"],
    lista: [it("Resorts", "com tudo incluso", "resort"), it("Piscinas", "o dia inteiro", "piscina"), it("Bangalôs", "pé na areia", "bangalo")],
    pronto: { gancho: "Já pensou em férias", ganchoDestaque: "sem se preocupar com nada?", titulo: "ALL", destaque: "INCLUSIVE", subtitulo: "É SÓ CHEGAR", fecho: "Fale com a gente e escolha o seu" },
  },
  // ——— Natureza e aventura ———
  {
    id: "aventura", cat: "aventura", nome: "Aventura e natureza", resumo: "Cachoeira, buggy, balão e mergulho", modelo: "lista", cena: "cachoeira-1", capa: ["Aventura", "e natureza"],
    lista: [it("Cachoeiras", "de tirar o fôlego", "cachoeira"), it("Buggy", "nas dunas", "buggy"), it("Balão", "ao nascer do sol", "balao"), it("Mergulho", "com a vida marinha", "mergulho"), it("Veleiro", "ao pôr do sol", "veleiro")],
    pronto: { titulo: "AVENTURA", destaque: "E NATUREZA", subtitulo: "PARA SAIR DA ROTINA", fecho: "Sua aventura começa aqui" },
  },
  {
    id: "aventura-faixa", cat: "aventura", visual: "faixa", nome: "Ecoturismo", resumo: "Trilha, dunas e mergulho, com faixa escura", modelo: "lista", cena: "buggy-1", capa: ["Ecoturismo", "e aventura"],
    lista: [it("Trilhas", "até a cachoeira", "cachoeira"), it("Dunas", "de buggy", "buggy"), it("Mergulho", "de snorkel", "mergulho"), it("Balão", "com vista do alto", "balao")],
    pronto: { titulo: "ECOTURISMO", destaque: "E AVENTURA", subtitulo: "NATUREZA DE PERTO", fecho: "Escolha a sua aventura" },
  },
  {
    id: "aventura-azul", cat: "aventura", visual: "azul", nome: "Cansou da rotina?", resumo: "Pergunta e passeios na natureza", modelo: "pergunta", cena: "mergulho-1", capa: ["Cansou da", "rotina?"],
    lista: [it("Cachoeiras", "água gelada e paz", "cachoeira"), it("Dunas", "adrenalina de buggy", "buggy"), it("Mergulho", "o mar por dentro", "mergulho")],
    pronto: { gancho: "Cansou da rotina e quer", ganchoDestaque: "respirar outro ar?", titulo: "NATUREZA", destaque: "E AVENTURA", subtitulo: "PARA RECARREGAR", fecho: "Vamos planejar a sua aventura" },
  },
  // ——— Lua de mel ———
  {
    id: "lua-de-mel", cat: "lua", nome: "Lua de mel", resumo: "Viagem a dois, com pergunta de abertura", modelo: "pergunta", cena: "casal-1", capa: ["A viagem a dois que", "vocês merecem"],
    lista: [it("A dois", "pôr do sol só de vocês", "casal"), it("Bangalôs", "sobre o mar", "bangalo"), it("Resorts", "com tudo incluso", "resort")],
    pronto: { gancho: "A viagem a dois que vocês", ganchoDestaque: "merecem", titulo: "LUA DE MEL", destaque: "DOS SONHOS", subtitulo: "PARA VOCÊS DOIS", fecho: "A lua de mel de vocês começa aqui" },
  },
  {
    id: "lua-faixa", cat: "lua", visual: "faixa", nome: "Lua de mel · faixa com imagem", resumo: "Momentos a dois em lista, com faixa escura", modelo: "lista", cena: "bangalo-2", capa: ["Lua de mel", "inesquecível"],
    lista: [it("A dois", "no pôr do sol", "casal"), it("Bangalôs", "sobre o mar", "bangalo"), it("Piscinas", "com vista", "piscina"), it("Veleiro", "só vocês dois", "veleiro")],
    pronto: { titulo: "LUA DE MEL", destaque: "INESQUECÍVEL", subtitulo: "COMEÇO DE UMA HISTÓRIA", fecho: "Planeje a lua de mel com a gente" },
  },
  {
    id: "lua-azul", cat: "lua", visual: "azul", nome: "Viagem a dois", resumo: "Para casais: bodas, aniversário ou só porque sim", modelo: "lista", cena: "casal-2", capa: ["Viagem", "a dois"],
    lista: [it("Pôr do sol", "a dois", "casal"), it("Café da manhã", "sem pressa", "cafe"), it("Passeio", "de veleiro", "veleiro"), it("Resort", "para descansar", "resort")],
    pronto: { titulo: "VIAGEM", destaque: "A DOIS", subtitulo: "PARA COMEMORAR", fecho: "Fale com a gente e surpreenda" },
  },
  // ——— Férias em família ———
  {
    id: "familia", cat: "familia", nome: "Férias em família", resumo: "Resorts, praias e passeios para todos", modelo: "lista", cena: "piscina-1", capa: ["Férias", "em família"],
    lista: [it("Resorts", "com piscina", "piscina"), it("Praias", "de águas calmas", "praia"), it("Passeios", "para todas as idades", "barco"), it("Hotéis", "com café da manhã", "cafe")],
    pronto: { titulo: "FÉRIAS", destaque: "EM FAMÍLIA", subtitulo: "TODO MUNDO JUNTO", fecho: "As férias da família começam aqui" },
  },
  {
    id: "familia-faixa", cat: "familia", visual: "faixa", nome: "As crianças já perguntaram?", resumo: "Pergunta para os pais e opções de férias", modelo: "pergunta", cena: "praia-2", capa: ["As crianças já", "perguntaram das férias?"],
    lista: [it("Resorts", "com piscina e diversão", "piscina"), it("Praias", "de mar calmo", "praia"), it("Passeios", "de barco", "barco")],
    pronto: { gancho: "As crianças já", ganchoDestaque: "perguntaram das férias?", titulo: "FÉRIAS", destaque: "EM FAMÍLIA", subtitulo: "SEM DOR DE CABEÇA", fecho: "A gente planeja tudo para vocês" },
  },
  {
    id: "familia-azul", cat: "familia", visual: "azul", nome: "Família reunida", resumo: "Lista de passeios para todas as idades", modelo: "lista", cena: "barco-1", capa: ["Família", "reunida"],
    lista: [it("Piscinas", "para a criançada", "piscina"), it("Lancha", "nas praias", "barco"), it("Buggy", "nas dunas", "buggy"), it("Café da manhã", "todo mundo junto", "cafe")],
    pronto: { titulo: "FAMÍLIA", destaque: "REUNIDA", subtitulo: "MEMÓRIAS PARA SEMPRE", fecho: "Vamos montar as férias de vocês" },
  },
  // ——— Viagem em grupo ———
  {
    id: "grupo", cat: "grupo", nome: "Viagem em grupo", resumo: "Amigos, família ou empresa viajando juntos", modelo: "lista", cena: "barco-2", capa: ["Viagem", "em grupo"],
    lista: [it("Amigos", "na mesma viagem", "praia"), it("Passeios", "para o grupo todo", "barco"), it("Hotéis", "para todo mundo junto", "resort"), it("Roteiros", "montados para vocês", "balao")],
    pronto: { titulo: "VIAGEM", destaque: "EM GRUPO", subtitulo: "COM QUEM VOCÊ GOSTA", fecho: "Junte a turma e fale com a gente" },
  },
  {
    id: "grupo-faixa", cat: "grupo", visual: "faixa", nome: "Bora juntar a turma?", resumo: "Pergunta e ideias de viagem para grupos", modelo: "pergunta", cena: "veleiro-1", capa: ["Bora juntar", "a turma?"],
    lista: [it("Veleiro", "com os amigos", "veleiro"), it("Praia", "para o grupo todo", "praia"), it("Dunas", "de buggy", "buggy")],
    pronto: { gancho: "Bora juntar a turma", ganchoDestaque: "e viajar?", titulo: "VIAGEM", destaque: "EM GRUPO", subtitulo: "TODO MUNDO JUNTO", fecho: "Monte a viagem do seu grupo" },
  },
  // ——— Excursões ———
  {
    id: "excursao", cat: "excursao", nome: "Excursões", resumo: "Saídas em grupo com roteiro pronto", modelo: "lista", cena: "praia-2", capa: ["Excursões", "em grupo"],
    lista: [it("Roteiros", "bem planejados", "balao"), it("Passeios", "em grupo", "barco"), it("Hotéis", "selecionados", "resort"), it("Paradas", "para conhecer mais", "cachoeira")],
    pronto: { titulo: "EXCURSÕES", destaque: "EM GRUPO", subtitulo: "É SÓ EMBARCAR", selo: "SAÍDAS EM GRUPO", fecho: "Garanta o seu lugar" },
  },
  {
    id: "excursao-azul", cat: "excursao", visual: "azul", nome: "Próxima excursão", resumo: "Pergunta e o que a excursão tem", modelo: "pergunta", cena: "cachoeira-1", capa: ["Já garantiu a", "próxima excursão?"],
    lista: [it("Roteiro", "com tudo organizado", "balao"), it("Passeios", "com o grupo", "cachoeira"), it("Hotel", "já reservado", "resort")],
    pronto: { gancho: "Já garantiu o seu lugar", ganchoDestaque: "na próxima excursão?", titulo: "EXCURSÃO", destaque: "EM GRUPO", subtitulo: "É SÓ EMBARCAR", fecho: "Chame a gente e reserve" },
  },
  // ——— Voos e passagens ———
  {
    id: "voos", cat: "voos", nome: "Passagens aéreas", resumo: "Voos nacionais e internacionais", modelo: "lista", cena: "janela-1", capa: ["Passagens", "aéreas"],
    lista: [it("Nacionais", "para todo o Brasil", "janela"), it("Internacionais", "para o mundo", "aeroporto"), it("Ida e volta", "do seu jeito", "janela"), it("Ajuda", "para escolher o voo", "aeroporto")],
    pronto: { titulo: "PASSAGENS", destaque: "AÉREAS", subtitulo: "NO BRASIL E NO MUNDO", selo: "PEÇA SUA COTAÇÃO", fecho: "Peça a cotação da sua passagem" },
  },
  {
    id: "voos-faixa", cat: "voos", visual: "faixa", nome: "Cansou de procurar voo?", resumo: "Pergunta e a ajuda da agência para comprar", modelo: "pergunta", cena: "aeroporto-2", capa: ["Cansou de", "procurar voo?"],
    lista: [it("Passagens", "nacionais e internacionais", "janela"), it("Horários", "que cabem na agenda", "aeroporto"), it("Destinos", "no Brasil e no exterior", "praia")],
    pronto: { gancho: "Cansou de passar horas", ganchoDestaque: "procurando voo?", titulo: "A GENTE", destaque: "PROCURA", subtitulo: "VOCÊ SÓ EMBARCA", fecho: "Mande o destino e a data" },
  },
  {
    id: "voos-azul", cat: "voos", visual: "azul", nome: "Embarque com a gente", resumo: "Lista do que a agência resolve no voo", modelo: "lista", cena: "janela-2", capa: ["Embarque", "com a gente"],
    lista: [it("Passagem", "no melhor horário", "janela"), it("Bagagem", "sem surpresa", "aeroporto"), it("Conexões", "bem planejadas", "aeroporto"), it("Hotel", "na chegada", "resort")],
    pronto: { titulo: "EMBARQUE", destaque: "COM A GENTE", subtitulo: "VIAGEM SEM ESTRESSE", fecho: "Fale com a gente e embarque" },
  },
  // ——— Transfer ———
  {
    id: "transfer", cat: "transfer", nome: "Transfer", resumo: "Aeroporto, hotel e passeios", modelo: "lista", cena: "aeroporto-1", capa: ["Transfer", "aeroporto e hotel"],
    lista: [it("Aeroporto", "busca na chegada", "aeroporto"), it("Hotel", "direto na porta", "resort"), it("Passeios", "ida e volta", "buggy"), it("Grupos", "carro ou van", "praia")],
    pronto: { titulo: "TRANSFER", destaque: "SEM ESTRESSE", subtitulo: "DO AEROPORTO AO HOTEL", selo: "RESERVE COM ANTECEDÊNCIA", fecho: "Reserve o seu transfer" },
  },
  {
    id: "transfer-faixa", cat: "transfer", visual: "faixa", nome: "Chegou e já tem quem busque", resumo: "Frase de abertura e os trechos do transfer", modelo: "pergunta", cena: "janela-2", capa: ["Chegou e já tem", "quem te busque"],
    lista: [it("Aeroporto", "até o hotel", "aeroporto"), it("Hotel", "até o passeio", "resort"), it("Passeios", "sem dor de cabeça", "buggy")],
    pronto: { gancho: "Desceu do avião e", ganchoDestaque: "já tem quem te busque", titulo: "TRANSFER", destaque: "RESERVADO", subtitulo: "É SÓ CHEGAR", fecho: "Reserve o seu transfer com a gente" },
  },
  // ——— Datas especiais ———
  {
    id: "black", cat: "datas", visual: "azul", nome: "Black Friday de viagens", resumo: "Para novembro: chame para as ofertas da agência", modelo: "lista", cena: "praia-1", capa: ["Black Friday", "de viagens"],
    lista: [it("Pacotes", "para o verão", "praia"), it("Resorts", "com tudo incluso", "resort"), it("Passagens", "para as férias", "janela"), it("Cruzeiros", "pela costa", "veleiro")],
    pronto: { titulo: "BLACK", destaque: "FRIDAY", subtitulo: "DE VIAGENS", selo: "OFERTAS ESPECIAIS", fecho: "Chame a gente e veja as ofertas" },
  },
  {
    id: "fim-de-ano", cat: "datas", visual: "faixa", nome: "Natal e Réveillon", resumo: "Fim de ano viajando", modelo: "lista", cena: "praia-2", capa: ["Fim de ano", "viajando"],
    lista: [it("Réveillon", "na praia", "praia"), it("Natal", "em família", "piscina"), it("Resorts", "com festa de virada", "resort"), it("Passeios", "para começar o ano", "barco")],
    pronto: { titulo: "FIM DE ANO", destaque: "VIAJANDO", subtitulo: "NATAL E RÉVEILLON", fecho: "Garanta o seu fim de ano" },
  },
  {
    id: "ferias-julho", cat: "datas", nome: "Férias de julho", resumo: "Pergunta para as férias do meio do ano", modelo: "pergunta", cena: "piscina-2", capa: ["Já planejou as", "férias de julho?"],
    lista: [it("Resorts", "com a criançada", "piscina"), it("Praias", "do Nordeste", "praia"), it("Aventura", "de buggy", "buggy")],
    pronto: { gancho: "Já planejou as", ganchoDestaque: "férias de julho?", titulo: "FÉRIAS", destaque: "DE JULHO", subtitulo: "PLANEJE AGORA", fecho: "Fale com a gente e garanta" },
  },
  {
    id: "feriado", cat: "datas", visual: "azul", nome: "Feriado prolongado", resumo: "Para feriadão: viagens curtas e perto", modelo: "lista", cena: "cachoeira-2", capa: ["Feriadão", "à vista"],
    lista: [it("Bate e volta", "para descansar", "praia"), it("Pousadas", "perto de casa", "resort"), it("Cachoeiras", "para recarregar", "cachoeira"), it("Passeios", "de barco", "barco")],
    pronto: { titulo: "FERIADÃO", destaque: "À VISTA", subtitulo: "JÁ PLANEJOU?", fecho: "Aproveite o feriado viajando" },
  },
  {
    id: "namorados", cat: "datas", visual: "faixa", nome: "Dia dos Namorados", resumo: "Viagem a dois de presente", modelo: "pergunta", cena: "casal-1", capa: ["Que tal dar de presente", "uma viagem a dois?"],
    lista: [it("A dois", "no pôr do sol", "casal"), it("Bangalôs", "sobre o mar", "bangalo"), it("Veleiro", "só vocês dois", "veleiro")],
    pronto: { gancho: "Que tal dar de presente", ganchoDestaque: "uma viagem a dois?", titulo: "DIA DOS", destaque: "NAMORADOS", subtitulo: "PRESENTE QUE FICA", fecho: "Fale com a gente e surpreenda" },
  },
  {
    id: "maes", cat: "datas", nome: "Dia das Mães", resumo: "Viagem de presente para a mãe", modelo: "lista", cena: "cafe-1", capa: ["Presente de", "Dia das Mães"],
    lista: [it("Descanso", "em resort", "resort"), it("Café da manhã", "sem pressa", "cafe"), it("Praia", "com a família", "praia"), it("Passeio", "de barco", "barco")],
    pronto: { titulo: "DIA DAS", destaque: "MÃES", subtitulo: "PRESENTEIE COM VIAGEM", fecho: "Monte o presente com a gente" },
  },

  // ——————— Modelos AIDA (17/11): 1ª cena chama a atenção (gancho), depois interesse, desejo e a chamada no fim ———————
  // Pacote personalizado: o que o agente mais vende
  {
    id: "personalizado-aida", cat: "personalizado", visual: "luxo", nome: "Viagem montada para você", resumo: "AIDA: gancho, o que entra no pacote e chamada", modelo: "pergunta", cena: "casal-2", capa: ["Uma viagem montada", "só para você"],
    lista: [it("Voo", "no horário que você prefere", "janela"), it("Hotel", "do jeito que você gosta", "resort"), it("Passeios", "só o que tem a ver com você", "barco"), it("Transfer", "do aeroporto ao hotel", "aeroporto")],
    pronto: { gancho: "Já pensou numa viagem montada", ganchoDestaque: "só para você?", virada: "Você escolhe o destino,", viradaDestaque: "a gente monta o resto", titulo: "PACOTE", destaque: "PERSONALIZADO", subtitulo: "DO SEU JEITO", selo: "FEITO SOB MEDIDA", pilulas: ["VOO", "HOTEL", "PASSEIOS"], fecho: "Conte a sua viagem e receba a proposta" },
  },
  {
    id: "personalizado-passos", cat: "personalizado", visual: "cartao", nome: "Sua viagem em 4 passos", resumo: "Como a agência monta o pacote sob medida", modelo: "lista", cena: "janela-2", capa: ["Sua viagem", "sob medida"],
    lista: [it("Você conta", "destino, datas e orçamento", "janela"), it("A gente monta", "voo, hotel e passeios", "aeroporto"), it("Você aprova", "e ajusta o que quiser", "cafe"), it("Boa viagem", "com suporte do início ao fim", "praia")],
    pronto: { titulo: "SUA VIAGEM", destaque: "SOB MEDIDA", subtitulo: "EM 4 PASSOS", selo: "PEÇA SUA PROPOSTA", fecho: "Mande o destino e a data" },
  },
  {
    id: "personalizado-cansou", cat: "personalizado", visual: "vibrante", nome: "Pacote com a sua cara", resumo: "AIDA para quem não gosta de pacote pronto", modelo: "pergunta", cena: "aeroporto-1", capa: ["Pacote pronto", "não tem a sua cara?"],
    lista: [it("Datas", "que cabem na sua agenda", "janela"), it("Hospedagem", "no seu estilo", "bangalo"), it("Roteiro", "com o que você ama", "cachoeira")],
    pronto: { gancho: "Cansou de pacote pronto", ganchoDestaque: "que não tem a sua cara?", virada: "Aqui a viagem", viradaDestaque: "começa por você", titulo: "VIAGEM", destaque: "PERSONALIZADA", subtitulo: "DO SEU JEITO", selo: "ROTEIRO SÓ SEU", pilulas: ["DATAS", "HOTEL", "ROTEIRO"], fecho: "Fale com a gente e monte a sua" },
  },
  {
    id: "personalizado-dias", cat: "personalizado", visual: "revista", nome: "Quantos dias você tem?", resumo: "AIDA: roteiro sob medida para o tempo que você tem", modelo: "pergunta", cena: "balao-2", capa: ["Tem só 3 dias?", "Dá para viajar bem"],
    lista: [it("Fim de semana", "perto e sem pressa", "praia"), it("5 dias", "o essencial do destino", "balao"), it("10 dias", "para viver tudo com calma", "veleiro")],
    pronto: { gancho: "Se você tem apenas 3 dias,", ganchoDestaque: "dá para viajar bem", virada: "A gente encaixa a viagem", viradaDestaque: "no tempo que você tem", titulo: "ROTEIRO", destaque: "SOB MEDIDA", subtitulo: "FEITO POR QUEM ENTENDE", selo: "PLANEJADO PARA VOCÊ", pilulas: ["FIM DE SEMANA", "FERIADO", "FÉRIAS"], fecho: "Conte quantos dias você tem" },
  },
  // Pacotes completos
  {
    id: "pacotes-aida", cat: "pacotes", visual: "azul", nome: "Pacote completo", resumo: "AIDA: aéreo, hotel e transfer num pacote só", modelo: "pergunta", cena: "praia-1", capa: ["Aéreo, hotel e transfer", "num pacote só"],
    lista: [it("Aéreo", "ida e volta", "janela"), it("Hotel", "com café da manhã", "cafe"), it("Transfer", "aeroporto e hotel", "aeroporto"), it("Passeios", "no destino", "barco")],
    pronto: { gancho: "Já tem data marcada", ganchoDestaque: "para viajar?", virada: "Aéreo, hotel e transfer", viradaDestaque: "num pacote só", titulo: "PACOTE", destaque: "COMPLETO", subtitulo: "É SÓ FAZER A MALA", selo: "TUDO EM UM SÓ LUGAR", pilulas: ["AÉREO", "HOTEL", "TRANSFER"], fecho: "Peça o seu pacote completo" },
  },
  {
    id: "pacotes-lista", cat: "pacotes", visual: "neon", nome: "Pacotes aéreo + hotel", resumo: "O que vem no pacote, em lista numerada", modelo: "lista", cena: "bangalo-1", capa: ["Pacotes", "aéreo + hotel"],
    lista: [it("Aéreo", "saindo da sua cidade", "aeroporto"), it("Hotel", "perto de tudo", "resort"), it("Café da manhã", "todos os dias", "cafe"), it("Transfer", "sem preocupação", "aeroporto"), it("Seguro viagem", "para viajar tranquilo", "janela")],
    pronto: { titulo: "PACOTES", destaque: "COMPLETOS", subtitulo: "AÉREO + HOTEL", selo: "PEÇA SUA COTAÇÃO", fecho: "Escolha o destino e fale com a gente" },
  },
  {
    id: "pacotes-erro", cat: "pacotes", visual: "passagem", nome: "Não cometa esse erro", resumo: "AIDA: por que comprar o pacote com a agência", modelo: "pergunta", cena: "janela-1", capa: ["Quando for viajar,", "não cometa esse erro"],
    lista: [it("Voo", "no melhor horário", "janela"), it("Hotel", "bem localizado", "resort"), it("Transfer", "esperando na chegada", "aeroporto")],
    pronto: { gancho: "Quando for viajar,", ganchoDestaque: "não cometa esse erro", virada: "Comprar tudo separado", viradaDestaque: "dá muito mais trabalho", titulo: "PACOTE", destaque: "COMPLETO", subtitulo: "UMA COMPRA SÓ", selo: "UM ATENDIMENTO SÓ", pilulas: ["VOO", "HOTEL", "TRANSFER"], fecho: "Deixe tudo com a gente" },
  },
  {
    id: "pacotes-destinos", cat: "pacotes", visual: "postal", nome: "Pacotes para todo lado", resumo: "Nacionais e internacionais, em lista", modelo: "lista", cena: "veleiro-2", capa: ["Pacotes nacionais", "e internacionais"],
    lista: [it("Nordeste", "praias de água morna", "praia"), it("Serras", "frio e aconchego", "cachoeira"), it("Caribe", "mar azul-turquesa", "bangalo"), it("Europa", "história e cultura", "balao")],
    pronto: { titulo: "PACOTES", destaque: "NACIONAIS", subtitulo: "E INTERNACIONAIS", selo: "FALE COM A GENTE", fecho: "Para onde vai ser a próxima?" },
  },
  // Voos e passagens
  {
    id: "voos-aida", cat: "voos", visual: "passagem", nome: "Antes de comprar seu voo", resumo: "AIDA: gancho, o que a agência confere e chamada", modelo: "pergunta", cena: "aeroporto-2", capa: ["Veja isso antes de", "comprar seu voo"],
    lista: [it("Horário", "que cabe na sua agenda", "janela"), it("Bagagem", "sem surpresa no embarque", "aeroporto"), it("Conexões", "bem planejadas", "aeroporto")],
    pronto: { gancho: "Se for viajar,", ganchoDestaque: "veja isso antes de comprar seu voo", virada: "Horário, bagagem e conexão:", viradaDestaque: "a gente confere tudo", titulo: "PASSAGENS", destaque: "AÉREAS", subtitulo: "NO BRASIL E NO MUNDO", selo: "PEÇA SUA COTAÇÃO", pilulas: ["NACIONAIS", "INTERNACIONAIS", "GRUPOS"], fecho: "Mande o destino e as datas" },
  },
  {
    id: "voos-neon", cat: "voos", visual: "neon", nome: "Passagem na mão", resumo: "Os voos que a agência emite, em lista", modelo: "lista", cena: "janela-2", capa: ["Passagem", "na mão"],
    lista: [it("Nacionais", "para todas as capitais", "janela"), it("Internacionais", "para o mundo", "aeroporto"), it("Grupos", "família e amigos", "aeroporto"), it("Remarcação", "ajuda quando precisar", "janela")],
    pronto: { titulo: "PASSAGEM", destaque: "NA MÃO", subtitulo: "VIAGEM GARANTIDA", selo: "COTE COM A GENTE", fecho: "Peça a cotação agora" },
  },
  // Transfer
  {
    id: "transfer-luxo", cat: "transfer", visual: "luxo", nome: "Transfer privativo", resumo: "AIDA: chegar e ter alguém esperando", modelo: "pergunta", cena: "resort-2", capa: ["Chegar e ter alguém", "esperando por você"],
    lista: [it("Aeroporto", "recepção na chegada", "aeroporto"), it("Hotel", "direto na porta", "resort"), it("Passeios", "ida e volta", "buggy")],
    pronto: { gancho: "Chegar e ter alguém", ganchoDestaque: "esperando por você", virada: "Sem fila de táxi,", viradaDestaque: "sem estresse", titulo: "TRANSFER", destaque: "PRIVATIVO", subtitulo: "CONFORTO DO INÍCIO AO FIM", selo: "RESERVE ANTES", pilulas: ["AEROPORTO", "HOTEL", "PASSEIOS"], fecho: "Reserve o seu transfer" },
  },
  {
    id: "transfer-cartao", cat: "transfer", visual: "cartao", nome: "Transfer in e out", resumo: "Chegada, saída e passeios com motorista", modelo: "lista", cena: "aeroporto-2", capa: ["Transfer", "in e out"],
    lista: [it("Chegada", "busca no aeroporto", "aeroporto"), it("Saída", "do hotel ao voo", "janela"), it("Passeios", "com motorista", "buggy"), it("Grupos", "van para todo mundo", "barco")],
    pronto: { titulo: "TRANSFER", destaque: "IN E OUT", subtitulo: "AEROPORTO E HOTEL", selo: "PEÇA SEU ORÇAMENTO", fecho: "Agende o seu transfer" },
  },
  // Casamento e bodas
  {
    id: "casamento-praia", cat: "casamento", visual: "luxo", nome: "Casamento pé na areia", resumo: "AIDA: destination wedding com os convidados", modelo: "pergunta", cena: "veleiro-1", capa: ["Já pensou em casar", "pé na areia?"],
    lista: [it("Cerimônia", "de frente para o mar", "praia"), it("Convidados", "voo e hotel para todos", "resort"), it("Lua de mel", "logo depois da festa", "bangalo")],
    pronto: { gancho: "Já pensou em casar", ganchoDestaque: "pé na areia?", virada: "A gente cuida da viagem", viradaDestaque: "de todos os convidados", titulo: "CASAMENTO", destaque: "NA PRAIA", subtitulo: "DESTINATION WEDDING", selo: "PLANEJE COM A GENTE", pilulas: ["NOIVOS", "CONVIDADOS", "LUA DE MEL"], fecho: "Conte a data e o destino" },
  },
  {
    id: "casamento-noivos", cat: "casamento", visual: "postal", nome: "Viagem dos noivos", resumo: "Do sim à lua de mel, em lista", modelo: "lista", cena: "casal-1", capa: ["Viagem", "dos noivos"],
    lista: [it("Lua de mel", "no paraíso", "bangalo"), it("Hospedagem", "para os convidados", "resort"), it("Transfer", "no grande dia", "aeroporto"), it("Passeios", "a dois", "veleiro")],
    pronto: { titulo: "VIAGEM", destaque: "DOS NOIVOS", subtitulo: "DO SIM À LUA DE MEL", selo: "PEÇA SUA PROPOSTA", fecho: "Planeje a viagem do casamento" },
  },
  {
    id: "bodas", cat: "casamento", visual: "revista", nome: "Bodas a dois", resumo: "AIDA: comemorar os anos de casados viajando", modelo: "pergunta", cena: "casal-2", capa: ["Quantos anos de", "casados vocês fazem?"],
    lista: [it("Jantar", "ao pôr do sol", "casal"), it("Resort", "para descansar", "resort"), it("Veleiro", "só vocês dois", "veleiro")],
    pronto: { gancho: "Quantos anos de casados", ganchoDestaque: "vocês vão comemorar?", virada: "Bodas pedem", viradaDestaque: "uma viagem especial", titulo: "BODAS", destaque: "A DOIS", subtitulo: "PARA COMEMORAR", selo: "SURPREENDA", pilulas: ["JANTAR", "RESORT", "PASSEIOS"], fecho: "Fale com a gente e surpreenda" },
  },
  {
    id: "casamento-convidados", cat: "casamento", visual: "cartao", nome: "Convidados em grupo", resumo: "Passagem, hotel e transfer para os convidados", modelo: "lista", cena: "resort-1", capa: ["Convidados", "em grupo"],
    lista: [it("Passagens", "para todos os convidados", "janela"), it("Hotel", "perto da festa", "resort"), it("Transfer", "ida e volta", "aeroporto"), it("Passeios", "no dia seguinte", "barco")],
    pronto: { titulo: "CONVIDADOS", destaque: "EM GRUPO", subtitulo: "NO SEU CASAMENTO", selo: "ATENDIMENTO PARA GRUPOS", fecho: "Monte a viagem dos convidados" },
  },
  // Um AIDA a mais nas categorias que já existiam
  {
    id: "servicos-aida", cat: "servicos", visual: "vibrante", nome: "Ainda não programou nada?", resumo: "AIDA: tudo da agência num lugar só", modelo: "pergunta", cena: "aeroporto-1", capa: ["Vai viajar e ainda", "não programou nada?"],
    lista: [it("Passagens", "nacionais e internacionais", "janela"), it("Pacotes", "completos ou do seu jeito", "praia"), it("Transfer", "aeroporto e hotel", "aeroporto"), it("Seguro viagem", "para viajar tranquilo", "janela")],
    pronto: { gancho: "Vai viajar e ainda", ganchoDestaque: "não programou nada?", virada: "Voo, hotel, transfer e passeios", viradaDestaque: "num lugar só", titulo: "SUA AGÊNCIA", destaque: "DE VIAGENS", subtitulo: "ATENDIMENTO DE GENTE", selo: "FALE COM A GENTE", pilulas: ["PASSAGENS", "PACOTES", "TRANSFER"], fecho: "Conte a sua viagem para a gente" },
  },
  {
    id: "sonhos-aida", cat: "sonhos", visual: "neon", nome: "Desafio de 1 minuto", resumo: "AIDA: lugares para se apaixonar", modelo: "pergunta", cena: "balao-2", capa: ["Duvido você não se", "apaixonar por esse lugar"],
    lista: [it("Balões", "ao nascer do sol", "balao"), it("Ilhas", "de água cristalina", "bangalo"), it("Cachoeiras", "escondidas", "cachoeira")],
    pronto: { gancho: "Eu desafio você a não se apaixonar", ganchoDestaque: "por esse lugar", virada: "O destino dos sonhos", viradaDestaque: "está mais perto do que parece", titulo: "DESTINOS", destaque: "DOS SONHOS", subtitulo: "PARA CONHECER", selo: "PLANEJE O SEU", pilulas: ["BALÕES", "ILHAS", "CACHOEIRAS"], fecho: "Escolha o seu e fale com a gente" },
  },
  {
    id: "praia-aida", cat: "praia", visual: "postal", nome: "Nem parece o Brasil", resumo: "AIDA: praia paradisíaca com aéreo e hotel", modelo: "pergunta", cena: "praia-1", capa: ["Nem parece o Brasil,", "mas é aqui pertinho"],
    lista: [it("Praias", "de água cristalina", "praia"), it("Resort", "pé na areia", "resort"), it("Lancha", "pelas ilhas", "barco")],
    pronto: { gancho: "Nem parece o Brasil,", ganchoDestaque: "mas é aqui pertinho", virada: "Água clara, areia branca", viradaDestaque: "e você lá", titulo: "PRAIAS", destaque: "PARADISÍACAS", subtitulo: "PACOTE COMPLETO", selo: "AÉREO E HOTEL", pilulas: ["AÉREO", "RESORT", "PASSEIOS"], fecho: "Reserve o seu verão" },
  },
  {
    id: "aventura-aida", cat: "aventura", visual: "vibrante", nome: "Poucas pessoas sabem", resumo: "AIDA: dunas, trilha e cachoeira numa viagem só", modelo: "pergunta", cena: "buggy-2", capa: ["Poucas pessoas sabem", "que existe um lugar assim"],
    lista: [it("Dunas", "de buggy", "buggy"), it("Trilha", "até a cachoeira", "cachoeira"), it("Mergulho", "de snorkel", "mergulho")],
    pronto: { gancho: "Poucas pessoas sabem", ganchoDestaque: "que existe um lugar assim", virada: "Trilha, dunas e cachoeira", viradaDestaque: "na mesma viagem", titulo: "NATUREZA", destaque: "E AVENTURA", subtitulo: "ROTEIRO COMPLETO", selo: "PARA SAIR DA ROTINA", pilulas: ["DUNAS", "TRILHAS", "MERGULHO"], fecho: "Vamos montar a sua aventura" },
  },
  {
    id: "lua-aida", cat: "lua", visual: "luxo", nome: "Lua de mel é uma vez só", resumo: "AIDA: lua de mel personalizada", modelo: "pergunta", cena: "bangalo-2", capa: ["Lua de mel", "é uma vez só"],
    lista: [it("Bangalô", "sobre o mar", "bangalo"), it("Jantar", "ao pôr do sol", "casal"), it("Veleiro", "só vocês dois", "veleiro")],
    pronto: { gancho: "Lua de mel", ganchoDestaque: "é uma vez só", virada: "Bangalô sobre o mar,", viradaDestaque: "jantar a dois", titulo: "LUA DE MEL", destaque: "NO PARAÍSO", subtitulo: "PACOTE PERSONALIZADO", selo: "PLANEJADO A DOIS", pilulas: ["BANGALÔ", "JANTAR", "PASSEIOS"], fecho: "A lua de mel de vocês começa aqui" },
  },
  {
    id: "familia-aida", cat: "familia", visual: "cartao", nome: "Férias sem dor de cabeça", resumo: "AIDA: a agência pensa em tudo para a família", modelo: "pergunta", cena: "piscina-2", capa: ["Férias em família", "sem dor de cabeça"],
    lista: [it("Resort", "com piscina", "piscina"), it("Voo", "no horário das crianças", "janela"), it("Passeios", "para todo mundo", "barco")],
    pronto: { gancho: "Férias em família", ganchoDestaque: "sem dor de cabeça", virada: "A gente pensa em tudo:", viradaDestaque: "do voo ao passeio", titulo: "FÉRIAS", destaque: "EM FAMÍLIA", subtitulo: "PACOTE COMPLETO", selo: "PARA TODAS AS IDADES", pilulas: ["VOO", "RESORT", "PASSEIOS"], fecho: "Monte as férias da família" },
  },
  {
    id: "grupo-amigos", cat: "grupo", visual: "neon", nome: "Turma de amigos", resumo: "Passeios para fazer com a turma, em lista", modelo: "lista", cena: "buggy-1", capa: ["Turma", "de amigos"],
    lista: [it("Buggy", "nas dunas", "buggy"), it("Lancha", "o dia todo", "barco"), it("Praia", "para o grupo todo", "praia"), it("Hotel", "todo mundo junto", "resort")],
    pronto: { titulo: "TURMA", destaque: "DE AMIGOS", subtitulo: "VIAGEM EM GRUPO", selo: "JUNTE A GALERA", fecho: "Junte a turma e fale com a gente" },
  },
  {
    id: "grupo-empresa", cat: "grupo", visual: "cartao", nome: "Viagem corporativa", resumo: "AIDA: voo, hotel e transfer para a equipe", modelo: "pergunta", cena: "resort-2", capa: ["Sua empresa vai", "viajar em grupo?"],
    lista: [it("Passagens", "para toda a equipe", "janela"), it("Hotel", "com estrutura", "resort"), it("Transfer", "ida e volta", "aeroporto")],
    pronto: { gancho: "Sua empresa vai", ganchoDestaque: "viajar em grupo?", virada: "Voo, hotel e transfer", viradaDestaque: "para a equipe toda", titulo: "VIAGEM", destaque: "CORPORATIVA", subtitulo: "EM GRUPO", selo: "PEÇA SUA PROPOSTA", pilulas: ["PASSAGENS", "HOTEL", "TRANSFER"], fecho: "Fale com a gente e organize" },
  },
  {
    id: "excursao-aida", cat: "excursao", visual: "vibrante", nome: "Roteiro pronto, é só embarcar", resumo: "AIDA: excursão com tudo organizado", modelo: "pergunta", cena: "barco-1", capa: ["Quer viajar", "em grupo este ano?"],
    lista: [it("Roteiro", "com tudo organizado", "balao"), it("Passeios", "com o grupo", "barco"), it("Hotel", "já reservado", "resort")],
    pronto: { gancho: "Atenção quem quer viajar", ganchoDestaque: "em grupo este ano!", virada: "Roteiro pronto,", viradaDestaque: "é só embarcar", titulo: "EXCURSÃO", destaque: "EM GRUPO", subtitulo: "SAÍDAS PROGRAMADAS", selo: "GARANTA SEU LUGAR", pilulas: ["ROTEIRO", "PASSEIOS", "HOTEL"], fecho: "Garanta o seu lugar" },
  },
  {
    id: "excursao-fds", cat: "excursao", visual: "passagem", nome: "Excursão de fim de semana", resumo: "Bate e volta e passeios curtos, em lista", modelo: "lista", cena: "cachoeira-2", capa: ["Excursão de", "fim de semana"],
    lista: [it("Cachoeiras", "para recarregar", "cachoeira"), it("Praias", "perto de casa", "praia"), it("Dunas", "de buggy", "buggy"), it("Passeio", "de barco", "barco")],
    pronto: { titulo: "EXCURSÕES", destaque: "DE FIM DE SEMANA", subtitulo: "BATE E VOLTA", selo: "SAÍDAS EM GRUPO", fecho: "Reserve o seu lugar" },
  },
  // Datas especiais (sazonais)
  {
    id: "black-aida", cat: "datas", visual: "bf", nome: "Black Friday · AIDA", resumo: "Para novembro: gancho, ofertas da agência e chamada", modelo: "pergunta", cena: "resort-1", capa: ["Vai viajar", "no próximo ano?"],
    lista: [it("Pacotes", "para o verão", "praia"), it("Resorts", "com tudo incluso", "resort"), it("Passagens", "para as férias", "janela")],
    pronto: { gancho: "Atenção quem planeja", ganchoDestaque: "viajar no próximo ano!", virada: "A Black Friday", viradaDestaque: "é a hora de garantir", titulo: "BLACK", destaque: "FRIDAY", subtitulo: "DE VIAGENS", selo: "OFERTAS DA AGÊNCIA", pilulas: ["PACOTES", "RESORTS", "PASSAGENS"], fecho: "Chame a gente e veja as ofertas" },
  },
  {
    id: "dia-dos-pais", cat: "datas", visual: "luxo", nome: "Dia dos Pais", resumo: "AIDA: viagem de presente para o pai", modelo: "pergunta", cena: "barco-2", capa: ["Que tal dar ao seu pai", "uma viagem?"],
    lista: [it("Lancha", "um dia no mar", "barco"), it("Resort", "para descansar", "resort"), it("Aventura", "de buggy", "buggy")],
    pronto: { gancho: "Que tal dar ao seu pai", ganchoDestaque: "uma viagem de presente?", virada: "Presente que vira", viradaDestaque: "lembrança para sempre", titulo: "DIA DOS", destaque: "PAIS", subtitulo: "PRESENTEIE COM VIAGEM", selo: "PRESENTE QUE FICA", pilulas: ["PASSEIOS", "RESORT", "AVENTURA"], fecho: "Monte o presente com a gente" },
  },
  {
    id: "carnaval", cat: "datas", visual: "vibrante", nome: "Carnaval viajando", resumo: "Folia ou descanso no feriado", modelo: "lista", cena: "praia-2", capa: ["Carnaval", "viajando"],
    lista: [it("Praias", "para curtir o feriado", "praia"), it("Resorts", "longe da folia", "resort"), it("Passeios", "de barco", "barco"), it("Natureza", "para descansar", "cachoeira")],
    pronto: { titulo: "CARNAVAL", destaque: "VIAJANDO", subtitulo: "FOLIA OU DESCANSO", selo: "PLANEJE AGORA", fecho: "Garanta o seu carnaval" },
  },
];

export const prontoDe = (v: VideoPronto) =>
  v.pronto || v.lista || v.visual
    ? { ...v.pronto, ...(v.visual ? { visual: v.visual } : {}), ...(v.lista ? { [v.modelo === "lista" ? "itens" : "ofertas"]: v.lista } : {}) }
    : undefined;
