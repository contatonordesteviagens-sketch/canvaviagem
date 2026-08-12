import { useCallback, useEffect, useRef, useState } from "react";
import { Helmet } from "react-helmet-async";
import {
  ArrowRight,
  BadgeCheck,
  Check,
  CheckCircle2,
  ChevronDown,
  Clock3,
  Image as ImageIcon,
  MessageCircle,
  Palette,
  Play,
  ShieldCheck,
  Sparkles,
  X,
  Zap,
} from "lucide-react";
import logoImage from "@/assets/logo.png";
import showcaseAdCreation from "@/assets/images/showcase-ad-creation.png";
import antesAmador from "@/assets/antes_amador.png";
import depoisPremium from "@/assets/depois_premium.png";
import depoimento1 from "@/assets/depoimento1.jpg";
import depoimento2 from "@/assets/depoimento2.png";
import depoimento3 from "@/assets/depoimento3.jpg";
import lucasPortrait from "@/assets/lucas-ferrari-portrait.webp";
import { trackEvent } from "@/hooks/useAnalyticsEvents";
import { ELITE_OFFER } from "@/lib/eliteOffer";

type BillingCycle = "monthly" | "semiannual" | "annual";

const metaPixelId = "916689227676142";
const supportWhatsAppUrl =
  "https://wa.me/5585998458995?text=Ol%C3%A1%2C%20quero%20entender%20melhor%20a%20F%C3%A1brica%20de%20An%C3%BAncios%20do%20Canva%20Viagem";

const secureCheckoutPath = (cycle: BillingCycle) => {
  const params = new URLSearchParams({
    checkout: cycle,
    upgrade: "ad_export",
    returnTo: "/fabrica/anuncio",
    offer: "ads",
  });
  return `/inicio?${params.toString()}`;
};

const faqItems = [
  {
    question: "Isso é uma biblioteca de templates ou uma ferramenta?",
    answer:
      "É uma ferramenta dentro da plataforma Canva Viagem. Você informa os dados do pacote, escolhe o modelo e monta a divulgação com destino, preço, condições e identidade da sua agência.",
  },
  {
    question: "Por que não fazer diretamente no Canva?",
    answer:
      "Você pode fazer. A diferença é que, no Canva, normalmente precisa procurar um template, adaptar a estrutura, reorganizar preço, condições e formatos. A Fábrica começa pela rotina de quem vende viagens e reduz esse trabalho repetitivo.",
  },
  {
    question: "Preciso saber design ou dominar o Canva?",
    answer:
      "Não. A proposta é partir de estruturas prontas para turismo. Você escolhe o modelo, substitui as informações e gera o material. Se quiser, ainda pode fazer ajustes finais depois.",
  },
  {
    question: "Consigo colocar minha logo, cores e telefone?",
    answer:
      "Sim. A divulgação pode ser adaptada com a identidade e os dados de contato da sua agência.",
  },
  {
    question: "Os anúncios servem para Feed e Stories?",
    answer:
      "Sim. A Fábrica trabalha com formatos de divulgação para Feed e Stories, permitindo apresentar o mesmo pacote em peças adequadas para cada espaço.",
  },
  {
    question: "A ferramenta garante que eu vou vender?",
    answer:
      "Não. Nenhuma ferramenta séria pode garantir vendas. A Fábrica resolve uma parte específica: transformar as informações do pacote em uma apresentação mais rápida, clara e profissional. Oferta, tráfego, atendimento e follow-up também influenciam o resultado.",
  },
  {
    question: "O teste exige cartão? Quando acontece a cobrança?",
    answer:
      "Sim. Você cadastra o cartão no checkout seguro da Stripe. Os três primeiros dias são gratuitos e a cobrança do plano escolhido ocorre depois do período de teste.",
  },
  {
    question: "Como faço para cancelar?",
    answer:
      "O cancelamento é online. Você pode cancelar antes do fim dos três dias para evitar a primeira cobrança. Se tiver qualquer dificuldade, o suporte pelo WhatsApp pode orientar.",
  },
];

const proofImages = [
  {
    image: depoimento1,
    title: "Primeira venda para Disney",
    description: "Relato recebido após aplicação de anúncio e IA na divulgação.",
  },
  {
    image: depoimento2,
    title: "23 orçamentos e 5 pacotes",
    description: "Mensagem sobre uma campanha de promoção de férias.",
  },
  {
    image: depoimento3,
    title: "Meta do mês aumentada",
    description: "Retorno espontâneo enviado por WhatsApp.",
  },
];

const comparisonRows = [
  ["Começar a divulgação", "Procurar e adaptar um template", "Enviar briefing e aguardar", "Informar o pacote e escolher um modelo"],
  ["Foco em turismo", "Templates para todos os mercados", "Depende do profissional", "Estruturas pensadas para viagens"],
  ["Preço e condições", "Você posiciona manualmente", "Você revisa o briefing", "Campos orientados para a oferta"],
  ["Feed e Stories", "Você adapta os tamanhos", "Pode ter cobrança por peça", "Formatos preparados para publicar"],
  ["Disponibilidade", "Depende do seu tempo", "Depende da agenda do designer", "Você cria quando o pacote chega"],
];

const planDetails = {
  annual: {
    cycle: "annual" as const,
    name: "Plano Anual",
    price: ELITE_OFFER.annualMonthlyEquivalent,
    suffix: "por mês",
    charge: `${ELITE_OFFER.annualPrice} cobrados uma vez, com 12 meses de acesso, após o teste`,
    value: 482,
  },
  monthly: {
    cycle: "monthly" as const,
    name: "Plano Mensal",
    price: ELITE_OFFER.monthlyPrice,
    suffix: "por mês",
    charge: "Cobrança mensal após o teste",
    value: 97,
  },
  semiannual: {
    cycle: "semiannual" as const,
    name: "Plano Semestral",
    price: ELITE_OFFER.semiannualPrice,
    suffix: "por 6 meses",
    charge: "R$ 347 cobrados uma vez, com 6 meses de acesso, após o teste",
    value: 347,
  },
};

export default function AdsOfferLanding() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [checkoutLoading, setCheckoutLoading] = useState<BillingCycle | null>(null);
  const [exitOfferOpen, setExitOfferOpen] = useState(false);
  const pageTrackedRef = useRef(false);
  const exitDialogRef = useRef<HTMLDivElement>(null);

  const recordEvent = useCallback((eventType: string, data: Record<string, unknown> = {}) => {
    void trackEvent(eventType, {
      offer_variant: "ads_v2",
      landing_path: "/anuncios-para-agencia-de-viagens",
      feature: "ad_export",
      ...data,
    });
  }, []);

  useEffect(() => {
    if (pageTrackedRef.current) return;
    pageTrackedRef.current = true;
    recordEvent("landing_viewed");
  }, [recordEvent]);

  useEffect(() => {
    if (!exitOfferOpen) return;

    const previouslyFocused = document.activeElement as HTMLElement | null;
    const dialog = exitDialogRef.current;
    const focusableSelector = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
    const focusable = dialog ? Array.from(dialog.querySelectorAll<HTMLElement>(focusableSelector)) : [];
    focusable[0]?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setExitOfferOpen(false);
        recordEvent("exit_popup_dismissed", { method: "escape" });
        return;
      }
      if (event.key !== "Tab" || focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      previouslyFocused?.focus();
    };
  }, [exitOfferOpen, recordEvent]);

  useEffect(() => {
    const storageKey = "cv:exit-offer-shown:ads-v2";
    if (sessionStorage.getItem(storageKey)) return;

    let armed = false;
    const timer = window.setTimeout(() => {
      armed = true;
    }, 10000);
    const handleMouseOut = (event: MouseEvent) => {
      if (!armed || event.clientY > 4 || event.relatedTarget) return;
      sessionStorage.setItem(storageKey, "1");
      setExitOfferOpen(true);
      recordEvent("exit_popup_shown");
      document.removeEventListener("mouseout", handleMouseOut);
    };

    document.addEventListener("mouseout", handleMouseOut);
    return () => {
      window.clearTimeout(timer);
      document.removeEventListener("mouseout", handleMouseOut);
    };
  }, [recordEvent]);

  const scrollToPlans = (source: string) => {
    setExitOfferOpen(false);
    recordEvent("cta_clicked", { source });
    document.getElementById("planos")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const startCheckout = (cycle: BillingCycle, value: number) => {
    recordEvent("plan_selected", { billing_cycle: cycle, value });
    recordEvent("checkout_started", { billing_cycle: cycle, value });
    const fbq = (window as Window & { fbq?: (...args: unknown[]) => void }).fbq;
    fbq?.("trackSingle", metaPixelId, "InitiateCheckout", {
      value,
      currency: "BRL",
      content_name: "Canva Viagem - Fábrica de Anúncios",
      content_category: `landing_ads_${cycle}`,
    });
    setCheckoutLoading(cycle);
    window.location.assign(secureCheckoutPath(cycle));
  };

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#F7F8FA] text-slate-950" style={{ fontFamily: "Outfit, sans-serif" }}>
      <Helmet>
        <title>Crie anúncios para sua agência de viagens | Canva Viagem</title>
        <meta
          name="description"
          content="Transforme destino, preço e condições em anúncios profissionais para Feed e Stories com a Fábrica de Anúncios do Canva Viagem."
        />
        <link rel="canonical" href="https://canvaviagem.com/anuncios-para-agencia-de-viagens" />
        <meta property="og:title" content="Crie anúncios profissionais para sua agência de viagens" />
        <meta
          property="og:description"
          content="Informe seu pacote, escolha um modelo e prepare a divulgação da sua agência sem começar do zero."
        />
        <meta property="og:url" content="https://canvaviagem.com/anuncios-para-agencia-de-viagens" />
      </Helmet>

      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/95 backdrop-blur">
        <div className="mx-auto flex min-h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <a href="/inicio" aria-label="Ir para a página inicial do Canva Viagem" className="shrink-0">
            <img src={logoImage} alt="Canva Viagem" className="h-8 w-auto" />
          </a>
          <div className="hidden items-center gap-2 text-sm font-semibold text-slate-600 md:flex">
            <ShieldCheck className="h-4 w-4 text-cyan-700" />
            Checkout seguro pela Stripe
          </div>
          <button
            type="button"
            onClick={() => scrollToPlans("header")}
            className="inline-flex min-h-11 items-center justify-center rounded-xl bg-cyan-700 px-4 text-sm font-extrabold text-white transition hover:bg-cyan-800 active:scale-[0.98] sm:px-6"
          >
            Testar por 3 dias
          </button>
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden bg-[#0B1324] text-white">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_78%_20%,rgba(8,145,178,0.18),transparent_34%)]" />
          <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 py-16 sm:px-6 md:py-20 lg:grid-cols-[0.92fr_1.08fr] lg:px-8 lg:py-24">
            <div className="max-w-2xl">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-4 py-2 text-xs font-extrabold uppercase tracking-[0.18em] text-cyan-200">
                <Zap className="h-4 w-4" />
                Fábrica de Anúncios para agências de viagens
              </div>
              <h1 className="max-w-[14ch] text-4xl font-black leading-[0.98] tracking-[-0.045em] sm:text-5xl lg:text-6xl">
                Crie anúncios profissionais para seus pacotes em poucos minutos.
              </h1>
              <p className="mt-6 max-w-[62ch] text-lg leading-relaxed text-slate-300 sm:text-xl">
                Informe destino, preço e condições. Escolha um modelo e prepare peças para Feed e Stories com a marca da sua agência — sem começar do zero e sem esperar um designer.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={() => scrollToPlans("hero")}
                  className="inline-flex min-h-14 items-center justify-center gap-2 rounded-xl bg-cyan-600 px-7 text-base font-black text-white transition hover:bg-cyan-500 active:scale-[0.98]"
                >
                  Criar meu primeiro anúncio
                  <ArrowRight className="h-5 w-5" />
                </button>
                <a
                  href="#demonstracao"
                  className="inline-flex min-h-14 items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/5 px-7 text-base font-bold text-white transition hover:bg-white/10 active:scale-[0.98]"
                >
                  <Play className="h-5 w-5" />
                  Ver como funciona
                </a>
              </div>
              <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-sm font-semibold text-slate-300">
                <span className="inline-flex items-center gap-2"><Check className="h-4 w-4 text-cyan-300" />3 dias gratuitos</span>
                <span className="inline-flex items-center gap-2"><Check className="h-4 w-4 text-cyan-300" />Sem cobrança hoje</span>
                <span className="inline-flex items-center gap-2"><Check className="h-4 w-4 text-cyan-300" />Cancelamento online</span>
              </div>
            </div>

            <div className="relative">
              <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-white/5 p-3 shadow-[0_30px_80px_-35px_rgba(8,145,178,0.6)]">
                <img
                  src={showcaseAdCreation}
                  alt="Exemplos de anúncios de viagens criados para Gramado, Portugal, Cancún e Maceió"
                  className="aspect-[4/3] w-full rounded-[1.4rem] object-cover"
                />
              </div>
              <div className="mt-4 grid grid-cols-3 gap-2 sm:absolute sm:-bottom-6 sm:left-6 sm:right-6 sm:mt-0">
                {[
                  ["1", "Informe o pacote"],
                  ["2", "Escolha o modelo"],
                  ["3", "Baixe e publique"],
                ].map(([number, label]) => (
                  <div key={number} className="rounded-xl border border-white/10 bg-[#111C31] px-3 py-3 text-center shadow-lg">
                    <span className="mx-auto mb-1 flex h-6 w-6 items-center justify-center rounded-full bg-cyan-600 text-xs font-black">{number}</span>
                    <span className="text-xs font-bold text-slate-200 sm:text-sm">{label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="border-b border-slate-200 bg-white">
          <div className="mx-auto grid max-w-7xl grid-cols-2 divide-x divide-y divide-slate-200 px-4 sm:px-6 md:grid-cols-4 md:divide-y-0 lg:px-8">
            {[
              ["Feito para turismo", "Não é uma ferramenta genérica"],
              ["Feed e Stories", "O mesmo pacote em mais formatos"],
              ["Sua identidade", "Logo, cores e contato da agência"],
              ["Suporte humano", "Orientação pelo WhatsApp"],
            ].map(([title, copy]) => (
              <div key={title} className="px-3 py-6 text-center sm:px-5">
                <p className="font-black text-slate-950">{title}</p>
                <p className="mt-1 text-xs leading-relaxed text-slate-500 sm:text-sm">{copy}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-white py-16 md:py-24">
          <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 sm:px-6 lg:grid-cols-[0.82fr_1.18fr] lg:px-8">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-700">O gargalo que ninguém vê</p>
              <h2 className="mt-4 text-3xl font-black leading-tight tracking-tight text-slate-950 md:text-5xl">
                Seu pacote não precisa de mais um template. Precisa ficar fácil de entender.
              </h2>
              <p className="mt-5 text-lg leading-relaxed text-slate-600">
                Quando destino, preço e condições aparecem sem hierarquia, o cliente precisa trabalhar para entender a oferta. E, no celular, ele simplesmente passa para a próxima publicação.
              </p>
              <p className="mt-4 border-l-4 border-cyan-700 pl-5 text-lg font-bold leading-relaxed text-slate-800">
                A função do anúncio não é garantir a venda. É fazer o cliente parar, compreender a oportunidade e querer saber mais.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {[
                ["O preço some no layout", "A condição mais importante disputa espaço com todos os outros elementos."],
                ["Cada pacote começa do zero", "Você perde tempo procurando modelo, ajustando texto e corrigindo tamanho."],
                ["O designer vira gargalo", "Uma promoção urgente fica esperando briefing, revisão e agenda."],
                ["O cliente não percebe valor", "A apresentação improvisada faz um pacote bem montado parecer comum."],
              ].map(([title, copy]) => (
                <div key={title} className="border-t border-slate-300 py-5 sm:px-3">
                  <p className="text-lg font-black text-slate-950">{title}</p>
                  <p className="mt-2 leading-relaxed text-slate-600">{copy}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="demonstracao" className="border-y border-slate-200 bg-[#EEF3F6] py-16 md:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid items-end gap-6 md:grid-cols-[1fr_auto]">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-700">Veja o processo, não só a promessa</p>
                <h2 className="mt-4 max-w-[17ch] text-3xl font-black leading-tight tracking-tight md:text-5xl">
                  De informações soltas a uma divulgação pronta.
                </h2>
              </div>
              <p className="max-w-md text-base leading-relaxed text-slate-600 md:text-lg">
                Use um pacote real da sua agência durante o teste e veja se o processo cabe na sua rotina.
              </p>
            </div>

            <div className="mt-10 grid gap-5 lg:grid-cols-[0.85fr_1.15fr]">
              <div className="rounded-[1.5rem] bg-[#0B1324] p-6 text-white md:p-8">
                {[
                  ["01", "Preencha", "Destino, preço, duração e condições do pacote."],
                  ["02", "Escolha", "Selecione a estrutura visual que combina com a oferta."],
                  ["03", "Personalize", "Aplique marca, cores e contato da sua agência."],
                  ["04", "Publique", "Prepare as versões para Feed e Stories."],
                ].map(([number, title, copy], index) => (
                  <div key={number} className={`grid grid-cols-[44px_1fr] gap-4 py-5 ${index ? "border-t border-white/10" : ""}`}>
                    <span className="font-mono text-sm font-black text-cyan-300">{number}</span>
                    <div>
                      <p className="text-lg font-black">{title}</p>
                      <p className="mt-1 leading-relaxed text-slate-400">{copy}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="overflow-hidden rounded-[1.5rem] border border-slate-200 bg-slate-950 shadow-[0_24px_60px_-30px_rgba(15,23,42,0.45)]">
                <div className="aspect-video">
                  <iframe
                    className="h-full w-full"
                    src={`https://www.youtube-nocookie.com/embed/${ELITE_OFFER.videoId}?rel=0`}
                    title="Demonstração do Canva Viagem"
                    loading="lazy"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                  />
                </div>
                <div className="flex items-center gap-3 bg-white px-5 py-4 text-sm font-semibold text-slate-600">
                  <Play className="h-4 w-4 text-cyan-700" />
                  Assista antes de decidir. Você não precisa comprar no escuro.
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-white py-16 md:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-10 max-w-3xl">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-700">A diferença aparece na apresentação</p>
              <h2 className="mt-4 text-3xl font-black leading-tight tracking-tight md:text-5xl">
                A mesma viagem pode parecer improvisada ou profissional.
              </h2>
              <p className="mt-5 text-lg leading-relaxed text-slate-600">
                O objetivo não é enfeitar a oferta. É organizar a informação para que destino, condição e próxima ação sejam percebidos rapidamente.
              </p>
            </div>
            <div className="grid gap-6 md:grid-cols-2">
              <figure className="overflow-hidden rounded-[1.5rem] border border-rose-200 bg-rose-50">
                <img src={antesAmador} alt="Exemplo ilustrativo de uma divulgação com informação desorganizada" loading="lazy" className="aspect-square w-full object-cover" />
                <figcaption className="p-6">
                  <p className="text-sm font-black uppercase tracking-[0.16em] text-rose-700">Sem uma estrutura clara</p>
                  <p className="mt-2 text-lg font-bold text-slate-900">Muito texto, pouca hierarquia e aparência improvisada.</p>
                </figcaption>
              </figure>
              <figure className="overflow-hidden rounded-[1.5rem] border border-cyan-200 bg-cyan-50">
                <img src={depoisPremium} alt="Exemplo ilustrativo de um perfil de viagens com apresentação organizada" loading="lazy" className="aspect-square w-full object-cover" />
                <figcaption className="p-6">
                  <p className="text-sm font-black uppercase tracking-[0.16em] text-cyan-800">Com uma estrutura profissional</p>
                  <p className="mt-2 text-lg font-bold text-slate-900">Informação organizada, identidade consistente e leitura mais simples.</p>
                </figcaption>
              </figure>
            </div>
            <p className="mt-4 text-center text-sm text-slate-500">Imagens ilustrativas para demonstrar a diferença de apresentação.</p>
          </div>
        </section>

        <section className="border-y border-slate-200 bg-[#F7F8FA] py-16 md:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-700">Comparação honesta</p>
              <h2 className="mt-4 text-3xl font-black leading-tight tracking-tight md:text-5xl">
                Canva, designer e Fábrica resolvem problemas diferentes.
              </h2>
              <p className="mt-5 text-lg leading-relaxed text-slate-600">
                A Fábrica não substitui criatividade nem estratégia. Ela reduz o trabalho repetitivo de transformar um pacote em material de divulgação.
              </p>
            </div>
            <div className="mt-10 overflow-x-auto rounded-[1.5rem] border border-slate-200 bg-white shadow-[0_24px_60px_-36px_rgba(15,23,42,0.25)]">
              <div className="min-w-[860px]">
                <div className="grid grid-cols-[1.15fr_1fr_1fr_1.1fr] bg-[#0B1324] text-white">
                  {['Na prática', 'Fazendo no Canva', 'Contratando designer', 'Fábrica de Anúncios'].map((label) => (
                    <div key={label} className="border-r border-white/10 p-5 text-sm font-black last:border-0">{label}</div>
                  ))}
                </div>
                {comparisonRows.map((row) => (
                  <div key={row[0]} className="grid grid-cols-[1.15fr_1fr_1fr_1.1fr] border-t border-slate-200 text-sm">
                    {row.map((cell, index) => (
                      <div key={cell} className={`border-r border-slate-200 p-5 leading-relaxed last:border-0 ${index === 0 ? 'font-black text-slate-900' : index === 3 ? 'bg-cyan-50 font-bold text-cyan-950' : 'text-slate-600'}`}>
                        {cell}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
            <p className="mt-4 text-sm text-slate-500 md:hidden">Deslize a tabela para o lado para comparar todas as opções.</p>
          </div>
        </section>

        <section className="bg-white py-16 md:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid items-center gap-10 lg:grid-cols-[0.72fr_1.28fr]">
              <div className="overflow-hidden rounded-[1.5rem] bg-[#0B1324] p-3">
                <img src={lucasPortrait} alt="Lucas Ferrari, criador do Canva Viagem" loading="lazy" className="aspect-[4/5] w-full rounded-[1.1rem] object-cover" />
              </div>
              <div>
                <p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-700">Quem está por trás</p>
                <h2 className="mt-4 text-3xl font-black leading-tight tracking-tight md:text-5xl">
                  A ferramenta nasceu dentro da rotina de agências de viagens.
                </h2>
                <p className="mt-5 text-lg leading-relaxed text-slate-600">
                  Antes de criar o Canva Viagem, Lucas Ferrari trabalhou com campanhas de tráfego pago para mais de 40 agências no Brasil. O mesmo problema aparecia repetidamente: bons pacotes chegavam ao mercado com divulgação improvisada ou atrasada.
                </p>
                <p className="mt-4 text-lg leading-relaxed text-slate-600">
                  A Fábrica foi criada para encurtar esse caminho — da informação recebida da operadora até o material que a agência consegue publicar.
                </p>
                <div className="mt-7 grid grid-cols-2 gap-4 border-t border-slate-200 pt-6 sm:grid-cols-3">
                  <div><p className="text-2xl font-black text-cyan-800">40+</p><p className="text-sm text-slate-500">agências atendidas</p></div>
                  <div><p className="text-2xl font-black text-cyan-800">Brasil</p><p className="text-sm text-slate-500">experiência prática</p></div>
                  <div className="col-span-2 sm:col-span-1"><p className="text-2xl font-black text-cyan-800">Turismo</p><p className="text-sm text-slate-500">foco da plataforma</p></div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="border-y border-slate-200 bg-[#EEF3F6] py-16 md:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-10 max-w-3xl">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-700">Mensagens recebidas</p>
              <h2 className="mt-4 text-3xl font-black leading-tight tracking-tight md:text-5xl">
                Resultados relatados por quem colocou anúncios e IA em prática.
              </h2>
              <p className="mt-5 text-lg leading-relaxed text-slate-600">
                As identificações foram preservadas. Os prints são apresentados como recebidos, sem transformar resultados individuais em promessa.
              </p>
            </div>
            <div className="flex snap-x gap-5 overflow-x-auto pb-5 md:grid md:grid-cols-3 md:overflow-visible">
              {proofImages.map((proof) => (
                <figure key={proof.title} className="w-[82vw] max-w-sm shrink-0 snap-center overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white shadow-[0_20px_50px_-35px_rgba(15,23,42,0.3)] md:w-auto md:max-w-none">
                  <img src={proof.image} alt={`Print de WhatsApp: ${proof.title}`} loading="lazy" className="aspect-square w-full object-cover" />
                  <figcaption className="p-5">
                    <p className="font-black text-slate-950">{proof.title}</p>
                    <p className="mt-1 text-sm leading-relaxed text-slate-500">{proof.description}</p>
                  </figcaption>
                </figure>
              ))}
            </div>
            <p className="mt-5 text-sm leading-relaxed text-slate-500">
              Resultados dependem de oferta, investimento, público, atendimento e execução. O Canva Viagem não garante vendas.
            </p>
          </div>
        </section>

        <section className="bg-white py-16 md:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
              <div className="rounded-[1.75rem] bg-[#0B1324] p-7 text-white md:p-10">
                <p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-300">O que você veio buscar</p>
                <h2 className="mt-4 text-3xl font-black tracking-tight md:text-4xl">Fábrica de Anúncios</h2>
                <p className="mt-4 max-w-2xl text-lg leading-relaxed text-slate-300">
                  Uma forma mais rápida de transformar informações do pacote em materiais de divulgação com aparência profissional.
                </p>
                <div className="mt-8 grid gap-4 sm:grid-cols-2">
                  {[
                    [ImageIcon, "Peças para Feed e Stories"],
                    [Clock3, "Processo guiado e mais rápido"],
                    [Palette, "Identidade da sua agência"],
                    [Sparkles, "Modelos focados em viagens"],
                  ].map(([Icon, label]) => {
                    const ItemIcon = Icon as typeof ImageIcon;
                    return (
                      <div key={label as string} className="flex items-center gap-3 border-t border-white/10 pt-4">
                        <ItemIcon className="h-5 w-5 shrink-0 text-cyan-300" />
                        <span className="font-bold text-slate-100">{label as string}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="rounded-[1.75rem] border border-slate-200 bg-[#F7F8FA] p-7 md:p-10">
                <p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-700">Também incluído no Elite</p>
                <h3 className="mt-4 text-2xl font-black text-slate-950">Ferramentas complementares</h3>
                <p className="mt-3 leading-relaxed text-slate-600">Elas ampliam a plataforma, mas não mudam a promessa desta página: criar a divulgação do seu pacote.</p>
                <ul className="mt-6 space-y-3 text-slate-700">
                  {["Criador de carrosséis", "Legendas e textos de oferta", "Biblioteca de Reels e artes", "Construtor de sites", "CRM para organizar interessados"].map((item) => (
                    <li key={item} className="flex items-start gap-3"><CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-cyan-700" /><span className="font-semibold">{item}</span></li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section id="planos" className="scroll-mt-20 bg-[#0B1324] py-16 text-white md:py-24">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl text-center">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-300">Use um pacote real durante o teste</p>
              <h2 className="mt-4 text-3xl font-black leading-tight tracking-tight md:text-5xl">Escolha apenas por quanto tempo quer acessar.</h2>
              <p className="mt-5 text-lg leading-relaxed text-slate-300">Todos os planos liberam a mesma plataforma Elite. Os três primeiros dias são gratuitos e nada é cobrado hoje.</p>
            </div>

            <div className="mt-12 overflow-hidden rounded-[2rem] border border-cyan-300/25 bg-white text-slate-950 shadow-[0_28px_80px_-38px_rgba(8,145,178,0.7)]">
              <div className="grid gap-8 p-7 md:grid-cols-[0.9fr_1.1fr] md:p-10">
                <div>
                  <div className="inline-flex rounded-full bg-cyan-100 px-3 py-1 text-xs font-black uppercase tracking-[0.15em] text-cyan-900">Melhor custo mensal</div>
                  <h3 className="mt-5 text-2xl font-black">{planDetails.annual.name}</h3>
                  <div className="mt-3 flex items-end gap-2">
                    <span className="text-5xl font-black tracking-tight">{planDetails.annual.price}</span>
                    <span className="pb-2 font-semibold text-slate-500">{planDetails.annual.suffix}</span>
                  </div>
                  <p className="mt-2 text-sm font-semibold text-slate-600">{planDetails.annual.charge}</p>
                  <button
                    type="button"
                    disabled={checkoutLoading !== null}
                    onClick={() => startCheckout(planDetails.annual.cycle, planDetails.annual.value)}
                    className="mt-7 inline-flex min-h-14 w-full items-center justify-center gap-2 rounded-xl bg-cyan-700 px-6 font-black text-white transition hover:bg-cyan-800 active:scale-[0.98] disabled:cursor-wait disabled:opacity-70"
                  >
                    {checkoutLoading === "annual" ? "Abrindo checkout..." : "Testar a Fábrica por 3 dias"}
                    <ArrowRight className="h-5 w-5" />
                  </button>
                </div>
                <div className="grid content-center gap-3 border-t border-slate-200 pt-7 md:border-l md:border-t-0 md:pl-9 md:pt-0">
                  {["Fábrica de Anúncios para Feed e Stories", "Logo, cores e dados da sua agência", "Ferramentas complementares da plataforma Elite", "Suporte pelo WhatsApp", "Cancelamento online antes da cobrança"].map((feature) => (
                    <div key={feature} className="flex items-start gap-3">
                      <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-cyan-700" />
                      <span className="font-semibold text-slate-700">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-5 grid gap-5 md:grid-cols-2">
              {[planDetails.monthly, planDetails.semiannual].map((plan) => (
                <div key={plan.cycle} className="rounded-[1.5rem] border border-white/10 bg-white/5 p-6">
                  <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
                    <div>
                      <h3 className="text-xl font-black">{plan.name}</h3>
                      <p className="mt-2 text-3xl font-black">{plan.price} <span className="text-base font-semibold text-slate-400">{plan.suffix}</span></p>
                      <p className="mt-1 text-sm text-slate-400">{plan.charge}</p>
                    </div>
                    <button
                      type="button"
                      disabled={checkoutLoading !== null}
                      onClick={() => startCheckout(plan.cycle, plan.value)}
                      className="inline-flex min-h-12 shrink-0 items-center justify-center rounded-xl border border-white/20 bg-white px-5 font-black text-slate-950 transition hover:bg-slate-100 active:scale-[0.98] disabled:cursor-wait disabled:opacity-70"
                    >
                      {checkoutLoading === plan.cycle ? "Abrindo..." : "Escolher este plano"}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 grid gap-4 border-t border-white/10 pt-7 text-sm text-slate-300 sm:grid-cols-3">
              <div className="flex items-start gap-3"><ShieldCheck className="h-5 w-5 shrink-0 text-cyan-300" /><span>Pagamento processado com segurança pela Stripe.</span></div>
              <div className="flex items-start gap-3"><Clock3 className="h-5 w-5 shrink-0 text-cyan-300" /><span>Primeira cobrança somente após os três dias.</span></div>
              <div className="flex items-start gap-3"><MessageCircle className="h-5 w-5 shrink-0 text-cyan-300" /><span>Suporte pelo WhatsApp se precisar de orientação.</span></div>
            </div>
          </div>
        </section>

        <section className="bg-white py-16 md:py-24">
          <div className="mx-auto grid max-w-6xl gap-10 px-4 sm:px-6 lg:grid-cols-[0.7fr_1.3fr] lg:px-8">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-700">Antes de colocar o cartão</p>
              <h2 className="mt-4 text-3xl font-black leading-tight tracking-tight md:text-5xl">Perguntas de quem chegou aqui pela primeira vez.</h2>
              <p className="mt-5 leading-relaxed text-slate-600">Sem esconder as limitações e sem prometer o que uma ferramenta não pode controlar.</p>
              <a href={supportWhatsAppUrl} target="_blank" rel="noopener noreferrer" className="mt-7 inline-flex min-h-12 items-center gap-2 rounded-xl border border-slate-300 px-5 font-black text-slate-800 transition hover:border-cyan-700 hover:text-cyan-800">
                <MessageCircle className="h-5 w-5" />
                Tirar dúvida no WhatsApp
              </a>
            </div>
            <div className="divide-y divide-slate-200 border-y border-slate-200">
              {faqItems.map((item, index) => (
                <div key={item.question}>
                  <button
                    type="button"
                    onClick={() => setOpenFaq(openFaq === index ? null : index)}
                    className="flex w-full items-center justify-between gap-5 py-5 text-left font-black text-slate-950"
                    aria-expanded={openFaq === index}
                  >
                    <span>{item.question}</span>
                    <ChevronDown className={`h-5 w-5 shrink-0 text-cyan-700 transition-transform ${openFaq === index ? "rotate-180" : ""}`} />
                  </button>
                  {openFaq === index && <p className="max-w-3xl pb-6 pr-8 leading-relaxed text-slate-600">{item.answer}</p>}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="border-t border-slate-200 bg-[#DCEEF2] py-16 md:py-20">
          <div className="mx-auto grid max-w-6xl items-center gap-8 px-4 sm:px-6 md:grid-cols-[1fr_auto] lg:px-8">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-800">O motivo para começar agora é simples</p>
              <h2 className="mt-4 max-w-3xl text-3xl font-black leading-tight tracking-tight text-slate-950 md:text-5xl">
                Use o próximo pacote que chegar como seu teste real.
              </h2>
              <p className="mt-4 max-w-2xl text-lg leading-relaxed text-slate-700">Em vez de imaginar se funciona para sua agência, coloque uma oferta real na Fábrica e avalie o resultado durante os três dias gratuitos.</p>
            </div>
            <button
              type="button"
              onClick={() => scrollToPlans("final")}
              className="inline-flex min-h-14 items-center justify-center gap-2 rounded-xl bg-[#0B1324] px-7 font-black text-white transition hover:bg-slate-800 active:scale-[0.98]"
            >
              Criar meu primeiro anúncio
              <ArrowRight className="h-5 w-5" />
            </button>
          </div>
        </section>
      </main>

      <footer className="bg-[#08101E] pb-24 pt-10 text-slate-400 md:py-10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-5 px-4 text-center text-sm sm:px-6 md:flex-row md:text-left lg:px-8">
          <div>
            <img src={logoImage} alt="Canva Viagem" className="mx-auto h-8 w-auto brightness-0 invert md:mx-0" />
            <p className="mt-3">Ferramentas de marketing para agências de viagens.</p>
          </div>
          <div className="flex flex-wrap justify-center gap-5">
            <a href="/termos" className="hover:text-white">Termos</a>
            <a href="/privacidade" className="hover:text-white">Privacidade</a>
            <a href={supportWhatsAppUrl} target="_blank" rel="noopener noreferrer" className="hover:text-white">Falar com o suporte</a>
          </div>
        </div>
      </footer>

      <button
        type="button"
        onClick={() => scrollToPlans("mobile_sticky")}
        className="fixed bottom-3 left-3 right-3 z-30 inline-flex min-h-14 items-center justify-center gap-2 rounded-xl bg-cyan-700 px-5 font-black text-white shadow-[0_20px_40px_-20px_rgba(8,145,178,0.9)] active:scale-[0.98] md:hidden"
      >
        Testar por 3 dias
        <ArrowRight className="h-5 w-5" />
      </button>

      {exitOfferOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="exit-title">
          <div ref={exitDialogRef} className="relative w-full max-w-lg rounded-[1.75rem] bg-white p-7 shadow-2xl md:p-9">
            <button
              type="button"
              onClick={() => {
                setExitOfferOpen(false);
                recordEvent("exit_popup_dismissed", { method: "button" });
              }}
              className="absolute right-4 top-4 rounded-full border border-slate-200 p-2 text-slate-500 hover:bg-slate-100"
              aria-label="Fechar"
            >
              <X className="h-5 w-5" />
            </button>
            <BadgeCheck className="h-10 w-10 text-cyan-700" />
            <h2 id="exit-title" className="mt-5 pr-8 text-3xl font-black leading-tight tracking-tight text-slate-950">Ainda está em dúvida se serve para sua agência?</h2>
            <p className="mt-4 leading-relaxed text-slate-600">Escolha um pacote real, teste a criação durante três dias e avalie o processo com seus próprios olhos. Nada é cobrado hoje.</p>
            <button
              type="button"
              onClick={() => scrollToPlans("exit_popup")}
              className="mt-6 inline-flex min-h-[52px] w-full items-center justify-center gap-2 rounded-xl bg-cyan-700 px-6 font-black text-white hover:bg-cyan-800 active:scale-[0.98]"
            >
              Ver planos e testar
              <ArrowRight className="h-5 w-5" />
            </button>
            <p className="mt-3 text-center text-xs text-slate-500">Cartão solicitado. Cancele online antes do fim do teste para evitar a cobrança.</p>
          </div>
        </div>
      )}
    </div>
  );
}
