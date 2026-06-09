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
import depoimento1 from "@/assets/depoimento1.jpg";
import depoimento2 from "@/assets/depoimento2.png";
import depoimento3 from "@/assets/depoimento3.jpg";
import { PricingAccordion } from "@/components/PricingAccordion";

import showcaseAdCreation from "@/assets/images/showcase-ad-creation.png";
import showcaseLandingPages from "@/assets/images/showcase-landing-pages.png";
import showcaseCrm from "@/assets/images/showcase-crm.png";
import showcaseScheduler from "@/assets/images/showcase-scheduler.png";
import showcasePremiumMedias from "@/assets/images/showcase-premium-medias.png";

export default function InicioES() {
  const [isYearly, setIsYearly] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);
  const [activeToolTab, setActiveToolTab] = useState<string>("featured");

  useEffect(() => {
    document.documentElement.lang = "es";
    const sticky = document.querySelector('.mobile-sticky');
    const planos = document.getElementById('planos');
    if (!sticky) return;
    
    const handleScroll = () => {
      const isPlanosVisible = planos ? planos.getBoundingClientRect().top < window.innerHeight : false;

      if (!isPlanosVisible) {
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
      question: "¿Necesito tener conocimientos en diseño?",
      answer: "No. La plataforma fue creada para facilitar la rutina de quienes no quieren depender de un diseñador. Tú eliges el modelo, ajustas el destino y publicas."
    },
    {
      question: "¿Funciona en el celular?",
      answer: "Sí. Puedes acceder desde el celular. Para ediciones más detalladas, la computadora puede ser más cómoda."
    },
    {
      question: "¿Y si no me gusta?",
      answer: "Tienes 7 días para probar. Si no tiene sentido para tu agencia, solicita el reembolso dentro del plazo de garantía."
    },
    {
      question: "Ya tengo Canva Pro. ¿Necesito esto?",
      answer: "Canva Pro es una herramienta de diseño genérica. Nuestra plataforma entrega plantillas, copys, ideas, páginas, CRM y recursos pensados específicamente para el turismo."
    },
    {
      question: "¿El contenido se verá igual al de la competencia?",
      answer: "No tiene por qué. Las plantillas son editables: puedes cambiar el destino, texto, precio, fotos, colores y la identidad de tu agencia."
    },
    {
      question: "¿Puedo usarlo para más de una agencia?",
      answer: "Los planes son individuales por marca. Cada agencia necesita su propio plan. Si gestionas más de una, contacta al soporte para evaluar la mejor opción."
    },
    {
      question: "¿Cómo recibo el acceso?",
      answer: "Tras el pago, el acceso se envía por correo en pocos minutos."
    },
    {
      question: "¿Tienen soporte?",
      answer: "Sí. El soporte está garantizado y es prioritario vía WhatsApp para los suscriptores."
    },
    {
      question: "¿Puedo cancelar cuando quiera?",
      answer: "Sí. No hay compromiso de permanencia. Cancela cuando quieras desde el panel o a través del soporte."
    },
    {
      question: "¿Qué incluye la suscripción?",
      answer: "Artes ilimitadas, sitios express, CRM de leads, recursos de IA y soporte prioritario vía WhatsApp."
    }
  ];

  return (
    <div className="inicio-page">
      <header className="site-header">
        <div className="header-inner">
          <img src={logoImage} alt="TravelMarketing Logo" className="logo" />
          <a href="#planos" className="header-cta">Ver Planes</a>
        </div>
      </header>

      <main>
        <section id="hero" className="hero">
          <div className="inicio-container hero-inner">
            <div className="hero-copy">
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '100px', padding: '6px 16px 6px 6px', marginBottom: '24px' }}>
                <div style={{ display: 'flex', marginLeft: '4px' }}>
                  <img src="https://i.pravatar.cc/100?img=12" alt="User" style={{ width: '28px', height: '28px', borderRadius: '50%', border: '2px solid #0F172A', marginLeft: '-4px', position: 'relative', zIndex: 4 }} />
                  <img src="https://i.pravatar.cc/100?img=32" alt="User" style={{ width: '28px', height: '28px', borderRadius: '50%', border: '2px solid #0F172A', marginLeft: '-10px', position: 'relative', zIndex: 3 }} />
                  <img src="https://i.pravatar.cc/100?img=45" alt="User" style={{ width: '28px', height: '28px', borderRadius: '50%', border: '2px solid #0F172A', marginLeft: '-10px', position: 'relative', zIndex: 2 }} />
                  <img src="https://i.pravatar.cc/100?img=5" alt="User" style={{ width: '28px', height: '28px', borderRadius: '50%', border: '2px solid #0F172A', marginLeft: '-10px', position: 'relative', zIndex: 1 }} />
                </div>
                <span style={{ fontSize: '13px', fontWeight: '500', color: 'rgba(255,255,255,0.9)' }}>+500 agencias aprueban</span>
              </div>

              <h1>Tú solo te enfocas en vender viajes. TravelMarketing se encarga del resto.</h1>
              <p>¡Sitio web completo, CRM para organizar clientes, creador automático de anuncios y +400 recursos de viajes! Todo en piloto automático en un solo ecosistema para atraer viajeros de alto nivel y cerrar paquetes todos los días.</p>
              
              <ul className="hero-bullets">
                <li>400+ recursos listos para turismo</li>
                <li>Anuncios y textos creados con IA</li>
                <li>Sitios y páginas para paquetes</li>
                <li>CRM para organizar leads</li>
                <li>Acceso inmediato y garantía de 7 días</li>
              </ul>
              
              <a href="#planos" className="btn btn-white">Suscribirse Ahora →</a>
              <br />
              <a href="#demo" className="hero-secondary">Ver la plataforma por dentro ↓</a>
              
              <div className="hero-proof">
                <span>Pago seguro vía Stripe</span>
              </div>
            </div>
            <div className="w-full max-w-[500px] md:max-w-[650px] mx-auto mt-8 md:mt-0 flex justify-center md:justify-end px-4 sm:px-0">
                <div className="aspect-video w-full rounded-2xl overflow-hidden shadow-2xl border border-white/10">
                  <iframe
                    src="https://www.youtube.com/embed/1Or9QJPn6OA"
                    title="Cómo Usar la Plataforma - Videoclase"
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                  />
                </div>
            </div>
          </div>
        </section>

        <section id="demo" className="demo inicio-section">
          <div className="inicio-container">
            <h2 className="section-title">Dashboard inteligente para quienes venden viajes</h2>
            <p className="section-subtitle">Todo lo que tu agencia necesita en una sola pantalla, fácil de usar y directo al grano.</p>
            
            <div className="w-full max-w-[800px] mx-auto mt-8 sm:mt-10 rounded-[16px] sm:rounded-[22px] overflow-hidden border border-black/5 shadow-[0_20px_40px_rgba(0,0,0,0.08)]">
              <img src={heroDashboard} alt="Dashboard de la plataforma" className="w-full block" />
            </div>
            <p className="mt-4 sm:mt-6 text-center text-[12px] sm:text-[14px] text-slate-500 px-4">
              Visión general del panel. Ejemplo representativo.
            </p>

            <div className="steps-grid">
              <div className="step-card">
                <div className="step-number">1</div>
                <h3>Escribe el destino</h3>
                <p>Ejemplo: "Paquete a Maldivas 7 días para parejas."</p>
              </div>
              <div className="step-card">
                <div className="step-number">2</div>
                <h3>La IA crea</h3>
                <p>Genera anuncios, descripciones, páginas, imágenes y estrategias.</p>
              </div>
              <div className="step-card">
                <div className="step-number">3</div>
                <h3>Publica y vende</h3>
                <p>Úsalo en Instagram, WhatsApp, página de ventas o CRM.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="proof-mini">
          <div className="inicio-container">
            <h2 className="section-title" style={{ fontSize: "28px" }}>Antes de suscribirte, mira a qué tendrás acceso</h2>
            <p className="section-subtitle">Un vistazo rápido a los módulos principales de la plataforma.</p>
            
            <div className="proof-mini-grid">
              <div className="proof-mini-card">
                <h3>Dashboard</h3>
                <p>Todas las herramientas en un solo lugar.</p>
              </div>
              <div className="proof-mini-card">
                <h3>IA de Anuncios</h3>
                <p>Escribe el destino y genera ideas, textos y campañas.</p>
              </div>
              <div className="proof-mini-card">
                <h3>Sitios Express</h3>
                <p>Crea páginas para presentar paquetes y rutas.</p>
              </div>
              <div className="proof-mini-card">
                <h3>CRM de Leads</h3>
                <p>Organiza contactos, cotizaciones y oportunidades.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="testimonials inicio-section" style={{ backgroundColor: '#050D1A' }}>
          <div className="inicio-container">
            <p style={{ textAlign: "center", fontSize: 11, color: "#00E5FF", letterSpacing: 2, fontWeight: 800, marginBottom: 12, textTransform: "uppercase" }}>
              PRUEBA REAL INDISCUTIBLE
            </p>
            <h2 className="section-title" style={{ color: '#fff', marginBottom: '40px' }}>Resultados directos en el WhatsApp de quienes lo usan</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 items-start mt-8 sm:mt-12 px-4 sm:px-0">
              <div className="rounded-[16px] overflow-hidden border border-white/10 shadow-lg h-[400px] relative bg-[#121212]">
                <img src={depoimento1} alt="Resultado en WhatsApp" className="w-full absolute -top-[48px] block" />
              </div>
              <div className="rounded-[16px] overflow-hidden border border-white/10 shadow-lg h-[400px] relative bg-[#121212]">
                <img src={depoimento2} alt="Resultado en WhatsApp" className="w-full absolute -top-[48px] block" />
              </div>
              <div className="rounded-[16px] overflow-hidden border border-white/10 shadow-lg h-[400px] relative bg-[#121212]">
                <img src={depoimento3} alt="Resultado en WhatsApp" className="w-full absolute -top-[48px] block" />
              </div>
            </div>
            <p className="testimonials-note" style={{ color: 'rgba(255,255,255,0.5)', marginTop: '32px', textAlign: 'center', fontSize: '13px' }}>Testimonios reales. Los resultados varían según la oferta, la atención, la audiencia y la difusión.</p>
          </div>
        </section>

        <section className="how-it-works inicio-section">
          <div className="inicio-container">
            <h2 className="section-title" style={{ color: '#F8FAFC' }}>Mira cómo funciona en la práctica</h2>
            <p className="section-subtitle" style={{ color: '#94A3B8' }}>Una demostración rápida de cómo transformar una idea en contenido, página y organización comercial.</p>
            <div className="hiw-grid">
              <div className="hiw-card" style={{ padding: '20px 16px' }}>
                <div className="hiw-number">1</div>
                <h3>Campaña creada</h3>
                <p>Escribe el destino y genera textos, ideas y llamadas a la acción.</p>
              </div>
              <div className="hiw-card" style={{ padding: '20px 16px' }}>
                <div className="hiw-number">2</div>
                <h3>Página lista</h3>
                <p>Arma una página sencilla para presentar el paquete y enviarla por WhatsApp.</p>
              </div>
              <div className="hiw-card" style={{ padding: '20px 16px' }}>
                <div className="hiw-number">3</div>
                <h3>Lead organizado</h3>
                <p>Registra contactos, cotizaciones y oportunidades en el CRM integrado.</p>
              </div>
            </div>
          </div>
        </section>

        <section id="before-after" className="before-after inicio-section">
          <div className="inicio-container">
            <div className="w-full flex flex-col items-center justify-center text-center mx-auto mb-12">
              <h2 className="section-title w-full text-center" style={{ textAlign: 'center' }}>Basta de perder tiempo diseñando</h2>
              <p className="section-subtitle w-full text-center" style={{ textAlign: 'center', margin: '0 auto' }}>Tu agencia merece un aspecto profesional sin pagar caro ni pasar horas arrastrando elementos.</p>
            </div>
            
            <div className="ba-grid">
              <div className="ba-card">
                <div className="ba-label danger">La forma antigua</div>
                <div className="ba-image">
                  <img src={antesAmador} alt="Diseño amateur" />
                </div>
                <ul className="ba-list">
                  <li className="bad">Horas arrastando elementos</li>
                  <li className="bad">Diseño recargado y amateur</li>
                  <li className="bad">Textos sin estrategia</li>
                  <li className="bad">Baja percepción de confianza</li>
                </ul>
              </div>
              
              <div className="ba-card is-after">
                <div className="ba-label success">Con TravelMarketing</div>
                <div className="ba-image">
                  <img src={depoisPremium} alt="Diseño premium" />
                </div>
                <ul className="ba-list">
                  <li className="good">Post listo en segundos</li>
                  <li className="good">Aspecto premium y limpio</li>
                  <li className="good">Texto enfocado en la conversión</li>
                  <li className="good">Más confianza para vender paquetes</li>
                </ul>
              </div>
            </div>
            
            <div className="w-full flex justify-center mt-12 mb-4">
              <p className="ba-final-line text-center mx-auto" style={{ textAlign: 'center' }}>La diferencia entre amateur y profesional no está solo en el diseño. Está en la confianza que transmite tu oferta.</p>
            </div>
          </div>
        </section>

        <section id="perception" className="perception inicio-section">
          <div className="inicio-container">
            <h2 className="section-title">Lo que el cliente percibe antes de pedir cotización</h2>
            <p className="section-subtitle">La percepción visual va primero. Si tu agencia parece improvisada, el cliente ya llega con desconfianza.</p>
            
            <div className="perception-grid">
              <div className="perception-card">
                <div className="perception-label before">Diseño Amateur</div>
                <ul className="perception-list">
                  <li className="perception-item bad">"Parece improvisado"</li>
                  <li className="perception-item bad">"Voy a pedir descuento"</li>
                  <li className="perception-item bad">"No sé si confío"</li>
                </ul>
              </div>
              <div className="perception-card">
                <div className="perception-label after">Diseño Premium</div>
                <ul className="perception-list">
                  <li className="perception-item good">"Se ve profesional"</li>
                  <li className="perception-item good">"Transmite confianza"</li>
                  <li className="perception-item good">"Vale la pena cotizar"</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section id="authority" className="authority inicio-section">
          <div className="inicio-container">
            <div className="authority-card">
              <img src={lucasPortrait} alt="Lucas Ferrari" className="authority-photo" />
              <div>
                <h2>Creado por quienes viven el turismo</h2>
                <p className="authority-text">TravelMarketing fue creado por Lucas Ferrari, especialista en marketing para agencias, receptivos y profesionales del turismo. La plataforma nació para ayudar a las agencias a crear contenido, páginas y campañas con más velocidad, sin depender de diseñadores, social media o agencias costosas.</p>
                <div className="grid grid-cols-3 gap-2 md:gap-4 mt-6 max-w-[600px] mx-auto md:mx-0">
                  <div className="bg-white border border-slate-200 rounded-xl p-2 sm:p-4 shadow-sm text-center">
                    <div className="text-[18px] sm:text-[32px] font-black text-[#7C3AED] leading-none mb-1 md:mb-2">10+</div>
                    <div className="text-[10px] sm:text-[14px] font-medium text-slate-600 leading-tight">Años en turismo</div>
                  </div>
                  <div className="bg-white border border-slate-200 rounded-xl p-2 sm:p-4 shadow-sm text-center">
                    <div className="text-[18px] sm:text-[32px] font-black text-[#7C3AED] leading-none mb-1 md:mb-2">100%</div>
                    <div className="text-[10px] sm:text-[14px] font-medium text-slate-600 leading-tight">Enfocado en agencias</div>
                  </div>
                  <div className="bg-white border border-slate-200 rounded-xl p-2 sm:p-4 shadow-sm text-center">
                    <div className="text-[16px] sm:text-[24px] font-black text-[#7C3AED] leading-none mb-1 mt-0.5 sm:mt-1 md:mb-2">Soporte</div>
                    <div className="text-[10px] sm:text-[14px] font-medium text-slate-600 leading-tight">Comunidad VIP</div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-3 mt-6 max-w-[400px] mx-auto md:mx-0">
                  <a href="#" className="flex items-center justify-center gap-2 h-12 bg-white border border-slate-200 rounded-xl font-bold text-[13px] sm:text-[15px] text-slate-900 shadow-sm transition-colors hover:bg-slate-50">
                    <Instagram size={18} color="#E1306C" /> Instagram
                  </a>
                  <a href="#" className="flex items-center justify-center gap-2 h-12 bg-white border border-slate-200 rounded-xl font-bold text-[13px] sm:text-[15px] text-slate-900 shadow-sm transition-colors hover:bg-slate-50">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#25D366" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
                    WhatsApp
                  </a>
                  <a href="#demo" className="col-span-2 flex items-center justify-center h-12 bg-[#7C3AED] text-white rounded-xl font-bold text-[14px] sm:text-[16px] shadow-md hover:bg-[#6D28D9] transition-colors">
                    Ver demostración
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="features inicio-section">
          <div className="inicio-container">
            <div className="w-full flex flex-col items-center justify-center text-center mx-auto">
              <h2 className="section-title w-full text-center" style={{ textAlign: 'center' }}>Todo lo que tu agencia necesita en un solo lugar</h2>
              <p className="section-subtitle w-full text-center" style={{ textAlign: 'center', margin: '0 auto 32px' }}>Una plataforma para crear contenido, promocionar paquetes, armar páginas y organizar leads sin depender de varias herramientas.</p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-6 mt-8 md:mt-12 w-full max-w-[1000px] mx-auto px-4 sm:px-0">
              <div className="bg-[#1e293b] border border-white/5 rounded-2xl p-4 sm:p-6 text-left hover:bg-[#1e293b]/80 transition-colors">
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-[#06B6D4]/10 text-[#06B6D4] flex items-center justify-center mb-3 md:mb-4"><Instagram size={20} className="md:w-[24px] md:h-[24px]" /></div>
                <h3 className="text-white font-bold text-[14px] sm:text-[18px] mb-1 md:mb-2">Posts y Carruseles</h3>
                <p className="text-white/60 text-[12px] sm:text-[15px] leading-snug">Formatos listos para promocionar destinos y paquetes.</p>
              </div>
              <div className="bg-[#1e293b] border border-white/5 rounded-2xl p-4 sm:p-6 text-left hover:bg-[#1e293b]/80 transition-colors">
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-[#06B6D4]/10 text-[#06B6D4] flex items-center justify-center mb-3 md:mb-4"><Video size={20} className="md:w-[24px] md:h-[24px]" /></div>
                <h3 className="text-white font-bold text-[14px] sm:text-[18px] mb-1 md:mb-2">Videos Cortos</h3>
                <p className="text-white/60 text-[12px] sm:text-[15px] leading-snug">Guiones y plantillas para Reels y Stories.</p>
              </div>
              <div className="bg-[#1e293b] border border-white/5 rounded-2xl p-4 sm:p-6 text-left hover:bg-[#1e293b]/80 transition-colors">
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-[#06B6D4]/10 text-[#06B6D4] flex items-center justify-center mb-3 md:mb-4"><BookOpen size={20} className="md:w-[24px] md:h-[24px]" /></div>
                <h3 className="text-white font-bold text-[14px] sm:text-[18px] mb-1 md:mb-2">Textos con IA</h3>
                <p className="text-white/60 text-[12px] sm:text-[15px] leading-snug">Descripciones creadas para vender paquetes con claridad.</p>
              </div>
              <div className="bg-[#1e293b] border border-white/5 rounded-2xl p-4 sm:p-6 text-left hover:bg-[#1e293b]/80 transition-colors">
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-[#06B6D4]/10 text-[#06B6D4] flex items-center justify-center mb-3 md:mb-4"><LayoutDashboard size={20} className="md:w-[24px] md:h-[24px]" /></div>
                <h3 className="text-white font-bold text-[14px] sm:text-[18px] mb-1 md:mb-2">Sitios Express</h3>
                <p className="text-white/60 text-[12px] sm:text-[15px] leading-snug">Páginas de ventas para paquetes listas para enviar.</p>
              </div>
              <div className="bg-[#1e293b] border border-white/5 rounded-2xl p-4 sm:p-6 text-left hover:bg-[#1e293b]/80 transition-colors">
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-[#06B6D4]/10 text-[#06B6D4] flex items-center justify-center mb-3 md:mb-4"><Calendar size={20} className="md:w-[24px] md:h-[24px]" /></div>
                <h3 className="text-white font-bold text-[14px] sm:text-[18px] mb-1 md:mb-2">CRM Integrado</h3>
                <p className="text-white/60 text-[12px] sm:text-[15px] leading-snug">Organiza leads, cotizaciones y contactos.</p>
              </div>
              <div className="bg-[#1e293b] border border-white/5 rounded-2xl p-4 sm:p-6 text-left hover:bg-[#1e293b]/80 transition-colors">
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-[#06B6D4]/10 text-[#06B6D4] flex items-center justify-center mb-3 md:mb-4"><Clock size={20} className="md:w-[24px] md:h-[24px]" /></div>
                <h3 className="text-white font-bold text-[14px] sm:text-[18px] mb-1 md:mb-2">Automatización</h3>
                <p className="text-white/60 text-[12px] sm:text-[15px] leading-snug">Recursos para acelerar tu rutina de contenido.</p>
              </div>
            </div>
            
            <div className="features-cta w-full flex justify-center mt-10">
              <a href="#planos" className="btn btn-primary">Empezar a usar ahora</a>
            </div>
          </div>
        </section>

        {/* 10. PLANOS / PRICING */}
        <section id="planos" className="pricing inicio-section">
          <div className="inicio-container">
            <div className="w-full flex flex-col items-center justify-center text-center mx-auto">
              <h2 className="section-title w-full text-center" style={{ textAlign: 'center' }}>Elige el plan ideal para tu agencia</h2>
              <p className="section-subtitle w-full text-center" style={{ textAlign: 'center', margin: '0 auto 32px' }}>Comienza en el plan mensual sin compromiso o ahorra más en el plan anual.</p>
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
                <span>Días</span>
              </div>
              <div>
                <h2>Garantía Incondicional de Resultados</h2>
                <p style={{ marginTop: "14px", fontSize: "15.5px", lineHeight: "1.6" }}>
                  El riesgo es 100% mío, no tuyo. Suscríbete hoy. Usa nuestra IA, descarga los creativos premium y publícalos en tus redes. Si no crees que la imagen de tu agencia subió de nivel, presiona un botón en el panel y te devolvemos el 100% de tu dinero. Sin preguntas. Reembolso automático garantizado por Hotmart.
                </p>
                <ul className="guarantee-list">
                  <li><CheckCircle2 size={16} color="#22C55E" style={{ flexShrink: 0 }} /> Prueba en la práctica por 7 días</li>
                  <li><CheckCircle2 size={16} color="#22C55E" style={{ flexShrink: 0 }} /> Acceso inmediato tras el pago</li>
                  <li><CheckCircle2 size={16} color="#22C55E" style={{ flexShrink: 0 }} /> Reembolso con un clic (Garantía Hotmart)</li>
                </ul>
                <a href="#" className="refund-link" style={{ marginTop: "24px" }}>Ver política de reembolso</a>
              </div>
            </div>
          </div>
        </section>

        {/* 12. FAQ */}
        <section className="faq inicio-section">
          <div className="inicio-container">
            <h2 className="section-title">Preguntas Frecuentes</h2>
            
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
            <h2>¿Listo para profesionalizar tu agencia en minutos?</h2>
            <p>Únete a los agentes de viajes que usan tecnología, IA y diseño para crear contenido más rápido.</p>
            <a href="#planos" className="btn btn-primary" style={{ background: "#06B6D4", boxShadow: "0 14px 34px rgba(6, 182, 212, 0.26)" }}>Adquirir Plataforma Ahora</a>
            <div className="final-microcopy">Acceso inmediato • Pago seguro • Garantía de 7 días</div>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="inicio-container site-footer-inner">
          <div>
            <img src={logoImage} alt="TravelMarketing Logo" className="footer-logo" />
            <div className="footer-text">© 2026 TravelMarketing. Todos los derechos reservados.</div>
            <div className="footer-contact">
              <a href="mailto:soporte@travelmarketing.com" className="footer-contact-link">soporte@travelmarketing.com</a>
              <a href="https://wa.me/5500000000000" target="_blank" rel="noopener noreferrer" className="footer-contact-link footer-whatsapp">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
                WhatsApp Soporte
              </a>
            </div>
          </div>
          
          <div className="footer-links">
            <a href="#">Términos de Uso</a>
            <a href="#">Política de Privacidad</a>
            <a href="#">Política de Reembolso</a>
            <a href="#">Contacto</a>
          </div>
        </div>
        <div className="inicio-container">
           <div className="payment-safe">
             <ShieldCheck size={16} /> Pago seguro vía Stripe
           </div>
        </div>
      </footer>

      <div className="mobile-sticky">
        <div className="sticky-info">
          <span>Plan Anual</span>
          <span>12x $ 5<small>,58</small></span>
        </div>
        <a href="#planos" className="sticky-btn">Ver Planes <Check size={16} /></a>
      </div>

    </div>
  );
}
