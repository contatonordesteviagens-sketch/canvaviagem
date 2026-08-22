import { useCallback, useEffect, useRef, useState } from "react";
import { Helmet } from "react-helmet-async";
import {
  ArrowRight,
  BadgeCheck,
  CheckCircle2,
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
  ChevronRight,
  SmartphoneNfc,
  Check,
  XCircle,
  Image as ImageIcon
} from "lucide-react";
import logoImage from "@/assets/logo.png";
import showcaseLandingPages from "@/assets/images/showcase-landing-pages.png";
import paginaRoteiro from "@/assets/pagina_venda_roteiro.png";
import lucasPortrait from "@/assets/lucas-ferrari-portrait.webp";
import { trackEvent } from "@/hooks/useAnalyticsEvents";
import { ELITE_OFFER } from "@/lib/eliteOffer";
import { siteOfferDemos } from "@/lib/site-offer-demos";
import { SITE_TEMPLATE_CATALOG } from "@/lib/site-template-catalog";
import { trackMetaEvent } from "@/lib/meta-pixel-sales";

type BillingCycle = "monthly" | "semiannual" | "annual";
type PreviewMode = "desktop" | "mobile";

const supportWhatsAppUrl = "https://wa.me/5585998458995?text=Ol%C3%A1%2C%20quero%20entender%20melhor%20o%20criador%20de%20sites%20do%20Canva%20Viagem";

const checkoutUrlByCycle: Record<BillingCycle, string> = {
  monthly: ELITE_OFFER.monthlyCheckoutUrl,
  semiannual: ELITE_OFFER.semiannualCheckoutUrl,
  annual: ELITE_OFFER.annualCheckoutUrl,
};

const faqItems = [
  {
    question: "É um site de verdade?",
    answer: "É um site navegável. Você cadastra sua agência, adiciona seus pacotes, personaliza a apresentação e publica um endereço online para enviar aos clientes."
  },
  {
    question: "Preciso saber programação?",
    answer: "Não. A estrutura é pronta. Você trabalha apenas preenchendo as informações da agência e dos pacotes no Canva Viagem."
  },
  {
    question: "Preciso contratar hospedagem?",
    answer: "Não. A hospedagem para o funcionamento da plataforma está incluída, sem custo adicional, enquanto a assinatura estiver ativa."
  },
  {
    question: "Qual endereço recebo?",
    answer: "A publicação usa um subdomínio dentro do Canva Viagem, como suaagencia.canvaviagem.com."
  },
  {
    question: "Posso usar domínio próprio?",
    answer: "Nesta versão, a publicação é feita no subdomínio da plataforma. Se domínio próprio for essencial para você, fale com o suporte antes de contratar."
  },
  {
    question: "Posso editar depois?",
    answer: "Sim, sempre que precisar. Basta alterar os pacotes ou informações e clicar em publicar novamente."
  },
  {
    question: "Como chegam os pedidos de orçamento?",
    answer: "O site possui formulários onde o cliente deixa os dados, e botões diretos para o WhatsApp da sua agência."
  },
  {
    question: "Existe WhatsApp?",
    answer: "Sim, o botão flutuante de WhatsApp fica visível na página da agência e dentro das páginas de pacotes."
  },
  {
    question: "Funciona no celular?",
    answer: "Sim, todos os modelos são desenvolvidos com tecnologia mobile-first e se adaptam perfeitamente a celulares e computadores."
  },
  {
    question: "O site garante vendas?",
    answer: "Não. O Canva Viagem fornece a estrutura. Resultados dependem de fatores como divulgação, oferta, atendimento e demanda. Nenhum site sério promete vendas automáticas."
  },
  {
    question: "Quando sou cobrado?",
    answer: "A cobrança ocorre de forma segura através da Stripe, de acordo com o ciclo escolhido. O acesso é liberado logo após a confirmação."
  },
  {
    question: "Como cancelar?",
    answer: "O cancelamento é feito de forma totalmente online no seu painel de cobrança, sem multas ou taxas escondidas."
  },
  {
    question: "Como funciona o suporte?",
    answer: "Atendemos por WhatsApp para orientar sobre o uso do construtor ou resolver problemas técnicos na plataforma."
  }
];

export default function SiteOfferLanding() {
  const [checkoutLoading, setCheckoutLoading] = useState<BillingCycle | null>(null);
  const [activeDemoId, setActiveDemoId] = useState(siteOfferDemos[0].id);
  const [previewMode, setPreviewMode] = useState<PreviewMode>("desktop");
  const [showStickyCTA, setShowStickyCTA] = useState(false);
  const pageTrackedRef = useRef(false);
  const heroRef = useRef<HTMLElement>(null);
  const activeDemo = siteOfferDemos.find((demo) => demo.id === activeDemoId) || siteOfferDemos[0];

  const recordEvent = useCallback((eventType: string, data: Record<string, unknown> = {}) => {
    return trackEvent(eventType, {
      offer_variant: "site_direct_response",
      landing_path: "/site-para-agencia-de-viagens",
      feature: "site_publish",
      ...data,
    });
  }, []);

  useEffect(() => {
    if (pageTrackedRef.current) return;
    pageTrackedRef.current = true;
    recordEvent("landing_viewed");
    trackMetaEvent("ViewContent", {
      content_name: "Canva Viagem - Site para Agência de Viagens",
      content_category: "landing_site",
      content_type: "product",
    });
  }, [recordEvent]);

  useEffect(() => {
    const handleScroll = () => {
      if (!heroRef.current) return;
      const heroBottom = heroRef.current.getBoundingClientRect().bottom;
      setShowStickyCTA(heroBottom < 0);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToPlans = (source: string) => {
    recordEvent("cta_clicked", { source });
    document.getElementById("planos")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const startCheckout = async (cycle: BillingCycle, value: number) => {
    setCheckoutLoading(cycle);
    const analyticsRequest = Promise.all([
      recordEvent("plan_selected", { billing_cycle: cycle, value }),
      recordEvent("checkout_started", { billing_cycle: cycle, value }),
    ]);
    trackMetaEvent("InitiateCheckout", {
      value,
      currency: "BRL",
      content_name: "Canva Viagem - Site Pronto da Agência",
      content_category: `landing_site_${cycle}`,
    });
    await Promise.race([
      analyticsRequest,
      new Promise<void>((resolve) => window.setTimeout(resolve, 1200)),
    ]);
    window.location.assign(checkoutUrlByCycle[cycle]);
  };

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#F7F8FA] text-slate-950" style={{ fontFamily: "Outfit, sans-serif" }}>
      <Helmet>
        <title>Crie o site da sua agência de viagens | Canva Viagem</title>
        <meta
          name="description"
          content="Publique o site profissional da sua agência de viagens sem programador. Escolha um modelo para turismo e adicione pacotes."
        />
        <link rel="canonical" href="https://canvaviagem.com/site-para-agencia-de-viagens" />
        <meta property="og:type" content="website" />
        <meta property="og:locale" content="pt_BR" />
        <meta property="og:title" content="Site para agência de viagens | Canva Viagem" />
        <meta property="og:description" content="Publique um site para sua agência com modelos de turismo, pacotes, formulário de orçamento e WhatsApp." />
        <meta property="og:url" content="https://canvaviagem.com/site-para-agencia-de-viagens" />
        <meta property="og:image" content="https://canvaviagem.com/site-canva-viagem.webp" />
        <meta property="og:image:alt" content="Exemplo de site para agência de viagens criado no Canva Viagem" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Site para agência de viagens | Canva Viagem" />
        <meta name="twitter:description" content="Site com modelos de turismo, pacotes, orçamento e WhatsApp para agências de viagens." />
        <meta name="twitter:image" content="https://canvaviagem.com/site-canva-viagem.webp" />
      </Helmet>

      {/* HEADER */}
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
            Ver planos
          </button>
        </div>
      </header>

      <main>
        {/* 1. HERO */}
        <section ref={heroRef} className="relative overflow-hidden bg-[#0B1324] text-white">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_78%_20%,rgba(8,145,178,0.18),transparent_34%)]" />
          <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-4 py-12 sm:px-6 md:py-16 lg:grid-cols-[1fr_1.1fr] lg:gap-16 lg:px-8 lg:py-20">
            <div className="mx-auto flex max-w-2xl flex-col lg:mx-0">
              <div className="mb-6 self-start inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-4 py-2 text-xs font-extrabold uppercase tracking-[0.18em] text-cyan-200">
                <Globe2 className="h-4 w-4" />
                SITE PROFISSIONAL PARA AGÊNCIAS DE VIAGENS
              </div>

              <h1 className="text-4xl font-black leading-[1.05] tracking-tight sm:text-5xl lg:text-5xl xl:text-6xl">
                Publique o site profissional da sua agência de viagens sem programador.
              </h1>

              <p className="mt-5 text-lg leading-relaxed text-slate-300 sm:text-xl">
                Escolha entre 6 modelos feitos para turismo, adicione sua marca e seus pacotes e publique um site navegável para apresentar sua agência, receber pedidos de orçamento e levar interessados ao WhatsApp.
              </p>

              <div className="relative mt-8 w-full lg:hidden">
                <div className="overflow-hidden rounded-[1.5rem] border border-white/10 bg-white/5 p-2 shadow-[0_20px_50px_-20px_rgba(8,145,178,0.5)]">
                  <img
                    src={showcaseLandingPages}
                    alt="Demonstração do site para agências de viagens"
                    className="w-full rounded-[1rem] object-cover"
                  />
                </div>
              </div>

              <ul className="mt-8 space-y-3 text-base font-medium text-slate-200 sm:text-lg">
                {[
                  "6 modelos feitos para turismo",
                  "Páginas individuais dos pacotes",
                  "Celular e computador",
                  "Formulário de orçamento + WhatsApp",
                  "Publicação incluída",
                  "Edite sempre que precisar"
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle2 className="mt-0.5 h-6 w-6 shrink-0 text-cyan-400" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>

              <div className="mb-4 mt-8 w-max inline-flex items-center rounded-xl border border-slate-700 bg-slate-800/50 px-4 py-2.5">
                <span className="font-medium text-slate-300">
                  A partir de <strong className="ml-1 text-xl text-white">R$40,16/mês</strong> no plano anual
                </span>
              </div>

              <div className="flex w-full flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={() => scrollToPlans("hero")}
                  className="inline-flex min-h-14 w-full items-center justify-center gap-2 rounded-xl bg-cyan-600 px-6 text-[15px] font-black text-white shadow-lg shadow-cyan-900/30 transition hover:bg-cyan-500 active:scale-[0.98] sm:w-auto"
                >
                  PUBLICAR O SITE DA MINHA AGÊNCIA
                  <ArrowRight className="h-5 w-5" />
                </button>
                <a
                  href="#demonstracao"
                  className="inline-flex min-h-14 w-full items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/5 px-6 text-[15px] font-bold text-white transition hover:bg-white/10 active:scale-[0.98] sm:w-auto"
                >
                  <Monitor className="h-5 w-5" />
                  VER SITE REAL FUNCIONANDO
                </a>
              </div>

              <div className="mt-5 flex items-center justify-center gap-2 text-xs font-semibold text-slate-400 sm:justify-start">
                <ShieldCheck className="h-4 w-4" />
                <span>Acesso após o pagamento &middot; Cancelamento online</span>
              </div>
            </div>

            <div className="relative hidden lg:block">
              <div className="transform overflow-hidden rounded-[2rem] border border-white/10 bg-white/5 p-3 shadow-[0_30px_80px_-35px_rgba(8,145,178,0.6)] transition-transform duration-500 hover:-translate-y-2">
                <img
                  src={showcaseLandingPages}
                  alt="Exemplos de sites para agências de viagens criados no Canva Viagem"
                  className="w-full rounded-[1.4rem] object-cover"
                />
              </div>
            </div>
          </div>
        </section>

        {/* 2. DEMONSTRAÇÃO IMEDIATA */}
        <section id="demonstracao" className="border-b border-slate-200 bg-white py-16 md:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto mb-10 max-w-3xl text-center">
              <h2 className="text-3xl font-black leading-tight tracking-tight text-slate-950 md:text-5xl">
                Não imagine. Veja funcionando.
              </h2>
            </div>

            <div className="grid gap-3 md:grid-cols-3">
              {[
                { id: "1", demoName: "Atlas Mundo", modelName: "Horizonte", description: "Viagens internacionais" },
                { id: "3", demoName: "Viva Ceará Receptivo", modelName: "Experiências", description: "Passeios e receptivo" },
                { id: "2", demoName: "Brisa Brasil Viagens", modelName: "Ofertas", description: "Pacotes nacionais" }
              ].map((item) => {
                const demo = siteOfferDemos.find(d => d.id === item.id) || siteOfferDemos[0];
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
                      Modelo {item.modelName}
                    </span>
                    <span className="mt-2 block text-lg font-black">{item.demoName}</span>
                    <span className={`mt-1 block text-sm ${isActive ? "text-slate-300" : "text-slate-500"}`}>{item.description}</span>
                  </button>
                );
              })}
            </div>

            <div className="mt-6 rounded-[1.75rem] border border-slate-300 bg-[#0B1324] p-3 shadow-[0_28px_70px_-35px_rgba(15,23,42,0.7)] sm:p-5">
              <div className="mb-4 flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/5 p-3 text-white sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <p className="truncate font-black">{activeDemo.agencyName}</p>
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
                    title={`Modelo demonstrativo ${activeDemo.agencyName}`}
                    loading="lazy"
                    sandbox="allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox allow-top-navigation-by-user-activation"
                  />
                </div>
              </div>
            </div>

            <p className="mt-6 text-center text-xs font-medium text-slate-400">
              Demonstrações oficiais do Canva Viagem. As marcas, pacotes e valores são fictícios e foram criados exclusivamente para demonstrar a plataforma.
            </p>
          </div>
        </section>

        {/* 3. TRANSFORMAÇÃO */}
        <section className="bg-[#EEF3F6] py-16 md:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl text-center">
              <h2 className="text-3xl font-black leading-tight tracking-tight text-slate-950 md:text-5xl">
                Imagine enviar isso quando alguém perguntar pela sua agência.
              </h2>
            </div>
            
            <div className="mt-12 grid gap-6 md:grid-cols-2">
              <div className="rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-sm">
                <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-rose-100 px-3 py-1 text-xs font-black uppercase text-rose-800">
                  <XCircle className="h-4 w-4" /> Antes
                </div>
                <ul className="space-y-3 text-slate-600 font-medium">
                  <li className="line-through">Instagram</li>
                  <li className="line-through">Destaques desatualizados</li>
                  <li className="line-through">PDFs perdidos na conversa</li>
                  <li className="line-through">Mensagens repetidas</li>
                  <li className="line-through">Links separados</li>
                  <li className="line-through">Informações espalhadas</li>
                </ul>
              </div>
              <div className="rounded-[1.5rem] border border-cyan-200 bg-cyan-50/50 p-6 shadow-sm">
                <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1 text-xs font-black uppercase text-emerald-800">
                  <CheckCircle2 className="h-4 w-4" /> Depois
                </div>
                <ul className="space-y-3 font-bold text-slate-900">
                  <li>✓ Um endereço profissional</li>
                  <li>✓ Sua marca e apresentação</li>
                  <li>✓ Seus pacotes disponíveis</li>
                  <li>✓ Informações organizadas</li>
                  <li>✓ Pedido de orçamento claro</li>
                  <li>✓ Canal direto para o WhatsApp</li>
                </ul>
              </div>
            </div>

            <div className="mt-8 text-center">
              <p className="inline-block border-l-4 border-cyan-700 bg-white py-3 pl-4 pr-6 text-left font-bold text-slate-800 shadow-sm md:text-lg">
                O site não substitui Instagram ou WhatsApp. Ele organiza a apresentação da agência e cria um endereço profissional para compartilhar.
              </p>
            </div>

            <div className="mt-12 mx-auto max-w-5xl">
              <img
                src={showcaseLandingPages}
                alt="Agência depois com site"
                className="w-full rounded-[2rem] border border-slate-200 shadow-xl"
              />
            </div>
          </div>
        </section>

        {/* 4. PROBLEMA */}
        <section className="bg-white py-16 md:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
              <div>
                <h2 className="text-3xl font-black leading-tight tracking-tight text-slate-950 md:text-5xl">
                  O cliente encontrou sua agência. Agora ele precisa entender quem vocês são, o que vendem e como avançar.
                </h2>
                <div className="mt-8 flex flex-col gap-3 font-bold text-slate-700">
                  <div className="flex items-center gap-3"><ChevronRight className="h-5 w-5 text-cyan-600" /> encontra a agência</div>
                  <div className="flex items-center gap-3"><ChevronRight className="h-5 w-5 text-cyan-600" /> entra no Instagram</div>
                  <div className="flex items-center gap-3"><ChevronRight className="h-5 w-5 text-cyan-600" /> procura pacotes</div>
                  <div className="flex items-center gap-3"><ChevronRight className="h-5 w-5 text-cyan-600" /> abre destaques</div>
                  <div className="flex items-center gap-3"><ChevronRight className="h-5 w-5 text-cyan-600" /> chama no WhatsApp</div>
                  <div className="flex items-center gap-3"><ChevronRight className="h-5 w-5 text-cyan-600" /> pede novamente informações</div>
                </div>
              </div>
              
              <div className="grid gap-4 sm:grid-cols-2">
                {[
                  ["1. Informação espalhada", "O cliente precisa procurar o que vocês vendem em diferentes lugares."],
                  ["2. Pacotes desaparecem", "Ofertas importantes se perdem rápido no feed."],
                  ["3. Atendimento repetitivo", "Você precisa repetir a apresentação e os mesmos roteiros o tempo todo."],
                  ["4. Falta endereço único", "Não há um único lugar organizado para apresentar a agência como um todo."]
                ].map(([title, copy]) => (
                  <div key={title} className="rounded-2xl border border-slate-200 bg-[#F7F8FA] p-6">
                    <p className="text-lg font-black text-slate-950">{title}</p>
                    <p className="mt-2 text-sm leading-relaxed text-slate-600">{copy}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* 5. SOLUÇÃO & 3 PASSOS */}
        <section className="border-y border-slate-200 bg-[#0B1324] py-16 text-white md:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl text-center">
              <h2 className="text-2xl font-semibold leading-relaxed text-slate-300 md:text-3xl">
                Em vez de obrigar o cliente a juntar essas informações, você reúne sua apresentação, seus pacotes e seus canais de contato em um único endereço.
              </h2>
              <p className="mt-10 text-3xl font-black text-white md:text-5xl">Seu site começa com 3 passos.</p>
            </div>

            <div className="mt-12 grid gap-6 md:grid-cols-3">
              {[
                { step: "1", title: "CADASTRE SUA AGÊNCIA", desc: "Marca, identidade visual, informações gerais e número do WhatsApp." },
                { step: "2", title: "ADICIONE SUAS VIAGENS", desc: "Fotos, destino, descrição, datas, valores e condições do pacote." },
                { step: "3", title: "PUBLIQUE", desc: "Receba um endereço online imediato para começar a divulgar." }
              ].map((item) => (
                <div key={item.step} className="rounded-[1.5rem] border border-white/10 bg-white/5 p-8 text-center shadow-lg">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-cyan-900/50 text-2xl font-black text-cyan-300">
                    {item.step}
                  </div>
                  <h3 className="mt-6 text-lg font-black">{item.title}</h3>
                  <p className="mt-3 text-slate-400 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>

            <div className="mt-10 flex flex-wrap justify-center gap-4 text-sm font-bold text-cyan-200">
              <span className="flex items-center gap-2"><X className="h-4 w-4" /> Sem instalar WordPress</span>
              <span className="flex items-center gap-2"><X className="h-4 w-4" /> Sem configurar hospedagem</span>
              <span className="flex items-center gap-2"><X className="h-4 w-4" /> Sem esperar programador</span>
            </div>
          </div>
        </section>

        {/* 6. JORNADA DO VIAJANTE */}
        <section className="bg-white py-16 md:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl text-center">
              <h2 className="text-3xl font-black leading-tight tracking-tight text-slate-950 md:text-5xl">
                O que acontece quando um viajante entra no seu site?
              </h2>
            </div>
            
            <div className="mt-12 flex flex-col items-center justify-center gap-4 text-sm font-bold uppercase text-slate-400 sm:flex-row sm:gap-6 md:text-base">
              <span className="text-slate-900">HOME</span> <ArrowRight className="hidden sm:block h-4 w-4 text-cyan-500" />
              <span className="text-slate-900">PACOTES</span> <ArrowRight className="hidden sm:block h-4 w-4 text-cyan-500" />
              <span className="text-slate-900">PACOTE</span> <ArrowRight className="hidden sm:block h-4 w-4 text-cyan-500" />
              <span className="text-slate-900">ORÇAMENTO</span> <ArrowRight className="hidden sm:block h-4 w-4 text-cyan-500" />
              <span className="text-cyan-700">WHATSAPP</span>
            </div>

            <div className="mt-10 grid gap-6 md:grid-cols-5">
              {[
                { title: "Conhece sua agência", icon: Globe2 },
                { title: "Explora seus pacotes", icon: LayoutTemplate },
                { title: "Abre uma viagem", icon: MousePointerClick },
                { title: "Vê info e condições", icon: PanelsTopLeft },
                { title: "Continua no WhatsApp", icon: MessageCircle }
              ].map((item, i) => {
                const Icon = item.icon;
                return (
                  <div key={i} className="flex flex-col items-center text-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-cyan-50 text-cyan-700">
                      <Icon className="h-8 w-8" />
                    </div>
                    <p className="mt-4 text-sm font-bold text-slate-900">{i + 1}. {item.title}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* 7. O QUE RECEBE (Produto Materializado) */}
        <section className="bg-[#F7F8FA] py-16 md:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h2 className="mb-12 text-center text-3xl font-black leading-tight tracking-tight text-slate-950 md:text-5xl">
              Tudo que você precisa para publicar o site da sua agência.
            </h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[
                { icon: Globe2, title: "Site da agência" },
                { icon: LayoutTemplate, title: "6 modelos para turismo" },
                { icon: PanelsTopLeft, title: "Páginas individuais dos pacotes" },
                { icon: SmartphoneNfc, title: "Layout para celular e computador" },
                { icon: MousePointerClick, title: "Formulário de orçamento" },
                { icon: MessageCircle, title: "Botão de WhatsApp" },
                { icon: Link2, title: "Publicação incluída" },
                { icon: Clock3, title: "Possibilidade de editar novamente" }
              ].map((feature, i) => (
                <div key={i} className="flex items-start gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-cyan-100 text-cyan-700">
                    <feature.icon className="h-5 w-5" />
                  </div>
                  <p className="pt-2 font-black text-slate-900">{feature.title}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 8. 6 MODELOS */}
        <section className="bg-white py-16 md:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl text-center">
              <h2 className="text-3xl font-black leading-tight tracking-tight text-slate-950 md:text-5xl">
                Escolha um modelo para a forma como sua agência vende viagens.
              </h2>
              <p className="mt-5 text-lg font-bold text-slate-600">
                Você não começa de uma página em branco. Escolhe uma estrutura e adapta para sua agência.
              </p>
            </div>
            <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[
                { num: "01", title: "Padrão", desc: "Portfólio variado" },
                { num: "02", title: "Horizonte", desc: "Viagens premium" },
                { num: "03", title: "Ofertas", desc: "Pacotes e promoções" },
                { num: "04", title: "Experiências", desc: "Receptivo e passeios" },
                { num: "05", title: "Expedições", desc: "Aventura e natureza" },
                { num: "06", title: "Excursões", desc: "Grupos e saídas" }
              ].map((m) => (
                <div key={m.num} className="rounded-2xl border border-slate-200 bg-slate-50 p-6 text-center">
                  <p className="text-sm font-black text-cyan-600">{m.num}</p>
                  <p className="mt-2 text-xl font-black text-slate-900">{m.title}</p>
                  <p className="mt-1 text-slate-600">{m.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 9. COMPARAÇÃO */}
        <section className="border-y border-slate-200 bg-[#0B1324] py-16 text-white md:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="overflow-x-auto rounded-[1.5rem] border border-slate-700 bg-slate-900 shadow-2xl">
              <div className="min-w-[800px]">
                <div className="grid grid-cols-[1fr_1fr_1fr_1fr] bg-black/40 text-sm font-black text-slate-400">
                  <div className="p-5" />
                  <div className="p-5">Wix / WordPress</div>
                  <div className="p-5">Programador</div>
                  <div className="p-5 text-cyan-300">Canva Viagem</div>
                </div>
                {[
                  ["COMEÇAR", "Solução geral, configure do zero", "Projeto personalizado, aguarde", "Estrutura pronta e especializada"],
                  ["FOCO EM TURISMO", "Não", "Depende do profissional", "Sim, feito para viagens"],
                  ["PUBLICAÇÃO", "Hospedagem à parte", "Hospedagem à parte", "Incluída"],
                  ["ALTERAÇÕES", "Aprender a ferramenta", "Pagar novas horas", "Editar pacotes e salvar"],
                  ["PACOTES & ORÇAMENTO", "Configuração manual", "Configuração manual", "Integrado e direto"]
                ].map((row, i) => (
                  <div key={i} className="grid grid-cols-[1fr_1fr_1fr_1fr] border-t border-slate-800 text-sm">
                    {row.map((cell, index) => (
                      <div key={index} className={`p-5 leading-relaxed ${index === 0 ? 'font-black text-slate-300' : index === 3 ? 'bg-cyan-950/40 font-bold text-white' : 'text-slate-400'}`}>
                        {cell}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
            <p className="mt-6 text-center text-lg font-bold text-slate-300">
              Se sua necessidade é publicar uma estrutura feita para turismo sem começar um projeto técnico do zero, é exatamente aqui que o Canva Viagem se encaixa.
            </p>
          </div>
        </section>

        {/* 10. AUTORIDADE */}
        <section className="bg-white py-16 md:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid items-center gap-10 lg:grid-cols-[0.8fr_1.2fr]">
              <div className="overflow-hidden rounded-[2rem] bg-[#0B1324] p-3 shadow-xl">
                <img src={lucasPortrait} alt="Lucas Ferrari" className="w-full rounded-[1.5rem] object-cover aspect-square" />
              </div>
              <div>
                <h2 className="text-3xl font-black leading-tight tracking-tight text-slate-950 md:text-4xl">
                  Criado por quem entende o marketing de agências.
                </h2>
                <p className="mt-5 text-lg leading-relaxed text-slate-600">
                  Lucas Ferrari desenhou a estrutura da plataforma após sua experiência prática com campanhas e estratégias de marketing para mais de 40 agências de viagens pelo Brasil.
                </p>
                <div className="mt-8 flex items-center gap-4 border-t border-slate-200 pt-6">
                  <div className="text-3xl font-black text-cyan-700">40+</div>
                  <div className="text-sm font-bold text-slate-600">agências atendidas em<br/>trabalhos de marketing</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 11. VALUE STACK */}
        <section className="bg-[#EEF3F6] py-16 md:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-black leading-tight tracking-tight text-slate-950 md:text-5xl">
              Você entra pelo site. O restante da plataforma Elite vem junto.
            </h2>
            
            <div className="mt-12 mx-auto max-w-3xl rounded-[2rem] border-2 border-cyan-500 bg-white p-8 shadow-2xl relative">
              <div className="absolute -top-5 left-1/2 -translate-x-1/2 rounded-full bg-cyan-600 px-6 py-2 text-sm font-black uppercase text-white shadow-lg">
                PRODUTO PRINCIPAL
              </div>
              <h3 className="mt-4 text-3xl font-black text-slate-900">Construtor de Sites</h3>
              <p className="mt-2 text-slate-600">Publique sua agência em poucos passos.</p>
              
              <div className="mt-8 pt-8 border-t border-slate-200">
                <p className="text-sm font-black uppercase text-slate-400 mb-6">+ FERRAMENTAS COMPLEMENTARES INCLUÍDAS</p>
                <div className="grid gap-3 text-left sm:grid-cols-2">
                  {[
                    "Fábrica de anúncios",
                    "Criador de carrosséis",
                    "Textos e legendas",
                    "Biblioteca de Reels e artes",
                    "CRM para orçamentos"
                  ].map(item => (
                    <div key={item} className="flex items-center gap-3">
                      <Check className="h-5 w-5 text-cyan-600" />
                      <span className="font-bold text-slate-700">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 12. PLANOS & RISCO */}
        <section id="planos" className="scroll-mt-20 bg-[#0B1324] py-16 text-white md:py-24">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl text-center">
              <h2 className="text-3xl font-black leading-tight tracking-tight md:text-5xl">
                Escolha o melhor plano para a sua agência.
              </h2>
            </div>

            {/* PLANO ANUAL DOMINANTE */}
            <div className="mt-12 overflow-hidden rounded-[2rem] border border-cyan-400 bg-white text-slate-950 shadow-[0_0_60px_-15px_rgba(8,145,178,0.5)]">
              <div className="grid gap-8 p-8 md:grid-cols-[1fr_1fr] md:p-12 items-center">
                <div>
                  <div className="inline-flex rounded-full bg-cyan-100 px-4 py-1.5 text-xs font-black uppercase tracking-[0.15em] text-cyan-900">Melhor custo mensal</div>
                  <div className="mt-6">
                    <span className="text-5xl font-black tracking-tight">R$40,16</span>
                    <span className="text-xl font-bold text-slate-500">/mês</span>
                  </div>
                  <p className="mt-2 text-sm font-bold text-slate-600">R$482 cobrados uma vez. 12 meses de acesso.</p>
                  
                  <div className="mt-6 rounded-xl bg-green-50 p-4 border border-green-200">
                    <p className="text-sm font-black text-green-800">ECONOMIA REAL: R$682</p>
                    <p className="mt-1 text-xs text-green-700">Calculada comparando o plano anual de R$482 com 12 mensalidades de R$97 (Total R$1.164).</p>
                  </div>

                  <button
                    type="button"
                    disabled={checkoutLoading !== null}
                    onClick={() => startCheckout("annual", 482)}
                    className="mt-8 inline-flex min-h-[60px] w-full items-center justify-center gap-2 rounded-xl bg-cyan-600 px-6 text-lg font-black text-white shadow-lg shadow-cyan-900/30 transition hover:bg-cyan-500 active:scale-[0.98] disabled:cursor-wait disabled:opacity-70"
                  >
                    PUBLICAR O SITE DA MINHA AGÊNCIA
                    <ArrowRight className="h-5 w-5" />
                  </button>
                </div>
                <div className="grid content-center gap-4 border-t border-slate-200 pt-8 md:border-l md:border-t-0 md:pl-10 md:pt-0">
                  <p className="font-black text-slate-900 mb-2">No plano anual você recebe:</p>
                  {[
                    "Site", "6 modelos", "Pacotes", "Orçamento", "WhatsApp", "Publicação", "Ferramentas Elite", "Suporte"
                  ].map((feature) => (
                    <div key={feature} className="flex items-center gap-3">
                      <CheckCircle2 className="h-5 w-5 shrink-0 text-cyan-600" />
                      <span className="font-bold text-slate-700">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-6 grid gap-5 md:grid-cols-2">
              <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-6 flex flex-col justify-between">
                <div>
                  <h3 className="text-xl font-black">Mensal</h3>
                  <p className="mt-2 text-3xl font-black">R$97 <span className="text-base font-semibold text-slate-400">/mês</span></p>
                </div>
                <button
                  type="button"
                  disabled={checkoutLoading !== null}
                  onClick={() => startCheckout("monthly", 97)}
                  className="mt-6 inline-flex min-h-12 w-full items-center justify-center rounded-xl border border-white/20 bg-white/10 px-5 font-black text-white transition hover:bg-white/20 active:scale-[0.98]"
                >
                  Assinar Mensal
                </button>
              </div>
              <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-6 flex flex-col justify-between">
                <div>
                  <h3 className="text-xl font-black">Semestral</h3>
                  <p className="mt-2 text-3xl font-black">R$ 347</p>
                  <p className="text-base font-semibold text-slate-400">R$ 57,83/mês</p>
                </div>
                <button
                  type="button"
                  disabled={checkoutLoading !== null}
                  onClick={() => startCheckout("semiannual", 347)}
                  className="mt-6 inline-flex min-h-12 w-full items-center justify-center rounded-xl border border-white/20 bg-white/10 px-5 font-black text-white transition hover:bg-white/20 active:scale-[0.98]"
                >
                  Assinar Semestral
                </button>
              </div>
            </div>

            <div className="mt-12 flex flex-col items-center justify-center gap-6 rounded-2xl border border-white/10 bg-white/5 p-8 text-center sm:flex-row sm:text-left">
              <ShieldCheck className="h-12 w-12 text-cyan-400" />
              <div>
                <p className="font-black text-lg">Sem pegadinhas.</p>
                <p className="mt-1 text-slate-300">Acesso livre às demos antes da compra, cobrança segura pela Stripe e cancelamento 100% online.</p>
              </div>
            </div>
          </div>
        </section>

        {/* 13. FAQ */}
        <section className="bg-[#F7F8FA] py-16 md:py-24">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-center text-3xl font-black leading-tight tracking-tight text-slate-950 md:text-4xl mb-12">
              Perguntas Frequentes
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {faqItems.map((item, i) => (
                <div key={i} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <p className="font-black text-slate-900">{item.question}</p>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">{item.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 14. FECHAMENTO */}
        <section className="border-t border-slate-200 bg-white py-16 md:py-24">
          <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
            <h2 className="text-4xl font-black leading-tight tracking-tight text-slate-950 md:text-5xl">
              Publique o site profissional da sua agência.
            </h2>
            <p className="mt-6 text-lg font-bold leading-relaxed text-slate-600">
              Escolha um dos 6 modelos, adicione sua marca e seus pacotes e publique uma estrutura feita para turismo — sem começar um projeto técnico do zero.
            </p>
            
            <div className="mt-10 flex flex-wrap justify-center gap-3 text-sm font-bold text-slate-700">
              <span>✓ 6 modelos</span>
              <span>✓ Página da agência</span>
              <span>✓ Pacotes</span>
              <span>✓ Mobile + desktop</span>
              <span>✓ Orçamento</span>
              <span>✓ WhatsApp</span>
              <span>✓ Publicação</span>
              <span>✓ Canva Viagem Elite</span>
            </div>

            <div className="mt-12">
              <p className="text-2xl font-black text-slate-900">R$482 por 12 meses</p>
              <p className="font-bold text-slate-500">equivalente a R$40,16/mês</p>
            </div>

            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <button
                type="button"
                onClick={() => scrollToPlans("fechamento")}
                className="inline-flex min-h-14 w-full items-center justify-center gap-2 rounded-xl bg-cyan-600 px-8 text-base font-black text-white shadow-lg shadow-cyan-900/30 transition hover:bg-cyan-500 active:scale-[0.98] sm:w-auto"
              >
                PUBLICAR O SITE DA MINHA AGÊNCIA
                <ArrowRight className="h-5 w-5" />
              </button>
              <a
                href="#demonstracao"
                className="inline-flex min-h-14 w-full items-center justify-center gap-2 rounded-xl border-2 border-slate-200 bg-white px-8 text-base font-black text-slate-900 transition hover:bg-slate-50 active:scale-[0.98] sm:w-auto"
              >
                VER SITE REAL FUNCIONANDO
              </a>
            </div>
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
            <a href={supportWhatsAppUrl} target="_blank" rel="noopener noreferrer" onClick={() => trackMetaEvent("Contact", { content_name: "Suporte - Site para Agência" })} className="hover:text-white">Falar com o suporte</a>
          </div>
        </div>
      </footer>

      {showStickyCTA && (
        <div className="fixed bottom-0 left-0 right-0 z-50 animate-in slide-in-from-bottom-full duration-300 md:hidden bg-white border-t border-slate-200 p-3 shadow-[0_-10px_40px_rgba(0,0,0,0.1)]">
          <div className="flex items-center justify-between gap-4 max-w-md mx-auto">
            <div>
              <p className="text-sm font-black text-slate-900">R$40,16/mês</p>
              <p className="text-[10px] font-bold text-slate-500">No plano anual</p>
            </div>
            <button
              type="button"
              onClick={() => scrollToPlans("mobile_sticky")}
              className="inline-flex min-h-11 flex-1 items-center justify-center rounded-xl bg-cyan-600 px-4 text-sm font-black text-white shadow-md active:scale-[0.98]"
            >
              PUBLICAR MEU SITE
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
