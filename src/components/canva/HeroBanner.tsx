import { memo } from "react";
import { Search, Sparkles, ArrowRight, Wand2, FileText, Users } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useLanguage } from "@/contexts/LanguageContext";
import { useNavigate } from "react-router-dom";

interface HeroBannerProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  children?: React.ReactNode;
}

const HeroBannerComponent = ({ searchValue, onSearchChange, children }: HeroBannerProps) => {
  const { t } = useLanguage();
  const navigate = useNavigate();

  const fabricaCapasGrid = [
    {
      id: "anuncio",
      title: "Anúncios Prontos & IA (F1)",
      subtitle: "Gere copys e anúncios validados em segundos",
      src: "/capa-2.webp",
      route: "/fabrica/anuncio",
      badge: "Anúncio (F1)",
      icon: Sparkles,
      badgeColor: "border-amber-500/40 text-amber-400 group-hover:bg-amber-600 group-hover:text-white"
    },
    {
      id: "site",
      title: "Sites & Landings (F3)",
      subtitle: "Crie páginas completas de alta conversão",
      src: "/capa-3.webp",
      route: "/fabrica/site",
      badge: "Site (F3)",
      icon: FileText,
      badgeColor: "border-emerald-500/40 text-emerald-400 group-hover:bg-emerald-600 group-hover:text-white"
    },
    {
      id: "carrossel",
      title: "Carrosséis Prontos (F2)",
      subtitle: "Sequências persuasivas em segundos",
      src: "/capa-4.png",
      route: "/fabrica/carrossel",
      badge: "Carrossel (F2)",
      icon: Wand2,
      badgeColor: "border-pink-500/40 text-pink-400 group-hover:bg-pink-600 group-hover:text-white"
    },
    {
      id: "crm",
      title: "CRM & Funil de Vendas (F4)",
      subtitle: "Gerencie leads e feche mais viagens",
      src: "/capa-5.webp",
      route: "/fabrica/crm",
      badge: "CRM (F4)",
      icon: Users,
      badgeColor: "border-purple-500/40 text-purple-400 group-hover:bg-purple-600 group-hover:text-white"
    }
  ];

  return (
    <>
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
          </div>
        </div>
      </div>

      {/* O menu (children) agora tem seu próprio bloco isolado */}
      <div className="w-full max-w-7xl mx-auto px-4">
        {children}
      </div>

      {/* Banners isolados para não causarem layout shift no menu */}
      <div className="w-full max-w-7xl mx-auto px-4 pb-8 md:pb-12">
        {/* 2. Imagem Principal no Topo (~70% da tela, sozinha em 1 fileira) */}
      <div 
        onClick={() => navigate('/fabrica')}
        className="w-full max-w-full sm:max-w-[82%] md:max-w-[70%] mx-auto relative overflow-hidden rounded-2xl md:rounded-3xl border border-slate-200/60 dark:border-white/10 shadow-xl cursor-pointer transition-all duration-300 hover:scale-[1.008] hover:border-blue-500/40 hover:shadow-[0_0_35px_rgba(99,102,241,0.2)] group bg-slate-950/5 dark:bg-[#0F0F11]"
      >
        <img 
          src="/capa-fabrica.webp" 
          alt="Acesse a Fábrica de Destinos pra Vender Mais" 
          className="w-full h-auto object-contain block mx-auto transition-transform duration-500 group-hover:scale-[1.01]"
        />
      </div>

      {/* 3. Grid 2x2 das 4 Outras Capas da Fábrica (15% menor) */}
      <div className="w-full max-w-full sm:max-w-[76%] md:max-w-[70%] mx-auto grid grid-cols-2 sm:grid-cols-2 gap-3 sm:gap-6 mt-4 sm:mt-6">
        {fabricaCapasGrid.map((capa) => {
          return (
            <div 
              key={capa.id}
              onClick={() => navigate(capa.route)}
              className="w-full relative overflow-hidden rounded-2xl md:rounded-3xl border border-slate-200/60 dark:border-white/10 shadow-xl cursor-pointer transition-all duration-300 hover:scale-[1.015] hover:border-amber-500/40 hover:shadow-[0_0_35px_rgba(245,158,11,0.18)] group bg-slate-950/5 dark:bg-[#0F0F11]"
            >
              <img 
                src={capa.src} 
                alt={capa.title} 
                className="w-full h-auto object-contain block mx-auto transition-transform duration-500 group-hover:scale-[1.025]"
              />
            </div>
          );
        })}
      </div>
    </>
  );
};

export const HeroBanner = memo(HeroBannerComponent);


