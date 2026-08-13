const reasons = [
  ["01", "Turismo desde o início", "Modelos que organizam destino, preço, condições e informações da viagem."],
  ["02", "Sequência pronta", "Slides estruturados para abrir, desenvolver e concluir a ideia."],
  ["03", "Três formatos", "Carrosséis e artes em 4:5 e 1:1, além de Stories em 9:16."],
  ["04", "Sua identidade", "Cores, logo e estilo da agência aplicados às peças e variações."],
] as const;

const outcomes = [
  ["+ seguidores", "Conteúdo de turismo feito para chamar atenção, gerar alcance e atrair novos viajantes."],
  ["+ vendas", "Apresente destinos e ofertas com clareza para transformar interesse em pedidos de orçamento."],
  ["− tempo", "Do pacote ao carrossel pronto em cerca de 1 minuto, sem passar a tarde inteira no Canva."],
  ["− custo", "Produza quantos conteúdos precisar por menos que o custo de uma única arte de designer."],
] as const;

export default function TravelAgencyContentBenefits() {
  return (
    <>
      <section className="bg-[#08080b] px-5 py-20 text-[#f5f5f7] sm:px-8 lg:py-[108px]">
        <div className="mx-auto max-w-[1200px]">
          <div className="grid gap-10 lg:grid-cols-[0.62fr_1.38fr]">
            <p className="travel-reveal font-mono text-[11px] uppercase tracking-[0.22em] text-[#22d3a8]">04 — POR QUE FUNCIONA</p>
            <h2 className="travel-reveal max-w-[790px] text-[clamp(2.5rem,4.2vw,3.375rem)] font-[560] leading-[1.04] tracking-[-0.045em]">A estrutura já entende o que uma <span className="font-serif font-normal italic text-[#8f70ff]">viagem</span> precisa mostrar.</h2>
          </div>
          <div className="mt-16 grid border-y border-white/[0.09] sm:grid-cols-2 lg:grid-cols-4">
            {reasons.map(([number, title, copy], index) => (
              <article key={number} className={`travel-reveal min-h-[260px] px-1 py-9 sm:px-7 ${index > 0 ? "border-t border-white/[0.09] sm:border-l sm:border-t-0" : ""} ${index === 2 ? "sm:border-t lg:border-t-0" : ""}`}>
                <p className="font-mono text-[10px] tracking-[0.16em] text-[#22d3a8]">{number}</p>
                <h3 className="mt-12 text-[21px] font-[600] tracking-[-0.025em]">{title}</h3>
                <p className="mt-4 text-[15px] leading-7 text-white/55">{copy}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-white/[0.05] bg-[#08080b] px-5 py-20 text-[#f5f5f7] sm:px-8 lg:py-[108px]">
        <div className="mx-auto max-w-[1200px]">
          <p className="travel-reveal font-mono text-[10px] uppercase tracking-[0.22em] text-white/42"><span className="text-[#8f70ff]">05</span> &nbsp;—&nbsp; O QUE VOCÊ GANHA</p>
          <div className="mt-7 border-t border-white/[0.12]">
            {outcomes.map(([value, copy]) => (
              <article key={value} className="travel-reveal border-b border-white/[0.1] px-6 py-10 sm:px-8 sm:py-12">
                <h2 className="text-[27px] font-[450] leading-none tracking-[-0.045em] text-[#22d3b6] sm:text-[31px]">{value}</h2>
                <p className="mt-6 max-w-[420px] text-[14px] leading-[1.65] text-white/70 sm:text-[15px]">{copy}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden border-t border-white/[0.04] bg-[#08080b] px-5 py-20 text-[#f5f5f7] sm:px-8 lg:py-[76px]">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_75%_50%,rgba(124,92,255,.07),transparent_60%)]" />
        <div className="relative mx-auto max-w-[1270px]">
          <p className="travel-reveal font-mono text-[11px] uppercase tracking-[0.22em] text-white/45"><span className="text-[#8f70ff]">06</span> — &nbsp; O QUE O CANVA VIAGEM NÃO É</p>
          <div className="mt-9 space-y-8 sm:mt-10 sm:space-y-10">
            <p className="travel-reveal max-w-[1160px] text-[clamp(1.55rem,2.55vw,2.15rem)] font-[650] leading-[1.28] tracking-[-0.035em]">Não é o <span className="inline-block rounded-[9px] border border-[#7c5cff]/55 bg-[#7c5cff]/10 px-2.5 py-0.5 text-[#987cff]">Canva</span>. Você não arrasta nada. Escolhe o modelo, informa a viagem e recebe o carrossel pronto para revisar.</p>
            <p className="travel-reveal max-w-[1160px] text-[clamp(1.55rem,2.55vw,2.15rem)] font-[650] leading-[1.28] tracking-[-0.035em]">Não é <span className="inline-block rounded-[9px] border border-[#7c5cff]/55 bg-[#7c5cff]/10 px-2.5 py-0.5 text-[#987cff]">agência</span>. A ferramenta prepara as peças; sua equipe revisa e publica.</p>
            <p className="travel-reveal max-w-[1100px] text-[clamp(1.55rem,2.55vw,2.15rem)] font-[650] leading-[1.28] tracking-[-0.035em]">Não é <span className="inline-block rounded-[9px] border border-[#7c5cff]/55 bg-[#7c5cff]/10 px-2.5 py-0.5 text-[#987cff]">template genérico</span>. Os +12 modelos foram estruturados para turismo.</p>
            <p className="travel-reveal max-w-[1080px] text-[clamp(1.55rem,2.55vw,2.15rem)] font-[650] leading-[1.28] tracking-[-0.035em]">Não <span className="inline-block rounded-[9px] border border-[#7c5cff]/55 bg-[#7c5cff]/10 px-2.5 py-0.5 text-[#987cff]">publica sozinha</span>. Você exporta e escolhe quando colocar no Feed ou nos Stories.</p>
          </div>
        </div>
      </section>
    </>
  );
}
