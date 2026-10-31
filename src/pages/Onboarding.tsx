import { useEffect, useMemo, useRef, useState, type ComponentType, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import {
  ArrowRight, Check, ChevronLeft, Star, Wallet, Sprout, Briefcase, TrendingUp, Palette, UserRound,
  Images, EyeOff, Rocket, Users, Clock, MessageCircleOff, Sparkles, Waves, Mountain, Plane, Ship, Bus, Globe2,
  PenLine, Frown, Flame, CalendarDays, Leaf, Eye, Gift, ShieldCheck, Lock, CircleCheck, MapPin, Instagram,
  LayoutTemplate, MessageCircle, Download, Megaphone, Mic, Video,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useEntitlements } from "@/contexts/EntitlementsContext";
import { trackMetaEvent } from "@/lib/meta-pixel-sales";
import { ELITE_OFFER } from "@/lib/eliteOffer";
import { checkoutPath } from "@/components/checkout/checkout-plans";
import { PayWithPixButton } from "@/components/pix/PixCheckout";
import { BrandMark, delay } from "@/components/cv-cream/shared";
import { captureLead, readLeadEmail } from "@/lib/lead-capture";
import { ShowcaseRow, SHOWCASE_ADS, SHOWCASE_CAROUSELS } from "@/components/cv-cream/Showcase";
import { ONBOARDING_DESTINO_KEY } from "@/pages/InicioCreme";
import { isLocalPreviewEnabled } from "@/lib/localPreview";

type Icon = ComponentType<{ className?: string }>;
type Option = { id: string; label: string; hint: string; icon: Icon };
type QuestionStep = { kind: "question"; key: AnswerKey; title: string; sub: string; multi?: boolean; options: Option[] };
type ScreenStep = { kind: "intro" | "how-buy" | "speed" | "start-small" | "one-destino" | "diagnosis" | "sample" | "building" | "result" | "loop" | "offer" };
type Step = QuestionStep | ScreenStep;
type AnswerKey = "objetivo" | "ferramenta" | "desafio" | "momento" | "orcamentos" | "destinos" | "travas" | "prazo";
type Answers = Partial<Record<AnswerKey, string[]>>;
type Cycle = "monthly" | "semiannual" | "annual";

// v2: entrou a pergunta de orçamentos; a v1 guardava o passo pela ordem antiga.
const STORAGE_KEY = "cv-onboarding-v2";

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
  {
    kind: "question", key: "orcamentos", title: "Quantos pedidos de orçamento chegam no seu WhatsApp por semana?", sub: "Conta aproximada já ajuda",
    options: [
      { id: "zero", label: "Nenhum ainda", hint: "O WhatsApp quase não toca", icon: MessageCircleOff },
      { id: "poucos", label: "De 1 a 5", hint: "Chegam alguns, sem constância", icon: MessageCircle },
      { id: "medio", label: "De 6 a 20", hint: "Tenho movimento, quero mais", icon: TrendingUp },
      { id: "muitos", label: "Mais de 20", hint: "Preciso organizar e fechar mais", icon: Users },
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
      { id: "design", label: "Não sei criar postagens", hint: "Não sei editar fotos nem vídeos", icon: Palette },
      { id: "tempo", label: "Não tenho tempo", hint: "Já faço muita coisa e não sobra tempo pra mais nada", icon: Clock },
      { id: "vergonha", label: "Preciso melhorar meu Instagram", hint: "Quero que pareça de uma grande agência de viagens", icon: EyeOff },
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
  design: { title: "Você não sabe criar postagens", fix: "Anúncio, carrossel e vídeo já vêm prontos. Você só fala o pacote.", icon: Palette },
  tempo: { title: "Você não tem tempo", fix: "Cada arte sai em cerca de 2 minutos, com legenda e logo.", icon: Clock },
  vergonha: { title: "Seu Instagram ainda não parece de agência grande", fix: "Duas semanas de posts profissionais já mudam a cara do perfil.", icon: EyeOff },
};

const QUIZ_MEDIA = {
  intro: ["/quiz-media/vitrine/ad-rio-7.webp", "/quiz-media/vitrine/car-noronha-1.webp", "/quiz-media/vitrine/ad-rio-2.webp"],
  site: { desktop: "/quiz-media/site-desktop.webp", mobile: "/quiz-media/site-mobile.webp" },
};

const DESTINO_LABEL: Record<string, string> = {
  praia: "Porto de Galinhas", serra: "Gramado", internacional: "Cancún", cruzeiro: "Cruzeiro pelo litoral", excursao: "Excursão de fim de semana",
};

const PLANS: { cycle: Cycle; name: string; hint: string; price: string; per: string; note: string; value: number; popular?: boolean }[] = [
  { cycle: "monthly", name: "Mensal", hint: "Pra testar com calma", price: ELITE_OFFER.monthlyPrice, per: "/mês", note: "Cancele quando quiser", value: 97 },
  { cycle: "semiannual", name: "Semestral", hint: "6 meses de acesso", price: ELITE_OFFER.semiannualPrice, per: "/6 meses", note: "R$ 57,83 por mês", value: 347 },
  { cycle: "annual", name: "Anual", hint: "Postando o ano inteiro", price: ELITE_OFFER.annualPrice, per: "/ano", note: `${ELITE_OFFER.annualMonthlyEquivalent} por mês · economia de ${ELITE_OFFER.annualSavings}`, value: 482, popular: true },
];


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
    if (subscription.subscribed && !isLocalPreviewEnabled()) navigate("/fabrica", { replace: true });
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
    // Sem sessão (quem já tem conta e ainda não confirmou o e-mail): registra pelo e-mail digitado.
    if (!user) captureLead(readLeadEmail(), "step", { step: step + 1, kind: STEPS[step].kind, key: (STEPS[step] as QuestionStep).key ?? null });
    window.scrollTo({ top: 0 });
  }, [step, track, user]);

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
    if (!user) captureLead(readLeadEmail(), "plan", { billing_cycle: plan });
    trackMetaEvent("InitiateCheckout", { value: selected.value, currency: "BRL", content_name: `Canva Viagem ${selected.name}`, content_category: "onboarding" });
    navigate(checkoutPath(plan));
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

function Screen(props: ScreenProps) {
  switch (props.kind) {
    case "intro": return <Intro onNext={props.onNext} />;
    case "how-buy": return <HowBuy onNext={props.onNext} />;
    case "speed": return <Speed onNext={props.onNext} />;
    case "start-small": return <StartSmall onNext={props.onNext} />;
    case "one-destino": return <OneDestino destino={props.destino} onNext={props.onNext} />;
    case "diagnosis": return <Diagnosis answers={props.answers} onNext={props.onNext} />;
    case "sample": return <Sample onNext={props.onNext} />;
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
          Fale o pacote num áudio. Receba anúncio, carrossel, site e vídeo <Accent>prontos, com a sua logo.</Accent>
        </h1>
        <p className="cv-pop mt-3 max-w-[300px] text-[15px] leading-6" style={{ ...delay(160), color: "var(--cv-muted)" }}>
          Responda 8 perguntas e a gente monta as suas 2 primeiras semanas: do anúncio ao site.
        </p>
      </div>
      <div className="relative mx-auto mt-8 h-72 w-full max-w-[360px]">
        {QUIZ_MEDIA.intro.map((src, i) => {
          const center = i === 1;
          return (
            <div
              key={src}
              className="cv-float absolute"
              style={{
                ...delay(i * 300),
                ["--cv-rot" as string]: ["-7deg", "0deg", "7deg"][i],
                width: center ? 168 : 132,
                left: center ? "50%" : i === 0 ? "0%" : undefined,
                right: i === 2 ? "0%" : undefined,
                marginLeft: center ? -84 : undefined,
                top: center ? 0 : 44,
                zIndex: center ? 2 : 1,
              }}
            >
              <img
                src={src}
                alt={["Anúncio de Maragogi feito na Fábrica", "Carrossel de Fernando de Noronha feito na Fábrica", "Anúncio do Rio de Janeiro feito na Fábrica"][i]}
                className={`w-full rounded-2xl border-4 border-white object-cover shadow-xl ${center ? "aspect-[4/5]" : "aspect-square"}`}
              />
            </div>
          );
        })}
      </div>
      <div className="mt-6 flex flex-col items-center gap-2">
        <span className="rounded-full border bg-white px-3 py-1 text-[12px]" style={{ borderColor: "var(--cv-line)" }}>Um áudio · tudo pronto · sem limite</span>
        <div className="flex items-center gap-3 text-[12px] font-semibold" style={{ color: "var(--cv-muted)" }}>
          <span className="tracking-[1.2px]">PARA</span>
          <span className="inline-flex items-center gap-1"><Instagram className="h-3.5 w-3.5" /> Feed</span>
          <span className="inline-flex items-center gap-1"><LayoutTemplate className="h-3.5 w-3.5" /> Stories</span>
          <span className="inline-flex items-center gap-1"><MessageCircle className="h-3.5 w-3.5" /> WhatsApp</span>
          <span className="inline-flex items-center gap-1"><Globe2 className="h-3.5 w-3.5" /> Site</span>
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
        Fale o pacote num áudio (ou digite) e receba tudo pronto, com a sua logo. <strong className="text-[var(--cv-fg)]">Do zero ao post em uns 2 minutos.</strong>
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
    { icon: Globe2, label: "Página do pacote no seu site", n: 1 },
    { icon: Megaphone, label: "Anúncio pra impulsionar", n: 2 },
    { icon: MessageCircle, label: "Texto pro WhatsApp", n: 1 },
  ];
  return (
    <>
      <Title sub="Um áudio com destino, dias e valor vira peças pra todos os lugares onde o seu cliente está.">Um áudio. <Accent>Tudo isso pronto.</Accent></Title>
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

function Sample({ onNext }: { onNext: () => void }) {
  return (
    <>
      <Title sub="Você recebe tudo isso pronto, com a sua logo.">Veja o que sai para a sua agência. <Accent>Curtiu?</Accent></Title>
      <div className="cv-pop -mx-5 mt-5" style={delay(150)}>
        <p className="mb-1 px-5 text-[12px] font-bold" style={{ color: "var(--cv-muted)" }}>ANÚNCIOS</p>
        <ShowcaseRow pieces={SHOWCASE_ADS} alt="Anúncio feito no Canva Viagem" />
        <p className="mb-1 mt-3 px-5 text-[12px] font-bold" style={{ color: "var(--cv-muted)" }}>CARROSSÉIS</p>
        <ShowcaseRow pieces={SHOWCASE_CAROUSELS} alt="Slide de carrossel feito no Canva Viagem" slow />
      </div>
      <div className="cv-pop mx-auto mt-4 w-full max-w-[240px]" style={delay(300)}>
        <p className="mb-2 text-center text-[12px] font-bold" style={{ color: "var(--cv-muted)" }}>SITE DO PACOTE</p>
        <SitePreview />
      </div>
      <p className="cv-pop mt-3 text-center text-[13px] font-semibold" style={{ ...delay(450), color: "var(--cv-muted)" }}>+ seus clientes organizados em um só lugar</p>
      <div className="mt-auto grid grid-cols-2 gap-3 pt-6">
        <button onClick={onNext} className="h-14 rounded-full border bg-white text-[15px] font-semibold" style={{ borderColor: "var(--cv-line)" }}>Não é meu estilo</button>
        <button onClick={onNext} className="cv-btn h-14 text-[15px]">Postaria isso!</button>
      </div>
      <p className="mt-3 text-center text-[12px]" style={{ color: "var(--cv-muted)" }}>De qualquer jeito, a gente ajusta ao seu gosto</p>
    </>
  );
}

/** Print real de um site de demonstração: navegador do computador com o celular por cima. */
function SitePreview() {
  return (
    <div className="relative pb-6 pr-10">
      <div className="overflow-hidden rounded-xl border bg-white shadow-md" style={{ borderColor: "var(--cv-line)" }}>
        <div className="flex items-center gap-1 border-b bg-[#f3f1ea] px-2 py-1.5" style={{ borderColor: "#e6e1d2" }}>
          <i className="h-1.5 w-1.5 rounded-full bg-[#ff5f57]" /><i className="h-1.5 w-1.5 rounded-full bg-[#febc2e]" /><i className="h-1.5 w-1.5 rounded-full bg-[#28c840]" />
          <span className="mx-auto truncate rounded-full bg-white px-2 text-[8px] text-[#6e6555]">suaagencia.canvaviagem.com</span>
        </div>
        <img src={QUIZ_MEDIA.site.desktop} alt="Site de agência feito no Canva Viagem, no computador" loading="lazy" className="block aspect-[984/560] w-full object-cover" />
      </div>
      <div className="absolute bottom-0 right-0 w-[86px] overflow-hidden rounded-[16px] border-[4px] border-[#2c261b] bg-white shadow-xl">
        <img src={QUIZ_MEDIA.site.mobile} alt="O mesmo site no celular" loading="lazy" className="block aspect-[348/600] w-full object-cover" />
      </div>
    </div>
  );
}

const CRM_LEADS = [
  { name: "Ana", destino: "Gramado" },
  { name: "Carlos", destino: "Cancún" },
  { name: "Júlia", destino: "Noronha" },
  { name: "Pedro", destino: "Maragogi" },
];
const CRM_COLUMNS = ["Novo pedido", "Em conversa", "Fechou"];

/** Quadro de clientes animado: pedidos de orçamento entram e andam até "Fechou". */
function CrmPreview() {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = window.setInterval(() => setTick((t) => t + 1), 1400);
    return () => window.clearInterval(id);
  }, []);
  // Cada cliente entra num momento diferente e avança uma coluna a cada passo.
  const placed = CRM_LEADS.map((lead, i) => ({ ...lead, col: Math.min(Math.max(((tick + i * 2) % 8) - 2, -1), 2) }));
  return (
    <div className="grid grid-cols-3 gap-1.5 rounded-xl border bg-white p-2 shadow-md" style={{ borderColor: "var(--cv-line)" }}>
      {CRM_COLUMNS.map((title, col) => (
        <div key={title} className="min-h-[112px] rounded-lg p-1.5" style={{ background: col === 2 ? "#e9f8ef" : "var(--cv-sand)" }}>
          <p className="mb-1.5 text-[9px] font-bold uppercase tracking-[0.5px]" style={{ color: col === 2 ? "#15803d" : "var(--cv-muted)" }}>{title}</p>
          <div className="space-y-1">
            {placed.filter((l) => l.col === col).map((l) => (
              <div key={l.name} className="cv-pop rounded-md bg-white px-1.5 py-1 shadow-sm">
                <p className="text-[10px] font-bold leading-tight">{l.name}</p>
                <p className="flex items-center gap-0.5 text-[9px] leading-tight" style={{ color: "var(--cv-muted)" }}>
                  <MessageCircle className="h-2.5 w-2.5 text-[#25D366]" /> {l.destino}
                </p>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function Building({ onDone }: { onDone: () => void }) {
  const [pct, setPct] = useState(0);
  const tasks = [
    { label: "Lendo suas respostas", done: "8 de 8", at: 25 },
    { label: "Separando modelos de anúncio, carrossel e site", done: "pronto", at: 55 },
    { label: "Escrevendo os textos de venda", done: "pronto", at: 80 },
    { label: "Montando suas 2 primeiras semanas", done: "14 dias", at: 100 },
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
      <h1 className="text-center text-[26px] font-extrabold tracking-[-0.02em]">Montando suas 2 primeiras semanas</h1>
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
      <div className="cv-card mt-8 w-full p-4">
        <p className="text-[11px] font-bold tracking-[1.2px]" style={{ color: "var(--cv-muted)" }}>O QUE ESTÁ SAINDO</p>
        <div className="mt-3 grid grid-cols-2 gap-2 text-[13px] font-semibold">
          {[["Anúncio feed", Instagram], ["Stories", LayoutTemplate], ["Carrossel", Images], ["Site do pacote", Globe2], ["Vídeo do destino", Video], ["Texto pro WhatsApp", MessageCircle]].map(([label, Icon]) => {
            const I = Icon as Icon;
            return (
              <span key={label as string} className="inline-flex items-center gap-2 rounded-xl px-3 py-2" style={{ background: "var(--cv-sand)" }}>
                <I className="h-4 w-4 text-[#6440e6]" /> {label as string}
              </span>
            );
          })}
        </div>
      </div>
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
  const [openWeek2, setOpenWeek2] = useState(false);
  const travas = new Set(answers.travas || []);
  const desafio = answers.desafio?.[0];
  const orcamentos = answers.orcamentos?.[0];
  const metrics = [
    { label: "Constância de posts", now: travas.has("tempo") || desafio === "tempo" ? 20 : 40, with: 95 },
    { label: "Visual profissional", now: travas.has("design") || desafio === "amador" ? 25 : 50, with: 92 },
    { label: "Perfil que vende", now: travas.has("vergonha") || desafio === "ninguem" ? 20 : 45, with: 90 },
    { label: "Pedidos de orçamento no WhatsApp", now: orcamentos === "zero" ? 10 : orcamentos === "poucos" ? 25 : orcamentos === "medio" ? 45 : orcamentos === "muitos" ? 60 : 30, with: 90 },
  ];
  const weeks = [
    [
      { d: "Seg", t: `Anúncio de ${destino} + stories do pacote`, icon: Megaphone },
      { d: "Ter", t: "Carrossel do pacote com dicas da viagem", icon: Images },
      { d: "Qua", t: "Pacote publicado no seu site", icon: Globe2 },
      { d: "Qui", t: "Reels do pacote", icon: Video },
      { d: "Sex", t: "Stories e vídeo de outro pacote em promoção", icon: LayoutTemplate },
      { d: "Sáb", t: "Responder orçamentos no WhatsApp e anunciar outro pacote", icon: MessageCircle },
      { d: "Dom", t: "Organizar clientes no CRM e planejar a semana", icon: Users },
    ],
    [
      { d: "Seg", t: "Anúncio de um pacote novo + stories com enquete", icon: Megaphone },
      { d: "Ter", t: "Carrossel: o que fazer no destino", icon: Images },
      { d: "Qua", t: "Página do pacote novo no site e link na bio", icon: Globe2 },
      { d: "Qui", t: "Reels com bastidores ou depoimento de cliente", icon: Video },
      { d: "Sex", t: "Stories com contagem regressiva da promoção", icon: LayoutTemplate },
      { d: "Sáb", t: "Mandar a página do pacote para quem pediu orçamento", icon: MessageCircle },
      { d: "Dom", t: "CRM: quem fechou, quem falta responder e o plano da próxima semana", icon: Users },
    ],
  ];
  return (
    <>
      <Title sub="Com base nas suas 8 respostas">Seu diagnóstico <Accent>está pronto</Accent></Title>
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
        <GrowthChart now={now} potential={potential} />
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
          <p className="text-[11px] font-bold tracking-[1.2px]" style={{ color: "var(--cv-muted)" }}>SEU PLANO DE 2 SEMANAS</p>
          <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[12px] font-semibold" style={{ background: "#efe9ff", color: "var(--cv-primary-ink)" }}><MapPin className="h-3 w-3" /> {destino}</span>
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
          <Lock className="h-3.5 w-3.5 shrink-0 text-[#b9ae95]" />
        </div>
      ))}
    </div>
  );
}

/** Curva de 8 semanas: do jeito que está hoje × postando com constância no Canva Viagem. */
function GrowthChart({ now, potential }: { now: number; potential: number }) {
  const W = 300, H = 132, padX = 6, padTop = 14, padBottom = 22;
  const weeks = 8;
  const x = (i: number) => padX + (i / (weeks - 1)) * (W - padX * 2);
  const y = (v: number) => padTop + (1 - v / 100) * (H - padTop - padBottom);
  const growth = Array.from({ length: weeks }, (_, i) => now + (potential - now) * (1 - Math.pow(1 - i / (weeks - 1), 2.2)));
  const flat = Array.from({ length: weeks }, (_, i) => now + i * 0.6);
  const line = (vals: number[]) => vals.map((v, i) => `${i ? "L" : "M"}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(" ");
  const area = `${line(growth)} L${x(weeks - 1)},${H - padBottom} L${x(0)},${H - padBottom} Z`;
  return (
    <figure className="mt-5">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label={`Potencial sobe de ${now} para ${potential} em 8 semanas postando com constância`}>
        <defs>
          <linearGradient id="cv-growth" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#7c5cff" stopOpacity="0.28" />
            <stop offset="100%" stopColor="#7c5cff" stopOpacity="0" />
          </linearGradient>
        </defs>
        {[25, 50, 75].map((g) => <line key={g} x1={padX} x2={W - padX} y1={y(g)} y2={y(g)} stroke="#efe6cc" strokeDasharray="3 4" />)}
        <path d={area} fill="url(#cv-growth)" />
        <path d={line(flat)} fill="none" stroke="#cfc4a6" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="5 5" />
        <path d={line(growth)} fill="none" stroke="#7c5cff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" pathLength={1} className="cv-draw" />
        <circle cx={x(weeks - 1)} cy={y(potential)} r="5" fill="#7c5cff" stroke="#fff" strokeWidth="2" />
        <text x={padX} y={H - 6} fontSize="10" fill="#8a8170">Hoje</text>
        <text x={W - padX} y={H - 6} fontSize="10" fill="#8a8170" textAnchor="end">Semana 8</text>
      </svg>
      <figcaption className="mt-1 flex gap-4 text-[11px]" style={{ color: "var(--cv-muted)" }}>
        <span className="inline-flex items-center gap-1.5"><span className="h-0.5 w-4 rounded bg-[#7c5cff]" /> postando com o Canva Viagem</span>
        <span className="inline-flex items-center gap-1.5"><span className="h-0.5 w-4 rounded border-t-2 border-dashed border-[#cfc4a6]" /> do jeito de hoje</span>
      </figcaption>
    </figure>
  );
}

function Loop({ onNext }: { onNext: () => void }) {
  const steps = [
    { icon: Mic, title: "Mande um áudio", text: "Destino, dias e valor do pacote. Ou digite." },
    { icon: Sparkles, title: "Receba tudo pronto", text: "Anúncio, stories, carrossel, site e vídeo, com a sua logo." },
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
      <Title sub="Anúncios, stories, carrosséis, site e seus clientes organizados. Tudo com a sua marca, sem limite de quantidade.">Suas 2 semanas estão prontas. <Accent>Libere o acesso.</Accent></Title>

      <div className="cv-pop mt-5 flex items-center gap-3 rounded-[22px] border p-4" style={{ ...delay(100), background: "#efe9ff", borderColor: "#cbbcff" }}>
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-white"><Gift className="h-5 w-5 text-[#6440e6]" /></span>
        <div>
          <p className="text-[14px] font-bold">Prêmio desbloqueado</p>
          <p className="text-[12px] leading-4" style={{ color: "var(--cv-muted)" }}>Seus 14 primeiros dias de posts já montados (é só repetir o ciclo no mês inteiro) + 7 dias de garantia pra testar com um pacote seu.</p>
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
        {["Tudo ilimitado", "Sua logo em tudo", "Site da agência", "Clientes no WhatsApp"].map((f) => (
          <span key={f} className="inline-flex items-center gap-1"><Check className="h-3.5 w-3.5 text-[#16a34a]" /> {f}</span>
        ))}
      </div>

      <BottomCta onClick={onCheckout}>Começar com o {selected.name}</BottomCta>
      <p className="mt-2 text-center text-[12px]" style={{ color: "var(--cv-muted)" }}>{selected.price}{selected.per} · {selected.note.toLowerCase()}</p>
      <PayWithPixButton plan={plan} className="mt-3 rounded-full py-3 text-[13px]" />
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
