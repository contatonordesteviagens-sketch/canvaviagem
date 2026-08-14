const steps = [
  {
    number: "01",
    title: "Escolha o modelo.",
    copy: "Selecione um dos +12 modelos criados para turismo — com estruturas para oferta, destino, roteiro, dicas e conteúdo editorial.",
    badge: "+12 MODELOS PARA TURISMO",
    media: "video",
  },
  {
    number: "02",
    title: "Personalize a viagem.",
    copy: "Troque destino, preço, condições e informações do pacote. Aplique as cores, a logo e a identidade visual da sua agência.",
    badge: "SUA OFERTA · SUA MARCA",
    media: "cancun",
  },
  {
    number: "03",
    title: "Exporte e publique.",
    copy: "Gere vários slides e versões em 4:5, 1:1 e 9:16. Revise as informações, exporte as peças e publique nos seus canais.",
    badge: "FEED · CARROSSEL · STORIES",
    media: "gramado",
  },
] as const;

const formats = [
  {
    badge: "CARRO-CHEFE",
    badgeTone: "purple",
    title: "Carrosséis",
    copy: "Vários slides em 4:5 ou 1:1 para apresentar o destino, desenvolver a ideia e conduzir a leitura até o final.",
    benefit: "Para transformar uma viagem em uma sequência que faz o cliente continuar deslizando.",
  },
  {
    badge: "NOVO",
    badgeTone: "green",
    title: "Artes para Feed",
    copy: "Peças em 4:5 e 1:1 para destacar destino, preço, condições e identidade da agência em uma única imagem.",
    benefit: "Para divulgar uma oferta com leitura rápida, organização e aparência profissional.",
  },
  {
    badge: "NOVO",
    badgeTone: "green",
    title: "Stories",
    copy: "Versões verticais em 9:16 para levar a mesma comunicação à tela inteira, sem remontar tudo do zero.",
    benefit: "Para manter Feed e Stories coerentes, com a mesma viagem e a mesma identidade visual.",
  },
] as const;

function TourismMedia({ type, badge }: { type: (typeof steps)[number]["media"]; badge: string }) {
  if (type === "video") {
    return (
      <div className="relative aspect-square overflow-hidden rounded-[30px] border border-[#7c5cff]/30 bg-[#11101b] shadow-[0_25px_90px_rgba(74,45,180,.28)]">
        <video className="h-full w-full object-cover" autoPlay muted loop playsInline preload="metadata" aria-label="Animação visual do processo de criação">
          <source src="/travel-carousel-assets/carousel-morph.mp4" type="video/mp4" />
        </video>
        <span className="absolute bottom-5 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full border border-[#7c5cff]/45 bg-[#241241]/90 px-5 py-2 font-mono text-[10px] font-semibold tracking-[0.18em] text-white backdrop-blur">{badge}</span>
      </div>
    );
  }

  const images = type === "cancun"
    ? ["cancun-card-01.webp", "cancun-card-02.webp", "cancun-card-03.webp"]
    : ["gramado-offer-01.webp", "gramado-offer-02.webp", "gramado-offer-05.webp"];
  const ratio = type === "cancun" ? "aspect-[4/5]" : "aspect-square";

  return (
    <div className="relative aspect-square overflow-hidden rounded-[30px] border border-[#7c5cff]/30 bg-[radial-gradient(circle_at_50%_42%,#39206d_0%,#151020_52%,#0b0a11_100%)] shadow-[0_25px_90px_rgba(74,45,180,.24)]">
      <div className={`absolute left-1/2 top-1/2 w-[48%] -translate-x-1/2 -translate-y-1/2 ${ratio}`}>
        {images.map((image, index) => (
          <img key={image} src={`/travel-carousel-assets/${image}`} alt={`Exemplo turístico ${index + 1}`} loading="lazy" decoding="async" className={`absolute inset-0 h-full w-full rounded-[10px] border border-white/15 bg-[#111] object-contain shadow-2xl ${index === 0 ? "z-30" : index === 1 ? "z-20 translate-x-[28%] rotate-[8deg]" : "z-10 -translate-x-[28%] -rotate-[8deg]"}`} />
        ))}
      </div>
      <span className="absolute bottom-5 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full border border-[#7c5cff]/45 bg-[#241241]/90 px-5 py-2 font-mono text-[10px] font-semibold tracking-[0.18em] text-white backdrop-blur">{badge}</span>
    </div>
  );
}

export default function TravelAgencyContentMechanism() {
  return (
    <>
      <style>{`
        .travel-reveal { opacity: 1; transform: none; }
        @supports (animation-timeline: view()) {
          @media (prefers-reduced-motion: no-preference) {
            .travel-reveal { opacity: 0; transform: translateY(16px); animation: travel-reveal linear both; animation-timeline: view(); animation-range: entry 5% cover 23%; }
          }
        }
        @keyframes travel-reveal { to { opacity: 1; transform: translateY(0); } }
      `}</style>

      <section id="como-funciona" className="relative scroll-mt-24 overflow-hidden bg-[#08080b] px-5 py-20 text-[#f5f5f7] sm:px-8 lg:py-24">
        <div className="mx-auto max-w-[1200px]">
          <header className="travel-reveal mx-auto max-w-[1000px]">
            <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-white/35"><span className="text-[#7c5cff]">02</span> — &nbsp; COMO FUNCIONA</p>
            <h2 className="mt-7 max-w-[920px] text-[clamp(2.75rem,4.5vw,3.75rem)] font-[560] leading-[1.03] tracking-[-0.045em]">
              Do pacote ao carrossel pronto em<br className="hidden sm:block" /> <span className="font-serif font-normal italic text-[#8f70ff]">3 passos</span>.
            </h2>
          </header>

          <div className="mt-10">
            {steps.map((step) => (
              <article key={step.number} className="travel-reveal grid min-h-[690px] items-center gap-14 border-b border-white/[0.05] py-20 lg:min-h-[620px] lg:grid-cols-[minmax(0,.9fr)_minmax(0,1.1fr)] lg:gap-20 lg:py-16">
                <div className="max-w-[490px] lg:pl-1">
                  <div className="mb-[72px] flex w-[194px] gap-2">
                    {steps.map((item) => <span key={item.number} className={`h-[2px] flex-1 ${item.number === step.number ? "bg-[#7c5cff]" : "bg-white/15"}`} />)}
                  </div>
                  <p className="font-serif text-[clamp(4.25rem,6vw,5.75rem)] italic leading-none text-[#8f70ff]">{step.number}</p>
                  <h3 className="mt-7 text-[32px] font-[600] leading-tight tracking-[-0.035em]">{step.title}</h3>
                  <p className="mt-6 max-w-[480px] text-[17px] leading-7 text-[#f5f5f7]/68">{step.copy}</p>
                </div>
                <TourismMedia type={step.media} badge={step.badge} />
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="formatos" className="relative scroll-mt-24 overflow-hidden border-t border-white/[0.04] bg-[#08080b] px-5 py-20 text-[#f5f5f7] sm:px-8 lg:py-24">
        <div className="mx-auto max-w-[1200px]">
          <div>
            <header className="travel-reveal max-w-[860px]">
              <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-[#22d3a8]">03 &nbsp;—&nbsp; AGORA TAMBÉM</p>
              <h2 className="mt-8 max-w-[760px] text-[clamp(2.75rem,4.6vw,3.75rem)] font-[560] leading-[1.03] tracking-[-0.05em]">
                Uma assinatura. <span className="font-serif font-normal italic text-[#8f70ff]">Três formatos</span><br className="hidden sm:block" /> prontos pra postar.
              </h2>
              <p className="mt-7 max-w-[650px] text-[17px] leading-7 text-[#f5f5f7]/65">
                Um fluxo só para transformar os dados da viagem em carrosséis, artes para Feed e Stories. Você personaliza, revisa e exporta cada peça.
              </p>
            </header>
          </div>

          <div className="mt-20 grid gap-5 lg:grid-cols-3">
            {formats.map((format, index) => (
              <article key={format.title} className={`travel-reveal relative min-h-[296px] rounded-[22px] border bg-white/[0.025] px-8 py-9 ${index === 0 ? "border-[#7c5cff]/65 bg-[linear-gradient(145deg,rgba(124,92,255,.08),transparent_55%)]" : "border-white/[0.1]"}`}>
                <span className={`absolute -top-3 left-7 rounded-full border px-4 py-1.5 font-mono text-[10px] uppercase tracking-[0.14em] ${format.badgeTone === "purple" ? "border-[#7c5cff] bg-[#7c5cff] text-white" : "border-[#22d3a8]/50 bg-[#08231e] text-[#22d3a8]"}`}>{format.badge}</span>
                <h3 className="text-[24px] font-[600] tracking-[-0.035em]">{format.title}</h3>
                <p className="mt-5 text-[16px] leading-[1.6] text-[#f5f5f7]/65">{format.copy}</p>
                <p className="mt-5 border-t border-white/[0.1] pt-5 text-[14px] font-[600] leading-6 text-white/85">{format.benefit}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
