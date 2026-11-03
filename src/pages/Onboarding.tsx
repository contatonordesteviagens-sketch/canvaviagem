import { useEffect, useMemo, useRef, useState, type ComponentType, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import {
  ArrowRight, Check, ChevronLeft, ChevronRight, Wallet, Sprout, Briefcase, TrendingUp, Palette, UserRound,
  Images, EyeOff, Rocket, Users, Clock, MessageCircleOff, Sparkles, Waves, Mountain, Plane, Ship, Bus, Globe2,
  PenLine, Frown, Flame, CalendarDays, Leaf, Eye, Gift, ShieldCheck, Lock, CircleCheck, MapPin, Instagram,
  LayoutTemplate, MessageCircle, Download, Megaphone, Mic, Video, QrCode, CreditCard,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useEntitlements } from "@/contexts/EntitlementsContext";
import { trackMetaEvent } from "@/lib/meta-pixel-sales";
import { ELITE_OFFER } from "@/lib/eliteOffer";
import { checkoutPath } from "@/components/checkout/checkout-plans";
import { isBlackFunnel } from "@/lib/black-funnel";
import { PayWithPixButton } from "@/components/pix/PixCheckout";
import { BrandMark, delay } from "@/components/cv-cream/shared";
import { captureLead, readLeadEmail } from "@/lib/lead-capture";
import { ShowcaseRow, SHOWCASE_ADS, SHOWCASE_CAROUSELS } from "@/components/cv-cream/Showcase";
import { ONBOARDING_DESTINO_KEY, yearGifs } from "@/pages/InicioCreme";
import { isLocalPreviewEnabled } from "@/lib/localPreview";
import { trackInicioTeste } from "@/lib/inicio-teste";
import { readTrialResult, type TrialResult } from "@/lib/inicio-arte";
import depoimento1 from "@/assets/depoimento1.jpg";
import depoimento2 from "@/assets/depoimento2.png";
import depoimento3 from "@/assets/depoimento3.jpg";

type Icon = ComponentType<{ className?: string }>;
type Option = { id: string; label: string; hint: string; icon: Icon };
type QuestionStep = { kind: "question"; key: AnswerKey; title: string; sub: string; multi?: boolean; options: Option[] };
type ScreenStep = { kind: "intro" | "result" | "offer" };
type LoadingStep = { kind: "loading"; label: string; reviews: string[] };
type Step = QuestionStep | ScreenStep | LoadingStep;
type AnswerKey = "objetivo" | "ferramenta" | "desafio" | "momento" | "orcamentos" | "destinos" | "travas" | "prazo";
type Answers = Partial<Record<AnswerKey, string[]>>;
type Cycle = "monthly" | "semiannual" | "annual";

// v6: telas de carregamento no lugar da tela de prova; as versões antigas guardavam o passo pela ordem antiga.
const STORAGE_KEY = "cv-onboarding-v6";
const LOADING_MS = 7000;
const OFFER_KEY = "cv-oferta-fim";
const OFFER_MS = 18 * 60 * 1000;

const STEPS: Step[] = [
  { kind: "intro" },
  {
    kind: "question", key: "objetivo", title: "O que mais vendas mudariam pra você?", sub: "Seja sincero, isso muda tudo o que vamos recomendar",
    options: [
      { id: "contas", label: "Pagar as contas do mês", hint: "Ter um caixa previsível", icon: Wallet },
      { id: "primeira", label: "Fazer a primeira venda", hint: "Sair do zero de vez", icon: Sprout },
      { id: "emprego", label: "Largar o emprego", hint: "Viver só da agência", icon: Briefcase },
      { id: "crescer", label: "Crescer a agência", hint: "Vender mais do que já vendo", icon: TrendingUp },
    ],
  },
  {
    kind: "question", key: "ferramenta", title: "Como você cria seus posts hoje?", sub: "Isso decide quanto trabalho a gente tira das suas mãos",
    options: [
      { id: "canva", label: "Editor online, tipo Canva", hint: "Grátis, mas leva horas", icon: Palette },
      { id: "designer", label: "Designer ou freelancer", hint: "Caro e demora dias", icon: UserRound },
      { id: "operadora", label: "Arte pronta da operadora", hint: "Igual à de todo mundo", icon: Images },
      { id: "nada", label: "Quase não posto", hint: "Não sei por onde começar", icon: EyeOff },
    ],
  },
  {
    kind: "question", key: "desafio", title: "Qual é o seu maior desafio hoje?", sub: "Escolha o que mais pesa",
    options: [
      { id: "oque", label: "Não sei o que postar", hint: "Fico olhando a tela em branco", icon: PenLine },
      { id: "ninguem", label: "Posto e ninguém chama", hint: "Curtidas sem orçamento", icon: MessageCircleOff },
      { id: "tempo", label: "Demora demais pra criar", hint: "Uma arte leva a tarde toda", icon: Clock },
      { id: "amador", label: "Meus posts parecem amadores", hint: "Não passam confiança", icon: Frown },
    ],
  },
  {
    kind: "question", key: "momento", title: "Em que momento você está?", sub: "Não existe resposta errada",
    options: [
      { id: "comecando", label: "Começando agora", hint: "Ainda não vendi", icon: Sprout },
      { id: "pouco", label: "Já vendi, mas pouco", hint: "Vendas de vez em quando", icon: Rocket },
      { id: "todo-mes", label: "Vendo todo mês", hint: "Quero escalar", icon: TrendingUp },
      { id: "equipe", label: "Tenho equipe", hint: "Agência estruturada", icon: Users },
    ],
  },
  {
    kind: "question", key: "orcamentos", title: "Quantos orçamentos você recebe por semana?", sub: "Conta aproximada já ajuda",
    options: [
      { id: "zero", label: "Nenhum ainda", hint: "O WhatsApp quase não toca", icon: MessageCircleOff },
      { id: "poucos", label: "De 1 a 5", hint: "Chegam alguns, sem constância", icon: MessageCircle },
      { id: "medio", label: "De 6 a 20", hint: "Tenho movimento, quero mais", icon: TrendingUp },
      { id: "muitos", label: "Mais de 20", hint: "Preciso organizar e fechar mais", icon: Users },
    ],
  },
  {
    kind: "question", key: "destinos", multi: true, title: "Quais destinos você mais vende?", sub: "Marque todos que quiser",
    options: [
      { id: "praia", label: "Praias do Brasil", hint: "Nordeste, litoral, ilhas", icon: Waves },
      { id: "serra", label: "Serra e frio", hint: "Gramado, Campos do Jordão", icon: Mountain },
      { id: "internacional", label: "Internacional", hint: "Disney, Europa, Caribe", icon: Plane },
      { id: "cruzeiro", label: "Cruzeiros", hint: "Navios e roteiros", icon: Ship },
      { id: "excursao", label: "Excursões", hint: "Bate-volta e grupos", icon: Bus },
    ],
  },
  {
    kind: "loading", label: "Preparando o seu diagnóstico…",
    reviews: ["Fiz 23 orçamentos só ontem e consegui fechar 5 pacotes.", "Eu comprei, estou usando e é maravilhoso o conteúdo."],
  },
  { kind: "result" },
  {
    kind: "loading", label: "Liberando o seu plano…",
    reviews: ["Esse mês já saíram várias vendas, até aumentei a meta do mês.", "Ajudou muito aqui. Tava batendo cabeça para criar vídeos dos lugares para postar."],
  },
  { kind: "offer" },
];

const TOTAL = STEPS.length;
// A barra anda mais no começo: duas perguntas respondidas já marcam 50%, para mostrar que é rápido.
const PROGRESS = [8, 25, 38, 50, 62, 72, 82, 90, 94, 97, 100];

const FIXES: Record<string, { title: string; fix: string; icon: Icon }> = {
  design: { title: "Você não sabe criar postagens", fix: "Anúncio, carrossel e vídeo já vêm prontos. Você só fala o pacote.", icon: Palette },
  tempo: { title: "Você não tem tempo", fix: "Cada arte sai em cerca de 2 minutos, com legenda e logo.", icon: Clock },
  vergonha: { title: "Seu Instagram ainda não parece de agência grande", fix: "Duas semanas de posts profissionais já mudam a cara do perfil.", icon: EyeOff },
};

const DESTINO_LABEL: Record<string, string> = {
  praia: "Porto de Galinhas", serra: "Gramado", internacional: "Cancún", cruzeiro: "Cruzeiro pelo litoral", excursao: "Excursão de fim de semana",
};

type Plan = { cycle: Cycle; name: string; hint: string; price: string; per: string; note: string; value: number; popular?: boolean; was?: string };
const NORMAL_PLANS: Plan[] = [
  { cycle: "monthly", name: "Mensal", hint: "Pra testar com calma", price: ELITE_OFFER.monthlyPrice, per: "/mês", note: "Cancele quando quiser", value: 97 },
  { cycle: "semiannual", name: "Semestral", hint: "6 meses de acesso", price: ELITE_OFFER.semiannualPrice, per: "/6 meses", note: "R$ 57,83 por mês", value: 347 },
  { cycle: "annual", name: "Anual", hint: "Postando o ano inteiro", price: ELITE_OFFER.annualPrice, per: "/ano", note: `${ELITE_OFFER.annualMonthlyEquivalent} por mês · economia de ${ELITE_OFFER.annualSavings}`, value: 482, popular: true },
];
// Black (quem veio da /black): metade do preço, e a renovação continua com a metade. O servidor confirma o valor.
const BLACK_PLANS: Plan[] = [
  { cycle: "monthly", name: "Mensal", hint: "Pra testar com calma", price: "R$ 48,50", was: ELITE_OFFER.monthlyPrice, per: "/mês", note: "Cancele quando quiser · 50% para sempre", value: 48.5 },
  { cycle: "semiannual", name: "Semestral", hint: "6 meses de acesso", price: "R$ 173,50", was: ELITE_OFFER.semiannualPrice, per: "/6 meses", note: "R$ 28,92 por mês · 50% para sempre", value: 173.5 },
  { cycle: "annual", name: "Anual", hint: "Postando o ano inteiro", price: "R$ 241", was: ELITE_OFFER.annualPrice, per: "/ano", note: "R$ 20,08 por mês · 50% para sempre", value: 241, popular: true },
];
const BLACK = isBlackFunnel();
const PLANS = BLACK ? BLACK_PLANS : NORMAL_PLANS;


function loadState(): { step: number; answers: Answers } {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      const step = Math.min(Math.max(Number(parsed.step) || 0, 0), TOTAL - 1);
      return { step, answers: parsed.answers || {} };
    }
  } catch { /* storage indisponível */ }
  return { step: 0, answers: {} };
}

export default function Onboarding() {
  const navigate = useNavigate();
  const { user, subscription } = useAuth();
  const { track } = useEntitlements();
  const initial = useMemo(loadState, []);
  const [step, setStep] = useState(initial.step);
  const [answers, setAnswers] = useState<Answers>(initial.answers);
  const [plan, setPlan] = useState<Cycle>("annual");
  const startedRef = useRef(false);

  const destinoDigitado = useMemo(() => {
    try { return sessionStorage.getItem(ONBOARDING_DESTINO_KEY)?.trim() || ""; } catch { return ""; }
  }, []);
  const destinoPrincipal = destinoDigitado || DESTINO_LABEL[answers.destinos?.[0] ?? ""] || "Cancún";

  useEffect(() => {
    // Quem já assinou não precisa do quiz: vai direto para a Fábrica, que herda as respostas.
    if (subscription.subscribed && !isLocalPreviewEnabled()) navigate("/fabrica", { replace: true });
  }, [subscription.subscribed, navigate]);

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ step, answers })); } catch { /* ignore */ }
  }, [step, answers]);

  useEffect(() => {
    if (!startedRef.current) {
      startedRef.current = true;
      trackMetaEvent("ViewContent", { content_name: "Canva Viagem - Onboarding Quiz", content_category: "onboarding", content_type: "product" });
      trackInicioTeste("quiz");
    }
    track("onboarding_step", { step: step + 1, kind: STEPS[step].kind, key: (STEPS[step] as QuestionStep).key ?? null });
    if (STEPS[step].kind !== "loading") trackInicioTeste("quiz_tela", { tela: (STEPS[step] as QuestionStep).key ?? STEPS[step].kind });
    // Sem sessão (quem já tem conta e ainda não confirmou o e-mail): registra pelo e-mail digitado.
    if (!user) captureLead(readLeadEmail(), "step", { step: step + 1, kind: STEPS[step].kind, key: (STEPS[step] as QuestionStep).key ?? null });
    window.scrollTo({ top: 0 });
  }, [step, track, user]);

  // Liga a conta ao grupo do teste, para a Gestão ver quem assinou em cada página.
  const contaMarcada = useRef(false);
  useEffect(() => {
    if (!user || contaMarcada.current) return;
    contaMarcada.current = true;
    trackInicioTeste("conta");
  }, [user]);

  const next = () => setStep((s) => Math.min(s + 1, TOTAL - 1));
  // Voltando, pula as telas de carregamento.
  const back = () => setStep((s) => {
    const previous = Math.max(s - 1, 0);
    return STEPS[previous].kind === "loading" ? previous - 1 : previous;
  });

  const current = STEPS[step];

  const choose = (q: QuestionStep, id: string) => {
    const valor = q.options.find((o) => o.id === id)?.label;
    const marcando = !(answers[q.key] || []).includes(id);
    if (marcando) trackInicioTeste("resposta", { tela: q.key, valor });
    if (q.multi) {
      setAnswers((a) => {
        const prev = a[q.key] || [];
        return { ...a, [q.key]: prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id] };
      });
      return;
    }
    setAnswers((a) => ({ ...a, [q.key]: [id] }));
    window.setTimeout(next, 280);
  };

  const registerPayment = (method: "pix" | "cartao") => {
    track("plan_selected", { billing_cycle: plan, feature: "onboarding", answers, method });
    trackInicioTeste("pagar", { tela: plan, valor: method });
  };

  const checkout = (method: "cartao") => {
    const selected = PLANS.find((p) => p.cycle === plan)!;
    registerPayment(method);
    if (!user) captureLead(readLeadEmail(), "plan", { billing_cycle: plan });
    trackMetaEvent("InitiateCheckout", { value: selected.value, currency: "BRL", content_name: `Canva Viagem ${selected.name}`, content_category: "onboarding" });
    navigate(checkoutPath(plan, method, BLACK ? "black-friday" : null));
  };

  return (
    <div className={`cv-cream min-h-[100dvh]${BLACK ? " cv-black" : ""}`}>
      <Helmet><title>Seu plano — Canva Viagem</title></Helmet>
      <div className="mx-auto flex min-h-[100dvh] max-w-[440px] flex-col px-5">
        <header className="sticky top-0 z-20 pb-3 pt-3" style={{ background: "var(--cv-bg)" }}>
          <div className="flex items-center justify-between">
            <button onClick={back} disabled={step === 0} aria-label="Voltar" className="grid h-9 w-9 place-items-center rounded-full transition-colors hover:bg-[var(--cv-sand)] disabled:opacity-0">
              <ChevronLeft className="h-5 w-5" />
            </button>
            <BrandMark size={26} withName={false} />
            <span className="w-9" />
          </div>
          <Progress step={step} />
        </header>

        <main key={step} className="flex flex-1 flex-col pb-6 pt-6">
          {current.kind === "question" ? (
            <Question q={current} selected={answers[current.key] || []} onChoose={(id) => choose(current, id)} onContinue={next} />
          ) : current.kind === "loading" ? (
            <Loading label={current.label} reviews={current.reviews} onDone={next} />
          ) : (
            <Screen kind={current.kind} answers={answers} destino={destinoPrincipal} plan={plan} setPlan={(c) => { trackInicioTeste("plano", { valor: c }); setPlan(c); }} onNext={next} onCheckout={() => checkout("cartao")} onPix={() => registerPayment("pix")} />
          )}
        </main>
      </div>
    </div>
  );
}

function Progress({ step }: { step: number }) {
  return (
    <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[var(--cv-track)]">
      <span className="block h-full rounded-full transition-[width] duration-500" style={{ width: `${PROGRESS[step] ?? 100}%`, background: "var(--cv-primary)" }} />
    </div>
  );
}

function Title({ children, sub, compact }: { children: ReactNode; sub?: ReactNode; compact?: boolean }) {
  return (
    <div className="cv-pop">
      <h1 className={`text-balance font-extrabold leading-[1.05] tracking-[-0.025em] ${compact ? "text-[24px]" : "text-[30px]"}`}>{children}</h1>
      {sub && <p className={compact ? "mt-1 text-[13px] leading-5" : "mt-2 text-[15px] leading-6"} style={{ color: "var(--cv-muted)" }}>{sub}</p>}
    </div>
  );
}

function Accent({ children }: { children: ReactNode }) {
  return <span style={{ color: "var(--cv-primary-ink)" }}>{children}</span>;
}

function BottomCta({ children, onClick, disabled }: { children: ReactNode; onClick: () => void; disabled?: boolean }) {
  return (
    <div className="sticky bottom-0 mt-auto pt-6" style={{ background: "linear-gradient(180deg, rgba(251,246,233,0) 0%, var(--cv-bg) 30%)" }}>
      <button onClick={onClick} disabled={disabled} className="cv-btn h-14 w-full text-base">{children}</button>
    </div>
  );
}

function Question({ q, selected, onChoose, onContinue }: { q: QuestionStep; selected: string[]; onChoose: (id: string) => void; onContinue: () => void }) {
  return (
    <>
      {/* Múltipla escolha: menor, para o botão de continuar aparecer sem rolar. */}
      <Title sub={q.sub} compact={q.multi}>{q.title}</Title>
      <div className={q.multi ? "mt-4 space-y-2" : "mt-7 space-y-2.5"}>
        {q.options.map((o, i) => {
          const on = selected.includes(o.id);
          return (
            <button
              key={o.id}
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
                {on && <Check className="h-3.5 w-3.5 text-white" />}
              </span>
            </button>
          );
        })}
      </div>
      {q.multi && (
        <>
          <BottomCta onClick={onContinue} disabled={selected.length === 0}>{selected.length === 0 ? "Escolha pelo menos um" : `Continuar (${selected.length})`}</BottomCta>
        </>
      )}
    </>
  );
}

type ScreenProps = {
  kind: ScreenStep["kind"]; answers: Answers; destino: string; plan: Cycle;
  setPlan: (c: Cycle) => void; onNext: () => void; onCheckout: () => void; onPix: () => void;
};

function Screen(props: ScreenProps) {
  switch (props.kind) {
    case "intro": return <Intro onNext={props.onNext} />;
    case "result": return <Result answers={props.answers} destino={props.destino} onNext={props.onNext} />;
    case "offer": return <Offer plan={props.plan} setPlan={props.setPlan} onCheckout={props.onCheckout} onPix={props.onPix} />;
  }
}

/** As 3 artes do teste em pilha: a do meio na frente, as outras atrás. */
function TrialStack({ trial }: { trial: TrialResult }) {
  const arts = trial.arts.slice(0, 3);
  const size = "min(40vw, 170px)";
  const places = [
    { transform: "translateX(-62%) rotate(-7deg) scale(.88)", zIndex: 1 },
    { transform: "translateX(62%) rotate(7deg) scale(.88)", zIndex: 1 },
    { transform: "none", zIndex: 2 },
  ];
  return (
    <div className="cv-pop relative mt-7 flex w-full items-center justify-center" style={{ ...delay(220), height: `calc(${size} + 16px)` }} onContextMenu={(e) => e.preventDefault()}>
      {arts.map((src, i) => (
        <img
          key={src.slice(-40)}
          src={src}
          alt={`Arte ${i + 1} de ${trial.destino}`}
          draggable={false}
          className="pointer-events-none absolute aspect-square select-none rounded-2xl border-[3px] border-white object-cover shadow-xl"
          style={{ width: size, ...places[arts.length === 3 ? i : 2 - i] }}
        />
      ))}
    </div>
  );
}

/** Carregando em círculo, com avaliações curtas tiradas das mensagens de clientes. */
function Loading({ label, reviews, onDone }: { label: string; reviews: string[]; onDone: () => void }) {
  const [percent, setPercent] = useState(0);
  useEffect(() => {
    const started = Date.now();
    const tick = window.setInterval(() => setPercent(Math.min(100, Math.round(((Date.now() - started) / LOADING_MS) * 100))), 100);
    const end = window.setTimeout(onDone, LOADING_MS);
    return () => { window.clearInterval(tick); window.clearTimeout(end); };
  }, []);
  const radius = 42;
  const circle = 2 * Math.PI * radius;
  return (
    <div className="flex flex-col items-center text-center">
      <div className="relative h-24 w-24">
        <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90" aria-hidden>
          <circle cx="50" cy="50" r={radius} fill="none" stroke="var(--cv-track)" strokeWidth="8" />
          <circle cx="50" cy="50" r={radius} fill="none" stroke="var(--cv-primary)" strokeWidth="8" strokeLinecap="round" strokeDasharray={circle} strokeDashoffset={circle * (1 - percent / 100)} />
        </svg>
        <span className="absolute inset-0 grid place-items-center text-[20px] font-extrabold">{percent}%</span>
      </div>
      <p className="mt-4 text-[20px] font-extrabold tracking-[-0.02em]">{label}</p>
      <div className="mt-6 w-full space-y-3 text-left">
        {reviews.map((review, i) => (
          <div key={review} className="cv-pop cv-card p-4" style={delay(600 + i * 2200)}>
            <p className="flex items-center gap-1 text-[12px] font-bold" style={{ color: "var(--cv-muted)" }}>
              <span aria-hidden style={{ color: "#f5a623" }} className="text-[15px] tracking-[1px]">★★★★★</span> 5 estrelas
            </p>
            <p className="mt-1.5 text-[15px] font-semibold leading-5">"{review}"</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function Intro({ onNext }: { onNext: () => void }) {
  const [trial] = useState(readTrialResult);
  return (
    <>
      <div className="flex flex-col items-center text-center">
        <h1 className="cv-pop text-balance text-[28px] font-extrabold leading-[1.08] tracking-[-0.025em]" style={delay(80)}>
          Fale da sua agência e <Accent>receba tudo pronto.</Accent>
        </h1>
        <p className="cv-pop mt-2 max-w-[330px] text-[15px] leading-6" style={{ ...delay(160), color: "var(--cv-muted)" }}>
          Responda o questionário de 1 minuto para <strong style={{ color: "var(--cv-fg)" }}>liberar o seu acesso.</strong>
        </p>
      </div>
      {trial ? (
        <TrialStack trial={trial} />
      ) : (
        <div className="cv-pop -mx-5 mt-6" style={delay(220)}>
          <ShowcaseRow pieces={SHOWCASE_ADS} alt="Anúncio feito no Canva Viagem" />
          <ShowcaseRow pieces={SHOWCASE_CAROUSELS} alt="Slide de carrossel feito no Canva Viagem" slow size="compact" className="mt-1" />
        </div>
      )}
      <BottomCta onClick={onNext}>Começar agora <ArrowRight className="h-4 w-4" /></BottomCta>
      <p className="mt-2 text-center text-[13px] leading-5" style={{ color: "var(--cv-muted)" }}>Avance para gerar mais artes sem marca d'água, com o seu preço e o seu WhatsApp.</p>
    </>
  );
}

function Result({ answers, destino, onNext }: { answers: Answers; destino: string; onNext: () => void }) {
  const [openWeek2, setOpenWeek2] = useState(false);
  const desafio = answers.desafio?.[0];
  const orcamentos = answers.orcamentos?.[0];
  // O que a pessoa respondeu e o que a plataforma faz por isso. Sem nota: não temos dado para medir ninguém.
  const pontos = [
    { show: desafio === "tempo", label: "Falta tempo para postar", fix: "A arte sai em minutos, sem começar do zero." },
    { show: desafio === "amador", label: "Os posts parecem amadores", fix: "Modelos prontos, com a sua logo e as suas cores." },
    { show: desafio === "ninguem", label: "Posta e ninguém chama", fix: "Anúncio com preço e WhatsApp, e o site do pacote para receber o pedido." },
    { show: desafio === "oque", label: "Não sabe o que postar", fix: "Uma sugestão do que postar em cada dia." },
    { show: orcamentos === "zero" || orcamentos === "poucos", label: "Poucos pedidos de orçamento", fix: "Site com o botão do WhatsApp e seus clientes organizados em um só lugar." },
  ].filter((p) => p.show);
  const pontosVisiveis = pontos.length ? pontos : [{ label: "Vender mais com a mesma rotina", fix: "Arte, site e clientes no mesmo lugar, sem precisar de equipe." }];
  const weeks = [
    [
      { d: "Seg", t: `Anúncio de ${destino} + stories do pacote`, icon: Megaphone },
      { d: "Ter", t: "Carrossel do pacote com dicas da viagem", icon: Images },
      { d: "Qua", t: "Pacote publicado no seu site", icon: Globe2 },
      { d: "Qui", t: "Vídeo pronto do destino", icon: Video },
      { d: "Sex", t: "Stories e vídeo de outro pacote em promoção", icon: LayoutTemplate },
      { d: "Sáb", t: "Responder orçamentos no WhatsApp e anunciar outro pacote", icon: MessageCircle },
      { d: "Dom", t: "Organizar clientes no CRM e planejar a semana", icon: Users },
    ],
    [
      { d: "Seg", t: "Anúncio de um pacote novo + stories com enquete", icon: Megaphone },
      { d: "Ter", t: "Carrossel: o que fazer no destino", icon: Images },
      { d: "Qua", t: "Página do pacote novo no site e link na bio", icon: Globe2 },
      { d: "Qui", t: "Vídeo pronto de outro destino", icon: Video },
      { d: "Sex", t: "Stories com contagem regressiva da promoção", icon: LayoutTemplate },
      { d: "Sáb", t: "Mandar a página do pacote para quem pediu orçamento", icon: MessageCircle },
      { d: "Dom", t: "CRM: quem fechou, quem falta responder e o plano da próxima semana", icon: Users },
    ],
  ];
  return (
    <>
      <Title sub="Com base nas suas respostas">Seu diagnóstico <Accent>está pronto</Accent></Title>
      <div className="cv-pop cv-card mt-6 p-5" style={delay(120)}>
        <p className="text-[11px] font-bold tracking-[1.2px]" style={{ color: "var(--cv-muted)" }}>O QUE VOCÊ NOS CONTOU</p>
        <div className="mt-3 space-y-3">
          {pontosVisiveis.map((p) => (
            <div key={p.label} className="flex items-start gap-3">
              <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full" style={{ background: "var(--cv-soft)" }}><Check className="h-3.5 w-3.5 text-[#6440e6]" /></span>
              <div>
                <p className="text-[14px] font-bold">{p.label}</p>
                <p className="text-[13px] leading-5" style={{ color: "var(--cv-muted)" }}>{p.fix}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="cv-pop cv-card mt-4 p-5" style={delay(300)}>
        <div className="flex items-center justify-between">
          <p className="text-[11px] font-bold tracking-[1.2px]" style={{ color: "var(--cv-muted)" }}>O QUE POSTAR NAS 2 PRIMEIRAS SEMANAS</p>
          <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[12px] font-semibold" style={{ background: "var(--cv-soft)", color: "var(--cv-primary-ink)" }}><MapPin className="h-3 w-3" /> {destino}</span>
        </div>
        <p className="mt-3 text-[13px] font-bold">Semana 1</p>
        <WeekList days={weeks[0]} />
        <button
          type="button"
          onClick={() => setOpenWeek2((o) => !o)}
          aria-expanded={openWeek2}
          className="mt-3 flex w-full items-center justify-between rounded-2xl px-3 py-2.5 text-left text-[13px] font-bold"
          style={{ background: "var(--cv-sand)" }}
        >
          Semana 2 · novo pacote, mesmo ritmo
          <ChevronLeft className="h-4 w-4 transition-transform" style={{ transform: openWeek2 ? "rotate(90deg)" : "rotate(-90deg)" }} />
        </button>
        {openWeek2 && <WeekList days={weeks[1]} />}
      </div>
      <BottomCta onClick={onNext}>Ver meu plano <ArrowRight className="h-4 w-4" /></BottomCta>
    </>
  );
}

function WeekList({ days }: { days: { d: string; t: string; icon: Icon }[] }) {
  return (
    <div className="mt-1 divide-y" style={{ borderColor: "var(--cv-line)" }}>
      {days.map((w) => (
        <div key={w.d} className="flex items-center gap-3 py-2 text-[14px]" style={{ borderColor: "var(--cv-line)" }}>
          <span className="w-9 shrink-0 text-[12px] font-bold" style={{ color: "var(--cv-muted)" }}>{w.d}</span>
          <w.icon className="h-4 w-4 shrink-0 text-[#6440e6]" />
          <span className="flex-1 leading-5">{w.t}</span>
        </div>
      ))}
    </div>
  );
}


/** Prazo real, por aparelho: 18 minutos desde a primeira vez na tela de planos. Ao zerar, o plano Anual sai da tela. */
function useOfferTimer() {
  const [end] = useState(() => {
    try {
      const saved = Number(localStorage.getItem(OFFER_KEY));
      if (saved) return saved;
      const value = Date.now() + OFFER_MS;
      localStorage.setItem(OFFER_KEY, String(value));
      return value;
    } catch {
      return Date.now() + OFFER_MS;
    }
  });
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);
  const left = Math.max(0, end - now);
  return {
    expired: left === 0,
    label: `${String(Math.floor(left / 60000)).padStart(2, "0")}:${String(Math.floor((left % 60000) / 1000)).padStart(2, "0")}`,
  };
}

const RECEBE = [
  "Anúncios para feed e stories, com a sua logo",
  "Carrosséis prontos para cada destino",
  "Site completo com o botão para o seu WhatsApp",
  "Clientes organizados em um só lugar",
  "Vídeos Reels prontos para postar",
  "Calendário dizendo o que postar em cada dia",
  "Uso ilimitado",
];

const AVALIACOES = [
  "Fiz 23 orçamentos só ontem e consegui fechar 5 pacotes.",
  "Esse mês já saíram várias vendas, até aumentei a meta do mês.",
  "Eu comprei, estou usando e é maravilhoso o conteúdo.",
];

function PayButtons({ plan, onCheckout, onPix }: { plan: Cycle; onCheckout: () => void; onPix: () => void }) {
  return (
    <div className="grid grid-cols-2 gap-2">
      <div onClickCapture={() => onPix()}>
        <PayWithPixButton plan={plan} quick offer={BLACK ? "black-friday" : null} redirectTo="/pagamento-confirmado" className="cv-btn h-12 border-0 py-0 text-[14px] text-white hover:bg-transparent">
          <QrCode className="h-4 w-4" /> Pagar com Pix
        </PayWithPixButton>
      </div>
      <button type="button" onClick={() => onCheckout()} className="inline-flex h-12 items-center justify-center gap-2 rounded-full border bg-white text-[14px] font-semibold" style={{ borderColor: "var(--cv-primary)", color: "var(--cv-primary-ink)" }}>
        <CreditCard className="h-4 w-4" /> Pagar com cartão
      </button>
    </div>
  );
}

/** Prints de clientes: passam sozinhos devagar até a pessoa tocar. */
function ProofCarousel() {
  const scroller = useRef<HTMLDivElement>(null);
  const touched = useRef(false);
  const [atEnd, setAtEnd] = useState(false);
  useEffect(() => {
    const id = window.setInterval(() => {
      const el = scroller.current;
      if (!el || touched.current) return;
      const end = el.scrollLeft + el.clientWidth >= el.scrollWidth - 24;
      el.scrollTo({ left: end ? 0 : el.scrollLeft + el.clientWidth * 0.8, behavior: "smooth" });
    }, 3500);
    return () => window.clearInterval(id);
  }, []);
  return (
    <div className="relative mt-4">
      <p className="text-center text-[14px] font-bold">Mensagens de clientes</p>
      <div
        ref={scroller}
        onPointerDown={() => { touched.current = true; }}
        onScroll={(e) => { const el = e.currentTarget; setAtEnd(el.scrollLeft + el.clientWidth >= el.scrollWidth - 24); }}
        className="no-scrollbar -mx-5 mt-2 flex snap-x snap-mandatory gap-3 overflow-x-auto px-5 pb-3"
      >
        {[depoimento1, depoimento2, depoimento3].map((src, i) => (
          <img key={src} src={src} alt={`Mensagem de cliente ${i + 1}`} loading="lazy" className="h-[260px] w-[78%] shrink-0 snap-center rounded-2xl border-4 border-white bg-black object-contain shadow-lg" />
        ))}
      </div>
      {!atEnd && (
        <span aria-hidden className="cv-swipe pointer-events-none absolute right-0 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-white shadow-lg">
          <ChevronRight className="h-5 w-5" style={{ color: "var(--cv-primary-ink)" }} />
        </span>
      )}
    </div>
  );
}

function Offer({ plan, setPlan, onCheckout, onPix }: { plan: Cycle; setPlan: (c: Cycle) => void; onCheckout: () => void; onPix: () => void }) {
  const selected = PLANS.find((p) => p.cycle === plan)!;
  const offer = useOfferTimer();
  useEffect(() => {
    if (offer.expired && plan === "annual") setPlan("semiannual");
  }, [offer.expired, plan]);
  return (
    <>
      {BLACK && <p className="cv-black-tag mx-auto mb-3">Black Friday · 50% vitalício</p>}
      <Title sub="Anúncios, stories, carrosséis, site e seus clientes organizados. Tudo com a sua marca, sem limite de quantidade.">Seu plano está pronto. <Accent>Libere o acesso.</Accent></Title>

      <div className="mt-4 space-y-3">
        {PLANS.filter((p) => !(offer.expired && p.cycle === "annual")).map((p, i) => {
          const on = p.cycle === plan;
          return (
            <div key={p.cycle} className="cv-pop rounded-[24px] border-2 transition-all" style={{ ...delay(180 + i * 80), background: on ? "var(--cv-soft-2)" : "var(--cv-card)", borderColor: on ? "var(--cv-primary)" : "var(--cv-line)" }}>
              <button type="button" onClick={() => setPlan(p.cycle)} aria-pressed={on} className="w-full p-4 text-left">
                <div className="flex items-start gap-3">
                  <span className="mt-1 grid h-5 w-5 shrink-0 place-items-center rounded-full border" style={{ background: on ? "var(--cv-primary)" : "transparent", borderColor: on ? "var(--cv-primary)" : "var(--cv-ring)" }}>
                    {on && <Check className="h-3 w-3 text-white" />}
                  </span>
                  <div className="flex-1">
                    <p className="flex flex-wrap items-center gap-2 text-[17px] font-extrabold">
                      {p.name}
                      {p.popular && <span className="rounded-full px-2 py-0.5 text-[10px] font-bold tracking-[0.6px] text-white" style={{ background: "var(--cv-primary)" }}>MAIS ESCOLHIDO</span>}
                    </p>
                    <p className="text-[13px]" style={{ color: "var(--cv-muted)" }}>{p.hint}</p>
                  </div>
                  <div className="text-right">
                    {p.was && <p className="text-[12px] line-through" style={{ color: "var(--cv-muted)" }}>{p.was}</p>}
                    <p className="text-[20px] font-extrabold" style={{ color: on ? "var(--cv-primary-ink)" : undefined }}>{p.price}</p>
                    <p className="text-[11px]" style={{ color: "var(--cv-muted)" }}>{p.per}</p>
                  </div>
                </div>
                <p className="mt-3 border-t pt-2 text-[12px] font-semibold" style={{ borderColor: "var(--cv-line)", color: p.popular ? "#15803d" : "var(--cv-muted)" }}>{p.note}</p>
              </button>
              {on && (
                <div className="px-4 pb-4"><PayButtons plan={p.cycle} onCheckout={onCheckout} onPix={onPix} /></div>
              )}
            </div>
          );
        })}
      </div>

      <div className="cv-card mt-5 p-4 text-[13px] leading-5" style={{ color: "var(--cv-muted)" }}>
        <p className="inline-flex items-center gap-1.5 font-bold text-[var(--cv-fg)]"><ShieldCheck className="h-4 w-4" /> Garantia de 7 dias</p>
        <p className="mt-1">Monte as artes de um pacote real da sua agência. Se não fizer sentido, peça o reembolso dentro do prazo da garantia.</p>
      </div>

      <div className="cv-card mt-4 p-4">
        <p className="text-[15px] font-extrabold">O que você recebe neste plano</p>
        <ul className="mt-2 space-y-1.5 text-[14px] leading-5">
          {RECEBE.map((item) => (
            <li key={item} className="flex gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0 text-[#16a34a]" /> {item}</li>
          ))}
        </ul>
      </div>

      <div className="mt-5 grid grid-cols-3 gap-2">
        {yearGifs.previews.map((src, i) => (
          <img key={src} src={src} alt={`Exemplo de vídeo pronto ${i + 1}`} loading="lazy" className="aspect-[9/16] w-full rounded-2xl object-cover shadow-md" />
        ))}
      </div>

      <div className="mt-5 space-y-2">
        {AVALIACOES.map((review) => (
          <div key={review} className="cv-card p-3.5">
            <p className="flex items-center gap-1 text-[12px] font-bold" style={{ color: "var(--cv-muted)" }}>
              <span aria-hidden style={{ color: "#f5a623" }} className="text-[15px] tracking-[1px]">★★★★★</span> 5 estrelas
            </p>
            <p className="mt-1 text-[14px] font-semibold leading-5">"{review}"</p>
          </div>
        ))}
      </div>

      <ProofCarousel />

      <div className="mt-4 rounded-2xl p-4 text-center" style={{ background: "var(--cv-soft)" }}>
        <p className="text-[14px] font-bold leading-5" style={{ color: "var(--cv-primary-ink)" }}>Oferta de tudo ilimitado. Pode mudar a qualquer momento.</p>
        {offer.expired ? (
          <p className="mt-1 text-[14px] font-semibold">O tempo da oferta do plano Anual acabou.</p>
        ) : (
          <>
            <p className="mt-2 text-[13px] font-semibold" style={{ color: "var(--cv-muted)" }}>Tempo da oferta do plano Anual</p>
            <p className="text-[30px] font-extrabold tabular-nums leading-tight">{offer.label}</p>
          </>
        )}
      </div>

      <div className="mt-5 border-t pt-4" style={{ background: "var(--cv-bg)", borderColor: "var(--cv-line)" }}>
        <p className="mb-2 text-center text-[13px] font-semibold">Plano {selected.name}: {selected.price}{selected.per}</p>
        <PayButtons plan={plan} onCheckout={onCheckout} onPix={onPix} />
      </div>
    </>
  );
}
