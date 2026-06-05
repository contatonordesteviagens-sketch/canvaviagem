import { useState, useEffect } from "react";
import { 
  Play, Check, ShieldCheck, Instagram, LayoutDashboard, Calendar, Video, BookOpen, Clock, ChevronDown, CheckCircle2 
} from "lucide-react";
import "@/assets/inicio-design.css";
import lucasPortrait from "@/assets/lucas-ferrari-portrait.webp";
import logoImage from "@/assets/logo.png";
import heroDashboard from "@/assets/hero_dashboard.jpg";
import dashboardInterno from "@/assets/dashboard_interno.png";
import antesAmador from "@/assets/antes_amador.png";
import depoisPremium from "@/assets/depois_premium.png";
import crmLeads from "@/assets/crm_leads.png";
import paginaRoteiro from "@/assets/pagina_venda_roteiro.png";
import { PricingAccordion } from "@/components/PricingAccordion";

// Import local premium tools showcase images
import showcaseAdCreation from "@/assets/images/showcase-ad-creation.png";
import showcaseLandingPages from "@/assets/images/showcase-landing-pages.png";
import showcaseCrm from "@/assets/images/showcase-crm.png";
import showcaseScheduler from "@/assets/images/showcase-scheduler.png";
import showcasePremiumMedias from "@/assets/images/showcase-premium-medias.png";

export default function Inicio() {
  const [isYearly, setIsYearly] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);
  const [activeToolTab, setActiveToolTab] = useState<string>("featured");

  useEffect(() => {
    const sticky = document.querySelector('.mobile-sticky');
    const planos = document.getElementById('planos');
    if (!sticky) return;
    
    const handleScroll = () => {
      const scrollPercent = window.scrollY / (document.body.scrollHeight - window.innerHeight);
      const isPlanosVisible = planos ? planos.getBoundingClientRect().top < window.innerHeight : false;

      if (scrollPercent > 0.35 && !isPlanosVisible) {
        sticky.classList.add('is-visible');
      } else {
        sticky.classList.remove('is-visible');
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  const faqData = [
    {
      question: "Preciso ter conhecimento em design?",
      answer: "Não. A plataforma foi criada para facilitar a rotina de quem não quer depender de designer. Você escolhe o modelo, ajusta o destino e publica."
    },
    {
      question: "Funciona no celular?",
      answer: "Sim. Você pode acessar pelo celular. Para edições mais detalhadas, o computador pode ser mais confortável."
    },
    {
      question: "E se eu não gostar?",
      answer: "Você tem 7 dias para testar. Se não fizer sentido para sua agência, solicite reembolso dentro do prazo da garantia."
    },
    {
      question: "Já tenho Canva Pro. Preciso disso?",
      answer: "Canva Pro é uma ferramenta de design genérica. O Canva Viagem entrega modelos, copys, ideias, páginas, CRM e recursos pensados especificamente para turismo."
    },
    {
      question: "O conteúdo vai parecer igual ao da concorrente?",
      answer: "Não precisa. Os modelos são editáveis: você pode trocar destino, texto, preço, fotos, cores e identidade da sua agência."
    },
    {
      question: "Posso usar para mais de uma agência?",
      answer: "Os planos são individuais por marca. Cada agência ou marca precisa de um plano próprio. Se você gerencia mais de uma, entre em contato com o suporte para avaliar a melhor opção."
    },
    {
      question: "Como recebo o acesso?",
      answer: "Após o pagamento, o acesso é enviado por e-mail em poucos minutos."
    },
    {
      question: "Tem suporte?",
      answer: "Sim. O suporte depende do plano contratado. No plano Elite, o atendimento é prioritário via WhatsApp."
    },
    {
      question: "Posso cancelar quando quiser?",
      answer: "Sim. Não existe fidelidade. Cancele quando quiser pelo painel ou pelo suporte."
    },
    {
      question: "O que está incluso no plano Elite?",
      answer: "Artes ilimitadas, sites express, CRM de leads, recursos de IA e suporte prioritário via WhatsApp."
    }
  ];

  return (
    <div className="inicio-page">
      {/* 1. HEADER MOBILE */}
      <header className="site-header">
        <div className="header-inner">
          <img src={logoImage} alt="Canva Viagem" className="logo" />
          <a href="#planos" className="header-cta">Ver Planos</a>
        </div>
      </header>

      <main>
        {/* 2. HERO */}
        <section id="hero" className="hero">
          <div className="inicio-container hero-inner">
            <div className="hero-copy">
              <h1>Crie posts, anúncios e páginas para vender viagens em minutos.</h1>
              <p>O Canva Viagem reúne mídias prontas, IA para anúncios, criador de páginas e CRM para ajudar sua agência a aparecer melhor, atender mais rápido e vender pacotes com mais profissionalismo.</p>
              
              <ul className="hero-bullets">
                <li>400+ mídias prontas para turismo</li>
                <li>Anúncios e legendas criados com IA</li>
                <li>Sites e páginas para pacotes</li>
                <li>CRM para organizar leads</li>
                <li>Acesso imediato e garantia de 7 dias</li>
              </ul>
              
              <a href="#planos" className="btn btn-white">Assinar Plano Elite Agora →</a>
              <br />
              <a href="#demo" className="hero-secondary">Ver a plataforma por dentro ↓</a>
              
              <div className="hero-proof">
                <span>Pagamento seguro via Hotmart</span>
              </div>
            </div>
            <div className="hero-visual">
              <img src={heroDashboard} alt="Plataforma Canva Viagem" />
            </div>
          </div>
        </section>

        {/* 3. DEMONSTRAÇÃO DA PLATAFORMA */}
        <section id="demo" className="demo inicio-section">
          <div className="inicio-container">
            <h2 className="section-title">Veja a plataforma por dentro em 60 segundos</h2>
            <p className="section-subtitle">Assista à criação de uma campanha, uma página e a organização de leads dentro do Canva Viagem.</p>
            
              <div className="demo-frame">
              <video 
                autoPlay 
                muted 
                loop 
                playsInline
                poster={dashboardInterno}
                style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.8 }}
              >
                <source src="/demo-viagem.mp4" type="video/mp4" />
              </video>
              <div className="demo-play">
                <Play size={20} style={{ flexShrink: 0 }} />
                <span className="demo-play-text" style={{ marginLeft: '8px' }}>Ver prévia da plataforma</span>
              </div>
            </div>
            <p className="demo-disclaimer">Demonstração visual da plataforma. Exemplo representativo das funcionalidades.</p>

            <div className="steps-grid">
              <div className="step-card">
                <div className="step-number">1</div>
                <h3>Digite o destino</h3>
                <p>Exemplo: "Pacote para Maldivas 7 dias para casal."</p>
              </div>
              <div className="step-card">
                <div className="step-number">2</div>
                <h3>A IA cria</h3>
                <p>Gera anúncios, legendas, páginas, imagens e gatilhos.</p>
              </div>
              <div className="step-card">
                <div className="step-number">3</div>
                <h3>Publique e venda</h3>
                <p>Use no Instagram, WhatsApp, página de venda ou CRM.</p>
              </div>
            </div>
          </div>
        </section>

        {/* 3.5 NOVA SEÇÃO - PROVA VISUAL RÁPIDA */}
        <section className="proof-mini">
          <div className="inicio-container">
            <h2 className="section-title" style={{ fontSize: "28px" }}>Antes de assinar, veja o que você realmente acessa</h2>
            <p className="section-subtitle">Uma visão rápida dos principais módulos dentro da plataforma.</p>
            
            <div className="proof-mini-grid">
              <div className="proof-mini-card">
                <h3>Dashboard</h3>
                <p>Todas as ferramentas em um só lugar.</p>
              </div>
              <div className="proof-mini-card">
                <h3>IA de Anúncios</h3>
                <p>Digite o destino e gere ideias, textos e campanhas.</p>
              </div>
              <div className="proof-mini-card">
                <h3>Sites Express</h3>
                <p>Crie páginas para apresentar pacotes e roteiros.</p>
              </div>
              <div className="proof-mini-card">
                <h3>CRM de Leads</h3>
                <p>Organize contatos, orçamentos e oportunidades.</p>
              </div>
            </div>
          </div>
        </section>

        {/* DEPOIMENTOS — OCULTO ATÉ HAVER DEPOIMENTOS REAIS */}
        {/* Para ativar: remover o style={{ display: 'none' }} abaixo */}
        <section className="testimonials inicio-section" style={{ display: 'none' }} aria-hidden="true">
          <div className="inicio-container">
            <h2 className="section-title">Quem usa, entende o valor nos primeiros minutos</h2>
            <p className="section-subtitle">Veja relatos reais de agentes e profissionais do turismo que começaram a usar o Canva Viagem.</p>
            <div className="testimonials-grid">
              {/* Depoimento 1 — substituir pelos dados reais quando disponíveis */}
              <div className="testimonial-card">
                <div className="testimonial-avatar">A</div>
                <div className="testimonial-stars">★★★★★</div>
                <p className="testimonial-text">"Usei a plataforma para montar posts e páginas de pacotes com muito mais rapidez. Facilitou bastante minha rotina de divulgação."</p>
                <div className="testimonial-author">
                  <strong>Nome do Cliente</strong>
                  <span>Cidade · Agência</span>
                </div>
              </div>
              {/* Depoimento 2 */}
              <div className="testimonial-card">
                <div className="testimonial-avatar">B</div>
                <div className="testimonial-stars">★★★★★</div>
                <p className="testimonial-text">"Depoimento real aqui."</p>
                <div className="testimonial-author">
                  <strong>Nome do Cliente</strong>
                  <span>Cidade · Agência</span>
                </div>
              </div>
              {/* Depoimento 3 */}
              <div className="testimonial-card">
                <div className="testimonial-avatar">C</div>
                <div className="testimonial-stars">★★★★★</div>
                <p className="testimonial-text">"Depoimento real aqui."</p>
                <div className="testimonial-author">
                  <strong>Nome do Cliente</strong>
                  <span>Cidade · Agência</span>
                </div>
              </div>
            </div>
            <p className="testimonials-note">Depoimentos reais. Resultados variam conforme oferta, atendimento, audiência e divulgação.</p>
          </div>
        </section>

        {/* COMO FUNCIONA NA PRÁTICA */}
        <section className="how-it-works inicio-section">
          <div className="inicio-container">
            <h2 className="section-title">Veja como o Canva Viagem funciona na prática</h2>
            <p className="section-subtitle">Uma demonstração rápida mostrando como transformar uma ideia de pacote em conteúdo, página e organização comercial.</p>
            <div className="hiw-grid">
              <div className="hiw-card">
                <div className="hiw-number">1</div>
                <h3>Campanha criada</h3>
                <p>Digite o destino e gere textos, ideias e chamadas para divulgar o pacote.</p>
              </div>
              <div className="hiw-card">
                <div className="hiw-number">2</div>
                <h3>Página pronta</h3>
                <p>Monte uma página simples para apresentar o pacote e enviar no WhatsApp.</p>
              </div>
              <div className="hiw-card">
                <div className="hiw-number">3</div>
                <h3>Lead organizado</h3>
                <p>Registre contatos, orçamentos e oportunidades no CRM integrado.</p>
              </div>
            </div>
          </div>
        </section>

        {/* 4. ANTES E DEPOIS */}
        <section id="before-after" className="before-after inicio-section">
          <div className="inicio-container">
            <div className="w-full flex flex-col items-center justify-center text-center mx-auto mb-12">
              <h2 className="section-title w-full text-center" style={{ textAlign: 'center' }}>Chega de perder tempo no Canva</h2>
              <p className="section-subtitle w-full text-center" style={{ textAlign: 'center', margin: '0 auto' }}>Sua agência merece um visual profissional sem precisar pagar caro ou passar horas arrastando elementos.</p>
            </div>
            
            <div className="ba-grid">
              {/* ANTES */}
              <div className="ba-card">
                <div className="ba-label danger">O jeito antigo</div>
                <div className="ba-image">
                  <img src={antesAmador} alt="Design amador de viagem" />
                </div>
                <ul className="ba-list">
                  <li className="bad">Horas arrastando elementos</li>
                  <li className="bad">Design poluído e amador</li>
                  <li className="bad">Legenda sem estratégia</li>
                  <li className="bad">Baixa percepção de confiança</li>
                </ul>
              </div>
              
              {/* DEPOIS */}
              <div className="ba-card is-after">
                <div className="ba-label success">Com Canva Viagem</div>
                <div className="ba-image">
                  <img src={depoisPremium} alt="Design premium de viagem" />
                </div>
                <ul className="ba-list">
                  <li className="good">Post pronto em segundos</li>
                  <li className="good">Visual premium e limpo</li>
                  <li className="good">Legenda focada em conversão</li>
                  <li className="good">Mais confiança para vender pacotes</li>
                </ul>
              </div>
            </div>
            
            <div className="w-full flex justify-center mt-12 mb-4">
              <p className="ba-final-line text-center mx-auto" style={{ textAlign: 'center' }}>A diferença entre amador e profissional não está só no design. Está na confiança que sua oferta transmite.</p>
            </div>
          </div>
        </section>

        {/* 5. PEQUENOS AJUSTES (PERCEPTION) */}
        <section id="perception" className="perception inicio-section">
          <div className="inicio-container">
            <h2 className="section-title">O que o cliente percebe antes de pedir orçamento</h2>
            <p className="section-subtitle">A percepção visual vem antes da conversa. Se sua agência parece improvisada, o cliente já chega desconfiado.</p>
            
            <div className="perception-grid">
              <div className="perception-card">
                <div className="perception-label before">Design Amador</div>
                <ul className="perception-list">
                  <li className="perception-item bad">"Parece improvisado"</li>
                  <li className="perception-item bad">"Vou pedir desconto"</li>
                  <li className="perception-item bad">"Não sei se confio"</li>
                </ul>
              </div>
              <div className="perception-card">
                <div className="perception-label after">Design Premium</div>
                <ul className="perception-list">
                  <li className="perception-item good">"Parece profissional"</li>
                  <li className="perception-item good">"Transmite confiança"</li>
                  <li className="perception-item good">"Vale pedir orçamento"</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* 6. AUTORIDADE */}
        <section id="authority" className="authority inicio-section">
          <div className="inicio-container">
            <div className="authority-card">
              <img src={lucasPortrait} alt="Lucas Ferrari" className="authority-photo" />
              <div>
                <h2>Criado por quem vive o turismo</h2>
                <p className="authority-text">O Canva Viagem foi criado por Lucas Ferrari, especialista em marketing para agências, receptivos e profissionais do turismo. A plataforma nasceu para ajudar agências a criar conteúdo, páginas e campanhas com mais velocidade, sem depender de designer, social media ou agência cara.</p>
                <div className="authority-stats">
                  <div className="stat-card">
                    <div className="stat-number">10+</div>
                    <div className="stat-label">Anos no turismo e marketing</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-number">100%</div>
                    <div className="stat-label">Foco em agências de viagens</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-number" style={{ fontSize: "18px" }}>Suporte</div>
                    <div className="stat-label">Comunidade de agentes e agências</div>
                  </div>
                </div>
                
                <div className="authority-actions" style={{ display: 'flex', gap: '12px', marginTop: '32px', flexWrap: 'wrap', justifyContent: 'center' }}>
                  <a href="#" className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0 16px', background: 'white', border: '1px solid #E2E8F0', color: '#0F172A', fontWeight: '800' }}>
                    <Instagram size={18} color="#E1306C" /> Instagram
                  </a>
                  <a href="#" className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0 16px', background: 'white', border: '1px solid #E2E8F0', color: '#0F172A', fontWeight: '800' }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#25D366" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
                    WhatsApp
                  </a>
                  <a href="#demo" className="btn btn-primary" style={{ padding: '0 16px' }}>
                    Ver demonstração
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 7. FEATURES */}
        <section id="features" className="features inicio-section">
          <div className="inicio-container">
            <div className="w-full flex flex-col items-center justify-center text-center mx-auto">
              <h2 className="section-title w-full text-center" style={{ textAlign: 'center' }}>Tudo que sua agência precisa em um só lugar</h2>
              <p className="section-subtitle w-full text-center" style={{ textAlign: 'center', margin: '0 auto 32px' }}>Uma plataforma para criar conteúdo, divulgar pacotes, montar páginas e organizar leads sem depender de várias ferramentas.</p>
            </div>
            
            <div className="features-grid mx-auto" style={{ margin: '0 auto' }}>
              <div className="feature-card">
                <div className="feature-icon"><Instagram size={20} /></div>
                <h3>Posts e Carrosséis</h3>
                <p>Formatos prontos para divulgar destinos, pacotes e datas especiais.</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon"><Video size={20} /></div>
                <h3>Vídeos Curtos</h3>
                <p>Roteiros e templates para Reels, Stories e vídeos de oferta.</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon"><BookOpen size={20} /></div>
                <h3>Legendas com IA</h3>
                <p>Textos criados para divulgar pacotes com mais clareza e persuasão.</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon"><LayoutDashboard size={20} /></div>
                <h3>Sites Express</h3>
                <p>Páginas de venda para pacotes específicos, prontas para compartilhar.</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon"><Calendar size={20} /></div>
                <h3>CRM Integrado</h3>
                <p>Organize leads, orçamentos e contatos em um único painel.</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon"><Clock size={20} /></div>
                <h3>Automação</h3>
                <p>Recursos para acelerar sua rotina de conteúdo e atendimento.</p>
              </div>
            </div>
            
            <div className="features-cta w-full flex justify-center mt-10">
              <a href="#planos" className="btn btn-primary">Começar a usar agora</a>
            </div>
          </div>
        </section>

        {/* SHOWCASE SECTION: FERRAMENTAS PROFISSIONAIS */}
        <section className="py-24 px-6 bg-white border-b border-[#e5e7eb] inicio-section">
          <div className="inicio-container text-center">
            <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4">
              Ferramentas profissionais para todas as tarefas
            </h2>
            <p className="text-[#64748b] text-base md:text-lg max-w-3xl mx-auto mb-12">
              Seja para um trabalho paralelo ou um projeto pessoal, o Canva Viagem Elite oferece acesso a recursos Pro e ferramentas de IA avançados para que você possa criar conteúdo profissional mais rapidamente, em um só lugar.
            </p>

            {/* Navigation Tabs (Pills) */}
            <div className="flex flex-wrap justify-center gap-2 mb-16">
              {[
                { id: "featured", label: "Em destaque" },
                { id: "social", label: "Redes sociais" },
                { id: "video", label: "Vídeos" },
                { id: "photo", label: "Fotos e Designs" },
                { id: "ai", label: "Inteligência Artificial" },
                { id: "texts", label: "Textos e Contratos" }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveToolTab(tab.id)}
                  className={`px-5 py-2.5 rounded-full text-sm font-bold transition-all duration-200 ${
                    activeToolTab === tab.id
                      ? "bg-[#8b3dff] text-white shadow-md shadow-[#8b3dff]/20 scale-105"
                      : "bg-[#f1f5f9] text-[#64748b] hover:bg-[#e2e8f0] hover:text-[#0f172a]"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Dynamic Grid of Cards based on activeToolTab */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Tab: Em destaque */}
              {activeToolTab === "featured" && (
                <>
                  {/* 1. Criação de anúncio com IA */}
                  <div className="bg-[#f8fafc] border border-[#e2e8f0] rounded-3xl p-6 flex flex-col hover:shadow-lg transition-all duration-300">
                    <div>
                      <div className="w-full aspect-[4/3] rounded-2xl overflow-hidden mb-6 border border-[#e2e8f0]">
                        <img src={showcaseAdCreation} alt="Criação de anúncios com IA" className="w-full h-full object-cover" />
                      </div>
                      <h3 className="text-xl font-bold text-[#0f172a] mb-2 text-left flex items-center gap-2">
                        <span className="text-[#8b3dff]">⚡</span> Criação de anúncios com IA
                      </h3>
                      <p className="text-[#64748b] text-sm text-left leading-relaxed">
                        Crie campanhas e ofertas irresistíveis em segundos. Digite o destino, preço e parcelas, e nossa inteligência artificial gera o anúncio completo com a sua identidade visual pronta para atrair viajantes de alto padrão.
                      </p>
                    </div>
                  </div>

                  {/* 2. Construtor de sites */}
                  <div className="bg-[#f8fafc] border border-[#e2e8f0] rounded-3xl p-6 flex flex-col hover:shadow-lg transition-all duration-300">
                    <div>
                      <div className="w-full aspect-[4/3] rounded-2xl overflow-hidden mb-6 border border-[#e2e8f0]">
                        <img src={showcaseLandingPages} alt="Construtor de sites" className="w-full h-full object-cover" />
                      </div>
                      <h3 className="text-xl font-bold text-[#0f172a] mb-2 text-left flex items-center gap-2">
                        <span className="text-[#8b3dff]">🌐</span> Construtor de sites
                      </h3>
                      <p className="text-[#64748b] text-sm text-left leading-relaxed">
                        Crie modelos profissionais de landing pages de vendas e roteiros de viagens completos em instantes. Aplique suas cores, fontes e logotipos com um clique para impressionar seus leads e vender pacotes mais rápido.
                      </p>
                    </div>
                  </div>

                  {/* 3. CRM para gestão de clientes */}
                  <div className="bg-[#f8fafc] border border-[#e2e8f0] rounded-3xl p-6 flex flex-col hover:shadow-lg transition-all duration-300">
                    <div>
                      <div className="w-full aspect-[4/3] rounded-2xl overflow-hidden mb-6 border border-[#e2e8f0]">
                        <img src={showcaseCrm} alt="CRM para gestão de clientes" className="w-full h-full object-cover" />
                      </div>
                      <h3 className="text-xl font-bold text-[#0f172a] mb-2 text-left flex items-center gap-2">
                        <span className="text-[#8b3dff]">📊</span> CRM para gestão de clientes
                      </h3>
                      <p className="text-[#64748b] text-sm text-left leading-relaxed">
                        Organize suas conversas, gerencie o funil de atendimento e vendas de pacotes de viagem, e controle todo o histórico de contatos e contratos da sua agência em um único sistema prático e intuitivo.
                      </p>
                    </div>
                  </div>
                </>
              )}

              {/* Tab: Redes sociais */}
              {activeToolTab === "social" && (
                <>
                  {/* 1. Calendário de postagens */}
                  <div className="bg-[#f8fafc] border border-[#e2e8f0] rounded-3xl p-6 flex flex-col hover:shadow-lg transition-all duration-300">
                    <div>
                      <div className="w-full aspect-[4/3] rounded-2xl overflow-hidden mb-6 border border-[#e2e8f0]">
                        <img src={showcaseScheduler} alt="Calendário de postagens" className="w-full h-full object-cover" />
                      </div>
                      <h3 className="text-xl font-bold text-[#0f172a] mb-2 text-left flex items-center gap-2">
                        <span className="text-[#8b3dff]">📅</span> Calendário de postagens
                      </h3>
                      <p className="text-[#64748b] text-sm text-left leading-relaxed">
                        Planeje, crie e agende suas postagens diretamente da plataforma para todas as suas redes de forma automatizada, mantendo seu perfil sempre ativo.
                      </p>
                    </div>
                  </div>

                  {/* 2. Mais de 400 mídias exclusivas */}
                  <div className="bg-[#f8fafc] border border-[#e2e8f0] rounded-3xl p-6 flex flex-col hover:shadow-lg transition-all duration-300">
                    <div>
                      <div className="w-full aspect-[4/3] rounded-2xl overflow-hidden mb-6 border border-[#e2e8f0]">
                        <img src={showcasePremiumMedias} alt="Mais de 400 mídias exclusivas" className="w-full h-full object-cover" />
                      </div>
                      <h3 className="text-xl font-bold text-[#0f172a] mb-2 text-left flex items-center gap-2">
                        <span className="text-[#8b3dff]">✨</span> Mais de 400 mídias exclusivas
                      </h3>
                      <p className="text-[#64748b] text-sm text-left leading-relaxed">
                        Acesso completo ao acervo de gabaritos prontos para posts no feed, stories editáveis, legendas e criativos. Tudo perfeitamente desenhado para engajar sua audiência nas redes.
                      </p>
                    </div>
                  </div>
                </>
              )}

              {/* Tab: Vídeos */}
              {activeToolTab === "video" && (
                <>
                  {/* 1. Mais de 300 vídeos Reels */}
                  <div className="bg-[#f8fafc] border border-[#e2e8f0] rounded-3xl p-6 flex flex-col hover:shadow-lg transition-all duration-300">
                    <div>
                      <div className="w-full aspect-[4/3] rounded-2xl overflow-hidden mb-6 border border-[#e2e8f0]">
                        <img src="/images/LOC_MarTechB2C_CanvaPro_LandingPage_PremiumVideoTemplates_Small_pt-BR.png" alt="Mais de 300 vídeos Reels de destinos" className="w-full h-full object-cover" />
                      </div>
                      <h3 className="text-xl font-bold text-[#0f172a] mb-2 text-left flex items-center gap-2">
                        <span className="text-[#8b3dff]">🎬</span> Mais de 300 vídeos Reels
                      </h3>
                      <p className="text-[#64748b] text-sm text-left leading-relaxed">
                        Desbloqueie uma biblioteca com centenas de vídeos cinematográficos gravados em alta definição dos principais destinos nacionais e internacionais prontos para atrair viajantes.
                      </p>
                    </div>
                  </div>

                  {/* 2. Roteiros e Copys para Vídeos */}
                  <div className="bg-[#f8fafc] border border-[#e2e8f0] rounded-3xl p-6 flex flex-col hover:shadow-lg transition-all duration-300">
                    <div>
                      <div className="w-full aspect-[4/3] rounded-2xl overflow-hidden mb-6 border border-[#e2e8f0]">
                        <img src="/images/PRO25001_JTBD_Section_Video_Tab_Captions.png" alt="Roteiros para vídeos" className="w-full h-full object-cover" />
                      </div>
                      <h3 className="text-xl font-bold text-[#0f172a] mb-2 text-left flex items-center gap-2">
                        <span className="text-[#8b3dff]">💬</span> Roteiros e Textos para Vídeos
                      </h3>
                      <p className="text-[#64748b] text-sm text-left leading-relaxed">
                        Tenha acesso a roteiros detalhados e ganchos persuasivos para seus vídeos Reels. Saiba como prender a atenção do cliente e gerar mais mensagens diretas querendo fechar viagens.
                      </p>
                    </div>
                  </div>

                  {/* 3. Acesso Fácil via Google Drive */}
                  <div className="bg-[#f8fafc] border border-[#e2e8f0] rounded-3xl p-6 flex flex-col hover:shadow-lg transition-all duration-300">
                    <div>
                      <div className="w-full aspect-[4/3] rounded-2xl overflow-hidden mb-6 border border-[#e2e8f0]">
                        <img src="/images/Whiteboard_ProTemplates_Desktop_2x_pt-BR.png" alt="Acesso ao Google Drive" className="w-full h-full object-cover" />
                      </div>
                      <h3 className="text-xl font-bold text-[#0f172a] mb-2 text-left flex items-center gap-2">
                        <span className="text-[#8b3dff]">📥</span> Download via Google Drive
                      </h3>
                      <p className="text-[#64748b] text-sm text-left leading-relaxed">
                        Todos os arquivos de vídeo estão hospedados e organizados de forma profissional no Google Drive. Baixe as mídias em 4K e HD com um único clique diretamente no seu celular ou desktop.
                      </p>
                    </div>
                  </div>
                </>
              )}

              {/* Tab: Fotos e Designs */}
              {activeToolTab === "photo" && (
                <>
                  {/* 1. Artes prontas para o Feed */}
                  <div className="bg-[#f8fafc] border border-[#e2e8f0] rounded-3xl p-6 flex flex-col hover:shadow-lg transition-all duration-300">
                    <div>
                      <div className="w-full aspect-[4/3] rounded-2xl overflow-hidden mb-6 border border-[#e2e8f0]">
                        <img src="/images/ArtistCollection_small_pt-BR.png" alt="Artes prontas para o Feed" className="w-full h-full object-cover" />
                      </div>
                      <h3 className="text-xl font-bold text-[#0f172a] mb-2 text-left flex items-center gap-2">
                        <span className="text-[#8b3dff]">🎨</span> Artes prontas para o Feed
                      </h3>
                      <p className="text-[#64748b] text-sm text-left leading-relaxed">
                        Modelos profissionais prontos de carrosséis e posts estáticos com artes de ofertas e roteiros explicativos. Perfeitos para manter seu feed sofisticado e harmônico.
                      </p>
                    </div>
                  </div>

                  {/* 2. Stories interativos para Instagram */}
                  <div className="bg-[#f8fafc] border border-[#e2e8f0] rounded-3xl p-6 flex flex-col hover:shadow-lg transition-all duration-300">
                    <div>
                      <div className="w-full aspect-[4/3] rounded-2xl overflow-hidden mb-6 border border-[#e2e8f0]">
                        <img src="/images/Spotlight_Disney_Mobile.png" alt="Stories interativos" className="w-full h-full object-cover" />
                      </div>
                      <h3 className="text-xl font-bold text-[#0f172a] mb-2 text-left flex items-center gap-2">
                        <span className="text-[#8b3dff]">📱</span> Stories interativos
                      </h3>
                      <p className="text-[#64748b] text-sm text-left leading-relaxed">
                        Apareça todos os dias utilizando caixas de perguntas elegantes, enquetes, quizzes e roteiros de interação diários para converter seguidores em compradores.
                      </p>
                    </div>
                  </div>
                </>
              )}

              {/* Tab: Inteligência Artificial */}
              {activeToolTab === "ai" && (
                <>
                  {/* 1. Vendedor de Viagens com IA */}
                  <div className="bg-[#f8fafc] border border-[#e2e8f0] rounded-3xl p-6 flex flex-col hover:shadow-lg transition-all duration-300 ring-2 ring-[#8b3dff]/30">
                    <div>
                      <div className="w-full aspect-[4/3] rounded-2xl overflow-hidden mb-6 border border-[#e2e8f0]">
                        <img src="/images/PRO25001_JTBD_Section_Brand_Tab_Magic_Write.png" alt="Vendedor de viagens com IA" className="w-full h-full object-cover" />
                      </div>
                      <h3 className="text-xl font-bold text-[#0f172a] mb-2 text-left flex items-center gap-2">
                        <span className="text-[#8b3dff]">👑</span> Vendedor de Viagens IA
                      </h3>
                      <p className="text-[#64748b] text-sm text-left leading-relaxed">
                        O assistente virtual mais potente do mercado, treinado para vender pacotes e criar ofertas exclusivas. Escreva a ideia ou o destino e a IA gera a copy de venda instantaneamente.
                      </p>
                    </div>
                  </div>

                  {/* 2. Agentes de IA para Marketing */}
                  <div className="bg-[#f8fafc] border border-[#e2e8f0] rounded-3xl p-6 flex flex-col hover:shadow-lg transition-all duration-300">
                    <div>
                      <div className="w-full aspect-[4/3] rounded-2xl overflow-hidden mb-6 border border-[#e2e8f0]">
                        <img src="/images/LOC_MarTechB2C_CanvaPro_LandingPage_AIAdCreation_Small_pt-BR.png" alt="Agentes de marketing com IA" className="w-full h-full object-cover" />
                      </div>
                      <h3 className="text-xl font-bold text-[#0f172a] mb-2 text-left flex items-center gap-2">
                        <span className="text-[#8b3dff]">🤖</span> Agentes IA de Marketing
                      </h3>
                      <p className="text-[#64748b] text-sm text-left leading-relaxed">
                        Agilize sua produção de conteúdo com assistentes de IA para escrever descrições e títulos que vendem pacotes turísticos sem esforço.
                      </p>
                    </div>
                  </div>

                  {/* 3. Gerador Inteligente de Roteiros */}
                  <div className="bg-[#f8fafc] border border-[#e2e8f0] rounded-3xl p-6 flex flex-col hover:shadow-lg transition-all duration-300">
                    <div>
                      <div className="w-full aspect-[4/3] rounded-2xl overflow-hidden mb-6 border border-[#e2e8f0]">
                        <img src="/images/PRO25001_JTBD_Section_Spotlight_Tab_Style_Match.png" alt="Gerador de roteiros inteligente" className="w-full h-full object-cover" />
                      </div>
                      <h3 className="text-xl font-bold text-[#0f172a] mb-2 text-left flex items-center gap-2">
                        <span className="text-[#8b3dff]">🗺️</span> Gerador IA de Roteiros
                      </h3>
                      <p className="text-[#64748b] text-sm text-left leading-relaxed">
                        Crie propostas de viagem e roteiros completos dia a dia ultra detalhados e personalizados para o perfil de cada cliente em segundos.
                      </p>
                    </div>
                  </div>
                </>
              )}

              {/* Tab: Textos e Contratos */}
              {activeToolTab === "texts" && (
                <>
                  {/* 1. Legendas Prontas e Persuasivas */}
                  <div className="bg-[#f8fafc] border border-[#e2e8f0] rounded-3xl p-6 flex flex-col hover:shadow-lg transition-all duration-300">
                    <div>
                      <div className="w-full aspect-[4/3] rounded-2xl overflow-hidden mb-6 border border-[#e2e8f0]">
                        <img src="/images/PRO25001_JTBD_Section_Video_Tab_Captions.png" alt="Legendas prontas" className="w-full h-full object-cover" />
                      </div>
                      <h3 className="text-xl font-bold text-[#0f172a] mb-2 text-left flex items-center gap-2">
                        <span className="text-[#8b3dff]">✍️</span> Legendas Prontas
                      </h3>
                      <p className="text-[#64748b] text-sm text-left leading-relaxed">
                        Centenas de legendas perfeitamente estruturadas com gatilhos mentais prontos para você copiar, colar e aplicar nas fotos ou Reels do seu feed.
                      </p>
                    </div>
                  </div>

                  {/* 2. Textos de Ofertas Validadas */}
                  <div className="bg-[#f8fafc] border border-[#e2e8f0] rounded-3xl p-6 flex flex-col hover:shadow-lg transition-all duration-300">
                    <div>
                      <div className="w-full aspect-[4/3] rounded-2xl overflow-hidden mb-6 border border-[#e2e8f0]">
                        <img src="/images/LOC_MarTechB2C_CanvaPro_LandingPage_AdInspiration_Small_pt-BR.png" alt="Textos de ofertas validadas" className="w-full h-full object-cover" />
                      </div>
                      <h3 className="text-xl font-bold text-[#0f172a] mb-2 text-left flex items-center gap-2">
                        <span className="text-[#8b3dff]">💰</span> Textos de Ofertas
                      </h3>
                      <p className="text-[#64748b] text-sm text-left leading-relaxed">
                        Copywriting de alta performance validado por agências para ofertas especiais e campanhas de fechamento de pacotes de viagem.
                      </p>
                    </div>
                  </div>

                  {/* 3. Contratos de Viagens Validados */}
                  <div className="bg-[#f8fafc] border border-[#e2e8f0] rounded-3xl p-6 flex flex-col hover:shadow-lg transition-all duration-300">
                    <div>
                      <div className="w-full aspect-[4/3] rounded-2xl overflow-hidden mb-6 border border-[#e2e8f0]">
                        <img src="/images/PRO25001_JTBD_Section_Print_Tab_Disney_Collection.png" alt="Contratos de viagens validados" className="w-full h-full object-cover" />
                      </div>
                      <h3 className="text-xl font-bold text-[#0f172a] mb-2 text-left flex items-center gap-2">
                        <span className="text-[#8b3dff]">📄</span> Modelos de Contratos
                      </h3>
                      <p className="text-[#64748b] text-sm text-left leading-relaxed">
                        Modelos prontos e juridicamente estruturados de contratos de intermediação de viagens e prestação de serviços para dar total segurança jurídica ao seu negócio.
                      </p>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </section>

        {/* 8. COMPARATIVO */}
        <section id="comparison" className="comparison inicio-section">
          <div className="inicio-container">
            <h2 className="section-title">Veja onde seu dinheiro rende mais</h2>
            <p className="section-subtitle" style={{ textAlign: 'center', marginTop: '8px', fontSize: '13px', color: '#64748B' }}>Valores externos são estimativas e podem variar conforme fornecedor, profissional e plano contratado.</p>
            
            <div className="comparison-grid">
              <div className="comparison-card">
                <h3>Designer Freelancer</h3>
                <div className="compare-row">
                  <span className="compare-label">Custo Médio</span>
                  <span className="compare-value">A partir de R$80 por arte ou sob demanda</span>
                </div>
                <div className="compare-row">
                  <span className="compare-label">Tempo</span>
                  <span className="compare-value">3 a 5 dias</span>
                </div>
                <div className="compare-row">
                  <span className="compare-label">Trabalho</span>
                  <span className="compare-value">Precisa aprovar e revisar</span>
                </div>
              </div>
              
              <div className="comparison-card">
                <h3>Pack do Canva</h3>
                <div className="compare-row">
                  <span className="compare-label">Custo Médio</span>
                  <span className="compare-value">R$97 único</span>
                </div>
                <div className="compare-row">
                  <span className="compare-label">Tempo</span>
                  <span className="compare-value">Você ainda precisa editar</span>
                </div>
                <div className="compare-row">
                  <span className="compare-label">Trabalho</span>
                  <span className="compare-value">Manual</span>
                </div>
              </div>

              <div className="comparison-card best">
                <div className="best-badge">Melhor Escolha</div>
                <h3>Canva Viagem</h3>
                <div className="compare-row">
                  <span className="compare-label">Custo</span>
                  <span className="compare-value">A partir de R$ 97/mês</span>
                </div>
                <div className="compare-row">
                  <span className="compare-label">Tempo</span>
                  <span className="compare-value">Em minutos <CheckCircle2 size={14} /></span>
                </div>
                <div className="compare-row">
                  <span className="compare-label">Trabalho</span>
                  <span className="compare-value">IA + CRM + modelos prontos <CheckCircle2 size={14} /></span>
                </div>
              </div>
            </div>
            
            {/* Desktop Table (Hidden on Mobile via CSS) */}
            <div className="desktop-comparison">
               <table>
                 <thead>
                   <tr>
                     <th>Recursos</th>
                     <th>Designer Freelancer</th>
                     <th>Pack do Canva</th>
                     <th>Canva Viagem</th>
                   </tr>
                 </thead>
                 <tbody>
                    <tr>
                      <td>Custo Médio</td>
                      <td>A partir de R$80 por arte ou sob demanda</td>
                      <td>R$97 único</td>
                      <td>A partir de R$ 97/mês</td>
                    </tr>
                    <tr>
                      <td>Tempo de Entrega</td>
                      <td>3 a 5 dias</td>
                      <td>Você ainda precisa editar</td>
                      <td>Em minutos</td>
                    </tr>
                    <tr>
                      <td>Esforço</td>
                      <td>Precisa aprovar e revisar</td>
                      <td>Manual</td>
                      <td>IA + CRM + modelos prontos</td>
                    </tr>
                 </tbody>
               </table>
            </div>
            
            <p className="comparison-note" style={{ textAlign: "center", fontSize: "12px", color: "#64748B", marginTop: "16px" }}>O menor valor disponível é no plano anual à vista. O plano mensal custa R$97/mês.</p>

          </div>
        </section>

        {/* 9. FAIXA PROMOCIONAL */}
        <section className="offer-banner">
          <h2>Condição especial de lançamento</h2>
          <p>Assine hoje e garanta acesso às funcionalidades atuais da plataforma enquanto a oferta estiver disponível.</p>
        </section>

        {/* 10. PLANOS / PRICING */}
        <section id="planos" className="pricing inicio-section">
          <div className="inicio-container">
            <div className="w-full flex flex-col items-center justify-center text-center mx-auto">
              <h2 className="section-title w-full text-center" style={{ textAlign: 'center' }}>Escolha o plano ideal para sua agência</h2>
              <p className="section-subtitle w-full text-center" style={{ textAlign: 'center', margin: '0 auto 32px' }}>Comece no mensal sem compromisso ou economize mais no plano anual.</p>
            </div>

            <PricingAccordion />
          </div>
        </section>

        {/* 11. GARANTIA */}
        <section className="guarantee inicio-section">
          <div className="inicio-container">
            <div className="guarantee-inner">
              <div className="guarantee-seal">
                <strong>7</strong>
                <span>Dias</span>
              </div>
              <div>
                <h2>Risco zero para sua agência</h2>
                <p style={{ marginTop: "14px", fontSize: "15.5px", lineHeight: "1.6" }}>
                  Você tem 7 dias para testar o Canva Viagem. Crie posts, legendas, páginas e veja se a plataforma faz sentido para sua rotina. Se não gostar, solicite reembolso dentro do prazo da garantia.
                </p>
                <ul className="guarantee-list">
                  <li><CheckCircle2 size={16} color="#22C55E" style={{ flexShrink: 0 }} /> Teste antes de decidir</li>
                  <li><CheckCircle2 size={16} color="#22C55E" style={{ flexShrink: 0 }} /> Acesso imediato após o pagamento</li>
                  <li><CheckCircle2 size={16} color="#22C55E" style={{ flexShrink: 0 }} /> Reembolso conforme a política de garantia</li>
                </ul>
                <a href="#" className="refund-link" style={{ marginTop: "24px" }}>Ver política de reembolso</a>
              </div>
            </div>
          </div>
        </section>

        {/* 12. FAQ */}
        <section className="faq inicio-section">
          <div className="inicio-container">
            <h2 className="section-title">Perguntas Frequentes</h2>
            
            <div className="faq-list">
              {faqData.map((item, index) => (
                <div key={index} className="faq-item">
                  <button className="faq-question" onClick={() => toggleFaq(index)}>
                    {item.question}
                    <ChevronDown 
                      className="faq-icon" 
                      style={{ 
                        transform: openFaqIndex === index ? "rotate(180deg)" : "rotate(0)", 
                        transition: "transform 0.3s ease" 
                      }} 
                    />
                  </button>
                  {openFaqIndex === index && (
                    <div className="faq-answer">
                      {item.answer}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 13. CTA FINAL */}
        <section className="final-cta">
          <div className="inicio-container">
            <h2>Pronto para profissionalizar sua agência em minutos?</h2>
            <p>Junte-se a agentes de viagens que usam tecnologia, IA e design para criar conteúdo com mais velocidade.</p>
            <a href="#planos" className="btn btn-primary" style={{ background: "#06B6D4", boxShadow: "0 14px 34px rgba(6, 182, 212, 0.26)" }}>Assinar Elite Agora</a>
            <div className="final-microcopy">Liberação imediata • Pagamento seguro • Garantia de 7 dias</div>
          </div>
        </section>
      </main>

      {/* 14. FOOTER */}
      <footer className="site-footer">
        <div className="inicio-container site-footer-inner">
          <div>
            <img src={logoImage} alt="Canva Viagem Logo" className="footer-logo" />
            <div className="footer-text">© 2026 Canva Viagem. Todos os direitos reservados.</div>
            <div className="footer-contact">
              <a href="mailto:suporte@canvaviagem.com.br" className="footer-contact-link">suporte@canvaviagem.com.br</a>
              <a href="https://wa.me/5500000000000" target="_blank" rel="noopener noreferrer" className="footer-contact-link footer-whatsapp">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
                WhatsApp Suporte
              </a>
            </div>
          </div>
          
          <div className="footer-links">
            <a href="#">Termos de Uso</a>
            <a href="#">Política de Privacidade</a>
            <a href="#">Política de Reembolso</a>
            <a href="#">Contato</a>
          </div>
        </div>
        <div className="inicio-container">
           <div className="payment-safe">
             <ShieldCheck size={16} /> Pagamento seguro via Hotmart
           </div>
        </div>
      </footer>

      {/* 15. STICKY BAR MOBILE */}
      <div className="mobile-sticky">
        <div className="sticky-info">
          <span>Plano Anual</span>
          <span>12x R$ 49<small>,85</small></span>
        </div>
        <a href="#planos" className="sticky-btn">Assinar agora <Check size={16} /></a>
      </div>
    </div>
  );
}
