import { useEffect, useMemo, useRef, useState, type ComponentType, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import {
  ArrowRight, Check, ChevronLeft, Star, Wallet, Sprout, Briefcase, TrendingUp, Palette, UserRound,
  Images, EyeOff, Rocket, Users, Clock, MessageCircleOff, Sparkles, Waves, Mountain, Plane, Ship, Bus, Globe2,
  PenLine, Frown, Flame, CalendarDays, Leaf, Eye, Gift, ShieldCheck, Lock, CircleCheck, MapPin, Instagram,
  LayoutTemplate, MessageCircle, Download,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useEntitlements } from "@/contexts/EntitlementsContext";
import { trackMetaEvent } from "@/lib/meta-pixel-sales";
import { ELITE_OFFER, withCheckoutIdentity } from "@/lib/eliteOffer";
import { BrandMark, delay } from "@/components/cv-cream/shared";
import { ONBOARDING_DESTINO_KEY } from "@/pages/InicioCreme";

type Icon = ComponentType<{ className?: string }>;
type Option = { id: string; label: string; hint: string; icon: Icon };
type QuestionStep = { kind: "question"; key: AnswerKey; title: string; sub: string; multi?: boolean; options: Option[] };
type ScreenStep = { kind: "intro" | "how-buy" | "speed" | "start-small" | "one-destino" | "diagnosis" | "sample" | "building" | "result" | "loop" | "offer" };
type Step = QuestionStep | ScreenStep;
type AnswerKey = "objetivo" | "ferramenta" | "desafio" | "momento" | "destinos" | "travas" | "prazo";
type Answers = Partial<Record<AnswerKey, string[]>>;
type Cycle = "monthly" | "semiannual" | "annual";

const STORAGE_KEY = "cv-onboarding-v1";

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
  { kind: "how-buy" },
  {
    kind: "question", key: "ferramenta", title: "Como você cria seus posts hoje?", sub: "Isso decide quanto trabalho a gente tira das suas mãos",
    options: [
      { id: "canva", label: "Canva comum", hint: "Grátis, mas leva horas", icon: Palette },
      { id: "designer", label: "Designer ou freelancer", hint: "Caro e demora dias", icon: UserRound },
      { id: "operadora", label: "Arte pronta da operadora", hint: "Igual à de todo mundo", icon: Images },
      { id: "nada", label: "Quase não posto", hint: "Não sei por onde começar", icon: EyeOff },
    ],
  },
  { kind: "speed" },
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
    kind: "question", key: "momento", title: "Em que momento a sua agência está?", sub: "Não existe resposta errada",
    options: [
      { id: "comecando", label: "Começando agora", hint: "Ainda não vendi", icon: Sprout },
      { id: "pouco", label: "Já vendi, mas pouco", hint: "Vendas de vez em quando", icon: Rocket },
      { id: "todo-mes", label: "Vendo todo mês", hint: "Quero escalar", icon: TrendingUp },
      { id: "equipe", label: "Tenho equipe", hint: "Agência estruturada", icon: Users },
    ],
  },
  { kind: "start-small" },
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
  { kind: "one-destino" },
  {
    kind: "question", key: "travas", multi: true, title: "Algum desses parece com você?", sub: "Marque todos que se aplicam",
    options: [
      { id: "design", label: "Não sei nada de design", hint: "Nunca abri um editor", icon: Palette },
      { id: "tempo", label: "Não tenho tempo", hint: "Atendo, vendo e ainda posto?", icon: Clock },
      { id: "legenda", label: "Não sei escrever legenda", hint: "Não sei o que falar", icon: PenLine },
      { id: "vergonha", label: "Tenho vergonha do meu Instagram", hint: "Parece abandonado", icon: EyeOff },
    ],
  },
  { kind: "diagnosis" },
  {
    kind: "question", key: "prazo", title: "Pra quando você quer isso funcionando?", sub: "Última pergunta",
    options: [
      { id: "semana", label: "Esta semana", hint: "Preciso vender agora", icon: Flame },
      { id: "mes", label: "Este mês", hint: "Construindo com calma", icon: CalendarDays },
      { id: "meses", label: "Nos próximos meses", hint: "Sem pressa", icon: Leaf },
      { id: "olhando", label: "Só olhando", hint: "Vendo o que é possível", icon: Eye },
    ],
  },
  { kind: "sample" },
  { kind: "building" },
  { kind: "result" },
  { kind: "loop" },
  { kind: "offer" },
];

const TOTAL = STEPS.length;

const FIXES: Record<string, { title: string; fix: string; icon: Icon }> = {
  design: { title: "Você não sabe design", fix: "Os modelos já vêm prontos. Você só troca o destino.", icon: Palette },
  tempo: { title: "Você não tem tempo", fix: "Cada arte sai em cerca de 2 minutos.", icon: Clock },
  legenda: { title: "Você não sabe o que escrever", fix: "A IA escreve a legenda de venda pra você.", icon: PenLine },
  vergonha: { title: "Seu Instagram parece parado", fix: "Uma semana de posts profissionais já muda a cara do perfil.", icon: EyeOff },
};

const DESTINO_LABEL: Record<string, string> = {
  praia: "Porto de Galinhas", serra: "Gramado", internacional: "Cancún", cruzeiro: "Cruzeiro pelo litoral", excursao: "Excursão de fim de semana",
};

const PLANS: { cycle: Cycle; name: string; hint: string; price: string; per: string; note: string; value: number; popular?: boolean }[] = [
  { cycle: "monthly", name: "Mensal", hint: "Pra testar com calma", price: ELITE_OFFER.monthlyPrice, per: "/mês", note: "Cancele quando quiser", value: 97 },
  { cycle: "semiannual", name: "Semestral", hint: "6 meses de acesso", price: ELITE_OFFER.semiannualPrice, per: "/6 meses", note: "R$ 57,83 por mês", value: 347 },
  { cycle: "annual", name: "Anual", hint: "Postando o ano inteiro", price: ELITE_OFFER.annualPrice, per: "/ano", note: `${ELITE_OFFER.annualMonthlyEquivalent} por mês · economia de ${ELITE_OFFER.annualSavings}`, value: 482, popular: true },
];

const CHECKOUT_URL: Record<Cycle, string> = {
  monthly: ELITE_OFFER.monthlyCheckoutUrl,
  semiannual: ELITE_OFFER.semiannualCheckoutUrl,
  annual: ELITE_OFFER.annualCheckoutUrl,
};

function loadState(): { step: number; answers: Answers } {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      const step = Math.min(Math.max(Number(parsed.step) || 0, 0), TOTAL - 1);
      // Telas automáticas não devem ser retomadas no meio.
      const safeStep = STEPS[step]?.kind === "building" ? step + 1 : step;
      return { step: safeStep, answers: parsed.answers || {} };
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
    if (subscription.subscribed) navigate("/fabrica", { replace: true });
  }, [subscription.subscribed, navigate]);

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ step, answers })); } catch { /* ignore */ }
  }, [step, answers]);

  useEffect(() => {
    if (!startedRef.current) {
      startedRef.current = true;
      trackMetaEvent("ViewContent", { content_name: "Canva Viagem - Onboarding Quiz", content_category: "onboarding", content_type: "product" });
    }
    track("onboarding_step", { step: step + 1, kind: STEPS[step].kind, key: (STEPS[step] as QuestionStep).key ?? null });
    window.scrollTo({ top: 0 });
  }, [step, track]);

  const next = () => setStep((s) => Math.min(s + 1, TOTAL - 1));
  const back = () => setStep((s) => Math.max(s - 1, 0));

  const current = STEPS[step];

  const choose = (q: QuestionStep, id: string) => {
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

  const checkout = () => {
    const selected = PLANS.find((p) => p.cycle === plan)!;
    track("plan_selected", { billing_cycle: plan, feature: "onboarding", answers });
    trackMetaEvent("InitiateCheckout", { value: selected.value, currency: "BRL", content_name: `Canva Viagem ${selected.name}`, content_category: "onboarding" });
    window.location.href = withCheckoutIdentity(CHECKOUT_URL[plan], user);
  };

  return (
    <div className="cv-cream min-h-[100dvh]">
      <Helmet><title>Seu plano — Canva Viagem</title></Helmet>
      <div className="mx-auto flex min-h-[100dvh] max-w-[440px] flex-col px-5">
        <header className="sticky top-0 z-20 pb-3 pt-3" style={{ background: "var(--cv-bg)" }}>
          <div className="flex items-center justify-between">
            <button onClick={back} disabled={step === 0} aria-label="Voltar" className="grid h-9 w-9 place-items-center rounded-full transition-colors hover:bg-[#f3ead2] disabled:opacity-0">
              <ChevronLeft className="h-5 w-5" />
            </button>
            <BrandMark size={22} />
            <span className="w-9 text-right text-[12px] font-semibold" style={{ color: "var(--cv-muted)" }}>{step + 1}/{TOTAL}</span>
          </div>
          <Progress step={step} />
        </header>

        <main key={step} className="flex flex-1 flex-col pb-6 pt-6">
          {current.kind === "question" ? (
            <Question q={current} selected={answers[current.key] || []} onChoose={(id) => choose(current, id)} onContinue={next} />
          ) : (
            <Screen kind={current.kind} answers={answers} destino={destinoPrincipal} plan={plan} setPlan={setPlan} onNext={next} onCheckout={checkout} />
          )}
        </main>
      </div>
    </div>
  );
}

/** 7 segmentos, como no original: o progresso preenche segmento por segmento. */
function Progress({ step }: { step: number }) {
  const segments = 7;
  const ratio = (step + 1) / TOTAL;
  return (
    <div className="mt-2 flex gap-1.5">
      {Array.from({ length: segments }).map((_, i) => {
        const fill = Math.min(Math.max(ratio * segments - i, 0), 1);
        return (
          <span key={i} className="h-1 flex-1 overflow-hidden rounded-full bg-[#ece5d3]">
            <span className="block h-full rounded-full transition-[width] duration-500" style={{ width: `${fill * 100}%`, background: "var(--cv-primary)" }} />
          </span>
        );
      })}
    </div>
  );
}

function Title({ children, sub }: { children: ReactNode; sub?: ReactNode }) {
  return (
    <div className="cv-pop">
      <h1 className="text-balance text-[30px] font-extrabold leading-[1.05] tracking-[-0.025em]">{children}</h1>
      {sub && <p className="mt-2 text-[15px] leading-6" style={{ color: "var(--cv-muted)" }}>{sub}</p>}
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
      <Title sub={q.sub}>{q.title}</Title>
      <div className="mt-7 space-y-2.5">
        {q.options.map((o, i) => {
          const on = selected.includes(o.id);
          return (
            <button
              key={o.id}
              onClick={() => onChoose(o.id)}
              className="cv-pop flex w-full items-center gap-3.5 rounded-[22px] border p-3.5 text-left transition-all duration-200 hover:-translate-y-px"
              style={{ ...delay(80 + i * 60), background: on ? "#efe9ff" : "var(--cv-card)", borderColor: on ? "var(--cv-primary)" : "var(--cv-line)" }}
            >
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl" style={{ background: on ? "#ddd3ff" : "var(--cv-sand)" }}>
                <o.icon className="h-[18px] w-[18px]" />
              </span>
              <span className="flex-1">
                <span className="block text-[15px] font-semibold">{o.label}</span>
                <span className="block text-[13px]" style={{ color: "var(--cv-muted)" }}>{o.hint}</span>
              </span>
              <span className={`grid h-6 w-6 place-items-center border ${q.multi ? "rounded-md" : "rounded-full"}`} style={{ borderColor: on ? "var(--cv-primary)" : "#e3dccb", background: on ? "var(--cv-primary)" : "transparent" }}>
                {on && <Check className="h-3.5 w-3.5 text-white" />}
              </span>
            </button>
          );
        })}
      </div>
      {q.multi && (
        <>
          {selected.length > 0 && <p className="mt-3 text-center text-[13px]" style={{ color: "var(--cv-muted)" }}>{selected.length} {selected.length === 1 ? "selecionado" : "selecionados"}</p>}
          <BottomCta onClick={onContinue} disabled={selected.length === 0}>{selected.length === 0 ? "Escolha pelo menos um" : "Continuar"}</BottomCta>
        </>
      )}
    </>
  );
}

type ScreenProps = {
  kind: ScreenStep["kind"]; answers: Answers; destino: string; plan: Cycle;
  setPlan: (c: Cycle) => void; onNext: () => void; onCheckout: () => void;
};

const ART_CARDS = ["/travel-carousel-assets/cancun-card-01.webp", "/travel-carousel-assets/cancun-editorial-02.webp", "/travel-carousel-assets/cancun-glass-03.webp"];

function Screen(props: ScreenProps) {
  switch (props.kind) {
    case "intro": return <Intro onNext={props.onNext} />;
    case "how-buy": return <HowBuy onNext={props.onNext} />;
    case "speed": return <Speed onNext={props.onNext} />;
    case "start-small": return <StartSmall onNext={props.onNext} />;
    case "one-destino": return <OneDestino destino={props.destino} onNext={props.onNext} />;
    case "diagnosis": return <Diagnosis answers={props.answers} onNext={props.onNext} />;
    case "sample": return <Sample destino={props.destino} onNext={props.onNext} />;
    case "building": return <Building onDone={props.onNext} />;
    case "result": return <Result answers={props.answers} destino={props.destino} onNext={props.onNext} />;
    case "loop": return <Loop onNext={props.onNext} />;
    case "offer": return <Offer plan={props.plan} setPlan={props.setPlan} onCheckout={props.onCheckout} />;
  }
}

function Intro({ onNext }: { onNext: () => void }) {
  return (
    <>
      <div className="flex flex-col items-center text-center">
        <span className="cv-pop inline-flex items-center gap-2 rounded-full border bg-white px-3 py-1.5 text-[12px] font-semibold" style={{ borderColor: "var(--cv-line)" }}>
          <span className="flex text-[#ff3d8b]">{[0, 1, 2, 3, 4].map((i) => <Star key={i} className="h-3 w-3 fill-current" />)}</span>
          Quiz de 2 minutos
        </span>
        <h1 className="cv-pop mt-5 text-balance text-[32px] font-extrabold leading-[1.05] tracking-[-0.025em]" style={delay(80)}>
          Agências estão vendendo pacotes com posts que <Accent>nem precisaram criar.</Accent>
        </h1>
        <p className="cv-pop mt-3 max-w-[300px] text-[15px] leading-6" style={{ ...delay(160), color: "var(--cv-muted)" }}>
          Responda 7 perguntas e a gente monta a sua primeira semana de posts.
        </p>
      </div>
      <div className="relative mx-auto mt-10 flex h-64 w-full max-w-[340px] items-center justify-center">
        {ART_CARDS.map((src, i) => (
          <div key={src} className="cv-float absolute w-[118px]" style={{ ...delay(i * 300), ["--cv-rot" as string]: ["-8deg", "0deg", "7deg"][i], left: `${[2, 34, 66][i]}%`, top: i === 1 ? 4 : 22, zIndex: i === 1 ? 2 : 1 }}>
            <img src={src} alt="" className="aspect-[4/5] w-full rounded-2xl border-4 border-white object-cover shadow-xl" />
          </div>
        ))}
      </div>
      <div className="mt-6 flex flex-col items-center gap-2">
        <span className="rounded-full border bg-white px-3 py-1 text-[12px]" style={{ borderColor: "var(--cv-line)" }}>Um destino · dez posts</span>
        <div className="flex items-center gap-3 text-[12px] font-semibold" style={{ color: "var(--cv-muted)" }}>
          <span className="tracking-[1.2px]">PARA</span>
          <span className="inline-flex items-center gap-1"><Instagram className="h-3.5 w-3.5" /> Feed</span>
          <span className="inline-flex items-center gap-1"><LayoutTemplate className="h-3.5 w-3.5" /> Stories</span>
          <span className="inline-flex items-center gap-1"><MessageCircle className="h-3.5 w-3.5" /> WhatsApp</span>
        </div>
      </div>
      <BottomCta onClick={onNext}>Montar meu plano <ArrowRight className="h-4 w-4" /></BottomCta>
    </>
  );
}

function HowBuy({ onNext }: { onNext: () => void }) {
  const steps = [
    { icon: Instagram, title: "Vê o seu post", text: "O cliente para no feed por causa da arte." },
    { icon: MessageCircle, title: "Chama no WhatsApp", text: "A legenda certa faz ele pedir orçamento." },
    { icon: Globe2, title: "Recebe a página do pacote", text: "Roteiro, fotos e valor, tudo organizado." },
    { icon: CircleCheck, title: "Fecha com você", text: "Entendeu o valor antes de pedir desconto." },
  ];
  return (
    <>
      <Title sub="E quase sempre começa no Instagram.">É assim que o cliente compra viagem hoje</Title>
      <div className="mt-7 space-y-3">
        {steps.map((s, i) => (
          <div key={s.title} className="cv-pop cv-card flex items-center gap-4 p-4" style={delay(120 + i * 110)}>
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full" style={{ background: "var(--cv-accent-soft)", color: "var(--cv-accent)" }}><s.icon className="h-5 w-5" /></span>
            <div>
              <p className="text-[15px] font-bold">{i + 1}. {s.title}</p>
              <p className="text-[13px]" style={{ color: "var(--cv-muted)" }}>{s.text}</p>
            </div>
          </div>
        ))}
      </div>
      <p className="cv-pop mt-6 text-[15px] leading-6" style={{ ...delay(600), color: "var(--cv-muted)" }}>
        Se o primeiro passo falha, <strong className="text-[var(--cv-fg)]">nenhum dos outros acontece.</strong> É aí que a gente entra.
      </p>
      <BottomCta onClick={onNext}>Continuar</BottomCta>
    </>
  );
}

function Speed({ onNext }: { onNext: () => void }) {
  const rows = [
    { label: "Canva comum", time: "2–3 h", width: 78, color: "#d8cfb8" },
    { label: "Designer", time: "1–3 dias", width: 100, color: "#d8cfb8" },
    { label: "Canva Viagem", time: "2 min", width: 9, color: "var(--cv-primary)" },
  ];
  return (
    <>
      <Title sub="Achar a ideia, montar a arte, escrever a legenda, aplicar a sua marca: esse é o trabalho todo, e é exatamente o que a gente faz.">Você não vai precisar de <Accent>nada disso</Accent></Title>
      <div className="cv-pop cv-card mt-7 p-5" style={delay(150)}>
        <p className="text-[11px] font-bold tracking-[1.2px]" style={{ color: "var(--cv-muted)" }}>TEMPO POR ARTE</p>
        <div className="mt-4 space-y-4">
          {rows.map((r, i) => (
            <div key={r.label}>
              <div className="mb-1.5 flex justify-between text-[13px]">
                <span className="font-semibold">{r.label}</span>
                <span className="font-bold" style={{ color: i === 2 ? "var(--cv-primary-ink)" : "var(--cv-muted)" }}>{r.time}</span>
              </div>
              <div className="h-2.5 overflow-hidden rounded-full bg-[#f3ecda]">
                <div className="cv-fill h-full rounded-full" style={{ ...delay(300 + i * 150), width: `${r.width}%`, background: r.color }} />
              </div>
            </div>
          ))}
        </div>
      </div>
      <p className="cv-pop mt-6 text-[15px] leading-6" style={{ ...delay(500), color: "var(--cv-muted)" }}>
        Digite o destino e receba as artes prontas, com a sua logo. <strong className="text-[var(--cv-fg)]">Do zero ao post em uns 2 minutos.</strong>
      </p>
      <BottomCta onClick={onNext}>Continuar</BottomCta>
    </>
  );
}

function StartSmall({ onNext }: { onNext: () => void }) {
  const days = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];
  return (
    <>
      <Title sub="Você não precisa de milhares de seguidores. Precisa aparecer todo dia com posts que fazem o cliente chamar.">Começar pequeno <Accent>não é problema</Accent></Title>
      <div className="cv-pop cv-card mt-7 p-5" style={delay(150)}>
        <p className="text-[11px] font-bold tracking-[1.2px]" style={{ color: "var(--cv-muted)" }}>CONSTÂNCIA DE UMA SEMANA</p>
        <div className="mt-4 grid grid-cols-7 gap-1.5">
          {days.map((d, i) => (
            <div key={d} className="cv-pop flex flex-col items-center gap-1.5" style={delay(250 + i * 80)}>
              <span className="text-[11px]" style={{ color: "var(--cv-muted)" }}>{d}</span>
              <span className="grid aspect-square w-full place-items-center rounded-lg" style={{ background: i === 3 || i === 5 ? "#ff3d8b" : "#efe9ff" }}>
                <Check className={`h-3.5 w-3.5 ${i === 3 || i === 5 ? "text-white" : "text-[#6440e6]"}`} />
              </span>
            </div>
          ))}
        </div>
        <p className="mt-4 text-[13px]" style={{ color: "var(--cv-muted)" }}>7 posts na semana. Não precisa acertar em todos, <strong className="text-[var(--cv-fg)]">precisa estar lá quando o cliente procurar.</strong></p>
      </div>
      <BottomCta onClick={onNext}>Continuar</BottomCta>
    </>
  );
}

function OneDestino({ destino, onNext }: { destino: string; onNext: () => void }) {
  const formats = [
    { icon: Instagram, label: "Posts de feed", n: 3 },
    { icon: LayoutTemplate, label: "Stories", n: 3 },
    { icon: Images, label: "Carrossel", n: 2 },
    { icon: Globe2, label: "Página do pacote", n: 1 },
    { icon: MessageCircle, label: "Texto pro WhatsApp", n: 1 },
  ];
  return (
    <>
      <Title sub="Cada pacote vira peças pra todos os lugares onde o seu cliente está.">Um destino. <Accent>Dez posts.</Accent></Title>
      <div className="cv-pop mt-7 flex items-center justify-center gap-2 rounded-full border bg-white px-4 py-3 text-[15px] font-bold" style={{ ...delay(120), borderColor: "var(--cv-line)" }}>
        <MapPin className="h-4 w-4" style={{ color: "var(--cv-accent)" }} /> {destino}
      </div>
      <div className="mt-4 space-y-2">
        {formats.map((f, i) => (
          <div key={f.label} className="cv-pop cv-card flex items-center justify-between rounded-[20px] px-4 py-3" style={delay(220 + i * 90)}>
            <span className="flex items-center gap-3 text-[14px] font-semibold"><f.icon className="h-4 w-4" style={{ color: "var(--cv-primary-ink)" }} /> {f.label}</span>
            <span className="rounded-full bg-[#efe9ff] px-2.5 py-0.5 text-[13px] font-bold text-[#6440e6]">×{f.n}</span>
          </div>
        ))}
      </div>
      <p className="cv-pop mt-5 text-[15px]" style={{ ...delay(750), color: "var(--cv-muted)" }}>Ninguém é gênio aqui. <strong className="text-[var(--cv-fg)]">É constância.</strong></p>
      <BottomCta onClick={onNext}>Continuar</BottomCta>
    </>
  );
}

function Diagnosis({ answers, onNext }: { answers: Answers; onNext: () => void }) {
  const items = (answers.travas?.length ? answers.travas : ["tempo"]).map((id) => FIXES[id]).filter(Boolean);
  return (
    <>
      <Title sub="Cada um deles tem solução.">Isso é o que está te travando</Title>
      <div className="mt-7 space-y-2.5">
        {items.map((it, i) => (
          <div key={it.title} className="cv-pop cv-card flex items-center gap-3.5 rounded-[22px] p-3.5" style={delay(120 + i * 120)}>
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl" style={{ background: "var(--cv-sand)" }}><it.icon className="h-[18px] w-[18px]" /></span>
            <span className="flex-1">
              <span className="block text-[14px] font-semibold">{it.title}</span>
              <span className="block text-[12px]" style={{ color: "var(--cv-muted)" }}>{it.fix}</span>
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-[#dcf5e8] px-2 py-1 text-[10px] font-bold tracking-[0.6px] text-[#15803d]"><Check className="h-3 w-3" /> TEM SOLUÇÃO</span>
          </div>
        ))}
      </div>
      <BottomCta onClick={onNext}>Ver como a gente resolve <ArrowRight className="h-4 w-4" /></BottomCta>
    </>
  );
}

function Sample({ destino, onNext }: { destino: string; onNext: () => void }) {
  return (
    <>
      <Title sub="Arte 1 de 10 · texto e marca já aplicados">Essa arte levou 30 segundos. <Accent>Curtiu?</Accent></Title>
      <div className="cv-pop relative mx-auto mt-6 w-full max-w-[300px]" style={delay(150)}>
        <img src="/travel-carousel-assets/cancun-card-01.webp" alt={`Arte de exemplo para ${destino}`} className="aspect-[4/5] w-full rounded-[28px] object-cover shadow-[0_24px_50px_-24px_rgba(32,28,19,.6)]" />
        <span className="absolute right-3 top-3 rounded-full bg-white/95 px-3 py-1 text-[12px] font-bold">NOTA <span className="text-[#6440e6]">9.7</span></span>
        <span className="absolute bottom-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-black/65 px-3 py-1 text-[12px] font-semibold text-white"><MapPin className="h-3.5 w-3.5" /> {destino}</span>
      </div>
      <div className="mt-auto grid grid-cols-2 gap-3 pt-6">
        <button onClick={onNext} className="h-14 rounded-full border bg-white text-[15px] font-semibold" style={{ borderColor: "var(--cv-line)" }}>Não é meu estilo</button>
        <button onClick={onNext} className="cv-btn h-14 text-[15px]">Postaria isso!</button>
      </div>
      <p className="mt-3 text-center text-[12px]" style={{ color: "var(--cv-muted)" }}>De qualquer jeito, a gente ajusta ao seu gosto</p>
    </>
  );
}

function Building({ onDone }: { onDone: () => void }) {
  const [pct, setPct] = useState(0);
  const tasks = [
    { label: "Lendo suas respostas", done: "7 de 7", at: 25 },
    { label: "Escolhendo modelos pros seus destinos", done: "pronto", at: 55 },
    { label: "Escrevendo as legendas", done: "pronto", at: 80 },
    { label: "Montando sua primeira semana", done: "7 posts", at: 100 },
  ];
  useEffect(() => {
    const id = window.setInterval(() => setPct((p) => Math.min(p + 2, 100)), 70);
    return () => window.clearInterval(id);
  }, []);
  useEffect(() => {
    if (pct < 100) return;
    const t = window.setTimeout(onDone, 700);
    return () => window.clearTimeout(t);
  }, [pct, onDone]);
  const r = 58, c = 2 * Math.PI * r;
  return (
    <div className="flex flex-1 flex-col items-center pt-8">
      <h1 className="text-center text-[26px] font-extrabold tracking-[-0.02em]">Montando sua primeira semana</h1>
      <div className="relative mt-6 h-36 w-36">
        <svg viewBox="0 0 136 136" className="h-full w-full -rotate-90">
          <circle cx="68" cy="68" r={r} fill="none" stroke="#e8e2d2" strokeWidth="6" />
          <circle cx="68" cy="68" r={r} fill="none" stroke="var(--cv-primary)" strokeWidth="6" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - pct / 100)} />
        </svg>
        <span className="absolute inset-0 grid place-items-center text-[28px] font-extrabold">{pct}%</span>
      </div>
      <div className="mt-8 w-full space-y-3">
        {tasks.map((t, i) => {
          const done = pct >= t.at;
          const active = !done && (i === 0 || pct >= tasks[i - 1].at);
          return (
            <div key={t.label} className="flex items-center gap-3 text-[15px]" style={{ opacity: done || active ? 1 : 0.35 }}>
              <span className="grid h-6 w-6 place-items-center rounded-full border" style={{ background: done ? "var(--cv-primary)" : "transparent", borderColor: done || active ? "var(--cv-primary)" : "#e3dccb" }}>
                {done ? <Check className="h-3.5 w-3.5 text-white" /> : active && <span className="h-1.5 w-1.5 rounded-full" style={{ background: "var(--cv-primary)" }} />}
              </span>
              <span className="flex-1">{t.label}</span>
              {done && <span className="text-[13px] font-bold text-[#6440e6]">{t.done}</span>}
            </div>
          );
        })}
      </div>
      <figure className="cv-card mt-8 w-full p-4">
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-full bg-[#3cb07c] font-bold text-white">M</span>
          <div>
            <p className="flex items-center gap-2 text-[14px] font-bold">Maria S. <span className="flex text-[#ff3d8b]">{[0, 1, 2, 3, 4].map((i) => <Star key={i} className="h-3 w-3 fill-current" />)}</span></p>
            <p className="text-[12px]" style={{ color: "var(--cv-muted)" }}>agente autônoma, São Paulo</p>
          </div>
        </div>
        <blockquote className="mt-3 pl-[52px] text-[14px] leading-5" style={{ color: "var(--cv-muted)" }}>“Em menos de 24 horas tive minha primeira venda para Disney usando os anúncios que a IA gerou.”</blockquote>
      </figure>
    </div>
  );
}

function scoreFrom(answers: Answers) {
  const travas = answers.travas?.length ?? 1;
  const momento = answers.momento?.[0];
  const base = momento === "equipe" ? 58 : momento === "todo-mes" ? 52 : momento === "pouco" ? 44 : 36;
  const now = Math.max(base - travas * 4, 18);
  return { now, potential: Math.min(now + 52, 96) };
}

function Result({ answers, destino, onNext }: { answers: Answers; destino: string; onNext: () => void }) {
  const { now, potential } = scoreFrom(answers);
  const travas = new Set(answers.travas || []);
  const desafio = answers.desafio?.[0];
  const metrics = [
    { label: "Constância de posts", now: travas.has("tempo") || desafio === "tempo" ? 20 : 40, with: 95 },
    { label: "Visual profissional", now: travas.has("design") || travas.has("vergonha") || desafio === "amador" ? 25 : 50, with: 92 },
    { label: "Legenda que vende", now: travas.has("legenda") || desafio === "ninguem" ? 20 : 45, with: 90 },
    { label: "Caminho até o WhatsApp", now: desafio === "ninguem" ? 25 : 40, with: 88 },
  ];
  const week = [
    { d: "Seg", t: "Post de feed", icon: Instagram }, { d: "Ter", t: "Story com enquete", icon: LayoutTemplate },
    { d: "Qua", t: "Carrossel do roteiro", icon: Images }, { d: "Qui", t: "Post de oferta", icon: Instagram },
    { d: "Sex", t: "Story com valor", icon: LayoutTemplate }, { d: "Sáb", t: "Página do pacote", icon: Globe2 },
    { d: "Dom", t: "Disparo no WhatsApp", icon: MessageCircle },
  ];
  return (
    <>
      <Title sub="Com base nas suas 7 respostas">Seu diagnóstico <Accent>está pronto</Accent></Title>
      <div className="cv-pop cv-card mt-6 p-5" style={delay(120)}>
        <p className="text-[11px] font-bold tracking-[1.2px]" style={{ color: "var(--cv-muted)" }}>POTENCIAL DE VENDAS NO INSTAGRAM</p>
        <div className="mt-3 flex items-end gap-4">
          <div>
            <p className="text-[12px]" style={{ color: "var(--cv-muted)" }}>Hoje</p>
            <p className="text-[34px] font-extrabold leading-none text-[#b9ae95]">{now}</p>
          </div>
          <ArrowRight className="mb-2 h-5 w-5 text-[#cfc4a6]" />
          <div>
            <p className="text-[12px]" style={{ color: "var(--cv-muted)" }}>Com o Canva Viagem</p>
            <p className="text-[34px] font-extrabold leading-none text-[#6440e6]">{potential}</p>
          </div>
        </div>
        <div className="mt-5 space-y-3.5">
          {metrics.map((m, i) => (
            <div key={m.label}>
              <p className="mb-1 text-[13px] font-semibold">{m.label}</p>
              <div className="relative h-2.5 overflow-hidden rounded-full bg-[#f3ecda]">
                <div className="cv-fill absolute inset-y-0 left-0 rounded-full bg-[#efe9ff]" style={{ ...delay(300 + i * 120), width: `${m.with}%` }} />
                <div className="cv-fill absolute inset-y-0 left-0 rounded-full bg-[#ff3d8b]" style={{ ...delay(200 + i * 120), width: `${m.now}%` }} />
              </div>
            </div>
          ))}
          <div className="flex gap-4 pt-1 text-[11px]" style={{ color: "var(--cv-muted)" }}>
            <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-[#ff3d8b]" /> hoje</span>
            <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-[#cbbcff]" /> com o Canva Viagem</span>
          </div>
        </div>
      </div>

      <div className="cv-pop cv-card mt-4 p-5" style={delay(300)}>
        <div className="flex items-center justify-between">
          <p className="text-[11px] font-bold tracking-[1.2px]" style={{ color: "var(--cv-muted)" }}>SUA PRIMEIRA SEMANA</p>
          <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[12px] font-semibold" style={{ background: "var(--cv-accent-soft)", color: "var(--cv-accent)" }}><MapPin className="h-3 w-3" /> {destino}</span>
        </div>
        <div className="mt-3 divide-y" style={{ borderColor: "var(--cv-line)" }}>
          {week.map((w) => (
            <div key={w.d} className="flex items-center gap-3 py-2 text-[14px]" style={{ borderColor: "var(--cv-line)" }}>
              <span className="w-9 text-[12px] font-bold" style={{ color: "var(--cv-muted)" }}>{w.d}</span>
              <w.icon className="h-4 w-4 text-[#6440e6]" />
              <span className="flex-1">{w.t}</span>
              <Lock className="h-3.5 w-3.5 text-[#b9ae95]" />
            </div>
          ))}
        </div>
      </div>
      <BottomCta onClick={onNext}>Ver meu plano <ArrowRight className="h-4 w-4" /></BottomCta>
    </>
  );
}

function Loop({ onNext }: { onNext: () => void }) {
  const steps = [
    { icon: MapPin, title: "Escolha o destino", text: "Destino, dias e valor do pacote." },
    { icon: Sparkles, title: "Receba as artes", text: "Feed, stories, carrossel e página, com a sua logo." },
    { icon: Download, title: "Publique", text: "Baixe e poste no Instagram em minutos." },
    { icon: MessageCircle, title: "Venda no WhatsApp", text: "Mande a página do pacote e feche a viagem." },
  ];
  return (
    <>
      <Title sub="Esse é o ciclo todo. Você repete quantas vezes quiser.">Quatro passos, <Accent>sempre os mesmos</Accent></Title>
      <div className="relative mt-7 space-y-3">
        <span className="absolute bottom-6 left-[34px] top-6 w-px border-l border-dashed border-[#d9cfb3]" />
        {steps.map((s, i) => (
          <div key={s.title} className="cv-pop cv-card relative flex items-center gap-4 p-4" style={delay(120 + i * 120)}>
            <span className="relative z-10 grid h-9 w-9 shrink-0 place-items-center rounded-full text-[14px] font-extrabold text-white" style={{ background: "var(--cv-primary)" }}>{i + 1}</span>
            <div>
              <p className="flex items-center gap-2 text-[15px] font-bold"><s.icon className="h-4 w-4" style={{ color: "var(--cv-accent)" }} /> {s.title}</p>
              <p className="text-[13px]" style={{ color: "var(--cv-muted)" }}>{s.text}</p>
            </div>
          </div>
        ))}
      </div>
      <BottomCta onClick={onNext}>Ver meu plano <ArrowRight className="h-4 w-4" /></BottomCta>
    </>
  );
}

function Offer({ plan, setPlan, onCheckout }: { plan: Cycle; setPlan: (c: Cycle) => void; onCheckout: () => void }) {
  const selected = PLANS.find((p) => p.cycle === plan)!;
  return (
    <>
      <Title sub="Artes, stories, carrosséis, páginas de pacote e CRM. Tudo com a sua marca.">Sua semana está pronta. <Accent>Libere o acesso.</Accent></Title>

      <div className="cv-pop mt-5 flex items-center gap-3 rounded-[22px] border p-4" style={{ ...delay(100), background: "#efe9ff", borderColor: "#cbbcff" }}>
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-white"><Gift className="h-5 w-5 text-[#6440e6]" /></span>
        <div>
          <p className="text-[14px] font-bold">Prêmio desbloqueado</p>
          <p className="text-[12px] leading-4" style={{ color: "var(--cv-muted)" }}>Sua primeira semana de posts já montada + 7 dias de garantia pra testar com um pacote real.</p>
        </div>
      </div>

      <div className="mt-5 space-y-3">
        {PLANS.map((p, i) => {
          const on = p.cycle === plan;
          return (
            <button key={p.cycle} onClick={() => setPlan(p.cycle)} className="cv-pop w-full rounded-[24px] border-2 p-4 text-left transition-all" style={{ ...delay(180 + i * 80), background: on ? "#f4f0ff" : "var(--cv-card)", borderColor: on ? "var(--cv-primary)" : "var(--cv-line)" }}>
              <div className="flex items-start gap-3">
                <span className="mt-1 grid h-5 w-5 shrink-0 place-items-center rounded-full border" style={{ background: on ? "var(--cv-primary)" : "transparent", borderColor: on ? "var(--cv-primary)" : "#e3dccb" }}>
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
                  <p className="text-[20px] font-extrabold" style={{ color: on ? "var(--cv-primary-ink)" : undefined }}>{p.price}</p>
                  <p className="text-[11px]" style={{ color: "var(--cv-muted)" }}>{p.per}</p>
                </div>
              </div>
              <p className="mt-3 border-t pt-2 text-[12px] font-semibold" style={{ borderColor: "var(--cv-line)", color: p.popular ? "#15803d" : "var(--cv-muted)" }}>{p.note}</p>
            </button>
          );
        })}
      </div>

      <div className="mt-4 flex flex-wrap justify-center gap-x-4 gap-y-1 text-[12px]" style={{ color: "var(--cv-muted)" }}>
        {["Artes ilimitadas", "Sua logo em tudo", "Página de vendas", "CRM de leads"].map((f) => (
          <span key={f} className="inline-flex items-center gap-1"><Check className="h-3.5 w-3.5 text-[#16a34a]" /> {f}</span>
        ))}
      </div>

      <BottomCta onClick={onCheckout}>Começar com o {selected.name}</BottomCta>
      <p className="mt-2 text-center text-[12px]" style={{ color: "var(--cv-muted)" }}>{selected.price}{selected.per} · {selected.note.toLowerCase()}</p>
      <div className="mt-3 flex justify-center gap-4 text-[12px]" style={{ color: "var(--cv-muted)" }}>
        <span className="inline-flex items-center gap-1"><Lock className="h-3.5 w-3.5" /> Pagamento seguro Stripe</span>
        <span className="inline-flex items-center gap-1"><ShieldCheck className="h-3.5 w-3.5" /> 7 dias de garantia</span>
      </div>
      <div className="cv-card mt-5 p-4 text-[13px] leading-5" style={{ color: "var(--cv-muted)" }}>
        <p className="font-bold text-[var(--cv-fg)]">Garantia de 7 dias</p>
        Monte as artes de um pacote real da sua agência. Se não fizer sentido, peça o reembolso dentro do prazo da garantia.
      </div>
    </>
  );
}
