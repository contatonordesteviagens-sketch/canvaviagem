import { memo } from "react";
import { Search, Sparkles, ArrowRight, Wand2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useLanguage } from "@/contexts/LanguageContext";
import { useNavigate } from "react-router-dom";

interface HeroBannerProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
}

const HeroBannerComponent = ({ searchValue, onSearchChange }: HeroBannerProps) => {
  const { t } = useLanguage();
  const navigate = useNavigate();

  return (
    <div className="w-full max-w-7xl mx-auto px-4 mb-6 md:mb-8 pt-4">
      {/* Banner Clicável da Fábrica com Cantos Arredondados */}
      <div 
        onClick={() => navigate('/fabrica')}
        className="relative w-full overflow-hidden rounded-2xl md:rounded-3xl border border-white/10 shadow-2xl cursor-pointer transition-all duration-300 hover:scale-[1.008] hover:border-amber-500/40 hover:shadow-[0_0_35px_rgba(245,158,11,0.2)] group bg-[#0F0F11]"
      >
        <img 
          src="/capa-fabrica.webp" 
          alt="Acesse a Fábrica de Destinos pra Vender Mais" 
          className="w-full h-auto object-cover max-h-[380px] sm:max-h-[460px] md:max-h-[520px] transition-transform duration-500 group-hover:scale-[1.02]"
        />
        
        {/* Indicador de clique rápido / Ação Hover no Banner */}
        <div className="absolute top-3 sm:top-4 right-3 sm:right-4 z-20">
          <div className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-black/80 backdrop-blur-md border border-amber-500/40 text-amber-400 text-[11px] sm:text-xs font-bold shadow-lg group-hover:bg-amber-500 group-hover:text-black transition-all">
            <Wand2 className="w-3.5 h-3.5 shrink-0" />
            <span>Abrir Fábrica de Destinos</span>
            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
          </div>
        </div>
      </div>

      {/* Caixa de Pesquisa Preservada ("O que vamos divulgar hoje?") */}
      <div className="mt-4 sm:mt-6 bg-[#0F0F11]/90 sm:bg-[#0F0F11] border border-white/10 rounded-2xl p-4 sm:p-6 shadow-xl relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          <h1 
            className="text-white mb-1.5 sm:mb-2 tracking-tight font-bold leading-tight flex items-center justify-center gap-1.5 whitespace-nowrap flex-wrap sm:flex-nowrap"
            style={{ 
              fontFamily: "'Inter', 'Canva Sans', sans-serif",
              fontSize: "clamp(20px, 3.8vw, 36px)",
              letterSpacing: "-0.02em"
            }}
          >
            <span>O que vamos divulgar hoje?</span>
          </h1>

          <p 
            className="text-white/60 mb-4 font-medium mx-auto max-w-md hidden sm:block text-xs sm:text-sm"
          >
            Pesquise destinos para baixar vídeos prontos ou editar no Canva.
          </p>

          {/* Container do Input de Busca */}
          <div className="max-w-2xl mx-auto relative group">
            <div className="relative transform transition-all duration-300 group-hover:scale-[1.005]">
              <Search className="absolute left-4 sm:left-6 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400 z-10" aria-hidden="true" />
              <Input
                type="search"
                placeholder="Digite o destino (ex: Maragogi, Maldivas...)"
                value={searchValue}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full pl-12 sm:pl-14 pr-4 sm:pr-6 h-12 sm:h-14 md:h-16 rounded-xl bg-white/95 sm:bg-white shadow-xl border border-white/20 text-base md:text-lg text-slate-900 placeholder:text-slate-500 focus-visible:ring-4 focus-visible:ring-amber-400/40 transition-all duration-300"
                style={{
                  borderRadius: "12px",
                  boxShadow: "rgba(0, 0, 0, 0.25) 0px 10px 30px 0px",
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const HeroBanner = memo(HeroBannerComponent);

