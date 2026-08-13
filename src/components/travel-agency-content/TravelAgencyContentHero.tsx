import { useEffect, useRef, useState } from "react";
import { ArrowRight } from "lucide-react";
import type { LandingSectionActions } from "@/types/travel-agency-content";

const A = "/travel-carousel-assets/";

const metrics = [
  ["12 modelos e estilos", "CARROSSÉIS PARA TURISMO"],
  ["3 formatos", "FEED, QUADRADO E STORIES"],
  ["6 slides diferentes", "CAPAS, CONTEÚDO E CHAMADAS"],
  ["1 minuto", "DO CLIQUE AO POST PRONTO"],
] as const;

const pains = [
  "Você posta toda semana e o engajamento não sai do lugar.",
  "Trava na tela branca sem saber o que postar sobre a próxima viagem.",
  "Designer e agência cobram caro e demoram dias pra entregar.",
  "No Canva você perde horas e mesmo assim a arte fica com cara de amador.",
  "Vê concorrente menor crescendo com conteúdo melhor que o seu.",
] as const;

export default function TravelAgencyContentHero({ onScrollToPlans, onRecordEvent }: LandingSectionActions) {
  const [visible, setVisible] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [painVisible, setPainVisible] = useState(false);
  const painRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) { setVisible(true); setPainVisible(true); }
    else window.requestAnimationFrame(() => setVisible(true));
    const onScroll = () => setScrolled(window.scrollY > 34);
    onScroll(); window.addEventListener("scroll", onScroll, { passive: true });
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setPainVisible(true); observer.disconnect(); }
    }, { threshold: .14 });
    if (painRef.current) observer.observe(painRef.current);
    return () => { window.removeEventListener("scroll", onScroll); observer.disconnect(); };
  }, []);

  const track = (source: string, destination: string) => onRecordEvent("landing_anchor_clicked", { source, destination });

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50 py-[18px]">
        <nav aria-label="Navegação principal" className={`mx-auto flex h-16 max-w-[1200px] items-center justify-between px-5 transition-[background,border,border-radius,box-shadow] duration-300 sm:px-7 ${scrolled ? "rounded-2xl border border-white/[.09] bg-[#0a0a0ccc] shadow-[0_18px_50px_rgba(0,0,0,.3)] backdrop-blur-xl" : "border border-transparent bg-transparent"}`}>
          <a href="#inicio" className="font-[700] tracking-[-.04em] text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7c5cff] sm:text-lg" aria-label="Canva Viagem — início">Canva Viagem<span className="text-[#7c5cff]">.</span></a>
          <div className="hidden items-center gap-8 text-[13px] font-medium text-white/60 md:flex">
            <a href="#como-funciona" onClick={() => track("nav_how", "#como-funciona")} className="hover:text-white">Como funciona</a>
            <a href="#formatos" onClick={() => track("nav_formats", "#formatos")} className="hover:text-white">Formatos</a>
            <a href="#resultados" onClick={() => track("nav_results", "#resultados")} className="hover:text-white">Resultados</a>
            <a href="#planos" onClick={(e) => { e.preventDefault(); onScrollToPlans("nav_plans"); }} className="hover:text-white">Planos</a>
            <a href="#faq" onClick={() => track("nav_faq", "#faq")} className="hover:text-white">FAQ</a>
          </div>
          <button type="button" onClick={() => onScrollToPlans("nav_primary")} className="rounded-xl bg-[#7c5cff] px-5 py-3 text-[13px] font-semibold text-white shadow-[0_10px_30px_rgba(124,92,255,.28)] transition hover:bg-[#896dff] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white">Ver planos</button>
        </nav>
      </header>

      <section id="inicio" aria-labelledby="travel-agency-hero-title" className="relative isolate overflow-hidden bg-[#08080b] text-[#f5f5f7]">
        <div aria-hidden="true" className="absolute inset-0 -z-20 bg-[radial-gradient(circle_at_78%_10%,rgba(124,92,255,.26),transparent_35%),radial-gradient(circle_at_60%_42%,rgba(72,42,160,.12),transparent_34%)]" />
        <div aria-hidden="true" className="absolute inset-0 -z-10 opacity-35 [background-image:radial-gradient(rgba(157,132,255,.7)_.7px,transparent_.7px)] [background-size:91px_91px] [mask-image:linear-gradient(to_bottom,black,transparent_85%)]" />

        <div className="mx-auto max-w-[1200px] px-5 pb-6 pt-[150px] sm:px-7 lg:pt-[178px]">
          <div className="grid items-center gap-14 lg:grid-cols-[.98fr_1.02fr] lg:gap-12">
            <div className={`relative z-10 transition-[opacity,transform] duration-700 ${visible ? "translate-y-0 opacity-100" : "translate-y-5 opacity-0"}`}>
              <p className="mb-8 inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/20 px-4 py-2 font-mono text-[10px] font-semibold uppercase tracking-[.18em] text-[#22d3a8]"><span className="h-1.5 w-1.5 rounded-full bg-[#22d3a8] shadow-[0_0_12px_#22d3a8]" />Carrosséis · Artes · Stories · só para turismo</p>
              <h1 id="travel-agency-hero-title" className="max-w-[590px] text-[42px] font-[590] leading-[.99] tracking-[-.035em] sm:text-[60px] lg:text-[78px]">
                <span className="block">Carrosséis que</span>
                <em className="block font-serif font-normal text-[#9b82ff]">vendem viagens</em>
                <span className="block">e viralizam, em</span>
                <span className="bg-[linear-gradient(transparent_76%,rgba(124,92,255,.42)_76%)]">1 clique.</span>
              </h1>
              <p className="mt-8 text-[21px] font-medium text-white/78">Agora com <em className="font-serif text-[27px] font-normal text-[#b6a5ff]">Feed e Stories</em>, na mesma assinatura.</p>
              <p className="mt-7 max-w-[585px] text-[15px] leading-[1.75] text-white/58">O Canva Viagem transforma destino, oferta e identidade da sua agência em carrosséis com vários slides, artes para o Feed e versões verticais para Stories. Você escolhe entre 10 modelos feitos para turismo, troca as informações, baixa e publica. Sem começar do zero, sem esperar designer.</p>
              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <button type="button" onClick={() => onScrollToPlans("hero_primary")} className="group inline-flex min-h-[58px] items-center justify-center gap-3 rounded-xl bg-[#7c5cff] px-8 text-[15px] font-semibold text-white shadow-[0_14px_38px_rgba(124,92,255,.28)] transition hover:-translate-y-0.5 hover:bg-[#896dff] motion-reduce:transform-none">Criar meus carrosséis <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" /></button>
                <button type="button" onClick={() => onScrollToPlans("hero_secondary")} className="min-h-[58px] rounded-xl border border-white/15 px-8 text-[15px] font-semibold text-white transition hover:border-white/30 hover:bg-white/[.04]">Ver planos</button>
              </div>
              <p className="mt-5 font-mono text-[10px] uppercase tracking-[.15em] text-white/28">Acesso liberado após a confirmação do pagamento</p>
            </div>

            <div className={`relative aspect-video min-h-0 transition-[opacity,transform] delay-150 duration-1000 sm:min-h-[570px] lg:min-h-[610px] ${visible ? "translate-y-0 opacity-100" : "translate-y-7 opacity-0"}`}>
              <div className="absolute inset-0 overflow-hidden rounded-[24px] border border-[#9b82ff]/20 bg-[#0a0912] shadow-[0_24px_70px_rgba(0,0,0,.62),0_0_45px_rgba(124,92,255,.13)] sm:inset-x-[2%] sm:top-[9%] sm:h-[68%] sm:rounded-[32px] sm:shadow-[0_38px_110px_rgba(0,0,0,.7),0_0_70px_rgba(124,92,255,.18)]">
                <video autoPlay muted loop playsInline preload="metadata" aria-label="Demonstração visual da criação de carrosséis" className="h-full w-full object-cover">
                  <source src={`${A}qorvo-hero.mp4`} type="video/mp4" />
                </video>
                <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,transparent_68%,rgba(8,8,11,.48))]" />
              </div>
              <img src={`${A}cancun-card-02.png`} alt="Carrossel de viagem criado para Cancún" className="absolute left-0 top-[2%] hidden aspect-[4/5] w-[25%] -rotate-[7deg] rounded-xl border border-white/15 object-cover shadow-2xl sm:block" />
              <img src={`${A}gramado-offer-05.png`} alt="Arte vertical de turismo para Stories" className="absolute bottom-[1%] right-0 hidden aspect-[4/5] w-[24%] rotate-[7deg] rounded-xl border border-white/15 object-cover shadow-2xl sm:block" />
              <p className="absolute bottom-[12%] left-[12%] hidden rounded-full border border-[#22d3a8]/25 bg-[#09090dcc] px-4 py-2 font-mono text-[9px] uppercase tracking-[.16em] text-[#22d3a8] backdrop-blur sm:block">do destino ao post em poucos cliques</p>
            </div>
          </div>

          <div className="relative mt-8 hidden h-[570px] overflow-hidden border-y border-white/[.07] sm:block">
            <div aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(circle_at_50%_42%,rgba(124,92,255,.22),transparent_46%)]" />
            {["cancun-editorial-01.png","cancun-editorial-02.png","cancun-editorial-03.png","cancun-card-01.png","cancun-card-02.png","cancun-card-03.png","gramado-offer-01.png"].map((src, i) => (
              <img key={src} src={`${A}${src}`} alt="" aria-hidden="true" className="absolute bottom-[-5%] aspect-[4/5] w-[22%] rounded-2xl border border-white/10 object-cover shadow-[0_25px_70px_rgba(0,0,0,.65)]" style={{ left: `${2 + i * 13.2}%`, transform: `rotate(${(i - 3) * 2.7}deg) translateY(${Math.abs(i - 3) * 17}px)`, zIndex: 10 - Math.abs(i - 3) }} />
            ))}
          </div>

          <dl className="grid grid-cols-2 border-y border-white/[.08] py-8 lg:grid-cols-4 lg:py-12">
            {metrics.map(([value,label]) => <div key={label} className="px-4 py-5 text-left sm:px-7"><dd className="text-[38px] font-semibold leading-none tracking-[-.045em] text-white sm:text-[50px]">{value}</dd><dt className="mt-5 max-w-[210px] font-mono text-[10px] font-medium uppercase leading-5 tracking-[.17em] text-white/35 sm:text-[12px]">{label}</dt></div>)}
          </dl>
        </div>
      </section>

      <section ref={painRef} className="relative bg-[radial-gradient(circle_at_78%_26%,rgba(124,92,255,.08),transparent_34%),#08080b] py-20 text-white sm:py-[126px]">
        <div className={`mx-auto max-w-[1200px] px-5 transition-[opacity,transform] duration-700 sm:px-7 ${painVisible ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"}`}>
          <p className="font-mono text-[11px] uppercase tracking-[.18em] text-[#22d3a8]"><span className="text-[#7c5cff]">01 —</span> Você se reconhece?</p>
          <ul className="mt-9 space-y-7 sm:space-y-8">
            {pains.map((pain) => <li key={pain} className="flex max-w-[1120px] items-start gap-7 text-[25px] font-semibold leading-[1.23] tracking-[-.03em] text-white/95 sm:text-[36px]"><span className="mt-[.55em] h-2.5 w-2.5 shrink-0 rounded-full bg-[#7c5cff] shadow-[0_0_18px_#7c5cff]" />{pain}</li>)}
          </ul>
          <p className="mt-16 max-w-[620px] text-[17px] leading-[1.7] tracking-[-.02em] text-white/60">Você sabe que tem que postar. Só não tem tempo nem ideia — e fazer carrossel e Stories toda semana parece trabalho de equipe inteira. <span className="border-b border-[#7c5cff] bg-[linear-gradient(transparent_72%,rgba(124,92,255,.22)_72%)] text-white/75">O Canva Viagem entrega os modelos e tira o trabalho repetitivo: você escolhe, personaliza e exporta.</span></p>
        </div>
      </section>
    </>
  );
}
