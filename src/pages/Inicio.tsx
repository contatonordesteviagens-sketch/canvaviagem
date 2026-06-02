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

export default function Inicio() {
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "annual">("annual");
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [activeFeature, setActiveFeature] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<number>(0);
  const [activeToolTab, setActiveToolTab] = useState<string>("featured");
  const [mutedActive, setMutedActive] = useState(true);
  const [carouselIndex, setCarouselIndex] = useState(0);

  const eliteFeatures = [
    {
      title: "Fábrica de Anúncios Ilimitada",
      desc: "Crie campanhas e ofertas irresistíveis em segundos. Digite o destino, preço e parcelas, e nossa inteligência artificial gera o anúncio completo com a sua identidade visual pronta para atrair viajantes de alto padrão."
    },
    {
      title: "Sites de Vendas e Roteiros",
      desc: "Crie modelos profissionais e mantenha a uniformidade dos elementos da sua marca com apenas um clique. Aplique suas cores, fontes e logotipos em todo o seu conteúdo em instantes."
    },
    {
      title: "Mais de 400 Mídias 4K Exclusivas",
      desc: "Desbloqueie mais de 25 ferramentas de IA e recursos que agilizam a criação de conteúdo. Gere designs em lote, faça personalizações em segundos e publique conteúdo de destaque nas redes sociais."
    },
    {
      title: "Legendas Magnéticas com IA",
      desc: "Faça tudo do início ao fim com o Canva Viagem Elite. Faça brainstorming, crie conteúdo personalizado, imprima materiais e compartilhe seu trabalho, tudo conectado com seus fluxos de trabalho existentes."
    }
  ];

  const checkout = (planId: string) => {
    const STRIPE: Record<string, string> = {
      smart_monthly: "https://checkout.ticto.app/O92B5A71E",
      smart_annual: "https://checkout.ticto.app/O8EBF4E91",
      elite_monthly: "https://checkout.ticto.app/O15C50840",
      elite_annual: "https://checkout.ticto.app/OEABD4A5A",
    };
    window.location.href = STRIPE[planId] || "/planos";
  };

  const faqs = [
    { q: "Quanto tempo por dia eu preciso?", a: "Em média 5 a 10 minutos. Você escolhe o vídeo do destino, abre no Canva, troca seu logo e posta. Quem usa o calendário pronto faz um lote semanal de 30 minutos e fica liberado a semana inteira." },
    { q: "Funciona se eu não souber Canva?", a: "Sim, os modelos já estão 100% prontos. É só arrastar e soltar." },
    { q: "Posso usar comercialmente?", a: "Sim, todos os recursos têm licença comercial para sua agência de viagens." },
    { q: "E se eu cancelar, perco os vídeos baixados?", a: "Não, o que você já baixou e publicou continua sendo seu." },
    { q: "Tem suporte em português via WhatsApp?", a: "Sim, oferecemos suporte direto e rápido via WhatsApp." },
    { q: "Os vídeos são exclusivos?", a: "Temos uma vasta biblioteca focada em agências, constantemente atualizada para manter a exclusividade." },
    { q: "Qual a diferença do pack único da Hotmart?", a: "Aqui você não recebe apenas um pack estático, mas atualizações semanais, a Fábrica de Anúncios com IA e suporte premium." },
    { q: "Funciona pra agência pequena (1 pessoa)?", a: "É perfeito para agências de 1 pessoa. Funciona como seu próprio departamento de marketing em piloto automático." },
  ];

  return (
    <div className="w-full min-h-screen bg-white text-[#0e1318] font-sans overflow-x-hidden selection:bg-[#8b3dff] selection:text-white">
      <Helmet>
        <title>Canva Viagem Elite | Marketing para Agências de Turismo</title>
      </Helmet>
      <MetaPixel916689227676142 />

      {/* HEADER NAVBAR (Canva Style) */}
      <header className="fixed top-0 left-0 w-full h-[64px] bg-white border-b border-[#d4d8db] z-50 flex items-center px-6 justify-between shadow-sm">
        <div className="flex items-center gap-2">
          {/* Logo oficial do Canva Viagem */}
          <img 
            src={logoImage} 
            alt="Canva Viagem Logo" 
            className="w-10 h-10 object-contain rounded-xl hover:scale-105 transition-transform duration-200 cursor-pointer" 
          />
        </div>
        <div className="hidden md:flex items-center gap-6">
          <a href="#como-funciona" className="text-sm font-semibold hover:text-[#8b3dff]">Como funciona</a>
          <a href="#comparativo" className="text-sm font-semibold hover:text-[#8b3dff]">Comparativo</a>
          <a href="#planos" className="text-sm font-semibold hover:text-[#8b3dff]">Planos e Preços</a>
          <button onClick={() => { document.getElementById('planos')?.scrollIntoView({ behavior: 'smooth' }) }} className="bg-[#8b3dff] hover:bg-[#7b32e6] text-white px-4 py-2 rounded-md text-sm font-bold transition-colors">
            Acesso Imediato
          </button>
        </div>
      </header>

      {/* HERO SECTION (Canva Pro Vibe) */}
      <section className="pt-32 pb-24 px-6 relative max-w-none w-full bg-gradient-to-br from-[#6b11ff] via-[#8b3dff] to-[#00d2ff] flex flex-col md:flex-row items-center justify-center gap-12 overflow-hidden">
        
        {/* Container limitador igual ao max-w-6xl */}
        <div className="max-w-6xl w-full mx-auto flex flex-col md:flex-row items-center gap-12 relative z-10">
          
          <div className="flex-1 text-center md:text-left text-white">
            <h1 className="text-4xl md:text-[56px] font-bold leading-[1.1] mb-6 text-white tracking-tight">
              Torne sua agência de viagens profissional em minutos com IA
            </h1>
            <p className="text-lg md:text-xl text-white/90 mb-8 leading-relaxed max-w-2xl font-medium">
              Uma solução completa para criar anúncios, postagens, site e gerenciar seus clientes . Ferramentas de agentes IA e recursos de IA para vender viagens.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center gap-4 justify-center md:justify-start">
              <button onClick={() => { document.getElementById('planos')?.scrollIntoView({ behavior: 'smooth' }) }} className="bg-white hover:bg-gray-100 text-[#0e1318] px-4 py-2.5 rounded-md text-[15px] font-semibold transition-colors shadow-sm w-full sm:w-auto text-center">
                Assine o Canva Viagem Elite Agora
              </button>
            </div>

            <div className="mt-8 flex flex-wrap items-center justify-center md:justify-start gap-x-6 gap-y-3 text-sm text-white/80 font-medium">
              <div className="flex items-center gap-1">
                <div className="flex text-[#ffb400]"><Star className="w-4 h-4 fill-current"/><Star className="w-4 h-4 fill-current"/><Star className="w-4 h-4 fill-current"/><Star className="w-4 h-4 fill-current"/><Star className="w-4 h-4 fill-current"/></div>
                <span className="font-bold text-white ml-1">4.98 / 5</span> (62 avaliações)
              </div>
              <div className="flex items-center gap-1"><Check className="w-4 h-4 text-green-300"/> Cancele quando quiser</div>
              <div className="flex items-center gap-1"><Check className="w-4 h-4 text-green-300"/> Acesso em 2 min</div>
              <div className="flex items-center gap-1"><Check className="w-4 h-4 text-green-300"/> Garantia dupla</div>
            </div>
          </div>
          
          <div className="flex-1 w-full max-w-lg relative flex justify-end">
            <img src={siteCanvaViagem} alt="Plataforma Canva Viagem" className="w-full h-auto rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] relative z-10 border border-white/20" />
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
          <h2 className="text-[12px] font-bold text-[#8b3dff] tracking-[0.2em] uppercase mb-4">Cresça sua agência na velocidade Máxima</h2>
          <h3 className="text-3xl md:text-5xl font-bold mb-6">Como a IA cria tudo para sua agência</h3>
          <p className="text-lg text-[#405466] mb-12">Ela faz o trabalho que uma equipe de marketing digital inteira faz em poucos cliques:</p>

          {/* Bloco de Vídeo Premium */}
          <div className="max-w-[800px] mx-auto text-center w-full mb-16">
            <h4 className="text-xl font-extrabold mb-6 text-[#0f172a]">
              Veja como a ferramenta cria tudo para sua agência de viagens
            </h4>
            
            <div className="relative w-full pt-[56.25%] rounded-3xl overflow-hidden border-2 border-[#8b3dff]/30 shadow-2xl shadow-[#8b3dff]/15 bg-black">
              {mutedActive ? (
                <>
                  <iframe
                    className="absolute top-0 left-0 w-full h-full pointer-events-none"
                    style={{ width: '100%', height: '100%', border: 0 }}
                    src="https://www.youtube.com/embed/P0_4EdEOQAc?autoplay=1&mute=1&controls=0&loop=1&playlist=P0_4EdEOQAc&modestbranding=1&rel=0&iv_load_policy=3&showinfo=0"
                    allow="autoplay; encrypted-media"
                    title="Como a IA Cria Tudo"
                  />
                  
                  {/* Overlay com botão para ativar o áudio do vídeo */}
                  <div 
                    onClick={() => setMutedActive(false)}
                    className="absolute inset-0 bg-black/45 flex flex-col items-center justify-center gap-4 cursor-pointer transition-all duration-300 hover:bg-black/35"
                  >
                    <div className="absolute top-5 bg-black/85 border border-[#8b3dff]/30 rounded-full px-4.5 py-1.5 text-[11px] font-extrabold text-[#8b3dff] flex items-center gap-2">
                      <span className="inline-block w-1.5 h-1.5 bg-[#8b3dff] rounded-full animate-pulse" />
                      ASSISTIR COM SOM (CLIQUE PARA ATIVAR)
                    </div>

                    <div className="hover:scale-105 active:scale-95 transition-all animate-bounce duration-[2200ms] flex items-center gap-3 bg-[#8b3dff] hover:bg-[#7b32e6] text-white font-black text-sm px-8 py-4 rounded-full shadow-lg shadow-[#8b3dff]/40">
                      <Play size={16} fill="#ffffff" />
                      ATIVAR ÁUDIO DO VÍDEO
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
                  title="Como a IA Cria Tudo"
                />
              )}
            </div>
          </div>

          {/* Passos de Escala (embaixo do vídeo) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              { n: "1", t: "VOCÊ DIGITA", d: "Nome da sua agência, pacote de viagem e Preço." },
              { n: "2", t: "IA TE ENTREGA", d: "Artes de anúncios, Site e Plano de ação com Vídeos pra postar dos Destinos ." },
              { n: "3", t: "VOCÊ APLICA E POSTA", d: "Direto no seu dispositivo com tudo pronto vender viagens." }
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
                      <span className="text-[#8b3dff]">🎥</span> Mais de 300 vídeos Reels
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

      {/* QUEM ESTÁ POR TRÁS */}
      <section className="py-24 px-6 max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row items-center gap-16">
          <div className="flex-1">
            <h2 className="text-3xl md:text-5xl font-bold mb-6">Quem está por trás disso</h2>
            <h3 className="text-2xl font-semibold mb-4 text-[#8b3dff]">Lucas Ferrari</h3>
            <p className="text-lg text-[#405466] mb-6 leading-relaxed">
              Sou Lucas Ferrari. Operei agência de viagens e fazendo marketing para outras agências de viagens por 10 anos, fechei mais de R$ 4 milhões em pacotes vendidos online para minha agência e meus clientes, e construí o Canva Viagem porque eu mesmo precisava disso e não encontrava.
            </p>
            <a href="https://instagram.com/lucasferrari.pro" target="_blank" rel="noreferrer" className="inline-flex items-center text-[#8b3dff] font-bold hover:underline mb-12">
              Me seguir no Instagram <ArrowRight className="w-4 h-4 ml-1" />
            </a>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
              <div>
                <div className="font-bold text-xl mb-1">10 anos</div>
                <div className="text-sm text-[#405466]">operando com agências de viagens emissivas e receptivas</div>
              </div>
              <div>
                <div className="font-bold text-xl mb-1">64 mil</div>
                <div className="text-sm text-[#405466]">seguidores no Instagram @lucasferrari.pro</div>
              </div>
              <div>
                <div className="font-bold text-xl mb-1">1ª plataforma</div>
                <div className="text-sm text-[#405466]">de marketing completa para viagens e turismo do mundo!</div>
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
          <h2 className="text-[12px] font-bold text-[#8b3dff] tracking-[0.2em] uppercase mb-4">Como funciona</h2>
          <h3 className="text-3xl md:text-5xl font-bold mb-16">3 passos. 5 minutos. Post no ar.</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              { n: "1", title: "ESCOLHE", desc: "250+ vídeos 4K por destino. Maragogi, Caribe, Europa — atualizados toda semana." },
              { n: "2", title: "PERSONALIZA", desc: "Abre no Canva, troca o logo, ajusta a cor da marca. Em 2 minutos está pronto." },
              { n: "3", title: "POSTA", desc: "Calendário pronto + scripts de WhatsApp para converter o DM em pacote vendido." }
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
          <h2 className="text-[12px] font-bold text-[#8b3dff] tracking-[0.2em] uppercase mb-4">Prova real indiscutível</h2>
          <h3 className="text-3xl md:text-5xl font-bold mb-6">Quem virou a chave em 30 dias</h3>
          <p className="text-lg text-[#405466] mb-16">Resultados diretos no WhatsApp de quem usa</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[depoimento1, depoimento2, depoimento3].map((img, i) => (
              <div key={i} className="rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow border border-[#d4d8db]">
                <img src={img} alt={`Resultado real ${i+1}`} className="w-full h-auto object-cover" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* COMPARATIVO HONESTO */}
      <section id="comparativo" className="py-24 px-6 bg-white text-black">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-[12px] font-bold text-[#8b3dff] tracking-[0.2em] uppercase mb-4">Comparativo Honesto</h2>
            <h3 className="text-3xl md:text-5xl font-bold mb-6">Veja onde seu dinheiro rende mais</h3>
            <p className="text-lg text-[#405466] max-w-2xl mx-auto">Não vamos te enganar comparando com agência de design de R$ 10.000. Olha as alternativas reais que você está considerando agora.</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr>
                  <th className="p-4 border-b-2 border-[#d4d8db] text-[#405466] font-medium w-1/4"></th>
                  <th className="p-4 border-b-2 border-[#d4d8db] font-bold text-[#0e1318] w-1/4">Pack único Hotmart</th>
                  <th className="p-4 border-b-2 border-[#d4d8db] font-bold text-[#0e1318] w-1/4">Designer freelancer</th>
                  <th className="p-4 border-b-2 border-[#8b3dff] font-bold text-[#8b3dff] w-1/4 bg-[#fcfaff] rounded-t-xl">MELHOR ESCOLHA ✅ Canva Viagem</th>
                </tr>
              </thead>
              <tbody className="text-[#0e1318]">
                {[
                  { l: "Investimento", a: "R$ 197 uma vez", b: "R$ 1.500 / mês", c: "A partir de R$ 197 / ano" },
                  { l: "Conteúdo", a: "150 reels fixos", b: "4–8 entregas/mês", c: "300+ Reels + 400+ Mídias e Feed" },
                  { l: "Atualizações", a: "❌ Nenhuma", b: "Depende dele", c: "✅ Atualizações semanais inclusas" },
                  { l: "IAs e Ferramentas", a: "❌ Não tem", b: "❌ Não tem", c: "✅ Vendedor IA + Construtor + CRM" },
                  { l: "Suporte", a: "Só do produtor", b: "1 freelancer", c: "WhatsApp VIP direto com o Lucas" }
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
            <h2 className="text-[12px] font-bold text-white/80 tracking-[0.2em] uppercase mb-4">Trabalhe melhor com a IA</h2>
            <h3 className="text-3xl md:text-5xl font-bold mb-6 text-white">Tudo o que sua agência precisa em um só lugar</h3>
            <p className="text-lg text-white/90 max-w-3xl mx-auto">
              Desbloqueie todas essas ferramentas na sua agência de viagens para aumentar a produtividade e as vendas, tudo em um só lugar de forma 100% integrada.
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
                    title: "Criação de anúncios com IA",
                    desc: "Crie campanhas e ofertas irresistíveis em segundos. Nossa IA gera o anúncio completo com a sua identidade visual pronta para atrair viajantes de alto padrão.",
                    img: "/images/LOC_MarTechB2C_CanvaPro_LandingPage_AIAdCreation_Small_pt-BR.png",
                    badge: "⚡"
                  },
                  {
                    title: "Construtor de sites",
                    desc: "Crie modelos profissionais de landing pages de vendas e roteiros de viagens completos em instantes. Aplique suas cores, fontes e logotipos com um clique.",
                    img: siteCanvaViagem,
                    badge: "🌐"
                  },
                  {
                    title: "CRM para gestão de clientes",
                    desc: "Organize suas conversas, gerencie o funil de atendimento e vendas de pacotes de viagem, e controle todo o histórico de contatos em um sistema prático.",
                    img: "/images/PRO25001_JTBD_Section_Social_Media_Tab_MSAS.png",
                    badge: "📊"
                  },
                  {
                    title: "Vendedor de Viagens IA",
                    desc: "O assistente virtual definitivo treinado para vender pacotes e criar ofertas exclusivas. Escreva a ideia e a IA gera a copy de venda instantaneamente.",
                    img: "/images/PRO25001_JTBD_Section_Brand_Tab_Magic_Write.png",
                    badge: "👑"
                  },
                  {
                    title: "Mais de 300 vídeos Reels",
                    desc: "Desbloqueie uma biblioteca com centenas de vídeos cinematográficos gravados em alta definição dos principais destinos prontos para atrair viajantes.",
                    img: "/images/LOC_MarTechB2C_CanvaPro_LandingPage_PremiumVideoTemplates_Small_pt-BR.png",
                    badge: "🎥"
                  },
                  {
                    title: "Artes prontas para o Feed",
                    desc: "Modelos profissionais prontos de carrosséis e posts estáticos com artes de ofertas e roteiros explicativos 100% editáveis no Canva.",
                    img: "/images/ArtistCollection_small_pt-BR.png",
                    badge: "🎨"
                  },
                  {
                    title: "Stories interativos",
                    desc: "Apareça todos os dias nos stories e aumente seu engajamento com roteiros de destinos, caixas de perguntas, enquetes e templates de alta conversão.",
                    img: "/images/Spotlight_Disney_Mobile.png",
                    badge: "📱"
                  }
                ].map((card, idx) => (
                  <div 
                    key={idx} 
                    className="bg-white border border-[#e2e8f0] rounded-3xl p-6 flex flex-col justify-between hover:shadow-lg transition-all duration-300 w-[calc(33.333%-16px)] shrink-0 min-w-[280px]"
                  >
                    <div>
                      <div className="w-full aspect-[4/3] rounded-2xl overflow-hidden mb-6 border border-[#e2e8f0]">
                        <img src={card.img} alt={card.title} className="w-full h-full object-cover" />
                      </div>
                      <h4 className="text-lg font-bold text-[#0f172a] mb-2 flex items-center gap-2">
                        <span className="text-[#8b3dff]">{card.badge}</span> {card.title}
                      </h4>
                      <p className="text-[#64748b] text-sm leading-relaxed">
                        {card.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Slider Navigation Controls */}
            <div className="flex items-center justify-end gap-3 mt-8 pr-2">
              <button 
                onClick={() => setCarouselIndex(Math.max(0, carouselIndex - 1))}
                disabled={carouselIndex === 0}
                className="w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 text-white disabled:opacity-30 disabled:pointer-events-none transition-all flex items-center justify-center font-bold text-lg shadow-lg backdrop-blur-md"
                aria-label="Voltar slide"
              >
                ←
              </button>
              <button 
                onClick={() => setCarouselIndex(Math.min(4, carouselIndex + 1))}
                disabled={carouselIndex >= 4}
                className="w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 text-white disabled:opacity-30 disabled:pointer-events-none transition-all flex items-center justify-center font-bold text-lg shadow-lg backdrop-blur-md"
                aria-label="Avançar slide"
              >
                →
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* PLANOS & PREÇOS (Canva Style) */}
      <section id="planos" className="py-24 px-6 bg-white relative">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-[12px] font-bold text-[#8b3dff] tracking-[0.2em] uppercase mb-4">Acesso imediato</h2>
            <h3 className="text-4xl md:text-5xl font-bold mb-8">Escolha o seu plano</h3>
            
            {/* TOGGLE */}
            <div className="inline-flex bg-[#f2f3f5] p-1.5 rounded-full items-center mb-4">
              <button 
                onClick={() => setBillingPeriod("annual")}
                className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all ${billingPeriod === 'annual' ? 'bg-[#8b3dff] text-white shadow-md' : 'text-[#405466] hover:text-[#0e1318]'}`}
              >
                PAGAR ANUAL
              </button>
              <button 
                onClick={() => setBillingPeriod("monthly")}
                className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all ${billingPeriod === 'monthly' ? 'bg-[#8b3dff] text-white shadow-md' : 'text-[#405466] hover:text-[#0e1318]'}`}
              >
                PAGAR MENSAL
              </button>
            </div>
            
            <div className="text-sm font-bold text-[#d93025] flex items-center justify-center gap-1">
              ⚠️ Preço 1° lote garantido hoje
            </div>
            <p className="text-sm text-[#405466] mt-2 max-w-xl mx-auto">
              Quanto mais agências entram, mais mídias produzimos. O valor promocional atual só pode ser garantido para novos acessos agora.
            </p>
          </div>

          <div className="flex flex-col md:flex-row justify-center gap-8 max-w-4xl mx-auto">
            
            {/* PLANO START */}
            <div className="flex-1 bg-white border border-[#d4d8db] rounded-2xl p-8 flex flex-col shadow-sm hover:shadow-md transition-shadow">
              <div className="mb-8">
                <h4 className="text-2xl font-bold mb-2">PLANO START</h4>
                <div className="flex items-baseline gap-1 mb-2 text-[#0e1318]">
                  <span className="text-2xl font-bold">R$</span>
                  <span className="text-5xl font-bold">{billingPeriod === 'monthly' ? '29' : '16'}</span>
                  <span className="text-2xl font-bold">{billingPeriod === 'monthly' ? ',90' : ',41'}</span>
                  <span className="text-[#405466] text-base font-normal">/mês</span>
                </div>
                <p className="text-sm text-[#405466]">
                  {billingPeriod === 'monthly' ? 'Assinatura mensal recorrente' : 'Equivalente a R$ 197,00 cobrados anualmente'}
                </p>
              </div>

              <button 
                onClick={() => checkout(billingPeriod === 'monthly' ? 'smart_monthly' : 'smart_annual')}
                className="w-full py-3 rounded-md bg-[#f2f3f5] text-[#0e1318] font-bold hover:bg-[#e5e7eb] transition-colors mb-8"
              >
                Começar com o Start
              </button>

              <ul className="space-y-4 mb-8 flex-1">
                {[
                  "Acesso ilimitado a 400+ mídias de viagens",
                  "Reels, Stories, Artes feed de alta conversão",
                  "Modelos prontos e 100% editáveis no Canva",
                  "Texto e Copys de Ofertas de pacotes magnéticos",
                  "Influencers de I.A prontos para divulgar",
                  "Robôs de Inteligência Artificial tira-dúvidas",
                  "Suporte completo por WhatsApp",
                ].map((f, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-[#0e1318]">
                    <Check size={18} className="text-[#0e1318] shrink-0 mt-0.5" />
                    <span>{f}</span>
                  </li>
                ))}
                {[
                  "Fábrica: Gerador de Anúncios e Ofertas de viagens",
                  "Fábrica: Gerador de Sites de viagens de conversão",
                  "Diagnóstico e Plano de ação individual para escala"
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
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#8b3dff] text-white px-4 py-1 rounded-full text-xs font-bold tracking-wider">
                ⭐ RECOMENDADO PARA ESCALA
              </div>
              
              <div className="mb-8">
                <h4 className="text-2xl font-bold mb-2 text-[#8b3dff]">PLANO ELITE</h4>
                <div className="flex items-baseline gap-1 mb-2 text-[#0e1318]">
                  <span className="text-2xl font-bold">R$</span>
                  <span className="text-6xl font-bold">{billingPeriod === 'monthly' ? '97' : '28'}</span>
                  <span className="text-2xl font-bold">{billingPeriod === 'monthly' ? ',00' : ',91'}</span>
                  <span className="text-[#405466] text-base font-normal">/mês</span>
                </div>
                <p className="text-sm text-[#405466]">
                  {billingPeriod === 'monthly' ? 'Assinatura mensal recorrente' : 'Equivalente a R$ 347,00 cobrados anualmente (Economia massiva)'}
                </p>
              </div>

              <button 
                onClick={() => checkout(billingPeriod === 'monthly' ? 'elite_monthly' : 'elite_annual')}
                className="w-full py-3 rounded-md bg-[#8b3dff] text-white font-bold hover:bg-[#7b32e6] transition-colors mb-4 shadow-md"
              >
                Quero o Elite →
              </button>
              <div className="text-center text-xs font-semibold text-[#008a00] mb-8">
                ⚡ Acesso imediato · Suporte garantido
              </div>

              <ul className="space-y-4 mb-8 flex-1">
                <li className="flex items-start gap-3 text-sm font-bold text-[#8b3dff]">
                  <Check size={18} className="shrink-0 mt-0.5" />
                  <span>TUDO DO PLANO START +</span>
                </li>
                {[
                  "Gerador de Anúncios e Artes de Viagem ILIMITADO (fotos reais em 5 segundos)",
                  "Criador Automático de Sites de Venda para cada roteiro de viagem",
                  "Gerador de Legendas magnéticas prontas para copiar e colar",
                  "Plano de Ação e Checklist diário de postagens diárias",
                  "Diagnóstico e Plano de ação individualizado para escala",
                  "Suporte VIP no WhatsApp diretamente com Lucas Ferrari"
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
              Sua Decisão com Risco Zero
            </h2>
            <p className="text-base text-[#64748b] max-w-xl mx-auto">
              Ao assinar o Plano Elite, o risco é 100% nosso. Você avalia e decide sem qualquer complicação.
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
                      <h3 className="font-bold text-lg text-[#0f172a]">Garantia Incondicional</h3>
                      <p className="text-xs text-[#64748b]">Teste sem riscos por 7 dias</p>
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
                      Dias
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4 text-sm text-[#64748b]">
                  <p>
                    <strong>• 7 dias para testar tudo:</strong> Acesso total a todas as ferramentas de IA, artes e vídeos. Se não gostar, basta pedir o reembolso.
                  </p>
                  <p>
                    <strong>• Satisfação Garantida:</strong> Se a qualidade da nossa Fábrica de Anúncios e materiais não te convencer, devolvemos 100% do seu dinheiro.
                  </p>
                </div>
              </div>
              
              <div className="mt-6 pt-4 border-t border-[#f1f5f9] text-xs font-bold text-[#8b3dff] flex items-center gap-1.5">
                <Check size={14} /> Risco zero absoluto para você iniciar hoje
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
                    <h3 className="font-bold text-lg text-[#0f172a]">O Custo de Não Agir</h3>
                    <p className="text-xs text-[#ef4444]">O que você deixa de ganhar sem a plataforma</p>
                  </div>
                </div>
                
                <ul className="space-y-4 text-sm font-semibold">
                  <li className="flex items-start gap-2.5 text-[#64748b]">
                    <X className="w-5 h-5 text-[#ef4444] shrink-0 mt-0.5" />
                    <span>Sem o Canva Viagem: feed parado = <strong className="text-[#ef4444]">0 DMs orgânicos</strong> por mês</span>
                  </li>
                  <li className="flex items-start gap-2.5 text-[#64748b]">
                    <Check className="w-5 h-5 text-[#22c55e] shrink-0 mt-0.5" />
                    <span>1 pacote vendido pelo feed: <strong className="text-[#22c55e]">R$ 3.500 a R$ 8.000 de lucro</strong></span>
                  </li>
                  <li className="flex items-start gap-2.5 text-[#64748b]">
                    <Star className="w-5 h-5 text-[#8b3dff] shrink-0 fill-[#8b3dff] mt-0.5" />
                    <span>Retorno do plano Elite em apenas 1 venda: <strong className="text-[#8b3dff]">2.300% de ROI</strong></span>
                  </li>
                </ul>
              </div>

              <div className="mt-6 pt-4 border-t border-[#f1f5f9] text-xs text-[#64748b] font-bold">
                💡 1 pacote de viagem fechado paga 23 anos de assinatura.
              </div>
            </div>

          </div>

          {/* Bloco de Ação Rápida */}
          <div className="max-w-2xl mx-auto text-center">
            <p className="text-sm font-bold text-[#0f172a] mb-6 leading-relaxed">
              Seu feed. Sua autoridade. Sua decisão. Cada dia com feed parado é um cliente fechando com o concorrente.
            </p>
            
            <button 
              onClick={() => { document.getElementById('planos')?.scrollIntoView({ behavior: 'smooth' }) }} 
              className="bg-[#8b3dff] hover:bg-[#7b32e6] text-white px-8 py-3.5 rounded-xl text-base font-bold transition-all duration-200 hover:scale-[1.02] inline-block shadow-lg shadow-[#8b3dff]/20"
            >
              QUERO ACESSO ELITE — R$ 28,91/MÊS →
            </button>
            <div className="text-center text-xs font-bold text-[#22c55e] mt-4 flex items-center justify-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#22c55e] animate-pulse"></span>
              Acesso em 2 min · Garantia incondicional · Cancele quando quiser
            </div>
          </div>

        </div>
      </section>

      {/* FAQ */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-[12px] font-bold text-[#8b3dff] tracking-[0.2em] uppercase mb-4 text-center">Perguntas Frequentes</h2>
          <h3 className="text-3xl md:text-5xl font-bold mb-12 text-center">Dúvidas? Nós respondemos.</h3>

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
          <div className="text-2xl font-black text-[#8b3dff] mb-6">CANVA VIAGEM</div>
          <p className="text-[#405466] text-sm mb-8 max-w-md mx-auto">A plataforma definitiva para agências de turismo que buscam o próximo nível de autoridade e lucro.</p>
          <div className="flex justify-center gap-6 text-sm font-semibold text-[#0e1318] mb-8">
            <a href="/inicio" className="hover:text-[#8b3dff]">Início</a>
            <a href="/planos" className="hover:text-[#8b3dff]">Planos</a>
            <a href="/termos" className="hover:text-[#8b3dff]">Termos</a>
            <a href="/privacidade" className="hover:text-[#8b3dff]">Privacidade</a>
            <a href="https://wa.me/558586411294" target="_blank" rel="noreferrer" className="hover:text-[#8b3dff]">Suporte</a>
          </div>
          <div className="text-xs text-[#405466] font-medium flex items-center justify-center gap-2 mb-4">
            🔒 Parceiro de pagamento oficial: <span className="font-bold text-[#8b3dff]">Stripe</span>
          </div>
          <p className="text-[#405466] text-xs">
            © 2026 Canva Viagem · Todos os direitos reservados.
          </p>
        </div>
      </footer>

    </div>
  );
}


const CANVA_FEATURES_HTML = ` html><html dir="ltr" lang="pt-BR" class="theme light cc24"><head><meta charset="utf-8" data-next-head=""><meta name="viewport" content="width=device-width" data-next-head=""><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="robots" content="all"><link href="images/favicon-1.ico" rel="shortcut icon"><meta name="description" content="Eleve o nível do seu trabalho com os recursos premium e as ferramentas de IA do Canva Viagem Elite. Crie conteúdo para redes sociais, fotos, vídeos, apresentações e muito mais com qualidade e facilidade."><link rel="canonical" href="https://www.canva.com/pt_br/pro/"><meta property="og:url" content="https://www.canva.com/pt_br/pro/"><meta name="slack-app-id" content="A028R8CCLNR"><meta property="og:description" content="Eleve o nível do seu trabalho com os recursos premium e as ferramentas de IA do Canva Viagem Elite. Crie conteúdo para redes sociais, fotos, vídeos, apresentações e muito mais com qualidade e facilidade."><meta property="og:locale" content="PT_BR"><meta property="og:type" content="website"><meta property="og:title" content="Canva Viagem Elite | Sua solução de design completa"><meta property="og:site_name" content="Canva"><meta property="fb:app_id" content="525265914179580"><meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="Canva Viagem Elite | Sua solução de design completa"><meta name="twitter:site" content="@canva"><meta name="twitter:description" content="Eleve o nível do seu trabalho com os recursos premium e as ferramentas de IA do Canva Viagem Elite. Crie conteúdo para redes sociais, fotos, vídeos, apresentações e muito mais com qualidade e facilidade."><link rel="preconnect" href="https://static-cse.canva.com" crossorigin="anonymous"><link rel="preconnect" href="https://static.canva.com" crossorigin="anonymous"><link rel="alternate" hreflang="en" href="https://www.canva.com/pro/"><link rel="alternate" hreflang="de" href="https://www.canva.com/de_de/pro/"><link rel="alternate" hreflang="es" href="https://www.canva.com/es_mx/pro/"><link rel="alternate" hreflang="es-es" href="https://www.canva.com/es_es/pro/"><link rel="alternate" hreflang="es-us" href="https://www.canva.com/es_us/pro/"><link rel="alternate" hreflang="fr" href="https://www.canva.com/fr_fr/pro/"><link rel="alternate" hreflang="id" href="https://www.canva.com/id_id/pro/"><link rel="alternate" hreflang="it" href="https://www.canva.com/it_it/pro/"><link rel="alternate" hreflang="ja" href="https://www.canva.com/ja_jp/pro/"><link rel="alternate" hreflang="ko" href="https://www.canva.com/ko_kr/pro/"><link rel="alternate" hreflang="nl" href="https://www.canva.com/nl_nl/pro/"><link rel="alternate" hreflang="pt" href="https://www.canva.com/pt_pt/pro/"><link rel="alternate" hreflang="pt-br" href="https://www.canva.com/pt_br/pro/"><link rel="alternate" hreflang="tr" href="https://www.canva.com/tr_tr/pro/"><link rel="alternate" hreflang="zh" href="https://www.canva.com/zh_cn/pro/"><link rel="alternate" hreflang="ar" href="https://www.canva.com/ar_eg/pro/"><link rel="alternate" hreflang="da" href="https://www.canva.com/da_dk/pro/"><link rel="alternate" hreflang="es-ar" href="https://www.canva.com/es_ar/pro/"><link rel="alternate" hreflang="es-co" href="https://www.canva.com/es_co/pro/"><link rel="alternate" hreflang="ms" href="https://www.canva.com/ms_my/pro/"><link rel="alternate" hreflang="nb" href="https://www.canva.com/nb_no/pro/"><link rel="alternate" hreflang="pl" href="https://www.canva.com/pl_pl/pro/"><link rel="alternate" hreflang="ru" href="https://www.canva.com/ru_ru/pro/"><link rel="alternate" hreflang="sv" href="https://www.canva.com/sv_se/pro/"><link rel="alternate" hreflang="th" href="https://www.canva.com/th_th/pro/"><link rel="alternate" hreflang="uk" href="https://www.canva.com/uk_ua/pro/"><link rel="alternate" hreflang="vi" href="https://www.canva.com/vi_vn/pro/"><link rel="alternate" hreflang="zh-hk" href="https://www.canva.com/zh_hk/pro/"><link rel="alternate" hreflang="zh-tw" href="https://www.canva.com/zh_tw/pro/"><link rel="alternate" hreflang="en-in" href="https://www.canva.com/en_in/pro/"><link rel="alternate" hreflang="hi" href="https://www.canva.com/hi_in/pro/"><link rel="alternate" hreflang="x-default" href="https://www.canva.com/pro/"><meta name="twitter:creator" content="@canva"><title data-next-head="">Canva Viagem Elite | Sua solução de design completa</title><link data-next-font="size-adjust" rel="preconnect" href="/" crossorigin="anonymous"><link rel="preload" href="https://static-cse.canva.com/_next/static/media/canva-sans-latin.cb8040b8.woff2" type="font/woff2" as="font" crossorigin="anonymous" referrerpolicy="strict-origin-when-cross-origin"><script>document.documentElement.classList.remove('nojs');</script><link rel="stylesheet" href="css/_app.404af339.css"><link rel="stylesheet" href="css/hoisted.fd49266e.css"><link rel="stylesheet" href="css/home.b96be070.css"><link rel="stylesheet" href="css/12607.c00c5469.css"><link rel="stylesheet" href="css/30540.6bd2af4f.css"><link rel="stylesheet" href="css/43171.82d570e1.css"><script>const element = document.querySelector('style[data-next-hide-fouc]');
  if (element) {
    document.head.removeChild(element);
  };</script><noscript data-n-css=""></noscript><script defer="" nomodule="" src="js/polyfills-42372ed130431b0a.js"></script><script defer="" src="js/26545.dc72f43be4506745.js"></script><script defer="" src="js/17909.63a68f534376d98e.js"></script><script defer="" src="js/6361.0152f0e64f0f0182.js"></script><script defer="" src="js/42717.57193440eac6c86f.js"></script><script data-sentry-current-locale="PT_BR" data-sentry-current-url="https://www.canva.com/pt_br/pro/" data-sentry-current-page="ProductPro.homeV3" data-sentry-current-template-name="/product/pro/home" data-sentry-owner="mau" data-sentry-current-runtime="next-client"></script><script src="js/webpack-ef62561d0fa21389.js" defer=""></script><script src="js/hoistedExternal-4a72723563dbf471.js" defer=""></script><script src="js/main-2af4653b358429a4.js" defer=""></script><script src="js/_app-2c8168f45c46b560.js" defer=""></script><script src="js/2715-f1ddb1f3f0ddd7ed.js" defer=""></script><script src="js/79578-119fae9485d626a6.js" defer=""></script><script src="js/90731-4ec99b8366e68060.js" defer=""></script><script src="js/31277-2cd9c221d058930f.js" defer=""></script><script src="js/44400-0e261fd6b3b8dca2.js" defer=""></script><script src="js/76439-ccc1224b5ee11b9d.js" defer=""></script><script src="js/11873-e176f9281533094f.js" defer=""></script><script src="js/25159-409a02c90044769f.js" defer=""></script><script src="js/26722-ce1030526821c9b6.js" defer=""></script><script src="js/73612-5a633c14344aea94.js" defer=""></script><script src="js/43374-56569f6578f17b5e.js" defer=""></script><script src="js/27905-da0d77c0ab3ae235.js" defer=""></script><script src="js/79317-8cc77e6c5e63d07c.js" defer=""></script><script src="js/hoisted-96a0e9af99a0f71a.js" defer=""></script><script src="js/home-b98c59a08ae151a0.js" defer=""></script><script src="js/_buildManifest.js" defer=""></script><script src="js/_ssgManifest.js" defer=""></script></head><body><noscript><div class="x7FaGWr"><span class="xJO6ZF7">Your browser is not supported and may not give the best experience.</span></div></noscript><link href="https://fonts.googleapis.com/css2?family=Poppins&display=swap" rel="stylesheet preload prefetch" as="style" type="text/css" crossorigin="anonymous"><div id="__next"><header class="ftS-Mpm fAkV1P4 BdUi78F BMOCzQ fOwrSw _6Mu4Ow uN3EIA MYb60A XJKpHg" style="--s_rwAw:flex;--YRbscg:column;--zIndex:1"><div class="theme dark vafCN7f BMOCzQ fOwrSw _6Mu4Ow MYb60A" style="--s_rwAw:flex"><div class="kcvC-re BMOCzQ fOwrSw EC2pjw _6Mu4Ow FQ64gg" style="--s_rwAw:flex;--TPsgaw:24px;--qzBk5g:32px;--OX94wg:48px"><div class="b32szS7 BMOCzQ _6Mu4Ow _WIyVQ FQ64gg" style="--s_rwAw:flex"><div class="mcph84N b32szS7 BMOCzQ _6Mu4Ow FQ64gg" style="--s_rwAw:flex"><div class="X3YvaQ"><nav class="BMOCzQ"><div class="tq_GuQ" style="--kxq1gA:8px"><button class="_5KtATA LQzFZw VgvqkQ _8ERLTg h69Neg unS_Qw LQzFZw VgvqkQ f5yKmw j5ZKaw bfFHbg j34Zww aqbYPg _3FvZZg gi5pqg" type="button" aria-label="Abrir menu de navegação" aria-disabled="true"><span class="vxQy1w" aria-hidden="true"><div class="R0A6yWq a-WcGey BMOCzQ"><div class="IwXXkw _qImYg KOdbkg"></div></div></span><span class="_7vwyYA"><span aria-hidden="true" class="NA_Img dkWypw _6ti9_A"><svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="24" height="24" viewBox="0 0 24 24"><defs><path id="_265464792__a" d="M4 21A9 9 0 0 0 4 3a1 1 0 1 0 0 2 7 7 0 1 1 0 14 1 1 0 0 0 0 2z"></path></defs><use fill="currentColor" fill-rule="nonzero" transform="matrix(-1 0 0 1 16 0)" xlink:href="#_265464792__a"></use></svg></span><div aria-live="assertive" class="_pFsfA">Carregando</div></span></button></div><div class="BMOCzQ _6Mu4Ow" style="--s_rwAw:none"><div>Design<div><h2>Design digital</h2><h3>Design digital</h3><a href="https://www.canva.com/pt_br/planilhas/">Planilhas</a><a href="https://www.canva.com/pt_br/documentos/">Docs</a><a href="https://www.canva.com/pt_br/quadros-brancos/">Quadro branco</a><a href="https://www.canva.com/pt_br/apresentacoes/">Apresentações</a><a href="https://www.canva.com/pt_br/midias-sociais/">Redes sociais</a><a href="https://www.canva.com/pt_br/editor-fotos/">Editor de fotos</a><a href="https://www.canva.com/pt_br/editor-videos/">Vídeos</a><a href="https://www.canva.com/pt_br/print/">Produtos para impressão</a><a href="https://www.canva.com/pt_br/construtor-de-sites/">Sites</a><a href="https://www.canva.com/pt_br/editor-pdf/">Editor de PDF</a></div><div><h2>Imprimir design</h2><h3>Imprimir design</h3><a href="https://www.canva.com/pt_br/cartoes-de-visita/">Cartões de visita</a><a href="https://www.canva.com/pt_br/convites/">Convites</a><a href="https://www.canva.com/pt_br/flyers/">Flyers</a><a href="https://www.canva.com/pt_br/folders/">Folders</a><a href="https://www.canva.com/pt_br/camisetas/">Camisetas</a><a href="https://www.canva.com/pt_br/canecas-personalizadas/">Canecas</a><a href="https://www.canva.com/pt_br/adesivos/">Adesivos</a><a href="https://www.canva.com/hoodies-sweatshirts/">Moletons com capuz</a><a href="https://www.canva.com/pt_br/etiquetas/">Rótulos</a><a href="https://www.canva.com/pt_br/cartazes/">Cartazes</a></div><div><h2>Imagens e fotos</h2><h3>Imagens e fotos</h3><a href="https://www.canva.com/pt_br/editor-fotos/">Editor de fotos</a><a href="https://www.canva.com/pt_br/recursos/remover-fundo/">Removedor de Fundo</a><a href="https://www.canva.com/pt_br/montagens-de-fotos/">Montagens de fotos</a><a href="https://www.canva.com/pt_br/mockups/">Mockups</a><a href="https://www.canva.com/pt_br/recursos/melhorar-imagem/">Melhorar qualidade da foto</a><a href="https://www.canva.com/pt_br/gerador-imagem-ia/">Gerador de imagem por IA</a><a href="https://www.canva.com/pt_br/recursos/editor-fotos-ia/">Editor de fotos com IA</a><a href="https://www.canva.com/pt_br/gerador-arte-ia/">Gerador de arte de IA</a><a href="https://www.canva.com/pt_br/ferramenta-de-desenho/">Desenhar</a><a href="https://www.canva.com/pt_br/logos/">Logotipos</a></div><div><h2>Vídeos e áudios</h2><h3>Vídeos e áudios</h3><a href="https://www.canva.com/pt_br/editor-videos/">Editor de Vídeos</a><a href="https://www.canva.com/pt_br/videos/youtube/">Editor de vídeos para YouTube</a><a href="https://www.canva.com/pt_br/recursos/video-trimmer/">Cortador de vídeo</a><a href="https://www.canva.com/pt_br/recursos/gravador-de-video-online/">Gravador de vídeos online</a><a href="https://www.canva.com/pt_br/recursos/conversor-mp4/">Converta vídeos para MP4</a><a href="https://www.canva.com/pt_br/recursos/gerador-video-ai/">Gerador de vídeos com IA</a><a href="https://www.canva.com/pt_br/recursos/texto-para-fala/">Locução de texto para fala</a><a href="https://www.canva.com/pt_br/recursos/gerador-musicas-ia/">Gerador de música por IA</a><a href="https://www.canva.com/pt_br/recursos/gerador-voz-ia/">Gerador de voz por IA</a></div></div><div>Produto<div><h2>Produto</h2><h3>Produto</h3><a href="https://www.canva.com/pt_br/launches/">Últimos lançamentos</a><a href="https://www.canva.com/pt_br/visual-suite/">Kit de Criação Visual</a><a href="https://www.canva.com/pt_br/negocios/features/brand/">Gestão de marca</a><a href="https://www.canva.com/pt_br/recursos/">Características do produto</a><a href="https://www.canva.com/pt_br/apps/">Marketplace de apps</a><a href="https://www.canva.com/pt_br/modelos/">Marketplace de modelos</a></div><div><h2>Canva IA</h2><h3>Canva IA</h3><a href="https://www.canva.com/pt_br/camadas-magicas/">Camadas Mágicas</a><a href="https://www.canva.com/pt_br/ia-assistente/">Assistente de design Canva IA</a><a href="https://www.canva.com/pt_br/gerador-de-codigo-ia/">Canva Code</a><a href="https://www.canva.com/pt_br/pro/magic-resize/">Conversão Mágica</a><a href="https://www.canva.com/pt_br/pro/animator/">Animação Mágica</a><a href="https://www.canva.com/pt_br/gerador-de-textos/">Texto Mágico</a><a href="https://www.canva.com/pt_br/tradutor/">Tradutor</a><a href="https://www.canva.com/pt_br/recursos/ia-analise-dados/">Insights Mágicos</a><a href="https://www.canva.com/pt_br/recursos/gerador-formulas-ia/">Fórmula Mágica</a><a href="https://www.canva.com/pt_br/canva-ia/"><h2>Todo o Canva IA</h2></a></div></div><div>Planos<div><h2>Planos</h2><h3>Planos</h3><a href="https://www.canva.com/pt_br/precos/">Compare os planos</a><a href="https://www.canva.com/pt_br/pro/">Pro</a><a href="https://www.canva.com/pt_br/canva-pro-mais/">Pro+</a><a href="https://www.canva.com/pt_br/empresas/">Enterprise</a><a href="https://www.canva.com/pt_br/canva-para-ongs/">ONGs</a><a href="https://www.canva.com/pt_br/educacao/">Educação</a><a href="https://www.canva.com/pt_br/for-campus/">Ensino superior</a></div></div><div>Negócios<div><h2>Canva para negócios</h2><h3>Canva para negócios</h3><a href="https://www.canva.com/pt_br/fale-com-vendas/">Fale com a equipe de vendas</a><a href="https://www.canva.com/enterprise/product-demo/">Vídeo de demonstração</a><h3>Planos de negócios</h3><a href="https://www.canva.com/pt_br/empresas/">Canva Empresas</a><a href="https://www.canva.com/pt_br/canva-pro-mais/">Canva Viagem Elite+</a></div><div><h2>Soluções</h2><h3>Soluções</h3><a href="https://www.canva.com/pt_br/solucoes/marketing/">Marketing</a><a href="https://www.canva.com/pt_br/solucoes/vendas/">Vendas</a><a href="https://www.canva.com/pt_br/solucoes/it/">TI</a><a href="https://www.canva.com/pt_br/solucoes/creatives/">Criativos</a><a href="https://www.canva.com/pt_br/for-campus/">Ensino superior</a><a href="https://www.canva.com/pt_br/solucoes/imobiliarias/">Imóveis</a><a href="https://www.canva.com/pt_br/solucoes/governo/">Governo</a><a href="https://www.canva.com/pt_br/solucoes/small-business/">Pequena empresa</a><a href="https://www.canva.com/pt_br/solucoes/"><h2>Todas as soluções</h2></a></div><div><h2>Funcionalidades</h2><h3>Recursos</h3><a href="https://www.canva.com/pt_br/solucoes/brand-management-tools/">Gestão de marca</a><a href="https://www.canva.com/pt_br/solucoes/content-creation-tools/">Criação de conteúdo</a><a href="https://www.canva.com/pt_br/business/features/invite-your-team/">Gestão da equipe</a><a href="https://www.canva.com/pt_br/business/features/security-sso/">Segurança e SSO</a><a href="https://www.canva.com/pt_br/business/features/apps-integrations/">Aplicativos de integração</a><a href="https://www.canva.com/pt_br/business/features/team-templates/">Modelos da marca</a><a href="https://www.canva.com/pt_br/business/features/"><h2>Todos os recursos</h2></a></div><div><h2>Recursos</h2><h3>Recursos</h3><a href="https://www.canva.com/business/case-studies/">Casos de sucesso</a><a href="https://www.canva.com/pt_br/empresas/servicos-profissionais/">Integração de empresas</a><a href="https://partners.canva.com/directory/">Diretório de parceiros</a><h3>Relatórios</h3><a href="https://www.canva.com/marketing-ai-report/">Marketing e IA</a><a href="https://www.canva.com/visual-communications-report/">Comunicações visuais</a><a href="https://www.canva.com/resources/forrester-tei-canva-for-teams/">Relatório TEI da Forrester</a><a href="https://www.canva.com/resources/"><h2>Todos os recursos</h2></a></div></div><div>Educação<div><h2>Canva Educação</h2><h3>Canva Educação</h3><a href="https://www.canva.com/pt_br/educacao/">Canva Educação</a><a href="https://www.canva.com/pt_br/educacao/estudantes/">Canva para Estudantes</a><a href="https://www.canva.com/pt_br/pricing/#education/">Planos de educação</a></div><div><h2>Ensino básico</h2><h3>Ensino básico</h3><a href="https://www.canva.com/pt_br/educacao/escolas/">Canva para escolas e redes escolares</a><a href="https://www.canva.com/education/features/">Características do produto</a><a href="https://www.canva.com/pt_br/educacao/integracoes-lms/">Integrações com LMS</a><a href="https://www.canva.com/case-studies/?solution=Education">Casos de sucesso na educação básica</a><a href="https://www.canva.com/pt_br/educacao/contact-sales/">Fale conosco</a></div><div><h2>Professores da educação básica</h2><h3>Professores da educação básica</h3><a href="https://www.canva.com/pt_br/educacao/professores/">Canva para professores</a><a href="https://www.canva.com/pt_br/educacao/elegibilidade/">Diretrizes de Elegibilidade</a><a href="https://www.canva.com/education/teaching-resources/">Recursos educacionais</a><a href="https://www.canva.com/community/teachers/">Comunidades de professores</a></div><div><h2>Ensino superior</h2><h3>Ensino superior</h3><a href="https://www.canva.com/pt_br/for-campus/">Canva para instituições de ensino superior</a><a href="https://www.canva.com/case-studies/?solution=HigherEducation">Casos de sucesso</a><a href="https://www.canva.com/pt_br/educacao/contact-sales/">Fale com a equipe de vendas do Universidades</a><h3>Soluções para universidades</h3><a href="https://www.canva.com/for-campus/academic-success/">Sucesso acadêmico</a><a href="https://www.canva.com/for-campus/accessibility-inclusion/">Acessibilidade</a><a href="https://www.canva.com/for-campus/brand-management/">Gestão de marca</a><a href="https://www.canva.com/for-campus/security-sso/">Segurança e SSO</a></div></div><div>Ajuda<div><h2>Ajuda</h2><h3>Ajuda</h3><a href="https://www.canva.com/pt_br/help/">Central de Ajuda</a><a href="https://www.canva.com/pt_br/design-school/">Escola Criativa</a></div><div><h2>Guias de Criação</h2><h3>Guias de Criação</h3><a href="https://www.canva.com/pt_br/criar/logo/">Logotipos</a><a href="https://www.canva.com/pt_br/criar/panfletos/">Flyers</a><a href="https://www.canva.com/pt_br/criar/banner/">Banners</a><a href="https://www.canva.com/pt_br/criar/cartaz/">Cartazes</a><a href="https://www.canva.com/pt_br/criar/curriculo/">Currículos</a><a href="https://www.canva.com/pt_br/criar/montagem-fotos/">Montagens de fotos</a><a href="https://www.canva.com/pt_br/criar/miniatura-youtube/">Miniatura do YouTube</a><a href="https://www.canva.com/pt_br/criar/"><h2>Todos os guias de criação</h2></a></div></div></div></nav></div><a class="Ej7lEg WkdUeQ _3bC2IQ" href="https://www.canva.com/pt_br/" draggable="false"><div class="_pFsfA">Página de início do Canva</div><div class="_8fA4kJF sgo8jRP BMOCzQ"><div class="IwXXkw _qImYg _CObZw"></div></div></a></div></div><span class="_8aVEnQ jNvgTA" style="--FnDW1g:8px" aria-hidden="true"></span><div class="jOGjwo7 BMOCzQ"><div class="Lvj8DA"><div class="Ty6I6BJ BMOCzQ"><div class="IwXXkw _qImYg _CObZw"></div></div></div></div><span class="_8aVEnQ jNvgTA" style="--FnDW1g:8px" aria-hidden="true"></span><div class="b32szS7 BMOCzQ _6Mu4Ow YgHDng FQ64gg" style="--s_rwAw:flex"><div class="BQZO4Ji BMOCzQ _6Mu4Ow FQ64gg" style="--s_rwAw:flex"><div class="Lvj8DA"></div></div></div></div></div></header><div class="xZPtI5L"><div class="_89M1GL3"><div></div><div class="_8AIsOqt"><section class="CYqfUq- fhjVhcp bxEHwvY ZTAKK9L" style="--top-spacing-default:0px;--bottom-spacing-default:0px"><div style="height:0px;margin-bottom:1px"></div><div style="height:80px"></div><div class="CYqfUq- v6sCQJc bxEHwvY _5Cm5wev" style="--top-spacing-default:0px;--top-spacing-medium-up:96px;--bottom-spacing-default:96px"><div class="SwlpcA" style="--lIX0Wg:0px;--S8wiIA:1;--CcBh2g:2"><div class="_96a4Jyt BMOCzQ EC2pjw _6Mu4Ow uN3EIA" style="--s_rwAw:flex;--TPsgaw:24px;--nz9hsg:96px;--qzBk5g:0px;--KtVHvQ:64px;--PA24dg:96px;--WtUbjw:48px;--RqXq5w:64px;--U3-cIw:0px;--YRbscg:column"><div class="v1C0Jgi theme dark cc24"><span class="_8aVEnQ" style="--FnDW1g:0px;--wVd3QA:16px;--av-YnA:0px" aria-hidden="true"></span><h1 class="A49iGeh qcm1mUj p2mktZs l3IZvP9 _5416iOu" style="--alignment:center;--alignment-medium-up:start;--font-size:calc(var(----lgQg, .1rem)*8/8*32);--line-height:calc(var(----lgQg, .1rem)*8/8*42);--font-variation:" opsz"="" 100;--font-size-medium-up:calc(var(----lgqg,="" .1rem)*8="" 8*48);--line-height-medium-up:calc(var(----lgqg,="" 8*64);--font-variation-medium-up:"opsz"="" 100"=""><span class="DrVjlyk hyQst3G"><span class="xeRVPrl">Crie designs profissionais</span></span><span class="DrVjlyk OVXiEJI"><span class="xeRVPrl">Crie designs profissionais</span></span></h1><span class="_8aVEnQ" style="--FnDW1g:16px" aria-hidden="true"></span><div class="OO3owBw"><span class="jv_R6g" style="--NZu1Zw:24px"><p class="Eli7GPL qcm1mUj p2mktZs l3IZvP9 UsH_yVb" style="--alignment:center;--alignment-medium-up:start;--font-size:calc(var(----lgQg, .1rem)*8/8*16);--line-height:calc(var(----lgQg, .1rem)*8/8*26);--font-variation:unset;--font-size-medium-up:calc(var(----lgQg, .1rem)*8/8*16);--line-height-medium-up:calc(var(----lgQg, .1rem)*8/8*26);--font-variation-medium-up:unset"><span>Uma solução completa para criar e gerenciar seu trabalho. Acesse conteúdos premium, ferramentas da marca e recursos de IA para alcançar suas metas mais rápido.</span></p></span></div><span class="_8aVEnQ" style="--FnDW1g:32px" aria-hidden="true"></span><div class="l_toQaU" style="--alignment:center;--alignment-medium-up:start;--direction:row"><div class="WWl-oJt"><button class="_5KtATA LQzFZw VgvqkQ _8ERLTg _9U4ptw _4_iekA j34Zww aqbYPg _3FvZZg" type="button"><span class="khPe7Q"> Assine o Canva Viagem Elite Agora </span></button></div></div></div></div><div class="_5TldC4U BMOCzQ EC2pjw" style="--TPsgaw:24px;--nz9hsg:96px;--qzBk5g:0px"><span class="_8aVEnQ" style="--FnDW1g:0px;--wVd3QA:4px;--av-YnA:0px" aria-hidden="true"></span><div class="b5oQYvq" style="border-radius:16px"><picture class="xdn184y"><source srcset="images/547.5x526.2_pt-BR_3.png" type="image/avif" media="(min-width: 600px) and (max-resolution: 1dppx)"><source srcset="images/547.5x526.2_pt-BR_2.png" type="image/avif" media="(min-width: 600px) and (min-resolution: 1.001dppx)"><source srcset="images/547.5x526.2_pt-BR_5.png" type="image/avif" media="(min-width: 0px) and (max-width: 599px) and (max-resolution: 1dppx)"><source srcset="images/547.5x526.2_pt-BR_1.png" type="image/avif" media="(min-width: 0px) and (max-width: 599px) and (min-resolution: 1.001dppx)"><source srcset="images/547.5x526.2_pt-BR_4.png" media="(min-width: 600px) and (max-resolution: 1dppx)"><source srcset="images/547.5x526.2_pt-BR_8.png" media="(min-width: 600px) and (min-resolution: 1.001dppx)"><source srcset="images/547.5x526.2_pt-BR_7.png" media="(min-width: 0px) and (max-width: 599px) and (max-resolution: 1dppx)"><source srcset="images/547.5x526.2_pt-BR_6.png" media="(min-width: 0px) and (max-width: 599px) and (min-resolution: 1.001dppx)"><svg viewBox="0 0 900 866" preserveAspectRatio="xMidYMid slice" style="height:100%;width:100%;position:absolute"><foreignObject style="height:100%;width:100%"><div class="IwXXkw _qImYg JbJFjg _CObZw"></div></foreignObject></svg><img src="images/547.5x526.2_pt-BR.png" alt="" height="866" width="900" loading="lazy" class="vNkAEH9 K4Eyfzx" style="object-fit:cover;object-position:center center"></picture></div></div></div></div><div class="S5huVBj"><div class="pXCYvSS"></div><div class="zvEXu2p"></div></div></section>`;
