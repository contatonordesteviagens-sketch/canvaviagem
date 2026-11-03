import { useEffect, useRef, useState } from "react";
import { Navigate, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import {
  ArrowRight, Check, ChevronDown, Globe, Images, Infinity as InfinityIcon, LayoutTemplate, Lock, Megaphone,
  Palette, ShieldCheck, Sparkles, Users, Video,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useEntitlements } from "@/contexts/EntitlementsContext";
import { trackMetaEvent } from "@/lib/meta-pixel-sales";
import { useTrackUtm, useAssociateUtmToUser } from "@/hooks/useTrackUtm";
import { checkoutPath, isBlackFridayOpen, type CheckoutCycle } from "@/components/checkout/checkout-plans";
import { ShowcaseRow, SHOWCASE_ADS, SHOWCASE_CAROUSELS } from "@/components/cv-cream/Showcase";
import logo from "@/assets/logo.png";
import "@/components/cv-cream/cream.css";
import "./planos.css";

type Variant = "lancamento" | "black-friday";
type Price = { label: string; whole: string; cents: string; per: string; note: string; save?: string; was?: string };

const PRICES: Record<Variant, Record<CheckoutCycle, Price>> = {
  lancamento: {
    monthly: { label: "Mensal", whole: "97", cents: "", per: "/mês", note: "Cobrado todo mês. Sem fidelidade." },
    semiannual: { label: "Semestral", whole: "347", cents: "", per: "/6 meses", note: "Dá R$ 57,83 por mês.", save: "Economize R$ 235" },
    annual: { label: "Anual", whole: "482", cents: "", per: "/ano", note: "Dá R$ 40,17 por mês.", save: "Economize R$ 682" },
  },
  "black-friday": {
    monthly: { label: "Mensal", whole: "48", cents: ",50", per: "/mês", note: "Renova sempre por R$ 48,50.", was: "R$ 97", save: "50% vitalício" },
    semiannual: { label: "Semestral", whole: "173", cents: ",50", per: "/6 meses", note: "Dá R$ 28,92 por mês e renova por esse valor.", was: "R$ 347", save: "50% vitalício" },
    annual: { label: "Anual", whole: "241", cents: "", per: "/ano", note: "Dá R$ 20,08 por mês e renova por esse valor.", was: "R$ 482", save: "50% vitalício" },
  },
};

const INCLUDED = [
  "Gerações de imagens ilimitadas: artes, carrosséis e sites",
  "Sua logo, suas cores e seu WhatsApp em tudo",
  "Textos e legendas prontos para postar",
  "Clientes organizados num só lugar",
];

const TOOLS = [
  { icon: Megaphone, title: "Anúncios", text: "12 modelos para feed e stories, com foto, preço e seu contato." },
  { icon: Images, title: "Carrosséis", text: "Capa, miolo e fechamento prontos para o seu pacote." },
  { icon: LayoutTemplate, title: "Stories", text: "No formato certo, sem nada cortado na tela." },
  { icon: Globe, title: "Site do pacote", text: "Uma página para mandar no WhatsApp e no Instagram." },
  { icon: Video, title: "Vídeos de destinos", text: "Reels prontos para postar na sua agência." },
  { icon: Users, title: "Seus clientes", text: "Quem pediu informação fica organizado num só lugar." },
  { icon: Palette, title: "Sua marca em tudo", text: "Envie a logo uma vez. Ela entra em cada peça." },
];

const FAQ_BLACK = { q: "O preço sobe na renovação?", a: "Não. Quem entra na Black Vitalícia paga sempre esse mesmo valor, enquanto continuar assinando." };

const FAQ = [
  { q: "Serve para a minha agência?", a: "Sim, se você vende viagens e precisa postar. Foi feito para agência que não tem equipe de marketing." },
  { q: "Preciso saber design?", a: "Não. Você fala o destino, os dias e o valor. A arte já sai pronta, com a sua logo." },
  { q: "Tem limite de artes?", a: "Não. Os créditos são ilimitados: gere 1 ou 1.000 imagens no mesmo dia." },
  { q: "Posso pagar no Pix?", a: "Pode. Na tela de pagamento você escolhe cartão ou Pix, e o QR aparece na hora." },
  { q: "Posso cancelar quando quiser?", a: "Pode. O cancelamento é em 2 cliques no seu painel, sem ligação e sem multa." },
  { q: "E se eu não gostar?", a: "Você tem 7 dias de garantia para testar com um pacote real." },
];

const CYCLES: CheckoutCycle[] = ["monthly", "semiannual", "annual"];

export default function PlanosOferta({ variant = "lancamento" }: { variant?: Variant }) {
  useTrackUtm();
  useAssociateUtmToUser();
  const navigate = useNavigate();
  const { search } = useLocation();
  const [params] = useSearchParams();
  const { user, subscription } = useAuth();
  const { track } = useEntitlements();
  const [cycle, setCycle] = useState<CheckoutCycle>("annual");
  const tracked = useRef(false);
  const isBf = variant === "black-friday";
  const price = PRICES[variant][cycle];

  useEffect(() => {
    if (tracked.current) return;
    tracked.current = true;
    trackMetaEvent("ViewContent", { content_name: `Canva Viagem - Planos ${variant}`, content_category: "planos", content_type: "product" });
  }, [variant]);

  useEffect(() => {
    if (!isBf && subscription.subscribed) navigate("/fabrica", { replace: true });
  }, [isBf, subscription.subscribed, navigate]);

  const goToCheckout = (source: string) => {
    track("plan_selected", { billing_cycle: cycle, feature: `planos_${variant}`, source });
    trackMetaEvent("InitiateCheckout", { content_name: `Canva Viagem ${price.label}`, content_category: `planos_${variant}` });
    const url = new URLSearchParams(checkoutPath(cycle).split("?")[1]);
    if (isBf) url.set("oferta", "black-friday");
    // Mantém a origem (e-mail, anúncio) visível até o pagamento.
    params.forEach((value, key) => { if (key.startsWith("utm_")) url.set(key, value); });
    const target = `/checkout?${url.toString()}`;
    // Sem conta: só o e-mail e já cai no pagamento, sem esperar link (o mesmo atalho da /inicio).
    navigate(user ? target : `/login?redirect=${encodeURIComponent(target)}&entrada=rapida`);
  };

  // Passou o prazo: a página da oferta vira a de preço normal, mantendo a origem do link.
  if (isBf && !isBlackFridayOpen()) return <Navigate to={`/planos${search}`} replace />;

  const renderCta = (source: string, className = "") => (
    <button type="button" onClick={() => goToCheckout(source)} className={`cv-btn h-14 w-full text-[16px] ${className}`}>
      Assinar e começar <ArrowRight className="h-5 w-5" />
    </button>
  );

  return (
    <div className={`cv-cream min-h-[100dvh] ${isBf ? "cv-bf" : ""}`}>
      <Helmet>
        <title>{isBf ? "Black Friday — Canva Viagem" : "Escolha seu plano — Canva Viagem"}</title>
        <meta name="robots" content="noindex" />
      </Helmet>

      <div className="plan-topbar">
        <span className="plan-tag">{isBf ? "BLACK VITALÍCIA" : "OFERTA DE LANÇAMENTO"}</span>
        <span>{isBf ? "Metade do preço, para sempre" : "Créditos ilimitados"}</span>
      </div>

      <main className="mx-auto flex max-w-[560px] flex-col gap-4 px-4 pb-16 pt-4">
        <header className="flex items-center justify-between">
          <a href="/inicio" aria-label="Canva Viagem" className="block h-[26px] w-[26px] overflow-hidden rounded-full">
            <img src={logo} alt="Canva Viagem" width={26} height={26} className="h-full w-full scale-[1.18] object-cover" />
          </a>
          <span className="plan-muted inline-flex items-center gap-1 text-[12px] font-semibold"><Lock className="h-3.5 w-3.5" /> Pagamento seguro</span>
        </header>

        {isBf ? (
          <section className="plan-card plan-glow p-5">
            <p className="plan-kicker">BLACK VITALÍCIA</p>
            <h1 className="mt-2 text-[28px] font-extrabold leading-[1.1] tracking-[-0.02em]">Metade do preço. Para sempre.</h1>
            <p className="plan-muted mt-2 text-[15px] leading-6">Não é só no primeiro mês. Você entra com esse valor e renova sempre por ele, enquanto continuar assinando, em qualquer plano.</p>
            <p className="mt-3 text-[13px] font-bold">Fecha em 30/11, às 23h59.</p>
          </section>
        ) : (
          <section className="plan-card p-5">
            <div className="flex items-center justify-between text-[11px] font-bold tracking-[1.2px]">
              <span className="plan-kicker">QUASE LÁ · FALTA 1 PASSO</span>
              <span className="plan-muted">{user ? "80%" : "50%"}</span>
            </div>
            <div className="plan-track mt-2 h-1.5 overflow-hidden rounded-full"><span className="plan-fill block h-full rounded-full" style={{ width: user ? "80%" : "50%" }} /></div>
            <h1 className="mt-4 text-[26px] font-extrabold leading-[1.12] tracking-[-0.02em]">{user ? "Sua conta está criada. Agora escolha o plano." : "Escolha o plano e comece hoje."}</h1>
            {user && (
              <ol className="mt-4 flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px] font-semibold">
              <li className="inline-flex items-center gap-1.5"><span className="plan-step plan-step-done"><Check className="h-3 w-3" /></span> Conta criada</li>
              <li className="plan-muted">—</li>
              <li className="inline-flex items-center gap-1.5"><span className="plan-step plan-step-on">2</span> Escolher plano</li>
              <li className="plan-muted">—</li>
              <li className="plan-muted inline-flex items-center gap-1.5"><span className="plan-step">3</span> Primeira postagem</li>
            </ol>
            )}
          </section>
        )}

        {!isBf && (
          <section className="plan-card plan-offer p-5">
            <span className="plan-tag">OFERTA DE LANÇAMENTO</span>
            <h2 className="mt-3 flex items-center gap-2 text-[22px] font-extrabold leading-tight tracking-[-0.02em]">
              <InfinityIcon className="h-6 w-6 shrink-0" /> Créditos ilimitados
            </h2>
            <p className="plan-muted mt-1 text-[14px] leading-6">Gere quantas imagens quiser: anúncios, carrosséis e stories, sem limite por dia.</p>
          </section>
        )}

        <div role="radiogroup" aria-label="Período do plano" className="plan-toggle">
          {CYCLES.map((c) => (
            <button key={c} type="button" role="radio" aria-checked={cycle === c} onClick={() => setCycle(c)} className={cycle === c ? "is-on" : ""}>
              {PRICES[variant][c].label}
              {PRICES[variant][c].was && <span className="block text-[11px] font-semibold opacity-70"><s>{PRICES[variant][c].was}</s> R$ {PRICES[variant][c].whole}{PRICES[variant][c].cents}</span>}
            </button>
          ))}
        </div>

        <section className="plan-card plan-price p-5" aria-live="polite">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-[20px] font-extrabold">Plano Elite</h2>
            {price.save && <span className="plan-save">{price.save}</span>}
          </div>
          {price.was && <p className="plan-muted mt-3 text-[16px] font-semibold">de <span className="line-through">{price.was}</span> por</p>}
          <p className={`${price.was ? "mt-1" : "mt-3"} flex items-baseline`}>
            <span className="plan-muted mr-1 text-[20px] font-semibold">R$</span>
            <span className="text-[60px] font-extrabold leading-none tracking-[-0.04em]">{price.whole}</span>
            {price.cents && <span className="text-[26px] font-extrabold">{price.cents}</span>}
            <span className="plan-muted ml-1 text-[16px]">{price.per}</span>
          </p>
          <p className="plan-muted mt-2 text-[14px]">{price.note}</p>
          {renderCta("topo", "mt-4")}
          <ul className="mt-4 grid gap-2.5">
            {INCLUDED.map((item) => (
              <li key={item} className="flex items-start gap-2 text-[14px] leading-5"><Check className="plan-check mt-0.5 h-4 w-4 shrink-0" /> {item}</li>
            ))}
          </ul>
          <p className="plan-muted mt-4 inline-flex items-center gap-1.5 text-[13px] font-semibold"><ShieldCheck className="h-4 w-4" /> 7 dias de garantia. Cartão ou Pix.</p>
        </section>

        <section className="-mx-4 mt-6">
          <div className="px-4">
            <p className="plan-kicker">O QUE SAI PRONTO</p>
            <h2 className="mt-2 text-[26px] font-extrabold leading-[1.12] tracking-[-0.02em]">Postagens feitas aqui, do jeito que saem.</h2>
          </div>
          <p className="plan-muted mb-1 mt-4 px-4 text-[12px] font-bold">ANÚNCIOS</p>
          <ShowcaseRow pieces={SHOWCASE_ADS} alt="Anúncio feito no Canva Viagem" />
          <p className="plan-muted mb-1 mt-3 px-4 text-[12px] font-bold">CARROSSÉIS</p>
          <ShowcaseRow pieces={SHOWCASE_CAROUSELS} alt="Slide de carrossel feito no Canva Viagem" slow />
        </section>

        <section className="mt-6">
          <p className="plan-kicker">O QUE VOCÊ RECEBE</p>
          <h2 className="mt-2 text-[26px] font-extrabold leading-[1.12] tracking-[-0.02em]">Tudo isso numa assinatura só.</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {TOOLS.map((tool) => (
              <article key={tool.title} className="plan-card flex gap-3 p-4">
                <span className="plan-icon"><tool.icon className="h-5 w-5" /></span>
                <div>
                  <h3 className="text-[16px] font-bold">{tool.title}</h3>
                  <p className="plan-muted mt-0.5 text-[14px] leading-5">{tool.text}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-6">
          <p className="plan-kicker">DÚVIDAS</p>
          <h2 className="mt-2 text-[26px] font-extrabold leading-[1.12] tracking-[-0.02em]">Antes de você assinar.</h2>
          <div className="mt-4 grid gap-2">
            {(isBf ? [FAQ_BLACK, ...FAQ] : FAQ).map((item) => (
              <details key={item.q} className="plan-card plan-faq">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 p-4 text-[15px] font-semibold">
                  {item.q} <ChevronDown className="h-4 w-4 shrink-0" />
                </summary>
                <p className="plan-muted px-4 pb-4 text-[14px] leading-6">{item.a}</p>
              </details>
            ))}
          </div>
        </section>

        <section className="plan-card plan-glow mt-6 p-5 text-center">
          <Sparkles className="plan-check mx-auto h-6 w-6" />
          <h2 className="mt-2 text-[24px] font-extrabold leading-tight tracking-[-0.02em]">Sua próxima postagem pode sair hoje.</h2>
          <p className="plan-muted mt-1 text-[14px]">Plano {price.label}: {price.was && <><s>{price.was}</s> por </>}R$ {price.whole}{price.cents}{price.per}</p>
          {renderCta("final", "mt-4")}
        </section>
      </main>
    </div>
  );
}
