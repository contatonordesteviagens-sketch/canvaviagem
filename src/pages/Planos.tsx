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
  Loader2, Check, Plane, Settings, RefreshCw, Shield, Star,
  ChevronDown, ChevronUp
} from "lucide-react";
import garantia7dias from "@/assets/garantia-7-dias.png";

// ─── Links de pagamento ───────────────────────────────────────────────────────
const STRIPE = {
  monthly: "https://buy.stripe.com/8x26oIgGuej656zaAY8so05",
  annual: "https://buy.stripe.com/dRm8wQ75U1wk7eH9wU8so09",
};

// ─── Fascinations (Bencivenga-style bullets) ──────────────────────────────────
const FASCINATIONS = [
  "O tipo de vídeo que fez uma agente do interior do Nordeste triplicar o engajamento sem nunca ter aberto o CapCut na vida",
  "Por que o \"truque\" de postar todo dia NÃO funciona — e o que realmente faz clientes enviar mensagens pedindo pacotes",
  "A ferramenta de IA que escreve por você a legenda, o roteiro e o e-mail de follow-up do cliente em menos de 40 segundos",
  "Como uma agente que atende viagem de lua de mel descobriu um atalho para criar 30 posts em 45 minutos",
  "A tática silenciosa que transforma um vídeo de praia qualquer em conteúdo que os clientes encaminham espontaneamente",
  "O erro de posicionamento que faz a maioria das agências parecer um catálogo de preços — e como se diferenciar sem gastar nada",
];

// ─── Depoimentos ──────────────────────────────────────────────────────────────
const PROOFS = [
  {
    name: "Agente de Viagens",
    source: "WhatsApp",
    text: "Parabéns pelo trabalho, ajudou muito aqui. Tava batendo cabeça pra criar vídeos dos lugares pra postar.",
  },
  {
    name: "@vleviagens",
    source: "Instagram",
    text: "Eu comprei, estou usando e é maravilhoso o conteúdo. 🙏",
  },
  {
    name: "Agente do Nordeste",
    source: "WhatsApp",
    text: "Hoje meu Instagram parece o de uma grande agência. Antes ficava dias sem postar. Agora é todo dia.",
  },
];

// ─── FAQ ─────────────────────────────────────────────────────────────────────
const FAQS = [
  {
    q: "Qual a diferença entre o plano Mensal e o Anual?",
    a: "Exatamente o mesmo acesso. No Anual, você bloqueia o preço por 12 meses e economiza R$ 151 em comparação ao Mensal.",
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

  useEffect(() => { trackViewContent("Página de Planos"); }, []);

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
    window.location.href = billingCycle === "annual" ? STRIPE.annual : STRIPE.monthly;
  };

  const handleManageSubscription = async () => {
    setPortalLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) { toast.error("Você precisa estar logado."); navigate("/auth"); return; }
      const { data, error } = await supabase.functions.invoke("customer-portal", {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (error) { toast.error("Erro ao acessar portal. Tente novamente."); return; }
      if (data?.url) window.location.href = data.url;
    } catch { toast.error("Erro ao processar. Tente novamente."); }
    finally { setPortalLoading(false); }
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
                <Plane className="mr-2 h-4 w-4" /> Acessar Plataforma
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

  const isAnnual = billingCycle === "annual";

  return (
    <div className="min-h-screen bg-white text-black">
      <SeoMetadata
        title="Planos — Canva Viagem"
        description="Marketing pronto para agentes de viagem. 250+ vídeos, IA e templates editáveis."
        keywords="assinar canva viagem, planos marketing turístico, assinatura agência de viagens"
      />
      <Header />
      {user && <div className="max-w-4xl mx-auto px-4 pt-6"><UserInfoCard /></div>}

      {/* ═══════════════════════════════════════════════════════════════════
          HERO — Grandes promessas exigem grandes provas (Bencivenga)
      ══════════════════════════════════════════════════════════════════════ */}
      <section className="max-w-3xl mx-auto px-6 pt-16 pb-14 text-center">
        <p className="text-[11px] font-bold tracking-[0.3em] text-zinc-400 uppercase mb-6">
          Para agentes de viagem que querem crescer
        </p>

        <h1 className="text-4xl md:text-[3.5rem] font-black leading-[1.1] mb-6 text-black tracking-tight">
          E se você nunca mais precisasse{" "}
          <span className="italic">pensar</span> no que postar?
        </h1>

        <p className="text-lg md:text-xl text-zinc-600 max-w-xl mx-auto mb-4 leading-relaxed">
          Existe uma plataforma com <strong className="text-black">250+ vídeos de destinos prontos</strong>, artes editáveis, legendas e IA de marketing — especialmente criada para agentes de viagem. Muitos que a descobriram reduziram o tempo de criação de conteúdo de horas para <strong className="text-black">minutos</strong>.
        </p>

        <p className="text-base text-zinc-500 mb-10">
          Por menos de <strong className="text-black">R$ 1 por dia</strong>, você pode ser o próximo.
        </p>

        <a href="#preco">
          <button className="bg-black text-white font-black text-base md:text-lg px-10 py-4 rounded-full hover:bg-zinc-800 transition-all shadow-xl hover:-translate-y-0.5 active:translate-y-0">
            Ver como funciona →
          </button>
        </a>
        <p className="text-xs text-zinc-400 mt-3">Garantia de 7 dias · Cancele quando quiser</p>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          PROBLEMA — Empatia profunda (Bencivenga)
      ══════════════════════════════════════════════════════════════════════ */}
      <section className="border-y border-zinc-100 bg-zinc-50 py-16 px-6">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-black mb-6 leading-snug">
            Aqui está o problema que ninguém fala:
          </h2>
          <div className="space-y-5 text-base text-zinc-600 leading-relaxed">
            <p>
              O agente de viagem hoje sabe vender pacotes. O que ele <em>não sabe</em> — e ninguém ensina — é como usar as redes sociais para atrair clientes sem virar editor de vídeo, social media e copywriter ao mesmo tempo.
            </p>
            <p>
              O resultado? Tardes inteiras editando um reels que dura 24 horas. Meses pagando freelancer por R$ 800, R$ 1.200, R$ 2.000. Semanas com o Instagram parado porque "não sabe o que postar". E meanwhile, o concorrente postando todo dia.
            </p>
            <p className="font-semibold text-black">
              Não é falta de empenho. É falta da ferramenta certa.
            </p>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          PROVA SOCIAL — Prova antes do produto (Bencivenga)
      ══════════════════════════════════════════════════════════════════════ */}
      <section className="py-16 px-6 bg-white">
        <div className="max-w-3xl mx-auto">
          <p className="text-[11px] font-bold tracking-widest text-zinc-400 uppercase mb-10 text-center">
            O que dizem quem já usa
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {PROOFS.map((p) => (
              <div key={p.name} className="bg-zinc-950 text-white rounded-2xl p-6 flex flex-col gap-4">
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-sm text-zinc-300 italic leading-relaxed flex-1">"{p.text}"</p>
                <div className="pt-2 border-t border-zinc-800">
                  <p className="text-xs font-bold text-white">{p.name}</p>
                  <p className="text-xs text-zinc-500">via {p.source}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          GIFs — Prova visual do conteúdo real
      ══════════════════════════════════════════════════════════════════════ */}
      <section className="py-16 px-6 bg-zinc-950">
        <div className="max-w-3xl mx-auto">
          <p className="text-[11px] font-bold tracking-widest text-zinc-500 uppercase mb-4 text-center">
            Exemplos reais do conteúdo
          </p>
          <h2 className="text-2xl md:text-3xl font-black text-center text-white mb-3 leading-snug">
            É isso que você vai ter na mão amanhã
          </h2>
          <p className="text-zinc-400 text-center mb-10 text-sm max-w-lg mx-auto">
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
          <p className="text-zinc-500 text-xs text-center mt-6">
            250+ vídeos disponíveis · Novos toda semana
          </p>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          COMO FUNCIONA — 3 passos simples
      ══════════════════════════════════════════════════════════════════════ */}
      <section className="py-16 px-6 bg-white border-b border-zinc-100">
        <div className="max-w-2xl mx-auto">
          <p className="text-[11px] font-bold tracking-widest text-zinc-400 uppercase mb-4 text-center">
            Como funciona?
          </p>
          <h2 className="text-2xl md:text-3xl font-black text-center mb-12 leading-snug">
            Simples assim.
          </h2>
          <div className="space-y-8">
            {[
              {
                n: "1",
                title: "Escolha",
                desc: "Navegue por 250+ destinos: Disney, Maldivas, Paris, Nordeste, Europa e muito mais.",
              },
              {
                n: "2",
                title: "Baixe (ou edite, se quiser)",
                desc: "Abra no Canva em 1 clique, coloque seu logo e suas cores. Ou baixe direto, já está pronto.",
              },
              {
                n: "3",
                title: "Publique",
                desc: "Cole no Instagram, TikTok ou WhatsApp. Seu perfil profissional em menos de 2 minutos.",
              },
            ].map((step) => (
              <div key={step.n} className="flex gap-6 items-start">
                <div className="shrink-0 w-12 h-12 bg-black text-white rounded-full flex items-center justify-center font-black text-xl">
                  {step.n}
                </div>
                <div className="pt-1">
                  <h3 className="font-black text-lg mb-1">{step.title}</h3>
                  <p className="text-zinc-500 text-sm leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          TABELA COMPARATIVA — Grátis vs Pro
      ══════════════════════════════════════════════════════════════════════ */}
      <section className="py-16 px-6 bg-zinc-50 border-b border-zinc-100">
        <div className="max-w-2xl mx-auto">
          <p className="text-[11px] font-bold tracking-widest text-zinc-400 uppercase mb-4 text-center">
            O que você tem acesso
          </p>
          <h2 className="text-2xl md:text-3xl font-black text-center mb-12 leading-snug">
            Grátis vs Pro — sem enrolação.
          </h2>
          <div className="overflow-hidden rounded-2xl border border-zinc-200">
            {/* Header */}
            <div className="grid grid-cols-3 bg-zinc-950 text-white text-center">
              <div className="py-4 px-3 text-left pl-5">
                <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Recurso</p>
              </div>
              <div className="py-4 px-3 border-l border-zinc-800">
                <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Grátis</p>
              </div>
              <div className="py-4 px-3 border-l border-zinc-800 bg-yellow-400">
                <p className="text-xs font-black text-black uppercase tracking-widest">Pro ⭐</p>
              </div>
            </div>

            {/* Rows */}
            {[
              { label: "Vídeos de destinos", free: "—", pro: "250+" },
              { label: "Stories e Reels prontos", free: "—", pro: "200+" },
              { label: "Artes e Feed editáveis", free: "Limitado", pro: "Ilimitado" },
              { label: "Legendas prontas", free: "✓", pro: "✓" },
              { label: "Ferramentas de IA", free: "—", pro: "10 agentes" },
              { label: "Vendedor de Viagem (IA)", free: "—", pro: "✓" },
              { label: "Calendário editorial", free: "—", pro: "365 dias" },
              { label: "Banco de fotos", free: "—", pro: "✓" },
              { label: "Biblioteca de vídeos", free: "—", pro: "✓" },
              { label: "Novos conteúdos", free: "—", pro: "Toda semana" },
              { label: "Suporte WhatsApp", free: "—", pro: "✓" },
              { label: "Uso comercial", free: "—", pro: "✓ Sem restrições" },
            ].map((row, i) => (
              <div
                key={row.label}
                className={`grid grid-cols-3 text-sm ${i % 2 === 0 ? "bg-white" : "bg-zinc-50"} border-t border-zinc-100`}
              >
                <div className="py-3.5 px-5 font-medium text-zinc-700">{row.label}</div>
                <div className="py-3.5 px-3 text-center border-l border-zinc-100 text-zinc-400">{row.free}</div>
                <div className="py-3.5 px-3 text-center border-l border-zinc-100 font-bold text-black bg-yellow-50">{row.pro}</div>
              </div>
            ))}

            {/* Footer CTA */}
            <div className="grid grid-cols-3 bg-zinc-950 border-t border-zinc-800">
              <div className="py-5 px-5 text-white text-xs font-bold flex items-center">
                Seu plano:
              </div>
              <div className="py-5 px-3 text-center border-l border-zinc-800">
                <span className="text-zinc-500 text-xs">Acesso limitado</span>
              </div>
              <div className="py-5 px-3 text-center border-l border-zinc-800">
                <a href="#preco">
                  <button className="bg-yellow-400 text-black text-xs font-black px-4 py-2 rounded-full hover:bg-yellow-300 transition-all">
                    Assinar Pro →
                  </button>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          PLUG & PLAY — Velocidade e exclusividade (Bencivenga)
      ══════════════════════════════════════════════════════════════════════ */}
      <section className="py-16 px-6 bg-white border-b border-zinc-100">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-black mb-3 leading-snug">
            Pegou, usou e postou em 2 minutos.
          </h2>
          <p className="text-zinc-500 mb-10 text-base leading-relaxed">
            Sem design. Sem complicação. A plataforma foi construída pra agentes que precisam de resultado rápido — não pra quem tem horas pra passar editando.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border border-zinc-200 rounded-2xl p-6 hover:border-zinc-400 transition-colors">
              <div className="text-2xl mb-3">🎯</div>
              <h3 className="font-black text-base mb-3">100% Plug-and-Play</h3>
              <ul className="space-y-2.5 text-sm text-zinc-500">
                {[
                  "Não precisa saber design",
                  "Não precisa saber edição de vídeo",
                  "Não precisa entender de marketing digital",
                  "2 minutos pra criar e publicar",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-black shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="border border-zinc-900 bg-zinc-950 text-white rounded-2xl p-6">
              <div className="text-2xl mb-3">✨</div>
              <h3 className="font-black text-base mb-3">Conteúdo que ninguém mais tem</h3>
              <ul className="space-y-2.5 text-sm text-zinc-300">
                {[
                  "250+ vídeos criados exclusivamente para a plataforma",
                  "Pode personalizar com suas cores e logo",
                  "Impossível todo mundo usar o mesmo — o acervo é enorme",
                  "Conteúdo novo adicionado toda semana",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-yellow-400 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-zinc-100 bg-zinc-50 py-16 px-6">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-black mb-3 leading-snug">
            Quando você entrar na plataforma, você vai descobrir:
          </h2>
          <p className="text-zinc-500 mb-10 text-base">
            (Alguns desses insights valem sozinhos mais do que a assinatura)
          </p>
          <ul className="space-y-5">
            {FASCINATIONS.map((f, i) => (
              <li key={i} className="flex items-start gap-4">
                <span className="w-6 h-6 rounded-full bg-black text-white text-xs font-black flex items-center justify-center shrink-0 mt-0.5">
                  {i + 1}
                </span>
                <p className="text-sm md:text-base text-zinc-700 leading-relaxed">{f}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          O QUE ESTÁ INCLUÍDO — Especificidade (Bencivenga)
      ══════════════════════════════════════════════════════════════════════ */}
      <section className="py-16 px-6 bg-white">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-black mb-3">
            Tudo que você acessa a partir de hoje:
          </h2>
          <p className="text-zinc-500 mb-10 text-base">
            Sem cobranças extras. Sem módulos "avançados" trancados.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              { n: "250+", label: "Vídeos de destinos prontos e editáveis" },
              { n: "10", label: "Agentes de IA de marketing para viagens" },
              { n: "365", label: "Sugestões de post no calendário anual" },
              { n: "100+", label: "Artes e Stories editáveis no Canva" },
              { n: "∞", label: "Legendas prontas para copiar e usar" },
              { n: "✓", label: "Novos conteúdos adicionados toda semana" },
              { n: "✓", label: "Suporte via WhatsApp" },
              { n: "✓", label: "Uso comercial sem restrições de direitos" },
            ].map((item) => (
              <div
                key={item.label}
                className="flex items-center gap-4 border border-zinc-200 rounded-xl p-4 hover:border-zinc-400 transition-colors"
              >
                <span className="text-xl font-black text-black w-8 shrink-0 text-center">{item.n}</span>
                <p className="text-sm text-zinc-700 leading-tight">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          PREÇO — Argumento lógico + âncora de valor (Bencivenga)
      ══════════════════════════════════════════════════════════════════════ */}
      <section id="preco" className="bg-zinc-950 text-white py-20 px-6 scroll-mt-20">
        <div className="max-w-xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-black text-center mb-3 leading-tight">
            Quanto vale para você não precisar criar conteúdo do zero?
          </h2>
          <p className="text-zinc-400 text-base text-center mb-12 max-w-md mx-auto leading-relaxed">
            Um social media freelancer cobra em média R$ 800 a R$ 2.000 por mês. A plataforma inteira custa a partir de R$ 16,41/mês.
          </p>

          {/* Toggle */}
          <div className="flex justify-center mb-8">
            <div className="bg-zinc-800 p-1 rounded-full flex gap-1">
              <button
                onClick={() => setBillingCycle("monthly")}
                className={cn(
                  "px-6 py-2.5 rounded-full text-sm font-bold transition-all",
                  !isAnnual
                    ? "bg-white text-black shadow"
                    : "text-zinc-400 hover:text-zinc-200"
                )}
              >
                Mensal
              </button>
              <button
                onClick={() => setBillingCycle("annual")}
                className={cn(
                  "px-6 py-2.5 rounded-full text-sm font-bold transition-all flex items-center gap-2",
                  isAnnual
                    ? "bg-white text-black shadow"
                    : "text-zinc-400 hover:text-zinc-200"
                )}
              >
                Anual
                <span className="bg-yellow-400 text-black text-[10px] font-black px-1.5 py-0.5 rounded-full leading-none">
                  −42%
                </span>
              </button>
            </div>
          </div>

          {/* Price Card */}
          <div className="bg-white text-black rounded-3xl overflow-hidden">
            {isAnnual && (
              <div className="bg-yellow-400 text-black text-center py-2.5 text-sm font-black tracking-wide">
                ⭐ MELHOR CUSTO-BENEFÍCIO — MAIS POPULAR
              </div>
            )}
            <div className="p-8 md:p-10">
              <div className="mb-1">
                <p className="text-sm text-zinc-400 font-medium">
                  {isAnnual ? "Plano Anual" : "Plano Mensal"}
                </p>
              </div>
              <div className="flex items-baseline gap-2 mb-1">
                <span className="text-5xl md:text-6xl font-black text-black">
                  R$&nbsp;{isAnnual ? "16,41" : "29,00"}
                </span>
                <span className="text-zinc-400 text-lg">/mês</span>
              </div>
              <p className="text-sm text-zinc-400 mb-8">
                {isAnnual
                  ? "Cobrado uma vez no ano · R$ 197,00 total · Você economiza R$ 151"
                  : "Recorrência mensal · Cancele quando quiser"}
              </p>

              <ul className="space-y-3 mb-8">
                {[
                  "Acesso completo a 250+ vídeos de destinos",
                  "10 agentes de IA de marketing para viagens",
                  "Artes, stories e legendas prontos",
                  "Calendário editorial com 365 sugestões",
                  "Novos conteúdos toda semana",
                  "Suporte via WhatsApp",
                  "Garantia de 7 dias — sem perguntas",
                ].map((f) => (
                  <li key={f} className="flex items-center gap-3 text-sm">
                    <span className="w-5 h-5 bg-black rounded-full flex items-center justify-center shrink-0">
                      <Check className="h-3 w-3 text-white" />
                    </span>
                    {f}
                  </li>
                ))}
              </ul>

              <button
                onClick={handleCheckout}
                className="w-full bg-black text-white font-black text-lg py-5 rounded-2xl hover:bg-zinc-800 transition-all shadow-xl hover:-translate-y-0.5 active:translate-y-0"
              >
                {isAnnual
                  ? "Assinar agora por R$ 197/ano →"
                  : "Assinar agora por R$ 29/mês →"}
              </button>
              <p className="text-center text-xs text-zinc-400 mt-4">
                Pagamento seguro via Stripe · Acesso imediato após confirmação
              </p>
            </div>
          </div>

          {/* Garantia */}
          <div className="mt-6 flex items-center gap-4 bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
            <img
              src={garantia7dias}
              alt="Garantia 7 dias"
              className="w-14 h-14 object-contain shrink-0"
            />
            <div>
              <h4 className="font-black text-sm mb-0.5 text-white">Garantia incondicional de 7 dias</h4>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Entrou, testou e não gostou? Devolvemos 100% do seu dinheiro. Sem pergunta. Sem burocracia. Esse é o nosso risco, não o seu.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          FAQ
      ══════════════════════════════════════════════════════════════════════ */}
      <section className="py-16 px-6 bg-white border-b border-zinc-100">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-black text-center mb-10">
            Dúvidas frequentes
          </h2>
          <div className="space-y-2">
            {FAQS.map((faq, i) => (
              <div key={i} className="border border-zinc-200 rounded-2xl overflow-hidden">
                <button
                  className="w-full flex items-center justify-between gap-4 p-5 text-left font-bold text-sm hover:bg-zinc-50 transition-colors"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                >
                  {faq.q}
                  {openFaq === i
                    ? <ChevronUp className="h-4 w-4 text-zinc-400 shrink-0" />
                    : <ChevronDown className="h-4 w-4 text-zinc-400 shrink-0" />}
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

      {/* ═══════════════════════════════════════════════════════════════════
          CLOSE — O custo da inação (Bencivenga)
      ══════════════════════════════════════════════════════════════════════ */}
      <section className="bg-zinc-950 text-white py-20 px-6 text-center">
        <div className="max-w-2xl mx-auto">
          <p className="text-[11px] font-bold tracking-[0.3em] text-zinc-500 uppercase mb-6">
            Antes de sair
          </p>
          <h2 className="text-3xl md:text-4xl font-black mb-6 leading-tight">
            Em 30 dias você vai estar em um de dois lugares:
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12 text-left">
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
              <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest mb-4">Sem a plataforma</p>
              <ul className="space-y-3 text-sm text-zinc-400">
                <li>→ Ainda perdendo tardes editando vídeos</li>
                <li>→ Ainda sem saber o que postar amanhã</li>
                <li>→ Ainda vendo o concorrente crescer no Instagram</li>
              </ul>
            </div>
            <div className="bg-white text-black rounded-2xl p-6">
              <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest mb-4">Com a plataforma</p>
              <ul className="space-y-3 text-sm text-zinc-700">
                <li className="flex gap-2"><Check className="h-4 w-4 text-black shrink-0 mt-0.5" />Postando todo dia em menos de 5 minutos</li>
                <li className="flex gap-2"><Check className="h-4 w-4 text-black shrink-0 mt-0.5" />Com um perfil que parece de grande agência</li>
                <li className="flex gap-2"><Check className="h-4 w-4 text-black shrink-0 mt-0.5" />Com clientes chegando pelo Instagram</li>
              </ul>
            </div>
          </div>

          <button
            onClick={handleCheckout}
            className="bg-white text-black font-black text-lg px-10 py-4 rounded-full hover:bg-zinc-100 transition-all shadow-xl inline-block mb-4"
          >
            Começar agora — {isAnnual ? "R$ 16,41/mês" : "R$ 29/mês"} →
          </button>
          <p className="text-zinc-600 text-sm">Garantia de 7 dias · Acesso imediato · Cancele quando quiser</p>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Planos;
