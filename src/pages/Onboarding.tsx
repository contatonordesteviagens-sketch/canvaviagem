import { useEffect, useMemo, useRef, useState, type ComponentType, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import {
  ArrowRight, Check, ChevronLeft, Wallet, Sprout, Briefcase, TrendingUp, Palette, UserRound,
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
import { trackInicioTeste } from "@/lib/inicio-teste";
import { readTrialResult, type TrialResult } from "@/lib/inicio-arte";
import depoimento1 from "@/assets/depoimento1.jpg";
import depoimento2 from "@/assets/depoimento2.png";
import depoimento3 from "@/assets/depoimento3.jpg";

type Icon = ComponentType<{ className?: string }>;
type Option = { id: string; label: string; hint: string; icon: Icon };
type QuestionStep = { kind: "question"; key: AnswerKey; title: string; sub: string; multi?: boolean; options: Option[] };
type ScreenStep = { kind: "intro" | "sample" | "building" | "result" | "proof" | "offer" };
type Step = QuestionStep | ScreenStep;
type AnswerKey = "objetivo" | "ferramenta" | "desafio" | "momento" | "orcamentos" | "destinos" | "travas" | "prazo";
type Answers = Partial<Record<AnswerKey, string[]>>;
type Cycle = "monthly" | "semiannual" | "annual";

// v3: quiz de 10 telas; as versões antigas guardavam o passo pela ordem antiga.
const STORAGE_KEY = "cv-onboarding-v3";

const STEPS: Step[] = [
  { kind: "intro" },
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
    kind: "question", key: "orcamentos", title: "Quantos pedidos de orçamento chegam no seu WhatsApp por semana?", sub: "Conta aproximada já ajuda",
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
  { kind: "sample" },
  { kind: "building" },
  { kind: "result" },
  { kind: "proof" },
  { kind: "offer" },
];

const TOTAL = STEPS.length;

const FIXES: Record<string, { title: string; fix: string; icon: Icon }> = {
  design: { title: "Você não sabe criar postagens", fix: "Anúncio, carrossel e vídeo já vêm prontos. Você só fala o pacote.", icon: Palette },
  tempo: { title: "Você não tem tempo", fix: "Cada arte sai em cerca de 2 minutos, com legenda e logo.", icon: Clock },
  vergonha: { title: "Seu Instagram ainda não parece de agência grande", fix: "Duas semanas de posts profissionais já mudam a cara do perfil.", icon: EyeOff },
};

const QUIZ_MEDIA = {
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
      trackInicioTeste("quiz");
    }
    track("onboarding_step", { step: step + 1, kind: STEPS[step].kind, key: (STEPS[step] as QuestionStep).key ?? null });
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
    case "sample": return <Sample onNext={props.onNext} />;
    case "building": return <Building onDone={props.onNext} />;
    case "result": return <Result answers={props.answers} destino={props.destino} onNext={props.onNext} />;
    case "proof": return <Proof onNext={props.onNext} />;
    case "offer": return <Offer plan={props.plan} setPlan={props.setPlan} onCheckout={props.onCheckout} />;
  }
}

/** As artes do teste da página inicial, com a marca d'água, no mesmo leque da primeira tela. */
function TrialFan({ trial }: { trial: TrialResult }) {
  const arts = trial.arts.slice(0, 3);
  const [front, setFront] = useState(Math.min(1, arts.length - 1));
  return (
    <div className="relative mx-auto mt-7 h-64 w-full max-w-[360px] select-none" onContextMenu={(e) => e.preventDefault()} style={{ WebkitTouchCallout: "none" }}>
      {arts.map((src, i) => {
        const isFront = i === front;
        const side = i < front ? -1 : i > front ? 1 : 0;
        return (
          <button
            key={src.slice(-40)}
            type="button"
            onClick={() => setFront(i)}
            aria-label={`Ver a arte ${i + 1} de ${trial.destino}`}
            className="absolute left-1/2 top-0 transition-all duration-300"
            style={{
              width: isFront ? 224 : 150,
              marginLeft: isFront ? -112 : side < 0 ? -176 : 26,
              top: isFront ? 0 : 42,
              zIndex: isFront ? 2 : 1,
              transform: `rotate(${side * 7}deg)`,
            }}
          >
            <img src={src} alt="" draggable={false} className="pointer-events-none aspect-square w-full rounded-2xl border-4 border-white object-cover shadow-xl" />
          </button>
        );
      })}
    </div>
  );
}

function Intro({ onNext }: { onNext: () => void }) {
  const [trial] = useState(readTrialResult);
  return (
    <>
      <div className="flex flex-col items-center text-center">
        <span className="cv-pop inline-flex items-center gap-2 rounded-full border bg-white px-3 py-1.5 text-[12px] font-semibold" style={{ borderColor: "var(--cv-line)" }}>
          Quiz de 1 minuto
        </span>
        <h1 className="cv-pop mt-5 text-balance text-[32px] font-extrabold leading-[1.05] tracking-[-0.025em]" style={delay(80)}>
          {trial ? (
            <>Suas artes de {trial.destino} <Accent>já estão aqui.</Accent></>
          ) : (
            <>Veja o que sai pronto <Accent>para a sua agência.</Accent></>
          )}
        </h1>
        <p className="cv-pop mt-3 max-w-[320px] text-[15px] leading-6" style={{ ...delay(160), color: "var(--cv-muted)" }}>
          {trial
            ? "Toque para ver cada uma. Responda 4 perguntas rápidas e veja o plano para usar essas artes sem marca d'água, com o seu preço e o seu WhatsApp."
            : "Anúncio, carrossel e site com a sua logo, e vídeos prontos para postar. Responda 4 perguntas rápidas e veja o plano certo para a sua agência."}
        </p>
      </div>
      {trial ? (
        <TrialFan trial={trial} />
      ) : (
        <div className="cv-pop -mx-5 mt-6" style={delay(220)}>
          <ShowcaseRow pieces={SHOWCASE_ADS} alt="Anúncio feito no Canva Viagem" />
          <ShowcaseRow pieces={SHOWCASE_CAROUSELS} alt="Slide de carrossel feito no Canva Viagem" slow size="compact" className="mt-1" />
        </div>
      )}
      <div className="mt-6 flex flex-col items-center gap-2">
        <span className="rounded-full border bg-white px-3 py-1 text-[12px]" style={{ borderColor: "var(--cv-line)" }}>Fale ou digite · sua logo em tudo · sem limite</span>
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






function Sample({ onNext }: { onNext: () => void }) {
  return (
    <>
      <Title sub="Anúncio, carrossel e site com a sua logo.">Veja o que sai para a sua agência. <Accent>Curtiu?</Accent></Title>
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
    { label: "Lendo suas respostas", done: "pronto", at: 25 },
    { label: "Separando modelos de anúncio, carrossel e site", done: "pronto", at: 55 },
    { label: "Escrevendo os textos de venda", done: "pronto", at: 80 },
    { label: "Sugerindo o que postar nas 2 primeiras semanas", done: "pronto", at: 100 },
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
      <h1 className="text-center text-[26px] font-extrabold tracking-[-0.02em]">Montando seu plano</h1>
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
          {[["Anúncio feed", Instagram], ["Stories", LayoutTemplate], ["Carrossel", Images], ["Site do pacote", Globe2], ["Vídeos prontos", Video], ["Texto pro WhatsApp", MessageCircle]].map(([label, Icon]) => {
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
              <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full" style={{ background: "#efe9ff" }}><Check className="h-3.5 w-3.5 text-[#6440e6]" /></span>
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
        </div>
      ))}
    </div>
  );
}


/** Prints de conversas com clientes, logo antes do preço. */
function Proof({ onNext }: { onNext: () => void }) {
  return (
    <>
      <Title sub="Mensagens que chegaram no WhatsApp.">Quem começou a divulgar <Accent>conta assim</Accent></Title>
      <div className="cv-pop -mx-5 mt-6 flex snap-x snap-mandatory gap-3 overflow-x-auto px-5 pb-2" style={delay(120)}>
        {[depoimento1, depoimento2, depoimento3].map((src, i) => (
          <img
            key={src}
            src={src}
            alt={`Mensagem de cliente ${i + 1}`}
            loading="lazy"
            className="max-h-[440px] w-[82%] shrink-0 snap-center rounded-2xl border-4 border-white object-contain shadow-xl"
          />
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
      <Title sub="Anúncios, stories, carrosséis, site e seus clientes organizados. Tudo com a sua marca, sem limite de quantidade.">Seu plano está pronto. <Accent>Libere o acesso.</Accent></Title>

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
