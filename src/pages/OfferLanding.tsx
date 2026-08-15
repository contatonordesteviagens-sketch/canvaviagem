import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Helmet } from "react-helmet-async";
import {
  ArrowRight,
  Check,
  CheckCircle2,
  ChevronDown,
  Image as ImageIcon,
  LayoutDashboard,
  ShieldCheck,
  Sparkles,
  Users,
  X,
} from "lucide-react";
import "@/assets/inicio-design.css";
import logoImage from "@/assets/logo.png";
import heroDashboard from "@/assets/hero_dashboard.jpg";
import antesAmador from "@/assets/antes_amador.png";
import depoisPremium from "@/assets/depois_premium.png";
import paginaRoteiro from "@/assets/pagina_venda_roteiro.png";
import showcaseAdCreation from "@/assets/images/showcase-ad-creation.png";
import showcaseLandingPages from "@/assets/images/showcase-landing-pages.png";
import showcaseCrm from "@/assets/images/showcase-crm.png";
import { trackEvent } from "@/hooks/useAnalyticsEvents";
import { ELITE_OFFER, type UpgradeFeature } from "@/lib/eliteOffer";

export type OfferVariant = "ads" | "site" | "team";
type BillingCycle = "monthly" | "semiannual" | "annual";

type OfferConfig = {
  path: string;
  feature: UpgradeFeature;
  eyebrow: string;
  title: string;
  description: string;
  cta: string;
  secondaryCta: string;
  problemName: string;
  problemTitle: string;
  problemText: string;
  failedAttempts: string[];
  belief: string;
  mechanismName: string;
  mechanismTitle: string;
  mechanismText: string;
  steps: string[];
  proofTitle: string;
  proofText: string;
  heroImage: string;
  heroImageAlt: string;
  proofImages: Array<{ src: string; alt: string }>;
  coreDeliverables: string[];
  bonuses: string[];
  closingTitle: string;
  popupTitle: string;
  popupText: string;
  faqs: Array<{ question: string; answer: string }>;
};

const offerConfigs: Record<OfferVariant, OfferConfig> = {
  ads: {
    path: "/anuncios-para-agencia-de-viagens",
    feature: "ad_export",
    eyebrow: "A FÁBRICA DE ANÚNCIOS PARA AGÊNCIAS DE VIAGENS",
    title: "Transforme qualquer pacote em um anúncio que dá vontade de viajar.",
    description:
      "Coloque o destino, o preço e as condições. O Canva Viagem transforma as informações do pacote em anúncios profissionais com a identidade da sua agência — sem depender de designer.",
    cta: "Quero transformar meu pacote em anúncio",
    secondaryCta: "Ver a Fábrica funcionando",
    problemName: "PACOTE INVISÍVEL",
    problemTitle: "Seu pacote pode ser excelente. Se o anúncio parece improvisado, o cliente nem percebe.",
    problemText:
      "Quando você divulga apenas um preço no WhatsApp, usa uma arte genérica ou espera alguém criar cada peça, o valor da viagem fica escondido. O cliente enxerga só mais um preço para comparar.",
    failedAttempts: [
      "O template genérico ainda obriga você a montar tudo.",
      "O designer precisa de briefing para cada novo pacote.",
      "O texto solto no WhatsApp reduz sua oferta a preço.",
      "Ferramentas comuns não entendem destino, condições e parcelamento.",
    ],
    belief: "Um bom pacote só chama atenção quando parece uma boa oportunidade.",
    mechanismName: "PACOTE VIROU ANÚNCIO",
    mechanismTitle: "Você coloca o pacote. A Fábrica monta o anúncio.",
    mechanismText:
      "Em vez de começar com uma tela em branco, você parte das informações que já tem e transforma a oferta em uma peça pronta para divulgar.",
    steps: [
      "Informe destino, preço e condições.",
      "Escolha o modelo que combina com a oferta.",
      "Baixe o anúncio com a marca da sua agência.",
    ],
    proofTitle: "Não acredite na promessa. Veja o pacote virando anúncio.",
    proofText: "Compare a divulgação improvisada com a mesma oferta apresentada pela Fábrica.",
    heroImage: showcaseAdCreation,
    heroImageAlt: "Fábrica de anúncios do Canva Viagem",
    proofImages: [
      { src: antesAmador, alt: "Divulgação de viagem antes do Canva Viagem" },
      { src: depoisPremium, alt: "Anúncio profissional criado no Canva Viagem" },
    ],
    coreDeliverables: [
      "Anúncios para Feed e Stories",
      "Preço, condições e marca no mesmo layout",
      "Variações para diferentes pacotes",
      "Exportações prontas para publicar",
    ],
    bonuses: [
      "Criador de carrosséis para a mesma campanha",
      "Legendas e textos de venda com IA",
      "250 Reels e 400 artes para manter o perfil ativo",
      "Criador de sites e CRM para os interessados",
    ],
    closingTitle: "Seu próximo pacote já está pronto. Falta fazer ele parecer impossível de ignorar.",
    popupTitle: "Espere: transforme um pacote antes de ir embora.",
    popupText:
      "Assine a Fábrica Elite e transforme sua própria oferta em um anúncio profissional com acesso completo.",
    faqs: [
      {
        question: "É apenas um pacote de templates?",
        answer: "Não. Você informa os dados do pacote e usa a Fábrica para montar anúncios com sua marca, preço e condições.",
      },
      {
        question: "Preciso dominar o Canva ou saber design?",
        answer: "Não. A plataforma foi criada para quem vende viagens, não para designers.",
      },
      {
        question: "Isso garante que vou vender?",
        answer: "Nenhuma ferramenta pode garantir vendas. O Canva Viagem coloca sua oferta em condições muito melhores para chamar atenção e iniciar conversas comerciais.",
      },
      {
        question: "Posso testar antes de pagar?",
        answer: "Não. O acesso é exclusivo para assinantes e é liberado após a confirmação do pagamento.",
      },
    ],
  },
  site: {
    path: "/site-para-agencia-de-viagens",
    feature: "site_publish",
    eyebrow: "O SITE PROFISSIONAL DA SUA AGÊNCIA",
    title: "Coloque sua agência na internet com um site que transmite confiança.",
    description:
      "Adicione sua marca, seus contatos e seus pacotes. O Canva Viagem organiza tudo em um site profissional — sem programador, sem código e sem começar do zero.",
    cta: "Quero publicar o site da minha agência",
    secondaryCta: "Ver um site pronto",
    problemName: "AGÊNCIA SEM ENDEREÇO",
    problemTitle: "O Instagram chama atenção. Mas ele não substitui a casa da sua agência na internet.",
    problemText:
      "Quando o viajante encontra apenas posts espalhados e um número de WhatsApp, ele precisa procurar informações e decidir se sua agência parece confiável. Quanto mais confuso o caminho, maior a insegurança.",
    failedAttempts: [
      "O Instagram mistura promoções, dicas e informações antigas.",
      "Uma página de links mostra botões, mas não apresenta a agência.",
      "O WhatsApp obriga você a explicar tudo de novo.",
      "Um site tradicional costuma exigir programador, prazo e manutenção.",
    ],
    belief: "Antes de pedir orçamento, o viajante precisa sentir que encontrou uma agência real e confiável.",
    mechanismName: "SITE PRONTO DA AGÊNCIA",
    mechanismTitle: "Você coloca as informações. O Canva Viagem monta o site.",
    mechanismText:
      "Sua marca, seus pacotes, seus contatos e um caminho claro para pedir orçamento ficam organizados em um único lugar.",
    steps: [
      "Cadastre a agência e sua identidade.",
      "Adicione seus pacotes e contatos.",
      "Publique e envie o link aos clientes.",
    ],
    proofTitle: "Não imagine. Veja o site pronto.",
    proofText: "Uma apresentação profissional para transformar interesse em pedido de orçamento.",
    heroImage: showcaseLandingPages,
    heroImageAlt: "Criador de sites para agências no Canva Viagem",
    proofImages: [
      { src: paginaRoteiro, alt: "Página de pacote criada pelo Canva Viagem" },
      { src: showcaseCrm, alt: "CRM para organizar interessados no Canva Viagem" },
    ],
    coreDeliverables: [
      "Site editável com a identidade da agência",
      "Páginas profissionais para seus pacotes",
      "Formulário para captar interessados",
      "Publicação em um link do Canva Viagem",
    ],
    bonuses: [
      "CRM para organizar os contatos recebidos",
      "Fábrica de anúncios para divulgar o site",
      "Imagens e vídeos de destinos",
      "Textos e chamadas com inteligência artificial",
    ],
    closingTitle: "Se sua agência já vende viagens, ela merece um lugar profissional para apresentá-las.",
    popupTitle: "Seu site pode estar no ar antes do próximo orçamento.",
    popupText:
      "Assine o Canva Viagem e publique uma apresentação profissional da sua agência com acesso completo.",
    faqs: [
      {
        question: "Preciso saber criar sites?",
        answer: "Não. Você trabalha a partir de uma estrutura pronta e preenche as informações da sua agência.",
      },
      {
        question: "Preciso contratar hospedagem?",
        answer: "Não para publicar usando o link disponibilizado pelo Canva Viagem.",
      },
      {
        question: "Posso editar o site depois?",
        answer: "Sim. Você pode atualizar informações e pacotes dentro da plataforma.",
      },
      {
        question: "Um site garante que vou vender?",
        answer: "Não existe garantia de venda. O site reduz o improviso, organiza a oferta e transmite mais profissionalismo para quem está decidindo pedir orçamento.",
      },
    ],
  },
  team: {
    path: "/equipe-de-marketing-para-agencia-de-viagens",
    feature: "fabrica",
    eyebrow: "PARA QUEM FAZ TUDO SOZINHO",
    title: "Faça sua agência parecer grande, mesmo que hoje seja só você.",
    description:
      "O Canva Viagem reúne anúncios, conteúdo, textos, sites e organização de contatos em uma única plataforma feita para agências de viagens.",
    cta: "Quero minha Equipe 5 em 1",
    secondaryCta: "Ver tudo que ela faz",
    problemName: "MARKETING FEITO AOS PEDAÇOS",
    problemTitle: "Você não está falhando por falta de esforço. Está tentando fazer cinco trabalhos ao mesmo tempo.",
    problemText:
      "Enquanto atende clientes e monta roteiros, você também tenta criar artes, escrever legendas, publicar conteúdo, montar páginas e acompanhar interessados. Cada tarefa fica em uma ferramenta — e sua agência continua com cara de improviso.",
    failedAttempts: [
      "Uma ferramenta cria a imagem.",
      "Outra escreve o texto.",
      "Outra monta a página.",
      "No fim, você ainda precisa juntar tudo e acompanhar os contatos.",
    ],
    belief: "Uma pequena agência não precisa contratar uma equipe inteira para transmitir confiança. Precisa reunir o trabalho dessa equipe em um sistema simples.",
    mechanismName: "EQUIPE DE MARKETING 5 EM 1",
    mechanismTitle: "Uma plataforma. Cinco trabalhos.",
    mechanismText:
      "Antes de comprar a viagem, o cliente compra confiança na agência. Quando anúncio, site, conteúdo e atendimento contam a mesma história, uma operação pequena se apresenta como uma empresa organizada.",
    steps: [
      "Designer: anúncios, artes e carrosséis.",
      "Social media e redator: vídeos, calendário, legendas e ofertas.",
      "Site e comercial: páginas profissionais e CRM para os contatos.",
    ],
    proofTitle: "Uma única conta. Cinco trabalhos que antes ficavam espalhados.",
    proofText: "Veja a estrutura real que passa a trabalhar dentro da sua agência.",
    heroImage: heroDashboard,
    heroImageAlt: "Painel da Equipe de Marketing 5 em 1 do Canva Viagem",
    proofImages: [
      { src: showcaseAdCreation, alt: "Criação de anúncios no Canva Viagem" },
      { src: showcaseLandingPages, alt: "Criação de sites no Canva Viagem" },
    ],
    coreDeliverables: [
      "Designer para anúncios, artes e carrosséis",
      "Social media com vídeos e calendário",
      "Redator para legendas, roteiros e ofertas",
      "Criador de sites para a agência e os pacotes",
      "Assistente comercial com CRM de interessados",
    ],
    bonuses: [
      "250 Reels e 400 artes",
      "Templates editáveis e calendário de publicações",
      "Treinamentos de uso e atualizações do acervo",
      "Suporte pelo WhatsApp",
    ],
    closingTitle: "Você pode continuar fazendo cinco trabalhos sozinho. Ou colocar uma equipe inteira dentro da sua agência.",
    popupTitle: "Ainda vai continuar fazendo cinco trabalhos sozinho?",
    popupText:
      "Ative sua Equipe de Marketing 5 em 1. Crie anúncios, publique seu site e organize seus contatos com acesso completo.",
    faqs: [
      {
        question: "O Canva Viagem realmente substitui uma equipe?",
        answer: "Ele reúne boa parte do trabalho operacional que exigiria várias ferramentas ou profissionais. Estratégia, atendimento e fechamento continuam dependendo da agência.",
      },
      {
        question: "Preciso usar todas as ferramentas?",
        answer: "Não. Comece pela necessidade mais urgente e use o restante quando precisar.",
      },
      {
        question: "Serve para quem trabalha sozinho?",
        answer: "Sim. A proposta é dar estrutura profissional a agentes autônomos e equipes pequenas.",
      },
      {
        question: "Quando o acesso é liberado?",
        answer: "O acesso é liberado após a confirmação do pagamento do ciclo escolhido. As condições completas aparecem no checkout.",
      },
    ],
  },
};

const plans: Array<{
  id: string;
  name: string;
  cycle: BillingCycle;
  price: string;
  detail: string;
  trackValue: number;
  popular?: boolean;
}> = [
  {
    id: "mensal",
    name: "Plano Mensal",
    cycle: "monthly",
    price: ELITE_OFFER.monthlyPrice,
    detail: "cobrado mensalmente",
    trackValue: 97,
  },
  {
    id: "semestral",
    name: "Plano Semestral",
    cycle: "semiannual",
    price: ELITE_OFFER.semiannualPrice,
    detail: "cobrado a cada 6 meses",
    trackValue: 347,
  },
  {
    id: "anual",
    name: "Plano Anual",
    cycle: "annual",
    price: ELITE_OFFER.annualMonthlyEquivalent,
    detail: `${ELITE_OFFER.annualPrice} por 12 meses de acesso`,
    trackValue: 482,
    popular: true,
  },
];

const metaPixelId = "916689227676142";

export default function OfferLanding({ variant }: { variant: OfferVariant }) {
  const config = offerConfigs[variant];
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [exitOfferOpen, setExitOfferOpen] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState<BillingCycle | null>(null);
  const pageTrackedRef = useRef(false);

  const recordEvent = useCallback((eventType: string, data: Record<string, unknown> = {}) => {
    void trackEvent(eventType, {
      offer_variant: variant,
      landing_path: config.path,
      feature: config.feature,
      ...data,
    });
  }, [config.feature, config.path, variant]);

  useEffect(() => {
    if (pageTrackedRef.current) return;
    pageTrackedRef.current = true;
    recordEvent("landing_viewed");
  }, [recordEvent]);

  useEffect(() => {
    const storageKey = `cv:exit-offer-shown:${variant}`;
    if (sessionStorage.getItem(storageKey)) return;

    let armed = false;
    const armTimer = window.setTimeout(() => {
      armed = true;
    }, 8000);
    const handleMouseOut = (event: MouseEvent) => {
      if (!armed || event.clientY > 4 || event.relatedTarget) return;
      sessionStorage.setItem(storageKey, "1");
      setExitOfferOpen(true);
      recordEvent("exit_popup_shown");
      document.removeEventListener("mouseout", handleMouseOut);
    };
    document.addEventListener("mouseout", handleMouseOut);
    return () => {
      window.clearTimeout(armTimer);
      document.removeEventListener("mouseout", handleMouseOut);
    };
  }, [recordEvent, variant]);

  useEffect(() => {
    if (!exitOfferOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setExitOfferOpen(false);
        recordEvent("exit_popup_dismissed", { method: "escape" });
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [exitOfferOpen, recordEvent]);

  const startCheckout = useCallback((cycle: BillingCycle, trackValue: number) => {
    recordEvent("plan_selected", { billing_cycle: cycle, value: trackValue });
    const pixelPlan = cycle === "monthly" ? "mensal" : cycle === "semiannual" ? "semestral" : "anual";
    const fbq = (window as Window & { fbq?: (...args: unknown[]) => void }).fbq;
    fbq?.("trackSingle", metaPixelId, "InitiateCheckout", {
      value: trackValue,
      currency: "BRL",
      content_name: `Canva Viagem - ${config.mechanismName}`,
      content_category: `landing_${variant}_${pixelPlan}`,
    });

    setCheckoutLoading(cycle);
    recordEvent("checkout_started", { billing_cycle: cycle, value: trackValue });
    const params = new URLSearchParams({
      checkout: cycle,
      upgrade: config.feature,
      returnTo: config.feature === "site_publish" ? "/fabrica/site" : "/fabrica",
      offer: variant,
    });
    window.location.assign(`/inicio?${params.toString()}`);
  }, [config.feature, config.mechanismName, recordEvent, variant]);

  const pageDescription = useMemo(
    () => `${config.description} Assine o Canva Viagem Elite para liberar o acesso completo.`,
    [config.description],
  );

  const scrollToPlans = (source: string) => {
    setExitOfferOpen(false);
    recordEvent("cta_clicked", { source });
    document.getElementById("planos")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="inicio-page min-h-screen bg-white" data-offer-variant={variant}>
      <Helmet>
        <title>{config.title} | Canva Viagem</title>
        <meta name="description" content={pageDescription} />
        <link rel="canonical" href={`https://canvaviagem.com${config.path}`} />
        <meta property="og:title" content={`${config.title} | Canva Viagem`} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:url" content={`https://canvaviagem.com${config.path}`} />
      </Helmet>

      <header className="site-header">
        <div className="header-inner">
          <a href="/inicio" aria-label="Ir para a página inicial do Canva Viagem">
            <img src={logoImage} alt="Canva Viagem" className="logo" />
          </a>
          <button type="button" onClick={() => scrollToPlans("header")} className="header-cta">
            Ver planos
          </button>
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden bg-[#0F172A] pb-16 pt-28 md:pb-24 md:pt-36">
          <div className="absolute left-1/2 top-0 -z-0 h-[520px] w-[1000px] -translate-x-1/2 rounded-full bg-purple-600/20 blur-[120px]" />
          <div className="inicio-container relative z-10">
            <div className="grid items-center gap-10 lg:grid-cols-[1.08fr_.92fr]">
              <div className="text-center lg:text-left">
                <p className="mb-5 inline-flex rounded-full border border-purple-400/30 bg-purple-900/30 px-4 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-purple-200 md:text-xs">
                  {config.eyebrow}
                </p>
                <h1 className="mx-auto mb-5 max-w-4xl text-[34px] font-black leading-[1.03] tracking-tight text-white sm:text-5xl lg:mx-0 lg:text-[4.2rem]">
                  {config.title}
                </h1>
                <p className="mx-auto mb-7 max-w-2xl text-base font-medium leading-relaxed text-slate-300 md:text-xl lg:mx-0">
                  {config.description}
                </p>
                <div className="mb-5 flex flex-col justify-center gap-3 sm:flex-row lg:justify-start">
                  <button
                    type="button"
                    onClick={() => scrollToPlans("hero_primary")}
                    className="inline-flex min-h-[54px] items-center justify-center gap-2 rounded-full bg-purple-600 px-7 py-3 text-sm font-black text-white shadow-[0_0_40px_rgba(124,58,237,.55)] transition hover:-translate-y-1 hover:bg-purple-500 md:text-base"
                  >
                    {config.cta} <ArrowRight size={18} />
                  </button>
                  <a
                    href="#como-funciona"
                    onClick={() => recordEvent("cta_clicked", { source: "hero_secondary" })}
                    className="inline-flex min-h-[54px] items-center justify-center rounded-full border border-slate-600 bg-slate-800 px-7 py-3 text-sm font-bold text-white transition hover:-translate-y-1 hover:bg-slate-700"
                  >
                    {config.secondaryCta}
                  </a>
                </div>
                <p className="text-xs font-semibold text-emerald-300 md:text-sm">
                  ✓ Acesso exclusivo para assinantes &nbsp;·&nbsp; pagamento seguro &nbsp;·&nbsp; cancelamento online
                </p>
              </div>

              <div className="relative mx-auto w-full max-w-[560px]">
                <div className="absolute -inset-5 rounded-[2rem] bg-gradient-to-br from-purple-500/25 to-blue-500/10 blur-2xl" />
                <img
                  src={config.heroImage}
                  alt={config.heroImageAlt}
                  className="relative w-full rounded-2xl border border-white/15 bg-white shadow-2xl"
                />
                <div className="absolute -bottom-4 left-4 right-4 flex items-center gap-3 rounded-xl border border-white/15 bg-slate-900/95 p-4 text-left text-white shadow-xl backdrop-blur md:left-8 md:right-8">
                  <CheckCircle2 className="shrink-0 text-emerald-400" />
                  <span className="text-sm font-bold">{config.mechanismName}: feito para quem vende viagens.</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="border-b border-slate-200 bg-white py-16 md:py-24">
          <div className="inicio-container">
            <div className="mx-auto max-w-4xl text-center">
              <p className="mb-4 text-xs font-black uppercase tracking-[0.25em] text-rose-600">{config.problemName}</p>
              <h2 className="mb-6 text-3xl font-black leading-tight text-slate-950 md:text-5xl">{config.problemTitle}</h2>
              <p className="mx-auto max-w-3xl text-base leading-relaxed text-slate-600 md:text-lg">{config.problemText}</p>
            </div>
            <div className="mx-auto mt-10 grid max-w-5xl gap-4 md:grid-cols-2">
              {config.failedAttempts.map((item) => (
                <div key={item} className="flex gap-3 rounded-2xl border border-rose-100 bg-rose-50/60 p-5 text-left text-slate-700">
                  <X className="mt-0.5 shrink-0 text-rose-500" size={20} />
                  <span className="font-semibold">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="como-funciona" className="bg-[#F8FAFC] py-16 md:py-24">
          <div className="inicio-container">
            <div className="mx-auto mb-12 max-w-4xl text-center">
              <p className="mb-4 text-xs font-black uppercase tracking-[0.25em] text-purple-600">A ÚNICA CRENÇA</p>
              <blockquote className="text-2xl font-black leading-tight text-slate-950 md:text-4xl">“{config.belief}”</blockquote>
            </div>

            <div className="overflow-hidden rounded-[2rem] bg-[#0F172A] p-7 text-white shadow-2xl md:p-12">
              <div className="grid gap-10 lg:grid-cols-[.9fr_1.1fr] lg:items-center">
                <div>
                  <p className="mb-4 text-xs font-black uppercase tracking-[0.25em] text-purple-300">{config.mechanismName}</p>
                  <h2 className="mb-5 text-3xl font-black leading-tight md:text-5xl">{config.mechanismTitle}</h2>
                  <p className="text-base leading-relaxed text-slate-300 md:text-lg">{config.mechanismText}</p>
                </div>
                <div className="grid gap-4">
                  {config.steps.map((step, index) => (
                    <div key={step} className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/5 p-5">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-purple-600 text-lg font-black">{index + 1}</span>
                      <p className="font-bold text-white md:text-lg">{step}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-white py-16 md:py-24">
          <div className="inicio-container">
            <div className="mx-auto mb-10 max-w-3xl text-center">
              <p className="mb-4 text-xs font-black uppercase tracking-[0.25em] text-purple-600">VEJA POR DENTRO</p>
              <h2 className="mb-4 text-3xl font-black leading-tight text-slate-950 md:text-5xl">{config.proofTitle}</h2>
              <p className="text-base text-slate-600 md:text-lg">{config.proofText}</p>
            </div>
            <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-2">
              {config.proofImages.map((image) => (
                <div key={image.alt} className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 shadow-lg">
                  <img src={image.src} alt={image.alt} className="h-full w-full object-cover" loading="lazy" />
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="border-y border-slate-200 bg-[#F8FAFC] py-16 md:py-24">
          <div className="inicio-container">
            <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-2">
              <div className="rounded-[2rem] border-2 border-purple-500 bg-white p-7 shadow-xl md:p-10">
                <div className="mb-6 flex items-center gap-3">
                  {variant === "ads" ? <ImageIcon className="text-purple-600" /> : variant === "site" ? <LayoutDashboard className="text-purple-600" /> : <Users className="text-purple-600" />}
                  <p className="text-xs font-black uppercase tracking-[0.2em] text-purple-600">O que você veio buscar</p>
                </div>
                <h2 className="mb-6 text-3xl font-black text-slate-950">{config.mechanismName}</h2>
                <div className="space-y-4">
                  {config.coreDeliverables.map((item) => (
                    <div key={item} className="flex gap-3 text-slate-700">
                      <CheckCircle2 className="shrink-0 text-emerald-500" size={21} />
                      <span className="font-bold">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="rounded-[2rem] border border-slate-200 bg-white p-7 shadow-lg md:p-10">
                <div className="mb-6 flex items-center gap-3">
                  <Sparkles className="text-amber-500" />
                  <p className="text-xs font-black uppercase tracking-[0.2em] text-amber-600">Você também recebe</p>
                </div>
                <h2 className="mb-6 text-3xl font-black text-slate-950">O resto da estrutura como bônus.</h2>
                <div className="space-y-4">
                  {config.bonuses.map((item) => (
                    <div key={item} className="flex gap-3 text-slate-700">
                      <Check className="shrink-0 text-purple-600" size={21} />
                      <span className="font-semibold">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="planos" className="scroll-mt-20 bg-[#0F172A] py-16 md:py-24">
          <div className="inicio-container">
            <div className="mx-auto mb-12 max-w-3xl text-center">
              <p className="mb-4 text-xs font-black uppercase tracking-[0.25em] text-purple-300">ESCOLHA COMO COMEÇAR</p>
              <h2 className="mb-4 text-3xl font-black text-white md:text-5xl">Todos os planos liberam a plataforma Elite completa.</h2>
              <p className="text-slate-300 md:text-lg">Você escolhe o período e o acesso é liberado após a confirmação do pagamento.</p>
            </div>
            <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-3">
              {plans.map((plan) => (
                <article
                  key={plan.id}
                  className={`relative flex flex-col rounded-[2rem] border bg-white p-7 shadow-xl ${plan.popular ? "border-purple-400 ring-4 ring-purple-500/20 lg:-translate-y-3" : "border-slate-700"}`}
                >
                  {plan.popular && (
                    <span className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-purple-600 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-white">
                      Melhor custo
                    </span>
                  )}
                  <h3 className="mt-2 text-xl font-black text-slate-950">{plan.name}</h3>
                  <p className="mt-5 text-4xl font-black text-slate-950">{plan.price}</p>
                  <p className="mt-1 min-h-10 text-sm font-semibold text-slate-500">{plan.detail}</p>
                  <div className="my-6 space-y-3 border-y border-slate-100 py-6">
                    {["Plataforma Elite completa", "Acesso após o pagamento", "Suporte pelo WhatsApp", "Cancelamento online"].map((item) => (
                      <div key={item} className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                        <CheckCircle2 size={18} className="text-emerald-500" /> {item}
                      </div>
                    ))}
                  </div>
                  <button
                    type="button"
                    disabled={checkoutLoading !== null}
                    onClick={() => void startCheckout(plan.cycle, plan.trackValue)}
                    className={`mt-auto inline-flex min-h-[52px] items-center justify-center rounded-full px-5 py-3 text-sm font-black transition disabled:cursor-wait disabled:opacity-60 ${plan.popular ? "bg-purple-600 text-white hover:bg-purple-500" : "bg-slate-900 text-white hover:bg-slate-800"}`}
                  >
                    {checkoutLoading === plan.cycle ? "Abrindo checkout..." : `Assinar ${config.mechanismName}`}
                  </button>
                  <p className="mt-3 text-center text-[11px] font-semibold text-slate-500">Pagamento seguro · acesso após a confirmação</p>
                </article>
              ))}
            </div>
            <div className="mx-auto mt-10 flex max-w-3xl flex-wrap items-center justify-center gap-x-6 gap-y-3 text-center text-xs font-semibold text-slate-300">
              <span className="flex items-center gap-2"><ShieldCheck size={17} className="text-emerald-400" /> Pagamento seguro pela Stripe</span>
              <span>Acesso após o pagamento</span>
              <span>Cancelamento online</span>
            </div>
          </div>
        </section>

        <section className="bg-white py-16 md:py-24">
          <div className="inicio-container">
            <div className="mx-auto max-w-4xl">
              <h2 className="mb-9 text-center text-3xl font-black text-slate-950 md:text-5xl">Perguntas antes de começar</h2>
              <div className="space-y-3">
                {config.faqs.map((faq, index) => (
                  <div key={faq.question} className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
                    <button
                      type="button"
                      className="flex w-full items-center justify-between gap-4 p-5 text-left font-black text-slate-900 md:p-6 md:text-lg"
                      onClick={() => setOpenFaq(openFaq === index ? null : index)}
                      aria-expanded={openFaq === index}
                    >
                      {faq.question}
                      <ChevronDown className={`shrink-0 transition ${openFaq === index ? "rotate-180" : ""}`} />
                    </button>
                    {openFaq === index && <p className="px-5 pb-6 leading-relaxed text-slate-600 md:px-6">{faq.answer}</p>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="bg-gradient-to-br from-purple-700 to-indigo-900 py-16 text-center text-white md:py-24">
          <div className="inicio-container">
            <h2 className="mx-auto mb-7 max-w-4xl text-3xl font-black leading-tight md:text-5xl">{config.closingTitle}</h2>
            <button
              type="button"
              onClick={() => scrollToPlans("final")}
              className="inline-flex min-h-[56px] items-center justify-center gap-2 rounded-full bg-white px-8 py-4 font-black text-purple-700 shadow-2xl transition hover:-translate-y-1"
            >
              {config.cta} <ArrowRight size={19} />
            </button>
          </div>
        </section>
      </main>

      <footer className="bg-[#0B1120] py-8 text-center text-sm text-slate-400">
        <div className="inicio-container">
          <img src={logoImage} alt="Canva Viagem" className="mx-auto mb-4 h-9 w-auto brightness-0 invert" />
          <p>Canva Viagem — ferramentas de marketing feitas para agências de viagens.</p>
          <div className="mt-4 flex justify-center gap-5 text-xs">
            <a href="/termos" className="hover:text-white">Termos</a>
            <a href="/privacidade" className="hover:text-white">Privacidade</a>
            <a href="/inicio" className="hover:text-white">Oferta completa</a>
          </div>
        </div>
      </footer>

      <button
        type="button"
        onClick={() => scrollToPlans("mobile_sticky")}
        className="fixed bottom-3 left-3 right-3 z-40 flex min-h-[52px] items-center justify-center rounded-full bg-purple-600 px-5 py-3 text-sm font-black text-white shadow-2xl md:hidden"
      >
        Ver planos <ArrowRight className="ml-2" size={18} />
      </button>

      {exitOfferOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/75 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="exit-offer-title"
          onMouseDown={(event) => {
            if (event.target !== event.currentTarget) return;
            setExitOfferOpen(false);
            recordEvent("exit_popup_dismissed", { method: "backdrop" });
          }}
        >
          <div className="relative w-full max-w-lg overflow-hidden rounded-[2rem] bg-white p-7 text-center shadow-2xl md:p-10">
            <button
              type="button"
              aria-label="Fechar oferta"
              onClick={() => {
                setExitOfferOpen(false);
                recordEvent("exit_popup_dismissed", { method: "button" });
              }}
              className="absolute right-4 top-4 rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-900"
            >
              <X />
            </button>
            <span className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-purple-100 text-purple-700">
              <Sparkles size={28} />
            </span>
            <p className="mb-3 text-xs font-black uppercase tracking-[0.2em] text-purple-600">Acesso completo para assinantes</p>
            <h2 id="exit-offer-title" className="mb-4 text-3xl font-black leading-tight text-slate-950">{config.popupTitle}</h2>
            <p className="mb-7 leading-relaxed text-slate-600">{config.popupText}</p>
            <button
              type="button"
              autoFocus
              onClick={() => scrollToPlans("exit_popup")}
              className="flex min-h-[54px] w-full items-center justify-center rounded-full bg-purple-600 px-6 py-3 font-black text-white hover:bg-purple-500"
            >
              Quero assinar agora
            </button>
            <button
              type="button"
              onClick={() => {
                setExitOfferOpen(false);
                recordEvent("exit_popup_dismissed", { method: "secondary" });
              }}
              className="mt-3 text-sm font-semibold text-slate-500 hover:text-slate-900"
            >
              Agora não
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
