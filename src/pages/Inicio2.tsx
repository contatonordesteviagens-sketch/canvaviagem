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
  "250 vídeos Reels de destinos nacionais e internacionais",
  "Templates editáveis no Canva para personalizar logo e telefone",
  "400 artes e stories",
  "Gerador de anúncios com IA",
  "Construtor de sites e páginas de pacote",
  "CRM para organizar leads",
  "Ferramentas de IA para agentes de viagem",
  "Legendas, roteiros e textos de oferta",
  "Suporte via WhatsApp",
];

const quickOutcomeCards = [
  {
    title: "Oferta pronta para vender",
    copy: "Transforme destino, valor e condições em anúncio, texto de WhatsApp e página de pacote.",
    icon: <MessageSquare size={22} />,
  },
  {
    title: "Aparência profissional",
    copy: "Use artes, vídeos e páginas pensadas para turismo sem começar de uma tela em branco.",
    icon: <Star size={22} />,
  },
  {
    title: "Leads sob controle",
    copy: "Organize contatos, orçamentos e oportunidades para não deixar conversa quente esfriar.",
    icon: <Users size={22} />,
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
  ["IA para anúncios", "Gere textos, ganchos, CTA e ideias para destinos e promoções."],
  ["250 Reels prontos", "Publique vídeos de destinos nacionais e internacionais sem partir do zero."],
  ["Páginas de venda", "Envie pacotes com uma apresentação clara, visual e mais confiável."],
  ["CRM de leads", "Acompanhe interessados, orçamentos e oportunidades depois do primeiro contato."],
  ["Materiais de apoio", "Use legendas, roteiros, textos de WhatsApp e recursos de campanha."],
  ["Suporte e garantia", "Acesso imediato, ajuda por WhatsApp e 7 dias para testar sem risco."],
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
          <a href="#planos" className="header-cta">Escolher plano</a>
        </div>
      </header>

      <main>
        <section id="hero" className="relative bg-[#0F172A] overflow-hidden pt-20 pb-14 md:pt-24 md:pb-16 lg:pt-32 lg:pb-20">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-purple-600/20 rounded-full blur-[120px] -z-10" />

          <div className="inicio-container relative z-10 flex flex-col items-center text-center max-w-4xl mx-auto">
            <div className="flex flex-col items-center gap-4 mb-6 md:mb-8">
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-900/50 to-blue-900/50 border border-purple-500/30 rounded-full px-5 py-2 backdrop-blur-md shadow-[0_0_20px_rgba(124,58,237,0.2)]">
                <span className="md:hidden text-xs font-bold text-purple-200 uppercase tracking-wide">
                  Para agências que vendem pelo WhatsApp e Instagram
                </span>
                <span className="hidden md:inline text-sm font-bold text-purple-200 uppercase tracking-wide">
                  Para agências e consultores de viagem que vendem pelo WhatsApp e Instagram
                </span>
              </div>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white leading-[1.1] mb-4 md:mb-6 tracking-tight">
              <span className="md:hidden">Crie ofertas de viagem profissionais para vender melhor</span>
              <span className="hidden md:inline">Crie ofertas de viagem profissionais para vender mais pelo WhatsApp e Instagram</span>
            </h1>

            <p className="text-lg md:text-xl text-slate-300 font-medium mb-3 md:mb-4 max-w-3xl mx-auto leading-relaxed">
              <span className="md:hidden">
                IA, páginas, conteúdos prontos e CRM para sua agência vender com aparência profissional.
              </span>
              <span className="hidden md:inline">
                O Canva Viagem reúne IA, páginas de pacote, conteúdos prontos e CRM para sua agência transformar um pacote simples em anúncio, página, legenda e acompanhamento de lead sem depender de designer nem de várias ferramentas separadas.
              </span>
            </p>

            <div className="bg-red-500/10 border border-red-500/20 px-5 md:px-6 py-3 rounded-xl mb-6 md:mb-10">
              <p className="text-red-300 font-medium md:text-lg">
                <span className="md:hidden">
                  Se a oferta parece improvisada, o cliente duvida. Aqui você deixa o pacote mais claro e vendável.
                </span>
                <span className="hidden md:inline">
                  Quando o pacote parece improvisado, o cliente compara só preço. Quando a oferta parece profissional, ele entende valor antes de pedir desconto.
                </span>
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 md:gap-4 mb-7 md:mb-6 w-full sm:w-auto">
              <a href="#planos" className="btn btn-primary text-base md:text-lg py-4 px-8 w-full sm:w-auto shadow-[0_0_30px_rgba(124,58,237,0.5)] hover:shadow-[0_0_50px_rgba(124,58,237,0.7)] hover:-translate-y-1 transition-all flex items-center justify-center gap-2">
                Quero acessar o Canva Viagem
              </a>
              <a href="#video-prova" className="w-full sm:w-auto bg-white/10 hover:bg-white/20 text-white border border-white/20 py-3.5 md:py-4 px-5 md:px-8 rounded-2xl font-bold transition-colors flex items-center justify-center gap-2 text-sm md:text-base">
                <Play size={20} fill="currentColor" /> Ver Lucas usando a ferramenta
              </a>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 md:gap-3 w-full mb-6 md:mb-10">
              {["Acesso imediato", "Checkout seguro Stripe", "7 dias de garantia", "Suporte por WhatsApp"].map((item) => (
                <div key={item} className="bg-white/5 border border-white/10 rounded-xl px-3 md:px-4 py-3 text-[12px] md:text-sm font-bold text-slate-200 flex items-center justify-center gap-2 leading-tight min-h-[58px]">
                  <ShieldCheck size={16} className="text-green-400 shrink-0" />
                  {item}
                </div>
              ))}
            </div>

            <div className="hidden sm:flex flex-wrap justify-center gap-4 md:gap-8 mb-10">
              <div className="flex items-center gap-2 text-slate-300 font-semibold"><CheckCircle2 className="text-purple-400" size={18} /> Feito para turismo</div>
              <div className="flex items-center gap-2 text-slate-300 font-semibold"><CheckCircle2 className="text-purple-400" size={18} /> Conteúdo + IA + CRM</div>
              <div className="flex items-center gap-2 text-slate-300 font-semibold"><CheckCircle2 className="text-purple-400" size={18} /> Criador acompanhado por 66 mil pessoas</div>
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

        <section className="bg-white py-14 md:py-20 border-b border-slate-100">
          <div className="inicio-container">
            <div className="grid lg:grid-cols-[0.95fr_1.05fr] gap-10 lg:gap-14 items-start">
              <div>
                <p className="text-cyan-600 font-black uppercase tracking-[0.2em] text-xs mb-3">250 reels prontos</p>
                <h2 className="text-3xl md:text-5xl font-black text-slate-950 leading-tight mb-5">
                  Seu perfil bonito e profissional em 1 dia, sem gravar tudo do zero.
                </h2>
                <p className="text-lg text-slate-600 leading-relaxed mb-6">
                  Você recebe vídeos Reels de destinos nacionais e internacionais para publicar, adaptar no Canva e manter o Instagram da agência com aparência de marca profissional.
                </p>

                <div className="space-y-3 mb-7">
                  {[
                    "250 vídeos Reels para destinos nacionais e internacionais",
                    "Templates editáveis no Canva para inserir sua logo e telefone",
                    "Qualidade FHD e uso livre de direitos autorais",
                    "Textos de legenda para copiar, adaptar e publicar",
                  ].map((item) => (
                    <div key={item} className="flex items-start gap-3 text-slate-800 font-bold">
                      <CheckCircle2 size={20} className="text-emerald-500 mt-0.5 shrink-0" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>

                <a href="#planos" className="btn btn-primary inline-flex">Quero receber os 250 Reels</a>
              </div>

              <div className="space-y-6">
                <div className="rounded-[1.5rem] shadow-2xl shadow-slate-200/70 overflow-hidden">
                  <img
                    src={profilePreviewImageUrl}
                    alt="Exemplo de perfil bonito e profissional criado com vídeos de viagem"
                    loading="lazy"
                    className="w-full h-auto object-cover"
                  />
                </div>
                <div className="rounded-[1.5rem] shadow-2xl shadow-slate-200/70 overflow-hidden">
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

        <section className="bg-white py-14 md:py-20 border-b border-slate-100">
          <div className="inicio-container">
            <div className="text-center max-w-3xl mx-auto mb-10">
              <p className="text-purple-600 font-black uppercase tracking-[0.2em] text-xs mb-3">clareza para lead frio</p>
              <h2 className="section-title w-full text-center">O que você está comprando exatamente?</h2>
              <p className="section-subtitle w-full text-center">
                Uma plataforma para transformar pacote de viagem em campanha, página, texto e acompanhamento de lead.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-5">
              {quickOutcomeCards.map((card) => (
                <div key={card.title} className="bg-slate-50 border border-slate-200 rounded-2xl p-6">
                  <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center mb-4">{card.icon}</div>
                  <h3 className="text-xl font-black text-slate-900 mb-2">{card.title}</h3>
                  <p className="text-slate-600 leading-relaxed">{card.copy}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-slate-950 py-16 md:py-24">
          <div className="inicio-container grid lg:grid-cols-[0.85fr_1.15fr] gap-10 items-center">
            <div>
              <p className="text-cyan-300 font-black uppercase tracking-[0.2em] text-xs mb-4">o problema real</p>
              <h2 className="text-3xl md:text-5xl font-black text-white leading-tight mb-6">
                Sua agência não perde venda só por preço. Ela perde quando a oferta parece fraca.
              </h2>
              <div className="space-y-4 text-slate-300 text-lg leading-relaxed">
                <p>O cliente chama no WhatsApp, recebe um texto corrido, pede desconto e some.</p>
                <p>Você quer postar mais, mas trava em arte, legenda, roteiro, página, anúncio e follow-up.</p>
                <p>Enquanto isso, a agência que parece mais organizada ganha confiança antes mesmo do orçamento.</p>
              </div>
              <a href="#planos" className="btn btn-primary mt-8 inline-flex">Criar ofertas mais profissionais</a>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              {[
                ["Visual amador", "O pacote até é bom, mas a apresentação não passa segurança."],
                ["WhatsApp bagunçado", "Leads quentes ficam perdidos entre conversas antigas."],
                ["Dependência de designer", "Você espera terceiros para publicar uma promoção simples."],
                ["Oferta sem página", "O cliente não entende roteiro, benefícios e condições antes do preço."],
              ].map(([title, copy]) => (
                <div key={title} className="rounded-2xl border border-white/10 bg-white/5 p-5">
                  <h3 className="text-white font-black text-lg mb-2">{title}</h3>
                  <p className="text-slate-400 leading-relaxed">{copy}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-white py-16 md:py-24">
          <div className="inicio-container">
            <div className="text-center max-w-3xl mx-auto mb-10">
              <p className="text-purple-600 font-black uppercase tracking-[0.2em] text-xs mb-3">não é teoria</p>
              <h2 className="section-title w-full text-center">O que você vê depois de entrar</h2>
              <p className="section-subtitle w-full text-center">
                Prints reais do produto para mostrar como a plataforma organiza sua rotina de venda.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {platformProofScreens.map((item) => (
                <div key={item.title} className="rounded-3xl border border-slate-200 bg-white overflow-hidden shadow-sm">
                  <div className="aspect-[4/3] bg-slate-100 overflow-hidden">
                    <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                  </div>
                  <div className="p-5">
                    <h3 className="text-lg font-black text-slate-900 mb-2">{item.title}</h3>
                    <p className="text-slate-600 leading-relaxed">{item.result}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-slate-50 py-16 md:py-24 border-y border-slate-200">
          <div className="inicio-container">
            <div className="grid lg:grid-cols-[0.95fr_1.05fr] gap-10 items-center">
              <div>
                <p className="text-purple-600 font-black uppercase tracking-[0.2em] text-xs mb-3">antes e depois</p>
                <h2 className="section-title">A mesma viagem pode parecer barata ou valiosa dependendo da apresentação</h2>
                <p className="section-subtitle">
                  O Canva Viagem ajuda sua agência a sair do improviso visual e apresentar pacotes com mais confiança.
                </p>
              </div>
              <div className="grid sm:grid-cols-2 gap-5">
                <div className="rounded-3xl bg-white border border-red-100 overflow-hidden shadow-sm">
                  <img src={antesAmador} alt="Oferta de viagem com visual amador" className="w-full" />
                  <div className="p-5">
                    <h3 className="font-black text-red-600 mb-1">Antes</h3>
                    <p className="text-slate-600">Oferta improvisada, pouca clareza e menor percepção de valor.</p>
                  </div>
                </div>
                <div className="rounded-3xl bg-white border border-green-100 overflow-hidden shadow-sm">
                  <img src={depoisPremium} alt="Oferta de viagem com visual profissional" className="w-full" />
                  <div className="p-5">
                    <h3 className="font-black text-green-600 mb-1">Depois</h3>
                    <p className="text-slate-600">Apresentação organizada, visual mais premium e oferta mais fácil de entender.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-white py-16 md:py-24">
          <div className="inicio-container">
            <div className="text-center max-w-3xl mx-auto mb-10">
              <p className="text-purple-600 font-black uppercase tracking-[0.2em] text-xs mb-3">prova e autoridade</p>
              <h2 className="section-title w-full text-center">Criado por Lucas Ferrari, acompanhado por mais de 66 mil pessoas</h2>
              <p className="section-subtitle w-full text-center">
                Para o lead frio, confiança vem antes do cartão. Por isso a página mostra quem está por trás, provas reais e o produto por dentro.
              </p>
            </div>

            <div className="grid lg:grid-cols-[0.75fr_1.25fr] gap-8 items-start">
              <div className="bg-slate-900 rounded-3xl p-6 text-white">
                <img src={lucasPortrait} alt="Lucas Ferrari" className="w-28 h-28 rounded-2xl object-cover mb-5" />
                <h3 className="text-2xl font-black mb-3">Lucas Ferrari</h3>
                <p className="text-slate-300 leading-relaxed mb-5">
                  Especialista em marketing para agências de viagem, receptivos e profissionais do turismo. O Canva Viagem nasceu para resolver uma dor prática: criar ofertas melhores, mais rápido, sem depender de uma operação cara.
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <a href={instagramUrl} target="_blank" rel="noopener noreferrer" className="bg-white text-slate-900 rounded-xl px-4 py-3 font-black flex items-center justify-center gap-2">
                    <Instagram size={18} /> Instagram
                  </a>
                  <a href={supportWhatsAppUrl} target="_blank" rel="noopener noreferrer" className="bg-green-500 text-slate-950 rounded-xl px-4 py-3 font-black flex items-center justify-center">
                    WhatsApp
                  </a>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-5">
                {socialProofChats.map((proof) => (
                  <ChatCard key={proof.label} proof={proof} />
                ))}
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-5 mt-8">
              {[depoimento1, depoimento2, depoimento3].map((image, index) => (
                <div key={index} className="rounded-3xl border border-slate-200 overflow-hidden bg-white shadow-sm">
                  <img src={image} alt={`Prova social real ${index + 1}`} className="w-full block" />
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-slate-950 py-16 md:py-24">
          <div className="inicio-container">
            <div className="text-center max-w-3xl mx-auto mb-10">
              <p className="text-cyan-300 font-black uppercase tracking-[0.2em] text-xs mb-3">valor percebido</p>
              <h2 className="text-3xl md:text-5xl font-black text-white leading-tight mb-4">Tudo que sua agência recebe em um único lugar</h2>
              <p className="text-slate-300 text-lg">
                Cada recurso foi conectado a um resultado prático: publicar mais rápido, parecer mais profissional e vender com mais organização.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
              {includedResultCards.map(([title, copy]) => (
                <div key={title} className="bg-white/5 border border-white/10 rounded-2xl p-6">
                  <CheckCircle2 size={22} className="text-green-400 mb-4" />
                  <h3 className="text-white font-black text-xl mb-2">{title}</h3>
                  <p className="text-slate-400 leading-relaxed">{copy}</p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-10">
              {trustProofMetrics.map(([value, label]) => (
                <div key={value} className="bg-white rounded-2xl p-5 text-center">
                  <div className="text-3xl font-black text-slate-950">{value}</div>
                  <div className="text-sm font-bold text-slate-500 mt-1">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="demo" className="demo inicio-section bg-white">
          <div className="inicio-container">
            <h2 className="section-title w-full text-center">Dashboard inteligente para quem vende viagens</h2>
            <p className="section-subtitle w-full text-center">
              Tudo que sua agência precisa em uma única tela, fácil de usar e direto ao ponto.
            </p>

            <div className="w-full max-w-[900px] mx-auto mt-8 sm:mt-10 rounded-[16px] sm:rounded-[22px] overflow-hidden border border-black/5 shadow-[0_20px_40px_rgba(0,0,0,0.08)]">
              <img src={heroDashboard} alt="Dashboard do Canva Viagem" className="w-full block" />
            </div>

            <div className="steps-grid">
              <div className="step-card">
                <div className="step-number">1</div>
                <h3>Digite o destino</h3>
                <p>Exemplo: pacote para Maldivas, Disney, Gramado ou Jericoacoara.</p>
              </div>
              <div className="step-card">
                <div className="step-number">2</div>
                <h3>A IA cria</h3>
                <p>Receba anúncio, legenda, argumentos de venda e estrutura de página.</p>
              </div>
              <div className="step-card">
                <div className="step-number">3</div>
                <h3>Publique e acompanhe</h3>
                <p>Use no Instagram, WhatsApp, página de venda e CRM.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="tools inicio-section bg-[#F8FAFC] border-y border-slate-200">
          <div className="inicio-container">
            <h2 className="section-title w-full text-center">Escolha o que precisa criar hoje</h2>
            <p className="section-subtitle w-full text-center">
              A nova página brasileira mantém a força da versão LATAM, mas fala direto com a rotina da agência no Brasil.
            </p>

            <div className="flex flex-wrap justify-center gap-2 mb-10">
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
                  className={`px-5 py-3 rounded-full font-black text-sm transition-colors ${
                    activeToolTab === tab.id ? "bg-slate-950 text-white" : "bg-white text-slate-600 border border-slate-200"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                [showcaseAdCreation, "Criação de anúncios com IA", "Transforme pacote, preço e condições em anúncio pronto para tráfego e Instagram.", <MessageSquare size={20} />],
                [showcaseLandingPages, "Páginas de pacote", "Monte uma página mais clara para enviar no WhatsApp e aumentar percepção de valor.", <MonitorSmartphone size={20} />],
                [showcaseCrm, "CRM de leads", "Organize interessados, orçamentos e próximos retornos sem perder conversa quente.", <Users size={20} />],
                [showcaseScheduler, "Calendário de postagens", "Saia do improviso e publique com mais constância durante a semana.", <Calendar size={20} />],
                [showcasePremiumMedias, "Mídias premium", "Use vídeos, artes e materiais de turismo sem depender de uma criação do zero.", <ImageIcon size={20} />],
                [dashboardInterno, "Tudo no mesmo painel", "Acesse IA, mídia, páginas, CRM e materiais sem trocar de ferramenta o tempo todo.", <LayoutDashboard size={20} />],
              ].map(([image, title, copy, icon]) => (
                <div key={String(title)} className="rounded-3xl bg-white border border-slate-200 overflow-hidden shadow-sm">
                  <div className="aspect-[4/3] bg-slate-100 overflow-hidden">
                    <img src={image as string} alt={String(title)} className="w-full h-full object-cover" />
                  </div>
                  <div className="p-5">
                    <div className="flex items-center gap-2 text-purple-700 mb-3">{icon as JSX.Element}<h3 className="font-black text-slate-950">{String(title)}</h3></div>
                    <p className="text-slate-600 leading-relaxed">{String(copy)}</p>
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
              <p className="section-subtitle w-full text-center" style={{ textAlign: "center", margin: "0 auto 32px" }}>
                O mensal é para começar com menor compromisso. O anual é a melhor escolha para quem quer pagar menos por mês, ter 12 meses de acesso e economizar {ELITE_OFFER.annualSavings}. Ambos com 3 dias de teste grátis.
              </p>
            </div>
            <div className="inicio2-pricing-grid">
              <article className="inicio2-price-card inicio2-price-card-featured">
                <div className="inicio2-price-badge">3 dias grátis • maior economia</div>
                <div className="inicio2-price-head">
                  <p className="inicio2-price-kicker">Plano anual</p>
                  <h3>Melhor escolha para vender com consistência</h3>
                  <p>Para quem quer usar a ferramenta o ano inteiro, criar campanhas com mais frequência e pagar menos por mês.</p>
                </div>

                <div className="inicio2-price-value">
                  <span>Anual</span>
                  <strong>{ELITE_OFFER.annualPrice}</strong>
                </div>
                <p className="inicio2-price-cash">
                  Equivale a {ELITE_OFFER.annualMonthlyEquivalent}/mês • economia de {ELITE_OFFER.annualSavings}
                </p>

                <ul className="inicio2-price-features">
                  {pricingFeatures.map((feature) => (
                    <li key={feature}>
                      <CheckCircle2 size={18} />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <a
                  href={annualCheckoutUrl}
                  onClick={() => trackCheckoutClick(482, "anual")}
                  className="inicio2-price-cta inicio2-price-cta-primary"
                >
                  Começar teste de 3 dias grátis
                </a>
                <p className="inicio2-price-note">3 dias grátis • Stripe • 7 dias de garantia</p>
              </article>

              <article className="inicio2-price-card">
                <div className="inicio2-price-head">
                  <p className="inicio2-price-kicker">Plano mensal</p>
                  <h3>Comece com menor compromisso</h3>
                  <p>Ideal para testar a ferramenta primeiro e decidir depois se quer ficar por mais tempo.</p>
                </div>

                <div className="inicio2-price-value inicio2-price-value-secondary">
                  <strong>{ELITE_OFFER.monthlyPrice}</strong>
                  <span>/mês</span>
                </div>
                <p className="inicio2-price-cash inicio2-price-cash-muted">Teste por 3 dias grátis. Sem fidelidade.</p>

                <ul className="inicio2-price-features">
                  {pricingFeatures.slice(0, 6).map((feature) => (
                    <li key={feature}>
                      <CheckCircle2 size={18} />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <a
                  href={monthlyCheckoutUrl}
                  onClick={() => trackCheckoutClick(97, "mensal")}
                  className="inicio2-price-cta inicio2-price-cta-secondary"
                >
                  Começar teste de 3 dias grátis
                </a>
                <p className="inicio2-price-note">3 dias grátis • Pagamento seguro pela Stripe</p>
              </article>
            </div>
            <div className="mt-8 text-center text-sm text-slate-500 font-semibold">
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
              Quero acessar o Canva Viagem agora
            </a>
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
