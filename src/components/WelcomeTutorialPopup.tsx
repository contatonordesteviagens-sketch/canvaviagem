import React, { useState, useEffect } from "react";
import { X, PlayCircle, BookOpen } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

export const WelcomeTutorialPopup = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Verifica se o usuário já viu o popup nesta máquina (persistência no navegador)
    const hasSeen = localStorage.getItem("canvaviagem_has_seen_tutorial");
    if (!hasSeen) {
      // Pequeno delay para a animação ficar mais suave ao entrar no painel
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    localStorage.setItem("canvaviagem_has_seen_tutorial", "true");
  };

  const handleGoToTutorials = () => {
    handleClose();
    navigate("/tutorial");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div 
        className="bg-zinc-950 border border-white/10 rounded-2xl w-full max-w-md shadow-2xl relative overflow-hidden animate-in fade-in zoom-in duration-300"
      >
        {/* Glow Effects */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-24 bg-blue-500/20 blur-[50px] pointer-events-none"></div>

        {/* Header */}
        <div className="p-6 pb-2 relative z-10">
          <button 
            onClick={handleClose}
            className="absolute top-4 right-4 text-zinc-400 hover:text-white transition-colors bg-white/5 hover:bg-white/10 p-1.5 rounded-full"
            title="Fechar"
          >
            <X className="w-4 h-4" />
          </button>
          
          <div className="w-12 h-12 bg-gradient-to-tr from-blue-500 to-purple-500 rounded-full flex items-center justify-center mb-4 shadow-lg shadow-purple-500/20">
            <BookOpen className="w-6 h-6 text-white" />
          </div>
          
          <h2 className="text-2xl font-black text-white tracking-tight">
            Bem-vindo à Fábrica! 🚀
          </h2>
        </div>

        {/* Content */}
        <div className="p-6 pt-2 text-zinc-300 relative z-10">
          <p className="text-sm leading-relaxed mb-6">
            Para garantir que você tenha os melhores resultados, preparamos uma 
            <strong className="text-white"> Academia de Tutoriais</strong> com o passo a passo completo da plataforma.
          </p>
          
          <div className="flex flex-col gap-3">
            <Button 
              onClick={handleGoToTutorials}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold h-12 rounded-xl text-base shadow-lg shadow-blue-500/25 flex items-center gap-2"
            >
              <PlayCircle className="w-5 h-5" />
              Acessar Tutoriais Agora
            </Button>
            
            <button 
              onClick={handleClose}
              className="w-full text-zinc-500 hover:text-zinc-300 text-xs font-semibold py-3 transition-colors uppercase tracking-wider"
            >
              Não mostrar mais este aviso
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
