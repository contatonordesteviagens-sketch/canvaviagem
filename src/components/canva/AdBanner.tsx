import { Button } from "@/components/ui/button";
import { Check, TrendingUp } from "lucide-react";

const COURSE_URL = "https://rochadigitalmidia.com.br/agente-lucrativo/";

export const AdBanner = () => {
  return (
    <div className="relative my-8 p-6 md:p-8 rounded-3xl bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-900 border border-yellow-500/20 overflow-hidden">
      {/* Elementos decorativos flutuantes */}
      <div className="absolute top-4 left-4 text-3xl opacity-20">💰</div>
      <div className="absolute bottom-4 right-4 text-3xl opacity-20">💰</div>
      <div className="absolute top-1/2 right-1/4 text-2xl opacity-10">📈</div>
      
      {/* Badge de urgência */}
      <div className="absolute top-0 right-0 bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-bl-xl">
        🔥 75% OFF
      </div>
      
      <div className="relative z-10 flex flex-col md:flex-row items-center gap-6">
        <div className="flex-1 text-center md:text-left">
          <h3 className="text-xl md:text-2xl font-bold text-white mb-2">
            Cansado de postar e <span className="text-yellow-500">não vender?</span>
          </h3>
          <p className="text-gray-400 text-sm mb-4">
            Descubra o método validado de grandes agências de viagens
          </p>
          
          <div className="flex flex-wrap justify-center md:justify-start gap-3 text-xs">
            <span className="flex items-center gap-1 text-green-400">
              <Check className="w-3 h-3" /> Anúncios escalados
            </span>
            <span className="flex items-center gap-1 text-green-400">
              <Check className="w-3 h-3" /> Scripts prontos
            </span>
            <span className="flex items-center gap-1 text-green-400">
              <Check className="w-3 h-3" /> IA no WhatsApp
            </span>
          </div>
        </div>
        
        <div className="flex flex-col items-center gap-2">
          <Button
            asChild
            className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black font-bold px-8 py-3 rounded-xl"
          >
            <a href={COURSE_URL} target="_blank" rel="noopener noreferrer">
              <TrendingUp className="w-4 h-4 mr-2" />
              Quero Vender Mais
            </a>
          </Button>
          <span className="text-gray-500 text-xs">12x R$10 | R$97 anual</span>
        </div>
      </div>
    </div>
  );
};
