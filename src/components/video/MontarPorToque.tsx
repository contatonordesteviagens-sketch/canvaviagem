import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Check } from "lucide-react";
import { tradutor, whatsExemplo, type LangVideo } from "@/lib/video-textos";

// Quiz "O que você quer anunciar?": Destino, Experiência ou Serviço → detalhes → o que inclui + preço → ocasião.
// O texto montado vai pelo mesmo caminho do áudio (a IA preenche os campos). Para Experiência e Serviço,
// o quiz manda também termos de busca em inglês, para os vídeos de fundo combinarem com o tema.

type Caminho = "destino" | "experiencia" | "servico";
type Regiao = "nacional" | "internacional" | "ambos";
type Opcao = { nome: string; emoji: string; buscas?: string[] };
type Grupo = { titulo: string; cor: string; inclusos: string[]; itens: Opcao[] };
type Tipo = { id: string; nome: string; frase: string; emoji: string; cor: string; inclusos: string[] };
export type OcasiaoQuiz = { id: string; nome: string };

const DESTINOS: Record<"nacional" | "internacional", Opcao[]> = {
  nacional: [
    { nome: "Gramado", emoji: "🌲" },
    { nome: "Porto de Galinhas", emoji: "🐠" },
    { nome: "Maceió", emoji: "🏖️" },
    { nome: "Fernando de Noronha", emoji: "🐢" },
    { nome: "Rio de Janeiro", emoji: "⛰️" },
    { nome: "Foz do Iguaçu", emoji: "💦" },
    { nome: "Jericoacoara", emoji: "🌅" },
    { nome: "Porto Seguro", emoji: "🌴" },
    { nome: "Bonito", emoji: "🐟" },
    { nome: "Maragogi", emoji: "🏝️" },
  ],
  internacional: [
    { nome: "Cancún", emoji: "🏝️" },
    { nome: "Orlando", emoji: "🎢" },
    { nome: "Buenos Aires", emoji: "💃" },
    { nome: "Santiago", emoji: "🍷" },
    { nome: "Punta Cana", emoji: "🥥" },
    { nome: "Bariloche", emoji: "🏔️" },
    { nome: "Lisboa", emoji: "🚋" },
    { nome: "Paris", emoji: "🗼" },
  ],
};

const TIPOS: Tipo[] = [
  { id: "pacote", nome: "Pacote completo", frase: "Pacote completo", emoji: "🧳", cor: "#F5F906", inclusos: ["Aéreo ida e volta", "Hotel com café da manhã", "Traslados", "Seguro viagem", "Passeios", "All inclusive"] },
  { id: "aereo", nome: "Passagem aérea", frase: "Passagem aérea", emoji: "✈️", cor: "#4DA3FF", inclusos: ["Ida e volta", "Bagagem de mão", "Mala despachada", "Taxas inclusas"] },
  { id: "hotel", nome: "Hotel ou resort", frase: "Hospedagem em hotel", emoji: "🏨", cor: "#B98CFF", inclusos: ["Café da manhã", "All inclusive", "Piscina", "Quarto com vista", "Wi-Fi"] },
  { id: "cruzeiro", nome: "Cruzeiro", frase: "Cruzeiro", emoji: "🚢", cor: "#3FD8E0", inclusos: ["Pensão completa", "Shows a bordo", "Taxas portuárias", "Bebidas"] },
  { id: "excursao", nome: "Excursão", frase: "Excursão em grupo", emoji: "🚌", cor: "#4BE08A", inclusos: ["Ônibus executivo", "Hotel", "Guia acompanhante", "Café da manhã"] },
  { id: "passeio", nome: "Passeio ou day use", frase: "Passeio", emoji: "🚤", cor: "#FF9A3D", inclusos: ["Transporte", "Guia", "Almoço", "Fotos"] },
];

// O que as agências mais vendem como experiência (sem precisar de um destino fixo)
const EXPERIENCIAS: Grupo[] = [
  {
    titulo: "Natureza e clima",
    cor: "#4BE08A",
    inclusos: ["Aéreo ida e volta", "Hospedagem", "Café da manhã", "Passeios", "Traslados"],
    itens: [
      { nome: "Praia e sol", emoji: "🏖️", buscas: ["tropical beach", "beach resort pool", "turquoise sea aerial"] },
      { nome: "Serra e frio", emoji: "🏔️", buscas: ["mountain cabin", "foggy mountains", "fireplace cozy"] },
      { nome: "Natureza e trilhas", emoji: "🥾", buscas: ["hiking trail", "waterfall forest", "mountain hike"] },
      { nome: "Aventura e ecoturismo", emoji: "🧗", buscas: ["adventure travel", "rafting river", "zipline forest"] },
      { nome: "Mergulho", emoji: "🤿", buscas: ["scuba diving", "snorkeling reef", "underwater turtle"] },
      { nome: "Neve e esqui", emoji: "⛷️", buscas: ["ski snow mountain", "snowy village", "snowboard"] },
    ],
  },
  {
    titulo: "Lazer e hospedagem",
    cor: "#B98CFF",
    inclusos: ["All inclusive", "Pensão completa", "Piscina", "Atividades", "Traslados"],
    itens: [
      { nome: "Resort all inclusive", emoji: "🍹", buscas: ["luxury resort pool", "all inclusive resort", "beach resort"] },
      { nome: "Cruzeiro", emoji: "🚢", buscas: ["cruise ship ocean", "cruise deck pool", "ship sailing sea"] },
      { nome: "Parques temáticos", emoji: "🎢", buscas: ["roller coaster", "amusement park", "theme park fireworks"] },
      { nome: "Bem-estar e termas", emoji: "🧖", buscas: ["spa relaxation", "hot springs", "infinity pool relax"] },
    ],
  },
  {
    titulo: "Para quem é",
    cor: "#FF9A3D",
    inclusos: ["Aéreo ida e volta", "Hotel", "Café da manhã", "Passeios", "Traslados"],
    itens: [
      { nome: "Lua de mel", emoji: "💍", buscas: ["romantic couple beach", "couple sunset", "honeymoon resort"] },
      { nome: "Família com crianças", emoji: "👨‍👩‍👧", buscas: ["family vacation beach", "kids pool resort", "family travel"] },
      { nome: "Melhor idade", emoji: "🧓", buscas: ["senior couple travel", "elderly couple vacation", "seniors beach walk"] },
      { nome: "Formatura e excursão", emoji: "🎓", buscas: ["friends trip", "young friends beach", "group of friends travel"] },
      { nome: "Viagem com pet", emoji: "🐶", buscas: ["dog travel", "dog beach", "pet road trip"] },
    ],
  },
  {
    titulo: "Temas e eventos",
    cor: "#4DA3FF",
    inclusos: ["Aéreo ida e volta", "Hotel", "Ingressos", "Guia", "Traslados"],
    itens: [
      { nome: "Gastronomia e vinhos", emoji: "🍷", buscas: ["vineyard wine tasting", "gourmet food", "wine cellar"] },
      { nome: "Religioso e fé", emoji: "⛪", buscas: ["church cathedral", "pilgrimage", "basilica interior"] },
      { nome: "Cultura e história", emoji: "🏛️", buscas: ["historic city", "old town streets", "museum"] },
      { nome: "Compras", emoji: "🛍️", buscas: ["shopping mall", "shopping bags street", "outlet shopping"] },
      { nome: "Shows e eventos", emoji: "🎤", buscas: ["concert crowd", "music festival", "stadium lights"] },
      { nome: "Réveillon", emoji: "🎆", buscas: ["new year fireworks", "fireworks beach", "celebration night"] },
      { nome: "Carnaval", emoji: "🎭", buscas: ["carnival parade", "carnival brazil", "street party confetti"] },
      { nome: "Casamento no destino", emoji: "💒", buscas: ["beach wedding", "destination wedding", "wedding ceremony outdoor"] },
    ],
  },
];

// Serviços de viagem (qualquer agência acha o seu)
const SERVICOS: Grupo[] = [
  {
    titulo: "Transporte",
    cor: "#4DA3FF",
    inclusos: ["Ida e volta", "Motorista", "Bagagem inclusa", "Atendimento 24 h", "Privativo"],
    itens: [
      { nome: "Passagens aéreas", emoji: "✈️", buscas: ["airplane flying sky", "airplane window", "airport terminal"] },
      { nome: "Transfer", emoji: "🚐", buscas: ["airport transfer van", "car driver airport", "luxury van"] },
      { nome: "Aluguel de carro", emoji: "🚗", buscas: ["road trip car", "convertible car coast", "car driving scenic road"] },
      { nome: "Ônibus e excursão", emoji: "🚌", buscas: ["tour bus road", "bus travel", "coach bus highway"] },
      { nome: "Fretamento", emoji: "🛩️", buscas: ["private jet", "charter flight", "small airplane"] },
    ],
  },
  {
    titulo: "Hospedagem e pacotes",
    cor: "#B98CFF",
    inclusos: ["Café da manhã", "All inclusive", "Piscina", "Wi-Fi", "Estacionamento"],
    itens: [
      { nome: "Pacote completo", emoji: "🧳", buscas: ["travel suitcase", "vacation beach", "airplane window"] },
      { nome: "Hotel", emoji: "🏨", buscas: ["hotel room", "hotel lobby", "hotel pool"] },
      { nome: "Pousada", emoji: "🏡", buscas: ["cozy inn", "guesthouse garden", "bed and breakfast"] },
      { nome: "Resort", emoji: "🌴", buscas: ["luxury resort pool", "beach resort", "resort aerial"] },
      { nome: "Hostel", emoji: "🛏️", buscas: ["hostel friends", "backpackers", "youth hostel"] },
      { nome: "Aluguel de temporada", emoji: "🏠", buscas: ["vacation rental house", "beach house", "villa pool"] },
      { nome: "Cruzeiro", emoji: "🚢", buscas: ["cruise ship ocean", "cruise deck pool", "ship sailing sea"] },
    ],
  },
  {
    titulo: "Passeios e receptivo",
    cor: "#FF9A3D",
    inclusos: ["Transporte", "Guia", "Almoço", "Fotos", "Privativo", "Compartilhado"],
    itens: [
      { nome: "Passeio de barco", emoji: "🚤", buscas: ["boat tour sea", "speedboat ocean", "catamaran"] },
      { nome: "Passeio de buggy", emoji: "🏜️", buscas: ["dune buggy", "sand dunes", "buggy ride beach"] },
      { nome: "Passeio 4x4", emoji: "🚙", buscas: ["4x4 off road", "jeep tour", "off road adventure"] },
      { nome: "City tour", emoji: "🏙️", buscas: ["city tour", "city skyline", "tourists walking city"] },
      { nome: "Mergulho", emoji: "🤿", buscas: ["scuba diving", "snorkeling reef", "underwater turtle"] },
      { nome: "Turismo receptivo", emoji: "🤝", buscas: ["tour guide group", "tourists sightseeing", "local tour"] },
      { nome: "Guia de turismo", emoji: "🧭", buscas: ["tour guide", "guided tour", "travel guide group"] },
    ],
  },
  {
    titulo: "Ingressos, grupos e extras",
    cor: "#4BE08A",
    inclusos: ["Atendimento rápido", "Melhor preço", "Suporte na viagem", "Parcelamento"],
    itens: [
      { nome: "Ingressos", emoji: "🎟️", buscas: ["theme park entrance", "concert tickets", "attraction tourists"] },
      { nome: "Restaurantes", emoji: "🍽️", buscas: ["restaurant dinner", "gourmet food", "seafood restaurant"] },
      { nome: "Viagens em grupo", emoji: "👥", buscas: ["group of friends travel", "tour group", "friends trip"] },
      { nome: "Viagem corporativa", emoji: "💼", buscas: ["business travel", "business airport", "conference event"] },
      { nome: "Seguro viagem", emoji: "🛡️", buscas: ["airport passport", "traveler airport", "suitcase airport"] },
      { nome: "Chip internacional", emoji: "📱", buscas: ["smartphone travel", "tourist phone map", "traveler phone"] },
      { nome: "Câmbio", emoji: "💱", buscas: ["foreign currency", "money travel", "traveler wallet"] },
      { nome: "Visto e passaporte", emoji: "🛂", buscas: ["passport stamp", "passport airport", "travel documents"] },
    ],
  },
];

const MAIS_PROCURADOS: Record<"experiencia" | "servico", string[]> = {
  experiencia: ["Praia e sol", "Serra e frio", "Resort all inclusive", "Cruzeiro", "Lua de mel", "Família com crianças"],
  servico: ["Passagens aéreas", "Hotel", "Pacote completo", "Transfer", "Seguro viagem", "Passeio de barco"],
};

const CAMINHOS: { id: Caminho; nome: string; desc: string; emoji: string; cor: string }[] = [
  { id: "destino", nome: "Destinos", desc: "Gramado, Cancún, Paris…", emoji: "📍", cor: "#F5F906" },
  { id: "experiencia", nome: "Experiências", desc: "Praia, serra, lua de mel…", emoji: "✨", cor: "#B98CFF" },
  { id: "servico", nome: "Serviços", desc: "Passagem, hotel, transfer…", emoji: "🛎️", cor: "#4DA3FF" },
];

// Espanhol (Espanha): destinos que uma agência espanhola vende. A mecânica do quiz é a mesma.
const DESTINOS_ES: Record<"nacional" | "internacional", Opcao[]> = {
  nacional: [
    { nome: "Canarias", emoji: "🌋" },
    { nome: "Baleares", emoji: "🏝️" },
    { nome: "Andalucía", emoji: "💃" },
    { nome: "Barcelona", emoji: "🏛️" },
    { nome: "Madrid", emoji: "🏙️" },
    { nome: "Galicia", emoji: "🌊" },
    { nome: "Costa del Sol", emoji: "☀️" },
    { nome: "País Vasco", emoji: "🍽️" },
    { nome: "Asturias", emoji: "⛰️" },
    { nome: "Valencia", emoji: "🍊" },
  ],
  internacional: [
    { nome: "Roma", emoji: "🏟️" },
    { nome: "París", emoji: "🗼" },
    { nome: "Nueva York", emoji: "🗽" },
    { nome: "Riviera Maya", emoji: "🌴" },
    { nome: "Marrakech", emoji: "🕌" },
    { nome: "Japón", emoji: "🗾" },
    { nome: "Lisboa", emoji: "🚋" },
    { nome: "Londres", emoji: "🎡" },
  ],
};

// Listas do quiz no idioma pedido. Em português são as listas de cima, sem mudança.
function dadosDoQuiz(lang: LangVideo) {
  if (lang !== "es") return { DESTINOS, TIPOS, EXPERIENCIAS, SERVICOS, MAIS_PROCURADOS, CAMINHOS };
  const tr = tradutor(lang);
  const grupo = (g: Grupo): Grupo => ({ ...g, titulo: tr(g.titulo), inclusos: g.inclusos.map((x) => tr(x)), itens: g.itens.map((o) => ({ ...o, nome: tr(o.nome) })) });
  return {
    DESTINOS: DESTINOS_ES,
    TIPOS: TIPOS.map((t) => ({ ...t, nome: tr(t.nome), frase: tr(t.frase), inclusos: t.inclusos.map((x) => tr(x)) })),
    EXPERIENCIAS: EXPERIENCIAS.map(grupo),
    SERVICOS: SERVICOS.map(grupo),
    MAIS_PROCURADOS: { experiencia: MAIS_PROCURADOS.experiencia.map((x) => tr(x)), servico: MAIS_PROCURADOS.servico.map((x) => tr(x)) },
    CAMINHOS: CAMINHOS.map((c) => ({ ...c, nome: tr(c.nome), desc: tr(c.desc) })),
  };
}

// Fica grudado embaixo (acima da barra de "1 vídeo / 3 vídeos" no celular): não precisa rolar para achar
const GRUDA = "sticky bottom-[var(--cv-gruda,88px)] z-10 shadow-[0_-12px_24px_8px_rgba(10,10,11,.9)] lg:bottom-4";

// Botão de seguir quando dá para marcar mais de um (até 3)
function BotaoContinuar({ qtd, nomes, onClick, lang }: { qtd: number; nomes: string; onClick: () => void; lang: LangVideo }) {
  const tr = tradutor(lang);
  return (
    <button
      disabled={!qtd}
      onClick={onClick}
      className={`${GRUDA} min-h-12 rounded-2xl text-[15px] font-extrabold text-black transition-transform active:scale-[.97] disabled:bg-[#1c1c1f] disabled:text-white/40`}
      style={qtd ? { background: "#F5F906" } : undefined}
    >
      {qtd ? (qtd > 1 ? tr("Continuar com {qtd} escolhas →", { qtd }) : tr("Continuar com {nomes} →", { nomes })) : tr("Marque até 3 opções")}
    </button>
  );
}

const entra = "animate-in fade-in slide-in-from-bottom-2 duration-300 fill-mode-both";
const cartao = "animate-in fade-in zoom-in-95 duration-300 fill-mode-both";

export function MontarPorToque({
  ocupado,
  onMontar,
  ocasioes = [],
  ocasiao,
  onOcasiao,
  ocasioesDestaque = 3,
  onMeusPacotes,
  whatsapp,
  onWhatsapp,
  curto,
  onCurto,
  onPrevia,
  lang = "pt",
}: {
  /** idioma do quiz e do texto que ele manda para a IA (padrão: português) */
  lang?: LangVideo;
  /** chamado a cada escolha com o título que vai no vídeo, para a prévia acompanhar o quiz */
  onPrevia?: (titulo: string) => void;
  whatsapp?: string;
  onWhatsapp?: (w: string) => void;
  curto?: boolean;
  onCurto?: (c: boolean) => void;
  ocupado: boolean;
  ocasioesDestaque?: number;
  onMeusPacotes?: () => void;
  onMontar: (texto: string, buscas?: string[]) => void;
  ocasioes?: OcasiaoQuiz[];
  ocasiao?: string;
  onOcasiao?: (id: string) => void;
}) {
  const tr = tradutor(lang);
  const es = lang === "es";
  const { DESTINOS, TIPOS, EXPERIENCIAS, SERVICOS, MAIS_PROCURADOS, CAMINHOS } = useMemo(() => dadosDoQuiz(lang), [lang]);
  const [caminho, setCaminho] = useState<Caminho | null>(null);
  const [passo, setPasso] = useState(0);
  const [regiao, setRegiao] = useState<Regiao>("nacional");
  const [destinos, setDestinos] = useState<string[]>([]); // pode marcar mais de um
  // título do vídeo cabe em até ~38 letras: com muitos destinos, "Gramado e mais 2"
  const juntar = (l: string[]) => (l.length <= 1 ? l[0] || "" : tr("{inicio} e {fim}", { inicio: l.slice(0, -1).join(", "), fim: l[l.length - 1] }));
  const destino = juntar(destinos).length <= 38 ? juntar(destinos) : tr("{primeiro} e mais {n}", { primeiro: destinos[0], n: destinos.length - 1 });
  const [lugar, setLugar] = useState(""); // onde (opcional) para experiência e serviço
  const [outro, setOutro] = useState("");
  const [tipo, setTipo] = useState<Tipo | null>(null);
  const [opcoes, setOpcoes] = useState<(Opcao & { grupo: Grupo })[]>([]); // pode marcar mais de um
  const opcao = opcoes[0] || null;
  const nomeOpcoes = opcoes.map((o) => o.nome).join(" + "); // para a tela
  const tituloOpcoes = (c: Caminho | null) => {
    const j = juntar(opcoes.map((o) => o.nome));
    const base = j.length <= 30 ? j : c === "servico" ? tr("Serviços de viagem") : tr("Experiências de viagem");
    const comLugar = lugar.trim() ? tr("{base} em {lugar}", { base, lugar: lugar.trim() }) : base;
    return comLugar.length <= 38 ? comLugar : base;
  };
  const [extra, setExtra] = useState(""); // item próprio no "o que está incluso"
  const [extras, setExtras] = useState<string[]>([]);
  const [inclusos, setInclusos] = useState<string[]>([]);
  const [preco, setPreco] = useState("");
  const [precoTipo, setPrecoTipo] = useState<"total" | "pessoa" | "parcelado">("pessoa");
  const [verTodas, setVerTodas] = useState(false);
  const [verOcasioes, setVerOcasioes] = useState(false);
  const tituloPrevia = caminho === "destino" ? destino : opcoes.length ? tituloOpcoes(caminho) : "";
  useEffect(() => {
    if (tituloPrevia) onPrevia?.(tituloPrevia);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tituloPrevia]);

  // passos de cada caminho (o 0 é a escolha do caminho)
  const passos: Record<Caminho, string[]> = {
    destino: [tr("O que você quer anunciar?"), tr("Pra onde é a viagem?"), tr("O que você está vendendo?"), tr("O que está incluso?"), tr("Últimos detalhes")],
    experiencia: [tr("O que você quer anunciar?"), tr("Qual experiência?"), tr("Pra onde?"), tr("O que está incluso?"), tr("Últimos detalhes")],
    servico: [tr("O que você quer anunciar?"), tr("Qual serviço?"), tr("Onde você atende?"), tr("O que está incluso?"), tr("Últimos detalhes")],
  };
  const titulos = passos[caminho || "destino"];
  const total = titulos.length;

  function escolherCaminho(c: Caminho) {
    setCaminho(c);
    setOpcoes([]);
    setTipo(null);
    setDestinos([]);
    setExtras([]);
    setLugar("");
    setOutro("");
    setPasso(1);
  }
  const MAX = 3;
  function alternarDestino(nome: string) {
    setDestinos((l) => (l.includes(nome) ? l.filter((x) => x !== nome) : l.length >= MAX ? l : [...l, nome]));
  }
  function escolherTipo(t: Tipo) {
    setTipo(t);
    setInclusos(t.inclusos.slice(0, 3));
    setPasso(3);
  }
  function alternarOpcao(o: Opcao, g: Grupo) {
    setOpcoes((l) => (l.some((x) => x.nome === o.nome) ? l.filter((x) => x.nome !== o.nome) : l.length >= MAX ? l : [...l, { ...o, grupo: g }]));
  }
  function confirmarOpcoes() {
    if (!opcoes.length) return;
    setInclusos(opcoes[0].grupo.inclusos.slice(0, 3));
    setPasso(2);
  }
  function adicionarExtra() {
    const n = extra.trim();
    if (!n) return;
    setExtras((l) => (l.includes(n) ? l : [...l, n]));
    setInclusos((l) => (l.includes(n) ? l : [...l, n]));
    setExtra("");
  }
  function alternar(item: string) {
    setInclusos((l) => (l.includes(item) ? l.filter((x) => x !== item) : [...l, item]));
  }

  const baseInclusos = caminho === "destino" ? tipo?.inclusos || [] : [...new Set(opcoes.flatMap((o) => o.grupo.inclusos))];
  const listaInclusos = [...baseInclusos, ...extras.filter((e) => !baseInclusos.includes(e))];
  const corAtual = caminho === "destino" ? tipo?.cor || "#F5F906" : opcao?.grupo.cor || "#F5F906";

  function montar() {
    const p = preco.trim();
    // Espanha: preço em euro ("1.250 €"); Brasil: "R$ 1.990"
    const rs = es ? (/€|eur/i.test(p) ? p : `${p} €`) : /^r\$/i.test(p) ? p : "R$ " + p;
    const valor = !p ? tr("Valor sob consulta.") : precoTipo === "parcelado" && !es ? `Em 10x de ${rs} por pessoa.` : precoTipo === "total" ? tr("Por {valor} no total.", { valor: rs }) : tr("Por {valor} por pessoa.", { valor: rs });
    const inc = inclusos.length ? tr("Inclui: {itens}.", { itens: inclusos.join(", ") }) : "";
    if (caminho === "destino") {
      if (!tipo || !destino) return;
      onMontar([tr("{frase} para {destino}.", { frase: tipo.frase, destino }), inc, valor].filter(Boolean).join(" "));
      return;
    }
    if (!opcao) return;
    const onde = lugar.trim() || (regiao === "nacional" ? tr("destinos nacionais") : regiao === "internacional" ? tr("destinos internacionais") : tr("destinos nacionais e internacionais"));
    const rotulo = caminho === "servico" ? tr("Serviço") : tr("Experiência");
    const titulo = tituloOpcoes(caminho);
    const texto = [
      tr("{rotulo}: {nomes}, em {onde}.", { rotulo, nomes: juntar(opcoes.map((o) => o.nome)), onde }),
      tr("Não é um destino específico: use \"{titulo}\" como destino.", { titulo }),
      opcoes.length > 1 ? tr("Destaques: {nomes}.", { nomes: opcoes.map((o) => o.nome).join(", ") }) : "",
      inc,
      valor,
    ]
      .filter(Boolean)
      .join(" ");
    // termos de cada escolha, intercalados (1º de cada, depois o 2º de cada…)
    const buscas: string[] = [];
    for (let i = 0; i < 3; i++) for (const o of opcoes) if (o.buscas?.[i] && !buscas.includes(o.buscas[i])) buscas.push(o.buscas[i]);
    if (lugar.trim()) buscas.unshift(`${lugar.trim()} travel`);
    onMontar(texto, buscas);
  }

  const voltar = () => {
    if (passo <= 1) {
      setCaminho(null);
      setPasso(0);
    } else setPasso(passo - 1);
  };

  const cartaoOpcao = (o: Opcao, g: Grupo, i: number) => {
    const on = opcoes.some((x) => x.nome === o.nome);
    return (
      <button
        key={o.nome}
        onClick={() => alternarOpcao(o, g)}
        style={{ animationDelay: `${i * 25}ms`, ...(on ? { borderColor: g.cor, background: `${g.cor}26` } : {}) }}
        className={`${cartao} relative flex min-h-11 items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-2.5 text-left text-[13px] font-semibold transition-all hover:bg-white/[0.08] active:scale-95`}
      >
        <span className="text-[18px] leading-none">{o.emoji}</span>
        <span className="min-w-0 leading-tight">{o.nome}</span>
        {on && <Check className="absolute right-1 top-1 h-3.5 w-3.5" style={{ color: g.cor }} />}
      </button>
    );
  };
  const grupos = (lista: Grupo[]) => {
    const topo = MAIS_PROCURADOS[caminho === "servico" ? "servico" : "experiencia"];
    const todos = lista.flatMap((g) => g.itens.map((o) => ({ o, g })));
    const principais = topo.map((n) => todos.find((x) => x.o.nome === n)).filter(Boolean) as { o: Opcao; g: Grupo }[];
    return (
    <div className="flex flex-col gap-3">
      <p className="text-[11px] font-bold uppercase tracking-wider text-white/45">{tr("Mais procurados")}</p>
      <div className="grid grid-cols-2 gap-2">{principais.map(({ o, g }, i) => cartaoOpcao(o, g, i))}</div>
      <button onClick={() => setVerTodas((v) => !v)} className="self-start text-[13px] font-semibold text-[#F5F906] underline-offset-4 hover:underline">
        {verTodas ? tr("Ver menos") : tr("Ver todas as opções ({n})", { n: todos.length })}
      </button>
      {/* com a lista toda aberta, o botão de seguir aparece também aqui em cima (não precisa rolar até o fim) */}
      {verTodas && opcoes.length > 0 && <BotaoContinuar lang={lang} qtd={opcoes.length} nomes={nomeOpcoes} onClick={confirmarOpcoes} />}
      {verTodas && lista.map((g) => (
        <div key={g.titulo}>
          <p className="mb-1.5 text-[11px] font-bold uppercase tracking-wider" style={{ color: g.cor }}>
            {g.titulo}
          </p>
          <div className="grid grid-cols-2 gap-2">{g.itens.filter((o) => !topo.includes(o.nome)).map((o, i) => cartaoOpcao(o, g, i))}</div>
        </div>
      ))}
      <form
        className="flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          const n = outro.trim();
          if (n) {
            alternarOpcao({ nome: n, emoji: "✨", buscas: [`${n} travel`, "travel vacation", "airplane window"] }, (caminho === "servico" ? SERVICOS : EXPERIENCIAS)[0]);
            setOutro("");
          }
        }}
      >
        <input
          value={outro}
          onChange={(e) => setOutro(e.target.value)}
          placeholder={caminho === "servico" ? tr("Outro serviço") : tr("Outra experiência")}
          className="min-h-12 w-full rounded-xl border border-white/10 bg-white/[0.05] px-3 text-[15px] outline-none focus:border-[#F5F906]/60"
        />
        <button type="submit" className="min-h-12 shrink-0 rounded-xl bg-white/[0.12] px-4 text-[14px] font-bold transition-transform active:scale-95">
          {tr("+ Adicionar")}
        </button>
      </form>
      <BotaoContinuar lang={lang} qtd={opcoes.length} nomes={nomeOpcoes} onClick={confirmarOpcoes} />
    </div>
    );
  };

  return (
    <div className="flex flex-col gap-4">
      {/* progresso */}
      <div className="flex items-center gap-2">
        {passo > 0 && (
          <button aria-label={tr("Voltar")} onClick={voltar} className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white/[0.08] transition-transform active:scale-90">
            <ArrowLeft className="h-4 w-4" />
          </button>
        )}
        <div className="flex flex-1 gap-1.5">
          {Array.from({ length: total }, (_, i) => (
            <span key={i} className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/10">
              <span className="block h-full rounded-full bg-[#F5F906] transition-all duration-500" style={{ width: i <= passo ? "100%" : "0%" }} />
            </span>
          ))}
        </div>
      </div>

      <div key={`${caminho}-${passo}`} className={entra}>
        <p className="mb-1 text-[11px] font-bold uppercase tracking-widest text-[#F5F906]">
          {tr("Passo {a} de {b}", { a: passo + 1, b: total })}
        </p>
        <h3 className="mb-3 text-[19px] font-extrabold leading-tight">{titulos[passo]}</h3>

        {/* 0 — escolher o caminho */}
        {passo === 0 && (
          <div className="flex flex-col gap-2">
            {CAMINHOS.map((c, i) => (
              <button
                key={c.id}
                onClick={() => escolherCaminho(c.id)}
                style={{ animationDelay: `${i * 60}ms`, borderColor: `${c.cor}55`, background: `linear-gradient(120deg, ${c.cor}22, ${c.cor}06)` }}
                className={`${cartao} flex min-h-16 items-center gap-3 rounded-2xl border-2 px-4 text-left transition-transform active:scale-[.98]`}
              >
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl text-[24px]" style={{ background: `${c.cor}33` }}>
                  {c.emoji}
                </span>
                <span className="min-w-0">
                  <span className="block text-[16px] font-extrabold leading-tight">{c.nome}</span>
                  <span className="block text-[13px] text-white/60">{c.desc}</span>
                </span>
              </button>
            ))}
            {onMeusPacotes && (
              <button onClick={onMeusPacotes} className="mt-1 flex min-h-11 items-center justify-center gap-2 rounded-xl border border-dashed border-white/20 text-[14px] font-semibold text-white/75 transition-colors hover:border-[#F5F906]/50 hover:text-white">
                {tr("📦 Usar um pacote que já cadastrei")}
              </button>
            )}
          </div>
        )}

        {/* DESTINO — 1: região e destino */}
        {caminho === "destino" && passo === 1 && (
          <div className="flex flex-col gap-3">
            <div className="grid grid-cols-2 gap-2 rounded-2xl bg-white/[0.06] p-1">
              {(["nacional", "internacional"] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => setRegiao(r)}
                  className={`min-h-12 rounded-xl text-[15px] font-bold transition-all duration-200 active:scale-95 ${regiao === r ? "bg-[#F5F906] text-black shadow-lg" : "text-white/70"}`}
                >
                  {r === "nacional" ? tr("🌴 Nacional") : tr("✈️ Internacional")}
                </button>
              ))}
            </div>
            <div key={regiao} className="grid grid-cols-2 gap-2">
              {DESTINOS[regiao === "internacional" ? "internacional" : "nacional"].map((d, i) => (
                <button
                  key={d.nome}
                  onClick={() => alternarDestino(d.nome)}
                  style={{ animationDelay: `${i * 35}ms` }}
                  className={`${cartao} relative flex min-h-12 items-center gap-2 rounded-xl border px-3 text-left text-[14px] font-semibold transition-all active:scale-95 ${destinos.includes(d.nome) ? "border-[#F5F906] bg-[#F5F906]/15" : "border-white/10 bg-white/[0.04] hover:bg-white/[0.08]"}`}
                >
                  <span className="text-[20px] leading-none">{d.emoji}</span>
                  <span className="min-w-0 leading-tight">{d.nome}</span>
                  {destinos.includes(d.nome) && <Check className="absolute right-1.5 top-1.5 h-3.5 w-3.5 text-[#F5F906]" />}
                </button>
              ))}
            </div>
            <form
              className="flex gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                if (outro.trim()) {
                  alternarDestino(outro.trim());
                  setOutro("");
                }
              }}
            >
              <input
                value={outro}
                onChange={(e) => setOutro(e.target.value)}
                placeholder={tr("Outro destino")}
                className="min-h-12 w-full rounded-xl border border-white/10 bg-white/[0.05] px-3 text-[15px] outline-none focus:border-[#F5F906]/60"
              />
              <button type="submit" className="min-h-12 shrink-0 rounded-xl bg-white/[0.12] px-4 text-[14px] font-bold transition-transform active:scale-95">
                {tr("+ Adicionar")}
              </button>
            </form>
            {destinos.filter((d) => !DESTINOS.nacional.concat(DESTINOS.internacional).some((x) => x.nome === d)).length > 0 && (
              <div className="flex flex-wrap gap-2">
                {destinos
                  .filter((d) => !DESTINOS.nacional.concat(DESTINOS.internacional).some((x) => x.nome === d))
                  .map((d) => (
                    <button key={d} onClick={() => alternarDestino(d)} className="flex min-h-10 items-center gap-1.5 rounded-full border border-[#F5F906] bg-[#F5F906]/15 px-3 text-[13px] font-semibold">
                      <Check className="h-3.5 w-3.5 text-[#F5F906]" /> {d} <span className="text-white/50">✕</span>
                    </button>
                  ))}
              </div>
            )}
            <BotaoContinuar lang={lang} qtd={destinos.length} nomes={destino} onClick={() => destinos.length && setPasso(2)} />
          </div>
        )}

        {/* DESTINO — 2: tipo de oferta */}
        {caminho === "destino" && passo === 2 && (
          <div className="grid grid-cols-2 gap-2">
            {TIPOS.map((t, i) => (
              <button
                key={t.id}
                onClick={() => escolherTipo(t)}
                style={{ animationDelay: `${i * 45}ms`, borderColor: tipo?.id === t.id ? t.cor : `${t.cor}40`, background: `linear-gradient(160deg, ${t.cor}26, ${t.cor}08)` }}
                className={`${cartao} flex min-h-24 flex-col items-start justify-between rounded-2xl border-2 p-3 text-left transition-transform active:scale-95`}
              >
                <span className="grid h-10 w-10 place-items-center rounded-xl text-[22px]" style={{ background: `${t.cor}33` }}>
                  {t.emoji}
                </span>
                <span className="text-[14px] font-bold leading-tight">{t.nome}</span>
              </button>
            ))}
          </div>
        )}

        {/* EXPERIÊNCIA / SERVIÇO — 1: escolher */}
        {caminho === "experiencia" && passo === 1 && grupos(EXPERIENCIAS)}
        {caminho === "servico" && passo === 1 && grupos(SERVICOS)}

        {/* EXPERIÊNCIA / SERVIÇO — 2: onde (opcional) */}
        {caminho !== "destino" && caminho && passo === 2 && opcao && (
          <div className="flex flex-col gap-3">
            <p className="-mt-1 text-[13px] text-white/55">
              {opcoes.map((o) => o.emoji).join(" ")} {nomeOpcoes}. {tr("Não precisa ser um lugar específico.")}
            </p>
            <div className="grid grid-cols-3 gap-1.5 rounded-2xl bg-white/[0.06] p-1">
              {(["nacional", "internacional", "ambos"] as Regiao[]).map((r) => (
                <button
                  key={r}
                  onClick={() => setRegiao(r)}
                  className={`min-h-12 rounded-xl text-[13px] font-bold transition-all duration-200 active:scale-95 ${regiao === r ? "bg-[#F5F906] text-black shadow-lg" : "text-white/70"}`}
                >
                  {r === "nacional" ? tr("🌴 Nacional") : r === "internacional" ? tr("✈️ Internacional") : tr("🌎 Os dois")}
                </button>
              ))}
            </div>
            <label className="block">
              <span className="mb-1 block text-[12px] font-semibold text-white/55">{tr("Cidade ou região (opcional)")}</span>
              <input
                value={lugar}
                onChange={(e) => setLugar(e.target.value)}
                placeholder={caminho === "servico" ? tr("Ex.: Fortaleza, Nordeste") : tr("Ex.: Serra Gaúcha, Caribe")}
                className="min-h-12 w-full rounded-xl border border-white/10 bg-white/[0.05] px-3 text-[15px] outline-none focus:border-[#F5F906]/60"
              />
            </label>
            <button onClick={() => setPasso(3)} className={`${GRUDA} min-h-12 rounded-2xl bg-[#F5F906] text-[15px] font-extrabold text-black transition-transform active:scale-[.97]`}>
              {tr("Continuar →")}
            </button>
          </div>
        )}

        {/* 3 — o que inclui + preço (todos os caminhos) */}
        {passo === 3 && (caminho === "destino" ? !!tipo : !!opcao) && (
          <div className="flex flex-col gap-4">
            <p className="-mt-1 text-[13px] text-white/55">
              {caminho === "destino" ? `${tipo!.emoji} ${tipo!.nome} · ${destino}` : `${opcoes.map((o) => o.emoji).join(" ")} ${nomeOpcoes}${lugar.trim() ? ` · ${lugar.trim()}` : ""}`}. {tr("Toque para marcar o que entra.")}
            </p>
            <div className="flex flex-wrap gap-2">
              {listaInclusos.map((it, i) => {
                const on = inclusos.includes(it);
                return (
                  <button
                    key={it}
                    onClick={() => alternar(it)}
                    style={{ animationDelay: `${i * 40}ms`, ...(on ? { background: corAtual, borderColor: corAtual } : {}) }}
                    className={`${cartao} flex min-h-11 items-center gap-1.5 rounded-full border px-3.5 text-[14px] font-semibold transition-all active:scale-95 ${on ? "text-black" : "border-white/15 bg-white/[0.04] text-white/80"}`}
                  >
                    {on && <Check className="h-4 w-4" />}
                    {it}
                  </button>
                );
              })}
            </div>
            <form
              className="flex gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                adicionarExtra();
              }}
            >
              <input
                value={extra}
                onChange={(e) => setExtra(e.target.value)}
                maxLength={28}
                placeholder={tr("Adicionar outro item (ex.: Passeio de barco)")}
                className="min-h-12 w-full rounded-xl border border-white/10 bg-white/[0.05] px-3 text-[15px] outline-none focus:border-[#F5F906]/60"
              />
              <button type="submit" className="min-h-12 shrink-0 rounded-xl bg-white/[0.12] px-4 text-[14px] font-bold transition-transform active:scale-95">
                {tr("+ Item")}
              </button>
            </form>
            <div className="flex flex-wrap gap-1.5">
              {([["pessoa", tr("Por pessoa")], ["total", tr("Valor total")], ["parcelado", tr("Em 10x")]] as const).filter(([id]) => !(es && id === "parcelado")).map(([id, nome]) => (
                <button key={id} onClick={() => setPrecoTipo(id)} className={`min-h-9 rounded-full border px-3 text-[13px] font-semibold transition-all active:scale-95 ${precoTipo === id ? "border-[#F5F906] bg-[#F5F906] text-black" : "border-white/15 text-white/70"}`}>
                  {nome}
                </button>
              ))}
            </div>
            <label className="block">
              <span className="mb-1 block text-[12px] font-semibold text-white/55">{precoTipo === "parcelado" ? tr("Valor da parcela") : tr("Preço")}{tr(" (opcional, aparece só no fim do vídeo)")}</span>
              <input
                inputMode="decimal"
                value={preco}
                onChange={(e) => setPreco(e.target.value)}
                placeholder={tr("Ex.: 1.990")}
                className="min-h-12 w-full rounded-xl border border-white/10 bg-white/[0.05] px-3 text-[15px] outline-none focus:border-[#F5F906]/60"
              />
            </label>
            <button onClick={() => setPasso(4)} className={`${GRUDA} min-h-12 rounded-2xl bg-[#F5F906] text-[15px] font-extrabold text-black transition-transform active:scale-[.97]`}>
              {tr("Continuar →")}
            </button>
          </div>
        )}

        {/* 4 — ocasião, contato, duração + montar */}
        {passo === 4 && (
          <div className="flex flex-col gap-4">
            {onWhatsapp && (
              <label className="block">
                <span className="mb-1 block text-[12px] font-semibold text-white/55">{tr("WhatsApp que aparece no fim do vídeo")}</span>
                <input
                  inputMode="tel"
                  value={whatsapp || ""}
                  onChange={(e) => onWhatsapp(e.target.value)}
                  placeholder={whatsExemplo(lang)}
                  className="min-h-12 w-full rounded-xl border border-white/10 bg-white/[0.05] px-3 text-[15px] outline-none focus:border-[#F5F906]/60"
                />
              </label>
            )}
            {onCurto && (
              <div>
                <span className="mb-1 block text-[12px] font-semibold text-white/55">{tr("Duração")}</span>
                <div className="flex gap-1.5">
                  {([[false, tr("22 s · completo")], [true, tr("12 s · curto")]] as const).map(([c, nome]) => (
                    <button key={nome} onClick={() => onCurto(c)} className={`min-h-9 rounded-full border px-3 text-[13px] font-semibold transition-all active:scale-95 ${!!curto === c ? "border-[#F5F906] bg-[#F5F906] text-black" : "border-white/15 text-white/70"}`}>
                      {nome}
                    </button>
                  ))}
                </div>
              </div>
            )}
            <span className="-mb-2 block text-[12px] font-semibold text-white/55">{tr("Ocasião (opcional)")}</span>
            {ocasioes.length > 0 && onOcasiao && (
              <div className="flex flex-wrap gap-2">
                {(verOcasioes ? ocasioes : ocasioes.slice(0, ocasioesDestaque)).map((o, i) => {
                  const on = (ocasiao || "nenhuma") === o.id;
                  return (
                    <button
                      key={o.id}
                      onClick={() => onOcasiao(o.id)}
                      style={{ animationDelay: `${i * 30}ms` }}
                      className={`${cartao} flex min-h-11 items-center gap-1.5 rounded-full border px-3.5 text-[14px] font-semibold transition-all active:scale-95 ${on ? "border-[#F5F906] bg-[#F5F906] text-black" : "border-white/15 bg-white/[0.04] text-white/80"}`}
                    >
                      {on && <Check className="h-4 w-4" />}
                      {o.id === "nenhuma" ? tr("Sem ocasião") : o.nome}
                    </button>
                  );
                })}
                {ocasioes.length > ocasioesDestaque && (
                  <button onClick={() => setVerOcasioes((v) => !v)} className="min-h-11 px-2 text-[13px] font-semibold text-[#F5F906]">
                    {verOcasioes ? tr("Ver menos") : tr("Outras datas…")}
                  </button>
                )}
              </div>
            )}
            <button
              disabled={ocupado}
              onClick={montar}
              className={`${GRUDA} min-h-14 rounded-2xl text-[16px] font-extrabold text-black transition-transform active:scale-[.97] disabled:opacity-60`}
              style={{ background: "#F5F906" }}
            >
              {ocupado ? tr("Montando seus vídeos…") : tr("Montar meus 3 vídeos")}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
