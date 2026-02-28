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
  Loader2, Check, Plane, Settings, RefreshCw, Shield,
  Star, ChevronDown, ChevronUp, Bot, Video, Zap
} from "lucide-react";
import garantia7dias from "@/assets/garantia-7-dias.png";

// ─── Stripe Links ─────────────────────────────────────────────────────────────
const STRIPE_LINKS = {
  monthly: "https://buy.stripe.com/8x26oIgGuej656zaAY8so05",
  annual: "https://buy.stripe.com/dRm8wQ75U1wk7eH9wU8so09",
};

// ─── FAQ Data ─────────────────────────────────────────────────────────────────
const faqs = [
  {
    q: "Posso cancelar quando quiser?",
    a: "Sim. Sem multa, sem burocracia. Você cancela por e-mail em menos de 2 minutos e não é cobrado novamente.",
  },
  {
    q: "Preciso saber design ou edição de vídeo?",
    a: "Não. Os vídeos já chegam prontos pra você baixar e postar. Se quiser personalizar, é só abrir no Canva e trocar uma logo.",
  },
  {
    q: "O conteúdo é exclusivo?",
    a: "Sim. São vídeos e artes produzidos exclusivamente para a plataforma — nada que você vai encontrar no Google ou YouTube.",
  },
  {
    q: "Qual a diferença entre Mensal e Anual?",
    a: "Mesmo acesso completo. No anual você economiza 42% e bloqueia o preço por 12 meses inteiros.",
  },
  {
    q: "Tem garantia?",
    a: "7 dias sem risco nenhum. Se não gostar, devolvemos 100% do seu dinheiro. Sem perguntas.",
  },
];

// ─── Proof Data ───────────────────────────────────────────────────────────────
const proofs = [
  {
    name: "Agente de Viagens",
    source: "WhatsApp",
    text: "Parabéns pelo trabalho, ajudou muito aqui. Tava batendo cabeça pra criar vídeos dos lugares pra postar.",
  },
  {
    name: "@vleviagens",
    source: "Instagram",
    text: "Eu comprei, estou usando e é maravilhoso o conteúdo 🙏",
  },
  {
    name: "Agente do Nordeste",
    source: "WhatsApp",
    text: "Economizei horas toda semana. Hoje meu Instagram parece o de uma grande agência.",
  },
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

  const { user, loading: authLoading, subscription, refreshSubscription } =
    useAuth();

  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">(
    "annual"
  );
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [portalLoading, setPortalLoading] = useState(false);
  const [refreshLoading, setRefreshLoading] = useState(false);

  useEffect(() => {
    trackViewContent("Página de Planos");
  }, []);

  useEffect(() => {
    const success = searchParams.get("success");
    const canceled = searchParams.get("canceled");
    if (success === "true") {
      toast.success("Pagamento realizado com sucesso!");
      refreshSubscription();
      navigate("/sucesso");
    } else if (canceled === "true") {
      toast.info("Pagamento cancelado.");
      window.history.replaceState({}, "", "/planos");
    }
  }, [searchParams, refreshSubscription, navigate]);

  const handleCheckout = () => {
    const price = billingCycle === "annual" ? 197.0 : 29.0;
    trackInitiateCheckout(price, "BRL");
    window.location.href =
      billingCycle === "annual" ? STRIPE_LINKS.annual : STRIPE_LINKS.monthly;
  };

  const handleManageSubscription = async () => {
    setPortalLoading(true);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.access_token) {
        toast.error("Você precisa estar logado.");
        navigate("/auth");
        return;
      }
      const { data, error } = await supabase.functions.invoke(
        "customer-portal",
        { headers: { Authorization: `Bearer ${session.access_token}` } }
      );
      if (error) {
        toast.error("Erro ao acessar portal. Tente novamente.");
        return;
      }
      if (data?.url) window.location.href = data.url;
    } catch {
      toast.error("Erro ao processar. Tente novamente.");
    } finally {
      setPortalLoading(false);
    }
  };

  const handleRefreshSubscription = async () => {
    setRefreshLoading(true);
    try {
      await refreshSubscription();
      toast.success("Status da assinatura atualizado!");
    } catch {
      toast.error("Erro ao atualizar status");
    } finally {
      setRefreshLoading(false);
    }
  };

  // ── Loading state ─────────────────────────────────────────────────────────
  if (authLoading || subscription.loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-black" />
      </div>
    );
  }

  // ── Already subscribed ────────────────────────────────────────────────────
  if (subscription.subscribed) {
    return (
      <div className="min-h-screen bg-white">
        <SeoMetadata title="Minha Assinatura" description="Gerencie sua assinatura Canva Viagem." />
        <Header />
        <div className="max-w-2xl mx-auto px-4 py-16">
          <UserInfoCard />
          <div className="mt-8 border border-zinc-200 rounded-2xl p-8 text-center">
            <div className="w-14 h-14 bg-black rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="h-7 w-7 text-white" />
            </div>
            <h2 className="text-2xl font-black mb-2">Você é Premium ✓</h2>
            <p className="text-zinc-500 mb-6">
              {subscription.subscriptionEnd
                ? `Sua assinatura está ativa até ${new Date(subscription.subscriptionEnd).toLocaleDateString("pt-BR")}.`
                : "Sua assinatura está ativa."}
            </p>
            <div className="flex flex-col gap-3">
              <Button className="bg-black text-white hover:bg-zinc-800 h-12 rounded-xl font-bold" onClick={() => navigate("/")}>
                <Plane className="mr-2 h-4 w-4" />
                Acessar Plataforma
              </Button>
              <div className="flex gap-3">
                <Button variant="outline" className="flex-1 border-zinc-200 rounded-xl" onClick={handleManageSubscription} disabled={portalLoading}>
                  {portalLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Settings className="mr-2 h-4 w-4" />Gerenciar</>}
                </Button>
                <Button variant="ghost" className="flex-1 rounded-xl" onClick={handleRefreshSubscription} disabled={refreshLoading}>
                  {refreshLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <><RefreshCw className="mr-2 h-4 w-4" />Atualizar Status</>}
                </Button>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // ── Main Page ─────────────────────────────────────────────────────────────
  const isAnnual = billingCycle === "annual";

  return (
    <div className="min-h-screen bg-white text-black">
      <SeoMetadata
        title="Planos — Canva Viagem"
        description="Acesso completo a 250+ vídeos de viagem, ferramentas de IA e templates prontos."
        keywords="assinar canva viagem, planos marketing turístico, assinatura agência de viagens"
      />
      <Header />

      {user && <div className="max-w-4xl mx-auto px-4 pt-6"><UserInfoCard /></div>}

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section className="max-w-3xl mx-auto px-4 pt-16 pb-12 text-center">
        <p className="text-xs font-bold tracking-[0.25em] text-zinc-400 uppercase mb-5">
          Plataforma de Marketing para Agentes de Viagem
        </p>

        <h1 className="text-4xl md:text-6xl font-black leading-[1.1] mb-6 text-black">
          Pare de perder{" "}
          <span className="relative inline-block">
            horas
            <span className="absolute bottom-1 left-0 w-full h-3 bg-yellow-300 -z-10 opacity-60 rounded" />
          </span>{" "}
          criando conteúdo.
          <br />
          Comece a{" "}
          <span className="italic">vender mais.</span>
        </h1>

        <p className="text-lg md:text-xl text-zinc-500 max-w-2xl mx-auto mb-10 leading-relaxed">
          250+ vídeos prontos, artes editáveis, legendas, calendário anual e IA de marketing — tudo em um único lugar, por menos de <strong className="text-black">R$&nbsp;1 por dia</strong>.
        </p>

        <a href="#preco">
          <button className="bg-black text-white font-black text-lg px-10 py-4 rounded-full hover:bg-zinc-800 transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1 active:translate-y-0">
            Ver planos →
          </button>
        </a>

        <p className="text-sm text-zinc-400 mt-4">
          Garantia de 7 dias · Cancele quando quiser
        </p>
      </section>

      {/* ── DOR ──────────────────────────────────────────────────────────── */}
      <section className="bg-zinc-50 border-y border-zinc-100 py-16 px-4">
        <div className="max-w-3xl mx-auto">
          <p className="text-center text-sm font-bold tracking-widest text-zinc-400 uppercase mb-8">
            Você reconhece algum desses?
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { emoji: "⏰", title: "Horas editando vídeos", desc: "Uma tarde inteira no CapCut pra fazer 1 post que dura 24h." },
              { emoji: "💸", title: "Gastando caro com equipe", desc: "R$ 800 a R$ 2.000/mês com social media ou freelancer." },
              { emoji: "😶‍🌫️", title: "Tela em branco direto", desc: "Todo dia o mesmo: "Que diabos eu publico hoje?"" },
            ].map((item) => (
              <div key={item.title} className="p-6 rounded-2xl bg-white border border-zinc-200">
                <div className="text-3xl mb-3">{item.emoji}</div>
                <h3 className="font-bold mb-1 text-base">{item.title}</h3>
                <p className="text-sm text-zinc-500">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SOLUÇÃO ───────────────────────────────────────────────────────── */}
      <section className="max-w-3xl mx-auto px-4 py-16">
        <p className="text-center text-sm font-bold tracking-widest text-zinc-400 uppercase mb-4">
          A solução
        </p>
        <h2 className="text-3xl md:text-4xl font-black text-center mb-12">
          Tudo pronto. Você só publica.
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { icon: Video, title: "250+ Vídeos de Destinos", desc: "Disney, Maldivas, Paris, Nordeste e muito mais. Prontos pra postar." },
            { icon: Bot, title: "10 Agentes de IA", desc: "Escreva legendas, roteiros e campanhas em segundos com IA treinada pra viagens." },
            { icon: Zap, title: "Artes & Stories", desc: "Templates profissionais editáveis no Canva. Um clique e é seu." },
            { icon: Shield, title: "Calendário Anual", desc: "365 sugestões de post organizadas por data comemorativa e destino." },
          ].map((item) => (
            <div key={item.title} className="flex gap-4 p-5 rounded-2xl border border-zinc-200 hover:border-zinc-400 transition-colors">
              <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center shrink-0">
                <item.icon className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="font-bold mb-1">{item.title}</h3>
                <p className="text-sm text-zinc-500">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── PROVA SOCIAL ──────────────────────────────────────────────────── */}
      <section className="bg-zinc-950 text-white py-16 px-4">
        <div className="max-w-3xl mx-auto">
          <p className="text-center text-sm font-bold tracking-widest text-zinc-500 uppercase mb-10">
            O que dizem os assinantes
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {proofs.map((p) => (
              <div key={p.name} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
                <div className="flex gap-0.5 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-sm text-zinc-300 italic leading-relaxed mb-4">"{p.text}"</p>
                <div>
                  <p className="text-xs font-bold text-white">{p.name}</p>
                  <p className="text-xs text-zinc-500">via {p.source}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PLANOS / PREÇO ────────────────────────────────────────────────── */}
      <section id="preco" className="max-w-2xl mx-auto px-4 py-20 scroll-mt-20">
        <h2 className="text-3xl md:text-4xl font-black text-center mb-3">
          Escolha seu plano
        </h2>
        <p className="text-center text-zinc-500 mb-10">
          Mesmo acesso completo. Assine como preferir.
        </p>

        {/* Toggle */}
        <div className="flex justify-center mb-8">
          <div className="bg-zinc-100 p-1 rounded-full flex gap-1">
            <button
              onClick={() => setBillingCycle("monthly")}
              className={cn(
                "px-6 py-2.5 rounded-full text-sm font-bold transition-all",
                !isAnnual
                  ? "bg-white text-black shadow border border-zinc-200"
                  : "text-zinc-400 hover:text-zinc-600"
              )}
            >
              Mensal
            </button>
            <button
              onClick={() => setBillingCycle("annual")}
              className={cn(
                "px-6 py-2.5 rounded-full text-sm font-bold transition-all flex items-center gap-2",
                isAnnual
                  ? "bg-black text-white shadow"
                  : "text-zinc-400 hover:text-zinc-600"
              )}
            >
              Anual
              <span className="bg-yellow-400 text-black text-[10px] font-black px-1.5 py-0.5 rounded-full leading-none">
                -42%
              </span>
            </button>
          </div>
        </div>

        {/* Card Preço */}
        <div className={cn(
          "border-2 rounded-3xl overflow-hidden",
          isAnnual ? "border-black" : "border-zinc-300"
        )}>
          {isAnnual && (
            <div className="bg-black text-white text-center py-2.5 text-sm font-bold tracking-wide">
              ⭐ MAIS POPULAR — ECONOMIZE 42%
            </div>
          )}

          <div className="p-8 md:p-12">
            <div className="flex items-end justify-between mb-8">
              <div>
                <p className="text-sm text-zinc-400 font-medium mb-1">
                  {isAnnual ? "Plano Anual" : "Plano Mensal"}
                </p>
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl md:text-6xl font-black">
                    R$&nbsp;{isAnnual ? "16,41" : "29,00"}
                  </span>
                  <span className="text-zinc-400 text-lg">/mês</span>
                </div>
                {isAnnual && (
                  <p className="text-sm text-zinc-400 mt-1">
                    Cobrado anualmente · R$ 197,00/ano
                  </p>
                )}
                {!isAnnual && (
                  <p className="text-sm text-zinc-400 mt-1">
                    Cobrança recorrente mensal
                  </p>
                )}
              </div>

              {isAnnual && (
                <div className="text-right">
                  <p className="text-xs text-zinc-400 line-through mb-0.5">R$ 348/ano</p>
                  <p className="text-sm font-black text-green-600">Você economiza R$ 151</p>
                </div>
              )}
            </div>

            {/* Features */}
            <ul className="space-y-3 mb-8">
              {[
                "250+ vídeos de destinos prontos pra postar",
                "10 agentes de IA de marketing para viagens",
                "Artes e stories editáveis no Canva",
                "Legendas prontas para copiar e usar",
                "Calendário editorial anual completo",
                "Suporte via WhatsApp",
                "Novos conteúdos toda semana",
                "Garantia de 7 dias ou 100% de reembolso",
              ].map((feat) => (
                <li key={feat} className="flex items-center gap-3 text-sm">
                  <span className="w-5 h-5 bg-black rounded-full flex items-center justify-center shrink-0">
                    <Check className="h-3 w-3 text-white" />
                  </span>
                  {feat}
                </li>
              ))}
            </ul>

            {/* CTA */}
            <button
              onClick={handleCheckout}
              className="w-full bg-black text-white font-black text-lg py-5 rounded-2xl hover:bg-zinc-800 transition-all shadow-xl hover:shadow-2xl hover:-translate-y-0.5 active:translate-y-0"
            >
              {isAnnual ? "Assinar por R$ 197/ano →" : "Assinar por R$ 29/mês →"}
            </button>

            <p className="text-center text-xs text-zinc-400 mt-4">
              Pagamento seguro via Stripe · Cancele quando quiser
            </p>
          </div>
        </div>

        {/* Garantia */}
        <div className="mt-8 flex items-center gap-4 bg-zinc-50 border border-zinc-200 rounded-2xl p-5">
          <img
            src={garantia7dias}
            alt="Garantia 7 dias"
            className="w-16 h-16 object-contain shrink-0"
          />
          <div>
            <h4 className="font-black text-base mb-0.5">Garantia incondicional de 7 dias</h4>
            <p className="text-sm text-zinc-500">
              Entrou, testou, não gostou? Devolvemos 100% do seu dinheiro. Sem burocracia.
            </p>
          </div>
        </div>
      </section>

      {/* ── FAQ ───────────────────────────────────────────────────────────── */}
      <section className="bg-zinc-50 border-t border-zinc-100 py-16 px-4">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-black text-center mb-10">
            Perguntas frequentes
          </h2>

          <div className="space-y-2">
            {faqs.map((faq, i) => (
              <div
                key={i}
                className="border border-zinc-200 rounded-2xl bg-white overflow-hidden"
              >
                <button
                  className="w-full flex items-center justify-between gap-4 p-5 text-left font-bold text-sm hover:bg-zinc-50 transition-colors"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                >
                  {faq.q}
                  {openFaq === i ? (
                    <ChevronUp className="h-4 w-4 text-zinc-400 shrink-0" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-zinc-400 shrink-0" />
                  )}
                </button>
                {openFaq === i && (
                  <div className="px-5 pb-5 text-sm text-zinc-500 leading-relaxed border-t border-zinc-100 pt-4">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ─────────────────────────────────────────────────────── */}
      <section className="bg-black text-white py-20 px-4 text-center">
        <p className="text-sm font-bold tracking-widest text-zinc-500 uppercase mb-4">
          Agora é com você
        </p>
        <h2 className="text-3xl md:text-4xl font-black mb-4 leading-tight">
          Você pode continuar fazendo tudo sozinho.<br />
          <span className="text-zinc-300">Ou pode simplesmente postar.</span>
        </h2>
        <p className="text-zinc-400 mb-10 max-w-xl mx-auto text-base">
          Cada semana sem a plataforma é mais uma semana com o Instagram parado e os concorrentes crescendo.
        </p>
        <button
          onClick={handleCheckout}
          className="bg-white text-black font-black text-lg px-10 py-4 rounded-full hover:bg-zinc-100 transition-all shadow-xl inline-block"
        >
          Começar agora — {isAnnual ? "R$ 16,41/mês" : "R$ 29/mês"} →
        </button>
        <p className="text-zinc-600 text-sm mt-4">
          Garantia de 7 dias · Acesso imediato · Cancele quando quiser
        </p>
      </section>

      <Footer />
    </div>
  );
};

export default Planos;
