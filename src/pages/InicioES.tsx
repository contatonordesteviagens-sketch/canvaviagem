import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, ChevronDown, ChevronUp, ArrowRight, Play, Star, ShieldCheck } from 'lucide-react';
import { MetaPixel916689227676142 } from '@/components/MetaPixel916689227676142';

import lucasPortrait from "@/assets/lucas-ferrari-portrait.webp";
import depoimento1 from "@/assets/depoimento1.jpg";
import depoimento2 from "@/assets/depoimento2.png";
import depoimento3 from "@/assets/depoimento3.jpg";
import siteCanvaViagem from "@/assets/site_canva_viagem.webp";
import logoImage from "@/assets/logo.png";

// Import local premium tools showcase images
import showcaseAdCreation from "@/assets/images/showcase-ad-creation.png";
import showcaseLandingPages from "@/assets/images/showcase-landing-pages.png";
import showcaseCrm from "@/assets/images/showcase-crm.png";
import showcaseScheduler from "@/assets/images/showcase-scheduler.png";
import showcasePremiumMedias from "@/assets/images/showcase-premium-medias.png";

export default function InicioES() {
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "annual">("annual");
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [activeFeature, setActiveFeature] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<number>(0);
  const [activeToolTab, setActiveToolTab] = useState<string>("featured");
  const [mutedActive, setMutedActive] = useState(true);
  const [carouselIndex, setCarouselIndex] = useState(0);

  const eliteFeatures = [
    {
      title: "Fábrica de Anuncios Ilimitada",
      desc: "Crea campañas y ofertas irresistibles en segundos. Ingresa el destino, precio y cuotas, y nuestra inteligencia artificial generará el anuncio completo con tu identidad visual, listo para atraer a viajeros de alto nivel."
    },
    {
      title: "Sitios de Ventas e Itinerarios",
      desc: "Crea plantillas profesionales y mantén la uniformidad de los elementos de tu marca con solo un clic. Aplica tus colores, fuentes y logotipos a todo tu contenido en instantes."
    },
    {
      title: "Más de 400 Medios 4K Exclusivos",
      desc: "Desbloquees herramientas de IA y recursos que agilizan la creación de contenido. Genera diseños en lote, realiza personalizaciones en segundos y publica contenido destacado en redes sociales."
    },
    {
      title: "Leyendas Magnéticas con IA",
      desc: "Haz todo de principio a fin con Canva Travel Elite. Realiza lluvias de ideas, crea contenido personalizado, imprime materiales y comparte tu trabajo, todo conectado con tus flujos de trabajo existentes."
    }
  ];

  const checkout = (planId: string) => {
    const STRIPE: Record<string, string> = {
      smart_monthly: "https://buy.stripe.com/eVqeVe61Q3Es9mPbF28so0h",
      smart_annual: "https://buy.stripe.com/aFaaEY61Q2AoeH94cA8so0g",
      elite_monthly: "https://buy.stripe.com/cNi00k2PEfna2Yr10o8so0f",
      elite_annual: "https://buy.stripe.com/dRm3cweymgre9mPbF28so0e",
    };
    const targetUrl = STRIPE[planId] || "/es/planos";
    if (targetUrl.startsWith("http")) {
      try {
        const url = new URL(targetUrl);
        const params = new URLSearchParams(window.location.search);
        params.forEach((value, key) => url.searchParams.append(key, value));
        window.location.href = url.toString();
      } catch (e) {
        window.location.href = targetUrl;
      }
    } else {
      window.location.href = targetUrl;
    }
  };

  const faqs = [
    { q: "¿Cuánto tiempo necesito al día?", a: "En promedio de 5 a 10 minutos. Eliges el video del destino, lo abres en Canva, cambias tu logo y lo publicas. Quien usa el calendario listo hace un lote semanal de 30 minutos y queda libre toda la semana." },
    { q: "¿Funciona si no conozco Canva?", a: "Sí, las plantillas ya están 100% listas. Solo es cuestión de arrastrar y soltar." },
    { q: "¿Puedo usarlo comercialmente?", a: "Sí, todos los recursos tienen licencia comercial para tu agencia de viajes." },
    { q: "¿Qué sucede si cancelo? ¿Pierdo los videos descargados?", a: "No, todo lo que ya hayas descargado y publicado sigue siendo tuyo." },
    { q: "¿Hay soporte en español por WhatsApp?", a: "Sí, ofrecemos soporte directo y rápido en español vía WhatsApp." },
    { q: "¿Son exclusivos los videos?", a: "Tenemos una vasta biblioteca enfocada en agencias, constantemente actualizada para mantener la exclusividad." },
    { q: "¿Cuál es la diferencia entre el paquete individual de Hotmart?", a: "Aquí no recibes solo un paquete estático, sino actualizaciones semanales, la Fábrica de Anuncios con IA y soporte premium." },
    { q: "¿Funciona para agencias pequeñas (1 persona)?", a: "Es perfecto para agencias de 1 persona. Funciona como tu propio departamento de marketing en piloto automático." },
  ];

  return (
    <div className="w-full min-h-screen bg-white text-[#0e1318] font-sans overflow-x-hidden selection:bg-[#8b3dff] selection:text-white">
      <Helmet>
        <title>Canva Travel Elite | Marketing para Agencias de Turismo</title>
      </Helmet>
      <MetaPixel916689227676142 />

      {/* HEADER NAVBAR (Canva Style) */}
      <header className="fixed top-0 left-0 w-full h-[64px] bg-white border-b border-[#d4d8db] z-50 flex items-center px-6 justify-between shadow-sm">
        <div className="flex items-center gap-2">
          {/* Logo oficial do Canva Viagem */}
          <img 
            src={logoImage} 
            alt="Canva Travel Logo" 
            className="w-10 h-10 object-contain rounded-xl hover:scale-105 transition-transform duration-200 cursor-pointer" 
          />
        </div>
        <div className="hidden md:flex items-center gap-6">
          <a href="#como-funciona" className="text-sm font-semibold hover:text-[#8b3dff]">Cómo funciona</a>
          <a href="#comparativo" className="text-sm font-semibold hover:text-[#8b3dff]">Comparativa</a>
          <a href="#planos" className="text-sm font-semibold hover:text-[#8b3dff]">Planes y precios</a>
          <button onClick={() => { document.getElementById('planos')?.scrollIntoView({ behavior: 'smooth' }) }} className="bg-[#8b3dff] hover:bg-[#7b32e6] text-white px-4 py-2 rounded-md text-sm font-bold transition-colors">
            Acceso inmediato
          </button>
        </div>
      </header>

      {/* HERO SECTION (Canva Pro Vibe) */}
      <section className="pt-32 pb-24 px-6 relative max-w-none w-full bg-gradient-to-br from-[#6b11ff] via-[#8b3dff] to-[#00d2ff] flex flex-col md:flex-row items-center justify-center gap-12 overflow-hidden">
        
        {/* Container limitador igual ao max-w-6xl */}
        <div className="max-w-6xl w-full mx-auto flex flex-col md:flex-row items-center gap-12 relative z-10">
          
          <div className="flex-1 text-center md:text-left text-white">
            <h1 className="text-4xl md:text-[56px] font-bold leading-[1.1] mb-6 text-white tracking-tight">
              Profesionaliza tu agencia de viajes en minutos con IA
            </h1>
            <p className="text-lg md:text-xl text-white/90 mb-8 leading-relaxed max-w-2xl font-medium">
              Una solución completa para crear anuncios, publicaciones, sitio web y gestionar tus clientes. Herramientas y funciones de IA para agentes que impulsan la venta de viajes.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center gap-4 justify-center md:justify-start">
              <button onClick={() => { document.getElementById('planos')?.scrollIntoView({ behavior: 'smooth' }) }} className="bg-white hover:bg-gray-100 text-[#0e1318] px-4 py-2.5 rounded-md text-[15px] font-semibold transition-colors shadow-sm w-full sm:w-auto text-center">
                Regístrate ahora en Canva Travel Elite
              </button>
            </div>

            <div className="mt-8 flex flex-wrap items-center justify-center md:justify-start gap-x-6 gap-y-3 text-sm text-white/80 font-medium">
              <div className="flex items-center gap-1">
                <div className="flex text-[#ffb400]"><Star className="w-4 h-4 fill-current"/><Star className="w-4 h-4 fill-current"/><Star className="w-4 h-4 fill-current"/><Star className="w-4 h-4 fill-current"/><Star className="w-4 h-4 fill-current"/></div>
                <span className="font-bold text-white ml-1">4.98 / 5</span> (62 reseñas)
              </div>
              <div className="flex items-center gap-1"><Check className="w-4 h-4 text-green-300"/> Cancela cuando quieras</div>
              <div className="flex items-center gap-1"><Check className="w-4 h-4 text-green-300"/> Acceso en 2 min</div>
              <div className="flex items-center gap-1"><Check className="w-4 h-4 text-green-300"/> Doble garantía</div>
            </div>
          </div>
          
          <div className="flex-1 w-full max-w-lg relative flex justify-end">
            <img src={siteCanvaViagem} alt="Plataforma Canva Travel" className="w-full h-auto rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] relative z-10 border border-white/20" />
          </div>
          
        </div>
        
        {/* Ondinha inferior do Hero */}
        <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-none">
          <svg className="relative block w-full h-[60px]" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V120H0V95.8C59.71,118.08,130.83,119.5,193,109.84,235.8,103.14,279.7,85.25,321.39,56.44Z" className="fill-[#f7f9fa]"></path>
          </svg>
        </div>
      </section>
      
      {/* COMO A IA CRIA SEU ANÚNCIO */}
      <section className="py-20 px-6 bg-[#f7f9fa]">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-[12px] font-bold text-[#8b3dff] tracking-[0.2em] uppercase mb-4">Haz crecer tu agencia a la máxima velocidad</h2>
          <h3 className="text-3xl md:text-5xl font-bold mb-6">Cómo la IA crea todo para tu agencia</h3>
          <p className="text-lg text-[#405466] mb-12">Hace el trabajo de un equipo completo de marketing digital en solo unos clics:</p>

          {/* Bloco de Vídeo Premium */}
          <div className="max-w-[800px] mx-auto text-center w-full mb-16">
            <h4 className="text-xl font-extrabold mb-6 text-[#0f172a]">
              Descubre cómo la herramienta crea todo para tu agencia de viajes
            </h4>
            
            <div className="relative w-full pt-[56.25%] rounded-3xl overflow-hidden border-2 border-[#8b3dff]/30 shadow-2xl shadow-[#8b3dff]/15 bg-black">
              {mutedActive ? (
                <>
                  <iframe
                    className="absolute top-0 left-0 w-full h-full pointer-events-none"
                    style={{ width: '100%', height: '100%', border: 0 }}
                    src="https://www.youtube.com/embed/P0_4EdEOQAc?autoplay=1&mute=1&controls=0&loop=1&playlist=P0_4EdEOQAc&modestbranding=1&rel=0&iv_load_policy=3&showinfo=0"
                    allow="autoplay; encrypted-media"
                    title="Cómo la IA crea todo"
                  />
                  
                  {/* Overlay com botão para ativar o áudio do vídeo */}
                  <div 
                    onClick={() => setMutedActive(false)}
                    className="absolute inset-0 bg-black/45 flex flex-col items-center justify-center gap-4 cursor-pointer transition-all duration-300 hover:bg-black/35"
                  >
                    <div className="absolute top-5 bg-black/85 border border-[#8b3dff]/30 rounded-full px-4.5 py-1.5 text-[11px] font-extrabold text-[#8b3dff] flex items-center gap-2">
                      <span className="inline-block w-1.5 h-1.5 bg-[#8b3dff] rounded-full animate-pulse" />
                      VER CON SONIDO (HAZ CLIC PARA ACTIVAR)
                    </div>

                    <div className="hover:scale-105 active:scale-95 transition-all animate-bounce duration-[2200ms] flex items-center gap-3 bg-[#8b3dff] hover:bg-[#7b32e6] text-white font-black text-sm px-8 py-4 rounded-full shadow-lg shadow-[#8b3dff]/40">
                      <Play size={16} fill="#ffffff" />
                      ACTIVAR AUDIO Y VIDEO
                    </div>
                  </div>
                </>
              ) : (
                <iframe
                  className="absolute top-0 left-0 w-full h-full"
                  style={{ width: '100%', height: '100%', border: 0 }}
                  src="https://www.youtube.com/embed/P0_4EdEOQAc?autoplay=1&mute=0&controls=1&modestbranding=1&rel=0"
                  allow="autoplay; encrypted-media"
                  allowFullScreen
                  title="Cómo la IA crea todo"
                />
              )}
            </div>
          </div>

          {/* Passos de Escala (embaixo do vídeo) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              { n: "1", t: "TÚ ESCRIBES", d: "El nombre de tu agencia, el paquete de viaje y el precio." },
              { n: "2", t: "LA IA TE PROPORCIONA", d: "Diseño del anuncio, sitio web y plan de acción con videos para publicar sobre los destinos." },
              { n: "3", t: "PUBLICA Y APLICA", d: "Directamente en tu dispositivo con todo listo para vender viajes." }
            ].map((s, i) => (
              <div key={i} className="text-center">
                <div className="w-16 h-16 rounded-full bg-[#e8f1ff] text-[#8b3dff] flex items-center justify-center text-2xl font-bold mx-auto mb-6">
                  {s.n}
                </div>
                <h4 className="text-xl font-bold mb-3">{s.t}</h4>
                <p className="text-[#405466]">{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── SHOWCASE SECTION: FERRAMENTAS PROFISSIONAIS (3rd Fold) ─── */}
      <section className="py-24 px-6 bg-white border-b border-[#e5e7eb]">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4">
            Herramientas profesionales para cada tarea
          </h2>
          <p className="text-[#64748b] text-base md:text-lg max-w-3xl mx-auto mb-12">
            Ya sea para un trabajo secundario o un proyecto personal, Canva Travel Elite te ofrece acceso a funciones Pro y herramientas avanzadas de IA para que puedas crear contenido profesional más rápido, todo en un solo lugar.
          </p>

          {/* Navigation Tabs (Pills) */}
          <div className="flex flex-wrap justify-center gap-2 mb-16">
            {[
              { id: "featured", label: "Destacado" },
              { id: "social", label: "Redes sociales" },
              { id: "video", label: "Videos" },
              { id: "photo", label: "Fotos y diseños" },
              { id: "ai", label: "Inteligencia artificial" },
              { id: "texts", label: "Texto y contratos" }
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
            {/* Tab: Destacado */}
            {activeToolTab === "featured" && (
              <>
                {/* 1. Criação de anúncio com IA */}
                <div className="bg-[#f8fafc] border border-[#e2e8f0] rounded-3xl p-6 flex flex-col hover:shadow-lg transition-all duration-300">
                  <div>
                    <div className="w-full aspect-[4/3] rounded-2xl overflow-hidden mb-6 border border-[#e2e8f0]">
                      <img src={showcaseAdCreation} alt="Creación de anuncios con IA" className="w-full h-full object-cover" />
                    </div>
                    <h3 className="text-xl font-bold text-[#0f172a] mb-2 text-left flex items-center gap-2">
                      <span className="text-[#8b3dff]">⚡</span> Creación de anuncios con IA
                    </h3>
                    <p className="text-[#64748b] text-sm text-left leading-relaxed">
                      Crea campañas y ofertas irresistibles en segundos. Ingresa el destino, el precio y las cuotas, y nuestra inteligencia artificial generará el anuncio completo con tu identidad visual, listo para atraer a viajeros de alto nivel.
                    </p>
                  </div>
                </div>

                {/* 2. Construtor de sites */}
                <div className="bg-[#f8fafc] border border-[#e2e8f0] rounded-3xl p-6 flex flex-col hover:shadow-lg transition-all duration-300">
                  <div>
                    <div className="w-full aspect-[4/3] rounded-2xl overflow-hidden mb-6 border border-[#e2e8f0]">
                      <img src={showcaseLandingPages} alt="Creador de sitios web" className="w-full h-full object-cover" />
                    </div>
                    <h3 className="text-xl font-bold text-[#0f172a] mb-2 text-left flex items-center gap-2">
                      <span className="text-[#8b3dff]">🌐</span> Creador de sitios web
                    </h3>
                    <p className="text-[#64748b] text-sm text-left leading-relaxed">
                      Crea plantillas profesionales para páginas de destino de ventas e itinerarios de viaje completos en un instante. Aplica tus colores, fuentes y logotipos con un solo clic para impresionar a tus clientes potenciales y vender paquetes más rápido.
                    </p>
                  </div>
                </div>

                {/* 3. CRM para gestão de clientes */}
                <div className="bg-[#f8fafc] border border-[#e2e8f0] rounded-3xl p-6 flex flex-col hover:shadow-lg transition-all duration-300">
                  <div>
                    <div className="w-full aspect-[4/3] rounded-2xl overflow-hidden mb-6 border border-[#e2e8f0]">
                      <img src={showcaseCrm} alt="CRM para la Gestión de Clientes" className="w-full h-full object-cover" />
                    </div>
                    <h3 className="text-xl font-bold text-[#0f172a] mb-2 text-left flex items-center gap-2">
                      <span className="text-[#8b3dff]">📊</span> CRM para la Gestión de Clientes
                    </h3>
                    <p className="text-[#64748b] text-sm text-left leading-relaxed">
                      Organiza tus conversaciones, gestiona el embudo de ventas de paquetes turísticos y controla todo el historial de contactos y contratos de tu agencia en un único sistema práctico e intuitivo.
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
                    <h3 className="text-xl font-bold text-[#0f172a] mb-2 text-left flex items-center gap-2">
                      <span className="text-[#8b3dff]">📅</span> Calendario de publicaciones
                    </h3>
                    <p className="text-[#64748b] text-sm text-left leading-relaxed">
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
                    <h3 className="text-xl font-bold text-[#0f172a] mb-2 text-left flex items-center gap-2">
                      <span className="text-[#8b3dff]">✨</span> Más de 400 medios exclusivos
                    </h3>
                    <p className="text-[#64748b] text-sm text-left leading-relaxed">
                      Acceso completo al catálogo de plantillas listas para publicaciones en el feed, stories editables, leyendas y creativos. Todo perfectamente diseñado para enganchar a tu audiencia en redes.
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
                      <img src="/images/LOC_MarTechB2C_CanvaPro_LandingPage_PremiumVideoTemplates_Small_pt-BR.png" alt="Más de 300 vídeos de Reels de destinos" className="w-full h-full object-cover" />
                    </div>
                    <h3 className="text-xl font-bold text-[#0f172a] mb-2 text-left flex items-center gap-2">
                      <span className="text-[#8b3dff]">🎥</span> Más de 300 vídeos de Reels
                    </h3>
                    <p className="text-[#64748b] text-sm text-left leading-relaxed">
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
                    <h3 className="text-xl font-bold text-[#0f172a] mb-2 text-left flex items-center gap-2">
                      <span className="text-[#8b3dff]">💬</span> Guiones y textos para videos
                    </h3>
                    <p className="text-[#64748b] text-sm text-left leading-relaxed">
                      Ten acceso a guiones detallados y ganchos persuasivos para tus videos Reels. Aprende cómo captar la atención del cliente y generar más mensajes directos queriendo cerrar viajes.
                    </p>
                  </div>
                </div>

                {/* 3. Acesso Fácil via Google Drive */}
                <div className="bg-[#f8fafc] border border-[#e2e8f0] rounded-3xl p-6 flex flex-col hover:shadow-lg transition-all duration-300">
                  <div>
                    <div className="w-full aspect-[4/3] rounded-2xl overflow-hidden mb-6 border border-[#e2e8f0]">
                      <img src="/images/Whiteboard_ProTemplates_Desktop_2x_pt-BR.png" alt="Acceso a Google Drive" className="w-full h-full object-cover" />
                    </div>
                    <h3 className="text-xl font-bold text-[#0f172a] mb-2 text-left flex items-center gap-2">
                      <span className="text-[#8b3dff]">📥</span> Descarga vía Google Drive
                    </h3>
                    <p className="text-[#64748b] text-sm text-left leading-relaxed">
                      Todos los archivos de video están alojados y organizados de forma profesional en Google Drive. Descarga los medios en 4K y HD con un solo clic directamente en tu celular o escritorio.
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
                      <img src="/images/ArtistCollection_small_pt-BR.png" alt="Diseños listos para el Feed" className="w-full h-full object-cover" />
                    </div>
                    <h3 className="text-xl font-bold text-[#0f172a] mb-2 text-left flex items-center gap-2">
                      <span className="text-[#8b3dff]">🎨</span> Diseños listos para el Feed
                    </h3>
                    <p className="text-[#64748b] text-sm text-left leading-relaxed">
                      Modelos profesionales listos de carruseles y publicaciones estáticas con diseños de ofertas y textos explicativos. Perfectos para mantener tu feed sofisticado y armónico.
                    </p>
                  </div>
                </div>

                {/* 2. Stories interativos para Instagram */}
                <div className="bg-[#f8fafc] border border-[#e2e8f0] rounded-3xl p-6 flex flex-col hover:shadow-lg transition-all duration-300">
                  <div>
                    <div className="w-full aspect-[4/3] rounded-2xl overflow-hidden mb-6 border border-[#e2e8f0]">
                      <img src="/images/Spotlight_Disney_Mobile.png" alt="Historias interactivas" className="w-full h-full object-cover" />
                    </div>
                    <h3 className="text-xl font-bold text-[#0f172a] mb-2 text-left flex items-center gap-2">
                      <span className="text-[#8b3dff]">📱</span> Historias interactivas
                    </h3>
                    <p className="text-[#64748b] text-sm text-left leading-relaxed">
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
                      <img src="/images/PRO25001_JTBD_Section_Brand_Tab_Magic_Write.png" alt="Asistente virtual de ventas de viajes con IA" className="w-full h-full object-cover" />
                    </div>
                    <h3 className="text-xl font-bold text-[#0f172a] mb-2 text-left flex items-center gap-2">
                      <span className="text-[#8b3dff]">👑</span> Asistente virtual de ventas de viajes con IA
                    </h3>
                    <p className="text-[#64748b] text-sm text-left leading-relaxed">
                      El asistente virtual definitivo, entrenado para vender paquetes y crear ofertas exclusivas. Escribe la idea y la IA genera el texto de ventas al instante.
                    </p>
                  </div>
                </div>

                {/* 2. Agentes de IA para Marketing */}
                <div className="bg-[#f8fafc] border border-[#e2e8f0] rounded-3xl p-6 flex flex-col hover:shadow-lg transition-all duration-300">
                  <div>
                    <div className="w-full aspect-[4/3] rounded-2xl overflow-hidden mb-6 border border-[#e2e8f0]">
                      <img src="/images/LOC_MarTechB2C_CanvaPro_LandingPage_AIAdCreation_Small_pt-BR.png" alt="Agentes de IA para Marketing" className="w-full h-full object-cover" />
                    </div>
                    <h3 className="text-xl font-bold text-[#0f172a] mb-2 text-left flex items-center gap-2">
                      <span className="text-[#8b3dff]">🤖</span> Agentes de IA para Marketing
                    </h3>
                    <p className="text-[#64748b] text-sm text-left leading-relaxed">
                      Agiliza tu producción de contenido con asistentes de IA para escribir descripciones y títulos que venden paquetes turísticos sin esfuerzo.
                    </p>
                  </div>
                </div>

                {/* 3. Gerador Inteligente de Roteiros */}
                <div className="bg-[#f8fafc] border border-[#e2e8f0] rounded-3xl p-6 flex flex-col hover:shadow-lg transition-all duration-300">
                  <div>
                    <div className="w-full aspect-[4/3] rounded-2xl overflow-hidden mb-6 border border-[#e2e8f0]">
                      <img src="/images/PRO25001_JTBD_Section_Spotlight_Tab_Style_Match.png" alt="Generador de itinerarios con IA" className="w-full h-full object-cover" />
                    </div>
                    <h3 className="text-xl font-bold text-[#0f172a] mb-2 text-left flex items-center gap-2">
                      <span className="text-[#8b3dff]">🗺️</span> Generador de itinerarios con IA
                    </h3>
                    <p className="text-[#64748b] text-sm text-left leading-relaxed">
                      Crea propuestas de viaje e itinerarios completos día a día sumamente detallados y personalizados para el perfil de cada cliente en segundos.
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
                    <h3 className="text-xl font-bold text-[#0f172a] mb-2 text-left flex items-center gap-2">
                      <span className="text-[#8b3dff]">✍️</span> Leyendas listas
                    </h3>
                    <p className="text-[#64748b] text-sm text-left leading-relaxed">
                      Centenas de leyendas perfectamente estructuradas con disparadores mentales listos para que copies, pegues y apliques en las fotos o Reels de tu feed.
                    </p>
                  </div>
                </div>

                {/* 2. Textos de Ofertas Validadas */}
                <div className="bg-[#f8fafc] border border-[#e2e8f0] rounded-3xl p-6 flex flex-col hover:shadow-lg transition-all duration-300">
                  <div>
                    <div className="w-full aspect-[4/3] rounded-2xl overflow-hidden mb-6 border border-[#e2e8f0]">
                      <img src="/images/LOC_MarTechB2C_CanvaPro_LandingPage_AdInspiration_Small_pt-BR.png" alt="Textos de ofertas" className="w-full h-full object-cover" />
                    </div>
                    <h3 className="text-xl font-bold text-[#0f172a] mb-2 text-left flex items-center gap-2">
                      <span className="text-[#8b3dff]">💰</span> Textos de ofertas
                    </h3>
                    <p className="text-[#64748b] text-sm text-left leading-relaxed">
                      Copywriting de alta performance validado por agencias para ofertas especiales y campañas de cierre de paquetes de viaje.
                    </p>
                  </div>
                </div>

                {/* 3. Contratos de Viagens Valizados */}
                <div className="bg-[#f8fafc] border border-[#e2e8f0] rounded-3xl p-6 flex flex-col hover:shadow-lg transition-all duration-300">
                  <div>
                    <div className="w-full aspect-[4/3] rounded-2xl overflow-hidden mb-6 border border-[#e2e8f0]">
                      <img src="/images/PRO25001_JTBD_Section_Print_Tab_Disney_Collection.png" alt="Modelos de contratos" className="w-full h-full object-cover" />
                    </div>
                    <h3 className="text-xl font-bold text-[#0f172a] mb-2 text-left flex items-center gap-2">
                      <span className="text-[#8b3dff]">📄</span> Modelos de contratos
                    </h3>
                    <p className="text-[#64748b] text-sm text-left leading-relaxed">
                      Modelos listos y jurídicamente estructurados de contratos de intermediación de viajes y prestación de servicios para dar total seguridad jurídica a tu negocio.
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </section>

      {/* QUEM ESTÁ POR TRÁS */}
      <section className="py-24 px-6 max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row items-center gap-16">
          <div className="flex-1">
            <h2 className="text-3xl md:text-5xl font-bold mb-6">¿Quién está detrás?</h2>
            <h3 className="text-2xl font-semibold mb-4 text-[#8b3dff]">Lucas Ferrari</h3>
            <p className="text-lg text-[#405466] mb-6 leading-relaxed">
              Soy Lucas Ferrari. Dirigí una agencia de viajes y trabajé en marketing para otras agencias durante 10 años, cerré ventas online de más de R$ 4 millones para mi agencia y mis clientes, y creé Canva Viagem porque lo necesitaba y no lo encontraba.
            </p>
            <a href="https://instagram.com/lucasferrari.pro" target="_blank" rel="noreferrer" className="inline-flex items-center text-[#8b3dff] font-bold hover:underline mb-12">
              Sígueme en Instagram <ArrowRight className="w-4 h-4 ml-1" />
            </a>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
              <div>
                <div className="font-bold text-xl mb-1">10 años</div>
                <div className="text-sm text-[#405466]">de experiencia trabajando con agencias de viajes emisoras y receptivas</div>
              </div>
              <div>
                <div className="font-bold text-xl mb-1">64.000</div>
                <div className="text-sm text-[#405466]">seguidores en Instagram @lucasferrari.pro</div>
              </div>
              <div>
                <div className="font-bold text-xl mb-1">1ª plataforma</div>
                <div className="text-sm text-[#405466]">¡La primera plataforma de marketing integral para viajes y turismo del mundo!</div>
              </div>
            </div>
          </div>
          <div className="w-full md:w-[400px]">
            {lucasPortrait && <img src={lucasPortrait} alt="Lucas Ferrari" className="w-full rounded-2xl shadow-xl" />}
          </div>
        </div>
      </section>

      {/* COMO FUNCIONA */}
      <section id="como-funciona" className="py-24 px-6 bg-white">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-[12px] font-bold text-[#8b3dff] tracking-[0.2em] uppercase mb-4">Cómo funciona</h2>
          <h3 className="text-3xl md:text-5xl font-bold mb-16">3 pasos. 5 minutos. Publica en directo.</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              { n: "1", title: "ELIGE", desc: "Más de 250 vídeos en 4K por destino. Maragogi, Caribe, Europa — actualizados semanalmente." },
              { n: "2", title: "PERSONALIZAR", desc: "Abre en Canva, cambia el logo y ajusta el color de la marca. Listo en 2 minutos." },
              { n: "3", title: "PUBLICAR", desc: "Calendario prediseñado + scripts de WhatsApp para convertir mensajes directos en paquetes vendidos." }
            ].map((s, i) => (
              <div key={i} className="text-left">
                <div className="text-5xl font-black text-[#f2f3f5] mb-2">{s.n}</div>
                <h4 className="text-xl font-bold mb-3">{s.title}</h4>
                <p className="text-[#405466] leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* RESULTADOS REAIS */}
      <section className="py-24 px-6 bg-[#f7f9fa]">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-[12px] font-bold text-[#8b3dff] tracking-[0.2em] uppercase mb-4">Prueba irrefutable en el mundo real</h2>
          <h3 className="text-3xl md:text-5xl font-bold mb-6">¿Quién lo logró en 30 días?</h3>
          <p className="text-lg text-[#405466] mb-16">Resultados directos en WhatsApp para quienes lo usan.</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                agency: "Guía de Dubái en Español",
                messages: [
                  { sender: "client", text: "Lucas, menos de 24 horas y tuve la primera venta para Disney, con más de mil de comisión, usando los anuncios que enseñas, antes solo aparecían curiosos pero no cerraba nada" },
                  { sender: "client", text: "Usé la I.A para armar el itinerario rapidito, subí el anuncio y ya vino un montón de gente escribiendo al whatsapp" },
                  { sender: "lucas", text: "Qué bueno, ahora solo queda atender rápido" },
                  { sender: "client", text: "Sí, voy a enfocarme en eso ahora" }
                ]
              },
              {
                agency: "iPlanet Viajes",
                messages: [
                  { sender: "client", text: "Lucas, quería decirte una cosa" },
                  { sender: "client", text: "Usé ese modelo de anuncio que mostraste para la promoción de vacaciones y funcionó aquí en mi ciudad" },
                  { sender: "client", text: "Gastando poco ya apareció mucha gente interesada" },
                  { sender: "client", text: "Hice 23 presupuestos solo ayer" },
                  { sender: "client", text: "Y logré cerrar 5 paquetes" },
                  { sender: "client", text: "Para mí esto ya fue un resultado que nunca había tenido antes" }
                ]
              },
              {
                agency: "Reservas Bot",
                messages: [
                  { sender: "client", text: "Este mes ya salieron varias ventas, hasta aumenté la meta del mes" },
                  { sender: "client", text: "Estoy demasiado feliz amigo, ¡gracias!" },
                  { sender: "lucas", text: "Me hace muy feliz leer esto amigo, me alegraste el día, sigue haciendo más y más que los resultados van a seguir mejorando, cuenta conmigo" },
                  { sender: "client", text: "Lo haré, voy a grabar algunos videos hablando ahora para probar" }
                ]
              }
            ].map((testimonial, i) => (
              <div key={i} className="flex flex-col rounded-2xl overflow-hidden shadow-lg border border-[#d4d8db] bg-[#0b141a] font-sans">
                {/* Header de WhatsApp */}
                <div className="bg-[#202c33] px-4 py-3 border-b border-[#2a3942] flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#6b11ff] to-[#00d2ff] flex items-center justify-center text-white font-bold text-lg shadow-sm">
                    {testimonial.agency.charAt(0)}
                  </div>
                  <div className="text-left flex-1">
                    <div className="text-[#e9edef] font-semibold text-sm truncate">{testimonial.agency}</div>
                    <div className="text-[#8696a0] text-xs">en línea</div>
                  </div>
                </div>
                {/* Cuerpo del Chat */}
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
        </div>
      </section>

      {/* COMPARATIVO HONESTO */}
      <section id="comparativo" className="py-24 px-6 bg-white text-black">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-[12px] font-bold text-[#8b3dff] tracking-[0.2em] uppercase mb-4">Comparación honesta</h2>
            <h3 className="text-3xl md:text-5xl font-bold mb-6">Descubre dónde tu dinero rinde más</h3>
            <p className="text-lg text-[#405466] max-w-2xl mx-auto">No te engañaremos comparándote con una agencia de diseño de $ 10,000 USD. Analiza las alternativas reales que estás considerando.</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr>
                  <th className="p-4 border-b-2 border-[#d4d8db] text-[#405466] font-medium w-1/4"></th>
                  <th className="p-4 border-b-2 border-[#d4d8db] font-bold text-[#0e1318] w-1/4">Paquete Hotmart</th>
                  <th className="p-4 border-b-2 border-[#d4d8db] font-bold text-[#0e1318] w-1/4">Designer freelancer</th>
                  <th className="p-4 border-b-2 border-[#8b3dff] font-bold text-[#8b3dff] w-1/4 bg-[#fcfaff] rounded-t-xl">LA MEJOR OPCIÓN ✅ Canva Travel</th>
                </tr>
              </thead>
              <tbody className="text-[#0e1318]">
                {[
                  { l: "Inversión", a: "$ 197 USD (pago único)", b: "$ 1500 USD/mes", c: "Desde $ 197 USD/año" },
                  { l: "Contenido", a: "150 reels fijos", b: "4–8 entregas/mes", c: "Más de 300 reels + Más de 400 medios y feeds" },
                  { l: "Actualizaciones", a: "❌ Ninguna", b: "Depende de ellas", c: "✅ Actualizaciones semanales incluidas" },
                  { l: "IA y herramientas", a: "❌ Ninguna", b: "❌ Ninguna", c: "✅ Vendedor: IA + Creador + CRM" },
                  { l: "Soporte", a: "Solo del productor", b: "1 freelancer VIP", c: "WhatsApp directo con Lucas" }
                ].map((row, i) => (
                  <tr key={i} className="border-b border-[#e5e7eb]">
                    <td className="p-4 font-semibold text-[#405466]">{row.l}</td>
                    <td className="p-4">{row.a}</td>
                    <td className="p-4">{row.b}</td>
                    <td className="p-4 bg-[#fcfaff] font-bold">{row.c}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* TRABALHE MELHOR COM A IA - SLIDER SINCRONIZADO COM FUNDO ROXO */}
      <section className="py-24 px-6 bg-gradient-to-br from-[#6b11ff] via-[#8b3dff] to-[#7d2ae8] relative text-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-[12px] font-bold text-white/80 tracking-[0.2em] uppercase mb-4">Trabaja mejor con IA</h2>
            <h3 className="text-3xl md:text-5xl font-bold mb-6 text-white">Todo lo que tu agencia necesita en un solo lugar</h3>
            <p className="text-lg text-white/90 max-w-3xl mx-auto">
              Desbloquea todas estas herramientas en tu agencia de viajes para aumentar la productividad y las ventas, todo en un solo lugar y de forma 100% integrada.
            </p>
          </div>

          {/* Carousel Slider */}
          <div className="relative w-full">
            <div className="overflow-hidden w-full rounded-3xl py-2">
              <div 
                className="flex gap-6 transition-transform duration-500 ease-in-out"
                style={{ 
                  transform: `translateX(-${carouselIndex * (100 / 3)}%)`
                }}
              >
                {[
                  {
                    title: "Creación de anuncios con IA",
                    desc: "Crea campañas y ofertas irresistibles en segundos. Nuestra IA genera el anuncio completo con tu identidad visual, listo para atraer a viajeros de alto nivel.",
                    img: showcaseAdCreation,
                    badge: "⚡"
                  },
                  {
                    title: "Creador de sitios web",
                    desc: "Crea plantillas profesionales para páginas de destino de ventas e itinerarios de viaje completos en cuestión de segundos. Aplica tus colores, fuentes y logotipos con un solo clic.",
                    img: siteCanvaViagem,
                    badge: "🌐"
                  },
                  {
                    title: "CRM para la gestión de clientes",
                    desc: "Organiza tus conversaciones, gestiona el embudo de ventas de paquetes de viaje y controla todo el historial de contactos en un sistema práctico.",
                    img: showcaseCrm,
                    badge: "📊"
                  },
                  {
                    title: "Asistente virtual de ventas de viajes con IA",
                    desc: "El asistente virtual definitivo, entrenado para vender paquetes y crear ofertas exclusivas. Escribe la idea y la IA genera el texto de ventas al instante.",
                    img: "/images/PRO25001_JTBD_Section_Brand_Tab_Magic_Write.png",
                    badge: "👑"
                  },
                  {
                    title: "Más de 300 vídeos de Reels",
                    desc: "Accede a una biblioteca con cientos de vídeos cinematográficos grabados en alta definición en los mejores destinos, listos para atraer a los viajeros.",
                    img: "/images/LOC_MarTechB2C_CanvaPro_LandingPage_PremiumVideoTemplates_Small_pt-BR.png",
                    badge: "🎥"
                  },
                  {
                    title: "Gráficos para feeds listos para usar",
                    desc: "Plantillas profesionales listas para usar: carruseles y publicaciones estáticas con imágenes de ofertas y textos explicativos, 100% editables en Canva.",
                    img: "/images/ArtistCollection_small_pt-BR.png",
                    badge: "🎨"
                  },
                  {
                    title: "Historias Interactivas",
                    desc: "Aparece diariamente en las historias y aumenta tu interacción con textos de destino, cuadros de preguntas, encuestas y plantillas de alta conversión.",
                    img: "/images/Spotlight_Disney_Mobile.png",
                    badge: "📱"
                  }
                ].map((card, idx) => (
                  <div 
                    key={idx} 
                    className="bg-white border border-[#e2e8f0] rounded-3xl p-6 flex flex-col justify-between hover:shadow-2xl transition-all duration-300 w-full min-w-[280px] md:min-w-[340px] h-[480px] text-[#0e1318]"
                  >
                    <div>
                      <div className="w-full aspect-[4/3] rounded-2xl overflow-hidden mb-6 border border-[#e2e8f0] bg-gray-100">
                        <img src={card.img} alt={card.title} className="w-full h-full object-cover" />
                      </div>
                      <h4 className="text-lg font-black mb-2 text-left flex items-center gap-2">
                        <span className="text-[#8b3dff]">{card.badge}</span> {card.title}
                      </h4>
                      <p className="text-[#64748b] text-[13px] text-left leading-relaxed">
                        {card.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Slider Controls */}
            <div className="flex justify-center gap-4 mt-8">
              <button 
                onClick={() => setCarouselIndex(prev => Math.max(0, prev - 1))}
                className="w-12 h-12 rounded-full border border-white/30 text-white flex items-center justify-center hover:bg-white/10 active:scale-95 transition-all text-xl font-bold"
              >
                ←
              </button>
              <button 
                onClick={() => setCarouselIndex(prev => Math.min(4, prev + 1))}
                className="w-12 h-12 rounded-full border border-white/30 text-white flex items-center justify-center hover:bg-white/10 active:scale-95 transition-all text-xl font-bold"
              >
                →
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* PLANOS DE ASSINATURA */}
      <section id="planos" className="py-24 px-6 bg-[#f7f9fa] scroll-mt-16">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-[12px] font-bold text-[#8b3dff] tracking-[0.2em] uppercase mb-4">Acceso inmediato</h2>
            <h3 className="text-3xl md:text-5xl font-bold mb-6">Elige tu plan</h3>
            
            {/* Toggle Anual / Mensal */}
            <div className="inline-flex items-center gap-2 bg-[#e8f1ff] p-1.5 rounded-full mb-6">
              <button 
                onClick={() => setBillingPeriod("annual")}
                className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all duration-200 ${billingPeriod === "annual" ? "bg-[#8b3dff] text-white shadow-sm" : "text-[#8b3dff] hover:text-[#7b32e6]"}`}
              >
                PAGO ANUAL
              </button>
              <button 
                onClick={() => setBillingPeriod("monthly")}
                className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all duration-200 ${billingPeriod === "monthly" ? "bg-[#8b3dff] text-white shadow-sm" : "text-[#8b3dff] hover:text-[#7b32e6]"}`}
              >
                PAGO MENSUAL
              </button>
            </div>
            
            <p className="text-sm font-semibold text-[#f5222d] flex items-center justify-center gap-1.5">
              ⚠️ Precio garantizado para el primer lote hoy
            </p>
            <p className="text-xs text-[#405466] mt-2 max-w-lg mx-auto">
              Cuantas más agencias se unan, más contenido produciremos. El precio promocional actual solo se garantiza para nuevos accesos.
            </p>
          </div>

          <div className="flex flex-col md:flex-row items-stretch justify-center gap-8 max-w-4xl mx-auto">
            
            {/* PLANO START (BÁSICO) */}
            <div className="flex-1 bg-white border border-[#d4d8db] rounded-2xl p-8 flex flex-col justify-between shadow-sm">
              <div className="mb-8">
                <h4 className="text-2xl font-bold mb-2 text-[#0e1318]">PLAN BÁSICO</h4>
                <div className="flex items-baseline gap-1 mb-2 text-[#0e1318]">
                  <span className="text-2xl font-bold">$</span>
                  <span className="text-6xl font-bold">{billingPeriod === 'monthly' ? '29' : '16'}</span>
                  <span className="text-2xl font-bold">{billingPeriod === 'monthly' ? ',90' : ',41'}</span>
                  <span className="text-[#405466] text-base font-normal">USD/mes</span>
                </div>
                <p className="text-sm text-[#405466]">
                  {billingPeriod === 'monthly' ? 'Suscripción mensual recurrente' : 'Equivalente a $ 197.00 USD anuales'}
                </p>
              </div>

              <button 
                onClick={() => checkout(billingPeriod === 'monthly' ? 'smart_monthly' : 'smart_annual')}
                className="w-full py-3 rounded-md border-2 border-[#8b3dff] text-[#8b3dff] font-bold hover:bg-[#8b3dff]/5 transition-colors mb-8"
              >
                Empieza con el Plan Básico
              </button>

              <ul className="space-y-4 flex-1">
                {[
                  "Acceso ilimitado a más de 400 fuentes de contenido de viajes",
                  "Reels, Stories, imágenes para feeds de alta conversión",
                  "Plantillas de Canva prediseñadas y 100% editables",
                  "Textos y contenido para ofertas irresistibles",
                  "Influencers con IA listos para usar para promocionar",
                  "Bots con IA para responder preguntas",
                  "Soporte completo vía WhatsApp"
                ].map((f, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-[#0e1318]">
                    <Check size={18} className="text-[#0e1318] shrink-0 mt-0.5" />
                    <span>{f}</span>
                  </li>
                ))}
                {[
                  "Factory: Generador de anuncios y ofertas de viajes",
                  "Factory: Generador de sitios web de viajes de alta conversión",
                  "Diagnóstico individual y plan de acción para escalar"
                ].map((f, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-[#405466] opacity-60">
                    <X size={18} className="shrink-0 mt-0.5" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* PLANO ELITE */}
            <div className="flex-1 bg-white border-[3px] border-[#8b3dff] rounded-2xl p-8 flex flex-col relative shadow-[0_10px_30px_rgba(139,61,255,0.15)] md:-mt-4 md:mb-4">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#8b3dff] text-white px-4 py-1 rounded-full text-xs font-bold tracking-wider whitespace-nowrap">
                ⭐ RECOMENDADO PARA ESCALAR
              </div>
              
              <div className="mb-8">
                <h4 className="text-2xl font-bold mb-2 text-[#8b3dff]">PLAN ÉLITE</h4>
                <div className="flex items-baseline gap-1 mb-2 text-[#0e1318]">
                  <span className="text-2xl font-bold">$</span>
                  <span className="text-6xl font-bold">{billingPeriod === 'monthly' ? '97' : '28'}</span>
                  <span className="text-2xl font-bold">{billingPeriod === 'monthly' ? ',00' : ',91'}</span>
                  <span className="text-[#405466] text-base font-normal">USD/mes</span>
                </div>
                <p className="text-sm text-[#405466]">
                  {billingPeriod === 'monthly' ? 'Suscripción mensual recurrente' : 'Equivalente a $ 347.00 USD anuales (Ahorro considerable)'}
                </p>
              </div>

              <button 
                onClick={() => checkout(billingPeriod === 'monthly' ? 'elite_monthly' : 'elite_annual')}
                className="w-full py-3 rounded-md bg-[#8b3dff] text-white font-bold hover:bg-[#7b32e6] transition-colors mb-4 shadow-md"
              >
                Quiero el Plan Élite →
              </button>
              <div className="text-center text-xs font-semibold text-[#008a00] mb-8">
                ⚡ Acceso inmediato · Soporte garantizado
              </div>

              <ul className="space-y-4 mb-8 flex-1">
                <li className="flex items-start gap-3 text-sm font-bold text-[#8b3dff]">
                  <Check size={18} className="shrink-0 mt-0.5" />
                  <span>TODO DEL PLAN BÁSICO +</span>
                </li>
                {[
                  "Generador ilimitado de anuncios e imágenes de viajes (real) Fotos en 5 segundos",
                  "Creador automático de sitios web de ventas para cada itinerario de viaje",
                  "Generador de textos magnéticos listos para copiar y pegar",
                  "Plan de acción y lista de verificación diaria para publicaciones",
                  "Diagnóstico y plan de acción personalizados para escalar",
                  "Soporte VIP por WhatsApp directamente con Lucas Ferrari"
                ].map((f, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-[#0e1318] font-medium">
                    <Check size={18} className="text-[#8b3dff] shrink-0 mt-0.5" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>

          </div>
        </div>
      </section>

      {/* GARANTIA E DECISÃO UNIFICADA (COMPACT & PROFESSIONAL DESIGN) */}
      <section className="py-16 px-6 bg-[#f8fafc] border-t border-b border-[#e2e8f0]">
        <div className="max-w-5xl mx-auto">
          
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-[#0f172a] mb-3">
              Tu decisión sin riesgo
            </h2>
            <p className="text-base text-[#64748b] max-w-xl mx-auto">
              Al suscribirte al Plan Elite, el riesgo es 100% nuestro. Tú evalúas y decides sin complicaciones.
            </p>
          </div>

          {/* Grid principal: Lado a Lado (Garantia vs Perdas) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch mb-12">
            
            {/* Coluna 1: A Garantia Dupla */}
            <div className="bg-white border border-[#e2e8f0] p-8 rounded-2xl flex flex-col justify-between shadow-sm">
              <div>
                <div className="flex items-start justify-between gap-4 mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-[#8b3dff]/10 text-[#8b3dff] flex items-center justify-center font-bold text-lg shrink-0">
                      🛡️
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-[#0f172a]">Garantía incondicional</h3>
                      <p className="text-xs text-[#64748b]">Prueba gratuita de 7 días</p>
                      {/* Estrelas de confiança */}
                      <div className="flex items-center gap-0.5 mt-1.5">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} size={13} className="text-[#eab308] fill-[#eab308]" />
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  {/* Número 7 grande estilizado premium */}
                  <div className="relative flex items-center justify-center bg-gradient-to-br from-[#8b3dff] to-[#6d28d9] text-white w-16 h-16 rounded-2xl shadow-md shadow-[#8b3dff]/20 shrink-0">
                    <div className="text-3xl font-black tracking-tighter">7</div>
                    <div className="absolute -bottom-1.5 bg-[#eab308] text-[9px] text-[#0f172a] font-extrabold px-1.5 py-0.5 rounded-full uppercase tracking-wider">
                      días
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4 text-sm text-[#64748b]">
                  <p>
                    <strong>• 7 días para probarlo todo:</strong> Acceso completo a todas las herramientas de IA, imágenes y videos. Si no te gusta, solicita un reembolso.
                  </p>
                  <p>
                    <strong>• Satisfacción garantizada:</strong> Si la calidad de nuestra plataforma de anuncios y materiales no te convence, te reembolsaremos el 100% de tu dinero.
                  </p>
                </div>
              </div>
              
              <div className="mt-6 pt-4 border-t border-[#f1f5f9] text-xs font-bold text-[#8b3dff] flex items-center gap-1.5">
                <Check size={14} /> Riesgo cero para ti al empezar hoy
              </div>
            </div>

            {/* Coluna 2: O que você deixa de ganhar */}
            <div className="bg-white border border-[#e2e8f0] p-8 rounded-2xl flex flex-col justify-between shadow-sm">
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-[#ef4444]/10 text-[#ef4444] flex items-center justify-center font-bold text-lg">
                    📉
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-[#0f172a]">El costo de la inacción</h3>
                    <p className="text-xs text-[#ef4444]">Lo que te pierdes sin la plataforma</p>
                  </div>
                </div>
                
                <ul className="space-y-4 text-sm font-semibold">
                  <li className="flex items-start gap-2.5 text-[#64748b]">
                    <X className="w-5 h-5 text-[#ef4444] shrink-0 mt-0.5" />
                    <span>Sin Canva Travel: feed inactivo = <strong className="text-[#ef4444]">0 DMs orgánicos</strong> al mes</span>
                  </li>
                  <li className="flex items-start gap-2.5 text-[#64748b]">
                    <Check className="w-5 h-5 text-[#22c55e] shrink-0 mt-0.5" />
                    <span>1 paquete vendido a través del feed: <strong className="text-[#22c55e]">de R$ 3.500 a R$ 8.000 de ganancia</strong></span>
                  </li>
                  <li className="flex items-start gap-2.5 text-[#64748b]">
                    <Star className="w-5 h-5 text-[#8b3dff] shrink-0 fill-[#8b3dff] mt-0.5" />
                    <span>Retorno de la inversión con el plan Elite en solo 1 venta: <strong className="text-[#8b3dff]">2300% ROI</strong></span>
                  </li>
                </ul>
              </div>

              <div className="mt-6 pt-4 border-t border-[#f1f5f9] text-xs text-[#64748b] font-bold">
                💡 Un paquete de viajes vendido cubre 23 años de suscripción.
              </div>
            </div>

          </div>

          {/* Bloco de Ação Rápida */}
          <div className="max-w-2xl mx-auto text-center">
            <p className="text-sm font-bold text-[#0f172a] mb-6 leading-relaxed">
              Tu feed. Tu autoridad. Tu decisión. Cada día con un feed inactivo es un cliente que se va con la competencia.
            </p>
            
            <button 
              onClick={() => { document.getElementById('planos')?.scrollIntoView({ behavior: 'smooth' }) }} 
              className="bg-[#8b3dff] hover:bg-[#7b32e6] text-white px-8 py-3.5 rounded-xl text-base font-bold transition-all duration-200 hover:scale-[1.02] inline-block shadow-lg shadow-[#8b3dff]/20"
            >
              QUIERO ACCESO ELITE — R$ 28,91/MES →
            </button>
            <div className="text-center text-xs font-bold text-[#22c55e] mt-4 flex items-center justify-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#22c55e] animate-pulse"></span>
              Acceso en 2 min · Garantía incondicional · Cancela cuando quieras
            </div>
          </div>

        </div>
      </section>

      {/* FAQ */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-[12px] font-bold text-[#8b3dff] tracking-[0.2em] uppercase mb-4 text-center">Preguntas frecuentes</h2>
          <h3 className="text-3xl md:text-5xl font-bold mb-12 text-center">¿Tienes preguntas? Las respondemos.</h3>

          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <div key={i} className="border border-[#d4d8db] rounded-lg overflow-hidden">
                <button 
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full px-6 py-4 flex justify-between items-center bg-white hover:bg-[#f7f9fa] transition-colors text-left font-bold text-lg"
                >
                  {faq.q}
                  {openFaq === i ? <ChevronUp className="w-5 h-5 text-[#405466]" /> : <ChevronDown className="w-5 h-5 text-[#405466]" />}
                </button>
                <AnimatePresence>
                  {openFaq === i && (
                    <motion.div 
                      initial={{ height: 0 }}
                      animate={{ height: "auto" }}
                      exit={{ height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="px-6 py-4 border-t border-[#d4d8db] text-[#405466] leading-relaxed">
                        {faq.a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-[#f7f9fa] py-12 px-6 border-t border-[#d4d8db] text-center">
        <div className="max-w-4xl mx-auto">
          <div className="text-2xl font-black text-[#8b3dff] mb-6">CANVA TRAVEL</div>
          <p className="text-[#405466] text-sm mb-8 max-w-md mx-auto">La plataforma definitiva para agencias de viajes que buscan mayor visibilidad y rentabilidad.</p>
          <div className="flex justify-center gap-6 text-sm font-semibold text-[#0e1318] mb-8">
            <a href="/inicio/es" className="hover:text-[#8b3dff]">Inicio</a>
            <a href="/es/planos" className="hover:text-[#8b3dff]">Planes</a>
            <a href="/termos" className="hover:text-[#8b3dff]">Términos y condiciones</a>
            <a href="/privacidade" className="hover:text-[#8b3dff]">Privacidad</a>
            <a href="https://wa.me/558586411294" target="_blank" rel="noreferrer" className="hover:text-[#8b3dff]">Soporte</a>
          </div>
          <div className="text-xs text-[#405466] font-medium flex items-center justify-center gap-2 mb-4">
            🔒 Socio de pago oficial: <span className="font-bold text-[#8b3dff]">Stripe</span>
          </div>
          <p className="text-[#405466] text-xs">
            © 2026 Canva Travel · Todos los derechos reservados.
          </p>
        </div>
      </footer>

    </div>
  );
}
