import { memo } from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useLanguage } from "@/contexts/LanguageContext";
import { useNavigate } from "react-router-dom";

interface HeroBannerProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  children?: React.ReactNode;
}

// Destinos mais buscados: um toque e a pesquisa acontece, sem digitar.
const SEARCH_SUGGESTIONS = ["Maragogi", "Maldivas", "Gramado", "Porto de Galinhas", "Cancún", "Orlando", "Jericoacoara"];

const HeroBannerComponent = ({ searchValue, onSearchChange, children }: HeroBannerProps) => {
  const { t } = useLanguage();
  const navigate = useNavigate();


  return (
    <div className="w-full flex flex-col">
      {/* 1. Busca Minimalista Acima */}
      <div className="w-full max-w-7xl mx-auto px-4 pt-4 mb-2">
        <div className="max-w-3xl mx-auto text-center mb-6 sm:mb-8">
          <h1 
            className="mb-2 sm:mb-3 tracking-tight font-extrabold leading-tight flex items-center justify-center gap-1.5 whitespace-nowrap flex-wrap sm:flex-nowrap bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 dark:from-blue-400 dark:via-indigo-400 dark:to-purple-500 bg-clip-text text-transparent drop-shadow-[0_2px_10px_rgba(99,102,241,0.2)]"
            style={{ 
              fontFamily: "'Inter', 'Canva Sans', sans-serif",
              fontSize: "clamp(22px, 4vw, 38px)",
              letterSpacing: "-0.02em"
            }}
          >
            <span>O que vamos divulgar hoje?</span>
          </h1>

          <p className="text-slate-600 dark:text-slate-300 mb-5 font-medium mx-auto max-w-md hidden sm:block text-xs sm:text-sm">
            Pesquise destinos para baixar vídeos prontos ou editar no Canva.
          </p>

          {/* Balão de Busca Suave e Minimalista */}
          <div className="max-w-2xl mx-auto relative group">
            <div className="relative transform transition-all duration-300 group-hover:scale-[1.003]">
              <Search className="absolute left-4 sm:left-6 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400 dark:text-slate-500 z-10" aria-hidden="true" />
              <Input
                type="search"
                placeholder="Digite o destino (ex: Maragogi, Maldivas...)"
                value={searchValue}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full pl-12 sm:pl-14 pr-4 sm:pr-6 h-12 sm:h-14 md:h-16 rounded-2xl sm:rounded-3xl bg-white/95 dark:bg-[#0F0F11]/80 shadow-sm md:shadow-md backdrop-blur-md border border-slate-200/80 dark:border-white/10 text-base md:text-lg text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus-visible:ring-2 focus-visible:ring-blue-500/30 transition-all duration-300"
                style={{
                  borderRadius: "20px"
                }}
              />
              {searchValue && (
                <button
                  type="button"
                  onClick={() => onSearchChange("")}
                  aria-label="Limpar busca"
                  className="absolute right-3 top-1/2 z-10 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-white/10"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">Mais buscados:</span>
              {SEARCH_SUGGESTIONS.map((term) => (
                <button
                  key={term}
                  type="button"
                  onClick={() => onSearchChange(term)}
                  className={`min-h-9 rounded-full border px-3.5 text-xs font-semibold transition-colors ${
                    searchValue.trim().toLowerCase() === term.toLowerCase()
                      ? "border-blue-500 bg-blue-600 text-white"
                      : "border-slate-200 bg-white text-slate-700 hover:border-blue-400 hover:text-blue-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-200"
                  }`}
                >
                  {term}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* O menu (children) agora tem seu próprio bloco isolado */}
      <div className="w-full max-w-7xl mx-auto px-4">
        {children}
      </div>

      {/* Um banner só: os outros quatro repetiam os círculos, o menu e os atalhos. */}
      {!searchValue.trim() && (
        <div className="w-full max-w-7xl mx-auto px-4 pb-6 md:pb-10">
          <div
            onClick={() => navigate('/fabrica')}
            role="link"
            tabIndex={0}
            onKeyDown={(e) => e.key === "Enter" && navigate('/fabrica')}
            className="w-full sm:max-w-[82%] md:max-w-[70%] mx-auto relative overflow-hidden rounded-2xl md:rounded-3xl border border-slate-200/60 dark:border-white/10 shadow-xl cursor-pointer transition-all duration-300 hover:scale-[1.008] hover:border-blue-500/40 group bg-slate-950/5 dark:bg-[#0F0F11]"
          >
            <img
              src="/capa-fabrica.webp"
              alt="Fábrica de Destinos: anúncios, carrosséis, site e CRM em um lugar"
              loading="lazy"
              className="w-full h-auto object-contain block mx-auto transition-transform duration-500 group-hover:scale-[1.01]"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export const HeroBanner = memo(HeroBannerComponent);


