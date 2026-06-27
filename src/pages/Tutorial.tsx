import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Footer } from "@/components/Footer";
import { TutorialSection } from "@/components/TutorialSection";
import logoImage from "@/assets/logo.png";

const Tutorial = () => {
  return (
    <div className="min-h-screen bg-[#050812] text-white font-sans flex flex-col">
      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#050812]/90 px-4 py-3 backdrop-blur-md sm:px-6">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3">
            <img src={logoImage} alt="Canva Viagem" className="h-10 w-10 rounded-xl object-contain" />
            <div className="min-w-0">
              <p className="truncate text-sm font-black text-white">Canva Viagem</p>
              <p className="hidden text-xs font-medium text-slate-400 sm:block">Academia de tutoriais</p>
            </div>
          </div>

          <Link
            to="/"
            className="inline-flex min-h-[40px] items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-sm font-bold text-slate-200 transition-colors hover:bg-white/[0.08] hover:text-white focus:outline-none focus:ring-2 focus:ring-cyan-200"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Voltar ao Painel</span>
          </Link>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-6 max-w-7xl sm:py-8">
        <TutorialSection />
      </main>

      <Footer />
    </div>
  );
};

export default Tutorial;
