import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Footer } from "@/components/Footer";
import { TutorialSection } from "@/components/TutorialSection";

const Tutorial = () => {
  return (
    <div className="min-h-screen bg-black text-white font-sans flex flex-col">
      {/* HEADER */}
      <header className="sticky top-0 z-50 bg-black/80 backdrop-blur-md border-b border-white/10 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/" className="text-zinc-400 hover:text-white transition-colors flex items-center gap-2">
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm font-semibold hidden sm:inline">Voltar ao Painel</span>
          </Link>
          <div className="h-6 w-[1px] bg-white/10 hidden sm:block"></div>
          <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            Academia Canva Viagem
          </h1>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="flex-1 container mx-auto px-4 py-8 max-w-7xl">
        <TutorialSection />
      </main>

      {/* FOOTER */}
      <Footer />
    </div>
  );
};

export default Tutorial;
