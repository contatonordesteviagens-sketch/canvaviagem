import { Check, Lock, Rocket } from "lucide-react";
import { Button } from "@/components/ui/button";

const COURSE_URL = "https://rochadigitalmidia.com.br/agente-lucrativo/";

export const LevelUpCard = () => {
  return (
    <div className="mb-6 p-6 rounded-3xl bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-900 border border-yellow-500/30 shadow-lg">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-2xl">🎮</span>
        <h3 className="text-lg font-bold text-white">Sua Jornada de Vendas</h3>
      </div>
      
      {/* Progress Steps */}
      <div className="flex items-center justify-between mb-6">
        {/* Step 1 - Completed */}
        <div className="flex flex-col items-center flex-1">
          <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center">
            <Check className="w-6 h-6 text-white" />
          </div>
          <span className="text-xs text-gray-400 mt-2">Ferramentas</span>
          <span className="text-[10px] text-green-500 font-medium">CONCLUÍDO</span>
        </div>
        
        {/* Connector */}
        <div className="h-1 flex-1 bg-gradient-to-r from-green-500 to-yellow-500 mx-2" />
        
        {/* Step 2 - Current/Locked */}
        <div className="flex flex-col items-center flex-1">
          <div className="w-12 h-12 rounded-full bg-yellow-500/20 border-2 border-yellow-500 flex items-center justify-center animate-pulse">
            <Lock className="w-6 h-6 text-yellow-500" />
          </div>
          <span className="text-xs text-yellow-500 mt-2 font-medium">Método</span>
          <span className="text-[10px] text-yellow-500">DESBLOQUEAR</span>
        </div>
        
        {/* Connector */}
        <div className="h-1 flex-1 bg-gray-700 mx-2" />
        
        {/* Step 3 - Future */}
        <div className="flex flex-col items-center flex-1">
          <div className="w-12 h-12 rounded-full bg-gray-800 flex items-center justify-center opacity-50">
            <Rocket className="w-6 h-6 text-gray-500" />
          </div>
          <span className="text-xs text-gray-500 mt-2">Escala 10x</span>
          <span className="text-[10px] text-gray-600">BLOQUEADO</span>
        </div>
      </div>
      
      <p className="text-gray-300 text-sm mb-4 text-center">
        Você já tem o Canva. Agora falta o <span className="text-yellow-500 font-bold">método validado</span> para vender viagens todos os dias.
      </p>
      
      <Button
        asChild
        className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black font-bold py-3 rounded-xl"
      >
        <a href={COURSE_URL} target="_blank" rel="noopener noreferrer">
          <Lock className="w-4 h-4 mr-2" />
          Desbloquear Nível 2
        </a>
      </Button>
    </div>
  );
};
