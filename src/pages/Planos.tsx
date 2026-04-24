import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import SeoMetadata from "@/components/SeoMetadata";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { UserInfoCard } from "@/components/UserInfoCard";
import { trackViewContent, trackInitiateCheckout } from "@/lib/meta-pixel";
import {
  Loader2, Check, Plane, Settings, RefreshCw, Star, ChevronDown, ChevronUp,
  Zap, Crown, Users, Video, Bot, Calendar, FileText, Sparkles, MessageSquare,
  Globe, TrendingUp, Shield, ArrowRight, X
} from "lucide-react";
import garantia7dias from "@/assets/garantia-7-dias.png";

// ─── Stripe checkout links ────────────────────────────────────────────────────
const STRIPE = {
  pro_monthly: "https://buy.stripe.com/8x26oIgGuej656zaAY8so05",
  pro_annual:  "https://buy.stripe.com/dRm8wQ75U1wk7eH9wU8so09",
  // Elite links — criar no Stripe Dashboard e substituir abaixo
  elite_monthly: "#elite-checkout-mensal",
  elite_annual:  "#elite-checkout-anual",
};

// ─── Depoimentos ──────────────────────────────────────────────────────────────
const PROOFS = [
  {
    name: "Agente de Viagens",
    source: "WhatsApp",
    text: "Parabéns pelo trabalho, ajudou muito aqui. Tava batendo cabeça pra criar vídeos dos lugares pra postar.",
    initials: "A",
  },
  {
    name: "@vleviagens",
    source: "Instagram",
    text: "Eu comprei, estou usando e é maravilhoso o conteúdo. Recomendo demais pra qualquer agente.",
    initials: "V",
  },
  {
    name: "Agente do Nordeste",
    source: "WhatsApp",
    text: "Hoje meu Instagram parece o de uma grande agência. Antes ficava dias sem postar. Agora é todo dia.",
    initials: "N",
  },
];

// ─── FAQ ──────────────────────────────────────────────────────────────────────
const FAQS = [
  {
    q: "Qual a diferença entre o plano Pro e o Elite?",
    a: "O Pro te dá tudo para postar conteúdo profissional todo dia: 250+ vídeos, IA, scripts e calendário. O Elite vai além: adiciona scripts prontos para Meta Ads, templates de WhatsApp Business, conteúdo em Espanhol e acesso ao grupo VIP com a equipe.",
  },
  {
    q: "Qual a diferença entre o plano Mensal e o Anual?",
    a: "Exatamente o mesmo acesso. No Anual você bloqueia o preço por 12 meses e economiza mais de R$ 150 comparado ao Mensal.",
  },
  {
    q: "Preciso saber design, edição ou marketing?",
    a: "Não. Os vídeos e artes chegam prontos pra baixar e publicar. Se quiser colocar seu logo, é um clique no Canva.",
  },
  {
    q: "O conteúdo é exclusivo ou é o mesmo que todo mundo usa?",
    a: "Produzido exclusivamente para a plataforma. Você não vai encontrar em banco de imagens, Pinterest ou YouTube.",
  },
  {
    q: "Posso cancelar a qualquer momento?",
    a: "Sim. Sem multa, sem prazo mínimo. Basta entrar em contato e o cancelamento é feito na hora.",
  },
  {
    q: "E se eu não gostar?",
    a: "7 dias de garantia incondicional. Pediu reembolso, devolvemos 100%. Sem perguntas, sem burocracia.",
  },
];

// ─── Feature grid para tabela comparativa ─────────────────────────────────────
const FEATURES = [
  { label: "Vídeos de destinos",             free: "—",       pro: "250+",       elite: "250+" },
  { label: "100+ Ofertas Validadas",          free: "3 itens", pro: "Completo",   elite: "Completo" },
  { label: "50 Rankings de Destinos",         free: "—",       pro: "✓",          elite: "✓" },
  { label: "Stories e Reels prontos",         free: "—",       pro: "200+",       elite: "200+" },
  { label: "Scripts de Venda & WhatsApp",     free: "—",       pro: "✓",          elite: "✓" },
  { label: "Legendas & CTAs de Alto Impacto", free: "✓",       pro: "✓",          elite: "✓" },
  { label: "Ferramentas de IA",               free: "8 agentes", pro: "11 agentes", elite: "11 agentes" },
  { label: "Novos conteúdos",                 free: "—",       pro: "Toda semana", elite: "Toda semana" },
  { label: "Scripts Meta Ads prontos",        free: "—",       pro: "—",          elite: "50+ scripts" },
  { label: "Templates WhatsApp Business",     free: "—",       pro: "—",          elite: "100+" },
  { label: "Conteúdo em Espanhol",            free: "—",       pro: "—",          elite: "✓" },
  { label: "Grupo VIP com a equipe",          free: "—",       pro: "—",          elite: "✓" },
];

// ─── Component ────────────────────────────────────────────────────────────────
const Planos = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { setLanguage } = useLanguage();

  useEffect(() => {
    document.documentElement.lang = "pt";
    setLanguage("pt");
  }, [setLanguage]);

  const { user, loading: authLoading, subscription, refreshSubscription } = useAuth();
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">("annual");
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [portalLoading, setPortalLoading] = useState(false);
  const [refreshLoading, setRefreshLoading] = useState(false);
  const [showStickyBar, setShowStickyBar] = useState(false);

  useEffect(() => { trackViewContent("Página de Planos"); }, []);

  useEffect(() => {
    const success = searchParams.get("success");
    const canceled = searchParams.get("canceled");
    if (success === "true") {
      toast.success("Assinatura ativada com sucesso! Bem-vindo 🎉");
      refreshSubscription();
    } else if (canceled === "true") {
      toast.info("Pagamento cancelado. Você pode tentar novamente quando quiser.");
    }
  }, [searchParams, refreshSubscription]);

  // Show sticky bar after scrolling past the hero
  useEffect(() => {
    const handleScroll = () => setShowStickyBar(window.scrollY > 600);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleCheckout = (plan: "pro" | "elite") => {
    const price = plan === "pro"
      ? (billingCycle === "annual" ? 197 : 29)
      : (billingCycle === "annual" ? 497 : 67);
    trackInitiateCheckout(price);
    const url = plan === "pro"
      ? (billingCycle === "annual" ? STRIPE.pro_annual : STRIPE.pro_monthly)
      : (billingCycle === "annual" ? STRIPE.elite_annual : STRIPE.elite_monthly);
    window.open(url, "_blank");
  };

  const handleManageSubscription = async () => {
    setPortalLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("create-portal-session");
      if (error) throw error;
      if (data?.url) window.open(data.url, "_blank");
    } catch {
      toast.error("Erro ao abrir portal. Tente novamente.");
    } finally {
      setPortalLoading(false);
    }
  };

  const handleRefreshSubscription = async () => {
    setRefreshLoading(true);
    try { await refreshSubscription(); toast.success("Status atualizado!"); }
    catch { toast.error("Erro ao atualizar status"); }
    finally { setRefreshLoading(false); }
  };

  if (authLoading || subscription.loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-black" />
      </div>
    );
  }

  // ─── Já assinante ────────────────────────────────────────────────────────────
  if (subscription.subscribed) {
    return (
      <div className="min-h-screen bg-white">
        <SeoMetadata title="Minha Assinatura" description="Gerencie sua assinatura Canva Viagem." />
        <Header />
        <div className="max-w-2xl mx-auto px-5 py-16">
          <UserInfoCard />
          <div className="mt-8 border border-zinc-200 rounded-2xl p-8 text-center">
            <div className="w-14 h-14 bg-black rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="h-7 w-7 text-white" />
            </div>
            <h2 className="text-2xl font-black mb-2">Você é Pro ✓</h2>
            <p className="text-zinc-500 mb-2">
              {subscription.subscriptionEnd
                ? `Sua assinatura está ativa até ${new Date(subscription.subscriptionEnd).toLocaleDateString("pt-BR")}.`
                : "Sua assinatura está ativa."}
            </p>

            {/* Upsell para Elite */}
            <div className="my-6 rounded-2xl border border-violet-200 bg-gradient-to-br from-violet-50 to-sky-50 p-5 text-left">
              <div className="flex items-center gap-2 mb-2">
                <Crown className="h-4 w-4 text-violet-600" />
                <span className="text-sm font-black text-violet-700">Novo: Plano Elite</span>
                <span className="bg-violet-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full">NOVO</span>
              </div>
              <p className="text-sm text-zinc-600 mb-3">
                Faça upgrade e ganhe acesso a Scripts Meta Ads, Templates WhatsApp Business, conteúdo em Espanhol e grupo VIP.
              </p>
              <button
                onClick={() => handleCheckout("elite")}
                className="w-full bg-violet-600 text-white text-sm font-black py-3 rounded-xl hover:bg-violet-700 transition-all"
              >
                Fazer Upgrade para Elite →
              </button>
            </div>

            <div className="flex flex-col gap-3">
              <Button className="bg-black text-white hover:bg-zinc-800 h-12 rounded-xl font-bold" onClick={() => navigate("/")}>
                <Plane className="mr-2 h-4 w-4" /> Acessar Plataforma
              </Button>
              <div className="flex gap-3">
                <Button variant="outline" className="flex-1 border-zinc-200 rounded-xl" onClick={handleManageSubscription} disabled={portalLoading}>
                  {portalLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Settings className="mr-2 h-4 w-4" />Gerenciar</>}
                </Button>
                <Button variant="ghost" className="flex-1 rounded-xl" onClick={handleRefreshSubscription} disabled={refreshLoading}>
                  {refreshLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <><RefreshCw className="mr-2 h-4 w-4" />Atualizar</>}
                </Button>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const isAnnual = billingCycle === "annual";

  return (
    <div className="min-h-screen bg-white text-black">
      <SeoMetadata
        title="Planos — Canva Viagem"
        description="Marketing pronto para agentes de viagem. 250+ vídeos, IA e templates editáveis."
        keywords="assinar canva viagem, planos marketing turístico, assinatura agência de viagens"
      />

      <Header />

      {/* ─── HERO ──────────────────────────────────────────────────────────────── */}
      <section className="relative bg-zinc-950 text-white overflow-hidden pt-16 pb-20 px-5">
        {/* Background gradient blobs */}
        <div className="absolute top-0 left-1/4 w-72 h-72 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-violet-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-3xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur border border-white/10 rounded-full px-4 py-1.5 text-xs font-bold tracking-wide text-white/80 mb-6">
            <Users className="h-3 w-3 text-sky-400" />
            1.200+ agentes de viagem já assinaram
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black leading-[1.05] tracking-tight mb-5">
            Conteúdo pronto{" "}
            <span className="bg-gradient-to-r from-sky-400 to-violet-400 bg-clip-text text-transparent">
              pra vender viagens
            </span>{" "}
            todo dia
          </h1>

          <p className="text-zinc-400 text-base sm:text-lg max-w-xl mx-auto mb-8 leading-relaxed">
            250+ reels e artes prontos, 11 agentes de IA e scripts de venda. Seu Instagram com cara de grande agência — sem designer, sem equipe.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-12">
            <a href="#planos">
              <button className="w-full sm:w-auto bg-gradient-to-r from-sky-500 to-violet-600 text-white font-black text-base px-8 py-4 rounded-2xl hover:opacity-90 transition-all shadow-xl hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2">
                Ver planos <ArrowRight className="h-4 w-4" />
              </button>
            </a>
            <a href="#exemplos">
              <button className="w-full sm:w-auto bg-white/10 border border-white/10 text-white font-bold text-base px-8 py-4 rounded-2xl hover:bg-white/15 transition-all flex items-center justify-center gap-2">
                Ver exemplos de conteúdo
              </button>
            </a>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-4 max-w-lg mx-auto">
            {[
              { value: "250+", label: "vídeos prontos" },
              { value: "11",   label: "agentes de IA" },
              { value: "7",    label: "dias de garantia" },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <p className="text-2xl sm:text-3xl font-black text-white">{s.value}</p>
                <p className="text-xs text-zinc-500 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── DEPOIMENTOS ────────────────────────────────────────────────────────── */}
      <section className="py-10 px-5 bg-white border-b border-zinc-100">
        <div className="max-w-3xl mx-auto">
          <p className="text-[11px] font-bold tracking-widest text-zinc-400 uppercase mb-5 text-center">
            O que dizem os agentes
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {PROOFS.map((p) => (
              <div key={p.name} className="bg-zinc-950 text-white rounded-2xl p-5 flex flex-col gap-3">
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, i) => <Star key={i} className="h-3 w-3 fill-yellow-400 text-yellow-400" />)}
                </div>
                <p className="text-sm text-zinc-300 italic leading-relaxed flex-1">"{p.text}"</p>
                <div className="flex items-center gap-2 border-t border-zinc-800 pt-2">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-sky-500 to-violet-600 flex items-center justify-center text-[10px] font-black text-white shrink-0">
                    {p.initials}
                  </div>
                  <p className="text-xs font-bold text-white">{p.name} · {p.source}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── EXEMPLOS DE CONTEÚDO ────────────────────────────────────────────────── */}
      <section id="exemplos" className="py-14 px-5 bg-zinc-950">
        <div className="max-w-3xl mx-auto">
          <p className="text-[11px] font-bold tracking-widest text-zinc-500 uppercase mb-3 text-center">
            Exemplos reais do conteúdo
          </p>
          <h2 className="text-2xl sm:text-3xl font-black text-center text-white mb-2 leading-snug">
            É isso que você vai ter na mão hoje
          </h2>
          <p className="text-zinc-400 text-center mb-8 text-sm max-w-lg mx-auto">
            Cada um desses vídeos foi criado para agentes postarem diretamente no Instagram, TikTok ou WhatsApp — sem editar nada.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              "https://media4.giphy.com/media/tJPdq4gvTvr8CgIyWI/giphy.gif",
              "https://media1.giphy.com/media/v1.Y2lkPTc5MGI3NjExbWt3MGhsd3g1MnJtbzlkMDloczlhdTJvNWhubjZ4Z3FtNnJkeDd1aCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/ZQZVm01DFW3qHY0ZKs/giphy.gif",
              "https://media1.giphy.com/media/v1.Y2lkPTc5MGI3NjExb3J2anV0aTVkYWowbDl1ZXFtNnB4ZWUwcnVnZTVzOW91ZzNncGNvNSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/mbylDFYWSU46XeLcsS/giphy.gif",
              "https://media4.giphy.com/media/v1.Y2lkPTc5MGI3NjExcXQ1dHAxM2JxcWM0N3VqdWhibnBtcDR5eWVmNTZwaGI1NTJjeml3diZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/VcFJaM72FG76eG75In/giphy.gif",
            ].map((gif, i) => (
              <div key={i} className="rounded-2xl overflow-hidden border border-zinc-800 aspect-[9/16]">
                <img
                  src={gif}
                  loading="lazy"
                  alt={`Exemplo de vídeo de viagem ${i + 1}`}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                />
              </div>
            ))}
          </div>
          <p className="text-zinc-500 text-xs text-center mt-5">250+ vídeos disponíveis · Novos toda semana</p>
        </div>
      </section>

      {/* ─── COMO FUNCIONA ───────────────────────────────────────────────────────── */}
      <section className="py-14 px-5 bg-white border-b border-zinc-100">
        <div className="max-w-2xl mx-auto">
          <p className="text-[11px] font-bold tracking-widest text-zinc-400 uppercase mb-3 text-center">
            Como funciona?
          </p>
          <h2 className="text-2xl sm:text-3xl font-black text-center mb-10 leading-snug">Em 3 passos simples.</h2>
          <div className="space-y-7">
            {[
              { n: "1", icon: Video, title: "Escolha o conteúdo", desc: "Navegue por 250+ destinos: Disney, Maldivas, Paris, Nordeste, Europa e muito mais." },
              { n: "2", icon: Sparkles, title: "Baixe ou edite com 1 clique", desc: "Abra no Canva, coloque seu logo e suas cores. Ou baixe direto — já está pronto." },
              { n: "3", icon: TrendingUp, title: "Publique e venda mais", desc: "Cole no Instagram, TikTok ou WhatsApp. Perfil profissional em menos de 2 minutos." },
            ].map((step) => (
              <div key={step.n} className="flex gap-5 items-start">
                <div className="shrink-0 w-12 h-12 bg-black text-white rounded-2xl flex items-center justify-center font-black text-xl">
                  {step.n}
                </div>
                <div className="pt-1">
                  <h3 className="font-black text-base mb-1 flex items-center gap-2">
                    <step.icon className="h-4 w-4 text-zinc-400" />
                    {step.title}
                  </h3>
                  <p className="text-zinc-500 text-sm leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── PLANOS ──────────────────────────────────────────────────────────────── */}
      <section id="planos" className="bg-zinc-950 text-white py-16 px-5 scroll-mt-20">
        <div className="max-w-5xl mx-auto">
          <p className="text-[11px] font-bold tracking-widest text-zinc-500 uppercase mb-3 text-center">
            Escolha seu plano
          </p>
          <h2 className="text-3xl sm:text-4xl font-black text-center mb-2 leading-tight">
            Quanto vale não precisar criar do zero?
          </h2>
          <p className="text-zinc-400 text-sm text-center mb-8 max-w-md mx-auto leading-relaxed">
            Um social media cobra em média R$ 800–2.000/mês. A plataforma inteira custa a partir de{" "}
            <strong className="text-white">R$ 16,41/mês</strong>.
          </p>

          {/* Toggle Mensal / Anual */}
          <div className="flex justify-center mb-10">
            <div className="bg-zinc-800 p-1 rounded-full flex gap-1">
              <button
                onClick={() => setBillingCycle("monthly")}
                className={cn(
                  "px-6 py-2.5 rounded-full text-sm font-bold transition-all",
                  !isAnnual ? "bg-white text-black shadow" : "text-zinc-400 hover:text-zinc-200"
                )}
              >
                Mensal
              </button>
              <button
                onClick={() => setBillingCycle("annual")}
                className={cn(
                  "px-6 py-2.5 rounded-full text-sm font-bold transition-all flex items-center gap-2",
                  isAnnual ? "bg-white text-black shadow" : "text-zinc-400 hover:text-zinc-200"
                )}
              >
                Anual
                <span className="bg-yellow-400 text-black text-[10px] font-black px-1.5 py-0.5 rounded-full leading-none">
                  −42%
                </span>
              </button>
            </div>
          </div>

          {/* 3 Pricing cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

            {/* ── Grátis ── */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 flex flex-col">
              <div className="mb-5">
                <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1">Grátis</p>
                <div className="flex items-baseline gap-1 mb-1">
                  <span className="text-4xl font-black">R$ 0</span>
                </div>
                <p className="text-zinc-600 text-xs">Acesso limitado para testar a plataforma</p>
              </div>
              <ul className="space-y-2 mb-6 flex-1">
                {[
                  "Legendas & CTAs de Alto Impacto",
                  "3 ofertas validadas",
                  "8 agentes de IA",
                ].map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm text-zinc-400">
                    <Check className="h-4 w-4 text-zinc-600 shrink-0 mt-0.5" />
                    {f}
                  </li>
                ))}
                {[
                  "Vídeos de destinos",
                  "Scripts de venda",
                  "Calendário editorial",
                ].map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm text-zinc-600">
                    <X className="h-4 w-4 text-zinc-700 shrink-0 mt-0.5" />
                    {f}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => navigate("/auth")}
                className="w-full border border-zinc-700 text-zinc-400 font-bold text-sm py-3.5 rounded-2xl hover:border-zinc-500 hover:text-zinc-200 transition-all"
              >
                Criar conta grátis
              </button>
            </div>

            {/* ── Pro (destaque) ── */}
            <div className="relative bg-white text-black rounded-3xl overflow-hidden flex flex-col shadow-2xl shadow-white/10 scale-[1.02] md:scale-105">
              <div className="bg-yellow-400 text-black text-center py-2.5 text-xs font-black tracking-wide">
                MAIS POPULAR — MELHOR CUSTO-BENEFÍCIO
              </div>
              <div className="p-6 flex flex-col flex-1">
                <div className="mb-5">
                  <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-1">Pro</p>
                  {!isAnnual && (
                    <p className="text-sm text-zinc-400 line-through mb-0.5">De R$ 44,62/mês</p>
                  )}
                  <div className="flex items-baseline gap-1 mb-1">
                    <span className="text-5xl font-black">R$ {isAnnual ? "16,41" : "29"}</span>
                    <span className="text-zinc-400 text-base">/mês</span>
                  </div>
                  <p className="text-zinc-500 text-xs">
                    {isAnnual
                      ? "R$ 197/ano · Você economiza R$ 151"
                      : "Recorrência mensal · Cancele quando quiser"}
                  </p>
                </div>
                <ul className="space-y-2 mb-6 flex-1">
                  {[
                    "250+ vídeos e 100+ destinos",
                    "Central de Ofertas 'Copia e Cola'",
                    "Scripts de Venda e WhatsApp",
                    "11 agentes de IA de marketing",
                    "Calendário editorial 365 dias",
                    "Novos conteúdos toda semana",
                    "Garantia 7 dias",
                  ].map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-sm text-zinc-700">
                      <span className="w-4 h-4 bg-black rounded-full flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="h-2.5 w-2.5 text-white" />
                      </span>
                      {f}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => handleCheckout("pro")}
                  className="w-full bg-black text-white font-black text-base py-4 rounded-2xl hover:bg-zinc-800 transition-all shadow-lg hover:-translate-y-0.5 active:translate-y-0"
                >
                  {isAnnual ? "Assinar Pro por R$ 197/ano →" : "Assinar Pro por R$ 29/mês →"}
                </button>
              </div>
            </div>

            {/* ── Elite (novo) ── */}
            <div className="relative bg-zinc-900 border border-violet-500/40 rounded-3xl overflow-hidden flex flex-col">
              {/* Gradient top line */}
              <div className="h-1 w-full bg-gradient-to-r from-sky-500 to-violet-600" />
              <div className="p-6 flex flex-col flex-1">
                <div className="mb-5">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-xs font-bold text-violet-400 uppercase tracking-widest">Elite</p>
                    <span className="bg-violet-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full">NOVO</span>
                  </div>
                  <div className="flex items-baseline gap-1 mb-1">
                    <span className="text-5xl font-black text-white">R$ {isAnnual ? "41" : "67"}</span>
                    <span className="text-zinc-400 text-base">/mês</span>
                  </div>
                  <p className="text-zinc-500 text-xs">
                    {isAnnual
                      ? "R$ 497/ano · Você economiza R$ 307"
                      : "Recorrência mensal · Cancele quando quiser"}
                  </p>
                </div>
                <p className="text-xs text-zinc-500 mb-3 font-medium">Tudo do Pro, mais:</p>
                <ul className="space-y-2 mb-6 flex-1">
                  {[
                    { icon: FileText, text: "50+ Scripts Meta Ads prontos" },
                    { icon: MessageSquare, text: "100+ Templates WhatsApp Business" },
                    { icon: Globe, text: "Conteúdo em Espanhol incluído" },
                    { icon: Crown, text: "Grupo VIP com a equipe" },
                    { icon: Zap, text: "Acesso antecipado a novidades" },
                  ].map((f) => (
                    <li key={f.text} className="flex items-start gap-2.5 text-sm text-zinc-300">
                      <span className="w-4 h-4 bg-violet-600 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="h-2.5 w-2.5 text-white" />
                      </span>
                      {f.text}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => handleCheckout("elite")}
                  className="w-full bg-gradient-to-r from-sky-500 to-violet-600 text-white font-black text-base py-4 rounded-2xl hover:opacity-90 transition-all hover:-translate-y-0.5 active:translate-y-0"
                >
                  {isAnnual ? "Assinar Elite por R$ 497/ano →" : "Assinar Elite por R$ 67/mês →"}
                </button>
              </div>
            </div>
          </div>

          {/* Garantia */}
          <div className="mt-8 flex items-center gap-4 bg-zinc-900 border border-zinc-800 rounded-2xl p-4 max-w-xl mx-auto">
            <img src={garantia7dias} alt="Garantia 7 dias" className="w-12 h-12 object-contain shrink-0" />
            <div>
              <h4 className="font-black text-sm mb-0.5 text-white">Garantia incondicional de 7 dias</h4>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Entrou, testou e não gostou? Devolvemos 100% do seu dinheiro. Sem pergunta. Sem burocracia.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── TABELA COMPARATIVA ──────────────────────────────────────────────────── */}
      <section className="py-14 px-5 bg-zinc-50 border-b border-zinc-100">
        <div className="max-w-3xl mx-auto">
          <p className="text-[11px] font-bold tracking-widest text-zinc-400 uppercase mb-3 text-center">
            Comparativo completo
          </p>
          <h2 className="text-2xl sm:text-3xl font-black text-center mb-8 leading-snug">
            Grátis · Pro · Elite — sem enrolação.
          </h2>
          <div className="overflow-hidden rounded-2xl border border-zinc-200 overflow-x-auto">
            <table className="w-full min-w-[480px] text-sm">
              <thead>
                <tr className="bg-zinc-950 text-white">
                  <th className="py-3 px-5 text-left font-bold text-zinc-400 text-xs uppercase tracking-widest w-1/2">Recurso</th>
                  <th className="py-3 px-3 text-center font-bold text-zinc-400 text-xs uppercase tracking-widest">Grátis</th>
                  <th className="py-3 px-3 text-center font-black text-yellow-400 text-xs uppercase tracking-widest border-l border-zinc-800">Pro ⭐</th>
                  <th className="py-3 px-3 text-center font-black text-xs uppercase tracking-widest border-l border-zinc-800">
                    <span className="bg-gradient-to-r from-sky-400 to-violet-400 bg-clip-text text-transparent">Elite ✦</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {FEATURES.map((row, i) => (
                  <tr key={row.label} className={i % 2 === 0 ? "bg-white" : "bg-zinc-50"}>
                    <td className="py-3 px-5 font-medium text-zinc-700">{row.label}</td>
                    <td className="py-3 px-3 text-center text-zinc-400 border-l border-zinc-100">{row.free}</td>
                    <td className="py-3 px-3 text-center font-bold text-black border-l border-zinc-100 bg-yellow-50">{row.pro}</td>
                    <td className="py-3 px-3 text-center font-bold text-violet-700 border-l border-zinc-100 bg-violet-50/30">{row.elite}</td>
                  </tr>
                ))}
                <tr className="bg-zinc-950 border-t border-zinc-800">
                  <td className="py-4 px-5 text-white text-xs font-bold">Seu plano:</td>
                  <td className="py-4 px-3 text-center border-l border-zinc-800">
                    <span className="text-zinc-500 text-xs">Limitado</span>
                  </td>
                  <td className="py-4 px-3 text-center border-l border-zinc-800">
                    <a href="#planos">
                      <button className="bg-yellow-400 text-black text-xs font-black px-4 py-2 rounded-full hover:bg-yellow-300 transition-all whitespace-nowrap">
                        Assinar Pro →
                      </button>
                    </a>
                  </td>
                  <td className="py-4 px-3 text-center border-l border-zinc-800">
                    <a href="#planos">
                      <button className="bg-gradient-to-r from-sky-500 to-violet-600 text-white text-xs font-black px-4 py-2 rounded-full hover:opacity-90 transition-all whitespace-nowrap">
                        Assinar Elite →
                      </button>
                    </a>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ─── FAQ ─────────────────────────────────────────────────────────────────── */}
      <section className="py-14 px-5 bg-white border-b border-zinc-100">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-black text-center mb-8">Dúvidas frequentes</h2>
          <div className="space-y-2">
            {FAQS.map((faq, i) => (
              <div key={i} className="border border-zinc-200 rounded-2xl overflow-hidden">
                <button
                  className="w-full flex items-center justify-between gap-4 p-4 text-left font-bold text-sm hover:bg-zinc-50 transition-colors min-h-[52px]"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                >
                  {faq.q}
                  {openFaq === i
                    ? <ChevronUp className="h-4 w-4 text-zinc-400 shrink-0" />
                    : <ChevronDown className="h-4 w-4 text-zinc-400 shrink-0" />}
                </button>
                {openFaq === i && (
                  <div className="px-4 pb-4 text-sm text-zinc-500 leading-relaxed border-t border-zinc-100 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA FINAL ───────────────────────────────────────────────────────────── */}
      <section className="bg-zinc-950 text-white py-16 px-5 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-sky-500/5 to-violet-500/5 pointer-events-none" />
        <div className="relative max-w-xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-4 py-1.5 text-xs font-bold text-white/70 mb-6">
            <Shield className="h-3 w-3 text-green-400" />
            Pagamento seguro via Stripe · Acesso imediato
          </div>
          <h2 className="text-2xl sm:text-3xl font-black mb-3 leading-tight">
            Comece hoje. Poste amanhã.
          </h2>
          <p className="text-zinc-400 text-sm mb-8">Garantia de 7 dias · Acesso imediato · Cancele quando quiser</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => handleCheckout("pro")}
              className="btn-shine bg-yellow-400 text-black font-black text-base px-8 py-4 rounded-2xl hover:bg-yellow-300 transition-all shadow-xl hover:-translate-y-0.5 active:translate-y-0"
            >
              {isAnnual ? "Assinar Pro por R$ 197/ano →" : "Assinar Pro por R$ 29/mês →"}
            </button>
            <button
              onClick={() => handleCheckout("elite")}
              className="bg-gradient-to-r from-sky-500 to-violet-600 text-white font-black text-base px-8 py-4 rounded-2xl hover:opacity-90 transition-all hover:-translate-y-0.5 active:translate-y-0"
            >
              {isAnnual ? "Assinar Elite por R$ 497/ano →" : "Assinar Elite por R$ 67/mês →"}
            </button>
          </div>
        </div>
      </section>

      <Footer />

      {/* ─── STICKY MOBILE CTA ────────────────────────────────────────────────────
          Aparece apenas no mobile depois de rolar 600px
      ─────────────────────────────────────────────────────────────────────────── */}
      <div
        className={cn(
          "fixed bottom-0 left-0 right-0 z-50 md:hidden bg-zinc-950/95 backdrop-blur border-t border-zinc-800 px-4 py-3 transition-all duration-300",
          showStickyBar ? "translate-y-0 opacity-100" : "translate-y-full opacity-0 pointer-events-none"
        )}
      >
        <div className="flex gap-2 max-w-sm mx-auto">
          <button
            onClick={() => handleCheckout("pro")}
            className="flex-1 bg-yellow-400 text-black font-black text-sm py-3.5 rounded-xl hover:bg-yellow-300 transition-all"
          >
            {isAnnual ? "Pro · R$ 197/ano" : "Pro · R$ 29/mês"}
          </button>
          <button
            onClick={() => handleCheckout("elite")}
            className="flex-1 bg-gradient-to-r from-sky-500 to-violet-600 text-white font-black text-sm py-3.5 rounded-xl hover:opacity-90 transition-all"
          >
            {isAnnual ? "Elite · R$ 497/ano" : "Elite · R$ 67/mês"}
          </button>
        </div>
        <p className="text-center text-[10px] text-zinc-600 mt-1.5">Garantia 7 dias · Acesso imediato</p>
      </div>
    </div>
  );
};

export default Planos;
