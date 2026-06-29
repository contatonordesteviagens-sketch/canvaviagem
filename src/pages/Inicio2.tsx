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

  const plans = [
    {
      id: "mensal",
      name: "Plano Mensal",
      price: ELITE_OFFER.monthlyPrice,
      monthlyEquivalent: ELITE_OFFER.monthlyPrice,
      checkoutUrl: ELITE_OFFER.monthlyCheckoutUrl,
      trackValue: 97,
      popular: false,
    },
    {
      id: "semestral",
      name: "Plano Semestral",
      price: "R$ 347",
      monthlyEquivalent: "R$ 57,83",
      checkoutUrl: "https://buy.stripe.com/8x2cN60HwcaY2Yr38w8so0j",
      trackValue: 347,
      popular: false,
    },
    {
      id: "anual",
      name: "Plano Anual",
      price: ELITE_OFFER.annualPrice,
      monthlyEquivalent: ELITE_OFFER.annualMonthlyEquivalent,
      checkoutUrl: ELITE_OFFER.annualCheckoutUrl,
      trackValue: 482,
      popular: true,
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

      <main>
        <section id="hero" className="relative bg-[#0F172A] overflow-hidden pt-24 pb-16 md:pt-32 md:pb-24 lg:pt-40 lg:pb-32">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-purple-600/20 rounded-full blur-[120px] -z-10" />

          <div className="inicio-container relative z-10 flex flex-col items-center text-center max-w-4xl mx-auto">
            <div className="flex flex-col items-center gap-4 mb-5 md:mb-8">
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-900/40 to-blue-900/40 border border-purple-500/30 rounded-full px-4 py-1.5 md:px-5 md:py-2 backdrop-blur-md shadow-[0_0_30px_rgba(124,58,237,0.15)]">
                <span className="text-[9px] md:text-xs font-bold text-purple-200 uppercase tracking-widest">
                  Tudo mastigado para você vender mais viagens
                </span>
              </div>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[4.5rem] font-black text-white leading-[1.05] mb-3 tracking-tighter">
              Venda mais viagens com IA
            </h1>

            <p className="text-sm sm:text-base md:text-lg lg:text-xl text-slate-300 font-medium mb-5 max-w-3xl mx-auto leading-relaxed">
              Receba um site pronto, gerador de ofertas, vídeos e artes prontos, agentes de IA. <strong className="text-white font-black">Teste grátis.</strong>
            </p>

            <div className="bg-emerald-500/10 border border-emerald-500/20 px-4 py-2 md:px-5 md:py-2.5 rounded-lg md:rounded-xl mb-6 shadow-lg shadow-emerald-500/5 max-w-2xl mx-auto backdrop-blur-sm">
              <p className="font-semibold text-[10px] md:text-[13px] !text-emerald-300 leading-snug" style={{ color: '#6ee7b7' }}>
                Veja o vídeo como usar a ferramenta simples de marketing turístico que te dá tudo pronto para você focar no que importa: seus clientes.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 md:gap-4 mb-6 w-full max-w-2xl mx-auto">
              <a href="#planos" className="w-full sm:w-auto bg-purple-600 hover:bg-purple-500 text-white text-sm md:text-base font-bold py-2.5 px-6 rounded-full shadow-[0_0_40px_rgba(124,58,237,0.5)] transition-transform hover:-translate-y-1 flex items-center justify-center whitespace-nowrap">
                Quero testar agora
              </a>
              <a href="#video-prova" className="w-full sm:w-auto bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 py-2.5 px-6 rounded-full font-bold transition-transform hover:-translate-y-1 flex items-center justify-center gap-2 whitespace-nowrap text-xs md:text-sm">
                <Play size={16} fill="currentColor" /> Ver vídeo da IA
              </a>
            </div>

            <div className="flex flex-wrap justify-center gap-2 w-full max-w-[550px] mx-auto mb-6">
              {["Acesso imediato", "Checkout seguro Stripe", "3 dias grátis", "7 dias de garantia", "Suporte por WhatsApp"].map((item) => (
                <div key={item} className="bg-slate-800/60 border border-slate-700 rounded-full px-3 py-1.5 text-[11px] md:text-xs font-semibold text-slate-300 flex items-center justify-center gap-1.5">
                  <ShieldCheck size={14} className="text-emerald-400 shrink-0" />
                  {item}
                </div>
              ))}
            </div>

            <div className="hidden sm:flex flex-wrap justify-center gap-5 mb-8">
              <div className="flex items-center gap-1.5 text-slate-400 text-xs md:text-sm font-bold"><CheckCircle2 className="text-purple-500" size={16} /> Feito para turismo</div>
              <div className="flex items-center gap-1.5 text-slate-400 text-xs md:text-sm font-bold"><CheckCircle2 className="text-purple-500" size={16} /> Conteúdos + IA + Site + CRM</div>
            </div>

            <div id="video-prova" className="inicio2-hero-video">
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

        <section className="bg-white py-8 lg:py-12 border-b border-slate-100">
          <div className="inicio-container">
            <div className="grid lg:grid-cols-[0.95fr_1.05fr] gap-8 lg:gap-12 items-center">
              <div>
                <p className="text-cyan-600 font-black uppercase tracking-[0.2em] text-[10px] md:text-[11px] mb-3">O que você também recebe além da IA para vender viagens:</p>
                <h2 className="text-2xl md:text-4xl font-black text-slate-950 leading-tight mb-4">
                  1 ano de postagens de conteúdos para você postar.
                </h2>
                <p className="text-base md:text-lg text-slate-600 leading-relaxed mb-6">
                  Não passe mais vergonha no Instagram. Nós entregamos todo o seu conteúdo do ano inteiro preparado, é só colocar sua logo e postar.
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
              <div className="grid grid-cols-3 gap-2 sm:gap-4 md:gap-5">
                {reelsPreviewGifs.map((gifUrl, index) => (
                  <div key={gifUrl} className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 shadow-lg shadow-slate-200/70">
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

        <section className="bg-white py-8 lg:py-12 border-b border-slate-100">
          <div className="inicio-container">
            <div className="text-center max-w-3xl mx-auto mb-10">
              <p className="text-purple-600 font-black uppercase tracking-[0.25em] text-[11px] md:text-xs mb-4">explicado passo a passo</p>
              <h2 className="section-title w-full text-center">O que você recebe ao entrar hoje?</h2>
              <p className="section-subtitle w-full text-center mt-4">
                Dividimos a plataforma em 3 pilares muito simples de entender e usar: Fábrica, Redes Sociais e Inteligência.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
              {quickOutcomeCards.map((card) => (
                <div key={card.title} className="bg-slate-50 border border-slate-100 hover:border-purple-200 rounded-[2rem] p-8 shadow-sm hover:shadow-xl transition-all duration-300 group">
                  <div className="w-14 h-14 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">{card.icon}</div>
                  <h3 className="text-xl font-black text-slate-900 mb-3">{card.title}</h3>
                  <p className="text-slate-600 leading-relaxed text-base">{card.copy}</p>
                </div>
              ))}
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
              <div className="space-y-5 text-slate-300 text-lg md:text-xl leading-relaxed font-medium">
                <p>O cliente nota quando você manda um texto feio e mal escrito no WhatsApp.</p>
                <p>A partir de agora, as suas ofertas vão parecer que foram feitas por uma grande agência corporativa.</p>
                <p>Tudo está mastigado para que mesmo uma criança de 10 anos consiga usar a nossa plataforma.</p>
              </div>
              <a href="#planos" className="btn btn-primary mt-10 inline-flex px-8 py-4 text-lg shadow-[0_0_30px_rgba(124,58,237,0.4)]">Criar ofertas mais profissionais</a>
            </div>

            <div className="grid sm:grid-cols-2 gap-5">
              {[
                ["Visual amador", "O pacote até é bom, mas a apresentação não passa segurança."],
                ["WhatsApp bagunçado", "Leads quentes ficam perdidos entre conversas antigas."],
                ["Dependência de designer", "Você espera terceiros para publicar uma promoção simples."],
                ["Oferta sem página", "O cliente não entende roteiro, benefícios e condições antes do preço."],
              ].map(([title, copy]) => (
                <div key={title} className="rounded-3xl border border-white/5 bg-white/5 hover:bg-white/10 p-6 backdrop-blur-sm transition-colors shadow-lg">
                  <h3 className="text-white font-black text-lg mb-3">{title}</h3>
                  <p className="text-slate-400 leading-relaxed text-sm md:text-base">{copy}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-white py-8 lg:py-12">
          <div className="inicio-container">
            <div className="text-center max-w-3xl mx-auto mb-10">
              <p className="text-purple-600 font-black uppercase tracking-[0.25em] text-[11px] md:text-xs mb-4">não é teoria</p>
              <h2 className="section-title w-full text-center">O que você vê depois de entrar</h2>
              <p className="section-subtitle w-full text-center mt-4">
                Prints reais do produto para mostrar como a plataforma organiza sua rotina de venda.
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

        <section className="bg-white py-8 lg:py-12">
          <div className="inicio-container">
            <div className="text-center max-w-3xl mx-auto mb-10">
              <p className="text-purple-600 font-black uppercase tracking-[0.25em] text-[11px] md:text-xs mb-4">prova e autoridade</p>
              <h2 className="section-title w-full text-center">Criado por Lucas Ferrari, acompanhado por mais de 66 mil pessoas</h2>
              <p className="section-subtitle w-full text-center mt-4">
                Milhares de agências já descobriram como simplificar e acelerar a captação de clientes.
              </p>
            </div>

            <div className="grid lg:grid-cols-[0.8fr_1.2fr] gap-8 items-start">
              <div className="bg-slate-900 rounded-[2rem] p-8 text-white shadow-xl shadow-slate-900/10">
                <img src={lucasPortrait} alt="Lucas Ferrari" className="w-28 h-28 rounded-2xl object-cover mb-6 border-4 border-slate-700/50" />
                <h3 className="text-2xl font-black mb-4">Lucas Ferrari</h3>
                <p className="text-slate-300 leading-relaxed text-base mb-8">
                  Especialista em marketing para agências de viagem, receptivos e profissionais do turismo. O Canva Viagem nasceu para resolver uma dor prática: criar ofertas melhores, mais rápido, sem depender de uma operação cara.
                </p>
                <div className="grid sm:grid-cols-2 gap-4">
                  <a href={instagramUrl} target="_blank" rel="noopener noreferrer" className="bg-white hover:bg-slate-100 transition-colors text-slate-900 rounded-2xl px-4 py-4 font-black flex items-center justify-center gap-2">
                    <Instagram size={20} /> Instagram
                  </a>
                  <a href={supportWhatsAppUrl} target="_blank" rel="noopener noreferrer" className="bg-green-500 hover:bg-green-400 transition-colors text-slate-950 rounded-2xl px-4 py-4 font-black flex items-center justify-center gap-2">
                    <MessageSquare size={20} /> WhatsApp
                  </a>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-5 lg:gap-6">
                {socialProofChats.map((proof) => (
                  <ChatCard key={proof.label} proof={proof} />
                ))}
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6 lg:gap-8 mt-12">
              {[depoimento1, depoimento2, depoimento3].map((image, index) => (
                <div key={index} className="rounded-[2rem] border border-slate-100 overflow-hidden bg-white shadow-lg shadow-slate-200/50 hover:-translate-y-1 transition-transform">
                  <img src={image} alt={`Prova social real ${index + 1}`} className="w-full block" />
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

        <section className="py-8 lg:py-12 bg-[#F8FAFC] border-y border-slate-200">
          <div className="inicio-container">
            <div className="text-center max-w-3xl mx-auto mb-12">
              <h2 className="section-title w-full text-center">Escolha o que precisa criar hoje</h2>
              <p className="section-subtitle w-full text-center mt-4">
                A nova plataforma mantém a força da versão LATAM, mas fala direto com a rotina da agência no Brasil.
              </p>
            </div>

            <div className="flex flex-wrap justify-center gap-3 mb-12">
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
                  className={`px-6 py-3 rounded-full font-black text-sm transition-all duration-300 shadow-sm ${
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

        <section id="planos" className="pricing inicio-section bg-white">
          <div className="inicio-container">
            <div className="text-center max-w-3xl mx-auto">
              <p className="text-purple-600 font-black uppercase tracking-[0.2em] text-xs mb-3">oferta brasileira</p>
              <h2 className="section-title w-full text-center">Escolha seu acesso sem confusão</h2>
              <p className="section-subtitle w-full text-center" style={{ textAlign: "center", margin: "0 auto 16px" }}>
                O mensal é para começar com menor compromisso. O anual é a melhor escolha para quem quer pagar menos por mês, ter 12 meses de acesso e economizar {ELITE_OFFER.annualSavings}.
              </p>
              <div className="bg-red-50 text-red-700 font-bold px-4 py-3 rounded-xl max-w-2xl mx-auto mb-8 border border-red-100 text-sm md:text-base text-center">
                ⚠️ Atenção: Não somos um editor de imagens ou só templates. Somos um acelerador de vendas com tudo mastigado para o turismo (Site, IA, CRM e Imagens).
              </div>
            </div>
            {/* NOVO BLOCO DE PREÇOS MOBILE & DESKTOP */}
            <div className="max-w-5xl mx-auto w-full flex flex-col md:flex-row items-stretch gap-6 md:gap-10">
              
              {/* Lista única de benefícios (Coluna Esquerda no Desktop) */}
              <div className="w-full md:w-1/2 bg-slate-50 border border-slate-200 rounded-[2rem] p-8 lg:p-10 flex flex-col justify-center">
                <h3 className="font-black text-2xl text-slate-900 mb-8 text-center md:text-left">O que está incluso em todos os planos:</h3>
                <ul className="space-y-5 text-base text-slate-700 font-medium">
                  {pricingFeatures.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <CheckCircle2 size={24} className="text-purple-600 shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Componente Interativo de Preços (Coluna Direita no Desktop) */}
              <div className="w-full md:w-1/2 border-4 border-slate-100 rounded-[2rem] p-6 lg:p-8 shadow-xl shadow-slate-200/50 flex flex-col items-center gap-6 bg-white justify-between">
                <div className="w-full flex flex-col gap-4 relative">
                  {plans.map((plan, index) => (
                    <div
                      key={plan.id}
                      className={`w-full flex justify-between items-center cursor-pointer border-2 p-5 rounded-2xl transition-all duration-300 ${
                        activePlan === index ? "border-purple-600 bg-purple-50/50 shadow-md shadow-purple-500/10" : "border-slate-200 hover:border-purple-300 hover:bg-slate-50"
                      }`}
                      onClick={() => setActivePlan(index)}
                    >
                      <div className="flex flex-col items-start">
                        <p className="font-black text-lg lg:text-xl flex items-center gap-3 text-slate-900">
                          {plan.name}
                          {plan.popular && (
                            <span className="py-1 px-3 block rounded-lg bg-yellow-100 text-yellow-800 text-[10px] font-black uppercase tracking-wider">
                              Popular
                            </span>
                          )}
                        </p>
                        <p className="text-slate-500 text-sm mt-1.5">
                          <span className="text-slate-900 font-black text-xl lg:text-2xl mr-1">{plan.price}</span>
                          {plan.id !== "mensal" && ` (equivale a ${plan.monthlyEquivalent}/mês)`}
                        </p>
                      </div>
                      
                      <div
                        className={`border-2 size-7 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                          activePlan === index ? "border-purple-600" : "border-slate-300 bg-white"
                        }`}
                      >
                        <div
                          className={`size-3.5 bg-purple-600 rounded-full transition-opacity ${
                            activePlan === index ? "opacity-100" : "opacity-0"
                          }`}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="w-full mt-2">
                  <a
                    href={plans[activePlan].checkoutUrl}
                    onClick={() => trackCheckoutClick(plans[activePlan].trackValue, plans[activePlan].id as "anual" | "mensal")}
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white font-black text-lg lg:text-xl rounded-2xl py-5 flex items-center justify-center shadow-lg shadow-purple-600/30 transition-transform active:scale-95"
                  >
                    Começar teste grátis
                  </a>
                  <p className="text-center text-xs font-bold text-slate-500 mt-4">
                    Liberação imediata via PIX ou Cartão
                  </p>
                  <p className="text-center text-[11px] text-slate-400 mt-1.5 leading-tight px-2">
                    Não cobraremos hoje. Cancele com 1 clique antes de 3 dias.
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-10 text-center text-sm text-slate-500 font-semibold max-w-2xl mx-auto bg-slate-50 py-3 rounded-xl border border-slate-200">
              Pagamento seguro pela Stripe. Acesso imediato. Garantia de 7 dias. Sem alterar valores no checkout.
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

        <section className="final-cta bg-slate-950 py-20 border-b border-slate-800">
          <div className="inicio-container text-center max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-5xl font-black text-white leading-tight mb-5">
              Sua próxima oferta pode parecer mais clara, mais profissional e mais fácil de vender hoje.
            </h2>
            <p className="text-lg md:text-xl text-slate-300 mb-10 max-w-3xl mx-auto">
              Escolha um plano, receba acesso imediato e use a garantia de 7 dias para validar o Canva Viagem com um pacote real da sua agência.
            </p>
            <a href="#planos" className="btn btn-primary text-xl py-5 px-12 shadow-[0_0_30px_rgba(124,58,237,0.4)] hover:-translate-y-1 inline-block">
              Iniciar meus 3 dias grátis sem compromisso
            </a>
            <p className="text-slate-500 text-sm mt-6 flex items-center justify-center gap-2">
              <ShieldCheck size={16} /> Não cobraremos hoje. Cancele com 1 clique.
            </p>
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
              <a href={supportWhatsAppUrl} target="_blank" rel="noopener noreferrer" className="footer-contact-link footer-whatsapp">
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

      <div className="mobile-sticky">
        <div className="sticky-price">
          <span>{ELITE_OFFER.annualPrice}<small>/ano</small></span>
          <small>{ELITE_OFFER.annualMonthlyEquivalent}/mês equivalente</small>
        </div>
        <a href="#planos" className="sticky-btn">Testar grátis <Check size={16} /></a>
      </div>
    </div>
  );
}
