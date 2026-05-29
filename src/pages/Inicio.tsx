import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, ChevronDown, ChevronUp, ArrowRight, Play, Star, ShieldCheck } from 'lucide-react';

import lucasPortrait from "@/assets/lucas-ferrari-portrait.webp";
import depoimento1 from "@/assets/depoimento1.jpg";
import depoimento2 from "@/assets/depoimento2.png";
import depoimento3 from "@/assets/depoimento3.jpg";

export default function Inicio() {
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "annual">("annual");
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const checkout = (planId: string) => {
    const STRIPE: Record<string, string> = {
      smart_monthly: "https://buy.stripe.com/8x26oIgGuej656zaAY8so05",
      smart_annual: "https://buy.stripe.com/dRm8wQ75U1wk7eH9wU8so09",
      elite_monthly: "https://buy.stripe.com/fZucN6bma6QEeH96kI8so0c",
      elite_annual: "https://buy.stripe.com/fZu14ogGugreeH9bF28so0d",
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

      {/* HEADER NAVBAR (Canva Style) */}
      <header className="fixed top-0 left-0 w-full h-[64px] bg-white border-b border-[#d4d8db] z-50 flex items-center px-6 justify-between shadow-sm">
        <div className="flex items-center gap-2">
          <div className="text-xl font-black text-[#8b3dff] tracking-tight">CANVA VIAGEM</div>
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
              Única plataforma do mercado de turismo que combina 250+ vídeos 4K e artes editáveis
            </h1>
            <p className="text-lg md:text-xl text-white/90 mb-8 leading-relaxed max-w-2xl font-medium">
              Com a revolucionária Fábrica de Anúncios com I.A — onde você digita a oferta e recebe o anúncio pronto, com preços, parcelas e o seu logo em 5 segundos.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center gap-4 justify-center md:justify-start">
              <button onClick={() => { document.getElementById('planos')?.scrollIntoView({ behavior: 'smooth' }) }} className="bg-white hover:bg-gray-100 text-[#8b3dff] px-8 py-4 rounded-lg text-lg font-bold transition-transform hover:scale-105 shadow-lg w-full sm:w-auto text-center">
                Quero começar agora — a partir de R$ 16,41/mês
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
            <img src={depoimento1} alt="Dashboard Canva Viagem" className="w-full h-auto rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] relative z-10 border border-white/20" />
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
          <h2 className="text-[12px] font-bold text-[#8b3dff] tracking-[0.2em] uppercase mb-4">Velocidade Máxima</h2>
          <h3 className="text-3xl md:text-5xl font-bold mb-6">Como a IA cria seu anúncio</h3>
          <p className="text-lg text-[#405466] mb-16">Zero complexidade. Só 3 cliques entre a oferta e o vídeo.</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              { n: "1", t: "VOCÊ DIGITA", d: "Preço, destino, parcelas." },
              { n: "2", t: "IA CONSTRÓI", d: "Arte montada em 2 segundos." },
              { n: "3", t: "PRONTO", d: "Direto no seu celular com sua logo." }
            ].map((s, i) => (
              <div key={i} className="text-center">
                <div className="w-16 h-16 rounded-full bg-[#e8f1ff] text-[#0055ff] flex items-center justify-center text-2xl font-bold mx-auto mb-6">
                  {s.n}
                </div>
                <h4 className="text-xl font-bold mb-3">{s.t}</h4>
                <p className="text-[#405466]">{s.d}</p>
              </div>
            ))}
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

      {/* VOCÊ SE IDENTIFICA? */}
      <section className="py-24 px-6 bg-[#18191b] text-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-[12px] font-bold text-[#8b3dff] tracking-[0.2em] uppercase mb-4">Você se identifica?</h2>
            <h3 className="text-3xl md:text-5xl font-bold mb-6">Vender viagens ficou impossível com um perfil comum</h3>
            <p className="text-lg text-white/70">Se você se identifica com algum desses, continue lendo.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { icon: "👻", title: "Instagram Fantasma", desc: "Você posta uma vez por semana (com medo) e o engajamento é zero. Cliente passa direto para o concorrente." },
              { icon: "🎨", title: "Designer Entregou Lixo", desc: "Pagou R$ 500 nas artes bonitas mas não vende." },
              { icon: "💸", title: "Viajante de alta renda Te Ignora", desc: "Quem paga R$ 8.000 por pacote olha seu perfil 3 segundos e vai para o concorrente com perfil e site top." },
              { icon: "⏳", title: "Não Fazer Nada Custa Mais", desc: "Cada dia com perfil e site parado são viagens que seu concorrente fecha no lugar de você. O custo real de não agir é muito mais que 8k/mês em vendas." }
            ].map((item, i) => (
              <div key={i} className="bg-white/5 border border-white/10 p-8 rounded-2xl">
                <div className="text-4xl mb-4">{item.icon}</div>
                <h4 className="text-xl font-bold mb-3">{item.title}</h4>
                <p className="text-white/60 leading-relaxed">{item.desc}</p>
              </div>
            ))}
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
      <section id="comparativo" className="py-24 px-6 bg-white">
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
                  { l: "Conteúdo", a: "150 reels fixos", b: "4–8 entregas/mês", c: "250+ vídeos 4K + Sites de Vendas" },
                  { l: "Atualizações", a: "❌ Nenhuma", b: "Depende dele", c: "✅ Acesso vitalício à evolução" },
                  { l: "IAs e Scripts", a: "❌ Não tem", b: "❌ Não tem", c: "✅ 11 IAs + Fábrica de Anúncios" },
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

      {/* A PERGUNTA QUE TODO MUNDO FAZ */}
      <section className="py-24 px-6 bg-[#f7f9fa]">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-5xl font-bold mb-8">"Por que tão barato? Você não tá escondendo nada?"</h2>
          <div className="text-lg text-[#405466] leading-relaxed space-y-6 text-left">
            <p><strong>Resposta honesta:</strong> cobramos R$ 16/mês porque atendemos 187 agências, não 3 contas grandes. O custo de produzir um vídeo se divide entre todo mundo.</p>
            <p>Sem designer no meio = sem repasse de R$ 1.500/mês para você. A IA escreve as legendas; o time só revisa.</p>
            <p>Quanto mais agências entram, mais vídeos novos conseguimos produzir por semana. É por isso que o preço continua o mesmo desde 2023.</p>
          </div>
          <div className="mt-12 text-left border-l-4 border-[#8b3dff] pl-6 py-2">
            <div className="font-bold text-2xl">LF</div>
            <div className="font-bold text-lg mt-2">Lucas Ferrari</div>
            <div className="text-[#405466]">Fundador · Canva Viagem</div>
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

          {/* O que deixa de ganhar */}
          <div className="max-w-3xl mx-auto mt-16 bg-[#f7f9fa] p-8 rounded-2xl border border-[#d4d8db]">
            <h4 className="font-bold text-xl mb-4 text-center">O que você deixa de ganhar sem isso:</h4>
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-[#d93025] font-semibold"><X className="w-5 h-5"/> Sem o Canva Viagem: feed parado = 0 DMs orgânicos por mês</div>
              <div className="flex items-center gap-3 text-[#008a00] font-semibold"><Check className="w-5 h-5"/> 1 pacote vendido pelo feed: R$ 3.500 a R$ 8.000 de lucro</div>
              <div className="flex items-center gap-3 text-[#8b3dff] font-bold"><Star className="w-5 h-5"/> Retorno do plano Elite em 1 venda: 2.300%</div>
            </div>
            <p className="text-sm text-[#405466] mt-6 text-center">1 pacote de viagem fechado paga 23 anos de assinatura.</p>
          </div>
        </div>
      </section>

      {/* GARANTIA */}
      <section className="py-20 px-6 bg-[#18191b] text-white">
        <div className="max-w-4xl mx-auto text-center">
          <ShieldCheck className="w-16 h-16 mx-auto mb-6 text-[#00d2ff]" />
          <h2 className="text-3xl md:text-5xl font-bold mb-6">Garantia Dupla</h2>
          <p className="text-xl text-white/80 mb-12">O risco é 100% meu — não seu.</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left max-w-2xl mx-auto mb-16">
            <div className="bg-white/10 p-6 rounded-xl">
              <div className="text-4xl font-black text-[#00d2ff] opacity-50 mb-2">1</div>
              <h4 className="text-xl font-bold mb-2">7 dias para testar tudo</h4>
              <p className="text-white/70">Acesso completo. Não gostou? Devolvo.</p>
            </div>
            <div className="bg-white/10 p-6 rounded-xl">
              <div className="text-4xl font-black text-[#00d2ff] opacity-50 mb-2">2</div>
              <h4 className="text-xl font-bold mb-2">Qualidade não convenceu?</h4>
              <p className="text-white/70">100% de volta.</p>
            </div>
          </div>

          <div className="bg-white text-[#0e1318] p-8 rounded-2xl max-w-3xl mx-auto text-left shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#8b3dff]/10 rounded-bl-full"></div>
            <h3 className="text-2xl font-bold mb-4">Seu feed. Sua autoridade. Sua decisão.</h3>
            <p className="text-[#405466] mb-4">Você provavelmente está pensando: "Parece bom, mas vou ver depois."</p>
            <p className="text-[#405466] font-bold mb-6">Cada dia com feed parado é um pacote fechando com o concorrente. Não existe depois. Existe agora ou existe perda.</p>
            <p className="text-[#405466] mb-8">A garantia dupla existe exatamente para você testar sem risco. Se não funcionar, devolvemos tudo. Simples assim.</p>
            
            <button onClick={() => { document.getElementById('planos')?.scrollIntoView({ behavior: 'smooth' }) }} className="bg-[#8b3dff] hover:bg-[#7b32e6] text-white px-8 py-4 rounded-lg text-lg font-bold transition-transform hover:scale-105 w-full text-center">
              QUERO ACESSO ELITE — R$ 28,91/MÊS →
            </button>
            <div className="text-center text-sm font-semibold text-[#008a00] mt-4">
              Acesso em 2 min · Garantia dupla · Cancele quando quiser
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
