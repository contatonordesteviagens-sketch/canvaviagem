import { useState } from "react";
import { ArrowRight, Check, ChevronDown, CreditCard, ShieldCheck } from "lucide-react";

import { ELITE_OFFER } from "@/lib/eliteOffer";
import type {
  LandingCheckoutAction,
  LandingSectionActions,
  TravelAgencyBillingCycle,
} from "@/types/travel-agency-content";

type Props = LandingSectionActions & LandingCheckoutAction;

type Plan = {
  cycle: TravelAgencyBillingCycle;
  name: string;
  eyebrow: string;
  price: string;
  suffix: string;
  charge: string;
  value: number;
  tone: "purple" | "green";
  badge: string;
};

const asset = (name: string) => `/travel-carousel-assets/${name}`;

const tourismWorks = [
  ["cancun-card-01.png", "Capa de carrossel de viagem sobre Cancún"],
  ["cancun-card-02.png", "Segundo slide de carrossel sobre Cancún"],
  ["cancun-card-03.png", "Terceiro slide de carrossel sobre Cancún"],
  ["cancun-editorial-01.png", "Capa de conteúdo editorial sobre Cancún"],
  ["cancun-editorial-02.png", "Slide editorial com informações sobre Cancún"],
  ["cancun-editorial-03.png", "Slide final de conteúdo editorial sobre Cancún"],
  ["gramado-offer-01.png", "Primeira arte de oferta de viagem para Gramado"],
  ["gramado-offer-02.png", "Segunda arte de oferta de viagem para Gramado"],
  ["gramado-offer-05.png", "Arte vertical de oferta de viagem para Gramado"],
] as const;

const plans: Plan[] = [
  {
    cycle: "monthly",
    name: "Mensal",
    eyebrow: "COMECE AGORA",
    price: ELITE_OFFER.monthlyPrice,
    suffix: "/mês",
    charge: `${ELITE_OFFER.monthlyPrice} cobrados mensalmente`,
    value: 97,
    tone: "purple",
    badge: "O MELHOR PARA COMEÇAR",
  },
  {
    cycle: "semiannual",
    name: "Semestral",
    eyebrow: "GANHE RITMO",
    price: "R$ 57,83",
    suffix: "/mês",
    charge: `${ELITE_OFFER.semiannualPrice} cobrados a cada 6 meses`,
    value: 347,
    tone: "green",
    badge: "MENOR CUSTO MENSAL",
  },
  {
    cycle: "annual",
    name: "Anual",
    eyebrow: "MELHOR CONDIÇÃO",
    price: ELITE_OFFER.annualMonthlyEquivalent,
    suffix: "/mês",
    charge: `${ELITE_OFFER.annualPrice} cobrados uma vez por 12 meses`,
    value: 482,
    tone: "purple",
    badge: "ECONOMIZE 59%",
  },
];

const features = [
  "+12 modelos criados para turismo",
  "Carrosséis em Feed 4:5",
  "Artes quadradas em 1:1",
  "Stories verticais em 9:16",
  "Vários slides e variações",
  "Personalização com os dados da agência",
  "Exportação para revisar e publicar",
];

const faqs = [
  ["Quantos modelos estão disponíveis?", "São +12 modelos criados para turismo, com estruturas para ofertas, destinos, dicas, roteiros e conteúdo editorial."],
  ["Quais formatos posso criar?", "Carrosséis em Feed 4:5, artes quadradas em 1:1 e Stories verticais em 9:16, com vários slides e variações."],
  ["Preciso dominar design ou Canva?", "Não. Você escolhe um modelo, troca as informações da viagem e personaliza os elementos sem começar do zero."],
  ["Posso usar a identidade da agência?", "Sim. Você pode adaptar destino, oferta, preço, informações e identidade visual antes de exportar."],
  ["A plataforma publica sozinha?", "Não. A ferramenta cria e adapta as peças; sua agência revisa, exporta e publica nos próprios canais."],
  ["O anual é cobrado todo mês?", `Não. O valor de ${ELITE_OFFER.annualPrice} é cobrado uma vez no checkout e libera 12 meses de acesso.`],
  ["Posso cancelar?", "O cancelamento pode ser solicitado online. As condições do ciclo escolhido são apresentadas no checkout antes da confirmação."],
] as const;

export default function TravelAgencyContentConversion({ checkoutLoading, onCheckout, onRecordEvent, onScrollToPlans }: Props) {
  const [cycle, setCycle] = useState<TravelAgencyBillingCycle>("annual");
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const chooseCycle = (next: TravelAgencyBillingCycle) => {
    setCycle(next);
    onRecordEvent("pricing_cycle_selected", { cycle: next });
  };

  const checkout = (plan: Plan) => {
    setCycle(plan.cycle);
    onRecordEvent("checkout_clicked", { cycle: plan.cycle, value: plan.value });
    onCheckout(plan.cycle, plan.value);
  };

  return (
    <div className="bg-[#08080b] text-[#f5f5f7] [font-family:Geist,system-ui,sans-serif]">
      <section id="resultados" className="overflow-hidden border-b border-white/[0.08] px-5 py-20 sm:px-8 sm:py-28">
        <div className="mx-auto max-w-[1200px]">
          <article className="mx-auto max-w-[760px] overflow-hidden rounded-[28px] border border-[#7c5cff]/35 bg-[linear-gradient(145deg,#1c1538,#0d0c13_70%)] px-7 pt-8 shadow-[0_32px_90px_rgba(0,0,0,.45)] sm:px-12 sm:pt-11">
            <Label number="07" text="Resultado real" />
            <h2 className="mt-8 max-w-[610px] text-[32px] font-[550] leading-[1.02] tracking-[-.045em] sm:text-[50px]">Um carrossel publicado pela Qorvo passou de <span className="font-normal italic text-[#9b82ff] [font-family:'Instrument_Serif',Georgia,serif]">1 milhão</span> de visualizações.</h2>
            <p className="mt-8 font-mono text-[32px] tracking-[.04em] text-[#22d3b6] sm:text-[46px]">1.018.185 <span className="align-middle text-[9px] font-bold uppercase tracking-[.22em]">visualizações</span></p>
            <p className="mt-8 max-w-[590px] text-[14px] leading-7 text-white/62 sm:text-[16px]">O conteúdo atingiu mais de um milhão de visualizações no Instagram. Este é um resultado publicado pela Qorvo, usado como referência do mecanismo original, e não representa promessa de desempenho do Canva Viagem.</p>
            <div className="mx-auto mt-10 max-h-[610px] max-w-[420px] overflow-hidden rounded-t-[25px] border border-white/15 bg-black">
              <img src={asset("instagram-insights.png")} alt="Insights publicados pela Qorvo com 1.018.185 visualizações" loading="lazy" className="h-auto w-full" />
            </div>
          </article>

          <div className="mt-24 max-w-[760px] sm:mt-32">
            <Label number="08" text="Feitos no Canva Viagem" />
            <h3 className="mt-8 text-[30px] font-[560] leading-[1.08] tracking-[-.04em] sm:text-[48px]">Não é só inspiração. São peças de turismo prontas para adaptar à sua agência.</h3>
            <p className="mt-6 max-w-[650px] text-[15px] leading-7 text-white/55">Carrosséis para destinos, ofertas e conteúdo editorial, com Feed, formato quadrado e Stories no mesmo fluxo.</p>
          </div>
        </div>
        <div className="mt-12 overflow-hidden pb-6">
          <div className="travel-mobile-marquee flex w-max gap-4 px-2 sm:mx-auto sm:min-w-full sm:justify-center sm:gap-5 sm:px-[max(2rem,calc((100vw-1200px)/2))]">
            {[...tourismWorks, ...tourismWorks].map(([file, alt], index) => (
              <figure key={`${file}-${index}`} className={`w-[220px] shrink-0 overflow-hidden rounded-xl border border-white/10 sm:w-[250px] ${index >= tourismWorks.length ? "sm:hidden" : ""}`}>
                <img src={asset(file)} alt={index < tourismWorks.length ? alt : ""} aria-hidden={index >= tourismWorks.length || undefined} loading="lazy" className="h-auto w-full" />
              </figure>
            ))}
          </div>
        </div>
      </section>

      <section id="planos" className="relative overflow-hidden border-b border-white/[0.08] px-5 py-20 sm:px-8 sm:py-28">
        <div className="mx-auto max-w-[1200px]">
          <div className="grid gap-10 lg:grid-cols-[1fr_480px]">
            <div><Label number="09" text="Planos" /><h2 className="mt-10 text-[47px] font-semibold leading-none tracking-[-.05em] sm:text-[62px] [font-family:Archivo,system-ui,sans-serif]">Comece <span className="font-normal italic text-[#7c5cff] [font-family:'Instrument_Serif',Georgia,serif]">hoje.</span></h2></div>
            <p className="self-end text-[15px] leading-7 text-white/60">Uma única peça com designer pode custar caro. Aqui você acessa +12 modelos para artes, carrosséis e Stories, personaliza quantas peças precisar dentro do seu uso e escolhe o ciclo que combina com sua agência.</p>
          </div>

          <div className="mt-12 grid items-center gap-6 rounded-[20px] border border-[#7c5cff]/55 bg-[linear-gradient(90deg,rgba(124,92,255,.11),rgba(124,92,255,.03))] px-6 py-7 sm:px-8 lg:grid-cols-[1fr_auto]">
            <p className="text-base font-semibold"><span aria-hidden="true">✦</span> Plano anual: economize <span className="text-[#a990ff]">{ELITE_OFFER.annualSavings}</span> comparado a 12 mensalidades</p>
            <div className="flex flex-wrap items-stretch gap-3" aria-label="Resumo estático da condição anual">
              {[["12", "MESES"], ["R$40,16", "POR MÊS"], ["59%", "OFF"]].map(([value, label]) => <div key={label} className="min-w-[82px] rounded-xl border border-white/15 bg-black/25 px-3 py-3 text-center"><p className="font-mono text-base font-bold">{value}</p><p className="mt-1 font-mono text-[7px] font-bold tracking-[.18em] text-white/30">{label}</p></div>)}
            </div>
          </div>

          <div className="mt-7 flex w-full max-w-[610px] rounded-full border border-white/15 p-1" role="group" aria-label="Ciclo de cobrança">
            {plans.map((plan) => <button key={plan.cycle} type="button" aria-pressed={cycle === plan.cycle} onClick={() => chooseCycle(plan.cycle)} className={`min-h-11 flex-1 rounded-full px-3 text-xs font-semibold transition-colors motion-reduce:transition-none ${cycle === plan.cycle ? "bg-[#7c5cff] text-white" : "text-white/48 hover:text-white"} focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#22d3a8] focus-visible:ring-offset-2 focus-visible:ring-offset-[#08080b]`}>{plan.name}</button>)}
          </div>

          <div className="mt-11 grid gap-6 lg:grid-cols-3">
            {plans.map((plan) => {
              const active = cycle === plan.cycle;
              const green = plan.tone === "green";
              const color = green ? "#22d3a8" : "#7c5cff";
              return <article key={plan.cycle} className={`relative flex min-w-0 flex-col rounded-[24px] border px-6 pb-7 pt-12 sm:px-7 ${green ? "border-[#22d3a8]/70 bg-[linear-gradient(145deg,rgba(34,211,168,.12),rgba(34,211,168,.02))]" : "border-[#7c5cff]/70 bg-[linear-gradient(145deg,rgba(124,92,255,.14),rgba(124,92,255,.02))]"} ${active ? "shadow-[0_20px_70px_-30px_rgba(124,92,255,.65)]" : "opacity-80"}`}>
                <span className={`absolute -top-3 left-7 rounded-full border px-4 py-1.5 font-mono text-[8px] font-bold tracking-[.16em] ${green ? "border-[#22d3a8] bg-[#09231e] text-[#22d3a8]" : "border-[#7c5cff] bg-[#211746] text-white"}`}>{plan.badge}</span>
                <div className="flex items-end justify-between gap-3"><p className="font-mono text-[11px] font-bold tracking-[.2em]" style={{ color }}>{plan.eyebrow}</p><div className="text-right"><span className="text-sm text-white/65">R$ </span><span className="text-[46px] font-semibold leading-none tracking-[-.06em]">{plan.price.replace("R$ ", "")}</span><span className="text-sm">{plan.suffix}</span></div></div>
                <p className="mt-5 font-mono text-[9px] font-bold uppercase leading-5 tracking-[.08em] text-white/55">{plan.charge}</p>
                {plan.cycle === "annual" && <div className="mt-5 rounded-2xl border border-dashed border-[#7c5cff]/60 bg-[#7c5cff]/[.06] p-4"><p className="font-mono text-[8px] font-bold tracking-[.15em] text-[#a990ff]">ECONOMIA ANUAL</p><p className="mt-2 text-sm font-semibold">Pague o equivalente a 5 mensalidades e use por 12 meses.</p></div>}
                <div className="my-6 h-px bg-white/10" /><ul className="space-y-3 text-[13px] leading-5 text-white/65">{features.map((feature) => <li key={feature} className="flex gap-2.5"><Check className="mt-0.5 h-3.5 w-3.5 shrink-0" style={{ color }} aria-hidden="true" />{feature}</li>)}</ul>
                <button type="button" disabled={checkoutLoading !== null} onClick={() => checkout(plan)} className={`mt-8 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border text-sm font-semibold transition-transform motion-reduce:transition-none hover:-translate-y-0.5 motion-reduce:hover:translate-y-0 disabled:cursor-wait disabled:opacity-55 ${green ? "border-[#22d3a8] bg-[#22d3a8] text-[#052019]" : "border-[#7c5cff] bg-[#7c5cff] text-white"} focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#08080b]`}>{checkoutLoading === plan.cycle ? "Abrindo checkout..." : `Escolher ${plan.name.toLowerCase()}`}<ArrowRight className="h-4 w-4" aria-hidden="true" /></button>
              </article>;
            })}
          </div>
          <p className="mx-auto mt-8 max-w-[760px] text-center text-xs leading-6 text-white/38">A cobrança do ciclo escolhido é feita no checkout e o acesso é liberado após a confirmação do pagamento.</p>
          <div className="mt-4 flex flex-wrap justify-center gap-6 font-mono text-[9px] uppercase tracking-[.12em] text-white/30"><span className="flex items-center gap-2"><ShieldCheck className="h-3.5 w-3.5" /> Checkout seguro Stripe</span><span className="flex items-center gap-2"><CreditCard className="h-3.5 w-3.5" /> Total exibido antes de pagar</span></div>
        </div>
      </section>

      <section id="faq" className="border-b border-white/[0.08] px-5 py-20 sm:px-8 sm:py-28">
        <div className="mx-auto max-w-[1200px]"><Label number="10" text="Antes de você perguntar" /><div className="mt-12 grid gap-14 lg:grid-cols-[.7fr_1.3fr]"><h2 className="text-[42px] font-semibold leading-[1.04] tracking-[-.045em] sm:text-[56px] [font-family:Archivo,system-ui,sans-serif]">Perguntas <span className="block font-normal italic text-[#7c5cff] [font-family:'Instrument_Serif',Georgia,serif]">frequentes.</span></h2><div className="border-t border-white/10">{faqs.map(([question, answer], index) => { const open = openFaq === index; const panelId = `carousel-faq-panel-${index}`; const buttonId = `carousel-faq-button-${index}`; return <div key={question} className="border-b border-white/10"><h3><button id={buttonId} type="button" aria-expanded={open} aria-controls={panelId} onClick={() => { setOpenFaq(open ? null : index); onRecordEvent("faq_toggled", { question, open: !open }); }} className="flex w-full items-center justify-between gap-5 py-6 text-left text-[15px] font-semibold text-white/82 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#7c5cff]">{question}<ChevronDown className={`h-4 w-4 shrink-0 text-[#7c5cff] transition-transform motion-reduce:transition-none ${open ? "rotate-180" : ""}`} /></button></h3><div id={panelId} role="region" aria-labelledby={buttonId} hidden={!open} className="pb-7 pr-10 text-sm leading-7 text-white/48">{answer}</div></div>; })}</div></div></div>
      </section>

      <section className="relative grid min-h-[760px] place-items-center overflow-hidden px-5 py-28 text-center sm:min-h-[880px]"><div className="absolute inset-0 bg-[radial-gradient(circle,rgba(124,92,255,.18),transparent_36%)]" /><div className="relative mx-auto max-w-[900px]"><p className="font-mono text-[10px] font-bold tracking-[.2em] text-[#22d3a8]">COMECE COM O PRÓXIMO DESTINO</p><h2 className="mt-8 text-[43px] font-semibold leading-[1.02] tracking-[-.05em] sm:text-[72px] [font-family:Archivo,system-ui,sans-serif]">Transforme a viagem em um carrossel <span className="block font-normal italic text-[#7c5cff] [font-family:'Instrument_Serif',Georgia,serif]">pronto para publicar.</span></h2><button type="button" onClick={() => { onRecordEvent("final_cta_clicked", { destination: "plans" }); onScrollToPlans("final_cta"); }} className="mt-11 inline-flex min-h-14 items-center gap-3 rounded-xl bg-[#7c5cff] px-8 text-sm font-semibold shadow-[0_20px_60px_rgba(124,92,255,.3)] transition-transform motion-reduce:transition-none hover:-translate-y-0.5 motion-reduce:hover:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#22d3a8] focus-visible:ring-offset-2 focus-visible:ring-offset-[#08080b]">Quero criar meus carrosséis <ArrowRight className="h-4 w-4" /></button></div></section>
    </div>
  );
}

function Label({ number, text }: { number: string; text: string }) {
  return <p className="font-mono text-[10px] font-bold uppercase tracking-[.2em] text-white/32"><span className="text-[#7c5cff]">{number}</span> — &nbsp;{text}</p>;
}
