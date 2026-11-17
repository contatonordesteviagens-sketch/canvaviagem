// Catálogo dos vídeos prontos da Fábrica (Início e "Que vídeo você quer fazer?").
// Cada vídeo usa o motor dos vídeos prontos do VideoLab: "lista" (serviços numerados) ou "pergunta" (frase de abertura e ofertas).
// Os textos são exemplos que a agência troca; nada de desconto, número ou depoimento inventado.
// Fundos disponíveis (public/video-fundos): praia, resort, cafe, buggy, mergulho, casal, cachoeira, piscina, barco, aeroporto, janela, bangalo, veleiro, balao.

export type Item = { titulo: string; sub: string; fundo: string };
export type VisualVideo = "classico" | "faixa" | "azul";
export type CategoriaVideo = "servicos" | "sonhos" | "praia" | "aventura" | "lua" | "familia" | "grupo" | "excursao" | "voos" | "transfer" | "datas";
export type VideoPronto = {
  id: string; nome: string; resumo: string; modelo: "lista" | "pergunta"; cena: string;
  cat: CategoriaVideo; visual?: VisualVideo;
  /** texto do cartão (o vídeo de verdade é desenhado pelo gerador) */
  capa: [string, string];
  pronto?: Record<string, unknown>;
  lista?: Item[];
};

export const CATEGORIAS_VIDEO: { id: CategoriaVideo; nome: string }[] = [
  { id: "servicos", nome: "Serviços" }, { id: "sonhos", nome: "Destinos dos sonhos" }, { id: "praia", nome: "Praias e resorts" },
  { id: "aventura", nome: "Natureza e aventura" }, { id: "lua", nome: "Lua de mel" }, { id: "familia", nome: "Férias em família" },
  { id: "grupo", nome: "Viagem em grupo" }, { id: "excursao", nome: "Excursões" }, { id: "voos", nome: "Voos e passagens" },
  { id: "transfer", nome: "Transfer" }, { id: "datas", nome: "Datas especiais" },
];
export const NOME_VISUAL: Record<VisualVideo, string> = { classico: "Clássico", faixa: "Faixa com imagem", azul: "Azul" };

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
];

export const prontoDe = (v: VideoPronto) =>
  v.pronto || v.lista || v.visual
    ? { ...v.pronto, ...(v.visual ? { visual: v.visual } : {}), ...(v.lista ? { [v.modelo === "lista" ? "itens" : "ofertas"]: v.lista } : {}) }
    : undefined;
