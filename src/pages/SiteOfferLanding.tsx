import { useCallback, useEffect, useRef, useState } from "react";
import { Helmet } from "react-helmet-async";
import {
  ArrowRight,
  BadgeCheck,
  Check,
  CheckCircle2,
  ChevronDown,
  Clock3,
  Globe2,
  LayoutTemplate,
  Link2,
  MessageCircle,
  Monitor,
  MousePointerClick,
  PanelsTopLeft,
  ShieldCheck,
  Smartphone,
  X,
} from "lucide-react";
import logoImage from "@/assets/logo.png";
import showcaseLandingPages from "@/assets/images/showcase-landing-pages.png";
import paginaRoteiro from "@/assets/pagina_venda_roteiro.png";
import lucasPortrait from "@/assets/lucas-ferrari-portrait.webp";
import { trackEvent } from "@/hooks/useAnalyticsEvents";
import { ELITE_OFFER } from "@/lib/eliteOffer";
import { siteOfferDemos } from "@/lib/site-offer-demos";
import { SITE_TEMPLATE_CATALOG } from "@/lib/site-template-catalog";

type BillingCycle = "monthly" | "semiannual" | "annual";
type PreviewMode = "desktop" | "mobile";

const metaPixelId = "916689227676142";
const supportWhatsAppUrl =
  "https://wa.me/5585998458995?text=Ol%C3%A1%2C%20quero%20entender%20melhor%20o%20criador%20de%20sites%20do%20Canva%20Viagem";

const secureCheckoutPath = (cycle: BillingCycle) => {
  const params = new URLSearchParams({
    checkout: cycle,
    upgrade: "site_publish",
    returnTo: "/fabrica/site",
    offer: "site",
  });
  return `/inicio?${params.toString()}`;
};

const faqItems = [
  {
    question: "É um site de verdade ou apenas uma imagem pronta?",
    answer:
      "É um site navegável. Você cadastra sua agência, adiciona seus pacotes, personaliza a apresentação e publica um endereço que pode ser enviado aos clientes.",
  },
  {
    question: "Qual endereço meu site recebe? Posso usar domínio próprio?",
    answer:
      "A publicação usa um endereço dentro do domínio Canva Viagem, como suaagencia.canvaviagem.com. Esta oferta não promete conexão com domínio próprio. Se isso for indispensável para você, fale com o suporte antes de contratar.",
  },
  {
    question: "Preciso saber programação ou contratar hospedagem?",
    answer:
      "Não. A estrutura e a publicação são feitas dentro do Canva Viagem. Você trabalha preenchendo as informações da sua agência e dos pacotes, sem configurar código ou comprar hospedagem separadamente.",
  },
  {
    question: "Consigo editar o site depois de publicar?",
    answer:
      "Sim. Você pode atualizar as informações, os pacotes e a apresentação e publicar novamente quando precisar.",
  },
  {
    question: "Como os pedidos de orçamento chegam até mim?",
    answer:
      "O site pode apresentar formulários e botões de WhatsApp. Os interessados informam os dados e seguem para o contato da agência; os leads também podem ser acompanhados na estrutura da plataforma.",
  },
  {
    question: "O site aparece bem no celular?",
    answer:
      "Sim. Os sites são preparados para navegação no celular e no computador. Recomendamos sempre revisar textos, imagens e botões nos dois formatos antes de divulgar.",
  },
  {
    question: "O site garante que vou receber pedidos ou vender viagens?",
    answer:
      "Não. Nenhum site sério garante vendas. Ele organiza sua apresentação, facilita o acesso aos pacotes e cria caminhos para orçamento. Oferta, divulgação, tráfego, atendimento e follow-up continuam influenciando o resultado.",
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

const comparisonRows = [
  ["Começar", "Configurar tema, páginas e plugins", "Enviar briefing e aguardar", "Preencher a estrutura da agência"],
  ["Foco em viagens", "Ferramenta para qualquer negócio", "Depende do profissional", "Pacotes, orçamento e WhatsApp"],
  ["Publicação", "Exige configuração de hospedagem", "Depende da entrega", "Endereço online dentro do Canva Viagem"],
  ["Atualizações", "Você aprende e faz sozinho", "Solicita novas alterações", "Edita e publica novamente"],
  ["Ferramentas extras", "Normalmente separadas", "Cobrança conforme o projeto", "Anúncios, conteúdo e CRM no Elite"],
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

export default function SiteOfferLanding() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [checkoutLoading, setCheckoutLoading] = useState<BillingCycle | null>(null);
  const [exitOfferOpen, setExitOfferOpen] = useState(false);
  const [activeDemoId, setActiveDemoId] = useState(siteOfferDemos[0].id);
  const [previewMode, setPreviewMode] = useState<PreviewMode>("desktop");
  const pageTrackedRef = useRef(false);
  const exitDialogRef = useRef<HTMLDivElement>(null);
  const activeDemo = siteOfferDemos.find((demo) => demo.id === activeDemoId) || siteOfferDemos[0];

  const recordEvent = useCallback((eventType: string, data: Record<string, unknown> = {}) => {
    return trackEvent(eventType, {
      offer_variant: "site_v2",
      landing_path: "/site-para-agencia-de-viagens",
      feature: "site_publish",
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
    const storageKey = "cv:exit-offer-shown:site-v2";
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

  const startCheckout = async (cycle: BillingCycle, value: number) => {
    setCheckoutLoading(cycle);
    const analyticsRequest = Promise.all([
      recordEvent("plan_selected", { billing_cycle: cycle, value }),
      recordEvent("checkout_started", { billing_cycle: cycle, value }),
    ]);
    const fbq = (window as Window & { fbq?: (...args: unknown[]) => void }).fbq;
    fbq?.("trackSingle", metaPixelId, "InitiateCheckout", {
      value,
      currency: "BRL",
      content_name: "Canva Viagem - Site Pronto da Agência",
      content_category: `landing_site_${cycle}`,
    });
    await Promise.race([
      analyticsRequest,
      new Promise<void>((resolve) => window.setTimeout(resolve, 1200)),
    ]);
    window.location.assign(secureCheckoutPath(cycle));
  };

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#F7F8FA] text-slate-950" style={{ fontFamily: "Outfit, sans-serif" }}>
      <Helmet>
        <title>Crie o site da sua agência de viagens | Canva Viagem</title>
        <meta
          name="description"
          content="Crie e publique o site profissional da sua agência de viagens sem programador, com pacotes, orçamento e contato pelo WhatsApp."
        />
        <link rel="canonical" href="https://canvaviagem.com/site-para-agencia-de-viagens" />
        <meta property="og:title" content="Crie o site profissional da sua agência de viagens" />
        <meta
          property="og:description"
          content="Cadastre sua agência, adicione os pacotes e publique uma apresentação profissional sem programador ou hospedagem separada."
        />
        <meta property="og:url" content="https://canvaviagem.com/site-para-agencia-de-viagens" />
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
                <Globe2 className="h-4 w-4" />
                Site profissional para agências de viagens
              </div>
              <h1 className="max-w-[14ch] text-4xl font-black leading-[0.98] tracking-[-0.045em] sm:text-5xl lg:text-6xl">
                Crie o site profissional da sua agência sem programador.
              </h1>
              <p className="mt-6 max-w-[62ch] text-lg leading-relaxed text-slate-300 sm:text-xl">
                Cadastre sua marca, adicione seus pacotes e publique um endereço para apresentar a agência, receber pedidos de orçamento e levar o cliente ao WhatsApp.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={() => scrollToPlans("hero")}
                  className="inline-flex min-h-14 items-center justify-center gap-2 rounded-xl bg-cyan-600 px-7 text-base font-black text-white transition hover:bg-cyan-500 active:scale-[0.98]"
                >
                  Publicar o site da minha agência
                  <ArrowRight className="h-5 w-5" />
                </button>
                <a
                  href="#demonstracao"
                  className="inline-flex min-h-14 items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/5 px-7 text-base font-bold text-white transition hover:bg-white/10 active:scale-[0.98]"
                >
                  <Globe2 className="h-5 w-5" />
                  Ver um site real
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
                  src={showcaseLandingPages}
                  alt="Exemplos de sites para agências de viagens criados no Canva Viagem"
                  className="aspect-[4/3] w-full rounded-[1.4rem] object-cover"
                />
              </div>
              <div className="mt-4 grid grid-cols-3 gap-2 sm:absolute sm:-bottom-6 sm:left-6 sm:right-6 sm:mt-0">
                {[
                  ["1", "Cadastre a agência"],
                  ["2", "Adicione pacotes"],
                  ["3", "Publique o endereço"],
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
              ["Feito para turismo", "Estrutura pensada para vender viagens"],
              ["Celular e computador", "Experiência adaptada aos dois formatos"],
              ["Pedidos de orçamento", "Formulários e contato pelo WhatsApp"],
              ["Publicação incluída", "Sem contratar hospedagem separada"],
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
              <p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-700">O risco de parecer improvisado</p>
              <h2 className="mt-4 text-3xl font-black leading-tight tracking-tight text-slate-950 md:text-5xl">
                Antes de pedir orçamento, o viajante precisa acreditar que encontrou uma agência real.
              </h2>
              <p className="mt-5 text-lg leading-relaxed text-slate-600">
                Quando sua agência existe apenas em posts e conversas, o cliente precisa juntar as peças sozinho: quem vocês são, quais viagens vendem e como pedir uma proposta.
              </p>
              <p className="mt-4 border-l-4 border-cyan-700 pl-5 text-lg font-bold leading-relaxed text-slate-800">
                O site não substitui Instagram nem atendimento. Ele dá ao viajante um endereço único para conhecer sua agência e avançar com mais segurança.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {[
                ["Informação espalhada", "Perfil, destaques e conversas antigas obrigam o cliente a procurar o que precisa."],
                ["Pacotes se perdem no feed", "Uma boa oferta desaparece entre publicações novas e conteúdos antigos."],
                ["O WhatsApp repete tudo", "Sua equipe explica apresentação, condições e contatos para cada novo interessado."],
                ["Falta um endereço profissional", "Sem uma página estável, a agência pode parecer menor ou menos organizada do que realmente é."],
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
                <p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-700">3 demonstrações oficiais para explorar</p>
                <h2 className="mt-4 max-w-[20ch] text-3xl font-black leading-tight tracking-tight md:text-5xl">
                  Troque o tipo de agência. Veja o site mudar de verdade.
                </h2>
              </div>
              <p className="max-w-md text-base leading-relaxed text-slate-600 md:text-lg">
                Cada demonstração usa um modelo real do construtor, uma marca própria e três pacotes completos com fotos, valores e detalhes.
              </p>
            </div>

            <div className="mt-8 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm leading-relaxed text-amber-950">
              <strong>Transparência:</strong> estas três agências, logos, pacotes e valores são fictícios. Foram criados como modelos oficiais para mostrar o que a plataforma consegue montar — não são clientes nem resultados alegados.
            </div>

            <div className="mt-8 grid gap-3 md:grid-cols-3">
              {siteOfferDemos.map((demo) => {
                const isActive = demo.id === activeDemo.id;
                return (
                  <button
                    key={demo.id}
                    type="button"
                    onClick={() => {
                      setActiveDemoId(demo.id);
                      recordEvent("official_demo_selected", { demo: demo.id, template: demo.templateId });
                    }}
                    aria-pressed={isActive}
                    className={`min-h-[118px] rounded-[1.25rem] border p-5 text-left transition ${
                      isActive
                        ? "border-slate-950 bg-[#0B1324] text-white shadow-[0_18px_45px_-28px_rgba(15,23,42,0.65)]"
                        : "border-slate-300 bg-white text-slate-950 hover:border-cyan-500"
                    }`}
                  >
                    <span className={`text-xs font-black uppercase tracking-[0.16em] ${isActive ? "text-cyan-300" : "text-cyan-700"}`}>
                      Modelo {demo.templateLabel}
                    </span>
                    <span className="mt-2 block text-lg font-black">{demo.agencyName}</span>
                    <span className={`mt-1 block text-sm ${isActive ? "text-slate-300" : "text-slate-500"}`}>{demo.category}</span>
                  </button>
                );
              })}
            </div>

            <div className="mt-5 rounded-[1.75rem] border border-slate-300 bg-[#0B1324] p-3 shadow-[0_28px_70px_-35px_rgba(15,23,42,0.7)] sm:p-5">
              <div className="mb-4 flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/5 p-3 text-white sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <p className="truncate font-black">{activeDemo.agencyName}</p>
                  <p className="text-xs text-slate-400">Modelo {activeDemo.templateLabel} • {activeDemo.packageNames.length} pacotes preenchidos</p>
                </div>
                <div className="flex rounded-xl border border-white/10 bg-black/20 p-1" aria-label="Formato da demonstração">
                  <button
                    type="button"
                    onClick={() => setPreviewMode("desktop")}
                    className={`flex min-h-10 flex-1 items-center justify-center gap-2 rounded-lg px-4 text-xs font-black transition ${previewMode === "desktop" ? "bg-white text-slate-950" : "text-slate-300 hover:text-white"}`}
                    aria-pressed={previewMode === "desktop"}
                  >
                    <Monitor className="h-4 w-4" /> Computador
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewMode("mobile")}
                    className={`flex min-h-10 flex-1 items-center justify-center gap-2 rounded-lg px-4 text-xs font-black transition ${previewMode === "mobile" ? "bg-white text-slate-950" : "text-slate-300 hover:text-white"}`}
                    aria-pressed={previewMode === "mobile"}
                  >
                    <Smartphone className="h-4 w-4" /> Celular
                  </button>
                </div>
              </div>

              <div className={`mx-auto transition-[max-width] duration-300 ${previewMode === "mobile" ? "max-w-[430px]" : "max-w-none"}`}>
                <div className={`overflow-hidden bg-white ${previewMode === "mobile" ? "rounded-[2.25rem] border-[10px] border-slate-800 shadow-2xl" : "rounded-2xl border border-slate-700"}`}>
                  <div className={`flex items-center gap-2 border-b border-slate-200 bg-slate-100 px-4 py-3 ${previewMode === "mobile" ? "justify-center" : ""}`}>
                    {previewMode === "desktop" && (
                      <>
                        <span className="h-2.5 w-2.5 rounded-full bg-rose-400" />
                        <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
                        <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                      </>
                    )}
                    <span className="truncate rounded-md bg-white px-3 py-1 text-xs font-semibold text-slate-500">
                      modelo-{activeDemo.id}.canvaviagem.com
                    </span>
                  </div>
                  <iframe
                    key={`${activeDemo.id}-${previewMode}`}
                    className={`w-full bg-white ${previewMode === "mobile" ? "h-[800px]" : "h-[690px] md:h-[780px]"}`}
                    srcDoc={activeDemo.html}
                    title={`Modelo demonstrativo ${activeDemo.agencyName} no formato ${previewMode === "mobile" ? "celular" : "computador"}`}
                    loading="lazy"
                    sandbox="allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox allow-top-navigation-by-user-activation"
                  />
                </div>
              </div>

              <div className="mt-4 grid gap-2 text-xs text-slate-300 sm:grid-cols-3">
                {activeDemo.packageNames.map((packageName) => (
                  <span key={packageName} className="rounded-xl border border-white/10 bg-white/5 px-3 py-3 font-semibold">✓ {packageName}</span>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="bg-white py-16 md:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-10 max-w-3xl">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-700">O que o cliente encontra</p>
              <h2 className="mt-4 text-3xl font-black leading-tight tracking-tight md:text-5xl">
                Sua agência, seus pacotes e um caminho claro para pedir orçamento.
              </h2>
              <p className="mt-5 text-lg leading-relaxed text-slate-600">
                A estrutura organiza a apresentação da agência e cria páginas individuais para as viagens que você quer divulgar.
              </p>
            </div>
            <div className="grid gap-6 md:grid-cols-2">
              <figure className="overflow-hidden rounded-[1.5rem] border border-slate-200 bg-slate-50">
                <img src={showcaseLandingPages} alt="Visão geral de um site de agência criado no Canva Viagem" loading="lazy" className="aspect-[4/3] w-full object-cover" />
                <figcaption className="p-6">
                  <p className="text-sm font-black uppercase tracking-[0.16em] text-cyan-800">Página da agência</p>
                  <p className="mt-2 text-lg font-bold text-slate-900">Marca, contatos, destinos e apresentação reunidos em um só lugar.</p>
                </figcaption>
              </figure>
              <figure className="overflow-hidden rounded-[1.5rem] border border-slate-200 bg-slate-50">
                <img src={paginaRoteiro} alt="Exemplo de página individual de pacote de Paris" loading="lazy" className="aspect-[4/3] w-full object-contain p-4" />
                <figcaption className="p-6">
                  <p className="text-sm font-black uppercase tracking-[0.16em] text-cyan-800">Página do pacote</p>
                  <p className="mt-2 text-lg font-bold text-slate-900">Detalhes da viagem, condições e botões para o cliente pedir orçamento.</p>
                </figcaption>
              </figure>
            </div>
            <p className="mt-4 text-center text-sm text-slate-500">Exemplos visuais da estrutura disponível; textos, fotos e pacotes variam conforme cada agência.</p>
          </div>
        </section>

        <section className="border-y border-slate-200 bg-[#F7F8FA] py-16 md:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-700">Comparação honesta</p>
              <h2 className="mt-4 text-3xl font-black leading-tight tracking-tight md:text-5xl">
                Instagram, site tradicional e Canva Viagem resolvem níveis diferentes do problema.
              </h2>
              <p className="mt-5 text-lg leading-relaxed text-slate-600">
                O Canva Viagem não substitui divulgação, domínio próprio nem um projeto totalmente sob medida. Ele entrega uma estrutura pronta para turismo e um endereço publicado sem contratar programador ou hospedagem separada.
              </p>
            </div>
            <div className="mt-10 overflow-x-auto rounded-[1.5rem] border border-slate-200 bg-white shadow-[0_24px_60px_-36px_rgba(15,23,42,0.25)]">
              <div className="min-w-[860px]">
                <div className="grid grid-cols-[1.15fr_1fr_1fr_1.1fr] bg-[#0B1324] text-white">
                  {['Na prática', 'Wix ou WordPress', 'Programador ou agência', 'Canva Viagem'].map((label) => (
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
                  Antes de criar o Canva Viagem, Lucas Ferrari trabalhou com campanhas de tráfego pago para mais de 40 agências no Brasil. O mesmo problema aparecia repetidamente: muitas dependiam apenas do Instagram e do WhatsApp ou precisavam contratar um projeto caro para ter presença própria na internet.
                </p>
                <p className="mt-4 text-lg leading-relaxed text-slate-600">
                  O construtor de sites foi criado para encurtar esse caminho: a agência preenche suas informações, organiza os pacotes e publica uma apresentação profissional sem começar um projeto técnico do zero.
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
            <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-700">Não é um site engessado</p>
                <h2 className="mt-4 text-3xl font-black leading-tight tracking-tight md:text-5xl">
                  Sua agência escolhe entre 6 modelos de site.
                </h2>
              </div>
              <p className="text-lg leading-relaxed text-slate-600">
                Cada modelo dá prioridade a um jeito diferente de vender viagens. Você escolhe a estrutura, troca a identidade visual e preenche com os seus próprios pacotes.
              </p>
            </div>
            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {SITE_TEMPLATE_CATALOG.map((template, index) => {
                const isShownAbove = siteOfferDemos.some((demo) => demo.templateId === template.id);
                return (
                  <div key={template.id} className="rounded-[1.35rem] border border-slate-200 bg-white p-6 shadow-[0_18px_45px_-36px_rgba(15,23,42,0.35)]">
                    <div className="flex items-start justify-between gap-4">
                      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-100 font-mono text-sm font-black text-cyan-900">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      {isShownAbove && <span className="rounded-full bg-emerald-100 px-3 py-1 text-[10px] font-black uppercase tracking-wide text-emerald-800">Demo acima</span>}
                    </div>
                    <h3 className="mt-5 text-xl font-black text-slate-950">{template.copy.pt.label}</h3>
                    <p className="mt-1 text-sm font-bold text-cyan-800">{template.copy.pt.audience}</p>
                    <p className="mt-3 leading-relaxed text-slate-600">{template.copy.pt.summary}</p>
                  </div>
                );
              })}
            </div>
            <p className="mt-5 text-sm leading-relaxed text-slate-500">
              As demonstrações acima usam Ofertas, Horizonte e Experiências. Padrão, Expedições e Excursões também estão disponíveis no construtor.
            </p>
          </div>
        </section>

        <section className="bg-white py-16 md:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
              <div className="rounded-[1.75rem] bg-[#0B1324] p-7 text-white md:p-10">
                <p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-300">O que você veio buscar</p>
                <h2 className="mt-4 text-3xl font-black tracking-tight md:text-4xl">Site Pronto da Agência</h2>
                <p className="mt-4 max-w-2xl text-lg leading-relaxed text-slate-300">
                  Uma estrutura editável e responsiva para apresentar sua agência, publicar pacotes e receber pedidos de orçamento em um endereço online.
                </p>
                <div className="mt-8 grid gap-4 sm:grid-cols-2">
                  {[
                    [PanelsTopLeft, "Páginas da agência"],
                    [LayoutTemplate, "Páginas para os pacotes"],
                    [MousePointerClick, "Formulário e WhatsApp"],
                    [Link2, "Endereço publicado"],
                  ].map(([Icon, label]) => {
                    const ItemIcon = Icon as typeof PanelsTopLeft;
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
                <p className="mt-3 leading-relaxed text-slate-600">Elas ampliam a plataforma, mas não mudam a promessa desta página: publicar o site da sua agência.</p>
                <ul className="mt-6 space-y-3 text-slate-700">
                  {["Fábrica de anúncios", "Criador de carrosséis", "Legendas e textos de oferta", "Biblioteca de Reels e artes", "CRM para organizar interessados"].map((item) => (
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
              <p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-300">Publique um site real durante o teste</p>
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
                    data-billing-cycle="annual"
                    disabled={checkoutLoading !== null}
                    onClick={() => startCheckout(planDetails.annual.cycle, planDetails.annual.value)}
                    className="mt-7 inline-flex min-h-14 w-full items-center justify-center gap-2 rounded-xl bg-cyan-700 px-6 font-black text-white transition hover:bg-cyan-800 active:scale-[0.98] disabled:cursor-wait disabled:opacity-70"
                  >
                    {checkoutLoading === "annual" ? "Abrindo checkout..." : "Testar o Site Pronto por 3 dias"}
                    <ArrowRight className="h-5 w-5" />
                  </button>
                </div>
                <div className="grid content-center gap-3 border-t border-slate-200 pt-7 md:border-l md:border-t-0 md:pl-9 md:pt-0">
                  {["Site editável para celular e computador", "Páginas para apresentar seus pacotes", "Formulário de orçamento e botão de WhatsApp", "Endereço publicado dentro do Canva Viagem", "Ferramentas complementares da plataforma Elite", "Suporte e cancelamento online"].map((feature) => (
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
                      data-billing-cycle={plan.cycle}
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
                Use sua própria agência como o teste.
              </h2>
              <p className="mt-4 max-w-2xl text-lg leading-relaxed text-slate-700">Cadastre sua identidade, adicione um pacote real e publique. Durante os três dias gratuitos, você pode avaliar a estrutura com a sua própria marca.</p>
            </div>
            <button
              type="button"
              onClick={() => scrollToPlans("final")}
              className="inline-flex min-h-14 items-center justify-center gap-2 rounded-xl bg-[#0B1324] px-7 font-black text-white transition hover:bg-slate-800 active:scale-[0.98]"
            >
              Publicar o site da minha agência
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
            <h2 id="exit-title" className="mt-5 pr-8 text-3xl font-black leading-tight tracking-tight text-slate-950">Seu site pode estar no ar antes do próximo orçamento.</h2>
            <p className="mt-4 leading-relaxed text-slate-600">Cadastre sua agência, publique um pacote e avalie a experiência durante três dias. Nada é cobrado hoje.</p>
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
