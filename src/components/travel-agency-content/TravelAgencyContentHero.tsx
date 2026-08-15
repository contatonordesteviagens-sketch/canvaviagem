import { useEffect, useRef, useState } from "react";
import { ArrowRight } from "lucide-react";
import type { LandingSectionActions } from "@/types/travel-agency-content";
import AutoplayLoopVideo from "./AutoplayLoopVideo";

const A = "/travel-carousel-assets/";

const metrics = [
  ["+12 modelos", "CARROSSÉIS PARA TURISMO"],
  ["3 formatos", "FEED, QUADRADO E STORIES"],
  ["Ilimitados", "SEM CRÉDITOS OU FRANQUIA"],
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
          <button type="button" onClick={() => onScrollToPlans("nav_primary")} className="rounded-xl bg-[#7c5cff] px-5 py-3 text-[13px] font-semibold text-white shadow-[0_10px_30px_rgba(124,92,255,.28)] transition hover:bg-[#896dff] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white">Começar agora</button>
        </nav>
      </header>

      <section id="inicio" aria-labelledby="travel-agency-hero-title" className="relative isolate overflow-hidden bg-[#08080b] text-[#f5f5f7]">
        <div aria-hidden="true" className="absolute inset-0 -z-20 bg-[radial-gradient(circle_at_78%_10%,rgba(124,92,255,.26),transparent_35%),radial-gradient(circle_at_60%_42%,rgba(72,42,160,.12),transparent_34%)]" />
        <div aria-hidden="true" className="absolute inset-0 -z-10 opacity-35 [background-image:radial-gradient(rgba(157,132,255,.7)_.7px,transparent_.7px)] [background-size:91px_91px] [mask-image:linear-gradient(to_bottom,black,transparent_85%)]" />

        <div className="mx-auto max-w-[1200px] px-5 pb-6 pt-[150px] sm:px-7 lg:pt-[164px]">
          <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,.96fr)_minmax(0,1.04fr)] lg:gap-16 xl:gap-20">
            <div className={`relative z-10 min-w-0 transition-[opacity,transform] duration-700 ${visible ? "translate-y-0 opacity-100" : "translate-y-5 opacity-0"}`}>
              <p className="mb-8 inline-flex items-center gap-2 rounded-full border border-[#22d3a8]/30 bg-[#08231e]/55 px-4 py-2 font-mono text-[10px] font-semibold uppercase tracking-[.18em] text-[#22d3a8]"><span className="h-1.5 w-1.5 rounded-full bg-[#22d3a8] shadow-[0_0_12px_#22d3a8]" />Válido somente hoje · carrosséis ilimitados</p>
              <h1 id="travel-agency-hero-title" className="max-w-[590px] text-[42px] font-[590] leading-[.99] tracking-[-.035em] sm:text-[60px] lg:text-[68px] xl:text-[74px]">
                <span className="block">Carrosséis que</span>
                <em className="block font-serif font-normal text-[#9b82ff]">vendem viagens</em>
                <span className="block">e viralizam, em</span>
                <span className="bg-[linear-gradient(transparent_76%,rgba(124,92,255,.42)_76%)]">1 clique.</span>
              </h1>
              <p className="mt-8 text-[21px] font-medium text-white/78">Crie quantos carrosséis quiser: <em className="font-serif text-[27px] font-normal text-[#b6a5ff]">sem créditos e sem limites.</em></p>
              <p className="mt-7 max-w-[585px] text-[15px] leading-[1.75] text-white/58">O Canva Viagem transforma destino, oferta e identidade da sua agência em carrosséis com vários slides, artes para o Feed e versões verticais para Stories. Você escolhe entre +12 modelos feitos para turismo, personaliza, baixa e publica quantas vezes precisar. Ao assinar hoje, o uso fica ilimitado enquanto sua assinatura estiver ativa.</p>
              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <button type="button" onClick={() => onScrollToPlans("hero_primary")} className="group inline-flex min-h-[58px] items-center justify-center gap-3 rounded-xl bg-[#7c5cff] px-8 text-[15px] font-semibold text-white shadow-[0_14px_38px_rgba(124,92,255,.28)] transition hover:-translate-y-0.5 hover:bg-[#896dff] motion-reduce:transform-none">Liberar carrosséis ilimitados <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" /></button>
                <button type="button" onClick={() => onScrollToPlans("hero_secondary")} className="min-h-[58px] rounded-xl border border-white/15 px-8 text-[15px] font-semibold text-white transition hover:border-white/30 hover:bg-white/[.04]">Ver planos</button>
              </div>
              <p className="mt-5 font-mono text-[10px] uppercase tracking-[.15em] text-white/35">Oferta válida somente hoje · sem créditos · sem limite de gerações</p>
            </div>

            <div className={`relative min-w-0 aspect-video transition-[opacity,transform] delay-150 duration-1000 ${visible ? "translate-y-0 opacity-100" : "translate-y-7 opacity-0"}`}>
              <div className="absolute inset-0 overflow-hidden rounded-[24px] border border-[#9b82ff]/20 bg-[#0a0912] shadow-[0_24px_70px_rgba(0,0,0,.62),0_0_45px_rgba(124,92,255,.13)] sm:rounded-[30px] lg:shadow-[0_32px_90px_rgba(0,0,0,.68),0_0_60px_rgba(124,92,255,.16)]">
                <AutoplayLoopVideo src={`${A}carousel-hero.mp4`} mobileAnimationSrc={`${A}carousel-hero-mobile.webp`} label="Demonstração visual da criação de carrosséis" className="h-full w-full object-cover" />
                <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,transparent_68%,rgba(8,8,11,.48))]" />
              </div>
            </div>
          </div>

          <dl className="mt-16 grid grid-cols-2 border-y border-white/[.08] py-8 lg:mt-24 lg:grid-cols-4 lg:py-10">
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
