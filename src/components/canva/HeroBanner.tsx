import { memo } from "react";
import { Search, Sparkles } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useLanguage } from "@/contexts/LanguageContext";

interface HeroBannerProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
}

const HeroBannerComponent = ({ searchValue, onSearchChange }: HeroBannerProps) => {
  const { t } = useLanguage();

  return (
    <div 
      className="relative w-full overflow-hidden mb-6 md:mb-8"
      style={{
        background: "linear-gradient(98deg, rgb(0, 196, 204) -9%, rgb(90, 50, 250) 78%, rgb(118, 48, 215) 158%)",
        padding: "24px 16px 32px", // Reduzido drasticamente para melhor visualização mobile
        borderRadius: "0 0 24px 24px", 
      }}
    >
      {/* Decorative glowing elements */}
      <div className="absolute top-0 right-0 w-64 h-64 opacity-20 pointer-events-none" style={{ background: "radial-gradient(circle, #fff 0%, transparent 70%)", filter: "blur(40px)", transform: "translate(30%, -30%)" }} />

      <div className="max-w-4xl mx-auto text-center relative z-10">
        {/* Headline - forçado em 1 linha no mobile para caber */}
        <h1 
          className="text-white mb-2 tracking-tight font-bold leading-tight flex items-center justify-center gap-1.5 whitespace-nowrap flex-wrap sm:flex-nowrap"
          style={{ 
            fontFamily: "'Inter', 'Canva Sans', sans-serif",
            fontSize: "clamp(22px, 4vw, 48px)", // Fonte reduzida para não quebrar layout
            letterSpacing: "-0.02em",
            textShadow: "0 1px 6px rgba(0,0,0,0.1)"
          }}
        >
          <span>O que vamos divulgar hoje?</span>
          <Sparkles className="h-5 w-5 md:h-8 md:w-8 inline-block opacity-90 shrink-0" />
        </h1>

        <p 
          className="text-white/90 mb-5 font-medium mx-auto max-w-md hidden sm:block" // Escondido no mobile para focar na busca e ganhar espaço
          style={{ 
            fontSize: "clamp(14px, 1.8vw, 16px)",
            lineHeight: "1.4",
            opacity: 0.85
          }}
        >
          Pesquise destinos para baixar vídeos prontos ou editar no Canva.
        </p>

        {/* The iconic Rounded Search Bar Container */}
        <div className="max-w-2xl mx-auto relative group">
          <div className="relative transform transition-all duration-300 group-hover:scale-[1.01]">
            <Search className="absolute left-6 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-500 z-10" aria-hidden="true" />
            <Input
              type="search"
              placeholder="Digite o destino (ex: Maragogi, Maldivas...)"
              value={searchValue}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-14 pr-6 h-14 md:h-16 rounded-lg bg-white shadow-2xl border-none text-base md:text-lg text-slate-900 placeholder:text-slate-400 focus-visible:ring-4 focus-visible:ring-white/30 transition-all duration-300"
              style={{
                borderRadius: "8px", // Defined token from prompt
                boxShadow: "rgba(64, 79, 109, 0.1) 0px 0px 0px 0.5px, rgba(24, 44, 89, 0.1) 0px 10px 30px 0px",
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export const HeroBanner = memo(HeroBannerComponent);
