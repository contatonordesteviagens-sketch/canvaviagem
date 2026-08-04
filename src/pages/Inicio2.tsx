import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  ArrowRight,
  Check,
  ChevronDown,
  CirclePlay,
  Globe2,
  Image as ImageIcon,
  Layers3,
  LockKeyhole,
  ShieldCheck,
  Sparkles,
  Zap,
} from "lucide-react";
import "@/assets/inicio-conversion.css";
import logoImage from "@/assets/logo.png";
import heroDashboard from "@/assets/hero_dashboard.jpg";
import dashboardInterno from "@/assets/dashboard_interno.png";
import showcaseAdCreation from "@/assets/images/showcase-ad-creation.png";
import showcaseLandingPages from "@/assets/images/showcase-landing-pages.png";
import { ELITE_OFFER, type UpgradeFeature } from "@/lib/eliteOffer";
import { useAuth } from "@/contexts/AuthContext";
import { useEntitlements } from "@/contexts/EntitlementsContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const metaPixelId = "916689227676142";
const pendingCheckoutKey = "cv:pending-elite-checkout";
const upgradeFeatures: UpgradeFeature[] = [
  "ad_export",
  "carousel_export",
  "site_publish",
  "crm",
  "voice",
  "vendedor",
  "premium_content",
  "fabrica",
];

const upgradeLandingCopy: Record<UpgradeFeature, { eyebrow: string; title: string; description: string }> = {
  ad_export: {
    eyebrow: "Seu anúncio continua salvo",
    title: "Seu trabalho já está pronto. Agora libere novas artes.",
    description: "O gratuito inclui 3 anúncios. Com o Elite, você cria e baixa novas ofertas sem limite.",
  },
  carousel_export: {
    eyebrow: "Seu carrossel continua salvo",
    title: "Seu carrossel está pronto. Continue criando sem limite.",
    description: "O gratuito inclui 2 carrosséis. Com o Elite, você cria novas sequências sempre que precisar.",
  },
  site_publish: {
    eyebrow: "Seu site está pronto",
    title: "Coloque sua oferta no ar e comece a receber contatos.",
    description: "Você pode montar tudo antes de assinar. Publicar e atualizar o site faz parte do Elite.",
  },
  crm: {
    eyebrow: "Não perca quem pediu orçamento",
    title: "Organize seus contatos e saiba quem precisa de resposta.",
    description: "O CRM completo e suas métricas ficam disponíveis no Elite.",
  },
  voice: {
    eyebrow: "Recurso com inteligência artificial",
    title: "Crie áudios para divulgar suas viagens.",
    description: "A geração de voz fica disponível durante o teste e na assinatura Elite.",
  },
  vendedor: {
    eyebrow: "Atendimento inteligente",
    title: "Tenha ajuda para atender e vender suas viagens.",
    description: "O Vendedor de Viagens IA fica disponível durante o teste e na assinatura Elite.",
  },
  premium_content: {
    eyebrow: "Biblioteca para assinantes",
    title: "Libere vídeos, artes e arquivos prontos para usar.",
    description: "Os itens grátis continuam abertos. Downloads e mídias premium são exclusivos dos planos pagos.",
  },
  fabrica: {
    eyebrow: "Sua agência em um só lugar",
    title: "Continue o que começou e libere a Fábrica completa.",
    description: "Crie grátis primeiro. Site, CRM, automações e uso sem limite fazem parte do Elite.",
  },
};

const faqs = [
  {
    q: "Preciso saber mexer com design?",
    a: "Não. Você informa o destino, o preço e o que está incluso. A ferramenta usa modelos prontos e monta a arte para você.",
  },
  {
    q: "O que posso fazer sem pagar?",
    a: "Você pode salvar 1 projeto, criar 3 anúncios e 2 carrosséis. Não precisa colocar cartão para começar.",
  },
  {
    q: "O que o Elite libera?",
    a: "O Elite libera novas gerações, downloads premium, site publicado, CRM, automações e as demais ferramentas da plataforma.",
  },
  {
    q: "Os vídeos e arquivos para baixar são grátis?",
    a: "Não. Os vídeos editáveis, vídeos para download e mídias premium são exclusivos para assinantes Start ou Elite.",
  },
  {
    q: "Como funciona o teste de 3 dias?",
    a: "Você escolhe um plano Elite, faz seu cadastro e testa os recursos completos por 3 dias conforme as condições mostradas no checkout.",
  },
  {
    q: "Posso usar pelo celular?",
    a: "Sim. Você pode acessar pelo celular. Para montar sites e organizar muitos materiais, o computador costuma ser mais confortável.",
  },
];

function safeInternalPath(value: string | null) {
  return value?.startsWith("/") && !value.startsWith("//") ? value : null;
}

export default function Inicio2() {
  const [searchParams] = useSearchParams();
  const { user, session } = useAuth();
  const { can, tier, track, loading: entitlementsLoading } = useEntitlements();
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [activePlan, setActivePlan] = useState(2);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const resumedCheckoutRef = useRef(false);
  const landingTrackedRef = useRef(false);
  const requestedUpgrade = searchParams.get("upgrade");
  const upgradeFeature = upgradeFeatures.includes(requestedUpgrade as UpgradeFeature)
    ? requestedUpgrade as UpgradeFeature
    : null;
  const returnTo = safeInternalPath(searchParams.get("returnTo"));
  const contextualCopy = upgradeFeature ? upgradeLandingCopy[upgradeFeature] : null;
  const isStartUpgrade = tier === "start_legacy";
  const isFreeAccount = tier === "free";
  const freeWorkspacePath = returnTo || "/fabrica";

  useEffect(() => {
    if (landingTrackedRef.current || entitlementsLoading) return;
    landingTrackedRef.current = true;
    track("landing_viewed", {
      feature: upgradeFeature || "general",
      source: upgradeFeature ? "contextual_paywall" : "direct",
      tier,
      return_to: returnTo,
    });
  }, [entitlementsLoading, returnTo, tier, track, upgradeFeature]);

  const plans = [
    {
      id: "mensal",
      cycle: "monthly" as const,
      name: "Mensal",
      price: ELITE_OFFER.monthlyPrice,
      note: "por mês",
      trackValue: 97,
      popular: false,
    },
    {
      id: "semestral",
      cycle: "semiannual" as const,
      name: "Semestral",
      price: ELITE_OFFER.semiannualPrice,
      note: "a cada 6 meses",
      trackValue: 347,
      popular: false,
    },
    {
      id: "anual",
      cycle: "annual" as const,
      name: "Anual",
      price: ELITE_OFFER.annualPrice,
      note: `${ELITE_OFFER.annualMonthlyEquivalent}/mês`,
      trackValue: 482,
      popular: true,
    },
  ];

  const trackCheckoutClick = useCallback((value: number, plan: "anual" | "semestral" | "mensal") => {
    const fbq = (window as Window & { fbq?: (...args: unknown[]) => void }).fbq;
    fbq?.("trackSingle", metaPixelId, "InitiateCheckout", {
      value,
      currency: "BRL",
      content_name: `Canva Viagem ${plan}`,
      content_category: "inicio-conversion",
    });
  }, []);

  const startEliteCheckout = useCallback(async (
    billingCycle: "monthly" | "semiannual" | "annual",
    trackValue: number,
  ) => {
    const pixelPlan = billingCycle === "monthly" ? "mensal" : billingCycle === "semiannual" ? "semestral" : "anual";
    track("plan_selected", { billing_cycle: billingCycle, feature: upgradeFeature || "general", tier });
    trackCheckoutClick(trackValue, pixelPlan);

    if (!user || !session?.access_token) {
      const params = new URLSearchParams(searchParams);
      params.set("checkout", billingCycle);
      const returnPath = `/inicio?${params.toString()}`;
      sessionStorage.setItem(pendingCheckoutKey, billingCycle);
      window.location.assign(`/auth?redirect=${encodeURIComponent(returnPath)}`);
      return;
    }

    if (!entitlementsLoading && can("site.publish")) {
      sessionStorage.removeItem(pendingCheckoutKey);
      toast.success("Seu acesso Elite já está ativo.");
      window.location.assign("/fabrica");
      return;
    }

    setCheckoutLoading(true);
    try {
      track("checkout_started", { billing_cycle: billingCycle, feature: upgradeFeature || "general", tier, return_to: returnTo });
      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: { billing_cycle: billingCycle, upgrade: upgradeFeature, return_to: returnTo },
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (data?.already_subscribed) {
        sessionStorage.removeItem(pendingCheckoutKey);
        toast.success("Seu acesso Elite já está ativo.");
        window.location.assign("/fabrica");
        return;
      }
      if (error || !data?.url) throw error || new Error("Checkout indisponível");
      sessionStorage.removeItem(pendingCheckoutKey);
      window.location.assign(data.url);
    } catch (error) {
      console.error("[Inicio] Falha ao criar checkout:", error);
      toast.error("Não foi possível iniciar o checkout agora. Tente novamente em instantes.");
    } finally {
      setCheckoutLoading(false);
    }
  }, [can, entitlementsLoading, returnTo, searchParams, session?.access_token, tier, track, trackCheckoutClick, upgradeFeature, user]);

  useEffect(() => {
    if (!user || !session?.access_token || resumedCheckoutRef.current) return;
    const queryCycle = searchParams.get("checkout");
    const storedCycle = sessionStorage.getItem(pendingCheckoutKey);
    const requestedCycle = queryCycle || storedCycle;
    if (!["monthly", "semiannual", "annual"].includes(requestedCycle ?? "")) return;

    resumedCheckoutRef.current = true;
    sessionStorage.removeItem(pendingCheckoutKey);
    const cleanParams = new URLSearchParams(searchParams);
    cleanParams.delete("checkout");
    const cleanQuery = cleanParams.toString();
    window.history.replaceState({}, "", cleanQuery ? `/inicio?${cleanQuery}` : "/inicio");
    const value = requestedCycle === "monthly" ? 97 : requestedCycle === "semiannual" ? 347 : 482;
    void startEliteCheckout(requestedCycle as "monthly" | "semiannual" | "annual", value);
  }, [searchParams, session?.access_token, startEliteCheckout, user]);

  const heroEyebrow = contextualCopy?.eyebrow
    || (isStartUpgrade ? "Seu Plano Start continua ativo" : isFreeAccount ? "Você já pode começar grátis" : "Comece grátis, sem cartão");
  const heroTitle = contextualCopy?.title || "Seu pacote já é bom. Agora faça o cliente perceber.";
  const heroDescription = contextualCopy?.description
    || "Digite o destino, o preço e o que está incluso. O Canva Viagem monta anúncios e carrosséis bonitos com a sua marca.";
  const primaryActionPath = upgradeFeature ? "#elite" : freeWorkspacePath;
  const workspaceCta = upgradeFeature
    ? "Ver planos para liberar"
    : user
      ? "Continuar meu projeto"
      : "Criar minha primeira oferta";
  const selectedPlan = plans[activePlan];

  return (
    <div className="cv-sales-page">
      <header className="cv-header">
        <a href="#topo" className="cv-brand" aria-label="Canva Viagem - início">
          <img src={logoImage} alt="" />
          <span>Canva Viagem</span>
        </a>
        <nav aria-label="Navegação principal">
          <a href="#como-funciona">Como funciona</a>
          <a href="#elite">Planos</a>
          <a href="/auth">Entrar</a>
        </nav>
        <a className="cv-button cv-button-small" href={primaryActionPath}>{upgradeFeature ? "Ver planos" : "Criar grátis"}</a>
      </header>

      <main>
        <section className="cv-hero" id="topo">
          <div className="cv-hero-copy">
            <span className="cv-eyebrow"><Sparkles size={16} /> {heroEyebrow}</span>
            <h1>{heroTitle}</h1>
            <p>{heroDescription}</p>
            <div className="cv-hero-actions">
              <a className="cv-button cv-button-primary" href={primaryActionPath}>
                {workspaceCta} <ArrowRight size={18} />
              </a>
              <a className="cv-button cv-button-ghost" href="#resultado">
                <CirclePlay size={18} /> Ver o que fica pronto
              </a>
            </div>
            <ul className="cv-free-list" aria-label="O que está incluído gratuitamente">
              <li><Check size={15} /> 3 anúncios</li>
              <li><Check size={15} /> 2 carrosséis</li>
              <li><Check size={15} /> sem cartão</li>
            </ul>
          </div>

          <div className="cv-hero-visual" aria-label="Exemplo da plataforma Canva Viagem">
            <img src={heroDashboard} alt="Agente de viagens usando o Canva Viagem" />
            <div className="cv-result-stack">
              <div><ImageIcon size={18} /><span><b>Anúncio pronto</b> com sua oferta</span></div>
              <div><Layers3 size={18} /><span><b>Carrossel pronto</b> para postar</span></div>
              <div><Globe2 size={18} /><span><b>Site pronto</b> para receber contatos</span></div>
            </div>
          </div>
        </section>

        <section className="cv-proof-strip" aria-label="Resumo da oferta gratuita">
          <strong>Você não precisa assinar para descobrir se funciona.</strong>
          <span>Monte uma oferta real da sua agência primeiro.</span>
          <a href={freeWorkspacePath}>Começar agora <ArrowRight size={15} /></a>
        </section>

        <section className="cv-section cv-results" id="resultado">
          <div className="cv-section-heading">
            <span className="cv-kicker">Resultado imediato</span>
            <h2>Você informa a viagem. A ferramenta arruma a apresentação.</h2>
            <p>Sem começar de uma tela vazia e sem precisar entender palavras difíceis de marketing.</p>
          </div>
          <div className="cv-results-grid">
            <article className="cv-result-card cv-result-card-large">
              <div className="cv-card-copy">
                <span>1. Anúncio</span>
                <h3>Uma oferta bonita para chamar atenção.</h3>
                <p>Destino, preço, benefícios, logo e telefone no lugar certo.</p>
              </div>
              <img src={showcaseAdCreation} alt="Exemplos de anúncios de viagem criados na plataforma" />
            </article>
            <article className="cv-result-card">
              <div className="cv-card-copy">
                <span>2. Carrossel</span>
                <h3>Várias imagens que contam e vendem a viagem.</h3>
                <p>Escolha o estilo e receba a sequência pronta para ajustar e baixar.</p>
              </div>
              <div className="cv-carousel-demo" aria-label="Exemplo de sequência de carrossel">
                {["Capa", "O que inclui", "Por que ir", "Reserve"].map((label, index) => (
                  <div key={label} className={`cv-mini-slide cv-mini-slide-${index + 1}`}>
                    <small>{index + 1}/4</small><strong>{label}</strong>
                  </div>
                ))}
              </div>
            </article>
            <article className="cv-result-card">
              <div className="cv-card-copy">
                <span>3. Site</span>
                <h3>Um link organizado para mandar ao cliente.</h3>
                <p>No Elite, publique sua página e receba pedidos de orçamento.</p>
              </div>
              <img src={showcaseLandingPages} alt="Exemplo de página de viagem criada na plataforma" />
            </article>
          </div>
        </section>

        <section className="cv-section cv-how" id="como-funciona">
          <div className="cv-section-heading cv-section-heading-left">
            <span className="cv-kicker">É só fazer isso</span>
            <h2>Se você sabe mandar uma mensagem, consegue começar.</h2>
          </div>
          <ol className="cv-steps">
            <li><span>1</span><div><b>Escreva a viagem</b><p>Coloque destino, preço, dias e o que está incluso.</p></div></li>
            <li><span>2</span><div><b>Escolha uma foto</b><p>Use uma foto sugerida ou envie a sua.</p></div></li>
            <li><span>3</span><div><b>Receba a arte</b><p>Ajuste se quiser e use para divulgar sua oferta.</p></div></li>
          </ol>
          <div className="cv-how-screen">
            <img src={dashboardInterno} alt="Painel do Canva Viagem aberto em um computador" />
            <div className="cv-how-caption"><Zap size={18} /><span>Suas informações ficam juntas para você continuar depois.</span></div>
          </div>
        </section>

        <section className="cv-section cv-choice" id="elite">
          <div className="cv-section-heading">
            <span className="cv-kicker">Comece do seu jeito</span>
            <h2>Crie grátis primeiro. Assine quando precisar de mais.</h2>
            <p>O gratuito mostra o resultado. O Elite vira sua ferramenta de trabalho.</p>
          </div>

          <div className="cv-choice-grid">
            <article className="cv-tier-card cv-tier-free">
              <span className="cv-tier-label">Grátis</span>
              <h3>Para criar a primeira oferta</h3>
              <div className="cv-price"><strong>R$ 0</strong><span>sem cartão</span></div>
              <ul>
                <li><Check /> 1 projeto salvo</li>
                <li><Check /> 3 anúncios</li>
                <li><Check /> 2 carrosséis</li>
                <li><LockKeyhole /> Site, CRM e mídias premium bloqueados</li>
              </ul>
              <a className="cv-button cv-button-outline" href={freeWorkspacePath}>Começar grátis</a>
            </article>

            <article className="cv-tier-card cv-tier-elite">
              <div className="cv-tier-topline">
                <span className="cv-tier-label">Elite</span>
                <span className="cv-popular">3 dias para testar</span>
              </div>
              <h3>Para usar todos os dias na agência</h3>
              <div className="cv-plan-tabs" role="tablist" aria-label="Escolha a duração do plano">
                {plans.map((plan, index) => (
                  <button
                    key={plan.id}
                    type="button"
                    role="tab"
                    aria-selected={activePlan === index}
                    className={activePlan === index ? "is-active" : ""}
                    onClick={() => setActivePlan(index)}
                  >
                    {plan.name}{plan.popular && <small>melhor valor</small>}
                  </button>
                ))}
              </div>
              <div className="cv-price"><strong>{selectedPlan.price}</strong><span>{selectedPlan.note}</span></div>
              <ul className="cv-elite-benefits">
                <li><Check /> Anúncios e carrosséis sem limite</li>
                <li><Check /> Site publicado e CRM</li>
                <li><Check /> Vídeos, artes e downloads premium</li>
                <li><Check /> Ferramentas de IA e automações</li>
              </ul>
              <button
                className="cv-button cv-button-primary cv-button-full"
                type="button"
                disabled={checkoutLoading}
                onClick={() => void startEliteCheckout(selectedPlan.cycle, selectedPlan.trackValue)}
              >
                {checkoutLoading ? "Abrindo pagamento..." : "Testar o Elite por 3 dias"}
                {!checkoutLoading && <ArrowRight size={18} />}
              </button>
              <p className="cv-secure"><ShieldCheck size={15} /> Pagamento processado pela Stripe</p>
            </article>
          </div>
        </section>

        <section className="cv-section cv-faq" id="duvidas">
          <div className="cv-section-heading cv-section-heading-left">
            <span className="cv-kicker">Dúvidas simples</span>
            <h2>Antes de começar</h2>
          </div>
          <div className="cv-faq-list">
            {faqs.map((faq, index) => (
              <article key={faq.q} className={openFaqIndex === index ? "is-open" : ""}>
                <button type="button" onClick={() => setOpenFaqIndex(openFaqIndex === index ? null : index)}>
                  <span>{faq.q}</span><ChevronDown size={19} />
                </button>
                {openFaqIndex === index && <p>{faq.a}</p>}
              </article>
            ))}
          </div>
        </section>

        <section className="cv-final-cta">
          <span>Seu próximo anúncio pode ficar pronto hoje.</span>
          <h2>Use uma viagem real da sua agência e veja o resultado.</h2>
          <a className="cv-button cv-button-primary" href={primaryActionPath}>
            {workspaceCta} <ArrowRight size={18} />
          </a>
          <p>Grátis para começar. Sem cartão.</p>
        </section>
      </main>

      <footer className="cv-footer">
        <div className="cv-brand"><img src={logoImage} alt="" /><span>Canva Viagem</span></div>
        <p>Ferramentas simples para agências de viagem divulgarem e venderem melhor.</p>
        <div><a href="/termos">Termos</a><a href="/privacidade">Privacidade</a><a href="/auth">Entrar</a></div>
      </footer>
    </div>
  );
}
