import { useEffect, useMemo, useRef, useState, type ComponentType, type ReactNode } from "react";
import { Helmet } from "react-helmet-async";
import {
  ArrowRight, Check, ChevronLeft, ShieldCheck, Briefcase, Store, Sprout, Building2, Waves, Plane, Ship, Bus, Heart, Ticket,
  Users, Instagram, Megaphone, MessageCircleOff, Ghost, BadgePercent, PenLine, Ban, Coins, TrendingUp, Bot, Sparkles,
  Hourglass, Clock, Timer, Target, Rocket, Smartphone, Infinity as InfinityIcon, Key as KeyIcon, Lock,
} from "lucide-react";
import { BrandMark, delay } from "@/components/cv-cream/shared";
import { trackMetaEvent } from "@/lib/meta-pixel-sales";

/**
 * /quiz-agente-lucrativo: quiz no mesmo estilo do da venda (Black), que termina na compra do
 * Agente Lucrativo na Hotmart. Só promete o que o curso entrega: 3 módulos, 2 horas de aula no
 * celular, acesso vitalício, garantia de 7 dias. Sem depoimento, sem preço riscado, sem contador.
 */
export const HOTMART_AGENTE_LUCRATIVO = "https://pay.hotmart.com/X100779687E?off=1b820216&checkoutMode=10";
const PRECO = 97;
const STORAGE_KEY = "cv-quiz-agente-v1";
const LOADING_MS = 5200;

type Icon = ComponentType<{ className?: string }>;
type Option = { id: string; label: string; hint: string; icon: Icon };
type Key = "trabalho" | "vende" | "clientes" | "trava" | "anuncio" | "ia" | "tempo" | "meta";
type Question = { kind: "question"; key: Key; title: string; sub: string; multi?: boolean; options: Option[] };
type Step = Question | { kind: "intro" | "result" | "offer" } | { kind: "loading"; label: string; lines: string[] };
type Answers = Partial<Record<Key, string[]>>;

const STEPS: Step[] = [
  { kind: "intro" },
  {
    kind: "question", key: "trabalho", title: "Como você trabalha com viagens hoje?", sub: "Assim a gente fala a sua língua",
    options: [
      { id: "autonomo", label: "Agente autônomo", hint: "Vendo de casa, pelo celular", icon: Briefcase },
      { id: "loja", label: "Tenho agência", hint: "Com loja ou equipe", icon: Store },
      { id: "comecando", label: "Estou começando", hint: "Ainda não vendi ou vendi pouco", icon: Sprout },
      { id: "operadora", label: "Revendo de operadora", hint: "Pacotes prontos de parceiros", icon: Building2 },
    ],
  },
  {
    kind: "question", key: "vende", multi: true, title: "O que você mais vende?", sub: "Marque todos que quiser",
    options: [
      { id: "nacional", label: "Pacotes nacionais", hint: "Praias, serra, Nordeste", icon: Waves },
      { id: "internacional", label: "Internacional", hint: "Europa, Disney, Caribe", icon: Plane },
      { id: "cruzeiro", label: "Cruzeiros", hint: "Navios e roteiros", icon: Ship },
      { id: "grupo", label: "Excursões e grupos", hint: "Bate-volta, ônibus, turmas", icon: Bus },
      { id: "luademel", label: "Lua de mel e casais", hint: "Viagens românticas", icon: Heart },
      { id: "aereo", label: "Passagens e hotel", hint: "Aéreo, hospedagem, transfer", icon: Ticket },
    ],
  },
  {
    kind: "question", key: "clientes", title: "De onde vêm os seus clientes hoje?", sub: "Escolha o que mais acontece",
    options: [
      { id: "indicacao", label: "Indicação", hint: "Amigos, família, conhecidos", icon: Users },
      { id: "instagram", label: "Instagram", hint: "Posts e stories", icon: Instagram },
      { id: "anuncios", label: "Anúncios pagos", hint: "Meta, Google", icon: Megaphone },
      { id: "nenhum", label: "Ainda não tenho clientes", hint: "Quero os primeiros", icon: Sprout },
    ],
  },
  {
    kind: "question", key: "trava", title: "Onde a venda mais trava?", sub: "Seja sincero, é aqui que está o dinheiro",
    options: [
      { id: "ninguem", label: "Ninguém chama no WhatsApp", hint: "Posto e o celular não toca", icon: MessageCircleOff },
      { id: "somem", label: "Pedem orçamento e somem", hint: "Mando o valor e não respondem", icon: Ghost },
      { id: "preco", label: "Só querem desconto", hint: "Comparam preço e compram em outro lugar", icon: BadgePercent },
      { id: "oque", label: "Não sei o que postar", hint: "Fico sem ideia de conteúdo", icon: PenLine },
    ],
  },
  {
    kind: "question", key: "anuncio", title: "Você já anunciou no Instagram ou no Facebook?", sub: "Impulsionar post também conta",
    options: [
      { id: "nunca", label: "Nunca anunciei", hint: "Tenho medo de perder dinheiro", icon: Ban },
      { id: "impulsionei", label: "Impulsionei e não deu certo", hint: "Curtidas, mas nenhuma venda", icon: Coins },
      { id: "caro", label: "Anuncio, mas sai caro", hint: "Muito curioso, pouco cliente", icon: Megaphone },
      { id: "escalar", label: "Anuncio e quero crescer", hint: "Já funciona, quero mais", icon: TrendingUp },
    ],
  },
  {
    kind: "question", key: "ia", title: "Você usa inteligência artificial na agência?", sub: "ChatGPT, Gemini e parecidos",
    options: [
      { id: "nao", label: "Não uso", hint: "Não sei por onde começar", icon: Ban },
      { id: "texto", label: "Só para escrever textos", hint: "Legenda e mensagem", icon: PenLine },
      { id: "solto", label: "Uso, mas sem método", hint: "Cada dia de um jeito", icon: Sparkles },
      { id: "muito", label: "Uso bastante", hint: "Quero que ela venda por mim", icon: Bot },
    ],
  },
  {
    kind: "question", key: "tempo", title: "Quanto tempo por dia você tem para a agência?", sub: "Para montar um plano que caiba na sua rotina",
    options: [
      { id: "pouco", label: "Menos de 1 hora", hint: "Divido com outro trabalho", icon: Hourglass },
      { id: "medio", label: "De 1 a 3 horas", hint: "Um período do dia", icon: Clock },
      { id: "integral", label: "O dia todo", hint: "Vivo da agência", icon: Timer },
    ],
  },
  {
    kind: "question", key: "meta", title: "Qual é a sua meta para os próximos 3 meses?", sub: "Última pergunta",
    options: [
      { id: "primeiras", label: "Vender pela internet", hint: "As primeiras vendas online", icon: Target },
      { id: "semana", label: "Vender toda semana", hint: "Parar de depender da sorte", icon: TrendingUp },
      { id: "emprego", label: "Viver só da agência", hint: "Largar o outro trabalho", icon: Briefcase },
      { id: "escalar", label: "Crescer com equipe", hint: "Mais vendas sem fazer tudo sozinho", icon: Rocket },
    ],
  },
  { kind: "loading", label: "Montando o seu diagnóstico…", lines: ["Vendo onde a sua venda trava", "Separando as aulas que resolvem isso", "Montando o seu plano de 7 dias"] },
  { kind: "result" },
  { kind: "offer" },
];
const TOTAL = STEPS.length;

const MODULOS = [
  {
    n: "01", icon: Bot, titulo: "Inteligência artificial para vender viagens todos os dias",
    itens: ["Criar anúncios, roteiros, textos e criativos com IA", "Construir páginas e estruturas de venda com IA", "Atender viajantes no WhatsApp com agentes de IA"],
  },
  {
    n: "02", icon: Target, titulo: "Onde e para quem vender",
    itens: ["Os públicos que mais compram viagens", "Como evitar curiosos e falar com quem compra", "Anunciar com resultado mesmo com orçamento baixo"],
  },
  {
    n: "03", icon: KeyIcon, titulo: "Os 3 pilares da venda de viagens",
    itens: ["Deixar o viajante seguro para comprar pela internet", "Uma presença profissional e confiável", "Conteúdo, anúncio e atendimento num sistema só"],
  },
];

function loadState(): { step: number; answers: Answers } {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const p = JSON.parse(raw);
      const step = Math.min(Math.max(Number(p.step) || 0, 0), TOTAL - 1);
      // Quem volta no meio do carregamento cai no diagnóstico.
      return { step: STEPS[step].kind === "loading" ? step + 1 : step, answers: p.answers || {} };
    }
  } catch { /* sem storage */ }
  return { step: 0, answers: {} };
}

export default function QuizAgenteLucrativo() {
  const inicial = useMemo(loadState, []);
  const [step, setStep] = useState(inicial.step);
  const [answers, setAnswers] = useState<Answers>(inicial.answers);
  const visto = useRef(false);

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ step, answers })); } catch { /* ignore */ }
  }, [step, answers]);

  useEffect(() => {
    if (!visto.current) {
      visto.current = true;
      trackMetaEvent("ViewContent", { content_name: "Agente Lucrativo - Quiz", content_category: "agente-lucrativo", content_type: "product" });
    }
    window.scrollTo({ top: 0 });
  }, [step]);

  const next = () => setStep((s) => Math.min(s + 1, TOTAL - 1));
  const back = () => setStep((s) => {
    let p = Math.max(s - 1, 0);
    while (p > 0 && STEPS[p].kind === "loading") p -= 1;
    return p;
  });
  const choose = (q: Question, id: string) => {
    if (q.multi) {
      setAnswers((a) => { const prev = a[q.key] || []; return { ...a, [q.key]: prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id] }; });
      return;
    }
    setAnswers((a) => ({ ...a, [q.key]: [id] }));
    window.setTimeout(next, 260);
  };
  const comprar = () => {
    trackMetaEvent("InitiateCheckout", { value: PRECO, currency: "BRL", content_name: "Agente Lucrativo", content_category: "agente-lucrativo" });
    window.location.href = HOTMART_AGENTE_LUCRATIVO;
  };

  const atual = STEPS[step];
  const progresso = Math.round(((step + 1) / TOTAL) * 100);

  return (
    <div className="cv-cream cv-black cv-flat min-h-[100dvh]" data-quiz-agente>
      <Helmet><title>Diagnóstico de vendas de viagem | Agente Lucrativo</title></Helmet>
      <div className="mx-auto flex min-h-[100dvh] max-w-[440px] flex-col px-5">
        <header className="sticky top-0 z-20 pb-3 pt-3" style={{ background: "var(--cv-bg)" }}>
          <div className="flex items-center justify-between">
            <button onClick={back} disabled={step === 0} aria-label="Voltar" className="grid h-9 w-9 place-items-center rounded-full disabled:opacity-0">
              <ChevronLeft className="h-5 w-5" />
            </button>
            <BrandMark size={26} withName={false} />
            <span className="w-9" />
          </div>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[var(--cv-track)]">
            <span className="block h-full rounded-full transition-[width] duration-500" style={{ width: `${progresso}%`, background: "var(--cv-primary)" }} />
          </div>
        </header>

        <main key={step} className="flex flex-1 flex-col pb-6 pt-6" data-passo={atual.kind === "question" ? atual.key : atual.kind}>
          {atual.kind === "intro" && <Intro onNext={next} />}
          {atual.kind === "question" && <Pergunta q={atual} selected={answers[atual.key] || []} onChoose={(id) => choose(atual, id)} onContinue={next} />}
          {atual.kind === "loading" && <Carregando label={atual.label} lines={atual.lines} onDone={next} />}
          {atual.kind === "result" && <Resultado answers={answers} onNext={next} />}
          {atual.kind === "offer" && <Oferta onComprar={comprar} />}
        </main>
      </div>
    </div>
  );
}

function Title({ children, sub, compact }: { children: ReactNode; sub?: ReactNode; compact?: boolean }) {
  return (
    <div className="cv-pop">
      <h1 className={`text-balance font-extrabold leading-[1.05] tracking-[-0.025em] ${compact ? "text-[24px]" : "text-[28px]"}`}>{children}</h1>
      {sub && <p className={compact ? "mt-1 text-[13px] leading-5" : "mt-2 text-[15px] leading-6"} style={{ color: "var(--cv-muted)" }}>{sub}</p>}
    </div>
  );
}
const Accent = ({ children }: { children: ReactNode }) => <span style={{ color: "var(--cv-primary-ink)" }}>{children}</span>;

function BottomCta({ children, onClick, disabled }: { children: ReactNode; onClick: () => void; disabled?: boolean }) {
  return (
    <div className="sticky bottom-0 mt-auto pt-6" style={{ background: "linear-gradient(180deg, transparent 0%, var(--cv-bg) 30%)" }}>
      <button onClick={onClick} disabled={disabled} data-cta className="cv-btn h-14 w-full text-base disabled:opacity-50">{children}</button>
    </div>
  );
}

function Intro({ onNext }: { onNext: () => void }) {
  return (
    <>
      <p className="cv-black-tag mx-auto mb-4">Diagnóstico grátis · 1 minuto</p>
      <div className="text-center">
        <h1 className="cv-pop text-balance text-[30px] font-extrabold leading-[1.06] tracking-[-0.025em]" style={delay(60)}>
          Você posta, o cliente chama… <Accent>e a venda não fecha?</Accent>
        </h1>
        <p className="cv-pop mx-auto mt-3 max-w-[340px] text-[15px] leading-6" style={{ ...delay(140), color: "var(--cv-muted)" }}>
          Responda 8 perguntas rápidas e veja <strong style={{ color: "var(--cv-fg)" }}>onde a sua venda de viagem está travando</strong> e o que fazer nos próximos 7 dias.
        </p>
      </div>
      <div className="cv-pop mt-7 grid grid-cols-3 gap-2 text-center" style={delay(220)}>
        {[{ i: MessageCircleOff, t: "Cliente que não chama" }, { i: Ghost, t: "Orçamento que some" }, { i: Megaphone, t: "Anúncio que não vende" }].map((c) => (
          <div key={c.t} className="cv-card flex flex-col items-center gap-2 p-3">
            <c.i className="h-6 w-6" />
            <p className="text-[12px] font-bold leading-4">{c.t}</p>
          </div>
        ))}
      </div>
      <BottomCta onClick={onNext}>Começar o diagnóstico <ArrowRight className="h-4 w-4" /></BottomCta>
      <p className="mt-2 text-center text-[13px]" style={{ color: "var(--cv-muted)" }}>Feito para agentes e agências de viagem</p>
    </>
  );
}

function Pergunta({ q, selected, onChoose, onContinue }: { q: Question; selected: string[]; onChoose: (id: string) => void; onContinue: () => void }) {
  return (
    <>
      <Title sub={q.sub} compact={q.multi}>{q.title}</Title>
      <div className={q.multi ? "mt-4 space-y-2" : "mt-7 space-y-2.5"}>
        {q.options.map((o, i) => {
          const on = selected.includes(o.id);
          return (
            <button
              key={o.id}
              data-opcao={o.id}
              onClick={() => onChoose(o.id)}
              className={`cv-pop flex w-full items-center border text-left transition-all duration-200 hover:-translate-y-px ${q.multi ? "gap-3 rounded-[18px] p-2.5" : "gap-3.5 rounded-[22px] p-3.5"}`}
              style={{ ...delay(80 + i * 60), background: on ? "var(--cv-soft)" : "var(--cv-card)", borderColor: on ? "var(--cv-primary)" : "var(--cv-line)" }}
            >
              <span className={`grid shrink-0 place-items-center rounded-xl ${q.multi ? "h-8 w-8" : "h-10 w-10"}`} style={{ background: on ? "var(--cv-soft-3)" : "var(--cv-sand)" }}>
                <o.icon className="h-[18px] w-[18px]" />
              </span>
              <span className="flex-1">
                <span className={`block font-semibold ${q.multi ? "text-[14px] leading-5" : "text-[15px]"}`}>{o.label}</span>
                <span className={`block ${q.multi ? "text-[12px] leading-4" : "text-[13px]"}`} style={{ color: "var(--cv-muted)" }}>{o.hint}</span>
              </span>
              <span className={`grid shrink-0 place-items-center border ${q.multi ? "h-5 w-5 rounded-md" : "h-6 w-6 rounded-full"}`} style={{ borderColor: on ? "var(--cv-primary)" : "var(--cv-ring)", background: on ? "var(--cv-primary)" : "transparent" }}>
                {on && <Check className="h-3.5 w-3.5" style={{ color: "var(--cv-bg)" }} />}
              </span>
            </button>
          );
        })}
      </div>
      {q.multi && <BottomCta onClick={onContinue} disabled={!selected.length}>{selected.length ? `Continuar (${selected.length})` : "Escolha pelo menos um"}</BottomCta>}
    </>
  );
}

function Carregando({ label, lines, onDone }: { label: string; lines: string[]; onDone: () => void }) {
  const [p, setP] = useState(0);
  useEffect(() => {
    const ini = Date.now();
    const tick = window.setInterval(() => setP(Math.min(100, Math.round(((Date.now() - ini) / LOADING_MS) * 100))), 100);
    const fim = window.setTimeout(onDone, LOADING_MS);
    return () => { window.clearInterval(tick); window.clearTimeout(fim); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const r = 42;
  const c = 2 * Math.PI * r;
  return (
    <div className="flex flex-col items-center text-center">
      <div className="relative h-24 w-24">
        <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90" aria-hidden>
          <circle cx="50" cy="50" r={r} fill="none" stroke="var(--cv-track)" strokeWidth="8" />
          <circle cx="50" cy="50" r={r} fill="none" stroke="var(--cv-primary)" strokeWidth="8" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - p / 100)} />
        </svg>
        <span className="absolute inset-0 grid place-items-center text-[20px] font-extrabold">{p}%</span>
      </div>
      <p className="mt-4 text-[20px] font-extrabold tracking-[-0.02em]">{label}</p>
      <div className="mt-6 w-full space-y-3 text-left">
        {lines.map((l, i) => (
          <p key={l} className="cv-pop flex items-center gap-2 text-[15px] font-semibold leading-5" style={delay(500 + i * 1500)}>
            <Check className="h-4 w-4 shrink-0" style={{ color: "var(--cv-primary)" }} /> {l}
          </p>
        ))}
      </div>
    </div>
  );
}

const PONTOS: Record<string, { titulo: string; fix: string; modulo: string }> = {
  ninguem: { titulo: "O seu conteúdo não está trazendo conversa", fix: "Você aprende a usar IA para criar roteiros, anúncios e textos que fazem o viajante chamar.", modulo: "Módulo 01" },
  somem: { titulo: "O cliente some depois do orçamento", fix: "Você aprende a deixar o viajante seguro para comprar pela internet, do primeiro contato ao fechamento.", modulo: "Módulo 03" },
  preco: { titulo: "O cliente compara só o preço", fix: "Você aprende a ter uma presença profissional e confiável, para o viajante comprar de você e não do mais barato.", modulo: "Módulo 03" },
  oque: { titulo: "Falta saber o que postar", fix: "Você aprende a criar com IA os roteiros, textos e criativos de cada destino que vende.", modulo: "Módulo 01" },
  anuncioNovo: { titulo: "Você ainda não usa anúncio a seu favor", fix: "Você aprende para quem anunciar e como começar com orçamento baixo, sem jogar dinheiro fora.", modulo: "Módulo 02" },
  anuncioCaro: { titulo: "O seu anúncio atrai curioso", fix: "Você aprende a evitar curiosos e falar com os públicos que mais compram viagens.", modulo: "Módulo 02" },
  ia: { titulo: "A IA ainda não trabalha por você", fix: "Você aprende a ter agentes de IA atendendo viajantes no WhatsApp e criando material de venda.", modulo: "Módulo 01" },
  tempo: { titulo: "O seu tempo é curto", fix: "São 2 horas de aula, direto no celular. Dá para aplicar no mesmo dia, mesmo com pouco tempo.", modulo: "Formato" },
};
const DESTINO: Record<string, string> = {
  nacional: "seu pacote nacional", internacional: "seu destino internacional", cruzeiro: "seu cruzeiro", grupo: "sua próxima excursão",
  luademel: "seu pacote de lua de mel", aereo: "suas passagens e hotéis",
};

function Resultado({ answers, onNext }: { answers: Answers; onNext: () => void }) {
  const a = (k: Key) => answers[k]?.[0];
  const pontos = [
    PONTOS[a("trava") || ""],
    a("anuncio") === "nunca" || a("anuncio") === "impulsionei" ? PONTOS.anuncioNovo : a("anuncio") === "caro" ? PONTOS.anuncioCaro : null,
    a("ia") && a("ia") !== "muito" ? PONTOS.ia : null,
    a("tempo") === "pouco" ? PONTOS.tempo : null,
  ].filter(Boolean) as (typeof PONTOS)[string][];
  const lista = pontos.length ? pontos : [PONTOS.ia];
  const produto = DESTINO[answers.vende?.[0] || ""] || "seu pacote principal";
  const dias = [
    `Assistir ao módulo 01 e criar com IA 3 roteiros de vídeo do ${produto}`,
    "Postar o primeiro vídeo e responder todo mundo que chamar",
    "Assistir ao módulo 02 e escolher o público do seu primeiro anúncio",
    "Subir um anúncio pequeno, com orçamento que cabe no bolso",
    "Assistir ao módulo 03 e ajustar o seu perfil para passar confiança",
    "Montar a sua mensagem de orçamento e de acompanhamento no WhatsApp",
    "Revisar o que chamou mais conversa e repetir na semana seguinte",
  ];
  return (
    <>
      <Title sub="Pelo que você respondeu, é aqui que estão as vendas que você está perdendo.">Seu diagnóstico <Accent>está pronto</Accent></Title>
      <div className="cv-pop cv-card mt-6 p-5" style={delay(120)} data-diagnostico>
        <p className="text-[11px] font-bold tracking-[1.2px]" style={{ color: "var(--cv-muted)" }}>O QUE ESTÁ TRAVANDO</p>
        <div className="mt-3 space-y-3.5">
          {lista.map((p) => (
            <div key={p.titulo} className="flex items-start gap-3">
              <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full" style={{ background: "var(--cv-soft)" }}><Check className="h-3.5 w-3.5" style={{ color: "var(--cv-primary)" }} /></span>
              <div>
                <p className="text-[14px] font-bold">{p.titulo}</p>
                <p className="text-[13px] leading-5" style={{ color: "var(--cv-muted)" }}>{p.fix}</p>
                <p className="mt-1 text-[11px] font-bold uppercase tracking-wider" style={{ color: "var(--cv-primary-ink)" }}>{p.modulo}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="cv-pop cv-card mt-4 p-5" style={delay(260)}>
        <p className="text-[11px] font-bold tracking-[1.2px]" style={{ color: "var(--cv-muted)" }}>SEU PLANO DE 7 DIAS</p>
        <ol className="mt-2 divide-y" style={{ borderColor: "var(--cv-line)" }}>
          {dias.map((d, i) => (
            <li key={d} className="flex items-start gap-3 py-2 text-[14px] leading-5" style={{ borderColor: "var(--cv-line)" }}>
              <span className="w-12 shrink-0 text-[12px] font-bold" style={{ color: "var(--cv-muted)" }}>Dia {i + 1}</span>
              <span className="flex-1">{d}</span>
            </li>
          ))}
        </ol>
      </div>
      <BottomCta onClick={onNext}>Ver como aplicar o plano <ArrowRight className="h-4 w-4" /></BottomCta>
    </>
  );
}

function Oferta({ onComprar }: { onComprar: () => void }) {
  return (
    <>
      <p className="cv-black-tag mx-auto mb-3">Agente de Viagens Lucrativo</p>
      <Title sub="O treinamento que mostra o caminho do vídeo até a viagem paga, para agentes autônomos e donos de agência.">Aplique o seu plano com <Accent>o Agente Lucrativo</Accent></Title>

      <div className="mt-5 space-y-3">
        {MODULOS.map((m, i) => (
          <div key={m.n} className="cv-pop cv-card p-4" style={delay(120 + i * 90)}>
            <div className="flex items-start gap-3">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl" style={{ background: "var(--cv-soft-3)" }}><m.icon className="h-5 w-5" /></span>
              <div className="flex-1">
                <p className="text-[11px] font-bold uppercase tracking-wider" style={{ color: "var(--cv-primary-ink)" }}>Módulo {m.n}</p>
                <p className="text-[15px] font-extrabold leading-5">{m.titulo}</p>
                <ul className="mt-2 space-y-1">
                  {m.itens.map((t) => <li key={t} className="flex gap-2 text-[13px] leading-5"><Check className="mt-0.5 h-4 w-4 shrink-0" style={{ color: "var(--cv-primary)" }} />{t}</li>)}
                </ul>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2 text-center">
        {[{ i: Smartphone, t: "2 horas de aula no celular" }, { i: InfinityIcon, t: "Acesso para sempre" }, { i: ShieldCheck, t: "7 dias de garantia" }].map((c) => (
          <div key={c.t} className="cv-card flex flex-col items-center gap-1.5 p-3">
            <c.i className="h-5 w-5" style={{ color: "var(--cv-primary)" }} />
            <p className="text-[12px] font-bold leading-4">{c.t}</p>
          </div>
        ))}
      </div>

      <div className="cv-card mt-3 p-4">
        <p className="text-[14px] font-extrabold">Também vem junto</p>
        <ul className="mt-2 space-y-1.5 text-[13px] leading-5">
          {["Grupo de agentes e suporte no WhatsApp", "Aulas novas e atualizações sem pagar de novo"].map((t) => <li key={t} className="flex gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0" style={{ color: "var(--cv-primary)" }} />{t}</li>)}
        </ul>
      </div>

      <div className="cv-pop mt-5 rounded-[24px] border-2 p-5 text-center" style={{ ...delay(380), borderColor: "var(--cv-primary)", background: "var(--cv-soft-2)" }} data-preco>
        <p className="text-[13px] font-semibold" style={{ color: "var(--cv-muted)" }}>Pagamento único</p>
        <p className="mt-1 text-[40px] font-extrabold leading-none">R$ 97</p>
        <p className="mt-1 text-[14px] font-semibold" style={{ color: "var(--cv-muted)" }}>ou 12x de R$ 10,03</p>
        <button onClick={onComprar} data-comprar className="cv-btn mt-4 h-14 w-full text-base">Quero o Agente Lucrativo <ArrowRight className="h-4 w-4" /></button>
        <p className="mt-3 flex items-center justify-center gap-1.5 text-[12px]" style={{ color: "var(--cv-muted)" }}><Lock className="h-3.5 w-3.5" /> Compra segura pela Hotmart</p>
      </div>

      <div className="cv-card mt-4 p-4 text-[13px] leading-5" style={{ color: "var(--cv-muted)" }}>
        <p className="inline-flex items-center gap-1.5 font-bold" style={{ color: "var(--cv-fg)" }}><ShieldCheck className="h-4 w-4" /> Garantia de 7 dias</p>
        <p className="mt-1">Assista às aulas e aplique no seu dia a dia. Se não fizer sentido, peça o dinheiro de volta dentro de 7 dias.</p>
      </div>
    </>
  );
}
