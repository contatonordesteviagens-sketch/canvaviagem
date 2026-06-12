import { useState, useEffect } from "react";
import { 
  MessageSquare, Play, Check, ShieldCheck, Instagram, LayoutDashboard, Calendar, Video, BookOpen, Clock, ChevronDown, CheckCircle2, Map, Users, Image as ImageIcon, MonitorSmartphone, Star 
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
import { PricingAccordionES } from "@/components/PricingAccordionES";

import showcaseAdCreation from "@/assets/images/showcase-ad-creation.png";
import showcaseLandingPages from "@/assets/images/showcase-landing-pages.png";
import showcaseCrm from "@/assets/images/showcase-crm.png";
import showcaseScheduler from "@/assets/images/showcase-scheduler.png";
import showcasePremiumMedias from "@/assets/images/showcase-premium-medias.png";

export default function InicioES() {
  const [activeToolTab, setActiveToolTab] = useState<string>("featured");
  const [heroMutedActive, setHeroMutedActive] = useState(true);

  useEffect(() => {
    document.documentElement.lang = "es";
    const sticky = document.querySelector('.mobile-sticky');
    const planos = document.getElementById('planos');
    if (!sticky) return;
    
    const handleScroll = () => {
      const isPlanosVisible = planos ? planos.getBoundingClientRect().top < window.innerHeight : false;
      const hasScrolledEnough = window.scrollY > 620;

      if (hasScrolledEnough && !isPlanosVisible) {
        sticky.classList.add('is-visible');
      } else {
        sticky.classList.remove('is-visible');
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const quickOutcomeCards = [
    {
      title: "Oferta lista para vender",
      copy: "Convierte destino, precio y condiciones en anuncio, texto de WhatsApp y página de paquete.",
      icon: <MessageSquare size={22} />
    },
    {
      title: "Apariencia profesional",
      copy: "Usa diseños, videos y páginas pensadas para turismo, sin empezar desde una pantalla en blanco.",
      icon: <Star size={22} />
    },
    {
      title: "Leads bajo control",
      copy: "Organiza contactos, cotizaciones y oportunidades para dar seguimiento antes de que se enfríen.",
      icon: <Users size={22} />
    }
  ];

  const platformProofScreens = [
    {
      image: dashboardInterno,
      title: "Panel real de la plataforma",
      result: "Ves las herramientas organizadas en un solo lugar para crear ofertas sin buscar recursos dispersos."
    },
    {
      image: paginaRoteiro,
      title: "Página de paquete lista para enviar",
      result: "Presentas ruta, beneficios y condiciones con más claridad antes de mandar el link por WhatsApp."
    },
    {
      image: crmLeads,
      title: "CRM para no perder interesados",
      result: "Registras leads, cotizaciones y oportunidades para hacer seguimiento con más control."
    }
  ];

  const includedResultCards = [
    ["IA para anuncios", "Genera textos, ganchos, CTA e ideas para destinos y promociones."],
    ["Contenidos listos", "Publica videos, posts, stories y diseños de turismo sin partir de cero."],
    ["Páginas de venta", "Envía paquetes con una presentación clara, visual y más confiable."],
    ["CRM de leads", "Acompaña interesados, cotizaciones y oportunidades después del primer contacto."],
    ["Materiales de apoyo", "Usa leyendas, itinerarios, textos de WhatsApp y recursos de campaña."],
    ["Soporte y garantía", "Acceso inmediato, ayuda por WhatsApp y 7 días para probar sin riesgo."]
  ];

  const trustProofMetrics = [
    ["7 días", "para probar con garantía"],
    ["12 meses", "de acceso en el plan anual"],
    ["US$350", "de ahorro frente a 12 meses pagando mensual"],
    ["1 lugar", "para IA, páginas, contenidos y CRM"]
  ];

  const trialPlanSteps = [
    ["Día 1", "entra, revisa los módulos y crea tu primera campaña para un destino real"],
    ["Día 2", "arma una página de paquete y prepara el texto para enviar por WhatsApp"],
    ["Día 3", "organiza interesados y cotizaciones para ver si el flujo sirve para tu agencia"]
  ];

  const socialProofChats = [
    {
      label: "Venta para Disney",
      messages: [
        { sender: "client", text: "Lucas, en menos de 24 horas tuve mi primera venta para Disney, con más de mil de comisión, usando los anuncios que enseñas." },
        { sender: "client", text: "Antes aparecían muchos curiosos, pero no lograba cerrar nada." },
        { sender: "client", text: "Usé la IA para armar el itinerario rápido, subí el anuncio y empezó a llegar gente al WhatsApp." },
        { sender: "lucas", text: "Buenísimo. Ahora lo principal es atender rápido y dar seguimiento." },
        { sender: "client", text: "Sí, voy a enfocarme en eso ahora." }
      ]
    },
    {
      label: "23 presupuestos",
      messages: [
        { sender: "client", text: "Lucas, quería contarte algo." },
        { sender: "client", text: "Usé ese modelo de anuncio para la promoción de vacaciones y funcionó aquí en mi ciudad." },
        { sender: "client", text: "Con poca inversión apareció mucha gente interesada." },
        { sender: "client", text: "Hice 23 presupuestos solo ayer y cerré 5 paquetes." },
        { sender: "client", text: "Para mí fue un resultado que nunca había tenido antes." }
      ]
    },
    {
      label: "Meta del mes",
      messages: [
        { sender: "client", text: "Este mes ya salieron varias ventas. Hasta aumenté la meta del mes." },
        { sender: "client", text: "Estoy demasiado feliz, gracias." },
        { sender: "lucas", text: "Me alegra mucho leer eso. Sigue publicando, atendiendo rápido y midiendo lo que funciona." },
        { sender: "client", text: "Lo voy a hacer. Ahora quiero grabar algunos videos para probar también." }
      ]
    },
    {
      label: "Oferta más profesional",
      messages: [
        { sender: "client", text: "Antes mandaba el paquete solo por texto en WhatsApp y la gente pedía descuento enseguida." },
        { sender: "client", text: "Ahora mandé la página con el itinerario más organizado y la conversación cambió." },
        { sender: "client", text: "El cliente entendió mejor el valor antes de preguntar el precio final." },
        { sender: "lucas", text: "Eso es exactamente lo que buscamos: mejorar la percepción antes de la cotización." }
      ]
    },
    {
      label: "Contenido más rápido",
      messages: [
        { sender: "client", text: "Hoy logré preparar anuncio, texto para Instagram y mensaje de seguimiento mucho más rápido." },
        { sender: "client", text: "No me quedé bloqueada mirando una pantalla en blanco." },
        { sender: "client", text: "Para una agencia pequeña eso ya cambia mucho la rutina." },
        { sender: "lucas", text: "Perfecto. La idea es que el contenido no sea el cuello de botella de la venta." }
      ]
    },
    {
      label: "Leads organizados",
      messages: [
        { sender: "client", text: "El CRM me ayudó a ver quién pidió cotización y quién todavía necesitaba seguimiento." },
        { sender: "client", text: "Antes se me perdían conversaciones en WhatsApp." },
        { sender: "client", text: "Ahora tengo más claridad de a quién responder primero." },
        { sender: "lucas", text: "Ese control evita que oportunidades calientes se enfríen por falta de seguimiento." }
      ]
    }
  ];

  const supportWhatsAppUrl = "https://wa.me/5585998458995?text=Hola%2C%20necesito%20soporte%20sobre%20TravelMarketing";
  const instagramUrl = "https://www.instagram.com/lucasferrari.pro/";

  return (
    <div className="inicio-page">
      <header className="site-header">
        <div className="header-inner">
          <img src={logoImage} alt="TravelMarketing Logo" className="logo" />
          <a href="#planos" className="header-cta">Ver Planes</a>
        </div>
      </header>

      <main>
        <section id="hero" className="relative bg-[#0F172A] overflow-hidden pt-20 pb-14 md:pt-24 md:pb-16 lg:pt-32 lg:pb-20">
          {/* Premium Background Effects */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-purple-600/20 rounded-full blur-[120px] -z-10"></div>
          
          <div className="inicio-container relative z-10 flex flex-col items-center text-center max-w-4xl mx-auto">
            
            {/* Trust Badge */}
            <div className="flex flex-col items-center gap-4 mb-6 md:mb-8">
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-900/50 to-blue-900/50 border border-purple-500/30 rounded-full px-5 py-2 backdrop-blur-md shadow-[0_0_20px_rgba(124,58,237,0.2)]">
                <span className="md:hidden text-xs font-bold text-purple-200 uppercase tracking-wide">Para agencias que venden por WhatsApp e Instagram</span>
                <span className="hidden md:inline text-sm font-bold text-purple-200 uppercase tracking-wide">Para agencias y asesores de viaje que venden por WhatsApp e Instagram</span>
              </div>
            </div>

            {/* Headlines */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white leading-[1.1] mb-4 md:mb-6 tracking-tight">
              <span className="md:hidden">Transforma paquetes en ofertas listas para vender</span>
              <span className="hidden md:inline">Transforma cada paquete de viaje en una oferta lista para vender en minutos</span>
            </h1>
            
            <p className="text-lg md:text-xl text-slate-300 font-medium mb-3 md:mb-4 max-w-3xl mx-auto leading-relaxed">
              <span className="md:hidden">IA, páginas, contenidos listos y CRM para vender viajes con más confianza.</span>
              <span className="hidden md:inline">TravelMarketing reúne IA, páginas de paquetes, contenidos listos y CRM para que tu agencia publique campañas, responda por WhatsApp y organice cotizaciones sin depender de diseñador ni de varias herramientas separadas.</span>
            </p>

            <div className="bg-red-500/10 border border-red-500/20 px-5 md:px-6 py-3 rounded-xl mb-6 md:mb-10">
              <p className="text-red-300 font-medium md:text-lg">
                <span className="md:hidden">Si tu oferta parece improvisada, el cliente duda. TravelMarketing la convierte en una presentación más confiable.</span>
                <span className="hidden md:inline">Si tu paquete parece improvisado, el cliente duda antes de pedir cotización. La plataforma existe para resolver ese momento.</span>
              </p>
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center gap-3 md:gap-4 mb-7 md:mb-6 w-full sm:w-auto">
              <a href="#planos" className="btn btn-primary text-base md:text-lg py-4 px-8 w-full sm:w-auto shadow-[0_0_30px_rgba(124,58,237,0.5)] hover:shadow-[0_0_50px_rgba(124,58,237,0.7)] hover:-translate-y-1 transition-all flex items-center justify-center gap-2">
                Probar 7 días con garantía
              </a>
              <a href="#video-prova" className="w-full sm:w-auto bg-white/10 hover:bg-white/20 text-white border border-white/20 py-3.5 md:py-4 px-5 md:px-8 rounded-2xl font-bold transition-colors flex items-center justify-center gap-2 text-sm md:text-base">
                <Play size={20} fill="currentColor" /> Ver Lucas usando la herramienta
              </a>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 md:gap-3 w-full mb-6 md:mb-10">
              {["Demo real antes del pago", "+66 mil seguidores", "Precio y garantía visibles", "Soporte por WhatsApp"].map((item) => (
                <div key={item} className="bg-white/5 border border-white/10 rounded-xl px-3 md:px-4 py-3 text-[12px] md:text-sm font-bold text-slate-200 flex items-center justify-center gap-2 leading-tight min-h-[58px]">
                  <ShieldCheck size={16} className="text-green-400 shrink-0" />
                  {item}
                </div>
              ))}
            </div>

            {/* Mini-selos visuais */}
            <div className="hidden sm:flex flex-wrap justify-center gap-4 md:gap-8 mb-10">
              <div className="flex items-center gap-2 text-slate-300 font-semibold"><CheckCircle2 className="text-purple-400" size={18} /> No es un pack genérico</div>
              <div className="flex items-center gap-2 text-slate-300 font-semibold"><CheckCircle2 className="text-purple-400" size={18} /> Plataforma SaaS para turismo</div>
              <div className="flex items-center gap-2 text-slate-300 font-semibold"><CheckCircle2 className="text-purple-400" size={18} /> Creador con audiencia pública</div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 text-sm font-medium text-slate-400">
              <div className="flex items-center gap-1.5"><ShieldCheck size={16} className="text-green-400"/> Acceso inmediato</div>
              <span className="opacity-50 hidden sm:block">•</span>
              <div className="flex items-center gap-1.5">Pago seguro en USD</div>
              <span className="opacity-50 hidden sm:block">•</span>
              <div className="flex items-center gap-1.5">Garantía de 7 días</div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-10 w-full">
              {quickOutcomeCards.map((item) => (
                <div key={item.title} className="bg-white/5 border border-white/10 rounded-2xl p-5 text-left">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/15 text-purple-300 flex items-center justify-center mb-4">
                    {item.icon}
                  </div>
                  <h3 className="text-white text-lg font-black mb-2">{item.title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">{item.copy}</p>
                </div>
              ))}
            </div>

          </div>
        </section>

        {/* 2. ¿Qué es exactamente TravelMarketing? */}
        <section className="inicio-section bg-white py-20 border-b border-slate-200">
          <div className="inicio-container max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-6">¿Qué estás comprando exactamente?</h2>
              <p className="text-lg text-slate-600 font-medium max-w-3xl mx-auto">
                No es un curso, no es solo un pack de plantillas y no es una promesa abstracta de IA. Es una plataforma SaaS para agencias de viajes que reúne creación de campañas, páginas de paquetes, contenidos listos y CRM para transformar una idea de viaje en una oferta presentable.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 shadow-sm text-center">
                <div className="w-12 h-12 mx-auto bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center mb-4"><MonitorSmartphone size={24} /></div>
                <h3 className="font-bold text-slate-900 mb-2">De paquete a campaña</h3>
                <p className="text-sm text-slate-600">Escribe destino, precio y condiciones; la IA ayuda a convertirlo en anuncio, copy y mensaje comercial.</p>
              </div>
              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 shadow-sm text-center">
                <div className="w-12 h-12 mx-auto bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mb-4"><ImageIcon size={24} /></div>
                <h3 className="font-bold text-slate-900 mb-2">Contenido de turismo</h3>
                <p className="text-sm text-slate-600">Videos, diseños, posts, stories, leyendas e ideas pensadas para agencias, no para negocios genéricos.</p>
              </div>
              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 shadow-sm text-center">
                <div className="w-12 h-12 mx-auto bg-green-100 text-green-600 rounded-xl flex items-center justify-center mb-4"><LayoutDashboard size={24} /></div>
                <h3 className="font-bold text-slate-900 mb-2">Páginas para cotizar</h3>
                <p className="text-sm text-slate-600">Presenta itinerario, beneficios y detalles con más valor antes de mandar todo por WhatsApp.</p>
              </div>
              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 shadow-sm text-center">
                <div className="w-12 h-12 mx-auto bg-orange-100 text-orange-600 rounded-xl flex items-center justify-center mb-4"><Users size={24} /></div>
                <h3 className="font-bold text-slate-900 mb-2">Seguimiento de leads</h3>
                <p className="text-sm text-slate-600">Organiza interesados, cotizaciones y oportunidades para no depender solo de memoria o chats perdidos.</p>
              </div>
            </div>

            <div className="mt-12 bg-slate-900 text-white rounded-3xl p-6 md:p-8 grid grid-cols-1 md:grid-cols-3 gap-5 border border-slate-800 shadow-xl">
              <div>
                <p className="text-purple-300 text-sm font-black uppercase tracking-wide mb-2">La diferencia</p>
                <h3 className="text-2xl font-black text-white">No vendes una plantilla. Presentas una oferta con contexto.</h3>
              </div>
              <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white/10 rounded-2xl p-4 border border-white/10">
                  <strong className="block text-white mb-1">Más rápido</strong>
                  <span className="text-sm text-slate-300">Lanzas campañas sin esperar diseñador.</span>
                </div>
                <div className="bg-white/10 rounded-2xl p-4 border border-white/10">
                  <strong className="block text-white mb-1">Más claro</strong>
                  <span className="text-sm text-slate-300">El cliente entiende paquete, valor y próximos pasos.</span>
                </div>
                <div className="bg-white/10 rounded-2xl p-4 border border-white/10">
                  <strong className="block text-white mb-1">Más organizado</strong>
                  <span className="text-sm text-slate-300">Los interesados no se pierden después del primer mensaje.</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 4. BLOCO DO PROBLEMA - MUP */}
        <section className="bg-slate-900 text-white py-20 border-b border-slate-800">
          <div className="inicio-container max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-5xl font-black text-white mb-6 leading-tight">
              El problema no es solo publicar. Es generar confianza antes de la cotización.
            </h2>
            <p className="text-xl text-red-300 font-medium mb-8">
              Cuando tu oferta parece improvisada, el cliente duda antes de hablar contigo.
            </p>
            <p className="text-lg text-slate-300 mb-10 leading-relaxed text-left md:text-center">
              En turismo, confianza vende. Si tus anuncios, posts, páginas o mensajes se ven poco profesionales, el cliente puede pensar que tu agencia es pequeña, improvisada o poco confiable. Y cuando eso pasa, pide descuento, demora en responder o compra con otra agencia.
            </p>
            
            <div className="bg-slate-800/50 p-8 rounded-3xl border border-slate-700 text-left mb-10">
              <ul className="space-y-4">
                <li className="flex items-start gap-3"><div className="mt-1 min-w-6 text-red-400">✕</div><span className="text-slate-300 font-medium">Ofertas con apariencia débil reducen confianza</span></li>
                <li className="flex items-start gap-3"><div className="mt-1 min-w-6 text-red-400">✕</div><span className="text-slate-300 font-medium">Textos genéricos no transmiten valor</span></li>
                <li className="flex items-start gap-3"><div className="mt-1 min-w-6 text-red-400">✕</div><span className="text-slate-300 font-medium">Posts improvisados hacen que el paquete parezca menos profesional</span></li>
                <li className="flex items-start gap-3"><div className="mt-1 min-w-6 text-red-400">✕</div><span className="text-slate-300 font-medium">Leads se enfrían cuando no reciben seguimiento</span></li>
                <li className="flex items-start gap-3"><div className="mt-1 min-w-6 text-red-400">✕</div><span className="text-slate-300 font-medium">Depender de diseñador retrasa promociones importantes</span></li>
              </ul>
            </div>
            
            <p className="text-xl font-bold text-yellow-400">
              La venta no empieza en la cotización. Empieza en la forma en que presentas tu oferta.
            </p>
          </div>
        </section>

        {/* 5. BLOCO DA SOLUÇÃO - MUS */}
        <section className="bg-white py-20 border-b border-slate-200">
          <div className="inicio-container max-w-5xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-black text-slate-900 mb-6">
                Presenta cada paquete con el Motor de Ofertas Profesionales con IA
              </h2>
              <p className="text-xl text-slate-600 font-medium">
                Crea más rápido, presenta mejor y organiza tus oportunidades en un solo lugar.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
              <div className="bg-purple-50 p-8 rounded-3xl border border-purple-100">
                <h3 className="text-xl font-bold text-purple-900 mb-3">Crea anuncios en minutos</h3>
                <p className="text-purple-700">Genera textos, ideas y llamadas a la acción para destinos, promociones y fechas especiales.</p>
              </div>
              <div className="bg-blue-50 p-8 rounded-3xl border border-blue-100">
                <h3 className="text-xl font-bold text-blue-900 mb-3">Presenta paquetes con más valor</h3>
                <p className="text-blue-700">Usa páginas y contenidos para mostrar la oferta con apariencia más profesional.</p>
              </div>
              <div className="bg-green-50 p-8 rounded-3xl border border-green-100">
                <h3 className="text-xl font-bold text-green-900 mb-3">Responde mejor por WhatsApp</h3>
                <p className="text-green-700">Crea mensajes y textos para cotizar, recuperar interesados y hacer seguimiento.</p>
              </div>
              <div className="bg-orange-50 p-8 rounded-3xl border border-orange-100">
                <h3 className="text-xl font-bold text-orange-900 mb-3">No pierdas leads</h3>
                <p className="text-orange-700">Organiza cotizaciones, contactos y oportunidades dentro del CRM.</p>
              </div>
            </div>
            
            <div className="text-center">
              <a href="#planos" className="btn btn-primary text-lg py-4 px-10 shadow-lg hover:-translate-y-1 transition-transform inline-block">
                Quiero usar el Motor de Ofertas
              </a>
            </div>
          </div>
        </section>

        {/* PROVA CENTRAL: VIDEO REAL */}
        <section id="video-prova" className="bg-slate-50 pt-20 pb-20 border-b border-slate-200">
          <div className="inicio-container">
            <div className="text-center max-w-3xl mx-auto mb-12">
              <p className="text-sm font-black uppercase tracking-[0.2em] text-purple-600 mb-3">Demo inmediata para lead frío</p>
              <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-6 leading-tight">
                Mira a Lucas usando la herramienta antes de decidir
              </h2>
              <p className="text-lg text-slate-600 font-medium">
                Este video muestra el flujo real: cómo la plataforma ayuda a crear contenidos, páginas, campañas y organizar leads. No necesitas comprar a ciegas ni imaginar cómo funciona por dentro.
              </p>
              <p className="text-[13px] text-slate-500 font-bold mt-3">
                Video de 2 min: así se crea una oferta completa, de principio a fin.
              </p>
            </div>

            {/* Video Container Premium */}
            <div className="max-w-[900px] mx-auto">
              <div className="relative rounded-2xl bg-[#1E293B] border border-slate-300 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.2)] overflow-hidden">
                {/* Mac Header */}
                <div className="h-10 bg-slate-100 flex items-center px-4 gap-2 border-b border-slate-200">
                  <div className="w-3 h-3 rounded-full bg-red-400"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                  <div className="w-3 h-3 rounded-full bg-green-400"></div>
                </div>
                {/* Video Area */}
                <div className="relative w-full bg-black" style={{ paddingTop: '56.25%' }}>
                  {heroMutedActive ? (
                    <>
                      <iframe 
                        className="absolute inset-0 w-full h-full border-0 pointer-events-none object-cover opacity-90"
                        src="https://www.youtube.com/embed/INkZn5pdPeM?autoplay=1&mute=1&controls=0&loop=1&playlist=INkZn5pdPeM&modestbranding=1&rel=0&iv_load_policy=3&showinfo=0"
                        allow="autoplay; encrypted-media"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10 flex flex-col justify-center items-center p-6 cursor-pointer" onClick={() => setHeroMutedActive(false)}>
                         <div className="flex flex-col items-center gap-4 bg-white/10 backdrop-blur-md border border-white/20 p-6 rounded-2xl hover:bg-white/20 transition-all shadow-2xl group transform hover:scale-105">
                            <div className="w-16 h-16 bg-white text-slate-900 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                              <Play size={32} className="ml-1" fill="currentColor" />
                            </div>
                            <span className="text-white font-bold tracking-wide text-lg">Haz clic para activar el sonido</span>
                         </div>
                      </div>
                    </>
                  ) : (
                    <iframe 
                      className="absolute inset-0 w-full h-full border-0 z-20"
                      src="https://www.youtube.com/embed/INkZn5pdPeM?autoplay=1&controls=1&modestbranding=1&rel=0"
                      allow="autoplay; encrypted-media"
                      allowFullScreen
                    />
                  )}
                </div>
              </div>

              {/* CTA Abaixo do Video */}
              <div className="mt-12 text-center">
                <a href="#planos" className="btn btn-primary text-lg py-4 px-10 shadow-lg hover:-translate-y-1 transition-transform inline-block">
                  Probar con garantía de 7 días
                </a>
              </div>
            </div>
          </div>
        </section>

        <section className="inicio-section bg-white border-b border-slate-200">
          <div className="inicio-container">
            <div className="text-center max-w-3xl mx-auto mb-12">
              <p className="text-sm font-black uppercase tracking-[0.2em] text-purple-600 mb-3">Prueba visual de la plataforma</p>
              <h2 className="text-3xl md:text-5xl font-black text-slate-900 mb-5">Lo que ves después de entrar no es teoría</h2>
              <p className="text-lg text-slate-600 font-medium">
                La página usa capturas reales del producto para que sepas exactamente qué tipo de herramienta, página y organización estás comprando.
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-10">
              {trustProofMetrics.map(([value, label]) => (
                <div key={value} className="bg-slate-900 text-white rounded-2xl p-4 text-center border border-slate-800">
                  <div className="text-2xl md:text-3xl font-black text-green-400 leading-none">{value}</div>
                  <p className="text-xs md:text-sm text-slate-300 mt-2 leading-snug">{label}</p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {platformProofScreens.map((item) => (
                <div key={item.title} className="bg-slate-50 border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
                  <div className="aspect-[4/3] bg-slate-200 overflow-hidden">
                    <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-black text-slate-900 mb-2">{item.title}</h3>
                    <p className="text-sm text-slate-600 leading-relaxed">{item.result}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-10 bg-green-50 border border-green-200 rounded-2xl p-5 md:p-6 flex flex-col md:flex-row items-start md:items-center gap-4 justify-between">
              <div>
                <h3 className="text-xl font-black text-green-950 mb-1">Compra con el producto visible, no con una promesa invisible.</h3>
                <p className="text-green-800">Puedes mirar la demo, revisar los módulos y probar durante 7 días antes de decidir si tiene sentido para tu agencia.</p>
              </div>
              <a href="#planos" className="btn btn-primary md:max-w-[260px]">Ver planes y garantía</a>
            </div>
          </div>
        </section>
<section className="inicio-section">
          <div className="inicio-container">
            <h2 className="section-title text-center">Tu agencia no pierde ventas solo por precio. También pierde cuando la oferta no transmite confianza.</h2>
            <p className="section-subtitle text-center">Antes de preguntar por formas de pago, el cliente ya evaluó si tu agencia parece seria. TravelMarketing ataca ese primer juicio: presentación, mensaje y seguimiento.</p>
            <div className="flex justify-center mt-8">
              <ul className="text-left flex flex-col gap-3" style={{ background: '#0F172A', padding: '32px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)', maxWidth: '600px', width: '100%' }}>
                <li className="flex items-start gap-3"><span className="text-red-500 font-bold mt-1">✕</span> <span className="text-white">Pierdes horas creando creativos y textos manualmente</span></li>
                <li className="flex items-start gap-3"><span className="text-red-500 font-bold mt-1">✕</span> <span className="text-white">Dependes de diseñador o social media para publicar</span></li>
                <li className="flex items-start gap-3"><span className="text-red-500 font-bold mt-1">✕</span> <span className="text-white">Tus ofertas no siempre parecen profesionales</span></li>
                <li className="flex items-start gap-3"><span className="text-red-500 font-bold mt-1">✕</span> <span className="text-white">Los leads llegan por WhatsApp y se pierden sin organización</span></li>
                <li className="flex items-start gap-3"><span className="text-red-500 font-bold mt-1">✕</span> <span className="text-white">Te cuesta crear campañas rápidas para fechas, destinos y promociones</span></li>
              </ul>
            </div>
          </div>
        </section>

        <section id="demo" className="demo inicio-section">
          <div className="inicio-container">
            <h2 className="section-title text-center">Mira la plataforma funcionando por dentro</h2>
            <p className="section-subtitle text-center">Mira cómo tu agencia puede crear anuncios, páginas, contenidos y organizar leads en pocos minutos usando la propia plataforma.</p>
            
            <div className="w-full max-w-[800px] mx-auto mt-8 sm:mt-10 rounded-[16px] sm:rounded-[22px] overflow-hidden border border-black/5 shadow-[0_20px_40px_rgba(0,0,0,0.08)]">
              <img src={heroDashboard} alt="Dashboard de la plataforma" className="w-full block" />
            </div>
            <p className="mt-4 sm:mt-6 text-center text-[12px] sm:text-[14px] text-slate-500 px-4">
              Visión general del panel. Ejemplo representativo.
            </p>

            <div className="steps-grid grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
              <div className="step-card text-center p-4">
                <div className="step-number mx-auto mb-2">1</div>
                <h3 className="font-bold text-sm">Escribe el destino o paquete</h3>
              </div>
              <div className="step-card text-center p-4">
                <div className="step-number mx-auto mb-2">2</div>
                <h3 className="font-bold text-sm">La IA genera textos, anuncios e ideas</h3>
              </div>
              <div className="step-card text-center p-4">
                <div className="step-number mx-auto mb-2">3</div>
                <h3 className="font-bold text-sm">Crea contenidos y páginas para presentar la oferta</h3>
              </div>
              <div className="step-card text-center p-4">
                <div className="step-number mx-auto mb-2">4</div>
                <h3 className="font-bold text-sm">Publica en redes o envía por WhatsApp</h3>
              </div>
              <div className="step-card text-center p-4">
                <div className="step-number mx-auto mb-2">5</div>
                <h3 className="font-bold text-sm">Organiza leads y cotizaciones en el CRM</h3>
              </div>
            </div>
            <div className="w-full flex justify-center mt-10">
              <a href="#planos" className="btn btn-primary" style={{ background: "#06B6D4" }}>Probar con garantía de 7 días</a>
            </div>
          </div>
        </section>

        <section className="proof-mini">
          <div className="inicio-container">
            <h2 className="section-title w-full text-center" style={{ textAlign: 'center', fontSize: "28px" }}>Antes de suscribirte, mira a qué tendrás acceso</h2>
            <p className="section-subtitle w-full text-center" style={{ textAlign: 'center', margin: '0 auto 32px' }}>Un vistazo rápido a los módulos principales de la plataforma.</p>
            
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
              PRUEBA SOCIAL ANONIMIZADA
            </p>
            <h2 className="section-title text-center" style={{ color: '#fff', marginBottom: '14px' }}>Resultados y conversaciones en español, sin exponer datos sensibles</h2>
            <p className="text-slate-400 text-center max-w-3xl mx-auto mb-10 leading-relaxed">
              Los prints originales tienen números, nombres o datos que no deben exponerse. Por eso la página muestra versiones en español, adaptadas y anonimizadas, manteniendo el contexto comercial del resultado sin mostrar logos, teléfonos ni empresas.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              {[
                ["Menos de 24h", "cliente relata primera venta para Disney después de aplicar anuncios y atención rápida"],
                ["23 presupuestos", "un día de demanda generada con campaña local y seguimiento activo"],
                ["5 paquetes", "resultado citado por cliente después de usar modelo de anuncio para vacaciones"]
              ].map(([value, label]) => (
                <div key={value} className="bg-white/10 border border-white/15 rounded-2xl p-5 text-center">
                  <div className="text-2xl md:text-3xl font-black text-green-400">{value}</div>
                  <p className="text-sm text-slate-300 mt-2 leading-relaxed">{label}</p>
                </div>
              ))}
            </div>
              
              <div className="social-proof-grid mt-8 max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-20">
              {socialProofChats.map((testimonial, i) => (
                <div key={testimonial.label} className="social-proof-chat flex flex-col rounded-2xl overflow-hidden shadow-lg border border-[#1f2c34] bg-[#0b141a] font-sans min-h-[430px]">
                  <div className="bg-[#202c33] px-4 py-3 border-b border-white/10">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-slate-700 flex items-center justify-center text-white font-black text-sm">A</div>
                      <div>
                        <p className="text-white text-sm font-black leading-none">Agencia anonimizada</p>
                        <span className="text-[#8696a0] text-xs">Caso: {testimonial.label}</span>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 flex flex-col gap-2 flex-1 bg-[#0b141a]/95 bg-[url('https://i.pinimg.com/originals/8f/ba/cb/8fbacbd464e996966eb9d4a6b7a9c21e.jpg')] bg-cover bg-blend-overlay">
                    {testimonial.messages.map((msg, j) => (
                      <div key={j} className={`flex flex-col max-w-[85%] rounded-lg px-3 py-2 text-[13px] text-[#e9edef] shadow-sm relative ${msg.sender === "client" ? "bg-[#202c33] self-start rounded-tl-none" : "bg-[#005c4b] self-end rounded-tr-none"}`}>
                        <span className="leading-relaxed text-left">{msg.text}</span>
                        <span className="text-[10px] text-white/50 text-right mt-1 flex justify-end items-center gap-1">
                          {`14:0${j + 1}`} {msg.sender === "lucas" && <Check className="w-[14px] h-[14px] text-[#53bdeb] ml-1" />}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              </div>

            <p className="testimonials-note" style={{ color: 'rgba(255,255,255,0.55)', marginTop: '32px', textAlign: 'center', fontSize: '13px' }}>Datos sensibles fueron ocultados por privacidad. Resultados pueden variar según oferta, atención, público y constancia de uso. La plataforma ayuda a crear, organizar y publicar con más velocidad y apariencia profesional.</p>
          </div>
        </section>

        <section className="how-it-works inicio-section">
          <div className="inicio-container">
            <h2 className="section-title text-center" style={{ color: "#F8FAFC" }}>Mira cómo funciona en la práctica</h2>
            <p className="section-subtitle text-center" style={{ color: "#94A3B8" }}>Una demostración rápida de cómo transformar una idea en contenido, página y organización comercial.</p>
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
                <p>Registra contactos, cotizaciones y oportunidades en el CRM para organizar leads, cotizaciones y oportunidades sin perder clientes en WhatsApp.</p>
              </div>
            </div>
          </div>
        </section>

        <section id="before-after" className="before-after inicio-section">
          <div className="inicio-container">
            <div className="w-full flex flex-col items-center justify-center text-center mx-auto mb-12">
              <h2 className="section-title w-full text-center" style={{ textAlign: 'center' }}>Basta de perder tiempo diseñando</h2>
              <p className="section-subtitle w-full text-center" style={{ textAlign: 'center', margin: '0 auto' }}>Tu agencia merece una presentación profesional sin pagar caro ni pasar horas arrastrando elementos.</p>
            </div>
            
            <div className="ba-grid">
              <div className="ba-card">
                <div className="ba-label danger">La forma antigua</div>
                <div className="ba-image">
                  <img src={antesAmador} alt="Diseño amateur" />
                </div>
                <ul className="ba-list">
                  <li className="bad">Horas arrastrando elementos</li>
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
            <h2 className="section-title w-full text-center" style={{ textAlign: 'center' }}>Lo que el cliente percibe antes de pedir cotización</h2>
            <p className="section-subtitle w-full text-center" style={{ textAlign: 'center', margin: '0 auto 32px' }}>La percepción visual va primero. Si tu agencia parece improvisada, el cliente ya llega con desconfianza.</p>
            
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
                <h2>Creado por Lucas Ferrari, acompañado por más de 66 mil personas en Instagram</h2>
                <p className="authority-text">Lucas Ferrari creó TravelMarketing a partir de un problema específico del turismo: agencias y asesores tienen paquetes buenos, pero pierden tiempo transformando esos paquetes en anuncios, páginas, textos, creativos y seguimiento comercial. La plataforma reúne ese flujo en un solo lugar para que la oferta parezca más clara, profesional y vendible antes de que el cliente pida cotización.</p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6">
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                    <strong className="block text-slate-900 text-sm mb-1">Si nunca me viste</strong>
                    <span className="text-slate-600 text-xs leading-relaxed block">puedes revisar demo, prints, Instagram, WhatsApp y garantía antes de decidir.</span>
                  </div>
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                    <strong className="block text-slate-900 text-sm mb-1">Si no sabes si sirve</strong>
                    <span className="text-slate-600 text-xs leading-relaxed block">entra con 7 días para probar creando una oferta real de tu agencia.</span>
                  </div>
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                    <strong className="block text-slate-900 text-sm mb-1">Si ya usas Canva</strong>
                    <span className="text-slate-600 text-xs leading-relaxed block">la diferencia es unir contenido, IA, páginas y CRM en una rutina de venta.</span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 md:gap-4 mt-6 max-w-[600px] mx-auto md:mx-0">
                  <div className="bg-white border border-slate-200 rounded-xl p-2 sm:p-4 shadow-sm text-center">
                    <div className="text-[18px] sm:text-[32px] font-black text-[#7C3AED] leading-none mb-1 md:mb-2">66k+</div>
                    <div className="text-[10px] sm:text-[14px] font-medium text-slate-600 leading-tight">Seguidores en Instagram</div>
                  </div>
                  <div className="bg-white border border-slate-200 rounded-xl p-2 sm:p-4 shadow-sm text-center">
                    <div className="text-[18px] sm:text-[32px] font-black text-[#7C3AED] leading-none mb-1 md:mb-2">100%</div>
                    <div className="text-[10px] sm:text-[14px] font-medium text-slate-600 leading-tight">Enfocado en agencias</div>
                  </div>
                  <div className="bg-white border border-slate-200 rounded-xl p-2 sm:p-4 shadow-sm text-center">
                    <div className="text-[16px] sm:text-[24px] font-black text-[#7C3AED] leading-none mb-1 mt-0.5 sm:mt-1 md:mb-2">Soporte</div>
                    <div className="text-[10px] sm:text-[14px] font-medium text-slate-600 leading-tight">Vía WhatsApp</div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-3 mt-6 max-w-[400px] mx-auto md:mx-0">
                  <a href={instagramUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 h-12 bg-white border border-slate-200 rounded-xl font-bold text-[13px] sm:text-[15px] text-slate-900 shadow-sm transition-colors hover:bg-slate-50">
                    <Instagram size={18} color="#E1306C" /> Ver Instagram
                  </a>
                  <a href={supportWhatsAppUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 h-12 bg-white border border-slate-200 rounded-xl font-bold text-[13px] sm:text-[15px] text-slate-900 shadow-sm transition-colors hover:bg-slate-50">
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
              <h2 className="section-title w-full text-center" style={{ textAlign: 'center' }}>Todo lo que tu agencia necesita para vender con más velocidad y apariencia profesional.</h2>
              <p className="section-subtitle w-full text-center" style={{ textAlign: 'center', margin: '0 auto 32px' }}>En vez de usar varias herramientas separadas, reúne contenido, IA, páginas de venta y CRM en una sola plataforma pensada para turismo.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8 w-full max-w-[1000px] mx-auto px-4 sm:px-0">
              <div className="bg-[#1e293b] border border-white/5 rounded-2xl p-6 text-center hover:bg-[#1e293b]/80 transition-colors flex flex-col items-center">
                <div className="w-12 h-12 rounded-xl bg-[#06B6D4]/10 text-[#06B6D4] flex items-center justify-center mb-4"><Instagram size={24} /></div>
                <h3 className="text-white font-bold text-[18px] mb-2">Contenido listo para turismo</h3>
                <p className="text-white/60 text-[15px] leading-snug">Videos, artes, stories, posts, carruseles y textos para publicar ofertas de viajes con apariencia profesional.</p>
              </div>
              <div className="bg-[#1e293b] border border-white/5 rounded-2xl p-6 text-center hover:bg-[#1e293b]/80 transition-colors flex flex-col items-center">
                <div className="w-12 h-12 rounded-xl bg-[#06B6D4]/10 text-[#06B6D4] flex items-center justify-center mb-4"><BookOpen size={24} /></div>
                <h3 className="text-white font-bold text-[18px] mb-2">IA para crear campañas</h3>
                <p className="text-white/60 text-[15px] leading-snug">Escribe el destino, precio o idea de paquete y genera anuncios, textos, llamadas a la acción, itinerarios y descripciones en minutos.</p>
              </div>
              <div className="bg-[#1e293b] border border-white/5 rounded-2xl p-6 text-center hover:bg-[#1e293b]/80 transition-colors flex flex-col items-center">
                <div className="w-12 h-12 rounded-xl bg-[#06B6D4]/10 text-[#06B6D4] flex items-center justify-center mb-4"><Calendar size={24} /></div>
                <h3 className="text-white font-bold text-[18px] mb-2">CRM para no perder clientes</h3>
                <p className="text-white/60 text-[15px] leading-snug">Organiza leads, cotizaciones, contactos y oportunidades para dar seguimiento y vender con más control.</p>
              </div>
            </div>
            
            <div className="features-cta w-full flex justify-center mt-10">
              <a href="#planos" className="btn btn-primary">Crear mis anuncios con IA</a>
            </div>
          </div>
        </section>

        {/* 10. PLANOS / PRICING */}
                {/* SHOWCASE SECTION: FERRAMENTAS PROFISSIONAIS */}
        <section className="py-24 px-6 bg-white border-b border-[#e5e7eb] inicio-section">
          <div className="inicio-container text-center">
            <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4 w-full text-center" style={{ textAlign: 'center' }}>
              Herramientas profesionales para vender viajes con más velocidad
            </h2>
            <p className="text-[#64748b] text-base md:text-lg max-w-3xl mx-auto mb-12 w-full text-center" style={{ textAlign: 'center' }}>
              Cada módulo fue pensado para una rutina real de agencia: publicar ofertas, presentar paquetes, responder interesados, crear materiales y no dejar cotizaciones perdidas en WhatsApp.
            </p>

            {/* Navigation Tabs (Pills) */}
            <div className="flex flex-wrap justify-center gap-2 mb-16">
              {[
                { id: "featured", label: "Destacados" },
                { id: "social", label: "Redes sociales" },
                { id: "video", label: "Videos" },
                { id: "photo", label: "Fotos y Diseños" },
                { id: "ai", label: "Inteligencia Artificial" },
                { id: "texts", label: "Textos y Contratos" }
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
                        <img src={showcaseAdCreation} alt="Creación de anuncios con IA" className="w-full h-full object-cover" />
                      </div>
                      <h3 className="text-xl font-bold text-[#0f172a] mb-2 text-center flex items-center justify-center gap-2">
                        <span className="text-[#8b3dff]">⚡</span> Creación de anuncios con IA
                      </h3>
                      <p className="text-[#64748b] text-sm text-center leading-relaxed">
                        Crea campañas y ofertas irresistibles en segundos. Escribe el destino, precio y cuotas, y nuestra inteligencia artificial genera el anuncio completo con tu identidad visual, listo para atraer viajeros de alto nivel.
                      </p>
                    </div>
                  </div>

                  {/* 2. Construtor de sites */}
                  <div className="bg-[#f8fafc] border border-[#e2e8f0] rounded-3xl p-6 flex flex-col hover:shadow-lg transition-all duration-300">
                    <div>
                      <div className="w-full aspect-[4/3] rounded-2xl overflow-hidden mb-6 border border-[#e2e8f0]">
                        <img src={showcaseLandingPages} alt="Constructor de sitios" className="w-full h-full object-cover" />
                      </div>
                      <h3 className="text-xl font-bold text-[#0f172a] mb-2 text-center flex items-center justify-center gap-2">
                        <span className="text-[#8b3dff]">🌐</span> Constructor de sitios
                      </h3>
                      <p className="text-[#64748b] text-sm text-center leading-relaxed">
                        Crea modelos profesionales de landing pages de ventas e itinerarios de viaje completos al instante. Aplica tus colores, fuentes y logotipos con un clic para impresionar a tus leads y vender paquetes más rápido.
                      </p>
                    </div>
                  </div>

                  {/* 3. CRM para gestão de clientes */}
                  <div className="bg-[#f8fafc] border border-[#e2e8f0] rounded-3xl p-6 flex flex-col hover:shadow-lg transition-all duration-300">
                    <div>
                      <div className="w-full aspect-[4/3] rounded-2xl overflow-hidden mb-6 border border-[#e2e8f0]">
                        <img src={showcaseCrm} alt="CRM para gestión de clientes" className="w-full h-full object-cover" />
                      </div>
                      <h3 className="text-xl font-bold text-[#0f172a] mb-2 text-center flex items-center justify-center gap-2">
                        <span className="text-[#8b3dff]">📊</span> CRM para gestión de clientes
                      </h3>
                      <p className="text-[#64748b] text-sm text-center leading-relaxed">
                        Organiza tus conversaciones, gestiona el embudo de atención y ventas de paquetes de viaje, y controla todo el historial de contactos y contratos de tu agencia en un único sistema práctico e intuitivo.
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
                        <img src={showcaseScheduler} alt="Calendario de publicaciones" className="w-full h-full object-cover" />
                      </div>
                      <h3 className="text-xl font-bold text-[#0f172a] mb-2 text-center flex items-center justify-center gap-2">
                        <span className="text-[#8b3dff]">📅</span> Calendario de publicaciones
                      </h3>
                      <p className="text-[#64748b] text-sm text-center leading-relaxed">
                        Planifica, crea y programa tus publicaciones directamente desde la plataforma para todas tus redes de forma automatizada, manteniendo tu perfil siempre activo.
                      </p>
                    </div>
                  </div>

                  {/* 2. Mais de 400 mídias exclusivas */}
                  <div className="bg-[#f8fafc] border border-[#e2e8f0] rounded-3xl p-6 flex flex-col hover:shadow-lg transition-all duration-300">
                    <div>
                      <div className="w-full aspect-[4/3] rounded-2xl overflow-hidden mb-6 border border-[#e2e8f0]">
                        <img src={showcasePremiumMedias} alt="Más de 400 medios exclusivos" className="w-full h-full object-cover" />
                      </div>
                      <h3 className="text-xl font-bold text-[#0f172a] mb-2 text-center flex items-center justify-center gap-2">
                        <span className="text-[#8b3dff]">✨</span> Más de 400 medios exclusivos
                      </h3>
                      <p className="text-[#64748b] text-sm text-center leading-relaxed">
                        Acceso completo a la colección de plantillas listas para publicaciones en el feed, stories editables, leyendas y creatividades. Todo perfectamente diseñado para enganchar a tu audiencia en las redes.
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
                        <img src="/images/LOC_MarTechB2C_CanvaPro_LandingPage_PremiumVideoTemplates_Small_pt-BR.png" alt="Más de 300 videos Reels de destinos" className="w-full h-full object-cover" />
                      </div>
                      <h3 className="text-xl font-bold text-[#0f172a] mb-2 text-center flex items-center justify-center gap-2">
                        <span className="text-[#8b3dff]">🎬</span> Más de 300 videos Reels
                      </h3>
                      <p className="text-[#64748b] text-sm text-center leading-relaxed">
                        Desbloquea una biblioteca con cientos de videos cinematográficos grabados en alta definición de los principales destinos nacionales e internacionales listos para atraer viajeros.
                      </p>
                    </div>
                  </div>

                  {/* 2. Roteiros e Copys para Vídeos */}
                  <div className="bg-[#f8fafc] border border-[#e2e8f0] rounded-3xl p-6 flex flex-col hover:shadow-lg transition-all duration-300">
                    <div>
                      <div className="w-full aspect-[4/3] rounded-2xl overflow-hidden mb-6 border border-[#e2e8f0]">
                        <img src="/images/PRO25001_JTBD_Section_Video_Tab_Captions.png" alt="Guiones para videos" className="w-full h-full object-cover" />
                      </div>
                      <h3 className="text-xl font-bold text-[#0f172a] mb-2 text-center flex items-center justify-center gap-2">
                        <span className="text-[#8b3dff]">💬</span> Guiones y Textos para Videos
                      </h3>
                      <p className="text-[#64748b] text-sm text-center leading-relaxed">
                        Ten acceso a guiones detallados y ganchos persuasivos para tus videos Reels. Aprende cómo captar la atención del cliente y generar más mensajes directos queriendo cerrar viajes.
                      </p>
                    </div>
                  </div>

                  {/* 3. Acesso Fácil via Google Drive */}
                  <div className="bg-[#f8fafc] border border-[#e2e8f0] rounded-3xl p-6 flex flex-col hover:shadow-lg transition-all duration-300">
                    <div>
                      <div className="w-full aspect-[4/3] rounded-2xl overflow-hidden mb-6 border border-[#e2e8f0]">
                        <img src="/images/Whiteboard_ProTemplates_Desktop_2x_pt-BR.png" alt="Acceso en Google Drive" className="w-full h-full object-cover" />
                      </div>
                      <h3 className="text-xl font-bold text-[#0f172a] mb-2 text-center flex items-center justify-center gap-2">
                        <span className="text-[#8b3dff]">📥</span> Descarga vía Google Drive
                      </h3>
                      <p className="text-[#64748b] text-sm text-center leading-relaxed">
                        Todos los archivos de video están alojados y organizados de forma profesional en Google Drive. Descarga los medios en 4K y HD con un solo clic directamente en tu celular o desktop.
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
                        <img src="/images/ArtistCollection_small_pt-BR.png" alt="Artes listas para el Feed" className="w-full h-full object-cover" />
                      </div>
                      <h3 className="text-xl font-bold text-[#0f172a] mb-2 text-center flex items-center justify-center gap-2">
                        <span className="text-[#8b3dff]">🎨</span> Artes listas para el Feed
                      </h3>
                      <p className="text-[#64748b] text-sm text-center leading-relaxed">
                        Modelos profesionales listos de carruseles y posts estáticos con diseños de ofertas e itinerarios explicativos. Perfectos para mantener tu feed sofisticado y armónico.
                      </p>
                    </div>
                  </div>

                  {/* 2. Stories interativos para Instagram */}
                  <div className="bg-[#f8fafc] border border-[#e2e8f0] rounded-3xl p-6 flex flex-col hover:shadow-lg transition-all duration-300">
                    <div>
                      <div className="w-full aspect-[4/3] rounded-2xl overflow-hidden mb-6 border border-[#e2e8f0]">
                        <img src="/images/Spotlight_Disney_Mobile.png" alt="Stories interactivos" className="w-full h-full object-cover" />
                      </div>
                      <h3 className="text-xl font-bold text-[#0f172a] mb-2 text-center flex items-center justify-center gap-2">
                        <span className="text-[#8b3dff]">📱</span> Stories interactivos
                      </h3>
                      <p className="text-[#64748b] text-sm text-center leading-relaxed">
                        Aparece todos los días utilizando cajas de preguntas elegantes, encuestas, quizzes y guiones de interacción diarios para convertir seguidores en compradores.
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
                        <img src="/images/PRO25001_JTBD_Section_Brand_Tab_Magic_Write.png" alt="Vendedor de viajes con IA" className="w-full h-full object-cover" />
                      </div>
                      <h3 className="text-xl font-bold text-[#0f172a] mb-2 text-center flex items-center justify-center gap-2">
                        <span className="text-[#8b3dff]">👑</span> Vendedor de Viajes IA
                      </h3>
                      <p className="text-[#64748b] text-sm text-center leading-relaxed">
                        El asistente virtual más potente del mercado, entrenado para vender paquetes y crear ofertas exclusivas. Escribe la idea o el destino y la IA genera el copy de venta instantáneamente.
                      </p>
                    </div>
                  </div>

                  {/* 2. Agentes de IA para Marketing */}
                  <div className="bg-[#f8fafc] border border-[#e2e8f0] rounded-3xl p-6 flex flex-col hover:shadow-lg transition-all duration-300">
                    <div>
                      <div className="w-full aspect-[4/3] rounded-2xl overflow-hidden mb-6 border border-[#e2e8f0]">
                        <img src="/images/LOC_MarTechB2C_CanvaPro_LandingPage_AIAdCreation_Small_pt-BR.png" alt="Agentes de marketing con IA" className="w-full h-full object-cover" />
                      </div>
                      <h3 className="text-xl font-bold text-[#0f172a] mb-2 text-center flex items-center justify-center gap-2">
                        <span className="text-[#8b3dff]">🤖</span> Agentes IA de Marketing
                      </h3>
                      <p className="text-[#64748b] text-sm text-center leading-relaxed">
                        Agiliza tu producción de contenido con asistentes de IA para escribir descripciones y títulos que venden paquetes turísticos sin esfuerzo.
                      </p>
                    </div>
                  </div>

                  {/* 3. Gerador Inteligente de Roteiros */}
                  <div className="bg-[#f8fafc] border border-[#e2e8f0] rounded-3xl p-6 flex flex-col hover:shadow-lg transition-all duration-300">
                    <div>
                      <div className="w-full aspect-[4/3] rounded-2xl overflow-hidden mb-6 border border-[#e2e8f0]">
                        <img src="/images/PRO25001_JTBD_Section_Spotlight_Tab_Style_Match.png" alt="Generador inteligente de itinerarios" className="w-full h-full object-cover" />
                      </div>
                      <h3 className="text-xl font-bold text-[#0f172a] mb-2 text-center flex items-center justify-center gap-2">
                        <span className="text-[#8b3dff]">🗺️</span> Generador IA de Itinerarios
                      </h3>
                      <p className="text-[#64748b] text-sm text-center leading-relaxed">
                        Crea propuestas de viaje e itinerarios completos día a día, ultra detallados y personalizados para el perfil de cada cliente en segundos.
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
                        <img src="/images/PRO25001_JTBD_Section_Video_Tab_Captions.png" alt="Leyendas listas" className="w-full h-full object-cover" />
                      </div>
                      <h3 className="text-xl font-bold text-[#0f172a] mb-2 text-center flex items-center justify-center gap-2">
                        <span className="text-[#8b3dff]">✍️</span> Leyendas Listas
                      </h3>
                      <p className="text-[#64748b] text-sm text-center leading-relaxed">
                        Cientos de leyendas perfectamente estructuradas con gatillos mentales listas para que las copies, pegues y apliques en las fotos o Reels de tu feed.
                      </p>
                    </div>
                  </div>

                  {/* 2. Textos de Ofertas Validadas */}
                  <div className="bg-[#f8fafc] border border-[#e2e8f0] rounded-3xl p-6 flex flex-col hover:shadow-lg transition-all duration-300">
                    <div>
                      <div className="w-full aspect-[4/3] rounded-2xl overflow-hidden mb-6 border border-[#e2e8f0]">
                        <img src="/images/LOC_MarTechB2C_CanvaPro_LandingPage_AdInspiration_Small_pt-BR.png" alt="Textos de ofertas validadas" className="w-full h-full object-cover" />
                      </div>
                      <h3 className="text-xl font-bold text-[#0f172a] mb-2 text-center flex items-center justify-center gap-2">
                        <span className="text-[#8b3dff]">💰</span> Textos de Ofertas
                      </h3>
                      <p className="text-[#64748b] text-sm text-center leading-relaxed">
                        Copywriting de alto rendimiento validado por agencias para ofertas especiales y campañas de cierre de paquetes de viaje.
                      </p>
                    </div>
                  </div>

                  {/* 3. Contratos de Viagens Validados */}
                  <div className="bg-[#f8fafc] border border-[#e2e8f0] rounded-3xl p-6 flex flex-col hover:shadow-lg transition-all duration-300">
                    <div>
                      <div className="w-full aspect-[4/3] rounded-2xl overflow-hidden mb-6 border border-[#e2e8f0]">
                        <img src="/images/PRO25001_JTBD_Section_Print_Tab_Disney_Collection.png" alt="Contratos de viajes validados" className="w-full h-full object-cover" />
                      </div>
                      <h3 className="text-xl font-bold text-[#0f172a] mb-2 text-center flex items-center justify-center gap-2">
                        <span className="text-[#8b3dff]">📄</span> Modelos de Contratos
                      </h3>
                      <p className="text-[#64748b] text-sm text-center leading-relaxed">
                        Modelos listos y estructurados jurídicamente de contratos de intermediación de viajes y prestación de servicios para dar total seguridad jurídica a tu negocio.
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
            <h2 className="section-title w-full text-center" style={{ textAlign: 'center' }}>Descubre dónde tu dinero rinde más</h2>
            <p className="section-subtitle w-full text-center" style={{ textAlign: 'center', marginTop: '8px', fontSize: '13px', color: '#64748B' }}>Los valores externos son estimativas y pueden variar según proveedor, profesional y plan contratado.</p>
            
            <div className="comparison-grid">
              <div className="comparison-card">
                <h3>Diseñador Freelance</h3>
                <div className="compare-row">
                  <span className="compare-label">Costo Promedio</span>
                  <span className="compare-value">A partir de US$40 por arte o bajo demanda</span>
                </div>
                <div className="compare-row">
                  <span className="compare-label">Tiempo</span>
                  <span className="compare-value">3 a 5 días</span>
                </div>
                <div className="compare-row">
                  <span className="compare-label">Trabajo</span>
                  <span className="compare-value">Necesita aprobar y revisar</span>
                </div>
              </div>
              
              <div className="comparison-card">
                <h3>Pack de Canva</h3>
                <div className="compare-row">
                  <span className="compare-label">Costo Promedio</span>
                  <span className="compare-value">US$50 único</span>
                </div>
                <div className="compare-row">
                  <span className="compare-label">Tiempo</span>
                  <span className="compare-value">Todavía necesitas editar</span>
                </div>
                <div className="compare-row">
                  <span className="compare-label">Trabajo</span>
                  <span className="compare-value">Manual</span>
                </div>
              </div>

              <div className="comparison-card best">
                <div className="best-badge">Mejor Elección</div>
                <h3>TravelMarketing</h3>
                <div className="compare-row">
                  <span className="compare-label">Costo</span>
                  <span className="compare-value">A partir de US$50/mes</span>
                </div>
                <div className="compare-row">
                  <span className="compare-label">Tiempo</span>
                  <span className="compare-value">En minutos <CheckCircle2 size={14} /></span>
                </div>
                <div className="compare-row">
                  <span className="compare-label">Trabajo</span>
                  <span className="compare-value">IA + CRM + plantillas listas <CheckCircle2 size={14} /></span>
                </div>
              </div>
            </div>
            
            {/* Desktop Table (Hidden on Mobile via CSS) */}
            <div className="desktop-comparison">
               <table>
                 <thead>
                   <tr>
                     <th>Recursos</th>
                     <th>Diseñador Freelance</th>
                     <th>Pack de Canva</th>
                     <th>TravelMarketing</th>
                   </tr>
                 </thead>
                 <tbody>
                    <tr>
                      <td>Costo Promedio</td>
                      <td>A partir de US$40 por arte o bajo demanda</td>
                      <td>US$50 único</td>
                      <td>A partir de US$50/mes</td>
                    </tr>
                    <tr>
                      <td>Tiempo de Entrega</td>
                      <td>3 a 5 días</td>
                      <td>Todavía necesitas editar</td>
                      <td>En minutos</td>
                    </tr>
                    <tr>
                      <td>Esfuerzo</td>
                      <td>Necesita aprobar y revisar</td>
                      <td>Manual</td>
                      <td>IA + CRM + plantillas listas</td>
                    </tr>
                 </tbody>
               </table>
            </div>
            
            <p className="comparison-note w-full text-center" style={{ textAlign: "center", fontSize: "12px", color: "#64748B", marginTop: "16px" }}>El menor valor disponible es en el plan anual al contado. El plan mensual cuesta US$50/mes.</p>

          </div>
        </section>


        <section className="inicio-section" style={{ background: '#0F172A', padding: '60px 20px', color: 'white' }}>
          <div className="inicio-container">
            <h2 className="section-title text-center text-white" style={{color: 'white'}}>Lo que recibes y para qué sirve en la venta</h2>
            <p className="section-subtitle text-center" style={{ color: '#CBD5E1', margin: '14px auto 0' }}>
              No es una lista inflada de recursos. Cada parte existe para ayudarte a publicar más rápido, presentar mejor y dar seguimiento con más control.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
              {includedResultCards.map(([title, result]) => (
                <div key={title} className="bg-white/10 border border-white/20 rounded-2xl p-5 text-left">
                  <div className="flex items-center gap-2 mb-3">
                    <CheckCircle2 size={18} className="text-green-400 shrink-0" />
                    <h3 className="text-white text-lg font-black">{title}</h3>
                  </div>
                  <p className="text-slate-300 text-sm leading-relaxed">{result}</p>
                </div>
              ))}
            </div>

            <h2 className="section-title text-center text-white mt-16" style={{color: 'white'}}>Qué puedes crear con la plataforma</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
              <div className="bg-transparent border border-white/20 rounded-xl p-4 text-center text-sm">Oferta para Cancún all inclusive</div>
              <div className="bg-transparent border border-white/20 rounded-xl p-4 text-center text-sm">Paquete para Punta Cana</div>
              <div className="bg-transparent border border-white/20 rounded-xl p-4 text-center text-sm">Campaña para Disney</div>
              <div className="bg-transparent border border-white/20 rounded-xl p-4 text-center text-sm">Página de venta para Europa</div>
              <div className="bg-transparent border border-white/20 rounded-xl p-4 text-center text-sm">Itinerario para Machu Picchu</div>
              <div className="bg-transparent border border-white/20 rounded-xl p-4 text-center text-sm">Post para luna de miel</div>
              <div className="bg-transparent border border-white/20 rounded-xl p-4 text-center text-sm">Anuncio para grupos y excursiones</div>
              <div className="bg-transparent border border-white/20 rounded-xl p-4 text-center text-sm">Texto de WhatsApp para seguimiento</div>
            </div>
            
            <div className="w-full flex justify-center mt-10">
              <a href="#planos" className="btn btn-primary" style={{ background: "#06B6D4" }}>Garantizar mi acceso</a>
            </div>
          </div>
        </section>

        {/* 9. EMPILHAMENTO DE VALOR (Offer Stack) */}
        <section className="offer-stack inicio-section" style={{ background: '#0F172A', color: 'white', padding: '80px 20px', marginTop: '40px' }}>
          <div className="inicio-container" style={{ maxWidth: '800px', margin: '0 auto' }}>
            <h2 className="section-title w-full text-center" style={{ color: 'white', fontSize: '32px', marginBottom: '40px', textAlign: 'center' }}>Si contrataras todo esto por separado...</h2>
            
            <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '24px', padding: '32px', border: '1px solid rgba(255,255,255,0.1)' }}>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <li style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '20px' }}>
                  <span style={{ fontSize: '18px', color: '#94A3B8' }}>Plataforma de CRM:</span>
                  <span style={{ fontSize: '18px', fontWeight: 'bold' }}>US$75/mes</span>
                </li>
                <li style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '20px' }}>
                  <span style={{ fontSize: '18px', color: '#94A3B8' }}>Constructor de Sitios Express:</span>
                  <span style={{ fontSize: '18px', fontWeight: 'bold' }}>US$45/mes</span>
                </li>
                <li style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '20px' }}>
                  <span style={{ fontSize: '18px', color: '#94A3B8' }}>Diseñador Freelance (30 artes):</span>
                  <span style={{ fontSize: '18px', fontWeight: 'bold' }}>US$750/mes</span>
                </li>
                <li style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '20px' }}>
                  <span style={{ fontSize: '18px', color: '#94A3B8' }}>Editor de Video (15 videos):</span>
                  <span style={{ fontSize: '18px', fontWeight: 'bold' }}>US$750/mes</span>
                </li>
                <li style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '20px' }}>
                  <span style={{ fontSize: '18px', color: '#94A3B8' }}>Sitio Web Completo:</span>
                  <span style={{ fontSize: '18px', fontWeight: 'bold' }}>US$750 único</span>
                </li>
              </ul>
              
              <div style={{ marginTop: '32px', textAlign: 'center', background: 'rgba(239,68,68,0.1)', padding: '24px', borderRadius: '16px', border: '1px dashed rgba(239,68,68,0.3)' }}>
                <p style={{ color: '#F87171', fontSize: '16px', marginBottom: '8px' }}>Contratar diseñador, editor de video, CRM, redactor, constructor de páginas y herramientas de IA por separado puede costar cientos o miles de dólares al mes.</p>
                
              </div>
              
              <div style={{ marginTop: '24px', textAlign: 'center', background: 'rgba(16,185,129,0.1)', padding: '40px 24px', borderRadius: '16px', border: '2px solid #10B981', boxShadow: '0 0 30px rgba(16,185,129,0.2)' }}>
                <p style={{ color: '#34D399', fontSize: '16px', fontWeight: 'bold', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '2px' }}>Con TravelMarketing</p>
                <div style={{ fontSize: '48px', fontWeight: '900', color: '#10B981', lineHeight: '1' }}>Solo US$50/mes</div>
                <p style={{ color: '#E2E8F0', fontSize: '16px', marginTop: '16px', lineHeight: '1.5' }}>Con la plataforma, tu agencia reúne contenido, IA, páginas y CRM en un solo lugar. El plan mensual cuesta US$50/mes y el anual reduce el costo total del año.</p>
              </div>
            </div>
          </div>
        </section>


        <section className="inicio-section" style={{ background: '#F8FAFC', padding: '60px 20px', borderTop: '1px solid #E2E8F0', borderBottom: '1px solid #E2E8F0' }}>
          <div className="inicio-container max-w-5xl mx-auto">
            <h2 className="section-title text-center text-slate-800">¿Qué pasa después de comprar?</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mt-10 mb-8">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col items-center text-center">
                <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-xl mb-4">1</div>
                <h3 className="font-bold text-slate-800 mb-2">Recibes el acceso</h3>
                <p className="text-sm text-slate-600">Después del pago, recibes las instrucciones para entrar en la plataforma.</p>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col items-center text-center">
                <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-xl mb-4">2</div>
                <h3 className="font-bold text-slate-800 mb-2">Exploras los recursos</h3>
                <p className="text-sm text-slate-600">Accede a contenidos, herramientas de IA, páginas, CRM y materiales listos para turismo.</p>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col items-center text-center">
                <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-xl mb-4">3</div>
                <h3 className="font-bold text-slate-800 mb-2">Creas tus ofertas</h3>
                <p className="text-sm text-slate-600">Empieza con anuncios, textos, páginas o materiales para tus paquetes de viaje.</p>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col items-center text-center">
                <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-xl mb-4">4</div>
                <h3 className="font-bold text-slate-800 mb-2">Tienes soporte</h3>
                <p className="text-sm text-slate-600">Si necesitas ayuda, cuentas con soporte vía WhatsApp para dudas de acceso y uso.</p>
              </div>
            </div>
            <p className="text-center text-slate-500 font-medium">Todo fue pensado para empezar sin saber diseño, programación ni herramientas complejas.</p>
          </div>
        </section>


        <section className="inicio-section" style={{ padding: '60px 20px 0 20px' }}>
          <div className="inicio-container">
            
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-1 relative overflow-hidden max-w-[900px] mx-auto shadow-2xl mb-12">
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
              <div className="bg-slate-900 rounded-[22px] p-8 md:p-12 relative z-10">
                <div className="text-center mb-10">
                  <span className="inline-block bg-purple-500/20 text-purple-300 font-bold px-4 py-1.5 rounded-full text-sm mb-4 border border-purple-500/30">
                    OFERTA DE LANZAMIENTO ACTIVA
                  </span>
                  <h2 className="text-3xl md:text-4xl font-black text-white mb-4">Oferta de lanzamiento para agencias LATAM</h2>
                  <p className="text-slate-300 text-lg max-w-2xl mx-auto">
                    Entra con acceso inmediato, prueba la plataforma por 7 días y elige entre pagar mensual o ahorrar más con el plan anual.
                  </p>
                </div>
                
                <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6 md:p-8 mb-10">
                  <div className="text-white font-bold mb-4 text-lg border-b border-slate-700 pb-2">Incluye:</div>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-6">
                    <li className="flex items-start gap-2 text-slate-300 text-sm"><CheckCircle2 className="text-green-400 shrink-0" size={18} /> Acceso inmediato a la plataforma</li>
                    <li className="flex items-start gap-2 text-slate-300 text-sm"><CheckCircle2 className="text-green-400 shrink-0" size={18} /> IA para anuncios, textos e ideas de campaña</li>
                    <li className="flex items-start gap-2 text-slate-300 text-sm"><CheckCircle2 className="text-green-400 shrink-0" size={18} /> Páginas de paquetes para enviar por WhatsApp</li>
                    <li className="flex items-start gap-2 text-slate-300 text-sm"><CheckCircle2 className="text-green-400 shrink-0" size={18} /> CRM para leads y cotizaciones</li>
                    <li className="flex items-start gap-2 text-slate-300 text-sm"><CheckCircle2 className="text-green-400 shrink-0" size={18} /> Biblioteca de contenidos para turismo</li>
                    <li className="flex items-start gap-2 text-slate-300 text-sm"><CheckCircle2 className="text-green-400 shrink-0" size={18} /> Videos, diseños, posts, stories e itinerarios</li>
                    <li className="flex items-start gap-2 text-slate-300 text-sm"><CheckCircle2 className="text-green-400 shrink-0" size={18} /> Soporte vía WhatsApp</li>
                    <li className="flex items-start gap-2 text-slate-300 text-sm"><CheckCircle2 className="text-green-400 shrink-0" size={18} /> Garantía de satisfacción de 7 días</li>
                  </ul>
                </div>

                <p className="text-center text-slate-300 font-medium italic mb-8 max-w-2xl mx-auto border-l-4 border-yellow-400 pl-4 py-1">
                  Si tu agencia pierde horas creando contenido, depende de diseñador o deja cotizaciones sin seguimiento, seguir improvisando también tiene un costo. El plan anual existe para quien quiere usar la plataforma todo el año pagando menos que 12 mensualidades.
                </p>
                
                <div className="text-center">
                  <a href="#planos" className="inline-block bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-black text-xl py-5 px-12 rounded-xl shadow-[0_0_30px_rgba(124,58,237,0.4)] hover:shadow-[0_0_40px_rgba(124,58,237,0.6)] hover:-translate-y-1 transition-all">
                    Ver el plan anual con mayor ahorro
                  </a>
                  <div className="text-center text-[13px] font-bold text-slate-400 mt-4 flex flex-wrap items-center justify-center gap-2 sm:gap-4">
                    <span>⚡ Acceso inmediato</span>
                    <span className="hidden sm:inline">•</span>
                    <span>🔒 Pago seguro por Hotmart</span>
                    <span className="hidden sm:inline">•</span>
                    <span>✅ Garantía de 7 días</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </section>

        <section id="planos" className="pricing inicio-section">
          <div className="inicio-container">
            <div className="w-full flex flex-col items-center justify-center text-center mx-auto">
              <h2 className="section-title w-full text-center" style={{ textAlign: 'center' }}>Elige cómo quieres entrar</h2>
              <p className="section-subtitle w-full text-center" style={{ textAlign: 'center', margin: '0 auto 32px' }}>El plan mensual es para probar pagando mes a mes. El plan anual es la mejor elección si quieres acceso por 12 meses y ahorrar US$350 frente a pagar mensual todo el año. Los precios están en dólares (USD).</p>
            </div>

            <div className="max-w-5xl mx-auto mb-10 bg-white border border-slate-200 rounded-3xl p-5 md:p-8 shadow-sm">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
                <div className="md:max-w-[320px]">
                  <p className="text-sm font-black uppercase tracking-[0.18em] text-purple-600 mb-2">Plan de prueba</p>
                  <h3 className="text-2xl font-black text-slate-900 mb-3">No entres para mirar. Entra para validar una oferta real.</h3>
                  <p className="text-slate-600 text-sm leading-relaxed">Durante los primeros días, usa un paquete que ya quieres vender. Si la plataforma no te ayuda a crear, presentar y organizar mejor esa oferta, la garantía reduce el riesgo de la decisión.</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 flex-1">
                  {trialPlanSteps.map(([day, action]) => (
                    <div key={day} className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-left">
                      <div className="text-purple-700 font-black text-sm mb-2">{day}</div>
                      <p className="text-slate-700 text-sm leading-relaxed">{action}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <PricingAccordionES />

            <div className="max-w-5xl mx-auto mt-10 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-red-50 border border-red-200 rounded-2xl p-5">
                <h3 className="text-red-950 text-lg font-black mb-3">No compres si...</h3>
                <ul className="space-y-2 text-sm text-red-900">
                  <li className="flex gap-2"><span className="font-black">×</span> esperas vender sin publicar, atender ni hacer seguimiento.</li>
                  <li className="flex gap-2"><span className="font-black">×</span> no tienes ningún paquete, destino o servicio para ofrecer.</li>
                  <li className="flex gap-2"><span className="font-black">×</span> buscas solo un archivo estático de Canva y no una plataforma de trabajo.</li>
                </ul>
              </div>
              <div className="bg-green-50 border border-green-200 rounded-2xl p-5">
                <h3 className="text-green-950 text-lg font-black mb-3">Compra si quieres...</h3>
                <ul className="space-y-2 text-sm text-green-900">
                  <li className="flex gap-2"><CheckCircle2 size={17} className="text-green-600 shrink-0 mt-0.5" /> publicar ofertas con apariencia más profesional.</li>
                  <li className="flex gap-2"><CheckCircle2 size={17} className="text-green-600 shrink-0 mt-0.5" /> crear anuncios, textos, páginas y materiales con más velocidad.</li>
                  <li className="flex gap-2"><CheckCircle2 size={17} className="text-green-600 shrink-0 mt-0.5" /> organizar leads para no perder oportunidades en WhatsApp.</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* 11. GARANTIA */}
        <section className="guarantee inicio-section">
          <div className="inicio-container">
            <div className="guarantee-inner bg-slate-900 border border-slate-800 rounded-3xl p-8 md:p-12 flex flex-col md:flex-row items-center gap-8 shadow-2xl">
              <div className="w-32 h-32 shrink-0 bg-slate-800 rounded-full flex flex-col items-center justify-center border-4 border-slate-700 shadow-inner">
                <strong className="text-5xl font-black text-white leading-none">7</strong>
                <span className="text-slate-400 font-bold uppercase tracking-widest text-sm mt-1">Días</span>
              </div>
              <div className="flex-1 text-center md:text-left">
                <h2 className="text-2xl md:text-4xl font-black text-white mb-4">Pruébalo por 7 días sin riesgo</h2>
                <p className="text-slate-300 text-lg mb-6 leading-relaxed">
                  Entra, explora la plataforma, crea tus primeros contenidos y revisa si realmente ayuda a tu agencia. Si dentro de 7 días sientes que no es para ti, puedes solicitar el reembolso conforme a la política de garantía.
                </p>
                <div className="bg-white/5 border border-white/10 rounded-2xl p-4 mb-6">
                  <h3 className="text-white font-black mb-3">Qué deberías validar en esos 7 días</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {["¿creé una oferta más rápido?", "¿mi paquete quedó más profesional?", "¿tengo más control de los leads?"].map((question) => (
                      <div key={question} className="bg-slate-800 rounded-xl p-3 text-sm text-slate-300 font-semibold">
                        {question}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8 text-left max-w-xl mx-auto md:mx-0">
                  <div className="flex items-start gap-2 text-slate-300"><CheckCircle2 size={20} className="text-green-500 shrink-0" /> Acceso inmediato</div>
                  <div className="flex items-start gap-2 text-slate-300"><CheckCircle2 size={20} className="text-green-500 shrink-0" /> 7 días para probar</div>
                  <div className="flex items-start gap-2 text-slate-300"><CheckCircle2 size={20} className="text-green-500 shrink-0" /> Pago seguro por Hotmart</div>
                  <div className="flex items-start gap-2 text-slate-300"><CheckCircle2 size={20} className="text-green-500 shrink-0" /> Reembolso conforme a política</div>
                </div>
                <div className="text-center md:text-left">
                  <a href="#planos" className="btn btn-primary bg-green-500 text-slate-900 font-black shadow-lg hover:-translate-y-1 inline-block">Acceder con garantía de 7 días</a>
                </div>
              </div>
            </div>
          </div>
        </section>


        {/* 12. FAQ */}
        <section className="faq inicio-section bg-slate-50 border-t border-slate-200">
          <div className="inicio-container max-w-3xl mx-auto">
            <h2 className="section-title text-center text-slate-900 mb-10">Preguntas Frecuentes</h2>
            
            <div className="flex flex-col gap-4">
              {[
                {
                  q: "¿Esto es un pack o una plataforma?",
                  a: "Es una plataforma SaaS. Incluye contenidos y materiales listos, pero también reúne IA para campañas, páginas de paquetes y CRM para organizar leads y cotizaciones."
                },
                {
                  q: "Soy una agencia pequeña. ¿Esto sirve para mí?",
                  a: "Sí. Fue pensada especialmente para agencias pequeñas y asesores independientes que necesitan presentar ofertas con más confianza sin contratar diseñador, redactor, CRM y constructor de páginas por separado."
                },
                {
                  q: "¿Necesito saber diseño?",
                  a: "No. La plataforma fue creada para facilitar la creación de contenidos, páginas y textos sin depender de conocimientos técnicos. Tú partes de estructuras listas y ajustas la oferta."
                },
                {
                  q: "¿Funciona para vender por WhatsApp?",
                  a: "Sí. Puedes crear páginas para enviar por link, textos de seguimiento y mensajes para presentar paquetes con más claridad antes de cotizar."
                },
                {
                  q: "¿Mensual o anual?",
                  a: "El mensual cuesta US$50/mes y es ideal para probar con menor compromiso. El anual cuesta US$250/año, equivale a pagar mucho menos que 12 mensualidades y es el plan con mayor ahorro."
                },
                {
                  q: "¿Puedo pagar desde mi país (México, Colombia, Argentina, Perú, etc.)?",
                  a: "Sí. Los precios están en dólares (USD) y el pago se procesa de forma segura por Hotmart. Puedes pagar desde diferentes países con tarjeta internacional, según las opciones disponibles en el checkout."
                },
                {
                  q: "¿Qué pasa después del pago?",
                  a: "Recibes las instrucciones de acceso, entras a la plataforma, exploras los módulos y puedes empezar por anuncios, páginas, contenidos o CRM según la urgencia de tu agencia."
                },
                {
                  q: "¿Qué pasa si no me gusta?",
                  a: "Puedes probar durante 7 días. Si no tiene sentido para tu agencia, solicita el reembolso conforme a la política de garantía."
                }
              ].map((item, index) => (
                <div key={index} className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                  <button 
                    className="w-full text-left p-6 font-bold text-slate-800 flex justify-between items-center hover:bg-slate-50 transition-colors"
                    onClick={() => {
                      const ans = document.getElementById(`faq-ans-${index}`);
                      if (ans) {
                         ans.classList.toggle('hidden');
                         const icon = document.getElementById(`faq-icon-${index}`);
                         if (icon) icon.style.transform = ans.classList.contains('hidden') ? 'rotate(0deg)' : 'rotate(180deg)';
                      }
                    }}
                  >
                    {item.q}
                    <ChevronDown id={`faq-icon-${index}`} size={20} className="text-slate-400 transition-transform" />
                  </button>
                  <div id={`faq-ans-${index}`} className="hidden p-6 pt-0 text-slate-600 border-t border-slate-100 bg-slate-50/50">
                    <div className="mt-4">{item.a}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 13. CTA FINAL */}
        {/* 13. CTA FINAL */}
        <section className="final-cta bg-slate-900 py-20 border-b border-slate-800">
          <div className="inicio-container max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-5xl font-black text-white mb-6 leading-tight">La próxima oferta de tu agencia puede salir más clara, más rápida y más profesional hoy</h2>
            <p className="text-lg md:text-xl text-slate-300 mb-10 max-w-3xl mx-auto">Elige un plan, entra con acceso inmediato y usa la garantía de 7 días para validar TravelMarketing con un paquete real de tu agencia.</p>
            <a href="#planos" className="btn btn-primary text-xl py-5 px-12 shadow-[0_0_30px_rgba(124,58,237,0.4)] hover:-translate-y-1 inline-block">Probar 7 días con garantía</a>
            <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 text-sm font-medium text-slate-400 mt-6">
              <div className="flex items-center gap-1.5"><ShieldCheck size={16} className="text-green-400"/> Acceso inmediato</div>
              <span className="hidden sm:inline">•</span>
              <div className="flex items-center gap-1.5">Pago seguro en USD</div>
              <span className="hidden sm:inline">•</span>
              <div className="flex items-center gap-1.5">Garantía de 7 días</div>
            </div>
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
              <a href={supportWhatsAppUrl} target="_blank" rel="noopener noreferrer" className="footer-contact-link footer-whatsapp">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
                WhatsApp Soporte
              </a>
            </div>
          </div>
          
          <div className="footer-links">
            <a href="/termos">Términos de Uso</a>
            <a href="/privacidade">Política de Privacidad</a>
            <a href="/termos">Política de Reembolso</a>
            <a href="mailto:soporte@travelmarketing.com">Contacto</a>
          </div>
        </div>
        <div className="inicio-container">
           <div className="payment-safe">
             <ShieldCheck size={16} /> Acceso inmediato • Pago seguro en USD • Garantía de 7 días
           </div>
        </div>
      </footer>

      {/* FIXED MOBILE CTA */}
      <div className="mobile-sticky fixed bottom-0 left-0 w-full bg-slate-900 border-t border-slate-800 p-4 shadow-[0_-20px_30px_rgba(0,0,0,0.3)] z-50 md:hidden flex items-center justify-between gap-3">
        <span className="text-sm font-bold text-white leading-tight flex-1">Accede con garantía de 7 días</span>
        <a href="#planos" className="btn btn-primary px-6 py-3 shrink-0 text-sm font-black shadow-lg w-auto">Quiero acceder</a>
      </div>
</div>
  );
}
