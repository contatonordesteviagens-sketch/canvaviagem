import { useEffect, useState } from "react";
import {
  BookOpen,
  Calendar,
  Check,
  CheckCircle2,
  ChevronDown,
  Clock,
  Image as ImageIcon,
  Instagram,
  LayoutDashboard,
  MessageSquare,
  MonitorSmartphone,
  Play,
  ShieldCheck,
  Star,
  Users,
  Video,
} from "lucide-react";
import "@/assets/inicio-design.css";
import logoImage from "@/assets/logo.png";
import heroDashboard from "@/assets/hero_dashboard.jpg";
import dashboardInterno from "@/assets/dashboard_interno.png";
import antesAmador from "@/assets/antes_amador.png";
import depoisPremium from "@/assets/depois_premium.png";
import crmLeads from "@/assets/crm_leads.png";
import paginaRoteiro from "@/assets/pagina_venda_roteiro.png";
import lucasPortrait from "@/assets/lucas-ferrari-portrait.webp";
import depoimento1 from "@/assets/depoimento1.jpg";
import depoimento2 from "@/assets/depoimento2.png";
import depoimento3 from "@/assets/depoimento3.jpg";

import showcaseAdCreation from "@/assets/images/showcase-ad-creation.png";
import showcaseLandingPages from "@/assets/images/showcase-landing-pages.png";
import showcaseCrm from "@/assets/images/showcase-crm.png";
import showcaseScheduler from "@/assets/images/showcase-scheduler.png";
import showcasePremiumMedias from "@/assets/images/showcase-premium-medias.png";
import { ELITE_OFFER } from "@/lib/eliteOffer";

const supportWhatsAppUrl =
  "https://wa.me/5585998458995?text=Ol%C3%A1%2C%20preciso%20de%20suporte%20sobre%20o%20Canva%20Viagem";
const instagramUrl = "https://www.instagram.com/lucasferrari.pro/";
const annualCheckoutUrl = ELITE_OFFER.annualCheckoutUrl;
const monthlyCheckoutUrl = ELITE_OFFER.monthlyCheckoutUrl;
const metaPixelId = "916689227676142";
const reelsMainGifUrl =
  "https://media1.giphy.com/media/v1.Y2lkPTc5MGI3NjExZm5kcmcybmE2aTFkOTU3ZDNqYmZkbHQ2YjRibjB1NjFtN2RoNWdrMyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/6osnZ6joYcPfERZsaE/giphy.gif";
const reelsPreviewGifs = [
  "https://media1.giphy.com/media/v1.Y2lkPTc5MGI3NjExb3J2anV0aTVkYWowbDl1ZXFtNnB4ZWUwcnVnZTVzOW91ZzNncGNvNSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/mbylDFYWSU46XeLcsS/giphy.gif",
  "https://media4.giphy.com/media/VVMI7dobalrJhKmQOZ/giphy.gif",
  "https://media4.giphy.com/media/tJPdq4gvTvr8CgIyWI/giphy.gif",
];
const profilePreviewImageUrl =
  "https://rochadigitalmidia.com.br/wp-content/uploads/2025/09/1-1024x1024.png";

const pricingFeatures = [
  "Fábrica de destinos: Gerador de imagens de ofertas",
  "Fábrica de destinos: Site pronto editável",
  "Fábrica de destinos: CRM para organizar leads",
  "250 vídeos Reels",
  "Templates editáveis no Canva",
  "400 artes e stories",
  "Calendário de postagens",
  "Agentes de Inteligência Artificial",
  "Roteiros e ofertas em texto",
  "Suporte via WhatsApp",
];

const quickOutcomeCards = [
  {
    title: "Fábrica de Destinos",
    copy: "Gerador de imagens de ofertas, site pronto editável e CRM para organizar todos os seus leads e clientes.",
    icon: <LayoutDashboard size={22} />,
  },
  {
    title: "Redes Sociais Prontas",
    copy: "250 vídeos Reels, 400 artes e stories, templates no Canva e calendário de postagens para não faltar conteúdo.",
    icon: <Instagram size={22} />,
  },
  {
    title: "Inteligência Artificial",
    copy: "Agentes inteligentes que criam roteiros e textos de ofertas para você, com suporte sempre no WhatsApp.",
    icon: <MessageSquare size={22} />,
  },
];

const platformProofScreens = [
  {
    image: dashboardInterno,
    title: "Painel real da plataforma",
    result:
      "Você encontra as ferramentas organizadas em um só lugar para criar campanhas sem depender de arquivos espalhados.",
  },
  {
    image: paginaRoteiro,
    title: "Página de pacote pronta para enviar",
    result:
      "Apresente roteiro, benefícios e condições com mais clareza antes de mandar o link pelo WhatsApp.",
  },
  {
    image: crmLeads,
    title: "CRM para não perder interessados",
    result:
      "Registre leads, cotações e oportunidades para fazer follow-up com mais controle.",
  },
];

const includedResultCards = [
  ["Site Editável e CRM", "Tenha um site pronto para enviar ofertas aos clientes e controle tudo num só lugar."],
  ["Gerador de Imagens", "Crie imagens bonitas das suas ofertas usando nossa Fábrica de Destinos."],
  ["250 Reels e 400 Artes", "Receba material de vídeo e imagem para o ano inteiro, tudo pronto para postar."],
  ["Templates no Canva", "Tudo é personalizável no Canva. Mude as cores, adicione sua logo e telefone."],
  ["Agentes de IA e Roteiros", "Peça para a Inteligência Artificial criar os roteiros de viagem e os textos de venda."],
  ["Suporte no WhatsApp", "Você nunca estará sozinho. Tem dúvida? É só chamar nosso time no WhatsApp."],
];

const trustProofMetrics = [
  ["7 dias", "para testar com garantia"],
  ["12 meses", "de acesso no plano anual"],
  ["R$ 817", "de economia no plano anual"],
  ["250 Reels", "para deixar o perfil mais profissional"],
];

const objectionCards = [
  ["Será que eu vou saber usar?", "Sim. A ideia é você entrar, escolher o que quer criar e seguir modelos prontos. Não precisa começar do zero."],
  ["Isso serve para agência pequena?", "Serve principalmente para agência pequena, consultor e equipe enxuta que precisa parecer mais profissional sem contratar uma estrutura cara."],
  ["Vale a pena pagar por isso?", "Se ela economizar algumas horas por mês e melhorar a apresentação de uma única oferta, o plano anual já tende a se pagar rápido."],
  ["O acesso é imediato?", "Sim. Depois da compra pela Stripe, você recebe as instruções de acesso no e-mail usado no checkout."],
  ["Mensal ou anual?", "O mensal é para testar com menor compromisso. O anual é a melhor escolha: custa menos por mês, libera 12 meses e economiza R$ 817."],
];

const afterPurchaseSteps = [
  ["1", "Compra segura", "Você escolhe mensal ou anual e finaliza pela Stripe."],
  ["2", "Acesso liberado", "As instruções chegam no e-mail usado no checkout."],
  ["3", "Primeira oferta", "Use um pacote real para criar anúncio, página e textos de venda."],
];

const socialProofChats = [
  {
    label: "Venda para Disney",
    messages: [
      { sender: "client", text: "Lucas, em menos de 24 horas tive minha primeira venda para Disney usando os anúncios que você ensina." },
      { sender: "client", text: "Antes aparecia muita gente curiosa, mas eu não conseguia fechar." },
      { sender: "client", text: "Usei a IA para montar o roteiro rápido, subi o anúncio e começou a chegar gente no WhatsApp." },
      { sender: "lucas", text: "Excelente. Agora o principal é atender rápido e fazer follow-up." },
      { sender: "client", text: "Sim, vou focar nisso agora." },
    ],
  },
  {
    label: "23 orçamentos",
    messages: [
      { sender: "client", text: "Lucas, queria te contar uma coisa." },
      { sender: "client", text: "Usei aquele modelo de anúncio para a promoção de férias e funcionou aqui na minha cidade." },
      { sender: "client", text: "Com pouca verba apareceu muita gente interessada." },
      { sender: "client", text: "Fiz 23 orçamentos só ontem e fechei 5 pacotes." },
    ],
  },
  {
    label: "Oferta mais profissional",
    messages: [
      { sender: "client", text: "Antes eu mandava o pacote só por texto no WhatsApp e o cliente já pedia desconto." },
      { sender: "client", text: "Agora mandei a página com o roteiro mais organizado e a conversa mudou." },
      { sender: "client", text: "O cliente entendeu melhor o valor antes de perguntar o preço final." },
      { sender: "lucas", text: "Esse é o ponto: aumentar a percepção antes do orçamento." },
    ],
  },
  {
    label: "Leads organizados",
    messages: [
      { sender: "client", text: "O CRM me ajudou a ver quem pediu cotação e quem ainda precisava de retorno." },
      { sender: "client", text: "Antes eu perdia conversa no WhatsApp." },
      { sender: "client", text: "Agora sei melhor quem responder primeiro." },
      { sender: "lucas", text: "Esse controle evita que oportunidade quente esfrie por falta de acompanhamento." },
    ],
  },
];

const faqs = [
  {
    q: "Preciso saber design ou dominar Canva?",
    a: "Não. A plataforma foi pensada para agência de viagem que precisa vender, não para designer. Você parte de modelos, textos e estruturas prontas, ajusta destino, preço, logo e publica.",
  },
  {
    q: "Isso substitui o Canva Pro?",
    a: "Não é a mesma coisa. Canva Pro é uma ferramenta genérica. O Canva Viagem entrega materiais, IA, páginas, CRM e fluxos pensados especificamente para vender pacotes de viagem.",
  },
  {
    q: "Mensal ou anual, qual escolher?",
    a: "O mensal custa R$ 97/mês e serve para começar com menor compromisso. O anual custa R$ 347 por ano, libera 12 meses de acesso e é o plano com maior economia.",
  },
  {
    q: "O pagamento é seguro?",
    a: "Sim. O pagamento é processado pela Stripe, com acesso imediato e garantia de 7 dias conforme as regras do checkout.",
  },
  {
    q: "E se eu não gostar?",
    a: "Você tem 7 dias para testar com um pacote real da sua agência. Se não fizer sentido, solicite reembolso dentro do prazo da garantia.",
  },
  {
    q: "Funciona pelo celular?",
    a: "Sim. Você consegue acessar e usar pelo celular. Para montar páginas e organizar campanhas com mais conforto, o computador ajuda bastante.",
  },
  {
    q: "O acesso chega como?",
    a: "Depois da compra, você recebe as instruções de acesso no e-mail usado no checkout. Se precisar de ajuda, o suporte pode orientar pelo WhatsApp.",
  },
  {
    q: "Posso usar para várias marcas?",
    a: "Os planos são individuais por agência ou marca. Se você gerencia mais de uma operação, fale com o suporte para entender a melhor opção.",
  },
];

function ChatCard({ proof }: { proof: (typeof socialProofChats)[number] }) {
  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="bg-slate-900 text-white px-5 py-3 flex items-center justify-between">
        <span className="font-black text-sm">{proof.label}</span>
        <span className="text-[11px] text-green-300 font-bold">dados sensíveis ocultados</span>
      </div>
      <div className="p-4 space-y-3 bg-[#e5ddd5]">
        {proof.messages.map((message, index) => (
          <div
            key={`${proof.label}-${index}`}
            className={`max-w-[88%] rounded-2xl px-4 py-2 text-sm leading-relaxed shadow-sm ${
              message.sender === "lucas"
                ? "ml-auto bg-[#d9fdd3] text-slate-800"
                : "bg-white text-slate-800"
            }`}
          >
            {message.text}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Inicio2() {
  const [activeToolTab, setActiveToolTab] = useState("featured");
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [heroMutedActive, setHeroMutedActive] = useState(true);
  const [activePlan, setActivePlan] = useState(2);
  const [isPricingVisible, setIsPricingVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsPricingVisible(entry.isIntersecting);
      },
      { threshold: 0.1 }
    );
    const pricingEl = document.getElementById("planos");
    if (pricingEl) {
      observer.observe(pricingEl);
    }
    return () => observer.disconnect();
  }, []);

  const plans = [
    {
      id: "mensal",
      name: "Plano Mensal",
      price: ELITE_OFFER.monthlyPrice,
      monthlyEquivalent: ELITE_OFFER.monthlyPrice,
      checkoutUrl: ELITE_OFFER.monthlyCheckoutUrl,
      trackValue: 97,
      popular: false,
      features: [
        "Acesso a todos os recursos",
        "Cancele quando quiser",
        "Suporte via WhatsApp",
        "3 dias grátis inclusos",
      ]
    },
    {
      id: "semestral",
      name: "Plano Semestral",
      price: "R$ 347",
      monthlyEquivalent: "R$ 57,83",
      checkoutUrl: "https://buy.stripe.com/8x2cN60HwcaY2Yr38w8so0j",
      trackValue: 347,
      popular: false,
      features: [
        "Acesso a todos os recursos",
        "6 meses de acesso garantido",
        "Suporte via WhatsApp",
        "Economia de R$235 vs mensal",
        "3 dias grátis inclusos",
      ]
    },
    {
      id: "anual",
      name: "Plano Anual",
      price: ELITE_OFFER.annualPrice,
      monthlyEquivalent: ELITE_OFFER.annualMonthlyEquivalent,
      checkoutUrl: ELITE_OFFER.annualCheckoutUrl,
      trackValue: 482,
      popular: true,
      features: [
        "Acesso a todos os recursos",
        "12 meses de acesso completo",
        "Suporte via WhatsApp",
        "Suporte prioritário",
        "3 dias grátis inclusos",
      ]
    }
  ];

  const trackCheckoutClick = (value: number, plan: "anual" | "mensal") => {
    const fbq = (window as Window & { fbq?: (...args: unknown[]) => void }).fbq;
    if (!fbq) return;

    fbq("trackSingle", metaPixelId, "InitiateCheckout", {
      value,
      currency: "BRL",
      content_name: `Canva Viagem ${plan}`,
      content_category: "inicio2",
    });
  };

  useEffect(() => {
    document.documentElement.lang = "pt-BR";
    const sticky = document.querySelector(".mobile-sticky");
    const planos = document.getElementById("planos");
    if (!sticky) return;

    const handleScroll = () => {
      const isPlanosVisible = planos ? planos.getBoundingClientRect().top < window.innerHeight : false;
      const hasScrolledEnough = window.scrollY > 620;

      if (hasScrolledEnough && !isPlanosVisible) {
        sticky.classList.add("is-visible");
      } else {
        sticky.classList.remove("is-visible");
      }
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="inicio-page" data-page-version="inicio2-pt-br-2026-06-23-reels">
      <header className="site-header">
        <div className="header-inner">
          <img src={logoImage} alt="Canva Viagem" className="logo" />
          <a href="#planos" className="header-cta">Testar grátis</a>
        </div>
      </header>

      <main>\n<section id="hero" className="relative bg-[#0F172A] overflow-hidden pt-24 pb-16 md:pt-32 md:pb-24 lg:pt-40 lg:pb-32">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-purple-600/20 rounded-full blur-[120px] -z-10" />

          <div className="inicio-container relative z-10 mx-auto">
            <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
              <div className="w-full lg:w-[60%] flex flex-col items-center lg:items-start text-center lg:text-left">
                <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-900/40 to-blue-900/40 border border-purple-500/30 rounded-full px-4 py-1.5 md:px-5 md:py-2 backdrop-blur-md shadow-[0_0_30px_rgba(124,58,237,0.15)] mb-4 md:mb-6">
                  <span className="text-[10px] md:text-xs font-bold text-purple-200 uppercase tracking-widest">
                    🔥 Acesso imediato liberado para novas agências
                  </span>
                </div>

                <h1 className="text-[28px] sm:text-4xl md:text-5xl lg:text-[4.5rem] font-black text-white leading-[1.05] mb-3 tracking-tighter" style={{ fontSize: "clamp(28px, 6vw, 4.5rem)" }}>
                  Sua agência parece profissional ou parece pequena?
                </h1>

                <p className="text-sm sm:text-base md:text-lg lg:text-xl text-slate-300 font-medium mb-4 max-w-2xl leading-relaxed">
                  O Canva Viagem entrega tudo pronto para você criar ofertas, postar no Instagram, narrar vídeos e organizar seus clientes. Sem designer. Sem social media. Sem locutor. Sem improviso.
                </p>

                <div className="bg-emerald-500/10 border border-emerald-500/20 px-4 py-2 md:px-5 md:py-2.5 rounded-lg md:rounded-xl mb-5 shadow-lg shadow-emerald-500/5 max-w-2xl backdrop-blur-sm">
                  <p className="font-semibold text-[11px] md:text-[13px] !text-emerald-300 leading-snug" style={{ color: '#6ee7b7' }}>
                    ⚡ A ferramenta simples que te dá tudo pronto para você focar no que realmente importa: fechar vendas.
                  </p>
                </div>

                {/* PRÉVIA VISUAL NO MOBILE - APARECE LOGO NA PRIMEIRA TELA SEM ROLAGEM */}
                <div className="w-full lg:hidden my-4 flex justify-center relative">
                  <div className="relative w-full max-w-[350px] sm:max-w-[400px]">
                    <img src={heroDashboard} alt="Dashboard Canva Viagem" className="w-full rounded-[12px] shadow-2xl relative z-10 border border-slate-700/60" />
                    <div className="absolute top-[8%] -left-[3%] bg-slate-900/90 backdrop-blur-md border border-purple-500/30 text-white px-2.5 py-1 rounded-lg shadow-xl z-20 text-[11px] font-bold flex items-center gap-1.5 transform -rotate-2">
                      <ImageIcon size={14} className="text-purple-400"/> Anúncios 5s
                    </div>
                    <div className="absolute bottom-[12%] -right-[3%] bg-slate-900/90 backdrop-blur-md border border-emerald-500/30 text-white px-2.5 py-1 rounded-lg shadow-xl z-20 text-[11px] font-bold flex items-center gap-1.5 transform rotate-2">
                      <Users size={14} className="text-emerald-400"/> CRM Leads
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-2.5 md:gap-4 mb-6 w-full max-w-2xl">
                  <a href="#planos" className="w-full sm:w-auto min-h-[52px] bg-purple-600 hover:bg-purple-500 text-white text-sm md:text-base font-bold py-3 px-7 rounded-full shadow-[0_0_40px_rgba(124,58,237,0.6)] transition-all hover:-translate-y-1 flex items-center justify-center whitespace-nowrap active:scale-95 animate-[pulse_2.5s_ease-in-out_infinite]">
                    Iniciar 3 dias grátis (Sem cobrança hoje)
                  </a>
                  <a href="#video-prova" className="w-full sm:w-auto bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 py-3 px-6 rounded-full font-bold transition-transform hover:-translate-y-1 flex items-center justify-center gap-2 whitespace-nowrap text-xs md:text-sm active:scale-95">
                    <Play size={16} fill="currentColor" /> Ver ferramenta funcionando
                  </a>
                </div>

                <div className="flex flex-wrap justify-center lg:justify-start gap-x-3 gap-y-2 w-full max-w-[700px] text-slate-400 text-[11px] md:text-xs font-semibold">
                  <span className="whitespace-nowrap">✓ Acesso imediato</span>
                  <span className="hidden md:inline">·</span>
                  <span className="whitespace-nowrap">✓ Checkout seguro Stripe</span>
                  <span className="hidden md:inline">·</span>
                  <span className="whitespace-nowrap">✓ 3 dias grátis</span>
                  <span className="hidden md:inline">·</span>
                  <span className="whitespace-nowrap">✓ 7 dias de garantia</span>
                  <span className="hidden md:inline">·</span>
                  <span className="whitespace-nowrap">✓ Cancele com 1 clique</span>
                </div>
              </div>

              {/* PRÉVIA VISUAL NO DESKTOP */}
              <div className="hidden lg:flex w-[40%] justify-center relative mt-0">
                <div className="relative w-full max-w-[400px]">
                  <img src={heroDashboard} alt="Dashboard Canva Viagem" className="w-full rounded-[12px] shadow-2xl relative z-10 border border-slate-700/60" />
                  
                  <div className="absolute top-[10%] -left-[5%] md:-left-[15%] bg-white/10 backdrop-blur-md border border-white/20 text-white px-3 py-1.5 md:px-4 md:py-2 rounded-lg shadow-xl z-20 text-xs md:text-sm font-bold flex items-center gap-2 transform -rotate-2">
                    <ImageIcon size={16} className="text-purple-400"/> Anúncios
                  </div>
                  <div className="absolute top-[30%] -right-[2%] md:-right-[10%] bg-white/10 backdrop-blur-md border border-white/20 text-white px-3 py-1.5 md:px-4 md:py-2 rounded-lg shadow-xl z-20 text-xs md:text-sm font-bold flex items-center gap-2 transform rotate-3">
                    <LayoutDashboard size={16} className="text-blue-400"/> Sites
                  </div>
                  <div className="absolute bottom-[40%] -left-[2%] md:-left-[10%] bg-white/10 backdrop-blur-md border border-white/20 text-white px-3 py-1.5 md:px-4 md:py-2 rounded-lg shadow-xl z-20 text-xs md:text-sm font-bold flex items-center gap-2 transform rotate-1">
                    <Video size={16} className="text-pink-400"/> Vídeos
                  </div>
                  <div className="absolute bottom-[20%] -right-[2%] md:-right-[5%] bg-white/10 backdrop-blur-md border border-white/20 text-white px-3 py-1.5 md:px-4 md:py-2 rounded-lg shadow-xl z-20 text-xs md:text-sm font-bold flex items-center gap-2 transform -rotate-3">
                    <Users size={16} className="text-emerald-400"/> CRM
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-[#0F172A] pb-12 lg:pb-16 border-b border-slate-800/80">
          <div className="inicio-container">
            <div id="video-prova" className="inicio2-hero-video mx-auto">
              <div className="inicio2-hero-video-top">
                <span>Veja antes de comprar</span>
                <strong>Vídeo real da ferramenta</strong>
              </div>
              <div className="inicio2-hero-video-frame">
                {heroMutedActive ? (
                  <>
                    <iframe
                      title="Lucas usando o Canva Viagem"
                      src="https://www.youtube.com/embed/R2MyCdox--I?autoplay=1&mute=1&controls=0&loop=1&playlist=R2MyCdox--I&modestbranding=1&rel=0&iv_load_policy=3&showinfo=0"
                      allow="autoplay; encrypted-media; picture-in-picture"
                      allowFullScreen
                    />
                    <button
                      type="button"
                      onClick={() => setHeroMutedActive(false)}
                      className="absolute inset-0 flex items-center justify-center bg-slate-950/10 hover:bg-slate-950/0 transition-colors"
                    >
                      <span className="bg-white text-slate-950 font-black rounded-full px-6 py-3 shadow-xl flex items-center gap-2">
                        <Play size={18} fill="currentColor" /> Assistir com som
                      </span>
                    </button>
                  </>
                ) : (
                  <iframe
                    title="Lucas usando o Canva Viagem com áudio"
                    src="https://www.youtube.com/embed/R2MyCdox--I?autoplay=1&controls=1&modestbranding=1&rel=0"
                    allow="autoplay; encrypted-media; picture-in-picture"
                    allowFullScreen
                  />
                )}
              </div>
              <div className="inicio2-hero-video-footer">
                <span>Vídeo curto: veja Lucas criando uma oferta e mostrando como a ferramenta funciona por dentro.</span>
              </div>
            </div>
          </div>
        </section>

        <div className="w-full bg-white pt-8">
          <div className="inicio-container">
            <div className="bg-[#7C3AED] text-white text-center text-[14px] font-medium py-[12px] px-[24px] rounded-[8px] mx-auto max-w-[720px]">
              🟢 Mais de 200 agências já usam a plataforma. Os 3 dias grátis incluem acesso completo a todos os recursos, sem nenhuma restrição.
            </div>
          </div>
        </div>

        <section className="bg-white py-16">
          <div className="inicio-container">
            <div className="text-center max-w-3xl mx-auto mb-12">
              <p className="text-purple-600 font-black uppercase tracking-[0.25em] text-[11px] md:text-xs mb-4">COMO FUNCIONA NA PRÁTICA</p>
              <h2 className="section-title w-full text-center">
                Veja como funciona na prática. Sem abstração, sem teoria, direto ao ponto.
              </h2>
            </div>
            <div className="grid md:grid-cols-3 gap-4 sm:gap-6 md:gap-8 mb-10">
              <div className="flex flex-col text-left bg-[#F8FAFC] border border-[#E2E8F0] rounded-[16px] p-6 shadow-sm">
                <div className="text-4xl mb-4">🏭</div>
                <h3 className="font-bold text-lg text-slate-900 mb-3">1. Digite seu roteiro</h3>
                <p className="text-[#7C3AED] text-[14px] font-bold mb-2">
                  Você digita: Paris, 7 dias, casal, R$8.000
                </p>
                <p className="text-[#64748B] text-[13px] leading-relaxed">
                  A IA entrega anúncio pronto, página de pacote, roteiro completo e texto de WhatsApp. Tudo de uma vez só.
                </p>
              </div>
              <div className="flex flex-col text-left bg-[#F8FAFC] border border-[#E2E8F0] rounded-[16px] p-6 shadow-sm">
                <div className="text-4xl mb-4">📱</div>
                <h3 className="font-bold text-lg text-slate-900 mb-3">2. Baixe em 3 minutos</h3>
                <p className="text-[#7C3AED] text-[14px] font-bold mb-2">
                  Você escolhe o destino no calendário de postagens.
                </p>
                <p className="text-[#64748B] text-[13px] leading-relaxed">
                  Baixa o Reel ou a arte, coloca seu logo e publica. Feito em menos de 3 minutos.
                </p>
              </div>
              <div className="flex flex-col text-left bg-[#F8FAFC] border border-[#E2E8F0] rounded-[16px] p-6 shadow-sm">
                <div className="text-4xl mb-4">🤖</div>
                <h3 className="font-bold text-lg text-slate-900 mb-3">3. Venda na hora no WhatsApp</h3>
                <p className="text-[#7C3AED] text-[14px] font-bold mb-2">
                  Você pergunta: como convencer um cliente que achou caro?
                </p>
                <p className="text-[#64748B] text-[13px] leading-relaxed">
                  A IA responde com o argumento de venda pronto para o WhatsApp na mesma hora.
                </p>
              </div>
            </div>
            <div className="text-center mt-10">
              <a href="#planos" className="btn btn-primary inline-flex shadow-[0_0_20px_rgba(124,58,237,0.3)]">
                Criar minha primeira oferta →
              </a>
            </div>
          </div>
        </section>

        <section className="bg-white py-8 lg:py-12">
          <div className="inicio-container">
            <div className="text-center max-w-3xl mx-auto mb-10">
              <p className="text-purple-600 font-black uppercase tracking-[0.25em] text-[11px] md:text-xs mb-4">não é teoria</p>
              <h2 className="section-title w-full text-center">Veja antes de entrar</h2>
              <p className="section-subtitle w-full text-center mt-4">
                Prints reais da plataforma. Sem mockup. Sem promessa vazia.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {platformProofScreens.map((item) => (
                <div key={item.title} className="rounded-[2rem] border border-slate-100 bg-white overflow-hidden shadow-lg shadow-slate-200/50 hover:shadow-xl transition-shadow group">
                  <div className="aspect-[4/3] bg-slate-100 overflow-hidden relative">
                    <div className="absolute inset-0 bg-slate-900/5 group-hover:bg-transparent transition-colors z-10"></div>
                    <img src={item.image} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  </div>
                  <div className="p-6 md:p-8">
                    <h3 className="text-xl font-black text-slate-900 mb-3">{item.title}</h3>
                    <p className="text-slate-600 leading-relaxed text-base">{item.result}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="text-center mt-10">
              <a href="#planos" className="btn btn-primary inline-flex shadow-[0_0_20px_rgba(124,58,237,0.3)]">
                Quero usar essas ferramentas →
              </a>
            </div>
          </div>
        </section>

        <section className="py-8 lg:py-12 bg-[#F8FAFC] border-y border-slate-200">
          <div className="inicio-container">
            <div className="text-center max-w-3xl mx-auto mb-12">
              <h2 className="section-title w-full text-center">Escolha o que precisa criar hoje</h2>
              <p className="section-subtitle w-full text-center mt-4">
                A nova plataforma mantém a força da versão LATAM, mas fala direto com a rotina da agência no Brasil.
              </p>
            </div>

            <div className="flex overflow-x-auto whitespace-nowrap md:flex-wrap justify-start md:justify-center gap-2 sm:gap-3 mb-10 pb-2 px-1 scrollbar-none">
              {[
                { id: "featured", label: "Principais" },
                { id: "video", label: "Vídeos" },
                { id: "design", label: "Artes" },
                { id: "ia", label: "IA" },
                { id: "sales", label: "Venda" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveToolTab(tab.id)}
                  className={`shrink-0 px-5 sm:px-6 py-2.5 sm:py-3 rounded-full font-black text-sm transition-all duration-300 shadow-sm ${
                    activeToolTab === tab.id ? "bg-slate-950 text-white shadow-slate-950/20 scale-105" : "bg-white text-slate-600 border border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              {[
                [showcaseAdCreation, "Criação de anúncios com IA", "Transforme pacote, preço e condições em anúncio pronto para tráfego e Instagram.", <MessageSquare size={20} />],
                [showcaseLandingPages, "Páginas de pacote", "Monte uma página mais clara para enviar no WhatsApp e aumentar percepção de valor.", <MonitorSmartphone size={20} />],
                [showcaseCrm, "CRM de leads", "Organize interessados, orçamentos e próximos retornos sem perder conversa quente.", <Users size={20} />],
                [showcaseScheduler, "Calendário de postagens", "Saia do improviso e publique com mais constância durante a semana.", <Calendar size={20} />],
                [showcasePremiumMedias, "Mídias premium", "Use vídeos, artes e materiais de turismo sem depender de uma criação do zero.", <ImageIcon size={20} />],
                [dashboardInterno, "Tudo no mesmo painel", "Acesse IA, mídia, páginas, CRM e materiais sem trocar de ferramenta o tempo todo.", <LayoutDashboard size={20} />],
              ].map(([image, title, copy, icon]) => (
                <div key={String(title)} className="rounded-[2rem] bg-white border border-slate-100 overflow-hidden shadow-lg shadow-slate-200/50 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                  <div className="aspect-[4/3] bg-slate-100 overflow-hidden group">
                    <img src={image as string} alt={String(title)} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  </div>
                  <div className="p-6 md:p-8">
                    <div className="flex items-center gap-3 text-purple-700 mb-4 bg-purple-50 w-fit px-3 py-1.5 rounded-xl border border-purple-100">
                      {icon as JSX.Element}
                      <h3 className="font-black text-slate-950 text-sm md:text-base">{String(title)}</h3>
                    </div>
                    <p className="text-slate-600 leading-relaxed text-sm md:text-base">{String(copy)}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="text-center mt-12">
              <a href="#planos" className="btn btn-primary inline-flex shadow-[0_0_20px_rgba(124,58,237,0.3)] px-8 py-4 text-lg">
                Garantir acesso a todas as ferramentas →
              </a>
            </div>
          </div>
        </section>

        <section className="bg-slate-50 py-8 lg:py-12 border-y border-slate-200">
          <div className="inicio-container">
            <div className="grid lg:grid-cols-[0.95fr_1.05fr] gap-8 lg:gap-12 items-center">
              <div>
                <p className="text-purple-600 font-black uppercase tracking-[0.25em] text-[11px] md:text-xs mb-4">antes e depois</p>
                <h2 className="section-title mb-6">A mesma viagem pode parecer barata ou valiosa dependendo da apresentação</h2>
                <p className="section-subtitle text-lg md:text-xl">
                  O Canva Viagem ajuda sua agência a sair do improviso visual e apresentar pacotes com mais confiança.
                </p>
              </div>
              <div className="grid sm:grid-cols-2 gap-6">
                <div className="rounded-[2rem] bg-white border border-red-100 overflow-hidden shadow-md">
                  <img src={antesAmador} alt="Oferta de viagem com visual amador" className="w-full" />
                  <div className="p-6 md:p-8 bg-red-50/50">
                    <h3 className="font-black text-red-600 text-lg mb-2">Antes</h3>
                    <p className="text-slate-600 text-sm md:text-base leading-relaxed">Oferta improvisada, pouca clareza e menor percepção de valor.</p>
                  </div>
                </div>
                <div className="sm:hidden flex justify-center my-[-10px] z-10">
                  <span className="bg-purple-600 text-white font-black text-xs uppercase tracking-wider px-4 py-1.5 rounded-full shadow-md animate-bounce">
                    ⬇️ Veja a transformação com IA ⬇️
                  </span>
                </div>
                <div className="rounded-[2rem] bg-white border border-green-100 overflow-hidden shadow-lg shadow-green-600/5 ring-4 ring-green-500/10 relative">
                  <div className="absolute top-4 right-4 bg-green-500 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider">Novo Padrão</div>
                  <img src={depoisPremium} alt="Oferta de viagem com visual profissional" className="w-full" />
                  <div className="p-6 md:p-8 bg-green-50/50">
                    <h3 className="font-black text-green-600 text-lg mb-2">Depois</h3>
                    <p className="text-slate-600 text-sm md:text-base leading-relaxed">Apresentação organizada, visual premium e oferta muito fácil de entender.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-slate-950 py-8 lg:py-12 relative overflow-hidden">
          <div className="absolute top-1/2 left-0 -translate-y-1/2 w-[800px] h-[800px] bg-blue-600/10 rounded-full blur-[120px] -z-10 pointer-events-none" />
          <div className="inicio-container grid lg:grid-cols-[0.85fr_1.15fr] gap-8 lg:gap-12 items-center relative z-10">
            <div>
              <p className="text-cyan-300 font-black uppercase tracking-[0.25em] text-[11px] md:text-xs mb-5">como ajudamos você</p>
              <h2 className="text-3xl md:text-5xl font-black text-white leading-[1.1] mb-8">
                Chega de perder vendas por passar uma imagem amadora.
              </h2>
              <div className="space-y-5 leading-relaxed">
                <p className="text-[#C4B5FD] text-[15px]">Você sabe que precisa melhorar o marketing da sua agência. Mas entre atender cliente, montar roteiro e responder WhatsApp, o dia acaba antes de você criar uma arte sequer.</p>
                <p className="text-[#E2E8F0] text-[15px] font-[600]">É exatamente para esse agente que o Canva Viagem foi construído.</p>
              </div>
              <a href="#planos" className="btn btn-primary mt-10 inline-flex px-8 py-4 text-lg shadow-[0_0_30px_rgba(124,58,237,0.4)]">Criar ofertas mais profissionais</a>
            </div>

            <div className="grid sm:grid-cols-2 gap-5">
              {[
                ["Suas artes parecem amadoras", "O pacote até é bom, mas a apresentação não passa segurança."],
                ["Você perde lead no WhatsApp", "Leads quentes ficam perdidos entre conversas antigas."],
                ["Você para enquanto espera o designer", "Você espera terceiros para publicar uma promoção simples."],
                ["O cliente pede desconto sem entender o valor", "O cliente não entende roteiro, benefícios e condições antes do preço."],
              ].map(([title, copy]) => (
                <div key={title} className="rounded-3xl border border-white/5 bg-white/5 hover:bg-white/10 p-6 backdrop-blur-sm transition-colors shadow-lg">
                  <h3 className="text-white font-black text-lg mb-3">{title}</h3>
                  <p className="text-slate-400 leading-relaxed text-sm md:text-base">{copy}</p>
                </div>
              ))}
            </div>
          </div>
        </section>


        <section className="bg-white py-16">
          <div className="inicio-container">
            <div className="text-center max-w-3xl mx-auto mb-12">
              <p className="text-purple-600 font-black uppercase tracking-[0.25em] text-[11px] md:text-xs mb-4">POR QUE CONFIAR NO PRODUTO</p>
              <h2 className="section-title w-full text-center">Lucas Ferrari não é um guru de marketing. É especialista no problema que você tem.</h2>
            </div>

            <div className="max-w-4xl mx-auto bg-slate-900 rounded-[2rem] p-8 md:p-12 text-white shadow-xl shadow-slate-900/10 mb-16">
               <div className="flex flex-col md:flex-row items-center gap-8">
                 <img src={lucasPortrait} alt="Lucas Ferrari" className="w-32 h-32 rounded-2xl object-cover border-4 border-slate-700/50 flex-shrink-0" />
                 <div>
                   <h3 className="text-2xl md:text-3xl font-black mb-4 text-center md:text-left">Lucas Ferrari</h3>
                   <p className="text-slate-300 leading-relaxed text-base mb-6 text-center md:text-left">
                     Antes de criar o Canva Viagem, Lucas Ferrari gerenciou campanhas de tráfego pago para mais de 40 agências no Brasil. Ele viu de perto o mesmo problema se repetindo: agentes com pacotes excelentes, mas sem material profissional para divulgar. O Canva Viagem nasceu para resolver exatamente esse desafio e hoje impulsiona as vendas de mais de 200 agências de turismo.
                   </p>

                   <div className="flex gap-0 border-t border-[#1E293B] mt-[16px] pt-[16px] mb-6">
                     <div className="w-1/3 text-center border-r border-[#1E293B]">
                       <div className="text-[18px] md:text-[22px] font-[800] text-[#7C3AED]">200+</div>
                       <div className="text-[10px] md:text-[11px] text-[#94A3B8] mt-[2px]">agências ativas</div>
                     </div>
                     <div className="w-1/3 text-center border-r border-[#1E293B]">
                       <div className="text-[18px] md:text-[22px] font-[800] text-[#7C3AED]">R$1.5M+</div>
                       <div className="text-[10px] md:text-[11px] text-[#94A3B8] mt-[2px]">gerenciados</div>
                     </div>
                     <div className="w-1/3 text-center">
                       <div className="text-[18px] md:text-[22px] font-[800] text-[#7C3AED]">100%</div>
                       <div className="text-[10px] md:text-[11px] text-[#94A3B8] mt-[2px]">focado no turismo</div>
                     </div>
                   </div>

                   <div className="flex flex-wrap justify-center md:justify-start gap-4">
                     <a href={instagramUrl} target="_blank" rel="noopener noreferrer" className="bg-white hover:bg-slate-100 transition-colors text-slate-900 rounded-2xl px-6 py-3 font-black flex items-center justify-center gap-2">
                       <Instagram size={20} /> Instagram
                     </a>
                     <a href={supportWhatsAppUrl} target="_blank" rel="noopener noreferrer" className="bg-green-500 hover:bg-green-400 transition-colors text-slate-950 rounded-2xl px-6 py-3 font-black flex items-center justify-center gap-2">
                       <MessageSquare size={20} /> WhatsApp
                     </a>
                   </div>
                 </div>
               </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
              {[
                {
                  text: "Em menos de 24 horas tive minha primeira venda para Disney usando os anúncios que a IA gerou.",
                  name: "Maria S.",
                  role: "Agente autônoma • São Paulo, SP",
                  result: "1ª venda em 24h"
                },
                {
                  text: "Usei aquele modelo de anúncio para a promoção de férias e funcionou aqui na minha cidade. Com pouca verba apareceu muita gente interessada. Fiz 23 orçamentos só ontem e fechei 5 pacotes.",
                  name: "Ricardo T.",
                  role: "Agência de Viagens • Curitiba, PR",
                  result: "5 pacotes fechados"
                },
                {
                  text: "Antes eu mandava o pacote só por texto no WhatsApp e o cliente já pedia desconto. Agora mandei a página com o roteiro mais organizado e a conversa mudou. O cliente entendeu melhor o valor antes de perguntar o preço final.",
                  name: "Ana C.",
                  role: "Consultora de Viagens • Rio de Janeiro, RJ",
                  result: "Venda sem pedir desconto"
                }
              ].map((testimonial, index) => (
                <div key={index} className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-[12px] p-[24px] shadow-[0_2px_8px_rgba(0,0,0,0.06)] flex flex-col">
                  <div className="flex gap-1 mb-4">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star key={star} size={16} className="fill-[#F59E0B] text-[#F59E0B]" />
                    ))}
                  </div>
                  <p className="text-[#1E293B] text-[15px] leading-[1.6] italic mb-6 flex-grow">
                    "{testimonial.text}"
                  </p>
                  <div className="mt-auto">
                    <p className="text-[#0F172A] font-bold text-[14px]">{testimonial.name}</p>
                    <p className="text-[#64748B] text-[13px] mb-3">{testimonial.role}</p>
                    <p className="text-[#16A34A] font-bold text-[13px]">✓ Resultado: {testimonial.result}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-slate-950 py-8 lg:py-12 relative overflow-hidden">
          <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[100px] -z-10 pointer-events-none" />
          <div className="inicio-container relative z-10">
            <div className="text-center max-w-3xl mx-auto mb-10">
              <p className="text-cyan-300 font-black uppercase tracking-[0.25em] text-[11px] md:text-xs mb-4">valor percebido</p>
              <h2 className="text-3xl md:text-5xl font-black text-white leading-tight mb-6">Tudo que sua agência recebe em um único lugar</h2>
              <p className="text-slate-300 text-lg md:text-xl">
                Cada recurso foi conectado a um resultado prático: publicar mais rápido, parecer mais profissional e vender com mais organização.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              {includedResultCards.map(([title, copy]) => (
                <div key={title} className="bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-colors rounded-[2rem] p-8 backdrop-blur-sm">
                  <CheckCircle2 size={28} className="text-green-400 mb-5" />
                  <h3 className="text-white font-black text-xl mb-3">{title}</h3>
                  <p className="text-slate-400 leading-relaxed text-base">{copy}</p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-5 lg:gap-6 mt-12">
              {trustProofMetrics.map(([value, label]) => (
                <div key={value} className="bg-white rounded-[2rem] p-6 lg:p-8 text-center shadow-xl shadow-slate-950/50">
                  <div className="text-3xl lg:text-4xl font-black text-slate-950 mb-2">{value}</div>
                  <div className="text-sm font-bold text-slate-500">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="demo" className="demo py-8 lg:py-12 bg-white">
          <div className="inicio-container">
            <div className="text-center max-w-3xl mx-auto mb-10">
              <h2 className="section-title w-full text-center">Dashboard inteligente para quem vende viagens</h2>
              <p className="section-subtitle w-full text-center mt-4">
                Tudo que sua agência precisa em uma única tela, fácil de usar e direto ao ponto.
              </p>
            </div>

            <div className="w-full max-w-[1000px] mx-auto mt-8 sm:mt-10 rounded-[24px] overflow-hidden border border-slate-100 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)] hover:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.15)] transition-shadow">
              <img src={heroDashboard} alt="Dashboard do Canva Viagem" className="w-full block" />
            </div>

            <div className="grid md:grid-cols-3 gap-6 lg:gap-8 mt-10 max-w-5xl mx-auto">
              {[
                ["1", "Digite o destino", "Exemplo: pacote para Maldivas, Disney, Gramado ou Jericoacoara."],
                ["2", "A IA cria", "Receba anúncio, legenda, argumentos de venda e estrutura de página."],
                ["3", "Publique e acompanhe", "Use no Instagram, WhatsApp, página de venda e CRM."],
              ].map(([number, title, copy]) => (
                <div key={title} className="bg-slate-50 border border-slate-100 rounded-[2rem] p-8 text-center relative overflow-hidden group hover:bg-white hover:border-purple-200 hover:shadow-xl transition-all duration-300">
                  <div className="absolute top-0 right-0 text-[100px] font-black text-slate-900/5 -mt-8 -mr-4 group-hover:text-purple-600/5 transition-colors">{number}</div>
                  <div className="w-12 h-12 rounded-2xl bg-purple-600 text-white font-black text-xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-purple-600/30 group-hover:scale-110 transition-transform">
                    {number}
                  </div>
                  <h3 className="text-xl font-black text-slate-900 mb-3">{title}</h3>
                  <p className="text-slate-600 leading-relaxed text-base relative z-10">{copy}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-white py-8 lg:py-12 border-b border-slate-100">
          <div className="inicio-container">
            <div className="grid lg:grid-cols-[0.95fr_1.05fr] gap-8 lg:gap-12 items-center">
              <div>
                <p className="text-cyan-600 font-black uppercase tracking-[0.2em] text-[10px] md:text-[11px] mb-3">INCLUSO EM TODOS OS PLANOS</p>
                <h2 className="text-2xl md:text-4xl font-black text-slate-950 leading-tight mb-4">
                  1 ano de conteúdo pronto para postar sem precisar criar nada do zero.
                </h2>
                <p className="text-base md:text-lg text-slate-600 leading-relaxed mb-6">
                  Você recebe todo o material do ano, é só colocar sua logo e publicar.
                </p>

                <div className="space-y-2.5 mb-8">
                  {[
                    "250 vídeos Reels focados em destinos de viagem",
                    "400 artes e stories lindíssimos e de alta qualidade",
                    "Templates fáceis e totalmente editáveis no Canva",
                    "Calendário de postagens para saber exatamente o que postar",
                  ].map((item) => (
                    <div key={item} className="flex items-center gap-3 text-slate-800 font-semibold text-sm md:text-base bg-slate-50 px-3 py-2.5 rounded-lg border border-slate-100">
                      <CheckCircle2 size={20} className="text-emerald-500 shrink-0" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>

                <a href="#planos" className="btn btn-primary inline-flex text-lg px-8 py-4 shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50">Liberar meus 250 Reels + Teste Grátis</a>
              </div>

              <div className="space-y-6">
                <div className="rounded-[2rem] shadow-[0_20px_50px_-12px_rgba(0,0,0,0.15)] overflow-hidden border-4 border-white">
                  <img
                    src={reelsMainGifUrl}
                    alt="Demonstração animada dos vídeos Reels entregues"
                    loading="lazy"
                    className="w-full h-auto object-cover"
                  />
                </div>
              </div>
            </div>

            <div className="mt-8 md:mt-12">
              <div className="mb-4 flex items-center justify-between gap-4">
                <h3 className="text-xl md:text-2xl font-black text-slate-950">Exemplos do tipo de Reels que você recebe</h3>
                <span className="hidden sm:inline text-sm font-black uppercase tracking-[0.18em] text-slate-400">publicar + adaptar + vender</span>
              </div>
              <div className="flex overflow-x-auto whitespace-nowrap sm:grid sm:grid-cols-3 gap-3 sm:gap-4 md:gap-5 pb-3 px-1 scrollbar-none">
                {reelsPreviewGifs.map((gifUrl, index) => (
                  <div key={gifUrl} className="w-[180px] sm:w-auto shrink-0 overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 shadow-lg shadow-slate-200/70">
                    <img
                      src={gifUrl}
                      alt={`Exemplo de vídeo Reel de viagem ${index + 1}`}
                      loading="lazy"
                      className="aspect-[9/16] w-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="bg-white py-16 md:py-24">
          <div className="inicio-container">
            <div className="text-center max-w-3xl mx-auto mb-10">
              <p className="text-purple-600 font-black uppercase tracking-[0.2em] text-xs mb-3">comparação honesta</p>
              <h2 className="section-title w-full text-center">O custo de continuar improvisando também existe</h2>
              <p className="section-subtitle w-full text-center">
                Contratar cada peça separada custa mais, demora mais e ainda deixa sua operação espalhada.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6 items-start">
              <div className="bg-slate-950 rounded-3xl p-6 text-white">
                <h3 className="text-2xl font-black mb-5">Fazendo por fora</h3>
                {[
                  ["Designer para artes", "R$ 150/mês ou mais"],
                  ["Ferramenta de IA", "R$ 90/mês ou mais"],
                  ["Social media", "R$ 1.500/mês"],
                  ["Editor de vídeo", "R$ 1.500/mês"],
                  ["Página de venda", "R$ 1.500 único"],
                ].map(([label, price]) => (
                  <div key={label} className="flex items-center justify-between gap-4 border-b border-white/10 py-4">
                    <span className="text-slate-300">{label}</span>
                    <span className="font-black text-white">{price}</span>
                  </div>
                ))}
                <p className="mt-6 text-red-300 font-black">Pode passar de R$ 3.240/mês + implantação.</p>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-3xl p-6">
                <h3 className="text-2xl font-black text-slate-950 mb-5">Com Canva Viagem</h3>
                <div className="text-slate-700 space-y-4">
                  <p><strong>Plano mensal:</strong> 3 dias grátis, depois R$ 97/mês, sem compromisso.</p>
                  <p><strong>Plano anual:</strong> 3 dias grátis, depois R$ 482 por ano, com 12 meses de acesso.</p>
                  <p><strong>Você recebe:</strong> IA, páginas, conteúdos, CRM, mídias, materiais de apoio, suporte e garantia.</p>
                </div>
              <a href="#planos" className="btn btn-primary mt-8 inline-flex">Escolher meu plano</a>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-[#F8FAFC] py-[64px] border-y border-slate-200">
          <div className="inicio-container">
            <h2 className="text-center text-[26px] font-bold text-[#0F172A] mb-2">Isso substitui o Canva Pro?</h2>
            <p className="text-center text-[#64748B] text-[15px] max-w-[560px] mx-auto mb-6">Essa é a dúvida mais comum. A resposta direta:</p>
            
            <div className="md:hidden flex justify-center mb-3">
              <span className="text-xs font-bold text-purple-600 bg-purple-50 border border-purple-200 px-3 py-1.5 rounded-full shadow-sm">
                👉 Arraste para o lado para comparar →
              </span>
            </div>
            <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden overflow-x-auto">
              <div className="grid grid-cols-[1.5fr_1fr_1fr] text-sm md:text-base min-w-[500px]">
                {/* Header */}
                <div className="p-4 md:p-6 font-bold text-slate-700 bg-white">Recurso</div>
                <div className="p-4 md:p-6 font-bold text-center bg-[#E2E8F0] text-slate-700">Canva Pro</div>
                <div className="p-4 md:p-6 font-bold text-center bg-[#7C3AED] text-white">Canva Viagem</div>
                
                {/* Rows */}
                {[
                  ["Templates genéricos", "✅ Muitos", "✅ 400 focados em viagem"],
                  ["Vídeos de destinos prontos", "❌", "✅ 250 Reels 4K"],
                  ["IA para criar ofertas de pacote", "❌", "✅"],
                  ["Página de venda de pacote", "❌", "✅"],
                  ["CRM de leads", "❌", "✅"],
                  ["Suporte por WhatsApp", "❌", "✅"],
                  ["Feito para agência de viagem", "❌", "✅"],
                ].map(([feature, pro, viagem], idx) => (
                  <div key={idx} className="contents">
                    <div className="p-4 md:p-5 border-t border-slate-100 flex items-center font-medium text-slate-700">{feature}</div>
                    <div className="p-4 md:p-5 border-t border-slate-100 bg-[#F8FAFC] text-center flex items-center justify-center">{pro}</div>
                    <div className="p-4 md:p-5 border-t border-slate-100 bg-purple-50 font-bold text-center flex items-center justify-center text-purple-900">{viagem}</div>
                  </div>
                ))}
              </div>
            </div>
            
            <p className="text-center text-[#64748B] text-[15px] max-w-[600px] mx-auto mt-6">
              O Canva Pro é uma ferramenta de design genérica. O Canva Viagem é uma plataforma construída para quem vende viagens vender mais.
            </p>
          </div>
        </section>

        <section id="planos" className="pricing inicio-section bg-white">
          <div className="inicio-container">
            <div className="text-center max-w-3xl mx-auto mb-12">
              <h2 className="section-title w-full text-center">Escolha como acessar</h2>
              <p className="section-subtitle w-full text-center" style={{ textAlign: "center", margin: "0 auto" }}>
                Mensal para começar sem compromisso. Anual para pagar menos e ter acesso por 12 meses completos.
              </p>
            </div>

            <div className="max-w-5xl mx-auto w-full flex flex-col items-center gap-10">
              
              {/* Componente Interativo de Preços (3 Colunas) */}
              <div className="w-full border-4 border-slate-100 rounded-[2rem] p-6 lg:p-8 shadow-xl shadow-slate-200/50 flex flex-col items-center gap-8 bg-white">
                <div className="w-full grid md:grid-cols-3 gap-4">
                  {plans.map((plan, index) => (
                    <div
                      key={plan.id}
                      className={`w-full flex flex-col cursor-pointer border-2 p-5 rounded-2xl transition-all duration-300 relative ${
                        plan.id === "anual" ? "order-first md:order-none " : ""
                      }${
                        activePlan === index ? "border-purple-600 bg-purple-50/50 shadow-md shadow-purple-500/10" : "border-slate-200 hover:border-purple-300 hover:bg-slate-50"
                      }`}
                      onClick={() => setActivePlan(index)}
                    >
                      {plan.popular && (
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-yellow-400 text-yellow-900 text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full shadow-sm whitespace-nowrap">
                          ★ Mais Popular
                        </div>
                      )}
                      <div className="flex justify-between items-center mb-4">
                        <p className="font-black text-lg text-slate-900 uppercase tracking-wide">
                          {plan.id}
                        </p>
                        <div
                          className={`border-2 size-6 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                            activePlan === index ? "border-purple-600" : "border-slate-300 bg-white"
                          }`}
                        >
                          <div
                            className={`size-2.5 bg-purple-600 rounded-full transition-opacity ${
                              activePlan === index ? "opacity-100" : "opacity-0"
                            }`}
                          ></div>
                        </div>
                      </div>
                      
                      <div className="flex flex-col mb-2">
                        <span className="text-slate-900 font-black text-2xl lg:text-3xl">{plan.monthlyEquivalent || plan.price}/mês</span>
                        {plan.id !== "mensal" && (
                          <span className="text-slate-500 text-sm font-medium">({plan.price} total)</span>
                        )}
                      </div>

                      <ul className="w-full border-t border-[#E2E8F0] my-[12px] pt-[12px] space-y-2 list-none p-0">
                        {plan.features.map((feature, idx) => (
                          <li key={idx} className="flex items-start text-[13px] text-[#475569] leading-[1.8]">
                            <Check className="text-[#7C3AED] w-[16px] h-[16px] shrink-0 mr-2 mt-[2px]" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>

                      {plan.id === "anual" && (
                        <div className="mt-auto pt-4 border-t border-purple-200/50">
                          <div className="bg-[#F0FDF4] rounded-[6px] px-[12px] py-[8px]">
                            <p className="text-[#16A34A] font-[700] text-[14px] leading-snug m-0">
                              💰 Você economiza R$682 em relação ao mensal
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <div className="w-full max-w-2xl mt-4">
                  <div className="bg-[#F0FDF4] border-l-[4px] border-[#16A34A] rounded-[8px] p-[14px_18px] mb-[16px] shadow-sm">
                    <p className="text-[14px] text-[#15803D] font-bold m-0 text-left flex items-center gap-2">
                      <span>🛡️</span> Teste 3 dias grátis sem risco. Sem cobrança hoje e cancelamento online em 1 clique.
                    </p>
                  </div>
                  <a
                    href={plans[activePlan].checkoutUrl}
                    onClick={() => trackCheckoutClick(plans[activePlan].trackValue, plans[activePlan].id as "anual" | "mensal")}
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white font-black text-lg lg:text-xl rounded-2xl py-5 flex items-center justify-center shadow-lg shadow-purple-600/40 transition-all active:scale-95 animate-[pulse_2s_ease-in-out_infinite]"
                  >
                    Começar agora (Acesso em 2 minutos)
                  </a>
                  <p className="text-center text-[12px] font-bold text-[#64748B] mt-4 leading-relaxed px-2">
                    🔒 Pagamento seguro via Stripe · Não cobraremos hoje · Cancele antes de 3 dias com 1 clique · Garantia de 7 dias após o teste
                  </p>
                </div>
              </div>

              {/* Lista única de benefícios */}
              <div className="w-full bg-slate-50 border border-slate-200 rounded-[2rem] p-8 lg:p-10 flex flex-col items-center">
                <p className="text-[#0F172A] text-[15px] font-bold text-center mb-8">Todos os planos incluem exatamente os mesmos recursos. Sem plano básico e sem ferramentas bloqueadas.</p>
                <div className="w-full max-w-4xl grid md:grid-cols-2 gap-x-8 gap-y-5">
                  {pricingFeatures.map((feature) => (
                    <div key={feature} className="flex items-start gap-3">
                      <CheckCircle2 size={24} className="text-purple-600 shrink-0" />
                      <span className="text-base text-slate-700 font-medium">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
            <div className="inicio2-after-purchase">
              <div className="inicio2-after-copy">
                <p className="text-purple-600 font-black uppercase tracking-[0.2em] text-xs mb-2">depois da compra</p>
                <h3>Você não compra e fica perdido.</h3>
                <p>O caminho é simples: pagamento seguro, acesso liberado e primeira oferta criada com um pacote real da sua agência.</p>
              </div>
              <div className="inicio2-after-steps">
                {afterPurchaseSteps.map(([number, title, copy]) => (
                  <div key={title} className="inicio2-after-step">
                    <span>{number}</span>
                    <strong>{title}</strong>
                    <p>{copy}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="inicio2-objections bg-slate-950 py-16 md:py-24">
          <div className="inicio-container">
            <div className="text-center max-w-3xl mx-auto mb-10">
              <p className="text-cyan-300 font-black uppercase tracking-[0.2em] text-xs mb-3">antes de decidir</p>
              <h2 className="text-3xl md:text-5xl font-black text-white leading-tight">Dúvidas normais de quem nunca viu o Canva Viagem</h2>
              <p className="text-slate-300 text-lg leading-relaxed mt-4">
                Se você chegou frio, estas são as perguntas que precisam estar claras antes de colocar o cartão.
              </p>
            </div>
            <div className="inicio2-objection-grid">
              {objectionCards.map(([title, copy]) => (
                <div key={title} className="inicio2-objection-card">
                  <CheckCircle2 size={20} />
                  <h3>{title}</h3>
                  <p>{copy}</p>
                </div>
              ))}
            </div>
            <div className="text-center mt-10">
              <a href="#planos" className="btn btn-primary inline-flex">Quero escolher meu plano</a>
            </div>
          </div>
        </section>

        <section className="bg-green-50 py-16 md:py-20 border-y border-green-200">
          <div className="inicio-container">
            <div className="max-w-4xl mx-auto grid md:grid-cols-[0.8fr_1.2fr] gap-8 items-center">
              <div className="bg-white rounded-3xl p-8 border border-green-200 text-center">
                <ShieldCheck size={52} className="text-green-600 mx-auto mb-4" />
                <h3 className="text-3xl font-black text-slate-950">7 dias de garantia</h3>
                <p className="text-slate-600 mt-3">Teste com calma. Se não fizer sentido, solicite reembolso dentro do prazo.</p>
              </div>
              <div>
                <h2 className="text-3xl md:text-4xl font-black text-slate-950 mb-4">O risco fica do nosso lado.</h2>
                <p className="text-lg text-slate-700 leading-relaxed">
                  Use a IA, baixe materiais, monte uma página de pacote e organize seus leads. Se você não sentir que a apresentação da sua agência subiu de nível, acione a garantia dentro do prazo da Stripe.
                </p>
                <p className="text-[13px] text-[#64748B] mt-[12px]">
                  Para pedir reembolso, acesse a Stripe, clique em Cancelar assinatura e solicite o reembolso. Processamos em até 5 dias úteis. Sem perguntas e sem burocracia.
                </p>
                <a href="#planos" className="btn btn-primary mt-6 inline-flex">Garantir acesso com 7 dias de garantia</a>
              </div>
            </div>
          </div>
        </section>

        <section className="faq inicio-section bg-slate-50">
          <div className="inicio-container">
            <h2 className="section-title w-full text-center">Perguntas que um comprador frio faria</h2>
            <p className="section-subtitle w-full text-center">
              Respostas diretas para tirar dúvida antes do checkout.
            </p>
            <div className="faq-list">
              {faqs.map((item, index) => (
                <div key={item.q} className="faq-item">
                  <button className="faq-question" onClick={() => setOpenFaqIndex(openFaqIndex === index ? null : index)}>
                    {item.q}
                    <ChevronDown className="faq-icon" style={{ transform: openFaqIndex === index ? "rotate(180deg)" : "rotate(0deg)" }} />
                  </button>
                  {openFaqIndex === index && (
                    <div className="faq-answer">
                      <p>{item.a}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        
        <section className="bg-white py-12 border-y border-slate-100">
          <div className="inicio-container">
            <div className="max-w-[560px] mx-auto text-center flex flex-col items-center">
              <h2 className="text-[18px] font-[600] text-[#0F172A] mb-2">Ainda ficou alguma dúvida?</h2>
              <p className="text-[14px] text-[#64748B] mb-6">Fale com nosso suporte antes de decidir ou comece o teste grátis agora mesmo, sem cobrança hoje.</p>
              
              <div className="w-full flex flex-col gap-3">
                <a href="#planos" className="w-full max-w-[400px] mx-auto bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-[700] text-[16px] py-[14px] px-[32px] rounded-[8px] transition-colors">
                  Iniciar meus 3 dias grátis agora →
                </a>
                <a href={supportWhatsAppUrl} target="_blank" rel="noopener noreferrer" className="w-full max-w-[400px] mx-auto bg-transparent border-[1.5px] border-[#7C3AED] hover:bg-purple-50 text-[#7C3AED] font-[600] text-[15px] py-[12px] px-[32px] rounded-[8px] transition-colors">
                  Falar com suporte no WhatsApp →
                </a>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-[#0F172A] py-[80px]">
          <div className="inicio-container text-center flex flex-col items-center">
            <h2 className="text-[#FFFFFF] text-[32px] font-[800] max-w-[640px] mx-auto leading-tight">
              Sua próxima oferta pode ter o visual de uma grande agência. E você pode criar agora mesmo.
            </h2>
            <p className="text-[#94A3B8] text-[16px] max-w-[520px] mx-auto mt-[16px] mb-[32px] leading-relaxed">
              Escolha um plano, receba acesso em minutos e use os 3 dias grátis para criar sua primeira oferta profissional com um pacote real da sua agência.
            </p>
            <a href="#planos" className="bg-[#7C3AED] text-white px-[40px] py-[16px] rounded-[8px] text-[18px] font-[700] hover:bg-[#6D28D9] transition-colors inline-block">
              Iniciar meus 3 dias grátis agora
            </a>
            <p className="text-[#64748B] text-[13px] mt-[12px]">
              Não cobraremos hoje. Cancele com 1 clique antes de 3 dias.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-[24px] mt-[24px] text-[#94A3B8] text-[13px] font-medium">
              <span>🔒 Stripe</span>
              <span>⭐ 7 dias de garantia</span>
              <span>✓ Acesso imediato</span>
            </div>
          </div>
        </section>
      </main>

      <footer className="inicio-footer">
        <div className="inicio-container footer-inner">
          <div className="footer-brand">
            <img src={logoImage} alt="Canva Viagem" className="footer-logo" />
            <p>Conteúdo, IA, páginas e CRM para agências de viagem venderem melhor.</p>
            <div className="footer-contact">
              <a href="mailto:suporte@canvaviagem.com.br" className="footer-contact-link">suporte@canvaviagem.com.br</a>
              <a href={supportWhatsAppUrl} target="_blank" rel="noopener noreferrer" className="footer-contact-link footer-whatsapp mt-2">
                WhatsApp suporte
              </a>
            </div>
          </div>
          <div className="footer-links">
            <a href="/termos">Termos de Uso</a>
            <a href="/privacidade">Política de Privacidade</a>
            <a href="/termos">Política de Reembolso</a>
            <a href="mailto:suporte@canvaviagem.com.br">Contato</a>
          </div>
        </div>
        <div className="footer-bottom">
          <ShieldCheck size={16} /> Pagamento seguro via Stripe
        </div>
      </footer>

      <div className={`md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#7C3AED] text-white font-[700] text-[15px] text-center rounded-t-[8px] transition-transform duration-300 ${isPricingVisible ? 'translate-y-full' : 'translate-y-0'}`}>
        <a href="#planos" className="block w-full px-[24px] py-[14px]">
          Iniciar 3 dias grátis (Sem cobrança hoje) →
        </a>
      </div>

      <a
        href="https://wa.me/5585998458995?text=Quero%20saber%20mais%20sobre%20o%20Canva%20Viagem"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-[9999] bg-[#25D366] hover:bg-[#1DA851] text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 flex items-center justify-center"
        aria-label="Fale conosco no WhatsApp"
      >
        <svg viewBox="0 0 32 32" className="w-8 h-8 fill-current">
          <path d="M16.05 1.5C8.03 1.5 1.5 8.03 1.5 16.05c0 2.58.67 5.09 1.94 7.29L1.5 29.5l6.3-1.92c2.14 1.15 4.54 1.76 7.02 1.76 8.01 0 14.54-6.53 14.54-14.54S24.06 1.5 16.05 1.5zm.02 24.52c-2.18 0-4.32-.58-6.19-1.69l-.44-.26-4.62 1.41 1.44-4.51-.29-.46c-1.22-1.93-1.87-4.17-1.87-6.49 0-6.61 5.38-11.99 11.99-11.99 3.2 0 6.21 1.25 8.47 3.51s3.51 5.27 3.51 8.47c-.01 6.61-5.38 11.99-11.99 12zM22.61 19c-.36-.18-2.12-1.05-2.45-1.17-.33-.12-.57-.18-.81.18-.24.36-.93 1.17-1.14 1.41-.21.24-.42.27-.78.09-.36-.18-1.51-.56-2.88-1.78-1.07-1-1.79-2.24-2-2.6-.21-.36-.02-.56.16-.74.16-.16.36-.42.54-.63.18-.21.24-.36.36-.6.12-.24.06-.45-.03-.63-.09-.18-.81-1.95-1.11-2.67-.29-.71-.59-.61-.81-.62h-.69c-.24 0-.63.09-.96.45-.33.36-1.26 1.23-1.26 3 0 1.77 1.29 3.48 1.47 3.72.18.24 2.54 3.88 6.15 5.43 2.45 1.05 3.32 1.15 4.57.97 1.25-.18 2.12-.87 2.42-1.71.3-.84.3-1.56.21-1.71-.09-.15-.33-.24-.69-.42z"/>
        </svg>
      </a>
    </div>
  );
}
